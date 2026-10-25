# BHUMI BILL-05A.3 — Laporan Komprehensif Mobile Build & Firebase QA

**Tanggal:** 21 Oktober 2026  
**Otoritas Dokumen:** SPRINT BILL-05A.3 / Founder Directive  
**Worktree:** `C:\tmp\bhumi-build106-recovery`  
**Branch Terotorisasi:** `hotfix/build110-indonesian-only`  
**Baseline HEAD:** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
**Klasifikasi:** Local Only / Zero Production Access / Zero Repository Mutation  

---

## 1. Ringkasan Eksekutif (Executive Summary)

Laporan ini menyajikan hasil evaluasi menyeluruh terhadap kelayakan perakitan biner Android (*mobile build pipeline*) dan arsitektur pengujian Firebase QA untuk aplikasi Bhumi Amartya. Berdasarkan hasil pembuktian konsep (POC) pada Sprint BILL-05A.2, seluruh kendala ekspor statis Next.js telah diidentifikasi dan berhasil diatasi di lingkungan *disposable staging* tanpa memodifikasi rute server web orisinal.

Hasil temuan utama dalam siklus evaluasi BILL-05A.3:
1. **Verifikasi Isolasi POC (POC-01 s/d POC-10):** Tercapai isolasi 100% pada staging build mobile temporer; 71 rute web menghasilkan 872 file statis di direktori `out/` dengan nol kebocoran kredensial (*zero secret leak*).
2. **Arsitektur Dual-Target:** Pemisahan tegas antara target Web (Vercel/SSR dengan rute server HTTP 410 dipertahankan) dan target Android Mobile (Capacitor WebView murni dengan pemanggilan remote HTTPS API).
3. **Status Perakitan APK Debug:** Berstatus **BLOCKED BY FIREBASE QA CONFIGURATION**. Tidak ada konfigurasi tiruan (*fake config*) yang dibuat demi menjaga integritas build. Kompilasi APK debug membutuhkan kredensial client Firebase resmi untuk `com.bhumiamartya.app.qa`.
4. **Status Runtime Emulator:** Berstatus **MANDATORY NOT RUN** karena fresh APK diblokir oleh ketiadaan konfigurasi Firebase QA dan tidak adanya target emulator aktif pada `adb devices`.
5. **Mitigasi Risiko Native Billing (NAT-01 s/d NAT-10):** Audit statis mendalam terhadap `BhumiBillingPlugin.java` dan pustaka pendukung menemukan 7 kontrak lulus (*PASS*), 2 celah arsitektur (*GAP*), dan 1 parsial (*PARTIAL*).

---

## 2. Verifikasi Isolasi Sumber POC (POC Source Isolation Verification)

Evaluasi isolasi sumber memverifikasi kepatuhan terhadap 10 prinsip isolasi (POC-01 hingga POC-10) yang telah diuji pada workspace temporer:

| Kode POC | Parameter Verifikasi | Hasil Pengujian | Bukti Status |
|---|---|---|---|
| **POC-01** | Reproduksi Snapshot Orisinal | Next.js menolak Route Handler tanpa `force-static` pada `output: 'export'` | **REPRODUCED (EXIT 1)** |
| **POC-02** | Isolasi Tree Mobile Terpisah | Staging disposable mengecualikan `app/api/**` tanpa mengubah repo sumber | **VERIFIED (PASS)** |
| **POC-03** | Keberhasilan Static Export | 71 rute menghasilkan 872 file statis di `out/` | **VERIFIED (EXIT 0)** |
| **POC-04** | RSC Path Aliasing | 111 alias file `__next.*.txt` terpetakan untuk runtime lokal offline | **VERIFIED (PASS)** |
| **POC-05** | Audit Kebocoran Rahasia | Pemindaian regex kredensial/private key pada seluruh bundel JavaScript `out/` | **0 FINDINGS (CLEAN)** |
| **POC-06** | Preservasi Endpoint HTTP 410 | Hash SHA-256 `app/api/humandesign/bodygraph/route.ts` identik (*zero mutation*) | **VERIFIED (IDENTICAL)** |
| **POC-07** | Pemeriksaan Kredensial Firebase | Deteksi mismatch package `com.bhumiamartya.app.qa` pada `google-services.json` | **VERIFIED (MISMATCH CONFIRMED)** |
| **POC-08** | Blokir Build APK Ilegal | Pembatalan kompilasi biner tanpa sertifikat & konfigurasi Google Services sah | **VERIFIED (BLOCKED AS INTENDED)** |
| **POC-09** | Validasi Integritas Hash Biner Eksisting | Hash SHA-256 dan byte size biner rilis historis diverifikasi ulang | **VERIFIED (PASS)** |
| **POC-10** | Penegakan Gerbang Emulator | Larangan eksekusi emulator tanpa perangkat aktif & fresh APK sah | **VERIFIED (NOT RUN)** |

Statistik Artefak Ekspor Statis:
- **Total Rute:** 71 rute web (termasuk `/`, `/login`, `/setup`, `/dashboard`, `/blueprint/human-design`, `/premium-bhumi`, `/settings`).
- **Total File Artefak `out/`:** 872 file.
- **Alias RSC:** 111 file routing offline.
- **Temuan Kebocoran Server:** 0 file kredensial atau private key di bundel klien.

---

## 3. Usulan Perintah Perakitan yang Dapat Direproduksi (Proposed Reproducible Build Commands)

Untuk menjamin reproduktibilitas tanpa mengorbankan integritas rute server, dirancang arsitektur perakitan terpisah antara target Web dan target Android Mobile:

### A. Perbandingan Target
- **Target Web (Vercel / Node.js Runtime):**
  - Mengompilasi seluruh rute termasuk Route Handlers di `app/api/**`.
  - Mempertahankan semantik HTTP 410 Gone pada endpoint warisan yang dinonaktifkan (`/api/humandesign/bodygraph`).
  - Tidak menggunakan `output: 'export'`.
- **Target Android Mobile (Capacitor Native APK):**
  - Mengharuskan `output: 'export'` untuk menghasilkan bundel aset murni ke dalam direktori WebView `android/app/src/main/assets/public/`.
  - Mengecualikan `app/api/**` saat build mobile berlangsung karena WebView Android tidak menjalankan server Node.js internal.

### B. Arsitektur Perakitan: Disposable Staging vs Build-time Exclusion
1. **Opsi Rekomendasi (Disposable Staging Directory):**
   - Skrip perakitan menyalin pohon kode sumber ke direktori sementara di luar repositori (misalnya `%TEMP%\bhumi-mobile-build`).
   - Direktori `app/api` dihapus secara deterministik dari direktori staging.
   - Perintah build dijalankan di direktori staging, lalu artefak `out/` disalin ke `android/app/src/main/assets/public/`.
   - **Keunggulan:** Repositori kerja (`working tree`) utama 100% terlindungi dari mutasi, tidak ada risiko commit rute yang terhapus secara tidak sengaja.
2. **Opsi Alternatif (Build-time Route Exclusion via next.config.ts):**
   - Menggunakan konfigurasi dinamis atau plugin Webpack IgnorePlugin untuk melewati pemrosesan rute API saat variabel lingkungan `TARGET_PLATFORM=mobile` terdeteksi.
   - **Kelemahan:** Membutuhkan modifikasi pada `next.config.ts` utama yang saat ini termasuk dalam 58 file terlindungi.

### C. Alur Perintah Perakitan Terstruktur (Deterministic Pipeline)
```powershell
# 1. Persiapan Lingkungan & Sanitasi
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NODE_ENV = "production"

# 2. Pembuatan Direktori Staging Sementara
$stagingDir = "$env:TEMP\bhumi-staging-mobile"
New-Item -ItemType Directory -Force -Path $stagingDir
Robocopy . $stagingDir /E /XD .git .next out node_modules app\api android\app\build

# 3. Penyambungan Modul (NTFS Directory Junction)
cmd /c mklink /J "$stagingDir\node_modules" "$PWD\node_modules"

# 4. Ekspor Statis & Penyalinan RSC
Set-Location -LiteralPath $stagingDir
node node_modules/next/dist/bin/next build --webpack
node scripts/fix-next-static-rsc-paths.mjs

# 5. Sinkronisasi Aset ke Android
node node_modules/@capacitor/cli/bin/capacitor sync android --dest "..\android"
```

---

## 4. Paritas Web/Mobile dan Regresi (Web/Mobile Parity & Regression)

### A. Preservasi Semantik Web HTTP 410
Rute `app/api/humandesign/bodygraph/route.ts` dirancang secara sengaja untuk mengembalikan response `410 Gone` bagi klien web lama yang belum bermigrasi. Memaksa penambahan anotasi `export const dynamic = "force-static"` pada rute ini demi meloloskan build statis akan merusak semantik respons HTTP 410 pada runtime server web Vercel. Oleh karena itu, pengecualian rute server pada tahap staging mobile adalah satu-satunya metode yang menjamin *zero regression* pada platform Web.

### B. Mekanisme Akses Mobile ke Remote HTTPS APIs
Aplikasi mobile Capacitor berjalan pada WebView dengan origin lokal (`https://localhost`). WebView tidak dapat mengeksekusi Route Handler internal. Oleh karena itu, seluruh permintaan komputasi backend diarahkan ke endpoint HTTPS publik Vercel melalui pustaka resolver URL tersentralisasi:
- `lib/config/hdApiUrl.ts` -> fungsi `getHdApiUrl()`
- `lib/config/astrologyApiUrl.ts` -> fungsi `getAstrologyApiUrl()`
- `lib/config/dailyGuidanceApiUrl.ts` -> fungsi `getDailyGuidanceApiUrl()`

Ketiga fungsi ini mendeteksi runtime via `Capacitor.isNativePlatform()`. Jika berjalan di dalam APK Android, URL dasar secara otomatis beralih dari rute relatif lokal (`/api/...`) ke URL HTTPS absolut (`https://bhumi-amartya-clean.vercel.app/api/...` atau variabel lingkungan `NEXT_PUBLIC_WEB_APP_URL`).

### C. Temuan Dependensi Fetch Klien Lokal (Gaps)
Audit kode mendeteksi adanya dua komponen klien yang masih menggunakan pemanggilan fetch relatif tanpa melewati fungsi resolver URL:
1. `app/kenali-diri/aura/page.tsx:243` -> `fetch("/api/kenali-diri/aura/")`
2. `lib/environment/weatherApiClient.ts:125` -> `fetch("/api/environment/weather-aqi")`

*Dampak:* Pada browser web, pemanggilan ini berfungsi normal. Namun pada WebView Android Capacitor, pemanggilan relatif akan diarahkan ke `https://localhost/api/...` yang tidak memiliki server penangan, sehingga menghasilkan galat `404 Not Found` atau kegagalan jaringan. Celah ini harus distandarisasi menggunakan fungsi resolver URL absolut sebelum rilis produksi.

---

## 5. Inspeksi Keamanan Bundel Output (Output Bundle Security Inspection)

Pemeriksaan keamanan otomatis dijalankan terhadap seluruh 872 file statis di dalam direktori `out/` hasil ekspor POC:
- **Metode Audit:** Pemindaian konten berbasis Regular Expression terhadap pola kunci privat RSA/EC, token otentikasi rahasia, kredensial service account, dan variabel rahasia internal.
- **Daftar Pola Uji:**
  - `-----BEGIN PRIVATE KEY-----` / `-----BEGIN RSA PRIVATE KEY-----`
  - `PLAY_REPORTS_PRIVATE_KEY` / `GOOGLE_PLAY_PRIVATE_KEY`
  - `FIREBASE_PRIVATE_KEY` / `FIREBASE_ADMIN_CERT`
  - `CRON_SECRET` / `jwtSecret` / `SERVICE_ACCOUNT_KEY`
- **Hasil Audit:** **0 TEMUAN / 0 TEMBUSAN KREDENSIAL**.
- **Kesimpulan:** Seluruh kode yang dibundel ke dalam aset statis mobile bebas dari rahasia server maupun kunci enkripsi privat.

---

## 6. Perbandingan Opsi Firebase QA (Firebase QA Options Comparison)

Konfigurasi build Android debug pada `android/app/build.gradle` menyertakan akhiran `applicationIdSuffix ".qa"`, sehingga menghasilkan Application ID `com.bhumiamartya.app.qa`. Dua opsi arsitektur dievaluasi untuk mengakomodasi konfigurasi ini:

| Parameter Evaluasi | Opsi 1: Project Firebase QA Terpisah (Terisolasi) | Opsi 2: Client Android Tambahan di Project Eksisting |
|---|---|---|
| **Isolasi Database (Firestore)** | **Mutlak Terpisah:** Database Firestore terpisah total. Nol risiko polusi data produksi. | **Bercampur:** Data QA masuk ke instance Firestore yang sama dengan user riil (hanya dibedakan path/rules). |
| **Isolasi Pengguna (Auth)** | Akun pengujian QA tidak pernah tercatat di Firebase Auth produksi. | User QA dan user riil berada dalam satu user pool produksi. |
| **Konfigurasi OAuth (Google Sign-In)** | OAuth Client ID terpisah; aman menggunakan SHA-1 debug keystore mesin lokal mana pun. | OAuth Client ID debug didaftarkan pada project produksi; memperluas *attack surface*. |
| **Penempatan `google-services.json`** | Diletakkan di `android/app/src/debug/google-services.json`. Otomatis dipakai saat `assembleDebug`. | Diletakkan di `android/app/src/debug/google-services.json` (berisi client ID qa). |
| **Sertifikat SHA-1 / SHA-256** | Menggunakan SHA-1 dari `~/.android/debug.keystore` pengembang lokal. | Menggunakan SHA-1 dari `~/.android/debug.keystore` pengembang lokal. |
| **Risiko Polusi Data Produksi** | **0% (Nol Risiko):** Data pengujian tidak memiliki akses ke database produksi. | **Tinggi:** Kesalahan logic rules dapat mencemari collection user produksi. |
| **Kemudahan Rollback** | Sangat mudah: Project QA dapat dihapus atau di-reset kapan saja tanpa dampak. | Rumit: Pembersihan data uji harus dilakukan via script query manual. |
| **Beban Pemeliharaan** | Memerlukan sinkronisasi manual struktur indeks Firestore dan Cloud Functions. | Struktur backend otomatis identik dengan produksi. |
| **Rekomendasi Arsitektural** | **SANGAT DIREKOMENDASIKAN (STRONGLY RECOMMENDED)** | **TIDAK DIREKOMENDASIKAN UNTUK PENGUJIAN OTENTIK** |

**Justifikasi Rekomendasi:**
Opsi 1 memberikan garansi keamanan tertinggi. Sesuai prinsip *Fail-Closed* dan *Production Isolation*, lingkungan QA tidak boleh memiliki jalur baca maupun tulis ke database pengguna produksi.

---

## 7. Daftar Periksa Konfigurasi Founder (Founder Configuration Checklist)

Untuk membuka blokir build Android debug, Founder perlu menyediakan file konfigurasi resmi dari Google Firebase Console dengan spesifikasi berikut:

1. **Package Name / Application ID Tepat:**
   - `com.bhumiamartya.app.qa`
2. **Ekstraksi Sidik Jari Debug Keystore (SHA-1 & SHA-256):**
   Founder atau pengembang mengeksekusi perintah berikut pada terminal lokal untuk mendapatkan fingerprint sertifikat debug:
   ```powershell
   keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
   ```
3. **Pendaftaran di Firebase Console:**
   - Daftarkan Android App baru dengan package `com.bhumiamartya.app.qa`.
   - Masukkan sidik jari SHA-1 dan SHA-256 hasil langkah 2.
   - Unduh file `google-services.json`.
4. **Penempatan File Konfigurasi yang Sah:**
   - Tempatkan file hasil unduhan pada direktori:
     `android/app/src/debug/google-services.json`
   - *Catatan:* File produksi di `android/app/google-services.json` (`com.bhumiamartya.app`) tidak boleh ditimpa. Gradle secara otomatis memprioritaskan varian `src/debug/` saat menjalankan build debug.
5. **Pemisahan Konfigurasi Publik vs Kredensial Privat:**
   - `google-services.json` adalah file konfigurasi identitas klien publik (berisi Project ID, App ID, API Key publik).
   - `google-services.json` **BUKAN** Service Account Key dan tidak boleh memuat `private_key` server.

---

## 8. Status Perakitan APK Aktual (Actual APK Build Status)

- **Status Kompilasi:** **BLOCKED BY FIREBASE QA CONFIGURATION**.
- **Integritas Tata Kelola:**
  - Sesuai protokol keselamatan, agen dilarang membuat konfigurasi palsu (*fake/mock json*) atau mengubah package name tanpa registrasi sah di Google Console.
  - Kompilasi `gradlew assembleDebug` ditahan hingga file konfigurasi `android/app/src/debug/google-services.json` resmi disediakan oleh Founder.
  - Penahanan ini mencegah rusaknya integritas build cache dan memastikan setiap biner yang dihasilkan dapat divalidasi terhadap backend QA yang sah.

---

## 9. Status Emulator (Emulator Status)

- **Status Eksekusi:** **EMULATOR NOT RUN**.
- **Hasil Audit Perangkat:**
  - Perintah `adb devices` menunjukkan daftar kosong (0 perangkat fisik atau AVD aktif).
- **Gerbang Prasyarat Eksekusi Emulator (Emulator Acceptance Gates):**
  1. *Gate 1:* Penyerahan dan penempatan file `google-services.json` resmi untuk `.qa`.
  2. *Gate 2:* Keberhasilan kompilasi `assembleDebug` menghasilkan APK debug yang valid.
  3. *Gate 3:* Penyediaan emulator Android aktif (AVD API Level 33/34/35) dengan status `device ready`.
- **Kepatuhan Terhadap Klaim:** Tanpa pemenuhan ketiga gerbang di atas, agen menyatakan pengujian emulator **TIDAK DIJALANKAN (NOT RUN)**. Klaim simulasi atau kelulusan fiktif dilarang keras.

---

## 10. Risiko Terbuka Native Billing (Native Billing Open Risks)

Hasil audit mendalam terhadap implementasi penagihan Google Play pada kode sumber Java (`BhumiBillingPlugin.java`) dan lapisan klien (`lib/billing/googlePlayBilling.ts`):

| ID Risiko | Aspek Kontrak Billing | Status Aktual di Kode Sumber | Klasifikasi & Mitigasi |
|---|---|---|---|
| **NAT-01** | Obfuscated Account ID Binding | **ABSENT.** `BhumiBillingPlugin.java:231` tidak memanggil `setObfuscatedAccountId()`. UID pengguna tidak terikat ke transaksi Play Store di level native. | **GAP DOKUMENTASI / SOURCE DEFECT.** Perlu penambahan binding UID sebelum peluncuran alur beli. |
| **NAT-02** | Kepemilikan Server & Transaksi Firestore | **SERVER-BOUND.** Plugin native tidak mengeksekusi `acknowledgePurchase()`. Acknowledgement dan mutasi hak akses 100% dikendalikan oleh backend verifier. | **PASS KONTRAK.** Arsitektur aman dari manipulasi klien. |
| **NAT-03** | Respon Payload Pembelian | **IGNORED / PARSED.** Seluruh properti kritis (`orderId`, `purchaseToken`, `packageName`, `purchaseTime`) diekstraksi dan dipetakan secara akurat. | **PASS KONTRAK.** Struktur data lengkap. |
| **NAT-04** | Base Plan Offer Fallback | **UNSAFE FALLBACK.** Metode `findMonthlyOfferToken` mencari paket 'monthly'. Jika tidak ditemukan, otomatis mengambil `offers.get(0)`. | **RISIKO ARSITEKTURAL.** Berpotensi salah memilih plan tahunan jika struktur offer di Play Console berubah. Wajib fail-closed. |
| **NAT-05** | Penanganan `ITEM_ALREADY_OWNED` | **PARTIAL GAP.** Event listener `onPurchasesUpdated` menangani respons 7 via `fetchOwnedPurchasesWithRetry`. Namun pemanggilan awal `launchBillingFlow` melempar galat langsung tanpa pemulihan otomatis. | **PARTIAL.** Klien harus menangani reject awal dan memicu sinkronisasi riwayat pembelian. |
| **NAT-06** | Penanganan Transaksi Ganda | **GUARDED.** Klien TypeScript mengimplementasikan deduplikasi transaksional via `activeRecoveryPromise` dan nomor generasi listener. | **PASS KONTRAK.** Mencegah verifikasi berulang untuk token yang sama. |
| **NAT-07** | Siklus Hidup & Rekoneksi | **TRANSIENT RESILIENCE.** Plugin mendeteksi diskoneksi via `onBillingServiceDisconnected` dan mengirim event ke antarmuka klien untuk rekoneksi otomatis. | **PASS KONTRAK.** Ketahanan siklus hidup terjamin. |
| **NAT-08** | Validasi Tanda Tangan Pembelian | **CONSISTENT SIGNATURES.** Tanda tangan kriptografis mentah dari Google Play diteruskan secara utuh ke backend verifier via HTTPS. | **PASS KONTRAK.** Verifikasi tanda tangan server-side valid. |
| **NAT-09** | Keamanan Pencatatan Log (Logcat) | **ZERO LOGCAT LEAK.** Tidak ada pencatatan token mentah, kunci privat, atau data identitas sensitif pada `Log.d` / `Log.e`. | **PASS KONTRAK.** Memenuhi standar privasi Google Play. |
| **NAT-10** | Durabilitas Deferred Acknowledgement | **STRICTLY SERVER-OWNED.** Penundaan pengakuan dikelola secara persisten melalui tabel basis data antrean sinkronisasi di backend verifier. | **PASS KONTRAK.** Mencegah pembatalan sepihak (refund 3 hari) oleh Google Play. |

---

## 11. Gerbang Mutu (Quality Gates)

| Gerbang Mutu (Quality Gate) | Status Evaluasi | Justifikasi Teknis |
|---|---|---|
| **1. Static Export** | **PASS POC** | Berhasil 100% di staging terisolasi (71 rute, 872 file, exit code 0). |
| **2. Native Contract** | **SOURCE AUDITED / PARTIAL** | Audit NAT-01 s/d NAT-10 selesai; 2 gap arsitektural teridentifikasi pada Java plugin. |
| **3. Build Integration** | **READY FOR APPROVAL** | Skrip build staging terisolasi siap diadopsi setelah persetujuan Founder. |
| **4. Firebase QA** | **BLOCKED PENDING FOUNDER** | Menunggu penyediaan `google-services.json` resmi untuk `com.bhumiamartya.app.qa`. |
| **5. APK Compilation** | **BLOCKED** | Kompilasi ditahan sampai konfigurasi Firebase QA sah terpasang. |
| **6. Emulator Validation** | **NOT RUN** | Perangkat tidak terdeteksi; gerbang APK belum terpenuhi. |

---

## 12. Kondisi Repositori Git Sebelum dan Sesudah (Working Tree Before/After)

- **Status Cabang (Branch):** `hotfix/build110-indonesian-only`
- **Commit Baseline (HEAD):** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`
- **File Termodifikasi Terlacak (Tracked Modified):** 58 file (seluruhnya dipertahankan tanpa perubahan, 0 reverted).
- **File Staged:** 0 file.
- **File Untracked Sebelum Sesi:** 77 file.
- **File Untracked Sesudah Sesi:** 78 file (penambahan 1 file laporan ini: `BHUMI_BILL-05A.3_MOBILE_BUILD_FIREBASE_QA_REPORT.md`).
- **Mutasi Git:** **NOL (0 commit, 0 push, 0 reset, 0 checkout, 0 stash)**.

---

## 13. Daftar File yang Berubah (Files Changed)

- **File Terlacak Repositori Utama:** **0 FILE BERUBAH** (Working tree utama tidak tersentuh).
- **File Dokumentasi Baru Ditambahkan:**
  - `C:\tmp\bhumi-build106-recovery\BHUMI_BILL-05A.3_MOBILE_BUILD_FIREBASE_QA_REPORT.md` (Dokumen laporan ini).

---

## 14. Bukti Jalur Artefak (Evidence Paths)

1. **Laporan POC Sebelumnya:**
   - `C:\tmp\bhumi-build106-recovery\BHUMI_BILL-05A.2_ISOLATED_ANDROID_BUILD_POC_REPORT.md`
2. **Direktori Staging & Hasil Ekspor Statis POC:**
   - `C:\Users\shein\AppData\Local\Temp\opencode\bill05a2-mobile-1792555494502\out\` (872 file statis, 71 rute)
   - `C:\Users\shein\AppData\Local\Temp\opencode\bill05a2-mobile-1792555494502\STAGING_COPY_MANIFEST.json`
3. **Log Rekonsiliasi & Pemeriksaan Regresi Lokal:**
   - `C:\tmp\bhumi-build106-recovery\tests\unit\build110-indonesian-only-production.test.ts` (157 assertions PASS)
   - `C:\tmp\bhumi-build106-recovery\tests\unit\build107-production-surface-guard.test.ts` (136 assertions PASS)
   - `C:\tmp\bhumi-build106-recovery\services\billing-verifier\tests\unit\` (127 unit checks PASS)

---

## 15. Persetujuan Tertunda yang Diperlukan (Outstanding Approvals)

Sebelum melanjutkan ke tahap eksekusi biner aktif, dibutuhkan persetujuan tertulis dari Founder untuk:
1. **Adopsi Skrip Perakitan Reproduksibel:**
   Persetujuan penggunaan skrip build berbasis *disposable staging tree* yang mengecualikan `app/api/**` khusus untuk target mobile.
2. **Pemilihan Opsi Proyek Firebase QA:**
   Keputusan resmi Founder untuk menggunakan Opsi 1 (Project Firebase QA mandiri terpisah) beserta registrasi package `com.bhumiamartya.app.qa` dan penyediaan file `google-services.json`.

---

## 16. Status Register Risiko RSK-22 dan RSK-23 (RSK-22 / RSK-23 Status)

| ID Risiko | Deskripsi Risiko | Status Saat Ini | Jalur Penyelesaian Menuju Penutupan (Closure Path) |
|---|---|---|---|
| **RSK-22** | Hambatan Ekspor Statis Next.js akibat Route Handlers serverless | **OPEN (POC VERIFIED)** | Ditutup resmi segera setelah skrip perakitan staging mobile terintegrasi ke dalam pipeline repositori utama atas persetujuan Founder. |
| **RSK-23** | Mismatch Identitas Paket Firebase Android Debug (`.qa`) | **OPEN (AWAITING CONFIG)** | Ditutup resmi setelah Founder menempatkan file `google-services.json` sah di `android/app/src/debug/`. |

Kedua risiko tercatat transparan dan memiliki jalur mitigasi deterministik tanpa kompromi keamanan.

---

## 17. Rekomendasi Eksekusi Terkendali Berikutnya (Next Controlled Execution Recommendation)

Direkomendasikan pelaksanaan **Sprint BILL-05A.4** dengan protokol langkah terkendali:

1. **Langkah 1 (Founder Provisioning):**
   Founder membuat project Firebase QA terpisah, mendaftarkan package `com.bhumiamartya.app.qa` dengan SHA-1 debug lokal, mengunduh `google-services.json`, dan meletakkannya pada direktori `android/app/src/debug/google-services.json`.
2. **Langkah 2 (Isolated Workspace Preparation):**
   Mempersiapkan workspace build terisolasi di direktori sementara dengan mengadopsi skrip *disposable staging*.
3. **Langkah 3 (Assemble Debug APK):**
   Mengeksekusi perintah Gradle debug di lingkungan terisolasi:
   ```powershell
   ./gradlew assembleDebug --no-daemon
   ```
4. **Langkah 4 (Emulator Acceptance Validation):**
   Menjalankan AVD Android emulator lokal, memasang APK debug yang dihasilkan (`adb install -r app-debug.apk`), dan memvalidasi alur autentikasi Firebase QA serta antarmuka penagihan.

---

**STATUS AKHIR:** **LOCAL POC COMPLETED / APK BUILD BLOCKED PENDING FOUNDER FIREBASE CONFIG**  
**STOP AND WAIT FOR FOUNDER REVIEW**
