export const SITE_NAME = "فَهْم | Fahm";
// Purchase requests go to this WhatsApp number (Saudi 0561190934 in international format).
export const WHATSAPP_NUMBER = "966561190934";
// Trailing slash stripped so `${SITE_URL}/ar` never becomes `//ar`.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const LEVELS = { PRIMARY: "المرحلة الابتدائية", MIDDLE: "المرحلة المتوسطة", SECONDARY: "المرحلة الثانوية", ALL: "لجميع المستويات" } as const;
export const DIFFICULTIES = { BEGINNER: "مبتدئ", INTERMEDIATE: "متوسط", ADVANCED: "متقدم" } as const;
export const COURSE_TYPES = { COURSE: "دورة شاملة", REVIEW: "مراجعة", EXAM_PREP: "تحضير للاختبارات", TUTORING: "دروس خصوصية" } as const;
export const STATUSES = { DRAFT: "مسودة", PUBLISHED: "منشورة", ARCHIVED: "مؤرشفة" } as const;
export const ROLES = { STUDENT: "طالب", INSTRUCTOR: "معلّم", ADMIN: "مدير" } as const;
export const BILLING = { ONCE: "باقة كاملة", MONTHLY: "اشتراك شهري", HOURLY: "بالساعة" } as const;
export const SORTS = { popular: "الأكثر شيوعًا", rating: "الأعلى تقييمًا", newest: "الأحدث", price: "السعر من الأقل إلى الأعلى" } as const;

export type Level = keyof typeof LEVELS;
export type Role = keyof typeof ROLES;

export function formatMonths(n: number) {
  return n === 1 ? "شهر" : n === 2 ? "شهران" : n <= 10 ? `${n} أشهر` : `${n} شهرًا`;
}

/** "1,500 ر.س / 3 أشهر", "600 ر.س / شهريًا", "25 ر.س / الساعة". */
export function formatPrice(halalas: number, billing = "ONCE", months?: number | null) {
  if (halalas === 0) return "مجانية";
  const base = `${(halalas / 100).toLocaleString("ar-SA-u-nu-latn")} ر.س`;
  if (billing === "MONTHLY") return `${base} / شهريًا`;
  if (billing === "HOURLY") return `${base} / الساعة`;
  return months ? `${base} / ${formatMonths(months)}` : base;
}

export function formatHours(h: number) {
  if (h === 0.5) return "نصف ساعة";
  if (h === 1) return "ساعة";
  if (h === 1.5) return "ساعة ونصف";
  if (h === 2) return "ساعتان";
  return h > 2 && h <= 10 && Number.isInteger(h) ? `${h} ساعات` : `${h} ساعة`;
}

const WEEKS_PER_MONTH = 4; // ponytail: flat 4 weeks/month for totals; matches how the packages are priced

/** Class schedule of a package, or null when it isn't set (e.g. hourly bookings). */
export function schedule(c: { daysPerWeek: number | null; hoursPerDay: number | null; durationMonths: number | null; billing: string }) {
  if (!c.daysPerWeek || !c.hoursPerDay) return null;
  const monthly = c.daysPerWeek * c.hoursPerDay * WEEKS_PER_MONTH;
  const months = c.billing === "MONTHLY" ? 1 : c.durationMonths;
  return {
    days: c.daysPerWeek === 2 ? "يومان في الأسبوع" : `${c.daysPerWeek} أيام في الأسبوع`,
    perDay: `${formatHours(c.hoursPerDay)} يوميًا`,
    total: months ? `${monthly * months} ساعة ${c.billing === "MONTHLY" ? "شهريًا" : `خلال ${months === 2 ? "شهرين" : formatMonths(months)}`}` : null,
    short: `${c.daysPerWeek} أيام · ${c.hoursPerDay} س`,
  };
}

export function formatMinutes(min: number) {
  if (min < 60) return `${min} دقيقة`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} س ${m} د` : `${h} ساعة`;
}

export function parseJson<T>(s: string | null | undefined, fallback: T): T {
  try { return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}
