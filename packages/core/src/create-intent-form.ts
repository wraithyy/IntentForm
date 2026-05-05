import type {
  AiProviderInput,
  AiProviderOutput,
  IntentResolution,
  StandardSchemaV1,
} from "@intentform/shared";
import { IntentFormError, validateStandard } from "@intentform/shared";
import { ModelRegistry } from "./model-registry.js";
import { evaluateRules } from "./rule-engine.js";
import { parseStructuredOutput } from "./structured-output-parser.js";
import { routeThroughTiers } from "./tier-router.js";
import type {
  FieldComponentsMap,
  IntentFormConfig,
  IntentFormEngine,
} from "./types.js";

function extractConfidence(output: AiProviderOutput): number {
  const parsed = parseStructuredOutput(output.data);
  return parsed.confidence;
}

function validateConfig(config: IntentFormConfig): void {
  if (config.models.length === 0) {
    throw new IntentFormError("CONFIG", "models must not be empty");
  }
  const ids = config.models.map((m) => m.id);
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    throw new IntentFormError("CONFIG", "model IDs must be unique");
  }
  const hasProvider = config.provider !== undefined;
  const hasTiers = config.tiers !== undefined && config.tiers.length > 0;
  if (!(hasProvider || hasTiers)) {
    throw new IntentFormError("CONFIG", "provide either provider or tiers");
  }
  if (hasProvider && hasTiers) {
    throw new IntentFormError(
      "CONFIG",
      "provide either provider or tiers, not both"
    );
  }
}

async function fetchProviderOutput(
  config: IntentFormConfig,
  input: AiProviderInput
): Promise<{ output: AiProviderOutput; tierId?: string }> {
  if (config.tiers && config.tiers.length > 0) {
    const result = await routeThroughTiers(
      config.tiers,
      input,
      extractConfidence
    );
    return { output: result.output, tierId: result.tierId };
  }
  if (!config.provider) {
    throw new IntentFormError("PROVIDER", "No provider configured");
  }
  return { output: await config.provider.generateStructured(input) };
}

/** Creates an IntentForm engine from the given configuration. */
export function createIntentForm(config: IntentFormConfig): IntentFormEngine {
  validateConfig(config);

  const registry = new ModelRegistry();
  registry.register(config.models);

  const components: FieldComponentsMap = config.components ?? {};

  const inflight = new Map<string, Promise<IntentResolution>>();

  return {
    config,

    getComponents(): FieldComponentsMap {
      return components;
    },

    getModels() {
      return registry.getAll();
    },

    resolveIntent(prompt: string): Promise<IntentResolution> {
      const cached = inflight.get(prompt);
      if (cached !== undefined) {
        return cached;
      }

      const promise = (async () => {
        config.onResolutionStart?.(prompt);

        const startMs = Date.now();

        try {
          const input = { prompt, models: registry.getAll() };

          const { output, tierId } = await fetchProviderOutput(config, input);

          const parsed = parseStructuredOutput(output.data);

          const model = registry.get(parsed.modelId);
          if (!model) {
            throw new IntentFormError(
              "UNKNOWN_MODEL",
              `Unknown model "${parsed.modelId}" returned by provider`
            );
          }

          const ruleResult = evaluateRules(
            model.rules,
            model.fields,
            parsed.values
          );

          let resolvedValues: Record<string, unknown> = parsed.values;
          let validationIssues: readonly StandardSchemaV1.Issue[] | undefined;

          if (model.schema) {
            const validationResult = await validateStandard(
              model.schema,
              parsed.values
            );
            if (validationResult.success) {
              resolvedValues = validationResult.value as Record<
                string,
                unknown
              >;
            } else {
              validationIssues = validationResult.issues;
            }
          }

          const resolution: IntentResolution = {
            modelId: parsed.modelId,
            values: resolvedValues,
            fieldRelevance: parsed.fieldRelevance,
            confidence: parsed.confidence,
            hiddenFields: ruleResult.hiddenFields,
            requiredFields: ruleResult.requiredFields,
            latencyMs: Date.now() - startMs,
            ...(tierId !== undefined && { tierId }),
            ...(validationIssues !== undefined && { validationIssues }),
            ...(output.usage !== undefined && { usage: output.usage }),
          };

          config.onResolutionEnd?.(resolution);

          return resolution;
        } catch (err) {
          config.onError?.(err);
          throw err;
        }
      })().finally(() => {
        inflight.delete(prompt);
      });

      inflight.set(prompt, promise);
      return promise;
    },
  };
}
