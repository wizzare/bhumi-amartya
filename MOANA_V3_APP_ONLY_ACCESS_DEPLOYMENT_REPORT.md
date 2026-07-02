# MOANA V3 - App-Only July 1 Access Deployment Report

Date: 2026-06-30

## STATUS

BLOCKED

Final status: NOT READY FOR RELEASE BUILD V64

This report supersedes the previous web/Vercel endpoint blocker for the July 1 access deployment path. The active deployment path is Android App -> Firebase Production -> Firestore Rules -> Firebase Admin SDK/Admin Seed/Cloud Function -> Android client reads `badge`, `plan`, and `accessUntil`.

No Vercel deployment was used for this report. No Next API route was treated as the primary path. No release build was run. No APK or AAB was generated. No Play Console upload was performed. No business rule was changed. No Journey or Dashboard data was mutated.

## Firestore Rules Production Status

PASS

Production rules were already deployed for Firebase project `bhumiamartya-fe85c`.

Ruleset evidence from prior production deploy:

- Ruleset: `projects/bhumiamartya-fe85c/rulesets/b1e7f58c-be5a-4cfe-8d80-c2558fd96f79`
- Release update time: `2026-06-30T10:56:47.279510Z`

Local rules file reviewed:

- `firestore.rules`

Protected access fields confirmed in local rules:

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

Owner writes to `users/{uid}`, `profiles/{uid}`, and `userProfiles/{uid}` are blocked from creating or changing protected access fields. Founder/admin writes remain allowed.

No Firestore rules redeploy was performed in this task.

## Admin Seed Status

BLOCKED

Seed script reviewed:

- `scripts/prepare_july1_access_seed.ts`

Seed source reviewed:

- `lib/billing/founderTesterSourceOfTruth.ts`

Dry-run status:

- PASS

Dry-run command completed and generated static SoT payloads from `FOUNDER_TESTER_SOURCE_OF_TRUTH`.

Planned rows:

- Total: 53
- Founder: 1
- Penjaga Bhumi Inti: 25
- Penjaga Bhumi Alfa: 27
- Penjaga Bhumi default/non-tester rows in static tester SoT: 0

Apply status:

- NOT RUN

Root cause:

- Firebase Admin SDK credential is not available to the local process.
- `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_SERVICE_ACCOUNT_KEY`, and `GOOGLE_APPLICATION_CREDENTIALS` are not present as usable process env values.
- `.env.production.local` contains `FIREBASE_SERVICE_ACCOUNT_KEY` by name, but the pulled value is not usable for local Admin SDK execution.

Credential evidence:

- Process env check found no usable Admin SDK credential.
- `.env.production.local` name-only check: `FIREBASE_SERVICE_ACCOUNT_KEY valueLength=2`
- No credential value was printed.
- No credential was committed.

Because the Admin SDK credential is missing, production Firestore seed was stopped before any write.

## Rows Updated

0

No production Firestore user document was changed during this task.

## Users Skipped

53 planned static SoT rows were not applied because Admin SDK credential was unavailable.

No users were skipped by business logic. The deployment was blocked before write execution.

## Founder Result

DRY-RUN PASS / PRODUCTION NOT APPLIED

Expected payload:

- `badge = Founder`
- `plan = lifetime_free`
- `membership = LIFETIME_PREMIUM`
- `accessStart = 2026-06-30T17:00:00.000Z`
- `accessUntil = null`
- `subscriptionStatus = active`
- `isPremium = true`

Production verification:

- NOT RUN because seed apply is blocked.

## Inti Result

DRY-RUN PASS / PRODUCTION NOT APPLIED

Expected payload:

- `badge = Penjaga Bhumi Inti`
- `plan = free_access`
- `membership = PREMIUM_2_MONTHS`
- `accessStart = 2026-06-30T17:00:00.000Z`
- Indonesia local equivalent: 1 July 2026 00:00 WIB
- `accessUntil = 2026-08-31T17:00:00.000Z`
- Indonesia local equivalent: 1 September 2026 00:00 WIB
- `subscriptionStatus = active`
- `isPremium = true`

Production verification:

- NOT RUN because seed apply is blocked.

## Alfa Result

DRY-RUN PASS / PRODUCTION NOT APPLIED

Expected payload:

- `badge = Penjaga Bhumi Alfa`
- `plan = free_access`
- `membership = PREMIUM_1_MONTH`
- `accessStart = 2026-06-30T17:00:00.000Z`
- Indonesia local equivalent: 1 July 2026 00:00 WIB
- `accessUntil = 2026-07-31T17:00:00.000Z`
- Indonesia local equivalent: 1 August 2026 00:00 WIB
- `subscriptionStatus = active`
- `isPremium = true`

Production verification:

- NOT RUN because seed apply is blocked.

## Penjaga Bhumi Result

DRY-RUN PASS / PRODUCTION NOT APPLIED

Default new-user grant helper reviewed:

- `buildDefaultNewUserAccessGrant()`

Expected old/non-tester user rule:

- `badge = Penjaga Bhumi`
- `plan = free_trial`
- `accessStart = max(registrationDate, 2026-07-01 00:00 WIB)`
- `accessUntil = accessStart + 3 days`
- `subscriptionStatus = trialing`
- `isPremium = true` during active trial

Static tester seed result:

- No default `Penjaga Bhumi` rows exist in the static tester SoT mapping.

Production verification:

- NOT RUN because seed apply is blocked.

## Expired Access Result

LOCAL LOGIC PASS / PRODUCTION NOT VERIFIED

Expected behavior:

- Dashboard allowed.
- Journey locked.
- Wellness locked.
- Manifestasi locked.
- Refleksi locked.
- Catatan locked.
- AI Memory premium locked.

Implementation source:

- `lib/billing/accessControl.ts`
- `lib/access/accessControl.ts`
- `components/auth/AccessGuard.tsx`

Production Android verification:

- NOT RUN in this task.

## New User Assignment Status

BLOCKED

Current finding:

- No Firebase Cloud Functions directory exists in this repository.
- No Firebase Auth trigger was found.
- Android client still calls `requestJuly1ServerAccessGrant()` through `fetch("/api/access/july1-grant")` in `lib/auth/authActions.ts`.

Why this blocks APP-only readiness:

- The Android app must not depend on Vercel/Next API route for access grants.
- The Android client must not write `badge`, `plan`, `accessStart`, `accessUntil`, `membership`, `subscriptionStatus`, `entitlements`, or `isPremium`.
- New user assignment needs a Firebase-owned server path: Cloud Function Auth trigger, callable Cloud Function, or Admin SDK operational process.

Required APP-only contract:

- On Firebase Auth user creation or first admin-controlled provisioning, server writes:
  - `badge`
  - `plan`
  - `accessStart`
  - `accessUntil`
  - `membership`
  - `trialStartedAt`
  - `trialEndsAt`
  - `subscriptionStatus`
  - `entitlements`
  - `isPremium`
- Android client only reads those fields.

No Cloud Function was implemented in this task because the instruction was deployment/readiness focused and no existing Firebase Functions runtime exists in the repo.

## Files Changed

- `MOANA_V3_APP_ONLY_ACCESS_DEPLOYMENT_REPORT.md`

No app code was changed for this APP-only deployment report.

## Production Evidence

Confirmed:

- Firestore rules production deploy evidence exists from prior deploy.
- Local rules protect server-owned access fields.
- Admin seed dry-run creates correct Founder, Inti, and Alfa payloads from static SoT.

Not confirmed:

- Production Firestore rows updated.
- Android app smoke test after production seed.
- New-user server assignment through Firebase Cloud Function/Auth trigger.

## Outstanding Blockers

1. Provide a usable Firebase Admin SDK credential to the seed execution environment, without committing the credential.
2. Run `scripts/prepare_july1_access_seed.ts --apply` against Firebase project `bhumiamartya-fe85c`.
3. Verify production Firestore documents for all 53 static SoT users.
4. Create or deploy a Firebase-owned new-user assignment path, because no Cloud Function/Auth trigger currently exists in this repo.
5. Remove or replace Android reliance on `fetch("/api/access/july1-grant")` for July 1 grant assignment.
6. Run Android/Firebase smoke tests:
   - Founder full access
   - Inti full access until 1 September 2026 WIB
   - Alfa full access until 1 August 2026 WIB
   - Penjaga Bhumi full access for 3 days
   - Expired dashboard-only access

## Regression Risk

LOW for Firestore rules:

- Rules already protect server-owned access fields.
- No redeploy or rule mutation was performed in this task.

LOW for seed dry-run:

- Dry-run does not mutate production.
- Payload only covers access fields and metadata fields related to access source.

HIGH for release readiness:

- Production access seed has not been applied.
- New user APP-only assignment is not available through Firebase-owned server infrastructure.
- Android smoke verification has not been performed after production seed.

