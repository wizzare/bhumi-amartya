# MOANA V3 - July 1 Access Minimal Readiness Audit

Audit date: 2026-06-30
Scope: Audit only. No Subscription, Billing, Rating, Referral, Achievement, or Streak implementation.

## Final Status

PARTIAL

Reason: July 1 access is safe without Google Play Billing because billing is disabled and core gates return open access. Firestore rules and client repositories protect access/badge fields from owner self-assignment. However, existing tester 1-month/2-month grants are present as source-of-truth data only; this audit found no active automatic server/admin grant pipeline applying those grants at runtime.

## 1. New User After July 1

Status: PASS

Evidence:
- `lib/billing/googlePlayBilling.ts:1` sets `GOOGLE_PLAY_BILLING_ENABLED = false`.
- `lib/billing/accessControl.ts:89` returns feature access `true` when Google Play Billing is disabled.
- `lib/access/accessControl.ts:28` returns premium feature access `true` when Google Play Billing is disabled.
- `lib/billing/getUserPlanStatus.ts:6` defines `FREE_TRIAL_DAYS = 3`.
- `lib/billing/getUserPlanStatus.ts:125-134` computes a 3-day local trial window for local MVP plan status.
- `lib/billing/founderTesterSourceOfTruth.ts:21` defines the July 1 policy start as `2026-07-01T00:00:00+07:00`.
- `lib/billing/founderTesterSourceOfTruth.ts:118-120` has the date gate for default registration policy.

Conclusion:
- New users are not blocked by Google Play Billing.
- Core public app usage remains open while billing is disabled.
- A 3-day local trial status exists.
- Server-owned Firestore trial grant is not automatically written by client code, which is correct for safety.

## 2. Existing Testers 1 Month / 2 Months

Status: PARTIAL

Evidence:
- `lib/billing/founderTesterSourceOfTruth.ts:23` contains the tester source-of-truth list.
- `lib/billing/founderTesterSourceOfTruth.ts:27-52` contains `Penjaga Bhumi Inti` records with `PREMIUM_2_MONTHS`.
- `lib/billing/founderTesterSourceOfTruth.ts:54-69` contains `Penjaga Bhumi Alfa` records with `PREMIUM_1_MONTH`.
- `rg` found `getFounderTesterRecord` only in its own file; no runtime caller applies the grant.
- `app/settings/page.tsx:36` imports `shouldApplyDefaultRegistrationPolicy`, but the function is not used in the page.
- `lib/repositories/adminRepository.ts:177` has admin validation logic that can write protected recognition/membership fields, but it is an admin action path, not an automatic July 1 tester grant.

Root cause for PARTIAL:
- The grant data exists, but no active runtime server/admin grant job or callable grant path was found applying 1-month/2-month tester access automatically.

Fix recommendation:
- Use an admin/server-owned one-time grant process after release freeze, writing protected fields with admin privileges only. Do not write these fields from client code.

## 3. Badge

Status: PASS

Evidence:
- `firestore.rules:54` defines protected access fields.
- `firestore.rules:64-67` protects `badge`, `badges`, `testerBadge`, and `guardianBadge`.
- `firestore.rules:115-116` blocks owner create/update on `users/{userId}` when protected access fields are created or changed.
- `firestore.rules:131-132` applies the same protection to `profiles/{userId}`.
- `firestore.rules:139-140` applies the same protection to `userProfiles/{userId}`.
- `lib/firebase/service.ts:57` strips server-owned access fields before saving user profiles.
- `lib/firebase/service.ts:369` saves only the stripped profile payload.
- `lib/repositories/userRepository.ts:168` strips server-owned access fields in repository writes.
- `lib/repositories/userRepository.ts:184` writes only the stripped payload.

Conclusion:
- Badge can exist as display/status.
- Owner self-assignment is blocked at both app-write layer and Firestore rules layer for top-level user/profile documents.

## 4. Firestore Protected Fields

Status: PASS

Protected fields requested:
- `badge`
- `membership`
- `plan`
- `trialEndsAt`
- `accessUntil`
- `isPremium`
- `entitlements`
- `subscriptionStatus`

Evidence:
- `firestore.rules:54-95` includes all requested fields in `protectedAccessFields()`.
- `firestore.rules:104-109` rejects owner writes that create or change protected fields.
- `firestore.rules:113-117` applies this to `users/{userId}`.
- `firestore.rules:129-133` applies this to `profiles/{userId}`.
- `firestore.rules:137-141` applies this to `userProfiles/{userId}`.

Note:
- `users/{userId}/{document=**}` allows owner nested-subcollection writes. This does not allow changing top-level protected fields on `users/{userId}`. Keep protected access state on top-level user/profile documents or server-owned collections, not owner-writable nested documents.

## 5. Runtime Access / Billing Text / Premium Lock

Status: PASS

Evidence:
- `lib/billing/googlePlayBilling.ts:1` disables Google Play Billing.
- `lib/billing/accessControl.ts:89` keeps `hasFeatureAccess()` open while billing is disabled.
- `lib/access/accessControl.ts:28` keeps `canAccessPremiumFeature()` open while billing is disabled.
- `components/auth/PremiumLock.tsx:18` depends on `canAccessPremiumFeature`; with billing disabled it renders children.
- Wellness and weekly report pages that call `hasFeatureAccess` will not lock because `hasFeatureAccess` returns true.
- `app/settings/page.tsx:302-309` displays public access and says premium is being prepared.
- `app/upgrade/page.tsx:13-17` says the feature is coming soon and available free during Beta.

Conclusion:
- App remains usable/free.
- No active Google Play subscription requirement was found.
- No active broken premium lock was found while billing remains disabled.

## 6. Admin / Server Ownership

Status: PARTIAL

Evidence:
- Firestore rules allow founder/admin to write protected fields: `firestore.rules:118-120`, `firestore.rules:133`, and `firestore.rules:141`.
- `lib/repositories/adminRepository.ts:177-229` contains an admin validation path that writes recognition and membership fields.
- No automated server/admin process was found that applies the July 1 default trial or tester grants from `FOUNDER_TESTER_SOURCE_OF_TRUTH`.

Conclusion:
- Protected access can be safely assigned by admin/server paths.
- Runtime granting for testers still requires manual/admin setup.

## 7. Fail Criteria Check

User can self-assign access:
- Result: NO for top-level `users`, `profiles`, and `userProfiles`.
- Evidence: `firestore.rules:104-116`, `firestore.rules:129-140`, `lib/firebase/service.ts:57`, `lib/repositories/userRepository.ts:168`.

App blocks public users:
- Result: NO while `GOOGLE_PLAY_BILLING_ENABLED = false`.
- Evidence: `lib/billing/accessControl.ts:89`, `lib/access/accessControl.ts:28`.

Google Play Billing required:
- Result: NO.
- Evidence: `lib/billing/googlePlayBilling.ts:1`.

Tester grants automatic:
- Result: NO active automatic runtime grant found.
- Status impact: PARTIAL.

## Required Follow-Up Before Turning Billing On

Status: REQUIRED LATER, not part of this audit scope.

1. Create a server/admin-owned grant path for July 1 default 3-day access and tester 1-month/2-month access.
2. Keep `badge`, `membership`, `plan`, `trialEndsAt`, `accessUntil`, `isPremium`, `entitlements`, and `subscriptionStatus` server/admin-owned.
3. Do not enable Google Play Billing until the server/admin grant path and readback verification exist.

