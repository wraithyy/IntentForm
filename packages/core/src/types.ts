import type { AiProvider, ConfidenceTier, ModelDefinition } from '@intentform/shared'

export interface IntentFormConfig {
  adapter: FormAdapter
  provider: AiProvider | AiProvider[]
  models: ModelDefinition[]
  tiers?: ConfidenceTier[]
}

export interface FormAdapter {
  id: string
}

export interface IntentFormEngine {
  config: IntentFormConfig
  resolveIntent(prompt: string): Promise<import('@intentform/shared').IntentResult>
}
