# QA Vercel Bootstrap Backend — Deployment Preparation

**Status: PREPARED FOR ACTIVATION — NOT DEPLOYED — NOT RELEASE READY.**

This directory contains a QA-only Vercel Functions candidate for the first-login access bootstrap. It is not production code. Do not deploy it to the production Vercel project, and do not point it at production Firebase.

The candidate reuses the transaction contract from `qa/backend/` through the local package `@bhumi/qa-backend` and adds:

- Vercel OIDC token handling.
- GCP Workload Identity Federation (WIF) with service-account impersonation.
- Firestore access through `@google-cloud/firestore`.
- Firebase Admin Auth revocation checking through `verifyIdToken(token, true)`.
- CORS, request-size, and per-instance rate-limit boundaries.

Deployment preparation was verified read-only on 2026-10-23. No Vercel project, paid-plan change, GCP WIF pool/provider, service account, IAM binding, custom domain, deployment, APK, or Billing transaction was created.

## Current status

| Item | Status |
| --- | --- |
| Local candidate implementation | **PASS** |
| Candidate tests | **25/25 PASS** |
| Non-emulator subset | **17/17 PASS** |
| `/api/healthz` routing | **PASS LOCALLY** |
| Dependency packaging | **PASS LOCALLY** |
| Clean-room `npm ci` package check | **PASS** |
| Lockfile | **PASS** |
| Actual Vercel team plan | **HOBBY — PRO NOT ACTIVE** |
| Selected QA Vercel project | **`bhumi-qa-bootstrap` — NOT CREATED** |
| QA custom domain | **NOT CONFIGURED** |
| GCP QA billing | **DISABLED (verified 2026-10-23)** |
| WIF APIs | **NOT ENABLED** |
| GCP WIF pool/provider | **NOT CREATED** |
| QA service account | **NOT CREATED** |
| Minimum IAM | **PREPARED — NOT CREATED** |
| Vercel build | **NOT RUN** |
| Vercel deployment | **NOT RUN** |
| Live OIDC/WIF exchange | **NOT RUN** |
| Live Firebase token + revocation | **NOT RUN** |
| Deployed Rules readback | **BLOCKED (403)** |
| Android/device QA | **NOT RUN** |
| Production changes | **NONE** |

## Deployment preparation evidence (read-only, 2026-10-23)

- Vercel team `wizzares-projects` is on **Hobby**; Pro is not active.
- Vercel has 15 projects and none named `bhumi-qa-bootstrap`; no QA project exists.
- Vercel contract commitments: `0`; `vercel usage --json` returns `404` on Hobby.
- Team default protection is Standard Protection (`all_except_custom_domains`).
- GCP QA project `bhumi-amartya-qa` (`125330899891`) is active; billing is disabled.
- WIF pools/providers, `qa-bootstrap` service account, and IAM bindings do not exist.
- `iam.googleapis.com`, `iamcredentials.googleapis.com`, and `sts.googleapis.com` are not enabled.
- Firestore `(default)` exists in `asia-southeast2`; local rules are deny-all.
- Rules API readback returns `403`; no rules mutation was attempted.
- No Vercel project, paid plan, domain, WIF resource, service account, IAM binding, key, deployment, APK, or Billing transaction was created.

Full evidence: `BHUMI_QA_VERCEL_BACKEND_DEPLOYMENT_01_REPORT.md`.

## Purpose

The candidate exists to make the QA first-login flow testable from a real Android device over HTTPS without using production Firebase or production credentials. It is deliberately pinned to the QA project `bhumi-amartya-qa` (`125330899891`) and rejects the production project `bhumiamartya-fe85c`.

## Architecture

```text
Android WebView / QA client
  Authorization: Bearer <Firebase ID token>
        |
        v
Vercel Function (qa/vercel/api/*.mjs)
  - reads x-vercel-oidc-token
  - validates QA config and origin
  - rate-limits POSTs
        |
        v
GCP STS + Workload Identity Federation
  - Vercel OIDC token -> short-lived federated token
  - service-account impersonation
        |
        v
QA service account (no key)
  - custom QA runtime role:
      datastore.entities.get
      datastore.entities.create
      datastore.entities.update
      firebaseauth.users.get
  - WIF principal role: roles/iam.workloadIdentityUser
        |
        +--> Firestore (QA project)
        +--> Firebase Admin Auth verifyIdToken(token, true)
```

The Vercel OIDC token is supplied in the request context, so the candidate creates a short-lived auth client and service instances per request and disposes them afterward. It does not cache credentials across requests. Vercel may reuse the same OIDC token for up to 90 minutes.

## Routes

| Vercel source file | Vercel path | Handler path | Status |
| --- | --- | --- | --- |
| `api/access/bootstrap-trial.mjs` | `/api/access/bootstrap-trial` | `/api/access/bootstrap-trial` | **OK** |
| `api/qa/bootstrap-first-login.mjs` | `/api/qa/bootstrap-first-login` | `/api/qa/bootstrap-first-login` | **OK** |
| `api/healthz.mjs` | `/api/healthz` | `/api/healthz` (local alias `/healthz`) | **OK** |

The handler accepts both `/api/healthz` and `/healthz`. The Vercel path `/api/healthz` is covered by a routing test that invokes the actual `api/healthz.mjs` entrypoint. The health response contains only public QA metadata; it does not contain tokens, credentials, user data, or private configuration.

The QA-only combined route creates a minimal profile and then provisions the canonical trial. It exists only to make first-login QA self-contained. **It must never be exposed as production code.**

## Security boundary

- Requires `BHUMI_QA_VERCEL=1`.
- Pins the project to `bhumi-amartya-qa` and project number `125330899891`.
- Rejects `bhumiamartya-fe85c` and production project values in `FIREBASE_PROJECT_ID`, `GCLOUD_PROJECT`, `GOOGLE_CLOUD_PROJECT`, and `FIREBASE_CONFIG`.
- Rejects `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, and `FIREBASE_SERVICE_ACCOUNT`.
- Uses WIF and short-lived service-account impersonation. No service-account key is created or stored.
- Accepts the OIDC token from the `x-vercel-oidc-token` function header, with `VERCEL_OIDC_TOKEN` only as a local-development fallback.
- Rejects missing or malformed OIDC tokens with `503 QA_BACKEND_UNAVAILABLE` before creating services.
- Restricts CORS to local/Capacitor origins only: `https://localhost`, `http://localhost`, `capacitor://localhost`.
- Requires an empty request body; maximum body size is 16 KiB.
- Returns sanitized outcomes. It does not log tokens, Firebase UIDs, emails, or birth data.
- Uses `verifyIdToken(token, true)` for revocation checking when live Firebase Admin Auth is available.
- The Admin SDK bypasses Firestore client rules by design. The QA Firestore deny-all client rules remain separate and must stay intact.
- The rate limiter is an in-memory fixed window. It is best-effort per function instance, not a global security boundary.

## Configuration

Set these in the Vercel QA project. Do not set production Firebase credentials.

| Variable | Required | Value / default |
| --- | --- | --- |
| `BHUMI_QA_VERCEL` | yes | `1` |
| `QA_VERCEL_PROJECT_ID` | no | `bhumi-amartya-qa` |
| `QA_VERCEL_PROJECT_NUMBER` | no | `125330899891` |
| `QA_VERCEL_WIF_POOL_ID` | yes | `vercel-qa` |
| `QA_VERCEL_WIF_PROVIDER_ID` | yes | `vercel-qa` |
| `QA_VERCEL_SERVICE_ACCOUNT_EMAIL` | yes | `qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com` |
| `QA_VERCEL_ALLOWED_ORIGINS` | no | `https://localhost,http://localhost,capacitor://localhost` |
| `QA_VERCEL_RATE_LIMIT` | no | `60` requests per 60 seconds per instance |
| `QA_VERCEL_FIRESTORE_DATABASE_ID` | no | `(default)` |

Do **not** set `VERCEL_OIDC_TOKEN` manually in Vercel. Vercel injects the function OIDC token. `vercel env pull` may write a local development token to `.env.local`; never commit it.

## Local verification

Firebase CLI 15.18.0 requires Java 21 or newer.

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
npm run test:qa:vercel-backend
```

Install the candidate package boundary once:

```powershell
Set-Location qa/vercel
npm install --no-audit --no-fund --ignore-scripts
Set-Location ../..
```

`install-links=true` copies `qa/backend` into `qa/vercel/node_modules/@bhumi/qa-backend` so the installed package resolves `firebase-admin` from the Vercel root instead of the repository root. The generated `package-lock.json` is part of the candidate.

Result on 2026-10-23:

- Exit code `0`.
- Tests `25`; pass `25`; fail `0`; skipped `0`.
- Firestore emulator `demo-bhumi-qa-bootstrap`.
- Duration approximately `5.7s`.

Non-emulator subset:

```powershell
$env:BHUMI_QA_VERCEL = "1"
$env:QA_VERCEL_PROJECT_ID = "bhumi-amartya-qa"
$env:QA_VERCEL_PROJECT_NUMBER = "125330899891"
$env:QA_VERCEL_WIF_POOL_ID = "vercel-qa"
$env:QA_VERCEL_WIF_PROVIDER_ID = "vercel-qa"
$env:QA_VERCEL_SERVICE_ACCOUNT_EMAIL = "qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com"
node --test qa/vercel/tests/config.test.mjs qa/vercel/tests/wif.test.mjs qa/vercel/tests/services.test.mjs qa/vercel/tests/rate-limit.test.mjs qa/vercel/tests/packaging.test.mjs qa/vercel/tests/routing.test.mjs
```

Result: `17/17 PASS`, exit `0`.

The emulator suite covers the canonical seven-day grant, idempotency, first-login profile creation, higher-entitlement preservation, malformed-state fail-closed behavior, origin/body/auth boundaries, rate limiting, WIF configuration, package boundary, `/api/healthz` routing, and service disposal. It does not cover live WIF exchange, live Firebase revocation, an actual Vercel build, or Android runtime.

## Deployment prerequisites

### 1. Health route — resolved locally

`lib/handler.mjs` and the shared QA backend accept both `/api/healthz` and `/healthz`. A routing test invokes the actual `api/healthz.mjs` entrypoint at `/api/healthz` and verifies `200`, the QA project ID, and the absence of private data. No unrelated production route was changed.

### 2. Dependency boundary — resolved locally; one Vercel project setting remains

`qa/vercel/lib/entry.mjs` and `lib/handler.mjs` now import `@bhumi/qa-backend/server` instead of `../../backend/lib/server.mjs`. `qa/backend/package.json` exposes the verified shared implementation, and `qa/vercel/package.json` depends on `"@bhumi/qa-backend": "file:../backend"`.

`qa/vercel/.npmrc` sets `install-links=true`. This forces npm to copy the local package into `qa/vercel/node_modules/@bhumi/qa-backend` instead of creating a symlink, so `firebase-admin` resolves from `qa/vercel/node_modules`. A clean-room `npm ci` with only `qa/vercel` and `qa/backend` passed.

The Vercel project must still enable "Include source files outside of the Root Directory in the Build Step" so `../backend` is available during install. A real Vercel preview build is still required to confirm the platform honors this boundary.

### 3. Lockfile — resolved

`qa/vercel/package-lock.json` is present. Use `npm ci` for a reproducible install.

### 4. GCP WIF and service account not created

Read-only inspection on 2026-10-23 confirmed:

- QA project `bhumi-amartya-qa` (`125330899891`) is `ACTIVE`.
- QA billing is disabled: `billingEnabled: false`, no billing account.
- Firestore `(default)` exists in `asia-southeast2`, `FIRESTORE_NATIVE`, `STANDARD`, `PESSIMISTIC`.
- WIF pools: none (`[]`).
- Service account `qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com`: `NOT_FOUND`.
- APIs not enabled: `iam.googleapis.com`, `iamcredentials.googleapis.com`, `sts.googleapis.com`.
- No `qa-bootstrap` IAM binding or key exists.
- The existing Firebase Admin SDK service account is present but is not selected or used.
- Rules release readback is blocked with `403`; local `qa/firebase/firestore.rules` remains deny-all.

No service-account key is needed or permitted. Minimum runtime permissions are prepared, not created.

### 5. Vercel project, plan, and protection not configured

No QA Vercel project exists. Read-only Vercel inspection confirmed:

- team `wizzares-projects` (`team_8vojTcMSw0zsRVCmCVaK39AB`);
- actual billing plan `hobby`, status `active`, `createdDirectToHobby: true`;
- one member, role `OWNER`;
- `15` projects, none named `bhumi-qa-bootstrap` or matching `*qa*`;
- `vercel contract --json`: `totalCommitments: 0`;
- `vercel usage --json`: `Costs not found (404)`;
- team default Deployment Protection: `all_except_custom_domains` (Standard Protection).

Hobby is `$0/month` but is for personal, non-commercial use only. QA for a commercial product requires Pro:

- Pro base: `$20/month` plus applicable tax, excluding VAT/GST.
- Pro includes a `$20/month` usage credit; usage beyond it is on-demand.
- The team has one owner; additional developer seats are `$20/user/month`; viewer seats are free.
- Standard Protection / Vercel Authentication and OIDC federation are included; no paid add-on is required for this candidate.
- Password Protection is not needed and would add `$20/project/month`.
- Expected QA usage may fit inside the credit, but no usage measurement or guarantee exists.

Selected project name is `bhumi-qa-bootstrap`, Root Directory `qa/vercel`. It was not created. Recommended QA protection:

- use `qa-bootstrap-api.bhumiamartya.my.id` as the dedicated production custom domain; DNS ownership/availability was not checked and it is not configured;
- keep Standard Protection with Vercel Authentication enabled for preview/deployment URLs;
- do not put a Protection Bypass secret in Android and do not disable protection team-wide;
- verify from a network without Vercel cookies that the custom-domain endpoint returns JSON, not a login redirect.

Deployment Protection must be verified before Android testing. Do not put a Protection Bypass secret in the Android app. Password Protection is also unsuitable unless the app implements a password prompt.

### 6. Live token and revocation verification not run

No real QA Firebase ID token, live WIF exchange, or live revocation check has been executed. The local tests use synthetic RS256 tokens and an emulator. `verifyIdToken(token, true)` is wired but not proven against live QA Firebase.

### 7. Android runtime not verified

No APK, device install, native Google Sign-In, or device first-login test was run. The QA runtime guard and localhost/cleartext policy must be handled in the separate Android task. Local HTTP success is not device QA.

### 8. QA-only route isolation

`/api/qa/bootstrap-first-login` is QA-only. It must not be deployed to the production Vercel project or included in a production release. Production creates the minimal profile on the client and calls the trial-only route.

## Future deployment runbook (only after the blockers are fixed)

This runbook is for a separately authorized QA deployment. It is not authorization to deploy now.

### A. GCP WIF and service account

Use the QA project only. Replace the team slug/project name if the actual Vercel identifiers differ.

These commands are prepared but were **not executed**. Do not run them until the Founder authorizes activation.

```bash
gcloud services enable \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  --project=bhumi-amartya-qa

gcloud iam workload-identity-pools create vercel-qa \
  --project=bhumi-amartya-qa \
  --location=global \
  --display-name="Vercel QA"

gcloud iam workload-identity-pools providers create-oidc vercel-qa \
  --project=bhumi-amartya-qa \
  --location=global \
  --workload-identity-pool=vercel-qa \
  --display-name="Vercel QA" \
  --issuer-uri="https://oidc.vercel.com/wizzares-projects" \
  --allowed-audiences="https://vercel.com/wizzares-projects" \
  --attribute-mapping="google.subject=assertion.sub" \
  --attribute-condition="assertion.sub=='owner:wizzares-projects:project:bhumi-qa-bootstrap:environment:production'"

gcloud iam service-accounts create qa-bootstrap \
  --project=bhumi-amartya-qa \
  --display-name="QA Vercel bootstrap"
```

Set the Vercel project OIDC issuer mode to **Team**, so the token issuer is `https://oidc.vercel.com/wizzares-projects`. Use **Allowed audiences**, not the GCP default audience. The candidate consumes the Vercel OIDC token as-is and does not call `getVercelOidcToken({ audience })`. If the provider uses the default audience, the code would need to request that audience explicitly.

The `audience` in `buildExternalAccountConfig` is the GCP provider resource name used for STS. It is not the OIDC token's `aud` claim.

Grant minimum runtime permissions with one custom role. The code uses only transaction `get`/`set` on `users/{uid}` and Admin Auth `getUser` for revocation:

```bash
gcloud iam roles create qaBootstrapRuntime \
  --project=bhumi-amartya-qa \
  --title="QA Bootstrap Runtime" \
  --description="Minimum Firestore and Firebase Auth access for QA bootstrap" \
  --permissions=datastore.entities.get,datastore.entities.create,datastore.entities.update,firebaseauth.users.get \
  --stage=GA

gcloud projects add-iam-policy-binding bhumi-amartya-qa \
  --member="serviceAccount:qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com" \
  --role="projects/bhumi-amartya-qa/roles/qaBootstrapRuntime"

gcloud iam service-accounts add-iam-policy-binding qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com \
  --project=bhumi-amartya-qa \
  --member="principal://iam.googleapis.com/projects/125330899891/locations/global/workloadIdentityPools/vercel-qa/subject/owner:wizzares-projects:project:bhumi-qa-bootstrap:environment:production" \
  --role="roles/iam.workloadIdentityUser"
```

`roles/iam.workloadIdentityUser` is the GCP WIF service-account impersonation role and includes `iam.serviceAccounts.getAccessToken`/`getOpenIdToken`. The earlier `roles/iam.serviceAccountTokenCreator` prerequisite is superseded: it includes broader permissions (`signJwt`, `signBlob`, `implicitDelegation`, project reads) and is not required.

Do not create a service-account key. If an organization policy permits, enforce `iam.disableServiceAccountKeyCreation`.

### B. Vercel project

1. Upgrade the team to Pro first; Hobby is non-commercial and the selected QA project cannot be activated on Hobby.
2. Create a separate Vercel project named `bhumi-qa-bootstrap` (verified available; not created) in team `wizzares-projects`.
3. Set Root Directory to `qa/vercel`.
4. Framework Preset: Other.
5. Node.js: 24.x.
6. Install Command: `npm ci`.
7. Build Command: empty; this candidate has no build step.
8. Enable “Include source files outside of the Root Directory in the Build Step” so `file:../backend` is available during install.
9. Add the environment variables from the table above to the Production environment only.
10. Set Settings → Security → OIDC issuer mode to **Team**.
11. Do not add production Firebase credentials, `FIREBASE_PRIVATE_KEY`, or `GOOGLE_APPLICATION_CREDENTIALS`.
12. Keep Standard Protection + Vercel Authentication and attach `qa-bootstrap-api.bhumiamartya.my.id` as the production custom domain.
13. Verify the custom-domain endpoint is not a Vercel login redirect and does not require a Protection Bypass secret.

### C. Verification after deployment

Use synthetic QA accounts only. Never use production users.

1. `GET /api/healthz` returns `200` and `projectId: "bhumi-amartya-qa"`.
2. `OPTIONS /api/access/bootstrap-trial` with `Origin: https://localhost` returns `204` and the matching `Access-Control-Allow-Origin`.
3. `POST /api/access/bootstrap-trial` with no Firebase token returns `401 AUTH_MISSING`.
4. `POST` with `Origin: https://evil.example` returns `403 ORIGIN_NOT_ALLOWED`.
5. `POST` with a valid QA Firebase token returns `200 PROVISIONED` or `200 ALREADY_PRESENT`; verify the canonical seven-day grant in QA Firestore.
6. Revoke the QA test user's refresh tokens, retry, and confirm `401 AUTH_INVALID` (revocation path).
7. Confirm responses and Vercel logs contain no tokens, UIDs, emails, birth data, or credentials.
8. Confirm the production project `bhumiamartya-fe85c` is never contacted.

### D. Rollback

- Promote the previous Vercel deployment or delete the QA project.
- Remove the custom domain.
- Delete the WIF provider/pool and QA service account after testing.
- Do not touch production Vercel projects, production Firebase, HD, or Billing.

## Operational limits

- Rate limiting is in-memory and per instance; it is not a global quota.
- No durable audit log, alerting, request-ID correlation, WAF rule, or IP allowlist is implemented.
- The Vercel OIDC token is reused for up to 90 minutes; the function token TTL is two hours.
- Admin SDK access bypasses Firestore client rules.
- No live token, WIF, revocation, browser, or device evidence exists yet.
- No production deployment, APK, or release is authorized.

## Troubleshooting

| Response | Likely cause |
| --- | --- |
| `503 QA_BACKEND_UNAVAILABLE` | Missing/malformed `x-vercel-oidc-token`, WIF/provider/audience mismatch, missing `roles/iam.workloadIdentityUser` principal binding, missing runtime IAM permission, or service initialization failure. |
| `401 AUTH_INVALID` | Invalid, expired, wrong-project, or revoked Firebase ID token. |
| `401 AUTH_MISSING` | No `Authorization: Bearer` header. |
| `403 ORIGIN_NOT_ALLOWED` | Origin is not exactly one of the configured local/Capacitor origins. |
| `429 RATE_LIMITED` | Per-instance fixed-window limit exceeded; retry after the window. |
| `404 NOT_FOUND` | Wrong path or a route not present in this QA candidate. |
| `409 DATA_CONFLICT` | Malformed or untrusted trial state in QA Firestore. Inspect the synthetic QA user only. |
| `500 RETRYABLE_ERROR` | Transaction or unexpected server failure; retry and inspect sanitized logs. |

## Files

- `api/access/bootstrap-trial.mjs`
- `api/qa/bootstrap-first-login.mjs`
- `api/healthz.mjs`
- `lib/config.mjs`
- `lib/wif.mjs`
- `lib/services.mjs`
- `lib/handler.mjs`
- `lib/rate-limit.mjs`
- `lib/entry.mjs`
- `tests/config.test.mjs`
- `tests/wif.test.mjs`
- `tests/services.test.mjs`
- `tests/rate-limit.test.mjs`
- `tests/packaging.test.mjs`
- `tests/routing.test.mjs`
- `tests/handler.integration.test.mjs`
- `run-emulator-tests.mjs`
- `package.json`
- `package-lock.json`
- `.npmrc`
- `vercel.json`
- `.env.example`
- `.vercelignore`

Shared code reused through `@bhumi/qa-backend` from `qa/backend/lib/`:

- `server.mjs`
- `first-login.mjs`
- `bootstrap-contract.mjs`
- `token-verifier.mjs`

The local package definition is `qa/backend/package.json`.

## References

- Vercel OIDC: https://vercel.com/docs/oidc
- Vercel GCP OIDC: https://vercel.com/docs/oidc/gcp
- Vercel Node.js runtime: https://vercel.com/docs/functions/runtimes/node-js
- Vercel monorepos: https://vercel.com/docs/monorepos
- Vercel Deployment Protection: https://vercel.com/docs/deployment-protection
- Vercel pricing: https://vercel.com/pricing
- Local harness report: `BHUMI_QA_BACKEND_BOOTSTRAP_LOCAL_01_REPORT.md`
- Candidate 01 report: `BHUMI_QA_VERCEL_BACKEND_CANDIDATE_01_REPORT.md`
- Candidate 02 report: `BHUMI_QA_VERCEL_BACKEND_CANDIDATE_02_REPORT.md`
- Deployment preparation report: `BHUMI_QA_VERCEL_BACKEND_DEPLOYMENT_01_REPORT.md`
- GCP WIF deployment pipelines: https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines
- GCP WIF service-account impersonation: https://cloud.google.com/iam/docs/workload-identity-federation#impersonation
