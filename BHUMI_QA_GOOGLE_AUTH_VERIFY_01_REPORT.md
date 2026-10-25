# BHUMI QA GOOGLE AUTH VERIFY 01 REPORT

**Sprint:** QA-GOOGLE-AUTH-VERIFY-01
**Date:** 2026-10-22
**Worktree:** `C:\tmp\bhumi-build106-recovery`
**Branch:** `hotfix/build110-indonesian-only`
**HEAD:** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`
**Verdict:** `GOOGLE_AUTH_CONFIG_PARTIAL / BACKEND_QA_BLOCKED`

---

## 1. Google Provider Status — PASS

| Check | Evidence |
|-------|----------|
| Identity Toolkit config | `200 OK` |
| `google.com` provider | `enabled=True` |
| Authorized domains | `localhost`, `bhumi-amartya-qa.firebaseapp.com`, `bhumi-amartya-qa.web.app` |
| OAuth client ID/secret | Present in IdP config; values not printed |
| Support email | Not exposed by Identity Toolkit API; Founder confirmed manual Console enablement |
| Blaze / billing | Not enabled |

The provider is genuinely enabled. No production project was queried for this check.

---

## 2. Identity Matrix

| Identity | Expected | Result |
|----------|----------|--------|
| Firebase project | `bhumi-amartya-qa` (125330899891) | PASS |
| Android package | `com.bhumiamartya.app.qa` | PASS |
| SHA-1 | `E7:76:79:29:...:A8:D4` | PASS — registered |
| SHA-256 | `F7:0F:FC:C9:...:B9:6A` | PASS — registered |
| Android app | `1:125330899891:android:1d0bf90724f7a71ed4c1c6` | PASS |
| Android OAuth client (type 1) | Present with `.qa` package + SHA | **FAIL — absent** |
| Web OAuth client (type 3) | Present | PASS |
| `default_web_client_id` | Matches QA IdP web client | PASS |
| Web SDK project/app | QA project + QA web app | PASS |

**Android OAuth client gap:** refreshed QA `google-services.json` contains `oauth_client` types `[3]` only. The production file contains `[1,1,1,1,3]`, confirming that Android OAuth clients normally materialize as type 1. The QA Android OAuth client has not been created/linked, so Credential Manager Google Sign-In is not yet considered ready.

**SHA provisioning anomaly:** a delete/re-add cycle confirmed SHA-1 absent after deletion and present again after re-add, but `firebase apps:android:sha:create` returned exit `2` while the server state remained correct. Final SHA list shows both SHA-1 and SHA-256 registered. This suggests the CLI-side response failed while the resource persisted; the OAuth client sub-provisioning did not occur.

**Native source blocker:** `lib/auth/authActions.ts:344` hardcodes the production Web client ID (`59259824153-...`) and passes it to both Credential Manager and legacy paths. There is no QA client override. Even with a QA Web client in `google-services.json`, the native app would request a production OAuth audience. This must be replaced with an env-driven QA client ID in an authorized source phase.

**Local QA policy remains fail-closed:** `lib/config/qaConfig.mjs:6-7,12` requires a `demo-*` project, rejects `realQA` mode, and requires `oauth: 'disabled'`; `assertQaStagingAllowed` always throws `QA_STAGING_DISABLED`; `qaRuntime.ts` throws `QA_RUNTIME_DISABLED` when QA flags are present. These guards were **not** relaxed.

---

## 3. SDK Configuration Refresh — PASS (with gap)

| Item | Result |
|------|--------|
| Android SDK refresh exit | `0` |
| Web SDK refresh exit | `0` |
| Android project match | `True` |
| Android package match | `True` |
| Web project/app match | `True` |
| Web client matches IdP | `True` |
| Android OAuth client present | `False` |
| Storage location | `%USERPROFILE%\.bhumi-qa\google-services.json`, `web-sdk-config.json` |
| Production `android/app/google-services.json` | Unchanged (`git status` clean for path) |

No API keys, client secrets, or tokens are printed in this report.

---

## 4. Security and Cost — PASS

| Check | Evidence |
|-------|----------|
| Plan | Spark; `billingEnabled=False`; no billing account |
| Analytics | `NONE_ENABLED` |
| Firestore | `asia-southeast2`, `FIRESTORE_NATIVE` |
| Firestore rules | `DENY_ALL_PRESENT=True` on release `cloud.firestore` |
| Test data | None written |
| Backend production endpoint | None used; QA SDK targets QA project only |
| Billing during Auth QA | DISABLED; guards intact |
| QA guard test | `PASS 512 assertions`, exit `0` |
| Production config files | `android/app/google-services.json` and `.env.local` unchanged |
| Cost | **$0** |

---

## 5. Backend QA — BLOCKED

No backend was deployed. QA token verification and first-login profile bootstrap remain unavailable.

Options assessed:

1. **Cloud Functions** — requires Blaze; prohibited.
2. **Cloud Run free tier** — still requires a linked billing account to deploy; prohibited without Founder approval.
3. **Localhost emulator harness** — $0 and safe, but synthetic/non-native; cannot validate real Google ID tokens end-to-end.
4. **Existing free external backend** — would need a QA service account key, credential handling approval, and terms review; not provisioned.

**Verdict: `BACKEND_QA_BLOCKED`.** No service account, secret, or deployment was created.

---

## 6. AUTH-NEW-02 Source Readiness

- Source files `lib/auth/authActions.ts` and `context/AuthContext.tsx` are present.
- No fresh export was produced; export remains unauthorized.
- Native readiness is **not** met because of the hardcoded production Web client ID.
- The staging runner still injects production Web/Billing URLs (`scripts/run-mobile-staging-build.mjs:282-283`) and synthetic Firebase fallbacks; these are build-time blockers for QA, not executed in this sprint.

Required before APK: authorized QA client-ID resolution, realQA policy approval, QA environment injection, and backend decision.

---

## 7. Tests Actually Executed

| Test | Result | Exit |
|------|--------|------|
| QA guard/config regression (`tests/unit/qa-backend-auth-db-config.test.mjs`) | PASS — 512 assertions, 0 protected invocations | `0` |
| Identity comparison (SDK vs IdP) | Completed; Web match `True`, Android client `False` | N/A |
| Firestore rules release verification | Deny-all `True` | N/A |
| Billing/Spark verification | `billingEnabled=False` | `0` |

No Quality Gate re-run, Gradle, APK, emulator, or device test was performed.

---

## 8. Master Tracking Updated

- `BUILD_106_MASTER_SOT.md`
- `BHUMI_MASTER_PROJECT_CHECKLIST.md`
- `BHUMI_MASTER_GAP_AND_RISK_REGISTER.md`
- `BHUMI_REMAINING_WORK_EXECUTION_PLAN.md`

Statuses remain evidence-based: **RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 VERIFIED COMPLETE**. RSK-22/23 remain open. HD, Billing, New User, and the two post-release AI bots remain recorded.

---

## 9. Final Summary

1. **Google provider QA:** ENABLED and verified.
2. **OAuth/SHA/Android/Web match:** project, package, SHA-1/SHA-256, Web client, and `default_web_client_id` match; **Android OAuth client is missing**; native source still uses the production Web client.
3. **Cost:** $0; Spark only; no billing account.
4. **Security:** Firestore isolated with deny-all rules; no backend; Billing disabled; guards fail-closed.
5. **Tests:** QA guard 512 assertions PASS (exit 0).
6. **ONE Founder action:** In Firebase Console → Project settings → Your apps → Android app `com.bhumiamartya.app.qa` → SHA certificate hashes, **re-add the SHA-1 fingerprint via the Console** (not CLI) to trigger creation of the Android OAuth client. Fallback: Google Cloud Console → Credentials → Create OAuth client ID → Android with the same package and SHA-1.

**STOP — no APK, export, device test, backend deployment, production change, or Git mutation.** After the Android OAuth client exists, the next authorized phase must align the native QA client ID and decide the backend path before any APK is built.
