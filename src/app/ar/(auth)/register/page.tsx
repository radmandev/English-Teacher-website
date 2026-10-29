import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, safeNext } from "@/lib/auth";
import { register } from "@/lib/actions";
import { ActionForm, Field } from "@/components/ActionForm";

export const metadata: Metadata = { title: "إنشاء حساب", alternates: { canonical: "/ar/register" } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getUser()) redirect(next);
  return (
    <>
      <h1 className="text-center text-2xl font-bold">ابدأ التعلم مع فَهْم</h1>
      <p className="mb-6 mt-1 text-center text-muted">حساب مجاني لحفظ تقدّمك ونتائجك.</p>
      <ActionForm action={register} submit="إنشاء الحساب">
        <input type="hidden" name="next" value={next} />
        <Field label="الاسم" name="name" autoComplete="name" required minLength={2} />
        <Field label="البريد الإلكتروني" name="email" type="email" autoComplete="email" dir="ltr" required />
        <Field label="كلمة المرور (8 أحرف على الأقل)" name="password" type="password" autoComplete="new-password" dir="ltr" required minLength={8} />
      </ActionForm>
      <p className="mt-6 text-center text-sm text-muted">لديك حساب؟ <Link href={`/ar/login?next=${encodeURIComponent(next)}`} className="font-semibold text-blue-ink hover:underline">سجّل الدخول</Link></p>
    </>
  );
}
