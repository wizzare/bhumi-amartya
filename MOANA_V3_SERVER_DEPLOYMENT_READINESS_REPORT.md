# MOANA V3 - July 1 Server Deployment Readiness Report

Date: 2026-06-30

## STATUS

PASS

Final readiness status: READY FOR SERVER DEPLOYMENT

This is not READY FOR RELEASE.

No release build was run. No APK or AAB was generated. No Play Console upload was performed. No Firestore rules were deployed. No production Firestore write was performed.

## Endpoint Readiness

PASS

Endpoint reviewed:

- `POST /api/access/july1-grant`

Readiness result:

- Auth is required through Firebase ID token.
- ID token is verified server-side with Firebase Admin Auth.
- Missing token returns `400 missing_id_token`.
- Invalid token returns `401 invalid_id_token`.
- Missing service account returns `503 server_not_configured`.
- Invalid service account JSON returns `503 invalid_service_account`.
- Service account private key escaped newlines are normalized server-side.
- No credential is hardcoded.
- The client sends only `idToken`; it does not send or write access fields.

Server-owned fields written by endpoint:

- `badge`
- `testerBadge`
- `plan`
- `membership`
- `membershipType`
- `accessStart`
- `accessUntil`
- `trialStartedAt`
- `trialEndsAt`
- `subscriptionStatus`
- `isPremium`
- `entitlements`

## Firestore Rules Readiness

PASS

Reviewed file:

- `firestore.rules`

Protected fields confirmed:

- `badge`
- `plan`
- `accessStart`
- `accessUntil`
- `trialStartedAt`
- `trialEndsAt`
- `membership`
- `subscriptionStatus`
- `entitlements`
- `isPremium`

Owner create/update on `users/{uid}`, `profiles/{uid}`, and `userProfiles/{uid}` is blocked from creating or changing protected access fields. Founder/admin can write them.

Rules were not deployed.

## Environment Readiness

PASS

Required server env:

- `FIREBASE_SERVICE_ACCOUNT`

Requirements:

- Must be server-only.
- Must not be named `NEXT_PUBLIC_*`.
- Must contain the Firebase Admin service account JSON for project `bhumiamartya-fe85c`.
- Must be configured in the deployment provider before enabling `/api/access/july1-grant`.
- Must never be committed as a real credential.

Documentation update:

- `.env.local.example` now documents `FIREBASE_SERVICE_ACCOUNT` as a placeholder only.

Credential audit:

- No real service account credential was read.
- No real service account credential was committed.
- Local `.env` / `.env.local` content was not opened.

## July 1 Grant Verification

PASS

Verified with local helper execution:

Founder:

- `badge = Founder`
- `plan = lifetime_free`
- `accessUntil = null`
- Lifetime full access.

Penjaga Bhumi Inti:

- `accessStart = 2026-06-30T17:00:00.000Z`
- Indonesia local equivalent: 1 July 2026 00:00 WIB
- `accessUntil = 2026-08-31T17:00:00.000Z`
- Indonesia local equivalent: 1 September 2026 00:00 WIB

Penjaga Bhumi Alfa:

- `accessStart = 2026-06-30T17:00:00.000Z`
- Indonesia local equivalent: 1 July 2026 00:00 WIB
- `accessUntil = 2026-07-31T17:00:00.000Z`
- Indonesia local equivalent: 1 August 2026 00:00 WIB

Penjaga Bhumi old user:

- Starts from 1 July 2026 00:00 WIB
- Ends after 3 days at 4 July 2026 00:00 WIB

New user:

- Starts from registration date.
- Ends registration date + 3 days.

Implementation note:

- Calendar month/day arithmetic is adjusted to preserve the July 1 Indonesia effective date instead of shifting one day early in UTC math.

## Feature Access Matrix

PASS

Verified with local helper execution using date `2026-07-10T00:00:00.000Z`:

Full access:

- Journey: PASS
- Meditation: PASS

Expired access:

- Dashboard: PASS
- Journey locked: PASS
- Meditation locked: PASS
- Healing Memory / AI Memory locked: PASS

Route guard readiness:

- `AccessGuard` is wired to non-dashboard routes added in the July 1 drift implementation.
- Dashboard remains the allowed destination for expired users.
- The billing access helper now checks `isExpiredUser()` before granting active badge access to non-dashboard features.

## Deployment Checklist

PASS - Firestore Rules Ready

PASS - Admin Endpoint Ready

PASS - Service Account Ready

PASS - Seed Script Ready

PASS - Badge Mapping Ready

PASS - Route Guard Ready

PASS - Access Matrix Ready

PASS - Billing Preparation Ready

PASS - Subscription Preparation Ready

PASS - Rating Preparation Ready

## Files Changed

- `.env.local.example`
- `app/api/access/july1-grant/route.ts`
- `lib/billing/founderTesterSourceOfTruth.ts`
- `lib/billing/accessControl.ts`
- `MOANA_V3_SERVER_DEPLOYMENT_READINESS_REPORT.md`

## Files Reviewed

- `MOANA_V3_JULY1_DRIFT_IMPLEMENTATION_REPORT.md`
- `app/api/access/july1-grant/route.ts`
- `lib/billing/founderTesterSourceOfTruth.ts`
- `lib/billing/membershipGrant.ts`
- `lib/billing/accessControl.ts`
- `lib/billing/billingPreparation.ts`
- `lib/access/accessControl.ts`
- `lib/auth/authActions.ts`
- `lib/repositories/userRepository.ts`
- `lib/firebase/service.ts`
- `scripts/prepare_july1_access_seed.ts`
- `firestore.rules`
- `.env.local.example`
- `MOANA_V3_BILLING_SUBS_RATING_PREP_REPORT.md`

## Verification

PASS - `npx tsc --noEmit`

PASS - Grant helper local execution

PASS - Feature access matrix local execution

No build command was run.

## Regression Risk

LOW to MEDIUM

Low risk:

- Endpoint readiness changes only improve credential/token error handling.
- Grant arithmetic now matches the explicit July 1 local calendar requirement.
- Expired access check now blocks stale badge access before feature access is granted.

Medium remaining risk:

- Production readiness still depends on configuring `FIREBASE_SERVICE_ACCOUNT` in the deployment environment.
- Local Firestore rules are ready but not deployed.
- Production seed/application of existing tester access was not run.
- Runtime Android and real Firebase authenticated-user verification remain separate.

## Outstanding Items

1. Configure server-only `FIREBASE_SERVICE_ACCOUNT` in production deployment provider.
2. Deploy Firestore rules in a separate approved deployment task.
3. Run the admin seed in a separate approved production data task.
4. Verify real authenticated user runtime:
   - Founder
   - Penjaga Bhumi Inti
   - Penjaga Bhumi Alfa
   - Penjaga Bhumi old user
   - New user after July 1
   - Expired user dashboard-only lock
5. Do not mark READY FOR RELEASE until runtime Android/Firebase verification is complete.
