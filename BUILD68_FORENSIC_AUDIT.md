# BHUMI V3 BUILD 68 — FORENSIC AUDIT REPORT

**Tanggal Audit:** 2026-07-03 17:58:18 (WIB)
**Auditor:** Senior Android + Capacitor Engineer
**Kasus:** Build 68 sudah di-upload ke Internal Testing, versionCode 68, Released, Available, namun runtime tidak berubah.

---

## METODE AUDIT

Setiap item diuji dengan bukti konkret (file paths, grep output, timestamps). Tidak ada asumsi.

---

## 1. SOURCE AUDIT

### Status: ✅ PASS (Source sudah benar)

### Bukti di Repository:

| Item | Path | Nilai | Status |
|------|------|-------|--------|
| Version Code | `lib/config/buildInfo.ts` | `CURRENT_VERSION_CODE = 68` | ✅ PASS |
| Version Name | `lib/config/buildInfo.ts` | `CURRENT_VERSION_NAME = "3.2.3"` | ✅ PASS |
| Build Number | `lib/config/buildInfo.ts` | `CURRENT_BUILD_NUMBER = "68"` | ✅ PASS |
| Billing Product ID | `lib/billing/googlePlayBilling.ts` | `GOOGLE_PLAY_PRODUCT_ID = "bhumi_premium_monthly"` | ✅ PASS |
| Server Product ID | `functions/index.js` | `GOOGLE_PLAY_PREMIUM_PRODUCT_ID = "bhumi_premium_monthly"` | ✅ PASS |
| Lifetime translation | `lib/data/translations.ts` | `lifetimeAccess: "Akses selamanya (Lifetime)"` | ✅ PASS |
| Founder logic | `app/premium-bhumi/page.tsx` | `isFounder = badge === "Founder" || "Penjaga Bhumi Inti" || "Penjaga Bhumi Alfa"` | ✅ PASS |
| Hide expiry for Founder | `app/premium-bhumi/page.tsx` | Hanya render `accessUntil` jika `isFounder === false` | ✅ PASS |

### Cross-Reference: `bhumi_premium` (legacy, tanpa suffix)
- ❌ TIDAK ada di source code aktif.
- ❌ TIDAK ada di `lib/billing/`, `functions/`, `app/`, `components/`.
- ⚠️ Hanya ada di `MOANA_V65_*` md reports (audit history, bukan code).

### Kesimpulan Source:
**Source sudah benar.** Build 68 changes sudah tersimpan permanen di repository. Tidak ada perubahan yang hilang.

---

## 2. ANDROID ASSETS AUDIT

### Status: ✅ PASS (Assets sudah update)

### Bukti di `android/app/src/main/assets/public/`:

| Item | Path | Bukti | Status |
|------|------|-------|--------|
| Asset folder ada | `android/app/src/main/assets/public/` | 30 folder route ada (premium-bhumi, dashboard, share-card, dll) | ✅ PASS |
| `_next/static/chunks/*.js` ada | `_next/static/chunks/` | File: `0-5vklz4r3h3r.js`, `0-dtk.uct.981.js`, dll. | ✅ PASS |
| `lifetimeAccess` di bundle | chunk `0-dtk.uct.981.js` | `"lifetimeAccess":"Akses selamanya (Lifetime)"` ditemukan | ✅ PASS |
| `bhumi_premium_monthly` di bundle | chunk `0-dtk.uct.981.js` | `let A="bhumi_premium_monthly"` (module 83040) | ✅ PASS |
| `GOOGLE_PLAY_PRODUCT_ID` di bundle | chunk `0-dtk.uct.981.js` | `e.s(["GOOGLE_PLAY_PRODUCT_ID",0,A,...])` | ✅ PASS |
| Trial window 7 days | chunk `0-dtk.uct.981.js` | `7*24*60*60*1000` (SEVEN_DAYS_MS) | ✅ PASS |

### Kesimpulan Assets:
**Assets sudah benar.** `npx cap sync android` sudah menyalin bundle terbaru ke folder `android/app/src/main/assets/public/`. Build 68 strings (`lifetimeAccess`, `bhumi_premium_monthly`, `Akses selamanya (Lifetime)`) ADA dalam JavaScript bundles.

---

## 3. BILLING AUDIT

### Status: ✅ PASS

### Repository-Wide Search:
- ✅ `lib/billing/googlePlayBilling.ts`: `GOOGLE_PLAY_PRODUCT_ID = "bhumi_premium_monthly"`
- ✅ `functions/index.js`: `GOOGLE_PLAY_PREMIUM_PRODUCT_ID = "bhumi_premium_monthly"`
- ✅ Bundles: `A="bhumi_premium_monthly"` (module 83040, runtime register)
- ❌ TIDAK ADA referensi ke `bhumi_premium` (legacy) di code aktif.

### File-by-File Product ID Locations:
| File | Product ID | Status |
|------|------------|--------|
| `lib/billing/googlePlayBilling.ts` | `bhumi_premium_monthly` | ✅ |
| `lib/billing/billingPreparation.ts` | `MOANA_PLAY_BILLING_PRODUCT_IDS.monthly = "bhumi_premium_monthly"` | ✅ |
| `functions/index.js` | `GOOGLE_PLAY_PREMIUM_PRODUCT_ID = "bhumi_premium_monthly"` | ✅ |
| Bundled JS | `"bhumi_premium_monthly"` | ✅ |

---

## 4. BUILD PIPELINE AUDIT

### Status: ⚠️ AAB BUILD ARTIFACT TIDAK DAPAT DIVERIFIKASI

### Rantai Build yang Seharusnya:
```
1. npm run build         → menghasilkan .next + out/
2. npx cap sync android  → menyalin out/ ke android/app/src/main/assets/public/
3. cd android && ./gradlew :app:bundleRelease  → menghasilkan app-release.aab
```

### Status Tiap Step:

| Step | Bukti di Source | Bukti di Assets | Timestamp |
|------|-----------------|-----------------|-----------|
| Step 1: `npm run build` | `lib/config/buildInfo.ts` berisi 68 | Bundles exist in `_next/static/chunks/` | ✅ Tercapai |
| Step 2: `npx cap sync android` | (n/a) | `android/app/src/main/assets/public/_next/static/chunks/` ada | ✅ Tercapai |
| Step 3: `gradlew bundleRelease` | (n/a) | ⚠️ **TIDAK BISA DIVERIFIKASI** | ❓ |

### Verifikasi Step 3 — AAB File:
```
android/app/build/outputs/bundle/  → folder EXIST, created 7/2/2026 2:17 PM
android/app/build/outputs/logs/    → folder EXIST, created 7/3/2026 4:19 PM
```

**Catatan penting:** Folder `bundle/` dan `logs/` ada, namun:
1. Apakah ada file `app-release.aab` di dalam `bundle/release/` ?
2. Apakah AAB tersebut dibuat SETELAH cap sync yang baru?

**Tidak ada cara untuk membuktikan dari environment ini apakah AAB di folder `bundle/` benar-benar memuat source/assets Build 68.**

---

## 5. RUNTIME DIAGNOSIS — PENYEBAB PALING MUNGKIN

Berdasarkan bukti yang ada, **source dan assets sudah benar**. Kemungkinan penyebab runtime tidak berubah:

### KASUS C: String ada di source, ada di assets, TAPI runtime masih lama

### 5A. Kemungkinan #1 — AAB Ketinggalan Zaman (HIGH PROBABILITY)
**Gejala:** Folder `bundle/` created `7/2/2026 2:17 PM` — lebih lama dari cap sync yang baru (7/3/2026).

**Bukti:**
```
android/app/build/outputs/bundle/      LastWriteTime: 7/2/2026   2:17 PM
android/app/build/outputs/logs/        LastWriteTime: 7/3/2026   4:19 PM
```

**Interpretasi:** Gradle build bisa saja di-stale atau tidak dilakukan ulang setelah Build 68 assets di-sync. Founder mungkin upload AAB dari build sebelumnya.

### 5B. Kemungkinan #2 — Upload AAB dari Build 67 (HIGH PROBABILITY)
**Gejala:** Play Console menampilkan Version Code 68, namun aplikasi di device masih berperilaku seperti Build 67.

**Bukti tidak langsung:**
- Build 67 menggunakan `bhumi_premium` (legacy).
- Build 68 menggunakan `bhumi_premium_monthly`.
- Jika device masih menampilkan product ID legacy atau tidak ada `lifetimeAccess`, AAB yang di-upload kemungkinan adalah Build 67 AAB, BUKAN Build 68 AAB.

### 5C. Kemungkinan #3 — Device Cache (MEDIUM PROBABILITY)
- Aplikasi di device adalah versi lama dan tidak melakukan auto-update.
- Internal Testing perlu di-trigger manual atau di-uninstall dulu.

### 5D. Kemungkinan #4 — Founder Chrome Cache Browser (LOW PROBABILITY)
- Bukan masalah aplikasi, tapi Play Console yang menampilkan informasi versi.

### 5E. Kemungkinan #5 — Split APK / Wrong Variant (LOW PROBABILITY)
- Mungkin yang di-upload adalah `release-unsigned.aab` bukan `release-signed.aab`, atau sebaliknya.

---

## 6. FIX RECOMMENDATION — MINIMAL CHANGE

### Action Plan (3 Langkah Konkret):

#### STEP 1: VERIFY AAB ARTIFACT TIMESTAMP & CHECKSUM (5 menit)
```powershell
# Lihat apakah AAB ada dan kapan dibuat
Get-ChildItem android\app\build\outputs\bundle\release\ -Recurse

# Harus menampilkan:
# app-release.aab       LastWriteTime: SETELAH cap sync terakhir
# Size: ~10-30 MB
```

#### STEP 2: REBUILD AAB FRESH (10-15 menit)
```powershell
# Wajib: Hapus output lama
Remove-Item -Recurse -Force android\app\build\outputs\bundle\ -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\build\outputs\apk\ -ErrorAction SilentlyContinue

# Pastikan assets sudah sync (dari sini sudah ✅)
npx cap sync android

# Bangun AAB baru
cd android
.\gradlew :app:bundleRelease

# Verifikasi
Get-ChildItem android\app\build\outputs\bundle\release\app-release.aab
```

#### STEP 3: VERIFY AAB CONTENTS (5 menit)
```powershell
# Buka AAB seperti zip
Expand-Archive android\app\build\outputs\bundle\release\app-release.aab -DestinationPath aab_check

# Periksa assets publik di dalam AAB
Get-ChildItem -Recurse aab_check\assets\public\_next\static\chunks\ -Filter *.js | Select-String -Pattern "lifetimeAccess","bhumi_premium_monthly"

# HARUS menampilkan:
# "lifetimeAccess": "Akses selamanya (Lifetime)"
# "bhumi_premium_monthly"
```

#### STEP 4: UPLOAD ULANG KE PLAY CONSOLE (5-10 menit)
1. Login ke Google Play Console.
2. Pilih app Bhumi Amartya → Testing → Internal Testing.
3. Create new release dengan AAB baru (app-release.aab dari Step 2).
4. Version: 68 / 3.2.3.
5. Release notes: sebutkan "Hotfix: Founder lifetime access, new billing product ID".
6. Review & Rollout.

#### STEP 5: FORCE INSTALL DI DEVICE (5 menit)
```
1. Buka Play Store di device.
2. Cari "Bhumi Amartya".
3. Jika update tersedia, klik Update.
4. Jika tidak:
   a. Uninstall app lama.
   b. Buka link internal testing invitation dari Play Console.
   c. Install ulang.
```

---

## 7. ROOT CAUSE KESIMPULAN

### Paling Mungkin: AAB STALE

Berdasarkan audit:
- ✅ Source Code = Build 68 (verified via grep).
- ✅ Android Assets = Build 68 (verified via grep on bundles).
- ⚠️ AAB Artifact = **TIDAK TERKONFIRMASI** apakah Build 68 atau stale dari Build 67.

**Hipotesis terkuat:**
> Founder membangun AAB dari Build 67 (sebelum Build 68 commit), atau Gradle tidak di-rerun setelah perubahan source/assets.

**Akibat:**
- Play Console menampilkan Version Code 68 (karena di-increment manual di `build.gradle`).
- Namun isi APK/AAB masih bundle Build 67.
- Runtime di device menampilkan UI/behavior Build 67.

---

## 8. KONFIRMASI SETELAH FIX

Setelah fix dilakukan, verifikasi di device:

1. **Tentang Aplikasi** → Version 3.2.3, Build 68. ✓
2. **Premium Bhumi page** untuk Founder email → menampilkan "Akses selamanya (Lifetime)" dan TIDAK menampilkan tanggal expiry. ✓
3. **Settings** untuk Founder email → menampilkan badge "Founder Bhumi" dengan warna amber. ✓
4. **Billing** (jika diaktifkan) → product ID yang tertera di log adalah `bhumi_premium_monthly`. ✓

Jika semua 4 di atas benar, Build 68 sudah benar-benar aktif di device.

---

## RULE COMPLIANCE

- ✅ Tidak membuat arsitektur baru.
- ✅ Tidak membuat service baru.
- ✅ Tidak mengubah flow aplikasi.
- ✅ Tidak refactor besar.
- ✅ Reuse implementasi yang ada.
- ✅ Source of Truth dihormati.
- ✅ Fokus pada akar masalah: kemungkinan AAB stale.

---

## TL;DR

**Source ✅ Assets ✅ AAB ⚠️ (mungkin stale).**

Fix minimal:
1. Hapus `android/app/build/outputs/bundle/`.
2. `npx cap sync android`.
3. `cd android && ./gradlew :app:bundleRelease`.
4. Upload AAB baru ke Play Console.
5. Force install di device.

Bukan masalah kode. Bukan masalah assets. Bukan masalah sync. **Masalahnya ada di step rebuild Gradle yang mungkin tidak dilakukan atau dilakukan dengan assets lama.**

---

**End of Forensic Audit.**
