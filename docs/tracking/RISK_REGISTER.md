# BHUMI AMARTYA — RISK REGISTER

**Document ID:** `RISK-REG-001`  
**Current Workstream:** Build 119 - BP02 Destiny Matrix (BP02 ACTIVE; scope-locked)  
**Baseline Git Branch:** `hotfix/build110-indonesian-only`  
**Active HEAD:** `41e89d8da3c424c2b6775ec5ceb13f689cacd438` (`release: Bhumi Amartya v5.0.18 build 118`)  
**Last Updated:** 31 Oktober 2026 (Sinkronisasi BP02)  
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

---

### RSK-24: Untracked Production File `lib/astrology/transitEvents.ts` Drop Risk
* **Severity:** **P0 (CRITICAL / WORKTREE INTEGRITY)**
* **Category:** Repository & Build Completeness
* **Description:** File `lib/astrology/transitEvents.ts` memuat logika esensial transit hari ini (aspek orb $\le 6^\circ$, status gerak 8 planet, dan peristiwa harian), diimpor oleh `dailyAstroSynthesis.ts` dan `AstroTodayCard.tsx`, namun saat ini berstatus untracked di git working tree.
* **Impact:** Jika checkout baru atau `git clean` dilakukan tanpa staging eksplisit file ini, build di CI/worktree bersih akan langsung gagal dengan `Module not found: ../transitEvents`.
* **Mitigation (Sprint DASH-LOCK-01):** Dicatat dalam Source Completeness Manifest dan diajukan ke Founder untuk staging resmi.
* **Current Status:** **OPEN / PENDING FOUNDER STAGING AUTHORIZATION**.

---

### RSK-25: Test Route Leakage into Android APK Static Export
* **Severity:** **P1 (BUILD TOOLCHAIN & BUNDLE HYGIENE)**
* **Category:** Mobile Build & Packaging
* **Description:** Tiga rute pengujian di `app/` (`test-astro-transit/`, `test-identitas-inti/`, dan `test-3d-poc/`) akan otomatis dirender menjadi file statis (`out/test-.../index.html`) saat `next build` dengan `output: 'export'`, lalu disalin ke `android/app/src/main/assets/public/` oleh Capacitor `sync`.
* **Impact:** Bundle Android APK memuat kode uji coba, mock data sintetis, dan permukaan non-produksi yang berpotensi menjadi celah atau temuan audit Google Play / security scanner.
* **Mitigation (Sprint DASH-LOCK-01):** Diusulkan karantina fisik rute uji ke `tests/harness/` sebelum eksekusi build rilis produksi Android (memerlukan persetujuan Founder).
* **Current Status:** **OPEN / MITIGATION PROPOSED (AWAITING FOUNDER APPROVAL)**.

---

### RSK-26: Hot-Reload Next.js Dev Server Ephemeral Types Race Condition
* **Severity:** **P2 (DEVELOPER WORKFLOW / EPHEMERAL)**
* **Category:** Tooling & Typechecking
* **Description:** Berkas `.next/dev/types/validator.ts` dihasilkan secara otomatis oleh `next dev`. Interupsi mendadak atau race condition saat file ditulis dapat menyebabkan error sintaks transient TS1434 pada `npx tsc --noEmit`.
* **Mitigation (Sprint DASH-LOCK-01):** File dipastikan berada di bawah `.gitignore` (`.next/`). Tidak ada modifikasi manual yang dibutuhkan bila proses `next dev` stabil atau dihentikan sebelum typecheck. Terbukti `npx tsc --noEmit` lolos dengan exit code 0.
* **Current Status:** **MITIGATED & MONITORED**.

---

### RSK-27: Weekly Guidance ISO Week Key Collision & Day-of-Month Drift (RESOLVED IN BUILD 118)
* **Severity:** **P1 (DATA INTEGRITY & USER EXPERIENCE)**
* **Category:** Algorithm & Calendar Integrity
* **Description:** Rumus pembentukan key minggu lama menggunakan `Math.ceil((base.getUTCDate() + 6) / 7)` yang membaca hari dalam bulan (1..31) alih-alih minggu kalender tahunan (1..53). Hal ini menyebabkan tabrakan key fatal (misal 2 Okt dan 30 Okt keduanya terpetakan ke `2026-W05`), serta lompatan minggu pada awal tahun baru.
* **Impact:** Cache dan panduan mingguan tertukar antar-minggu yang berbeda, menyebabkan konten basi disajikan kepada pengguna.
* **Mitigation (Sprint DASH-WEEKLY-01):** Digantikan secara menyeluruh dengan Luxon `dt.weekNumber` dan `dt.weekYear` yang mematuhi standar ISO-8601 secara ketat dengan penanganan timezone lokal pengguna.
* **Verification:** Terbukti lolos melalui test suite `tests/unit/build118-weekly-guidance.test.ts` (Bagian 1: Verifikasi Penentuan Rentang Waktu & ISO-8601).
* **Current Status:** **RESOLVED & VERIFIED**.

---

### RSK-28: Build 118 Production Isolation & Release Protection
* **Severity:** **P0 (RELEASE SAFETY & GOVERNANCE)**
* **Category:** Production Safety & Release Protocol
* **Description:** Build 117 (`versionCode 117`, `versionName "5.0.17"`) telah resmi berada di Google Play Store. Pengembangan baru Panduan Minggu Ini pada Build 118 tidak boleh menimpa artefak rilis Build 117 atau memicu publikasi otomatis sebelum Founder menandatangani persetujuan rilis.
* **Impact:** Risiko pelanggaran kepatuhan store release dan peluncuran kode sebelum peninjauan penuh Founder.
* **Mitigation:**
  1. Menaikkan konfigurasi versi ke `versionCode 118` dan `versionName "5.0.18"` di `android/app/build.gradle` dan `lib/config/buildInfo.ts`.
  2. Mengunci status implementasi sebagai `PASS LOCAL` dan memblokir seluruh proses build APK/AAB serta publishing ke Google Play.
* **Current Status:** **OPEN / PROTECTED (BLOCKED PENDING FOUNDER REVIEW)**.

---

### RSK-29: Legacy Love Path Prepended-Center Inconsistency & Self-Healing Hydration Safety
* **Severity:** **P1 (DATA INTEGRITY & BLUEPRINT NORMALIZATION - MITIGATED)**
* **Category:** Mathematical Data Integrity
* **Description:** `lib/calculations/destinyMatrix/mapToBlueprint.ts` legacy menyisipkan arcana pusat (`epoint`) ke posisi awal array `loveLine`, menyebabkan perbedaan fatal antara halaman Destiny Matrix (`7–10–21`) dan Weekly Guidance (`8–10–7`), serta interpretasi template generik pengorbanan sepihak.
* **Impact:** Inkonsistensi data antar-layar dan interpretasi spiritual yang keliru bagi pengguna.
* **Mitigation (Sprint DASH-WEEKLY-03):**
  1. Mengalihkan `mapToBlueprint.ts` ke `calculateCanonicalDestinyMatrixBlueprint()` sehingga menghasilkan simpul kanonikal `[7, 10, 21]`.
  2. Menerapkan self-healing hydration di `weeklyGuidanceEngine.ts` dan `DashboardClient.tsx` yang hanya merehidrasi jika mendeteksi bug legacy (`loveLine[0] === dmCenter`), tanpa merusak blueprint valid lainnya (seperti `6–12–18`).
  3. Mengadopsi interpretasi dinamis murni dari `destinyMatrixArcanaDictionary`.
* **Verification:** Terbukti lolos melalui test suite `tests/unit/build118-weekly-guidance.test.ts` (Bagian 13: 11 checks PASS).
* **Current Status:** **MITIGATED & VERIFIED**.

---

### RSK-30: Relationship Status Privacy & Account Isolation Protection
* **Severity:** **P1 (PRIVACY & PROFILE ISOLATION - MITIGATED)**
* **Category:** User Privacy & Profile Management
* **Description:** Penambahan status hubungan pengguna di profil berisiko kebocoran privasi, asumsi publik, atau kebocoran antar-sesi akun saat switch account.
* **Impact:** Pelanggaran privasi pengguna atau penyajian status hubungan pengguna sebelumnya kepada pengguna baru.
* **Mitigation (Sprint DASH-WEEKLY-03):**
  1. Field `relationshipStatus` bersifat opsional dan default ke `"unspecified"`.
  2. UI selektor 3 opsi sederhana (Single, Berpasangan, Tidak ingin menyebutkan) di Settings Data Diri dengan penjelasan privasi eksplisit.
  3. Status disimpan privat terikat UID di Firebase/local profile repository, tidak diekspos ke antarmuka publik, dan di-reset/dibersihkan saat pergantian sesi akun.
* **Verification:** Terbukti lolos melalui test suite `tests/unit/build118-weekly-guidance.test.ts` (Bagian 14 & 15: 40 checks PASS).
* **Current Status:** **MITIGATED & VERIFIED**.

---

### RSK-31: Domain Activation Inflation & Triple Advice Repetition (RESOLVED IN BUILD 118)
* **Severity:** **P1 (ACCURACY & USER EXPERIENCE - RESOLVED)**
* **Category:** Astronomical Engine & UI Copy Integrity
* **Description:** Penentuan intensitas transit biner sederhana (`orb <= 2.5° = high`) sebelumnya menyebabkan hampir seluruh 8 domain kehidupan menampilkan lencana "Aktivasi Kuat", mendistorsi realitas astrologis. Selain itu, kalimat "Saran Bhumi" terduplikasi di 3 tempat (highlight summary, preview accordion header, dan kotak detail).
* **Impact:** Pengguna menerima kesan bahwa setiap bidang kehidupan sedang mengalami krisis/aktivasi hebat, dan tampilan antarmuka terasa redundan.
* **Mitigation (Sprint DASH-WEEKLY-04):**
  1. Mengimplementasikan `scoreAspectForDomain()` bertingkat dengan bobot kecocokan rumah (+14/9/8), planet (+8/5), aspek (+7/5/3/1), dan luminary (+3), menghasilkan batas proporsional Kuat (>=24 & <=2.2°), Sedang (>=14), dan Ritme Tenang (<14).
  2. Menambahkan field kanonikal `summary: string;` pada `WeeklyGuidanceSection` untuk ringkasan 1 kalimat yang berbeda total dari `advice[0]`.
  3. Menggunakan biseksi 14 sub-interval setengah harian untuk deteksi zero-crossing sudut eksak dan mencantumkan timestamp hanya bila puncak terjadi di minggu berjalan, transparan dengan label "sekitar ... WIB".
* **Verification:** Terbukti lolos melalui test suite `tests/unit/build118-weekly-guidance.test.ts` (Bagian 16: 28 checks PASS).
* **Current Status:** **RESOLVED & VERIFIED**.

---

### RSK-32: Localhost Development Direct Connection to Production Firestore
* **Severity:** **P1 (DATA INTEGRITY & ENVIRONMENT ISOLATION - OPEN RESIDUAL RISK)**
* **Category:** Infrastructure & Security Boundaries
* **Description:** Saat menjalankan server pengembang lokal (`localhost:3000`), aplikasi Next.js langsung terhubung ke Google Cloud Firestore produksi `bhumiamartya-fe85c` karena variabel `USE_FIREBASE_EMULATOR` tidak disetel aktif di lingkungan lokal. Hal ini sempat memicu error benturan penulisan `Document already exists` (status 6 ALREADY_EXISTS) pada koleksi `analytics`.
* **Impact:** Risiko kontaminasi telemetri produksi oleh sesi pengetesan lokal, race condition penulisan event dokumen, dan potensi ketidaksengajaan mutasi data produksi saat sesi debugging.
* **Mitigation (Sprint DASH-WEEKLY-05):**
  1. Menerapkan deduplikasi in-memory 3000ms pada `lib/analytics/usageAnalytics.ts` untuk meredam pemanggilan ganda dari React StrictMode.
  2. Menangani error status 6 (`ALREADY_EXISTS`) di `lib/repositories/analyticsRepository.ts` secara idempoten (soft log warning) tanpa crash atau unhandled rejection.
  3. Menegaskan larangan mutasi/penghapusan koleksi produksi secara langsung dari terminal agent.
  4. Penggunaan Firebase Local Emulator Suite tetap menjadi rekomendasi jangka menengah untuk isolasi total lingkungan dev dari prod.
* **Verification:** Terbukti lolos melalui test suite `tests/unit/build118-analytics-conflict.test.ts` (4/4 PASS).
* **Current Status:** **OPEN RESIDUAL RISK (MITIGATED LOCALLY, EMULATOR PENDING)**.

---

### RSK-33: Profile Daily Note Legacy Stacking & Orphan Blueprint Data (RESOLVED IN BUILD 118)
* **Severity:** **P1 (UX WALL-OF-SCROLLING & DATA INTEGRITY - RESOLVED)**
* **Category:** Presentation Layer & Domain Engine Architecture
* **Description:** Komponen lama `DailyNoteV2.tsx` pada halaman profil merender 8 kartu `<IntelligenceCard>` yang selalu terbuka secara bersamaan, memicu vertical scrolling berlebihan (>3000px) yang membebani pengguna mobile. Selain itu, generator lama `profileDailySynthesis.ts` hanya berbasis modulo tanggal `dayNumber % 5` dan mengabaikan 88% Blueprint Kanonikal (Destiny Matrix Love Path, Ekor Karma, Center, Human Design, Life Path, BaZi).
* **Impact:** Pengalaman pengguna buruk di mobile device, pembacaan terasa acak dan generik, serta pelanggaran aturan kanonikal No Orphan Data / No Orphan Meaning.
* **Mitigation (Sprint PROFILE-DAILY-01):**
  1. Mengimplementasikan arsitektur 2-lapisan via `DailySoulJournalCard.tsx`: Lapisan 1 ringkas (~180-220px) dengan tanggal, Weton, headline personal, 1–2 kalimat rangkuman energi, 2–3 micro-badges, dan toggle expand.
  2. Lapisan 2 (Deep Reading) menyediakan 7 bagian terstruktur (Langit Hari Ini, Yang Sedang Bergerak Dalam Dirimu, Pesan Jiwa Hari Ini, Yang Perlu Kamu Sadari, Ruang yang Terbuka, Saran Bhumi, Dasar Pembacaan details).
  3. Mengembangkan engine deterministik `dailySoulJournalEngine.ts` yang mengonsumsi cuaca SwissEph riil dan 100% data cetak biru kanonikal pengguna tanpa data yatim.
  4. Menerapkan blacklist frasa klise AI (`sanitizeHumanizedText()`) dan membatasi Saran Bhumi menjadi tepat satu arahan praktis membumi.
* **Verification:** Terbukti lolos melalui test suite `tests/unit/build118-daily-guidance.test.ts` (76/76 checks PASS LOCAL).
* **Current Status:** **SUPERSEDED BY PROFILE-DAILY-02**.

---

### RSK-34: Profile Daily Guidance Format Inconsistency & Temporal Depth Gap (RESOLVED IN BUILD 118 SPRINT PROFILE-DAILY-02)
* **Severity:** **P1 (UX PARITY & TEMPORAL INTEGRITY - RESOLVED)**
* **Category:** Product Architectural Consistency & Multi-System Temporal Synthesis
* **Description:** Perancangan awal Catatan Hari Ini menggunakan struktur 7 bagian terpisah ("Daily Soul Journal") yang menyimpang dari format 8 domain Panduan Minggu Ini yang telah disetujui Founder. Selain itu, pembacaan harian berisiko mengabaikan kekayaan siklus harian yang sudah tersedia dan tervalidasi pada fitur "Astro Hari Ini" (Weton Jawa, BaZi harian & Day Ren, Tzolkin Maya, dan transit sub-menit).
* **Impact:** Inkonsistensi mental model pengguna antara Dashboard (8 domain) dan Profile (7 bagian), serta pemborosan potensi kalkulasi temporal harian yang sudah ada di Astro Hari Ini.
* **Mitigation (Sprint PROFILE-DAILY-02):**
  1. Founder meluruskan arah: Catatan Hari Ini wajib mengadopsi 100% format, desain kartu akordeon vertikal 8 domain, Top 3 kartu sorotan, dan Dasar Pembacaan yang sama persis dengan Panduan Minggu Ini, dengan rentang kalkulasi harian (1 hari).
  2. Mengintegrasikan seluruh siklus temporal harian dari Astro Hari Ini tanpa kalkulasi ulang terpisah: Weton Jawa hari ini (hari, pasaran, neptu, wuku), BaZi hari ini (Heavenly Stem + Earthly Branch) dengan deteksi eksplisit **Day Ren** (壬, Air Yang) dan relasi Shishen terhadap Day Master natal, Tzolkin Maya hari ini (Kin, Seal, Tone, Wavespell), dan posisi/fase/iluminasi Bulan SwissEph.
  3. Mengimplementasikan `dailyTransitCalculator.ts` dengan 24 sub-interval pencarian akar untuk perkiraan waktu kontak transit eksak 'sekitar HH:mm WIB'.
  4. Menerapkan alokasi transit bebas tabrakan (`usedAspectIndices`) dan batas relevansi minimum 14 untuk menjaga keseimbangan intensitas (Kuat, Sedang, Tenang) dan ketiadaan triplikasi saran.
* **Verification:** Terbukti lolos melalui test suite `tests/unit/build118-daily-guidance.test.ts` (239/239 checks PASS LOCAL) dan 706 total assertions di seluruh repositori.
* **Current Status:** **RESOLVED & VERIFIED (PENDING FOUNDER REVIEW)**.




---

### RSK-35: Consumer Blast Radius Destiny Matrix pada Guidance Lintas Sistem (MITIGATION BY SCOPE-LOCK)
* **Severity:** **P1 (BLAST RADIUS - MITIGATED BY SCOPE-LOCK)**
* **Category:** Multi-System Consumer Blast Radius
* **Description:** Destiny Matrix mengalir ke Panduan Minggu Ini (line Khuang), Catatan Hari Ini (Ekonomi/Asmara/Berat/Ruang Terbuka), dan translator RIP. Perubahan BP02 berisiko merusak pembacaan lintas sistem jika dilakukan otomatis.
* **Mitigation:** Scope-lock Founder 31 Okt 2026 — zero mutasi product code; setiap kebutuhan perubahan shared code wajib laporan dependency & blast radius dulu; engine tetap frozen separuh perjalanan BP02.
* **Current Status:** **MITIGATED (SCOPE-LOCK, NO SOURCE CHANGE)**.

### RSK-36: Stale Checkpoint Executor Blueprint `check:matrix` / `validateBhumiMatrixV1` (RESOLVED BY DOCUMENTED DECISION D-02-1..2)
* **Severity:** **P2 (STALE GOVERNANCE ARTIFACT - DIDOKUMENTASIKAN, TIDAK DIPERBAIKI)**
* **Category:** Governance Document Staleness
* **Description:** Dua executor legasi Blueprint masih merger dengan register lama Blueprint 9 (R4 dst.) yang telah di-refactor ke V1 engine; exit code 1 adalah sisa dokumentasi, bukan kerusakan engine.
* **Mitigation:** Didokumentasikan pada ADR-DASH-05 (keputusan D-02-1/D-02-2) — tidak diperbaiki sebelum Founder decide; tidak digunakan sebagai gate rilis.
* **Current Status:** **DOCUMENTED STALE (PENDING FOUNDER DECISION)**.

### RSK-37: Divergensi Emotes 4 Baris Cakra Fixture Referensi vs Engine Canonical (REFERENSI TIDAK DIREPRODUKSI ENGINE)
* **Severity:** **P2 (CONTENT INTEGRITY - DOKUMENTASI MELEBIHI, TIDAK DIPERBAIKI)**
* **Category:** Editorial Content Integrity vs Canonical Engine
* **Description:** Emotions Ajna(5) Vishuddha(6) Anahata(4) Manipura(16) pada referensi Founder TIDAK berasal dari engine canonical (kanonikal engine menghasilkan 8/13/8/8), sedangkan angka 4 tidak muncul di seluruh matriks Widhi; fixture referensi tidak dapat direproduksi oleh engine canonical (kemungkinan fixture lama/chartHeart legacy).
* **Mitigation:** D-B-8 diputuskan Founder (31 Okt 2026, Task 10/11): **Option A — runtime selalu menampilkan angka canonical engine** (Health Card template tetap tuple-agnostic); fixture referensi bersifat design-reference saja dan tidak direproduksi ke runtime; tidak ada angka campuran engine+legacy; tidak ada formula yang diubah.
* **Current Status:** **RESOLVED (D-B-8 Option A — Health Card menampilkan angka canonical engine; tanpa angka campuran; implementasi menunggu gate BP02-D5)**.

### RSK-38: User Data Isolation & Cache Cross-User untuk Destiny Matrix (GATE FROZEN/CLOSED BP02)
* **Severity:** **P1 (DATA PRIVACY & ISOLATION - ACCEPTANCE GATE BP02-D1..E)**
* **Category:** Security, Privacy & PII; Cross-User Data Isolation
* **Description:** Hasil Destiny Matrix wajib berasal dari input valid pengguna aktif; risiko kebocoran data antar-akun pada logout, account switching, stale doc, request race, cache active ledger global.
* **Mitigation:** Requirement isolasi stabil dipasang pada PRM (PRM seksi BP02 User Data Isolation & Personalization): UID ownership & freshness; pembacaan hanya berasal dari data akun aktif (tanpa fixture/founder/hardcode default); cache & negara key by owner identity + input valid; regression tests 2 UID, logout, account switching, request race, cache isolation; guards produksi fail-closed; test sintetis bukan bukti pengganti E2E Firestore Rules.
* **Current Status:** **PLANNED (BP02-D1) — TIDAK ADA BP02 FROZEN/CLOSED SEBELUM SELURUH ISU ACCEPTANCE TERPENUHI**.

### RSK-B126-PROFILE — Canonical freshness and save acknowledgment

* **Severity:** P1 data-integrity acceptance blocker; production reachability UNVERIFIED.
* **Evidence:** synthetic same-account newer/older completion returns outdated BP10 result; settings helper resolves when synthetic save callbacks return false. Local-only results do not prove a production incident or authorization violation.
* **Status:** OPEN — BP10 local freeze and Release 119 readiness BLOCKED. Proposed authority, compatibility and acceptance design: `BUILD126_SHARED_PROFILE_AUTHORITATIVE_REVISION_AND_PERSISTENCE_ACK_DESIGN.md`.
* **Next decision:** Founder approval of trusted ordering, acknowledgment, security Rules/legacy-client behavior and separately scoped implementation/migration; broader security/Billing remain Release 120, subject to mandatory Release 119 safety gate.


### RSK-B126-PROFILE — final design gate update (2026-11-03)

* **Status:** OPEN; BP10 freeze and Release 119 readiness BLOCKED.
* Preferred design is server-owned revision with atomic compare-and-set and idempotent acknowledgment; server metadata alternative is locally plausible but not established end-to-end. No schema or Rules implementation is authorized.
* **Additional gate:** prior Android versions may bypass or misreport rejected/local-only birth writes; update enforcement and deployed Rules remain UNVERIFIED. Minimum security and migration must be separately reviewed and authorized.
* Evidence: `BUILD126_PROFILE_REVISION_FINAL_IMPLEMENTATION_SECURITY_AND_LEGACY_DESIGN.md`.


### RSK-B126-PROFILE — Phase A emulator evidence (2026-11-03)

* **Status:** OPEN / BP10 FREEZE BLOCKED / RELEASE 119 BLOCKED.
* Isolated current-local-Rules synthetic emulator observed owner unversioned birth update and arbitrary revision-like field allowed; cross-account test denied. No claim about deployed production Rules.
* Trusted static-Android-to-server route/IAM, complete legacy writer fencing, truthful failure/upgrade behavior and migration remain unverified. No local candidate or deployment was created. Evidence: `BUILD126_PROFILE_REVISION_SERVER_CONTRACT_LOCAL_IMPLEMENTATION_REPORT.md`.


### 2026-11-03 — Build 126 current baseline and profile boundary

Release 119 remains blocked: candidate Rules permit an arbitrary birthRevision field; unversioned snapshots can bypass the current shared freshness guard; legacy runtime and production security remain unverified. See BUILD126_RELEASE119_CURRENT_BASELINE_AND_PROFILE_IMPLEMENTATION_REPORT.md.


### 2026-11-03 — Build 126 profile security closure

Known issue: candidate Rules restriction denies legitimate direct Blueprint input writes without an implemented trusted replacement; partial legacy initialization, receipt and nested/alternative path coverage remain unverified. Release 119 remains blocked. See BUILD126_RELEASE119_PROFILE_SECURITY_CLOSURE_AND_BP10_INTEGRATION_REPORT.md.


### 2026-11-03 — Build 126 Blueprint writer prototype

Known issue: the older candidate allowed forged Blueprint provenance; a local derivative denies the tested revision field but computed Blueprint values remain client-writable and consumed. Legacy initialization and rollout remain blocked. See BUILD126_RELEASE119_TRUSTED_BLUEPRINT_WRITER_AND_PROFILE_CONTRACT_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 Phase A security integration

Known issue: previous Blueprint Rules allowed forged stored Human Design; metadata-only candidate denies tested forgery but blocks existing legitimate full-result writers. Functions entrypoint has missing local modules; initializer and receipts remain unverified. See BUILD126_RELEASE119_PHASE_A_FINAL_SECURITY_AND_BP10_INTEGRATION_REPORT.md.


### 2026-11-03 — Build 126 Functions integration recovery

Release 119 remains blocked by unverified missing Functions modules and unavailable integrated trusted Blueprint/profile writer; restrictive local Rules alone break legitimate writes. Legacy initialization, receipts and Android compatibility remain unresolved. See BUILD126_RELEASE119_FUNCTIONS_BLUEPRINT_WRITER_AND_PROFILE_INTEGRATION_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 local Functions continuation

Known issues: missing production Functions source and unknown deployed exports; inconsistent legacy aliases, retry acknowledgment and trusted Blueprint result/consumer behavior remain unresolved despite partial local callable evidence. See BUILD126_RELEASE119_FUNCTIONS_RECOVERY_AND_TRUSTED_PROFILE_CONTINUATION_REPORT.md.


### 2026-11-03 — Build 126 profile alias integration gate

Known issue: conflicting location aliases are conservatively blocked; nested-only legacy records, actual timeout/retry persistence, trusted calculated outputs and Rules/consumer coverage remain unverified. Main Functions and legacy Android remain release blockers. See BUILD126_RELEASE119_LOCAL_PROFILE_BLUEPRINT_AND_BP10_INTEGRATION_REPORT.md.


### 2026-11-03 — Build 126 profile and Blueprint integration gates

Known issue: real timeout and retry identity across reload, complete alias reconciliation and canonical provenance, legitimate trusted Blueprint output/consumer and installed Android behavior remain unverified. Release 119 remains blocked. See BUILD126_RELEASE119_CANONICAL_PROFILE_BP10_AND_BLUEPRINT_E2E_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 application save integration

Known issue: session-scoped retry identity is not durable after tab close and can block after profile revision changes; callable/Rules/Blueprint shared flow and legacy Android are incomplete. Four selected Build 115 test cases fail in this run. See BUILD126_RELEASE119_ACTUAL_APPLICATION_INTEGRATION_REPORT.md.


### 2026-11-03 — Build 126 shared profile and HD triage

Known issue: shared revision still lacks proven server/cache provenance; stale BP10 end-to-end remains unverified. Build 115 has four current fixture/contract failures; no historical passing baseline established. Trusted Blueprint and main Functions remain blocked. See BUILD126_RELEASE119_SHARED_PROFILE_BP10_AND_HD_REGRESSION_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 Settings provider integration

Known issue: actual Settings/BP10 emulator browser path remains blocked by QA runtime guard and unverified Blueprint persistence; cached revisions and session recovery need further proof. Build 115 still has four fixture/contract failures. See BUILD126_RELEASE119_SETTINGS_AUTHPROVIDER_BP10_INTEGRATED_E2E_REPORT.md.


### 2026-11-03 — Build 126 QA runtime and HD token evidence

Known issue: combined-emulator browser mode is denied by QA runtime contract. Five synthetic HD transport token checks pass but the original Build 115 suite still has four failures; Blueprint, Functions and Android release risks remain. See BUILD126_RELEASE119_QA_RUNTIME_AND_BP10_TRUE_E2E_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 OpenCode QA reconciliation

Known issue: QA-only application execution remains disabled until immutable build identity, Android release isolation and full endpoint/identity controls are demonstrated. The prior OpenCode branch accepted qaOnly values with NODE_ENV production before quarantine. See BUILD126_OPENCODE_QA_GUARD_RECONCILIATION_REPORT.md.


### 2026-11-03 — Build 126 QA build isolation execution gate

QA-only runtime and BP10 integrated E2E remain blocked: independently verified build identity and production artifact isolation are absent. Guard 568/538, standalone helper 42 and BP10 math 6,948/1,444 passed locally; the old freshness probe failed against the current fail-closed save contract. See BUILD126_RELEASE119_QA_BUILD_ISOLATION_AND_TRUE_BP10_E2E_REPORT.md. No feature freeze or release approval.


### 2026-11-03 — Build 126 freshness probe reconciliation

The old helper probe now verifies explicit failure and no subsequent Blueprint callback on rejected profile persistence: 10 checks passed. Actual isolated QA harness and BP10 integrated E2E remain blocked and unimplemented; no freeze recommendation. See BUILD126_RELEASE119_QA_HARNESS_EXECUTION_AND_BP10_E2E_ACCEPTANCE_REPORT.md.


### 2026-11-03 — Build 126 isolated QA login smoke

A dedicated local Next target started against three synthetic loopback emulators; actual login and Auth Emulator smoke passed (3 checks). Production artifact isolation and the full QA security contract remain blocked; BP10 E2E was not run. See BUILD126_RELEASE119_QA_HARNESS_IMPLEMENTATION_RESULT.md.


### 2026-11-03 — Build 126 QA security acceptance

Candidate Rules passed 13 scoped authenticated emulator checks and the actual login smoke passed. Process identity remains blocked on independent lineage and complete fallback evidence; production artifact isolation remains blocked because the isolated release build fails TypeScript. BP10 E2E not run. See BUILD126_RELEASE119_QA_SECURITY_ACCEPTANCE_AND_BP10_E2E_REPORT.md.


### 2026-11-03 — Build 126 owned QA stack and TypeScript progress

Owned local emulator stack, app-scope loopback and login smoke executed; continuous listener ownership and comprehensive browser egress isolation remain blocked, so BP10 E2E was not run. TypeScript improved from 18 to two Human Design status-contract diagnostics; repository TSC remains FAIL. See BUILD126_RELEASE119_QA_UNBLOCK_AND_BP10_INTEGRATED_EXECUTION_REPORT.md.


### 2026-11-03 — Build 126 launcher and browser boundary

Launcher IPC challenge, parent checks and periodic process/listener monitoring were exercised; owned Firestore termination closed the QA session. Chromium WebRTC bypassed HTTP interception; added browser defense-in-depth did not establish OS egress isolation. Local BP10 E2E remains blocked. Two protected Human Design status-contract TypeScript diagnostics remain. See BUILD126_RELEASE119_QA_SECURITY_AND_BP10_E2E_FINAL_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 offline namespace capability

A disposable WSL network namespace passed loopback and external TCP/UDP/DNS denial checks, but the actual app/emulators/Chromium were not run inside it and sandbox acceptance remains blocked. Two Human Design calculationStatus diagnostics remain unresolved; a separate existing live normalizer test failed. See BUILD126_RELEASE119_OFFLINE_QA_AND_BP10_E2E_REPORT.md.


### RSK-39: Premature Production Firestore Rules Rollout Breaking Legacy Clients
* **Severity:** **P0 (CRITICAL)**
* **Category:** Production Safety & Backward Compatibility
* **Description:** Hardening rules langsung ke produksi akan memutus klien Android v118/119/120 pada alur onboarding atau edit tanggal lahir.
* **Impact:** Pengguna Play Store aktif mengalami error `permission-denied` dan gagal menggunakan aplikasi.
* **Mitigation:** Rules live dipertahankan permisif terkontrol; candidate rules diuji di emulator; rilis 121 menyertakan matriks kompatibilitas versi sebelum rollout produksi.
* **Current Status:** **OPEN / MITIGATED VIA COMPATIBILITY GATE**.

---

### RSK-40: Cloudflare Workers Free Tier CPU & Concurrency Limits in Production
* **Severity:** **P0 (CRITICAL)**
* **Category:** Infrastructure & Scalability
* **Description:** Cloudflare Workers Free memiliki batasan CPU time 10ms/128MB. Walaupun tes lokal 4ms, eksekusi WebCrypto token revocation dan Firestore REST transaksi multi-roundtrip di produksi perlu diverifikasi.
* **Impact:** Potensi HTTP 500 / Worker CPU Exceeded pada lonjakan trafik.
* **Mitigation:** Benchmark berulang pada staging/canary sebelum cutover; audit batas kuota dan fail-closed error handling.
* **Current Status:** **OPEN / OBSERVABILITY GATE REQUIRED**.

---

### RSK-41: Vercel Billing Cutover Race & Entitlement Disruption
* **Severity:** **P0 (CRITICAL)**
* **Category:** Commercial & Entitlement Integrity
* **Description:** Peralihan endpoint billing dari Vercel ke Cloudflare Worker berisiko menimbulkan race condition atau kegagalan acknowledge purchaseToken Google Play.
* **Impact:** Pengguna kehilangan akses Premium yang sah atau transaksi tertunda.
* **Mitigation:** Lima endpoint Vercel tetap live; port bertahap dengan contract parity 100%; cutover hanya setelah end-to-end sandbox testing dan persetujuan Founder.
* **Current Status:** **OPEN / CUTOVER GATE LOCKED**.

---

### RSK-42: Unintentional Regressions to BUILD 120 Parity & Ephemeris
* **Severity:** **P1 (HIGH)**
* **Category:** Product & Algorithmic Parity
* **Description:** Perubahan refactoring pada guidance engine berisiko merusak paritas Dashboard/Profile Arah Hari Ini, memorial footer, atau formula Lilith/BaZi/Vedic.
* **Impact:** Kerusakan integritas pembacaan dan regresi produk yang sudah ditutup.
* **Mitigation:** Suite pengujian `build120-dashboard-insight-alignment.test.ts`, `bazi-vedic-local-recovery.test.ts`, dan `lilith-parity.test.ts` dijalankan wajib sebagai invariant test suite.
* **Current Status:** **MITIGATED BY AUTOMATED INVARIANT TESTS**.

---
