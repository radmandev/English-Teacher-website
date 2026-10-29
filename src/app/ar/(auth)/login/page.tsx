import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, safeNext } from "@/lib/auth";
import { login } from "@/lib/actions";
import { ActionForm, Field } from "@/components/ActionForm";

export const metadata: Metadata = { title: "تسجيل الدخول", alternates: { canonical: "/ar/login" } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getUser()) redirect(next);
  return (
    <>
      <h1 className="text-center text-2xl font-bold">مرحبًا بعودتك</h1>
      <p className="mb-6 mt-1 text-center text-muted">سجّل الدخول لمتابعة التعلم.</p>
      <ActionForm action={login} submit="تسجيل الدخول">
        <input type="hidden" name="next" value={next} />
        <Field label="البريد الإلكتروني" name="email" type="email" autoComplete="email" dir="ltr" required />
        <Field label="كلمة المرور" name="password" type="password" autoComplete="current-password" dir="ltr" required />
        <Link href="/ar/forgot-password" className="-mt-2 text-sm font-medium text-blue-ink hover:underline">نسيت كلمة المرور؟</Link>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-muted">ليس لديك حساب؟ <Link href={`/ar/register?next=${encodeURIComponent(next)}`} className="font-semibold text-blue-ink hover:underline">أنشئ حسابًا مجانيًا</Link></p>
    </>
  );
}
