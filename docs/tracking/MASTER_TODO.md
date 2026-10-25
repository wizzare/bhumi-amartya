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

## 4. SUMMARY METRICS

| Kategori | Jumlah Item | Persentase |
|---|---|---|
| **Selesai (DONE / AUDITED)** | 77 item | 93.9% |
| **Sedang Berjalan (PARTIAL / READY)** | 1 item | 1.2% |
| **Menunggu (PENDING)** | 2 item | 2.4% |
| **Terkunci / Open Gates (BLOCKED / GATES OPEN)** | 2 item | 2.4% |
| **Total Tracking Items** | **82 item** | **100%** |
