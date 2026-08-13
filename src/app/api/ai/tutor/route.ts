import { tutor, tutorStream } from "@/lib/ai";
import type { TutorRequest } from "@/lib/ai/types";
import { toSseStream } from "@/lib/ai/stream";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<TutorRequest> & { stream?: boolean };
    const messages = body.messages?.filter(
      (m) => m.role === "user" || m.role === "assistant",
    );
    if (!messages?.length) {
      return Response.json({ error: "messages are required" }, { status: 400 });
    }
    const request = {
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      context: body.context,
      language: body.language,
    };
    if (body.stream) {
      const { stream, mode, provider } = await tutorStream(request);
      return new Response(toSseStream(stream, { done: true, mode, provider }), {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }
    const result = await tutor(request);
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "AI tutor failed" }, { status: 500 });
  }
}
