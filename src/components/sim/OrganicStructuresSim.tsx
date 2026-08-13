"use client";

import { useState, useCallback } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { ActionButton, SimCanvas, Stat, useSim } from "./simkit";

const ACIDS = [
  { name: "Ethanoic acid", formula: "CH₃COOH", color: "#ef4444" },
  { name: "Methanoic acid", formula: "HCOOH", color: "#f97316" },
  { name: "Propanoic acid", formula: "CH₃CH₂COOH", color: "#dc2626" },
];
const ALCOHOLS = [
  { name: "Ethanol", formula: "C₂H₅OH", color: "#3b82f6" },
  { name: "Methanol", formula: "CH₃OH", color: "#6366f1" },
  { name: "Propanol", formula: "C₃H₇OH", color: "#2563eb" },
];

function esterName(a: number, al: number) {
  const acidNames = ["methanoate", "ethanoate", "propanoate"];
  const alcoholNames = ["methyl", "ethyl", "propyl"];
  return `${alcoholNames[al]} ${acidNames[a]}`;
}

export function OrganicStructuresSim({ topic }: { topic?: string }) {
  const at = "text-indigo-600 dark:text-indigo-400";

  const [acidIdx, setAcidIdx] = useState(0);
  const [alcoholIdx, setAlcoholIdx] = useState(1);
  const [showReaction, setShowReaction] = useState(false);
  const sim = useSim({ fps: 20, autoRun: true });

  const acid = ACIDS[acidIdx];
  const alcohol = ALCOHOLS[alcoholIdx];
  const esterN = esterName(acidIdx, alcoholIdx);
  const progress = showReaction ? Math.min(1, sim.elapsed * 0.6) : 0;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      ctx.clearRect(0, 0, w, h);

      const sectionW = w / 3;
      const midY = h / 2;

      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      const boxH = 110;
      const boxTop = midY - boxH / 2;
      ctx.beginPath();
      ctx.roundRect(sectionW * 0.15, boxTop, sectionW * 0.7, boxH, 10);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(sectionW * 1.15, boxTop, sectionW * 0.7, boxH, 10);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(sectionW * 2.15, boxTop, sectionW * 0.7, boxH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = acid.color;
      ctx.font = "bold 14px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(acid.formula, sectionW * 0.5, midY - 10);
      ctx.fillStyle = "#64748b";
      ctx.font = "12px system-ui";
      ctx.fillText(acid.name, sectionW * 0.5, midY + 12);

      ctx.fillStyle = alcohol.color;
      ctx.font = "bold 14px system-ui";
      ctx.fillText(alcohol.formula, sectionW * 1.5, midY - 10);
      ctx.fillStyle = "#64748b";
      ctx.font = "12px system-ui";
      ctx.fillText(alcohol.name, sectionW * 1.5, midY + 12);

      if (progress > 0) {
        ctx.fillStyle = `rgba(34,197,94,${0.15 + progress * 0.5})`;
        ctx.beginPath();
        ctx.roundRect(sectionW * 2.15, boxTop, sectionW * 0.7, boxH, 10);
        ctx.fill();
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(sectionW * 2.15, boxTop, sectionW * 0.7, boxH, 10);
        ctx.stroke();
        ctx.fillStyle = "#15803d";
        ctx.font = "bold 13px system-ui";
        ctx.fillText(esterN, sectionW * 2.5, midY - 10);
        ctx.fillStyle = "#166534";
        ctx.font = "11px system-ui";
        ctx.fillText("ester", sectionW * 2.5, midY + 8);
        ctx.fillText("+ H₂O", sectionW * 2.5, midY + 24);
      } else {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "13px system-ui";
        ctx.fillText("?", sectionW * 2.5, midY);
      }

      ctx.textAlign = "start";
      ctx.fillStyle = "#475569";
      ctx.font = "11px system-ui";
      ctx.fillText("Carboxylic acid", sectionW * 0.22, boxTop - 8);
      ctx.fillText("Alcohol", sectionW * 1.22, boxTop - 8);
      ctx.fillText("Ester product", sectionW * 2.22, boxTop - 8);

      if (progress > 0 && progress < 1) {
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sectionW + 10, midY - 30);
        ctx.lineTo(sectionW + 10 + 40 * progress, midY - 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sectionW + 10 + 40 * progress, midY - 35);
        ctx.lineTo(sectionW + 10 + 40 * progress + 8, midY - 30);
        ctx.lineTo(sectionW + 10 + 40 * progress, midY - 25);
        ctx.fill();
        ctx.fillStyle = "#15803d";
        ctx.font = "11px system-ui";
        ctx.fillText("H₂SO₄ catalyst", sectionW + 14, midY - 38);
      }

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${acid.name} + ${alcohol.name} → ${esterN} + H₂O`, w / 2, h - 18);
      ctx.textAlign = "start";
    },
    [acid, alcohol, esterN, progress]
  );

  return (
    <SimShell
      icon="🔬"
      title={simTitle(topic, "Organic Structures — Esterification")}
      accent="indigo"
      subtitle={`${topic ?? "Organic structures"} — A carboxylic acid reacts with an alcohol in the presence of an acid catalyst (H₂SO₄) to form an ester + water. Esterification is a condensation reaction.`}
      hint={`Esters have fruity smells and are used in flavourings and perfumes. The name comes from the alcohol part first, then the acid part: e.g. ethyl ethanoate from ethanol + ethanoic acid.`}
      controls={<SimChip accent="indigo"><span aria-hidden>🔬</span>{topic ?? "esterification"}</SimChip>}
    >
      <SimCanvas deps={[sim.tick, acidIdx, alcoholIdx, progress]} draw={draw} />

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <ActionButton label="Acid →" icon="🔴" hex="#ef4444" onClick={() => setAcidIdx((i) => (i + 1) % ACIDS.length)} title="Cycle through carboxylic acids" />
        <ActionButton label="Alcohol →" icon="🔵" hex="#3b82f6" onClick={() => setAlcoholIdx((i) => (i + 1) % ALCOHOLS.length)} title="Cycle through alcohols" />
        <ActionButton label="React!" icon="⚗️" hex="#22c55e" onClick={() => { setShowReaction(true); sim.reset(); sim.toggle(); }} title="Start esterification reaction" />
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        <Stat label="Acid" value={acid.formula} accent={at} />
        <Stat label="Alcohol" value={alcohol.formula} accent={at} />
        <Stat label="Ester formed" value={showReaction ? esterN : "—"} accent={at} />
        <Stat label="Reaction" value={progress >= 1 ? "Complete" : progress > 0 ? `${(progress * 100).toFixed(0)}%` : "Not started"} accent={at} />
      </div>
    </SimShell>
  );
}
