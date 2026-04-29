export type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "boolean"
  | "email"
  | "phone"
  | "textarea";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDefinition {
  description?: string;
  id: string;
  label: string;
  options?: FieldOption[];
  placeholder?: string;
  required?: boolean;
  type: FieldType;
}

export type RuleEffect = "show" | "hide" | "require" | "unrequire";

export interface RuleCondition {
  field: string;
  value: unknown;
}

export interface RuleAction {
  effect: RuleEffect;
  target: string;
}

export interface Rule {
  then: RuleAction;
  when: RuleCondition;
}

export interface ConfidenceTier {
  id: string;
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

export interface AiProviderInput {
  context?: Record<string, unknown>;
  models: ModelDefinition[];
  prompt: string;
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

export interface AiProvider {
  generateStructured(input: AiProviderInput): Promise<AiProviderOutput>;
}

export interface RuleEngineResult {
  hiddenFields: ReadonlySet<string>;
  requiredFields: ReadonlySet<string>;
}

export interface IntentResolution {
  confidence: number;
  fieldRelevance: Record<string, number>;
  hiddenFields: ReadonlySet<string>;
  modelId: string;
  requiredFields: ReadonlySet<string>;
  values: Record<string, unknown>;
}
