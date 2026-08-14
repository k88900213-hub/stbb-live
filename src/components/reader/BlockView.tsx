"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ai, type ExplainMode, type LanguageCode } from "@/lib/client/ai";
import type { AskResponse, ExplainResponse } from "@/lib/ai/types";
import type { Block } from "@/lib/content/types";
import { RichText } from "@/lib/reader/render";
import { useProgress } from "@/store/progress";
import { useSpeech } from "@/hooks/useSpeech";
import { useNotes } from "@/hooks/useNotes";
import { AiExplainCard } from "./AiExplainCard";
import FormulaBlock from "./FormulaBlock";
import { GlassCard, Spinner } from "@/components/ui/GlassCard";
import { SimLab } from "@/components/sim/SimLab";
import {
  BookOpen,
  Check,
  Languages,
  Loader2,
  MessageCircleQuestion,
  Play,
  Save,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو (Urdu)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "zh", label: "中文 (Chinese)" },
];

const ASK_SUGGESTIONS = [
  "What does this mean?",
  "Explain in Urdu",
  "Explain like I'm 10",
  "Give an example",
  "Explain mathematically",
];

interface BlockViewProps {
  block: Block;
  chapterSlug: string;
  chapterTitle: string;
  sectionTitle: string;
  mode?: ExplainMode;
  audience?: string;
}

export function BlockView({ block, chapterSlug, chapterTitle, sectionTitle, mode = "intermediate", audience }: BlockViewProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { recordView, recordAsk, recordNote } = useProgress();
  const { supported, speaking, speak, stop } = useSpeech();
  const { addNote } = useNotes();
  const [saved, setSaved] = useState(false);

  const [explain, setExplain] = useState<ExplainResponse | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [askInput, setAskInput] = useState("");
  const [askResult, setAskResult] = useState<AskResponse | null>(null);
  const [asking, setAsking] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [translateResult, setTranslateResult] = useState<{ translatedText: string; mode: string } | null>(null);
  const [translating, setTranslating] = useState(false);
  const [transLang, setTransLang] = useState<LanguageCode>("ur");

  const text = block.content ?? "";

  useEffect(() => {
    const el = ref.current;
    if (!el || block.type !== "paragraph") return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) recordView(chapterSlug, block.id);
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [block.id, block.type, chapterSlug, recordView]);

  const handleExplain = async () => {
    setExplain(null);
    setExplaining(true);
    try {
      const res = await ai.explain(text, mode, audience);
      setExplain(res);
    } finally {
      setExplaining(false);
    }
  };

  const handleAsk = async () => {
    const q = askInput.trim();
    if (!q) return;
    setAsking(true);
    setAskResult({ answer: "", mode: "offline", provider: "Demo Engine" });
    recordAsk(chapterSlug);
    try {
      const res = await ai.askStream(text, q, { chapterTitle, sectionTitle }, (token) => {
        setAskResult((prev) => (prev ? { ...prev, answer: prev.answer + token } : prev));
      });
      setAskResult({ answer: res.answer, mode: res.mode, provider: res.provider });
    } catch {
      setAskResult({ answer: "Sorry, I could not reach the AI engine. Try again in a moment.", mode: "offline", provider: "Demo Engine" });
    } finally {
      setAsking(false);
    }
  };

  const handleTranslate = async () => {
    setTranslating(true);
    setTranslateResult(null);
    try {
      const res = await ai.translate(text, transLang);
      setTranslateResult(res);
    } finally {
      setTranslating(false);
    }
  };

  const handleSaveNote = () => {
    addNote(chapterSlug, sectionTitle, text);
    recordNote(chapterSlug);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  if (block.type === "heading") {
    return (
      <h3 className="mt-10 mb-3 text-xl font-semibold text-foreground sm:text-2xl">
        <RichText>{block.content ?? ""}</RichText>
      </h3>
    );
  }

  if (block.type === "formula") {
    return (
      <figure className="my-5">
        <FormulaBlock tex={block.formula ?? ""} />
        {block.caption && (
          <figcaption className="mt-2 text-center text-xs text-foreground/50">{block.caption}</figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "callout") {
    const styles = {
      info: "border-sky-300/50 bg-sky-50/70 text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/5 dark:text-sky-200",
      tip: "border-emerald-300/50 bg-emerald-50/70 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/5 dark:text-emerald-200",
      warning: "border-amber-300/60 bg-amber-50/70 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/5 dark:text-amber-200",
      key: "border-orange-300/60 bg-gradient-to-r from-orange-50/90 to-amber-50/70 text-orange-900 dark:border-orange-400/25 dark:from-orange-400/10 dark:to-amber-400/5 dark:text-orange-100",
    }[block.variant ?? "info"];
    return (
      <div className={`my-5 rounded-xl border-l-4 px-4 py-3 text-[15px] leading-relaxed ${styles}`}>
        <RichText>{text}</RichText>
      </div>
    );
  }

  if (block.type === "list") {
    return (
      <div className="my-4">
        {text && <p className="mb-2 font-medium text-foreground/85"><RichText>{text}</RichText></p>}
        <ul className="ml-5 list-disc space-y-1.5 text-[15px] leading-relaxed text-foreground/80 marker:text-orange-400">
          {block.items?.map((item, i) => (
            <li key={i}><RichText>{item}</RichText></li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.type === "simulation") {
    return (
      <div className="my-6">
        <SimLab kind={block.sim ?? "forces"} topic={block.topic} />
        {block.caption && <p className="mt-2 text-center text-xs text-foreground/50">{block.caption}</p>}
      </div>
    );
  }

  if (block.type === "figure") {
    const src = block.src ?? "";
    return (
      <figure className="my-5 overflow-hidden rounded-2xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={block.caption ?? "Figure"}
            loading="lazy"
            className="mx-auto max-h-96 w-auto max-w-full rounded-xl"
          />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100/60 to-amber-100/40 text-orange-300 dark:from-orange-400/10 dark:to-transparent">
            <BookOpen className="h-12 w-12" />
          </div>
        )}
        {block.caption && <figcaption className="mt-2 text-center text-xs text-foreground/50">{block.caption}</figcaption>}
      </figure>
    );
  }

  // paragraph
  return (
    <div
      ref={ref}
      className="group relative my-4 scroll-mt-28 rounded-xl px-1 py-1 transition-colors hover:bg-orange-50/40 dark:hover:bg-white/[0.03]"
    >
      <p className="text-[16px] leading-[1.85] text-foreground/85">
        <RichText>{text}</RichText>
      </p>

      {/* hover action bar */}
      <div className="mt-2 hidden items-center gap-1.5 group-hover:flex">
        <ActionButton onClick={handleExplain} active={!!explain} label="Explain" icon={explaining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} />
        <ActionButton onClick={() => setAskOpen((o) => !o)} active={askOpen} label="Ask AI" icon={<MessageCircleQuestion className="h-3.5 w-3.5" />} />
        <ActionButton onClick={() => setTranslateOpen((o) => !o)} active={translateOpen} label="Translate" icon={<Languages className="h-3.5 w-3.5" />} />
        {supported && (
          <ActionButton
            onClick={() => (speaking ? stop() : speak(text))}
            active={speaking}
            label={speaking ? "Stop" : "Listen"}
            icon={speaking ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          />
        )}
        <ActionButton onClick={handleSaveNote} active={saved} label={saved ? "Saved" : "Save note"} icon={saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />} />
        <ActionButton
          onClick={() => speak(text)}
          label="Read aloud"
          icon={<Play className="h-3.5 w-3.5" />}
          subtle
        />
      </div>

      {explaining && (
        <div className="mt-3 flex items-center gap-2 text-sm text-foreground/50">
          <Spinner /> Generating {mode} explanation…
        </div>
      )}
      {explain && <AiExplainCard result={explain} />}

      {askOpen && (
        <GlassCard className="mt-3 p-3">
          <div className="flex flex-wrap gap-1.5 pb-2">
            {ASK_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setAskInput(s)}
                className="rounded-full border border-orange-300/40 bg-orange-50/60 px-2.5 py-1 text-xs text-orange-700 transition hover:bg-orange-100 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300 dark:hover:bg-orange-400/20"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask anything about this paragraph…"
              className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/40 focus:border-orange-400 dark:border-white/10 dark:bg-white/5"
            />
            <button
              onClick={handleAsk}
              disabled={asking || !askInput.trim()}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 disabled:opacity-50"
            >
              {asking ? <Spinner className="h-4 w-4" /> : "Ask"}
            </button>
          </div>
          {askResult && (
            <div className="mt-3 rounded-xl bg-orange-50/60 p-3 text-sm leading-relaxed text-foreground/80 dark:bg-white/5">
              {askResult.answer}
              {asking && <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-orange-500 align-middle" />}
            </div>
          )}
        </GlassCard>
      )}

      {translateOpen && (
        <GlassCard className="mt-3 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={transLang}
              onChange={(e) => setTransLang(e.target.value as LanguageCode)}
              className="rounded-xl border border-white/50 bg-white/70 px-2 py-1.5 text-sm text-foreground outline-none focus:border-orange-400 dark:border-white/10 dark:bg-white/5"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 disabled:opacity-50"
            >
              {translating ? <Spinner className="h-4 w-4" /> : "Translate"}
            </button>
          </div>
          {translateResult && (
            <div className="mt-3 rounded-xl bg-orange-50/60 p-3 text-sm leading-relaxed text-foreground/80 dark:bg-white/5">
              {translateResult.translatedText}
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  active,
  label,
  icon,
  subtle,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  icon: ReactNode;
  subtle?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition ${subtle ? "text-foreground/45 hover:text-foreground/80" : active ? "bg-orange-500 text-white shadow shadow-orange-500/30" : "bg-white/70 text-foreground/60 shadow-sm hover:bg-orange-100 hover:text-orange-700 dark:bg-white/5 dark:hover:bg-white/10"}`}
    >
      {icon}
      {label}
    </button>
  );
}
