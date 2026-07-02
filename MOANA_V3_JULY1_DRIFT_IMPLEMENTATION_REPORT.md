# MOANA V3 - July 1 Drift Implementation Report

Date: 2026-06-30

## STATUS

PASS

Implementation drift from `MOANA_V3_JULY1_SOT_AUDIT.md` has been fixed in source code.

No release build was run. No AAB was generated. No Play Console upload was performed. No Firestore rules were deployed. No production data was mutated.

## Files Changed

- `lib/billing/founderTesterSourceOfTruth.ts`
- `lib/billing/membershipGrant.ts`
- `lib/billing/billingPreparation.ts`
- `lib/access/accessControl.ts`
- `lib/auth/authActions.ts`
- `lib/repositories/userRepository.ts`
- `lib/firebase/service.ts`
- `scripts/prepare_july1_access_seed.ts`
- `app/api/access/july1-grant/route.ts`
- `components/auth/AccessGuard.tsx`
- `app/wellness/page.tsx`
- `app/journey/page.tsx`
- `components/journey/details/JourneyDetailClient.tsx`
- `app/innerwork/meditation/page.tsx`
- `app/innerwork/journaling/page.tsx`
- `app/innerwork/audio-healing/page.tsx`
- `app/innerwork/yoga/page.tsx`
- `app/innerwork/workout/page.tsx`
- `app/innerwork/herbal/page.tsx`
- `app/innerwork/manifestasi/page.tsx`
- `app/meditation/page.tsx`
- `app/journal/page.tsx`
- `app/healing/audio/page.tsx`
- `app/healing/meditation/page.tsx`
- `app/healing/page.tsx`
- `firestore.rules`

## DRIFT Fixed

### DRIFT 1 - `membershipGrant.ts` Legacy Free Grant

PASS

Root cause fixed:

- Removed the old legacy behavior that returned `planType: "FREE"` and `planLabel: "Akses Bhumi Inti"` without expiry.
- `getPenjagaBhumiIntiGrant()` now delegates to the July 1 Source of Truth grant model.
- Added `getJuly1AccessGrant()` as the single contract helper for Founder, Inti, Alfa, and Penjaga Bhumi access grants.

Implemented behavior:

- Founder: lifetime access.
- Penjaga Bhumi Inti: `accessStart = 2026-07-01`, `accessUntil = 2026-09-01`.
- Penjaga Bhumi Alfa: `accessStart = 2026-07-01`, `accessUntil = 2026-08-01`.
- Penjaga Bhumi old user: starts from July 1 effective date.
- Penjaga Bhumi new user: starts from registration date when registration is after July 1.

### DRIFT 2 - Onboarding Server/Admin Grant Contract

PASS

Root cause fixed:

- Added server-owned endpoint contract: `POST /api/access/july1-grant`.
- Client onboarding/profile creation no longer attempts to write access fields.
- Client sends Firebase ID token only.
- Server verifies the ID token, reads existing user profile, computes the grant from Source of Truth, and writes server-owned access fields to:
  - `users/{uid}`
  - `userProfiles/{uid}`

Fields written only by server/admin contract:

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

If `FIREBASE_SERVICE_ACCOUNT` is not configured, the endpoint returns `server_not_configured` and the client logs `[JULY1_ACCESS_GRANT_DEFERRED]`. The client still does not self-assign access.

### DRIFT 3 - Route Guard Dashboard Only

PASS

Root cause fixed:

- Added `components/auth/AccessGuard.tsx`.
- `dashboard` remains allowed.
- Expired/no-access users are blocked from non-dashboard features and sent back to Dashboard.
- `getUserAccess()` now lists all non-dashboard feature keys as locked when access is missing, not only the old three-feature subset.

Guarded routes/features:

- Wellness hub
- Journey
- Journey detail
- Meditation
- Journaling
- Audio Healing
- Yoga
- Workout
- Healthy Food / Herbal
- Manifestasi
- AI Memory / Healing memory route
- Legacy meditation/audio/journal route aliases

## Verification

PASS - `npx tsc --noEmit`

PASS - Static grep confirmed `membershipGrant.ts` no longer contains the legacy `planType` / `planLabel` free grant behavior.

PASS - `accessStart` is included in local server-owned protection lists:

- `lib/billing/billingPreparation.ts`
- `lib/repositories/userRepository.ts`
- `lib/firebase/service.ts`
- `firestore.rules`

PASS - Client onboarding wiring sends only an ID token to the server contract and does not write protected access fields.

## Outstanding Items

- Runtime Android verification was not executed in this task.
- Firestore rules were updated locally to protect `accessStart`, but were not deployed because deployment was explicitly forbidden.
- Production data was not mutated. Existing users require the separate approved admin/server seed operation or runtime server contract execution.
- The server contract requires `FIREBASE_SERVICE_ACCOUNT` in the server environment.

## Regression Risk

LOW to MEDIUM

The implementation is scoped to July 1 access drift:

- Grant logic now follows the Source of Truth helper.
- Client write protection remains intact.
- Route guards are additive and do not alter save pipelines.

Remaining release risk depends on runtime verification with real authenticated users and the production server environment containing the required admin credential.
