import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { summaries } from "@/lib/courses";
import { CourseCard } from "@/components/CourseCard";
import { Icon, type IconName } from "@/components/Icon";
import { ProgressBar } from "@/components/bits";

export const metadata: Metadata = { title: "لوحة الطالب", robots: { index: false } };

const fmt = new Intl.DateTimeFormat("ar-SA-u-nu-latn-ca-gregory", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function Dashboard() {
  const user = await requireUser("/ar/dashboard");
  const [enrollments, favorites, progress, attempts, completedCount] = await Promise.all([
    db.enrollment.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }),
    db.favorite.findMany({ where: { userId: user.id }, select: { courseId: true } }),
    db.lessonProgress.findMany({ where: { userId: user.id }, orderBy: { completedAt: "desc" }, take: 6, include: { lesson: { select: { title: true, section: { select: { course: { select: { title: true, slug: true } } } } } } } }),
    db.quizAttempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 8, include: { lesson: { select: { id: true, title: true, section: { select: { course: { select: { title: true, slug: true } } } } } } } }),
    db.lessonProgress.count({ where: { userId: user.id } }),
  ]);
  const ids = [...new Set([...enrollments.map((e) => e.courseId), ...favorites.map((f) => f.courseId)])];
  const courses = new Map((await summaries(user.id, { id: { in: ids } })).map((c) => [c.id, c]));
  const mine = enrollments.map((e) => ({ e, c: courses.get(e.courseId) })).filter((x) => x.c);
  const saved = favorites.map((f) => courses.get(f.courseId)).filter((c) => !!c);
  const current = mine[0];

  const activity = [
    ...progress.map((p) => ({ at: p.completedAt, icon: "check" as IconName, text: `أكملت درس «${p.lesson.title}»`, course: p.lesson.section.course })),
    ...attempts.map((a) => ({ at: a.createdAt, icon: "target" as IconName, text: `حصلت على ${a.score} من ${a.total} في «${a.lesson.title}»`, course: a.lesson.section.course })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 6);

  const stats: [IconName, string, number][] = [
    ["book", "دوراتي", mine.length], ["check", "دروس مكتملة", completedCount], ["target", "محاولات التمارين", attempts.length],
  ];

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">أهلًا، {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-muted">خطوة صغيرة كل يوم تصنع فرقًا كبيرًا.</p>
        </div>
        <Link href="/ar/account" className="btn-ghost"><Icon name="user" className="size-4" />إعدادات الحساب</Link>
      </div>

      <ul className="mt-8 grid grid-cols-3 gap-3 md:gap-5">
        {stats.map(([icon, label, n]) => (
          <li key={label} className="card flex flex-col gap-2 p-4 md:flex-row md:items-center md:gap-4 md:p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-blue-soft text-blue-ink"><Icon name={icon} /></span>
            <span><span className="block text-2xl font-bold text-navy">{n}</span><span className="text-xs text-muted md:text-sm">{label}</span></span>
          </li>
        ))}
      </ul>

      {current?.c ? (
        <section className="mt-8 overflow-hidden rounded-[var(--radius-card)] bg-navy p-6 text-white md:p-8" aria-labelledby="cont-h">
          <p className="text-sm text-sun">تابع من حيث توقفت</p>
          <h2 id="cont-h" className="mt-1 text-2xl font-bold text-white">{current.c.title}</h2>
          <div className="mt-4 max-w-md [&_*]:!text-white/90"><ProgressBar value={current.c.progress ?? 0} /></div>
          <Link href={current.e.lastLessonId ? `/ar/learn/${current.c.slug}/${current.e.lastLessonId}` : `/ar/courses/${current.c.slug}`} className="btn-primary mt-6">متابعة التعلم <Icon name="next" className="size-4" /></Link>
        </section>
      ) : (
        <section className="card mt-8 p-8 text-center">
          <h2 className="text-xl font-bold">لم تسجّل في أي دورة بعد</h2>
          <p className="mt-2 text-muted">اختر دورتك الأولى وابدأ رحلتك.</p>
          <Link href="/ar/courses" className="btn-primary mt-5">استكشف الدورات</Link>
        </section>
      )}

      {mine.length > 0 && (
        <section className="mt-12" aria-labelledby="my-h">
          <h2 id="my-h" className="mb-5 text-2xl font-bold">دوراتي</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{mine.map(({ c }) => <CourseCard key={c!.id} c={c!} />)}</div>
        </section>
      )}

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <section className="card p-6" aria-labelledby="act-h">
          <h2 id="act-h" className="mb-4 text-xl font-bold">النشاط الأخير</h2>
          {activity.length ? (
            <ul className="grid gap-3">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper text-blue-ink"><Icon name={a.icon} className="size-4" /></span>
                  <span className="flex-1">{a.text}<Link href={`/ar/courses/${a.course.slug}`} className="block text-xs text-muted hover:text-navy">{a.course.title} · {fmt.format(a.at)}</Link></span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">سيظهر نشاطك هنا بعد إكمال أول درس.</p>}
        </section>
        <section className="card p-6" aria-labelledby="quiz-h">
          <h2 id="quiz-h" className="mb-4 text-xl font-bold">نتائج التمارين</h2>
          {attempts.length ? (
            <table className="w-full text-sm">
              <thead><tr className="text-start text-xs text-muted"><th className="pb-2 text-start font-medium">التمرين</th><th className="pb-2 text-start font-medium">النتيجة</th><th className="pb-2 text-start font-medium">التاريخ</th></tr></thead>
              <tbody className="divide-y divide-line">
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2.5"><Link href={`/ar/learn/${a.lesson.section.course.slug}/${a.lesson.id}`} className="hover:text-blue-ink">{a.lesson.title}</Link></td>
                    <td className={`py-2.5 font-bold ${a.score === a.total ? "text-good" : "text-navy"}`}>{a.score} من {a.total}</td>
                    <td className="py-2.5 text-xs text-muted">{fmt.format(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-muted">لم تحفظ نتائج تمارين بعد.</p>}
        </section>
      </div>

      <section className="mt-12" aria-labelledby="saved-h">
        <h2 id="saved-h" className="mb-5 text-2xl font-bold">الدورات المحفوظة</h2>
        {saved.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{saved.map((c) => <CourseCard key={c.id} c={c} />)}</div>
        ) : <p className="text-muted">اضغط على رمز القلب في أي دورة لحفظها هنا.</p>}
      </section>
    </div>
  );
}
