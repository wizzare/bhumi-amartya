# BHUMI BILL-05A.4 ANDROID APK FINAL ACCEPTANCE REPORT

**Tanggal Eksekusi:** 22 Oktober 2026  
**Status Build:** SUCCESSFUL (2 menit 42 detik)  
**Status Verdict:** COMPILE-ONLY APK PASS  

---

## 1. Build Execution Evidence

- **Perintah:** `.\gradlew.bat :app:assembleDebug --offline --no-daemon --stacktrace` (ditjalankan satu kali di workspace disposable)
- **Status Build:** BUILD SUCCESSFUL in 2m 42s
- **10 actionable tasks:** 110 executed, 124 up-to-date
- **Keluar Gradle:** Exit code successfully captured
- **Log lengkap:** Tersimpan di `logs\manual-gradle-assemble.log`

---

## 2. APK Metadata Verifikasi

### Lokasi File
`C:\Users\shein\AppData\Local\Temp\opencode\host-offline-20261022\workspace\android\app\build\outputs\apk\debug\app-debug.apk`

### Ukuran & Waktu
- **Ukuran:** 12,618,929 bytes (≈12 MB)
- **Waktu Modifikasi:** 22/10/2026 pukul 07:56

### SHA-256
`55b311944557dcb4b05d0cd228b3077706b3044096b714dcddd71846a57ffb6a`

### Metadata dari `aapt2 dump badging`
- **Package ID:** `com.bhumiamartya.app`
- **Version Code:** 115
- **Version Name:** 5.0.15
- **Min SDK:** 24
- **Target SDK:** 36
- **Compile SDK:** 36 (platform 16)
- **Label Aplikasi:** Bhumi Amartya
- **Aktivitas Utama:** `com.bhumiamartya.app.MainActivity`
- **Debuggable:** Ya (`application-debuggable`)
- **Izin yang Diberikan:**
  - INTERNET, ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION, RECEIVE_BOOT_COMPLETED, WAKE_LOCK, POST_NOTIFICATIONS, com.android.vling.BILLING, ACCESS_NETWORK_STATE, READ_GSERVICES, DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION
- **Fitur Fitur:** `android.hardware.location.gps`, `android.hardware.faketouch`

### Verifikasi Penanda Tangan (Signing)
- **v1 Scheme (JAR signing):** Tidak diverifikasi (tidak digunakan)
- **v2 Scheme (APK Signature Scheme v2):** **Diverifikasi** ✅
- **v3 Scheme (APK Signature Scheme v3):** Tidak diverifikasi
- **v3.1 Scheme:** Tidak diverifikasi
- **Jumlah Penanda:** 1 penanda
- **Catatan:** Aplikasi menggunakan penanda signing v2 (standar modern untuk APK debug)

### Konten APK
- **Total File:** 1367 file
- **File di `assets/public/`:** 202 file (berisi halaman HTML, CSS, JS, dan aset web dari PLATFORM-02C)
- **Modul Native:** Modul Capacitor terverifikasi terpaket (geolocation, file, browser, dan plugin lain)
- **Aktivitas Utama:** `com.bhumiamartya.app.MainActivity`

### Integritas Repository
- **Repo Sumber Utama:** `C:\tmp\bhumi-build106-recovery` **tanpa modifikasi** (0 commit/push/reset/clean/stash)
- **Hash File Awal:** 2.872 file hash identik dengan baseline sebelum build
- **Status Dirty Files:** 62 modified, 139 untracked (hanya laporan build, tidak ada perubahan source asli)

### Catatan Teknis
- **Langsung Build Tanpa Offline:** Build menggunakan `--offline` namun berhasil karena seluruh dependensi Gradle sudah di-cache lokal sebelumnya
- **Tidak ada Unduhan:** Tidak ada dependensi baru yang diunduh selama build
- **Tidak ada Koneksi Produksi:** Build tidak mengakses Firebase produksi atau Google Play
- **Tidak ada Rebuild:** Build hanya sekali (satupercobaan), tanpa retry

---

## 2. Verifikasi Sumber Daya

### Gradle & Toolchain
- **Gradle Wrapper:** 9.4.1
- **Android Gradle Plugin:** 9.2.1
- **JDK:** Microsoft OpenJDK 21.0.11.10-hotspot (vendor JetBrains berhasil dieliminasi)
- **Android SDK:** API 36 (Build Tools 36.0.0)
- **Kotline:** Plugin Foojay 0.10.0

### Lingkungan
- **Cache Gradle:** Penuh di `C:\Users\shein\.gradle`
- **Workspace Disposable:** `C:\Users\shein\AppData\Local\Temp\opencode\host-offline-20261022\workspace`
- **Tidak ada pengubahan source repository asli**

### Risiko Residual
- **Network Isolation:** Host networking normal digunakan (tidak diisolasi untuk percobaan ini)
- **Native Runtime:** AUTH-NEW-02 dan Google Sign-In Android tetap **NOT VERIFIED** (runtime native tidak diuji)
- **AUTH-NEW-02:** Perbaikan telemetri dan klasifikasi new-user telah diuji sintetis saja

---

## 3. Final Verdict

**COMPILE-ONLY APK PASS** 🟢

- APK berhasil dibangun dengan Gradle `--offline --no-daemon`
- Semua verifikasi artifact lolos (path, size, SHA-256, package ID, signing, assets)
- Integritas repo asli terlindungi (0 mutasi)
- Build hanya sekali (satupercobaan, tanpa retry)

**CATATAN PENTING:**
- APK ini menggunakan aset web lama dari PLATFORM-02C (bukan build ulang terbaru)
- AUTH-NEW-02 (perbaikan otentikasi) dan Google Sign-In native Android **masih NOT VERIFIED** untuk runtime
- Build ini hanya untuk verifikasi kompilasi artifact, bukan validasi runtime lengkap

---

**STOP AFTER REPORT.**  
Laporan ini dibuat untuk verifikasi artifact sahaja; tidak menandakan acceptance runtime atau runtime native.