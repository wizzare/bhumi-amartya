/**
 * BHUMI V4 — Recommendation Context Engine
 * Sprint E: Part 5 — Context Learning
 *
 * Observes the relationship between life situation IDs present during a
 * check-in and the practices the user completed that day.
 *
 * Builds soft additive score boosts for practices that were frequently
 * completed in contexts that resemble today's life situation.
 *
 * Design constraints:
 * - No deterministic mapping. Only soft additive weighting (Part 5 spec).
 * - Context history is bounded to CONTEXT_HISTORY_MAX_RECORDS (Correction #5).
 * - No identity, personality, or mental condition inference (Part 9 spec).
 * - Applied after professional and preference gates (Correction #8).
 */

import type { BehaviorMemoryDocument, ContextCompletionRecord } from "@/lib/repositories/behaviorMemoryRepository";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Boost per matched co-occurrence between a life situation context and a practice. */
const CONTEXT_CO_OCCURRENCE_BOOST = 12;

/** Maximum total context boost any recommendation can receive. */
const MAX_CONTEXT_BOOST = 30;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Additive score boosts keyed by recommendation id. */
export type ContextBoostMap = Map<string, number>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calculate the overlap count between two sets of life situation IDs.
 * One match is sufficient to count a record as contextually relevant.
 */
function countOverlap(a: string[], b: string[]): number {
  const setA = new Set(a);
  return b.filter((id) => setA.has(id)).length;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a context boost map from behavior memory.
 *
 * Algorithm:
 * 1. Filter contextCompletions to records where at least one life situation ID
 *    matches today's snapshot.
 * 2. For each matching record, accumulate completion counts per practice ID.
 * 3. Convert counts to additive score boosts, capped at MAX_CONTEXT_BOOST.
 *
 * The signal is weak-by-design: each co-occurrence adds only CONTEXT_CO_OCCURRENCE_BOOST.
 * Multiple overlapping records can push the boost up to MAX_CONTEXT_BOOST.
 */
export function buildContextBoostMap(
  memory: BehaviorMemoryDocument,
  todayLifeSituationIds: string[]
): ContextBoostMap {
  const boosts = new Map<string, number>();

  if (
    !todayLifeSituationIds ||
    todayLifeSituationIds.length === 0 ||
    memory.contextCompletions.length === 0
  ) {
    return boosts;
  }

  // Count how many times each practice appeared in contextually similar sessions
  const coOccurrenceCounts = new Map<string, number>();

  for (const record of memory.contextCompletions) {
    const overlap = countOverlap(record.lifeSituationIds, todayLifeSituationIds);
    if (overlap === 0) continue; // Not a similar context — skip

    for (const id of record.completedIds) {
      coOccurrenceCounts.set(id, (coOccurrenceCounts.get(id) ?? 0) + 1);
    }
  }

  // Convert counts to capped additive boosts
  for (const [id, count] of coOccurrenceCounts) {
    const boost = Math.min(count * CONTEXT_CO_OCCURRENCE_BOOST, MAX_CONTEXT_BOOST);
    boosts.set(id, boost);
  }

  return boosts;
}
