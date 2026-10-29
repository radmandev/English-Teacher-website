import Link from "next/link";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#173B67" />
      <circle cx="46" cy="18" r="7" fill="#FFC857" />
      <path d="M14 40c6 6 18 8 28 2" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="26" r="4" fill="#fff" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/ar" className="flex items-center gap-2.5" aria-label="فَهْم، الصفحة الرئيسية">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className={`text-2xl font-bold ${light ? "text-white" : "text-navy"}`}>فَهْم</span>
        <span lang="en" className={`text-[11px] font-semibold tracking-[0.25em] ${light ? "text-sun" : "text-blue-ink"}`}>FAHM</span>
      </span>
    </Link>
  );
}
