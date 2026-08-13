"use client";

import { useState } from "react";
import { ai } from "@/lib/client/ai";
import type { NoteKind, NoteResponse } from "@/lib/ai/types";
import { useProgress } from "@/store/progress";
import { GlassCard, Spinner } from "@/components/ui/GlassCard";
import { downloadMarkdown } from "@/lib/utils/export";
import { Download, FileText, ListChecks, NotepadText, Sparkles, StickyNote } from "lucide-react";

const KINDS: { kind: NoteKind; label: string; icon: React.ReactNode }[] = [
  { kind: "smart", label: "Smart Notes", icon: <NotepadText className="h-4 w-4" /> },
  { kind: "keypoints", label: "Key Points", icon: <ListChecks className="h-4 w-4" /> },
  { kind: "cheatsheet", label: "Cheat Sheet", icon: <FileText className="h-4 w-4" /> },
  { kind: "flashcards", label: "Flashcards", icon: <StickyNote className="h-4 w-4" /> },
];

interface NotesPanelProps {
  chapterSlug: string;
  sectionTitle: string;
  text: string;
}

export function NotesPanel({ chapterSlug, sectionTitle, text }: NotesPanelProps) {
  const [kind, setKind] = useState<NoteKind>("smart");
  const [result, setResult] = useState<NoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { recordNote } = useProgress();

  const exportMd = () => {
    if (!result) return;
    const md = [
      `# ${result.title}`,
      "",
      ...result.sections.map((s) => `## ${s.heading}\n\n${s.body}`),
      ...(result.cards
        ? ["", "## Flashcard fronts", "", ...result.cards.map((c) => `- ${c.front}`)]
        : []),
    ].join("\n");
    downloadMarkdown(`${sectionTitle.replace(/\s+/g, "-").toLowerCase()}-${kind}`, md);
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await ai.notes(text, kind);
      setResult(res);
      recordNote(chapterSlug);
    } catch {
      setError("Could not generate notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <h3 className="font-display text-base font-semibold text-foreground">AI Note Generator</h3>
      <p className="mt-1 text-xs text-foreground/55">
        One click creates study material from <span className="font-medium text-orange-600 dark:text-orange-400">{sectionTitle}</span>.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            onClick={() => setKind(k.kind)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
              kind === k.kind
                ? "border-orange-400/60 bg-orange-50 text-orange-700 shadow-sm dark:bg-orange-400/10 dark:text-orange-300"
                : "border-white/40 bg-white/50 text-foreground/65 hover:bg-white/80 dark:border-white/10 dark:bg-white/5"
            }`}
          >
            {k.icon}
            {k.label}
          </button>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Generating…" : `Generate ${kind === "smart" ? "Smart Notes" : kind === "keypoints" ? "Key Points" : kind === "cheatsheet" ? "Cheat Sheet" : "Flashcards"}`}
      </button>

      {error && <p className="mt-3 text-xs text-rose-500">{error}</p>}

      {result && (
        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">{result.title}</h4>
            <div className="flex items-center gap-2">
              <button onClick={exportMd} className="flex items-center gap-1 rounded-lg border border-orange-300/50 bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300">
                <Download className="h-3 w-3" /> .md
              </button>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-400/15 dark:text-orange-300">
                {result.mode === "online" ? result.provider : "offline demo"}
              </span>
            </div>
          </div>
          {result.sections.map((s, i) => (
            <GlassCard key={i} className="p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400">{s.heading}</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/80">{s.body}</p>
            </GlassCard>
          ))}
          {result.cards && (
            <GlassCard className="p-3">
              <div className="text-xs font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                Flashcard fronts
              </div>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-foreground/80">
                {result.cards.map((c, i) => (
                  <li key={i}>{c.front}</li>
                ))}
              </ul>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
