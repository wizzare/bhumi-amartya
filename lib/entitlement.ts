export type EntitlementTier =
  | 'FOUNDER'
  | 'PAID'
  | 'TRIAL'
  | 'GRANT_INTI'
  | 'GRANT_ALFA'
  | 'EXPIRED_PAID'
  | 'EXPIRED_TRIAL'
  | 'EXPIRED_GRANT'
  | 'PENDING'
  | 'FREE'
  | 'DATA_INCOMPLETE';

export type EntitlementSource =
  | 'founder'
  | 'billing_purchase_tokens'
  | 'trialEntitlementLedger'
  | 'explicit_grant'
  | 'legacy_profile'
  | 'none';

export type FounderEntitlement = {
  tier: EntitlementTier;
  source: EntitlementSource;
  active: boolean;
  expiresAt: number | null;
  verified: boolean;
  reason: string;
};

export type BillingRecord = {
  uid: string;
  entitlementStatus: string;
  subscriptionState: string;
  ackStatus: string;
  provider: string;
  productId: string;
  accessUntil: string;
};

export type TrialLedgerRecord = {
  uid: string;
  trialGranted: boolean;
  trialStartedAt: string;
  trialEndsAt: string;
  entitlementSource: string;
};

export type BadgeRegistryRecord = {
  uid: string;
  badge: string;
  membership: string;
  premiumMonths: number | null;
  registeredAt: string;
};

export type EntitlementInputs = {
  billing?: BillingRecord | null;
  trial?: TrialLedgerRecord | null;
  badge?: BadgeRegistryRecord | null;
};

export const FOUNDER_EMAIL_CANONICAL = 'wizzare@gmail.com';

function parseTime(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? (value > 1e12 ? value : value * 1000) : null;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function addMonths(startMs: number, months: number): number {
  const d = new Date(startMs);
  d.setMonth(d.getMonth() + months);
  return d.getTime();
}

function isFounderProfile(raw: Record<string, any>): boolean {
  const email = String(raw?.email || '').trim().toLowerCase();
  const role = String(raw?.role || '').trim().toLowerCase();
  return email === FOUNDER_EMAIL_CANONICAL || role === 'founder';
}

function badgeKindFromRegistry(badge: string): 'inti' | 'alfa' | 'founder' | '' {
  const value = badge.toLowerCase();
  if (value.includes('founder')) return 'founder';
  if (value.includes('inti')) return 'inti';
  if (value.includes('alfa')) return 'alfa';
  return '';
}

/**
 * Grant expiry is derived from the badge registry, never from hardcoded
 * calendar constants. Inti = premiumMonths 2, Alfa = premiumMonths 1,
 * measured from registeredAt. LIFETIME_PREMIUM never expires.
 */
export function resolveGrantExpiry(badge: BadgeRegistryRecord): number | null {
  if (String(badge.membership || '').toUpperCase() === 'LIFETIME_PREMIUM') return null;
  const start = parseTime(badge.registeredAt);
  if (start === null) return null;
  const months = Number(badge.premiumMonths);
  if (!Number.isFinite(months) || months <= 0) return null;
  return addMonths(start, months);
}

function billingIsVerified(billing: BillingRecord): boolean {
  return String(billing.provider || '').toLowerCase() === 'google_play'
    && String(billing.ackStatus || '').toUpperCase() === 'ACKNOWLEDGED';
}

function billingIsPending(billing: BillingRecord): boolean {
  const state = String(billing.subscriptionState || '').toUpperCase();
  const status = String(billing.entitlementStatus || '').toUpperCase();
  const ack = String(billing.ackStatus || '').toUpperCase();
  return state.includes('PENDING') || status.includes('PENDING') || ack === 'PENDING';
}

/**
 * Single canonical entitlement resolver.
 *
 * Precedence: Founder > verified paid > active grant > active trial >
 * pending > expired (paid/grant/trial) > legacy-only > free.
 *
 * PAID is only ever returned from billing_purchase_tokens evidence.
 * `isPremium === true` alone can never produce PAID.
 */
export function resolveEntitlement(
  raw: Record<string, any>,
  inputs: EntitlementInputs = {},
  now: number = Date.now(),
): FounderEntitlement {
  const { billing, trial, badge } = inputs;

  if (isFounderProfile(raw) || (badge && badgeKindFromRegistry(badge.badge) === 'founder')) {
    return {
      tier: 'FOUNDER',
      source: 'founder',
      active: true,
      expiresAt: null,
      verified: true,
      reason: 'Founder account',
    };
  }

  if (billing) {
    const expiry = parseTime(billing.accessUntil);
    const verified = billingIsVerified(billing);

    if (billingIsPending(billing)) {
      return {
        tier: 'PENDING',
        source: 'billing_purchase_tokens',
        active: false,
        expiresAt: expiry,
        verified,
        reason: `Google Play purchase pending (${billing.subscriptionState || 'unknown state'})`,
      };
    }

    if (verified && expiry !== null) {
      const active = expiry > now;
      return {
        tier: active ? 'PAID' : 'EXPIRED_PAID',
        source: 'billing_purchase_tokens',
        active,
        expiresAt: expiry,
        verified: true,
        reason: active
          ? `Verified Google Play subscription (${billing.productId || 'unknown product'})`
          : 'Google Play subscription expired',
      };
    }

    return {
      tier: 'DATA_INCOMPLETE',
      source: 'billing_purchase_tokens',
      active: false,
      expiresAt: expiry,
      verified: false,
      reason: 'Billing record present but unverified or missing accessUntil',
    };
  }

  if (badge) {
    const kind = badgeKindFromRegistry(badge.badge);
    if (kind === 'inti' || kind === 'alfa') {
      const expiry = resolveGrantExpiry(badge);
      if (expiry === null) {
        return {
          tier: 'DATA_INCOMPLETE',
          source: 'explicit_grant',
          active: false,
          expiresAt: null,
          verified: false,
          reason: `Badge "${badge.badge}" present but grant duration is not derivable`,
        };
      }
      const active = expiry > now;
      if (active) {
        return {
          tier: kind === 'inti' ? 'GRANT_INTI' : 'GRANT_ALFA',
          source: 'explicit_grant',
          active: true,
          expiresAt: expiry,
          verified: true,
          reason: `${badge.badge} grant active (${badge.membership})`,
        };
      }
      return {
        tier: 'EXPIRED_GRANT',
        source: 'explicit_grant',
        active: false,
        expiresAt: expiry,
        verified: true,
        reason: `${badge.badge} grant ended`,
      };
    }
  }

  if (trial && trial.trialGranted) {
    const expiry = parseTime(trial.trialEndsAt);
    if (expiry === null) {
      return {
        tier: 'DATA_INCOMPLETE',
        source: 'trialEntitlementLedger',
        active: false,
        expiresAt: null,
        verified: false,
        reason: 'Trial ledger entry present but trialEndsAt is unparseable',
      };
    }
    const active = expiry > now;
    return {
      tier: active ? 'TRIAL' : 'EXPIRED_TRIAL',
      source: 'trialEntitlementLedger',
      active,
      expiresAt: expiry,
      verified: true,
      reason: active ? 'Trial window active' : 'Trial window ended',
    };
  }

  const legacyPremium = raw?.isPremium === true
    || String(raw?.membershipType || raw?.membership || raw?.plan || '').toLowerCase().includes('premium');

  if (legacyPremium) {
    return {
      tier: 'DATA_INCOMPLETE',
      source: 'legacy_profile',
      active: false,
      expiresAt: null,
      verified: false,
      reason: 'Legacy isPremium/membership flag without canonical billing, grant, or trial evidence',
    };
  }

  return {
    tier: 'FREE',
    source: 'none',
    active: false,
    expiresAt: null,
    verified: true,
    reason: 'No entitlement evidence found',
  };
}

const TIER_LABELS: Record<EntitlementTier, string> = {
  FOUNDER: 'Founder',
  PAID: 'Google Play Paid',
  TRIAL: 'Trial',
  GRANT_INTI: 'Penjaga Inti',
  GRANT_ALFA: 'Penjaga Alfa',
  EXPIRED_PAID: 'Expired Paid',
  EXPIRED_TRIAL: 'Expired Trial',
  EXPIRED_GRANT: 'Expired Grant',
  PENDING: 'Pending Verification',
  FREE: 'Free',
  DATA_INCOMPLETE: 'Data Incomplete',
};

export function entitlementLabel(tier: EntitlementTier): string {
  return TIER_LABELS[tier] || 'Data Incomplete';
}

export const ENTITLEMENT_DISPLAY_ORDER: EntitlementTier[] = [
  'PAID',
  'TRIAL',
  'GRANT_INTI',
  'GRANT_ALFA',
  'FOUNDER',
  'EXPIRED_PAID',
  'EXPIRED_TRIAL',
  'EXPIRED_GRANT',
  'PENDING',
  'DATA_INCOMPLETE',
  'FREE',
];
