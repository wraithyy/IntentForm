import type { FieldOption } from "@intentform/shared";
import type { FieldRendererProps } from "./types.js";

export function DefaultTextRenderer({
  field,
  onChange,
  required,
  value,
}: FieldRendererProps) {
  return (
    <input
      id={field.id}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      required={required}
      type="text"
      value={typeof value === "string" ? value : ""}
    />
  );
}

export function DefaultNumberRenderer({
  field,
  onChange,
  required,
  value,
}: FieldRendererProps) {
  return (
    <input
      id={field.id}
      onChange={(e) => onChange(e.target.valueAsNumber)}
      placeholder={field.placeholder}
      required={required}
      type="number"
      value={typeof value === "number" ? value : ""}
    />
  );
}

export function DefaultDateRenderer({
  field,
  onChange,
  required,
  value,
}: FieldRendererProps) {
  return (
    <input
      id={field.id}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      type="date"
      value={typeof value === "string" ? value : ""}
    />
  );
}

export function DefaultEmailRenderer({
  field,
  onChange,
  required,
  value,
}: FieldRendererProps) {
  return (
    <input
      id={field.id}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      required={required}
      type="email"
      value={typeof value === "string" ? value : ""}
    />
  );
}

export function DefaultPhoneRenderer({
  field,
  onChange,
  required,
  value,
}: FieldRendererProps) {
  return (
    <input
      id={field.id}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      required={required}
      type="tel"
      value={typeof value === "string" ? value : ""}
    />
  );
}

export function DefaultTextareaRenderer({
  field,
  onChange,
  required,
  value,
}: FieldRendererProps) {
  return (
    <textarea
      id={field.id}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      required={required}
      value={typeof value === "string" ? value : ""}
    />
  );
}

export function DefaultBooleanRenderer({
  field,
  onChange,
  required,
  value,
}: FieldRendererProps) {
  return (
    <input
      checked={typeof value === "boolean" ? value : false}
      id={field.id}
      onChange={(e) => onChange(e.target.checked)}
      required={required}
      type="checkbox"
    />
  );
}

export function DefaultSelectRenderer({
  field,
  onChange,
  required,
  value,
}: FieldRendererProps) {
  return (
    <select
      id={field.id}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      value={typeof value === "string" ? value : ""}
    >
      <option value="">-- select --</option>
      {(field.options ?? []).map((opt: FieldOption) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function DefaultMultiselectRenderer({
  field,
  onChange,
  required,
  value,
}: FieldRendererProps) {
  const selected = Array.isArray(value) ? (value as string[]) : [];
  return (
    <select
      id={field.id}
      multiple
      onChange={(e) => {
        const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
        onChange(vals);
      }}
      required={required}
      value={selected}
    >
      {(field.options ?? []).map((opt: FieldOption) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
