/**
 * DEFECT-2A-2 regression — user-path ownership on {userId}-keyed collections.
 * Real Firebase Web SDK + Firestore/Auth emulator + real firestore.rules.
 * Two synthetic anonymous identities. Hard-fail (exit non-zero on any miss).
 * No production project id, no real user data.
 */
import assert from "node:assert/strict";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { deleteApp } from "firebase/app";
import { createAuthenticatedUserDb, clearEmulatorFirestoreData } from "../helpers/dailyGuidanceEmulatorHelper";

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

  await clearEmulatorFirestoreData();
  await deleteApp(A.app).catch(() => {});
  await deleteApp(B.app).catch(() => {});

  console.log("\n" + log.join("\n"));
  console.log(`\nFIRESTORE_OWNER_ISOLATION ${failed === 0 ? "PASS" : "FAIL"} passed=${passed} failed=${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("FIRESTORE_OWNER_ISOLATION_FAIL", err instanceof Error ? err.stack || err.message : String(err));
  process.exit(1);
});
