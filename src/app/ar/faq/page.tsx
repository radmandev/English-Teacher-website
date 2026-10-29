import type { Metadata } from "next";
import { Faq, SITE_FAQ } from "@/components/Faq";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = { title: "الأسئلة الشائعة", alternates: { canonical: "/ar/faq" } };

export default function FaqPage() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: SITE_FAQ.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <PageIntro title="الأسئلة الشائعة" text="إجابات عن أكثر ما يسأل عنه الطلاب وأولياء الأمور." />
      <div className="container-x max-w-3xl py-12"><Faq items={SITE_FAQ} /></div>
    </>
  );
}
