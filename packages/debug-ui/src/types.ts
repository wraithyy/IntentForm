import type { IntentResult } from "@intentform/shared";

export interface IntentFormDebugPanelProps {
  latencyMs?: number;
  prompt?: string;
  providerUsed?: string;
  rawOutput?: unknown;
  result?: IntentResult;
  tierSelected?: string;
}
