import type { IntentFormEngine } from "@intentform/core";

export interface IntentFormProps {
  engine: IntentFormEngine;
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  prompt?: string;
}
