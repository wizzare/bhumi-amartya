import assert from "assert";

// Setup mock window/localStorage for local audit store prior to importing modules
const storage = new Map<string, string>();
storage.set("bhumi_audit_user", "test-user-hotfix004");

(global as any).window = {
  localStorage: {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, val: string) => storage.set(key, val),
    removeItem: (key: string) => storage.delete(key),
  },
};
process.env.NODE_ENV = "development";

async function testSection3CompletionSyncsToJourney() {
  console.log("▶ Running HOTFIX-004 Test: Section 3 completion syncs to Journey...");

  const { acknowledgeWellnessActivity } = await import("../lib/services/wellnessCurationService.js");
  const { journeyRepository } = await import("../lib/repositories/journeyRepository.js");

  const testUid = "test-user-hotfix004_uid";
  const testDate = "2026-07-20";
  const activityId = "rec_body_hydration_01";

  // 1. Initial State
  const initialRecord = await journeyRepository.getDailyRecord(testUid, testDate);
  const initialRecs = (initialRecord?.wellnessState?.wellnessV4 as any)?.recommendations;
  assert(!initialRecs?.[activityId], "Activity should not exist initially in Journey");

  // 2. Complete Section 3 Activity
  await acknowledgeWellnessActivity(testUid, testDate, activityId);

  // 3. Verify Journey Daily Record updated
  const updatedRecord = await journeyRepository.getDailyRecord(testUid, testDate);
  const updatedRecs = (updatedRecord?.wellnessState?.wellnessV4 as any)?.recommendations;
  const recMemory = updatedRecs?.[activityId];

  assert(recMemory !== undefined, "Recommendation memory must be recorded in Journey daily record");
  assert(recMemory?.completed === true, "Recommendation must be marked completed");
  assert(recMemory?.acknowledged === true, "Recommendation must be marked acknowledged");
  assert(typeof recMemory?.completedAt === "string", "completedAt timestamp must be recorded");

  // 4. Test Idempotency (Retry)
  const initialCompletedAt = recMemory.completedAt;
  await acknowledgeWellnessActivity(testUid, testDate, activityId);

  const retryRecord = await journeyRepository.getDailyRecord(testUid, testDate);
  const retryRecs = (retryRecord?.wellnessState?.wellnessV4 as any)?.recommendations;
  const retryRecMemory = retryRecs?.[activityId];

  assert(retryRecMemory?.completedAt === initialCompletedAt, "Retry must preserve original completedAt timestamp (idempotent)");

  console.log("✅ HOTFIX-004 Test PASS: Section 3 completion successfully synced to Journey with idempotency!");
}

testSection3CompletionSyncsToJourney().catch((err) => {
  console.error("❌ HOTFIX-004 Test FAIL:", err);
  process.exit(1);
});
