# BHUMI QA VERCEL BACKEND - DEPLOYMENT PREPARATION 01 REPORT

Date: 2026-10-23

Worktree: `C:\tmp\bhumi-build106-recovery`

Branch: `hotfix/build110-indonesian-only`

HEAD: `e63f334cf0ac20cc076bc88e98e3e06808b024f3`

Authorization: `QA-VERCEL-BACKEND-DEPLOYMENT-01` - final deployment preparation only. Deployment was not authorized.

## 1. Verdict

Final deployment preparation: **PASS**.

Actual Vercel plan: **HOBBY**. Pro is not active.

Selected isolated QA Vercel project: **`bhumi-qa-bootstrap`** (not created).

WIF/service-account readiness: **CONFIGURATION PREPARED - RESOURCES ABSENT**.

Deployment readiness: **BLOCKED**.

Release readiness: **NOT CLAIMED**.

No Vercel project, paid-plan change, custom domain, GCP WIF pool/provider, service account, IAM binding, service-account key, deployment, APK, Billing transaction, production Firebase change, or Git commit was created or performed.

## 2. Scope and constraints honored

Work performed:

- Read-only Vercel plan, team, member, project, contract, usage, and protection inspection.
- Read-only GCP QA project, billing, API, WIF, service-account, IAM, and Firestore inspection.
- Read-only Firestore Rules release attempt.
- Local candidate test, static, lint, TypeScript, clean-room, and Quality Gate execution.
- Preparation of exact WIF/IAM/environment/protection configuration.
- Documentation updates only.

Constraints honored:

- No Vercel deployment, project creation, plan upgrade, purchase, or domain change.
- No GCP IAM/WIF/service-account/API mutation.
- No service-account key creation, copy, read, or exposure.
- No production Firebase, production Vercel project, Human Design, Billing, or Play change.
- No APK, native sign-in, device install, or device QA.
- No reset, clean, stash, rebase, checkout, branch switch, or new worktree.
- No commit or push.
- No Candidate 01/02 audit rerun, historical review, Gradle investigation, or OAuth setup rerun.
- No real UID, email, birth data, token, credential, or Vercel PII recorded.

## 3. Actual Vercel plan and cost

### 3.1 Verified team state

Read-only `vercel api /v2/teams/team_8vojTcMSw0zsRVCmCVaK39AB` returned:

- Team: `wizzares-projects`.
- Team ID: `team_8vojTcMSw0zsRVCmCVaK39AB`.
- Billing plan: `hobby`.
- Billing status: `active`.
- `createdDirectToHobby: true`.
- Plan iteration: `legacy`.
- Members: `1`, role `OWNER`.
- Contract commitments: `0`.
- `vercel usage --json`: `Costs not found (404)`.
- Team default Deployment Protection: `all_except_custom_domains` (Standard Protection).
- Projects: `15`; no project named `bhumi-qa-bootstrap`; no project name matching `*qa*`.
- `vercel project inspect bhumi-qa-bootstrap`: `There is no project for "bhumi-qa-bootstrap"`.

The top-level team API fields `plan` and `status` were `null`; the authoritative billing object returned `"plan": "hobby"` and `"status": "active"`. This is why the report uses the billing object, not the top-level fields.

### 3.2 Cost implications

Current Hobby cost: **$0/month**.

Pro cost: **$20/month plus applicable tax**, excluding VAT/GST. Pro includes a **$20/month usage credit**. Usage beyond the credit is on-demand. The team has one owner; additional developer seats are `$20/user/month`; viewer seats are free. Standard Protection / Vercel Authentication and OIDC federation do not require a paid add-on. Password Protection is not needed and would add `$20/project/month`.

Hobby is for personal, non-commercial use. The Bhumi QA deployment is for a commercial product, so Hobby is not a valid activation target. The minimum paid-plan cost is therefore **$20/month plus tax**, not `$0`.

No usage estimate, spend cap, or invoice was verified. Expected low-volume QA traffic may fit inside the `$20` credit, but this is not a guarantee. No plan upgrade or purchase occurred.

## 4. Selected isolated QA project

Selected project name: **`bhumi-qa-bootstrap`**.

Selected Root Directory: **`qa/vercel`**.

Why this target:

- It is a new, standalone Vercel project, not a production Vercel project.
- It does not reuse the human-design, Billing, application, or other existing deployments.
- It contains the QA-only handler and the QA-only combined bootstrap route.
- The QA-only combined route stays inside this isolated QA project only; it is never added to the production Bhumi app or production Vercel project.
- The project is pinned by code and configuration to `bhumi-amartya-qa` and rejects `bhumiamartya-fe85c`.

No project was created. The name is available in the team at inspection time.

Recommended production domain: `qa-bootstrap-api.bhumiamartya.my.id`. It is a candidate only; DNS ownership, availability, and DNS propagation were not verified. No domain or DNS record was created or changed.

## 5. GCP WIF and service-account readiness

### 5.1 Current external state

Read-only inspection on 2026-10-23 confirmed:

- QA project `bhumi-amartya-qa`, number `125330899891`, lifecycle `ACTIVE`.
- QA billing: `billingEnabled: false`, `billingAccountName: ""`.
- Billing check command: `gcloud billing projects describe bhumi-amartya-qa --billing-project=bhumi-amartya-qa`.
- The `--billing-project` flag was required because Cloud Billing API is disabled on the production quota project `bhumiamartya-fe85c`; no production API was enabled.
- Firestore `(default)`: `FIRESTORE_NATIVE`, `STANDARD`, `asia-southeast2`, `PESSIMISTIC`.
- WIF pools: none (`[]`).
- Service account `qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com`: `NOT_FOUND`.
- APIs not enabled: `iam.googleapis.com`, `iamcredentials.googleapis.com`, `sts.googleapis.com`.
- No `qa-bootstrap` IAM binding or key exists.
- An existing Firebase Admin SDK service account and its pre-existing roles are present in the QA project; it is not selected, used, or modified.
- No `qa-bootstrap` role, principal binding, or key was created.
- Rules release readback returned `403 Forbidden`; no rules mutation was attempted.
- Local `qa/firebase/firestore.rules` remains deny-all for client reads/writes.

### 5.2 Prepared WIF provider

| Setting | Prepared value |
| --- | --- |
| Pool ID | `vercel-qa` |
| Provider ID | `vercel-qa` |
| Issuer mode | Team |
| Issuer URI | `https://oidc.vercel.com/wizzares-projects` |
| Allowed audience | `https://vercel.com/wizzares-projects` |
| Attribute mapping | `google.subject=assertion.sub` |
| Attribute condition | `assertion.sub=='owner:wizzares-projects:project:bhumi-qa-bootstrap:environment:production'` |
| Principal | `principal://iam.googleapis.com/projects/125330899891/locations/global/workloadIdentityPools/vercel-qa/subject/owner:wizzares-projects:project:bhumi-qa-bootstrap:environment:production` |
| STS URL | `https://sts.googleapis.com/v1/token` |
| Impersonation URL | `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com:generateAccessToken` |
| Provider resource | `//iam.googleapis.com/projects/125330899891/locations/global/workloadIdentityPools/vercel-qa/providers/vercel-qa` |

Use **Allowed audiences**, not the GCP default audience. The candidate reads the Vercel OIDC token from `x-vercel-oidc-token` (or `VERCEL_OIDC_TOKEN`) as-is and does not call `getVercelOidcToken({ audience })`.

The `audience` passed to `ExternalAccountClient` is the GCP provider resource name used by STS. It is not the OIDC token's `aud` claim.

Set the Vercel QA project OIDC issuer mode to **Team** before deploying. If the project uses Global issuer, the provider issuer would need to change to `https://oidc.vercel.com`, which is less specific and is not the prepared design.

### 5.3 Minimum IAM

The earlier Candidate 01/02 and README prerequisite used `roles/iam.serviceAccountTokenCreator`. Deployment preparation supersedes that with the official, narrower WIF impersonation role:

- **`roles/iam.workloadIdentityUser`** on the QA service account for the exact Vercel principal.
- This role includes `iam.serviceAccounts.getAccessToken` and `iam.serviceAccounts.getOpenIdToken`.
- `roles/iam.serviceAccountTokenCreator` additionally includes `signJwt`, `signBlob`, `implicitDelegation`, and project reads; it is not required.

Runtime service-account permissions are minimized to one custom project role:

- `datastore.entities.get`
- `datastore.entities.create`
- `datastore.entities.update`
- `firebaseauth.users.get`

These cover the observed code path: Firestore transaction `get`/`set` on `users/{uid}` and Admin Auth `getUser` for `verifyIdToken(token, true)` revocation checking. The code does not list, query, delete, or allocate Firestore IDs.

No `datastore.entities.delete`, `datastore.entities.list`, `datastore.entities.allocateIds`, `firebaseauth.users.list`, or broad Firebase Admin role is required by the current code.

No service-account key is needed or permitted.

### 5.4 Prepared commands (not executed)

These commands are prepared for a separately authorized activation. They were **not executed**.

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

Do not create a service-account key. If an organization policy permits, enforce `iam.disableServiceAccountKeyCreation`; this was not changed.

### 5.5 Runtime authentication flow

1. Vercel invokes the QA function and supplies an OIDC token in `x-vercel-oidc-token`; `VERCEL_OIDC_TOKEN` is a fallback.
2. The handler validates the QA configuration, origin, body, and rate limit.
3. The candidate builds a keyless `external_account` credential with the GCP provider resource, STS URL, and service-account impersonation URL.
4. GCP validates the Vercel issuer, audience, and exact production-project subject condition.
5. GCP returns a short-lived access token for `qa-bootstrap`.
6. Firestore operations run against `bhumi-amartya-qa`; Admin Auth runs `verifyIdToken(token, true)` for revocation.
7. No long-lived key or cached credential is used.

## 6. Deployment settings and environment

### 6.1 Vercel project settings

- Plan: Pro required before activation.
- Project: `bhumi-qa-bootstrap`.
- Team: `wizzares-projects`.
- Root Directory: `qa/vercel`.
- Framework Preset: Other.
- Node.js: 24.x.
- Install Command: `npm ci`.
- Build Command: empty; no build step.
- Output Directory: default.
- Enable "Include source files outside of the Root Directory in the Build Step" so `file:../backend` is available.
- OIDC issuer mode: Team.
- Environment: Production only.
- Deployment Protection: Standard Protection + Vercel Authentication for preview/deployment URLs.
- Production custom domain: `qa-bootstrap-api.bhumiamartya.my.id` (not configured).
- No Protection Bypass secret in Android.
- No production Vercel project reuse.

### 6.2 Environment variables

Set only in the isolated QA project's Production environment:

```text
BHUMI_QA_VERCEL=1
QA_VERCEL_PROJECT_ID=bhumi-amartya-qa
QA_VERCEL_PROJECT_NUMBER=125330899891
QA_VERCEL_WIF_POOL_ID=vercel-qa
QA_VERCEL_WIF_PROVIDER_ID=vercel-qa
QA_VERCEL_SERVICE_ACCOUNT_EMAIL=qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com
QA_VERCEL_ALLOWED_ORIGINS=https://localhost,http://localhost,capacitor://localhost
QA_VERCEL_RATE_LIMIT=60
QA_VERCEL_FIRESTORE_DATABASE_ID=(default)
```

Do not set `VERCEL_OIDC_TOKEN` manually. Do not set `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, or `FIREBASE_SERVICE_ACCOUNT`.

### 6.3 Protection and domain

Standard Protection protects preview and deployment URLs. A dedicated production custom domain is required for Android access. The generated `*.vercel.app` production URL should not be used as the Android endpoint.

The custom domain was not configured. DNS ownership and availability were not verified. The Vercel domain UI must be used to obtain the exact DNS target and verify propagation.

No paid password-protection add-on is required. Do not disable protection team-wide.

## 7. Local verification

Environment: Node.js 24.19.0; Firebase CLI 15.18.0; Java 21.0.10 from Android Studio JBR (the default `java` was 17, which Firebase CLI rejects).

Commands and results:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
npm run test:qa:vercel-backend
```

Result: `25/25 PASS`, exit `0`, Firestore emulator `demo-bhumi-qa-bootstrap`.

```powershell
node --test qa/vercel/tests/config.test.mjs qa/vercel/tests/wif.test.mjs qa/vercel/tests/services.test.mjs qa/vercel/tests/rate-limit.test.mjs qa/vercel/tests/packaging.test.mjs qa/vercel/tests/routing.test.mjs
```

Result: `17/17 PASS`, exit `0`.

Clean-room package boundary, using a temporary directory containing only `qa/vercel` and `qa/backend`:

```powershell
npm ci --no-audit --no-fund --ignore-scripts
node --test tests/packaging.test.mjs tests/routing.test.mjs
```

Result: `npm ci` exit `0` (191 packages; two deprecation warnings), package/routing `2/2 PASS`, exit `0`. Temporary directory removed after success.

Other results:

- `node --check` all 17 candidate `.mjs` files: `17/17 PASS`, exit `0`.
- `npx tsc --noEmit`: exit `0`.
- `npm run lint`: exit `0`, `421 warnings`, `0 errors`.
- `npm run quality:gate`: exit `0`, `DEVELOPMENT GATE PASS`, `RELEASE GATE BLOCKED`.
- Quality Gate still reports stale `QA ISOLATION: BLOCKED` text ("Firebase/QA project not configured"); the QA project exists, but live backend runtime remains blocked.
- Invocation note: `npm test` inside `qa/vercel` is not the documented root command because `run-emulator-tests.mjs` resolves `qa/firebase/firebase.json` relative to the repository root. The root command `npm run test:qa:vercel-backend` passed.

These tests do not prove live OIDC/WIF exchange, live Firebase revocation, Vercel platform behavior, Firestore Rules enforcement, Android runtime, or deployment.

## 8. Validation matrix

| Item | Result | Evidence |
| --- | --- | --- |
| QA Firebase project active | **PASS** | `gcloud projects describe` |
| QA billing disabled | **PASS** | `billingEnabled: false` |
| QA Firestore target | **PASS** | `(default)`, `asia-southeast2`, `FIRESTORE_NATIVE` |
| Local Firestore rules deny-all | **PASS (local file)** | `qa/firebase/firestore.rules` |
| Deployed rules readback | **BLOCKED** | Rules API `403` |
| Vercel QA project exists | **NO** | 15 projects, none matching |
| Vercel plan | **HOBBY** | team billing API |
| Pro availability | **NO** | Hobby is active |
| WIF APIs enabled | **NO** | `iam`, `iamcredentials`, `sts` absent |
| WIF pool/provider | **NO** | empty list |
| QA service account | **NO** | `NOT_FOUND` |
| Minimum IAM | **PREPARED** | commands in Section 5.4 |
| Service-account key | **NONE** | no key created or read |
| Vercel build | **NOT RUN** | no project |
| Outside-root setting | **NOT CONFIGURED** | no project |
| Custom domain | **NOT CONFIGURED** | no project/domain |
| Deployment Protection | **TEAM DEFAULT ONLY** | project not created |
| Live OIDC/WIF exchange | **NOT RUN** | no external resources |
| Live Firebase ID token | **NOT RUN** | no live user |
| Live revocation | **NOT RUN** | no live user |
| Android/device QA | **NOT RUN** | no APK/device |
| Production isolation | **CODE-LEVEL PASS** | config rejects production values |
| Billing routes | **ABSENT** | `qa/vercel` route inspection |
| Production changes | **NONE** | no external mutation |

## 9. Exact remaining blockers

1. Vercel team is on Hobby. Hobby is non-commercial and cannot be the activation target. Pro is `$20/month` plus tax.
2. No Vercel QA project `bhumi-qa-bootstrap` exists.
3. No Vercel Pro plan, project, custom domain, or project-level protection is configured.
4. `iam.googleapis.com`, `iamcredentials.googleapis.com`, and `sts.googleapis.com` are not enabled on the QA project.
5. No WIF pool `vercel-qa` or provider `vercel-qa` exists.
6. No `qa-bootstrap` service account or minimum IAM role exists.
7. No WIF principal binding exists; the prepared role is `roles/iam.workloadIdentityUser`.
8. The actual Vercel build and outside-root source setting have not been exercised.
9. Live OIDC/WIF exchange and service-account impersonation have not run.
10. Live QA Firebase ID-token verification and revocation checking have not run.
11. Firestore deployed-rules readback is blocked with `403`; only local deny-all and historical release evidence exist.
12. Custom-domain DNS ownership/availability and Android reachability are unverified.
13. Android/device QA, native sign-in, APK/export, localhost/cleartext runtime, and Billing-policy checks remain unrun.
14. Actual Pro usage beyond the `$20` credit is unknown; no spend cap was verified.
15. The current task does not authorize deployment or cost.

## 10. One Founder decision required for activation

The current `QA-VERCEL-BACKEND-DEPLOYMENT-01` approval covers preparation only. A single, separate Founder activation decision is required:

**Authorize `QA-VERCEL-BACKEND-ACTIVATION-01` to upgrade the Vercel team to Pro at `$20/month` plus tax, enable the three GCP APIs, create the WIF pool/provider, service account, minimum custom role and principal binding, create the isolated `bhumi-qa-bootstrap` project and custom domain, deploy the QA backend, and run live synthetic QA verification.**

This is one bundled decision. It does not authorize APK/device work, native sign-in, Billing/Play, production Firebase, production Vercel changes, or release. If the Founder does not approve the Pro cost, activation cannot proceed.

No action was taken on this decision.

## 11. Changes and worktree state

Files created or updated by this preparation:

- `BHUMI_QA_VERCEL_BACKEND_DEPLOYMENT_01_REPORT.md` (new).
- `qa/vercel/README.md` (deployment-preparation status, actual plan/cost, minimum IAM correction, prepared commands).
- `BUILD_106_MASTER_SOT.md` (appended record).
- `BHUMI_MASTER_PROJECT_CHECKLIST.md` (appended record).
- `BHUMI_MASTER_GAP_AND_RISK_REGISTER.md` (appended record; date preserved).
- `BHUMI_REMAINING_WORK_EXECUTION_PLAN.md` (appended record).
- `reports-qualitygate/BHUMI_QUALITY_GATE_REPORT.md` (regenerated).

No application source, Billing, Human Design, APK, Android, or Vercel deployment code was changed.

The pre-existing unrelated modified tracked files and existing untracked files were preserved. This preparation's only tracked change is `BUILD_106_MASTER_SOT.md`; final status is 70 modified tracked files and 128 untracked status entries. No commit, push, reset, clean, stash, checkout, rebase, or branch switch occurred.

## 12. References

- Vercel OIDC: https://vercel.com/docs/oidc
- Vercel GCP OIDC: https://vercel.com/docs/oidc/gcp
- Vercel Deployment Protection: https://vercel.com/docs/deployment-protection
- Vercel pricing: https://vercel.com/pricing
- GCP WIF deployment pipelines: https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines
- GCP WIF service-account impersonation: https://cloud.google.com/iam/docs/workload-identity-federation#impersonation
- Candidate 02 report: `BHUMI_QA_VERCEL_BACKEND_CANDIDATE_02_REPORT.md`
- Deployment runbook: `qa/vercel/README.md`

**STOP AND WAIT FOR FOUNDER REVIEW.**
