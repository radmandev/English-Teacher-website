import Link from "next/link";
import { getUser } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { MobileMenu } from "./MobileMenu";

const links: [string, string][] = [
  ["/ar", "الرئيسية"],
  ["/ar/courses", "الدورات"],
  ["/ar/courses?subject=math", "الرياضيات"],
  ["/ar/courses?subject=english", "اللغة الإنجليزية"],
  ["/ar/how-it-works", "كيف يعمل الموقع؟"],
  ["/ar/contact", "اتصل بنا"],
];

export async function SiteHeader() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="rainbow-bar" aria-hidden="true" />
      <div className="container-x relative flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="القائمة الرئيسية" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-[15px] font-medium">
            {links.map(([href, label]) => (
              <li key={href}><Link href={href} className="rounded-lg px-3 py-2 text-ink hover:bg-violet-soft hover:text-violet">{label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/ar/courses#search" className="btn-ghost hidden px-2.5 lg:inline-flex" aria-label="البحث عن دورة"><Icon name="search" /></Link>
          {user ? (
            <div className="hidden items-center gap-2 lg:flex">
              {user.role === "ADMIN" && <Link href="/ar/admin" className="btn-ghost">الإدارة</Link>}
              <Link href="/ar/dashboard" className="btn-ghost"><Icon name="user" className="size-4" />{user.name.split(" ")[0]}</Link>
              <form action={logout}><button className="btn px-3 text-muted hover:text-navy">خروج</button></form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link href="/ar/login" className="btn-ghost">تسجيل الدخول</Link>
              <Link href="/ar/register" className="btn-primary">ابدأ التعلم</Link>
            </div>
          )}
          <MobileMenu links={user ? [...links, ["/ar/dashboard", "لوحتي"]] : links} authed={!!user} />
        </div>
      </div>
    </header>
  );
}
