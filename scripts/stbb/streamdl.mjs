import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, createWriteStream } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { PassThrough } from "node:stream";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const DATA = join(ROOT, "data", "stbb");
const PDF_DIR = join(DATA, "pdfs");

const catalog = JSON.parse(readFileSync(join(DATA, "catalog.json"), "utf8"));

function slugify(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function looksComplete(file) {
  const b = readFileSync(file);
  const txt = b.subarray(Math.max(0, b.length - 2048)).toString("latin1");
  return txt.includes("%%EOF") && b.length > 1000;
}

async function downloadStreaming(book) {
  const file = join(PDF_DIR, `${book.id}-${slugify(book.title)}.pdf`);
  if (existsSync(file) && looksComplete(file)) return "already-complete";

  const res = await fetch(book.pdfUrl, {
    headers: { "user-agent": "Mozilla/5.0", range: undefined },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const total = Number(res.headers.get("content-length")) || 0;
  console.log(`  streaming ${book.title}: content-length=${total}`);

  const tmp = file + ".part";
  const passthrough = new PassThrough();
  const sink = createWriteStream(tmp);
  let received = 0;
  passthrough.on("data", (chunk) => {
    received += chunk.length;
    if (total && received % 50000000 < chunk.length) {
      console.log(`    ${(received / 1048576).toFixed(0)} MB`);
    }
  });
  try {
    await pipeline(res.body, passthrough, sink);
  } catch (e) {
    console.log(`  stream interrupted at ${received} bytes: ${e.message}`);
    throw e;
  }
  if (looksComplete(tmp)) {
    writeFileSync(file, readFileSync(tmp));
    console.log(`  ok (${(received / 1048576).toFixed(0)} MB)`);
    return "ok";
  }
  console.log(`  incomplete (${received} bytes), not saving`);
  return "incomplete";
}

const ids = process.argv.slice(2);
const books = catalog.books.filter((b) => ids.includes(String(b.id)));
for (const book of books) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const r = await downloadStreaming(book);
      if (r === "already-complete" || r === "ok") break;
    } catch (e) {
      console.log(`  attempt ${attempt} failed: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
}
console.log("done");
