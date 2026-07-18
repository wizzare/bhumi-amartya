import type { ArsipAkashiInput, ArsipAkashiNormalizedFact, CanonicalSystemId } from "../types";
import { ARSIP_AKASHI_SOURCE_LEDGER } from "../sourceLedger";
import type { ArsipAkashiSectionId } from "../contracts";
import type { ArsipAkashiSelectedFact, InsightStabilityType } from "./types";

function classifyStability(
  fact: ArsipAkashiNormalizedFact,
  systemId: CanonicalSystemId,
): InsightStabilityType {
  if (systemId === "astrocartography" && fact.domain === "location") return "location-context";
  if (fact.domain === "timing") return "active-timing";
  if (fact.domain === "karma" && systemId === "tzolkin") return "symbolic-resonance";
  if (fact.domain === "karma" || fact.domain === "spirituality") return "contextual-expression";
  if (fact.domain === "shadow" || fact.domain === "growth") return "recurring-pattern";
  return "stable-identity";
}

function isDuplicatePlacement(
  fact: ArsipAkashiNormalizedFact,
  systemId: CanonicalSystemId,
  selected: ArsipAkashiNormalizedFact[],
): boolean {
  if (systemId !== "whole-sign" && systemId !== "natal-chart") return false;
  const planetMatch = fact.factId.match(/planet:(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto)/);
  if (!planetMatch) return false;
  const planet = planetMatch[1];
  return selected.some((e) => e.factId.includes(`planet:${planet}`));
}

export function selectFactsForSection(
  sectionId: ArsipAkashiSectionId,
  input: ArsipAkashiInput,
): ArsipAkashiSelectedFact[] {
  const contract = ARSIP_AKASHI_SOURCE_LEDGER[sectionId];
  if (!contract) return [];

  const selected: ArsipAkashiSelectedFact[] = [];
  const seenPlanets: ArsipAkashiNormalizedFact[] = [];

  for (const systemId of contract.contributionPriority) {
    const entry = input.systems[systemId];
    if (!entry || entry.availability === "unavailable" || entry.availability === "calculation-failed") {
      continue;
    }

    const sorted = [...entry.normalizedFacts]
      .filter((f) => !f.warnings.includes("prose-only"))
      .sort((a, b) => a.factId.localeCompare(b.factId));

    for (const fact of sorted) {
      if (!contract.allowedDomains.includes(fact.domain)) continue;
      if (!fact.interpretationEligibility) continue;
      if (fact.value === "unavailable" || fact.value === "?") continue;

      if (isDuplicatePlacement(fact, systemId, seenPlanets)) continue;

      seenPlanets.push(fact);
      selected.push({
        factId: fact.factId,
        systemId: systemId,
        domain: fact.domain,
        value: fact.value,
        interpretationEligibility: fact.interpretationEligibility,
        sourcePath: fact.sourcePath,
        sourceVersion: fact.sourceVersion,
        stabilityType: classifyStability(fact, systemId),
        warnings: fact.warnings,
      });
    }
  }

  return selected;
}
