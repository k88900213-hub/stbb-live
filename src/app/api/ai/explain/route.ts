import { explain } from "@/lib/ai";
import type { ExplainRequest } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ExplainRequest>;
    if (!body.text?.trim()) {
      return Response.json({ error: "text is required" }, { status: 400 });
    }
    const result = await explain({
      text: body.text,
      mode: body.mode ?? "intermediate",
      audience: body.audience,
    });
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "AI explain failed" }, { status: 500 });
  }
}
