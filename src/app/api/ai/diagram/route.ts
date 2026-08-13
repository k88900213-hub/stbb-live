import { diagram } from "@/lib/ai";
import type { DiagramRequest } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<DiagramRequest>;
    if (!body.text?.trim()) {
      return Response.json({ error: "text is required" }, { status: 400 });
    }
    const result = await diagram({
      text: body.text,
      kind: body.kind ?? "concept-map",
      title: body.title,
    });
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "AI diagram generation failed" }, { status: 500 });
  }
}
