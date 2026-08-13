import type { Block, Chapter, Section } from "@/lib/content/types";

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "are", "was", "were", "has",
  "have", "had", "will", "would", "can", "could", "should", "into", "over", "under",
  "than", "then", "they", "their", "them", "there", "these", "those", "when", "where",
  "which", "what", "while", "about", "after", "before", "between", "because", "been",
  "being", "each", "such", "only", "same", "very", "more", "most", "some", "any",
  "also", "just", "but", "not", "its", "it's", "you", "your", "our", "all", "own",
  "by", "to", "of", "in", "on", "at", "as", "or", "an", "is", "be", "do", "does", "did",
]);

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "imported-chapter"
  );
}

export function extractKeywords(text: string, limit = 8): string[] {
  const freq = new Map<string, number>();
  const words = text.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  for (const w of words) {
    if (STOPWORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([w]) => w);
}

export function countWords(text: string): number {
  return (text.match(/\S+/g) ?? []).length;
}

function isHeadingLine(line: string): boolean {
  const t = line.trim();
  if (t.length < 2 || t.length > 72) return false;
  if (/^[•\-*\d.)\]]/.test(t)) return false;
  if (/[.!?;:]$/.test(t)) return false;
  if (/^(chapter|section|part|lesson|unit|module|topic|introduction|abstract|summary|conclusion|review|exercise|questions?)\b/i.test(t)) return true;
  if (/^\d+(\.\d+)*\s+[A-Za-z]/.test(t)) return true;
  if (/^[A-Z][A-Z0-9\s\-&/:]{4,}$/.test(t) && !/^[IVX]+$/.test(t)) return true;
  if (t.split(" ").length <= 6 && !t.includes(",")) return true;
  return false;
}

function isMathLine(line: string): boolean {
  const t = line.trim();
  if (t.length > 160) return false;
  if (/[=×÷²³√π∫∑±·∝≤≥→⇒]/u.test(t) && /[A-Za-z0-9]/.test(t)) return true;
  if ((t.match(/=/g) ?? []).length >= 2) return true;
  return false;
}

function isCalloutLine(line: string): boolean {
  const t = line.trim();
  return /^(note|important|remember|warning|key idea|definition|formula|example|tip|hint)\s*[:!]/.test(t.toLowerCase());
}

function isListStart(line: string): boolean {
  const t = line.trim();
  return /^[-•*▪▸]\s+/.test(t) || /^\d+[.)]\s+/.test(t) || /^[a-z][.)]\s+/.test(t);
}

const CALLOUT_VARIANT: Record<string, Block["variant"]> = {
  warning: "warning",
  caution: "warning",
  tip: "tip",
  hint: "tip",
  "key idea": "key",
  definition: "key",
  formula: "key",
  example: "info",
  note: "info",
  important: "info",
  remember: "info",
};

function mathify(line: string): string {
  return line
    .replace(/×/g, " \\times ")
    .replace(/÷/g, " \\div ")
    .replace(/·/g, " \\cdot ")
    .replace(/±/g, " \\pm ")
    .replace(/∝/g, " \\propto ")
    .replace(/≤/g, " \\leq ")
    .replace(/≥/g, " \\geq ")
    .replace(/→/g, " \\rightarrow ")
    .replace(/⇒/g, " \\Rightarrow ")
    .replace(/π/g, " \\pi ")
    .replace(/√/g, "\\sqrt{}")
    .replace(/²/g, "^{2}")
    .replace(/³/g, "^{3}");
}

function cleanLine(line: string): string {
  return line.trim().replace(/^#+\s*/, "").replace(/\s{2,}/g, " ").trim();
}

export interface ParseOptions {
  title?: string;
  subject?: string;
}

export function parseTextToChapter(raw: string, opts: ParseOptions = {}): Chapter {
  const lines = raw.split(/\r?\n/);
  const title = opts.title?.trim() || lines.find((l) => l.trim() && !isHeadingLine(l.trim()) && l.trim().length <= 80)?.trim() || "Imported Notes";

  const sections: Section[] = [];
  const keywords = extractKeywords(raw);

  let current: Section = { id: "sec-1", title: "Content", blocks: [] };
  let pendingParagraph: string[] = [];
  let pendingList: string[] = [];

  const flushParagraph = () => {
    if (pendingParagraph.length) {
      current.blocks.push({
        id: `b-${current.blocks.length + 1}-${Date.now()}`,
        type: "paragraph",
        content: pendingParagraph.join(" "),
      });
      pendingParagraph = [];
    }
  };
  const flushList = () => {
    if (pendingList.length) {
      current.blocks.push({
        id: `b-${current.blocks.length + 1}-${Date.now()}`,
        type: "list",
        content: "Key points:",
        items: pendingList.slice(),
      });
      pendingList = [];
    }
  };

  const startSection = (titleText: string) => {
    flushParagraph();
    flushList();
    current = { id: `sec-${sections.length + 1}`, title: titleText, blocks: [] };
    sections.push(current);
  };

  for (const rawLine of lines) {
    const line = cleanLine(rawLine);
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (isHeadingLine(line)) {
      if (sections.length === 0 && current.blocks.length === 0) {
        current = { id: `sec-${sections.length + 1}`, title: line, blocks: [] };
        sections.push(current);
      } else {
        startSection(line);
      }
      continue;
    }

    if (isMathLine(line)) {
      flushParagraph();
      flushList();
      current.blocks.push({
        id: `b-${current.blocks.length + 1}-${Date.now()}`,
        type: "formula",
        formula: mathify(line),
        caption: line,
      });
      continue;
    }

    if (isCalloutLine(line)) {
      flushParagraph();
      flushList();
      const key = line.toLowerCase().split(":")[0];
      current.blocks.push({
        id: `b-${current.blocks.length + 1}-${Date.now()}`,
        type: "callout",
        variant: CALLOUT_VARIANT[key] ?? "info",
        content: line,
      });
      continue;
    }

    if (isListStart(line)) {
      flushParagraph();
      pendingList.push(line.replace(/^[-•*▪▸\s]*|^\d+[.)]\s+/, ""));
      continue;
    }

    flushList();
    pendingParagraph.push(line);
  }

  flushParagraph();
  flushList();

  if (sections.length === 0) {
    sections.push(current);
  }

  return {
    slug: `${slugify(title)}-${Date.now().toString(36)}`,
    title,
    subject: opts.subject || "Imported",
    grade: "Interactive",
    shortDescription:
      raw.slice(0, 160).replace(/\s+/g, " ").trim() + (raw.length > 160 ? "…" : ""),
    keywords,
    readingTime: Math.max(1, Math.round(countWords(raw) / 200)),
    sections,
  };
}

export function normalizeChapter(ch: Partial<Chapter>, fallbackTitle: string): Chapter {
  const title = ch.title?.trim() || fallbackTitle || "Imported Chapter";
  const sections: Section[] = Array.isArray(ch.sections)
    ? ch.sections.map((sec, si) => ({
        id: sec.id || `sec-${si + 1}`,
        title: sec.title || `Section ${si + 1}`,
        blocks: (Array.isArray(sec.blocks) ? sec.blocks : []).map((b, bi) => {
          const type =
            b.type && ["paragraph", "heading", "formula", "figure", "callout", "list", "simulation"].includes(b.type)
              ? b.type
              : "paragraph";
          const base: Block = { id: `b-${si + 1}-${bi + 1}`, type };
          if (type === "formula") base.formula = b.formula ?? b.content ?? "";
          if (type === "list") {
            base.items = Array.isArray(b.items) && b.items.length ? b.items : [(b.content ?? "Item").replace(/^[-•*]\s*/, "")];
            base.content = b.content || "Key points:";
          }
          if (type === "callout") base.variant = b.variant ?? "info";
          base.content = b.content ?? "";
          return base;
        }),
      }))
    : [];

  if (!sections.length) {
    const parsed = parseTextToChapter(ch.shortDescription ?? fallbackTitle);
    return parsed;
  }

  const allText = sections.flatMap((s) => s.blocks.map((b) => b.content ?? b.formula ?? "")).join(" ");

  return {
    slug: ch.slug || slugify(title),
    title,
    subject: ch.subject || "Imported",
    grade: ch.grade || "Interactive",
    shortDescription: ch.shortDescription || allText.slice(0, 160) + (allText.length > 160 ? "…" : ""),
    keywords: Array.isArray(ch.keywords) && ch.keywords.length ? ch.keywords : extractKeywords(allText),
    readingTime: ch.readingTime ?? Math.max(1, Math.round(countWords(allText) / 200)),
    sections,
  };
}
