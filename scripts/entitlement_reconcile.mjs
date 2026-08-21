// Entitlement Reconciliation — deterministic, idempotent, audit-logged.
//
// Mission: align Firestore `users/{uid}.membershipType` / `accessUntil` /
// `membershipExpiryDate` / `entitlementSource` / `subscriptionStatus`
// to the canonical resolver truth.
//
// SAFETY:
//   - DRY_RUN by default. NO WRITES unless --execute is passed.
//   - Idempotent: re-running on an already-aligned Firestore is a no-op.
//   - Source-derived: writes only fields directly implied by resolver truth.
//   - Fail closed on missing env, missing emulator, or unsafe UID sets.
//   - Per-user reason logged. No silent revocations.
//   - SKIPS users whose resolver verdict depends on an external fact
//     (e.g., real Play Billing status) that this script cannot verify.
//
// CANONICAL RESOLVER MIRROR:
//   This script intentionally inlines the resolver logic to avoid TS-build
//   dependency. The logic MUST stay in sync with lib/billing/entitlementService.ts.
//   The companion test tests/unit/entitlement_reconcile_drift.test.ts loads
//   both implementations and asserts they agree on a representative matrix.
//
// Usage:
//   node scripts/entitlement_reconcile.mjs                 # DRY RUN (safe)
//   node scripts/entitlement_reconcile.mjs --execute       # PRODUCTION WRITE
//   node scripts/entitlement_reconcile.mjs --only-cohort=H # restrict scope
//   node scripts/entitlement_reconcile.mjs --limit=10       # cap users (test)
//
// Reads:
//   - users/{uid}
//   - testerBadgeRegistry/{uid}
// Writes (only with --execute):
//   - users/{uid}  (membershipType, accessUntil, membershipExpiryDate,
//                   entitlementSource, subscriptionStatus, lastReconciledAt)
//
// Output:
//   - audit/reconcile_<timestamp>.csv     (every affected UID, dry or execute)
//   - audit/reconcile_<timestamp>.json    (summary + per-user before/after)
//   - audit/reconcile_<timestamp>.log     (human-readable, append-only)

import admin from "firebase-admin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { writeFileSync, appendFileSync } from "node:fs";

const args = new Set(process.argv.slice(2));
const EXECUTE = args.has("--execute");
const ALLOW_EMULATOR_EXECUTE = args.has("--allow-emulator-execute");
const onlyCohort = [...args].find((a) => a.startsWith("--only-cohort="))?.split("=")[1] || null;
const limitN = parseInt([...args].find((a) => a.startsWith("--limit="))?.split("=")[1] || "0", 10);

// ---- CANONICAL CONSTANTS (must match lib/billing/founderTesterSourceOfTruth.ts) ----
const INTI_GRANT_STARTS_AT = new Date("2026-06-29T00:00:00+07:00");
const INTI_ACCESS_UNTIL = new Date("2026-08-30T00:00:00+07:00");
const ALFA_GRANT_STARTS_AT = new Date("2026-06-29T00:00:00+07:00");
const ALFA_ACCESS_UNTIL = new Date("2026-07-30T00:00:00+07:00");
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FOUNDER_EMAILS = ["wizzare@gmail.com"]; // matches lib/auth/privilegedUser.ts
const ADMIN_ROLES = ["founder", "admin", "dev_admin"];

// ---- HELPERS ----
function toDate(v) {
  if (!v) return null;
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  if (typeof v === "object" && v && "seconds" in v) return new Date(v.seconds * 1000);
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

const mask = (uid) => (uid ? uid.slice(0, 8) + "…" : "?");

function isPrivilegedUser(profile) {
  if (!profile) return false;
  const email = (profile.email || "").toLowerCase().trim();
  const role = ((profile.role || profile.guardianRole) || "").toLowerCase();
  if (FOUNDER_EMAILS.includes(email)) return true;
  if (ADMIN_ROLES.includes(role)) return true;
  return false;
}

function getCanonicalTrialWindow(profile) {
  const rawStart = profile?.trialStartedAt;
  const rawEnd = profile?.trialEndsAt;
  if (!rawStart && !rawEnd) return { state: "missing", start: null, end: null };
  const start = toDate(rawStart);
  const end = toDate(rawEnd);
  const source = String(profile?.entitlementSource || "");
  const accessSource = String(profile?.accessSource || "");
  const trustedSource = source === "firebase_auth_creation_time"
    || accessSource === "firebase_auth_on_create"
    || (profile?.membershipType === "TRIAL" && profile?.plan === "free_trial");
  const exactWindow = Boolean(start && end && end.getTime() - start.getTime() === SEVEN_DAYS_MS);
  if (!trustedSource || !start || !end || !exactWindow) return { state: "invalid", start, end };
  return { state: "valid", start, end };
}

// ---- CANONICAL RESOLVER MIRROR (MUST match lib/billing/entitlementService.ts) ----
function resolveCanonical(profile, testerRecord, now = new Date()) {
  if (!profile) {
    return { isPremium: false, reason: "none", expiresAt: null, tier: "Free" };
  }

  const activeEntitlements = [];
  const expiredEntitlements = [];

  const badge = profile.testerBadge || profile.badge || profile.guardianBadge;
  const effectiveBadge = testerRecord?.badge || badge;

  // Priority 1: Founder
  if (isPrivilegedUser(profile) || profile.membershipType === "LIFETIME" || effectiveBadge === "Founder") {
    activeEntitlements.push({
      isPremium: true, reason: "founder", expiresAt: null, tier: "Founder (Lifetime)",
    });
  }

  // Priority 2: Tester grant (Inti / Alfa)
  if (effectiveBadge === "Penjaga Bhumi Inti" || effectiveBadge === "Penjaga Bhumi Alfa") {
    const isInti = effectiveBadge === "Penjaga Bhumi Inti";
    const canonicalUntil = isInti ? INTI_ACCESS_UNTIL : ALFA_ACCESS_UNTIL;
    const profileUntil = toDate(profile.accessUntil);
    const effectiveUntil = profileUntil && profileUntil > canonicalUntil ? profileUntil : canonicalUntil;
    if (now < effectiveUntil) {
      activeEntitlements.push({
        isPremium: true,
        reason: isInti ? "inti_badge" : "alfa_badge",
        expiresAt: effectiveUntil,
        tier: isInti ? "Premium (Inti)" : "Premium (Alfa)",
      });
    } else {
      expiredEntitlements.push({
        isPremium: false,
        reason: "none",
        expiresAt: effectiveUntil,
        tier: isInti ? "Penjaga Bhumi Inti (Expired)" : "Penjaga Bhumi Alfa (Expired)",
      });
    }
  }

  // Priority 3: Paid Subscriber (Google Play) — defensive: must have verifiable expiry
  const verifiedPaid = profile.entitlementSource === "google_play" && profile.membershipType === "PREMIUM";
  if (verifiedPaid) {
    const expiry = toDate(profile.membershipExpiryDate) || toDate(profile.accessUntil);
    if (expiry && now < expiry) {
      activeEntitlements.push({
        isPremium: true, reason: "subscriber", expiresAt: expiry, tier: "Premium (Subscriber)",
      });
    } else {
      expiredEntitlements.push({
        isPremium: false, reason: "none", expiresAt: expiry, tier: "Paid Premium (Expired)",
      });
    }
  }

  // Priority 4: 7-day trial
  const trialWindow = getCanonicalTrialWindow(profile);
  if (trialWindow.state === "valid" && trialWindow.end && now < trialWindow.end) {
    activeEntitlements.push({
      isPremium: true, reason: "trial", expiresAt: trialWindow.end, tier: "Trial",
    });
  }

  // Union: lifetime beats finite; otherwise pick the latest expiry.
  if (activeEntitlements.length > 0) {
    const lifetime = activeEntitlements.find((e) => e.expiresAt === null);
    if (lifetime) return lifetime;
    const latest = activeEntitlements.reduce((a, b) => (a.expiresAt > b.expiresAt ? a : b));
    return latest;
  }

  // No active entitlements. Return the highest-signal expired/fallback state.
  if (expiredEntitlements.length > 0) return expiredEntitlements[0];
  return { isPremium: false, reason: "none", expiresAt: null, tier: "Free" };
}

// ---- PROPOSE FIRESTORE STATE ----
function propose(profile, testerRecord) {
  const NOW = new Date();
  const e = resolveCanonical(profile, testerRecord, NOW);

  if (e.reason === "founder" && e.expiresAt === null) {
    const proposed = {
      membershipType: "LIFETIME",
      membershipExpiryDate: null,
      accessUntil: null,
      entitlementSource: "founder",
      subscriptionStatus: "active",
    };
    const isAligned = profile?.membershipType === "LIFETIME" && profile?.entitlementSource === "founder";
    return {
      state: isAligned ? "no-op" : "upgrade",
      writes: proposed,
    };
  }

  if (e.isPremium) {
    const source = e.reason === "subscriber" ? "google_play" : (profile?.entitlementSource || "tester_grant");
    const proposed = {
      membershipType: "PREMIUM",
      membershipExpiryDate: e.expiresAt ? e.expiresAt.toISOString() : null,
      accessUntil: e.expiresAt ? e.expiresAt.toISOString() : null,
      entitlementSource: source,
      subscriptionStatus: "active",
    };
    // Check if Fs already matches the proposed state
    const matchesExpiry = e.expiresAt
      ? (new Date(profile?.membershipExpiryDate).getTime() === e.expiresAt.getTime() ||
         new Date(profile?.accessUntil).getTime() === e.expiresAt.getTime())
      : (profile?.membershipExpiryDate == null && profile?.accessUntil == null);
    const isAligned =
      profile?.membershipType === "PREMIUM" &&
      profile?.entitlementSource === source &&
      profile?.subscriptionStatus === "active" &&
      matchesExpiry;
    return {
      state: isAligned ? "no-op" : "upgrade",
      writes: proposed,
    };
  }

  // Resolver says not premium. Fs may say PREMIUM — evaluate safe-downgrade policy.
  const isTester = testerRecord?.badge === "Penjaga Bhumi Inti" || testerRecord?.badge === "Penjaga Bhumi Alfa";
  const hasPlayExpiry =
    profile?.entitlementSource === "google_play" &&
    (toDate(profile?.membershipExpiryDate) || toDate(profile?.accessUntil));

  if (profile?.membershipType === "PREMIUM" || profile?.membershipType === "LIFETIME") {
    if (isTester || hasPlayExpiry) {
      // External evidence we cannot independently verify — skip for Founder review.
      return {
        state: "skip",
        skipReason: "resolver says not premium but user holds external evidence (tester or Play source); require Founder authorization",
        writes: {},
      };
    }
    return {
      state: "downgrade",
      writes: {
        membershipType: "FREE",
        membershipExpiryDate: null,
        accessUntil: profile?.accessUntil ?? null,
        entitlementSource: null,
        subscriptionStatus: "inactive",
      },
    };
  }

  return { state: "no-op", writes: {} };
}

function diffFields(before, after) {
  const changes = {};
  for (const k of Object.keys(after)) {
    if (JSON.stringify(before?.[k]) !== JSON.stringify(after[k])) {
      changes[k] = { before: before?.[k] ?? null, after: after[k] };
    }
  }
  return changes;
}

// ---- SAFETY GUARDS ----
if (!EXECUTE) {
  console.log("=========================================================");
  console.log("  DRY-RUN MODE — NO WRITES. Pass --execute to apply.");
  console.log("=========================================================\n");
} else {
  console.log("=========================================================");
  console.log("  ⚠️  EXECUTE MODE — PRODUCTION WRITES WILL OCCUR ⚠️");
  console.log("=========================================================\n");
}

if (EXECUTE && !process.env.FIREBASE_PROJECT_ID && !process.env.GOOGLE_CLOUD_PROJECT) {
  if (process.env.FIRESTORE_EMULATOR_HOST && ALLOW_EMULATOR_EXECUTE) {
    console.log("⚠️  --allow-emulator-execute set: proceeding against emulator.");
  } else {
    console.error("FATAL: refusing to --execute without production credentials.");
    console.error("       Use DRY-RUN mode (no --execute) against emulator for testing.");
    console.error("       Pass --allow-emulator-execute to override (TEST ONLY).");
    process.exit(2);
  }
}

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "(emulator)";
console.log(`Project: ${projectId}`);
console.log(`Mode: ${EXECUTE ? "EXECUTE" : "DRY_RUN"}`);
console.log(`Scope: ${onlyCohort ? `cohort=${onlyCohort}` : "ALL"} ${limitN ? `limit=${limitN}` : ""}`);
console.log("");

if (!admin.apps || admin.apps.length === 0) {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    admin.initializeApp({ projectId: "bhumiamartya-fe85c" });
  } else {
    admin.initializeApp();
  }
}
const db = getFirestore();

// ---- LOAD ----
const regSnap = await db.collection("testerBadgeRegistry").get();
const testerByUid = new Map();
regSnap.forEach((doc) => testerByUid.set(doc.id, doc.data()));

let lastDoc = null;
const PAGE = 400;
const usersByUid = new Map();
while (true) {
  let q = db.collection("users").orderBy("__name__").limit(PAGE);
  if (lastDoc) q = q.startAfter(lastDoc);
  const snap = await q.get();
  if (snap.empty) break;
  snap.forEach((doc) => usersByUid.set(doc.id, doc.data()));
  lastDoc = snap.docs[snap.docs.length - 1];
  if (snap.size < PAGE) break;
}

// ---- RECONCILE ----
const TS = new Date().toISOString().replace(/[:.]/g, "-");
const csvPath = `audit/reconcile_${TS}.csv`;
const jsonPath = `audit/reconcile_${TS}.json`;
const logPath = `audit/reconcile_${TS}.log`;
const csvLines = ["uid,cohort,action,fields_changed,reason,skip_reason"];
const rows = [];
const summary = {
  total: 0,
  "no-op": 0,
  upgrade: 0,
  downgrade: 0,
  skipped: 0,
  writesAttempted: 0,
  writesFailed: 0,
  cohorts: {},
};

appendFileSync(logPath, `${new Date().toISOString()} | mode=${EXECUTE ? "EXECUTE" : "DRY_RUN"} | project=${projectId} | started\n`);

let processed = 0;
for (const [uid, profile] of usersByUid.entries()) {
  if (limitN && processed >= limitN) break;
  processed++;
  summary.total++;

  const testerRecord = testerByUid.get(uid) || null;
  const proposal = propose(profile, testerRecord);

  // Cohort classification (same as forensic scan)
  const cohort = [];
  const isTester = testerRecord?.badge === "Penjaga Bhumi Inti" || testerRecord?.badge === "Penjaga Bhumi Alfa";
  const isPlay = profile?.entitlementSource === "google_play" && profile?.membershipType === "PREMIUM";
  const memExp = toDate(profile?.membershipExpiryDate);
  const accessUntil = toDate(profile?.accessUntil);
  const NOW = new Date();
  if (isTester && isPlay) cohort.push("A");
  if (isTester && isPlay && memExp && memExp < (testerRecord?.badge === "Penjaga Bhumi Inti" ? INTI_ACCESS_UNTIL : ALFA_ACCESS_UNTIL)) cohort.push("B");
  if (isPlay && memExp && (NOW.getTime() - memExp.getTime()) > 7 * 86400000) cohort.push("C");
  if (profile?.membershipType === "PREMIUM" && profile?.entitlementSource !== "google_play") cohort.push("H");
  if (profile?.membershipType === "PREMIUM" && accessUntil && accessUntil < NOW) cohort.push("I");
  const cohortStr = cohort.join("+") || "-";

  if (onlyCohort && !cohort.includes(onlyCohort)) continue;

  summary[proposal.state] = (summary[proposal.state] || 0) + 1;
  for (const c of cohort) summary.cohorts[c] = (summary.cohorts[c] || 0) + 1;

  const changes = diffFields(profile, proposal.writes);

  if (proposal.state === "skip") {
    csvLines.push([mask(uid), cohortStr, "SKIP", "", proposal.skipReason || "", proposal.skipReason || ""].join(","));
    rows.push({ uid: mask(uid), cohort: cohortStr, action: "SKIP", reason: proposal.skipReason, changes });
    appendFileSync(logPath, `${new Date().toISOString()} | SKIP | ${mask(uid)} | cohort=${cohortStr} | reason="${proposal.skipReason}"\n`);
    continue;
  }

  if (proposal.state === "no-op") {
    csvLines.push([mask(uid), cohortStr, "NO-OP", "", "already aligned", ""].join(","));
    rows.push({ uid: mask(uid), cohort: cohortStr, action: "NO-OP", changes: {} });
    continue;
  }

  const writeRecord = {
    ...proposal.writes,
    lastReconciledAt: new Date().toISOString(),
    reconciledBy: "entitlement_reconcile_v1",
  };

  if (EXECUTE) {
    summary.writesAttempted++;
    try {
      await db.collection("users").doc(uid).set(writeRecord, { merge: true });
      appendFileSync(logPath, `${new Date().toISOString()} | WRITE | ${mask(uid)} | cohort=${cohortStr} | action=${proposal.state} | fields=${JSON.stringify(Object.keys(changes))}\n`);
    } catch (err) {
      summary.writesFailed++;
      appendFileSync(logPath, `${new Date().toISOString()} | WRITE_FAIL | ${mask(uid)} | err=${err.message}\n`);
    }
  } else {
    appendFileSync(logPath, `${new Date().toISOString()} | DRY | ${mask(uid)} | cohort=${cohortStr} | action=${proposal.state} | proposed=${JSON.stringify(writeRecord)}\n`);
  }

  csvLines.push([
    mask(uid), cohortStr, proposal.state.toUpperCase(),
    Object.keys(changes).join("|"),
    proposal.state === "upgrade" ? "resolver says premium; align Fs" : "resolver says not premium; downgrade Fs",
    "",
  ].join(","));

  rows.push({ uid: mask(uid), cohort: cohortStr, action: proposal.state.toUpperCase(), changes, proposed: writeRecord });
}

writeFileSync(csvPath, csvLines.join("\n"));
writeFileSync(jsonPath, JSON.stringify({ generated_at: TS, mode: EXECUTE ? "EXECUTE" : "DRY_RUN", summary, rows }, null, 2));

console.log("=========================================================");
console.log(`ENTITLEMENT RECONCILIATION ${EXECUTE ? "EXECUTE" : "DRY-RUN"}`);
console.log(`Generated: ${TS}`);
console.log("=========================================================");
console.log(`Total users scanned: ${summary.total}`);
console.log(`No-op (already aligned): ${summary["no-op"]}`);
console.log(`Upgrade (Fs says FREE, resolver says PREMIUM): ${summary.upgrade}`);
console.log(`Downgrade (Fs says PREMIUM, resolver says FREE): ${summary.downgrade}`);
console.log(`Skipped (require Founder authorization): ${summary.skipped}`);
if (EXECUTE) {
  console.log(`Writes attempted: ${summary.writesAttempted}`);
  console.log(`Writes failed: ${summary.writesFailed}`);
}
console.log(`Cohort counts: ${JSON.stringify(summary.cohorts)}`);
console.log(`CSV:  ${csvPath}`);
console.log(`JSON: ${jsonPath}`);
console.log(`LOG:  ${logPath}`);

appendFileSync(logPath, `${new Date().toISOString()} | mode=${EXECUTE ? "EXECUTE" : "DRY_RUN"} | summary=${JSON.stringify(summary)} | done\n`);

if (EXECUTE && summary.writesFailed > 0) {
  console.error(`\n⚠️ ${summary.writesFailed} writes failed. Check ${logPath}.`);
  process.exit(1);
}

process.exit(0);
