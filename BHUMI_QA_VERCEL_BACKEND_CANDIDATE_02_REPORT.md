# BHUMI QA VERCEL BACKEND CANDIDATE 02 REPORT

Date: 2026-10-23

Worktree: `C:\tmp\bhumi-build106-recovery`

Branch: `hotfix/build110-indonesian-only`

HEAD: `e63f334cf0ac20cc076bc88e98e3e06808b024f3`

## 1. Verdict

Local isolated Vercel QA candidate: **PASS**.

Local deployment candidate readiness: **READY**.

Vercel deployment readiness: **BLOCKED** on external resources and live validation.

Release readiness: **NOT CLAIMED**.

The two Candidate 01 local blockers are resolved and verified locally:

- `/api/healthz` now resolves through the actual Vercel entrypoint.
- The outside-root dependency boundary is now an explicit local package boundary with a lockfile and clean-room install proof.

No Vercel project, GCP WIF pool/provider, service account, deployment, APK, device login, production Firebase access, production change, Billing transaction, or Git commit was created or performed. The actual Vercel preview build, outside-root source setting, live OIDC/WIF exchange, live Firebase revocation, and Android/device QA remain unverified.

## 2. Scope and constraints honored

Authorized work for this report:

- Fix the `/api/healthz` routing mismatch.
- Resolve and validate the outside-root dependency boundary.
- Add the Candidate lockfile.
- Run local candidate tests, TypeScript, lint, and Quality Gate.
- Update `qa/vercel/README.md`, this report, and the authorized master trackers.
- Stop before any Vercel deployment.

Constraints honored:

- No reset, clean, stash, rebase, checkout, or branch switch.
- No new worktree.
- No overwrite of unrelated modified or untracked files.
- No commit or push.
- No Vercel project creation, preview build, or deployment.
- No GCP resource creation.
- No service-account key creation, copy, or exposure.
- No production Firebase, Human Design, or Billing change.
- No APK build, install, launch, or device test.
- No real Google Sign-In or Billing transaction.
- No real user identifiers, emails, birth data, tokens, credentials, or Vercel PII recorded.
- The pre-existing 70 modified tracked files were preserved.
- The pre-existing modified root `package.json` was not changed by this task.

## 3. What changed

### 3.1 Health routing

`qa/backend/lib/server.mjs` now recognizes both:

- `/healthz`
- `/api/healthz`

`qa/vercel/lib/handler.mjs` uses the same shared health route set. The actual Vercel entrypoint `api/healthz.mjs` is now exercised directly by `qa/vercel/tests/routing.test.mjs`.

The health response contains only public QA metadata:

- `ok`
- `service`
- `projectId`
- `issuer`
- `audience`
- `firstLoginRoute`

It contains no Firebase token, OIDC token, service-account data, email, UID, or user data. `firestoreHost` is intentionally absent because the Vercel config does not define it.

### 3.2 Dependency packaging

The shared bootstrap implementation is now packaged as `@bhumi/qa-backend`:

- `qa/backend/package.json` is new.
- Package name/version: `@bhumi/qa-backend@1.0.0`.
- Package export: `"./server": "./lib/server.mjs"`.
- Package files: `lib/`.
- Package dependency: `firebase-admin` `^14.0.0`.
- `qa/vercel/package.json` depends on `"@bhumi/qa-backend": "file:../backend"`.
- `qa/vercel/lib/entry.mjs` and `qa/vercel/lib/handler.mjs` import `@bhumi/qa-backend/server`.
- `qa/vercel/.npmrc` sets `install-links=true`.
- `qa/vercel/package-lock.json` is generated and present.

`install-links=true` is required because npm otherwise installs a local `file:` dependency as a symlink/junction. Node then resolves the real path back to `qa/backend`, where `firebase-admin` is not present. With link installation disabled, npm copies the package into `qa/vercel/node_modules/@bhumi/qa-backend`, and `firebase-admin` resolves from `qa/vercel/node_modules`.

### 3.3 Tests and documentation

New:

- `qa/vercel/tests/routing.test.mjs`
- `qa/vercel/tests/packaging.test.mjs`

Updated:

- `qa/vercel/tests/handler.integration.test.mjs`
- `qa/vercel/run-emulator-tests.mjs`
- `qa/vercel/README.md`

`qa/vercel/README.md` now records the Candidate 02 status, route table, clean-room install, `npm ci` runbook, resolved prerequisites, and the remaining Vercel setting.

## 4. Verification evidence

### 4.1 Candidate emulator suite

Command:

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
npm run test:qa:vercel-backend
```

Result:

- Exit code: `0`
- Tests: `25`
- Pass: `25`
- Fail: `0`
- Cancelled: `0`
- Skipped: `0`
- Todo: `0`
- Firestore emulator: `demo-bhumi-qa-bootstrap`
- Duration: approximately `5.7s`

Coverage includes the Candidate 01 tests plus:

- Actual `api/healthz.mjs` `/api/healthz` routing.
- Local `/healthz` alias.
- QA project ID in the health response.
- Absence of private health data.
- Package export/import boundary.
- No relative import escaping `qa/vercel`.
- Declared dependency/import consistency.
- Installed package is not a symlink.
- Copied package files are byte-identical to `qa/backend/lib/`.
- `vercel.json` function/runtime boundary.
- No Billing route.

### 4.2 Non-emulator subset

Command:

```powershell
$env:BHUMI_QA_VERCEL = "1"
$env:QA_VERCEL_PROJECT_ID = "bhumi-amartya-qa"
$env:QA_VERCEL_PROJECT_NUMBER = "125330899891"
$env:QA_VERCEL_WIF_POOL_ID = "vercel-qa"
$env:QA_VERCEL_WIF_PROVIDER_ID = "vercel-qa"
$env:QA_VERCEL_SERVICE_ACCOUNT_EMAIL = "qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com"
node --test qa/vercel/tests/config.test.mjs qa/vercel/tests/wif.test.mjs qa/vercel/tests/services.test.mjs qa/vercel/tests/rate-limit.test.mjs qa/vercel/tests/packaging.test.mjs qa/vercel/tests/routing.test.mjs
```

Result:

- Exit code: `0`
- Tests: `17`
- Pass: `17`
- Fail: `0`
- Duration: `1069.7194ms`

The routing test clears `FIREBASE_CONFIG`, `GCLOUD_PROJECT`, `GOOGLE_CLOUD_PROJECT`, and `FIREBASE_PROJECT_ID` while exercising the Vercel path. This is required because `firebase emulators:exec` sets demo project values that correctly make the strict Vercel QA config fail closed with `503 QA_BACKEND_UNAVAILABLE`.

### 4.3 Clean-room package boundary

A temporary directory was populated with only `qa/vercel/` and `qa/backend/`. Inside `qa/vercel`:

```powershell
npm ci --no-audit --no-fund --ignore-scripts
node --test tests/packaging.test.mjs tests/routing.test.mjs
```

Result:

- `npm ci`: PASS.
- Packaging/routing: `2/2` PASS.
- Exit code: `0`.
- The installed `@bhumi/qa-backend` was a real directory, not a symlink.
- The temporary directory was removed after success.

This proves the local package boundary works without the repository-root `node_modules` or repository-root `package-lock.json`. It does not prove Vercel platform behavior.

### 4.4 Static and repository checks

| Check | Result |
| --- | --- |
| `node --check` on all 17 `qa/vercel/**/*.mjs` files | `CHECKED=17 FAILED=0` |
| `npx tsc --noEmit` | Exit `0` |
| `npm run lint` | Exit `0`; `421 warnings`, `0 errors` |
| `npm run quality:gate` | Exit `0`; `DEVELOPMENT GATE PASS`; `RELEASE GATE BLOCKED` |
| Missing Vercel QA flag | `EXPECTED_REJECT=QA_VERCEL_FLAG_REQUIRED` |
| Billing guard with `BHUMI_LOCAL_QA=1` | `EXPECTED_REJECT=QA_RUNTIME_DISABLED` |
| `npm ls --depth=0` in `qa/vercel` | No missing/invalid dependencies |

Installed top-level versions:

- `@bhumi/qa-backend@1.0.0`
- `@google-cloud/firestore@8.7.1`
- `firebase-admin@14.5.0`
- `google-auth-library@10.9.1`

Quality Gate caveat: the gate still reports `QA ISOLATION: BLOCKED` with the stale detail "Firebase/QA project not configured." The real QA Firebase project exists, but the live QA backend, live token acceptance, revocation, and device proof remain blocked.

The Quality Gate run regenerated the pre-existing untracked artifact `reports-qualitygate/BHUMI_QUALITY_GATE_REPORT.md`. It is not a source change.

## 5. Remaining blockers and risks

### 5.1 Actual Vercel build and outside-root setting

The local clean-room install proves the package boundary only. The Vercel project must still:

- Use Root Directory `qa/vercel`.
- Enable "Include source files outside of the Root Directory in the Build Step" so `../backend` is available during install.
- Use `npm ci` with the committed Candidate lockfile.
- Complete a real preview build.

Vercel platform behavior with the outside-root setting has not been observed. This remains a deployment gate, not a proven failure.

### 5.2 GCP WIF and service account not created

The QA Firebase project `bhumi-amartya-qa` (`125330899891`) exists. These resources do not:

- WIF pool `vercel-qa`.
- OIDC provider `vercel-qa`.
- Service account `qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com`.
- `roles/datastore.user` on the QA project.
- `firebaseauth.users.get` for Admin Auth lookup.
- `roles/iam.serviceAccountTokenCreator` on the service account for the Vercel principal.

Required WIF alignment:

- Provider allowed audiences: `https://vercel.com/wizzares-projects`.
- Attribute condition: `assertion.sub=='owner:wizzares-projects:project:bhumi-qa-bootstrap:environment:production'`.
- STS endpoint: `https://sts.googleapis.com/v1/token`.
- Impersonation endpoint: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/qa-bootstrap@bhumi-amartya-qa.iam.gserviceaccount.com:generateAccessToken`.
- Provider resource: `//iam.googleapis.com/projects/125330899891/locations/global/workloadIdentityPools/vercel-qa/providers/vercel-qa`.

Do not create a service-account key.

### 5.3 Vercel project, plan, and protection not configured

No QA Vercel project `bhumi-qa-bootstrap` exists. The current team is on Hobby. Hobby is for personal, non-commercial use; QA for a commercial product should use Pro:

- Pro platform fee: `$20/month` plus applicable tax.
- Pro includes a `$20/month` usage credit; overage is on-demand.
- Additional developer seats: `$20/user/month`; viewer seats are free.
- No paid add-on is required for this candidate.
- Expected QA usage should fit inside the credit, but this is not a guarantee.

Deployment Protection must be verified before Android testing. Vercel Authentication redirects unauthenticated requests to a Vercel login, which Android cannot complete. Recommended QA configuration:

- Use a dedicated custom domain, for example `qa-bootstrap-api.bhumiamartya.my.id` (example only; not configured).
- Use Standard Protection or disable Vercel Authentication for the QA project only.
- Verify with `curl` from a network without Vercel cookies that the endpoint returns JSON, not a login redirect.

Do not put a Protection Bypass secret in the Android app. Password Protection is also unsuitable unless the app implements a password prompt.

### 5.4 Live OIDC/WIF, Firebase token, and revocation not run

No live Vercel OIDC token has been exchanged through GCP WIF. No real QA Firebase ID token has been verified. `verifyIdToken(token, true)` is wired but not proven against live QA Firebase, and revocation behavior is unverified.

### 5.5 Android/device QA not run

No APK, device install, native Google Sign-In, or device first-login test was run. The QA runtime guard and localhost/cleartext policy must be handled in the separate Android task. Local HTTP success is not device QA.

### 5.6 QA-only route isolation

`/api/qa/bootstrap-first-login` is QA-only. It must never be deployed to the production Vercel project or included in a production release. Production creates the minimal profile on the client and calls the trial-only route.

### 5.7 Operational limits

- Rate limiting is in-memory and per function instance; it is not a global quota.
- No durable audit log, alerting, request-ID correlation, WAF rule, or IP allowlist is implemented.
- The Vercel OIDC token is reused for up to 90 minutes; the function token TTL is two hours.
- Admin SDK access bypasses Firestore client rules by design.
- No browser or device rendering evidence exists.
- No production deployment, APK, or release is authorized.

### 5.8 Cost risk

The expected QA deployment cost is the Pro platform fee (`$20/month` plus tax) with usage expected to fit the included `$20/month` credit. This is an estimate, not a guarantee. No plan change or purchase was made.

## 6. ONE Founder action and next task

**ONE required Founder action:** approve the single follow-up task **`QA-VERCEL-BACKEND-DEPLOYMENT-01`** to:

1. Create the QA-only WIF pool/provider and keyless service account.
2. Apply the required IAM grants.
3. Create the isolated Vercel QA project on Pro with the required protection/custom-domain configuration.
4. Enable the outside-root source setting and run a real preview build using the lockfile.
5. Deploy only to the isolated QA project.
6. Run live synthetic QA token, revocation, CORS, and health verification.

No deployment is authorized by this report. Without that single approval, the candidate remains local-only.

## 7. Status ledger

- Candidate implementation: **LOCAL PASS**.
- Candidate tests: **25/25 PASS**.
- Non-emulator subset: **17/17 PASS**.
- Clean-room package/routing: **2/2 PASS**.
- `/api/healthz` routing: **PASS LOCALLY**.
- Dependency packaging: **PASS LOCALLY**.
- Lockfile: **PRESENT**.
- Vercel build: **NOT RUN**.
- Vercel deployment: **NOT RUN**.
- GCP WIF/service account: **NOT CREATED**.
- Live OIDC/WIF exchange: **NOT RUN**.
- Live Firebase token/revocation: **NOT RUN**.
- Android/device QA: **NOT RUN**.
- APK/export: **NOT AUTHORIZED / NOT RUN**.
- Production Firebase reads/writes: **NONE**.
- Production changes: **NONE**.
- Billing transactions: **NONE**.
- Commit: **NONE**.
- Quality Gate: **DEVELOPMENT PASS / RELEASE BLOCKED**.
- Release readiness: **NOT CLAIMED**.

## 8. Worktree state

Filtered status for this task's paths:

```text
 M BUILD_106_MASTER_SOT.md
 M package.json
?? BHUMI_MASTER_GAP_AND_RISK_REGISTER.md
?? BHUMI_MASTER_PROJECT_CHECKLIST.md
?? BHUMI_REMAINING_WORK_EXECUTION_PLAN.md
?? qa/backend/
?? qa/vercel/
?? reports-qualitygate/
```

Notes:

- `package.json` was already modified before this task and was not changed by this task.
- `BUILD_106_MASTER_SOT.md` was already modified and received the Candidate 02 section only.
- The three `BHUMI_MASTER_*` files were untracked before this task and received Candidate 02 sections.
- `qa/backend/` and `qa/vercel/` are untracked directories; all Candidate 02 source/test/package changes are inside them.
- `qa/vercel/node_modules/` is generated and ignored by `.gitignore`.
- `reports-qualitygate/BHUMI_QUALITY_GATE_REPORT.md` is a pre-existing untracked artifact regenerated by Quality Gate.
- All pre-existing untracked files were preserved.
- The 70 pre-existing modified tracked files remain preserved.

## 9. Files changed by this task

Source, package, and tests:

- `qa/backend/lib/server.mjs`
- `qa/backend/package.json` (new)
- `qa/vercel/lib/handler.mjs`
- `qa/vercel/lib/entry.mjs`
- `qa/vercel/package.json`
- `qa/vercel/.npmrc` (new)
- `qa/vercel/package-lock.json` (new; generated)
- `qa/vercel/run-emulator-tests.mjs`
- `qa/vercel/tests/handler.integration.test.mjs`
- `qa/vercel/tests/routing.test.mjs` (new)
- `qa/vercel/tests/packaging.test.mjs` (new)
- `qa/vercel/README.md`

Documentation:

- `BHUMI_QA_VERCEL_BACKEND_CANDIDATE_02_REPORT.md` (new)
- `BUILD_106_MASTER_SOT.md` (Candidate 02 section appended)
- `BHUMI_MASTER_PROJECT_CHECKLIST.md` (Candidate 02 entry appended)
- `BHUMI_MASTER_GAP_AND_RISK_REGISTER.md` (Candidate 02 entry appended)
- `BHUMI_REMAINING_WORK_EXECUTION_PLAN.md` (Candidate 02 entry appended)

Generated, not source:

- `reports-qualitygate/BHUMI_QUALITY_GATE_REPORT.md` (regenerated)
- `qa/vercel/node_modules/` (ignored)
- temporary clean-room directory (removed after success)

No production source, Billing, Human Design, APK, or deployment file was changed.

## 10. Next action

**STOP AND WAIT FOR FOUNDER REVIEW.**

The next authorized task, if approved, is `QA-VERCEL-BACKEND-DEPLOYMENT-01` as described in Section 6. No deployment is authorized by this report.
