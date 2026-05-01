import type { IntentResolution } from "@intentform/shared";

export interface IntentFormDebugPanelProps {
  confidence?: number;
  error?: string | null;
  fieldRelevance?: Record<string, number>;
  hiddenFields?: ReadonlySet<string>;
  latencyMs?: number;
  modelId?: string;
  prompt?: string;
  providerUsed?: string;
  requiredFields?: ReadonlySet<string>;
  resolution?: IntentResolution | null;
  status?: "idle" | "loading" | "resolved" | "error";
  tierSelected?: string;
  tokensIn?: number;
  tokensOut?: number;
  values?: Record<string, unknown>;
}
