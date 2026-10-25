# BHUMI QA LOCAL ANDROID SIGN-IN 01 — PHASE A REPORT

Date: 2026-10-24  
Task: `QA-LOCAL-ANDROID-SIGNIN-01`  
Worktree: `C:\tmp\bhumi-build106-recovery`  
Branch: `hotfix/build110-indonesian-only`  
HEAD: `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
Verdict: **SOURCE CONFIG READY**  
End-to-end Android QA: **NOT RUN — EXTERNAL QA SDK/TLS AND DEVICE EXECUTION PENDING**

## Scope

Phase A implements source/config readiness for the `$0` local Android QA path:

- real Firebase QA Auth project `bhumi-amartya-qa`;
- QA package `com.bhumiamartya.app.qa`;
- dedicated QA signing configuration;
- Firestore emulator as the only QA data store;
- local `qa/backend` bootstrap with QA token issuer/audience and revocation;
- QA-only billing disablement;
- no production Firebase, paid resource, deployment, APK, or device mutation.

This is not a release-readiness claim and does not authorize an APK or device test.

## Source Changes

### QA runtime and Firebase

- `lib/config/qaConfig.mjs` — fail-closed `realQA` validation, exact QA project/package, isolated `demo-` Firestore project, loopback endpoints, QA staging gate, and runtime evaluation. Empty QA selector values remain blocked; explicit production flags remain allowed; `BHUMI_LOCAL_QA='0'` is allowed and `'1'` blocks.
- `lib/config/qaRuntime.ts` — uses `assertQaRuntimeAllowed`; added `isQaOperationAllowed`.
- `lib/firebase/config.ts` — single Firebase app. In `realQA`, the app `projectId` is the demo Firestore project so Firestore targets the emulator, while Auth continues to use the QA `apiKey`/`authDomain`. This avoids secondary-app auth-state problems; the assumption was inspected in the Firebase Auth SDK but is not live-verified.
- `lib/firebase/emulatorConfig.ts` — Firestore wiring assertion now follows the Firestore-specific emulator flag, so `realQA` validates the emulator connection even when the global emulator flag is false.
- `next.config.ts` — exposes the QA, emulator, HD, astrology, and web-app env keys required by the client, including `BHUMI_QA_MODE`, `NEXT_PUBLIC_QA_MODE`, `NEXT_PUBLIC_QA_CANDIDATE`, `NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA`, and `NEXT_PUBLIC_APP_EDITION`.

### QA staging and billing

- `scripts/run-mobile-staging-build.mjs` — calls `assertQaStagingAllowed(process.env)` before staging; `realQA` builds use validated local QA origins, QA Firebase project, demo Firestore project, explicit `NEXT_PUBLIC_QA_MODE=realQA` and `BHUMI_QA_MODE=realQA`, and no synthetic/production fallback.
- `lib/billing/googlePlayBilling.ts` — added `assertQaBillingAllowed()`; all billing entry points fail with `QA_BILLING_DISABLED` in `realQA`.

### Local QA backend

- `qa/backend/lib/config.mjs` — separates Auth project from data project; requires `QA_BOOTSTRAP_ALLOW_REAL_QA=1` for `bhumi-amartya-qa`; requires an isolated `demo-` Firestore project and Identity Toolkit API key for real QA; rejects production project identities and credentials; optional TLS.
- `qa/backend/lib/token-verifier.mjs` — optional strict `auth_time` enforcement for real QA.
- `qa/backend/lib/revocation.mjs` — Identity Toolkit `accounts:lookup` revocation checker; binds `localId` to the JWT subject and checks `disabled` and optional `validSince`.
- `qa/backend/lib/server.mjs` — HTTPS listener support, revocation wiring, 503 on revocation unavailable, 401 on invalid/revoked tokens, expanded health metadata, and Admin app binding to the Firestore project.
- `qa/backend/local-bootstrap-server.mjs` — logs protocol, auth/data project IDs, and revocation state.
- `qa/backend/README.md` — updated configuration, TLS, revocation, and scope documentation.

### Android

- `android/app/build.gradle` — conditional dedicated QA signing config; debug uses it when complete; optional `qa` build type; google-services plugin applies when a root, `src/qa`, or `src/debug` file exists.
- `android/app/src/debug/res/xml/network_security_config.xml` — debug cleartext for `10.0.2.2` and `127.0.0.1`; debug-only user/system CA trust. Production remains cleartext-disabled.

### Tests

- `tests/unit/qa-backend-auth-db-config.test.mjs` — 530 assertions covering QA config, staging, runtime selectors, Firebase project override, billing disablement, and protected callback/fetch/plugin non-invocation.
- `qa/backend/tests/config.test.mjs` — QA auth/demo Firestore split, real-QA authorization, identity-toolkit key, and production rejection.
- `qa/backend/tests/token-verifier.test.mjs` — strict `auth_time` coverage.
- `qa/backend/tests/revocation.test.mjs` — revocation success, revoked/disabled/mismatch, missing `auth_time`, malformed responses, and upstream failure.
- `qa/backend/tests/server-revocation.test.mjs` — server wiring, 401/503 behavior, and provisioning only after signature + revocation pass.
- `qa/backend/run-emulator-tests.mjs` — includes the new suites and clears inherited real-QA/TLS/port env for deterministic tests.

## File-Level Diff Statistics

Tracked Phase A changes (`git diff --numstat`, additions/deletions):

```text
48      2       android/app/build.gradle
7       0       android/app/src/debug/res/xml/network_security_config.xml
38      5       lib/billing/googlePlayBilling.ts
11      1       lib/firebase/config.ts
1       1       lib/firebase/emulatorConfig.ts
34      1       next.config.ts
89      1       BUILD_106_MASTER_SOT.md
```

Untracked/new Phase A files (total line count):

```text
269     lib/config/qaConfig.mjs
13      lib/config/qaRuntime.ts
383     scripts/run-mobile-staging-build.mjs
206     qa/backend/lib/config.mjs
166     qa/backend/lib/token-verifier.mjs
60      qa/backend/lib/revocation.mjs
231     qa/backend/lib/server.mjs
29      qa/backend/local-bootstrap-server.mjs
44      qa/backend/run-emulator-tests.mjs
102     qa/backend/README.md
131     qa/backend/tests/config.test.mjs
124     qa/backend/tests/token-verifier.test.mjs
69      qa/backend/tests/revocation.test.mjs
98      qa/backend/tests/server-revocation.test.mjs
142     qa/backend/tests/helpers.mjs
154     tests/unit/qa-backend-auth-db-config.test.mjs
145     BHUMI_QA_LOCAL_ANDROID_SIGNIN_01_PHASE_A_REPORT.md
228     BHUMI_MASTER_PROJECT_CHECKLIST.md
268     BHUMI_MASTER_GAP_AND_RISK_REGISTER.md
187     BHUMI_REMAINING_WORK_EXECUTION_PLAN.md
```

The worktree also contains pre-existing Build 106/107/110 modifications and untracked evidence; the table above lists only files changed for this Phase A task.

## Verification

Executed on 2026-10-24:

| Command | Result |
| --- | --- |
| `node tests/unit/qa-backend-auth-db-config.test.mjs` | PASS, 530 assertions, exit 0 |
| `npm run test:qa:backend-bootstrap` | PASS, 53/53 tests, exit 0, Firestore emulator `demo-bhumi-qa-bootstrap` |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0, 421 warnings, 0 errors |
| `npm run quality:gate` | exit 0, DEVELOPMENT GATE PASS, RELEASE GATE BLOCKED |
| `node --check` on QA config/server/revocation/staging/test files | exit 0 |

The backend emulator suite was rerun with `JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot`; the default shell JDK 17 is rejected by `firebase-tools`. The Quality Gate was rerun after the final config edits. Its QA Isolation line remains stale (`Firebase/QA project not configured`); it does not reflect this local source-readiness work.

## Not Run / Remaining Limits

- External QA `google-services.json` is still at `%USERPROFILE%\.bhumi-qa\google-services.json`; it has not been placed at `android/app/src/debug/google-services.json` or `android/app/src/qa/google-services.json`. A debug build without the QA file can fall back to the tracked production root file; do not build QA until this is resolved.
- No local TLS certificate/key exists. The backend defaults to HTTP unless `QA_BOOTSTRAP_TLS_CERT_FILE` and `QA_BOOTSTRAP_TLS_KEY_FILE` are supplied; Android debug trust is prepared but no certificate is installed.
- No real QA ID token, Google Sign-In, Identity Toolkit `accounts:lookup`, Firestore client-rules test, or browser/device acceptance was executed.
- No QA APK build/install, `adb reverse`, emulator launch, or device test was executed.
- No staging build was executed; only the staging gate/config path was unit-tested.
- No production Firebase/HD/Billing access, cloud write, deployment, paid resource, or commit occurred in this Phase A run.

## Production Safety

- Production `lib/firebase/config.ts` path remains the existing production project selection.
- `realQA` billing is disabled; production billing behavior is unchanged.
- No production credentials, service-account JSON, billing secrets, or external QA SDK contents were read or recorded.
- Production `android/app/google-services.json` is unchanged.
- Statuses preserved: `25 RSK / 21 DS`; `44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP`; 0 complete; RCV-25/28 BL, RCV-41 IP; RSK-22/23 open.

## Next Founder Action

Authorize a separate Phase B execution task to:

1. place the external QA `google-services.json` into the debug/QA source set and verify the generated config selects `bhumi-amartya-qa`;
2. provide or generate a local HTTPS certificate outside the repository and install its CA for the debug-only trust path;
3. run the local backend with the QA Auth project + demo Firestore and obtain a real QA ID token;
4. build/install the QA APK only after explicit APK authorization, then run adb reverse + real QA Google Sign-In + emulator-backed onboarding.

**STOP AND WAIT FOR FOUNDER REVIEW**
