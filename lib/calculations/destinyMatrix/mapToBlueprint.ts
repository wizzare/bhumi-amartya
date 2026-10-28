import { calculateCanonicalDestinyMatrixBlueprint } from "@/lib/engines/destinyMatrixBlueprintAdapter";

export function calculateDestinyMatrixForBlueprint(birthDate: string) {
  if (!birthDate || typeof birthDate !== "string" || birthDate.trim() === "") {
    return {
      status: "error" as const,
      calculationStatus: "error" as const,
      loveLine: [],
      moneyLine: [],
      karmicTail: [],
    };
  }

  try {
    return calculateCanonicalDestinyMatrixBlueprint(birthDate);
  } catch (err) {
    console.error("[CANONICAL DESTINY MATRIX ERROR]", err);
    return {
      status: "error" as const,
      calculationStatus: "error" as const,
      loveLine: [],
      moneyLine: [],
      karmicTail: [],
    };
  }
}
