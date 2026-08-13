export interface ProviderConfig {
  key: string;
  baseUrl: string;
  model: string;
  label: string;
}

const THINK_OPEN = /<think>/i;
const THINK_CLOSE = /<\/think>/i;

/** Remove `<think>...</think>` reasoning blocks from a complete response. */
function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "");
}

interface ThinkState {
  inThink: boolean;
}

/**
 * Remove `<think>...</think>` spans from a streamed chunk, keeping the state
 * across chunk boundaries so a reasoning block split over several chunks is
 * still dropped completely.
 */
function filterThinkChunk(chunk: string, state: ThinkState): string {
  let out = "";
  let rest = chunk;
  while (rest.length > 0) {
    if (state.inThink) {
      const end = THINK_CLOSE.exec(rest);
      if (!end) return out;
      state.inThink = false;
      rest = rest.slice(end.index + end[0].length);
    } else {
      const start = THINK_OPEN.exec(rest);
      if (!start) {
        out += rest;
        return out;
      }
      out += rest.slice(0, start.index);
      state.inThink = true;
      rest = rest.slice(start.index + start[0].length);
    }
  }
  return out;
}

const DEFAULT_MODELS: Record<string, string> = {
  opencode: "big-pickle",
  groq: "qwen/qwen3.6-27b",
  gemini: "gemini-2.5-flash",
  openai: "gpt-4o-mini",
};

/**
 * All configured providers in priority order: OpenCode Zen > Groq > Gemini > OpenAI.
 * Each provider can be pinned with its own env var (e.g. GROQ_MODEL); otherwise the
 * shared AI_MODEL applies, and finally a sensible per-provider default.
 */
export function getProviders(): ProviderConfig[] {
  const shared = process.env.AI_MODEL;
  const providers: ProviderConfig[] = [];

  if (process.env.OPENCODE_API_KEY) {
    providers.push({
      key: process.env.OPENCODE_API_KEY,
      baseUrl: "https://opencode.ai/zen/v1",
      model: process.env.OPENCODE_MODEL || shared || DEFAULT_MODELS.opencode,
      label: "OpenCode Zen",
    });
  }

  if (process.env.GROQ_API_KEY) {
    providers.push({
      key: process.env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL || shared || DEFAULT_MODELS.groq,
      label: "Groq",
    });
  }

  if (process.env.GEMINI_API_KEY) {
    providers.push({
      key: process.env.GEMINI_API_KEY,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: process.env.GEMINI_MODEL || shared || DEFAULT_MODELS.gemini,
      label: "Gemini",
    });
  }

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      key: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || shared || DEFAULT_MODELS.openai,
      label: "OpenAI",
    });
  }

  return providers;
}

/** First configured provider (highest priority), or null when none are set. */
export function getProvider(): ProviderConfig | null {
  return getProviders()[0] ?? null;
}

/**
 * Run `run` against every configured provider in priority order until one
 * succeeds. If a provider errors (bad key, rate limit, outage, wrong model),
 * the next configured provider is tried automatically.
 */
async function withProvider<T>(run: (provider: ProviderConfig) => Promise<T>): Promise<T> {
  const providers = getProviders();
  if (providers.length === 0) {
    throw new Error("No AI provider configured");
  }
  let lastError: unknown;
  for (const provider of providers) {
    try {
      return await run(provider);
    } catch (err) {
      lastError = err;
      console.error(
        `[ai] ${provider.label} (${provider.model}) failed, trying next: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All AI providers failed");
}

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export interface CompletionResult {
  text: string;
  provider: ProviderConfig;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  /** Ask the model for a strict JSON object (default true). Set false for free text (e.g. OCR). */
  json?: boolean;
}

/**
 * JSON-mode extras: some providers/models accept `response_format:
 * json_object` and (on Qwen 3.6) `reasoning_effort: "none"`, which disable
 * reasoning and force valid JSON. This makes structured calls fast and
 * deterministic instead of wasting tokens on `<think>` blocks.
 */
function jsonExtrasFor(model: string): Record<string, unknown> {
  if (/qwen3\.6/i.test(model)) {
    return { reasoning_effort: "none" };
  }
  return {};
}

export async function chatCompletion(
  messages: AiMessage[],
  opts: ChatOptions = {},
): Promise<CompletionResult> {
  const jsonMode = opts.json !== false;
  return withProvider(async (provider) => chatCompletionOnce(provider, messages, opts, jsonMode));
}

async function chatCompletionOnce(
  provider: ProviderConfig,
  messages: AiMessage[],
  opts: ChatOptions,
  jsonMode: boolean,
): Promise<CompletionResult> {
  const extras = jsonMode ? { response_format: { type: "json_object" }, ...jsonExtrasFor(provider.model) } : {};

  const res = await fetch(`${provider.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.key}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 900,
      ...extras,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Some providers reject response_format / reasoning_effort. Retry the
    // same provider once without the JSON-mode extras before failing over.
    if (jsonMode && res.status === 400) {
      console.warn(`[ai] ${provider.label}: JSON-mode extras rejected (${body.slice(0, 120)}), retrying without them`);
      return chatCompletionOnce(provider, messages, opts, false);
    }
    throw new Error(`AI provider error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error("AI provider returned no content");
  }
  return { text: stripThinkTags(text.trim()), provider };
}

export interface StreamResult {
  stream: ReadableStream<string>;
  provider: ProviderConfig;
}

/**
 * Stream a chat completion token-by-token. Returns a ReadableStream<string>
 * of text deltas together with the provider that served it. Handles
 * OpenAI-compatible SSE (`data:` lines with `choices[0].delta.content`),
 * reasoning models that emit `delta.reasoning_content` before the answer,
 * and degrades to whole-response text if a provider ignores `stream: true`.
 */
export async function streamChat(
  messages: AiMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<StreamResult> {
  return withProvider(async (provider) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    const res = await fetch(`${provider.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.key}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 3000,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      clearTimeout(timeout);
      const body = await res.text().catch(() => "");
      throw new Error(`AI provider error ${res.status}: ${body.slice(0, 300)}`);
    }
    if (!res.body) {
      clearTimeout(timeout);
      throw new Error("AI provider returned no response body");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let emitted = false;
    let reasoning = "";
    let leadingWhitespace = true;
    const think = { inThink: false };

    const stream = new ReadableStream<string>({
      async start(ctrl) {
        try {
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
              let chunk: string | undefined;
              let thought: string | undefined;
              try {
                const json = JSON.parse(data);
                const delta = json?.choices?.[0]?.delta;
                chunk =
                  typeof delta?.content === "string"
                    ? delta.content
                    : typeof json?.choices?.[0]?.message?.content === "string"
                      ? json.choices[0].message.content
                      : undefined;
                thought = typeof delta?.reasoning_content === "string" ? delta.reasoning_content : undefined;
              } catch {
                continue;
              }
              if (thought) reasoning += thought;
              if (chunk) {
                const clean = filterThinkChunk(chunk, think);
                if (clean) {
                  let out = clean;
                  if (leadingWhitespace) {
                    out = out.replace(/^\s+/, "");
                    if (out.length > 0) leadingWhitespace = false;
                  }
                  if (out) {
                    emitted = true;
                    ctrl.enqueue(out);
                  }
                }
              }
            }
          }
          if (!emitted) {
            const fallback = stripThinkTags(reasoning.trim()) || buffer.trim();
            if (fallback) ctrl.enqueue(fallback);
          }
          ctrl.close();
        } catch (err) {
          try {
            ctrl.error(err);
          } catch {
            /* already closed/errored */
          }
        } finally {
          clearTimeout(timeout);
          controller.abort();
        }
      },
      cancel() {
        clearTimeout(timeout);
        controller.abort();
        reader.cancel().catch(() => {});
      },
    });

    return { stream, provider };
  });
}

/** Strip code fences and convert a raw JSON string to JSON. */
export function extractJson<T>(raw: string): T {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = match ? match[1] : raw;
  const start = candidate.indexOf("{");
  if (start === -1) {
    throw new Error("AI response contained no JSON object");
  }
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return JSON.parse(candidate.slice(start, i + 1)) as T;
      }
    }
  }
  throw new Error("AI response contained no complete JSON object");
}
