import type { HumanDesignChart } from "@/lib/humandesign/types";
import type { WetonBlueprint } from "@/lib/weton/types";
import type { BaziBlueprint } from "@/lib/bazi/types";
import type { VedicBlueprint } from "@/lib/vedic/types";
import type { TzolkinBlueprint } from "@/lib/tzolkin/types";
import type { AstrocartographyResult } from "@/lib/astrocartography/types";
import type { ZiWeiResult } from "@/lib/zi-wei/types";
import type { CanonicalIdentity } from "@/lib/types/canonical";

export type BlueprintStatus = "missing" | "generating" | "ready" | "stale" | "error";

export type BirthData = {
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
};

export type PlanetaryPosition = {
  sign: string;
  degree: number;
  longitude: number;
  retrograde: boolean;
  house?: number;
  placidusHouse?: number;
  wholeSignHouse?: number;
};

export type NatalAspect = {
  p1: string;
  p2: string;
  type: "Conjunction" | "Sextile" | "Square" | "Trine" | "Opposition";
  orb: number;
};

export type NatalPattern = {
  type: "Stellium" | "Grand Trine" | "T-Square" | "Yod";
  planets: string[];
  sign?: string;
  house?: number;
};

export type NatalBalance = Record<string, number>;

export type NatalDominance = {
  dominantPlanet?: string;
  dominantSign?: string;
  dominantElement?: string;
  dominantModality?: string;
  dominantHouse?: number;
};

export type BlackMoonLilith = {
  sign: string;
  degree: number;
  house: number;
};

export interface LifePathBlueprint {
  number: number;
  display?: string;
  role: string;
  positiveTraits: string[];
  negativeTraits: string[];
}

export interface NatalChartBlueprint {
  sunSign: string;
  moonSign?: string;
  risingSign?: string;
  midheaven?: string;
  mc?: string;
  houses?: Record<string, { sign: string; degree: number }>;
  placidusHouses?: Record<string, { sign: string; degree: number; longitude: number }>;
  wholeSignHouses?: Record<string, { sign: string; degree: number; longitude: number }>;
  planets?: {
    Sun?: PlanetaryPosition;
    Moon?: PlanetaryPosition;
    Mercury?: PlanetaryPosition;
    Venus?: PlanetaryPosition;
    Mars?: PlanetaryPosition;
    Jupiter?: PlanetaryPosition;
    Saturn?: PlanetaryPosition;
    Uranus?: PlanetaryPosition;
    Neptune?: PlanetaryPosition;
    Pluto?: PlanetaryPosition;
    NorthNode?: PlanetaryPosition;
    SouthNode?: PlanetaryPosition;
    Chiron?: PlanetaryPosition;
  };
  northNode?: string;
  southNode?: string;
  chiron?: string;
  lilith?: BlackMoonLilith;
  elements?: NatalBalance;
  modalities?: NatalBalance;
  polarities?: NatalBalance;
  aspects?: NatalAspect[];
  patterns?: NatalPattern[];
  dominance?: NatalDominance;
  dominantPlanet?: string;
  dominantSign?: string;
  dominantElement?: string;
  dominantModality?: string;
  dominantHouse?: number;
}

export type HumanDesignBlueprint = HumanDesignChart;

export interface DestinyMatrixBlueprint {
  dayPoint?: number;
  monthPoint?: number;
  yearPoint?: number;
  destinyPoint?: number;
  arcanaCenter?: number;
  center?: number;
  loveLine?: number[];
  moneyLine?: number[];
  karmicTail?: number[];
  fatherLine?: number[];
  motherLine?: number[];
  ancestorLine?: number[];
  talentsFather?: number[];
  talentsMother?: number[];
  talentsGreat?: number[];
  yearlyArcana?: number;
  purposes?: Record<string, number>;
  chartHeart?: Record<string, number>;
  years?: Record<string, number>;
  rawPoints?: Record<string, number>;
  destinyIntelligence?: {
    soulSearching?: number;
    socialization?: number;
    spiritualKnowledge?: number;
    healthChart?: {
      sahasrara?: { physics?: number; energy?: number; emotion?: number };
      ajna?: { physics?: number; energy?: number; emotion?: number };
      vishudha?: { physics?: number; energy?: number; emotion?: number };
      anahata?: { physics?: number; energy?: number; emotion?: number };
      manipura?: { physics?: number; energy?: number; emotion?: number };
      svadhisthana?: { physics?: number; energy?: number; emotion?: number };
      muladhara?: { physics?: number; energy?: number; emotion?: number };
    };
  };
  healthChart?: Record<string, { physics?: number; energy?: number; emotion?: number }>;
  chakraMatrix?: Record<string, { physics?: number; energy?: number; emotion?: number }>;
  status?: "pending" | "completed" | "error";
}

export interface NumerologyBlueprint {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
}

export interface Blueprint {
  uid: string;
  status: BlueprintStatus;
  input: BirthData;
  lifePath?: LifePathBlueprint;
  natalChart?: NatalChartBlueprint & { calculationStatus: "completed" | "pending" | "error"; };
  numerology: LifePathBlueprint;
  astrology: NatalChartBlueprint & { calculationStatus: "completed" | "pending" | "error"; };
  humanDesign: HumanDesignBlueprint;
  destinyMatrix: DestinyMatrixBlueprint & { calculationStatus: "completed" | "pending" | "error"; };
  weton?: WetonBlueprint;
  bazi?: BaziBlueprint;
  vedic?: VedicBlueprint;
  tzolkin?: TzolkinBlueprint;
  astrocartography?: AstrocartographyResult;
  ziWei?: ZiWeiResult;
  canonicalIdentity?: CanonicalIdentity;
  generatedAt: string;
  updatedAt: string;
}
