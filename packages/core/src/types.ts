import type {
  AiProvider,
  ConfidenceTier,
  ModelDefinition,
} from "@intentform/shared";

export interface IntentFormConfig {
  adapter: FormAdapter;
  models: ModelDefinition[];
  provider: AiProvider | AiProvider[];
  tiers?: ConfidenceTier[];
}

export interface FormAdapter {
  id: string;
}

export interface IntentFormEngine {
  config: IntentFormConfig;
  resolveIntent(
    prompt: string
  ): Promise<import("@intentform/shared").IntentResult>;
}
