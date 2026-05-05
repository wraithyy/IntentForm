import type { IntentFormEngine } from "@intentform/core";
import {
  type SerializableResolution,
  serializeResolution,
} from "@intentform/shared";
import { createServerFn } from "@tanstack/react-start";

/** Validates that the unknown input contains a non-empty prompt string. */
function validatePromptInput(input: unknown): { prompt: string } {
  if (
    typeof input !== "object" ||
    input === null ||
    typeof (input as Record<string, unknown>).prompt !== "string" ||
    (input as { prompt: string }).prompt.trim().length === 0
  ) {
    throw new Error("prompt must be a non-empty string");
  }
  return input as { prompt: string };
}

/**
 * Creates a TanStack Start server function that resolves intent and returns
 * a serialized resolution safe for JSON transport.
 *
 * Requires `@tanstack/react-start` >= 1 as a peer dependency.
 */
export function createIntentFormServerFn(engine: IntentFormEngine) {
  return createServerFn({ method: "POST", strict: false })
    .inputValidator(validatePromptInput)
    .handler(async ({ data }): Promise<SerializableResolution> => {
      const resolution = await engine.resolveIntent(data.prompt);
      return serializeResolution(resolution);
    });
}
