import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { grantAccess, setUserRole } from "@/lib/actions";
import { ActionForm, Field } from "@/components/ActionForm";
import { ROLES, STATUSES } from "@/lib/constants";

export const metadata: Metadata = { title: "لوحة الإدارة", robots: { index: false } };

const fmt = new Intl.DateTimeFormat("ar-SA-u-nu-latn-ca-gregory", { dateStyle: "medium" });
const statusColor: Record<string, string> = { PUBLISHED: "bg-good/10 text-good", DRAFT: "bg-sun-soft text-navy", ARCHIVED: "bg-line text-muted" };

// ponytail: plain tables, no pagination. Add take/skip + search once users or messages exceed a few hundred.
export default async function AdminPage() {
  const admin = await requireRole(["ADMIN"]);
  const [courses, users, enrollments, messages] = await Promise.all([
    db.course.findMany({ orderBy: { createdAt: "asc" }, include: { subject: true, _count: { select: { enrollments: true } } } }),
    db.user.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { enrollments: true } } } }),
    db.enrollment.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } } }),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
      <nav className="mt-4 flex flex-wrap gap-2 text-sm" aria-label="أقسام الإدارة">
        {[["#courses", `الدورات (${courses.length})`], ["#users", `المستخدمون (${users.length})`], ["#enrollments", "التسجيلات"], ["#messages", `الرسائل (${messages.length})`]].map(([h, l]) => <a key={h} href={h} className="btn-ghost py-1.5">{l}</a>)}
      </nav>

      <section id="courses" className="card mt-8 overflow-x-auto p-6">
        <h2 className="mb-4 text-xl font-bold">الدورات</h2>
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr className="text-xs text-muted">{["الدورة", "المادة", "الحالة", "المسجّلون", ""].map((h) => <th key={h} className="pb-2 text-start font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {courses.map((c) => (
              <tr key={c.id}>
                <td className="py-3 font-medium">{c.title}{c.isDemo && <span className="ms-2 text-xs text-muted">(تجريبي)</span>}</td>
                <td>{c.subject.nameAr}</td>
                <td><span className={`chip ${statusColor[c.status]}`}>{STATUSES[c.status as keyof typeof STATUSES]}</span></td>
                <td>{c._count.enrollments}</td>
                <td className="text-end"><Link href={`/ar/admin/courses/${c.id}`} className="font-semibold text-blue-ink hover:underline">تعديل</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="users" className="card mt-6 overflow-x-auto p-6">
        <h2 className="mb-4 text-xl font-bold">المستخدمون والصلاحيات</h2>
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr className="text-xs text-muted">{["الاسم", "البريد", "التسجيلات", "الدور"].map((h) => <th key={h} className="pb-2 text-start font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3 font-medium">{u.name}</td>
                <td dir="ltr" className="text-end">{u.email}</td>
                <td>{u._count.enrollments}</td>
                <td>
                  {u.id === admin.id ? <span className="text-muted">{ROLES.ADMIN} (أنت)</span> : (
                    <form action={setUserRole.bind(null, u.id)} className="flex gap-2">
                      <label className="sr-only" htmlFor={`role-${u.id}`}>دور {u.name}</label>
                      <select id={`role-${u.id}`} name="role" defaultValue={u.role} className="field w-28 py-1.5 text-sm">
                        {Object.entries(ROLES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <button className="btn-ghost py-1.5">حفظ</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section id="enrollments" className="card p-6">
          <h2 className="mb-4 text-xl font-bold">منح الوصول لدورة مدفوعة</h2>
          <ActionForm action={grantAccess} submit="منح الوصول" className="mb-8 grid gap-3">
            <Field label="بريد الطالب" name="email" type="email" dir="ltr" required />
            <div>
              <label htmlFor="courseId" className="label">الدورة</label>
              <select id="courseId" name="courseId" required className="field">
                {courses.filter((c) => c.price > 0).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </ActionForm>
          <h2 className="mb-4 text-xl font-bold">آخر التسجيلات</h2>
          {enrollments.length ? (
            <ul className="grid gap-2 text-sm">{enrollments.map((e) => <li key={e.id} className="flex justify-between gap-3"><span>{e.user.name} ← {e.course.title}</span><span className="text-xs text-muted">{fmt.format(e.createdAt)}</span></li>)}</ul>
          ) : <p className="text-sm text-muted">لا توجد تسجيلات بعد.</p>}
        </section>
        <section id="messages" className="card p-6">
          <h2 className="mb-4 text-xl font-bold">رسائل التواصل</h2>
          {messages.length ? (
            <ul className="grid gap-4 text-sm">{messages.map((m) => (
              <li key={m.id} className="border-b border-line pb-3 last:border-0">
                <p className="font-semibold">{m.name} <span dir="ltr" className="font-normal text-muted">{m.email}</span></p>
                <p className="mt-1 whitespace-pre-line" dir="auto">{m.message}</p>
                <p className="mt-1 text-xs text-muted">{fmt.format(m.createdAt)}</p>
              </li>
            ))}</ul>
          ) : <p className="text-sm text-muted">لا توجد رسائل.</p>}
        </section>
      </div>
    </div>
  );
}
