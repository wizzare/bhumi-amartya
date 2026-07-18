import type { CanonicalSystemId } from "../types";
import type { ArsipAkashiSectionId } from "../contracts";

export type InsightStabilityType =
  | "stable-identity"
  | "recurring-pattern"
  | "contextual-expression"
  | "active-timing"
  | "location-context"
  | "symbolic-resonance"
  | "partial-data-theme";

export interface ArsipAkashiSelectedFact {
  factId: string;
  systemId: CanonicalSystemId;
  domain: string;
  value: string;
  interpretationEligibility: boolean;
  sourcePath: string;
  sourceVersion: string;
  stabilityType: InsightStabilityType;
  warnings: string[];
}

export interface ArsipAkashiThemeCluster {
  themeId: string;
  supportingFactIds: string[];
  contributingSystems: CanonicalSystemId[];
  agreementLevel: "strong" | "moderate" | "partial" | "conflicting";
  stabilityType: InsightStabilityType;
  limitations: string[];
}

export interface ArsipAkashiTension {
  tensionId: string;
  themeA: string;
  themeB: string;
  supportingFactIds: string[];
  contributingSystems: CanonicalSystemId[];
  contextualResolution: string;
  limitations: string[];
}

export interface ArsipAkashiRecurringPattern {
  patternId: string;
  domains: string[];
  supportingFactIds: string[];
  contributingSystems: CanonicalSystemId[];
  occurrence: "cross-system" | "within-system";
  emotionalValence: "growth" | "challenge" | "neutral";
  limitations: string[];
}

export interface ArsipAkashiSectionInsight {
  sectionId: ArsipAkashiSectionId;
  coverage: {
    eligibleSystemCount: number;
    contributingSystemCount: number;
    selectedFactCount: number;
    availableSystems: CanonicalSystemId[];
    contributingSystems: CanonicalSystemId[];
    unavailableSystems: CanonicalSystemId[];
  };
  selectedFacts: ArsipAkashiSelectedFact[];
  primaryThemes: ArsipAkashiThemeCluster[];
  supportingThemes: ArsipAkashiThemeCluster[];
  tensions: ArsipAkashiTension[];
  recurringPatterns: ArsipAkashiRecurringPattern[];
  emotionalMeaning: string;
  practicalDirection: string;
  limitations: string[];
  provenance: string[];
  synthesisVersion: string;
}

export interface ArsipAkashiSoulLetterTheme {
  themeId: string;
  supportingFactIds: string[];
  contributingSystems: CanonicalSystemId[];
  emotionalDirection: "growth" | "healing" | "challenge" | "neutral";
  growthDirection: string;
  limitations: string[];
  coverageStatus: "fully-supported" | "partially-supported" | "limited";
}

export interface ArsipAkashiInsightModel {
  userId: string;
  generatedAt: string;
  blueprintFingerprint: string;
  sourceVersion: string;
  sections: ArsipAkashiSectionInsight[];
  soulLetterThemes: ArsipAkashiSoulLetterTheme[];
  globalCoverage: {
    expectedSystems: number;
    availableSystems: CanonicalSystemId[];
    unavailableSystems: CanonicalSystemId[];
    coverageRatio: number;
  };
  limitations: string[];
  provenance: string[];
  deterministicKey: string;
  timezone: string;
}

export const INSIGHT_SYNTHESIS_VERSION = "insight-engine-v1";
