'use client';

import { collection, getDocs } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  BadgeRegistryRecord,
  BillingRecord,
  EntitlementInputs,
  TrialLedgerRecord,
} from '@/lib/entitlement';

export type EntitlementIndex = {
  billing: Map<string, BillingRecord>;
  trial: Map<string, TrialLedgerRecord>;
  badge: Map<string, BadgeRegistryRecord>;
  fetchedAt: number;
  counts: { billing: number; trial: number; badge: number };
};

export const EMPTY_ENTITLEMENT_INDEX: EntitlementIndex = {
  billing: new Map(),
  trial: new Map(),
  badge: new Map(),
  fetchedAt: 0,
  counts: { billing: 0, trial: 0, badge: 0 },
};

let sharedCache: EntitlementIndex | null = null;
let sharedRequest: Promise<EntitlementIndex> | null = null;

export function peekEntitlementIndex(): EntitlementIndex | null {
  return sharedCache;
}

export function clearEntitlementIndex() {
  sharedCache = null;
  sharedRequest = null;
}

/**
 * Picks the most permissive billing record per uid: an active subscription
 * outranks an expired one, and the furthest accessUntil wins. A uid can hold
 * several purchase tokens over time (renewals, re-purchases).
 */
function preferBilling(current: BillingRecord | undefined, next: BillingRecord): BillingRecord {
  if (!current) return next;
  const currentUntil = Date.parse(current.accessUntil || '') || 0;
  const nextUntil = Date.parse(next.accessUntil || '') || 0;
  return nextUntil > currentUntil ? next : current;
}

function preferTrial(current: TrialLedgerRecord | undefined, next: TrialLedgerRecord): TrialLedgerRecord {
  if (!current) return next;
  const currentEnds = Date.parse(current.trialEndsAt || '') || 0;
  const nextEnds = Date.parse(next.trialEndsAt || '') || 0;
  return nextEnds > currentEnds ? next : current;
}

async function fetchEntitlementIndex(): Promise<EntitlementIndex> {
  const [billingSnap, trialSnap, badgeSnap] = await Promise.all([
    getDocs(collection(db, 'billing_purchase_tokens')),
    getDocs(collection(db, 'trialEntitlementLedger')),
    getDocs(collection(db, 'testerBadgeRegistry')),
  ]);

  const billing = new Map<string, BillingRecord>();
  billingSnap.docs.forEach((item) => {
    const x = item.data() as Record<string, any>;
    const uid = String(x.uid || '').trim();
    if (!uid) return;
    billing.set(uid, preferBilling(billing.get(uid), {
      uid,
      entitlementStatus: String(x.entitlementStatus || ''),
      subscriptionState: String(x.subscriptionState || ''),
      ackStatus: String(x.ackStatus || ''),
      provider: String(x.provider || ''),
      productId: String(x.productId || ''),
      accessUntil: String(x.accessUntil || ''),
    }));
  });

  const trial = new Map<string, TrialLedgerRecord>();
  trialSnap.docs.forEach((item) => {
    const x = item.data() as Record<string, any>;
    const uid = String(x.uid || item.id || '').trim();
    if (!uid) return;
    trial.set(uid, preferTrial(trial.get(uid), {
      uid,
      trialGranted: x.trialGranted === true,
      trialStartedAt: String(x.trialStartedAt || ''),
      trialEndsAt: String(x.trialEndsAt || ''),
      entitlementSource: String(x.entitlementSource || ''),
    }));
  });

  const badge = new Map<string, BadgeRegistryRecord>();
  badgeSnap.docs.forEach((item) => {
    const x = item.data() as Record<string, any>;
    const uid = String(x.uid || item.id || '').trim();
    if (!uid) return;
    const months = Number(x.premiumMonths);
    badge.set(uid, {
      uid,
      badge: String(x.badge || ''),
      membership: String(x.membership || ''),
      premiumMonths: Number.isFinite(months) ? months : null,
      registeredAt: String(x.registeredAt || ''),
    });
  });

  return {
    billing,
    trial,
    badge,
    fetchedAt: Date.now(),
    counts: { billing: billing.size, trial: trial.size, badge: badge.size },
  };
}

export async function ensureEntitlementIndex(force = false): Promise<EntitlementIndex> {
  return getEntitlementIndex(force);
}

async function getEntitlementIndex(force = false) {
  if (!force && sharedCache) return sharedCache;
  if (!force && sharedRequest) return sharedRequest;

  sharedRequest = fetchEntitlementIndex();
  try {
    sharedCache = await sharedRequest;
    return sharedCache;
  } finally {
    sharedRequest = null;
  }
}

/** Join key is the Firebase auth uid, which is the users/{docId}. */
export function entitlementInputsFor(index: EntitlementIndex | null, uid: string): EntitlementInputs {
  if (!index) return {};
  return {
    billing: index.billing.get(uid) || null,
    trial: index.trial.get(uid) || null,
    badge: index.badge.get(uid) || null,
  };
}

export function useEntitlementSources() {
  const [index, setIndex] = useState<EntitlementIndex | null>(sharedCache);
  const [loading, setLoading] = useState(!sharedCache);
  const [error, setError] = useState('');

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError('');
    try {
      setIndex(await getEntitlementIndex(force));
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca sumber entitlement kanonik.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(false); }, [load]);

  return { index, loading, error, refresh: () => load(true) };
}
