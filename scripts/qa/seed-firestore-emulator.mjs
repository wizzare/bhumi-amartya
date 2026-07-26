#!/usr/bin/env node
// Local-only billing fixture seeder using the Auth and Firestore emulators.

import { createConnection } from "node:net";
import { pathToFileURL } from "node:url";

const EMULATOR_HOSTS = new Set(["127.0.0.1", "localhost"]);
export const EXPECTED_PROJECT_ID = "bhumiamartya-fe85c";
export const BILLING_EMAILS = [
  "free-user@bhumi.test",
  "trial-active@bhumi.test",
  "trial-exhausted@bhumi.test",
  "premium-active@bhumi.test",
  "premium-expired@bhumi.test",
];

export function validateLocalEndpoint(value, expectedPort, label) {
  if (!value) throw new Error(`${label} emulator host is not set.`);
  const [host, rawPort, ...extra] = value.split(":");
  const port = Number(rawPort);
  if (extra.length || !EMULATOR_HOSTS.has(host.toLowerCase()) || port !== expectedPort) {
    throw new Error(`Refusing unexpected ${label} emulator endpoint: ${value}`);
  }
  return { host, port };
}

export function validateEnvironment(env = process.env) {
  if (env.GCLOUD_PROJECT !== EXPECTED_PROJECT_ID) {
    throw new Error(`Refusing unexpected project: ${env.GCLOUD_PROJECT || "<missing>"}`);
  }
  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("Refusing to run while GOOGLE_APPLICATION_CREDENTIALS is set.");
  }
  return {
    auth: validateLocalEndpoint(
      env.FIREBASE_AUTH_EMULATOR_HOST || env.AUTH_EMULATOR_HOST,
      9099,
      "Auth",
    ),
    firestore: validateLocalEndpoint(env.FIRESTORE_EMULATOR_HOST, 8080, "Firestore"),
    functions: validateLocalEndpoint(env.FUNCTIONS_EMULATOR_HOST, 5001, "Functions"),
  };
}

function assertListener({ host, port }, label) {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port });
    const fail = () => reject(new Error(`${label} emulator listener unavailable at ${host}:${port}`));
    socket.setTimeout(1500);
    socket.once("connect", () => {
      socket.destroy();
      resolve();
    });
    socket.once("timeout", () => {
      socket.destroy();
      fail();
    });
    socket.once("error", fail);
  });
}

export function buildBillingFixtureDefinitions() {
  const activeUntil = new Date("2026-08-30T00:00:00Z");
  const expiredAt = new Date("2026-06-01T00:00:00Z");
  const trialStartedAt = new Date("2026-07-25T00:00:00Z");
  return {
    "free-user@bhumi.test": {
      label: "FREE",
      expectedState: "free",
      access: {
        badge: null,
        testerBadge: null,
        membership: null,
        membershipType: "FREE",
        plan: "free",
        trialStatus: "free",
        trialLoginCount: 8,
        isPremium: false,
        accessUntil: null,
        membershipExpiryDate: null,
        subscriptionStatus: "inactive",
      },
    },
    "trial-active@bhumi.test": {
      label: "TRIAL",
      expectedState: "trial_active",
      access: {
        badge: null,
        testerBadge: "Penjaga Bhumi",
        membership: "free_trial",
        membershipType: "TRIAL",
        plan: "free_trial",
        trialStatus: "active",
        trialLoginCount: 3,
        trialStartedAt,
        trialEndsAt: activeUntil,
        isPremium: false,
        accessUntil: activeUntil,
        membershipExpiryDate: null,
        subscriptionStatus: "trial_active",
      },
    },
    "trial-exhausted@bhumi.test": {
      label: "EXHAUSTED",
      expectedState: "trial_exhausted",
      access: {
        badge: null,
        testerBadge: "Penjaga Bhumi",
        membership: "free_trial",
        membershipType: "TRIAL",
        plan: "expired",
        trialStatus: "free",
        trialLoginCount: 10,
        trialStartedAt,
        trialEndsAt: expiredAt,
        isPremium: false,
        accessUntil: expiredAt,
        membershipExpiryDate: null,
        subscriptionStatus: "expired",
      },
    },
    "premium-active@bhumi.test": {
      label: "PREMIUM",
      expectedState: "premium_active",
      access: {
        badge: null,
        testerBadge: null,
        membership: "premium",
        membershipType: "PREMIUM",
        plan: "premium",
        trialStatus: "free",
        trialLoginCount: 8,
        isPremium: true,
        accessUntil: activeUntil,
        membershipExpiryDate: activeUntil,
        subscriptionStatus: "active",
      },
    },
    "premium-expired@bhumi.test": {
      label: "EXPIRED",
      expectedState: "premium_expired",
      access: {
        badge: null,
        testerBadge: null,
        membership: "expired",
        membershipType: "PREMIUM",
        plan: "expired",
        trialStatus: "free",
        trialLoginCount: 8,
        isPremium: false,
        accessUntil: expiredAt,
        membershipExpiryDate: expiredAt,
        subscriptionStatus: "expired",
      },
    },
  };
}

export async function resolveAuthUsers(auth, emails = BILLING_EMAILS) {
  const resolved = new Map();
  for (const email of emails) {
    try {
      const user = await auth.getUserByEmail(email);
      resolved.set(email, user.uid);
    } catch (error) {
      if (error?.code === "auth/user-not-found") {
        throw new Error(`Expected Auth Emulator account is missing: ${email}`);
      }
      throw error;
    }
  }
  return resolved;
}

function toMillis(value) {
  if (!value) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.toDate === "function") return value.toDate().getTime();
  return new Date(value).getTime();
}

export function classifyFixture(data, now = new Date("2026-07-26T00:00:00Z")) {
  const expiry = data.membershipExpiryDate || data.accessUntil;
  const expiryMillis = toMillis(expiry);
  if (data.membershipType === "PREMIUM") {
    return expiryMillis && expiryMillis > now.getTime() ? "premium_active" : "premium_expired";
  }
  const explicitFree = data.trialStatus === "free" || ["free", "expired"].includes(String(data.plan).toLowerCase());
  if (Number(data.trialLoginCount) <= 7 && !explicitFree) return "trial_active";
  if (String(data.membershipType).toUpperCase() === "TRIAL") return "trial_exhausted";
  return "free";
}

function normalizedEqual(actual, expected) {
  if (actual === expected) return true;
  if (actual == null || expected == null) return actual == null && expected == null;
  if (expected instanceof Date) return toMillis(actual) === expected.getTime();
  return false;
}

async function findStaleFixtures(db, resolvedUids) {
  const stale = [];
  for (const email of BILLING_EMAILS) {
    const currentUid = resolvedUids.get(email);
    const matches = await db.collection("users").where("email", "==", email).get();
    for (const document of matches.docs) {
      if (document.id === currentUid) continue;
      stale.push({ email, documentId: document.id, currentUid, ref: document.ref });
    }
  }
  for (const item of stale) {
    console.log(`STALE FIXTURE: email=${item.email} documentId=${item.documentId} currentUid=${item.currentUid}`);
  }
  return stale;
}

async function main() {
  const endpoints = validateEnvironment();
  await Promise.all([
    assertListener(endpoints.auth, "Auth"),
    assertListener(endpoints.firestore, "Firestore"),
    assertListener(endpoints.functions, "Functions"),
  ]);
  process.env.FIREBASE_AUTH_EMULATOR_HOST = `${endpoints.auth.host}:${endpoints.auth.port}`;

  const [{ initializeApp }, { getAuth }, { getFirestore }] = await Promise.all([
    import("firebase-admin/app"),
    import("firebase-admin/auth"),
    import("firebase-admin/firestore"),
  ]);
  const app = initializeApp({ projectId: EXPECTED_PROJECT_ID }, "billing-fixture-seeder");
  const auth = getAuth(app);
  const db = getFirestore(app);
  const definitions = buildBillingFixtureDefinitions();

  const resolvedUids = await resolveAuthUsers(auth);
  for (const [email, uid] of resolvedUids) {
    console.log(`AUTH UID: email=${email} uid=${uid} endpoint=${endpoints.auth.host}:${endpoints.auth.port}`);
  }

  const stale = await findStaleFixtures(db, resolvedUids);
  if (process.argv.includes("--report-stale-only")) {
    console.log(`STALE FIXTURE REPORT: ${stale.length} found, 0 removed`);
    return;
  }

  const smokeRef = db.collection("qaSmoke").doc("billing-fixture-seeder");
  await smokeRef.set({ smoke: true, projectId: EXPECTED_PROJECT_ID, timestamp: new Date() });
  if (!(await smokeRef.get()).exists) throw new Error("Firestore Emulator smoke read failed.");
  for (const item of stale) await item.ref.delete();
  let created = 0;
  let updated = 0;
  for (const [email, definition] of Object.entries(definitions)) {
    const uid = resolvedUids.get(email);
    const userRef = db.collection("users").doc(uid);
    const before = await userRef.get();
    const now = new Date();
    const document = {
      uid,
      email,
      displayName: definition.label,
      fullName: definition.label,
      setupCompleted: true,
      ...definition.access,
      lastSeen: now,
      ...(before.exists ? {} : { createdAt: now }),
    };
    await userRef.set(document, { merge: true });
    before.exists ? updated++ : created++;

    const activityId = `${uid}_2026-07-25`;
    await db.collection("user_activity").doc(activityId).set({
      uid,
      date: "2026-07-25",
      appVersion: "4.4.4",
      buildNumber: "80",
      lastSeen: now,
      totalSeconds: 123,
    }, { merge: true });
  }

  for (const [email, definition] of Object.entries(definitions)) {
    const uid = resolvedUids.get(email);
    const snapshot = await db.collection("users").doc(uid).get();
    const data = snapshot.data();
    if (!snapshot.exists || data.uid !== uid || data.email !== email) {
      throw new Error(`Fixture identity readback failed: ${email}`);
    }
    for (const [key, expected] of Object.entries(definition.access)) {
      if (!normalizedEqual(data[key], expected)) {
        throw new Error(`Fixture field readback failed: ${email} ${key}`);
      }
    }
    const state = classifyFixture(data);
    if (state !== definition.expectedState) {
      throw new Error(`Fixture state readback failed: ${email} expected=${definition.expectedState} actual=${state}`);
    }
    console.log(`FIXTURE READBACK: email=${email} uid=${uid} state=${state} document=users/${uid}`);
  }

  console.log(`FIRESTORE SEED: ${created} created, ${updated} updated, ${stale.length} stale removed`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((error) => {
    console.error("FATAL:", error.message);
    process.exit(1);
  });
}
