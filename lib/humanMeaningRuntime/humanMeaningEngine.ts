import { HUMAN_MEANING_LIBRARY } from "@/lib/humanMeaningRuntime/libraries";
import { weakestConfidence, unique } from "@/lib/humanMeaningRuntime/runtimeUtils";
import type { CanonicalHumanMeaning, CanonicalPattern } from "@/lib/humanMeaningRuntime/types";

export const humanMeaningEngine = {
  derive(patterns: readonly CanonicalPattern[]): CanonicalHumanMeaning[] {
    const patternMap = new Map(patterns.map((pattern) => [pattern.id, pattern]));
    return Object.entries(HUMAN_MEANING_LIBRARY).flatMap(([id, definition]) => {
      const supporting = definition.patternIds.map((patternId) => patternMap.get(patternId)).filter((pattern): pattern is CanonicalPattern => Boolean(pattern));
      if (supporting.length !== definition.patternIds.length) return [];
      return [{
        id,
        name: definition.name,
        domain: definition.domain,
        patternIds: [...definition.patternIds],
        evidenceIds: unique(supporting.flatMap((pattern) => pattern.evidenceIds)),
        confidence: weakestConfidence(supporting.map((pattern) => pattern.confidence)),
      }];
    });
  },
};
