"use client";
import { useId, useRef } from "react";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { Icon } from "./Icon";

/** Opens a short order form; submitting it sends the order to the site's WhatsApp. */
// ponytail: no Order table or payment; orders live in WhatsApp. Add a DB record + admin enroll when volume needs tracking.
export function BuyButton({ title, price, className = "", children }: { title: string; price: string; className?: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const text = [
      "طلب شراء دورة 🛒",
      `الدورة: ${title}`,
      `السعر: ${price}`,
      `الاسم: ${d.get("name")}`,
      `الجوال: ${d.get("phone")}`,
      d.get("email") && `البريد: ${d.get("email")}`,
      d.get("notes") && `ملاحظات: ${d.get("notes")}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    ref.current?.close();
    e.currentTarget.reset();
  }

  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className={className} aria-label={children ? undefined : `شراء ${title}`}>
        {children ?? <Icon name="cart" className="size-6" />}
      </button>
      <dialog ref={ref} aria-labelledby={`${id}-h`} className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-[var(--radius-card)] p-0 backdrop:bg-ink/50">
        <form onSubmit={send} className="grid gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={`${id}-h`} className="text-xl font-bold">طلب شراء الدورة</h2>
              <p className="mt-1 text-sm text-muted">{title} — <span className="font-semibold text-navy">{price}</span></p>
            </div>
            <button type="button" onClick={() => ref.current?.close()} className="btn-ghost px-2.5" aria-label="إغلاق"><Icon name="close" className="size-4" /></button>
          </div>
          <div><label htmlFor={`${id}-name`} className="label">الاسم الكامل</label><input id={`${id}-name`} name="name" required maxLength={80} autoComplete="name" className="field" /></div>
          <div><label htmlFor={`${id}-phone`} className="label">رقم الجوال</label><input id={`${id}-phone`} name="phone" type="tel" dir="ltr" required pattern="[0-9+\s\-]{9,16}" placeholder="05xxxxxxxx" autoComplete="tel" className="field text-end" /></div>
          <div><label htmlFor={`${id}-email`} className="label">البريد الإلكتروني <span className="font-normal text-muted">(اختياري)</span></label><input id={`${id}-email`} name="email" type="email" dir="ltr" autoComplete="email" className="field text-end" /></div>
          <div><label htmlFor={`${id}-notes`} className="label">ملاحظات <span className="font-normal text-muted">(اختياري)</span></label><textarea id={`${id}-notes`} name="notes" rows={2} maxLength={300} className="field" /></div>
          <button className="btn-navy py-3 text-base">إرسال الطلب عبر واتساب</button>
          <p className="text-center text-xs text-muted">سيفتح واتساب برسالة جاهزة، اضغط «إرسال» لإتمام الطلب وسنتواصل معك لتأكيد الدفع.</p>
        </form>
      </dialog>
    </>
  );
}
