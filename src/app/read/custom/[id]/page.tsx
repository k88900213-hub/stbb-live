"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ReaderShell } from "@/components/reader/ReaderShell";
import { useImportedLibrary } from "@/lib/import/store";
import { FileQuestion, Home, Wand2 } from "lucide-react";

export default function CustomReaderPage() {
  const params = useParams<{ id: string }>();
  const { entries } = useImportedLibrary();
  const chapter = useMemo(
    () => entries.find((e) => e.id === params.id)?.chapter ?? null,
    [entries, params.id],
  );

  if (!chapter) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-orange-50 via-white to-amber-50 px-6 text-center dark:from-[#1a120c] dark:via-[#120c08] dark:to-[#1a120c]">
        <FileQuestion className="h-12 w-12 text-foreground/30" />
        <h1 className="font-display text-2xl font-bold text-foreground">Chapter not found</h1>
        <p className="max-w-sm text-sm text-foreground/60">
          This imported chapter isn&apos;t in your library on this device. Import it again, or read a
          built-in chapter instead.
        </p>
        <div className="flex gap-3">
          <Link
            href="/import"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110"
          >
            <Wand2 className="h-4 w-4" /> Open Import Studio
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/50 bg-white/60 px-4 py-2.5 text-sm font-medium text-foreground/70 transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    );
  }

  return <ReaderShell chapter={chapter} />;
}
