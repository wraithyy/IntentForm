import type { TanStackFormInstance } from "@intentform/adapter-tanstack-form";
import type { FieldDefinition } from "@intentform/shared";
import type { FieldApi, Validator } from "@tanstack/react-form";
import { Checkbox } from "./ui/checkbox.js";
import { Input } from "./ui/input.js";
import { Label } from "./ui/label.js";
import { Select } from "./ui/select.js";
import { Textarea } from "./ui/textarea.js";

type AnyFieldApi = FieldApi<
  Record<string, unknown>,
  string,
  Validator<unknown, unknown> | undefined,
  Validator<Record<string, unknown>, unknown> | undefined,
  unknown
>;

interface ShadcnFieldProps {
  field: FieldDefinition;
  form: TanStackFormInstance;
  hidden?: boolean;
}

function FieldInput({
  field,
  anyF,
  value,
}: {
  field: FieldDefinition;
  anyF: AnyFieldApi;
  value: unknown;
}) {
  if (
    field.type === "text" ||
    field.type === "email" ||
    field.type === "phone"
  ) {
    return (
      <Input
        id={field.id}
        onBlur={anyF.handleBlur}
        onChange={(e) => anyF.handleChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        type={field.type === "email" ? "email" : "text"}
        value={typeof value === "string" ? value : ""}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        id={field.id}
        onBlur={anyF.handleBlur}
        onChange={(e) => anyF.handleChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        rows={3}
        value={typeof value === "string" ? value : ""}
      />
    );
  }

  if (field.type === "number") {
    return (
      <Input
        id={field.id}
        onBlur={anyF.handleBlur}
        onChange={(e) => anyF.handleChange(e.target.valueAsNumber)}
        required={field.required}
        type="number"
        value={typeof value === "number" ? String(value) : ""}
      />
    );
  }

  if (field.type === "date") {
    return (
      <Input
        id={field.id}
        onBlur={anyF.handleBlur}
        onChange={(e) => anyF.handleChange(e.target.value)}
        required={field.required}
        type="date"
        value={typeof value === "string" ? value : ""}
      />
    );
  }

  if (field.type === "select" && field.options !== undefined) {
    return (
      <Select
        id={field.id}
        onBlur={anyF.handleBlur}
        onChange={(e) => anyF.handleChange(e.target.value)}
        required={field.required}
        value={typeof value === "string" ? value : ""}
      >
        <option value="">Select...</option>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          checked={value === true}
          id={field.id}
          onCheckedChange={(checked) => anyF.handleChange(checked === true)}
        />
        <Label htmlFor={field.id}>{field.label}</Label>
      </div>
    );
  }

  return null;
}

export function ShadcnField({ field, form, hidden }: ShadcnFieldProps) {
  if (hidden === true) {
    return null;
  }

  return (
    <form.Field name={field.id}>
      {(f) => {
        const anyF = f as unknown as AnyFieldApi;
        const error = anyF.state.meta.errors[0];
        const value = anyF.state.value;

        return (
          <div className="mb-4">
            {field.type !== "boolean" && (
              <Label className="mb-1 block" htmlFor={field.id}>
                {field.label}
                {field.required === true && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </Label>
            )}

            <FieldInput anyF={anyF} field={field} value={value} />

            {error !== undefined && (
              <p className="mt-1 text-red-500 text-sm">{String(error)}</p>
            )}
          </div>
        );
      }}
    </form.Field>
  );
}
