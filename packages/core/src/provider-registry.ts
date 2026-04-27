import type { AiProvider } from "@intentform/shared";

const registry: AiProvider[] = [];

export function registerProviders(providers: AiProvider[]): void {
  registry.push(...providers);
}

export function getProviders(): AiProvider[] {
  return [...registry];
}
