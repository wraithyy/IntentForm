import type { AiProvider } from '@intentform/shared'

export interface AnthropicProviderOptions {
  apiKey: string
  model?: string
}

export function anthropicProvider(_options: AnthropicProviderOptions): AiProvider {
  return {
    async generateStructured(_input) {
      throw new Error('Not implemented — Phase 8')
    },
  }
}
