import type {
  AiProviderInput,
  AiProviderOutput,
  ConfidenceTier,
} from "@intentform/shared";

export interface TierResult {
  output: AiProviderOutput;
  tierId: string;
}

export async function routeThroughTiers(
  tiers: ConfidenceTier[],
  input: AiProviderInput,
  parseConfidence: (output: AiProviderOutput) => number
): Promise<TierResult> {
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    if (!tier) {
      continue;
    }

    const output = await tier.provider.generateStructured(input);
    const isLast = i === tiers.length - 1;

    if (isLast || tier.threshold === undefined) {
      return { output, tierId: tier.id };
    }

    const confidence = parseConfidence(output);
    if (confidence >= tier.threshold) {
      return { output, tierId: tier.id };
    }
  }

  // tiers array was empty — should not happen with validated config, but satisfy TS
  throw new Error("routeThroughTiers called with empty tiers array");
}
