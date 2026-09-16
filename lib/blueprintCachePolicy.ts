/**
 * Cache policy for persisted blueprint documents.
 *
 * Kept free of Firebase imports so the rules can be unit-tested directly and
 * reused by the hook without duplicating the TTL logic.
 */

export const BLUEPRINT_CACHE_TTL_MS = 5 * 60 * 1000;

export type CacheStamp = { fetchedAt: number };

/** True when a network read is required. */
export function shouldRefetch(entry: CacheStamp | undefined | null, now: number, force: boolean): boolean {
  if (force) return true;
  if (!entry) return true;
  return now - entry.fetchedAt >= BLUEPRINT_CACHE_TTL_MS;
}

export function clearBlueprintCache(store: Map<string, unknown>) {
  store.clear();
}

export function __cacheSize(store: Map<string, unknown>) {
  return store.size;
}
