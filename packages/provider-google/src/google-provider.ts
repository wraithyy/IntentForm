import type { AiProvider } from "@intentform/shared";

export interface GoogleProviderOptions {
  apiKey: string;
  model?: string;
}

export function googleProvider(_options: GoogleProviderOptions): AiProvider {
  return {
    async generateStructured(_input) {
      throw new Error("Not implemented — Phase 8");
    },
  };
}
