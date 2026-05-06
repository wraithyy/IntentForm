import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  parseStructuredOutput,
  StructuredOutputParseError,
} from "@intentform/core";
import type {
  AiProvider,
  AiProviderInput,
  AiProviderOutput,
  FieldDefinition,
  ModelDefinition,
} from "@intentform/shared";

export interface GoogleProviderOptions {
  apiKey: string;
  maxPromptLength?: number;
  model?: string;
  retries?: number;
  timeoutMs?: number;
}

const DEFAULT_MODEL = "gemini-1.5-flash";

async function withRetry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("Request timed out")), ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e as Error);
      }
    );
  });
}

function sanitizePromptString(value: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional control-char strip
  return value.replace(/[\r\n\t]/g, " ").replace(/[\u0000-\u001F\u007F]/g, "");
}

function buildFieldDescription(field: FieldDefinition): string {
  const parts: string[] = [
    `  - id: ${sanitizePromptString(field.id)}`,
    `    label: ${sanitizePromptString(field.label)}`,
    `    type: ${field.type}`,
    `    required: ${field.required === true ? "true" : "false"}`,
  ];

  if (field.description) {
    parts.push(`    description: ${sanitizePromptString(field.description)}`);
  }

  if (
    (field.type === "select" || field.type === "multiselect") &&
    field.options &&
    field.options.length > 0
  ) {
    const optionValues = field.options
      .map((o) => sanitizePromptString(o.value))
      .join(", ");
    parts.push(`    options: [${optionValues}]`);
  }

  return parts.join("\n");
}

function buildModelDescription(model: ModelDefinition): string {
  const fieldLines = model.fields.map(buildFieldDescription).join("\n");
  return [
    `Model id: ${sanitizePromptString(model.id)}`,
    `  label: ${sanitizePromptString(model.label)}`,
    `  description: ${sanitizePromptString(model.description)}`,
    `  useCases: ${model.useCases.map(sanitizePromptString).join(", ")}`,
    "  fields:",
    fieldLines,
  ].join("\n");
}

function buildSystemPrompt(models: ModelDefinition[]): string {
  const modelDescriptions = models.map(buildModelDescription).join("\n\n");

  return `You are a form-selection and data-extraction assistant. Your job is to analyse the user's natural language input and return a JSON object that tells a form system which form to show and what to pre-fill.

## Available models

${modelDescriptions}

## Output format

Return ONLY valid JSON (no markdown, no explanations) with exactly this shape:
{
  "model": "<model_id>",
  "values": {},
  "fieldRelevance": {},
  "confidence": 0.0
}

## Instructions

- "model": choose the model id whose description and useCases best match the user's intent.
- "values": extract values from the user's message for every field you can. Keys are field ids. Rules:
    - dates → ISO 8601 string (YYYY-MM-DD)
    - booleans → true or false (not strings)
    - select/multiselect → use exact option values listed above
    - numbers → numeric type, not strings
    - omit a field entirely if you cannot determine its value
- "fieldRelevance": for every field in the chosen model, assign a relevance score between 0 and 1 indicating how relevant/applicable that field is given the user's input.
- "confidence": a number between 0 and 1 representing your overall confidence in the model selection and extracted values.`;
}

interface StructuredOutput {
  confidence: number;
  fieldRelevance: Record<string, number>;
  model: string;
  values: Record<string, unknown>;
}

function parseAndValidateOutput(raw: string): StructuredOutput {
  let rawParsed: unknown;
  try {
    rawParsed = JSON.parse(raw);
  } catch {
    throw new Error("Google provider returned invalid JSON");
  }

  try {
    parseStructuredOutput(rawParsed);
  } catch (err) {
    if (err instanceof StructuredOutputParseError) {
      throw new Error(
        `Google provider returned malformed structured output: ${err.message}`
      );
    }
    throw err;
  }

  return rawParsed as StructuredOutput;
}

function buildOutputWithUsage(
  base: AiProviderOutput,
  usageMetadata:
    | { promptTokenCount?: number; candidatesTokenCount?: number }
    | undefined
): AiProviderOutput {
  const tokensIn = usageMetadata?.promptTokenCount ?? 0;
  const tokensOut = usageMetadata?.candidatesTokenCount ?? 0;

  if (tokensIn !== 0 || tokensOut !== 0) {
    return { ...base, usage: { tokensIn, tokensOut } };
  }

  return base;
}

export function googleProvider(options: GoogleProviderOptions): AiProvider {
  const genAI = new GoogleGenerativeAI(options.apiKey);
  const modelName = options.model ?? DEFAULT_MODEL;
  const maxPromptLength = options.maxPromptLength ?? 2000;

  return {
    async generateStructured(
      input: AiProviderInput
    ): Promise<AiProviderOutput> {
      if (input.prompt.length > maxPromptLength) {
        throw new Error(
          `Google provider: prompt exceeds maxPromptLength (${input.prompt.length} > ${maxPromptLength})`
        );
      }

      const systemPrompt = buildSystemPrompt(input.models);

      let raw: string;
      let usageMetadata:
        | { promptTokenCount?: number; candidatesTokenCount?: number }
        | undefined;

      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: { responseMimeType: "application/json" },
        });

        const generateCall = withRetry(
          () => model.generateContent(input.prompt),
          options.retries ?? 0
        );

        const result = await (options.timeoutMs === undefined
          ? generateCall
          : withTimeout(generateCall, options.timeoutMs));

        raw = result.response.text();
        usageMetadata = result.response.usageMetadata;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Google provider error: ${message}`);
      }

      const parsed = parseAndValidateOutput(raw);

      const baseOutput: AiProviderOutput = {
        confidence: parsed.confidence,
        data: parsed,
      };

      return buildOutputWithUsage(baseOutput, usageMetadata);
    },
  };
}
