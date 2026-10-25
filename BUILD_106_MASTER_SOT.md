# BHUMI AMARTYA — BUILD 106 MASTER SOURCE OF TRUTH

Status: CANONICAL FOR BUILD 106 RECOVERY

Base release: Build 105
Base SHA: `8fc3c23dcdeb9670a33922deec5e44ae545affd9`
Build 105 classification: `PRODUCTION_RELEASED_BUT_FEATURE_INCOMPLETE`
Build 106 phase: `RECOVERY_AND_RECONCILIATION_IN_PROGRESS`

## 1. Authority

This file is the primary product/recovery authority for all Build 106 work.

For Build 106, agents MUST use this order of authority:

1. Founder explicit instruction for the current task.
2. Repository/runtime evidence from the authorized Build 106 worktree.
3. `BUILD_106_MASTER_SOT.md`.
4. `BUILD_106_RECOVERY_MATRIX.md`.
5. `BUILD_106_AGENT_PROTOCOL.md`.
6. Recovered canonical V5 documents from checkpoint `036225f23b4c07636ab875f9939afbebdbdad9d7` when provenance has been verified.
7. Historical implementation evidence / commits / protected recovery worktree.
8. Historical root docs and chat memory.

Root `SOT.md`, `PRD.md`, and `TODO.md` target the Build 80/85 era and are NOT authoritative for Build 106.

The Build 105 release commit is also NOT sufficient as product truth because it is feature-incomplete and does not contain the canonical V5 documentation set.

## 2. Build 106 mission

Build 106 is NOT a normal feature release and NOT a four-bug hotfix.

Its mission is:

> Recover product continuity by reconciling Build 105 against the canonical V5 requirement set and recoverable historical source, restore all required product behavior, verify genuine new-user behavior, then only after full reconciliation produce the Build 106 release artifact.

Do not recreate historical features from memory while recoverable source exists.

## 3. Canonical requirement set

Canonical numbered requirements: `R-PRD-01` through `R-PRD-46`.

Total requirements: 46.

Build 105 audit classification:

- PRESENT_CORRECT: 4
- PRESENT_BUT_REGRESSED: 9
- MISSING: 18
- PARTIAL: 15
- UNKNOWN: 0
- Recoverable from existing source/checkpoint: 30
- Needs new implementation or completion after provenance reconciliation: 12

Build 106 is not feature-complete until all 46 requirements are reconciled to an accepted final status.

## 4. Confirmed Build 105 regressions

### 4.1 Genuine new-user lifecycle

Classification: `NEW_USER_FLOW_REGRESSED` / `BEHAVIOR_REGRESSION` / `MULTIPLE_CAUSES`.

Confirmed critical race:

1. `ensureMinimalUserProfile` sees no profile.
2. It waits for remote trial bootstrap before creating the minimal profile.
3. Bootstrap has no internal timeout.
4. AuthContext times out while the original bootstrap promise continues.
5. The user can complete setup and persist birth data, blueprint, `setupCompleted:true`.
6. Late bootstrap resumes the stale profile-missing branch.
7. It merges a minimal profile with empty birth fields, `setupCompleted:false`, and `blueprintStatus:"missing"`, potentially overwriting completed setup.

Additional defects requiring reconciliation:

- Missing setup-to-AuthContext refresh behavior.
- `blueprintStatus` transitions are not monotonic across all failure/recovery paths.
- Some Firestore/storage read failures collapse into missing/null.
- Setup success may be verified against localStorage instead of authoritative server readback.
- Dashboard recovery does not fully finalize profile setup state.
- Genuine users can become trapped between setup and dashboard.

Historical recovery evidence includes commit `0f0ad14e9a0801b51245289952b9875f0fa64c83`, which contains setup refresh behavior but is not an ancestor of Build 105.

A deterministic race test is mandatory before this area can be marked PASS.

### 4.2 Schumann / Environment

Relevant requirements: R-PRD-43 through R-PRD-46.

Build 105 lacks the canonical Schumann types/service/graph/provenance/three-layer UI.

Recoverable source exists in checkpoint `036225f23b4c07636ab875f9939afbebdbdad9d7`, including:

- `lib/environment/schumann.ts`
- `components/dashboard/SchumannGraph.tsx`
- environment service/types/card integrations
- environment tests

Classification: `FEATURE_LOST + UI_REGRESSION + DOC_IMPL_MISMATCH`.

Recovery rule: recover and reconcile source; do not reimplement from memory.

### 4.3 Astrology

Build 105 contains known regressions:

- fixed five Western bodies via `.slice(0,5)`;
- hardcoded eclipse dates/countdown;
- Blueprint group incorrectly shown inside Astro;
- no canonical Daily Astro synthesis shared with Wellness/Catatan/Weekly.

Recoverable checkpoint files include:

- `lib/astrology/calculateEclipses.ts`
- `lib/astrology/relevantWesternEvents.ts`
- `lib/astrology/dailyAstroSynthesis.ts`
- reconciled Astro cards/engines/tests

Historical UI/behavior evidence also includes the restored structure:

- Periode
- Tema Kolektif
- Menyentuh Dirimu
- Yang Bisa Dilakukan
- personalized eclipse handling

Expected Dashboard order from historical restoration evidence:

`Mirror -> Astro -> Catatan`

Classification: `PARTIAL_REGRESSION + FEATURE_REVERTED + UI_REGRESSION`.

### 4.4 Journaling / CBT / Memory

Build 105 lacks canonical journaling requirements including:

- `JournalType` discriminator;
- five modes: FREE / CBT / EMOTION / GUIDED / SPIRITUAL_AWAKENING;
- structured safe CBT payload/flow;
- mode-isolated draft recovery;
- crisis scan and AI suppression;
- mode-aware Memory extraction;
- canonical autosave/history/search/filter behavior;
- Memory visibility/control surfaces required by the PRD.

Recoverable source exists in checkpoint `036225f23b4c07636ab875f9939afbebdbdad9d7` for the journaling contracts, safety, Memory extraction, redirects, and acceptance tests.

Classification: `FEATURE_LOST + DATA_MODEL_REGRESSION + UI_REGRESSION`.

## 5. Additional required reconciliation

Build 106 must also reconcile, not silently ignore:

- Daily Note absent from Dashboard.
- Memory Dashboard / consent / correction missing.
- `ms-MY` runtime missing.
- Notification/FCM system missing.
- Premium static price regressed to Rp50.000 where canonical requirement expects Rp25.000 display with live Play price winning.
- Environment unavailable state fabricates `Stabil` instead of honest unavailable/provenance state.
- Raw identity/error logging still exists in parts of auth flow.
- Comfort Mode incomplete/missing.
- Continue Yesterday shortcut incomplete/missing.
- Per-entry privacy incomplete/missing.
- Memory decay/pinning incomplete/missing.
- Contextual evening reflection incomplete/missing.
- Astrocartography and other Blueprint/astro surfaces must be checked against recovered canonical source and requirement manifest.

## 6. Recovery provenance

Known evidence sources must remain separate until reconciled:

- Build 105 release SHA: `8fc3c23dcdeb9670a33922deec5e44ae545affd9`
- Recoverable agent checkpoint: `036225f23b4c07636ab875f9939afbebdbdad9d7`
- Historical new-user commit: `0f0ad14e9a0801b51245289952b9875f0fa64c83`
- Historical new-user runtime evidence: `cd42784dcf55257f1160871c8b1a4d3676f48681`
- Historical immediate-dashboard/HD evidence: `e3ef4570fa14e5df03e8001430a61d14142f7483`
- Protected recovery branch: `feat/build99`
- Protected recovery HEAD: `57479c928ba75e6a363613bb003809bd44a6c09d`
- Protected recovery worktree contains tracked and untracked deltas beyond committed history.

Do not merge the checkpoint or protected dirty worktree wholesale.

Required method: file/hunk-level reconciliation with provenance recorded.

## 7. Recovery sequence

Mandatory order unless the Founder explicitly changes it:

1. Canonical docs and Build 106 governance.
2. Genuine-new-user race + lifecycle state machine.
3. Localization foundation (`id/en/ms`) and canonical fallback/persistence.
4. Journaling data model + five modes + CBT + draft safety.
5. Memory + Daily Context + Daily Note integration.
6. Astrology canonical synthesis and UI reconciliation.
7. Environment / Schumann / provenance reconciliation.
8. Notifications / privacy / remaining canonical requirements.
9. Premium copy/price and final product-copy reconciliation.
10. Full feature manifest reconciliation across all 46 requirements.
11. Focused unit/emulator/browser/device tests.
12. Fresh-account genuine-user acceptance test.
13. Version bump / Build 106 artifact only after all release gates pass.

## 8. Build gates

The agent MUST NOT bump versionCode/versionName, run production release build, deploy, publish, or claim Build 106 exists until all of the following are true:

- All 46 canonical requirements have final reconciled statuses.
- All known `MISSING`, `PARTIAL`, and `PRESENT_BUT_REGRESSED` requirements have accepted resolution.
- Genuine new-user lifecycle passes with a fresh non-sample account path.
- The bootstrap late-write race has an executed deterministic regression test.
- Sample/dev-audit behavior is not used as onboarding proof.
- Focused tests for recovered modules pass.
- Firestore emulator/owner-isolation tests pass where relevant.
- Browser/device QA is completed for affected primary surfaces.
- No unresolved provenance conflict remains for adopted historical source.
- Founder explicitly approves release/versioning.

Until then:

`BUILD_106_ARTIFACT = DOES_NOT_EXIST`

## 9. Evidence discipline

Never claim PASS based only on:

- source presence;
- a successful commit;
- a sample account;
- an audit mock;
- HTTP route success;
- an emulator-only result when production/device evidence is required;
- a written test plan without execution.

All PASS claims must state executed evidence, exact command/test scope, and result.

## 10. Definition of done

Build 106 recovery is complete only when:

1. the product requirement manifest R-PRD-01..46 is fully reconciled;
2. recovered source has documented provenance;
3. genuine-new-user onboarding is stable;
4. major lost/regressed V5 surfaces are restored and validated;
5. no Build 105 regression classified as release-critical remains open;
6. release gates pass; and
7. Founder approves creation of the Build 106 release artifact.

Canonical final state marker:

`BUILD_106_RECOVERY_RECONCILED_AND_RELEASE_READY`

Until that marker is evidence-backed and Founder-approved, agents must continue recovery/reconciliation and must not convert the task into normal feature development.

## QA Phase B External Resource State (2026-10-22)

Founder-approved isolated Firebase QA project `bhumi-amartya-qa` (number `125330899891`, display "Bhumi Amartya QA") was created on Spark. Verified `billingEnabled=False` with no billing account; Firebase/Google Analytics APIs are not enabled.

Verified resources: Firestore `(default)` in `asia-southeast2` (`FIRESTORE_NATIVE`, `STANDARD`) with an explicitly closed deny-all rules release; Web app `1:125330899891:web:5a5d099369cfaa69d4c1c6`; Android app `1:125330899891:android:1d0bf90724f7a71ed4c1c6` for package `com.bhumiamartya.app.qa` with SHA-1/SHA-256 from the actual local debug signer. QA SDK configs are stored outside the repository at `%USERPROFILE%\.bhumi-qa\`; production `android/app/google-services.json` is unchanged.

Google Authentication is BLOCKED at the API: Identity Toolkit `initializeAuth` returns `BILLING_NOT_ENABLED` and the provider PATCH returns `CONFIGURATION_NOT_FOUND`; enabling Blaze is prohibited. `default_web_client_id` and OAuth alignment therefore remain unavailable, and QA backend bootstrap/token verification is BLOCKED. No APK/export/install/device test, Play transaction, production Firebase access or mutation, or Git commit occurred.

This note does not change the canonical Build 106 recovery state or imply release readiness. Details: `BHUMI_QA_PHASE_B_FIREBASE_SPARK_EXECUTION_REPORT.md`.

## QA Google Auth Verification (2026-10-22)

QA-GOOGLE-AUTH-VERIFY-01 confirmed the `bhumi-amartya-qa` Google provider is enabled (authorized domains: localhost, firebaseapp.com, web.app) and the QA Web OAuth client matches `default_web_client_id`. Project, package, SHA-1/SHA-256, Firestore isolation, deny-all rules, and $0 Spark status remain verified.

Not ready: the Android OAuth client (type 1) is absent from QA `google-services.json` (production shows `1,1,1,1,3`); `lib/auth/authActions.ts:344` hardcodes the production Web client; the local QA policy still rejects realQA/OAuth by design; backend token verification/bootstrap is BLOCKED. No APK, export, device test, backend deployment, production change, or Git commit occurred.

See `BHUMI_QA_GOOGLE_AUTH_VERIFY_01_REPORT.md`.

## QA Android OAuth and Auth Source Fix (2026-10-23)

QA-ANDROID-OAUTH-AND-AUTH-SOURCE-FIX-01 confirmed the QA Web OAuth client (type 3) is valid and matches the Google IdP `clientId`, but the Android OAuth client (type 1) remains absent from the QA SDK configuration. No public API exists for standard Google Sign-In OAuth clients; `clientauthconfig` is inaccessible and the IAM `oauthClients` resource is not applicable. Per firebase-tools issue #2470, a Console SHA action is required because CLI-added SHA does not materialize the Android OAuth client. SHA-1/SHA-256 were retained; no deletion or replacement occurred.

The production Web client literal was removed from `lib/auth/authActions.ts`. A new resolver (`lib/auth/googleWebClientId.ts`) returns the production identity only when no QA identity is configured, and fails closed for missing, mismatched, or production client IDs in QA mode. The QA runtime guard remains first and still blocks all QA selectors, so runtime remains BLOCKED.

Verification: 21-assertion resolver suite PASS; 512-assertion QA guard PASS; AUTH-NEW-02 14 assertions PASS; `npx tsc --noEmit` exit 0; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED. No APK, device login, backend deployment, production change, or Git commit occurred. See `BHUMI_QA_ANDROID_OAUTH_AND_AUTH_SOURCE_FIX_01_REPORT.md`.

## QA Dedicated Signer and OAuth Fix (2026-10-23)

QA-DEDICATED-SIGNER-OAUTH-FIX-01 created a dedicated PKCS12 QA signing key outside the repository at `%USERPROFILE%\.bhumi-qa\signing\` (alias `bhumi-qa`, RSA 4096, SHA256withRSA, ACL user-only). Public fingerprints: SHA-1 `06:CF:57:E5:B3:D0:FC:67:44:A8:B1:D7:18:16:E6:46:67:AE:63:B0`, SHA-256 `E2:4C:6F:DC:B3:80:F6:BE:70:27:6F:51:47:26:64:99:5A:71:6D:F7:EF:9B:4D:C7:70:A6:28:C8:6F:0C:D4:BF`. The new package+SHA-1 combination was absent across 9 accessible Firebase projects (8 Android apps, 21 SHA certificates); production was read-only and unchanged.

The new SHA-1/SHA-256 were registered only in `bhumi-amartya-qa`. The refreshed QA `google-services.json` now contains Android OAuth `client_type 1` for package `com.bhumiamartya.app.qa` with the new SHA-1, plus Web `client_type 3` matching the Google IdP `clientId`; no production project number is present. `android/app/build.gradle` has a conditional QA signing config and `qa` build type; `signingReport` succeeded without building an APK.

Verification: 21-assertion resolver suite PASS; 512-assertion QA guard PASS; AUTH-NEW-02 14 assertions PASS; `npx tsc --noEmit` exit 0; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED. Spark billingEnabled=False, Firestore `asia-southeast2` `FIRESTORE_NATIVE` `PESSIMISTIC`, and deny-all rules remain verified. Backend token verification/first-login bootstrap remains BLOCKED; no APK, native sign-in, device login, backend deployment, production change, or commit occurred. See `BHUMI_QA_DEDICATED_SIGNER_OAUTH_FIX_REPORT.md`.

## QA Local Bootstrap Harness (2026-10-23)

QA-BACKEND-BOOTSTRAP-LOCAL-01 implemented an isolated local-only harness under `qa/backend/` to validate the first-login access contract without production Firebase, credentials, deployment, billing, real authentication, or device access. It verifies RS256/JWKS tokens with Node `crypto`, enforces issuer/audience/subject/expiry/not-before/algorithm/key-id rules, derives the Firestore target only from the verified subject, and rejects production project identities and production credentials. The server binds only to `127.0.0.1`; configuration requires `BHUMI_QA_BACKEND=1`, a loopback Firestore emulator, and a `demo-` project.

The harness provides a production-equivalent trial-only route and a QA-only combined first-login route. It reproduces the canonical seven-day `server_access_bootstrap` grant, preserves higher entitlements, returns `ALREADY_PRESENT` for canonical trials, fails closed with `DATA_CONFLICT` for malformed state, and uses Firestore transactions with the clock resolved inside the transaction to make concurrent first-login requests idempotent. The QA-only combined route is not production code and must not be deployed.

Verification: `npm run test:qa:backend-bootstrap` passed 43/43 tests with exit 0 against Firestore emulator `demo-bhumi-qa-bootstrap`; a 31-test non-emulator subset also passed. `npm run lint` exited 0 with 421 warnings and 0 errors; `npx tsc --noEmit` exited 0; `npm run quality:gate` exited 0 with DEVELOPMENT GATE PASS and RELEASE GATE BLOCKED. The gate's QA ISOLATION detail is stale (“Firebase/QA project not configured”); the real QA project exists, but real backend runtime remains blocked.

Remaining blockers: no real QA ID token or revocation verification, no Vercel QA deployment, no browser/device proof, and no APK authorization. The harness uses the Admin SDK, so its tests validate server transactions, not Firestore client rules. Local HTTP success is not device QA. Recommendation: accept Option A for local validation now; consider Option B only after a separate QA service account, isolated Vercel target, deployment authorization, and runtime-policy adaptation. No production change, deployment, APK, device login, or commit occurred. See `BHUMI_QA_BACKEND_BOOTSTRAP_LOCAL_01_REPORT.md`.

## QA Vercel Backend Candidate 02 (2026-10-23)

QA-VERCEL-BACKEND-CANDIDATE-02 resolved the two local blockers in the QA Vercel candidate with minimum code changes. The handler and shared QA backend now accept both `/api/healthz` and `/healthz`; a routing test invokes the actual `api/healthz.mjs` entrypoint and verifies `200`, the QA project ID, and the absence of private data. The shared bootstrap implementation is packaged as `@bhumi/qa-backend` from `qa/backend/package.json` through `"file:../backend"`; `qa/vercel/.npmrc` sets `install-links=true` so npm copies the package into `qa/vercel/node_modules` and `firebase-admin` resolves from the Vercel root. A clean-room `npm ci` containing only `qa/vercel` and `qa/backend` passed. `qa/vercel/package-lock.json` was added.

Verification: candidate suite 25/25 PASS exit 0 against Firestore emulator `demo-bhumi-qa-bootstrap`; non-emulator subset 17/17 PASS; clean-room package/routing 2/2 PASS; `node --check` 17/17; `npx tsc --noEmit` exit 0; `npm run lint` 421 warnings / 0 errors exit 0; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED exit 0. No Vercel deployment, cloud resource, paid-plan change, production Firebase access, APK/device test, Billing transaction, or commit occurred.

Remaining blockers: GCP WIF pool/provider, QA service account and IAM grants, Vercel QA project/Pro/protection/custom domain, live OIDC/WIF and Firebase revocation, actual Vercel preview build with outside-root source enabled, and Android/device QA. The local candidate is ready for the next authorized deployment task, not release. See `BHUMI_QA_VERCEL_BACKEND_CANDIDATE_02_REPORT.md` and `qa/vercel/README.md`.

## QA Vercel Backend Deployment Preparation (2026-10-23)

QA-VERCEL-BACKEND-DEPLOYMENT-01 completed final read-only preparation without deployment or external mutation. Actual Vercel team state: `wizzares-projects` (`team_8vojTcMSw0zsRVCmCVaK39AB`), billing plan `hobby`, status `active`, one `OWNER`, 15 projects, no `bhumi-qa-bootstrap`, contract commitments `0`, usage API `404`. Hobby is `$0/month` but non-commercial; Pro is `$20/month` plus tax with a `$20/month` usage credit. No plan change or purchase occurred.

The isolated QA project target is `bhumi-qa-bootstrap`, Root Directory `qa/vercel`, with a dedicated custom domain `qa-bootstrap-api.bhumiamartya.my.id` (not configured; DNS unverified). The QA-only combined route remains inside the isolated QA project, never the production app or production Vercel project.

GCP QA project `bhumi-amartya-qa` (`125330899891`) is active; `billingEnabled=False`; Firestore `(default)` is `FIRESTORE_NATIVE` in `asia-southeast2`; WIF pools are absent; `qa-bootstrap@...` is `NOT_FOUND`; `iam.googleapis.com`, `iamcredentials.googleapis.com`, and `sts.googleapis.com` are not enabled; no IAM binding or key exists. Rules API readback remains `403`; local client rules remain deny-all.

WIF preparation: Team issuer `https://oidc.vercel.com/wizzares-projects`; allowed audience `https://vercel.com/wizzares-projects`; subject condition `owner:wizzares-projects:project:bhumi-qa-bootstrap:environment:production`; provider resource `//iam.googleapis.com/projects/125330899891/locations/global/workloadIdentityPools/vercel-qa/providers/vercel-qa`. Minimum IAM is corrected from `roles/iam.serviceAccountTokenCreator` to `roles/iam.workloadIdentityUser` for WIF impersonation, plus a custom runtime role with only `datastore.entities.get`, `datastore.entities.create`, `datastore.entities.update`, and `firebaseauth.users.get`. No key is permitted.

Verification: candidate 25/25 PASS exit 0; non-emulator 17/17 PASS; clean-room `npm ci` exit 0 plus package/routing 2/2 PASS; `node --check` 17/17; `npx tsc --noEmit` exit 0; lint 421 warnings / 0 errors; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED exit 0. No source, deployment, cloud resource, paid plan, APK/device, Billing, production change, or commit occurred.

Remaining blockers: Pro upgrade, QA Vercel project/domain/protection, GCP APIs, WIF pool/provider, service account/IAM, actual Vercel build/outside-root setting, live OIDC/WIF and Firebase revocation, Rules readback, custom-domain reachability, Android/device QA, and unverified usage cost. Statuses preserved: RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; 25 RSK / 21 DS; RSK-22/23 open. See `BHUMI_QA_VERCEL_BACKEND_DEPLOYMENT_01_REPORT.md` and `qa/vercel/README.md`. Next: ONE Founder activation decision under a separate task; current approval is preparation only.

## QA Free Backend Path Selection (2026-10-23)

QA-FREE-BACKEND-SELECTION-01 selects the existing local `qa/backend` harness as the only demonstrated `$0` QA backend route for real Android Google Sign-In. Vercel Pro (`$20/month` plus tax), GCP WIF, Netlify/Cloudflare deployment, paid resources, persistent service-account keys, production Firebase/HD/Billing, APK build/install, device sign-in, and deployment remain unauthorized. Reused components: QA Spark project `bhumi-amartya-qa`; verified QA Google/Android OAuth and dedicated QA signer; external QA SDK configs; `qa/backend` (43/43 prior tests); AUTH-NEW-02/`resolveGoogleWebClientId`; existing Android toolchain.

Readiness is BLOCKED. `lib/config/qaRuntime.ts` and `lib/firebase/config.ts` throw `QA_RUNTIME_DISABLED` at module load for any QA/emulator selector; `qaConfig.mjs` rejects `realQA` and `assertQaStagingAllowed` always throws `QA_STAGING_DISABLED`; `scripts/run-mobile-staging-build.mjs` hardcodes production/synthetic Firebase and production Vercel URLs; `android/app/google-services.json` and `.env.local` are production; QA SDK config is external and the QA package is `com.bhumiamartya.app.qa`; the local backend accepts only `demo-` token projects and lacks revocation. No device is attached; `adb reverse` is unverified.

Minimum corrections: narrow fail-closed realQA allowance (exact QA project/package, Firestore emulator only; Auth/Functions emulators false); local backend accepts the exact QA token issuer/audience with emulator writes and checks revocation through QA Identity Toolkit `accounts:lookup` (`validSince`/disabled), without a service-account key; QA-only HTTPS listener/proxy plus debug-only certificate trust and `adb reverse`; QA build injects the external QA SDK/env and routes HD/astrology away from production Vercel or fails them closed. Onboarding can then be tested against real QA Auth plus emulator, not real cloud Firestore; HD/astrology remains pending or partial unless a QA endpoint is separately approved.

Cost: `$0` additional monthly for the selected local path using existing hardware/toolchain; no paid plan or external resource. Netlify Free (`300` credits/month, functions `10` credits/GB-hour) lacks a documented OIDC to GCP WIF credential path; Cloudflare Workers Free (`10 ms` CPU/request) is unsuitable. Real Android login is not testable today; after a separately authorized QA APK it should be testable for real QA Google Auth plus emulator-backed bootstrap. Real-cloud Firestore/rules, deployed backend, and device/runtime acceptance remain open.

Statuses preserved: `25 RSK / 21 DS`; `44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP`; 0 complete; RCV-25/28 BL, RCV-41 IP; RSK-22/23 open. One next authorization: `QA-LOCAL-ANDROID-SIGNIN-01` for the minimum corrections, local HTTPS, QA APK build/install, real QA Google sign-in, and emulator-backed onboarding. No Vercel/Netlify/Cloudflare deployment, cloud Firestore writes, paid resources, production changes, or commit.

## QA Local Android Sign-In Phase A (2026-10-24)

QA-LOCAL-ANDROID-SIGNIN-01 Phase A implemented source/config readiness for the `$0` local Android QA path. Verdict: **SOURCE CONFIG READY**; end-to-end Android QA remains **NOT RUN** pending external QA SDK/TLS placement and device execution. This section supersedes the Phase A blockers recorded in the 2026-10-23 selection note; that note remains as historical evidence.

Implemented: fail-closed `realQA` config/runtime allowance for the exact QA project `bhumi-amartya-qa` and package `com.bhumiamartya.app.qa`; single-app Firebase configuration that keeps QA Auth identity while binding Firestore to an isolated `demo-` project; QA staging gate with validated local origins; QA-only billing disablement; local backend auth/data project split, strict `auth_time`, Identity Toolkit revocation, HTTPS listener support, and expanded health metadata; conditional dedicated QA Android signing and debug-only cleartext/user-CA trust.

Verification: QA unit guard PASS 530 assertions exit 0; `npm run test:qa:backend-bootstrap` 53/53 PASS exit 0 against `demo-bhumi-qa-bootstrap`; `npx tsc --noEmit` exit 0; `npm run lint` exit 0 with 421 warnings / 0 errors; `npm run quality:gate` exit 0 with DEVELOPMENT GATE PASS / RELEASE GATE BLOCKED; selected `node --check` exit 0.

Remaining: external QA `google-services.json` not placed in the debug/QA source set; no local TLS certificate/key; no real QA token, Google Sign-In, live revocation, staging build, APK/install, `adb reverse`, device, or browser acceptance. No production Firebase/HD/Billing access, deployment, cloud write, paid resource, or commit. Statuses preserved: `25 RSK / 21 DS`; `44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP`; 0 complete; RCV-25/28 BL, RCV-41 IP; RSK-22/23 open. Details: `BHUMI_QA_LOCAL_ANDROID_SIGNIN_01_PHASE_A_REPORT.md`. Next: separate Founder-authorized Phase B execution; STOP before APK/device/deploy.

## QA Local Android Sign-In Phase B (2026-10-24)

Phase B is **PHASE B PASS — ISOLATION ACCEPTANCE RESOLVED, SIGNED QA APK BUILT**. Verified by actual execution of compiled webpack factories loaded from `mobile-staging-1792803200489/out` (`phaseb-compiled-proof.mjs`, 36 checks exit 0, 0 native calls, 0 network) proving compiled `qaRuntime` rejection of invalid/production envs, loopback endpoint enforcement, local bootstrap execution, and disabled billing. A new signed QA APK was assembled in clean root `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792803200489\android\app\build\outputs\apk\qa\app-qa.apk` (SHA-256 `99F08D79F3DD023875D243F9190FD5DE1394A8D6943A03F068665D1C08E1D448`, 7,769,171 bytes; `com.bhumiamartya.app.qa` / 115 / `5.0.15-qa`; RSA 4096 dedicated QA signer SHA-256 `e24c6fdc...` / SHA-1 `06cf57e5...`). Asset parity: 808/808 output->staged and output->APK entries (`phaseb-parity.mjs`). Previous APK at `mobile-staging-1792797759370` is preserved as historical evidence. Regressions: QA guard 538 PASS, Google client 21 PASS, TLS 8 PASS, backend bootstrap 53/53 PASS, AUTH telemetry 14 PASS (loaded `.env.local`), TSC exit 0, lint 421 warnings / 0 errors exit 0, Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED exit 0. Release remains BLOCKED pending device acceptance and Play verification. See `BHUMI_QA_LOCAL_ANDROID_SIGNIN_01_PHASE_B_REPORT.md`.

## Founder-provided Play baseline (2026-10-24)

Current Founder-provided Play baseline: **versionCode 115, versionName 5.0.15** (explicit Founder confirmation in this task). Local `android/app/build.gradle:10-11` defaults are **115 / "5.0.15": EXACT MATCH**, not independent Play verification. QA/debug suffix `-qa` is not the production versionName. This supersedes older baseline uncertainty only for the Founder-confirmed pair; historical Build 105/106/107 records remain historical.

Highest-ever used versionCode across **internal/closed/open/production**, including inactive/superseded uploads, remains **UNKNOWN**. **116 is NOT automatically safe**: verify complete Play upload history and its maximum before selecting a next production code greater than that maximum. Record package, track, status, upload date and latest uploaded/active/published separately. No release version bump now; no build/upload/publish authorization. Phase B is PASS for isolated build and remediation; release remains BLOCKED pending Play verification and device testing.

Mandatory Git/GitHub closeout plan and exact inventory: `BHUMI_REMAINING_WORK_EXECUTION_PLAN.md`, section Final Git/GitHub Closeout Plan. Preparation only; no staging, commit or push now. Next: Founder reviews that plan and supplies authoritative all-track Play history or separately authorized authenticated read-only access.

## Bukti wajib rilis Android final (2026-10-24; Console verification still pending)

- **Google Play: NOT VERIFIED.** Pembacaan read-only untuk aplikasi Bhumi produksi yang benar diizinkan, tetapi tidak tersedia tool Play Console/browser terautentikasi. Identitas aplikasi/package di Console: UNKNOWN. Tidak mencoba autentikasi baru, secrets, atau service account; tidak ada pembacaan produksi yang dilakukan.
- Wajib memperoleh riwayat seluruh upload, termasuk artefak tidak aktif, pada internal/closed/open/production: versionCode tertinggi yang pernah digunakan = UNKNOWN; versionName terkait = UNKNOWN; track = UNKNOWN; status = UNKNOWN; tanggal upload = UNKNOWN. Latest uploaded, active, dan published harus dicatat terpisah; versionCode/versionName/track/status/tanggal upload untuk masing-masing = UNKNOWN. Track aktif saja tidak membuktikan maksimum historis.
- Perbandingan Play dengan QA APK Phase B dan latest release candidate: QA APK Phase B terverifikasi lokal (`com.bhumiamartya.app.qa`, 115, `5.0.15-qa`, dedicated QA signer), tetapi latest release candidate produksi = UNKNOWN. `build.gradle` lokal bukan bukti Play atau bukti kandidat rilis terbaru; tidak ada versi lokal yang diadopsi di sini.
- Sebelum upload berikutnya, versionCode rilis baru WAJIB melebihi SEMUA kode yang pernah digunakan di Play; package produksi dan kontinuitas signing produksi wajib dipertahankan dan dibuktikan. Tidak ada perubahan versi arbitrer atau izin upload/publish/perubahan track/subscription.
## Automated Android Emulator Acceptance Smoke Test (2026-10-24)

In accordance with explicit Founder directive, physical-device inspection and manual ADB testing were replaced with the simplest existing $0 automated Android validation path.

The existing signed Phase B QA APK (`app-qa.apk`, SHA-256 `99F08D79F3DD023875D243F9190FD5DE1394A8D6943A03F068665D1C08E1D448`, 7,769,171 bytes; `com.bhumiamartya.app.qa` / 115 / `5.0.15-qa`) was executed on local headless Android Emulator `Pixel_8` (Android 14+ / API 34+ system image `android-37.0` x86_64, 4096MB RAM).
- Result: **AUTOMATED EMULATOR SMOKE TEST: PASS**.
- Cold start in 5.6s (`Status: ok`, `LaunchState: COLD`, `TotalTime: 5652ms`), process active (`PID: 4153`, UID 10235), window focused, `CapacitorWebView` element attached.
- Stability: 0 fatal exceptions, 0 application ANRs.
- Isolation: 0 hits for production Firebase (`bhumiamartya-fe85c`), production Vercel endpoints, or production billing verifiers. Clean post-test uninstall and emulator teardown.
- Evidence: `BHUMI_ANDROID_AUTOMATED_ACCEPTANCE_REPORT.md`.

## Full Application Testing & Production Build Evaluation (2026-10-24)

In accordance with Founder directive, comprehensive testing of all completed work was executed:
- **LATEST QA APK Built & Verified:** Clean export from updated source (`mobile-staging-1792811076278`), incorporating `MainActivity` onRenderProcessGone recovery, automatic daily reminder at 20:00, and canonical version reconciliation (115 / 5.0.15-qa). APK SHA-256: `3BF0953180319A151B0C0A881F9CD584B509686B767F5F24C184C297D9FD03A8` (size: 7,768,535 bytes). Asset parity: 808/808 output files matched (0 mismatches).
- **Physical Device Status:** Xiaomi Redmi 13C connected via USB. The installed production app (`com.bhumiamartya.app`, versionCode 115 / versionName 5.0.15) was 100% preserved intact without uninstallation or data wiping. Direct ADB install of the QA package was blocked by MIUI user restrictions (`INSTALL_FAILED_USER_RESTRICTED`), safely verified via `/data/local/tmp` and cleanly removed.
- **Automated Native Verification:** Executed on local headless Android Emulator (`Pixel_8` AVD, API 34+, 4096MB RAM): cold launch in 10.2s, window focused, `CapacitorWebView` attached, 0 fatal crashes, 0 ANRs, 0 production endpoint hits, clean background/foreground cycling, and Settings navigation with 20:00 reminder verified. Screenshots: `screen_01_dashboard.png`, `screen_02_settings.png`.
- **Regressions:** QA config 538 PASS, Google client 21 PASS, backend bootstrap 53/53 PASS (JDK 21), auth telemetry 14 PASS, daily 20:00 reminder 10 PASS, step 8 contracts 63 PASS, TypeScript 0 errors, ESLint 421 warnings / 0 errors, Quality Gate DEV PASS / RELEASE BLOCKED.
- **Production Build Prerequisites:** Evaluated as READY. Configured in `android/app/build.gradle` for package `com.bhumiamartya.app` using `android/keystore.properties` pointing to `C:\Users\shein\keys\bhumi-amartya-release.jks` (`bhumi-amartya`, RSA-2048, verified via `keytool`). Baseline preserved: `versionCode = 115`, `versionName = "5.0.15"`. Held pending Founder release authorization; `116` is strictly not approved.
- Detailed report: `BHUMI_FINAL_FULL_APPLICATION_TEST_REPORT.md` and `BHUMI_FINAL_ANDROID_DEVICE_AND_PRODUCTION_BUILD_REPORT.md`.

Minimum remaining release blockers:
1. Google Play Console all-track history read-only verification (highest-ever uploaded versionCode remains UNKNOWN; Founder baseline 115 / 5.0.15; do not assume 116 safe without verification).
2. End-to-end interactive Google OAuth sign-in and live cloud Firestore rules remain unverified in this automated test pipeline.
3. Release Gate strictly remains **RELEASE BLOCKED**.
4. Mandatory Git/GitHub closeout remains pending explicit Founder authorization before any commit or push.
Details and exact 4-commit closeout plan: `BHUMI_FINAL_RELEASE_AND_GIT_PREFLIGHT_REPORT.md`.

STOP AND WAIT FOR FOUNDER REVIEW.


## Founder-Authorized Production Version 116 (2026-10-25)

By explicit Founder authorization, the production Android artifact was upgraded from Build 115 (5.0.15) to:
- **versionCode:** 116
- **versionName:** 5.0.16
- **applicationId:** com.bhumiamartya.app

### Build & Verification Evidence:
- **Pipeline:** Deterministic production Next.js static export (out/, 882 files, 71 HTML routes, 111 RSC aliases, exit code 0) -> npx cap sync android (exit code 0) -> Gradle assembleRelease with Microsoft JDK 21 (exit code 0 in 3m 13s).
- **Artifact:** android/app/build/outputs/apk/release/app-release.apk
- **SHA-256 Digest:** 5FE93E46A8540FBE213FB2D7D266BDECE0222B7CF31F3884B8AE94AC14CA1105
- **Size:** 8,109,069 bytes (~8.11 MB)
- **Signing Scheme & Identity:** APK Signature Scheme v2 (true), signed with canonical release keystore bhumi-amartya-release.jks (RSA 2048-bit, SHA-1 b51c84d07b869580c7d59d36e8faf852f792cc52 matching production Firebase OAuth client android/app/google-services.json).
- **Badging Verification (aapt2):** package: name='com.bhumiamartya.app' versionCode='116' versionName='5.0.16', compileSdkVersion='36', targetSdkVersion='36', minSdkVersion='24', launchable activity com.bhumiamartya.app.MainActivity.
- **Asset Parity & Isolation:** 884 assets in assets/public/, 0 secrets, 0 QA packages, 0 emulator schemes.
- **Play Console Track Status:** PLAY HISTORY NOT VERIFIED (no authenticated Play Console access in CLI environment). Do not present 116 as upload-safe until verified against Play Console all-track history.
- **Release Status:** Development Gate PASS; Release Gate remains RELEASE BLOCKED pending Play Console track history verification and Founder release approval.
