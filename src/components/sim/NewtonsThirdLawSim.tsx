"use client";

import { useRef, useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { ActionButton, RunControls, SimCanvas, Slider, Stat, Toggle, useSim } from "./simkit";

type N3Mode = "rocket" | "cannon";

function n3Mode(topic?: string): N3Mode {
  const t = topic?.toLowerCase() ?? "";
  if (/cannon|gun|recoil|bullet|action and reaction/.test(t)) return "cannon";
  return "rocket";
}

const G = 9.8;

export function NewtonsThirdLawSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "orange";
  const a = ACCENTS[accent];
  const mode = n3Mode(topic);

  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });

  const [burn, setBurn] = useState(0.8);
  const [vEx, setVEx] = useState(40);
  const [m0, setM0] = useState(6);
  const [gravity, setGravity] = useState(false);
  const [ballM, setBallM] = useState(0.5);
  const [cannonM, setCannonM] = useState(200);
  const [ballV, setBallV] = useState(220);

  const mEmpty = 1.2;
  const burnTime = (m0 - mEmpty) / burn;
  const t = sim.elapsed;
  const massNow = Math.max(m0 - burn * t, mEmpty);
  const thrust = vEx * burn;
  const vel = vEx * Math.log(m0 / massNow) - (gravity ? G * t : 0);
  const velAfter = vEx * Math.log(m0 / mEmpty) - (gravity ? G * burnTime : 0);
  const acc = thrust / massNow - (gravity ? G : 0);
  const fuelBurned = m0 - massNow;
  const pRocket = massNow * vel;
  const pGas = vEx * fuelBurned;

  const coastH = (vEx / burn) * (m0 - mEmpty - mEmpty * Math.log(m0 / mEmpty)) - (gravity ? 0.5 * G * burnTime * burnTime : 0);
  const height =
    t <= burnTime
      ? (vEx / burn) * (m0 - massNow - massNow * Math.log(m0 / massNow)) - (gravity ? 0.5 * G * t * t : 0)
      : coastH + velAfter * (t - burnTime) - (gravity ? 0.5 * G * (t - burnTime) * (t - burnTime) : 0);

  const firedAt = useRef<number | null>(null);

  const vRecoil = (ballM / cannonM) * ballV;

  const reset = () => {
    firedAt.current = null;
    sim.reset();
  };

  const fire = () => {
    if (firedAt.current == null) firedAt.current = sim.elapsed;
    sim.setRunning(true);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (mode === "rocket") {
      const cx = 210;
      const ground = h - 34;
      const px = Math.min(height * 16, ground - 70);
      const bottom = ground - px;
      const top = bottom - 46;
      const mid = (top + bottom) / 2;

      ctx.strokeStyle = "rgba(100,116,139,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, ground);
      ctx.lineTo(w - 30, ground);
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(`height ${height.toFixed(1)} m`, 30, ground + 14);

      for (let i = 0; i < 12; i++) {
        const age = sim.elapsed - i * 0.05;
        const life = 0.5 + Math.min(0.4, Math.abs(vel) / 80);
        const phase = age % life;
        const fall = phase * (18 + Math.min(90, Math.abs(vel) * 0.5)) + i * 2;
        const fade = 1 - phase / life;
        ctx.globalAlpha = Math.max(0, fade) * 0.7;
        ctx.fillStyle = "#fb923c";
        ctx.beginPath();
        ctx.arc(cx + (i % 3) * 5 - 5, bottom + 8 + fall, 7 - (i % 4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const body = ctx.createLinearGradient(cx - 14, 0, cx + 14, 0);
      body.addColorStop(0, "#f8fafc");
      body.addColorStop(0.5, "#e2e8f0");
      body.addColorStop(1, "#94a3b8");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.roundRect(cx - 13, top + 12, 26, 30, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 8, top + 12);
      ctx.lineTo(cx, top);
      ctx.lineTo(cx + 8, top + 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(cx, mid + 4, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(cx - 13, bottom);
      ctx.lineTo(cx - 10, bottom - 8);
      ctx.lineTo(cx + 10, bottom - 8);
      ctx.lineTo(cx + 13, bottom);
      ctx.closePath();
      ctx.fill();

      const arrow = (x: number, y: number, len: number, color: string, label: string) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - len);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 5, y - len + 9);
        ctx.lineTo(x, y - len);
        ctx.lineTo(x + 5, y - len + 9);
        ctx.closePath();
        ctx.fill();
        ctx.font = "bold 10px sans-serif";
        ctx.fillText(label, x + 9, y - len / 2 + 3);
      };
      arrow(cx + 26, bottom + 4, Math.min(70, 10 + thrust / 4), "#ea580c", "action (rocket)");
      arrow(cx + 46, bottom + 4, Math.min(70, 10 + thrust / 4), "#64748b", "reaction (gas)");

      const gx = 360;
      const gy = 36;
      const gw = w - gx - 26;
      const gh = h - gy - 40;
      ctx.strokeStyle = "rgba(100,116,139,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx, gy + gh);
      ctx.lineTo(gx + gw, gy + gh);
      ctx.moveTo(gx, gy + gh);
      ctx.lineTo(gx, gy);
      ctx.stroke();
      const span = Math.max(1, (gravity ? 3.5 : 4.5));
      const vOf = (tt: number) => {
        const m = Math.max(m0 - burn * tt, mEmpty);
        return vEx * Math.log(m0 / m) - (gravity ? G * tt : 0);
      };
      const vMax = Math.max(40, vOf(span) * 1.1);
      ctx.strokeStyle = a.hex;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= gw; i += 3) {
        const tt = (i / gw) * span;
        const y = gy + gh - (vOf(tt) / vMax) * gh;
        if (i === 0) ctx.moveTo(gx + i, y);
        else ctx.lineTo(gx + i, y);
      }
      ctx.stroke();
      ctx.fillStyle = a.hex;
      ctx.beginPath();
      ctx.arc(gx + (Math.min(sim.elapsed, span) / span) * gw, gy + gh - (vel / vMax) * gh, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#475569";
      ctx.font = "11px sans-serif";
      ctx.fillText("velocity vs time", gx, gy + gh + 16);
      ctx.fillStyle = "#ea580c";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`v = ${vel.toFixed(1)} m/s`, gx, gy + 12);
    } else {
      const t = firedAt.current != null ? Math.max(0, sim.elapsed - firedAt.current) : 0;
      const cannonX = Math.max(24, 150 - vRecoil * t * 0.5);
      const ballX = Math.min(616, 210 + ballV * t * 0.5);
      const y = h - 70;

      ctx.strokeStyle = "rgba(100,116,139,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(20, h - 26);
      ctx.lineTo(w - 20, h - 26);
      ctx.stroke();

      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.arc(cannonX + 34, h - 26, 16, 0, Math.PI * 2);
      ctx.arc(cannonX + 2, h - 26, 16, 0, Math.PI * 2);
      ctx.fill();
      const barrel = ctx.createLinearGradient(cannonX, y - 16, cannonX + 70, y - 16);
      barrel.addColorStop(0, "#475569");
      barrel.addColorStop(1, "#1e293b");
      ctx.fillStyle = barrel;
      ctx.beginPath();
      ctx.roundRect(cannonX, y - 16, 72, 18, 4);
      ctx.fill();
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.roundRect(cannonX - 6, y, 44, 26, 4);
      ctx.fill();

      const trail = 8;
      for (let i = 0; i < trail; i++) {
        const px = ballX - i * 8;
        if (px < cannonX + 60) continue;
        ctx.globalAlpha = 0.15 + (1 - i / trail) * 0.2;
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.arc(px, y + 8, 7 - i * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowColor = "rgba(249,115,22,0.5)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.arc(ballX, y + 8, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const arrow = (x: number, y0: number, len: number, color: string, label: string, up: boolean) => {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x + len, y0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + len - 9, y0 - 5);
        ctx.lineTo(x + len, y0);
        ctx.lineTo(x + len - 9, y0 + 5);
        ctx.closePath();
        ctx.fill();
        ctx.font = "bold 10px sans-serif";
        ctx.fillText(label, x + len / 2 - (up ? 18 : 8), y0 + (up ? -7 : 16));
      };
      arrow(cannonX - 2, h - 52, 46, "#64748b", "recoil", false);
      arrow(ballX - 8, y + 26, 46, "#ea580c", "ball", true);

      ctx.fillStyle = "#475569";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(
        `ball ${ballM.toFixed(1)} kg @ ${ballV.toFixed(0)} m/s  ↔  cannon ${(cannonM / 1000).toFixed(2)} t`,
        40,
        24,
      );
    }
  };

  const sub =
    mode === "cannon"
      ? "Fire the cannon: the ball leaves with momentum, the cannon recoils with exactly equal momentum the other way."
      : "A rocket pushes exhaust gases down and feels an equal push up - it needs nothing to push against but its own fuel.";

  const hint =
    "Newton's third law: F_AB = -F_BA. The two forces act on different objects, so they never cancel. Momentum stays constant because what one body gains, the other loses.";

  return (
    <SimShell
      icon={<span>⇄</span>}
      title={simTitle(topic, "Newton's Third Law")}
      subtitle={sub}
      accent={accent}
      hint={hint}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas
        draw={draw}
        deps={[sim.tick, speedMul, mode, m0, burn, vEx, gravity, ballM, cannonM, ballV, height]}
      />

      <div className="mt-4">
        <RunControls
          running={sim.running}
          onToggle={sim.toggle}
          onReset={reset}
          speed={speedMul}
          onSpeed={setSpeedMul}
          hex={a.hex}
        />
        {mode === "cannon" && (
          <div className="mt-2">
            <ActionButton label="Fire!" icon="🔥" onClick={fire} hex={a.hex} />
          </div>
        )}
      </div>

      {mode === "rocket" ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Slider label="Exhaust speed (v_ex)" value={vEx} min={10} max={100} step={1} hex={a.hex} accent={a.text} unit=" m/s" onChange={setVEx} />
          <Slider label="Fuel burn rate (ṁ)" value={burn} min={0.1} max={2} step={0.05} hex={a.hex} accent={a.text} unit=" kg/s" onChange={setBurn} />
          <Slider label="Liftoff mass (m₀)" value={m0} min={2} max={12} step={0.1} hex={a.hex} accent={a.text} unit=" kg" onChange={setM0} />
          <div className="rounded-xl border border-foreground/15 bg-white/50 px-3 py-2 text-sm text-foreground/60 dark:bg-white/5">
            <Toggle
              label="Include gravity (g = 9.8)"
              checked={gravity}
              onChange={setGravity}
              hex={a.hex}
              hint="Without gravity, the rocket is the classic Tsiolkovsky equation."
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Slider label="Ball mass" value={ballM} min={0.1} max={2} step={0.05} hex={a.hex} accent={a.text} unit=" kg" onChange={setBallM} />
          <Slider label="Cannon mass" value={cannonM} min={50} max={500} step={10} hex={a.hex} accent={a.text} unit=" kg" onChange={setCannonM} />
          <Slider label="Ball muzzle speed" value={ballV} min={40} max={400} step={10} hex={a.hex} accent={a.text} unit=" m/s" onChange={setBallV} />
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {mode === "rocket" ? (
          <>
            <Stat label="Thrust (ṁ·v_ex)" value={`${thrust.toFixed(1)} N`} accent={a.text} />
            <Stat label="Rocket mass" value={`${massNow.toFixed(2)} kg`} accent={a.text} />
            <Stat label="Acceleration" value={`${acc.toFixed(1)} m/s2`} accent={a.text} />
            <Stat label="Velocity (v_ex·ln m₀/m)" value={`${vel.toFixed(1)} m/s`} accent={a.text} />
            <Stat label="Height" value={`${height.toFixed(1)} m`} accent={a.text} />
            <Stat label="Rocket momentum" value={`${pRocket.toFixed(0)} kg·m/s`} accent={a.text} />
            <Stat label="Exhaust momentum" value={`${pGas.toFixed(0)} kg·m/s`} accent={a.text} />
            <Stat label="Total momentum" value={`${(pRocket - pGas).toFixed(0)} kg·m/s`} accent={a.text} />
          </>
        ) : (
          <>
            <Stat label="Ball momentum (mv)" value={`${(ballM * ballV).toFixed(0)} kg·m/s`} accent={a.text} />
            <Stat label="Recoil velocity" value={`${vRecoil.toFixed(2)} m/s`} accent={a.text} />
            <Stat label="Cannon momentum" value={`${(cannonM * vRecoil).toFixed(0)} kg·m/s`} accent={a.text} />
            <Stat label="Total momentum" value="0 kg·m/s" accent={a.text} />
          </>
        )}
      </div>
    </SimShell>
  );
}
