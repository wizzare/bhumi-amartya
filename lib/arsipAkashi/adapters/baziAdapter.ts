import type { BaziBlueprint } from "@/lib/bazi/types";
import type { ArsipAkashiSystemEntry, ArsipAkashiNormalizedFact } from "../types";

const SYSTEM_ID = "bazi" as const;
const ADAPTER_VERSION = "bazi-adapter-v1";
const SOURCE_PATH = "lib/bazi/calculateBazi.ts";

function fingerprinted(bazi: BaziBlueprint): string {
  const { strengths, challenges, careerStyle, relationshipStyle, moneyStyle, lifeMission, summary, ...fp } = bazi;
  const d = JSON.stringify(fp, Object.keys(fp).sort());
  const hash = Array.from(d).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return `bazi-fp-${hash}`;
}

function fact(
  field: string, domain: string, value: string, eligible: boolean,
  warnings?: string[],
): ArsipAkashiNormalizedFact {
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
    warnings: warnings ?? [],
  };
}

export function adaptBaziToArsipAkashi(bazi: BaziBlueprint): ArsipAkashiSystemEntry {
  const facts: ArsipAkashiNormalizedFact[] = [
    fact("yearPillar", "identity", `${bazi.yearPillar.stem} ${bazi.yearPillar.branch}`, true),
    fact("monthPillar", "identity", `${bazi.monthPillar.stem} ${bazi.monthPillar.branch}`, true),
    fact("dayPillar", "identity", `${bazi.dayPillar.stem} ${bazi.dayPillar.branch}`, true),
  ];

  if (bazi.hourPillar.stem) {
    facts.push(fact("hourPillar", "identity", `${bazi.hourPillar.stem} ${bazi.hourPillar.branch}`, true));
  } else {
    facts.push(fact("hourPillar", "identity", "unavailable", false, ["Hour pillar not computed"]));
  }

  facts.push(
    fact("dayMaster", "identity", `${bazi.dayMaster.pinyin} (${bazi.dayMaster.element})`, true),
    fact("fiveElements", "mechanics", JSON.stringify(bazi.fiveElements), true),
    fact("favorableElements", "growth", bazi.favorableElements.join(", "), true),
    fact("unfavorableElements", "mechanics", bazi.unfavorableElements.join(", "), true),
    fact("currentLuckCycle", "timing", `${bazi.currentLuckCycle.pillar.stem} ${bazi.currentLuckCycle.pillar.branch} (age ${bazi.currentLuckCycle.startAge}–${bazi.currentLuckCycle.endAge})`, true),
  );

  return {
    systemId: SYSTEM_ID,
    availability: "available",
    sourceOwner: SOURCE_PATH,
    normalizedFacts: facts,
    calculationFingerprint: fingerprinted(bazi),
    calculationVersion: ADAPTER_VERSION,
    warnings: [],
    generatedAt: bazi.currentLuckCycle ? `${bazi.currentLuckCycle.startAge.toString().padStart(2, "0")}-${bazi.currentLuckCycle.endAge.toString().padStart(2, "0")}-01T00:00:00.000Z` : new Date(0).toISOString(),
  };
}
