import type { WetonBlueprint } from "@/lib/weton/types";
import type { ArsipAkashiSystemEntry, ArsipAkashiNormalizedFact } from "../types";
import { CANONICAL_SYSTEM_IDS } from "../types";

const SYSTEM_ID = "weton" as const;
const ADAPTER_VERSION = "weton-adapter-v1";
const SOURCE_PATH = "lib/weton/calculateWeton.ts";

function fingerprinted(weton: WetonBlueprint): string {
  const d = JSON.stringify(weton, Object.keys(weton).sort());
  const hash = Array.from(d).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return `${SYSTEM_ID}-fp-${hash}`;
}

function fact(
  field: string,
  domain: string,
  value: string,
  eligible: boolean,
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
    warnings: [],
  };
}

export function adaptWetonToArsipAkashi(weton: WetonBlueprint): ArsipAkashiSystemEntry {
  const facts: ArsipAkashiNormalizedFact[] = [
    fact("day", "identity", weton.day, true),
    fact("pasaran", "identity", weton.pasaran, true),
    fact("weton", "identity", weton.weton, true),
    fact("neptuDay", "mechanics", String(weton.neptuDay), false),
    fact("neptuPasaran", "mechanics", String(weton.neptuPasaran), false),
    fact("totalNeptu", "mechanics", String(weton.totalNeptu), true),
    fact("wuku", "spirituality", `${weton.wuku.name} (${weton.wuku.description})`, true),
    fact("pranataMangsa", "timing", `${weton.pranataMangsa.name} (${weton.pranataMangsa.description})`, true),
  ];

  return {
    systemId: SYSTEM_ID,
    availability: "available",
    sourceOwner: "lib/weton/calculateWeton.ts",
    normalizedFacts: facts,
    calculationFingerprint: fingerprinted(weton),
    calculationVersion: ADAPTER_VERSION,
    warnings: [],
    generatedAt: new Date(0).toISOString(),
  };
}

export function adaptWetonPartial(): ArsipAkashiSystemEntry {
  return {
    systemId: SYSTEM_ID,
    availability: "unavailable",
    sourceOwner: SOURCE_PATH,
    normalizedFacts: [],
    calculationFingerprint: `${SYSTEM_ID}-unavailable`,
    calculationVersion: ADAPTER_VERSION,
    warnings: ["Weton calculation unavailable"],
    generatedAt: new Date(0).toISOString(),
  };
}
