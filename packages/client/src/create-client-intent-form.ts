import type { IntentFormConfig, IntentFormEngine } from "@intentform/core";
import type { IntentResolution, ModelDefinition } from "@intentform/shared";
import { deserializeResolution } from "@intentform/shared";

/** Options for creating a client-side IntentForm engine that fetches from a server endpoint. */
export interface ClientIntentFormOptions {
  /** Optional field-type → component map forwarded via getComponents(). */
  components?: NonNullable<IntentFormConfig["components"]>;
  /** Server endpoint that accepts POST { prompt: string } and returns SerializableResolution. */
  endpoint: string;
  /** Custom fetch implementation. Defaults to globalThis.fetch. */
  fetch?: typeof globalThis.fetch;
  /** Optional headers forwarded with every request (e.g. CSRF token, auth). */
  headers?: Record<string, string>;
  /** Model definitions used for UI rendering. Returned by getModels(). */
  models: ModelDefinition[];
}

/**
 * Creates a client-side IntentFormEngine that resolves intent by posting to a
 * server endpoint. The API key never leaves the server — only the resolved
 * SerializableResolution is transmitted and deserialized on the client.
 */
export function createClientIntentForm(
  options: ClientIntentFormOptions
): IntentFormEngine {
  const fetchFn = options.fetch ?? globalThis.fetch;

  async function resolveIntent(prompt: string): Promise<IntentResolution> {
    const response = await fetchFn(options.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      let message = `Intent resolution failed: ${String(response.status)} ${response.statusText}`;
      try {
        const err = (await response.json()) as Record<string, unknown>;
        if (typeof err.error === "string") {
          message = err.error;
        }
      } catch {
        // Ignore JSON parse failure — use status-based message
      }
      throw new Error(message);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    return deserializeResolution(
      payload as Parameters<typeof deserializeResolution>[0]
    );
  }

  const config: IntentFormConfig = {
    models: options.models,
    ...(options.components === undefined
      ? {}
      : { components: options.components }),
  };

  return {
    config,
    resolveIntent,
    getModels: () => options.models,
    getComponents: () => options.components ?? {},
  };
}
