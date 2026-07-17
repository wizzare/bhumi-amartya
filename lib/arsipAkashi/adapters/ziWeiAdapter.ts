import type { ZiWeiResult } from "@/lib/zi-wei/types";
import type { ArsipAkashiSystemEntry, ArsipAkashiNormalizedFact } from "../types";

const SYSTEM_ID = "zi-wei-dou-shu" as const;
const ADAPTER_VERSION = "zi-wei-adapter-v1";
const SOURCE_PATH = "lib/zi-wei/calculateZiWei.ts";

function fingerprinted(zw: ZiWeiResult): string {
  const stable = {
    birthDataStatus: zw.birthDataStatus,
    lunarYear: zw.lunarBirth?.lunarYear,
    bureau: zw.bureau,
    lifeMaster: zw.lifeMaster,
    bodyMaster: zw.bodyMaster,
    palaceCount: zw.palaces.length,
    palaceKeys: zw.palaces.map((p) => p.key).sort(),
    decadeCycles: zw.decadeCycles.map((d) => ({ ageStart: d.ageStart, ageEnd: d.ageEnd })),
    methodVersion: zw.method.sourceVersion,
  };
  const d = JSON.stringify(stable, Object.keys(stable).sort());
  const hash = Array.from(d).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return `zi-wei-fp-${hash}`;
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

export function adaptZiWeiToArsipAkashi(zw: ZiWeiResult): ArsipAkashiSystemEntry {
  const hasTime = zw.birthDataStatus.exactBirthTime;
  const status: "available" | "partial" = hasTime ? "available" : "partial";

  const facts: ArsipAkashiNormalizedFact[] = [];

  if (zw.lunarBirth) {
    facts.push(fact("lunarYear", "timing", String(zw.lunarBirth.lunarYear), false));
    facts.push(fact("lunarMonth", "timing", String(zw.lunarBirth.lunarMonth), false));
    facts.push(fact("lunarDay", "timing", String(zw.lunarBirth.lunarDay), false));
    if (hasTime) {
      facts.push(fact("hourBranch", "timing", zw.lunarBirth.hourBranch, true));
    }
  }

  if (zw.bureau) facts.push(fact("bureau", "mechanics", zw.bureau, true));
  if (zw.lifeMaster) facts.push(fact("lifeMaster", "identity", zw.lifeMaster, true));
  if (zw.bodyMaster) facts.push(fact("bodyMaster", "identity", zw.bodyMaster, true));

  const relationPalace = zw.palaces.find((p) => p.key === "relationship");
  const wealthPalace = zw.palaces.find((p) => p.key === "wealth");
  const careerPalace = zw.palaces.find((p) => p.key === "career");

  if (relationPalace) {
    facts.push(fact("relationshipPalace", "relationships",
      JSON.stringify(relationPalace.majorStars.map((s) => s.canonicalName)), true));
  }
  if (wealthPalace) {
    facts.push(fact("wealthPalace", "resources",
      JSON.stringify(wealthPalace.majorStars.map((s) => s.canonicalName)), true));
  }
  if (careerPalace) {
    facts.push(fact("careerPalace", "talents",
      JSON.stringify(careerPalace.majorStars.map((s) => s.canonicalName)), true));
  }

  if (zw.fourTransformations.length > 0) {
    facts.push(fact("fourTransformations", "growth",
      JSON.stringify(zw.fourTransformations.map((t) => `${t.star} (${t.type})`)), true));
  }

  if (zw.activeDecade) {
    facts.push(fact("activeDecade", "timing",
      `${zw.activeDecade.palace} (age ${zw.activeDecade.ageStart}–${zw.activeDecade.ageEnd})`, true));
  }

  return {
    systemId: SYSTEM_ID,
    availability: status,
    sourceOwner: SOURCE_PATH,
    normalizedFacts: facts,
    calculationFingerprint: fingerprinted(zw),
    calculationVersion: ADAPTER_VERSION,
    warnings: hasTime ? [] : ["Exact birth time required for full Zi Wei Dou Shu calculation"],
    generatedAt: zw.lunarBirth ? `${zw.lunarBirth.lunarYear.toString().padStart(4, "0")}-${zw.lunarBirth.lunarMonth.toString().padStart(2, "0")}-${zw.lunarBirth.lunarDay.toString().padStart(2, "0")}T00:00:00.000Z` : new Date(0).toISOString(),
  };
}
