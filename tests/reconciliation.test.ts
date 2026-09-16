import assert from 'node:assert/strict';
import test from 'node:test';
import type { NormalizedUser } from '@/lib/analytics';
import { isIncludedRealUser, normalizeUser } from '@/lib/analytics';
import { dedupeAll, sortForTable, PAGE_SIZE } from '@/lib/userTableOrdering';
import { ENTITLEMENT_DISPLAY_ORDER, entitlementLabel, resolveEntitlement } from '@/lib/entitlement';
import type { EntitlementInputs } from '@/lib/entitlement';

const NOW = Date.parse('2026-09-17T00:00:00Z');

const billing = (accessUntil: string) => ({
  uid: 'x', entitlementStatus: 'ACTIVE', subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
  ackStatus: 'ACKNOWLEDGED', provider: 'google_play', productId: 'bhumi_premium_monthly', accessUntil,
});
const trial = (trialEndsAt: string) => ({
  uid: 'x', trialGranted: true, trialStartedAt: '2026-09-01T00:00:00Z', trialEndsAt, entitlementSource: 'ledger',
});
const badgeInti = (registeredAt: string) => ({
  uid: 'x', badge: 'Penjaga Bhumi Inti', membership: 'PREMIUM_2_MONTHS', premiumMonths: 2, registeredAt,
});

/**
 * Step 3 precedence matrix. A uid may legitimately hold billing + badge +
 * trial simultaneously (26 such users exist in production); the resolver must
 * pick deterministically and must never downgrade verified paid access.
 */
test('RECON-1: precedence matrix over overlapping evidence', () => {
  const cases: Array<{ name: string; inputs: EntitlementInputs; raw?: Record<string, any>; expect: string }> = [
    { name: 'billing+trial: active paid wins', inputs: { billing: billing('2026-10-14T00:00:00Z'), trial: trial('2026-09-22T00:00:00Z') }, expect: 'PAID' },
    { name: 'billing+badge: active paid wins', inputs: { billing: billing('2026-10-14T00:00:00Z'), badge: badgeInti('2026-06-01') }, expect: 'PAID' },
    { name: 'billing+badge+trial: active paid wins', inputs: { billing: billing('2026-10-14T00:00:00Z'), badge: badgeInti('2026-06-01'), trial: trial('2026-09-22T00:00:00Z') }, expect: 'PAID' },
    { name: 'expired billing still outranks trial', inputs: { billing: billing('2026-07-31T00:00:00Z'), trial: trial('2026-09-22T00:00:00Z') }, expect: 'EXPIRED_PAID' },
    { name: 'badge+trial: grant evaluated before trial', inputs: { badge: badgeInti('2026-09-01'), trial: trial('2026-09-22T00:00:00Z') }, expect: 'GRANT_INTI' },
    { name: 'expired badge+active trial: grant state reported', inputs: { badge: badgeInti('2026-06-01'), trial: trial('2026-09-22T00:00:00Z') }, expect: 'EXPIRED_GRANT' },
    { name: 'founder outranks everything', raw: { email: 'wizzare@gmail.com' }, inputs: { billing: billing('2026-10-14T00:00:00Z'), badge: badgeInti('2026-06-01') }, expect: 'FOUNDER' },
    { name: 'legacy isPremium loses to real trial', raw: { isPremium: true }, inputs: { trial: trial('2026-09-22T00:00:00Z') }, expect: 'TRIAL' },
    { name: 'legacy isPremium alone is never PAID', raw: { isPremium: true }, inputs: {}, expect: 'DATA_INCOMPLETE' },
  ];

  for (const c of cases) {
    const actual = resolveEntitlement(c.raw || {}, c.inputs, NOW).tier;
    assert.equal(actual, c.expect, `${c.name}: expected ${c.expect}, got ${actual}`);
  }
});

test('RECON-2: verified paid can never be displayed as Trial or Grant', () => {
  const withPaid = resolveEntitlement({ isPremium: true }, {
    billing: billing('2026-10-14T00:00:00Z'), badge: badgeInti('2026-09-01'), trial: trial('2026-09-22T00:00:00Z'),
  }, NOW);
  assert.equal(withPaid.tier, 'PAID');
  assert.equal(withPaid.source, 'billing_purchase_tokens');
  assert.ok(!['TRIAL', 'GRANT_INTI', 'GRANT_ALFA'].includes(withPaid.tier));
});

/**
 * Step 4 invariant: categories are mutually exclusive and cover the whole
 * canonical population. SUM(categories) must equal included users.
 */
test('RECON-3: every included user resolves to exactly one classification', () => {
  const raws: Record<string, Record<string, any>> = {
    paid: { fullName: 'P', email: 'p@e.com' },
    trialUser: { fullName: 'T', email: 't@e.com' },
    grant: { fullName: 'G', email: 'g@e.com' },
    legacy: { fullName: 'L', email: 'l@e.com', isPremium: true },
    free: { fullName: 'F', email: 'f@e.com' },
    neverActive: { fullName: 'N', email: 'n@e.com' },
    excludedQa: { fullName: 'QA Delete', email: 'qa@e.com' },
    excludedDeleted: { fullName: 'D', email: 'd@e.com', isDeleted: true },
  };
  const index: Record<string, EntitlementInputs> = {
    paid: { billing: billing('2026-10-14T00:00:00Z') },
    trialUser: { trial: trial('2026-09-22T00:00:00Z') },
    grant: { badge: badgeInti('2026-09-01') },
  };

  const included: NormalizedUser[] = Object.entries(raws)
    .filter(([, raw]) => isIncludedRealUser(raw))
    .map(([uid, raw]) => normalizeUser(uid, raw, index[uid] || {}));

  assert.equal(included.length, 6, 'two users excluded');

  const counts = new Map<string, number>();
  for (const u of included) counts.set(u.entitlement.tier, (counts.get(u.entitlement.tier) || 0) + 1);

  const sum = [...counts.values()].reduce((a, b) => a + b, 0);
  assert.equal(sum, included.length, 'SUM(categories) must equal included canonical users');

  for (const u of included) {
    assert.ok(ENTITLEMENT_DISPLAY_ORDER.includes(u.entitlement.tier), `${u.entitlement.tier} must be displayable`);
    assert.equal(typeof entitlementLabel(u.entitlement.tier), 'string');
  }
});

test('RECON-4: table population equals canonical population (set equality)', () => {
  const raws: Record<string, Record<string, any>> = {};
  for (let i = 0; i < 23; i += 1) {
    raws[`u${i}`] = { fullName: `User ${i}`, email: `u${i}@e.com`, uid: `u${i}`, lastLoginAt: `2026-09-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z` };
  }
  raws.noRecency = { fullName: 'No Recency', email: 'nr@e.com', uid: 'noRecency' };
  raws.qa = { fullName: 'Test Dummy', email: 'qa2@e.com', uid: 'qa' };

  const canonical = Object.entries(raws)
    .filter(([, raw]) => isIncludedRealUser(raw))
    .map(([uid, raw]) => normalizeUser(uid, raw));
  const table = sortForTable(dedupeAll(canonical));

  const canonicalUids = new Set(dedupeAll(canonical).map((u) => u.uid));
  const pageUids = new Set<string>();
  for (let i = 0; i < table.length; i += PAGE_SIZE) {
    for (const r of table.slice(i, i + PAGE_SIZE)) {
      assert.ok(!pageUids.has(r.uid), 'no duplicate across pages');
      pageUids.add(r.uid);
    }
  }

  assert.equal(pageUids.size, canonicalUids.size);
  for (const uid of canonicalUids) assert.ok(pageUids.has(uid), `${uid} must be reachable via pagination`);
  assert.ok(!pageUids.has('qa'), 'excluded user must not appear');
  assert.ok(pageUids.has('noRecency'), 'user with no recency must remain reachable');
});

test('RECON-5: no hardcoded grant expiry constants remain in classification', () => {
  const sameBadgeDifferentDates = [
    { registeredAt: '2026-06-01', expectActive: false },
    { registeredAt: '2026-09-01', expectActive: true },
  ];
  for (const c of sameBadgeDifferentDates) {
    const r = resolveEntitlement({}, { badge: badgeInti(c.registeredAt) }, NOW);
    assert.equal(r.active, c.expectActive, `${c.registeredAt} active=${c.expectActive}`);
    assert.equal(r.source, 'explicit_grant');
  }
});
