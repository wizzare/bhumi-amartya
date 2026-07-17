import type { WholeSignResult } from "@/lib/whole-sign/types";
import type { ArsipAkashiSystemEntry, ArsipAkashiNormalizedFact } from "../types";

const SYSTEM_ID = "whole-sign" as const;
const ADAPTER_VERSION = "whole-sign-adapter-v1";
const SOURCE_PATH = "lib/whole-sign/calculateWholeSign.ts";

function fingerprinted(ws: WholeSignResult): string {
  const d = JSON.stringify(ws, Object.keys(ws).sort());
  const hash = Array.from(d).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return `whole-sign-fp-${hash}`;
}

function fact(
  field: string, domain: string, value: string, eligible: boolean,
  sourceVersion: string,
  warnings?: string[],
): ArsipAkashiNormalizedFact {
  return {
    factId: `${SYSTEM_ID}/${domain}/${field}`,
    systemId: SYSTEM_ID,
    domain: domain as any,
    label: field,
    value,
    sourcePath: SOURCE_PATH,
    sourceVersion,
    interpretationEligibility: eligible,
    confidence: 1,
    warnings: warnings ?? [],
  };
}

export function adaptWholeSignToArsipAkashi(ws: WholeSignResult): ArsipAkashiSystemEntry {
  const facts: ArsipAkashiNormalizedFact[] = [];

  if (ws.ascendant && ws.ascendant.canonicalStatus !== "unavailable") {
    facts.push(fact("ascendant", "identity", `${ws.ascendant.sign} house ${ws.ascendant.wholeSignHouse ?? "?"}`, true, ws.sourceVersion));
  } else {
    facts.push(fact("ascendant", "identity", "unavailable", false, ws.sourceVersion, ["Birth time required for Ascendant"]));
  }

  if (ws.midheaven && ws.midheaven.canonicalStatus !== "unavailable") {
    facts.push(fact("midheaven", "mechanics", `${ws.midheaven.sign} house ${ws.midheaven.wholeSignHouse ?? "?"}`, true, ws.sourceVersion));
  }

  facts.push(fact("dominantElements", "mechanics", JSON.stringify(ws.dominantElements), true, ws.sourceVersion));
  facts.push(fact("dominantModalities", "mechanics", JSON.stringify(ws.dominantModalities), true, ws.sourceVersion));
  facts.push(fact("sourceVersion", "identity", ws.sourceVersion, false, ws.sourceVersion));
  facts.push(fact("houseCount", "mechanics", String(ws.houses.length), false, ws.sourceVersion));

  for (const em of ws.houseEmphasis) {
    facts.push(fact(`houseEmphasis:${em.houseNumber}`, "growth", `${em.sign} (${em.reasons.join("; ")})`, true, ws.sourceVersion));
  }

  return {
    systemId: SYSTEM_ID,
    availability: ws.birthDataStatus === "available" ? "available" : "birth-time-required",
    sourceOwner: SOURCE_PATH,
    normalizedFacts: facts,
    calculationFingerprint: fingerprinted(ws),
    calculationVersion: ws.sourceVersion,
    warnings: ws.note ? [ws.note] : [],
    generatedAt: new Date(0).toISOString(),
  };
}
