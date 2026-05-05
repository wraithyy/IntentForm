import { createIntentForm } from "@intentform/core";
import { openaiProvider } from "@intentform/provider-openai";
import { IntentForm } from "@intentform/react";
import { useMemo, useState } from "react";
import { accidentReportModel, contactFormModel } from "./models.js";

const MODELS = [contactFormModel, accidentReportModel];

export function App() {
  const [inputText, setInputText] = useState("");
  const [activePrompt, setActivePrompt] = useState<string | undefined>(
    undefined
  );
  const [submittedValues, setSubmittedValues] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [apiKey, setApiKey] = useState<string>(
    (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) ?? ""
  );

  const engine = useMemo(
    () =>
      createIntentForm({
        models: MODELS,
        provider: openaiProvider({ apiKey, dangerouslyAllowBrowser: true }),
      }),
    [apiKey]
  );

  function handleResolve() {
    setActivePrompt(inputText);
    setSubmittedValues(null);
  }

  function handleSubmit(values: Record<string, unknown>) {
    setSubmittedValues(values);
  }

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "32px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 700 }}>
        IntentForm Playground
      </h1>
      <p style={{ margin: "0 0 28px", color: "#666", fontSize: 16 }}>
        Type your intent, get a form
      </p>

      <div style={{ marginBottom: 20 }}>
        <label
          htmlFor="apiKey"
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#444",
            marginBottom: 6,
          }}
        >
          OpenAI API key
        </label>
        <input
          id="apiKey"
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          style={{
            padding: "8px 10px",
            fontSize: 14,
            borderRadius: 5,
            border: "1px solid #ccc",
            boxSizing: "border-box",
            width: "100%",
          }}
          type="password"
          value={apiKey}
        />
        {apiKey.length === 0 && (
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#b45309" }}>
            Enter your OpenAI API key to use the playground
          </p>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <textarea
          onChange={(e) => {
            setInputText(e.target.value);
          }}
          placeholder="e.g. I need to report a car accident that happened today at Main St..."
          rows={4}
          style={{
            width: "100%",
            padding: 12,
            fontSize: 15,
            borderRadius: 6,
            border: "1px solid #ccc",
            boxSizing: "border-box",
            resize: "vertical",
            lineHeight: 1.5,
          }}
          value={inputText}
        />
      </div>

      <button
        onClick={handleResolve}
        style={{
          padding: "10px 24px",
          fontSize: 15,
          borderRadius: 6,
          background: "#1a1a1a",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontWeight: 500,
        }}
        type="button"
      >
        Resolve
      </button>

      {activePrompt !== undefined && (
        <div
          style={{
            marginTop: 36,
            padding: 24,
            borderRadius: 8,
            border: "1px solid #e5e5e5",
          }}
        >
          <IntentForm
            engine={engine}
            onSubmit={handleSubmit}
            prompt={activePrompt}
          />
        </div>
      )}

      {submittedValues !== null && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>
            Submitted values:
          </h3>
          <pre
            style={{
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 6,
              overflow: "auto",
              fontSize: 13,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {JSON.stringify(submittedValues, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
