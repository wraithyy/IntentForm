import type { ModelDefinition } from "@intentform/shared";

export class ModelRegistry {
  readonly #models = new Map<string, ModelDefinition>();

  register(models: ModelDefinition[]): void {
    for (const model of models) {
      this.#models.set(model.id, model);
    }
  }

  get(id: string): ModelDefinition | undefined {
    return this.#models.get(id);
  }

  getAll(): ModelDefinition[] {
    return Array.from(this.#models.values());
  }

  has(id: string): boolean {
    return this.#models.has(id);
  }

  size(): number {
    return this.#models.size;
  }
}
