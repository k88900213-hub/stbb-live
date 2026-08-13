"use client";

export interface AiStatus {
  configured: boolean;
  provider: string | null;
  model: string | null;
}

export async function getAiStatus(): Promise<AiStatus> {
  try {
    const res = await fetch("/api/ai/status");
    if (!res.ok) return { configured: false, provider: null, model: null };
    return (await res.json()) as AiStatus;
  } catch {
    return { configured: false, provider: null, model: null };
  }
}

export type OcrLanguage =
  | "eng"
  | "deu"
  | "fra"
  | "spa"
  | "hin"
  | "ara"
  | "chi_sim";

export async function ocrImage(dataUrl: string, status: AiStatus, language: OcrLanguage = "eng"): Promise<string> {
  if (status.configured) {
    try {
      const res = await fetch("/api/ai/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (res.ok && typeof data.text === "string" && data.text.trim()) {
        return data.text.trim();
      }
      throw new Error(data.error ?? "vision OCR failed");
    } catch (err) {
      // fall through to Tesseract if vision path fails
      console.warn("vision OCR failed, falling back to Tesseract", err);
    }
  }

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(language);
  try {
    const { data } = await worker.recognize(dataUrl);
    return (data.text ?? "").trim();
  } finally {
    await worker.terminate();
  }
}

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const version = pdfjs.version as string;
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  const maxPages = Math.min(doc.numPages, 100);
  for (let i = 1; i <= maxPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let lastY: number | null = null;
    let line = "";
    const pageLines: string[] = [];
    for (const rawItem of content.items) {
      const item = rawItem as { str?: string; transform?: number[]; hasEOL?: boolean };
      const str = item.str ?? "";
      const y = item.transform?.[5] ?? 0;
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        pageLines.push(line);
        line = "";
      }
      line += str;
      if (item.hasEOL) {
        pageLines.push(line);
        line = "";
      }
      lastY = y;
    }
    if (line) pageLines.push(line);
    pages.push(pageLines.join("\n"));
  }
  await doc.loadingTask.destroy();
  return pages.join("\n\n");
}
