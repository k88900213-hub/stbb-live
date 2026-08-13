"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

const ORGANELLES = [
  { key: "nucleus", name: "Nucleus", color: "#8b5cf6", desc: "Controls the cell — stores DNA, the instructions for making proteins.", x: 320, y: 110 },
  { key: "mitochondria", name: "Mitochondria", color: "#f59e0b", desc: "Powerhouse of the cell — releases energy from glucose by respiration.", x: 210, y: 150 },
  { key: "chloroplast", name: "Chloroplast", color: "#22c55e", desc: "Site of photosynthesis — makes glucose from CO₂ and water using light.", x: 430, y: 170 },
  { key: "ribosome", name: "Ribosome", color: "#06b6d4", desc: "Makes proteins from amino acids, following the mRNA instructions.", x: 150, y: 90 },
  { key: "membrane", name: "Cell membrane", color: "#f43f5e", desc: "Outer barrier — controls what enters and leaves the cell.", x: 80, y: 140 },
];

export function OrganelleSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const [selected, setSelected] = useState("nucleus");
  const [plant, setPlant] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const current = ORGANELLES.find((o) => o.key === selected) ?? ORGANELLES[0];
  const pulse = 1 + Math.sin(sim.tick * 0.08) * 0.03;
  return (
    <SimShell
      icon="🧬"
      title={simTitle(topic, "Cell organelles")}
      accent="violet"
      subtitle={`${topic ?? "Organelles"} — each structure inside the cell has a special job. Select one to learn what it does.`}
      hint="Plant cells have chloroplasts and a cell wall; animal cells do not. Both have a nucleus, mitochondria, ribosomes and a membrane."
      controls={<SimChip accent="violet"><span aria-hidden>🧬</span>{topic ?? "organelles"}</SimChip>}
    >
      <SimCanvas
        deps={[selected, plant, sim.tick, pulse]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          if (plant) {
            ctx.strokeStyle = "#16a34a";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.ellipse(w / 2, h / 2, 222, 112, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.ellipse(w / 2, h / 2, 208 * pulse, 98 * pulse, 0, 0, Math.PI * 2);
          ctx.fillStyle = "#f3e8ff";
          ctx.fill();
          ctx.strokeStyle = "#6d28d9";
          ctx.lineWidth = 3;
          ctx.stroke();
          for (const o of ORGANELLES) {
            const active = o.key === selected;
            if (o.key === "chloroplast" && !plant) continue;
            ctx.beginPath();
            ctx.arc(o.x, o.y, active ? 22 : 16, 0, Math.PI * 2);
            ctx.fillStyle = o.color;
            ctx.fill();
            ctx.strokeStyle = active ? "#0f172a" : "rgba(15,23,42,0.3)";
            ctx.lineWidth = active ? 3 : 1;
            ctx.stroke();
            ctx.fillStyle = active ? "#0f172a" : "rgba(15,23,42,0.6)";
            ctx.font = active ? "bold 11px system-ui" : "10px system-ui";
            ctx.fillText(o.name, o.x - 26, o.y + 34);
          }
          if (plant) {
            ctx.strokeStyle = "rgba(34,197,94,0.5)";
            ctx.setLineDash([4, 3]);
            ctx.strokeRect(70, 40, w - 140, h - 80);
            ctx.setLineDash([]);
            ctx.fillStyle = "#166534";
            ctx.font = "11px system-ui";
            ctx.fillText("cell wall (plant only)", 76, 36);
          }
        }}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {ORGANELLES.map((o) => (
          <ActionButton
            key={o.key}
            label={o.name}
            hex={selected === o.key ? o.color : "#94a3b8"}
            onClick={() => setSelected(o.key)}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Plant cell" checked={plant} onChange={setPlant} hex={a} hint="adds a cell wall & chloroplast" />
      </div>
      <div className="mt-4 rounded-xl border border-white/40 bg-white/50 px-4 py-3 text-sm text-foreground/80 dark:border-white/10 dark:bg-white/5">
        <span className="font-semibold" style={{ color: current.color }}>{current.name}: </span>{current.desc}
      </div>
    </SimShell>
  );
}

function useMemoSeq(pairs: number) {
  const alphabet = "AGTC";
  const seq: string[] = [];
  for (let i = 0; i < pairs; i++) {
    seq.push(alphabet[i % alphabet.length]);
  }
  return seq;
}

export function DnaSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [pairs, setPairs] = useState(14);
  const [labels, setLabels] = useState(true);
  const [mutate, setMutate] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const seq = useMemoSeq(pairs);
  const mutSeq = mutate ? seq.map((b, i) => (i === 0 ? (b === "A" ? "G" : b === "G" ? "A" : b === "T" ? "C" : "T") : b)) : seq;
  const count = (b: string) => mutSeq.filter((p) => p === b).length;
  const gc = Math.round((mutSeq.filter((p) => p === "G" || p === "C").length / Math.max(1, mutSeq.length)) * 100);
  return (
    <SimShell
      icon="🧬"
      title={simTitle(topic, "DNA structure")}
      accent="violet"
      subtitle={`${topic ?? "DNA"} — a double helix of two strands joined by base pairs: adenine with thymine, guanine with cytosine (A–T, G–C).`}
      hint="The pairing rule keeps the two strands complementary — that is how DNA copies itself and how genes carry information in triplet codons. A point mutation swaps one base, altering the code."
      controls={<SimChip accent="violet"><span aria-hidden>🧬</span>{topic ?? "DNA"}</SimChip>}
    >
      <SimCanvas
        deps={[pairs, labels, mutate, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = w / 2;
          const step = Math.min(16, 130 / Math.max(6, pairs));
          for (let i = 0; i < pairs; i++) {
            const y = 25 + i * step;
            const sway = Math.sin(i * 0.4 + sim.tick * 0.05 * speedMul) * 18;
            const x1 = cx - 30 - sway;
            const x2 = cx + 30 + sway;
            ctx.strokeStyle = "#6d28d9";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();
            const b = mutSeq[i % mutSeq.length];
            const comp = b === "A" ? "T" : b === "T" ? "A" : b === "G" ? "C" : "G";
            ctx.fillStyle = b === "A" || b === "T" ? "#f59e0b" : "#06b6d4";
            ctx.beginPath();
            ctx.arc(x1, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x2, y, 4, 0, Math.PI * 2);
            ctx.fill();
            if (labels && i % 2 === 0) {
              ctx.fillStyle = "#0f172a";
              ctx.font = "8px system-ui";
              ctx.fillText(`${b}–${comp}`, cx + 12, y + 3);
            }
            if (mutate && i === 0) {
              ctx.strokeStyle = "#dc2626";
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(x1, y, 8, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
          ctx.fillStyle = "#4c1d95";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`${pairs} base pairs · ${gc}% G–C${mutate ? " · mutated first base ✱" : ""}`, 30, h - 10);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Base pairs" value={pairs} min={6} max={30} step={1} hex={a} accent={at} onChange={setPairs} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Point mutation" checked={mutate} onChange={setMutate} hex={a} />
        <Toggle label="Show labels" checked={labels} onChange={setLabels} hex={a} />
        {[
          ["Short gene", 10],
          ["Typical", 16],
          ["Long gene", 26],
        ].map(([l, v]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => setPairs(Number(v))} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm sm:grid-cols-5">
        <Stat label="A count" value={`${count("A")}`} accent={at} />
        <Stat label="T count" value={`${count("T")}`} accent={at} />
        <Stat label="G count" value={`${count("G")}`} accent="text-cyan-600 dark:text-cyan-400" />
        <Stat label="C count" value={`${count("C")}`} accent="text-cyan-600 dark:text-cyan-400" />
        <Stat label="G–C content" value={`${gc}%`} accent={at} />
      </div>
    </SimShell>
  );
}

export function ProteinSynthesisSim({ topic }: { topic?: string }) {
  const a = "#f59e0b";
  const at = "text-amber-600 dark:text-amber-400";
  const [geneLen, setGeneLen] = useState(4);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul, autoRun: false });
  const codonTable: Array<[string, string]> = [
    ["AUG", "Met"],
    ["CCU", "Pro"],
    ["GAU", "Asp"],
    ["GAC", "Asp"],
    ["UAC", "Tyr"],
    ["GGA", "Gly"],
    ["UUA", "Leu"],
    ["CUU", "Leu"],
  ];
  const codons = codonTable.slice(0, geneLen).map((c) => c[0]);
  const aaTable = Object.fromEntries(codonTable) as Record<string, string>;
  const mrna = codons.join("");
  const dna = mrna.split("").map((b) => (b === "U" ? "T" : b)).join("");
  const pos = Math.floor(sim.elapsed / 1.2) % (codons.length + 1);
  const shown = pos;
  const chain = codons.slice(0, shown).map((c) => aaTable[c] ?? "?").join("–");
  const cw = (w: number) => Math.min(150, (w - 120) / codons.length);
  return (
    <SimShell
      icon="🧬"
      title={simTitle(topic, "Protein synthesis")}
      accent="amber"
      subtitle={`${topic ?? "Protein synthesis"} — DNA is transcribed to mRNA, then each triplet codon is translated into an amino acid. This gene codes for ${geneLen} amino acids.`}
      hint="Three bases (a codon) code for one amino acid. Transcription makes mRNA in the nucleus; translation builds the protein on ribosomes. Change the gene length to see longer proteins assemble."
      controls={<SimChip accent="amber"><span aria-hidden>🧬</span>{topic ?? "protein synthesis"}</SimChip>}
    >
      <SimCanvas
        deps={[sim.tick, shown, chain, geneLen]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#78350f";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("DNA:", 30, 30);
          ctx.font = "12px system-ui";
          ctx.fillText(dna, 80, 30);
          ctx.fillText("mRNA:", 30, 55);
          ctx.fillStyle = "#b45309";
          ctx.fillText(mrna, 80, 55);
          const riboY = 100;
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(50, riboY);
          ctx.lineTo(w - 50, riboY);
          ctx.stroke();
          ctx.fillStyle = "#d97706";
          ctx.font = "bold 11px system-ui";
          ctx.fillText("ribosome moves along mRNA", w / 2 - 85, riboY - 8);
          const step = cw(w);
          codons.forEach((c, i) => {
            const cx = 60 + i * step + step / 2;
            const active = i === shown;
            ctx.fillStyle = active ? "#f59e0b" : "#e2e8f0";
            ctx.beginPath();
            ctx.arc(cx, riboY, active ? 15 : 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = active ? "#fff" : "#64748b";
            ctx.font = active ? "bold 11px system-ui" : "10px system-ui";
            ctx.fillText(c, cx - 13, riboY + 4);
          });
          const beadColors = ["#f59e0b", "#f97316", "#ef4444"];
          for (let i = 0; i < shown; i++) {
            const x = 60 + i * step + step / 2;
            ctx.beginPath();
            ctx.arc(x, 160, 12, 0, Math.PI * 2);
            ctx.fillStyle = beadColors[i % beadColors.length];
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 9px system-ui";
            ctx.fillText(codons[i] ? (aaTable[codons[i]] ?? "?")[0] : "", x - 4, 164);
          }
          ctx.fillStyle = "#92400e";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`protein: ${chain || "… waiting for ribosome"}`, 30, 200);
          ctx.fillStyle = "#b45309";
          ctx.font = "12px system-ui";
          ctx.fillText(shown >= codons.length ? "translation complete ✓" : `reading codon ${Math.min(shown + 1, codons.length)} of ${codons.length}`, 30, 224);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Gene length (codons)" value={geneLen} min={3} max={8} step={1} hex={a} accent={at} unit=" codons" onChange={setGeneLen} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <ActionButton label="Run translation" icon="▶" hex={a} onClick={() => { sim.reset(); sim.setRunning(true); }} />
        <ActionButton label="Reset" icon="↺" hex="#64748b" onClick={() => { sim.setRunning(false); sim.reset(); }} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Amino acids" value={`${geneLen}`} accent={at} />
        <Stat label="Transcription" value="DNA → mRNA" accent={at} />
        <Stat label="Translation" value="mRNA → protein" accent={at} />
      </div>
    </SimShell>
  );
}

export function ImmuneSim({ topic }: { topic?: string }) {
  const a = "#06b6d4";
  const at = "text-cyan-600 dark:text-cyan-400";
  const [pathogens, setPathogens] = useState(14);
  const [activity, setActivity] = useState(50);
  const [antibodies, setAntibodies] = useState(true);
  const [vaccinated, setVaccinated] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const ratePerSec = (activity / 50) * (vaccinated ? 2 : 1);
  const caught = Math.min(pathogens, Math.floor(sim.elapsed * ratePerSec));
  const remaining = Math.max(0, pathogens - caught);
  const ab = antibodies ? Math.min(remaining, Math.round(activity / 12)) : 0;
  const memory = vaccinated ? 5 : Math.max(1, Math.min(5, Math.floor(activity / 20)));
  const clearSec = remaining > 0 ? remaining / ratePerSec : 0;
  return (
    <SimShell
      icon="🛡️"
      title={simTitle(topic, "Immune response")}
      accent="cyan"
      subtitle={`${topic ?? "Immune system"} — white blood cells patrol the blood, recognise invading pathogens and engulf or kill them. Vaccines prime memory cells so the next infection is cleared ~2× faster.`}
      hint="Phagocytes engulf and digest bacteria; lymphocytes make antibodies that stick to antigens. Memory B cells persist after infection — that is why vaccines teach the immune system to respond quickly."
      controls={<SimChip accent="cyan"><span aria-hidden>🛡️</span>{topic ?? "immune system"}</SimChip>}
    >
      <SimCanvas
        deps={[pathogens, activity, sim.tick, caught, antibodies, ab, vaccinated, memory]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          for (let i = 0; i < 3; i++) {
            const x = 90 + ((i * 233 + sim.tick * 2.5) % (w - 180));
            const y = 50 + ((i * 89 + sim.tick * 1.8) % (h - 100));
            ctx.beginPath();
            ctx.arc(x, y, 11, 0, Math.PI * 2);
            ctx.fillStyle = "#06b6d4";
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "bold 9px system-ui";
            ctx.fillText("WBC", x - 8, y + 3);
          }
          for (let i = 0; i < pathogens; i++) {
            const x = 80 + ((i * 173 + sim.tick * (i % 2 === 0 ? 0.6 : -0.6)) % (w - 160));
            const y = 45 + ((i * 71) % (h - 90));
            const isCaught = i < caught;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = isCaught ? "#94a3b8" : "#ef4444";
            ctx.fill();
            if (isCaught) {
              ctx.strokeStyle = "rgba(148,163,184,0.6)";
              ctx.beginPath();
              ctx.moveTo(x - 7, y - 7);
              ctx.lineTo(x + 7, y + 7);
              ctx.stroke();
            }
          }
          if (ab > 0) {
            for (let i = 0; i < ab; i++) {
              const target = caught + i;
              const x = 80 + ((target * 173) % (w - 160));
              const y = 45 + ((target * 71) % (h - 90));
              ctx.strokeStyle = "#f59e0b";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x, y - 12);
              ctx.lineTo(x - 7, y - 22);
              ctx.moveTo(x, y - 12);
              ctx.lineTo(x + 7, y - 22);
              ctx.moveTo(x, y - 12);
              ctx.lineTo(x, y - 24);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(x, y - 27, 3, 0, Math.PI * 2);
              ctx.fillStyle = "#f59e0b";
              ctx.fill();
            }
          }
          ctx.fillStyle = "#0e7490";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`neutralised: ${caught} / ${pathogens} · memory cells: ${memory}`, 30, 30);
          ctx.fillStyle = "#155e75";
          ctx.font = "12px system-ui";
          ctx.fillText(remaining === 0 ? "infection cleared ✓" : `clear in ≈ ${clearSec.toFixed(1)} s${vaccinated ? " (vaccine speed)" : ""}`, 30, 50);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Invading pathogens" value={pathogens} min={2} max={20} step={1} hex={a} accent={at} onChange={setPathogens} />
        <Slider label="WBC activity" value={activity} min={10} max={100} step={5} hex={a} accent={at} unit="%" onChange={setActivity} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show antibodies" checked={antibodies} onChange={setAntibodies} hex={a} hint="lymphocyte antibodies (Y)" />
        <Toggle label="Vaccinated" checked={vaccinated} onChange={setVaccinated} hex={a} hint="memory cells boost response" />
        <ActionButton label="New infection" icon="🦠" hex={a} onClick={() => { sim.reset(); setPathogens((p) => Math.min(20, p + 3)); }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Remaining" value={`${remaining}`} accent={at} />
        <Stat label="Time to clear" value={`${clearSec.toFixed(1)} s`} accent={at} />
        <Stat label="Memory cells" value={`${memory}`} accent={at} />
        <Stat label="Antibodies" value={`${ab}`} accent={at} />
      </div>
    </SimShell>
  );
}

export function HormoneSim({ topic }: { topic?: string }) {
  const a = "#f43f5e";
  const at = "text-rose-600 dark:text-rose-400";
  const [glucose, setGlucose] = useState(30);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const insulin = Math.max(0, Math.round((glucose - 20) * 5));
  const corrected = Math.max(20, glucose - insulin * 0.4);
  const pulse = 0.5 + Math.abs(Math.sin(sim.tick * 0.15)) * 0.5;
  return (
    <SimShell
      icon="🧪"
      title={simTitle(topic, "Hormones & feedback")}
      accent="rose"
      subtitle={`${topic ?? "Hormones"} — when blood glucose rises, the pancreas releases insulin, which lowers it again — a negative feedback loop.`}
      hint="Diabetes is when the body makes too little insulin or ignores it. Hormones travel in the blood and act as chemical messengers."
      controls={<SimChip accent="rose"><span aria-hidden>🧪</span>{topic ?? "hormones"}</SimChip>}
    >
      <SimCanvas
        deps={[glucose, sim.tick, insulin, corrected, pulse]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const base = h - 40;
          const bar = (x: number, v: number, color: string, label: string) => {
            const bh = Math.min(130, v * 1.6);
            ctx.fillStyle = color;
            ctx.fillRect(x, base - bh, 55, bh);
            ctx.strokeStyle = "rgba(100,116,139,0.3)";
            ctx.strokeRect(x, base - 130, 55, 130);
            ctx.fillStyle = "#334155";
            ctx.font = "11px system-ui";
            ctx.fillText(`${v.toFixed(1)}`, x + 12, base - bh - 6);
            ctx.fillText(label, x + 4, base + 16);
          };
          bar(90, glucose / 10, "#fb7185", "glucose");
          bar(200, insulin / 10, "#f59e0b", "insulin");
          bar(310, corrected / 10, "#34d399", "after");
          if (insulin > 0) {
            ctx.strokeStyle = `rgba(244,63,94,${0.5 + pulse * 0.5})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(150, base - 40);
            ctx.quadraticCurveTo(175, base - 110, 205, base - 40);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(250, base - 40);
            ctx.quadraticCurveTo(280, base - 110, 320, base - 40);
            ctx.stroke();
            ctx.fillStyle = "#be123c";
            ctx.font = "10px system-ui";
            ctx.fillText("insulin released", 130, base - 140);
            ctx.fillText("glucose falls", 245, base - 140);
          }
          ctx.fillStyle = "#9f1239";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(
            insulin === 0 ? "glucose normal — no insulin needed" : corrected < glucose ? "negative feedback: insulin pulls glucose down" : "feedback loop steady",
            30,
            30,
          );
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Carbohydrate intake" value={glucose} min={20} max={60} step={1} hex={a} accent={at} unit=" mmol/L" onChange={setGlucose} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        {[
          ["Fasting", 22],
          ["Normal meal", 30],
          ["Sweet drink", 40],
          ["Binge", 60],
        ].map(([l, v]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => setGlucose(Number(v))} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Insulin released" value={`${insulin} units`} accent={at} />
        <Stat label="Glucose after" value={`${corrected.toFixed(1)} mmol/L`} accent={at} />
        <Stat label="Control type" value="negative feedback" accent={at} />
      </div>
    </SimShell>
  );
}

export function EarSim({ topic }: { topic?: string }) {
  const a = "#8b5cf6";
  const at = "text-violet-600 dark:text-violet-400";
  const [freq, setFreq] = useState(50);
  const [cochleaMap, setCochleaMap] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const hz = Math.round(20 * Math.pow(10, (freq / 100) * 3));
  const audible = hz >= 20 && hz <= 20000;
  const hotSpot = Math.round((freq / 100) * 14);
  return (
    <SimShell
      icon="👂"
      title={simTitle(topic, "The ear & hearing")}
      accent="violet"
      subtitle={`${topic ?? "The ear"} — sound waves beat on the eardrum, move the ossicles, and shake the cochlea where hair cells turn vibration into nerve impulses.`}
      hint="The human ear hears 20 Hz to 20 kHz. Different places along the cochlea respond to different frequencies — high notes vibrate near the base."
      controls={<SimChip accent="violet"><span aria-hidden>👂</span>{topic ?? "hearing"}</SimChip>}
    >
      <SimCanvas
        deps={[freq, sim.tick, audible, hotSpot, cochleaMap]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          for (let i = 0; i < 4; i++) {
            const waveX = 30 + ((sim.tick * (2 + i * 0.7) + i * 24) % 70);
            ctx.strokeStyle = `rgba(109,40,217,${0.8 - i * 0.15})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(waveX, h / 2, 6 + (i * 13) / 3, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = "#ede9fe";
          ctx.beginPath();
          ctx.arc(130, h / 2, 42, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#6d28d9";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.strokeStyle = "#a78bfa";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(104, h / 2 - 26);
          ctx.quadraticCurveTo(130, h / 2 - 40 - (audible ? 6 : 0), 156, h / 2 - 26);
          ctx.stroke();
          ctx.fillStyle = "#d8b4fe";
          ctx.fillRect(150, h / 2 - 12, 46, 24);
          ctx.fillStyle = "#c4b5fd";
          ctx.font = "10px system-ui";
          ctx.fillText("ossicles", 152, h / 2 - 18);
          const amp = audible ? 10 + (sim.tick % 5) : 3;
          for (let i = 0; i < 15; i++) {
            const x = 205 + i * 12;
            const y = h / 2;
            const hot = Math.abs(i - hotSpot) < 2;
            ctx.strokeStyle = `rgba(109,40,217,${hot ? 0.9 : 0.4})`;
            ctx.lineWidth = hot ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(x, y - (hot ? amp : 6));
            ctx.lineTo(x, y + (hot ? amp : 6));
            ctx.stroke();
          }
          if (cochleaMap) {
            ctx.fillStyle = "#4c1d95";
            ctx.font = "9px system-ui";
            ctx.fillText("base (high)", 205, h / 2 + 28);
            ctx.fillText("apex (low)", 355, h / 2 + 28);
          }
          ctx.fillStyle = "#4c1d95";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(audible ? `${hz} Hz — audible ✓` : `${hz} Hz — outside human range`, 30, 30);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Frequency" value={freq} min={0} max={100} step={1} hex={a} accent={at} onChange={setFreq} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Cochlea map" checked={cochleaMap} onChange={setCochleaMap} hex={a} />
        {[
          ["Bass 60 Hz", 5],
          ["Speech 1 kHz", 39],
          ["High 10 kHz", 79],
          ["Ultrasound", 100],
        ].map(([l, v]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => setFreq(Number(v))} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Frequency" value={`${hz} Hz`} accent={at} />
        <Stat label="Human range" value="20 Hz – 20 kHz" accent={at} />
        <Stat label="Heard?" value={audible ? "yes" : "no"} accent={at} />
      </div>
    </SimShell>
  );
}

export function PollinationSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const [flowers, setFlowers] = useState(6);
  const [bees, setBees] = useState(3);
  const [wind, setWind] = useState(false);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const pollinated = Math.min(flowers, bees * Math.floor((sim.tick / 60) % (flowers + 1)));
  return (
    <SimShell
      icon="🌸"
      title={simTitle(topic, "Pollination")}
      accent="orange"
      subtitle={`${topic ?? "Pollination"} — insects carry pollen from one flower's anther to another flower's stigma, enabling fertilisation and seeds.`}
      hint="Bright petals, scent and nectar attract bees; wind-pollinated grasses make huge amounts of light pollen instead."
      controls={<SimChip accent="orange"><span aria-hidden>🌸</span>{wind ? "wind" : "insect"}</SimChip>}
    >
      <SimCanvas
        deps={[flowers, bees, wind, sim.tick, pollinated]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const step = Math.min(90, (w - 140) / Math.max(1, flowers));
          const ox = (w - step * (flowers - 1)) / 2;
          for (let i = 0; i < flowers; i++) {
            const x = ox + i * step;
            const y = h - 55;
            ctx.strokeStyle = "#22c55e";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, y + 25);
            ctx.lineTo(x, y);
            ctx.stroke();
            const done = i < pollinated;
            for (let p = 0; p < 5; p++) {
              const aa = (p / 5) * Math.PI * 2 + Math.PI / 5;
              ctx.beginPath();
              ctx.ellipse(x + Math.cos(aa) * 11, y + Math.sin(aa) * 11, 9, 6, aa, 0, Math.PI * 2);
              ctx.fillStyle = done ? "#fb923c" : "#fde68a";
              ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#d97706";
            ctx.fill();
            ctx.fillStyle = done ? "#b45309" : "#a16207";
            ctx.font = "9px system-ui";
            ctx.fillText(done ? "seeded" : "open", x - 16, y + 40);
          }
          if (wind) {
            for (let i = 0; i < 16; i++) {
              const gx = ((i * 97 + sim.tick * 2.5) % (w - 120)) + 60;
              const gy = 50 + ((i * 41) % (h - 110));
              ctx.beginPath();
              ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(234,179,8,0.7)";
              ctx.fill();
            }
          } else {
            for (let i = 0; i < bees; i++) {
              const target = (i + sim.tick * 0.25) % flowers;
              const bx = ox + target * step;
              const by = 55 + Math.sin(sim.tick * 0.2 + i) * 20;
              ctx.fillStyle = "#f59e0b";
              ctx.fillRect(bx - 8, by - 5, 16, 10);
              ctx.fillStyle = "#78350f";
              ctx.font = "bold 12px system-ui";
              ctx.fillText("🐝", bx - 5, by + 5);
            }
          }
          ctx.fillStyle = "#9a3412";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`pollinated: ${pollinated} / ${flowers}`, 30, 30);
          ctx.fillStyle = "#c2410c";
          ctx.font = "12px system-ui";
          ctx.fillText(wind ? "wind carries lightweight pollen" : "bees carry pollen anther → stigma", 30, 50);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Flowers" value={flowers} min={3} max={10} step={1} hex={a} accent={at} onChange={setFlowers} />
        <Slider label="Bees" value={bees} min={1} max={5} step={1} hex={a} accent={at} onChange={setBees} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Wind pollination" checked={wind} onChange={setWind} hex={a} hint="grasses & trees, no bees needed" />
        {[
          ["Grass meadow", 8, 0],
          ["Apple orchard", 4, 2],
          ["Bustling meadow", 6, 5],
        ].map(([l, f, b]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => { setFlowers(Number(f)); setBees(Number(b)); }} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Pollen transfer" value="anther → stigma" accent={at} />
        <Stat label="Pollinated" value={`${pollinated} flowers`} accent={at} />
        <Stat label="Reward" value="nectar for bees" accent={at} />
      </div>
    </SimShell>
  );
}

export function GerminationSim({ topic }: { topic?: string }) {
  const a = "#22c55e";
  const at = "text-lime-600 dark:text-lime-400";
  const [days, setDays] = useState(4);
  const [water, setWater] = useState(70);
  const [showRoots, setShowRoots] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const growing = days >= 1 && water >= 30;
  const height = growing ? Math.min(120, days * 11) : 0;
  const sway = Math.sin(sim.tick * 0.1 * speedMul) * 3;
  return (
    <SimShell
      icon="🌱"
      title={simTitle(topic, "Seed germination")}
      accent="lime"
      subtitle={`${topic ?? "Germination"} — a seed needs water, oxygen and warmth to germinate: the radicle grows down, the plumule grows up.`}
      hint="Water softens the seed coat and activates enzymes; oxygen is needed for the respiration that releases energy from the stored food."
      controls={<SimChip accent="lime"><span aria-hidden>🌱</span>{topic ?? "germination"}</SimChip>}
    >
      <SimCanvas
        deps={[days, water, sim.tick, growing, height, sway, showRoots]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "#92400e";
          ctx.fillRect(0, h - 35, w, 35);
          ctx.fillStyle = "#713f12";
          ctx.font = "12px system-ui";
          ctx.fillText("soil", 30, h - 12);
          if (water < 30) {
            ctx.fillStyle = "rgba(59,130,246,0.4)";
            ctx.fillRect(0, h - 35, w, 8);
          }
          const x = w / 2;
          if (growing) {
            if (showRoots) {
              const root = Math.min(46, days * 5);
              ctx.strokeStyle = "#d97706";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(x, h - 32);
              ctx.lineTo(x, h - 32 + root);
              ctx.moveTo(x, h - 32 + root * 0.6);
              ctx.lineTo(x - 12, h - 32 + root * 0.9);
              ctx.moveTo(x, h - 32 + root * 0.6);
              ctx.lineTo(x + 12, h - 32 + root * 0.9);
              ctx.stroke();
            }
            const top = h - 40 - height;
            ctx.strokeStyle = "#22c55e";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x, h - 32);
            ctx.quadraticCurveTo(x + sway, h - 40 - height / 2, x + sway, top);
            ctx.stroke();
            ctx.fillStyle = "#65a30d";
            ctx.beginPath();
            ctx.arc(x + sway - 14, top + 4, 8, 0, Math.PI * 2);
            ctx.arc(x + sway + 12, top + 8, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#3f6212";
            ctx.font = "bold 12px system-ui";
            ctx.fillText(`day ${days} — seedling ${height.toFixed(0)} cm`, 30, 30);
          } else {
            ctx.beginPath();
            ctx.arc(x, h - 40, 14, 0, Math.PI * 2);
            ctx.fillStyle = "#d97706";
            ctx.fill();
            ctx.fillStyle = "#78350f";
            ctx.font = "12px system-ui";
            ctx.fillText(water < 30 ? "needs water!" : "seed resting…", x - 44, h - 60);
          }
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Day" value={days} min={0} max={10} step={1} hex={a} accent={at} onChange={setDays} />
        <Slider label="Water supply" value={water} min={0} max={100} step={5} hex={a} accent={at} unit="%" onChange={setWater} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show roots" checked={showRoots} onChange={setShowRoots} hex={a} />
        {[
          ["Too dry", 2, 10],
          ["Just right", 5, 70],
          ["Soaked", 7, 100],
        ].map(([l, d, ww]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => { setDays(Number(d)); setWater(Number(ww)); }} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Needs" value="water + oxygen + warmth" accent={at} />
        <Stat label="Radicle" value="grows down (root)" accent={at} />
        <Stat label="Plumule" value="grows up (shoot)" accent={at} />
      </div>
    </SimShell>
  );
}

export function NitrogenCycleSim({ topic }: { topic?: string }) {
  const a = "#06b6d4";
  const at = "text-cyan-600 dark:text-cyan-400";
  const [decomposition, setDecomposition] = useState(50);
  const [flow, setFlow] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const ammonium = (decomposition / 100) * 80;
  const nitrate = ammonium * 0.7;
  return (
    <SimShell
      icon="♻️"
      title={simTitle(topic, "The nitrogen cycle")}
      accent="cyan"
      subtitle={`${topic ?? "Nitrogen cycle"} — decomposers turn dead matter into ammonium; nitrifying bacteria make nitrates that plants absorb.`}
      hint="Nitrogen-fixing bacteria in root nodules turn air N₂ into usable nitrogen. Denitrifying bacteria return nitrogen to the air, completing the cycle."
      controls={<SimChip accent="cyan"><span aria-hidden>♻️</span>{topic ?? "nitrogen cycle"}</SimChip>}
    >
      <SimCanvas
        deps={[decomposition, sim.tick, flow, ammonium, nitrate]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = w / 2;
          const cy = h / 2;
          const nodes = [
            { x: cx, y: 40, label: "N₂ in air", c: "#0e7490" },
            { x: 90, y: cy + 55, label: "ammonium", c: "#0891b2" },
            { x: cx, y: h - 35, label: "nitrates", c: "#06b6d4" },
            { x: w - 90, y: cy + 55, label: "plants & animals", c: "#22c55e" },
          ];
          for (let i = 0; i < nodes.length; i++) {
            const a2 = nodes[i];
            const b = nodes[(i + 1) % nodes.length];
            ctx.strokeStyle = "rgba(14,116,144,0.6)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(a2.x, a2.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            if (flow) {
              const t = ((sim.tick * 0.02 * speedMul + i * 0.25) % 1);
              const fx = a2.x + (b.x - a2.x) * t;
              const fy = a2.y + (b.y - a2.y) * t;
              ctx.beginPath();
              ctx.arc(fx, fy, 4, 0, Math.PI * 2);
              ctx.fillStyle = "#a5f3fc";
              ctx.fill();
            }
          }
          for (const n of nodes) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 26, 0, Math.PI * 2);
            ctx.fillStyle = n.c;
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "10px system-ui";
            ctx.fillText(n.label, n.x - 34, n.y + 4);
          }
          ctx.fillStyle = "#155e75";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`ammonium ${ammonium.toFixed(0)} · nitrates ${nitrate.toFixed(0)}`, 30, 30);
          ctx.fillStyle = "#0e7490";
          ctx.font = "12px system-ui";
          ctx.fillText(decomposition < 20 ? "little decomposition → cycle slows" : "nutrients cycling…", 30, 50);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Decomposition" value={decomposition} min={0} max={100} step={5} hex={a} accent={at} unit="%" onChange={setDecomposition} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show flow" checked={flow} onChange={setFlow} hex={a} hint="animated particles around the cycle" />
        {[
          ["Desert soil", 10],
          ["Farmland", 50],
          ["Compost heap", 90],
        ].map(([l, v]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => setDecomposition(Number(v))} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Nitrifying bacteria" value="NH₄⁺ → NO₃⁻" accent={at} />
        <Stat label="Nitrogen-fixing" value="N₂ → usable N" accent={at} />
        <Stat label="Decomposers" value="release ammonium" accent={at} />
      </div>
    </SimShell>
  );
}

export function WaterCycleSim({ topic }: { topic?: string }) {
  const a = "#3b82f6";
  const at = "text-sky-600 dark:text-sky-400";
  const [heat, setHeat] = useState(50);
  const [showArrows, setShowArrows] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const evap = heat / 100;
  const cloudLevel = 78 - evap * 30;
  const drops = Math.round(evap * 12);
  return (
    <SimShell
      icon="💧"
      title={simTitle(topic, "The water cycle")}
      accent="sky"
      subtitle={`${topic ?? "Water cycle"} — the Sun evaporates water; it condenses into clouds and falls as rain; rivers carry it back to the sea.`}
      hint="Evaporation, condensation, precipitation and run-off keep Earth's water moving — the same water has cycled for millions of years."
      controls={<SimChip accent="sky"><span aria-hidden>💧</span>{topic ?? "water cycle"}</SimChip>}
    >
      <SimCanvas
        deps={[heat, sim.tick, evap, cloudLevel, drops, showArrows]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const seaY = h - 45;
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(0, seaY, w, 45);
          ctx.fillStyle = "#93c5fd";
          ctx.fillRect(0, seaY - 4, w, 6);
          ctx.fillStyle = "#facc15";
          ctx.beginPath();
          ctx.arc(w - 60, 40, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#0b1220";
          ctx.font = "10px system-ui";
          ctx.fillText("sun", w - 70, 28);
          const cloudY = cloudLevel;
          for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc(w / 2 + (i - 3) * 26, cloudY + Math.sin(i * 1.4) * 8, 22, 0, Math.PI * 2);
            ctx.fillStyle = "#e0f2fe";
            ctx.fill();
          }
          for (let i = 0; i < drops; i++) {
            const x = w / 2 - 60 + i * 10;
            const y = cloudY + 40 + ((i * 7 + sim.tick) % 40);
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = "#60a5fa";
            ctx.fill();
          }
          for (let i = 0; i < 8; i++) {
            const x = w / 2 - 90 + i * 26;
            const y = seaY - 18 - ((i * 5 + sim.tick) % 34) * evap;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(96,165,250,0.7)";
            ctx.fill();
          }
          if (showArrows) {
            ctx.strokeStyle = "#1e40af";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(50, seaY - 60);
            ctx.lineTo(50, 60);
            ctx.moveTo(50, 60);
            ctx.lineTo(58, 70);
            ctx.moveTo(50, 60);
            ctx.lineTo(42, 70);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.fillStyle = "#1e40af";
          ctx.font = "bold 12px system-ui";
          ctx.fillText(`evaporation ${(evap * 100).toFixed(0)}% · ${drops} rain drops falling`, 30, 30);
          ctx.fillStyle = "#1d4ed8";
          ctx.font = "11px system-ui";
          ctx.fillText(heat >= 80 ? "hot day — fast cycle" : heat <= 20 ? "cool day — slow cycle" : "normal day", 30, 50);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Sun's heat" value={heat} min={0} max={100} step={1} hex={a} accent={at} unit="%" onChange={setHeat} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show arrows" checked={showArrows} onChange={setShowArrows} hex={a} />
        {[
          ["Cool day", 15],
          ["Normal", 50],
          ["Hot", 85],
        ].map(([l, v]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => setHeat(Number(v))} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Evaporation" value={`${(evap * 100).toFixed(0)}%`} accent={at} />
        <Stat label="Condensation" value="clouds form" accent={at} />
        <Stat label="Precipitation" value="rain & snow" accent={at} />
      </div>
    </SimShell>
  );
}

export function ActiveTransportSim({ topic }: { topic?: string }) {
  const a = "#f97316";
  const at = "text-orange-600 dark:text-orange-400";
  const [atp, setAtp] = useState(60);
  const [showAtp, setShowAtp] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const pumped = Math.round((atp / 100) * 16);
  const ionsPerSec = atp > 0 ? Math.round((atp / 100) * 8) : 0;
  const gradient = 1 + pumped * 0.2;
  const atpUsed = atp > 0 ? Math.round(pumped * 1) : 0;
  return (
    <SimShell
      icon="🚪"
      title={simTitle(topic, "Active transport")}
      accent="orange"
      subtitle={`${topic ?? "Active transport"} — carrier proteins use ATP to pump ions against the concentration gradient — from low to high. Each ion costs 1 ATP.`}
      hint="Plant root hairs pull nitrate in against the gradient; the kidney pumps glucose back into the blood. Without ATP, active transport stops and the gradient decays."
      controls={<SimChip accent="orange"><span aria-hidden>🚪</span>{topic ?? "active transport"}</SimChip>}
    >
      <SimCanvas
        deps={[atp, sim.tick, pumped, gradient, showAtp, ionsPerSec]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const midX = w / 2;
          ctx.fillStyle = "rgba(253,224,71,0.25)";
          ctx.fillRect(70, 30, midX - 100, h - 60);
          ctx.fillStyle = "rgba(251,146,60,0.25)";
          ctx.fillRect(midX + 30, 30, midX - 100, h - 60);
          ctx.fillStyle = "#78350f";
          ctx.font = "11px system-ui";
          ctx.fillText("LOW concentration", 90, 25);
          ctx.fillText("HIGH concentration", midX + 40, 25);
          ctx.fillStyle = "#64748b";
          ctx.fillRect(midX - 10, 40, 20, h - 70);
          const px = midX;
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = "#f97316";
            ctx.fillRect(px - 16, 50 + i * 52, 32, 22);
            ctx.strokeStyle = "#7c2d12";
            ctx.strokeRect(px - 16, 50 + i * 52, 32, 22);
          }
          for (let i = 0; i < pumped; i++) {
            const progress = ((sim.tick * 0.03 * speedMul + i * 0.37) % 1);
            const x = 90 + ((i * 137 + progress * (w - 300)) % (w - 160));
            const y = 40 + ((i * 61 + sim.tick * 0.6) % (h - 100));
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = "#f59e0b";
            ctx.fill();
          }
          if (showAtp && atp > 0) {
            for (let i = 0; i < 3; i++) {
              const ax = px + 30 + ((i * 53 + sim.tick) % 90);
              const ay = 56 + i * 52;
              ctx.fillStyle = "#facc15";
              ctx.font = "9px system-ui";
              ctx.fillText("ATP", ax, ay);
            }
          }
          ctx.fillStyle = "#9a3412";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(`pumped: ${pumped} ions · gradient ${gradient.toFixed(1)}× · ${ionsPerSec} ions/s`, 30, h - 10);
          ctx.fillStyle = "#7c2d12";
          ctx.font = "12px system-ui";
          ctx.fillText(atp === 0 ? "no ATP — transport stops!" : `energy ${atp}% — ions pushed uphill (1 ATP each)`, 30, h - 28);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="ATP available" value={atp} min={0} max={100} step={5} hex={a} accent={at} unit="%" onChange={setAtp} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="Show ATP" checked={showAtp} onChange={setShowAtp} hex={a} />
        {[
          ["Exhausted", 0],
          ["Half energy", 50],
          ["Fully fed", 100],
        ].map(([l, v]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => setAtp(Number(v))} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Ions pumped" value={`${pumped}`} accent={at} />
        <Stat label="Pump rate" value={`${ionsPerSec} /s`} accent={at} />
        <Stat label="Gradient" value={`${gradient.toFixed(1)}×`} accent={at} />
        <Stat label="ATP cost" value={`${atpUsed} ATP`} accent={at} />
      </div>
    </SimShell>
  );
}

export function VitaminsSim({ topic }: { topic?: string }) {
  const a = "#84cc16";
  const at = "text-lime-600 dark:text-lime-400";
  const [intake, setIntake] = useState(60);
  const [rdaLines, setRdaLines] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 60 * speedMul });
  const vitamins = [
    { name: "Vitamin A", rda: 900, def: "night blindness" },
    { name: "Vitamin C", rda: 90, def: "scurvy" },
    { name: "Vitamin D", rda: 15, def: "rickets / weak bones" },
    { name: "B12", rda: 2.4, def: "anaemia" },
  ];
  const status = intake >= 100 ? "meets RDA ✓" : `at ${intake}% of RDA`;
  return (
    <SimShell
      icon="🍎"
      title={simTitle(topic, "Vitamins & minerals")}
      accent="lime"
      subtitle={`${topic ?? "Vitamins"} — the body needs small amounts of vitamins; each deficiency causes a specific disease.`}
      hint="Fruit and vegetables supply vitamin C (prevents scurvy), milk and sunlight give vitamin D (prevents rickets), and liver gives B12."
      controls={<SimChip accent="lime"><span aria-hidden>🍎</span>{topic ?? "vitamins"}</SimChip>}
    >
      <SimCanvas
        deps={[intake, rdaLines, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const base = h - 40;
          const bw = 70;
          const startX = 80;
          const pct = intake / 100;
          vitamins.forEach((v, i) => {
            const x = startX + i * 120;
            const hh = Math.min(120, pct * 120);
            const shine = 0.85 + Math.abs(Math.sin(sim.tick * 0.1 + i)) * 0.15;
            ctx.fillStyle = `rgba(132,204,22,${0.7 * shine})`;
            ctx.fillRect(x, base - hh, bw, hh);
            ctx.strokeStyle = "#65a30d";
            ctx.strokeRect(x, base - hh, bw, hh);
            if (rdaLines) {
              ctx.strokeStyle = "#dc2626";
              ctx.setLineDash([4, 3]);
              ctx.beginPath();
              ctx.moveTo(x - 6, base - 120);
              ctx.lineTo(x + bw + 6, base - 120);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.fillStyle = "#dc2626";
              ctx.font = "9px system-ui";
              ctx.fillText("RDA", x + bw + 8, base - 116);
            }
            ctx.fillStyle = "#334155";
            ctx.font = "11px system-ui";
            ctx.fillText(v.name, x + 4, base + 18);
            ctx.fillStyle = intake < 100 ? "#b91c1c" : "#16a34a";
            ctx.font = "9px system-ui";
            ctx.fillText(intake < 100 ? `risk: ${v.def}` : "ok", x + 2, base + 32);
          });
          ctx.fillStyle = "#3f6212";
          ctx.font = "bold 13px system-ui";
          ctx.fillText(status, 30, 30);
        }}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Fruit & veg intake" value={intake} min={0} max={120} step={5} hex={a} accent={at} unit="%" onChange={setIntake} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
        <Toggle label="RDA lines" checked={rdaLines} onChange={setRdaLines} hex={a} />
        {[
          ["Junk food", 20],
          ["Balanced", 100],
          ["Athlete", 120],
        ].map(([l, v]) => (
          <ActionButton key={String(l)} label={String(l)} hex={a} onClick={() => setIntake(Number(v))} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Below RDA?" value={intake < 100 ? "deficiency risk" : "healthy ✓"} accent={at} />
        <Stat label="Vitamin C (scurvy)" value={intake < 30 ? "RISK" : "safe"} accent={at} />
      </div>
    </SimShell>
  );
}
