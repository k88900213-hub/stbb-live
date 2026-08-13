"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

export function CentreOfGravitySim({ topic }: { topic?: string }) {
  const a = "#f59e0b";
  const at = "text-amber-600 dark:text-amber-400";
  const [height, setHeight] = useState(80);
  const [tilt, setTilt] = useState(6);
  const [baseWidth, setBaseWidth] = useState(70);
  const [wobble, setWobble] = useState(true);
  const [showLine, setShowLine] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const wob = wobble ? Math.sin(sim.tick * 0.06) * 5 : 0;
  const effectiveTilt = Math.max(0, tilt + wob);
  const cogShift = (height / 2) * Math.sin((effectiveTilt * Math.PI) / 180);
  const topples = cogShift > baseWidth / 2;
  return (
    <SimShell
      icon="🏗️"
      title={simTitle(topic, "Centre of gravity & stability")}
      accent="amber"
      subtitle={`${topic ?? "Centre of gravity"} — an object is stable while its centre of gravity stays over the base of support.`}
      hint="A tall narrow object topples easily; a low wide one is stable. Lowering the centre of gravity and widening the base both improve stability."
      controls={<SimChip accent="amber"><span aria-hidden>🏗️</span>{topic ?? "centre of gravity"}</SimChip>}
    >
      <SimCanvas
        deps={[height, baseWidth, effectiveTilt, cogShift, topples, showLine, wobble, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const baseY = h - 46;
          const bx = w / 2;
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(0, baseY, w, 6);
          ctx.fillStyle = "#94a3b8";
          ctx.fillRect(bx - 120, baseY + 6, 240, 10);
          const bw = baseWidth * 1.6;
          const bh = height * 1.3;
          const angle = (effectiveTilt * Math.PI) / 180;
          const cx = bx;
          const cy = baseY - bh / 2;
          const cogX = Math.sin(angle) * (bh / 2);
          const cogY = Math.cos(angle) * (bh / 2);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.fillStyle = topples ? "#fca5a5" : "#fcd34d";
          ctx.strokeStyle = "#b45309";
          ctx.lineWidth = 2;
          ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
          ctx.stroke();
          ctx.restore();
          ctx.beginPath();
          ctx.arc(cx + cogX, cy - cogY, 6, 0, Math.PI * 2);
          ctx.fillStyle = "#dc2626";
          ctx.fill();
          if (showLine) {
            ctx.strokeStyle = "#dc2626";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(cx + cogX, cy - cogY);
            ctx.lineTo(cx + cogX, baseY + 6);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(cx + cogX, baseY + 6);
            ctx.lineTo(cx + cogX + (topples ? 16 : -16), baseY + 20);
            ctx.lineTo(cx + cogX - (topples ? 16 : -16), baseY + 20);
            ctx.closePath();
            ctx.fillStyle = topples ? "#ef4444" : "#16a34a";
            ctx.fill();
          }
          ctx.fillStyle = topples ? "#dc2626" : "#047857";
          ctx.font = "bold 14px system-ui";
          ctx.fillText(topples ? "TOPLES — weight line outside base" : "stable — weight line inside base", 30, 40);
          ctx.fillStyle = "#b45309";
          ctx.font = "12px system-ui";
          ctx.fillText(`tilt ${effectiveTilt.toFixed(0)}° · COG shift ${cogShift.toFixed(1)} cm`, 30, 60);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label="Block height" value={height} min={30} max={140} step={5} hex={a} accent={at} unit=" cm" onChange={setHeight} />
        <Slider label="Tilt angle" value={tilt} min={0} max={30} step={1} hex={a} accent={at} unit="°" onChange={setTilt} />
        <Slider label="Base width" value={baseWidth} min={30} max={120} step={5} hex={a} accent={at} unit=" cm" onChange={setBaseWidth} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Wobble" checked={wobble} onChange={setWobble} hex={a} hint="sways the block as it tilts" />
        <Toggle label="Weight line" checked={showLine} onChange={setShowLine} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="COG height" value={`${height / 2} cm`} accent={at} />
        <Stat label="Base width" value={`${baseWidth} cm`} accent={at} />
        <Stat label="State" value={topples ? "unstable" : "stable"} accent={at} />
      </div>
    </SimShell>
  );
}

export function PulleySim({ topic }: { topic?: string }) {
  const a = "#10b981";
  const at = "text-emerald-600 dark:text-emerald-400";
  const [segments, setSegments] = useState(3);
  const [load, setLoad] = useState(300);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const ma = segments;
  const effort = load / ma;
  const liftPhase = (sim.tick % 140) / 140;
  const lift = (1 - Math.cos(Math.min(1, liftPhase * 1.6) * Math.PI)) / 2;
  const workOut = load * 0.8;
  const workIn = effort * (ma * 0.8);
  const pulleysTop = Math.ceil(segments / 2);
  const pulleysBot = Math.max(1, Math.floor(segments / 2));
  return (
    <SimShell
      icon="⚙️"
      title={simTitle(topic, "Pulleys & mechanical advantage")}
      accent="emerald"
      subtitle={`${topic ?? "Pulleys"} — a pulley system multiplies force: MA = number of supporting ropes, effort = load / MA.`}
      hint="Each extra rope shares the load, so with 4 ropes you lift 400 N with only 100 N of effort — but you must pull the rope four times as far."
      controls={<SimChip accent="emerald"><span aria-hidden>⚙️</span>{topic ?? "simple machines"}</SimChip>}
    >
      <SimCanvas
        deps={[segments, load, sim.tick, lift]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#94a3b8";
          ctx.fillRect(0, 18, w, 12);
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(60, 30);
          ctx.lineTo(60, h - 40);
          ctx.stroke();
          const pulley = (x: number, y: number, r: number, dark: boolean) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = dark ? "#64748b" : "#94a3b8";
            ctx.fill();
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#1e293b";
            ctx.fill();
          };
          const topXs: number[] = [];
          for (let i = 0; i < pulleysTop; i++) {
            const x = 150 + i * 100;
            topXs.push(x);
            pulley(x, 66, 24, true);
          }
          const botXs: number[] = [];
          const rackY = h - 120 + (1 - lift) * 80;
          for (let i = 0; i < pulleysBot; i++) {
            const x = 150 + i * 100;
            botXs.push(x);
            pulley(x, rackY, 22, false);
          }
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(60, 30);
          ctx.lineTo(60, 120);
          ctx.lineTo(150, 120);
          ctx.lineTo(150, 44);
          if (pulleysTop > 1) {
            ctx.lineTo(250, 44);
            ctx.lineTo(250, 120);
            ctx.lineTo(250, 44);
          }
          ctx.moveTo(150, rackY - 22);
          ctx.lineTo(150, rackY + 40);
          ctx.moveTo(250, rackY - 22);
          ctx.lineTo(250, rackY + 40);
          ctx.stroke();
          const boxW = 90;
          const boxH = 28;
          ctx.fillStyle = "#10b981";
          ctx.fillRect(130, rackY + 40, boxW, boxH);
          ctx.strokeStyle = "#064e3b";
          ctx.lineWidth = 2;
          ctx.strokeRect(130, rackY + 40, boxW, boxH);
          ctx.fillStyle = "#064e3b";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${load} N`, 154, rackY + 59);
          const pullY = 130 + (1 - lift) * 40;
          ctx.strokeStyle = "#0d9488";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(w - 40, 66);
          ctx.lineTo(w - 40, pullY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(w - 40, pullY);
          ctx.lineTo(w - 55, pullY - 16);
          ctx.moveTo(w - 40, pullY);
          ctx.lineTo(w - 25, pullY - 16);
          ctx.stroke();
          ctx.fillStyle = "#0d9488";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`pull ${effort.toFixed(0)} N`, w - 90, pullY - 22);
          ctx.fillStyle = "#064e3b";
          ctx.font = "12px system-ui";
          ctx.fillText(`MA = ${ma}`, 30, 40);
          ctx.fillStyle = "#047857";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(lift > 0.05 ? "lifting…" : "lowered", 30, 60);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Supporting ropes" value={segments} min={1} max={5} step={1} hex={a} accent={at} onChange={setSegments} />
        <Slider label="Load" value={load} min={50} max={600} step={25} hex={a} accent={at} unit=" N" onChange={setLoad} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Mechanical advantage" value={`${ma}×`} accent={at} />
        <Stat label="Effort needed" value={`${effort.toFixed(0)} N`} accent={at} />
        <Stat label="Distance trade-off" value="rope pulled MA× further" accent={at} />
        <Stat label="Work in = F·d" value={`${workIn.toFixed(0)} J`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Work out = W·h" value={`${workOut.toFixed(0)} J`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Energy conserved" value="✓ (ideal, 100%)" accent="text-emerald-600 dark:text-emerald-400" />
      </div>
    </SimShell>
  );
}

export function ViscositySim({ topic }: { topic?: string }) {
  const a = "#06b6d4";
  const at = "text-cyan-600 dark:text-cyan-400";
  const [viscosity, setViscosity] = useState(2);
  const [radius, setRadius] = useState(10);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const rhoS = 7.9;
  const rhoL = 1;
  const g = 9.8;
  const vt = ((2 * Math.pow(radius / 10, 2) * g * (rhoS - rhoL)) / (9 * viscosity)) * 100;
  const pos = (sim.tick * Math.min(2.4, vt * 0.06)) % 160;
  const rM = radius / 1000;
  const ballMass = (4 / 3) * Math.PI * Math.pow(rM, 3) * rhoS * 1000;
  const ballWeight = ballMass * g;
  const dragT = 6 * Math.PI * viscosity * rM * (vt / 100);
  return (
    <SimShell
      icon="🍯"
      title={simTitle(topic, "Viscosity & terminal velocity")}
      accent="cyan"
      subtitle={`${topic ?? "Viscosity"} — thick liquids slow falling objects; the terminal velocity is v = 2r²g(ρₛ−ρₗ)/(9η).`}
      hint="Oil is more viscous than water, so a ball bearing falls slowly through oil. Terminal velocity is reached when drag equals weight."
      controls={<SimChip accent="cyan"><span aria-hidden>🍯</span>{topic ?? "viscosity"}</SimChip>}
    >
      <SimCanvas
        deps={[viscosity, radius, sim.tick, vt, pos]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const alpha = Math.min(1, viscosity / 5);
          ctx.fillStyle = `rgba(96,165,250,${0.3 - alpha * 0.15})`;
          ctx.fillRect(90, 20, w - 180, h - 40);
          ctx.strokeStyle = "#0369a1";
          ctx.lineWidth = 2;
          ctx.strokeRect(90, 20, w - 180, h - 40);
          ctx.fillStyle = "rgba(2,132,199,0.5)";
          ctx.font = "12px system-ui";
          ctx.fillText(`liquid · η = ${viscosity.toFixed(1)} Pa·s`, w / 2 - 90, h - 12);
          const terminalY = h - 40 - Math.min(130, (vt / 30) * 130);
          if (vt > 0.3) {
            ctx.strokeStyle = "rgba(250,204,21,0.8)";
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(90, terminalY);
            ctx.lineTo(w - 90, terminalY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#a16207";
            ctx.font = "10px system-ui";
            ctx.fillText(`v_term ${vt.toFixed(1)} cm/s`, w - 200, terminalY - 6);
          }
          const ballR = 8 + radius * 0.8;
          const by = 30 + pos;
          ctx.beginPath();
          ctx.arc(w / 2, by, ballR, 0, Math.PI * 2);
          const bg = ctx.createRadialGradient(w / 2 - 3, by - 3, 1, w / 2, by, ballR);
          bg.addColorStop(0, "#cbd5e1");
          bg.addColorStop(1, "#475569");
          ctx.fillStyle = bg;
          ctx.fill();
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "#164e63";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`v = ${vt.toFixed(1)} cm/s`, 30, 40);
          ctx.fillStyle = "#0e7490";
          ctx.font = "12px system-ui";
          ctx.fillText(vt > 0.3 ? "speed reaches terminal value" : "thick liquid — barely falls", 30, 60);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Viscosity" value={viscosity} min={0.3} max={10} step={0.1} hex={a} accent={at} unit=" Pa·s" onChange={setViscosity} />
        <Slider label="Ball radius" value={radius} min={2} max={20} step={1} hex={a} accent={at} unit=" mm" onChange={setRadius} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Terminal velocity" value={`${vt.toFixed(1)} cm/s`} accent={at} />
        <Stat label="Density of ball" value={`${rhoS} g/cm³`} accent={at} />
        <Stat label="Falls faster with" value="bigger radius, lower η" accent={at} />
        <Stat label="Ball weight W = mg" value={`${(ballWeight * 1000).toFixed(1)} mN`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Stokes drag 6πηrv" value={`${(dragT * 1000).toFixed(1)} mN`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="At terminal" value="drag = weight (a = 0)" accent="text-amber-600 dark:text-amber-400" />
      </div>
    </SimShell>
  );
}

export function SurfaceTensionSim({ topic }: { topic?: string }) {
  const a = "#14b8a6";
  const at = "text-teal-600 dark:text-teal-400";
  const [gamma, setGamma] = useState(0.072);
  const [length, setLength] = useState(20);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const force = gamma * length;
  const dimple = Math.sin(sim.tick * 0.12) * 2;
  const sinks = gamma < 0.04;
  return (
    <SimShell
      icon="🪱"
      title={simTitle(topic, "Surface tension")}
      accent="teal"
      subtitle={`${topic ?? "Surface tension"} — the surface of a liquid acts like a stretched elastic film: force F = γ × L.`}
      hint="Water striders and tiny insects stand on water because surface tension supports them — detergent reduces γ so it washes away grease and dirt."
      controls={<SimChip accent="teal"><span aria-hidden>🪱</span>{topic ?? "surface tension"}</SimChip>}
    >
      <SimCanvas
        deps={[gamma, length, sim.tick, sinks]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#a5f3fc";
          ctx.fillRect(60, 138, w - 120, h - 150);
          ctx.strokeStyle = "#0e7490";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(60, 128 + dimple);
          ctx.quadraticCurveTo(w / 2, 118 + dimple, w - 60, 128 + dimple);
          ctx.stroke();
          const tension = (x: number, side: number) => {
            ctx.strokeStyle = "#0e7490";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, 124 + dimple);
            ctx.lineTo(x + side * (14 + length * 0.4), 124 + dimple - 18);
            ctx.stroke();
            ctx.fillStyle = "#0e7490";
            ctx.font = "10px system-ui";
            ctx.fillText("γ", x + side * (14 + length * 0.4) - 5, 124 + dimple - 22);
          };
          if (sinks) {
            ctx.fillStyle = "#475569";
            ctx.font = "bold 14px system-ui";
            ctx.fillText("needle sinks — film can't hold it!", 30, 46);
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(w / 2 - 34, 156);
            ctx.lineTo(w / 2 + 34, 170);
            ctx.stroke();
          } else {
            tension(w / 2 - 40, -1);
            tension(w / 2 + 40, 1);
            const needleY = 128 + dimple - 4;
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(w / 2 - 34, needleY);
            ctx.lineTo(w / 2 + 34, needleY);
            ctx.stroke();
            ctx.fillStyle = "#0f766e";
            ctx.font = "11px system-ui";
            ctx.fillText("steel needle floats", w / 2 - 60, needleY - 10);
          }
          ctx.fillStyle = "#155e75";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`γ = ${gamma.toFixed(3)} N/m · F = ${(force * 1000).toFixed(1)} mN`, 30, h - 8);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Surface tension" value={gamma} min={0.01} max={0.09} step={0.001} hex={a} accent={at} unit=" N/m" onChange={setGamma} />
        <Slider label="Contact length" value={length} min={5} max={60} step={1} hex={a} accent={at} unit=" mm" onChange={setLength} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <ActionButton label="Pure water" hex={a} onClick={() => setGamma(0.072)} />
        <ActionButton label="Add detergent" icon="🧼" hex="#dc2626" onClick={() => setGamma(0.03)} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Water γ" value="0.072 N/m" accent={at} />
        <Stat label="With detergent" value="≈ 0.03 N/m" accent={at} />
        <Stat label="State" value={sinks ? "needle sinks" : "needle floats"} accent={at} />
      </div>
    </SimShell>
  );
}

export function CalorimetrySim({ topic }: { topic?: string }) {
  const a = "#ef4444";
  const at = "text-rose-600 dark:text-rose-400";
  const [m1, setM1] = useState(200);
  const [t1, setT1] = useState(80);
  const [m2, setM2] = useState(300);
  const [t2, setT2] = useState(20);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const tf = (m1 * t1 + m2 * t2) / (m1 + m2);
  const prog = (sim.tick % 160) / 160;
  const tempA = t1 - (t1 - tf) * prog;
  const tempB = t2 + (tf - t2) * prog;
  const c = 4.18;
  const q1 = m1 * c * (t1 - tf);
  const q2 = m2 * c * (tf - t2);
  return (
    <SimShell
      icon="🌡️"
      title={simTitle(topic, "Calorimetry")}
      accent="rose"
      subtitle={`${topic ?? "Calorimetry"} — mixing hot and cold water: heat lost = heat gained, final T = (m₁T₁ + m₂T₂)/(m₁ + m₂).`}
      hint="A calorimeter measures heat by the temperature change of water: Q = mcΔT. More water or a bigger temperature gap stores more energy."
      controls={<SimChip accent="rose"><span aria-hidden>🌡️</span>{topic ?? "calorimetry"}</SimChip>}
    >
      <SimCanvas
        deps={[m1, t1, m2, t2, tf, prog, tempA, tempB]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cy = 150;
          const cw = 70;
          const chh = 90;
          const beaker = (x: number, fillH: number, t: number, hot: boolean) => {
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(x - 2, cy - chh - 2, cw + 4, chh + 20);
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.fillRect(x, cy - chh, cw, chh);
            const water = ctx.createLinearGradient(x, cy, x, cy - chh);
            if (hot) {
              water.addColorStop(0, "#ef4444");
              water.addColorStop(1, "#fb7185");
            } else {
              water.addColorStop(0, "#0ea5e9");
              water.addColorStop(1, "#38bdf8");
            }
            ctx.fillStyle = water;
            ctx.fillRect(x, cy - fillH, cw, fillH);
            ctx.fillStyle = "#0f172a";
            ctx.font = "12px system-ui";
            ctx.fillText(`${Math.round(t)}°C`, x + cw / 2 - 18, cy - fillH - 8);
          };
          const fillA = Math.min(chh, (m1 / 5) * 0.9 + 20);
          const fillB = Math.min(chh, (m2 / 5) * 0.9 + 20);
          beaker(80, fillA, tempA, true);
          beaker(w - 150, fillB, tempB, false);
          ctx.strokeStyle = "#f43f5e";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(160, 60);
          ctx.lineTo(w - 160, 60);
          ctx.stroke();
          for (let i = 0; i < 6; i++) {
            const x = 160 + i * ((w - 320) / 5);
            ctx.strokeStyle = "#f43f5e";
            ctx.beginPath();
            ctx.moveTo(x, 60 - Math.abs(Math.sin(prog * Math.PI * 2 + i)) * 10);
            ctx.lineTo(x, 60 + Math.abs(Math.sin(prog * Math.PI * 2 + i)) * 10);
            ctx.stroke();
          }
          ctx.fillStyle = "#be123c";
          ctx.font = "bold 12px system-ui";
          ctx.fillText("heat flows hot → cold", w / 2 - 70, 32);
          ctx.fillStyle = "#b91c1c";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`final = ${tf.toFixed(1)} °C`, w / 2 - 70, 94);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Hot water mass" value={m1} min={50} max={400} step={10} hex={a} accent={at} unit=" g" onChange={setM1} />
        <Slider label="Hot temperature" value={t1} min={40} max={100} step={1} hex={a} accent={at} unit=" °C" onChange={setT1} />
        <Slider label="Cold water mass" value={m2} min={50} max={400} step={10} hex={a} accent={at} unit=" g" onChange={setM2} />
        <Slider label="Cold temperature" value={t2} min={0} max={30} step={1} hex={a} accent={at} unit=" °C" onChange={setT2} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Final temperature" value={`${tf.toFixed(1)} °C`} accent={at} />
        <Stat label="Heat lost (Q₁)" value={`${(q1 / 1000).toFixed(1)} kJ`} accent={at} />
        <Stat label="Heat gained (Q₂)" value={`${(q2 / 1000).toFixed(1)} kJ`} accent={at} />
      </div>
    </SimShell>
  );
}

export function ThermalEquilibriumSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const [hotM, setHotM] = useState(100);
  const [hotT, setHotT] = useState(90);
  const [coldM, setColdM] = useState(100);
  const [coldT, setColdT] = useState(10);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const tf = (hotM * hotT + coldM * coldT) / (hotM + coldM);
  const prog = (sim.tick % 200) / 200;
  const tempA = hotT - (hotT - tf) * prog;
  const tempB = coldT + (tf - coldT) * prog;
  const cWater = 4.18;
  const qTransfer = (hotM / 1000) * cWater * Math.abs(hotT - tf);
  return (
    <SimShell
      icon="🔥"
      title={simTitle(topic, "Thermal equilibrium")}
      accent="orange"
      subtitle={`${topic ?? "Thermal equilibrium"} — heat flows from the hotter body to the colder one until both reach the same temperature.`}
      hint="Heat always moves from hot to cold, never the other way. A hot drink in a cold room cools until it matches the room temperature."
      controls={<SimChip accent="orange"><span aria-hidden>🔥</span>{topic ?? "thermal equilibrium"}</SimChip>}
    >
      <SimCanvas
        deps={[hotT, coldT, tf, prog, tempA, tempB]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const base = h - 40;
          const bar = (x: number, t: number, color: string) => {
            const hh = (t / 100) * 130;
            const grad = ctx.createLinearGradient(x, base, x, base - hh);
            grad.addColorStop(0, color);
            grad.addColorStop(1, "#fef3c7");
            ctx.fillStyle = grad;
            ctx.fillRect(x, base - hh, 60, hh);
            ctx.strokeStyle = "rgba(100,116,139,0.3)";
            ctx.strokeRect(x, base - 130, 60, 130);
            ctx.fillStyle = "#334155";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(`${t.toFixed(0)}°C`, x + 8, base - hh - 6);
          };
          bar(110, tempA, "#fb923c");
          bar(320, tempB, "#38bdf8");
          const mid = base - (tf / 100) * 130;
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(80, mid);
          ctx.lineTo(w - 30, mid);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#dc2626";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`equilibrium ${tf.toFixed(1)} °C`, w / 2 - 72, mid - 8);
          const heatPulse = Math.abs(Math.sin(prog * Math.PI * 2));
          ctx.fillStyle = `rgba(249,115,22,${0.3 + heatPulse * 0.7})`;
          for (let i = 0; i < 6; i++) {
            const x = 205 + i * 18;
            ctx.beginPath();
            ctx.arc(x, 52, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = "#475569";
          ctx.font = "11px system-ui";
          ctx.fillText("heat →", 210, 30);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Hot body mass" value={hotM} min={20} max={300} step={10} hex={a} accent={at} unit=" g" onChange={setHotM} />
        <Slider label="Hot temperature" value={hotT} min={30} max={100} step={1} hex={a} accent={at} unit=" °C" onChange={setHotT} />
        <Slider label="Cold body mass" value={coldM} min={20} max={300} step={10} hex={a} accent={at} unit=" g" onChange={setColdM} />
        <Slider label="Cold temperature" value={coldT} min={0} max={30} step={1} hex={a} accent={at} unit=" °C" onChange={setColdT} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Final equilibrium" value={`${tf.toFixed(1)} °C`} accent={at} />
        <Stat label="Hot now" value={`${tempA.toFixed(0)} °C`} accent={at} />
        <Stat label="Cold now" value={`${tempB.toFixed(0)} °C`} accent={at} />
        <Stat label="Heat transferred" value={`${qTransfer.toFixed(1)} kJ`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Formula" value="ΣQ = 0 (m₁cΔT₁ = m₂cΔT₂)" accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Direction" value="hot → cold (2nd law)" accent="text-amber-600 dark:text-amber-400" />
      </div>
    </SimShell>
  );
}

export function EarthMagnetSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [compassAngle, setCompassAngle] = useState(0);
  const [rotate, setRotate] = useState(true);
  const [showField, setShowField] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const rot = rotate ? (sim.tick * 0.2 * speedMul) % 360 : 0;
  const angle = ((compassAngle + rot) * Math.PI) / 180;
  const fieldX = Math.cos(angle);
  const fieldY = -Math.sin(angle);
  return (
    <SimShell
      icon="🧭"
      title={simTitle(topic, "Earth's magnetic field")}
      accent="violet"
      subtitle={`${topic ?? "Earth's magnetism"} — the Earth behaves like a giant bar magnet; field lines run from the magnetic south (near the north pole) to magnetic north.`}
      hint="A compass needle aligns with the field lines and always points roughly north — the Earth's magnetic south pole is actually near the geographic North Pole."
      controls={<SimChip accent="violet"><span aria-hidden>🧭</span>{topic ?? "magnetic field"}</SimChip>}
    >
      <SimCanvas
        deps={[compassAngle, angle, rot, showField, rotate, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = w / 2;
          const cy = h / 2;
          const earth = ctx.createRadialGradient(cx - 20, cy - 25, 10, cx, cy, 70);
          earth.addColorStop(0, "#ddd6fe");
          earth.addColorStop(1, "#a78bfa");
          ctx.beginPath();
          ctx.arc(cx, cy, 70, 0, Math.PI * 2);
          ctx.fillStyle = earth;
          ctx.fill();
          ctx.strokeStyle = "#6d28d9";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.strokeStyle = "rgba(76,29,149,0.6)";
          ctx.beginPath();
          ctx.moveTo(cx - 40, cy);
          ctx.quadraticCurveTo(cx, cy - 8, cx + 40, cy);
          ctx.stroke();
          ctx.fillStyle = "#4c1d95";
          ctx.font = "bold 14px system-ui";
          ctx.fillText("N", cx + 4, cy - 52);
          ctx.fillText("S", cx - 62, cy + 60);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("magnetic south", cx - 66, cy + 74);
          ctx.fillText("magnetic north", cx - 62, cy - 62);
          if (showField) {
            for (let i = 0; i < 8; i++) {
              const a = (i / 8) * Math.PI * 2 + rot * 0.02;
              const bulge = Math.abs(Math.sin(a)) * 24;
              ctx.beginPath();
              ctx.arc(cx, cy, 92 + bulge, a, a + 1.15);
              ctx.strokeStyle = "rgba(109,40,217,0.5)";
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }
          const px = cx + Math.cos(angle) * 128;
          const py = cy + Math.sin(angle) * 128;
          const needleA = Math.atan2(fieldY, fieldX);
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(needleA);
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(-16, -3.5, 32, 7);
          ctx.fillStyle = "#334155";
          ctx.fillRect(-16, 3.5, 32, 7);
          ctx.restore();
          ctx.beginPath();
          ctx.arc(px, py, 12, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fill();
          ctx.strokeStyle = "#6d28d9";
          ctx.stroke();
          ctx.fillStyle = "#4c1d95";
          ctx.font = "11px system-ui";
          ctx.fillText("compass", px - 26, py + 24);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Compass position" value={compassAngle} min={0} max={360} step={10} hex={a} accent={at} unit="°" onChange={setCompassAngle} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Rotate needle" checked={rotate} onChange={setRotate} hex={a} hint="spins the compass around the Earth" />
        <Toggle label="Field lines" checked={showField} onChange={setShowField} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Magnetic pole" value="near geographic N" accent={at} />
        <Stat label="Field lines" value="emerge at S, enter N" accent={at} />
        <Stat label="Compass needle" value="points along field" accent={at} />
      </div>
    </SimShell>
  );
}

export function InductionSim({ topic }: { topic?: string }) {
  const a = "#0ea5e9";
  const at = "text-sky-600 dark:text-sky-400";
  const [position, setPosition] = useState(50);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const osc = Math.sin(sim.tick * 0.05 * speedMul) * 60;
  const magnetX = 100 + (position / 100) * 360 + osc;
  const approaching = osc > 0;
  const inside = magnetX > 290 && magnetX < 430;
  const needle = approaching ? 1 : -1;
  const speed = Math.abs(osc * 0.05);
  return (
    <SimShell
      icon="🧲"
      title={simTitle(topic, "Electromagnetic induction")}
      accent="sky"
      subtitle={`${topic ?? "Induction"} — moving a magnet near a coil induces a current; its direction (Lenz's law) opposes the change.`}
      hint="The induced current flows one way as the magnet enters and the opposite way as it leaves. A steady magnet inside the coil induces nothing."
      controls={<SimChip accent="sky"><span aria-hidden>🧲</span>{topic ?? "induction"}</SimChip>}
    >
      <SimCanvas
        deps={[position, osc, magnetX, approaching, inside, needle, speed, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cy = h / 2;
          for (let i = 0; i < 8; i++) {
            const x = 290 + i * 14;
            ctx.strokeStyle = "#0369a1";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, cy, 30, Math.PI, 0);
            ctx.stroke();
          }
          const bw = 56;
          const bx = magnetX;
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(bx, cy - 22, bw / 2, 44);
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(bx + bw / 2, cy - 22, bw / 2, 44);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 12px system-ui";
          ctx.fillText("N", bx + 12, cy + 5);
          ctx.fillText("S", bx + bw - 26, cy + 5);
          ctx.fillStyle = "rgba(239,68,68,0.15)";
          ctx.fillRect(bx - 8, cy - 26, bw + 16, 52);
          const gx = 500;
          const gy = cy - 40;
          ctx.beginPath();
          ctx.arc(gx, gy, 16, 0, Math.PI * 2);
          ctx.fillStyle = "#f8fafc";
          ctx.fill();
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(gx - 12, gy);
          ctx.lineTo(gx + 12, gy + needle * 12 * Math.min(1, speed + 0.2));
          ctx.stroke();
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "11px system-ui";
          ctx.fillText("galvanometer", gx - 42, gy + 28);
          ctx.fillStyle = inside ? "#0c4a6e" : approaching ? "#0369a1" : "#0e7490";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(inside ? "magnet steady inside — NO current" : approaching ? "magnet entering — current induced one way" : "magnet leaving — current reverses!", 30, 40);
          ctx.fillStyle = "#475569";
          ctx.font = "12px system-ui";
          ctx.fillText(`relative speed ${speed.toFixed(1)} · induced current ${(speed * 1.4).toFixed(1)} mA`, 30, 60);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Magnet position" value={position} min={0} max={100} step={1} hex={a} accent={at} onChange={setPosition} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Entering coil" value="current one way" accent={at} />
        <Stat label="Leaving coil" value="current reverses" accent={at} />
        <Stat label="Law" value="Lenz's law opposes change" accent={at} />
        <Stat label="Induced EMF" value={`${(speed * 1.4).toFixed(2)} mV`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Faraday" value="E = −N·dΦ/dt" accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Steady inside" value="no EMF (dΦ/dt = 0)" accent="text-amber-600 dark:text-amber-400" />
      </div>
    </SimShell>
  );
}

export function AcDcSim({ topic }: { topic?: string }) {
  const a = "#14b8a6";
  const at = "text-teal-600 dark:text-teal-400";
  const [freq, setFreq] = useState(50);
  const [vPeak, setVPeak] = useState(325);
  const [mode, setMode] = useState<"ac" | "dc">("ac");
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const t = (sim.tick % 60) / 60;
  const vRms = vPeak / Math.SQRT2;
  const period = 1 / freq;
  const vAc = vPeak * Math.sin(t * Math.PI * 2 * freq);
  const vDc = 12;
  const v = mode === "ac" ? vAc : vDc;
  return (
    <SimShell
      icon="〰️"
      title={simTitle(topic, "AC vs DC current")}
      accent="teal"
      subtitle={`${topic ?? "AC & DC"} — mains voltage oscillates at 50 Hz with a peak of 325 V but an RMS of 230 V: V_rms = V_peak/√2.`}
      hint="Batteries supply DC; mains power is AC at 50 Hz in Pakistan. V_rms = V_peak/√2 gives the DC-equivalent voltage, so a 325 V sine still runs 230 V devices."
      controls={<SimChip accent="teal"><span aria-hidden>〰️</span>{mode.toUpperCase()}</SimChip>}
    >
      <SimCanvas
        deps={[mode, freq, vPeak, vRms, t, v, period, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const base = h / 2;
          ctx.strokeStyle = "rgba(100,116,139,0.3)";
          ctx.beginPath();
          ctx.moveTo(40, base);
          ctx.lineTo(w - 20, base);
          ctx.moveTo(50, 25);
          ctx.lineTo(50, h - 25);
          ctx.stroke();
          ctx.fillStyle = "#134e4a";
          ctx.font = "11px system-ui";
          ctx.fillText("time", w - 34, h - 10);
          ctx.fillText("V", 28, 26);
          ctx.fillText("+", 36, base - 6);
          ctx.fillText("−", 36, base + 14);
          const steps = 80;
          ctx.strokeStyle = "#0d9488";
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let i = 0; i <= steps; i++) {
            const x = 50 + (i / steps) * (w - 90);
            const vv = mode === "ac" ? vPeak * Math.sin((i / steps) * Math.PI * 2 * freq) : vDc;
            const y = base - (vv / Math.max(vPeak, vDc)) * 80;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          if (mode === "ac") {
            ctx.strokeStyle = "rgba(20,184,166,0.45)";
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, base - (vRms / vPeak) * 80);
            ctx.lineTo(w - 40, base - (vRms / vPeak) * 80);
            ctx.moveTo(50, base + (vRms / vPeak) * 80);
            ctx.lineTo(w - 40, base + (vRms / vPeak) * 80);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#0d9488";
            ctx.font = "10px system-ui";
            ctx.fillText("±RMS", 52, base - (vRms / vPeak) * 80 - 4);
          }
          const px = 50 + t * (w - 90);
          const dotY = base - (v / Math.max(vPeak, vDc)) * 80;
          ctx.beginPath();
          ctx.arc(px, dotY, 7, 0, Math.PI * 2);
          ctx.fillStyle = "#0d9488";
          ctx.fill();
          ctx.strokeStyle = "#134e4a";
          ctx.stroke();
          ctx.fillStyle = "#134e4a";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(mode === "ac" ? `V = ${v.toFixed(0)} V · ${freq} Hz` : `V = ${vDc.toFixed(0)} V (constant)`, 30, 40);
          ctx.fillStyle = "#475569";
          ctx.font = "11px system-ui";
          ctx.fillText(mode === "ac" ? "current changes direction every half cycle" : "electrons drift steadily one way", 30, 58);
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ActionButton
          label={mode === "ac" ? "Switch to DC" : "Switch to AC"}
          icon={mode === "ac" ? "🔋" : "〰️"}
          hex={a}
          onClick={() => setMode((m) => (m === "ac" ? "dc" : "ac"))}
        />
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="AC frequency" value={freq} min={10} max={200} step={5} hex={a} accent={at} unit=" Hz" onChange={setFreq} />
        <Slider label="Peak voltage" value={vPeak} min={100} max={600} step={5} hex={a} accent={at} unit=" V" onChange={setVPeak} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Peak voltage" value={`${vPeak} V`} accent={at} />
        <Stat label="V_rms = V_p/√2" value={`${vRms.toFixed(0)} V`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Frequency" value={`${freq} Hz`} accent={at} />
        <Stat label="Period T" value={`${(period * 1000).toFixed(1)} ms`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Mains (PK)" value="325 V" accent={at} />
        <Stat label="Mains (RMS)" value="230 V" accent="text-emerald-600 dark:text-emerald-400" />
      </div>
    </SimShell>
  );
}

export function TelescopeSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [fo, setFo] = useState(80);
  const [fe, setFe] = useState(12);
  const [diameter, setDiameter] = useState(10);
  const [showRays, setShowRays] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const magnification = fo / fe;
  const lightGain = Math.pow(diameter / 0.5, 2);
  const star = Math.sin(sim.tick * 0.05 * speedMul) * 5;
  return (
    <SimShell
      icon="🔭"
      title={simTitle(topic, "The refracting telescope")}
      accent="violet"
      subtitle={`${topic ?? "Telescope"} — a long-focal-length objective lens gathers light; a short-focal-length eyepiece magnifies: M = f₀/fₑ.`}
      hint="Astronomers want a big objective to collect lots of light and a small eyepiece focal length for high magnification — but too much power blurs stars."
      controls={<SimChip accent="violet"><span aria-hidden>🔭</span>{topic ?? "telescope"}</SimChip>}
    >
      <SimCanvas
        deps={[fo, fe, magnification, showRays, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cy = h / 2;
          const sy = 70 + star;
          ctx.beginPath();
          ctx.arc(44, sy, 5, 0, Math.PI * 2);
          ctx.fillStyle = "#fbbf24";
          ctx.fill();
          ctx.fillStyle = "#4c1d95";
          ctx.font = "11px system-ui";
          ctx.fillText("distant star", 16, sy - 12);
          const l1 = 170;
          const l2 = Math.min(w - 90, 170 + fo * 1.4 + fe * 1.4);
          const lens = (x: number, label: string) => {
            ctx.strokeStyle = "#6d28d9";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x, cy - 34);
            ctx.lineTo(x, cy + 34);
            ctx.stroke();
            ctx.fillStyle = "#4c1d95";
            ctx.font = "11px system-ui";
            ctx.fillText(label, x - 30, cy - 42);
          };
          lens(l1, "objective");
          lens(l2, "eyepiece");
          if (showRays) {
            ctx.strokeStyle = "rgba(139,92,246,0.75)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(60, sy);
            ctx.lineTo(l1, cy - 24);
            ctx.moveTo(60, sy);
            ctx.lineTo(l1, cy + 24);
            ctx.moveTo(l1, cy - 24);
            ctx.lineTo(l2 + 40, cy - 6);
            ctx.moveTo(l1, cy + 24);
            ctx.lineTo(l2 + 40, cy + 6);
            ctx.stroke();
          }
          const eyeX = Math.min(w - 30, l2 + 60);
          ctx.beginPath();
          ctx.arc(eyeX, cy, 18, 0, Math.PI * 2);
          ctx.fillStyle = "#e2e8f0";
          ctx.fill();
          ctx.strokeStyle = "#334155";
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(eyeX, cy, 7, 0, Math.PI * 2);
          ctx.fillStyle = "#0f172a";
          ctx.fill();
          ctx.fillStyle = "#4c1d95";
          ctx.font = "bold 14px system-ui";
          ctx.fillText(`M = ${magnification.toFixed(1)}×`, 30, 40);
          ctx.fillStyle = "#475569";
          ctx.font = "12px system-ui";
          ctx.fillText(`tube ≈ ${(fo + fe).toFixed(0)} cm · image is inverted`, 30, 60);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label="Objective focal length" value={fo} min={40} max={200} step={5} hex={a} accent={at} unit=" cm" onChange={setFo} />
        <Slider label="Eyepiece focal length" value={fe} min={5} max={50} step={1} hex={a} accent={at} unit=" cm" onChange={setFe} />
        <Slider label="Objective diameter" value={diameter} min={2} max={60} step={1} hex={a} accent={at} unit=" cm" onChange={setDiameter} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show light rays" checked={showRays} onChange={setShowRays} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Magnification" value={`${magnification.toFixed(1)}×`} accent={at} />
        <Stat label="Tube length" value={`${(fo + fe).toFixed(0)} cm`} accent={at} />
        <Stat label="Image" value="inverted" accent={at} />
        <Stat label="Light gathering" value={`(D/d)² = ${lightGain.toExponential(1)}×`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Objective power" value="P = 1/f (big f = faint)" accent="text-amber-600 dark:text-amber-400" />
        <Stat label="Angular mag M" value="M = f₀/fₑ" accent="text-emerald-600 dark:text-emerald-400" />
      </div>
    </SimShell>
  );
}

export function FissionSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const [neutrons, setNeutrons] = useState(2);
  const [energy, setEnergy] = useState(200);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const p = (sim.tick % 160) / 160;
  const split = p > 0.35;
  const burst = p > 0.6;
  const nX = wApproach(p);
  const energyJ = energy * 1.602e-13;
  const perKg = (6.022e23 / 235.04) * energyJ;
  return (
    <SimShell
      icon="☢️"
      title={simTitle(topic, "Nuclear fission")}
      accent="orange"
      subtitle={`${topic ?? "Fission"} — a neutron splits a U-235 nucleus into smaller nuclei, releasing ~200 MeV and 2–3 more neutrons — a chain reaction.`}
      hint="In a reactor the chain reaction is controlled with absorbing rods; in an atom bomb it runs away. Splitting 1 g of uranium releases as much as 3000 tonnes of coal."
      controls={<SimChip accent="orange"><span aria-hidden>☢️</span>{topic ?? "fission"}</SimChip>}
    >
      <SimCanvas
        deps={[neutrons, energy, p, split, burst, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cy = h / 2;
          const cx = w / 2 - 40;
          if (!split) {
            ctx.beginPath();
            ctx.arc(cx, cy, 40, 0, Math.PI * 2);
            const nuc = ctx.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, 40);
            nuc.addColorStop(0, "#fcd34d");
            nuc.addColorStop(1, "#b45309");
            ctx.fillStyle = nuc;
            ctx.fill();
            ctx.strokeStyle = "#92400e";
            ctx.stroke();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 14px system-ui";
            ctx.fillText("U-235", cx - 26, cy + 5);
            ctx.beginPath();
            ctx.arc(nX, cy - 20, 12, 0, Math.PI * 2);
            ctx.fillStyle = "#475569";
            ctx.fill();
            ctx.strokeStyle = "#475569";
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(nX, cy - 20);
            ctx.lineTo(cx + 10, cy - 6);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#334155";
            ctx.font = "11px system-ui";
            ctx.fillText("neutron", nX - 20, cy - 34);
          } else {
            const fragL = cx - 34 - (burst ? 34 : 0);
            const fragR = cx + 34 + (burst ? 40 : 0);
            ctx.beginPath();
            ctx.arc(fragL, cy - 16, 26, 0, Math.PI * 2);
            ctx.fillStyle = "#fbbf24";
            ctx.fill();
            ctx.strokeStyle = "#92400e";
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(fragR, cy + 22, 22, 0, Math.PI * 2);
            ctx.fillStyle = "#fbbf24";
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#92400e";
            ctx.font = "bold 11px system-ui";
            ctx.fillText("Ba-141", fragL - 22, cy - 44);
            ctx.fillText("Kr-92", fragR - 20, cy + 50);
            for (let i = 0; i < neutrons; i++) {
              const a = (i / Math.max(1, neutrons)) * Math.PI * 2;
              const rr = 60 + (burst ? 60 + (sim.tick % 30) : 20);
              const x = cx + Math.cos(a) * rr;
              const y = cy + Math.sin(a) * rr * 0.7;
              ctx.beginPath();
              ctx.arc(x, y, 10, 0, Math.PI * 2);
              ctx.fillStyle = "#475569";
              ctx.fill();
            }
            if (burst) {
              const g = ctx.createRadialGradient(cx, cy, 5, cx, cy, 90);
              g.addColorStop(0, "rgba(253,186,116,0.8)");
              g.addColorStop(1, "rgba(253,186,116,0)");
              ctx.fillStyle = g;
              ctx.beginPath();
              ctx.arc(cx, cy, 90, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#c2410c";
              ctx.font = "bold 16px system-ui";
              ctx.fillText(`+ ${energy} MeV energy`, cx - 30, cy - 60);
            }
          }
          ctx.fillStyle = "#7c2d12";
          ctx.font = "12px system-ui";
          ctx.fillText(split ? "Ba-141 + Kr-92 + 2–3 neutrons + energy" : "neutron strikes the uranium nucleus", 30, 30);
          ctx.fillStyle = "#b45309";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(split ? "FISSION!" : "awaiting neutron", 30, 52);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Neutrons released" value={neutrons} min={1} max={3} step={1} hex={a} accent={at} onChange={setNeutrons} />
        <Slider label="Energy per split" value={energy} min={150} max={250} step={5} hex={a} accent={at} unit=" MeV" onChange={setEnergy} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Reaction" value="chain reaction" accent={at} />
        <Stat label="Typical split" value="Ba-141 + Kr-92" accent={at} />
        <Stat label="Control" value="absorbing rods" accent={at} />
        <Stat label="E per fission" value={`${energyJ.toExponential(1)} J`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="E per kg U-235" value={`${(perKg / 1e9).toFixed(1)} GJ`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="1 kg ≈ 1.5 M t oil" value="E = Δmc²" accent="text-amber-600 dark:text-amber-400" />
      </div>
    </SimShell>
  );
}

function wApproach(p: number) {
  const ux = 280;
  const tx = 200;
  const spread = Math.max(0, p - 0.8) * 600;
  return tx + (ux - tx) * Math.min(1, p * 2.8) + spread;
}

export function FusionSim({ topic }: { topic?: string }) {
  const a = "#f43f5e";
  const at = "text-rose-600 dark:text-rose-400";
  const [temp, setTemp] = useState(100);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const p = (sim.tick % 140) / 140;
  const hotEnough = temp >= 70;
  const fused = hotEnough && p > 0.55;
  const energy = temp * 0.14;
  const massDefect = (energy * 1.602e-13) / 9e16;
  return (
    <SimShell
      icon="☀️"
      title={simTitle(topic, "Nuclear fusion")}
      accent="rose"
      subtitle={`${topic ?? "Fusion"} — light nuclei (H) join to form helium, releasing vast energy — the same process that powers the Sun.`}
      hint="Fusion needs ~10⁷ °C to overcome the electric repulsion between protons. 1 g of fusion fuel releases energy comparable to 8 tonnes of oil."
      controls={<SimChip accent="rose"><span aria-hidden>☀️</span>{topic ?? "fusion"}</SimChip>}
    >
      <SimCanvas
        deps={[temp, p, fused, hotEnough, energy, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cy = h / 2;
          const gap = fused ? 0 : 46 - (p * 0.55) * 90 * (hotEnough ? 1 : 0.15);
          const lx = w / 2 - gap / 2;
          const rx = w / 2 + gap / 2;
          const nucleus = (x: number, r: number, color: string, label: string) => {
            ctx.beginPath();
            ctx.arc(x, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(label, x - 6, cy + 5);
          };
          if (fused) {
            const sun = ctx.createRadialGradient(w / 2 - 10, cy - 12, 4, w / 2, cy, 44);
            sun.addColorStop(0, "#fde047");
            sun.addColorStop(0.6, "#fb923c");
            sun.addColorStop(1, "#f43f5e");
            ctx.beginPath();
            ctx.arc(w / 2, cy, 40, 0, Math.PI * 2);
            ctx.fillStyle = sun;
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 15px system-ui";
            ctx.fillText("He", w / 2 - 12, cy + 5);
            for (let i = 0; i < 8; i++) {
              const aa = (i / 8) * Math.PI * 2 + sim.tick * 0.05;
              ctx.beginPath();
              ctx.arc(w / 2 + Math.cos(aa) * (72 + (sim.tick % 8)), cy + Math.sin(aa) * 54, 5, 0, Math.PI * 2);
              ctx.fillStyle = "#fde047";
              ctx.fill();
            }
            const g = ctx.createRadialGradient(w / 2, cy, 6, w / 2, cy, 120);
            g.addColorStop(0, "rgba(251,191,36,0.6)");
            g.addColorStop(1, "rgba(251,191,36,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(w / 2, cy, 120, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#881337";
            ctx.font = "bold 15px system-ui";
            ctx.fillText(`E = ${energy.toFixed(1)} MeV`, w / 2 - 52, cy + 92);
            ctx.fillStyle = "#f43f5e";
            ctx.font = "bold 14px system-ui";
            ctx.fillText("FUSION! — helium forms", 30, 40);
          } else {
            nucleus(lx, 26, "#f43f5e", "H");
            nucleus(rx, 26, "#f43f5e", "H");
            ctx.strokeStyle = "#fda4af";
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(lx + 30, cy - 40);
            ctx.lineTo(rx - 30, cy - 40);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#fda4af";
            ctx.font = "10px system-ui";
            ctx.fillText("electric repulsion", w / 2 - 58, cy - 46);
            ctx.fillStyle = "#881337";
            ctx.font = "bold 13px system-ui";
            ctx.fillText(hotEnough ? "superheated — nuclei closing in…" : "too cold — repulsion wins", 30, 40);
          }
          ctx.fillStyle = "#881337";
          ctx.font = "12px system-ui";
          ctx.fillText(`temperature ${temp}% of ignition threshold`, 30, 62);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Temperature" value={temp} min={0} max={100} step={1} hex={a} accent={at} unit="%" onChange={setTemp} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Needed" value="~10 million °C" accent={at} />
        <Stat label="Product" value="helium + energy" accent={at} />
        <Stat label="Where?" value="Sun & stars" accent={at} />
        <Stat label="Mass defect Δm" value={`${massDefect.toExponential(2)} kg`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="E = Δm·c²" value="energy released" accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="1 g fuel" value="≈ 8 t oil" accent="text-amber-600 dark:text-amber-400" />
      </div>
    </SimShell>
  );
}
