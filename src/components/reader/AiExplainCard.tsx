"use client";

import { useState } from "react";
import type { ExplainResponse } from "@/lib/ai/types";
import { BookOpen, CheckCircle, Lightbulb, MessageCircleQuestion, Sparkles } from "lucide-react";

export function AiExplainCard({ result }: { result: ExplainResponse }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-orange-300/40 bg-gradient-to-br from-orange-50/80 via-white/70 to-amber-50/60 p-4 shadow-inner dark:border-orange-400/20 dark:from-orange-400/10 dark:via-white/5 dark:to-transparent">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
          <Sparkles className="h-3 w-3" /> AI Explanation
        </span>
        <span className="text-[11px] text-foreground/40">
          {result.mode === "online" ? result.provider : "offline demo engine"}
        </span>
      </div>

      <p className="text-[15px] leading-relaxed text-foreground/90">{result.summary}</p>

      {showAll && (
        <>
          <div>
            <SectionTitle icon={<BookOpen className="h-3.5 w-3.5" />}>Key points</SectionTitle>
            <ul className="ml-4 mt-1 list-disc space-y-1 text-sm text-foreground/75">
              {result.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionTitle icon={<Lightbulb className="h-3.5 w-3.5" />}>Real example</SectionTitle>
            <p className="mt-1 text-sm text-foreground/75">{result.example}</p>
          </div>
          <div>
            <SectionTitle icon={<CheckCircle className="h-3.5 w-3.5" />}>Analogy</SectionTitle>
            <p className="mt-1 text-sm text-foreground/75">{result.analogy}</p>
          </div>
          <div>
            <SectionTitle icon={<MessageCircleQuestion className="h-3.5 w-3.5" />}>Ask yourself</SectionTitle>
            <p className="mt-1 text-sm italic text-foreground/75">{result.question}</p>
            <p className="mt-1 text-sm text-foreground/60">Self-check: {result.checkQuestion}</p>
          </div>
        </>
      )}

      <button
        onClick={() => setShowAll((s) => !s)}
        className="text-xs font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
      >
        {showAll ? "Collapse" : "Show key points, example & self-check"}
      </button>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
      {icon}
      {children}
    </span>
  );
}
