import { ask, askStream } from "@/lib/ai";
import type { AskRequest } from "@/lib/ai/types";
import { toSseStream } from "@/lib/ai/stream";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<AskRequest> & { stream?: boolean };
    if (!body.text?.trim() || !body.question?.trim()) {
      return Response.json({ error: "text and question are required" }, { status: 400 });
    }
    const request = {
      text: body.text,
      question: body.question,
      chapterTitle: body.chapterTitle,
      sectionTitle: body.sectionTitle,
    };
    if (body.stream) {
      const { stream, mode, provider } = await askStream(request);
      return new Response(toSseStream(stream, { done: true, mode, provider }), {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }
    const result = await ask(request);
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "AI ask failed" }, { status: 500 });
  }
}
