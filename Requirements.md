:::writing{variant=“standard” id=“48220”}

IntentForm — Full Development Brief for AI Engineering Agent

Mission

Build IntentForm, a production-grade open-source library for React ecosystems that transforms natural language user intent into dynamic, validated forms using pluggable AI providers.

IntentForm should become the leading OSS solution for:

Intent → Structured Form → Validated Submission

This is not a chatbot product.

This is a developer platform / runtime that helps teams build AI-native forms safely and reliably.

⸻

Core Product Vision

Developers provide:
	1.	UI field components
	2.	Business form models
	3.	Validation schemas
	4.	Conditional visibility rules
	5.	AI model providers / confidence tiers

IntentForm handles:
	•	intent detection
	•	form model selection
	•	field relevance scoring
	•	field prefill values
	•	conditional show/hide logic
	•	form rendering
	•	model escalation based on confidence
	•	safe structured outputs

⸻

Golden Rule

AI must never generate:
	•	JSX
	•	raw HTML
	•	imperative business actions
	•	side effects

AI may only generate structured JSON outputs.

⸻

Primary Example

<IntentForm prompt="I hit a deer near Prague." />

System output:
	•	model = accidentReport
	•	accidentType = animal
	•	location = Prague
	•	hide otherVehiclePlate
	•	show damage fields
	•	request date/time

⸻

Strategic Product Positioning

IntentForm should be:
	•	developer-first
	•	TypeScript-first
	•	framework-friendly
	•	provider-agnostic
	•	enterprise-safe
	•	highly extensible
	•	extremely well documented
	•	easy to adopt incrementally

⸻

Important Engineering Requirement

Work in Phases

Do not attempt to build everything at once.

First decompose the project into small logical milestones.

Then build iteratively in production-ready phases.

Every phase must leave the repo in a working state.

⸻

Important Process Requirement

Use Subagents Aggressively

Whenever beneficial, split work across specialized subagents such as:

Architecture Agent
	•	package boundaries
	•	contracts
	•	public APIs

TypeScript Agent
	•	typings
	•	generics
	•	schema ergonomics

React Agent
	•	hooks
	•	rendering layer
	•	DX APIs

AI Systems Agent
	•	prompting
	•	confidence scoring
	•	tier routing

OSS Agent
	•	README
	•	docs
	•	examples
	•	naming consistency
	•	contributor friendliness

QA Agent
	•	tests
	•	benchmarks
	•	validation scenarios

Use subagents frequently where parallelization or specialization improves quality.

⸻

Non-Negotiable Open Source Standards

IntentForm must feel like a serious OSS project suitable for GitHub traction.

Must include:
	•	clean architecture
	•	stable naming
	•	intuitive API
	•	docs-first mindset
	•	examples that actually run
	•	low setup friction
	•	semantic versioning readiness
	•	contributor-friendly repo
	•	modern tooling
	•	clear roadmap
	•	excellent README

Avoid hacky prototype feel.

⸻

Tech Stack

Use:
	•	TypeScript
	•	React
	•	pnpm workspace
	•	Vitest
	•	ESLint
	•	Prettier
	•	Changesets
	•	modern ESM builds
	•	tree shaking
	•	optional SSR compatibility

⸻

Repository Structure

apps/
  playground/
  docs/

packages/
  core/
  react/
  adapter-tanstack-form/
  adapter-react-hook-form/
  provider-openai/
  provider-anthropic/
  provider-google/
  provider-ollama/
  debug-ui/
  shared/
  examples/


⸻

PHASED EXECUTION PLAN

Phase 0 — Planning & Foundation

Goal

Create strong foundations before coding features.

Deliverables
	•	architecture RFC
	•	package map
	•	naming conventions
	•	public API draft
	•	coding standards
	•	contributor guide
	•	roadmap

Use Subagents
	•	Architecture Agent
	•	OSS Agent

⸻

Phase 1 — Core Runtime MVP

Goal

Build minimal usable engine.

Features
	•	model registry
	•	field schema registry
	•	provider interface
	•	structured output parser
	•	confidence result object
	•	rule engine basics

Deliverables

createIntentForm(...)
registerModels(...)
registerProviders(...)

Use Subagents
	•	Core Systems Agent
	•	TypeScript Agent

⸻

Phase 2 — React Integration MVP

Goal

Usable React experience.

Features
	•	<IntentForm />
	•	hooks
	•	renderer engine
	•	loading states
	•	apply suggestion flow

Use Subagents
	•	React Agent
	•	DX Agent

⸻

Phase 3 — TanStack Form Adapter

(Default first adapter)

Features
	•	value sync
	•	validation sync
	•	dirty state support
	•	controlled fields support

Use Subagents
	•	React Agent
	•	Forms Specialist Agent

⸻

Phase 4 — Smart Intent Resolution

Features
	•	model selection
	•	field relevance scoring
	•	suggested values
	•	visible/hidden fields

Output Example

{
  "model": "accidentReport",
  "values": {},
  "fieldRelevance": {},
  "confidence": 0.91
}

Use Subagents
	•	AI Systems Agent
	•	Prompt Engineering Agent

⸻

Phase 5 — Confidence Tier Routing

Goal

Cheap model first, escalate when needed.

Features

Tier config:

tiers: [
  { id: "fast", threshold: 0.72 },
  { id: "smart", threshold: 0.88 },
  { id: "premium" }
]

Routing logic:
	•	low confidence
	•	parse failure
	•	missing required fields
	•	rule conflict

Use Subagents
	•	AI Systems Agent
	•	Performance Agent

⸻

Phase 6 — Conditional Logic Engine

Features

when("accidentType", "animal").hide("otherVehiclePlate")

or JSON rules.

Include:
	•	show/hide
	•	require/unrequire
	•	value derivation hooks

Use Subagents
	•	Rules Engine Agent

⸻

Phase 7 — Debugging & Developer Tools

Features

<IntentFormDebugPanel />

Display:
	•	provider used
	•	selected tier
	•	confidence
	•	prompt
	•	raw output
	•	parsed output
	•	rule effects
	•	latency

Use Subagents
	•	DX Agent
	•	UI Agent

⸻

Phase 8 — Provider Ecosystem

Implement adapters for:
	•	OpenAI
	•	Anthropic
	•	Google
	•	Ollama

All behind common interface.

⸻

Phase 9 — Documentation & Adoption

Must Have
	•	Quickstart
	•	Concepts
	•	Provider setup
	•	Examples
	•	Recipes
	•	FAQ
	•	Contribution guide

Examples
	1.	Accident report
	2.	Travel request
	3.	HR onboarding
	4.	Support incident
	5.	Insurance claim

Use Subagents:
	•	OSS Agent
	•	Docs Agent

⸻

Phase 10 — v1 Readiness

Finalize
	•	stable API
	•	benchmark suite
	•	migration notes
	•	issue templates
	•	CI pipeline
	•	releases

⸻

Public API Goals

Should feel elegant:

const engine = createIntentForm({
  adapter: tanstackAdapter(),
  provider: openaiProvider(),
  models: [...]
})

<IntentForm engine={engine} />


⸻

AI Provider Contract

interface AiProvider {
  generateStructured(input): Promise<{
    data: unknown
    confidence: number
    usage?: {
      tokensIn: number
      tokensOut: number
      cost?: number
    }
  }>
}


⸻

Model Definition Contract

{
  id: "accidentReport",
  label: "Accident Report",
  description: "...",
  useCases: [],
  schema,
  fields,
  rules
}


⸻

Success Metrics

IntentForm should be considered successful if:
	•	developer can integrate in under 15 minutes
	•	examples run instantly
	•	JSON outputs are reliable
	•	API feels elegant
	•	docs are excellent
	•	community can add providers easily
	•	OSS users star / adopt willingly

⸻

Anti-Goals

Do NOT build:
	•	chatbot UI framework
	•	no-code builder first
	•	overcomplicated enterprise monolith
	•	provider lock-in
	•	magic hidden behavior

⸻

Execution Discipline

At every phase:
	1.	Break into small tasks
	2.	Assign subagents where useful
	3.	Build incrementally
	4.	Keep repo working
	5.	Add tests
	6.	Update docs
	7.	Preserve API quality

⸻

Immediate First Action

Start with:

Deliverable A

Architecture RFC + package boundaries.

Deliverable B

Minimal public API proposal.

Deliverable C

Phase-by-phase implementation backlog.

Then begin Phase 1.

⸻

Final Goal

Create an OSS project that developers describe as:

“This is the cleanest way to build AI-native forms in React.”
:::
