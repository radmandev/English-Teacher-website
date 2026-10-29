import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCourse, lessonAccess } from "@/lib/courses";
import { setLessonComplete } from "@/lib/actions";
import { parseJson } from "@/lib/constants";
import type { Question } from "@/lib/grading";
import { Exercise } from "@/components/Exercise";
import { Icon } from "@/components/Icon";
import { Paragraphs } from "@/components/MathText";
import { ProgressBar } from "@/components/bits";

type Props = { params: Promise<{ slug: string; lessonId: string }> };

export const metadata: Metadata = { title: "الدرس", robots: { index: false } };

export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params;
  const { user, lesson, enrolled, allowed } = await lessonAccess(lessonId);
  if (!lesson || lesson.section.course.slug !== slug) notFound();
  if (!allowed) redirect(user ? `/ar/courses/${slug}` : `/ar/login?next=${encodeURIComponent(`/ar/learn/${slug}/${lessonId}`)}`);

  if (enrolled && user) {
    await db.enrollment.update({ where: { userId_courseId: { userId: user.id, courseId: lesson.section.course.id } }, data: { lastLessonId: lessonId } });
  }
  const course = (await getCourse(slug, user?.id, true))!;
  const flat = course.sections.flatMap((s) => s.lessons);
  const idx = flat.findIndex((l) => l.id === lessonId);
  const [prev, next] = [flat[idx - 1], flat[idx + 1]];
  const done = flat[idx]?.done ?? false;
  const questions = parseJson<Question[]>(lesson.exercise, []);

  return (
    <div className="container-x grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
      <article className="min-w-0">
        <nav aria-label="مسار التنقل" className="mb-4 text-sm text-muted">
          <Link href={`/ar/courses/${slug}`} className="inline-flex items-center gap-1 hover:text-navy"><Icon name="prev" className="size-4" />{course.title}</Link>
        </nav>
        {!enrolled && (
          <p className="mb-4 rounded-xl bg-sun-soft px-4 py-3 text-sm">هذا درس معاينة مجاني. <Link href={`/ar/courses/${slug}`} className="font-semibold text-blue-ink underline">سجّل في الدورة</Link> لحفظ تقدّمك وفتح جميع الدروس.</p>
        )}
        <p className="text-sm font-semibold text-blue-ink">{lesson.section.title} · الدرس {idx + 1} من {flat.length}</p>
        <h1 className="mt-1 text-3xl font-bold">{lesson.title}</h1>
        {lesson.summary && <p className="mt-2 text-lg text-muted">{lesson.summary}</p>}

        {lesson.videoUrl && (
          <video controls preload="metadata" src={lesson.videoUrl} className="mt-6 aspect-video w-full rounded-2xl bg-ink">
            متصفحك لا يدعم تشغيل الفيديو.
          </video>
        )}

        <div className="card mt-6 p-6 md:p-8"><Paragraphs text={lesson.body} /></div>

        {questions.length > 0 && (
          <section className="mt-8" aria-labelledby="ex-h">
            <h2 id="ex-h" className="mb-4 text-2xl font-bold">التمرين</h2>
            <Exercise questions={questions} lessonId={lesson.id} canSave={enrolled} />
          </section>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          {prev ? <Link href={`/ar/learn/${slug}/${prev.id}`} className="btn-ghost"><Icon name="prev" className="size-4" />السابق</Link> : <span />}
          {enrolled && (
            <form action={setLessonComplete.bind(null, lesson.id, !done)}>
              <button className={done ? "btn-ghost text-good" : "btn-navy"}>
                <Icon name="check" className="size-4" />{done ? "مكتمل · إلغاء" : "تحديد كمكتمل"}
              </button>
            </form>
          )}
          {next ? <Link href={`/ar/learn/${slug}/${next.id}`} className="btn-primary">التالي<Icon name="next" className="size-4" /></Link> : (
            <Link href={enrolled ? "/ar/dashboard" : `/ar/courses/${slug}`} className="btn-primary">{enrolled ? "إلى لوحتي" : "صفحة الدورة"}</Link>
          )}
        </div>
      </article>

      <aside className="lg:sticky lg:top-24 lg:h-fit" aria-label="محتوى الدورة">
        <details open className="card overflow-hidden [&_summary::-webkit-details-marker]:hidden">
          <summary className="cursor-pointer list-none border-b border-line p-5">
            <span className="block font-bold text-navy">محتوى الدورة</span>
            {enrolled && <ProgressBar value={course.progress ?? 0} className="mt-3" />}
          </summary>
          <div className="max-h-[60vh] overflow-y-auto">
            {course.sections.map((s) => (
              <div key={s.id}>
                <p className="bg-paper px-5 py-2 text-xs font-bold text-muted">{s.title}</p>
                <ul>
                  {s.lessons.map((l) => {
                    const current = l.id === lessonId;
                    const locked = !enrolled && !l.isPreview;
                    return (
                      <li key={l.id}>
                        <Link href={locked ? `/ar/courses/${slug}` : `/ar/learn/${slug}/${l.id}`} aria-current={current ? "page" : undefined}
                          className={`flex items-center gap-3 px-5 py-3 text-sm ${current ? "bg-blue-soft font-semibold text-navy" : "hover:bg-paper"}`}>
                          <span className={`grid size-6 shrink-0 place-items-center rounded-full ${l.done ? "bg-good text-white" : "border-2 border-line text-muted"}`}>
                            {l.done ? <Icon name="check" className="size-3.5" /> : locked ? <Icon name="lock" className="size-3" /> : null}
                          </span>
                          <span className="flex-1">{l.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </aside>
    </div>
  );
}
