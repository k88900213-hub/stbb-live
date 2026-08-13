import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const DATA = join(ROOT, "data", "stbb");
const PDF_DIR = join(DATA, "pdfs");

const catalog = JSON.parse(readFileSync(join(DATA, "catalog.json"), "utf8"));

function slugify(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function looksComplete(file) {
  const b = readFileSync(file);
  const tail = b.subarray(Math.max(0, b.length - 2048));
  const txt = tail.toString("latin1");
  return txt.includes("%%EOF") && b.length > 1000;
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function downloadVerified(book, attempts = 4) {
  const file = join(PDF_DIR, `${book.id}-${slugify(book.title)}.pdf`);
  if (existsSync(file) && looksComplete(file)) return "ok-exists";
  for (let i = 1; i <= attempts; i++) {
    try {
      console.log(`  try ${i}: GET ${book.id} ${book.title}`);
      const buf = await fetchBuffer(book.pdfUrl);
      writeFileSync(file, buf);
      if (looksComplete(file)) {
        return `ok (${(buf.length / 1048576).toFixed(0)} MB, attempt ${i})`;
      }
      console.log(`  -> incomplete (${buf.length} bytes), retrying`);
    } catch (e) {
      console.log(`  -> error ${e.message}`);
    }
  }
  return "FAILED";
}

const ids = process.argv.slice(2);
const books = catalog.books.filter((b) => ids.includes(String(b.id)));
for (const book of books) {
  const r = await downloadVerified(book);
  console.log(`[${book.id}] ${book.title}: ${r}`);
}
console.log("done");
