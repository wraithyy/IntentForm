import type { AiProviderOutput, IntentResolution } from "@intentform/shared";
import { ModelRegistry } from "./model-registry.js";
import { evaluateRules } from "./rule-engine.js";
import { parseStructuredOutput } from "./structured-output-parser.js";
import { routeThroughTiers } from "./tier-router.js";
import type { IntentFormConfig, IntentFormEngine } from "./types.js";

function extractConfidence(output: AiProviderOutput): number {
  const parsed = parseStructuredOutput(output.data);
  return parsed.confidence;
}

export function createIntentForm(config: IntentFormConfig): IntentFormEngine {
  const registry = new ModelRegistry();
  registry.register(config.models);

  return {
    config,

    getModels() {
      return registry.getAll();
    },

    async resolveIntent(prompt: string): Promise<IntentResolution> {
      const input = { prompt, models: registry.getAll() };

      let output: AiProviderOutput;
      let tierId: string | undefined;

      if (config.tiers && config.tiers.length > 0) {
        const result = await routeThroughTiers(
          config.tiers,
          input,
          extractConfidence
        );
        output = result.output;
        tierId = result.tierId;
      } else {
        output = await config.provider.generateStructured(input);
      }

      const parsed = parseStructuredOutput(output.data);

      const model = registry.get(parsed.modelId);
      if (!model) {
        throw new Error(
          `Unknown model "${parsed.modelId}" returned by provider`
        );
      }

      const ruleResult = evaluateRules(
        model.rules,
        model.fields,
        parsed.values
      );

      return {
        modelId: parsed.modelId,
        values: parsed.values,
        fieldRelevance: parsed.fieldRelevance,
        confidence: parsed.confidence,
        hiddenFields: ruleResult.hiddenFields,
        requiredFields: ruleResult.requiredFields,
        ...(tierId !== undefined && { tierId }),
      };
    },
  };
}
