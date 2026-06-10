/**
 * BHUMI AMARTYA - Emotional Memory System
 * Stores and updates emotional patterns, recurring themes, and healing progress
 * Creates a persistent record of the user's emotional journey for future insights
 */

import type {
  JournalEntry,
  EmotionalAnalysis,
  EmotionalMemory,
} from "../data/types";

// ============= MEMORY INITIALIZATION =============

export function initializeEmotionalMemory(userId: string): EmotionalMemory {
  return {
    userId,
    timeframe: "monthly",
    emotionalTrends: [],
    recurringThemes: [],
    recurringWounds: [],
    emotionalCycles: [],
    healingMilestones: [],
    healingActions: [],
    chakraBalance: [],
    suggestedFocus: "Establishing baseline emotional patterns",
    abandonedPatterns: [],
    nextHealingEdge: "Getting to know your emotional landscape",
  };
}

// ============= MEMORY UPDATE LOGIC =============

export function updateEmotionalMemory(
  currentMemory: EmotionalMemory,
  newEntry: JournalEntry,
  analysis: EmotionalAnalysis
): EmotionalMemory {
  const updated = { ...currentMemory };

  // ---------------------------------
  // UPDATE EMOTIONAL TRENDS
  // ---------------------------------

  const primaryEmotion = analysis.primaryEmotion;
  const existingTrend = updated.emotionalTrends.find(
    (t) => t.emotion === primaryEmotion
  );

  if (existingTrend) {
    existingTrend.frequency += 1;
    // Simple trend detection
    const recentCount = currentMemory.emotionalTrends.filter(
      (t) => t.emotion === primaryEmotion
    ).length;
    if (recentCount > existingTrend.frequency * 0.8) {
      existingTrend.trend = "increasing";
    } else if (recentCount < existingTrend.frequency * 0.3) {
      existingTrend.trend = "decreasing";
    } else {
      existingTrend.trend = "stable";
    }
  } else {
    updated.emotionalTrends.push({
      emotion: primaryEmotion,
      frequency: 1,
      trend: "stable",
    });
  }

  // ---------------------------------
  // UPDATE RECURRING THEMES
  // ---------------------------------

  for (const theme of analysis.recurringThemes) {
    const existingTheme = updated.recurringThemes.find(
      (t) => t.theme === theme
    );

    if (existingTheme) {
      existingTheme.count += 1;
      existingTheme.lastAppeared = newEntry.dateCreated;
    } else {
      updated.recurringThemes.push({
        theme,
        count: 1,
        firstAppeared: newEntry.dateCreated,
        lastAppeared: newEntry.dateCreated,
      });
    }
  }

  // Sort by frequency
  updated.recurringThemes.sort((a, b) => b.count - a.count);

  // ---------------------------------
  // UPDATE RECURRING WOUNDS
  // ---------------------------------

  for (const wound of analysis.recurringWounds) {
    const existingWound = updated.recurringWounds.find(
      (w) => w.wound === wound
    );

    if (existingWound) {
      existingWound.intensity = analysis.recurringWounds.find(
        (w) => w === wound
      )
        ? "deep"
        : existingWound.intensity;

      // Healing progress: track if intensity changes or user shows awareness
      if (newEntry.emotionalCheckIn.moodLevel > 6) {
        existingWound.healingProgress = "some-progress";
      }
    } else {
      updated.recurringWounds.push({
        wound,
        intensity: "moderate",
        healingProgress: "no-progress",
      });
    }
  }

  // ---------------------------------
  // DETECT EMOTIONAL CYCLES
  // ---------------------------------

  const detectedCycles = detectEmotionalCycles(
    updated.emotionalTrends,
    newEntry.dateCreated
  );
  for (const cycle of detectedCycles) {
    if (!updated.emotionalCycles.some((c) => c.cycle === cycle.cycle)) {
      updated.emotionalCycles.push(cycle);
    }
  }

  // ---------------------------------
  // ADD HEALING MILESTONE IF SIGNIFICANT PROGRESS
  // ---------------------------------

  if (
    newEntry.emotionalCheckIn.moodLevel >= 7 &&
    analysis.emotionalExhaustion !== "critical"
  ) {
    const milestone = detectHealingMilestone(analysis, updated);
    if (milestone) {
      updated.healingMilestones.push({
        date: newEntry.dateCreated,
        milestone,
        journalReference: newEntry.id,
      });
    }
  }

  // ---------------------------------
  // UPDATE SUGGESTED FOCUS & NEXT EDGE
  // ---------------------------------

  updated.suggestedFocus = generateSuggestedFocus(updated);
  updated.nextHealingEdge = generateNextHealingEdge(updated);

  return updated;
}

// ============= HELPER FUNCTIONS =============

function detectEmotionalCycles(
  trends: EmotionalMemory["emotionalTrends"],
  currentDate: string
): EmotionalMemory["emotionalCycles"] {
  const cycles: EmotionalMemory["emotionalCycles"] = [];

  // Pattern: If same emotion appears 3+ times, might be cyclical
  const highFrequencyEmotions = trends.filter((t) => t.frequency >= 3);

  for (const emotion of highFrequencyEmotions) {
    if (emotion.emotion === "grief" || emotion.emotion === "sadness") {
      cycles.push({
        cycle: `${emotion.emotion}-cycle`,
        pattern: "Appears in waves, often after high-energy periods",
        triggerFactors: [
          "fatigue",
          "overwhelm",
          "end-of-project",
          "alone-time",
        ],
      });
    } else if (emotion.emotion === "anxiety") {
      cycles.push({
        cycle: "anxiety-spike-cycle",
        pattern: "Intensifies before transitions or big events",
        triggerFactors: [
          "uncertainty",
          "decision-points",
          "new-situations",
          "time-pressure",
        ],
      });
    } else if (emotion.emotion === "anger") {
      cycles.push({
        cycle: "anger-accumulation",
        pattern: "Builds when boundaries are consistently crossed",
        triggerFactors: [
          "boundary-violation",
          "injustice",
          "powerlessness",
          "resentment-build-up",
        ],
      });
    }
  }

  return cycles;
}

function detectHealingMilestone(
  analysis: EmotionalAnalysis,
  memory: EmotionalMemory
): string | null {
  const milestones: string[] = [];

  // Recognizing a pattern (awareness is healing)
  if (
    analysis.recurringWounds.length > 0 &&
    analysis.recurringWounds.length <=
      memory.recurringWounds.length + 1
  ) {
    milestones.push(
      "Recognized and named a recurring wound - awareness is the first step"
    );
  }

  // Shift from critical to moderate exhaustion
  if (
    analysis.emotionalExhaustion === "moderate" &&
    memory.emotionalTrends.some((t) => t.emotion === "exhaustion")
  ) {
    milestones.push(
      "Moved from critical exhaustion to manageable levels - rest is working"
    );
  }

  // New insight or wisdom gained
  if (analysis.gentleInsight && !analysis.avoidancePatterns?.includes("numbing")) {
    milestones.push(
      "Arrived at a genuine insight about yourself - wisdom is emerging"
    );
  }

  // Emotional complexity (better than flat dysregulation)
  if (analysis.secondaryEmotions && analysis.secondaryEmotions.length >= 2) {
    milestones.push(
      "Able to feel complex emotions - sign of growing emotional sophistication"
    );
  }

  return milestones.length > 0 ? milestones[0] : null;
}

function generateSuggestedFocus(memory: EmotionalMemory): string {
  // Focus on most frequent patterns
  if (memory.recurringWounds.length === 0) {
    return "Establishing emotional baseline and patterns";
  }

  const topWound = memory.recurringWounds[0];
  const topTheme = memory.recurringThemes[0];

  if (topWound.healingProgress === "no-progress") {
    return `Gentle exploration of "${topWound.wound}" - this seems to need attention`;
  }

  if (topTheme) {
    return `Working with the "${topTheme.theme}" theme that keeps appearing`;
  }

  return "Continue witnessing and documenting your emotional landscape";
}

function generateNextHealingEdge(memory: EmotionalMemory): string {
  // What's the next thing to work with?
  const deepWounds = memory.recurringWounds.filter(
    (w) => w.intensity === "deep"
  );

  if (deepWounds.length > 0 && deepWounds[0].healingProgress === "no-progress") {
    return `Deepening into the wound of "${deepWounds[0].wound}" - it's ready to be explored with gentleness`;
  }

  const emergedTheme = memory.recurringThemes.find((t) => t.count === 1);
  if (emergedTheme) {
    return `Something new is emerging: "${emergedTheme.theme}" - notice what wants your attention`;
  }

  const cycles = memory.emotionalCycles;
  if (cycles.length > 0) {
    return `You're developing awareness of your cycles. Next edge: working with them consciously instead of reactively`;
  }

  return "The healing edge is where self-compassion meets honest self-inquiry";
}

// ============= MEMORY RETRIEVAL & ANALYSIS =============

export function getEmotionalInsights(
  memory: EmotionalMemory
): {
  topEmotions: string[];
  dominantThemes: string[];
  deepWounds: string[];
  healingProgress: Record<string, number>;
} {
  return {
    topEmotions: memory.emotionalTrends
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map((t) => t.emotion),

    dominantThemes: memory.recurringThemes
      .slice(0, 3)
      .map((t) => t.theme),

    deepWounds: memory.recurringWounds
      .filter((w) => w.intensity === "deep")
      .map((w) => w.wound),

    healingProgress: memory.recurringWounds.reduce(
      (acc, w) => {
        acc[w.wound] =
          w.healingProgress === "significant-progress"
            ? 3
            : w.healingProgress === "some-progress"
              ? 2
              : 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}

export function shouldSuggestTherapy(memory: EmotionalMemory): boolean {
  // If there are multiple "deep" wounds with no progress over time
  const deepWounds = memory.recurringWounds.filter(
    (w) => w.intensity === "deep" && w.healingProgress === "no-progress"
  );

  return deepWounds.length >= 2 && memory.healingMilestones.length <= 1;
}
