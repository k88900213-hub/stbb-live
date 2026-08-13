import { existsSync, createWriteStream, readFileSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const DATA = join(ROOT, "data", "stbb");
const PDF_DIR = join(DATA, "pdfs");
mkdirSync(PDF_DIR, { recursive: true });

const catalog = JSON.parse(readFileSync(join(DATA, "catalog.json"), "utf8"));

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function download(book) {
  const file = join(PDF_DIR, `${book.id}-${slugify(book.title)}.pdf`);
  if (existsSync(file) && statSync(file).size > 0) return { book, file, skipped: true };
  const res = await fetch(book.pdfUrl, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await pipeline(res.body, createWriteStream(file));
  return { book, file, skipped: false };
}

const queue = catalog.books.filter((b) => b.pdfUrl);
const CONCURRENCY = 4;
let idx = 0;
let done = 0;

async function worker() {
  while (idx < queue.length) {
    const book = queue[idx++];
    try {
      const { skipped } = await download(book);
      done++;
      const size = Math.round(statSync(join(PDF_DIR, `${book.id}-${slugify(book.title)}.pdf`)).size / 1048576);
      console.log(`${done}/${queue.length} [${book.id}] ${book.title} (${book.medium}) ${skipped ? "skip" : "ok"} ${size} MB`);
    } catch (e) {
      done++;
      console.log(`${done}/${queue.length} [${book.id}] ${book.title} FAIL ${e.message}`);
    }
  }
}

const workers = Array.from({ length: CONCURRENCY }, worker);
await Promise.all(workers);
console.log("download complete");
