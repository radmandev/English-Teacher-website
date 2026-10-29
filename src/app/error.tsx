"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <h1 className="text-2xl font-bold">حدث خطأ غير متوقع</h1>
        <p className="mt-2 text-muted">نعتذر عن ذلك. حاول مرة أخرى.</p>
        <button onClick={reset} className="btn-navy mt-6">إعادة المحاولة</button>
      </div>
    </div>
  );
}
