import type { Metadata } from "next";
import { sendContact } from "@/lib/actions";
import { ActionForm, Field } from "@/components/ActionForm";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = { title: "اتصل بنا", description: "أرسل لنا سؤالك أو اقتراحك.", alternates: { canonical: "/ar/contact" } };

export default function Contact() {
  return (
    <>
      <PageIntro title="اتصل بنا" text="لديك سؤال أو اقتراح أو ملاحظة على درس؟ اكتب لنا وسنقرأ رسالتك." />
      <div className="container-x max-w-xl py-12">
        <div className="card p-6 md:p-8">
          <ActionForm action={sendContact} submit="إرسال الرسالة">
            <Field label="الاسم" name="name" autoComplete="name" required minLength={2} />
            <Field label="البريد الإلكتروني" name="email" type="email" autoComplete="email" dir="ltr" required />
            <div>
              <label htmlFor="message" className="label">رسالتك</label>
              <textarea id="message" name="message" rows={6} required minLength={10} maxLength={3000} className="field" />
            </div>
          </ActionForm>
        </div>
      </div>
    </>
  );
}
