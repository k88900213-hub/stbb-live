"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";

type GravMode = "attract" | "weight" | "pendulum" | "variation";

function gravMode(topic?: string): GravMode {
  const t = topic?.toLowerCase() ?? "";
  if (/weight|mass and weight/.test(t)) return "weight";
  if (/pendulum/.test(t)) return "pendulum";
  if (/variation|altitude|latitude/.test(t)) return "variation";
  return "attract";
}

export function GravitySim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const mode = gravMode(topic);
  const [massA, setMassA] = useState(6);
  const [massB, setMassB] = useState(2);
  const [baseD, setBaseD] = useState(200);
  const [length, setLength] = useState(1.2);
  const [altitude, setAltitude] = useState(0);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });

  const G = 1.6;
  const gAlt = 9.8 * (6371 / (6371 + altitude)) ** 2;
  const T = 2 * Math.PI * Math.sqrt(length / 9.8);
  const swing = Math.sin(sim.tick * 0.05) * 45;
  const d = Math.max(60, baseD - sim.elapsed * ((G * massA * massB) / 400));
  const f = (G * massA * massB) / (d * d);
  const gLab = ((4 * Math.PI * Math.PI * length) / (T * T)).toFixed(2);
  const vOrb = Math.sqrt((G * massA) / d);
  const vEsc = Math.sqrt((2 * G * massA) / d);
  const ke = 0.5 * massB * vOrb * vOrb;
  const pe = (-G * massA * massB) / d;
  const totalE = ke + pe;

  const sub =
    mode === "weight"
      ? "Mass stays the same everywhere; weight is the pull of gravity, so the same mass weighs less on the Moon than on Earth."
      : mode === "pendulum"
        ? "A pendulum lets you measure g: swing the bob, time the period and use T = 2π√(L/g)."
        : mode === "variation"
          ? "Gravity weakens as you climb. Higher altitude → smaller g → a spring balance reads less."
          : "Two masses attract each other. Force grows with mass and shrinks with the square of the distance.";
  const hint =
    mode === "weight"
      ? "Weight = m × g. The same 12 kg mass: 117.6 N on Earth but only 19.6 N on the Moon (g ≈ 1.63 m/s²). Mass never changes — gravity does."
      : mode === "pendulum"
        ? "For a pendulum, T = 2π√(L/g), so g = 4π²L/T². The period depends on length and gravity — never on the bob's mass."
        : mode === "variation"
          ? "g = 9.8 × (R/(R + h))². At 6,000 km altitude gravity has almost halved — a satellite feels it as near-weightlessness."
          : "Newton's law: F = G·m1·m2 / r2. The same law that holds the Moon in orbit also pulls a mango off the tree.";

  return (
    <SimShell
      icon="🌍"
      title={simTitle(topic, "Universal gravitation")}
      accent="violet"
      subtitle={sub}
      hint={hint}
      controls={topic ? <SimChip accent="violet">{topic}</SimChip> : undefined}
    >
      {mode === "weight" ? (
        <>
          <div className="flex h-48 w-full items-end justify-center gap-10 rounded-xl border border-foreground/10 bg-white/40 dark:bg-white/5">
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative flex w-20 items-end justify-center rounded-xl bg-white/30 dark:bg-white/10" style={{ height: 130 }}>
                <div className="absolute bottom-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-slate-600 text-[10px] font-bold text-white">{massA} kg</div>
                <div className="absolute inset-x-0 top-1 text-center text-[10px] text-foreground/60">{Math.round(massA * 9.8)} N</div>
              </div>
              <div className="text-xs text-foreground/60">Earth (g = 9.8)</div>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative flex w-20 items-end justify-center rounded-xl bg-white/30 dark:bg-white/10" style={{ height: 130 }}>
                <div className="absolute bottom-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-slate-600 text-[10px] font-bold text-white">{massA} kg</div>
                <div className="absolute inset-x-0 top-1 text-center text-[10px] text-foreground/60">{Math.round(massA * 1.63)} N</div>
              </div>
              <div className="text-xs text-foreground/60">Moon (g = 1.63)</div>
            </div>
          </div>
          <div className="mt-4">
            <Slider label="Mass" value={massA} min={1} max={20} step={1} hex={a} accent={at} unit=" kg" onChange={setMassA} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Weight on Earth" value={`${(massA * 9.8).toFixed(1)} N`} accent={at} />
            <Stat label="Weight on Moon" value={`${(massA * 1.63).toFixed(1)} N`} accent={at} />
          </div>
        </>
      ) : mode === "pendulum" ? (
        <>
          <SimCanvas
            deps={[length, sim.tick]}
            draw={(ctx) => {
              const w = ctx.canvas.width;
              const h = ctx.canvas.height;
              ctx.clearRect(0, 0, w, h);
              const cx = w / 2;
              const pivotY = 30;
              ctx.strokeStyle = "#94a3b8";
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(20, pivotY);
              ctx.lineTo(w - 20, pivotY);
              ctx.stroke();
              ctx.fillStyle = "#8b5cf6";
              ctx.beginPath();
              ctx.arc(cx, pivotY, 6, 0, Math.PI * 2);
              ctx.fill();
              const rodLen = 140;
              const bobX = cx + Math.sin((swing * Math.PI) / 180) * rodLen;
              const bobY = pivotY + Math.cos((swing * Math.PI) / 180) * rodLen;
              ctx.strokeStyle = "#a78bfa";
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(cx, pivotY);
              ctx.lineTo(bobX, bobY);
              ctx.stroke();
              const grad = ctx.createRadialGradient(bobX - 3, bobY - 3, 3, bobX, bobY, 18);
              grad.addColorStop(0, "#fff");
              grad.addColorStop(0.5, "#8b5cf6");
              grad.addColorStop(1, "#5b21b6");
              ctx.fillStyle = grad;
              ctx.shadowColor = "#8b5cf6";
              ctx.shadowBlur = 16;
              ctx.beginPath();
              ctx.arc(bobX, bobY, 16, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.strokeStyle = "rgba(139,92,246,0.4)";
              ctx.setLineDash([4, 5]);
              ctx.beginPath();
              ctx.arc(cx, pivotY, rodLen, 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.fillStyle = "#7c3aed";
              ctx.font = "bold 13px system-ui";
              ctx.fillText(`T = ${T.toFixed(2)} s`, 30, 26);
              ctx.fillText(`length ${length.toFixed(2)} m`, 30, 46);
              ctx.fillText(`g measured = ${gLab} m/s2`, 30, 66);
            }}
          />
          <div className="mt-4">
            <Slider label="Length of string" value={length} min={0.2} max={2} step={0.05} hex={a} accent={at} unit=" m" onChange={setLength} />
          </div>
          <div className="mt-3">
            <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Period" value={`T = ${T.toFixed(2)} s`} accent={at} />
            <Stat label="Measured g" value={`${gLab} m/s2`} accent={at} />
          </div>
        </>
      ) : mode === "variation" ? (
        <>
          <SimCanvas
            deps={[massA, altitude, sim.tick]}
            draw={(ctx) => {
              const w = ctx.canvas.width;
              const h = ctx.canvas.height;
              ctx.clearRect(0, 0, w, h);
              const frac = gAlt / 9.8;
              ctx.fillStyle = "rgba(139,92,246,0.25)";
              ctx.fillRect(0, h - 40, w, 40);
              ctx.fillStyle = "#8b5cf6";
              ctx.fillRect(0, h - 44, w, 4);
              const ballY = h - 40 - 20 - frac * 130;
              const grad = ctx.createRadialGradient(w / 2 - 3, ballY - 3, 3, w / 2, ballY, 18);
              grad.addColorStop(0, "#fff");
              grad.addColorStop(0.5, "#8b5cf6");
              grad.addColorStop(1, "#5b21b6");
              ctx.fillStyle = grad;
              ctx.shadowColor = "#8b5cf6";
              ctx.shadowBlur = 16;
              ctx.beginPath();
              ctx.arc(w / 2, ballY, 14, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.strokeStyle = "rgba(255,255,255,0.6)";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(w / 2 - 40, ballY);
              ctx.lineTo(w / 2 + 40, ballY);
              ctx.stroke();
              ctx.fillStyle = "#7c3aed";
              ctx.font = "bold 14px system-ui";
              ctx.fillText(`g = ${gAlt.toFixed(2)} m/s2`, 30, 28);
              ctx.fillStyle = "#64748b";
              ctx.font = "12px system-ui";
              ctx.fillText(`altitude ${altitude} km`, 30, 48);
              ctx.fillText(`weight = ${massA} × ${gAlt.toFixed(2)} = ${(massA * gAlt).toFixed(1)} N`, 30, 68);
              ctx.fillText("surface g = 9.8 m/s2", 30, h - 14);
            }}
          />
          <div className="mt-4">
            <Slider label="Altitude above surface" value={altitude} min={0} max={12000} step={100} hex={a} accent={at} unit=" km" onChange={setAltitude} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Surface value" value="9.8 m/s2" accent={at} />
            <Stat label="At this height" value={`${gAlt.toFixed(2)} m/s2`} accent={at} />
          </div>
        </>
      ) : (
        <>
          <SimCanvas
            deps={[massA, massB, baseD, sim.tick]}
            draw={(ctx) => {
              const w = ctx.canvas.width;
              const h = ctx.canvas.height;
              ctx.clearRect(0, 0, w, h);
              const cy = h / 2;
              const aX = w / 2 - d / 2;
              const bX = w / 2 + d / 2;
              ctx.strokeStyle = "rgba(139,92,246,0.45)";
              ctx.lineWidth = 2;
              ctx.setLineDash([6, 6]);
              ctx.beginPath();
              ctx.moveTo(aX, cy);
              ctx.lineTo(bX, cy);
              ctx.stroke();
              ctx.setLineDash([]);
              const mag = Math.min(f * 22, 80);
              const grad = ctx.createLinearGradient(w / 2, cy, w / 2 - mag, cy);
              grad.addColorStop(0, "#fb923c");
              grad.addColorStop(1, "#f97316");
              ctx.strokeStyle = grad;
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(w / 2, cy);
              ctx.lineTo(w / 2 - mag, cy);
              ctx.stroke();
              ctx.fillStyle = "#f97316";
              ctx.beginPath();
              ctx.moveTo(w / 2 - mag, cy);
              ctx.lineTo(w / 2 - mag + 12, cy - 5);
              ctx.lineTo(w / 2 - mag + 12, cy + 5);
              ctx.closePath();
              ctx.fill();
              const drawPlanet = (x: number, r: number, color: string, label: string) => {
                const pg = ctx.createRadialGradient(x - r * 0.35, cy - r * 0.35, r * 0.2, x, cy, r);
                pg.addColorStop(0, "#ffffff");
                pg.addColorStop(0.4, color);
                pg.addColorStop(1, "rgba(0,0,0,0.35)");
                ctx.fillStyle = pg;
                ctx.shadowColor = color;
                ctx.shadowBlur = 18;
                ctx.beginPath();
                ctx.arc(x, cy, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = "#fff";
                ctx.font = "bold 11px system-ui";
                ctx.textAlign = "center";
                ctx.fillText(label, x, cy + r + 16);
                ctx.textAlign = "start";
              };
              drawPlanet(aX, 10 + massA * 1.4, "#f97316", `${massA} kg`);
              drawPlanet(bX, 10 + massB * 1.4, "#8b5cf6", `${massB} kg`);
              ctx.fillStyle = "#6d28d9";
              ctx.font = "bold 14px system-ui";
              ctx.fillText(`F = ${f.toFixed(1)} N`, 30, 26);
              ctx.fillStyle = "#64748b";
              ctx.font = "12px system-ui";
              ctx.fillText(`r = ${d.toFixed(0)} px · F = G m1m2 / r2`, 30, 46);
              ctx.fillStyle = "#6d28d9";
              ctx.font = "bold 12px system-ui";
              ctx.fillText(`v_orb = ${vOrb.toFixed(2)} · v_esc = ${vEsc.toFixed(2)} px/s`, 30, 68);
            }}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Slider label="Mass A" value={massA} min={1} max={12} step={1} hex={a} accent={at} unit=" ×1024 kg" onChange={setMassA} />
            <Slider label="Mass B" value={massB} min={1} max={12} step={1} hex={a} accent={at} unit=" ×1024 kg" onChange={setMassB} />
            <Slider label="Separation (r)" value={baseD} min={100} max={340} step={5} hex={a} accent={at} unit=" px" onChange={setBaseD} />
          </div>
          <div className="mt-3">
            <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Force (Newton)" value="F = G m1m2 / r2" accent={at} />
            <Stat label="Inverse-square" value="double r → F ÷ 4" accent={at} />
            <Stat label="Orbital speed" value={`v = √(Gm1/r) = ${vOrb.toFixed(2)}`} accent={at} />
            <Stat label="Escape speed" value={`v = √(2Gm1/r) = ${vEsc.toFixed(2)}`} accent={at} />
            <Stat label="Kinetic energy" value={`${ke.toFixed(2)} J`} accent={at} />
            <Stat label="Gravitational PE" value={`${pe.toFixed(2)} J`} accent={at} />
            <Stat label="Total E (KE + PE)" value={`${totalE.toFixed(2)} J (bound if < 0)`} accent={at} />
          </div>
        </>
      )}
    </SimShell>
  );
}
