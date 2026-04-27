# IntentForm

> Transform natural language intent into dynamic, validated forms. React-first. Provider-agnostic. TypeScript-native.

```tsx
const engine = createIntentForm({
  adapter: tanstackFormAdapter(),
  provider: openaiProvider({ apiKey: process.env.OPENAI_API_KEY }),
  models: [accidentReportModel],
})

<IntentForm engine={engine} prompt="I hit a deer near Prague." />
// → selects accidentReport model, prefills location=Prague, hides otherVehiclePlate
```

## Packages

| Package | Description |
|---------|-------------|
| `@intentform/core` | Engine: model registry, provider interface, intent resolver |
| `@intentform/react` | React components and hooks |
| `@intentform/adapter-tanstack-form` | TanStack Form adapter |
| `@intentform/adapter-react-hook-form` | React Hook Form adapter |
| `@intentform/provider-openai` | OpenAI provider |
| `@intentform/provider-anthropic` | Anthropic provider |
| `@intentform/provider-google` | Google AI provider |
| `@intentform/provider-ollama` | Ollama (local) provider |
| `@intentform/debug-ui` | Debug panel component |

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm check      # lint + format check
pnpm fix        # lint + format fix
```

## Status

Currently in Phase 0 (scaffolding). See [Requirements.md](./Requirements.md) for full roadmap.

## License

MIT
