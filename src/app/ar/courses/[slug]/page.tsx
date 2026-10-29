import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getCourse, summaries } from "@/lib/courses";
import { enroll, rateCourse, toggleFavorite } from "@/lib/actions";
import { COURSE_TYPES, DIFFICULTIES, LEVELS, SITE_URL, formatPrice, schedule } from "@/lib/constants";
import { CourseCard } from "@/components/CourseCard";
import { CourseCover } from "@/components/CourseCover";
import { Avatar } from "@/components/Instructor";
import { Faq } from "@/components/Faq";
import { Icon } from "@/components/Icon";
import { BuyButton } from "@/components/BuyButton";
import { DemoBadge, Price, ProgressBar, Rating, SubjectBadge } from "@/components/bits";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCourse((await params).slug);
  if (!c) return { title: "الدورة غير موجودة" };
  return {
    title: c.title, description: c.description,
    alternates: { canonical: `/ar/courses/${c.slug}` },
    openGraph: { title: c.title, description: c.description, type: "website", url: `/ar/courses/${c.slug}` },
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const user = await getUser();
  const c = await getCourse(slug, user?.id);
  if (!c) notFound();

  const firstLesson = c.sections[0]?.lessons[0];
  const resumeId = c.enrollment?.lastLessonId ?? firstLesson?.id;
  const path = `/ar/courses/${c.slug}`;
  const related = (await summaries(user?.id)).filter((x) => x.subject.slug === c.subject.slug && x.id !== c.id).slice(0, 3);

  const faqs = [
    ...c.faqs,
    { q: "هل أحتاج إلى معرفة سابقة؟", a: c.prerequisites.length ? `يُفضّل أن تكون ملمًّا بما يلي: ${c.prerequisites.join("، ")}.` : "لا، الدورة تبدأ معك من الأساس." },
    { q: "كيف أشترك في الباقة؟", a: "اضغط زر الشراء أو الحجز واملأ بياناتك، فيُرسل طلبك عبر واتساب. نتواصل معك لتأكيد الدفع والمواعيد، ثم تُفعَّل الباقة في حسابك." },
  ];

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Course", name: c.title, description: c.description, inLanguage: "ar",
    url: `${SITE_URL}${path}`, provider: { "@type": "Organization", name: "فَهْم", url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="border-b border-line bg-white">
        <div className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_380px] lg:py-14">
          <div>
            <nav aria-label="مسار التنقل" className="mb-5 text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li><Link href="/ar/courses" className="hover:text-navy">الدورات</Link></li>
                <li aria-hidden="true"><Icon name="next" className="size-3.5" /></li>
                <li><Link href={`/ar/courses?subject=${c.subject.slug}`} className="hover:text-navy">{c.subject.name}</Link></li>
              </ol>
            </nav>
            <div className="flex flex-wrap gap-2">
              <SubjectBadge slug={c.subject.slug} name={c.subject.name} />
              <span className="chip bg-paper text-navy">{LEVELS[c.level as keyof typeof LEVELS]}</span>
              <span className="chip bg-paper text-navy">{DIFFICULTIES[c.difficulty as keyof typeof DIFFICULTIES]}</span>
              <span className="chip bg-paper text-navy">{COURSE_TYPES[c.type as keyof typeof COURSE_TYPES]}</span>
              {c.isDemo && <DemoBadge />}
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">{c.title}</h1>
            <p className="mt-2 text-lg font-medium text-blue-ink">{c.subtitle}</p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{c.description}</p>
            <PackageSchedule c={c} />
            {c.instructor && (
              <div className="mt-6 flex w-fit items-center gap-4 rounded-2xl border border-line bg-white py-3 pe-6 ps-3 shadow-[var(--shadow-card)]">
                <Avatar i={c.instructor} className="size-16" />
                <div>
                  <p className="text-xs text-muted">التدريس</p>
                  <p className="text-lg font-bold text-navy">{c.instructor.name}</p>
                  {c.instructor.headline && <p className="text-sm text-coral">{c.instructor.headline}</p>}
                </div>
              </div>
            )}
            {c.reviewCount > 0 && <Rating value={c.rating!} count={c.reviewCount} className="mt-4" />}
          </div>

          <aside className="card h-fit overflow-hidden lg:sticky lg:top-24" aria-label="التسجيل في الدورة">
            <CourseCover subject={c.subject.slug} glyph={c.coverGlyph} thumbnailUrl={c.thumbnailUrl} title={c.title} />
            <div className="grid gap-4 p-6">
              <div className="text-2xl"><Price price={c.price} salePrice={c.salePrice} billing={c.billing} months={c.durationMonths} /></div>
              {c.enrollment ? (
                <>
                  <ProgressBar value={c.progress ?? 0} />
                  <Link href={`/ar/learn/${c.slug}/${resumeId}`} className="btn-primary py-3 text-base">{c.enrollment.lastLessonId ? "متابعة التعلم" : "ابدأ التعلم"}</Link>
                </>
              ) : c.price > 0 ? (
                <BuyButton title={c.title} price={formatPrice(c.salePrice ?? c.price, c.billing, c.durationMonths)} className="btn-primary py-3 text-base"><Icon name="cart" />{c.billing === "HOURLY" ? "احجز حصتك الآن" : c.billing === "MONTHLY" ? "اشترك الآن" : "اشترِ الباقة الآن"}</BuyButton>
              ) : user ? (
                <form action={enroll.bind(null, c.id, c.slug)}>
                  <button className="btn-primary w-full py-3 text-base">سجّل مجانًا وابدأ</button>
                </form>
              ) : (
                <Link href={`/ar/login?next=${encodeURIComponent(path)}`} className="btn-primary py-3 text-base">سجّل الدخول للبدء</Link>
              )}
              {user && (
                <form action={toggleFavorite.bind(null, c.id, path)}>
                  <button className="btn-ghost w-full" aria-pressed={c.isFavorite}>
                    <Icon name="heart" filled={c.isFavorite} className={`size-4 ${c.isFavorite ? "text-bad" : ""}`} />
                    {c.isFavorite ? "في المفضلة" : "إضافة إلى المفضلة"}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </section>

      <div className="container-x py-14">
        <div className="mx-auto grid max-w-3xl gap-10">
          {c.enrollment && (
            <section aria-labelledby="rate-h" className="card p-6">
              <h2 id="rate-h" className="text-lg font-bold">قيّم هذه الباقة</h2>
              <p className="mt-1 text-sm text-muted">{c.myRating ? `تقييمك الحالي: ${c.myRating} من 5. يمكنك تغييره.` : "رأيك يساعد الطلاب الآخرين."}</p>
              <div className="mt-3 flex gap-1" role="group" aria-label="اختر تقييمًا من 1 إلى 5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <form key={n} action={rateCourse.bind(null, c.id, c.slug, n)}>
                    <button className="rounded-lg p-1 text-[#C9A04A] hover:bg-sun-soft" aria-label={`${n} من 5`} aria-pressed={c.myRating === n}>
                      <Icon name="star" filled={(c.myRating ?? 0) >= n} className="size-7" />
                    </button>
                  </form>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="cfaq-h">
            <h2 id="cfaq-h" className="mb-5 text-2xl font-bold">أسئلة شائعة عن الباقة</h2>
            <Faq items={faqs} />
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-x pb-4" aria-labelledby="rel-h">
          <h2 id="rel-h" className="mb-6 text-2xl font-bold">باقات أخرى قد تناسبك</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <CourseCard key={r.id} c={r} />)}
          </div>
        </section>
      )}
    </>
  );
}

function PackageSchedule({ c }: { c: Parameters<typeof schedule>[0] }) {
  const s = schedule(c);
  const items = s ? [["أيام الدراسة", s.days], ["مدة الحصة", s.perDay], ["إجمالي الساعات", s.total]] : c.billing === "HOURLY" ? [["نظام الحصص", "بالساعة، تحدد عدد الساعات والمواعيد عند الحجز"]] : [];
  if (!items.length) return null;
  return (
    <dl className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
      {items.filter(([, v]) => v).map(([k, v]) => (
        <div key={k} className={`rounded-2xl border border-line bg-paper px-4 py-3 ${items.length === 1 ? "sm:col-span-3" : ""}`}>
          <dt className="text-xs text-muted">{k}</dt>
          <dd className="mt-1 font-bold text-navy">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
