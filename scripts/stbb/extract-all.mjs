import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const DATA = join(ROOT, "data", "stbb");
const PDF_DIR = join(DATA, "pdfs");
const TEXT_DIR = join(DATA, "text");
mkdirSync(TEXT_DIR, { recursive: true });

const catalog = JSON.parse(readFileSync(join(DATA, "catalog.json"), "utf8"));

function slugify(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function extractPage(page) {
  const content = await page.getTextContent();
  let lastY = null;
  let line = "";
  const lines = [];
  for (const rawItem of content.items) {
    const item = rawItem;
    const str = item.str ?? "";
    const y = item.transform?.[5] ?? 0;
    if (lastY !== null && Math.abs(y - lastY) > 2) {
      lines.push(line);
      line = "";
    }
    line += str;
    if (item.hasEOL) {
      lines.push(line);
      line = "";
    }
    lastY = y;
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

async function extractBook(book) {
  const file = join(PDF_DIR, `${book.id}-${slugify(book.title)}.pdf`);
  if (!existsSync(file)) return { book, err: "no file" };
  const data = new Uint8Array(readFileSync(file));
  let doc;
  try {
    doc = await getDocument({ data, isEvalSupported: false }).promise;
  } catch (e) {
    return { book, err: `parse fail: ${e.message.slice(0, 60)}` };
  }
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    try {
      const page = await doc.getPage(i);
      pages.push(await extractPage(page));
    } catch (e) {
      pages.push("");
    }
  }
  const joined = pages.join("\n\n===PAGE BREAK===\n\n");
  writeFileSync(join(TEXT_DIR, `${book.id}-${slugify(book.title)}.txt`), joined);
  const cpp = Math.round(joined.length / doc.numPages);
  return { book, pages: doc.numPages, chars: joined.length, cpp };
}

const only = process.argv[2];
const books = catalog.books.filter((b) => b.pdfUrl && (!only || String(b.id) === only));

const results = [];
for (const b of books) {
  const r = await extractBook(b);
  results.push(r);
  if (r.err) console.log(`[${b.id}] ${b.title}: ${r.err}`);
  else console.log(`[${b.id}] ${b.title}: ${r.pages} pages, ${r.chars} chars, ${r.cpp}/page`);
}
const good = results.filter((r) => !r.err && r.chars > 5000);
const bad = results.filter((r) => r.err || r.chars <= 5000);
console.log(`\nTOTAL: ${results.length} | TEXT-LAYER: ${good.length} | SCAN/BROKEN: ${bad.length}`);
