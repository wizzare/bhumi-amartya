# BHUMI QA PHASE B — RESOURCE SETUP AND RUNTIME POLICY

**Date:** 2026-10-22  
**Worktree:** `hotfix/build110-indonesian-only`  
**Head:** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
**Status:** PREPARATION COMPLETE — AWAITING FOUNDER AUTHORIZATION FOR EXTERNAL RESOURCES  

---

## 1. Local Corrections Completed (Phase A Summary)

The following local guards were implemented in Phase A and are **verified active**:

### 1.1 Staging Script Legacy Selector Bypass Fixed
- **File:** `scripts/run-mobile-staging-build.mjs` (lines 269-292)
- **Change:** Added `QA_MODE_ACTIVE` and `QA_PROJECT_ID` env vars alongside production-default settings
- **Guard:** `assertQaStagingAllowed(process.env)` at line 249 validates QA config; throws `QA_STAGING_DISABLED` if improper
- **Effect:** When QA mode active (`NEXT_PUBLIC_QA_MODE` = `"emulator"` or `"realQA"`), build uses QA-referential settings; production behavior preserved when QA inactive

### 1.2 Billing Guard Verification Confirmed
All 8 billing operation paths call `assertQaOperationAllowed()` before executing:
- `initializeGooglePlayBilling()` → `assertAndroidBilling()` → `assertQaOperationAllowed()`
- `queryPremiumSubscription()` → `assertAndroidBilling()` → `assertQaOperationAllowed()`
- `purchasePremiumSubscription()` → `assertAndroidBilling()` → `assertQaOperationAllowed()`
- `recoverAndRefreshGooglePlayPurchases()` → `assertQaOperationAllowed()`
- `purchaseAndRecoverPremium()` → `assertQaOperationAllowed()`
- `restoreAndRecoverPremium()` → `assertQaOperationAllowed()`
- `processAndVerifyPurchaseToken()` → `assertAndroidBilling()` → `assertQaOperationAllowed()`
- `autoRecoverActiveSubscriptions()` → `assertQaOperationAllowed()`

### 1.3 QA Fail-Closed Runtime Guards Verified
- `assertQaOperationAllowed()` in `lib/config/qaRuntime.ts:3-6` throws `QA_RUNTIME_DISABLED` if any QA/emulator flags active
- `assertQaOperationAllowed()` in `lib/auth/authActions.ts:328` throws before native Google sign-in
- `assertQaOperationAllowed()` in `lib/billing/googlePlayBilling.ts` (8 locations) throws before Billing operations
- `assertQaStagingAllowed()` in `lib/config/qaConfig.mjs:43` throws `QA_STAGING_DISABLED` if QA config improper

### 1.4 Quality Gate Status
- **DEVELOPMENT GATE:** PASS (mandatory HD + Platform Boundary checks)
- **RELEASE GATE:** BLOCKED (Billing RUNTIME_PENDING, Auth RUNTIME_PENDING, QA ISOLATION BLOCKED)

---

## 2. Exact External QA Resources Required

The following resources must be provisioned **separately** with explicit Founder approval. None have been created.

### 2.1 Firebase QA Project
| Resource | Purpose | Free-tier Eligible |
|----------|---------|-------------------|
| **Firebase Project** (e.g., `bhumi-amartya-qa`) | Isolated project for QA | Yes (Spark plan) |
| **Google Authentication** | Google Sign-In provider for QA | Yes |
| **Firebase Web App** | Web SDK configuration | Yes |
| **Android App Registration** | Package: `com.bhumiamartya.app.qa` | Yes |
| **SHA-1 / SHA-256** | From actual QA signing certificate (not production) | N/A (derived) |
| **OAuth Client IDs** | Web + Android matching `default_web_client_id` | Yes |
| **Firestore Database** | QA database with tested rules | Yes (Spark) |
| **Security Rules** | Owner isolation, server-owned field protection | N/A (config) |

### 2.2 Backend QA
| Resource | Purpose | Free-tier Eligible |
|----------|---------|-------------------|
| **Token Verification Endpoint** | Validates QA Firebase ID tokens (issuer/audience = QA project) | Yes (local emulator / Cloud Run free tier) |
| **Profile Bootstrap API** | Provisions trial/entitlement for QA users | Yes (local / Cloud Run free tier) |
| **CORS Configuration** | Allows QA web origin only | N/A (config) |

### 2.3 Android QA
| Resource | Purpose | Free-tier Eligible |
|----------|---------|-------------------|
| **QA Signing Keystore** | Debug/Release cert for QA APK; SHA-1/SHA-256 registered with Google | N/A (local file) |
| **Google Play Console** | Internal Testing track for `com.bhumiamartya.app.qa` | Yes (one-time $25 fee if new dev account) |

---

## 3. Cost Implications

| Item | Estimated Cost | Notes |
|------|---------------|-------|
| Firebase Spark plan (Auth, Firestore, Hosting) | $0 | Sufficient for QA auth/database |
| Google Cloud Functions (if needed) | $0 (free tier) | 2M invocations/month free; backend can use Cloud Run free tier instead |
| Google Play Developer Account | **$25 one-time** | Only if no existing account; existing account may already exist |
| Cloud Run / Cloud Functions Blaze | $0 (free tier) | 2M requests/month free; sufficient for QA bootstrap/verification |
| SHA-1/SHA-256 keystore generation | $0 | Local `keytool` command |
| **Total minimum** | **$0 or $25** | $25 only if new Play Console account needed |

**No paid services will be activated without explicit Founder approval.** Current plan uses only free tiers.

---

## 4. What Remains Blocked

The following **cannot proceed** until external resources are approved and configured:

| Blocker | Reason |
|---------|--------|
| Native Google Sign-In runtime | Requires QA Firebase project, Google Auth, Android `.qa` registration, matching OAuth client, SHA-1/SHA-256 from QA signer |
| Native Billing runtime | Requires Play Console Internal Testing track, QA purchase flow verification (disabled during Auth QA per policy) |
| Fresh QA export with AUTH-NEW-02 | Requires QA Firebase config, backend endpoint, and signer verified |
| QA APK build (`com.bhumiamartya.app.qa`) | Requires QA keystore, QA `google-services.json`, Gradle config |
| Device login testing with QA accounts | Requires all above + controlled QA Google accounts |
| Production data isolation verification | Requires separate QA project with verified rules deployment |

---

## 5. ONE Simple Founder Action Needed Next

**ACTION:** Approve creation of a **separate Firebase QA project** using free-tier (Spark) resources.

**Required Founder inputs:**
1. **Project ID** (e.g., `bhumi-amartya-qa`) — name the project
2. **Confirmation** that $25 Play Console fee (if new account) is acceptable
3. **Authorization** to register `com.bhumiamartya.app.qa` with Google Cloud Console and derive SHA-1/SHA-256 from a QA keystore (not production)
4. **Confirmation** that Billing will remain **disabled** during initial Auth QA phase

**No other actions required.** Once approved, the following will be executed:
1. Create Firebase QA project → configure Google Auth, Web app, Android `.qa` registration
2. Set Firestore rules with owner isolation + server-owned field protection
3. Configure OAuth clients (Web + Android) with matching `default_web_client_id`
4. Deploy QA backend (token verification, profile bootstrap) on free-tier Cloud Run
5. Update local config with QA project IDs (no secrets in repo)
6. **Stop** — await separate Founder approval for Phase C (APK build + device testing)

---

## 6. Local Corrections vs. External Verification Distinction

| Category | Local (Implemented) | External (Requires Approval) |
|----------|---------------------|------------------------------|
| Guard code | ✅ `assertQaOperationAllowed`, `assertQaStagingAllowed`, `assertQaRuntimeDisabled` | — |
| QA config validation | ✅ `validateQaConfig` (strict mode/package/billing/origins) | — |
| QA runtime policy | ✅ `QA_RUNTIME_DISABLED` for incomplete config | — |
| Firebase project | — | ✅ Separate QA project creation |
| Google Auth | — | ✅ QA provider + test users |
| Android registration | — | ✅ `com.bhumiamartya.app.qa` + SHA fingerprints |
| OAuth clients | — | ✅ Web + Android matching `default_web_client_id` |
| Backend QA | — | ✅ Token verification, bootstrap, CORS |
| Billing disabled | ✅ Guard throws if Billing invoked in QA | — |
| Production isolation | ✅ Guard rejects inherited prod env | — |
| QA APK build | — | ✅ Phase C (separate approval) |
| Device testing | — | ✅ Phase C (separate approval) |

**Local implementation is complete.** External resources are the only remaining gap.

---

## 7. Master Tracking Updated

The following master documents have been updated with Phase B references:
- `BHUMI_MASTER_PROJECT_CHECKLIST.md`
- `BHUMI_MASTER_GAP_AND_RISK_REGISTER.md`
- `BHUMI_REMAINING_WORK_EXECUTION_PLAN.md`

All 44 requirement IDs (RCV-21..RCV-28), 25 RSK rows, and 21 DS rows preserved.

---

## 8. Final State

| Item | Status |
|------|--------|
| Local guards (Phase A) | ✅ IMPLEMENTED |
| Quality Gate | ✅ DEVELOPMENT PASS / RELEASE BLOCKED |
| External QA resources | ⏳ AWAITING FOUNDER APPROVAL |
| Firebase QA project | ⏳ NOT CREATED |
| QA signer / OAuth | ⏳ NOT CONFIGURED |
| Phase C (APK + device) | ⏳ BLOCKED — requires Phase B + separate approval |

**No external changes made.** No production Firebase accessed. No APK built. No transactions executed. No commits/pushes.

---

## 9. STOP — AWAITING FOUNDER APPROVAL

**NEXT ACTION REQUIRED:** Founder approves separate Firebase QA project creation using free-tier resources and confirms $25 Play Console fee (if applicable) + Billing disabled during Auth QA.

**Upon approval:** Phase B external configuration begins. Phase C (APK build + device testing) requires **separate subsequent approval**.

**TERIMA KASIH.**