import Link from "next/link";
import type { CourseSummary } from "@/lib/courses";
import { DIFFICULTIES, LEVELS, formatMinutes, formatPrice, schedule } from "@/lib/constants";
import { CourseCover } from "./CourseCover";
import { Icon } from "./Icon";
import { Price, ProgressBar } from "./bits";
import { BuyButton } from "./BuyButton";
import { InstructorLine } from "./Instructor";

export function CourseCard({ c }: { c: CourseSummary }) {
  const href = `/ar/courses/${c.slug}`;
  const action = "grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-sun shadow-sm shadow-navy/20 hover:bg-navy-deep transition hover:-translate-y-0.5 hover:shadow-lg";
  return (
    <article className="card card-hover group flex h-full flex-col p-4">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="overflow-hidden rounded-xl">
        <CourseCover subject={c.subject.slug} glyph={c.coverGlyph} thumbnailUrl={c.thumbnailUrl} title={c.title} className="transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <h3 className="mt-5 text-lg font-bold leading-snug">
        <Link href={href} className="hover:text-violet">{c.title}</Link>
      </h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={`chip ${c.subject.slug === "english" ? "bg-coral-soft text-coral" : "bg-violet-soft text-violet"}`}>{c.subject.name}</span>
        <span className="chip bg-mint-soft text-mint">{LEVELS[c.level as keyof typeof LEVELS]}</span>
      </div>

      <ul className="mt-4 flex flex-wrap justify-between gap-2 border-b border-line pb-4 text-xs text-muted">
        <li className="flex items-center gap-1"><Icon name="chart" className="size-4 text-coral" />{DIFFICULTIES[c.difficulty as keyof typeof DIFFICULTIES]}</li>
        <li className="flex items-center gap-1"><Icon name="clock" className="size-4 text-mint" />{schedule(c)?.short ?? (c.billing === "HOURLY" ? "بالساعة · مرن" : formatMinutes(c.minutes))}</li>
      </ul>
      {c.instructor && <div className="mt-4"><InstructorLine i={c.instructor} /></div>}
      {c.progress !== null && <ProgressBar value={c.progress} className="mt-4" />}

      <div className="min-h-5 flex-1" />
      <div className="flex items-center justify-between gap-3 text-lg">
        <Price price={c.price} salePrice={c.salePrice} billing={c.billing} months={c.durationMonths} />
        {c.progress !== null ? (
          <Link href={href} className="btn-navy">متابعة</Link>
        ) : c.price === 0 ? (
          <Link href={href} className="btn-navy">ابدأ مجانًا</Link>
        ) : (
          <BuyButton title={c.title} price={formatPrice(c.salePrice ?? c.price, c.billing, c.durationMonths)} className={action} />
        )}
      </div>
    </article>
  );
}
