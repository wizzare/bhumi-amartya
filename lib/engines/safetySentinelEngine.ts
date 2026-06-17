import { WellnessMapping, WellnessCategory } from "./wellnessMappingEngine";
import { WellnessSnapshot } from "@/lib/data/types";
import { SupportLevel } from "./wellnessSupportEngine";

export type SafetyTrigger =
  | "ACUTE_COLLAPSE"
  | "PERSISTENT_DISTRESS"
  | "DIRECT_DISTRESS"
  | "PATTERN_ALARM";

export interface SafetyIncident {
  trigger: SafetyTrigger;
  level: SupportLevel;
  timestamp: string;
  active: boolean;
}

export interface SafetyState {
  isSafetyMode: boolean;
  incidents: SafetyIncident[];
  recommendedLevel: SupportLevel;
}

export function evaluateSafetyTriggers(
  mapping: WellnessMapping,
  checkIns: WellnessSnapshot[] = []
): SafetyState {
  const { body, emotion, meaning } = mapping.drivers.dimensions;
  const topTheme = mapping.results[0]?.category;

  const incidents: SafetyIncident[] = [];
  let maxLevel: SupportLevel = 1;

  // 1. ACUTE_COLLAPSE
  if (body < 15 || emotion < 15 || meaning < 15 || (body + emotion + meaning) < 60) {
    incidents.push({
      trigger: "ACUTE_COLLAPSE",
      level: 6,
      timestamp: new Date().toISOString(),
      active: true
    });
    maxLevel = 6;
  }

  // 2. DIRECT_DISTRESS (HEALING + Emotion < 2 + Energy < 2 for 3 days)
  if (checkIns.length >= 3) {
    const last3 = checkIns.slice(-3);
    const isDirectDistress = last3.every(c =>
      c.needs.includes("HEALING") && c.metrics.emotion <= 2 && c.metrics.energy <= 2
    );
    if (isDirectDistress) {
      incidents.push({
        trigger: "DIRECT_DISTRESS",
        level: 5,
        timestamp: new Date().toISOString(),
        active: true
      });
      maxLevel = Math.max(maxLevel, 5) as SupportLevel;
    }
  }

  // 3. PERSISTENT_DISTRESS (Emotion < 2 for 3 days)
  if (checkIns.length >= 3) {
     const last3 = checkIns.slice(-3);
     if (last3.every(c => c.metrics.emotion <= 2)) {
        incidents.push({
          trigger: "PERSISTENT_DISTRESS",
          level: 5,
          timestamp: new Date().toISOString(),
          active: true
        });
        maxLevel = Math.max(maxLevel, 5) as SupportLevel;
     }
  }

  return {
    isSafetyMode: incidents.length > 0,
    incidents,
    recommendedLevel: maxLevel
  };
}
