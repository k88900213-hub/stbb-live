"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

export function useTick(ms = 60) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      acc += t - last;
      last = t;
      if (acc >= ms) {
        acc = 0;
        setTick((k) => k + 1);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [ms]);
  return tick;
}

export interface UseSimOptions {
  fps?: number;
  autoRun?: boolean;
}

export interface UseSim {
  running: boolean;
  tick: number;
  elapsed: number;
  /** seconds elapsed since the previous tick (1/fps); usable for delta-time physics */
  dt: number;
  toggle: () => void;
  reset: () => void;
  setRunning: (r: boolean) => void;
}

export function useSim({ fps = 60, autoRun = false }: UseSimOptions = {}): UseSim {
  const [running, setRunning] = useState(autoRun);
  const [state, setState] = useState({ tick: 0, now: 0 });
  const runningRef = useRef(running);
  const fpsRef = useRef(fps);
  const accRef = useRef(0);
  const lastRef = useRef(0);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);
  useEffect(() => {
    fpsRef.current = fps;
    accRef.current = 0;
  }, [fps]);
  useEffect(() => {
    lastRef.current = performance.now();
    let raf = 0;
    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      if (!runningRef.current) {
        lastRef.current = t;
        accRef.current = 0;
        return;
      }
      const period = 1 / fpsRef.current;
      accRef.current += Math.min(0.1, (t - lastRef.current) / 1000);
      lastRef.current = t;
      let ticks = 0;
      while (accRef.current >= period && ticks < 5) {
        accRef.current -= period;
        ticks++;
      }
      if (ticks > 0) setState((s) => ({ tick: s.tick + ticks, now: s.now + ticks * period }));
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  const reset = useCallback(() => {
    accRef.current = 0;
    lastRef.current = performance.now();
    setState({ tick: 0, now: 0 });
  }, []);
  const toggle = useCallback(() => setRunning((r) => !r), []);
  const dt = fps > 0 ? 1 / fps : 0;
  return { running, tick: state.tick, elapsed: state.now, dt, toggle, reset, setRunning };
}

export interface DragState {
  active: boolean;
  /** pointer position relative to the element, in px */
  x: number;
  y: number;
  /** movement since the last pointermove, in px */
  dx: number;
  dy: number;
}

export function usePointerDrag(onDrag?: (s: DragState) => void) {
  const [state, setState] = useState<DragState>({ active: false, x: 0, y: 0, dx: 0, dy: 0 });
  const ref = useRef<HTMLDivElement | null>(null);
  const lastRef = useRef({ x: 0, y: 0 });
  const activeRef = useRef(false);
  const cbRef = useRef(onDrag);
  useEffect(() => {
    cbRef.current = onDrag;
  }, [onDrag]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const toLocal = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const p = toLocal(e);
      activeRef.current = true;
      lastRef.current = p;
      setState({ active: true, ...p, dx: 0, dy: 0 });
      cbRef.current?.({ active: true, ...p, dx: 0, dy: 0 });
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };
    const move = (e: PointerEvent) => {
      if (!activeRef.current) return;
      const p = toLocal(e);
      const dx = p.x - lastRef.current.x;
      const dy = p.y - lastRef.current.y;
      lastRef.current = p;
      setState({ active: true, ...p, dx, dy });
      cbRef.current?.({ active: true, ...p, dx, dy });
    };
    const up = () => {
      if (!activeRef.current) return;
      activeRef.current = false;
      setState((s) => ({ ...s, active: false, dx: 0, dy: 0 }));
      cbRef.current?.({ active: false, x: lastRef.current.x, y: lastRef.current.y, dx: 0, dy: 0 });
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerup", up);
    };
  }, []);
  return { ref, state };
}

export function Meter({
  label,
  value,
  max,
  hex,
  unit,
}: {
  label: string;
  value: number;
  max: number;
  hex: string;
  unit?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(0.0001, max)) * 100));
  return (
    <div className="rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between font-mono text-[10px] font-medium tracking-[0.14em] text-foreground/45 uppercase">
        <span>{label}</span>
        <span className="font-semibold text-foreground/85 tabular-nums">
          {value.toFixed(1)}
          {unit ?? ""}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width: `${pct}%`, background: hex, boxShadow: `0 0 8px ${hex}` }}
        />
      </div>
    </div>
  );
}

export function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/40 bg-white/50 px-3 py-2 shadow-[inset_0_1px_0_rgb(255,255,255,0.35)] dark:border-white/10 dark:bg-white/5">
      <div className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/45">{label}</div>
      <div className={cn("font-mono text-sm font-semibold tabular-nums", accent ? accent : "text-foreground")}>
        {value}
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  hex: string;
  accent?: string;
  unit?: string;
  onChange: (v: number) => void;
}

export function Slider({ label, value, min, max, step, hex, accent, unit, onChange }: SliderProps) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-sm text-foreground/70">
        <span>{label}</span>
        <span className={cn("font-semibold", accent)}>
          {value}
          {unit ?? ""}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sim-range w-full"
        style={{ "--sim-glow": hex } as CSSProperties}
      />
    </label>
  );
}

export function SimCanvas({ draw, deps }: { draw: (ctx: CanvasRenderingContext2D) => void; deps: unknown[] }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (ctx) draw(ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/40 bg-white/40 shadow-[inset_0_2px_8px_rgb(0,0,0,0.06)] dark:border-white/10 dark:bg-white/5">
      <canvas ref={ref} width={640} height={250} className="h-48 w-full" />
      <span aria-hidden className="pointer-events-none absolute top-1.5 left-1.5 h-2 w-2 border-t border-l border-foreground/20" />
      <span aria-hidden className="pointer-events-none absolute top-1.5 right-1.5 h-2 w-2 border-t border-r border-foreground/20" />
      <span aria-hidden className="pointer-events-none absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l border-foreground/20" />
      <span aria-hidden className="pointer-events-none absolute right-1.5 bottom-1.5 h-2 w-2 border-r border-b border-foreground/20" />
    </div>
  );
}

export function frame(ctx: CanvasRenderingContext2D, color: string) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "rgba(15,18,30,0.05)");
  bg.addColorStop(1, "rgba(15,18,30,0.14)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(110,130,170,0.14)";
  ctx.lineWidth = 1;
  for (let x = 30; x < w - 30; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.lineTo(x, h - 30);
    ctx.stroke();
  }
  for (let y = 20; y < h - 30; y += 30) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(w - 30, y);
    ctx.stroke();
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(30, h - 30);
  ctx.lineTo(w - 30, h - 30);
  ctx.moveTo(30, h - 30);
  ctx.lineTo(30, 20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w - 34, h - 34);
  ctx.lineTo(w - 26, h - 30);
  ctx.lineTo(w - 34, h - 26);
  ctx.moveTo(34, 26);
  ctx.lineTo(30, 34);
  ctx.lineTo(26, 26);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 28);
  ctx.lineTo(16, 16);
  ctx.lineTo(28, 16);
  ctx.moveTo(w - 28, 16);
  ctx.lineTo(w - 16, 16);
  ctx.lineTo(w - 16, 28);
  ctx.moveTo(16, h - 28);
  ctx.lineTo(16, h - 16);
  ctx.lineTo(28, h - 16);
  ctx.moveTo(w - 28, h - 16);
  ctx.lineTo(w - 16, h - 16);
  ctx.lineTo(w - 16, h - 28);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

interface RunControlsProps {
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  speed?: number;
  onSpeed?: (s: number) => void;
  hex?: string;
  label?: string;
}

export function RunControls({ running, onToggle, onReset, speed = 1, onSpeed, hex = "#64748b", label }: RunControlsProps) {
  const btn =
    "inline-flex select-none items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition active:scale-95";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className={cn(btn, "border border-white/20")}
        style={{ backgroundColor: hex, boxShadow: `0 2px 14px ${hex}66` }}
      >
        <span aria-hidden>{running ? "⏸" : "▶"}</span>
        {label ? label : running ? "Pause" : "Play"}
      </button>
      <button
        type="button"
        onClick={onReset}
        className={cn(btn, "border border-white/20 bg-slate-600 hover:bg-slate-500")}
        style={{ boxShadow: "0 2px 10px rgb(100 116 139 / 0.45)" }}
      >
        <span aria-hidden>↺</span>Reset
      </button>
      {onSpeed && (
        <label className="flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/50 px-2 py-1 font-mono text-[11px] font-medium text-foreground/70 dark:border-white/10 dark:bg-white/5">
          Speed
          <select
            value={speed}
            onChange={(e) => onSpeed(Number(e.target.value))}
            className="rounded bg-transparent font-mono font-semibold text-foreground outline-none"
            aria-label="Animation speed"
          >
            <option value={0.25}>0.25×</option>
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
          </select>
        </label>
      )}
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hex: string;
  hint?: string;
}

export function Toggle({ label, checked, onChange, hex, hint }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground/80">{label}</div>
        {hint && <div className="text-[11px] text-foreground/50">{hint}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-all",
          checked ? "" : "bg-slate-300 shadow-inner dark:bg-white/15",
        )}
        style={checked ? { backgroundColor: hex, boxShadow: `0 0 12px ${hex}` } : undefined}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-4",
          )}
        />
      </button>
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  icon?: string;
  onClick: () => void;
  hex?: string;
  disabled?: boolean;
  title?: string;
}

export function ActionButton({ label, icon, onClick, hex = "#64748b", disabled, title }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white shadow transition active:scale-95",
        disabled && "cursor-not-allowed opacity-40",
      )}
      style={{ backgroundColor: hex, boxShadow: `0 2px 16px ${hex}55` }}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {label}
    </button>
  );
}
