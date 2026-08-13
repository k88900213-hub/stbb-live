"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

function forceMode(topic?: string): "block" | "hooke" | "collision" {
  const t = topic?.toLowerCase() ?? "";
  if (/hooke|spring|elastic/.test(t)) return "hooke";
  if (/momentum|collision|impulse|conservation/.test(t)) return "collision";
  return "block";
}

export function ForceSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const mode = forceMode(topic);

  const [mass, setMass] = useState(2);
  const [appliedForce, setAppliedForce] = useState(30);
  const [frictionOn, setFrictionOn] = useState(true);
  const [mu, setMu] = useState(0.4);
  const [k, setK] = useState(200);
  const [weight, setWeight] = useState(40);
  const [m1, setM1] = useState(3);
  const [m2, setM2] = useState(1);
  const [v1, setV1] = useState(2);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul, autoRun: false });

  const g = 9.8;
  const muS = frictionOn ? mu : 0;
  const muK = frictionOn ? mu * 0.85 : 0;
  const maxStatic = muS * mass * g;
  const t = sim.elapsed;
  const vel = Math.max(((appliedForce - (muK * mass * g)) / mass) * t, 0);
  const moving = vel > 0.01;
  const frictionForce = moving ? muK * mass * g : Math.min(maxStatic, appliedForce);
  const net = appliedForce - frictionForce;
  const acc = net / mass;
  const pos = Math.max(120, Math.min(120 + 0.5 * acc * t * t * 28, 560));
  const atRest =
    moving
      ? "moving"
      : appliedForce > maxStatic + 0.01
        ? "about to move"
        : frictionOn
          ? "at rest (static friction holds)"
          : "at rest";

  const extension = weight / k;
  const p = m1 * v1;
  const vAfter = p / (m1 + m2);
  const colPhase = (sim.tick % 80) / 80;

  const sub =
    mode === "hooke"
      ? `${topic ?? "Forces"} — Hooke's law: doubling the force doubles the stretch, F = kx.`
      : mode === "collision"
        ? `${topic ?? "Forces"} — set masses and speeds and check that momentum is conserved.`
        : `${topic ?? "Forces"} — push a block and watch friction fight back.`;
  const hint =
    mode === "hooke"
      ? "F = kx, where k is the spring constant. Beyond the elastic limit the spring no longer obeys the rule and stays stretched."
      : mode === "collision"
        ? "Momentum is conserved when no external force acts: total momentum before equals total momentum after. Recoil and billiard balls both obey it."
        : "Turn friction OFF, push the block, then drop the force to 0 N. The block keeps gliding at constant velocity — an object in motion stays in motion without a force (Newton's first law).";

  return (
    <SimShell
      icon="🚀"
      title={simTitle(topic, "Force Simulator")}
      accent="orange"
      subtitle={sub}
      hint={hint}
      controls={
        <>
          {topic && <SimChip accent="orange">{topic}</SimChip>}
          {mode === "block" && <SimChip accent={frictionOn ? "slate" : "lime"}>{frictionOn ? "friction ON" : "friction OFF"}</SimChip>}
        </>
      }
    >
      <SimCanvas
        deps={[mode, mass, appliedForce, frictionOn, k, weight, m1, m2, v1, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);

          if (mode === "block") {
            const groundY = h - 40;
            ctx.strokeStyle = "rgba(100,116,139,0.35)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(w, groundY);
            ctx.stroke();
            ctx.strokeStyle = "rgba(249,115,22,0.3)";
            ctx.lineWidth = 4;
            const forceLen = Math.min(appliedForce * 2, 200);
            ctx.beginPath();
            ctx.moveTo(pos + 70, groundY - 25);
            ctx.lineTo(pos + 70 + forceLen, groundY - 25);
            ctx.stroke();
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.moveTo(pos + 70 + forceLen, groundY - 25);
            ctx.lineTo(pos + 70 + forceLen - 12, groundY - 31);
            ctx.lineTo(pos + 70 + forceLen - 12, groundY - 19);
            ctx.closePath();
            ctx.fill();
            if (frictionOn && frictionForce > 0.1) {
              const fLen = Math.min(frictionForce * 1.4, 100);
              ctx.strokeStyle = "#94a3b8";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(pos, groundY - 25);
              ctx.lineTo(pos - fLen, groundY - 25);
              ctx.stroke();
              ctx.fillStyle = "#94a3b8";
              ctx.beginPath();
              ctx.moveTo(pos - fLen, groundY - 25);
              ctx.lineTo(pos - fLen + 12, groundY - 31);
              ctx.lineTo(pos - fLen + 12, groundY - 19);
              ctx.closePath();
              ctx.fill();
              ctx.font = "bold 11px system-ui";
              ctx.fillText(`${frictionForce.toFixed(0)} N friction`, 40, groundY - 60);
            }
            for (let tt = 0; tt <= t; tt += 0.2) {
              const px = Math.max(120, Math.min(120 + 0.5 * acc * tt * tt * 28, 560));
              ctx.globalAlpha = (tt / Math.max(t, 0.001)) * 0.4;
              ctx.fillStyle = "#fdba74";
              ctx.beginPath();
              ctx.arc(px, groundY - 25, 3, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.globalAlpha = 1;
            const grad = ctx.createLinearGradient(0, groundY - 50, 0, groundY);
            grad.addColorStop(0, "#fdba74");
            grad.addColorStop(1, "#f97316");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(pos, groundY - 50, 70, 50, 8);
            ctx.fill();
            ctx.fillStyle = "#7c2d12";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(`${mass} kg`, pos + 18, groundY - 22);
            ctx.fillStyle = "#c2410c";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`applied ${appliedForce} N`, 30, 26);
            ctx.fillStyle = "#475569";
            ctx.fillText(`net = ${net.toFixed(1)} N  a = ${acc.toFixed(2)} m/s2`, 30, 46);
          }

          if (mode === "hooke") {
            const cx = w / 2;
            const topY = 30;
            const ext = Math.min(extension * 4, 130);
            const endY = topY + 50 + ext;
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, topY - 4);
            ctx.lineTo(cx, topY + 10);
            ctx.stroke();
            ctx.strokeStyle = "#f97316";
            ctx.lineWidth = 2.5;
            const coils = 7;
            for (let i = 0; i < coils; i++) {
              const y0 = topY + 12 + (i * (endY - topY - 12)) / coils;
              const y1 = topY + 12 + ((i + 1) * (endY - topY - 12)) / coils;
              ctx.beginPath();
              ctx.moveTo(cx - 20, y0);
              ctx.quadraticCurveTo(cx + 20, (y0 + y1) / 2, cx - 20, y1);
              ctx.stroke();
            }
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.roundRect(cx - 24, endY, 48, 42, 8);
            ctx.fill();
            ctx.fillStyle = "#7c2d12";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(`${weight} N`, cx - 18, endY + 26);
            ctx.strokeStyle = "rgba(249,115,22,0.5)";
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(cx + 34, topY);
            ctx.lineTo(cx + 34, endY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#f97316";
            ctx.font = "12px system-ui";
            ctx.fillText(`x = ${(extension * 100).toFixed(1)} cm`, cx + 42, (topY + endY) / 2);
            ctx.fillText("F = kx", 30, h - 14);
          }

          if (mode === "collision") {
            const groundY = h - 46;
            ctx.strokeStyle = "rgba(100,116,139,0.35)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(w, groundY);
            ctx.stroke();
            const dx = colPhase * 240;
            const xA = 120 - dx;
            const xB = 120 - dx + 130;
            const joined = colPhase > 0.55;
            const xJ = 120 - dx + 60;
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.roundRect(xA, groundY - 40, 60, 40, 8);
            ctx.fill();
            ctx.fillStyle = "#8b5cf6";
            ctx.beginPath();
            ctx.roundRect(xB, groundY - 40, 60, 40, 8);
            ctx.fill();
            if (joined) {
              ctx.fillStyle = "#a78bfa";
              ctx.fillRect(xJ + 46, groundY - 40, 14, 40);
              ctx.fillRect(xJ, groundY - 40, 14, 40);
              ctx.fillStyle = "#fff";
              ctx.font = "bold 12px system-ui";
              ctx.fillText(`${(m1 + m2).toFixed(1)} kg`, xJ + 14, groundY - 16);
            } else {
              ctx.fillStyle = "#fff";
              ctx.font = "bold 12px system-ui";
              ctx.fillText(`A ${m1} kg`, xA + 10, groundY - 16);
              ctx.fillText(`B ${m2} kg`, xB + 10, groundY - 16);
              ctx.fillStyle = "#f97316";
              ctx.font = "bold 11px system-ui";
              ctx.fillText(`v = ${v1.toFixed(1)} m/s`, xA + 6, groundY - 50);
              ctx.fillStyle = "#94a3b8";
              ctx.fillText("at rest", xB + 8, groundY - 50);
            }
            ctx.fillStyle = "#9a3412";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(`momentum before = ${p.toFixed(1)} kg·m/s`, 30, 26);
            ctx.fillText(`after: v = ${vAfter.toFixed(2)} m/s, p = ${p.toFixed(1)} kg·m/s`, 30, 46);
          }
        }}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {mode === "block" && (
          <>
            <Slider label="Applied force" value={appliedForce} min={0} max={60} step={1} hex={a} accent={at} unit=" N" onChange={setAppliedForce} />
            <Slider label="Mass" value={mass} min={0.5} max={10} step={0.5} hex={a} accent={at} unit=" kg" onChange={setMass} />
            <Slider label="Friction coefficient (μ)" value={mu} min={0} max={1} step={0.05} hex={a} accent={at} onChange={setMu} />
            <Toggle label="Friction" hint="static then kinetic μ" checked={frictionOn} onChange={setFrictionOn} hex={a} />
          </>
        )}
        {mode === "hooke" && (
          <>
            <Slider label="Spring constant (k)" value={k} min={50} max={500} step={10} hex={a} accent={at} unit=" N/m" onChange={setK} />
            <Slider label="Weight (F)" value={weight} min={0} max={200} step={5} hex={a} accent={at} unit=" N" onChange={setWeight} />
          </>
        )}
        {mode === "collision" && (
          <>
            <Slider label="Mass A" value={m1} min={1} max={8} step={0.5} hex={a} accent={at} unit=" kg" onChange={setM1} />
            <Slider label="Mass B (at rest)" value={m2} min={0.5} max={6} step={0.5} hex={a} accent={at} unit=" kg" onChange={setM2} />
            <Slider label="Speed of A before collision" value={v1} min={0.5} max={6} step={0.25} hex={a} accent={at} unit=" m/s" onChange={setV1} />
          </>
        )}
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {mode === "block" && (
          <>
            <Stat label="Net force" value={`${net.toFixed(1)} N`} accent={at} />
            <Stat label="Acceleration" value={`${acc.toFixed(2)} m/s2`} accent={at} />
            <Stat label="Velocity" value={`${vel.toFixed(2)} m/s`} accent={at} />
            <Stat label="Friction" value={`${frictionForce.toFixed(1)} N`} accent={at} />
            <Stat label="Max static friction" value={`${maxStatic.toFixed(1)} N`} accent={at} />
            <Stat label="Status" value={atRest} accent={at} />
          </>
        )}
        {mode === "hooke" && (
          <>
            <Stat label="Force (F)" value={`${weight.toFixed(0)} N`} accent={at} />
            <Stat label="Spring const (k)" value={`${k.toFixed(0)} N/m`} accent={at} />
            <Stat label="Extension (x)" value={`${(extension * 100).toFixed(1)} cm`} accent={at} />
            <Stat label="Check k·x" value={`${(k * extension).toFixed(0)} N`} accent={at} />
          </>
        )}
        {mode === "collision" && (
          <>
            <Stat label="Momentum before" value={`${p.toFixed(1)} kg·m/s`} accent={at} />
            <Stat label="Total mass" value={`${(m1 + m2).toFixed(1)} kg`} accent={at} />
            <Stat label="Velocity after" value={`${vAfter.toFixed(2)} m/s`} accent={at} />
            <Stat label="Momentum after" value={`${p.toFixed(1)} kg·m/s`} accent={at} />
          </>
        )}
      </div>
    </SimShell>
  );
}
