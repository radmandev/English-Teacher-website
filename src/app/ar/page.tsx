import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { filterCourses, summaries } from "@/lib/courses";
import { CourseCard } from "@/components/CourseCard";
import { Faq, SITE_FAQ } from "@/components/Faq";
import { Icon, type IconName } from "@/components/Icon";
import { MathText } from "@/components/MathText";
import { SubjectExplorer, type ExplorerSubject } from "@/components/SubjectExplorer";
import { Avatar } from "@/components/Instructor";
import { db } from "@/lib/db";
import { formatPrice, schedule } from "@/lib/constants";

export const metadata: Metadata = {
  title: { absolute: "فَهْم | تعلّم الرياضيات والإنجليزية ببساطة" },
  alternates: { canonical: "/ar" },
};

const steps: [IconName, string, string][] = [
  ["target", "اختر مادتك ومستواك", "تصفّح الدورات حسب المادة والمرحلة الدراسية والمستوى، وابدأ من حيث تقف."],
  ["book", "تعلّم درسًا قصيرًا", "شرح عربي واضح مع أمثلة محلولة، ورموز رياضية مكتوبة كما تراها في كتابك."],
  ["check", "طبّق بالتمارين", "أسئلة تفاعلية تصحَّح فورًا، مع تلميحات وحلول خطوة بخطوة عند الحاجة."],
  ["chart", "تابع تقدّمك", "تُحفظ دروسك المكتملة ونتائجك، وتعود إلى آخر درس بضغطة واحدة."],
];

const stepColors = [
  ["border-t-violet", "bg-violet-soft", "text-violet"],
  ["border-t-orange", "bg-sun-soft", "text-orange"],
  ["border-t-mint", "bg-mint-soft", "text-mint"],
  ["border-t-coral", "bg-coral-soft", "text-coral"],
];

export default async function Home() {
  const user = await getUser();
  const all = await summaries(user?.id);
  const featured = filterCourses(all, { sort: "popular" });
  const teachers = await db.user.findMany({
    where: { taughtCourses: { some: { status: "PUBLISHED" } } },
    select: { id: true, name: true, avatarUrl: true, headline: true, _count: { select: { taughtCourses: { where: { status: "PUBLISHED" } } } } },
  });
  const topics: Record<string, string[]> = {
    math: ["المرحلة الابتدائية", "المرحلة المتوسطة", "المرحلة الثانوية", "تعلّم الأساسيات"],
    english: ["المفردات والعبارات اليومية", "القواعد الأساسية", "الاستماع والنطق", "المحادثة والتحضير لـ IELTS و TOEFL"],
  };
  const explorer: ExplorerSubject[] = (await db.subject.findMany({ orderBy: { order: "asc" } })).map((sub) => ({
    slug: sub.slug, name: sub.nameAr, blurb: sub.blurbAr, topics: topics[sub.slug] ?? [],
    packages: all.filter((c) => c.subject.slug === sub.slug).sort((a, b) => b.price - a.price).map((c) => {
      const sc = schedule(c);
      return {
        slug: c.slug, title: c.title, subtitle: c.subtitle, description: c.description,
        price: formatPrice(c.salePrice ?? c.price, c.billing, c.durationMonths),
        schedule: sc ? [sc.days, sc.perDay, sc.total].filter((x): x is string => !!x) : c.billing === "HOURLY" ? ["بالساعة · مواعيد مرنة"] : [],
      };
    }),
  }));
  const pick = [featured.find((c) => c.subject.slug === "math"), featured.find((c) => c.subject.slug === "english"), featured.filter((c) => c.subject.slug === "math")[1]].filter((c) => !!c);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-soft via-white to-sun-soft">
        <div className="floaty pointer-events-none absolute -end-32 -top-32 size-[28rem] rounded-full bg-violet/15 blur-2xl" aria-hidden="true" />
        <div className="floaty pointer-events-none absolute -bottom-40 -start-24 size-96 rounded-full bg-orange/15 blur-2xl [animation-delay:-3s]" aria-hidden="true" />
        <div className="container-x relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="chip mb-5 bg-white px-3 py-1 text-sm text-violet shadow-sm">✨ افهمها ببساطة.</p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl md:leading-[1.15]">الفهم هو بداية <span className="text-gradient relative whitespace-nowrap">التفوق<svg viewBox="0 0 200 12" className="absolute -bottom-2 start-0 w-full" aria-hidden="true"><path d="M2 9C50 3 150 3 198 8" stroke="#C9A04A" strokeWidth="5" fill="none" strokeLinecap="round" /></svg></span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">تعلّم الرياضيات والإنجليزية بأسلوب واضح وتفاعلي. اختر مستواك، وابدأ رحلتك نحو فهم أفضل.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ar/courses" className="btn-primary px-7 py-3.5 text-base">استكشف الدورات</Link>
              <Link href="/ar/how-it-works" className="btn-ghost px-7 py-3.5 text-base">كيف يعمل فَهْم؟</Link>
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* Subjects */}
      <section className="container-x py-20" aria-labelledby="subjects-h">
        <h2 id="subjects-h" className="text-center text-3xl font-bold">مادتان، وطريقة واحدة <span className="text-gradient">للفهم</span></h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted">اختر المادة، ثم اضغط على أي باقة لترى تفاصيلها وجدولها وسعرها.</p>
        <SubjectExplorer subjects={explorer} />
      </section>

      {/* Teachers */}
      {teachers.length > 0 && (
        <section className="container-x pb-20" aria-labelledby="teachers-h">
          <h2 id="teachers-h" className="text-center text-3xl font-bold">الكادر <span className="text-gradient">التعليمي</span></h2>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {teachers.map((t) => (
              <article key={t.id} className="card card-hover relative w-full max-w-md overflow-hidden p-0">
                <div className="h-24 bg-gradient-to-l from-navy-deep to-navy" aria-hidden="true" />
                <div className="-mt-16 flex flex-col items-center px-6 pb-8 text-center">
                  <Avatar i={t} className="size-32 border-4 border-white" />
                  <h3 className="mt-4 text-2xl font-bold">{t.name}</h3>
                  {t.headline && <p className="mt-1 font-semibold text-coral">{t.headline}</p>}
                  <p className="mt-3 text-sm text-muted">{t._count.taughtCourses} باقات في الرياضيات واللغة الإنجليزية</p>
                  <Link href="/ar/courses" className="btn-navy mt-5">تصفّح الباقات</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {pick.length > 0 && (
        <section className="bg-gradient-to-b from-white to-mint-soft/60 py-20" aria-labelledby="featured-h">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="featured-h" className="text-3xl font-bold">الدورات <span className="text-gradient">المميزة</span></h2>
                <p className="mt-2 text-muted">ابدأ بإحدى هذه الدورات، أو تصفّح جميع الدورات.</p>
              </div>
              <Link href="/ar/courses" className="btn-ghost">جميع الدورات <Icon name="next" className="size-4" /></Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pick.map((c) => <CourseCard key={c.id} c={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* How */}
      <section className="container-x py-20" aria-labelledby="how-h">
        <h2 id="how-h" className="text-center text-3xl font-bold">كيف تتعلم مع <span className="text-gradient">فَهْم</span>؟</h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([icon, title, text], i) => (
            <li key={title} className={`card card-hover relative border-t-4 p-6 ${stepColors[i][0]}`}>
              <span className={`absolute end-5 top-5 text-4xl font-bold opacity-20 ${stepColors[i][2]}`} aria-hidden="true">{i + 1}</span>
              <span className={`grid size-12 place-items-center rounded-2xl ${stepColors[i][1]} ${stepColors[i][2]}`}><Icon name={icon} className="size-6" /></span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="container-x max-w-3xl py-20" aria-labelledby="faq-h">
        <h2 id="faq-h" className="mb-8 text-center text-3xl font-bold">الأسئلة الشائعة</h2>
        <Faq items={SITE_FAQ.slice(0, 5)} />
      </section>

      {/* CTA */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-navy-deep to-navy px-6 py-14 ring-1 ring-sun/30 text-center md:py-20">
          <div className="floaty pointer-events-none absolute -start-16 -top-16 size-64 rounded-full bg-sun/20 blur-3xl" aria-hidden="true" />
          <div className="floaty pointer-events-none absolute -bottom-20 -end-10 size-72 rounded-full bg-violet/40 blur-3xl [animation-delay:-3s]" aria-hidden="true" />
          <h2 className="relative text-3xl font-bold text-white md:text-4xl">الدرس الصعب يصبح أسهل عندما تفهمه</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/80">اختر باقتك وابدأ اليوم.</p>
          <Link href="/ar/courses" className="btn-primary relative mt-8 px-8 py-3.5 text-base">تصفّح الباقات</Link>
        </div>
      </section>
    </>
  );
}

function HeroArt() {
  return (
    <div className="relative mx-auto h-[22rem] w-full max-w-md select-none sm:h-[26rem]" aria-hidden="true">
      {["π", "√", "A", "+", "b", "%"].map((g, i) => (
        <span key={g} dir="ltr" className={`floaty absolute text-4xl font-bold ${["text-violet/40", "text-coral/40", "text-mint/40", "text-orange/50", "text-pink/40", "text-blue/40"][i]}`} style={{ animationDelay: `${-i}s`,  top: `${[4, 70, 12, 88, 45, 30][i]}%`, insetInlineStart: `${[8, 2, 88, 70, 95, 40][i]}%` }}>{g}</span>
      ))}
      <div className="card absolute inset-x-6 top-10 rotate-[-2deg] p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="chip bg-blue-soft text-navy">الرياضيات · الكسور</span>
          <span className="text-xs text-muted">الدرس 3 من 5</span>
        </div>
        <p className="text-center text-3xl text-navy"><MathText text="$\frac{3}{4} + \frac{1}{4} = 1$" /></p>
        <div className="mt-5 h-2 rounded-full bg-violet-soft"><div className="h-full w-3/5 rounded-full bg-gradient-to-l from-violet to-pink" /></div>
      </div>
      <div className="floaty absolute end-0 top-48 rounded-2xl rounded-ee-sm bg-gradient-to-l from-sun to-orange px-5 py-3 shadow-lg [--r:4deg] rotate-[4deg]">
        <p lang="en" dir="ltr" className="text-xl font-bold text-navy-deep">Hello! Nice to meet you.</p>
      </div>
      <div className="card absolute bottom-6 start-2 flex items-center gap-3 px-4 py-3">
        <span className="grid size-9 place-items-center rounded-full bg-mint text-white"><Icon name="check" className="size-5" /></span>
        <div>
          <p className="text-sm font-bold text-navy">إجابة صحيحة!</p>
          <p className="text-xs text-muted"><MathText text="$x = 6$" /></p>
        </div>
      </div>
    </div>
  );
}
