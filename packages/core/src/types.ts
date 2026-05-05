import type {
  AiProvider,
  ConfidenceTier,
  FieldType,
  IntentResolution,
  ModelDefinition,
} from "@intentform/shared";

/**
 * Framework-agnostic map of field-type → component.
 * Values are typed as `unknown` to avoid pulling React (or any UI framework)
 * into the core package. The React layer narrows this to ComponentType<FieldRendererProps>.
 */
export type FieldComponentsMap = Partial<Record<FieldType, unknown>>;

/** Lifecycle hooks and routing options for an IntentForm engine instance. */
export interface IntentFormConfig {
  /** Optional map of field-type → UI component, used as engine-level defaults. */
  components?: FieldComponentsMap;
  /** List of model definitions the engine can select from. */
  models: ModelDefinition[];
  /** Called with any error thrown during intent resolution. */
  onError?: (error: unknown) => void;
  /** Called after a resolution completes successfully. */
  onResolutionEnd?: (resolution: IntentResolution) => void;
  /** Called at the start of each resolution with the raw prompt. */
  onResolutionStart?: (prompt: string) => void;
  /** Single AI provider; mutually exclusive with tiers. */
  provider?: AiProvider;
  /** Ordered confidence tiers for escalation routing; mutually exclusive with provider. */
  tiers?: ConfidenceTier[];
}

/** The live engine returned by createIntentForm — use this to query models and resolve intent. */
export interface IntentFormEngine {
  /** The config object passed to createIntentForm. */
  readonly config: IntentFormConfig;
  /** Returns the engine-level field component map (empty object if none was provided). */
  getComponents(): FieldComponentsMap;
  /** Returns all registered model definitions. */
  getModels(): ModelDefinition[];
  /** Resolves a natural-language prompt to a structured IntentResolution. */
  resolveIntent(prompt: string): Promise<IntentResolution>;
}
