import { translate } from "@/lib/ai";
import type { TranslateRequest } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<TranslateRequest>;
    if (!body.text?.trim() || !body.language) {
      return Response.json({ error: "text and language are required" }, { status: 400 });
    }
    const result = await translate({ text: body.text, language: body.language });
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "AI translate failed" }, { status: 500 });
  }
}
