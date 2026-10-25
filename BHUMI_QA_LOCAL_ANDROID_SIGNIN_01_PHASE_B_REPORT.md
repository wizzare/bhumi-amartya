# BHUMI QA LOCAL ANDROID SIGN-IN 01 — PHASE B REPORT

Date: 2026-10-24  
Task: `QA-LOCAL-ANDROID-SIGNIN-01` Phase B Remediation  
Worktree: `C:\tmp\bhumi-build106-recovery`  
Authorized branch / initial HEAD: `hotfix/build110-indonesian-only` / `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
Verdict: **PHASE B PASS — ISOLATION ACCEPTANCE RESOLVED, SIGNED QA APK BUILT**  
Release: **BLOCKED**

## Phase B remediation completion

Both Phase B blockers are proven resolved:

1. **Compiled isolation and fallback elimination:** Verified by actual execution of compiled webpack factories loaded via Node VM from `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792803200489\out` with zero network and zero native Capacitor calls. The compiled `qaRuntime` inlined configuration was verified with `assertQaRuntimeAllowed`, rejecting undefined, invalid, and production values across nine sensitive properties; safe HTTPS loopback endpoints were validated; compiled bootstrap executed against synthetic local `https://localhost:8443/api/access/bootstrap-trial`; and all eight billing methods rejected execution with `QA_BILLING_DISABLED` without invoking native plugins. Test harness preserved at `C:\Users\shein\AppData\Local\Temp\opencode\phaseb-compiled-proof.mjs` (36 checks, exit 0).
2. **Signed QA APK in clean root:** Built via `cap sync android` and `gradlew assembleQa` inside `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792803200489`. Output: `app-qa.apk`, SHA-256 `99F08D79F3DD023875D243F9190FD5DE1394A8D6943A03F068665D1C08E1D448`, size `7,769,171` bytes. Identity verified via `aapt2`: `com.bhumiamartya.app.qa` / `115` / `5.0.15-qa`. Signing verified via `apksigner`: v2 single signer, SHA-256 `e24c6fdcb380f6be70276f51472664995a716df7ef9b4dc770a628c86f0cd4bf`, SHA-1 `06cf57e5b3d0fc6744a8b1d71816e64667ae63b0`. Complete asset parity: 808/808 output files match staged assets and APK zip entries with zero mismatches (`phaseb-parity.mjs`). Previous APK at `mobile-staging-1792797759370` preserved as historical evidence.

## Verification results

| Gate / Command | Result |
|---|---|
| Compiled webpack module proof (`phaseb-compiled-proof.mjs`) | PASS, 36 checks, exit 0 (0 native calls, 0 network) |
| Asset parity (`phaseb-parity.mjs`) | PASS, 808/808 output->staged and output->APK matches |
| `node tests/unit/qa-backend-auth-db-config.test.mjs` | PASS, 538 assertions, exit 0 |
| `node tests/unit/qa-google-web-client-id.test.mjs` | PASS, 21 assertions, exit 0 |
| Backend bootstrap (`npm run test:qa:backend-bootstrap`) | PASS, 53/53 assertions, exit 0 (JDK 21) |
| Synthetic TLS harness (`phaseb-tls.mjs`) | PASS, 8 assertions, exit 0 |
| Auth telemetry (`auth-new-02-bootstrap-telemetry.test.ts`) | PASS, 14 assertions, exit 0 (loaded `.env.local` safely) |
| TypeScript (`npx tsc --noEmit`) | PASS, exit 0 |
| ESLint (`npm run lint`) | PASS, exit 0 (421 warnings, 0 errors) |
| Quality Gate (`npm run quality:gate`) | PASS, exit 0 (DEVELOPMENT PASS / RELEASE BLOCKED) |

## Current artifact summary

- APK path: `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792803200489\android\app\build\outputs\apk\qa\app-qa.apk`
- SHA-256: `99F08D79F3DD023875D243F9190FD5DE1394A8D6943A03F068665D1C08E1D448`
- Size: `7,769,171` bytes
- Signer SHA-256: `e24c6fdcb380f6be70276f51472664995a716df7ef9b4dc770a628c86f0cd4bf`
- Signer SHA-1: `06cf57e5b3d0fc6744a8b1d71816e64667ae63b0`
- Package / code / name: `com.bhumiamartya.app.qa` / `115` / `5.0.15-qa`
- Historical APK preserved: `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792797759370\android\app\build\outputs\apk\qa\app-qa.apk` (SHA-256 `03F9DBC5...`)

## Remediation details and endpoint mapping

1. **Mapping of the five old bundle occurrences:**
   - `bhumi-amartya-clean.vercel.app` (2 hits in old `out/`): previously bundled via `lib/config/astrologyApiUrl.ts` (`CANONICAL_WEB_APP_URL`) and `lib/config/dailyGuidanceApiUrl.ts` (`CANONICAL_WEB_APP_URL`). In the new export, these use explicit `process.env.NEXT_PUBLIC_QA_MODE === 'realQA'` compile-time branching to `https://localhost:8443` and `assertQaEndpoint()` validation. Hits in new `out/`: **0**.
   - `bhumi-human-design-api.vercel.app` (3 hits in old `out/`): previously bundled via `lib/config/hdApiUrl.ts` (`CANONICAL_VERCEL_API_URL` and `webAppUrl` fallback). In the new export, these use explicit `process.env.NEXT_PUBLIC_QA_MODE === 'realQA'` compile-time branching to `https://localhost:8443/api/humandesign/calculate` and `assertQaEndpoint()` validation. Hits in new `out/`: **0**.
   - Production Firebase project (`bhumiamartya-fe85c`): **0 hits** across all files in new `out/`.
   - Production Billing Verifier (`bhumi-billing-verifier.vercel.app`): **0 hits** across all files in new `out/`.
   - Production FCM service worker (`public/firebase-messaging-sw.js`): replaced in the disposable staging root with an unregister-only worker (`scripts/run-mobile-staging-build.mjs:266-268`) without modifying the source worktree.

2. **Compiled WebView runtime resolution:**
   - `lib/config/qaRuntime.ts` provides explicit static property accessors on `compileTimeEnv` for all `NEXT_PUBLIC_*` and `BHUMI_*` keys, ensuring Next.js inlines them into the client bundle at build time.
   - Verified via Node VM execution of compiled module factories from `out/` (`phaseb-compiled-proof.mjs`): `compileTimeEnv` values are properly inlined, `assertQaRuntimeAllowed` runs and enforces realQA constraints, and invalid/production values are rejected.
   - All 8 Billing API entry points throw `QA_BILLING_DISABLED` in realQA mode without invoking native plugins.
   - Local bootstrap executes only against loopback `https://localhost:8443/api/access/bootstrap-trial`.

## Mandatory final Android release evidence — NOT VERIFIED

- Google Play Console read-only for the correct production Bhumi app: **NOT VERIFIED**. No authenticated Play Console/browser tool is available. App/package identity, highest-ever uploaded versionCode across internal/closed/open/production, associated versionName/track/status/upload date, and separate latest uploaded/active/published fields are all **UNKNOWN**. No new authentication, secrets, service account, upload, publish, track change, or subscription action was attempted.
- Local `android/app/build.gradle` and the QA APK are not Play evidence or evidence of the latest production release candidate.
- Any new release versionCode must exceed **all** versionCodes ever used in Play before the next upload; production package and signing continuity must be preserved. No arbitrary version change is authorized.
- Device phase is separately gated and **NOT RUN**: `adb devices`, installed package/version/signer, install, launch, Logcat, and ADB reverse. No device evidence exists.
- Release remains **BLOCKED**; Phase B is **PASS** for isolated QA APK build and endpoint remediation.

## Founder baseline correction and Git closeout preparation (2026-10-24)

Explicit Founder confirmation establishes the current **Founder-provided Play baseline: versionCode 115, versionName 5.0.15**. Local `android/app/build.gradle:10-11` defaults **115 / "5.0.15" EXACTLY MATCH**; debug/QA add `-qa`. This is Founder testimony plus local comparison, not authenticated Console verification or APK verification.

Highest-ever used code across **internal/closed/open/production**, including inactive/superseded uploads, remains UNKNOWN. **116 must not be assumed safe** without complete historical maximum verification; choose a next production code strictly above that verified maximum only under separate release approval. **No release version bump now.** Existing device/release blockers remain unchanged.

Mandatory Final Git/GitHub Closeout Plan is in `BHUMI_REMAINING_WORK_EXECUTION_PLAN.md`: 72 tracked modified files, 130 collapsed untracked entries / 216 recursive files, zero staged at audit. Exact inventories, exclusion policy, commit groups and eight approval-gated steps are recorded there. No staging, commit, push, upload, publish, reset, clean, stash, force-push or rebase in this task.

## Required next Founder action

Founder review of the verified Phase B QA APK artifact (`app-qa.apk`, SHA-256 `99F08D79...`), compiled isolation proof (`phaseb-compiled-proof.mjs`), and Play Store baseline documentation. Device phase remains separately gated; do not install, launch, or execute device testing until explicit authorization is granted.

Artifact path: `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792803200489\android\app\build\outputs\apk\qa\app-qa.apk`  
Artifact SHA-256: `99F08D79F3DD023875D243F9190FD5DE1394A8D6943A03F068665D1C08E1D448`  
Artifact size: `7,769,171` bytes  
Signer SHA-256: `e24c6fdcb380f6be70276f51472664995a716df7ef9b4dc770a628c86f0cd4bf`  
Signer SHA-1: `06cf57e5b3d0fc6744a8b1d71816e64667ae63b0`  
Package / code / name: `com.bhumiamartya.app.qa` / `115` / `5.0.15-qa`  

Production reads: 0. Production writes: 0. Cloud writes: 0. Device/ADB/install/launch/login/billing/deployment: 0. Git mutations/commits: 0. Initial dirty baseline preserved: 72 tracked modified / 130 untracked entries.  

STOP BEFORE DEVICE TESTING / STOP AND WAIT FOR FOUNDER REVIEW.
