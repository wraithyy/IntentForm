import type { IntentFormEngine } from "@intentform/core";
import type { IntentResolution } from "@intentform/shared";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useIntentForm } from "../use-intent-form.js";

const mockResolution: IntentResolution = {
  confidence: 0.9,
  fieldRelevance: { name: 0.9 },
  hiddenFields: new Set<string>(),
  modelId: "test",
  requiredFields: new Set<string>(["name"]),
  values: { name: "Alice" },
};

function makeEngine(overrides?: Partial<IntentFormEngine>): IntentFormEngine {
  return {
    config: {
      adapter: { id: "test" },
      models: [],
      provider: { generateStructured: vi.fn() },
    },
    getModels: vi.fn().mockReturnValue([]),
    resolveIntent: vi.fn().mockResolvedValue(mockResolution),
    ...overrides,
  };
}

describe("useIntentForm", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useIntentForm(makeEngine()));
    expect(result.current.status).toBe("idle");
    expect(result.current.resolution).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("goes loading then resolved", async () => {
    const engine = makeEngine();
    const { result } = renderHook(() => useIntentForm(engine));

    await act(async () => {
      await result.current.resolve("test prompt");
    });

    expect(result.current.status).toBe("resolved");
    expect(result.current.resolution).toEqual(mockResolution);
    expect(result.current.values).toEqual({ name: "Alice" });
  });

  it("sets error on failure", async () => {
    const engine = makeEngine({
      resolveIntent: vi.fn().mockRejectedValue(new Error("AI failed")),
    });
    const { result } = renderHook(() => useIntentForm(engine));

    await act(async () => {
      await result.current.resolve("prompt");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("AI failed");
  });

  it("updateValue merges into values", async () => {
    const engine = makeEngine();
    const { result } = renderHook(() => useIntentForm(engine));

    await act(async () => {
      await result.current.resolve("prompt");
    });

    act(() => {
      result.current.updateValue("name", "Bob");
    });

    expect(result.current.values.name).toBe("Bob");
  });

  it("reset returns to idle", async () => {
    const engine = makeEngine();
    const { result } = renderHook(() => useIntentForm(engine));

    await act(async () => {
      await result.current.resolve("prompt");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.resolution).toBeNull();
  });
});
