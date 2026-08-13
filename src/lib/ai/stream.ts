/**
 * Wraps a stream of text chunks into Server-Sent Events. Each chunk becomes
 * `data: {"token":"..."}` and a final `data: {"done":true,...}` carries the
 * engine metadata the client needs to tag the response (online/offline + provider).
 */
export function toSseStream(
  source: ReadableStream<string>,
  done: { done: true; mode: "online" | "offline"; provider: string },
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let reader: ReadableStreamDefaultReader<string> | null = null;
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (obj: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        } catch {
          /* stream already closed */
        }
      };
      try {
        reader = source.getReader();
        while (true) {
          const { done: isDone, value } = await reader.read();
          if (isDone) break;
          if (value) enqueue({ token: value });
        }
        enqueue(done);
      } catch {
        enqueue({ error: "stream failed", mode: done.mode, provider: done.provider });
        enqueue(done);
      } finally {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel() {
      reader?.cancel().catch(() => {});
    },
  });
}
