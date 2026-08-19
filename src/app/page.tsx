import { book } from "@/lib/content/catalog";
import Link from "next/link";
import { ImportedLibrary } from "@/components/home/ImportedLibrary";
import {
  ArrowRight,
  BookOpenCheck,
  Cpu,
  LibraryBig,
  Rocket,
  ScanText,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-20 sm:pt-28">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/50 bg-white/60 px-4 py-1.5 text-xs font-semibold text-orange-700 shadow-sm backdrop-blur dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300">
            <Rocket className="h-3.5 w-3.5" />
            Neural Sync · Infinity Live Textbook
          </div>

          <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-foreground sm:text-6xl">
            Every page of your textbook,{" "}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
              alive with AI
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-foreground/65 sm:text-lg">
            Not a PDF reader. Not an e-book. Every paragraph can explain itself, answer questions,
            translate, speak, build quizzes, flashcards and notes — and adapt to how{" "}
            <em>you</em> learn.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/read/${book.chapters[0].slug}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-orange-500/30 transition hover:scale-[1.02] hover:brightness-110"
            >
              <BookOpenCheck className="h-4 w-4" />
              Enter the Live Textbook
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/import"
              className="inline-flex items-center gap-2 rounded-2xl border border-orange-300/50 bg-orange-50/70 px-6 py-3 text-sm font-semibold text-orange-700 backdrop-blur transition hover:scale-[1.02] hover:bg-orange-100/80 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300"
            >
              <ScanText className="h-4 w-4" />
              Import your notes
            </Link>
            <Link
              href="/stbb"
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/50 bg-emerald-50/70 px-6 py-3 text-sm font-semibold text-emerald-700 backdrop-blur transition hover:scale-[1.02] hover:bg-emerald-100/80 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300"
            >
              <LibraryBig className="h-4 w-4" />
              STBB Class 9 & 10
            </Link>
          </div>

          <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3">
            <MiniStat value="6" label="AI engines" />
            <MiniStat value="8" label="languages" />
            <MiniStat value="323" label="live sims" />
          </div>
        </div>

        <section className="mt-16">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Cpu className="h-5 w-5 text-orange-500" />
            Your live books
          </h2>
          <ImportedLibrary />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {book.chapters.map((ch, i) => (
              <Link
                key={ch.slug}
                href={`/read/${ch.slug}`}
                className="group rounded-3xl border border-white/40 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(249,115,22,0.15)] dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                    Chapter {i + 1} · {ch.subject}
                  </span>
                  <ArrowRight className="h-4 w-4 text-foreground/30 transition group-hover:translate-x-1 group-hover:text-orange-500" />
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-foreground">{ch.title}</h3>
                <p className="mt-1 text-sm text-foreground/60">{ch.shortDescription}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ch.keywords.slice(0, 3).map((k) => (
                    <span key={k} className="rounded-full bg-orange-100/70 px-2 py-0.5 text-[11px] text-orange-700 dark:bg-orange-400/10 dark:text-orange-300">
                      {k}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-16 text-center text-xs text-foreground/40">
          Neural Sync Infinity · {book.edition} · AI powered by OpenAI / Gemini with an offline demo engine
        </p>
      </main>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/50 p-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="font-display text-2xl font-bold text-orange-600 dark:text-orange-400">{value}</div>
      <div className="text-[11px] text-foreground/55">{label}</div>
    </div>
  );
}
