# @intentform/server-http

> Standalone HTTP server for IntentForm — run intent resolution as a sidecar service next to any backend (Spring/Java, .NET, Django, Rails, Go).

## Why

- Non-Node backends can't use `@intentform/core` directly
- This package exposes a zero-config Node HTTP server
- Backend proxies through it; API key stays server-side, browser never sees it

```
[Browser] → [Spring API] → [@intentform/server-http] → [OpenAI/Anthropic/...]
                ↑                     ↑
           auth, business         API key, models, rules
```

## Install

```bash
npm install @intentform/server-http
```

## Quick start — CLI (zero Node code needed)

```bash
INTENTFORM_PROVIDER=openai \
OPENAI_API_KEY=sk-... \
INTENTFORM_MODELS_PATH=/app/models.js \
npx @intentform/server-http
```

Or with Docker:

```bash
docker run --rm \
  -e OPENAI_API_KEY=sk-... \
  -e INTENTFORM_MODELS_PATH=/app/models.js \
  -v $(pwd)/models.js:/app/models.js \
  -p 3001:3001 \
  intentform/server-http
```

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `INTENTFORM_PROVIDER` | no | `openai` | `openai` / `anthropic` / `google` / `ollama` |
| `OPENAI_API_KEY` | yes (openai) | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | yes (anthropic) | — | Anthropic API key |
| `GOOGLE_API_KEY` | yes (google) | — | Google AI API key |
| `INTENTFORM_API_KEY` | no | — | Generic fallback API key for any provider |
| `INTENTFORM_OLLAMA_BASE_URL` | no | `http://localhost:11434` | Ollama server URL |
| `INTENTFORM_MODELS_PATH` | yes | — | Absolute path to JS module exporting `models` array |
| `INTENTFORM_PORT` | no | `3001` | Listen port |
| `INTENTFORM_HOST` | no | `0.0.0.0` | Listen host |
| `INTENTFORM_PATH` | no | `/api/intent` | Route path for intent resolution |
| `INTENTFORM_AUTH_TOKEN` | no | — | Bearer token (if unset, server is unauthenticated — warning logged) |
| `INTENTFORM_CORS_ORIGIN` | no | — | Comma-separated allowed origins, e.g. `http://localhost:8080,https://app.example.com` |
| `INTENTFORM_LOG_LEVEL` | no | `info` | `debug` / `info` / `warn` / `error` |

## Endpoints

- `POST /api/intent` — body `{ "prompt": "..." }`, returns `IntentResolution` JSON
- `GET /health` — `{ "status": "ok", "uptime": 42.1, "models": ["accidentReport"] }` — suitable for Kubernetes liveness/readiness probes

## Programmatic API

For cases where you want to configure the server in code rather than ENV:

```typescript
import { createServer } from '@intentform/server-http'
import { createIntentForm } from '@intentform/core'
import { openaiProvider } from '@intentform/provider-openai'
import { models } from './models.js'

const engine = createIntentForm({
  provider: openaiProvider({ apiKey: process.env.OPENAI_API_KEY! }),
  models,
})

const server = createServer({
  engine,
  port: 3001,
  auth: { type: 'bearer', token: process.env.INTENTFORM_AUTH_TOKEN! },
  cors: { origin: ['http://spring-app:8080'] },
  path: '/api/intent',
})

await server.listen()
```

## Security

- **Auth:** pass `INTENTFORM_AUTH_TOKEN` — all `/api/intent` requests require `Authorization: Bearer <token>`. `/health` stays public.
- **CORS:** set `INTENTFORM_CORS_ORIGIN` to your frontend origin(s). CORS is off by default (suitable for server-to-server calls).
- Without `INTENTFORM_AUTH_TOKEN`, the server starts with a warning and accepts all requests — only suitable for private/internal networks.

## Spring integration example

Spring Boot controller that proxies to the sidecar:

```java
@RestController
public class IntentController {
    private final RestTemplate restTemplate;
    private final String intentFormUrl = "http://intentform:3001";

    @PostMapping("/api/form/intent")
    public IntentResolution resolveIntent(@RequestBody IntentRequest request, Principal user) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(System.getenv("INTENTFORM_AUTH_TOKEN"));
        headers.setContentType(MediaType.APPLICATION_JSON);
        return restTemplate.postForObject(
            intentFormUrl + "/api/intent",
            new HttpEntity<>(request, headers),
            IntentResolution.class
        );
    }
}
```

## Docker Compose with Spring

```yaml
services:
  spring-app:
    image: my-spring-app:latest
    ports:
      - "8080:8080"
    environment:
      INTENTFORM_AUTH_TOKEN: ${INTENTFORM_AUTH_TOKEN}
    depends_on:
      intentform:
        condition: service_healthy

  intentform:
    image: intentform/server-http:latest
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      INTENTFORM_MODELS_PATH: /app/models.js
      INTENTFORM_AUTH_TOKEN: ${INTENTFORM_AUTH_TOKEN}
      INTENTFORM_CORS_ORIGIN: http://localhost:8080
    volumes:
      - ./models.js:/app/models.js:ro
    ports:
      - "3001:3001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 10s
      timeout: 5s
      retries: 3
```

## models.js format

```javascript
// models.js — loaded by INTENTFORM_MODELS_PATH
export const models = [
  {
    id: 'accidentReport',
    label: 'Accident Report',
    description: 'Vehicle accident and incident reporting form',
    useCases: ['accident', 'crash', 'collision', 'insurance claim'],
    schema: { /* Standard Schema */ },
    fields: [ /* FieldDefinition[] */ ],
    rules: [],
  },
]
```
