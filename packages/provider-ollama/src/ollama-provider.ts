import type {
  AiProvider,
  AiProviderInput,
  AiProviderOutput,
  FieldDefinition,
  ModelDefinition,
} from "@intentform/shared";

export interface OllamaProviderOptions {
  baseUrl?: string;
  model: string;
  retries?: number;
  timeoutMs?: number;
}

const DEFAULT_BASE_URL = "http://localhost:11434";

interface OllamaMessage {
  content: string;
  role: string;
}

interface OllamaRequestBody {
  format: "json";
  messages: OllamaMessage[];
  model: string;
  stream: false;
}

interface OllamaResponse {
  eval_count?: number;
  message: { content: string };
  prompt_eval_count?: number;
}

interface StructuredOutput {
  confidence: number;
  fieldRelevance: Record<string, number>;
  model: string;
  values: Record<string, unknown>;
}

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

export function ollamaProvider(options: OllamaProviderOptions): AiProvider {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const { model } = options;

  return {
    async generateStructured(
      input: AiProviderInput
    ): Promise<AiProviderOutput> {
      const systemPrompt = buildSystemPrompt(input.models);

      const body: OllamaRequestBody = {
        format: "json",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.prompt },
        ],
        model,
        stream: false,
      };

      let res: Response;
      try {
        const fetchCall = withRetry(
          () =>
            fetch(`${baseUrl}/api/chat`, {
              body: JSON.stringify(body),
              headers: { "Content-Type": "application/json" },
              method: "POST",
            }),
          options.retries ?? 0
        );

        res = await (options.timeoutMs === undefined
          ? fetchCall
          : withTimeout(fetchCall, options.timeoutMs));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Ollama provider error: ${message}`);
      }

      if (!res.ok) {
        throw new Error(`Ollama provider error: HTTP ${res.status}`);
      }

      let response: OllamaResponse;
      try {
        response = (await res.json()) as OllamaResponse;
      } catch {
        throw new Error("Ollama provider returned invalid response");
      }

      const raw = response.message.content;

      let parsed: StructuredOutput;
      try {
        parsed = JSON.parse(raw) as StructuredOutput;
      } catch {
        throw new Error("Ollama provider returned invalid JSON");
      }

      const baseOutput: AiProviderOutput = {
        confidence: parsed.confidence,
        data: parsed,
      };

      const tokensIn = response.prompt_eval_count;
      const tokensOut = response.eval_count;

      if (
        tokensIn !== undefined &&
        tokensIn > 0 &&
        tokensOut !== undefined &&
        tokensOut > 0
      ) {
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
