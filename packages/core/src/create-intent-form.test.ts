import type {
  AiProvider,
  AiProviderInput,
  ConfidenceTier,
  ModelDefinition,
} from "@intentform/shared";
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
      // biome-ignore lint/suspicious/noThenProperty: Rule interface uses `then` for conditional action
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
  adapter: { id: "test-adapter" },
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

  it("throws Error when provider returns unknown modelId", async () => {
    const engine = createIntentForm({
      ...baseConfig,
      provider: makeProvider({
        model: "unknownModel",
        values: {},
        fieldRelevance: {},
        confidence: 0.5,
      }),
    });
    await expect(engine.resolveIntent("test")).rejects.toThrow(
      'Unknown model "unknownModel"'
    );
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
        ...baseConfig,
        provider: makeProvider(null),
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
        ...baseConfig,
        provider: makeProvider(null),
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
        ...baseConfig,
        provider: makeProvider(null),
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
});
