import { MemoryContext } from "./types";
import { IdentitySnapshot } from "../ai/types";
import { journalRepository } from "../repositories/journalRepository";
import { journeyRepository } from "../repositories/journeyRepository";
import { reflectionRepository } from "../repositories/reflectionRepository";
import { activityRepository } from "../repositories/activityRepository";
import { dailyStateRepository } from "../repositories/dailyStateRepository";
import { wellnessAssessmentRepository } from "../repositories/wellnessAssessmentRepository";
import { emotionalMemoryRepository } from "../repositories/emotionalMemoryRepository";
import { dailyGuidanceRepository } from "../repositories/dailyGuidanceRepository";
import { meditationRepository } from "../repositories/meditationRepository";
import { audioHealingRepository } from "../repositories/audioHealingRepository";

export interface MemoryCompilerOptions {
  windowDays?: number; // Configurable window (default 30)
  useCache?: boolean;  // Hook for future caching implementations
}

export class MemoryCompiler {
  public static async compile(
    uid: string,
    dateKey: string,
    identity: IdentitySnapshot,
    options?: MemoryCompilerOptions
  ): Promise<MemoryContext> {
    console.log(`[MEMORY_COMPILER] Compiling Living Memory Context for user: ${uid}, date: ${dateKey}`);

    const windowDays = options?.windowDays || 30;

    const safeFetch = async <R>(promise: Promise<R>, fallback: R): Promise<R> => {
      try {
        return await promise;
      } catch (err: any) {
        console.error("[MEMORY_COMPILER_FETCH_ERROR]", err.message || err);
        return fallback;
      }
    };

    // Concurrently fetch all repositories to avoid sequential Firestore latency
    const [
      dailyMemory,
      emotionalMemory,
      journalEntries,
      todayState,
      recentStates,
      recentActivities,
      latestAssessment,
      recentGuidance,
      reflectionHistory,
      meditations,
      audioHealings
    ] = await Promise.all([
      safeFetch(journeyRepository.getDailyMemory(uid), {
        yesterday: null,
        last7Days: [],
        last30Days: [],
      }),
      safeFetch(emotionalMemoryRepository.getOrCreate(uid), {
        userId: uid,
        timeframe: "weekly" as const,
        emotionalTrends: [],
        recurringThemes: [],
        recurringWounds: [],
        emotionalCycles: [],
        healingMilestones: [],
        healingActions: [],
        suggestedFocus: "",
        abandonedPatterns: [],
        nextHealingEdge: "",
      }),
      safeFetch(journalRepository.getJournalEntries(uid, windowDays), []),
      safeFetch(dailyStateRepository.getDailyState(uid, dateKey), null),
      safeFetch(journeyRepository.getRecentDailyStates(uid, windowDays), []),
      safeFetch(activityRepository.getRecentActivities(uid, 10), []),
      safeFetch(wellnessAssessmentRepository.getLatestAssessment(uid), null),
      safeFetch(dailyGuidanceRepository.getRecentGuidance(uid, 5), []),
      safeFetch(reflectionRepository.getRecentWeeklyReflections(uid, 4), []),
      safeFetch(meditationRepository.getMeditationEntries(uid, windowDays), []),
      safeFetch(audioHealingRepository.getAudioHealingEntries(uid, windowDays), []),
    ]);

    // Narrative continuity matching
    const prevGuidance = recentGuidance.find((g: any) => g.date < dateKey) || null;

    const previousReflection = prevGuidance?.soulReflectionText || 
      (prevGuidance as any)?.soulReflection?.dailyMessage || "";
    const previousDailyNote = prevGuidance?.dailyNoteText || 
      (prevGuidance as any)?.companionReflection?.preview || "";
    const previousJourney = dailyMemory.yesterday?.catatanSummary || "";

    // Safely cast summary types
    const journeyNarrative = typeof dailyMemory.growthNarrative === "string"
      ? dailyMemory.growthNarrative
      : (dailyMemory.growthNarrative as any)?.narrative || "";
    const weeklyLearning = typeof dailyMemory.weeklyLearning === "string"
      ? dailyMemory.weeklyLearning
      : (dailyMemory.weeklyLearning as any)?.summary || "";
    const monthlyTheme = typeof dailyMemory.monthlyLearning === "string"
      ? dailyMemory.monthlyLearning
      : (dailyMemory.monthlyLearning as any)?.theme || (dailyMemory.monthlyLearning as any)?.summary || "";
    const coachMemory = typeof dailyMemory.coachMemory === "string"
      ? dailyMemory.coachMemory
      : (dailyMemory.coachMemory as any)?.memory || "";
    const narrativeSummary = coachMemory;

    // Parse gratitude items safely from journal entries
    const gratitudeHistory = journalEntries
      .map((entry: any) => entry?.gratitude || entry?.gratitudeText)
      .filter(Boolean);

    // Build progress markers (streak / milestones)
    const progressMarkers = [];
    if (todayState && (todayState as any).streakDays) {
      progressMarkers.push({
        type: "streak" as const,
        description: `Current streak is ${(todayState as any).streakDays} days.`,
        date: dateKey,
      });
    }

    // Assemble the complete immutable-by-contract MemoryContext snapshot
    const memoryContext: MemoryContext = {
      journeyNarrative,
      weeklyLearning,
      monthlyTheme,
      growthNarrative: journeyNarrative,
      coachMemory,
      practiceInsights: (dailyMemory.practiceInsights as any) || {},
      recentPracticePatterns: (dailyMemory.practiceInsights as any)?.patterns || [],
      progressMarkers,
      dominantThemes: emotionalMemory.recurringThemes?.map((t: any) => t.theme) || [],
      recurringWounds: emotionalMemory.recurringWounds?.map((w: any) => w.wound) || [],
      healingEdges: emotionalMemory.nextHealingEdge ? [emotionalMemory.nextHealingEdge] : [],

      // Structured history placeholders for future sprint/module compatibility
      today: todayState || null,
      yesterday: dailyMemory.yesterday,
      last7Days: dailyMemory.last7Days,
      last30Days: dailyMemory.last30Days,
      reflectionHistory,
      journalHistory: journalEntries,
      meditationHistory: meditations,
      audioHealingHistory: audioHealings,
      journeyHistory: dailyMemory.last30Days,
      wellnessHistory: latestAssessment,
      moodHistory: recentStates.map((s: any) => ({
        date: s.date,
        moodLevel: s.moodLevel,
        emotionalWord: s.emotionalWord,
      })),
      gratitudeHistory,
      activityHistory: recentActivities,
      identitySnapshot: identity,
      circadianContext: null, // Populated dynamically in prompt generation if needed
      languageContext: { language: identity.derivedNumerology?.language || "id" },

      // Continuity triggers
      previousReflection,
      previousDailyNote,
      previousJourney,
      narrativeSummary,
    };

    return Object.freeze(memoryContext);
  }
}
