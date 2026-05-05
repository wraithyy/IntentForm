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
  {
    id: "leave-request",
    label: "Leave Request",
    description: "HR time-off request",
    useCases: ["vacation", "time off", "sick leave", "pto", "holiday"],
    schema: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      leaveType: z
        .enum(["vacation", "sick", "parental", "personal", "other"])
        .optional(),
      managerEmail: z.string().optional(),
      reason: z.string().optional(),
    }),
    fields: [
      { id: "startDate", type: "date", label: "Start Date", required: true },
      { id: "endDate", type: "date", label: "End Date", required: true },
      {
        id: "leaveType",
        type: "select",
        label: "Leave Type",
        required: true,
        options: [
          { value: "vacation", label: "Vacation" },
          { value: "sick", label: "Sick Leave" },
          { value: "parental", label: "Parental Leave" },
          { value: "personal", label: "Personal" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "managerEmail",
        type: "email",
        label: "Manager Email",
        required: true,
      },
      { id: "reason", type: "textarea", label: "Reason", required: false },
    ],
    rules: [],
  },
  {
    id: "travel-booking",
    label: "Travel Booking",
    description: "Flight or trip booking request",
    useCases: ["flight", "trip", "travel", "vacation booking", "fly to"],
    schema: z.object({
      origin: z.string().optional(),
      destination: z.string().optional(),
      departureDate: z.string().optional(),
      returnDate: z.string().optional(),
      passengers: z.number().optional(),
      travelClass: z.enum(["economy", "business", "first"]).optional(),
    }),
    fields: [
      { id: "origin", type: "text", label: "From", required: true },
      { id: "destination", type: "text", label: "To", required: true },
      {
        id: "departureDate",
        type: "date",
        label: "Departure Date",
        required: true,
      },
      {
        id: "returnDate",
        type: "date",
        label: "Return Date",
        required: false,
      },
      {
        id: "passengers",
        type: "number",
        label: "Passengers",
        required: true,
      },
      {
        id: "travelClass",
        type: "select",
        label: "Class",
        required: true,
        options: [
          { value: "economy", label: "Economy" },
          { value: "business", label: "Business" },
          { value: "first", label: "First Class" },
        ],
      },
    ],
    rules: [],
  },
  {
    id: "job-application",
    label: "Job Application",
    description: "Candidate intake form",
    useCases: ["job", "apply", "application", "position", "resume", "cv"],
    schema: z.object({
      fullName: z.string().optional(),
      position: z.string().optional(),
      yearsExperience: z.number().optional(),
      portfolioUrl: z.string().optional(),
      coverLetter: z.string().optional(),
    }),
    fields: [
      { id: "fullName", type: "text", label: "Full Name", required: true },
      {
        id: "position",
        type: "text",
        label: "Position Applied For",
        required: true,
      },
      {
        id: "yearsExperience",
        type: "number",
        label: "Years of Experience",
        required: true,
      },
      {
        id: "portfolioUrl",
        type: "text",
        label: "Portfolio / LinkedIn URL",
        required: false,
      },
      {
        id: "coverLetter",
        type: "textarea",
        label: "Cover Letter",
        required: true,
      },
    ],
    rules: [],
  },
  {
    id: "restaurant-reservation",
    label: "Restaurant Reservation",
    description: "Table booking at a restaurant",
    useCases: ["reservation", "table", "dinner", "book", "restaurant"],
    schema: z.object({
      date: z.string().optional(),
      time: z.string().optional(),
      partySize: z.number().optional(),
      dietaryRestrictions: z
        .enum(["none", "vegetarian", "vegan", "gluten-free", "halal"])
        .optional(),
      specialRequest: z.string().optional(),
    }),
    fields: [
      { id: "date", type: "date", label: "Date", required: true },
      {
        id: "time",
        type: "text",
        label: "Time (e.g. 19:00)",
        required: true,
      },
      {
        id: "partySize",
        type: "number",
        label: "Party Size",
        required: true,
      },
      {
        id: "dietaryRestrictions",
        type: "select",
        label: "Dietary Restrictions",
        required: false,
        options: [
          { value: "none", label: "None" },
          { value: "vegetarian", label: "Vegetarian" },
          { value: "vegan", label: "Vegan" },
          { value: "gluten-free", label: "Gluten-Free" },
          { value: "halal", label: "Halal" },
        ],
      },
      {
        id: "specialRequest",
        type: "textarea",
        label: "Special Request",
        required: false,
      },
    ],
    rules: [],
  },
  {
    id: "insurance-claim",
    label: "Insurance Claim",
    description: "Insurance claim filing",
    useCases: ["claim", "insurance", "damage", "loss", "policy"],
    schema: z.object({
      policyNumber: z.string().optional(),
      claimType: z.enum(["auto", "home", "health", "travel"]).optional(),
      incidentDate: z.string().optional(),
      lossAmount: z.number().optional(),
      description: z.string().optional(),
    }),
    fields: [
      {
        id: "policyNumber",
        type: "text",
        label: "Policy Number",
        required: true,
      },
      {
        id: "claimType",
        type: "select",
        label: "Claim Type",
        required: true,
        options: [
          { value: "auto", label: "Auto" },
          { value: "home", label: "Home" },
          { value: "health", label: "Health" },
          { value: "travel", label: "Travel" },
        ],
      },
      {
        id: "incidentDate",
        type: "date",
        label: "Incident Date",
        required: true,
      },
      {
        id: "lossAmount",
        type: "number",
        label: "Estimated Loss Amount ($)",
        required: true,
      },
      {
        id: "description",
        type: "textarea",
        label: "Description of Incident",
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

const EXAMPLE_INTENTS: { label: string; intent: string }[] = [
  {
    label: "Accident",
    intent:
      "I fell down the stairs at the main office on Monday, minor bruise on my left knee.",
  },
  {
    label: "Support",
    intent:
      "My billing page shows an error 500 when I try to update my credit card. It's urgent.",
  },
  {
    label: "Leave",
    intent:
      "I need to take two weeks of vacation starting next Monday, my manager is jane@company.com.",
  },
  {
    label: "Travel",
    intent:
      "I want to fly from Prague to Tokyo next month, two passengers, economy class.",
  },
  {
    label: "Job",
    intent:
      "I'd like to apply for the senior frontend engineer position, I have 7 years of experience.",
  },
  {
    label: "Dinner",
    intent:
      "Book a table for 4 people this Saturday evening, one of us is vegetarian.",
  },
  {
    label: "Claim",
    intent:
      "My car was hit in a parking lot yesterday, I need to file an auto insurance claim, policy ABC-123.",
  },
];

export default function Playground() {
  const [apiKey, setApiKey] = useState("");
  const [intent, setIntent] = useState("");
  const [activeIntent, setActiveIntent] = useState("");

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

  const handleExampleClick = (exampleIntent: string) => {
    setIntent(exampleIntent);
    setActiveIntent("");
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
          <label htmlFor="pg-intent" style={labelStyle}>
            Intent
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "8px",
            }}
          >
            {EXAMPLE_INTENTS.map((ex) => (
              <button
                key={ex.label}
                onClick={() => handleExampleClick(ex.intent)}
                style={{
                  fontSize: "12px",
                  color: "var(--sl-color-accent)",
                  background: "var(--sl-color-bg-sidebar)",
                  border: "1px solid var(--sl-color-gray-5)",
                  borderRadius: "999px",
                  cursor: "pointer",
                  padding: "3px 10px",
                }}
                type="button"
              >
                {ex.label}
              </button>
            ))}
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
