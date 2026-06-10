import { journalRepository } from "@/lib/repositories/journalRepository";
import { meditationRepository } from "@/lib/repositories/meditationRepository";
import { audioHealingRepository } from "@/lib/repositories/audioHealingRepository";
import { emotionalMemoryRepository } from "@/lib/repositories/emotionalMemoryRepository";
import { blueprintRepository } from "@/lib/repositories/blueprintRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { progressRepository } from "@/lib/repositories/progressRepository";
import {
  calculateProgressMetrics,
  type ProgressMetrics,
} from "@/lib/engines/progressCalculationEngine";
import type { UserProfile } from "@/lib/types/user";
import type { Blueprint } from "@/lib/types/blueprint";
import type { EmotionalMemory } from "@/lib/data/types";
import { profileToCoreIdentity } from "@/lib/mappers/userProfileMapper";
import type { CoreIdentity } from "@/lib/data/types";

export interface InsightPageData {
  hasActivity: boolean;
  progress: ProgressMetrics | null;
  userProfile: UserProfile | null;
  blueprint: Blueprint | null;
  coreIdentity: CoreIdentity | null;
  emotionalMemory: EmotionalMemory | null;
  generatedAt: string;
}

export class InsightOrchestrator {
  private uid: string;

  constructor(uid: string) {
    this.uid = uid;
  }

  async getInsightPageData(): Promise<InsightPageData> {
    try {
      // Fetch all necessary data in parallel
      const [userProfileFromRepo, blueprint, journalEntries, meditationEntries, audioHealingEntries] =
        await Promise.all([
          userRepository.getUserProfile(this.uid).catch(() => null),
          blueprintRepository.getUserBlueprint(this.uid).catch(() => null),
          journalRepository.getJournalEntries(this.uid).catch(() => []),
          meditationRepository.getMeditationEntries(this.uid).catch(() => []),
          audioHealingRepository.getAudioHealingEntries(this.uid).catch(() => []),
        ]);

      // Normalize userProfile type
      const userProfile = userProfileFromRepo as UserProfile | null;

      // Check if there's any activity
      const hasActivity =
        journalEntries.length > 0 ||
        meditationEntries.length > 0 ||
        audioHealingEntries.length > 0;

      if (!hasActivity) {
        return {
          hasActivity: false,
          progress: null,
          userProfile,
          blueprint: blueprint || null,
          coreIdentity: null,
          emotionalMemory: null,
          generatedAt: new Date().toISOString(),
        };
      }

      // Calculate progress metrics
      const progressMetrics = calculateProgressMetrics({
        journalEntries,
        meditationEntries,
        audioHealingEntries,
      });

      // Save progress metrics
      await progressRepository.saveProgressData(this.uid, progressMetrics).catch(() => {
        console.warn("Failed to save progress data to Firestore");
      });

      // Get emotional memory
      const emotionalMemory = await emotionalMemoryRepository
        .getOrCreate(this.uid)
        .catch(() => null);

      // Create core identity if blueprint exists
      let coreIdentity: CoreIdentity | null = null;
      if (userProfile && blueprint) {
        try {
          coreIdentity = profileToCoreIdentity(userProfile, blueprint);
        } catch (error) {
          console.warn("Failed to create core identity:", error);
        }
      }

      return {
        hasActivity: true,
        progress: progressMetrics,
        userProfile,
        blueprint: blueprint || null,
        coreIdentity,
        emotionalMemory,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[InsightOrchestrator] Failed to get insight page data:", error);
      throw error;
    }
  }
}
