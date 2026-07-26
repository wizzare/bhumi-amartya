import { Capacitor } from "@capacitor/core";
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectFunctionsEmulator } from "firebase/functions";

const WEB_EMULATOR_HOST = "127.0.0.1";
const ANDROID_EMULATOR_HOST = "10.0.2.2";
const EMULATOR_PORT_AUTH = 9099;
const EMULATOR_PORT_FIRESTORE = 8080;
const EMULATOR_PORT_FUNCTIONS = 5001;

type FirebaseEmulatorEndpointOptions = {
  platform?: string;
  nativeHost?: string;
};

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

function isPrivateLanIpv4(host: string): boolean {
  const octets = host.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  return octets[0] === 10
    || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168);
}

export function resolveFirebaseEmulatorHost(options: FirebaseEmulatorEndpointOptions = {}): string {
  const platform = options.platform ?? Capacitor.getPlatform();
  if (platform !== "android") return WEB_EMULATOR_HOST;

  const nativeHost = options.nativeHost ?? process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST;
  if (!nativeHost) {
    throw new Error(
      "Firebase emulator mode on Android requires an explicit NEXT_PUBLIC_FIREBASE_EMULATOR_HOST.",
    );
  }
  if (nativeHost !== ANDROID_EMULATOR_HOST && !isPrivateLanIpv4(nativeHost)) {
    throw new Error("Firebase emulator mode on Android requires 10.0.2.2 or an explicit private LAN IPv4 host.");
  }
  return nativeHost;
}

export function getFirebaseEmulatorEndpoints(options: FirebaseEmulatorEndpointOptions = {}) {
  const host = resolveFirebaseEmulatorHost(options);
  return {
    auth: { host, port: EMULATOR_PORT_AUTH, url: `http://${host}:${EMULATOR_PORT_AUTH}` },
    firestore: { host, port: EMULATOR_PORT_FIRESTORE, url: `${host}:${EMULATOR_PORT_FIRESTORE}` },
    functions: { host, port: EMULATOR_PORT_FUNCTIONS, url: `${host}:${EMULATOR_PORT_FUNCTIONS}` },
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
    const endpoint = getFirebaseEmulatorEndpoints().firestore;
    throw new Error(
      `Firestore emulator mode is enabled, but this Firestore instance is not wired to ${endpoint.host}:${endpoint.port}.`,
    );
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
