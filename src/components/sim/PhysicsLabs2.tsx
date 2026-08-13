"use client";

import { useEffect, useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

function wavelengthColor(nm: number): string {
  if (nm >= 620) return "#ef4444";
  if (nm >= 585) return "#f59e0b";
  if (nm >= 560) return "#eab308";
  if (nm >= 520) return "#22c55e";
  if (nm >= 480) return "#0ea5e9";
  if (nm >= 450) return "#6366f1";
  return "#8b5cf6";
}

export function PowerSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const [force, setForce] = useState(60);
  const [dist, setDist] = useState(10);
  const [time, setTime] = useState(5);
  const [speed, setSpeed] = useState(1);
  const sim = useSim({ fps: 60 * speed, autoRun: false });
  const work = force * dist;
  const power = work / time;
  const progress = Math.min(1, sim.elapsed / time);
  const height = dist * progress;
  const workNow = force * height;
  const livePower = progress > 0 ? workNow / Math.max(0.05, sim.elapsed) : 0;
  const done = progress >= 1;
  return (
    <SimShell
      icon="âš¡"
      title={simTitle(topic, "Power & work rate")}
      accent="orange"
      subtitle={`${topic ?? "Power"} and” power is the rate of doing work: P = W / t = (F Ã— d) / t.`}
      hint="A machine is more powerful when it does the same work in less time and” that is why a car engine is rated in kilowatts, not joules."
      controls={<SimChip accent="orange"><span aria-hidden>âš¡</span>{topic ?? "power"}</SimChip>}
    >
      <SimCanvas
        deps={[progress, force, dist, done]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const groundY = h - 40;
          ctx.strokeStyle = "rgba(100,116,139,0.4)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(20, groundY);
          ctx.lineTo(w - 20, groundY);
          ctx.stroke();
          ctx.fillStyle = "#475569";
          ctx.fillRect(w - 135, 26, 10, 30);
          ctx.beginPath();
          ctx.arc(w - 130, 66, 20, 0, Math.PI * 2);
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(w - 130, 66, 5, 0, Math.PI * 2);
          ctx.fillStyle = "#94a3b8";
          ctx.fill();
          ctx.strokeStyle = "#a8a29e";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(w - 130, 46);
          ctx.lineTo(w - 130, 86);
          ctx.moveTo(w - 130, 86);
          ctx.lineTo(w - 165, groundY);
          ctx.stroke();
          const bw = 90;
          const bh = 34;
          const bx = w - 210;
          const risePx = progress * 120;
          const by = groundY - bh - risePx;
          ctx.fillStyle = "#fb923c";
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = "#7c2d12";
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, bw, bh);
          ctx.fillStyle = "#7c2d12";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${force} N`, bx + 26, by + 22);
          ctx.strokeStyle = "rgba(249,115,22,0.5)";
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(bx + bw + 8, groundY - bh - 120);
          ctx.lineTo(w - 40, groundY - bh - 120);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#9a3412";
          ctx.font = "12px system-ui";
          ctx.fillText(`target ${dist.toFixed(0)} m`, w - 130, groundY - bh - 126);
          ctx.fillStyle = "#334155";
          ctx.fillText(`height = ${height.toFixed(1)} m`, 30, 40);
          ctx.fillStyle = "#9a3412";
          ctx.font = "bold 14px system-ui";
          ctx.fillText(
            done ? "WORK COMPLETE âœ“" : progress > 0 ? `lifting Â· W = ${workNow.toFixed(0)} J Â· P = ${livePower.toFixed(1)} W` : "press Play to lift",
            30,
            62,
          );
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Force" value={force} min={10} max={200} step={5} hex={a} accent={at} unit=" N" onChange={setForce} />
        <Slider label="Distance moved" value={dist} min={1} max={50} step={1} hex={a} accent={at} unit=" m" onChange={setDist} />
        <Slider label="Time taken" value={time} min={1} max={20} step={1} hex={a} accent={at} unit=" s" onChange={setTime} />
        <div className="rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
          <div className="text-[11px] uppercase tracking-wide text-foreground/50">Formula</div>
          <div className="font-semibold text-foreground">P = FÂ·d / t</div>
        </div>
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speed} onSpeed={setSpeed} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Total work" value={`${work.toFixed(0)} J`} accent={at} />
        <Stat label="Power (avg)" value={`${power.toFixed(1)} W`} accent={at} />
        <Stat label="Current work" value={`${workNow.toFixed(0)} J`} accent={at} />
      </div>
    </SimShell>
  );
}

export function PressureSim({ topic }: { topic?: string }) {
  const a = "#0ea5e9";
  const at = "text-sky-600 dark:text-sky-400";
  const [force, setForce] = useState(500);
  const [area, setArea] = useState(2);
  const [hard, setHard] = useState(false);
  const sim = useSim({ fps: 30 });
  const pressure = force / area;
  const sharp = area <= 0.5;
  const sink = Math.min(90, (pressure / 4000) * (hard ? 18 : 70) + sim.elapsed * 0);
  const setters: [string, number, number][] = [
    ["ðŸ‘  Stiletto", 400, 0.25],
    ["â›¸ï¸ Skater", 650, 0.6],
    ["ðŸ›· Snowshoe", 700, 4],
    ["ðŸ˜ Elephant", 4500, 0.9],
  ];
  return (
    <SimShell
      icon="â–¤"
      title={simTitle(topic, "Pressure and” force over area")}
      accent="sky"
      subtitle={`${topic ?? "Pressure"} and” pressure = force Ã· area (P = F / A). The smaller the area, the bigger the pressure.`}
      hint="A sharp knife cuts because its thin edge concentrates force onto a tiny area; skis and camel feet spread weight over a large area to avoid sinking."
      controls={<SimChip accent="sky"><span aria-hidden>â–¤</span>{topic ?? "pressure"}</SimChip>}
    >
      <SimCanvas
        deps={[pressure, sharp, hard, sink, area]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const bh = 60;
          const bw = Math.max(46, 300 - area * 55);
          const bx = (w - bw) / 2;
          const by = h - 90 - bh;
          const groundTop = h - 88;
          ctx.fillStyle = hard ? "#cbd5e1" : "#fcd34d";
          ctx.fillRect(0, groundTop, w, h - groundTop);
          ctx.fillStyle = hard ? "#64748b" : "#d97706";
          ctx.font = "11px system-ui";
          ctx.fillText(hard ? "HARD ROCK" : "SOFT SAND", w / 2 - 40, h - 12);
          ctx.fillStyle = sharp ? "#f87171" : "#7dd3fc";
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, bw, bh);
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "12px system-ui";
          ctx.fillText(`area ${area.toFixed(2)} mÂ²`, bx, by + bh + 24);
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(w / 2, 22);
          ctx.lineTo(w / 2, by + 6);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#ef4444";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`F = ${force} N`, w / 2 + 10, 42);
          for (let i = 0; i < 5; i++) {
            const x = bx + (i / 4) * bw;
            ctx.strokeStyle = "rgba(234,88,12,0.7)";
            ctx.beginPath();
            ctx.moveTo(x, by + bh + 4);
            ctx.lineTo(x, by + bh + 4 + (sharp ? 18 : 10) + (sim.tick % 12));
            ctx.stroke();
          }
          ctx.fillStyle = "#b45309";
          ctx.font = "bold 15px system-ui";
          ctx.fillText(`P = ${pressure.toFixed(0)} Pa`, 30, 40);
          ctx.fillStyle = "#334155";
          ctx.font = "12px system-ui";
          ctx.fillText(hard ? "surface barely deforms" : `sinks ${sink.toFixed(0)} px into the sand`, 30, 62);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Force (weight)" value={force} min={100} max={5000} step={100} hex={a} accent={at} unit=" N" onChange={setForce} />
        <Slider label="Contact area" value={area} min={0.1} max={5} step={0.1} hex={a} accent={at} unit=" mÂ²" onChange={setArea} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {setters.map(([label, f, ar]) => (
          <ActionButton key={label} label={label} hex={a} onClick={() => { setForce(f); setArea(ar); }} />
        ))}
        <Toggle label="Hard ground" checked={hard} onChange={setHard} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Pressure" value={`${pressure.toFixed(0)} Pa`} accent={at} />
        <Stat label="Force" value={`${force} N`} accent={at} />
        <Stat label="Area effect" value={sharp ? "high pressure and” cuts" : "low pressure and” floats"} accent={at} />
      </div>
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} hex={a} />
      </div>
    </SimShell>
  );
}

export function ConvectionSim({ topic }: { topic?: string }) {
  const a = "#ef4444";
  const at = "text-rose-600 dark:text-rose-400";
  const [heat, setHeat] = useState(50);
  const [burner, setBurner] = useState(true);
  const [speed, setSpeed] = useState(1);
  const sim = useSim({ fps: 60 * speed });
  const N = 30;
  const eff = burner ? heat : 0;
  const circ = 0.5 + eff / 100;
  return (
    <SimShell
      icon="â™¨"
      title={simTitle(topic, "Convection currents")}
      accent="rose"
      subtitle={`${topic ?? "Convection"} and” hot fluid rises, cools, then sinks: a convection current carries heat through liquids and gases.`}
      hint="Winds, ocean currents and sea breezes are convection currents and” the same circulation that warms the air above a radiator or the soup in a pot."
      controls={<SimChip accent="rose"><span aria-hidden>â™¨</span>{topic ?? "convection"}</SimChip>}
    >
      <SimCanvas
        deps={[eff, burner, sim.tick, circ]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const grad = ctx.createLinearGradient(0, h - 42, 0, 30);
          grad.addColorStop(0, eff > 0 ? "#fecaca" : "#fee2e2");
          grad.addColorStop(1, eff > 0 ? "#fff1f2" : "#fff7ed");
          ctx.fillStyle = grad;
          ctx.fillRect(40, 30, w - 80, h - 72);
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 3;
          ctx.strokeRect(40, 30, w - 80, h - 72);
          if (burner && eff > 0) {
            ctx.fillStyle = "#ef4444";
            for (let i = 0; i < 6; i++) {
              const fx = w / 2 - 30 + i * 12;
              const fl = 14 + (sim.tick % 10) + (eff / 100) * 14;
              ctx.beginPath();
              ctx.moveTo(fx, h - 40);
              ctx.lineTo(fx - 3, h - 40 - fl);
              ctx.lineTo(fx + 3, h - 40 - fl);
              ctx.closePath();
              ctx.fill();
            }
            ctx.fillStyle = "#7f1d1d";
            ctx.font = "11px system-ui";
            ctx.fillText("burner ON", w / 2 - 32, h - 20);
          } else {
            ctx.fillStyle = "#64748b";
            ctx.font = "11px system-ui";
            ctx.fillText("burner OFF and” no circulation", w / 2 - 80, h - 20);
          }
          for (let i = 0; i < N; i++) {
            const ang = (i / N) * Math.PI * 2 + sim.tick * 0.04 * circ;
            const rx = (w - 100) / 2;
            const ry = (h - 130) / 2;
            const px = w / 2 + Math.cos(ang) * rx;
            const py = h / 2 + Math.sin(ang) * ry * 0.85 + 6;
            const rising = Math.sin(ang) > 0;
            const t = rising ? 0.2 + (eff / 100) * 0.8 : 0.4;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fillStyle = rising ? `rgb(${240},${Math.round(80 + 120 * t)},${Math.round(40 * (1 - t))})` : "#38bdf8";
            ctx.globalAlpha = 0.9;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          if (eff > 0) {
            ctx.strokeStyle = "rgba(244,63,94,0.6)";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.ellipse(w / 2, h / 2 + 6, (w - 100) / 2, (h - 130) / 2, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#be123c";
            ctx.font = "bold 11px system-ui";
            ctx.fillText("hot rises", w / 2 - 20, h / 2 - 60);
            ctx.fillText("cold sinks", w / 2 - 22, h / 2 + 90);
          }
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Heat input" value={heat} min={0} max={100} step={1} hex={a} accent={at} unit="%" onChange={setHeat} />
        <div className="rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
          <div className="text-[11px] uppercase tracking-wide text-foreground/50">Flow</div>
          <div className="font-semibold text-rose-600 dark:text-rose-400">{eff < 15 ? "no circulation" : "rising hot / sinking cold"}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speed} onSpeed={setSpeed} hex={a} />
        <Toggle label="Burner on" checked={burner} onChange={setBurner} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Hot particles" value="rise" accent={at} />
        <Stat label="Cool particles" value="sink" accent={at} />
        <Stat label="Current speed" value={`${(circ * 100).toFixed(0)}%`} accent={at} />
      </div>
    </SimShell>
  );
}

export function EchoSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [distance, setDistance] = useState(170);
  const [temp, setTemp] = useState(20);
  const [auto, setAuto] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const [claps, setClaps] = useState(0);
  const sim = useSim({ fps: 60 * speedMul });
  const v = 331.4 + 0.6 * temp;
  const time = (2 * distance) / v;
  const audible = time >= 0.1;
  const travelFrames = Math.max(18, Math.round(time * 40 * speedMul) + 18);
  const waveProg = (sim.tick % travelFrames) / travelFrames;
  const autoClap = auto && sim.tick % Math.max(40, Math.round(travelFrames * 1.3)) === 0;
  return (
    <SimShell
      icon="ðŸŽ‡"
      title={simTitle(topic, "Echo & sound reflection")}
      accent="violet"
      subtitle={`${topic ?? "Echo"} and” sound reflects off a hard surface and returns after time t = 2d / v.`}
      hint="An echo is heard when the reflected sound arrives at least 0.1 s after the original and” the sound must travel at least 34 m in total."
      controls={<SimChip accent="violet"><span aria-hidden>ðŸŽ‡</span>{topic ?? "echo"}</SimChip>}
    >
      <SimCanvas
        deps={[distance, v, time, waveProg, audible, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#e0e7ff";
          ctx.fillRect(w - 90, 30, 70, h - 60);
          ctx.strokeStyle = "#c7d2fe";
          ctx.strokeRect(w - 90, 30, 70, h - 60);
          ctx.fillStyle = "#4f46e5";
          ctx.font = "12px system-ui";
          ctx.fillText("cliff", w - 78, 25);
          ctx.fillStyle = "#312e81";
          ctx.beginPath();
          ctx.arc(70, h / 2, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "10px system-ui";
          ctx.fillText("person", 52, h / 2 - 24);
          const xDist = Math.max(20, distance - 100);
          const x = 86 + xDist * waveProg;
          const outgoing = waveProg < 0.5;
          const p = outgoing ? waveProg * 2 : (waveProg - 0.5) * 2;
          ctx.strokeStyle = outgoing ? `rgba(139,92,246,${1 - p})` : `rgba(167,139,250,${1 - p})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, h / 2, 16 + p * 18, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#5b21b6";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(waveProg < 0.5 ? "sound travelling out..." : "echo returning!", 40, h - 16);
          ctx.fillStyle = "#4c1d95";
          ctx.font = "11px system-ui";
          ctx.fillText(`d = ${distance} m Â· v = ${v.toFixed(1)} m/s`, 40, 30);
        }}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton label="Clap!" icon="ðŸ‘" hex={a} onClick={() => setClaps((c) => c + 1)} />
        <Toggle label="Auto-clap" checked={auto} onChange={setAuto} hex={a} hint="sends a clap on a loop" />
      </div>
      {autoClap ? null : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Distance to cliff" value={distance} min={10} max={500} step={5} hex={a} accent={at} unit=" m" onChange={setDistance} />
        <Slider label="Air temperature" value={temp} min={-10} max={45} step={1} hex={a} accent={at} unit=" Â°C" onChange={setTemp} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Total journey" value={`${(2 * distance).toFixed(0)} m`} accent={at} />
        <Stat label="Echo delay" value={`${time.toFixed(2)} s`} accent={at} />
        <Stat label="Heard?" value={audible ? "yes and” echo" : "no and” merged"} accent={at} />
      </div>
      <div className="mt-2 text-xs text-foreground/50">Claps sent: {claps}</div>
    </SimShell>
  );
}

export function ResonanceSim({ topic }: { topic?: string }) {
  const a = "#10b981";
  const at = "text-emerald-600 dark:text-emerald-400";
  const [freq, setFreq] = useState(1);
  const [damping, setDamping] = useState(0.15);
  const [sweep, setSweep] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const natural = 1.6;
  useEffect(() => {
    if (!sweep) return;
    const id = setInterval(() => setFreq((f) => (f >= 3 ? 0.5 : f + 0.02)), 40);
    return () => clearInterval(id);
  }, [sweep]);
  const det = Math.sqrt(Math.max(0.01, Math.pow(1 - Math.pow(freq / natural, 2), 2) + Math.pow(damping * (freq / natural), 2)));
  const amp = 1 / det;
  const nearResonance = Math.abs(freq - natural) < 0.35;
  const cracked = amp > 5;
  const points = Array.from({ length: 50 }, (_, i) => {
    const f = 0.1 + (i / 49) * 3;
    const d = Math.sqrt(Math.pow(1 - Math.pow(f / natural, 2), 2) + Math.pow(damping * (f / natural), 2));
    return { f, a: 1 / d };
  });
  return (
    <SimShell
      icon="ðŸ«¨"
      title={simTitle(topic, "Resonance")}
      accent="emerald"
      subtitle={`${topic ?? "Resonance"} and” when the driving frequency matches the natural frequency, amplitude grows dramatically.`}
      hint="Opera singers can shatter a glass when their voice matches the glass's natural frequency; soldiers break step on bridges for the same reason."
      controls={<SimChip accent="emerald"><span aria-hidden>ðŸ«¨</span>{topic ?? "resonance"}</SimChip>}
    >
      <SimCanvas
        deps={[freq, damping, sim.tick, amp, cracked, nearResonance]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const base = h - 50;
          const drawOsc = (x: number, color: string, phase: number) => {
            const swing = cracked ? amp * 40 * 0.3 : amp * 40;
            const y = base - Math.sin(sim.tick * 0.2 * freq + phase) * swing;
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, base);
            ctx.lineTo(x, y);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
          };
          drawOsc(120, "#34d399", 0);
          drawOsc(180, "#a3a3a3", 0.2);
          drawOsc(240, "#34d399", 0);
          drawOsc(300, "#a3a3a3", 0.2);
          drawOsc(360, "#34d399", 0);
          ctx.strokeStyle = "rgba(100,116,139,0.3)";
          ctx.beginPath();
          ctx.moveTo(80, base);
          ctx.lineTo(w - 30, base);
          ctx.stroke();
          const maxA = Math.max(...points.map((p) => p.a));
          ctx.strokeStyle = "#059669";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          points.forEach((p, i) => {
            const x = 80 + (i / (points.length - 1)) * (w - 130);
            const y = base - (p.a / maxA) * 110;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
          const mx = 80 + ((freq - 0.1) / 3) * (w - 130);
          const my = base - (amp / maxA) * 110;
          ctx.fillStyle = cracked ? "#ef4444" : "#ef4444";
          ctx.beginPath();
          ctx.arc(mx, my, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = cracked ? "#dc2626" : "#047857";
          ctx.font = "bold 14px system-ui";
          ctx.fillText(cracked ? "CRACK! and” glass shattered" : `amplitude ${amp.toFixed(1)}Ã—`, 30, 40);
          ctx.fillStyle = "#475569";
          ctx.font = "12px system-ui";
          ctx.fillText(nearResonance ? "â–² resonance band" : "sweep the frequency to find it", 30, 60);
          if (cracked) {
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 8; i++) {
              ctx.beginPath();
              const gx = w / 2 + Math.cos(i * 1.3) * (40 + (sim.tick % 14));
              const gy = 60 + Math.sin(i * 0.9) * 20 + (sim.tick % 10);
              ctx.moveTo(gx, gy);
              ctx.lineTo(gx + Math.cos(i) * 26, gy + 22);
              ctx.stroke();
            }
          }
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Driving frequency" value={freq} min={0.1} max={3} step={0.05} hex={a} accent={at} unit=" Hz" onChange={setFreq} />
        <Slider label="Damping" value={damping} min={0.02} max={0.6} step={0.02} hex={a} accent={at} onChange={setDamping} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Auto sweep" checked={sweep} onChange={setSweep} hex={a} hint="scans the frequency past resonance" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Natural freq" value={`${natural.toFixed(1)} Hz`} accent={at} />
        <Stat label="Amplitude" value={`${amp.toFixed(1)}Ã—`} accent={at} />
        <Stat label="Condition" value={cracked ? "shattered!" : nearResonance ? "RESONANCE!" : "away from resonance"} accent={at} />
      </div>
    </SimShell>
  );
}

export function DopplerSim({ topic }: { topic?: string }) {
  const a = "#f43f5e";
  const at = "text-rose-600 dark:text-rose-400";
  const [speed, setSpeed] = useState(20);
  const [sourceF, setSourceF] = useState(440);
  const [receding, setReceding] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const vs = 343;
  const ratio = speed / vs;
  const mach = speed / vs;
  const supersonic = speed >= vs;
  const fAhead = ratio >= 1 ? Infinity : (sourceF * vs) / (vs - speed);
  const fBehind = (sourceF * vs) / (vs + speed);
  const heardAhead = receding ? fBehind : fAhead;
  const heardBehind = receding ? fAhead : fBehind;
  const rings = 5;
  return (
    <SimShell
      icon="ðŸ“£"
      title={simTitle(topic, "Doppler effect")}
      accent="rose"
      subtitle={`${topic ?? "Doppler effect"} and” a moving source bunches wavefronts ahead of it and spreads them behind.`}
      hint="The ambulance siren sounds higher-pitched as it approaches and lower after it passes and” the frequency depends on the relative motion."
      controls={<SimChip accent="rose"><span aria-hidden>ðŸ“£</span>{topic ?? "doppler"}</SimChip>}
    >
      <SimCanvas
        deps={[speed, sim.tick, receding, heardAhead, heardBehind, supersonic]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cy = h / 2;
          const sourceX = w - 140 - (speed / 80) * (w - 300);
          const dir = receding ? -1 : 1;
          for (let k = 0; k < rings; k++) {
            const r = 30 + k * 26 + (sim.tick % 20) * 1.3;
            ctx.beginPath();
            ctx.arc(sourceX, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(244,63,94,${Math.max(0, 1 - k / rings)})`;
            ctx.stroke();
          }
          const arrowTip = sourceX + dir * (receding ? -1 : 1) * 120;
          ctx.strokeStyle = "#f43f5e";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sourceX, cy - 34);
          ctx.lineTo(arrowTip, cy - 34);
          ctx.stroke();
          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.moveTo(arrowTip + dir * 10, cy - 34);
          ctx.lineTo(arrowTip - dir * 6, cy - 42);
          ctx.lineTo(arrowTip - dir * 6, cy - 26);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#be123c";
          ctx.beginPath();
          ctx.arc(sourceX, cy, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px system-ui";
          ctx.fillText("source", sourceX - 24, cy - 24);
          ctx.fillStyle = "#be123c";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`heard AHEAD = ${heardAhead.toFixed(0)} Hz`, 30, 36);
          ctx.fillStyle = "#475569";
          ctx.font = "12px system-ui";
          ctx.fillText(`heard BEHIND = ${heardBehind.toFixed(0)} Hz`, 30, 56);
          ctx.fillStyle = "#334155";
          ctx.fillText(receding ? "moving away and” pitch drops" : "approaching and” pitch rises", 30, 78);
          if (supersonic) {
            ctx.fillStyle = "#dc2626";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("SONIC BOOM and” source outruns its own waves!", 30, 100);
          }
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Source speed" value={speed} min={0} max={330} step={5} hex={a} accent={at} unit=" m/s" onChange={setSpeed} />
        <Slider label="Source frequency" value={sourceF} min={200} max={1000} step={10} hex={a} accent={at} unit=" Hz" onChange={setSourceF} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label={receding ? "Moving away" : "Approaching"} checked={receding} onChange={setReceding} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Speed of sound" value="343 m/s" accent={at} />
        <Stat label="Approaching f/fâ‚€" value={`${(1 / (1 - ratio)).toFixed(2)}Ã—`} accent={at} />
        <Stat label="Receding f/fâ‚€" value={`${(1 / (1 + ratio)).toFixed(2)}Ã—`} accent={at} />
        <Stat label="Mach number" value={mach.toFixed(2)} accent={supersonic ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"} />
        <Stat label="Î» ahead / Î»â‚€" value={`${(1 - ratio).toFixed(2)}Ã—`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Î» behind / Î»â‚€" value={`${(1 + ratio).toFixed(2)}Ã—`} accent="text-emerald-600 dark:text-emerald-400" />
      </div>
    </SimShell>
  );
}

export function CapacitorSim({ topic }: { topic?: string }) {
  const a = "#14b8a6";
  const at = "text-teal-600 dark:text-teal-400";
  const [r, setR] = useState(1000);
  const [c, setC] = useState(0.001);
  const [discharge, setDischarge] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul, autoRun: false });
  const tau = r * c;
  const V0 = 9;
  const tMax = tau * 5;
  const runTime = Math.max(2, Math.min(12, tMax));
  const progress = Math.min(1, sim.elapsed / runTime);
  const t = progress * tMax;
  const v = discharge ? V0 * Math.exp(-t / tau) : V0 * (1 - Math.exp(-t / tau));
  const q = c * v;
  const qMax = c * V0;
  const eStored = 0.5 * c * v * v;
  const iCur = discharge ? -(V0 / r) * Math.exp(-t / tau) : (V0 / r) * Math.exp(-t / tau);
  const steps = 80;
  return (
    <SimShell
      icon="ðŸ”Œ"
      title={simTitle(topic, "Capacitor charge & discharge")}
      accent="teal"
      subtitle={`${topic ?? "Capacitor"} and” a capacitor charges along an exponential curve: V = Vâ‚€(1 âˆ’ e^(âˆ’t/RC)), storing Q = CV.`}
      hint="The time constant Ï„ = RC is the time to reach 63% of the full voltage and” after 5Ï„ the capacitor is essentially fully charged."
      controls={<SimChip accent="teal"><span aria-hidden>ðŸ”Œ</span>{topic ?? "capacitor"}</SimChip>}
    >
      <SimCanvas
        deps={[tau, V0, discharge, progress, t, v, q, eStored, iCur]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const base = h - 45;
          const xOf = (tt: number) => 50 + (tt / tMax) * (w - 90);
          const yOf = (vv: number) => base - (vv / V0) * 120;
          ctx.strokeStyle = "rgba(100,116,139,0.3)";
          ctx.beginPath();
          ctx.moveTo(40, base);
          ctx.lineTo(w - 20, base);
          ctx.moveTo(50, base);
          ctx.lineTo(50, 25);
          ctx.stroke();
          ctx.strokeStyle = discharge ? "#e11d48" : "#0d9488";
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let i = 0; i <= steps; i++) {
            const tt = (i / steps) * tMax;
            const vv = discharge ? V0 * Math.exp(-tt / tau) : V0 * (1 - Math.exp(-tt / tau));
            const x = xOf(tt);
            const y = yOf(vv);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          const tx = xOf(t);
          const ty = yOf(v);
          ctx.fillStyle = discharge ? "#be123c" : "#0f766e";
          ctx.beginPath();
          ctx.arc(tx, ty, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = discharge ? "rgba(225,29,72,0.5)" : "rgba(13,148,136,0.5)";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(tx, base);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#134e4a";
          ctx.font = "12px system-ui";
          ctx.fillText(discharge ? "discharging" : "charging", 30, 40);
          ctx.fillText(`V = ${v.toFixed(2)} V`, 30, 60);
          ctx.fillText(`Q = ${(q * 1000).toFixed(2)} mC`, 30, 78);
          ctx.fillText(`i = ${(iCur * 1000).toFixed(1)} mA`, 30, 96);
          ctx.fillText("t", w - 20, base + 18);
          ctx.fillText("Vâ‚€", 26, yOf(V0) + 4);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Resistance" value={r} min={100} max={10000} step={100} hex={a} accent={at} unit=" Î©" onChange={setR} />
        <Slider label="Capacitance" value={c} min={0.0001} max={0.01} step={0.0001} hex={a} accent={at} unit=" F" onChange={setC} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label={discharge ? "Discharging" : "Charging"} checked={discharge} onChange={setDischarge} hex={a} hint="flips the curve direction" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Time constant" value={`${(tau * 1000).toFixed(0)} ms`} accent={at} />
        <Stat label="Voltage at Ï„" value={`${(V0 * (discharge ? Math.exp(-1) : 1 - Math.exp(-1))).toFixed(2)} V`} accent={at} />
        <Stat label="Progress" value={`${(progress * 100).toFixed(0)}%`} accent={at} />
        <Stat label="Charge Q = CV" value={`${(q * 1000).toFixed(2)} / ${(qMax * 1000).toFixed(2)} mC`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Stored E = Â½CVÂ²" value={`${(eStored * 1e6).toFixed(1)} ÂµJ`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Current i(t)" value={`${(iCur * 1000).toFixed(1)} mA`} accent="text-emerald-600 dark:text-emerald-400" />
      </div>
    </SimShell>
  );
}

export function GeneratorSim({ topic }: { topic?: string }) {
  const a = "#f59e0b";
  const at = "text-amber-600 dark:text-amber-400";
  const [rpm, setRpm] = useState(60);
  const [turns, setTurns] = useState(100);
  const [field, setField] = useState(0.3);
  const [load, setLoad] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const theta = (sim.tick * rpm) / 120;
  const peak = turns * field * 6.4;
  const vOut = Math.sin(theta) * peak;
  const freq = rpm / 60;
  const glow = load ? Math.abs(Math.sin(theta)) : 0;
  return (
    <SimShell
      icon="ðŸŒ€"
      title={simTitle(topic, "AC generator (dynamo)")}
      accent="amber"
      subtitle={`${topic ?? "Generator"} and” a coil spinning in a magnetic field produces alternating current: V = Vâ‚€Â·sin(Î¸).`}
      hint="The voltage is greatest when the coil cuts the field lines fastest (vertical position) and zero when the coil is horizontal to the field."
      controls={<SimChip accent="amber"><span aria-hidden>ðŸŒ€</span>{topic ?? "generator"}</SimChip>}
    >
      <SimCanvas
        deps={[rpm, turns, field, load, sim.tick, vOut, glow, freq]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = 150;
          const cy = h / 2;
          ctx.fillStyle = "#7f1d1d";
          ctx.fillRect(60, 30, 20, h - 60);
          ctx.fillStyle = "#1e3a8a";
          ctx.fillRect(cx + 80, 30, 20, h - 60);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 14px system-ui";
          ctx.fillText("N", 64, 24);
          ctx.fillText("S", cx + 84, 24);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(theta);
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 4;
          ctx.strokeRect(-55, -24, 110, 48);
          ctx.restore();
          ctx.strokeStyle = "rgba(100,116,139,0.3)";
          ctx.beginPath();
          ctx.moveTo(cx + 110, cy - 90);
          ctx.lineTo(cx + 110, cy + 90);
          ctx.stroke();
          const steps = 70;
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let i = 0; i <= steps; i++) {
            const x = cx + 130 + (i / steps) * (w - cx - 160);
            const y = cy - Math.sin((theta % (Math.PI * 2)) - (i / steps) * Math.PI * 4) * 80;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.fillStyle = "#b45309";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`V = ${vOut.toFixed(0)} V`, cx + 130, cy + 105);
          ctx.fillStyle = "#78350f";
          ctx.font = "12px system-ui";
          ctx.fillText(`f = ${freq.toFixed(1)} Hz`, cx + 130, cy + 122);
          const bx = cx + 150;
          const by = cy + 12;
          ctx.beginPath();
          ctx.arc(bx, by, 16, 0, Math.PI * 2);
          ctx.fillStyle = glow > 0.3 ? "#fde047" : "#cbd5e1";
          ctx.fill();
          if (glow > 0.3) {
            const g = ctx.createRadialGradient(bx, by, 2, bx, by, 30);
            g.addColorStop(0, `rgba(253,224,71,${0.7 * glow})`);
            g.addColorStop(1, "rgba(253,224,71,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(bx, by, 30, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.strokeStyle = "#475569";
          ctx.stroke();
          ctx.fillStyle = "#475569";
          ctx.font = "11px system-ui";
          ctx.fillText("lamp", bx - 14, by + 34);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label="Rotation speed" value={rpm} min={0} max={180} step={5} hex={a} accent={at} unit=" rpm" onChange={setRpm} />
        <Slider label="Coil turns" value={turns} min={20} max={200} step={10} hex={a} accent={at} onChange={setTurns} />
        <Slider label="Field strength" value={field} min={0.1} max={0.6} step={0.05} hex={a} accent={at} unit=" T" onChange={setField} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Lamp connected" checked={load} onChange={setLoad} hex={a} hint="load glows with the AC" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Peak voltage" value={`${peak.toFixed(0)} V`} accent={at} />
        <Stat label="Current voltage" value={`${vOut.toFixed(0)} V`} accent={at} />
        <Stat label="Type" value="alternating (AC)" accent={at} />
      </div>
    </SimShell>
  );
}

export function PhotoelectricSim({ topic }: { topic?: string }) {
  const a = "#a855f7";
  const at = "text-fuchsia-600 dark:text-fuchsia-400";
  const metals: [string, number][] = [
    ["Cs", 2.14],
    ["Na", 2.28],
    ["K", 2.3],
    ["Zn", 4.3],
    ["Cu", 4.7],
  ];
  const [metalIdx, setMetalIdx] = useState(1);
  const [wavelength, setWavelength] = useState(450);
  const [intensity, setIntensity] = useState(50);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const phi = metals[metalIdx][1];
  const Eval = 1240 / wavelength;
  const freq = 3e8 / (wavelength * 1e-9);
  const emitted = Eval > phi;
  const ke = Math.max(0, Eval - phi);
  const stopping = emitted ? ke : 0;
  const threshold = Math.round(1240 / phi);
  const vmax = emitted ? Math.sqrt((2 * ke * 1.602e-19) / 9.109e-31) : 0;
  const current = emitted ? intensity : 0;
  const photons = Math.max(1, Math.round(intensity / 10));
  const lightColor = wavelengthColor(wavelength);
  return (
    <SimShell
      icon="ðŸ”¦"
      title={simTitle(topic, "Photoelectric effect")}
      accent="fuchsia"
      subtitle={`${topic ?? "Photoelectric effect"} and” photon energy E = hc/Î» must beat the metal's work function Ï† to free an electron.`}
      hint="Increasing brightness only frees more electrons (higher current); only shortening the wavelength increases each electron's kinetic energy and” intensity can't."
      controls={<SimChip accent="fuchsia"><span aria-hidden>ðŸ”¦</span>{topic ?? "photoelectric"}</SimChip>}
    >
      <SimCanvas
        deps={[wavelength, intensity, emitted, sim.tick, current, ke, lightColor, phi, freq]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const bg = ctx.createLinearGradient(0, h - 60, 0, 0);
          bg.addColorStop(0, "#e9d5ff");
          bg.addColorStop(1, "#faf5ff");
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, w, h - 60);
          ctx.fillStyle = "#c4b5fd";
          ctx.fillRect(0, h - 60, w, 60);
          ctx.fillStyle = "#6b21a8";
          ctx.font = "12px system-ui";
          ctx.fillText(`${metals[metalIdx][0]} plate Â· Ï† = ${phi.toFixed(2)} eV`, 20, h - 18);
          const lx = 30 + (sim.tick % 40);
          for (let i = 0; i < photons; i++) {
            const x = lx + i * 14;
            ctx.beginPath();
            ctx.arc(x, h / 2 - 60, 5, 0, Math.PI * 2);
            ctx.fillStyle = emitted ? lightColor : "#e2e8f0";
            ctx.fill();
          }
          ctx.fillStyle = lightColor;
          ctx.fillRect(60, h / 2 - 52, w - 120, 8);
          ctx.fillStyle = "#6b21a8";
          ctx.font = "11px system-ui";
          ctx.fillText(`Î» = ${wavelength} nm (f = ${(freq / 1e14).toFixed(2)} Ã—10Â¹â´ Hz)`, w - 240, h / 2 - 38);
          if (emitted) {
            const eCount = 2 + Math.round(intensity / 25);
            for (let i = 0; i < eCount; i++) {
              const x = 90 + i * 30 + (sim.tick % 30) * 1.5;
              ctx.beginPath();
              ctx.arc(x, h / 2 - 130, 6, 0, Math.PI * 2);
              ctx.fillStyle = "#facc15";
              ctx.fill();
            }
            ctx.fillStyle = "#a16207";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`electrons ejected! I = ${current.toFixed(0)} ÂµA`, 60, h / 2 - 150);
          } else {
            ctx.fillStyle = "#64748b";
            ctx.font = "12px system-ui";
            ctx.fillText("no electrons and” E < Ï†", 60, h / 2 - 150);
          }
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Wavelength" value={wavelength} min={200} max={800} step={5} hex={a} accent={at} unit=" nm" onChange={setWavelength} />
        <Slider label="Brightness" value={intensity} min={10} max={100} step={5} hex={a} accent={at} unit="%" onChange={setIntensity} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-foreground/60">Metal:</span>
        {metals.map(([name, phiV], i) => (
          <ActionButton key={name} label={`${name} ${phiV.toFixed(2)} eV`} hex={a} onClick={() => setMetalIdx(i)} />
        ))}
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Photon energy" value={`${Eval.toFixed(2)} eV`} accent={at} />
        <Stat label="Work function" value={`${phi.toFixed(2)} eV`} accent={at} />
        <Stat label="Stopping volt" value={`${stopping.toFixed(2)} V`} accent={at} />
        <Stat label="KE = E âˆ’ Ï†" value={`${ke.toFixed(2)} eV`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="v_max electron" value={`${(vmax / 1e5).toFixed(1)} Ã—10âµ m/s`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Threshold Î»â‚€" value={`${threshold} nm`} accent="text-amber-600 dark:text-amber-400" />
      </div>
    </SimShell>
  );
}

export function CircularMotionSim({ topic }: { topic?: string }) {
  const a = "#6366f1";
  const at = "text-indigo-600 dark:text-indigo-400";
  const [radius, setRadius] = useState(60);
  const [speed, setSpeed] = useState(40);
  const [mass, setMass] = useState(2);
  const [reverse, setReverse] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const dir = reverse ? -1 : 1;
  const [flight, setFlight] = useState<{ px: number; py: number; vx: number; vy: number; at: number } | null>(null);
  const omega = (speed * dir) / 60;
  const angle = sim.tick * omega;
  const ac = (speed * speed) / radius;
  const f = mass * ac;
  const period = (2 * Math.PI * radius) / speed;
  const angularV = speed / radius;
  const rpm = 60 / period;
  const omegaCheck = angularV * radius;
  const cx = 320;
  const cy = 125;
  const pos = flight
    ? { px: flight.px + flight.vx * (sim.tick - flight.at), py: flight.py + flight.vy * (sim.tick - flight.at) }
    : { px: cx + Math.cos(angle) * radius, py: cy + Math.sin(angle) * radius };
  return (
    <SimShell
      icon="â­•"
      title={simTitle(topic, "Circular motion")}
      accent="indigo"
      subtitle={`${topic ?? "Circular motion"} and” an object moving in a circle is always accelerating towards the centre: a_c = vÂ²/r.`}
      hint="The centripetal force is not a new force and” it is whatever keeps the object on the circle: the string, friction, gravity, or the road on a bend."
      controls={<SimChip accent="indigo"><span aria-hidden>â­•</span>{topic ?? "circular motion"}</SimChip>}
    >
      <SimCanvas
        deps={[radius, speed, mass, reverse, showVectors, sim.tick, flight]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(100,116,139,0.25)";
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          if (!flight) {
            ctx.strokeStyle = "#818cf8";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(pos.px, pos.py);
            ctx.stroke();
          }
          if (showVectors && !flight) {
            const vx = -Math.sin(angle) * 34;
            const vy = Math.cos(angle) * 34;
            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(pos.px, pos.py);
            ctx.lineTo(pos.px + vx, pos.py + vy);
            ctx.stroke();
            ctx.fillStyle = "#10b981";
            ctx.font = "11px system-ui";
            ctx.fillText("velocity", pos.px + vx + 4, pos.py + vy - 4);
            const cxp = pos.px - Math.cos(angle) * 42;
            const cyp = pos.py - Math.sin(angle) * 42;
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(pos.px, pos.py);
            ctx.lineTo(cxp, cyp);
            ctx.stroke();
            ctx.fillStyle = "#ef4444";
            ctx.font = "11px system-ui";
            ctx.fillText("centripetal", cxp - 34, cyp - 6);
          }
          ctx.fillStyle = "#4f46e5";
          ctx.beginPath();
          ctx.arc(pos.px, pos.py, 9, 0, Math.PI * 2);
          ctx.fill();
          if (flight) {
            ctx.fillStyle = "#dc2626";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("string broke and” flies off tangentially!", 30, 40);
          }
          ctx.fillStyle = "#312e81";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`a = ${ac.toFixed(1)} m/sÂ² Â· T = ${period.toFixed(1)} s`, 30, h - 12);
          ctx.fillStyle = "#475569";
          ctx.font = "12px system-ui";
          ctx.fillText(`Ï‰ = ${angularV.toFixed(2)} rad/s Â· v = Ï‰r = ${omegaCheck.toFixed(1)} m/s âœ“`, 30, 24);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label="Radius" value={radius} min={30} max={120} step={5} hex={a} accent={at} unit=" m" onChange={setRadius} />
        <Slider label="Speed" value={speed} min={5} max={100} step={5} hex={a} accent={at} unit=" m/s" onChange={setSpeed} />
        <Slider label="Mass" value={mass} min={1} max={10} step={1} hex={a} accent={at} unit=" kg" onChange={setMass} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <ActionButton
          label="Release string"
          icon="âœ‚ï¸"
          hex="#dc2626"
          disabled={flight !== null}
          onClick={() =>
            setFlight({
              px: pos.px,
              py: pos.py,
              vx: -Math.sin(angle) * (omega * radius),
              vy: Math.cos(angle) * (omega * radius),
              at: sim.tick,
            })
          }
        />
        <Toggle label="Reverse" checked={reverse} onChange={setReverse} hex={a} />
        <Toggle label="Show vectors" checked={showVectors} onChange={setShowVectors} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Centripetal accel" value={`${ac.toFixed(1)} m/sÂ²`} accent={at} />
        <Stat label="Centripetal force" value={`${f.toFixed(1)} N`} accent={at} />
        <Stat label="State" value={flight ? "flying free!" : "in orbit"} accent={at} />
        <Stat label="Period T" value={`${period.toFixed(1)} s`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Rotation" value={`${rpm.toFixed(1)} rpm`} accent="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Angular speed" value={`${angularV.toFixed(2)} rad/s`} accent="text-emerald-600 dark:text-emerald-400" />
      </div>
    </SimShell>
  );
}

