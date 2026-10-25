# BHUMI QA BACKEND BOOTSTRAP LOCAL 01 REPORT

Date: 2026-10-23
Branch: `hotfix/build110-indonesian-only`
HEAD: `e63f334cf0ac20cc076bc88e98e3e06808b024f3`

## Verdict

Local isolated QA harness: **PASS**.

Real QA backend, live-token acceptance, revocation checking, browser/device runtime, and Vercel QA deployment: **BLOCKED**.

This report does not claim release readiness. Local HTTP success is not browser rendering verification, device QA, or production deployment.

## Scope and constraints honored

Authorized work was limited to a local QA-only bootstrap harness, isolated emulator tests, Quality Gate, and documentation.

- No production Firebase read or write.
- No service-account creation or use.
- No Blaze, cloud billing, or paid backend.
- No backend deployment or runtime activation.
- No APK build, install, or launch.
- No real Google Sign-In or Billing.
- No Human Design algorithm change.
- No production Billing change.
- No commit, push, reset, clean, or stash.
- No real user identifiers, emails, birth data, tokens, or credentials recorded.

The worktree already contained extensive Build 106/107/110 changes before this task. This task added QA harness files and documentation only; it did not revert or adopt unrelated changes.

## Production contract audit

### Client first-login flow

- `context/AuthContext.tsx` calls the auth bootstrap path for a signed-in user.
- `lib/auth/authActions.ts:240` `ensureMinimalUserProfile(user)`:
  - Reads the profile.
  - Creates a minimal client profile when absent.
  - Calls `bootstrapCanonicalAccess` at `lib/auth/authActions.ts:250`.
  - Waits for a server-issued trial profile via `waitForServerIssuedProfile` (`lib/auth/authActions.ts:114`).
  - Skips bootstrap when the profile already has trial fields (`lib/auth/authActions.ts:245`).
- `lib/billing/canonicalAccessBootstrap.ts` obtains a fresh ID token and POSTs to `/api/access/bootstrap-trial`; it de-duplicates completed UIDs in-process.
- Client-created profiles strip server-owned access fields. `lib/repositories/userRepository.ts` and `firestore.rules` enforce protected-field boundaries.
- `firestore.rules:234-235` uses `doesNotCreateProtectedAccessFields()` on create and `doesNotChangeProtectedAccessFields()` on update. Equivalent guards exist for related user-owned documents at `firestore.rules:316-325`.

### Web bootstrap route

`app/api/access/bootstrap-trial/route.ts`:

- Verifies the bearer token with `getAuth().verifyIdToken(token)` at line 79. No revocation argument is used.
- Requires an empty request body.
- Checks one badge field at line 108 (`data.badge || data.testerBadge || data.guardianBadge`).
- Treats `LIFETIME`, or `PREMIUM` with `entitlementSource === "google_play"`, as a higher entitlement.
- If `trialStartedAt` and `trialEndsAt` exist, returns `ALREADY_PRESENT` without canonical validation (lines 117-122).
- Otherwise writes a seven-day server grant with `entitlementSource`, `accessSource`, and `updatedBy` equal to `server_access_bootstrap` (lines 136-144).
- Rejects the legacy `firebase_auth_creation_time` authority by not using it to create a trial.

### Vercel bootstrap route

`services/billing-verifier/api/access/bootstrap-trial.ts`:

- Verifies with `verifyIdToken(..., true)` at line 30, enabling Firebase revocation checking.
- Requires an empty body.
- Checks all three badge fields at line 41.
- Treats `LIFETIME`, `PREMIUM`, or `isPremium === true` as higher entitlement.
- Detects all production trial-state markers at line 44.
- Validates the canonical seven-day grant at line 51 and returns `DATA_CONFLICT` on malformed or untrusted trial state.
- Writes the same canonical `server_access_bootstrap` grant shape.

### Canonical contract

The canonical trial is seven days, server-issued, with:

- `plan: "free_trial"`
- `membership: "REGULAR_TRIAL"`
- `membershipType: "TRIAL"`
- `subscriptionStatus: "trialing"`
- `entitlementSource`, `accessSource`, `updatedBy`: `server_access_bootstrap`
- `accessSourceVersion: "2026-09-13"`
- Matching `trialStartedAt`/`accessStart` and `trialEndsAt`/`accessUntil`

`firebase_auth_creation_time` is not accepted as entitlement authority.

### Legacy path

`lib/billing/registrationPolicy.ts:53` still contains `buildDefaultNewUserAccessGrant`, which creates a three-day grant. It is legacy and is not the canonical first-login authority. `functions/index.js` contains a legacy new-user grant builder; no Auth `onCreate` trigger was found. These paths must not be used as evidence that first-login bootstrap is complete.

### Contract discrepancies found

1. The web route does not perform the Vercel route's revocation check.
2. The web route checks only one badge field, while Vercel checks all three.
3. The web route returns `ALREADY_PRESENT` for any profile with trial fields, without canonical validation; Vercel returns `DATA_CONFLICT` for malformed state.
4. The web route accepts `PREMIUM` only with `google_play`; Vercel also accepts `isPremium === true`.
5. The client creates the minimal profile; the Vercel route is trial-only. The local QA combined route exists only to make first-login testing self-contained.

These are audit findings. No production route was changed.

## Local harness

New local-only harness under `qa/backend/`:

- `lib/config.mjs`: fail-closed configuration.
- `lib/token-verifier.mjs`: real RS256/JWKS verification using Node `crypto`.
- `lib/bootstrap-contract.mjs`: canonical grant, validation, minimal profile.
- `lib/first-login.mjs`: trial-only and QA-only combined first-login transactions.
- `lib/server.mjs`: HTTP server, CORS, body, auth, and error boundaries.
- `local-bootstrap-server.mjs`: CLI entrypoint.
- `run-emulator-tests.mjs`: Firestore emulator test runner.
- `tests/helpers.mjs`: ephemeral RSA keys, JWT creation, test DB/server helpers.
- `tests/token-verifier.test.mjs`
- `tests/bootstrap-contract.test.mjs`
- `tests/config.test.mjs`
- `tests/local-bootstrap.integration.test.mjs`
- `README.md`

### Security boundary

- Binds only to `127.0.0.1`.
- Requires `BHUMI_QA_BACKEND=1`.
- Requires a loopback `FIRESTORE_EMULATOR_HOST`.
- Requires a `demo-` project ID and rejects `bhumiamartya-fe85c`.
- Pins issuer and audience to the demo project.
- Rejects `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `GOOGLE_APPLICATION_CREDENTIALS`.
- Rejects production project values in `FIREBASE_PROJECT_ID`, `GCLOUD_PROJECT`, `GOOGLE_CLOUD_PROJECT`, and `FIREBASE_CONFIG`.
- Restricts JWKS to the Firebase secure-token JWKS URL, inline public JWKS, or a public JWKS file.
- Verifies algorithm, key ID, RS256 signature, issuer, audience, subject, expiry, issued-at, and not-before.
- Derives the write target only from the verified token subject.
- Rejects missing, malformed, expired, future, wrong-issuer, wrong-audience, wrong-key, and production-project tokens.
- Rejects non-empty request bodies; permits empty body or `{}`.
- Limits body size to 16 KiB.
- Restricts CORS origins to loopback/Capacitor origins.
- Returns sanitized error outcomes without token contents.

### Routes

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/healthz` | Local metadata only. |
| `POST` | `/api/access/bootstrap-trial` | Production-equivalent trial-only contract; no profile creation. |
| `POST` | `/api/qa/bootstrap-first-login` | QA-only combined minimal-profile + canonical-trial flow. |

The QA-only route must not be deployed. Production creates the minimal profile on the client.

### Transaction behavior

- Trial-only and combined flows run in Firestore transactions.
- The current time is resolved inside the transaction callback, so a retry observes the winning write rather than a stale pre-transaction timestamp.
- Existing canonical trials return `ALREADY_PRESENT`.
- Malformed or untrusted trial state returns `DATA_CONFLICT`.
- Higher entitlements return `HIGHER_ENTITLEMENT` without a trial write.
- Concurrent first-login requests converge to one canonical trial.
- Cross-user writes are prevented by using the verified subject as the only document ID.

### Important limitation

The harness uses the Firestore Admin SDK, which bypasses Firestore security rules. It validates server-side transaction behavior, not client-rule enforcement. Existing production rule tests remain separate evidence.

## Verification evidence

### Isolated bootstrap tests

Command:

```powershell
$env:JAVA_HOME='C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
npm run test:qa:backend-bootstrap
```

Result:

- Exit code: `0`
- Tests: `43`
- Pass: `43`
- Fail: `0`
- Cancelled: `0`
- Skipped: `0`
- Todo: `0`
- Duration: approximately `8.7s`

Coverage includes:

- Canonical seven-day grant.
- Minimal profile creation.
- Existing profile without trial.
- Canonical-trial idempotency.
- Malformed/untrusted trial fail-closed behavior.
- Higher-entitlement preservation.
- All production trial-state markers.
- Minimal profile without server-owned access fields.
- Fail-closed configuration.
- Production project/credential rejection.
- Loopback emulator and origin restrictions.
- JWKS restrictions.
- Health metadata.
- Trial-only route without profile creation.
- Combined first-login route.
- Existing-profile preservation.
- Higher-entitlement no-write behavior.
- Cross-user isolation.
- Concurrent idempotency.
- Missing/invalid/production token rejection.
- Origin, method, and body boundaries.
- Runtime entrypoint startup.
- RSA/JWT validation cases.

A non-emulator subset of 31 tests also passed before the full emulator run.

### Repository checks

- `npm run lint`: exit `0`; `421 warnings`, `0 errors`.
- `npx tsc --noEmit`: exit `0`; no output.
- `npm run quality:gate`: exit `0`; `DEVELOPMENT GATE PASS`; `RELEASE GATE BLOCKED`.

### Quality Gate caveat

The current gate script reports `QA ISOLATION: BLOCKED` with the stale detail “Firebase/QA project not configured.” The real QA Firebase project does exist, but real QA backend runtime, live token acceptance, revocation, and device proof remain blocked. The gate's release verdict remains correct; its QA detail is outdated.

## Blockers

- No real QA ID token can be obtained without real Google Sign-In, which is prohibited in this task.
- Revocation checking requires Firebase Admin Auth/Identity Toolkit credentials; the local harness cannot reproduce `verifyIdToken(token, true)`.
- Vercel Option B requires a separate QA service account, QA-specific admin configuration, deployment authorization, and runtime-policy adaptation. The current Vercel service is pinned to production.
- Physical-device QA requires an authorized APK/export and a runtime policy that permits the QA path; localhost/cleartext restrictions currently fail closed.
- No browser or device rendering proof exists.
- No production Firebase or production backend access was used.

## Options and recommendation

### Option A: local QA harness

Use the local harness for isolated contract, token, transaction, idempotency, and isolation validation. This is the recommended option for the current task because it requires no credentials, deployment, billing, or production access.

Limitation: it cannot prove live Firebase token acceptance, revocation behavior, browser rendering, or device runtime.

### Option B: isolated Vercel QA backend

This is the only viable path to a remote HTTPS QA backend usable by a device, but it is not ready. It requires:

- A separate QA-only service account and QA project configuration.
- A QA deployment target that does not use production credentials.
- Explicit deployment authorization.
- Runtime-policy adaptation for the QA path.
- A live QA ID token obtained through authorized QA sign-in.
- Browser/device acceptance evidence.

Do not reuse the production-pinned Vercel admin configuration for QA.

## Status ledger

- Local isolated harness: **PASS**.
- Real QA backend/token verification: **BLOCKED**.
- Revocation verification: **BLOCKED**.
- Browser/device QA: **BLOCKED**.
- APK/export: **NOT AUTHORIZED / NOT RUN**.
- Production access: **NOT USED**.
- Commit: **NONE**.
- Quality Gate: **DEVELOPMENT PASS / RELEASE BLOCKED**.

Statuses unchanged: RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; 25 RSK / 21 DS preserved; RSK-22/23 open.

## Next actions

1. Founder decision: accept Option A for local-only validation, or authorize Option B with a separate QA service account and deployment scope.
2. If Option B is authorized, deploy only to an isolated QA target, then obtain a real QA ID token through authorized QA sign-in and verify bootstrap plus revocation behavior.
3. Only after backend authorization and device/APK authorization, run browser/device first-login QA.
4. Keep production routes, Billing, Human Design, and production Firebase untouched until explicit release authorization.

## Files added or changed by this task

Added:

- `qa/backend/README.md`
- `qa/backend/lib/config.mjs`
- `qa/backend/lib/token-verifier.mjs`
- `qa/backend/lib/bootstrap-contract.mjs`
- `qa/backend/lib/first-login.mjs`
- `qa/backend/lib/server.mjs`
- `qa/backend/local-bootstrap-server.mjs`
- `qa/backend/run-emulator-tests.mjs`
- `qa/backend/tests/helpers.mjs`
- `qa/backend/tests/token-verifier.test.mjs`
- `qa/backend/tests/bootstrap-contract.test.mjs`
- `qa/backend/tests/config.test.mjs`
- `qa/backend/tests/local-bootstrap.integration.test.mjs`

Changed:

- `qa/firebase/firebase.json`
- `package.json`

Documentation:

- `BHUMI_QA_BACKEND_BOOTSTRAP_LOCAL_01_REPORT.md` (this file)
- Master checklist, risk register, SOT, and remaining-work plan updates.

Generated but not adopted:

- `firestore-debug.log` from the emulator. Do not commit generated emulator logs.

## Final statement

The local QA bootstrap harness is implemented and passes its isolated test suite. The real QA backend and device path remain blocked. No deployment, APK, device login, production change, or commit occurred.

**STOP AND WAIT FOR FOUNDER REVIEW.**
