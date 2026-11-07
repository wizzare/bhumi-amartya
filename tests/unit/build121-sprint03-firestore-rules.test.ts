import assert from "node:assert/strict";
import { test, before, after } from "node:test";
import { initializeApp, deleteApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, signInAnonymously, Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  terminate,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  collectionGroup,
  getDocs,
  Firestore,
} from "firebase/firestore";
import { initializeApp as adminInit, getApps, App as AdminApp } from "firebase-admin/app";
import { getFirestore as adminFirestore } from "firebase-admin/firestore";
import { getAuth as adminAuth } from "firebase-admin/auth";

const PROJECT_ID = "demo-build126-canonical-qa";
const FIRESTORE_PORT = 18080;
const AUTH_PORT = 19099;

interface ClientContext {
  name: string;
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  uid: string;
}

let adminApp: AdminApp;
let userA: ClientContext;
let userB: ClientContext;
let adminUser: ClientContext;
let unprivilegedAdminUser: ClientContext;

async function createClientContext(name: string, customToken?: string): Promise<ClientContext> {
  const app = initializeApp(
    { apiKey: "synthetic", projectId: PROJECT_ID, appId: `app-${name}-${Date.now()}` },
    `app-${name}-${Date.now()}`
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://127.0.0.1:${AUTH_PORT}`, { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, "127.0.0.1", FIRESTORE_PORT);

  let uid: string;
  if (customToken) {
    const { signInWithCustomToken } = await import("firebase/auth");
    const cred = await signInWithCustomToken(auth, customToken);
    uid = cred.user.uid;
  } else {
    const cred = await signInAnonymously(auth);
    uid = cred.user.uid;
  }

  return { name, app, auth, db, uid };
}

async function expectDenied(promise: Promise<unknown>, msg: string): Promise<void> {
  await assert.rejects(
    promise,
    (err: any) => {
      const code = err?.code;
      const isDenied = code === "permission-denied" || err?.message?.includes("PERMISSION_DENIED");
      assert.ok(isDenied, `Expected permission-denied for ${msg}, got: ${err?.message || code}`);
      return true;
    },
    `Expected rejection for ${msg}`
  );
}

before(async () => {
  // 1. Ensure emulator rules are reloaded from authoritative root firestore.rules
  const fs = await import("node:fs");
  const rules = fs.readFileSync("firestore.rules", "utf8");
  const res = await fetch(`http://127.0.0.1:${FIRESTORE_PORT}/emulator/v1/projects/${PROJECT_ID}:securityRules`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rules: { files: [{ name: "firestore.rules", content: rules }] } }),
  });
  assert.equal(res.status, 200, "Failed to load authoritative firestore.rules into emulator");

  // 2. Initialize Firebase Admin
  process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${FIRESTORE_PORT}`;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = `127.0.0.1:${AUTH_PORT}`;
  process.env.GCLOUD_PROJECT = PROJECT_ID;

  if (getApps().length === 0) {
    adminApp = adminInit({ projectId: PROJECT_ID });
  } else {
    adminApp = getApps()[0]!;
  }

  // 3. Create normal users
  userA = await createClientContext("user-a");
  userB = await createClientContext("user-b");

  // 4. Create admin user with custom claim { admin: true }
  const adminUid = `admin-${Date.now()}`;
  await adminAuth(adminApp).createUser({ uid: adminUid, email: `admin-${Date.now()}@example.test` });
  await adminAuth(adminApp).setCustomUserClaims(adminUid, { admin: true });
  const adminToken = await adminAuth(adminApp).createCustomToken(adminUid);
  adminUser = await createClientContext("admin-claimed", adminToken);

  // 5. Create unprivileged user who has document role: "admin" or legacy email but NO claims
  const unprivUid = `unpriv-${Date.now()}`;
  await adminAuth(adminApp).createUser({ uid: unprivUid, email: `wizzare-${Date.now()}@gmail.com` });
  const unprivToken = await adminAuth(adminApp).createCustomToken(unprivUid);
  unprivilegedAdminUser = await createClientContext("unprivileged-admin", unprivToken);
});

after(async () => {
  if (userA) { await terminate(userA.db); await deleteApp(userA.app); }
  if (userB) { await terminate(userB.db); await deleteApp(userB.app); }
  if (adminUser) { await terminate(adminUser.db); await deleteApp(adminUser.app); }
  if (unprivilegedAdminUser) { await terminate(unprivilegedAdminUser.db); await deleteApp(unprivilegedAdminUser.app); }
});

test("SECTION 1: UID Isolation across Firestore collections", async () => {
  // First seed user B's document via admin
  await adminFirestore(adminApp).doc(`users/${userB.uid}`).set({
    displayName: "User B",
    language: "id",
  });
  await adminFirestore(adminApp).doc(`blueprints/${userB.uid}`).set({
    status: "ready",
  });
  await adminFirestore(adminApp).doc(`healingMemory/${userB.uid}`).set({
    notes: "private healing note",
  });
  await adminFirestore(adminApp).doc(`journeyData/${userB.uid}`).set({
    checkpoint: "day_5",
  });
  await adminFirestore(adminApp).doc(`testerBadgeRegistry/${userB.uid}`).set({
    badge: "Founder",
    membership: "LIFETIME_PREMIUM",
  });
  await adminFirestore(adminApp).doc(`adminRoleRegistry/${userB.uid}`).set({
    assignedAt: "2026-06-01",
  });

  // User A attempting to read User B's documents
  await expectDenied(getDoc(doc(userA.db, "users", userB.uid)), "User A reading User B's user doc");
  await expectDenied(getDoc(doc(userA.db, "blueprints", userB.uid)), "User A reading User B's blueprint doc");
  await expectDenied(getDoc(doc(userA.db, "healingMemory", userB.uid)), "User A reading User B's healing memory");
  await expectDenied(getDoc(doc(userA.db, "journeyData", userB.uid)), "User A reading User B's journey data");
  await expectDenied(getDoc(doc(userA.db, "testerBadgeRegistry", userB.uid)), "User A reading User B's tester badge registry");
  await expectDenied(getDoc(doc(userA.db, "adminRoleRegistry", userB.uid)), "User A reading User B's admin role registry");

  // User A attempting to write User B's documents
  await expectDenied(setDoc(doc(userA.db, "users", userB.uid), { displayName: "Hacked" }), "User A writing User B's user doc");
  await expectDenied(setDoc(doc(userA.db, "blueprints", userB.uid), { status: "pending" }), "User A writing User B's blueprint doc");
  await expectDenied(setDoc(doc(userA.db, "healingMemory", userB.uid), { notes: "tampered" }), "User A writing User B's healing memory");
  await expectDenied(setDoc(doc(userA.db, "journeyData", userB.uid), { checkpoint: "tampered" }), "User A writing User B's journey data");

  // User A attempting cross-account collection-group read
  await expectDenied(getDocs(collectionGroup(userA.db, "communications")), "User A reading collectionGroup communications");

  // User A attempting to read admin/analytics logs
  await expectDenied(getDoc(doc(userA.db, "adminAuditLogs", "log1")), "User A reading adminAuditLogs");
  await expectDenied(getDoc(doc(userA.db, "analytics", "event1")), "User A reading analytics doc");
});

test("SECTION 2: Server-Owned Fields & Privilege Escalation Protection", async () => {
  const userRef = doc(userA.db, "users", userA.uid);

  // Initial valid create with allowed fields
  await setDoc(userRef, { displayName: "User A", language: "id", gender: "FEMALE" });
  const snap = await getDoc(userRef);
  assert.equal(snap.data()?.displayName, "User A");

  // Attempting to self-grant Premium / Entitlement
  await expectDenied(updateDoc(userRef, { isPremium: true }), "Self-grant isPremium");
  await expectDenied(updateDoc(userRef, { membershipType: "LIFETIME" }), "Self-grant membershipType: LIFETIME");
  await expectDenied(updateDoc(userRef, { entitlementSource: "admin_lifetime" }), "Self-grant entitlementSource");
  await expectDenied(updateDoc(userRef, { plan: "premium" }), "Self-grant plan: premium");
  await expectDenied(updateDoc(userRef, { trialStartedAt: "2026-01-01" }), "Self-grant trialStartedAt");

  // Attempting to self-grant Founder / Admin roles & badges
  await expectDenied(updateDoc(userRef, { badge: "Founder" }), "Self-grant badge: Founder");
  await expectDenied(updateDoc(userRef, { testerBadge: "Founder" }), "Self-grant testerBadge: Founder");
  await expectDenied(updateDoc(userRef, { role: "admin" }), "Self-grant role: admin");
  await expectDenied(updateDoc(userRef, { guardianRole: "founder" }), "Self-grant guardianRole: founder");

  // Attempting to write server registries
  await expectDenied(
    setDoc(doc(userA.db, "testerBadgeRegistry", userA.uid), { badge: "Founder", membership: "LIFETIME_PREMIUM" }),
    "Client writing testerBadgeRegistry"
  );
  await expectDenied(
    setDoc(doc(userA.db, "adminRoleRegistry", userA.uid), { assignedAt: "2026-01-01" }),
    "Client writing adminRoleRegistry"
  );

  // Attempting to forge canonical birth metadata
  await expectDenied(updateDoc(userRef, { canonicalBirthRevision: 42 }), "Client forging canonicalBirthRevision");
  await expectDenied(updateDoc(userRef, { canonicalBirthEpoch: "forged" }), "Client forging canonicalBirthEpoch");

  // Attempting to write canonical birth data directly to users/{uid}
  await expectDenied(updateDoc(userRef, { birthDate: "1990-01-01" }), "Client direct write birthDate");
  await expectDenied(updateDoc(userRef, { birthCity: "Jakarta" }), "Client direct write birthCity");
  await expectDenied(updateDoc(userRef, { latitude: -6.2, longitude: 106.8 }), "Client direct write lat/long");

  // Attempting to write birth data via nested profile
  await expectDenied(updateDoc(userRef, { "profile.blueprintInput": { birthDate: "1990-01-01" } }), "Client write profile.blueprintInput");
  await expectDenied(updateDoc(userRef, { "profile.birthCity": "Jakarta" }), "Client write profile.birthCity");

  // Attempting to write server-owned subcollections
  await expectDenied(
    setDoc(doc(userA.db, "users", userA.uid, "canonical", "birth"), { birthDate: "1990-01-01" }),
    "Client writing canonical/birth subcollection"
  );
  await expectDenied(
    setDoc(doc(userA.db, "users", userA.uid, "birthOperations", "op_123"), { status: "success" }),
    "Client writing birthOperations subcollection"
  );

  // Attempting to forge computed blueprint engine results in blueprints/{uid}
  const bpRef = doc(userA.db, "blueprints", userA.uid);
  await expectDenied(
    setDoc(bpRef, {
      status: "ready",
      humanDesign: { type: "Projector", source: "forged" },
      astrology: { sunSign: "Leo" },
    }),
    "Client writing forged computed engines in blueprints/{uid}"
  );
});

test("SECTION 3: Allowed Client Operations (Build 120/121 Compliant)", async () => {
  const userRef = doc(userA.db, "users", userA.uid);

  // Update permitted user settings
  await updateDoc(userRef, {
    language: "en",
    theme: "dark",
  });
  const updatedUser = await getDoc(userRef);
  assert.equal(updatedUser.data()?.language, "en");
  assert.equal(updatedUser.data()?.theme, "dark");

  // Blueprint status update (permitted keys: status, error, updatedAt)
  const bpRef = doc(userA.db, "blueprints", userA.uid);
  await setDoc(bpRef, {
    status: "pending",
    updatedAt: "2026-11-01T00:00:00Z",
  });
  const bpSnap = await getDoc(bpRef);
  assert.equal(bpSnap.data()?.status, "pending");

  // Behavior memory / wellness permitted write
  const wellnessRef = doc(userA.db, "users", userA.uid, "behaviorMemory", "wellness");
  await setDoc(wellnessRef, {
    uid: userA.uid,
    updatedAt: "2026-11-01T00:00:00Z",
    recommendations: ["hydrate", "reflect"],
    lastSeenAt: "2026-11-01T00:00:00Z",
    capacityProfile: "BALANCED",
    contextCompletions: {},
    seenRecommendationKeys: [],
  });
  const wellnessSnap = await getDoc(wellnessRef);
  assert.equal(wellnessSnap.data()?.capacityProfile, "BALANCED");

  // Public config read (/app_config/version)
  await adminFirestore(adminApp).doc("app_config/version").set({
    minVersionCode: 120,
    latestVersionCode: 121,
  });
  const configSnap = await getDoc(doc(userA.db, "app_config", "version"));
  assert.equal(configSnap.data()?.minVersionCode, 120);

  // Unauthenticated analytics event write for sign-in failures
  const unauthApp = initializeApp(
    { apiKey: "synthetic", projectId: PROJECT_ID, appId: `unauth-${Date.now()}` },
    `unauth-${Date.now()}`
  );
  const unauthDb = getFirestore(unauthApp);
  connectFirestoreEmulator(unauthDb, "127.0.0.1", FIRESTORE_PORT);

  await setDoc(doc(unauthDb, "analytics", `err-${Date.now()}`), {
    eventType: "google_signin_failed",
    error: "network_error",
    timestamp: new Date().toISOString(),
  });
  await terminate(unauthDb);
  await deleteApp(unauthApp);
});

test("SECTION 4: Admin Custom Claims Authorization vs Client Claims/Roles", async () => {
  // Seed a user support thread in User B's communication collection
  await adminFirestore(adminApp).doc(`users/${userB.uid}/communications/msg-user-1`).set({
    uid: userB.uid,
    ownerUserId: userB.uid,
    senderUid: userB.uid,
    senderRole: "user",
    recipientRole: "admin",
    source: "user",
    threadId: "thread-001",
    message: "Help needed",
  });

  // 1. Unprivileged user attempting admin reply directly to User B's thread -> DENIED
  await expectDenied(
    setDoc(doc(unprivilegedAdminUser.db, "users", userB.uid, "communications", "reply-unpriv"), {
      uid: userB.uid,
      ownerUserId: userB.uid,
      senderUid: unprivilegedAdminUser.uid,
      senderRole: "admin",
      recipientRole: "user",
      source: "admin",
      threadId: "thread-001",
      message: "Forged admin reply",
    }),
    "Unprivileged user without admin token claim attempting admin reply"
  );

  // 2. Even claimed admin user CANNOT directly write to another user's communications via client SDK
  // (Fail-closed design: administrative replies must be dispatched through trusted callable backend)
  await expectDenied(
    setDoc(doc(adminUser.db, "users", userB.uid, "communications", "reply-admin-client-direct"), {
      uid: userB.uid,
      ownerUserId: userB.uid,
      senderRole: "admin",
      recipientRole: "user",
      source: "admin",
      threadId: "thread-001",
      message: "Admin direct client write",
    }),
    "Claimed admin direct client write to user communications (must use backend callable)"
  );

  // 3. Trusted backend (Admin SDK) writes official admin reply
  await adminFirestore(adminApp).doc(`users/${userB.uid}/communications/reply-admin-1`).set({
    uid: userB.uid,
    ownerUserId: userB.uid,
    senderRole: "admin",
    recipientRole: "user",
    source: "admin",
    threadId: "thread-001",
    message: "Official admin reply from trusted backend",
  });
  const replySnap = await adminFirestore(adminApp).doc(`users/${userB.uid}/communications/reply-admin-1`).get();
  assert.equal(replySnap.data()?.source, "admin");

  // User B (thread owner) can read the reply
  const userBReadSnap = await getDoc(doc(userB.db, "users", userB.uid, "communications", "reply-admin-1"));
  assert.equal(userBReadSnap.data()?.source, "admin");

  // User A (different user) CANNOT read User B's communication reply
  await expectDenied(
    getDoc(doc(userA.db, "users", userB.uid, "communications", "reply-admin-1")),
    "User A reading User B's admin reply"
  );

  // 4. Claimed admin still CANNOT perform broad unauthenticated cross-user collection reads
  await expectDenied(
    getDocs(collection(adminUser.db, "users")),
    "Admin token attempting collection read on all users"
  );
  await expectDenied(
    getDocs(collectionGroup(adminUser.db, "communications")),
    "Admin token attempting broad collectionGroup read on communications"
  );
});

test("SECTION 5: Client Compatibility Matrix Verification (118, 119, 120, candidate 121)", async () => {
  // Client 118: Attempts direct birth write during onboarding -> DENIED under hardened rules
  const client118Uid = `client118-${Date.now()}`;
  const client118 = await createClientContext("client-118");
  await expectDenied(
    setDoc(doc(client118.db, "users", client118.uid), {
      displayName: "Legacy 118 User",
      birthDate: "1995-05-15",
      birthTime: "14:30",
      birthCity: "Bandung",
      timezone: "Asia/Jakarta",
    }),
    "Client 118 direct onboarding birth write"
  );
  await terminate(client118.db);
  await deleteApp(client118.app);

  // Client 119: Attempts profile update with nested blueprintInput -> DENIED under hardened rules
  const client119 = await createClientContext("client-119");
  await setDoc(doc(client119.db, "users", client119.uid), { displayName: "Legacy 119 User" });
  await expectDenied(
    updateDoc(doc(client119.db, "users", client119.uid), {
      "profile.blueprintInput": {
        birthDate: "1992-08-20",
        birthCity: "Surabaya",
      },
    }),
    "Client 119 profile update with nested blueprintInput"
  );
  await terminate(client119.db);
  await deleteApp(client119.app);

  // Client 120: Writes sanitized presentation profile -> SUCCEEDS
  const client120 = await createClientContext("client-120");
  await setDoc(doc(client120.db, "users", client120.uid), {
    displayName: "Client 120 User",
    language: "id",
    gender: "MALE",
  });
  const snap120 = await getDoc(doc(client120.db, "users", client120.uid));
  assert.equal(snap120.data()?.displayName, "Client 120 User");
  await terminate(client120.db);
  await deleteApp(client120.app);

  // Client 121: Uses Cloudflare Canonical Worker for birth mutations + safe presentation writes
  const client121 = await createClientContext("client-121");
  // Client writes safe profile
  await setDoc(doc(client121.db, "users", client121.uid), {
    displayName: "Client 121 User",
    language: "id",
    theme: "light",
  });
  // Trusted backend (simulated by admin SDK) writes authoritative canonical birth
  await adminFirestore(adminApp).doc(`users/${client121.uid}/canonical/birth`).set({
    birthDate: "1998-12-25",
    birthTime: "08:00",
    birthCity: "Yogyakarta",
    canonicalBirthRevision: 1,
    canonicalBirthEpoch: "ep_121",
  });
  // Client 121 owner can read authoritative canonical birth
  const canonicalSnap = await getDoc(doc(client121.db, "users", client121.uid, "canonical", "birth"));
  assert.equal(canonicalSnap.data()?.birthCity, "Yogyakarta");
  assert.equal(canonicalSnap.data()?.canonicalBirthRevision, 1);

  await terminate(client121.db);
  await deleteApp(client121.app);
});
