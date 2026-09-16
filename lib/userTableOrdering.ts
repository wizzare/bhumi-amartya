import type { NormalizedUser } from '@/lib/analytics';
import { normalizedLastLoginAt } from '@/lib/analytics';

export const PAGE_SIZE = 10;

export function identityFor(user: NormalizedUser): string {
  const raw = user.raw || {};
  const authId = String(raw.authUid || raw.uid || raw.userId || raw.ownerUserId || '').trim();
  if (authId) return `uid:${authId}`;
  const email = String(user.email || '').trim().toLowerCase();
  if (email) return `email:${email}`;
  return `doc:${user.uid}`;
}

/**
 * Deterministic ordering for the whole table.
 *
 * Previously the table issued a Firestore query ordered by
 * participationMetrics.lastLoginAt, which silently dropped every user missing
 * that exact field (15 of 581 in the audited production snapshot). Ordering is
 * now computed from the normalized fallback chain, so users whose recency lives
 * on lastLoginAt / lastLogin / lastCheckInAt are included, and users with no
 * activity sort last as Never Active instead of disappearing.
 *
 * uid is the final tiebreaker so page boundaries are stable across refreshes.
 */
export function sortForTable(users: NormalizedUser[]): NormalizedUser[] {
  return [...users].sort((a, b) => {
    const aTime = normalizedLastLoginAt(a.raw || {}) || a.lastLoginAt;
    const bTime = normalizedLastLoginAt(b.raw || {}) || b.lastLoginAt;
    if (bTime !== aTime) return bTime - aTime;
    return a.uid.localeCompare(b.uid);
  });
}

/** Collapses duplicate identities once, across the entire population. */
export function dedupeAll(users: NormalizedUser[]): NormalizedUser[] {
  const unique = new Map<string, NormalizedUser>();
  users.forEach((user) => {
    const identity = identityFor(user);
    const current = unique.get(identity);
    if (!current) {
      unique.set(identity, user);
      return;
    }
    const currentFreshness = Math.max(current.lastLoginAt, current.lastSeenAt);
    const nextFreshness = Math.max(user.lastLoginAt, user.lastSeenAt);
    if (nextFreshness > currentFreshness) unique.set(identity, user);
  });
  return [...unique.values()];
}
