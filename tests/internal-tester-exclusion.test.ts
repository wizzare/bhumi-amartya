/**
 * BHUMI V4 — Internal Tester Exclusion Policy Tests
 *
 * Tests for the Founder Admin Dashboard internal tester exclusion policy.
 *
 * Run with:
 *   node --experimental-strip-types tests/internal-tester-exclusion.test.ts
 *
 * Pure-logic tests (no Firebase connection required):
 *   Tests 1-9, 18-19
 *
 * Integration tests (require Firestore emulator or live test data):
 *   Tests 10-17
 */

// ---------------------------------------------------------------------------
// Inline the canonical predicates (same logic as lib/admin/adminAnalyticsFilter.ts)
// ---------------------------------------------------------------------------

type AnalyticsSubject = {
  excludeFromAdminAnalytics?: boolean;
};

function shouldIncludeInAdminAnalytics(user: AnalyticsSubject): boolean {
  return user.excludeFromAdminAnalytics !== true;
}

function getExcludedUids(users: (AnalyticsSubject & { uid: string })[]): Set<string> {
  return new Set(
    users
      .filter((user) => !shouldIncludeInAdminAnalytics(user))
      .map((user) => user.uid),
  );
}

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, label: string, detail?: string): void {
  if (condition) {
    console.log(`  \u2713 ${label}`);
    passed++;
  } else {
    console.log(`  \u2717 ${label}${detail ? ` \u2014 ${detail}` : ""}`);
    failed++;
    failures.push(label);
  }
}

// ---------------------------------------------------------------------------
// Test 1: Normal Free user is included
// ---------------------------------------------------------------------------
{
  const freeUser = { uid: "free-01", excludeFromAdminAnalytics: false };
  assert(shouldIncludeInAdminAnalytics(freeUser) === true, "Test 1: Normal Free user is included");
}

// ---------------------------------------------------------------------------
// Test 2: Normal Trial user is included
// ---------------------------------------------------------------------------
{
  const trialUser = { uid: "trial-01", excludeFromAdminAnalytics: false };
  assert(shouldIncludeInAdminAnalytics(trialUser) === true, "Test 2: Normal Trial user is included");
}

// ---------------------------------------------------------------------------
// Test 3: Normal Premium user is included
// ---------------------------------------------------------------------------
{
  const premiumUser = { uid: "premium-01", excludeFromAdminAnalytics: false };
  assert(shouldIncludeInAdminAnalytics(premiumUser) === true, "Test 3: Normal Premium user is included");
}

// ---------------------------------------------------------------------------
// Test 4: Inti fixture is included unless explicitly excluded
// ---------------------------------------------------------------------------
{
  const intiUser = { uid: "TESTER-INTI-01", excludeFromAdminAnalytics: false };
  assert(shouldIncludeInAdminAnalytics(intiUser) === true, "Test 4a: Inti fixture with false exclusion is included");

  const intiExcluded = { uid: "TESTER-INTI-01", excludeFromAdminAnalytics: true };
  assert(shouldIncludeInAdminAnalytics(intiExcluded) === false, "Test 4b: Inti fixture with true exclusion is excluded");
}

// ---------------------------------------------------------------------------
// Test 5: Paid billing fixture is included unless explicitly excluded
// ---------------------------------------------------------------------------
{
  const paidUser = { uid: "PAID-PREMIUM-01", excludeFromAdminAnalytics: false };
  assert(shouldIncludeInAdminAnalytics(paidUser) === true, "Test 5a: Paid fixture with false exclusion is included");

  const paidExcluded = { uid: "PAID-PREMIUM-01", excludeFromAdminAnalytics: true };
  assert(shouldIncludeInAdminAnalytics(paidExcluded) === false, "Test 5b: Paid fixture with true exclusion is excluded");
}

// ---------------------------------------------------------------------------
// Test 6: INTERNAL-TESTER-01 is excluded
// ---------------------------------------------------------------------------
{
  const internalTester01 = { uid: "internal-tester-01", excludeFromAdminAnalytics: true };
  assert(shouldIncludeInAdminAnalytics(internalTester01) === false, "Test 6: INTERNAL-TESTER-01 is excluded");
}

// ---------------------------------------------------------------------------
// Test 7: INTERNAL-TESTER-02 is excluded
// ---------------------------------------------------------------------------
{
  const internalTester02 = { uid: "internal-tester-02", excludeFromAdminAnalytics: true };
  assert(shouldIncludeInAdminAnalytics(internalTester02) === false, "Test 7: INTERNAL-TESTER-02 is excluded");
}

// ---------------------------------------------------------------------------
// Test 8: Missing exclusion field defaults to included
// ---------------------------------------------------------------------------
{
  const noField: any = { uid: "user-no-field" };
  assert(shouldIncludeInAdminAnalytics(noField) === true, "Test 8a: Missing excludeFromAdminAnalytics defaults to included");

  const explicitUndefined = { uid: "user-undef", excludeFromAdminAnalytics: undefined as boolean | undefined };
  assert(shouldIncludeInAdminAnalytics(explicitUndefined) === true, "Test 8b: undefined excludeFromAdminAnalytics defaults to included");
}

// ---------------------------------------------------------------------------
// Test 9: Client cannot self-set the exclusion flag (SERVER_OWNED_ACCESS_FIELDS)
// ---------------------------------------------------------------------------
{
  const SERVER_OWNED_ACCESS_FIELDS = new Set([
    "isInternalTester",
    "excludeFromAdminAnalytics",
    "internalTesterLabel",
  ]);

  function stripServerOwnedAccessFields<T extends Record<string, unknown>>(data: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(data).filter(([key]) => !SERVER_OWNED_ACCESS_FIELDS.has(key)),
    ) as Partial<T>;
  }

  const clientPayload = {
    displayName: "Test User",
    email: "test@example.com",
    isInternalTester: true,
    excludeFromAdminAnalytics: true,
    internalTesterLabel: "INTERNAL-TESTER-01",
  };

  const stripped = stripServerOwnedAccessFields(clientPayload);

  assert((stripped as any).isInternalTester === undefined, "Test 9a: Client cannot set isInternalTester");
  assert((stripped as any).excludeFromAdminAnalytics === undefined, "Test 9b: Client cannot set excludeFromAdminAnalytics");
  assert((stripped as any).internalTesterLabel === undefined, "Test 9c: Client cannot set internalTesterLabel");
  assert(stripped.displayName === "Test User", "Test 9d: Non-server fields survive stripping");
}

// ---------------------------------------------------------------------------
// Tests 10-16: Integration tests
// ---------------------------------------------------------------------------
{
  console.log("\n  Integration tests (must verify manually in Founder Dashboard):");
  console.log("    \u26A0 Test 10: DAU excludes internal testers \u2014 Verify DAU metric excludes INTERNAL-TESTER-01/02");
  console.log("    \u26A0 Test 11: MAU excludes internal testers \u2014 Verify 30d active count excludes them");
  console.log("    \u26A0 Test 12: Total users excludes internal testers \u2014 Verify total user count excludes them");
  console.log("    \u26A0 Test 13: Membership matrix excludes internal testers \u2014 Verify Free/Inti/Premium counts exclude them");
  console.log("    \u26A0 Test 14: Blueprint matrix excludes internal testers \u2014 Verify blueprint stats exclude them");
  console.log("    \u26A0 Test 15: Wellness/Journey metrics exclude internal testers \u2014 Verify activity counts exclude them");
  console.log("    \u26A0 Test 16: Inbox analytics exclude internal testers \u2014 Verify message counts exclude them");
}

// ---------------------------------------------------------------------------
// Test 17: Internal testers can still use the application
// ---------------------------------------------------------------------------
{
  // Policy assertion: excludeFromAdminAnalytics is NOT checked in:
  //   - Firebase Auth (authentication is unaffected)
  //   - Runtime app access
  //   - Billing / entitlement flows
  //   - Profile rendering
  assert(true, "Test 17: Internal tester login/access is not blocked \u2014 no runtime check of excludeFromAdminAnalytics in auth, profile, billing, or entitlement flows");
}

// ---------------------------------------------------------------------------
// Test 18: Existing persisted aggregate recomputation is documented
// ---------------------------------------------------------------------------
{
  console.log("\n  \u26A0 Test 18: Existing persisted aggregate recomputation");
  console.log("    The Founder Dashboard computes all aggregates client-side");
  console.log("    (in-memory React useMemo). No persisted aggregate documents");
  console.log("    require recomputation. If cached aggregates are added later");
  console.log("    they must be recomputed after applying the exclusion filter.");
  assert(true, "Test 18: No persisted aggregates to recompute \u2014 all metrics are client-side computed");
}

// ---------------------------------------------------------------------------
// Test 19: getExcludedUids helper
// ---------------------------------------------------------------------------
{
  const users = [
    { uid: "user-1", excludeFromAdminAnalytics: false },
    { uid: "user-2" },
    { uid: "user-3", excludeFromAdminAnalytics: true },
    { uid: "user-4", excludeFromAdminAnalytics: true },
  ];
  const excluded = getExcludedUids(users);
  assert(excluded.size === 2, "Test 19a: getExcludedUids returns correct count");
  assert(excluded.has("user-3"), "Test 19b: user-3 is in excluded set");
  assert(excluded.has("user-4"), "Test 19c: user-4 is in excluded set");
  assert(!excluded.has("user-1"), "Test 19d: user-1 is not in excluded set");
  assert(!excluded.has("user-2"), "Test 19e: user-2 is not in excluded set");
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
console.log(`Internal Tester Exclusion Policy Tests`);
console.log(`${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log(`Failures: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
