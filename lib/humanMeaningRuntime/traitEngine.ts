import { TRAIT_LIBRARY } from "@/lib/humanMeaningRuntime/libraries";
import { strongestConfidence, unique } from "@/lib/humanMeaningRuntime/runtimeUtils";
import type { CanonicalCharacteristic, CanonicalTrait } from "@/lib/humanMeaningRuntime/types";

export const traitEngine = {
  derive(characteristics: readonly CanonicalCharacteristic[]): CanonicalTrait[] {
    const grouped = Map.groupBy(characteristics, (item) => item.traitId);
    return [...grouped.entries()].map(([id, matching]) => {
      const definition = TRAIT_LIBRARY[id as keyof typeof TRAIT_LIBRARY];
      if (!definition) throw new Error(`UNKNOWN_TRAIT:${id}`);
      return {
        id,
        name: definition.name,
        characteristicIds: matching.map((item) => item.id),
        evidenceIds: unique(matching.flatMap((item) => item.evidenceIds)),
        confidence: strongestConfidence(matching.map((item) => item.confidence)),
      };
    });
  },
};
