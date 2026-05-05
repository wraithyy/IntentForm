import type { AiProviderInput } from "@intentform/shared";
import { describe, expect, it } from "vitest";
import { mockErrorProvider, mockProvider } from "./mock-provider.js";

const input: AiProviderInput = {
  prompt: "test",
  models: [
    {
      id: "m",
      label: "M",
      description: "test model",
      useCases: ["test"],
      fields: [],
      rules: [],
    },
  ],
};

describe("mockProvider", () => {
  it("returns the specified modelId and confidence", async () => {
    const provider = mockProvider({ modelId: "m", confidence: 0.85 });
    const result = await provider.generateStructured(input);
    expect(result.confidence).toBe(0.85);
    expect((result.data as { model: string }).model).toBe("m");
  });

  it("defaults confidence to 0.9", async () => {
    const provider = mockProvider({ modelId: "m" });
    const result = await provider.generateStructured(input);
    expect(result.confidence).toBe(0.9);
  });

  it("returns the provided values", async () => {
    const provider = mockProvider({ modelId: "m", values: { name: "Alice" } });
    const result = await provider.generateStructured(input);
    expect(
      (result.data as { values: Record<string, unknown> }).values.name
    ).toBe("Alice");
  });

  it("includes usage when provided", async () => {
    const provider = mockProvider({
      modelId: "m",
      usage: { tokensIn: 10, tokensOut: 5 },
    });
    const result = await provider.generateStructured(input);
    expect(result.usage?.tokensIn).toBe(10);
    expect(result.usage?.tokensOut).toBe(5);
  });

  it("omits usage when not provided", async () => {
    const provider = mockProvider({ modelId: "m" });
    const result = await provider.generateStructured(input);
    expect(result.usage).toBeUndefined();
  });
});

describe("mockErrorProvider", () => {
  it("throws with the given message", async () => {
    const provider = mockErrorProvider("test failure");
    await expect(provider.generateStructured(input)).rejects.toThrow(
      "test failure"
    );
  });
});
