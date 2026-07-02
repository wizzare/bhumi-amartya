# MOANA V65 Final Google Play Billing Audit

Date: 2026-07-01
Scope: Audit only. No deploy. No upload. No feature commit.

## Final Status

NOT READY

Build 65 is Billing-capable at Android manifest level and should unlock Play Console monetization/subscription setup after upload, but the server verification lifecycle is not yet safe enough for Closed Testing purchases.

## Checklist Results

| # | Area | Status | Audit Result |
|---|---|---|---|
| 1 | Google Play Billing Library | PASS | `android/app/build.gradle` uses `com.android.billingclient:billing:9.1.0`. Build 65 is `versionCode 65`, `versionName 3.2.1`. Merged and packaged manifests contain `com.android.vending.BILLING`. |
| 2 | Billing Client | PASS | `BhumiBillingPlugin` initializes `BillingClient`, starts connection, uses `enableAutoServiceReconnection()`, handles disconnection event, queries `ProductDetails` with `ProductType.SUBS`, and targets `bhumi_premium` / `monthly`. |
| 3 | Purchase Flow | FAIL | Purchase sheet launch, callback, cancel, and purchased state exist. Pending purchase is not fully handled: pending tokens can reach server, but server only returns inactive/not_active and does not mark a pending entitlement state. |
| 4 | Acknowledgement | PASS | Native client acknowledges only `PURCHASED` and not-yet-acknowledged purchases. Server also attempts subscription acknowledgement when Google reports `ACKNOWLEDGEMENT_STATE_PENDING`. |
| 5 | Restore Purchase | PASS | `restorePurchases()` uses `queryPurchasesAsync` for subscriptions and returns existing purchases for server verification. |
| 6 | Cloud Function | FAIL | Google API auth and token verification exist, but duplicate/replay, cancellation/refund/expired/on-hold lifecycle, and inactive entitlement cleanup are incomplete. |
| 7 | Entitlement | PASS | Firestore rules and client repositories block owner writes to protected access fields: `badge`, `plan`, `membership`, `accessUntil`, `entitlements`, purchase fields, and related billing fields. Server/Admin can update them. |
| 8 | Security | FAIL | Client does not directly unlock Premium, but replay protection is incomplete because a valid purchase token is not checked globally against prior use by another UID. |
| 9 | Play Console Readiness | PASS | Build 65 manifest exposes Billing capability through the merged Billing Library permission. After Closed Testing upload, Play Console should recognize Billing capability and allow Monetize with Play -> Subscriptions setup. |

## Cloud Function Detail

| Check | Status | Notes |
|---|---|---|
| Google Play Developer API authentication | PASS | Uses `google.auth.getClient()` with Android Publisher scope. Requires deployed function service account to have Play Console API access. |
| Purchase token verification | PASS | Calls `purchases.subscriptionsv2.get` and verifies package/product/base plan. |
| Signature verification | PASS | Not applicable for the server-owned token verification path; Play Developer API verification is the authority. |
| Duplicate purchase protection | FAIL | Stores `tokenHash`, but does not query existing purchases by token hash before granting. |
| Replay attack protection | FAIL | A token replayed by another authenticated UID could be verified and granted because token ownership is not bound to a single UID. |
| Idempotency | PASS | Repeating the same verification for the same user is merge/transaction based and should not duplicate benefits. |
| Error handling | PASS | Uses Firebase `HttpsError` for invalid args, auth, permission, and API failure. |
| Expired subscription handling | FAIL | Non-active path writes `subscriptionStatus: not_active`, but does not clear premium plan/membership/isPremium/entitlements from an already-premium user. |
| Refund handling | FAIL | No refund/voided-purchase/RTDN handling and no entitlement revocation path. |
| Cancellation handling | FAIL | `SUBSCRIPTION_STATE_CANCELED` is treated as inactive even though Google defines it as canceled but not expired. |
| Grace period handling | PASS | `SUBSCRIPTION_STATE_IN_GRACE_PERIOD` is treated as active. |
| Account hold handling | FAIL | On-hold is not active, but entitlement cleanup is incomplete. |

## Entitlement Security Verification

PASS:

- Client purchase result is not used to unlock Premium directly.
- `/upgrade` sends purchase token to `verifyGooglePlayPurchase`, then refreshes profile.
- Server writes `plan`, `membershipType`, `membershipExpiryDate`, `accessUntil`, `subscriptionStatus`, and `entitlements`.
- `firestore.rules` blocks normal users from creating/updating protected access fields.
- `userRepository` and `firebase/service` strip server-owned access fields before client writes.

Risk remaining:

- Existing `entitlements` and `isPremium` can remain true after non-active verification because the Cloud Function does not revoke/clear them.
- UI status in `/upgrade` checks `plan`/`membershipType` without expiry validation, so it can display Premium after an expired/refunded/on-hold state if old fields remain.

## Verification Performed

- `npx tsc --noEmit`: PASS
- `node -c functions/index.js`: PASS
- Merged manifest artifact checked:
  - `android/app/build/intermediates/merged_manifests/debug/processDebugManifest/AndroidManifest.xml`
  - Contains `<uses-permission android:name="com.android.vending.BILLING" />`
- Packaged manifest artifact checked:
  - `android/app/build/intermediates/packaged_manifests/debug/processDebugManifestForPackage/AndroidManifest.xml`
  - Contains `<uses-permission android:name="com.android.vending.BILLING" />`

## Official Requirements Checked

- Google Play Billing Library release notes show `9.1.0` is available and Billing Library 8+ is required for new app updates by 2026-08-31.
- Google billing integration guidance says purchases should be sent to a secure backend to verify before granting entitlements, pending purchases should not grant benefits, and initial subscriptions need acknowledgement.
- Google Play Developer API documents subscription states including on-hold, canceled, and expired states.

## Remaining Blockers Only

1. Add global tokenHash lookup/ownership binding before granting entitlement to prevent duplicate purchase and replay across UIDs.
2. Handle `SUBSCRIPTION_STATE_CANCELED` as paid-through-until-expiry rather than immediate inactive, or explicitly document a different server policy.
3. Add revocation/cleanup for expired, refunded, account-hold, and invalid subscription states: clear or downgrade `plan`, `membershipType`, `isPremium`, and Premium `entitlements` as appropriate.
4. Add refund/voided-purchase or RTDN handling before real Closed Testing payment QA.
5. Do not upload Build 65 or deploy `verifyGooglePlayPurchase` until Founder approval and blockers are addressed.

