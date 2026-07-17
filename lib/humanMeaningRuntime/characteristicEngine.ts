import { CHARACTERISTIC_LIBRARY } from "@/lib/humanMeaningRuntime/libraries";
import { strongestConfidence, unique } from "@/lib/humanMeaningRuntime/runtimeUtils";
import type { BlueprintSignal, CanonicalCharacteristic } from "@/lib/humanMeaningRuntime/types";

export const characteristicEngine = {
  derive(signals: readonly BlueprintSignal[]): CanonicalCharacteristic[] {
    const grouped = Map.groupBy(signals, (signal) => signal.characteristicId);
    return [...grouped.entries()].map(([id, matching]) => {
      const definition = CHARACTERISTIC_LIBRARY[id as keyof typeof CHARACTERISTIC_LIBRARY];
      if (!definition) throw new Error(`UNKNOWN_CHARACTERISTIC:${id}`);
      return {
        id,
        name: definition.name,
        traitId: definition.traitId,
        signalIds: unique(matching.map((signal) => signal.id)),
        evidenceIds: unique(matching.flatMap((signal) => signal.evidenceIds)),
        confidence: strongestConfidence(matching.map((signal) => signal.confidence)),
      };
    });
  },
};
