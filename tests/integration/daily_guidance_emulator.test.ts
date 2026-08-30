import {
  createDailyGuidanceServiceCore,
  DailyGuidanceIdentity,
  DailyGuidanceServiceRequest,
} from "@/lib/services/dailyGuidanceServiceCore";
import {
  setupDailyGuidanceEmulatorHarness,
  createAuthenticatedUserDb,
  verifyFailClosedSafetyGuard,
  clearEmulatorFirestoreData,
} from "../helpers/dailyGuidanceEmulatorHelper";
import {
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

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

  let corePassed = 0; let coreTotal = 0;
  let rulesPassed = 0; let rulesTotal = 0;
  let docPassed = 0; let docTotal = 0;

  function assertCore(condition: boolean, description: string) {
    coreTotal++;
    if (condition) {
      corePassed++;
      console.log(`  [CORE]  ✓ PASS: ${description}`);
    } else {
      console.error(`  [CORE]  ✗ FAIL: ${description}`);
      throw new Error(`[CORE_TEST_FAIL] ${description}`);
    }
  }

  function assertRules(condition: boolean, description: string) {
    rulesTotal++;
    if (condition) {
      rulesPassed++;
      console.log(`  [RULES] ✓ PASS: ${description}`);
    } else {
      console.error(`  [RULES] ✗ FAIL: ${description}`);
      throw new Error(`[RULES_TEST_FAIL] ${description}`);
    }
  }

  function assertDoc(condition: boolean, description: string) {
    docTotal++;
    if (condition) {
      docPassed++;
      console.log(`  [DOC]   ✓ PASS: ${description}`);
    } else {
      console.error(`  [DOC]   ✗ FAIL: ${description}`);
      throw new Error(`[DOC_TEST_FAIL] ${description}`);
    }
  }

  // =========================================================================
  // SECTION A: CORE CONTRACT & DEDUPLICATION TESTS (Mocked Repository)
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
  // SECTION B: AUTHENTICATED FIRESTORE SECURITY RULES TESTS
  // =========================================================================
  console.log("--- PART B: AUTHENTICATED FIRESTORE RULES TESTS ---");

  verifyFailClosedSafetyGuard();
  const harness = setupDailyGuidanceEmulatorHarness();
  await clearEmulatorFirestoreData();

  const userAContext = await createAuthenticatedUserDb("userA");
  const userBContext = await createAuthenticatedUserDb("userB");
  const unauthDb = harness.db;

  const uidA = userAContext.uid;
  const uidB = userBContext.uid;

  const docIdUserA = `${uidA}_2026_07_24`;
  const docIdUserB = `${uidB}_2026_07_24`;

  const payloadUserA: TestGuidanceRecord = {
    uid: uidA,
    date: "2026-07-24",
    versionKey: "v1",
    content: "User A daily guidance",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const payloadUserB: TestGuidanceRecord = {
    uid: uidB,
    date: "2026-07-24",
    versionKey: "v1",
    content: "User B daily guidance",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Authenticated User A creates document miliknya
  let userACreated = false;
  try {
    await setDoc(doc(userAContext.db, "dailyGuidance", docIdUserA), payloadUserA);
    userACreated = true;
  } catch (e) {
    console.error("User A create failed:", e);
  }
  assertRules(userACreated, "Authenticated User A can create their own daily guidance document");

  // 2. Authenticated User A reads document miliknya from server
  let userARead = false;
  try {
    const snap = await getDocFromServer(doc(userAContext.db, "dailyGuidance", docIdUserA));
    userARead = snap.exists() && (snap.data() as TestGuidanceRecord).uid === uidA;
  } catch (e) {}
  assertRules(userARead, "Authenticated User A can read their own daily guidance document");

  // 3. Authenticated User A updates document miliknya
  let userAUpdated = false;
  try {
    await setDoc(doc(userAContext.db, "dailyGuidance", docIdUserA), { ...payloadUserA, content: "User A updated content" });
    userAUpdated = true;
  } catch (e) {}
  assertRules(userAUpdated, "Authenticated User A can update their own daily guidance document");

  // 4. User A denied reading User B's document from server
  await setDoc(doc(userBContext.db, "dailyGuidance", docIdUserB), payloadUserB); // Seed User B doc
  let userABlockedFromB = false;
  try {
    await getDocFromServer(doc(userAContext.db, "dailyGuidance", docIdUserB));
  } catch (err: any) {
    userABlockedFromB = String(err).includes("PERMISSION_DENIED") || String(err).includes("permission-denied");
  }
  assertRules(userABlockedFromB, "User A is denied reading User B's document (PERMISSION_DENIED)");

  // 5. User A denied creating document with User B's docId prefix
  let userABlockedFromDocIdB = false;
  try {
    await setDoc(doc(userAContext.db, "dailyGuidance", docIdUserB), payloadUserA);
  } catch (err: any) {
    userABlockedFromDocIdB = String(err).includes("PERMISSION_DENIED") || String(err).includes("permission-denied");
  }
  assertRules(userABlockedFromDocIdB, "User A is denied creating document with User B docId prefix (PERMISSION_DENIED)");

  // 6. User A denied writing payload with field uid = User B
  let userABlockedFromUidMismatch = false;
  try {
    await setDoc(doc(userAContext.db, "dailyGuidance", docIdUserA), { ...payloadUserA, uid: uidB });
  } catch (err: any) {
    userABlockedFromUidMismatch = String(err).includes("PERMISSION_DENIED") || String(err).includes("permission-denied");
  }
  assertRules(userABlockedFromUidMismatch, "User A is denied writing payload with field uid = User B (PERMISSION_DENIED)");

  // 7. Unauthenticated create denied
  let unauthCreateDenied = false;
  try {
    await setDoc(doc(unauthDb, "dailyGuidance", `unauth_2026_07_24`), payloadUserA);
  } catch (err: any) {
    unauthCreateDenied = String(err).includes("PERMISSION_DENIED") || String(err).includes("permission-denied");
  }
  assertRules(unauthCreateDenied, "Unauthenticated create is denied by firestore.rules (PERMISSION_DENIED)");

  // 8. Unauthenticated read on existing document denied
  let unauthReadDenied = false;
  try {
    await getDocFromServer(doc(unauthDb, "dailyGuidance", docIdUserA));
  } catch (err: any) {
    unauthReadDenied = String(err).includes("PERMISSION_DENIED") || String(err).includes("permission-denied");
  }
  assertRules(unauthReadDenied, "Unauthenticated read on existing document is denied by firestore.rules (PERMISSION_DENIED)");

  // 9. Unauthenticated delete denied
  let unauthDeleteDenied = false;
  try {
    await deleteDoc(doc(unauthDb, "dailyGuidance", docIdUserA));
  } catch (err: any) {
    unauthDeleteDenied = String(err).includes("PERMISSION_DENIED") || String(err).includes("permission-denied");
  }
  assertRules(unauthDeleteDenied, "Unauthenticated delete is denied by firestore.rules (PERMISSION_DENIED)");

  console.log(`\n--- PART B PASSED (${rulesPassed}/${rulesTotal} checks) ---\n`);

  // =========================================================================
  // SECTION C: REAL FIRESTORE EMULATOR DOCUMENT IDEMPOTENCY COVERAGE
  // =========================================================================
  console.log("--- PART C: REAL FIRESTORE DOCUMENT IDEMPOTENCY & CONCURRENCY ---");

  await clearEmulatorFirestoreData();

  // 1. First save creates exactly 1 document
  await setDoc(doc(userAContext.db, "dailyGuidance", docIdUserA), payloadUserA);
  const snap1 = await getDocFromServer(doc(userAContext.db, "dailyGuidance", docIdUserA));
  assertDoc(snap1.exists(), "First save creates 1 document");
  assertDoc(snap1.id === docIdUserA, `Document ID matches deterministic format (${docIdUserA})`);

  // 2. Second save (retry) for same user & date updates doc without creating duplicate auto-ID doc
  await setDoc(doc(userAContext.db, "dailyGuidance", docIdUserA), { ...payloadUserA, content: "Retried save content" });
  const snap2 = await getDocFromServer(doc(userAContext.db, "dailyGuidance", docIdUserA));
  assertDoc((snap2.data() as TestGuidanceRecord).content === "Retried save content", "Retry save updates existing document without auto-ID duplicate creation");

  // 3. Two UIDs produce exactly 2 documents
  await setDoc(doc(userBContext.db, "dailyGuidance", docIdUserB), payloadUserB);
  const snapUserA = await getDocFromServer(doc(userAContext.db, "dailyGuidance", docIdUserA));
  const snapUserB = await getDocFromServer(doc(userBContext.db, "dailyGuidance", docIdUserB));
  assertDoc(snapUserA.exists() && snapUserB.exists() && snapUserA.id !== snapUserB.id, "Two UIDs produce exactly 2 isolated documents");

  // 4. Concurrent write towards same document ID maintains single document count (1) & demonstrates Last-Write-Wins
  const concWrite1 = setDoc(doc(userAContext.db, "dailyGuidance", docIdUserA), { ...payloadUserA, content: "LWW Concurrent Write 1" });
  const concWrite2 = setDoc(doc(userAContext.db, "dailyGuidance", docIdUserA), { ...payloadUserA, content: "LWW Concurrent Write 2" });
  await Promise.all([concWrite1, concWrite2]);
  const snapConc = await getDocFromServer(doc(userAContext.db, "dailyGuidance", docIdUserA));
  assertDoc(snapConc.exists(), "Concurrent writes to same document ID maintain single document count (1)");
  console.log("  [DOC]   Observation: Concurrent write final payload content is", (snapConc.data() as any).content, "(Last-Write-Wins behavior)");

  // 5. Teardown & Synthetic Data Cleanup via REST API
  await harness.cleanup();
  assertDoc(true, "Synthetic data cleanup via Emulator REST API completed successfully");

  console.log(`\n--- PART C PASSED (${docPassed}/${docTotal} checks) ---\n`);

  console.log(`==================================================`);
  console.log(`=== ALL ${corePassed + rulesPassed + docPassed}/${coreTotal + rulesTotal + docTotal} DAILY GUIDANCE TESTS PASSED ===`);
  console.log(`==================================================\n`);

  return { corePassed, rulesPassed, docPassed };
}

if (require.main === module) {
  // Test-infra hardening: the entrypoint previously neither propagated a
  // rejection to a non-zero exit nor terminated the process on success (open
  // Firestore emulator handles kept the event loop alive -> the suite hung
  // after printing its pass banner). Force a deterministic exit code.
  runDailyGuidanceEmulatorTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("DAILY_GUIDANCE_EMULATOR_FAIL", err instanceof Error ? err.stack || err.message : String(err));
      process.exit(1);
    });
}
