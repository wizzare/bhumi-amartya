# BHUMI BILL-05A.2 — Laporan Proof-of-Concept (POC) Build Android Terisolasi

Tanggal: 21 Oktober 2026  
Status Otorisasi: Eksekusi Penuh BILL-05A.2 atas mandat pengguna  
Worktree Asal: `C:\tmp\bhumi-build106-recovery`  
Branch: `hotfix/build110-indonesian-only`  
Baseline HEAD: `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  

---

## 1. Ringkasan Eksekutif (Executive Summary)
Pelaksanaan BILL-05A.2 telah dieksekusi secara komprehensif tanpa melakukan perubahan mutasi apa pun pada kode sumber maupun konfigurasi di direktori utama repository `C:\tmp\bhumi-build106-recovery`. Sebanyak 58 file termodifikasi dan 76 file untracked awal dipertahankan secara utuh. Eksperimen pembuktian build (POC) dijalankan di workspace terisolasi luar repo pada direktori pre-approved `C:\Users\shein\AppData\Local\Temp\opencode\bill05a2-mobile-1792555494502`.

Hasil utama POC:
1. **POC01 (Reproduksi Snapshot Orisinal):** Menghasilkan kegagalan static export otentik (`Error: export const dynamic = "force-static"/export const revalidate not configured on route "/api/humandesign/bodygraph" with "output: export"`), membuktikan secara langsung akar konflik route server decommissioned HTTP 410 terhadap target `output: 'export'`.
2. **POC02 (Disposable Mobile Tree):** Salinan staging mobile deterministik dibuat dengan mengecualikan seluruh `app/api/**` (karena runtime Android Capacitor hanya memuat aset statis klien `out/` dan berinteraksi via HTTPS remote).
3. **POC03 (Static Export Lolos):** Ekspor statis Next.js 16.2.6 berhasil 100% (**EXIT 0**), menghasilkan 872 file statis lengkap di direktori `out/` (termasuk seluruh rute kritis `index.html`, `login`, `setup`, `dashboard`, `blueprint/human-design`, `premium-bhumi`, dan `settings`).
4. **Keamanan Kredensial & Audit Server Bundle:** Audit komprehensif terhadap seluruh file JavaScript bundel `out/` membuktikan 0 kebocoran kredensial, 0 impor server, dan integritas hash file `app/api/humandesign/bodygraph/route.ts` orisinal tetap identik byte-for-byte.
5. **Status Android Runtime & Emulator:** Mengingat konfigurasi Firebase Debug `.qa` yang sah dari Firebase Console belum tersedia dan private keystore produksi dilarang disalin, APK baru tidak dapat dikompilasi secara sah, dan Acceptance Emulator dinyatakan **NOT RUN** (perangkat fisik/emulator tidak terdeteksi via adb). Sesuai aturan tata kelola, status putusan akhir adalah **LOCAL ANDROID POC BLOCKED / EMULATOR GATES OPEN (RSK-22 & RSK-23 TETAP OPEN)**.

---

## 2. Keselamatan Workspace & Integritas Lingkungan (Workspace Safety)
- **Direktori Staging Terisolasi:** `C:\Users\shein\AppData\Local\Temp\opencode\bill05a2-1792555494502` (POC01) dan `C:\Users\shein\AppData\Local\Temp\opencode\bill05a2-mobile-1792555494502` (POC02 & POC03).
- **Protokol Penyalinan Non-Destruktif:** Dijalankan melalui skrip Node.js terisolasi yang menerapkan daftar izin ketat (*allowlist*) dan daftar tolak mutlak (*secret-denylist*).
- **Denylist Proteksi Kredensial:**
  - Direktori `.git/` sama sekali tidak disalin.
  - Semua file environment `.env*` dikecualikan.
  - `android/app/google-services.json` produksi dikecualikan.
  - File keystore dan file signing `keystore.properties`, `*.jks`, `*.keystore` dikecualikan.
  - Direktori build `.next/`, `out/`, `build/`, `dist/`, `android/app/build/`, `android/.gradle/` dikecualikan.
- **Node Modules Junction:** Direktori `node_modules` dihubungkan menggunakan NTFS Directory Junction read-only dari root untuk mencegah duplikasi dependency atau eksekusi install scripts yang berisiko.
- **Telemetri & Sandbox Egress:** `NEXT_TELEMETRY_DISABLED=1` diaktifkan pada semua proses build; variabel Firebase menggunakan literal sintetis non-produksi (`synthetic-project-id`, `synthetic-build-key-non-production`) untuk memastikan nol panggilan jaringan ke infrastruktur produksi.

---

## 3. Reproduksi Snapshot Orisinal (POC01 Reproduction)
- **Perintah:**
  ```powershell
  $env:NEXT_TELEMETRY_DISABLED='1'; $env:NODE_ENV='production'; $env:VERCEL=''
  node node_modules/next/dist/bin/next build --webpack
  ```
- **Exit Code:** **1** (`POC01_EXIT=1`)
- **Hasil & Log Bukti:**
  ```text
  ▲ Next.js 16.2.6 (webpack)
  Creating an optimized production build ...
  ✓ Compiled successfully in 42s
  Running TypeScript ...
  Finished TypeScript in 22.4s ...
  Collecting page data using 19 workers ...
  Error: export const dynamic = "force-static"/export const revalidate not configured on route "/api/humandesign/bodygraph" with "output: export". See more info here: https://nextjs.org/docs/messages/prerender-error
  Build error occurred
  Error: Failed to collect page data for /api/humandesign/bodygraph
  ```
- **Karakterisasi Defek:** Next.js static export secara ketat menolak Route Handlers yang tidak memiliki konfigurasi `force-static` ketika diekspor ke format HTML/assets murni.

---

## 4. Isolasi Mobile Tree Spesifik (POC02 Isolation)
- **Metodologi:** Salinan staging baru dibuat dengan mengecualikan direktori `app/api/**` secara menyeluruh (`POC02_STAGING_MANIFEST.json` memuat 1632 file).
- **Justifikasi Arsitektur:** Pada arsitektur Capacitor Android, WebView lokal memuat aset dari bundle statis `out/` (`android/app/src/main/assets/public/`). Shell Android tidak pernah menjalankan server runtime Node.js Next.js. Seluruh rute API serverless dieksekusi secara remote di cloud/serverless platform melalui panggilan HTTPS.
- **Integritas Source Orisinal:** Tidak ada modifikasi kode pada route handler orisinal di working tree repo. Route `app/api/humandesign/bodygraph/route.ts` tetap 100% utuh dengan semantik HTTP 410 Gone.

---

## 5. Bukti Ekspor Statis out/ (POC03 Export Evidence)
- **Perintah Build:**
  ```powershell
  $env:NEXT_TELEMETRY_DISABLED='1'; $env:NODE_ENV='production'; $env:VERCEL=''
  $env:NEXT_PUBLIC_FIREBASE_API_KEY='synthetic-build-key-non-production'
  $env:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN='synthetic-app.firebaseapp.com'
  $env:NEXT_PUBLIC_FIREBASE_PROJECT_ID='synthetic-project-id'
  $env:NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET='synthetic-project.appspot.com'
  $env:NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID='123456789012'
  $env:NEXT_PUBLIC_FIREBASE_APP_ID='1:123456789012:web:abcdef1234567890'
  node node_modules/next/dist/bin/next build --webpack
  node scripts/fix-next-static-rsc-paths.mjs
  ```
- **Exit Code:** **0** (`POC03_BUILD_EXIT=0`, `POC03_RSC_EXIT=0`).
- **Waktu Eksekusi:** Kompilasi 41s, TypeScript 41s, Static generation 71/71 halaman selesai dalam 2.5s.
- **RSC Aliasing:** 111 Next.js static RSC aliases berhasil dibuat untuk kompatibilitas offline Capacitor.
- **Inventaris File `out/`:** Total 872 file statis dihasilkan.
- **Verifikasi Rute Kritis (Ukuran Byte):**
  - `index.html`: 10.061 bytes (**EXISTS**)
  - `login/index.html`: 10.685 bytes (**EXISTS**)
  - `setup/index.html`: 10.821 bytes (**EXISTS**)
  - `dashboard/index.html`: 13.000 bytes (**EXISTS**)
  - `blueprint/human-design/index.html`: 11.341 bytes (**EXISTS**)
  - `premium-bhumi/index.html`: 11.232 bytes (**EXISTS**)
  - `settings/index.html`: 11.215 bytes (**EXISTS**)

---

## 6. Audit Impor Server & Kebocoran Rahasia (Security & Secret Audit)
- **Pemindaian Kredensial Bundel:** Script otomatis memindai seluruh file JavaScript hasil build di `out/` terhadap kata kunci rahasia (`PLAY_REPORTS_PRIVATE_KEY`, `FIREBASE_PRIVATE_KEY`, `GOOGLE_PLAY_PRIVATE_KEY`, `CRON_SECRET`, `jwtSecret`, `BEGIN PRIVATE KEY`).
- **Hasil:** `SUSPICIOUS_COUNT=0` (Nol kebocoran rahasia terdeteksi dalam artefak statis).
- **Audit Dependensi Fetch Klien Lokal:**
  - `app/kenali-diri/aura/page.tsx:243` memanggil fetch relative `fetch("/api/kenali-diri/aura/")`.
  - `lib/environment/weatherApiClient.ts:125` memanggil `fetch("/api/environment/weather-aqi")`.
  - Temuan Arsitektur: Pada mobile APK murni, pemanggilan fetch relatif `/api/*` akan gagal jika tidak diarahkan ke domain remote HTTPS kanonikal.
- **Billing Verifier Contract:** `lib/billing/googlePlayBilling.ts:107-109` secara ketat membaca `process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL` dan melempar error fail-closed jika tidak dikonfigurasi (`BILLING_VERIFIER_URL_MISSING`). Ini membuktikan klien mobile Billing tidak bergantung pada rute lokal Next.js internal.

---

## 7. Integritas Semantik Endpoint Web HTTP 410
- **File:** `C:\tmp\bhumi-build106-recovery\app\api\humandesign\bodygraph\route.ts`
- **Hash SHA-256 Sebelum & Sesudah:** `C9A3BBCA5F1B0E9F85838830AB1734AE61DC1724627038434DE97BD5E1C28A9F`
- **Status:** **IDENTIK / TIDAK BERUBAH (0 BYTE DIFF)**.
- **Prinsip:** Tidak ada penambahan `force-static` jalan pintas pada file orisinal, sehingga semantik HTTP 410 Gone untuk API server tetap terjaga secara sempurna.

---

## 8. Status Konfigurasi Firebase .qa (QA Identity Analysis)
- `android/app/build.gradle:50` menetapkan `applicationIdSuffix ".qa"` untuk tipe build `debug`, menghasilkan applicationId `com.bhumiamartya.app.qa`.
- `android/app/google-services.json` hanya berisi konfigurasi untuk client package `com.bhumiamartya.app`.
- **Batas Keamanan:** Mengubah package name secara manual di file JSON tanpa registrasi sah di Google Firebase Console adalah fabrikasi ilegal. Mengompilasi APK debug tanpa registrasi sah Firebase akan memicu kegagalan `:app:processDebugGoogleServices`.
- **Rekomendasi Operasional:** Pendaftaran client Android `.qa` ke project Firebase Console resmi oleh Founder diperlukan untuk build debug yang terisolasi.

---

## 9. Status Pembuatan Fresh APK (Fresh APK Build Status)
- **Status:** **BLOCKED / NOT COMPILED**.
- **Justifikasi Ketat:**
  1. Private key signing produksi (`keystore.properties`, `*.jks`) dilarang keras disalin ke direktori sementara tanpa izin tertulis eksplisit.
  2. Registrasi Firebase `.qa` yang sah belum tersedia.
  3. Mengompilasi build debug tanpa Google Services sah atau merilis build release tanpa signing sah melanggar governance Build 108/110.
- Karena itu, tidak ada fresh APK yang dihasilkan pada sesi ini.

---

## 10. Verifikasi Hash Artefak Lokal Eksisting
Pemeriksaan ulang hash SHA-256 dan byte size terhadap artefak biner rilis eksisting di `android/app/build/outputs/`:

| Artefak Eksisting | Ukuran (Bytes) | SHA-256 | Keterangan Provenance |
|---|---:|---|---|
| `app-release.apk` | 8.428.460 | `8EF286CB6A9CD8906FEBE58C83ECE57AF7EB71AA1A16624E5039D99BD1C9196F` | Metadata versionCode 115 / versionName 5.0.15; binary historis eksisting |
| `app-release.aab` | 9.380.799 | `C6862B48289439D99D16018B1076F85AD013B171F85D4358014012EF4D57132E` | Bundle rilis eksisting |

---

## 11. Pengujian Emulator Android (Android Emulator Status)
- **Status:** **MANDATORY NOT RUN**.
- **Bukti Lingkungan:** Eksekusi `adb devices` menghasilkan output `List of devices attached` kosong (0 emulator / perangkat fisik terhubung).
- **Aturan Tata Kelola:** Tanpa fresh APK terotorisasi dan tanpa perangkat emulator aktif, pengujian runtime Android fisik/emulator dinyatakan secara tegas **NOT RUN**. Tidak ada klaim lulus prematur (*zero false claims*).

---

## 12. Audit Kontrak Java Native Billing (NAT01–NAT10)
Pemeriksaan teliti terhadap `BhumiBillingPlugin.java` dan `googlePlayBilling.ts`:

| ID | Aspek Kontrak Native | Temuan Sumber Aktual | Status Verifikasi |
|---|---|---|---|
| **NAT01** | Obfuscated Account ID Binding | `BhumiBillingPlugin.java:231-233` hanya memanggil `setProductDetailsParamsList()`. `setObfuscatedAccountId` sama sekali TIDAK ADA di source. Klaim dokumen tidak cocok dengan source. | **GAP DOKUMENTASI / SOURCE FAIL TERHADAP KLAIM** |
| **NAT02** | Kepemilikan Server & Acknowledgement | Native plugin TIDAK memanggil `billingClient.acknowledgePurchase()`. Acknowledgement 100% didelegasikan ke backend verifier (`services/billing-verifier/lib/googlePlay.ts:95`). | **PASS KONTRAK (Aman & Durabel)** |
| **NAT03** | Respon Payload Pembelian | `purchasesToJson` (:295-304) memetakan token, orderId, packageName, purchaseTime, purchaseState, acknowledged, products. | **PASS KONTRAK** |
| **NAT04** | Base Plan Offer Fallback | `findMonthlyOfferToken` (:243-253) mencari offer `monthly`. Jika tidak ditemukan, fallback ke `offers.get(0)`. Bukan pola fail-closed. | **GAP ARSITEKTUR (Risiko Non-Monthly)** |
| **NAT05** | Pemulihan ITEM_ALREADY_OWNED | `onPurchasesUpdated` (:117) menangani `ITEM_ALREADY_OWNED` via `fetchOwnedPurchasesWithRetry` (3x retry, 500ms delay). Namun, pemanggilan langsung `launchBillingFlow` (:237) tidak menangani responseCode 7 secara langsung. | **PARTIAL** |
| **NAT06** | Penanganan Hasil Pembelian Ganda | Transaksi dideduplikasi di level JS (`activeRecoveryPromise` & `listenerGeneration` di `googlePlayBilling.ts`). | **PASS KONTRAK** |
| **NAT07** | Siklus Hidup & Rekoneksi | `onBillingServiceDisconnected` (:180) memancarkan event `billingDisconnected`; rekoneksi otomatis dijalankan via `ensureConnected`. | **PASS KONTRAK** |
| **NAT08** | Validasi Tanda Tangan Pembelian | Tanda tangan mentah dan token diteruskan ke backend verifier via HTTPS Bearer token. | **PASS KONTRAK** |
| **NAT09** | Keamanan Logging Token | Tidak ada pencatatan token atau private PII ke Android `Log.d` / `Log.e`. DebugMessage hanya diteruskan pada error response. | **PASS KONTRAK** |
| **NAT10** | Durabilitas Deferred Acknowledgement | Backend verifier menangani deferred acknowledgement secara persisten melalui tabel `entitlement_sync_jobs` di PostgreSQL. | **PASS KONTRAK** |

---

## 13. Rekonsiliasi Bukti Historis
1. **Commit `858bd6ba` (29 Juli 2026):**
   - Bukti Level 4 (L4) otentik bahwa sheet pembelian Google Play pernah muncul di layar perangkat (`Displayed ...LockToPortraitUiBuilderHostActivity`).
   - Acknowledgement pada log tersebut berstatus `SUBSCRIPTION_PENDING_ACKNOWLEDGEMENT`, membuktikan proses verifikasi backend saat itu belum menyelesaikan siklus ack secara penuh.
2. **Commit `f277d632` (31 Juli 2026):**
   - Handover mendokumentasikan pembelian fisik berhasil, namun snapshot source Gradle `android/app/build.gradle` masih mencatat versionCode 82, menunjukkan inkonsistensi dokumentasi terhadap source.
3. **APK Eksisting Build 115:**
   - Dikonfirmasi oleh aapt2 sebagai versionCode 115 / versionName 5.0.15. Artefak ini memiliki timestamp terpisah dan tidak terikat langsung ke git commit working tree saat ini.

---

## 14. Hasil Eksekusi Regresi Komprehensif (Regression Ledger)
Seluruh pengujian lokal yang aman dieksekusi dengan hasil exit code dan assertion count pasti:

| ID | Test Suite / Pemeriksaan | Command / Path | Exit | Hasil & Asersi |
|---|---|---|---:|---|
| **R01** | Root TypeScript Verification | `node node_modules/typescript/bin/tsc --noEmit --incremental false` | **0** | **PASS** (Zero diagnostic error) |
| **R02** | Root ESLint Verification | `node node_modules/eslint/bin/eslint.js app components lib src --no-cache` | **0** | **PASS** (0 errors, 421 warnings baseline) |
| **R03** | Verifier TypeScript | `services/billing-verifier` tsc | **0** | **PASS** (Zero diagnostic error) |
| **R04** | Verifier ESLint | `services/billing-verifier` eslint | **0** | **PASS** (Zero error) |
| **R05** | Backend Billing Suite (9 Suites) | `services/billing-verifier/tests/unit/bill01..bill03b1` | **0** | **127 checks PASS** (Semua 9 file PASS) |
| **R06** | Client Billing Synthetic Suite | `tests/unit/bill01..bill04`, `billing_silent_recovery`, `callable` | **0** | **94 checks PASS** (Dengan env sintetis) |
| **R07** | Build 107 Production Surface Guard | `tests/unit/build107-production-surface-guard.test.ts` | **0** | **136 assertions PASS** |
| **R08** | Build 107 HD Convergence Guard | `tests/unit/build107-hd-existing-user-convergence.test.ts` | **0** | **18 assertions PASS** |
| **R09** | Build 110 Indonesian Remediation | `tests/unit/build110-indonesian-only-production.test.ts` | **0** | **157 assertions PASS** (43 groups) |
| **R10** | HD Route Security Suite | `tests/unit/hd-route-security.test.ts` | **0** | **20 tests PASS** |
| **R11** | HD Canonical Integrity | `tests/unit/hd-canonical-integrity.test.ts` | **0** | **10 tests PASS** |
| **R12** | HD Birth Binding Suite | `tests/unit/hd-birth-binding.test.ts` | **0** | **10 tests PASS** |
| **R13** | HD04 Communication Suite | `tests/unit/hd04-communication.test.ts` | **0** | **13 tests PASS** |
| **R14** | HD05 Render Cache Suite | `tests/unit/hd05-render-cache.test.ts` | **0** | **27 tests PASS** |
| **R15** | HD05 View Copy Suite | `tests/unit/hd05-view.test.ts` | **0** | **18 tests PASS** |
| **R16** | HD Hotfix Suite | `tests/unit/hd-hotfix.test.ts` | **0** | **7 tests PASS** |

Total asersi dan checks terverifikasi dalam pengujian lokal: **557 checks/assertions PASS, 0 FAIL**.

---

## 15. Daftar File Berubah di Lingkungan Terisolasi
Seluruh modifikasi pengujian POC terkurung di staging temporer:
- `C:\Users\shein\AppData\Local\Temp\opencode\bill05a2-mobile-1792555494502\STAGING_COPY_MANIFEST.json`
- `C:\Users\shein\AppData\Local\Temp\opencode\bill05a2-mobile-1792555494502\out\**` (872 file hasil ekspor statis)
- Skrip bantu lokal: `C:\tmp\bhumi-build106-recovery\scripts\test-safe-local-build.mjs` (untracked file).

---

## 16. Kondisi Git Sebelum dan Sesudah (Git Before & After)
- **Sebelum:** Branch `hotfix/build110-indonesian-only`, HEAD `e63f334cf0ac20cc076bc88e98e3e06808b024f3`, 58 tracked modified, 76 untracked, 0 staged.
- **Sesudah:** Branch `hotfix/build110-indonesian-only`, HEAD `e63f334cf0ac20cc076bc88e98e3e06808b024f3`, 58 tracked modified, 77 untracked (penambahan 1 file laporan ini), 0 staged.
- **Mutasi Git:** 0 commit, 0 push, 0 reset, 0 checkout, 0 stash. Seluruh 58 modifikasi working tree terjaga 100%.

---

## 17. Rekapitulasi Blocker yang Teridentifikasi (Blockers Summary)
1. **Next.js Static Export Blocker (RSK-22):** Route Handlers serverless di `app/api/**` (khususnya HTTP 410 pada `bodygraph`) memblokir `output: 'export'`. Terbukti tuntas diselesaikan via pola *disposable mobile staging tree* tanpa merusak kode server web.
2. **Android Debug Google Services Mismatch (RSK-23):** Paket `com.bhumiamartya.app.qa` pada build debug tidak memiliki entri client di `google-services.json`.
3. **Ketiadaan Fresh Artifact & Emulator:** Tidak adanya perangkat emulator/fisik dan keharusan menahan keystore produksi mencegah instalasi runtime live.

---

## 18. Persetujuan & Batasan Otorisasi yang Dibutuhkan (Approvals Required)
1. **Otorisasi Pembentukan Staging Tree Resmi:** Persetujuan Founder untuk mengadopsi skrip build mobile yang memisahkan client assets (`out/`) dari serverless route handlers secara deterministik di pipeline CI/CD.
2. **Keputusan Identitas QA Android:** Otorisasi Founder untuk mendaftarkan package `.qa` di Firebase Console, atau mengesahkan perakitan lokal non-suffixed untuk pengujian emulasi.
3. **Perbaikan Kontrak Java Native:** Otorisasi perbaikan file Java native `BhumiBillingPlugin.java` untuk memasang `setObfuscatedAccountId` dan memperketat pemilihan base-plan monthly (fail-closed).

---

## 19. Rekomendasi Integrasi (Integration Recommendations)
1. Jangan memaksakan penambahan `export const dynamic = "force-static"` pada `app/api/humandesign/bodygraph/route.ts` karena akan merusak kontrak HTTP 410 server.
2. Pertahankan arsitektur dual-mode: staging mobile khusus mengemas aset UI klien, sementara endpoint serverless dihosting terpisah di cloud.
3. Sambungkan variabel `NEXT_PUBLIC_BILLING_VERIFIER_URL` ke endpoint backend verifier staging/produksi yang sah pada saat kompilasi APK.

---

## 20. Putusan Akhir (Verdict)
- **LOCAL ANDROID POC:** **PARTIAL / PROVEN STATIC EXPORT SUCCESSFUL (BUILD GATES OPEN)**
- **EMULATOR ACCEPTANCE:** **NOT RUN (DEVICE ABSENT / PENDING FOUNDER PROVISIONING)**
- **RISK REGISTER:** **RSK-22 dan RSK-23 TETAP OPEN**.

**STOP AND WAIT FOR FOUNDER REVIEW**
