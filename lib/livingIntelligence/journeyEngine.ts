import { MemoryContext, ReflectionContext, CircadianContext, JourneyContext } from "./types";
import { IdentitySnapshot } from "../ai/types";

export class JourneyEngine {
  public static calculate(
    memory: MemoryContext,
    reflection: ReflectionContext,
    identity: IdentitySnapshot,
    circadian: CircadianContext
  ): JourneyContext {
    console.log(`[JOURNEY_ENGINE] Calculating Growth Metadata for user: ${identity.uid}`);

    // 1. Calculate Consistency Rate (active days relative to a 30-day window)
    const journalEntries = memory.journalHistory || [];
    const meditationEntries = memory.meditationHistory || [];
    const audioEntries = memory.audioHealingHistory || [];

    const activeDates = new Set<string>();
    const extractDate = (val: any) => {
      if (!val) return null;
      if (typeof val.createdAt === "string") return val.createdAt.slice(0, 10);
      if (typeof val.date === "string") return val.date.slice(0, 10);
      return null;
    };

    journalEntries.forEach(e => { const d = extractDate(e); if (d) activeDates.add(d); });
    meditationEntries.forEach(e => { const d = extractDate(e); if (d) activeDates.add(d); });
    audioEntries.forEach(e => { const d = extractDate(e); if (d) activeDates.add(d); });

    const uniqueDays = activeDates.size;
    const consistencyRate = Math.min(100, Math.round((uniqueDays / 30) * 100));

    // 2. Determine Growth Stage
    let currentStage: "orientation" | "exploration" | "consolidation" | "integration" = "orientation";
    if (consistencyRate > 75) {
      currentStage = "integration";
    } else if (consistencyRate > 45) {
      currentStage = "consolidation";
    } else if (consistencyRate > 15) {
      currentStage = "exploration";
    }

    // 3. Multi-dimensional Momentum
    let direction: "upward" | "stable" | "downward" = "stable";
    if (reflection.narrativeDirection === "rising-growth") {
      direction = "upward";
    } else if (reflection.narrativeDirection === "gentle-support") {
      direction = "downward";
    }

    let confidence: "high" | "moderate" | "developing" = "developing";
    if (consistencyRate > 60) {
      confidence = "high";
    } else if (consistencyRate > 30) {
      confidence = "moderate";
    }

    // Determine velocity based on recent vs older activity
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentActivityCount = Array.from(activeDates).filter(d => new Date(d) >= sevenDaysAgo).length;
    
    let velocity: "accelerating" | "steady" | "decelerating" = "steady";
    if (recentActivityCount >= 4) {
      velocity = "accelerating";
    } else if (recentActivityCount <= 1 && uniqueDays > 2) {
      velocity = "decelerating";
    }

    let stability: "stable" | "volatile" | "fragile" = "stable";
    if (uniqueDays === 0) {
      stability = "fragile";
    } else if (recentActivityCount > 0 && uniqueDays / recentActivityCount > 4) {
      stability = "volatile";
    }

    // 4. Pattern Detection (Micro Wins)
    const microWins: any[] = [];
    const todayStr = new Date().toISOString().slice(0, 10);

    // Streaks micro win
    const streakMarker = memory.progressMarkers?.find(m => m.type === "streak");
    if (streakMarker) {
      microWins.push({
        id: `streak_${todayStr}`,
        type: "consistency",
        targetArea: "activity",
        date: todayStr,
      });
    }

    // First completion
    if (uniqueDays === 1) {
      microWins.push({
        id: `first_comp_${todayStr}`,
        type: "first_completion",
        targetArea: "journey",
        date: todayStr,
      });
    }

    // Journaling resumption
    if (journalEntries.length >= 2) {
      const dates = journalEntries.map(e => extractDate(e)).filter(Boolean).map(d => new Date(d as string).getTime());
      dates.sort((a, b) => b - a); // descending
      if (dates.length >= 2) {
        const gap = dates[0] - dates[1];
        const gapDays = gap / (24 * 60 * 60 * 1000);
        if (gapDays >= 4 && gapDays <= 14) {
          microWins.push({
            id: `journal_resume_${todayStr}`,
            type: "journaling_resumed",
            targetArea: "journal",
            date: todayStr,
          });
        }
      }
    }

    // Gratitude returned
    if (memory.gratitudeHistory && memory.gratitudeHistory.length > 0) {
      microWins.push({
        id: `gratitude_returned_${todayStr}`,
        type: "gratitude_returned",
        targetArea: "gratitude",
        date: todayStr,
      });
    }

    // Meditation resumed
    if (meditationEntries.length >= 2) {
      const dates = meditationEntries.map(e => extractDate(e)).filter(Boolean).map(d => new Date(d as string).getTime());
      dates.sort((a, b) => b - a);
      if (dates.length >= 2 && (dates[0] - dates[1]) / (24 * 60 * 60 * 1000) >= 4) {
        microWins.push({
          id: `meditation_resume_${todayStr}`,
          type: "meditation_resumed",
          targetArea: "meditation",
          date: todayStr,
        });
      }
    }

    // 5. Next Growth Signals
    const nextGrowthSignals: any[] = [];
    if (stability === "fragile" || direction === "downward") {
      nextGrowthSignals.push("breathing", "reflection", "sleep");
    } else if (currentStage === "orientation" || currentStage === "exploration") {
      nextGrowthSignals.push("gratitude", "reflection", "learning");
    } else {
      nextGrowthSignals.push("purpose", "creative", "connection");
    }

    // Return the immutable context snapshot
    const journeyContext: JourneyContext = {
      currentStage,
      consistencyRate,
      momentum: {
        direction,
        confidence,
        velocity,
        stability,
      },
      microWins,
      nextGrowthSignals,
      wellnessSignals: [],
      habitSignals: [],
      growthSignals: [],
      achievementSignals: [],
    };

    return Object.freeze(journeyContext);
  }
}
