import { CONFLICT_LIBRARY } from "@/lib/humanMeaningRuntime/libraries";
import { unique } from "@/lib/humanMeaningRuntime/runtimeUtils";
import type { CanonicalPattern, CanonicalTrait, ResolvedConflict } from "@/lib/humanMeaningRuntime/types";

export const conflictEngine = {
  resolve(traits: readonly CanonicalTrait[], patterns: readonly CanonicalPattern[]): ResolvedConflict[] {
    const traitMap = new Map(traits.map((trait) => [trait.id, trait]));
    const patternIds = new Set(patterns.map((pattern) => pattern.id));
    return CONFLICT_LIBRARY.flatMap((definition) => {
      const [left, right] = definition.traitIds.map((id) => traitMap.get(id));
      if (!left || !right) return [];
      if (definition.synthesisPatternId && !patternIds.has(definition.synthesisPatternId)) {
        throw new Error(`INVALID_CONFLICT_SYNTHESIS:${definition.id}`);
      }
      return [{
        id: definition.id,
        traitIds: [...definition.traitIds] as [string, string],
        status: definition.status,
        synthesisPatternId: definition.synthesisPatternId,
        evidenceIds: unique([...left.evidenceIds, ...right.evidenceIds]),
      }];
    });
  },
};
