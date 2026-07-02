# MOANA V3 - App Flow Final Audit

Date: 2026-06-30

## STATUS

BLOCKED

Android no longer depends on `/api/access/july1-grant` or a web endpoint for July 1 access grant. The remaining blocker is Firebase server-side ownership for new-user assignment and production seed execution.

No release build was run. No APK or AAB was generated. No Play Console upload was performed. No Vercel deployment was performed. No Firestore production user data was mutated.

## Web Dependency

PASS

Audit query:

- `/api/access/july1-grant`
- `july1-grant`
- `requestJuly1ServerAccessGrant`
- `JULY1_ACCESS_GRANT`

Original usage:

- `lib/auth/authActions.ts`
- Called during `ensureMinimalUserProfile()` after a new minimal profile was created.
- Purpose was to ask a web/Next endpoint to apply July 1 access fields.

Action taken:

- Removed `requestJuly1ServerAccessGrant()`.
- Removed the call from `ensureMinimalUserProfile()`.
- Removed the stale web route file `app/api/access/july1-grant/route.ts`.

Verification:

- No matching references remain in `app`, `components`, `lib`, `scripts`, `firestore.rules`, `firebase.json`, or `package.json`.
- `npx next typegen`: PASS
- `npx tsc --noEmit`: PASS

Android result:

- Android no longer calls the web endpoint during sign-in/profile creation.
- Android still creates only the minimal user/profile fields allowed by Firestore rules.
- Android does not write `badge`, `plan`, `accessStart`, `accessUntil`, `membership`, `subscriptionStatus`, `entitlements`, or `isPremium`.

## Firebase Flow

PARTIAL

Confirmed:

- Firestore is the source read by the app for `badge`, `plan`, and `accessUntil`.
- Firestore rules protect server-owned access fields.
- Client create/update on `users/{uid}`, `profiles/{uid}`, and `userProfiles/{uid}` cannot create or modify protected access fields.
- Existing access helpers read access fields; they do not grant premium from client purchase.

Still missing:

- No Firebase Cloud Functions directory exists in this repo.
- No Firebase Auth trigger or Firebase-owned callable/onRequest function was found for new-user access assignment.
- Because no official Firebase server runtime exists in the project, new users require an Admin SDK operational process until a Firebase-owned server path is added as Source of Truth.

BLOCKER:

- New user assignment cannot be fully automatic in the Android/Firebase-only architecture yet.

## Seed Readiness

PARTIAL

Seed script:

- `scripts/prepare_july1_access_seed.ts`

Static SoT:

- `lib/billing/founderTesterSourceOfTruth.ts`

Dry-run:

- PASS

Planned static rows:

- Total: 53
- Founder: 1
- Penjaga Bhumi Inti: 25
- Penjaga Bhumi Alfa: 27

Expected production write scope:

- `users/{uid}`
- `userProfiles/{uid}`

Allowed fields written by Admin SDK seed:

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
- access-source audit metadata

Credential required:

- `FIREBASE_SERVICE_ACCOUNT`
- or `FIREBASE_SERVICE_ACCOUNT_KEY`
- or an equivalent Admin SDK credential execution environment.

How to run when credential is available:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_KEY = '<server-only Firebase Admin service account JSON>'
npx ts-node -r tsconfig-paths/register --compiler-options '{"module":"commonjs"}' scripts/prepare_july1_access_seed.ts --apply
```

Expected result:

```json
{
  "mode": "apply",
  "updatedRows": 53
}
```

Current apply status:

- NOT RUN

Reason:

- No usable Firebase Admin SDK credential is available in the current process.
- `.env.production.local` contains the key name but not a usable local credential value.
- No credential value was printed or committed.

## Outstanding Blockers

1. Provide a Firebase Admin SDK credential to the seed execution environment without committing it.
2. Run the static SoT production seed for the 53 mapped users.
3. Verify seeded production Firestore documents for Founder, Inti, and Alfa.
4. Define the official Firebase-owned new-user assignment path:
   - Firebase Auth trigger, or
   - callable/onRequest Cloud Function, or
   - documented Admin SDK operational process.
5. After the server-side path exists, verify Android first-login behavior for a new user.

## Files Changed

- `lib/auth/authActions.ts`
- `app/api/access/july1-grant/route.ts`
- `MOANA_V3_APP_FLOW_FINAL_AUDIT.md`

## Regression Risk

LOW for removing web dependency:

- Removed a failing/non-SoT web call from Android profile creation.
- Existing minimal profile creation still runs.
- TypeScript passes.

MEDIUM for access onboarding:

- New users will not receive automatic July 1 access fields until a Firebase/Admin server-side assignment process is available and executed.
- Firestore rules correctly prevent the client from filling those fields itself.

## Next Action

Run the Admin SDK seed from a secure environment with a valid Firebase Admin credential, then verify production Firestore and Android access behavior. Separately, decide the official Firebase-owned new-user assignment mechanism before V64 release build.

