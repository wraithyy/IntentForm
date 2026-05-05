import type { IntentFormEngine } from "@intentform/core";
import type { IntentResolution } from "@intentform/shared";
import { describe, expect, it, vi } from "vitest";
import { createIntentFormRoute } from "./route.js";

function makeResolution(): IntentResolution {
  return {
    modelId: "m",
    values: {},
    confidence: 0.9,
    fieldRelevance: {},
    hiddenFields: new Set<string>(),
    requiredFields: new Set<string>(),
    latencyMs: 100,
  };
}

function makeEngine(overrides?: Partial<IntentFormEngine>): IntentFormEngine {
  return {
    config: { models: [], provider: { generateStructured: vi.fn() } },
    getComponents: vi.fn().mockReturnValue({}),
    getModels: vi.fn().mockReturnValue([]),
    resolveIntent: vi.fn().mockResolvedValue(makeResolution()),
    ...overrides,
  };
}

describe("createIntentFormRoute", () => {
  it("returns 200 with serialized resolution JSON on success", async () => {
    const engine = makeEngine();
    const handler = createIntentFormRoute(engine);

    const req = new Request("http://localhost/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "I need a car insurance claim" }),
    });

    const res = await handler(req);

    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.modelId).toBe("m");
    expect(json.confidence).toBe(0.9);
    // Sets are serialized as arrays
    expect(Array.isArray(json.hiddenFields)).toBe(true);
    expect(Array.isArray(json.requiredFields)).toBe(true);
    expect(engine.resolveIntent).toHaveBeenCalledWith(
      "I need a car insurance claim"
    );
  });

  it("returns 400 when body is not valid JSON", async () => {
    const engine = makeEngine();
    const handler = createIntentFormRoute(engine);

    const req = new Request("http://localhost/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json{{{",
    });

    const res = await handler(req);

    expect(res.status).toBe(400);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.error).toBe("Invalid JSON body");
  });

  it("returns 400 when prompt field is missing", async () => {
    const engine = makeEngine();
    const handler = createIntentFormRoute(engine);

    const req = new Request("http://localhost/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notPrompt: "oops" }),
    });

    const res = await handler(req);

    expect(res.status).toBe(400);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.error).toBe("prompt must be a string");
  });

  it("returns 500 when engine.resolveIntent throws", async () => {
    const engine = makeEngine({
      resolveIntent: vi.fn().mockRejectedValue(new Error("Provider timeout")),
    });
    const handler = createIntentFormRoute(engine);

    const req = new Request("http://localhost/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "test" }),
    });

    const res = await handler(req);

    expect(res.status).toBe(500);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.error).toBe("Provider timeout");
  });
});
