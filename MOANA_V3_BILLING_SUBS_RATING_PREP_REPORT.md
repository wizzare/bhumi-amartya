# MOANA V3 Billing Subs Rating Prep Report

STATUS: PARTIAL

Reason: preparation contracts and safety helpers are ready, but Billing runtime is not production-ready because Google Play Billing dependency, Play Console product IDs, backend verification, restore purchase, and real Android billing verification are not implemented.

Review fix applied for Release Build V64: trial access preparation now requires a server-owned `trialEndsAt` value that is still active. A `New User (3 Hari)` badge without `trialEndsAt` is treated as expired in the preparation helper.

## Audit Result

| Area | Status | Evidence |
| --- | --- | --- |
| Badge access | PASS | Official badge categories are preserved in `MOANA_V3_EXECUTION_MODE.md`; preparation helper added in `lib/billing/billingPreparation.ts`. |
| Trial | NOT IMPLEMENTED | `founderTesterSourceOfTruth.ts` defines July 1 policy and 3-day rule, but no backend/admin assignment flow is wired. Client assignment remains prohibited. |
| Founder access | PASS | Founder records exist in `lib/billing/founderTesterSourceOfTruth.ts`; protected Firestore fields can only be written by founder/admin/server-owned path. |
| Tester access | NOT IMPLEMENTED | Tester SoT records exist, but automatic server/admin grant is not wired to runtime creation/login flow. |
| Expired access | NOT IMPLEMENTED | Existing runtime access returns open access while `GOOGLE_PLAY_BILLING_ENABLED = false`; expired enforcement is only prepared in helper contract. |
| Google Play Billing | NOT IMPLEMENTED | `lib/billing/googlePlayBilling.ts` is disabled and only alerts that integration is not active. |
| Backend verification | NOT IMPLEMENTED | No active endpoint found; contract added as preparation only. |
| Restore purchase | NOT IMPLEMENTED | No restore purchase implementation found; skeleton added as preparation only. |
| Rating trigger | PASS | No active random rating prompt found; safe eligibility helper added in `lib/rating/ratingPreparation.ts`. |

## Gap List

- Android billing dependency is missing from `android/app/build.gradle` and `android/app/capacitor.build.gradle`.
- No package dependency for a Capacitor/Google Play billing plugin is present in `package.json`.
- Play Console product/subscription IDs are not configured; placeholders are isolated in preparation constants and are not used by runtime.
- Backend purchase verification endpoint is not implemented.
- Restore purchase path is not implemented.
- Server/admin July 1 new-user trial assignment is not implemented.
- Server/admin founder/tester badge grant automation is not implemented.
- Existing `lib/billing/getUserPlanStatus.ts` still contains a local-MVP localStorage plan model for settings display; it must not become the subscription source of truth.
- Trial preparation helper now guards against missing `trialEndsAt`; backend/admin flow still must write this field.

## Files Changed

- `lib/billing/billingPreparation.ts`
- `lib/rating/ratingPreparation.ts`
- `MOANA_V3_BILLING_SUBS_RATING_PREP_REPORT.md`

## Files Audited

- `MOANA_V3_EXECUTION_MODE.md`
- `lib/billing/accessControl.ts`
- `lib/access/accessControl.ts`
- `lib/billing/googlePlayBilling.ts`
- `lib/billing/getUserPlanStatus.ts`
- `lib/billing/membershipGrant.ts`
- `lib/billing/membershipLogic.ts`
- `lib/billing/founderTesterSourceOfTruth.ts`
- `firestore.rules`
- `lib/firebase/service.ts`
- `lib/repositories/userRepository.ts`
- `package.json`
- `android/app/build.gradle`
- `android/app/capacitor.build.gradle`
- `lib/retention/adaptiveRetentionEngine.ts`
- `app/settings/page.tsx`
- Wellness and premium-lock import paths found by `rg`

## Implementation Readiness

Billing readiness: PREPARED

- Product and subscription ID constants exist as placeholders.
- Billing status and purchase result types exist.
- Backend verification request/response contract exists.
- Verification function returns `not_implemented` and does not unlock access.
- Restore skeleton returns `not_implemented` and does not unlock access.

Subscription readiness: PREPARED

- Official badge mapping is represented without adding badge categories.
- Helpers exist: `getCurrentBadge()`, `hasActiveBadgeAccess()`, `isTrialUser()`, `isExpiredUser()`, `canAccessPremiumFeature()`, `refreshBadgeFromServer()`.
- Access remains badge-based in preparation helpers.
- Trial access requires server-owned `trialEndsAt`; client cannot keep trial access active without server data.
- Client still must not write badge/plan/membership/trial/access fields.

Rating readiness: PREPARED

- Eligibility helper requires Journey >= 7 days, login >= 10, dashboard opens >= 5, Refleksi reads >= 3, actionable satisfaction, no recent prompt, and no recent blocking error.
- Positive users route to Google Play Review destination.
- Negative users route to internal feedback destination.
- The helper is not wired to UI and cannot show random prompts.

Security readiness: PASS

- `firestore.rules` protects `badge`, `plan`, `membership`, `trial`, `trialEndsAt`, `accessUntil`, `subscriptionStatus`, `isPremium`, and `entitlements`.
- `users/{uid}`, `profiles/{uid}`, and `userProfiles/{uid}` block owner create/update for protected access fields.
- `lib/firebase/service.ts` strips server-owned access fields before profile writes.
- `lib/repositories/userRepository.ts` strips server-owned access fields before profile writes.

## What Remains Blocked

- Real Google Play Billing runtime.
- Play Console subscription configuration.
- Android billing dependency/plugin selection.
- Backend verification against Google Play Developer API.
- Server/admin access grant job for Founder, Tester, Trial, Expired transition.
- Restore purchase runtime.
- Real Android purchase test.

## Backend Requirements

- Verify Google Play purchase token server-side.
- Validate package name, product ID, subscription state, expiry, order ID, and acknowledgement state.
- Write only server-owned access fields after successful verification.
- Keep writes idempotent by purchase token/order ID.
- Support restore purchase by reading valid purchase tokens and refreshing badge/access fields.
- Handle expiry, cancellation, refund, revoke, grace period, and account hold.
- Add audit logs for every access grant/change.

## Play Console Requirements

- Final subscription/product IDs.
- Base plans and offers.
- License testing/internal testing accounts.
- Google Play Developer API service account.
- Backend access to subscription purchase verification API.
- Real Android test build with billing-capable release signing.

## Runtime Requirements

- Real Android device.
- Real Firebase production project.
- Real authenticated user.
- Sandbox purchase success.
- Purchase failure/cancel.
- Restore purchase.
- Expired subscription readback.
- Logout/login after verified purchase.
- Confirm access follows server badge, not local purchase result.

## Regression Risk

LOW.

No app route, UI, Firestore rule, save pipeline, Journey pipeline, versionCode, AAB, or Play Console state was changed. New code is isolated preparation/contract helper code and is not imported by production screens.

## Next Required Task

Implement backend verification and server/admin badge grant flow first. Only after that, add Android billing dependency and wire Google Play purchase/restore to backend verification. Do not unlock premium from client purchase result.
