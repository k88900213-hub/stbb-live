"use client";

import { useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";
import { AcDcSim } from "./PhysicsLabs3";

type Point = { x: number; y: number };

const R_BULB = 5;

function buildSeriesLoop(): Point[] {
  return [
    { x: 320, y: 45 },
    { x: 460, y: 45 },
    { x: 460, y: 210 },
    { x: 180, y: 210 },
    { x: 180, y: 45 },
    { x: 320, y: 45 },
  ];
}

function buildParallelLoops(): Point[][] {
  return [
    [
      { x: 320, y: 45 },
      { x: 250, y: 45 },
      { x: 250, y: 210 },
      { x: 355, y: 210 },
      { x: 355, y: 60 },
      { x: 345, y: 60 },
      { x: 320, y: 60 },
      { x: 320, y: 45 },
    ],
    [
      { x: 320, y: 45 },
      { x: 390, y: 45 },
      { x: 390, y: 210 },
      { x: 355, y: 210 },
      { x: 355, y: 60 },
      { x: 345, y: 60 },
      { x: 320, y: 60 },
      { x: 320, y: 45 },
    ],
  ];
}

function polylineLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len;
}

function pointAt(points: Point[], frac: number): Point {
  const total = polylineLength(points);
  let target = ((frac % 1) + 1) % 1 * total;
  for (let i = 1; i < points.length; i++) {
    const seg = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    if (target <= seg) {
      const t = seg === 0 ? 0 : target / seg;
      return { x: points[i - 1].x + (points[i].x - points[i - 1].x) * t, y: points[i - 1].y + (points[i].y - points[i - 1].y) * t };
    }
    target -= seg;
  }
  return points[0];
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawWireLoop(ctx: CanvasRenderingContext2D, pts: Point[]) {
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.stroke();
}

function drawBulb(ctx: CanvasRenderingContext2D, x: number, y: number, brightness: number, label: string, sub?: string) {
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.stroke();
  if (brightness > 0.02) {
    const g = ctx.createRadialGradient(x, y, 2, x, y, 22);
    g.addColorStop(0, `rgba(253,186,116,${0.35 + brightness * 0.45})`);
    g.addColorStop(1, "rgba(253,186,116,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  const r = Math.round(brightness * 255);
  ctx.fillStyle = `rgb(${Math.min(255, 200 + r * 0.2)},${Math.min(200, 120 + r * 0.25)},${Math.min(160, 60 + r * 0.2)})`;
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#64748b";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`bulb ${label}`, x, y + 34);
  if (sub) {
    ctx.fillStyle = "#0f766e";
    ctx.font = "10px sans-serif";
    ctx.fillText(sub, x, y + 48);
  }
  ctx.textAlign = "left";
}

function drawBattery(ctx: CanvasRenderingContext2D, voltage: number) {
  ctx.strokeStyle = "#14b8a6";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  line(ctx, 320, 45, 320, 60);
  line(ctx, 355, 60, 355, 100);
  line(ctx, 355, 140, 355, 210);
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 3;
  line(ctx, 348, 100, 362, 100);
  ctx.lineWidth = 5;
  line(ctx, 344, 140, 366, 140);
  ctx.fillStyle = "#0f766e";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("+", 320, 40);
  ctx.fillText(`${voltage} V`, 385, 175);
  ctx.textAlign = "left";
}

function drawSwitch(ctx: CanvasRenderingContext2D, x: number, y: number, closed: boolean) {
  ctx.strokeStyle = "#14b8a6";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.fillStyle = "#14b8a6";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(closed ? x + 10 : x + 9, closed ? y : y - 14);
  ctx.stroke();
  ctx.fillStyle = closed ? "#14b8a6" : "#d6d3d1";
  ctx.beginPath();
  ctx.arc(x + 10, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawElectrons(ctx: CanvasRenderingContext2D, loops: Point[][], offset: number) {
  for (const loop of loops) {
    for (let i = 0; i < 10; i++) {
      const p = pointAt(loop, offset + i / 10);
      const g = ctx.createRadialGradient(p.x, p.y, 0.5, p.x, p.y, 5);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(0.45, "#2dd4bf");
      g.addColorStop(1, "#0d9488");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

type CircuitMode = "series" | "potential" | "acdc" | "ohm" | "resistivity" | "power" | "materials" | "diode" | "rectify" | "transistor";

function circuitMode(topic?: string): CircuitMode {
  const t = topic?.toLowerCase() ?? "";
  if (/diode/.test(t)) return "diode";
  if (/rectif|led/.test(t)) return "rectify";
  if (/transistor/.test(t)) return "transistor";
  if (/conductor|insulator/.test(t)) return "materials";
  if (/potential|difference/.test(t)) return "potential";
  if (/ohm/.test(t)) return "ohm";
  if (/resistiv/.test(t)) return "resistivity";
  if (/power|joule/.test(t)) return "power";
  if (/alternating|direct and alternating/.test(t)) return "acdc";
  return "series";
}

export function CircuitBuilder({ topic }: { topic?: string }) {
  const mode = circuitMode(topic);
  if (mode === "potential") return <PotentialView topic={topic} />;
  if (mode === "acdc") return <AcDcSim topic={topic} />;
  if (mode === "ohm") return <OhmView topic={topic} />;
  if (mode === "resistivity") return <ResistivityView topic={topic} />;
  if (mode === "power") return <PowerView topic={topic} />;
  if (mode === "materials") return <MaterialsView topic={topic} />;
  if (mode === "diode") return <DiodeView topic={topic} />;
  if (mode === "rectify") return <RectifyView topic={topic} />;
  if (mode === "transistor") return <TransistorView topic={topic} />;
  return <SeriesView topic={topic} />;
}

function SeriesView({ topic }: { topic?: string }) {
  const accent: SimAccent = "teal";
  const a = ACCENTS[accent];
  const [voltage, setVoltage] = useState(9);
  const [res, setRes] = useState(R_BULB);
  const [closed, setClosed] = useState(true);
  const [layout, setLayout] = useState<"series" | "parallel">("series");
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });

  const series = layout === "series";
  const loops = series ? [buildSeriesLoop()] : buildParallelLoops();
  const rTotal = series ? 2 * res : res / 2;
  const iTotal = closed ? voltage / rTotal : 0;
  const iA = closed ? (series ? iTotal : voltage / res) : 0;
  const iB = closed ? (series ? iTotal : voltage / res) : 0;
  const vA = closed ? (series ? voltage / 2 : voltage) : 0;
  const vB = closed ? (series ? voltage / 2 : voltage) : 0;
  const pA = iA * vA;
  const pB = iB * vB;
  const pRef = Math.pow(12, 2) / 5;
  const bA = closed ? Math.min(Math.sqrt(pA / pRef), 1) : 0;
  const bB = closed ? Math.min(Math.sqrt(pB / pRef), 1) : 0;
  const offset = sim.tick / 30 * (closed ? Math.min(Math.max(iTotal, 0.5), 3) : 0);
  const bulbA: Point = series ? { x: 230, y: 45 } : { x: 250, y: 128 };
  const bulbB: Point = series ? { x: 410, y: 45 } : { x: 390, y: 128 };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    ctx.strokeStyle = "rgba(20,184,166,0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 640; x += 50) line(ctx, x, 0, x, 250);
    for (let y = 0; y <= 250; y += 40) line(ctx, 0, y, 640, y);
    ctx.strokeStyle = "#14b8a6";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (const loop of loops) drawWireLoop(ctx, loop);
    if (closed) drawElectrons(ctx, loops, offset);
    drawSwitch(ctx, 345, 60, closed);
    drawBattery(ctx, voltage);
    drawBulb(ctx, bulbA.x, bulbA.y, bA, "A", `${vA.toFixed(1)} V · ${pA.toFixed(1)} W`);
    drawBulb(ctx, bulbB.x, bulbB.y, bB, "B", `${vB.toFixed(1)} V · ${pB.toFixed(1)} W`);
    ctx.fillStyle = "#0f766e";
    ctx.font = "11px sans-serif";
    ctx.fillText(
      series
        ? "One path — same current through both bulbs; voltages share the battery"
        : "Two paths — current splits at the junction; each bulb sees full voltage",
      20,
      22,
    );
  };

  return (
    <SimShell
      icon={<span>◯</span>}
      title={simTitle(topic, "Circuit Builder")}
      subtitle={
        topic
          ? `${topic} — close the switch and watch electrons flow around the loop.`
          : "Close the switch and watch electrons flow around the loop."
      }
      accent={accent}
      hint={
        series
          ? "In series each bulb shares the voltage, so V = V_A + V_B (Kirchhoff's loop law) and R_total = R + R. Parallel: I = I_A + I_B (junction law) and R_total = R/2."
          : "In parallel every bulb sees the full battery voltage. If one branch fails, the others stay lit — just like household wiring."
      }
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Series" icon="⧉" onClick={() => setLayout("series")} hex={series ? a.hex : "#94a3b8"} />
            <ActionButton label="Parallel" icon="≣" onClick={() => setLayout("parallel")} hex={series ? "#94a3b8" : a.hex} />
          </div>
        </>
      }
    >
      <SimCanvas draw={draw} deps={[sim.tick, closed, layout, voltage, res]} />
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a.hex} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Battery voltage" value={voltage} min={1.5} max={12} step={0.5} hex={a.hex} accent={a.text} unit=" V" onChange={setVoltage} />
        <Slider label="Bulb resistance" value={res} min={1} max={20} step={1} hex={a.hex} accent={a.text} unit=" Ω" onChange={setRes} />
      </div>
      <div className="mt-4">
        <Toggle label="Switch" hint={closed ? "closed — current flows" : "open — circuit broken"} checked={closed} onChange={setClosed} hex={a.hex} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="R total" value={`${series ? "2R = " : "R/2 = "}${rTotal.toFixed(1)} Ω`} />
        <Stat label="I total (V/R)" value={`${iTotal.toFixed(2)} A`} />
        <Stat label="V across bulb A" value={`${vA.toFixed(1)} V`} />
        <Stat label="V across bulb B" value={`${vB.toFixed(1)} V`} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="P bulb A (I²R)" value={`${pA.toFixed(2)} W`} />
        <Stat label="P bulb B (I²R)" value={`${pB.toFixed(2)} W`} />
        <Stat label="Kirchhoff" value={series ? `ΣV = ${(vA + vB).toFixed(1)} V ✓` : `ΣI = ${(iA + iB).toFixed(2)} A ✓`} />
        <Stat label="Brightness" value={!closed ? "off" : series ? "split — dimmer" : "full — bright"} />
      </div>
    </SimShell>
  );
}

function PotentialView({ topic }: { topic?: string }) {
  const accent: SimAccent = "teal";
  const a = ACCENTS[accent];
  const [hA, setHA] = useState(6);
  const [hB, setHB] = useState(2);
  const sim = useSim({ fps: 20 });
  const pd = Math.max(hA - hB, 0);
  const arrows = pd > 0 ? 3 + Math.round(pd * 0.7) : 0;
  const levelA = 210 - (20 + (hA / 10) * 140);
  const levelB = 210 - (20 + (hB / 10) * 140);

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    const sh = 0.6 + 0.4 * Math.abs(Math.sin(sim.tick / 20));
    ctx.fillStyle = "#14b8a6";
    ctx.fillRect(63, levelA, 134, 210 - levelA);
    ctx.fillStyle = "#14b8a6";
    ctx.globalAlpha = 0.45;
    ctx.fillRect(443, levelB, 134, 210 - levelB);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#14b8a6";
    ctx.globalAlpha = 0.85;
    ctx.fillRect(200, 205, 240, 10);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 40, 140, 170);
    ctx.strokeRect(440, 40, 140, 170);
    ctx.fillStyle = "#fff";
    for (let i = 0; i < arrows; i++) {
      const wave = pd > 0 ? Math.sin(sim.tick / 20 + i * 1.3) * sh * 2.5 : 0;
      const ax = 226 + i * 38;
      const ay = 210 - wave;
      ctx.beginPath();
      ctx.moveTo(ax, ay + 6);
      ctx.lineTo(ax + 14, ay + 6);
      ctx.lineTo(ax + 9, ay);
      ctx.lineTo(ax + 14, ay + 6);
      ctx.lineTo(ax + 9, ay + 12);
      ctx.stroke();
    }
    ctx.fillStyle = "#0f766e";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("high", 130, 32);
    ctx.fillText("low", 510, 32);
    ctx.font = "12px sans-serif";
    ctx.fillText(`${hA.toFixed(1)} V`, 130, 242);
    ctx.fillText(`${hB.toFixed(1)} V`, 510, 242);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◯</span>}
      title={simTitle(topic, "Potential difference")}
      subtitle="Potential difference is the electric &ldquo;height&rdquo; that pushes charge around. A taller column means a bigger push and a stronger current."
      hint="Just as water flows from a high tank to a low one, charge flows from high potential to low potential. The battery&apos;s voltage is this electric height difference."
      accent={accent}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[sim.tick, hA, hB, pd]} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="High potential" value={hA} min={0} max={10} step={0.5} hex={a.hex} accent={a.text} unit=" V" onChange={setHA} />
        <Slider label="Low potential" value={hB} min={0} max={10} step={0.5} hex={a.hex} accent={a.text} unit=" V" onChange={setHB} />
      </div>
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} hex={a.hex} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Potential difference" value={`${pd.toFixed(1)} V`} />
        <Stat label="Current flow" value={pd > 0 ? `strong (${arrows} arrows)` : "none — equal heights"} />
      </div>
    </SimShell>
  );
}

function OhmView({ topic }: { topic?: string }) {
  const accent: SimAccent = "teal";
  const a = ACCENTS[accent];
  const [v, setV] = useState(6);
  const R = 10;
  const I = v / R;
  const px = 60 + (I / 1.5) * 500;
  const py = 220 - (v / 12) * 180;

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 2;
    line(ctx, 60, 220, 560, 220);
    line(ctx, 60, 30, 60, 220);
    ctx.strokeStyle = a.hex;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    line(ctx, 60, 220, 540, 40);
    ctx.fillStyle = a.hex;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = a.hex;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f766e";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`V vs I for R = ${R} Ω — a straight line`, 320, 20);
    ctx.fillText("current I (A) →", 540, 240);
    ctx.fillText("voltage V (V) →", 30, 60);
    ctx.fillStyle = a.hex;
    ctx.font = "11px sans-serif";
    ctx.fillText(`I = ${I.toFixed(2)} A`, 320, 60);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◯</span>}
      title={simTitle(topic, "Ohm's law")}
      subtitle="Increase the voltage and the current rises in a straight line — the ratio V/I stays the same while the resistance is fixed."
      hint="Ohm&apos;s law: V = I·R. With R fixed at 10 Ω the graph of I against V is a perfect straight line through the origin — that is what a linear resistor looks like."
      accent={accent}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[v]} />
      <div className="mt-4">
        <Slider label="Voltage" value={v} min={0} max={12} step={0.5} hex={a.hex} accent={a.text} unit=" V" onChange={setV} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Current" value={`${I.toFixed(2)} A`} />
        <Stat label="Resistance" value={`${R} Ω`} />
        <Stat label="V / I" value={`${(v / I).toFixed(1)} Ω`} />
      </div>
    </SimShell>
  );
}

const RHO: Record<string, number> = { copper: 1.7e-8, aluminium: 2.8e-8, iron: 9.7e-8, nichrome: 110e-8 };
const MATERIAL_ORDER = ["copper", "aluminium", "iron", "nichrome"];

function ResistivityView({ topic }: { topic?: string }) {
  const accent: SimAccent = "teal";
  const a = ACCENTS[accent];
  const [material, setMaterial] = useState("copper");
  const [len, setLen] = useState(2);
  const [area, setArea] = useState(1);
  const R = (RHO[material] * len) / (area * 1e-6);
  const i = 9 / R;
  const brightness = Math.min(i / 300, 1);
  const wireH = Math.max(6, Math.sqrt(area) * 12);
  const barW = 90 + len * 100;

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    const y = 130 - wireH / 2;
    ctx.fillStyle = a.hex;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(110, y, 400, wireH);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#334155";
    ctx.fillRect(98, y - 10, 24, wireH + 20);
    ctx.fillRect(498, y - 10, 24, wireH + 20);
    ctx.fillStyle = "#0f766e";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(110, 80, Math.min(barW, 400), 6);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#0f766e";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${len.toFixed(1)} m of ${material}`, 110 + Math.min(barW, 400) / 2, 74);
    ctx.fillText(`cross-section ${area.toFixed(1)} mm²`, 320, 196);
    ctx.fillStyle = a.hex;
    ctx.font = "14px sans-serif";
    ctx.font = "700 14px sans-serif";
    ctx.fillText(`R = ${R.toPrecision(2)} Ω`, 440, 196);
    const glow = brightness > 0.02;
    ctx.beginPath();
    ctx.arc(320, 232, 14, 0, Math.PI * 2);
    ctx.fillStyle = glow ? "#f59e0b" : "#64748b";
    ctx.globalAlpha = 0.3 + brightness * 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(320, 232, 8, 0, Math.PI * 2);
    ctx.fillStyle = glow ? "#fbbf24" : "#94a3b8";
    ctx.fill();
    ctx.fillStyle = "#0f766e";
    ctx.font = "11px sans-serif";
    ctx.fillText(`bulb: ${brightness > 0.5 ? "bright" : brightness > 0.05 ? "dim" : "off"}`, 320, 248);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◯</span>}
      title={simTitle(topic, "Resistivity")}
      subtitle="Resistance depends on the wire: longer wires and thinner wires resist more, and the material&apos;s resistivity sets how good a conductor it is."
      hint="R = ρ·L/A. A long thin nichrome wire has far more resistance than a short thick copper one. Resistivity ρ is a property of the material itself."
      accent={accent}
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <div className="flex flex-wrap gap-1.5">
            {MATERIAL_ORDER.map((m) => (
              <ActionButton key={m} label={m} onClick={() => setMaterial(m)} hex={material === m ? a.hex : "#94a3b8"} />
            ))}
          </div>
        </>
      }
    >
      <SimCanvas draw={draw} deps={[material, len, area]} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Length" value={len} min={0.5} max={4} step={0.5} hex={a.hex} accent={a.text} unit=" m" onChange={setLen} />
        <Slider label="Cross-section area" value={area} min={0.5} max={4} step={0.5} hex={a.hex} accent={a.text} unit=" mm²" onChange={setArea} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Resistance" value={`${R.toPrecision(2)} Ω`} />
        <Stat label="Current" value={`${i.toFixed(1)} A`} />
        <Stat label="Formula" value="R = ρL / A" />
      </div>
    </SimShell>
  );
}

function PowerView({ topic }: { topic?: string }) {
  const accent: SimAccent = "teal";
  const a = ACCENTS[accent];
  const [v, setV] = useState(9);
  const [r, setR] = useState(5);
  const I = v / r;
  const P = v * I;
  const heat = I * I * r;
  const glow = Math.min(P / 60, 1);
  const flameH = Math.min(20 + heat * 3, 70);

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    line(ctx, 120, 150, 150, 150);
    line(ctx, 150, 150, 150, 190);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 7;
    line(ctx, 150, 190, 150, 205);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    line(ctx, 150, 205, 150, 220);
    line(ctx, 150, 220, 220, 220);
    ctx.strokeStyle = a.hex;
    ctx.beginPath();
    ctx.moveTo(220, 220);
    ctx.lineTo(230, 190);
    ctx.lineTo(250, 250);
    ctx.lineTo(270, 190);
    ctx.lineTo(290, 250);
    ctx.lineTo(310, 190);
    ctx.lineTo(330, 250);
    ctx.lineTo(350, 190);
    ctx.lineTo(370, 250);
    ctx.lineTo(380, 220);
    ctx.stroke();
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    line(ctx, 380, 220, 450, 220);
    line(ctx, 450, 220, 450, 150);
    line(ctx, 450, 150, 480, 150);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(300, 150, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = glow > 0.02 ? "#fbbf24" : "#94a3b8";
    ctx.globalAlpha = 0.35 + glow * 0.65;
    ctx.beginPath();
    ctx.arc(300, 150, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f97316";
    ctx.globalAlpha = 0.7 + glow * 0.3;
    ctx.beginPath();
    ctx.moveTo(300, 120 - flameH);
    ctx.quadraticCurveTo(285, 150 - flameH * 0.7, 300, 150);
    ctx.quadraticCurveTo(315, 150 - flameH * 0.7, 300, 120 - flameH);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = a.hex;
    ctx.font = "700 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`P = ${P.toFixed(1)} W`, 300, 52);
    ctx.fillStyle = "#0f766e";
    ctx.font = "11px sans-serif";
    ctx.fillText("heat grows with I²R", 300, 68);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◯</span>}
      title={simTitle(topic, "Electrical power")}
      subtitle="Crank up the voltage or lower the resistance and the power — and the heat — grow quickly."
      hint="P = V·I = I²·R = V²/R. Doubling the voltage quadruples the power because I also rises. That is why high-voltage lines use less current."
      accent={accent}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[v, r]} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Voltage" value={v} min={1} max={20} step={0.5} hex={a.hex} accent={a.text} unit=" V" onChange={setV} />
        <Slider label="Resistance" value={r} min={1} max={20} step={1} hex={a.hex} accent={a.text} unit=" Ω" onChange={setR} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Power" value={`${P.toFixed(1)} W`} />
        <Stat label="Current" value={`${I.toFixed(2)} A`} />
        <Stat label="I²R heat" value={`${heat.toFixed(1)} W`} />
      </div>
    </SimShell>
  );
}

const MATERIALS = [
  { name: "Copper", type: "conductor", color: "#f59e0b" },
  { name: "Iron", type: "conductor", color: "#94a3b8" },
  { name: "Graphite", type: "semiconductor", color: "#475569" },
  { name: "Silicon", type: "semiconductor", color: "#64748b" },
  { name: "Plastic", type: "insulator", color: "#f472b6" },
  { name: "Glass", type: "insulator", color: "#a5f3fc" },
  { name: "Rubber", type: "insulator", color: "#a3e635" },
];

function MaterialsView({ topic }: { topic?: string }) {
  const accent: SimAccent = "teal";
  const a = ACCENTS[accent];
  const [sel, setSel] = useState("Copper");
  const m = MATERIALS.find((x) => x.name === sel)!;
  const brightness = m.type === "conductor" ? 1 : m.type === "semiconductor" ? 0.4 : 0;

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    line(ctx, 320, 250, 320, 210);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 7;
    line(ctx, 320, 210, 320, 195);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    line(ctx, 320, 195, 320, 180);
    line(ctx, 320, 180, 320, 120);
    line(ctx, 320, 120, 180, 120);
    ctx.fillStyle = m.color;
    ctx.strokeRect(90, 108, 90, 24);
    ctx.fillRect(90, 108, 90, 24);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    line(ctx, 90, 120, 50, 120);
    line(ctx, 50, 120, 50, 250);
    line(ctx, 50, 250, 180, 250);
    line(ctx, 180, 250, 320, 250);
    ctx.fillStyle = "#0f766e";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(m.name, 320, 60);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = m.type === "conductor" ? "#059669" : m.type === "semiconductor" ? "#d97706" : "#dc2626";
    ctx.fillText(`${m.type} — bulb ${brightness === 0 ? "off" : brightness > 0.6 ? "bright" : "dim"}`, 320, 80);
    ctx.beginPath();
    ctx.arc(470, 120, 18, 0, Math.PI * 2);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = brightness > 0.02 ? "#fbbf24" : "#94a3b8";
    ctx.globalAlpha = 0.35 + brightness * 0.65;
    ctx.beginPath();
    ctx.arc(470, 120, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    line(ctx, 470, 150, 470, 250);
    line(ctx, 470, 250, 320, 250);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◯</span>}
      title={simTitle(topic, "Materials in a circuit")}
      subtitle="Put a material in the gap and see whether the bulb lights: conductors pass current easily, semiconductors poorly, insulators not at all."
      hint="Metals conduct because free electrons roam between atoms. Semiconductors need a small energy nudge; insulators hold their electrons tightly — no bulb."
      accent={accent}
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <div className="flex flex-wrap gap-1.5">
            {MATERIALS.map((x) => (
              <ActionButton key={x.name} label={x.name} onClick={() => setSel(x.name)} hex={sel === x.name ? a.hex : "#94a3b8"} />
            ))}
          </div>
        </>
      }
    >
      <SimCanvas draw={draw} deps={[sel]} />
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Material" value={m.name} />
        <Stat label="Type" value={m.type} />
        <Stat label="Bulb" value={brightness === 0 ? "off" : brightness > 0.6 ? "bright" : "dim"} />
      </div>
    </SimShell>
  );
}

function DiodeView({ topic }: { topic?: string }) {
  const accent: SimAccent = "teal";
  const a = ACCENTS[accent];
  const [fwd, setFwd] = useState(true);
  const [v, setV] = useState(9);
  const I = fwd ? v / 5 : 0;
  const brightness = Math.min(I / 2.5, 1);

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    line(ctx, 320, 250, 320, 210);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 7;
    line(ctx, 320, 210, 320, 195);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    line(ctx, 320, 195, 320, 180);
    line(ctx, 320, 180, 320, 120);
    line(ctx, 320, 120, 210, 120);
    ctx.fillStyle = a.hex;
    ctx.beginPath();
    ctx.moveTo(210, 140);
    ctx.lineTo(250, 120);
    ctx.lineTo(210, 100);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 4;
    line(ctx, 262, 106, 262, 134);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    line(ctx, 262, 120, 340, 120);
    line(ctx, 340, 120, 340, 250);
    line(ctx, 340, 250, 320, 250);
    ctx.fillStyle = "#0f766e";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(fwd ? "Forward bias — current flows" : "Reverse bias — current blocked", 300, 60);
    ctx.font = "11px sans-serif";
    ctx.fillText("diode ▲|", 330, 70);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(480, 120, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = brightness > 0.02 ? "#fbbf24" : "#94a3b8";
    ctx.globalAlpha = 0.35 + brightness * 0.65;
    ctx.beginPath();
    ctx.arc(480, 120, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 4;
    line(ctx, 480, 150, 480, 250);
    line(ctx, 480, 250, 320, 250);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◯</span>}
      title={simTitle(topic, "Semiconductor diode")}
      subtitle="A diode lets current through in one direction only. Flip it around and the bulb stays dark."
      hint="In forward bias the diode&apos;s junction conducts; in reverse bias it blocks. This one-way gate is the heart of rectifiers and LED circuits."
      accent={accent}
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Forward bias" icon="→" onClick={() => setFwd(true)} hex={fwd ? a.hex : "#94a3b8"} />
            <ActionButton label="Reverse bias" icon="←" onClick={() => setFwd(false)} hex={fwd ? "#94a3b8" : a.hex} />
          </div>
        </>
      }
    >
      <SimCanvas draw={draw} deps={[fwd, v]} />
      <div className="mt-4">
        <Slider label="Battery voltage" value={v} min={1} max={12} step={0.5} hex={a.hex} accent={a.text} unit=" V" onChange={setV} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Current" value={`${I.toFixed(2)} A`} />
        <Stat label="Bulb" value={brightness > 0.02 ? "lit" : "off"} />
      </div>
    </SimShell>
  );
}

function RectifyView({ topic }: { topic?: string }) {
  const accent: SimAccent = "teal";
  const a = ACCENTS[accent];
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const ph = sim.elapsed * 1.3;

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    ctx.strokeStyle = "#0f766e";
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    line(ctx, 20, 95, 620, 95);
    line(ctx, 20, 200, 620, 200);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = a.hex;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = 20 + i * 5.6;
      const y = 95 - Math.sin(i * 0.11 + ph) * 55;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = 20 + i * 5.6;
      const y = 200 - Math.max(Math.sin(i * 0.11 + ph), 0) * 55;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    const ledOn = Math.sin(ph) > 0.02;
    ctx.fillStyle = ledOn ? "#fbbf24" : "#64748b";
    ctx.globalAlpha = ledOn ? 0.9 : 0.4;
    ctx.beginPath();
    ctx.arc(300, 230, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#0f766e";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("AC in — full sine wave", 120, 40);
    ctx.fillText("After the diode — only positive halves", 120, 148);
    ctx.fillText(`LED ${ledOn ? "on" : "off"}`, 330, 234);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◯</span>}
      title={simTitle(topic, "Rectification and LEDs")}
      subtitle="Feed AC through a diode and the negative half of each cycle is chopped off — that is how a rectifier turns AC into one-way pulses."
      hint="A diode only passes the positive half-cycle, leaving half-wave rectified current. LEDs light only in forward bias, so they blink on just the positive halves."
      accent={accent}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[sim.tick, speedMul]} />
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a.hex} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Input" value="AC — both halves" />
        <Stat label="Output" value="half-wave DC pulses" />
      </div>
    </SimShell>
  );
}

function TransistorView({ topic }: { topic?: string }) {
  const accent: SimAccent = "teal";
  const a = ACCENTS[accent];
  const [baseI, setBaseI] = useState(0.15);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const on = baseI > 0.1;
  const collectorI = on ? baseI * 100 : 0;
  const brightness = Math.min(collectorI / 30, 1);
  const loop: Point[] = [
    { x: 480, y: 45 },
    { x: 560, y: 45 },
    { x: 560, y: 215 },
    { x: 430, y: 215 },
    { x: 430, y: 130 },
  ];

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    line(ctx, 120, 130, 210, 130);
    line(ctx, 120, 130, 120, 90);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 6;
    line(ctx, 120, 90, 120, 75);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 3;
    line(ctx, 120, 75, 120, 60);
    ctx.fillStyle = "#0f766e";
    ctx.font = "11px sans-serif";
    ctx.fillText("base loop", 120, 150);
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(210, 130);
    ctx.lineTo(240, 130);
    ctx.lineTo(240, 90);
    ctx.lineTo(250, 110);
    ctx.lineTo(260, 90);
    ctx.lineTo(270, 110);
    ctx.lineTo(280, 90);
    ctx.lineTo(280, 130);
    ctx.lineTo(430, 130);
    ctx.stroke();
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 4;
    line(ctx, 210, 130, 240, 130);
    line(ctx, 222, 122, 222, 138);
    ctx.strokeStyle = "#14b8a6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(430, 130);
    ctx.lineTo(480, 45);
    ctx.stroke();
    if (on) {
      for (let i = 0; i < 12; i++) {
        const p = pointAt(loop, sim.tick / 30 + i / 12);
        const g = ctx.createRadialGradient(p.x, p.y, 0.5, p.x, p.y, 5);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(0.45, "#2dd4bf");
        g.addColorStop(1, "#0d9488");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(480, 45, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = brightness > 0.02 ? "#fbbf24" : "#94a3b8";
    ctx.globalAlpha = 0.35 + brightness * 0.65;
    ctx.beginPath();
    ctx.arc(480, 45, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#0f766e";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("collector loop", 430, 110);
    ctx.font = "13px sans-serif";
    ctx.fillStyle = on ? "#059669" : "#dc2626";
    ctx.fillText(`lamp ${on ? "SWITCHED ON" : "off"}`, 320, 236);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◯</span>}
      title={simTitle(topic, "The transistor as a switch")}
      subtitle="A tiny base current switches a much larger collector current — the transistor turns a feeble signal into a strong one."
      hint="Above a small threshold the transistor conducts and the lamp switches on. A tiny base current controls a current about 100× larger — that is amplification."
      accent={accent}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[sim.tick, baseI, speedMul]} />
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a.hex} />
      </div>
      <div className="mt-4">
        <Slider label="Base current" value={baseI} min={0} max={0.2} step={0.01} hex={a.hex} accent={a.text} unit=" mA" onChange={setBaseI} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Base current" value={`${baseI.toFixed(2)} mA`} />
        <Stat label="Collector current" value={`${collectorI.toFixed(1)} mA`} />
        <Stat label="Gain" value={on ? "≈ 100×" : "0 (off)"} />
      </div>
    </SimShell>
  );
}
