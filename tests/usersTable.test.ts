import assert from 'node:assert/strict';
import test from 'node:test';
import type { NormalizedUser } from '../lib/analytics';
import { isIncludedRealUser, normalizeUser, normalizedLastLoginAt } from '../lib/analytics';
import { PAGE_SIZE, dedupeAll, sortForTable } from '../lib/userTableOrdering';


/**
 * The five reachability fixtures required by the P0-2 acceptance criteria.
 * Each carries recency on a different field; E has none at all.
 */
const FIXTURES: Record<string, Record<string, any>> = {
  A: { fullName: 'User A', email: 'a@example.com', participationMetrics: { lastLoginAt: '2026-09-16T10:00:00Z' } },
  B: { fullName: 'User B', email: 'b@example.com', lastLoginAt: '2026-09-15T10:00:00Z' },
  C: { fullName: 'User C', email: 'c@example.com', lastLogin: '2026-09-14T10:00:00Z' },
  D: { fullName: 'User D', email: 'd@example.com', participationMetrics: { lastCheckInAt: '2026-09-13T10:00:00Z' } },
  E: { fullName: 'User E', email: 'e@example.com' },
};

function buildPopulation(): NormalizedUser[] {
  return Object.entries(FIXTURES)
    .filter(([, raw]) => isIncludedRealUser(raw))
    .map(([uid, raw]) => normalizeUser(uid, raw));
}

// 13 + 14 + 15
test('13/14/15: all five recency shapes remain reachable, never-active sorts last', () => {
  const rows = sortForTable(dedupeAll(buildPopulation()));
  assert.equal(rows.length, 5, 'no user may be dropped');

  const uids = rows.map((r) => r.uid);
  for (const expected of ['A', 'B', 'C', 'D', 'E']) {
    assert.ok(uids.includes(expected), `user ${expected} must be reachable`);
  }

  assert.deepEqual(uids, ['A', 'B', 'C', 'D', 'E'], 'descending recency, never-active last');
  assert.equal(rows[4].status, 'Never Active');
});

test('13b: user missing participationMetrics.lastLoginAt is still ordered correctly', () => {
  assert.equal(normalizedLastLoginAt(FIXTURES.A), Date.parse('2026-09-16T10:00:00Z'));
  assert.equal(normalizedLastLoginAt(FIXTURES.B), Date.parse('2026-09-15T10:00:00Z'));
  assert.equal(normalizedLastLoginAt(FIXTURES.C), Date.parse('2026-09-14T10:00:00Z'));
  assert.equal(normalizedLastLoginAt(FIXTURES.D), Date.parse('2026-09-13T10:00:00Z'));
  assert.equal(normalizedLastLoginAt(FIXTURES.E), 0);
});

// 16. full PAGE_SIZE after post-filter exclusions
test('16: page is full after exclusions, never short unless exhausted', () => {
  const raws: Record<string, any> = {};
  for (let i = 0; i < 14; i += 1) {
    raws[`ok${i}`] = { fullName: `Real ${i}`, email: `real${i}@example.com`, lastLoginAt: `2026-09-${String(16 - i).padStart(2, '0')}T10:00:00Z` };
  }
  // Excluded users interleaved: they must not consume page slots.
  raws.qa1 = { fullName: 'QA Delete Me', email: 'qa@example.com', lastLoginAt: '2026-09-16T11:00:00Z' };
  raws.del1 = { fullName: 'Someone', email: 'x@example.com', isDeleted: true, lastLoginAt: '2026-09-16T11:00:00Z' };

  const population = Object.entries(raws)
    .filter(([, raw]) => isIncludedRealUser(raw))
    .map(([uid, raw]) => normalizeUser(uid, raw));
  const rows = sortForTable(dedupeAll(population));

  assert.equal(rows.length, 14, 'only excluded users removed');
  const page1 = rows.slice(0, PAGE_SIZE);
  assert.equal(page1.length, PAGE_SIZE, 'page 1 must be full');
  const page2 = rows.slice(PAGE_SIZE, PAGE_SIZE * 2);
  assert.equal(page2.length, 4, 'final page is short only because data is exhausted');
});

// 17. no duplicate between pages
test('17: no identity appears on more than one page', () => {
  const population: NormalizedUser[] = [];
  for (let i = 0; i < 25; i += 1) {
    population.push(normalizeUser(`u${i}`, {
      fullName: `User ${i}`,
      email: `u${i}@example.com`,
      uid: `u${i}`,
      lastLoginAt: new Date(Date.parse('2026-09-16T00:00:00Z') - i * 3600_000).toISOString(),
    }));
  }
  // Same identity submitted twice must collapse.
  population.push(normalizeUser('u3', { fullName: 'User 3 dup', email: 'u3@example.com', uid: 'u3', lastLoginAt: '2026-01-01T00:00:00Z' }));

  const rows = sortForTable(dedupeAll(population));
  assert.equal(rows.length, 25, 'duplicate identity collapsed once globally');

  const seen = new Set<string>();
  for (let p = 0; p * PAGE_SIZE < rows.length; p += 1) {
    for (const row of rows.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE)) {
      assert.ok(!seen.has(row.uid), `duplicate ${row.uid} across pages`);
      seen.add(row.uid);
    }
  }
  assert.equal(seen.size, 25);
});

// 18. refresh pagination remains deterministic
test('18: ordering is deterministic and stable across repeated derivation', () => {
  const build = () => sortForTable(dedupeAll(buildPopulation())).map((r) => r.uid);
  assert.deepEqual(build(), build());

  // Ties broken by uid so page boundaries cannot drift between refreshes.
  const tied = ['z', 'a', 'm'].map((uid) => normalizeUser(uid, {
    fullName: `User ${uid}`, email: `${uid}@example.com`, lastLoginAt: '2026-09-16T10:00:00Z',
  }));
  assert.deepEqual(sortForTable(tied).map((r) => r.uid), ['a', 'm', 'z']);
});

test('parity: table population equals founder-data included population', () => {
  const included = Object.entries(FIXTURES).filter(([, raw]) => isIncludedRealUser(raw)).length;
  assert.equal(sortForTable(dedupeAll(buildPopulation())).length, included);
});
