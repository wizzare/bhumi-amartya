import type { TzolkinBlueprint } from "@/lib/tzolkin/types";
import type { ArsipAkashiSystemEntry, ArsipAkashiNormalizedFact } from "../types";

const SYSTEM_ID = "tzolkin" as const;
const ADAPTER_VERSION = "tzolkin-adapter-v1";
const SOURCE_PATH = "lib/tzolkin/calculateTzolkin.ts";

function fingerprinted(tzolkin: TzolkinBlueprint): string {
  const fp: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(tzolkin)) {
    if (
      key !== "strengths" &&
      key !== "challenges" &&
      key !== "relationshipStyle" &&
      key !== "workStyle" &&
      key !== "growthStyle" &&
      key !== "summary"
    ) {
      fp[key] = val;
    }
  }
  const d = JSON.stringify(fp, Object.keys(fp).sort());
  const hash = Array.from(d).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return `tzolkin-fp-${hash}`;
}

function fact(field: string, domain: string, value: string, eligible: boolean): ArsipAkashiNormalizedFact {
  return {
    factId: `${SYSTEM_ID}/${domain}/${field}`,
    systemId: SYSTEM_ID,
    domain: domain as any,
    label: field,
    value,
    sourcePath: SOURCE_PATH,
    sourceVersion: ADAPTER_VERSION,
    interpretationEligibility: eligible,
    confidence: 1,
    warnings: [],
  };
}

export function adaptTzolkinToArsipAkashi(tzolkin: TzolkinBlueprint): ArsipAkashiSystemEntry {
  if (
    tzolkin.isSpecialDay ||
    !tzolkin.kin ||
    !tzolkin.solarSeal ||
    !tzolkin.galacticTone ||
    !tzolkin.wavespell ||
    !tzolkin.castle ||
    !tzolkin.oracle
  ) {
    return {
      systemId: SYSTEM_ID,
      availability: "partial",
      sourceOwner: SOURCE_PATH,
      normalizedFacts: [
        fact("specialDay", "identity", tzolkin.specialDay || "0.0_HUNAB_KU", true),
        fact("kinName", "identity", tzolkin.kinName, true),
      ],
      calculationFingerprint: fingerprinted(tzolkin),
      calculationVersion: ADAPTER_VERSION,
      warnings: ["Special calendar day outside regular 260-kin sequence (0.0 Hunab Ku)"],
      generatedAt: new Date(0).toISOString(),
    };
  }

  const facts: ArsipAkashiNormalizedFact[] = [
    fact("kin", "identity", `${tzolkin.kin} (${tzolkin.kinName})`, true),
    fact("solarSeal", "identity", `${tzolkin.solarSeal.name} (${tzolkin.solarSeal.keyword})`, true),
    fact("galacticTone", "mechanics", `${tzolkin.galacticTone.name} (${tzolkin.galacticTone.function})`, true),
    fact("color", "mechanics", tzolkin.color || "", true),
    fact("wavespell", "spirituality", `${tzolkin.wavespell.name} (${tzolkin.wavespell.theme})`, true),
    fact("castle", "spirituality", `${tzolkin.castle.name} (${tzolkin.castle.theme})`, true),
    fact("gap", "growth", String(tzolkin.gap), true),
    fact("oracle:destiny", "identity", tzolkin.oracle.destiny.seal.name, true),
    fact("oracle:analog", "growth", tzolkin.oracle.analog.seal.name, true),
    fact("oracle:guide", "spirituality", tzolkin.oracle.guide.seal.name, true),
    fact("oracle:antipode", "shadow", tzolkin.oracle.antipode.seal.name, true),
    fact("oracle:occult", "karma", tzolkin.oracle.occult.seal.name, true),
  ];

  return {
    systemId: SYSTEM_ID,
    availability: "available",
    sourceOwner: SOURCE_PATH,
    normalizedFacts: facts,
    calculationFingerprint: fingerprinted(tzolkin),
    calculationVersion: ADAPTER_VERSION,
    warnings: [],
    generatedAt: new Date(0).toISOString(),
  };
}
