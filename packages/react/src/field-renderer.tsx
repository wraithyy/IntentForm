import type { FieldDefinition } from "@intentform/shared";
import type { ComponentType } from "react";
import {
  DefaultBooleanRenderer,
  DefaultDateRenderer,
  DefaultEmailRenderer,
  DefaultMultiselectRenderer,
  DefaultNumberRenderer,
  DefaultPhoneRenderer,
  DefaultSelectRenderer,
  DefaultTextareaRenderer,
  DefaultTextRenderer,
} from "./default-field-renderer.js";
import type { FieldComponents, FieldRendererProps } from "./types.js";

const DEFAULT_COMPONENTS: Record<
  FieldDefinition["type"],
  ComponentType<FieldRendererProps>
> = {
  boolean: DefaultBooleanRenderer,
  date: DefaultDateRenderer,
  email: DefaultEmailRenderer,
  multiselect: DefaultMultiselectRenderer,
  number: DefaultNumberRenderer,
  phone: DefaultPhoneRenderer,
  select: DefaultSelectRenderer,
  text: DefaultTextRenderer,
  textarea: DefaultTextareaRenderer,
};

interface FieldRendererWrapperProps extends FieldRendererProps {
  components?: FieldComponents;
}

export function FieldRenderer({
  components,
  field,
  onChange,
  required,
  value,
}: FieldRendererWrapperProps) {
  const Component: ComponentType<FieldRendererProps> =
    (components === undefined ? undefined : components[field.type]) ??
    DEFAULT_COMPONENTS[field.type];
  return (
    <Component
      field={field}
      onChange={onChange}
      required={required}
      value={value}
    />
  );
}
