import assert from 'node:assert/strict';
import test from 'node:test';
import type { BadgeRegistryRecord, BillingRecord, TrialLedgerRecord } from '../lib/entitlement';
import { resolveEntitlement, resolveGrantExpiry } from '../lib/entitlement';

const NOW = Date.parse('2026-09-17T00:00:00Z');
const FUTURE = '2026-10-14T09:42:26.003Z';
const PAST = '2026-07-31T12:50:35.035Z';

function billing(over: Partial<BillingRecord> = {}): BillingRecord {
  return {
    uid: 'u1',
    entitlementStatus: 'ACTIVE',
    subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
    ackStatus: 'ACKNOWLEDGED',
    provider: 'google_play',
    productId: 'bhumi_premium_monthly',
    accessUntil: FUTURE,
    ...over,
  };
}

function trial(over: Partial<TrialLedgerRecord> = {}): TrialLedgerRecord {
  return {
    uid: 'u1',
    trialGranted: true,
    trialStartedAt: '2026-09-10T00:00:00Z',
    trialEndsAt: '2026-09-22T00:01:31.847Z',
    entitlementSource: 'trial_ledger',
    ...over,
  };
}

function badge(over: Partial<BadgeRegistryRecord> = {}): BadgeRegistryRecord {
  return {
    uid: 'u1',
    badge: 'Penjaga Bhumi Inti',
    membership: 'PREMIUM_2_MONTHS',
    premiumMonths: 2,
    registeredAt: '2026-06-01',
    ...over,
  };
}

// 1. canonical paid resolver
test('1: canonical resolver returns PAID only from billing evidence', () => {
  const r = resolveEntitlement({}, { billing: billing() }, NOW);
  assert.equal(r.tier, 'PAID');
  assert.equal(r.source, 'billing_purchase_tokens');
  assert.equal(r.verified, true);
  assert.equal(r.active, true);
});

// 2. verified Google Play paid
test('2: verified Google Play paid is active with expiry', () => {
  const r = resolveEntitlement({}, { billing: billing() }, NOW);
  assert.equal(r.expiresAt, Date.parse(FUTURE));
  assert.match(r.reason, /Verified Google Play/);
});

// 3. expired paid
test('3: expired paid subscription', () => {
  const r = resolveEntitlement({}, { billing: billing({ accessUntil: PAST }) }, NOW);
  assert.equal(r.tier, 'EXPIRED_PAID');
  assert.equal(r.active, false);
  assert.equal(r.verified, true);
});

// 4. trial active
test('4: active trial from ledger', () => {
  const r = resolveEntitlement({}, { trial: trial() }, NOW);
  assert.equal(r.tier, 'TRIAL');
  assert.equal(r.source, 'trialEntitlementLedger');
  assert.equal(r.active, true);
});

// 5. trial expired
test('5: expired trial from ledger', () => {
  const r = resolveEntitlement({}, { trial: trial({ trialEndsAt: PAST }) }, NOW);
  assert.equal(r.tier, 'EXPIRED_TRIAL');
  assert.equal(r.active, false);
});

// 6. Founder
test('6: founder by email and by registry badge', () => {
  assert.equal(resolveEntitlement({ email: 'wizzare@gmail.com' }, {}, NOW).tier, 'FOUNDER');
  assert.equal(resolveEntitlement({}, { badge: badge({ badge: 'Founder', membership: 'LIFETIME_PREMIUM', premiumMonths: null }) }, NOW).tier, 'FOUNDER');
  assert.equal(resolveEntitlement({ email: 'wizzare@gmail.com' }, {}, NOW).expiresAt, null);
});

// 7. Inti explicit active grant
test('7: Inti grant active is derived from registeredAt + premiumMonths', () => {
  const r = resolveEntitlement({}, { badge: badge({ registeredAt: '2026-09-01', premiumMonths: 2 }) }, NOW);
  assert.equal(r.tier, 'GRANT_INTI');
  assert.equal(r.active, true);
  assert.equal(r.source, 'explicit_grant');
  assert.equal(r.expiresAt, Date.parse('2026-11-01'));
});

// 8. Alfa explicit active grant
test('8: Alfa grant active', () => {
  const r = resolveEntitlement({}, { badge: badge({ badge: 'Penjaga Bhumi Alfa', membership: 'PREMIUM_1_MONTH', premiumMonths: 1, registeredAt: '2026-09-01' }) }, NOW);
  assert.equal(r.tier, 'GRANT_ALFA');
  assert.equal(r.active, true);
});

test('8b: production June grants are genuinely expired, not hardcoded', () => {
  const r = resolveEntitlement({}, { badge: badge({ registeredAt: '2026-06-01', premiumMonths: 2 }) }, NOW);
  assert.equal(r.tier, 'EXPIRED_GRANT');
  assert.equal(r.expiresAt, Date.parse('2026-08-01'));
});

// 9. badge-only without expiry
test('9: badge without derivable duration is DATA_INCOMPLETE, never Expired Grant', () => {
  const r = resolveEntitlement({}, { badge: badge({ premiumMonths: null, registeredAt: '' }) }, NOW);
  assert.equal(r.tier, 'DATA_INCOMPLETE');
  assert.equal(r.verified, false);
  assert.notEqual(r.tier, 'EXPIRED_GRANT');
});

// 10. legacy isPremium=true without proof
test('10: legacy isPremium alone never yields PAID', () => {
  const r = resolveEntitlement({ isPremium: true }, {}, NOW);
  assert.equal(r.tier, 'DATA_INCOMPLETE');
  assert.equal(r.source, 'legacy_profile');
  assert.equal(r.verified, false);
  assert.notEqual(r.tier, 'PAID');
});

// 11. pending purchase
test('11: pending purchase state', () => {
  const r = resolveEntitlement({}, { billing: billing({ subscriptionState: 'SUBSCRIPTION_STATE_PENDING' }) }, NOW);
  assert.equal(r.tier, 'PENDING');
  assert.equal(r.active, false);
});

// 12. free
test('12: no evidence yields FREE', () => {
  const r = resolveEntitlement({ email: 'someone@example.com' }, {}, NOW);
  assert.equal(r.tier, 'FREE');
  assert.equal(r.source, 'none');
});

test('precedence: billing outranks badge and trial', () => {
  const r = resolveEntitlement({ isPremium: true }, { billing: billing(), badge: badge(), trial: trial() }, NOW);
  assert.equal(r.tier, 'PAID');
});

test('grant expiry: LIFETIME_PREMIUM never expires', () => {
  assert.equal(resolveGrantExpiry(badge({ membership: 'LIFETIME_PREMIUM' })), null);
});
