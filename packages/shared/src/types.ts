export interface AiProvider {
  generateStructured(input: AiProviderInput): Promise<AiProviderOutput>
}

export interface AiProviderInput {
  prompt: string
  schema: unknown
  context?: Record<string, unknown>
}

export interface AiProviderOutput {
  data: unknown
  confidence: number
  usage?: {
    tokensIn: number
    tokensOut: number
    cost?: number
  }
}

export interface IntentResult {
  model: string
  values: Record<string, unknown>
  fieldRelevance: Record<string, number>
  confidence: number
}

export interface FieldDefinition {
  id: string
  label: string
  type: string
  required?: boolean
  description?: string
}

export interface Rule {
  field: string
  value: unknown
  effect: RuleEffect
  target: string
}

export type RuleEffect = 'show' | 'hide' | 'require' | 'unrequire'

export interface ConfidenceTier {
  id: string
  threshold?: number
  provider?: string
}

export interface ModelDefinition {
  id: string
  label: string
  description: string
  useCases: string[]
  fields: FieldDefinition[]
  rules: Rule[]
}
