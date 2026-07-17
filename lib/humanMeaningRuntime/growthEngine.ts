import { GROWTH_LIBRARY } from "@/lib/humanMeaningRuntime/libraries";
import { weakestConfidence, unique } from "@/lib/humanMeaningRuntime/runtimeUtils";
import type { CanonicalGrowth, CanonicalNeed } from "@/lib/humanMeaningRuntime/types";

export const growthEngine = {
  derive(needs: readonly CanonicalNeed[]): CanonicalGrowth[] {
    const needMap = new Map(needs.map((need) => [need.id, need]));
    return Object.entries(GROWTH_LIBRARY).flatMap(([id, definition]) => {
      const supporting = definition.needIds.map((needId) => needMap.get(needId)).filter((need): need is CanonicalNeed => Boolean(need));
      if (!supporting.length) return [];
      return [{
        id,
        name: definition.name,
        type: definition.type,
        needIds: supporting.map((need) => need.id),
        evidenceIds: unique(supporting.flatMap((need) => need.evidenceIds)),
        confidence: weakestConfidence(supporting.map((need) => need.confidence)),
      }];
    });
  },
};
