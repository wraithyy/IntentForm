import type {
  AiProvider,
  AiProviderInput,
  ConfidenceTier,
  ModelDefinition,
  StandardSchemaV1,
} from "@intentform/shared";
import { IntentFormError } from "@intentform/shared";
import { describe, expect, it, vi } from "vitest";
import { createIntentForm } from "./create-intent-form.js";
import { StructuredOutputParseError } from "./structured-output-parser.js";

const accidentModel: ModelDefinition = {
  id: "accidentReport",
  label: "Accident Report",
  description: "Report a vehicle accident",
  useCases: ["vehicle accident"],
  fields: [
    { id: "accidentType", label: "Type", type: "select", required: true },
    { id: "otherVehiclePlate", label: "Other Vehicle Plate", type: "text" },
  ],
  rules: [
    {
      when: { field: "accidentType", value: "animal" },
      then: { effect: "hide", target: "otherVehiclePlate" },
    },
  ],
};

function makeProvider(data: unknown, confidence = 0.9): AiProvider {
  return {
    generateStructured: vi.fn().mockResolvedValue({ data, confidence }),
  };
}

function makeValidData(confidence: number): unknown {
  return {
    model: "accidentReport",
    values: { accidentType: "collision" },
    fieldRelevance: {},
    confidence,
  };
}

function makeTier(
  id: string,
  confidence: number,
  threshold?: number
): ConfidenceTier {
  return {
    id,
    provider: makeProvider(makeValidData(confidence)),
    ...(threshold !== undefined && { threshold }),
  };
}

const baseConfig = {
  models: [accidentModel],
};

describe("createIntentForm", () => {
  it("getModels returns models from config", () => {
    const engine = createIntentForm({
      ...baseConfig,
      provider: makeProvider(null),
    });
    expect(engine.getModels()).toEqual([accidentModel]);
  });

  it("resolveIntent calls provider with prompt and all models", async () => {
    const provider = makeProvider({
      model: "accidentReport",
      values: { accidentType: "collision" },
      fieldRelevance: {},
      confidence: 0.8,
    });
    const engine = createIntentForm({ ...baseConfig, provider });
    await engine.resolveIntent("I had a car accident");
    expect(provider.generateStructured).toHaveBeenCalledWith<[AiProviderInput]>(
      {
        prompt: "I had a car accident",
        models: [accidentModel],
      }
    );
  });

  it("valid provider output returns correctly shaped IntentResolution", async () => {
    const engine = createIntentForm({
      ...baseConfig,
      provider: makeProvider({
        model: "accidentReport",
        values: { accidentType: "collision", otherVehiclePlate: "XY-123" },
        fieldRelevance: { accidentType: 0.95 },
        confidence: 0.88,
      }),
    });
    const result = await engine.resolveIntent("accident with other car");
    expect(result.modelId).toBe("accidentReport");
    expect(result.confidence).toBe(0.88);
    expect(result.values).toEqual({
      accidentType: "collision",
      otherVehiclePlate: "XY-123",
    });
    expect(result.fieldRelevance).toEqual({ accidentType: 0.95 });
    expect(result.hiddenFields).toBeInstanceOf(Set);
    expect(result.requiredFields).toBeInstanceOf(Set);
  });

  it("throws IntentFormError(UNKNOWN_MODEL) when provider returns unknown modelId", async () => {
    const engine = createIntentForm({
      ...baseConfig,
      provider: makeProvider({
        model: "unknownModel",
        values: {},
        fieldRelevance: {},
        confidence: 0.5,
      }),
    });
    const err = await engine.resolveIntent("test").catch((e) => e);
    expect(err).toBeInstanceOf(IntentFormError);
    expect((err as IntentFormError).code).toBe("UNKNOWN_MODEL");
  });

  describe("config validation", () => {
    it("throws IntentFormError(CONFIG) when models is empty", () => {
      expect(() =>
        createIntentForm({ models: [], provider: makeProvider(null) })
      ).toThrow(IntentFormError);
    });

    it("throws IntentFormError(CONFIG) when model IDs are not unique", () => {
      const dup = { ...accidentModel, id: "accidentReport" };
      expect(() =>
        createIntentForm({
          models: [accidentModel, dup],
          provider: makeProvider(null),
        })
      ).toThrow(IntentFormError);
    });

    it("throws IntentFormError(CONFIG) when neither provider nor tiers given", () => {
      expect(() =>
        createIntentForm({ models: [accidentModel] } as Parameters<
          typeof createIntentForm
        >[0])
      ).toThrow(IntentFormError);
    });

    it("throws IntentFormError(CONFIG) when both provider and tiers given", () => {
      const tier = makeTier("fast", 0.9, 0.72);
      expect(() =>
        createIntentForm({
          models: [accidentModel],
          provider: makeProvider(null),
          tiers: [tier],
        })
      ).toThrow(IntentFormError);
    });
  });

  it("throws StructuredOutputParseError when provider output fails parse", async () => {
    const engine = createIntentForm({
      ...baseConfig,
      provider: makeProvider({ broken: true }),
    });
    await expect(engine.resolveIntent("test")).rejects.toThrow(
      StructuredOutputParseError
    );
  });

  it("rules are applied: accidentType=animal hides otherVehiclePlate", async () => {
    const engine = createIntentForm({
      ...baseConfig,
      provider: makeProvider({
        model: "accidentReport",
        values: { accidentType: "animal" },
        fieldRelevance: {},
        confidence: 0.9,
      }),
    });
    const result = await engine.resolveIntent("I hit a deer");
    expect(result.hiddenFields.has("otherVehiclePlate")).toBe(true);
  });

  it("rules are not applied when condition does not match", async () => {
    const engine = createIntentForm({
      ...baseConfig,
      provider: makeProvider({
        model: "accidentReport",
        values: { accidentType: "collision" },
        fieldRelevance: {},
        confidence: 0.9,
      }),
    });
    const result = await engine.resolveIntent("I hit another car");
    expect(result.hiddenFields.has("otherVehiclePlate")).toBe(false);
  });

  it("resolveIntent is async and returns a Promise", () => {
    const engine = createIntentForm({
      ...baseConfig,
      provider: makeProvider({
        model: "accidentReport",
        values: {},
        fieldRelevance: {},
        confidence: 0.7,
      }),
    });
    const result = engine.resolveIntent("test");
    expect(result).toBeInstanceOf(Promise);
  });

  it("config is accessible on the engine", () => {
    const config = { ...baseConfig, provider: makeProvider(null) };
    const engine = createIntentForm(config);
    expect(engine.config).toBe(config);
  });

  describe("tier routing", () => {
    it("single tier with high confidence is accepted immediately", async () => {
      const tier = makeTier("fast", 0.95, 0.72);
      const engine = createIntentForm({
        models: [accidentModel],
        tiers: [tier],
      });
      const result = await engine.resolveIntent("I had an accident");
      expect(result.tierId).toBe("fast");
      expect(tier.provider.generateStructured).toHaveBeenCalledOnce();
    });

    it("first tier below threshold escalates to second tier", async () => {
      const fastTier = makeTier("fast", 0.5, 0.72);
      const smartTier = makeTier("smart", 0.9, 0.88);
      const engine = createIntentForm({
        models: [accidentModel],
        tiers: [fastTier, smartTier],
      });
      const result = await engine.resolveIntent("complex accident scenario");
      expect(result.tierId).toBe("smart");
      expect(fastTier.provider.generateStructured).toHaveBeenCalledOnce();
      expect(smartTier.provider.generateStructured).toHaveBeenCalledOnce();
    });

    it("all tiers below threshold returns last tier result as best effort", async () => {
      const fastTier = makeTier("fast", 0.3, 0.72);
      const smartTier = makeTier("smart", 0.5, 0.88);
      const premiumTier = makeTier("premium", 0.6);
      const engine = createIntentForm({
        models: [accidentModel],
        tiers: [fastTier, smartTier, premiumTier],
      });
      const result = await engine.resolveIntent("very ambiguous input");
      expect(result.tierId).toBe("premium");
      expect(fastTier.provider.generateStructured).toHaveBeenCalledOnce();
      expect(smartTier.provider.generateStructured).toHaveBeenCalledOnce();
      expect(premiumTier.provider.generateStructured).toHaveBeenCalledOnce();
    });

    it("tierId is undefined when no tiers configured", async () => {
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider({
          model: "accidentReport",
          values: {},
          fieldRelevance: {},
          confidence: 0.9,
        }),
      });
      const result = await engine.resolveIntent("test");
      expect(result.tierId).toBeUndefined();
    });
  });

  describe("schema validation", () => {
    function makeSchemaModel(): ModelDefinition {
      const schema: StandardSchemaV1 = {
        "~standard": {
          version: 1,
          vendor: "test",
          validate: (v) => {
            const obj = v as Record<string, unknown>;
            if (typeof obj.accidentType !== "string") {
              return { issues: [{ message: "accidentType must be a string" }] };
            }
            return {
              value: {
                ...obj,
                accidentType: (obj.accidentType as string).toUpperCase(),
              },
            };
          },
        },
      };
      return { ...accidentModel, schema };
    }

    it("uses coerced values from schema when validation succeeds", async () => {
      const engine = createIntentForm({
        models: [makeSchemaModel()],
        provider: makeProvider({
          model: "accidentReport",
          values: { accidentType: "collision" },
          fieldRelevance: {},
          confidence: 0.9,
        }),
      });
      const result = await engine.resolveIntent("accident");
      expect(result.values.accidentType).toBe("COLLISION");
      expect(result.validationIssues).toBeUndefined();
    });

    it("attaches validationIssues when schema validation fails", async () => {
      const engine = createIntentForm({
        models: [makeSchemaModel()],
        provider: makeProvider({
          model: "accidentReport",
          values: { accidentType: 123 },
          fieldRelevance: {},
          confidence: 0.9,
        }),
      });
      const result = await engine.resolveIntent("accident");
      expect(result.validationIssues).toBeDefined();
      expect(result.validationIssues?.[0]?.message).toBe(
        "accidentType must be a string"
      );
    });

    it("uses original values when schema validation fails", async () => {
      const engine = createIntentForm({
        models: [makeSchemaModel()],
        provider: makeProvider({
          model: "accidentReport",
          values: { accidentType: 123 },
          fieldRelevance: {},
          confidence: 0.9,
        }),
      });
      const result = await engine.resolveIntent("accident");
      expect(result.values.accidentType).toBe(123);
    });

    it("validationIssues is undefined when no schema on model", async () => {
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider({
          model: "accidentReport",
          values: { accidentType: "collision" },
          fieldRelevance: {},
          confidence: 0.9,
        }),
      });
      const result = await engine.resolveIntent("accident");
      expect(result.validationIssues).toBeUndefined();
    });
  });

  describe("lifecycle hooks", () => {
    const validData = {
      model: "accidentReport",
      values: { accidentType: "collision" },
      fieldRelevance: {},
      confidence: 0.9,
    };

    it("calls onResolutionStart with the prompt", async () => {
      const onResolutionStart = vi.fn();
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider(validData),
        onResolutionStart,
      });
      await engine.resolveIntent("I had an accident");
      expect(onResolutionStart).toHaveBeenCalledOnce();
      expect(onResolutionStart).toHaveBeenCalledWith("I had an accident");
    });

    it("calls onResolutionEnd with the final resolution", async () => {
      const onResolutionEnd = vi.fn();
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider(validData),
        onResolutionEnd,
      });
      const result = await engine.resolveIntent("test");
      expect(onResolutionEnd).toHaveBeenCalledOnce();
      expect(onResolutionEnd).toHaveBeenCalledWith(result);
    });

    it("calls onError and rethrows when provider fails", async () => {
      const onError = vi.fn();
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider({ broken: true }),
        onError,
      });
      await expect(engine.resolveIntent("test")).rejects.toThrow();
      expect(onError).toHaveBeenCalledOnce();
    });

    it("does not call onResolutionEnd when provider fails", async () => {
      const onResolutionEnd = vi.fn();
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider({ broken: true }),
        onResolutionEnd,
      });
      await expect(engine.resolveIntent("test")).rejects.toThrow();
      expect(onResolutionEnd).not.toHaveBeenCalled();
    });
  });

  describe("latencyMs and usage", () => {
    it("resolution includes latencyMs as a non-negative number", async () => {
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider({
          model: "accidentReport",
          values: {},
          fieldRelevance: {},
          confidence: 0.9,
        }),
      });
      const result = await engine.resolveIntent("test");
      expect(typeof result.latencyMs).toBe("number");
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it("resolution includes usage when provider returns it", async () => {
      const providerWithUsage: AiProvider = {
        generateStructured: vi.fn().mockResolvedValue({
          data: {
            model: "accidentReport",
            values: {},
            fieldRelevance: {},
            confidence: 0.9,
          },
          confidence: 0.9,
          usage: { tokensIn: 100, tokensOut: 50 },
        }),
      };
      const engine = createIntentForm({
        ...baseConfig,
        provider: providerWithUsage,
      });
      const result = await engine.resolveIntent("test");
      expect(result.usage?.tokensIn).toBe(100);
      expect(result.usage?.tokensOut).toBe(50);
    });

    it("resolution usage is undefined when provider omits it", async () => {
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider({
          model: "accidentReport",
          values: {},
          fieldRelevance: {},
          confidence: 0.9,
        }),
      });
      const result = await engine.resolveIntent("test");
      expect(result.usage).toBeUndefined();
    });
  });

  describe("request deduplication", () => {
    it("two simultaneous calls with the same prompt return the same Promise object", () => {
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider({
          model: "accidentReport",
          values: {},
          fieldRelevance: {},
          confidence: 0.9,
        }),
      });
      const p1 = engine.resolveIntent("same prompt");
      const p2 = engine.resolveIntent("same prompt");
      expect(Object.is(p1, p2)).toBe(true);
      // wait to avoid unhandled rejection
      return p1;
    });

    it("different prompts get different promise objects", () => {
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider({
          model: "accidentReport",
          values: {},
          fieldRelevance: {},
          confidence: 0.9,
        }),
      });
      const p1 = engine.resolveIntent("prompt one");
      const p2 = engine.resolveIntent("prompt two");
      expect(Object.is(p1, p2)).toBe(false);
      return Promise.all([p1, p2]);
    });

    it("after the first promise resolves, a new call creates a fresh promise", async () => {
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider({
          model: "accidentReport",
          values: {},
          fieldRelevance: {},
          confidence: 0.9,
        }),
      });
      const p1 = engine.resolveIntent("dedup prompt");
      await p1;
      const p2 = engine.resolveIntent("dedup prompt");
      expect(Object.is(p1, p2)).toBe(false);
      return p2;
    });
  });

  describe("getComponents", () => {
    it("returns empty object when components is not provided", () => {
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider(null),
      });
      expect(engine.getComponents()).toEqual({});
    });

    it("returns the components map passed to createIntentForm", () => {
      const components = {
        text: "MockTextComponent" as unknown,
        number: "MockNumberComponent" as unknown,
      };
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider(null),
        components,
      });
      expect(engine.getComponents()).toEqual(components);
    });

    it("getComponents returns a stable reference across calls", () => {
      const components = { text: "MockTextComponent" as unknown };
      const engine = createIntentForm({
        ...baseConfig,
        provider: makeProvider(null),
        components,
      });
      expect(engine.getComponents()).toBe(engine.getComponents());
    });
  });
});
