import { BASELINE_QUESTIONS, WellnessDimension } from "../data/baselineWellnessQuestions";
import { BaselineWellnessProfile } from "../repositories/userRepository";

export function calculateBaselineWellness(uid: string, responses: { questionId: number; score: number }[]): BaselineWellnessProfile {
  const scores: Record<WellnessDimension, number> = {
    BODY: 0,
    EMOTION: 0,
    MIND: 0,
    RELATIONSHIP: 0,
    MEANING: 0,
    REGULATION: 0
  };

  const dimensions: WellnessDimension[] = ["BODY", "EMOTION", "MIND", "RELATIONSHIP", "MEANING", "REGULATION"];

  dimensions.forEach(dim => {
    const dimQuestions = BASELINE_QUESTIONS.filter(q => q.dimension === dim);
    const relevantResponses = responses.filter(r => dimQuestions.some(q => q.id === r.questionId));

    if (relevantResponses.length > 0) {
      const totalRawScore = relevantResponses.reduce((sum, r) => sum + r.score, 0);
      const count = relevantResponses.length;
      const normalizedScore = ((totalRawScore - count) / (count * 4)) * 100;
      scores[dim] = Math.round(Math.max(0, Math.min(100, normalizedScore)));
    }
  });

  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / dimensions.length;

  // Navigator Logic (V1 upgrade test)
  let mode: "RECOVERY" | "REFLECTION" | "GROWTH" = "REFLECTION";

  if (scores.BODY < 35 || scores.EMOTION < 35 || scores.RELATIONSHIP < 30 || avgScore < 40) {
    mode = "RECOVERY";
  } else if (Object.values(scores).every(s => s > 60) && avgScore > 70) {
    mode = "GROWTH";
  }

  // Domain Categorization
  const sortedDomains = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const strongestDomain = sortedDomains[0][0];
  const attentionDomain = sortedDomains[sortedDomains.length - 1][0];
  const growthDomain = sortedDomains.find(d => d[1] > 40 && d[1] < 70)?.[0] || attentionDomain;

  return {
    bodyScore: scores.BODY,
    emotionScore: scores.EMOTION,
    mindScore: scores.MIND,
    relationshipScore: scores.RELATIONSHIP,
    meaningScore: scores.MEANING,
    regulationScore: scores.REGULATION,
    navigatorMode: mode,
    strongestDomain,
    growthDomain,
    attentionDomain,
    completedAt: new Date().toISOString(),
    confidenceLevel: "MEDIUM", // 15 questions give medium confidence
    version: "V3_BASELINE"
  };
}

export const baselineWellnessEngine = {
  calculate: calculateBaselineWellness
};
