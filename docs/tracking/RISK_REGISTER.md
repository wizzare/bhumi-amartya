# BHUMI AMARTYA — RISK REGISTER

**Document ID:** `RISK-REG-001`  
**Current Workstream:** Workstream 2 — Billing & Entitlement  
**Baseline Git Branch:** `hotfix/build110-indonesian-only`  
**Active HEAD:** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
**Last Updated:** 21 Oktober 2026  
**Status:** ACTIVE LIVE REGISTER  

---

## 1. RISK MATRIX OVERVIEW

```
  SEVERITY / IMPACT
     ▲
  P0 │ [RSK-01] [RSK-02] [RSK-03] [RSK-08] [RSK-10] [RSK-16-MITIGATED]
     │
  P1 │ [RSK-04] [RSK-05] [RSK-06] [RSK-07] [RSK-09] [RSK-14] [RSK-15]
     │
  P2 │ [RSK-11] [RSK-12] [RSK-13]
     └───────────────────────────────────────────────►
                      PROBABILITY / URGENCY
```

---

## 2. P0 RISKS (CRITICAL / BLOCKING)

### RSK-01: Uncommitted Working Tree Drift & Corruption Risk
* **Severity:** **P0 (CRITICAL)**
* **Category:** Repository & Environment Integrity
* **Description:** Working tree saat ini memiliki 108 file termodifikasi dan untracked yang memuat seluruh implementasi HD-01 s/d HD-05D dan billing verifier.
* **Impact:** Kesalahan perintah git (`git checkout .`, `git clean -fd`, `git reset --hard`) akan memusnahkan seluruh hasil kerja sprint sebelumnya secara permanen.
* **Mitigation:**
  1. Dilarang keras menjalankan perintah checkout, clean, stash, reset, pull, rebase, atau commit tanpa otorisasi Founder.
  2. Semua 108 entri diproteksi dengan SHA-256 hash manifest (`docs/tracking/PATCH_MANIFEST.json`).
* **Current Status:** **OPEN / PROTECTED**.

---

### RSK-02: Production Verification Void (Produksi Tetap NOT VERIFIED)
* **Severity:** **P0 (CRITICAL)**
* **Category:** Production Safety & Verification
* **Description:** Tidak ada verifikasi apakah engine produksi di Railway/Vercel dan Firestore live berperilaku identik dengan hasil uji lokal.
* **Impact:** Potensi kegagalan runtime live meskipun seluruh pengujian lokal lolos (PASS).
* **Mitigation:** Kunci status rilis produksi sebagai **BLOCKED / NOT VERIFIED**.
* **Current Status:** **OPEN / BLOCKED** (Production gate locked).

---

### RSK-16: Expired Token Overwriting Active Paid Subscription (RESOLVED IN BILL-01)
* **Severity:** **P0 (CRITICAL - MITIGATED)**
* **Category:** Billing Entitlement Integrity
* **Description:** Pada implementasi awal `services/billing-verifier/lib/entitlement.ts`, verifikasi token yang sudah expired (`result.active === false`) menuliskan `isPremium: false` dan `membershipType: "FREE"` ke dokumen `users/{uid}`, menimpa langganan aktif lain yang dimiliki pengguna jika bukan akun Founder atau Lifetime.
* **Impact:** Pengguna yang sah membeli langganan berisiko kehilangan akses Premium seketika jika Google Play mengembalikan riwayat token lama atau saat memulihkan pembelian (restore).
* **Mitigation (Sprint BILL-01):** Diterapkan invariant `isStaleOlderToken`. Token kadaluwarsa yang memiliki tanggal kedaluwarsa lebih awal daripada langganan aktif masa depan (`result.date < existingExpiry`) secara tegas dilarang mengubah status pengguna menjadi FREE.
* **Verification:** Terbukti lolos melalui test `BILL01-06 & BILL01-15` di `services/billing-verifier/tests/unit/bill01-ownership-and-verifier.test.ts`.
* **Current Status:** **MITIGATED & VERIFIED**.

---

## 3. P1 RISKS (HIGH / IMPORTANT)

### RSK-14: Android Physical Device Execution Gap
* **Severity:** **P1 (MEDIUM)**
* **Category:** Mobile & Device Compatibility
* **Description:** Pengujian telah memverifikasi Chromium 390x844 dan arsitektur Capacitor, namun eksekusi langsung pada perangkat fisik Android API 36 di Google Play internal track belum dilakukan.
* **Impact:** Potensi perbedaan WebView versi lama atau integrasi native plugin `BhumiBilling` pada runtime OEM tertentu.
* **Mitigation:** Jadwalkan verifikasi internal tester melalui Google Play Internal App Sharing.
* **Current Status:** **OPEN / GATE NOT VERIFIED**.

---

### RSK-15: Multi-Source Entitlement Precedence Label Ambiguity (RESOLVED IN BILL-04)
* **Severity:** **P1 (RESOLVED)**
* **Category:** Product Entitlement Policy
* **Description:** Terdapat potensi ambiguitas tampilan saat pengguna memiliki Tester Grant (`Penjaga Bhumi Inti`) SEKALIGUS Paid Subscription aktif.
* **Mitigation (Sprint BILL-04):** Diimplementasikan arsitektur *dual-display representation* pada `lib/billing/entitlementPresentation.ts`. Sistem tidak lagi memaksa memilih salah satu label; melainkan menyajikan status komersial berbayar (`commercialStatus: "Premium Aktif"`) berdampingan dengan lencana kehormatan komunitas (`communityBadge: "Penjaga Bhumi Inti"`, `isDualDisplay: true`) secara harmonis dan transparan.
* **Verification:** Terbukti lolos melalui test `UI-10` di `tests/unit/bill04-ui-acceptance.test.ts` dan unit test mapper di `tests/unit/billing-entitlement-presentation.test.ts`.
* **Current Status:** **RESOLVED & VERIFIED IN BILL-04**.

---

### RSK-16: Older Voided Purchase Token Downgrade Risk
* **Severity:** **P0 (MITIGATED IN SPRINT BILL-02)**
* **Category:** Data & Entitlement Integrity
* **Description:** Implementasi sebelumnya di `services/billing-verifier/lib/entitlement.ts` mengecualikan status `VOIDED` dari `isStaleOlderToken`. Pengguna yang memiliki langganan aktif (misal s/d Desember) lalu me-restore purchase token lama (dari Agustus) yang telah di-refund/voided mengalami pencabutan akses `isPremium: false`.
* **Mitigation:** Memperbaiki syarat `isStaleOlderToken` agar mengevaluasi `!result.active && hasActiveFuturePaid && result.date && existingExpiry && result.date.getTime() < existingExpiry.getTime()`. Token lampau yang tidak aktif (baik expired maupun voided sebelum masa aktif berjalan) hanya mencatat status ledger token tersebut dan tidak menyentuh dokumen canonical `users/{uid}`.
* **Current Status:** **MITIGATED & VERIFIED** (`BILL-02 Carryover 2`).

---

### RSK-17: Google Play Live In-App Billing Bridge Runtime Verification
* **Severity:** **P1 (DEPENDENT ON ANDROID BUILD & PLAY STORE TRACK)**
* **Category:** Mobile & Store Certification
* **Description:** Pemanggilan native `BhumiBillingPlugin` di perangkat Android riil memerlukan konektivitas ke Google Play Billing API sandbox dan akun tester berlisensi.
* **Impact:** Seluruh logika integrasi JavaScript, deduplikasi konkruen, retry, dan boundary fail-closed telah 100% lolos uji lokal, namun interaksi live dengan Google Play Store memerlukan internal test track deployment.
* **Mitigation:** Eksekusi verifikasi di Android test track pada saat rilis terpadu bersama Gate Android Human Design (GATE-06).
* **Current Status:** **OPEN / GATE NOT VERIFIED**.

---

### RSK-18: Multi-Token Active Registry Boundary & Fallback Safety (RESOLVED IN BILL-03B & BILL-03B.1)
* **Severity:** **P1 (RESOLVED & VERIFIED LOCAL)**
* **Category:** Data Model & Transaction Integrity
* **Description:** Dokumen `users/{uid}` sebelumnya memiliki keterbatasan single-slot entitlement (`activeTokenHash`). Saat fallback diimplementasikan di BILL-03B, ditemukan kontradiksi (MT-07) di mana kegagalan pembacaan kueri kueri ditelan dan menurunkan user menjadi FREE. Selain itu, urutan transaksi melanggar aturan Admin SDK (read setelah write).
* **Mitigation (Sprint BILL-03B & BILL-03B.1):**
  1. **Option A (Server-Side Fallback):** Transaksi Firestore memeriksa token aktif alternatif milik UID di `billing_purchase_tokens` via single-field query `.where("uid", "==", uid)` tanpa perubahan skema.
  2. **Transaction Read-Before-Write Ordering:** Seluruh pembacaan (`tokenSnap`, `userSnap`, `tokensQuery`) dieksekusi sebelum penulisan pertama (`transaction.set`).
  3. **Failure Safety (MT-07 Closure):** Menghapus penelanan error `try...catch`. Jika kueri gagal atau timeout, error dilempar keluar (retryable), transaksi Firestore batal (ABORT), dan dokumen `users/{uid}` tidak mengalami downgrade destruktif.
  4. **Validation Policy:** Token alternatif diverifikasi status aktifnya, masa berlaku di masa depan, bukan token yang sedang di-void, dan menolak `lastVerifiedAt` yang malformed.
* **Verification:** Terbukti lolos 15/15 skenario `BF-01` s/d `BF-15` di `services/billing-verifier/tests/unit/bill03b1-fallback-safety.test.ts` dan 10/10 skenario di `bill03b-multi-token-fallback.test.ts`.
* **Current Status:** **CLOSED LOCAL / PRODUCTION RECONCILE MONITORED**.

---

### RSK-19: Dateless Refund Token Bug in isStaleOlderToken (RESOLVED IN BILL-03A)
* **Severity:** **P0 (CRITICAL - MITIGATED)**
* **Category:** Billing Entitlement Integrity
* **Description:** Google Play voided purchases seringkali tidak mengembalikan expiry date (`result.date = null`). Syarat `!result.date` di dalam `isStaleOlderToken` sebelumnya menyebabkan token refund aktif diperlakukan sebagai "stale", sehingga pembatalan langganan terabaikan dan user tetap memegang akses Premium palsu (A01 defect).
* **Mitigation (Sprint BILL-03A):** Memperkenalkan `isAuthoritativeActiveToken` di `services/billing-verifier/lib/entitlement.ts`. Token aktif yang sedang dievaluasi (atau akun legacy yang sedang di-refund) tidak pernah diperlakukan sebagai stale (`!isAuthoritativeActiveToken` menjadi false), sehingga pencabutan akses terjadi seketika dan fail-closed.
* **Verification:** Terbukti lolos via `A01` dan `A02` di `services/billing-verifier/tests/unit/bill03a-critical-integrity.test.ts`.
* **Current Status:** **MITIGATED & VERIFIED**.

---

### RSK-20: Last-Token-Wins activeTokenHash Overwrite (RESOLVED IN BILL-03A)
* **Severity:** **P1 (DATA INTEGRITY - MITIGATED)**
* **Category:** Billing Entitlement Integrity
* **Description:** Saat dua token aktif diverifikasi berurutan (Token A berakhir Des 1, Token B berakhir Nov 1), logika union mempertahankan expiry Des 1, namun `activeTokenHash` secara keliru diisi dengan `hashB` ("last-token-wins").
* **Mitigation (Sprint BILL-03A):** Logika seleksi token aktif diperbaiki dengan `existingProvidesLaterExpiry`. Jika token aktif yang sudah tersimpan memiliki masa berlaku yang lebih panjang daripada token baru, `activeTokenHash` tetap mempertahankan hash token lama yang sah.
* **Verification:** Terbukti lolos via `B01` di `services/billing-verifier/tests/unit/bill03a-critical-integrity.test.ts`.
* **Current Status:** **MITIGATED & VERIFIED**.

---

### RSK-21: Browser UI Verification Closure vs Physical Android Device & Live Play API Boundary (RESOLVED & MONITORED)
* **Severity:** **P1 (PLATFORM SCOPE BOUNDARY)**
* **Category:** Quality Assurance & Environment Boundary
* **Description:** Seluruh 25 skenario antarmuka pengguna (UI-01 s/d UI-25) telah divalidasi dan lolos di lingkungan peramban aktual (Playwright Chromium) menggunakan synthetic Capacitor bridge dan synthetic Firebase auth.
* **Mitigation (Sprint BILL-04A):** 25 skenario peramban terbukti PASS LOCAL BROWSER tanpa horizontal overflow dan dengan isolasi sesi penuh. Batasan operasional dinyatakan secara eksplisit: tidak ada klaim bahwa transaksi Google Play nyata atau perangkat fisik Android telah diuji.
* **Current Status:** **MITIGATED & MONITORED (BROWSER GATE CLOSED / PRODUCTION & NATIVE BOUNDARY RETAINED)**.

---

### RSK-22: Next.js Static Export vs HTTP 410 Route Handler Conflict (/api/humandesign/bodygraph)
* **Severity:** **P1 (CROSS-WORKSTREAM BUILD BLOCKER)**
* **Category:** Mobile Build Architecture
* **Description:** Mode ekspor statis Next.js (`output: 'export'`) menolak route handlers non-static (`/api/humandesign/bodygraph`), menghalangi kompilasi aset web statis Capacitor Android otomatis.
* **Mitigation (Sprint BILL-05A):** Dual-mode build diusulkan: server routes dieksekusi di platform Vercel / serverless cloud, sedangkan Android shell hanya mengemas client assets (`out/`). Karena menyangkut route Human Design yang terproteksi, penyelesaian formal memerlukan persetujuan Founder (`CROSS-WORKSTREAM APPROVAL REQUIRED`).
* **Current Status:** **OPEN / MITIGATION PROPOSED (NO ARBITRARY HD CODE TOUCHED)**.
* **BILL-05A.4 evidence (2026-10-21):** PLATFORM-02C reports historical staging export success; not independently reproduced in this task. Fresh static export and dependency-graph acceptance NOT RUN after the mandatory missing-QA gate. RSK-22 is not newly closed; see `BHUMI_BILL-05A.4_ANDROID_QA_BUILD_ACCEPTANCE_REPORT.md`.

---

### RSK-23: Android Gradle Debug Build Package Suffix Mismatch (.qa)
* **Severity:** **P1 (BUILD TOOLCHAIN CONFIGURATION)**
* **Category:** Mobile Build & Packaging
* **Description:** Task Gradle `:app:processDebugGoogleServices` gagal karena `buildTypes.debug` menambahkan `applicationIdSuffix ".qa"`, sedangkan `google-services.json` hanya berisi client ID untuk `com.bhumiamartya.app`.
* **Mitigation (Sprint BILL-05A):** Teridentifikasi secara pasti pada audit toolchain. Diusulkan: tambahkan client `.qa` ke project Firebase Console atau gunakan assemble non-suffixed (release-aligned) untuk build emulasi lokal.
* **Current Status:** **OPEN / IDENTIFIED & DOCUMENTED**.
* **BILL-05A.4 evidence (2026-10-21):** FOUNDER CONFIGURATION REQUIRED. Local JSON metadata contains only `com.bhumiamartya.app`, not `com.bhumiamartya.app.qa`; `android/app/src/debug/google-services.json` and `src/qa/google-services.json` are absent. APK, rules emulator and Android emulator NOT RUN. Require a separate authorized QA project and matching debug client/web/backend configuration; do not use the historical non-suffixed workaround or production project. A release signing key is not required for debug. Prior text is preserved as history, not current authorization.

---

## 4. P2 RISKS (LOW / TECHNICAL DEBT)

### RSK-11: Legacy Admin Route Artifacts
* **Severity:** **P2 (LOW)**
* **Category:** Code Cleanliness
* **Description:** Halaman `/app/admin/**` masih berada di working tree aplikasi mobile meskipun Founder Dashboard telah dipisah ke repositori eksternal.
* **Current Status:** **SCHEDULED FOR DECOMMISSION**.

### RSK-13: FNV-1a 32-bit Hash Space
* **Severity:** **P2 (LOW / MONITORED)**
* **Category:** Data Integrity
* **Description:** Sidik jari input lahir menggunakan FNV-1a 32-bit (`bip_v1_<8-char-hex>`). Probabilitas tabrakan revisi $< 1.2 \times 10^{-6}$ untuk 100 perubahan per user.
* **Current Status:** **AUDITED / ACCEPTABLE TECHNICAL DEBT**.
