"use client";

import { useMemo } from "react";
import katex from "katex";

export default function FormulaBlock({ tex }: { tex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { throwOnError: false, displayMode: true });
    } catch {
      return tex;
    }
  }, [tex]);
  return (
    <div
      className="overflow-x-auto rounded-xl border border-orange-200/50 bg-gradient-to-r from-orange-50/60 to-white/60 px-4 py-3 text-center dark:border-orange-400/20 dark:from-orange-400/5 dark:to-transparent [&_.katex]:text-[1.15rem]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
