import { dailyStateRepository, type DailyState } from "@/lib/repositories/dailyStateRepository";
import { journeyRepository } from "@/lib/repositories/journeyRepository";

type WellnessSection4PracticeType =
  | "journaling"
  | "meditation"
  | "yoga"
  | "workout"
  | "audioHealing"
  | "healthyFood"
  | "manifestation";

type LogWellnessSection4PracticeInput = {
  uid: string;
  dateKey: string;
  practiceId: string;
  practiceType: WellnessSection4PracticeType;
  practiceTitle: string;
  durationMinutes?: number;
  dailyStatePatch?: Partial<Omit<DailyState, "uid" | "date" | "updatedAt">>;
  reflectionResult?: string;
  reflectionResponse?: string;
};

const dailyStateFlagByType: Record<WellnessSection4PracticeType, keyof DailyState> = {
  journaling: "journalingDone",
  meditation: "meditationDone",
  yoga: "yogaDone",
  workout: "workoutDone",
  audioHealing: "audioHealingDone",
  healthyFood: "herbalDone",
  manifestation: "manifestDone",
};

export async function logWellnessSection4Practice(input: LogWellnessSection4PracticeInput): Promise<void> {
  const completedAt = new Date().toISOString();
  const durationMinutes = input.durationMinutes ?? 10;
  const flag = dailyStateFlagByType[input.practiceType];

  await dailyStateRepository.saveDailyState(input.uid, input.dateKey, {
    [flag]: true,
    ...input.dailyStatePatch,
  });

  await journeyRepository.updateDailyRecord(input.uid, input.dateKey, {
    dominantIssue: "wellness_section_4",
    issueCategory: input.practiceType,
    innerworkRecommendation: {
      practiceId: input.practiceId,
      practiceType: input.practiceType,
      practiceTitle: input.practiceTitle,
      durationMinutes,
      intensity: "self_guided",
      reason: "Praktik dipilih dari Wellness Section 4.",
      sourceSignals: ["wellness_section_4", `practice:${input.practiceType}`],
    },
    innerworkCompletion: {
      completed: true,
      skipped: false,
      completedAt,
      actualPracticeId: input.practiceId,
      actualPracticeType: input.practiceType,
      actualDuration: durationMinutes,
      reflectionResult: input.reflectionResult,
      reflectionResponse: input.reflectionResponse,
      practiceHelped: input.reflectionResult
        ? /lebih tenang|lebih ringan|lega|berenergi/i.test(input.reflectionResult)
        : null,
      userFelt: input.reflectionResult,
    },
    sourceConfidence: 1,
  });

  await journeyRepository.appendPracticeResult(input.uid, input.dateKey, {
    zone: "B",
    issue: "wellness_section_4",
    issueCategory: input.practiceType,
    practiceId: input.practiceId,
    practiceCategory: input.practiceType,
    practiceTitle: input.practiceTitle,
    durationMinutes,
    completedAt,
    source: "wellness_section_4",
    reflectionResult: input.reflectionResult,
    reflectionResponse: input.reflectionResponse,
    practiceHelped: input.reflectionResult
      ? /lebih tenang|lebih ringan|lega|berenergi/i.test(input.reflectionResult)
      : null,
  });
}
