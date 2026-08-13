"use client";

import { useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

type GasMode = "boyle" | "charles" | "pressure";

const R = 8.314;
const MOLES = 0.1203;

const GASES = [
  { sym: "H₂", name: "hydrogen", M: 2.016 },
  { sym: "He", name: "helium", M: 4.003 },
  { sym: "CH₄", name: "methane", M: 16.04 },
  { sym: "N₂", name: "nitrogen", M: 28.01 },
  { sym: "O₂", name: "oxygen", M: 32.0 },
  { sym: "CO₂", name: "carbon dioxide", M: 44.01 },
];

function gasMode(topic?: string): GasMode {
  const t = topic?.toLowerCase() ?? "";
  if (/charles|volume.*temperature|temperature.*volume/.test(t)) return "charles";
  if (/gay-lussac|pressure.*temperature|temperature.*pressure/.test(t)) return "pressure";
  return "boyle";
}

interface ParticleCfg {
  phaseX: number;
  phaseY: number;
  freq: number;
  r: number;
}

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PARTICLES: ParticleCfg[] = (() => {
  const rnd = seededRandom(42);
  const arr: ParticleCfg[] = [];
  for (let i = 0; i < 40; i++) {
    arr.push({ phaseX: rnd() * 100, phaseY: rnd() * 100, freq: 0.5 + rnd() * 0.8, r: 2.2 + rnd() * 1.2 });
  }
  return arr;
})();

function tri(t: number): number {
  const q = ((t % 1) + 1) % 1;
  return q < 0.5 ? q * 2 : 2 - q * 2;
}

export function GasLawsSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "amber";
  const a = ACCENTS[accent];
  const mode = gasMode(topic);

  const [pressure, setPressure] = useState(100);
  const [tempC, setTempC] = useState(27);
  const [gas, setGas] = useState(3);
  const [combined, setCombined] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul, autoRun: false });

  const T = tempC + 273;
  const g = GASES[gas];
  const nRT = MOLES * R * T;

  let V: number;
  let PShow: number;
  let invLabel: string;
  let invValue: string;
  if (mode === "pressure") {
    V = 3;
    PShow = nRT / 3;
    invLabel = "P / T = nR / V";
    invValue = `${((PShow / T) * 1000).toFixed(2)} ×10⁻³ kPa/K`;
  } else if (mode === "charles" && !combined) {
    V = nRT / 100;
    PShow = 100;
    invLabel = "V / T = nR / P";
    invValue = `${((V / T) * 1000).toFixed(2)} ×10⁻³ L/K`;
  } else {
    V = nRT / pressure;
    PShow = pressure;
    invLabel = "P·V / T = nR";
    invValue = `${((PShow * V) / T).toFixed(3)} kPa·L/K`;
  }

  const M_kg = g.M / 1000;
  const meanSpeed = Math.sqrt((3 * R * T) / M_kg);
  const speedFactor = meanSpeed / 484;
  const massG = MOLES * g.M;

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const x0 = 40;
    const y0 = 45;
    const innerH = 140;
    const innerW = Math.min(V / 12, 1) * 330;

    const grad = ctx.createLinearGradient(x0, 0, x0 + innerW, 0);
    grad.addColorStop(0, "rgba(245,158,11,0.10)");
    grad.addColorStop(1, "rgba(245,158,11,0.02)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x0, y0, innerW, innerH, 6);
    ctx.fill();

    ctx.strokeStyle = "rgba(245,158,11,0.85)";
    ctx.lineWidth = 3;
    ctx.strokeRect(x0, y0, innerW, innerH);

    const pistonX = x0 + innerW;
    ctx.fillStyle = "rgba(120,53,15,0.85)";
    ctx.fillRect(pistonX - 3, y0 - 6, 10, innerH + 12);

    const t = sim.tick / 30;
    const count = Math.max(3, Math.min(40, Math.round((40 * V) / 3)));
    ctx.fillStyle = "#f59e0b";
    for (let i = 0; i < count; i++) {
      const p = PARTICLES[i];
      const freq = p.freq * speedFactor;
      const px = x0 + 8 + tri(t * freq + p.phaseX) * (innerW - 16);
      const py = y0 + 8 + tri(t * freq * 0.83 + p.phaseY) * (innerH - 16);
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#b45309";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${V.toFixed(2)} L`, pistonX + 34, y0 + innerH / 2);
    ctx.textAlign = "left";

    ctx.fillStyle = "#92400e";
    ctx.font = "11px sans-serif";
    ctx.fillText(`${count} molecules of ${g.sym}`, x0, y0 - 8);

    const gx = 392;
    const gy = 45;
    const gw = w - gx - 40;
    const gh = 168;
    ctx.strokeStyle = "rgba(245,158,11,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx + gw, gy + gh);
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx, gy);
    ctx.stroke();

    const plotY = (v: number, max: number) => gy + gh - (Math.min(v, max) / max) * gh;

    const label =
      mode === "boyle"
        ? "Boyle: P·V = nRT (T const)"
        : mode === "charles"
          ? "Charles: V = nRT/P (P const)"
          : "Gay-Lussac: P = nRT/V (V const)";
    ctx.fillStyle = "#b45309";
    ctx.font = "12px sans-serif";
    ctx.fillText(label, gx + 4, gy + 14);

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const n = 60;
    if (mode === "boyle" || combined) {
      const k = nRT;
      for (let i = 0; i <= n; i++) {
        const v = 0.5 + (i / n) * 11.5;
        const p = k / v;
        const px = gx + ((v - 0.5) / 11.5) * gw;
        const py = plotY(p, 440);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      const px = gx + ((Math.min(V, 12) - 0.5) / 11.5) * gw;
      const py = plotY(PShow, 440);
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#b45309";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("V (L) ->", gx + gw / 2, gy + gh + 16);
      ctx.textAlign = "left";
    } else if (mode === "charles") {
      for (let i = 0; i <= n; i++) {
        const t2 = 200 + (i / n) * 400;
        const v = (MOLES * R * t2) / 100;
        const px = gx + (i / n) * gw;
        const py = plotY(v, 6.5);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      const px = gx + ((T - 200) / 400) * gw;
      const py = plotY(V, 6.5);
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#b45309";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("T (K) ->", gx + gw / 2, gy + gh + 16);
      ctx.textAlign = "left";
    } else {
      for (let i = 0; i <= n; i++) {
        const t2 = 200 + (i / n) * 400;
        const p = (MOLES * R * t2) / 3;
        const px = gx + (i / n) * gw;
        const py = plotY(p, 220);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      const px = gx + ((T - 200) / 400) * gw;
      const py = plotY(PShow, 220);
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#b45309";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("T (K) ->", gx + gw / 2, gy + gh + 16);
      ctx.textAlign = "left";
    }

    ctx.fillStyle = "#b45309";
    ctx.font = "bold 12px sans-serif";
    const pv = PShow * V;
    ctx.fillText(`PV = ${pv.toFixed(1)} kPa·L  =  nRT = ${nRT.toFixed(1)} ✓`, 30, h - 8);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#92400e";
    ctx.fillText(
      `${MOLES.toFixed(3)} mol ${g.sym} (${g.name}) · mass ${massG.toFixed(2)} g · mean speed ${meanSpeed.toFixed(0)} m/s`,
      30,
      h - 22
    );
  };

  const sub = {
    boyle: topic
      ? `${topic} — squash the ${g.sym} gas and watch pressure climb; P·V stays equal to nRT.`
      : "Boyle's law: at constant temperature, P·V = nRT is fixed — squash the gas and pressure rises.",
    charles: topic
      ? `${topic} — heat the ${g.sym} gas and watch it expand at constant pressure.`
      : "Charles' law: at constant pressure, volume is proportional to temperature in kelvin.",
    pressure: topic
      ? `${topic} — heat the fixed-volume ${g.sym} gas and watch the pressure climb.`
      : "Gay-Lussac's law: at constant volume, pressure is proportional to temperature in kelvin.",
  }[mode];

  const hint =
    "All ideal gases obey PV = nRT with R = 8.314 J/(mol·K). At the same P, V, T every gas holds the same amount of gas (Avogadro) — but heavy molecules travel slower, v = √(3RT/M).";

  const pvSolverShown = mode === "boyle" || combined;
  const tempShown = mode !== "boyle" || combined;

  return (
    <SimShell
      icon={<span>▦</span>}
      title={simTitle(topic, "Gas Laws")}
      subtitle={sub}
      accent={accent}
      hint={hint}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[sim.tick, V, PShow, T, mode, g, combined]} />

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a.hex} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-stone-600 dark:text-stone-300">Gas:</span>
        {GASES.map((gg, i) => (
          <ActionButton key={gg.sym} label={gg.sym} hex={i === gas ? a.hex : "#94a3b8"} onClick={() => setGas(i)} title={gg.name} />
        ))}
        <Toggle label="Combined gas law (P, V, T live)" checked={combined} onChange={setCombined} hex={a.hex} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {pvSolverShown && (
          <Slider label="Pressure (P)" value={pressure} min={50} max={400} step={5} hex={a.hex} accent={a.text} unit=" kPa" onChange={setPressure} />
        )}
        {tempShown && (
          <Slider label="Temperature" value={tempC} min={-73} max={327} step={1} hex={a.hex} accent={a.text} unit=" °C" onChange={setTempC} />
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Pressure" value={`${PShow.toFixed(1)} kPa`} accent={a.text} />
        <Stat label="Volume" value={`${V.toFixed(2)} L`} accent={a.text} />
        <Stat label="Temperature" value={`${T} K (${tempC} °C)`} accent={a.text} />
        <Stat label="Mean speed" value={`${meanSpeed.toFixed(0)} m/s`} accent={a.text} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Moles (n)" value={`${MOLES.toFixed(3)} mol`} accent={a.text} />
        <Stat label="Mass" value={`${massG.toFixed(2)} g`} accent={a.text} />
        <Stat label="Invariant" value={`${invLabel}`} accent={a.text} />
        <Stat label="Value" value={`${invValue}`} accent={a.text} />
      </div>
    </SimShell>
  );
}
