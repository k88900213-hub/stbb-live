"use client";

import { useState } from "react";
import { simTitle, SimShell, SimChip } from "./SimShell";
import { SimCanvas, Slider, Stat, Toggle } from "./simkit";

function opticsMode(topic?: string): "lens" | "eye" {
  const t = topic?.toLowerCase() ?? "";
  if (/eye/.test(t)) return "eye";
  return "lens";
}

export function OpticsSim({ topic }: { topic?: string }) {
  if (opticsMode(topic) === "eye") return <EyeView topic={topic} />;
  return <LensView topic={topic} />;
}

function EyeView({ topic }: { topic?: string }) {
  const a = "#0ea5e9";
  const at = "text-sky-600 dark:text-sky-400";
  const [focal, setFocal] = useState(150);
  const [correct, setCorrect] = useState(false);
  const retinaX = 470;
  const lensX = 300;
  const convergeX = lensX + focal;
  const defect = convergeX < retinaX - 12 ? "myopia" : convergeX > retinaX + 12 ? "hypermetropia" : "normal";
  const showFocus = correct ? retinaX : convergeX;
  const correction = defect === "myopia" ? "concave (diverging)" : "convex (converging)";

  return (
    <SimShell
      icon="👁️"
      title={simTitle(topic, "The human eye")}
      accent="sky"
      subtitle="The eye's lens focuses light onto the retina. If the focal point lands in front of or behind it, vision is blurred — and glasses fix it."
      hint="The eye changes its lens shape to focus (accommodation). Too strong a lens → light meets before the retina (myopia, fixed with a diverging lens). Too weak → meets beyond (hypermetropia, fixed with a converging lens)."
      controls={
        <>
          {topic && <SimChip accent="sky">{topic}</SimChip>}
          <Toggle label={correct ? "Glasses on" : "Add glasses"} checked={correct} onChange={setCorrect} hex={a} />
        </>
      }
    >
      <svg viewBox="0 0 640 280" className="h-56 w-full rounded-xl border border-foreground/10 bg-white/40 dark:bg-white/5">
        <ellipse cx={350} cy={140} rx={160} ry={120} fill="rgba(224,242,254,0.5)" stroke="#38bdf8" strokeWidth={4} />
        <circle cx={350} cy={140} r={24} fill="#e0f2fe" stroke="#38bdf8" strokeWidth={2} />
        <circle cx={350} cy={140} r={10} fill="#0c4a6e" />
        {correct && (
          <g transform="translate(255,140)">
            <path d="M-8,-40 Q0,-44 8,-40 Q0,-36 -8,-40 Z" fill="none" stroke="#0ea5e9" strokeWidth={3} />
            <path d="M-8,40 Q0,44 8,40 Q0,36 -8,40 Z" fill="none" stroke="#0ea5e9" strokeWidth={3} />
          </g>
        )}
        <g transform="translate(300,140)">
          <path d="M-7,-46 Q0,-50 7,-46 Q0,-42 -7,-46 Z" fill="#38bdf8" opacity={0.85} />
          <path d="M-7,46 Q0,50 7,46 Q0,42 -7,46 Z" fill="#38bdf8" opacity={0.85} />
        </g>
        <path d="M430,20 Q470,20 470,140 Q470,260 430,260" fill="none" stroke="#fbbf24" strokeWidth={6} opacity={0.8} />
        {[95, 130].map((y) => (
          <g key={y}>
            <line x1={60} y1={y} x2={300} y2={y} stroke="#fb923c" strokeWidth={2.5} />
            <line x1={300} y1={y} x2={showFocus} y2={140} stroke="#fb923c" strokeWidth={2.5} />
          </g>
        ))}
        <circle cx={showFocus} cy={140} r={7} fill={defect === "normal" ? "#059669" : "#dc2626"} />
        <text x={60} y={40} fontSize={12} fill="#0c4a6e">light from a distant object</text>
        <text x={320} y={262} textAnchor="middle" fontSize={13} fontWeight={600} fill={defect === "normal" ? "#059669" : "#dc2626"}>
          {defect === "normal" ? "normal — image exactly on the retina" : `${defect} — image ${defect === "myopia" ? "in front of" : "behind"} the retina`}
        </text>
        {defect !== "normal" && (
          <text x={320} y={245} textAnchor="middle" fontSize={11} fill="#0c4a6e">{correct ? `corrected with a ${correction} lens` : "switch on glasses to correct"}</text>
        )}
      </svg>

      <div className="mt-4">
        <Slider label="Eye lens power (focal length)" value={focal} min={120} max={190} step={2} hex={a} accent={at} unit=" px" onChange={setFocal} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Condition" value={defect} accent={at} />
        <Stat label="Retina distance" value={`${retinaX - lensX} px`} accent={at} />
      </div>
    </SimShell>
  );
}

function LensView({ topic }: { topic?: string }) {
  const a = "#0ea5e9";
  const at = "text-sky-600 dark:text-sky-400";
  const [objectDist, setObjectDist] = useState(160);
  const [objectH, setObjectH] = useState(60);
  const [focal, setFocal] = useState(90);

  const lensX = 380;
  const f = focal;
  const u = objectDist;
  const v = Math.abs(u - f) < 0.001 ? Infinity : (f * u) / (u - f);
  const mag = v === Infinity ? Infinity : Math.abs(v / u);
  const signedMag = v === Infinity ? Infinity : -v / u;
  const imageH = v === Infinity ? Infinity : mag * objectH;
  const virtual = v < 0;
  const imageType =
    u < f ? "virtual — upright, magnified" : u === f ? "no image — rays emerge parallel" : "real — inverted, on the far side";
  const lensEquation = `1/f = 1/v + 1/u → v = ${v === Infinity ? "∞" : `${v.toFixed(0)}`} px`;

  return (
    <SimShell
      icon="🔍"
      title={simTitle(topic, "Convex lens — ray diagram")}
      accent="sky"
      subtitle={
        topic
          ? `${topic} — drag the object distance and watch the image flip across the focal point.`
          : "Drag the object distance. Rays through the lens form a real image on the other side — or a virtual one behind the object."
      }
      hint="The thin-lens equation 1/f = 1/v + 1/u predicts the image distance, and magnification m = v/u its size. Move the object inside the focal point and the lens becomes a magnifying glass."
      controls={topic ? <SimChip accent="sky">{topic}</SimChip> : undefined}
    >
      <SimCanvas
        deps={[objectDist, objectH, focal]}
        draw={(ctx) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          const midY = h / 2;
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(0,0,0,0.15)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, midY);
          ctx.lineTo(w, midY);
          ctx.stroke();
          ctx.strokeStyle = "#0ea5e9";
          ctx.lineWidth = 4;
          ctx.shadowColor = "rgba(14,165,233,0.6)";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(lensX, 14);
          ctx.lineTo(lensX, h - 14);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#0ea5e9";
          ctx.beginPath();
          ctx.moveTo(lensX, 14);
          ctx.lineTo(lensX - 14, 14);
          ctx.lineTo(lensX + 14, 14);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "rgba(14,165,233,0.5)";
          ctx.beginPath();
          ctx.arc(lensX - f, midY, 3, 0, Math.PI * 2);
          ctx.arc(lensX + f, midY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(14,165,233,0.9)";
          ctx.font = "bold 11px system-ui";
          ctx.textAlign = "center";
          ctx.fillText("F", lensX - f, midY + 16);
          ctx.fillText("F", lensX + f, midY + 16);
          ctx.fillText("2F", lensX - 2 * f, midY + 16);
          ctx.fillText("2F", lensX + 2 * f, midY + 16);
          ctx.textAlign = "start";

          const objX = lensX - u;
          const objTopY = midY - objectH;
          const objGrad = ctx.createLinearGradient(0, objTopY, 0, midY);
          objGrad.addColorStop(0, "#c4b5fd");
          objGrad.addColorStop(1, "#7c3aed");
          ctx.fillStyle = objGrad;
          ctx.shadowColor = "rgba(124,58,237,0.5)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(objX - 4, objTopY, 8, objectH, 3);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#7c3aed";
          ctx.beginPath();
          ctx.moveTo(objX, objTopY);
          ctx.lineTo(objX - 5, objTopY + 8);
          ctx.lineTo(objX + 5, objTopY + 8);
          ctx.closePath();
          ctx.fill();
          ctx.font = "11px system-ui";
          ctx.fillText("object", objX - 22, objTopY - 8);
          ctx.fillStyle = "rgba(124,58,237,0.6)";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(objX, midY + 10);
          ctx.lineTo(lensX, midY + 10);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(124,58,237,0.8)";
          ctx.fillText(`u = ${u} px`, (objX + lensX) / 2 - 14, midY + 26);

          if (v !== Infinity) {
            const imgX = lensX + v;
            const imgTopY = midY + (v / u) * objectH;
            const imgBottomY = midY;
            const drawRay = (x1: number, y1: number, x2: number, y2: number, dashed: boolean, color: string) => {
              ctx.strokeStyle = color;
              ctx.lineWidth = 2.5;
              ctx.setLineDash(dashed ? [6, 5] : []);
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
              ctx.setLineDash([]);
            };
            drawRay(objX, objTopY, lensX, objTopY, false, "#fb923c");
            drawRay(lensX, objTopY, imgX, imgTopY, virtual, "#fb923c");
            drawRay(objX, objTopY, lensX, midY, false, "#14b8a6");
            drawRay(lensX, midY, imgX, imgTopY, virtual, "#14b8a6");
            if (!virtual) {
              const y3 = midY + (objectH * f) / (u - f);
              drawRay(objX, objTopY, lensX, y3, false, "#f59e0b");
              drawRay(lensX, y3, imgX, y3, false, "#f59e0b");
            }
            if (imgX > lensX + 8 && imgX < w - 8 && Math.abs(imgTopY - imgBottomY) > 2) {
              const imgGrad = ctx.createLinearGradient(0, Math.min(imgTopY, imgBottomY), 0, Math.max(imgTopY, imgBottomY));
              imgGrad.addColorStop(0, "#6ee7b7");
              imgGrad.addColorStop(1, "#059669");
              ctx.fillStyle = imgGrad;
              ctx.shadowColor = "rgba(16,185,129,0.5)";
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.roundRect(imgX - 4, Math.min(imgTopY, imgBottomY), 8, Math.abs(imgTopY - imgBottomY), 3);
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.fillStyle = "#059669";
              ctx.font = "11px system-ui";
              ctx.fillText("image", Math.min(imgX, w - 60), Math.min(imgTopY, imgBottomY) - 8);
            }
            if (!virtual && imgX > lensX) {
              ctx.fillStyle = "rgba(16,185,129,0.7)";
              ctx.font = "11px system-ui";
              ctx.setLineDash([4, 4]);
              ctx.strokeStyle = "rgba(16,185,129,0.45)";
              ctx.beginPath();
              ctx.moveTo(lensX, midY - 10);
              ctx.lineTo(Math.min(imgX, w - 10), midY - 10);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.fillText(`v = ${v.toFixed(0)} px`, Math.min(lensX + (imgX - lensX) / 2 - 14, w - 120), midY - 16);
            } else if (virtual) {
              ctx.fillStyle = "rgba(16,185,129,0.7)";
              ctx.font = "11px system-ui";
              ctx.fillText(`virtual image at v = ${v.toFixed(0)} px (dashed)`, 12, 22);
            }
          } else {
            ctx.fillStyle = "rgba(16,185,129,0.8)";
            ctx.font = "bold 12px system-ui";
            ctx.fillText("object at the focal point — rays emerge parallel", 12, 22);
          }
        }}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label="Object distance (u)" value={objectDist} min={60} max={340} step={5} hex={a} accent={at} unit=" px" onChange={setObjectDist} />
        <Slider label="Object height" value={objectH} min={30} max={100} step={5} hex={a} accent={at} unit=" px" onChange={setObjectH} />
        <Slider label="Focal length (f)" value={focal} min={50} max={160} step={5} hex={a} accent={at} unit=" px" onChange={setFocal} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Lens equation" value={lensEquation} accent={at} />
        <Stat label="Magnification" value={v === Infinity ? "—" : `m = v/u = ${signedMag.toFixed(2)}×`} accent={at} />
        <Stat label="Image height" value={v === Infinity ? "—" : `${imageH.toFixed(0)} px (${virtual ? "upright" : "inverted"})`} accent={at} />
        <Stat label="Image" value={imageType} accent={at} />
      </div>
    </SimShell>
  );
}
