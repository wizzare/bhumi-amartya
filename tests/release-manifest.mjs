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
    name: "App update policy (numeric versionCode eligibility)",
    file: "tests/unit/app-update-policy.test.ts",
    kind: "node",
    evidence: "STRONG_UNIT",
  },
  {
    name: "Auth landing CTA routing (read error != profile missing)",
    file: "tests/unit/auth-landing-route.test.ts",
    kind: "node",
    evidence: "STRONG_UNIT",
  },
  {
    name: "Firestore owner isolation + production-preserved blocks (user-path ownership, cross-user denial, fcmTokens/telemetry_events/journalMemoryCandidates contracts)",
    file: "tests/integration/firestore-owner-isolation-emulator.test.ts",
    kind: "emulator",
    evidence: "STRONG_REAL_SDK",
  },
  {
    name: "Firestore sanitizer non-finite policy (unit matrix)",
    file: "tests/unit/firestore-sanitizer.test.ts",
    kind: "node",
    evidence: "STRONG_UNIT",
  },
  {
    name: "Firestore sanitizer non-finite policy (real SDK: SDK accepts raw non-finite, sanitized payloads read back clean)",
    file: "tests/integration/firestore-sanitizer-emulator.test.ts",
    kind: "emulator",
    evidence: "STRONG_REAL_SDK",
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
  {
    // Hot-swaps emulator security rules for failure injection and restores them
    // in teardown; kept last so a restore fault cannot affect other suites.
    name: "Setup/recovery state machine (states B-I, partial write, restart, monotonic recovery-required, blueprint owner uid)",
    file: "tests/integration/setup-recovery-state-machine-emulator.test.ts",
    kind: "emulator",
    evidence: "STRONG_REAL_SDK",
  },
];
