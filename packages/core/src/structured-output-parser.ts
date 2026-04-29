import { z } from "zod";

const intentOutputSchema = z.object({
  model: z.string().min(1),
  values: z.record(z.string(), z.unknown()).default({}),
  fieldRelevance: z.record(z.string(), z.number().min(0).max(1)).default({}),
  confidence: z.number().min(0).max(1),
});

export interface ParsedIntentOutput {
  confidence: number;
  fieldRelevance: Record<string, number>;
  modelId: string;
  values: Record<string, unknown>;
}

export class StructuredOutputParseError extends Error {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super("Failed to parse AI structured output");
    this.name = "StructuredOutputParseError";
    this.cause = cause;
  }
}

export function parseStructuredOutput(raw: unknown): ParsedIntentOutput {
  const result = intentOutputSchema.safeParse(raw);

  if (!result.success) {
    throw new StructuredOutputParseError(result.error);
  }

  return {
    modelId: result.data.model,
    values: result.data.values,
    fieldRelevance: result.data.fieldRelevance,
    confidence: result.data.confidence,
  };
}
