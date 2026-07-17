import type { CanonicalGrowth, CanonicalHumanMeaning, CanonicalNeed, CanonicalPattern, CanonicalTrait, RuntimeExplainability } from "@/lib/humanMeaningRuntime/types";
import { unique } from "@/lib/humanMeaningRuntime/runtimeUtils";

export const explainabilityEngine = {
  build(input: {
    traits: readonly CanonicalTrait[];
    patterns: readonly CanonicalPattern[];
    meanings: readonly CanonicalHumanMeaning[];
    needs: readonly CanonicalNeed[];
    growth: readonly CanonicalGrowth[];
  }): RuntimeExplainability[] {
    const traits = new Map(input.traits.map((item) => [item.id, item]));
    const patterns = new Map(input.patterns.map((item) => [item.id, item]));
    const meanings = new Map(input.meanings.map((item) => [item.id, item]));
    const needs = new Map(input.needs.map((item) => [item.id, item]));
    const results: RuntimeExplainability[] = [];

    for (const meaning of input.meanings) {
      const supportingPatterns = meaning.patternIds.map((id) => patterns.get(id)).filter((item): item is CanonicalPattern => Boolean(item));
      const supportingTraits = supportingPatterns.flatMap((pattern) => pattern.traitIds.map((id) => traits.get(id)).filter((item): item is CanonicalTrait => Boolean(item)));
      results.push({ objectId: meaning.id, chain: [meaning.id, ...supportingPatterns.map((item) => item.id), ...supportingTraits.map((item) => item.id)], evidenceIds: meaning.evidenceIds });
    }

    for (const need of input.needs) {
      const supportingMeanings = need.meaningIds.map((id) => meanings.get(id)).filter((item): item is CanonicalHumanMeaning => Boolean(item));
      const meaningChains = results.filter((item) => supportingMeanings.some((meaning) => meaning.id === item.objectId));
      results.push({ objectId: need.id, chain: unique([need.id, ...meaningChains.flatMap((item) => item.chain)]), evidenceIds: need.evidenceIds });
    }

    for (const growth of input.growth) {
      const supportingNeeds = growth.needIds.map((id) => needs.get(id)).filter((item): item is CanonicalNeed => Boolean(item));
      const needChains = results.filter((item) => supportingNeeds.some((need) => need.id === item.objectId));
      results.push({ objectId: growth.id, chain: unique([growth.id, ...needChains.flatMap((item) => item.chain)]), evidenceIds: growth.evidenceIds });
    }

    return results;
  },
};
