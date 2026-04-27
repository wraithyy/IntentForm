import type { AiProvider } from "@intentform/shared";

export interface OllamaProviderOptions {
  baseUrl?: string;
  model: string;
}

export function ollamaProvider(_options: OllamaProviderOptions): AiProvider {
  return {
    async generateStructured(_input) {
      throw new Error("Not implemented — Phase 8");
    },
  };
}
