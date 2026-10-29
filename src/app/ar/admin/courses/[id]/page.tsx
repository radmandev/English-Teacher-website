import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveCourse } from "@/lib/actions";
import { BILLING, COURSE_TYPES, DIFFICULTIES, LEVELS, STATUSES } from "@/lib/constants";
import { ActionForm, Field } from "@/components/ActionForm";

export const metadata: Metadata = { title: "تعديل دورة", robots: { index: false } };

function Select({ label, name, value, options }: { label: string; name: string; value: string; options: Record<string, string> }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <select id={name} name={name} defaultValue={value} className="field">
        {Object.entries(options).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

// ponytail: edits course metadata only. Section/lesson/exercise editors and file uploads come next (see README).
export default async function EditCourse({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const [c, instructors] = await Promise.all([
    db.course.findUnique({ where: { id } }),
    db.user.findMany({ where: { role: "INSTRUCTOR" }, select: { id: true, name: true } }),
  ]);
  if (!c) notFound();
  return (
    <div className="container-x max-w-3xl py-10">
      <Link href="/ar/admin" className="text-sm text-muted hover:text-navy">← لوحة الإدارة</Link>
      <h1 className="mt-2 text-3xl font-bold">{c.title}</h1>
      <p className="mt-1 text-sm text-muted"><Link href={`/ar/courses/${c.slug}`} className="text-blue-ink hover:underline">/ar/courses/{c.slug}</Link></p>
      <div className="card mt-6 p-6">
        <ActionForm action={saveCourse.bind(null, c.id)} submit="حفظ الدورة">
          <Field label="العنوان" name="title" defaultValue={c.title} required />
          <Field label="العنوان الفرعي" name="subtitle" defaultValue={c.subtitle} />
          <div>
            <label htmlFor="description" className="label">الوصف</label>
            <textarea id="description" name="description" defaultValue={c.description} rows={4} className="field" required />
          </div>
          <Field label="كلمات مفتاحية للبحث (مفصولة بمسافات)" name="keywords" defaultValue={c.keywords} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="الحالة" name="status" value={c.status} options={STATUSES} />
            <Select label="المرحلة" name="level" value={c.level} options={LEVELS} />
            <Select label="المستوى" name="difficulty" value={c.difficulty} options={DIFFICULTIES} />
            <Select label="نوع الدورة" name="type" value={c.type} options={COURSE_TYPES} />
            <Field label="السعر (ر.س، 0 = مجانية)" name="price" type="number" min={0} step="0.01" defaultValue={c.price / 100} />
            <Field label="سعر العرض (اختياري)" name="salePrice" type="number" min={0} step="0.01" defaultValue={c.salePrice !== null ? c.salePrice / 100 : ""} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="طريقة احتساب السعر" name="billing" value={c.billing} options={BILLING} />
            <Field label="مدة الباقة بالأشهر (للباقة الكاملة، اختياري)" name="durationMonths" type="number" min={1} max={24} defaultValue={c.durationMonths ?? ""} />
            <Field label="أيام الدراسة في الأسبوع" name="daysPerWeek" type="number" min={1} max={7} defaultValue={c.daysPerWeek ?? ""} />
            <Field label="ساعات الحصة اليومية (مثال 1.5)" name="hoursPerDay" type="number" min={0.25} max={12} step="0.25" defaultValue={c.hoursPerDay ?? ""} />
          </div>
          <Select label="المعلّم" name="instructorId" value={c.instructorId ?? ""} options={{ "": "بدون معلّم", ...Object.fromEntries(instructors.map((i) => [i.id, i.name])) }} />
          <Field label="رابط صورة الغلاف (https، اختياري)" name="thumbnailUrl" type="url" dir="ltr" defaultValue={c.thumbnailUrl ?? ""} />
        </ActionForm>
      </div>
    </div>
  );
}
