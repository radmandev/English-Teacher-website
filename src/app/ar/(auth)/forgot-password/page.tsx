import type { Metadata } from "next";
import Link from "next/link";
import { forgotPassword } from "@/lib/actions";
import { ActionForm, Field } from "@/components/ActionForm";

export const metadata: Metadata = { title: "استعادة كلمة المرور", robots: { index: false } };

export default function ForgotPage() {
  return (
    <>
      <h1 className="text-center text-2xl font-bold">نسيت كلمة المرور؟</h1>
      <p className="mb-6 mt-1 text-center text-muted">أدخل بريدك وسنرسل لك رابطًا لإعادة تعيينها.</p>
      <ActionForm action={forgotPassword} submit="إرسال الرابط">
        <Field label="البريد الإلكتروني" name="email" type="email" autoComplete="email" dir="ltr" required />
      </ActionForm>
      <p className="mt-6 text-center text-sm"><Link href="/ar/login" className="font-semibold text-blue-ink hover:underline">العودة لتسجيل الدخول</Link></p>
    </>
  );
}
