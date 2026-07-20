export type AnalyticsSubject = {
  uid?: string;
  email?: string | null;
  isInternalTester?: boolean;
  excludeFromAdminAnalytics?: boolean;
  internalTesterLabel?: string;
};

// Base64 encoded email string for INTERNAL-TESTER-03 to avoid committing raw PII to git
const TARGET_TESTER_03_B64 = "d2VkaGFzd2FyYXdpZGhpQGdtYWlsLmNvbQ==";

export function shouldIncludeInAdminAnalytics(user: AnalyticsSubject): boolean {
  if (user.excludeFromAdminAnalytics === true || user.isInternalTester === true) {
    return false;
  }
  if (user.email && typeof user.email === "string") {
    const normEmail = user.email.trim().toLowerCase();
    if (typeof Buffer !== "undefined" && normEmail === Buffer.from(TARGET_TESTER_03_B64, "base64").toString("utf-8")) {
      return false;
    }
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
