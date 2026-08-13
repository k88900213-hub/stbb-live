"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Chapter } from "@/lib/content/types";
import { useImportedLibrary } from "@/lib/import/store";
import { countWords } from "@/lib/import/parser";
import {
  extractPdfText,
  getAiStatus,
  ocrImage,
  type AiStatus,
  type OcrLanguage,
} from "@/lib/import/extract";
import { GlassCard, Spinner } from "@/components/ui/GlassCard";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  FileUp,
  Image as ImageIcon,
  MousePointerClick,
  ScanText,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";

type Step = "source" | "convert" | "preview";
type SourceTab = "text" | "image" | "pdf";

const LANG_LABELS: Record<OcrLanguage, string> = {
  eng: "English",
  deu: "German",
  fra: "French",
  spa: "Spanish",
  hin: "Hindi",
  ara: "Arabic",
  chi_sim: "Chinese (simplified)",
};

export function ImportStudio() {
  const router = useRouter();
  const { addEntry, entries, removeEntry } = useImportedLibrary();

  const [step, setStep] = useState<Step>("source");
  const [tab, setTab] = useState<SourceTab>("text");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [rawText, setRawText] = useState("");
  const [status, setStatus] = useState<AiStatus>({ configured: false, provider: null, model: null });
  const [ocrLang, setOcrLang] = useState<OcrLanguage>("eng");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ chapter: Chapter; mode: string; provider: string } | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getAiStatus().then(setStatus);
  }, []);

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(typeof reader.result === "string" ? reader.result : null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleOcr = async () => {
    if (!imagePreview) return;
    setWorking(true);
    setBusyLabel(
      status.configured
        ? `Running ${status.provider} vision OCR…`
        : "Running Tesseract.js OCR (first run downloads language data)…",
    );
    setError(null);
    try {
      const text = await ocrImage(imagePreview, status, ocrLang);
      if (!text.trim()) throw new Error("No text detected in the image. Try a clearer photo or a different language.");
      setRawText(text);
      setStep("convert");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR failed");
    } finally {
      setWorking(false);
      setBusyLabel("");
    }
  };

  const handlePdf = async (file: File) => {
    setWorking(true);
    setBusyLabel("Extracting text from PDF…");
    setError(null);
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) throw new Error("No selectable text found in this PDF (it may be a scanned image).");
      setRawText(text);
      setStep("convert");
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF extraction failed");
    } finally {
      setWorking(false);
      setBusyLabel("");
    }
  };

  const startConvert = () => {
    if (!rawText.trim()) {
      setError("Nothing to convert yet — paste notes, OCR a photo, or drop a PDF.");
      return;
    }
    setStep("convert");
  };

  const handleConvert = async () => {
    setWorking(true);
    setBusyLabel("Structuring into an interactive chapter…");
    setError(null);
    try {
      const res = await fetch("/api/ai/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, title, subject }),
      });
      const data = await res.json();
      if (!res.ok || !data.chapter) throw new Error(data.error ?? "Conversion failed");
      setResult({ chapter: data.chapter, mode: data.mode, provider: data.provider });
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setWorking(false);
      setBusyLabel("");
    }
  };

  const handleSave = () => {
    if (!result) return;
    const entry = addEntry(result.chapter, tab === "text" ? "text" : tab === "image" ? "image" : "pdf", countWords(rawText));
    router.push(`/read/custom/${entry.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/50 bg-white/60 px-4 py-1.5 text-xs font-semibold text-orange-700 backdrop-blur dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300">
          <Wand2 className="h-3.5 w-3.5" />
          Import Studio
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
          Turn your notes into a <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">live chapter</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-foreground/60">
          Paste text, upload a <strong>photo of a book page</strong>, or drop a PDF. The system
          converts it into the same interactive format — every paragraph gets AI explanation, asking,
          translation, quizzes, notes and flashcards.
        </p>
      </header>

      {step === "source" && (
        <GlassCard className="p-5">
          <div className="mb-4 grid grid-cols-3 gap-2">
            {(
              [
                { id: "text", label: "Paste text", icon: <FileText className="h-4 w-4" /> },
                { id: "image", label: "Book photo", icon: <ImageIcon className="h-4 w-4" /> },
                { id: "pdf", label: "PDF", icon: <FileUp className="h-4 w-4" /> },
              ] as { id: SourceTab; label: string; icon: React.ReactNode }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  tab === t.id
                    ? "border-orange-400/60 bg-orange-50 text-orange-700 shadow-sm dark:bg-orange-400/10 dark:text-orange-300"
                    : "border-white/40 bg-white/50 text-foreground/65 hover:bg-white/80 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {tab === "text" && (
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={12}
              placeholder={"Paste your book notes here…\n\nExample:\nNewton's Second Law\nForce equals mass times acceleration.\nF = m × a\n- More force means more acceleration\n- More mass means less acceleration"}
              className="w-full rounded-xl border border-white/50 bg-white/70 p-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-foreground/35 focus:border-orange-400 dark:border-white/10 dark:bg-white/5"
            />
          )}

          {tab === "image" && (
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-orange-400/50 bg-orange-50/50 px-4 py-2.5 text-sm font-medium text-orange-700 transition hover:bg-orange-100/60 dark:border-orange-400/25 dark:bg-orange-400/5 dark:text-orange-300"
                >
                  <ImageIcon className="h-4 w-4" />
                  {imagePreview ? "Choose another photo" : "Upload book photo"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0])}
                />
                <label className="flex items-center gap-2 text-sm text-foreground/60">
                  OCR language
                  <select
                    value={ocrLang}
                    onChange={(e) => setOcrLang(e.target.value as OcrLanguage)}
                    className="rounded-lg border border-white/50 bg-white/70 px-2 py-1.5 text-sm text-foreground outline-none focus:border-orange-400 dark:border-white/10 dark:bg-white/5"
                  >
                    {Object.entries(LANG_LABELS).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>

              {imagePreview && (
                <div className="mt-3 flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Book page preview" className="h-48 w-36 rounded-xl border border-white/50 object-cover shadow dark:border-white/10" />
                  <div className="flex-1">
                    <p className="text-xs text-foreground/55">
                      {status.configured
                        ? `Using ${status.provider} vision (${status.model}) to read the page.`
                        : "No AI key set — using Tesseract.js in your browser. Sharper, clearer photos give better results."}
                    </p>
                    <button
                      onClick={handleOcr}
                      disabled={working}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 disabled:opacity-50"
                    >
                      {working ? <Spinner className="h-4 w-4" /> : <ScanText className="h-4 w-4" />}
                      Read & extract text
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "pdf" && (
            <div>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-orange-400/50 bg-orange-50/40 px-4 py-10 text-center transition hover:bg-orange-100/50 dark:border-orange-400/25 dark:bg-orange-400/5">
                <FileUp className="h-8 w-8 text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Drop a PDF book chapter here</span>
                <span className="text-xs text-foreground/45">Text-based PDFs only (scanned pages need the photo OCR tab)</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePdf(e.target.files[0])}
                />
              </label>
            </div>
          )}

          {tab === "text" && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional title (e.g. Chapter 4 – Thermodynamics)"
                className="min-w-0 flex-1 rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-orange-400 dark:border-white/10 dark:bg-white/5"
              />
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject (e.g. Physics)"
                className="w-40 rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-orange-400 dark:border-white/10 dark:bg-white/5"
              />
              <button
                onClick={startConvert}
                disabled={!rawText.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 disabled:opacity-50"
              >
                Convert to live chapter
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </GlassCard>
      )}

      {step === "convert" && (
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Step 2 · Extracted text
            </h2>
            <span className="text-xs text-foreground/50">{countWords(rawText)} words</span>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={14}
            className="w-full rounded-xl border border-white/50 bg-white/70 p-3 text-sm leading-relaxed text-foreground outline-none focus:border-orange-400 dark:border-white/10 dark:bg-white/5"
          />
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setStep("source")}
              className="rounded-xl border border-white/50 bg-white/60 px-4 py-2.5 text-sm font-medium text-foreground/70 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5"
            >
              ← Back
            </button>
            <button
              onClick={handleConvert}
              disabled={working || !rawText.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 disabled:opacity-50"
            >
              {working ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {working ? busyLabel : "Structure into a live chapter"}
            </button>
          </div>
        </GlassCard>
      )}

      {step === "preview" && result && (
        <GlassCard className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">{result.chapter.title}</h2>
              <p className="mt-1 text-xs text-foreground/55">
                {result.chapter.sections.length} sections · {result.chapter.sections.reduce((s, sec) => s + sec.blocks.length, 0)} blocks ·{" "}
                {result.chapter.keywords.length} keywords ·{" "}
                <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-700 dark:bg-orange-400/15 dark:text-orange-300">
                  {result.mode === "online" ? result.provider : "offline demo"}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep("convert")} className="rounded-xl border border-white/50 bg-white/60 px-3 py-2 text-sm font-medium text-foreground/70 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5">
                Edit text
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110"
              >
                <Check className="h-4 w-4" /> Save & open
              </button>
            </div>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
            {result.chapter.sections.map((sec, si) => (
              <div key={sec.id}>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-100 text-[10px] font-bold text-orange-700 dark:bg-orange-400/15 dark:text-orange-300">
                    {si + 1}
                  </span>
                  {sec.title}
                </div>
                <div className="mt-1.5 space-y-1">
                  {sec.blocks.map((b, bi) => (
                    <div key={bi} className="flex items-start gap-2 text-xs text-foreground/70">
                      <Badge type={b.type} />
                      <span className="line-clamp-1">
                        {b.type === "formula" ? b.formula : b.content}
                        {b.type === "list" ? ` (${b.items?.length ?? 0} items)` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-foreground/50">
            <MousePointerClick className="h-3.5 w-3.5" />
            Every block below becomes interactive in the reader — hover a paragraph to explain, ask, translate or listen.
          </p>
        </GlassCard>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-rose-300/60 bg-rose-50/70 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/5 dark:text-rose-300">
          {error}
        </p>
      )}

      {busyLabel && step === "convert" && working && (
        <p className="mt-3 flex items-center gap-2 text-xs text-foreground/50">
          <Spinner className="h-3.5 w-3.5" /> {busyLabel}
        </p>
      )}

      {entries.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <BookOpen className="h-5 w-5 text-orange-500" />
            My imported chapters
          </h2>
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/read/custom/${e.id}`} className="truncate text-sm font-semibold text-foreground hover:text-orange-600 dark:hover:text-orange-400">
                      {e.info.title}
                    </Link>
                    <SourceBadge type={e.info.sourceType} />
                  </div>
                  <p className="mt-0.5 text-xs text-foreground/50">
                    {e.chapter.sections.length} sections · {e.info.wordCount} words ·{" "}
                    {new Date(e.info.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={`/read/custom/${e.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow shadow-orange-500/30 transition hover:brightness-110">
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button onClick={() => removeEntry(e.id)} className="rounded-xl border border-white/50 bg-white/60 p-1.5 text-foreground/50 transition hover:text-rose-500 dark:border-white/10 dark:bg-white/5" aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Badge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    heading: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
    paragraph: "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300",
    formula: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
    list: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    callout: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  };
  return (
    <span className={`w-16 shrink-0 rounded-md px-1.5 py-0.5 text-center text-[10px] font-semibold uppercase ${styles[type] ?? "bg-white/40 text-foreground/50"}`}>
      {type}
    </span>
  );
}

function SourceBadge({ type }: { type: string }) {
  const label = type === "image" ? "Photo" : type === "pdf" ? "PDF" : "Text";
  return (
    <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium text-foreground/55 dark:bg-white/10">
      {label}
    </span>
  );
}
