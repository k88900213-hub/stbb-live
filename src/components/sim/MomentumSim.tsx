"use client";

import { useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";

type MomentumMode = "inelastic" | "elastic" | "recoil";

function momentumMode(topic?: string): MomentumMode {
  const t = topic?.toLowerCase() ?? "";
  if (/elastic/.test(t)) return "elastic";
  if (/recoil|rocket|gun|cannon|explosion/.test(t)) return "recoil";
  return "inelastic";
}

function drawCart(ctx: CanvasRenderingContext2D, x: number, groundY: number, bw: number, bh: number, mass: number, color: string, light: string) {
  const grad = ctx.createLinearGradient(0, groundY - bh, 0, groundY);
  grad.addColorStop(0, light);
  grad.addColorStop(1, color);
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x, groundY - bh, bw, bh, 8);
  ctx.fill();
  ctx.shadowBlur = 0;
  for (let i = 0; i < 2; i++) {
    const wx = x + 12 + i * (bw - 24);
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(wx, groundY - 7, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${mass} kg`, x + bw / 2, groundY - bh / 2 + 4);
  ctx.textAlign = "left";
}

export function MomentumSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "indigo";
  const a = ACCENTS[accent];
  const mode = momentumMode(topic);

  const [m1, setM1] = useState(3);
  const [m2, setM2] = useState(1.5);
  const [v1, setV1] = useState(4);
  const [e, setE] = useState(mode === "elastic" ? 1 : 0);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul, autoRun: false });

  const prog = Math.min(sim.elapsed * 0.72, 1);
  const p = m1 * v1;
  const vAfter = p / (m1 + m2);
  const v1p = ((m1 - e * m2) * v1) / (m1 + m2);
  const v2p = ((1 + e) * m1 * v1) / (m1 + m2);
  const pAfter = m1 * v1p + m2 * v2p;
  const keBefore = 0.5 * m1 * v1 * v1;
  const keAfter = 0.5 * m1 * v1p * v1p + 0.5 * m2 * v2p * v2p;
  const recoilV2 = mode === "recoil" ? (m1 * v1) / m2 : 0;

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    const groundY = h - 50;

    const startA = 70;
    const startB = 430;
    const contact = 380;

    let xA: number;
    let xB: number;
    if (mode === "recoil") {
      xA = 180;
      xB = 380 - prog * 120;
    } else {
      const phase = prog < 0.55 ? prog / 0.55 : 1;
      xA = startA + (contact - startA) * phase;
      xB = startB - (startB - contact) * phase;
      if (prog >= 0.55) {
        const post = (prog - 0.55) / 0.45;
        xA = contact - post * Math.max(v1p, 0) * 28;
        xB = contact + 40 + post * Math.max(v2p, 0) * 28;
      }
    }

    ctx.strokeStyle = "rgba(99,102,241,0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();
    for (let gx = 0; gx < w; gx += 24) {
      ctx.strokeStyle = "rgba(99,102,241,0.2)";
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx, groundY + 6);
      ctx.stroke();
    }

    const boxW = 60;
    const boxH = 46;
    drawCart(ctx, xA, groundY, boxW, boxH, m1, "#6366f1", "#a5b4fc");
    drawCart(ctx, xB, groundY, boxW, boxH, m2, "#8b5cf6", "#c4b5fd");

    ctx.fillStyle = "#6366f1";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    if (mode === "recoil") {
      ctx.fillText("momentum before = 0", w / 2, 22);
      ctx.fillText(`projectile ${m1} kg -> ${v1} m/s   launcher ${m2} kg <- ${recoilV2.toFixed(2)} m/s`, w / 2, 42);
      ctx.fillStyle = "#6366f1";
      ctx.font = "12px sans-serif";
      ctx.fillText(`v = ${v1.toFixed(1)} m/s`, xA + boxW / 2, groundY - boxH - 8);
      ctx.fillText(`v = ${recoilV2.toFixed(1)} m/s`, xB + boxW / 2, groundY - boxH - 8);
    } else {
      ctx.fillText(`p before = ${p.toFixed(1)} kg·m/s`, w / 2, 22);
      if (prog >= 0.55) {
        ctx.fillText(
          `vA' = ${v1p.toFixed(2)} · vB' = ${v2p.toFixed(2)} m/s · p after = ${pAfter.toFixed(1)} kg·m/s`,
          w / 2,
          42,
        );
        ctx.fillStyle = "#6366f1";
        ctx.font = "12px sans-serif";
        ctx.fillText(`vA = ${v1p.toFixed(1)} m/s`, xA + boxW / 2, groundY - boxH - 8);
        ctx.fillText(`vB = ${v2p.toFixed(1)} m/s`, xB + boxW / 2, groundY - boxH - 8);
      } else {
        ctx.fillText(`v after (if e = 0) = ${vAfter.toFixed(2)} m/s`, w / 2, 42);
      }
    }
    ctx.textAlign = "left";
  };

  const sub =
    mode === "recoil"
      ? topic
        ? `${topic} — fire the projectile and watch the launcher recoil with equal momentum the other way.`
        : "Recoil: the launcher gains exactly the momentum the projectile loses."
      : mode === "elastic"
        ? topic
          ? `${topic} — collide two carts and watch both momentum AND kinetic energy survive the bounce.`
          : "Perfectly elastic collision: momentum and kinetic energy are both conserved."
        : topic
          ? `${topic} — collide the carts and watch them stick; total momentum is conserved.`
          : "Perfectly inelastic collision: the carts stick together but total momentum is conserved.";

  const hint =
    mode === "recoil"
      ? "Before firing, total momentum is zero. After, m1v1 + m2v2 = 0, so the launcher moves back. That is exactly how a cannon or rocket works."
      : mode === "elastic"
        ? "For equal masses the carts simply swap velocities — the classic Newton's cradle trick. Total momentum and total kinetic energy stay constant."
        : "Drag the sliders to give a heavy cart a small speed and a light cart a big one — the total before always equals the total after.";

  return (
    <SimShell
      icon={<span>⇄</span>}
      title={simTitle(topic, "Momentum & Collisions")}
      subtitle={sub}
      accent={accent}
      hint={hint}
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
        </>
      }
    >
      <SimCanvas draw={draw} deps={[sim.tick, m1, m2, v1, e, mode, speedMul]} />
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a.hex} label={sim.running ? "Pause" : "Fire"} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Mass A" value={m1} min={0.5} max={8} step={0.5} hex={a.hex} accent={a.text} unit=" kg" onChange={setM1} />
        <Slider label={mode === "recoil" ? "Launcher mass" : "Mass B (at rest)"} value={m2} min={0.5} max={8} step={0.5} hex={a.hex} accent={a.text} unit=" kg" onChange={setM2} />
        <Slider label={mode === "recoil" ? "Projectile speed" : "Speed of A before"} value={v1} min={0.5} max={6} step={0.25} hex={a.hex} accent={a.text} unit=" m/s" onChange={setV1} />
        {mode !== "recoil" ? (
          <Slider label="Restitution (e)" value={e} min={0} max={1} step={0.05} hex={a.hex} accent={a.text} onChange={setE} />
        ) : (
          <div className="rounded-xl border border-foreground/15 bg-white/50 px-3 py-2 text-sm text-foreground/60 dark:bg-white/5">
            Before firing the total momentum is <span className="font-semibold">0</span> — nothing is moving.
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Momentum before" value={`${p.toFixed(1)} kg·m/s`} accent={a.text} />
        {mode === "recoil" ? (
          <>
            <Stat label="Momentum after" value={`${p.toFixed(1)} kg·m/s`} accent={a.text} />
            <Stat label="Recoil speed" value={`${recoilV2.toFixed(2)} m/s`} accent={a.text} />
            <Stat label="Conserved?" value="Yes — equal + opposite" accent={a.text} />
          </>
        ) : (
          <>
            <Stat label="Velocity A after (vA')" value={`${v1p.toFixed(2)} m/s`} accent={a.text} />
            <Stat label="Velocity B after (vB')" value={`${v2p.toFixed(2)} m/s`} accent={a.text} />
            <Stat label="Momentum after" value={`${pAfter.toFixed(1)} kg·m/s`} accent={a.text} />
            <Stat label="Momentum conserved" value={`${Math.abs(p - pAfter) < 0.001 ? "Yes" : `${((pAfter / Math.max(p, 0.001)) * 100).toFixed(0)}% of before`}`} accent={a.text} />
            <Stat label="KE before" value={`${keBefore.toFixed(1)} J`} accent={a.text} />
            <Stat label="KE after" value={`${keAfter.toFixed(1)} J (${((keAfter / Math.max(keBefore, 0.001)) * 100).toFixed(0)}%)`} accent={a.text} />
          </>
        )}
      </div>
    </SimShell>
  );
}
