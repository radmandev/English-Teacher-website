/* eslint-disable @next/next/no-img-element -- avatars may be external URLs set by an admin */
export type InstructorInfo = { name: string; avatarUrl: string | null; headline: string | null };

export function Avatar({ i, className = "size-9" }: { i: InstructorInfo; className?: string }) {
  return i.avatarUrl ? (
    <img src={i.avatarUrl} alt={i.name} loading="lazy" className={`${className} shrink-0 rounded-full object-cover object-top ring-2 ring-sun/60`} />
  ) : (
    <span className={`${className} grid shrink-0 place-items-center rounded-full bg-navy font-bold text-sun`} aria-hidden="true">{i.name.replace(/^ال\S+\s/, "").charAt(0)}</span>
  );
}

/** Compact row for cards. */
export function InstructorLine({ i }: { i: InstructorInfo }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar i={i} />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-bold text-navy">{i.name}</p>
        {i.headline && <p className="truncate text-xs text-muted">{i.headline}</p>}
      </div>
    </div>
  );
}
