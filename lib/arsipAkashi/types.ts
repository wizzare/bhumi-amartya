export type CanonicalSystemId =
  | "numerology"
  | "human-design"
  | "natal-chart"
  | "destiny-matrix"
  | "weton"
  | "bazi"
  | "vedic-astrology"
  | "tzolkin"
  | "whole-sign"
  | "astrocartography"
  | "zi-wei-dou-shu";

export const CANONICAL_SYSTEM_IDS: readonly CanonicalSystemId[] = [
  "numerology",
  "human-design",
  "natal-chart",
  "destiny-matrix",
  "weton",
  "bazi",
  "vedic-astrology",
  "tzolkin",
  "whole-sign",
  "astrocartography",
  "zi-wei-dou-shu",
];

export type BirthTimeAvailability =
  | "exact"
  | "approximate"
  | "missing"
  | "system-does-not-require";

export type SystemAvailability =
  | "available"
  | "partial"
  | "unavailable"
  | "birth-time-required"
  | "calculation-failed"
  | "unsupported";

export type ArsipAkashiFactDomain =
  | "identity"
  | "mechanics"
  | "talents"
  | "shadow"
  | "relationships"
  | "health"
  | "spirituality"
  | "timing"
  | "location"
  | "karma"
  | "growth"
  | "resources";

export interface ArsipAkashiNormalizedFact {
  factId: string;
  systemId: CanonicalSystemId;
  domain: ArsipAkashiFactDomain;
  label: string;
  value: string;
  normalizedValue?: string;
  confidence: number;
  sourcePath: string;
  sourceVersion: string;
  interpretationEligibility: boolean;
  warnings: string[];
}

export interface ArsipAkashiSystemEntry {
  systemId: CanonicalSystemId;
  availability: SystemAvailability;
  sourceOwner: string;
  normalizedFacts: ArsipAkashiNormalizedFact[];
  calculationFingerprint: string;
  calculationVersion: string;
  warnings: string[];
  generatedAt: string;
}

export interface ArsipAkashiInput {
  userId: string;
  generatedForDate: string;
  referenceDate: string;
  timezone: string;
  sourceVersion: string;
  blueprintFingerprint: string;
  birthDataAvailability: {
    time: BirthTimeAvailability;
    birthplace: boolean;
    timezone: boolean;
  };
  systems: Partial<Record<CanonicalSystemId, ArsipAkashiSystemEntry>>;
  generationMetadata?: Record<string, string>;
}

export type ArsipAkashiSynthesisType =
  | "system-derived"
  | "cross-system-synthesis"
  | "symbolic-resonance"
  | "approved-spiritual-narrative";

export interface ArsipAkashiNarrativeBlock {
  blockId: string;
  title: string;
  text: string;
  sourceSystemIds: CanonicalSystemId[];
  supportingFactIds: string[];
  synthesisType: ArsipAkashiSynthesisType;
}

export interface ArsipAkashiSection {
  sectionId: string;
  title: string;
  summary: string;
  narrativeBlocks: ArsipAkashiNarrativeBlock[];
  sourceSystemIds: CanonicalSystemId[];
  supportingFactIds: string[];
  synthesisType: ArsipAkashiSynthesisType;
  confidence: number;
  limitations: string[];
  generatedAt: string;
  contentVersion: string;
}

export interface ArsipAkashiSourceCoverage {
  expectedSystems: 11;
  availableSystems: CanonicalSystemId[];
  partialSystems: CanonicalSystemId[];
  unavailableSystems: CanonicalSystemId[];
  contributingSystems: CanonicalSystemId[];
  coverageRatio: number;
  missingReasons: Partial<Record<CanonicalSystemId, string>>;
}

export interface ArsipAkashiPayload {
  userId: string;
  sourceVersion: string;
  blueprintFingerprint: string;
  generatedAt: string;
  referenceDate: string;
  sections: ArsipAkashiSection[];
  sourceCoverage: ArsipAkashiSourceCoverage;
  limitations: string[];
  provenance: string[];
  deterministicKey: string;
}
