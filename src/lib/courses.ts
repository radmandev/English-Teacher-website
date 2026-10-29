import "server-only";
import { db } from "./db";
import { getUser } from "./auth";
import { BILLING, COURSE_TYPES, DIFFICULTIES, LEVELS, SORTS, parseJson } from "./constants";

const summaryInclude = {
  subject: true,
  instructor: { select: { name: true, avatarUrl: true, headline: true } },
  sections: { select: { lessons: { select: { id: true, minutes: true } } } },
  reviews: { select: { rating: true } },
  _count: { select: { enrollments: true } },
} as const;

type Row = Awaited<ReturnType<typeof fetchRows>>[number];
const fetchRows = (where: object = { status: "PUBLISHED" }) =>
  db.course.findMany({ where, include: summaryInclude });

export type CourseSummary = ReturnType<typeof toSummary>;

function toSummary(c: Row, completed: Set<string>, enrolled: Set<string>, favs: Set<string>) {
  const lessonIds = c.sections.flatMap((s) => s.lessons.map((l) => l.id));
  const done = lessonIds.filter((id) => completed.has(id)).length;
  const ratings = c.reviews.map((r) => r.rating);
  return {
    id: c.id, slug: c.slug, title: c.title, subtitle: c.subtitle, description: c.description, keywords: c.keywords,
    subject: { slug: c.subject.slug, name: c.subject.nameAr }, level: c.level, difficulty: c.difficulty, type: c.type,
    price: c.price, salePrice: c.salePrice, billing: c.billing, durationMonths: c.durationMonths, daysPerWeek: c.daysPerWeek, hoursPerDay: c.hoursPerDay, coverGlyph: c.coverGlyph, thumbnailUrl: c.thumbnailUrl, isDemo: c.isDemo,
    instructor: c.instructor ?? null, publishedAt: c.publishedAt,
    lessonCount: lessonIds.length,
    minutes: c.sections.flatMap((s) => s.lessons).reduce((n, l) => n + l.minutes, 0),
    reviewCount: ratings.length,
    rating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    enrollCount: c._count.enrollments,
    progress: enrolled.has(c.id) ? (lessonIds.length ? Math.round((done / lessonIds.length) * 100) : 0) : null,
    isFavorite: favs.has(c.id),
  };
}

async function userSets(userId?: string) {
  if (!userId) return [new Set<string>(), new Set<string>(), new Set<string>()] as const;
  const [p, e, f] = await Promise.all([
    db.lessonProgress.findMany({ where: { userId }, select: { lessonId: true } }),
    db.enrollment.findMany({ where: { userId }, select: { courseId: true } }),
    db.favorite.findMany({ where: { userId }, select: { courseId: true } }),
  ]);
  return [new Set(p.map((x) => x.lessonId)), new Set(e.map((x) => x.courseId)), new Set(f.map((x) => x.courseId))] as const;
}

export async function summaries(userId?: string, where?: object) {
  const [rows, sets] = await Promise.all([fetchRows(where), userSets(userId)]);
  return rows.map((r) => toSummary(r, ...sets));
}

export type Filters = { q?: string; subject?: string; level?: string; difficulty?: string; type?: string; billing?: string; sort?: string };

const pick = <T extends object>(v: unknown, allowed: T) => (typeof v === "string" && v in allowed ? (v as keyof T & string) : undefined);

/** Whitelists raw search params so the UI never echoes arbitrary values. */
export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  return {
    q: s("q")?.trim().slice(0, 100) || undefined,
    subject: s("subject")?.match(/^[a-z-]{1,40}$/) ? s("subject") : undefined,
    level: pick(s("level"), LEVELS), difficulty: pick(s("difficulty"), DIFFICULTIES),
    type: pick(s("type"), COURSE_TYPES), billing: pick(s("billing"), BILLING), sort: pick(s("sort"), SORTS),
  };
}

const norm = (s: string) => s.toLowerCase().replace(/[ً-ْ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");

// ponytail: filters in memory over all published courses; move to SQL where-clauses + pagination past ~1k courses.
export function filterCourses(list: CourseSummary[], f: Filters) {
  const terms = f.q ? norm(f.q).split(/\s+/).filter(Boolean) : [];
  const out = list.filter((c) => {
    if (f.subject && c.subject.slug !== f.subject) return false;
    if (f.level && c.level !== f.level && c.level !== "ALL") return false;
    if (f.difficulty && c.difficulty !== f.difficulty) return false;
    if (f.type && c.type !== f.type) return false;
    if (f.billing && c.billing !== f.billing) return false;
    if (terms.length) {
      const hay = norm([c.title, c.subtitle, c.description, c.keywords, c.subject.name, c.subject.slug].join(" "));
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
  const effective = (c: CourseSummary) => c.salePrice ?? c.price;
  const time = (c: CourseSummary) => c.publishedAt?.getTime() ?? 0;
  const by: Record<string, (a: CourseSummary, b: CourseSummary) => number> = {
    popular: (a, b) => b.enrollCount - a.enrollCount || time(b) - time(a),
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCount - a.reviewCount,
    newest: (a, b) => time(b) - time(a),
    price: (a, b) => effective(a) - effective(b),
  };
  return out.sort(by[f.sort ?? "popular"]);
}

export async function getCourse(slug: string, userId?: string, allowUnpublished = false) {
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      ...summaryInclude,
      instructor: { select: { name: true, avatarUrl: true, headline: true } },
      sections: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" }, select: {
        id: true, title: true, summary: true, minutes: true, isPreview: true, exercise: true, videoUrl: true,
      } } } },
    },
  });
  if (!course || (!allowUnpublished && course.status !== "PUBLISHED")) return null;
  const [completed, enrolledSet, favs] = await userSets(userId);
  const enrollment = userId ? await db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } }) : null;
  const myReview = userId ? await db.review.findUnique({ where: { userId_courseId: { userId, courseId: course.id } } }) : null;
  return {
    ...toSummary(course as unknown as Row, completed, enrolledSet, favs),
    status: course.status,
    objectives: parseJson<string[]>(course.objectives, []),
    prerequisites: parseJson<string[]>(course.prerequisites, []),
    faqs: parseJson<{ q: string; a: string }[]>(course.faqs, []),
    sections: course.sections.map((s) => ({
      id: s.id, title: s.title,
      lessons: s.lessons.map(({ exercise, ...l }) => ({
        ...l, questionCount: parseJson<unknown[]>(exercise, []).length, done: completed.has(l.id),
      })),
    })),
    enrollment, myRating: myReview?.rating ?? null,
  };
}
export type CourseDetail = NonNullable<Awaited<ReturnType<typeof getCourse>>>;

/** Lesson + whether the user may open it (enrolled, preview, or staff). */
export async function lessonAccess(lessonId: string) {
  const user = await getUser();
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, include: { section: { include: { course: true } } } });
  if (!lesson) return { user, lesson: null, enrolled: false, allowed: false };
  const course = lesson.section.course;
  const staff = user?.role === "ADMIN" || (user?.role === "INSTRUCTOR" && course.instructorId === user.id);
  const enrolled = !!user && !!(await db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } }));
  const allowed = staff || (course.status === "PUBLISHED" && (enrolled || lesson.isPreview));
  return { user, lesson, enrolled, allowed };
}

