import type { IntentResolution } from "./types.js";

/** JSON-safe representation of IntentResolution — ReadonlySet fields replaced with arrays. */
export type SerializableResolution<
  TValues extends Record<string, unknown> = Record<string, unknown>,
> = Omit<IntentResolution<TValues>, "hiddenFields" | "requiredFields"> & {
  readonly hiddenFields: readonly string[];
  readonly requiredFields: readonly string[];
};

/** Converts an IntentResolution to a JSON-safe form by replacing ReadonlySets with arrays. */
export function serializeResolution<
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(resolution: IntentResolution<TValues>): SerializableResolution<TValues> {
  return {
    ...resolution,
    hiddenFields: [...resolution.hiddenFields],
    requiredFields: [...resolution.requiredFields],
  };
}

/** Restores a full IntentResolution from its serialized form. */
export function deserializeResolution<
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(payload: SerializableResolution<TValues>): IntentResolution<TValues> {
  return {
    ...payload,
    hiddenFields: new Set(payload.hiddenFields),
    requiredFields: new Set(payload.requiredFields),
  };
}
