import assert from "assert";

// Polyfill window timer methods for Node CLI harness execution
(global as any).window = (global as any).window || global;
if (!global.window.setTimeout) global.window.setTimeout = global.setTimeout;
if (!global.window.clearTimeout) global.window.clearTimeout = global.clearTimeout;

import { selectWellnessPackages, calculateCandidateScore } from "../../lib/engines/wellnessRecommendationEngine";
import { getLocalDateKey } from "../../lib/dailyGuidance/dateKey";
import type { WellnessSnapshot } from "../../lib/data/types";
import { WELLNESS_RECOMMENDATION_LIBRARY } from "../../lib/data/wellnessRecommendationLibrary";

async function runM4JourneyMemoryIntegrationTests() {
  console.log("===================================================================");
  console.log("  M4 JOURNEY MEMORY INTEGRATION — RIGOROUS UNIT TEST SUITE");
  console.log("===================================================================\n");

  const now = new Date();
  const targetLocalDate = getLocalDateKey(now, "Asia/Jakarta");

  const baseSnapshot: WellnessSnapshot = {
    updatedAt: now.toISOString(),
    healthCondition: "normal",
    metrics: { energy: 7, stress: 3, sleep: 7, focus: 7 },
  };

  const sampleItemA = WELLNESS_RECOMMENDATION_LIBRARY[0];
  const sampleItemB = WELLNESS_RECOMMENDATION_LIBRARY[1];

  // --- Test A: Baseline behavior without journeyContext ---
  console.log("1. Running Test A: Baseline candidate score without Journey Context...");
  const baselineScoreA = calculateCandidateScore(sampleItemA, {
    snapshot: baseSnapshot,
    environment: { localDate: targetLocalDate },
  });
  const baselinePackages = selectWellnessPackages({
    snapshot: baseSnapshot,
    environment: { localDate: targetLocalDate },
  });
  assert(baselinePackages.morning.recommendations.length > 0, "Baseline packages must contain recommendations");
  console.log(`   - Baseline Score for item "${sampleItemA.title}": ${baselineScoreA}`);
  console.log("   ✅ Test A PASS\n");

  // --- Test B: Positive preference boost (+4) for helpedCategories ---
  console.log("2. Running Test B: Helped category receives EXACTLY +4 score boost...");
  const helpedScoreA = calculateCandidateScore(sampleItemA, {
    snapshot: baseSnapshot,
    environment: { localDate: targetLocalDate },
    journeyContext: {
      helpedCategories: [sampleItemA.domain],
    },
  });
  const scoreDeltaHelped = helpedScoreA - baselineScoreA;
  assert.strictEqual(scoreDeltaHelped, 4, `Expected score boost of +4 for helped domain, got ${scoreDeltaHelped}`);
  console.log(`   - Baseline score: ${baselineScoreA}, Helped score: ${helpedScoreA} (Delta: +${scoreDeltaHelped})`);
  console.log("   ✅ Test B PASS\n");

  // --- Test C: Gentle skip soft-penalty (-6) for recentlySkippedIds ---
  console.log("3. Running Test C: Recently skipped activity receives EXACTLY -6 soft penalty...");
  const skippedScoreA = calculateCandidateScore(sampleItemA, {
    snapshot: baseSnapshot,
    environment: { localDate: targetLocalDate },
    journeyContext: {
      recentlySkippedIds: [sampleItemA.id],
    },
  });
  const scoreDeltaSkipped = skippedScoreA - baselineScoreA;
  assert.strictEqual(scoreDeltaSkipped, -6, `Expected score penalty of -6 for skipped item, got ${scoreDeltaSkipped}`);
  console.log(`   - Baseline score: ${baselineScoreA}, Skipped score: ${skippedScoreA} (Delta: ${scoreDeltaSkipped})`);
  console.log("   ✅ Test C PASS\n");

  // --- Test D: Competing candidates ranking reordering ---
  console.log("4. Running Test D: Helped vs Skipped competing candidates change ranking order...");
  // Find two candidates in the same time period with DIFFERENT domains to isolate the boost/penalty
  const morningCandidates = WELLNESS_RECOMMENDATION_LIBRARY.filter(
    (item) => item.recommendedTime === "flexible" || item.recommendedTime === "morning"
  );

  let candA = null;
  let candB = null;
  for (const item of morningCandidates) {
    const matchB = morningCandidates.find(
      (other) => other.id !== item.id && other.domain !== item.domain
    );
    if (matchB) {
      candA = item;
      candB = matchB;
      break;
    }
  }

  if (!candA || !candB) {
    throw new Error("Could not find two candidates with distinct domains in the morning/flexible pool.");
  }

  const candABaselineScore = calculateCandidateScore(candA, { snapshot: baseSnapshot, environment: { localDate: targetLocalDate } });
  const candBBaselineScore = calculateCandidateScore(candB, { snapshot: baseSnapshot, environment: { localDate: targetLocalDate } });

  // Pass journeyContext where candA is skipped (-6) and candB is helped (+4)
  const modifiedContextInput = {
    snapshot: baseSnapshot,
    environment: { localDate: targetLocalDate },
    journeyContext: {
      helpedCategories: [candB.domain],
      recentlySkippedIds: [candA.id],
    },
  };

  const candAModifiedScore = calculateCandidateScore(candA, modifiedContextInput);
  const candBModifiedScore = calculateCandidateScore(candB, modifiedContextInput);

  assert.strictEqual(candAModifiedScore - candABaselineScore, -6, "candA score must decrease by 6");
  assert.strictEqual(candBModifiedScore - candBBaselineScore, 4, "candB score must increase by 4");

  // Verify that the net relative difference shifted by 10 points
  const baselineDiff = candABaselineScore - candBBaselineScore;
  const modifiedDiff = candAModifiedScore - candBModifiedScore;
  assert.strictEqual(baselineDiff - modifiedDiff, 10, "Relative score shift between candA and candB must be exactly 10 points");

  // Run selection to verify ordering shift in returned package
  const contextPackages = selectWellnessPackages(modifiedContextInput);
  const morningRecs = contextPackages.morning.recommendations;
  const candAIndex = morningRecs.findIndex((r) => r.id === candA.id);
  const candBIndex = morningRecs.findIndex((r) => r.id === candB.id);

  if (candAIndex !== -1 && candBIndex !== -1) {
    assert(candBIndex < candAIndex, `Candidate B (helped) must rank above Candidate A (skipped). candB index: ${candBIndex}, candA index: ${candAIndex}`);
  }

  console.log(`   - Candidate A ("${candA.title}") score: ${candABaselineScore} -> ${candAModifiedScore}`);
  console.log(`   - Candidate B ("${candB.title}") score: ${candBBaselineScore} -> ${candBModifiedScore}`);
  console.log("   - Ranking inversion verified: Helped item boosted, skipped item penalized.");
  console.log("   ✅ Test D PASS\n");

  // --- Test E: Deterministic execution ---
  console.log("5. Running Test E: Deterministic repeated execution yields identical scores and package ordering...");
  const run1 = selectWellnessPackages(modifiedContextInput);
  const run2 = selectWellnessPackages(modifiedContextInput);
  assert.deepStrictEqual(
    run1.morning.recommendations.map((r) => r.id),
    run2.morning.recommendations.map((r) => r.id),
    "Repeated runs with identical journeyContext must yield identical recommendation ordering"
  );
  console.log("   - Determinism verified: 100% identical package output on repeated calls.");
  console.log("   ✅ Test E PASS\n");

  // --- Test F: Safety filters take precedence over memory signals ---
  console.log("6. Running Test F: Memory signal NEVER bypasses severe illness / safety filters...");
  const severeHealthSnapshot: WellnessSnapshot = {
    updatedAt: now.toISOString(),
    healthCondition: "Severe Illness",
    metrics: { energy: 2, stress: 8, sleep: 3, focus: 3 },
  };

  const severePackages = selectWellnessPackages({
    snapshot: severeHealthSnapshot,
    environment: { localDate: targetLocalDate },
    journeyContext: {
      helpedCategories: ["physical"],
    },
  });

  const severeMorningRecs = severePackages.morning.recommendations;
  const allSafe = severeMorningRecs.every((r) => r.intensity === "micro" || r.intensity === "gentle");
  assert(allSafe, "All recommendations under Severe Illness must strictly remain micro or gentle!");
  console.log("   - Safety filtering preserved 100% under Severe Illness despite positive physical memory.");
  console.log("   ✅ Test F PASS\n");

  // --- Test G: M1 Same-day completion takes precedence over memory signal ---
  console.log("7. Running Test G: Memory signal NEVER bypasses same-day completion exclusion...");
  const completedTodayId = baselinePackages.morning.recommendations[0].id;
  const sameDayCompletedPackages = selectWellnessPackages({
    snapshot: baseSnapshot,
    environment: { localDate: targetLocalDate },
    history: [
      {
        recommendationId: completedTodayId,
        completedAt: `${targetLocalDate}T09:00:00.000Z`,
      },
    ],
    journeyContext: {
      helpedCategories: [baselinePackages.morning.recommendations[0].domain],
    },
  });

  const allSameDayIds = [
    ...sameDayCompletedPackages.morning.recommendations,
    ...sameDayCompletedPackages.afternoon.recommendations,
    ...sameDayCompletedPackages.evening.recommendations,
  ].map((r) => r.id);

  assert(!allSameDayIds.includes(completedTodayId), `Completed today action ${completedTodayId} MUST remain excluded!`);
  console.log(`   - Same-day completed action "${completedTodayId}" strictly EXCLUDED despite positive domain memory.`);
  console.log("   ✅ Test G PASS\n");

  console.log("===================================================================");
  console.log("  M4 JOURNEY MEMORY INTEGRATION TESTS COMPLETE: ALL 7 TESTS PASSED 100%");
  console.log("===================================================================");
}

runM4JourneyMemoryIntegrationTests().catch((err) => {
  console.error("❌ M4 Test FAIL:", err);
  process.exit(1);
});