import type { IntentFormConfig, IntentFormEngine } from './types.js'

export function createIntentForm(config: IntentFormConfig): IntentFormEngine {
  return {
    config,
    async resolveIntent(_prompt: string) {
      throw new Error('Not implemented — Phase 4')
    },
  }
}
