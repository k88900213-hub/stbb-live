"use client";

import { useMemo } from "react";
import katex from "katex";

export default function FormulaInline({ tex }: { tex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { throwOnError: false, displayMode: false });
    } catch {
      return tex;
    }
  }, [tex]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
