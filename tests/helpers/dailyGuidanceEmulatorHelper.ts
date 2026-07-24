import { initializeApp, getApps, deleteApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, deleteDoc, Firestore } from "firebase/firestore";

export const TEST_PROJECT_ID = "bhumi-build80-emulator-test";
export const SYNTHETIC_USER_A = "test-daily-user-a";
export const SYNTHETIC_USER_B = "test-daily-user-b";
export const EXPECTED_FIRESTORE_PORT = 8080;
export const EXPECTED_AUTH_PORT = 9099;

const FORBIDDEN_PRODUCTION_PROJECT_IDS = [
  "bhumiamartya-fe85c",
  "bhumi-amartya",
  "bhumi-production",
];

interface TestHarness {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  cleanup: () => Promise<void>;
}

let activeHarness: TestHarness | null = null;

export function verifyFailClosedSafetyGuard(): void {
  const hostEnv = process.env.FIRESTORE_EMULATOR_HOST;
  const authHostEnv = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const projectEnv = process.env.GCLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Rule 1: Fail closed if emulator host environment variable is missing
  if (!hostEnv) {
    throw new Error("[FAIL_CLOSED_GUARD] FIRESTORE_EMULATOR_HOST is not set. Execution aborted.");
  }

  // Rule 2: Host MUST be localhost or 127.0.0.1
  const isLocalhost = hostEnv.includes("127.0.0.1") || hostEnv.includes("localhost");
  if (!isLocalhost) {
    throw new Error(`[FAIL_CLOSED_GUARD] FIRESTORE_EMULATOR_HOST must target localhost/127.0.0.1. Got: ${hostEnv}`);
  }

  // Rule 3: Reject Production Project IDs
  if (projectEnv && FORBIDDEN_PRODUCTION_PROJECT_IDS.includes(projectEnv)) {
    throw new Error(`[FAIL_CLOSED_GUARD] FORBIDDEN: Production project ID '${projectEnv}' detected! Execution aborted.`);
  }

  // Rule 4: Synthetic Project ID required for test harness
  if (projectEnv && projectEnv !== TEST_PROJECT_ID) {
    throw new Error(`[FAIL_CLOSED_GUARD] Project ID must be synthetic '${TEST_PROJECT_ID}'. Got: '${projectEnv}'`);
  }
}

export function setupDailyGuidanceEmulatorHarness(): TestHarness {
  verifyFailClosedSafetyGuard();

  if (activeHarness) {
    return activeHarness;
  }

  // Initialize isolated Firebase App strictly for emulator testing
  const dummyConfig = {
    apiKey: "fake-emulator-api-key-12345",
    authDomain: `${TEST_PROJECT_ID}.firebaseapp.com`,
    projectId: TEST_PROJECT_ID,
    storageBucket: `${TEST_PROJECT_ID}.appspot.com`,
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456",
  };

  // Ensure clean slate app initialization
  const existingApps = getApps();
  for (const existing of existingApps) {
    deleteApp(existing).catch(() => {});
  }

  const app = initializeApp(dummyConfig, `emulator-test-app-${Date.now()}`);
  const authInstance = getAuth(app);
  const dbInstance = getFirestore(app);

  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || `127.0.0.1:${EXPECTED_FIRESTORE_PORT}`;
  const [host, portStr] = firestoreHost.split(":");
  const port = parseInt(portStr || "8080", 10);

  connectFirestoreEmulator(dbInstance, host || "127.0.0.1", port);
  connectAuthEmulator(authInstance, `http://127.0.0.1:${EXPECTED_AUTH_PORT}`, { disableWarnings: true });

  const cleanup = async () => {
    try {
      await deleteDoc(doc(dbInstance, "dailyGuidance", `${SYNTHETIC_USER_A}_2026_07_24`));
      await deleteDoc(doc(dbInstance, "dailyGuidance", `${SYNTHETIC_USER_B}_2026_07_24`));
    } catch {
      // Ignore teardown cleanup errors
    }
  };

  activeHarness = {
    app,
    auth: authInstance,
    db: dbInstance,
    cleanup,
  };

  return activeHarness;
}
