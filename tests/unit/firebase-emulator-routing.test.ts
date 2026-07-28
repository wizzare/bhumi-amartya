import assert from "node:assert";
import {
  getFirebaseEmulatorEndpoints,
  resolveFirebaseEmulatorHost,
  shouldUseFirebaseEmulators,
  shouldUseAuthEmulator,
  shouldUseFirestoreEmulator,
  shouldUseFunctionsEmulator,
} from "../../lib/firebase/emulatorConfig";

console.log("▶ Running Firebase Emulator Routing Contract Tests\n");

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${label}`);
  } else {
    failed++;
    console.error(`  FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const endpoints = getFirebaseEmulatorEndpoints({ platform: "web" });
const androidEndpoints = getFirebaseEmulatorEndpoints({ platform: "android", nativeHost: "10.0.2.2" });

test("explicit emulator flag enables emulators in every runtime", shouldUseFirebaseEmulators({ NODE_ENV: "production", NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true" }) === true);
test("development true enables emulators", shouldUseFirebaseEmulators({ NODE_ENV: "development", NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true" }) === true);
test("missing flag disables emulators", shouldUseFirebaseEmulators({ NODE_ENV: "development" }) === false);
test("false disables emulators", shouldUseFirebaseEmulators({ NODE_ENV: "development", NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false" }) === false);
test("invalid value disables emulators", shouldUseFirebaseEmulators({ NODE_ENV: "development", NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "yes" }) === false);

test("auth uses 127.0.0.1", endpoints.auth.host === "127.0.0.1");
test("auth port 9099", endpoints.auth.port === 9099);
test("firestore uses 127.0.0.1", endpoints.firestore.host === "127.0.0.1");
test("firestore port 8080", endpoints.firestore.port === 8080);
test("functions uses 127.0.0.1", endpoints.functions.host === "127.0.0.1");
test("functions port 5001", endpoints.functions.port === 5001);
test("no production URL appears in auth endpoint", !endpoints.auth.url.includes("googleapis.com"));
test("Android Auth uses the host emulator alias", androidEndpoints.auth.host === "10.0.2.2");
test("Android Firestore uses the host emulator alias", androidEndpoints.firestore.host === "10.0.2.2");
test("Android Functions uses the host emulator alias", androidEndpoints.functions.host === "10.0.2.2");
test("physical Android accepts an explicit private LAN host", resolveFirebaseEmulatorHost({ platform: "android", nativeHost: "192.168.1.8" }) === "192.168.1.8");
test("Android without an explicit host fails closed", (() => {
  try {
    resolveFirebaseEmulatorHost({ platform: "android", nativeHost: "" });
    return false;
  } catch {
    return true;
  }
})());
// Product-specific flag tests
test("global flag enables all three product emulators", (() => {
  const env = { NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true" };
  return shouldUseAuthEmulator(env) && shouldUseFirestoreEmulator(env) && shouldUseFunctionsEmulator(env);
})());

test("global flag false disables all three product emulators", (() => {
  const env = { NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false" };
  return !shouldUseAuthEmulator(env) && !shouldUseFirestoreEmulator(env) && !shouldUseFunctionsEmulator(env);
})());

test("product-specific auth flag overrides global false", (() => {
  const env = { NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false", NEXT_PUBLIC_USE_AUTH_EMULATOR: "true" };
  return shouldUseAuthEmulator(env) === true;
})());

test("product-specific firestore flag overrides global false", (() => {
  const env = { NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false", NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: "true" };
  return shouldUseFirestoreEmulator(env) === true;
})());

test("product-specific functions flag overrides global false", (() => {
  const env = { NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false", NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: "true" };
  return shouldUseFunctionsEmulator(env) === true;
})());

test("local google-qa mode: auth production, firestore emulator, functions emulator", (() => {
  const env = { NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false", NEXT_PUBLIC_USE_AUTH_EMULATOR: "false", NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: "true", NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: "true" };
  return !shouldUseAuthEmulator(env) && shouldUseFirestoreEmulator(env) && shouldUseFunctionsEmulator(env);
})());

test("product flag absence falls back to global flag", (() => {
  return shouldUseAuthEmulator({ NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true" }) === true;
})());

test("no flag at all returns false", (() => {
  return shouldUseAuthEmulator({}) === false;
})());

test("Android rejects a production Firebase hostname", (() => {
  try {
    resolveFirebaseEmulatorHost({ platform: "android", nativeHost: "firestore.googleapis.com" });
    return false;
  } catch {
    return true;
  }
})());

afterAll();

function afterAll() {
  console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
