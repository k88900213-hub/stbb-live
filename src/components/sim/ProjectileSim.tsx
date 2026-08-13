"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

type Pt = { x: number; y: number };

interface TrajPoint {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function integrateTrajectory(speed: number, angleDeg: number, drag: boolean, g: number): TrajPoint[] {
  const rad = (angleDeg * Math.PI) / 180;
  const b = drag ? 0.018 : 0;
  let vx = speed * Math.cos(rad);
  let vy = speed * Math.sin(rad);
  let x = 0;
  let y = 0;
  const arr: TrajPoint[] = [];
  const dt = 0.02;
  for (let tt = 0; tt < 25; tt += dt) {
    arr.push({ t: tt, x, y, vx, vy });
    const v = Math.hypot(vx, vy);
    const ax = -b * v * vx;
    const ay = -g - b * v * vy;
    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    if (y < 0) break;
  }
  return arr;
}

function projectileMode(topic?: string): "path" | "orbit" {
  const t = topic?.toLowerCase() ?? "";
  if (/orbit|satellite/.test(t)) return "orbit";
  return "path";
}

function computeOrbit(v: number): Pt[] {
  const GM = 200;
  const pos = { x: 0, y: -200 };
  const vel = { x: v, y: 0 };
  const dt = 0.04;
  const points: Pt[] = [{ ...pos }];
  for (let i = 0; i < 8000; i++) {
    const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
    if (r < 150 || r > 900) break;
    const a = -GM / (r * r);
    vel.x += ((a * pos.x) / r) * dt;
    vel.y += ((a * pos.y) / r) * dt;
    pos.x += vel.x * dt;
    pos.y += vel.y * dt;
    if (i % 2 === 0) points.push({ x: pos.x, y: pos.y });
  }
  return points;
}

export function ProjectileSim({ topic }: { topic?: string }) {
  if (projectileMode(topic) === "orbit") return <OrbitView topic={topic} />;
  return <PathView topic={topic} />;
}

function OrbitView({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const [v, setV] = useState(1.0);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const points = computeOrbit(v);
  const idx = Math.min(Math.floor((sim.tick / 2) % points.length), points.length - 1);
  const status =
    v < 0.7
      ? "too slow — falls back"
      : Math.abs(v - 1) < 0.03
        ? "circular orbit!"
        : v < 1.0
          ? "elliptical orbit (near Earth)"
          : v < 1.41
            ? "elliptical orbit (higher)"
            : "escape velocity — leaves Earth";

  return (
    <SimShell
      icon="🛰️"
      title={simTitle(topic, "Orbit and satellite motion")}
      accent="orange"
      subtitle="Fire the satellite sideways at just the right speed and it keeps falling around the Earth — forever missing the ground. That is an orbit."
      hint="Circular orbit speed v = √(GM/r). Slower and the satellite dips into the atmosphere; faster it swings out into an ellipse; above √2 × v_orbital it escapes entirely."
      controls={topic ? <SimChip accent="orange">{topic}</SimChip> : undefined}
    >
      <SimCanvas
        deps={[v, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const bg = ctx.createLinearGradient(0, 0, 0, h);
          bg.addColorStop(0, "#0f172a");
          bg.addColorStop(1, "#020617");
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, w, h);
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.fillStyle = "#e2e8f0";
          for (let i = 0; i < 90; i++) {
            const sx = ((i * 71) % 620) - 310;
            const sy = ((i * 53) % 300) - 150;
            ctx.globalAlpha = 0.2 + (i % 3) * 0.12;
            ctx.beginPath();
            ctx.arc(sx, sy, 1, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          const grad = ctx.createRadialGradient(0, 0, 20, 0, 0, 150);
          grad.addColorStop(0, "#38bdf8");
          grad.addColorStop(0.7, "#1d4ed8");
          grad.addColorStop(1, "#0b2e59");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, 150, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(125,211,252,0.5)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 154, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = "rgba(251,146,60,0.4)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let i = 0; i < idx; i++) {
            const p = points[i];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.stroke();
          const cur = points[Math.min(idx, points.length - 1)];
          ctx.fillStyle = "#fb923c";
          ctx.shadowColor = "rgba(249,115,22,0.8)";
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(cur.x, cur.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(125,211,252,0.9)";
          ctx.font = "11px system-ui";
          ctx.textAlign = "center";
          ctx.fillText("Earth", 0, 6);
          ctx.textAlign = "start";
          ctx.restore();
        }}
      />

      <div className="mt-4">
        <Slider label="Horizontal launch speed" value={v} min={0.4} max={1.8} step={0.02} hex={a} accent={at} unit=" × v_orbital" onChange={setV} />
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="v_orbital" value="1.00 (√(GM/r))" accent={at} />
        <Stat label="Path" value={status} accent={at} />
      </div>
    </SimShell>
  );
}

function PathView({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const [angle, setAngle] = useState(45);
  const [speed, setSpeed] = useState(24);
  const [dragOn, setDragOn] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });

  const g = 9.8;
  const traj = integrateTrajectory(speed, angle, dragOn, g);
  const flightTime = Math.max(traj[traj.length - 1]?.t ?? 0.1, 0.1);
  const range = traj[traj.length - 1]?.x ?? 0;
  const maxH = traj.reduce((m, p) => Math.max(m, p.y), 0);
  const t = sim.elapsed % flightTime;
  const idx = Math.min(Math.floor(t / 0.02), traj.length - 1);
  const cur = traj[idx];
  const curSpeed = Math.hypot(cur.vx, cur.vy);
  const curH = cur.y;
  const rangeNoDrag = (speed * speed * Math.sin((2 * angle * Math.PI) / 180)) / g;

  return (
    <SimShell
      icon="🎯"
      title={simTitle(topic, "Projectile motion")}
      accent="orange"
      subtitle={
        topic
          ? `${topic} — fire a projectile and trace its path as gravity bends the arc back to Earth.`
          : "Fire a projectile and trace its path. Gravity pulls it back down — horizontal and vertical motion are independent."
      }
      hint="Range R = v²sin2θ / g is maximum at 45°. Air resistance slows the projectile in both directions, shortening the range and flattening the descent."
      controls={topic ? <SimChip accent="orange">{topic}</SimChip> : undefined}
    >
      <SimCanvas
        deps={[angle, speed, dragOn, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const padX = 50;
          const scale = (w - padX * 2) / Math.max(range, 1);
          const yMax = Math.max(maxH, 20);
          const scaleY = (h - 70) / yMax;
          const groundY = h - 30;

          const sky = ctx.createLinearGradient(0, 0, 0, h);
          sky.addColorStop(0, "rgba(125,211,252,0.4)");
          sky.addColorStop(0.6, "rgba(255,255,255,0.15)");
          sky.addColorStop(1, "rgba(249,115,22,0.1)");
          ctx.fillStyle = sky;
          ctx.fillRect(0, 0, w, h);

          const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
          groundGrad.addColorStop(0, "rgba(251,146,60,0.5)");
          groundGrad.addColorStop(1, "rgba(194,65,12,0.25)");
          ctx.fillStyle = groundGrad;
          ctx.fillRect(0, groundY, w, h - groundY);
          ctx.strokeStyle = "rgba(249,115,22,0.6)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, groundY);
          ctx.lineTo(w, groundY);
          ctx.stroke();

          const apexY = groundY - maxH * scaleY;
          ctx.strokeStyle = "rgba(139,92,246,0.4)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(padX, apexY);
          ctx.lineTo(padX + range * scale, apexY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(139,92,246,0.9)";
          ctx.font = "11px system-ui";
          ctx.fillText(`max height ${maxH.toFixed(1)} m`, padX + 6, apexY - 6);

          ctx.strokeStyle = "#8b5cf6";
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(padX, groundY);
          ctx.lineTo(padX + Math.cos((angle * Math.PI) / 180) * 80, groundY - Math.sin((angle * Math.PI) / 180) * 80);
          ctx.stroke();

          ctx.strokeStyle = "#fb923c";
          ctx.lineWidth = 3;
          ctx.shadowColor = "rgba(251,146,60,0.6)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          for (const p of traj) {
            const px = padX + p.x * scale;
            const py = groundY - p.y * scaleY;
            if (p.t === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          for (let i = 0; i <= idx; i += 4) {
            const p = traj[i];
            const px = padX + p.x * scale;
            const py = groundY - p.y * scaleY;
            ctx.globalAlpha = (i / Math.max(idx, 1)) * 0.5;
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;

          const bx = padX + cur.x * scale;
          const by = groundY - cur.y * scaleY;
          const ballGrad = ctx.createRadialGradient(bx - 2, by - 3, 2, bx, by, 8);
          ballGrad.addColorStop(0, "#fff");
          ballGrad.addColorStop(0.5, "#f97316");
          ballGrad.addColorStop(1, "#c2410c");
          ctx.fillStyle = ballGrad;
          ctx.shadowColor = "rgba(249,115,22,0.8)";
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(bx, by, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          const vLen = Math.min(curSpeed * 2.2, 90);
          const vDir = Math.atan2(-cur.vy, cur.vx);
          ctx.strokeStyle = "#8b5cf6";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(vDir) * vLen, by - Math.sin(vDir) * vLen);
          ctx.stroke();
          ctx.fillStyle = "#8b5cf6";
          ctx.beginPath();
          ctx.moveTo(bx + Math.cos(vDir) * vLen, by - Math.sin(vDir) * vLen);
          ctx.lineTo(bx + Math.cos(vDir) * vLen - 11, by - Math.sin(vDir) * vLen + 4);
          ctx.lineTo(bx + Math.cos(vDir) * vLen - 6, by - Math.sin(vDir) * vLen - 4);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#7c3aed";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`v = ${curSpeed.toFixed(1)} m/s`, bx + 12, by - 12);

          ctx.fillStyle = "rgba(194,65,12,0.95)";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`R = ${range.toFixed(0)} m`, padX + (range * scale) / 2 - 40, groundY - 8);
        }}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Launch angle" value={angle} min={5} max={85} step={1} hex={a} accent={at} unit="°" onChange={setAngle} />
        <Slider label="Launch speed" value={speed} min={5} max={50} step={1} hex={a} accent={at} unit=" m/s" onChange={setSpeed} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[30, 45, 60].map((p) => (
            <ActionButton key={p} label={`${p}°`} title={`Set launch angle to ${p}°`} onClick={() => setAngle(p)} hex={angle === p ? a : "#94a3b8"} />
          ))}
        </div>
        <div className="ml-auto min-w-40 flex-1 sm:flex-none">
          <Toggle label="Air resistance" hint="drag shortens the range" checked={dragOn} onChange={setDragOn} hex={a} />
        </div>
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Range" value={`${range.toFixed(1)} m`} accent={at} />
        <Stat label="Max height" value={`${maxH.toFixed(1)} m`} accent={at} />
        <Stat label="Time of flight" value={`${flightTime.toFixed(1)} s`} accent={at} />
        <Stat label="Current speed" value={`${curSpeed.toFixed(1)} m/s`} accent={at} />
        <Stat label="Height now" value={`${curH.toFixed(1)} m`} accent={at} />
        <Stat label="Vertical velocity" value={`${cur.vy.toFixed(1)} m/s`} accent={at} />
        <Stat label="Range (no drag)" value={`${rangeNoDrag.toFixed(1)} m`} accent={at} />
        <Stat label="Drag effect" value={`${dragOn ? `${((1 - range / Math.max(rangeNoDrag, 0.01)) * 100).toFixed(0)}% shorter` : "off"}`} accent={at} />
      </div>
    </SimShell>
  );
}
