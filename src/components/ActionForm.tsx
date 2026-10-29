"use client";
import { startTransition, useActionState } from "react";
import type { FormState } from "@/lib/actions";

/** Wraps a server action with pending + success/error feedback. */
export function ActionForm({ action, submit, children, className = "grid gap-4" }: {
  action: (s: FormState, fd: FormData) => Promise<FormState>; submit: string; children: React.ReactNode; className?: string;
}) {
  const [state, run, pending] = useActionState(action, undefined);
  return (
    // Submitting via onSubmit keeps typed values on validation errors (React resets forms after `action` submissions).
    <form action={run} className={className}
      onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => run(fd)); }}>
      {children}
      <div aria-live="polite">
        {state?.error && <p className="rounded-xl bg-bad/10 px-4 py-3 text-sm font-medium text-bad">{state.error}</p>}
        {state?.ok && <p className="rounded-xl bg-good/10 px-4 py-3 text-sm font-medium text-good">{state.ok}</p>}
      </div>
      <button className="btn-navy w-full py-3" disabled={pending}>{pending ? "جارٍ الإرسال…" : submit}</button>
    </form>
  );
}

export function Field({ label, name, type = "text", ...rest }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} type={type} className="field" {...rest} />
    </div>
  );
}
