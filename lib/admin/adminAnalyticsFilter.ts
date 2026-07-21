export type AnalyticsSubject = {
  uid?: string;
  email?: string | null;
  isInternalTester?: boolean;
  excludeFromAdminAnalytics?: boolean;
  internalTesterLabel?: string;
};

/**
 * Pure policy function for Admin/Founder Dashboard analytics exclusion.
 *
 * Internal testers marked with `excludeFromAdminAnalytics: true` or `isInternalTester: true`
 * are strictly excluded from all dashboard metrics, funnels, activity lists, and aggregates.
 *
 * No hardcoded emails or UIDs are allowed in application logic.
 */
export function shouldIncludeInAdminAnalytics(user: AnalyticsSubject): boolean {
  if (user.excludeFromAdminAnalytics === true || user.isInternalTester === true) {
    return false;
  }
  return true;
}

export function getExcludedUids(users: (AnalyticsSubject & { uid: string })[]): Set<string> {
  return new Set(
    users
      .filter((user) => !shouldIncludeInAdminAnalytics(user))
      .map((user) => user.uid),
  );
}
