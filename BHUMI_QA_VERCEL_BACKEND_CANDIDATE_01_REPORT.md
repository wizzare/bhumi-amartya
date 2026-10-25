# BHUMI QA VERCEL BACKEND CANDIDATE 01 REPORT

Date: 2026-10-23

Worktree: `C:\tmp\bhumi-build106-recovery`

Branch: `hotfix/build110-indonesian-only`

HEAD: `e63f334cf0ac20cc076bc88e98e3e06808b024f3`

## 1. Verdict

Local isolated Vercel QA candidate implementation: **PASS**.

Vercel QA deployment readiness: **BLOCKED**.

Release readiness: **NOT CLAIMED**.

No Vercel project, GCP WIF pool/provider, service account, deployment, APK, device login, production Firebase access, production change, or Git commit was created or performed.

The candidate is a QA-only local implementation. Its tests pass, but it has not been built or deployed by Vercel, has not exchanged a live OIDC token through GCP WIF, and has not verified a live Firebase token or revocation. A Vercel routing defect and a source/dependency-boundary validation gate remain before deployment can be considered.

## 2. Scope and constraints honored

Authorized work for this report:

- Document the existing QA-only Vercel candidate under `qa/vercel/`.
- Finish the candidate README and this report.
- Run local candidate tests and repository checks.
- Stop before deployment.

Constraints honored:

- No reset, clean, stash, rebase, checkout, or branch switch.
- No new worktree.
- No overwrite of unrelated modified or untracked files.
- No commit or push.
- No Vercel deployment or project creation.
- No GCP resource creation.
- No service-account key creation, copy, or exposure.
- No production Firebase, Human Design, or Billing change.
- No APK build, install, launch, or device test.
- No real Google Sign-In or Billing transaction.
- No real user identifiers, emails, birth data, tokens, or credentials recorded.
- Existing 70 modified tracked files were preserved; this documentation task did not revert or adopt them.
- Master tracker updates were intentionally deferred; this report is the evidence source for the next authorized tracker update.

## 3. Candidate architecture

The candidate is a separate Vercel Functions root at `qa/vercel/`.

```text
QA client / Android WebView
  Authorization: Bearer <Firebase ID token>
        |
        v
Vercel Function
  - reads x-vercel-oidc-token
  - validates QA-only config, origin, body, rate limit
        |
        v
GCP STS + Workload Identity Federation
  - Vercel OIDC token -> federated token
  - service-account impersonation
        |
        v
QA service account (keyless)
  - roles/datastore.user
  - firebaseauth.users.get
        |
        +--> Firestore QA project
        +--> Firebase Admin Auth verifyIdToken(token, true)
```

Key implementation choices:

- `@google-cloud/firestore` is used directly with the WIF auth client and `preferRest: true`.
- `firebase-admin/auth` uses a custom `Credential` backed by the short-lived WIF access token.
- Services are created per request because the Vercel OIDC token is supplied in the request context.
- The shared transaction contract remains in `qa/backend/lib/first-login.mjs` and `qa/backend/lib/bootstrap-contract.mjs`.
- The shared HTTP handler remains in `qa/backend/lib/server.mjs`; it was previously refactored to export `handleRequest`, `sendJson`, `corsHeaders`, `originAllowed`, and `bearerToken`, and to accept Vercel-parsed `req.body`.
- The Vercel handler maps `QA_VERCEL_UNAVAILABLE` to HTTP `503 QA_BACKEND_UNAVAILABLE`.
- No `@vercel/oidc` dependency is used. The function header is read directly, with `VERCEL_OIDC_TOKEN` as a local-development fallback.

## 4. Security and fail-closed behavior

- Requires `BHUMI_QA_VERCEL=1`.
- Pins project `bhumi-amartya-qa` and project number `125330899891`.
- Rejects production project `bhumiamartya-fe85c` in `QA_VERCEL_PROJECT_ID`, `FIREBASE_PROJECT_ID`, `GCLOUD_PROJECT`, `GOOGLE_CLOUD_PROJECT`, and `FIREBASE_CONFIG`.
- Rejects production credential variables: `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, and `FIREBASE_SERVICE_ACCOUNT`.
- Rejects invalid WIF pool/provider identifiers and service accounts outside `@bhumi-amartya-qa.iam.gserviceaccount.com`.
- Restricts CORS to `https://localhost`, `http://localhost`, and `capacitor://localhost`.
- Requires an empty body; maximum body size is 16 KiB.
- Rate-limits POSTs before auth work with a per-instance fixed window.
- Rejects missing or malformed OIDC tokens before service creation.
- Returns sanitized outcomes without token contents or PII.
- Uses `verifyIdToken(token, true)` for revocation checking when live Admin Auth is available.
- The Admin SDK bypasses Firestore client rules; QA client rules remain deny-all and separate.
- The QA-only combined first-login route is not production code and must not be deployed to production.

## 5. Verification evidence

### 5.1 Candidate emulator suite

Command:

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
npm run test:qa:vercel-backend
```

Result:

- Exit code: `0`
- Tests: `23`
- Pass: `23`
- Fail: `0`
- Cancelled: `0`
- Skipped: `0`
- Todo: `0`
- Duration: `2937.6525ms`
- Emulator: Firestore `demo-bhumi-qa-bootstrap`

Coverage:

- Fixed QA-only configuration.
- Missing QA flag rejection.
- Production project/project-number rejection.
- Production credential/project-environment rejection.
- Invalid WIF and service-account rejection.
- Non-local CORS origin rejection.
- Health and preflight without OIDC.
- Disallowed origins and unknown routes.
- Missing Firebase token (`401`) and missing OIDC (`503`).
- Non-empty body and production-token rejection.
- Canonical seven-day trial and idempotency.
- Minimal profile and existing-user first login.
- Rate limit before auth work.
- Fixed-window rate limiting and client-key derivation.
- Firestore/Admin Auth wiring to the short-lived auth client.
- Injected database non-termination.
- OIDC header and fallback behavior.
- Keyless WIF external-account configuration.
- Auth-client creation without credential exposure.
- Admin credential adaptation.

### 5.2 Non-emulator subset

Command:

```powershell
$env:BHUMI_QA_VERCEL = "1"
$env:QA_VERCEL_WIF_POOL_ID = "vercel-qa"
$env:QA_VERCEL_WIF_PROVIDER_ID = "vercel-qa"
$env:QA_VERCEL_SERVICE_ACCOUNT_EMAIL = "qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com"
node --test qa/vercel/tests/config.test.mjs qa/vercel/tests/wif.test.mjs qa/vercel/tests/services.test.mjs qa/vercel/tests/rate-limit.test.mjs
```

Result:

- Exit code: `0`
- Tests: `15`
- Pass: `15`
- Fail: `0`
- Duration: `1117.9155ms`

### 5.3 Static and repository checks

| Check | Result |
| --- | --- |
| `node --check` on all 15 `qa/vercel/**/*.mjs` files | Exit `0`; `CHECKED=15 FAILED=0` |
| `npx tsc --noEmit` | Exit `0`; no output |
| `npm run lint` | Exit `0`; `421 warnings`, `0 errors` |
| `npm run quality:gate` | Exit `0`; `DEVELOPMENT GATE PASS`; `RELEASE GATE BLOCKED` |
| `node -e "import('./qa/vercel/api/healthz.mjs')"` | `API_IMPORT_OK function` |

Quality Gate caveat: the gate still reports `QA ISOLATION: BLOCKED` with the stale detail “Firebase/QA project not configured.” The QA Firebase project exists, but the live QA backend, live token acceptance, revocation, and device proof remain blocked. The release verdict is correct; the QA detail is outdated.

The Quality Gate run regenerated the pre-existing untracked artifact `reports-qualitygate/BHUMI_QUALITY_GATE_REPORT.md`. It is not a source change.

## 6. Deployment blockers and risks

### 6.1 Health route mismatch — definite blocker

`api/healthz.mjs` is exposed by Vercel at `/api/healthz`, but `lib/handler.mjs` recognizes only `/healthz`. A request to `/api/healthz` falls through to `404 NOT_FOUND`.

The local test server calls `/healthz` directly, so the passing tests do not catch this Vercel routing mismatch.

Required before deployment:

- make the handler accept `/api/healthz` (and optionally `/healthz`), or
- add a `vercel.json` rewrite from `/healthz` to `/api/healthz` and keep the contract consistent.

No code change was made in this documentation task.

### 6.2 Outside-root source and dependency boundary — must validate

`qa/vercel/lib/entry.mjs` and `lib/handler.mjs` import `../../backend/lib/server.mjs`, which is outside the intended Vercel Root Directory `qa/vercel`.

Vercel can include source files outside the Root Directory, but the build must also resolve `firebase-admin` from `qa/backend/lib/server.mjs`. Because `qa/vercel/node_modules` is not an ancestor of `qa/backend`, dependency resolution may fail even if the source file is included. Local tests pass because the repository root `node_modules` is present.

Required before deployment:

- make `qa/vercel` self-contained by copying or relocating the shared backend modules, or
- add an explicit package/install boundary that guarantees `qa/backend` dependency resolution, and
- validate with a real Vercel preview build.

This is a validation gate, not a proven failure. It is not deployment-ready until proven.

### 6.3 No lockfile

`qa/vercel` has no `package-lock.json`. Dependency ranges are caret ranges (`^8.6.0`, `^14.0.0`, `^10.7.0`). A build will resolve them at install time.

Required before deployment: generate and commit a lockfile, then use `npm ci`.

### 6.4 GCP WIF and service account not created

The QA Firebase project exists, but these resources do not:

- WIF pool `vercel-qa`.
- OIDC provider `vercel-qa`.
- Service account `qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com`.
- `roles/datastore.user` on the QA project.
- `firebaseauth.users.get` for Auth lookup.
- `roles/iam.serviceAccountTokenCreator` on the service account for the Vercel principal.

No service-account key is required or permitted.

### 6.5 Vercel project, plan, and protection not configured

No QA Vercel project exists. The current team is on Hobby (`$0/month`). Hobby is for personal, non-commercial use only. QA for a commercial product should use Pro:

- Pro platform fee: `$20/month` plus applicable tax.
- Pro includes a `$20/month` usage credit; overage is on-demand.
- Additional developer seats: `$20/user/month`; viewer seats are free.
- No paid add-on is required for this candidate.
- Expected QA usage should fit inside the credit, but this is not a guarantee.

Deployment Protection must be verified before Android testing. Vercel Authentication redirects unauthenticated requests to a Vercel login, which Android cannot complete. Recommended QA configuration:

- use a dedicated custom domain, for example `qa-bootstrap-api.bhumiamartya.my.id` (example only; not configured), and
- use Standard Protection or disable Vercel Authentication for the QA project only, and
- verify with `curl` from a network without Vercel cookies that the endpoint returns JSON, not a login redirect.

Do not put a Protection Bypass secret in the Android app. Password Protection is also unsuitable unless the app implements a password prompt.

### 6.6 Live token and revocation verification not run

No real QA Firebase ID token, live WIF exchange, or live revocation check has been executed. The local tests use synthetic RS256 tokens and a Firestore emulator. `verifyIdToken(token, true)` is wired but not proven against live QA Firebase.

### 6.7 Android runtime not verified

No APK, device install, native Google Sign-In, or device first-login test was run. The QA runtime guard and localhost/cleartext policy must be handled in the separate Android task. Local HTTP success is not device QA.

### 6.8 QA-only route isolation

`/api/qa/bootstrap-first-login` is QA-only. It must not be deployed to the production Vercel project or included in a production release. Production creates the minimal profile on the client and calls the trial-only route.

### 6.9 Operational limits

- Rate limiting is in-memory and per function instance; it is not a global quota.
- No durable audit log, alerting, request-ID correlation, WAF rule, or IP allowlist is implemented.
- The Vercel OIDC token is reused for up to 90 minutes; the function token TTL is two hours.
- Admin SDK access bypasses Firestore client rules.
- No browser or device rendering evidence exists.
- No production deployment, APK, or release is authorized.

### 6.10 Cost risk

The expected QA deployment cost is the Pro platform fee (`$20/month` plus tax) with usage expected to fit the included `$20/month` credit. This is an estimate, not a guarantee. No plan change or purchase was made.

## 7. ONE Founder action and next task

**ONE required Founder action:** approve the single follow-up task **`QA-VERCEL-BACKEND-CANDIDATE-02`** to:

1. Fix the `/api/healthz` routing mismatch.
2. Make `qa/vercel` self-contained or prove the outside-root dependency boundary with a Vercel preview build.
3. Add a `qa/vercel` lockfile.
4. Create the QA-only WIF pool/provider and keyless service account.
5. Create the isolated Vercel QA project on Pro with the required protection/custom-domain configuration.
6. Deploy only to the isolated QA project, then run live synthetic QA token, revocation, and CORS verification.

No deployment is authorized by this report. Without that single approval, the candidate remains local-only.

## 8. Status ledger

- Candidate implementation: **LOCAL PASS**.
- Candidate tests: **23/23 PASS**.
- Non-emulator subset: **15/15 PASS**.
- Vercel build: **NOT RUN**.
- Vercel deployment: **NOT RUN**.
- GCP WIF/service account: **NOT CREATED**.
- Live OIDC/WIF exchange: **NOT RUN**.
- Live Firebase token/revocation: **NOT RUN**.
- Android/device QA: **NOT RUN**.
- APK/export: **NOT AUTHORIZED / NOT RUN**.
- Production Firebase reads/writes: **NONE**.
- Production Vercel metadata: **READ-ONLY AUDIT ONLY** (prior task); no mutation.
- Production changes: **NONE**.
- Commit: **NONE**.
- Quality Gate: **DEVELOPMENT PASS / RELEASE BLOCKED**.
- Release readiness: **NOT CLAIMED**.

Worktree state:

- 70 modified tracked files were present before this task and were preserved.
- This task added two untracked documentation files: `qa/vercel/README.md` and `BHUMI_QA_VERCEL_BACKEND_CANDIDATE_01_REPORT.md`.
- All pre-existing untracked files were preserved.
- The Quality Gate regenerated the pre-existing untracked `reports-qualitygate/BHUMI_QUALITY_GATE_REPORT.md`.
- No tracked file was modified by this documentation task.

## 9. Files changed by this task

Added:

- `qa/vercel/README.md`
- `BHUMI_QA_VERCEL_BACKEND_CANDIDATE_01_REPORT.md`

Generated (pre-existing untracked artifact, regenerated by Quality Gate):

- `reports-qualitygate/BHUMI_QUALITY_GATE_REPORT.md`

No source code was changed by this documentation task. The candidate implementation files under `qa/vercel/` and the shared `qa/backend/` files were created or refactored in prior authorized work and were not modified here.

## 10. Next action

**STOP AND WAIT FOR FOUNDER REVIEW.**

The next authorized task, if approved, is `QA-VERCEL-BACKEND-CANDIDATE-02` as described in Section 7. No deployment is authorized by this report.
