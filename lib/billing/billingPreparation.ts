export const MOANA_BILLING_RUNTIME_ENABLED = false;

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

export const SERVER_OWNED_ACCESS_FIELDS = [
  "badge",
  "plan",
  "membership",
  "trial",
  "trialStartedAt",
  "trialEndsAt",
  "accessStart",
  "accessUntil",
  "subscriptionStatus",
  "isPremium",
  "entitlements",
] as const;

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

export function getCurrentBadge(profile?: BadgeAccessProfile | null): MoanaBadge | null {
  if (!profile) return null;
  return readBadge(profile.badge) || readBadge(profile.testerBadge);
}

export function isTrialUser(profile?: BadgeAccessProfile | null, now = new Date()): boolean {
  if (!profile) return false;
  const badge = getCurrentBadge(profile);
  const accessUntil = toDate(profile.accessUntil);
  if (badge !== "Penjaga Bhumi") return false;
  const membership = String(profile.membership ?? profile.membershipType ?? profile.plan ?? "").toLowerCase();
  if (!membership.includes("trial") && !membership.includes("free_trial")) return false;
  return Boolean(accessUntil && now.getTime() <= accessUntil.getTime());
}

export function isExpiredUser(profile?: BadgeAccessProfile | null, now = new Date()): boolean {
  if (!profile) return true;
  const badge = getCurrentBadge(profile);
  if (badge === "Founder") return false;
  const accessUntil = toDate(profile.accessUntil);
  if (!accessUntil) return true;
  if (now.getTime() > accessUntil.getTime()) return true;
  const membership = String(profile.membership ?? profile.membershipType ?? profile.plan ?? "").toLowerCase();
  if (membership === "expired") return true;
  return String(profile.subscriptionStatus ?? "").toLowerCase() === "expired";
}

export function hasActiveBadgeAccess(profile?: BadgeAccessProfile | null, now = new Date()): boolean {
  const badge = getCurrentBadge(profile);
  if (!badge || isExpiredUser(profile, now)) return false;
  if (badge === "Founder") return true;
  if (badge === "Penjaga Bhumi Inti") return true;
  if (badge === "Penjaga Bhumi Alfa") return true;
  if (badge === "Penjaga Bhumi") return isTrialUser(profile, now);
  return false;
}

export function canAccessPremiumFeature(profile?: BadgeAccessProfile | null, now = new Date()): boolean {
  return hasActiveBadgeAccess(profile, now);
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
