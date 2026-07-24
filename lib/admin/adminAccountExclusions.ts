/**
 * Centralized Admin Dashboard Exclusion Contract
 *
 * Founder Decision:
 * Permanently exclude internal accounts from all Admin Dashboard surfaces.
 * Data remains stored in Firebase Auth and Firestore, but is excluded
 * from Admin analytics, tables, metrics, exports, and detail views.
 */

export const ADMIN_EXCLUDED_EMAILS: ReadonlySet<string> = new Set([
  "wedhaswarawidhi@gmail.com",
  "widhi.w.karyodikromo@gmail.com",
]);

export function normalizeAdminAccountEmail(email?: string | null): string {
  return (email ?? "").trim().toLowerCase();
}

export function isAdminExcludedEmail(email?: string | null): boolean {
  const normalized = normalizeAdminAccountEmail(email);
  if (!normalized) return false;
  return ADMIN_EXCLUDED_EMAILS.has(normalized);
}

export interface AdminExclusionInput {
  email?: string | null;
  uid?: string | null;
  excludedUids?: ReadonlySet<string> | Set<string> | null;
  excludeFromAdminAnalytics?: boolean;
  isInternalTester?: boolean;
}

export function isAdminExcludedAccount(input?: AdminExclusionInput | null): boolean {
  if (!input) return false;

  if (input.email && isAdminExcludedEmail(input.email)) {
    return true;
  }

  if (input.uid && input.excludedUids && input.excludedUids.has(input.uid)) {
    return true;
  }

  if (input.excludeFromAdminAnalytics === true || input.isInternalTester === true) {
    return true;
  }

  return false;
}

export function deriveAdminExcludedUids(
  users: Array<{
    uid?: string | null;
    email?: string | null;
    excludeFromAdminAnalytics?: boolean;
    isInternalTester?: boolean;
  }>
): Set<string> {
  const excludedUids = new Set<string>();
  if (!Array.isArray(users)) return excludedUids;

  for (const user of users) {
    if (!user || !user.uid) continue;
    if (
      (user.email && isAdminExcludedEmail(user.email)) ||
      user.excludeFromAdminAnalytics === true ||
      user.isInternalTester === true
    ) {
      excludedUids.add(user.uid);
    }
  }

  return excludedUids;
}
