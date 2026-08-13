"use client";

import Link from "next/link";
import { useImportedLibrary } from "@/lib/import/store";
import { ArrowRight, BookMarked, ScanText, Wand2 } from "lucide-react";

export function ImportedLibrary() {
  const { entries } = useImportedLibrary();

  if (entries.length === 0) {
    return (
      <Link
        href="/import"
        className="group flex items-center gap-4 rounded-3xl border border-dashed border-orange-300/60 bg-gradient-to-r from-orange-50/60 to-amber-50/40 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:border-orange-400/70 hover:shadow-[0_12px_30px_rgb(249,115,22,0.12)] dark:border-orange-400/25 dark:from-orange-400/5 dark:to-transparent"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
          <Wand2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-foreground">Import your own notes, a book photo or a PDF</h3>
          <p className="mt-0.5 text-[13px] text-foreground/60">
            Paste class notes, snap a page of any textbook, or drop a PDF — it becomes a fully
            interactive live chapter instantly.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-orange-500 transition group-hover:translate-x-1" />
      </Link>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <BookMarked className="h-4 w-4 text-orange-500" />
          Imported ({entries.length})
        </h3>
        <Link href="/import" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400">
          <Wand2 className="h-3.5 w-3.5" /> Import more
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {entries.map((e) => (
          <Link
            key={e.id}
            href={`/read/custom/${e.id}`}
            className="group rounded-3xl border border-orange-200/70 bg-white/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(249,115,22,0.15)] dark:border-orange-400/15 dark:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-700 dark:bg-orange-400/10 dark:text-orange-300">
                <ScanText className="h-3 w-3" />
                {e.info.sourceType === "image" ? "Photo" : e.info.sourceType === "pdf" ? "PDF" : "Notes"}
              </span>
              <ArrowRight className="h-4 w-4 text-foreground/30 transition group-hover:translate-x-1 group-hover:text-orange-500" />
            </div>
            <h4 className="mt-2 truncate font-display text-base font-bold text-foreground">{e.info.title}</h4>
            <p className="mt-0.5 text-xs text-foreground/55">
              {e.chapter.sections.length} sections · {e.info.wordCount} words ·{" "}
              {new Date(e.info.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {e.chapter.keywords.slice(0, 3).map((k) => (
                <span key={k} className="rounded-full bg-orange-100/70 px-2 py-0.5 text-[10px] text-orange-700 dark:bg-orange-400/10 dark:text-orange-300">
                  {k}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
