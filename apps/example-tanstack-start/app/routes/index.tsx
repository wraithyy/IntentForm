import type { TanStackFormInstance } from "@intentform/adapter-tanstack-form";
import { createClientIntentForm } from "@intentform/client";
import type { IntentResolution } from "@intentform/shared";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShadcnField } from "../components/shadcn-field.js";
import { Button } from "../components/ui/button.js";
import { Textarea } from "../components/ui/textarea.js";
import { accidentReportModel, contactFormModel } from "../models.js";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

const MODELS = [contactFormModel, accidentReportModel];

const intentEngine = createClientIntentForm({
  endpoint: "/api/intent",
  models: MODELS,
});

function IndexPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<IntentResolution | null>(null);
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(
    null
  );

  const model =
    resolution === null
      ? undefined
      : MODELS.find((m) => m.id === resolution.modelId);

  const form = useForm<Record<string, unknown>>({
    defaultValues: {} as Record<string, unknown>,
    onSubmit: async ({ value }) => {
      setSubmitted(value);
    },
  }) as TanStackFormInstance;

  async function handleResolve() {
    if (prompt.trim().length === 0) {
      return;
    }
    setLoading(true);
    setError(null);
    setSubmitted(null);
    try {
      const r = await intentEngine.resolveIntent(prompt);
      setResolution(r);
      form.update({ defaultValues: r.values });
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resolution failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 font-bold text-2xl">
        IntentForm — TanStack Start SSR
      </h1>
      <p className="mb-6 text-gray-500">
        API key stays server-side. Only the resolved form reaches your browser.
      </p>

      <div className="mb-6">
        <Textarea
          className="mb-2"
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. I had a car accident this morning on Main Street..."
          rows={3}
          value={prompt}
        />
        <Button
          disabled={loading || prompt.trim().length === 0}
          onClick={() => {
            handleResolve().catch(console.error);
          }}
        >
          {loading ? "Resolving..." : "Resolve Intent"}
        </Button>
      </div>

      {error !== null && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {resolution !== null && model !== undefined && (
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="mb-1 font-semibold text-lg">{model.label}</h2>
          <p className="mb-4 text-gray-500 text-sm">
            Confidence: {(resolution.confidence * 100).toFixed(0)}%
            {resolution.tierId !== undefined && ` · tier: ${resolution.tierId}`}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit().catch(console.error);
            }}
          >
            {model.fields.map((f) => (
              <ShadcnField
                field={f}
                form={form}
                hidden={resolution.hiddenFields.has(f.id)}
                key={f.id}
              />
            ))}
            <Button className="mt-2" type="submit">
              Submit
            </Button>
          </form>
        </div>
      )}

      {submitted !== null && (
        <div className="mt-6 rounded-lg border border-gray-200 p-4">
          <h3 className="mb-2 font-semibold text-sm">Submitted values:</h3>
          <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
