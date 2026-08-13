"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface ChapterProgress {
  readMs: number;
  viewedBlocks: string[];
  quizScores: { pct: number; at: number }[];
  notesCreated: number;
  flashcardsReviewed: number;
  asks: number;
}

export interface ProgressState {
  [chapterSlug: string]: ChapterProgress;
}

export interface StudySnapshot {
  totalReadMinutes: number;
  focusLevel: number;
  conceptsMastered: number;
  weakTopics: string[];
  avgQuizScore: number;
}

interface ProgressContextValue {
  progress: ProgressState;
  recordView: (chapter: string, blockId: string) => void;
  recordQuiz: (chapter: string, pct: number) => void;
  recordNote: (chapter: string) => void;
  recordFlashcard: (chapter: string) => void;
  recordAsk: (chapter: string) => void;
  getChapter: (chapter: string) => ChapterProgress;
  snapshot: StudySnapshot;
  setActiveChapter: (chapter: string | null) => void;
  reset: () => void;
}

const emptyChapter = (): ChapterProgress => ({
  readMs: 0,
  viewedBlocks: [],
  quizScores: [],
  notesCreated: 0,
  flashcardsReviewed: 0,
  asks: 0,
});

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress, reset] = useLocalStorage<ProgressState>("ns-progress", {});
  const [now, setNow] = useState(0);
  const activeChapter = useRef<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeChapter.current) return;
    const chapter = activeChapter.current;
    setProgress((prev) => ({
      ...prev,
      [chapter]: { ...(prev[chapter] ?? emptyChapter()), readMs: (prev[chapter]?.readMs ?? 0) + 1 },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const setActiveChapter = (chapter: string | null) => {
    activeChapter.current = chapter;
  };

  const recordView = useCallback((chapter: string, blockId: string) => {
    setProgress((prev) => {
      const ch = prev[chapter] ?? emptyChapter();
      if (ch.viewedBlocks.includes(blockId)) return prev;
      return { ...prev, [chapter]: { ...ch, viewedBlocks: [...ch.viewedBlocks, blockId] } };
    });
  }, [setProgress]);

  const recordQuiz = useCallback((chapter: string, pct: number) => {
    setProgress((prev) => {
      const ch = prev[chapter] ?? emptyChapter();
      return { ...prev, [chapter]: { ...ch, quizScores: [...ch.quizScores, { pct, at: Date.now() }].slice(-20) } };
    });
  }, [setProgress]);

  const bump = useCallback(
    (chapter: string, key: "notesCreated" | "flashcardsReviewed" | "asks") => {
      setProgress((prev) => {
        const ch = prev[chapter] ?? emptyChapter();
        return { ...prev, [chapter]: { ...ch, [key]: (ch[key] ?? 0) + 1 } };
      });
    },
    [setProgress],
  );

  const recordNote = useCallback((chapter: string) => bump(chapter, "notesCreated"), [bump]);
  const recordFlashcard = useCallback((chapter: string) => bump(chapter, "flashcardsReviewed"), [bump]);
  const recordAsk = useCallback((chapter: string) => bump(chapter, "asks"), [bump]);

  const getChapter = useCallback((chapter: string) => progress[chapter] ?? emptyChapter(), [progress]);

  const snapshot = useMemo<StudySnapshot>(() => {
    const entries = Object.entries(progress);
    const totalReadMs = entries.reduce((sum, [, p]) => sum + p.readMs, 0);
    const scores = entries.flatMap(([, p]) => p.quizScores.map((s) => s.pct));
    const avgQuizScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const conceptsMastered = entries.filter(([, p]) => {
      const score = p.quizScores.length
        ? p.quizScores[p.quizScores.length - 1].pct
        : 0;
      return score >= 70 || p.viewedBlocks.length >= 6;
    }).length;
    const weakTopics = entries
      .filter(([, p]) => {
        const score = p.quizScores.length
          ? p.quizScores[p.quizScores.length - 1].pct
          : 0;
        return p.viewedBlocks.length > 0 && score < 60;
      })
      .map(([slug]) => slug);
    const focusLevel = Math.min(
      100,
      Math.round(
        60 +
          Math.min(entries.length * 15, 25) +
          Math.min(totalReadMs / 1000 / 6, 15),
      ),
    );
    return {
      totalReadMinutes: Math.round(totalReadMs / 1000 / 60 * 10) / 10,
      focusLevel,
      conceptsMastered,
      weakTopics,
      avgQuizScore: Math.round(avgQuizScore),
    };
  }, [progress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        recordView,
        recordQuiz,
        recordNote,
        recordFlashcard,
        recordAsk,
        getChapter,
        snapshot,
        setActiveChapter,
        reset,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
