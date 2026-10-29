import katex from "katex";

/** Renders text where $...$ segments are LaTeX. Safe: KaTeX escapes input, plain text goes through React. */
export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.startsWith("$") && p.endsWith("$") && p.length > 2 ? (
          <span key={i} dir="ltr" dangerouslySetInnerHTML={{ __html: katex.renderToString(p.slice(1, -1), { throwOnError: false, strict: "ignore" }) }} />
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

export function Paragraphs({ text }: { text: string }) {
  return (
    <div className="prose-fahm text-[17px]">
      {text.split(/\n{2,}/).map((p, i) => <p key={i}><MathText text={p} /></p>)}
    </div>
  );
}
