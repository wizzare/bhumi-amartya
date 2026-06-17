import { WellnessMapping, WellnessCategory, ConfidenceLevel } from "./wellnessMappingEngine";
import { SupportResource, INTERNAL_RESOURCES, EXTERNAL_RESOURCES } from "../data/supportResourceLibrary";

export type SupportLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface SupportPathRecommendation {
  level: SupportLevel;
  label: { id: string; en: string };
  confidence: ConfidenceLevel;
  why: { id: string; en: string };
  resources: SupportResource[];
}

export interface SupportEngineState {
  primary: SupportPathRecommendation;
  secondary?: SupportPathRecommendation;
  calculatedAt: string;
}

const LEVEL_LABELS: Record<SupportLevel, { id: string; en: string }> = {
  1: { id: "Dukungan Mandiri", en: "Self Support" },
  2: { id: "Pendampingan Pengembangan Diri", en: "Guided Personal Development" },
  3: { id: "Dukungan Profesional", en: "Professional Support" },
  4: { id: "Layanan Publik", en: "Public Service Support" },
  5: { id: "Safety Observation", en: "Safety Observation" },
  6: { id: "Jalur Aman (Dukungan Tambahan)", en: "Safety Path (Extra Support)" }
};

export function calculateSupportPath(mapping: WellnessMapping): SupportEngineState {
  const topTheme = mapping.results[0]?.category || "GROWTH_PHASE";
  const { body, emotion, meaning } = mapping.drivers.dimensions;
  const confidence = mapping.confidence.level;

  let primaryLevel: SupportLevel = 1;
  let secondaryLevel: SupportLevel | undefined;

  // ESCALATION RULES
  // Rule: Extreme intensity (Acute Collapse) -> Jalur Aman
  if (body < 15 || emotion < 15 || meaning < 15) {
    primaryLevel = 6;
    secondaryLevel = 3;
  }
  // Rule: Low dimension intensity -> Professional / Public
  else if (body < 25 || emotion < 25 || meaning < 25) {
    primaryLevel = 3;
    secondaryLevel = 4;
  } else {
    // Theme based mapping
    switch (topTheme) {
      case "LIFE_CRISIS":
      case "SPIRITUAL_CRISIS":
        primaryLevel = 2;
        secondaryLevel = 3;
        break;
      case "BURNOUT":
      case "ANXIETY":
      case "MEANING_CRISIS":
      case "LONELINESS":
      case "LOSS_AND_GRIEF":
        primaryLevel = 1;
        secondaryLevel = 2;
        break;
      default:
        primaryLevel = 1;
        secondaryLevel = undefined;
    }
  }

  const getResources = (level: SupportLevel): SupportResource[] => {
    if (level === 1) return INTERNAL_RESOURCES;
    return EXTERNAL_RESOURCES.filter(r => r.level === level);
  };

  const getWhy = (level: SupportLevel, theme: WellnessCategory): { id: string; en: string } => {
    if (level === 1) {
      return {
        id: "Berdasarkan pola yang terdeteksi, langkah mandiri masih menjadi pendekatan yang paling sesuai saat ini.",
        en: "Based on the detected pattern, self-directed steps are still the most appropriate approach right now."
      };
    }
    if (level === 2) {
      return {
        id: "Kamu mungkin terbantu dengan pendampingan dari praktisi pengembangan diri untuk memproses fase ini.",
        en: "You might benefit from guidance from a personal development practitioner to process this phase."
      };
    }
    if (level === 3 || level === 4) {
      return {
        id: "Intensitas pola batinmu menyarankan perlunya perspektif dari tenaga profesional atau layanan kesehatan.",
        en: "The intensity of your inner pattern suggests the need for perspective from a professional or health service."
      };
    }
    if (level >= 5) {
      return {
        id: "Kami melihat beberapa sinyal yang menunjukkan bahwa kamu mungkin membutuhkan dukungan tambahan saat ini.",
        en: "We see signals indicating you might need extra support right now."
      };
    }
    return { id: "", en: "" };
  };

  const primary: SupportPathRecommendation = {
    level: primaryLevel,
    label: LEVEL_LABELS[primaryLevel],
    confidence,
    why: getWhy(primaryLevel, topTheme),
    resources: getResources(primaryLevel)
  };

  let secondary: SupportPathRecommendation | undefined;
  if (secondaryLevel) {
    secondary = {
      level: secondaryLevel,
      label: LEVEL_LABELS[secondaryLevel],
      confidence,
      why: getWhy(secondaryLevel, topTheme),
      resources: getResources(secondaryLevel)
    };
  }

  return {
    primary,
    secondary,
    calculatedAt: new Date().toISOString()
  };
}

export const wellnessSupportEngine = {
  calculateSupportPath,
};
