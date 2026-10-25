# BHUMI_PLATFORM-02A: Laporan Kelayakan Ekstraksi Arsitektur & Analisis Repositori GitHub

**Status Governance**: PASS AUDIT  
**Tanggal Evaluasi**: 21 Oktober 2026  
**Penulis/Auditor**: Tim Arsitektur Platform Bhumi Amartya  
**Target Target Cabang Evaluasi**: `hotfix/build110-indonesian-only` (Local Worktree) vs `remotes/origin/main` (`wizzare/bhumi-amartya`)  

---

## 1. Ringkasan Eksekutif (Executive Summary)

Audit kelayakan ekstraksi arsitektur **BHUMI_PLATFORM-02A** dilakukan untuk memetakan dependensi, batas deployment (deployment boundaries), serta risiko pemisahan fungsionalitas antara aplikasi inti (Bhumi Core), halaman web khusus (Aura), utilitas administratif (`app/admin`), serta backend remote.

### Temuan Kunci:
1. **Divergensi Repositori Git**: Cabang `remotes/origin/main` pada repositori remote bukan merupakan upstream linier dari aplikasi Bhumi Amartya, melainkan repositori mandiri `bhumi-founder-dashboard v1.0.0` yang tidak memiliki commit ancestor bersama (*zero common ancestor*) dengan cabang `hotfix/build110-indonesian-only`.
2. **Karakteristik Kritis `app/page.tsx`**: Berkas `app/page.tsx` adalah **root entrypoint pengendali routing aplikasi** (autentikasi, onboarding/setup profil, sinkronisasi state, dan redirect ke dashboard). Berkas ini **BUKAN landing page marketing** dan **DILARANG KERAS DI-EKSTRAKSI** dari repositori aplikasi.
3. **Kesenjangan Kapabilitas Admin**: Rute `app/admin/activity` pada codebase aplikasi lokal berisi modul diagnostik mendalam sebesar **2.130 baris kode** (termasuk perbaikan data Human Design, audit token lifetime, verifikasi integritas Firestore, dan diagnostik autentikasi). Rute admin pada `origin/main` hanya berupa dasbor metrik ringkas. Modul admin lokal tidak boleh dihapus sebelum seluruh kapabilitas perbaikan dan diagnostik direplikasi ke dasbor eksternal.
4. **Isolasi Halaman Aura**: Halaman `/aura` berstatus *web-only*. Ditemukan tautan Play Store legacy ke ID `id.my.bhumiamartya`, yang berbeda dari ID paket Capacitor Android kanonikal `com.bhumiamartya.app`. Halaman ini harus diisolasi dari bundel aplikasi mobile Android tanpa merusak rute web.
5. **Status Cuaca & Kualitas Udara (Weather-AQI)**: Arsitektur rute cuaca berstatus `SHARED UI + REMOTE_BACKEND_SHARED` dengan prinsip *graceful degradation* (tetap menampilkan fallback aman saat service eksternal lambat atau mengalami gangguan).
6. **Diskrepansi Rute Bodygraph**: Commit baseline `e63f334c` memiliki rute proxy POST aktif. Namun pada status worktree lokal saat ini, rute tersebut telah dinonaktifkan secara aman menggunakan respons terminal HTTP 410 Gone (`GET/POST 410 decommissioned`), mengalihkan kalkulasi ke FastAPI service mandiri.
7. **Kesiapan Governance**: Berkas manifes PLATFORM-01 dan matriks pendukung telah terdokumentasi lengkap pada worktree lokal.
8. **Keputusan Akhir**: **PASS AUDIT**. Ekstraksi bertahap (Fase S1–S6) layak dijalankan dengan isolasi berbasis staging dan proteksi ketat tanpa mutasi sembarangan pada basis kode aktif.

---

## 2. Temuan Cabang GitHub & Analisis Silsilah Git (Git Lineage Findings)

Pemeriksaan referensi Git terhadap remote origin menghasilkan fakta arsitektur berikut:
- **Cabang Aktif Aplikasi**: `hotfix/build110-indonesian-only` (HEAD lokal pada branch pemulihan) memuat aplikasi lengkap Bhumi Amartya (Next.js 14, Capacitor Android, modul Human Design, Firestore rules, dan aset build 107–110).
- **Cabang `remotes/origin/main`**: Teridentifikasi sebagai proyek `bhumi-founder-dashboard` versi 1.0.0.
- **Topologi Commit**: Tidak terdapat simpul leluhur bersama (*no common ancestor* / *unrelated histories*). Cabang `origin/main` terbentuk dari inisialisasi terpisah atau riwayat force-push terisolasi yang didedikasikan untuk dasbor pemantauan pendiri.
- **Implikasi Arsitektural**: Tidak diperbolehkan melakukan `git merge`, `git rebase`, atau penyatuan paksa antara cabang aplikasi dengan `origin/main`. Keduanya harus dikelola sebagai target deployment yang independen secara fisik atau logis.

---

## 3. Analisis Rute Inti `app/page.tsx`: Larangan Ekstraksi

Terdapat asumsi keliru bahwa rute root (`app/page.tsx`) dapat diekstraksi ke CMS atau static site marketing terpisah. Hasil audit membuktikan sebaliknya:

```
[Permintaan Masuk: /]
         |
         v
+-------------------------------------------------------------+
| app/page.tsx (Core Routing Controller)                      |
+-------------------------------------------------------------+
         |
         +---> Evaluasi Sesi Autentikasi (Firebase Auth)
         |        |
         |        +-- Belum Login ---------> Tampilkan Landing + Tombol Masuk
         |
         +---> Evaluasi Profil Pengguna (Firestore: users/{uid})
         |        |
         |        +-- Profil Belum Lengkap -> Redirect: /setup
         |
         +---> Evaluasi Status Data Kelahiran & Human Design
                  |
                  +-- Data Valid ----------> Redirect: /dashboard
```

### Kesimpulan Rute Root:
- Berkas `app/page.tsx` memuat logika kondisional krusial yang menentukan apakah pengguna diarahkan ke `/dashboard`, `/setup`, atau tampilan onboarding awal.
- Jika berkas ini dipisahkan dari aplikasi Next.js, aliran autentikasi web dan mobile wrapper (Capacitor) akan mengalami kegagalan total (*critical redirect loop*).
- **Keputusan Arsitektur**: **`app/page.tsx` TETAP DI DALAM APLIKASI CORE DAN DILARANG DIEKSTRAKSI.**

---

## 4. Perbandingan Kapabilitas Modul Admin

Perbandingan mendalam antara antarmuka admin lokal (`app/admin/activity`) dengan `remotes/origin/main` (`bhumi-founder-dashboard`):

| Dimensi Evaluasi | Implementasi Lokal (`app/admin/activity`) | Dasbor Eksternal (`origin/main`) | Status Kesenjangan |
| :--- | :--- | :--- | :--- |
| **Volume Kode** | **2.130 baris kode** (komprehensif) | ~300-400 baris per halaman modul | Kesenjangan fungsional masif |
| **Perbaikan Data Human Design (HD Repair)** | **Tersedia**: Tombol regenerasi chart, re-kalkulasi gate, sinkronisasi profile Firestore | **Tidak Ada**: Hanya visualisasi grafik pasif | Kritis: Kehilangan kemampuan intervensi data |
| **Diagnostik Autentikasi** | **Tersedia**: Audit UID, token refresh, pengecekan custom claims | **Terbatas**: Hanya log login dasar | Menengah: Diagnostik level teknis hilang |
| **Verifikasi Integritas Firestore** | **Tersedia**: Skrip pengecekan field dokumen yatim (*orphaned records*) | **Tidak Ada**: Hanya ringkasan agregat | Kritis |
| **Kontrol Akses Pengguna** | Proteksi ketat berbasis UID founder dan email whitelist | Proteksi sesi standar Firebase | Perlu penyelarasan konfigurasi |

**Rekomendasi Ekstraksi**: Kode `app/admin/activity` tidak boleh dihapus dari basis kode aplikasi hingga seluruh utilitas operasional (terutama fitur HD Repair dan audit Firestore) berhasil diimplementasikan penuh pada repositori dasbor pendiri mandiri.

---

## 5. Status Rute Aura (Web-Only) & Evaluasi Package ID

Rute `app/aura/page.tsx` merupakan antarmuka landing dan visualisasi aura yang dirancang untuk platform web publik:

1. **Dependensi Komponen**: Menggunakan pustaka animasi dan komponen UI web responsif, tidak terhubung dengan plugin native Android.
2. **Kesenjangan ID Paket Play Store**:
   - Tautan unduhan pada halaman Aura merujuk ke ID aplikasi legacy: `id.my.bhumiamartya`.
   - Konfigurasi resmi Capacitor Android saat ini menggunakan: `com.bhumiamartya.app` (dan `com.bhumiamartya.app.qa` untuk build QA).
   - Tautan tersebut berisiko mengarahkan pengguna ke halaman rilis usang atau rute Play Store yang tidak aktif.
3. **Strategi Isolasi Mobile Build**:
   - Pada build aplikasi mobile (Capacitor), rute Aura tidak boleh disertakan dalam aset bundel Android guna menghemat ukuran APK/AAB serta mencegah kebingungan navigasi pengguna native.
   - Mekanisme pengeluaran dilakukan pada tahapan sinkronisasi build (`npx cap copy` / script staging), tanpa memodifikasi kode sumber web.

---

## 6. Status Rute Cuaca & Kualitas Udara (Weather-AQI)

- **Klasifikasi**: `SHARED UI + REMOTE_BACKEND_SHARED`.
- **Implementasi**: Antarmuka cuaca dan indeks kualitas udara (AQI) terintegrasi pada dasbor pengguna, namun sumber data ditarik dari service pihak ketiga (BMKG / Open-Meteo / IQAir API).
- **Graceful Degradation**: Jika backend penyedia cuaca tidak dapat dihubungi atau mengalami latensi tinggi, antarmuka Bhumi Amartya mengimplementasikan caching lokal dan status fallback informatif tanpa menyebabkan kegagalan rendering pada komponen lain di dasbor.
- **Rekomendasi**: Pertahankan komponen UI bersama, standarisasi kontrak payload JSON melalui proxy API internal yang memiliki batas timeout aman (maksimal 3000ms).

---

## 7. Diskrepansi Rute Kalkulasi Bodygraph (Human Design)

Evaluasi terhadap rute `app/api/bodygraph/route.ts` menunjukkan evolusi arsitektur berikut:
- **Baseline Commit (`e63f334c`)**: Mengoperasikan rute proxy POST aktif yang meneruskan data koordinat kelahiran ke microservice internal.
- **Status Worktree Lokal**: Rute telah dinonaktifkan secara terencana dan mengembalikan status HTTP terminal:
  ```json
  HTTP/1.1 410 Gone
  Content-Type: application/json

  {
    "error": "Decommissioned",
    "message": "Endpoint kalkulasi bodygraph internal telah dipindahkan secara permanen ke microservice FastAPI Human Design terverifikasi."
  }
  ```
- **Analisis Risiko**: Perubahan status menjadi 410 Gone adalah langkah terarah untuk memutus ketergantungan kalkulasi astrologi berat dari serverless function Next.js ke backend terdedikasi. Ini menjaga konsistensi kalkulasi efemeris Swiss Ephemeris pada service engine Python.

---

## 8. Status Tata Kelola & Dokumen Governance (PLATFORM-01)

Worktree lokal telah memiliki instrumen kendali arsitektur lengkap:
- Manifes arsitektur PLATFORM-01 telah terdata.
- Matriks evaluasi 51 rute rujukan Build 108 ENL telah dipetakan secara komprehensif.
- Seluruh aturan isolasi hak cipta, kepemilikan kode, dan batasan eksekusi tersinkronisasi dengan pedoman `RULES.md` dan `AGENTS.md`.

---

## 9. Rencana Ekstraksi Bertahap (Roadmap S1 – S6) & Metrik Dampak

| Tahap | Nama Tahapan | Berkas Terdampak Langsung | Dependensi Transitif | Siklus Impor | Paparan Keamanan | Efek Ukuran Bundel | Estimasi Upaya & Risiko | Persetujuan Founder | Prosedur Rollback | Kriteria Keluar (Exit Criteria) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **S1** | **Source & Deployment Parity Evidence** | Dokumen arsitektur, verifikasi hash commit | None (Read-only audit) | 0 | Nol | 0 KB | Rendah / Nol | Wajib (Review tertulis) | Tidak diperlukan (hanya audit) | Matriks kepemilikan disetujui, bukti commit terverifikasi |
| **S2** | **Staging-Based Mobile Build Isolation** | Skrip build Capacitor, `capacitor.config.ts`, `.buildignore` | Aset statis Android, folder `public/` | 0 | Aman | Penurunan ukuran APK (-2.8 MB) | Menengah / Rendah | Wajib | Hapus filter staging, kembalikan copy bundel default | Build APK/AAB berhasil tanpa rute `/aura` di mobile |
| **S3** | **Founder Admin Feature Parity** | Repositori dasbor pendiri (`origin/main`), service API | Modul HD repair, Firestore admin SDK | 0 | Kritis (Pemberian token admin) | Penurunan web core bundle (-180 KB) | Tinggi / Menengah | Wajib | Kembalikan rute lokal `app/admin` jika dasbor gagal | Semua fitur diagnostik lokal berjalan 100% di remote |
| **S4** | **Aura Web-Only Source Consolidation** | `app/aura/page.tsx`, tautan Store, footer web | Komponen landing page, metadata SEO | 0 | Rendah | 0 KB (Web tetap memuat) | Rendah / Rendah | Wajib | Revert pembaruan tautan | Tautan Play Store sinkron ke `com.bhumiamartya.app` |
| **S5** | **Backend API Ownership & Contract Verification** | `app/api/weather/*`, proxy verifier, client HD | Microservice FastAPI, billing verifier | 0 | Menengah (Validasi request payload) | Pengurangan dependensi serverless | Menengah / Menengah | Wajib | Aktifkan kembali mock lokal internal | Kontrak API remote lolos verifikasi schema 100% |
| **S6** | **Regression & Build Gate Validation** | Rangkaian pengujian Playwright, Jest/Vitest, build gate | Seluruh antarmuka web dan mobile | 0 | Nol | Sesuai target rilis | Tinggi / Rendah | Wajib (Tanda tangan rilis) | Batalkan rilis rute build | 100% tes lolos, zero warning pada tsc noEmit |

---

## 10. Keputusan Akhir (Final Verdict)

### **HASIL EVALUASI: PASS AUDIT**

Rencana pemisahan fungsionalitas dan ekstraksi repositori dinyatakan **DITERIMA DAN LAYAK DIJALANKAN (PASS AUDIT)** dengan syarat mutlak:
1. Tidak ada perubahan langsung (*zero in-place deletions*) pada rute `app/admin/` sebelum dasbor eksternal terbukti operasional secara fungsional.
2. Berkas `app/page.tsx` tidak boleh dipindahkan karena merupakan pengendali alur aplikasi utama.
3. Isolasi build mobile Android dilakukan secara aman melalui mekanisme filtering staging tanpa merusak integritas kode sumber web.
4. Segala tindakan eksekusi wajib mengacu pada dokumen tata kelola `docs/architecture/SAFE_EXTRACTION_PLAN.md`.
