import type { IntentFormEngine } from "@intentform/core";
import type { FieldDefinition, IntentResolution } from "@intentform/shared";
import type { ComponentType } from "react";

export type IntentFormStatus = "idle" | "loading" | "resolved" | "error";

export interface UseIntentFormReturn {
  error: string | null;
  reset: () => void;
  resolution: IntentResolution | null;
  resolve: (prompt: string) => Promise<void>;
  status: IntentFormStatus;
  updateValue: (fieldId: string, value: unknown) => void;
  values: Record<string, unknown>;
}

export interface FieldRendererProps {
  field: FieldDefinition;
  onChange: (value: unknown) => void;
  required: boolean;
  value: unknown;
}

export type FieldComponents = Partial<
  Record<FieldDefinition["type"], ComponentType<FieldRendererProps>>
>;

export interface IntentFormProps {
  components?: FieldComponents;
  engine: IntentFormEngine;
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  prompt?: string;
}
