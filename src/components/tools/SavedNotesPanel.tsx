"use client";

import { useMemo } from "react";
import { useNotes } from "@/hooks/useNotes";
import { downloadMarkdown } from "@/lib/utils/export";
import { Trash2, Download, NotebookPen } from "lucide-react";

interface SavedNotesPanelProps {
  chapterSlug: string;
  chapterTitle: string;
}

export function SavedNotesPanel({ chapterSlug, chapterTitle }: SavedNotesPanelProps) {
  const { notes, removeNote } = useNotes();
  const chapterNotes = useMemo(
    () => notes.filter((n) => n.chapter === chapterSlug),
    [notes, chapterSlug],
  );

  const exportAll = () => {
    const md = [
      `# Saved notes — ${chapterTitle}`,
      "",
      ...chapterNotes.map(
        (n) =>
          `## ${n.section}\n\n${n.text}\n\n---\n\n_${new Date(n.at).toLocaleString()}_`,
      ),
    ].join("\n");
    downloadMarkdown(`${chapterSlug}-notes`, md);
  };

  if (chapterNotes.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-foreground/50">
        <NotebookPen className="h-8 w-8 text-foreground/25" />
        <p className="text-sm">No saved notes in this chapter yet.</p>
        <p className="text-xs">
          Hover any paragraph and press <strong>Save note</strong>, or use the Note Generator.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs text-foreground/55">{chapterNotes.length} saved notes</span>
        <button
          onClick={exportAll}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow shadow-orange-500/30 transition hover:brightness-110"
        >
          <Download className="h-3.5 w-3.5" /> Export .md
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 pt-0">
        {chapterNotes.map((n) => (
          <div key={n.id} className="rounded-2xl border border-white/40 bg-white/50 p-3 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs font-semibold text-orange-600 dark:text-orange-400">{n.section}</span>
              <button onClick={() => removeNote(n.id)} className="shrink-0 rounded-md p-1 text-foreground/40 transition hover:text-rose-500" aria-label="Delete note">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{n.text}</p>
            <p className="mt-1.5 text-[10px] text-foreground/40">{new Date(n.at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
