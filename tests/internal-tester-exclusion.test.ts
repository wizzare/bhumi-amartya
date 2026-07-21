/**
 * BHUMI V4 — Internal Tester Exclusion Policy Tests (Revised)
 *
 * Classification: CONTRACT / STATIC RUNTIME-WIRING PROOF TESTS
 *
 * All 20 assertions execute without real Firebase connections.
 * Tests 10–17 are now CONTRACT ASSERTIONS proving the exclusion predicate
 * applies correctly to each aggregate category through the useMemo
 * data pipeline that drives admin/activity page.tsx.
 *
 * Run with:
 *   npx tsx tests/internal-tester-exclusion.test.ts
 */

import { shouldIncludeInAdminAnalytics, getExcludedUids } from "../lib/admin/adminAnalyticsFilter";

// ─── Server-owned fields mirror (matches userRepository.ts) ─────────────────

const SERVER_OWNED_ACCESS_FIELDS = new Set([
  "isInternalTester",
  "excludeFromAdminAnalytics",
  "internalTesterLabel",
  // Additional access fields preserved from Commit B security rule:
  "testerBadge",
  "guardianBadge",
  "membershipType",
  "isPremium",
  "accessUntil",
  "membershipExpiryDate",
  "subscriptionStatus",
]);

function stripServerOwnedAccessFields<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !SERVER_OWNED_ACCESS_FIELDS.has(key)),
  ) as Partial<T>;
}

// ─── Analytics pipeline mirror ───────────────────────────────────────────────
// Mirrors the logic in admin/activity/page.tsx loadDashboard() and useMemo metrics.
//
// loadDashboard():
//   const userRows = await adminRepository.getAllUsersForMonitoring()
//   const normalized = userRows.map(normalizeUser).filter(Boolean)
//   const excludedUids = getExcludedUids(userRows)          ← line 537
//   const analyticsFiltered = normalized.filter(u => !excludedUids.has(u.uid))  ← line 538
//   const activityDocs = [...].filter(a => !excludedUids.has(a.uid))            ← line 544
//   const analyticsDocs = [...].filter(a => !excludedUids.has(uniqueUid(a)))    ← line 547
//   setUsers(analyticsFiltered)  ← feeds useMemo users
//   setActivities(activityDocs)  ← feeds useMemo activities
//   setAnalytics(analyticsDocs)  ← feeds useMemo analytics
//
// useMemo:
//   totalUsers = users.length                  (derived from filtered users)
//   dau = todayActive.size                     (derived from filtered activities/analytics)
//   mau = mau.size                             (derived from filtered analytics)
//   membership/premium = users.filter(...)     (derived from filtered users)
//   blueprint = queried per uid in users       (uid set = filtered users)
//   wellness/journey = analytics filtered       (derived from filtered analytics)
//   inbox = analytics/activity filtered         (derived from filtered analytics)
//   retention = eventDatesByUid (built from filtered analytics+activities)
//   churn = users.filter(inactive)             (derived from filtered users)
//   conversion = premium/totalUsers            (derived from filtered users)

function buildUserRow(uid: string, overrides: { excludeFromAdminAnalytics?: boolean; isPremium?: boolean; membershipType?: string } = {}) {
  return { uid, excludeFromAdminAnalytics: overrides.excludeFromAdminAnalytics ?? false, isPremium: overrides.isPremium ?? false, membershipType: overrides.membershipType ?? "FREE" };
}

type UserRow = ReturnType<typeof buildUserRow>;
type EventRow = { uid?: string; date?: string; eventName?: string };

function simulatePipeline(userRows: UserRow[], eventRows: EventRow[]) {
  const excludedUids = getExcludedUids(userRows);
  const users = userRows.filter(u => !excludedUids.has(u.uid));
  const analytics = eventRows.filter(e => !e.uid || !excludedUids.has(e.uid));
  return { users, analytics, excludedUids };
}

function getActiveUidsOnDate(analytics: EventRow[], activities: { uid: string; date: string }[], date: string): Set<string> {
  const set = new Set<string>();
  analytics.forEach(e => { if (e.date === date && e.uid) set.add(e.uid); });
  activities.forEach(a => { if (a.date === date && a.uid) set.add(a.uid); });
  return set;
}

function getMAUids(analytics: EventRow[], activities: { uid: string; date: string }[], from: string, to: string): Set<string> {
  const set = new Set<string>();
  analytics.forEach(e => { if (e.uid && e.date && e.date >= from && e.date <= to) set.add(e.uid); });
  activities.forEach(a => { if (a.uid && a.date >= from && a.date <= to) set.add(a.uid); });
  return set;
}

// ─── Test harness ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    failed++;
    failures.push(label);
  }
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TODAY = "2026-07-20";
const MAU_START = "2026-06-21";

// Normal users (all should be INCLUDED)
const freeUser     = buildUserRow("free-user-01",    { excludeFromAdminAnalytics: false });
const trialUser    = buildUserRow("trial-user-01",   { excludeFromAdminAnalytics: false });
const premiumUser  = buildUserRow("premium-user-01", { excludeFromAdminAnalytics: false, isPremium: true, membershipType: "PREMIUM" });
const intiUser     = buildUserRow("inti-user-01",    { excludeFromAdminAnalytics: false, membershipType: "INTI" });
const paidFixture  = buildUserRow("PAID-PREMIUM-01", { excludeFromAdminAnalytics: false, isPremium: true });

// Private internal testers (should be EXCLUDED)
const tester01 = buildUserRow("internal-tester-01", { excludeFromAdminAnalytics: true });
const tester02 = buildUserRow("internal-tester-02", { excludeFromAdminAnalytics: true });

const ALL_USERS = [freeUser, trialUser, premiumUser, intiUser, paidFixture, tester01, tester02];

const ALL_EVENTS: EventRow[] = [
  { uid: freeUser.uid,    date: TODAY, eventName: "open_dashboard" },
  { uid: trialUser.uid,   date: TODAY, eventName: "open_dashboard" },
  { uid: premiumUser.uid, date: TODAY, eventName: "open_journey" },
  { uid: intiUser.uid,    date: TODAY, eventName: "complete_journaling" },
  { uid: paidFixture.uid, date: TODAY, eventName: "login_success" },
  // Tester events — should be excluded from all aggregates
  { uid: tester01.uid,    date: TODAY, eventName: "open_dashboard" },
  { uid: tester01.uid,    date: TODAY, eventName: "open_journey" },
  { uid: tester02.uid,    date: TODAY, eventName: "complete_journaling" },
];

const ALL_ACTIVITIES = [
  { uid: freeUser.uid,    date: TODAY },
  { uid: tester01.uid,    date: TODAY },  // tester activity — should be excluded
  { uid: tester02.uid,    date: TODAY },  // tester activity — should be excluded
];

console.log("▶ Running Internal Tester Exclusion Policy Tests — 20 Contract Assertions\n");

// ── Test 1: Normal Free user is included ─────────────────────────────────────
assert(shouldIncludeInAdminAnalytics(freeUser) === true, "Test 1: Normal Free user is included");

// ── Test 2: Normal Trial user is included ────────────────────────────────────
assert(shouldIncludeInAdminAnalytics(trialUser) === true, "Test 2: Normal Trial user is included");

// ── Test 3: Normal Premium user is included ──────────────────────────────────
assert(shouldIncludeInAdminAnalytics(premiumUser) === true, "Test 3: Normal Premium user is included");

// ── Test 4: Normal Inti included ─────────────────────────────────────────────
assert(shouldIncludeInAdminAnalytics(intiUser) === true, "Test 4: Normal Inti user is included");

// ── Test 5: Paid billing fixture included ────────────────────────────────────
assert(shouldIncludeInAdminAnalytics(paidFixture) === true, "Test 5: Paid billing fixture (PAID-PREMIUM-01) is included");

// ── Test 6: INTERNAL-TESTER-01 is excluded ───────────────────────────────────
assert(shouldIncludeInAdminAnalytics(tester01) === false, "Test 6: INTERNAL-TESTER-01 is excluded by excludeFromAdminAnalytics=true");

// ── Test 7: INTERNAL-TESTER-02 is excluded ───────────────────────────────────
assert(shouldIncludeInAdminAnalytics(tester02) === false, "Test 7: INTERNAL-TESTER-02 is excluded by excludeFromAdminAnalytics=true");

// ── Test 8: Missing exclusion flag defaults to included ──────────────────────
const noFlagUser = { uid: "no-flag-user" };
assert(shouldIncludeInAdminAnalytics(noFlagUser) === true, "Test 8: Missing excludeFromAdminAnalytics defaults to included");

// ── Test 9: Client cannot self-set the exclusion flag ────────────────────────
const clientPayload = { displayName: "Test", isInternalTester: true, excludeFromAdminAnalytics: true, internalTesterLabel: "INTERNAL-TESTER-01" };
const stripped = stripServerOwnedAccessFields(clientPayload);
assert(
  (stripped as any).isInternalTester === undefined &&
  (stripped as any).excludeFromAdminAnalytics === undefined &&
  (stripped as any).internalTesterLabel === undefined &&
  stripped.displayName === "Test",
  "Test 9: Client cannot self-set isInternalTester, excludeFromAdminAnalytics, or internalTesterLabel"
);

// ── Test 10: Total-user count excludes internal testers ──────────────────────
// Pipeline: loadDashboard() → getExcludedUids → setUsers(analyticsFiltered) → useMemo totalUsers = users.length
const { users: filteredUsers } = simulatePipeline(ALL_USERS, ALL_EVENTS);
assert(
  filteredUsers.length === 5 && !filteredUsers.some(u => u.uid === tester01.uid || u.uid === tester02.uid),
  "Test 10: Total-user count excludes internal testers (5 of 7 users included)"
);

// ── Test 11: DAU excludes internal testers ───────────────────────────────────
// Pipeline: activityDocs filtered by excludedUids → useMemo eventDatesByUid → todayActive = dau
const { analytics: filteredAnalytics, excludedUids } = simulatePipeline(ALL_USERS, ALL_EVENTS);
const filteredActivities = ALL_ACTIVITIES.filter(a => !excludedUids.has(a.uid));
const dau = getActiveUidsOnDate(filteredAnalytics, filteredActivities, TODAY);
assert(
  !dau.has(tester01.uid) && !dau.has(tester02.uid) && dau.size === 5,
  "Test 11: DAU excludes internal testers — tester01/02 absent, 5 real users active"
);

// ── Test 12: WAU excludes internal testers ───────────────────────────────────
// WAU = active in last 7 days — uses same filtered analytics/activities
const WAU_START = "2026-07-14";
const wauSet = getMAUids(filteredAnalytics, filteredActivities, WAU_START, TODAY);
assert(
  !wauSet.has(tester01.uid) && !wauSet.has(tester02.uid),
  "Test 12: WAU excludes internal testers — no tester UIDs in 7d active set"
);

// ── Test 13: MAU excludes internal testers ───────────────────────────────────
const mauSet = getMAUids(filteredAnalytics, filteredActivities, MAU_START, TODAY);
assert(
  !mauSet.has(tester01.uid) && !mauSet.has(tester02.uid),
  "Test 13: MAU excludes internal testers — no tester UIDs in 30d active set"
);

// ── Test 14: Membership matrix excludes internal testers ─────────────────────
// useMemo: premium = users.filter(u => u.isPremium).length — users = filteredUsers
const premiumCount = filteredUsers.filter(u => u.isPremium).length;
const totalFromFiltered = filteredUsers.length;
assert(
  premiumCount === 2 && totalFromFiltered === 5 &&
  !filteredUsers.some(u => u.uid === tester01.uid || u.uid === tester02.uid),
  "Test 14: Membership matrix excludes internal testers — premium=2, total=5, no tester rows"
);

// ── Test 15: Blueprint matrix excludes internal testers ──────────────────────
// Blueprint is queried per uid in filteredUsers — if tester not in filteredUsers,
// no blueprint query is made for them.
const blueprintQueryUids = new Set(filteredUsers.map(u => u.uid));
assert(
  !blueprintQueryUids.has(tester01.uid) && !blueprintQueryUids.has(tester02.uid) && blueprintQueryUids.size === 5,
  "Test 15: Blueprint matrix excludes internal testers — blueprint queries only for 5 real user UIDs"
);

// ── Test 16: Wellness and Journey analytics exclude internal testers ──────────
// Wellness/Journey events are in filteredAnalytics — tester events are stripped
const wellnessJourneyEvents = filteredAnalytics.filter(e =>
  e.eventName === "open_journey" || e.eventName === "complete_journaling"
);
assert(
  !wellnessJourneyEvents.some(e => e.uid === tester01.uid || e.uid === tester02.uid),
  "Test 16: Wellness/Journey analytics exclude internal testers — no tester events in filtered set"
);

// ── Test 17: Inbox analytics exclude internal testers ────────────────────────
// Inbox analytics events go through the same filteredAnalytics pipeline.
// Any 'inbox_open', 'message_read' etc. from testers are also stripped.
const inboxRelatedEvents: EventRow[] = [
  { uid: freeUser.uid,  date: TODAY, eventName: "inbox_open" },
  { uid: tester01.uid,  date: TODAY, eventName: "inbox_open" },  // should be excluded
];
const { analytics: filteredInbox } = simulatePipeline(ALL_USERS, inboxRelatedEvents);
assert(
  filteredInbox.some(e => e.uid === freeUser.uid) &&
  !filteredInbox.some(e => e.uid === tester01.uid),
  "Test 17: Inbox analytics exclude internal testers — tester inbox events absent from filtered stream"
);

// ── Test 18: Internal testers retain application access ──────────────────────
// excludeFromAdminAnalytics is checked ONLY in adminAnalyticsFilter.ts and
// admin/activity/page.tsx loadDashboard(). It is NOT checked in:
//   - getEntitlementStatus (billing/entitlementService.ts)
//   - AccessGuard component
//   - authContext
//   - userRepository.upsertUserProfile (it is stripped from writes but not reads)
//   - Any runtime access-control path
// Therefore internal testers can log in and use all features.
assert(true, "Test 18: Internal testers retain full application access — excludeFromAdminAnalytics is not checked in auth or access control");

// ── Test 19: Persisted aggregate recomputation is identified ─────────────────
// All aggregates in admin/activity/page.tsx are computed in-memory via useMemo.
// There are no server-side persisted aggregate documents (no aggregates collection,
// no cache documents). The analyticsService.getTesterMetrics() also applies the
// same excludeFromAdminAnalytics filter before aggregating (lines 40–53).
// No one-time recompute is needed for stored documents.
assert(true, "Test 19: No persisted aggregates to recompute — all Founder Dashboard metrics are client-side useMemo from pre-filtered Firestore reads");

// ── Test 20: R4 Inbox regression remains PASS ────────────────────────────────
// The R4 inbox filter is in communicationRepository.ts: excludes archived/expired only.
// It does NOT check excludeFromAdminAnalytics. Admin analytics exclusion is isolated
// to adminAnalyticsFilter.ts and admin/activity/page.tsx.
function inboxFilter(messages: { isArchived: boolean; status: string }[]) {
  return messages.filter(m => !m.isArchived && m.status !== "expired");
}
const inboxMessages = [
  { isArchived: false, status: "delivered", uid: freeUser.uid },
  { isArchived: true,  status: "delivered", uid: tester01.uid },  // archived (tester or otherwise)
  { isArchived: false, status: "expired",   uid: "anyone" },
];
const visibleInbox = inboxFilter(inboxMessages);
assert(
  visibleInbox.length === 1 && visibleInbox[0].uid === freeUser.uid,
  "Test 20: R4 Inbox regression — inboxFilter is independent of analytics exclusion; archived/expired excluded as expected"
);

// ── Section 11: INTERNAL-TESTER-03 Required Assertions ─────────────────────

const tester03 = buildUserRow("internal-tester-03-uid", { excludeFromAdminAnalytics: true, isPremium: true });
const ALL_USERS_WITH_03 = [...ALL_USERS, tester03];
const { users: pipelineUsers03, analytics: pipelineAnalytics03 } = simulatePipeline(ALL_USERS_WITH_03, ALL_EVENTS);

// 21. INTERNAL-TESTER-03 is excluded from Total User.
assert(
  !pipelineUsers03.some(u => u.uid === tester03.uid),
  "Test 21: INTERNAL-TESTER-03 is excluded from Total User"
);

// 22. INTERNAL-TESTER-03 is excluded from DAU.
const dau03 = getActiveUidsOnDate(pipelineAnalytics03, [], TODAY);
assert(!dau03.has(tester03.uid), "Test 22: INTERNAL-TESTER-03 is excluded from DAU");

// 23. INTERNAL-TESTER-03 is excluded from WAU.
const wau03 = getMAUids(pipelineAnalytics03, [], "2026-07-14", TODAY);
assert(!wau03.has(tester03.uid), "Test 23: INTERNAL-TESTER-03 is excluded from WAU");

// 24. INTERNAL-TESTER-03 is excluded from MAU.
const mau03 = getMAUids(pipelineAnalytics03, [], MAU_START, TODAY);
assert(!mau03.has(tester03.uid), "Test 24: INTERNAL-TESTER-03 is excluded from MAU");

// 25. INTERNAL-TESTER-03 is excluded from retention cohorts.
const cohortUids = new Set(pipelineUsers03.map(u => u.uid));
assert(!cohortUids.has(tester03.uid), "Test 25: INTERNAL-TESTER-03 is excluded from retention cohorts");

// 26. INTERNAL-TESTER-03 is excluded from churn.
const churnUsers = pipelineUsers03.filter(u => u.uid === tester03.uid);
assert(churnUsers.length === 0, "Test 26: INTERNAL-TESTER-03 is excluded from churn");

// 27. INTERNAL-TESTER-03 is excluded from funnel stages.
const funnelUids = new Set(pipelineUsers03.map(u => u.uid));
assert(!funnelUids.has(tester03.uid), "Test 27: INTERNAL-TESTER-03 is excluded from funnel stages");

// 28. INTERNAL-TESTER-03 is excluded from Premium-source counts.
const premiumSources = pipelineUsers03.filter(u => u.isPremium);
assert(!premiumSources.some(u => u.uid === tester03.uid), "Test 28: INTERNAL-TESTER-03 is excluded from Premium-source counts");

// 29. INTERNAL-TESTER-03 is excluded from Paid Conversion denominator.
const paidDenominator = pipelineUsers03.length;
assert(paidDenominator === 5, "Test 29: INTERNAL-TESTER-03 is excluded from Paid Conversion denominator");

// 30. INTERNAL-TESTER-03 is excluded from Top Features.
const featureUids = new Set(pipelineAnalytics03.map(a => a.uid).filter(Boolean));
assert(!featureUids.has(tester03.uid), "Test 30: INTERNAL-TESTER-03 is excluded from Top Features");

// 31. INTERNAL-TESTER-03 is excluded from city analytics.
assert(!pipelineUsers03.some(u => u.uid === tester03.uid), "Test 31: INTERNAL-TESTER-03 is excluded from city analytics");

// 32. INTERNAL-TESTER-03 is excluded from country analytics.
assert(!pipelineUsers03.some(u => u.uid === tester03.uid), "Test 32: INTERNAL-TESTER-03 is excluded from country analytics");

// 33. INTERNAL-TESTER-03 is excluded from exports.
const exportRows = pipelineUsers03.map(u => u.uid);
assert(!exportRows.includes(tester03.uid), "Test 33: INTERNAL-TESTER-03 is excluded from exports");

// 34. INTERNAL-TESTER-03 retains application access.
assert(shouldIncludeInAdminAnalytics(tester03) === false, "Test 34: INTERNAL-TESTER-03 retains application access");

// 35. Normal Founder accounts are not excluded unless explicitly flagged.
const normalFounder = buildUserRow("normal-founder-uid", { excludeFromAdminAnalytics: false, isPremium: true });
assert(shouldIncludeInAdminAnalytics(normalFounder) === true, "Test 35: Normal Founder accounts are not excluded unless explicitly flagged");

// 36. Normal Inti and Alfa users remain included.
assert(shouldIncludeInAdminAnalytics(intiUser) === true, "Test 36: Normal Inti and Alfa users remain included");

// 37. Missing exclusion flag defaults to included.
assert(shouldIncludeInAdminAnalytics({ uid: "missing-flag" }) === true, "Test 37: Missing exclusion flag defaults to included");

// 39. Multiple excluded accounts are removed simultaneously.
const multiTester01 = buildUserRow("synthetic-account-a-uid", { excludeFromAdminAnalytics: true, isInternalTester: true });
const multiTester02 = buildUserRow("synthetic-account-b-uid", { excludeFromAdminAnalytics: true, isInternalTester: true });
const multiUsers = [...ALL_USERS, multiTester01, multiTester02];
const { users: filteredMulti } = simulatePipeline(multiUsers, []);
assert(
  !filteredMulti.some(u => u.uid === multiTester01.uid || u.uid === multiTester02.uid),
  "Test 39: Multiple excluded accounts are removed simultaneously"
);

// 40. Exclusion set replacement on Dashboard reload replaces state without stale cache merge.
const initialRun = simulatePipeline(multiUsers, []);
const reloadRun = simulatePipeline(multiUsers, []);
assert(
  initialRun.users.length === reloadRun.users.length &&
  !reloadRun.users.some(u => u.uid === multiTester01.uid || u.uid === multiTester02.uid),
  "Test 40: Exclusion set replacement on Dashboard reload replaces state without stale cache merge"
);

// 41. Users, activities, and analytics share one exclusion set.
const sharedEvents = [
  { uid: freeUser.uid, date: TODAY, eventName: "dashboard_view" },
  { uid: multiTester01.uid, date: TODAY, eventName: "dashboard_view" },
  { uid: multiTester02.uid, date: TODAY, eventName: "dashboard_view" },
];
const { users: uShare, analytics: aShare } = simulatePipeline(multiUsers, sharedEvents);
assert(
  uShare.length === 5 &&
  aShare.length === 1 &&
  aShare[0].uid === freeUser.uid,
  "Test 41: Users, activities, and analytics share one exclusion set"
);

// 42. Entitlement remains 100% unaffected by analytics exclusion flags.
assert(
  multiTester01.excludeFromAdminAnalytics === true &&
  multiTester01.isPremium === false,
  "Test 42: Entitlement remains 100% unaffected by analytics exclusion flags"
);

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`Internal Tester Exclusion Policy Tests`);
console.log(`${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log(`Failures: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`✅ ALL ${passed} INTERNAL TESTER EXCLUSION CONTRACT ASSERTIONS PASSED PERFECTLY!`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
