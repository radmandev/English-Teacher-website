import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = { title: "سياسة الخصوصية", alternates: { canonical: "/ar/privacy" } };

export default function Privacy() {
  return (
    <>
      <PageIntro title="سياسة الخصوصية" />
      <div className="container-x max-w-3xl py-12 leading-8">
        <p className="mb-8 rounded-xl bg-sun-soft px-4 py-3 text-sm">مسودة أولية تصف ما تجمعه المنصة تقنيًا، ويجب مراجعتها قانونيًا قبل الإطلاق الرسمي.</p>
        <h2 className="mb-2 text-xl font-bold">البيانات التي نحفظها</h2>
        <ul className="mb-6 list-disc ps-5 text-muted">
          <li>عند إنشاء حساب: الاسم والبريد الإلكتروني، وكلمة المرور بصيغة مشفّرة غير قابلة للاسترجاع.</li>
          <li>أثناء التعلّم: الدورات التي سجّلت فيها، والدروس المكتملة، ونتائج التمارين المحفوظة، والدورات المفضلة، وتقييماتك.</li>
          <li>عند مراسلتنا: الاسم والبريد ونص الرسالة.</li>
        </ul>
        <h2 className="mb-2 text-xl font-bold">ملفات تعريف الارتباط</h2>
        <p className="mb-6 text-muted">نستخدم ملف تعريف ارتباط واحدًا ضروريًا لإبقائك مسجّلًا الدخول. لا نستخدم ملفات تتبّع إعلانية.</p>
        <h2 className="mb-2 text-xl font-bold">استخدام البيانات</h2>
        <p className="mb-6 text-muted">نستخدم بياناتك لتشغيل حسابك وحفظ تقدّمك والرد على رسائلك فقط، ولا نبيعها لأي طرف.</p>
        <h2 className="mb-2 text-xl font-bold">حقوقك</h2>
        <p className="text-muted">يمكنك تعديل اسمك وكلمة مرورك من إعدادات الحساب، ويمكنك طلب حذف حسابك عبر صفحة «اتصل بنا».</p>
      </div>
    </>
  );
}
