/** Hand-drawn style marks for each subject; unknown subjects fall back to a book. */
export function SubjectIcon({ slug, className = "size-10" }: { slug?: string; className?: string }) {
  if (slug === "math")
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#EDF1F7" />
        <path d="M14 17h8M18 13v8M27 17h8M14 31l6 6M20 31l-6 6M27 32h8M31 29v0M31 35v0" stroke="#173B67" strokeWidth="3" strokeLinecap="round" />
        <circle cx="31" cy="28.5" r="1.6" fill="#C9A04A" /><circle cx="31" cy="35.5" r="1.6" fill="#C9A04A" />
      </svg>
    );
  if (slug === "english")
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <rect x="4" y="4" width="40" height="40" rx="12" fill="#F6EFDF" />
        <path d="M12 33 18 15l6 18M14 27h8" stroke="#173B67" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M34 24.5a4.5 4.5 0 1 0 0 8.5V22" stroke="#9C7A32" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    );
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="12" fill="#EEF1F6" />
      <path d="M14 14h14a6 6 0 0 1 6 6v14H20a6 6 0 0 1-6-6V14Z" stroke="#173B67" strokeWidth="3" fill="none" />
    </svg>
  );
}
