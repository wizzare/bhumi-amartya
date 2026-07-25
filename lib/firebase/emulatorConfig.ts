import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectFunctionsEmulator } from "firebase/functions";

const EMULATOR_HOST_AUTH = "127.0.0.1";
const EMULATOR_PORT_AUTH = 9099;
const EMULATOR_HOST_FIRESTORE = "127.0.0.1";
const EMULATOR_PORT_FIRESTORE = 8080;
const EMULATOR_HOST_FUNCTIONS = "127.0.0.1";
const EMULATOR_PORT_FUNCTIONS = 5001;

type FirebaseEmulatorGlobal = typeof globalThis & {
  __bhumiFirebaseEmulatorConnections?: {
    auth: WeakSet<object>;
    firestore: WeakSet<object>;
    functions: WeakSet<object>;
  };
};

export function shouldUseFirebaseEmulators(env?: Record<string, string | undefined>): boolean {
  // Keep the browser-runtime branch as a direct public-env access. Next.js
  // replaces direct NEXT_PUBLIC_* accesses in the client bundle, but cannot
  // safely inline a value reached through an indirect process.env object.
  const flag = env
    ? env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS
    : process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS;
  return flag === "true";
}

export function getFirebaseEmulatorEndpoints() {
  return {
    auth: { host: EMULATOR_HOST_AUTH, port: EMULATOR_PORT_AUTH, url: `http://${EMULATOR_HOST_AUTH}:${EMULATOR_PORT_AUTH}` },
    firestore: { host: EMULATOR_HOST_FIRESTORE, port: EMULATOR_PORT_FIRESTORE, url: `${EMULATOR_HOST_FIRESTORE}:${EMULATOR_PORT_FIRESTORE}` },
    functions: { host: EMULATOR_HOST_FUNCTIONS, port: EMULATOR_PORT_FUNCTIONS, url: `${EMULATOR_HOST_FUNCTIONS}:${EMULATOR_PORT_FUNCTIONS}` },
  } as const;
}

function getConnectionRegistry() {
  const g = globalThis as FirebaseEmulatorGlobal;
  if (!g.__bhumiFirebaseEmulatorConnections) {
    g.__bhumiFirebaseEmulatorConnections = {
      auth: new WeakSet<object>(),
      firestore: new WeakSet<object>(),
      functions: new WeakSet<object>(),
    };
  }
  return g.__bhumiFirebaseEmulatorConnections;
}

export function connectFirestoreEmulatorOnce(db: object): void {
  const registry = getConnectionRegistry();
  if (registry.firestore.has(db)) return;
  const endpoint = getFirebaseEmulatorEndpoints().firestore;
  connectFirestoreEmulator(db as Parameters<typeof connectFirestoreEmulator>[0], endpoint.host, endpoint.port);
  registry.firestore.add(db);
}

export function connectFunctionsEmulatorOnce(functions: object): void {
  const registry = getConnectionRegistry();
  if (registry.functions.has(functions)) return;
  const endpoint = getFirebaseEmulatorEndpoints().functions;
  connectFunctionsEmulator(functions as Parameters<typeof connectFunctionsEmulator>[0], endpoint.host, endpoint.port);
  registry.functions.add(functions);
}

export function assertFirestoreEmulatorWired(db: object): void {
  if (!shouldUseFirebaseEmulators()) return;
  if (!getConnectionRegistry().firestore.has(db)) {
    throw new Error("Firestore emulator mode is enabled, but this Firestore instance is not wired to 127.0.0.1:8080.");
  }
}

export function connectEmulators(auth: object, db: object, functions: object): void {
  const registry = getConnectionRegistry();
  const endpoints = getFirebaseEmulatorEndpoints();

  if (!registry.auth.has(auth)) {
    connectAuthEmulator(auth as Parameters<typeof connectAuthEmulator>[0], endpoints.auth.url, { disableWarnings: true });
    registry.auth.add(auth);
  }

  connectFirestoreEmulatorOnce(db);
  connectFunctionsEmulatorOnce(functions);

  if (process.env.NODE_ENV !== "production") {
    console.info("[DEV] Firebase emulators connected", {
      auth: endpoints.auth.url,
      firestore: endpoints.firestore.url,
      functions: endpoints.functions.url,
      initializedAt: new Date().toISOString(),
    });
  }
}
