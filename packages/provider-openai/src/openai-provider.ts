import type { AiProvider } from '@intentform/shared'

export interface OpenAiProviderOptions {
  apiKey: string
  model?: string
}

export function openaiProvider(_options: OpenAiProviderOptions): AiProvider {
  return {
    async generateStructured(_input) {
      throw new Error('Not implemented — Phase 8')
    },
  }
}
