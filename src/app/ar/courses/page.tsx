import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { filterCourses, parseFilters, summaries, type Filters } from "@/lib/courses";
import { CourseCard } from "@/components/CourseCard";
import { FilterBar, FilterForm, FilterSidebar } from "@/components/CourseFilters";
import { Icon } from "@/components/Icon";
import { Blobs } from "@/components/PageIntro";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { subject } = parseFilters(await searchParams);
  const s = subject ? await db.subject.findUnique({ where: { slug: subject } }) : null;
  return {
    title: s ? `دورات ${s.nameAr}` : "الدورات",
    description: s ? s.blurbAr : "اكتشف دورات الرياضيات واللغة الإنجليزية، وتعلّم خطوة بخطوة حتى تتقن كل درس.",
    alternates: { canonical: s ? `/ar/courses?subject=${s.slug}` : "/ar/courses" },
  };
}

const qs = (f: Filters, patch: Partial<Filters>) => {
  const p = new URLSearchParams(Object.entries({ ...f, ...patch }).filter(([, v]) => v) as [string, string][]);
  const s = p.toString();
  return s ? `/ar/courses?${s}` : "/ar/courses";
};

export default async function CoursesPage({ searchParams }: Props) {
  const f = parseFilters(await searchParams);
  const user = await getUser();
  const [all, subjects] = await Promise.all([summaries(user?.id), db.subject.findMany({ orderBy: { order: "asc" } })]);
  const courses = filterCourses(all, f);
  const counts = subjects.map((s) => ({ slug: s.slug, name: s.nameAr, count: all.filter((c) => c.subject.slug === s.slug).length }));
  const path = qs(f, {});
  const subjectName = subjects.find((s) => s.slug === f.subject)?.nameAr;

  return (
    <>
    <section className="relative overflow-hidden bg-gradient-to-l from-navy via-violet to-pink text-white">
      <Blobs />
      <div className="container-x relative pb-24 pt-10 md:pb-28 md:pt-14">
      <nav aria-label="مسار التنقل" className="text-sm text-white/75">
        <ol className="flex flex-wrap gap-2">
          <li><Link href="/ar" className="hover:text-white">الرئيسية</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-white">الدورات</li>
        </ol>
      </nav>
      <h1 className="mt-6 text-3xl font-bold text-white md:text-5xl">{subjectName ? `دورات ${subjectName}` : "أفضل الدورات أونلاين للكبار والأطفال"}</h1>
      <p className="mt-3 max-w-3xl text-lg leading-8 text-white/85">اختر الدورة المناسبة لك في الرياضيات واللغة الإنجليزية، وتعلّم خطوة بخطوة حتى تتقن كل درس.</p>
      </div>
    </section>

    <div className="container-x py-8 md:py-10">
      <FilterForm />
      <div className="card -mt-16 relative p-3 md:-mt-[4.5rem]"><FilterBar key={path} f={f} /></div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <input type="checkbox" id="filters-toggle" className="peer sr-only" />
        <aside aria-label="تصفية الدورات" className="hidden peer-checked:block lg:block"><FilterSidebar key={path} f={f} subjects={counts} /></aside>

        <section aria-labelledby="results-h" className="lg:col-start-2 lg:row-start-1">
          <h2 id="results-h" className="sr-only" aria-live="polite">{courses.length} {courses.length === 1 ? "دورة" : "دورات"}</h2>
          {courses.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((c) => <CourseCard key={c.id} c={c} />)}
            </div>
          ) : (
            <div className="card mx-auto max-w-lg p-10 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-sun-soft text-navy"><Icon name="search" className="size-7" /></span>
              <h3 className="mt-5 text-xl font-bold">لم نجد دورات مطابقة</h3>
              <p className="mt-2 text-muted">جرّب كلمات بحث أخرى، أو أزل بعض عوامل التصفية.</p>
              <Link href="/ar/courses" className="btn-navy mt-6">عرض جميع الدورات</Link>
            </div>
          )}
        </section>
      </div>
    </div>
    </>
  );
}
