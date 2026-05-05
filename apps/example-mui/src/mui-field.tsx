import type { FieldRendererProps } from "@intentform/react";
import type { FieldOption, FieldType } from "@intentform/shared";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  TextField,
} from "@mui/material";
import type { ComponentType } from "react";

// --- Per-type MUI field components ---

export function MuiTextField({
  field,
  onChange,
  value,
  required,
}: FieldRendererProps) {
  return (
    <Box mb={2}>
      <TextField
        fullWidth
        label={field.label}
        {...(field.placeholder ? { placeholder: field.placeholder } : {})}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        value={typeof value === "string" ? value : ""}
      />
    </Box>
  );
}

export function MuiEmailField({
  field,
  onChange,
  value,
  required,
}: FieldRendererProps) {
  return (
    <Box mb={2}>
      <TextField
        fullWidth
        label={field.label}
        type="email"
        {...(field.placeholder ? { placeholder: field.placeholder } : {})}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        value={typeof value === "string" ? value : ""}
      />
    </Box>
  );
}

export function MuiPhoneField({
  field,
  onChange,
  value,
  required,
}: FieldRendererProps) {
  return (
    <Box mb={2}>
      <TextField
        fullWidth
        label={field.label}
        type="tel"
        {...(field.placeholder ? { placeholder: field.placeholder } : {})}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        value={typeof value === "string" ? value : ""}
      />
    </Box>
  );
}

export function MuiNumberField({
  field,
  onChange,
  value,
  required,
}: FieldRendererProps) {
  return (
    <Box mb={2}>
      <TextField
        fullWidth
        label={field.label}
        type="number"
        {...(field.placeholder ? { placeholder: field.placeholder } : {})}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
        required={required}
        value={typeof value === "number" ? value : ""}
      />
    </Box>
  );
}

export function MuiDateField({
  field,
  onChange,
  value,
  required,
}: FieldRendererProps) {
  return (
    <Box mb={2}>
      <TextField
        fullWidth
        InputLabelProps={{ shrink: true }}
        label={field.label}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        type="date"
        value={typeof value === "string" ? value : ""}
      />
    </Box>
  );
}

export function MuiSelectField({
  field,
  onChange,
  value,
  required,
}: FieldRendererProps) {
  return (
    <Box mb={2}>
      <TextField
        fullWidth
        label={field.label}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        select
        value={typeof value === "string" ? value : ""}
      >
        {(field.options ?? []).map((option: FieldOption) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

export function MuiMultiselectField({
  field,
  onChange,
  value,
  required,
}: FieldRendererProps) {
  const selected: string[] = Array.isArray(value) ? (value as string[]) : [];
  const toggle = (val: string) => {
    const next = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val];
    onChange(next);
  };
  return (
    <Box mb={2}>
      <FormControl fullWidth required={required}>
        {(field.options ?? []).map((option: FieldOption) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={selected.includes(option.value)}
                onChange={() => toggle(option.value)}
              />
            }
            key={option.value}
            label={option.label}
          />
        ))}
      </FormControl>
    </Box>
  );
}

export function MuiBooleanField({
  field,
  onChange,
  value,
  required,
}: FieldRendererProps) {
  return (
    <Box mb={2}>
      <FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={typeof value === "boolean" ? value : false}
              onChange={(e) => onChange(e.target.checked)}
              required={required}
            />
          }
          label={field.label}
        />
        <FormHelperText />
      </FormControl>
    </Box>
  );
}

export function MuiTextareaField({
  field,
  onChange,
  value,
  required,
}: FieldRendererProps) {
  return (
    <Box mb={2}>
      <TextField
        fullWidth
        label={field.label}
        minRows={3}
        multiline
        {...(field.placeholder ? { placeholder: field.placeholder } : {})}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        value={typeof value === "string" ? value : ""}
      />
    </Box>
  );
}

// --- Aggregated map ---

export const muiComponents: Record<
  FieldType,
  ComponentType<FieldRendererProps>
> = {
  boolean: MuiBooleanField,
  date: MuiDateField,
  email: MuiEmailField,
  multiselect: MuiMultiselectField,
  number: MuiNumberField,
  phone: MuiPhoneField,
  select: MuiSelectField,
  text: MuiTextField,
  textarea: MuiTextareaField,
};
