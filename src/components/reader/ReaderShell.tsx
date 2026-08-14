"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Chapter, Section } from "@/lib/content/types";
import { getChapterIndex } from "@/lib/content/catalog";
import type { LanguageCode } from "@/lib/ai/types";
import { useProgress } from "@/store/progress";
import { cn } from "@/lib/utils/cn";
import { BlockView } from "./BlockView";
import { ChapterNav } from "./ChapterNav";
import { TutorPanel } from "@/components/tutor/TutorPanel";
import { NotesPanel } from "@/components/tools/NotesPanel";
import { QuizPanel } from "@/components/tools/QuizPanel";
import { FlashcardsPanel } from "@/components/tools/FlashcardsPanel";
import { DiagramPanel } from "@/components/tools/DiagramPanel";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Gauge,
  Lightbulb,
  Menu,
  MessageSquareText,
  Network,
  Search,
  Sparkles,
  StickyNote,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

type Panel = "tutor" | "notes" | "quiz" | "cards" | "dashboard" | "diagram" | null;

interface ReaderShellProps {
  chapter: Chapter;
  navChapters?: Chapter[];
  chapterPosition?: number;
  navLabel?: string;
  isCustomChapter?: boolean;
}

export function ReaderShell({ chapter, navChapters, chapterPosition, navLabel, isCustomChapter }: ReaderShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [searchText, setSearchText] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(chapter.sections[0]?.id ?? null);
  const [selection, setSelection] = useState<string | null>(null);
  const [selectionPos, setSelectionPos] = useState<{ x: number; y: number } | null>(null);
  const [prefill, setPrefill] = useState<{ text: string; at: number } | null>(null);
  const [panelLanguage, setPanelLanguage] = useState<LanguageCode>("en");

  const contentRef = useRef<HTMLDivElement | null>(null);
  const { setActiveChapter, getChapter, snapshot } = useProgress();
  const chapterIndex = chapterPosition ?? getChapterIndex(chapter.slug);
  const chapterProgress = getChapter(chapter.slug);
  const isCustom = isCustomChapter ?? chapterIndex === -1;

  useEffect(() => {
    setActiveChapter(chapter.slug);
    return () => setActiveChapter(null);
  }, [chapter.slug, setActiveChapter]);

  // resume where the reader left off
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const key = `ns-scroll-${chapter.slug}`;
    try {
      const saved = Number(localStorage.getItem(key));
      if (saved > 0 && saved < el.scrollHeight - el.clientHeight - 10) {
        el.scrollTop = saved;
      }
    } catch {
      /* ignore */
    }
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        try {
          localStorage.setItem(key, String(el.scrollTop));
        } catch {
          /* ignore */
        }
      }, 350);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, [chapter.slug]);

  // whole-chapter read aloud
  const [listening, setListening] = useState(false);

  const chapterAudio = useMemo(
    () =>
      chapter.sections
        .map(
          (s) =>
            `${s.title}. ${s.blocks
              .map((b) =>
                b.type === "list"
                  ? (b.items ?? []).join(", ")
                  : b.content ?? b.formula ?? "",
              )
              .filter(Boolean)
              .join(" ")}`,
        )
        .join(". "),
    [chapter],
  );

  const stopListening = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setListening(false);
  }, []);

  const toggleListen = useCallback(() => {
    if (listening) {
      stopListening();
      return;
    }
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const clean = chapterAudio
      .replace(/[#*$`[\]]/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 6000);
    const parts = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (!parts.length) return;
    let i = 0;
    const step = () => {
      if (i >= parts.length) {
        setListening(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(parts[i++]);
      u.lang = "en-US";
      u.rate = 0.97;
      u.onend = () => step();
      u.onerror = () => step();
      window.speechSynthesis.speak(u);
    };
    setListening(true);
    step();
  }, [listening, chapterAudio, stopListening]);

  useEffect(() => stopListening, [stopListening]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const sections = el.querySelectorAll<HTMLElement>("[data-section]");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.2) {
            setActiveSectionId(e.target.getAttribute("data-section"));
          }
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0.1 },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [chapter.slug]);

  const handleMouseUp = (e: React.MouseEvent) => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 0 && sel.length <= 300) {
      setSelection(sel);
      setSelectionPos({ x: e.clientX, y: e.clientY - 20 });
    } else {
      setSelection(null);
      setSelectionPos(null);
    }
  };

  const askSelection = () => {
    if (!selection) return;
    setPrefill({ text: `Explain this selected text: "${selection}"`, at: Date.now() });
    setSelection(null);
    setSelectionPos(null);
    setPanel("tutor");
  };

  const currentSection = useMemo<Section>(() => {
    return (
      chapter.sections.find((s) => s.id === activeSectionId) ?? chapter.sections[0]
    );
  }, [chapter.sections, activeSectionId]);

  const excerpt = useMemo(
    () =>
      currentSection.blocks
        .filter((b) => b.type === "paragraph" || b.type === "callout" || b.type === "list")
        .map((b) => [b.content, b.items?.join(" ")].filter(Boolean).join(" "))
        .join(" "),
    [currentSection],
  );

  const matches = useMemo(() => {
    if (!searchText.trim()) return [];
    const q = searchText.toLowerCase();
    const ids: string[] = [];
    for (const sec of chapter.sections) {
      for (const b of sec.blocks) {
        if (b.content?.toLowerCase().includes(q)) ids.push(b.id);
      }
    }
    return ids;
  }, [chapter, searchText]);
  const matchIndex = useRef(0);

  const jumpToMatch = (dir: 1 | -1) => {
    if (matches.length === 0) return;
    matchIndex.current = (matchIndex.current + dir + matches.length) % matches.length;
    document
      .getElementById(`block-${matches[matchIndex.current]}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSectionId(id);
    setNavOpen(false);
  };

  const panelMeta: { title: string; icon: React.ReactNode } | null = panel
    ? {
        tutor: { title: "AI Tutor", icon: <MessageSquareText className="h-4 w-4" /> },
        notes: { title: "Note Generator", icon: <Lightbulb className="h-4 w-4" /> },
        quiz: { title: "Quiz Engine", icon: <Gauge className="h-4 w-4" /> },
        cards: { title: "Flashcards", icon: <StickyNote className="h-4 w-4" /> },
        dashboard: { title: "Progress", icon: <BarChart3 className="h-4 w-4" /> },
        diagram: { title: "Diagram Generator", icon: <Network className="h-4 w-4" /> },
      }[panel]
    : null;

  return (
    <div className="flex h-screen overflow-hidden">
      <ChapterNav
        activeSlug={chapter.slug}
        activeSectionId={activeSectionId}
        onNavigate={scrollToSection}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        customTitle={isCustom ? chapter.title : undefined}
        customSections={isCustom ? chapter.sections : undefined}
        chapters={navChapters}
        bookLabel={navLabel}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* toolbar */}
        <header className="flex items-center gap-2 border-b border-white/40 bg-white/60 px-3 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#120c08]/70">
          <button
            onClick={() => setNavOpen(true)}
            className="rounded-lg p-1.5 text-foreground/60 transition hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] text-foreground/45">
              <span className="hidden sm:inline">{chapter.subject}</span>
              <ChevronRight className="hidden h-3 w-3 sm:inline" />
              <span>
                {isCustom
                  ? "Imported chapter"
                  : `Chapter ${chapterIndex + 1} of ${(navChapters ?? []).length || getChapterIndex(chapter.slug) + 1}`}
              </span>
            </div>
            <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">{chapter.title}</h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40" />
              <input
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  matchIndex.current = 0;
                }}
                onKeyDown={(e) => e.key === "Enter" && jumpToMatch(1)}
                placeholder="Search chapter…"
                className="w-40 rounded-full border border-white/50 bg-white/60 py-1.5 pl-8 pr-8 text-xs text-foreground outline-none placeholder:text-foreground/35 focus:border-orange-400 focus:w-52 dark:border-white/10 dark:bg-white/5"
              />
              {matches.length > 0 && (
                <>
                  <button onClick={() => jumpToMatch(-1)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                    ↑
                  </button>
                  <button onClick={() => jumpToMatch(1)} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                    ↓
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setPanel(panel === "dashboard" ? null : "dashboard")}
              className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition", panel === "dashboard" ? "border-orange-400/60 bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300" : "border-white/50 bg-white/60 text-foreground/60 hover:bg-white/80 dark:border-white/10 dark:bg-white/5")}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Progress {snapshot.focusLevel}%</span>
            </button>

            <button
              onClick={toggleListen}
              title={listening ? "Stop reading aloud" : "Read chapter aloud"}
              className={cn(
                "rounded-xl border px-2.5 py-2 transition",
                listening
                  ? "border-orange-400/60 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30"
                  : "border-white/50 bg-white/60 text-foreground/60 hover:bg-white/80 dark:border-white/10 dark:bg-white/5",
              )}
            >
              {listening ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* reading surface */}
        <main className="flex-1 overflow-y-auto" onMouseUp={handleMouseUp} ref={contentRef}>
          <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-[11px] font-semibold text-white shadow shadow-orange-500/30">
                <Sparkles className="h-3 w-3" /> LIVE TEXTBOOK
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                {chapter.title}
              </h2>
              <p className="mt-2 text-foreground/60">{chapter.shortDescription}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-foreground/50">
                <span className="rounded-full border border-white/40 bg-white/50 px-2.5 py-1 dark:border-white/10 dark:bg-white/5">
                  {chapter.grade}
                </span>
                <span className="rounded-full border border-white/40 bg-white/50 px-2.5 py-1 dark:border-white/10 dark:bg-white/5">
                  ~{chapter.readingTime} min read
                </span>
                <span className="rounded-full border border-white/40 bg-white/50 px-2.5 py-1 dark:border-white/10 dark:bg-white/5">
                  {chapter.keywords.slice(0, 4).join(", ")}
                </span>
              </div>
            </div>

            {chapter.sections.map((sec) => (
              <section key={sec.id} id={`section-${sec.id}`} data-section={sec.id} className="scroll-mt-24">
                <h2 className="mt-12 mb-2 font-display text-xl font-bold text-foreground sm:text-2xl">
                  {sec.title}
                </h2>
                {sec.blocks.map((b) => (
                  <div key={b.id} id={`block-${b.id}`} className={cn("scroll-mt-24 transition-shadow duration-500", searchText && matches.includes(b.id) && "rounded-xl ring-2 ring-orange-400/60")}>
                    <BlockView
                      block={b}
                      chapterSlug={chapter.slug}
                      chapterTitle={chapter.title}
                      sectionTitle={sec.title}
                    />
                  </div>
                ))}
              </section>
            ))}

            <div className="mt-12 flex items-center gap-3 rounded-2xl border border-orange-200/60 bg-gradient-to-r from-orange-50/70 to-amber-50/50 p-4 dark:border-orange-400/20 dark:from-orange-400/5 dark:to-transparent">
              <BookOpen className="h-5 w-5 shrink-0 text-orange-500" />
              <p className="text-sm text-foreground/70">
                You have read {chapterProgress.viewedBlocks.length} paragraphs in this chapter. Try the
                quiz or generate flashcards to lock in what you learned.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* right panel */}
      <div
        className={cn(
          "z-40 flex w-full max-w-md flex-col overflow-hidden border-l border-white/40 bg-white/75 backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-[#14100c]/85",
          "fixed inset-y-0 right-0 lg:static lg:w-[380px]",
          panel ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:hidden",
        )}
      >
        {panelMeta && (
          <div className="flex items-center justify-between border-b border-white/40 px-4 py-2.5 dark:border-white/10">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              {panelMeta.icon}
              {panelMeta.title}
            </span>
            <button onClick={() => setPanel(null)} className="rounded-lg p-1.5 text-foreground/50 hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10" aria-label="Close panel">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {panel === "tutor" && (
          <TutorPanel
            chapterSlug={chapter.slug}
            chapterTitle={chapter.title}
            sectionTitle={currentSection.title}
            excerpt={excerpt}
            onClose={() => setPanel(null)}
            prefill={prefill}
            language={panelLanguage}
            onLanguageChange={setPanelLanguage}
          />
        )}
        {panel === "notes" && <NotesPanel chapterSlug={chapter.slug} sectionTitle={currentSection.title} text={excerpt} />}
        {panel === "quiz" && <QuizPanel chapterSlug={chapter.slug} sectionTitle={currentSection.title} text={excerpt} />}
        {panel === "cards" && <FlashcardsPanel chapterSlug={chapter.slug} sectionTitle={currentSection.title} text={excerpt} />}
        {panel === "dashboard" && <ProgressDashboard />}
        {panel === "diagram" && <DiagramPanel sectionTitle={currentSection.title} text={excerpt} />}
      </div>

      {/* selection bubble */}
      {selection && selectionPos && (
        <button
          onClick={askSelection}
          style={{ top: selectionPos.y, left: selectionPos.x }}
          className="fixed z-50 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xl shadow-orange-500/40"
        >
          <Sparkles className="h-3.5 w-3.5" /> Ask AI
        </button>
      )}

      {/* floating AI actions */}
      <div
        className={cn(
          "fixed bottom-6 right-4 z-40 flex flex-col gap-2 transition-all",
          panel ? "lg:right-[400px]" : "lg:right-6",
        )}
      >
        <FloatingAction active={panel === "tutor"} onClick={() => setPanel(panel === "tutor" ? null : "tutor")} icon={<MessageSquareText className="h-4.5 w-4.5" />} label="Tutor" primary />
        <FloatingAction active={panel === "quiz"} onClick={() => setPanel(panel === "quiz" ? null : "quiz")} icon={<Gauge className="h-4 w-4" />} label="Quiz" />
        <FloatingAction active={panel === "cards"} onClick={() => setPanel(panel === "cards" ? null : "cards")} icon={<StickyNote className="h-4 w-4" />} label="Cards" />
        <FloatingAction active={panel === "notes"} onClick={() => setPanel(panel === "notes" ? null : "notes")} icon={<Lightbulb className="h-4 w-4" />} label="Notes" />
        <FloatingAction active={panel === "diagram"} onClick={() => setPanel(panel === "diagram" ? null : "diagram")} icon={<Network className="h-4 w-4" />} label="Diagram" />
      </div>
    </div>
  );
}

function FloatingAction({
  active,
  onClick,
  icon,
  label,
  primary,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-2.5 text-sm font-medium shadow-lg transition-all hover:scale-105",
        active
          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/40"
          : primary
            ? "border-orange-300/50 bg-white/80 text-orange-600 shadow-orange-500/20 backdrop-blur dark:border-orange-400/25 dark:bg-white/10 dark:text-orange-300"
            : "border-white/50 bg-white/80 text-foreground/70 shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-foreground/70",
      )}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
