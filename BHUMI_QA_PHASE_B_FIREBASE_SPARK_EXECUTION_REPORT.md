# BHUMI QA PHASE B — FIREBASE SPARK EXECUTION REPORT

**Date:** 2026-10-22
**Worktree:** `C:\tmp\bhumi-build106-recovery`
**Branch:** `hotfix/build110-indonesian-only`
**HEAD:** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`
**Status:** PHASE B SPARK CONFIGURATION EXECUTED — GOOGLE AUTH + BACKEND BLOCKED
**Supersedes:** `BHUMI_QA_PHASE_B_RESOURCE_SETUP_AND_RUNTIME_POLICY_REPORT.md` (planning-only)

---

## 1. Firebase Project Creation — PASS

| Item | Value |
|------|-------|
| Display name | Bhumi Amartya QA |
| Project ID | `bhumi-amartya-qa` |
| Project number | `125330899891` |
| Lifecycle state | `ACTIVE` |
| Authenticated account | `wizzare@gmail.com` |
| Production project | `bhumiamartya-fe85c` — **not accessed or modified** |

The preferred project ID `bhumi-amartya-qa` was absent from the account's 8 existing projects and was created successfully. Every mutating Firebase/gcloud command used the explicit `--project bhumi-amartya-qa` (or `--billing-project`) target. Two initial read-only probes failed without touching production: `firebase firestore:locations` used an unresolved project, and one billing-describe attempt used the gcloud default project as quota consumer (Cloud Billing API disabled) and made no change. All subsequent verification used explicit QA targets.

**Project creation exit code:** `0`.

---

## 2. Spark and Billing Status — PASS

| Check | Result |
|-------|--------|
| `gcloud billing projects describe bhumi-amartya-qa` | `billingEnabled=False`, billing account empty |
| Blaze linked | No |
| Payment method attached | No |
| Firebase/Google Analytics APIs | `NONE_ENABLED` (verified filter) |

`cloudbilling.googleapis.com` and `firestore.googleapis.com` were enabled on the QA project as free APIs solely for verification and database setup. Enabling Cloud Billing API does **not** attach a billing account. No chargeable service was activated. Cost incurred: **$0**.

---

## 3. Google Authentication — BLOCKED (billing precondition)

| Attempt | Result |
|---------|--------|
| `GET /v2/projects/bhumi-amartya-qa/config` | `404 CONFIGURATION_NOT_FOUND` |
| `POST /v2/projects/bhumi-amartya-qa/identityPlatform:initializeAuth` | `400 BILLING_NOT_ENABLED` — "Identity Platform feature requires billing to be enabled" |
| `PATCH /v2/projects/.../defaultSupportedIdpConfigs/google.com?updateMask=enabled` | `404 CONFIGURATION_NOT_FOUND` |

The IAM check confirmed `roles/owner` for the authenticated account, so this is a product billing precondition, not a permission error. Enabling Blaze is explicitly prohibited by the Founder, so this path was stopped.

**Consequence:** no Google provider, no OAuth clients, and no `default_web_client_id` exist yet. The Firebase Console "Get started → Google → Enable" flow is free on Spark and is the single required Founder action.

---

## 4. Web Registration — PASS

| Item | Value |
|------|-------|
| App ID | `1:125330899891:web:5a5d099369cfaa69d4c1c6` |
| Display name | Bhumi Amartya QA Web |
| Config project | `bhumi-amartya-qa` (verified) |
| Secure storage | `%USERPROFILE%\.bhumi-qa\web-sdk-config.json` (outside repo) |
| API key handling | Present in file; not printed in this report or logs |

The QA Web SDK config is stored outside the repository so no credential-bearing file is added to the worktree. The production `.env.local` and production Web configuration were not modified.

---

## 5. Firestore and Rules — PASS

| Item | Value |
|------|-------|
| Database | `projects/bhumi-amartya-qa/databases/(default)` |
| Location | `asia-southeast2` (Jakarta) |
| Type / Edition | `FIRESTORE_NATIVE` / `STANDARD` |
| Concurrency | `PESSIMISTIC` |
| Rules release | `projects/bhumi-amartya-qa/releases/cloud.firestore` |
| Ruleset | `projects/bhumi-amartya-qa/rulesets/a89358b4-51b4-49eb-bd28-c79355accf97` |
| Rule content verification | `allow read, write: if false;` — `DENY_ALL_PRESENT=True` |
| Test data written | None |

Local deployment config is isolated in `qa/firebase/` with its own `firebase.json` and `.firebaserc` defaulting to `bhumi-amartya-qa`. The root production `firebase.json`/rules were not used for the QA deploy.

Rules are intentionally closed (deny-all) because Auth is not yet enabled and no QA schema/owner tests can run. Owner-scoped QA rules remain a later step after Google Auth is available.

---

## 6. Android Registration — PASS

| Item | Value |
|------|-------|
| App ID | `1:125330899891:android:1d0bf90724f7a71ed4c1c6` |
| Display name | Bhumi Amartya QA Android |
| Package | `com.bhumiamartya.app.qa` |
| Secure storage | `%USERPROFILE%\.bhumi-qa\google-services.json` (outside repo) |
| Production file | `android/app/google-services.json` — unchanged (`git status` clean for path) |

---

## 7. SHA / OAuth Verification — SHA PASS, OAuth BLOCKED

Fingerprints were extracted from the **actual local signer** (`%USERPROFILE%\.android\debug.keystore`, alias `androiddebugkey`), not guessed and not copied from the production signer:

| Type | Fingerprint | Registration |
|------|-------------|--------------|
| SHA-1 | `E7:76:79:29:E8:C4:14:92:FE:FA:D0:E8:A5:3A:BE:27:49:FF:A8:D4` | Created, verified in list |
| SHA-256 | `F7:0F:FC:C9:4A:33:A6:DD:A0:EE:C4:D3:84:64:13:36:50:3B:93:1A:7E:12:25:68:0E:C7:A9:E5:83:B6:B9:6A` | Created, verified in list |

Note: a dedicated QA release keystore does not exist. The registered fingerprints belong to the real debug signer a QA debug build would use. If a separate QA release signer is later adopted, its fingerprints must also be registered.

OAuth alignment is **BLOCKED**: `google-services.json` currently shows `android_oauth_types=[]`, because OAuth clients are created only when Google sign-in is enabled. `default_web_client_id` is therefore not yet available.

---

## 8. Backend QA — BLOCKED

No Cloud Functions, Cloud Run, or paid backend was deployed, per authorization boundary. There is no QA token-verification endpoint and no QA profile-bootstrap endpoint. Cloud Functions requires Blaze; the alternative is a separately approved free-tier/local bootstrap design.

**Verdict: BACKEND QA BLOCKED.** This part was stopped as instructed.

---

## 9. Billing During Auth QA — DISABLED

- Local QA guard test: `PASS 512 assertions; protected callback/fetch/plugin invocations=0; synthetic only` — exit `0`.
- `assertQaOperationAllowed` remains fail-closed across Auth/Billing/bootstrap seams.
- No Play transaction, purchase, restore, or entitlement mutation was performed.
- Quality Gate: `DEVELOPMENT GATE PASS` / `RELEASE GATE BLOCKED` — exit `0`.

---

## 10. Production and Worktree Safety

- Production Firebase: no reads of production data, no writes, no config changes.
- Production project `bhumiamartya-fe85c` was only visible in the account-wide project list used to check ID availability.
- No APK export/build/install/launch; no device login; no Play Console change; no $25 fee.
- No commit, push, reset, clean, or stash.
- Human Design algorithms and production Billing authority untouched.
- Git state after task: 69 tracked modified (includes the `BUILD_106_MASTER_SOT.md` documentation edit), 119 untracked entries, 0 staged; HEAD unchanged.
- New local files: `qa/firebase/firebase.json`, `qa/firebase/.firebaserc`, `qa/firebase/firestore.rules`, this report.

---

## 11. Master Tracking Updated

- `BUILD_106_MASTER_SOT.md`
- `BHUMI_MASTER_PROJECT_CHECKLIST.md`
- `BHUMI_MASTER_GAP_AND_RISK_REGISTER.md`
- `BHUMI_REMAINING_WORK_EXECUTION_PLAN.md`

Requirement statuses remain evidence-based and unchanged: **RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 VERIFIED COMPLETE**. RSK-22/23 remain open. The QA project creation is recorded as partial progress toward RCV-25, not closure.

---

## 12. Exact Founder Action Required (ONE)

Enable Google sign-in for the QA project in Firebase Console (free on Spark):

1. Open `https://console.firebase.google.com/project/bhumi-amartya-qa/authentication/providers`
2. Click **Get started**
3. Select **Google**, click **Enable**, choose the support email, and **Save**

This does not require Blaze and creates the OAuth Web client needed for `default_web_client_id`. After that, the agent can refresh the QA SDK configs and complete OAuth alignment.

**Backend QA still requires a separate decision** (free-tier/local bootstrap vs. paid backend) and is not authorized by this step.

---

## 13. STOP

Phase B Spark configuration is complete to the extent possible without billing. No APK, export, install, device testing, backend deployment, or production action occurred.

**STOP — AWAITING FOUNDER GOOGLE AUTH CONSOLE ACTION + SEPARATE BACKEND DECISION.**
