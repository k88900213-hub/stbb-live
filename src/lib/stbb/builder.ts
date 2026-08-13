import type { Block, Chapter, Section, SimKind } from "@/lib/content/types";

let seq = 0;
const nid = () => `b${++seq}`;

export function p(content: string): Block {
  return { id: nid(), type: "paragraph", content };
}

export function h(content: string): Block {
  return { id: nid(), type: "heading", content };
}

export function f(formula: string, caption?: string): Block {
  return { id: nid(), type: "formula", formula, caption };
}

export function callout(content: string, variant: "info" | "tip" | "warning" | "key" = "info"): Block {
  return { id: nid(), type: "callout", content, variant };
}

export function list(text: string, items: string[]): Block {
  return { id: nid(), type: "list", content: text, items };
}

export function sim(kind: SimKind, caption?: string, topic?: string): Block {
  return { id: nid(), type: "simulation", sim: kind, caption, topic };
}

export function figure(caption?: string, src?: string): Block {
  return { id: nid(), type: "figure", caption, src };
}

export function section(title: string, blocks: Block[]): Section {
  return { id: `sec-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, title, blocks };
}

export function chapter(opts: {
  slug: string;
  title: string;
  subject: string;
  grade: string;
  shortDescription: string;
  keywords: string[];
  readingTime: number;
  sections: Section[];
}): Chapter {
  return { ...opts };
}

export function readingTime(words: number): number {
  return Math.max(2, Math.round(words / 200));
}
