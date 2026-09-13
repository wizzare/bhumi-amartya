// Preload (`node --import` / `tsx --import`) that supplies the synthetic
// NEXT_PUBLIC_FIREBASE_* env some suites assume is already present. Emulator
// hosts (FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST) are injected by
// `firebase emulators:exec`; this only fills the client config. Test-infra only.

const PROJECT_ID = "demo-release-suite";
const defaults = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "synthetic-release-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: `${PROJECT_ID}.firebaseapp.com`,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID: PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: `${PROJECT_ID}.appspot.com`,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:synthetic",
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false",
  NEXT_PUBLIC_USE_AUTH_EMULATOR: "true",
  NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: "true",
  NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: "false",
  BHUMI_QA_HARNESS: "true",
  NEXT_PUBLIC_HUMAN_DESIGN_API_URL: "http://127.0.0.1:18765/api/humandesign/calculate",
};
for (const [k, v] of Object.entries(defaults)) {
  process.env[k] = v;
}
await import("./blockOutboundNetwork.mjs");
