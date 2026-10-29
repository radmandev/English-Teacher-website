import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { changePassword, logout, updateProfile } from "@/lib/actions";
import { ROLES } from "@/lib/constants";
import { ActionForm, Field } from "@/components/ActionForm";

export const metadata: Metadata = { title: "إعدادات الحساب", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireUser("/ar/account");
  return (
    <div className="container-x max-w-2xl py-10">
      <h1 className="text-3xl font-bold">إعدادات الحساب</h1>
      <p className="mt-1 text-muted" dir="auto">{user.email} · {ROLES[user.role]}</p>
      <section className="card mt-8 p-6" aria-labelledby="p-h">
        <h2 id="p-h" className="mb-4 text-xl font-bold">الملف الشخصي</h2>
        <ActionForm action={updateProfile} submit="حفظ">
          <Field label="الاسم" name="name" defaultValue={user.name} required minLength={2} />
        </ActionForm>
      </section>
      <section className="card mt-6 p-6" aria-labelledby="pw-h">
        <h2 id="pw-h" className="mb-4 text-xl font-bold">تغيير كلمة المرور</h2>
        <ActionForm action={changePassword} submit="تغيير كلمة المرور">
          <Field label="كلمة المرور الحالية" name="current" type="password" autoComplete="current-password" dir="ltr" required />
          <Field label="كلمة المرور الجديدة" name="password" type="password" autoComplete="new-password" dir="ltr" required minLength={8} />
        </ActionForm>
      </section>
      <form action={logout} className="mt-6"><button className="btn-ghost text-bad">تسجيل الخروج</button></form>
    </div>
  );
}
