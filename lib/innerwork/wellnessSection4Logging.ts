import { dailyStateRepository, type DailyState } from "@/lib/repositories/dailyStateRepository";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import { getCompletionSummary } from "@/lib/engines/completionEngine";
import { appendMoanaRuntimeDiagnostic, toDiagnosticError } from "@/lib/innerwork/moanaRuntimeDiagnostics";

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
  const dailyStatePath = `dailyStates/${input.uid}/entries/${input.dateKey}`;
  const journeyRecordPath = `journeyDailyRecords/${input.uid}/entries/${input.dateKey}`;
  const dailyStatePayload = {
    [flag]: true,
    ...input.dailyStatePatch,
  };
  const journeyRecordPayload = {
    userId: input.uid,
    dateKey: input.dateKey,
    practiceType: input.practiceType,
    practiceTitle: input.practiceTitle,
    source: "wellness_section_4",
    completedAt,
  };
  const practiceResultPayload = {
    zone: "B" as const,
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
  };

  appendMoanaRuntimeDiagnostic("section4_save_helper_entered", {
    userId: input.uid || null,
    dateKey: input.dateKey,
    practiceId: input.practiceId,
    practiceType: input.practiceType,
    practiceTitle: input.practiceTitle,
    dailyStateFlag: flag,
    dailyStatePath,
    journeyRecordPath,
    minimumPayload: journeyRecordPayload,
  });

  try {
    appendMoanaRuntimeDiagnostic("section4_daily_state_write_attempt", {
      path: dailyStatePath,
      payload: dailyStatePayload,
    });
    await dailyStateRepository.saveDailyState(input.uid, input.dateKey, dailyStatePayload);
    appendMoanaRuntimeDiagnostic("section4_daily_state_write_success", {
      path: dailyStatePath,
      practiceType: input.practiceType,
    });

    appendMoanaRuntimeDiagnostic("section4_journey_record_write_attempt", {
      path: journeyRecordPath,
      payload: journeyRecordPayload,
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
        practiceHelped: practiceResultPayload.practiceHelped,
        userFelt: input.reflectionResult,
      },
      sourceConfidence: 1,
    });
    appendMoanaRuntimeDiagnostic("section4_journey_record_write_success", {
      path: journeyRecordPath,
      practiceType: input.practiceType,
    });

    appendMoanaRuntimeDiagnostic("section4_practice_result_append_attempt", {
      path: `${journeyRecordPath}.practiceResults`,
      payload: practiceResultPayload,
    });
    await journeyRepository.appendPracticeResult(input.uid, input.dateKey, practiceResultPayload);
    appendMoanaRuntimeDiagnostic("section4_practice_result_append_success", {
      path: `${journeyRecordPath}.practiceResults`,
      practiceType: input.practiceType,
    });

    const [dailyStateReadback, journeyRecordReadback] = await Promise.all([
      dailyStateRepository.getDailyState(input.uid, input.dateKey).catch((error) => {
        appendMoanaRuntimeDiagnostic("section4_daily_state_readback_failure", {
          path: dailyStatePath,
          error: toDiagnosticError(error),
        });
        return null;
      }),
      journeyRepository.getDailyRecord(input.uid, input.dateKey).catch((error) => {
        appendMoanaRuntimeDiagnostic("section4_journey_record_readback_failure", {
          path: journeyRecordPath,
          error: toDiagnosticError(error),
        });
        return null;
      }),
    ]);

    appendMoanaRuntimeDiagnostic("section4_post_save_readback", {
      dailyStatePath,
      journeyRecordPath,
      dailyStateExists: Boolean(dailyStateReadback),
      journeyRecordExists: Boolean(journeyRecordReadback),
      progressCount: getCompletionSummary(dailyStateReadback).count,
      progressTotal: getCompletionSummary(dailyStateReadback).total,
      dailyStateFlags: dailyStateReadback ? {
        journalingDone: Boolean(dailyStateReadback.journalingDone),
        meditationDone: Boolean(dailyStateReadback.meditationDone),
        yogaDone: Boolean(dailyStateReadback.yogaDone),
        workoutDone: Boolean(dailyStateReadback.workoutDone),
        audioHealingDone: Boolean(dailyStateReadback.audioHealingDone),
        herbalDone: Boolean(dailyStateReadback.herbalDone),
        manifestDone: Boolean(dailyStateReadback.manifestDone),
      } : null,
      journeyPracticeTypes: journeyRecordReadback?.practiceResults?.map((result) => result.practiceCategory) ?? [],
      journeyInnerworkType: journeyRecordReadback?.innerworkCompletion?.actualPracticeType ?? null,
    });
  } catch (error) {
    appendMoanaRuntimeDiagnostic("section4_save_failure", {
      userId: input.uid || null,
      dateKey: input.dateKey,
      practiceType: input.practiceType,
      practiceTitle: input.practiceTitle,
      dailyStatePath,
      journeyRecordPath,
      error: toDiagnosticError(error),
    });
    throw error;
  }
}
