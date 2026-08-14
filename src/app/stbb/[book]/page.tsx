import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { getStbbBook } from "@/lib/stbb/catalog";
import { BookCover } from "@/components/ui/BookCover";

type Props = { params: Promise<{ book: string }> };

export async function generateStaticParams() {
  return [
    { book: "physics-ix-physics-ix-174" },
    { book: "physics-x-physics-x-202" },
    { book: "chemistry-ix-chemsitry-ix-195" },
    { book: "biology-ix-biology-ix-117" },
    { book: "chemistry-x-chemsitry-x-198" },
    { book: "biology-x-biology-x-188" },
  ];
}

export async function generateMetadata({ params }: Props) {
  const { book: slug } = await params;
  const book = getStbbBook(slug);
  return {
    title: book ? `${book.title} · STBB Live Library` : "STBB Book",
    description: book ? `${book.subject} Class ${book.grade} — live interactive chapters with simulations.` : undefined,
  };
}

export default async function StbbBookPage({ params }: Props) {
  const { book: slug } = await params;
  const book = getStbbBook(slug);
  if (!book) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-white to-amber-50/40 pb-24 dark:from-orange-400/5 dark:via-transparent dark:to-transparent">
      <div className="mx-auto max-w-4xl px-6 pt-14">
        <Link href="/stbb" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/55 transition hover:text-orange-600 dark:hover:text-orange-300">
          <ArrowLeft className="h-4 w-4" />
          STBB library
        </Link>

        <div className="mt-4 rounded-3xl border border-orange-200/60 bg-gradient-to-br from-orange-50/90 to-amber-50/60 p-8 dark:border-orange-400/20 dark:from-orange-400/10 dark:to-transparent">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
            <BookCover book={book} className="w-28 shrink-0 shadow-[0_18px_50px_rgb(0,0,0,0.25)] sm:w-36" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-orange-600 sm:justify-start dark:text-orange-400">
                <BookOpen className="h-3.5 w-3.5" />
                Class {book.grade} · {book.medium} · {book.subject}
              </div>
              <h1 className="mt-2 break-words font-display text-3xl font-bold text-foreground sm:text-4xl">{book.title}</h1>
              {book.year && <p className="mt-1 text-sm text-foreground/55">Sindh Textbook Board · Edition {book.year}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-orange-500/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  {book.chapters.length} live chapters
                </span>
                <span className="inline-flex items-center rounded-full border border-white/40 bg-white/60 px-4 py-1.5 text-xs font-semibold text-foreground/60 dark:border-white/10 dark:bg-white/5">
                  {book.subject}
                </span>
              </div>
            </div>
          </div>

          {book.chapters.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/40 bg-white/50 p-6 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-sm text-foreground/60">
                This book&apos;s PDF has been downloaded. Its chapters are being converted into live
                interactive content — check back soon.
              </p>
            </div>
          ) : (
            <ol className="mt-8 space-y-2">
              {book.chapters.map((ch, i) => (
                <li key={ch.slug}>
                  <Link
                    href={`/stbb/${book.slug}/${ch.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-white/40 bg-white/60 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-orange-300/60 hover:shadow-[0_8px_24px_rgb(249,115,22,0.12)] dark:border-white/10 dark:bg-white/5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 font-display text-sm font-bold text-white shadow-lg shadow-orange-500/30">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground">{ch.title}</h3>
                      <p className="mt-0.5 truncate text-sm text-foreground/55">{ch.shortDescription}</p>
                    </div>
                    <div className="hidden shrink-0 flex-wrap gap-1.5 sm:flex">
                      {ch.keywords.slice(0, 2).map((k) => (
                        <span key={k} className="rounded-full bg-orange-100/80 px-2 py-0.5 text-[11px] text-orange-700 dark:bg-orange-400/10 dark:text-orange-300">
                          {k}
                        </span>
                      ))}
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-foreground/30 transition group-hover:translate-x-1 group-hover:text-orange-500" />
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-foreground/50">
          <ChevronRight className="h-4 w-4" />
          Every chapter supports AI explain, ask, translate, read aloud, quizzes, flashcards and notes — and embeds live simulations.
        </div>
      </div>
    </div>
  );
}
