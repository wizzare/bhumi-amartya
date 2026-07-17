import { NEED_LIBRARY } from "@/lib/humanMeaningRuntime/libraries";
import { weakestConfidence, unique } from "@/lib/humanMeaningRuntime/runtimeUtils";
import type { CanonicalHumanMeaning, CanonicalNeed } from "@/lib/humanMeaningRuntime/types";

export const needEngine = {
  derive(meanings: readonly CanonicalHumanMeaning[]): CanonicalNeed[] {
    const meaningMap = new Map(meanings.map((meaning) => [meaning.id, meaning]));
    return Object.entries(NEED_LIBRARY).flatMap(([id, definition]) => {
      const supporting = definition.meaningIds.map((meaningId) => meaningMap.get(meaningId)).filter((meaning): meaning is CanonicalHumanMeaning => Boolean(meaning));
      if (!supporting.length) return [];
      return [{
        id,
        name: definition.name,
        horizon: definition.horizon,
        meaningIds: supporting.map((meaning) => meaning.id),
        evidenceIds: unique(supporting.flatMap((meaning) => meaning.evidenceIds)),
        confidence: weakestConfidence(supporting.map((meaning) => meaning.confidence)),
      }];
    });
  },
};
