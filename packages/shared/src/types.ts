import type { StandardSchemaV1 } from "./standard-schema.js";

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

/** Describes a single form field rendered in the UI. */
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

/** Defines a form model with its schema, fields, and conditional rules. */
export interface ModelDefinition<
  TSchema extends StandardSchemaV1 = StandardSchemaV1,
> {
  description: string;
  fields: FieldDefinition[];
  id: string;
  label: string;
  rules: Rule[];
  schema?: TSchema;
  useCases: string[];
}

export interface AiProviderInput {
  context?: Record<string, unknown>;
  models: ModelDefinition[];
  prompt: string;
}

export type InferSchemaOutput<
  TSchema extends StandardSchemaV1 = StandardSchemaV1,
> = StandardSchemaV1.InferOutput<TSchema>;

export interface AiProviderOutput {
  confidence: number;
  data: unknown;
  usage?: {
    tokensIn: number;
    tokensOut: number;
    cost?: number;
  };
}

/** Contract for AI providers that generate structured form output from natural language. */
export interface AiProvider {
  generateStructured(input: AiProviderInput): Promise<AiProviderOutput>;
}

export interface ConfidenceTier {
  id: string;
  provider: AiProvider;
  threshold?: number;
}

export interface RuleEngineResult {
  hiddenFields: ReadonlySet<string>;
  requiredFields: ReadonlySet<string>;
}

/** The resolved output of an intent resolution pass, including prefilled values and rule effects. */
export interface IntentResolution<
  TValues extends Record<string, unknown> = Record<string, unknown>,
> {
  confidence: number;
  fieldRelevance: Record<string, number>;
  hiddenFields: ReadonlySet<string>;
  latencyMs?: number;
  modelId: string;
  requiredFields: ReadonlySet<string>;
  tierId?: string;
  usage?: { cost?: number; tokensIn: number; tokensOut: number };
  validationIssues?: readonly StandardSchemaV1.Issue[];
  values: TValues;
}

/** Type-safe helper that returns the model definition unchanged (enables generic type inference). */
export function defineModel<TSchema extends StandardSchemaV1>(
  def: ModelDefinition<TSchema>
): ModelDefinition<TSchema> {
  return def;
}
