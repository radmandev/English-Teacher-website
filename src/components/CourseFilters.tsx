"use client";
import Form from "next/form";
import Link from "next/link";
import { BILLING, COURSE_TYPES, DIFFICULTIES, LEVELS, SORTS } from "@/lib/constants";
import type { Filters } from "@/lib/courses";
import { Icon } from "./Icon";

// One GET form; the bar and the sidebar attach their inputs to it with form="filters".
// Works without JS, auto-submits on change when JS is available.
const submit = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => e.currentTarget.form?.requestSubmit();

export function FilterForm() {
  return <Form id="filters" action="/ar/courses" scroll={false} />;
}

export function FilterBar({ f }: { f: Filters }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="filters-toggle" className="btn-ghost h-12 cursor-pointer border-navy/40 lg:hidden"><Icon name="filter" />تصفية</label>
      <div className="relative min-w-60 flex-1">
        <label htmlFor="q" className="sr-only">ابحث عن دورة</label>
        <Icon name="search" className="pointer-events-none absolute start-4 top-3.5 size-5 text-muted" />
        <input id="q" name="q" form="filters" type="search" defaultValue={f.q} placeholder="ماذا تريد أن تتعلم اليوم؟" className="field h-12 rounded-full ps-11" />
      </div>
      <label htmlFor="f-sort" className="sr-only">ترتيب حسب</label>
      <select id="f-sort" name="sort" form="filters" defaultValue={f.sort ?? "popular"} onChange={submit} className="field h-12 w-auto min-w-48 rounded-full border-navy/40">
        {Object.entries(SORTS).map(([v, l]) => <option key={v} value={v}>ترتيب: {l}</option>)}
      </select>
      <noscript><button form="filters" className="btn-navy h-12">بحث</button></noscript>
    </div>
  );
}

export function FilterSidebar({ f, subjects }: { f: Filters; subjects: { slug: string; name: string; count: number }[] }) {
  const groups: [keyof Filters, string, Record<string, string>][] = [
    ["subject", "الفئة", Object.fromEntries(subjects.map((s) => [s.slug, `${s.name} (${s.count})`]))],
    ["level", "المرحلة", LEVELS],
    ["difficulty", "المستوى", DIFFICULTIES],
    ["type", "نوع الدورة", COURSE_TYPES],
    ["billing", "نوع الاشتراك", BILLING],
  ];
  return (
    <div className="grid gap-4">
      <Link href="/ar/courses" scroll={false} className="btn-ghost h-12 border-navy/40">مسح الفلاتر</Link>
      {groups.map(([key, label, opts]) => (
        <details key={key} open={key === "subject" || !!f[key]} className="card group border-s-4 border-s-violet/60 p-5 open:border-s-orange">
          <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-bold text-navy">
            {label}<Icon name="chevron" className="size-5 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <fieldset className="mt-4 grid gap-3 border-t border-line pt-4">
            <legend className="sr-only">{label}</legend>
            {[["", "الكل"], ...Object.entries(opts)].map(([v, l]) => (
              <label key={v} className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input type="radio" name={key} value={v} form="filters" defaultChecked={(f[key] ?? "") === v} onChange={submit} className="size-4 accent-violet" />
                {l}
              </label>
            ))}
          </fieldset>
        </details>
      ))}
    </div>
  );
}
