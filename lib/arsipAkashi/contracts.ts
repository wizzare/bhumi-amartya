import type { CanonicalSystemId } from "./types";

export type ArsipAkashiSectionId =
  | "soul-identity"
  | "energy-mechanics"
  | "wounds-shadow-lineage"
  | "work-talents"
  | "love-relationships"
  | "body-environment"
  | "spirituality-evolution"
  | "current-life-phase"
  | "symbolic-origin"
  | "growth-potential";

export const ARSIP_AKASHI_SECTION_IDS: readonly ArsipAkashiSectionId[] = [
  "soul-identity",
  "energy-mechanics",
  "wounds-shadow-lineage",
  "work-talents",
  "love-relationships",
  "body-environment",
  "spirituality-evolution",
  "current-life-phase",
  "symbolic-origin",
  "growth-potential",
];

export const SECTION_DISPLAY_TITLES: Record<ArsipAkashiSectionId, string> = {
  "soul-identity": "Soul Identity",
  "energy-mechanics": "Energy & Mechanics",
  "wounds-shadow-lineage": "Wounds, Shadow & Lineage",
  "work-talents": "Work & Talents",
  "love-relationships": "Love & Relationships",
  "body-environment": "Body & Environment",
  "spirituality-evolution": "Spirituality & Evolution",
  "current-life-phase": "Current Life Phase",
  "symbolic-origin": "Symbolic Origin",
  "growth-potential": "Growth Potential",
};

export interface ArsipAkashiSectionContract {
  sectionId: ArsipAkashiSectionId;
  eligibleSystems: CanonicalSystemId[];
  contributionPriority: CanonicalSystemId[];
  allowedDomains: string[];
  required: boolean;
  birthTimeSensitive: boolean;
  classification: "calculated" | "symbolic" | "cross-system-synthesis";
  fallbackPolicy: "omit-section" | "reduce-confidence" | "static-placeholder";
}

export const ARSIP_AKASHI_VERSION = "1.0.0";
