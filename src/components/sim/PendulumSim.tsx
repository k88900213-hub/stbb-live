"use client";

import { useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";

type PendulumMode = "length" | "gravity";

function pendulumMode(topic?: string): PendulumMode {
  const t = topic?.toLowerCase() ?? "";
  if (/gravity|planet|moon|mars|g value|acceleration due/.test(t)) return "gravity";
  return "length";
}

const PLANETS: { name: string; g: number }[] = [
  { name: "Moon", g: 1.6 },
  { name: "Earth", g: 9.8 },
  { name: "Mars", g: 3.7 },
  { name: "Jupiter", g: 24.8 },
];

export function PendulumSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "sky";
  const a = ACCENTS[accent];
  const mode = pendulumMode(topic);

  const [length, setLength] = useState(1);
  const [planetIdx, setPlanetIdx] = useState(1);
  const [mass, setMass] = useState(1);
  const [damping, setDamping] = useState(0.06);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });

  const g = PLANETS[planetIdx].g;
  const omega = Math.sqrt(g / length);
  const period = 2 * Math.PI * Math.sqrt(length / g);
  const time = sim.elapsed;
  const theta0 = 0.35;
  const decay = Math.exp(-damping * omega * time);
  const theta = theta0 * Math.cos(omega * time) * decay;
  const dTheta = -theta0 * omega * Math.sin(omega * time) * decay;
  const bobSpeed = length * Math.abs(dTheta);
  const h = length * (1 - Math.cos(theta));
  const pe = mass * g * h;
  const ke = 0.5 * mass * bobSpeed * bobSpeed;
  const E0 = mass * g * length * (1 - Math.cos(theta0));
  const totalE = pe + ke;

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const pivotX = 150;
    const pivotY = 36;
    const pxPerM = 100;
    const rodLen = Math.min(length * pxPerM, 195);
    const bobX = pivotX + rodLen * Math.sin(theta);
    const bobY = pivotY + rodLen * Math.cos(theta);

    ctx.fillStyle = "rgba(14,165,233,0.45)";
    ctx.fillRect(pivotX - 110, pivotY - 7, 190, 9);
    ctx.fillStyle = "#0ea5e9";
    ctx.fillRect(pivotX - 6, pivotY - 7, 12, 12);

    ctx.strokeStyle = "rgba(14,165,233,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX + rodLen * Math.sin(-theta0), pivotY + rodLen * Math.cos(-theta0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX + rodLen * Math.sin(theta0), pivotY + rodLen * Math.cos(theta0));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(14,165,233,0.85)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    ctx.shadowColor = "rgba(14,165,233,0.45)";
    ctx.shadowBlur = 12;
    const grad = ctx.createRadialGradient(bobX - 5, bobY - 5, 2, bobX, bobY, 15);
    grad.addColorStop(0, "#7dd3fc");
    grad.addColorStop(1, "#0284c7");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bobX, bobY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "rgba(14,165,233,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 240);
    ctx.lineTo(260, 240);
    ctx.stroke();

    ctx.fillStyle = "#0369a1";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`v = ${bobSpeed.toFixed(2)} m/s`, bobX + 18, bobY - 10);

    const gx = 300;
    const gy = 40;
    const gw = w - gx - 24;
    const gh = h - gy - 40;
    ctx.strokeStyle = "rgba(100,116,139,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx + gw, gy + gh);
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx, gy);
    ctx.stroke();

    const span = period * 1.6;
    const yOf = (t: number) => gy + gh / 2 - theta0 * 55 * Math.cos(omega * t) * Math.exp(-damping * omega * t);
    ctx.strokeStyle = a.hex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= gw; i += 3) {
      const t = (i / gw) * span;
      const y = yOf(t);
      if (i === 0) ctx.moveTo(gx + i, y);
      else ctx.lineTo(gx + i, y);
    }
    ctx.stroke();

    const nowT = time % span;
    ctx.fillStyle = a.hex;
    ctx.beginPath();
    ctx.arc(gx + (nowT / span) * gw, yOf(nowT), 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0369a1";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(`L = ${length.toFixed(2)} m   g = ${g.toFixed(1)} m/s2   T = ${period.toFixed(2)} s`, gx, gy + gh + 18);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("angle", gx + gw - 38, gy + 12);
  };

  const sub =
    mode === "gravity"
      ? topic
        ? `${topic} — the same pendulum swings much faster on a big planet than on the Moon.`
        : "The period depends on gravity: weaker gravity, slower swing — T = 2π√(L/g)."
      : topic
        ? `${topic} — lengthen the string and the swing slows down.`
        : "The period depends on length: T = 2π√(L/g). Short string, quick swing.";

  const hint =
    "The period does NOT depend on the mass of the bob or on how wide you swing it (for small angles). Galileo discovered this while watching a lamp swing in Pisa cathedral.";

  return (
    <SimShell
      icon={<span>◯</span>}
      title={simTitle(topic, "Simple Pendulum")}
      subtitle={sub}
      accent={accent}
      hint={hint}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[sim.tick, speedMul, length, planetIdx, damping, mass]} />

      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a.hex} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Length (L)" value={length} min={0.3} max={2} step={0.05} hex={a.hex} accent={a.text} unit=" m" onChange={setLength} />
        <Slider label="Bob mass (energy only)" value={mass} min={0.2} max={3} step={0.1} hex={a.hex} accent={a.text} unit=" kg" onChange={setMass} />
        {mode === "gravity" ? (
          <div className="flex flex-wrap items-center gap-2">
            {PLANETS.map((p, i) => (
              <ActionButton
                key={p.name}
                label={p.name}
                title={`g = ${p.g.toFixed(1)} m/s2`}
                onClick={() => setPlanetIdx(i)}
                hex={planetIdx === i ? a.hex : "#94a3b8"}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-foreground/15 bg-white/50 px-3 py-2 text-sm text-foreground/60 dark:bg-white/5">
            Mass of the bob does not matter — a heavy bob and a light bob swing together. Try doubling the length and compare the period.
          </div>
        )}
      </div>

      <div className="mt-4">
        <Slider label="Air damping" value={damping} min={0} max={0.3} step={0.01} hex={a.hex} accent={a.text} onChange={setDamping} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Length (L)" value={`${length.toFixed(2)} m`} accent={a.text} />
        <Stat label="Gravity (g)" value={`${g.toFixed(1)} m/s2`} accent={a.text} />
        <Stat label="Period T = 2π√(L/g)" value={`${period.toFixed(2)} s`} accent={a.text} />
        <Stat label="Bob speed" value={`${bobSpeed.toFixed(2)} m/s`} accent={a.text} />
        <Stat label="Kinetic energy" value={`${ke.toFixed(3)} J`} accent={a.text} />
        <Stat label="Gravitational PE" value={`${pe.toFixed(3)} J`} accent={a.text} />
        <Stat label="Total E (of initial)" value={`${totalE.toFixed(3)} / ${E0.toFixed(3)} J`} accent={a.text} />
        <Stat label="Frequency" value={`${(1 / period).toFixed(2)} Hz`} accent={a.text} />
      </div>
    </SimShell>
  );
}
