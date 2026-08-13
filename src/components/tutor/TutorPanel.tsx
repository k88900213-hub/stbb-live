"use client";

import { useEffect, useRef, useState } from "react";
import { ai } from "@/lib/client/ai";
import type { LanguageCode } from "@/lib/ai/types";
import { useProgress } from "@/store/progress";
import { Send, Sparkles, Square, X } from "lucide-react";

interface TutorPanelProps {
  chapterSlug: string;
  chapterTitle: string;
  sectionTitle: string;
  excerpt: string;
  onClose: () => void;
  prefill?: { text: string; at: number } | null;
  language?: LanguageCode;
  onLanguageChange?: (l: LanguageCode) => void;
}

const QUICK_PROMPTS = [
  "Summarize what I just read",
  "Quiz me on this section",
  "Explain like I'm 10",
  "What are my weak topics?",
  "Make flashcards for this",
];

export function TutorPanel({ chapterSlug, chapterTitle, sectionTitle, excerpt, onClose, prefill, language, onLanguageChange }: TutorPanelProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { recordAsk, getChapter, snapshot } = useProgress();
  const [providerBadge, setProviderBadge] = useState<{ mode: string; provider: string } | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const updateLastAssistant = (update: (content: string) => string) => {
    setMessages((prev) => {
      const next = [...prev];
      const i = next.length - 1;
      if (i >= 0 && next[i].role === "assistant") {
        next[i] = { ...next[i], content: update(next[i].content) };
      } else {
        next.push({ role: "assistant", content: update("") });
      }
      return next;
    });
  };

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    const history = [...messages, { role: "user" as const, content: q }];
    setMessages(history);
    setLoading(true);
    recordAsk(chapterSlug);
    const abort = new AbortController();
    abortRef.current = abort;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    try {
      const res = await ai.tutorStream(
        history,
        { chapterTitle, sectionTitle, excerpt },
        language,
        (token) => updateLastAssistant((c) => c + token),
        abort.signal,
      );
      setProviderBadge({ mode: res.mode, provider: res.provider });
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        updateLastAssistant(() => "Sorry, I could not reach the AI engine. Try again in a moment.");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  useEffect(() => {
    if (prefill && prefill.at > 0) {
      const t = setTimeout(() => send(prefill.text), 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.at]);

  const stats = getChapter(chapterSlug);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-white/40 px-4 py-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground">Neural Tutor</div>
            <div className="text-[11px] text-foreground/50">
              {providerBadge ? `${providerBadge.provider} · ${providerBadge.mode}` : "Personal AI teacher"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onLanguageChange && (
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="rounded-lg border border-white/40 bg-white/60 px-1.5 py-1 text-[11px] text-foreground/70 outline-none dark:border-white/10 dark:bg-white/5"
              title="Tutor reply language"
            >
              <option value="en">EN</option>
              <option value="ur">اردو</option>
              <option value="ar">ع</option>
              <option value="de">DE</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="hi">हिं</option>
              <option value="zh">中</option>
            </select>
          )}
          <button onClick={onClose} className="rounded-lg p-1.5 text-foreground/50 transition hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10" aria-label="Close tutor">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-white/30 px-4 py-2 text-[11px] text-foreground/50 dark:border-white/10">
        <span>Asks: {stats.asks}</span>
        <span className="h-1 w-1 rounded-full bg-foreground/30" />
        <span>Chapter score: {stats.quizScores.at(-1)?.pct ?? "—"}%</span>
        <span className="h-1 w-1 rounded-full bg-foreground/30" />
        <span>Mastery: {snapshot.conceptsMastered}</span>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-white/40 bg-white/50 p-4 text-sm leading-relaxed text-foreground/70 dark:border-white/10 dark:bg-white/5">
            <p className="mb-2 font-semibold text-foreground">Hi! I&apos;m your AI tutor for <span className="text-orange-600 dark:text-orange-400">{chapterTitle}</span>.</p>
            <p>Ask me anything about this chapter, tell me to quiz you, or say <em>&quot;explain like I&apos;m 10&quot;</em> for a simpler take. I remember your progress in this session.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "ml-8" : "mr-4"}>
            <div
              className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "border border-white/40 bg-white/70 text-foreground/85 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              {m.content || <TypingDots />}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/40 p-3 dark:border-white/10">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full border border-orange-300/40 bg-orange-50/60 px-2.5 py-1 text-[11px] text-orange-700 transition hover:bg-orange-100 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300 dark:hover:bg-orange-400/20"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask your tutor anything…"
            className="w-full rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm text-foreground outline-none placeholder:text-foreground/40 focus:border-orange-400 dark:border-white/10 dark:bg-white/5"
          />
          {loading ? (
            <button
              onClick={stop}
              className="rounded-xl bg-foreground/80 px-4 py-2 text-white shadow-lg transition hover:bg-foreground"
              aria-label="Stop generating"
              title="Stop"
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}
