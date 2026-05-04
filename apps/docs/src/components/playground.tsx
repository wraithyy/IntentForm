import { createIntentForm } from "@intentform/core";
import { openaiProvider } from "@intentform/provider-openai";
import type { FieldComponents, FieldRendererProps } from "@intentform/react";
import { IntentForm } from "@intentform/react";
import type { ModelDefinition } from "@intentform/shared";
import { useMemo, useState } from "react";
import { z } from "zod";

const MODELS: ModelDefinition[] = [
  {
    id: "accident-report",
    label: "Accident Report",
    description: "Workplace accident documentation",
    useCases: ["accident", "injury", "workplace incident", "fell", "hurt"],
    schema: z.object({
      reporterName: z.string().optional(),
      date: z.string().optional(),
      location: z.string().optional(),
      injuryType: z.enum(["minor", "moderate", "severe"]).optional(),
      description: z.string().optional(),
    }),
    fields: [
      { id: "reporterName", type: "text", label: "Your Name", required: true },
      { id: "date", type: "date", label: "Date of Incident", required: true },
      { id: "location", type: "text", label: "Location", required: true },
      {
        id: "injuryType",
        type: "select",
        label: "Injury Severity",
        required: true,
        options: [
          { value: "minor", label: "Minor" },
          { value: "moderate", label: "Moderate" },
          { value: "severe", label: "Severe" },
        ],
      },
      {
        id: "description",
        type: "textarea",
        label: "What happened?",
        required: true,
      },
    ],
    rules: [],
  },
  {
    id: "support-ticket",
    label: "Support Ticket",
    description: "Customer support request",
    useCases: ["support", "help", "bug", "issue", "problem", "error", "broken"],
    schema: z.object({
      subject: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      category: z.enum(["billing", "technical", "account", "other"]).optional(),
      description: z.string().optional(),
    }),
    fields: [
      { id: "subject", type: "text", label: "Subject", required: true },
      {
        id: "priority",
        type: "select",
        label: "Priority",
        required: true,
        options: [
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
        ],
      },
      {
        id: "category",
        type: "select",
        label: "Category",
        required: true,
        options: [
          { value: "billing", label: "Billing" },
          { value: "technical", label: "Technical" },
          { value: "account", label: "Account" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "description",
        type: "textarea",
        label: "Describe your issue",
        required: true,
      },
    ],
    rules: [],
  },
];

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid var(--sl-color-gray-4)",
  background: "var(--sl-color-bg)",
  color: "var(--sl-color-text)",
  fontSize: "14px",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "4px",
  fontSize: "13px",
  fontWeight: 500,
  color: "var(--sl-color-text)",
};

const wrapStyle: React.CSSProperties = { marginBottom: "16px" };

function TextField({ field, value, onChange, required }: FieldRendererProps) {
  return (
    <div style={wrapStyle}>
      <label htmlFor={field.id} style={labelStyle}>
        {field.label}
        {required && (
          <span style={{ color: "var(--sl-color-red)", marginLeft: "2px" }}>
            *
          </span>
        )}
      </label>
      <input
        id={field.id}
        onChange={(e) => onChange(e.target.value)}
        style={fieldStyle}
        type="text"
        value={(value as string) ?? ""}
      />
    </div>
  );
}

function TextareaField({
  field,
  value,
  onChange,
  required,
}: FieldRendererProps) {
  return (
    <div style={wrapStyle}>
      <label htmlFor={field.id} style={labelStyle}>
        {field.label}
        {required && (
          <span style={{ color: "var(--sl-color-red)", marginLeft: "2px" }}>
            *
          </span>
        )}
      </label>
      <textarea
        id={field.id}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{ ...fieldStyle, resize: "vertical" }}
        value={(value as string) ?? ""}
      />
    </div>
  );
}

function SelectField({ field, value, onChange, required }: FieldRendererProps) {
  return (
    <div style={wrapStyle}>
      <label htmlFor={field.id} style={labelStyle}>
        {field.label}
        {required && (
          <span style={{ color: "var(--sl-color-red)", marginLeft: "2px" }}>
            *
          </span>
        )}
      </label>
      <select
        id={field.id}
        onChange={(e) => onChange(e.target.value)}
        style={fieldStyle}
        value={(value as string) ?? ""}
      >
        <option value="">Select…</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateField({ field, value, onChange, required }: FieldRendererProps) {
  return (
    <div style={wrapStyle}>
      <label htmlFor={field.id} style={labelStyle}>
        {field.label}
        {required && (
          <span style={{ color: "var(--sl-color-red)", marginLeft: "2px" }}>
            *
          </span>
        )}
      </label>
      <input
        id={field.id}
        onChange={(e) => onChange(e.target.value)}
        style={fieldStyle}
        type="date"
        value={(value as string) ?? ""}
      />
    </div>
  );
}

const components: FieldComponents = {
  text: TextField,
  textarea: TextareaField,
  select: SelectField,
  date: DateField,
  email: TextField,
  phone: TextField,
  number: ({ field, value, onChange, required }: FieldRendererProps) => (
    <div style={wrapStyle}>
      <label htmlFor={field.id} style={labelStyle}>
        {field.label}
        {required && (
          <span style={{ color: "var(--sl-color-red)", marginLeft: "2px" }}>
            *
          </span>
        )}
      </label>
      <input
        id={field.id}
        onChange={(e) => onChange(e.target.value)}
        style={fieldStyle}
        type="number"
        value={(value as string) ?? ""}
      />
    </div>
  ),
};

const EXAMPLE_INTENTS: Record<string, string> = {
  "accident-report":
    "I fell down the stairs at the main office on Monday, minor bruise on my left knee.",
  "support-ticket":
    "My billing page shows an error 500 when I try to update my credit card. It's urgent.",
};

export default function Playground() {
  const [apiKey, setApiKey] = useState("");
  const [intent, setIntent] = useState("");
  const [activeIntent, setActiveIntent] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0]?.id ?? "");

  const engine = useMemo(() => {
    if (!apiKey.trim()) {
      return null;
    }
    return createIntentForm({
      provider: openaiProvider({
        apiKey: apiKey.trim(),
        dangerouslyAllowBrowser: true,
      }),
      models: MODELS,
    });
  }, [apiKey]);

  const handleGenerate = () => {
    if (!(intent.trim() && engine)) {
      return;
    }
    setActiveIntent(intent.trim());
  };

  const handleExampleIntent = () => {
    setIntent(EXAMPLE_INTENTS[selectedModel] ?? "");
  };

  const sectionStyle: React.CSSProperties = { marginBottom: "20px" };
  const inputStyle: React.CSSProperties = { ...fieldStyle, marginTop: "4px" };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div
        style={{
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid var(--sl-color-gray-5)",
          background: "var(--sl-color-bg-sidebar)",
          marginBottom: "24px",
        }}
      >
        <div style={sectionStyle}>
          <label htmlFor="pg-api-key" style={labelStyle}>
            OpenAI API Key
          </label>
          <input
            id="pg-api-key"
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={inputStyle}
            type="password"
            value={apiKey}
          />
          <p
            style={{
              fontSize: "12px",
              color: "var(--sl-color-gray-3)",
              marginTop: "4px",
            }}
          >
            Stays in this browser tab only. Never sent anywhere except OpenAI
            directly.
          </p>
        </div>

        <div style={sectionStyle}>
          <label htmlFor="pg-model" style={labelStyle}>
            Demo Model
          </label>
          <select
            id="pg-model"
            onChange={(e) => setSelectedModel(e.target.value)}
            style={inputStyle}
            value={selectedModel}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div style={sectionStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <label htmlFor="pg-intent" style={labelStyle}>
              Intent
            </label>
            <button
              onClick={handleExampleIntent}
              style={{
                fontSize: "12px",
                color: "var(--sl-color-accent)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              type="button"
            >
              Use example
            </button>
          </div>
          <textarea
            id="pg-intent"
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Describe your situation in plain language…"
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            value={intent}
          />
        </div>

        <button
          disabled={!(apiKey.trim() && intent.trim())}
          onClick={handleGenerate}
          style={{
            padding: "10px 20px",
            background: "var(--sl-color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: apiKey.trim() && intent.trim() ? "pointer" : "not-allowed",
            opacity: apiKey.trim() && intent.trim() ? 1 : 0.5,
            fontWeight: 600,
            fontSize: "14px",
          }}
          type="button"
        >
          Generate Form
        </button>
      </div>

      {engine && activeIntent && (
        <div
          style={{
            padding: "24px",
            borderRadius: "8px",
            border: "1px solid var(--sl-color-accent)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "var(--sl-color-gray-3)",
              marginBottom: "16px",
              marginTop: 0,
            }}
          >
            Form pre-filled from: "{activeIntent}"
          </p>
          <IntentForm
            components={components}
            engine={engine}
            prompt={activeIntent}
          />
        </div>
      )}
    </div>
  );
}
