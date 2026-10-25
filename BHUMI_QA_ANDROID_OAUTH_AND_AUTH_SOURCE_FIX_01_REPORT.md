# BHUMI QA - Android OAuth and Auth Source Fix 01

**Date:** 2026-10-23  
**Sprint:** QA-ANDROID-OAUTH-AND-AUTH-SOURCE-FIX-01  
**Verdict:** **ANDROID OAUTH BLOCKED / QA AUTH SOURCE FIX PASS / RUNTIME STILL BLOCKED**  
**Release status:** NOT READY - no APK, no device login, no backend QA

---

## 1. Authorization and boundaries

Authorized worktree: `C:\tmp\bhumi-build106-recovery`  
Branch/HEAD at execution: `e63f334cf0ac20cc076bc88e98e3e06808b024f3` (unchanged)

Executed within the Founder directive:

- Read-only inspection of the isolated QA project `bhumi-amartya-qa`.
- QA-only SDK configuration refresh outside the repository.
- Source correction for the QA Google Web OAuth client identity.
- Local regression tests, TypeScript, and Quality Gate.
- Governance/report updates only.

Not performed:

- No production Firebase read or mutation.
- No Blaze, Cloud Billing, paid service, or Play transaction.
- No Firebase project/resource mutation in this sprint.
- No APK export/build/install/launch.
- No device login or real Google token exchange.
- No Human Design or production Billing change.
- No Git commit, push, reset, clean, stash, rebase, or staging.

---

## 2. Task A - Android OAuth client

### 2.1 Inspection result

The QA SDK configuration was refreshed from the isolated project:

```text
firebase apps:sdkconfig android 1:125330899891:android:1d0bf90724f7a71ed4c1c6 \
  --project bhumi-amartya-qa \
  --out "%USERPROFILE%\.bhumi-qa\google-services.json"
```

Result:

```text
OAUTH_TYPES=3
TYPE1_PRESENT=False
TYPE3_PRESENT=True
PACKAGE=com.bhumiamartya.app.qa
```

The QA `google-services.json` contains the Web OAuth client (`client_type 3`) but **no Android OAuth client (`client_type 1`)**. This is unchanged after the refresh.

The QA Web OAuth client is valid and isolated:

```text
WEB_CLIENT_PRESENT=True
WEB_CLIENT_PATTERN_MATCH=True
WEB_CLIENT_IS_PRODUCTION=False
IDP_CLIENT_MATCHES_QA_WEB=True
IDP_CLIENT_PATTERN_MATCH=True
GOOGLE_ENABLED=True
```

The type 3 `client_id` matches the Google IdP `clientId`; this is the QA value used for `default_web_client_id` in the Android build.

### 2.2 Why no Android client was created

No public API is available to inspect or create standard Google Sign-In OAuth clients in Google Auth Platform. Exact attempts:

| Attempt | Result |
|---|---|
| `clientauthconfig.googleapis.com` discovery | `403 Forbidden` |
| `v1/projects/bhumi-amartya-qa/oauthClients` | `404` |
| `v1/projects/bhumi-amartya-qa/brands` | `404` |
| IAM API `v1/projects/bhumi-amartya-qa/locations/global/oauthClients` | `403 PERMISSION_DENIED` - IAM API disabled |
| `gcloud services list --enabled --filter=config.name:iam.googleapis.com` | empty |

The IAM `oauthClients` resource is for Workforce Identity Federation, not standard Google Sign-In OAuth clients, so enabling it would not create the required Android client.

Known Firebase backend behavior (firebase-tools issue #2470): adding a SHA certificate through the Firebase CLI does **not** create the Android OAuth client or add it to `google-services.json`. Adding the same SHA through the Firebase Console **does** trigger the OAuth client creation.

### 2.3 SHA fingerprints

No SHA was deleted or replaced in this sprint. Both registered fingerprints remain:

- SHA-1: `E7:76:79:29:E8:C4:14:92:FE:FA:D0:E8:A5:3A:BE:27:49:FF:A8:D4` (ID `f9fdb7894e7a016a`)
- SHA-256: `F7:0F:FC:C9:4A:33:A6:DD:A0:EE:C4:D3:84:64:13:36:50:3B:93:1A:7E:12:25:68:0E:C7:A9:E5:83:B6:B9:6A` (ID `ee12145b76378479`)

Both were derived from the actual local debug keystore (`%USERPROFILE%\.android\debug.keystore`, alias `androiddebugkey`) and match the QA Android package `com.bhumiamartya.app.qa`.

### 2.4 Exact blocker

**The Android OAuth client does not exist in the retrieved QA configuration and cannot be created with the available API/tooling. It requires a Google Auth Platform/Firebase Console action.**

This is the only remaining external blocker for Task A. The QA configuration remains outside production at `%USERPROFILE%\.bhumi-qa\`; production `android/app/google-services.json` is unchanged.

---

## 3. Task B - QA Web Client ID source correction

### 3.1 Files changed

| File | Change |
|---|---|
| `lib/auth/googleWebClientId.ts` | New pure resolver; production constant isolated; QA identity validation |
| `lib/auth/authActions.ts` | Removed production client ID from native branch; resolves via validated QA env |
| `tests/unit/qa-google-web-client-id.test.mjs` | New regression suite, 21 assertions |

Task-specific `authActions.ts` delta: **+6 / -1** lines (the file also contains pre-existing dirty changes from earlier authorized work; those were not modified by this sprint).

### 3.2 Resolution contract

`resolveGoogleWebClientId(env)` behavior:

- No QA mode, QA project, or QA client configured -> returns the existing production Web Client ID. Production behavior is unchanged.
- `NEXT_PUBLIC_QA_MODE` set to anything other than `realQA` -> throws `QA_GOOGLE_AUTH_MODE_BLOCKED`.
- `realQA` without `NEXT_PUBLIC_FIREBASE_PROJECT_ID=bhumi-amartya-qa` -> throws `QA_GOOGLE_AUTH_PROJECT_MISMATCH`.
- Missing `NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID` -> throws `QA_GOOGLE_WEB_CLIENT_ID_MISSING`.
- The production client ID supplied in QA -> throws `QA_GOOGLE_WEB_CLIENT_ID_PRODUCTION_FORBIDDEN`.
- A client ID not matching `^125330899891-[a-z0-9]+\.apps\.googleusercontent\.com$` -> throws `QA_GOOGLE_WEB_CLIENT_ID_PROJECT_MISMATCH`.
- A valid QA client ID -> returned trimmed.

The QA client value must be sourced from the validated type 3 `client_id` in `%USERPROFILE%\.bhumi-qa\google-services.json` (which matches the Google IdP `clientId`). It is a public OAuth identifier, not a secret; it must not be committed. The expected build variables are:

```text
NEXT_PUBLIC_QA_MODE=realQA
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bhumi-amartya-qa
NEXT_PUBLIC_QA_GOOGLE_WEB_CLIENT_ID=<QA type 3 client_id>
```

### 3.3 Production preservation and fail-closed behavior

- `lib/auth/authActions.ts` no longer contains the production client ID literal; it calls `resolveGoogleWebClientId(...)` inside the native branch.
- The production constant remains only in `lib/auth/googleWebClientId.ts` as `PRODUCTION_GOOGLE_WEB_CLIENT_ID`.
- `assertQaOperationAllowed()` remains the first statement in `signInWithGoogle`; any QA selector still throws `QA_RUNTIME_DISABLED` before native sign-in.
- No QA fallback to the production client ID exists. A QA build with missing, mismatched, or production identity fails closed before the Capacitor Google plugin is called.

Runtime remains intentionally blocked. The source correction does not relax `lib/config/qaConfig.mjs`, `lib/config/qaRuntime.ts`, or the staging runner.

---

## 4. Task C - Verification

| Command | Result | Exit |
|---|---|---|
| `node tests/unit/qa-google-web-client-id.test.mjs` | `21 assertions PASS` | `0` |
| `node tests/unit/qa-backend-auth-db-config.test.mjs` | `PASS 512 assertions; protected callback/fetch/plugin invocations=0; synthetic only` | `0` |
| `npx tsx tests/unit/auth-new-02-bootstrap-telemetry.test.ts` | `PASS auth-new-02-bootstrap-telemetry (14 assertions)` | `0` |
| `npx tsc --noEmit` | PASS | `0` |
| `node scripts/run-quality-gate.cjs` | `DEVELOPMENT GATE PASS` / `RELEASE GATE BLOCKED` | `0` |

Notes:

- The first `tsx` attempt failed with exit `1` because `lib/firebase/config.ts` correctly fails closed without Firebase public environment variables. The successful rerun used synthetic, non-production Firebase values only. This was an environment setup issue, not a product regression.
- The Quality Gate report was written to `reports-qualitygate/BHUMI_QUALITY_GATE_REPORT.md`. `RELEASE GATE BLOCKED` is expected and does not indicate a new regression.
- No live Google token was exchanged; no native plugin invocation occurred.

---

## 5. Backend QA blocker

Backend QA remains **BLOCKED**:

- No token-verification or first-login profile-bootstrap endpoint exists.
- Cloud Functions requires Blaze; prohibited.
- Cloud Run free tier still requires a billing account; not approved.
- A localhost/emulator harness is $0 but non-native and cannot validate real Google tokens end-to-end.
- Service-account credential creation/approval is not authorized.

The staging runner also retains production Web/Billing defaults and synthetic Firebase fallbacks; those are build-time blockers and were not changed in this sprint.

---

## 6. Remaining risks

- **RSK-22:** fresh QA APK/export not executed; old APK does not contain the current AUTH-NEW-02 source.
- **RSK-23:** QA isolation is partial; Android OAuth client absent, realQA/OAuth policy fail-closed, backend bootstrap/token verification absent.
- Android OAuth client creation is not proven to be achievable by API; Console action is required.
- The QA Web client ID environment value is not yet injected into a QA build; the resolver is ready but runtime remains blocked by policy.
- No device-level Google sign-in, profile bootstrap, onboarding, or billing verification was performed.

---

## 7. Worktree and production state

- Tracked worktree remains dirty; no Git mutation occurred.
- Production `android/app/google-services.json` and `.env.local` are unchanged.
- QA SDK configs remain outside the repository at `%USERPROFILE%\.bhumi-qa\`.
- No secrets, tokens, or Identity Toolkit config JSON were written to the repository.
- No production Firebase resource was read or written.

---

## 8. Minimum Founder action

**One action is required to unblock the Android OAuth client:**

In Firebase Console -> Project settings -> Your apps -> Android app `com.bhumiamartya.app.qa` -> SHA certificate hashes, re-add the existing SHA-1:

```text
E7:76:79:29:E8:C4:14:92:FE:FA:D0:E8:A5:3A:BE:27:49:FF:A8:D4
```

This Console action is expected to materialize the Android OAuth client and add `client_type 1` to the QA `google-services.json` (the CLI path is known not to do so). If the client still does not appear, create it in Google Auth Platform -> Clients -> Create OAuth client ID -> Android with the same package and SHA-1.

After the action, the agent can refresh the QA SDK config and verify `client_type 1` plus `client_type 3`. No APK or device login is authorized yet.

---

## 9. Final status

**ANDROID OAUTH BLOCKED - SOURCE FIX PASS - RUNTIME BLOCKED**

- 44 requirements unchanged: **21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 VERIFIED COMPLETE**.
- RCV-25/28 BL, RCV-41 IP; RSK-22/23 open; 25 RSK / 21 DS preserved.
- No APK, no device login, no backend deployment, no production change, no commit.

**STOP AND WAIT FOR FOUNDER REVIEW**
