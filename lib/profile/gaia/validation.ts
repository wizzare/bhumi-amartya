import type { GaiaProfile } from "./types";

const VISUAL_INSIGHT_IDS = new Set(["chakraProfile", "elementComposition", "physics"]);

function hasBatchAVisualData(profile: GaiaProfile): boolean {
  const insights = Object.values(profile.sections).flat().filter((insight) => VISUAL_INSIGHT_IDS.has(insight.id));
  if (insights.length !== VISUAL_INSIGHT_IDS.size) return false;
  return insights.every((insight) => insight.dataPoints.some((point) => typeof point.score === "number" && Number.isFinite(point.score)));
}

export function isCompleteGaiaWarehouse(profile?: GaiaProfile | null): profile is GaiaProfile {
  if (!profile) return false;
  const sections = Object.values(profile.sections);
  if (sections.length !== 6 || sections.some((items) => items.length <= 1)) return false;
  const insights = sections.flat();
  const hasLongGuidance = insights.every((insight) => (insight.guidance[0]?.trim().length ?? 0) >= 300);
  const hasSectionVoice = insights.every((insight) => !insight.guidance[0]?.includes("Arah ini bukan tuntutan untuk segera berubah"));
  const hasStructuredDisplay = insights.every((insight) => Array.isArray(insight.dataPoints) && typeof insight.effect === "string");
  return hasLongGuidance && hasSectionVoice && hasStructuredDisplay && hasBatchAVisualData(profile);
}
