import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  AiProvider,
  AiProviderInput,
  AiProviderOutput,
  FieldDefinition,
  ModelDefinition,
} from "@intentform/shared";

export interface GoogleProviderOptions {
  apiKey: string;
  model?: string;
}

const DEFAULT_MODEL = "gemini-1.5-flash";

function buildFieldDescription(field: FieldDefinition): string {
  const parts: string[] = [
    `  - id: ${field.id}`,
    `    label: ${field.label}`,
    `    type: ${field.type}`,
    `    required: ${field.required === true ? "true" : "false"}`,
  ];

  if (field.description) {
    parts.push(`    description: ${field.description}`);
  }

  if (
    (field.type === "select" || field.type === "multiselect") &&
    field.options &&
    field.options.length > 0
  ) {
    const optionValues = field.options.map((o) => o.value).join(", ");
    parts.push(`    options: [${optionValues}]`);
  }

  return parts.join("\n");
}

function buildModelDescription(model: ModelDefinition): string {
  const fieldLines = model.fields.map(buildFieldDescription).join("\n");
  return [
    `Model id: ${model.id}`,
    `  label: ${model.label}`,
    `  description: ${model.description}`,
    `  useCases: ${model.useCases.join(", ")}`,
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

export function googleProvider(options: GoogleProviderOptions): AiProvider {
  const genAI = new GoogleGenerativeAI(options.apiKey);
  const modelName = options.model ?? DEFAULT_MODEL;

  return {
    async generateStructured(
      input: AiProviderInput
    ): Promise<AiProviderOutput> {
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

        const result = await model.generateContent(input.prompt);
        raw = result.response.text();
        usageMetadata = result.response.usageMetadata;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Google provider error: ${message}`);
      }

      let parsed: StructuredOutput;
      try {
        parsed = JSON.parse(raw) as StructuredOutput;
      } catch {
        throw new Error("Google provider returned invalid JSON");
      }

      const baseOutput: AiProviderOutput = {
        confidence: parsed.confidence,
        data: parsed,
      };

      const tokensIn = usageMetadata?.promptTokenCount ?? 0;
      const tokensOut = usageMetadata?.candidatesTokenCount ?? 0;

      if (tokensIn !== 0 || tokensOut !== 0) {
        return {
          ...baseOutput,
          usage: {
            tokensIn,
            tokensOut,
          },
        };
      }

      return baseOutput;
    },
  };
}
