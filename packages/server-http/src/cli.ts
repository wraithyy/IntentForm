#!/usr/bin/env node
import { createIntentForm } from "@intentform/core";
import type { AuthConfig } from "./auth.js";
import { loadConfig } from "./config.js";
import type { CorsConfig } from "./cors.js";
import { createServer } from "./create-server.js";
import { loadModels } from "./load-models.js";

async function main(): Promise<void> {
  const config = loadConfig();

  if (!config.authToken) {
    process.stderr.write(
      "Warning: INTENTFORM_AUTH_TOKEN not set — server is unauthenticated\n"
    );
  }

  const models = await loadModels(config.modelsPath);

  const providerMap = {
    openai: () =>
      import("@intentform/provider-openai").then((m) =>
        m.openaiProvider({ apiKey: config.apiKey })
      ),
    anthropic: () =>
      import("@intentform/provider-anthropic").then((m) =>
        m.anthropicProvider({ apiKey: config.apiKey })
      ),
    google: () =>
      import("@intentform/provider-google").then((m) =>
        m.googleProvider({ apiKey: config.apiKey })
      ),
    ollama: () =>
      import("@intentform/provider-ollama").then((m) =>
        m.ollamaProvider({
          model: "llama3.2",
          ...(config.ollamaBaseUrl ? { baseUrl: config.ollamaBaseUrl } : {}),
        })
      ),
  };

  const provider = await providerMap[config.provider]();

  const engine = createIntentForm({ provider, models });

  const auth: AuthConfig = config.authToken
    ? { type: "bearer", token: config.authToken }
    : false;

  const cors: CorsConfig | undefined = config.corsOrigins
    ? { origin: config.corsOrigins }
    : undefined;

  const server = createServer({
    engine,
    port: config.port,
    host: config.host,
    path: config.path,
    auth,
    ...(cors === undefined ? {} : { cors }),
  });

  await server.listen();

  process.stdout.write(
    `@intentform/server-http listening on http://${config.host}:${server.port}${config.path}\n`
  );

  function shutdown(): void {
    server
      .close()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`Fatal error: ${message}\n`);
  process.exit(1);
});
