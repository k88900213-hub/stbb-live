"use client";

import { useState, useCallback } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";

export function ColligativePropertiesSim({ topic }: { topic?: string }) {
  const a = "#0ea5e9";
  const at = "text-sky-600 dark:text-sky-400";

  const [soluteMoles, setSoluteMoles] = useState(0);
  const [externalP, setExternalP] = useState(101.3);
  const sim = useSim({ fps: 30 });

  const pureVp = 101.3;
  const vp = pureVp * Math.max(0.05, 1 - soluteMoles * 0.08);
  const boilingPt = 100 + (soluteMoles * 2.8);
  const fpDepression = soluteMoles * 1.86;
  const freezingPt = -fpDepression;
  const doesBoil = vp >= externalP;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.35;
      const liquidTop = h * 0.48;
      const liquidBot = h * 0.82;
      const liquidL = cx - 70;
      const liquidR = cx + 70;

      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(liquidL, liquidTop);
      ctx.lineTo(liquidL, liquidBot + 10);
      ctx.lineTo(liquidR, liquidBot + 10);
      ctx.lineTo(liquidR, liquidTop);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(liquidL - 15, liquidTop);
      ctx.lineTo(liquidR + 15, liquidTop);
      ctx.stroke();

      const waterGrad = ctx.createLinearGradient(0, liquidTop, 0, liquidBot);
      waterGrad.addColorStop(0, "rgba(56,189,248,0.35)");
      waterGrad.addColorStop(1, "rgba(14,116,144,0.55)");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(liquidL + 2, liquidTop + 1, liquidR - liquidL - 3, liquidBot - liquidTop - 1);

      if (soluteMoles > 0) {
        const nDots = Math.min(30, Math.floor(soluteMoles * 4));
        for (let i = 0; i < nDots; i++) {
          const dx = liquidL + 10 + ((i * 37 + sim.tick * 0.3) % (liquidR - liquidL - 20));
          const dy = liquidTop + 15 + ((i * 53) % (liquidBot - liquidTop - 30));
          ctx.beginPath();
          ctx.arc(dx, dy, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#f97316";
          ctx.fill();
        }
        ctx.fillStyle = "#c2410c";
        ctx.font = "bold 11px system-ui";
        ctx.fillText("solute", cx - 14, liquidBot + 24);
      }

      const nVap = doesBoil ? 12 : 6;
      for (let i = 0; i < nVap; i++) {
        const vx = liquidL + 10 + ((i * 47 + sim.tick * (doesBoil ? 1.5 : 0.6)) % (liquidR - liquidL - 20));
        const vy = liquidTop - 10 - ((i * 31 + sim.tick * (doesBoil ? 1.2 : 0.4)) % (liquidTop - 20));
        ctx.beginPath();
        ctx.arc(vx, vy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = doesBoil ? "rgba(239,68,68,0.7)" : "rgba(59,130,246,0.5)";
        ctx.fill();
      }

      const barX = w * 0.7;
      const barW = 50;
      const barTop = h * 0.15;
      const barBot = h * 0.85;
      const barH = barBot - barTop;

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX, barTop, barW, barH);

      const maxP = 200;
      const vpH = (vp / maxP) * barH;
      const extH = (externalP / maxP) * barH;

      ctx.fillStyle = "rgba(59,130,246,0.3)";
      ctx.fillRect(barX, barBot - vpH, barW, vpH);
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(barX - 5, barBot - vpH);
      ctx.lineTo(barX + barW + 5, barBot - vpH);
      ctx.stroke();

      ctx.strokeStyle = "#ef4444";
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(barX - 8, barBot - extH);
      ctx.lineTo(barX + barW + 8, barBot - extH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#1e293b";
      ctx.font = "10px system-ui";
      ctx.fillText(`VP = ${vp.toFixed(1)}`, barX + barW + 10, barBot - vpH + 4);
      ctx.fillStyle = "#ef4444";
      ctx.fillText(`P_ext = ${externalP.toFixed(0)}`, barX + barW + 10, barBot - extH + 4);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 12px system-ui";
      ctx.fillText("Vapor pressure", barX - 10, barTop - 12);
      ctx.fillText("barometer", barX + 2, barTop - 1);

      if (doesBoil) {
        ctx.fillStyle = "#dc2626";
        ctx.font = "bold 14px system-ui";
        ctx.fillText("BOILING", cx - 22, liquidTop - 18);
      } else {
        ctx.fillStyle = "#3b82f6";
        ctx.font = "12px system-ui";
        ctx.fillText("not boiling", cx - 25, liquidTop - 18);
      }

      ctx.fillStyle = "#475569";
      ctx.font = "11px system-ui";
      ctx.fillText(`ΔTb = +${fpDepression.toFixed(2)}°C → bp = ${boilingPt.toFixed(1)}°C`, 20, 20);
      ctx.fillText(`ΔTf = −${fpDepression.toFixed(2)}°C → fp = ${freezingPt.toFixed(1)}°C`, 20, 36);
    },
    [sim.tick, soluteMoles, externalP, vp, doesBoil, boilingPt, fpDepression, freezingPt]
  );

  return (
    <SimShell
      icon="🧪"
      title={simTitle(topic, "Colligative Properties — Vapor Pressure & Boiling")}
      accent="sky"
      subtitle={`${topic ?? "Colligative properties"} — Adding a non-volatile solute lowers vapor pressure (Raoult's law), raises the boiling point (ΔTb = Kb·m) and depresses the freezing point (ΔTf = Kf·m).`}
      hint={`Vapor pressure ${pureVp.toFixed(0)} → ${vp.toFixed(1)} mmHg. Boiling point raised by ${fpDepression.toFixed(2)}°C to ${boilingPt.toFixed(1)}°C. These depend only on the NUMBER of solute particles, not their identity.`}
      controls={<SimChip accent="sky"><span aria-hidden>🧪</span>{topic ?? "colligative"}</SimChip>}
    >
      <SimCanvas deps={[sim.tick, soluteMoles, externalP]} draw={draw} />

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} hex={a} />
        <Slider label="Solute (moles)" value={soluteMoles} min={0} max={6} step={0.5} unit="mol" hex={a} onChange={setSoluteMoles} />
        <Slider label="External pressure" value={externalP} min={80} max={160} step={1} unit="mmHg" hex={a} onChange={setExternalP} />
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        <Stat label="Pure VP" value={`${pureVp.toFixed(0)} mmHg`} accent={at} />
        <Stat label="Solution VP" value={`${vp.toFixed(1)} mmHg`} accent={at} />
        <Stat label="Boiling pt" value={`${boilingPt.toFixed(1)} °C`} accent={at} />
        <Stat label="Freezing pt" value={`${freezingPt.toFixed(1)} °C`} accent={at} />
        <Stat label="ΔTb" value={`+${fpDepression.toFixed(2)} °C`} accent={at} />
        <Stat label="ΔTf" value={`−${fpDepression.toFixed(2)} °C`} accent={at} />
      </div>
    </SimShell>
  );
}
