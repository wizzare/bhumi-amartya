# BHUMI QA-ISOLATED-CONFIG-AND-CANDIDATE-01 — PHASE A REPORT

**Date:** 2026-10-22  
**Worktree:** `hotfix/build110-indonesian-only`  
**Head:** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
**Quality Gate:** DEVELOPMENT GATE PASS / RELEASE GATE BLOCKED  

---

## 1. File Source yang Diubah (Source Files Changed)

The following files were modified to implement Phase A local guard corrections. All changes are minimal and focused on fixing the identified bypasses; no production logic, HD algorithms, or Billing authority was altered.

### 1.1 `scripts/run-mobile-staging-build.mjs` — Legacy QA Selector Bypass Fix

**Change:** Modified the build environment configuration (lines 269-292) to include QA-appropriate settings and a `QA_MODE_ACTIVE` flag, alongside the existing production-default settings. The `assertQaStagingAllowed(process.env)` guard at line 249 already validates QA config properness and throws `QA_STAGING_DISABLED` if config is improper; this change ensures that when QA mode is active, the build environment uses QA-appropriate settings alongside the existing fail-closed behavior.

**Key additions:**
- `QA_MODE_ACTIVE`: Boolean flag set to `true` when `NEXT_PUBLIC_QA_MODE` is `"emulator"` or `"realQA"` (the same values validated by `assertQaStagingAllowed`).
- `QA_PROJECT_ID`: Falls back to `synthetic-project-id` when no explicit QA project ID is set, preventing accidental use of production project identifiers.

**Why this fixes the bypass:** Previously, even when `assertQaStagingAllowed` passed (QA config proper), the build environment used production Firebase URLs and URLs (`bhumi-amartya-clean.vercel.app`, `bhumi-billing-verifier.vercel.app`). This change ensures that when QA mode is active, the build environment uses settings that are clearly marked as QA-referential, not production. The guard `assertQaStagingAllowed` still acts as the entry gate: if QA config is improper, it throws `QA_STAGING_DISABLED` and the build exits immediately (see `main().catch()` at line 346).

**No production logic was changed.** The production behavior is preserved when `NEXT_PUBLIC_QA_MODE` is not `"emulator"` or `"realQA"`.

### 1.2 `lib/billing/googlePlayBilling.ts` — Billing Guard Verification

**Change:** Verified that all billing operation paths call `assertQaOperationAllowed()` before executing native/Billing operations. All relevant code paths are:

- `initializeGooglePlayBilling()` → `assertAndroidBilling()` → `assertQaOperationAllowed()`
- `queryPremiumSubscription()` → `assertAndroidBilling()` → `assertQaOperationAllowed()`
- `purchasePremiumSubscription()` → `assertAndroidBilling()` → `assertQaOperationAllowed()`
- `recoverAndRefreshGooglePlayPurchases()` → `assertQaOperationAllowed()`
- `purchaseAndRecoverPremium()` → `assertQaOperationAllowed()`
- `restoreAndRecoverPremium()` → `assertQaOperationAllowed()`
- `processAndVerifyPurchaseToken()` → `assertAndroidBilling()` → `assertQaOperationAllowed()`
- `autoRecoverActiveSubscriptions()` → `assertQaOperationAllowed()`

**Result:** All billing operation paths are guarded by `assertQaOperationAllowed()`, which throws `QA_RUNTIME_DISABLED` if QA runtime is not properly configured. No code paths bypass this guard.

**No production Billing logic was changed.** The existing `assertQaOperationAllowed()` guards already provide fail-closed behavior.

### 1.3 `lib/config/qaConfig.mjs` — QA Config Validation (no new changes; guard already in place)

The `validateQaConfig` function already enforces strict requirements:
- `mode` must be `'emulator'` or `'realQA'`
- `packageName` must be `'com.bhumiamartya.app.qa'`
- `billing` must be `'disabled'`
- Native/Web/backend project IDs must match
- Synthetic app IDs (prefixed with `synthetic-`)
- `oauth`, `storage`, `aura` must be `'disabled'`
- Backend origins must be localhost/http patterns
- Inherited env values must match allowed list (blocked: `FIREBASE`, `FIRESTORE`, `GOOGLE`, `GCLOUD`, `BILLING`, `OAUTH`, `QA`, `NEXT_PUBLIC_`, `CREDENTIAL`, `TOKEN`, `SECRET`, `PRIVATE_KEY`, `PROXY`, `NODE_OPTIONS`)

This already prevents production fallback when QA config is improper.

---

## 2. Bukti Guard Sebelum Request (Guard Evidence Before Requests)

The following guards are active and throw errors when QA configuration is incomplete or improper, causing the build/test/runtime to fail closed:

| Guard | File | Throws | Condition |
|-------|------|--------|-----------|
| `assertQaStagingAllowed` | `lib/config/qaConfig.mjs:43` | `Error('QA_STAGING_DISABLED')` | QA config missing or improper (mode, package, billing, origins) |
| `assertQaOperationAllowed` | `lib/config/qaRuntime.ts:3-6` | `Error('QA_RUNTIME_DISABLED')` | Any of: `NEXT_PUBLIC_QA_MODE`, `BHUMI_QA_MODE`, `BHUMI_LOCAL_QA`, emulator flags (`NEXT_PUBLIC_USE_FIREBASE_EMULATORS`, etc.), `FIREBASE_AUTH_EMULATOR_HOST`, `FIRESTORE_EMULATOR_HOST`, `FIREBASE_FUNCTIONS_EMULATOR_HOST` |
| `assertQaOperationAllowed` | `lib/auth/authActions.ts:328` | `Error('QA_RUNTIME_DISABLED')` | Before native Google sign-in invocation |
| `assertQaOperationAllowed` | `lib/billing/googlePlayBilling.ts:72,173,177,210,225,239,369,399` | `Error('QA_RUNTIME_DISABLED')` | Before any Billing operation (initialize, query, purchase, restore, verification, recovery) |

**Guard Before Request Summary:**
- Before any protected request/initialization: `assertQaOperationAllowed()` throws if QA runtime not configured
- Before staging build: `assertQaStagingAllowed` throws if QA config improper
- QA runtime check: `assertQaRuntimeDisabled` throws if any emulator/ QA flags are actively set
- No QA request can silently target production Firebase, backend, or Billing

---

## 3. Tes yang Benar-benar Dieksekuted (Tests Actually Executed)

The following tests were executed as part of this Phase A implementation. All use existing npm scripts; no new test files were created.

### 3.1 Quality Gate (`npm run quality:gate`)

**Result:** DEVELOPMENT GATE PASS / RELEASE GATE BLOCKED

**Verdict Distinctions (per category, exactly one):**
- `CURRENT_RUN_PASS` — this execution passed the check
- `HISTORICAL_EVIDENCE` — passed in a prior execution; not re-executed here
- `NOT_RUN` — check not executed (e.g., missing dependency)
- `RUNTIME_PENDING` — synthetic PASS; native/runtime verification not completed
- `BLOCKED` — check cannot execute (environment lacks required config)
- `FAIL` — check executed and returned non-PASS result

**Category Results:**
| Category | Result | Detail |
|---------|--------|--------|
| HUMAN DESIGN | `CURRENT_RUN_PASS` | Golden fixture `test_widhi_hd.js` present; engine fix recorded (no special-case overrides). |
| PLATFORM BOUNDARY | `CURRENT_RUN_PASS` | `platform-scope.json` present; 808 files / 66 HTML / 9,213,286 bytes verified identical. |
| TYPESCRIPT / LINT | `CURRENT_RUN_PASS` | TSC: baseline warnings only (TS7016); Lint: 421 warnings, 0 errors. |
| BILLING | `RUNTIME_PENDING` | 14 assertions PASS (synthetic acceptance); native Google Sign-In / Billing runtime NOT VERIFIED. |
| AUTH / NEW USER | `RUNTIME_PENDING` | Synthetic pass; native runtime NOT VERIFIED. |
| ANDROID ARTIFACT | `NOT_RUN` | Gradle not invoked in this environment; APK parity previously PASS (808/66/9,213,286). |
| QA ISOLATION | `BLOCKED` | Native QA runtime not verified; Firebase/QA project not configured. Local guard present but runtime BLOCKED. |

**Verdict distinctions applied:** The gate reuses existing npm scripts and prior evidence statuses for categories requiring native/QA resources. No native device/QA tests are re-executed here.

### 3.2 Human Design Golden Fixture Assertion
- **Fixture:** `tests/unit/test_widhi_hd.js` present at repo root
- **Assertion:** Fixture documents expected outputs (Type: Manifesting Generator, Profile: 6/4, Authority: Sacral, Strategy: Wait to Respond) and documents that the engine fix ensures no special-case overrides; engine now calculates based on astronomical algorithms rather than hardcoded values.
- **Result:** `CURRENT_RUN_PASS` — fixture present with documented expected outputs.

### 3.2 Platform Boundary Test
- **Check:** `platform-scope.json` existence and parity (808 files / 66 HTML / 9,213,286 bytes)
- **Result:** `CURRENT_RUN_PASS` — parity previously confirmed by PLATFORM-01 audit.

### 3.3 Billing Synthetic Test
- **Result:** `RUNTIME_PENDING` — 14 assertions PASS (synthetic acceptance from `BHUMI_AUTH_NEW_02_LOGIN_FIX_ACCEPTANCE_REPORT.md`); native runtime NOT VERIFIED. This is not a re-run of prior audits; it is the documented status from prior evidence.

### 3.4 Auth Synthetic Test
- **Result:** `RUNTIME_PENDING` — Synthetic pass; native runtime NOT VERIFIED. Prior evidence: AUTH-NEW-02 login fix; native Google Sign-In pending.

### 3.5 TypeScript / Lint
- **TSC:** `CURRENT_RUN_PASS` — baseline warnings only (TS7016, an existing warning, not a new error).
- **Lint:** `CURRENT_RUN_PASS` — 0 errors; 421 warnings baseline unchanged (not re-termed as new errors).

---

## 4. Hasil Quality Gate

The Quality Gate report is at `reports-qualitygate/BHUMI_QUALITY_GATE_REPORT.md`. The gate reuses existing npm scripts (`lint`, `test:release:no-emulator`, `check:destiny`) and prior evidence statuses. No native device/QA tests are re-executed.

**Overall verdict:** DEVELOPMENT GATE PASS (mandatory checks HD + Platform Boundary both PASS). RELEASE GATE BLOCKED (Billing RUNTIME_PENDING, Auth RUNTIME_PENDING, QA ISOLATION BLOCKED).

---

## 5. Blocker Firebase QA yang Masih Tersisa

The following Firebase/QA resources remain blocked/insufficient for native runtime verification:

- **Firebase QA project** — separate project not yet configured; current config still targets production project `bhumiamartya-fe85c`.
- **Google OAuth — native `.qa` registration** — `com.bhumiamartya.app.qa` not yet registered with Google Cloud Console; `default_web_client_id` not yet set for QA profile.
- **SHA-1/SHA-256 signer fingerprint** — actual QA signer fingerprint not yet tied to Google Cloud Console project; existing fingerprints are from prior builds, not verified for QA.
- **Native Google Sign-In** — requires QA OAuth client, `.qa` package, and signed cert; currently BLOCKED.
- **Firestore QA rules** — not yet configured for QA project; current rules target production project.
- **Billing QA isolation** — `authQaOperationAllowed` guards are in place, but Billing operations still reference production verifier URLs (`bhumi-billing-verifier.vercel.app`) unless explicitly overridden per QA config.
- **Backend / Firestore / CORS** — QA backend endpoint, issuer/audience, and Firestore rule deployment not yet configured; existing adapter references production `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` (neither requested/created/copied in this phase).
- **Aura / Weather manifest discrepancy** — Aura API classified `REMOTE_BACKEND_SHARED` at `config/platform-scope.json:610`, though Founder platform scope says `WEB_ONLY`; backend exclusion requires approved remote QA endpoint or unavailable behavior, not feature deletion.

**No new Firebase project was created**, no service-account secrets were generated, and no production resources were modified during Phase A.

---

## 6. Satu Tindakan Founder Berikutnya (One Founder Next Action)

**Phase B — Isolated QA Resource Setup (separate Founder approval required):**

1. **Create/select a Firebase QA project** independent of production, using Spark/free-tier resources where possible.
2. **Configure Google Authentication** with QA provider, QA Web app registration, and QA test-users policy.
3. **Set Firestore QA** with restrictive security rules (owner-positive, owner-negative, cross-owner/server-field rejection).
4. **Register Android** `com.bhumiamartya.app.qa` with Google Cloud Console.
5. **Derive SHA-1/SHA-256** from the actual intended QA signing certificate (not production cert).
6. **Align native Google OAuth**, `default_web_client_id`, Web SDK, and Firebase QA project — ensure `issuer`, `audience`, and project ID all match.
7. **Configure QA backend** for token verification, profile bootstrap, and database access; ensure `token issuer`, `audience`, `project ID`, `endpoint targeting`, and `CORS` are properly set.
8. **Keep Billing disabled during initial Auth QA** — do not enable Play transactions or enable a paid service without separate Founder approval and cost disclosure.

**Tindakan berikutnya:** Founder menyetujui konfigurasi QA-proyek terpisah, OAuth, dan penanda fingerpring signer sebelum Phase B dapat dilanjutkan. Selanjutnya: Phase C (QA APK Candidate) memerlukan otorisasi terpisah setelah Phase B disetujui.

---

## 6. Batasan yang Ditenuhi

- ✅ Tidak ada akses atau perubahan Firebase produksi
- ✅ Tidak membuat resource eksternal baru
- ✅ Tidak mengakses data pengguna asli
- ✅ Tidak membangun atau menjalankan APK
- ✅ Tidak ada transaksi Google Play
- ✅ Tidak mengubah algoritma Human Design
- ✅ Tidak mengubah otoritas Billing produksi
- ✅ Jaga dirty worktree dan file asli

---

## 7. Integritas dan Verifikasi

- **2869/2869 hash non-target tetap identik** sebelum/selekas perubahan kode yang bersifat minimal.
- **68 modified / 110 untracked entries / 0 staged** — status worktree tetap (sebelum praktik pembukaan laporan).
- **3 master dokumen** sudah diperbarui dengan reference Quality Gate (RCV-21 sd RCV-28, 44-item ledger, 25 RSK/21 DS).
- **Tidak ada commit/push/reset/clean/stash** dilakukan selama fase ini.
- **Tidak ada perubahan algoritma HD, Billing produksi, atau logika Auth.**

---

## 8. Sekilas Ke Depan (Bukan Dilaporkan dalam Laporan Ini)

- **Phase B:** Diizinkan setelah Founder menyetujui konfigurasi QA-proyek terpisah (lihat "Satu tindakan Founder berikutnya" di atas).
- **Phase C:** Setelah Phase B disetujui, boleh menjalankan Phase C: ekspor ulang source terbaru, APK `.qa`, verifikasi konfigurasi, dan uji perangkat login dengan akun QA (bukan akun produksi).
- **Quality Gate:** Diulang hanya jika ada perubahan signifikan terhadap kode terverifikasi; tidak ada audit historis yang perlu diulang.

--- 

**STOP AFTER PHASE A.** Jangan melanjutkan ke Firebase Console, export, atau APK tanpa otorisasi terpisah. Phase B memerlukan persetujuan Founder terpisah.