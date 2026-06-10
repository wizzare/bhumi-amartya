# Ringkasan Rilis Bhumi Amartya v1.1.3 (Build 14)

## 1. Logout & Account Picker Flow (PENTING)
Seluruh perbaikan logout telah digabungkan dan dipastikan aktif:
- **Native Android Patch**: Logika `mGoogleSignInClient.signOut()` ditambahkan sebelum `signIn()` untuk memaksa munculnya **Account Picker**.
- **Hard Override**: `useCredentialManager` dipaksa ke `false` untuk menghindari Error "No credentials available".
- **Aggressive SignOut**: Fungsi `signOut` di `authActions.ts` kini membersihkan `localStorage`, `sessionStorage`, dan memanggil native `signOut()`.
- **Session Cleanup**: Menghapus seluruh cache auth bertanda `bhumi*` untuk memastikan isolasi antar akun.

## 2. Pembersihan Layar Setup
UI Onboarding sekarang lebih bersih dan profesional:
- **Debug Panel Tersembunyi**: Panel status (UID, Write Status, dll) sekarang hanya muncul di mode **development**.
- **User Experience**: Pengguna hanya melihat form data kelahiran dan loading state yang bersih saat proses kalkulasi blueprint.

## 3. Peningkatan Fitur "Astro Hari Ini"
Informasi astronomi kini lebih detail dan informatif:
- **Fase Bulan**: Menampilkan estimasi menuju fase besar berikutnya (Bulan Baru/Purnama) beserta jumlah hari dan tanggal pastinya.
- **Periode Planet**: Menampilkan rentang tanggal (Masuk - Keluar) untuk setiap planet di zodiak saat ini (Matahari, Merkurius, Venus, dll).
- **Format Lokal**: Menggunakan format tanggal Indonesia (contoh: 9 Juni 2026).

## 4. Informasi Teknis Build
- **versionCode**: 14
- **versionName**: 1.1.3
- **File Output**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Keamanan**: Build ditandatangani dengan keystore release dan menggunakan `google-services.json` terbaru (termasuk SHA Play Store).

## 5. File yang Berubah
- `node_modules/@capacitor-firebase/authentication/.../handlers/GoogleAuthProviderHandler.java` (Native Patch)
- `lib/auth/authActions.ts` (Enhanced SignOut)
- `app/setup/page.tsx` (Clean UI)
- `lib/astrology/calculateCurrentSky.ts` (Calculations logic)
- `components/dashboard/AstroTodayCard.tsx` (UI Enhancement)
- `android/app/build.gradle` (Version bump)

**Status**: ✅ Siap untuk diuji secara internal sebelum dipublikasikan.
