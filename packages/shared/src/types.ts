export interface AiProvider {
  generateStructured(input: AiProviderInput): Promise<AiProviderOutput>;
}

export interface AiProviderInput {
  context?: Record<string, unknown>;
  prompt: string;
  schema: unknown;
}

export interface AiProviderOutput {
  confidence: number;
  data: unknown;
  usage?: {
    tokensIn: number;
    tokensOut: number;
    cost?: number;
  };
}

export interface IntentResult {
  confidence: number;
  fieldRelevance: Record<string, number>;
  model: string;
  values: Record<string, unknown>;
}

export interface FieldDefinition {
  description?: string;
  id: string;
  label: string;
  required?: boolean;
  type: string;
}

export interface Rule {
  effect: RuleEffect;
  field: string;
  target: string;
  value: unknown;
}

export type RuleEffect = "show" | "hide" | "require" | "unrequire";

export interface ConfidenceTier {
  id: string;
  provider?: string;
  threshold?: number;
}

export interface ModelDefinition {
  description: string;
  fields: FieldDefinition[];
  id: string;
  label: string;
  rules: Rule[];
  useCases: string[];
}
