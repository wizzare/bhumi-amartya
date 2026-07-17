/**
 * BHUMI V4 — Recommendation Preference Engine
 * Sprint E: Part 3 — Preference Learning
 *
 * Observes which practices the user actually completes and produces
 * soft additive weight adjustments per recommendation id.
 *
 * Design constraints:
 * - Rewards completions. Does not strongly penalise non-completion (Correction #7).
 * - skippedCount is NOT used for preference scoring (Correction #2).
 * - Weights decay toward neutral after DECAY_DAYS_THRESHOLD days of inactivity.
 * - No permanent removal of any recommendation.
 * - Professional safety gates must run before this score is applied (Correction #8).
 *   This engine only returns incremental score adjustments — gating is upstream.
 */

import type { BehaviorMemoryDocument, RecommendationMemoryEntry } from "@/lib/repositories/behaviorMemoryRepository";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Boost applied when the user frequently completes a practice. */
const COMPLETION_BOOST = 20;

/**
 * Soft penalty applied only when recommendedCount is large enough to be
 * statistically meaningful AND completion ratio is very low.
 * Intentionally weak (Correction #7): non-completion is not dislike.
 */
const LOW_COMPLETION_SOFT_PENALTY = -8;

/** Minimum recommendations required before any negative signal applies. */
const MIN_RECOMMENDATIONS_FOR_PENALTY = 8;

/** Ratio threshold above which a completion boost is applied. */
const HIGH_COMPLETION_RATIO = 0.6;

/** Ratio threshold below which the soft penalty may apply. */
const LOW_COMPLETION_RATIO = 0.15;

/**
 * Days without any interaction (completed OR recommended) before the
 * weight decays back to 0 (neutral).
 */
const DECAY_DAYS_THRESHOLD = 14;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Additive weight adjustments keyed by recommendation id. */
export type PreferenceWeightMap = Map<string, number>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysSince(isoTimestamp: string | null): number {
  if (!isoTimestamp) return Infinity;
  const then = new Date(isoTimestamp).getTime();
  const now = Date.now();
  return (now - then) / (1000 * 60 * 60 * 24);
}

function decayFactor(entry: RecommendationMemoryEntry): number {
  // Most recent interaction time
  const lastInteraction = entry.lastCompletedAt ?? entry.lastRecommendedAt;
  const days = daysSince(lastInteraction);
  if (days >= DECAY_DAYS_THRESHOLD) return 0; // fully decayed to neutral
  // Linear decay from 1.0 (fresh) to 0.0 (at DECAY_DAYS_THRESHOLD)
  return 1 - days / DECAY_DAYS_THRESHOLD;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a preference weight map from behavior memory.
 *
 * Returns a Map<recommendationId, scoreAdjustment> where values are additive
 * deltas to apply in scoreRecommendation().
 *
 * Rules applied (in order):
 * 1. Professional safety gates are NOT this engine's responsibility —
 *    they must already have filtered the candidate pool upstream.
 * 2. Completion boost: applied when completionRatio >= HIGH_COMPLETION_RATIO.
 * 3. Soft low-completion penalty: applied only when recommendedCount is
 *    large enough AND completionRatio is very low (Correction #7).
 * 4. Decay: both signals decay linearly to 0 over DECAY_DAYS_THRESHOLD days.
 */
export function buildPreferenceWeightMap(
  memory: BehaviorMemoryDocument
): PreferenceWeightMap {
  const weights = new Map<string, number>();

  for (const [id, entry] of Object.entries(memory.recommendations)) {
    const { recommendedCount, completedCount } = entry;
    if (recommendedCount === 0) continue;

    const ratio = completedCount / recommendedCount;
    const decay = decayFactor(entry);
    if (decay === 0) continue; // fully decayed — no adjustment

    let adjustment = 0;

    if (ratio >= HIGH_COMPLETION_RATIO) {
      // Frequent completer — reward this practice
      adjustment = COMPLETION_BOOST * decay;
    } else if (
      ratio <= LOW_COMPLETION_RATIO &&
      recommendedCount >= MIN_RECOMMENDATIONS_FOR_PENALTY
    ) {
      // Rarely completed despite many appearances — very soft reduction
      // This reflects capacity/fit mismatch, NOT dislike (Correction #7)
      adjustment = LOW_COMPLETION_SOFT_PENALTY * decay;
    }

    if (adjustment !== 0) {
      weights.set(id, Math.round(adjustment));
    }
  }

  return weights;
}
