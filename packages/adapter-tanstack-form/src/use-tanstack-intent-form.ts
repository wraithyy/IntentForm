import type { IntentFormEngine } from "@intentform/core";
import type { IntentFormStatus } from "@intentform/react";
import { useIntentForm } from "@intentform/react";
import type { IntentResolution, StandardSchemaV1 } from "@intentform/shared";
import { validateStandard } from "@intentform/shared";
import type { ReactFormApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
import { useEffect, useRef } from "react";

export type TanStackFormInstance = ReturnType<
  typeof useForm<Record<string, unknown>>
> &
  ReactFormApi<Record<string, unknown>, undefined>;

export interface UseTanStackIntentFormOptions {
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
}

export interface UseTanStackIntentFormReturn {
  error: string | null;
  form: TanStackFormInstance;
  reset: () => void;
  resolution: IntentResolution | null;
  resolve: (prompt: string) => Promise<void>;
  status: IntentFormStatus;
}

export function useTanStackIntentForm(
  engine: IntentFormEngine,
  options?: UseTanStackIntentFormOptions
): UseTanStackIntentFormReturn {
  const { error, resolution, reset, resolve, status } = useIntentForm(engine);
  const onSubmitRef = useRef(options?.onSubmit);
  onSubmitRef.current = options?.onSubmit;

  const schemaRef = useRef<StandardSchemaV1 | undefined>(undefined);

  const form = useForm<Record<string, unknown>>({
    defaultValues: {} as Record<string, unknown>,
    validators: {
      onSubmitAsync: async ({ value }: { value: Record<string, unknown> }) => {
        const schema = schemaRef.current;
        if (!schema) {
          return;
        }
        const result = await validateStandard(schema, value);
        if (!result.success) {
          return result.issues.map((i) => i.message).join("; ");
        }
        return;
      },
    },
    onSubmit: async ({ value }) => {
      await onSubmitRef.current?.(value);
    },
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
      form.update({ defaultValues: resolution.values });
      form.reset();
    }
  }, [status, resolution, form, engine]);

  return {
    error,
    form,
    resolution,
    reset,
    resolve,
    status,
  };
}
