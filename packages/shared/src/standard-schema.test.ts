import { describe, expect, it } from "vitest";
import type { StandardSchemaV1 } from "./standard-schema.js";
import { isStandardSchema, validateStandard } from "./standard-schema.js";

function makeSchema<T>(
  validate: (
    v: unknown
  ) => StandardSchemaV1.Result<T> | Promise<StandardSchemaV1.Result<T>>
): StandardSchemaV1<unknown, T> {
  return {
    "~standard": {
      version: 1,
      vendor: "test",
      validate,
    },
  };
}

describe("validateStandard", () => {
  it("returns success when schema validates", async () => {
    const schema = makeSchema<string>((v) => ({ value: v as string }));
    const result = await validateStandard(schema, "hello");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("hello");
    }
  });

  it("returns failure when schema rejects", async () => {
    const schema = makeSchema<string>(() => ({
      issues: [{ message: "must be a string" }],
    }));
    const result = await validateStandard(schema, 42);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.message).toBe("must be a string");
    }
  });

  it("handles async validate", async () => {
    const schema = makeSchema<number>((v) =>
      Promise.resolve({ value: v as number })
    );
    const result = await validateStandard(schema, 99);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(99);
    }
  });

  it("coerces value to validator output", async () => {
    const schema = makeSchema<number>((v) => ({
      value: Number(v),
    }));
    const result = await validateStandard(schema, "42");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(42);
    }
  });
});

describe("isStandardSchema", () => {
  it("returns true for valid standard schema", () => {
    const schema = makeSchema<unknown>((v) => ({ value: v }));
    expect(isStandardSchema(schema)).toBe(true);
  });

  it("returns false for null", () => {
    expect(isStandardSchema(null)).toBe(false);
  });

  it("returns false for plain object without ~standard", () => {
    expect(isStandardSchema({ version: 1 })).toBe(false);
  });

  it("returns false for non-object", () => {
    expect(isStandardSchema("string")).toBe(false);
  });
});
