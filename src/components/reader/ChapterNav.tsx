"use client";

import { book } from "@/lib/content/catalog";
import { useProgress } from "@/store/progress";
import { cn } from "@/lib/utils/cn";
import { BookMarked, ChevronLeft, LibraryBig } from "lucide-react";
import type { Chapter } from "@/lib/content/types";

interface ChapterNavProps {
  activeSlug: string;
  activeSectionId: string | null;
  onNavigate: (sectionId: string) => void;
  open: boolean;
  onClose: () => void;
  customTitle?: string;
  customSections?: { id: string; title: string }[];
  chapters?: Chapter[];
  bookLabel?: string;
}

export function ChapterNav({ activeSlug, activeSectionId, onNavigate, open, onClose, customTitle, customSections, chapters, bookLabel }: ChapterNavProps) {
  const { getChapter } = useProgress();

  const renderCustom = customTitle !== undefined && customSections !== undefined;
  const list = chapters ?? book.chapters;
  const label = bookLabel ?? "Library";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "z-40 flex h-full w-72 shrink-0 flex-col border-r border-white/40 bg-white/70 backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-[#120c08]/80 lg:translate-x-0",
          "fixed lg:static",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/40 px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
              <LibraryBig className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold text-foreground">{label}</div>
              <div className="text-[11px] text-foreground/50">{list.length} chapters</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-foreground/50 hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10 lg:hidden" aria-label="Close navigation">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {renderCustom && (
            <div className="mb-5">
              <div className="mb-1.5 flex items-start gap-2 rounded-xl bg-orange-50/80 px-2 py-1.5 dark:bg-orange-400/10">
                <BookMarked className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <div>
                  <div className="text-[13px] font-semibold leading-snug text-orange-700 dark:text-orange-300">
                    {customTitle}
                  </div>
                  <div className="text-[11px] text-foreground/45">Imported chapter</div>
                </div>
              </div>
              <div className="ml-4 space-y-0.5 border-l-2 border-orange-200 pl-3 dark:border-orange-400/20">
                {(customSections ?? []).map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => onNavigate(sec.id)}
                    className={cn(
                      "block w-full rounded-lg px-2 py-1.5 text-left text-xs transition",
                      activeSectionId === sec.id
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow shadow-orange-500/30"
                        : "text-foreground/60 hover:bg-white/60 hover:text-foreground dark:hover:bg-white/5",
                    )}
                  >
                    {sec.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          {list.map((ch) => {
            const p = getChapter(ch.slug);
            const viewed = p.viewedBlocks.length;
            const isActive = ch.slug === activeSlug;
            return (
              <div key={ch.slug} className="mb-5">
                <div className={cn("mb-1.5 flex items-start gap-2 rounded-xl px-2 py-1.5", isActive && "bg-orange-50/80 dark:bg-orange-400/10")}>
                  <BookMarked className={cn("mt-0.5 h-4 w-4 shrink-0", isActive ? "text-orange-500" : "text-foreground/40")} />
                  <div>
                    <div className={cn("text-[13px] font-semibold leading-snug", isActive ? "text-orange-700 dark:text-orange-300" : "text-foreground/75")}>
                      {ch.title}
                    </div>
                    <div className="text-[11px] text-foreground/45">
                      {viewed > 0 ? `${viewed} paragraphs read` : ch.subject}
                    </div>
                  </div>
                </div>
                {isActive && (
                  <div className="ml-4 space-y-0.5 border-l-2 border-orange-200 pl-3 dark:border-orange-400/20">
                    {ch.sections.map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => onNavigate(sec.id)}
                        className={cn(
                          "block w-full rounded-lg px-2 py-1.5 text-left text-xs transition",
                          activeSectionId === sec.id
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow shadow-orange-500/30"
                            : "text-foreground/60 hover:bg-white/60 hover:text-foreground dark:hover:bg-white/5",
                        )}
                      >
                        {sec.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
