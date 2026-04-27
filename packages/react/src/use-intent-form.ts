import type { IntentFormEngine } from '@intentform/core'

export interface UseIntentFormOptions {
  engine: IntentFormEngine
  prompt: string
}

export function useIntentForm(_options: UseIntentFormOptions) {
  throw new Error('Not implemented — Phase 2')
}
