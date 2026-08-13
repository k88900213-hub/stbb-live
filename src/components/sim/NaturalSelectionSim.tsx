"use client";

import { useEffect, useRef, useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat } from "./simkit";

type SelMode = "predator" | "antibiotic";

function selMode(topic?: string): SelMode {
  const t = topic?.toLowerCase() ?? "";
  if (/antibiotic|resistance|bacteri|drug/.test(t)) return "antibiotic";
  return "predator";
}

const N = 140;

interface Individual {
  trait: number;
  x: number;
  y: number;
  seed: number;
}

function makePopulation(trait: number): Individual[] {
  const inds: Individual[] = [];
  for (let i = 0; i < N; i++) {
    inds.push({ trait: Math.max(0, Math.min(1, trait + (Math.random() - 0.5) * 0.18)), x: 20 + Math.random() * 440, y: 24 + Math.random() * 150, seed: Math.random() });
  }
  return inds;
}

export function NaturalSelectionSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "violet";
  const a = ACCENTS[accent];
  const mode = selMode(topic);

  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState<Individual[]>(() => makePopulation(0.5));
  const [background, setBackground] = useState(0.3);
  const [pressure, setPressure] = useState(0.7);
  const [mutation, setMutation] = useState(0.04);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<number[]>([0.5]);
  const [killed, setKilled] = useState(0);
  const raf = useRef<number | null>(null);
  const popRef = useRef(population);

  const survive = (trait: number, bg: number, pres: number) => {
    if (mode === "antibiotic") {
      return trait >= bg ? 0.92 : 1 - pres * 0.85;
    }
    const contrast = Math.abs(trait - bg);
    return Math.max(0.04, 1 - contrast * pres * 1.6);
  };

  const nextGen = () => {
    const pop = popRef.current;
    const survivors = pop.filter((ind) => Math.random() < survive(ind.trait, background, pressure));
    setKilled((k) => k + pop.length - survivors.length);
    if (survivors.length === 0) {
      popRef.current = makePopulation(background);
      setPopulation(popRef.current);
      return;
    }
    const next: Individual[] = [];
    for (let i = 0; i < N; i++) {
      const parent = survivors[Math.floor(Math.random() * survivors.length)];
      let trait = parent.trait + (Math.random() - 0.5) * mutation;
      trait = Math.max(0, Math.min(1, trait));
      next.push({ trait, x: 20 + Math.random() * 440, y: 24 + Math.random() * 150, seed: Math.random() });
    }
    popRef.current = next;
    setPopulation(next);
    const mean = next.reduce((s, ind) => s + ind.trait, 0) / next.length;
    setHistory((h) => [...h.slice(-60), mean]);
    setGeneration((g) => g + 1);
  };

  useEffect(() => {
    if (!running) return;
    let steps = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (now - last > 750) {
        last = now;
        if (steps < 60) {
          nextGen();
          steps++;
        } else setRunning(false);
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const meanTrait = population.reduce((s, ind) => s + ind.trait, 0) / population.length;
  const prevMean = history.length > 1 ? history[history.length - 2] : meanTrait;
  const adaptRate = Math.abs(meanTrait - prevMean);
  const adaptDist = Math.abs(background - meanTrait);
  const adaptGens = adaptRate > 0.0005 ? Math.round(adaptDist / adaptRate) : null;
  const resistant = population.filter((ind) => ind.trait >= background).length;

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const bgVal = Math.round(background * 120 + 40);
    ctx.fillStyle = `rgb(${bgVal}, ${bgVal + 10}, ${bgVal})`;
    ctx.beginPath();
    ctx.roundRect(20, 24, 440, 150, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(139,92,246,0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (const ind of population) {
      const v = Math.round(ind.trait * 220 + 20);
      ctx.fillStyle = mode === "antibiotic" ? (ind.trait >= background ? `rgb(${v}, 90, 230)` : `rgb(120, ${v}, 120)`) : `rgb(${v}, ${v}, ${v})`;
      ctx.beginPath();
      ctx.arc(ind.x + (ind.seed - 0.5) * 2, ind.y + (ind.seed - 0.5) * 2, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      mode === "antibiotic"
        ? `gen ${generation} — blue = resistant · ${resistant} of ${population.length} alive`
        : `gen ${generation} — ${population.length} prey · ${killed} eaten`,
      28,
      42,
    );
    ctx.textAlign = "start";

    const gx = w / 2 + 30;
    const gw = w - gx - 30;
    const gy = 26;
    const gh = h - 70;

    ctx.strokeStyle = "rgba(139,92,246,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx + gw, gy + gh);
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx, gy);
    ctx.stroke();

    const bins = 12;
    const counts = new Array<number>(bins).fill(0);
    for (const ind of population) {
      counts[Math.min(bins - 1, Math.floor(ind.trait * bins))]++;
    }
    const maxC = Math.max(1, ...counts);
    const barW = (gw / bins) * 0.7;
    for (let b = 0; b < bins; b++) {
      const bh = (counts[b] / maxC) * (gh - 14);
      ctx.fillStyle = "rgba(139,92,246,0.55)";
      ctx.fillRect(gx + b * (gw / bins) + (gw / bins - barW) / 2, gy + gh - bh, barW, bh);
      ctx.strokeStyle = "rgba(109,40,217,0.5)";
      ctx.strokeRect(gx + b * (gw / bins) + (gw / bins - barW) / 2, gy + gh - bh, barW, bh);
    }

    const tx = gx + Math.min(Math.max(0, background), 1) * gw;
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(tx, gy + 2);
    ctx.lineTo(tx, gy + gh);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#f59e0b";
    ctx.font = "9px sans-serif";
    ctx.fillText(mode === "antibiotic" ? "survival threshold" : "habitat shade", gx + 4, gy + gh + 12);

    const mx = gx + Math.min(Math.max(0, meanTrait), 1) * gw;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(mx, gy + 8, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#7c3aed";
    ctx.font = "10px sans-serif";
    ctx.fillText("trait distribution", gx + 6, gy + 16);
    ctx.fillStyle = "#6d28d9";
    ctx.font = "9px sans-serif";
    ctx.fillText(`mean ${meanTrait.toFixed(2)}`, gx + 6, gy + 28);
  };

  const sub =
    mode === "antibiotic"
      ? topic
        ? `${topic} — the antibiotic kills the susceptible bacteria; the resistant few survive and multiply.`
        : "Antibiotic resistance: the drug kills susceptible bacteria, leaving the resistant ones to reproduce — the population evolves."
      : topic
        ? `${topic} — the background favours the camouflaged mice; the conspicuous ones get eaten and their genes die out.`
        : "Natural selection: individuals that blend in survive and pass on their traits, generation after generation.";

  const hint =
    mode === "antibiotic"
      ? "This is exactly why doctors finish antibiotic courses and avoid overuse: selection pressure turns a rare resistance into a common one. Mutations supply the variation; selection decides who reproduces."
      : "The mice's genes themselves don't change — the frequencies in the population do. That is evolution by natural selection, the same process that shapes every living thing.";

  const reset = () => {
    popRef.current = makePopulation(0.5);
    setPopulation(popRef.current);
    setHistory([0.5]);
    setGeneration(0);
    setKilled(0);
    setRunning(false);
  };

  return (
    <SimShell
      icon={<span>◉</span>}
      title={simTitle(topic, "Natural Selection")}
      subtitle={sub}
      accent={accent}
      hint={hint}
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <ActionButton label="Next generation" icon="→" onClick={nextGen} hex="#94a3b8" />
        </>
      }
    >
      <SimCanvas draw={draw} deps={[population, background, mode, history, generation, killed, resistant, meanTrait]} />
      <div className="mt-4">
        <RunControls running={running} onToggle={() => setRunning((r) => !r)} onReset={reset} hex={a.hex} label={running ? "Pause" : "Run generations"} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ActionButton label="Light habitat" hex={background === 0.12 ? a.hex : "#94a3b8"} onClick={() => setBackground(0.12)} />
        <ActionButton label="Mixed habitat" hex={background === 0.5 ? a.hex : "#94a3b8"} onClick={() => setBackground(0.5)} />
        <ActionButton label="Dark habitat" hex={background === 0.88 ? a.hex : "#94a3b8"} onClick={() => setBackground(0.88)} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={mode === "antibiotic" ? "Resistance level needed to survive" : "Background shade"} value={background} min={0} max={1} step={0.01} hex={a.hex} accent={a.text} onChange={setBackground} />
        <Slider label={mode === "antibiotic" ? "Antibiotic dose" : "Predator pressure"} value={pressure} min={0.1} max={1} step={0.01} hex={a.hex} accent={a.text} onChange={setPressure} />
        <Slider label="Mutation rate" value={mutation * 100} min={0} max={15} step={0.5} hex={a.hex} accent={a.text} unit="%" onChange={(n) => setMutation(n / 100)} />
        <div className="rounded-xl border border-foreground/15 bg-white/50 px-3 py-2 text-sm text-foreground/60 dark:bg-white/5">
          <span className="font-semibold text-foreground">Generation {generation}</span> — mean trait {meanTrait.toFixed(2)}
          {mode === "antibiotic" ? " (higher = more resistant)" : " (higher = darker coat)"}
          {adaptGens !== null && (
            <div className="mt-0.5 text-foreground/60">
              ~{adaptGens} generation{adaptGens === 1 ? "" : "s"} to reach optimum at current rate
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Generation" value={`${generation}`} accent={a.text} />
        <Stat label={mode === "antibiotic" ? "Bacteria alive" : "Prey alive"} value={`${population.length}`} accent={a.text} />
        <Stat label="Mean trait" value={meanTrait.toFixed(2)} accent={a.text} />
        <Stat label="Survival fit" value={`${survive(meanTrait, background, pressure).toFixed(2)}`} accent={a.text} />
        <Stat label={mode === "antibiotic" ? "Resistant" : "Eaten"} value={mode === "antibiotic" ? `${resistant}` : `${killed}`} accent={a.text} />
        <Stat label="Adaptation rate" value={adaptRate.toFixed(3)} accent={a.text} />
      </div>
    </SimShell>
  );
}
