import { Fragment } from "react";
import dynamic from "next/dynamic";

const FormulaInline = dynamic(() => import("./FormulaInline"), { ssr: false });

/** Render a tiny safe subset of markdown: **bold**, *italic*, `code`, and $...$ inline LaTeX. */
export function RichText({ children }: { children: string }) {
  const tokens = splitInline(children);
  return <>{tokens.map((t, i) => <Fragment key={i}>{t}</Fragment>)}</>;
}

function splitInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const pattern = /(\*\*[\s\S]+?\*\*|\*[\s\S]+?\*|`[^`]+`|\$[^$]+\$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) out.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    const token = m[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      out.push(<strong key={key++} className="font-semibold text-foreground">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      out.push(<code key={key++} className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.9em] dark:bg-white/10">{token.slice(1, -1)}</code>);
    } else if (token.startsWith("$") && token.endsWith("$")) {
      out.push(<FormulaInline key={key++} tex={token.slice(1, -1)} />);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      out.push(<em key={key++} className="italic">{token.slice(1, -1)}</em>);
    }
    last = m.index + token.length;
  }
  if (last < text.length) out.push(<span key={key++}>{text.slice(last)}</span>);
  return out;
}
