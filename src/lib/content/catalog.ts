import type { Book, Chapter } from "./types";
import { newtonsLaws } from "./chapters/physics-newtons-laws";
import { electricCircuits } from "./chapters/physics-electric-circuits";

export const book: Book = {
  title: "Neural Sync · Infinity Live Textbook",
  subtitle: "Physics — Mechanics & Electricity",
  edition: "Live Edition v1",
  chapters: [newtonsLaws, electricCircuits],
};

export function getChapter(slug: string): Chapter | undefined {
  return book.chapters.find((c) => c.slug === slug);
}

export function getChapterIndex(slug: string): number {
  return book.chapters.findIndex((c) => c.slug === slug);
}
