import assert from "node:assert";
import {
  getFirebaseEmulatorEndpoints,
  resolveFirebaseEmulatorHost,
  shouldUseFirebaseEmulators,
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
