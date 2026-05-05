import type { ModelDefinition } from "@intentform/shared";

interface ModuleWithDefault {
  default: unknown;
  models?: unknown;
}

export async function loadModels(
  absolutePath: string
): Promise<ModelDefinition[]> {
  let mod: ModuleWithDefault;
  try {
    mod = (await import(absolutePath)) as ModuleWithDefault;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to load models from "${absolutePath}": ${message}`);
  }

  const raw: unknown =
    "models" in mod && Array.isArray(mod.models) ? mod.models : mod.default;

  if (!Array.isArray(raw)) {
    throw new Error(
      `Models file "${absolutePath}" must export an array as default or named "models" export`
    );
  }

  if (raw.length === 0) {
    throw new Error(
      `Models file "${absolutePath}" exported an empty array — at least one model is required`
    );
  }

  return raw as ModelDefinition[];
}
