# MOANA V3 - App-Only Access Completion Report

Date: 2026-06-30

## STATUS

BLOCKED

Production seed for the 53 existing Founder/Inti/Alfa users is complete and verified. Minimum app version enforcement for v64 is implemented and production config is seeded. The remaining blocker is automatic Firebase Auth `onCreate` deployment, because Firebase Functions deployment requires the project to be upgraded to Blaze/pay-as-you-go before Cloud Build and Artifact Registry can be enabled.

No release build was run. No APK or AAB was generated. No Play Console upload was performed. No Vercel or Next API route was used.

## Production Seed

PASS

Seed script:

- `scripts/prepare_july1_access_seed.ts`

Source of Truth:

- `lib/billing/founderTesterSourceOfTruth.ts`

Credential:

- Used `GOOGLE_APPLICATION_CREDENTIALS`.
- The path originally requested, `C:\Users\shein\Downloads\bhumiamartya-adminsdk.json`, returned `False` on `Test-Path`.
- The available matching credential file was `C:\Users\shein\Downloads\bhumiamartya-adminsdk.json.json`.
- Credential contents were not printed, copied, or committed.

Seed command result:

```json
{
  "mode": "apply",
  "updatedRows": 53
}
```

## Rows Updated

53

Readback verification script:

- `scripts/verify_july1_access_seed.ts`

Firestore production readback result:

```json
{
  "ok": true,
  "counts": {
    "total": 53,
    "founder": 1,
    "inti": 25,
    "alfa": 27,
    "mismatches": 0,
    "missingUsers": 0,
    "missingProfiles": 0
  },
  "mismatches": []
}
```

## Founder

PASS

Production readback matched SoT:

- `badge = Founder`
- `plan = lifetime_free`
- `membership = LIFETIME_PREMIUM`
- `accessUntil = null`
- Lifetime full access.

## Inti

PASS

Production readback matched SoT:

- `badge = Penjaga Bhumi Inti`
- `plan = free_access`
- `membership = PREMIUM_2_MONTHS`
- `accessStart = 2026-06-30T17:00:00.000Z`
- WIB equivalent: 2026-07-01 00:00
- `accessUntil = 2026-08-31T17:00:00.000Z`
- WIB equivalent: 2026-09-01 00:00

## Alfa

PASS

Production readback matched SoT:

- `badge = Penjaga Bhumi Alfa`
- `plan = free_access`
- `membership = PREMIUM_1_MONTH`
- `accessStart = 2026-06-30T17:00:00.000Z`
- WIB equivalent: 2026-07-01 00:00
- `accessUntil = 2026-07-31T17:00:00.000Z`
- WIB equivalent: 2026-08-01 00:00

## Penjaga Bhumi

PASS WITH MANUAL FALLBACK

Final rule:

- `badge = Penjaga Bhumi`
- `plan = free_trial`
- `accessStart = registrationDate`
- `accessUntil = accessStart + 3 days`
- After `accessUntil`, badge remains `Penjaga Bhumi`, access becomes expired by policy, and only Dashboard is open.

Manual admin fallback implemented because automatic Firebase Functions deployment is blocked by Firebase plan:

- `scripts/grant_new_user_penjaga_bhumi.ts`

Usage:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS='C:\Users\shein\Downloads\bhumiamartya-adminsdk.json.json'
npx ts-node -r tsconfig-paths/register --compiler-options '{"module":"commonjs"}' scripts/grant_new_user_penjaga_bhumi.ts --uid=<firebaseAuthUid>
```

or:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS='C:\Users\shein\Downloads\bhumiamartya-adminsdk.json.json'
npx ts-node -r tsconfig-paths/register --compiler-options '{"module":"commonjs"}' scripts/grant_new_user_penjaga_bhumi.ts --email=<email>
```

Dry-run:

```powershell
npx ts-node -r tsconfig-paths/register --compiler-options '{"module":"commonjs"}' scripts/grant_new_user_penjaga_bhumi.ts --email=<email> --dry-run
```

## New User Assignment

BLOCKED

Implemented source:

- `functions/index.js`
- `functions/package.json`
- `firebase.json`

Trigger:

- `assignJuly1AccessOnCreate`
- Firebase Auth `onCreate`
- Region: `asia-southeast2`

Local function logic verification:

```json
{
  "badge": "Penjaga Bhumi",
  "plan": "free_trial",
  "accessStart": "2026-07-15T10:00:00.000Z",
  "accessUntil": "2026-07-18T10:00:00.000Z",
  "premium": true
}
```

Deploy command:

```powershell
firebase deploy --only functions:assignJuly1AccessOnCreate --project bhumiamartya-fe85c
```

Deploy result:

- FAIL

Root cause:

- Firebase project `bhumiamartya-fe85c` must be on the Blaze/pay-as-you-go plan before required APIs can be enabled for Functions deployment.
- Required API `cloudbuild.googleapis.com` could not be enabled.
- `artifactregistry.googleapis.com` could not be enabled.

Command output evidence:

```text
Error: Your project bhumiamartya-fe85c must be on the Blaze (pay-as-you-go) plan to complete this command. Required API cloudbuild.googleapis.com can't be enabled until the upgrade is complete.
```

Post-failure verification:

```text
No functions found in project bhumiamartya-fe85c.
```

No partial function deployment exists.

## Expired Dashboard Only

PASS

Local access verification:

ALLOW:

- Dashboard

LOCK:

- Journey
- Wellness
- Meditation
- Journaling
- Workout
- Yoga
- Healthy Food
- Herbal
- Audio Healing
- Manifestasi
- Refleksi Jiwa
- Catatan Hari Ini
- AI Memory premium
- Premium content

Verification result:

- Dashboard: `true`
- All listed non-dashboard features: `false`

## Minimum Supported Version

PASS

Production config path:

- `app_config/version`

Production config readback:

```json
{
  "exists": true,
  "minimumSupportedVersionCode": 64,
  "minimumBuild": 64,
  "latestVersion": "3.2",
  "updateUrl": "market://details?id=com.bhumiamartya.app"
}
```

Firestore rules:

- `app_config/version` is readable before login so old builds can be blocked before Dashboard/Auth flows.
- Firestore rules deployed successfully.
- Ruleset: `projects/bhumiamartya-fe85c/rulesets/870a4558-9db7-442c-bac5-059f78ece644`

Implementation:

- `VersionChecker` now wraps the app before `AuthProvider`.
- Outdated builds do not mount login, Dashboard, Journey, or feature routes.
- Privileged-user bypass was removed for force update.
- Android local failsafe also blocks builds below `64` if remote config read fails.

## Current Build Version

PASS

Current source constants:

- `CURRENT_VERSION_NAME = 3.2`
- `CURRENT_VERSION_CODE = 64`
- `CURRENT_BUILD_NUMBER = 64`

Android Gradle:

- `versionCode 64`
- `versionName "3.2"`

## Force Update Status

PASS

Policy verification:

```json
{
  "v64": {
    "currentBuild": 64,
    "minimumBuild": 64,
    "isOutdated": false,
    "updateUrl": "market://details?id=com.bhumiamartya.app",
    "configSource": "firestore"
  },
  "v63": {
    "currentBuild": 63,
    "minimumBuild": 64,
    "isOutdated": true,
    "updateUrl": "market://details?id=com.bhumiamartya.app",
    "configSource": "firestore"
  }
}
```

Force update screen text:

- `Aplikasi Bhumi telah diperbarui.`
- `Versi yang Anda gunakan sudah tidak didukung. Silakan update ke versi terbaru melalui Google Play.`

Button:

- `UPDATE SEKARANG`

## Closed Testing Block Status

PASS

All closed testing builds with `versionCode < 64` evaluate as outdated and are blocked before app content mounts.

Blocked surfaces before update:

- Login
- Dashboard
- Journey
- Wellness
- All protected feature routes

## Client Access Field Safety

PASS

Client no longer calls `/api/access/july1-grant`.

Additional safety fix:

- `lib/repositories/userRepository.ts` now strips `accessUntil` from client profile writes, matching Firestore protected-field rules.

Profile flow compatibility fix:

- `lib/auth/authActions.ts` now fills missing minimal profile fields if a server-side access assignment creates `users/{uid}` first.
- Client still does not write server-owned access fields.

## Files Changed

- `firebase.json`
- `functions/index.js`
- `functions/package.json`
- `functions/package-lock.json`
- `lib/auth/authActions.ts`
- `lib/config/buildInfo.ts`
- `lib/repositories/userRepository.ts`
- `lib/services/appUpdatePolicy.ts`
- `lib/services/appUpdateService.ts`
- `components/global/UpdateRequiredScreen.tsx`
- `components/global/VersionChecker.tsx`
- `app/layout.tsx`
- `firestore.rules`
- `scripts/prepare_july1_access_seed.ts`
- `scripts/grant_new_user_penjaga_bhumi.ts`
- `scripts/seed_minimum_app_version_config.ts`
- `scripts/verify_july1_access_seed.ts`
- `MOANA_V3_APP_ONLY_ACCESS_COMPLETION_REPORT.md`

## Production Evidence

PASS:

- `npx tsc --noEmit`
- Seed production updated 53 rows.
- Firestore production readback verified 53 rows.
- Founder/Inti/Alfa matched expected SoT fields.
- Expired dashboard-only local access matrix passed.
- Firestore production `app_config/version` set to minimum `64`.
- Version policy check passed: v64 allowed, v63 blocked.
- Firestore rules deployed for pre-login config read.
- Final July 1 fallback grant check passed: new user after July 1 becomes `Penjaga Bhumi` for 3 days from registration date.
- Manual Admin SDK grant script exists while Blaze/Functions is unavailable.

BLOCKED:

- Firebase Auth `onCreate` trigger deployment blocked by Firebase project plan.

## Outstanding Blockers

1. Until Blaze is enabled, run `scripts/grant_new_user_penjaga_bhumi.ts` for every new Firebase Auth user after registration.
2. Upgrade Firebase project `bhumiamartya-fe85c` to Blaze/pay-as-you-go.
3. Re-run:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS='C:\Users\shein\Downloads\bhumiamartya-adminsdk.json.json'
firebase deploy --only functions:assignJuly1AccessOnCreate --project bhumiamartya-fe85c
```

4. Verify:

```powershell
firebase functions:list --project bhumiamartya-fe85c
```

5. Create a real new Firebase Auth user and confirm server-created access fields:
   - `badge = Penjaga Bhumi`
   - `plan = free_trial`
   - `accessUntil = registrationDate + 3 days`

## Next Required Task

Use the manual Admin SDK grant script for new users while Firebase Functions is blocked. Upgrade Firebase plan and deploy the prepared Auth trigger when Blaze is available. After deployment, run real new-user Android/Firebase verification. Release build v64 should wait until automatic or operational manual new-user assignment is actively covered.
