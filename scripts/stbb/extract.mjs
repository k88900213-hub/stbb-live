import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const DATA = join(ROOT, "data", "stbb");
const PDF_DIR = join(DATA, "pdfs");
const TEXT_DIR = join(DATA, "text");
mkdirSync(TEXT_DIR, { recursive: true });

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

async function extractBook(id, title) {
  const file = join(PDF_DIR, `${id}-${slugify(title)}.pdf`);
  if (!existsSync(file)) return;
  const data = new Uint8Array(readFileSync(file));
  const doc = await getDocument({ data, isEvalSupported: false }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    pages.push(await extractPage(page));
  }
  const joined = pages.join("\n\n===PAGE BREAK===\n\n");
  writeFileSync(join(TEXT_DIR, `${id}-${slugify(title)}.txt`), joined);
  const chars = joined.length;
  console.log(`[${id}] ${title}: ${doc.numPages} pages, ${chars} chars, ${(chars / doc.numPages).toFixed(0)}/page`);
}

const id = process.argv[2];
const title = process.argv.slice(3).join(" ");
if (!id) {
  console.error("usage: node scripts/stbb/extract.mjs <id> <title>");
  process.exit(1);
}
await extractBook(id, title);
