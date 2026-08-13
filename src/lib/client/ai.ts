import type {
  AskResponse,
  DiagramKind,
  DiagramResponse,
  ExplainMode,
  ExplainResponse,
  LanguageCode,
  NoteKind,
  NoteResponse,
  QuizResponse,
  TutorResponse,
} from "@/lib/ai/types";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

interface StreamResult {
  text: string;
  mode: string;
  provider: string;
}

/** POST with `stream: true` and read an SSE body, calling onToken for each chunk. */
async function postStream(
  path: string,
  body: unknown,
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<StreamResult> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...(body as object), stream: true }),
    signal,
  });
  if (!res.ok || !res.body) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let mode = "offline";
  let provider = "Demo Engine";
  let streamError: Error | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      let json: Record<string, unknown>;
      try {
        json = JSON.parse(data);
      } catch {
        continue;
      }
      if (typeof json.token === "string") {
        text += json.token;
        onToken(json.token);
      }
      if (typeof json.mode === "string") mode = json.mode;
      if (typeof json.provider === "string") provider = json.provider;
      if (json.error) {
        streamError = new Error(String(json.error));
        break;
      }
    }
    if (streamError) break;
  }

  await reader.cancel().catch(() => {});
  if (streamError) throw streamError;
  return { text, mode, provider };
}

export const ai = {
  explain: (text: string, mode: ExplainMode, audience?: string) =>
    post<ExplainResponse>("/api/ai/explain", { text, mode, audience }),
  ask: (text: string, question: string, meta?: { chapterTitle?: string; sectionTitle?: string }) =>
    post<AskResponse>("/api/ai/ask", { text, question, ...meta }),
  askStream: (
    text: string,
    question: string,
    meta: { chapterTitle?: string; sectionTitle?: string },
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ) =>
    postStream("/api/ai/ask", { text, question, ...meta }, onToken, signal).then(
      ({ text: t, mode, provider }) => ({ answer: t, mode, provider }) as AskResponse,
    ),
  translate: (text: string, language: LanguageCode) =>
    post<{ translatedText: string; preserved: boolean; mode: string; provider: string }>(
      "/api/ai/translate",
      { text, language },
    ),
  quiz: (text: string, difficulty: "easy" | "medium" | "hard", count = 4) =>
    post<QuizResponse>("/api/ai/quiz", { text, difficulty, count }),
  notes: (text: string, kind: NoteKind) =>
    post<NoteResponse>("/api/ai/notes", { text, kind }),
  tutor: (messages: { role: "user" | "assistant"; content: string }[], context?: { chapterTitle: string; sectionTitle: string; excerpt?: string }, language?: LanguageCode) =>
    post<TutorResponse>("/api/ai/tutor", { messages, context, language }),
  diagram: (text: string, kind: DiagramKind, title?: string) =>
    post<DiagramResponse>("/api/ai/diagram", { text, kind, title }),
  tutorStream: (
    messages: { role: "user" | "assistant"; content: string }[],
    context: { chapterTitle: string; sectionTitle: string; excerpt?: string },
    language: LanguageCode | undefined,
    onToken: (token: string) => void,
    signal?: AbortSignal,
  ) =>
    postStream("/api/ai/tutor", { messages, context, language }, onToken, signal).then(
      ({ text: t, mode, provider }) => ({ reply: t, mode, provider }) as TutorResponse,
    ),
};

export type { ExplainMode, NoteKind, LanguageCode, DiagramKind };
