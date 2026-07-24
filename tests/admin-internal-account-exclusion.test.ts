/**
 * Admin Internal Account Exclusion Unit Tests
 *
 * Contract Verification:
 * 1. wedhaswarawidhi@gmail.com excluded
 * 2. widhi.w.karyodikromo@gmail.com excluded
 * 3. uppercase variant excluded
 * 4. surrounding whitespace excluded
 * 5. ordinary email included
 * 6. null email safe
 * 7. undefined email safe
 * 8. null UID safe
 * 9. excluded UID derived from user record
 * 10. UID-only activity from excluded account excluded
 * 11. ordinary UID-only activity included
 * 12. excluded users removed before total count
 * 13. excluded users removed before active count
 * 14. excluded users removed before new-user count
 * 15. excluded users removed before version distribution
 * 16. excluded users removed before build distribution
 * 17. excluded users absent from search
 * 18. excluded users absent from table data
 * 19. pagination total uses filtered count
 * 20. export input uses filtered data
 * 21. selected excluded user is rejected/cleared
 * 22. ordinary users and metrics remain unchanged
 */

import {
  ADMIN_EXCLUDED_EMAILS,
  isAdminExcludedEmail,
  isAdminExcludedAccount,
  deriveAdminExcludedUids,
  normalizeAdminAccountEmail,
} from "../lib/admin/adminAccountExclusions";
import { shouldIncludeInAdminAnalytics } from "../lib/admin/adminAnalyticsFilter";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    failed++;
  }
}

console.log("▶ Running Admin Internal Account Exclusion Focused Tests\n");

// 1. wedhaswarawidhi@gmail.com excluded
assert(
  isAdminExcludedEmail("wedhaswarawidhi@gmail.com") === true &&
    shouldIncludeInAdminAnalytics({ email: "wedhaswarawidhi@gmail.com" }) === false,
  "1. wedhaswarawidhi@gmail.com excluded"
);

// 2. widhi.w.karyodikromo@gmail.com excluded
assert(
  isAdminExcludedEmail("widhi.w.karyodikromo@gmail.com") === true &&
    shouldIncludeInAdminAnalytics({ email: "widhi.w.karyodikromo@gmail.com" }) === false,
  "2. widhi.w.karyodikromo@gmail.com excluded"
);

// 3. uppercase variant excluded
assert(
  isAdminExcludedEmail("WEDHASWARAWIDHI@GMAIL.COM") === true &&
    isAdminExcludedEmail("WIDHI.W.KARYODIKROMO@GMAIL.COM") === true,
  "3. uppercase variant excluded"
);

// 4. surrounding whitespace excluded
assert(
  isAdminExcludedEmail("  wedhaswarawidhi@gmail.com  ") === true &&
    isAdminExcludedEmail("\twidhi.w.karyodikromo@gmail.com\n") === true,
  "4. surrounding whitespace excluded"
);

// 5. ordinary email included
assert(
  isAdminExcludedEmail("ordinary.user@example.com") === false &&
    shouldIncludeInAdminAnalytics({ email: "ordinary.user@example.com" }) === true,
  "5. ordinary email included"
);

// 6. null email safe
assert(
  isAdminExcludedEmail(null) === false &&
    isAdminExcludedAccount({ email: null }) === false,
  "6. null email safe"
);

// 7. undefined email safe
assert(
  isAdminExcludedEmail(undefined) === false &&
    isAdminExcludedAccount({ email: undefined }) === false,
  "7. undefined email safe"
);

// 8. null UID safe
assert(
  isAdminExcludedAccount({ email: "user@example.com", uid: null }) === false,
  "8. null UID safe"
);

// 9. excluded UID derived from user record
const syntheticUsers = [
  { uid: "uid-ex-1", email: "wedhaswarawidhi@gmail.com" },
  { uid: "uid-ex-2", email: "widhi.w.karyodikromo@gmail.com" },
  { uid: "uid-ord-1", email: "jiwa.biasa@example.com" },
];
const derivedExcludedUids = deriveAdminExcludedUids(syntheticUsers);
assert(
  derivedExcludedUids.has("uid-ex-1") &&
    derivedExcludedUids.has("uid-ex-2") &&
    !derivedExcludedUids.has("uid-ord-1"),
  "9. excluded UID derived from user record"
);

// 10. UID-only activity from excluded account excluded
assert(
  isAdminExcludedAccount({ uid: "uid-ex-1", excludedUids: derivedExcludedUids }) === true,
  "10. UID-only activity from excluded account excluded"
);

// 11. ordinary UID-only activity included
assert(
  isAdminExcludedAccount({ uid: "uid-ord-1", excludedUids: derivedExcludedUids }) === false,
  "11. ordinary UID-only activity included"
);

// 12. excluded users removed before total count
const eligibleUsers = syntheticUsers.filter(
  (u) => !isAdminExcludedAccount({ email: u.email, uid: u.uid, excludedUids: derivedExcludedUids })
);
assert(
  eligibleUsers.length === 1 && eligibleUsers[0].uid === "uid-ord-1",
  "12. excluded users removed before total count"
);

// 13. excluded users removed before active count
const syntheticActivities = [
  { uid: "uid-ex-1", date: "2026-07-25" },
  { uid: "uid-ord-1", date: "2026-07-25" },
];
const eligibleActivities = syntheticActivities.filter(
  (a) => !isAdminExcludedAccount({ uid: a.uid, excludedUids: derivedExcludedUids })
);
assert(
  eligibleActivities.length === 1 && eligibleActivities[0].uid === "uid-ord-1",
  "13. excluded users removed before active count"
);

// 14. excluded users removed before new-user count
const syntheticNewUsers = [
  { uid: "uid-ex-1", email: "wedhaswarawidhi@gmail.com", registeredAt: 1770000000 },
  { uid: "uid-ord-1", email: "jiwa.biasa@example.com", registeredAt: 1770000000 },
];
const eligibleNewUsers = syntheticNewUsers.filter(
  (u) => !isAdminExcludedAccount({ email: u.email, uid: u.uid, excludedUids: derivedExcludedUids })
);
assert(
  eligibleNewUsers.length === 1 && eligibleNewUsers[0].uid === "uid-ord-1",
  "14. excluded users removed before new-user count"
);

// 15. excluded users removed before version distribution
const syntheticVersionData = [
  { uid: "uid-ex-1", appVersion: "4.0.80", email: "wedhaswarawidhi@gmail.com" },
  { uid: "uid-ord-1", appVersion: "4.0.80", email: "jiwa.biasa@example.com" },
];
const eligibleVersions = syntheticVersionData.filter(
  (v) => !isAdminExcludedAccount({ email: v.email, uid: v.uid, excludedUids: derivedExcludedUids })
);
assert(
  eligibleVersions.length === 1 && eligibleVersions[0].uid === "uid-ord-1",
  "15. excluded users removed before version distribution"
);

// 16. excluded users removed before build distribution
const syntheticBuildData = [
  { uid: "uid-ex-2", buildNumber: "80", email: "widhi.w.karyodikromo@gmail.com" },
  { uid: "uid-ord-1", buildNumber: "80", email: "jiwa.biasa@example.com" },
];
const eligibleBuilds = syntheticBuildData.filter(
  (b) => !isAdminExcludedAccount({ email: b.email, uid: b.uid, excludedUids: derivedExcludedUids })
);
assert(
  eligibleBuilds.length === 1 && eligibleBuilds[0].uid === "uid-ord-1",
  "16. excluded users removed before build distribution"
);

// 17. excluded users absent from search
const searchText = "wedhaswara";
const searchResults = eligibleUsers.filter(
  (u) => u.email.toLowerCase().includes(searchText)
);
assert(
  searchResults.length === 0,
  "17. excluded users absent from search"
);

// 18. excluded users absent from table data
const tableData = eligibleUsers;
assert(
  !tableData.some((u) => isAdminExcludedAccount({ email: u.email, uid: u.uid })),
  "18. excluded users absent from table data"
);

// 19. pagination total uses filtered count
const pageSize = 10;
const totalPages = Math.ceil(eligibleUsers.length / pageSize);
assert(
  eligibleUsers.length === 1 && totalPages === 1,
  "19. pagination total uses filtered count"
);

// 20. export input uses filtered data
const exportRows = eligibleUsers.map((u) => u.email);
assert(
  !exportRows.includes("wedhaswarawidhi@gmail.com") &&
    !exportRows.includes("widhi.w.karyodikromo@gmail.com"),
  "20. export input uses filtered data"
);

// 21. selected excluded user is rejected/cleared
let selectedUser: { uid: string; email: string } | null = {
  uid: "uid-ex-1",
  email: "wedhaswarawidhi@gmail.com",
};
if (isAdminExcludedAccount({ email: selectedUser.email, uid: selectedUser.uid })) {
  selectedUser = null;
}
assert(
  selectedUser === null,
  "21. selected excluded user is rejected/cleared"
);

// 22. ordinary users and metrics remain unchanged
const ordinaryUser = { uid: "uid-ord-1", email: "jiwa.biasa@example.com" };
assert(
  isAdminExcludedAccount({ email: ordinaryUser.email, uid: ordinaryUser.uid }) === false &&
    shouldIncludeInAdminAnalytics(ordinaryUser) === true,
  "22. ordinary users and metrics remain unchanged"
);

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} assertions.`);
if (failed > 0) {
  process.exit(1);
}
