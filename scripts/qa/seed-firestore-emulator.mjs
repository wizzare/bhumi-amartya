#!/usr/bin/env node
// Local-only Firestore Emulator seeder using Admin SDK.
// Safety: refuses non-local hosts. Requires FIRESTORE_EMULATOR_HOST.

const EMULATOR_HOSTS = new Set(["127.0.0.1", "localhost"]);

function validateFirestoreHost(host) {
  if (!host) {
    throw new Error("FIRESTORE_EMULATOR_HOST is not set. Refusing to connect.");
  }
  const parts = host.split(":");
  const address = parts[0].toLowerCase();
  if (!EMULATOR_HOSTS.has(address)) {
    throw new Error(`Refusing non-local Firestore host: ${host}`);
  }
  return `http://${host}`;
}

function validateAuthHost(host) {
  if (!host) {
    throw new Error("AUTH_EMULATOR_HOST is not set. Refusing to connect.");
  }
  const address = host.split(":")[0].toLowerCase();
  if (!EMULATOR_HOSTS.has(address)) {
    throw new Error(`Refusing non-local Auth host: ${host}`);
  }
  return `http://${host}`;
}

const FIRESTORE_HOST = validateFirestoreHost(process.env.FIRESTORE_EMULATOR_HOST);
const AUTH_HOST = validateAuthHost(process.env.AUTH_EMULATOR_HOST || "127.0.0.1:9099");
const PROJECT_ID = process.env.GCLOUD_PROJECT || "demo-no-project";

if (PROJECT_ID !== "demo-no-project") {
  throw new Error(`Refusing non-demo project: ${PROJECT_ID}`);
}

// Set host before importing Admin SDK
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";

import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

initializeApp({ projectId: PROJECT_ID });
const db = getFirestore();

const NOW = Timestamp.now();

async function verifyUid(email, uid) {
  const pwMap = { "admin@bhumi.test":"admin-1pass","user-a@bhumi.test":"user-a-pass","user-b@bhumi.test":"user-b-pass","wedhaswarawidhi@gmail.com":"excl-1-pass","widhi.w.karyodikromo@gmail.com":"excl-2-pass","free-user@bhumi.test":"free-pass-1","trial-active@bhumi.test":"trial-pass","trial-exhausted@bhumi.test":"exh-pass-1","premium-active@bhumi.test":"prem-pass-1","premium-expired@bhumi.test":"exp-pass-1" };
  const pw = pwMap[email];
  if (!pw) return null;
  const resp = await fetch(`${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: pw, returnSecureToken: false }),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data.localId === uid ? uid : null;
}

const AUTH_UID_MAP = {
  "admin@bhumi.test": "U2QyahEe2Ud8iEw9x02wkOv4qcww",
  "user-a@bhumi.test": "yQu6m9opGQC0o5GHpAA5W29phmLY",
  "user-b@bhumi.test": "NWFYPgG6k6UiwdIOwluZ5mqcpZ1M",
  "wedhaswarawidhi@gmail.com": "AYf7OZ5xRFy9r1jsdQYioAwpQNMu",
  "widhi.w.karyodikromo@gmail.com": "yPvQqwgjbKAgTPCRKmhUDIb9vSuC",
  "free-user@bhumi.test": "rKkXBsqHKpOeUxPS6ykUl0pEb9aO",
  "trial-active@bhumi.test": "Fpy95WGK8JV2O1qdrUGPaRtpr4nX",
  "trial-exhausted@bhumi.test": "Q04Elzf8ddklICFWeDEpYpSl9VnK",
  "premium-active@bhumi.test": "DYpsQVRyb2a906sOfmQdBPoCP1bx",
  "premium-expired@bhumi.test": "qSxMboWBd5p7ZQrsbrVwdRwblJC2",
};

async function main() {
  // Smoke test first
  const smokeRef = db.collection("qaSmoke").doc("firestore-emulator");
  await smokeRef.set({ smoke: true, timestamp: NOW });
  const smokeSnap = await smokeRef.get();
  if (!smokeSnap.exists) {
    throw new Error("Smoke write failed: document not found");
  }
  console.log("SMOKE WRITE: PASS");
  console.log("SMOKE READ: PASS");

  // Verify known UIDs against Auth Emulator
  let verified = 0;
  for (const [email, uid] of Object.entries(AUTH_UID_MAP)) {
    const result = await verifyUid(email, uid);
    if (result) verified++;
  }
  console.log(`AUTH USERS VERIFIED: ${verified} / ${Object.keys(AUTH_UID_MAP).length}`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  const fixtureMap = {
    "admin@bhumi.test": {
      label: "ADMIN", guardianRole: "admin",
    },
    "user-a@bhumi.test": { label: "USER_A" },
    "user-b@bhumi.test": { label: "USER_B" },
    "wedhaswarawidhi@gmail.com": { label: "EXCL1" },
    "widhi.w.karyodikromo@gmail.com": { label: "EXCL2" },
    "free-user@bhumi.test": { label: "FREE", plan: "free", trialLoginCount: 8 },
    "trial-active@bhumi.test": { label: "TRIAL", trialLoginCount: 3 },
    "trial-exhausted@bhumi.test": { label: "EXH", trialLoginCount: 10 },
    "premium-active@bhumi.test": {
      label: "PREMIUM", membershipType: "PREMIUM", isPremium: true,
      membershipExpiryDate: Timestamp.fromDate(new Date("2026-08-01T00:00:00Z")),
    },
    "premium-expired@bhumi.test": {
      label: "EXPIRED", membershipType: "PREMIUM", isPremium: true,
      membershipExpiryDate: Timestamp.fromDate(new Date("2026-06-01T00:00:00Z")),
    },
  };

  for (const [email, info] of Object.entries(fixtureMap)) {
    const uid = AUTH_UID_MAP[email];
    if (!uid) {
      console.log(`  SKIPPED ${info.label} — no Auth UID for ${email}`);
      skipped++;
      continue;
    }

    const userRef = db.collection("users").doc(uid);
    const snap = await userRef.get();

    const docData = {
      uid,
      email,
      displayName: info.label,
      fullName: info.label,
      setupCompleted: true,
      createdAt: NOW,
      lastSeen: NOW,
      trialLoginCount: info.trialLoginCount ?? 0,
    };

    if (info.guardianRole) docData.guardianRole = info.guardianRole;
    if (info.plan) docData.plan = info.plan;
    if (info.membershipType) docData.membershipType = info.membershipType;
    if (info.isPremium != null) docData.isPremium = info.isPremium;
    if (info.membershipExpiryDate) docData.membershipExpiryDate = info.membershipExpiryDate;

    try {
      if (snap.exists) {
        await userRef.update(docData);
        updated++;
      } else {
        await userRef.set(docData);
        created++;
      }
    } catch (err) {
      console.log(`  FAILED  ${info.label} — ${err.message}`);
      failed++;
    }

    // Also create user_activity daily record
    const activityId = `${uid}_2026-07-25`;
    const activityRef = db.collection("user_activity").doc(activityId);
    const activitySnap = await activityRef.get();
    if (!activitySnap.exists) {
      await activityRef.set({
        uid, date: "2026-07-25", appVersion: "4.4.4", buildNumber: "80",
        lastSeen: NOW, totalSeconds: 123,
      });
      created++;
    }
  }

  console.log(`FIRESTORE SEED: ${created} created, ${updated} updated, ${skipped} skipped, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
