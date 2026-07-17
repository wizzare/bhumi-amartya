import type { VedicBlueprint, VedicPartialBlueprint, VedicCalculationResult } from "@/lib/vedic/types";
import type { ArsipAkashiSystemEntry, ArsipAkashiNormalizedFact } from "../types";

const SYSTEM_ID = "vedic-astrology" as const;
const ADAPTER_VERSION = "vedic-adapter-v1";
const SOURCE_PATH = "lib/vedic/calculateVedic.ts";

function fingerprinted(vedic: VedicBlueprint): string {
  const { strengths, challenges, relationshipStyle, careerStyle, spiritualStyle, summary, ...fp } = vedic;
  const d = JSON.stringify(fp, Object.keys(fp).sort());
  const hash = Array.from(d).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return `vedic-fp-${hash}`;
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

export function adaptVedicToArsipAkashi(result: VedicCalculationResult): ArsipAkashiSystemEntry {
  if (!("lagna" in result)) {
    const partial = result as VedicPartialBlueprint;
    return {
      systemId: SYSTEM_ID,
      availability: "birth-time-required",
      sourceOwner: SOURCE_PATH,
      normalizedFacts: [],
      calculationFingerprint: "vedic-birth-time-required",
      calculationVersion: ADAPTER_VERSION,
      warnings: [partial.message],
      generatedAt: new Date(0).toISOString(),
    };
  }

  const vedic = result as VedicBlueprint;
  const facts: ArsipAkashiNormalizedFact[] = [
    fact("lagna", "identity", `${vedic.lagna.sign} house ${vedic.lagna.house}`, true),
    fact("moonSign", "identity", `${vedic.moonSign.sign} house ${vedic.moonSign.house}`, true),
    fact("sunSign", "identity", `${vedic.sunSign.sign} house ${vedic.sunSign.house}`, true),
    fact("nakshatra", "identity", vedic.nakshatra, true),
    fact("pada", "identity", String(vedic.pada), true),
    fact("atmakaraka", "spirituality", `${vedic.atmakaraka.planet} in ${vedic.atmakaraka.sign}`, true),
    fact("darakaraka", "relationships", `${vedic.darakaraka.planet} in ${vedic.darakaraka.sign}`, true),
    fact("currentMahadasha", "timing", `${vedic.currentMahadasha.planet} (${vedic.currentMahadasha.startDate}–${vedic.currentMahadasha.endDate})`, true),
    fact("currentAntardasha", "timing", `${vedic.currentAntardasha.planet} (${vedic.currentAntardasha.startDate}–${vedic.currentAntardasha.endDate})`, true),
    fact("dharmaFocus", "growth", JSON.stringify(vedic.dharmaFocus), true),
    fact("arthaFocus", "resources", JSON.stringify(vedic.arthaFocus), true),
    fact("kamaFocus", "relationships", JSON.stringify(vedic.kamaFocus), true),
    fact("mokshaFocus", "spirituality", JSON.stringify(vedic.mokshaFocus), true),
  ];

  for (const yoga of vedic.majorYogas) {
    const yogaId = yoga.name.toLowerCase().replace(/\s+/g, "-");
    facts.push(fact(`yoga:${yogaId}`, "karma", yoga.evidence, true));
  }

  return {
    systemId: SYSTEM_ID,
    availability: "available",
    sourceOwner: SOURCE_PATH,
    normalizedFacts: facts,
    calculationFingerprint: fingerprinted(vedic),
    calculationVersion: ADAPTER_VERSION,
    warnings: [],
    generatedAt: new Date().toISOString(),
  };
}
