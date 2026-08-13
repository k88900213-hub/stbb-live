"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ACCENTS, SimChip, SimShell, simTitle, type SimAccent } from "./SimShell";
import { RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

type RateMode = "concentration" | "temperature" | "catalyst" | "surface";

const R = 8.314;
const EA = 50000;

function rateMode(topic?: string): RateMode {
  const t = topic?.toLowerCase() ?? "";
  if (/catalyst/.test(t)) return "catalyst";
  if (/temperature/.test(t)) return "temperature";
  if (/surface|particle size|powder|lump/.test(t)) return "surface";
  return "concentration";
}

interface RParticle {
  px: number;
  py: number;
  sx: number;
  sy: number;
  kind: "a" | "b";
  r: number;
}

function seed(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function bounce(v: number, lo: number, hi: number): number {
  const range = hi - lo;
  const m = ((v % (2 * range)) + 2 * range) % (2 * range);
  return lo + (m > range ? 2 * range - m : m);
}

function buildParts(nA: number, nB: number): RParticle[] {
  const list: RParticle[] = [];
  for (let i = 0; i < nA; i++) {
    list.push({
      px: seed(i * 2 + 1) * Math.PI * 2,
      py: seed(i * 2 + 2) * Math.PI * 2,
      sx: 0.7 + seed(i * 3 + 1) * 0.6,
      sy: 0.5 + seed(i * 3 + 2) * 0.5,
      kind: "a",
      r: 3,
    });
  }
  for (let i = 0; i < nB; i++) {
    const j = i + nA;
    list.push({
      px: seed(j * 2 + 1) * Math.PI * 2,
      py: seed(j * 2 + 2) * Math.PI * 2,
      sx: 0.7 + seed(j * 3 + 1) * 0.6,
      sy: 0.5 + seed(j * 3 + 2) * 0.5,
      kind: "b",
      r: 3,
    });
  }
  return list;
}

const BOX_X = 24;
const BOX_Y = 28;
const BOX_W = 326;
const BOX_H = 168;
const PX_MIN = 32;
const PX_MAX = BOX_X + BOX_W - 8;
const PY_MIN = 36;
const PY_MAX = BOX_Y + BOX_H - 8;
const PIXEL_SCALE = 44;
const WINDOW = 15;

export function RateOfReactionSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "teal";
  const a = ACCENTS[accent];
  const mode = rateMode(topic);

  const [conA, setConA] = useState(26);
  const [conB, setConB] = useState(26);
  const [tempC, setTempC] = useState(40);
  const [catalyst, setCatalyst] = useState(false);
  const [powder, setPowder] = useState(true);
  const [products, setProducts] = useState(0);
  const [collisions, setCollisions] = useState(0);
  const sim = useSim({ fps: 60, autoRun: false });

  const productsRef = useRef(0);
  const timeRef = useRef(0);
  const histRef = useRef<{ t: number; p: number }[]>([]);
  const flashRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const flashCountRef = useRef(0);
  const freqRef = useRef<{ t: number; n: number }[]>([]);

  const nA = Math.max(
    4,
    Math.min(
      70,
      mode === "surface" ? (powder ? Math.round(conA * 1.8) : Math.round(conA * 0.45)) : conA,
    ),
  );
  const nB = Math.max(4, conB);

  const parts = useMemo(() => buildParts(nA, nB), [nA, nB]);

  const T = tempC + 273;
  const speed = Math.sqrt(T / 313);
  const threshold = catalyst ? 1.0 : 1.9;
  const kRel = Math.exp((EA / R) * (1 / 298 - 1 / T));
  const catBoost = catalyst ? Math.exp(12000 / (R * T)) : 1;
  const surfFactor = mode === "surface" ? (powder ? 1 : 0.25) : 1;
  const rate = (10 * (nA * nB)) / 676 * surfFactor * catBoost * kRel;

  useEffect(() => {
    if (!sim.running) return;
    const id = setInterval(() => {
      timeRef.current += 1 / 60;
      productsRef.current += rate / 60;
      const p = productsRef.current;
      setProducts(p);
      histRef.current.push({ t: timeRef.current, p });
      if (histRef.current.length > 1500) histRef.current.shift();
      freqRef.current.push({ t: timeRef.current, n: flashCountRef.current });
      flashCountRef.current = 0;
      const cutoff = timeRef.current - 1;
      freqRef.current = freqRef.current.filter((e) => e.t > cutoff);
      setCollisions(freqRef.current.reduce((acc, e) => acc + e.n, 0));
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [sim.running, rate]);

  const sub = {
    concentration: topic
      ? `${topic} — more particles packed in, more collisions per second, faster reaction.`
      : "Concentration: packing more particles in the same space raises the collision frequency — the reaction speeds up. Mg + 2HCl -> MgCl2 + H2: more acid per litre, faster fizzing.",
    temperature: topic
      ? `${topic} — heat speeds every particle, and far more collisions now carry enough energy to react.`
      : "Temperature: heat speeds the particles and gives more of them the activation energy — a big rate jump for every 10 °C. N2 + 3H2 -> 2NH3 runs faster on heat.",
    catalyst: topic
      ? `${topic} — the catalyst opens an easier route with a lower activation energy.`
      : "A catalyst lowers the activation-energy hill, so far more collisions succeed — without being used up itself. Iron catalyses N2 + 3H2 -> 2NH3.",
    surface: topic
      ? `${topic} — powder exposes far more particles than one big lump, so the reaction races.`
      : "Surface area: grinding a solid into powder exposes more particles to collide — a faster reaction. CaCO3 + 2HCl -> CaCl2 + H2O + CO2 fizzes faster as powder than as a lump.",
  }[mode];

  const hint = `Arrhenius: rate ∝ e^(−Ea/RT), Ea = 50 kJ/mol. Every +10 °C roughly doubles k (now k = ${kRel.toFixed(1)}× vs 25 °C); a catalyst multiplies the rate by ${catBoost.toFixed(0)}×. Slide concentration, temperature, catalyst and surface area and watch collisions and rate change.`;

  const handleReset = () => {
    productsRef.current = 0;
    timeRef.current = 0;
    setProducts(0);
    histRef.current = [];
    flashRef.current = [];
    freqRef.current = [];
    flashCountRef.current = 0;
    setCollisions(0);
    sim.reset();
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    const t = sim.elapsed;

    ctx.fillStyle = "rgba(20,184,166,0.06)";
    ctx.beginPath();
    ctx.roundRect(BOX_X, BOX_Y, BOX_W, BOX_H, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(20,184,166,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const positions = parts.map((p) => ({
      x: bounce(p.px + t * speed * p.sx * PIXEL_SCALE, PX_MIN, PX_MAX),
      y: bounce(p.py + t * speed * p.sy * 0.8 * PIXEL_SCALE, PY_MIN, PY_MAX),
    }));

    const aIndices: number[] = [];
    const bIndices: number[] = [];
    parts.forEach((p, i) => {
      if (p.kind === "a") aIndices.push(i);
      else bIndices.push(i);
    });

    for (const ia of aIndices) {
      const pa = parts[ia];
      for (const ib of bIndices) {
        const pb = parts[ib];
        const dx = positions[ia].x - positions[ib].x;
        const dy = positions[ia].y - positions[ib].y;
        const d = pa.r + pb.r + 4;
        if (dx * dx + dy * dy < d * d) {
          const relV = Math.hypot(speed * (pa.sx - pb.sx), speed * 0.8 * (pa.sy - pb.sy));
          if (relV > threshold) {
            flashRef.current.push({ x: positions[ia].x + dx / 2, y: positions[ia].y + dy / 2, t });
            flashCountRef.current++;
          }
        }
      }
    }
    flashRef.current = flashRef.current.filter((e) => t - e.t < 0.35);
    for (const e of flashRef.current) {
      const age = t - e.t;
      ctx.strokeStyle = `rgba(20,184,166,${(0.4 * (1 - age / 0.35)).toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 9 + age * 55, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let i = 0; i < positions.length; i++) {
      ctx.fillStyle = parts[i].kind === "a" ? "#0d9488" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(positions[i].x, positions[i].y, parts[i].r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#0f766e";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("reactant A", BOX_X + 8, BOX_Y + 16);
    ctx.fillStyle = "#b45309";
    ctx.fillText("reactant B", BOX_X + 8, BOX_Y + 32);
    ctx.fillStyle = "#64748b";
    ctx.font = "11px sans-serif";
    ctx.fillText(
      `successful collisions need relative speed > ${threshold.toFixed(1)}${catalyst ? "  · catalyst lowers barrier" : ""}`,
      BOX_X + 8,
      BOX_Y + 48,
    );

    const gx = 372;
    const gy = 28;
    const gw = w - gx - 20;
    const gh = 168;

    ctx.strokeStyle = "rgba(20,184,166,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx + gw, gy + gh);
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx, gy);
    ctx.stroke();

    ctx.fillStyle = "#0f766e";
    ctx.font = "12px sans-serif";
    ctx.fillText("products vs time", gx + 8, gy + 12);

    const hist = histRef.current;
    if (hist.length > 1) {
      const tNow = hist[hist.length - 1].t;
      const t0 = Math.max(tNow - WINDOW, 0);
      const yMax = Math.max(Math.max(...hist.map((pt) => pt.p)) * 1.15, 5);
      ctx.strokeStyle = "#14b8a6";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      let started = false;
      for (const pt of hist) {
        if (pt.t < t0) continue;
        const px = gx + ((pt.t - t0) / WINDOW) * gw;
        const py = gy + gh - (pt.p / yMax) * gh;
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.fillStyle = "#0f766e";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`products = ${Math.round(productsRef.current)}`, gx, gy + gh + 18);
      ctx.font = "11px sans-serif";
      ctx.fillText(`rate = ${rate.toFixed(0)} /s (k = ${kRel.toFixed(1)}× vs 25 °C)`, gx, gy + gh + 32);
    }
  };

  return (
    <SimShell
      icon={<span>⚡</span>}
      title={simTitle(topic, "Rate of Reaction")}
      subtitle={sub}
      accent={accent}
      hint={hint}
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <RunControls running={sim.running} onToggle={sim.toggle} onReset={handleReset} hex={a.hex} />
        </>
      }
    >
      <SimCanvas draw={draw} deps={[sim.tick, nA, nB, speed, threshold, rate, kRel]} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Concentration of A" value={conA} min={4} max={60} step={1} hex={a.hex} accent={a.text} unit=" particles" onChange={setConA} />
        <Slider label="Concentration of B" value={conB} min={4} max={60} step={1} hex={a.hex} accent={a.text} unit=" particles" onChange={setConB} />
        <div className="sm:col-span-2">
          <Slider label="Temperature" value={tempC} min={0} max={100} step={1} hex={a.hex} accent={a.text} unit=" °C" onChange={setTempC} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Toggle
          label="Catalyst"
          hint={catalyst ? "added — activation energy lowered" : "not present"}
          checked={catalyst}
          onChange={setCatalyst}
          hex={a.hex}
        />
        <Toggle
          label="Solid reactant"
          hint={powder ? "powder — huge surface area" : "one lump — small surface area"}
          checked={powder}
          onChange={setPowder}
          hex={a.hex}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Reaction rate (Arrhenius)" value={`${rate.toFixed(0)} /s`} accent={a.text} />
        <Stat label="Successful collisions" value={`${collisions}/s`} accent={a.text} />
        <Stat label="Products formed" value={`${Math.round(products)}`} accent={a.text} />
        <Stat label="k vs 25 °C" value={`${kRel.toFixed(1)}×`} accent={a.text} />
      </div>
    </SimShell>
  );
}
