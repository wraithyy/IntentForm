import type { IntentResolution } from "@intentform/shared";
import { ModelRegistry } from "./model-registry.js";
import { evaluateRules } from "./rule-engine.js";
import { parseStructuredOutput } from "./structured-output-parser.js";
import type { IntentFormConfig, IntentFormEngine } from "./types.js";

export function createIntentForm(config: IntentFormConfig): IntentFormEngine {
  const registry = new ModelRegistry();
  registry.register(config.models);

  return {
    config,

    getModels() {
      return registry.getAll();
    },

    async resolveIntent(prompt: string): Promise<IntentResolution> {
      const output = await config.provider.generateStructured({
        prompt,
        models: registry.getAll(),
      });

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
      };
    },
  };
}
