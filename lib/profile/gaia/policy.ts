import type { GaiaInsight, GaiaInsightStrength, GaiaTheme } from "./types";

export const GAIA_THEME_WEIGHTS: Record<GaiaTheme, Record<string, number>> = {
  career: { humanDesign: 18, natalChart: 16, destinyMatrix: 14, lifePath: 8, numerology: 8, vedic: 8, tzolkin: 8, weton: 6, bazi: 8, talents: 6 },
  relationships: { natalChart: 18, destinyMatrix: 14, humanDesign: 14, numerology: 8, innerChild: 10, vedic: 8, tzolkin: 8, weton: 6, bazi: 6, chakra: 4, elements: 4 },
  talents: { humanDesign: 16, natalChart: 16, destinyMatrix: 14, numerology: 8, lifePath: 8, vedic: 8, tzolkin: 8, weton: 6, bazi: 6, archetype: 5, elements: 5 },
  energy: { chakra: 20, humanDesign: 20, natalChart: 14, destinyMatrix: 10, destinyHealth: 8, elements: 8, bazi: 8, tzolkin: 5, weton: 4, lifePath: 3, numerology: 3 },
  shadow: { destinyMatrix: 18, humanDesign: 14, natalChart: 18, innerChild: 12, lifePath: 5, vedic: 8, tzolkin: 8, weton: 6, bazi: 6, chakra: 5 },
  spirituality: { natalChart: 16, humanDesign: 12, lifePath: 8, arcana: 8, numerology: 8, destinyMatrix: 10, vedic: 12, tzolkin: 12, weton: 6, bazi: 8 },
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
