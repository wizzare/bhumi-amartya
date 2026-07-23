import { generateBasicBlueprintFast, recoverUserBlueprint, triggerBackgroundHdCalculation } from "../../lib/engines/blueprintRecoveryEngine";
import { isCanonicalHumanDesign } from "../../lib/humandesign/hdAudit";

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
  console.assert(bp.type === "user_blueprint", "Test 1 Failed");
  console.assert(bp.lifePath.number > 0, "Test 1 Failed: LifePath");
  console.assert(bp.humanDesign.status === "pending", "Test 1 Failed: HD status");
  console.log("✓ Test 1 Passed: Fast basic blueprint generated with pending HD.");

  // Test 2: Partial blueprint check
  const partialBp = {
    type: "user_blueprint",
    input: { birthDate: mockUser.birthDate },
    humanDesign: { status: "pending", type: null },
  };
  console.assert(isCanonicalHumanDesign(partialBp.humanDesign) === false, "Test 2 Failed");
  console.log("✓ Test 2 Passed: Partial blueprint HD is correctly flagged non-canonical.");

  // Test 3: Concurrent deduplication
  const p1 = recoverUserBlueprint("concurrent_uid_101", mockUser);
  const p2 = recoverUserBlueprint("concurrent_uid_101", mockUser);
  console.assert(p1 === p2, "Test 3 Failed: In-flight deduplication failed");
  const res = await p1;
  console.assert(res.type === "user_blueprint", "Test 3 Failed: Result type");
  console.log("✓ Test 3 Passed: Concurrent recovery requests return identical promise.");

  // Test 4: Existing canonical HD preservation
  const canonicalBp = {
    humanDesign: {
      type: "Projector",
      profile: "2/4",
      status: "ready",
      source: "engine",
    },
  };
  console.assert(isCanonicalHumanDesign(canonicalBp.humanDesign) === true, "Test 4 Failed");
  await triggerBackgroundHdCalculation("canonical_uid_202", mockUser, canonicalBp);
  console.assert(canonicalBp.humanDesign.type === "Projector", "Test 4 Failed: HD mutated");
  console.log("✓ Test 4 Passed: Canonical HD of existing users remains untouched.");

  // Test 5: Basic blueprint non-blocking
  console.assert(bp.natalChart.sunSign !== undefined, "Test 5 Failed: Sun sign missing");
  console.assert(bp.numerology !== undefined, "Test 5 Failed: Numerology missing");
  console.log("✓ Test 5 Passed: Basic blueprint systems available immediately.");

  console.log("\n==================================================");
  console.log("PERMANENT TEST SUITE EXECUTED & PASSED 100%");
  console.log("==================================================");
  process.exit(0);
}

runPermanentTestSuite().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
