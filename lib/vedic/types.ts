export type VedicGraha =
  | "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";

export type VedicPlacement = {
  planet: VedicGraha;
  sign: string;
  longitude: number;
  degree: number;
  house: number;
  retrograde: boolean;
};

export type VedicSignPoint = {
  sign: string;
  longitude: number;
  degree: number;
  house: number;
};

export type VedicKaraka = {
  planet: Exclude<VedicGraha, "Rahu" | "Ketu">;
  sign: string;
  house: number;
};

export type VedicDashaPeriod = {
  planet: VedicGraha;
  startDate: string;
  endDate: string;
};

export type PlanetaryStrength = {
  planet: VedicGraha;
  level: "Strong" | "Balanced" | "Weak";
  score: number;
  reasons: string[];
};

export type VedicYoga = {
  name: "Raja Yoga" | "Dhana Yoga" | "Gaja Kesari Yoga" | "Budha Aditya Yoga";
  planets: VedicGraha[];
  evidence: string;
};

export type PurusharthaFocus = {
  rank: number;
  score: number;
  dominantSigns: string[];
};

export interface VedicBlueprint {
  lagna: VedicSignPoint;
  moonSign: VedicSignPoint;
  sunSign: VedicSignPoint;
  nakshatra: string;
  pada: number;
  atmakaraka: VedicKaraka;
  darakaraka: VedicKaraka;
  currentMahadasha: VedicDashaPeriod;
  currentAntardasha: VedicDashaPeriod;
  planetaryStrength: PlanetaryStrength[];
  majorYogas: VedicYoga[];
  dharmaFocus: PurusharthaFocus;
  arthaFocus: PurusharthaFocus;
  kamaFocus: PurusharthaFocus;
  mokshaFocus: PurusharthaFocus;
  strengths: string[];
  challenges: string[];
  relationshipStyle: string;
  careerStyle: string;
  spiritualStyle: string;
  summary: string[];
  planets: Record<VedicGraha, VedicPlacement>;
  meta: {
    schemaVersion: "1.0.0";
    engineVersion: "vedic-engine-1.0.0";
    calculationSource: "astronomy-engine";
    accuracy: "ephemeris";
    calculatedAt: string;
    asOf: string;
    standards: {
      zodiac: "sidereal";
      ayanamsha: "Lahiri/Chitrapaksha";
      houses: "whole-sign";
      nodes: "mean";
      dasha: "Vimshottari";
      dashaYearDays: 365.2425;
    };
  };
}

export type VedicPartialBlueprint = {
  status: "PARTIAL_BIRTH_TIME_REQUIRED";
  availableSections: string[];
  unavailableSections: Array<"Lagna" | "houses" | "exact time-dependent chart" | "time-sensitive interpretations">;
  message: "Waktu lahir diperlukan untuk menghitung Lagna, rumah astrologi, dan bagian Vedic yang bergantung pada posisi langit secara tepat.";
  meta: {
    schemaVersion: "1.0.0";
    engineVersion: "vedic-engine-1.0.0";
    calculationSource: "input-safety-guard";
    accuracy: "partial";
    calculatedAt: string;
    asOf: string;
  };
};

export type VedicCalculationResult = VedicBlueprint | VedicPartialBlueprint;

export type VedicCalculationInput = {
  birthDate: string;
  birthTime?: string | null;
  birthCity?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  asOf?: string | Date;
};
