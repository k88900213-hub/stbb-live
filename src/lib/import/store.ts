"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Chapter } from "@/lib/content/types";

export type ImportSource = "text" | "image" | "pdf";

export interface ImportedEntry {
  id: string;
  chapter: Chapter;
  info: {
    sourceType: ImportSource;
    title: string;
    createdAt: number;
    wordCount: number;
  };
}

export function useImportedLibrary() {
  const [entries, setEntries] = useLocalStorage<ImportedEntry[]>("ns-imported", []);

  const addEntry = (chapter: Chapter, sourceType: ImportSource, wordCount: number) => {
    const entry: ImportedEntry = {
      id: chapter.slug,
      chapter,
      info: {
        sourceType,
        title: chapter.title,
        createdAt: Date.now(),
        wordCount,
      },
    };
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== entry.id);
      return [entry, ...next];
    });
    return entry;
  };

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));
  const getEntry = (id: string) => entries.find((e) => e.id === id);

  return { entries, addEntry, removeEntry, getEntry };
}
