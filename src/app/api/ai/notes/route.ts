import { notes } from "@/lib/ai";
import type { NoteRequest } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<NoteRequest>;
    if (!body.text?.trim()) {
      return Response.json({ error: "text is required" }, { status: 400 });
    }
    const result = await notes({
      text: body.text,
      kind: body.kind ?? "smart",
    });
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "AI notes failed" }, { status: 500 });
  }
}
