export type AnalyticsSubject = {
  uid?: string;
  email?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  name?: string | null;
  createdAt?: any;
  isInternalTester?: boolean;
  excludeFromAdminAnalytics?: boolean;
  internalTesterLabel?: string;
  authMissing?: boolean;
};

export type UserAnalyticsEligibility =
  | "eligible"
  | "excluded_internal"
  | "incomplete_record"
  | "orphan_confirmed";

/**
 * Classifies user accounts for Founder Dashboard analytics inclusion.
 *
 * Classifications:
 * - `excluded_internal`: Internal testers with `excludeFromAdminAnalytics: true` or `isInternalTester: true`.
 * - `orphan_confirmed`: Server-verified Auth absence.
 * - `incomplete_record`: Missing email, phone number, real name, and creation metadata.
 * - `eligible`: Valid email or phone users.
 */
export function getAnalyticsEligibility(user: AnalyticsSubject): UserAnalyticsEligibility {
  if (user.excludeFromAdminAnalytics === true || user.isInternalTester === true) {
    return "excluded_internal";
  }

  if (user.authMissing === true) {
    return "orphan_confirmed";
  }

  const hasEmail = Boolean(user.email && user.email.trim().length > 0);
  const hasPhone = Boolean(user.phoneNumber && user.phoneNumber.trim().length > 0);
  const hasName = Boolean(
    (user.displayName && user.displayName.trim().length > 0) ||
    (user.name && user.name.trim().length > 0 && user.name.trim().toLowerCase() !== "jiwa")
  );
  const hasCreatedAt = Boolean(user.createdAt);

  if (!hasEmail && !hasPhone && !hasName && !hasCreatedAt) {
    return "incomplete_record";
  }

  return "eligible";
}

export function shouldIncludeInAdminAnalytics(user: AnalyticsSubject): boolean {
  return getAnalyticsEligibility(user) === "eligible";
}

export function getExcludedUids(users: (AnalyticsSubject & { uid: string })[]): Set<string> {
  return new Set(
    users
      .filter((user) => !shouldIncludeInAdminAnalytics(user))
      .map((user) => user.uid),
  );
}
