import type { IntentFormEngine } from "@intentform/core";
import type { IntentResolution } from "@intentform/shared";
import { useCallback, useState } from "react";
import type { IntentFormStatus, UseIntentFormReturn } from "./types.js";

export function useIntentForm(engine: IntentFormEngine): UseIntentFormReturn {
  const [status, setStatus] = useState<IntentFormStatus>("idle");
  const [resolution, setResolution] = useState<IntentResolution | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);

  const resolve = useCallback(
    async (prompt: string) => {
      setStatus("loading");
      setError(null);
      try {
        const result = await engine.resolveIntent(prompt);
        setResolution(result);
        setValues(result.values);
        setStatus("resolved");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    },
    [engine]
  );

  const updateValue = useCallback((fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResolution(null);
    setValues({});
    setError(null);
  }, []);

  return { error, resolution, resolve, reset, status, updateValue, values };
}
