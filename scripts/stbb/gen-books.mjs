import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const OUT = join(ROOT, "src", "lib", "stbb", "books.ts");
mkdirSync(dirname(OUT), { recursive: true });
const catalog = JSON.parse(readFileSync(join(ROOT, "data", "stbb", "catalog.json"), "utf8"));

const SUBJECT_PATTERNS = [
  { re: /biology/i, subject: "Biology" },
  { re: /chemsitry|chemistry/i, subject: "Chemistry" },
  { re: /computer\s?science/i, subject: "Computer Science" },
  { re: /physics/i, subject: "Physics" },
  { re: /math|riazi/i, subject: "Mathematics" },
  { re: /english/i, subject: "English" },
  { re: /urdu/i, subject: "Urdu" },
  { re: /sindhi/i, subject: "Sindhi" },
  { re: /islamiyat/i, subject: "Islamiyat" },
  { re: /pakistan studies|mutala e pakistan|pak studies/i, subject: "Pakistan Studies" },
  { re: /religious studies|mazhabi/i, subject: "Religious Studies" },
];

function slugify(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function classifyGrade(pub, title) {
  const hasIX = /\bIX\b/.test(pub);
  const hasX = /\bX\b/.test(pub);
  if (hasIX && hasX) return "IX–X";
  if (hasIX) return "IX";
  if (hasX) return "X";
  return "";
}

function classifySubject(title) {
  for (const { re, subject } of SUBJECT_PATTERNS) {
    if (re.test(title)) return subject;
  }
  return "General";
}

const books = catalog.books.map((b) => {
  const subject = classifySubject(b.title);
  const grade = classifyGrade(b.pub, b.title);
  return {
    id: b.id,
    slug: `${subject.toLowerCase().replace(/\s+/g, "-")}-${grade.replace("–", "").toLowerCase()}-${slugify(b.title)}-${b.id}`,
    title: b.title,
    subject,
    medium: b.medium,
    grade,
    year: b.year || null,
    available: b.pdfUrl !== null,
  };
});

const out = `export interface StbbBookInfo {
  id: number;
  slug: string;
  title: string;
  subject: string;
  medium: string;
  grade: string;
  year: string | null;
  available: boolean;
}

export const STBB_BOOKS: StbbBookInfo[] = ${JSON.stringify(books, null, 2)};
`;

writeFileSync(OUT, out);
console.log(`wrote ${books.length} books to src/lib/stbb/books.ts`);
console.log(books.filter((b) => b.subject === "Physics").map((b) => `${b.id} ${b.grade} ${b.medium} ${b.available}`).join("\n"));
