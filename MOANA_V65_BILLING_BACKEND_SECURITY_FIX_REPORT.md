# MOANA V65 Billing Backend Security Fix Report

Date: 2026-07-01
Scope: Backend verification security only

## Final Status

PASS

Backend security blockers from `MOANA_V65_FINAL_BILLING_AUDIT.md` have been addressed locally. No Cloud Function deploy was performed. No Play Console upload was performed. No UI, Badge business rule, Access business rule, or Firestore rules change was made as part of this fix.

## Files Changed

- `functions/index.js`
  - Added global purchase token ownership guard.
  - Added replay/idempotency handling.
  - Added subscription state entitlement decision helper.
  - Added voided purchase audit check path.
  - Added safe structured billing logs without raw purchase token.
- `scripts/test_billing_backend_security.js`
  - Added local backend security tests for token ownership and entitlement decisions.

## Fix 1: Global Purchase Token Ownership

Status: PASS

Implemented server-owned collection:

- `billing_purchase_tokens/{purchaseTokenHash}`

Behavior:

- First verified token links to the authenticated UID.
- Same UID and same token is accepted as idempotent.
- Same token with a different UID is rejected with `permission-denied`.
- Raw purchase token is not stored as the document ID; SHA-256 hash is used.

## Fix 2: Replay / Duplicate Protection

Status: PASS

Implemented:

- Token ownership check runs inside Firestore transaction.
- Same UID/token re-verification updates existing records with merge semantics.
- Entitlements are not duplicated because the update is keyed and idempotent.
- Different UID/token replay fails before entitlement grant.

## Fix 3: Subscription State Handling

Status: PASS

Implemented entitlement decisions:

- `SUBSCRIPTION_STATE_ACTIVE`: grants access until verified `expiryTime`.
- `SUBSCRIPTION_STATE_IN_GRACE_PERIOD`: grants access until verified `expiryTime`.
- `SUBSCRIPTION_STATE_CANCELED`: grants access only if `expiryTime` is still in the future.
- `SUBSCRIPTION_STATE_ON_HOLD`: no Premium grant.
- `SUBSCRIPTION_STATE_PAUSED`: no Premium grant.
- `SUBSCRIPTION_STATE_EXPIRED`: no Premium grant.
- Voided/refunded token found by voided purchase audit path: no Premium grant.

Canceled is no longer treated as immediately inactive when the paid-through expiry is still valid.

## Fix 4: Entitlement Update Rules

Status: PASS

Implemented:

- Access is granted only until Google API `lineItems[0].expiryTime`.
- Product ID and base plan are taken from the Google API response, not trusted from client input.
- Server writes `plan`, `membership`, `membershipType`, `membershipExpiryDate`, `accessUntil`, `subscriptionStatus`, `isPremium`, `purchase`, `purchases`, and `entitlements`.
- Non-active decisions downgrade Google Play Premium entitlement fields and prevent stale Premium from remaining active.
- Existing `badge` is preserved unless missing, avoiding Badge business rule changes.

## Fix 5: Refund / Voided Purchase

Status: PASS

Implemented:

- Added `checkVoidedPurchase()` audit path using Google Play Developer API `purchases.voidedpurchases.list`.
- If the purchase token appears in voided purchases, entitlement decision becomes `voided` and Premium is not granted.
- If the voided purchase check is unavailable, the result is recorded in Firestore under `purchase.voidedCheck` and logged for operational follow-up.

Limitation:

- RTDN is still not implemented in this fix. Minimum safe strategy is revalidation through this callable before extending access, plus the voided purchase audit path during verification. A scheduled revalidation job or RTDN should be added before broad rollout.

## Fix 6: Logging

Status: PASS

Implemented logs include:

- `uid`
- `productId`
- `basePlanId`
- `purchaseTokenHash`
- `subscriptionState`
- `accessUntil`
- `entitlementDecision`
- `reason`
- `voidedCheck`

Raw purchase token is not logged.

## Fix 7: Tests

Status: PASS

Added local test script:

- `scripts/test_billing_backend_security.js`

Covered:

- Same token, same UID.
- Same token, different UID.
- Active subscription.
- Grace period subscription.
- Canceled paid-through subscription.
- Expired subscription.
- On-hold subscription.
- Paused subscription.
- Refunded/voided placeholder behavior.
- Missing/empty token normalization.
- Token hashing format.

## Verification

Commands run:

- `node -c functions/index.js`: PASS
- `npx tsc --noEmit`: PASS
- `node scripts/test_billing_backend_security.js`: PASS

## Deployment Status

Not deployed.

Founder approval is still required before deploying `verifyGooglePlayPurchase` or uploading Build 65 to Closed Testing.

