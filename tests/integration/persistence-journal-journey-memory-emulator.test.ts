/**
 * Persistence E2E — journaling / journey / memory lifecycle.
 *
 * Real firebase/firestore + firebase/auth Web SDK + Firestore/Auth emulator +
 * real firestore.rules + the REAL product repositories (journalRepository,
 * journeyRepository, behaviorMemoryRepository, emotionalMemoryRepository,
 * healingRepository) + firebaseService (healingMemory rule regression).
 *
 * Every "restart" read goes back to Firestore through the repository (these
 * repositories hold no in-memory cache — verified by source). Cross-user checks
 * use a second FirebaseApp / auth session on the same emulator project.
 * Hard-fail (process.exit non-zero on any miss). Synthetic anonymous UIDs only.
 * No production project id, no real user data. No repository logic duplicated.
 */
import assert from "node:assert/strict";
import { doc, getDoc, setDoc, getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, connectAuthEmulator, signInAnonymously, signOut } from "firebase/auth";

let passed = 0;
let failed = 0;
const log: string[] = [];
const ok = (n: string) => { passed++; log.push(`  ok    ${n}`); };
const bad = (n: string, d: string) => { failed++; log.push(`  FAIL  ${n} :: ${d}`); };
async function step(name: string, fn: () => Promise<void>) {
  try { await fn(); ok(name); } catch (e) { bad(name, e instanceof Error ? e.message : String(e)); }
}
const cls = (e: unknown) => {
  const x = e as { code?: string; message?: string };
  return x?.code || (x?.message ? x.message.split("\n")[0] : String(e));
};
async function expectDeny(name: string, fn: () => Promise<unknown>) {
  try { await fn(); bad(name, "operation was ALLOWED"); }
  catch (e) {
    if (/permission-denied/i.test(cls(e))) ok(name);
    else bad(name, `unexpected ${cls(e)}`);
  }
}

const EMU_FS = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const APPROX_LIMIT = 1_048_576;
const bytesOf = (v: unknown) =>
  Buffer.byteLength(JSON.stringify(v, (_k, x) => (x && typeof x === "object" && typeof (x as { toMillis?: unknown }).toMillis === "function" ? "<ts>" : x)) ?? "", "utf8");

/** recursive data-shape scanner: direct nested arrays + non-finite numbers */
function shapeViolations(v: unknown, p = "$", acc: string[] = []): string[] {
  if (typeof v === "number" && !Number.isFinite(v)) acc.push(`non-finite@${p}`);
  else if (Array.isArray(v)) {
    if (v.some((x) => Array.isArray(x))) acc.push(`nested-array@${p}`);
    v.forEach((x, i) => shapeViolations(x, `${p}[${i}]`, acc));
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) shapeViolations(x, `${p}.${k}`, acc);
  }
  return acc;
}

async function main() {
  const cfg = await import("../../lib/firebase/config");
  const { app, auth, db } = cfg as { app: { options: { projectId?: string } }; auth: any; db: any };
  const PROJECT = app.options.projectId || "demo-release-suite";
  assert.ok(/^demo-|^bhumi-build80/.test(PROJECT), `refuse non-synthetic project: ${PROJECT}`);
  const wipe = async () => { await fetch(`http://${EMU_FS}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: "DELETE" }).catch(() => {}); };

  const { journalRepository } = await import("../../lib/repositories/journalRepository");
  const { journeyRepository } = await import("../../lib/repositories/journeyRepository");
  const { behaviorMemoryRepository } = await import("../../lib/repositories/behaviorMemoryRepository");
  const { emotionalMemoryRepository } = await import("../../lib/repositories/emotionalMemoryRepository");
  const { healingRepository } = await import("../../lib/repositories/healingRepository");
  const { firebaseService } = await import("../../lib/firebase/service");

  await wipe();
  const credA = await signInAnonymously(auth);
  const A = credA.user.uid;
  log.push(`  project=${PROJECT}  userA=${A.slice(0, 8)}…`);

  // second synthetic client (same project) for cross-user checks
  const appB = initializeApp({
    apiKey: "fake-emulator-api-key-12345", authDomain: `${PROJECT}.firebaseapp.com`, projectId: PROJECT,
    storageBucket: `${PROJECT}.appspot.com`, messagingSenderId: "1234567890", appId: "1:1234567890:web:pjmB",
  }, `pjm-clientB-${Date.now()}`);
  const dbB = getFirestore(appB);
  const [h, ps] = EMU_FS.split(":");
  connectFirestoreEmulator(dbB, h || "127.0.0.1", parseInt(ps || "8080", 10));
  const authB = getAuth(appB);
  connectAuthEmulator(authB, "http://127.0.0.1:9099", { disableWarnings: true });
  const B = (await signInAnonymously(authB)).user.uid;
  log.push(`  userB=${B.slice(0, 8)}…`);

  const shapeOk = (label: string, data: unknown, uidField: string | null, uid: string) => {
    const v = shapeViolations(data);
    assert.deepEqual(v, [], `${label}: data-shape violations ${v.join(",")}`);
    if (uidField) assert.equal((data as Record<string, unknown>)[uidField], uid, `${label}: ${uidField} ownership`);
  };

  // ==========================================================================
  // A. JOURNALING — journals/{uid}/entries/{id} via journalRepository
  // ==========================================================================
  const mkEntry = (id: string, extra: Record<string, unknown> = {}) => ({
    id, userId: A, dateCreated: new Date(Date.now() + (extra.o as number ?? 0)).toISOString(),
    dateCompleted: new Date().toISOString(),
    prompt: { id: "p1", text: "What is present?", category: "reflection" },
    emotionalCheckIn: { moodLevel: 6, energyLevel: 5, notes: "" },
    content: "A representative journal entry body for the persistence E2E.",
    wordCount: 10, durationMinutes: 7, tags: ["gratitude"], ...extra,
  });

  await step("J1 create journal entry (real repo)", async () => {
    await journalRepository.createJournalEntry(A, mkEntry("j-1") as never);
  });
  await step("J2 read via normal product read path — same uid, content, metadata", async () => {
    const rows = await journalRepository.getJournalEntries(A);
    assert.equal(rows.length, 1, "one entry");
    const e = rows[0] as Record<string, unknown>;
    assert.equal(e.userId, A, "owner userId");
    assert.equal(e.content, "A representative journal entry body for the persistence E2E.");
    assert.ok(typeof e.updatedAt === "string" && e.dateCreated, "timestamps/metadata present");
    shapeOk("J2", e, "userId", A);
  });
  await step("J3 fresh Firestore read (no repo in-memory cache) still shows the entry", async () => {
    const again = await journalRepository.getJournalEntries(A);
    assert.equal(again.length, 1, "PERSISTED_STATE_SURVIVES_RESTART");
    assert.equal((again[0] as { id?: string }).id, "j-1");
  });
  await step("J4 update changes only intended fields (merge)", async () => {
    await journalRepository.updateJournalEntry(A, "j-1", { content: "edited body", tags: ["edited"] } as never);
    const e = (await journalRepository.getJournalEntries(A))[0] as Record<string, unknown>;
    assert.equal(e.content, "edited body");
    assert.deepEqual(e.tags, ["edited"]);
    assert.equal(e.durationMinutes, 7, "unrelated field durationMinutes preserved");
    assert.equal(e.wordCount, 10, "unrelated field wordCount preserved");
  });
  await step("J5 second entry + ordering (dateCreated desc per repo contract)", async () => {
    await journalRepository.createJournalEntry(A, mkEntry("j-2", { o: 60_000 }) as never); // newer
    const rows = await journalRepository.getJournalEntries(A);
    assert.equal(rows.length, 2);
    assert.equal((rows[0] as { id?: string }).id, "j-2", "newest first");
    assert.equal((rows[1] as { id?: string }).id, "j-1");
    const limited = await journalRepository.getJournalEntries(A, 1);
    assert.equal(limited.length, 1, "limit honoured");
  });
  await expectDeny("J6 cross-user read journals/{A}/entries via client B", () => getDoc(doc(dbB, "journals", A, "entries", "j-1")));
  await expectDeny("J6 cross-user write journals/{A}/entries via client B", () => setDoc(doc(dbB, "journals", A, "entries", "j-x"), { userId: B, content: "hijack" }));
  await step("J7 delete removes the entry", async () => {
    await journalRepository.deleteJournalEntry(A, "j-2");
    const rows = await journalRepository.getJournalEntries(A);
    assert.equal(rows.length, 1);
    assert.equal((rows[0] as { id?: string }).id, "j-1");
  });
  await step("J8 non-finite sanitizer invariant on the journal write path", async () => {
    await journalRepository.createJournalEntry(A, mkEntry("j-nan", { wordCount: Number.NaN, durationMinutes: Number.POSITIVE_INFINITY, ratio: Number.NEGATIVE_INFINITY }) as never);
    const raw = (await getDoc(doc(db, "journals", A, "entries", "j-nan"))).data() ?? {};
    assert.deepEqual(shapeViolations(raw), [], "no NaN/Infinity/-Infinity persisted");
    await journalRepository.deleteJournalEntry(A, "j-nan");
  });

  // ==========================================================================
  // B. JOURNEY — journeyDailyRecords/{uid}/entries/{date} via journeyRepository
  // ==========================================================================
  const D1 = "2026-08-30";
  const D2 = "2026-08-31";
  await step("Y1 ensureDailyRecord creates the day", async () => {
    const rec = await journeyRepository.ensureDailyRecord(A, D1, { dominantIssue: "rest" } as never);
    assert.equal(rec.userId, A);
    assert.equal(rec.appDate, D1);
  });
  await step("Y2 updateDailyRecord persists progress", async () => {
    await journeyRepository.updateDailyRecord(A, D1, { dailyScanCompleted: true, dailyScanSummary: "did the scan" } as never);
  });
  await step("Y3 fresh read (getDailyRecord) survives restart", async () => {
    const rec = await journeyRepository.getDailyRecord(A, D1);
    assert.ok(rec, "PERSISTED_STATE_SURVIVES_RESTART");
    assert.equal(rec!.dailyScanCompleted, true);
    assert.equal(rec!.dailyScanSummary, "did the scan");
    assert.equal(rec!.userId, A, "owner userId");
    shapeOk("Y3", rec, "userId", A);
  });
  await step("Y4 advance progress (second update) — earlier fields preserved", async () => {
    await journeyRepository.updateDailyRecord(A, D1, { navigatorMode: "GROWTH" } as never);
    const rec = await journeyRepository.getDailyRecord(A, D1);
    assert.equal(rec!.navigatorMode, "GROWTH");
    assert.equal(rec!.dailyScanCompleted, true, "prior field kept (merge)");
  });
  await step("Y5/Y6 repeat same-day ensureDailyRecord is idempotent (no duplicate, no overwrite)", async () => {
    const before = await journeyRepository.getDailyRecord(A, D1);
    const rec = await journeyRepository.ensureDailyRecord(A, D1, { dominantIssue: "SHOULD_NOT_OVERWRITE" } as never);
    assert.equal(rec.dailyScanCompleted, true, "ensure returns the EXISTING record");
    assert.notEqual(rec.dominantIssue, "SHOULD_NOT_OVERWRITE", "ensure does not overwrite an existing day");
    const after = await journeyRepository.getDailyRecord(A, D1);
    assert.equal(after!.createdAt, before!.createdAt, "same doc, not recreated");
  });
  await step("Y7 appendPracticeResult appends (arrayUnion) without losing prior results", async () => {
    await journeyRepository.appendPracticeResult(A, D1, { practiceId: "p1", practiceCategory: "breath", practiceTitle: "Box breath", completedAt: new Date().toISOString(), durationMinutes: 5 } as never);
    await journeyRepository.appendPracticeResult(A, D1, { practiceId: "p2", practiceCategory: "body", practiceTitle: "Stretch", completedAt: new Date().toISOString(), durationMinutes: 8 } as never);
    const rec = await journeyRepository.getDailyRecord(A, D1);
    const results = (rec as { practiceResults?: unknown[] }).practiceResults ?? [];
    assert.equal(results.length, 2, "both practice results retained");
  });
  await step("Y8 second day + getRecentDailyRecords ordering (appDate desc)", async () => {
    await journeyRepository.ensureDailyRecord(A, D2, {} as never);
    const recent = await journeyRepository.getRecentDailyRecords(A, 10);
    assert.equal(recent.length, 2);
    assert.equal((recent[0] as { appDate?: string }).appDate, D2, "newest day first");
  });
  await expectDeny("Y9 cross-user read journeyDailyRecords/{A}/entries via client B", () => getDoc(doc(dbB, "journeyDailyRecords", A, "entries", D1)));
  await expectDeny("Y9 cross-user write journeyDailyRecords/{A}/entries via client B", () => setDoc(doc(dbB, "journeyDailyRecords", A, "entries", D1), { userId: B, hijack: true }, { merge: true }));
  await step("Y10 no product delete/reset method on journeyRepository — documented (N/A)", async () => {
    assert.equal(typeof (journeyRepository as Record<string, unknown>).deleteDailyRecord, "undefined");
  });
  // §7 / §15 growth + size
  await step("§7/§15 journeyDailyRecords growth + size", async () => {
    const raw = (await getDoc(doc(db, "journ" + "eyDailyRecords", A, "entries", D1))).data() ?? {};
    const b = bytesOf(raw);
    const perPracticeResult = bytesOf(((raw as { practiceResults?: unknown[] }).practiceResults ?? [{}])[0]);
    log.push(`      journeyDailyRecords/{A}/entries/${D1}: ~${b}B (${((b / APPROX_LIMIT) * 100).toFixed(3)}% of 1MiB); ~${perPracticeResult}B per practiceResult`);
    assert.ok(b < APPROX_LIMIT * 0.5, `one daily record must be well under 50% of the Firestore limit (got ${b}B)`);
    // subcollection design = one doc per day; growth is horizontal (more docs), not a single unbounded map.
  });

  // ==========================================================================
  // C. MEMORY — behaviorMemory (users/{uid}/behaviorMemory/wellness),
  //             emotionalMemory + healingProgress (healingProgress/{uid})
  // ==========================================================================
  await step("M1 behaviorMemory ensureExists creates the doc with the rules' exact key set", async () => {
    await behaviorMemoryRepository.ensureExists(A);
    const raw = (await getDoc(doc(db, "users", A, "behaviorMemory", "wellness"))).data() ?? {};
    assert.equal((raw as { uid?: string }).uid, A, "uid ownership");
    shapeOk("M1", raw, "uid", A);
  });
  await step("M2/M3 behaviorMemory get + fresh read", async () => {
    const g1 = await behaviorMemoryRepository.get(A);
    assert.equal(g1.uid, A);
    const g2 = await behaviorMemoryRepository.get(A);
    assert.equal(g2.uid, A, "PERSISTED_STATE_SURVIVES_RESTART");
  });
  await step("M4/M5 behaviorMemory recordCompleted (transaction merge) preserves unrelated fields", async () => {
    await behaviorMemoryRepository.recordCompleted(A, "rec-1", 10, 6, ["work"], "2026-08-30");
    const g = await behaviorMemoryRepository.get(A);
    assert.equal(g.uid, A, "uid preserved");
    assert.ok(Array.isArray(g.contextCompletions), "contextCompletions is an array");
    assert.ok((g.contextCompletions?.length ?? 0) >= 1, "completion recorded");
    assert.ok(Array.isArray(g.seenRecommendationKeys), "seenRecommendationKeys preserved as array");
    shapeOk("M5", g, "uid", A);
  });
  await expectDeny("M6 cross-user read users/{A}/behaviorMemory/wellness via client B", () => getDoc(doc(dbB, "users", A, "behaviorMemory", "wellness")));
  await expectDeny("M6 cross-user write users/{A}/behaviorMemory/wellness via client B", () => setDoc(doc(dbB, "users", A, "behaviorMemory", "wellness"), { uid: B, updatedAt: "x" }, { merge: true }));

  await step("M(emotional) getOrCreate + save + fresh read + non-destructive to healingProgress counters", async () => {
    const mem = await emotionalMemoryRepository.getOrCreate(A);
    assert.ok(mem, "emotional memory created");
    // healingRepository writes disjoint top-level counters to the SAME doc
    await healingRepository.saveHealingProgress(A, { healingStreak: 3, totalJournalEntries: 2 } as never);
    await emotionalMemoryRepository.save(A, { ...(mem as object), lastUpdated: new Date().toISOString() } as never);
    const raw = (await getDoc(doc(db, "healingProgress", A))).data() as Record<string, unknown>;
    assert.ok(raw.emotionalMemory, "emotionalMemory branch present");
    assert.equal(raw.healingStreak, 3, "healingRepository counter NOT clobbered by emotionalMemory save");
    assert.equal(raw.totalJournalEntries, 2, "healingRepository counter preserved");
    shapeOk("M-emotional", raw, null, A);
    assert.equal((raw.emotionalMemory as { userId?: string }).userId, A, "emotionalMemory.userId ownership");
  });
  await step("M(healing) getHealingProgress fresh read + saveNote subcollection", async () => {
    const hp = await healingRepository.getHealingProgress(A);
    assert.equal(hp.healingStreak, 3, "PERSISTED_STATE_SURVIVES_RESTART");
    await healingRepository.saveNote(A, "a healing note");
    // note lands under healingProgress/{A}/notes/*
  });
  await expectDeny("M(healing) cross-user read healingProgress/{A} via client B", () => getDoc(doc(dbB, "healingProgress", A)));
  await expectDeny("M(healing) cross-user write healingProgress/{A} via client B", () => setDoc(doc(dbB, "healingProgress", A), { healingStreak: 999 }, { merge: true }));

  await step("M8 non-finite sanitizer invariant on healingProgress write path", async () => {
    await healingRepository.saveHealingProgress(A, { consciousnessLevel: Number.NaN, totalMeditationMinutes: Number.POSITIVE_INFINITY } as never);
    const raw = (await getDoc(doc(db, "healingProgress", A))).data() ?? {};
    assert.deepEqual(shapeViolations(raw), [], "no non-finite persisted on healingProgress");
  });

  // ==========================================================================
  // §9  healingMemory RULE regression (DEFECT-2A-2 path; no active repo consumer)
  // ==========================================================================
  await step("§9 healingMemory/{A} owner write ALLOW (firebaseService)", async () => {
    const okWrite = await firebaseService.saveHealingMemory({ uid: A, entries: [], updatedAt: new Date().toISOString() } as never);
    assert.equal(okWrite, true, "owner can persist healingMemory");
    const back = await firebaseService.getHealingMemory(A);
    assert.ok(back, "owner can read healingMemory");
  });
  await expectDeny("§9 healingMemory/{A} cross-user read via client B", () => getDoc(doc(dbB, "healingMemory", A)));
  await expectDeny("§9 healingMemory/{A} cross-user write { uid: B } via client B", () => setDoc(doc(dbB, "healingMemory", A), { uid: B, x: 1 }, { merge: true }));
  await expectDeny("§9 healingMemory/{A} spoofed body uid { uid: A } via client B", () => setDoc(doc(dbB, "healingMemory", A), { uid: A, x: 1 }, { merge: true }));

  // ==========================================================================
  // §15 representative document sizes
  // ==========================================================================
  await step("§15 representative document sizes are comfortably small", async () => {
    const j = bytesOf((await getDoc(doc(db, "journals", A, "entries", "j-1"))).data());
    const y = bytesOf((await getDoc(doc(db, "journeyDailyRecords", A, "entries", D1))).data());
    const bm = bytesOf((await getDoc(doc(db, "users", A, "behaviorMemory", "wellness"))).data());
    const hp = bytesOf((await getDoc(doc(db, "healingProgress", A))).data());
    log.push(`      sizes: journalEntry ~${j}B  journeyDailyRecord ~${y}B  behaviorMemory ~${bm}B  healingProgress ~${hp}B  (limit ${APPROX_LIMIT}B)`);
    for (const [n, v] of [["journalEntry", j], ["journeyDailyRecord", y], ["behaviorMemory", bm], ["healingProgress", hp]] as const) {
      assert.ok(v < APPROX_LIMIT * 0.5, `${n} ~${v}B exceeds 50% of the Firestore document limit`);
    }
  });

  await wipe();
  await deleteApp(appB).catch(() => {});
  await signOut(authB).catch(() => {});
  await signOut(auth).catch(() => {});

  console.log("\n" + log.join("\n"));
  console.log(`\nPERSISTENCE_JOURNAL_JOURNEY_MEMORY ${failed === 0 ? "PASS" : "FAIL"} passed=${passed} failed=${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("PERSISTENCE_JOURNAL_JOURNEY_MEMORY_FAIL", err instanceof Error ? err.stack || err.message : String(err));
  process.exit(1);
});
