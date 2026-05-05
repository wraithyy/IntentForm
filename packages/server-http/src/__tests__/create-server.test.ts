import type { IntentFormEngine } from "@intentform/core";
import type { IntentResolution } from "@intentform/shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { IntentFormServer } from "../create-server.js";
import { createServer } from "../create-server.js";

function makeResolution(): IntentResolution {
  return {
    modelId: "testModel",
    values: { name: "Alice" },
    confidence: 0.95,
    fieldRelevance: { name: 1 },
    hiddenFields: new Set<string>(),
    requiredFields: new Set<string>(),
    latencyMs: 50,
  };
}

function makeEngine(overrides?: Partial<IntentFormEngine>): IntentFormEngine {
  return {
    config: { models: [], provider: { generateStructured: vi.fn() } },
    getComponents: vi.fn().mockReturnValue({}),
    getModels: vi.fn().mockReturnValue([
      {
        id: "testModel",
        label: "Test",
        description: "",
        useCases: [],
        fields: [],
        rules: [],
      },
    ]),
    resolveIntent: vi.fn().mockResolvedValue(makeResolution()),
    ...overrides,
  };
}

describe("createServer integration", () => {
  let server: IntentFormServer;

  afterEach(async () => {
    if (server) {
      await server.close();
    }
  });

  it("GET /health returns 200 with status ok and model ids", async () => {
    const engine = makeEngine();
    server = createServer({ engine, port: 0 });
    await server.listen();

    const res = await fetch(`http://127.0.0.1:${server.port}/health`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.status).toBe("ok");
    expect(json.models).toEqual(["testModel"]);
  });

  it("POST /api/intent with valid auth returns resolved intent", async () => {
    const engine = makeEngine();
    server = createServer({
      engine,
      port: 0,
      auth: { type: "bearer", token: "mytoken" },
    });
    await server.listen();

    const res = await fetch(`http://127.0.0.1:${server.port}/api/intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer mytoken",
      },
      body: JSON.stringify({ prompt: "test intent" }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.modelId).toBe("testModel");
    expect(json.confidence).toBe(0.95);
    expect(Array.isArray(json.hiddenFields)).toBe(true);
    expect(Array.isArray(json.requiredFields)).toBe(true);
  });

  it("POST /api/intent without auth token returns 401", async () => {
    const engine = makeEngine();
    server = createServer({
      engine,
      port: 0,
      auth: { type: "bearer", token: "mytoken" },
    });
    await server.listen();

    const res = await fetch(`http://127.0.0.1:${server.port}/api/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "test" }),
    });
    expect(res.status).toBe(401);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.error).toBe("Unauthorized");
  });

  it("OPTIONS /api/intent returns 204 with CORS headers", async () => {
    const engine = makeEngine();
    server = createServer({
      engine,
      port: 0,
      cors: { origin: ["https://example.com"] },
    });
    await server.listen();

    const res = await fetch(`http://127.0.0.1:${server.port}/api/intent`, {
      method: "OPTIONS",
      headers: { Origin: "https://example.com" },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe(
      "https://example.com"
    );
  });

  it("unknown path returns 404", async () => {
    const engine = makeEngine();
    server = createServer({ engine, port: 0 });
    await server.listen();

    const res = await fetch(`http://127.0.0.1:${server.port}/unknown/path`);
    expect(res.status).toBe(404);
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.error).toBe("Not found");
  });
});
