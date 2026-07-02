# MOANA V3 - Server Deployment Report

Date: 2026-06-30

## STATUS

FAIL

Final status: NOT READY FOR RELEASE BUILD V64

Deployment was stopped because production endpoint verification failed. Production seed and smoke tests were not run.

No release build was run. No APK or AAB was generated. No Play Console upload was performed. No business rule was changed.

## Time Window Source Desync

PASS

Root cause:

- Dashboard and guidance surfaces could keep using cached time-window text after the app clock moved into night.
- The shared time helper still classified 20:51 WIB as `evening`.

Fix implemented:

- `lib/dailyGuidance/timeOfDayGreeting.ts` now uses one shared app-time refresh interval and classifies night from 18:00 WIB onward.
- `components/dashboard/DashboardHeader.tsx` reads the shared refresh interval.
- `components/dashboard/DashboardClient.tsx` keeps local app time live, refreshes Daily Intelligence when the environment window changes, and rewrites cached greeting prefixes with the current app time.
- `components/dashboard/DailyNoteV2.tsx` applies the current app-time greeting to Catatan Hari Ini sections.
- `components/wellness/WellnessPageClient.tsx` reads the same helper timing source for wellness recommendation.

Verification:

- `20:51 WIB` returns `night`.
- Greeting returns `Selamat malam`.
- Environment key returns `2026-06-30-night`.
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS

## Firestore Rules Deploy

PASS

Command:

- `firebase deploy --only firestore:rules --project bhumiamartya-fe85c`

Result:

- Deploy completed.
- Ruleset released: `projects/bhumiamartya-fe85c/rulesets/b1e7f58c-be5a-4cfe-8d80-c2558fd96f79`
- Release update time: `2026-06-30T10:56:47.279510Z`

Protected fields covered by readiness scope:

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

## Server Endpoint Deploy

FAIL

Deploy command:

- `npx vercel --prod --yes --archive=tgz`

Deploy result:

- Deployment created: `dpl_DA7XBr126W4h7Rz4ERaosWhKGPxq`
- Deployment URL: `https://bhumi-amartya-clean-h0gdcdyzo-wizzares-projects.vercel.app`
- Production alias: `https://bhumi-amartya-clean.vercel.app`
- Vercel status: Ready

Endpoint verification:

- Request: `POST https://bhumi-amartya-clean.vercel.app/api/access/july1-grant`
- Result: `404`
- Content type: `text/html; charset=utf-8`

Root cause:

- `next.config.ts` currently sets `output: 'export'`.
- Static export does not serve Next.js API route handlers as production server functions.
- Because `/api/access/july1-grant` is an App Router API route, the production endpoint cannot be verified while the app is deployed as static export.

Affected file:

- `next.config.ts`

Affected function/route:

- `POST /api/access/july1-grant`

Evidence:

- `app/api/access/july1-grant/route.ts` exists locally.
- Vercel production alias points to deployment `dpl_DA7XBr126W4h7Rz4ERaosWhKGPxq`.
- Production request still returns `404`.
- `next.config.ts` contains `output: 'export'`.

## Environment Verification

FAIL

Expected route env:

- `FIREBASE_SERVICE_ACCOUNT`
- or `FIREBASE_SERVICE_ACCOUNT_KEY`

Production env audit:

- Vercel production env lists `FIREBASE_SERVICE_ACCOUNT_KEY`.
- Pulled production env file contains the key name.
- Pulled local value length is not usable for local seed execution.

Evidence:

- `.env.production.local` check by name only: `FIREBASE_SERVICE_ACCOUNT_KEY: valueLength=2`
- No credential value was printed.
- No credential was committed.

Impact:

- Production seed cannot be safely run from local environment using the pulled env file.
- Endpoint credential behavior also cannot be smoke-tested because the endpoint currently returns `404` before route logic executes.

## Seed Result

FAIL

Seed was not run.

Reason:

- Endpoint deploy verification failed.
- Service account value available to the local seed process was not usable.

No production Firestore user data was mutated.

## Smoke Test

FAIL

Not run because endpoint deployment verification failed.

Required smoke tests remain pending:

- Founder full access
- Penjaga Bhumi Inti full access until 1 September 2026 WIB
- Penjaga Bhumi Alfa full access until 1 August 2026 WIB
- Penjaga Bhumi 3 days full access
- Expired dashboard-only access

## Production Verification

FAIL

Production verification cannot pass until:

- `/api/access/july1-grant` returns app JSON instead of `404`.
- Server credential env is usable by the route.
- Production seed is executed.
- Founder, Inti, Alfa, Penjaga Bhumi, and Expired smoke tests pass.

## Files Changed

- `lib/dailyGuidance/timeOfDayGreeting.ts`
- `components/dashboard/DashboardHeader.tsx`
- `components/dashboard/DashboardClient.tsx`
- `components/dashboard/DailyNoteV2.tsx`
- `components/wellness/WellnessPageClient.tsx`
- `MOANA_V3_SERVER_DEPLOYMENT_REPORT.md`

Vercel link/deploy also updated local Vercel metadata and env artifacts. No credential value was committed.

## Regression Risk

LOW for time-window fix:

- The change centralizes the existing greeting/environment calculation and updates stale cached greeting prefixes.
- Dashboard and wellness continue to use local app time.

HIGH for server deployment:

- July 1 access endpoint is not reachable in production because current Next config is static export.
- Production seed and smoke tests are blocked.

## Outstanding Items

1. Decide the server deployment strategy for `/api/access/july1-grant`:
   - remove static export for the Vercel server deployment, or
   - deploy the grant endpoint as a separate server function/service.
2. Ensure the selected production runtime has a valid server-only Firebase Admin credential.
3. Re-deploy the endpoint.
4. Verify `POST /api/access/july1-grant` returns app JSON:
   - `400 missing_id_token` when no token is sent, or
   - `401 invalid_id_token` for invalid token, or
   - success with a real authenticated Firebase user token.
5. Run production seed.
6. Run Founder, Inti, Alfa, Penjaga Bhumi, and Expired smoke tests.

