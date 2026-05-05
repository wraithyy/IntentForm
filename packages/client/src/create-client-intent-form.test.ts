import type { IntentResolution, ModelDefinition } from "@intentform/shared";
import { serializeResolution } from "@intentform/shared";
import { describe, expect, it, vi } from "vitest";
import { createClientIntentForm } from "./create-client-intent-form.js";

const MODELS: ModelDefinition[] = [
  {
    id: "contactForm",
    label: "Contact Form",
    description: "Contact form",
    useCases: ["contact"],
    fields: [{ id: "name", label: "Name", type: "text" }],
    rules: [],
  },
];

function makeResolution(): IntentResolution {
  return {
    confidence: 0.85,
    fieldRelevance: { name: 0.9 },
    hiddenFields: new Set<string>(),
    modelId: "contactForm",
    requiredFields: new Set(["name"]),
    values: { name: "Bob" },
  };
}

function makeFetch(resolution: IntentResolution) {
  const serialized = serializeResolution(resolution);
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: vi.fn().mockResolvedValue(serialized),
  });
}

describe("createClientIntentForm", () => {
  describe("resolveIntent", () => {
    it("POSTs to the configured endpoint with the prompt", async () => {
      const fetchMock = makeFetch(makeResolution());
      const engine = createClientIntentForm({
        endpoint: "/api/intent",
        models: MODELS,
        fetch: fetchMock as unknown as typeof fetch,
      });

      await engine.resolveIntent("I need to contact support");

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("/api/intent");
      expect(init.method).toBe("POST");
      const body = JSON.parse(init.body as string) as Record<string, unknown>;
      expect(body.prompt).toBe("I need to contact support");
    });

    it("includes Content-Type header", async () => {
      const fetchMock = makeFetch(makeResolution());
      const engine = createClientIntentForm({
        endpoint: "/api/intent",
        models: MODELS,
        fetch: fetchMock as unknown as typeof fetch,
      });

      await engine.resolveIntent("test");

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const headers = init.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("forwards custom headers", async () => {
      const fetchMock = makeFetch(makeResolution());
      const engine = createClientIntentForm({
        endpoint: "/api/intent",
        models: MODELS,
        headers: { "X-CSRF-Token": "abc123" },
        fetch: fetchMock as unknown as typeof fetch,
      });

      await engine.resolveIntent("test");

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const headers = init.headers as Record<string, string>;
      expect(headers["X-CSRF-Token"]).toBe("abc123");
    });

    it("deserializes the response into a full IntentResolution", async () => {
      const resolution = makeResolution();
      const fetchMock = makeFetch(resolution);
      const engine = createClientIntentForm({
        endpoint: "/api/intent",
        models: MODELS,
        fetch: fetchMock as unknown as typeof fetch,
      });

      const result = await engine.resolveIntent("test");

      expect(result.hiddenFields).toBeInstanceOf(Set);
      expect(result.requiredFields).toBeInstanceOf(Set);
      expect(result.requiredFields.has("name")).toBe(true);
      expect(result.confidence).toBe(0.85);
      expect(result.values).toStrictEqual({ name: "Bob" });
    });

    it("throws when the server responds with an error status", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: vi.fn().mockResolvedValue({ error: "Provider timeout" }),
      });
      const engine = createClientIntentForm({
        endpoint: "/api/intent",
        models: MODELS,
        fetch: fetchMock as unknown as typeof fetch,
      });

      await expect(engine.resolveIntent("test")).rejects.toThrow(
        "Provider timeout"
      );
    });
  });

  describe("getModels", () => {
    it("returns the models passed in options", () => {
      const engine = createClientIntentForm({
        endpoint: "/api/intent",
        models: MODELS,
      });
      expect(engine.getModels()).toBe(MODELS);
    });
  });

  describe("getComponents", () => {
    it("returns an empty object when no components are provided", () => {
      const engine = createClientIntentForm({
        endpoint: "/api/intent",
        models: MODELS,
      });
      expect(engine.getComponents()).toStrictEqual({});
    });

    it("returns the components passed in options", () => {
      const components = { text: {} };
      const engine = createClientIntentForm({
        endpoint: "/api/intent",
        models: MODELS,
        components,
      });
      expect(engine.getComponents()).toBe(components);
    });
  });
});
