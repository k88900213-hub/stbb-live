import Link from "next/link";
import {
  Atom,
  BookOpen,
  Cpu,
  FlaskConical,
  Languages,
  Leaf,
  LibraryBig,
  Music,
  School,
  ScrollText,
} from "lucide-react";
import { getStbbBooks, stbbChaptersCount } from "@/lib/stbb/catalog";
import { BookCover } from "@/components/ui/BookCover";

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  Physics: <Atom className="h-4 w-4" />,
  Chemistry: <FlaskConical className="h-4 w-4" />,
  Biology: <Leaf className="h-4 w-4" />,
  "Computer Science": <Cpu className="h-4 w-4" />,
  Mathematics: <School className="h-4 w-4" />,
  English: <Languages className="h-4 w-4" />,
  Urdu: <ScrollText className="h-4 w-4" />,
  Sindhi: <Music className="h-4 w-4" />,
};

function subjectIcon(subject: string) {
  return SUBJECT_ICONS[subject] ?? <BookOpen className="h-4 w-4" />;
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
    </svg>
  );
}

export default function StbbLibraryPage() {
  const books = getStbbBooks().filter((b) => b.available);
  const liveBooks = books.filter((b) => b.chapters.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-white to-amber-50/40 pb-24 dark:from-orange-400/5 dark:via-transparent dark:to-transparent">
      <div className="mx-auto max-w-6xl px-6 pt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/50 bg-white/60 px-4 py-1.5 text-xs font-semibold text-orange-700 shadow-sm backdrop-blur dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300">
          <LibraryBig className="h-3.5 w-3.5" />
          Sindh Textbook Board · eBooks Portal
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-5xl">
          STBB Live Library
        </h1>
        <p className="mt-3 max-w-2xl text-foreground/65">
          {books.length} Class 9 and 10 science textbooks from the Sindh Textbook Board, converted into
          interactive live chapters with simulations, AI tutor, quizzes and instant translation.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-2xl border border-orange-200/60 bg-orange-50/80 px-4 py-2 font-semibold text-orange-700 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-300">
            {books.length} books
          </span>
          <span className="rounded-2xl border border-white/40 bg-white/60 px-4 py-2 font-semibold text-foreground/70 dark:border-white/10 dark:bg-white/5">
            {stbbChaptersCount()} live chapters
          </span>
          <span className="rounded-2xl border border-white/40 bg-white/60 px-4 py-2 font-semibold text-foreground/70 dark:border-white/10 dark:bg-white/5">
            Physics · Chemistry · Biology
          </span>
        </div>

        {liveBooks.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              Interactive now
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {liveBooks.map((b) => (
                <Link
                  key={b.id}
                  href={`/stbb/${b.slug}`}
                  className="group overflow-hidden rounded-3xl border border-orange-200/60 bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur transition hover:-translate-y-1.5 hover:shadow-[0_18px_45px_rgb(249,115,22,0.18)] dark:border-orange-400/20 dark:bg-white/5"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-orange-100/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-700 dark:bg-orange-400/10 dark:text-orange-300">
                        Class {b.grade} · {b.medium}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30">
                        {subjectIcon(b.subject)}
                      </span>
                    </div>
                    <div className="mt-4 flex items-start gap-4">
                      <BookCover book={b} compact className="w-20 shrink-0 sm:w-24 group-hover:-translate-y-0.5 group-hover:rotate-[0.5deg]" />
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-display text-base font-bold leading-snug text-foreground">{b.title}</h3>
                        <p className="mt-1 break-words text-xs text-foreground/60">
                          {b.subject} · {b.chapters.length} live chapters
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {b.chapters.slice(0, 3).map((c) => (
                            <span key={c.slug} className="rounded-full bg-orange-100/80 px-2 py-0.5 text-[10px] text-orange-700 dark:bg-orange-400/10 dark:text-orange-300">
                              {c.title.split("—")[0].split(":")[0].split("-")[0].trim()}
                            </span>
                          ))}
                        </div>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 transition group-hover:gap-2 dark:text-orange-400">
                          Open book <ChevronRightIcon />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-14 text-center text-xs text-foreground/40">
          Source: Sindh Textbook Board eBooks portal (portal.stbb.edu.pk). Each book has been converted
          chapter-by-chapter into live interactive content.
        </p>
      </div>
    </div>
  );
}
