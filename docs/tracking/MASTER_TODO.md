# BHUMI AMARTYA — MASTER TRACKING TO-DO

**Document ID:** `TODO-MASTER-001`  
**Current Workstream:** Workstream 2 — Billing & Entitlement (ACTIVE)  
**Baseline Git Branch:** `hotfix/build110-indonesian-only`  
**Active HEAD:** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
**Last Updated:** 21 Oktober 2026  
**Status:** ACTIVE OPERATIONAL TRACKER  

---

## 1. WORKSTREAM ROADMAP OVERVIEW (FOUNDER ROADMAP DECISION)

Pengerjaan proyek Bhumi Amartya dibagi secara ketat berdasarkan keputusan Founder:

```
[ WORKSTREAM 1: HUMAN DESIGN STABILIZATION ] ──▶ (AUDITED & CLOSED / GATES OPEN)
       │ (HD-01 s/d HD-05 PASS, HD-06A Reconciled, Local Tests 100% Green)
       ▼
[ WORKSTREAM 2: BILLING & ENTITLEMENT ]     ──▶ (AKTIF - IN PROGRESS)
       │ (BILL-00 Baseline Audit PASS, BILL-01 Ownership & Integrity PASS)
       ▼
[ WORKSTREAM 3: OTHER BLUEPRINT EXPANSIONS ]──▶ (TERKUNCI / DEFERRED)
         (Weton, BaZi, Vedic, Tzolkin, Destiny Matrix)
```

> [!IMPORTANT]
> Modul pada **Workstream 3** (Weton, BaZi, Vedic, Tzolkin, Destiny Matrix) berstatus **DEFERRED / LOCKED**. Tidak ada modifikasi kode yang diizinkan untuk modul-modul tersebut selama Workstream 2 berlangsung.

---

## 2. WORKSTREAM 1: HUMAN DESIGN STABILIZATION MASTER BACKLOG

### Legend:
* `[x] DONE` — Telah diimplementasikan dan diverifikasi dengan automated test.
* `[-] PARTIAL` — Sebagian pekerjaan selesai, sub-sprint penerimaan masih berjalan.
* `[ ] READY` — Skenario dan runner telah disiapkan.
* `[!] OPEN GATE` — Membutuhkan dependensi eksternal atau verifikasi hardware fisik.

---

### Sprint HD-01: Security & Authentication Gateway
* **Status:** `[x] DONE` (PASS LOCAL — 12 tests)
* **Lead Agent:** OpenCode
* **Verifikasi:** Antigravity Audited (20 Okt 2026)
* [x] **TODO-HD01-01:** Implementasi centralized fail-closed auth verification (`lib/auth/hdEndpointAuth.ts`).
* [x] **TODO-HD01-02:** Penguncian route `app/api/humandesign/calculate` dengan validasi Bearer ID Token.
* [x] **TODO-HD01-03:** Penguncian route `app/api/humandesign/astrology` dengan validasi token.
* [x] **TODO-HD01-04:** Penolakan header bypass dalam mode produksi (`NODE_ENV === 'production'`).
* [x] **TODO-HD01-05:** Pembatasan dev bypass hanya untuk loopback local (127.0.0.1/localhost).
* [x] **TODO-HD01-06:** Dekomisioning endpoint usang `app/api/humandesign/bodygraph` (HTTP 410 Gone).

---

### Sprint HD-02: Canonical & Chart Structural Integrity
* **Status:** `[x] DONE` (PASS LOCAL — 10 tests)
* **Lead Agent:** OpenCode
* **Verifikasi:** Antigravity Audited (20 Okt 2026)
* [x] **TODO-HD02-01:** Pemisahan canonical provenance dari status core completeness (`lib/humandesign/completeness.ts`).
* [x] **TODO-HD02-02:** Penolakan response metadata-only tanpa field struktural riil.
* [x] **TODO-HD02-03:** Kontrak integritas tipe Reflector (semua 9 centers open dan 0 channels aktif diakui valid).
* [x] **TODO-HD02-04:** Isolasi data opsional (variabel digestion, sense) agar tidak membatalkan kelengkapan core.
* [x] **TODO-HD02-05:** Proteksi chart canonical yang tersimpan dari penimpaan data parsial.

---

### Sprint HD-03: Birth Input Binding & Concurrency
* **Status:** `[x] DONE` (PASS LOCAL — 10 TS + 7 Python tests)
* **Lead Agent:** OpenCode
* **Verifikasi:** Antigravity Audited (20 Okt 2026)
* [x] **TODO-HD03-01:** Implementasi fungsi sidik jari deterministik `computeBirthInputFingerprint` (`bip_v1_<fnv1a32>`).
* [x] **TODO-HD03-02:** Deteksi perubahan menit lahir, kota, atau koordinat geografis sebagai revisi baru.
* [x] **TODO-HD03-03:** Pembatalan kalkulasi in-flight jika data lahir diubah saat kalkulasi berjalan.
* [x] **TODO-HD03-04:** Deduplikasi pemanggilan engine untuk UID dan revisi yang sama (shared promise).
* [x] **TODO-HD03-05:** Pembatalan proses simpan jika pengguna melakukan logout di tengah kalkulasi.
* [x] **TODO-HD03-06:** Resolusi IANA timezone dan transisi DST historis di engine Python (`main.py`).

---

### Sprint HD-04: Engine Reliability & Recovery
* **Status:** `[x] DONE` (PASS LOCAL — 13 transport + 20 scenario checks)
* **Lead Agent:** OpenCode
* **Verifikasi:** Antigravity Audited (20 Okt 2026)
* [x] **TODO-HD04-01:** Pembatasan batas waktu klien 25 detik dan gateway proxy 15 detik.
* [x] **TODO-HD04-02:** Akuisisi token Firebase dan pembacaan body response berada dalam deadline terikat.
* [x] **TODO-HD04-03:** Klasifikasi error HTTP dan kebijakan bounded retry (hanya 429 & 500 yang di-retry).
* [x] **TODO-HD04-04:** Implementasi shared recovery executor (`lib/humandesign/hdRecovery.ts`).
* [x] **TODO-HD04-05:** Authoritative round-trip reread dari Firestore sebelum mengonfirmasi status sukses.
* [x] **TODO-HD04-06:** Transactional write guard mencegah penimpaan chart lengkap oleh state pending.

---

### Sprint HD-05: UI Resilience & Cache
* **Status:** `[x] DONE` (PASS LOCAL BROWSER — 90 unit tests + 55 browser scenarios PASS)
* **Lead Agent:** OpenCode / Antigravity
* [x] **TODO-HD05-01:** Pembuatan komponen status eksplisit `HdStatus.tsx` dan `HdStoredStatus.tsx`.
* [x] **TODO-HD05-02:** Pencegahan infinite loading pada akun tanpa blueprint (`missing_blueprint`).
* [x] **TODO-HD05-03:** In-memory session cache dengan TTL 5 menit diisolasi per UID dan revision hash.
* [x] **TODO-HD05-04:** Penyelarasan banner pending di dashboard (`PendingHdRecoveryBanner.tsx`).
* [x] **TODO-HD05C:** Pembuatan local browser harness, network guard, dan mock synthetic Firebase.
* [x] **TODO-HD05D-01 (Flow D — Account Isolation):** `[x] DONE` (Playwright Chromium, 7/7 scenarios PASS, 104 checks, 0 unhandled).
* [x] **TODO-HD05D-02 (Flow A — New User Onboarding):** `[x] DONE` (Playwright Chromium, 10/10 scenarios PASS, 110 assertions, 0 unhandled).
* [x] **TODO-HD05D-03 (Flow B — Birth Data Correction):** `[x] DONE` (Playwright Chromium, 13/13 scenarios PASS, 67 assertions in runner / 70 total checks verified, 0 unhandled).
* [x] **TODO-HD05D-04 (Flow C — Dashboard Pending & Recovery):** `[x] DONE` (Playwright Chromium, 15/15 scenarios PASS, 100% assertions green, 0 unhandled).
* [x] **TODO-HD05D-05 (Acceptance Closure):** `[x] DONE` (55/55 browser scenarios verified).

---

### Sprint HD-06A: Release Gate Reconciliation & Safe Build Validation
* **Status:** `[x] AUDITED (PARTIAL / RELEASE GATES OPEN)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-HD06A-01:** Rekonsiliasi 10 Release Gates dengan status eksplisit.
* [x] **TODO-HD06A-02:** Verifikasi integritas working tree dan penyusunan `PATCH_MANIFEST.json` (108 entri).
* [x] **TODO-HD06A-03:** Validasi safe local build (Webpack 64s PASS, Typecheck PASS, static export dual-mode terpetakan).
* [x] **TODO-HD06A-04:** Penyelarasan test suite Build 107 contract & mitigasi collision hash FNV-1a.
* [!] **TODO-HD06A-05:** Release Gates Open: GATE-06 (Android Device), GATE-07 (Real Engine Endpoint), GATE-09 (Production Parity).

---

## 3. WORKSTREAM 2: BILLING & ENTITLEMENT MASTER BACKLOG

### Sprint BILL-00: Billing Source Audit & Baseline
* **Status:** `[x] DONE (BASELINE AUDIT COMPLETE)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL00-01:** Audit jalur Google Play purchase & native Capacitor bridge (`lib/billing/googlePlayBilling.ts`).
* [x] **TODO-BILL00-02:** Audit backend verifier microservice (`services/billing-verifier/api/billing/google-play/verify.ts`).
* [x] **TODO-BILL00-03:** Audit purchase token ownership & UID switching (`TOKEN_OWNERSHIP_CONFLICT` & `billing_purchase_tokens`).
* [x] **TODO-BILL00-04:** Audit subscription renewal, grace period, cancellation, & cron reconciliation (`api/billing/reconcile.ts`).
* [x] **TODO-BILL00-05:** Audit entitlement precedence unioning (`lib/billing/entitlementService.ts`).
* [x] **TODO-BILL00-06:** Audit Trial/Founder/Lifetime/Grant states & canonical Firestore synchronization.
* [x] **TODO-BILL00-07:** Audit restore purchase & recovery state machine (`lib/billing/premiumRecovery.ts`).
* [x] **TODO-BILL00-08:** Inventarisasi technical debt & dead code (legacy `MOANA_` mocks, obsolete 3-day grant, `UserPlan` localStorage).
* [x] **TODO-BILL00-09:** Rekomendasi sprint perbaikan BILL-01 s/d BILL-04.

---

### Sprint BILL-01: Purchase Ownership & Canonical Entitlement Integrity
* **Status:** `[x] DONE (PASS LOCAL / POLICY PENDING)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL01-01 (Ownership Matrix):** Implementasi & eksekusi BILL01-01 s/d BILL01-10 di `services/billing-verifier/tests/unit/bill01-ownership-and-verifier.test.ts`.
* [x] **TODO-BILL01-02 (Integrity Matrix):** Implementasi & eksekusi BILL01-11 s/d BILL01-20 di `tests/unit/bill01-entitlement-integrity-client.test.ts`.
* [x] **TODO-BILL01-03 (Bug Fix):** Perbaikan `persistEntitlement` agar token expired tidak mendowngrade active future subscription (`isStaleOlderToken`).
* [x] **TODO-BILL01-04 (Precedence Conflict Record):** Dokumentasi formal perbedaan Option A (Paid > Tester Grant) vs Option B (Tester Grant > Paid).
* [x] **TODO-BILL01-05 (Security Audit):** Audit `firestore.rules` dan `stripServerOwnedAccessFields` (fail-closed boundary).

---

### Sprint BILL-02: Google Play Verification, Restore & Failure Resilience
* **Status:** `[x] DONE (PASS LOCAL — 41 CHECKS)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL02-01 (Security Carryover):** Verifikasi ulang 7 skenario carryover BILL-01 di `services/billing-verifier/tests/unit/bill02-carryover-and-verifier.test.ts` (PASS 7/7).
* [x] **TODO-BILL02-02 (Older Voided Token Bug Fix):** Perbaikan `isStaleOlderToken` di `services/billing-verifier/lib/entitlement.ts` agar token voided/refunded lampau tidak mendowngrade subscription aktif (PASS).
* [x] **TODO-BILL02-03 (Verifier API Acceptance):** Implementasi & verifikasi HTTP contracts (200, 400, 401, 403, 409, 500, 502, 504) di `services/billing-verifier/tests/unit/bill02-verifier-api-acceptance.test.ts` (PASS 14/14).
* [x] **TODO-BILL02-04 (Background Reconcile Worker):** Audit & verifikasi cron authentication, pagination 25, lease ownership, backoff, dan dead-lettering di `api/billing/reconcile.ts` (PASS 5/5).
* [x] **TODO-BILL02-05 (Restore Purchases Acceptance):** Implementasi & verifikasi BILL02-01 s/d BILL02-12 di `tests/unit/bill02-restore-and-client-lifecycle.test.ts` (PASS 12/12).
* [x] **TODO-BILL02-06 (Client Boundary Hardening):** Validasi fail-closed Web platform, isolasi SecureStorage UID partitioning, dan offline ECDSA signed entitlement (PASS 3/3).

---

### Sprint BILL-03: Subscription Lifecycle, Expiry, Refund & Reconciliation Integrity
* **Status:** `[x] AUDITED (PARTIAL — CLOSED IN BILL-03A)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL03-01 (Security Carryover Audit):** Re-audit `isStaleOlderToken` & minimal patch untuk token non-authoritative dan dateless token di `services/billing-verifier/lib/entitlement.ts` (PASS 7/7).
* [x] **TODO-BILL03-02 (Lifecycle Matrix BILL03-01 s/d BILL03-20):** Implementasi & verifikasi 20 skenario lifecycle (renewal, out-of-order, cancellation, grace period, account hold, refund, pending, replacement) di `services/billing-verifier/tests/unit/bill03-lifecycle-and-reconcile.test.ts` (PASS 20/20).
* [x] **TODO-BILL03-03 (Authority & Expiration 1 s/d 10):** Verifikasi keabsahan provider expiry, anti-tampering timestamp klien, immutability trial habis, founder permanence, dan anti self-grant di `tests/unit/bill03-authority-and-offline.test.ts` (PASS 10/10).
* [x] **TODO-BILL03-04 (Offline Entitlement & Clock Rollback 1 s/d 6):** Audit kriptografis ECDSA ES256, UID binding, batas 72 jam grace offline, dan penolakan clock rollback di `tests/unit/bill03-authority-and-offline.test.ts` (PASS 6/6).
* [x] **TODO-BILL03-05 (Reconciliation & Deferred Ack BILL03-21 s/d BILL03-30):** Verifikasi durable ack job, worker retry, lease locking, backoff, dead-lettering, operator recovery, dan deadline safety di `services/billing-verifier/tests/unit/bill03-lifecycle-and-reconcile.test.ts` (PASS 10/10).
* [x] **TODO-BILL03-06 (Multi-Token Data Model Audit):** Audit batasan model dokumen flat Firestore vs registry token aktif & dokumentasi proposal migrasi aman tanpa mutasi skema prematur (AUDITED).

---

### Sprint BILL-03A: Critical Entitlement Integrity Closure
* **Status:** `[x] DONE (PASS LOCAL — 30 CHECKS)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL03A-01 (Section A: Critical Refund Guard A01 - A08):** Perbaikan bug `isStaleOlderToken` via `isAuthoritativeActiveToken` di `services/billing-verifier/lib/entitlement.ts` sehingga refund dengan `date = null` atau `date < existingExpiry` serta akun legacy mencabut akses Premium secara fail-closed, tanpa menyentuh langganan aktif independen atau hak Founder/Tester (`bill03a-critical-integrity.test.ts`, PASS 8/8).
* [x] **TODO-BILL03A-02 (Section B: Active Token Hash Correctness B01 - B06):** Penghapusan bug "last-token-wins" pada `activeTokenHash`; token dengan masa aktif terpanjang (Dec 1 vs Nov 1) dipertahankan sebagai hash otoritatif (`bill03a-critical-integrity.test.ts`, PASS 6/6).
* [x] **TODO-BILL03A-03 (Section C: Acknowledgement Durability C01 - C08):** Validasi queue PostgreSQL, status `[LEDGER_TX_DEGRADED]`, lease timeout 5 menit, dead-lettering setelah 5 attempt, dan batas 72 jam Play Store (`bill03a-ack-durability.test.ts`, PASS 8/8).
* [x] **TODO-BILL03A-04 (Section D: Offline Entitlement Safety D01 - D08):** Pengujian ketat offline grace 72 jam, penolakan device clock rollback, clock skew tolerance 60 detik, isolasi UID, dan kegagalan fail-closed pada tamper cache (`bill03a-offline-safety.test.ts`, PASS 8/8).
* [x] **TODO-BILL03A-05 (Multi-Token Schema Blocker & Founder Proposal):** Identifikasi batasan flat `users/{uid}` schema sebagai formal **DESIGN BLOCKER** dan penyusunan proposal migrasi koleksi token untuk evaluasi Founder.
* [x] **TODO-BILL03A-06 (Full Regression Gate):** Verifikasi seluruh 142 billing tests (92 server + 50 client), TypeScript check clean (0 error), ESLint clean (0 error).

---

### Sprint BILL-03B: Multi-Token Fallback & Acknowledgement Recovery
* **Status:** `[x] AUDITED (PARTIAL — CLOSED IN BILL-03B.1)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL03B-01 (Option A Multi-Token Fallback Implementation):** Implementasi server-side fallback di `services/billing-verifier/lib/entitlement.ts` menggunakan kueri single-field `billing_purchase_tokens.where("uid", "==", uid)` di dalam transaksi Firestore tanpa perubahan skema maupun migrasi.
* [x] **TODO-BILL03B-02 (Multi-Token Fallback Matrix MT-01 s/d MT-10):** Verifikasi lengkap 10 skenario fallback multi-token di `services/billing-verifier/tests/unit/bill03b-multi-token-fallback.test.ts` (PASS 10/10), membuktikan server memulihkan akses tanpa bergantung pada aplikasi dibuka kembali (MT-01 & MT-10 terbukti).
* [x] **TODO-BILL03B-03 (Acknowledgement Recovery ACK-01 s/d ACK-10):** Verifikasi jalur pemulihan durable queue, klarifikasi `MAX_ATTEMPTS = 10` dari `reconcile.ts`, lease timeout 5 menit, dead-lettering, dan prosedur pemulihan operator di `services/billing-verifier/tests/unit/bill03b-ack-recovery.test.ts` (PASS 10/10).
* [x] **TODO-BILL03B-04 (Offline Clock Safety CLK-01 s/d CLK-08):** Verifikasi anti-clock rollback, toleransi clock skew 60 detik, penegakan batas 72 jam grace offline, stabilitas epoch UTC terhadap timezone, dan pembatalan fail-closed saat reconnect di `tests/unit/bill03b-offline-clock-safety.test.ts` (PASS 8/8).
* [x] **TODO-BILL03B-05 (RSK-18 Resolution):** Status RSK-18 direview kembali pada BILL-03B.1 untuk verifikasi kegagalan kueri dan semantik transaksi.
* [x] **TODO-BILL03B-06 (Full Regression Suite):** Verifikasi seluruh 170 billing tests (112 backend + 58 client), TypeScript checks clean (0 error), ESLint clean (0 error).

---

### Sprint BILL-03B.1: Multi-Token Fallback Failure Safety & Transaction Integrity
* **Status:** `[x] DONE (PASS LOCAL — 15 NEW SCENARIOS, 191/191 TOTAL)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL03B1-01 (MT-07 Contradiction Resolution):** Menghapus `try...catch` yang menelan error kueri token alternatif di `services/billing-verifier/lib/entitlement.ts`. Kueri yang gagal/timeout kini melempar error retryable dan membatalkan (ABORT) transaksi Firestore, mencegah downgrade destruktif ke FREE saat transient error terjadi.
* [x] **TODO-BILL03B1-02 (Firestore Transaction Read-Before-Write Invariant):** Menata ulang urutan operasi di `persistEntitlement` sehingga seluruh pembacaan (`tokenSnap`, `userSnap`, `tokensQuery`) dieksekusi sebelum penulisan (`transaction.set`), sesuai kontrak Firestore Admin SDK.
* [x] **TODO-BILL03B1-03 (Fallback Acceptance Matrix BF-01 s/d BF-15):** Mengimplementasikan dan meloloskan 15 skenario pengujian di `services/billing-verifier/tests/unit/bill03b1-fallback-safety.test.ts` (PASS 15/15), mencakup kegagalan kueri, timeout, pembatalan bersamaan, rollback penulisan, dan akun legacy.
* [x] **TODO-BILL03B1-04 (Registry Freshness & Validation Policy):** Memperketat validasi kandidat token alternatif (hash pengecualian, status non-voided, masa berlaku di masa depan, penolakan `lastVerifiedAt` malformed) serta mendokumentasikan kebijakan verifikasi ulang ke Google Play.
* [x] **TODO-BILL03B1-05 (ACK-03 & Offline Clock Durability Verification):** Memastikan kembali ACK-03 degradasi ledger status saat Neon offline dan batasan residual rollback jam offline tetap terdokumentasi tanpa overclaim.
* [x] **TODO-BILL03B1-06 (Full Regression Suite Gate):** 191 billing checks pass (133 backend + 58 client), 0 regressions, TypeScript & ESLint 0 errors.

---

### Sprint BILL-04: Premium UI Harmonization, Paywall Consistency & Safe Legacy Cleanup
* **Status:** `[x] DONE (PASS LOCAL — 25 NEW SCENARIOS, 216/216 TOTAL)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL04-01 (Dual-Display Presentation Architecture):** Mengimplementasikan dual-display presentation mapper di `lib/billing/entitlementPresentation.ts` (`commercialStatus`, `communityBadge`, `isDualDisplay`, `isLifetime`, `formattedExpiry`, `daysRemaining`) memisahkan status komersial dari lencana komunitas tanpa saling menimpa (`tests/unit/billing-entitlement-presentation.test.ts`, PASS 18/18).
* [x] **TODO-BILL04-02 (Canonical UI Surface Implementation):** Membangun komponen antarmuka kanonikal `components/billing/CanonicalPremiumScreen.tsx` dan memperbarui `app/premium-bhumi/page.tsx` dengan dual-display, Google Play live pricing via `queryPremiumSubscription()`, fallback netral tanpa hardcoded authority, dan guard platform web (`tests/unit/v5-08-premium-residual.test.ts`, PASS 46/46).
* [x] **TODO-BILL04-03 (Settings Surface Normalization):** Menyelaraskan `app/settings/page.tsx` untuk mengonsumsi `getBillingPresentation(entitlement, originalProfile, testerRecord)`, menampilkan `membershipDisplay.formattedExpiry` & `communityBadge`, membersihkan mutasi `localStorage.setItem(USER_PLAN_STORAGE_KEY)`, dan memelihara kompatibilitas date locale formatting (`build108-sprint07-settings-legal-paywall.test.ts`, PASS 64/64).
* [x] **TODO-BILL04-04 (Legacy Code & Mock Cleanup):** Memperbarui konstanta usang `TODO_PLAY_CONSOLE_...` di `lib/billing/billingPreparation.ts` menjadi `bhumi_premium_monthly` / `bhumi_premium_yearly` dengan deprecation tag resmi.
* [x] **TODO-BILL04-05 (UI Acceptance Matrix UI-01 s/d UI-25):** Mengimplementasikan dan meloloskan seluruh 25 skenario penerimaan antarmuka di `tests/unit/bill04-ui-acceptance.test.ts` (PASS 25/25).
* [x] **TODO-BILL04-06 (Full Regression Gate):** 216 checks billing tests pass (133 backend + 83 client), TypeScript check root & billing-verifier 0 errors, ESLint 0 errors.

---

### Sprint BILL-04A: Premium UI Real-Browser Acceptance & Regression Closure
* **Status:** `[x] DONE (PASS LOCAL BROWSER — 25/25 SCENARIOS PASS, 0 FAILED)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL04A-01 (Playwright Chromium Real-Browser Harness):** Menyiapkan harness peramban Chromium Playwright lokal dengan synthetic Firebase Auth/Firestore dan synthetic Capacitor native billing bridge tanpa koneksi ke cloud produksi.
* [x] **TODO-BILL04A-02 (Browser Acceptance Scenarios UI-01 s/d UI-25):** Menjalankan dan membuktikan 25 skenario penerimaan antarmuka aktual di `tests/qa/bill04a-browser-acceptance.ts` (PASS 25/25).
* [x] **TODO-BILL04A-03 (Screenshot Artifacts Generation):** Menghasilkan 22 artefak tangkapan layar di `qa-artifacts/bill04a-browser/` yang memvalidasi rendering mobile (390x844) dan desktop (1440x900) dengan zero horizontal overflow (`scrollWidth <= clientWidth`).
* [x] **TODO-BILL04A-04 (In-Flight Click Deduplication):** Memverifikasi deduplikasi klik cepat simultan pada tombol pembelian (UI-24); in-flight lock memastikan tepat 1 verifier call dipicu.
* [x] **TODO-BILL04A-05 (Session Switching & Isolation):** Memverifikasi isolasi sesi penuh antar-pengguna (UI-20) dan pembuangan respon verifikasi yang terlambat via invarian `AUTH_CHANGED` (UI-21).
* [x] **TODO-BILL04A-06 (Full Regression & Scope Non-Claims):** 133 unit tests backend verifier PASS, 85 unit tests client billing & residual contracts PASS, TypeScript 0 errors. Android native dan transaksi Google Play nyata ditegaskan berstatus **STRICTLY NOT VERIFIED**.

---

### Sprint BILL-05A: Android Billing Readiness, Capacitor Native Contract & Safe Local Build
* **Status:** `[x] AUDITED (CONTRACT PASS / BUILD & EMULATOR GATES OPEN)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL05A-01 (Environment & Toolchain Audit):** Audit tepat versi toolchain aktif: Next.js 16.2.6, React 19.2.4, Capacitor 8.3.4, Google Play Billing 9.1.0, Gradle 9.4.1, AGP 9.2.1, JDK 17.0.20.1, Android SDK 36 (compileSdk 36, targetSdk 36, minSdk 24). Rekonsiliasi versi Next.js tercatat.
* [x] **TODO-BILL05A-02 (Next.js Static Export & Human Design Blocker Resolution):** Audit blocker `/api/humandesign/bodygraph` (HTTP 410) pada static export (`output: 'export'`). Identifikasi dual-mode build (Serverless web deployment vs Capacitor static client shell). Usulan perbaikan ditandai `CROSS-WORKSTREAM APPROVAL REQUIRED` tanpa memodifikasi file Human Design secara sepihak.
* [x] **TODO-BILL05A-03 (Capacitor Android Contract Audit):** Audit `MainActivity.java`, `BhumiBillingPlugin.java`, permissions `com.android.vending.BILLING`, internet, network state. Verifikasi ProGuard/R8 rules di `proguard-android-optimize.txt` dan `capacitor.community.securestorage`.
* [x] **TODO-BILL05A-04 (Google Play Billing Native Contract Audit):** Audit `BillingClient` init dengan `enablePendingPurchases()`, query `QueryProductDetailsParams` untuk `bhumi_premium_monthly` / `monthly`, purchase launch dengan `setObfuscatedAccountId(uid)`, native-level handling `ITEM_ALREADY_OWNED` via in-flight fetch recovery, zero logging token di release, dan deferred acknowledgement ke backend verifier.
* [x] **TODO-BILL05A-05 (Local Android Build & Emulator Gate Evaluation):** Eksekusi evaluasi build debug: identifikasi error `processDebugGoogleServices` akibat suffix `.qa` di `buildTypes.debug` yang tidak terdaftar di `google-services.json`. Evaluasi transparan 20 skenario Android (NATIVE-01..20: 10 static contract PASS, 10 build/emulator open gates).
* [x] **TODO-BILL05A-06 (Browser vs Native Gap Matrix & BILL-05B Design):** Formulasi gap matrix (Playwright mock vs Android runtime vs Live Play API) dan perancangan dokumen kendali uji Google Play Internal Testing BILL-05B (9 skenario lisensi, exit criteria, monitoring, rollback, zero production execution).

---

### Sprint BILL-05B: Google Play Internal Testing & Native End-to-End Verification
* **Status:** `[ ] PENDING AUTHORIZATION (NOT AUTHORIZED / DESIGN ONLY)`
* [ ] **TODO-BILL05B-01:** Verifikasi transaksi nyata Google Play License Testing pada perangkat fisik Android (Slow test renewal, pending purchase, cancel paid-through, restore multi-device, account hold).
* [ ] **TODO-BILL05B-02:** Verifikasi sinkronisasi Real-time Developer Notifications (RTDN) Pub/Sub ke backend billing verifier.

---

### Sprint BILL-06: Production Readiness, Security & Final Release Gate
* **Status:** `[ ] BLOCKED (NOT AUTHORIZED / PENDING FOUNDER REVIEW)`
* [ ] **TODO-BILL06-01:** Audit akhir kesiapan rilis produksi Play Store AAB/APK dan Firebase/Postgres production deploy.

---

### Sprint DASH-LOCK-01: Dashboard Final Lock & Android Build Readiness Hygiene
* **Status:** `[x] AUDITED (LOCAL PASS / BUILD PREPARATION READY / RELEASE GATES OPEN)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-DASHLOCK-01 (Preflight & Git Worktree Audit):** Verifikasi working tree, HEAD `608f61c4`, 6 modified files, 1 untracked production file (`lib/astrology/transitEvents.ts`), zero secret leakage.
* [x] **TODO-DASHLOCK-02 (Dashboard Runtime & Source Completeness):** Verifikasi 7 file runtime Dashboard (`CoreIdentity.tsx`, `DashboardClient.tsx`, `AstroTodayCard.tsx`, `CelestialMoon.tsx`, `transitEvents.ts`, `calculateCurrentSky.ts`, `dailyAstroSynthesis.ts`).
* [x] **TODO-DASHLOCK-03 (Test Route Containment Strategy):** Audit 3 test routes di `app/` (`test-astro-transit`, `test-identitas-inti`, `test-3d-poc`) dan dampaknya pada static export Capacitor. Strategi isolasi disusun untuk persetujuan Founder.
* [x] **TODO-DASHLOCK-04 (Generated Types Reproducibility):** Audit `.next/dev/types/validator.ts` ephemeral status; typecheck bebas error tanpa manual patching (`npx tsc --noEmit` exit 0).
* [x] **TODO-DASHLOCK-05 (Dashboard & Astro Regression Gate):** 44 Astro transit tests PASS, 20 V5 Astro core tests PASS, 29 Build106 regression assertions PASS, 11 Canonical Today tests PASS, 22 V5 synthesis tests PASS, 43 Playwright browser assertions PASS (3 viewports), 4 natal vs transit isolation checks PASS.
* [x] **TODO-DASHLOCK-06 (Build Config & Static Export Audit):** Audit `next.config.ts`, `capacitor.config.ts`, `package.json`, asset parity path, dan HTTP 410 decommissioned endpoints.


---

## 4. SUMMARY METRICS

| Kategori | Jumlah Item | Persentase |
|---|---|---|
| **Selesai (DONE / AUDITED)** | 87 item | 94.6% |
| **Sedang Berjalan (PARTIAL / READY)** | 1 item | 1.1% |
| **Menunggu (PENDING)** | 2 item | 2.2% |
| **Terkunci / Open Gates (BLOCKED / GATES OPEN)** | 2 item | 2.2% |
| **Total Tracking Items** | **92 item** | **100%** |


---

### Sprint DASH-WEEKLY-01: Build 118 Personal Weekly Cosmic & Soul Guidance
* **Status:** `[x] DONE (PASS LOCAL — 93 tests)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-01 (Timing & ISO-8601 Week Engine):** Eliminasi bug tabrakan kunci minggu; implementasi penghitungan minggu ISO-8601 berbasis Luxon (`lib/weeklyGuidance/weeklyTransitCalculator.ts`).
* [x] **TODO-B118-02 (Weekly Ephemeris & Collective Sky):** Perhitungan posisi Sun, Moon, dan 8 planet SwissEph apparent geocentric; fase Bulan numerik & iluminasi; deteksi planet retrograde/direct; station & ingress diskrit mingguan.
* [x] **TODO-B118-03 (Placidus Natal Transits & Cusp Crossings):** Perhitungan rumah Placidus yang dilintasi transit planet; deteksi penyeberangan cusp; perhitungan 5 aspek utama terhadap natal Sun, Moon, Ascendant, placements natal, orb, dan waktu puncak eksak.
* [x] **TODO-B118-04 (Eight Life Domains Integration):** Pemetaan transit personal ke 8 domain kehidupan dengan bukti astrologi eksplisit (derajat, rumah, aspek), makna astrologis, makna spiritual mendalam, dan Saran Bhumi spesifik.
* [x] **TODO-B118-05 (Canonical Blueprint Depth):** Integrasi kontribusi pendalaman Life Path 1–9/11/22/33, Human Design (Type, Strategy, Authority), dan Pusat Arcana Matrix Destiny.
* [x] **TODO-B118-06 (Spiritual Safety Protocols):** Penegakan batas etis: tanpa diagnosis gangguan jiwa klinis, tanpa ramalan kutukan/serangan gaib, tanpa romanticizing depresi/trauma.
* [x] **TODO-B118-07 (Copy Glitch & Chinese Characters Cleanup):** Pembersihan total karakter Mandarin ('jangan等到') dan normalisasi kalimat Bahasa Indonesia baku dan reflektif.
* [x] **TODO-B118-08 (Dashboard Cosmic Summary & UI Refinement):** Ringkasan kosmik di Dashboard (rentang, iklim kolektif, transit terkuat, 3 domain highlight, pesan spiritual); tampilan 8 domain interaktif via tab selector mobile-friendly dengan CTA.
* [x] **TODO-B118-09 (Lifecycle State Reset & Efficiency Guard):** Reset `setWeeklyGuidance(null)` saat pergantian UID; pelepasan timer 30 detik dari effect kalkulasi mingguan.
* [x] **TODO-B118-10 (Version Convergence 118 / 5.0.18):** Penyelarasan versi Android native `versionCode 118` dan `5.0.18` di `build.gradle`, `buildInfo.ts`, dan tes rekonsiliasi.

---

### Sprint DASH-WEEKLY-02: Build 118 Vertical Accordion UI & Canonical Cross-System Synthesis & Narrative Humanization
* **Status:** `[x] DONE (PASS LOCAL — 136 tests)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-11 (Vertical Accordion Domain Cards UI):** Menghapus horizontal pill scroll bar; mengganti dengan 8 kartu vertikal full-width dengan ikon SVG, judul lengkap tanpa terpotong, ringkasan personal 1–2 baris, badge aktivasi transit, dan chevron toggle. Menghubungkan klik 3 kartu domain highlight di `DashboardClient.tsx` untuk membuka accordion target dengan smooth scroll.
* [x] **TODO-B118-12 (Canonical Cross-System Synthesis Engine):** Mengekstrak data kanonikal lengkap via `extractFullCanonicalBlueprint()` (Destiny Matrix Love Line, Money Line, Karmic Tail, Arcana Tahunan, Talenta; Human Design Type, Authority, Profile, Centers, Not-Self; BaZi Day Master; Vedic Nakshatra; Weton; Tzolkin; Numerology). Mengintegrasikannya ke dalam 8 domain narasi personal.
* [x] **TODO-B118-13 (Humanized Spiritual Tone & Boilerplate Elimination):** Menghapus pola kalimat AI yang berulang ("Awal pekan dimulai dengan kesadaran penuh...", "Arus keuangan terhubung dengan rumah...", "Kosmos mengarahkan kita..."). Mengadopsi nada pendamping spiritual yang hangat, peka tema karma, shadow work, dan pertumbuhan batin. Memperbaiki duplikasi rumah ("rumah ke-9 dan rumah ke-9") via `formatHousePair()`.
* [x] **TODO-B118-14 (Foundations Drawer / Dasar Pembacaan):** Mengimplementasikan laci teknis `<details>` di setiap kartu domain yang memaparkan secara transparan seluruh indikator sistem yang digunakan (planet transit, derajat, rumah Placidus, aspek, orb, fase, arcana, center HD).
* [x] **TODO-B118-15 (Comprehensive Test Suite Expansion):** Memperluas `tests/unit/build118-weekly-guidance.test.ts` menjadi 136 assertion mencakup verifikasi sintesis kanonikal, diferensiasi User A vs User B, ketiadaan duplikasi rumah, dan ketiadaan formula AI klise. Seluruh 136 checks PASS LOCAL.

---

### Sprint DASH-WEEKLY-03: Canonical Love Path Data Integrity & Asmara Relationship Status Personalization
* **Status:** `[x] DONE (PASS LOCAL — 187 checks, Typecheck PASS, HTTP 200)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-16 (Root Cause Investigation & MapToBlueprint Fix):** Menyelidiki akar masalah bug `8–10–7` pada akun Founder (1985-05-03) yang sebelumnya merender Arcana 8 (Justice) di Love Line akibat `mapToBlueprint.ts` legacy yang menyisipkan `epoint` (pusat). Mengalihkan `calculateDestinyMatrixForBlueprint` ke `calculateCanonicalDestinyMatrixBlueprint`, menghasilkan simpul kanonikal `[7, 10, 21]` (7 The Chariot, 10 Wheel of Fortune, 21 The World).
* [x] **TODO-B118-17 (Hydration & Self-Healing Guard):** Menambahkan deteksi otomatis di `extractFullCanonicalBlueprint` dan `DashboardClient.tsx` untuk merehidrasi data kanonikal jika blueprint tersimpan memiliki pola bug legacy (`loveLine[0] === center`).
* [x] **TODO-B118-18 (Non-Generic Dynamic Arcana Interpretation):** Mengeliminasi hardcode "pengorbanan sepihak" dari pembacaan Asmara. Mengimplementasikan `interpretLovePathArcana()` yang secara dinamis mengekstrak arketipe dan makna hubungan nyata dari `destinyMatrixArcanaDictionary` sesuai nomor arcana pengguna.
* [x] **TODO-B118-19 (Asmara Relationship Status Personalization):** Mengintegrasikan status hubungan pengguna (`single` / lajang vs `in_relationship` / berpasangan vs `unspecified`). Membedah kesiapan batin, pola memilih pasangan, dan shadow work untuk `single` (tanpa janji jodoh palsu); membedah komunikasi, keintiman, komitmen, dan penyelesaian konflik untuk `in_relationship` (tanpa tuduhan selingkuh/ramalan putus); serta narasi universal untuk `unspecified`.
* [x] **TODO-B118-20 (Settings UI Selector & Profile Repository Persistence):** Menambahkan field kanonikal `relationshipStatus?: "single" | "in_relationship" | "unspecified" | null` ke `UserProfile`, selektor UI 3 opsi di `app/settings/page.tsx` Data Diri, penyimpanan aman via `userRepository` / `storageProvider` terikat UID, persisten lintas restart, dan terisolasi privat.
* [x] **TODO-B118-21 (Regression Verification & Release Containment):** Memperluas test suite `build118-weekly-guidance.test.ts` menjadi 187 checks (Sections 1–15 PASS), verifikasi version reconciliation (24 checks PASS), `npx tsc --noEmit` exit 0, dan verifikasi localhost HTTP 200. APK/AAB build tetap diblokir menunggu review Founder.

---

### Sprint DASH-WEEKLY-04: Weekly Guidance Accuracy, Activation Scoring & Narrative Refinement
* **Status:** `[x] DONE (PASS LOCAL — 231 checks, Typecheck PASS, HTTP 200)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-22 (Proportional Activation Intensity Scoring):** Menghapus penentuan intensitas biner (orb <= 2.5° = Kuat) yang sebelumnya menyebabkan hampir seluruh domain berlabel 'Aktivasi Kuat'. Mengimplementasikan `scoreAspectForDomain()` bertingkat yang menghitung kecocokan rumah (+14/9/8), planet (+8/5), aspek (+7/5/3/1), dan luminary (+3); ambang Kuat (score >= 24 & orb <= 2.2°), Sedang (score >= 14), dan Ritme Tenang (score < 14); menghasilkan distribusi realistis (1 Kuat, 6 Sedang, 1 Ritme Tenang pada chart uji).
* [x] **TODO-B118-23 (Zero Triple Advice Duplication):** Menghapus duplikasi Saran Bhumi pada 3 tempat berbeda (highlight dashboard, preview kartu accordion, dan kotak Saran Bhumi). Menambahkan field kanonikal `summary: string;` pada `WeeklyGuidanceSection` yang memuat ringkasan eksekutif 1 kalimat khusus; preview kartu accordion dan highlight dashboard menampilkan `summary`, sedangkan kotak Saran Bhumi tetap fokus pada arahan aksi praktis.
* [x] **TODO-B118-24 (Astronomical Dynamic Phase Dynamics):** Menghapus formula fase tetap (Awal/Tengah/Akhir pekan statis). Mengimplementasikan `buildDynamicPhases()` yang menautkan narasi fase dengan timing puncak astronomis: aspek dengan puncak di awal pekan (Senin–Rabu) menjadi sorotan utama di awal pekan; aspek di tengah pekan (Kamis–Jumat) mencapai kulminasi di tengah pekan; aspek di akhir pekan (Sabtu–Minggu) mencapai kulminasi di akhir pekan; aspek 'separating' disajikan sebagai fase melandai dan pemulihan; serta domain dengan 'Ritme Tenang' disajikan dalam ritme harian yang stabil.
* [x] **TODO-B118-25 (Multi-Arcana Karmic Tail Synthesis):** Mengembangkan sintesis multi-arcana mendalam pada Ekor Karma Destiny Matrix (seperti 21–7–13: interaksi batas keterikatan 21 The World, dorongan ambisi ego 7 The Chariot, dan transformasi radikal 13 Death) serta Love Path 7–10–21 dalam konteks shadow work, tidak lagi sekadar mendeskripsikan arcana satu per satu secara terpisah.
* [x] **TODO-B118-26 (14-Subinterval Exact Timing & Fast Moon Traversal):** Mengimplementasikan deteksi zero-crossing sudut aspek menggunakan 14 sub-interval setengah harian dengan biseksi sub-menit; hanya mencantumkan timestamp jika aspek benar-benar mencapai titik eksak pada minggu berjalan; diformat transparan dengan label 'sekitar ... WIB'. Membedakan pergerakan cepat Bulan yang melintasi 3–4 rumah Placidus dalam sepekan (`Sepanjang minggu ini, lintasan cepat Bulan bergerak melintasi rumah ke-X hingga ke-Y Placidus...`) dari posisi snapshot tengah pekan.
* [x] **TODO-B118-27 (Comprehensive Test Suite Expansion):** Menambahkan Section 16 pada `tests/unit/build118-weekly-guidance.test.ts` memverifikasi proporsionalitas aktivasi (<8 Kuat, >0 Sedang/Tenang), diferensiasi summary vs advice, validitas 3 fase per domain, dan preview UI tanpa duplikasi Saran Bhumi. Seluruh 231 checks PASS LOCAL; TypeScript 0 errors; localhost HTTP 200. APK/AAB build tetap diblokir menunggu review Founder.

---

### Sprint DASH-WEEKLY-05: Weekly Guidance Final Acceptance & Scope Closure
* **Status:** `[x] CLOSED / FROZEN (LOCAL ACCEPTANCE)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-28 (Comprehensive 8-Domain Cross-System Audit):** Pemeriksaan menyeluruh 8 domain (Kabar Minggu Ini, Pikiran, Ekonomi, Asmara, Orang Terdekat, Makna Batin, Berat, Peluang). Astrological relevance, derajat/orb/rumah/aspek, applying/exact/separating, timing 'sekitar ... WIB', scoring proporsional, integrasi blueprint multi-sistem, kedalaman spiritual, zero saran generik, dan Dasar Pembacaan transparan.
* [x] **TODO-B118-29 (Canonical Blueprint Temporal Alignment):** Mengintegrasikan `resolveDestinyMatrixArcanaAtAge` dari `@/lib/destiny-matrix/annualArcana` berbasis simpul graf kanonikal; verifikasi integritas formula arcana tahunan tanpa asumsi; verifikasi guard rehidrasi Love Path aman dari false-trigger.
* [x] **TODO-B118-30 (Final UI/UX & Responsive Behavior Check):** 8 akordeon vertikal full-width dengan ikon SVG, judul lengkap, badge aktivasi, preview summary independen, auto-scroll & toggle dari 3 domain teratas, dan perilaku accordion tunggal terverifikasi pada localhost:3000 (HTTP 200).
* [x] **TODO-B118-31 (Asmara Acceptance Across 3 Relationship States):** Evaluasi komparatif 3 status hubungan (`single`, `in_relationship`, `unspecified`) pada chart sintetis identik (1985-05-03 Scorpio Rising). Terbukti menghasilkan 3 teks, refleksi kosmik, dan Saran Bhumi yang berbeda konteks secara tajam tanpa mengubah nomor natal atau mengarang data pasangan.
* [x] **TODO-B118-32 (Localhost Firestore Analytics Conflict Hardening):** Penanganan idempotensi error `ALREADY_EXISTS` (code 6) pada `analyticsRepository.ts` dan deduplikasi 3000ms pada `usageAnalytics.ts`. Risiko dev-to-prod Firebase didokumentasikan terbuka.
* [x] **TODO-B118-33 (Quality Gate Fixture Execution):** Eksekusi aktual engine pada 2 profil berbeda (User A: Scorpio Rising 2026-W44 vs User B: Leo Rising 2026-W46) tersimpan di `scratch/acceptance-fixture-output.json` dan disertakan dalam laporan tanpa rekayasa teks.
* [x] **TODO-B118-34 (Scope Freeze & Next Module Inventory):** Fitur Panduan Minggu Ini resmi dibekukan (SCOPE FROZEN). Inventarisasi modul aplikasi lainnya disusun untuk prioritas sprint Founder berikutnya.

---

### Sprint PROFILE-DAILY-01: Build 118 Catatan Hari Ini (Profile Page) — Daily Personal Cosmic & Soul Journal
* **Status:** `[x] DONE (PASS LOCAL - 76 checks, Typecheck PASS, HTTP 200)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-35 (Daily Cosmic & Soul Journal Engine):** Mengimplementasikan engine deterministik murni `lib/dailyGuidance/dailySoulJournalEngine.ts` yang mengintegrasikan cuaca kosmik riil harian SwissEph (Matahari, Bulan [zodiak, derajat, menit, fase, % iluminasi], planet retrograde), transit harian personal terhadap natal chart Placidus (aspek, orb <= 5.5°, status applying/exact/separating, aktivasi rumah 1..12), dan sintesis lintas sistem kanonikal (Destiny Matrix Love Path 7–10–21, Ekor Karma 21–7–13, Center Arcana, Human Design Type/Authority/Profile/Not-Self, Life Path, Personal Year, BaZi Day Master, dan Weton kelahiran vs harian).
* [x] **TODO-B118-36 (2-Layer Mobile-First UI Architecture):** Membangun komponen modern `components/profile/DailySoulJournalCard.tsx` dengan arsitektur 2-lapisan:
  - Lapisan 1 (Daily Card - Ringkas ~180-220px): Tanggal & Weton harian, headline personal, 1–2 kalimat rangkuman energi inti, 2–3 micro-badges (Bulan, Transit, Kanonikal), dan tombol toggle "Buka/Tutup Pembacaan Lengkap".
  - Lapisan 2 (Daily Deep Reading - Expandable): 7 bagian terstruktur (A. Langit Hari Ini, B. Yang Sedang Bergerak Dalam Dirimu, C. Pesan Jiwa Hari Ini, D. Yang Perlu Kamu Sadari, E. Ruang yang Terbuka, F. Saran Bhumi [tepat SATU saran praktis membumi], G. Dasar Pembacaan [dropdown details transparansi teknis derajat, orb, aspek, dan angka blueprint]).
* [x] **TODO-B118-37 (Profile Surface Integration):** Memperbarui `app/profile/page.tsx` untuk memuat `buildDailySoulJournal()` dan merender `DailySoulJournalCard`, mempertahankan fallback aman saat data profil/blueprint minimum, dan membungkus legacy `DailyNoteV2` dalam container non-invasif untuk menjaga kompatibilitas penuh.
* [x] **TODO-B118-38 (Quality Gate & Automated Test Suite):** Menyusun dan meloloskan test suite komprehensif `tests/unit/build118-daily-guidance.test.ts` (76/76 PASS LOCAL), memverifikasi cuaca kosmik, transit-to-natal, struktur 2-lapisan 7-bagian, integrasi blueprint kanonikal, diferensiasi dua pengguna, diferensiasi temporal, blacklist frasa klise AI, penanganan data parsial, midnight rollover timezone, dan pencegahan triplikasi saran. `npx tsc --noEmit` 0 errors; HTTP 200 localhost:3000/profile.
* [x] **TODO-B118-39 (Dual-Fixture Execution & Acceptance Evidence):** Mengeksekusi engine aktual pada User A (Scorpio Rising, Projector 1/3, Love Path 7–10–21, Ekor Karma 21–7–13) dan User B (Virgo Rising, Generator 2/4, Love Path 6–12–18, Ekor Karma 18–6–15) pada 28 Oktober 2026 dan 5 November 2026; output aktual tersimpan di `scratch/build118-daily-journal-outputs.json`. Release tetap dibatasi (PENDING FOUNDER REVIEW).

---

### Sprint PROFILE-DAILY-02: Build 118 Catatan Hari Ini (Profile Page) — Exact Weekly Guidance Parity & Temporal Richness Addendum
* **Status:** `[x] DONE (PASS LOCAL - 239 checks, 706 total assertions across 7 suites, Typecheck PASS, HTTP 200)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-40 (Exact 8-Domain Vertical Accordion UI Parity):** Membangun `components/profile/DailyGuidanceCard.tsx` dengan desain dan arsitektur 100% identik dengan Panduan Minggu Ini:
  - Header banner "CATATAN HARI INI", tanggal lengkap, zona waktu (WIB), dan 3 micro-badges siklus harian (Weton, BaZi/Day Ren, Tzolkin Kin).
  - Ringkasan Langit & Siklus Hari Ini (posisi dan fase Bulan, planet retrograde, tema kolektif, catatan khusus Day Ren, peristiwa kosmik hari ini).
  - Transit Paling Aktif Terhadap Chart Milikmu (kotak bukti astrologis aspek transit paling ketat dengan derajat, menit, rumah Placidus, orb, dan perkiraan waktu eksak 'sekitar HH:mm WIB').
  - 3 Domain Kehidupan Paling Menonjol Hari Ini (kartu sorotan harian interaktif yang membuka akordeon target secara otomatis dan melakukan smooth scroll).
  - 8 Kartu Akordeon Vertikal Full-Width: 1. Kabar Hari Ini (`kabarHariIni`), 2. Pikiran (`pikiran`), 3. Ekonomi & Rezeki (`ekonomi`), 4. Asmara & Percintaan (`asmara`), 5. Orang Terdekat (`orangTerdekat`), 6. Makna Batin (`maknaBatin`), 7. Yang Mungkin Terasa Berat (`yangMungkinTerasaBerat`), 8. Peluang yang Terbuka (`ruangYangSedangTerbuka`). Setiap kartu memiliki ikon SVG, badge intensitas aktivasi, summary 1–2 baris independen, kotak bukti transit Placidus, makna astrologis, makna spiritual, sintesis lintas sistem, Saran Bhumi praktis, dinamika 3 fase harian (Pagi, Siang, Malam), dan drawer `<details>` Dasar Pembacaan teknis transparan.
  - Arah Hari Ini (kartu penutup ringkasan dengan CTA menuju `/wellness` dan `/journal`).
* [x] **TODO-B118-41 (Temporal Richness Integration — Astro Hari Ini Parity):** Menghubungkan perhitungan temporal kanonikal harian yang memasok Astro Hari Ini ke Catatan Hari Ini tanpa menghitung ulang secara inkonsisten:
  - Weton Jawa hari ini: Hari, pasaran, neptu, dan wuku dari `synthesis.eastern.weton`.
  - BaZi hari ini & Deteksi Eksplisit Day Ren: Pilar harian (Heavenly Stem + Earthly Branch) via `calculateBazi({ birthDate: dateKey, ... })`; deteksi otomatis **Day Ren** (壬, Air Yang, e.g. 2026-10-26 Ren Shen); penentuan relasi Shishen / Ten Gods terhadap Day Master natal pengguna.
  - Tzolkin Maya hari ini: Nomor Kin, nama Kin, Solar Seal, Galactic Tone, dan Wavespell dari `synthesis.eastern.tzolkin`.
  - Cuaca Astronomis SwissEph: Posisi zodiak Bulan, fase sudut, nama fase, persentase iluminasi, dan status retrograde planet.
* [x] **TODO-B118-42 (Sub-Minute Daily Transit Root Finding):** Mengimplementasikan `lib/dailyGuidance/dailyTransitCalculator.ts` dengan jendela waktu 1 hari (00:00:00 s/d 23:59:59.999 lokal), 24 sub-interval per jam, dan biseksi sub-menit untuk menentukan waktu kontak transit eksak ('sekitar HH:mm WIB'). Menghitung 10 benda langit transit terhadap 10 planet natal, Ascendant, Midheaven, dan 12 rumah Placidus.
* [x] **TODO-B118-43 (Collision-Free Scoring & Activation Intensity Balance):** Menerapkan pelacakan `usedAspectIndices` pada `lib/dailyGuidance/dailyGuidanceEngine.ts` agar satu aspek transit tidak dimonopoli oleh banyak domain. Ambang batas relevansi minimum 14 mencegah inflasi aktivasi semu, menghasilkan sebaran intensitas realistis (Kuat / Sedang / Ritme Tenang) dan zero triplikasi saran.
* [x] **TODO-B118-44 (Canonical Blueprint Personal Integration):** Mengintegrasikan Love Path 7–10–21 (dengan diferensiasi status hubungan Asmara Single vs Berpasangan), Ekor Karma 21–7–13, Center Arcana, Human Design Type/Authority/Profile/Not-Self, Life Path Number & Personal Year ke dalam narasi 8 domain harian.
* [x] **TODO-B118-45 (Profile Page Surface Parity):** Memperbarui `app/profile/page.tsx` untuk memuat `buildDailyGuidance()`, merender `DailyGuidanceCard`, dan menjaga kompatibilitas dengan menyematkan legacy `DailyNoteV2` dalam kontainer tersembunyi.
* [x] **TODO-B118-46 (Comprehensive Test Suite & Quality Gate):** Memperluas `tests/unit/build118-daily-guidance.test.ts` menjadi 239 checks mencakup paritas 8 domain, paritas Astro Hari Ini, deteksi BaZi Day Ren, Top 3 highlights, Asmara single vs berpasangan, diferensiasi dual user & temporal, zero AI clichés, dan zero triplikasi saran. Seluruh 239 checks PASS LOCAL; total 706 assertions lolos di seluruh 7 test suite; `npx tsc --noEmit` 0 errors; localhost:3000/profile HTTP 200 OK.
* [x] **TODO-B118-47 (Dual-Fixture Parity Output Evidence):** Mengeksekusi script `scripts/capture-daily-guidance-outputs.ts` menghasilkan output aktual User Aria (Single, Projector 1/3) dan User Maya (Berpasangan, Generator 2/4) pada 28 Oktober 2026, serta User Aria pada 26 Oktober 2026 (kondisi Day Ren); output tersimpan di `scratch/build118-daily-guidance-parity-outputs.json`. Release tetap dibatasi (SUPERSEDED BY SPRINT PROFILE-DAILY-03).

---

### Sprint PROFILE-DAILY-03: Build 118 Catatan Hari Ini (Profile Page) — Deep Daily Cross-System Synthesis (Four Foundations × Canonical Blueprint)
* **Status:** `[x] DONE (PASS LOCAL - 389 checks, 856 total assertions across 7 suites, Typecheck PASS, HTTP 200)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-48 (Four Foundations Domain-Aware Architecture):** Mengintegrasikan secara mendalam 4 lapisan temporal harian (Western Transit SwissEph, Weton Jawa, BaZi, Tzolkin Maya) dengan Cetak Biru Kanonikal (Destiny Matrix, Human Design, Life Path, Vedic) ke dalam narasi 8 domain tanpa pemaksaan (domain-aware distribution).
* [x] **TODO-B118-49 (Ten Gods / Shi Shen Classical Matrix):** Mengimplementasikan mesin matematis 10 relasi Ten Gods (`computeBaziTenGod`) berbasis interaksi lima elemen & polaritas antara Day Master natal dan Heavenly Stem pilar harian: Friend (*Bi Jian*), Rob Wealth (*Jie Cai*), Eating God (*Shi Shen*), Hurting Officer (*Shang Guan*), Indirect Wealth (*Pian Cai*), Direct Wealth (*Zheng Cai*), Seven Killings (*Qi Sha*), Direct Officer (*Zheng Guan*), Indirect Resource (*Pian Yin*), Direct Resource (*Zheng Yin*), memandu domain Pikiran, Ekonomi, dan Arah Hidup.
* [x] **TODO-B118-50 (Explicit Day Ren Indicator Guard):** Menjaga deteksi Day Ren (壬, Air Yang) berlaku HANYA pada hari di mana pilar harian memiliki Heavenly Stem Ren (seperti 26 Oktober 2026 Ren Shen). Pada non-Ren day (seperti 28 Oktober 2026 Jia Xu), `isDayRen: false`, `dayRenNote: undefined`, dan energi pilar Jia Kayu Yang dipaparkan sesuai karakternya.
* [x] **TODO-B118-51 (Weton Jawa Classical Dictionaries Integration):** Mengintegrasikan kamus otentik Weton Jawa (`DAY_INTERPRETATIONS`, `PASARAN_INTERPRETATIONS`, `NEPTU_INTERPRETATIONS`, `WUKU_DATA`) mencakup watak hari, kekuatan, tantangan, dan pola rezeki/relasi pasaran. Mempertahankan isolasi ketat antara weton kelahiran (natal) dan weton harian (transit).
* [x] **TODO-B118-52 (Tzolkin Maya Cycle Integration):** Mengintegrasikan kalkulasi otentik Tzolkin Maya harian mencakup Kin, Solar Seal (keyword, gift, challenge, purpose), Galactic Tone (function, gift, lesson), dan Wavespell 13 hari ke dalam domain Makna Batin, Kabar Hari Ini, dan Peluang yang Terbuka.
* [x] **TODO-B118-53 (Continuous Signed Angular Root-Finding):** Memperbaiki deteksi kulminasi transit pada `dailyTransitCalculator.ts` menggunakan fungsi sudut bertanda berkelanjutan (`signedDiff`) sehingga transisi nol derajat pada konjungsi (0°), oposisi (180°), dan seluruh aspek mayor dapat terdeteksi akurat hingga sub-menit ('sekitar HH:mm WIB').
* [x] **TODO-B118-54 (Foundations Drawer Deep Transparency):** Menghadirkan 3 hingga 6 entri teknis terstruktur per domain pada drawer `<details>` "Dasar Pembacaan", memaparkan derajat orb transit, rumah Placidus, Weton, BaZi, Tzolkin, dan Cetak Biru Kanonikal secara transparan kepada pengguna.
* [x] **TODO-B118-55 (Comprehensive Test Suite & Quality Gate):** Memperluas `tests/unit/build118-daily-guidance.test.ts` menjadi 389 automated checks mencakup 16 Sections pengujian ketat. Total 856 assertions lulus di 7 test suites tanpa kegagalan; `npx tsc --noEmit` 0 errors; HTTP 200 OK localhost:3000/profile.
* [x] **TODO-B118-56 (Dual-Fixture Synthesis Output Capture):** Mengeksekusi script `scripts/capture-daily-guidance-outputs.ts` menghasilkan output aktual lengkap tersimpan di `scratch/build118-daily-guidance-parity-outputs.json`. Release tetap dibatasi (STOP AND WAIT FOR FOUNDER REVIEW).
