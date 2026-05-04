export default function HeroDemo() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid var(--sl-color-gray-5)",
        fontFamily: "var(--sl-font)",
        fontSize: "13px",
        margin: "24px 0",
      }}
    >
      <div
        style={{
          padding: "20px",
          background: "var(--sl-color-bg-sidebar)",
          borderRight: "1px solid var(--sl-color-gray-5)",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--sl-color-gray-3)",
            margin: "0 0 12px",
          }}
        >
          User types
        </p>
        <div
          style={{
            background: "var(--sl-color-bg)",
            borderRadius: "6px",
            padding: "12px",
            border: "1px solid var(--sl-color-gray-5)",
            color: "var(--sl-color-text)",
            lineHeight: 1.5,
          }}
        >
          I fell down the stairs at the main office on Monday around 2pm. Minor
          bruise on my left knee. John Smith reporting.
        </div>
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--sl-color-gray-3)",
            fontSize: "11px",
          }}
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="14"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="14"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          AI parses intent → structured JSON
        </div>
      </div>

      <div style={{ padding: "20px", background: "var(--sl-color-bg)" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--sl-color-green-high, #16a34a)",
            margin: "0 0 12px",
          }}
        >
          Form pre-filled
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <MockField label="Your Name" value="John Smith" />
          <MockField label="Date of Incident" type="date" value="Monday" />
          <MockField label="Location" value="Main office — staircase" />
          <MockField label="Injury Severity" type="select" value="Minor" />
          <MockField
            label="What happened?"
            type="textarea"
            value="Fell down stairs, bruise on left knee"
          />
        </div>
      </div>
    </div>
  );
}

function MockField({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string;
  type?: "text" | "select" | "date" | "textarea";
}) {
  const inputStyle: React.CSSProperties = {
    padding: "5px 8px",
    borderRadius: "4px",
    border: "1px solid var(--sl-color-accent)",
    background: "var(--sl-color-accent-low)",
    color: "var(--sl-color-accent-high)",
    fontSize: "12px",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--sl-color-gray-3)",
          marginBottom: "2px",
        }}
      >
        {label}
      </div>
      {type === "textarea" ? (
        <div style={{ ...inputStyle, minHeight: "44px", lineHeight: 1.4 }}>
          {value}
        </div>
      ) : (
        <div style={inputStyle}>{value}</div>
      )}
    </div>
  );
}
