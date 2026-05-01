import type { IntentFormEngine } from "@intentform/core";
import type {
  FieldDefinition,
  FieldOption,
  ModelDefinition,
} from "@intentform/shared";
import type {
  FieldApi,
  FieldValidators,
  Validator,
} from "@tanstack/react-form";
import type { ReactElement } from "react";
import { useEffect } from "react";
import type {
  TanStackFormInstance,
  UseTanStackIntentFormOptions,
} from "./use-tanstack-intent-form.js";
import { useTanStackIntentForm } from "./use-tanstack-intent-form.js";

export interface TanStackIntentFormProps {
  engine: IntentFormEngine;
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  prompt?: string;
}

type AnyFieldApi = FieldApi<
  Record<string, unknown>,
  string,
  Validator<unknown, unknown> | undefined,
  Validator<Record<string, unknown>, unknown> | undefined,
  unknown
>;

type RequiredValidators = FieldValidators<
  Record<string, unknown>,
  string,
  undefined,
  undefined,
  unknown
>;

function FieldInput({
  field: fieldDef,
  fieldApi,
  required,
}: {
  field: FieldDefinition;
  fieldApi: AnyFieldApi;
  required: boolean;
}): ReactElement {
  const rawValue = fieldApi.state.value;

  if (fieldDef.type === "boolean") {
    return (
      <input
        checked={typeof rawValue === "boolean" ? rawValue : false}
        id={fieldDef.id}
        onBlur={fieldApi.handleBlur}
        onChange={(e) => fieldApi.handleChange(e.target.checked)}
        required={required}
        type="checkbox"
      />
    );
  }

  if (fieldDef.type === "number") {
    return (
      <input
        id={fieldDef.id}
        onBlur={fieldApi.handleBlur}
        onChange={(e) => fieldApi.handleChange(Number(e.target.value))}
        placeholder={fieldDef.placeholder}
        required={required}
        type="number"
        value={typeof rawValue === "number" ? rawValue : ""}
      />
    );
  }

  if (fieldDef.type === "select") {
    const opts: FieldOption[] = fieldDef.options ?? [];
    return (
      <select
        id={fieldDef.id}
        onBlur={fieldApi.handleBlur}
        onChange={(e) => fieldApi.handleChange(e.target.value)}
        required={required}
        value={typeof rawValue === "string" ? rawValue : ""}
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
    const selected: string[] = Array.isArray(rawValue)
      ? (rawValue as string[])
      : [];
    const toggle = (val: string) => {
      const next = selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val];
      fieldApi.handleChange(next);
    };
    return (
      <div id={fieldDef.id}>
        {opts.map((o) => (
          <label key={o.value}>
            <input
              checked={selected.includes(o.value)}
              onBlur={fieldApi.handleBlur}
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
        id={fieldDef.id}
        onBlur={fieldApi.handleBlur}
        onChange={(e) => fieldApi.handleChange(e.target.value)}
        placeholder={fieldDef.placeholder}
        required={required}
        value={typeof rawValue === "string" ? rawValue : ""}
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
      id={fieldDef.id}
      onBlur={fieldApi.handleBlur}
      onChange={(e) => fieldApi.handleChange(e.target.value)}
      placeholder={fieldDef.placeholder}
      required={required}
      type={inputType[fieldDef.type] ?? "text"}
      value={typeof rawValue === "string" ? rawValue : ""}
    />
  );
}

function makeRequiredValidators(label: string): RequiredValidators {
  return {
    onChange: ({ value }: { value: unknown }) =>
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
        ? `${label} is required`
        : undefined,
  };
}

function FormField({
  fieldDef,
  form,
  isRequired,
}: {
  fieldDef: FieldDefinition;
  form: TanStackFormInstance;
  isRequired: boolean;
}): ReactElement {
  const renderChildren = (fieldApi: AnyFieldApi) => (
    <>
      <FieldInput field={fieldDef} fieldApi={fieldApi} required={isRequired} />
      {fieldApi.state.meta.errors.length > 0 && (
        <span data-testid={`error-${fieldDef.id}`}>
          {fieldApi.state.meta.errors.join(", ")}
        </span>
      )}
    </>
  );

  if (isRequired) {
    return (
      <form.Field
        name={fieldDef.id}
        validators={makeRequiredValidators(fieldDef.label)}
      >
        {(fieldApi) => renderChildren(fieldApi as unknown as AnyFieldApi)}
      </form.Field>
    );
  }

  return (
    <form.Field name={fieldDef.id}>
      {(fieldApi) => renderChildren(fieldApi as unknown as AnyFieldApi)}
    </form.Field>
  );
}

function buildOptions(
  onSubmit: TanStackIntentFormProps["onSubmit"]
): UseTanStackIntentFormOptions {
  if (onSubmit !== undefined) {
    return { onSubmit };
  }
  return {};
}

export function TanStackIntentForm({
  engine,
  onSubmit,
  prompt,
}: TanStackIntentFormProps): ReactElement {
  const { error, form, resolution, resolve, status } = useTanStackIntentForm(
    engine,
    buildOptions(onSubmit)
  );

  useEffect(() => {
    if (prompt) {
      resolve(prompt).catch(() => undefined);
    }
  }, [prompt, resolve]);

  if (status === "loading") {
    return <div data-testid="tanstack-intent-form-loading">Loading…</div>;
  }

  if (status === "error") {
    return <div data-testid="tanstack-intent-form-error">{error}</div>;
  }

  if (!resolution) {
    return <div data-testid="tanstack-intent-form-idle" />;
  }

  const model: ModelDefinition | undefined = engine
    .getModels()
    .find((m: ModelDefinition) => m.id === resolution.modelId);

  if (!model) {
    return <div data-testid="tanstack-intent-form-idle" />;
  }

  const visibleFields = model.fields.filter(
    (f: FieldDefinition) => !resolution.hiddenFields.has(f.id)
  );

  return (
    <form
      data-testid="tanstack-intent-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit().catch(() => undefined);
      }}
    >
      {visibleFields.map((fieldDef: FieldDefinition) => (
        <div key={fieldDef.id}>
          <label htmlFor={fieldDef.id}>{fieldDef.label}</label>
          <FormField
            fieldDef={fieldDef}
            form={form}
            isRequired={resolution.requiredFields.has(fieldDef.id)}
          />
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}
