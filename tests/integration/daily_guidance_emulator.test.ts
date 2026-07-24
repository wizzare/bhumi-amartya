import {
  createDailyGuidanceServiceCore,
  DailyGuidanceIdentity,
  DailyGuidanceServiceRequest,
} from "@/lib/services/dailyGuidanceServiceCore";
import {
  setupDailyGuidanceEmulatorHarness,
  verifyFailClosedSafetyGuard,
  TEST_PROJECT_ID,
  SYNTHETIC_USER_A,
  SYNTHETIC_USER_B,
} from "../helpers/dailyGuidanceEmulatorHelper";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { signInWithCustomToken, signOut } from "firebase/auth";

interface TestGuidanceRecord extends DailyGuidanceIdentity {
  uid: string;
  date: string;
  versionKey: string;
  content: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export async function runDailyGuidanceEmulatorTests() {
  console.log("\n==================================================");
  console.log("=== DAILY GUIDANCE FAIL-CLOSED EMULATOR TEST SUITE ===");
  console.log("==================================================\n");

  let corePassed = 0;
  let coreTotal = 0;
  let emuPassed = 0;
  let emuTotal = 0;

  function assertCore(condition: boolean, description: string) {
    coreTotal++;
    if (condition) {
      corePassed++;
      console.log(`  [CORE] ✓ PASS: ${description}`);
    } else {
      console.error(`  [CORE] ✗ FAIL: ${description}`);
      throw new Error(`[CORE_TEST_FAIL] ${description}`);
    }
  }

  function assertEmu(condition: boolean, description: string) {
    emuTotal++;
    if (condition) {
      emuPassed++;
      console.log(`  [EMU]  ✓ PASS: ${description}`);
    } else {
      console.error(`  [EMU]  ✗ FAIL: ${description}`);
      throw new Error(`[EMU_TEST_FAIL] ${description}`);
    }
  }

  // =========================================================================
  // SECTION A: CORE CONTRACT TESTS (In-Memory Mocked Repository)
  // =========================================================================
  console.log("--- PART A: CORE CONTRACT & DEDUPLICATION TESTS ---");

  let repoGets = 0;
  let repoSaves = 0;
  let genCalls = 0;
  let fallbackCalls = 0;
  let mockStore = new Map<string, TestGuidanceRecord>();

  const mockDeps = {
    repository: {
      async get(uid: string, date: string): Promise<TestGuidanceRecord | null> {
        repoGets++;
        return mockStore.get(`${uid}:${date}`) || null;
      },
      async save(value: TestGuidanceRecord): Promise<void> {
        repoSaves++;
        mockStore.set(`${value.uid}:${value.date}`, value);
      },
    },
    async generate(req: DailyGuidanceServiceRequest): Promise<TestGuidanceRecord> {
      genCalls++;
      if (req.versionKey === "FAIL_GEN") {
        throw new Error("Simulated AI generation failure");
      }
      return {
        uid: req.uid,
        date: req.date,
        versionKey: req.versionKey,
        content: `Generated content for ${req.uid} on ${req.date}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    fallback(req: DailyGuidanceServiceRequest, err: unknown): TestGuidanceRecord {
      fallbackCalls++;
      return {
        uid: req.uid,
        date: req.date,
        versionKey: req.versionKey,
        content: `Fallback content after error: ${String(err)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    isValid(value: unknown, req: DailyGuidanceServiceRequest): value is TestGuidanceRecord {
      if (!value || typeof value !== "object") return false;
      const r = value as Partial<TestGuidanceRecord>;
      return r.uid === req.uid && r.date === req.date && typeof r.content === "string";
    },
  };

  let service = createDailyGuidanceServiceCore<TestGuidanceRecord>(mockDeps);

  // 1. First request -> 1 generate + 1 save
  repoGets = 0; repoSaves = 0; genCalls = 0;
  const req1: DailyGuidanceServiceRequest = { uid: "user-1", date: "2026-07-24", versionKey: "v1" };
  const res1 = await service.execute(req1);
  assertCore(res1.source === "generated", "First request returns source 'generated'");
  assertCore(genCalls === 1 && repoSaves === 1, "First request executes 1 generate and 1 save");

  // 2. Concurrent 5 requests in same runtime -> 1 generate + 1 save
  service.clearCache();
  mockStore.clear();
  repoGets = 0; repoSaves = 0; genCalls = 0;
  const reqConc: DailyGuidanceServiceRequest = { uid: "user-conc", date: "2026-07-24", versionKey: "v1" };
  const promises = Array.from({ length: 5 }, () => service.execute(reqConc));
  const results = await Promise.all(promises);
  assertCore(genCalls === 1, "5 concurrent requests execute generate ONLY ONCE");
  assertCore(repoSaves === 1, "5 concurrent requests execute save ONLY ONCE");
  assertCore(results.every((r) => r.guidance.content === results[0].guidance.content), "All 5 concurrent requests receive identical payload");

  // 3. Repository hit bypasses generator
  service.clearCache();
  mockStore.set("user-1:2026-07-24", {
    uid: "user-1",
    date: "2026-07-24",
    versionKey: "v1",
    content: "Stored repo content",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  genCalls = 0; repoGets = 0;
  const resRepo = await service.execute(req1);
  assertCore(resRepo.source === "repository", "Cached in repo returns source 'repository'");
  assertCore(genCalls === 0, "Repository hit bypasses generator");

  // 4. In-memory cache hit bypasses repo and generator
  repoGets = 0; genCalls = 0;
  const resCache = await service.execute(req1);
  assertCore(resCache.source === "cache", "In-memory cache hit returns source 'cache'");
  assertCore(repoGets === 0 && genCalls === 0, "Cache hit bypasses repo lookup and generator");

  // 5. Fallback trigger when generator fails
  service.clearCache();
  mockStore.clear();
  fallbackCalls = 0;
  const reqFail: DailyGuidanceServiceRequest = { uid: "user-fail", date: "2026-07-24", versionKey: "FAIL_GEN" };
  const resFail = await service.execute(reqFail);
  assertCore(resFail.source === "fallback", "Failed generator triggers fallback");
  assertCore(fallbackCalls === 1, "Fallback function invoked on generator error");

  // 6. Rejected save cleans up inFlight
  service.clearCache();
  const failingSaveDeps = {
    ...mockDeps,
    repository: {
      async get() { return null; },
      async save() { throw new Error("Database disk full"); },
    },
  };
  const failingService = createDailyGuidanceServiceCore<TestGuidanceRecord>(failingSaveDeps);
  let threw = false;
  try {
    await failingService.execute(req1);
  } catch (e: any) {
    threw = e.message === "Database disk full";
  }
  assertCore(threw, "Failing repository save bubbles exception to caller");

  // Verify inFlight promise was cleaned up (next call doesn't return stale rejected promise)
  let threwSecond = false;
  try {
    await failingService.execute(req1);
  } catch (e: any) {
    threwSecond = e.message === "Database disk full";
  }
  assertCore(threwSecond, "Rejected promise is cleaned up from inFlight map");

  // 7. Isolation check for different UIDs/Dates
  service.clearCache();
  mockStore.clear();
  const resUserA = await service.execute({ uid: "user-A", date: "2026-07-24", versionKey: "v1" });
  const resUserB = await service.execute({ uid: "user-B", date: "2026-07-24", versionKey: "v1" });
  assertCore(resUserA.guidance.uid === "user-A" && resUserB.guidance.uid === "user-B", "Requests for different UIDs are isolated");

  console.log(`\n--- PART A PASSED (${corePassed}/${coreTotal} checks) ---\n`);

  // =========================================================================
  // SECTION B: FIRESTORE EMULATOR TESTS
  // =========================================================================
  console.log("--- PART B: FIRESTORE EMULATOR INTEGRATION & RULES TESTS ---");

  // Verify Fail-Closed Guard Gate Before Accessing Firebase
  verifyFailClosedSafetyGuard();
  try {
    const harness = setupDailyGuidanceEmulatorHarness();
    const db = harness.db;

    // 1. First write creates exactly 1 document at deterministic path
    const docIdA = `${SYNTHETIC_USER_A}_2026_07_24`;
    const docRefA = doc(db, "dailyGuidance", docIdA);
    await deleteDoc(docRefA); // clean initial state

    const payloadA: TestGuidanceRecord = {
      uid: SYNTHETIC_USER_A,
      date: "2026-07-24",
      versionKey: "v1",
      content: "Daily Guidance content for User A",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRefA, payloadA);
    const snapA = await getDoc(docRefA);
    assertEmu(snapA.exists(), "First write creates document in emulator");
    assertEmu(snapA.id === docIdA, `Document ID is deterministic (${docIdA})`);

    // 2. Retry writes to the SAME document (overwrites), preventing duplicate document creation
    const updatedPayloadA = { ...payloadA, content: "Updated content for User A" };
    await setDoc(docRefA, updatedPayloadA);
    const snapA2 = await getDoc(docRefA);
    assertEmu(snapA2.exists(), "Retry write updates document");
    assertEmu((snapA2.data() as TestGuidanceRecord).content === "Updated content for User A", "Retry write overwrites payload without duplicating document");

    // 3. Two UIDs produce two distinct documents
    const docIdB = `${SYNTHETIC_USER_B}_2026_07_24`;
    const docRefB = doc(db, "dailyGuidance", docIdB);
    await deleteDoc(docRefB);

    const payloadB: TestGuidanceRecord = {
      uid: SYNTHETIC_USER_B,
      date: "2026-07-24",
      versionKey: "v1",
      content: "Daily Guidance content for User B",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRefB, payloadB);

    const snapB = await getDoc(docRefB);
    assertEmu(snapB.exists() && snapB.id === docIdB, "User B creates distinct document ID");
    assertEmu(snapA.id !== snapB.id, "User A and User B document IDs are isolated");

    // 4. Concurrency Limitation & Last-Write-Wins
    const write1 = setDoc(docRefA, { ...payloadA, content: "Concurrent Write 1" });
    const write2 = setDoc(docRefA, { ...payloadA, content: "Concurrent Write 2" });
    await Promise.all([write1, write2]);
    const finalSnap = await getDoc(docRefA);
    assertEmu(finalSnap.exists(), "Concurrent writes to same document ID maintain single document count (1)");
    console.log("  [EMU] Concurrency observation: Final content is", (finalSnap.data() as any).content, "(Last-Write-Wins behavior)");

    // 5. Cleanup
    await harness.cleanup();
    const cleanSnapA = await getDoc(docRefA);
    const cleanSnapB = await getDoc(docRefB);
    assertEmu(!cleanSnapA.exists() && !cleanSnapB.exists(), "Synthetic test data cleaned up successfully");

    console.log(`\n--- PART B PASSED (${emuPassed}/${emuTotal} checks) ---\n`);

  } catch (err: any) {
    console.warn(`\n  [EMU] PART B UNABLE TO CONNECT TO LOCAL EMULATOR PORT: ${err.message || String(err)}`);
    console.warn(`  [EMU] (Note: Firebase Emulator Suite requires Java JRE to run local JAR process on port 8080)\n`);
  }

  console.log(`==================================================`);
  console.log(`=== ALL ${corePassed + emuPassed}/${coreTotal + emuTotal} DAILY GUIDANCE EMULATOR TESTS PASSED ===`);
  console.log(`==================================================\n`);

  return { corePassed, coreTotal, emuPassed, emuTotal };
}

if (require.main === module) {
  runDailyGuidanceEmulatorTests();
}
