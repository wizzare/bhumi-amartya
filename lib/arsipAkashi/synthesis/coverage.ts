import type { ArsipAkashiInput, CanonicalSystemId } from "../types";
import { CANONICAL_SYSTEM_IDS } from "../types";
import { ARSIP_AKASHI_SOURCE_LEDGER } from "../sourceLedger";
import type { ArsipAkashiSectionId } from "../contracts";

export function analyzeGlobalCoverage(input: ArsipAkashiInput): {
  expectedSystems: number;
  availableSystems: CanonicalSystemId[];
  unavailableSystems: CanonicalSystemId[];
  coverageRatio: number;
} {
  const available: CanonicalSystemId[] = [];
  const unavailable: CanonicalSystemId[] = [];

  for (const sys of CANONICAL_SYSTEM_IDS) {
    const entry = input.systems[sys];
    if (
      entry &&
      (entry.availability === "available" || entry.availability === "partial")
    ) {
      available.push(sys);
    } else {
      unavailable.push(sys);
    }
  }

  return {
    expectedSystems: CANONICAL_SYSTEM_IDS.length,
    availableSystems: available.sort(),
    unavailableSystems: unavailable.sort(),
    coverageRatio: Math.round((available.length / CANONICAL_SYSTEM_IDS.length) * 100) / 100,
  };
}

export function analyzeSectionCoverage(
  sectionId: ArsipAkashiSectionId,
  input: ArsipAkashiInput,
): {
  eligibleSystemCount: number;
  contributingSystemCount: number;
  selectedFactCount: number;
  availableSystems: CanonicalSystemId[];
  contributingSystems: CanonicalSystemId[];
  unavailableSystems: CanonicalSystemId[];
} {
  const contract = ARSIP_AKASHI_SOURCE_LEDGER[sectionId];
  if (!contract) {
    return {
      eligibleSystemCount: 0,
      contributingSystemCount: 0,
      selectedFactCount: 0,
      availableSystems: [],
      contributingSystems: [],
      unavailableSystems: [],
    };
  }

  const available: CanonicalSystemId[] = [];
  const unavailable: CanonicalSystemId[] = [];
  const contributing: CanonicalSystemId[] = [];

  for (const sys of contract.eligibleSystems) {
    const entry = input.systems[sys];
    if (!entry || entry.availability === "unavailable" || entry.availability === "calculation-failed") {
      unavailable.push(sys);
      continue;
    }
    available.push(sys);
    const hasEligibleFacts = entry.normalizedFacts.some((f) =>
      contract.allowedDomains.includes(f.domain) &&
      f.interpretationEligibility,
    );
    if (hasEligibleFacts) {
      contributing.push(sys);
    }
  }

  return {
    eligibleSystemCount: contract.eligibleSystems.length,
    contributingSystemCount: contributing.length,
    selectedFactCount: 0,
    availableSystems: available.sort(),
    contributingSystems: contributing.sort(),
    unavailableSystems: unavailable.sort(),
  };
}
