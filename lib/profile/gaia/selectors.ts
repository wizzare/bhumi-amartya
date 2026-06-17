import { canDisplayGaiaInsight, canShareGaiaInsight } from "./policy";
import type { GaiaInsight, GaiaProfile, GaiaTheme } from "./types";

export function getVisibleGaiaInsights(profile: GaiaProfile, theme: GaiaTheme): GaiaInsight[] {
  return profile.sections[theme].filter(canDisplayGaiaInsight);
}

export function getShareSafeGaiaInsights(profile: GaiaProfile): GaiaInsight[] {
  return Object.values(profile.sections).flat().filter(canShareGaiaInsight).sort((a, b) => b.meta.confidence - a.meta.confidence);
}

export function getGaiaEngineContext(profile: GaiaProfile) {
  return Object.fromEntries(Object.entries(profile.sections).map(([theme, insights]) => [theme, insights.map(({ id, narrative, dataPoints, effect, guidance, signals, meta }) => ({ id, narrative, dataPoints, effect, guidance, signals, confidence: meta.confidence, strength: meta.strength }))]));
}
