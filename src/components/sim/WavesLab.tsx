"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";
import { ResonanceSim } from "./PhysicsLabs2";

type WaveMode = "transverse" | "speed" | "params" | "resonance" | "ripples" | "diffract";

function wavesMode(topic?: string): WaveMode {
  const t = topic?.toLowerCase() ?? "";
  if (/speed/.test(t)) return "speed";
  if (/amplitude/.test(t)) return "params";
  if (/resonance/.test(t)) return "resonance";
  if (/ripple/.test(t)) return "ripples";
  if (/diffract|interfer/.test(t)) return "diffract";
  return "transverse";
}

export function WavesSim({ topic }: { topic?: string }) {
  const mode = wavesMode(topic);
  if (mode === "speed") return <WaveSpeedView topic={topic} />;
  if (mode === "params") return <WaveParamsView topic={topic} />;
  if (mode === "resonance") return <ResonanceSim topic={topic} />;
  if (mode === "ripples") return <RipplesView topic={topic} />;
  if (mode === "diffract") return <DiffractionView topic={topic} />;
  return <TransverseView topic={topic} />;
}

const A = "#06b6d4";
const AT = "text-cyan-600 dark:text-cyan-400";
const FA = "#d946ef";
const FAT = "text-fuchsia-600 dark:text-fuchsia-400";

type TransverseViewMode = "wave1" | "wave2" | "super";

function TransverseView({ topic }: { topic?: string }) {
  const [amp, setAmp] = useState(30);
  const [freq, setFreq] = useState(1.2);
  const [wavelength, setWavelength] = useState(90);
  const [phase, setPhase] = useState(0);
  const [view, setView] = useState<TransverseViewMode>("super");
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const t = sim.tick / 30;
  const waveSpeed = freq * wavelength;
  const T = 1 / freq;
  const phaseRad = (phase * Math.PI) / 180;
  const k = (2 * Math.PI) / wavelength;
  const omega = 2 * Math.PI * freq;
  const interference =
    Math.abs(phase % 360) < 8 || Math.abs(phase % 360) > 352
      ? "constructive — crest + crest, double height"
      : Math.abs((phase + 180) % 360) < 8
        ? "destructive — crest + trough, cancel out"
        : "partial — in between the extremes";

  return (
    <SimShell
      icon="〰️"
      title={simTitle(topic, "Transverse wave")}
      accent="cyan"
      subtitle={topic ? `${topic} — a wave carries energy, not matter; amplitude, wavelength and frequency set its rhythm.` : "Two waves with the same speed but a phase offset superpose — where they match they build, where they clash they cancel."}
      hint="v = f·λ. The waves share speed and wavelength; their phase offset decides constructive interference (ΔL = nλ) or destructive (ΔL = (n+½)λ)."
      controls={
        <>
          {topic && <SimChip accent="cyan">{topic}</SimChip>}
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Wave 1" onClick={() => setView("wave1")} hex={view === "wave1" ? A : "#94a3b8"} />
            <ActionButton label="Wave 2" onClick={() => setView("wave2")} hex={view === "wave2" ? FA : "#94a3b8"} />
            <ActionButton label="Sum (interference)" onClick={() => setView("super")} hex={view === "super" ? "#f59e0b" : "#94a3b8"} />
          </div>
        </>
      }
    >
      <SimCanvas
        deps={[amp, freq, wavelength, phase, view, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          const midY = h / 2;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, midY);
          ctx.lineTo(w, midY);
          ctx.stroke();
          const y1 = (x: number) => midY + amp * Math.sin(k * x - omega * t);
          const y2 = (x: number) => midY + amp * Math.sin(k * x - omega * t + phaseRad);
          const trace = (color: string, yf: (x: number) => number, width: number, alpha = 1) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.globalAlpha = alpha;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            for (let x = 0; x <= w; x += 2) {
              const y = yf(x);
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          };
          if (view === "wave1") {
            const grad = ctx.createLinearGradient(0, midY - amp, 0, midY + amp);
            grad.addColorStop(0, "#22d3ee");
            grad.addColorStop(0.5, "#0ea5e9");
            grad.addColorStop(1, "#22d3ee");
            ctx.fillStyle = grad;
            ctx.globalAlpha = 0.18;
            ctx.beginPath();
            for (let x = 0; x <= w; x += 2) {
              const y = y1(x);
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.lineTo(w, midY);
            ctx.lineTo(0, midY);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
            trace("#22d3ee", y1, 4);
            ctx.fillStyle = "rgba(6,182,212,0.8)";
            ctx.font = "11px system-ui";
            ctx.fillText("wave 1", 12, midY - amp - 10);
          } else if (view === "wave2") {
            trace("#d946ef", y2, 4);
            ctx.fillStyle = "rgba(217,70,239,0.8)";
            ctx.font = "11px system-ui";
            ctx.fillText(`wave 2 — phase ${phase}°`, 12, midY - amp - 10);
          } else {
            trace("#22d3ee", y1, 2, 0.7);
            trace("#d946ef", y2, 2, 0.7);
            const grad = ctx.createLinearGradient(0, midY - 2 * amp, 0, midY + 2 * amp);
            grad.addColorStop(0, "#fbbf24");
            grad.addColorStop(0.5, "#f59e0b");
            grad.addColorStop(1, "#fbbf24");
            ctx.fillStyle = grad;
            ctx.globalAlpha = 0.14;
            ctx.beginPath();
            for (let x = 0; x <= w; x += 2) {
              const y = midY + amp * (Math.sin(k * x - omega * t) + Math.sin(k * x - omega * t + phaseRad));
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.lineTo(w, midY);
            ctx.lineTo(0, midY);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
            trace("#f59e0b", (x) => midY + amp * (Math.sin(k * x - omega * t) + Math.sin(k * x - omega * t + phaseRad)), 3.5);
            ctx.fillStyle = "rgba(245,158,11,0.9)";
            ctx.font = "bold 11px system-ui";
            ctx.fillText("wave 1 + wave 2", 12, 22);
          }
          ctx.strokeStyle = "rgba(6,182,212,0.4)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(0, midY - amp);
          ctx.lineTo(w, midY - amp);
          ctx.moveTo(0, midY + amp);
          ctx.lineTo(w, midY + amp);
          ctx.stroke();
          ctx.setLineDash([]);
          const midCrestX = 120 + (wavelength / 4) % wavelength;
          ctx.strokeStyle = "rgba(6,182,212,0.6)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 3]);
          ctx.beginPath();
          ctx.moveTo(midCrestX, midY + 8);
          ctx.lineTo(midCrestX, midY - 14);
          ctx.moveTo(midCrestX + wavelength, midY + 8);
          ctx.lineTo(midCrestX + wavelength, midY - 14);
          ctx.moveTo(midCrestX, midY - 14);
          ctx.lineTo(midCrestX + wavelength, midY - 14);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(6,182,212,0.8)";
          ctx.font = "11px system-ui";
          ctx.fillText("λ = " + wavelength.toFixed(0) + " u", midCrestX + 6, midY - 20);
        }}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Slider label="Amplitude" value={amp} min={5} max={55} step={1} hex={A} accent={AT} unit=" px" onChange={setAmp} />
        <Slider label="Frequency" value={freq} min={0.3} max={4} step={0.1} hex={A} accent={AT} unit=" Hz" onChange={setFreq} />
        <Slider label="Wavelength" value={wavelength} min={40} max={200} step={5} hex={A} accent={AT} unit=" px" onChange={setWavelength} />
        <Slider label="Phase offset" value={phase} min={0} max={360} step={5} hex={FA} accent={FAT} unit="°" onChange={setPhase} />
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={A} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Wave speed" value={`v = fλ = ${waveSpeed.toFixed(0)} u/s`} accent={AT} />
        <Stat label="Wavelength" value={`λ = v/f = ${wavelength.toFixed(0)} u`} accent={AT} />
        <Stat label="Period" value={`T = 1/f = ${T.toFixed(2)} s`} accent={AT} />
        <Stat label="Interference" value={interference} accent="text-amber-500" />
      </div>
    </SimShell>
  );
}

function WaveSpeedView({ topic }: { topic?: string }) {
  const [freq, setFreq] = useState(1.2);
  const [wavelength, setWavelength] = useState(90);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const t = sim.tick / 30;
  const v = freq * wavelength;

  return (
    <SimShell
      icon="📏"
      title={simTitle(topic, "Wave speed")}
      accent="cyan"
      subtitle="Measure one wavelength on the ruler and time the rhythm: v = f·λ. A crest travels one wavelength each period."
      hint="Speed = frequency × wavelength. Doubling f with λ fixed doubles the speed; doubling λ at fixed f does the same."
      controls={topic ? <SimChip accent="cyan">{topic}</SimChip> : undefined}
    >
      <SimCanvas
        deps={[freq, wavelength, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          const midY = 105;
          const amp = 34;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, midY);
          ctx.lineTo(w, midY);
          ctx.stroke();
          const leftPeak = 90;
          const rightPeak = leftPeak + wavelength;
          ctx.strokeStyle = "rgba(6,182,212,0.6)";
          ctx.setLineDash([5, 3]);
          ctx.beginPath();
          ctx.moveTo(leftPeak, midY + 8);
          ctx.lineTo(leftPeak, midY - amp - 10);
          ctx.moveTo(rightPeak, midY + 8);
          ctx.lineTo(rightPeak, midY - amp - 10);
          ctx.moveTo(leftPeak, midY - amp - 10);
          ctx.lineTo(rightPeak, midY - amp - 10);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(6,182,212,0.8)";
          ctx.font = "12px system-ui";
          ctx.fillText(`λ = ${wavelength} u`, leftPeak + 8, midY - amp - 14);
          const grad = ctx.createLinearGradient(0, midY - amp, 0, midY + amp);
          grad.addColorStop(0, "#22d3ee");
          grad.addColorStop(0.5, "#0ea5e9");
          grad.addColorStop(1, "#22d3ee");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3.5;
          ctx.shadowColor = "rgba(34,211,238,0.5)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 2) {
            const y = midY + amp * Math.sin((2 * Math.PI * x) / wavelength - 2 * Math.PI * freq * t);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "rgba(14,116,144,0.5)";
          ctx.lineWidth = 1;
          for (let i = 0; i <= 12; i++) {
            const x = 20 + i * 50;
            ctx.beginPath();
            ctx.moveTo(x, h - 30);
            ctx.lineTo(x, h - 22);
            ctx.stroke();
            if (i % 2 === 0) {
              ctx.fillStyle = "rgba(14,116,144,0.7)";
              ctx.font = "10px system-ui";
              ctx.fillText(String(i * 50), x - 8, h - 12);
            }
          }
          ctx.fillStyle = "rgba(14,116,144,0.7)";
          ctx.font = "11px system-ui";
          ctx.fillText("ruler (u)", 8, h - 12);
          ctx.strokeStyle = "#0ea5e9";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(80, h - 34);
          ctx.lineTo(80 + freq * 120, h - 34);
          ctx.stroke();
          ctx.fillStyle = "#0ea5e9";
          ctx.beginPath();
          ctx.moveTo(80 + freq * 120, h - 34);
          ctx.lineTo(80 + freq * 120 - 9, h - 40);
          ctx.lineTo(80 + freq * 120 - 9, h - 28);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "rgba(14,116,144,0.8)";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`v = f·λ = ${v.toFixed(0)} u/s`, 84, h - 44);
        }}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Frequency" value={freq} min={0.3} max={4} step={0.1} hex={A} accent={AT} unit=" Hz" onChange={setFreq} />
        <Slider label="Wavelength" value={wavelength} min={40} max={200} step={5} hex={A} accent={AT} unit=" px" onChange={setWavelength} />
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={A} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Wave speed" value={`v = ${v.toFixed(0)} u/s`} accent={AT} />
        <Stat label="λ measured" value={`${wavelength} u`} accent={AT} />
        <Stat label="T" value={`${(1 / freq).toFixed(2)} s`} accent={AT} />
      </div>
    </SimShell>
  );
}

function WaveParamsView({ topic }: { topic?: string }) {
  const [amp, setAmp] = useState(30);
  const [freq, setFreq] = useState(1.2);
  const [wavelength, setWavelength] = useState(110);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const t = sim.tick / 30;
  const T = 1 / freq;

  return (
    <SimShell
      icon="🔁"
      title={simTitle(topic, "Amplitude, period and frequency")}
      accent="cyan"
      subtitle="Amplitude is the wave's height, the period T is the time for one full cycle, and frequency f = 1/T is the number of cycles per second."
      hint="Higher amplitude = more energy. Short period = high frequency. Measure T from the time trace, then f = 1/T — they are exact reciprocals."
      controls={topic ? <SimChip accent="cyan">{topic}</SimChip> : undefined}
    >
      <SimCanvas
        deps={[amp, freq, wavelength, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          const topMid = 70;
          const timeMid = 205;
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "rgba(14,116,144,0.7)";
          ctx.font = "11px system-ui";
          ctx.fillText("space (above) vs time (below)", 10, 20);
          const wave = (x: number, mid: number) => mid + amp * Math.sin((2 * Math.PI * x) / wavelength - 2 * Math.PI * freq * t);
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, topMid);
          ctx.lineTo(w, topMid);
          ctx.moveTo(0, timeMid);
          ctx.lineTo(w, timeMid);
          ctx.stroke();
          const grad = ctx.createLinearGradient(0, topMid - amp, 0, topMid + amp);
          grad.addColorStop(0, "#22d3ee");
          grad.addColorStop(0.5, "#0ea5e9");
          grad.addColorStop(1, "#22d3ee");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 2) {
            const y = wave(x, topMid);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.strokeStyle = "rgba(6,182,212,0.6)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 3]);
          ctx.beginPath();
          ctx.moveTo(14, topMid - amp);
          ctx.lineTo(14, topMid + amp);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(6,182,212,0.85)";
          ctx.font = "11px system-ui";
          ctx.fillText(`amplitude ${amp} u`, 22, topMid + 6);
          const phaseX = 90 + (wavelength / 4) % wavelength;
          ctx.strokeStyle = "rgba(6,182,212,0.5)";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(phaseX, topMid + 8);
          ctx.lineTo(phaseX + wavelength, topMid + 8);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(14,116,144,0.8)";
          ctx.fillText(`one wavelength = ${wavelength} u`, phaseX + 8, topMid + 24);
          ctx.strokeStyle = "#d946ef";
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 2) {
            const y = timeMid + amp * Math.sin((2 * Math.PI * x) / (w / 2.2));
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          const cursorX = ((t % T) / T) * (w / 2.2);
          ctx.strokeStyle = "#d946ef";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cursorX, timeMid - amp - 10);
          ctx.lineTo(cursorX, timeMid + amp + 10);
          ctx.stroke();
          const periodEnd = w / 2.2;
          ctx.strokeStyle = "rgba(217,70,239,0.5)";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(0, timeMid + amp + 14);
          ctx.lineTo(periodEnd, timeMid + amp + 14);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(217,70,239,0.85)";
          ctx.font = "11px system-ui";
          ctx.fillText(`one time period T = ${T.toFixed(2)} s  ->  f = 1/T = ${freq.toFixed(1)} Hz`, 10, timeMid + amp + 30);
        }}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label="Amplitude" value={amp} min={8} max={48} step={1} hex={A} accent={AT} unit=" px" onChange={setAmp} />
        <Slider label="Frequency" value={freq} min={0.4} max={3} step={0.1} hex={A} accent={AT} unit=" Hz" onChange={setFreq} />
        <Slider label="Wavelength" value={wavelength} min={60} max={200} step={5} hex={A} accent={AT} unit=" px" onChange={setWavelength} />
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={A} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Amplitude" value={`${amp} u`} accent={AT} />
        <Stat label="Period" value={`T = ${T.toFixed(2)} s`} accent={AT} />
        <Stat label="Frequency" value={`f = ${freq.toFixed(1)} Hz`} accent={AT} />
      </div>
    </SimShell>
  );
}

function RipplesView({ topic }: { topic?: string }) {
  const [freq, setFreq] = useState(1.4);
  const [lambda, setLambda] = useState(34);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const t = sim.tick / 30;
  const speed = 60;

  return (
    <SimShell
      icon="⭕"
      title={simTitle(topic, "Ripples and wavefronts")}
      accent="cyan"
      subtitle="A vibrating dipper makes circular ripples. Each bright ring is a wavefront — a crest expanding outward at the wave speed."
      hint="Wavefronts spread out in circles on the surface. The spacing between rings is the wavelength; the faster the dipper vibrates, the closer the rings."
      controls={topic ? <SimChip accent="cyan">{topic}</SimChip> : undefined}
    >
      <SimCanvas
        deps={[freq, lambda, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          const cx = w / 2;
          const cy = h / 2 - 10;
          const spacing = lambda;
          for (let ring = 0; ring < 10; ring++) {
            const r = ((t * speed) % spacing) + ring * spacing;
            if (r > 300) break;
            ctx.strokeStyle = `rgba(34,211,238,${Math.max(0, 0.55 - ring * 0.055)})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 60);
          ctx.lineTo(cx, cy - 14);
          ctx.stroke();
          ctx.fillStyle = "#f472b6";
          ctx.beginPath();
          ctx.arc(cx, cy, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#db2777";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = "rgba(14,116,144,0.7)";
          ctx.font = "11px system-ui";
          ctx.fillText(`dipper ${freq.toFixed(1)} Hz`, cx + 14, cy - 26);
          ctx.fillText("wavefronts", 10, 18);
        }}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Dipper frequency" value={freq} min={0.4} max={2.6} step={0.1} hex={A} accent={AT} unit=" Hz" onChange={setFreq} />
        <Slider label="Wavelength" value={lambda} min={18} max={60} step={2} hex={A} accent={AT} unit=" px" onChange={setLambda} />
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={A} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Wave speed" value={`v = fλ ≈ ${(freq * lambda).toFixed(0)} u/s`} accent={AT} />
        <Stat label="Wavefronts" value="crests spreading outward" accent={AT} />
      </div>
    </SimShell>
  );
}

function DiffractionView({ topic }: { topic?: string }) {
  const [tab, setTab] = useState<"diffract" | "interfere">("diffract");
  const [lambda, setLambda] = useState(34);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const t = sim.tick / 30;

  return (
    <SimShell
      icon="≋"
      title={simTitle(topic, "Diffraction and interference")}
      accent="cyan"
      subtitle={
        tab === "diffract"
          ? "Plane waves pass through a narrow gap and bend around its edges — they spread out into new circular wavefronts."
          : "Two vibrating dippers create overlapping ripples. Where crest meets crest they reinforce (bright), where crest meets trough they cancel."
      }
      hint="A wave bends around corners when it passes a gap or edge: that is diffraction. Two sources then interfere — adding (constructive) or cancelling (destructive)."
      controls={
        <>
          {topic && <SimChip accent="cyan">{topic}</SimChip>}
          <ActionButton label="Diffraction" onClick={() => setTab("diffract")} hex={tab === "diffract" ? A : "#94a3b8"} />
          <ActionButton label="Interference" onClick={() => setTab("interfere")} hex={tab === "interfere" ? A : "#94a3b8"} />
        </>
      }
    >
      <SimCanvas
        deps={[tab, lambda, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          if (tab === "diffract") {
            ctx.strokeStyle = "#94a3b8";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(300, 0);
            ctx.lineTo(300, 130);
            ctx.moveTo(300, 190);
            ctx.lineTo(300, h);
            ctx.stroke();
            const speed = 40;
            for (let k = 0; k < 16; k++) {
              const x = (k * lambda + (t * speed) % lambda);
              if (x < 296) {
                ctx.strokeStyle = "rgba(34,211,238,0.6)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
              }
            }
            for (let k = 0; k < 12; k++) {
              const r = ((t * speed * 0.7) % (lambda * 3)) + k * lambda * 3;
              if (r > 340) break;
              ctx.strokeStyle = `rgba(34,211,238,${Math.max(0, 0.5 - k * 0.05)})`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(300, 160, r, -Math.PI / 2 - 1.15, -Math.PI / 2 + 1.15);
              ctx.stroke();
            }
            ctx.fillStyle = "rgba(14,116,144,0.8)";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("gap", 310, 152);
            ctx.fillStyle = "rgba(14,116,144,0.6)";
            ctx.font = "11px system-ui";
            ctx.fillText("plane waves", 120, 20);
            ctx.fillText("waves bend out (diffraction)", 360, 20);
          } else {
            const s1 = { x: 270, y: 160 };
            const s2 = { x: 370, y: 160 };
            const speed = 55;
            for (const s of [s1, s2]) {
              for (let ring = 0; ring < 9; ring++) {
                const r = ((t * speed) % (lambda * 3)) + ring * lambda * 3;
                if (r > 320) break;
                ctx.strokeStyle = `rgba(34,211,238,${Math.max(0, 0.5 - ring * 0.055)})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
                ctx.stroke();
              }
              ctx.fillStyle = "#f472b6";
              ctx.beginPath();
              ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = "rgba(14,116,144,0.7)";
            ctx.font = "11px system-ui";
            ctx.fillText("source A", s1.x - 6, s1.y + 24);
            ctx.fillText("source B", s2.x - 6, s2.y + 24);
            ctx.fillStyle = "rgba(217,70,239,0.85)";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("where rings cross → stronger (constructive)", 140, 26);
          }
        }}
      />

      <div className="mt-4">
        <Slider label="Wavelength" value={lambda} min={18} max={60} step={2} hex={A} accent={AT} unit=" px" onChange={setLambda} />
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={A} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label={tab === "diffract" ? "Effect" : "Interference"} value={tab === "diffract" ? "waves bend around gap" : "crest + crest → brighter"} accent={AT} />
        <Stat label="Wave speed" value={`v ≈ ${(1.4 * lambda).toFixed(0)} u/s`} accent={AT} />
      </div>
    </SimShell>
  );
}

type SoundMode = "loudness" | "medium" | "longitudinal" | "timbre" | "hearing" | "echo";

function soundMode(topic?: string): SoundMode {
  const t = topic?.toLowerCase() ?? "";
  if (/medium/.test(t)) return "medium";
  if (/longitudinal/.test(t)) return "longitudinal";
  if (/quality|harmon/.test(t)) return "timbre";
  if (/ear|range of hearing/.test(t)) return "hearing";
  if (/ultrasound|echo/.test(t)) return "echo";
  return "loudness";
}

export function SoundSim({ topic }: { topic?: string }) {
  const mode = soundMode(topic);
  if (mode === "medium") return <MediumView topic={topic} />;
  if (mode === "longitudinal") return <LongitudinalView topic={topic} />;
  if (mode === "timbre") return <TimbreView topic={topic} />;
  if (mode === "hearing") return <HearingView topic={topic} />;
  if (mode === "echo") return <EchoView topic={topic} />;
  return <LoudnessView topic={topic} />;
}

const NOTES = [
  { label: "A2", f: 110, desc: "110 Hz" },
  { label: "C4", f: 261.63, desc: "middle C" },
  { label: "A4", f: 440, desc: "concert A" },
  { label: "A5", f: 880, desc: "octave up" },
];

function LoudnessView({ topic }: { topic?: string }) {
  const [freq, setFreq] = useState(440);
  const [volume, setVolume] = useState(0.7);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const t = sim.tick / 30;
  const vSound = 343;
  const wavelength = vSound / freq;
  const k = (2 * Math.PI * freq) / 2000;
  const amp = 20 + volume * 60;
  const speed = freq * 0.02;
  const note =
    freq < 180 ? "low — long wavelength, deep pitch" : freq < 350 ? "mid — human voice range" : freq < 700 ? "high — a bird-like whistle" : "very high — piercing";

  return (
    <SimShell
      icon="🔊"
      title={simTitle(topic, "Sound — frequency & pitch")}
      accent="fuchsia"
      subtitle={topic ? `${topic} — pitch lives in the frequency, loudness in the amplitude of the pressure wave.` : "Pitch depends on frequency (Hz), loudness on amplitude. Sound needs a medium — there is no sound in space."}
      hint="In air sound moves at ~343 m/s, so λ = v/f: A4 (440 Hz) gives a 0.78 m wave, a bass 55 Hz note a 6.2 m one. Human hearing: 20 Hz – 20 kHz."
      controls={
        <>
          {topic && <SimChip accent="fuchsia">{topic}</SimChip>}
          <div className="flex flex-wrap gap-1.5">
            {NOTES.map((n) => (
              <ActionButton key={n.label} label={`${n.label} ${n.f} Hz`} onClick={() => setFreq(n.f)} hex={Math.abs(freq - n.f) < 1 ? FA : "#94a3b8"} title={n.desc} />
            ))}
          </div>
        </>
      }
    >
      <SimCanvas
        deps={[freq, volume, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          const midY = h / 2 - 14;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, midY);
          ctx.lineTo(w, midY);
          ctx.stroke();
          ctx.fillStyle = "rgba(217,70,239,0.7)";
          ctx.font = "11px system-ui";
          ctx.fillText("pressure", 90, midY - amp - 8);
          ctx.strokeStyle = "rgba(217,70,239,0.4)";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(0, midY - amp);
          ctx.lineTo(w, midY - amp);
          ctx.moveTo(0, midY + amp);
          ctx.lineTo(w, midY + amp);
          ctx.stroke();
          ctx.setLineDash([]);
          const grad = ctx.createLinearGradient(0, midY - amp, 0, midY + amp);
          grad.addColorStop(0, "#f0abfc");
          grad.addColorStop(0.5, "#d946ef");
          grad.addColorStop(1, "#f0abfc");
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.12;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 2) {
            const y = midY + amp * Math.sin(x * k - t * speed);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.lineTo(w, midY);
          ctx.lineTo(0, midY);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3;
          ctx.shadowColor = "rgba(217,70,239,0.5)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 2) {
            const y = midY + amp * Math.sin(x * k - t * speed);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
          const bandY = h - 18;
          ctx.fillStyle = "rgba(0,0,0,0.06)";
          ctx.fillRect(30, bandY - 8, w - 60, 14);
          for (let i = 0; i < 96; i++) {
            const x = 30 + (i / 96) * (w - 60);
            const p = Math.sin(x * k - t * speed);
            const half = Math.max(0, (p + 1) / 2) * 12;
            ctx.fillStyle = p > 0.05 ? `rgba(217,70,239,${0.25 + p * 0.55})` : "rgba(148,163,184,0.35)";
            ctx.fillRect(x - 2.4, bandY - half, 4.8, half * 2);
          }
          ctx.fillStyle = "rgba(217,70,239,0.75)";
          ctx.font = "11px system-ui";
          ctx.fillText("air molecules bunch → compression (darker = denser)", 30, bandY + 12);
          ctx.fillStyle = "rgba(190,24,93,0.85)";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`λ = v/f = ${wavelength.toFixed(2)} m  (v = 343 m/s)`, 30, 32);
        }}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="Frequency (pitch)" value={freq} min={60} max={1200} step={10} hex={FA} accent={FAT} unit=" Hz" onChange={setFreq} />
        <Slider label="Amplitude (loudness)" value={Math.round(volume * 100)} min={10} max={100} step={5} hex={FA} accent={FAT} unit="%" onChange={(n) => setVolume(n / 100)} />
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={FA} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Wavelength" value={`λ = ${wavelength.toFixed(2)} m`} accent={FAT} />
        <Stat label="λ in cm" value={`${(wavelength * 100).toFixed(0)} cm`} accent={FAT} />
        <Stat label="Pitch" value={note} accent={FAT} />
      </div>
    </SimShell>
  );
}

function MediumView({ topic }: { topic?: string }) {
  const [air, setAir] = useState(100);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 8 * speedMul });
  const ringing = Math.abs(Math.sin(sim.tick * 0.5)) < 0.95;
  const heard = air > 25;
  const particles = Array.from({ length: Math.round((air / 100) * 26) });

  return (
    <SimShell
      icon="🔔"
      title={simTitle(topic, "Sound needs a medium")}
      accent="fuchsia"
      subtitle="Pump the air out of the jar and the ringing bell grows silent — sound is a vibration that needs particles to carry it."
      hint="The bell is still ringing — you can see it move. But without air molecules to compress and spread, there is nothing to carry the wave. In a vacuum: silence."
      controls={topic ? <SimChip accent="fuchsia">{topic}</SimChip> : undefined}
    >
      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-foreground/10 bg-white/40 dark:bg-white/5">
        <svg viewBox="0 0 640 320" className="h-full w-full">
          <ellipse cx={320} cy={300} rx={230} ry={14} fill="#0e7490" opacity={0.25} />
          <path d="M110,260 L110,80 Q110,45 145,45 L495,45 Q530,45 530,80 L530,260" fill="none" stroke="#67e8f9" strokeWidth={6} strokeOpacity={0.8} />
          <path d="M110,260 L530,260" stroke="#67e8f9" strokeWidth={6} strokeOpacity={0.8} />
          <g transform={ringing ? "translate(0,-3)" : "translate(0,0)"}>
            <path d="M250,120 Q320,80 390,120 Q360,180 390,240 Q320,270 250,240 Q280,180 250,120" fill="#fbcfe8" stroke="#db2777" strokeWidth={3} opacity={0.9} />
            <rect x={305} y={105} width={30} height={8} rx={3} fill="#db2777" />
            <rect x={298} y={98} width={44} height={12} rx={4} fill="#9d174d" />
            <circle cx={320} cy={250} r={7} fill="#f472b6" />
          </g>
          <g transform={`translate(${430},${ringing ? 235 : 240})`}>
            <path d="M-16,0 L16,0" stroke="#64748b" strokeWidth={6} strokeLinecap="round" />
          </g>
          {particles.map((_, i) => {
            const px = 150 + ((i * 137) % 340);
            const py = 150 + ((i * 89) % 100);
            return <circle key={i} cx={px} cy={py} r={2.4} fill="#e0f2fe" opacity={0.8} />;
          })}
          {heard &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} cx={210} cy={200} r={34 + i * 22 + Math.sin(sim.tick * 0.4) * 4} fill="none" stroke="#d946ef" strokeWidth={2} opacity={0.5 - i * 0.08} />
            ))}
          <g>
            <path d="M600,230 L600,290" stroke="#94a3b8" strokeWidth={8} strokeLinecap="round" />
            <rect x={570} y={290} width={60} height={18} rx={4} fill="#94a3b8" />
            <path d="M556,300 L644,300" stroke="#cbd5e1" strokeWidth={6} strokeLinecap="round" />
          </g>
        </svg>
        <div className={`absolute left-3 top-3 rounded-lg px-3 py-1 text-sm font-semibold ${heard ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
          {heard ? `Hear the bell — air ${air}%` : "Silence — vacuum"}
        </div>
      </div>

      <div className="mt-4">
        <Slider label="Air in the jar" value={air} min={0} max={100} step={5} hex={FA} accent={FAT} unit="%" onChange={setAir} />
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={FA} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Sound" value={heard ? "carried by air" : "blocked by vacuum"} accent={FAT} />
        <Stat label="Bell" value={ringing ? "still ringing" : "ringing"} accent={FAT} />
      </div>
    </SimShell>
  );
}

function LongitudinalView({ topic }: { topic?: string }) {
  const [freq, setFreq] = useState(3);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const t = sim.tick / 30;
  const midY = 105;
  const k = (2 * Math.PI * 5) / 500;
  const omega = 2 * Math.PI * freq;

  return (
    <SimShell
      icon="≋"
      title={simTitle(topic, "Sound as a longitudinal wave")}
      accent="fuchsia"
      subtitle="Sound travels as a series of compressions (particles bunched together) and rarefactions (spread apart) moving along the medium."
      hint="The particles vibrate back and forth along the direction the wave travels — that is what longitudinal means. Compressions follow rarefactions all the way to your ear."
      controls={topic ? <SimChip accent="fuchsia">{topic}</SimChip> : undefined}
    >
      <SimCanvas
        deps={[freq, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, midY);
          ctx.lineTo(w, midY);
          ctx.stroke();
          ctx.strokeStyle = "rgba(217,70,239,0.45)";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          for (let x = 0; x <= w; x += 3) {
            const y = midY + 46 * Math.sin(k * x - omega * t);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.setLineDash([]);
          for (let i = 0; i < 60; i++) {
            const x = 20 + i * 10;
            const disp = 8 * Math.sin(k * x - omega * t);
            ctx.fillStyle = "rgba(190,24,93,0.9)";
            ctx.beginPath();
            ctx.arc(x + disp * 1.6, midY, 5, 0, Math.PI * 2);
            ctx.fill();
          }
          const comp = (Math.asin(1) - omega * t) / k;
          const compX = ((comp % 500) + 500) % 500 + 20;
          ctx.fillStyle = "#d946ef";
          ctx.font = "bold 12px system-ui";
          ctx.fillText("compression", Math.min(compX, w - 90), midY + 44);
          const rarefX = ((comp + 250) % 500) + 20;
          ctx.fillText("rarefaction", Math.min(rarefX, w - 90), midY - 52);
          ctx.fillStyle = "rgba(14,116,144,0.7)";
          ctx.font = "11px system-ui";
          ctx.fillText("dots crowd → compression; spread out → rarefaction", 10, 20);
        }}
      />

      <div className="mt-4">
        <Slider label="Frequency" value={freq} min={1} max={6} step={0.2} hex={FA} accent={FAT} unit=" Hz" onChange={setFreq} />
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={FA} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Motion" value="particles move along the wave" accent={FAT} />
        <Stat label="Carrier" value="compression + rarefaction" accent={FAT} />
      </div>
    </SimShell>
  );
}

type TimbreType = "sine" | "triangle" | "square";

function TimbreView({ topic }: { topic?: string }) {
  const [type, setType] = useState<TimbreType>("sine");
  const [freq, setFreq] = useState(220);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });
  const t = sim.tick / 30;
  const midY = 90;
  const k = (2 * Math.PI * freq) / 2200;
  const omega = 2 * Math.PI * freq * 0.02;

  return (
    <SimShell
      icon="🎵"
      title={simTitle(topic, "Quality of sound (timbre)")}
      accent="fuchsia"
      subtitle="A violin and a flute playing the same note sound different — their waveforms carry extra harmonics that give each instrument its own quality."
      hint="All three waveforms have the same pitch, but sine has only the fundamental, while triangle and square add odd harmonics. That mix is the timbre."
      controls={
        <>
          {topic && <SimChip accent="fuchsia">{topic}</SimChip>}
          {(["sine", "triangle", "square"] as TimbreType[]).map((w) => (
            <ActionButton key={w} label={w} onClick={() => setType(w)} hex={type === w ? FA : "#94a3b8"} />
          ))}
        </>
      }
    >
      <SimCanvas
        deps={[type, freq, sim.tick]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, midY);
          ctx.lineTo(w, midY);
          ctx.stroke();
          const grad = ctx.createLinearGradient(0, midY - 60, 0, midY + 60);
          grad.addColorStop(0, "#f0abfc");
          grad.addColorStop(0.5, "#d946ef");
          grad.addColorStop(1, "#f0abfc");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3;
          ctx.shadowColor = "rgba(217,70,239,0.5)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 2) {
            let y: number;
            if (type === "sine") {
              y = midY + 55 * Math.sin(k * x - omega * t);
            } else if (type === "triangle") {
              const p = (((k * x - omega * t) / (2 * Math.PI)) % 1 + 1) % 1;
              y = midY + 55 * (4 * Math.abs(p - 0.5) - 1);
            } else {
              const p = Math.sin(k * x - omega * t) >= 0 ? 1 : -1;
              y = midY + 55 * p;
            }
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
          const barsY = 200;
          const bars = type === "sine" ? [1] : type === "triangle" ? [1, 0, 0.34, 0, 0.18] : [1, 0, 0.5, 0, 0.33, 0, 0.25];
          ctx.fillStyle = "rgba(217,70,239,0.7)";
          for (let i = 0; i < bars.length; i++) {
            const bh = bars[i] * 40;
            ctx.fillRect(120 + i * 70, barsY - bh, 34, bh);
            ctx.fillStyle = "rgba(14,116,144,0.6)";
            ctx.font = "10px system-ui";
            ctx.fillText(`${i + 1}f`, 120 + i * 70, barsY + 14);
            ctx.fillStyle = "rgba(217,70,239,0.7)";
          }
          ctx.fillStyle = "rgba(14,116,144,0.7)";
          ctx.font = "11px system-ui";
          ctx.fillText("harmonics →", 30, barsY + 10);
        }}
      />

      <div className="mt-4">
        <Slider label="Note (same pitch for all)" value={freq} min={110} max={880} step={10} hex={FA} accent={FAT} unit=" Hz" onChange={setFreq} />
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={FA} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Pitch" value={`same ${freq} Hz`} accent={FAT} />
        <Stat label="Timbre" value={type === "sine" ? "pure tone" : type === "triangle" ? "soft harmonics" : "rich, buzzy harmonics"} accent={FAT} />
      </div>
    </SimShell>
  );
}

function HearingView({ topic }: { topic?: string }) {
  const a = "#d946ef";
  const at = "text-fuchsia-600 dark:text-fuchsia-400";
  const [freq, setFreq] = useState(1000);
  const logX = (f: number) => 30 + (Math.log10(f) / 5.3) * 580;
  const human = freq >= 20 && freq <= 20000;
  const dog = freq >= 40 && freq <= 60000;
  const bat = freq >= 2000 && freq <= 110000;
  const zones = [
    { name: "human", min: 20, max: 20000, color: "#2dd4bf", hear: human },
    { name: "dog", min: 40, max: 60000, color: "#fbbf24", hear: dog },
    { name: "bat", min: 2000, max: 110000, color: "#a78bfa", hear: bat },
  ];

  return (
    <SimShell
      icon="👂"
      title={simTitle(topic, "Range of hearing")}
      accent="fuchsia"
      subtitle="Animals hear different slices of the frequency range — dogs pick up high whistles we miss, and bats use ultrasound far above human hearing."
      hint="Humans: 20 Hz – 20 kHz. Dogs extend to 60 kHz. Bats fly on 2–110 kHz ultrasound, bouncing it off insects to 'see' in the dark."
      controls={topic ? <SimChip accent="fuchsia">{topic}</SimChip> : undefined}
    >
      <div className="relative h-40 w-full overflow-hidden rounded-xl border border-foreground/10 bg-white/40 dark:bg-white/5">
        <svg viewBox="0 0 640 160" className="h-full w-full">
          <line x1={30} y1={120} x2={610} y2={120} stroke="#0f766e" strokeWidth={2} />
          {[10, 100, 1000, 10000, 100000].map((f) => (
            <g key={f}>
              <line x1={logX(f)} y1={116} x2={logX(f)} y2={124} stroke="#0f766e" strokeWidth={2} />
              <text x={logX(f)} y={138} textAnchor="middle" fontSize={10} fill="#0f766e">{f >= 1000 ? `${f / 1000} kHz` : `${f} Hz`}</text>
            </g>
          ))}
          {zones.map((z, i) => (
            <rect key={z.name} x={logX(z.min)} y={30 + i * 28} width={logX(z.max) - logX(z.min)} height={20} rx={5} fill={z.color} opacity={z.hear ? 0.85 : 0.25} />
          ))}
          {zones.map((z, i) => (
            <text key={z.name} x={640 - 8} y={45 + i * 28} textAnchor="end" fontSize={11} fill="#0f766e">
              {z.name} {z.hear ? "✓" : "✗"}
            </text>
          ))}
          <line x1={logX(freq)} y1={18} x2={logX(freq)} y2={122} stroke="#d946ef" strokeWidth={3} />
          <circle cx={logX(freq)} cy={18} r={5} fill="#d946ef" />
        </svg>
        <div className={`absolute left-3 top-2 text-sm font-semibold ${at}`}>
          {freq} Hz — {human ? "you hear it" : dog ? "only dogs hear it" : bat ? "only bats hear it" : "inaudible"}
        </div>
      </div>

      <div className="mt-4">
        <Slider label="Frequency" value={freq} min={10} max={120000} step={10} hex={a} accent={at} unit=" Hz" onChange={setFreq} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Human" value="20 Hz – 20 kHz" accent={at} />
        <Stat label="Dog" value="up to 60 kHz" accent={at} />
        <Stat label="Bat" value="2 – 110 kHz" accent={at} />
      </div>
    </SimShell>
  );
}

function EchoView({ topic }: { topic?: string }) {
  const a = "#d946ef";
  const at = "text-fuchsia-600 dark:text-fuchsia-400";
  const [depth, setDepth] = useState(5);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 20 * speedMul });
  const v = 1540;
  const t = (2 * depth) / v;
  const total = 2 * depth;
  const pulsePos = (sim.tick % total) * 40;
  const echoPos = pulsePos > depth * 40 ? pulsePos - depth * 40 : -1;

  return (
    <SimShell
      icon="📡"
      title={simTitle(topic, "Ultrasound and echo")}
      accent="fuchsia"
      subtitle="A sound pulse bounces off the organ and the echo returns. Depth = (speed × time) ÷ 2 — the sound travels there and back."
      hint="In soft tissue ultrasound travels at about 1540 m/s. The scanner measures the round trip and halves it to find the depth."
      controls={topic ? <SimChip accent="fuchsia">{topic}</SimChip> : undefined}
    >
      <div className="relative h-56 w-full overflow-hidden rounded-xl border border-foreground/10 bg-white/40 dark:bg-white/5">
        <svg viewBox="0 0 640 220" className="h-full w-full">
          <rect x={30} y={30} width={580} height={180} fill="rgba(190,242,255,0.25)" rx={10} />
          <rect x={30} y={30} width={580} height={24} rx={10} fill="#164e63" />
          <text x={320} y={46} textAnchor="middle" fontSize={12} fill="#e0f2fe">ultrasound probe</text>
          {pulsePos > 0 && pulsePos < depth * 40 && (
            <g transform={`translate(${320 + pulsePos * 0.3}, ${90 + pulsePos * 0.4})`}>
              <circle r={10} fill="#d946ef" opacity={0.7} />
              <circle r={16} fill="#d946ef" opacity={0.3} />
            </g>
          )}
          {echoPos > 0 && (
            <g transform={`translate(${320 + echoPos * 0.3}, ${110 + echoPos * 0.4})`}>
              <circle r={10} fill="#22d3ee" opacity={0.7} />
              <circle r={16} fill="#22d3ee" opacity={0.3} />
            </g>
          )}
          <rect x={300} y={80 + depth * 4} width={40} height={14} rx={4} fill="#fb7185" />
          <text x={320} y={90 + depth * 4 - 10} textAnchor="middle" fontSize={11} fill="#be123c">organ at {depth} cm</text>
          <line x1={320} y1={54} x2={320} y2={80 + depth * 4} stroke="#d946ef" strokeWidth={2} strokeDasharray="4 4" />
        </svg>
        <div className={`absolute left-3 top-9 text-sm font-semibold ${at}`}>
          round trip t = {t.toFixed(4)} s
        </div>
      </div>

      <div className="mt-4">
        <Slider label="Depth of organ" value={depth} min={1} max={10} step={0.5} hex={a} accent={at} unit=" cm" onChange={setDepth} />
      </div>

      <div className="mt-3">
        <RunControls running={sim.running} onToggle={sim.toggle} onReset={sim.reset} speed={speedMul} onSpeed={setSpeedMul} hex={a} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Formula" value="d = v·t / 2" accent={at} />
        <Stat label="Round trip" value={`${t.toFixed(4)} s`} accent={at} />
      </div>
    </SimShell>
  );
}
