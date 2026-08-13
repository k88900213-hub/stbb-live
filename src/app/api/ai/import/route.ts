import { getProvider, chatCompletion, extractJson } from "@/lib/ai/provider";
import { normalizeChapter, extractKeywords } from "@/lib/import/parser";
import type { Chapter } from "@/lib/content/types";

interface ImportRequest {
  text: string;
  title?: string;
  subject?: string;
}

export async function POST(req: Request) {
  const provider = getProvider();
  const body = (await req.json().catch(() => ({}))) as Partial<ImportRequest>;

  if (!body.text?.trim()) {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  const title = body.title?.trim() || "Imported Notes";

  if (!provider) {
    const { parseTextToChapter } = await import("@/lib/import/parser");
    const chapter = parseTextToChapter(body.text, { title, subject: body.subject });
    return Response.json({ chapter, mode: "offline", provider: "Demo Engine" });
  }

  const schemaExample = `{
  "title": "string",
  "subject": "string",
  "shortDescription": "string",
  "keywords": ["string"],
  "sections": [{ "id": "sec-1", "title": "string", "blocks": [ { "type": "heading|paragraph|formula|callout|list", "content": "string", "formula": "string", "items": ["string"], "variant": "info|tip|warning|key" } ] }]
}`;

  const userPrompt = `Convert the student's raw notes below into a structured interactive textbook chapter.

Rules:
- Split into logical sections with meaningful titles.
- A heading block is a short section sub-title (optional).
- A paragraph block is 1-3 sentences.
- Put equations/formulas (containing =, ×, ÷, √, superscripts, etc.) into "formula" blocks. Use LaTeX: replace × -> \\times, ÷ -> \\div, · -> \\cdot, π -> \\pi, ² -> ^{2}, ³ -> ^{3}, sqrt -> \\sqrt{}.
- Group consecutive bullet/numbered lines into "list" blocks (items array).
- Lines starting "Note:", "Important:", "Warning:", "Remember:", "Tip:" become "callout" blocks with a matching variant.
- Derive up to 8 keywords.
- readingTime estimate in minutes (include it on the chapter object).
- Preserve all facts; do not invent content.

Respond with STRICT JSON only, no markdown fences, matching exactly this shape:
${schemaExample}

Raw notes:
"""
${body.text.slice(0, 24000)}
"""`;

  try {
    const { text, provider: used } = await chatCompletion([
      { role: "system", content: "You structure raw textbook notes into an interactive live-textbook chapter. Output JSON only." },
      { role: "user", content: userPrompt },
    ], { temperature: 0.3, maxTokens: 3000 });

    const parsed = extractJson<Partial<Chapter>>(text);
    const chapter = normalizeChapter(parsed, title);
    if (!chapter.keywords?.length) chapter.keywords = extractKeywords(body.text);
    return Response.json({ chapter, mode: "online", provider: used.label });
  } catch (err) {
    console.error("online import parse failed, falling back:", err);
    const { parseTextToChapter } = await import("@/lib/import/parser");
    const chapter = parseTextToChapter(body.text, { title, subject: body.subject });
    return Response.json({ chapter, mode: "offline", provider: "Demo Engine" });
  }
}
