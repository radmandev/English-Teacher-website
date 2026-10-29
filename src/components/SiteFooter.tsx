import Link from "next/link";
import { Logo } from "./Logo";

const cols: [string, [string, string][]][] = [
  ["روابط الموقع", [["/ar", "الرئيسية"], ["/ar/about", "من نحن"], ["/ar/how-it-works", "كيف يعمل الموقع؟"], ["/ar/faq", "الأسئلة الشائعة"], ["/ar/contact", "اتصل بنا"]]],
  ["الدورات", [["/ar/courses", "جميع الدورات"], ["/ar/courses?subject=math", "الرياضيات"], ["/ar/courses?subject=english", "اللغة الإنجليزية"]]],
  ["قانوني", [["/ar/privacy", "سياسة الخصوصية"], ["/ar/terms", "الشروط والأحكام"]]],
];

// ponytail: no social links — add them here once official accounts exist.
export function SiteFooter() {
  return (
    <footer className="mt-20 bg-navy-deep text-white/80">
      <div className="rainbow-bar" aria-hidden="true" />
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo light />
          <p className="mt-4 text-lg font-semibold text-white">افهمها ببساطة.</p>
          <p lang="en" dir="ltr" className="text-right text-sm text-white/60">Learn Better. Understand More.</p>
        </div>
        {cols.map(([title, items]) => (
          <nav key={title} aria-label={title}>
            <h2 className="mb-3 text-sm font-bold text-sun">{title}</h2>
            <ul className="grid gap-2 text-sm">
              {items.map(([href, label]) => <li key={href}><Link href={href} className="hover:text-white">{label}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="container-x py-5 text-xs text-white/60">© {new Date().getFullYear()} فَهْم. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
