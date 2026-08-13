"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";

type KinMode =
  | "distance-displacement"
  | "measuring"
  | "speed"
  | "acceleration"
  | "distance-time"
  | "speed-time"
  | "equations"
  | "gravity"
  | "weightless"
  | "free-fall";

function kinMode(topic?: string): KinMode {
  const t = topic?.toLowerCase() ?? "";
  if (/displacement|distance and/.test(t)) return "distance-displacement";
  if (/measur/.test(t)) return "measuring";
  if (/distance-time/.test(t)) return "distance-time";
  if (/speed-time|velocity-time/.test(t)) return "speed-time";
  if (/equations of motion|equation of motion/.test(t)) return "equations";
  if (/accelerat/.test(t)) return "acceleration";
  if (/weightless/.test(t)) return "weightless";
  if (/gravity|^g$|free fall/.test(t)) return "gravity";
  if (/speed/.test(t)) return "speed";
  return "free-fall";
}

const MODE_SUB: Record<KinMode, string> = {
  "distance-displacement": "Distance is the total path covered; displacement is the straight-line shortcut between start and finish.",
  measuring: "Measure distance with the ruler and time with the stopwatch — speed is distance divided by time.",
  speed: "Speed tells you how fast — run the track and read it straight off the distance–time graph.",
  acceleration: "Acceleration is the rate of change of velocity — the steeper the v–t line, the bigger the acceleration.",
  "distance-time": "On a distance–time graph the slope is the speed: a steeper line means a faster object.",
  "speed-time": "On a speed–time graph the area under the line is the distance travelled.",
  equations: "The equations of motion tie together u, v, a, t and s — change one and the others agree.",
  gravity: "Near the Earth's surface everything falls with the same constant acceleration g ≈ 9.8 m/s².",
  "free-fall": "In free fall only weight acts — the velocity graph is a straight line with slope g.",
  weightless: "In free fall everything accelerates together, so inside the capsule everything floats.",
};

const MODE_HINT: Record<KinMode, string> = {
  "distance-displacement": "Distance ≥ displacement. Displacement includes direction — it is a vector.",
  measuring: "Speed = distance ÷ time. Average speed needs the total distance and total time.",
  speed: "Speed = distance ÷ time. A horizontal line on an s–t graph means the object is stationary.",
  acceleration: "Acceleration = change in velocity ÷ time. The slope of a v–t graph equals acceleration.",
  "distance-time": "Slope of the s–t graph = speed. Curves mean changing speed (acceleration).",
  "speed-time": "Area under the v–t graph = displacement. Slope = acceleration.",
  equations: "v = u + at, s = ut + ½at², v² = u² + 2as — they only work for uniform acceleration.",
  gravity: "g varies slightly with height and latitude; on the Moon it is only 1.6 m/s².",
  "free-fall": "Air resistance is ignored in free fall — in reality a parachute makes a falling person reach terminal velocity.",
  weightless: "Astronauts float because they are in free fall around the Earth, not because gravity is absent.",
};

export function KinematicsSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const mode = kinMode(topic);
  const [v0, setV0] = useState(4);
  const [acc, setAcc] = useState(1.5);
  const [dist, setDist] = useState(30);
  const [time, setTime] = useState(5);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });

  const maxT = mode === "gravity" || mode === "free-fall" || mode === "weightless" ? 5 : 10;
  const t = sim.elapsed % maxT;
  const g = 9.8;
  const isG = mode === "gravity" || mode === "free-fall" || mode === "weightless";
  const vFun = isG ? g * t : v0 + acc * t;
  const sFun = isG ? 0.5 * g * t * t : v0 * t + 0.5 * acc * t * t;
  const disp = dist * Math.cos((acc * Math.PI) / 360);
  const ratio = dist / Math.max(1, disp);

  const sliders = (() => {
    switch (mode) {
      case "measuring":
        return (
          <>
            <Slider label="Distance" value={dist} min={1} max={100} step={1} hex={a} accent={at} unit=" m" onChange={setDist} />
            <Slider label="Time" value={time} min={1} max={10} step={0.5} hex={a} accent={at} unit=" s" onChange={setTime} />
          </>
        );
      case "speed":
        return (
          <>
            <Slider label="Speed" value={v0} min={1} max={10} step={0.5} hex={a} accent={at} unit=" m/s" onChange={setV0} />
            <Slider label="Time" value={time} min={1} max={10} step={0.5} hex={a} accent={at} unit=" s" onChange={setTime} />
          </>
        );
      case "distance-time":
        return (
          <>
            <Slider label="Speed (slope)" value={v0} min={0.5} max={10} step={0.5} hex={a} accent={at} unit=" m/s" onChange={setV0} />
            <Slider label="Time" value={time} min={1} max={10} step={0.5} hex={a} accent={at} unit=" s" onChange={setTime} />
          </>
        );
      case "speed-time":
      case "acceleration":
        return (
          <>
            <Slider label="Initial velocity (v0)" value={v0} min={0} max={10} step={0.5} hex={a} accent={at} unit=" m/s" onChange={setV0} />
            <Slider label="Acceleration (a)" value={acc} min={-5} max={5} step={0.25} hex={a} accent={at} unit=" m/s2" onChange={setAcc} />
          </>
        );
      case "equations":
        return (
          <>
            <Slider label="Initial velocity (u)" value={v0} min={0} max={10} step={0.5} hex={a} accent={at} unit=" m/s" onChange={setV0} />
            <Slider label="Acceleration (a)" value={acc} min={-5} max={5} step={0.25} hex={a} accent={at} unit=" m/s2" onChange={setAcc} />
          </>
        );
      case "gravity":
      case "free-fall":
      case "weightless":
        return (
          <>
            <Slider label="Drop time" value={time} min={1} max={5} step={0.25} hex={a} accent={at} unit=" s" onChange={setTime} />
            <Slider label="Height" value={dist} min={10} max={120} step={5} hex={a} accent={at} unit=" m" onChange={setDist} />
          </>
        );
      default:
        return (
          <>
            <Slider label="Distance travelled" value={dist} min={10} max={100} step={2} hex={a} accent={at} unit=" m" onChange={setDist} />
            <Slider label="Turning angle" value={acc} min={0} max={180} step={5} hex={a} accent={at} unit="°" onChange={setAcc} />
          </>
        );
    }
  })();

  const stats = (() => {
    switch (mode) {
      case "measuring":
        return (
          <>
            <Stat label="Distance" value={`${dist} m`} accent={at} />
            <Stat label="Time" value={`${time} s`} accent={at} />
            <Stat label="Speed" value={`${(dist / time).toFixed(1)} m/s`} accent={at} />
          </>
        );
      case "speed":
        return (
          <>
            <Stat label="Time" value={`${time} s`} accent={at} />
            <Stat label="Distance" value={`${(v0 * time).toFixed(1)} m`} accent={at} />
            <Stat label="Speed" value={`${v0.toFixed(1)} m/s`} accent={at} />
          </>
        );
      case "distance-time":
        return (
          <>
            <Stat label="Time" value={`${time} s`} accent={at} />
            <Stat label="Distance" value={`${(v0 * time).toFixed(1)} m`} accent={at} />
            <Stat label="Speed" value={`${v0.toFixed(1)} m/s`} accent={at} />
          </>
        );
      case "speed-time":
      case "acceleration":
        return (
          <>
            <Stat label="Time" value={`${t.toFixed(1)} s`} accent={at} />
            <Stat label="Velocity" value={`${vFun.toFixed(1)} m/s`} accent={at} />
            <Stat label="Acceleration" value={`${acc.toFixed(2)} m/s2`} accent={at} />
          </>
        );
      case "equations":
        return (
          <>
            <Stat label="v = u + at" value={`${(v0 + acc * t).toFixed(1)} m/s`} accent={at} />
            <Stat label="s = ut + ½at2" value={`${sFun.toFixed(1)} m`} accent={at} />
            <Stat label="v2 = u2 + 2as" value={`${(v0 + acc * t).toFixed(1)} m/s`} accent={at} />
          </>
        );
      case "gravity":
      case "free-fall":
        return (
          <>
            <Stat label="Time" value={`${t.toFixed(1)} s`} accent={at} />
            <Stat label="Velocity (v = gt)" value={`${(g * t).toFixed(1)} m/s`} accent={at} />
            <Stat label="Height fallen" value={`${(0.5 * g * t * t).toFixed(1)} m`} accent={at} />
          </>
        );
      case "weightless":
        return (
          <>
            <Stat label="Time" value={`${t.toFixed(1)} s`} accent={at} />
            <Stat label="Fall distance" value={`${(0.5 * g * t * t).toFixed(1)} m`} accent={at} />
            <Stat label="Apparent weight" value="0 N" accent={at} />
          </>
        );
      default:
        return (
          <>
            <Stat label="Distance" value={`${dist} m`} accent={at} />
            <Stat label="Displacement" value={`${disp.toFixed(1)} m`} accent={at} />
            <Stat label="Distance / Disp." value={`${ratio.toFixed(1)}×`} accent={at} />
          </>
        );
    }
  })();

  return (
    <SimShell
      icon="📈"
      title={simTitle(topic, "Kinematics — motion graphs")}
      accent="violet"
      subtitle={topic ? `${topic} — ${MODE_SUB[mode]}` : MODE_SUB[mode]}
      hint={MODE_HINT[mode]}
      controls={topic ? <SimChip accent="violet">{topic}</SimChip> : undefined}
    >
      <SimCanvas
        deps={[mode, v0, acc, dist, time, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);

          if (mode === "distance-displacement") {
            const aRad = (acc * Math.PI) / 180;
            const cx = w / 2;
            const cy = h / 2 + 10;
            ctx.strokeStyle = "#a78bfa";
            ctx.lineWidth = 3;
            ctx.setLineDash([3, 7]);
            ctx.beginPath();
            ctx.moveTo(cx - 160, cy + 40);
            for (let i = 0; i <= 60; i++) {
              const ang = (i / 60) * aRad;
              ctx.lineTo(cx - 160 + Math.cos(ang) * 160, cy + 40 - Math.sin(ang) * 160);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            const ex = cx - 160 + disp * 2.4;
            const ey = cy + 40 - Math.sin(aRad / 2) * 160 * (disp / Math.max(1, dist));
            ctx.strokeStyle = "#f97316";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx - 160, cy + 40);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            ctx.fillStyle = "#8b5cf6";
            ctx.beginPath();
            ctx.arc(cx - 160, cy + 40, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.arc(ex, ey, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = "13px system-ui";
            ctx.fillStyle = "#7c3aed";
            ctx.fillText("distance: curved path", 20, 30);
            ctx.fillStyle = "#c2410c";
            ctx.fillText("displacement: straight line", 20, 50);
            ctx.fillStyle = "#64748b";
            ctx.fillText(`turning angle ${acc}° · displacement ${disp.toFixed(1)} m`, 20, 70);
            return;
          }

          if (mode === "measuring" || mode === "speed") {
            const d = mode === "measuring" ? dist : v0 * time;
            const tm = mode === "measuring" ? time : time;
            const speed = d / Math.max(0.1, tm);
            const cy = h / 2 + 20;
            ctx.strokeStyle = "#8b5cf6";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(60, cy);
            ctx.lineTo(w - 60, cy);
            ctx.stroke();
            ctx.fillStyle = "#8b5cf6";
            ctx.font = "13px system-ui";
            ctx.fillText("0 m", 50, cy + 22);
            ctx.fillText(`${d.toFixed(0)} m`, w - 100, cy + 22);
            const px = 60 + (Math.min(d, 100) / 100) * (w - 120);
            ctx.fillStyle = "#f97316";
            ctx.beginPath();
            ctx.arc(px, cy, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = "bold 16px system-ui";
            ctx.fillStyle = "#7c3aed";
            ctx.fillText(mode === "measuring" ? `${speed.toFixed(1)} m/s` : `Speed ${v0.toFixed(1)} m/s`, w / 2 - 90, 50);
            return;
          }

          if (mode === "equations") {
            const v = v0 + acc * t;
            const s = v0 * t + 0.5 * acc * t * t;
            const cx = w / 2;
            ctx.textAlign = "center";
            ctx.fillStyle = "#7c3aed";
            ctx.font = "bold 18px system-ui";
            ctx.fillText(`v = u + at  =  ${v0} + (${acc} × ${t.toFixed(1)})  =  ${v.toFixed(1)} m/s`, cx, h / 2 - 50);
            ctx.fillStyle = "#c2410c";
            ctx.fillText(`s = ut + ½at2  =  ${s.toFixed(1)} m`, cx, h / 2 - 10);
            ctx.fillStyle = "#059669";
            ctx.fillText(`v2 = u2 + 2as  ->  ${(v * v).toFixed(1)} = ${(v0 * v0).toFixed(1)} + ${(2 * acc * s).toFixed(1)}`, cx, h / 2 + 35);
            ctx.textAlign = "left";
            return;
          }

          const peak = isG
            ? g * maxT
            : mode === "distance-time"
              ? Math.max(1, v0 * maxT)
              : Math.max(1, Math.abs(v0) + Math.abs(acc) * maxT);
          const gh = h - 60;
          const midY = 30 + gh / 2;
          const scale = (gh / 2 - 10) / peak;
          const f = mode === "distance-time" ? sFun : vFun;

          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(40, midY);
          ctx.lineTo(w - 20, midY);
          ctx.stroke();

          if (mode === "speed-time") {
            const grad = ctx.createLinearGradient(0, 30, 0, h);
            grad.addColorStop(0, "rgba(249,115,22,0.35)");
            grad.addColorStop(1, "rgba(249,115,22,0.02)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(40, midY);
            for (let tt = 0; tt <= t; tt += 0.05) {
              const px = 40 + (tt / maxT) * (w - 60);
              ctx.lineTo(px, midY - vFunOf(tt, isG, g, v0, acc) * scale);
            }
            ctx.lineTo(40 + (t / maxT) * (w - 60), midY);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#c2410c";
            ctx.font = "13px system-ui";
            ctx.fillText(`area = distance = ${sFun.toFixed(1)} m`, 60, 24);
          }

          ctx.strokeStyle = mode === "distance-time" ? "#8b5cf6" : "#f97316";
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let tt = 0; tt <= t; tt += 0.05) {
            const px = 40 + (tt / maxT) * (w - 60);
            const val = mode === "distance-time" ? sFunOf(tt, isG, g, v0, acc) : vFunOf(tt, isG, g, v0, acc);
            const py = midY - val * scale;
            if (tt === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          const endPx = 40 + (t / maxT) * (w - 60);
          const endPy = midY - f * scale;
          ctx.fillStyle = "rgba(139,92,246,0.2)";
          ctx.beginPath();
          ctx.arc(endPx, endPy, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = mode === "distance-time" ? "#8b5cf6" : "#f97316";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(endPx, endPy, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#64748b";
          ctx.font = "13px system-ui";
          ctx.fillText(mode === "distance-time" ? "distance (m)" : "velocity (m/s)", 12, 20);
          ctx.fillText("time (s)", w - 70, h - 12);
        }}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">{sliders}</div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">{stats}</div>
    </SimShell>
  );
}

function vFunOf(tt: number, isG: boolean, g: number, v0: number, acc: number) {
  return isG ? g * tt : v0 + acc * tt;
}
function sFunOf(tt: number, isG: boolean, g: number, v0: number, acc: number) {
  return isG ? 0.5 * g * tt * tt : v0 * tt + 0.5 * acc * tt * tt;
}
