import { formatPrice } from "@/lib/constants";
import { Icon } from "./Icon";

export function SubjectBadge({ slug, name }: { slug: string; name: string }) {
  return <span className={`chip ${slug === "english" ? "bg-sun text-navy-deep" : "bg-white text-navy"} shadow-sm`}>{name}</span>;
}

export function DemoBadge() {
  return <span className="chip bg-ink/80 text-white" title="محتوى تجريبي لأغراض العرض">تجريبي</span>;
}

export function Price({ price, salePrice, billing, months }: { price: number; salePrice: number | null; billing?: string; months?: number | null }) {
  if (price === 0) return <span className="font-bold text-good">مجانية</span>;
  if (salePrice !== null && salePrice < price)
    return (
      <span className="flex items-baseline gap-2">
        <span className="font-bold text-navy">{formatPrice(salePrice, billing, months)}</span>
        <s className="text-xs text-muted" aria-label={`السعر قبل الخصم ${formatPrice(price)}`}>{formatPrice(price)}</s>
      </span>
    );
  return <span className="font-bold text-navy">{formatPrice(price, billing, months)}</span>;
}

export function Rating({ value, count, className = "" }: { value: number; count: number; className?: string }) {
  return (
    <p className={`flex items-center gap-1 text-sm ${className}`}>
      <Icon name="star" filled className="size-4 text-[#C9A04A]" />
      <span className="font-bold text-navy">{value.toFixed(1)}</span>
      <span className="text-muted">({count} {count === 1 ? "تقييم" : "تقييمات"})</span>
    </p>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-xs font-semibold text-navy"><span>تقدّمك</span><span>{value}%</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-blue-soft" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="نسبة إكمال الدورة">
        <div className="h-full rounded-full bg-blue" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
