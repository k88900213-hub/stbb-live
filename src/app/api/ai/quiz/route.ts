import { quiz } from "@/lib/ai";
import type { QuizRequest } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<QuizRequest>;
    if (!body.text?.trim()) {
      return Response.json({ error: "text is required" }, { status: 400 });
    }
    const result = await quiz({
      text: body.text,
      difficulty: body.difficulty ?? "medium",
      count: Math.min(body.count ?? 4, 6),
    });
    return Response.json(result);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "AI quiz failed" }, { status: 500 });
  }
}
