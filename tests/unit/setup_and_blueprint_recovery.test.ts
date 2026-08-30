import { generateBasicBlueprintFast, recoverUserBlueprint, triggerBackgroundHdCalculation } from "../../lib/engines/blueprintRecoveryEngine";
import { isCanonicalHumanDesign, HD_ENGINE_VERSION } from "../../lib/humandesign/hdAudit";
import { check, runSuite } from "../helpers/assertHarness";

async function runPermanentTestSuite() {
  console.log("==================================================");
  console.log("PERMANENT UNIT TEST: SETUP & BLUEPRINT RECOVERY");
  console.log("==================================================");

  const mockUser = {
    uid: "perm_user_test_999",
    fullName: "Permanent Test User",
    email: "permtest@example.com",
    birthDate: "1997-08-20",
    birthTime: "10:15",
    birthCity: "Bandung",
    timezone: "+07:00",
  };

  // Test 1: Complete blueprint fast generation
  const bp = await generateBasicBlueprintFast(mockUser);
  check(bp.type === "user_blueprint", "Test 1 Failed");
  check(bp.lifePath.number > 0, "Test 1 Failed: LifePath");
  check(bp.humanDesign.status === "pending", "Test 1 Failed: HD status");
  console.log("✓ Test 1 Passed: Fast basic blueprint generated with pending HD.");

  // Test 2: Partial blueprint check
  const partialBp = {
    type: "user_blueprint",
    input: { birthDate: mockUser.birthDate },
    humanDesign: { status: "pending", type: null },
  };
  check(isCanonicalHumanDesign(partialBp.humanDesign) === false, "Test 2 Failed");
  console.log("✓ Test 2 Passed: Partial blueprint HD is correctly flagged non-canonical.");

  // Test 3: Concurrent deduplication.
  // NOTE (test-infra hardening): the previous assertion `p1 === p2` checked
  // Promise *reference* identity, which `recoverUserBlueprint` (an `async
  // function`) can never guarantee — every call returns a fresh wrapper promise.
  // The real contract is "concurrent calls do not duplicate work and resolve to
  // the same result"; that is what the in-flight map guarantees and is asserted
  // here. The old check silently failed on every run under non-fatal console.assert.
  const p1 = recoverUserBlueprint("concurrent_uid_101", mockUser);
  const p2 = recoverUserBlueprint("concurrent_uid_101", mockUser);
  const [r1, r2] = await Promise.all([p1, p2]);
  check(r1 === r2, "Test 3 Failed: concurrent recoveries must resolve to the same object (in-flight dedup)");
  check(r1.type === "user_blueprint", "Test 3 Failed: Result type");
  console.log("✓ Test 3 Passed: Concurrent recovery requests are de-duplicated to one result.");

  // Test 4: Existing canonical HD preservation.
  // NOTE (test-infra hardening): the canonical HD contract in lib/humandesign/hdState.ts
  // requires hdEngineVersion === HD_ENGINE_VERSION. The historical fixture omitted it,
  // so `isCanonicalHumanDesign` returned false and the pre-hardening console.assert was
  // silently non-fatal. Fixture updated to a genuinely canonical shape; no product change.
  const canonicalBp = {
    humanDesign: {
      type: "Projector",
      profile: "2/4",
      status: "ready",
      source: "verified-override",
      hdEngineVersion: HD_ENGINE_VERSION,
    },
  };
  check(isCanonicalHumanDesign(canonicalBp.humanDesign) === true, "Test 4 Failed: fixture must be canonical");
  await triggerBackgroundHdCalculation("canonical_uid_202", mockUser, canonicalBp);
  check(canonicalBp.humanDesign.type === "Projector", "Test 4 Failed: HD mutated");
  console.log("✓ Test 4 Passed: Canonical HD of existing users remains untouched.");

  // Test 5: Basic blueprint non-blocking
  check(bp.natalChart.sunSign !== undefined, "Test 5 Failed: Sun sign missing");
  check(bp.numerology !== undefined, "Test 5 Failed: Numerology missing");
  console.log("✓ Test 5 Passed: Basic blueprint systems available immediately.");

  console.log("\n==================================================");
  console.log("PERMANENT TEST SUITE EXECUTED");
  console.log("==================================================");
}

runSuite("setup_and_blueprint_recovery", runPermanentTestSuite);
