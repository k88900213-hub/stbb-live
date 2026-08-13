"use client";

import { useState, useCallback } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";

const COLORS: Record<string, string> = { A: "#ef4444", B: "#3b82f6", C: "#22c55e", D: "#f59e0b" };

interface PState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
}

function initPositions(n: number, w: number, h: number): PState[] {
  return Array.from({ length: n }, (_, i) => ({
    x: 60 + ((i * 127 + 43) % (w - 120)),
    y: 40 + ((i * 89 + 17) % (h - 80)),
    vx: ((i * 37 % 100) / 100 - 0.5) * 2.2,
    vy: ((i * 53 % 100) / 100 - 0.5) * 2.2,
    t: i < 6 ? 0 : 1,
  }));
}

const W = 560;
const H = 320;

export function EquilibriumSim({ topic }: { topic?: string }) {
  const a = "#f59e0b";
  const at = "text-amber-600 dark:text-amber-400";

  const [tempC, setTempC] = useState(400);
  const [concA, setConcA] = useState(6);
  const [concB, setConcB] = useState(8);
  const [volume, setVolume] = useState(100);
  const [perturbation, setPerturbation] = useState<string | null>(null);
  const [extraA, setExtraA] = useState(0);
  const [extraB, setExtraB] = useState(0);
  const [removedC, setRemovedC] = useState(0);
  const sim = useSim({ fps: 60 });

  const tf = Math.sqrt((tempC + 273) / 673);
  const nTotal = concA + concB + extraA + extraB;
  const states = initPositions(nTotal, W, H);

  const perturb = useCallback(
    (label: string) => {
      setPerturbation(label);
      if (label === "add_A") setExtraA((e) => e + 4);
      else if (label === "add_B") setExtraB((e) => e + 6);
      else if (label === "remove_C") setRemovedC((r) => r + 3);
      else if (label === "compress") setVolume((v) => Math.max(40, v - 30));
      else if (label === "expand") setVolume((v) => Math.min(160, v + 30));
      setTimeout(() => setPerturbation(null), 800);
    },
    []
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      ctx.clearRect(0, 0, w, h);

      const scale = Math.sqrt(100 / volume);
      const boxW = (w - 120) * Math.min(scale, 1.3);
      const boxH = (h - 80) * Math.min(scale, 1.3);
      const boxX = (w - boxW) / 2;
      const boxY = (h - boxH) / 2;

      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = "rgba(254,243,199,0.12)";
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = "#92400e";
      ctx.font = "11px system-ui";
      ctx.fillText(`V = ${volume} mL`, boxX + 6, boxY - 6);

      const t = sim.tick;
      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        const px = boxX + 8 + ((s.x + s.vx * t * tf * 3) % (boxW - 16) + (boxW - 16)) % (boxW - 16);
        const py = boxY + 8 + ((s.y + s.vy * t * tf * 3) % (boxH - 16) + (boxH - 16)) % (boxH - 16);
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[s.t === 0 ? "A" : "B"];
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      const nA = concA + extraA;
      const nB = concB + extraB;
      const nC = Math.max(0, Math.floor(t * 0.02 * tf) - removedC);
      const concScale = 100 / volume;
      const kC = nC > 0 && nA > 0 && nB > 0 ? ((nC * concScale) * (nC * concScale)) / ((nA * concScale) * (nB * concScale) * (nB * concScale)) : 0;

      ctx.fillStyle = "#78716c";
      ctx.font = "11px system-ui";
      ctx.fillText(`Kc ≈ ${kC.toFixed(3)}  |  N₂: ${nA}  H₂: ${nB}  NH₃: ${nC}`, boxX, boxY - 6);
    },
    [sim.tick, volume, concA, concB, extraA, extraB, removedC, tf, states]
  );

  const nA = concA + extraA;
  const nB = concB + extraB;
  const nC = Math.max(0, Math.floor((sim.tick || 0) * 0.02 * tf) - removedC);
  const concScale = 100 / volume;
  const kC = nC > 0 && nA > 0 && nB > 0 ? ((nC * concScale) * (nC * concScale)) / ((nA * concScale) * (nB * concScale) * (nB * concScale)) : 0;

  return (
    <SimShell
      icon="⚗️"
      title={simTitle(topic, "Chemical Equilibrium & Le Chatelier's Principle")}
      accent="amber"
      subtitle={`${topic ?? "Equilibrium"} — N₂ + 3H₂ ⇌ 2NH₃. Add reactants, remove product, compress or heat to see Le Chatelier's principle in action.`}
      hint={`Kc ≈ ${kC.toFixed(3)}. Increasing T favours the endothermic reverse reaction; decreasing V (increasing P) favours the side with fewer gas molecules.`}
      controls={<SimChip accent="amber"><span aria-hidden>⚗️</span>{topic ?? "equilibrium"}</SimChip>}
    >
      <SimCanvas deps={[sim.tick, tempC, volume, concA, concB, extraA, extraB, removedC, perturbation]} draw={draw} />

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={() => { sim.reset(); setExtraA(0); setExtraB(0); setRemovedC(0); }} hex={a} />
        <Slider label="Temperature" value={tempC} min={100} max={800} step={10} unit="°C" hex={a} onChange={setTempC} />
        <Slider label="Volume" value={volume} min={40} max={160} step={5} unit="mL" hex={a} onChange={setVolume} />
        <Slider label="Initial N₂" value={concA} min={2} max={12} step={1} hex={a} onChange={setConcA} />
        <Slider label="Initial H₂" value={concB} min={2} max={14} step={1} hex={a} onChange={setConcB} />
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <ActionButton label="+ N₂" icon="🔴" hex={a} onClick={() => perturb("add_A")} title="Add N₂ (Le Chatelier: shifts right)" />
        <ActionButton label="+ H₂" icon="🔵" hex={a} onClick={() => perturb("add_B")} title="Add H₂ (Le Chatelier: shifts right)" />
        <ActionButton label="− NH₃" icon="🟢" hex={a} onClick={() => perturb("remove_C")} title="Remove NH₃ (Le Chatelier: shifts right)" />
        <ActionButton label="Compress" icon="⬇️" hex={a} onClick={() => perturb("compress")} title="Decrease volume → increase P → shift right" />
        <ActionButton label="Expand" icon="⬆️" hex={a} onClick={() => perturb("expand")} title="Increase volume → decrease P → shift left" />
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        <Stat label="N₂ (A)" value={`${nA}`} accent={at} />
        <Stat label="H₂ (B)" value={`${nB}`} accent={at} />
        <Stat label="NH₃ (C)" value={`${nC}`} accent={at} />
        <Stat label="Kc" value={kC.toFixed(3)} accent={at} />
        <Stat label="Temp" value={`${tempC} °C`} accent={at} />
        <Stat label="P ∝ 1/V" value={`${(100 / volume).toFixed(2)}×`} accent={at} />
      </div>
    </SimShell>
  );
}
