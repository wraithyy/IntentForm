import type { IntentFormEngine } from "@intentform/core";

export function createHealthResponse(engine: IntentFormEngine): Response {
  const body = JSON.stringify({
    status: "ok",
    uptime: process.uptime(),
    models: engine.getModels().map((m) => m.id),
  });

  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
