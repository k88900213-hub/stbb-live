import type { Chapter } from "@/lib/content/types";
import { STBB_BOOKS, type StbbBookInfo } from "./books";
import { physics9 } from "./chapters/physics-9";
import { physics10 } from "./chapters/physics-10";
import { chemistry9 } from "./chapters/chemistry-9";
import { biology9 } from "./chapters/biology-9";
import { chemistry10 } from "./chapters/chemistry-10";
import { biology10 } from "./chapters/biology-10";

export type { StbbBookInfo } from "./books";

export interface StbbBook extends StbbBookInfo {
  chapters: Chapter[];
}

const BOOK_CHAPTERS: Record<number, Chapter[]> = {
  174: physics9,
  202: physics10,
  195: chemistry9,
  117: biology9,
  198: chemistry10,
  188: biology10,
};

export function getStbbBooks(): StbbBook[] {
  return STBB_BOOKS.map((info) => ({
    ...info,
    chapters: BOOK_CHAPTERS[info.id] ?? [],
  }));
}

export function getStbbBook(slug: string): StbbBook | undefined {
  return getStbbBooks().find((b) => b.slug === slug);
}

export function getStbbBookById(id: number): StbbBook | undefined {
  return getStbbBooks().find((b) => b.id === id);
}

export function getStbbChapter(bookSlug: string, chapterSlug: string): Chapter | undefined {
  return getStbbBook(bookSlug)?.chapters.find((c) => c.slug === chapterSlug);
}

export function getStbbChapterIndex(book: StbbBook, chapterSlug: string): number {
  return book.chapters.findIndex((c) => c.slug === chapterSlug);
}

export function stbbChaptersCount(): number {
  return Object.values(BOOK_CHAPTERS).reduce((n, arr) => n + arr.length, 0);
}
