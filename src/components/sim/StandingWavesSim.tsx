"use client";

import { useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

export function StandingWavesSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "violet";
  const a = ACCENTS[accent];

  const [n, setN] = useState(2);
  const [L, setL] = useState(1.6);
  const [v, setV] = useState(4);
  const [amp, setAmp] = useState(0.9);
  const [showParts, setShowParts] = useState(true);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });

  const wavelength = (2 * L) / n;
  const freq = (n * v) / (2 * L);
  const omega = 2 * Math.PI * freq;
  const k = (n * Math.PI) / L;
  const t = sim.elapsed;
  const phase = omega * t;

  const y = (x: number) => amp * Math.sin(k * x) * Math.cos(phase);
  const yR = (x: number) => (amp / 2) * Math.sin(k * x - phase);
  const yL = (x: number) => (amp / 2) * Math.sin(k * x + phase);

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const x0 = 60;
    const x1 = w - 150;
    const mid = h / 2 + 8;
    const scale = 58;

    ctx.strokeStyle = "rgba(100,116,139,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, mid);
    ctx.lineTo(x1, mid);
    ctx.stroke();

    const px = (x: number) => x0 + (x / L) * (x1 - x0);

    ctx.fillStyle = "#7c3aed";
    ctx.fillRect(x0 - 3, mid - 16, 5, 32);
    ctx.fillRect(x1 - 2, mid - 16, 5, 32);

    if (showParts) {
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "rgba(236,72,153,0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= 160; i++) {
        const x = (i / 160) * L;
        const yy = mid - yR(x) * scale;
        if (i === 0) ctx.moveTo(px(x), yy);
        else ctx.lineTo(px(x), yy);
      }
      ctx.stroke();
      ctx.strokeStyle = "rgba(14,165,233,0.55)";
      ctx.beginPath();
      for (let i = 0; i <= 160; i++) {
        const x = (i / 160) * L;
        const yy = mid - yL(x) * scale;
        if (i === 0) ctx.moveTo(px(x), yy);
        else ctx.lineTo(px(x), yy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.shadowColor = a.hex;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = a.hex;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = (i / 200) * L;
      const yy = mid - y(x) * scale;
      if (i === 0) ctx.moveTo(px(x), yy);
      else ctx.lineTo(px(x), yy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    for (let m = 0; m <= n; m++) {
      const nx = px((m * L) / n);
      ctx.fillStyle = "#e879f9";
      ctx.beginPath();
      ctx.arc(nx, mid, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let m = 0; m < n; m++) {
      const ax = px(((m + 0.5) * L) / n);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = a.hex;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(ax, mid, 3.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
    }

    ctx.fillStyle = "#6d28d9";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("node", x0 + 8, mid + 18);
    ctx.fillText("antinode", (x0 + x1) / 2 - 22, mid - 12);

    const gx = x1 + 22;
    const gy = 34;
    const gw = w - gx - 18;
    const gh = h - gy - 40;
    ctx.strokeStyle = "rgba(100,116,139,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx + gw, gy + gh);
    ctx.lineTo(gx, gy + gh);
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx, gy);
    ctx.stroke();
    ctx.fillStyle = "#475569";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("harmonics", gx, gy + gh + 16);
    ctx.fillStyle = "#6d28d9";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("f", gx + gw + 8, gy + 10);

    for (let i = 1; i <= 6; i++) {
      const barH = (i / 6) * (gh - 8);
      const bx = gx + ((i - 1) * gw) / 6 + 3;
      const bw = gw / 6 - 6;
      const isSel = i === n;
      ctx.fillStyle = isSel ? a.hex : "rgba(139,92,246,0.45)";
      if (isSel) ctx.shadowColor = a.hex;
      if (isSel) ctx.shadowBlur = 8;
      ctx.fillRect(bx, gy + gh - barH, bw, barH);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#6d28d9";
      ctx.font = "9px sans-serif";
      ctx.fillText(`${i}`, bx + bw / 2 - 2, gy + gh + 12);
    }
  };

  const sub = topic
    ? `${topic} — one string, many standing waves.`
    : "A standing wave forms where two travelling waves meet: points that never move (nodes) and points that swing hardest (antinodes).";

  const hint =
    "The only wavelengths that survive on a fixed string are λ = 2L/n. The first mode (n = 1) is the fundamental; higher modes are harmonics with frequencies n times the fundamental.";

  return (
    <SimShell
      icon={<span>∿</span>}
      title={simTitle(topic, "Standing Waves & Harmonics")}
      subtitle={sub}
      accent={accent}
      hint={hint}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[sim.tick, speedMul, n, L, v, amp, showParts]} />

      <div className="mt-4">
        <RunControls
          running={sim.running}
          onToggle={sim.toggle}
          onReset={sim.reset}
          speed={speedMul}
          onSpeed={setSpeedMul}
          hex={a.hex}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Harmonic (n)" value={n} min={1} max={8} step={1} hex={a.hex} accent={a.text} onChange={setN} />
        <Slider label="String length (L)" value={L} min={0.8} max={3} step={0.05} hex={a.hex} accent={a.text} unit=" m" onChange={setL} />
        <Slider label="Wave speed (v)" value={v} min={1} max={10} step={0.1} hex={a.hex} accent={a.text} unit=" m/s" onChange={setV} />
        <Slider label="Amplitude" value={amp} min={0.2} max={1.6} step={0.05} hex={a.hex} accent={a.text} onChange={setAmp} />
        <div className="rounded-xl border border-foreground/15 bg-white/50 px-3 py-2 text-sm text-foreground/60 dark:bg-white/5">
          <Toggle
            label="Show the two travelling waves"
            checked={showParts}
            onChange={setShowParts}
            hex={a.hex}
            hint="Pink and blue waves travel through each other; they add up to the standing wave."
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Wavelength λ = 2L/n" value={`${wavelength.toFixed(3)} m`} accent={a.text} />
        <Stat label="Frequency f = nv/2L" value={`${freq.toFixed(2)} Hz`} accent={a.text} />
        <Stat label="Nodes" value={`${n + 1}`} accent={a.text} />
        <Stat label="Antinodes" value={`${n}`} accent={a.text} />
      </div>
    </SimShell>
  );
}
