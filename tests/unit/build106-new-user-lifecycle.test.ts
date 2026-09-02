/**
 * Build 106 — genuine new-user lifecycle regression suite.
 *
 * Master SOT §4.1 / BUILD_106_RECOVERY_MATRIX.md "New-user lifecycle gate".
 *
 * Pre-fix (Build 105) behaviour these tests pin down:
 *   ensureMinimalUserProfile() reads the profile once at the top, then awaits an
 *   unbounded bootstrapCanonicalAccess(). If that await outlives the AuthContext
 *   load timeout, the user can finish /setup in the meantime. The late call then
 *   resumes on its stale "profile === null" observation and runs
 *   upsertUserProfile(uid, buildMinimalUserProfile(...)) — a shallow merge that
 *   writes setupCompleted:false, blueprintStatus:"missing" and empty birth
 *   fields over the finalized profile, trapping the user between setup and
 *   dashboard.
 *
 * Post-fix invariants proven here:
 *   A  setupCompleted is monotonic (true is terminal for a stale writer).
 *   B  blueprintStatus does not regress to "missing" once advanced.
 *   C  a bootstrap path based on an earlier "missing" observation re-validates
 *      authoritative state and reconciles transactionally instead of clobbering.
 *   E  a read error is surfaced, never silently converted to "profile missing".
 *   F  (see build106-setup-refresh recovery in app/setup/page.tsx — runtime).
 *   idempotency  duplicate / concurrent bootstrap calls converge, no regression.
 *
 * Runner:  tsx --import ./tests/helpers/releaseTestEnv.mjs tests/unit/build106-new-user-lifecycle.test.ts
 */
import assert from "node:assert";

import { ensureMinimalUserProfile } from "../../lib/auth/authActions.ts";
import { userRepository, type UserProfile } from "../../lib/repositories/userRepository.ts";
import {
  guardMonotonicProfilePatch,
} from "../../lib/auth/profileMonotonicity.ts";

let assertions = 0;
function ok(cond: unknown, message: string): void {
  assertions += 1;
  assert.ok(cond, message);
}
function eq<T>(actual: T, expected: T, message: string): void {
  assertions += 1;
  assert.strictEqual(actual, expected, message);
}

const FAKE_USER = {
  uid: "build106-newuser",
  displayName: "New User",
  email: "newuser@example.invalid",
  photoURL: null,
  getIdToken: async () => "fake-token",
} as unknown as Parameters<typeof ensureMinimalUserProfile>[0];

const FINALIZED_PROFILE: Partial<UserProfile> = {
  uid: "build106-newuser",
  email: "newuser@example.invalid",
  displayName: "New User",
  fullName: "New User",
  birthDate: "1994-05-06",
  birthTime: "07:08",
  birthCity: "Bandung",
  birthPlace: "Bandung, Indonesia",
  birthCountry: "ID",
  latitude: -6.9,
  longitude: 107.6,
  timezone: "+07:00",
  language: "id",
  onboardingCompleted: true,
  baselineWellnessCompleted: false,
  setupCompleted: true,
  blueprintStatus: "ready",
  trialStartedAt: "2026-09-01T00:00:00.000Z" as unknown as UserProfile["trialStartedAt"],
  trialEndsAt: "2026-09-15T00:00:00.000Z" as unknown as UserProfile["trialEndsAt"],
};

type Store = { server: Partial<UserProfile> | null };

interface MockControl {
  calls: {
    get: number;
    upsert: number;
    reconcile: number;
    upsertPatches: Array<Partial<UserProfile>>;
    reconcileWrites: Array<Record<string, unknown>>;
  };
  restore(): void;
}

function installUserRepositoryMock(
  store: Store,
  opts: { observedOnGet?: (callIndex: number) => Partial<UserProfile> | null | "THROW" } = {},
): MockControl {
  const original = {
    getUserProfile: userRepository.getUserProfile,
    upsertUserProfile: userRepository.upsertUserProfile,
    reconcileMinimalProfile: userRepository.reconcileMinimalProfile,
    updatePresence: userRepository.updatePresence,
  };

  const calls: MockControl["calls"] = {
    get: 0,
    upsert: 0,
    reconcile: 0,
    upsertPatches: [],
    reconcileWrites: [],
  };

  userRepository.getUserProfile = (async () => {
    const index = calls.get;
    calls.get += 1;
    if (opts.observedOnGet) {
      const observed = opts.observedOnGet(index);
      if (observed === "THROW") {
        throw Object.assign(new Error("simulated firestore read failure"), { code: "unavailable" });
      }
      return observed as UserProfile | null;
    }
    return (store.server as UserProfile | null) ?? null;
  }) as typeof userRepository.getUserProfile;

  userRepository.upsertUserProfile = (async (_uid: string, patch: Partial<UserProfile>) => {
    calls.upsert += 1;
    calls.upsertPatches.push(patch);
    store.server = { ...(store.server ?? {}), ...patch };
  }) as typeof userRepository.upsertUserProfile;

  // Faithful stand-in for the real transactional reconcileMinimalProfile:
  // read current server state, apply the real monotonicity guard, merge.
  userRepository.reconcileMinimalProfile = (async (_uid: string, patch: Partial<UserProfile>) => {
    calls.reconcile += 1;
    const guarded = guardMonotonicProfilePatch(store.server, patch);
    calls.reconcileWrites.push(guarded as Record<string, unknown>);
    const keys = Object.keys(guarded);
    if (keys.length > 0) {
      store.server = { ...(store.server ?? {}), ...guarded };
    }
    return keys;
  }) as typeof userRepository.reconcileMinimalProfile;

  userRepository.updatePresence = (async () => undefined) as typeof userRepository.updatePresence;

  return {
    calls,
    restore() {
      userRepository.getUserProfile = original.getUserProfile;
      userRepository.upsertUserProfile = original.upsertUserProfile;
      userRepository.reconcileMinimalProfile = original.reconcileMinimalProfile;
      userRepository.updatePresence = original.updatePresence;
    },
  };
}

function assertNoRegressiveWrite(write: Record<string, unknown>, label: string): void {
  ok(write.setupCompleted !== false, `${label}: never writes setupCompleted:false`);
  ok(write.onboardingCompleted !== false, `${label}: never writes onboardingCompleted:false`);
  ok(write.blueprintStatus !== "missing", `${label}: never writes blueprintStatus:"missing"`);
  for (const field of ["birthDate", "birthTime", "birthCity", "birthPlace"]) {
    ok(write[field] !== "", `${label}: never blanks ${field}`);
  }
  for (const field of ["latitude", "longitude", "timezone", "birthCountry"]) {
    ok(write[field] !== null, `${label}: never nulls ${field}`);
  }
}

/* ------------------------------------------------------------------ TEST 1 */
// Late-bootstrap race: first observation is "missing", /setup finalizes during
// the bootstrap await, ensureMinimalUserProfile must NOT overwrite it.
async function test1_lateBootstrapRace(): Promise<void> {
  const store: Store = { server: { ...FINALIZED_PROFILE } };
  const mock = installUserRepositoryMock(store, {
    // call 0 = the pre-bootstrap read that raced and saw nothing;
    // every later read observes the finalized server state.
    observedOnGet: (i) => (i === 0 ? null : { ...store.server } as Partial<UserProfile>),
  });

  try {
    await ensureMinimalUserProfile(FAKE_USER);
  } finally {
    mock.restore();
  }

  eq(mock.calls.upsert, 0, "TEST_1: no raw new-user upsert (clobber branch not taken)");
  ok(mock.calls.reconcile >= 1, "TEST_1: reconciliation went through the transactional guard");
  for (const write of mock.calls.reconcileWrites) {
    assertNoRegressiveWrite(write, "TEST_1 reconcile write");
  }
  eq(store.server?.setupCompleted, true, "TEST_1: setupCompleted stays true");
  eq(store.server?.blueprintStatus, "ready", "TEST_1: blueprintStatus stays ready");
  eq(store.server?.birthDate, "1994-05-06", "TEST_1: birthDate preserved");
  eq(store.server?.timezone, "+07:00", "TEST_1: timezone preserved");
  console.log(`  TEST_1 late-bootstrap race ....................... PASS`);
}

/* ------------------------------------------------------------------ TEST 2 */
// setupCompleted monotonicity (guard unit).
function test2_setupCompletedMonotonicity(): void {
  const advanced: Partial<UserProfile> = { setupCompleted: true, onboardingCompleted: true, baselineWellnessCompleted: true };
  const guarded = guardMonotonicProfilePatch(advanced, {
    setupCompleted: false,
    onboardingCompleted: false,
    baselineWellnessCompleted: false,
    language: "en",
  } as Partial<UserProfile>);
  ok(!("setupCompleted" in guarded), "TEST_2: setupCompleted:false stripped when server is true");
  ok(!("onboardingCompleted" in guarded), "TEST_2: onboardingCompleted:false stripped");
  ok(!("baselineWellnessCompleted" in guarded), "TEST_2: baselineWellnessCompleted:false stripped");
  eq((guarded as Partial<UserProfile>).language, "en", "TEST_2: unrelated keys pass through");

  const fresh = guardMonotonicProfilePatch({ uid: "x" }, { setupCompleted: false } as Partial<UserProfile>);
  eq((fresh as Partial<UserProfile>).setupCompleted, false, "TEST_2: genuine new user still gets setupCompleted:false");

  const nullPersisted = guardMonotonicProfilePatch(null, { setupCompleted: false } as Partial<UserProfile>);
  eq((nullPersisted as Partial<UserProfile>).setupCompleted, false, "TEST_2: null persisted → patch untouched");
  console.log(`  TEST_2 setupCompleted monotonicity ............... PASS`);
}

/* ------------------------------------------------------------------ TEST 3 */
// blueprintStatus + identity-field monotonicity (guard unit).
function test3_blueprintStatusMonotonicity(): void {
  eq(
    "blueprintStatus" in guardMonotonicProfilePatch({ blueprintStatus: "ready" }, { blueprintStatus: "missing" } as Partial<UserProfile>),
    false,
    "TEST_3: missing stripped when server is ready",
  );
  eq(
    "blueprintStatus" in guardMonotonicProfilePatch({ blueprintStatus: "generating" }, { blueprintStatus: "missing" } as Partial<UserProfile>),
    false,
    "TEST_3: missing stripped when server is generating",
  );
  eq(
    (guardMonotonicProfilePatch({ blueprintStatus: "missing" }, { blueprintStatus: "missing" } as Partial<UserProfile>) as Partial<UserProfile>).blueprintStatus,
    "missing",
    "TEST_3: missing kept when server is also missing (no regression)",
  );
  eq(
    (guardMonotonicProfilePatch({ blueprintStatus: "missing" }, { blueprintStatus: "ready" } as Partial<UserProfile>) as Partial<UserProfile>).blueprintStatus,
    "ready",
    "TEST_3: forward transition to ready is allowed",
  );

  const identityGuarded = guardMonotonicProfilePatch(
    { birthDate: "1990-01-02", birthCity: "Jakarta", latitude: -6.2, timezone: "+07:00", birthCountry: "ID" },
    { birthDate: "", birthCity: "", latitude: null, timezone: null, birthCountry: null, birthTime: "" } as Partial<UserProfile>,
  );
  ok(!("birthDate" in identityGuarded), "TEST_3: non-empty birthDate not blanked");
  ok(!("birthCity" in identityGuarded), "TEST_3: non-empty birthCity not blanked");
  ok(!("latitude" in identityGuarded), "TEST_3: non-null latitude not nulled");
  ok(!("timezone" in identityGuarded), "TEST_3: non-null timezone not nulled");
  ok(!("birthCountry" in identityGuarded), "TEST_3: non-null birthCountry not nulled");
  eq((identityGuarded as Partial<UserProfile>).birthTime, "", "TEST_3: blank allowed where server is also empty/absent");
  console.log(`  TEST_3 blueprintStatus + identity monotonicity ... PASS`);
}

/* ------------------------------------------------------------------ TEST 4 */
// A read error must surface, never become "profile missing" → no create.
async function test4_readErrorIsNotMissing(): Promise<void> {
  const store: Store = { server: null };
  const mock = installUserRepositoryMock(store, { observedOnGet: () => "THROW" });

  let threw = false;
  try {
    await ensureMinimalUserProfile(FAKE_USER);
  } catch (error) {
    threw = true;
    eq((error as { code?: string }).code, "unavailable", "TEST_4: original read error is propagated");
  } finally {
    mock.restore();
  }

  ok(threw, "TEST_4: ensureMinimalUserProfile rejects on read error");
  eq(mock.calls.upsert, 0, "TEST_4: no minimal profile created from a read error");
  eq(mock.calls.reconcile, 0, "TEST_4: no reconcile write from a read error");
  eq(store.server, null, "TEST_4: server state untouched");
  console.log(`  TEST_4 read error is not 'missing' .............. PASS`);
}

/* ------------------------------------------------------------------ TEST 5 (partial / static) */
// Post-setup AuthContext refresh before routing is recovered in
// app/setup/page.tsx (historical provenance: 0f0ad14e). Assert the source
// carries the guarded refresh call ahead of the dashboard redirect.
async function test5_postSetupAuthRefreshPresent(): Promise<void> {
  const { readFile } = await import("node:fs/promises");
  const src = await readFile(new URL("../../app/setup/page.tsx", import.meta.url), "utf8");
  const refreshIdx = src.indexOf("auth?.refreshUserProfile");
  const redirectIdx = src.indexOf('router.replace("/dashboard');
  ok(refreshIdx !== -1, "TEST_5: finalizeSetup awaits auth.refreshUserProfile()");
  ok(redirectIdx !== -1, "TEST_5: finalizeSetup still routes to /dashboard");
  ok(refreshIdx < redirectIdx, "TEST_5: the refresh happens before the dashboard redirect");
  console.log(`  TEST_5 post-setup auth refresh (static) ......... PASS`);
}

/* ------------------------------------------------------------------ TEST 6 */
// Duplicate / concurrent ensureMinimalUserProfile for one uid converges.
async function test6_duplicateBootstrapIdempotency(): Promise<void> {
  const store: Store = { server: { ...FINALIZED_PROFILE } };
  const mock = installUserRepositoryMock(store, {
    observedOnGet: (i) => (i === 0 ? null : { ...store.server } as Partial<UserProfile>),
  });

  try {
    await Promise.all([
      ensureMinimalUserProfile(FAKE_USER),
      ensureMinimalUserProfile(FAKE_USER),
    ]);
  } finally {
    mock.restore();
  }

  eq(mock.calls.upsert, 0, "TEST_6: neither concurrent call took the clobber branch");
  for (const write of mock.calls.reconcileWrites) {
    assertNoRegressiveWrite(write, "TEST_6 reconcile write");
  }
  eq(store.server?.setupCompleted, true, "TEST_6: setupCompleted still true after concurrent calls");
  eq(store.server?.blueprintStatus, "ready", "TEST_6: blueprintStatus still ready after concurrent calls");
  eq(store.server?.birthDate, "1994-05-06", "TEST_6: birthDate still intact after concurrent calls");
  console.log(`  TEST_6 duplicate bootstrap idempotency .......... PASS`);
}

async function run(): Promise<void> {
  console.log("build106-new-user-lifecycle:");
  await test1_lateBootstrapRace();
  test2_setupCompletedMonotonicity();
  test3_blueprintStatusMonotonicity();
  await test4_readErrorIsNotMissing();
  await test5_postSetupAuthRefreshPresent();
  await test6_duplicateBootstrapIdempotency();
  console.log(`PASS build106-new-user-lifecycle (${assertions} assertions)`);
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
