/**
 * Google Play review request policy.
 *
 * The Play Store owns whether the native review card is displayed and whether a
 * review is submitted. Never record a request as a completed rating.
 */
export const REVIEW_MIN_ACCOUNT_AGE_MS = 3 * 24 * 60 * 60 * 1000;
export const REVIEW_RETRY_COOLDOWN_MS = 120 * 24 * 60 * 60 * 1000;
export const REVIEW_MAX_REQUESTS_PER_ACCOUNT_DEVICE = 2;

const EXEMPT_ROLES = new Set([
  "founder",
  "admin",
  "dev_admin",
  "developer",
  "qa",
  "tester",
]);

const EXEMPT_BADGES = new Set([
  "founder",
  "admin",
  "developer",
  "qa",
  "tester",
]);

export function isExemptReviewAccount(profile: Record<string, unknown> | null | undefined): boolean {
  if (!profile || typeof profile !== "object") return true;

  const guardianRole = String(profile.guardianRole || "").trim().toLowerCase();
  const role = String(profile.role || "").trim().toLowerCase();
  const recognitionTier = String(profile.recognitionTier || "").trim().toLowerCase();
  const testerBadge = String(profile.testerBadge || "").trim().toLowerCase();

  if (EXEMPT_ROLES.has(guardianRole) || EXEMPT_ROLES.has(role) || EXEMPT_ROLES.has(recognitionTier)) {
    return true;
  }
  if (EXEMPT_BADGES.has(testerBadge)) {
    return true;
  }
  if (
    Boolean(
      profile.isDeveloper ||
      profile.isFounder ||
      profile.isAdmin ||
      profile.isQA ||
      profile.isTester ||
      profile.qaAccount
    )
  ) {
    return true;
  }

  const email = typeof profile.email === "string" ? profile.email.trim().toLowerCase() : "";
  if (email && /(@bhumi\.local$|@example\.com$|^qa[-_.]|^test[-_.])/i.test(email)) {
    return true;
  }

  return false;
}

export function hasActiveModalInDom(
  doc: { querySelector?: (selector: string) => unknown } | undefined = typeof document !== "undefined" ? document : undefined,
): boolean {
  if (!doc || typeof doc.querySelector !== "function") return false;
  return Boolean(
    doc.querySelector(
      '[role="dialog"], [aria-modal="true"], [data-modal-open="true"], [data-billing-active="true"], [data-recovery-active="true"]',
    ),
  );
}

export type ReviewEligibilityInput = {
  accountCreatedAtMs: number | null;
  nowMs: number;
  requestCount: number;
  lastRequestedAtMs: number | null;
  optedOut?: boolean;
  deferredUntilMs?: number | null;
};

export function shouldRequestPlayReview(input: ReviewEligibilityInput): boolean {
  const {
    accountCreatedAtMs,
    nowMs,
    requestCount,
    lastRequestedAtMs,
    optedOut,
    deferredUntilMs,
  } = input;

  if (optedOut) return false;
  if (accountCreatedAtMs === null || !Number.isFinite(accountCreatedAtMs) || accountCreatedAtMs <= 0) return false;
  if (!Number.isFinite(nowMs) || accountCreatedAtMs > nowMs) return false;
  if (nowMs - accountCreatedAtMs < REVIEW_MIN_ACCOUNT_AGE_MS) return false;
  if (
    !Number.isInteger(requestCount) ||
    requestCount < 0 ||
    requestCount >= REVIEW_MAX_REQUESTS_PER_ACCOUNT_DEVICE
  ) {
    return false;
  }
  if (deferredUntilMs !== undefined && deferredUntilMs !== null) {
    if (!Number.isFinite(deferredUntilMs) || nowMs < deferredUntilMs) return false;
  }
  if (lastRequestedAtMs !== null) {
    if (!Number.isFinite(lastRequestedAtMs) || lastRequestedAtMs <= 0 || lastRequestedAtMs > nowMs) return false;
    if (nowMs - lastRequestedAtMs < REVIEW_RETRY_COOLDOWN_MS) return false;
  }
  return true;
}
