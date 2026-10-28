export type WeeklyGuidanceState = "loading" | "ready" | "limited" | "unavailable" | "error";

export type RelationshipStatus = "single" | "in_relationship" | "unspecified";

export type AspectType = "Conjunction" | "Sextile" | "Square" | "Trine" | "Opposition";

export type WeeklyAstrologicalEvidence = {
  hasDirectActivation: boolean;
  transitBody?: string;
  transitLongitude?: number;
  transitSign?: string;
  transitDegree?: number;
  transitMotion?: "retrograde" | "direct" | "stationary";
  transitPlacidusHouse?: number;
  isCuspCrossing?: boolean;
  cuspCrossingDetail?: string;
  natalTouchedBody?: string;
  natalLongitude?: number;
  natalSign?: string;
  natalDegree?: number;
  natalPlacidusHouse?: number;
  aspectType?: AspectType;
  aspectLabel?: string;
  aspectOrb?: number;
  aspectPhase?: "applying" | "exact" | "separating";
  exactTimeFormatted?: string;
  activeHouses: number[] | readonly number[];
  activationSummary: string;
};

export type ReadingFoundationEntry = {
  system: string;
  indicator: string;
  detail: string;
};

export type WeeklyGuidanceSection = {
  key: string;
  title: string;
  focus: string;
  domain: string;
  summary: string;
  intensity: "high" | "medium" | "subtle";
  evidence: WeeklyAstrologicalEvidence;
  astrologicalMeaning: string;
  spiritualMeaning: string;
  blueprintContribution: string;
  crossSystemSynthesis?: string;
  readingFoundations?: ReadingFoundationEntry[];
  advice: string[];
  phases: { awalPekan: string[]; tengahPekan: string[]; akhirPekan: string[] };
  paragraphs: string[];
  sourceDomains: string[];
  timingEvidence?: string[];
};

export type WeeklyCosmicSummary = {
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  dateRangeFormatted: string;
  collectiveTheme: string;
  lunarPhaseSummary: string;
  planetaryMotionSummary: string;
  keyEvents: string[];
  mostActivePersonalTransit: {
    summary: string;
    transitBody: string;
    transitSign: string;
    transitHouse: number;
    natalBody: string;
    natalSign: string;
    natalHouse: number;
    aspectLabel: string;
    orb: number;
    phaseLabel: string;
    exactTimeFormatted?: string;
  } | null;
  activePlacidusHouses: number[];
  top3HighlightedDomains: Array<{
    key: string;
    title: string;
    headline: string;
    intensity: "high" | "medium" | "subtle";
  }>;
  mainSpiritualMessage: string;
};

export type WeeklyGuidance = {
  uid: string;
  timezone: string;
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  guidancePeriodMode: "current" | "upcoming";
  state: Exclude<WeeklyGuidanceState, "loading" | "error">;
  relationshipStatus?: RelationshipStatus;
  availableSources: string[];
  limitedSources: string[];
  unavailableSources: string[];
  cosmicSummary: WeeklyCosmicSummary;
  sections: WeeklyGuidanceSection[];
  weeklyDirection: { title: "Arah Minggu Ini"; paragraphs: string[]; sourceDomains: string[] };
  sourceProvenance: {
    sourceReadingIds: string[];
    sourceDomains: string[];
    contributingSystems: string[];
    timingFactIds: string[];
    journeyFactIds: string[];
  };
  synthesisFingerprint: string;
};
