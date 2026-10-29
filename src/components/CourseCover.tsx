/* eslint-disable @next/next/no-img-element -- admin-provided external URLs; next/image would need per-host config */
const themes: Record<string, { bg: string; ink: string; accent: string }> = {
  math: { bg: "#173B67", ink: "#F4E3B5", accent: "#3A6AAE" },
  english: { bg: "#F4EEDF", ink: "#173B67", accent: "#C9A04A" },
};

/** Generated cover (no stock imagery) unless an admin set a thumbnail URL. */
export function CourseCover({ subject, glyph, thumbnailUrl, title, className = "" }: { subject: string; glyph: string; thumbnailUrl?: string | null; title: string; className?: string }) {
  if (thumbnailUrl)
    return <img src={thumbnailUrl} alt={`غلاف دورة ${title}`} loading="lazy" className={`aspect-[16/9] w-full object-cover ${className}`} />;
  const t = themes[subject] ?? { bg: "#E3E8F0", ink: "#173B67", accent: "#3978F6" };
  return (
    <div className={`relative aspect-[16/9] w-full overflow-hidden ${className}`} style={{ background: t.bg }} role="img" aria-label={`غلاف دورة ${title}`}>
      <svg viewBox="0 0 320 180" className="absolute inset-0 size-full" aria-hidden="true">
        <circle cx="285" cy="25" r="60" fill={t.accent} opacity="0.35" />
        <circle cx="30" cy="170" r="45" fill={t.accent} opacity="0.25" />
        <path d="M0 140 Q 80 110 160 140 T 320 130" stroke={t.ink} strokeOpacity="0.12" strokeWidth="2" fill="none" />
        {subject === "math" && <g stroke={t.ink} strokeOpacity="0.12">{[40, 80, 120, 160, 200, 240, 280].map((x) => <path key={x} d={`M${x} 0v180`} />)}</g>}
      </svg>
      <span dir="ltr" className="absolute inset-0 grid place-items-center px-6 text-center text-4xl font-bold tracking-wide" style={{ color: t.ink }}>
        {glyph}
      </span>
    </div>
  );
}
