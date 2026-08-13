"use client";

import type { ExplainMode } from "@/lib/ai/types";
import { cn } from "@/lib/utils/cn";
import { Baby, Briefcase, GraduationCap, Rocket, School } from "lucide-react";

const MODES: { mode: ExplainMode; label: string; icon: React.ReactNode }[] = [
  { mode: "beginner", label: "Beginner", icon: <School className="h-3.5 w-3.5" /> },
  { mode: "intermediate", label: "Intermediate", icon: <GraduationCap className="h-3.5 w-3.5" /> },
  { mode: "expert", label: "Expert", icon: <Rocket className="h-3.5 w-3.5" /> },
  { mode: "child", label: "Child", icon: <Baby className="h-3.5 w-3.5" /> },
  { mode: "exam", label: "Exam", icon: <Briefcase className="h-3.5 w-3.5" /> },
];

interface ExplainModeBarProps {
  mode: ExplainMode;
  onModeChange: (m: ExplainMode) => void;
  audience: string;
  onAudienceChange: (a: string) => void;
}

export function ExplainModeBar({ mode, onModeChange, audience, onAudienceChange }: ExplainModeBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-2">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-foreground/45">
        AI Live-Reading:
      </span>
      {MODES.map((m) => (
        <button
          key={m.mode}
          onClick={() => onModeChange(m.mode)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition",
            mode === m.mode
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow shadow-orange-500/30"
              : "border border-white/40 bg-white/50 text-foreground/60 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
          )}
        >
          {m.icon}
          {m.label}
        </button>
      ))}
      <input
        value={audience}
        onChange={(e) => onAudienceChange(e.target.value)}
        placeholder="Audience e.g. Grade 6, Engineering…"
        className="ml-1 w-44 rounded-full border border-white/50 bg-white/60 px-3 py-1 text-xs text-foreground outline-none placeholder:text-foreground/35 focus:border-orange-400 dark:border-white/10 dark:bg-white/5"
      />
    </div>
  );
}
