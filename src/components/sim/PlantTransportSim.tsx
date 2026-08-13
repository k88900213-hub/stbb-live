"use client";

import { useState } from "react";
import { simTitle, ACCENTS, SimChip, SimShell, type SimAccent } from "./SimShell";
import { RunControls, SimCanvas, Slider, Stat, useSim } from "./simkit";

type TransportMode = "transpiration" | "translocation";

function transportMode(topic?: string): TransportMode {
  const t = topic?.toLowerCase() ?? "";
  if (/translocat|phloem|sugar|sucrose|transport of food/.test(t)) return "translocation";
  return "transpiration";
}

export function PlantTransportSim({ topic }: { topic?: string }) {
  const accent: SimAccent = "lime";
  const a = ACCENTS[accent];
  const mode = transportMode(topic);

  const [light, setLight] = useState(70);
  const [tempC, setTempC] = useState(28);
  const [humidity, setHumidity] = useState(50);
  const [wind, setWind] = useState(2);
  const [sugar, setSugar] = useState(60);
  const [demand, setDemand] = useState(50);
  const [speedMul, setSpeedMul] = useState(1);
  const sim = useSim({ fps: 30 * speedMul });

  const lightF = 0.3 + 0.7 * (light / 100);
  const tempF = Math.max(0.2, (tempC - 5) / 35);
  const humidityF = 1 - humidity / 100;
  const windF = 1 + wind * 0.35;
  const stomataOpen = Math.min(1, 0.15 + 0.55 * (light / 100) + 0.3 * (tempC / 45));
  const transpRate = lightF * tempF * humidityF * windF * stomataOpen * 5;
  const soilPsi = -0.02 - (1 - humidity / 100) * 0.8;
  const leafPsi = -(0.4 + transpRate * 0.28);
  const gradPsi = leafPsi - soilPsi;
  const wilting = gradPsi >= 0;
  const t = sim.elapsed;

  const sugarGrad = Math.max(0, sugar - demand);
  const pressureGrad = sugarGrad * 0.02;
  const sapFlow = sugarGrad * 0.06;
  const phloemPsi = -0.3 - sugar * 0.01;
  const sinkPsi = -0.3 - demand * 0.01;

  const sub =
    mode === "transpiration"
      ? topic
        ? `${topic} — sunlight and heat evaporate water through the stomata, pulling the stream up the xylem.`
        : "Transpiration: sunlight, heat, dry air and wind all speed water loss through the stomata — the water-potential gradient pulls the stream up the xylem."
      : topic
        ? `${topic} — sucrose is made in the leaf (source) and delivered through the phloem to the roots (sink).`
        : "Translocation: sugars travel from source to sink in the phloem, driven by the pressure gradient between loaded and unloaded sieve tubes.";

  const hint =
    mode === "transpiration"
      ? "On a hot, windy, dry day the stomata are wide open and water pours out — leaf water potential falls to −2 MPa and the xylem column is pulled up by tension. In very dry soil the gradient can reverse and the plant wilts."
      : "The phloem is living sieve-tube tissue carrying sucrose both up and down. Source: where sugar is made (leaf). Sink: where it is used or stored (root, fruit, seed).";

  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const soilY = h - 46;
    ctx.fillStyle = "#713f12";
    ctx.fillRect(0, soilY, w, h - soilY);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    for (let i = 0; i < 30; i++) {
      const sx = (i * 37) % w;
      ctx.fillRect(sx, soilY + 8 + ((i * 13) % 30), 20, 3);
    }

    const stemX = 120;
    const rootX = 120;
    const canopyY = 70;

    ctx.strokeStyle = "#3f6212";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(stemX, soilY);
    ctx.lineTo(stemX, canopyY);
    ctx.stroke();

    ctx.strokeStyle = "#4d7c0f";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(stemX, soilY);
    ctx.lineTo(rootX - 34, soilY + 26);
    ctx.moveTo(stemX, soilY);
    ctx.lineTo(rootX + 30, soilY + 30);
    ctx.moveTo(stemX, soilY - 6);
    ctx.lineTo(rootX - 12, soilY + 34);
    ctx.stroke();

    const leafGrad = ctx.createLinearGradient(0, canopyY, 0, canopyY + 40);
    leafGrad.addColorStop(0, "#a3e635");
    leafGrad.addColorStop(1, "#4d7c0f");

    if (mode === "transpiration") {
      ctx.strokeStyle = "rgba(132,204,22,0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(stemX + 8, soilY);
      ctx.lineTo(stemX + 8, canopyY + 20);
      ctx.stroke();

      const speedF = Math.min(1.5, transpRate / 4);
      if (speedF > 0.05) {
        for (let i = 0; i < 5; i++) {
          const frac = (t * speedF + i / 5) % 1;
          const sy = soilY - frac * (soilY - canopyY - 20);
          ctx.fillStyle = "rgba(132,204,22,0.9)";
          ctx.beginPath();
          ctx.arc(stemX + 8, sy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = leafGrad;
      for (let i = 0; i < 4; i++) {
        const lx = stemX + 20 + (i % 2) * 60;
        const ly = canopyY + (i % 3) * 14;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 38, 12, (i % 2 === 0 ? -0.4 : 0.4) + (i > 1 ? Math.PI * 0.02 : 0), 0, Math.PI * 2);
        ctx.fill();
      }

      const leafX = stemX + 120;
      const leafY = canopyY + 6;
      ctx.strokeStyle = "#365314";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(stemX + 30, leafY + 8);
      ctx.lineTo(leafX, leafY + 8);
      ctx.stroke();
      ctx.fillStyle = "rgba(132,204,22,0.5)";
      ctx.beginPath();
      ctx.ellipse(leafX, leafY, 34, 16, 0.5, 0, Math.PI * 2);
      ctx.fill();
      const gap = 4 + stomataOpen * 8;
      ctx.strokeStyle = "#3f6212";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leafX - gap, leafY + 4);
      ctx.lineTo(leafX + gap, leafY + 4);
      ctx.stroke();
      ctx.fillStyle = "#3f6212";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`stomata ${stomataOpen > 0.7 ? "wide open" : stomataOpen > 0.4 ? "partly open" : "nearly closed"}`, leafX - 60, leafY + 26);

      const vapor = Math.round(stomataOpen * 5);
      ctx.fillStyle = "rgba(190,242,100,0.8)";
      for (let i = 0; i < vapor; i++) {
        const sx = leafX + 10 + ((i * 23) % 60);
        const sy = leafY - 12 - ((t * (8 + i * 3)) % 40);
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#3f6212";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`rate = ${transpRate.toFixed(1)} g/h`, 40, 26);
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#4d7c0f";
      ctx.fillText(`Ψ leaf ${leafPsi.toFixed(2)} MPa · Ψ soil ${soilPsi.toFixed(2)} MPa`, 40, 44);
      ctx.fillStyle = wilting ? "#b91c1c" : "#365314";
      ctx.fillText(
        wilting ? "soil too dry — water cannot be pulled up (wilting)" : `ΔΨ ${gradPsi.toFixed(2)} MPa → water pulled up xylem`,
        40,
        62,
      );
      ctx.fillStyle = "#4d7c0f";
      ctx.fillText(`light ${light}% · ${tempC}°C · humidity ${humidity}% · wind ${wind}/5`, 40, 80);
    } else {
      ctx.strokeStyle = "rgba(250,204,21,0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(stemX - 8, soilY);
      ctx.lineTo(stemX - 8, canopyY + 16);
      ctx.stroke();

      if (sapFlow > 0.05) {
        for (let i = 0; i < 10; i++) {
          const frac = (t * Math.min(1.5, sapFlow / 3) + i / 10) % 1;
          const sy = canopyY + 16 + frac * (soilY - canopyY - 16);
          ctx.fillStyle = "rgba(250,204,21,0.95)";
          ctx.beginPath();
          ctx.arc(stemX - 8, sy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = leafGrad;
      for (let i = 0; i < 4; i++) {
        const lx = stemX + 20 + (i % 2) * 60;
        const ly = canopyY + (i % 3) * 14;
        ctx.beginPath();
        ctx.ellipse(lx, ly, 38, 12, i % 2 === 0 ? -0.4 : 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#a16207";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("leaf (source) — sucrose made here", 250, 30);
      ctx.fillStyle = "#854d0e";
      ctx.font = "12px sans-serif";
      ctx.fillText(`loading ${sugar}%`, 250, 48);
      ctx.fillStyle = "#a16207";
      ctx.fillText("root (sink) — stores or uses sugar", 250, 78);
      ctx.fillStyle = "#854d0e";
      ctx.fillText(`demand ${demand}%`, 250, 96);
      ctx.fillStyle = "#713f12";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Δp ${pressureGrad.toFixed(2)} MPa · sap ${sapFlow.toFixed(2)} g/min`, 250, 114);
      ctx.fillStyle = "#854d0e";
      ctx.fillText(`Ψ source ${phloemPsi.toFixed(2)} MPa · Ψ sink ${sinkPsi.toFixed(2)} MPa`, 250, 130);
      ctx.fillStyle = "#713f12";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(
        sapFlow > 0 ? `sap flow → leaf to root (${(sapFlow * 12).toFixed(1)} cm/min)` : "no gradient — sap flow stopped",
        250,
        150,
      );
    }
  };

  return (
    <SimShell
      icon={<span>🌿</span>}
      title={simTitle(topic, "Plant Transport")}
      subtitle={sub}
      accent={accent}
      hint={hint}
      controls={<>{topic && <SimChip accent={accent}>{topic}</SimChip>}</>}
    >
      <SimCanvas
        draw={draw}
        deps={[sim.tick, mode, sugar, demand, light, tempC, humidity, wind, speedMul, transpRate, leafPsi, soilPsi, gradPsi, wilting, sapFlow, pressureGrad, phloemPsi, sinkPsi, stomataOpen]}
      />

      <div className="mt-4">
        <RunControls
          running={sim.running}
          onToggle={sim.toggle}
          onReset={sim.reset}
          speed={speedMul}
          onSpeed={setSpeedMul}
          hex={a.hex}
          label={mode === "transpiration" ? "Water flow" : "Sugar flow"}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {mode === "transpiration" ? (
          <>
            <Slider label="Light intensity" value={light} min={0} max={100} step={1} hex={a.hex} accent={a.text} unit="%" onChange={setLight} />
            <Slider label="Temperature" value={tempC} min={5} max={45} step={1} hex={a.hex} accent={a.text} unit="°C" onChange={setTempC} />
            <Slider label="Air humidity" value={humidity} min={0} max={100} step={1} hex={a.hex} accent={a.text} unit="%" onChange={setHumidity} />
            <Slider label="Wind" value={wind} min={0} max={5} step={1} hex={a.hex} accent={a.text} unit=" /5" onChange={setWind} />
          </>
        ) : (
          <>
            <Slider label="Sucrose made in leaf (source)" value={sugar} min={10} max={100} step={1} hex={a.hex} accent={a.text} unit="%" onChange={setSugar} />
            <Slider label="Demand at root (sink)" value={demand} min={0} max={100} step={1} hex={a.hex} accent={a.text} unit="%" onChange={setDemand} />
          </>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {mode === "transpiration" ? (
          <>
            <Stat label="Transpiration rate" value={`${transpRate.toFixed(1)} g/h`} accent={a.text} />
            <Stat label="Ψ leaf" value={`${leafPsi.toFixed(2)} MPa`} accent={a.text} />
            <Stat label="Ψ soil" value={`${soilPsi.toFixed(2)} MPa`} accent={a.text} />
            <Stat label="Water pull ΔΨ" value={wilting ? "reversed" : `${gradPsi.toFixed(2)} MPa`} accent={wilting ? "text-rose-600 dark:text-rose-400" : a.text} />
          </>
        ) : (
          <>
            <Stat label="Concentration gradient" value={`${sugarGrad.toFixed(0)}%`} accent={a.text} />
            <Stat label="Pressure gradient" value={`${pressureGrad.toFixed(2)} MPa`} accent={a.text} />
            <Stat label="Sap flow rate" value={`${sapFlow.toFixed(2)} g/min`} accent={a.text} />
            <Stat label="Direction" value={sapFlow > 0 ? "leaf → root" : "slows down"} accent={a.text} />
          </>
        )}
      </div>
    </SimShell>
  );
}
