"use client";

import { useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";
import { cn } from "@/lib/utils/cn";

export function FrictionSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "rose";
  const a = ACCENTS[accent];

  const [angle, setAngle] = useState(25);
  const [mu, setMu] = useState(0.45);
  const [mass, setMass] = useState(2);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul, autoRun: false });

  const g = 9.8;
  const theta = (angle * Math.PI) / 180;
  const mgPar = mass * g * Math.sin(theta);
  const normal = mass * g * Math.cos(theta);
  const friction = mu * normal;
  const slides = mgPar > friction + 0.001;
  const acc = slides ? (mgPar - friction) / mass : 0;
  const repose = (Math.atan(mu) * 180) / Math.PI;

  const t = sim.elapsed;
  const pos = Math.min(0.5 * acc * t * t, 1);
  const vel = slides ? Math.min(acc * t, 3) : 0;

  const toggle = () => {
    if (sim.running) {
      sim.setRunning(false);
    } else {
      sim.reset();
      sim.setRunning(true);
    }
  };

  const reset = () => {
    sim.setRunning(false);
    sim.reset();
  };

  const runLabel = sim.running ? undefined : slides ? "Release" : "Try to push";

  const sub = topic
    ? `${topic} — tilt the ramp and watch when friction can no longer hold the block.`
    : "Friction on a ramp: the block slides when the downhill pull mg·sinθ beats the friction μ·mg·cosθ.";

  const hint =
    "The block starts to slide when tan(angle) exceeds μ. That critical angle is called the angle of repose — lower μ and the ramp must be flatter to hold the block.";

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const theta = (angle * Math.PI) / 180;
    const baseY = h - 46;
    const baseX = 40;
    const rampLen = Math.min(500, (baseY - 30) / Math.sin(theta));
    const topX = baseX + rampLen * Math.cos(theta);
    const topY = baseY - rampLen * Math.sin(theta);

    ctx.fillStyle = "rgba(244,63,94,0.08)";
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(topX, topY);
    ctx.lineTo(baseX + rampLen * Math.cos(theta), baseY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(244,63,94,0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(topX, topY);
    ctx.stroke();

    ctx.fillStyle = "rgba(244,63,94,0.5)";
    ctx.fillRect(0, baseY, w, h - baseY);
    ctx.strokeStyle = "rgba(244,63,94,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(w, baseY);
    ctx.stroke();

    if (repose <= angle) {
      const rLen = Math.min(500, (baseY - 30) / Math.sin((repose * Math.PI) / 180));
      const rTopX = baseX + rLen * Math.cos((repose * Math.PI) / 180);
      const rTopY = baseY - rLen * Math.sin((repose * Math.PI) / 180);
      ctx.strokeStyle = "rgba(251,191,36,0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(rTopX, rTopY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`repose ${repose.toFixed(1)}°`, rTopX - 30, rTopY - 8);
    }

    const blockEdge = 54;
    const along = 0.18 + pos * 0.62;
    const bx = baseX + along * rampLen * Math.cos(theta) - (blockEdge / 2) * Math.cos(theta);
    const by = baseY - along * rampLen * Math.sin(theta) - (blockEdge / 2) * Math.sin(theta);

    ctx.save();
    ctx.translate(bx + (blockEdge / 2) * Math.cos(theta), by + (blockEdge / 2) * Math.sin(theta));
    ctx.rotate(-theta);
    const grad = ctx.createLinearGradient(0, -blockEdge, 0, 0);
    grad.addColorStop(0, "#fda4af");
    grad.addColorStop(1, "#f43f5e");
    ctx.shadowColor = "rgba(244,63,94,0.4)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-blockEdge / 2, -blockEdge, blockEdge, blockEdge, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#881337";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${mass} kg`, 0, -blockEdge / 2 + 4);
    ctx.restore();

    const midX = baseX + rampLen * 0.5 * Math.cos(theta);
    const midY = baseY - rampLen * 0.5 * Math.sin(theta);
    ctx.fillStyle = "#e11d48";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`θ = ${angle}°`, midX + Math.cos(theta) * 60, midY - Math.sin(theta) * 60 + 6);
    ctx.fillText(`μ = ${mu.toFixed(2)}`, baseX + 10, baseY - 10);
    ctx.textAlign = "start";

    if (slides) {
      const arrowX = bx + blockEdge * Math.cos(theta) + 60;
      const arrowY = by + blockEdge * Math.sin(theta) + 20;
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx + blockEdge * Math.cos(theta) + 10, by + blockEdge * Math.sin(theta) + 20);
      ctx.lineTo(arrowX, arrowY);
      ctx.stroke();
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 11, arrowY - 6);
      ctx.lineTo(arrowX - 6, arrowY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e11d48";
      ctx.font = "12px sans-serif";
      ctx.fillText("a", arrowX + 4, arrowY - 8);
    }
  };

  return (
    <SimShell
      icon={<span>◢</span>}
      title={simTitle(topic, "Friction & Inclined Plane")}
      subtitle={sub}
      accent={accent}
      hint={hint}
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <SimChip accent={slides ? "rose" : "emerald"}>{slides ? "sliding" : "static friction"}</SimChip>
        </>
      }
    >
      <SimCanvas draw={draw} deps={[sim.tick, angle, mu, mass, slides, pos]} />

      <div className="mt-4">
        <RunControls running={sim.running} onToggle={toggle} onReset={reset} speed={speedMul} onSpeed={setSpeedMul} hex={a.hex} label={runLabel} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Angle of ramp" value={angle} min={0} max={60} step={1} hex={a.hex} accent={a.text} unit="°" onChange={setAngle} />
        <Slider label="Coefficient of friction (μ)" value={mu} min={0} max={1} step={0.01} hex={a.hex} accent={a.text} onChange={setMu} />
        <Slider label="Mass of block" value={mass} min={1} max={10} step={0.5} hex={a.hex} accent={a.text} unit=" kg" onChange={setMass} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Pull down ramp (mg·sinθ)" value={`${mgPar.toFixed(1)} N`} accent={a.text} />
        <Stat label="Normal force (mg·cosθ)" value={`${normal.toFixed(1)} N`} accent={a.text} />
        <Stat label="Friction (μ·N)" value={`${friction.toFixed(1)} N`} accent={a.text} />
        <Stat label="Angle of repose" value={`${repose.toFixed(1)}°`} accent={a.text} />
        <Stat label="Acceleration" value={`${acc.toFixed(2)} m/s2`} accent={a.text} />
        <Stat label="Speed" value={`${vel.toFixed(2)} m/s`} accent={a.text} />
        <Stat label="Distance travelled" value={`${(pos * 100).toFixed(0)} % of ramp`} accent={a.text} />
        <Stat label="Tan vs μ" value={`tanθ = ${Math.tan(theta).toFixed(2)} · μ = ${mu.toFixed(2)}`} accent={a.text} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span
          className={cn(
            "rounded-full px-3 py-1 font-semibold",
            slides ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
          )}
        >
          {slides ? `Sliding down — acceleration ${acc.toFixed(2)} m/s²` : "Held at rest by static friction"}
        </span>
        {!slides && (
          <span className="rounded-full border border-foreground/10 bg-white/40 px-3 py-1 font-medium text-foreground/60 dark:bg-white/5">
            tan({angle}°) = {Math.tan(theta).toFixed(2)} {mu > Math.tan(theta) ? "≤" : ">"} μ = {mu.toFixed(2)}
          </span>
        )}
      </div>
    </SimShell>
  );
}
