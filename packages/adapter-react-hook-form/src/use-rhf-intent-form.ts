import type { IntentFormEngine } from "@intentform/core";
import type { IntentFormStatus } from "@intentform/react";
import { useIntentForm } from "@intentform/react";
import type { IntentResolution, StandardSchemaV1 } from "@intentform/shared";
import { validateStandard } from "@intentform/shared";
import type React from "react";
import { useEffect, useRef } from "react";
import type {
  DefaultValues,
  FieldValues,
  Resolver,
  UseFormReturn,
} from "react-hook-form";
import { useForm } from "react-hook-form";

export interface UseRHFIntentFormOptions {
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
}

export interface UseRHFIntentFormReturn {
  error: string | null;
  form: UseFormReturn<Record<string, unknown>>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: () => void;
  resolution: IntentResolution | null;
  resolve: (prompt: string) => Promise<void>;
  status: IntentFormStatus;
}

function makeStandardSchemaResolver(
  schemaRef: React.RefObject<StandardSchemaV1 | undefined>
): Resolver<Record<string, unknown>> {
  return async (values) => {
    const schema = schemaRef.current;
    if (!schema) {
      return { values, errors: {} };
    }
    const result = await validateStandard(schema, values);
    if (result.success) {
      return { values: result.value as Record<string, unknown>, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.issues) {
      const segment = issue.path?.[0];
      let rawKey: unknown;
      if (segment === undefined) {
        rawKey = undefined;
      } else if (typeof segment === "object" && "key" in segment) {
        rawKey = segment.key;
      } else {
        rawKey = segment;
      }
      const key = typeof rawKey === "string" ? rawKey : "_root";
      if (!(key in errors)) {
        errors[key] = { type: "validation", message: issue.message };
      }
    }
    return { values: {}, errors };
  };
}

export function useRHFIntentForm(
  engine: IntentFormEngine,
  options?: UseRHFIntentFormOptions
): UseRHFIntentFormReturn {
  const { error, resolution, reset, resolve, status } = useIntentForm(engine);
  const onSubmitRef = useRef(options?.onSubmit);
  onSubmitRef.current = options?.onSubmit;

  const schemaRef = useRef<StandardSchemaV1 | undefined>(undefined);

  const form = useForm<Record<string, unknown>>({
    resolver: makeStandardSchemaResolver(schemaRef),
    defaultValues: {} as DefaultValues<FieldValues>,
  });

  const previousResolutionRef = useRef<IntentResolution | null>(null);

  useEffect(() => {
    if (
      status === "resolved" &&
      resolution !== null &&
      resolution !== previousResolutionRef.current
    ) {
      previousResolutionRef.current = resolution;
      const model = engine.getModels().find((m) => m.id === resolution.modelId);
      schemaRef.current = model?.schema;
      form.reset(resolution.values as DefaultValues<FieldValues>);
    }
  }, [status, resolution, form, engine]);

  const onSubmit = form.handleSubmit(async (values) => {
    await onSubmitRef.current?.(values);
  });

  return {
    error,
    form,
    onSubmit,
    resolution,
    reset,
    resolve,
    status,
  };
}
