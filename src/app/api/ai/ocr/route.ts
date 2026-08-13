import { getProvider, chatCompletion } from "@/lib/ai/provider";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: Request) {
  const provider = getProvider();
  if (!provider) {
    return Response.json(
      { error: "No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY to enable image OCR." },
      { status: 501 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { image?: string };
  if (!body.image || !body.image.startsWith("data:")) {
    return Response.json({ error: "image data URL is required" }, { status: 400 });
  }
  if (body.image.length > 30_000_000) {
    return Response.json({ error: "image too large (max ~30MB)" }, { status: 413 });
  }

  try {
    const { text } = await chatCompletion(
      [
        {
          role: "system",
          content:
            "You are an OCR engine for textbooks. Transcribe the text in the image EXACTLY as it appears. Preserve paragraph breaks, headings, equations and math symbols. Use plain text; convert math like F=ma or E=mc^2 into plain text with ^ for superscripts. Output ONLY the transcription, no commentary.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Transcribe this book page to text:" },
            { type: "image_url", image_url: { url: body.image } },
          ],
        },
      ],
      { temperature: 0, maxTokens: 3000, json: false },
    );
    const output = text.trim();
    if (!output) throw new Error("empty transcription");
    return Response.json({ text: output });
  } catch (err) {
    console.error("vision OCR failed:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "OCR failed" },
      { status: 500 },
    );
  }
}
