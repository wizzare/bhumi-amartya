// Seed the Firestore emulator with the 52 anomaly-cohort users.
// Lets the reconcile script be tested end-to-end without production access.
//
// Usage:
//   1. Start emulator: firebase emulators:start --only firestore,auth
//   2. node scripts/forensic/sprint1_seed_emulator.mjs
//
// After seeding, run:
//   node scripts/entitlement_reconcile.mjs --limit=100
// to verify the reconcile mechanics.

import admin from "firebase-admin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error("FATAL: FIRESTORE_EMULATOR_HOST not set. Run with emulator.");
  process.exit(2);
}

if (!admin.apps || admin.apps.length === 0) {
  admin.initializeApp({ projectId: "bhumiamartya-fe85c" });
}
const db = getFirestore();

const NOW = new Date();
const INTI_END = new Date("2026-08-29T17:00:00.000Z");
const ALFA_END = new Date("2026-07-29T17:00:00.000Z");

// Synthetic 52-user universe matching the cohort classification.
// Includes all 4 disposition categories (EXPECTED_STATE, STALE_DATA, etc).
const SEED = [
  // ---- EXPECTED STATE: 21 Alfa users past canonical end ----
  ...Array.from({ length: 21 }).map((_, i) => ({
    uid: `synth-alfa-expired-${i.toString().padStart(3, "0")}`,
    profile: {
      membershipType: "PREMIUM",
      membershipExpiryDate: ALFA_END,
      accessUntil: ALFA_END,
      entitlementSource: null,
      subscriptionStatus: "active",
      testerBadge: "Penjaga Bhumi Alfa",
    },
    tester: { badge: "Penjaga Bhumi Alfa" },
    label: "Alfa grant naturally expired",
  })),

  // ---- STALE DATA: 24 Inti users (Fs missing entitlementSource label) ----
  ...Array.from({ length: 24 }).map((_, i) => ({
    uid: `synth-inti-active-${i.toString().padStart(3, "0")}`,
    profile: {
      membershipType: "PREMIUM",
      membershipExpiryDate: INTI_END,
      accessUntil: INTI_END,
      entitlementSource: null,
      subscriptionStatus: "active",
      testerBadge: "Penjaga Bhumi Inti",
    },
    tester: { badge: "Penjaga Bhumi Inti" },
    label: "Inti grant active, Fs label missing",
  })),

  // ---- STALE DATA: 2 active Play subscribers (resolver agrees with Fs but entitlementSource may need refresh) ----
  {
    uid: "synth-play-001",
    profile: {
      membershipType: "PREMIUM",
      membershipExpiryDate: new Date("2026-09-03T14:59:09.491Z"),
      accessUntil: new Date("2026-09-03T14:59:09.491Z"),
      entitlementSource: "google_play",
      subscriptionStatus: "ACTIVE",
    },
    tester: null,
    label: "Active Play subscriber",
  },
  {
    uid: "synth-play-002",
    profile: {
      membershipType: "PREMIUM",
      membershipExpiryDate: new Date("2026-08-29T00:56:51.195Z"),
      accessUntil: new Date("2026-08-29T00:56:51.195Z"),
      entitlementSource: "google_play",
      subscriptionStatus: "ACTIVE",
    },
    tester: null,
    label: "Active Play subscriber (Sep 13 case)",
  },

  // ---- STALE DATA: 1 RESCUED (resolver says Inti premium, Fs says TRIAL) ----
  {
    uid: "synth-rescued-inti-001",
    profile: {
      membershipType: "TRIAL",
      accessUntil: new Date("2026-08-29T17:00:00.000Z"),
      testerBadge: "Penjaga Bhumi Inti",
    },
    tester: { badge: "Penjaga Bhumi Inti" },
    label: "RESCUED: Fs says TRIAL, canonical Inti grant active",
  },

  // ---- STALE DATA: 1 LIFETIME/Founder (resolver says Founder, Fs has stale fields) ----
  {
    uid: "synth-founder-001",
    profile: {
      membershipType: "LIFETIME",
      membershipExpiryDate: null,
      accessUntil: new Date("2026-07-12T23:59:59.000Z"),
      entitlementSource: null,
      subscriptionStatus: "trialing",
      testerBadge: "Founder",
    },
    tester: { badge: "Founder" },
    label: "Founder/Lifetime",
  },

  // ---- SKIP candidates: 3 unsafe (resolver says no entitlement but external evidence exists) ----
  {
    uid: "synth-skip-widya-001",
    profile: {
      membershipType: "PREMIUM",
      entitlementSource: "google_play",
      membershipExpiryDate: new Date("2026-08-13T03:36:40.602Z"), // stale Play
      accessUntil: new Date("2026-08-13T03:36:40.602Z"),
      testerBadge: "Penjaga Bhumi Inti",
      subscriptionStatus: "ACTIVE",
    },
    tester: { badge: "Penjaga Bhumi Inti" },
    label: "SKIP: Widya case (Play real expiry unknown)",
  },
  {
    uid: "synth-skip-play-stale-001",
    profile: {
      membershipType: "PREMIUM",
      entitlementSource: "google_play",
      membershipExpiryDate: new Date("2026-08-02T12:22:44.242Z"), // stale
      accessUntil: new Date("2026-08-02T12:22:44.242Z"),
      subscriptionStatus: "ACTIVE",
    },
    tester: null,
    label: "SKIP: Play stale, no tester",
  },
  {
    uid: "synth-skip-play-stale-002",
    profile: {
      membershipType: "PREMIUM",
      entitlementSource: "google_play",
      membershipExpiryDate: new Date("2026-08-11T03:11:47.377Z"), // stale
      accessUntil: new Date("2026-08-11T03:11:47.377Z"),
      subscriptionStatus: "ACTIVE",
    },
    tester: null,
    label: "SKIP: Play stale, no tester",
  },
];

// ---- SEED ----
let written = 0;
for (const { uid, profile, tester, label } of SEED) {
  await db.collection("users").doc(uid).set(profile, { merge: true });
  if (tester) {
    await db.collection("testerBadgeRegistry").doc(uid).set(tester, { merge: true });
  }
  written++;
}

console.log(`Seeded ${written} users + ${SEED.filter((s) => s.tester).length} tester registry entries to emulator.`);
console.log(`Run: node scripts/entitlement_reconcile.mjs --limit=100`);

process.exit(0);
