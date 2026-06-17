import type { GaiaInsight, GaiaInsightStrength, GaiaTheme } from "./types";

export const GAIA_THEME_WEIGHTS: Record<GaiaTheme, Record<string, number>> = {
  career: { humanDesign: 20, natalChart: 20, destinyMatrix: 15, lifePath: 10, numerology: 10, talents: 10, geneKeys: 5, sacredBusiness: 5, dharmaWork: 5 },
  relationships: { natalChart: 20, destinyMatrix: 15, humanDesign: 15, numerology: 10, innerChild: 15, geneKeys: 10, chakra: 10, elements: 5 },
  talents: { humanDesign: 20, natalChart: 20, destinyMatrix: 15, numerology: 10, lifePath: 10, geneKeys: 10, archetype: 5, elements: 5, talents: 5 },
  energy: { chakra: 25, humanDesign: 25, natalChart: 15, destinyHealth: 10, elements: 10, subtleEnergy: 5, lifePath: 5, numerology: 5 },
  shadow: { destinyMatrix: 20, humanDesign: 15, natalChart: 20, geneKeys: 15, innerChild: 15, lifePath: 5, soulFragment: 5, chakra: 5 },
  spirituality: { natalChart: 20, humanDesign: 15, lifePath: 10, arcana: 10, numerology: 10, geneKeys: 10, destinyMatrix: 10, dharmaPath: 5, sacredBusiness: 5, futureTimeline: 5 },
};

export const SENSITIVE_INSIGHT_IDS = new Set([
  "coreFear", "soulFragment", "selfSabotage", "attachmentPattern", "traumaWound", "karmicWound", "ancestralPattern",
]);

export function strengthFromSourceCount(sourceCount: number): GaiaInsightStrength {
  if (sourceCount >= 6) return "VERY_HIGH";
  if (sourceCount >= 4) return "HIGH";
  if (sourceCount >= 2) return "MEDIUM";
  return "LOW";
}

export function canDisplayGaiaInsight(insight: GaiaInsight): boolean {
  return !insight.meta.sensitive || insight.meta.strength !== "LOW";
}

export function canShareGaiaInsight(insight: GaiaInsight): boolean {
  return insight.meta.publicSafe && !insight.meta.sensitive && insight.meta.strength !== "LOW";
}
