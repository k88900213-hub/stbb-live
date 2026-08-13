"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

export function CellSim({ topic }: { topic?: string }) {
  const a = "#10b981";
  const at = "text-emerald-600 dark:text-emerald-400";
  const [type, setType] = useState<"plant" | "animal">("plant");
  const [focus, setFocus] = useState("nucleus");
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const isPlant = type === "plant";
  const organelles = type === "plant" ? ["cell wall", "cell membrane", "nucleus", "chloroplast", "mitochondrion", "vacuole"] : ["cell membrane", "nucleus", "mitochondrion", "vacuole"];
  const info: Record<string, string> = {
    "cell wall": "rigid cellulose layer that gives support",
    "cell membrane": "controls what enters and leaves the cell",
    nucleus: "contains DNA — controls the cell",
    chloroplast: "site of photosynthesis — makes glucose",
    mitochondrion: "site of respiration — releases energy",
    vacuole: "stores water, keeps the cell turgid",
  };
  return (
    <SimShell
      icon="🦠"
      title={simTitle(topic, "Cell explorer")}
      accent="emerald"
      subtitle={`${topic ?? "Cell biology"} — click an organelle. Plant cells add a cell wall, a large vacuole and chloroplasts; animal cells do not.`}
      hint="Both cell types have a nucleus, mitochondria and a cell membrane. Only plants photosynthesise and keep their shape with a cellulose wall."
      controls={<SimChip accent="emerald"><span aria-hidden>🦠</span>{topic ?? "cell"}</SimChip>}
    >
      <SimCanvas
        deps={[type, focus, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = 160;
          const cy = h / 2;
          ctx.fillStyle = isPlant ? "#d9f99d" : "#fecdd3";
          ctx.beginPath();
          ctx.arc(cx, cy, 86, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 3;
          ctx.stroke();
          if (isPlant) {
            ctx.setLineDash([5, 3]);
            ctx.strokeStyle = "#4d7c0f";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(cx, cy, 96, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          if (focus === "cell wall" && isPlant) ctx.fillStyle = "rgba(132,204,22,0.35)";
          if (focus === "cell membrane") ctx.fillStyle = "rgba(250,204,21,0.35)";
          const hl = (f: string) => (focus === f ? "#111827" : "#1e293b");
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(cx + 18, cy - 10, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = hl("nucleus");
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#92400e";
          ctx.font = "9px system-ui";
          ctx.fillText("nucleus", cx + 6, cy - 24);
          if (isPlant) {
            ctx.fillStyle = "#4ade80";
            for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              ctx.arc(cx - 40 + i * 42, cy + 42, 11, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = hl("chloroplast");
              ctx.stroke();
            }
            ctx.fillStyle = "#0f766e";
            ctx.font = "9px system-ui";
            ctx.fillText("chloroplast", cx - 30, cy + 66);
          }
          ctx.fillStyle = "#f87171";
          ctx.beginPath();
          ctx.ellipse(cx - 48, cy - 34, 12, 18, 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = hl("mitochondrion");
          ctx.stroke();
          ctx.fillStyle = "#60a5fa";
          ctx.beginPath();
          ctx.ellipse(cx + 40, cy + 20, 18, 26, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = hl("vacuole");
          ctx.stroke();
          ctx.fillStyle = "#334155";
          ctx.font = "9px system-ui";
          ctx.fillText("mitochondrion", cx - 80, cy - 46);
          ctx.fillText("vacuole", cx + 32, cy + 60);
          ctx.fillStyle = "#065f46";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${type} cell — ${focus}`, 300, 50);
          ctx.fillStyle = "#334155";
          ctx.font = "12px system-ui";
          ctx.fillText(info[focus] ?? "", 300, 70);
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ActionButton label="Plant cell" onClick={() => setType("plant")} hex={type === "plant" ? a : "#94a3b8"} />
        <ActionButton label="Animal cell" onClick={() => setType("animal")} hex={type === "animal" ? a : "#94a3b8"} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {organelles.map((o) => (
          <ActionButton key={o} label={o} onClick={() => setFocus(o)} hex={focus === o ? a : "#94a3b8"} />
        ))}
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Cell type" value={type} accent={at} />
        <Stat label="Selected" value={focus} accent={at} />
        <Stat label="Unique to plants" value={isPlant ? "wall, chloroplast, vacuole" : "—"} accent={at} />
      </div>
    </SimShell>
  );
}

export function PhotosynthesisSim({ topic }: { topic?: string }) {
  const a = "#84cc16";
  const at = "text-lime-600 dark:text-lime-400";
  const [light, setLight] = useState(70);
  const [co2, setCo2] = useState(50);
  const [tempC, setTempC] = useState(25);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const lightFactor = light / 100;
  const co2Factor = co2 / 100;
  const tempFactor = Math.exp(-((tempC - 27) ** 2) / (2 * 144));
  const rate = 100 * Math.min(lightFactor, co2Factor, tempFactor);
  const limiting = rate < 1 ? "dark / no CO2" : rate / 100 >= lightFactor - 0.001 ? "light" : rate / 100 >= co2Factor - 0.001 ? "CO2" : "temperature";
  const maxO2 = 25;
  const o2Rate = maxO2 * (rate / 100);
  const glucoseRate = o2Rate / 6;
  const bubbles = Math.max(0, Math.round(rate / 8));
  const sun = Math.min(1, light / 100);
  const oxygen = sim.tick % 30;
  return (
    <SimShell
      icon="🌿"
      title={simTitle(topic, "Photosynthesis factory")}
      accent="lime"
      subtitle={`${topic ?? "Bioenergetics"} — 6CO2 + 6H2O + light → C6H12O6 + 6O2. The rate is set by whichever of light, CO2 or temperature is the limiting factor.`}
      hint="Rate rises with light and CO2 until another factor becomes limiting — that is why farmers add CO2 and light to greenhouses, and why photosynthesis peaks around 27 °C."
      controls={<SimChip accent="lime"><span aria-hidden>🌿</span>{topic ?? "photosynthesis"}</SimChip>}
    >
      <SimCanvas
        deps={[light, co2, tempC, rate, bubbles, sun, oxygen, o2Rate, glucoseRate, limiting, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = `rgba(254,240,138,${0.35 * sun})`;
          ctx.fillRect(0, 0, w, 60);
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(w - 50, 30, 18 * sun + 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#d9f99d";
          ctx.fillRect(60, 80, 160, 130);
          ctx.strokeStyle = "#4d7c0f";
          ctx.lineWidth = 3;
          ctx.strokeRect(60, 80, 160, 130);
          ctx.strokeStyle = "#166534";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(140, 210);
          ctx.lineTo(140, 120);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(140, 160);
          ctx.lineTo(110, 130);
          ctx.moveTo(140, 170);
          ctx.lineTo(170, 140);
          ctx.moveTo(140, 180);
          ctx.lineTo(110, 175);
          ctx.moveTo(140, 190);
          ctx.lineTo(170, 180);
          ctx.stroke();
          ctx.fillStyle = "#22c55e";
          for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.ellipse(100 + i * 16, 115 + (i % 2) * 8, 10, 14, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          for (let i = 0; i < bubbles; i++) {
            const t = ((sim.tick + i * 4) % 40) / 40;
            const x = 120 + (i % 2) * 40;
            const y = 205 - t * 120;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#38bdf8";
            ctx.fill();
          }
          ctx.fillStyle = "#166534";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("O2 bubbles", 60, 70);
          ctx.fillStyle = "#365314";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`rate ${rate.toFixed(0)}%`, 30, 26);
          ctx.fillText(`O2 ${o2Rate.toFixed(1)} · glucose ${glucoseRate.toFixed(2)} µmol/m²/s`, 30, 46);
          ctx.font = "12px system-ui";
          ctx.fillStyle = "#4d7c0f";
          ctx.fillText(`limiting factor: ${limiting}`, 30, 64);
          ctx.fillText(`6CO2 + 6H2O + light → glucose + 6O2`, 30, 82);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Light intensity" value={light} min={0} max={100} step={1} hex={a} accent={at} unit="%" onChange={setLight} />
        <Slider label="CO2 level" value={co2} min={0} max={100} step={1} hex={a} accent={at} unit="%" onChange={setCo2} />
        <Slider label="Temperature" value={tempC} min={5} max={45} step={1} hex={a} accent={at} unit="°C" onChange={setTempC} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Photosynthesis" value={`${rate.toFixed(0)}%`} accent={at} />
        <Stat label="O2 production" value={`${o2Rate.toFixed(1)} µmol/m²/s`} accent={at} />
        <Stat label="Glucose production" value={`${glucoseRate.toFixed(2)} µmol/m²/s`} accent={at} />
        <Stat label="Limiting factor" value={limiting} accent={at} />
      </div>
    </SimShell>
  );
}

export function RespirationSim({ topic }: { topic?: string }) {
  const a = "#f43f5e";
  const at = "text-rose-600 dark:text-rose-400";
  const [mode, setMode] = useState<"aerobic" | "anaerobic">("aerobic");
  const [glucose, setGlucose] = useState(5);
  const [o2, setO2] = useState(90);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const aerobic = mode === "aerobic";
  const atpPerGlucose = aerobic ? 38 : 2;
  const effGlucose = aerobic ? glucose * (0.4 + 0.6 * (o2 / 100)) : glucose;
  const totalATP = effGlucose * atpPerGlucose;
  const o2Consumed = aerobic ? effGlucose * 6 : 0;
  const atpMade = Math.min(totalATP, Math.floor(sim.elapsed * effGlucose * (aerobic ? 3.8 : 0.2)));
  const phase = (sim.tick % 60) / 60;
  return (
    <SimShell
      icon="⚡"
      title={simTitle(topic, "Respiration — energy release")}
      accent="rose"
      subtitle={`${topic ?? "Bioenergetics"} — aerobic respiration uses oxygen to release ~38 ATP per glucose; anaerobic respiration releases only 2.`}
      hint="Aerobic: glucose + O2 → CO2 + H2O + energy (38 ATP). Anaerobic in muscle makes lactic acid; in yeast it makes ethanol + CO2 (2 ATP). Oxygen is a limiting factor in aerobic respiration."
      controls={<SimChip accent="rose"><span aria-hidden>⚡</span>{topic ?? "respiration"}</SimChip>}
    >
      <SimCanvas
        deps={[mode, glucose, o2, totalATP, atpMade, o2Consumed, phase, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#fecdd3";
          ctx.beginPath();
          ctx.ellipse(140, h / 2, 60, 80, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#be123c";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#9f1239";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("mitochondrion", 96, 50);
          ctx.strokeStyle = "#fb7185";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(30, h / 2);
          ctx.lineTo(90, h / 2);
          ctx.stroke();
          ctx.fillStyle = "#be123c";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`glucose ${effGlucose.toFixed(1)} g`, 30, h / 2 - 10);
          if (aerobic) {
            const o2flow = 0.4 + 0.6 * (o2 / 100);
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(140, h / 2 - 70);
            ctx.lineTo(140, h / 2 - 20);
            ctx.stroke();
            ctx.fillStyle = "#0369a1";
            ctx.fillText(`O2 ${o2}%`, 150, h / 2 - 40);
            for (let i = 0; i < Math.round(o2flow * 4); i++) {
              ctx.fillStyle = "rgba(56,189,248,0.8)";
              ctx.beginPath();
              ctx.arc(140 + ((i - 1.5) * 10), h / 2 - 60 + ((sim.tick * 2 + i * 12) % 40), 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          const atpX = 280;
          ctx.fillStyle = "#fbbf24";
          for (let i = 0; i < Math.min(12, Math.round(atpMade % 12)); i++) {
            ctx.beginPath();
            ctx.arc(atpX + (i % 4) * 22, 80 + Math.floor(i / 4) * 22, 8, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = "#92400e";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`ATP made: ${Math.round(atpMade)}`, atpX - 10, 40);
          ctx.fillStyle = "#9f1239";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(aerobic ? "CO2 + H2O + 38 ATP" : "lactic acid / ethanol + 2 ATP", 30, h - 16);
          ctx.fillStyle = "#7f1d1d";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(mode, 30, 26);
          ctx.fillStyle = "#9f1239";
          ctx.font = "11px system-ui";
          ctx.fillText(`total ATP ${Math.round(totalATP)} · O2 used ${o2Consumed.toFixed(0)} mol`, 30, 44);
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ActionButton label="Aerobic" onClick={() => setMode("aerobic")} hex={aerobic ? a : "#94a3b8"} />
        <ActionButton label="Anaerobic" onClick={() => setMode("anaerobic")} hex={!aerobic ? a : "#94a3b8"} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Glucose available" value={glucose} min={0} max={10} step={0.5} hex={a} accent={at} unit=" g" onChange={setGlucose} />
        <Slider label="Oxygen supply" value={o2} min={0} max={100} step={1} hex={a} accent={at} unit="%" onChange={setO2} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Mode" value={mode} accent={at} />
        <Stat label="ATP per glucose" value={`~${atpPerGlucose}`} accent={at} />
        <Stat label="Total ATP yield" value={`${Math.round(totalATP)}`} accent={at} />
        <Stat label="O2 consumed" value={aerobic ? `${o2Consumed.toFixed(0)} mol` : "none"} accent={at} />
      </div>
    </SimShell>
  );
}

const GENO_OPTIONS = {
  mono: ["RR", "Rr", "rr"],
  di: ["RRYY", "RRYy", "RRyy", "RrYY", "RrYy", "Rryy", "rrYY", "rrYy", "rryy"],
} as const;

function parseGeno(g: string): [string, string, string, string] {
  if (g.length === 2) return [g[0], g[1], "Y", "Y"];
  return [g[0], g[1], g[2], g[3]];
}

function gametesOf(geno: string, twoTraits: boolean): string[] {
  const [r1, r2, y1, y2] = parseGeno(geno);
  const rAlleles = [...new Set([r1, r2])];
  const yAlleles = twoTraits ? [...new Set([y1, y2])] : [""];
  const out: string[] = [];
  for (const ra of rAlleles) for (const ya of yAlleles) out.push(ra + ya);
  return out;
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.max(1, a) : gcd(b, a % b);
}

export function GeneticsSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [twoTraits, setTwoTraits] = useState(false);
  const [fGeno, setFGeno] = useState("Rr");
  const [mGeno, setMGeno] = useState("Rr");
  const [showCounts, setShowCounts] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 20 * speedMul });

  const setTraits = (n: 1 | 2) => {
    if (n === 1) {
      setTwoTraits(false);
      setFGeno((g) => (g.length === 4 ? g.slice(0, 2) : g));
      setMGeno((g) => (g.length === 4 ? g.slice(0, 2) : g));
    } else {
      setTwoTraits(true);
      setFGeno((g) => (g.length === 2 ? g + "YY" : g));
      setMGeno((g) => (g.length === 2 ? g + "YY" : g));
    }
  };

  const fGametes = gametesOf(fGeno, twoTraits);
  const mGametes = gametesOf(mGeno, twoTraits);
  const cells: Array<[string, string, string, string]> = [];
  for (const fg of fGametes) {
    for (const mg of mGametes) {
      cells.push([fg[0], mg[0], twoTraits ? fg[1] : "Y", twoTraits ? mg[1] : "Y"]);
    }
  }
  const nCells = cells.length;

  const dom = cells.filter((c) => c[0] === "R" || c[1] === "R").length;
  const rec = nCells - dom;
  const classes = { RY: 0, Rg: 0, rY: 0, rg: 0 };
  for (const c of cells) {
    const rD = c[0] === "R" || c[1] === "R";
    const yD = twoTraits && (c[2] === "Y" || c[3] === "Y");
    if (rD && yD) classes.RY++;
    else if (rD) classes.Rg++;
    else if (yD) classes.rY++;
    else classes.rg++;
  }
  let rCount = 0;
  let yCount = 0;
  let rrCount = 0;
  for (const c of cells) {
    const pair = [c[0], c[1]];
    rCount += pair.filter((x) => x === "R").length;
    if (pair.every((x) => x === "R")) rrCount++;
    yCount += [c[2], c[3]].filter((x) => x === "Y").length;
  }
  const freqR = rCount / Math.max(1, nCells * 2);
  const freqY = yCount / Math.max(1, nCells * 2);
  const gDom = gcd(dom, rec);
  const monoRatio = `${dom / gDom}:${rec / gDom}`;
  const gAll = gcd(classes.RY, gcd(classes.Rg, gcd(classes.rY, classes.rg)));
  const diRatio = `${classes.RY / gAll}:${classes.Rg / gAll}:${classes.rY / gAll}:${classes.rg / gAll}`;
  const ratio = twoTraits ? diRatio : monoRatio;
  const reveal = Math.min(1, sim.tick / 30);

  return (
    <SimShell
      icon="🧬"
      title={simTitle(topic, "Genetics — Punnett square")}
      accent="violet"
      subtitle={`${topic ?? "Inheritance"} — each parent contributes one allele of every gene. Dominant (uppercase) shows whenever present; recessive needs two copies.`}
      hint="A monohybrid Rr × Rr cross gives a 3:1 phenotype ratio; a dihybrid RrYy × RrYy cross gives 9:3:3:1. Watch the allele frequencies in the F1 generation."
      controls={<SimChip accent="violet"><span aria-hidden>🧬</span>{topic ?? "genetics"}</SimChip>}
    >
      <SimCanvas
        deps={[twoTraits, fGeno, mGeno, cells, dom, rec, classes, ratio, freqR, freqY, showCounts, reveal, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#ede9fe";
          ctx.fillRect(60, 60, 200, twoTraits ? 200 : 150);
          ctx.strokeStyle = "#6d28d9";
          ctx.lineWidth = 2;
          ctx.strokeRect(60, 60, 200, twoTraits ? 200 : 150);
          ctx.strokeStyle = "#6d28d9";
          ctx.beginPath();
          if (twoTraits) {
            ctx.moveTo(60, 110);
            ctx.lineTo(260, 110);
            ctx.moveTo(60, 160);
            ctx.lineTo(260, 160);
            ctx.moveTo(60, 210);
            ctx.lineTo(260, 210);
            ctx.moveTo(110, 60);
            ctx.lineTo(110, 260);
            ctx.moveTo(160, 60);
            ctx.lineTo(160, 260);
            ctx.moveTo(210, 60);
            ctx.lineTo(210, 260);
          } else {
            ctx.moveTo(160, 60);
            ctx.lineTo(160, 210);
            ctx.moveTo(60, 135);
            ctx.lineTo(260, 135);
          }
          ctx.stroke();
          const cellPheno = (rA: string, rB: string, yA: string, yB: string) => {
            const rD = rA === "R" || rB === "R";
            const yD = twoTraits && (yA === "Y" || yB === "Y");
            if (rD && yD) return "#fde047";
            if (rD) return "#86efac";
            if (yD) return "#fdba74";
            return "#cbd5e1";
          };
          if (twoTraits) {
            ctx.fillStyle = "#6d28d9";
            ctx.font = "bold 11px system-ui";
            fGametes.forEach((fg, c) => {
              ctx.fillText(fg, 95 + c * 50, 78);
            });
            mGametes.forEach((mg, r) => {
              ctx.fillText(mg, 40, 98 + r * 50);
            });
            cells.forEach((c, i) => {
              const col = i % mGametes.length;
              const row = Math.floor(i / mGametes.length);
              const x = 85 + col * 50;
              const y = 85 + row * 50;
              if (reveal * nCells > i * 0.8) {
                ctx.fillStyle = cellPheno(c[0], c[1], c[2], c[3]);
                ctx.beginPath();
                ctx.arc(x, y, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#4c1d95";
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.fillStyle = "#1e1b4b";
                ctx.font = "bold 11px system-ui";
                ctx.fillText(`${c[0]}${c[1]}`, x - 12, y + 4);
                ctx.font = "8px system-ui";
                ctx.fillText(`${c[2]}${c[3]}`, x - 6, y + 16);
              }
            });
            ctx.fillStyle = "#4c1d95";
            ctx.font = "10px system-ui";
            ctx.fillText("shape + colour", 60, 50);
            ctx.fillText("gametes", 12, 40);
          } else {
            fGametes.forEach((fg, c) => {
              ctx.fillStyle = "#6d28d9";
              ctx.font = "bold 13px system-ui";
              ctx.fillText(fg, 110 + c * 100, 100);
            });
            mGametes.forEach((mg, r) => {
              ctx.fillStyle = "#6d28d9";
              ctx.font = "bold 13px system-ui";
              ctx.fillText(mg, 30, 128 + r * 70);
            });
            ctx.fillStyle = "#4c1d95";
            ctx.font = "12px system-ui";
            ctx.fillText("father gametes", 95, 45);
            ctx.fillText("mother", 20, 45);
            cells.forEach((c, i) => {
              const col = i % 2;
              const row = Math.floor(i / 2);
              const x = 90 + col * 100;
              const y = 85 + row * 75;
              if (reveal * nCells > i * 0.8) {
                const dominant = c[0] === "R" || c[1] === "R";
                ctx.fillStyle = dominant ? "#fbbf24" : "#a5b4fc";
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#1e1b4b";
                ctx.font = "bold 13px system-ui";
                ctx.fillText(`${c[0]}${c[1]}`, x - 12, y + 5);
                ctx.fillStyle = "#1e1b4b";
                ctx.font = "10px system-ui";
                ctx.fillText(dominant ? "dominant" : "recessive", x - 22, y - 26);
              }
            });
          }
          if (showCounts) {
            const px = 300;
            ctx.fillStyle = "#4c1d95";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`ratio ${ratio}`, px, 70);
            if (twoTraits) {
              const entries = [
                { label: "round+yellow", v: classes.RY, color: "#fde047" },
                { label: "round+green", v: classes.Rg, color: "#86efac" },
                { label: "wrinkled+yellow", v: classes.rY, color: "#fdba74" },
                { label: "wrinkled+green", v: classes.rg, color: "#cbd5e1" },
              ];
              entries.forEach((e, i) => {
                ctx.fillStyle = e.color;
                ctx.fillRect(px, 84 + i * 22, Math.max(4, e.v * 12), 14);
                ctx.strokeStyle = "#6d28d9";
                ctx.lineWidth = 1;
                ctx.strokeRect(px, 84 + i * 22, Math.max(4, e.v * 12), 14);
                ctx.fillStyle = "#334155";
                ctx.font = "11px system-ui";
                ctx.fillText(`${e.label} ${e.v}`, px + Math.max(4, e.v * 12) + 6, 95 + i * 22);
              });
              ctx.fillStyle = "#4c1d95";
              ctx.font = "bold 11px system-ui";
              ctx.fillText(`R ${(freqR * 100).toFixed(0)}% · r ${((1 - freqR) * 100).toFixed(0)}%`, px, 190);
              ctx.fillText(`Y ${(freqY * 100).toFixed(0)}% · y ${((1 - freqY) * 100).toFixed(0)}%`, px, 206);
              ctx.font = "10px system-ui";
              ctx.fillStyle = "#6d28d9";
              ctx.fillText(`genotype RR ${rrCount} · Rr ${nCells - rrCount - (nCells - dom)} · rr ${nCells - dom}`, px, 224);
            } else {
              ctx.fillStyle = "#7c3aed";
              ctx.fillRect(px, 90, 14 * dom, 20);
              ctx.fillStyle = "#c4b5fd";
              ctx.fillRect(px + 14 * dom, 90, 14 * rec, 20);
              ctx.fillStyle = "#334155";
              ctx.font = "11px system-ui";
              ctx.fillText(`${dom} dominant (R_)`, px, 130);
              ctx.fillText(`${rec} recessive (rr)`, px, 146);
              ctx.fillStyle = "#4c1d95";
              ctx.font = "bold 11px system-ui";
              ctx.fillText(`allele freq R ${(freqR * 100).toFixed(0)}% · r ${((1 - freqR) * 100).toFixed(0)}%`, px, 168);
              ctx.font = "10px system-ui";
              ctx.fillStyle = "#6d28d9";
              ctx.fillText(`genotype RR ${rrCount} · Rr ${dom - rrCount} · rr ${rec}`, px, 186);
            }
          }
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ActionButton label="One trait (monohybrid)" onClick={() => setTraits(1)} hex={!twoTraits ? a : "#94a3b8"} />
        <ActionButton label="Two traits (dihybrid)" onClick={() => setTraits(2)} hex={twoTraits ? a : "#94a3b8"} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Father genotype {twoTraits ? "(shape + colour)" : "(shape)"}</span>
          <select
            value={fGeno}
            onChange={(e) => setFGeno(e.target.value)}
            className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5"
          >
            {(twoTraits ? GENO_OPTIONS.di : GENO_OPTIONS.mono).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Mother genotype {twoTraits ? "(shape + colour)" : "(shape)"}</span>
          <select
            value={mGeno}
            onChange={(e) => setMGeno(e.target.value)}
            className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5"
          >
            {(twoTraits ? GENO_OPTIONS.di : GENO_OPTIONS.mono).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show counts" checked={showCounts} onChange={setShowCounts} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Cross type" value={twoTraits ? "dihybrid" : "monohybrid"} accent={at} />
        <Stat label="Phenotype ratio" value={ratio} accent={at} />
        <Stat label="R allele freq" value={`${(freqR * 100).toFixed(0)}%`} accent={at} />
        <Stat label="r allele freq" value={`${((1 - freqR) * 100).toFixed(0)}%`} accent={at} />
      </div>
    </SimShell>
  );
}

export function BiomoleculesSim({ topic }: { topic?: string }) {
  const a = "#f59e0b";
  const at = "text-amber-600 dark:text-amber-400";
  const kinds = [
    { name: "Carbohydrate", unit: "glucose", color: "#f59e0b", energy: "17 kJ/g", food: "bread, rice, sugar" },
    { name: "Fats & oils", unit: "fatty acid", color: "#f43f5e", energy: "38 kJ/g", food: "butter, oil, nuts" },
    { name: "Protein", unit: "amino acid", color: "#10b981", energy: "17 kJ/g", food: "meat, eggs, beans" },
  ] as const;
  const [kind, setKind] = useState(0);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const k = kinds[kind];
  const count = Math.min(12, 2 + Math.floor(sim.tick / 3));
  return (
    <SimShell
      icon="🍞"
      title={simTitle(topic, "Biomolecules — molecules of life")}
      accent="amber"
      subtitle={`${topic ?? "Nutrition"} — carbohydrates, fats and proteins are polymers built from small monomers: glucose, fatty acids and amino acids.`}
      hint={`${k.name}: monomers = ${k.unit}. Energy ${k.energy}. Fats carry the most energy per gram.`}
      controls={<SimChip accent="amber"><span aria-hidden>🍞</span>{topic ?? "biomolecules"}</SimChip>}
    >
      <SimCanvas
        deps={[kind, k, count, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#fef3c7";
          ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < count; i++) {
            const x = 40 + i * 34;
            ctx.fillStyle = k.color;
            ctx.fillRect(x, 100, 26, 26);
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, 100, 26, 26);
            ctx.fillStyle = "#fff";
            ctx.font = "9px system-ui";
            ctx.fillText(k.unit.split(" ")[0].slice(0, 3), x + 2, 116);
            if (i < count - 1) {
              ctx.strokeStyle = "#64748b";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x + 26, 113);
              ctx.lineTo(x + 34, 113);
              ctx.stroke();
            }
          }
          ctx.fillStyle = "#78350f";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`${count} ${k.unit}s joined — a ${k.name.toLowerCase()} polymer`, 40, 70);
          ctx.fillStyle = "#92400e";
          ctx.font = "12px system-ui";
          ctx.fillText(`food sources: ${k.food}`, 40, 170);
          ctx.fillStyle = "#78350f";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`energy ${k.energy}`, 40, 196);
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {kinds.map((kk, i) => (
          <ActionButton key={kk.name} label={kk.name} onClick={() => setKind(i)} hex={kind === i ? a : "#94a3b8"} />
        ))}
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Molecule" value={k.name} accent={at} />
        <Stat label="Monomer" value={k.unit} accent={at} />
        <Stat label="Energy" value={k.energy} accent={at} />
      </div>
    </SimShell>
  );
}

export function MicroscopeSim({ topic }: { topic?: string }) {
  const a = "#0ea5e9";
  const at = "text-sky-600 dark:text-sky-400";
  const objectives = [
    { mag: 4, na: 0.1, wd: 15 },
    { mag: 10, na: 0.25, wd: 5 },
    { mag: 40, na: 0.65, wd: 0.5 },
  ];
  const [objIdx, setObjIdx] = useState(1);
  const [eyepiece, setEyepiece] = useState(10);
  const [focus, setFocus] = useState(50);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const obj = objectives[objIdx];
  const magnification = eyepiece * obj.mag;
  const resolution = (0.61 * 0.55) / obj.na;
  const fieldView = 4.5 / magnification;
  const sharp = 100 - Math.abs(focus - 50) * 3;
  const cellY = 190 - focus * 0.2;
  return (
    <SimShell
      icon="🔬"
      title={simTitle(topic, "Compound microscope")}
      accent="sky"
      subtitle={`${topic ?? "Cells & tissues"} — the eyepiece times the objective lens gives total magnification. Focus moves the stage up and down.`}
      hint="Total magnification = eyepiece × objective. Resolution depends on numerical aperture: higher NA → finer detail. Oil-immersion 100× objectives reach ~0.2 µm."
      controls={<SimChip accent="sky"><span aria-hidden>🔬</span>{topic ?? "microscope"}</SimChip>}
    >
      <SimCanvas
        deps={[objIdx, obj, eyepiece, focus, magnification, resolution, fieldView, sharp, cellY, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(100, 40);
          ctx.lineTo(100, h - 30);
          ctx.moveTo(160, 40);
          ctx.lineTo(160, h - 30);
          ctx.stroke();
          ctx.fillStyle = "#0ea5e9";
          ctx.fillRect(70, 30, 120, 30);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`eyepiece ×${eyepiece}`, 82, 50);
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(60, 60);
          ctx.lineTo(200, 60);
          ctx.lineTo(185, 90);
          ctx.lineTo(75, 90);
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = "#64748b";
          ctx.fillRect(90, 90, 80, 30 + obj.mag * 2);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`${obj.mag}×`, 112, 112);
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(60, 170, 140, 12);
          ctx.strokeStyle = "#334155";
          ctx.strokeRect(60, 170, 140, 12);
          ctx.fillStyle = "#94a3b8";
          ctx.fillRect(130, 60, 16, 110);
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(40, 182, 180, 40);
          ctx.strokeStyle = "#334155";
          ctx.strokeRect(40, 182, 180, 40);
          ctx.fillStyle = "#334155";
          ctx.font = "11px system-ui";
          ctx.fillText("stage (focus up/down)", 60, 208);
          const vx = 280;
          ctx.fillStyle = "#f0f9ff";
          ctx.fillRect(vx, 30, 250, 190);
          ctx.strokeStyle = "#0284c7";
          ctx.strokeRect(vx, 30, 250, 190);
          const s = Math.min(1, obj.mag / 40 + 0.4);
          ctx.fillStyle = `rgba(134,239,172,${0.5 * s})`;
          ctx.beginPath();
          ctx.arc(vx + 125, 125, 60 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(vx + 125, 125, 16 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#0369a1";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${magnification}× view`, vx + 80, 26);
          ctx.fillStyle = "#0369a1";
          ctx.font = "11px system-ui";
          ctx.fillText(`focus ${Math.max(0, sharp).toFixed(0)}% sharp`, vx + 85, 210);
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "10px system-ui";
          ctx.fillText(`NA ${obj.na.toFixed(2)}`, vx + 10, 42);
          ctx.fillText(`res ${resolution.toFixed(2)} µm`, vx + 10, 56);
          ctx.fillText(`FOV ${fieldView.toFixed(3)} mm`, vx + 10, 70);
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {objectives.map((o, i) => (
          <ActionButton key={o.mag} label={`${o.mag}× objective (NA ${o.na.toFixed(2)})`} onClick={() => setObjIdx(i)} hex={objIdx === i ? a : "#94a3b8"} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Eyepiece magnification" value={eyepiece} min={5} max={20} step={1} hex={a} accent={at} unit="×" onChange={setEyepiece} />
        <Slider label="Focus (stage height)" value={focus} min={0} max={100} step={1} hex={a} accent={at} unit="%" onChange={setFocus} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Magnification" value={`${magnification}×`} accent={at} />
        <Stat label="Resolution" value={`${resolution.toFixed(2)} µm`} accent={at} />
        <Stat label="Field of view" value={`${fieldView.toFixed(3)} mm`} accent={at} />
        <Stat label="Sharpness" value={`${Math.max(0, sharp).toFixed(0)}%`} accent={at} />
      </div>
    </SimShell>
  );
}

export function OsmosisSim({ topic }: { topic?: string }) {
  const a = "#06b6d4";
  const at = "text-cyan-600 dark:text-cyan-400";
  const [inside, setInside] = useState(25);
  const [outside, setOutside] = useState(5);
  const [showArrows, setShowArrows] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const netIn = inside > outside;
  const netOut = outside > inside;
  const gradient = Math.abs(inside - outside);
  const cellR = Math.max(30, Math.min(60, 45 + (inside - outside) * 0.25));
  const tonicity = netIn ? "hypotonic" : netOut ? "hypertonic" : "isotonic";
  const cellState = netIn ? "swells (turgid)" : netOut ? "shrinks (plasmolysed)" : "steady";
  return (
    <SimShell
      icon="💦"
      title={simTitle(topic, "Osmosis & cell water")}
      accent="cyan"
      subtitle={`${topic ?? "Cell biology"} — water moves through the semi-permeable membrane toward the higher solute concentration, down the water-potential gradient.`}
      hint="A cell in pure water swells (water enters, hypotonic). In strong salt solution it shrinks (water leaves, hypertonic). Concentrations tend to equalise by osmosis."
      controls={<SimChip accent="cyan"><span aria-hidden>💦</span>{topic ?? "osmosis"}</SimChip>}
    >
      <SimCanvas
        deps={[inside, outside, netIn, netOut, gradient, cellR, tonicity, cellState, showArrows, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#e0f2fe";
          ctx.fillRect(40, 40, 260, 190);
          ctx.fillStyle = "#bae6fd";
          ctx.fillRect(300, 40, 260, 190);
          ctx.strokeStyle = "#0c4a6e";
          ctx.lineWidth = 3;
          ctx.strokeRect(40, 40, 260, 190);
          ctx.strokeRect(300, 40, 260, 190);
          ctx.setLineDash([5, 3]);
          ctx.strokeStyle = "#0e7490";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(300, 40);
          ctx.lineTo(300, 230);
          ctx.stroke();
          ctx.setLineDash([]);
          const drawSolute = (x0: number, n: number, color: string) => {
            for (let i = 0; i < n; i++) {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(x0 + 20 + ((i * 53) % 220), 60 + ((i * 83) % 150), 7, 0, Math.PI * 2);
              ctx.fill();
            }
          };
          drawSolute(40, outside, "#f59e0b");
          drawSolute(300, inside, "#38bdf8");
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`outside solute ${outside}%`, 110, 34);
          ctx.fillText(`cell solute ${inside}%`, 380, 34);

          ctx.strokeStyle = "#0369a1";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(150, 130, cellR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fill();

          if (showArrows && (netIn || netOut)) {
            const dir = netIn ? -1 : 1;
            ctx.strokeStyle = "#0284c7";
            ctx.lineWidth = 2.5;
            for (let i = 0; i < 6; i++) {
              const ang = -Math.PI / 2 + (i - 2.5) * 0.5;
              const ph = (sim.tick * 0.03 + i / 6) % 1;
              const r = cellR + (netIn ? 2 + (1 - ph) * 16 : 2 + ph * 16);
              const x = 150 + Math.cos(ang) * r;
              const y = 130 + Math.sin(ang) * r;
              ctx.fillStyle = "rgba(56,189,248,0.9)";
              ctx.beginPath();
              ctx.arc(x, y, 2.5, 0, Math.PI * 2);
              ctx.fill();
              if (i % 2 === 0) {
                const tx = 150 + Math.cos(ang) * (cellR + 12) * dir;
                const ty = 130 + Math.sin(ang) * (cellR + 12) * dir;
                ctx.strokeStyle = "#0284c7";
                ctx.beginPath();
                ctx.moveTo(tx + Math.cos(ang) * 6 * dir, ty + Math.sin(ang) * 6 * dir);
                ctx.lineTo(tx - Math.cos(ang) * 4 * dir, ty - Math.sin(ang) * 4 * dir);
                ctx.stroke();
              }
            }
          }
          ctx.fillStyle = "#155e75";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(
            netIn ? "water enters cell — solute pulled in" : netOut ? "water leaves cell — solute stays out" : "no net movement",
            60,
            26,
          );
          ctx.fillStyle = "#0e7490";
          ctx.font = "11px system-ui";
          ctx.fillText(
            netIn ? "water →" : netOut ? "← water" : "isotonic",
            235,
            120,
          );
          ctx.fillStyle = "#164e63";
          ctx.font = "11px system-ui";
          ctx.fillText(`solution: ${tonicity} · cell ${cellState}`, 60, 240);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Cell solute concentration" value={inside} min={0} max={50} step={1} hex={a} accent={at} unit="%" onChange={setInside} />
        <Slider label="Outside solute concentration" value={outside} min={0} max={50} step={1} hex={a} accent={at} unit="%" onChange={setOutside} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show water flow" checked={showArrows} onChange={setShowArrows} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Solute gradient" value={`${gradient}%`} accent={at} />
        <Stat label="Solution tonicity" value={tonicity} accent={at} />
        <Stat label="Water moves" value={netIn ? "into cell" : netOut ? "out of cell" : "no net"} accent={at} />
        <Stat label="Cell" value={cellState} accent={netOut ? "text-amber-600 dark:text-amber-400" : at} />
      </div>
    </SimShell>
  );
}

const MITOSIS_PHASES = ["interphase", "prophase", "metaphase", "anaphase", "telophase"];

export function MitosisSim({ topic }: { topic?: string }) {
  const a = "#d946ef";
  const at = "text-fuchsia-600 dark:text-fuchsia-400";
  const [phase, setPhase] = useState(0);
  const [auto, setAuto] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 4 * speedMul });
  const current = auto ? sim.tick % MITOSIS_PHASES.length : phase;
  const desc = [
    "DNA replicates, cell grows",
    "chromosomes condense, visible",
    "chromosomes line up at equator",
    "sister chromatids pulled apart",
    "two new cells form",
  ];
  return (
    <SimShell
      icon="🔁"
      title={simTitle(topic, "Mitosis — cell cycle")}
      accent="fuchsia"
      subtitle={`${topic ?? "Cell division"} — one parent cell divides to make two identical daughter cells for growth and repair.`}
      hint="Mitosis keeps the chromosome number the same. Phase order: prophase → metaphase → anaphase → telophase."
      controls={<SimChip accent="fuchsia"><span aria-hidden>🔁</span>{topic ?? "cell cycle"}</SimChip>}
    >
      <SimCanvas
        deps={[current, auto, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = w / 2;
          const cy = h / 2;
          const p = MITOSIS_PHASES[current];
          if (p === "interphase") {
            ctx.strokeStyle = "#d946ef";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 70, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#f5d0fe";
            ctx.beginPath();
            ctx.arc(cx, cy, 68, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#a21caf";
            ctx.beginPath();
            ctx.arc(cx, cy, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "11px system-ui";
            ctx.fillText("nucleus", cx - 22, cy - 36);
          } else if (p === "prophase") {
            ctx.strokeStyle = "#d946ef";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 70, 0, Math.PI * 2);
            ctx.stroke();
            for (let i = 0; i < 4; i++) {
              const ang = i * 0.5 + sim.tick * 0.05;
              ctx.strokeStyle = "#a21caf";
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(cx + Math.cos(ang) * 20, cy + Math.sin(ang) * 20);
              ctx.lineTo(cx + Math.cos(ang) * 60, cy + Math.sin(ang) * 60);
              ctx.stroke();
            }
          } else if (p === "metaphase") {
            ctx.strokeStyle = "#d946ef";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 70, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = "#a21caf";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx - 55, cy);
            ctx.lineTo(cx + 55, cy);
            ctx.stroke();
            for (let i = -2; i <= 2; i++) {
              ctx.fillStyle = "#d946ef";
              ctx.fillRect(cx + i * 18 - 4, cy - 20, 8, 40);
              ctx.strokeStyle = "#a21caf";
              ctx.lineWidth = 1.5;
              ctx.strokeRect(cx + i * 18 - 4, cy - 20, 8, 40);
            }
          } else if (p === "anaphase") {
            const sep = 20 + (sim.tick % 4) * 10;
            ctx.strokeStyle = "#d946ef";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 70, 0, Math.PI * 2);
            ctx.stroke();
            for (let i = 0; i < 4; i++) {
              const x = cx + (i % 2 === 0 ? -1 : 1) * sep;
              const y = cy + (Math.floor(i / 2) - 0.5) * 30;
              ctx.fillStyle = "#a21caf";
              ctx.fillRect(x - 3, y - 14, 6, 28);
            }
          } else {
            for (let s = -1; s <= 1; s += 2) {
              ctx.strokeStyle = "#d946ef";
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(cx + s * 45, cy, 32, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = "#f5d0fe";
              ctx.fill();
              ctx.fillStyle = "#a21caf";
              ctx.beginPath();
              ctx.arc(cx + s * 45, cy, 12, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.fillStyle = "#701a75";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${p} — ${desc[current]}`, 30, 26);
          ctx.fillText(`daughter cells: ${p === "telophase" ? "2" : "1"}`, 30, 46);
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {MITOSIS_PHASES.map((p, i) => (
          <ActionButton key={p} label={p} onClick={() => { setPhase(i); setAuto(false); }} hex={current === i ? a : "#94a3b8"} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Auto-play" checked={auto} onChange={setAuto} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Phase" value={MITOSIS_PHASES[current]} accent={at} />
        <Stat label="Daughter cells" value={current === 4 ? "2" : "1"} accent={at} />
        <Stat label="Chromosomes" value="same as parent" accent={at} />
      </div>
    </SimShell>
  );
}

export function MeiosisSim({ topic }: { topic?: string }) {
  const a = "#6366f1";
  const at = "text-indigo-600 dark:text-indigo-400";
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 4 * speedMul });
  const current = auto ? sim.tick % 4 : step;
  const desc = ["homologous pairs align", "pairs separate", "sister chromatids separate", "4 gametes formed"];
  const gametes = current === 3 ? 4 : current === 2 ? 2 : current === 1 ? 2 : 1;
  const chromosomes = current >= 2 ? "halved (haploid)" : current === 1 ? "separating" : "paired (diploid)";
  return (
    <SimShell
      icon="🧬"
      title={simTitle(topic, "Meiosis — gamete formation")}
      accent="indigo"
      subtitle={`${topic ?? "Cell division"} — one cell divides twice to make four haploid gametes. This is how egg and sperm cells form.`}
      hint="Meiosis halves the chromosome number and mixes genes by crossing over — the reason offspring differ from their parents."
      controls={<SimChip accent="indigo"><span aria-hidden>🧬</span>{topic ?? "meiosis"}</SimChip>}
    >
      <SimCanvas
        deps={[current, auto, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = w / 2;
          const cy = h / 2;
          if (current === 0) {
            ctx.strokeStyle = "#6366f1";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 70, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#e0e7ff";
            ctx.fill();
            for (let i = 0; i < 4; i++) {
              const x = cx - 30 + i * 20;
              ctx.fillStyle = "#4338ca";
              ctx.fillRect(x, cy - 24, 10, 48);
              ctx.strokeStyle = "#1e1b4b";
              ctx.strokeRect(x, cy - 24, 10, 48);
            }
            ctx.fillStyle = "#4338ca";
            ctx.font = "11px system-ui";
            ctx.fillText("homologous pairs", cx - 50, cy + 40);
          } else if (current === 1) {
            for (let s = -1; s <= 1; s += 2) {
              ctx.strokeStyle = "#6366f1";
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(cx + s * 50, cy, 40, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = "#e0e7ff";
              ctx.fill();
              for (let i = 0; i < 3; i++) {
                ctx.fillStyle = "#4338ca";
                ctx.fillRect(cx + s * 50 - 20 + i * 14, cy - 16, 8, 32);
              }
            }
          } else if (current === 2) {
            for (let q = 0; q < 2; q++) {
              const bx = cx - 60 + q * 120;
              const by = cy - 50;
              ctx.strokeStyle = "#6366f1";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(bx, by, 28, 0, Math.PI * 2);
              ctx.stroke();
              ctx.strokeStyle = "#6366f1";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(bx, by + 100, 28, 0, Math.PI * 2);
              ctx.stroke();
            }
          } else {
            for (let q = 0; q < 4; q++) {
              const bx = cx - 90 + (q % 2) * 60;
              const by = cy - 40 + Math.floor(q / 2) * 80;
              ctx.strokeStyle = "#6366f1";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(bx, by, 24, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = "#e0e7ff";
              ctx.fill();
              ctx.fillStyle = "#4338ca";
              ctx.beginPath();
              ctx.arc(bx, by, 9, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#4338ca";
              ctx.font = "9px system-ui";
              ctx.fillText("gamete", bx - 16, by + 38);
            }
          }
          ctx.fillStyle = "#312e81";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`stage ${current + 1}/4 — ${desc[current]}`, 30, 26);
          ctx.fillStyle = "#3730a3";
          ctx.font = "12px system-ui";
          ctx.fillText(`gametes so far: ${gametes}`, 30, 46);
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <ActionButton key={i} label={`Stage ${i + 1}`} onClick={() => { setStep(i); setAuto(false); }} hex={current === i ? a : "#94a3b8"} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Auto-play" checked={auto} onChange={setAuto} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Gametes" value={`${gametes}`} accent={at} />
        <Stat label="Chromosomes" value={chromosomes} accent={at} />
        <Stat label="Purpose" value="egg & sperm" accent={at} />
      </div>
    </SimShell>
  );
}

export function EnzymeSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const [temp, setTemp] = useState(37);
  const [ph, setPh] = useState(7);
  const [substrate, setSubstrate] = useState(60);
  const [showActive, setShowActive] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const tempActivity = temp <= 37 ? (temp / 37) * 100 : Math.max(0, 100 - (temp - 37) * 6);
  const phActivity = Math.max(0, 100 - Math.abs(ph - 7) * 20);
  const activity = Math.min(100, Math.max(0, (tempActivity * phActivity) / 100));
  const km = 50;
  const vmax = activity;
  const rate = (vmax * substrate) / (km + substrate);
  const saturation = substrate / (km + substrate);
  const dock = sim.tick % 30;
  const docked = dock < 12;
  const dx = dock < 8 ? dock * 6 : docked ? 48 : 48 + (dock - 20) * 8;
  return (
    <SimShell
      icon="🔑"
      title={simTitle(topic, "Enzyme activity")}
      accent="orange"
      subtitle={`${topic ?? "Enzymes"} — enzymes are proteins that speed up reactions. The substrate fits the active site (lock and key) and the rate follows Michaelis–Menten kinetics.`}
      hint="Enzymes work best at an optimum temperature and pH. Too hot or too acidic denatures the enzyme. Adding substrate speeds things up until all active sites are busy (Vmax)."
      controls={<SimChip accent="orange"><span aria-hidden>🔑</span>{topic ?? "enzymes"}</SimChip>}
    >
      <SimCanvas
        deps={[temp, ph, substrate, activity, vmax, rate, saturation, docked, dock, dx, showActive, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(140, 130, 46, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#ffedd5";
          ctx.fill();
          if (showActive) {
            ctx.fillStyle = "#c2410c";
            ctx.beginPath();
            ctx.arc(140, 130, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "9px system-ui";
            ctx.fillText("active", 132, 126);
            ctx.fillText("site", 136, 136);
          }
          const sx = 140 + dx;
          ctx.fillStyle = "#3b82f6";
          ctx.beginPath();
          ctx.arc(sx, 130, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#1e3a8a";
          ctx.stroke();
          ctx.fillStyle = "#1e3a8a";
          ctx.font = "bold 9px system-ui";
          ctx.fillText("sub", sx - 8, 134);
          if (docked) {
            ctx.strokeStyle = "#16a34a";
            ctx.lineWidth = 3;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.arc(140, 130, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.fillStyle = "#9a3412";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(docked ? "substrate fits active site" : dock > 18 ? "product released" : "substrate approaching", 250, 60);
          ctx.fillStyle = "#334155";
          ctx.font = "12px system-ui";
          ctx.fillText(`v = ${rate.toFixed(1)} µmol/min`, 250, 80);
          ctx.fillStyle = activity > 60 ? "#16a34a" : activity > 30 ? "#f59e0b" : "#dc2626";
          ctx.fillText(activity > 60 ? "working well" : activity > 30 ? "slowing down" : "denatured!", 250, 100);

          const px0 = 300;
          const px1 = w - 30;
          const py0 = 200;
          const py1 = 30;
          ctx.strokeStyle = "rgba(100,116,139,0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(px0, py0);
          ctx.lineTo(px1, py0);
          ctx.moveTo(px0, py0);
          ctx.lineTo(px0, py1);
          ctx.stroke();
          ctx.fillStyle = "#64748b";
          ctx.font = "9px system-ui";
          ctx.fillText("[S] µmol/L", px1 - 60, py0 + 12);
          ctx.fillText("v", px0 - 12, py1 + 4);
          ctx.strokeStyle = "#dc2626";
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(px0, py0 - (vmax / 100) * (py0 - py1));
          ctx.lineTo(px1, py0 - (vmax / 100) * (py0 - py1));
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#dc2626";
          ctx.font = "9px system-ui";
          ctx.fillText(`Vmax ${vmax.toFixed(0)}`, px1 - 70, py0 - (vmax / 100) * (py0 - py1) - 4);
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let s = 0; s <= 100; s += 2) {
            const v = (vmax * s) / (km + s);
            const x = px0 + (s / 100) * (px1 - px0);
            const y = py0 - (v / 100) * (py0 - py1);
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          const cx = px0 + (substrate / 100) * (px1 - px0);
          const cy = py0 - (rate / 100) * (py0 - py1);
          ctx.fillStyle = "#f97316";
          ctx.strokeStyle = "#7c2d12";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#9a3412";
          ctx.font = "11px system-ui";
          ctx.fillText(`S ${substrate} · v ${rate.toFixed(1)} · sat ${(saturation * 100).toFixed(0)}%`, px0, py0 + 30);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Temperature" value={temp} min={0} max={80} step={1} hex={a} accent={at} unit="°C" onChange={setTemp} />
        <Slider label="pH" value={ph} min={0} max={14} step={0.5} hex={a} accent={at} onChange={setPh} />
        <Slider label="Substrate concentration" value={substrate} min={0} max={100} step={1} hex={a} accent={at} unit=" µmol/L" onChange={setSubstrate} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show active site" checked={showActive} onChange={setShowActive} hex={a} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {[
          ["Human body", 37, 7],
          ["Stomach (pepsin)", 37, 2],
          ["Heat stress", 60, 7],
          ["Cold", 10, 7],
        ].map(([l, t, p]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => { setTemp(Number(t)); setPh(Number(p)); }} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Activity" value={`${activity.toFixed(0)}%`} accent={at} />
        <Stat label="Vmax" value={`${vmax.toFixed(0)} µmol/min`} accent={at} />
        <Stat label="Km" value={`${km} µmol/L`} accent={at} />
        <Stat label="Current v" value={`${rate.toFixed(1)} µmol/min`} accent={at} />
      </div>
    </SimShell>
  );
}

export function LocomotionSim({ topic }: { topic?: string }) {
  const a = "#14b8a6";
  const at = "text-teal-600 dark:text-teal-400";
  const kinds = ["Amoeba", "Earthworm", "Fish", "Bird"] as const;
  const [kind, setKind] = useState<(typeof kinds)[number]>("Amoeba");
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const phase = (sim.tick % 40) / 40;
  return (
    <SimShell
      icon="🦵"
      title={simTitle(topic, "Movement & locomotion")}
      accent="teal"
      subtitle={`${topic ?? "Support & movement"} — different animals move in different ways: amoeba uses pseudopodia, worms use muscles, fish use fins, birds use wings.`}
      hint="Amoeba extends pseudopodia (false feet) and flows. Earthworms use circular and longitudinal muscles to crawl. Fish swim with fins and a muscular tail."
      controls={<SimChip accent="teal"><span aria-hidden>🦵</span>{topic ?? "locomotion"}</SimChip>}
    >
      <SimCanvas
        deps={[kind, phase, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          if (kind === "Amoeba") {
            ctx.fillStyle = "#99f6e4";
            ctx.beginPath();
            const cx = 150 + phase * 200;
            ctx.arc(cx, 120, 40, 0, Math.PI * 2);
            ctx.moveTo(cx - 30, 100);
            ctx.arc(cx - 50, 90, 18, 0, Math.PI * 2);
            ctx.moveTo(cx + 30, 80);
            ctx.arc(cx + 52, 72, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#0f766e";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#115e59";
            ctx.beginPath();
            ctx.arc(cx, 118, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#134e4a";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("pseudopodia flow forward", 30, 200);
          } else if (kind === "Earthworm") {
            ctx.strokeStyle = "#c2410c";
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < 12; i++) {
              const x = 40 + ((i * 18 + phase * 30) % 500);
              ctx.beginPath();
              ctx.arc(x, 130 + Math.sin(i * 1.2 + sim.tick * 0.2) * 14, 12, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.fillStyle = "#9a3412";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("muscular contraction waves", 30, 200);
          } else if (kind === "Fish") {
            const cx = 150 + phase * 260;
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.ellipse(cx, 130, 46, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#0369a1";
            ctx.stroke();
            ctx.fillStyle = "#0ea5e9";
            ctx.beginPath();
            ctx.moveTo(cx + 44, 130);
            ctx.lineTo(cx + 70, 112);
            ctx.lineTo(cx + 70, 148);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#f43f5e";
            ctx.beginPath();
            ctx.arc(cx - 16, 122, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#0284c7";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx + 30, 130);
            ctx.lineTo(cx + 30, 130 - Math.sin(sim.tick * 0.3) * 8);
            ctx.moveTo(cx + 30, 130);
            ctx.lineTo(cx + 30, 130 + Math.sin(sim.tick * 0.3) * 8);
            ctx.stroke();
            ctx.fillStyle = "#075985";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("tail fin steers & thrusts", 30, 200);
          } else {
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(60, 190);
            ctx.lineTo(60, 80);
            ctx.stroke();
            ctx.fillStyle = "#f472b6";
            ctx.beginPath();
            ctx.arc(60, 70, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#be185d";
            ctx.lineWidth = 3;
            const flap = Math.sin(sim.tick * 0.25) * 0.9;
            ctx.beginPath();
            ctx.moveTo(72, 72);
            ctx.lineTo(120, 72 + flap * 26);
            ctx.quadraticCurveTo(110, 60 + flap * 18, 72, 66);
            ctx.fillStyle = "#f9a8d4";
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#be185d";
            ctx.beginPath();
            ctx.moveTo(72, 78);
            ctx.lineTo(120, 78 - flap * 26);
            ctx.quadraticCurveTo(110, 90 - flap * 18, 72, 84);
            ctx.fillStyle = "#f9a8d4";
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#9d174d";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("wings flap up and down", 30, 200);
          }
          ctx.fillStyle = "#134e4a";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(kind, 30, 26);
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {kinds.map((k) => (
          <ActionButton key={k} label={k} onClick={() => setKind(k)} hex={kind === k ? a : "#94a3b8"} />
        ))}
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Animal" value={kind} accent={at} />
        <Stat label="Method" value={kind === "Amoeba" ? "pseudopodia" : kind === "Earthworm" ? "muscle waves" : kind === "Fish" ? "fins + tail" : "wings"} accent={at} />
        <Stat label="Needs muscle" value={kind === "Amoeba" ? "no" : "yes"} accent={at} />
      </div>
    </SimShell>
  );
}

export function DigestionSim({ topic }: { topic?: string }) {
  const a = "#f43f5e";
  const at = "text-rose-600 dark:text-rose-400";
  const organs = ["mouth", "stomach", "small intestine", "large intestine"] as const;
  const [stage, setStage] = useState(0);
  const [auto, setAuto] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 2 * speedMul });
  const current = auto ? sim.tick % organs.length : stage;
  const info = [
    "teeth chew, saliva starts starch breakdown",
    "acid + enzymes break down protein",
    "bile and enzymes digest fats, sugars, proteins — absorbed",
    "water absorbed, waste formed",
  ];
  const pos = [
    [80, 130], [200, 90], [330, 130], [470, 190],
  ];
  return (
    <SimShell
      icon="🍽️"
      title={simTitle(topic, "Digestive system flow")}
      accent="rose"
      subtitle={`${topic ?? "Nutrition"} — food is broken down stage by stage: mouth → stomach → small intestine → large intestine.`}
      hint="Digestion means breaking food into soluble molecules that can be absorbed — glucose, amino acids, fatty acids."
      controls={<SimChip accent="rose"><span aria-hidden>🍽️</span>{topic ?? "digestion"}</SimChip>}
    >
      <SimCanvas
        deps={[current, auto, organs, pos, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "#fb7185";
          ctx.lineWidth = 8;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(60, 150);
          ctx.lineTo(140, 100);
          ctx.lineTo(240, 60);
          ctx.lineTo(340, 100);
          ctx.lineTo(420, 170);
          ctx.lineTo(530, 170);
          ctx.stroke();
          organs.forEach((o, i) => {
            const [x, y] = pos[i];
            const active = i === current;
            ctx.fillStyle = active ? "#e11d48" : "#fda4af";
            ctx.beginPath();
            ctx.arc(x, y, active ? 26 : 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#7f1d1d";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 10px system-ui";
            ctx.fillText(o, x - 26, y + 4);
          });
          const [bx, by] = pos[current];
          const b = (sim.tick % 2) * 10;
          ctx.fillStyle = "#b45309";
          ctx.beginPath();
          ctx.arc(bx + b * 0.4, by - 30 - b, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#9f1239";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`food in ${organs[current]} — ${info[current]}`, 30, 26);
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {organs.map((o, i) => (
          <ActionButton key={o} label={o} onClick={() => { setStage(i); setAuto(false); }} hex={current === i ? a : "#94a3b8"} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Auto-flow" checked={auto} onChange={setAuto} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Organ" value={organs[current]} accent={at} />
        <Stat label="Absorption" value={current === 2 ? "main site" : current === 3 ? "water" : "little"} accent={at} />
        <Stat label="Enzymes" value={current === 1 ? "protein" : current === 2 ? "all types" : "saliva"} accent={at} />
      </div>
    </SimShell>
  );
}

export function CirculationSim({ topic }: { topic?: string }) {
  const a = "#ef4444";
  const at = "text-red-600 dark:text-red-400";
  const [pump, setPump] = useState(true);
  const [showBlood, setShowBlood] = useState(true);
  const [hr, setHr] = useState(72);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const phase = pump ? (sim.elapsed * (hr / 60)) % 1 : 0;
  const beat = pump && phase < 0.25;
  const flowPos = phase;
  const cardiacOutput = (hr * 70) / 1000;
  const o2Art = pump ? (hr >= 50 ? 98 : 96) : 35;
  const o2Ven = pump ? Math.max(62, 76 - (hr - 70) * 0.12) : 20;
  return (
    <SimShell
      icon="🫀"
      title={simTitle(topic, "Heart & circulation")}
      accent="rose"
      subtitle={`${topic ?? "Transport"} — the heart pumps oxygenated blood to the body and deoxygenated blood to the lungs. Two circuits, one pump.`}
      hint="Right side sends blood to the lungs; left side sends it to the body. Valves stop backflow. Arterial blood is ~98% O2 saturated; venous blood returns ~75% saturated."
      controls={<SimChip accent="rose"><span aria-hidden>🫀</span>{topic ?? "circulation"}</SimChip>}
    >
      <SimCanvas
        deps={[pump, showBlood, beat, flowPos, hr, cardiacOutput, o2Art, o2Ven, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = w / 2;
          const cy = 120;
          const r = 52;
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "#fecaca";
          ctx.fill();
          if (beat) {
            ctx.strokeStyle = "#7f1d1d";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.strokeStyle = "#b91c1c";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(cx - 26, cy);
          ctx.lineTo(cx + 26, cy);
          ctx.moveTo(cx, cy - 40);
          ctx.lineTo(cx, cy + 40);
          ctx.stroke();
          ctx.fillStyle = "#7f1d1d";
          ctx.font = "bold 9px system-ui";
          ctx.fillText("R", cx - 20, cy - 28);
          ctx.fillText("L", cx + 8, cy - 28);
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(cx - r, cy - 30);
          ctx.lineTo(30, 40);
          ctx.moveTo(cx - r, cy + 30);
          ctx.lineTo(30, 200);
          ctx.moveTo(cx + r, cy - 30);
          ctx.lineTo(w - 30, 40);
          ctx.moveTo(cx + r, cy + 30);
          ctx.lineTo(w - 30, 200);
          ctx.stroke();
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(20, 20, 24, 210);
          ctx.strokeStyle = "#0369a1";
          ctx.strokeRect(20, 20, 24, 210);
          ctx.fillStyle = "#f43f5e";
          ctx.fillRect(w - 44, 20, 24, 210);
          ctx.strokeStyle = "#b91c1c";
          ctx.strokeRect(w - 44, 20, 24, 210);
          ctx.fillStyle = "#0369a1";
          ctx.font = "bold 10px system-ui";
          ctx.fillText("lungs", 14, 16);
          ctx.fillText(`O2 ${o2Ven.toFixed(0)}%`, 14, 30);
          ctx.fillStyle = "#b91c1c";
          ctx.fillText("body", w - 38, 16);
          ctx.fillText(`O2 ${o2Art.toFixed(0)}%`, w - 40, 30);
          if (showBlood && pump) {
            ctx.fillStyle = "#b91c1c";
            const px = 30 + flowPos * 60;
            ctx.beginPath();
            ctx.arc(px, 40 + flowPos * 40, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px, 200 - flowPos * 40, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(56,189,248,0.8)";
            ctx.beginPath();
            ctx.arc(w - 34 + ((1 - flowPos) * 0), 40 + flowPos * 40, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = "#7f1d1d";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(pump ? `heart ${hr} bpm — pumping` : "paused", 30, 26);
          ctx.fillText(`CO ${cardiacOutput.toFixed(1)} L/min`, 380, 26);
          ctx.fillStyle = "#b91c1c";
          ctx.font = "11px system-ui";
          ctx.fillText("→ pulmonary ← systemic", 380, 44);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Heart rate" value={hr} min={40} max={200} step={1} hex={a} accent={at} unit=" bpm" onChange={setHr} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Heartbeat" checked={pump} onChange={setPump} hex={a} />
        <Toggle label="Blood flow" checked={showBlood} onChange={setShowBlood} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Heart rate" value={`${hr} bpm`} accent={at} />
        <Stat label="Cardiac output" value={`${cardiacOutput.toFixed(1)} L/min`} accent={at} />
        <Stat label="Arterial SpO2" value={`${o2Art.toFixed(0)}%`} accent={at} />
        <Stat label="Venous SpO2" value={`${o2Ven.toFixed(0)}%`} accent="text-sky-600 dark:text-sky-400" />
      </div>
    </SimShell>
  );
}

export function KidneySim({ topic }: { topic?: string }) {
  const a = "#f59e0b";
  const at = "text-amber-600 dark:text-amber-400";
  const [filtration, setFiltration] = useState(60);
  const [reabsorb, setReabsorb] = useState(98);
  const [showWater, setShowWater] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const gfr = 125;
  const filtrate = gfr * (filtration / 100);
  const reabsorbed = filtrate * (reabsorb / 100);
  const urine = filtrate * (1 - reabsorb / 100);
  const urineLday = urine * 1.44;
  const flow = (sim.tick % 30) / 30;
  return (
    <SimShell
      icon="🫘"
      title={simTitle(topic, "Kidney & nephron")}
      accent="amber"
      subtitle={`${topic ?? "Homeostasis"} — the nephron filters blood at ~125 mL/min (GFR), then reabsorbs glucose and ~99% of the water back into the blood.`}
      hint="Glomerulus filters; tubule reabsorbs glucose and most water; what is left is urine. ADH tunes how much water is reabsorbed — healthy urine output is 1–2 L/day."
      controls={<SimChip accent="amber"><span aria-hidden>🫘</span>{topic ?? "kidney"}</SimChip>}
    >
      <SimCanvas
        deps={[filtration, reabsorb, urine, urineLday, filtrate, reabsorbed, flow, showWater, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#fef3c7";
          ctx.fillRect(40, 30, 420, 200);
          ctx.strokeStyle = "#b45309";
          ctx.lineWidth = 3;
          ctx.strokeRect(40, 30, 420, 200);
          ctx.strokeStyle = "#92400e";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(60, 230);
          ctx.lineTo(60, 60);
          ctx.stroke();
          ctx.fillStyle = "#dc2626";
          ctx.beginPath();
          ctx.arc(60, 60, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#92400e";
          ctx.font = "bold 10px system-ui";
          ctx.fillText("blood in", 20, 50);
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(150, 80, 22, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#92400e";
          ctx.stroke();
          ctx.fillStyle = "#92400e";
          ctx.font = "bold 9px system-ui";
          ctx.fillText("glomerulus", 110, 46);
          ctx.strokeStyle = "#a16207";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(150, 102);
          ctx.lineTo(150, 150);
          ctx.lineTo(350, 170);
          ctx.lineTo(350, 215);
          ctx.stroke();
          ctx.fillStyle = "#fef9c3";
          for (let i = 0; i < Math.round(filtration / 10); i++) {
            const x = 160 + ((i * 43 + sim.tick * 2) % 180);
            const y = 110 + ((i * 61 + sim.tick) % 90);
            ctx.fillStyle = "#eab308";
            ctx.fillRect(x, y, 5, 5);
          }
          if (showWater) {
            ctx.strokeStyle = "#0ea5e9";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(250, 160);
            ctx.lineTo(250, 140);
            ctx.stroke();
            ctx.fillStyle = "#0369a1";
            ctx.font = "9px system-ui";
            ctx.fillText("reabsorb (glucose + water)", 230, 130);
          }
          const urineH = Math.min(80, (urine / 5) * 80);
          ctx.fillStyle = "#f59e0b";
          ctx.fillRect(330, 215 - urineH, 60, 20 + urineH);
          ctx.strokeStyle = "#7c2d12";
          ctx.strokeRect(330, 215 - urineH, 60, 20 + urineH);
          ctx.fillStyle = "#7c2d12";
          ctx.font = "bold 9px system-ui";
          ctx.fillText(`urine ${urine.toFixed(2)} mL/min`, 332, 232);
          ctx.fillStyle = "#92400e";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`GFR ${filtrate.toFixed(0)} mL/min · reabsorb ${reabsorb.toFixed(0)}%`, 30, 26);
          ctx.fillStyle = "#78350f";
          ctx.font = "11px system-ui";
          ctx.fillText(`glucose ${reabsorb >= 95 ? "fully reabsorbed ✓" : "some lost in urine"}`, 40, 248);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Filtration (% of GFR)" value={filtration} min={10} max={100} step={1} hex={a} accent={at} unit="%" onChange={setFiltration} />
        <Slider label="Water reabsorbed" value={reabsorb} min={60} max={99.9} step={0.1} hex={a} accent={at} unit="%" onChange={setReabsorb} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show reabsorption" checked={showWater} onChange={setShowWater} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Filtrate (GFR)" value={`${filtrate.toFixed(0)} mL/min`} accent={at} />
        <Stat label="Reabsorbed" value={`${reabsorbed.toFixed(1)} mL/min`} accent={at} />
        <Stat label="Urine output" value={`${urine.toFixed(2)} mL/min`} accent={at} />
        <Stat label="Urine / day" value={`${urineLday.toFixed(2)} L`} accent={at} />
      </div>
    </SimShell>
  );
}

export function FoodWebSim({ topic }: { topic?: string }) {
  const a = "#10b981";
  const at = "text-emerald-600 dark:text-emerald-400";
  const [energy, setEnergy] = useState(100);
  const [showArrows, setShowArrows] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const levels = [
    { name: "grass (producer)", x: 90, energy: energy, color: "#22c55e", pop: Math.round(energy) },
    { name: "grasshopper", x: 230, energy: energy * 0.1, color: "#84cc16", pop: Math.max(1, Math.round(energy * 0.05)) },
    { name: "frog", x: 370, energy: energy * 0.01, color: "#f97316", pop: Math.max(1, Math.round(energy * 0.0025)) },
    { name: "snake", x: 510, energy: energy * 0.001, color: "#8b5cf6", pop: Math.max(1, Math.round(energy * 0.000125)) },
  ];
  const pop = (sim.tick % 20) / 20;
  return (
    <SimShell
      icon="🕸️"
      title={simTitle(topic, "Food web & energy pyramid")}
      accent="emerald"
      subtitle={`${topic ?? "Ecology"} — energy flows from producers up through consumers. Each level passes on only ~10% of the energy, so fewer and fewer organisms can be supported at the top.`}
      hint="A pyramid of energy always tapers: fewer top predators can be supported. If the producer level shrinks, all the levels above shrink too. Each grass plant supports ~1/10 of a grasshopper's energy needs."
      controls={<SimChip accent="emerald"><span aria-hidden>🕸️</span>{topic ?? "food web"}</SimChip>}
    >
      <SimCanvas
        deps={[energy, showArrows, pop, levels, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          levels.forEach((l, i) => {
            const bw = Math.max(12, (l.energy / energy) * 240);
            const bh = 40;
            const x = 60;
            const y = 20 + i * 54;
            ctx.fillStyle = l.color;
            ctx.fillRect(x, y, bw, bh);
            ctx.strokeStyle = "#1e293b";
            ctx.strokeRect(x, y, bw, bh);
            ctx.fillStyle = "#1e293b";
            ctx.font = "10px system-ui";
            ctx.fillText(l.name, x + bw + 6, y + 16);
            ctx.fillText(`${l.energy.toFixed(1)} kJ · ${l.pop} organisms`, x + bw + 6, y + 30);
            if (i < levels.length - 1 && showArrows) {
              ctx.strokeStyle = "#64748b";
              ctx.lineWidth = 2;
              const ay = y + bh + 4;
              const ax = 180;
              ctx.beginPath();
              ctx.moveTo(ax, ay);
              ctx.lineTo(ax, ay + 4);
              ctx.stroke();
            }
          });
          ctx.fillStyle = "#065f46";
          ctx.font = "bold 12px system-ui";
          ctx.fillText("energy pyramid — ~10% passes up each level", 30, 240);
        }}
      />
      <div className="mt-4">
        <Slider label="Producer energy" value={energy} min={100} max={1000} step={50} hex={a} accent={at} unit=" kJ" onChange={setEnergy} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show flow arrows" checked={showArrows} onChange={setShowArrows} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Energy transfer" value="~10% each" accent={at} />
        <Stat label="Producers" value={`${Math.round(energy)}`} accent={at} />
        <Stat label="Top consumers" value={`${levels[3].pop}`} accent={at} />
      </div>
    </SimShell>
  );
}

export function FermentationSim({ topic }: { topic?: string }) {
  const a = "#14b8a6";
  const at = "text-teal-600 dark:text-teal-400";
  const [sugar, setSugar] = useState(50);
  const [temp, setTemp] = useState(30);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const rate = Math.max(0, sugar * (1 - Math.abs(temp - 35) / 45) / 2);
  const bubbles = Math.max(0, Math.round(rate));
  const gas = (sim.tick * rate) % 100;
  return (
    <SimShell
      icon="🍞"
      title={simTitle(topic, "Fermentation by yeast")}
      accent="teal"
      subtitle={`${topic ?? "Biotechnology"} — yeast respires anaerobically: glucose → ethanol + carbon dioxide. The CO2 bubbles off and makes bread rise.`}
      hint="Fermentation needs sugar and a warm temperature. Too cold slows it; too hot kills the yeast. Alcohol concentration also limits it."
      controls={<SimChip accent="teal"><span aria-hidden>🍞</span>{topic ?? "fermentation"}</SimChip>}
    >
      <SimCanvas
        deps={[sugar, temp, rate, bubbles, gas, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "#0f766e";
          ctx.lineWidth = 3;
          ctx.strokeRect(60, 60, 160, 150);
          ctx.fillStyle = "#fef3c7";
          ctx.fillRect(60, 60, 160, 150);
          ctx.fillStyle = "#b45309";
          ctx.fillRect(60, 160, 160, 50);
          ctx.fillStyle = "#92400e";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("yeast + glucose", 80, 185);
          for (let i = 0; i < bubbles; i++) {
            const t = ((sim.tick + i * 3) % 25) / 25;
            const x = 100 + (i % 3) * 30;
            const y = 200 - t * 130;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#5eead4";
            ctx.fill();
            ctx.strokeStyle = "#0d9488";
            ctx.stroke();
          }
          ctx.strokeStyle = "#0f766e";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(220, 80);
          ctx.lineTo(280, 80);
          ctx.stroke();
          ctx.fillStyle = "#0f766e";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("CO2 out", 235, 72);
          const gasH = (gas / 100) * 130;
          ctx.fillStyle = "#99f6e4";
          ctx.fillRect(300, 220 - gasH, 80, gasH);
          ctx.strokeStyle = "#0f766e";
          ctx.strokeRect(300, 90, 80, 130);
          ctx.fillStyle = "#134e4a";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("gas", 320, 84);
          ctx.fillStyle = "#134e4a";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`rate ${rate.toFixed(1)}`, 30, 26);
          ctx.fillStyle = "#0f766e";
          ctx.font = "12px system-ui";
          ctx.fillText(`gas ${gas.toFixed(0)}%`, 30, 44);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Sugar" value={sugar} min={0} max={100} step={1} hex={a} accent={at} unit="%" onChange={setSugar} />
        <Slider label="Temperature" value={temp} min={0} max={60} step={1} hex={a} accent={at} unit="°C" onChange={setTemp} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Products" value="ethanol + CO2" accent={at} />
        <Stat label="Bubbles/s" value={`${bubbles}`} accent={at} />
        <Stat label="Optimum T" value="~35 °C" accent={at} />
      </div>
    </SimShell>
  );
}

export function ReproductionSim({ topic }: { topic?: string }) {
  const a = "#d946ef";
  const at = "text-fuchsia-600 dark:text-fuchsia-400";
  const kinds = ["Binary fission", "Budding", "Fragmentation"] as const;
  const [kind, setKind] = useState<(typeof kinds)[number]>("Binary fission");
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const progress = Math.min(1, sim.tick / 50);
  const split = progress > 0.5;
  return (
    <SimShell
      icon="🧫"
      title={simTitle(topic, "Asexual reproduction")}
      accent="fuchsia"
      subtitle={`${topic ?? "Reproduction"} — one parent produces identical offspring. No gametes, no fertilisation — it is fast but creates no genetic variation.`}
      hint="Bacteria split by binary fission, yeast buds, and some plants and worms reproduce by fragmentation. Offspring are clones of the parent."
      controls={<SimChip accent="fuchsia"><span aria-hidden>🧫</span>{topic ?? "reproduction"}</SimChip>}
    >
      <SimCanvas
        deps={[kind, progress, split, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = w / 2;
          const cy = h / 2;
          const drawCell = (x: number, y: number, r: number, color: string, label?: string) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#701a75";
            ctx.lineWidth = 2;
            ctx.stroke();
            if (label) {
              ctx.fillStyle = "#fff";
              ctx.font = "9px system-ui";
              ctx.fillText(label, x - 12, y + 4);
            }
          };
          if (kind === "Binary fission") {
            if (!split) {
              const shrink = progress * 8;
              drawCell(cx, cy, 40 - shrink, "#f5d0fe", "bacteria");
            } else {
              drawCell(cx - 45, cy, 32, "#f5d0fe", "1");
              drawCell(cx + 45, cy, 32, "#f0abfc", "2");
            }
            ctx.fillStyle = "#701a75";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(split ? "2 identical cells" : "cell pinches in the middle", 30, 26);
          } else if (kind === "Budding") {
            drawCell(cx - 60, cy, 38, "#f5d0fe", "parent");
            const budR = 14 + progress * 10;
            drawCell(cx + 20 + progress * 30, cy - 20 - progress * 14, budR, "#f0abfc", "bud");
            ctx.fillStyle = "#701a75";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("bud grows off parent", 30, 26);
          } else {
            if (!split) {
              drawCell(cx - 55, cy, 42, "#f5d0fe", "parent");
            } else {
              drawCell(cx - 55, cy, 26, "#f5d0fe", "piece");
              drawCell(cx + 40, cy + 30, 34, "#f0abfc", "new");
            }
            ctx.fillStyle = "#701a75";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(split ? "broken piece grows a new body" : "body breaks into pieces", 30, 26);
          }
          ctx.fillStyle = "#a21caf";
          ctx.font = "12px system-ui";
          ctx.fillText(kind, 30, 46);
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {kinds.map((k) => (
          <ActionButton key={k} label={k} onClick={() => setKind(k)} hex={kind === k ? a : "#94a3b8"} />
        ))}
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Type" value={kind} accent={at} />
        <Stat label="Parents" value="one" accent={at} />
        <Stat label="Variation" value="none (clones)" accent={at} />
      </div>
    </SimShell>
  );
}

export function ClassificationSim({ topic }: { topic?: string }) {
  const a = "#0ea5e9";
  const at = "text-sky-600 dark:text-sky-400";
  const tree = [
    { level: "Domain", options: ["Eukarya"] },
    { level: "Kingdom", options: ["Animalia", "Plantae"] },
    { level: "Phylum", options: ["Chordata", "Arthopoda", "Angiosperms", "Bryophytes"] },
  ];
  const [path, setPath] = useState<number[]>([0, 0, 0]);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const example = path[1] === 0 ? (path[2] === 0 ? "human" : "butterfly") : path[2] === 0 ? "flowering plant" : "moss";
  return (
    <SimShell
      icon="🌳"
      title={simTitle(topic, "Classification tree")}
      accent="sky"
      subtitle={`${topic ?? "Biodiversity"} — living things are grouped from the broadest level (Domain) down to the most specific (Species).`}
      hint="The hierarchy: Domain → Kingdom → Phylum → Class → Order → Family → Genus → Species. King Philip Came Over For Good Soup!"
      controls={<SimChip accent="sky"><span aria-hidden>🌳</span>{topic ?? "classification"}</SimChip>}
    >
      <SimCanvas
        deps={[path, example, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const topY = 40;
          const colX = [80, 200, 340, 480];
          const pick = (i: number, sel: number) => {
            const opts = tree[i].options;
            const chosen = opts[sel % opts.length];
            ctx.fillStyle = "#0ea5e9";
            ctx.fillRect(colX[i] - 30, topY + i * 52, 60, 30);
            ctx.strokeStyle = "#075985";
            ctx.strokeRect(colX[i] - 30, topY + i * 52, 60, 30);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 10px system-ui";
            ctx.fillText(chosen, colX[i] - 26, topY + i * 52 + 19);
            if (i < 3) {
              ctx.strokeStyle = "#94a3b8";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(colX[i] + 30, topY + i * 52 + 15);
              ctx.lineTo(colX[i + 1] - 30, topY + (i + 1) * 52 + 15);
              ctx.stroke();
            }
            return chosen;
          };
          const chosen = [pick(0, path[0]), pick(1, path[1]), pick(2, path[2])];
          ctx.fillStyle = "#075985";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(chosen.join(" → ") + " → " + example, 30, 26);
          ctx.fillStyle = "#0c4a6e";
          ctx.font = "12px system-ui";
          ctx.fillText(`example: ${example}`, 30, 230);
        }}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {tree.map((t, i) => (
          <div key={t.level}>
            <div className="mb-1 text-sm font-semibold text-foreground/70">{t.level}</div>
            <div className="flex flex-wrap gap-2">
              {t.options.map((o, j) => (
                <ActionButton key={o} label={o} onClick={() => setPath((p) => p.map((v, k) => (k === i ? j : v)))} hex={path[i] === j ? a : "#94a3b8"} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Broadest" value="Domain" accent={at} />
        <Stat label="Narrowest" value="Species" accent={at} />
        <Stat label="Example" value={example} accent={at} />
      </div>
    </SimShell>
  );
}

export function GasExchangeSim({ topic }: { topic?: string }) {
  const a = "#06b6d4";
  const at = "text-cyan-600 dark:text-cyan-400";
  const [rate, setRate] = useState(16);
  const [showExchange, setShowExchange] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const breath = (sim.tick % Math.max(1, Math.round(120 / rate))) / Math.max(1, Math.round(120 / rate));
  const inhale = breath < 0.5;
  const lungR = 40 + (inhale ? 12 : 0);
  const ribY = 170 + (inhale ? -8 : 8);
  return (
    <SimShell
      icon="🫁"
      title={simTitle(topic, "Gaseous exchange")}
      accent="cyan"
      subtitle={`${topic ?? "Respiration"} — in the alveoli, oxygen moves into the blood and carbon dioxide moves out. Breathing moves air in and out of the lungs.`}
      hint="High O2 in air, low in blood → O2 diffuses in. High CO2 in blood → CO2 diffuses out. Thin moist walls make the exchange fast."
      controls={<SimChip accent="cyan"><span aria-hidden>🫁</span>{topic ?? "gas exchange"}</SimChip>}
    >
      <SimCanvas
        deps={[rate, inhale, breath, lungR, showExchange, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "#0e7490";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(100, 40);
          ctx.lineTo(100, ribY);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(100, 60, 8, 0, Math.PI * 2);
          ctx.fillStyle = "#0e7490";
          ctx.fill();
          ctx.fillStyle = "#cffafe";
          ctx.beginPath();
          ctx.ellipse(160, 100, 50, lungR, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#0e7490";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = "#fecdd3";
          ctx.beginPath();
          ctx.ellipse(300, 100, 50, lungR, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#be123c";
          ctx.stroke();
          ctx.fillStyle = "#0e7490";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(inhale ? "inhale — diaphragm down" : "exhale — diaphragm up", 30, 26);
          ctx.fillStyle = "#334155";
          ctx.font = "12px system-ui";
          ctx.fillText(`rate ${rate}/min`, 30, 46);
          ctx.fillStyle = "#0e7490";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("alveoli", 140, 200);
          if (showExchange) {
            const ex = 260;
            ctx.fillStyle = "#ef4444";
            ctx.font = "bold 10px system-ui";
            ctx.fillText("O2 →", ex, 120);
            ctx.fillStyle = "#334155";
            ctx.fillText("← CO2", ex, 140);
            ctx.strokeStyle = "rgba(239,68,68,0.6)";
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(320, 110);
            ctx.lineTo(380, 100);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }}
      />
      <div className="mt-4">
        <Slider label="Breathing rate" value={rate} min={6} max={40} step={1} hex={a} accent={at} unit=" /min" onChange={setRate} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show gas exchange" checked={showExchange} onChange={setShowExchange} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Inhaled" value="O2 rich" accent={at} />
        <Stat label="Exhaled" value="CO2 rich" accent="text-rose-600 dark:text-rose-400" />
        <Stat label="Site" value="alveoli" accent={at} />
      </div>
    </SimShell>
  );
}

export function NervousSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [fire, setFire] = useState(true);
  const [showSynapse, setShowSynapse] = useState(true);
  const [impulse, setImpulse] = useState(80);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const speed = 20 + (impulse / 100) * 100;
  const signal = fire ? Math.min(1, (sim.elapsed * speed) % 1) : 0;
  const active = (x: number) => signal > x - 0.15 && signal < x + 0.3;
  const spots = [
    { label: "receptor", x: 70 },
    { label: "sensory", x: 170 },
    { label: "synapse", x: 300 },
    { label: "motor", x: 430 },
    { label: "muscle", x: 540 },
  ];
  const dist = 1.6;
  const reflexTime = (dist / speed) * 1000;
  return (
    <SimShell
      icon="🧠"
      title={simTitle(topic, "Reflex arc & neuron")}
      accent="violet"
      subtitle={`${topic ?? "Coordination & control"} — a stimulus triggers a receptor; a signal races along a sensory neuron at ~${speed.toFixed(0)} m/s, crosses a synapse, and reaches a muscle via a motor neuron.`}
      hint="Reflexes are fast and automatic — the signal travels through the spinal cord without conscious thought, like pulling your hand from a hot pan. At ${speed.toFixed(0)} m/s the ~1.6 m round path takes about ${reflexTime.toFixed(1)} ms."
      controls={<SimChip accent="violet"><span aria-hidden>🧠</span>{topic ?? "nervous system"}</SimChip>}
    >
      <SimCanvas
        deps={[fire, showSynapse, signal, active, speed, reflexTime, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const y = h / 2;
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(70, y);
          ctx.lineTo(540, y);
          ctx.stroke();
          spots.forEach((s) => {
            const on = active(s.x);
            ctx.fillStyle = on ? "#a78bfa" : "#c4b5fd";
            ctx.beginPath();
            ctx.arc(s.x, y, on ? 12 : 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#5b21b6";
            ctx.stroke();
            ctx.fillStyle = "#4c1d95";
            ctx.font = "bold 10px system-ui";
            ctx.fillText(s.label, s.x - 24, y + 30);
          });
          if (showSynapse) {
            ctx.fillStyle = "#6d28d9";
            ctx.font = "bold 10px system-ui";
            ctx.fillText("neurotransmitters", 260, y - 20);
            for (let i = 0; i < 4; i++) {
              ctx.fillStyle = `rgba(109,40,217,${0.6 + (sim.tick + i) % 2 * 0.3})`;
              ctx.beginPath();
              ctx.arc(300 + (i - 1.5) * 8, y - 12, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.fillStyle = "#5b21b6";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(fire ? "signal firing" : "signal paused", 30, 26);
          ctx.fillStyle = "#4c1d95";
          ctx.font = "12px system-ui";
          ctx.fillText(`conducting at ${speed.toFixed(0)} m/s · full reflex ≈ ${reflexTime.toFixed(1)} ms`, 30, 46);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Impulse speed" value={impulse} min={0} max={100} step={1} hex={a} accent={at} unit="%" onChange={setImpulse} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Fire signal" checked={fire} onChange={setFire} hex={a} />
        <Toggle label="Show synapse" checked={showSynapse} onChange={setShowSynapse} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Conduction" value={`${speed.toFixed(0)} m/s`} accent={at} />
        <Stat label="Reflex time" value={`${reflexTime.toFixed(1)} ms`} accent={at} />
        <Stat label="Centre" value="spinal cord" accent={at} />
      </div>
    </SimShell>
  );
}
