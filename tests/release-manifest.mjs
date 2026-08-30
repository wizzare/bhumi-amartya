/**
 * Explicit list of release-critical suites executed by scripts/run-release-tests.mjs.
 *
 * `kind`:
 *   "node"     — plain `tsx <file>`, no env, no emulator
 *   "env"      — `tsx --import tests/helpers/releaseTestEnv.mjs <file>` (needs Firebase client env)
 *   "emulator" — requires the Firestore+Auth emulator (run inside `firebase emulators:exec`);
 *                also gets the env preload
 *
 * `evidence`: STRONG_REAL_SDK | STRONG_UNIT | STATIC_GUARD | MOCK_UNIT
 *
 * Do NOT add audit-only scratch tests here without Founder approval.
 */
export const releaseSuites = [
  {
    name: "P0 blueprint persistence (Firestore SDK)",
    file: "tests/unit/blueprint-persistence-firestore-emulator.test.ts",
    kind: "emulator",
    evidence: "STRONG_REAL_SDK",
  },
  {
    name: "Daily Guidance API URL contract",
    file: "tests/unit/daily-guidance-api-url.test.ts",
    kind: "node",
    evidence: "STRONG_UNIT",
  },
  {
    name: "Root import boundary (no app -> services/ imports)",
    file: "tests/unit/root-import-boundary.test.ts",
    kind: "node",
    evidence: "STATIC_GUARD",
  },
  {
    name: "Blueprint read timeout settlement",
    file: "tests/unit/blueprint-timeout-settlement.test.ts",
    kind: "node",
    evidence: "STRONG_UNIT",
  },
  {
    name: "Billing server state machine (mocked reimplementation)",
    file: "tests/unit/billing_server_state_machine.test.ts",
    kind: "node",
    evidence: "MOCK_UNIT",
  },
  {
    name: "Setup & blueprint recovery",
    file: "tests/unit/setup_and_blueprint_recovery.test.ts",
    kind: "emulator",
    evidence: "STRONG_UNIT",
  },
  {
    name: "Concurrent recovery dedup (dual runtime)",
    file: "tests/unit/concurrent_recovery_emulator.test.ts",
    kind: "emulator",
    evidence: "STRONG_UNIT",
  },
  {
    name: "Daily Guidance fail-closed (emulator)",
    file: "tests/integration/daily_guidance_emulator.test.ts",
    kind: "emulator",
    evidence: "STRONG_REAL_SDK",
  },
];
