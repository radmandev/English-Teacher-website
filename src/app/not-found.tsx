import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p dir="ltr" className="text-7xl font-bold text-blue">404</p>
        <h1 className="mt-4 text-2xl font-bold">لم نجد هذه الصفحة</h1>
        <p className="mt-2 text-muted">ربما تغيّر الرابط أو حُذفت الصفحة.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/ar" className="btn-navy">الرئيسية</Link>
          <Link href="/ar/courses" className="btn-ghost">الدورات</Link>
        </div>
      </div>
    </div>
  );
}
