import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { astroAwarenessEngine } from "@/lib/engines/astroAwarenessEngine";
import type { InnerworkPracticeInput } from "@/lib/engines/innerworkIntelligence";
import { dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { dailyStateRepository, type DailyState } from "@/lib/repositories/dailyStateRepository";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import { wellnessNavigatorRepository } from "@/lib/repositories/wellnessNavigatorRepository";
import { wellnessMappingRepository } from "@/lib/repositories/wellnessMappingRepository";
import type { WellnessMapping } from "@/lib/engines/wellnessMappingEngine";
import type { NavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import type { JourneyDailyMemory } from "@/lib/types/journeyDailyRecord";

export type WellnessCurrentIssue = {
  key: string;
  title: string;
  source: "daily-guidance" | "profile" | "wellness" | "navigator" | "fallback";
};

export type WellnessDailyIntelligence = {
  date: string;
  previousDate: string;
  dailyGuidance: DailyGuidance | null;
  wellnessState: DailyState | null;
  previousDayState: DailyState | null;
  recentDailyStates: DailyState[];
  journeyMemory: JourneyDailyMemory;
  navigatorState: NavigatorState | null;
  currentIssue: WellnessCurrentIssue;
  previousDayLearning: {
    reflectionResult: string;
    practiceId: string;
    completed: boolean;
  } | null;
  journeyIntelligence: {
    weeklyLearning: JourneyDailyMemory["weeklyLearning"];
    monthlyTheme: JourneyDailyMemory["monthlyLearning"];
    growthNarrative: JourneyDailyMemory["growthNarrative"];
    coachMemory: JourneyDailyMemory["coachMemory"];
    practiceEffectiveness: JourneyDailyMemory["practiceInsights"];
    recentPracticePatterns: Array<{
      issue: string;
      practiceId: string;
      practiceCategory: string;
      reflectionResult: string;
      practiceHelped: boolean | null;
      completedAt: string;
    }>;
  };
  recommendationInput: InnerworkPracticeInput;
  mapping: WellnessMapping | null;
};

const EMPTY_MEMORY: JourneyDailyMemory = {
  yesterday: null,
  last7Days: [],
  last30Days: [],
};

const ISSUE_TITLES: Record<string, string> = {
  over_responsibility: "Terlalu Banyak Hal yang Kamu Pikul",
  emotional_fatigue: "Rasa Capek yang Sudah Lama Ditahan",
  lack_of_clarity: "Rasa Bingung Tentang Apa yang Kamu Butuhkan",
  fear_of_disappointing: "Rasa Takut Membuat Orang Lain Kecewa",
  difficulty_resting: "Sulit Beristirahat Tanpa Merasa Bersalah",
  need_for_boundaries: "Batas yang Sudah Lama Ingin Kamu Sampaikan",
  achievement_worth: "Rasa Baru Cukup Setelah Sesuatu Selesai",
  overthinking: "Terlalu Lama Memikirkan Semuanya Sendirian",
  direction_confusion: "Bingung Memilih Arah",
  disconnection: "Terlalu Jauh dari Kebutuhan Sendiri",
  anxiety: "Sistem Tubuh yang Sedang Waspada",
  low_energy: "Energi Tubuh yang Sedang Rendah",
  love_block: "Hambatan dalam Menerima dan Memberi Kasih",
  grief: "Proses Pelepasan dan Duka yang Mendalam",
  self_worth: "Menemukan Nilai Diri yang Sejati",
  burnout: "Kelelahan Fisik dan Emosional yang Berat",
};

const CATEGORY_TO_ISSUE_KEY: Record<string, string> = {
  BURNOUT: "burnout",
  ANXIETY: "anxiety",
  LONELINESS: "love_block",
  LOSS_AND_GRIEF: "grief",
  GROWTH_PHASE: "self_worth",
  LIFE_TRANSITION: "self_worth",
  LIFE_CRISIS: "burnout",
  MEANING_CRISIS: "self_worth",
  SPIRITUAL_AWAKENING: "self_worth",
  SPIRITUAL_CRISIS: "self_worth",
};

export function resolveCurrentIssue(
  mapping: WellnessMapping | null,
  guidance: DailyGuidance | null,
  state: DailyState | null,
  navigator: NavigatorState | null,
  profileSignals: string[],
): WellnessCurrentIssue {
  if (mapping?.results?.[0]?.category) {
    const category = mapping.results[0].category;
    const key = CATEGORY_TO_ISSUE_KEY[category] || category.toLowerCase();
    return {
      key,
      title: ISSUE_TITLES[key] || mapping.results[0].label || key,
      source: "wellness",
    };
  }

  if (guidance?.dominantIssue?.key) {
    const key = guidance.dominantIssue.key;
    return { key, title: ISSUE_TITLES[key] || guidance.dominantIssue.label || key, source: "daily-guidance" };
  }

  const profileText = profileSignals.join(" ").toLowerCase();
  if (/memberi terlalu banyak|mengorbank|menolong|mengurus|beban orang|bertanggung jawab atas/.test(profileText)) {
    return { key: "over_responsibility", title: ISSUE_TITLES.over_responsibility, source: "profile" };
  }
  if (/mengecewakan|penolakan|ditinggalkan|tidak disukai/.test(profileText)) {
    return { key: "fear_of_disappointing", title: ISSUE_TITLES.fear_of_disappointing, source: "profile" };
  }
  if (/batas|sulit berkata tidak|kehilangan diri/.test(profileText)) {
    return { key: "need_for_boundaries", title: ISSUE_TITLES.need_for_boundaries, source: "profile" };
  }
  if (/nilai diri|membuktikan|layak|pengakuan|validasi|pencapaian/.test(profileText)) {
    return { key: "achievement_worth", title: ISSUE_TITLES.achievement_worth, source: "profile" };
  }

  const energy = state?.wellnessSnapshot?.metrics?.energy;
  const mood = state?.moodLevel ?? state?.wellnessSnapshot?.metrics?.emotion;
  if ((energy ?? 10) <= 4 || (mood ?? 10) <= 4) {
    return { key: "emotional_fatigue", title: ISSUE_TITLES.emotional_fatigue, source: "wellness" };
  }
  if (navigator?.mode === "RECOVERY") {
    return { key: "emotional_fatigue", title: ISSUE_TITLES.emotional_fatigue, source: "navigator" };
  }
  if (navigator?.mode === "GROWTH") {
    return { key: "direction_confusion", title: ISSUE_TITLES.direction_confusion, source: "navigator" };
  }
  if (navigator?.mode === "REFLECTION") {
    return { key: "overthinking", title: ISSUE_TITLES.overthinking, source: "navigator" };
  }
  return { key: "difficulty_resting", title: ISSUE_TITLES.difficulty_resting, source: "fallback" };
}

export async function loadWellnessDailyIntelligence(input: {
  uid: string;
  profile: Record<string, any>;
  blueprint: Record<string, any> | null;
  date?: string;
}): Promise<WellnessDailyIntelligence> {
  const timezone = input.profile?.timezone
    || input.profile?.profile?.timezone
    || Intl.DateTimeFormat().resolvedOptions().timeZone
    || "UTC";
  const date = input.date || getLocalDateKey(new Date(), timezone);
  const previous = new Date(`${date}T12:00:00`);
  previous.setDate(previous.getDate() - 1);
  const previousDate = getLocalDateKey(previous, timezone);

  const [dailyGuidance, wellnessState, previousDayState, recentDailyStates, journeyMemory, navigatorState, mapping] = await Promise.all([
    dailyGuidanceRepository.getDailyGuidance(input.uid, date).catch(() => null),
    dailyStateRepository.getDailyState(input.uid, date).catch(() => null),
    dailyStateRepository.getDailyState(input.uid, previousDate).catch(() => null),
    journeyRepository.getRecentDailyStates(input.uid, 7).catch(() => []),
    journeyRepository.getDailyMemory(input.uid).catch(() => EMPTY_MEMORY),
    wellnessNavigatorRepository.getNavigatorState(input.uid).catch(() => null),
    wellnessMappingRepository.getMapping(input.uid).catch(() => null),
  ]);

  if (previousDayState && !previousDayState.consolidatedAt) {
    void dailyStateRepository.consolidateDay(input.uid, previousDate).catch((error) =>
      console.warn("[WELLNESS_LAZY_RECOVERY_FAILED]", { date: previousDate, error }),
    );
  }

  const profileSignals: string[] = [];
  const currentIssue = resolveCurrentIssue(mapping, dailyGuidance, wellnessState, navigatorState, profileSignals);
  const awareness = astroAwarenessEngine.getAwarenessContext(new Date(`${date}T12:00:00`));
  const astroContext = [
    dailyGuidance?.astrologyToday,
    ...(dailyGuidance?.astroHouseActivations ?? []).slice(0, 2).map((item) => JSON.stringify(item)),
    `moonPhase:${awareness.currentMoonPhase.label}`,
  ].filter((value): value is string => Boolean(value));
  const recentPracticePatterns = journeyMemory.last30Days
    .flatMap((record) => record.practiceResults ?? [])
    .slice(0, 20)
    .map((result) => ({
      issue: result.issue,
      practiceId: result.practiceId,
      practiceCategory: result.practiceCategory,
      reflectionResult: result.reflectionResult ?? "",
      practiceHelped: result.practiceHelped ?? null,
      completedAt: result.completedAt,
    }));

  const previousCompletion = journeyMemory.yesterday?.innerworkCompletion;
  return {
    date,
    previousDate,
    dailyGuidance,
    wellnessState,
    previousDayState,
    recentDailyStates,
    journeyMemory,
    navigatorState,
    currentIssue,
    previousDayLearning: previousCompletion
      ? {
          reflectionResult: previousCompletion.reflectionResult ?? "",
          practiceId: previousCompletion.actualPracticeId || journeyMemory.yesterday?.innerworkRecommendation?.practiceId || "",
          completed: previousCompletion.completed,
        }
      : null,
    journeyIntelligence: {
      weeklyLearning: journeyMemory.weeklyLearning,
      monthlyTheme: journeyMemory.monthlyLearning,
      growthNarrative: journeyMemory.growthNarrative,
      coachMemory: journeyMemory.coachMemory,
      practiceEffectiveness: journeyMemory.practiceInsights,
      recentPracticePatterns,
    },
    recommendationInput: {
      dominantIssue: currentIssue.key,
      localDateKey: date,
      navigatorMode: navigatorState?.mode,
      wellnessState: {
        energy: wellnessState?.wellnessSnapshot?.metrics?.energy,
        mood: wellnessState?.moodLevel ?? wellnessState?.wellnessSnapshot?.metrics?.emotion,
        nervousSystemState: wellnessState?.nervousSystemState,
      },
      dailyScan: {
        emotionalWord: wellnessState?.emotionalWord,
        dailyNoteText: dailyGuidance?.dailyNoteText,
      },
      profileMeaning: profileSignals,
      astroContext,
      journeyHistory: journeyMemory.last30Days.map((entry) => ({
        date: entry.appDate,
        practiceId: entry.innerworkCompletion?.actualPracticeId || entry.innerworkRecommendation?.practiceId,
        innerworkType: entry.innerworkCompletion?.actualPracticeType || entry.innerworkRecommendation?.practiceType,
        dominantIssue: entry.dominantIssue,
        completed: Boolean(entry.innerworkCompletion?.completed),
        skipped: Boolean(entry.innerworkCompletion?.skipped),
        reflectionResult: entry.innerworkCompletion?.reflectionResult,
      })),
      journeyLearning: {
        weeklyLearning: journeyMemory.weeklyLearning,
        monthlyLearning: journeyMemory.monthlyLearning,
        coachMemory: journeyMemory.coachMemory,
        growthNarrative: journeyMemory.growthNarrative,
        practiceEffectiveness: journeyMemory.practiceInsights,
      },
    },
    mapping,
  };
}
