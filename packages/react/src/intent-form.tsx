import type { FieldDefinition, ModelDefinition } from "@intentform/shared";
import type { FormEvent, ReactElement } from "react";
import { useEffect } from "react";
import { FieldRenderer } from "./field-renderer.js";
import type { IntentFormProps } from "./types.js";
import { useIntentForm } from "./use-intent-form.js";

export function IntentForm({
  components,
  engine,
  onSubmit,
  prompt,
}: IntentFormProps): ReactElement {
  const { error, resolution, resolve, status, updateValue, values } =
    useIntentForm(engine);

  useEffect(() => {
    if (prompt) {
      resolve(prompt).catch(() => undefined);
    }
  }, [prompt, resolve]);

  if (status === "loading") {
    return <div data-testid="intent-form-loading">Loading…</div>;
  }

  if (status === "error") {
    return <div data-testid="intent-form-error">{error}</div>;
  }

  if (!resolution) {
    return <div data-testid="intent-form-idle" />;
  }

  const model = engine
    .getModels()
    .find((m: ModelDefinition) => m.id === resolution.modelId);
  if (!model) {
    return <div data-testid="intent-form-idle" />;
  }

  const visibleFields = model.fields.filter(
    (f: FieldDefinition) => !resolution.hiddenFields.has(f.id)
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit?.(values);
  };

  const componentsProp = components === undefined ? {} : { components };

  return (
    <form data-testid="intent-form" onSubmit={handleSubmit}>
      {visibleFields.map((field: FieldDefinition) => (
        <div key={field.id}>
          <label htmlFor={field.id}>{field.label}</label>
          <FieldRenderer
            {...componentsProp}
            field={field}
            onChange={(val) => updateValue(field.id, val)}
            required={resolution.requiredFields.has(field.id)}
            value={values[field.id] ?? ""}
          />
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}
