import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = { title: "كيف يعمل فَهْم؟", description: "تعرّف على طريقة التعلّم في فَهْم: دروس قصيرة، وتمارين تفاعلية، ومتابعة للتقدّم.", alternates: { canonical: "/ar/how-it-works" } };

const steps: [IconName, string, string][] = [
  ["search", "ابحث عن دورتك", "استخدم البحث أو صفِّ الدورات حسب المادة والمرحلة الدراسية والمستوى ونوع الدورة. كل دورة تعرض عدد دروسها ومدتها والمتطلبات السابقة."],
  ["play", "جرّب قبل التسجيل", "في كل دورة دروس معاينة مجانية يمكنك فتحها دون حساب، لتتأكد أن الأسلوب يناسبك."],
  ["user", "اشترك في الباقة", "أنشئ حسابًا مجانيًا، ثم اطلب الباقة عبر واتساب. بعد تأكيد الدفع تُفتح لك جميع دروسها ويبدأ حفظ تقدّمك."],
  ["book", "تعلّم درسًا بعد درس", "كل درس قصير ومركّز. المعادلات والكسور تُكتب بصيغتها الرياضية الصحيحة، والأمثلة الإنجليزية تُعرض بوضوح."],
  ["target", "تدرّب وتحقّق", "تمارين اختيار من متعدد، وإجابات عددية، ومطابقة، وإكمال فراغ، وترتيب جمل، واستماع. تحصل على تصحيح فوري، وتلميح عند الحاجة، وحل خطوة بخطوة."],
  ["chart", "تابع تقدّمك", "حدّد الدروس كمكتملة، واحفظ نتائج تمارينك، وارجع إلى آخر درس من لوحة الطالب بضغطة واحدة."],
];

export default function HowItWorks() {
  return (
    <>
      <PageIntro title="كيف يعمل فَهْم؟" text="طريقة بسيطة ومنظّمة: تختار، تتعلّم، تتدرّب، ثم ترى تقدّمك." />
      <div className="container-x py-12">
        <ol className="grid gap-5 md:grid-cols-2">
          {steps.map(([icon, t, d], i) => (
            <li key={t} className="card flex gap-4 p-6">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-soft text-blue-ink"><Icon name={icon} className="size-6" /></span>
              <div>
                <h2 className="text-lg font-bold"><span className="text-blue-ink">{i + 1}.</span> {t}</h2>
                <p className="mt-2 leading-7 text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/ar/courses" className="btn-primary">استكشف الدورات</Link>
          <Link href="/ar/register" className="btn-ghost">أنشئ حسابًا مجانيًا</Link>
        </div>
      </div>
    </>
  );
}
