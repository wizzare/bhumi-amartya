export const MOANA_BILLING_RUNTIME_ENABLED = false;

import { ALFA_ACCESS_UNTIL, INTI_ACCESS_UNTIL } from "./founderTesterSourceOfTruth";

// ============================================================================
// CANONICAL ENTITLEMENT ARCHITECTURE RULE (Build 99+, enforced 2026-08-20)
// ============================================================================
// These helpers (getCurrentBadge, isExpiredUser, isTrialUser,
// hasActiveBadgeAccess, canAccessPremiumFeature) are the LOW-LEVEL building
// blocks for the parallel resolver in lib/billing/accessControl.ts.
//
// SINGLE-RESOLVER RULE: any consumer in app/** that needs to decide
// "should this user see premium content?" MUST go through ONE of:
//   - lib/billing/entitlementService.ts#getEntitlementStatus (canonical, preferred)
//   - lib/billing/accessControl.ts#hasFeatureAccess (derivative; requires
//     testerRecord parameter to match canonical semantics)
//
// When `testerRecord` is provided, the badge and expiry logic MUST honor the
// canonical Inti/Alfa windows in founderTesterSourceOfTruth (INTI_ACCESS_UNTIL
// / ALFA_ACCESS_UNTIL). Stale profile.accessUntil must never shorten a
// canonical grant.
//
// See: WIDYA_CASE_AUDIT_FINDINGS_2026_08_20.md
// ============================================================================

export const MOANA_PLAY_BILLING_PRODUCT_IDS = {
  monthly: "TODO_PLAY_CONSOLE_MONTHLY_SUBSCRIPTION_ID",
  yearly: "TODO_PLAY_CONSOLE_YEARLY_SUBSCRIPTION_ID",
} as const;

export const MOANA_PLAY_BILLING_SUBSCRIPTION_IDS = {
  penjagaBhumiMonthly: MOANA_PLAY_BILLING_PRODUCT_IDS.monthly,
  penjagaBhumiYearly: MOANA_PLAY_BILLING_PRODUCT_IDS.yearly,
} as const;

export const MOANA_BILLING_BACKEND_ENDPOINTS = {
  verifyPurchase: "/api/billing/google-play/verify",
  restorePurchase: "/api/billing/google-play/restore",
  refreshBadge: "/api/access/refresh-badge",
} as const;

export { SERVER_OWNED_ACCESS_FIELDS } from "./serverOwnedAccessFields";

export type MoanaBadge =
  | "Founder"
  | "Penjaga Bhumi Inti"
  | "Penjaga Bhumi Alfa"
  | "Penjaga Bhumi";

export type BillingStatus =
  | "disabled"
  | "ready_for_backend_verification"
  | "pending_backend_verification"
  | "verified_by_backend"
  | "rejected_by_backend"
  | "not_implemented";

export type PurchaseResult = {
  status: BillingStatus;
  provider: "google_play";
  productId?: string;
  purchaseToken?: string;
  orderId?: string;
  message?: string;
};

export type BackendVerificationRequest = {
  uid: string;
  productId: string;
  purchaseToken: string;
  packageName: string;
};

export type BackendVerificationResponse = {
  ok: boolean;
  status: BillingStatus;
  badge?: MoanaBadge;
  accessUntil?: string;
  subscriptionStatus?: string;
  reason?: string;
};

export type RestorePurchaseResult = {
  status: "not_implemented" | "pending_backend_verification" | "restored" | "not_found" | "failed";
  message: string;
};

export type BadgeAccessProfile = {
  badge?: string | null;
  testerBadge?: string | null;
  membership?: string | null;
  membershipType?: string | null;
  plan?: string | null;
  trialStartedAt?: unknown;
  trialEndsAt?: unknown;
  accessUntil?: unknown;
  subscriptionStatus?: string | null;
};

function toDate(value?: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function readBadge(value?: string | null): MoanaBadge | null {
  const normalized = (value || "").trim();
  const badges: MoanaBadge[] = [
    "Founder",
    "Penjaga Bhumi Inti",
    "Penjaga Bhumi Alfa",
    "Penjaga Bhumi",
  ];
  return badges.includes(normalized as MoanaBadge) ? normalized as MoanaBadge : null;
}

export function getCurrentBadge(
  profile?: BadgeAccessProfile | null,
  testerRecord?: { badge?: string | null } | null
): MoanaBadge | null {
  if (!profile && !testerRecord) return null;
  return readBadge(testerRecord?.badge) || readBadge(profile?.badge) || readBadge(profile?.testerBadge);
}

export function isTrialUser(
  profile?: BadgeAccessProfile | null,
  now = new Date(),
  testerRecord?: { badge?: string | null } | null,
): boolean {
  if (!profile) return false;
  const badge = getCurrentBadge(profile, testerRecord);
  const accessUntil = toDate(profile.accessUntil);
  if (badge !== "Penjaga Bhumi") return false;
  const membership = String(profile.membership ?? profile.membershipType ?? profile.plan ?? "").toLowerCase();
  if (!membership.includes("trial") && !membership.includes("free_trial")) return false;
  return Boolean(accessUntil && now.getTime() <= accessUntil.getTime());
}

// Canonical grant windows for tester-backed badges. Kept in sync with
// lib/billing/founderTesterSourceOfTruth.ts. When testerRecord is present
// AND grants a canonical Inti/Alfa window, that window wins over a stale
// profile.accessUntil (e.g. stale Google Play Firestore overwrite).
const TESTER_CANONICAL_WINDOWS: Record<string, { start: string; until: string }> = {
  "Penjaga Bhumi Inti": { start: "2026-06-29T00:00:00+07:00", until: INTI_ACCESS_UNTIL },
  "Penjaga Bhumi Alfa": { start: "2026-06-29T00:00:00+07:00", until: ALFA_ACCESS_UNTIL },
};

export function isExpiredUser(
  profile?: BadgeAccessProfile | null,
  now = new Date(),
  testerRecord?: { badge?: string | null } | null,
): boolean {
  if (!profile && !testerRecord) return true;
  const badge = getCurrentBadge(profile, testerRecord);
  if (badge === "Founder") return false;
  if (badge === "Penjaga Bhumi Inti" || badge === "Penjaga Bhumi Alfa") {
    const canonical = TESTER_CANONICAL_WINDOWS[badge];
    const profileUntil = toDate(profile?.accessUntil);
    // Prefer the LATER of (canonical, profile.accessUntil) so an explicit
    // grant extension wins, but never let a STALE earlier Firestore value
    // shorten the canonical grant.
    const canonicalUntil = new Date(canonical.until);
    const effectiveUntil = profileUntil && profileUntil.getTime() > canonicalUntil.getTime()
      ? profileUntil
      : canonicalUntil;
    const start = new Date(canonical.start);
    return now.getTime() < start.getTime() || now.getTime() >= effectiveUntil.getTime();
  }
  const accessUntil = toDate(profile?.accessUntil);
  if (!accessUntil) return true;
  if (now.getTime() >= accessUntil.getTime()) return true;
  const membership = String(profile?.membership ?? profile?.membershipType ?? profile?.plan ?? "").toLowerCase();
  if (membership === "expired") return true;
  return String(profile?.subscriptionStatus ?? "").toLowerCase() === "expired";
}

export function hasActiveBadgeAccess(
  profile?: BadgeAccessProfile | null,
  now = new Date(),
  testerRecord?: { badge?: string | null } | null,
): boolean {
  const badge = getCurrentBadge(profile, testerRecord);
  if (!badge || isExpiredUser(profile, now, testerRecord)) return false;
  if (badge === "Founder") return true;
  if (badge === "Penjaga Bhumi Inti") return true;
  if (badge === "Penjaga Bhumi Alfa") return true;
  if (badge === "Penjaga Bhumi") return isTrialUser(profile, now, testerRecord);
  return false;
}

export function canAccessPremiumFeature(
  profile?: BadgeAccessProfile | null,
  now = new Date(),
  testerRecord?: { badge?: string | null } | null,
): boolean {
  return hasActiveBadgeAccess(profile, now, testerRecord);
}

export async function refreshBadgeFromServer(): Promise<{
  status: "not_implemented";
  endpoint: string;
  message: string;
}> {
  return {
    status: "not_implemented",
    endpoint: MOANA_BILLING_BACKEND_ENDPOINTS.refreshBadge,
    message: "Backend refresh endpoint must read server-owned badge fields; client must not write access fields.",
  };
}

export async function verifyPurchaseWithBackend(
  request: BackendVerificationRequest,
): Promise<BackendVerificationResponse> {
  void request;
  return {
    ok: false,
    status: "not_implemented",
    reason: "Backend verification endpoint is not implemented yet. Do not unlock access from client purchase result.",
  };
}

export async function restorePurchaseSkeleton(): Promise<RestorePurchaseResult> {
  return {
    status: "not_implemented",
    message: "Restore must call Google Play, send purchase token to backend, then refresh server-owned badge.",
  };
}
