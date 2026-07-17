import type { NatalAspect, NatalBalance } from "@/lib/types/blueprint";

export type WholeSignAvailability = "available" | "partial" | "unavailable";

export type WholeSignAngle = {
  sign: string;
  longitude: number | null;
  degree: number | null;
  minute: number | null;
  wholeSignHouse: number | null;
  canonicalStatus: "canonical" | "sign-only" | "unavailable";
};

export type WholeSignPlanetPlacement = {
  planet: string;
  longitude: number;
  sign: string;
  degree: number;
  minute: number;
  retrograde: boolean;
  wholeSignHouse: number | null;
  placidusHouse: number | null;
  canonicalStatus: "canonical" | "sign-only";
};

export type WholeSignHouse = {
  houseNumber: number;
  sign: string;
  ruler: string;
  modernCoRuler: string | null;
  planets: string[];
  shortExplanation: string;
  fullExplanation: string;
  availabilityStatus: "available";
};

export type WholeSignEmphasis = {
  houseNumber: number;
  sign: string;
  planets: string[];
  reasons: string[];
};

export type WholeSignResult = {
  systemName: "Whole Sign Birth Chart";
  zodiacType: "Tropical";
  houseSystem: "Whole Sign";
  birthDataStatus: WholeSignAvailability;
  note: string | null;
  ascendant: WholeSignAngle | null;
  midheaven: WholeSignAngle | null;
  planets: WholeSignPlanetPlacement[];
  houses: WholeSignHouse[];
  aspects: NatalAspect[];
  dominantElements: NatalBalance;
  dominantModalities: NatalBalance;
  angularPlanets: WholeSignPlanetPlacement[];
  houseEmphasis: WholeSignEmphasis[];
  rulershipConvention: "Traditional primary; modern co-ruler identified separately";
  sourceVersion: "whole-sign-r7a-1";
  sourceClassification: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION";
  canonicalNatalSource: string;
};

export type WholeSignNarrativeCard = {
  id: string;
  title: string;
  value: string;
  narrative: string;
};

export type WholeSignPresentation = {
  hero: {
    eyebrow: "Whole Sign Birth Chart";
    title: "Rumah Kehidupan dalam Whole Sign";
    metrics: Array<{ label: string; value: string }>;
    insight: string;
  };
  identity: Array<{ label: string; value: string }>;
  ascendant: WholeSignNarrativeCard | null;
  sun: WholeSignNarrativeCard | null;
  moon: WholeSignNarrativeCard | null;
  planets: WholeSignNarrativeCard[];
  houses: WholeSignNarrativeCard[];
  houseEmphasis: WholeSignNarrativeCard[];
  angularPlanets: WholeSignNarrativeCard | null;
  midheaven: WholeSignNarrativeCard | null;
  relationshipThemes: string | null;
  homeThemes: string | null;
  workThemes: string | null;
  growthThemes: string | null;
  spiritualThemes: string | null;
  soulMissionThemes: string | null;
  summary: string[];
  availabilityStatus: WholeSignAvailability;
  availabilityMessage: string | null;
  profileCard: {
    title: "Whole Sign Birth Chart";
    ascendant: string | null;
    sunHouse: string | null;
    moonHouse: string | null;
    insight: string;
    action: "Lihat detail selengkapnya";
    href: "/blueprint/whole-sign";
  };
  sourceVersion: WholeSignResult["sourceVersion"];
  sourceClassification: WholeSignResult["sourceClassification"];
};
