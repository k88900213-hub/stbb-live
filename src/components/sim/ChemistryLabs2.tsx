"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

export function DiffusionSim({ topic }: { topic?: string }) {
  const a = "#06b6d4";
  const at = "text-cyan-600 dark:text-cyan-400";
  const gases: Record<string, number> = { H2: 2.016, He: 4.003, CH4: 16.04, N2: 28.01, O2: 32.0, CO2: 44.01, Cl2: 70.9 };
  const [gasA, setGasA] = useState("H2");
  const [gasB, setGasB] = useState("N2");
  const [tempC, setTempC] = useState(25);
  const [removed, setRemoved] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const N = 24;
  const TK = tempC + 273;
  const speedA = Math.sqrt(TK / gases[gasA]);
  const speedB = Math.sqrt(TK / gases[gasB]);
  const ratio = speedA / speedB;
  const driftA = removed ? Math.min(1, sim.elapsed * 0.55 * (speedA / speedB)) : 0;
  const driftB = removed ? Math.min(1, sim.elapsed * 0.55) : 0;
  const mixed = removed && driftA >= 1 && driftB >= 1;
  return (
    <SimShell
      icon="🌫️"
      title={simTitle(topic, "Diffusion & Graham's law")}
      accent="cyan"
      subtitle={`${topic ?? "Diffusion"} — gas particles spread from high to low concentration. Rate ∝ √(T/M): light gases diffuse fastest (Graham's law).`}
      hint={`Graham's law: rate₁/rate₂ = √(M₂/M₁). At equal temperature, ${gasA} (M=${gases[gasA].toFixed(1)}) effuses ${ratio.toFixed(2)}× faster than ${gasB} (M=${gases[gasB].toFixed(1)}).`}
      controls={<SimChip accent="cyan"><span aria-hidden>🌫️</span>{topic ?? "diffusion"}</SimChip>}
    >
      <SimCanvas
        deps={[tempC, sim.tick, removed, driftA, driftB, mixed, gasA, gasB, speedA, speedB]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "#155e75";
          ctx.lineWidth = 2.5;
          ctx.strokeRect(60, 30, w - 120, h - 60);
          ctx.fillStyle = "rgba(165,243,252,0.18)";
          ctx.fillRect(60, 30, (w - 120) / 2, h - 60);
          ctx.fillStyle = "rgba(254,215,170,0.18)";
          ctx.fillRect(60 + (w - 120) / 2, 30, (w - 120) / 2, h - 60);
          ctx.fillStyle = "#155e75";
          ctx.font = "11px system-ui";
          ctx.fillText(`${gasA} (M=${gases[gasA].toFixed(1)})`, 72, 26);
          ctx.fillText(`${gasB} (M=${gases[gasB].toFixed(1)})`, w / 2 + 18, 26);
          if (removed) {
            ctx.strokeStyle = `rgba(51,65,85,${0.5 - Math.max(driftA, driftB) * 0.4})`;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.moveTo(w / 2, 30);
            ctx.lineTo(w / 2, h - 30);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          const wob = (i: number, left: boolean, spd: number) =>
            Math.sin(i * 2.4 + sim.tick * 0.22 * spd) * (42 * spd) + Math.sin(i * 1.3 + sim.tick * 0.4 * spd) * 18;
          for (let i = 0; i < N; i++) {
            const left = i % 2 === 0;
            const spd = left ? speedA : speedB;
            const baseX = left ? 100 + (w - 120) * 0.18 : w / 2 + 46;
            const cross = (left ? 1 : -1) * (left ? driftA : driftB) * (w - 120) * 0.5;
            const x = Math.min(w - 80, Math.max(80, baseX + wob(i, left, spd) * 0.4 + cross));
            const y = 45 + ((i * 37) % (h - 80));
            ctx.beginPath();
            ctx.arc(x, y, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = left ? "#0891b2" : "#ea580c";
            ctx.globalAlpha = 0.85;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = "#0e7490";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(
            mixed
              ? `fully mixed · ${gasA} travelled first (Graham)`
              : removed
                ? `mixing… ${gasA} ${(driftA * 100).toFixed(0)}% · ${gasB} ${(driftB * 100).toFixed(0)}%`
                : "remove the partition to start",
            30,
            h - 10,
          );
          ctx.fillStyle = "#164e63";
          ctx.font = "12px system-ui";
          ctx.fillText(`rate ratio ${gasA}:${gasB} = ${ratio.toFixed(2)} (√(M${gasB}/M${gasA})) · ${tempC} °C`, 30, h - 28);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Gas A (light)</span>
          <select value={gasA} onChange={(e) => setGasA(e.target.value)} className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            {Object.keys(gases).map((g) => (
              <option key={g} value={g}>{g} · {gases[g].toFixed(1)} g/mol</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Gas B (heavy)</span>
          <select value={gasB} onChange={(e) => setGasB(e.target.value)} className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            {Object.keys(gases).map((g) => (
              <option key={g} value={g}>{g} · {gases[g].toFixed(1)} g/mol</option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2">
          <Slider label="Temperature" value={tempC} min={0} max={100} step={1} hex={a} accent={at} unit=" °C" onChange={setTempC} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Partition removed" checked={removed} onChange={setRemoved} hex={a} hint="lets the two gases mix" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Graham ratio" value={`${ratio.toFixed(2)}×`} accent={at} />
        <Stat label="Speed ∝ √(T/M)" value={`${gasA} > ${gasB}`} accent={at} />
        <Stat label="Example" value="H₂ balloon leaks first" accent={at} />
      </div>
    </SimShell>
  );
}

export function CrystallizationSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [temp, setTemp] = useState(80);
  const [conc, setConc] = useState(60);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const maxCrystals = conc > 25 && temp < 50 ? Math.max(1, Math.round((50 - temp) / 5) + Math.round(conc / 20)) : 0;
  const growth = Math.min(1, sim.elapsed / 10);
  const crystals = Math.max(0, Math.round(maxCrystals * growth));
  return (
    <SimShell
      icon="💎"
      title={simTitle(topic, "Crystallization")}
      accent="violet"
      subtitle={`${topic ?? "Crystallization"} — cooling a hot saturated solution lowers solubility, so solute comes out of solution as crystals.`}
      hint="Salt is obtained from brine by evaporating water; sugar and alum crystals grow when a hot concentrated solution cools slowly."
      controls={<SimChip accent="violet"><span aria-hidden>💎</span>{topic ?? "crystallization"}</SimChip>}
    >
      <SimCanvas
        deps={[temp, conc, sim.tick, crystals, growth]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "#7c3aed";
          ctx.lineWidth = 3;
          ctx.strokeRect(70, 40, w - 140, h - 80);
          const fillH = Math.min(h - 100, 40 + (100 - temp) * 0.7);
          const grad = ctx.createLinearGradient(0, 40 + (h - 80) - fillH, 0, h - 40);
          grad.addColorStop(0, "rgba(196,181,253,0.45)");
          grad.addColorStop(1, "rgba(139,92,246,0.7)");
          ctx.fillStyle = grad;
          ctx.fillRect(70, 40 + (h - 80) - fillH, w - 140, fillH);
          for (let i = 0; i < crystals; i++) {
            const x = 92 + ((i * 97) % (w - 184));
            const y = 40 + (h - 80) - fillH + 18 + ((i * 53) % Math.max(10, fillH - 24));
            const size = 4 + ((i * 13) % 6);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 4 + (i % 2) * (Math.PI / 2) + sim.tick * 0.01);
            ctx.fillStyle = "#a78bfa";
            ctx.fillRect(-size, -size, size * 2, size * 2);
            ctx.strokeStyle = "#6d28d9";
            ctx.strokeRect(-size, -size, size * 2, size * 2);
            ctx.restore();
          }
          ctx.fillStyle = "#4c1d95";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(
            crystals > 0 ? `${crystals} crystals growing…` : maxCrystals > 0 ? "solution cooling — crystals will form" : "still saturated — heat or dilute",
            30,
            30,
          );
          ctx.fillStyle = "#6d28d9";
          ctx.font = "12px system-ui";
          ctx.fillText(`solubility at ${temp}°C is low → solute precipitates`, 30, 52);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Temperature" value={temp} min={0} max={100} step={1} hex={a} accent={at} unit=" °C" onChange={setTemp} />
        <Slider label="Concentration" value={conc} min={0} max={100} step={1} hex={a} accent={at} unit="%" onChange={setConc} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <ActionButton label="Cool to 20 °C" icon="❄️" hex="#38bdf8" onClick={() => setTemp(20)} />
        <ActionButton label="Re-dissolve" icon="🔥" hex="#f97316" onClick={() => setTemp(100)} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Crystals formed" value={`${crystals}`} accent={at} />
        <Stat label="Solubility trend" value="falls with cooling" accent={at} />
        <Stat label="Example" value="salt, sugar, alum" accent={at} />
      </div>
    </SimShell>
  );
}

export function AlloysSim({ topic }: { topic?: string }) {
  const a = "#f59e0b";
  const at = "text-amber-600 dark:text-amber-400";
  const presets: [string, number, string, string][] = [
    ["Pure copper", 0, "#fbbf24", "#ef4444"],
    ["Steel (C)", 1.5, "#e2e8f0", "#334155"],
    ["Bronze (Sn)", 12, "#f59e0b", "#7c3aed"],
    ["Brass (Zn)", 30, "#fbbf24", "#ef4444"],
    ["Solder (Pb/Sn)", 50, "#94a3b8", "#0ea5e9"],
  ];
  const [percent, setPercent] = useState(12);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const N = 30;
  const impurities = Math.round((percent / 100) * N);
  const strength = 20 + percent * 1.5;
  const base = presets.find((p) => p[1] === percent) ?? presets[2];
  return (
    <SimShell
      icon="🛠️"
      title={simTitle(topic, "Alloys & alloying")}
      accent="amber"
      subtitle={`${topic ?? "Alloys"} — mixing a metal with other atoms makes a harder, stronger material because impurity atoms block layers sliding.`}
      hint="Steel is iron + carbon, brass is copper + zinc, bronze is copper + tin — all harder than the pure metals because the different atom sizes distort the lattice."
      controls={<SimChip accent="amber"><span aria-hidden>🛠️</span>{topic ?? "alloys"}</SimChip>}
    >
      <SimCanvas
        deps={[percent, sim.tick, impurities, strength, base]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cols = 6;
          const cell = 46;
          const ox = (w - cols * cell) / 2;
          const oy = 40;
          for (let i = 0; i < N; i++) {
            const x = ox + (i % cols) * cell + cell / 2 + Math.sin(sim.tick * 0.25 + i * 2) * 2;
            const y = oy + Math.floor(i / cols) * cell + cell / 2 + Math.cos(sim.tick * 0.2 + i) * 2;
            const isImpurity = i < impurities;
            ctx.beginPath();
            ctx.arc(x, y, isImpurity ? 16 : 13, 0, Math.PI * 2);
            ctx.fillStyle = isImpurity ? base[3] : base[2];
            ctx.fill();
            ctx.strokeStyle = isImpurity ? "#0f172a" : "rgba(15,23,42,0.3)";
            ctx.lineWidth = isImpurity ? 2 : 1;
            ctx.stroke();
          }
          const barW = 130;
          const barH = 12;
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(30, h - 30, barW, barH);
          ctx.fillStyle = strength >= 60 ? "#16a34a" : strength >= 35 ? "#f59e0b" : "#ef4444";
          ctx.fillRect(30, h - 30, (strength / 150) * barW, barH);
          ctx.fillStyle = "#92400e";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`strength ${strength.toFixed(0)}%`, 30, 26);
          ctx.fillStyle = "#78350f";
          ctx.font = "12px system-ui";
          ctx.fillText(`${impurities} of ${N} atoms are impurities — layers can't slide easily`, 30, 44);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Alloying atoms" value={percent} min={0} max={100} step={1} hex={a} accent={at} unit="%" onChange={setPercent} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        {presets.map(([name]) => (
          <ActionButton key={name} label={name} hex={a} onClick={() => setPercent(presets.find((p) => p[0] === name)![1])} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Alloy atoms" value={`${impurities} of ${N}`} accent={at} />
        <Stat label="Relative strength" value={`${strength.toFixed(0)}%`} accent={at} />
        <Stat label="Harder because" value="lattice is distorted" accent={at} />
      </div>
    </SimShell>
  );
}

function rustLevelAt(elapsed: number, water: number, salt: number, oxygen: number, mult: number): number {
  const rate = ((water * salt * oxygen) / 100) * mult;
  return rate * 0.2 + rate * elapsed * 0.02;
}

export function CorrosionSim({ topic }: { topic?: string }) {
  const a = "#f43f5e";
  const at = "text-rose-600 dark:text-rose-400";
  const presets: [string, number, number, number][] = [
    ["Dry desert", 10, 10, 10],
    ["Painted steel", 10, 10, 20],
    ["Humid room", 80, 0, 60],
    ["Rain", 80, 5, 70],
    ["Coastal car", 90, 80, 80],
  ];
  const couples: Record<string, { anode: string; cathode: string; mult: number; wire: boolean }> = {
    "Iron alone": { anode: "Fe", cathode: "Fe", mult: 1, wire: false },
    "Iron + copper nail": { anode: "Fe", cathode: "Cu", mult: 3, wire: true },
    "Iron + zinc (galvanised)": { anode: "Zn", cathode: "Fe", mult: 0.05, wire: true },
  };
  const [couple, setCouple] = useState("Iron alone");
  const [water, setWater] = useState(80);
  const [salt, setSalt] = useState(40);
  const [oxygen, setOxygen] = useState(70);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const { anode, cathode, mult, wire } = couples[couple];
  const rustLevel = Math.min(100, rustLevelAt(sim.elapsed, water, salt, oxygen, mult));
  const needsWaterOxygen = water > 15 && oxygen > 15;
  const protectedMetal = cathode === "Fe" && anode === "Zn";
  return (
    <SimShell
      icon="🦀"
      title={simTitle(topic, "Corrosion & galvanic protection")}
      accent="rose"
      subtitle={`${topic ?? "Corrosion"} — iron rusts only when BOTH water and oxygen are present. A galvanic couple accelerates it (Fe + Cu) or protects it (Fe + Zn).`}
      hint="A car bumper rusts fastest at the coast because salt water is a good electrolyte. Connecting iron to a more reactive metal (zinc — galvanising) makes the zinc corrode instead, protecting the iron."
      controls={<SimChip accent="rose"><span aria-hidden>🦀</span>{topic ?? "corrosion"}</SimChip>}
    >
      <SimCanvas
        deps={[water, salt, oxygen, sim.tick, rustLevel, needsWaterOxygen, anode, cathode, wire, protectedMetal]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const nx = 130;
          const ny = 60;
          const nl = 200;
          const nd = 90;
          const waterLine = ny + nd - (water / 100) * nd;
          ctx.fillStyle = `rgba(14,165,233,${0.3 + (water / 100) * 0.4})`;
          ctx.fillRect(nx - 16, waterLine, nl + 32, ny + nd - waterLine);
          ctx.fillStyle = "#94a3b8";
          ctx.fillRect(nx, ny, nl, nd);
          const rustH = (rustLevel / 100) * nd;
          ctx.fillStyle = protectedMetal ? "#166534" : "#b45309";
          ctx.fillRect(nx, ny + nd - rustH, nl, rustH);
          ctx.fillStyle = protectedMetal ? "#14532d" : "#78350f";
          ctx.fillRect(nx + nl / 2 - 6, ny + nd - rustH - 20, 12, 20);
          if (wire) {
            const ox2 = nx + nl + 36;
            ctx.fillStyle = anode === "Zn" ? "#e2e8f0" : "#b45309";
            ctx.fillRect(ox2, ny + 10, 26, nd - 20);
            ctx.fillStyle = "#334155";
            ctx.font = "bold 10px system-ui";
            ctx.fillText(anode, ox2 + 6, ny + nd / 2 + 8);
            ctx.fillText("(anode)", ox2 + 2, ny + nd / 2 + 20);
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(nx + nl, ny + 40);
            ctx.lineTo(ox2, ny + 40);
            ctx.stroke();
            const ex = (sim.tick % 60) / 60;
            const px = nx + nl + ex * 36;
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.arc(px, ny + 36, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.font = "10px system-ui";
            ctx.fillText("e⁻", (nx + nl + ox2) / 2 + 2, ny + 30);
          }
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          ctx.strokeRect(nx, ny, nl, nd);
          ctx.fillStyle = "#64748b";
          ctx.beginPath();
          ctx.arc(nx + 20, ny + 14, 10, 0, Math.PI * 2);
          ctx.fill();
          if (oxygen > 30) {
            for (let i = 0; i < 6; i++) {
              const bx = nx + 20 + ((i * 47 + sim.tick * 1.5) % (nl - 10));
              const by = waterLine - 10 - ((sim.tick + i * 13) % 30);
              ctx.beginPath();
              ctx.arc(bx, by, 3, 0, Math.PI * 2);
              ctx.strokeStyle = "rgba(255,255,255,0.8)";
              ctx.stroke();
            }
          }
          if (salt > 30) {
            for (let i = 0; i < 8; i++) {
              const sx = nx + 20 + ((i * 61) % (nl - 20));
              const sy = ny + 14 + ((i * 37) % (nd - 24));
              ctx.beginPath();
              ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
              ctx.fillStyle = "#fef3c7";
              ctx.fill();
            }
          }
          ctx.fillStyle = protectedMetal ? "#166534" : "#9f1239";
          ctx.font = "bold 14px system-ui";
          ctx.fillText(protectedMetal ? `protected: rust ${rustLevel.toFixed(1)}%` : `rust: ${rustLevel.toFixed(1)}%`, 30, 34);
          ctx.fillStyle = "#be123c";
          ctx.font = "12px system-ui";
          ctx.fillText(
            wire
              ? `${anode} is anode (corrodes), ${cathode} is cathode — electrons flow ${anode}→${cathode}`
              : needsWaterOxygen
                ? "water + oxygen present → iron corrodes"
                : "no rust — a component is missing",
            30,
            54,
          );
        }}
      />
      <div className="mt-4">
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Galvanic couple</span>
          <select value={couple} onChange={(e) => setCouple(e.target.value)} className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            {Object.keys(couples).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label="Water" value={water} min={0} max={100} step={5} hex={a} accent={at} unit="%" onChange={setWater} />
        <Slider label="Salt" value={salt} min={0} max={100} step={5} hex={a} accent={at} unit="%" onChange={setSalt} />
        <Slider label="Oxygen" value={oxygen} min={0} max={100} step={5} hex={a} accent={at} unit="%" onChange={setOxygen} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        {presets.map(([name, ww, ss, oo]) => (
          <ActionButton key={name} label={name} hex={a} onClick={() => { setWater(ww); setSalt(ss); setOxygen(oo); }} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Anode (corrodes)" value={anode} accent={at} />
        <Stat label="Cathode" value={cathode} accent={at} />
        <Stat label="Protection" value={protectedMetal ? "zinc sacrificial ✓" : mult > 1 ? "copper speeds rust" : "none"} accent={protectedMetal ? "text-emerald-600 dark:text-emerald-400" : at} />
      </div>
    </SimShell>
  );
}

export function ElectroplatingSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const [current, setCurrent] = useState(1);
  const [time, setTime] = useState(5);
  const [showIons, setShowIons] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul, autoRun: false });
  const F = 96485;
  const timeS = time * 60;
  const chargeQ = current * timeS;
  const mass = (chargeQ * 63.55) / (2 * F);
  const thickness = (mass / (20 * 8.96)) * 1e4;
  const layerTotal = Math.min(50, mass * 300);
  const progress = Math.min(1, sim.elapsed / 12);
  const layer = layerTotal * progress;
  return (
    <SimShell
      icon="🪙"
      title={simTitle(topic, "Electroplating")}
      accent="orange"
      subtitle={`${topic ?? "Electroplating"} — Cu²⁺ ions in solution gain electrons at the cathode and deposit as copper: m = I·t·A/(n·F).`}
      hint="Jewellery, cutlery and coins are plated with a thin metal layer. More current or more time = a thicker, shinier coating."
      controls={<SimChip accent="orange"><span aria-hidden>🪙</span>{topic ?? "electroplating"}</SimChip>}
    >
      <SimCanvas
        deps={[current, time, sim.tick, layer, mass, showIons]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "rgba(59,130,246,0.35)";
          ctx.fillRect(70, 40, w - 140, h - 80);
          ctx.strokeStyle = "#1d4ed8";
          ctx.lineWidth = 2;
          ctx.strokeRect(70, 40, w - 140, h - 80);
          const anodeX = 100;
          ctx.fillStyle = "#f59e0b";
          ctx.fillRect(anodeX, 55, 30, h - 110);
          ctx.fillStyle = "#78350f";
          ctx.font = "11px system-ui";
          ctx.fillText("Cu anode (+)", anodeX - 4, 48);
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(anodeX + 15, 55);
          ctx.lineTo(anodeX + 15, 20);
          ctx.stroke();
          const cathW = 60;
          const cathH = h - 130;
          const cathX = w / 2 - cathW / 2 + 30;
          ctx.fillStyle = "#94a3b8";
          ctx.fillRect(cathX, 55, cathW, cathH);
          if (layer > 0.5) {
            const g = ctx.createLinearGradient(0, cathX, 0, cathX + cathW);
            g.addColorStop(0, "#fbbf24");
            g.addColorStop(1, "#d97706");
            ctx.fillStyle = g;
            ctx.fillRect(cathX, 55 + cathH - layer, cathW, layer);
            ctx.strokeStyle = "#b45309";
            ctx.strokeRect(cathX, 55 + cathH - layer, cathW, layer);
          }
          ctx.fillStyle = "#334155";
          ctx.font = "11px system-ui";
          ctx.fillText("object (−)", cathX + 2, 48);
          ctx.strokeStyle = "#334155";
          ctx.beginPath();
          ctx.moveTo(cathX + cathW / 2, 55);
          ctx.lineTo(cathX + cathW / 2, 20);
          ctx.stroke();
          if (showIons && current > 0) {
            for (let i = 0; i < Math.min(14, 4 + current * 4); i++) {
              const drift = ((sim.tick * 2.4 * current + i * 31) % (w - 260));
              const x = 160 + drift;
              const y = 72 + ((i * 47 + sim.tick) % (h - 132));
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, Math.PI * 2);
              ctx.fillStyle = "#b45309";
              ctx.fill();
              ctx.fillStyle = "#fff";
              ctx.font = "9px system-ui";
              ctx.fillText("Cu²⁺", x - 9, y - 6);
            }
          }
          ctx.fillStyle = "#9a3412";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`copper deposited: ${(mass * progress).toFixed(3)} g`, 30, 30);
          ctx.fillStyle = "#7c2d12";
          ctx.font = "12px system-ui";
          ctx.fillText(progress >= 1 ? "plating complete ✓" : sim.running ? `plating… ${(progress * 100).toFixed(0)}%` : "press Play to start plating", 30, 50);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Current" value={current} min={0.2} max={3} step={0.1} hex={a} accent={at} unit=" A" onChange={setCurrent} />
        <Slider label="Time" value={time} min={1} max={20} step={1} hex={a} accent={at} unit=" min" onChange={setTime} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show Cu²⁺ ions" checked={showIons} onChange={setShowIons} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Charge passed" value={`${chargeQ.toFixed(0)} C`} accent={at} />
        <Stat label="Mass deposited" value={`${(mass * progress).toFixed(3)} g`} accent={at} />
        <Stat label="Coating thickness" value={`${(thickness * progress).toFixed(1)} µm`} accent={at} />
      </div>
    </SimShell>
  );
}

interface StoichReaction {
  name: string;
  equation: string;
  a: { sym: string; coef: number };
  b: { sym: string; coef: number };
  prod: { sym: string; coef: number };
}

const STOICH: StoichReaction[] = [
  { name: "Haber synthesis", equation: "N₂ + 3H₂ → 2NH₃", a: { sym: "N₂", coef: 1 }, b: { sym: "H₂", coef: 3 }, prod: { sym: "NH₃", coef: 2 } },
  { name: "Water formation", equation: "2H₂ + O₂ → 2H₂O", a: { sym: "H₂", coef: 2 }, b: { sym: "O₂", coef: 1 }, prod: { sym: "H₂O", coef: 2 } },
  { name: "Methane combustion", equation: "CH₄ + 2O₂ → CO₂ + 2H₂O", a: { sym: "CH₄", coef: 1 }, b: { sym: "O₂", coef: 2 }, prod: { sym: "CO₂", coef: 1 } },
];

const MOL_COLOR: Record<string, string> = {
  "N₂": "#60a5fa",
  "H₂": "#22d3ee",
  "NH₃": "#f59e0b",
  "O₂": "#f87171",
  "H₂O": "#38bdf8",
  "CH₄": "#2dd4bf",
  "CO₂": "#a3a3a3",
};

export function StoichiometrySim({ topic }: { topic?: string }) {
  const a = "#10b981";
  const at = "text-emerald-600 dark:text-emerald-400";
  const [reaction, setReaction] = useState(0);
  const [amtA, setAmtA] = useState(4);
  const [amtB, setAmtB] = useState(4);
  const [yieldPct, setYieldPct] = useState(0);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul, autoRun: false });
  const spec = STOICH[reaction];
  const fracA = amtA / spec.a.coef;
  const fracB = amtB / spec.b.coef;
  const r = Math.min(fracA, fracB);
  const limiting = fracA <= fracB ? spec.a.sym : spec.b.sym;
  const theoretical = r * spec.prod.coef;
  const actual = theoretical * (yieldPct / 100);
  const excess = fracA <= fracB ? spec.b.sym : spec.a.sym;
  const excessLeft = fracA <= fracB ? amtB - r * spec.b.coef : amtA - r * spec.a.coef;
  return (
    <SimShell
      icon="⚗️"
      title={simTitle(topic, "Stoichiometry & limiting reactant")}
      accent="emerald"
      subtitle={`${topic ?? "Stoichiometry"} — the coefficients in a balanced equation are mole ratios. The reactant that runs out first (the limiting reactant) sets the yield.`}
      hint={`${spec.equation}. Reactant ratio needed = ${spec.a.coef} : ${spec.b.coef}. Excess ${excess} left over: ${excessLeft.toFixed(2)} mol.`}
      controls={<SimChip accent="emerald"><span aria-hidden>⚗️</span>{spec.name}</SimChip>}
    >
      <SimCanvas
        deps={[reaction, amtA, amtB, yieldPct, theoretical, actual, limiting, r, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const drawMol = (x: number, y: number, sym: string, alpha: number) => {
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fillStyle = MOL_COLOR[sym] ?? "#94a3b8";
            ctx.fill();
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 10px system-ui";
            ctx.fillText(sym, x - 9, y + 4);
            ctx.globalAlpha = 1;
          };
          const cols = 4;
          const cell = 36;
          const ox = 76;
          const oy = 66;
          const capA = Math.min(12, amtA);
          const capB = Math.min(8, amtB);
          const capProd = Math.min(12, Math.round(actual));
          ctx.fillStyle = "#064e3b";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(spec.a.sym, ox + 12, 44);
          ctx.fillText(spec.b.sym, ox + 12, 44 + Math.floor((capB + 3) / 3) * cell + 14);
          ctx.fillText(spec.prod.sym, w - 140, 44);
          for (let i = 0; i < capA; i++) {
            const x = ox + (i % cols) * cell + cell / 2;
            const y = oy + Math.floor(i / cols) * cell + cell / 2;
            const used = fracA <= fracB ? 1 : r / fracA;
            drawMol(x, y, spec.a.sym, 1 - (yieldPct / 100) * used * 0.75);
          }
          for (let i = 0; i < capB; i++) {
            const x = ox + (i % 3) * cell + cell / 2;
            const y = oy + 76 + Math.floor(i / 3) * cell + cell / 2;
            const used = fracB < fracA ? 1 : r / fracB;
            drawMol(x, y, spec.b.sym, 1 - (yieldPct / 100) * used * 0.75);
          }
          for (let i = 0; i < capProd; i++) {
            const x = w - 140 + (i % cols) * cell + cell / 2;
            const y = oy + Math.floor(i / cols) * cell + cell / 2;
            drawMol(x, y, spec.prod.sym, 0.2 + (yieldPct / 100) * 0.8);
          }
          ctx.fillStyle = "#047857";
          ctx.font = "bold 16px system-ui";
          ctx.fillText("→", 250, 110);
          ctx.fillStyle = "#065f46";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(spec.equation, 30, h - 12);
          ctx.fillStyle = "#047857";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`limiting: ${limiting} · theoretical ${theoretical.toFixed(2)} mol ${spec.prod.sym}`, 30, 28);
          ctx.fillStyle = "#065f46";
          ctx.font = "12px system-ui";
          ctx.fillText(`actual yield ${actual.toFixed(2)} mol (${yieldPct.toFixed(0)}%) · excess ${excess} left: ${excessLeft.toFixed(2)} mol`, 30, 48);
        }}
      />
      <div className="mt-4">
        <label className="block">
          <span className="mb-1 text-sm text-foreground/70">Reaction</span>
          <select value={reaction} onChange={(e) => setReaction(Number(e.target.value))} className="w-full rounded-xl border border-white/40 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            {STOICH.map((s, i) => (
              <option key={s.name} value={i}>{s.name} · {s.equation}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label={`${spec.a.sym} (mol)`} value={amtA} min={1} max={12} step={1} hex={a} accent={at} unit=" mol" onChange={setAmtA} />
        <Slider label={`${spec.b.sym} (mol)`} value={amtB} min={1} max={12} step={1} hex={a} accent={at} unit=" mol" onChange={setAmtB} />
        <Slider label="Yield (%)" value={yieldPct} min={0} max={100} step={5} hex={a} accent={at} unit="%" onChange={setYieldPct} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <ActionButton label="React 100%" icon="⚗️" hex={a} onClick={() => setYieldPct(100)} />
        <ActionButton label="Reset mix" icon="↺" hex="#64748b" onClick={() => setYieldPct(0)} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Mole ratio" value={`${spec.a.coef}:${spec.b.coef}:${spec.prod.coef}`} accent={at} />
        <Stat label="Limiting" value={limiting} accent={at} />
        <Stat label="Theoretical yield" value={`${theoretical.toFixed(2)} mol`} accent={at} />
        <Stat label="Actual yield" value={`${actual.toFixed(2)} mol · ${yieldPct.toFixed(0)}%`} accent={at} />
      </div>
    </SimShell>
  );
}

export function AlkanesSim({ topic }: { topic?: string }) {
  const a = "#06b6d4";
  const at = "text-cyan-600 dark:text-cyan-400";
  const [carbons, setCarbons] = useState(3);
  const [showH, setShowH] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const formula = `C${carbons}H${2 * carbons + 2}`;
  const names = ["", "methane", "ethane", "propane", "butane", "pentane", "hexane", "heptane", "octane"];
  const name = names[carbons];
  const bps = [-162, -89, -42, -1, 36, 69, 98, 126];
  const bp = bps[carbons - 1];
  return (
    <SimShell
      icon="⛓️"
      title={simTitle(topic, "Alkanes")}
      accent="cyan"
      subtitle={`${topic ?? "Alkanes"} — saturated hydrocarbons with single C–C bonds, general formula CₙH₂ₙ₊₂.`}
      hint="Methane (CH₄) is natural gas; propane (C₃H₈) is camping gas; butane is lighter fuel. As the chain grows, boiling point and viscosity rise."
      controls={<SimChip accent="cyan"><span aria-hidden>⛓️</span>{name}</SimChip>}
    >
      <SimCanvas
        deps={[carbons, showH, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const step = 70;
          const ox = (w - (carbons - 1) * step) / 2;
          const cy = h / 2;
          const pulse = 1 + Math.sin(sim.tick * 0.08) * 0.15;
          ctx.font = "bold 11px system-ui";
          for (let i = 0; i < carbons; i++) {
            const x = ox + i * step;
            if (i > 0) {
              ctx.strokeStyle = "#0e7490";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(x - 16, cy);
              ctx.lineTo(x - step + 16, cy);
              ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(x, cy, 16 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = "#06b6d4";
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.fillText("C", x - 5, cy + 5);
            if (showH) {
              ctx.fillStyle = "#164e63";
              ctx.fillText("H", x - 14, cy - 24);
              ctx.fillText("H", x + 14, cy - 24);
              ctx.fillText("H", x - 14, cy + 26);
              if (i === carbons - 1) ctx.fillText("H", x + 12, cy + 26);
            }
          }
          ctx.fillStyle = "#155e75";
          ctx.font = "bold 15px system-ui";
          ctx.fillText(`${name} · ${formula}`, 30, 30);
          ctx.font = "12px system-ui";
          ctx.fillText(showH ? "single C–C bonds · saturated" : "skeletal formula (H hidden)", 30, 52);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Carbon atoms" value={carbons} min={1} max={8} step={1} hex={a} accent={at} onChange={setCarbons} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show hydrogens" checked={showH} onChange={setShowH} hex={a} />
        {["methane", "ethane", "propane", "butane", "octane"].map((n) => (
          <ActionButton
            key={n}
            label={n}
            hex={a}
            onClick={() => setCarbons(n === "methane" ? 1 : n === "ethane" ? 2 : n === "propane" ? 3 : n === "butane" ? 4 : 8)}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Name" value={name} accent={at} />
        <Stat label="Formula" value={formula} accent={at} />
        <Stat label="Boiling point" value={`${bp} °C`} accent={at} />
      </div>
    </SimShell>
  );
}

export function AlkenesSim({ topic }: { topic?: string }) {
  const a = "#f43f5e";
  const at = "text-rose-600 dark:text-rose-400";
  const [carbons, setCarbons] = useState(2);
  const [showH, setShowH] = useState(true);
  const [bromine, setBromine] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const formula = `C${carbons}H${2 * carbons}`;
  const names = ["", "", "ethene", "propene", "butene", "pentene"];
  const name = names[carbons];
  return (
    <SimShell
      icon="〰️"
      title={simTitle(topic, "Alkenes")}
      accent="rose"
      subtitle={`${topic ?? "Alkenes"} — unsaturated hydrocarbons with a C=C double bond, general formula CₙH₂ₙ. They decolourise bromine water.`}
      hint="The double bond makes alkenes more reactive: they undergo addition reactions — that is how they become polymers like polyethene."
      controls={<SimChip accent="rose"><span aria-hidden>〰️</span>{name}</SimChip>}
    >
      <SimCanvas
        deps={[carbons, showH, bromine, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const step = 90;
          const ox = (w - (carbons - 1) * step) / 2;
          const cy = h / 2 - 30;
          for (let i = 0; i < carbons; i++) {
            const x = ox + i * step;
            if (i > 0) {
              ctx.strokeStyle = "#be123c";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(x - 16, cy);
              ctx.lineTo(x - step + 16, cy);
              ctx.stroke();
              ctx.strokeStyle = "rgba(190,18,60,0.5)";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x - 16, cy - 8);
              ctx.lineTo(x - step + 16, cy - 8);
              ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(x, cy, 16, 0, Math.PI * 2);
            ctx.fillStyle = "#f43f5e";
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 13px system-ui";
            ctx.fillText("C", x - 5, cy + 5);
            if (showH) {
              ctx.fillStyle = "#881337";
              ctx.font = "11px system-ui";
              ctx.fillText("H", x - 14, cy - 24);
              ctx.fillText("H", x + 14, cy - 24);
              ctx.fillText("H", x - 14, cy + 26);
              if (i === carbons - 1) ctx.fillText("H", x + 12, cy + 26);
            }
          }
          const tubeY = h - 40;
          ctx.strokeStyle = "#fda4af";
          ctx.lineWidth = 2;
          ctx.strokeRect(70, tubeY - 26, w - 140, 26);
          ctx.fillStyle = bromine ? "rgba(251,191,36,0.15)" : `rgba(190,18,60,${0.35 + Math.abs(Math.sin(sim.tick * 0.1)) * 0.3})`;
          ctx.fillRect(70, tubeY - 26, w - 140, 26);
          ctx.fillStyle = "#881337";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(bromine ? "bromine water decolourised — double bond reacted!" : "bromine water (orange)", 30, tubeY - 32);
          ctx.fillStyle = "#be123c";
          ctx.font = "bold 15px system-ui";
          ctx.fillText(`${name} · ${formula}`, 30, 30);
          ctx.font = "12px system-ui";
          ctx.fillText("C=C double bond · unsaturated", 30, 50);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Carbon atoms" value={carbons} min={2} max={5} step={1} hex={a} accent={at} onChange={setCarbons} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show hydrogens" checked={showH} onChange={setShowH} hex={a} />
        <ActionButton label={bromine ? "Fresh bromine water" : "Add bromine water"} icon="🧪" hex={a} onClick={() => setBromine((b) => !b)} />
        {["ethene", "propene", "butene", "pentene"].map((n, i) => (
          <ActionButton key={n} label={n} hex={a} onClick={() => setCarbons(i + 2)} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Name" value={name} accent={at} />
        <Stat label="Formula" value={formula} accent={at} />
        <Stat label="Bromine water" value={bromine ? "decolourised" : "orange"} accent={at} />
      </div>
    </SimShell>
  );
}

export function PolymersSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [units, setUnits] = useState(8);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul, autoRun: false });
  const linked = Math.max(2, Math.round(units * Math.min(1, sim.elapsed / 6)));
  return (
    <SimShell
      icon="🧶"
      title={simTitle(topic, "Polymers")}
      accent="violet"
      subtitle={`${topic ?? "Polymers"} — thousands of small monomer molecules join end to end to form a long chain: the polymer.`}
      hint="Polyethene is made from ethene monomers; PVC from vinyl chloride; nylon and proteins are also polymers — plastics are all long molecules."
      controls={<SimChip accent="violet"><span aria-hidden>🧶</span>{topic ?? "polymers"}</SimChip>}
    >
      <SimCanvas
        deps={[units, sim.tick, linked]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cy = h / 2;
          const step = Math.min(48, (w - 120) / Math.max(2, units));
          const ox = (w - (linked - 1) * step) / 2;
          for (let i = 0; i < linked; i++) {
            const x = ox + i * step;
            const pulse = Math.sin(sim.tick * 0.2 + i) * 1.5;
            ctx.beginPath();
            ctx.arc(x, cy, 15 + pulse, 0, Math.PI * 2);
            ctx.fillStyle = i % 2 === 0 ? "#8b5cf6" : "#a78bfa";
            ctx.fill();
            if (i > 0) {
              ctx.strokeStyle = "#4c1d95";
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(x - 15, cy);
              ctx.lineTo(x - step + 15, cy);
              ctx.stroke();
            }
          }
          ctx.fillStyle = "#4c1d95";
          ctx.font = "bold 14px system-ui";
          ctx.fillText(linked >= units ? `polyethene — ${linked} units joined ✓` : `polymerising… ${linked}/${units} units`, 30, 40);
          ctx.fillStyle = "#6d28d9";
          ctx.font = "12px system-ui";
          ctx.fillText("—C—C—C—C—C—C— chain growing", 30, h - 15);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Monomer units" value={units} min={2} max={20} step={1} hex={a} accent={at} onChange={setUnits} />
      </div>
      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Monomer" value="ethene (CH₂=CH₂)" accent={at} />
        <Stat label="Polymer" value="polyethene" accent={at} />
        <Stat label="Chain length" value={`${linked} units`} accent={at} />
      </div>
    </SimShell>
  );
}

export function SoapSim({ topic }: { topic?: string }) {
  const a = "#14b8a6";
  const at = "text-teal-600 dark:text-teal-400";
  const [soap, setSoap] = useState(40);
  const [hardWater, setHardWater] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const micelles = Math.round((soap / 100) * 8);
  const scum = hardWater ? Math.round((soap / 100) * 6) : 0;
  return (
    <SimShell
      icon="🧼"
      title={simTitle(topic, "Soaps & detergents")}
      accent="teal"
      subtitle={`${topic ?? "Soaps"} — soap molecules have a polar head (loves water) and a long tail (loves grease), so they surround oil drops to form micelles.`}
      hint="The tails dissolve into the grease drop while the heads face the water — the drop is lifted off and rinsed away. Hard water scums with soap but not detergents."
      controls={<SimChip accent="teal"><span aria-hidden>🧼</span>{topic ?? "soaps"}</SimChip>}
    >
      <SimCanvas
        deps={[soap, hardWater, sim.tick, micelles, scum]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cy = h / 2;
          const wob = Math.sin(sim.tick * 0.1) * 4;
          ctx.beginPath();
          ctx.arc(w / 2, cy, 40 + wob, 0, Math.PI * 2);
          ctx.fillStyle = "#fbbf24";
          ctx.fill();
          ctx.strokeStyle = "#b45309";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "#92400e";
          ctx.font = "12px system-ui";
          ctx.fillText("grease drop", w / 2 - 36, cy - 50);
          for (let i = 0; i < micelles; i++) {
            const ang = (i / Math.max(1, micelles)) * Math.PI * 2 + sim.tick * 0.04;
            const r = 62;
            const px = w / 2 + Math.cos(ang) * r;
            const py = cy + Math.sin(ang) * r;
            ctx.strokeStyle = "#134e4a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px + Math.cos(ang + Math.PI) * 12, py + Math.sin(ang + Math.PI) * 12);
            ctx.lineTo(px, py);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(px, py, 7, 0, Math.PI * 2);
            ctx.fillStyle = "#0d9488";
            ctx.fill();
            ctx.strokeStyle = "#134e4a";
            ctx.stroke();
          }
          if (scum > 0) {
            for (let i = 0; i < scum; i++) {
              const sx = 80 + ((i * 97) % (w - 160));
              const sy = 40 + ((i * 53 + sim.tick * 0.4) % 30);
              ctx.beginPath();
              ctx.arc(sx, sy, 4, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(241,245,249,0.9)";
              ctx.fill();
            }
            ctx.fillStyle = "#0f766e";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("hard water → scum forms!", 30, 36);
          }
          ctx.fillStyle = "#134e4a";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${micelles} micelles surround the grease`, 30, h - 10);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Soap added" value={soap} min={0} max={100} step={5} hex={a} accent={at} unit="%" onChange={setSoap} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Hard water" checked={hardWater} onChange={setHardWater} hex={a} hint="forms scum instead of lather" />
        {[
          ["No soap", 0],
          ["Little", 20],
          ["Washing-up", 60],
          ["Too much", 100],
        ].map(([l, v]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => setSoap(Number(v))} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Head" value="hydrophilic (water-loving)" accent={at} />
        <Stat label="Tail" value="hydrophobic (grease-loving)" accent={at} />
        <Stat label="Hard water" value={hardWater ? "scums" : "lathers well"} accent={at} />
      </div>
    </SimShell>
  );
}

export function CombustionSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const [fuel, setFuel] = useState(0);
  const [oxygen, setOxygen] = useState(100);
  const [fuelMol, setFuelMol] = useState(1);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const fuels = [
    { name: "methane CH₄", o2: 2, co2: 1, h2o: 2, heat: 890, m: 16.04, formula: "CH₄ + 2O₂ → CO₂ + 2H₂O" },
    { name: "propane C₃H₈", o2: 5, co2: 3, h2o: 4, heat: 2220, m: 44.1, formula: "C₃H₈ + 5O₂ → 3CO₂ + 4H₂O" },
    { name: "ethanol C₂H₅OH", o2: 3, co2: 2, h2o: 3, heat: 1367, m: 46.07, formula: "C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O" },
  ];
  const f = fuels[fuel];
  const complete = oxygen >= 90;
  const energy = fuelMol * f.heat;
  const co2Mass = fuelMol * f.co2 * 44.01;
  const o2Need = fuelMol * f.o2;
  const flameH = 34 + oxygen * 0.25 + (sim.tick % 6);
  return (
    <SimShell
      icon="🔥"
      title={simTitle(topic, "Combustion & energy from fuels")}
      accent="orange"
      subtitle={`${topic ?? "Combustion"} — fuels burn with oxygen releasing heat energy (ΔHc) and producing CO₂ and H₂O. Enough oxygen gives clean complete combustion.`}
      hint={`${f.formula} releases ${f.heat} kJ/mol. Burning ${fuelMol.toFixed(1)} mol of ${f.name} gives ${energy.toFixed(0)} kJ and ${co2Mass.toFixed(1)} g of CO₂.`}
      controls={<SimChip accent="orange"><span aria-hidden>🔥</span>{f.name}</SimChip>}
    >
      <SimCanvas
        deps={[fuel, oxygen, complete, sim.tick, flameH, fuelMol]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const tickH = h / 2 - 10;
          const flame = complete ? "#fb923c" : "#facc15";
          const inner = complete ? "#fde68a" : "#f59e0b";
          ctx.fillStyle = flame;
          ctx.beginPath();
          ctx.moveTo(w / 2 - 30, tickH);
          ctx.quadraticCurveTo(w / 2 - 20, tickH - flameH * 0.7, w / 2, tickH - flameH);
          ctx.quadraticCurveTo(w / 2 + 20, tickH - flameH * 0.7, w / 2 + 30, tickH);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = inner;
          ctx.beginPath();
          ctx.moveTo(w / 2 - 16, tickH);
          ctx.quadraticCurveTo(w / 2 - 8, tickH - flameH * 0.45, w / 2, tickH - flameH * 0.6);
          ctx.quadraticCurveTo(w / 2 + 8, tickH - flameH * 0.45, w / 2 + 16, tickH);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#64748b";
          ctx.fillRect(w / 2 - 40, tickH + 4, 80, 14);
          ctx.fillStyle = complete ? "#0e7490" : "#a16207";
          ctx.font = "bold 14px system-ui";
          ctx.fillText(complete ? "clean blue flame — complete" : "smoky yellow flame — incomplete", 30, 40);
          ctx.fillStyle = "#78350f";
          ctx.font = "12px system-ui";
          ctx.fillText(complete ? `ΔHc = ${f.heat} kJ/mol · ${energy.toFixed(0)} kJ released` : "soot + CO (toxic!) also formed", 30, 60);
          if (!complete) {
            for (let i = 0; i < 5; i++) {
              const sx = w / 2 - 20 + ((i * 23 + sim.tick * 2) % 40);
              const sy = tickH + 2 - ((sim.tick + i * 7) % 24);
              ctx.beginPath();
              ctx.arc(sx, sy, 3, 0, Math.PI * 2);
              ctx.fillStyle = "#334155";
              ctx.fill();
            }
          }
          ctx.fillStyle = "#7c2d12";
          ctx.font = "12px system-ui";
          ctx.fillText(`${f.formula} · needs ${o2Need.toFixed(1)} mol O₂`, 40, h - 12);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Fuel amount" value={fuelMol} min={0.5} max={5} step={0.5} hex={a} accent={at} unit=" mol" onChange={setFuelMol} />
        <Slider label="Oxygen supply" value={oxygen} min={10} max={100} step={5} hex={a} accent={at} unit="%" onChange={setOxygen} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        {fuels.map((ff, i) => (
          <ActionButton key={ff.name} label={ff.name} hex={a} onClick={() => setFuel(i)} />
        ))}
        <ActionButton label="Maximum air" icon="💨" hex="#0ea5e9" onClick={() => setOxygen(100)} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Energy released" value={`${energy.toFixed(0)} kJ`} accent={at} />
        <Stat label="CO₂ emitted" value={`${f.co2 * fuelMol} mol · ${co2Mass.toFixed(0)} g`} accent={at} />
        <Stat label="Combustion" value={complete ? "complete" : "incomplete"} accent={complete ? "text-emerald-600 dark:text-emerald-400" : at} />
      </div>
    </SimShell>
  );
}

export function GreenhouseSim({ topic }: { topic?: string }) {
  const a = "#84cc16";
  const at = "text-lime-600 dark:text-lime-400";
  const [co2, setCo2] = useState(420);
  const [showRays, setShowRays] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const forcing = 5.35 * Math.log(co2 / 280);
  const trapped = Math.min(1, forcing / 5.6);
  const tempC = 15 + 0.75 * forcing;
  const swIn = 340;
  const lwOut = Math.max(10, 340 - forcing);
  const sigmaT4 = 5.67e-8 * Math.pow(tempC + 273, 4);
  return (
    <SimShell
      icon="🌍"
      title={simTitle(topic, "Greenhouse effect — energy balance")}
      accent="lime"
      subtitle={`${topic ?? "Greenhouse effect"} — shortwave solar radiation enters; the warmed Earth radiates longwave IR that CO₂ partly traps, warming the planet.`}
      hint={`ΔF = 5.35·ln(CO₂/280) = ${forcing.toFixed(1)} W/m². Doubling CO₂ (280→560 ppm) gives ΔF ≈ 3.7 W/m² and roughly +2.8 °C of warming.`}
      controls={<SimChip accent="lime"><span aria-hidden>🌍</span>{topic ?? "greenhouse"}</SimChip>}
    >
      <SimCanvas
        deps={[co2, sim.tick, trapped, showRays, tempC, forcing, lwOut]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const ground = h - 36;
          ctx.fillStyle = "#0b1220";
          ctx.fillRect(0, 0, w, h);
          const earth = ctx.createRadialGradient(w / 2 - 16, ground - 22, 8, w / 2, ground - 24, 62);
          earth.addColorStop(0, "#4ade80");
          earth.addColorStop(1, "#166534");
          ctx.beginPath();
          ctx.arc(w / 2, ground - 24, 60, Math.PI, 0);
          ctx.fillStyle = earth;
          ctx.fill();
          ctx.strokeStyle = "rgba(74,222,128,0.4)";
          ctx.stroke();
          if (showRays) {
            for (let i = 0; i < 5; i++) {
              const sx = 80 + i * 110;
              ctx.strokeStyle = "rgba(253,224,71,0.85)";
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(sx, 22);
              ctx.lineTo(sx + (i % 2 === 0 ? 30 : -30), ground - 70);
              ctx.stroke();
            }
            const irTrapped = Math.round(trapped * 4);
            for (let i = 0; i < 4; i++) {
              const ix = 110 + i * 130;
              const bounce = i < irTrapped;
              ctx.strokeStyle = bounce ? "rgba(251,146,60,0.9)" : "rgba(251,146,60,0.35)";
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(ix, ground - 50);
              if (bounce) {
                ctx.lineTo(ix, ground - 130);
                ctx.stroke();
                ctx.strokeStyle = "rgba(251,146,60,0.6)";
                ctx.beginPath();
                ctx.moveTo(ix, ground - 130);
                ctx.lineTo(ix - 26, ground - 106);
                ctx.moveTo(ix, ground - 130);
                ctx.lineTo(ix + 26, ground - 106);
                ctx.stroke();
              } else {
                ctx.lineTo(ix, 34);
                ctx.stroke();
              }
            }
          }
          const layerY = ground - 132;
          for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `rgba(132,204,22,${0.2 + trapped * 0.6})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(60 + i * 20, layerY - i * 10);
            ctx.lineTo(w - 40, layerY - i * 10);
            ctx.stroke();
          }
          ctx.setLineDash([]);
          ctx.fillStyle = "#a3e635";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`CO₂ · ${co2} ppm (ΔF ${forcing.toFixed(1)} W/m²)`, 60, layerY + 12);
          ctx.fillStyle = "#84cc16";
          ctx.font = "bold 15px system-ui";
          ctx.fillText(`global temp ≈ ${tempC.toFixed(1)} °C · surface IR σT⁴ ≈ ${sigmaT4.toFixed(0)} W/m²`, 30, h - 8);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="CO₂ concentration" value={co2} min={280} max={800} step={5} hex={a} accent={at} unit=" ppm" onChange={setCo2} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show rays" checked={showRays} onChange={setShowRays} hex={a} />
        {[
          ["Pre-industrial", 280],
          ["Today", 420],
          ["Double CO₂", 560],
          ["Extreme", 800],
        ].map(([l, v]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => setCo2(Number(v))} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Radiative forcing" value={`+${forcing.toFixed(1)} W/m²`} accent={at} />
        <Stat label="Global temp" value={`${tempC.toFixed(1)} °C`} accent={at} />
        <Stat label="SW in" value={`${swIn} W/m²`} accent={at} />
        <Stat label="LW out (topped)" value={`${lwOut.toFixed(0)} W/m²`} accent={at} />
      </div>
    </SimShell>
  );
}
