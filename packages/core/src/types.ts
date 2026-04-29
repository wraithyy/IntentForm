import type {
  AiProvider,
  ConfidenceTier,
  IntentResolution,
  ModelDefinition,
} from "@intentform/shared";

export interface FormAdapter {
  id: string;
}

export interface IntentFormConfig {
  adapter: FormAdapter;
  models: ModelDefinition[];
  provider: AiProvider;
  tiers?: ConfidenceTier[];
}

export interface IntentFormEngine {
  readonly config: IntentFormConfig;
  getModels(): ModelDefinition[];
  resolveIntent(prompt: string): Promise<IntentResolution>;
}
