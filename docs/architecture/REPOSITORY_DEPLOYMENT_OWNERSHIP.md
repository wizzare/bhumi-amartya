# Tata Kelola Kepemilikan Repositori & Deployment (Repository Deployment Ownership)

**Status Dokumen**: Disetujui (Approved Architecture Standard)  
**Konteks Platform**: Bhumi Amartya Platform Multi-Target  
**Bahasa**: Bahasa Indonesia  

---

## 1. Pemetaan Multi-Repositori (Multi-Repo Mapping)

Arsitektur Bhumi Amartya didistribusikan ke dalam beberapa entitas repositori dan cabang terisolasi untuk memastikan stabilitas produksi, keamanan kontrol admin, serta efisiensi rilis mobile.

### 1.1 Repositori Utama: `wizzare/bhumi-amartya`

Repositori `wizzare/bhumi-amartya` menampung dua alur pengembangan yang memiliki riwayat commit berbeda (*divergent branches*):

| Cabang (Branch) | Peran & Target Produksi | Status Silsilah Git | Target Deployment |
| :--- | :--- | :--- | :--- |
| **`hotfix/build110-indonesian-only`** | Basis kode aplikasi utama Bhumi Amartya (Next.js 14, Capacitor Android, PWA, modul kalkulasi lokal). | Cabang aktif produksi (Build 107 - 110). | - Web App Produksi (`app.bhumiamartya.id` / `bhumi-amartya.vercel.app`)<br>- Bundel Aplikasi Android (APK & AAB Rilis Play Store) |
| **`main`** | Repositori terpisah yang sebelumnya di-push secara independen (`bhumi-founder-dashboard v1.0.0`). | *Orphan branch* / Zero common ancestor dengan aplikasi utama. | - Dasbor Operasional Pendiri (Internal Founder Monitoring Console) |

> **PERINGATAN ARSITEKTUR**: Dilarang menggabungkan (`merge`) cabang `main` dengan cabang aplikasi utama (`hotfix/build110-indonesian-only`). Keduanya memiliki arsitektur dependensi, pustaka UI, dan tujuan sistem yang berbeda.

---

## 2. Batas Kepemilikan Deployment Vercel (Deployment Boundaries)

Setiap layanan memiliki target deployment Vercel dan backend engine yang terpisah guna mencegah eskalasi hak akses (*privilege escalation*) dan kontaminasi bundel:

```
+-----------------------------------------------------------------------------------+
|                        TOPOLOGI DEPLOYMENT VERCEL & SERVICES                      |
+-----------------------------------------------------------------------------------+

 1. Web App Produksi (End-User)
    - Proyek Vercel : bhumi-app-prod
    - Sumber Kode   : wizzare/bhumi-amartya (branch: hotfix/build110-indonesian-only)
    - Akses Pengguna: Publik & Pengguna Terdaftar (Client Firebase Auth)
    - Domain        : https://app.bhumiamartya.id

 2. Founder Dashboard (Monitoring & Admin)
    - Proyek Vercel : bhumi-founder-console
    - Sumber Kode   : wizzare/bhumi-amartya (branch: main) ATAU repositori terpisah
    - Akses Pengguna: Terbatas hanya untuk UID Founder (Whitelist Terisolasi)
    - Domain        : https://founder.bhumiamartya.id

 3. Receipt & Billing Verifier Service
    - Proyek Vercel : bhumi-billing-verifier (Serverless Edge Worker)
    - Fungsi        : Validasi tanda terima pembelian Google Play Billing & Lifetime Access
    - Akses         : Terproteksi shared secret / HMAC signature

 4. Human Design Calculation Service
    - Infrastruktur : FastAPI Python Service (Infrastruktur Mandiri / Cloud Run)
    - Fungsi        : Engine efemeris astrologi presisi tinggi (Swiss Ephemeris)
    - Akses         : Private Network / Token Service-to-Service
```

---

## 3. Sumber Kebenaran Tunggal per Target (Source of Truth - SoT)

Untuk mencegah ambiguitas dalam pengembangan dan siklus rilis, tabel berikut menetapkan acuan kebenaran mutlak (SoT):

| Target Sistem | Dokumen Sumber Kebenaran (SoT) | Lokasi Kode Sumber Resmi |
| :--- | :--- | :--- |
| **Aplikasi Android Produksi** | `BUILD_108_ENL_MASTER_SOT.md` & `BUILD_107_HOTFIX_RELEASE.md` | `hotfix/build110-indonesian-only` (direktori `android/`) |
| **Aplikasi Web Pengguna** | `BUILD_108_ENL_SCOPE_MATRIX.md` | `hotfix/build110-indonesian-only` (direktori `app/` inti) |
| **Dasbor Admin Pendiri** | `docs/architecture/REPOSITORY_DEPLOYMENT_OWNERSHIP.md` | Repositori Founder Dashboard terdedikasi (setelah ekstraksi Fase S3) |
| **Kalkulasi Human Design** | Dokumentasi Engine HD & Validasi Efemeris | Microservice FastAPI `bhumi-hd-engine` |
| **Aturan Keamanan Data** | `firestore.rules` & `storage.rules` | Direktori root pada worktree aplikasi utama |

---

## 4. Standarisasi Canonical Package ID

Ditemukan beberapa identifikasi paket dalam basis kode lama. Standar kanonikal yang berlaku untuk seluruh platform adalah:

### 4.1 `com.bhumiamartya.app` (Android Production Canonical ID)
- Digunakan secara resmi pada Google Play Store untuk aplikasi rilis produksi.
- Dikonfigurasi pada `android/app/build.gradle` (applicationId), `capacitor.config.ts`, dan Google Play Console.
- Seluruh tanda terima langganan dan verifikasi Firebase didaftarkan pada ID ini.

### 4.2 `com.bhumiamartya.app.qa` (Android QA & Staging ID)
- Digunakan untuk pengujian build internal, QA regresi, dan pengujian instalasi paralel pada perangkat fisik penguji.
- Menggunakan sertifikat penandatanganan debug terpisah tanpa mengganggu data pengguna produksi.

### 4.3 `id.my.bhumiamartya` (Legacy Play Store Reference)
- Merupakan referensi domain/package legacy yang ditemukan pada halaman web promosi Aura (`app/aura/page.tsx`).
- **Status Tata Kelola**: **LEGACY TAUTAN**. Tidak boleh digunakan sebagai target build baru di lingkungan Android. Semua tautan unduhan publik wajib diperbarui secara bertahap menuju target resmi Play Store `com.bhumiamartya.app`.

---

## 5. Ringkasan Kebijakan Operasional

1. Tidak ada deployer yang diizinkan menggabungkan kode admin yang memuat Firebase Service Account credentials ke dalam bundel klien `app.bhumiamartya.id`.
2. Segala pembaruan pada aplikasi Android wajib memverifikasi `versionCode` dan `versionName` sesuai register rilis yang disetujui Founder.
3. Rute khusus web tidak boleh diintegrasikan ke dalam aset lokal Android webview tanpa melalui filter staging Fase S2.
