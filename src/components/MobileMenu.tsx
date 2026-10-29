"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";

export function MobileMenu({ links, authed }: { links: [string, string][]; authed: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu after client-side navigation
  useEffect(() => setOpen(false), [path]);

  return (
    <div className="lg:hidden">
      <button type="button" className="btn-ghost px-2.5" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
        <Icon name={open ? "close" : "menu"} />
        <span className="sr-only">{open ? "إغلاق القائمة" : "فتح القائمة"}</span>
      </button>
      {open && (
        <nav id="mobile-nav" aria-label="القائمة الرئيسية" className="absolute inset-x-0 top-full z-40 border-b border-line bg-white shadow-lg">
          <div className="container-x py-4">
            <form action="/ar/courses" role="search" className="mb-3">
              <label htmlFor="m-search" className="sr-only">ابحث عن دورة</label>
              <input id="m-search" name="q" type="search" className="field" placeholder="ماذا تريد أن تتعلم اليوم؟" />
            </form>
            <ul className="grid gap-1">
              {links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="block rounded-lg px-3 py-2.5 font-medium text-navy hover:bg-paper" aria-current={path === href ? "page" : undefined}>{label}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {authed ? <Link href="/ar/dashboard" className="btn-ghost">لوحتي</Link> : <Link href="/ar/login" className="btn-ghost">تسجيل الدخول</Link>}
              <Link href={authed ? "/ar/dashboard" : "/ar/register"} className="btn-primary">ابدأ التعلم</Link>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
