"use client";

import { useCallback, useRef, useState } from "react";
import { ai } from "@/lib/client/ai";
import type { DiagramKind, DiagramResponse } from "@/lib/ai/types";
import { GlassCard, Spinner } from "@/components/ui/GlassCard";
import {
  ArrowDownToLine,
  Check,
  Copy,
  Expand,
  GitBranch,
  GitCompare,
  LayoutList,
  Network,
  Repeat,
  Sparkles,
  TreePine,
  X,
} from "lucide-react";

const KINDS: { kind: DiagramKind; label: string; icon: React.ReactNode; desc: string }[] = [
  { kind: "flowchart", label: "Flowchart", icon: <GitBranch className="h-3.5 w-3.5" />, desc: "Process steps with decisions" },
  { kind: "concept-map", label: "Concept Map", icon: <Network className="h-3.5 w-3.5" />, desc: "Connected ideas & relationships" },
  { kind: "cycle", label: "Cycle", icon: <Repeat className="h-3.5 w-3.5" />, desc: "Repeating stages in a loop" },
  { kind: "hierarchy", label: "Hierarchy", icon: <TreePine className="h-3.5 w-3.5" />, desc: "Tree structure, parent-child" },
  { kind: "sequence", label: "Sequence", icon: <LayoutList className="h-3.5 w-3.5" />, desc: "Step-by-step interactions" },
  { kind: "comparison", label: "Comparison", icon: <GitCompare className="h-3.5 w-3.5" />, desc: "Side-by-side analysis" },
];

function sanitizeSvg(raw: string): string {
  let svg = raw.trim();
  const xmlDecl = svg.match(/<\?xml[^?]*\?>/i);
  if (xmlDecl) svg = svg.slice(xmlDecl[0].length).trim();
  const doctype = svg.match(/<!DOCTYPE[^>]*>/i);
  if (doctype) svg = svg.slice(doctype[0].length).trim();
  if (!svg.startsWith("<svg")) {
    const idx = svg.indexOf("<svg");
    if (idx !== -1) svg = svg.slice(idx);
  }
  svg = svg.replace(/<style[\s\S]*?<\/style>/gi, "");
  svg = svg.replace(/\s+style="[^"]*"/gi, "");
  return svg;
}

interface DiagramPanelProps {
  sectionTitle: string;
  text: string;
}

export function DiagramPanel({ sectionTitle, text }: DiagramPanelProps) {
  const [kind, setKind] = useState<DiagramKind>("concept-map");
  const [result, setResult] = useState<DiagramResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await ai.diagram(text, kind, sectionTitle);
      setResult(res);
    } catch {
      setError("Could not generate diagram. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [text, kind, sectionTitle]);

  const downloadSvg = useCallback(() => {
    if (!result?.svg) return;
    const clean = sanitizeSvg(result.svg);
    const blob = new Blob([clean], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sectionTitle.replace(/\s+/g, "-").toLowerCase()}-${kind}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, sectionTitle, kind]);

  const downloadPng = useCallback(() => {
    if (!result?.svg) return;
    const clean = sanitizeSvg(result.svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    const blob = new Blob([clean], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      canvas.width = img.naturalWidth * 2;
      canvas.height = img.naturalHeight * 2;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${sectionTitle.replace(/\s+/g, "-").toLowerCase()}-${kind}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [result, sectionTitle, kind]);

  const copySvg = useCallback(async () => {
    if (!result?.svg) return;
    const clean = sanitizeSvg(result.svg);
    await navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
          <Network className="h-4 w-4 text-indigo-500" />
          AI Diagram Generator
        </h3>
        {result && (
          <button
            onClick={() => setFullscreen(true)}
            className="rounded-lg p-1.5 text-foreground/50 hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10"
            title="Fullscreen"
          >
            <Expand className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-foreground/55">
        Generate visual diagrams from <span className="font-medium text-indigo-600 dark:text-indigo-400">{sectionTitle}</span>
      </p>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            onClick={() => setKind(k.kind)}
            className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2 text-center transition ${
              kind === k.kind
                ? "border-indigo-400/60 bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-400/10 dark:text-indigo-300"
                : "border-white/40 bg-white/50 text-foreground/60 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-foreground/55"
            }`}
          >
            {k.icon}
            <span className="text-[10px] font-semibold leading-tight">{k.label}</span>
            <span className="hidden text-[8px] leading-tight opacity-60 sm:block">{k.desc}</span>
          </button>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Generating\u2026" : "Generate Diagram"}
      </button>

      {error && <p className="mt-3 text-xs text-rose-500">{error}</p>}

      {result && (
        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">{result.title}</h4>
            <div className="flex items-center gap-1.5">
              <button
                onClick={copySvg}
                className="flex items-center gap-1 rounded-lg border border-indigo-300/50 bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-indigo-300"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={downloadSvg}
                className="flex items-center gap-1 rounded-lg border border-indigo-300/50 bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-indigo-300"
              >
                <ArrowDownToLine className="h-3 w-3" /> SVG
              </button>
              <button
                onClick={downloadPng}
                className="flex items-center gap-1 rounded-lg border border-indigo-300/50 bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-indigo-300"
              >
                <ArrowDownToLine className="h-3 w-3" /> PNG
              </button>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300">
                {result.mode === "online" ? result.provider : "demo"}
              </span>
            </div>
          </div>

          <GlassCard className="p-3">
            <div
              ref={svgRef}
              className="flex justify-center overflow-hidden rounded-lg bg-white [&>svg]:max-w-full [&>svg]:h-auto dark:bg-slate-50"
              dangerouslySetInnerHTML={{ __html: sanitizeSvg(result.svg) }}
            />
          </GlassCard>

          {result.description && (
            <GlassCard className="p-3">
              <p className="text-xs leading-relaxed text-foreground/70">{result.description}</p>
            </GlassCard>
          )}
        </div>
      )}

      {fullscreen && result && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-foreground">{result.title}</h4>
            <div className="flex items-center gap-2">
              <button onClick={copySvg} className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-400/10 dark:text-indigo-300">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy SVG"}
              </button>
              <button onClick={downloadSvg} className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-400/10 dark:text-indigo-300">
                <ArrowDownToLine className="h-3.5 w-3.5" /> SVG
              </button>
              <button onClick={downloadPng} className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-400/10 dark:text-indigo-300">
                <ArrowDownToLine className="h-3.5 w-3.5" /> PNG
              </button>
              <button onClick={() => setFullscreen(false)} className="rounded-lg p-1.5 text-foreground/50 hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-8">
            <div
              className="mx-auto flex max-w-3xl justify-center [&>svg]:max-w-full [&>svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: sanitizeSvg(result.svg) }}
            />
          </div>
          {result.description && (
            <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
              <p className="text-xs text-foreground/60">{result.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
