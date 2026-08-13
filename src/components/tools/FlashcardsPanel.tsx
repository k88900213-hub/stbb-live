"use client";

import { useState } from "react";
import { ai } from "@/lib/client/ai";
import { useProgress } from "@/store/progress";
import { Spinner } from "@/components/ui/GlassCard";
import { FlipVertical, Sparkles } from "lucide-react";

interface FlashcardsPanelProps {
  chapterSlug: string;
  sectionTitle: string;
  text: string;
}

interface Card {
  front: string;
  back: string;
}

export function FlashcardsPanel({ chapterSlug, sectionTitle, text }: FlashcardsPanelProps) {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const { recordFlashcard } = useProgress();

  const generate = async () => {
    setLoading(true);
    setCards(null);
    setFlipped(false);
    setIndex(0);
    setReviewed(0);
    try {
      const res = await ai.notes(text, "flashcards");
      setCards(res.cards?.length ? res.cards : []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const flip = () => setFlipped((f) => !f);

  const mark = () => {
    recordFlashcard(chapterSlug);
    setReviewed((r) => r + 1);
    setFlipped(false);
    setIndex((i) => (i + 1) % (cards?.length ?? 1));
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-foreground/60">
        <Spinner className="h-6 w-6" />
        <p className="text-sm">Building flashcards…</p>
      </div>
    );
  }

  if (!cards) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold text-foreground">AI Flashcards</h3>
        <p className="mt-1 text-xs text-foreground/55">
          Auto-generated from <span className="font-medium text-orange-600 dark:text-orange-400">{sectionTitle}</span>. Tap to flip.
        </p>
        <button
          onClick={generate}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110"
        >
          <Sparkles className="h-4 w-4" /> Generate flashcards
        </button>
        <p className="mt-3 text-center text-xs text-foreground/40">
          Spaced repetition builds long-term memory. Reviewed cards count toward your mastery score.
        </p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-foreground/60">No flashcards could be generated for this section.</p>
        <button onClick={generate} className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110">
          Try again
        </button>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-foreground">AI Flashcards</h3>
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-400/15 dark:text-orange-300">
          {reviewed}/{cards.length} reviewed
        </span>
      </div>

      <div className="mt-4 flex flex-1 items-center">
        <button onClick={flip} className="group w-full" aria-label="Flip card">
          <div className="relative h-56 w-full [perspective:1000px]">
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-orange-200/60 bg-gradient-to-br from-white/80 via-orange-50/50 to-amber-50/60 p-6 text-center shadow-xl transition-transform duration-500 [transform-style:preserve-3d] dark:border-orange-400/20 dark:from-white/10 dark:via-orange-400/5 dark:to-transparent ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-orange-500/70">
                {flipped ? "Back" : "Front"}
              </div>
              <p className="text-lg font-medium leading-relaxed text-foreground [backface-visibility:hidden]">
                {flipped ? card.back : card.front}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-foreground/40">
                <FlipVertical className="h-3.5 w-3.5" /> Tap to flip
              </span>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => {
            setFlipped(false);
            setIndex((i) => (i - 1 + cards.length) % cards.length);
          }}
          className="flex-1 rounded-xl border border-white/40 bg-white/50 px-4 py-2 text-sm font-medium text-foreground/70 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5"
        >
          Prev
        </button>
        <button onClick={mark} className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110">
          Got it → Next
        </button>
      </div>
    </div>
  );
}
