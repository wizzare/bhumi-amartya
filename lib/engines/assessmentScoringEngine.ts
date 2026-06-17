import { WELLNESS_QUESTIONS, WellnessDimension, WellnessQuestion } from "@/lib/data/wellnessQuestions";

export interface DimensionResult {
  score: number;
  label: string;
}

export interface AssessmentResult {
  body: DimensionResult;
  emotion: DimensionResult;
  relationship: DimensionResult;
  meaning: DimensionResult;
  spirituality: DimensionResult;
}

export const ASSESSMENT_LABELS = [
  { min: 0, max: 20, label: "Sangat Perlu Perhatian" },
  { min: 21, max: 40, label: "Perlu Perhatian" },
  { min: 41, max: 60, label: "Cukup" },
  { min: 61, max: 80, label: "Baik" },
  { min: 81, max: 100, label: "Sangat Baik" },
];

export function getLabelForScore(score: number): string {
  const roundedScore = Math.round(score);
  return ASSESSMENT_LABELS.find(l => roundedScore >= l.min && roundedScore <= l.max)?.label || "Cukup";
}

export function calculateDimensionScore(responses: { questionId: number; score: number }[], dimension: WellnessDimension): DimensionResult {
  const dimensionQuestions = WELLNESS_QUESTIONS.filter(q => q.dimension === dimension);
  const relevantResponses = responses.filter(r => dimensionQuestions.some(q => q.id === r.questionId));

  if (relevantResponses.length === 0) return { score: 0, label: "Data tidak tersedia" };

  const totalRawScore = relevantResponses.reduce((sum, r) => sum + r.score, 0);
  const count = relevantResponses.length;

  // Formula: ((Sum - Count) / (Count * 4)) * 100
  const normalizedScore = ((totalRawScore - count) / (count * 4)) * 100;
  const finalScore = Math.max(0, Math.min(100, normalizedScore));

  return {
    score: Math.round(finalScore),
    label: getLabelForScore(finalScore)
  };
}

export function processAssessmentResults(responses: { questionId: number; score: number }[]): AssessmentResult {
  return {
    body: calculateDimensionScore(responses, "BODY"),
    emotion: calculateDimensionScore(responses, "EMOTION"),
    relationship: calculateDimensionScore(responses, "RELATIONSHIP"),
    meaning: calculateDimensionScore(responses, "MEANING"),
    spirituality: calculateDimensionScore(responses, "SPIRITUALITY"),
  };
}

export function getRandomAssessmentQuestions(type: "daily" | "weekly" | "monthly"): WellnessQuestion[] {
  if (type === "monthly") return WELLNESS_QUESTIONS;

  const dimensions: WellnessDimension[] = ["BODY", "EMOTION", "RELATIONSHIP", "MEANING", "SPIRITUALITY"];
  const selected: WellnessQuestion[] = [];
  const countPerDim = type === "daily" ? 1 : 3;

  dimensions.forEach(dim => {
    const dimQuestions = WELLNESS_QUESTIONS.filter(q => q.dimension === dim);
    const shuffled = [...dimQuestions].sort(() => 0.5 - Math.random());
    selected.push(...shuffled.slice(0, countPerDim));
  });

  return selected;
}
