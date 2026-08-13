"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

export function MomentsSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const [leftMass, setLeftMass] = useState(3);
  const [rightMass, setRightMass] = useState(3);
  const [leftDist, setLeftDist] = useState(2);
  const [rightDist, setRightDist] = useState(2);
  const [wobble, setWobble] = useState(true);
  const [showTorque, setShowTorque] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const g = 9.8;
  const leftTorque = leftMass * g * leftDist;
  const rightTorque = rightMass * g * rightDist;
  const netMoment = rightTorque - leftTorque;
  const balanced = Math.abs(netMoment) < 0.5;
  const imbalance = rightTorque + leftTorque > 0 ? (rightTorque - leftTorque) / (rightTorque + leftTorque) : 0;
  const wob = wobble && balanced ? Math.sin(sim.tick * 0.05) * 1.5 : 0;
  const angle = Math.max(-14, Math.min(14, imbalance * 22 + wob));
  return (
    <SimShell
      icon="⚖️"
      title={simTitle(topic, "Moments & equilibrium")}
      accent="orange"
      subtitle={`${topic ?? "Moments"} — moment = force × perpendicular distance. The beam balances when clockwise and anticlockwise moments are equal.`}
      hint="A small force far from the pivot can balance a big force near it. Doubling the distance halves the force needed for the same moment."
      controls={<SimChip accent="orange"><span aria-hidden>⚖️</span>{topic ?? "turning effect of forces"}</SimChip>}
    >
      <SimCanvas
        deps={[leftMass, rightMass, leftDist, rightDist, angle, showTorque, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cy = h / 2 + 8;
          const cx = w / 2;
          ctx.fillStyle = "#94a3b8";
          ctx.beginPath();
          ctx.moveTo(cx - 18, cy + 6);
          ctx.lineTo(cx + 18, cy + 6);
          ctx.lineTo(cx, cy + 40);
          ctx.closePath();
          ctx.fill();
          const beamW = 460;
          const ang = (angle * Math.PI) / 180;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(ang);
          ctx.fillStyle = "#b45309";
          ctx.fillRect(-beamW / 2, -8, beamW, 16);
          ctx.strokeStyle = "#78350f";
          ctx.lineWidth = 2;
          ctx.strokeRect(-beamW / 2, -8, beamW, 16);
          const hang = (side: 1 | -1, mass: number, dist: number, color: string) => {
            const bx = side * dist * 55;
            const ropeY = 8 + Math.abs(bx) * Math.tan(Math.abs(ang));
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bx, 0);
            ctx.lineTo(bx, ropeY);
            ctx.stroke();
            const boxW = 44;
            const boxH = 34;
            ctx.fillStyle = color;
            ctx.fillRect(bx - boxW / 2, ropeY, boxW, boxH);
            ctx.strokeStyle = "#1e293b";
            ctx.strokeRect(bx - boxW / 2, ropeY, boxW, boxH);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(`${mass} kg`, bx - 17, ropeY + 22);
            ctx.fillStyle = "#1e293b";
            ctx.font = "11px system-ui";
            ctx.fillText(`${dist} m`, bx - 9, -18);
          };
          hang(-1, leftMass, leftDist, "#f59e0b");
          hang(1, rightMass, rightDist, "#0ea5e9");
          ctx.restore();
          if (showTorque) {
            ctx.fillStyle = "#92400e";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`left: ${leftTorque.toFixed(0)} N·m`, 30, 28);
            ctx.fillText(`right: ${rightTorque.toFixed(0)} N·m`, w - 190, 28);
          }
          ctx.fillStyle = balanced ? "#047857" : "#b91c1c";
          ctx.font = "bold 14px system-ui";
          ctx.fillText(balanced ? "balanced — ΣM = 0, no turning" : netMoment > 0 ? "right side goes down (ΣM > 0)" : "left side goes down (ΣM < 0)", 30, 50);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Slider label="Left mass" value={leftMass} min={1} max={10} step={0.5} hex={a} accent={at} unit=" kg" onChange={setLeftMass} />
        <Slider label="Left distance" value={leftDist} min={1} max={4} step={0.5} hex={a} accent={at} unit=" m" onChange={setLeftDist} />
        <Slider label="Right mass" value={rightMass} min={1} max={10} step={0.5} hex={a} accent={at} unit=" kg" onChange={setRightMass} />
        <Slider label="Right distance" value={rightDist} min={1} max={4} step={0.5} hex={a} accent={at} unit=" m" onChange={setRightDist} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Wobble" checked={wobble} onChange={setWobble} hex={a} />
        <Toggle label="Show torques" checked={showTorque} onChange={setShowTorque} hex={a} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ActionButton label="Balanced (3:2 = 2:3)" hex={balanced ? a : "#94a3b8"} onClick={() => { setLeftMass(3); setLeftDist(2); setRightMass(2); setRightDist(3); }} />
        <ActionButton label="Big force, short arm" hex="#94a3b8" onClick={() => { setLeftMass(8); setLeftDist(1); setRightMass(2); setRightDist(4); }} />
        <ActionButton label="Right heavy" hex="#94a3b8" onClick={() => { setLeftMass(3); setLeftDist(2); setRightMass(8); setRightDist(2); }} />
        <ActionButton label="Left heavy" hex="#94a3b8" onClick={() => { setLeftMass(8); setLeftDist(2); setRightMass(3); setRightDist(2); }} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
        <Stat label="Left moment" value={`${leftTorque.toFixed(0)} N·m`} accent={at} />
        <Stat label="Right moment" value={`${rightTorque.toFixed(0)} N·m`} accent="text-sky-600 dark:text-sky-400" />
        <Stat label="ΣM (net)" value={`${netMoment.toFixed(0)} N·m`} accent={balanced ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
        <Stat label="State" value={balanced ? "balanced" : "turning"} accent={balanced ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
      </div>
    </SimShell>
  );
}

export function EnergySim({ topic }: { topic?: string }) {
  const a = "#10b981";
  const at = "text-emerald-600 dark:text-emerald-400";
  const gravityModes = [
    ["Moon", 1.62],
    ["Mars", 3.71],
    ["Earth", 9.8],
    ["Jupiter", 24.8],
  ] as const;
  const [hill, setHill] = useState(60);
  const [mass, setMass] = useState(5);
  const [gravity, setGravity] = useState<(typeof gravityModes)[number][0]>("Earth");
  const [showLabels, setShowLabels] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const g = gravityModes.find((m) => m[0] === gravity)![1];
  const phase = (sim.tick % 180) / 180;
  const pos = phase * 2 * Math.PI;
  const trackH = hill * 0.9;
  const cartHeight = trackH * Math.abs(Math.sin(pos));
  const me = mass * g * trackH;
  const pe = mass * g * cartHeight;
  const ke = Math.max(0, me - pe);
  const vel = Math.sqrt((2 * ke) / mass);
  const conserved = Math.abs(pe + ke - me) < 0.01;
  return (
    <SimShell
      icon="🎢"
      title={simTitle(topic, "Energy conservation")}
      accent="emerald"
      subtitle={`${topic ?? "Work & energy"} — on a frictionless track, mechanical energy is conserved: potential energy changes into kinetic energy and back again.`}
      hint="At the top of the hill the cart has only potential energy; at the bottom it has only kinetic energy. Total mechanical energy stays the same."
      controls={<SimChip accent="emerald"><span aria-hidden>🎢</span>{topic ?? "energy conservation"}</SimChip>}
    >
      <SimCanvas
        deps={[hill, mass, g, cartHeight, pos, pe, ke, vel, showLabels, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const baseY = h - 44;
          const amp = (trackH / 100) * (h - 120);
          ctx.beginPath();
          ctx.moveTo(30, baseY);
          for (let x = 30; x <= w - 30; x += 2) {
            const t = (x - 30) / (w - 60);
            const y = baseY - Math.abs(Math.sin(t * Math.PI * 2)) * amp;
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 5;
          ctx.lineCap = "round";
          ctx.stroke();
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(0, baseY, w, h - baseY);
          const cartX = 30 + pos * (w - 60);
          const cartY = baseY - Math.abs(Math.sin(pos)) * amp;
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(cartX - 12, cartY - 26, 24, 14);
          ctx.beginPath();
          ctx.arc(cartX, cartY - 12, 9, 0, Math.PI * 2);
          ctx.fillStyle = "#b91c1c";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cartX - 9, cartY - 6, 3, 0, Math.PI * 2);
          ctx.arc(cartX + 9, cartY - 6, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#334155";
          ctx.fill();
          if (showLabels) {
            const bw = 120;
            const bh = 40;
            const by = baseY - amp - 70;
            const bx = w / 2 - bw / 2;
            ctx.fillStyle = "rgba(255,255,255,0.75)";
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeStyle = "#94a3b8";
            ctx.strokeRect(bx, by, bw, bh);
            ctx.fillStyle = "#047857";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`GPE ${pe.toFixed(0)} J`, bx + 10, by + 16);
            ctx.fillText(`KE ${ke.toFixed(0)} J`, bx + 10, by + 32);
          }
          ctx.fillStyle = "#065f46";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`h ${cartHeight.toFixed(0)} m · v ${vel.toFixed(1)} m/s · E_total ${me.toFixed(0)} J`, 30, 26);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Hill height" value={hill} min={20} max={100} step={2} hex={a} accent={at} unit=" m" onChange={setHill} />
        <Slider label="Cart mass" value={mass} min={1} max={20} step={1} hex={a} accent={at} unit=" kg" onChange={setMass} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-foreground/60">Gravity:</span>
        {gravityModes.map(([name, gv]) => (
          <ActionButton key={name} label={`${name} ${gv} m/s²`} hex={gravity === name ? a : "#94a3b8"} onClick={() => setGravity(name)} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Energy labels" checked={showLabels} onChange={setShowLabels} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
        <Stat label="GPE" value={`${pe.toFixed(0)} J`} accent="text-amber-600 dark:text-amber-400" />
        <Stat label="Kinetic energy" value={`${ke.toFixed(0)} J`} accent={at} />
        <Stat label="Speed" value={`${vel.toFixed(1)} m/s`} accent={at} />
        <Stat label="Mechanical E" value={`${me.toFixed(0)} J ${conserved ? "· conserved" : ""}`} accent={at} />
      </div>
    </SimShell>
  );
}

export function SpecificHeatSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const substances: { name: string; c: number }[] = [
    { name: "Water", c: 4186 },
    { name: "Ethanol", c: 2440 },
    { name: "Aluminium", c: 900 },
    { name: "Iron", c: 450 },
    { name: "Copper", c: 385 },
  ];
  const [subIdx, setSubIdx] = useState(2);
  const [power, setPower] = useState(2000);
  const [cooling, setCooling] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const shc = substances[subIdx].c;
  const mass = 2;
  const timeScale = 24;
  const simSec = (sim.tick / 30) * timeScale;
  const tempRaw = cooling ? 100 - (power * simSec) / (mass * shc) : 20 + (power * simSec) / (mass * shc);
  const clamped = Math.min(100, Math.max(20, tempRaw));
  const heatAdded = Math.abs(mass * shc * (clamped - (cooling ? 100 : 20)));
  const timeMin = simSec / 60;
  const pct = cooling ? (100 - clamped) / 80 : (clamped - 20) / 80;
  const flame = sim.tick % 6 < 3;
  const tempAt = (s: number) => (cooling ? 100 : 20) + (cooling ? -1 : 1) * (power * s) / (mass * shc);
  return (
    <SimShell
      icon="🌡️"
      title={simTitle(topic, "Specific heat capacity")}
      accent="orange"
      subtitle={`${topic ?? "Thermal properties"} — Q = m × c × ΔT. A material with high specific heat needs lots of energy to warm up by 1 °C.`}
      hint="Water (c = 4186 J/kg·°C) heats slowly but stores heat well — why seas stay cool in summer and warm in winter."
      controls={<SimChip accent="orange"><span aria-hidden>🌡️</span>{topic ?? "specific heat"}</SimChip>}
    >
      <SimCanvas
        deps={[shc, power, cooling, clamped, pct, flame, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 2;
          ctx.strokeRect(30, 40, 120, 160);
          const fillH = 160 * pct;
          const grad = ctx.createLinearGradient(30, 200, 30, 40);
          grad.addColorStop(0, "#f97316");
          grad.addColorStop(1, "#fde68a");
          ctx.fillStyle = grad;
          ctx.fillRect(30, 200 - fillH, 120, fillH);
          ctx.fillStyle = "#fde68a";
          ctx.fillRect(30, 40, 120, 12);
          ctx.fillStyle = "#7c2d12";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${clamped.toFixed(0)}°C`, 44, 110);
          ctx.fillStyle = "#334155";
          ctx.font = "11px system-ui";
          ctx.fillText("heater block", 42, 30);
          const fx = 90;
          const fy = 218 + (flame ? 0 : -6);
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.moveTo(fx - 14, 218);
          ctx.lineTo(fx, fy);
          ctx.lineTo(fx + 14, 218);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#fb923c";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(30, 218);
          ctx.lineTo(fx - 16, 218);
          ctx.moveTo(150, 218);
          ctx.lineTo(fx + 16, 218);
          ctx.stroke();
          ctx.fillStyle = "#78350f";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`${power / 1000} kW`, fx - 22, 246);
          ctx.beginPath();
          ctx.moveTo(230, 240);
          ctx.lineTo(w - 30, 240);
          ctx.moveTo(230, 240);
          ctx.lineTo(230, 40);
          ctx.strokeStyle = "#94a3b8";
          ctx.stroke();
          for (let i = 0; i <= 8; i++) {
            const y = 240 - i * 25;
            ctx.fillStyle = "#64748b";
            ctx.font = "11px system-ui";
            ctx.fillText(`${(20 + i * 10).toFixed(0)}°`, 236, y + 3);
            ctx.strokeStyle = "rgba(148,163,184,0.35)";
            ctx.beginPath();
            ctx.moveTo(252, y);
            ctx.lineTo(w - 30, y);
            ctx.stroke();
          }
          const maxT = Math.max(1, timeMin);
          for (let x = 252; x < w - 30; x++) {
            const t1 = ((x - 252) / (w - 282)) * maxT;
            const t2 = ((x - 251) / (w - 282)) * maxT;
            const y1 = 240 - ((Math.min(100, Math.max(20, tempAt(t1 * 60))) - 20) / 80) * 200;
            const y2 = 240 - ((Math.min(100, Math.max(20, tempAt(t2 * 60))) - 20) / 80) * 200;
            ctx.beginPath();
            ctx.moveTo(x, Math.max(40, y1));
            ctx.lineTo(x + 1, Math.max(40, y2));
            ctx.strokeStyle = "#f97316";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.fillStyle = "#7c2d12";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`after ${timeMin.toFixed(1)} min: ${clamped.toFixed(0)}°C · Q = m·c·ΔT = ${(heatAdded / 1000).toFixed(1)} kJ`, 30, 26);
        }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-foreground/60">Substance (m = 2.0 kg):</span>
        {substances.map((s, i) => (
          <ActionButton key={s.name} label={`${s.name} ${s.c} J/kg·°C`} hex={subIdx === i ? a : "#94a3b8"} onClick={() => setSubIdx(i)} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Heater power" value={power} min={500} max={4000} step={250} hex={a} accent={at} unit=" W" onChange={setPower} />
        <div className="rounded-xl border border-white/40 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
          <span className="text-[11px] uppercase tracking-wide text-foreground/50">Heat input</span>
          <div className="font-semibold text-foreground">Q = m·c·ΔT → dT/dt = P/(m·c)</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Cooling mode" checked={cooling} onChange={setCooling} hex={a} hint="flips the heater into a cooler" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Temperature" value={`${clamped.toFixed(0)} °C`} accent={at} />
        <Stat label="Heat added (Q)" value={`${(heatAdded / 1000).toFixed(1)} kJ`} accent={at} />
        <Stat label="Substance" value={substances[subIdx].name} accent={at} />
      </div>
    </SimShell>
  );
}

export function LatentHeatSim({ topic }: { topic?: string }) {
  const a = "#0ea5e9";
  const at = "text-sky-600 dark:text-sky-400";
  const [heatRate, setHeatRate] = useState(8);
  const [showMolecules, setShowMolecules] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const mass = 0.02;
  const cIce = 2.1;
  const cWater = 4.186;
  const cSteam = 2.0;
  const Lf = 334;
  const Lv = 2260;
  const segQ = [mass * cIce * 20, mass * Lf, mass * cWater * 100, mass * Lv, mass * cSteam * 30];
  const totalQ = segQ[0] + segQ[1] + segQ[2] + segQ[3] + segQ[4];
  const heat = ((sim.tick * heatRate) / 30) % totalQ;
  const stateAt = (q: number) => {
    if (q < segQ[0]) return { temp: -20 + q / (mass * cIce), phase: "ice" };
    let qq = q - segQ[0];
    if (qq < segQ[1]) return { temp: 0, phase: "melting" };
    qq -= segQ[1];
    if (qq < segQ[2]) return { temp: qq / (mass * cWater), phase: "water heating" };
    qq -= segQ[2];
    if (qq < segQ[3]) return { temp: 100, phase: "boiling" };
    qq -= segQ[3];
    return { temp: 100 + qq / (mass * cSteam), phase: "steam" };
  };
  const { temp, phase } = stateAt(heat);
  const melt = Math.max(0, Math.min(1, (heat - segQ[0]) / segQ[1]));
  const boil = Math.max(0, Math.min(1, (heat - (segQ[0] + segQ[1] + segQ[2])) / segQ[3]));
  const steam = sim.tick % 10 < 5;
  const qBounds = [0, segQ[0], segQ[0] + segQ[1], segQ[0] + segQ[1] + segQ[2], segQ[0] + segQ[1] + segQ[2] + segQ[3], totalQ];
  const seg = [
    [0, segQ[0], -20, 0, "#38bdf8"],
    [segQ[0], segQ[0] + segQ[1], 0, 0, "#0ea5e9"],
    [segQ[0] + segQ[1], segQ[0] + segQ[1] + segQ[2], 0, 100, "#f59e0b"],
    [segQ[0] + segQ[1] + segQ[2], qBounds[4], 100, 100, "#fb923c"],
    [qBounds[4], totalQ, 100, 130, "#dc2626"],
  ] as [number, number, number, number, string][];
  return (
    <SimShell
      icon="🧊"
      title={simTitle(topic, "Latent heat & phase change")}
      accent="sky"
      subtitle={`${topic ?? "Latent heat"} — during melting and boiling the temperature stays constant while energy is absorbed: that energy is the latent heat.`}
      hint="Ice melts at 0 °C and water boils at 100 °C. On the heating curve, the flat parts are where the phase change happens — temperature does not rise."
      controls={<SimChip accent="sky"><span aria-hidden>🧊</span>{topic ?? "latent heat"}</SimChip>}
    >
      <SimCanvas
        deps={[heatRate, heat, temp, melt, boil, steam, showMolecules, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          if (showMolecules) {
            ctx.fillStyle = "#e0f2fe";
            ctx.fillRect(30, 90, 130, 110);
            ctx.strokeStyle = "#0ea5e9";
            ctx.lineWidth = 3;
            ctx.strokeRect(30, 90, 130, 110);
            ctx.save();
            ctx.beginPath();
            ctx.rect(30, 90, 130, 110);
            ctx.clip();
            if (phase === "ice") {
              ctx.fillStyle = "#7dd3fc";
              for (let i = 0; i < 9; i++) {
                ctx.fillRect(36 + (i % 3) * 42, 96 + Math.floor(i / 3) * 34, 32, 24);
              }
            } else if (phase === "melting" || phase === "water heating") {
              for (let i = 0; i < 40; i++) {
                const x = 38 + ((i * 37 + sim.tick * (phase === "melting" ? 0.3 : 1.2)) % 120);
                const y = 96 + ((i * 53) % 98);
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = "#38bdf8";
                ctx.fill();
              }
            } else {
              for (let i = 0; i < 18; i++) {
                const x = 40 + ((i * 61 + sim.tick * 4) % 120);
                const y = 94 + ((i * 47 + sim.tick * 2) % 102);
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#bae6fd";
                ctx.fill();
              }
            }
            ctx.restore();
            if (steam && (phase === "boiling" || phase === "steam")) {
              ctx.strokeStyle = "rgba(148,163,184,0.7)";
              ctx.lineWidth = 2;
              for (let i = 0; i < 4; i++) {
                const x = 60 + i * 20 + (sim.tick % 10);
                ctx.beginPath();
                ctx.arc(x, 78 - (sim.tick % 20), 6, 0, Math.PI * 2);
                ctx.stroke();
              }
            }
            ctx.fillStyle = "#0c4a6e";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(phase, 40, 84);
          }
          ctx.beginPath();
          ctx.moveTo(220, 240);
          ctx.lineTo(w - 30, 240);
          ctx.moveTo(220, 240);
          ctx.lineTo(220, 40);
          ctx.strokeStyle = "#94a3b8";
          ctx.stroke();
          for (let i = 0; i <= 8; i++) {
            const y = 240 - i * 25;
            ctx.fillStyle = "#64748b";
            ctx.font = "11px system-ui";
            ctx.fillText(`${(i * 25 - 20).toFixed(0)}°`, 224, y + 3);
            ctx.strokeStyle = "rgba(148,163,184,0.35)";
            ctx.beginPath();
            ctx.moveTo(252, y);
            ctx.lineTo(w - 30, y);
            ctx.stroke();
          }
          ctx.lineWidth = 3;
          for (const s of seg) {
            const x1 = 252 + (s[0] / totalQ) * (w - 282);
            const x2 = 252 + (s[1] / totalQ) * (w - 282);
            const y1 = 240 - ((s[2] + 20) / 150) * 200;
            const y2 = 240 - ((s[3] + 20) / 150) * 200;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = s[4];
            ctx.stroke();
          }
          const mx = 252 + (heat / totalQ) * (w - 282);
          const my = 240 - ((temp + 20) / 150) * 200;
          ctx.beginPath();
          ctx.arc(mx, my, 6, 0, Math.PI * 2);
          ctx.fillStyle = "#f43f5e";
          ctx.fill();
          ctx.strokeStyle = "#f43f5e";
          ctx.strokeRect(mx - 4, my - 4, 8, 8);
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`${temp.toFixed(0)}°C`, 30, 26);
          ctx.fillText(`phase: ${phase}`, 30, 44);
          ctx.fillStyle = "#7c2d12";
          ctx.fillText(`Q added ${heat.toFixed(1)} / ${totalQ.toFixed(0)} kJ`, w - 230, 26);
          ctx.fillStyle = "#0e7490";
          ctx.font = "11px system-ui";
          ctx.fillText(`L_f ${Lf} kJ/kg · L_v ${Lv} kJ/kg`, w - 230, 44);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Heating rate" value={heatRate} min={2} max={20} step={1} hex={a} accent={at} unit=" kJ/s" onChange={setHeatRate} />
        <div className="rounded-xl border border-white/40 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
          <span className="text-[11px] uppercase tracking-wide text-foreground/50">Water (m = 20 g) constants</span>
          <div className="font-semibold text-foreground">L_f = 334 kJ/kg · L_v = 2260 kJ/kg</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Molecules" checked={showMolecules} onChange={setShowMolecules} hex={a} hint="watch ice, water, then steam" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Heat added" value={`${heat.toFixed(1)} kJ`} accent={at} />
        <Stat label="Latent heat" value={phase === "melting" ? "fusion 334 kJ/kg" : phase === "boiling" ? "vaporisation 2260 kJ/kg" : "—"} accent={at} />
        <Stat label="Current phase" value={phase} accent={at} />
      </div>
    </SimShell>
  );
}

export function RadiationSim({ topic }: { topic?: string }) {
  const a = "#f43f5e";
  const at = "text-rose-600 dark:text-rose-400";
  const [temp, setTemp] = useState(2500);
  const [showRays, setShowRays] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const peak = (2.898 * 1e6) / temp;
  const r = 255;
  const g = Math.round(Math.min(255, 180 * Math.min(1, temp / 2000)));
  const b = Math.round(Math.min(255, 90 * Math.min(1, temp / 3000)));
  const coilColor = temp < 1000 ? "#7f1d1d" : temp < 2000 ? "#b91c1c" : temp < 3000 ? "#ea580c" : temp < 4500 ? "#facc15" : "#ffffff";
  return (
    <SimShell
      icon="🔥"
      title={simTitle(topic, "Heat & electromagnetic radiation")}
      accent="rose"
      subtitle={`${topic ?? "Radiation"} — hotter objects radiate more energy and at shorter wavelengths. Wien's law: λₚₑₐₖ = 2.898 × 10⁻³ / T.`}
      hint="A red-hot object is cooler than a white-hot one. The Sun (5800 K) peaks in the visible; a warm kettle (350 K) peaks in the infrared."
      controls={<SimChip accent="rose"><span aria-hidden>🔥</span>{topic ?? "radiation"}</SimChip>}
    >
      <SimCanvas
        deps={[temp, peak, coilColor, showRays, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#1e1b4b";
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = coilColor;
          ctx.beginPath();
          ctx.arc(90, 130, 42, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#fecdd3";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(90, 130, 42, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${temp} K`, 55, 118);
          if (showRays) {
            ctx.strokeStyle = `rgba(${r},${g},${b},0.55)`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 7; i++) {
              const ang = -1.6 + i * 0.55;
              const len = 60 + (sim.tick % 20);
              ctx.beginPath();
              ctx.moveTo(132, 130);
              ctx.lineTo(132 + Math.cos(ang) * len, 130 + Math.sin(ang) * len);
              ctx.stroke();
            }
          }
          const gx = 230;
          const gw = w - gx - 30;
          const gy = 60;
          const gh = 110;
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(gx, gy, gw, gh);
          for (let x = gx; x < gx + gw; x += 2) {
            const lam = 380 + ((x - gx) / gw) * 620;
            const t = (lam - 380) / 620;
            let col: string;
            if (t < 0.25) col = `rgb(${Math.round(255 * 4 * t)},0,255)`;
            else if (t < 0.5) col = `rgb(255,0,${Math.round(255 * (1 - 4 * (t - 0.25)))})`;
            else if (t < 0.75) col = `rgb(255,${Math.round(255 * 4 * (t - 0.5))},0)`;
            else col = `rgb(255,255,${Math.round(255 * 4 * (t - 0.75))})`;
            ctx.fillStyle = col;
            ctx.fillRect(x, gy, 2, gh);
          }
          const px = gx + (Math.min(1000, Math.max(380, peak)) - 380) / 620 * gw;
          ctx.strokeStyle = "#f8fafc";
          ctx.setLineDash([5, 4]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, gy);
          ctx.lineTo(px, gy + gh);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#f8fafc";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`peak ${peak.toFixed(0)} nm`, px - 50, gy - 8);
          ctx.fillStyle = "#cbd5e1";
          ctx.font = "11px system-ui";
          ctx.fillText("380 nm", gx, gy + gh + 16);
          ctx.fillText("1000 nm", gx + gw - 45, gy + gh + 16);
          ctx.fillStyle = "#fda4af";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`radiated power ~ T⁴ × ${(temp / 1000) ** 4 > 9999 ? "high" : (temp / 1000) ** 4 > 99 ? "high" : (temp / 1000) ** 4 > 9 ? "med" : "low"}`, gx, gy + gh + 40);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Temperature" value={temp} min={500} max={6000} step={100} hex={a} accent={at} unit=" K" onChange={setTemp} />
        <Slider label="Peak wavelength" value={Math.round(peak)} min={380} max={5800} step={10} hex={a} accent={at} unit=" nm" onChange={(v) => setTemp(Math.round(2.898e6 / v))} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Radiated rays" checked={showRays} onChange={setShowRays} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Peak wavelength" value={`${peak.toFixed(0)} nm`} accent={at} />
        <Stat label="Colour" value={temp < 1500 ? "deep red" : temp < 2500 ? "red-orange" : temp < 3500 ? "orange" : temp < 5000 ? "yellow-white" : "white"} accent={at} />
        <Stat label="Power ∝ T⁴" value={`${(temp / 1000) ** 4 > 500 ? "very high" : (temp / 1000) ** 4 > 30 ? "high" : "low"}`} accent={at} />
      </div>
    </SimShell>
  );
}

export function MirrorSim({ topic }: { topic?: string }) {
  const a = "#0ea5e9";
  const at = "text-sky-600 dark:text-sky-400";
  const [objectDist, setObjectDist] = useState(40);
  const [focal, setFocal] = useState(20);
  const [showRays, setShowRays] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const f = focal;
  const u = objectDist;
  const v = 1 / (1 / f - 1 / u);
  const virtual = v < 0 || isNaN(v);
  const vAbs = Math.abs(v);
  const mag = v / u;
  const real = v > 0;
  const power = 1 / (f / 100);
  const rhs = isNaN(v) ? Infinity : 1 / u + 1 / v;
  const balanced = Math.abs(1 / f - rhs) < 1e-9;
  const mirrorX = 560;
  const axisY = 150;
  const scale = 3.2;
  const objH = 36;
  const imgH = objH * Math.abs(mag) * (virtual ? 1 : 1);
  const imgDir = real ? 1 : -1;
  return (
    <SimShell
      icon="🪞"
      title={simTitle(topic, "Concave mirror — ray diagram")}
      accent="sky"
      subtitle={`${topic ?? "Spherical mirrors"} — mirror equation 1/f = 1/v + 1/u. Beyond the centre the image is real and inverted; inside the focus it is virtual and upright.`}
      hint="A concave mirror inside the focal length makes a magnified virtual image — the face make-up mirror. Outside it makes a real, inverted image."
      controls={<SimChip accent="sky"><span aria-hidden>🪞</span>{topic ?? "spherical mirrors"}</SimChip>}
    >
      <SimCanvas
        deps={[objectDist, focal, v, virtual, real, imgH, imgDir, showRays, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "#94a3b8";
          ctx.setLineDash([6, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(20, axisY);
          ctx.lineTo(w - 20, axisY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(mirrorX - f * scale, axisY, f * scale * 2, -0.42, 0.42);
          ctx.stroke();
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "11px system-ui";
          ctx.fillText("mirror", mirrorX - 40, axisY + 40);
          ctx.fillStyle = "#64748b";
          ctx.beginPath();
          ctx.arc(mirrorX - f * scale, axisY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText("F", mirrorX - f * scale, axisY - 8);
          ctx.fillStyle = "#94a3b8";
          ctx.beginPath();
          ctx.arc(mirrorX - 2 * f * scale, axisY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText("C", mirrorX - 2 * f * scale, axisY - 8);
          const objX = mirrorX - u * scale;
          const imgX = virtual ? mirrorX + vAbs * scale : mirrorX - vAbs * scale;
          ctx.fillStyle = "#f43f5e";
          ctx.fillRect(objX - 5, axisY - objH, 10, objH);
          ctx.fillStyle = "#b91c1c";
          ctx.font = "11px system-ui";
          ctx.fillText("object", objX - 18, axisY - objH - 8);
          ctx.strokeStyle = "#0ea5e9";
          ctx.fillStyle = virtual ? "#0ea5e9" : "#f59e0b";
          if (!isNaN(imgX) && !isNaN(imgH)) {
            ctx.fillRect(imgX - 4, real ? axisY : axisY - imgH, 8, imgH);
            ctx.fillText("image", imgX - 12, real ? axisY + imgH + 16 : axisY - imgH - 8);
          }
          if (showRays && !isNaN(v)) {
            ctx.setLineDash(real ? [] : [6, 5]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#f59e0b";
            ctx.beginPath();
            ctx.moveTo(objX, axisY - objH);
            ctx.lineTo(mirrorX - 8, axisY - objH);
            ctx.lineTo(mirrorX - 8, axisY);
            ctx.moveTo(objX, axisY - objH);
            ctx.lineTo(objX - 60, axisY - objH);
            ctx.stroke();
            ctx.setLineDash(real ? [] : [6, 5]);
            ctx.strokeStyle = "#22d3ee";
            ctx.beginPath();
            ctx.moveTo(objX, axisY - objH);
            ctx.lineTo(mirrorX - f * scale + 4, axisY - 4);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(real ? "REAL, inverted image" : "VIRTUAL, upright image", 30, 26);
          ctx.fillStyle = "#334155";
          ctx.font = "11px system-ui";
          ctx.fillText(`1/f = ${(1 / f).toFixed(4)}  |  1/u + 1/v = ${rhs === Infinity ? "0" : rhs.toFixed(4)}  ${balanced ? "✓" : "✗"}`, 30, 44);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Object distance" value={objectDist} min={8} max={80} step={1} hex={a} accent={at} unit=" cm" onChange={setObjectDist} />
        <Slider label="Focal length" value={focal} min={10} max={35} step={1} hex={a} accent={at} unit=" cm" onChange={setFocal} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Rays" checked={showRays} onChange={setShowRays} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Image distance" value={isNaN(v) ? "∞" : `${vAbs.toFixed(1)} cm`} accent={at} />
        <Stat label="Magnification" value={isNaN(v) ? "∞" : `${Math.abs(mag).toFixed(2)}×`} accent={at} />
        <Stat label="Nature" value={virtual ? "virtual, upright" : "real, inverted"} accent={at} />
        <Stat label="Power P = 1/f" value={`${power.toFixed(2)} D`} accent="text-emerald-600 dark:text-emerald-400" />
      </div>
    </SimShell>
  );
}

export function NuclearSim({ topic }: { topic?: string }) {
  const a = "#84cc16";
  const at = "text-lime-600 dark:text-lime-400";
  const isotopes = [
    { name: "I-131", half: 8.02, unit: "days", perSec: 1.6, activity: "GBq" },
    { name: "C-14", half: 5730, unit: "years", perSec: 900, activity: "Bq" },
    { name: "Cs-137", half: 30.17, unit: "years", perSec: 5, activity: "kBq" },
    { name: "U-238", half: 4.47e9, unit: "years", perSec: 4e8, activity: "mBq" },
  ] as const;
  const [field, setField] = useState(false);
  const [wall, setWall] = useState(true);
  const [strength, setStrength] = useState(4);
  const [mode, setMode] = useState<"penetration" | "decay">("penetration");
  const [isoIdx, setIsoIdx] = useState(0);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const iso = isotopes[isoIdx];
  const n0 = 1000;
  const simAge = sim.elapsed * iso.perSec;
  const remaining = n0 * Math.pow(0.5, simAge / iso.half);
  const decayed = n0 - remaining;
  const lambda = Math.LN2 / iso.half;
  const activity = remaining * lambda;
  const halfmarks = 5;
  const baseY = 160;
  const alpha: { x: number; y: number; stop: number }[] = [];
  const beta: { x: number; y: number }[] = [];
  const gamma: { x: number; y: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const t = ((sim.tick + i * 4) % 30) / 30;
    const x = 120 + t * 430;
    const defl = field ? (i % 2 === 0 ? 1 : -1) * t * 55 : 0;
    alpha.push({ x, y: baseY + defl, stop: 0 });
  }
  for (let i = 0; i < 7; i++) {
    const t = ((sim.tick * 1.6 + i * 4) % 28) / 28;
    const x = 120 + t * 460;
    const defl = field ? (i % 2 === 0 ? -1 : 1) * t * 70 : 0;
    beta.push({ x, y: baseY + defl });
  }
  for (let i = 0; i < 5; i++) {
    const t = ((sim.tick * 2 + i * 5) % 24) / 24;
    const x = 120 + t * 480;
    gamma.push({ x, y: baseY });
  }
  const alphaDet = alpha.filter((p) => !wall || p.x < 420).length;
  const betaDet = beta.filter((p) => p.x < 430).length;
  const gammaDet = gamma.length;
  return (
    <SimShell
      icon="☢️"
      title={simTitle(topic, "Nuclear physics lab")}
      accent="lime"
      subtitle={`${topic ?? "Atomic & nuclear physics"} — ${mode === "decay" ? `radioactive decay: N = N₀·(½)^(t/T½). ${iso.name} has T½ = ${iso.half} ${iso.unit}.` : "alpha particles are slow and stop in paper; beta passes thin aluminium; gamma is the most penetrating."}`}
      hint="In an electric field, alpha bends one way and beta the opposite way because they carry opposite charge. Gamma, with no charge, is undeflected."
      controls={<SimChip accent="lime"><span aria-hidden>☢️</span>{topic ?? "radioactivity"}</SimChip>}
    >
      <SimCanvas
        deps={[field, wall, strength, alpha, beta, gamma, sim.tick, mode, remaining, activity, simAge, iso]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          if (mode === "penetration") {
            ctx.fillStyle = "#3f6212";
            ctx.fillRect(40, baseY - 10, 90, 26);
            ctx.strokeStyle = "#1a2e05";
            ctx.strokeRect(40, baseY - 10, 90, 26);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 11px system-ui";
            ctx.fillText("source", 60, baseY + 8);
            if (field) {
              ctx.fillStyle = "rgba(254,240,138,0.25)";
              ctx.fillRect(140, 20, 60, 220);
              ctx.fillStyle = "#facc15";
              ctx.font = "bold 12px system-ui";
              ctx.fillText("+", 152, 40);
              ctx.fillText("−", 152, 230);
              ctx.fillText("E", 160, 130);
            }
            if (wall) {
              ctx.fillStyle = "#94a3b8";
              ctx.fillRect(415, 60, 14, 200);
              ctx.fillStyle = "#334155";
              ctx.font = "11px system-ui";
              ctx.fillText("lead", 418, 40);
            }
            ctx.fillStyle = "#fde68a";
            for (const p of alpha) {
              if (!wall || p.x < 400) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#a16207";
                ctx.font = "bold 12px system-ui";
                ctx.fillText("α", p.x - 3, p.y - 8);
              }
            }
            ctx.fillStyle = "#a5b4fc";
            for (const p of beta) {
              if (p.x < 440) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#4338ca";
                ctx.font = "bold 11px system-ui";
                ctx.fillText("β", p.x - 3, p.y - 7);
              }
            }
            ctx.fillStyle = "#fda4af";
            for (const p of gamma) {
              ctx.beginPath();
              ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#be123c";
              ctx.font = "bold 11px system-ui";
              ctx.fillText("γ", p.x - 3, p.y - 7);
            }
            ctx.fillStyle = "#1a2e05";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`detector hits — α ${alphaDet} · β ${betaDet} · γ ${gammaDet}`, 30, 26);
            ctx.fillText("α heavy & + · β light & − · γ no charge", 30, 44);
          } else {
            const x0 = 60;
            const x1 = w - 40;
            const yN = 30;
            const yB = h - 34;
            const plotW = x1 - x0;
            const plotH = yB - yN;
            ctx.strokeStyle = "rgba(100,116,139,0.35)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0, yB);
            ctx.lineTo(x1, yB);
            ctx.moveTo(x0, yB);
            ctx.lineTo(x0, yN);
            ctx.stroke();
            ctx.fillStyle = "#4d7c0f";
            ctx.font = "11px system-ui";
            ctx.fillText("N atoms", 22, yN + 4);
            ctx.fillText("time →", x1 - 30, yB + 16);
            ctx.fillStyle = "#365314";
            ctx.font = "bold 11px system-ui";
            ctx.fillText(`${iso.name} · T½ = ${iso.half} ${iso.unit}`, x0, 20);
            ctx.strokeStyle = "rgba(132,204,22,0.25)";
            ctx.setLineDash([4, 4]);
            for (let k = 1; k < halfmarks; k++) {
              const hx = x0 + (k / halfmarks) * plotW;
              ctx.beginPath();
              ctx.moveTo(hx, yN);
              ctx.lineTo(hx, yB);
              ctx.stroke();
            }
            ctx.setLineDash([]);
            ctx.strokeStyle = "#a3e635";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let i = 0; i <= 100; i++) {
              const t = (i / 100) * (iso.half * halfmarks);
              const nt = n0 * Math.pow(0.5, t / iso.half);
              const px = x0 + (t / (iso.half * halfmarks)) * plotW;
              const py = yB - (nt / n0) * plotH;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
            const cl = Math.min(simAge, iso.half * halfmarks);
            const cx = x0 + (cl / (iso.half * halfmarks)) * plotW;
            const cy = yB - (remaining / n0) * plotH;
            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#365314";
            ctx.stroke();
            ctx.fillStyle = "#3f6212";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`${Math.round(remaining)} atoms remaining after ${simAge.toFixed(1)} ${iso.unit}`, 30, h - 10);
            ctx.fillStyle = "#4d7c0f";
            ctx.font = "12px system-ui";
            ctx.fillText(`half-lives elapsed: ${(simAge / iso.half).toFixed(2)}`, 30, h - 28);
            for (let k = 1; k <= halfmarks; k++) {
              ctx.fillStyle = "#365314";
              ctx.font = "10px system-ui";
              ctx.fillText(`${k}T½`, x0 + (k / halfmarks) * plotW - 8, yB + 14);
            }
          }
        }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ActionButton label={mode === "penetration" ? "Half-life decay" : "Penetration demo"} icon="🔄" hex={a} onClick={() => setMode((m) => (m === "penetration" ? "decay" : "penetration"))} />
        {mode === "decay" &&
          isotopes.map((it, i) => (
            <ActionButton key={it.name} label={`${it.name} T½=${it.half} ${it.unit}`} hex={isoIdx === i ? a : "#94a3b8"} onClick={() => setIsoIdx(i)} />
          ))}
      </div>
      {mode === "decay" ? (
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <Stat label="Half-life" value={`${iso.half} ${iso.unit}`} accent={at} />
          <Stat label="Decay constant λ" value={`${lambda >= 1e-6 ? lambda.toFixed(4) : lambda.toExponential(1)} /${iso.unit}`} accent={at} />
          <Stat label="Remaining" value={`${Math.round(remaining)} / ${n0} nuclei`} accent={at} />
          <Stat label="Decayed" value={`${Math.round(decayed)} nuclei`} accent="text-amber-600 dark:text-amber-400" />
          <Stat label="Activity A = λN" value={`${activity >= 100 ? activity.toFixed(0) : activity >= 1 ? activity.toFixed(2) : activity.toExponential(1)} ${iso.activity}`} accent={at} />
          <Stat label="Half-lives" value={`${(simAge / iso.half).toFixed(2)}`} accent={at} />
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Slider label="Source strength" value={strength} min={1} max={8} step={1} hex={a} accent={at} onChange={setStrength} />
            <div className="rounded-xl border border-white/40 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
              <span className="text-[11px] uppercase tracking-wide text-foreground/50">Penetration</span>
              <div className="font-semibold text-foreground">α &lt; paper · β &lt; aluminium · γ &lt; lead</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Toggle label="Electric field" checked={field} onChange={setField} hex={a} hint="deflects α and β, not γ" />
            <Toggle label="Lead wall" checked={wall} onChange={setWall} hex={a} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <Stat label="Alpha" value={`${alphaDet} hits`} accent="text-amber-600 dark:text-amber-400" />
            <Stat label="Beta" value={`${betaDet} hits`} accent="text-indigo-600 dark:text-indigo-400" />
            <Stat label="Gamma" value={`${gammaDet} hits`} accent={at} />
          </div>
        </>
      )}
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
    </SimShell>
  );
}

export function FluidsSim({ topic }: { topic?: string }) {
  const a = "#06b6d4";
  const at = "text-cyan-600 dark:text-cyan-400";
  const [liquidDensity, setLiquidDensity] = useState(1.2);
  const [objectDensity, setObjectDensity] = useState(0.8);
  const [showForces, setShowForces] = useState(true);
  const [mode, setMode] = useState<"buoyancy" | "pressure">("buoyancy");
  const [depth, setDepth] = useState(5);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const floats = objectDensity < liquidDensity;
  const buoyancy = liquidDensity * 10 * (floats ? objectDensity / liquidDensity : 1);
  const weight = objectDensity * 10;
  const net = buoyancy - weight;
  const bob = floats ? Math.sin(sim.tick * 0.06) * 3 : Math.sin(sim.tick * 0.05) * 2;
  const waterTop = 60;
  const waterLevel = floats ? waterTop + 42 : waterTop + 20;
  const objY = floats ? waterLevel + 22 + bob : waterTop + 70 + bob;
  const gaugeP = liquidDensity * 1000 * 9.8 * depth;
  const absP = gaugeP + 101325;
  return (
    <SimShell
      icon="🫧"
      title={simTitle(topic, "Pressure & fluids")}
      accent="cyan"
      subtitle={
        mode === "buoyancy"
          ? `${topic ?? "Pressure in fluids"} — upthrust equals the weight of displaced liquid. A body floats when its density is lower than the liquid's.`
          : `${topic ?? "Pressure in fluids"} — hydrostatic pressure P = ρgh grows linearly with depth beneath the surface.`
      }
      hint="An iceberg floats because ice (0.92 g/cm³) is lighter than sea water. Dams are thicker at the bottom because pressure grows with depth: P = ρgh."
      controls={<SimChip accent="cyan"><span aria-hidden>🫧</span>{topic ?? "fluids"}</SimChip>}
    >
      <SimCanvas
        deps={[liquidDensity, objectDensity, floats, buoyancy, weight, net, waterLevel, objY, showForces, sim.tick, mode, depth, gaugeP, absP]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          if (mode === "buoyancy") {
            ctx.fillStyle = "#f0f9ff";
            ctx.fillRect(30, 30, 240, 200);
            ctx.strokeStyle = "#0e7490";
            ctx.lineWidth = 3;
            ctx.strokeRect(30, 30, 240, 200);
            const liqH = 200 - (waterTop - 30);
            const lg = ctx.createLinearGradient(0, 30, 0, 230);
            lg.addColorStop(0, "#22d3ee");
            lg.addColorStop(1, "#0891b2");
            ctx.globalAlpha = Math.min(0.9, liquidDensity);
            ctx.fillStyle = lg;
            ctx.fillRect(30, waterTop, 240, liqH);
            ctx.globalAlpha = 1;
            const color = objectDensity > 1.8 ? "#475569" : objectDensity > 1.2 ? "#94a3b8" : "#fbbf24";
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(150, objY, 26, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#1e293b";
            ctx.font = "bold 11px system-ui";
            ctx.fillText(`${objectDensity.toFixed(1)} g/cm³`, 118, objY + 4);
            if (showForces) {
              ctx.strokeStyle = "#ef4444";
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(150, objY - 26);
              ctx.lineTo(150, objY - 60);
              ctx.moveTo(150, objY - 60);
              ctx.lineTo(140, objY - 50);
              ctx.moveTo(150, objY - 60);
              ctx.lineTo(160, objY - 50);
              ctx.stroke();
              ctx.fillStyle = "#dc2626";
              ctx.font = "bold 11px system-ui";
              ctx.fillText(`W ${weight.toFixed(1)} N`, 158, objY - 50);
              ctx.strokeStyle = "#0891b2";
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(150, objY + 26);
              ctx.lineTo(150, objY + 58);
              ctx.moveTo(150, objY + 58);
              ctx.lineTo(140, objY + 48);
              ctx.moveTo(150, objY + 58);
              ctx.lineTo(160, objY + 48);
              ctx.stroke();
              ctx.fillStyle = "#0e7490";
              ctx.font = "bold 11px system-ui";
              ctx.fillText(`U ${buoyancy.toFixed(1)} N`, 158, objY + 50);
            }
            ctx.fillStyle = "#155e75";
            ctx.font = "12px system-ui";
            ctx.fillText(`liquid ${liquidDensity.toFixed(1)} g/cm³`, 40, 46);
            ctx.fillStyle = "#083344";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(floats ? "FLOATS" : "SINKS", 300, 70);
            ctx.fillStyle = "#334155";
            ctx.font = "12px system-ui";
            ctx.fillText(`net ${net.toFixed(1)} N`, 300, 90);
            if (!floats) {
              ctx.fillStyle = "#64748b";
              ctx.font = "11px system-ui";
              ctx.fillText("sits on the floor", 300, 108);
            }
          } else {
            const tankX = 40;
            const tankY = 40;
            const tankW = 260;
            const tankH = h - 76;
            ctx.fillStyle = "#f0f9ff";
            ctx.fillRect(tankX - 4, tankY - 4, tankW + 8, tankH + 8);
            ctx.strokeStyle = "#0e7490";
            ctx.lineWidth = 3;
            ctx.strokeRect(tankX, tankY, tankW, tankH);
            const grad = ctx.createLinearGradient(0, tankY, 0, tankY + tankH);
            grad.addColorStop(0, "#a5f3fc");
            grad.addColorStop(1, "#0891b2");
            ctx.fillStyle = grad;
            ctx.fillRect(tankX, tankY, tankW, tankH);
            const markerY = tankY + (depth / 20) * (tankH - 40);
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(tankX, markerY);
            ctx.lineTo(tankX + tankW, markerY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#7c2d12";
            ctx.font = "bold 11px system-ui";
            ctx.fillText(`depth h = ${depth.toFixed(1)} m`, tankX + tankW + 10, markerY + 4);
            const measureX = tankX + tankW + 14;
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(measureX, markerY);
            ctx.lineTo(measureX, tankY + tankH);
            ctx.stroke();
            ctx.fillStyle = "#0e7490";
            ctx.font = "11px system-ui";
            ctx.fillText("surface", tankX + tankW / 2 - 22, tankY - 8);
            ctx.fillStyle = "#164e63";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(`gauge P = ${(gaugeP / 1000).toFixed(1)} kPa`, 330, 70);
            ctx.fillStyle = "#0f766e";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`absolute = ${(absP / 1000).toFixed(1)} kPa`, 330, 90);
            ctx.fillStyle = "#334155";
            ctx.font = "12px system-ui";
            ctx.fillText("= gauge + 101.3 kPa", 330, 108);
            ctx.fillStyle = "#155e75";
            ctx.font = "12px system-ui";
            ctx.fillText(`ρ = ${liquidDensity.toFixed(2)} g/cm³`, tankX + 10, tankY - 8);
          }
        }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ActionButton label={mode === "buoyancy" ? "Hydrostatic pressure" : "Buoyancy"} icon="🔄" hex={a} onClick={() => setMode((m) => (m === "buoyancy" ? "pressure" : "buoyancy"))} />
      </div>
      {mode === "buoyancy" ? (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Slider label="Liquid density" value={liquidDensity} min={0.5} max={2} step={0.05} hex={a} accent={at} unit=" g/cm³" onChange={setLiquidDensity} />
            <Slider label="Object density" value={objectDensity} min={0.3} max={2.2} step={0.05} hex={a} accent={at} unit=" g/cm³" onChange={setObjectDensity} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
            <Toggle label="Force arrows" checked={showForces} onChange={setShowForces} hex={a} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <Stat label="Upthrust" value={`${buoyancy.toFixed(1)} N`} accent={at} />
            <Stat label="Weight" value={`${weight.toFixed(1)} N`} accent="text-rose-600 dark:text-rose-400" />
            <Stat label="Behaviour" value={floats ? "floats" : "sinks"} accent={floats ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
          </div>
        </>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Slider label="Depth below surface" value={depth} min={0} max={20} step={0.5} hex={a} accent={at} unit=" m" onChange={setDepth} />
            <Slider label="Liquid density" value={liquidDensity} min={0.5} max={2} step={0.05} hex={a} accent={at} unit=" g/cm³" onChange={setLiquidDensity} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <Stat label="Gauge P = ρgh" value={`${(gaugeP / 1000).toFixed(1)} kPa`} accent={at} />
            <Stat label="Atmospheric" value="101.3 kPa" accent={at} />
            <Stat label="Absolute P" value={`${(absP / 1000).toFixed(1)} kPa`} accent="text-emerald-600 dark:text-emerald-400" />
          </div>
        </>
      )}
    </SimShell>
  );
}

export function RefractionSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [incident, setIncident] = useState(45);
  const [n1, setN1] = useState(1);
  const [n2, setN2] = useState(1.5);
  const [showNormal, setShowNormal] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const media = [
    { name: "Air", n: 1 },
    { name: "Water", n: 1.33 },
    { name: "Glass", n: 1.5 },
    { name: "Diamond", n: 2.42 },
  ] as const;
  const sin2 = (n1 * Math.sin((incident * Math.PI) / 180)) / n2;
  const snell = Math.asin(Math.min(1, sin2));
  const refracted = (snell * 180) / Math.PI;
  const critical = n1 > n2 ? Math.asin(n2 / n1) * (180 / Math.PI) : Infinity;
  const tir = n1 > n2 && incident > critical;
  const lhs = n1 * Math.sin((incident * Math.PI) / 180);
  const rhs = n2 * Math.sin(snell);
  const speed2 = 3e8 / n2;
  const pulse = (sim.tick % 40) / 40;
  const preset = (a: number, b: number) => {
    setN1(a);
    setN2(b);
  };
  return (
    <SimShell
      icon="🔦"
      title={simTitle(topic, "Refraction of light")}
      accent="violet"
      subtitle={`${topic ?? "Refraction"} — Snell's law n₁ sin θ₁ = n₂ sin θ₂. Light bends toward the normal entering a denser medium; light speeds up and bends away entering a rarer one.`}
      hint="Total internal reflection only happens going from a denser to a rarer medium (n₁ > n₂) beyond the critical angle — the principle behind optical fibres, prisms, and shimmering water surfaces."
      controls={<SimChip accent="violet"><span aria-hidden>🔦</span>{topic ?? "refraction"}</SimChip>}
    >
      <SimCanvas
        deps={[incident, n1, n2, refracted, tir, critical, showNormal, pulse, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const midY = h / 2;
          ctx.fillStyle = "#f5f3ff";
          ctx.fillRect(0, 0, w, midY);
          ctx.fillStyle = "#ede9fe";
          ctx.fillRect(0, midY, w, h - midY);
          ctx.strokeStyle = "#7c3aed";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(30, midY);
          ctx.lineTo(w - 30, midY);
          ctx.stroke();
          if (showNormal) {
            ctx.strokeStyle = "rgba(124,58,237,0.5)";
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(w / 2, 20);
            ctx.lineTo(w / 2, h - 20);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#6d28d9";
            ctx.font = "11px system-ui";
            ctx.fillText("normal", w / 2 + 8, 30);
          }
          ctx.strokeStyle = "#7c3aed";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(w / 2, midY);
          ctx.lineTo(w / 2 - Math.sin((incident * Math.PI) / 180) * 130, midY - Math.cos((incident * Math.PI) / 180) * 130);
          ctx.stroke();
          const px = w / 2 + Math.sin((refracted * Math.PI) / 180) * 140;
          const py = midY + Math.cos((refracted * Math.PI) / 180) * 140;
          ctx.strokeStyle = "#c4b5fd";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(w / 2, midY);
          ctx.lineTo(px, py);
          ctx.stroke();
          if (tir) {
            const rx = w / 2 + Math.sin((incident * Math.PI) / 180) * 140;
            const ry = midY - Math.cos((incident * Math.PI) / 180) * 140;
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(w / 2, midY);
            ctx.lineTo(rx, ry);
            ctx.stroke();
          }
          ctx.fillStyle = "#6d28d9";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`θ₁ = ${incident}°`, w / 2 - 130 - Math.sin((incident * Math.PI) / 180) * 40, midY - 30);
          ctx.fillStyle = "#5b21b6";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(tir ? "no refracted ray" : `θ₂ = ${refracted.toFixed(1)}°`, px - 60, py + 16);
          ctx.fillStyle = "#7c3aed";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(tir ? `TOTAL INTERNAL REFLECTION (θc = ${critical.toFixed(1)}°)` : `medium n=${n1.toFixed(2)}  →  medium n=${n2.toFixed(2)}`, 30, 26);
          ctx.fillStyle = "#334155";
          ctx.font = "11px system-ui";
          ctx.fillText(`n₁sinθ₁ = ${lhs.toFixed(3)}  |  n₂sinθ₂ = ${rhs.toFixed(3)}  ✓`, 30, 44);
          ctx.fillStyle = "#6d28d9";
          ctx.font = "11px system-ui";
          ctx.fillText(`v in medium 2 = c/n₂ = ${(speed2 / 1e8).toFixed(2)} ×10⁸ m/s`, 30, 62);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="n₁ (incident medium)" value={n1} min={1} max={2.42} step={0.01} hex={a} accent={at} onChange={setN1} />
        <Slider label="n₂ (second medium)" value={n2} min={1} max={2.42} step={0.01} hex={a} accent={at} onChange={setN2} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Slider label="Angle of incidence" value={incident} min={0} max={89} step={1} hex={a} accent={at} unit="°" onChange={setIncident} />
        <Toggle label="Normal line" checked={showNormal} onChange={setShowNormal} hex={a} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ActionButton label="Air → Water" hex={a} onClick={() => preset(media[0].n, media[1].n)} />
        <ActionButton label="Water → Air" hex={a} onClick={() => preset(media[1].n, media[0].n)} />
        <ActionButton label="Glass → Air" hex={a} onClick={() => preset(media[2].n, media[0].n)} />
        <ActionButton label="Diamond → Glass" hex={a} onClick={() => preset(media[3].n, media[2].n)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Refracted angle" value={tir ? "—" : `${refracted.toFixed(1)}°`} accent={at} />
        <Stat label="Critical angle" value={isFinite(critical) ? `${critical.toFixed(1)}°` : "—"} accent={at} />
        <Stat label="Condition" value={tir ? "total internal reflection" : "normal refraction"} accent={tir ? "text-amber-600 dark:text-amber-400" : at} />
        <Stat label="v = c/n₂" value={`${(speed2 / 1e8).toFixed(2)} ×10⁸ m/s`} accent="text-emerald-600 dark:text-emerald-400" />
      </div>
    </SimShell>
  );
}

export function TransformerSim({ topic }: { topic?: string }) {
  const a = "#f59e0b";
  const at = "text-amber-600 dark:text-amber-400";
  const [nP, setNP] = useState(500);
  const [nS, setNS] = useState(1000);
  const [loadOn, setLoadOn] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const vP = 220;
  const vS = (vP * nS) / nP;
  const iS = loadOn ? 2 : 0;
  const iP = (vS * iS) / vP;
  const ratio = nS / nP;
  const pP = vP * iP;
  const pS = vS * iS;
  const vpt = vP / nP;
  const wave = Math.sin(sim.tick * 0.15);
  const steps = ratio > 1.05 ? "step-up" : ratio < 0.95 ? "step-down" : "1:1";
  const setRatio = (a: number, b: number) => {
    setNP(a);
    setNS(b);
  };
  return (
    <SimShell
      icon="⚡"
      title={simTitle(topic, "The transformer")}
      accent="amber"
      subtitle={`${topic ?? "Electromagnetic induction"} — Vₛ/Vₚ = Nₛ/Nₚ. A transformer steps voltage up or down while power is conserved.`}
      hint="Step-up transformers raise voltage for long-distance transmission (less loss), then step-down transformers lower it for safe home use."
      controls={<SimChip accent="amber"><span aria-hidden>⚡</span>{topic ?? "transformer"}</SimChip>}
    >
      <SimCanvas
        deps={[nP, nS, vS, loadOn, wave, steps, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#d6d3d1";
          ctx.fillRect(180, 60, 280, 130);
          ctx.strokeStyle = "#44403c";
          ctx.lineWidth = 3;
          ctx.strokeRect(180, 60, 280, 130);
          ctx.fillStyle = "#a8a29e";
          ctx.fillRect(180, 100, 280, 10);
          ctx.fillRect(180, 140, 280, 10);
          ctx.fillStyle = "#fbbf24";
          ctx.font = "bold 13px system-ui";
          ctx.fillText("iron core", 292, 90);
          const coil = (x: number, color: string, label: string) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            for (let i = 0; i < 5; i++) {
              ctx.beginPath();
              ctx.arc(x, 82 + i * 17, 12, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.fillStyle = color;
            ctx.font = "bold 12px system-ui";
            ctx.fillText(label, x - 20, 172);
          };
          coil(190, "#f97316", "primary");
          coil(450, "#0ea5e9", "secondary");
          const waveY = 130 + Math.sin(sim.tick * 0.15) * 6;
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(90, 130);
          ctx.lineTo(120, 130);
          ctx.lineTo(140, 130);
          for (let i = 0; i < 4; i++) {
            ctx.quadraticCurveTo(150 + i * 20, 130 - waveY * 0.4, 160 + i * 20, 130);
          }
          ctx.lineTo(190, 130);
          ctx.stroke();
          ctx.fillStyle = "#c2410c";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`Vp = ${vP} V`, 40, 60);
          ctx.fillText(`Ip = ${iP.toFixed(2)} A`, 40, 80);
          ctx.strokeStyle = "#0ea5e9";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(460, 130);
          ctx.lineTo(530, 130);
          ctx.stroke();
          const out = loadOn ? "on" : "off";
          ctx.fillStyle = "#0369a1";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`Vs = ${vS.toFixed(0)} V`, 470, 60);
          ctx.fillText(`Is = ${iS.toFixed(0)} A (load ${out})`, 470, 80);
          if (wave > 0) {
            ctx.strokeStyle = "rgba(245,158,11,0.5)";
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(190, 100);
            ctx.lineTo(450, 100);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.fillStyle = "#78350f";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${steps} · ratio ${ratio.toFixed(2)} · power ${pP.toFixed(1)} W`, 30, 26);
          ctx.fillStyle = "#334155";
          ctx.font = "11px system-ui";
          ctx.fillText(`Vp/Vs = ${(vP / vS).toFixed(2)}  =  Np/Ns = ${(nP / nS).toFixed(2)}  ✓`, 30, 44);
          ctx.fillStyle = "#0e7490";
          ctx.font = "11px system-ui";
          ctx.fillText(`volts/turn = ${vpt.toFixed(2)} V · P₁ = ${pP.toFixed(1)} W, P₂ = ${pS.toFixed(1)} W`, 30, 62);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Primary turns" value={nP} min={100} max={2000} step={50} hex={a} accent={at} onChange={setNP} />
        <Slider label="Secondary turns" value={nS} min={100} max={2000} step={50} hex={a} accent={at} onChange={setNS} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ActionButton label="Step-up 1:5" hex={a} onClick={() => setRatio(500, 2500)} />
        <ActionButton label="Step-down 5:1" hex={a} onClick={() => setRatio(2000, 400)} />
        <ActionButton label="1:1" hex={a} onClick={() => setRatio(1000, 1000)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Load connected" checked={loadOn} onChange={setLoadOn} hex={a} hint="secondary current flows" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Secondary voltage" value={`${vS.toFixed(0)} V`} accent={at} />
        <Stat label="Turns ratio" value={`${ratio.toFixed(2)}`} accent={at} />
        <Stat label="Type" value={steps} accent={at} />
        <Stat label="P₁ vs P₂" value={loadOn ? `${pP.toFixed(1)} = ${pS.toFixed(1)} W` : "idle"} accent="text-emerald-600 dark:text-emerald-400" />
      </div>
    </SimShell>
  );
}

export function LogicGatesSim({ topic }: { topic?: string }) {
  const a = "#6366f1";
  const at = "text-indigo-600 dark:text-indigo-400";
  const gates = ["AND", "OR", "NAND", "NOR", "NOT", "XOR"] as const;
  const [gate, setGate] = useState<(typeof gates)[number]>("AND");
  const [inputA, setInputA] = useState(true);
  const [inputB, setInputB] = useState(true);
  const [pulse, setPulse] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const isNot = gate === "NOT";
  const out =
    gate === "AND"
      ? inputA && inputB
      : gate === "OR"
        ? inputA || inputB
        : gate === "NAND"
          ? !(inputA && inputB)
          : gate === "NOR"
            ? !(inputA || inputB)
            : gate === "NOT"
              ? !inputA
              : inputA !== inputB;
  const truth = {
    AND: [["0", "0", "0"], ["0", "1", "0"], ["1", "0", "0"], ["1", "1", "1"]],
    OR: [["0", "0", "0"], ["0", "1", "1"], ["1", "0", "1"], ["1", "1", "1"]],
    NAND: [["0", "0", "1"], ["0", "1", "1"], ["1", "0", "1"], ["1", "1", "0"]],
    NOR: [["0", "0", "1"], ["0", "1", "0"], ["1", "0", "0"], ["1", "1", "0"]],
    NOT: [["0", "0", "1"], ["1", "0", "0"]],
    XOR: [["0", "0", "0"], ["0", "1", "1"], ["1", "0", "1"], ["1", "1", "0"]],
  }[gate];
  const wav = pulse ? (sim.tick % 30) / 30 : 0.5;
  return (
    <SimShell
      icon="🔀"
      title={simTitle(topic, "Logic gates")}
      accent="indigo"
      subtitle={`${topic ?? "Basic electronics"} — logic gates combine binary inputs (0 or 1). Choose a gate and flip the switches to see the output.`}
      hint="NAND and NOR are universal gates — any other gate can be built from them. AND gives 1 only when both inputs are 1."
      controls={<SimChip accent="indigo"><span aria-hidden>🔀</span>{topic ?? "logic gates"}</SimChip>}
    >
      <SimCanvas
        deps={[gate, inputA, inputB, out, truth, wav, isNot, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cy = h / 2;
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(70, cy - 30);
          ctx.lineTo(170, cy - 30);
          ctx.moveTo(70, cy + 30);
          ctx.lineTo(170, cy + 30);
          ctx.stroke();
          if (!isNot) {
            const aCol = inputA ? "#22c55e" : "#ef4444";
            ctx.strokeStyle = aCol;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(90, cy - 30);
            ctx.lineTo(90 + (wav * 60), cy - 30);
            ctx.stroke();
            ctx.fillStyle = aCol;
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`A = ${inputA ? 1 : 0}`, 78, cy - 46);
          }
          const bCol = inputB ? "#22c55e" : "#ef4444";
          if (!isNot) {
            ctx.strokeStyle = bCol;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(90, cy + 30);
            ctx.lineTo(90 + (wav * 60), cy + 30);
            ctx.stroke();
            ctx.fillStyle = bCol;
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`B = ${inputB ? 1 : 0}`, 78, cy + 46);
          }
          ctx.strokeStyle = "#4338ca";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(170, cy);
          ctx.lineTo(200, cy);
          ctx.arc(200, cy, 60, -Math.PI / 2, Math.PI / 2);
          ctx.lineTo(320, cy);
          ctx.stroke();
          if (gate === "NAND" || gate === "NOR") {
            ctx.beginPath();
            ctx.arc(320, cy, 7, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = "#4338ca";
          ctx.font = "bold 20px system-ui";
          ctx.fillText(gate, 228, cy + 8);
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(340, cy);
          ctx.lineTo(430, cy);
          ctx.stroke();
          ctx.fillStyle = out ? "#22c55e" : "#ef4444";
          ctx.beginPath();
          ctx.arc(460, cy, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#334155";
          ctx.stroke();
          ctx.fillStyle = out ? "#22c55e" : "#ef4444";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(out ? "ON" : "OFF", 442, cy + 4);
          ctx.fillStyle = "#4338ca";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`${gate} gate`, 30, 26);
          const tx = 30;
          const ty = 205;
          ctx.font = "10px system-ui";
          ctx.fillText("A", tx, ty);
          ctx.fillText("B", tx + 30, ty);
          ctx.fillText("OUT", tx + 60, ty);
          for (const row of truth) {
            ctx.fillStyle = "#334155";
            ctx.font = "11px system-ui";
            ctx.fillText(row.join("   "), tx, ty + 12 + (truth.indexOf(row) * 13) % 26);
          }
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {gates.map((g) => (
          <ActionButton key={g} label={g} onClick={() => setGate(g)} hex={gate === g ? a : "#94a3b8"} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Toggle label="Input A = 1" checked={inputA} onChange={setInputA} hex={a} />
        <Toggle label="Input B = 1" checked={inputB} onChange={setInputB} hex={a} hint={isNot ? "ignored by NOT" : undefined} />
        <Toggle label="Pulse" checked={pulse} onChange={setPulse} hex={a} hint="animates current flow" />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Output" value={out ? "1 (HIGH)" : "0 (LOW)"} accent={out ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
        <Stat label="Expression" value={gate === "NOT" ? "Q = ¬A" : `Q = A ${gate === "XOR" ? "⊕" : gate.toLowerCase()} B`} accent={at} />
      </div>
    </SimShell>
  );
}

export function ThermalExpansionSim({ topic }: { topic?: string }) {
  const a = "#f43f5e";
  const at = "text-rose-600 dark:text-rose-400";
  const [temp, setTemp] = useState(25);
  const [metal, setMetal] = useState("brass");
  const [showGap, setShowGap] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const alpha: Record<string, number> = { brass: 19, steel: 12, aluminium: 23 };
  const expansion = (temp - 25) * alpha[metal];
  const ballR = 34 * (1 + expansion / 1000);
  const gapR = 37;
  const fits = ballR < gapR;
  const bend = (temp - 25) * 0.35;
  const heatGlow = Math.min(1, (temp - 25) / 175);
  return (
    <SimShell
      icon="🧲"
      title={simTitle(topic, "Thermal expansion")}
      accent="rose"
      subtitle={`${topic ?? "Thermal properties"} — most materials expand when heated: ΔL = L₀ × α × ΔT. Different metals expand by different amounts.`}
      hint="A bimetallic strip bends because brass expands more than steel — that is how thermostats and bimetallic switches work."
      controls={<SimChip accent="rose"><span aria-hidden>🧲</span>{topic ?? "thermal expansion"}</SimChip>}
    >
      <SimCanvas
        deps={[temp, metal, expansion, ballR, fits, bend, heatGlow, showGap, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#f1f5f9";
          ctx.fillRect(30, 30, 190, 190);
          ctx.strokeStyle = "#94a3b8";
          ctx.strokeRect(30, 30, 190, 190);
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(125, 100, gapR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#334155";
          ctx.font = "11px system-ui";
          ctx.fillText("ring", 60, 90);
          const grad = ctx.createRadialGradient(125, 165, 4, 125, 165, ballR);
          grad.addColorStop(0, "#fecdd3");
          grad.addColorStop(1, metal === "aluminium" ? "#94a3b8" : metal === "steel" ? "#64748b" : "#b45309");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(125, 165, ballR, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#1e293b";
          ctx.stroke();
          ctx.fillStyle = "#334155";
          ctx.font = "10px system-ui";
          ctx.fillText(`${metal} ball ${(temp - 25) > 0 ? "+" : ""}${expansion.toFixed(0)} µm`, 60, 200);
          ctx.fillStyle = fits ? "#16a34a" : "#dc2626";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(fits ? "fits through" : "too big — won't pass", 40, 232);
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(250, 200);
          ctx.lineTo(560, 200);
          ctx.stroke();
          ctx.fillStyle = "#fda4af";
          ctx.fillRect(270, 180, 120, 20);
          ctx.strokeStyle = "#e11d48";
          ctx.lineWidth = 2;
          ctx.strokeRect(270, 180, 120, 20);
          ctx.fillStyle = "#881337";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("brass", 300, 194);
          ctx.fillStyle = "#94a3b8";
          ctx.fillRect(270 + bend * 2, 160, 120, 20);
          ctx.strokeStyle = "#475569";
          ctx.strokeRect(270 + bend * 2, 160, 120, 20);
          ctx.fillStyle = "#334155";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("steel", 305 + bend * 2, 174);
          ctx.fillStyle = "#f59e0b";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`bend ${bend.toFixed(1)}°`, 300, 240);
          ctx.fillStyle = "#7f1d1d";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`${temp}°C ${metal === "brass" ? "brass" : metal} ${expansion.toFixed(0)} µm`, 30, 26);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Temperature" value={temp} min={25} max={200} step={1} hex={a} accent={at} unit="°C" onChange={setTemp} />
        <div className="flex flex-wrap items-end gap-2">
          {["brass", "steel", "aluminium"].map((m) => (
            <ActionButton key={m} label={m} onClick={() => setMetal(m)} hex={metal === m ? a : "#94a3b8"} />
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show gap check" checked={showGap} onChange={setShowGap} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Expansion" value={`+${expansion.toFixed(0)} µm`} accent={at} />
        <Stat label="α value" value={`${alpha[metal]} ×10⁻⁶ /°C`} accent={at} />
        <Stat label="Ball test" value={fits ? "passes" : "stuck"} accent={fits ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
      </div>
    </SimShell>
  );
}

export function HeatTransferSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const modes = ["Conduction", "Convection", "Radiation"] as const;
  const [mode, setMode] = useState<(typeof modes)[number]>("Conduction");
  const [heat, setHeat] = useState(50);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const warm = sim.tick % 8 < 4;
  return (
    <SimShell
      icon="♨️"
      title={simTitle(topic, "Heat transfer")}
      accent="orange"
      subtitle={`${topic ?? "Transfer of heat"} — heat moves by conduction (solids), convection (liquids & gases) and radiation (no medium needed).`}
      hint="Metals conduct best because free electrons carry heat. Convection drives winds and sea currents; radiation reaches us from the Sun through space."
      controls={<SimChip accent="orange"><span aria-hidden>♨️</span>{topic ?? "heat transfer"}</SimChip>}
    >
      <SimCanvas
        deps={[mode, heat, warm, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          if (mode === "Conduction") {
            const rodY = 110;
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(40, rodY - 16, 520, 32);
            for (let x = 40; x < 560; x += 4) {
              const t = (x - 40) / 520;
              const r = Math.round(254 - 170 * t);
              const g = Math.round(140 - 90 * t);
              const b = Math.round(90 - 60 * t);
              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, rodY - 16, 4, 32);
            }
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.moveTo(40, rodY - 24);
            ctx.lineTo(72, rodY);
            ctx.lineTo(40, rodY + 24);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = warm ? "#fbbf24" : "#fb923c";
            ctx.beginPath();
            ctx.arc(64, rodY, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(96, rodY);
            ctx.lineTo(96, rodY - 8);
            ctx.moveTo(96, rodY);
            ctx.lineTo(96, rodY + 8);
            ctx.moveTo(140, rodY);
            ctx.lineTo(140, rodY - 12);
            ctx.moveTo(140, rodY);
            ctx.lineTo(140, rodY + 12);
            ctx.moveTo(220, rodY);
            ctx.lineTo(220, rodY - 16);
            ctx.moveTo(220, rodY);
            ctx.lineTo(220, rodY + 16);
            ctx.moveTo(340, rodY);
            ctx.lineTo(340, rodY - 20);
            ctx.moveTo(340, rodY);
            ctx.lineTo(340, rodY + 20);
            ctx.moveTo(480, rodY);
            ctx.lineTo(480, rodY - 22);
            ctx.moveTo(480, rodY);
            ctx.lineTo(480, rodY + 22);
            ctx.stroke();
            ctx.fillStyle = "#9a3412";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("flame → atoms vibrate more → neighbours vibrate too", 30, 26);
            ctx.fillText("hot end", 40, rodY - 40);
            ctx.fillText("cold end", 500, rodY - 40);
          } else if (mode === "Convection") {
            ctx.fillStyle = "#e0f2fe";
            ctx.fillRect(40, 30, 200, 180);
            ctx.strokeStyle = "#0c4a6e";
            ctx.lineWidth = 3;
            ctx.strokeRect(40, 30, 200, 180);
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.moveTo(100, 212);
            ctx.lineTo(140, 230);
            ctx.lineTo(100, 248);
            ctx.lineTo(60, 230);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = warm ? "#fbbf24" : "#fb923c";
            ctx.beginPath();
            ctx.arc(100, 228, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#0284c7";
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(140, 120, 46, Math.PI * 0.6, Math.PI * 1.4);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(140, 120, 46, -Math.PI * 0.4, Math.PI * 0.4);
            ctx.stroke();
            ctx.fillStyle = "#0369a1";
            ctx.font = "bold 11px system-ui";
            ctx.fillText("warm rises", 168, 66);
            ctx.fillText("cool sinks", 170, 180);
            const phase = sim.tick * 0.04;
            ctx.fillStyle = "#ef4444";
            for (let i = 0; i < 5; i++) {
              const t = ((i / 5 + phase) % 1);
              const ang = t * Math.PI * 2;
              const x = 140 + Math.cos(ang) * 46;
              const y = 120 + Math.sin(ang) * 46;
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = "#0c4a6e";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("fluid circulates — warm rises, cool sinks", 280, 60);
            ctx.fillStyle = "#334155";
            ctx.font = "12px system-ui";
            ctx.fillText("this drives winds, sea", 280, 80);
            ctx.fillText("currents and radiators", 280, 96);
          } else {
            ctx.fillStyle = "#1e1b4b";
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.moveTo(60, 60);
            ctx.lineTo(100, 130);
            ctx.lineTo(20, 130);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("Sun", 40, 78);
            const warm = heat / 100;
            const waveColor = sim.tick % 10 < 5 ? "rgba(250,204,21,0.9)" : "rgba(249,115,22,0.7)";
            ctx.strokeStyle = waveColor;
            ctx.lineWidth = 2.5;
            for (let i = 0; i < 6; i++) {
              const x = 120 + i * 34;
              ctx.beginPath();
              ctx.moveTo(x, 120);
              ctx.quadraticCurveTo(x + 17, 120 - 26 * warm, x + 34, 120);
              ctx.stroke();
            }
            ctx.fillStyle = "#fbbf24";
            ctx.fillRect(360, 90, 60, 60);
            ctx.strokeStyle = "#78350f";
            ctx.strokeRect(360, 90, 60, 60);
            ctx.fillStyle = "#7c2d12";
            ctx.font = "bold 11px system-ui";
            ctx.fillText("target", 372, 120);
            ctx.fillStyle = "#fef3c7";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`warming ${(heat).toFixed(0)}%`, 340, 70);
            ctx.fillStyle = "#e0e7ff";
            ctx.font = "12px system-ui";
            ctx.fillText("no medium needed —", 160, 200);
            ctx.fillText("through empty space", 160, 216);
          }
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {modes.map((m) => (
          <ActionButton key={m} label={m} onClick={() => setMode(m)} hex={mode === m ? a : "#94a3b8"} />
        ))}
      </div>
      {mode === "Radiation" && (
        <div className="mt-3">
          <Slider label="Source power" value={heat} min={10} max={100} step={5} hex={a} accent={at} unit="%" onChange={setHeat} />
        </div>
      )}
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Mode" value={mode} accent={at} />
        <Stat label="Medium needed" value={mode === "Radiation" ? "none" : mode === "Conduction" ? "solid" : "fluid"} accent={at} />
        <Stat label="Example" value={mode === "Conduction" ? "metal spoon" : mode === "Convection" ? "sea breeze" : "sunlight"} accent={at} />
      </div>
    </SimShell>
  );
}
