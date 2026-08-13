"use client";

import { useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { RunControls, SimCanvas, Stat, useSim } from "./simkit";

const GROUPS = ["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"] as const;

function groupAntigens(g: string) {
  return { A: g.includes("A"), B: g.includes("B"), Rh: g.endsWith("+") };
}

function groupAntibodies(g: string) {
  const ag = groupAntigens(g);
  return { antiA: !ag.A, antiB: !ag.B, antiRh: !ag.Rh };
}

function compatible(donor: string, recipient: string) {
  const d = groupAntigens(donor);
  const r = groupAntibodies(recipient);
  return !((d.A && r.antiA) || (d.B && r.antiB) || (d.Rh && r.antiRh));
}

function whichReaction(donor: string, recipient: string): string[] {
  const d = groupAntigens(donor);
  const r = groupAntibodies(recipient);
  const hits: string[] = [];
  if (d.A && r.antiA) hits.push("anti-A");
  if (d.B && r.antiB) hits.push("anti-B");
  if (d.Rh && r.antiRh) hits.push("anti-Rh");
  return hits;
}

const CELL_COLORS = ["#ef4444", "#f87171", "#dc2626", "#fca5a5", "#ef4444", "#b91c1c", "#f87171", "#dc2626", "#ef4444", "#f97316"];

export function BloodGroupsSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "rose";
  const a = ACCENTS[accent];

  const [donor, setDonor] = useState<string>("O−");
  const [recipient, setRecipient] = useState<string>("A+");
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });

  const ok = compatible(donor, recipient);
  const reactions = whichReaction(donor, recipient);
  const dAg = groupAntigens(donor);
  const rAb = groupAntibodies(recipient);

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = 320;
    const cy = 138;
    const rx = 272;
    const ry = 88;

    ctx.fillStyle = "rgba(190,24,93,0.06)";
    ctx.strokeStyle = "rgba(225,29,72,0.35)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(225,29,72,0.5)";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("mixing well — donor cells meet recipient plasma", cx - 110, cy - ry + 14);

    const t = sim.elapsed;
    const n = 10;
    for (let i = 0; i < n; i++) {
      const angle = (i * Math.PI * 2) / n + t * 0.4;
      const r = ok ? 74 + 24 * Math.sin(t * 1.4 + i * 1.7) : 9 + 4 * Math.sin(t * 3 + i);
      const x = cx + Math.cos(angle) * r * 1.05;
      const y = cy + Math.sin(angle) * r * 0.55;
      ctx.shadowColor = ok ? "rgba(244,63,94,0.35)" : "rgba(127,29,29,0.6)";
      ctx.shadowBlur = ok ? 4 : 10;
      ctx.fillStyle = CELL_COLORS[i];
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      const tags: string[] = [];
      if (dAg.A) tags.push("A");
      if (dAg.B) tags.push("B");
      if (dAg.Rh) tags.push("D");
      if (tags.length) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 7px sans-serif";
        ctx.fillText(tags.join(""), x - 4, y + 3);
      }
    }

    const abs = (Object.keys(rAb) as (keyof typeof rAb)[]).filter((k) => rAb[k]);
    const label = `plasma: ${abs.length ? abs.join("  +  ") : "no antibodies"}`;
    ctx.fillStyle = "#be185d";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(label, cx - 70, cy + ry + 20);

    if (!ok) {
      ctx.fillStyle = "#991b1b";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("✖ agglutination — cells clump together", cx - 120, cy - ry - 8);
    } else {
      ctx.fillStyle = "#065f46";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("✓ cells stay separate — transfusion safe", cx - 118, cy - ry - 8);
    }
  };

  const verdict = ok
    ? `Donor ${donor} can give to recipient ${recipient}. The donor's red cells carry ${
        dAg.A ? "A" : dAg.B ? "B" : dAg.Rh ? "Rh" : "no"
      } ${dAg.Rh ? "and Rh(D) " : ""}antigens and the recipient's plasma holds no antibody against them.`
    : `Transfusion ${donor} → ${recipient} is UNSAFE. The recipient's plasma contains ${reactions.join(
        " and ",
      )}, which will attack and clump the donor's cells.`;

  const hint =
    "O− has no antigens, so it can give to everyone (universal donor). AB+ has no antibodies, so it can receive from everyone (universal recipient).";

  return (
    <SimShell
      icon={<span>🩸</span>}
      title={simTitle(topic, "Blood Groups & Transfusion")}
      subtitle={`${donor} → ${recipient}: ${ok ? "compatible — safe" : "incompatible — agglutination"}`}
      accent={accent}
      hint={hint}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[sim.tick, speedMul, donor, recipient, ok]} />

      <div className="mt-4">
        <RunControls
          running={sim.running}
          onToggle={sim.toggle}
          onReset={sim.reset}
          speed={speedMul}
          onSpeed={setSpeedMul}
          hex={a.hex}
          label="Mix"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 text-sm font-medium text-foreground/70">Donor (red cells)</div>
          <div className="flex flex-wrap gap-1.5">
            {GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setDonor(g)}
                className={`rounded-lg border px-2.5 py-1.5 font-mono text-xs font-bold transition ${
                  donor === g
                    ? "border-transparent text-white"
                    : "border-white/40 bg-white/50 text-foreground/70 dark:border-white/10 dark:bg-white/5"
                }`}
                style={donor === g ? { backgroundColor: a.hex, boxShadow: `0 0 12px ${a.hex}66` } : undefined}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-sm font-medium text-foreground/70">Recipient (plasma)</div>
          <div className="flex flex-wrap gap-1.5">
            {GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setRecipient(g)}
                className={`rounded-lg border px-2.5 py-1.5 font-mono text-xs font-bold transition ${
                  recipient === g
                    ? "border-transparent text-white"
                    : "border-white/40 bg-white/50 text-foreground/70 dark:border-white/10 dark:bg-white/5"
                }`}
                style={recipient === g ? { backgroundColor: a.hex, boxShadow: `0 0 12px ${a.hex}66` } : undefined}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-1 text-center">
          <thead>
            <tr>
              <th className="w-16" />
              {GROUPS.map((g) => (
                <th key={g} className="font-mono text-[11px] font-bold text-foreground/70">
                  {g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((d) => (
              <tr key={d}>
                <td className="pr-1 text-left font-mono text-[11px] font-bold text-foreground/70">{d}</td>
                {GROUPS.map((rc) => {
                  const c = compatible(d, rc);
                  return (
                    <td key={rc}>
                      <button
                        type="button"
                        title={`${d} → ${rc}: ${c ? "compatible" : "incompatible"}`}
                        onClick={() => {
                          setDonor(d);
                          setRecipient(rc);
                        }}
                        className={`h-7 w-7 rounded-md border transition ${
                          c
                            ? "border-emerald-300/60 bg-emerald-500/25 hover:bg-emerald-500/45"
                            : "border-rose-300/60 bg-rose-500/25 hover:bg-rose-500/45"
                        } ${donor === d && recipient === rc ? "ring-2 ring-white/70" : ""}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 rounded-xl border border-foreground/15 bg-white/50 px-3 py-2 text-sm text-foreground/70 dark:bg-white/5">
        <span className={ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
          {ok ? "✓" : "✖"}
        </span>{" "}
        {verdict}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Donor antigens" value={`${dAg.A ? "A " : ""}${dAg.B ? "B " : ""}${dAg.Rh ? "Rh(D)" : "—"}`} accent={a.text} />
        <Stat label="Recipient antibodies" value={`${rAb.antiA ? "anti-A " : ""}${rAb.antiB ? "anti-B " : ""}${rAb.antiRh ? "anti-Rh" : ""}`} accent={a.text} />
        <Stat label="Universal donor" value="O−" accent={a.text} />
        <Stat label="Universal recipient" value="AB+" accent={a.text} />
      </div>
    </SimShell>
  );
}
