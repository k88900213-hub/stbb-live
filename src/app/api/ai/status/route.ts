import { getProviders, getProvider } from "@/lib/ai/provider";

export async function GET() {
  const providers = getProviders();
  const active = getProvider();
  return Response.json({
    configured: providers.length > 0,
    provider: active?.label ?? null,
    model: active?.model ?? null,
    active: active ? { provider: active.label, model: active.model } : null,
    providers: providers.map((p) => ({ provider: p.label, model: p.model })),
  });
}
