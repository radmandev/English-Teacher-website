import type { Metadata } from "next";
import Link from "next/link";
import { resetPassword } from "@/lib/actions";
import { ActionForm, Field } from "@/components/ActionForm";

export const metadata: Metadata = { title: "تعيين كلمة مرور جديدة", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold">تعيين كلمة مرور جديدة</h1>
      {token ? (
        <ActionForm action={resetPassword} submit="حفظ كلمة المرور">
          <input type="hidden" name="token" value={token} />
          <Field label="كلمة المرور الجديدة" name="password" type="password" autoComplete="new-password" dir="ltr" required minLength={8} />
        </ActionForm>
      ) : (
        <p className="text-center text-muted">الرابط غير مكتمل. <Link href="/ar/forgot-password" className="font-semibold text-blue-ink">اطلب رابطًا جديدًا</Link></p>
      )}
      <p className="mt-6 text-center text-sm"><Link href="/ar/login" className="font-semibold text-blue-ink hover:underline">تسجيل الدخول</Link></p>
    </>
  );
}
