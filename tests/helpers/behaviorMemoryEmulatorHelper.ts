export const BEHAVIOR_TEST_PROJECT_ID = "bhumi-build80-behavior-memory-test";
export const EXPECTED_FIRESTORE_PORT = 8080;
export const EXPECTED_AUTH_PORT = 9099;

// Populate synthetic Firebase env vars BEFORE loading @/lib/firebase/config
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "fake-behavior-emulator-api-key-999";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${BEHAVIOR_TEST_PROJECT_ID}.firebaseapp.com`;
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = BEHAVIOR_TEST_PROJECT_ID;
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${BEHAVIOR_TEST_PROJECT_ID}.appspot.com`;
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "9876543210";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:9876543210:web:1234567890abcdef";

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, signInAnonymously, signOut, Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";
import { auth as primaryAuth, db as primaryDb } from "@/lib/firebase/config";

const FORBIDDEN_PRODUCTION_PROJECT_IDS = [
  "bhumiamartya-fe85c",
  "bhumi-amartya",
  "bhumi-production",
];

let primaryEmulatorConnected = false;

export function connectPrimaryToEmulator(): void {
  verifyFailClosedSafetyGuard();
  if (primaryEmulatorConnected) return;

  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || `127.0.0.1:${EXPECTED_FIRESTORE_PORT}`;
  const [host, portStr] = firestoreHost.split(":");
  const port = parseInt(portStr || "8080", 10);

  connectFirestoreEmulator(primaryDb, host || "127.0.0.1", port);
  connectAuthEmulator(primaryAuth, `http://127.0.0.1:${EXPECTED_AUTH_PORT}`, { disableWarnings: true });
  primaryEmulatorConnected = true;
}

import { doc, setDoc } from "firebase/firestore";

export async function authenticatePrimaryUser(): Promise<{ uid: string; auth: Auth; db: Firestore }> {
  connectPrimaryToEmulator();
  if (primaryAuth.currentUser) {
    await signOut(primaryAuth).catch(() => {});
  }
  const cred = await signInAnonymously(primaryAuth);
  const uid = cred.user.uid;
  await setDoc(doc(primaryDb, "users", uid), { uid }).catch(() => {});
  return { uid, auth: primaryAuth, db: primaryDb };
}

export function verifyFailClosedSafetyGuard(): void {
  const hostEnv = process.env.FIRESTORE_EMULATOR_HOST;
  const authHostEnv = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const projectEnv = process.env.GCLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const credsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!hostEnv) {
    throw new Error("[FAIL_CLOSED_GUARD] FIRESTORE_EMULATOR_HOST is not set. Execution aborted.");
  }

  const isLocalhost = hostEnv.includes("127.0.0.1") || hostEnv.includes("localhost");
  if (!isLocalhost) {
    throw new Error(`[FAIL_CLOSED_GUARD] FIRESTORE_EMULATOR_HOST must target localhost/127.0.0.1. Got: ${hostEnv}`);
  }

  if (authHostEnv) {
    const isAuthLocalhost = authHostEnv.includes("127.0.0.1") || authHostEnv.includes("localhost");
    if (!isAuthLocalhost) {
      throw new Error(`[FAIL_CLOSED_GUARD] FIREBASE_AUTH_EMULATOR_HOST must target localhost/127.0.0.1. Got: ${authHostEnv}`);
    }
  }

  if (credsEnv) {
    throw new Error("[FAIL_CLOSED_GUARD] GOOGLE_APPLICATION_CREDENTIALS must not be set for client emulator tests. Execution aborted.");
  }

  if (projectEnv && FORBIDDEN_PRODUCTION_PROJECT_IDS.includes(projectEnv)) {
    throw new Error(`[FAIL_CLOSED_GUARD] FORBIDDEN: Production project ID '${projectEnv}' detected! Execution aborted.`);
  }

  if (projectEnv && projectEnv !== BEHAVIOR_TEST_PROJECT_ID && !projectEnv.startsWith("demo-")) {
    throw new Error(`[FAIL_CLOSED_GUARD] Project ID must be synthetic '${BEHAVIOR_TEST_PROJECT_ID}' or demo. Got: '${projectEnv}'`);
  }
}

export function testMissingEmulatorHostGuard(): boolean {
  const original = process.env.FIRESTORE_EMULATOR_HOST;
  try {
    delete process.env.FIRESTORE_EMULATOR_HOST;
    verifyFailClosedSafetyGuard();
    return false;
  } catch (err: any) {
    return err?.message?.includes("FIRESTORE_EMULATOR_HOST is not set") ?? false;
  } finally {
    process.env.FIRESTORE_EMULATOR_HOST = original;
  }
}

export function testNonLocalHostGuard(): boolean {
  const original = process.env.FIRESTORE_EMULATOR_HOST;
  try {
    process.env.FIRESTORE_EMULATOR_HOST = "192.168.1.100:8080";
    verifyFailClosedSafetyGuard();
    return false;
  } catch (err: any) {
    return err?.message?.includes("localhost/127.0.0.1") ?? false;
  } finally {
    process.env.FIRESTORE_EMULATOR_HOST = original;
  }
}

export function testProductionProjectIdGuard(): boolean {
  const original = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  try {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "bhumiamartya-fe85c";
    verifyFailClosedSafetyGuard();
    return false;
  } catch (err: any) {
    return err?.message?.includes("Production project ID") ?? false;
  } finally {
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = original;
  }
}

export async function clearEmulatorFirestoreData(): Promise<void> {
  try {
    const host = process.env.FIRESTORE_EMULATOR_HOST || `127.0.0.1:${EXPECTED_FIRESTORE_PORT}`;
    const url = `http://${host}/emulator/v1/projects/${BEHAVIOR_TEST_PROJECT_ID}/databases/(default)/documents`;
    await fetch(url, { method: "DELETE" });
  } catch {
    // Ignore if emulator REST API unavailable
  }
}

export async function createSecondaryAuthenticatedUserDb(prefix = "user-b"): Promise<{ app: FirebaseApp; auth: Auth; db: Firestore; uid: string }> {
  verifyFailClosedSafetyGuard();
  const dummyConfig = {
    apiKey: "fake-behavior-emulator-api-key-999",
    authDomain: `${BEHAVIOR_TEST_PROJECT_ID}.firebaseapp.com`,
    projectId: BEHAVIOR_TEST_PROJECT_ID,
    storageBucket: `${BEHAVIOR_TEST_PROJECT_ID}.appspot.com`,
    messagingSenderId: "9876543210",
    appId: "1:9876543210:web:1234567890abcdef",
  };

  const app = initializeApp(dummyConfig, `behavior-secondary-${prefix}-${Date.now()}-${Math.random()}`);
  const authInstance = getAuth(app);
  const dbInstance = getFirestore(app);

  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || `127.0.0.1:${EXPECTED_FIRESTORE_PORT}`;
  const [host, portStr] = firestoreHost.split(":");
  const port = parseInt(portStr || "8080", 10);

  connectFirestoreEmulator(dbInstance, host || "127.0.0.1", port);
  connectAuthEmulator(authInstance, `http://127.0.0.1:${EXPECTED_AUTH_PORT}`, { disableWarnings: true });

  const cred = await signInAnonymously(authInstance);
  const uid = cred.user.uid;
  await setDoc(doc(dbInstance, "users", uid), { uid }).catch(() => {});

  return { app, auth: authInstance, db: dbInstance, uid };
}

export function createUnauthenticatedDb(): { app: FirebaseApp; db: Firestore } {
  verifyFailClosedSafetyGuard();
  const dummyConfig = {
    apiKey: "fake-behavior-emulator-api-key-999",
    authDomain: `${BEHAVIOR_TEST_PROJECT_ID}.firebaseapp.com`,
    projectId: BEHAVIOR_TEST_PROJECT_ID,
    storageBucket: `${BEHAVIOR_TEST_PROJECT_ID}.appspot.com`,
    messagingSenderId: "9876543210",
    appId: "1:9876543210:web:1234567890abcdef",
  };

  const app = initializeApp(dummyConfig, `unauth-behavior-app-${Date.now()}-${Math.random()}`);
  const dbInstance = getFirestore(app);

  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || `127.0.0.1:${EXPECTED_FIRESTORE_PORT}`;
  const [host, portStr] = firestoreHost.split(":");
  const port = parseInt(portStr || "8080", 10);

  connectFirestoreEmulator(dbInstance, host || "127.0.0.1", port);

  return { app, db: dbInstance };
}
