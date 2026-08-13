"use client";

import { useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";

type HookeMode = "static" | "oscillate";

function hookeMode(topic?: string): HookeMode {
  const t = topic?.toLowerCase() ?? "";
  if (/oscillat|shm|period|bounc/.test(t)) return "oscillate";
  return "static";
}

export function HookesLawSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "emerald";
  const a = ACCENTS[accent];
  const mode = hookeMode(topic);

  const [k, setK] = useState(150);
  const [force, setForce] = useState(40);
  const [mass, setMass] = useState(1.5);
  const [damping, setDamping] = useState(0.12);
  const sim = useSim({ fps: 60, autoRun: false });

  const g = 9.8;
  const x = force / k;
  const omega = Math.sqrt(k / mass);
  const period = 2 * Math.PI * Math.sqrt(mass / k);
  const time = sim.elapsed;

  const A = (mass * g) / k;
  const decay = Math.exp(-damping * omega * time);
  const xDis = A * Math.sin(omega * time) * decay;
  const vSpeed = A * omega * Math.cos(omega * time) * decay;
  const pe = 0.5 * k * xDis * xDis;
  const ke = 0.5 * mass * vSpeed * vSpeed;
  const E0 = 0.5 * k * A * A;
  const totalE = pe + ke;

  const draw = (ctx: CanvasRenderingContext2D) => {
    if (mode === "oscillate") drawOscillate(ctx, k, mass, omega, time, damping);
    else drawStatic(ctx, k, force);
  };

  const sub =
    mode === "oscillate"
      ? topic
        ? `${topic} — release the mass and watch it bounce with a steady rhythm set by the stiffness.`
        : "Spring oscillation: the stiffer the spring, the faster the bouncing — T = 2pi*sqrt(m/k)."
      : topic
        ? `${topic} — hang weights on the spring and watch the extension grow in step with the force.`
        : "Hooke's law: extension is proportional to force — F = kx.";

  const hint =
    mode === "oscillate"
      ? "Bigger k (stiffer spring) or smaller mass makes the bouncing faster. The period depends only on the spring and the mass, not on how far you pull it."
      : "F = kx only holds up to the elastic limit. Double the force and the stretch doubles — the graph is a straight line through the origin.";

  return (
    <SimShell
      icon={<span>⏐≈</span>}
      title={simTitle(topic, "Hooke's Law & Springs")}
      subtitle={sub}
      accent={accent}
      hint={hint}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[mode, k, force, mass, sim.tick]} />

      {mode === "oscillate" && (
        <div className="mt-4">
          <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} hex={a.hex} />
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Spring constant (k)" value={k} min={40} max={400} step={5} hex={a.hex} accent={a.text} unit=" N/m" onChange={setK} />
        {mode === "static" ? (
          <Slider label="Force (F)" value={force} min={0} max={200} step={5} hex={a.hex} accent={a.text} unit=" N" onChange={setForce} />
        ) : (
          <Slider label="Mass on spring" value={mass} min={0.5} max={5} step={0.25} hex={a.hex} accent={a.text} unit=" kg" onChange={setMass} />
        )}
      </div>

      {mode === "oscillate" && (
        <div className="mt-4">
          <Slider label="Damping" value={damping} min={0} max={0.6} step={0.01} hex={a.hex} accent={a.text} onChange={setDamping} />
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {mode === "static" ? (
          <>
            <Stat label="Force (F)" value={`${force.toFixed(0)} N`} accent={a.text} />
            <Stat label="Spring const (k)" value={`${k.toFixed(0)} N/m`} accent={a.text} />
            <Stat label="Extension (x = F/k)" value={`${(x * 100).toFixed(1)} cm`} accent={a.text} />
            <Stat label="Check (k·x)" value={`${(k * x).toFixed(0)} N`} accent={a.text} />
          </>
        ) : (
          <>
            <Stat label="Spring const (k)" value={`${k.toFixed(0)} N/m`} accent={a.text} />
            <Stat label="Mass" value={`${mass.toFixed(2)} kg`} accent={a.text} />
            <Stat label="Period (T)" value={`${period.toFixed(2)} s`} accent={a.text} />
            <Stat label="Elastic PE" value={`${pe.toFixed(3)} J`} accent={a.text} />
            <Stat label="Kinetic energy" value={`${ke.toFixed(3)} J`} accent={a.text} />
            <Stat label="Total E (of ½kA²)" value={`${totalE.toFixed(3)} / ${E0.toFixed(3)} J`} accent={a.text} />
          </>
        )}
      </div>
    </SimShell>
  );
}

function drawSpringCoil(ctx: CanvasRenderingContext2D, cx: number, topY: number, bottomY: number, color: string, coilW: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  const coils = 7;
  for (let i = 0; i < coils; i++) {
    const cy0 = topY + (i * (bottomY - topY)) / coils;
    const cy1 = topY + ((i + 1) * (bottomY - topY)) / coils;
    ctx.beginPath();
    ctx.moveTo(cx - coilW / 2, cy0);
    ctx.quadraticCurveTo(cx + coilW / 2, (cy0 + cy1) / 2, cx - coilW / 2, cy1);
    ctx.stroke();
  }
}

function drawStatic(ctx: CanvasRenderingContext2D, k: number, force: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  const cx = 180;
  const topY = 24;
  const ext = Math.min((force / k) * 340, 130);
  const endY = topY + 70 + ext;

  ctx.strokeStyle = "rgba(16,185,129,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx, topY + 14);
  ctx.stroke();

  drawSpringCoil(ctx, cx, topY + 16, endY, "rgba(16,185,129,0.75)", 26);

  const boxH = 46;
  const grad = ctx.createLinearGradient(0, endY, 0, endY + boxH);
  grad.addColorStop(0, "#6ee7b7");
  grad.addColorStop(1, "#10b981");
  ctx.shadowColor = "rgba(16,185,129,0.4)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(cx - 26, endY, 52, boxH, 8);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#064e3b";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${force} N`, cx, endY + boxH / 2 + 4);

  ctx.strokeStyle = "rgba(16,185,129,0.4)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(cx + 40, topY);
  ctx.lineTo(cx + 40, endY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#10b981";
  ctx.font = "12px sans-serif";
  ctx.fillText(`x = ${((force / k) * 100).toFixed(1)} cm`, cx + 48, (topY + endY) / 2);
  ctx.textAlign = "start";

  const gx = w / 2 + 60;
  const gw = w - gx - 40;
  const gh = h - 60;
  const gy = 26;
  ctx.strokeStyle = "rgba(16,185,129,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gx, gy + gh);
  ctx.lineTo(gx + gw, gy + gh);
  ctx.moveTo(gx, gy + gh);
  ctx.lineTo(gx, gy);
  ctx.stroke();
  ctx.fillStyle = "#6ee7b7";
  ctx.font = "12px sans-serif";
  ctx.fillText("force (N)", gx + gw / 2 - 20, gy + gh + 18);
  ctx.save();
  ctx.translate(gx - 14, gy + gh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("extension", 0, 0);
  ctx.restore();
  const maxF = 200;
  const fx = (force / maxF) * gw;
  const fy = (Math.min(ext, 130) / 130) * gh;
  ctx.strokeStyle = "#059669";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(gx, gy + gh);
  ctx.lineTo(gx + gw, gy + gh - gh);
  ctx.stroke();
  ctx.fillStyle = "#047857";
  ctx.beginPath();
  ctx.arc(gx + fx, gy + gh - fy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#047857";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`(${force} N, ${((force / k) * 100).toFixed(0)} cm)`, gx + gw / 2, gy + gh - Math.min(fy, gh) - 10);
  ctx.textAlign = "start";
}

function drawOscillate(ctx: CanvasRenderingContext2D, k: number, mass: number, omega: number, time: number, damping: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);
  const cx = 170;
  const topY = 24;
  const amp = 60 * Math.exp(-damping * omega * time);
  const endY = topY + 110 + amp * Math.sin(omega * time);

  ctx.strokeStyle = "rgba(16,185,129,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx, topY + 14);
  ctx.stroke();
  drawSpringCoil(ctx, cx, topY + 16, endY, "rgba(16,185,129,0.75)", 26);

  const boxH = 46;
  const grad = ctx.createLinearGradient(0, endY, 0, endY + boxH);
  grad.addColorStop(0, "#6ee7b7");
  grad.addColorStop(1, "#10b981");
  ctx.shadowColor = "rgba(16,185,129,0.4)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(cx - 26, endY, 52, boxH, 8);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#064e3b";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${mass.toFixed(1)} kg`, cx, endY + boxH / 2 + 4);
  ctx.textAlign = "start";

  const gx = w / 2 + 60;
  const gw = w - gx - 40;
  const gy = 26;
  const gh = h - 60;
  ctx.strokeStyle = "rgba(16,185,129,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gx, gy + gh);
  ctx.lineTo(gx + gw, gy + gh);
  ctx.moveTo(gx, gy + gh);
  ctx.lineTo(gx, gy);
  ctx.stroke();
  const T = 2 * Math.PI * Math.sqrt(mass / k);
  ctx.fillStyle = "#059669";
  ctx.font = "12px sans-serif";
  ctx.fillText("displacement", gx + 10, gy + 16);
  const yOf = (tt: number) => gy + gh / 2 - amp * 0.8 * Math.sin(omega * tt) * Math.exp(-damping * omega * tt);
  ctx.beginPath();
  for (let i = 0; i <= gw; i += 4) {
    const tt = (i / gw) * T * 1.5;
    const y = yOf(tt);
    if (i === 0) ctx.moveTo(gx + i, y);
    else ctx.lineTo(gx + i, y);
  }
  ctx.stroke();
  const nowT = time % (T * 1.5);
  const dotY = yOf(nowT);
  ctx.fillStyle = "#059669";
  ctx.beginPath();
  ctx.arc(gx + (nowT / (T * 1.5)) * gw, dotY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#047857";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText(`T = ${T.toFixed(2)} s   f = ${(1 / T).toFixed(2)} Hz`, gx, gy + gh + 20);
}
