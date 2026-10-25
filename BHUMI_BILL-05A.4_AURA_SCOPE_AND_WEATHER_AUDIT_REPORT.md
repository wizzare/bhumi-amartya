# LAPORAN AUDIT CAKUPAN AURA DAN INTEGRASI CUACA-AQI (BILL-05A.4)
**Dokumen Otoritatif Tata Kelola & Batas Cakupan Aplikasi Bhumi Amartya**  
**Klasifikasi:** Governance & Architecture Audit Report  
**Tanggal:** 21 Oktober 2026  
**Status:** Canonical Audit Baseline  

---

## 1. Ringkasan Eksekutif (Executive Summary)

Berdasarkan arahan eksplisit Founder (*Founder Scope Clarification*) pada Sprint BILL-05A.4, laporan ini mendokumentasikan hasil audit mendalam terhadap batasan cakupan fitur **Aura (Kenali Diri)** dan sistem integrasi **Cuaca-AQI (Weather-AQI)** pada arsitektur hybrid web-mobile Bhumi Amartya.

### Temuan Utama & Keputusan Founder:
1. **Keputusan Resmi Founder Terkait Aura:**
   Route `/api/kenali-diri/aura/` dan halaman pasangannya `app/kenali-diri/aura/page.tsx` secara resmi diklasifikasikan sebagai **WEB ONLY**. Fitur Aura bukan merupakan bagian dari target aplikasi Android Bhumi (*Out of Android Scope*).
2. **Hasil Audit Navigasi & Permukaan Mobile:**
   Pemeriksaan ketat terhadap pohon navigasi utama aplikasi mobile (`components/navigation/AppNav.tsx`), kartu rangkuman dashboard (`components/dashboard/*`), serta seluruh navigasi rute Android membuktikan bahwa **tidak ada tautan navigasi aktif maupun kartu antarmuka yang mengarah ke `/kenali-diri/aura`**.
3. **Uji Kebocoran Cakupan (Scope Leak Check):**
   Dikonfirmasi **TIDAK ADA KEBOCORAN CAKUPAN AKTIF (NO ACTIVE SCOPE LEAK)** ke dalam runtime mobile Capacitor Android.
4. **Hasil Audit Weather-AQI:**
   Endpoint `/api/environment/weather-aqi` dipanggil secara asinkron oleh:
   - `components/dashboard/DashboardClient.tsx` (background GPS fetch baris 258–268 saat geolokasi aktif).
   - `app/dashboard/environment/page.tsx` (detail environment baris 123–164).
   - **Mekanisme Graceful Failure:** Kedua pemanggil telah dilengkapi mekanisme penanganan kegagalan anggun (*graceful failure*). Jika backend proxy cuaca tidak dapat dijangkau atau mengembalikan kesalahan (misalnya saat berjalan pada web statis tanpa server lokal), sistem menandai status `providerDegraded = true` atau `setWeatherAqi(null)` tanpa memecahkan (*breaking*) antarmuka pengguna (UI).
   - **Kebutuhan Paritas Fitur Mobile:** Agar aplikasi Android native dapat menikmati pembacaan cuaca/AQI secara langsung di masa depan, pemanggilan klien memerlukan resolusi URL absolut HTTPS remote (sejalan dengan pola arsitektur `getHdApiUrl()` pada `lib/config/hdApiUrl.ts`).

---

## 2. Investigasi Mendalam Fitur Aura (Detailed Aura Investigation)

### 2.1 Lokasi File, Baris Kode, dan Konsumen
* **Implementasi Halaman Web:**  
  `app/kenali-diri/aura/page.tsx` (Line 243)
  ```typescript
  // app/kenali-diri/aura/page.tsx:243
  const response = await fetch("/api/kenali-diri/aura/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  ```
* **Implementasi Route Handler Serverless:**  
  `app/api/kenali-diri/aura/route.ts` (Next.js App Router POST handler yang memerlukan inisialisasi environment server Firebase Admin / Firestore).
* **Konsumen Antarmuka (Consumers):**  
  Tidak ada konsumen di luar halaman `app/kenali-diri/aura/page.tsx` itu sendiri. `AppNav.tsx` hanya memuat rute navigasi:
  - Utama: `/dashboard`, `/profile`, `/wellness`, `/journey`
  - Utilitas: `/settings`, `/inbox`, `/premium-bhumi`
  Tidak ada satu pun tombol atau tautan navigasi mobile yang mengekspos fitur Aura kepada pengguna Android.

### 2.2 Preservasi Web-Only & Isolasi Ekspor Statis
* **Alasan Preservasi Web:**  
  Fitur Aura tetap dipertahankan utuh untuk penyebaran Vercel/Web hosting karena memiliki basis logika penilaian energi mandiri dan pengujian unit (`tests/unit/build108-sprint06-wellness-healing-innerwork.test.ts`).
* **Mengapa Ekspor Statis Aman Mengecualikannya:**  
  Mode ekspor statis Next.js (`output: 'export'`) pada platform Capacitor Android memerlukan bundle murni HTML/JS/CSS client-side. Dalam perakitan mobile staging terisolasi (*disposable mobile staging tree*), rute serverless `app/api/kenali-diri/aura` dan halaman statisnya dieksklusikan dari target build APK tanpa memengaruhi atau memodifikasi file sumber asli di cabang repositori web.

---

## 3. Investigasi Mendalam Cuaca-AQI (Detailed Weather-AQI Investigation)

### 3.1 Lokasi File, Baris Kode, dan Arsitektur Server Proxy
* **Klien Konsumen:**
  1. `components/dashboard/DashboardClient.tsx:261`:
     Memanggil `getCachedWeatherAqi(pos.coords.latitude, pos.coords.longitude)` secara *fire-and-forget* di latar belakang setelah otorisasi GPS.
  2. `app/dashboard/environment/page.tsx:124`:
     Memanggil `getCachedWeatherAqi` untuk mengisi metrik cuaca dan kualitas udara pada dashboard lingkungan.
* **Modul Klien:**  
  `lib/environment/weatherApiClient.ts:125`:
  ```typescript
  // lib/environment/weatherApiClient.ts:125
  const response = await fetch("/api/environment/weather-aqi", {
    method: "POST",
    headers,
    body: JSON.stringify({ latitude: lat, longitude: lon }),
    cache: "no-store",
  }).catch((): Response | null => null);
  ```
* **Server Proxy Route Handler:**  
  `app/api/environment/weather-aqi/route.ts`:
  - Bertindak sebagai reverse proxy terproteksi ke layanan WeatherAPI.com upstream.
  - Memverifikasi Firebase Auth Bearer token pengguna (`verifyIdToken`).
  - Mengelola *in-memory geo-bucket cache* (radius resolusi koordinat) berdurasi 30 menit.
  - Mengisolasi API key upstream dari kebocoran ke bundle sisi klien (*zero secret exposure*).

### 3.2 Analisis Mekanisme Graceful Failure
* Jika panggilan klien `fetch("/api/environment/weather-aqi")` gagal (misalnya karena HTTP 404 pada bundle statis Android Capacitor atau saat offline), klien mengembalikan:
  `{ status: "error", providerStatus: "retriable_error" }`.
* Pada `DashboardClient.tsx`: Gagal secara hening (`catch(() => null)`), state cuaca tetap `null`, widget kartu cuaca tidak ditampilkan tanpa memicu *crash* aplikasi.
* Pada `app/dashboard/environment/page.tsx`: Menandai `setProviderDegraded(true)`. Metrik USGS (gempa), NOAA (badai geomagnetik), serta fase bulan tetap berjalan mandiri tanpa terganggu oleh degradasi penyedia cuaca.

### 3.3 Status Mobile vs Web & Pola Resolusi URL Masa Depan
* **Status Web:** Berjalan penuh melalui Vercel serverless proxy selama `WEATHERAPI_KEY` terkonfigurasi.
* **Status Mobile Saat Ini:** Mengalami degradasi anggun (*gracefully degraded*) di dalam shell APK statis karena relative URL `/api/environment/weather-aqi` tidak ada di localhost internal perangkat.
* **Rekomendasi Paritas Mobile:** Jika paritas fitur cuaca penuh dibutuhkan pada Android, arsitektur pemanggilan di `lib/environment/weatherApiClient.ts` harus mengadopsi pola helper URL terpusat seperti `getHdApiUrl()` pada `lib/config/hdApiUrl.ts`:
  - Native Capacitor mendeteksi runtime via `Capacitor.isNativePlatform()`.
  - Mengarahkan request ke domain HTTPS absolut Vercel publik (`https://<domain>/api/environment/weather-aqi`) dengan Bearer token yang valid.

---

## 4. Pembaruan Status Risiko RSK-22 (Update to RSK-22)

### 4.1 Klarifikasi Dampak Terhadap Android Build
* **Bukan Blocker Aplikasi Android:**  
  Investigasi ini menegaskan secara definitif bahwa:
  1. Route Human Design (`/api/humandesign/bodygraph` yang berstatus HTTP 410).
  2. Route Serverless Aura (`/api/kenali-diri/aura`).
  **BUKAN MERUPAKAN PENGHAMBAT (NON-BLOCKER) BAGI APLIKASI ANDROID BHUMI.**
* **Mekanisme Isolasi Ekspor:**  
  Kompilasi web statis untuk Capacitor (`next build` dengan `output: 'export'`) dijalankan di atas staging build terisolasi. Kedua endpoint server-only tersebut diabaikan secara bersih dari artefak build mobile, sementara deployment web produksi tetap mempertahankan route handlers tersebut tanpa perubahan.
* **Status Register RSK-22:**  
  Kategori risiko diturunkan dari *Active Blocker* menjadi **RESOLVED VIA ISOLATED STAGING EXPORT ARCHITECTURE** (menunggu integrasi skrip formal ke repositori).

---

## 5. Dampak Terhadap Prioritas Sprint BILL-05A.4

Dengan selesainya klarifikasi cakupan Aura dan audit ketahanan cuaca, urutan prioritas sprint BILL-05A.4 ditetapkan sebagai berikut:

| Prioritas | Tugas Utama | Keterangan & Rincian Aksi |
| :--- | :--- | :--- |
| **Prioritas 1** | **Mobile Static Build Script Integration** | Mengintegrasikan skrip build staging Android terisolasi (`build:mobile`) ke repositori untuk mengotomatisasi ekspor statis tanpa menyentuh source code rute server web. |
| **Prioritas 2** | **Firebase QA Configuration from Founder** | Menunggu input konfigurasi kredensial `.qa` resmi (atau penyesuaian `applicationIdSuffix`) dari Founder guna menutup risiko RSK-23. |
| **Prioritas 3** | **AssembleDebug APK Build** | Menjalankan Gradle build `:app:assembleDebug` menggunakan toolchain lokal hingga menghasilkan file APK debug yang valid dan terverifikasi. |
| **Prioritas 4** | **Android Emulator Acceptance** | Menjalankan smoke test runtime pada Android Virtual Device (AVD) / emulator lokal untuk memverifikasi fungsionalitas visual, login flow, dan degradasi anggun. |

---

## 6. Batasan Operasional & Integritas Repositori (Boundaries)

Laporan dan investigasi ini diselesaikan dengan mematuhi batasan ketat tata kelola arsitektur Bhumi Amartya:
1. **Tidak Ada Modifikasi Algoritma Human Design:** Sumber daya `lib/humandesign/**` dan route terkait tidak disentuh sama sekali.
2. **Tidak Ada Modifikasi Kode Aura:** Sumber `app/kenali-diri/aura/**` dan API-nya tetap utuh untuk platform web.
3. **Tidak Ada Mutasi Produksi atau Firebase Console:** Tidak ada kredensial atau parameter cloud produksi yang dimutasi secara sepihak.
4. **Working Tree Tetap Bersih:** Repositori dipertahankan dalam kondisi stabil dan bersih tanpa modifikasi file pelacak selain dokumen audit resmi ini.

---
*Laporan ini disusun sebagai basis otoritas teknis resmi Sprint BILL-05A.4 Bhumi Amartya.*
