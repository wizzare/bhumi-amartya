import { recoverUserBlueprint } from "../../lib/engines/blueprintRecoveryEngine";
import { check } from "../helpers/assertHarness";

async function runConcurrentEmulatorTest() {
  console.log("==================================================");
  console.log("EMULATOR TEST: DUAL RUNTIME CONCURRENT RECOVERY");
  console.log("==================================================");

  const testUid = "emulator_concurrent_user_888";
  const mockProfile = {
    uid: testUid,
    fullName: "Concurrent Emulator User",
    birthDate: "1994-03-25",
    birthTime: "14:00",
    birthCity: "Surabaya",
    timezone: "+07:00",
  };

  console.log(`[Runtime 1 & 2] Both runtimes detecting missing blueprint for UID: ${testUid}`);
  
  // Simulate two concurrent runtimes triggering recovery at the exact same millisecond
  const start = Date.now();
  const [result1, result2] = await Promise.all([
    recoverUserBlueprint(testUid, mockProfile),
    recoverUserBlueprint(testUid, mockProfile),
  ]);
  const duration = Date.now() - start;

  console.log(`[Runtime 1 Result] Blueprint type: ${result1.type}, LifePath: ${result1.lifePath.number}`);
  console.log(`[Runtime 2 Result] Blueprint type: ${result2.type}, LifePath: ${result2.lifePath.number}`);
  console.log(`Execution time: ${duration}ms`);

  check(result1 === result2, "FAILED: Runtimes produced different objects or duplicated work.");
  check(result1.humanDesign.status === "pending", "FAILED: HD status must be pending.");

  console.log("\n==================================================");
  console.log("DUAL RUNTIME CONCURRENT RECOVERY TEST PASSED");
  console.log("==================================================");
  process.exit(0);
}

runConcurrentEmulatorTest().catch(err => {
  console.error("Concurrent test error:", err);
  process.exit(1);
});
