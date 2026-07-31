import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInAnonymously,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDocFromServer,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp as initAdminApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

const TEST_PROJECT_ID = "demo-no-project";
const FIRESTORE_PORT = 8080;
const AUTH_PORT = 9099;

function verifyFailClosedSafetyGuard() {
  const hostEnv = process.env.FIRESTORE_EMULATOR_HOST;
  if (!hostEnv) throw new Error("[FAIL_CLOSED_GUARD] FIRESTORE_EMULATOR_HOST is not set. Execution aborted.");
  const isLocalhost = hostEnv.includes("127.0.0.1") || hostEnv.includes("localhost");
  if (!isLocalhost) throw new Error(`[FAIL_CLOSED_GUARD] FIRESTORE_EMULATOR_HOST must target localhost/127.0.0.1. Got: ${hostEnv}`);
}

async function clearEmulatorData() {
  try {
    const host = process.env.FIRESTORE_EMULATOR_HOST || `127.0.0.1:${FIRESTORE_PORT}`;
    const url = `http://${host}/emulator/v1/projects/${TEST_PROJECT_ID}/databases/(default)/documents`;
    await fetch(url, { method: "DELETE" });
  } catch {
    // Ignore if emulator REST API unavailable
  }
}

function createClientApp(nameTag) {
  const dummyConfig = {
    apiKey: "fake-emulator-api-key-12345",
    authDomain: `${TEST_PROJECT_ID}.firebaseapp.com`,
    projectId: TEST_PROJECT_ID,
    storageBucket: `${TEST_PROJECT_ID}.appspot.com`,
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456",
  };
  const app = initializeApp(dummyConfig, `app-${nameTag}-${Date.now()}-${Math.random()}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://127.0.0.1:${AUTH_PORT}`, { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, "127.0.0.1", FIRESTORE_PORT);
  return { app, auth, db };
}

function isPermissionDenied(e) {
  if (!e) return false;
  const str = String(e).toLowerCase();
  return (
    str.includes("permission") ||
    str.includes("insufficient") ||
    str.includes("denied") ||
    e?.code === "permission-denied" ||
    e?.code === 7
  );
}

export async function runCompatBridgeAndSelfElevationTests() {
  console.log("\n==================================================================");
  console.log("=== COMPAT-BRIDGE + SELF-ELEVATION PROBE EMULATOR SUITE         ===");
  console.log("==================================================================\n");

  verifyFailClosedSafetyGuard();
  await clearEmulatorData();

  process.env.FIREBASE_AUTH_EMULATOR_HOST = `127.0.0.1:${AUTH_PORT}`;
  const adminSdkApp = initAdminApp({ projectId: TEST_PROJECT_ID }, `admin-sdk-${Date.now()}`);
  const adminSdkAuth = getAdminAuth(adminSdkApp);
  const adminSdkDb = getAdminFirestore(adminSdkApp);

  let passed = 0;
  let total = 0;

  function assert(condition, description) {
    total++;
    if (condition) {
      passed++;
      console.log(`  \u2713 PASS [${total.toString().padStart(2, "0")}]: ${description}`);
    } else {
      console.error(`  \u2717 FAIL [${total.toString().padStart(2, "0")}]: ${description}`);
      throw new Error(`[RULES_TEST_FAIL] ${description}`);
    }
  }

  // Target doc every actor tries to read; ownership is irrelevant here because
  // gate under test is isAdminActor() -> isFounderByEmail() || isFounderOrAdmin().
  const targetCtx = createClientApp("target");
  const targetCred = await signInAnonymously(targetCtx.auth);
  const targetUid = targetCred.user.uid;
  await adminSdkDb.collection("testerBadgeRegistry").doc(targetUid).set({ badge: "seed" });

  async function canReadTargetBadge(actorDb) {
    try {
      await getDocFromServer(doc(actorDb, "testerBadgeRegistry", targetUid));
      return true;
    } catch (e) {
      if (isPermissionDenied(e)) return false;
      throw e;
    }
  }

  // ------------------------------------------------------------------
  // SECTION 1: SELF-ELEVATION PROBE (regular user writing role:"admin"
  // to their own users/{uid} document must stay DENIED)
  // ------------------------------------------------------------------
  console.log("--- SECTION 1: SELF-ELEVATION PROBE ---");

  const selfElevateCtx = createClientApp("self-elevate");
  const selfElevateCred = await signInAnonymously(selfElevateCtx.auth);
  const selfElevateUid = selfElevateCred.user.uid;

  // 1. Plain user CREATE own users/{uid} doc with role: "admin" -> DENY
  let e1 = false;
  try {
    await setDoc(doc(selfElevateCtx.db, "users", selfElevateUid), { role: "admin", displayName: "Self Elevate" });
  } catch (e) { e1 = isPermissionDenied(e); }
  assert(e1, "Plain user CREATE own users/{uid} doc with role:\"admin\" is DENIED");

  // Seed a legitimate own-doc (no protected fields) via client so we can test UPDATE path.
  await setDoc(doc(selfElevateCtx.db, "users", selfElevateUid), { displayName: "Self Elevate" });

  // 2. Plain user UPDATE own users/{uid} doc adding role: "admin" -> DENY
  let e2 = false;
  try {
    await updateDoc(doc(selfElevateCtx.db, "users", selfElevateUid), { role: "admin" });
  } catch (e) { e2 = isPermissionDenied(e); }
  assert(e2, "Plain user UPDATE own users/{uid} doc adding role:\"admin\" is DENIED");

  // 3. Confirm the self-elevation attempt did not actually persist "role" (defense in depth)
  const selfDocAfter = await adminSdkDb.collection("users").doc(selfElevateUid).get();
  assert(!("role" in (selfDocAfter.data() || {})), "role field is NOT present on document after denied self-elevation attempts");

  // 4. Regression: isFounderOrAdmin() itself denies this same plain user (no path granted)
  let e4 = false;
  try {
    if (await canReadTargetBadge(selfElevateCtx.db)) e4 = false; else e4 = true;
  } catch (e) { e4 = isPermissionDenied(e); }
  assert(e4, "Plain user attempting self-elevation still FAILS isFounderOrAdmin() gated read");

  // ------------------------------------------------------------------
  // SECTION 2: COMPATIBILITY BRIDGE MATRIX (Tahap 4)
  // ------------------------------------------------------------------
  console.log("\n--- SECTION 2: COMPATIBILITY BRIDGE MATRIX ---");

  // Case A: Legacy admin - role: "admin" in Firestore, NO custom claim
  const legacyAdminCtx = createClientApp("legacy-admin");
  const legacyAdminCred = await signInAnonymously(legacyAdminCtx.auth);
  const legacyAdminUid = legacyAdminCred.user.uid;
  await adminSdkDb.collection("users").doc(legacyAdminUid).set({ role: "admin" });
  let a = false;
  try { a = await canReadTargetBadge(legacyAdminCtx.db); } catch (e) { throw e; }
  assert(a, "Legacy admin (role:\"admin\", NO custom claim) PASSES isFounderOrAdmin()");

  // Case B: Admin via custom claim, NO legacy Firestore role
  const claimAdminCtx = createClientApp("claim-admin");
  const claimAdminEmail = `claim-admin-${Date.now()}@test.com`;
  const claimAdminRecord = await adminSdkAuth.createUser({ email: claimAdminEmail, password: "password123" });
  await adminSdkAuth.setCustomUserClaims(claimAdminRecord.uid, { admin: true });
  await signInWithEmailAndPassword(claimAdminCtx.auth, claimAdminEmail, "password123");
  let b = false;
  try { b = await canReadTargetBadge(claimAdminCtx.db); } catch (e) { throw e; }
  assert(b, "Admin custom claim (admin:true, NO legacy role) PASSES isFounderOrAdmin()");

  // Case C: Founder by email, NO custom claim, NO legacy role (regression guard)
  const founderEmailCtx = createClientApp("founder-email-bridge");
  await adminSdkAuth.createUser({ email: "wizzare@gmail.com", password: "password123" }).catch(() => null);
  await signInWithEmailAndPassword(founderEmailCtx.auth, "wizzare@gmail.com", "password123");
  let c = false;
  try { c = await canReadTargetBadge(founderEmailCtx.db); } catch (e) { throw e; }
  assert(c, "Founder by email (NO custom claim, NO legacy role) still PASSES isFounderOrAdmin() (no regression)");

  // Case D: Plain user, none of the three paths -> FAIL
  const plainUserCtx = createClientApp("plain-user-bridge");
  await signInAnonymously(plainUserCtx.auth);
  let d = true;
  try { d = await canReadTargetBadge(plainUserCtx.db); } catch (e) { throw e; }
  assert(d === false, "Plain user (none of the 3 paths) FAILS isFounderOrAdmin()");

  // Case E: Case-insensitivity - role: "Admin" (uppercase), NO custom claim
  const caseAdminCtx = createClientApp("case-admin");
  const caseAdminCred = await signInAnonymously(caseAdminCtx.auth);
  const caseAdminUid = caseAdminCred.user.uid;
  await adminSdkDb.collection("users").doc(caseAdminUid).set({ role: "Admin" });
  let e = false;
  try { e = await canReadTargetBadge(caseAdminCtx.db); } catch (err) { throw err; }
  assert(e, "Legacy admin with role:\"Admin\" (mixed case) PASSES isFounderOrAdmin() (case-insensitivity fix verified)");

  console.log(`\n==================================================================`);
  console.log(`=== COMPAT-BRIDGE + SELF-ELEVATION SUITE COMPLETE               ===`);
  console.log(`=== TOTAL PASSED: ${passed}/${total} ASSERTIONS                          ===`);
  console.log(`==================================================================\n`);
}

runCompatBridgeAndSelfElevationTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nTEST SUITE FAILED WITH ERROR:", err);
    process.exit(1);
  });
