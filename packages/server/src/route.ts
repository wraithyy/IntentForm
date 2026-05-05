import type { IntentFormEngine } from "@intentform/core";
import { serializeResolution } from "@intentform/shared";

export type IntentFormRouteHandler = (req: Request) => Promise<Response>;

/** Creates a Web Fetch API handler for server-side intent resolution. */
export function createIntentFormRoute(
  engine: IntentFormEngine
): IntentFormRouteHandler {
  return async (req: Request): Promise<Response> => {
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
  };
}
