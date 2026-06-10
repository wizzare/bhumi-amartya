# Google Sign-In Logout & Account Picker Fix Report

## 1. Problem Identification
Setelah login berhasil, proses **Sign Out** tidak sepenuhnya membersihkan sesi identity provider di level Native Android. Akibatnya, saat pengguna mencoba login kembali, Google Play Services menggunakan sesi terakhir yang tersimpan (misal: `wizzare@gmail.com`) dan langsung masuk ke dashboard tanpa menampilkan **Account Picker**.

## 2. Perubahan yang Dilakukan

### A. Perbaikan Native Android (Hard Override)
**File**: `node_modules/@capacitor-firebase/authentication/android/src/main/java/io/capawesome/capacitorjs/plugins/firebase/authentication/handlers/GoogleAuthProviderHandler.java`

1.  **Force SignOut Sebelum SignIn**: Menambahkan logika `mGoogleSignInClient.signOut()` sesaat sebelum `Intent` login dimulai. Ini menjamin Google Play Services selalu berada dalam state "signed out" sebelum menampilkan UI login.
2.  **Explicit Account Picker**: Dengan memanggil `signOut()` sebelum `signIn()`, Google Play Services dipaksa untuk menampilkan UI pemilihan akun (Account Picker).
3.  **Logging**: Menambahkan log `BHUMI_AUTH` untuk memantau proses "Pre-signIn signOut".

### B. Perbaikan Logic Logout di Frontend
**File**: `lib/auth/authActions.ts`

1.  **Native SignOut Integration**: Memperbarui fungsi `signOut` untuk memanggil `FirebaseAuthentication.signOut()` (Native Plugin) jika berjalan di platform native.
2.  **Aggressive Cache Clearing**: Menambahkan logika untuk membersihkan `localStorage` secara menyeluruh, terutama key yang berkaitan dengan `bhumi`, `auth`, dan `User`.
3.  **Session Clearing**: Memastikan `sessionStorage` dibersihkan sepenuhnya.

### C. Perbaikan UI Settings
**File**: `app/settings/page.tsx`

1.  **Logout via Context**: Mengubah `handleSignOut` untuk menggunakan `auth.logout()` dari `AuthContext` alih-alih memanggil Firebase `signOut` secara langsung. Ini memastikan seluruh rangkaian pembersihan data (Native + Firebase + LocalStorage) dijalankan secara sinkron.

## 3. Hasil yang Diharapkan
1.  Saat pengguna menekan "Keluar dari akun", sesi Firebase dan sesi Google di Android akan dihapus.
2.  Seluruh data profil lokal akan dihapus.
3.  Saat pengguna menekan "Lanjutkan dengan Google" lagi, **Account Picker akan muncul**, memungkinkan pengguna memilih akun yang berbeda atau akun yang sama kembali.

## 4. File yang Diubah
- `node_modules/@capacitor-firebase/authentication/android/src/main/java/io/capawesome/capacitorjs/plugins/firebase/authentication/handlers/GoogleAuthProviderHandler.java`
- `lib/auth/authActions.ts`
- `app/settings/page.tsx`
