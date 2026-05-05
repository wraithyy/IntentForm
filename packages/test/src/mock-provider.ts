import type { AiProvider, AiProviderOutput } from "@intentform/shared";

export interface MockProviderOptions {
  confidence?: number;
  fieldRelevance?: Record<string, number>;
  modelId: string;
  usage?: { cost?: number; tokensIn: number; tokensOut: number };
  values?: Record<string, unknown>;
}

/** Creates a mock AiProvider that returns a fixed structured output. */
export function mockProvider(options: MockProviderOptions): AiProvider {
  const output = {
    confidence: options.confidence ?? 0.9,
    fieldRelevance: options.fieldRelevance ?? {},
    model: options.modelId,
    values: options.values ?? {},
  };
  return {
    async generateStructured(): Promise<AiProviderOutput> {
      return {
        confidence: options.confidence ?? 0.9,
        data: output,
        ...(options.usage !== undefined && { usage: options.usage }),
      };
    },
  };
}

/** Creates a mock AiProvider that always throws. */
export function mockErrorProvider(message: string): AiProvider {
  return {
    async generateStructured(): Promise<never> {
      throw new Error(message);
    },
  };
}
