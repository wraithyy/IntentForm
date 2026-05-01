import type React from "react";
import { useState } from "react";
import type { IntentFormDebugPanelProps } from "./types.js";

const STATUS_COLORS: Record<string, string> = {
  idle: "#6b7280",
  loading: "#d97706",
  resolved: "#16a34a",
  error: "#dc2626",
};

const STATUS_BG: Record<string, string> = {
  idle: "#374151",
  loading: "#78350f",
  resolved: "#14532d",
  error: "#7f1d1d",
};

function confidenceColor(confidence: number): string {
  if (confidence < 0.7) {
    return "#ef4444";
  }
  if (confidence < 0.9) {
    return "#f59e0b";
  }
  return "#22c55e";
}

function SectionHeader({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      style={{
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "#888",
        margin: "12px 0 6px",
      }}
    >
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }): React.ReactElement {
  return (
    <span
      style={{
        borderRadius: "12px",
        padding: "2px 8px",
        fontSize: "11px",
        fontWeight: 600,
        background: STATUS_BG[status] ?? "#374151",
        color: STATUS_COLORS[status] ?? "#e5e5e5",
      }}
    >
      {status}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }): React.ReactElement {
  const pct = Math.round(value * 100);
  const color = confidenceColor(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          flex: 1,
          height: "6px",
          borderRadius: "3px",
          background: "#333",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "3px",
            background: color,
            width: `${pct}%`,
          }}
        />
      </div>
      <span
        style={{
          color,
          fontSize: "12px",
          minWidth: "36px",
          textAlign: "right",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

function RelevanceRow({
  fieldId,
  score,
}: {
  fieldId: string;
  score: number;
}): React.ReactElement {
  const pct = Math.round(score * 100);
  const color = confidenceColor(score);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr 36px",
        alignItems: "center",
        gap: "8px",
        marginBottom: "4px",
      }}
    >
      <span
        style={{
          color: "#ccc",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {fieldId}
      </span>
      <div
        style={{
          height: "4px",
          borderRadius: "2px",
          background: "#333",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "2px",
            background: color,
            width: `${pct}%`,
          }}
        />
      </div>
      <span style={{ color, fontSize: "11px", textAlign: "right" }}>
        {pct}%
      </span>
    </div>
  );
}

function CollapsiblePrompt({ prompt }: { prompt: string }): React.ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          color: "#888",
          cursor: "pointer",
          fontSize: "11px",
          padding: "0",
          fontFamily: "monospace",
        }}
        type="button"
      >
        {open ? "▼ hide prompt" : "▶ show prompt"}
      </button>
      {open && (
        <pre
          style={{
            background: "#111",
            borderRadius: "4px",
            padding: "8px",
            overflow: "auto",
            maxHeight: "200px",
            margin: "6px 0 0",
            color: "#bbb",
            fontSize: "12px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {prompt}
        </pre>
      )}
    </div>
  );
}

function FieldSetRow({
  label,
  fields,
}: {
  label: string;
  fields: ReadonlySet<string>;
}): React.ReactElement {
  const items = Array.from(fields);
  return (
    <div style={{ marginBottom: "4px" }}>
      <span style={{ color: "#888", fontSize: "11px" }}>{label}: </span>
      {items.length === 0 ? (
        <span style={{ color: "#555", fontSize: "12px" }}>none</span>
      ) : (
        items.map((f) => (
          <span
            key={f}
            style={{
              display: "inline-block",
              background: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "4px",
              padding: "1px 6px",
              fontSize: "11px",
              color: "#ccc",
              marginRight: "4px",
              marginBottom: "2px",
            }}
          >
            {f}
          </span>
        ))
      )}
    </div>
  );
}

interface DebugContentProps {
  confidence: number | undefined;
  error: string | null | undefined;
  fieldRelevance: Record<string, number> | undefined;
  hiddenFields: ReadonlySet<string> | undefined;
  latencyMs: number | undefined;
  modelId: string | undefined;
  prompt: string | undefined;
  providerUsed: string | undefined;
  requiredFields: ReadonlySet<string> | undefined;
  status: string;
  tierSelected: string | undefined;
  tokensIn: number | undefined;
  tokensOut: number | undefined;
  values: Record<string, unknown> | undefined;
}

function DebugPanelContent(p: DebugContentProps): React.ReactElement {
  const relevanceEntries = p.fieldRelevance
    ? Object.entries(p.fieldRelevance)
    : [];
  const hasProviderInfo =
    p.providerUsed !== undefined ||
    p.tierSelected !== undefined ||
    p.tokensIn !== undefined ||
    p.tokensOut !== undefined ||
    p.latencyMs !== undefined;

  return (
    <div style={{ padding: "0 14px 14px" }}>
      <SectionHeader>Status</SectionHeader>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <StatusBadge status={p.status} />
        {p.error && (
          <span style={{ color: "#ef4444", fontSize: "12px" }}>{p.error}</span>
        )}
      </div>

      {(p.modelId !== undefined || p.confidence !== undefined) && (
        <>
          <SectionHeader>Model</SectionHeader>
          {p.modelId && (
            <div style={{ color: "#ccc", marginBottom: "6px" }}>
              {p.modelId}
            </div>
          )}
          {p.confidence !== undefined && <ConfidenceBar value={p.confidence} />}
        </>
      )}

      {relevanceEntries.length > 0 && (
        <>
          <SectionHeader>Field Relevance</SectionHeader>
          {relevanceEntries.map(([fieldId, score]) => (
            <RelevanceRow fieldId={fieldId} key={fieldId} score={score} />
          ))}
        </>
      )}

      {p.values !== undefined && (
        <>
          <SectionHeader>Values</SectionHeader>
          <pre
            style={{
              background: "#111",
              borderRadius: "4px",
              padding: "8px",
              overflow: "auto",
              maxHeight: "200px",
              margin: 0,
              color: "#bbb",
              fontSize: "12px",
            }}
          >
            {JSON.stringify(p.values, null, 2)}
          </pre>
        </>
      )}

      {(p.hiddenFields !== undefined || p.requiredFields !== undefined) && (
        <>
          <SectionHeader>Fields</SectionHeader>
          {p.requiredFields !== undefined && (
            <FieldSetRow fields={p.requiredFields} label="required" />
          )}
          {p.hiddenFields !== undefined && (
            <FieldSetRow fields={p.hiddenFields} label="hidden" />
          )}
        </>
      )}

      {hasProviderInfo && (
        <>
          <SectionHeader>Provider</SectionHeader>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "2px 12px",
              fontSize: "12px",
            }}
          >
            {p.providerUsed !== undefined && (
              <>
                <span style={{ color: "#888" }}>provider</span>
                <span style={{ color: "#ccc" }}>{p.providerUsed}</span>
              </>
            )}
            {p.tierSelected !== undefined && (
              <>
                <span style={{ color: "#888" }}>tier</span>
                <span style={{ color: "#ccc" }}>{p.tierSelected}</span>
              </>
            )}
            {p.tokensIn !== undefined && (
              <>
                <span style={{ color: "#888" }}>tokens in</span>
                <span style={{ color: "#ccc" }}>{p.tokensIn}</span>
              </>
            )}
            {p.tokensOut !== undefined && (
              <>
                <span style={{ color: "#888" }}>tokens out</span>
                <span style={{ color: "#ccc" }}>{p.tokensOut}</span>
              </>
            )}
            {p.latencyMs !== undefined && (
              <>
                <span style={{ color: "#888" }}>latency</span>
                <span style={{ color: "#ccc" }}>{p.latencyMs}ms</span>
              </>
            )}
          </div>
        </>
      )}

      {p.prompt !== undefined && (
        <>
          <SectionHeader>Prompt</SectionHeader>
          <CollapsiblePrompt prompt={p.prompt} />
        </>
      )}
    </div>
  );
}

export function IntentFormDebugPanel(
  props: IntentFormDebugPanelProps
): React.ReactElement {
  const [open, setOpen] = useState(false);

  const resolution = props.resolution ?? null;
  const status = props.status ?? "idle";
  const modelId = props.modelId ?? resolution?.modelId;
  const confidence = props.confidence ?? resolution?.confidence;
  const fieldRelevance = props.fieldRelevance ?? resolution?.fieldRelevance;
  const values = props.values ?? resolution?.values;
  const hiddenFields = props.hiddenFields ?? resolution?.hiddenFields;
  const requiredFields = props.requiredFields ?? resolution?.requiredFields;
  const {
    latencyMs,
    prompt,
    providerUsed,
    tierSelected,
    tokensIn,
    tokensOut,
    error,
  } = props;

  return (
    <div
      style={{
        background: "#1a1a1a",
        color: "#e5e5e5",
        border: "1px solid #333",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "13px",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          borderBottom: open ? "1px solid #333" : "none",
          color: "inherit",
          cursor: "pointer",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "monospace",
          fontSize: "13px",
          textAlign: "left",
        }}
        type="button"
      >
        <span style={{ color: "#555", fontSize: "11px" }}>
          {open ? "▼" : "▶"}
        </span>
        <span style={{ color: "#888", fontSize: "11px", fontWeight: 700 }}>
          IntentForm Debug
        </span>
        <StatusBadge status={status} />
        {modelId && (
          <span style={{ color: "#aaa", fontSize: "12px" }}>{modelId}</span>
        )}
        {confidence !== undefined && (
          <span
            style={{ color: confidenceColor(confidence), fontSize: "12px" }}
          >
            {Math.round(confidence * 100)}% conf
          </span>
        )}
      </button>

      {open && (
        <DebugPanelContent
          confidence={confidence}
          error={error}
          fieldRelevance={fieldRelevance}
          hiddenFields={hiddenFields}
          latencyMs={latencyMs}
          modelId={modelId}
          prompt={prompt}
          providerUsed={providerUsed}
          requiredFields={requiredFields}
          status={status}
          tierSelected={tierSelected}
          tokensIn={tokensIn}
          tokensOut={tokensOut}
          values={values}
        />
      )}
    </div>
  );
}
