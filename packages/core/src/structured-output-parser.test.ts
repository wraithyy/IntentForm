import { describe, expect, it } from "vitest";
import {
  parseStructuredOutput,
  StructuredOutputParseError,
} from "./structured-output-parser.js";

describe("parseStructuredOutput", () => {
  it("parses valid input correctly", () => {
    const raw = {
      model: "accidentReport",
      values: { accidentType: "collision", location: "Main St" },
      fieldRelevance: { accidentType: 0.9, location: 0.7 },
      confidence: 0.85,
    };
    const result = parseStructuredOutput(raw);
    expect(result.modelId).toBe("accidentReport");
    expect(result.values).toEqual({
      accidentType: "collision",
      location: "Main St",
    });
    expect(result.fieldRelevance).toEqual({ accidentType: 0.9, location: 0.7 });
    expect(result.confidence).toBe(0.85);
  });

  it("throws StructuredOutputParseError when confidence is above 1", () => {
    const raw = { model: "test", confidence: 1.5 };
    expect(() => parseStructuredOutput(raw)).toThrow(
      StructuredOutputParseError
    );
  });

  it("throws StructuredOutputParseError when confidence is below 0", () => {
    const raw = { model: "test", confidence: -0.1 };
    expect(() => parseStructuredOutput(raw)).toThrow(
      StructuredOutputParseError
    );
  });

  it("throws StructuredOutputParseError when model field is missing", () => {
    const raw = { confidence: 0.8 };
    expect(() => parseStructuredOutput(raw)).toThrow(
      StructuredOutputParseError
    );
  });

  it("throws StructuredOutputParseError when model is empty string", () => {
    const raw = { model: "", confidence: 0.8 };
    expect(() => parseStructuredOutput(raw)).toThrow(
      StructuredOutputParseError
    );
  });

  it("throws StructuredOutputParseError when confidence is missing", () => {
    const raw = { model: "test" };
    expect(() => parseStructuredOutput(raw)).toThrow(
      StructuredOutputParseError
    );
  });

  it("values defaults to empty object when omitted", () => {
    const raw = { model: "test", confidence: 0.5 };
    const result = parseStructuredOutput(raw);
    expect(result.values).toEqual({});
  });

  it("fieldRelevance defaults to empty object when omitted", () => {
    const raw = { model: "test", confidence: 0.5 };
    const result = parseStructuredOutput(raw);
    expect(result.fieldRelevance).toEqual({});
  });

  it("throws StructuredOutputParseError for non-object input (null)", () => {
    expect(() => parseStructuredOutput(null)).toThrow(
      StructuredOutputParseError
    );
  });

  it("throws StructuredOutputParseError for non-object input (string)", () => {
    expect(() => parseStructuredOutput("not an object")).toThrow(
      StructuredOutputParseError
    );
  });

  it("thrown error is instanceof StructuredOutputParseError", () => {
    try {
      parseStructuredOutput(null);
    } catch (err) {
      expect(err).toBeInstanceOf(StructuredOutputParseError);
    }
  });

  it("thrown error has name StructuredOutputParseError", () => {
    try {
      parseStructuredOutput(null);
    } catch (err) {
      expect((err as StructuredOutputParseError).name).toBe(
        "StructuredOutputParseError"
      );
    }
  });
});
