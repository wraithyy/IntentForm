# IntentForm

> Transform natural language intent into dynamic, validated forms.
> React-first · Provider-agnostic · TypeScript-native · Standard Schema

```tsx
const engine = createIntentForm({
  provider: openaiProvider({ apiKey: process.env.OPENAI_API_KEY }),
  models: [accidentReportModel, contactFormModel],
})

// User: "I hit a deer near Prague on Main Street"
// → selects accidentReport model
// → prefills location = "Prague"
// → hides witnessName/witnessPhone (single vehicle)
// → renders a pre-filled, schema-validated form
<IntentForm engine={engine} prompt={userInput} onSubmit={save} />
```

## Why IntentForm?

Traditional forms require users to understand your data model. IntentForm flips this: users describe what they need in plain language, and the form configures itself.

- **AI generates structured JSON only** — no JSX, no HTML, no imperative actions. Your form logic stays in your code.
- **Validator-agnostic** — attach any [Standard Schema](https://standardschema.dev/) (zod, valibot, arktype) to each model.
- **Provider-agnostic** — OpenAI, Anthropic, Google, Ollama, or your own.
- **Confidence tier routing** — escalate from cheap to premium models only when needed.
- **Conditional rules DSL** — `when("injured", true).require("severity")`.
- **Debug panel** — inspect model selection, confidence, field relevance, and raw prompts.

## Packages

| Package | Description |
|---------|-------------|
| `@intentform/core` | Engine: model registry, intent resolver, rule engine |
| `@intentform/react` | `<IntentForm />`, `useIntentForm` hook |
| `@intentform/adapter-tanstack-form` | TanStack Form adapter |
| `@intentform/adapter-react-hook-form` | React Hook Form adapter |
| `@intentform/provider-openai` | OpenAI (GPT-4o, GPT-4o-mini) |
| `@intentform/provider-anthropic` | Anthropic (Claude 3.5 Sonnet, Haiku) |
| `@intentform/provider-google` | Google AI (Gemini 1.5 Flash, Pro) |
| `@intentform/provider-ollama` | Ollama — run models locally |
| `@intentform/debug-ui` | `<IntentFormDebugPanel />` |
| `@intentform/server` | Web Fetch API route handler — proxy providers server-side |
| `@intentform/client` | Client-side engine that POSTs to a server endpoint — keeps API keys server-side |
| `@intentform/server-http` | Standalone HTTP sidecar — for Spring/Java/.NET/Go backends |
| `@intentform/test` | `mockProvider` / `mockErrorProvider` for testing |
| `@intentform/shared` | Shared TypeScript types |

## Quick start

```bash
npm install @intentform/core @intentform/react
npm install @intentform/provider-openai
npm install @intentform/adapter-tanstack-form @tanstack/react-form
```

### 1 — Define a model

```tsx
import { z } from "zod"
import { when } from "@intentform/core"
import type { ModelDefinition } from "@intentform/shared"

const accidentReport: ModelDefinition = {
  id: "accidentReport",
  label: "Accident Report",
  description: "Vehicle accident and incident reporting form",
  useCases: ["accident", "crash", "collision", "insurance claim"],

  schema: z.object({
    incidentDate: z.string(),
    location:     z.string().min(1),
    description:  z.string().min(10),
    injured:      z.boolean().optional(),
    severity:     z.enum(["low", "medium", "high", "critical"]).optional(),
    vehicleCount: z.number().int().min(1).optional(),
  }),

  fields: [
    { id: "incidentDate", label: "Date",        type: "date",     required: true },
    { id: "location",     label: "Location",    type: "text",     required: true },
    { id: "description",  label: "Description", type: "textarea", required: true },
    { id: "injured",      label: "Injuries?",   type: "boolean" },
    { id: "severity",     label: "Severity",    type: "select",
      options: [
        { label: "Low",      value: "low" },
        { label: "Medium",   value: "medium" },
        { label: "High",     value: "high" },
        { label: "Critical", value: "critical" },
      ],
    },
    { id: "vehicleCount", label: "Vehicles",    type: "number" },
  ],

  rules: [
    when("injured", false).hide("severity"),
    when("injured", true).require("severity"),
  ],
}
```

### 2 — Create the engine

```tsx
import { createIntentForm } from "@intentform/core"
import { openaiProvider }   from "@intentform/provider-openai"

const engine = createIntentForm({
  provider: openaiProvider({ apiKey: process.env.OPENAI_API_KEY }),
  models: [accidentReport],
})
```

> **Never** expose your API key in client-side code. Route through a backend proxy or server function.

### 3 — Render

```tsx
import { TanStackIntentForm } from "@intentform/adapter-tanstack-form"

function Page() {
  return (
    <TanStackIntentForm
      engine={engine}
      prompt="I had a fender bender on Main Street this morning"
      onSubmit={values => console.log(values)}
    />
  )
}
```

## Standard Schema

Attach any SS-compatible validator for both AI-output validation and form submission:

```tsx
// zod
schema: z.object({ name: z.string().min(1), email: z.string().email() })

// valibot
schema: v.object({ name: v.string(), email: v.pipe(v.string(), v.email()) })

// arktype
schema: type({ name: "string > 0", "email?": "string.email" })
```

The schema validates AI-returned values (with coercion) and blocks form submission if values are invalid.

## Confidence tier routing

Use a cheap model for most requests, escalate to smarter models only when confidence is low:

```tsx
const engine = createIntentForm({
  models: [...],
  tiers: [
    { id: "fast",    provider: openaiProvider({ model: "gpt-4o-mini" }), threshold: 0.72 },
    { id: "smart",   provider: openaiProvider({ model: "gpt-4o" }),      threshold: 0.88 },
    { id: "premium", provider: anthropicProvider({ model: "claude-3-5-sonnet-20241022" }) },
  ],
})
```

## Conditional rules

```tsx
rules: [
  when("urgency", "high").require("phone"),
  when("urgency", "low").hide("phone"),
  when("type", "commercial").require("companyName"),
]
```

Available effects: `hide` · `show` · `require` · `unrequire`

## Debug panel

```tsx
import { IntentFormDebugPanel } from "@intentform/debug-ui"

{import.meta.env.DEV && (
  <IntentFormDebugPanel status={status} resolution={resolution} />
)}
```

Shows: model selection · confidence bar · field relevance · applied rules · provider stats · raw prompt.

## Lifecycle hooks

```tsx
const engine = createIntentForm({
  provider: openaiProvider({ apiKey: process.env.OPENAI_API_KEY }),
  models: [...],
  onResolutionStart: (prompt) => console.log("Resolving:", prompt),
  onResolutionEnd:   (res)    => analytics.track("intent_resolved", { modelId: res.modelId, latencyMs: res.latencyMs }),
  onError:           (err)    => errorTracker.capture(err),
})
```

`onResolutionEnd` receives the full `IntentResolution` including `latencyMs` (wall-clock ms) and `usage` (tokens in/out).

## Server-side proxy

Keep your API keys out of the browser by routing intent resolution through a server:

```ts
// Next.js App Router — app/api/intent/route.ts
import { createIntentFormRoute } from "@intentform/server"
import { engine } from "@/lib/engine"

const handler = createIntentFormRoute(engine)
export { handler as POST }
```

```ts
// Hono / Cloudflare Workers
import { createIntentFormRoute } from "@intentform/server"

app.post("/api/intent", (c) => {
  const handler = createIntentFormRoute(engine)
  return handler(c.req.raw)
})
```

The handler accepts `POST` with body `{ "prompt": "..." }` and returns JSON `IntentResolution`.

## Non-Node backends (Spring, Java, .NET, Go)

If your backend is not Node.js, run `@intentform/server-http` as a sidecar. Your backend proxies intent requests to the Node service; the API key never reaches the browser.

```bash
# Start the IntentForm sidecar
OPENAI_API_KEY=sk-... \
INTENTFORM_MODELS_PATH=/app/models.js \
INTENTFORM_AUTH_TOKEN=your-shared-secret \
npx @intentform/server-http
```

On the client, use `@intentform/client` pointing at the sidecar:

```ts
import { createClientIntentForm } from "@intentform/client"
import { models } from "./models.js"

const engine = createClientIntentForm({
  endpoint: "/api/intent",  // proxied through your Spring API
  models,
})
```

Spring controller proxies to the sidecar:

```java
@PostMapping("/api/intent")
public IntentResolution resolve(@RequestBody IntentRequest req) {
    HttpHeaders h = new HttpHeaders();
    h.setBearerAuth(System.getenv("INTENTFORM_AUTH_TOKEN"));
    return restTemplate.postForObject(
        "http://intentform:3001/api/intent",
        new HttpEntity<>(req, h),
        IntentResolution.class
    );
}
```

See [`@intentform/server-http`](./packages/server-http/README.md) for Docker Compose setup, all ENV vars, and K8s health probes.

## Architecture

The core flow is always the same:

```
user intent (text)
  → AI provider (structured JSON)
  → envelope parse
  → Standard Schema validation + coercion
  → rule engine (show/hide/require)
  → IntentResolution
  → form adapter (TanStack Form / RHF)
  → rendered, pre-filled, validated form
```

The AI generates **only structured JSON**. No JSX, no HTML, no side effects. All form logic lives in your code.

## Development

```bash
pnpm install      # install all workspace dependencies
pnpm build        # build all packages
pnpm test         # run all tests
pnpm check        # lint check
pnpm fix          # lint auto-fix
pnpm changeset    # create a changeset for release
```

## Roadmap

### v0.2.0 — Conversational forms
- **Streaming responses** — fields fill progressively as AI tokens arrive (`generateStructuredStream` on providers)
- **Multi-turn refinement** — `engine.refineIntent(prompt, previousResolution)` merges follow-up intent into existing values; turns one-shot generation into a conversation
- **`@intentform/zod`** — `zodToFields(schema)` auto-derives `fields[]` from a Zod schema, eliminating manual `FieldDefinition[]` declarations

### v0.3.0 — Ecosystem
- **Middleware / plugin system** — pre-AI hooks (PII redaction, prompt rewriting) and post-AI hooks (normalization, audit log); enables `@intentform/redact-pii` and compliance use-cases
- **Custom field type registry** — `registerFieldType("signature", { render, validate })` beyond the built-in `text | select | number | boolean | date | email | textarea`
- **`@intentform/valibot`** — Valibot mirror of `@intentform/zod`

### Later
- Persistent cache layer (localStorage / Redis adapter)
- Voice input (`useVoicePrompt()` — Web Speech API)
- React Native adapter (`@intentform/react-native`)
- CLI codegen (`intentform codegen` → typed `IntentResolution<TModel>`)
- DevTools browser extension

## License

MIT
