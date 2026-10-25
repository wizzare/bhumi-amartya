# Rencana Pelaksanaan Ekstraksi Aman (Safe Extraction Plan)

**Versi Panduan**: 1.0.0  
**Tujuan**: Pemisahan modul, isolasi build mobile, dan pengalihan kapabilitas admin tanpa gangguan pada produksi (*Zero Downtime, Zero Regressions*).  
**Bahasa**: Bahasa Indonesia  

---

## 1. Ikhtisar Prinsip Keselamatan (Safety Invariants)

Rencana ekstraksi ini dibangun di atas 4 prinsip non-negosiasi:
1. **Dilarang Menghapus Berkas Sebelum Pengganti Beroperasi**: Kode sumber lokal tidak boleh dimutasi atau dihapus sebelum implementasi tujuan terbukti mencapai kesetaraan fitur 100%.
2. **Zero Source Edits to Web Core**: Pemisahan bundel mobile dilakukan pada proses packaging/staging, bukan dengan menghapus rute web secara acak.
3. **Fail-Closed Verification**: Setiap tahapan wajib memiliki tes pembanding dan gerbang rilis (release gates).
4. **Izin Founder Mutlak**: Eksekusi setiap fase memerlukan persetujuan eksplisit dari Founder.

---

## 2. Fase Pelaksanaan Ekstraksi (S1 – S6)

```
[S1: Bukti Paritas] ---> [S2: Isolasi Mobile] ---> [S3: Migrasi Fitur Admin]
                                                           |
[S6: Gerbang Rilis] <--- [S5: Verifikasi API]  <--- [S4: Konsolidasi Aura]
```

### Fase S1: Source & Deployment Parity Evidence
- **Tujuan**: Menghasilkan audit forensik lengkap mengenai status commit, divergensi cabang, dan pemetaan rute.
- **Langkah Operasional**:
  1. Jalankan audit status git (`git status --short`, `git rev-parse HEAD`).
  2. Dokumentasikan perbedaan implementasi antara cabang `origin/main` dan `hotfix/build110-indonesian-only`.
  3. Konfirmasikan bahwa seluruh berkas tata kelola arsitektur telah terdaftar dalam worktree lokal.
- **Kriteria Keluar (Exit Criteria)**:
  - Laporan kelayakan `BHUMI_PLATFORM-02A_GITHUB_EXTRACTION_FEASIBILITY_REPORT.md` terbit dan disetujui.
  - Tidak ada modifikasi kode pada fase ini.

---

### Fase S2: Staging-Based Mobile Build Isolation
- **Tujuan**: Mengeluarkan halaman web-only (seperti `/aura`) dari bundel aplikasi Android Capacitor tanpa mengubah struktur rute web.
- **Langkah Operasional**:
  1. Siapkan skrip isolasi build staging pada alur build Android:
     - Jalankan `next build && next export` ke direktori sementara (`.next-staging-mobile`).
     - Terapkan filter eksklusi untuk menghapus direktori web-only (misal: rute `/aura`, halaman marketing).
     - Jalankan `npx cap copy` mengarah pada direktori hasil staging tersebut.
  2. Pastikan `capacitor.config.ts` menunjuk ke hasil direktori staging mobile yang bersih.
- **Kriteria Keluar (Exit Criteria)**:
  - Bundel APK/AAB tidak memuat aset rute `/aura`.
  - Aplikasi web tetap dapat mengakses `/aura` tanpa kendala.
  - Tidak ada perubahan kode pada `app/aura/page.tsx`.

---

### Fase S3: Founder Admin Feature Parity & Migration Proposal
- **Tujuan**: Menjamin seluruh kapabilitas diagnostik pada `app/admin/activity` (2.130 baris) telah hidup dan teruji di repositori mandiri `bhumi-founder-dashboard` sebelum rute lokal didekomisioning.
- **Daftar Fitur Wajib Dipindahkan**:
  1. **Modul Human Design Repair**: Mekanisme pemicu re-kalkulasi bodygraph, sinkronisasi gate, dan pembaruan dokumen chart profil.
  2. **Diagnostik Autentikasi**: Audit sesi pengguna, token lifetime validation, dan pengecekan klaim hak akses.
  3. **Pemeriksa Integritas Firestore**: Deteksi dokumen pengguna tanpa profil astrologi atau profil yatim (*orphaned profiles*).
- **Prosedur Migrasi**:
  1. Implementasikan fitur-fitur tersebut pada repositori dasbor pendiri mandiri.
  2. Uji fungsionalitas end-to-end menggunakan kredensial lingkungan staging.
  3. Setelah dasbor eksternal diverifikasi oleh Founder, rute `app/admin` pada aplikasi utama diubah menjadi proxy pengalihan aman atau dinonaktifkan secara terencana.
- **Kriteria Keluar (Exit Criteria)**:
  - Seluruh kapabilitas 2.130 baris kode lokal terkonfirmasi operasional di dasbor eksternal.
  - Tanda tangan persetujuan migrasi dari Founder.

---

### Fase S4: Aura Web-Only Source Consolidation
- **Tujuan**: Mengamankan antarmuka Aura untuk kebutuhan web publik dan membersihkan referensi legacy.
- **Langkah Operasional**:
  1. Perbarui tautan toko aplikasi pada `app/aura/page.tsx`:
     - Ganti tautan legacy `id.my.bhumiamartya` menjadi tautan Play Store resmi `com.bhumiamartya.app`.
  2. Pastikan skema metadata SEO dan OpenGraph rute `/aura` lengkap dan optimal untuk platform web.
  3. Verifikasi bahwa tidak ada import dari plugin native Capacitor di dalam rute `/aura`.
- **Kriteria Keluar (Exit Criteria)**:
  - Tautan Play Store merujuk pada package ID resmi `com.bhumiamartya.app`.
  - Rute web Aura lulus audit rendering tanpa dependensi native.

---

### Fase S5: Backend API Ownership & Remote Contract Verification
- **Tujuan**: Menetapkan batas kepemilikan API backend remote untuk modul Cuaca/AQI, Human Design, dan Billing Verifier.
- **Langkah Operasional**:
  1. **Weather & AQI**: Verifikasi kontrak JSON antara proxy API klien dan penyedia data eksternal. Pastikan logika *graceful degradation* aktif saat terjadi timeout.
  2. **Human Design Engine**: Pastikan semua pemanggilan kalkulasi diarahkan langsung ke microservice FastAPI yang terisolasi, mengonfirmasi pemutusan endpoint internal `app/api/bodygraph` (HTTP 410 Gone).
  3. **Billing Verifier**: Uji coba endpoint verifikasi tanda terima Play Store dengan request payload terenkripsi.
- **Kriteria Keluar (Exit Criteria)**:
  - 100% respons endpoint backend remote memenuhi skema kontrak TypeScript.
  - Tidak ada kebocoran rahasia (*API keys/service accounts*) di sisi klien web maupun mobile.

---

### Fase S6: Regression & Build Gate Validation
- **Tujuan**: Memastikan keutuhan platform melalui rangkaian pengujian komprehensif sebelum rilis.
- **Langkah Operasional**:
  1. Jalankan pemeriksaan tipe statis komprehensif: `npx tsc --noEmit`.
  2. Eksekusi pengujian unit dan integrasi.
  3. Lakukan pengujian rendering antarmuka pengguna pada Web dan Android WebView.
  4. Periksa ukuran bundel akhir (memastikan pengurangan ukuran aset mobile tercapai).
- **Kriteria Keluar (Exit Criteria)**:
  - `npx tsc --noEmit` menghasilkan Exit Code 0 (Zero Errors).
  - Seluruh skenario pengujian regresi dinyatakan PASS.
  - Founder memberikan persetujuan rilis akhir.

---

## 3. Matriks Risiko & Prosedur Rollback (Risk & Rollback Matrix)

| Risiko Teridentifikasi | Tingkat Keparahan | Prosedur Pencegahan | Prosedur Pemulihan (Rollback) |
| :--- | :--- | :--- | :--- |
| **Aplikasi Android Crash Saat Booting** | Kritis | Isolasi staging mobile tanpa menyentuh modul inisialisasi Firebase/Auth | Kembalikan konfigurasi build Capacitor ke direktori `out` default sebelum staging. |
| **Kehilangan Akses Perbaikan Data HD** | Kritis | Larangan mutasi pada `app/admin/` sampai dasbor eksternal tervalidasi 100% | Pulihkan file `app/admin/activity` dari git commit baseline jika terjadi aksidental mutasi. |
| **Putus Kontrak API Cuaca/AQI** | Menengah | Menerapkan cache internal lokal dan status fallback respons aman | Sistem otomatis beralih ke cache data terakhir yang tersimpan di localStorage. |
| **Kesalahan Tautan Play Store di Web** | Rendah | Validasi URL format resmi Google Play Store sebelum commit | Kembalikan tautan ke referensi statis domain utama `bhumiamartya.id`. |

---

## 4. Daftar Periksa Kesiapan Rilis (Release Readiness Checklist)

- [ ] Laporan Kelayakan PLATFORM-02A telah ditinjau dan berstatus PASS AUDIT.
- [ ] Rute `app/page.tsx` diverifikasi tetap berada di dalam bundel aplikasi inti.
- [ ] Mekanisme isolasi build Android via staging telah teruji tanpa menyentuh kode web.
- [ ] Dasbor pendiri eksternal telah memiliki kapabilitas HD Repair dan Firestore Integrity Check.
- [ ] Tautan rute Aura telah disinkronkan ke canonical package ID `com.bhumiamartya.app`.
- [ ] Endpoint dekomisi `app/api/bodygraph` mengembalikan respon HTTP 410 Gone secara konsisten.
- [ ] Perintah `npx tsc --noEmit` menghasilkan exit code 0.
- [ ] Persetujuan tertulis dari Founder diperoleh sebelum deployment produksi.
