import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/40 bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl",
        "dark:border-white/10 dark:bg-white/5 dark:shadow-black/30",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 animate-spin text-orange-500", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}
