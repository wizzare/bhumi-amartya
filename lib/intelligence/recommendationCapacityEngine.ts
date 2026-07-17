/**
 * BHUMI V4 — Recommendation Capacity Engine
 * Sprint E: Part 4 — Capacity Learning
 *
 * Observes the average duration of practices completed at each energy level
 * (low / medium / high) and applies additive score adjustments to recommendations
 * that match the user's observed capacity in the current energy context.
 *
 * Design constraints:
 * - Adjustment is purely additive. Cannot override health or safety gates.
 * - Applied after professional and preference gates (Correction #8).
 * - No personality inference — only duration fit to energy level.
 */

import type { BehaviorMemoryDocument, CapacityProfile } from "@/lib/repositories/behaviorMemoryRepository";
import type { WellnessRecommendation } from "@/lib/data/wellnessRecommendationLibrary";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Bonus when a recommendation duration fits the observed capacity for this energy level. */
const DURATION_FIT_BONUS = 20;

/** Penalty when a recommendation duration exceeds the observed capacity by a comfortable margin. */
const DURATION_MISMATCH_PENALTY = -10;

/** Tolerance above the average where a recommendation is still "comfortable". */
const COMFORTABLE_EXCESS_MINUTES = 2;

/** Margin above comfortable where a recommendation feels clearly too long. */
const UNCOMFORTABLE_EXCESS_MINUTES = 5;

/** Minimum number of completed sessions in a bucket before capacity learning is trusted. */
const MIN_BUCKET_SAMPLES = 3;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Additive score adjustments keyed by recommendation id. */
export type CapacityAdjustmentMap = Map<string, number>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type EnergyBucket = keyof CapacityProfile;

function getBucket(energy: number): EnergyBucket {
  if (energy < 4) return "lowEnergy";
  if (energy > 7) return "highEnergy";
  return "medEnergy";
}

function avgDuration(bucket: { totalDuration: number; count: number }): number | null {
  if (bucket.count < MIN_BUCKET_SAMPLES) return null; // not enough data yet
  return bucket.totalDuration / bucket.count;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a capacity adjustment map for the current energy level.
 *
 * For each recommendation, returns a positive, negative, or zero delta:
 * - +DURATION_FIT_BONUS if duration is within the observed comfortable range.
 * - DURATION_MISMATCH_PENALTY if duration meaningfully exceeds observed capacity.
 * - 0 if insufficient data (< MIN_BUCKET_SAMPLES completions in this bucket).
 *
 * The caller passes all WELLNESS_RECOMMENDATION_LIBRARY items so this engine
 * can build a complete map without re-importing the library.
 */
export function buildCapacityAdjustmentMap(
  memory: BehaviorMemoryDocument,
  currentEnergy: number,
  allCandidates: WellnessRecommendation[]
): CapacityAdjustmentMap {
  const adjustments = new Map<string, number>();
  const bucket = getBucket(currentEnergy);
  const avg = avgDuration(memory.capacityProfile[bucket]);

  if (avg === null) {
    // Not enough data — no capacity signal applied
    return adjustments;
  }

  const comfortableMax = avg + COMFORTABLE_EXCESS_MINUTES;
  const uncomfortableThreshold = avg + UNCOMFORTABLE_EXCESS_MINUTES;

  for (const item of allCandidates) {
    const duration = item.estimatedDuration;

    if (duration <= comfortableMax) {
      adjustments.set(item.id, DURATION_FIT_BONUS);
    } else if (duration > uncomfortableThreshold) {
      adjustments.set(item.id, DURATION_MISMATCH_PENALTY);
    }
    // Between comfortableMax and uncomfortableThreshold: no adjustment
  }

  return adjustments;
}
