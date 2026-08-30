/**
 * DEFECT-2A-1 — real Firebase Web SDK + Firestore/Auth emulator + real firestore.rules.
 *
 * Proves:
 *   1. The SDK itself accepts a raw non-finite number (NaN / Infinity / -Infinity)
 *      and readback returns it -> Firestore is NOT a backstop.
 *   2. The SAME logical payload routed through the real sanitizeForFirestore
 *      persists with NO non-finite number anywhere (canonical policy: object
 *      property omitted, array element -> null).
 *   3. Representative sanitized repository payloads (users / journalEntries /
 *      journeyDailyRecords / dailyStates / notifications) write successfully and
 *      read back free of non-finite numbers, with finite siblings intact.
 *
 * Synthetic anonymous identity only. Hard-fail (exit non-zero on any miss).
 * No production project id, no real user data, no repository code touched.
 */
import assert from "node:assert/strict";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { deleteApp } from "firebase/app";
import { createAuthenticatedUserDb, clearEmulatorFirestoreData } from "../helpers/dailyGuidanceEmulatorHelper";
import { sanitizeForFirestore } from "../../lib/firebase/sanitizeForFirestore";

let passed = 0;
let failed = 0;
const log: string[] = [];
function ok(name: string) { passed++; log.push(`  ok   ${name}`); }
function bad(name: string, detail: string) { failed++; log.push(`  FAIL ${name} :: ${detail}`); }

/** First path to a non-finite JS number in a readback value, or null. */
function firstNonFinite(value: unknown, p = "$"): string | null {
  if (typeof value === "number") return Number.isFinite(value) ? null : p;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = firstNonFinite(value[i], `${p}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const hit = firstNonFinite(v, `${p}.${k}`);
      if (hit) return hit;
    }
  }
  return null;
}

async function main() {
  await clearEmulatorFirestoreData();
  const A = await createAuthenticatedUserDb("sanitizer-a");
  const now = Timestamp.now();

  // ----------------------------------------------------------------------------
  // §9  RAW NEGATIVE CONTROL — the SDK accepts non-finite numbers unaided.
  //     Dedicated doc (blueprints/{uid}); NOT reused by the §10 fixtures.
  // ----------------------------------------------------------------------------
  const rawRef = doc(A.db, "blueprints", A.uid);
  let rawWrite = "ACCEPTED";
  try {
    await setDoc(rawRef, { uid: A.uid, rawNaN: Number.NaN, rawInf: Number.POSITIVE_INFINITY, rawNegInf: Number.NEGATIVE_INFINITY });
  } catch (e) {
    rawWrite = `REJECTED:${(e as { code?: string; message?: string })?.code || (e as Error)?.message}`;
  }
  log.push(`  RAW_NONFINITE_WRITE = ${rawWrite}`);
  if (rawWrite === "ACCEPTED") {
    ok("§9 raw setDoc({NaN,Infinity,-Infinity}) accepted by the SDK");
    const back = (await getDoc(rawRef)).data() ?? {};
    for (const k of ["rawNaN", "rawInf", "rawNegInf"] as const) {
      const v = (back as Record<string, unknown>)[k];
      log.push(`  raw readback ${k}: typeof=${typeof v} value=${String(v)} finite=${typeof v === "number" ? Number.isFinite(v) : "n/a"}`);
    }
    const rawHit = firstNonFinite(back);
    if (rawHit) ok("§9 raw readback still contains a non-finite number (Firestore is not a backstop)");
    else bad("§9 raw readback", "expected a non-finite number to persist unaided, found none");
  } else {
    // If a future SDK/emulator rejects it, the defect surface is already closed there;
    // record it but do not fail the sanitizer proof.
    ok(`§9 raw non-finite write ${rawWrite} (SDK already rejects; sanitizer proof continues)`);
  }

  // ----------------------------------------------------------------------------
  // §9  SANITIZED CONTROL — same logical payload, routed through sanitizeForFirestore.
  // ----------------------------------------------------------------------------
  const sanRef = doc(A.db, "journeyDailyRecords", A.uid);
  const sanitizedPayload = sanitizeForFirestore({
    uid: A.uid,
    nan: Number.NaN,
    inf: Number.POSITIVE_INFINITY,
    ninf: Number.NEGATIVE_INFINITY,
    arr: [1, Number.NaN, 3, Number.POSITIVE_INFINITY],
    nested: { deepNaN: Number.NaN, keep: 7 },
    goodFloat: 0.25,
    goodZero: 0,
  });
  await setDoc(sanRef, sanitizedPayload);
  const sanBack = (await getDoc(sanRef)).data() ?? {};
  const sanHit = firstNonFinite(sanBack);
  log.push(`  SANITIZED_NONFINITE_PRESENT = ${sanHit ? `YES@${sanHit}` : "NO"}`);
  if (!sanHit) ok("§9 sanitized readback contains NO non-finite number");
  else bad("§9 sanitized readback", `non-finite survived at ${sanHit}`);
  // policy assertions on the readback
  try {
    assert.equal("nan" in sanBack, false, "nan property must be omitted");
    assert.equal("inf" in sanBack, false, "inf property must be omitted");
    assert.equal("ninf" in sanBack, false, "ninf property must be omitted");
    assert.deepEqual((sanBack as { arr?: unknown }).arr, [1, null, 3, null], "non-finite array elements -> null, length preserved");
    assert.deepEqual((sanBack as { nested?: unknown }).nested, { keep: 7 }, "deep non-finite omitted, sibling kept");
    assert.equal((sanBack as { goodFloat?: number }).goodFloat, 0.25, "finite float preserved");
    assert.equal((sanBack as { goodZero?: number }).goodZero, 0, "zero preserved");
    ok("§9 sanitized readback matches canonical policy (omit prop / null array element / keep finite)");
  } catch (e) {
    bad("§9 sanitized policy", (e as Error).message);
  }

  // ----------------------------------------------------------------------------
  // §10  REPRESENTATIVE REPOSITORY PAYLOADS — inject non-finite into synthetic
  //      numeric fields, sanitize, write with owner auth, read back clean.
  // ----------------------------------------------------------------------------
  const fixtures: Array<{ label: string; ref: ReturnType<typeof doc>; raw: Record<string, unknown>; expectFinite: Record<string, number> }> = [
    {
      label: "users",
      ref: doc(A.db, "users", A.uid),
      raw: { uid: A.uid, displayName: "Synthetic", latitude: -7.4478, longitude: 112.7183, auditScore: Number.NaN, auditRatio: Number.POSITIVE_INFINITY, auditDelta: Number.NEGATIVE_INFINITY, goodInt: 3, updatedAt: now },
      expectFinite: { latitude: -7.4478, longitude: 112.7183, goodInt: 3 },
    },
    {
      label: "journalEntries",
      ref: doc(A.db, "journalEntries", `${A.uid}_2026-08-30`),
      raw: { uid: A.uid, content: "entry", wordCount: Number.NaN, sentimentScore: Number.POSITIVE_INFINITY, goodCount: 6, createdAt: now },
      expectFinite: { goodCount: 6 },
    },
    {
      label: "journeyDailyRecords",
      ref: doc(A.db, "journeyDailyRecords", A.uid),
      raw: { uid: A.uid, lastDateKey: "2026-08-30", streak: Number.NaN, completionRatio: Number.POSITIVE_INFINITY, goodStreak: 4, updatedAt: now },
      expectFinite: { goodStreak: 4 },
    },
    {
      label: "dailyStates",
      ref: doc(A.db, "dailyStates", A.uid),
      raw: { uid: A.uid, date: "2026-08-30", momentum: Number.NEGATIVE_INFINITY, score: Number.NaN, goodStreak: 2, updatedAt: now },
      expectFinite: { goodStreak: 2 },
    },
    {
      label: "notifications",
      ref: doc(A.db, "notifications", A.uid),
      raw: { uid: A.uid, enabled: true, quietScore: Number.NaN, cadenceRatio: Number.POSITIVE_INFINITY, goodHour: 22, updatedAt: now },
      expectFinite: { goodHour: 22 },
    },
  ];

  for (const f of fixtures) {
    try {
      await setDoc(f.ref, sanitizeForFirestore({ ...f.raw }), { merge: true });
    } catch (e) {
      bad(`§10 ${f.label} write`, (e as { code?: string })?.code || (e as Error).message);
      continue;
    }
    const back = (await getDoc(f.ref)).data() ?? {};
    const hit = firstNonFinite(back);
    if (hit) { bad(`§10 ${f.label} readback`, `non-finite at ${hit}`); continue; }
    let finiteOk = true;
    for (const [k, v] of Object.entries(f.expectFinite)) {
      if ((back as Record<string, unknown>)[k] !== v) { finiteOk = false; bad(`§10 ${f.label} finite field ${k}`, `expected ${v}, got ${String((back as Record<string, unknown>)[k])}`); }
    }
    for (const k of ["auditScore", "auditRatio", "auditDelta", "wordCount", "sentimentScore", "streak", "completionRatio", "momentum", "score", "quietScore", "cadenceRatio"]) {
      if (k in (f.raw as object) && k in back) { finiteOk = false; bad(`§10 ${f.label} field ${k}`, "non-finite property was persisted, expected omitted"); }
    }
    if (finiteOk) ok(`§10 ${f.label}: sanitized write accepted, readback free of non-finite, finite siblings intact`);
  }

  await clearEmulatorFirestoreData();
  await deleteApp(A.app).catch(() => {});

  console.log("\n" + log.join("\n"));
  console.log(`\nFIRESTORE_SANITIZER_EMULATOR ${failed === 0 ? "PASS" : "FAIL"} passed=${passed} failed=${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("FIRESTORE_SANITIZER_EMULATOR_FAIL", err instanceof Error ? err.stack || err.message : String(err));
  process.exit(1);
});
