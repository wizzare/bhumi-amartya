import { dailyStateRepository, type DailyState } from "@/lib/repositories/dailyStateRepository";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import { behaviorMemoryRepository } from "@/lib/repositories/behaviorMemoryRepository";
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
  if (!input.uid) {
    throw new Error("User ID is required to log Section 4 practice.");
  }
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
    const existingJourneyRecord = await journeyRepository.getDailyRecord(input.uid, input.dateKey).catch(() => null);
    const existingWellnessV4 = (existingJourneyRecord?.wellnessState?.wellnessV4 || {}) as Record<string, unknown>;
    const existingPractices = Array.isArray(existingWellnessV4.practices) ? existingWellnessV4.practices : [];
    const practiceMemory = {
      practiceId: input.practiceId,
      practiceType: input.practiceType,
      practiceTitle: input.practiceTitle,
      opened: true,
      started: true,
      completed: true,
      skipped: false,
      contextualRelevance: null,
      highlighted: null,
      completedAt,
      factualResult: input.reflectionResult || input.reflectionResponse || null,
    };
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
      wellnessState: {
        ...(existingJourneyRecord?.wellnessState || {}),
        wellnessV4: {
          ...existingWellnessV4,
          practices: [...existingPractices.filter((entry: any) => entry?.practiceId !== input.practiceId), practiceMemory],
          updatedAt: completedAt,
        },
      },
      sourceConfidence: 1,
    });
    appendMoanaRuntimeDiagnostic("section4_journey_record_write_success", {
      path: journeyRecordPath,
      practiceType: input.practiceType,
    });

    // Journey's innerworkCompletion is the single canonical factual event.
    // Do not append the same completion again to practiceResults.
    const stateForMemory = await dailyStateRepository.getDailyState(input.uid, input.dateKey).catch(() => null);
    await behaviorMemoryRepository.recordCompleted(
      input.uid,
      input.practiceId,
      durationMinutes,
      stateForMemory?.wellnessSnapshot?.metrics.energy ?? 5,
      stateForMemory?.wellnessSnapshot?.lifeSituation ?? [],
      input.dateKey,
    ).catch((error) => {
      appendMoanaRuntimeDiagnostic("section4_behavior_memory_write_failure", { error: toDiagnosticError(error), practiceId: input.practiceId });
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

export function formatSection4SaveError(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return String(error);
  }

  const record = error as {
    code?: unknown;
    message?: unknown;
    firestoreDebug?: {
      operation?: string;
      path?: string;
      authUid?: string | null;
      code?: string;
      message?: string;
    };
  };
  const debug = record.firestoreDebug;
  const code = typeof record.code === "string" ? record.code : debug?.code;
  const message = typeof record.message === "string" ? record.message : debug?.message;
  const details = [
    code ? `code=${code}` : null,
    debug?.operation ? `operation=${debug.operation}` : null,
    debug?.path ? `path=${debug.path}` : null,
    debug ? `authUid=${debug.authUid ?? "null"}` : null,
    message ? `message=${message}` : null,
  ].filter(Boolean);

  return details.length > 0 ? details.join(" | ") : String(error);
}
