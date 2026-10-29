// Shared by the exercise UI (instant feedback) and the server action (recorded score).
type Base = { prompt: string; hint?: string; steps?: string[] };
export type Question = Base &
  (
    | { type: "mcq"; choices: string[]; answer: number; passage?: string; speak?: string }
    | { type: "numeric"; answer: number; tolerance?: number }
    | { type: "fill"; sentence: string; answers: string[] }
    | { type: "match"; pairs: [string, string][] }
    | { type: "order"; words: string[]; answer: string }
  );
export type Answer = number | string | string[] | null;

const norm = (s: string) =>
  s.toLowerCase().replace(/[’']/g, "'").replace(/[.!?،,]+$/g, "").replace(/\s+/g, " ").trim();

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d))).replace("٫", ".").replace(/\s/g, "");
  if (!s) return null;
  const frac = s.match(/^(-?\d+)\/(\d+)$/);
  if (frac) return Number(frac[2]) === 0 ? null : Number(frac[1]) / Number(frac[2]);
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function grade(q: Question, a: Answer): boolean {
  if (a === null || a === undefined) return false;
  switch (q.type) {
    case "mcq":
      return a === q.answer;
    case "numeric": {
      const n = typeof a === "number" ? a : parseNumber(String(a));
      return n !== null && Math.abs(n - q.answer) <= (q.tolerance ?? 1e-9);
    }
    case "fill":
      return typeof a === "string" && q.answers.some((x) => norm(x) === norm(a));
    case "match":
      return Array.isArray(a) && a.length === q.pairs.length && q.pairs.every(([, r], i) => a[i] === r);
    case "order":
      return Array.isArray(a) && norm(a.join(" ")) === norm(q.answer);
  }
}

export function score(questions: Question[], answers: Answer[]) {
  return questions.reduce((n, q, i) => n + (grade(q, answers[i] ?? null) ? 1 : 0), 0);
}
