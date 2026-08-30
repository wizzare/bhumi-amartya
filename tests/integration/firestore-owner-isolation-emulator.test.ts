/**
 * DEFECT-2A-2 regression — user-path ownership on {userId}-keyed collections,
 * plus PRODUCTION-PRESERVED rule blocks re-added during the 2026-08-26 rules
 * reconciliation (fcmTokens, telemetry_events, journalMemoryCandidates) whose
 * live contracts must not silently regress on the next repo->prod deploy.
 * Real Firebase Web SDK + Firestore/Auth emulator + real firestore.rules.
 * Two synthetic anonymous identities + one unauthenticated client.
 * Hard-fail (exit non-zero on any miss). No production project id, no real user data.
 */
import assert from "node:assert/strict";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import {
  createAuthenticatedUserDb,
  clearEmulatorFirestoreData,
  TEST_PROJECT_ID,
  EXPECTED_FIRESTORE_PORT,
} from "../helpers/dailyGuidanceEmulatorHelper";

/** Unauthenticated Firestore client on the same synthetic project (request.auth == null). */
function createUnauthenticatedDb() {
  const app = initializeApp(
    { apiKey: "fake-emulator-api-key-12345", projectId: TEST_PROJECT_ID, appId: "1:1234567890:web:abcdef123456" },
    `unauth-app-${Date.now()}-${Math.random()}`,
  );
  const db = getFirestore(app);
  const hostEnv = process.env.FIRESTORE_EMULATOR_HOST || `127.0.0.1:${EXPECTED_FIRESTORE_PORT}`;
  const [host, portStr] = hostEnv.split(":");
  connectFirestoreEmulator(db, host || "127.0.0.1", parseInt(portStr || "8080", 10));
  return { app, db };
}

const cls = (e: unknown) => {
  const x = e as { code?: string; message?: string };
  return x?.code || (x?.message ? x.message.split("\n")[0] : String(e));
};

let passed = 0;
let failed = 0;
const log: string[] = [];
async function expectAllow(name: string, fn: () => Promise<unknown>) {
  try { await fn(); passed++; log.push(`  ALLOW ok   ${name}`); }
  catch (e) { failed++; log.push(`  ALLOW FAIL ${name} :: ${cls(e)}`); }
}
async function expectDeny(name: string, fn: () => Promise<unknown>) {
  try { await fn(); failed++; log.push(`  DENY  FAIL ${name} :: operation was ALLOWED`); }
  catch (e) {
    if (/permission-denied/i.test(cls(e))) { passed++; log.push(`  DENY  ok   ${name}`); }
    else { failed++; log.push(`  DENY  FAIL ${name} :: unexpected ${cls(e)}`); }
  }
}

const USER_KEYED = ["notifications", "healingMemory", "journeyData"] as const;

async function main() {
  await clearEmulatorFirestoreData();
  const A = await createAuthenticatedUserDb("iso-a");
  const B = await createAuthenticatedUserDb("iso-b");
  const now = Timestamp.now();
  const aDoc = (c: string, db = A.db) => doc(db, c, A.uid);

  for (const c of USER_KEYED) {
    // ---- owner (A) matrix ----
    await expectAllow(`A1 ${c}/{A} create own`, () => setDoc(aDoc(c), { uid: A.uid, v: 1, updatedAt: now }));
    await expectAllow(`A2 ${c}/{A} read own`, async () => {
      const s = await getDoc(aDoc(c));
      assert.equal(s.exists(), true);
    });
    await expectAllow(`A3 ${c}/{A} update own`, () => updateDoc(aDoc(c), { v: 2 }));
    // A4 delete: current contract is allow write (which includes delete) for owner
    await expectAllow(`A4 ${c}/{A} delete own (current contract)`, () => deleteDoc(aDoc(c)));
    // re-create for the cross-user tests
    await setDoc(aDoc(c), { uid: A.uid, ownerSecret: "A-only", updatedAt: now });

    // ---- cross-user (B) matrix — all must DENY ----
    await expectDeny(`B1 ${c}/{A} B read`, () => getDoc(aDoc(c, B.db)));
    await expectDeny(`B2 ${c}/{A} B write { uid: B }`, () => setDoc(aDoc(c, B.db), { uid: B.uid, x: 1 }, { merge: true }));
    await expectDeny(`B3 ${c}/{A} B write { uid: A }`, () => setDoc(aDoc(c, B.db), { uid: A.uid, x: 1 }, { merge: true }));
    await expectDeny(`B4 ${c}/{A} B merge`, () => setDoc(aDoc(c, B.db), { hijack: true }, { merge: true }));
    await expectDeny(`B5 ${c}/{A} B update uid->B`, () => updateDoc(aDoc(c, B.db), { uid: B.uid }));
    await expectDeny(`B6 ${c}/{A} B delete`, () => deleteDoc(aDoc(c, B.db)));

    // owner doc must be intact and still owned by A
    const after = await getDoc(aDoc(c));
    assert.equal(after.exists(), true, `${c}/{A} lost after cross-user attempts`);
    assert.equal((after.data() as { uid?: string }).uid, A.uid, `${c}/{A} uid was mutated by user B`);
    assert.equal((after.data() as { hijack?: unknown }).hijack, undefined, `${c}/{A} accepted B's injected field`);
  }

  // ---- §7 regression: arbitrary-docId collection where uidMatches("uid") is legitimate ----
  await expectAllow("§7 journalEntries body-uid==caller write allowed", () =>
    setDoc(doc(A.db, "journalEntries", `${A.uid}_j1`), { uid: A.uid, content: "x", createdAt: now }));
  await expectAllow("§7 journalEntries owner read", async () => {
    const s = await getDoc(doc(A.db, "journalEntries", `${A.uid}_j1`));
    assert.equal(s.exists(), true);
  });
  await expectDeny("§7 journalEntries B spoof { uid: A } denied", () =>
    setDoc(doc(B.db, "journalEntries", `${A.uid}_j2`), { uid: A.uid, content: "hijack" }));
  await expectDeny("§7 journalEntries B read A's entry denied", () =>
    getDoc(doc(B.db, "journalEntries", `${A.uid}_j1`)));

  // ---- §9 regression: client cannot self-grant protected access fields ----
  const PROTECTED = { membershipType: "PREMIUM", isPremium: true, accessUntil: "2099-01-01", role: "admin", trialStatus: "premium", entitlementSource: "self" };
  await setDoc(doc(A.db, "users", A.uid), { uid: A.uid, setupCompleted: true }, { merge: true });
  await expectDeny("§9 users/{A} self-grant protected fields denied", () =>
    setDoc(doc(A.db, "users", A.uid), { ...PROTECTED }, { merge: true }));
  const userAfter = (await getDoc(doc(A.db, "users", A.uid))).data() ?? {};
  for (const k of Object.keys(PROTECTED)) assert.equal(k in userAfter, false, `protected field ${k} leaked`);

  // ---- §10 regression: blueprint owner isolation unchanged ----
  await expectAllow("§10 blueprints/{A} owner write", () =>
    setDoc(doc(A.db, "blueprints", A.uid), { uid: A.uid, status: "ready", updatedAt: now }, { merge: true }));
  await expectDeny("§10 blueprints/{A} B read denied", () => getDoc(doc(B.db, "blueprints", A.uid)));
  await expectDeny("§10 blueprints/{A} B write denied", () =>
    setDoc(doc(B.db, "blueprints", A.uid), { uid: B.uid }, { merge: true }));

  // ==========================================================================
  // PRODUCTION-PRESERVED BLOCKS — reconciliation guard.
  // These match blocks exist in the live production ruleset and were re-added
  // during rules reconciliation. The contracts asserted below are the CURRENT
  // live contracts (no redesign); they exist so a future repo->prod deploy
  // cannot silently drop the block.
  // ==========================================================================
  console.log(`\nDEFECT_2A2_OWNER_ISOLATION_SUBTOTAL passed=${passed} failed=${failed}`);

  // ---- §11 users/{uid}/fcmTokens/{tokenId} : owner (isOwner(uid)) only ----
  const fcmA = (tid: string, db = A.db) => doc(db, "users", A.uid, "fcmTokens", tid);
  await expectAllow("§11 fcmTokens/{A} A create own", () =>
    setDoc(fcmA("tokA1"), { token: "tok-A-1", platform: "web", updatedAt: now }));
  await expectAllow("§11 fcmTokens/{A} A read own", async () => {
    const s = await getDoc(fcmA("tokA1"));
    assert.equal(s.exists(), true);
  });
  await expectAllow("§11 fcmTokens/{A} A update own", () => updateDoc(fcmA("tokA1"), { token: "tok-A-1b" }));
  await expectAllow("§11 fcmTokens/{A} A delete own", () => deleteDoc(fcmA("tokA1")));
  await setDoc(fcmA("tokA1"), { token: "tok-A-1", platform: "web", updatedAt: now });
  await expectDeny("§11 fcmTokens/{A} B read", () => getDoc(fcmA("tokA1", B.db)));
  await expectDeny("§11 fcmTokens/{A} B create under A", () => setDoc(fcmA("tokB1", B.db), { token: "hijack" }));
  await expectDeny("§11 fcmTokens/{A} B merge", () => setDoc(fcmA("tokA1", B.db), { token: "hijack" }, { merge: true }));
  await expectDeny("§11 fcmTokens/{A} B delete", () => deleteDoc(fcmA("tokA1", B.db)));
  {
    const s = await getDoc(fcmA("tokA1"));
    assert.equal(s.exists(), true, "fcmTokens/{A} lost after cross-user attempts");
    assert.equal((s.data() as { token?: string }).token, "tok-A-1", "fcmTokens/{A} token mutated by user B");
  }

  // ---- §12 telemetry_events/{docId} : pre-auth allowlist + authed lifecycle create; founder-only read ----
  const { app: unauthApp, db: unauthDb } = createUnauthenticatedDb();
  const teReq = { appVersion: "5.0.0", versionCode: 100, platform: "web", timestamp: now };
  await expectAllow("§12 telemetry_events unauth pre-auth create (AUTH_SIGNUP_STARTED, uidHash null)", () =>
    setDoc(doc(unauthDb, "telemetry_events", "te-preauth-1"), { eventType: "AUTH_SIGNUP_STARTED", uidHash: null, ...teReq }));
  await expectDeny("§12 telemetry_events unauth non-allowlist eventType denied", () =>
    setDoc(doc(unauthDb, "telemetry_events", "te-bad-evt"), { eventType: "AUTH_LOGIN_COMPLETED", uidHash: null, ...teReq }));
  await expectDeny("§12 telemetry_events unauth missing required key (platform) denied", () =>
    setDoc(doc(unauthDb, "telemetry_events", "te-missing-key"), {
      eventType: "AUTH_SIGNUP_STARTED", uidHash: null, appVersion: "5.0.0", versionCode: 100, timestamp: now,
    }));
  await expectDeny("§12 telemetry_events unauth extra key outside hasOnly denied", () =>
    setDoc(doc(unauthDb, "telemetry_events", "te-extra-key"), {
      eventType: "AUTH_SIGNUP_STARTED", uidHash: null, ...teReq, injected: "x",
    }));
  await expectDeny("§12 telemetry_events unauth malformed uidHash denied", () =>
    setDoc(doc(unauthDb, "telemetry_events", "te-bad-hash"), { eventType: "AUTH_SIGNUP_STARTED", uidHash: "NOTHEX!!", ...teReq }));
  await expectAllow("§12 telemetry_events authed lifecycle create (8-hex uidHash, any eventType)", () =>
    setDoc(doc(A.db, "telemetry_events", "te-authed-1"), { eventType: "AUTH_LOGIN_COMPLETED", uidHash: "0a1b2c3d", ...teReq }));
  await expectDeny("§12 telemetry_events authed create with null uidHash + non-allowlist eventType denied", () =>
    setDoc(doc(A.db, "telemetry_events", "te-authed-2"), { eventType: "AUTH_LOGIN_COMPLETED", uidHash: null, ...teReq }));
  await expectDeny("§12 telemetry_events non-founder read denied", () =>
    getDoc(doc(A.db, "telemetry_events", "te-preauth-1")));
  await expectDeny("§12 telemetry_events non-founder update denied", () =>
    setDoc(doc(A.db, "telemetry_events", "te-preauth-1"), { platform: "tampered" }, { merge: true }));
  await deleteApp(unauthApp).catch(() => {});

  // ---- §13 journalMemoryCandidates/{uid} (+ /candidates/{cid}) : owner (isOwner(uid)) only ----
  const jmcA = (db = A.db) => doc(db, "journalMemoryCandidates", A.uid);
  const jmcCand = (cid: string, db = A.db) => doc(db, "journalMemoryCandidates", A.uid, "candidates", cid);
  await expectAllow("§13 journalMemoryCandidates/{A} A write own", () =>
    setDoc(jmcA(), { uid: A.uid, updatedAt: now }, { merge: true }));
  await expectAllow("§13 journalMemoryCandidates/{A} A read own", async () => {
    const s = await getDoc(jmcA());
    assert.equal(s.exists(), true);
  });
  await expectAllow("§13 journalMemoryCandidates/{A}/candidates A write own", () =>
    setDoc(jmcCand("c1"), { text: "candidate", createdAt: now }));
  await expectAllow("§13 journalMemoryCandidates/{A}/candidates A read own", async () => {
    const s = await getDoc(jmcCand("c1"));
    assert.equal(s.exists(), true);
  });
  await expectDeny("§13 journalMemoryCandidates/{A} B read", () => getDoc(jmcA(B.db)));
  await expectDeny("§13 journalMemoryCandidates/{A} B write", () =>
    setDoc(jmcA(B.db), { uid: B.uid, hijack: true }, { merge: true }));
  await expectDeny("§13 journalMemoryCandidates/{A}/candidates B read", () => getDoc(jmcCand("c1", B.db)));
  await expectDeny("§13 journalMemoryCandidates/{A}/candidates B write under A", () =>
    setDoc(jmcCand("c2", B.db), { text: "hijack" }));

  await clearEmulatorFirestoreData();
  await deleteApp(A.app).catch(() => {});
  await deleteApp(B.app).catch(() => {});

  console.log("\n" + log.join("\n"));
  console.log(
    `\nPRODUCTION_PRESERVED_BLOCKS ${failed === 0 ? "PASS" : "FAIL"} ` +
      `(fcmTokens + telemetry_events + journalMemoryCandidates)`,
  );
  console.log(`\nFIRESTORE_OWNER_ISOLATION ${failed === 0 ? "PASS" : "FAIL"} passed=${passed} failed=${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("FIRESTORE_OWNER_ISOLATION_FAIL", err instanceof Error ? err.stack || err.message : String(err));
  process.exit(1);
});
