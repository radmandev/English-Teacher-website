"use client";
import { useId, useState, useTransition } from "react";
import { submitQuiz } from "@/lib/actions";
import { grade, type Answer, type Question } from "@/lib/grading";
import { MathText } from "./MathText";
import { Icon } from "./Icon";

const TYPE_LABEL: Record<Question["type"], string> = {
  mcq: "اختيار من متعدد", numeric: "إجابة عددية", fill: "أكمل الفراغ", match: "مطابقة", order: "ترتيب الجملة",
};

/** canSave: the learner is enrolled, so the final score is graded again and stored on the server. */
export function Exercise({ questions, lessonId, canSave = false }: { questions: Question[]; lessonId?: string; canSave?: boolean }) {
  const [answers, setAnswers] = useState<Answer[]>(() => questions.map(() => null));
  const [checked, setChecked] = useState<boolean[]>(() => questions.map(() => false));
  const [saved, setSaved] = useState<{ score: number; total: number } | null>(null);
  const [round, setRound] = useState(0); // remounts inputs on retry
  const [pending, start] = useTransition();

  const set = (i: number, a: Answer) => setAnswers((xs) => xs.map((x, j) => (j === i ? a : x)));
  const correct = questions.filter((q, i) => checked[i] && grade(q, answers[i])).length;
  const allChecked = checked.every(Boolean);

  function retry() {
    setAnswers(questions.map(() => null));
    setChecked(questions.map(() => false));
    setSaved(null);
    setRound((r) => r + 1);
  }

  return (
    <div className="grid gap-5" key={round}>
      {questions.map((q, i) => (
        <QuestionCard key={i} n={i + 1} q={q} answer={answers[i]} onAnswer={(a) => set(i, a)} checked={checked[i]}
          onCheck={() => setChecked((xs) => xs.map((x, j) => (j === i ? true : x)))} />
      ))}

      <div className="card flex flex-wrap items-center justify-between gap-4 p-5" aria-live="polite">
        <div>
          <p className="text-sm text-muted">النتيجة</p>
          <p className="text-2xl font-bold text-navy">{correct} من {questions.length}</p>
          {saved && <p className="mt-1 text-sm font-medium text-good">تم حفظ نتيجتك ({saved.score} من {saved.total}).</p>}
          {allChecked && !canSave && <p className="mt-1 text-sm text-muted">سجّل في الدورة لحفظ نتائجك.</p>}
        </div>
        <div className="flex gap-2">
          {allChecked && canSave && lessonId && !saved && (
            <button className="btn-primary" disabled={pending} onClick={() => start(async () => setSaved(await submitQuiz(lessonId, answers)))}>
              {pending ? "جارٍ الحفظ…" : "حفظ النتيجة"}
            </button>
          )}
          <button className="btn-ghost" onClick={retry}>إعادة المحاولة</button>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ n, q, answer, onAnswer, checked, onCheck }: {
  n: number; q: Question; answer: Answer; onAnswer: (a: Answer) => void; checked: boolean; onCheck: () => void;
}) {
  const [hint, setHint] = useState(false);
  const ok = checked && grade(q, answer);
  const empty = answer === null || answer === "" || (Array.isArray(answer) && (answer.length === 0 || answer.some((x) => !x)));

  return (
    <fieldset className={`card p-5 ${checked ? (ok ? "border-good/50" : "border-bad/40") : ""}`} disabled={checked}>
      <legend className="sr-only">السؤال {n}</legend>
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted">
        <span className="grid size-7 place-items-center rounded-full bg-blue-soft text-sm text-navy">{n}</span>
        {TYPE_LABEL[q.type]}
      </div>
      {q.type === "mcq" && q.passage && (
        <blockquote dir="auto" className="mb-4 whitespace-pre-line rounded-xl bg-paper p-4 leading-7">{q.passage}</blockquote>
      )}
      {q.type === "mcq" && q.speak && <SpeakButton text={q.speak} />}
      <p dir="auto" className="mb-4 text-lg font-semibold text-navy"><MathText text={q.prompt} /></p>

      <Input q={q} answer={answer} onAnswer={onAnswer} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!checked && <button type="button" className="btn-navy" disabled={empty} onClick={onCheck}>تحقّق</button>}
        {!checked && q.hint && (
          <button type="button" className="btn-ghost" aria-expanded={hint} onClick={() => setHint(!hint)}><Icon name="bulb" className="size-4" />تلميح</button>
        )}
      </div>
      {hint && !checked && q.hint && <p className="mt-3 rounded-xl bg-sun-soft px-4 py-3 text-sm"><MathText text={q.hint} /></p>}

      {checked && (
        <div className="mt-4 grid gap-3">
          <p className={`flex items-center gap-2 font-semibold ${ok ? "text-good" : "text-bad"}`}>
            <Icon name={ok ? "check" : "close"} />
            {ok ? "إجابة صحيحة، أحسنت!" : <>إجابة غير صحيحة. الإجابة الصحيحة: <span dir="auto"><MathText text={correctText(q)} /></span></>}
          </p>
          {q.steps && (
            <details className="rounded-xl bg-paper p-4">
              <summary className="cursor-pointer font-semibold text-navy">الحل خطوة بخطوة</summary>
              <ol className="mt-3 grid list-decimal gap-2 ps-5">{q.steps.map((s, i) => <li key={i}><MathText text={s} /></li>)}</ol>
            </details>
          )}
        </div>
      )}
    </fieldset>
  );
}

function correctText(q: Question) {
  switch (q.type) {
    case "mcq": return q.choices[q.answer];
    case "numeric": return String(Math.round(q.answer * 1000) / 1000);
    case "fill": return q.answers[0];
    case "match": return q.pairs.map(([l, r]) => `${l} = ${r}`).join("، ");
    case "order": return q.answer;
  }
}

function Input({ q, answer, onAnswer }: { q: Question; answer: Answer; onAnswer: (a: Answer) => void }) {
  const id = useId();
  switch (q.type) {
    case "mcq":
      return (
        <div className="grid gap-2" role="radiogroup">
          {q.choices.map((c, i) => (
            <label key={i} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${answer === i ? "border-blue bg-blue-soft" : "border-line hover:border-blue/50"}`}>
              <input type="radio" name={id} checked={answer === i} onChange={() => onAnswer(i)} className="size-4 accent-blue" />
              <span dir="auto"><MathText text={c} /></span>
            </label>
          ))}
        </div>
      );
    case "numeric":
      return (
        <label className="block max-w-xs">
          <span className="label">إجابتك</span>
          <input dir="ltr" inputMode="decimal" className="field text-start" value={(answer as string) ?? ""} onChange={(e) => onAnswer(e.target.value)} placeholder="مثال: 12 أو 3/4" />
        </label>
      );
    case "fill": {
      const [before, after] = q.sentence.split("___");
      return (
        <p dir="ltr" lang="en" className="flex flex-wrap items-center gap-2 text-lg">
          <span>{before}</span>
          <input aria-label="الكلمة الناقصة" className="field w-36 py-1.5" value={(answer as string) ?? ""} onChange={(e) => onAnswer(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} />
          <span>{after}</span>
        </p>
      );
    }
    case "match": {
      const options = q.pairs.map(([, r]) => r).sort((a, b) => a.localeCompare(b, "ar"));
      const cur = (answer as string[]) ?? q.pairs.map(() => "");
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {q.pairs.map(([l], i) => (
            <label key={l} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-2">
              <span lang="en" className="font-semibold">{l}</span>
              <select className="field w-40 py-1.5" value={cur[i]} onChange={(e) => onAnswer(cur.map((x, j) => (j === i ? e.target.value : x)))}>
                <option value="">اختر…</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>
      );
    }
    case "order": {
      const built = (answer as string[]) ?? [];
      const used = [...built];
      const bank = q.words.filter((w) => { const k = used.indexOf(w); if (k === -1) return true; used.splice(k, 1); return false; });
      return (
        <div className="grid gap-3">
          <div dir="ltr" lang="en" className="flex min-h-14 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-line p-3" aria-label="جملتك">
            {built.length === 0 && <span dir="rtl" className="text-sm text-muted">اضغط على الكلمات بالترتيب الصحيح</span>}
            {built.map((w, i) => (
              <button type="button" key={i} className="chip bg-navy px-3 py-1.5 text-sm text-white" onClick={() => onAnswer(built.filter((_, j) => j !== i))} aria-label={`إزالة ${w}`}>{w}</button>
            ))}
          </div>
          <div dir="ltr" lang="en" className="flex flex-wrap gap-2">
            {bank.map((w, i) => (
              <button type="button" key={i} className="chip border border-line bg-white px-3 py-1.5 text-sm text-navy hover:border-blue" onClick={() => onAnswer([...built, w])}>{w}</button>
            ))}
          </div>
        </div>
      );
    }
  }
}

function SpeakButton({ text }: { text: string }) {
  const speak = () => {
    if (!("speechSynthesis" in window)) return alert("متصفحك لا يدعم تشغيل الصوت.");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.8;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };
  return (
    <button type="button" onClick={speak} className="btn-primary mb-4">
      <Icon name="volume" />استمع
    </button>
  );
}
