import { describe, expect, it } from "vitest";
import {
  deserializeResolution,
  type SerializableResolution,
  serializeResolution,
} from "./serialization.js";
import type { IntentResolution } from "./types.js";

function makeResolution(): IntentResolution {
  return {
    confidence: 0.9,
    fieldRelevance: { name: 0.95 },
    hiddenFields: new Set(["internalNote"]),
    latencyMs: 120,
    modelId: "contactForm",
    requiredFields: new Set(["name", "email"]),
    tierId: "fast",
    usage: { tokensIn: 100, tokensOut: 50 },
    values: { name: "Alice", email: "alice@example.com" },
  };
}

describe("serializeResolution", () => {
  it("converts hiddenFields Set to array", () => {
    const r = makeResolution();
    const s = serializeResolution(r);
    expect(Array.isArray(s.hiddenFields)).toBe(true);
    expect(s.hiddenFields).toEqual(["internalNote"]);
  });

  it("converts requiredFields Set to array", () => {
    const r = makeResolution();
    const s = serializeResolution(r);
    expect(Array.isArray(s.requiredFields)).toBe(true);
    expect(s.requiredFields).toContain("name");
    expect(s.requiredFields).toContain("email");
  });

  it("preserves all other fields unchanged", () => {
    const r = makeResolution();
    const s = serializeResolution(r);
    expect(s.confidence).toBe(r.confidence);
    expect(s.modelId).toBe(r.modelId);
    expect(s.tierId).toBe(r.tierId);
    expect(s.latencyMs).toBe(r.latencyMs);
    expect(s.values).toStrictEqual(r.values);
    expect(s.fieldRelevance).toStrictEqual(r.fieldRelevance);
    expect(s.usage).toStrictEqual(r.usage);
  });

  it("produces JSON-serializable output", () => {
    const s = serializeResolution(makeResolution());
    expect(() => JSON.stringify(s)).not.toThrow();
    const parsed = JSON.parse(JSON.stringify(s)) as SerializableResolution;
    expect(parsed.hiddenFields).toEqual(["internalNote"]);
  });
});

describe("deserializeResolution", () => {
  it("converts hiddenFields array to ReadonlySet", () => {
    const s = serializeResolution(makeResolution());
    const r = deserializeResolution(s);
    expect(r.hiddenFields).toBeInstanceOf(Set);
    expect(r.hiddenFields.has("internalNote")).toBe(true);
  });

  it("converts requiredFields array to ReadonlySet", () => {
    const s = serializeResolution(makeResolution());
    const r = deserializeResolution(s);
    expect(r.requiredFields).toBeInstanceOf(Set);
    expect(r.requiredFields.has("name")).toBe(true);
    expect(r.requiredFields.has("email")).toBe(true);
  });
});

describe("round-trip", () => {
  it("serialize then deserialize restores original structure", () => {
    const original = makeResolution();
    const restored = deserializeResolution(serializeResolution(original));
    expect(restored.confidence).toBe(original.confidence);
    expect(restored.modelId).toBe(original.modelId);
    expect(restored.hiddenFields).toBeInstanceOf(Set);
    expect(restored.hiddenFields.has("internalNote")).toBe(true);
    expect(restored.requiredFields).toBeInstanceOf(Set);
    expect(restored.requiredFields.has("name")).toBe(true);
    expect(restored.values).toStrictEqual(original.values);
  });
});
