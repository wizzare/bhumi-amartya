import assert from 'node:assert/strict';
import test from 'node:test';
import { BLUEPRINT_CACHE_TTL_MS } from '../lib/blueprintCachePolicy';

/**
 * TTL/force-refresh semantics are verified against the same policy helpers the
 * hook uses, so this runs without a React renderer or a live Firestore.
 */
import { shouldRefetch } from '../lib/blueprintCachePolicy';

// 22. force refresh bypasses cache
test('22: force refresh always refetches even when entry is fresh', () => {
  const now = 1_000_000;
  const fresh = { fetchedAt: now - 1000 };
  assert.equal(shouldRefetch(fresh, now, false), false, 'fresh entry served from cache');
  assert.equal(shouldRefetch(fresh, now, true), true, 'force bypasses cache');
});

test('22b: entry older than TTL is refetched without force', () => {
  const now = 1_000_000;
  const stale = { fetchedAt: now - BLUEPRINT_CACHE_TTL_MS - 1 };
  assert.equal(shouldRefetch(stale, now, false), true);
});

test('22c: entry exactly at TTL boundary is refetched', () => {
  const now = 1_000_000;
  assert.equal(shouldRefetch({ fetchedAt: now - BLUEPRINT_CACHE_TTL_MS }, now, false), true);
});

test('22d: missing entry always refetches', () => {
  assert.equal(shouldRefetch(undefined, 1_000_000, false), true);
});

test('22e: TTL is centralized and non-zero', () => {
  assert.equal(BLUEPRINT_CACHE_TTL_MS, 5 * 60 * 1000);
});

// 23. logout/cache invalidation
test('23: logout clears cached blueprint and entitlement state', async () => {
  const { clearBlueprintCache, __cacheSize } = await import('../lib/blueprintCachePolicy');
  const store = new Map<string, { fetchedAt: number }>();
  store.set('u1', { fetchedAt: Date.now() });
  store.set('u2', { fetchedAt: Date.now() });
  assert.equal(__cacheSize(store), 2);
  clearBlueprintCache(store);
  assert.equal(__cacheSize(store), 0, 'cache must not survive logout');
});
