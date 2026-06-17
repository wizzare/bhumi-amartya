import { AssessmentResult, processAssessmentResults } from "./assessmentScoringEngine";
import { WellnessDimension } from "@/lib/data/wellnessQuestions";
import { WellnessSnapshot, WellnessNeed } from "@/lib/data/types";

export type WellnessCategory =
  | "GROWTH_PHASE"
  | "BURNOUT"
  | "LIFE_TRANSITION"
  | "LIFE_CRISIS"
  | "LOSS_AND_GRIEF"
  | "ANXIETY"
  | "LONELINESS"
  | "MEANING_CRISIS"
  | "SPIRITUAL_AWAKENING"
  | "SPIRITUAL_CRISIS";

export interface MappingResult {
  category: WellnessCategory;
  label: string;
  probability: number;
  explanation: string;
}

export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

export interface WellnessMapping {
  assessment: AssessmentResult;
  results: MappingResult[];
  confidence: {
    level: ConfidenceLevel;
    score: number;
    reason: string;
  };
  drivers: {
    dimensions: Record<string, number>;
    boosters: string[];
  };
  calculatedAt: string;
}

const CATEGORY_METADATA: Record<WellnessCategory, { label: string; explanation: string }> = {
  GROWTH_PHASE: {
    label: "Fase Pertumbuhan",
    explanation: "Seluruh dimensimu berada dalam kondisi yang stabil dan mendukung ekspansi dirimu."
  },
  BURNOUT: {
    label: "Burnout",
    explanation: "Terlihat adanya penurunan signifikan pada energi fisik dan cadangan emosionalmu."
  },
  LIFE_TRANSITION: {
    label: "Transisi Hidup",
    explanation: "Kamu sedang berada dalam fase perubahan atau babak baru yang membutuhkan penyesuaian internal."
  },
  LIFE_CRISIS: {
    label: "Krisis Hidup",
    explanation: "Beberapa aspek mendasar dalam hidupmu sedang mengalami tantangan yang membutuhkan perhatian ekstra."
  },
  LOSS_AND_GRIEF: {
    label: "Kehilangan & Duka",
    explanation: "Data menunjukkan intensitas emosional yang tinggi berkaitan dengan proses pelepasan atau kehilangan."
  },
  ANXIETY: {
    label: "Kecemasan",
    explanation: "Terdapat pola ketegangan dan kebutuhan akan rasa aman yang lebih tinggi dari biasanya."
  },
  LONELINESS: {
    label: "Kesepian",
    explanation: "Dimensi relasi menunjukkan kebutuhan akan koneksi dan dukungan sosial yang lebih mendalam."
  },
  MEANING_CRISIS: {
    label: "Krisis Makna",
    explanation: "Meskipun aspek lain stabil, kamu sedang mencari arti dan tujuan yang lebih dalam dari aktivitasmu."
  },
  SPIRITUAL_AWAKENING: {
    label: "Spiritual Awakening",
    explanation: "Terjadi pergeseran kesadaran yang mendalam, seringkali beriringan dengan fase transisi hidup."
  },
  SPIRITUAL_CRISIS: {
    label: "Tantangan Spiritual",
    explanation: "Proses pencarian makna atau pengalaman batinmu sedang berada di titik yang mendesak dan membingungkan."
  }
};

export function calculateWellnessMapping(
  assessment: AssessmentResult,
  checkIns: WellnessSnapshot[] = []
): WellnessMapping {
  const { body, emotion, relationship, meaning, spirituality } = assessment;

  // 1. Determine Confidence
  const checkInCount = checkIns.length;
  let confidenceLevel: ConfidenceLevel = "LOW";
  let confidenceScore = 30;
  let confidenceReason = "Data awal (Assessment)";

  if (checkInCount >= 7) {
    confidenceLevel = "HIGH";
    confidenceScore = 95;
    confidenceReason = "Data konsisten (Assessment + 7 Check-in)";
  } else if (checkInCount >= 3) {
    confidenceLevel = "MEDIUM";
    confidenceScore = 65;
    confidenceReason = "Data moderat (Assessment + 3 Check-in)";
  }

  // 2. Identify Signal Boosters from Check-ins
  const boosters: string[] = [];
  const needs = new Set<WellnessNeed>();
  let lowEnergyCount = 0;
  let lowSleepCount = 0;
  let highFocusCount = 0;

  checkIns.forEach(c => {
    c.needs.forEach(n => needs.add(n));
    if (c.metrics.energy < 4) lowEnergyCount++;
    if (c.metrics.sleep < 4) lowSleepCount++;
    if (c.metrics.focus > 7) highFocusCount++;
  });

  if (needs.has("PEACE")) boosters.push("Need: PEACE");
  if (needs.has("CLARITY")) boosters.push("Need: CLARITY");
  if (needs.has("HEALING")) boosters.push("Need: HEALING");
  if (lowEnergyCount >= 2) boosters.push("Low Energy Pattern");
  if (lowSleepCount >= 2) boosters.push("Low Sleep Pattern");

  // 3. Raw Theme Scoring (0-100)
  const scores: Record<WellnessCategory, number> = {
    GROWTH_PHASE: 0,
    BURNOUT: 0,
    LIFE_TRANSITION: 0,
    LIFE_CRISIS: 0,
    LOSS_AND_GRIEF: 0,
    ANXIETY: 0,
    LONELINESS: 0,
    MEANING_CRISIS: 0,
    SPIRITUAL_AWAKENING: 0,
    SPIRITUAL_CRISIS: 0
  };

  // Base Logic for each category
  scores.BURNOUT = (100 - body.score) * 0.6 + (100 - emotion.score) * 0.4;
  scores.ANXIETY = (100 - emotion.score) * 0.7 + (100 - body.score) * 0.3;
  scores.LONELINESS = (100 - relationship.score) * 0.8 + (100 - emotion.score) * 0.2;
  scores.MEANING_CRISIS = (100 - meaning.score) * 0.7 + (100 - spirituality.score) * 0.3;
  scores.LIFE_TRANSITION = (100 - emotion.score) * 0.5 + (meaning.score > 60 ? 30 : 0);
  scores.LOSS_AND_GRIEF = (100 - emotion.score) * 0.8 + (100 - body.score) * 0.2;
  scores.LIFE_CRISIS = (100 - meaning.score) * 0.4 + (100 - body.score) * 0.3 + (100 - relationship.score) * 0.3;
  scores.SPIRITUAL_CRISIS = (spirituality.score > 70 ? 40 : 0) + (100 - meaning.score) * 0.4 + (100 - emotion.score) * 0.2;

  // Special Rule: Growth Phase
  if (body.score >= 60 && emotion.score >= 60 && relationship.score >= 60 && meaning.score >= 60 && spirituality.score >= 60) {
    const highDimCount = [body.score, emotion.score, relationship.score, meaning.score, spirituality.score].filter(s => s >= 80).length;
    if (highDimCount >= 3) {
       scores.GROWTH_PHASE = 80 + (highDimCount * 4);
    }
  }

  // 4. Applying Boosters
  if (needs.has("HEALING")) scores.LOSS_AND_GRIEF += 15;
  if (needs.has("CLARITY")) scores.LIFE_TRANSITION += 15;
  if (needs.has("PEACE")) scores.ANXIETY += 15;
  if (lowEnergyCount >= 2) scores.BURNOUT += 15;

  // 5. Conflict Resolution & Filters
  // Awakening Filter: Transition must be significant
  const transitionProb = scores.LIFE_TRANSITION;
  if (spirituality.score > 80 && meaning.score > 70 && transitionProb > 40) {
    scores.SPIRITUAL_AWAKENING = (spirituality.score * 0.5) + (meaning.score * 0.3) + (transitionProb * 0.2);
  } else {
    scores.SPIRITUAL_AWAKENING = 0;
  }

  // Growth Phase Protection
  if (scores.GROWTH_PHASE > 75) {
    Object.keys(scores).forEach(k => {
      const cat = k as WellnessCategory;
      if (cat !== "GROWTH_PHASE" && cat !== "SPIRITUAL_AWAKENING" && cat !== "LIFE_TRANSITION") {
        scores[cat] *= 0.5;
      }
    });
  }

  // 6. Normalization into Results
  const sortedResults = Object.entries(scores)
    .filter(([_, score]) => score > 10)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const totalRaw = sortedResults.reduce((sum, r) => sum + r[1], 0);

  const mappingResults: MappingResult[] = sortedResults.map(([key, score]) => {
    const cat = key as WellnessCategory;
    return {
      category: cat,
      label: CATEGORY_METADATA[cat].label,
      probability: Math.round((score / totalRaw) * 100),
      explanation: CATEGORY_METADATA[cat].explanation
    };
  });

  return {
    assessment,
    results: mappingResults,
    confidence: {
      level: confidenceLevel,
      score: confidenceScore,
      reason: confidenceReason
    },
    drivers: {
      dimensions: {
        body: body.score,
        emotion: emotion.score,
        relationship: relationship.score,
        meaning: meaning.score,
        spirituality: spirituality.score
      },
      boosters
    },
    calculatedAt: new Date().toISOString()
  };
}

export const wellnessMappingEngine = {
  calculateMapping: (
    _uid: string,
    input: Array<{ questionId: number; dimension: WellnessDimension; score: number }>,
  ): WellnessMapping => {
     const assessment = processAssessmentResults(input);
     return calculateWellnessMapping(assessment, []);
  }
};
