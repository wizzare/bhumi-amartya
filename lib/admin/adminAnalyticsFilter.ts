export type AnalyticsSubject = {
  excludeFromAdminAnalytics?: boolean;
};

export function shouldIncludeInAdminAnalytics(user: AnalyticsSubject): boolean {
  return user.excludeFromAdminAnalytics !== true;
}

export function getExcludedUids(users: (AnalyticsSubject & { uid: string })[]): Set<string> {
  return new Set(
    users
      .filter((user) => !shouldIncludeInAdminAnalytics(user))
      .map((user) => user.uid),
  );
}
