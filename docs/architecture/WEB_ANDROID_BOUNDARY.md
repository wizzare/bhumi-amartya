# Batas Arsitektural Web dan Android (Web & Android Boundary)

Dokumen ini menetapkan aturan tata kelola permanen, batas build, kontrak ekspor staging sekali pakai (disposable staging export contract), pola akses API, serta 20 aturan penjaga platform otomatis (`PLAT-01` sampai `PLAT-20`) untuk Bhumi Amartya.

---

## 1. Aturan Tata Kelola Permanen (Permanent Governance Rules)

1. **Prinsip Sumber Tunggal (Single Source of Truth / SOT):**
   Repositori inti Next.js ini adalah satu-satunya basis kode kanonikal. Tidak diperkenankan membuat repositori aplikasi mobile terpisah yang menduplikasi logika bisnis. Target mobile Android dihasilkan melalui build artifact yang ditransformasikan secara deterministik.
2. **Kemandirian Runtime Mobile (Mobile Runtime Independence):**
   Aplikasi mobile yang dikemas dalam APK/AAB tidak boleh bergantung pada fitur server-side runtime Next.js (seperti Dynamic Server-Side Rendering (SSR) per-request atau Next.js Server Actions yang memerlukan server aktif) saat dijalankan di dalam WebView lokal offline. Rute halaman harus beroperasi sebagai Single Page Application (SPA) / Static Export yang berinteraksi dengan API remote melalui HTTPS.
3. **Pemisahan Jalur Pembayaran (Billing Channel Isolation):**
   Sesuai kebijakan Google Play Store, build Android DILARANG KERAS memicu, menampilkan, atau menautkan ke jalur pembayaran pihak ketiga (misalnya kartu kredit langsung, Stripe checkout web, transfer bank manual) yang mengabaikan Google Play In-App Billing untuk produk digital. Sebaliknya, aplikasi Web dilarang menginisialisasi pustaka Google Play Billing native.
4. **Isolasi Rute Internal / Konsol Admin:**
   Seluruh antarmuka admin, instrumen diagnostik internal, dan rute telemetri founder (`/admin/*`) adalah properti `WEB_ONLY`. Seluruh rute tersebut wajib dieliminasi secara total dari paket aset produksi Android (`dist/android` / `out/`).
5. **Kebijakan Bahasa Tunggal Bahasa Indonesia (Build 110+):**
   Sesuai ketetapan Build 110, seluruh antarmuka pengguna pada Web dan Android wajib menggunakan Bahasa Indonesia yang baku, elegan, dan menenangkan. Dilarang menyajikan UI dwibahasa atau string bahasa Inggris yang tidak terisolasi.

---

## 2. Batas Build dan Kontrak Ekspor Staging (Disposable Staging Export Contract)

Proses ekspor aplikasi mobile mengikuti siklus hidup penyiapan sementara (disposable staging):
1. **Penyusunan Lingkungan Staging (`.staging-export/`):**
   Sebelum sinkronisasi Capacitor (`npx cap sync`), proses build menjalankan skrip isolasi build. Direktori staging sementara dibuat secara lokal dan diabaikan oleh git (`.gitignore`).
2. **Pembersihan Rute Dikecualikan (Route Pruning):**
   Skrip ekspor mobile secara otomatis menghapus rute bertanda `WEB_ONLY` atau `LEGACY_UNVERIFIED`:
   - `app/admin/**`
   - `app/test-3d-poc/**`
   - Seluruh endpoint `app/api/**` (karena API dieksekusi di server cloud terpisah, bukan di dalam bundle APK).
3. **Penyesuaian `next.config.ts` untuk Ekspor:**
   Mode `output: 'export'` diaktifkan hanya selama ekspor mobile staging untuk menghasilkan artefak statis `out/`. Aset gambar dikonfigurasi dengan `images: { unoptimized: true }` untuk mencegah kegagalan runtime loader gambar lokal pada WebView.
4. **Validasi Sebelum Ekspor (Pre-Export Smoke Test):**
   Build dilarang dipindahkan ke folder Android `capacitor.config.ts:webDir` jika pengujian statis atau pemeriksaan TypeScript (`tsc --noEmit`) menghasilkan kode keluar (exit code) selain `0`.
5. **Sifat Sekali Pakai (Disposable):**
   Direktori staging dan direktori `out/` bersifat sekali pakai (ephemeral). Tidak ada perubahan kode manual yang boleh dilakukan di dalam `android/app/src/main/assets/public/` atau direktori sementara. Setiap modifikasi wajib berakar dari repositori inti.

---

## 3. Pola Akses API (API Access Patterns)

1. **Akses Universal Melalui Base URL Adaptif:**
   Klien mobile dan web menggunakan pustaka adapter jaringan terpadu (`lib/api/httpClient.ts` atau modul setara) yang mendeteksi runtime:
   - Pada Web: Request API relatif (`/api/...`) diarahkan ke domain yang sama.
   - Pada Android WebView: Request menggunakan FQDN kanonikal yang diamankan (`https://bhumi-amartya-api.domain/api/...` atau Cloud Run/Vercel Backend URL) karena origin WebView berupa `capacitor://localhost` atau `http://localhost`.
2. **Otentikasi Token JWT Firebase Terpadu:**
   Seluruh panggilan ke remote API yang dilindungi wajib menyertakan Authorization Bearer Token dari Firebase Auth (`getIdToken()`). Baik Web maupun Android menggunakan Firebase Auth SDK client yang menyegarkan token secara berkala.
3. **Ketahanan Offline dan Fallback Deterministik:**
   Untuk rute P0 kritis seperti Blueprint Human Design (`/blueprint/human-design`), apabila panggilan API remote gagal akibat jaringan terputus (offline):
   - Klien wajib membaca cache lokal terverifikasi (`IndexedDB` / `@capacitor/preferences`).
   - Jika cache belum ada, klien menjalankan engine perhitungan fallback deterministik lokal (`lib/humandesign/calculateHumanDesign.ts`) dengan status penanda bahwa data dihitung secara lokal.
4. **Idempotensi dan Keamanan Data:**
   Setiap transaksi penulisan mutasi (misalnya aktivasi keanggotaan atau klaim kupon) wajib menggunakan kunci idempotensi (`Idempotency-Key` atau `transactionId`) yang diverifikasi oleh backend `services/billing-verifier`.

---

## 4. Aturan Penjaga Platform Otomatis (Automated Platform Guard Rules: PLAT-01 s/d PLAT-20)

Pemeriksaan CI/CD dan linter otomatis wajib menegakkan 20 aturan penjaga platform ini sebelum penggabungan kode (merge) atau pembuatan rilis produksi:

- **PLAT-01: Admin Isolation in Mobile Bundle**
  Paket build mobile (`out/` atau `android/assets/public`) tidak boleh mengandung direktori atau file `admin`. Pemeriksaan build gagal jika terdeteksi `*/admin/*`.
- **PLAT-02: Native Billing Prohibition on Web**
  Modul `@capacitor-community/billing` atau pemanggilan `GooglePlayBilling` native tidak boleh dieksekusi di runtime web murni (`Capacitor.isNativePlatform() === false`). Pelanggaran melempar `PlatformConstraintViolation`.
- **PLAT-03: Web Paywall Webhook Prohibition in Mobile**
  Tautan langsung menuju checkout eksternal (Stripe, Midtrans web, dll.) dilarang dirender pada build Android ketika parameter runtime mendeteksi native application.
- **PLAT-04: Static Export Zero SSR Dependency**
  Seluruh halaman dalam kategori `SHARED` dan `APP_ONLY` wajib mendukung static export (`output: 'export'`). Dilarang memanggil `getServerSideProps` atau fungsi eksklusif server Next.js di dalam rute klien.
- **PLAT-05: Image Optimization Fail-Safe**
  Komponen `next/image` harus menggunakan konfigurasi unoptimized atau loader kustom saat diekspor ke aplikasi native agar tidak terjadi tautan gambar rusak pada WebView lokal.
- **PLAT-06: Absolute Remote API URL Resolution**
  Panggilan `fetch` di dalam runtime mobile wajib menyelesaikan URL absolut melalui environment configuration, bukan path relatif lokal `/api/...` yang menyebabkan error 404 pada protokol `capacitor://`.
- **PLAT-07: Offline Birth Data Security**
  Data kelahiran (tanggal, jam, koordinat) yang disimpan di storage lokal mobile wajib menggunakan penyimpanan aman `@capacitor/preferences` dan diverifikasi dengan checksum fingerprint SHA-256.
- **PLAT-08: Zero Production Hardcoded Secrets**
  Dilarang keras menyematkan kunci privat backend (misalnya Service Account JSON Google Play, Firebase Admin Secret, OpenAI Private Key) di dalam kode frontend web maupun mobile.
- **PLAT-09: Indonesian-Only Production Copy**
  Setiap string UI yang ditampilkan kepada pengguna pada rute produksi wajib mematuhi standar terjemahan Bahasa Indonesia Build 110. Tidak boleh ada string mock bahasa Inggris atau placeholder tak terverifikasi.
- **PLAT-10: Camera Permission Graceful Degradation**
  Fitur pemindaian aura (`/kenali-diri/aura`) wajib menangani penolakan izin kamera secara elegan di Web dan Android dengan panduan instruksi tanpa menyebabkan crash aplikasi.
- **PLAT-11: Audio Lifecycle Native Pause**
  Pemain audio penyembuhan (`/healing/audio`) wajib mendengarkan event lifecycle native (`pause`, `appStateChange`) agar audio terhenti atau berpindah ke latar belakang secara aman sesuai izin OS.
- **PLAT-12: Back Button Hardware Handling**
  Aplikasi Android wajib memiliki listener tombol kembali native (`App.addListener('backButton')`) yang terkoordinasi dengan router Next.js agar penekanan tombol tidak langsung menutup aplikasi secara tak terduga.
- **PLAT-13: Deep Linking Schema Verification**
  Skema URI deep link (`bhumi://` atau App Links `https://bhumi.amartya.app`) wajib terdaftar secara identik di `AndroidManifest.xml` dan memiliki fallback rute di Web.
- **PLAT-14: Experimental 3D POC Exclusion**
  Rute pengujian `app/test-3d-poc` wajib dieksklusikan dari rilis produksi Web dan Android sampai seluruh pengujian performa GPU dan WebGL lulus audit formal.
- **PLAT-15: Cloud Firestore Emulator Safety**
  Pengujian lokal dilarang menggunakan instance produksi Firestore. Skrip uji wajib menginisialisasi Firestore Emulator (`FIRESTORE_EMULATOR_HOST`) dan gagal tertutup (fail-closed) jika host tidak ditemukan.
- **PLAT-16: Idempotent Trial Bootstrap**
  Endpoint `app/api/access/bootstrap-trial/route.ts` wajib memvalidasi kepemilikan UID dan memastikan satu pengguna hanya dapat mengklaim satu kali masa percobaan 7-hari seumur hidup.
- **PLAT-17: Cross-Origin Resource Sharing (CORS) Policy**
  Backend API wajib membatasi CORS hanya untuk domain resmi web Bhumi Amartya dan origin lokal Capacitor (`capacitor://localhost`, `http://localhost`).
- **PLAT-18: Strict Type Safety on Boundaries**
  Seluruh kontrak transfer data (DTO) antara klien Web/Mobile dan layanan backend wajib divalidasi dengan runtime validator atau skema TypeScript ketat (`liveContract.ts`).
- **PLAT-19: Battery and Resource Throttling**
  Animasi visual kanvas langit (`components/celestial/*`) wajib menghentikan siklus requestAnimationFrame saat tab browser tidak aktif atau saat aplikasi mobile berada di latar belakang (background state).
- **PLAT-20: Founder Financial Metrics Lockdown**
  Endpoint metrik play store `app/api/founder/play-metrics/route.ts` wajib diproteksi dengan otentikasi ganda dan role-based access control (RBAC) ketat serta tidak boleh diakses oleh publik.
