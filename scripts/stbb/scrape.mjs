// Scrapes the STBB eBooks portal for all Class IX and Class X books,
// writes data/stbb/catalog.json, and downloads every PDF to data/stbb/pdfs/.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const DATA = join(ROOT, "data", "stbb");
const PDF_DIR = join(DATA, "pdfs");
mkdirSync(PDF_DIR, { recursive: true });

const BASE = "https://portal.stbb.edu.pk/ebooks";

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function get(url) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return await res.text();
}

function extractBooks(html) {
  const out = [];
  const cardRe = /<a href="[^"]*book\.php\?id=(\d+)"[^>]*class="book-card"[\s\S]*?<\/a>/g;
  let card;
  while ((card = cardRe.exec(html))) {
    const block = card[0];
    const title = block.match(/<div class="book-title">([^<]+)<\/div>/)?.[1]?.trim();
    const medium = block.match(/class="book-medium-badge">([^<]+)<\/div>/)?.[1]?.trim();
    const pub = block.match(/<div class="book-pub">([\s\S]*?)<\/div>/)?.[1]?.replace(/\s+/g, " ").trim();
    if (title) {
      out.push({ id: Number(card[1]), title, medium: medium || "English", pub: pub || "" });
    }
  }
  return out;
}

async function scrapeClass(classId, label) {
  const books = [];
  let page = 1;
  for (;;) {
    const html = await get(`${BASE}/class.php?id=${classId}&page=${page}`);
    const found = extractBooks(html);
    if (found.length === 0) break;
    books.push(...found);
    const hasNext = /class="page-btn[^"]*">Next/.test(html) || new RegExp(`>${page + 1}<`).test(html);
    if (!hasNext) break;
    page++;
  }
  const seen = new Set();
  const unique = books.filter((b) => (seen.has(b.id) ? false : (seen.add(b.id), true)));
  console.log(`${label}: ${unique.length} books`);
  return unique;
}

async function enrich(book) {
  try {
    const html = await get(`${BASE}/book.php?id=${book.id}`);
    const pdfMatch = html.match(/pdf_proxy\.php\?id=\d+&download=1/);
    const yearMatch = html.match(/<div class="meta-value">(\d{4})<\/div>/);
    const metaMedium = html.match(/<div class="meta-label">Medium<\/div>\s*<div class="meta-value">([^<]+)<\/div>/);
    return {
      ...book,
      medium: metaMedium?.[1]?.trim() || book.medium || "English",
      year: yearMatch?.[1] || null,
      pdfUrl: pdfMatch ? `${BASE}/${pdfMatch[0]}` : null,
    };
  } catch (e) {
    console.warn(`enrich fail id=${book.id}: ${e.message}`);
    return book;
  }
}

const class9 = await scrapeClass(10, "Class IX");
const class10 = await scrapeClass(11, "Class X");

const all = [];
for (const b of [...class9, ...class10]) {
  const e = await enrich(b);
  all.push(e);
  console.log(`  [${e.id}] ${e.title} (${e.medium}) ${e.year ?? ""} ${e.pdfUrl ? "OK" : "NO PDF"}`);
}

const catalog = {
  source: "Sindh Textbook Board eBooks Portal",
  portal: BASE,
  scrapedAt: new Date().toISOString(),
  books: all,
};
writeFileSync(join(DATA, "catalog.json"), JSON.stringify(catalog, null, 2));

const withPdf = all.filter((b) => b.pdfUrl);
console.log(`\n${all.length} books catalogued, ${withPdf.length} have PDFs.`);
