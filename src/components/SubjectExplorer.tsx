"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { SubjectIcon } from "./SubjectIcon";

export type ExplorerPackage = { slug: string; title: string; subtitle: string; description: string; price: string; schedule: string[] };
export type ExplorerSubject = { slug: string; name: string; blurb: string; topics: string[]; packages: ExplorerPackage[] };

const theme: Record<string, { panel: string; text: string; muted: string; accent: string; glyph: string; btn: string }> = {
  math: { panel: "bg-gradient-to-br from-navy via-navy to-violet text-white", text: "text-white", muted: "text-white/80", accent: "text-sun", glyph: "x²", btn: "btn-primary" },
  english: { panel: "bg-gradient-to-br from-sun-soft via-sun-soft to-coral-soft", text: "text-navy", muted: "text-ink/80", accent: "text-violet", glyph: "Aa", btn: "btn-navy" },
};

/** Tabbed subject switcher: pick a subject, then open any of its packages inline. */
export function SubjectExplorer({ subjects }: { subjects: ExplorerSubject[] }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<string | null>(subjects[0]?.packages[0]?.slug ?? null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const s = subjects[active];
  if (!s) return null;
  const t = theme[s.slug] ?? theme.english;

  const select = (i: number) => {
    setActive(i);
    setOpen(subjects[i].packages[0]?.slug ?? null);
    tabs.current[i]?.focus();
  };
  // Arrow keys move between tabs (RTL: left = next).
  const onKey = (e: React.KeyboardEvent) => {
    const n = subjects.length;
    if (e.key === "ArrowLeft") select((active + 1) % n);
    else if (e.key === "ArrowRight") select((active - 1 + n) % n);
  };

  return (
    <div>
      <div role="tablist" aria-label="المواد" onKeyDown={onKey} className="mx-auto mt-8 flex w-fit gap-1 rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-card)]">
        {subjects.map((x, i) => (
          <button key={x.slug} ref={(el) => { tabs.current[i] = el; }} role="tab" id={`tab-${x.slug}`} aria-controls={`panel-${x.slug}`}
            aria-selected={i === active} tabIndex={i === active ? 0 : -1} onClick={() => select(i)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-bold transition-all sm:px-6 sm:text-base ${i === active ? "bg-gradient-to-l from-navy to-violet text-white shadow-md" : "text-navy hover:bg-paper"}`}>
            <SubjectIcon slug={x.slug} className="hidden size-7 sm:block" />
            {x.name}
            <span className={`chip ${i === active ? "bg-white/20 text-white" : "bg-violet-soft text-violet"}`}>{x.packages.length}</span>
          </button>
        ))}
      </div>

      <div key={s.slug} role="tabpanel" id={`panel-${s.slug}`} aria-labelledby={`tab-${s.slug}`} className="fade-up mt-8 grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        <article className={`relative overflow-hidden rounded-[var(--radius-card)] p-8 md:p-10 ${t.panel}`}>
          <span dir="ltr" className="floaty pointer-events-none absolute -bottom-6 end-4 text-[9rem] font-bold leading-none opacity-[0.07]" aria-hidden="true">{t.glyph}</span>
          <SubjectIcon slug={s.slug} className="size-14" />
          <h3 className={`mt-5 text-2xl font-bold ${t.text}`}>{s.name}</h3>
          <p className={`mt-3 leading-7 ${t.muted}`}>{s.blurb}</p>
          <ul className="mt-5 grid gap-2 text-sm">
            {s.topics.map((x, i) => (
              <li key={x} className="fade-up flex items-center gap-2" style={{ animationDelay: `${i * 70}ms` }}>
                <Icon name="check" className={`size-4 ${t.accent}`} />{x}
              </li>
            ))}
          </ul>
          <Link href={`/ar/courses?subject=${s.slug}`} className={`${t.btn} mt-8`}>كل باقات {s.name} <Icon name="next" className="size-4" /></Link>
        </article>

        <ul className="grid content-start gap-3">
          {s.packages.map((p, i) => {
            const isOpen = open === p.slug;
            return (
              <li key={p.slug} className={`fade-up card overflow-hidden transition-all ${isOpen ? "border-violet/40 shadow-lg shadow-violet/10" : "hover:-translate-y-0.5 hover:border-violet/30"}`} style={{ animationDelay: `${i * 80}ms` }}>
                <button type="button" aria-expanded={isOpen} aria-controls={`pkg-${p.slug}`} onClick={() => setOpen(isOpen ? null : p.slug)}
                  className="flex w-full items-center gap-3 p-4 text-start sm:p-5">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl transition-colors ${isOpen ? "bg-violet text-white" : "bg-violet-soft text-violet"}`}>
                    <Icon name="book" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-navy">{p.title}</span>
                    <span className="block truncate text-xs text-muted">{p.subtitle}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-violet">{p.price}</span>
                  <Icon name="chevron" className={`size-5 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div id={`pkg-${p.slug}`} className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="border-t border-line px-5 pb-5 pt-4">
                      <p className="text-sm leading-7 text-muted">{p.description}</p>
                      {p.schedule.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {p.schedule.map((x) => <li key={x} className="chip bg-mint-soft py-1 text-mint"><Icon name="clock" className="size-3.5" />{x}</li>)}
                        </ul>
                      )}
                      <Link href={`/ar/courses/${p.slug}`} tabIndex={isOpen ? 0 : -1} className="btn-navy mt-4">عرض الباقة <Icon name="next" className="size-4" /></Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
