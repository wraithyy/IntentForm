import type { ModelDefinition } from '@intentform/shared'

const registry = new Map<string, ModelDefinition>()

export function registerModels(models: ModelDefinition[]): void {
  for (const model of models) {
    registry.set(model.id, model)
  }
}

export function getModel(id: string): ModelDefinition | undefined {
  return registry.get(id)
}

export function getAllModels(): ModelDefinition[] {
  return Array.from(registry.values())
}
