# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IntentForm** — production-grade open-source React library that transforms natural language user intent into dynamic, validated forms using pluggable AI providers.

Core flow: `Intent (natural language) → AI → Structured JSON → Form model selection → Field prefill + conditional logic → Rendered form`

**Golden Rule:** AI generates only structured JSON. Never JSX, raw HTML, imperative actions, or side effects.

## Tech Stack

- **Language:** TypeScript (strict, no `any`)
- **Runtime:** React
- **Package manager:** pnpm workspaces
- **Build:** ESM, tree-shakeable, optional SSR compatibility
- **Tests:** Vitest
- **Lint/Format:** ESLint + Prettier
- **Releases:** Changesets

## Repository Structure (planned)

```
apps/
  playground/       # local dev sandbox
  docs/             # documentation site

packages/
  core/             # engine: registry, provider interface, parser, rule engine
  react/            # <IntentForm />, hooks, renderer
  adapter-tanstack-form/
  adapter-react-hook-form/
  provider-openai/
  provider-anthropic/
  provider-google/
  provider-ollama/
  debug-ui/         # <IntentFormDebugPanel />
  shared/           # shared types, utilities
  examples/
```

## Commands (once scaffolded)

```bash
pnpm install          # install all workspace deps
pnpm build            # build all packages
pnpm test             # run all tests
pnpm test --filter <package>  # run tests for one package
pnpm lint             # lint all packages
pnpm format           # prettier all packages
pnpm changeset        # create a changeset for release
```

## Core Contracts

### AI Provider interface
```typescript
interface AiProvider {
  generateStructured(input): Promise<{
    data: unknown
    confidence: number
    usage?: { tokensIn: number; tokensOut: number; cost?: number }
  }>
}
```

### Model definition
```typescript
{
  id: string           // e.g. "accidentReport"
  label: string
  description: string
  useCases: string[]
  schema: ZodSchema
  fields: FieldDefinition[]
  rules: Rule[]
}
```

### Structured output shape (Phase 4+)
```typescript
{
  model: string
  values: Record<string, unknown>
  fieldRelevance: Record<string, number>
  confidence: number
}
```

## Public API Shape

```typescript
const engine = createIntentForm({
  adapter: tanstackAdapter(),
  provider: openaiProvider(),
  models: [...]
})

<IntentForm engine={engine} />
```

## Phased Execution Plan

| Phase | Goal |
|-------|------|
| 0 | Architecture RFC, package map, naming conventions, public API draft |
| 1 | Core runtime: `createIntentForm`, model registry, provider interface, parser |
| 2 | React MVP: `<IntentForm />`, hooks, renderer, loading/apply flow |
| 3 | TanStack Form adapter (first adapter) |
| 4 | Smart intent resolution: model selection, field scoring, suggested values |
| 5 | Confidence tier routing (cheap→smart→premium escalation) |
| 6 | Conditional logic engine: `when("field", "val").hide("otherField")` |
| 7 | Debug UI: `<IntentFormDebugPanel />` |
| 8 | Provider adapters: OpenAI, Anthropic, Google, Ollama |
| 9 | Docs site, examples (accident report, travel, HR, support, insurance) |
| 10 | v1 readiness: stable API, benchmarks, CI, releases |

**Rule:** Every phase must leave the repo in a working, testable state.

## Confidence Tier Routing (Phase 5)

```typescript
tiers: [
  { id: "fast",    threshold: 0.72 },
  { id: "smart",   threshold: 0.88 },
  { id: "premium" }                   // fallback, no threshold
]
```

Escalation triggers: low confidence, parse failure, missing required fields, rule conflict.

## Anti-Goals

Do not build: chatbot UI, no-code builder, provider lock-in, magic hidden behavior, overcomplicated monolith.
