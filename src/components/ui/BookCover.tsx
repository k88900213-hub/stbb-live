import { Atom, Dna, FlaskConical, Leaf } from "lucide-react";
import type { StbbBookInfo } from "@/lib/stbb/books";
import { cn } from "@/lib/utils/cn";

interface CoverTheme {
  bg: string;
  spine: string;
  accent: string;
  icon: React.ReactNode;
}

const THEMES: Record<string, CoverTheme> = {
  Physics: {
    bg: "bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#0f1b4d]",
    spine: "bg-gradient-to-b from-[#172554] via-[#1e40af] to-[#0b1030]",
    accent: "#93c5fd",
    icon: <Atom className="text-sky-100" strokeWidth={1.6} />,
  },
  Chemistry: {
    bg: "bg-gradient-to-br from-[#065f46] via-[#059669] to-[#04351f]",
    spine: "bg-gradient-to-b from-[#04351f] via-[#047857] to-[#032a1c]",
    accent: "#6ee7b7",
    icon: <FlaskConical className="text-emerald-100" strokeWidth={1.6} />,
  },
  Biology: {
    bg: "bg-gradient-to-br from-[#15803d] via-[#22c55e] to-[#0e4d24]",
    spine: "bg-gradient-to-b from-[#0e4d24] via-[#16a34a] to-[#0a3d1c]",
    accent: "#bef264",
    icon: <Leaf className="text-lime-100" strokeWidth={1.6} />,
  },
};

const FALLBACK_THEME: CoverTheme = {
  bg: "bg-gradient-to-br from-[#7c2d12] via-[#ea580c] to-[#3b0d02]",
  spine: "bg-gradient-to-b from-[#3b0d02] via-[#c2410c] to-[#2a0a04]",
  accent: "#fdba74",
  icon: <Dna className="text-orange-100" strokeWidth={1.6} />,
};

function coverTheme(subject: string): CoverTheme {
  return THEMES[subject] ?? FALLBACK_THEME;
}

export function BookCover({
  book,
  className,
  compact,
}: {
  book: StbbBookInfo;
  className?: string;
  compact?: boolean;
}) {
  const t = coverTheme(book.subject);
  const gradeLabel = book.grade.replace(/–/g, "-");
  const subject = book.subject.toUpperCase();

  return (
    <div
      className={cn(
        "@container group/cover relative overflow-hidden text-white",
        t.bg,
        className,
      )}
      style={{
        aspectRatio: "4 / 5",
        boxShadow:
          "0 14px 34px rgba(0,0,0,0.45), 0 3px 8px rgba(0,0,0,0.25), inset 0 0.6cqw 0 rgba(255,255,255,0.22)",
      }}
    >
      {/* cloth texture */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.09)_1px,transparent_0)] bg-[length:7px_7px]"
      />
      {/* glowing center light */}
      <div
        aria-hidden
        className="absolute left-[32%] top-0 h-[110%] w-[46%] opacity-45 blur-2xl"
        style={{
          background: `radial-gradient(ellipse at center, ${t.accent} 0%, transparent 70%)`,
        }}
      />

      {/* page edges on the right */}
      <div aria-hidden className="absolute right-0 top-[2%] bottom-[2%] flex w-[5.5%] flex-col">
        <div className="w-full flex-1 bg-gradient-to-b from-white/95 to-slate-300/95" />
        <div className="h-[0.4cqw] w-full bg-slate-500/70" />
        <div className="w-[84%] flex-1 bg-gradient-to-b from-white/90 to-slate-300/90" />
        <div className="h-[0.4cqw] w-full bg-slate-500/70" />
        <div className="w-[93%] flex-1 bg-gradient-to-b from-white/95 to-slate-300/95" />
        <div className="h-[0.4cqw] w-full bg-slate-500/70" />
        <div className="w-full flex-1 bg-gradient-to-b from-white/90 to-slate-300/90" />
      </div>

      {/* spine */}
      <div aria-hidden className={cn("absolute inset-y-0 left-0 w-[13%] bg-gradient-to-b", t.spine)}>
        <div className="absolute inset-y-0 left-[8%] right-[8%] border-y border-white/25" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [writing-mode:vertical-rl] rotate-180 text-[2.8cqw] font-bold uppercase tracking-[0.24em] text-white/95">
          {subject}
        </span>
        <span className="absolute bottom-[6%] left-1/2 -translate-x-1/2 text-[2.2cqw] font-black uppercase tracking-[0.18em] text-white/75">
          STBB
        </span>
      </div>
      {/* spine crease */}
      <div aria-hidden className="absolute inset-y-0 left-[13%] w-[0.5cqw] bg-black/35" />
      <div aria-hidden className="absolute inset-y-0 left-[13.6%] w-[0.4cqw] bg-white/15" />

      {/* gold foil frame */}
      <div aria-hidden className="absolute inset-[2.6cqw] rounded-[1cqw] border-[0.6cqw] border-amber-200/70" />
      <div aria-hidden className="absolute inset-[4.2cqw] rounded-[0.6cqw] border border-white/25" />
      {/* corner ornaments */}
      {(["left-[1.2cqw] top-[1.2cqw]", "right-[1.2cqw] top-[1.2cqw]", "left-[1.2cqw] bottom-[1.2cqw]", "right-[1.2cqw] bottom-[1.2cqw]"] as const).map(
        (pos) => (
          <span
            key={pos}
            aria-hidden
            className={cn(
              "absolute h-[4.6cqw] w-[4.6cqw] border-[0.8cqw] border-amber-200/80",
              pos,
              pos.includes("top") ? "border-b-0" : "border-t-0",
              pos.includes("left") ? "border-r-0" : "border-l-0",
            )}
          />
        ),
      )}

      {/* gloss sheen */}
      <div aria-hidden className="absolute -left-[35%] -top-[20%] h-[150%] w-[55%] rotate-[16deg] bg-gradient-to-br from-white/20 via-white/10 to-transparent" />

      {/* content */}
      <div className="relative flex h-full min-h-0 max-w-full flex-col items-center justify-between overflow-hidden px-[6cqw] pb-[4.5cqw] pt-[4.2cqw] pl-[16.5cqw]">
        {/* top brand */}
        <div className="flex max-w-full flex-col items-center">
          <div className="max-w-full break-words font-serif text-[3.5cqw] font-semibold uppercase tracking-[0.16em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            Sindh Textbook Board
          </div>
          {!compact && (
            <div className="text-[2.5cqw] uppercase tracking-[0.34em] text-white/65">Jamshoro</div>
          )}
        </div>

        {/* middle: emblem + subject */}
        <div className="flex min-h-0 max-w-full flex-1 flex-col items-center justify-center gap-[2.6cqw] text-center">
          <div className="relative flex h-[17cqw] w-[17cqw] shrink-0 items-center justify-center rounded-full border-[0.8cqw] border-double border-white/75 bg-white/10 shadow-[0_0_3cqw_rgba(0,0,0,0.35)]">
            <span aria-hidden className="absolute inset-[1.6cqw] rounded-full border border-white/25" />
            <div className="flex h-[8.5cqw] w-[8.5cqw] items-center justify-center [&_svg]:h-full [&_svg]:w-full">
              {t.icon}
            </div>
          </div>
          <div
            className="max-w-full break-words font-serif text-[10cqw] font-black leading-none tracking-[0.05em] drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]"
            style={{ textShadow: `0 0 ${"2.5cqw"} ${t.accent}33` }}
          >
            {subject}
          </div>
          <div className="h-[0.9cqw] w-[15cqw] shrink-0 rounded-full bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
          {!compact && (
            <div className="max-w-full break-words text-[3.3cqw] font-semibold uppercase tracking-[0.24em] text-white/90">
              {book.title}
            </div>
          )}
        </div>

        {/* bottom: class box */}
        <div className="flex shrink-0 flex-col items-center gap-[1.4cqw]">
          <span className="rounded-[0.6cqw] border-[0.5cqw] border-amber-200/80 bg-black/10 px-[3cqw] py-[1.1cqw] text-[3.2cqw] font-black uppercase tracking-[0.24em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
            Class {gradeLabel}
          </span>
          {!compact && (
            <span className="text-[2.5cqw] uppercase tracking-[0.3em] text-white/65">
              {book.medium} Medium
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
