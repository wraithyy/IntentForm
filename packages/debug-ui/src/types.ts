import type { IntentResult } from '@intentform/shared'

export interface IntentFormDebugPanelProps {
  result?: IntentResult
  prompt?: string
  providerUsed?: string
  tierSelected?: string
  latencyMs?: number
  rawOutput?: unknown
}
