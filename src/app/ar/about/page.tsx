import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = { title: "من نحن", description: "فَهْم منصة عربية لتعلّم الرياضيات واللغة الإنجليزية بفهم لا بحفظ.", alternates: { canonical: "/ar/about" } };

export default function About() {
  return (
    <>
      <PageIntro title="من نحن" text="فَهْم منصة تعليمية عربية تؤمن بأن المادة الصعبة تصبح مفهومة حين تُشرح بوضوح وتُقسَّم إلى خطوات." />
      <div className="container-x grid max-w-3xl gap-8 py-12 text-lg leading-8">
        <section><h2 className="mb-2 text-2xl font-bold">ما نؤمن به</h2><p className="text-muted">الفهم قبل الحفظ. لذلك نشرح «لماذا» قبل «كيف»، ونعرض الحلول خطوة بخطوة، ونمنح الطالب فرصة المحاولة من جديد دون ضغط.</p></section>
        <section><h2 className="mb-2 text-2xl font-bold">ما نقدّمه</h2><p className="text-muted">دورات في الرياضيات واللغة الإنجليزية لمراحل دراسية مختلفة، بدروس قصيرة وتمارين تفاعلية ولوحة لمتابعة التقدّم. والمنصة مصممة لتستوعب مواد جديدة مستقبلًا.</p></section>
        <section><h2 className="mb-2 text-2xl font-bold">لمن فَهْم؟</h2><p className="text-muted">لطلاب المدارس، وللمبتدئين في الإنجليزية، ولأولياء الأمور الباحثين عن مصدر تعليمي واضح ومنظّم.</p></section>
        <Link href="/ar/courses" className="btn-primary w-fit">تصفّح الدورات</Link>
      </div>
    </>
  );
}
