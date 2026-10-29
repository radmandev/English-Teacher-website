"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "./db";
import { endSession, getUser, hashPassword, newToken, requireRole, requireUser, safeNext, sha256, startSession, verifyPassword } from "./auth";
import { BILLING, COURSE_TYPES, DIFFICULTIES, LEVELS, ROLES, SITE_URL, STATUSES, parseJson } from "./constants";
import { score, type Answer, type Question } from "./grading";
import { lessonAccess } from "./courses";

export type FormState = { error?: string; ok?: string } | undefined;

const email = z.email("بريد إلكتروني غير صالح").transform((s) => s.toLowerCase().trim());
const password = z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل").max(200);
const name = z.string().trim().min(2, "الاسم قصير جدًا").max(80);
const first = (e: z.ZodError) => e.issues[0]?.message ?? "بيانات غير صالحة";

// ---------- Auth ----------

export async function register(_: FormState, fd: FormData): Promise<FormState> {
  const p = z.object({ name, email, password }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: first(p.error) };
  if (await db.user.findUnique({ where: { email: p.data.email } })) return { error: "هذا البريد مسجّل مسبقًا. جرّب تسجيل الدخول." };
  const user = await db.user.create({ data: { name: p.data.name, email: p.data.email, passwordHash: await hashPassword(p.data.password) } });
  await startSession(user.id);
  redirect(safeNext(fd.get("next")));
}

// ponytail: no login rate limiting; add per-IP/email throttling (e.g. a LoginAttempt table or edge limiter) before launch.
export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const p = z.object({ email, password: z.string().min(1) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "أدخل البريد الإلكتروني وكلمة المرور" };
  const user = await db.user.findUnique({ where: { email: p.data.email } });
  if (!user || !(await verifyPassword(p.data.password, user.passwordHash))) return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  await startSession(user.id);
  redirect(safeNext(fd.get("next")));
}

export async function logout() {
  await endSession();
  redirect("/ar");
}

export async function forgotPassword(_: FormState, fd: FormData): Promise<FormState> {
  const p = email.safeParse(fd.get("email"));
  if (!p.success) return { error: "بريد إلكتروني غير صالح" };
  const user = await db.user.findUnique({ where: { email: p.data } });
  if (user) {
    const token = newToken();
    await db.passwordResetToken.create({ data: { id: sha256(token), userId: user.id, expiresAt: new Date(Date.now() + 36e5) } });
    // ponytail: no email provider configured — the link is logged to the server console. Wire an email service here.
    console.log(`[password reset] ${SITE_URL}/ar/reset-password?token=${token}`);
  }
  return { ok: "إذا كان البريد مسجّلًا لدينا فسيصلك رابط لإعادة تعيين كلمة المرور خلال دقائق." };
}

export async function resetPassword(_: FormState, fd: FormData): Promise<FormState> {
  const p = z.object({ token: z.string().min(10), password }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: first(p.error) };
  const t = await db.passwordResetToken.findUnique({ where: { id: sha256(p.data.token) } });
  if (!t || t.expiresAt < new Date()) return { error: "الرابط غير صالح أو منتهي الصلاحية. اطلب رابطًا جديدًا." };
  await db.$transaction([
    db.user.update({ where: { id: t.userId }, data: { passwordHash: await hashPassword(p.data.password) } }),
    db.passwordResetToken.deleteMany({ where: { userId: t.userId } }),
    db.session.deleteMany({ where: { userId: t.userId } }),
  ]);
  return { ok: "تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن." };
}

export async function updateProfile(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser("/ar/account");
  const p = name.safeParse(fd.get("name"));
  if (!p.success) return { error: first(p.error) };
  await db.user.update({ where: { id: user.id }, data: { name: p.data } });
  revalidatePath("/ar", "layout");
  return { ok: "تم حفظ التغييرات" };
}

export async function changePassword(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser("/ar/account");
  const p = z.object({ current: z.string(), password }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: first(p.error) };
  const row = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(p.data.current, row.passwordHash))) return { error: "كلمة المرور الحالية غير صحيحة" };
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(p.data.password) } });
  return { ok: "تم تغيير كلمة المرور" };
}

// ---------- Learning ----------

export async function toggleFavorite(courseId: string, path: string) {
  const user = await getUser();
  if (!user) redirect(`/ar/login?next=${encodeURIComponent(safeNext(path))}`);
  const key = { userId_courseId: { userId: user.id, courseId } };
  if (await db.favorite.findUnique({ where: key })) await db.favorite.delete({ where: key });
  else await db.favorite.create({ data: { userId: user.id, courseId } });
  revalidatePath(safeNext(path));
}

async function firstLessonId(courseId: string) {
  const l = await db.lesson.findFirst({ where: { section: { courseId } }, orderBy: [{ section: { order: "asc" } }, { order: "asc" }] });
  return l?.id;
}

// Self-enrollment is for free courses only; paid courses are bought over WhatsApp and granted by an admin (grantAccess).
export async function enroll(courseId: string, slug: string) {
  const user = await requireUser(`/ar/courses/${slug}`);
  const course = await db.course.findFirst({ where: { id: courseId, status: "PUBLISHED" } });
  if (!course) redirect("/ar/courses");
  if (course.price > 0) redirect(`/ar/courses/${slug}`);
  const e = await db.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } }, update: {}, create: { userId: user.id, courseId },
  });
  const lessonId = e.lastLessonId ?? (await firstLessonId(courseId));
  redirect(lessonId ? `/ar/learn/${slug}/${lessonId}` : `/ar/courses/${slug}`);
}

export async function setLessonComplete(lessonId: string, done: boolean) {
  const { user, lesson, enrolled } = await lessonAccess(lessonId);
  if (!user || !lesson || !enrolled) return;
  const key = { userId_lessonId: { userId: user.id, lessonId } };
  if (done) await db.lessonProgress.upsert({ where: key, update: {}, create: { userId: user.id, lessonId } });
  else await db.lessonProgress.deleteMany({ where: { userId: user.id, lessonId } });
  revalidatePath(`/ar/learn/${lesson.section.course.slug}`, "layout");
}

export async function submitQuiz(lessonId: string, answers: Answer[]) {
  const { user, lesson, enrolled } = await lessonAccess(lessonId);
  if (!user || !lesson || !enrolled || !lesson.exercise) return null;
  const qs = parseJson<Question[]>(lesson.exercise, []);
  const result = { score: score(qs, answers.slice(0, qs.length)), total: qs.length };
  await db.quizAttempt.create({ data: { userId: user.id, lessonId, ...result } });
  return result;
}

export async function rateCourse(courseId: string, slug: string, rating: number) {
  const user = await requireUser(`/ar/courses/${slug}`);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
  if (!(await db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId } } }))) return;
  await db.review.upsert({
    where: { userId_courseId: { userId: user.id, courseId } }, update: { rating }, create: { userId: user.id, courseId, rating },
  });
  revalidatePath(`/ar/courses/${slug}`);
}

export async function sendContact(_: FormState, fd: FormData): Promise<FormState> {
  const p = z.object({ name, email, message: z.string().trim().min(10, "الرسالة قصيرة جدًا").max(3000) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: first(p.error) };
  await db.contactMessage.create({ data: p.data });
  return { ok: "شكرًا لك! وصلتنا رسالتك." };
}

// ---------- Admin ----------

const courseForm = z.object({
  title: z.string().trim().min(3).max(120),
  subtitle: z.string().trim().max(120),
  description: z.string().trim().min(10).max(2000),
  keywords: z.string().trim().max(500),
  level: z.enum(Object.keys(LEVELS) as [string, ...string[]]),
  difficulty: z.enum(Object.keys(DIFFICULTIES) as [string, ...string[]]),
  type: z.enum(Object.keys(COURSE_TYPES) as [string, ...string[]]),
  status: z.enum(Object.keys(STATUSES) as [string, ...string[]]),
  price: z.coerce.number().min(0).max(100000),
  salePrice: z.union([z.literal(""), z.coerce.number().min(0).max(100000)]),
  billing: z.enum(Object.keys(BILLING) as [string, ...string[]]),
  durationMonths: z.union([z.literal(""), z.coerce.number().int().min(1).max(24)]),
  daysPerWeek: z.union([z.literal(""), z.coerce.number().int().min(1).max(7)]),
  hoursPerDay: z.union([z.literal(""), z.coerce.number().min(0.25).max(12)]),
  instructorId: z.string(),
  thumbnailUrl: z.union([z.literal(""), z.url().refine((u) => u.startsWith("https://"), "يجب أن يبدأ الرابط بـ https://")]),
});

export async function saveCourse(id: string, _: FormState, fd: FormData): Promise<FormState> {
  await requireRole(["ADMIN"]);
  const p = courseForm.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: `${p.error.issues[0]?.path.join(".")}: ${p.error.issues[0]?.message}` };
  const d = p.data;
  const prev = await db.course.findUniqueOrThrow({ where: { id } });
  const instructor = d.instructorId ? await db.user.findFirst({ where: { id: d.instructorId, role: "INSTRUCTOR" } }) : null;
  await db.course.update({
    where: { id },
    data: {
      title: d.title, subtitle: d.subtitle, description: d.description, keywords: d.keywords,
      level: d.level, difficulty: d.difficulty, type: d.type, status: d.status,
      price: Math.round(d.price * 100), salePrice: d.salePrice === "" ? null : Math.round(d.salePrice * 100),
      billing: d.billing, durationMonths: d.durationMonths === "" ? null : d.durationMonths,
      daysPerWeek: d.daysPerWeek === "" ? null : d.daysPerWeek, hoursPerDay: d.hoursPerDay === "" ? null : d.hoursPerDay,
      instructorId: instructor?.id ?? null, thumbnailUrl: d.thumbnailUrl || null,
      publishedAt: d.status === "PUBLISHED" && !prev.publishedAt ? new Date() : prev.publishedAt,
    },
  });
  revalidatePath("/ar", "layout");
  return { ok: "تم حفظ الدورة" };
}

export async function setUserRole(userId: string, fd: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const role = fd.get("role");
  if (typeof role !== "string" || !(role in ROLES) || userId === admin.id) return; // admins can't demote themselves
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/ar/admin");
}

export async function grantAccess(_: FormState, fd: FormData): Promise<FormState> {
  await requireRole(["ADMIN"]);
  const parsed = email.safeParse(fd.get("email"));
  if (!parsed.success) return { error: first(parsed.error) };
  const [user, course] = await Promise.all([
    db.user.findUnique({ where: { email: parsed.data } }),
    db.course.findUnique({ where: { id: String(fd.get("courseId")) } }),
  ]);
  if (!user) return { error: "لا يوجد حساب بهذا البريد. اطلب من الطالب إنشاء حساب أولًا." };
  if (!course) return { error: "اختر دورة" };
  await db.enrollment.upsert({ where: { userId_courseId: { userId: user.id, courseId: course.id } }, update: {}, create: { userId: user.id, courseId: course.id } });
  revalidatePath("/ar", "layout");
  return { ok: `تم منح ${user.name} الوصول إلى «${course.title}»` };
}
