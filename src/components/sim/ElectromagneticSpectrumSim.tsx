"use client";

import { useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";

const LOG_MIN = -14;
const LOG_MAX = 4;

const BANDS = [
  { name: "Gamma rays", logMin: LOG_MIN, logMax: -11, hex: "#60a5fa", src: "radioactive decay, cosmic rays" },
  { name: "X-rays", logMin: -11, logMax: -8, hex: "#818cf8", src: "hospital X-rays, airport baggage scans" },
  { name: "Ultraviolet", logMin: -8, logMax: -6.42, hex: "#a855f7", src: "the Sun — causes tanning and sunburn" },
  { name: "Visible", logMin: -6.42, logMax: -6.15, hex: "#facc15", src: "the Sun and lamps — the light our eyes detect" },
  { name: "Infrared", logMin: -6.15, logMax: -3, hex: "#f97316", src: "heat from your skin, TV remote controls" },
  { name: "Microwaves", logMin: -3, logMax: -1, hex: "#f43f5e", src: "microwave ovens, Wi-Fi, mobile phones" },
  { name: "Radio waves", logMin: -1, logMax: LOG_MAX, hex: "#c084fc", src: "radio and TV broadcasts, radar" },
];

function bandFor(logL: number) {
  return BANDS.find((b) => logL >= b.logMin && logL <= b.logMax) ?? BANDS[BANDS.length - 1];
}

function wavelengthToRgb(wl: number): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / 60;
    b = 1;
  } else if (wl < 490) {
    g = (wl - 440) / 50;
    b = 1;
  } else if (wl < 510) {
    g = 1;
    b = -(wl - 490) / 20;
  } else if (wl < 580) {
    r = (wl - 510) / 70;
    g = 1;
  } else if (wl < 645) {
    r = 1;
    g = -(wl - 580) / 65;
  } else {
    r = 1;
  }
  const f =
    wl < 420 ? 0.3 + (0.7 * (wl - 380)) / 40 : wl > 680 ? 0.3 + (0.7 * (700 - wl)) / 20 : 1;
  return [Math.round(255 * f * r), Math.round(255 * f * g), Math.round(255 * f * b)];
}

export function ElectromagneticSpectrumSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "cyan";
  const a = ACCENTS[accent];

  const [manualLog, setManualLog] = useState(-6.25);
  const [speedMul, setSpeedMul] = useState(1);
  const sweep = useSim({ fps: 30 * speedMul });

  const logL = sweep.running ? -14 + ((sweep.elapsed % 6) / 6) * 18 : manualLog;
  const lam = Math.pow(10, logL);
  const lamNm = lam * 1e9;
  const freq = 3e8 / lam;
  const energy = 1240 / lamNm;
  const band = bandFor(logL);

  const X = (lg: number) => 60 + ((lg - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 460;

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const barY = 66;
    const barH = 34;

    for (const b of BANDS) {
      const x0 = Math.max(60, X(Math.max(b.logMin, LOG_MIN)));
      const x1 = Math.min(520, X(Math.min(b.logMax, LOG_MAX)));
      ctx.fillStyle = b.hex + "88";
      ctx.fillRect(x0, barY, x1 - x0, barH);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 0.6;
      ctx.strokeRect(x0, barY, x1 - x0, barH);
      if (x1 - x0 > 34) {
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(b.name, (x0 + x1) / 2, barY + barH / 2 + 3);
        ctx.textAlign = "left";
      }
    }

    const mx = X(logL);
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mx, 26);
    ctx.lineTo(mx, h - 58);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.moveTo(mx - 7, 26);
    ctx.lineTo(mx + 7, 26);
    ctx.lineTo(mx, 35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#475569";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("log₁₀ wavelength (m)", 60, 120);
    ctx.fillText("-14", 56, barY - 8);
    ctx.fillText("0", 296, barY - 8);
    ctx.fillText("+4", 510, barY - 8);

    const insetX = 170;
    const insetY = 150;
    const insetW = 300;
    const insetH = 30;
    for (let x = 0; x <= insetW; x++) {
      const wl = 380 + (x / insetW) * 320;
      const [r, g, b] = wavelengthToRgb(wl);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(insetX + x, insetY, 1.5, insetH);
    }
    ctx.strokeStyle = "rgba(148,163,184,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(insetX, insetY, insetW, insetH);
    ctx.fillStyle = "#475569";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("The visible window 380–700 nm", insetX, insetY - 6);
    ctx.fillText("violet", insetX + 2, insetY + insetH + 14);
    ctx.fillText("red", insetX + insetW - 26, insetY + insetH + 14);

    const inVisible = logL > -6.42 && logL < -6.15;
    if (inVisible) {
      const vx = insetX + ((lamNm - 380) / 320) * insetW;
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(vx, insetY - 4);
      ctx.lineTo(vx, insetY + insetH + 4);
      ctx.stroke();
    }
  };

  const sub = topic
    ? `${topic} — all of them travel at c, but with wildly different wavelengths and energies.`
    : "Sweep across the whole spectrum: every band is the same wave phenomenon travelling at the speed of light.";

  const hint =
    "All electromagnetic waves travel at c = 3×10⁸ m/s and obey c = fλ. Shorter wavelength means higher frequency and higher photon energy E = hf — gamma rays are far more energetic than radio waves.";

  return (
    <SimShell
      icon={<span>☀</span>}
      title={simTitle(topic, "The Electromagnetic Spectrum")}
      subtitle={sub}
      accent={accent}
      hint={hint}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas draw={draw} deps={[logL, band.name]} />

      <div className="mt-4">
        <RunControls
          running={sweep.running}
          onToggle={sweep.toggle}
          onReset={sweep.reset}
          speed={speedMul}
          onSpeed={setSpeedMul}
          hex={a.hex}
          label={sweep.running ? "Sweep" : "Sweep spectrum"}
        />
      </div>

      <div className="mt-4">
        <Slider
          label="Wavelength λ (log₁₀ m)"
          value={logL}
          min={LOG_MIN}
          max={LOG_MAX}
          step={0.01}
          hex={a.hex}
          accent={a.text}
          onChange={setManualLog}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {BANDS.map((b) => (
          <ActionButton
            key={b.name}
            label={b.name}
            onClick={() => {
              setManualLog((b.logMin + b.logMax) / 2);
              sweep.setRunning(false);
            }}
            hex={band.name === b.name ? a.hex : "#64748b"}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Band" value={band.name} accent={a.text} />
        <Stat label="Wavelength" value={`${lam < 1e-6 ? `${(lamNm).toExponential(2)} nm` : lam < 1e-3 ? `${(lam * 1e3).toFixed(2)} mm` : lam < 1 ? `${(lam * 1e2).toFixed(1)} cm` : `${lam.toFixed(1)} m`}`} accent={a.text} />
        <Stat label="Frequency" value={`${freq.toExponential(2)} Hz`} accent={a.text} />
        <Stat label="Photon energy" value={`${energy.toExponential(2)} eV`} accent={a.text} />
      </div>

      <p className="mt-3 rounded-xl border border-foreground/15 bg-white/50 px-3 py-2 text-sm text-foreground/70 dark:bg-white/5">
        {band.name}: {band.src}.{" "}
        {logL < -6.42
          ? "Dangerous to living cells — the photons are energetic enough to damage DNA."
          : logL > -6.15
            ? "Safe for us to use every day — radio and microwaves carry little energy per photon."
            : "A narrow window in which the Sun's energy happens to reach us — and our eyes evolved to see it."}
      </p>
    </SimShell>
  );
}
