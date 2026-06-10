import type { HumanDesignChart } from "@/lib/humandesign/types";

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
  house: number;
  retrograde?: boolean;
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
  houses?: Record<string, { sign: string; degree: number }>;
  planets?: Record<string, PlanetaryPosition>;
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
  talents?: number[];
  yearlyArcana?: number;
  purposes?: Record<string, number>;
  chartHeart?: Record<string, number>;
  years?: Record<string, number>;
  rawPoints?: Record<string, number>;
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
  generatedAt: string;
  updatedAt: string;
}
