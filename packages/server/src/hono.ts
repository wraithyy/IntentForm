import type { IntentFormEngine } from "@intentform/core";
import { serializeResolution } from "@intentform/shared";

/**
 * Minimal structural interface compatible with a Hono Context object.
 * Avoids a hard dependency on the `hono` package.
 */
export interface HonoContext {
  json(data: unknown, status?: number): Response;
  readonly req: {
    json(): Promise<unknown>;
  };
}

/** A Hono-compatible route handler function. */
export type HonoRouteHandler = (c: HonoContext) => Promise<Response>;

/**
 * Creates a Hono-compatible POST handler for intent resolution.
 *
 * Usage:
 * ```ts
 * import { Hono } from "hono";
 * import { createIntentFormHonoRoute } from "@intentform/server";
 *
 * const app = new Hono();
 * app.post("/api/intent", createIntentFormHonoRoute(engine));
 * ```
 *
 * Requires `hono` >= 4 as a peer dependency.
 */
export function createIntentFormHonoRoute(
  engine: IntentFormEngine
): HonoRouteHandler {
  return async (c: HonoContext): Promise<Response> => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    if (
      typeof body !== "object" ||
      body === null ||
      typeof (body as Record<string, unknown>).prompt !== "string"
    ) {
      return c.json({ error: "prompt must be a string" }, 400);
    }

    const prompt = (body as { prompt: string }).prompt;

    try {
      const resolution = await engine.resolveIntent(prompt);
      return c.json(serializeResolution(resolution));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal error";
      return c.json({ error: message }, 500);
    }
  };
}
