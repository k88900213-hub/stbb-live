"use client";

import { useState, useCallback } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";

export function CarnotEngineSim({ topic }: { topic?: string }) {
  const a = "#dc2626";
  const at = "text-rose-600 dark:text-rose-400";

  const [th, setTh] = useState(600);
  const [tc, setTc] = useState(300);
  const [gamma] = useState(5 / 3);
  const sim = useSim({ fps: 30 });

  const eff = 1 - tc / th;
  const p1 = 100;
  const v1 = 2;
  const p2 = p1 * Math.pow(v1 / (v1 * 2.2), gamma);
  const v2 = v1 * 2.2;
  const p3 = p2 * (tc / th);
  const v3 = v2 * Math.pow(th / tc, 1 / (gamma - 1));
  const p4 = p1 * (tc / th);
  const v4 = v1 * Math.pow(th / tc, 1 / (gamma - 1));

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      ctx.clearRect(0, 0, w, h);

      const pad = { l: 70, r: 30, t: 40, b: 60 };
      const gw = w - pad.l - pad.r;
      const gh = h - pad.t - pad.b;

      const cyclePts = [
        { p: p1, v: v1, label: "1" },
        { p: p2, v: v2, label: "2" },
        { p: p3, v: v3, label: "3" },
        { p: p4, v: v4, label: "4" },
      ];

      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = pad.t + (i / 5) * gh;
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(pad.l + gw, y);
        ctx.stroke();
      }

      const maxV = Math.max(v1, v2, v3, v4) * 1.3;
      const maxP = Math.max(p1, p2, p3, p4) * 1.3;
      const toX = (v: number) => pad.l + (v / maxV) * gw;
      const toY = (p: number) => pad.t + gh - (p / maxP) * gh;

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t);
      ctx.lineTo(pad.l, pad.t + gh);
      ctx.lineTo(pad.l + gw, pad.t + gh);
      ctx.stroke();

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 13px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Volume (V)", pad.l + gw / 2, h - 12);
      ctx.save();
      ctx.translate(18, pad.t + gh / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Pressure (P)", 0, 0);
      ctx.restore();
      ctx.textAlign = "start";

      const steps = 80;
      const drawCurve = (pA: number, vA: number, pB: number, vB: number, color: string, dashed = false) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        if (dashed) ctx.setLineDash([6, 4]);
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const v = vA + (vB - vA) * t;
          const p = pA * Math.pow(vA / v, gamma);
          const x = toX(v);
          const y = toY(p);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawCurve(p1, v1, p2, v2, "#dc2626");
      drawCurve(p2, v2, p3, v3, "#f97316", true);
      drawCurve(p3, v3, p4, v4, "#3b82f6");
      drawCurve(p4, v4, p1, v1, "#6366f1", true);

      const animT = (sim.tick % 120) / 120;
      let animP: number, animV: number;
      if (animT < 0.25) {
        const t = animT / 0.25;
        animV = v1 + (v2 - v1) * t;
        animP = p1 * Math.pow(v1 / animV, gamma);
      } else if (animT < 0.5) {
        const t = (animT - 0.25) / 0.25;
        animV = v2 + (v3 - v2) * t;
        animP = p2 * Math.pow(v2 / animV, gamma);
      } else if (animT < 0.75) {
        const t = (animT - 0.5) / 0.25;
        animV = v3 + (v4 - v3) * t;
        animP = p3 * Math.pow(v3 / animV, gamma);
      } else {
        const t = (animT - 0.75) / 0.25;
        animV = v4 + (v1 - v4) * t;
        animP = p4 * Math.pow(v4 / animV, gamma);
      }

      ctx.beginPath();
      ctx.arc(toX(animV), toY(animP), 7, 0, Math.PI * 2);
      ctx.fillStyle = "#fbbf24";
      ctx.fill();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.stroke();

      for (const pt of cyclePts) {
        ctx.beginPath();
        ctx.arc(toX(pt.v), toY(pt.p), 5, 0, Math.PI * 2);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 12px system-ui";
        ctx.fillText(pt.label, toX(pt.v) + 8, toY(pt.p) - 8);
      }

      ctx.fillStyle = "#dc2626";
      ctx.font = "11px system-ui";
      ctx.fillText("1→2: Isothermal expansion (Th)", toX(v1) + 5, toY(p1) - 18);
      ctx.fillStyle = "#f97316";
      ctx.fillText("2→3: Adiabatic expansion", toX(v2) + 5, toY(p2) - 18);
      ctx.fillStyle = "#3b82f6";
      ctx.fillText("3→4: Isothermal compression (Tc)", toX(v3) + 5, toY(p3) + 20);
      ctx.fillStyle = "#6366f1";
      ctx.fillText("4→1: Adiabatic compression", toX(v4) + 5, toY(p4) + 20);

      ctx.fillStyle = "#92400e";
      ctx.font = "bold 13px system-ui";
      const areaX = pad.l + gw * 0.55;
      const areaY = pad.t + gh * 0.45;
      ctx.fillText(`η = 1 − Tc/Th = ${(eff * 100).toFixed(1)}%`, areaX - 60, areaY);
      ctx.fillStyle = "#78716c";
      ctx.font = "11px system-ui";
      ctx.fillText(`Work done = ${(eff * 100).toFixed(0)}% of Qh`, areaX - 60, areaY + 18);
    },
    [sim.tick, eff, p1, v1, p2, v2, p3, v3, p4, v4, gamma]
  );

  return (
    <SimShell
      icon="🔥"
      title={simTitle(topic, "Carnot Engine — Ideal Heat Engine")}
      accent="rose"
      subtitle={`${topic ?? "Carnot engine"} — The most efficient heat engine possible: two isothermal and two adiabatic steps. Efficiency depends only on the hot and cold reservoir temperatures.`}
      hint={`η = 1 − Tc/Th. No real engine can exceed Carnot efficiency. Increasing Th or decreasing Tc improves efficiency.`}
      controls={<SimChip accent="rose"><span aria-hidden>🔥</span>{topic ?? "carnot"}</SimChip>}
    >
      <SimCanvas deps={[sim.tick, th, tc]} draw={draw} />

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} hex={a} />
        <Slider label="Hot reservoir (Th)" value={th} min={400} max={1000} step={10} unit="K" hex="#dc2626" onChange={setTh} />
        <Slider label="Cold reservoir (Tc)" value={tc} min={200} max={500} step={10} unit="K" hex="#3b82f6" onChange={setTc} />
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        <Stat label="Th" value={`${th} K`} accent={at} />
        <Stat label="Tc" value={`${tc} K`} accent={at} />
        <Stat label="Efficiency" value={`${(eff * 100).toFixed(1)}%`} accent={at} />
        <Stat label="Qh → W" value={`${(eff * 100).toFixed(0)}%`} accent={at} />
        <Stat label="Qc waste" value={`${((1 - eff) * 100).toFixed(0)}%`} accent={at} />
      </div>
    </SimShell>
  );
}
