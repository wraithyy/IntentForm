import type { IntentFormEngine } from "@intentform/core";
import { serializeResolution } from "@intentform/shared";

/** Next.js App Router API route handler shape (POST only). */
export interface NextRouteHandlers {
  POST: (req: Request) => Promise<Response>;
}

/**
 * Creates a Next.js App Router compatible API route handler for intent resolution.
 *
 * Usage in `app/api/intent/route.ts`:
 * ```ts
 * import { createIntentFormNextHandler } from "@intentform/server/next";
 * export const { POST } = createIntentFormNextHandler(engine);
 * ```
 *
 * Requires `next` >= 14 as a peer dependency.
 */
export function createIntentFormNextHandler(
  engine: IntentFormEngine
): NextRouteHandlers {
  return {
    POST: async (req: Request): Promise<Response> => {
      let body: unknown;
      try {
        body = (await req.json()) as unknown;
      } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
      }

      if (
        typeof body !== "object" ||
        body === null ||
        typeof (body as Record<string, unknown>).prompt !== "string"
      ) {
        return Response.json(
          { error: "prompt must be a string" },
          { status: 400 }
        );
      }

      const prompt = (body as { prompt: string }).prompt;

      try {
        const resolution = await engine.resolveIntent(prompt);
        return Response.json(serializeResolution(resolution));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Internal error";
        return Response.json({ error: message }, { status: 500 });
      }
    },
  };
}
