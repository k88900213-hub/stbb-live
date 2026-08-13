"use client";

import { book } from "@/lib/content/catalog";
import { useProgress } from "@/store/progress";
import { GlassCard } from "@/components/ui/GlassCard";
import { Award, Clock, Flame, Target, TrendingUp, Trophy } from "lucide-react";

export function ProgressDashboard() {
  const { progress, snapshot, reset } = useProgress();

  const metrics = [
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Reading time",
      value: `${snapshot.totalReadMinutes.toFixed(1)} min`,
    },
    {
      icon: <Flame className="h-4 w-4" />,
      label: "Focus level",
      value: `${snapshot.focusLevel}%`,
    },
    {
      icon: <Target className="h-4 w-4" />,
      label: "Quiz average",
      value: snapshot.avgQuizScore ? `${snapshot.avgQuizScore}%` : "—",
    },
    {
      icon: <Trophy className="h-4 w-4" />,
      label: "Concepts mastered",
      value: `${snapshot.conceptsMastered}`,
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
      <h3 className="font-display text-base font-semibold text-foreground">Study Analytics</h3>
      <p className="mt-1 text-xs text-foreground/55">Your learning progress across the textbook.</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {metrics.map((m, i) => (
          <GlassCard key={i} className="p-3">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-foreground/50">
              <span className="text-orange-500">{m.icon}</span>
              {m.label}
            </div>
            <div className="mt-1 text-lg font-semibold text-foreground">{m.value}</div>
          </GlassCard>
        ))}
      </div>

      {snapshot.weakTopics.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50/70 p-3 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/5 dark:text-amber-200">
          <span className="font-semibold">Weak topics — review these:</span>
          <ul className="mt-1 list-disc pl-4">
            {snapshot.weakTopics.map((slug) => {
              const ch = book.chapters.find((c) => c.slug === slug);
              return <li key={slug}>{ch?.title ?? slug}</li>;
            })}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/55">
          <TrendingUp className="h-3.5 w-3.5 text-orange-500" /> Chapters
        </div>
        <div className="space-y-2">
          {book.chapters.map((ch) => {
            const p = progress[ch.slug];
            const viewed = p?.viewedBlocks.length ?? 0;
            const total = ch.sections.reduce((s, sec) => s + sec.blocks.filter((b) => b.type === "paragraph").length, 0);
            const pct = total ? Math.round((viewed / total) * 100) : 0;
            const lastQuiz = p?.quizScores.at(-1)?.pct;
            return (
              <GlassCard key={ch.slug} className="p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground/85">{ch.title}</span>
                  <span className="text-xs text-foreground/50">{viewed}/{total} paragraphs · {Math.round((p?.readMs ?? 0) / 60000 * 10) / 10} min</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-foreground/50">
                  <span>{pct}% read</span>
                  {lastQuiz !== undefined ? <span>Latest quiz: <b className="text-orange-600 dark:text-orange-400">{lastQuiz}%</b></span> : <span>No quiz yet</span>}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-orange-200/50 bg-gradient-to-r from-orange-50/70 to-amber-50/50 p-3 dark:border-orange-400/15 dark:from-orange-400/5 dark:to-transparent">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300">
          <Award className="h-3.5 w-3.5" /> Achievements
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge earned={snapshot.totalReadMinutes >= 2} label="First 2 minutes" />
          <Badge earned={snapshot.conceptsMastered >= 1} label="First concept" />
          <Badge earned={snapshot.avgQuizScore >= 70} label="Quiz star" />
          <Badge earned={snapshot.focusLevel >= 80} label="Deep focus" />
          <Badge earned={Object.keys(progress).length >= 2} label="Explorer" />
        </div>
      </div>

      <button
        onClick={reset}
        className="mt-4 rounded-xl border border-white/40 bg-white/50 px-4 py-2 text-xs font-medium text-foreground/60 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5"
      >
        Reset local progress
      </button>
    </div>
  );
}

function Badge({ earned, label }: { earned: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
        earned
          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow shadow-orange-500/30"
          : "border border-white/40 bg-white/40 text-foreground/40 dark:border-white/10 dark:bg-white/5"
      }`}
    >
      {earned ? "★ " : ""}
      {label}
    </span>
  );
}
