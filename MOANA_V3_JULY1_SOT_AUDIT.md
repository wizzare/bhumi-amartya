# MOANA V3 - July 1 Access Rule Source of Truth Audit

Date: 2026-06-30

## STATUS

DRIFT FOUND

This audit did not build release artifacts, deploy Firestore rules, upload to Play Console, or mutate production data.

## Source of Truth Match

PASS - Badge identity is constrained to the approved July 1 identities in `lib/billing/founderTesterSourceOfTruth.ts` and `lib/billing/billingPreparation.ts`:

- Founder
- Penjaga Bhumi Inti
- Penjaga Bhumi Alfa
- Penjaga Bhumi

PASS - Founder lifetime access is modeled server-side by `buildServerOwnedAccessGrant()` in `lib/billing/founderTesterSourceOfTruth.ts:121`.

PASS - Penjaga Bhumi Inti and Penjaga Bhumi Alfa are modeled as fixed-duration full access through `premiumMonths` and `accessUntil` in `lib/billing/founderTesterSourceOfTruth.ts:140`.

PASS - Penjaga Bhumi / new user 3-day access uses the effective-date rule:

- effective date: `2026-07-01T00:00:00+07:00` at `lib/billing/founderTesterSourceOfTruth.ts:26`
- if registration is before July 1, start July 1
- if registration is on or after July 1, start registration date
- implemented by `buildDefaultNewUserAccessGrant()` at `lib/billing/founderTesterSourceOfTruth.ts:160`

PASS - Billing preparation does not unlock access from client purchase. Access is read from badge/access fields, and billing remains payment preparation only.

PASS - Dashboard remains open in access helpers:

- `lib/billing/accessControl.ts:109`
- `lib/access/accessControl.ts:43`

PASS - Firestore/client write protection is present for server-owned access fields:

- Firestore rules protect access fields, including `badge`, `testerBadge`, `plan`, `membership`, `accessUntil`, `trialStartedAt`, `trialEndsAt`, `subscriptionStatus`, `isPremium`, and `entitlements`.
- `lib/repositories/userRepository.ts` strips protected access fields before owner writes.
- `lib/firebase/service.ts` strips protected access fields before owner writes.

## Implementation Drift

### DRIFT 1 - Legacy Inti Membership Grant Does Not Match July 1 SoT

Affected file: `lib/billing/membershipGrant.ts`

Affected function: `getPenjagaBhumiIntiGrant()`

Evidence:

- `lib/billing/membershipGrant.ts:5`
- `lib/billing/membershipGrant.ts:15`
- `lib/billing/membershipGrant.ts:16`
- `lib/billing/membershipGrant.ts:17`

Root cause:

The legacy grant returns `planType: "FREE"` and `planLabel: "Akses Bhumi Inti"` with badge `Penjaga Bhumi Inti`, but does not set `plan`, `accessUntil`, `subscriptionStatus`, or expiry behavior. This conflicts with the July 1 SoT:

- Badge is identity.
- Plan determines access.
- accessUntil determines active period.
- Penjaga Bhumi Inti gets 2 months full access, then expired/dashboard only/subscribe.

Current runtime impact:

`processMembershipGrant()` currently returns the profile unchanged at `lib/billing/membershipLogic.ts:3`, so this legacy helper is not actively applying a grant in the audited login path. It remains drift because the stale helper can reintroduce pre-July behavior if reused.

Fix recommendation:

Deprecate or replace this helper with the server-owned grant generated from `buildServerOwnedAccessGrant()`. Do not allow this helper to write client-side membership/access fields.

### DRIFT 2 - New User July 1 Grant Exists as Contract but Is Not Wired to Onboarding/Profile Creation

Affected files:

- `lib/billing/founderTesterSourceOfTruth.ts`
- `lib/auth/authActions.ts`
- `app/setup/page.tsx`

Evidence:

- Contract exists: `buildDefaultNewUserAccessGrant()` at `lib/billing/founderTesterSourceOfTruth.ts:160`
- Minimal profile creation writes only normal profile fields at `lib/auth/authActions.ts:51`
- Minimal profile write occurs at `lib/auth/authActions.ts:97`
- Setup final profile write does not apply server-owned grant in `app/setup/page.tsx`

Root cause:

The July 1 new-user access rule is represented in a pure helper, but there is no audited backend/admin assignment in the sign-up/onboarding path. Client-side onboarding correctly cannot write server-owned fields, but no server/admin grant path is currently connected in this repo.

Current runtime impact:

New users after July 1 may not receive `badge = Penjaga Bhumi`, `plan = free_trial`, or `accessUntil` unless an external admin/server process assigns them.

Fix recommendation:

Create or wire an admin/server-owned assignment path that applies `buildDefaultNewUserAccessGrant()` for eligible new users. Do not implement it client-side.

### DRIFT 3 - Feature Lock Coverage Is Not Complete Across All Non-Dashboard Pages

Affected files:

- `lib/billing/accessControl.ts`
- `lib/access/accessControl.ts`
- route pages under `app/`

Evidence:

- Access helper supports dashboard-only behavior: `lib/billing/accessControl.ts:108`
- Dashboard explicitly remains open: `lib/billing/accessControl.ts:109`
- Legacy access result only lists `meditation`, `journaling`, and `audio-healing` as locked features when access is missing: `lib/access/accessControl.ts:64` and `lib/access/accessControl.ts:77`
- Guard usage was found in meditation, journaling, audio healing, and weekly report routes.
- Guard usage was not found by audit search in all requested Section 4 wellness routes such as yoga, workout, herbal, manifestasi, healthy food, journey, and dashboard-adjacent daily pages.

Root cause:

Access control helpers now express the correct access rule, but route/page enforcement is incomplete. The SoT says expired users may access Dashboard only; all other pages must lock.

Current runtime impact:

Expired users may still be able to open unguarded feature pages even when `accessUntil` is expired.

Fix recommendation:

Apply the existing access helper consistently to every non-dashboard feature route. Do not create a new access engine or billing flow.

### DRIFT 4 - Seed Script Is Admin-Only but Not Applied Runtime State

Affected file: `scripts/prepare_july1_access_seed.ts`

Evidence:

- Dry-run mode is default at `scripts/prepare_july1_access_seed.ts:39`
- Production mutation requires `--apply` and `FIREBASE_SERVICE_ACCOUNT` at `scripts/prepare_july1_access_seed.ts:52`
- Writes target `users/{uid}` and `userProfiles/{uid}` only when applied at `scripts/prepare_july1_access_seed.ts:67` and `scripts/prepare_july1_access_seed.ts:68`

Root cause:

The script prepares correct server/admin-owned fields, but this audit did not and must not apply production mutations.

Current runtime impact:

Existing tester access state is only correct if the admin seed has been run against the intended Firebase project.

Fix recommendation:

Run the seed only as a separate approved production operation after Founder confirms the final tester list.

## Files Reviewed

- `MOANA_V3_EXECUTION_MODE.md`
- `MOANA_V3_BILLING_SUBS_RATING_PREP_REPORT.md`
- `lib/billing/founderTesterSourceOfTruth.ts`
- `lib/billing/billingPreparation.ts`
- `lib/billing/accessControl.ts`
- `lib/access/accessControl.ts`
- `lib/billing/membershipGrant.ts`
- `lib/billing/membershipLogic.ts`
- `scripts/prepare_july1_access_seed.ts`
- `lib/auth/authActions.ts`
- `context/AuthContext.tsx`
- `app/setup/page.tsx`
- `components/auth/PremiumLock.tsx`
- `firestore.rules`
- `lib/repositories/userRepository.ts`
- `lib/firebase/service.ts`
- route guard usage under `app/`

## Files Changed

- `lib/billing/billingPreparation.ts`
- `MOANA_V3_JULY1_SOT_AUDIT.md`

## Rules Removed

None.

## Rules Added

No business rule was added.

One server-owned field list was aligned with the existing Firestore/repository protection: `trialStartedAt` was added to `SERVER_OWNED_ACCESS_FIELDS` in `lib/billing/billingPreparation.ts`.

## Regression Risk

LOW for the implemented change. The only code change is a metadata/protection list alignment in billing preparation.

MEDIUM for release readiness until Drift 1, Drift 2, and Drift 3 are explicitly resolved and runtime-tested, because expired-access behavior and new-user grants depend on complete route enforcement and server/admin assignment.

## Next Required Task

1. Confirm whether `lib/billing/membershipGrant.ts` should be deleted, deprecated, or rewritten to delegate to `buildServerOwnedAccessGrant()`.
2. Implement server/admin-owned July 1 new-user assignment for `badge`, `plan`, `accessUntil`, `trialStartedAt`, `trialEndsAt`, `subscriptionStatus`, `isPremium`, and `entitlements`.
3. Apply the existing dashboard-only access guard consistently to every non-dashboard feature route.
4. Run runtime verification with real authenticated users:
   - Founder: lifetime access
   - Penjaga Bhumi Inti: 2 months full access, then dashboard only
   - Penjaga Bhumi Alfa: 1 month full access, then dashboard only
   - Penjaga Bhumi: 3 days full access from effective date or registration date, then dashboard only
5. Do not mark PASS until runtime proves expired users can access Dashboard only and all other pages lock.
