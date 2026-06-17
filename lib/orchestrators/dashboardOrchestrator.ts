import { dashboardRepository } from "@/lib/repositories/dashboardRepository";
import { emotionalMemoryRepository } from "@/lib/repositories/emotionalMemoryRepository";
import { astrologyRepository } from "@/lib/repositories/astrologyRepository";
import { profileToCoreIdentity, profileToDashboardUser } from "@/lib/mappers/userProfileMapper";
import { initializeEmotionalMemory } from "@/lib/engines/updateEmotionalMemory";
import type { DashboardData } from "@/lib/data/types";
import type { UserProfile } from "@/lib/types/user";
import type { Blueprint } from "@/lib/types/blueprint";
import type { DailyGuidanceInput, DailyGuidanceOutput } from "@/lib/orchestrators/types";

export interface DashboardOrchestratorConfig {
  userProfile: UserProfile;
  blueprint: Blueprint;
  forceRefresh?: boolean;
}

export class DashboardOrchestrator {
  private config: DashboardOrchestratorConfig;

  constructor(config: DashboardOrchestratorConfig) {
    this.config = config;
  }

  async getDashboardData(): Promise<DashboardData | null> {
    if (!this.config.forceRefresh) {
      // Ensure userProfile exists before trying to access its properties
      if (this.config.userProfile?.uid) {
        const cached = await dashboardRepository
          .getCurrent(this.config.userProfile.uid)
          .catch(() => {
            console.warn("Dashboard cache unavailable. Continuing without Firestore cache.");
            return null;
          });
        if (cached) return cached;
      }
    }

    const { userProfile, blueprint } = this.config;
    if (!userProfile) {
      // If there's no profile, we cannot generate a dashboard.
      // This can happen if the user hasn't completed setup.
      console.warn("User profile not available, cannot generate dashboard data.");
      return null;
    }

    const input = await this.buildDailyGuidanceInput();
    const guidance = await this.requestDailyGuidance(input);
    const dashboardData = this.toDashboardData(input, guidance);

    if (dashboardData) {
      await dashboardRepository.saveCurrent(this.config.userProfile.uid, dashboardData).catch(() => {
        console.warn("Dashboard cache save unavailable. Generated dashboard will remain session-only.");
      });
    }

    return dashboardData;
  }

  private async buildDailyGuidanceInput(): Promise<DailyGuidanceInput> {
    const user = profileToDashboardUser(this.config.userProfile);
    const identity = profileToCoreIdentity(this.config.userProfile, this.config.blueprint);
    const emotionalMemory = await emotionalMemoryRepository
      .getOrCreate(this.config.userProfile.uid)
      .catch(() => {
        console.warn("Emotional memory unavailable. Using session baseline.");
        return initializeEmotionalMemory(this.config.userProfile.uid);
      });
    const astrologyTransits = await astrologyRepository
      .getCurrentTransits()
      .catch(() => {
        console.warn("Current astrology transits unavailable.");
        return null;
      });

    return {
      user,
      identity,
      blueprint: this.config.blueprint,
      emotionalState: this.config.userProfile.emotionalState,
      emotionalMemory,
      healingProgress: this.config.userProfile.healingProgress,
      astrologyTransits,
      language: this.config.userProfile.profile.language,
      generatedAt: new Date().toISOString(),
    };
  }

  private async requestDailyGuidance(input: DailyGuidanceInput): Promise<DailyGuidanceOutput | null> {
    try {
      const response = await fetch("/api/ai/daily-guidance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result = await response.json();
      return result.guidance || result;
    } catch (error) {
      console.error("Failed to fetch daily guidance, attempting local fallback:", error);
      try {
        const { generateLocalDailyGuidance } = await import("@/lib/orchestrators/localDailyGuidanceFallback");
        return generateLocalDailyGuidance(input);
      } catch (fallbackError) {
        console.error("Local fallback also failed:", fallbackError);
        return null;
      }
    }
  }

  private toDashboardData(
    input: DailyGuidanceInput,
    guidance: DailyGuidanceOutput | null
  ): DashboardData | null {
    if (!guidance) {
      return null;
    }

    const generatedAt = new Date(input.generatedAt);
    const validUntil = new Date(generatedAt);
    validUntil.setHours(23, 59, 59, 999);

    return {
      user: input.user,
      identity: input.identity,
      blueprintSummary: guidance.blueprintSummary,
      aiReflection: guidance.soulReflection,
      astroEnergy: guidance.astroEnergy,
      shadowInsight: guidance.shadowInsight, // Use the string directly
      dailyInnerwork: guidance.dailyInnerwork,
      journalingPrompt: guidance.journalingPrompt,
      meditation: guidance.meditationRecommendation,
      healingAudio: guidance.healingAudio,
      healingRecommendation: guidance.healingRecommendation,
      soulProgress: {
        ...guidance.soulProgress,
        healingStreak: input.healingProgress.healingStreak,
        totalJournalEntries: input.healingProgress.totalJournalEntries,
        totalMeditationMinutes: input.healingProgress.totalMeditationMinutes,
        totalInnerworkSessions: input.healingProgress.totalInnerworkSessions,
      },
      reminderState: guidance.reminderState,
      generatedAt: generatedAt.toISOString(),
      validUntil: validUntil.toISOString(),
    };
  }

  private isCacheForCurrentProfile(data: DashboardData): boolean {
    const profile = this.config.userProfile;
    return (
      data.user.uid === profile.uid &&
      data.user.birthDate === (profile.birthDate || profile.profile.blueprintInput?.birthDate || "") &&
      data.user.birthTime === (profile.birthTime || profile.profile.blueprintInput?.birthTime || "") &&
      data.user.birthPlace === (profile.birthCity || profile.profile.blueprintInput?.birthCity || "")
    );
  }
}

export function createDashboardOrchestrator(config: DashboardOrchestratorConfig) {
  return new DashboardOrchestrator(config);
}
