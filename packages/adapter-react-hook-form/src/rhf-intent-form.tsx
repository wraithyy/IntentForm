import type { FieldComponentsMap, IntentFormEngine } from "@intentform/core";
import type {
  FieldDefinition,
  FieldOption,
  ModelDefinition,
} from "@intentform/shared";
import type { ComponentType, ReactElement } from "react";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import type { UseRHFIntentFormOptions } from "./use-rhf-intent-form.js";
import { useRHFIntentForm } from "./use-rhf-intent-form.js";

export interface RHFIntentFormProps {
  /** Optional component overrides; merged with engine-level components (prop wins). */
  components?: FieldComponentsMap;
  engine: IntentFormEngine;
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  prompt?: string;
}

/** Props passed to every custom field component registered via the components map. */
export interface RHFFieldComponentProps {
  field: FieldDefinition;
  onChange: (value: unknown) => void;
  required: boolean;
  value: unknown;
}

function FieldInput({
  errorId,
  field: fieldDef,
  onChange,
  onBlur,
  value,
  required,
}: {
  errorId?: string;
  field: FieldDefinition;
  onChange: (v: unknown) => void;
  onBlur: () => void;
  value: unknown;
  required: boolean;
}): ReactElement {
  if (fieldDef.type === "boolean") {
    return (
      <input
        aria-describedby={errorId}
        checked={typeof value === "boolean" ? value : false}
        id={fieldDef.id}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.checked)}
        required={required}
        type="checkbox"
      />
    );
  }

  if (fieldDef.type === "number") {
    return (
      <input
        aria-describedby={errorId}
        id={fieldDef.id}
        onBlur={onBlur}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={fieldDef.placeholder}
        required={required}
        type="number"
        value={typeof value === "number" ? value : ""}
      />
    );
  }

  if (fieldDef.type === "select") {
    const opts: FieldOption[] = fieldDef.options ?? [];
    return (
      <select
        aria-describedby={errorId}
        id={fieldDef.id}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        value={typeof value === "string" ? value : ""}
      >
        <option value="">—</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  if (fieldDef.type === "multiselect") {
    const opts: FieldOption[] = fieldDef.options ?? [];
    const selected: string[] = Array.isArray(value) ? (value as string[]) : [];
    const toggle = (val: string) => {
      const next = selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val];
      onChange(next);
    };
    return (
      <div aria-describedby={errorId} id={fieldDef.id}>
        {opts.map((o) => (
          <label key={o.value}>
            <input
              checked={selected.includes(o.value)}
              onBlur={onBlur}
              onChange={() => toggle(o.value)}
              type="checkbox"
              value={o.value}
            />
            {o.label}
          </label>
        ))}
      </div>
    );
  }

  if (fieldDef.type === "textarea") {
    return (
      <textarea
        aria-describedby={errorId}
        id={fieldDef.id}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fieldDef.placeholder}
        required={required}
        value={typeof value === "string" ? value : ""}
      />
    );
  }

  const inputType: Partial<Record<FieldDefinition["type"], string>> = {
    date: "date",
    email: "email",
    phone: "tel",
    text: "text",
  };

  return (
    <input
      aria-describedby={errorId}
      id={fieldDef.id}
      onBlur={onBlur}
      onChange={(e) => onChange(e.target.value)}
      placeholder={fieldDef.placeholder}
      required={required}
      type={inputType[fieldDef.type] ?? "text"}
      value={typeof value === "string" ? value : ""}
    />
  );
}

function buildOptions(
  onSubmit: RHFIntentFormProps["onSubmit"]
): UseRHFIntentFormOptions {
  if (onSubmit !== undefined) {
    return { onSubmit };
  }
  return {};
}

export function RHFIntentForm({
  components,
  engine,
  onSubmit,
  prompt,
}: RHFIntentFormProps): ReactElement {
  const {
    error,
    form,
    onSubmit: handleSubmit,
    resolution,
    resolve,
    status,
  } = useRHFIntentForm(engine, buildOptions(onSubmit));

  useEffect(() => {
    if (prompt) {
      resolve(prompt).catch(() => undefined);
    }
  }, [prompt, resolve]);

  if (status === "loading") {
    return <div data-testid="rhf-intent-form-loading">Loading…</div>;
  }

  if (status === "error") {
    return <div data-testid="rhf-intent-form-error">{error}</div>;
  }

  if (!resolution) {
    return <div data-testid="rhf-intent-form-idle" />;
  }

  const model: ModelDefinition | undefined = engine
    .getModels()
    .find((m: ModelDefinition) => m.id === resolution.modelId);

  if (!model) {
    return <div data-testid="rhf-intent-form-idle" />;
  }

  // Engine-level components act as defaults; the prop takes priority.
  const resolvedComponents: FieldComponentsMap = {
    ...engine.getComponents(),
    ...components,
  };

  const visibleFields = model.fields.filter(
    (f: FieldDefinition) => !resolution.hiddenFields.has(f.id)
  );

  const rootError = (
    form.formState.errors as Record<string, { message?: string }>
  )._root?.message;

  return (
    <form data-testid="rhf-intent-form" onSubmit={handleSubmit}>
      {visibleFields.map((fieldDef: FieldDefinition) => {
        const isRequired = resolution.requiredFields.has(fieldDef.id);
        const fieldError = form.formState.errors[fieldDef.id]?.message;

        // If a custom component is registered for this field type, use it.
        const CustomComponent = resolvedComponents[fieldDef.type] as
          | ComponentType<RHFFieldComponentProps>
          | undefined;

        if (CustomComponent !== undefined) {
          return (
            <div key={fieldDef.id}>
              <label htmlFor={fieldDef.id}>{fieldDef.label}</label>
              <CustomComponent
                field={fieldDef}
                onChange={(val) => form.setValue(fieldDef.id, val)}
                required={isRequired}
                value={form.watch(fieldDef.id) ?? ""}
              />
            </div>
          );
        }

        return (
          <div key={fieldDef.id}>
            <label htmlFor={fieldDef.id}>{fieldDef.label}</label>
            {isRequired ? (
              <Controller
                control={form.control}
                name={fieldDef.id}
                render={({ field }) => (
                  <FieldInput
                    {...(fieldError ? { errorId: `${fieldDef.id}-error` } : {})}
                    field={fieldDef}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    required={true}
                    value={field.value}
                  />
                )}
                rules={{ required: `${fieldDef.label} is required` }}
              />
            ) : (
              <Controller
                control={form.control}
                name={fieldDef.id}
                render={({ field }) => (
                  <FieldInput
                    {...(fieldError ? { errorId: `${fieldDef.id}-error` } : {})}
                    field={fieldDef}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    required={false}
                    value={field.value}
                  />
                )}
              />
            )}
            {fieldError && (
              <span
                aria-live="polite"
                data-testid={`error-${fieldDef.id}`}
                id={`${fieldDef.id}-error`}
                role="alert"
              >
                {fieldError}
              </span>
            )}
          </div>
        );
      })}
      {rootError && (
        <div data-testid="form-validation-error" role="alert">
          {rootError}
        </div>
      )}
      <button type="submit">Submit</button>
    </form>
  );
}
