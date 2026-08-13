"use client";

import { useEffect, useRef, useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";

const EL_ACCENT: SimAccent = "emerald";
const MAG_ACCENT: SimAccent = "indigo";

type ElectroMode = "coulomb" | "charging" | "kinds" | "field" | "capacitor";

function electroMode(topic?: string): ElectroMode {
  const t = topic?.toLowerCase() ?? "";
  if (/rub|wool/.test(t)) return "charging";
  if (/two kinds|kinds/.test(t)) return "kinds";
  if (/field lines/.test(t)) return "field";
  if (/capacitor|capacit/.test(t)) return "capacitor";
  return "coulomb";
}

export function ElectrostaticsSim({ topic }: { topic?: string }) {
  const mode = electroMode(topic);
  if (mode === "charging") return <ChargingView topic={topic} />;
  if (mode === "kinds") return <KindsView topic={topic} />;
  if (mode === "field") return <FieldLinesView topic={topic} />;
  if (mode === "capacitor") return <CapacitorView topic={topic} />;
  return <CoulombView topic={topic} />;
}

function drawCharge(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, label: string, glow: number) {
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
  grad.addColorStop(0, "#fff7ed");
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = grad;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14 * glow;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y + 4);
  ctx.textAlign = "left";
}

function arrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string) {
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-11, -5);
  ctx.lineTo(-11, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const K = 8.99e9;

function CoulombView({ topic }: { topic?: string }) {
  const accent = EL_ACCENT;
  const a = ACCENTS[accent];
  const [q1, setQ1] = useState(4);
  const [q2, setQ2] = useState(2);
  const [dist, setDist] = useState(140);
  const [targetF, setTargetF] = useState(50);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });

  const rM = dist / 100;
  const F = (K * q1 * 1e-6 * q2 * 1e-6) / (rM * rM);
  const FmN = F * 1000;
  const qProd = Math.abs(q1 * q2);
  const rForTarget = Math.sqrt((K * qProd * 1e-12) / (targetF * 1e-3));
  const rForTargetCm = qProd === 0 ? 0 : rForTarget * 100;
  const pulse = sim.tick / 30;
  const zero = q1 === 0 || q2 === 0;
  const like = !zero && q1 * q2 > 0;

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const midY = h / 2;
    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "rgba(16,185,129,0.12)");
    bg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const x1 = w / 2 - dist / 2;
    const x2 = w / 2 + dist / 2;

    const mag = zero ? 0 : Math.min(26 + FmN * 1.1, 120);
    const color = zero ? "#94a3b8" : like ? "#f97316" : "#10b981";

    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const fx = x1 + (x2 - x1) * t;
      const wave = Math.sin(pulse * 3 + i * 1.2);
      const fy = midY + Math.sin(t * Math.PI * 2) * 26 + wave * 7;
      const alpha = 0.25 + ((Math.sin(pulse * 2 + i * 0.8) + 1) / 2) * 0.3;
      ctx.strokeStyle = zero ? `rgba(148,163,184,${alpha})` : like ? `rgba(249,115,22,${alpha})` : `rgba(16,185,129,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(fx, fy - 7);
      ctx.lineTo(fx, fy + 7);
      ctx.stroke();
      ctx.fillStyle = zero ? `rgba(148,163,184,${alpha + 0.15})` : like ? `rgba(249,115,22,${alpha + 0.15})` : `rgba(16,185,129,${alpha + 0.15})`;
      ctx.beginPath();
      ctx.arc(fx + Math.sin(pulse * 4 + i * 2) * 5, fy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.setLineDash([]);

    const glow = 1 + 0.18 * Math.sin(pulse * 2);
    if (!zero) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x1 + 28, midY);
      ctx.lineTo(x1 + 28 + (like ? 1 : -1) * mag, midY);
      ctx.stroke();
      arrowHead(ctx, x1 + 28 + (like ? 1 : -1) * mag, midY, like ? 0 : Math.PI, color);
      ctx.beginPath();
      ctx.moveTo(x2 - 28, midY);
      ctx.lineTo(x2 - 28 + (like ? -1 : 1) * mag, midY);
      ctx.stroke();
      arrowHead(ctx, x2 - 28 + (like ? -1 : 1) * mag, midY, like ? Math.PI : 0, color);
    }

    drawCharge(ctx, x1, midY, 26, "#f97316", `${q1 > 0 ? "+" : ""}${q1} μC`, glow);
    drawCharge(ctx, x2, midY, 26, q2 > 0 ? "#f97316" : "#8b5cf6", `${q2 > 0 ? "+" : ""}${q2} μC`, glow);

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(zero ? "NO FORCE — one charge is zero" : like ? "REPEL" : "ATTRACT", w / 2, 22);
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.font = "13px sans-serif";
    ctx.fillText(zero ? "F = k·q1·q2 / r² = 0" : `F = ${FmN.toFixed(0)} mN  (r = ${(dist / 100).toFixed(2)} m)`, w / 2, 40);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>⊕</span>}
      title={simTitle(topic, "Coulomb's law")}
      subtitle={
        topic
          ? `${topic} — like charges repel, unlike charges attract; force obeys an inverse-square law.`
          : "Like charges repel, unlike charges attract. Force depends on the product of charges and the inverse square of distance."
      }
      accent={accent}
      hint="F = k·q1·q2 / r² with k = 9 × 10⁹ N·m²/C². Halve the distance and the force quadruples. Sliders give q in μC and separation in cm."
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Both +" icon="+" onClick={() => { setQ1(4); setQ2(2); }} hex={q1 > 0 && q2 > 0 ? a.hex : "#94a3b8"} />
            <ActionButton label="Opposite" icon="±" onClick={() => { setQ1(4); setQ2(-2); }} hex={q1 > 0 && q2 < 0 ? a.hex : "#94a3b8"} />
            <ActionButton label="Both −" icon="−" onClick={() => { setQ1(-4); setQ2(-2); }} hex={q1 < 0 && q2 < 0 ? a.hex : "#94a3b8"} />
          </div>
        </>
      }
    >
      <SimCanvas draw={draw} deps={[sim.tick, q1, q2, dist, speedMul]} />
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a.hex} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Slider label="Charge q1" value={q1} min={-6} max={6} step={1} hex={a.hex} accent={a.text} unit=" μC" onChange={setQ1} />
        <Slider label="Charge q2" value={q2} min={-6} max={6} step={1} hex={a.hex} accent={a.text} unit=" μC" onChange={setQ2} />
        <Slider label="Separation r" value={dist} min={40} max={300} step={5} hex={a.hex} accent={a.text} unit=" cm" onChange={setDist} />
        <Slider label="Target force" value={targetF} min={10} max={200} step={10} hex={a.hex} accent={a.text} unit=" mN" onChange={setTargetF} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Coulomb's law" value="F = k·q1·q2 / r²" accent={a.text} />
        <Stat label="Force F" value={zero ? "0 N" : `${FmN.toFixed(0)} mN`} accent={a.text} />
        <Stat label="Constant k" value="9 × 10⁹ N·m²/C²" accent={a.text} />
        <Stat label="r for target F" value={qProd === 0 ? "—" : `${rForTargetCm.toFixed(0)} cm`} accent={a.text} />
      </div>
    </SimShell>
  );
}

function ChargingView({ topic }: { topic?: string }) {
  const accent = EL_ACCENT;
  const a = ACCENTS[accent];
  const sim = useSim({ fps: 40, autoRun: false });
  const progress = Math.min(sim.tick * 2, 100);
  const charged = progress >= 70;
  const balloonX = !charged ? 250 + Math.sin(sim.tick * 0.7) * 24 : 420;
  const t2 = charged ? Math.min((sim.tick - 35) / 25, 1) : 0;

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    ctx.fillStyle = "#a16207";
    ctx.beginPath();
    ctx.roundRect(70, 130, 90, 110, 10);
    ctx.fill();
    ctx.strokeStyle = "#713f12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(85, 150);
    ctx.lineTo(105, 158);
    ctx.moveTo(85, 158);
    ctx.lineTo(105, 166);
    ctx.moveTo(105, 166);
    ctx.lineTo(125, 174);
    ctx.stroke();
    ctx.fillStyle = "#713f12";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("wool", 115, 258);
    ctx.textAlign = "left";

    const balloonColor = charged ? "#dc2626" : "#f87171";
    ctx.fillStyle = balloonColor;
    ctx.beginPath();
    ctx.ellipse(balloonX, 120, 46, 58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(balloonX - 30, 75);
    ctx.lineTo(balloonX - 8, 60);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(charged ? "balloon (−)" : "balloon", balloonX, 205);
    ctx.textAlign = "left";

    if (charged) {
      ctx.fillStyle = "#dc2626";
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(120 + ((i * 37) % 200), 200 + ((i * 53) % 40), 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#b91c1c";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("wool now (+)", 140, 248);
      ctx.textAlign = "left";
    }

    for (let i = 0; i < 5; i++) {
      const baseX = 470 + i * 26;
      const baseY = 232;
      const x = baseX + (balloonX - baseX) * t2;
      const y = baseY + (128 - baseY) * t2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((t2 * 30 * (i % 2 ? -1 : 1) * Math.PI) / 180);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(0, 0, 10, 14);
      ctx.restore();
    }
    ctx.fillStyle = "#475569";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("paper bits", 500, 270);
    ctx.textAlign = "left";

    ctx.fillStyle = charged ? "#dc2626" : "#059669";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(charged ? "negative balloon attracts paper" : "rubbing transfers electrons…", 320, 30);
    ctx.textAlign = "left";

    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(250, 235, 220, 8);
    ctx.fillStyle = "#10b981";
    ctx.fillRect(250, 235, 220 * (progress / 100), 8);
  };

  return (
    <SimShell
      icon={<span>⊕</span>}
      title={simTitle(topic, "Charging by rubbing")}
      subtitle="Rub a balloon on wool and electrons are pulled off the wool onto the balloon — the balloon gains a negative charge and then attracts light paper."
      hint="Rubbing does not create charge, it transfers it. The wool loses electrons (becomes positive), the balloon gains them (becomes negative)."
      accent={accent}
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <ActionButton label={sim.running ? "Rubbing…" : charged ? "Charged" : "Rub balloon"} icon="↻" onClick={sim.toggle} hex={a.hex} disabled={charged} />
        </>
      }
    >
      <SimCanvas draw={draw} deps={[sim.tick, charged, progress]} />
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={() => { sim.reset(); }} hex={a.hex} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Charge transfer" value={charged ? "complete — wool +, balloon −" : `in progress ${progress}%`} accent={a.text} />
        <Stat label="Rule" value="rubbing transfers electrons" accent={a.text} />
      </div>
    </SimShell>
  );
}

type Sign = "+" | "-" | "0";

function KindsView({ topic }: { topic?: string }) {
  const accent = EL_ACCENT;
  const a = ACCENTS[accent];
  const [qA, setQA] = useState<Sign>("+");
  const [qB, setQB] = useState<Sign>("-");
  const sim = useSim({ fps: 20 });
  const both = qA !== "0" && qB !== "0";
  const like = both && qA === qB;
  const attract = both && qA !== qB;
  const angA = both ? (like ? 1 : -1) * 0.34 + Math.sin(sim.tick * 0.05) * 0.04 : 0;
  const angB = both ? (like ? -1 : 1) * 0.34 + Math.sin(sim.tick * 0.05 + 1) * 0.04 : 0;
  const ax = 280 + Math.sin(angA) * 118;
  const ay = 82 + Math.cos(angA) * 118;
  const bx = 360 + Math.sin(angB) * 118;
  const by = 82 + Math.cos(angB) * 118;

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(280, 40);
    ctx.lineTo(280, 90);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(360, 40);
    ctx.lineTo(360, 90);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(280, 90);
    ctx.lineTo(ax, ay);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(360, 90);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.fillStyle = qA === "+" ? "#f97316" : qA === "-" ? "#8b5cf6" : "#94a3b8";
    ctx.beginPath();
    ctx.arc(ax, ay, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(qA === "0" ? "0" : qA, ax, ay + 5);
    ctx.fillStyle = qB === "+" ? "#f97316" : qB === "-" ? "#8b5cf6" : "#94a3b8";
    ctx.beginPath();
    ctx.arc(bx, by, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(qB === "0" ? "0" : qB, bx, by + 5);
    ctx.fillStyle = like ? "#dc2626" : attract ? "#059669" : "#64748b";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(like ? "LIKE — REPEL" : attract ? "UNLIKE — ATTRACT" : "no charge — no force", 320, 240);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>⊕</span>}
      title={simTitle(topic, "Two kinds of charge")}
      subtitle="There are only two kinds of electric charge — positive and negative. Like charges repel, unlike charges attract."
      hint="Give each ball a charge. Two plusses (or two minuses) push each other apart; a plus and a minus pull together. No charge, no force."
      accent={accent}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[sim.tick, qA, qB]} />
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="mb-1 text-foreground/70">Ball A</div>
          <div className="flex gap-2">
            {(["+", "-", "0"] as Sign[]).map((s) => (
              <ActionButton key={`a${s}`} label={s} onClick={() => setQA(s)} hex={qA === s ? a.hex : "#94a3b8"} />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-foreground/70">Ball B</div>
          <div className="flex gap-2">
            {(["+", "-", "0"] as Sign[]).map((s) => (
              <ActionButton key={`b${s}`} label={s} onClick={() => setQB(s)} hex={qB === s ? a.hex : "#94a3b8"} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} hex={a.hex} />
      </div>
    </SimShell>
  );
}

function FieldLinesView({ topic }: { topic?: string }) {
  const accent = EL_ACCENT;
  const a = ACCENTS[accent];
  const [mag, setMag] = useState(3);
  const [sign, setSign] = useState<"attract" | "repel">("attract");

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    const p1 = { x: w / 2 - 90, y: h / 2 };
    const p2 = { x: w / 2 + 90, y: h / 2 };

    if (sign === "attract") {
      const count = 16;
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2;
        const r0 = 22;
        const sx = p1.x + Math.cos(ang) * r0;
        const sy = p1.y + Math.sin(ang) * r0;
        const tx = p2.x - Math.cos(ang) * r0;
        const ty = p2.y + Math.sin(ang) * r0 * 0.85;
        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2 + Math.sin(ang) * (34 + mag * 8);
        ctx.strokeStyle = "rgba(16,185,129,0.65)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(mx, my, tx, ty);
        ctx.stroke();
      }
    } else {
      for (const p of [p1, p2]) {
        const count = 12;
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * Math.PI * 2;
          const r0 = 24;
          const sx = p.x + Math.cos(ang) * r0;
          const sy = p.y + Math.sin(ang) * r0;
          const ex = p.x + Math.cos(ang) * (r0 + 60 + mag * 14);
          const ey = p.y + Math.sin(ang) * (r0 + 60 + mag * 14);
          ctx.strokeStyle = "rgba(249,115,22,0.6)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          arrowHead(ctx, ex, ey, ang, "#f97316");
        }
      }
    }

    drawCharge(ctx, p1.x, p1.y, 22, "#f97316", "+", 1);
    drawCharge(ctx, p2.x, p2.y, 22, sign === "attract" ? "#8b5cf6" : "#f97316", sign === "attract" ? "−" : "+", 1);

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(sign === "attract" ? "field lines bridge the gap" : "field lines push apart", w / 2, 22);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>⊕</span>}
      title={simTitle(topic, "Electric field lines")}
      subtitle="Field lines show the direction a small positive test charge would be pushed — leaving positive charges and entering negative ones."
      hint="Lines start on + and end on −, never cross, and pack closer where the field is stronger. Opposite charges: lines bridge the gap. Like charges: lines push apart."
      accent={accent}
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Opposite (+ −)" onClick={() => setSign("attract")} hex={sign === "attract" ? a.hex : "#94a3b8"} />
            <ActionButton label="Same (+ +)" onClick={() => setSign("repel")} hex={sign === "repel" ? a.hex : "#94a3b8"} />
          </div>
        </>
      }
    >
      <SimCanvas draw={draw} deps={[mag, sign]} />
      <div className="mt-4">
        <Slider label="Field strength" value={mag} min={1} max={5} step={1} hex={a.hex} accent={a.text} onChange={setMag} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Direction" value="+ → − (test charge)" accent={a.text} />
        <Stat label="Density" value="closer lines = stronger field" accent={a.text} />
      </div>
    </SimShell>
  );
}

function CapacitorView({ topic }: { topic?: string }) {
  const accent = EL_ACCENT;
  const a = ACCENTS[accent];
  const [area, setArea] = useState(4);
  const [gap, setGap] = useState(3);
  const [v, setV] = useState(6);
  const C = area / gap;
  const Q = C * v;
  const plateH = 50 + area * 26;
  const plateX2 = 250 + gap * 26;
  const dots = Math.min(Math.round(Q), 22);

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    const cy = 140;
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.roundRect(70, cy - plateH / 2, 12, plateH, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(plateX2, cy - plateH / 2, 12, plateH, 4);
    ctx.fill();
    ctx.fillStyle = "#dc2626";
    for (let i = 0; i < dots; i++) {
      ctx.beginPath();
      ctx.arc(120 + ((i * 41) % 90), cy - plateH / 2 + 12 + ((i * 53) % Math.max(plateH - 24, 10)), 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#0ea5e9";
    for (let i = 0; i < Math.max(dots, 4); i++) {
      ctx.beginPath();
      ctx.arc(plateX2 + 18 + ((i * 37) % 90), cy - plateH / 2 + 12 + ((i * 47) % Math.max(plateH - 24, 10)), 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#475569";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("− charge", 76, cy - plateH / 2 - 12);
    ctx.fillText("+ charge", plateX2 + 6, cy - plateH / 2 - 12);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(90, 225);
    ctx.lineTo(170, 225);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(170, 225);
    ctx.lineTo(170, 205);
    ctx.stroke();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(170, 205);
    ctx.lineTo(170, 185);
    ctx.moveTo(170, 185);
    ctx.lineTo(250, 185);
    ctx.stroke();
    ctx.fillStyle = "#0c4a6e";
    ctx.font = "11px sans-serif";
    ctx.fillText(`${v} V battery`, 250, 215);
    ctx.fillStyle = a.hex;
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("C = ε₀A/d", 320, 40);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>⊕</span>}
      title={simTitle(topic, "The capacitor")}
      subtitle="Two plates facing each other store charge. Bigger plates or a smaller gap mean more capacitance — and more stored charge at the same voltage."
      hint="C = ε₀·A/d, and Q = C·V. Slide the plates together (smaller d) and watch the stored charge climb without touching the battery."
      accent={accent}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[area, gap, v]} />
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label="Plate area" value={area} min={1} max={6} step={1} hex={a.hex} accent={a.text} onChange={setArea} />
        <Slider label="Plate gap" value={gap} min={1} max={6} step={1} hex={a.hex} accent={a.text} onChange={setGap} />
        <Slider label="Voltage" value={v} min={1} max={12} step={1} hex={a.hex} accent={a.text} unit=" V" onChange={setV} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Capacitance" value={`C = ${C.toFixed(2)} uF`} accent={a.text} />
        <Stat label="Stored charge" value={`Q = CV = ${Q.toFixed(1)} μC`} accent={a.text} />
      </div>
    </SimShell>
  );
}

type MagnetMode = "field" | "wire" | "solenoid" | "motor" | "induction";

function magnetMode(topic?: string): MagnetMode {
  const t = topic?.toLowerCase() ?? "";
  if (/around a wire/.test(t)) return "wire";
  if (/solenoid/.test(t)) return "solenoid";
  if (/motor/.test(t)) return "motor";
  if (/induction/.test(t)) return "induction";
  return "field";
}

export function ElectromagnetismSim({ topic }: { topic?: string }) {
  const mode = magnetMode(topic);
  if (mode === "wire") return <WireFieldView topic={topic} />;
  if (mode === "solenoid") return <SolenoidView topic={topic} />;
  if (mode === "motor") return <MotorView topic={topic} />;
  if (mode === "induction") return <InductionView topic={topic} />;
  return <MagnetFieldView topic={topic} />;
}

function MagnetFieldView({ topic }: { topic?: string }) {
  const accent = MAG_ACCENT;
  const a = ACCENTS[accent];
  const [strength, setStrength] = useState(3);
  const sim = useSim({ fps: 15 });
  const lines = 8;

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    for (let i = 0; i < lines; i++) {
      const p = i / (lines - 1);
      const bend = 70 + p * 30;
      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 2;
      ctx.setLineDash(strength > 2 ? [] : [6, 4]);
      ctx.globalAlpha = 0.55 + strength * 0.07;
      ctx.beginPath();
      ctx.moveTo(320, 70);
      ctx.quadraticCurveTo(320 - bend + (p - 0.5) * 120, 90 + p * 60, 320 + (p - 0.5) * 160, 240);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.roundRect(260, 105, 70, 90, 10);
    ctx.fill();
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(330, 105, 70, 90, 10);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", 295, 160);
    ctx.fillText("S", 365, 160);
    ctx.textAlign = "left";
    ctx.fillStyle = "#4f46e5";
    ctx.font = "12px sans-serif";
    ctx.fillText("field lines: N → S outside, S → N inside", 320, 244);
  };

  return (
    <SimShell
      icon={<span>◍</span>}
      title={simTitle(topic, "Magnetic field and field lines")}
      subtitle="Iron filings sprinkle into curved lines that leave the north pole and sweep around to the south pole."
      hint="The filings are tiny compasses: each aligns along the field direction. Field lines run from N to S outside the magnet and never cross."
      accent={accent}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[strength, sim.tick]} />
      <div className="mt-4">
        <Slider label="Magnet strength" value={strength} min={1} max={5} step={1} hex={a.hex} accent={a.text} onChange={setStrength} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Outside magnet" value="field lines N → S" accent={a.text} />
        <Stat label="Inside" value="field lines S → N" accent={a.text} />
      </div>
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} hex={a.hex} />
      </div>
    </SimShell>
  );
}

function WireFieldView({ topic }: { topic?: string }) {
  const accent = MAG_ACCENT;
  const a = ACCENTS[accent];
  const [current, setCurrent] = useState(5);
  const [dir, setDir] = useState(1);
  const sim = useSim({ fps: 20 });

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    const cx = 320;
    const cy = 125;
    for (let ri = 0; ri < 3; ri++) {
      const r = 56 + ri * 36;
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.35 + ri * 0.12;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const r = 100;
      const wobble = Math.sin(sim.tick * 0.1 + i) * 0.06;
      const needleAng = ang + (Math.PI / 2) * dir + wobble;
      const sx = cx + Math.cos(ang) * r;
      const sy = cy + Math.sin(ang) * r;
      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#c7d2fe";
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(needleAng) * 14, sy + Math.sin(needleAng) * 14);
      ctx.stroke();
      const tx = sx + Math.cos(needleAng) * 14;
      const ty = sy + Math.sin(needleAng) * 14;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - Math.cos(needleAng) * 7 - Math.sin(needleAng) * 4, ty - Math.sin(needleAng) * 7 + Math.cos(needleAng) * 4);
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - Math.cos(needleAng) * 7 + Math.sin(needleAng) * 4, ty - Math.sin(needleAng) * 7 - Math.cos(needleAng) * 4);
      ctx.stroke();
    }
    ctx.fillStyle = "#6366f1";
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(dir > 0 ? "⊙" : "⊗", cx, cy + 6);
    ctx.textAlign = "left";
    ctx.fillStyle = "#4f46e5";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`wire: current ${dir > 0 ? "out of page" : "into page"} (${current} A)`, 320, 30);
    ctx.fillText("compass needles circle the wire", 320, 242);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◍</span>}
      title={simTitle(topic, "Magnetic field around a wire")}
      subtitle="A current-carrying wire creates circular magnetic field lines around it — the compass needles circle the wire."
      hint="Right-hand rule: thumb in the current direction, fingers curl the way the field circles. With current out of the page the field runs anticlockwise."
      accent={accent}
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <ActionButton label={dir > 0 ? "Flip current ↑" : "Flip current ↓"} icon="⇅" onClick={() => setDir((d) => -d)} hex={a.hex} />
        </>
      }
    >
      <SimCanvas draw={draw} deps={[sim.tick, current, dir]} />
      <div className="mt-4">
        <Slider label="Current" value={current} min={1} max={10} step={1} hex={a.hex} accent={a.text} unit=" A" onChange={setCurrent} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Field shape" value="concentric circles" accent={a.text} />
        <Stat label="Right-hand rule" value="thumb → current" accent={a.text} />
      </div>
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} hex={a.hex} />
      </div>
    </SimShell>
  );
}

const MU0 = 4 * Math.PI * 1e-7;

function SolenoidView({ topic }: { topic?: string }) {
  const accent = MAG_ACCENT;
  const a = ACCENTS[accent];
  const [current, setCurrent] = useState(4);
  const [turns, setTurns] = useState(5);
  const [dir, setDir] = useState(1);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });

  const L = 0.1;
  const n = turns / L;
  const B = MU0 * n * current;
  const BmT = B * 1000;
  const fieldLines = Math.max(4, Math.min(4 + Math.round(BmT * 6), 12));

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "rgba(99,102,241,0.14)");
    bg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const r = 70;
    const pulse = sim.elapsed * 3;

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 4;
    for (let i = 0; i < turns; i++) {
      const off = (i - (turns - 1) / 2) * 14;
      ctx.beginPath();
      ctx.ellipse(cx, cy + off, r, r * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let i = 0; i < fieldLines; i++) {
      const t = i / fieldLines;
      const ang = t * Math.PI * 2 + pulse * 0.2;
      const fx = cx + Math.cos(ang) * (r * 2.1 + 26);
      const fy = cy + Math.sin(ang) * (r * 2.1 + 26);
      const strength = Math.min(16 + BmT * 46, 56);
      const dx = (cx - fx) * dir;
      const dy = (cy - fy) * dir;
      const d = Math.max(Math.hypot(dx, dy), 1);
      const ex = fx + (dx / d) * strength;
      const ey = fy + (dy / d) * strength;
      ctx.strokeStyle = "rgba(99,102,241,0.85)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      arrowHead(ctx, ex, ey, Math.atan2(dy, dx), "#6366f1");
      ctx.fillStyle = "rgba(99,102,241,0.5)";
      ctx.beginPath();
      ctx.arc(fx + (dx / d) * (d * 0.4), fy + (dy / d) * (d * 0.4), 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const coreGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r * 1.5);
    coreGrad.addColorStop(0, "rgba(99,102,241,0.28)");
    coreGrad.addColorStop(1, "rgba(99,102,241,0)");
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(99,102,241,0.12)";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`B = μ₀·n·I = ${BmT.toFixed(2)} mT`, w / 2, 22);
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillText(`n = ${n.toFixed(0)} turns/m · μ₀ = 4π×10⁻⁷`, w / 2, 42);
    ctx.fillStyle = "rgba(99,102,241,0.8)";
    ctx.fillText(`field lines: ${fieldLines} (density scales with B)`, w / 2, 58);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◍</span>}
      title={simTitle(topic, "Electromagnetism — solenoid")}
      subtitle={
        topic
          ? `${topic} — a current in a coil makes a magnet; more turns or more current means more field.`
          : "A current in a coil creates a magnetic field. More turns or more current → stronger magnet. And it flips when the current reverses."
      }
      accent={accent}
      hint="B = μ₀·n·I: the field is set by the current, the number of turns per metre, and the vacuum permeability. Flip the current and the poles swap."
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <ActionButton label={dir > 0 ? "Flip current ↓" : "Flip current ↑"} icon="⇅" onClick={() => setDir((d) => -d)} hex={a.hex} />
        </>
      }
    >
      <SimCanvas draw={draw} deps={[sim.tick, current, turns, dir, speedMul]} />
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a.hex} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Current (I)" value={current} min={1} max={10} step={1} hex={a.hex} accent={a.text} unit=" A" onChange={setCurrent} />
        <Slider label="Turns (n)" value={turns} min={1} max={9} step={1} hex={a.hex} accent={a.text} onChange={setTurns} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="B (μ₀·n·I)" value={`${BmT.toFixed(2)} mT`} accent={a.text} />
        <Stat label="Turns per metre" value={`n = ${n.toFixed(0)}`} accent={a.text} />
        <Stat label="Right-hand rule" value="thumb → current, fingers → field" accent={a.text} />
        <Stat label="Polarity" value={dir > 0 ? "N top · S bottom" : "S top · N bottom"} accent={a.text} />
      </div>
    </SimShell>
  );
}

function MotorView({ topic }: { topic?: string }) {
  const accent = MAG_ACCENT;
  const a = ACCENTS[accent];
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 20 * speedMul });
  const angle = (sim.tick * 3 * speedMul) % 360;

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    const rad = (angle * Math.PI) / 180;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.roundRect(60, 50, 46, 170, 8);
    ctx.fill();
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(534, 50, 46, 170, 8);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", 83, 150);
    ctx.fillText("S", 557, 150);
    ctx.textAlign = "left";
    ctx.save();
    ctx.translate(320, 150);
    ctx.rotate(rad);
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 4;
    ctx.strokeRect(-30, -30, 60, 60);
    ctx.strokeStyle = "#0ea5e9";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-30, -30);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(30, 30);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(320, 150);
    ctx.lineTo(320, 230);
    ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.roundRect(306, 230, 28, 14, 3);
    ctx.fill();
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(306, 244, 10, 12);
    ctx.fillRect(324, 244, 10, 12);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(316, 256);
    ctx.lineTo(280, 266);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(324, 256);
    ctx.lineTo(360, 266);
    ctx.stroke();
    ctx.fillStyle = sim.running ? "#4f46e5" : "#94a3b8";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(sim.running ? "coil spinning" : "motor stopped", 320, 32);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◍</span>}
      title={simTitle(topic, "The DC motor")}
      subtitle="A current-carrying coil inside a magnetic field feels a turning force — the coil spins between the poles, and the motor turns."
      hint="The split-ring commutator swaps the current every half turn so the force always pushes the coil around the same way."
      accent={accent}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[sim.tick, speedMul]} />
      <div className="mt-4">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a.hex} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Force" value="coil feels a turning force" accent={a.text} />
        <Stat label="Commutator" value="swaps current each half turn" accent={a.text} />
      </div>
    </SimShell>
  );
}

type MoveMode = "in" | "out" | "stop";

function InductionView({ topic }: { topic?: string }) {
  const accent = MAG_ACCENT;
  const a = ACCENTS[accent];
  const [move, setMove] = useState<MoveMode>("stop");
  const [speed, setSpeed] = useState(3);
  const [running, setRunning] = useState(false);
  const [pos, setPos] = useState(20);
  const posRef = useRef(20);

  useEffect(() => {
    if (!running || move === "stop") return;
    const id = window.setInterval(() => {
      posRef.current = Math.max(0, Math.min(100, posRef.current + (move === "in" ? speed : -speed) * 0.5));
      setPos(posRef.current);
      if (posRef.current >= 100 || posRef.current <= 0) setMove("stop");
    }, 33);
    return () => window.clearInterval(id);
  }, [running, move, speed]);

  const defl = (move === "stop" ? 0 : move === "in" ? 0.6 : -0.6) * Math.min(speed, 4);

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 640, 250);
    const mx = 40 + (pos / 100) * 180;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.roundRect(mx, 90, 110, 60, 8);
    ctx.fill();
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(mx + 110, 90, 90, 60, 8);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", mx + 55, 128);
    ctx.fillText("S", mx + 155, 128);
    ctx.textAlign = "left";
    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(430, 90 + (i - 2.5) * 14, 70, 26, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#4f46e5";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("coil", 430, 195);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(500, 120);
    ctx.lineTo(560, 120);
    ctx.stroke();
    ctx.fillStyle = "#e0e7ff";
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(585, 120, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(585, 120);
    ctx.lineTo(585 - Math.sin(defl * 1.4) * 26, 120 - Math.cos(defl * 1.4) * 26);
    ctx.stroke();
    ctx.fillStyle = "#4f46e5";
    ctx.beginPath();
    ctx.arc(585, 120, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4f46e5";
    ctx.font = "11px sans-serif";
    ctx.fillText("galvanometer", 585, 178);
    ctx.fillStyle = move === "stop" ? "#64748b" : "#4f46e5";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(move === "stop" ? "no motion, no induced current" : `moving magnet ${move} → current induced`, 320, 244);
    ctx.textAlign = "left";
  };

  return (
    <SimShell
      icon={<span>◍</span>}
      title={simTitle(topic, "Electromagnetic induction")}
      subtitle="Push a magnet into a coil and the changing field induces a current — the galvanometer needle jumps. Stop moving it and the current stops."
      hint="Faraday's law: it is the change in flux that induces EMF. Faster motion → bigger needle deflection; reversing direction reverses the current."
      accent={accent}
      controls={
        <>
          {topic && <SimChip accent={accent}>{topic}</SimChip>}
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Push in" icon="→" onClick={() => setMove("in")} hex={move === "in" ? a.hex : "#94a3b8"} />
            <ActionButton label="Pull out" icon="←" onClick={() => setMove("out")} hex={move === "out" ? a.hex : "#94a3b8"} />
            <ActionButton label="Stop" icon="■" onClick={() => setMove("stop")} hex={move === "stop" ? a.hex : "#94a3b8"} />
          </div>
        </>
      }
    >
      <SimCanvas draw={draw} deps={[pos, move, speed]} />
      <div className="mt-4">
        <RunControls
          running={running}
          onToggle={() => setRunning((r) => !r)}
          onReset={() => {
            posRef.current = 20;
            setPos(20);
            setRunning(true);
          }}
          hex={a.hex}
        />
      </div>
      <div className="mt-4">
        <Slider label="Speed of magnet" value={speed} min={1} max={5} step={1} hex={a.hex} accent={a.text} unit=" ×" onChange={setSpeed} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Needle" value={move === "stop" ? "at zero" : `deflected ${defl > 0 ? "right" : "left"}`} accent={a.text} />
        <Stat label="Rule" value="motion creates electricity" accent={a.text} />
      </div>
    </SimShell>
  );
}
