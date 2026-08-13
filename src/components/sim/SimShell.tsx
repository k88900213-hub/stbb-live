"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function simTitle(topic: string | undefined, fallback: string): string {
  if (!topic) return fallback;
  return topic.charAt(0).toUpperCase() + topic.slice(1);
}

export type SimAccent =
  | "orange"
  | "amber"
  | "violet"
  | "emerald"
  | "sky"
  | "rose"
  | "teal"
  | "indigo"
  | "fuchsia"
  | "lime"
  | "cyan"
  | "slate";

interface AccentTheme {
  hex: string;
  text: string;
  chip: string;
  badge: string;
  canvas: string;
  hint: string;
  glow: string;
}

export const ACCENTS: Record<SimAccent, AccentTheme> = {
  orange: {
    hex: "#f97316",
    text: "text-orange-600 dark:text-orange-400",
    chip: "border-orange-300/50 bg-orange-50 text-orange-700 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-300",
    badge: "bg-gradient-to-br from-orange-400 to-amber-500",
    canvas: "border-orange-200/60 bg-gradient-to-b from-orange-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-orange-50/70 text-orange-900/70 dark:bg-white/5 dark:text-orange-100/70",
    glow: "shadow-orange-500/30",
  },
  amber: {
    hex: "#f59e0b",
    text: "text-amber-600 dark:text-amber-400",
    chip: "border-amber-300/50 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300",
    badge: "bg-gradient-to-br from-amber-400 to-yellow-500",
    canvas: "border-amber-200/60 bg-gradient-to-b from-amber-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-amber-50/70 text-amber-900/70 dark:bg-white/5 dark:text-amber-100/70",
    glow: "shadow-amber-500/30",
  },
  violet: {
    hex: "#8b5cf6",
    text: "text-violet-600 dark:text-violet-400",
    chip: "border-violet-300/50 bg-violet-50 text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-300",
    badge: "bg-gradient-to-br from-violet-500 to-purple-600",
    canvas: "border-violet-200/60 bg-gradient-to-b from-violet-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-violet-50/70 text-violet-900/70 dark:bg-white/5 dark:text-violet-100/70",
    glow: "shadow-violet-500/30",
  },
  emerald: {
    hex: "#10b981",
    text: "text-emerald-600 dark:text-emerald-400",
    chip: "border-emerald-300/50 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300",
    badge: "bg-gradient-to-br from-emerald-400 to-teal-500",
    canvas: "border-emerald-200/60 bg-gradient-to-b from-emerald-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-emerald-50/70 text-emerald-900/70 dark:bg-white/5 dark:text-emerald-100/70",
    glow: "shadow-emerald-500/30",
  },
  sky: {
    hex: "#0ea5e9",
    text: "text-sky-600 dark:text-sky-400",
    chip: "border-sky-300/50 bg-sky-50 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300",
    badge: "bg-gradient-to-br from-sky-400 to-blue-500",
    canvas: "border-sky-200/60 bg-gradient-to-b from-sky-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-sky-50/70 text-sky-900/70 dark:bg-white/5 dark:text-sky-100/70",
    glow: "shadow-sky-500/30",
  },
  rose: {
    hex: "#f43f5e",
    text: "text-rose-600 dark:text-rose-400",
    chip: "border-rose-300/50 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300",
    badge: "bg-gradient-to-br from-rose-400 to-pink-600",
    canvas: "border-rose-200/60 bg-gradient-to-b from-rose-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-rose-50/70 text-rose-900/70 dark:bg-white/5 dark:text-rose-100/70",
    glow: "shadow-rose-500/30",
  },
  teal: {
    hex: "#14b8a6",
    text: "text-teal-600 dark:text-teal-400",
    chip: "border-teal-300/50 bg-teal-50 text-teal-700 dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-teal-300",
    badge: "bg-gradient-to-br from-teal-400 to-cyan-600",
    canvas: "border-teal-200/60 bg-gradient-to-b from-teal-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-teal-50/70 text-teal-900/70 dark:bg-white/5 dark:text-teal-100/70",
    glow: "shadow-teal-500/30",
  },
  indigo: {
    hex: "#6366f1",
    text: "text-indigo-600 dark:text-indigo-400",
    chip: "border-indigo-300/50 bg-indigo-50 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-300",
    badge: "bg-gradient-to-br from-indigo-500 to-violet-600",
    canvas: "border-indigo-200/60 bg-gradient-to-b from-indigo-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-indigo-50/70 text-indigo-900/70 dark:bg-white/5 dark:text-indigo-100/70",
    glow: "shadow-indigo-500/30",
  },
  fuchsia: {
    hex: "#d946ef",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    chip: "border-fuchsia-300/50 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-400/30 dark:bg-fuchsia-400/10 dark:text-fuchsia-300",
    badge: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
    canvas: "border-fuchsia-200/60 bg-gradient-to-b from-fuchsia-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-fuchsia-50/70 text-fuchsia-900/70 dark:bg-white/5 dark:text-fuchsia-100/70",
    glow: "shadow-fuchsia-500/30",
  },
  lime: {
    hex: "#84cc16",
    text: "text-lime-600 dark:text-lime-400",
    chip: "border-lime-300/50 bg-lime-50 text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300",
    badge: "bg-gradient-to-br from-lime-400 to-green-500",
    canvas: "border-lime-200/60 bg-gradient-to-b from-lime-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-lime-50/70 text-lime-900/70 dark:bg-white/5 dark:text-lime-100/70",
    glow: "shadow-lime-500/30",
  },
  cyan: {
    hex: "#06b6d4",
    text: "text-cyan-600 dark:text-cyan-400",
    chip: "border-cyan-300/50 bg-cyan-50 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300",
    badge: "bg-gradient-to-br from-cyan-400 to-sky-500",
    canvas: "border-cyan-200/60 bg-gradient-to-b from-cyan-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-cyan-50/70 text-cyan-900/70 dark:bg-white/5 dark:text-cyan-100/70",
    glow: "shadow-cyan-500/30",
  },
  slate: {
    hex: "#64748b",
    text: "text-slate-600 dark:text-slate-400",
    chip: "border-slate-300/50 bg-slate-50 text-slate-700 dark:border-slate-400/30 dark:bg-slate-400/10 dark:text-slate-300",
    badge: "bg-gradient-to-br from-slate-500 to-slate-700",
    canvas: "border-slate-200/60 bg-gradient-to-b from-slate-50/50 to-white/40 dark:border-white/10 dark:from-white/5 dark:to-transparent",
    hint: "bg-slate-50/70 text-slate-900/70 dark:bg-white/5 dark:text-slate-100/70",
    glow: "shadow-slate-500/30",
  },
};

interface SimShellProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  accent?: SimAccent;
  hint?: string;
  controls?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SimShell({
  icon,
  title,
  subtitle,
  accent = "orange",
  hint,
  controls,
  children,
  className,
}: SimShellProps) {
  const a = ACCENTS[accent];
  const glowVar = { "--sim-glow": a.hex } as CSSProperties;
  const corners = [
    "top-2 left-2 border-t-2 border-l-2 rounded-tl",
    "top-2 right-2 border-t-2 border-r-2 rounded-tr",
    "bottom-2 left-2 border-b-2 border-l-2 rounded-bl",
    "bottom-2 right-2 border-b-2 border-r-2 rounded-br",
  ];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl",
        "dark:border-white/10 dark:bg-white/5 dark:shadow-black/30",
        className,
      )}
      style={glowVar}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-70"
        style={{
          backgroundImage: `linear-gradient(to right, ${a.hex}1a 1px, transparent 1px), linear-gradient(to bottom, ${a.hex}1a 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
      />
      <div
        aria-hidden
        className="anim-scan pointer-events-none absolute inset-x-0 top-0 h-28 opacity-0"
        style={{ background: `linear-gradient(to bottom, transparent, ${a.hex}30, transparent)` }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {corners.map((pos) => (
          <span key={pos} className={cn("absolute h-3.5 w-3.5", pos)} style={{ borderColor: a.hex }} />
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: `inset 0 0 40px ${a.hex}12` }} />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/40 px-5 pt-4 pb-3 dark:border-white/10">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "anim-glow relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg text-white shadow-lg",
                a.badge,
                a.glow,
              )}
              style={glowVar}
            >
              <span className="anim-sheen absolute inset-y-0 left-0 w-1/2 bg-white/25" aria-hidden />
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                <span
                  className="hidden items-center gap-1.5 rounded-full border px-2 py-px font-mono text-[9px] font-bold tracking-[0.18em] uppercase sm:inline-flex"
                  style={{ borderColor: `${a.hex}55`, color: a.hex }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="anim-ring absolute inline-flex h-full w-full rounded-full" style={{ background: a.hex }} />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: a.hex }} />
                  </span>
                  sim
                </span>
              </div>
              <p className="mt-0.5 max-w-md text-sm text-foreground/60">{subtitle}</p>
            </div>
          </div>
          {controls && <div className="flex shrink-0 items-center gap-2">{controls}</div>}
        </div>

        <div className="relative h-px overflow-hidden">
          <div className="anim-flow absolute top-0 h-full w-1/3" style={{ background: `linear-gradient(90deg, transparent, ${a.hex}, transparent)` }} aria-hidden />
        </div>

        <div className="p-5 pt-4">{children}</div>

        {hint && (
          <div className="border-t border-white/40 px-5 py-3 dark:border-white/10">
            <p className={cn("rounded-xl px-3 py-2 text-xs", a.hint)}>{hint}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SimChip({ children, accent = "orange" }: { children: ReactNode; accent?: SimAccent }) {
  const a = ACCENTS[accent];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        a.chip,
      )}
    >
      {children}
    </span>
  );
}
