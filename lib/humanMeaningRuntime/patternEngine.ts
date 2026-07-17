import { PATTERN_LIBRARY } from "@/lib/humanMeaningRuntime/libraries";
import { weakestConfidence, unique } from "@/lib/humanMeaningRuntime/runtimeUtils";
import type { CanonicalPattern, CanonicalTrait } from "@/lib/humanMeaningRuntime/types";

export const patternEngine = {
  derive(traits: readonly CanonicalTrait[]): CanonicalPattern[] {
    const byId = new Map(traits.map((trait) => [trait.id, trait]));
    return Object.entries(PATTERN_LIBRARY).flatMap(([id, definition]) => {
      const supporting = definition.traitIds.map((traitId) => byId.get(traitId)).filter((trait): trait is CanonicalTrait => Boolean(trait));
      if (supporting.length !== definition.traitIds.length) return [];
      return [{
        id,
        name: definition.name,
        kind: definition.kind,
        traitIds: [...definition.traitIds],
        evidenceIds: unique(supporting.flatMap((trait) => trait.evidenceIds)),
        confidence: weakestConfidence(supporting.map((trait) => trait.confidence)),
      }];
    });
  },
};
