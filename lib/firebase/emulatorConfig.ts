const EMULATOR_HOST_AUTH = "127.0.0.1";
const EMULATOR_PORT_AUTH = 9099;
const EMULATOR_HOST_FIRESTORE = "127.0.0.1";
const EMULATOR_PORT_FIRESTORE = 8080;
const EMULATOR_HOST_FUNCTIONS = "127.0.0.1";
const EMULATOR_PORT_FUNCTIONS = 5001;

type FirebaseEmulatorGlobal = typeof globalThis & {
  __bhumiFirebaseEmulatorsConnected?: boolean;
};

export function shouldUseFirebaseEmulators(env?: Record<string, string | undefined>): boolean {
  const nodeEnv = (env ?? process.env).NODE_ENV;
  const flag = (env ?? process.env).NEXT_PUBLIC_USE_FIREBASE_EMULATORS;

  if (nodeEnv === "production") return false;
  if (flag === "true") return true;
  return false;
}

export function getFirebaseEmulatorEndpoints() {
  return {
    auth: { host: EMULATOR_HOST_AUTH, port: EMULATOR_PORT_AUTH, url: `http://${EMULATOR_HOST_AUTH}:${EMULATOR_PORT_AUTH}` },
    firestore: { host: EMULATOR_HOST_FIRESTORE, port: EMULATOR_PORT_FIRESTORE, url: `${EMULATOR_HOST_FIRESTORE}:${EMULATOR_PORT_FIRESTORE}` },
    functions: { host: EMULATOR_HOST_FUNCTIONS, port: EMULATOR_PORT_FUNCTIONS, url: `${EMULATOR_HOST_FUNCTIONS}:${EMULATOR_PORT_FUNCTIONS}` },
  } as const;
}

export function connectEmulators(auth: any, db: any, functions: any): void {
  const g = globalThis as FirebaseEmulatorGlobal;
  if (g.__bhumiFirebaseEmulatorsConnected) return;

  const { connectAuthEmulator } = require("firebase/auth");
  const { connectFirestoreEmulator } = require("firebase/firestore");
  const { connectFunctionsEmulator } = require("firebase/functions");

  const endpoints = getFirebaseEmulatorEndpoints();

  connectAuthEmulator(auth, endpoints.auth.url, { disableWarnings: true });
  connectFirestoreEmulator(db, endpoints.firestore.host, endpoints.firestore.port);
  connectFunctionsEmulator(functions, endpoints.functions.host, endpoints.functions.port);

  g.__bhumiFirebaseEmulatorsConnected = true;
  console.log("[DEV] Firebase Emulators connected:", `Auth=${endpoints.auth.url}`, `Firestore=${endpoints.firestore.url}`, `Functions=${endpoints.functions.url}`);
}
