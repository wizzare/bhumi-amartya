import { initializeApp, deleteApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp as initializeAdminApp, deleteApp as deleteAdminApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { buildAdminLifetimeProfilePatch } from "../../lib/auth/adminContinuity";

const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "demo-release-suite";
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST ?? "";
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "";

if (!projectId.startsWith("demo-") || !/^(localhost|127\.0\.0\.1):\d+$/.test(firestoreHost) || !/^(localhost|127\.0\.0\.1):\d+$/.test(authHost)) {
  throw new Error("[FAIL_CLOSED_GUARD] Build 106 admin continuity tests require local emulators and a demo-* project.");
}

const [firestoreHostname, firestorePortText] = firestoreHost.split(":");
const [authHostname, authPortText] = authHost.split(":");
const firestorePort = Number(firestorePortText);
const authPort = Number(authPortText);
const runId = Date.now().toString(36);
const password = "synthetic-password-106";

function createClient(label: string) {
  const app = initializeApp({
    apiKey: "synthetic-emulator-key",
    authDomain: `${projectId}.firebaseapp.com`,
    projectId,
    appId: `synthetic-${label}-${runId}`,
  }, `${label}-${runId}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${authHostname}:${authPort}`, { disableWarnings: true });
  const firestore = getFirestore(app);
  connectFirestoreEmulator(firestore, firestoreHostname, firestorePort);
  return { app, auth, firestore };
}

function isPermissionDenied(error: unknown): boolean {
  const value = String(error).toLowerCase();
  return value.includes("permission") || value.includes("denied");
}

async function expectDenied(work: () => Promise<unknown>, label: string) {
  try {
    await work();
  } catch (error) {
    if (isPermissionDenied(error)) return;
    throw error;
  }
  throw new Error(`${label}: expected permission-denied`);
}

let passed = 0;
function pass(label: string) {
  passed += 1;
  console.log(`PASS ${passed}: ${label}`);
}

async function main() {
  const adminApp = initializeAdminApp({ projectId }, `admin-continuity-${runId}`);
  const adminAuth = getAdminAuth(adminApp);
  const adminDb = getAdminFirestore(adminApp);
  const clients: ReturnType<typeof createClient>[] = [];

  try {
  const targetUid = `synthetic-target-${runId}`;
  const targetEmail = `target-${runId}@example.test`;
  await adminAuth.createUser({ uid: targetUid, email: targetEmail, password });
  await adminDb.collection("users").doc(targetUid).set({ uid: targetUid, role: "user", membershipType: "FREE" });
  const targetClient = createClient("target");
  clients.push(targetClient);
  await signInWithEmailAndPassword(targetClient.auth, targetEmail, password);

  const adminPatch = buildAdminLifetimeProfilePatch();
  for (let index = 1; index <= 4; index += 1) {
    const uid = `synthetic-admin-${index}-${runId}`;
    const email = `admin-${index}-${runId}@example.test`;
    await adminAuth.createUser({ uid, email, password });
    await adminDb.collection("users").doc(uid).set({ uid, ...adminPatch });

    const client = createClient(`admin-${index}`);
    clients.push(client);
    await signInWithEmailAndPassword(client.auth, email, password);

    await getDocs(query(collection(client.firestore, "users"), limit(2)));
    await getDoc(doc(client.firestore, "users", targetUid));
    pass(`ADMIN_${index} can list/get users through Firestore role authorization`);

    const messageId = `admin-reply-${index}-${runId}`;
    await setDoc(doc(client.firestore, "users", targetUid, "communications", messageId), {
      id: messageId,
      uid: targetUid,
      ownerUserId: targetUid,
      senderUid: uid,
      senderRole: "admin",
      recipientRole: "user",
      source: "admin",
      threadId: `thread-${index}-${runId}`,
      title: "Synthetic admin reply",
      content: "Synthetic test content",
    });
    const userVisibleMessage = await getDoc(doc(targetClient.firestore, "users", targetUid, "communications", messageId));
    if (!userVisibleMessage.exists()) throw new Error(`ADMIN_${index} reply did not persist to the user inbox path.`);
    pass(`ADMIN_${index} reply persists and is readable by the target user`);

    const broadcastId = `broadcast-${index}-${runId}`;
    await setDoc(doc(client.firestore, "broadcasts", broadcastId), {
      id: broadcastId,
      adminUid: uid,
      targetGroups: ["all"],
      title: "Synthetic broadcast",
    });
    pass(`ADMIN_${index} can create UID-attributed broadcast metadata`);

    await updateDoc(doc(client.firestore, "users", targetUid), { internalTesterLabel: `reviewed-${index}` });
    const reviewed = await getDoc(doc(targetClient.firestore, "users", targetUid));
    if (reviewed.data()?.internalTesterLabel !== `reviewed-${index}`) throw new Error(`ADMIN_${index} user-management write did not persist.`);
    pass(`ADMIN_${index} user-management write persists to the target profile`);

    await signOut(client.auth);
    await signInWithEmailAndPassword(client.auth, email, password);
    await getDocs(query(collection(client.firestore, "users"), limit(1)));
    pass(`ADMIN_${index} authorization survives logout/login`);
  }

  const premiumUid = `synthetic-premium-${runId}`;
  const premiumEmail = `premium-${runId}@example.test`;
  await adminAuth.createUser({ uid: premiumUid, email: premiumEmail, password });
  await adminDb.collection("users").doc(premiumUid).set({
    uid: premiumUid,
    role: "user",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: new Date("2099-01-01T00:00:00Z"),
  });
  const premiumClient = createClient("premium");
  clients.push(premiumClient);
  await signInWithEmailAndPassword(premiumClient.auth, premiumEmail, password);
  await expectDenied(() => getDocs(query(collection(premiumClient.firestore, "users"), limit(1))), "Premium list users");
  await expectDenied(() => setDoc(doc(premiumClient.firestore, "broadcasts", `premium-${runId}`), {
    id: `premium-${runId}`,
    adminUid: premiumUid,
    targetGroups: ["all"],
  }), "Premium broadcast");
  pass("normal Premium user receives no admin Firestore authorization");

  const freeUid = `synthetic-free-${runId}`;
  const freeEmail = `free-${runId}@example.test`;
  await adminAuth.createUser({ uid: freeUid, email: freeEmail, password });
  await adminDb.collection("users").doc(freeUid).set({ uid: freeUid, role: "user", membershipType: "FREE" });
  const freeClient = createClient("free");
  clients.push(freeClient);
  await signInWithEmailAndPassword(freeClient.auth, freeEmail, password);
  await expectDenied(() => updateDoc(doc(freeClient.firestore, "users", freeUid), { role: "admin" }), "Free self-elevation role");
  await expectDenied(() => updateDoc(doc(freeClient.firestore, "users", freeUid), { membershipType: "LIFETIME" }), "Free self-elevation lifetime");
  pass("normal free user cannot self-elevate role or lifetime entitlement");

  const noProfileUid = `synthetic-no-profile-${runId}`;
  const noProfileEmail = `no-profile-${runId}@example.test`;
  await adminAuth.createUser({ uid: noProfileUid, email: noProfileEmail, password });
  const noProfileClient = createClient("no-profile");
  clients.push(noProfileClient);
  await signInWithEmailAndPassword(noProfileClient.auth, noProfileEmail, password);
  await expectDenied(() => getDocs(query(collection(noProfileClient.firestore, "users"), limit(1))), "Missing-profile admin list");
  pass("missing/read-unavailable canonical role fails closed");

  console.log(`BUILD106_ADMIN_LIFETIME_EMULATOR_PASS assertions=${passed}`);
  } finally {
    await Promise.all(clients.map(({ app }) => deleteApp(app).catch(() => undefined)));
    await deleteAdminApp(adminApp).catch(() => undefined);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
