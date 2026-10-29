import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = { title: "الشروط والأحكام", alternates: { canonical: "/ar/terms" } };

export default function Terms() {
  return (
    <>
      <PageIntro title="الشروط والأحكام" />
      <div className="container-x max-w-3xl py-12 leading-8">
        <p className="mb-8 rounded-xl bg-sun-soft px-4 py-3 text-sm">مسودة أولية، ويجب مراجعتها قانونيًا قبل الإطلاق الرسمي.</p>
        <h2 className="mb-2 text-xl font-bold">استخدام المنصة</h2>
        <p className="mb-6 text-muted">المحتوى مخصص للتعلّم الشخصي. يُرجى عدم إعادة نشره أو بيعه دون إذن.</p>
        <h2 className="mb-2 text-xl font-bold">الحساب</h2>
        <p className="mb-6 text-muted">أنت مسؤول عن سرية كلمة مرورك وعن النشاط الذي يتم من خلال حسابك.</p>
        <h2 className="mb-2 text-xl font-bold">المحتوى التجريبي</h2>
        <p className="text-muted">بعض الدورات المعروضة حاليًا محتوى تجريبي لأغراض العرض، وتظهر عليها شارة «تجريبي».</p>
      </div>
    </>
  );
}
