import { z } from "zod";

export interface ServerConfig {
  apiKey: string;
  authToken: string | undefined;
  corsOrigins: string[] | undefined;
  host: string;
  logLevel: "debug" | "info" | "warn" | "error";
  modelsPath: string;
  ollamaBaseUrl: string | undefined;
  path: string;
  port: number;
  provider: "openai" | "anthropic" | "google" | "ollama";
}

const providerSchema = z.enum(["openai", "anthropic", "google", "ollama"]);

function resolveApiKey(
  provider: "openai" | "anthropic" | "google" | "ollama",
  env: NodeJS.ProcessEnv
): string {
  const providerKeyMap: Record<string, string | undefined> = {
    openai: env.OPENAI_API_KEY,
    anthropic: env.ANTHROPIC_API_KEY,
    google: env.GOOGLE_API_KEY,
    ollama: undefined,
  };
  const providerKey = providerKeyMap[provider];
  const fallback = env.INTENTFORM_API_KEY;
  const resolved = providerKey ?? fallback ?? "";
  return resolved;
}

function parseCorsOrigins(raw: string | undefined): string[] | undefined {
  if (!raw) {
    return;
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const envSchema = z.object({
  INTENTFORM_PROVIDER: z
    .string()
    .optional()
    .default("openai")
    .pipe(providerSchema),
  INTENTFORM_MODELS_PATH: z
    .string()
    .min(1, "INTENTFORM_MODELS_PATH is required"),
  INTENTFORM_PORT: z.coerce.number().int().positive().default(3001),
  INTENTFORM_HOST: z.string().optional().default("0.0.0.0"),
  INTENTFORM_PATH: z.string().optional().default("/api/intent"),
  INTENTFORM_AUTH_TOKEN: z.string().optional(),
  INTENTFORM_CORS_ORIGIN: z.string().optional(),
  INTENTFORM_OLLAMA_BASE_URL: z.string().url().optional(),
  INTENTFORM_LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .optional()
    .default("info"),
});

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    process.stderr.write(`Configuration error — ${missing}\n`);
    process.exit(1);
  }

  const data = result.data;
  const provider = data.INTENTFORM_PROVIDER;
  const apiKey = resolveApiKey(provider, env);

  if (provider !== "ollama" && !apiKey) {
    process.stderr.write(
      `Configuration error — API key required for provider "${provider}". ` +
        `Set ${provider.toUpperCase()}_API_KEY or INTENTFORM_API_KEY.\n`
    );
    process.exit(1);
  }

  return {
    provider,
    apiKey,
    ollamaBaseUrl: data.INTENTFORM_OLLAMA_BASE_URL,
    modelsPath: data.INTENTFORM_MODELS_PATH,
    port: data.INTENTFORM_PORT,
    host: data.INTENTFORM_HOST,
    path: data.INTENTFORM_PATH,
    authToken: data.INTENTFORM_AUTH_TOKEN,
    corsOrigins: parseCorsOrigins(data.INTENTFORM_CORS_ORIGIN),
    logLevel: data.INTENTFORM_LOG_LEVEL,
  };
}
