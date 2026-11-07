# BHUMI AMARTYA — CLIENT COMPATIBILITY & FIRESTORE RULES MATRIX (118, 119, 120, 121)

**ID:** `DOC-ARCH-COMPAT-001`  
**Date:** 7 November 2026 (WIB)  
**Status:** CANONICAL ARCHITECTURE & GOVERNANCE RECORD  
**Author:** Google Antigravity / Founder Directive BUILD 121  

---

## 1. Executive Summary

Snapshot kandidat Firestore Rules yang diperketat (*hardened*) memblokir penulisan langsung data kelahiran (`birthDate`, `birthTime`, `birthCity`, `latitude`, `longitude`, `timezone`) dari sisi klien pada path `users/{uid}`.

Berdasarkan pengujian matematis dan kontraktual (`tests/unit/build121-client-compatibility-matrix.test.ts`), **menerapkan hardened Rules secara langsung ke produksi akan memicu kegagalan fatal (HTTP 403 `permission-denied`) bagi pengguna aktif klien rilis 118 dan 119 di Google Play Store**.

Oleh karena itu, sesuai mandat Founder:
1. **Firestore Rules produksi pada `bhumiamartya-fe85c` tetap dipertahankan permisif terkontrol** selama rilis 118 & 119 masih aktif beredar.
2. **Klien Build 120 mengandalkan sanitasi fail-closed di sisi klien** (`stripCanonicalServerMetadata`, `stripServerOwnedAccessFields`, `stripClientBirthWrites`).
3. **Kandidat Build 121 menghubungkan alur penyimpanan ke backend kanonikal tepercaya** (Cloudflare Workers) yang beroperasi melalui server trust boundary.
4. **Hardening Rules live ke produksi baru dapat diaktifkan setelah masa transisi pengguna** dan konfirmasi bahwa seluruh pengguna aktif telah bermigrasi ke versi yang mendukung penyimpanan kanonikal.

---

## 2. Matriks Kompatibilitas Lintas Versi Klien

| Perilaku Klien / Jalur Penyimpanan | Versi 118 (Produksi Lama) | Versi 119 (Produksi Saat Ini) | Versi 120 (Rilis Lokal Signed) | Kandidat 121 (Cloudflare Canonical) | Status di Rules Live | Status di Hardened Rules Candidate |
|---|---|---|---|---|---|---|
| **Onboarding Pengguna Baru (`app/setup`)** | Direct client write ke `users/{uid}` | Direct client write ke `users/{uid}` + full blueprint | Client write fallback tersanitasi; simpan profil | Server canonical callable `/api/canonical/commitCanonicalBirth` | **ALLOW** (Semua versi berjalan) | **DENY v118/v119/v120 fallback**; ALLOW v121 via server |
| **Koreksi Data Lahir di Pengaturan (`app/settings`)** | Direct client write ke `users/{uid}` | Direct client write ke `users/{uid}` | Fallback tersanitasi jika belum kanonikal | Server canonical transaction | **ALLOW** (Semua versi berjalan) | **DENY v118/v119/v120 fallback**; ALLOW v121 via server |
| **Perhitungan BaZi & Vedic Read-Only** | Formula lokal | Formula lokal | Local in-memory recovery status "ready" | Local in-memory recovery status "ready" | **ALLOW** (0 direct write Firestore) | **ALLOW** (0 direct write Firestore) |
| **Proteksi Penimpaan Catatan Kanonikal** | Tidak ada | Tidak ada | `stripClientBirthWrites` memblokir mutasi tanggal lahir klien | Immutability terlindungi di Firestore REST transaction | **PARTIAL** (Hanya dilindungi di v120/v121) | **STRICT PROTECTED** di server |
| **Pemalsuan Hak Akses (`role`, `isPremium`, `badge`)** | Rentan jika rules longgar | Rentan jika rules longgar | `stripServerOwnedAccessFields` membuang field hak akses | Server token verifier + token ownership | **PROTECTED** via client guard | **STRICT PROTECTED** di Firestore Rules & Server |
| **Isolasi Akun (Cross-UID Attack)** | Strict UID check | Strict UID check | Strict UID check | Strict UID check | **STRICT PROTECTED** (`request.auth.uid == userId`) | **STRICT PROTECTED** (`request.auth.uid == userId`) |

---

## 3. Rencana Transisi & Rollout Bertahap (Gating Protocol)

```
[ FASE 1: STATUS SEKARANG ]
  ├── Produksi Play Store: Versi 119 aktif (membutuhkan Rules live permisif terkontrol).
  ├── Repositori Lokal: Build 120 Signed AAB + Build 121 Canonical Backend POC.
  └── Firestore Rules Produksi: TIDAK DIUBAH (Mencegah pemutusan layanan v118/119).

[ FASE 2: DISTRIBUSI BUILD 120 / KANDIDAT 121 ]
  ├── Rilis Build 120 / 121 ke Google Play Store (Internal Track -> Production).
  ├── Aplikasi menyertakan fallback cerdas dan dorongan update bagi versi lama.
  └── Server-side transaction backend di Cloudflare beroperasi penuh.

[ FASE 3: AUDIT PENURUNAN TRAFIK KLIEN LAMA ]
  ├── Memantau log akses Firestore untuk request yang berasal dari v118 dan v119.
  └── Memastikan rasio pengguna aktif versi lama telah mendekati 0%.

[ FASE 4: HARDENING RULES PRODUKSI ]
  ├── Founder menandatangani izin rilis produksi Firestore Rules.
  ├── Snapshot rollback rules live disiapkan.
  └── Rules diperketat: penulisan data kelahiran hanya sah melalui trusted callable server.
```

---

## 4. Bukti Pengujian Otomatis

- Test Suite: `tests/unit/build121-client-compatibility-matrix.test.ts`
- Hasil: **4/4 PASS** (Exit Code 0).
- Verifikasi:
  1. Onboarding v118 lolos di rules live, ditolak di rules candidate.
  2. Update data lahir v119 lolos di rules live, ditolak di rules candidate.
  3. Sanitasi v120 membuang metadata dan access field palsu secara deterministik.
  4. Kandidat v121 menolak penulisan lintas UID dan pemalsuan privilege server-owned.

---

## 5. Bukti Pengujian Live Emulator Suite (Sprint 121-03)

- Test Suite: `tests/unit/build121-sprint03-firestore-rules.test.ts`
- Hasil: **5/5 PASS** (40+ assertions, Exit Code 0 against emulator port 18080/19099).
- Rincian Uji:
  1. **SECTION 1 (UID Isolation):** User A dilarang membaca atau menulis koleksi User B (`users`, `blueprints`, `healingMemory`, `journeyData`, `testerBadgeRegistry`, `adminRoleRegistry`, `adminAuditLogs`, `analytics`, dan collectionGroup `communications`).
  2. **SECTION 2 (Server-Owned Fields & Anti-Privilege Escalation):** Klien dilarang menulis `isPremium`, `membershipType: LIFETIME`, `entitlementSource`, `plan`, `trialStartedAt`, `badge: Founder`, `testerBadge: Founder`, `role: admin`, `guardianRole: founder`, registry server, canonical metadata, field tanggal lahir langsung, profile birth aliases, dan calculated blueprint engines.
  3. **SECTION 3 (Allowed Client Operations):** Klien Build 120/121 diizinkan menulis field presentasi aman (`displayName`, `language`, `theme`, `gender`), update status blueprint (`status: pending`, `updatedAt`), behavior memory wellness, membaca public config (`app_config/version`), dan menulis telemetri kegagalan login unauthenticated.
  4. **SECTION 4 (Admin Custom Claims Fail-Closed):** Membuktikan bahwa role `admin` di dokumen pengguna atau email `wizzare@gmail.com` tanpa custom token claim `admin: true` ditolak keras. Membuktikan bahwa klien bahkan dengan token admin tetap dilarang menulis langsung pesan admin ke thread komunikasi pengguna lain (harus melalui backend callable tepercaya). Klien admin dilarang melakukan pembacaan koleksi global (`users` dan collectionGroup `communications`).
  5. **SECTION 5 (Client Version Matrix Real Verification):** Pengujian aktual payload v118 ditolak pada onboarding data kelahiran, payload v119 ditolak pada nested profile blueprintInput, payload v120 lolos pada sanitasi presentasi, dan alur v121 memisahkan penulisan presentasi klien dengan penulisan kanonikal oleh server.

---

## 6. Klasifikasi Aturan & Protokol Rollout / Rollback

### A. Klasifikasi Aturan (4 Kategori):
1. **Aman & Kompatibel Penuh dengan Seluruh Klien (v118–121):**
   - UID isolation (`request.auth.uid == userId`) pada seluruh subkoleksi privat.
   - Larangan pembacaan lintas akun pada `adminAuditLogs` dan `analytics`.
   - Pembacaan konfigurasi publik `app_config/version`.
2. **Aman tetapi Memutus Klien Lama (Breaking Changes):**
   - Penolakan penulisan data kelahiran langsung (`createsCanonicalBirthFields`, `changesCanonicalBirthFields`, `changesBlueprintInput`).
   - Penolakan penulisan `profile.blueprintInput`.
   - *Dampak:* Menghentikan onboarding dan edit profil v118/v119 jika dideploy ke produksi sebelum migrasi pengguna selesai.
3. **Area Permisif yang Memerlukan Backend Callable:**
   - Pembuatan pesan dukungan pengguna awal dan balasan pesan pengguna (`communications`).
   - Logging telemetri login unauthenticated (`analytics`).
4. **Persyaratan Staged Rollout Sebelum Aktivasi Produksi:**
   - Fase 1: Rilis Build 120/121 ke Play Store dengan client-side sanitasi.
   - Fase 2: Audit log produksi Firebase untuk memastikan trafik klien < v120 mendekati 0%.
   - Fase 3: Snapshot backup live rules.
   - Fase 4: Eksekusi deploy rules diperketat dengan izin eksplisit Founder.

### B. Protokol Rollback Produksi (Bila Diberi Izin Nanti):
Jika pasca-deployment timbul lonjakan error `PERMISSION_DENIED` pada pengguna aktif:
1. Jalankan rollback instan ke versi snapshot rules sebelumnya melalui Firebase CLI:
   `firebase deploy --only firestore:rules --project bhumiamartya-fe85c`
2. Konfirmasi pemulihan fungsionalitas melalui smoke test onboarding.
