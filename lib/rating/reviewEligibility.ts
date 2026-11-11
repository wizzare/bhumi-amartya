/**
 * Google Play review request policy.
 *
 * The Play Store owns whether the native review card is displayed and whether a
 * review is submitted. Never record a request as a completed rating.
 */
export const REVIEW_MIN_ACCOUNT_AGE_MS = 3 * 24 * 60 * 60 * 1000;
export const REVIEW_RETRY_COOLDOWN_MS = 120 * 24 * 60 * 60 * 1000;
export const REVIEW_MAX_REQUESTS_PER_ACCOUNT_DEVICE = 2;

export type ReviewEligibilityInput = {
  accountCreatedAtMs: number | null;
  nowMs: number;
  requestCount: number;
  lastRequestedAtMs: number | null;
  optedOut?: boolean;
};

export function shouldRequestPlayReview(input: ReviewEligibilityInput): boolean {
  const { accountCreatedAtMs, nowMs, requestCount, lastRequestedAtMs, optedOut } = input;
  if (optedOut) return false;
  if (accountCreatedAtMs === null || !Number.isFinite(accountCreatedAtMs)) return false;
  if (!Number.isFinite(nowMs) || accountCreatedAtMs > nowMs) return false;
  if (nowMs - accountCreatedAtMs < REVIEW_MIN_ACCOUNT_AGE_MS) return false;
  if (!Number.isInteger(requestCount) || requestCount < 0 || requestCount >= REVIEW_MAX_REQUESTS_PER_ACCOUNT_DEVICE) return false;
  if (lastRequestedAtMs !== null) {
    if (!Number.isFinite(lastRequestedAtMs) || lastRequestedAtMs > nowMs) return false;
    if (nowMs - lastRequestedAtMs < REVIEW_RETRY_COOLDOWN_MS) return false;
  }
  return true;
}
