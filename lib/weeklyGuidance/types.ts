export type WeeklyGuidanceState = "loading" | "ready" | "limited" | "unavailable" | "error";

export type WeeklyGuidanceSection = {
  key: string;
  title: string;
  phases: { awalPekan: string[]; tengahPekan: string[]; akhirPekan: string[] };
  advice: string[];
  paragraphs: string[];
  sourceDomains: string[];
  timingEvidence?: string[];
};

export type WeeklyGuidance = {
  uid: string;
  timezone: string;
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  guidancePeriodMode: "current" | "upcoming";
  state: Exclude<WeeklyGuidanceState, "loading" | "error">;
  availableSources: string[];
  limitedSources: string[];
  unavailableSources: string[];
  sections: WeeklyGuidanceSection[];
  weeklyDirection: { title: "Arah Minggu Ini"; paragraphs: string[]; sourceDomains: string[] };
  sourceProvenance: { sourceReadingIds: string[]; sourceDomains: string[]; contributingSystems: string[]; timingFactIds: string[]; journeyFactIds: string[] };
  synthesisFingerprint: string;
};
