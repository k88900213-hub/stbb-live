"use client";

import { useState } from "react";
import { ai } from "@/lib/client/ai";
import type { QuizQuestion } from "@/lib/ai/types";
import { useProgress } from "@/store/progress";
import { GlassCard, Spinner } from "@/components/ui/GlassCard";
import { downloadMarkdown } from "@/lib/utils/export";
import { CheckCircle2, Download, RotateCcw, Sparkles, XCircle } from "lucide-react";

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

interface QuizPanelProps {
  chapterSlug: string;
  sectionTitle: string;
  text: string;
}

export function QuizPanel({ chapterSlug, sectionTitle, text }: QuizPanelProps) {
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("medium");
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { recordQuiz } = useProgress();

  const generate = async () => {
    setLoading(true);
    setDone(false);
    setSelected(null);
    setCurrent(0);
    setAnswers([]);
    try {
      const res = await ai.quiz(text, difficulty, 4);
      setQuestions(res.questions);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const pick = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setAnswers((prev) => [...prev, idx]);
    if (current + 1 >= (questions?.length ?? 0)) {
      const correct = [...answers, idx].filter((a, i) => a === questions?.[i]?.correctIndex).length;
      const total = questions?.length ?? 1;
      const pct = Math.round((correct / total) * 100);
      recordQuiz(chapterSlug, pct);
      setDone(true);
    }
  };

  const next = () => {
    setSelected(null);
    setCurrent((c) => c + 1);
  };

  const correctSoFar = questions
    ? answers.filter((a, i) => a === questions[i]?.correctIndex).length
    : 0;

  const exportMd = () => {
    if (!questions) return;
    const md = [
      `# Quiz — ${sectionTitle}`,
      `Difficulty: ${difficulty}`,
      "",
      ...questions.map((q, i) => {
        const correct = q.options[q.correctIndex];
        return `## Q${i + 1}. ${q.prompt}\n\n${q.options.map((o, j) => `${j === q.correctIndex ? "[x]" : "[ ]"} ${o}`).join("\n")}\n\n**Answer:** ${correct}\n\n${q.explanation}`;
      }),
    ].join("\n");
    downloadMarkdown(`${sectionTitle.replace(/\s+/g, "-").toLowerCase()}-quiz`, md);
  };

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-foreground/60">
        <Spinner className="h-6 w-6" />
        <p className="text-sm">Generating {difficulty} quiz…</p>
      </div>
    );
  }

  if (done && questions) {
    const pct = Math.round((correctSoFar / questions.length) * 100);
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white shadow-xl ${pct >= 70 ? "bg-gradient-to-br from-emerald-500 to-teal-500" : pct >= 40 ? "bg-gradient-to-br from-orange-500 to-amber-500" : "bg-gradient-to-br from-rose-500 to-red-500"}`}
        >
          {pct}%
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold text-foreground">
            {pct >= 70 ? "Mastered!" : pct >= 40 ? "Good effort!" : "Keep going!"}
          </h4>
          <p className="text-sm text-foreground/60">
            You answered {correctSoFar} of {questions.length} correctly.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={generate} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110">
            <RotateCcw className="h-4 w-4" /> Retry
          </button>
          <button onClick={exportMd} className="flex items-center gap-2 rounded-xl border border-orange-300/50 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300">
            <Download className="h-4 w-4" /> Export .md
          </button>
          <button onClick={() => setDone(false)} className="rounded-xl border border-white/40 bg-white/50 px-4 py-2 text-sm font-medium text-foreground/70 dark:border-white/10 dark:bg-white/5">
            Review answers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <h3 className="font-display text-base font-semibold text-foreground">AI Quiz Engine</h3>
      <p className="mt-1 text-xs text-foreground/55">
        Questions generated from <span className="font-medium text-orange-600 dark:text-orange-400">{sectionTitle}</span>.
      </p>

      {!questions ? (
        <>
          <div className="mt-3 flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium capitalize transition ${
                  difficulty === d
                    ? "border-orange-400/60 bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300"
                    : "border-white/40 bg-white/50 text-foreground/65 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            onClick={generate}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110"
          >
            <Sparkles className="h-4 w-4" /> Generate {difficulty} quiz
          </button>
          <p className="mt-3 text-center text-xs text-foreground/40">
            Easy · Medium · Hard — scores are saved to your progress dashboard.
          </p>
        </>
      ) : (
        <div className="mt-4 flex-1 overflow-y-auto">
          <GlassCard className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground/60">
                Question {current + 1} of {questions.length}
              </span>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium capitalize text-orange-700 dark:bg-orange-400/15 dark:text-orange-300">
                {difficulty}
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-foreground">
              {questions[current]?.prompt}
            </p>
            <div className="mt-3 space-y-2">
              {questions[current]?.options.map((opt, i) => {
                const isCorrect = i === questions[current].correctIndex;
                const isSelected = i === selected;
                let cls = "border-white/40 bg-white/50 text-foreground/80 hover:border-orange-300 dark:border-white/10 dark:bg-white/5";
                if (selected !== null) {
                  if (isCorrect) cls = "border-emerald-400/70 bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200";
                  else if (isSelected) cls = "border-rose-400/70 bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200";
                  else cls = "border-white/20 bg-white/30 text-foreground/40 dark:border-white/5 dark:bg-white/[0.03]";
                }
                return (
                  <button key={i} onClick={() => pick(i)} disabled={selected !== null} className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${cls}`}>
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                      {selected !== null && isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : selected === i ? <XCircle className="h-4 w-4 text-rose-500" /> : null}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="mt-3 rounded-xl bg-orange-50/70 px-3 py-2 text-xs leading-relaxed text-foreground/70 dark:bg-white/5">
                <span className="font-semibold text-orange-600 dark:text-orange-400">Why: </span>
                {questions[current].explanation}
              </div>
            )}
            {selected !== null && current + 1 < questions.length && (
              <button onClick={next} className="mt-3 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110">
                Next question
              </button>
            )}
            {selected !== null && current + 1 >= questions.length && (
              <button onClick={() => setDone(true)} className="mt-3 w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110">
                See my score
              </button>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
