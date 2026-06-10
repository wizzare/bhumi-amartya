# Root-Cause Investigation: Google Sign-In Failure (Release Build)

## A. Root Cause Analysis

### 1. SHA-1 Fingerprint Mismatch (CRITICAL)
**Exact Cause:** The `google-services.json` file currently only contains the SHA-1 fingerprint for the **Debug** keystore. The **Release** keystore fingerprint and the **Google Play App Signing** fingerprint are missing from the Firebase configuration.

**Evidence:**
- **In `google-services.json`:** Contains SHA-1 `E7:76:79:29:E8:C4:14:92:FE:FA:D0:E8:A5:3A:BE:27:49:FF:A8:D4`.
- **Local Debug Fingerprint:** Matches `E7:76:79:29...` (Verified via `keytool`).
- **Local Release Fingerprint:** `B5:1C:84:D0:7B:86:95:80:C7:D5:9D:36:E8:FA:F8:52:F7:92:CC:52` (Verified via `keytool`).
- **Play Store Internal Testing:** Since the app is delivered via Google Play, it uses a **third** certificate (App Signing Key) managed by Google, which is also missing from Firebase.

### 2. Missing Asset: `google.png`
**Exact Cause:** The file `public/images/google.png` referenced in `app/login/page.tsx` is missing from the project source.
**Evidence:** 
- `find_files` and `ls` commands confirm `google.png` does not exist in `public/images/` or `android/app/src/main/assets/public/images/`.
- Only `logo.png` is present.

---

## B. Fix Plan

### Step 1: Update Firebase with Release SHA-1
1. Open [Firebase Console](https://console.firebase.google.com/).
2. Go to **Project Settings** > **Your Apps** > **Android App**.
3. Click **Add fingerprint**.
4. Add the **Local Release SHA-1**: `B5:1C:84:D0:7B:86:95:80:C7:D5:9D:36:E8:FA:F8:52:F7:92:CC:52`.

### Step 2: Update Firebase with Google Play App Signing SHA-1
1. Open [Google Play Console](https://play.google.com/console).
2. Navigate to **Setup** > **App Integrity** > **App Signing**.
3. Locate the **App signing key certificate**.
4. Copy the **SHA-1** and **SHA-256** fingerprints.
5. Add both to your Firebase Android App settings (same place as Step 1).

### Step 3: Refresh `google-services.json`
1. After adding all fingerprints, download the updated `google-services.json`.
2. Replace the file at `android/app/google-services.json`.

### Step 4: Fix Missing Asset
1. Add a valid `google.png` (20x20 or similar) to `public/images/google.png`.
2. Run `npm run build` and `npx cap sync android`.

---

## C. Code Patches

### 1. Enhanced Logging in `lib/auth/authActions.ts`
Implemented detailed error catching to identify exactly where the native handshake fails.
```typescript
// Updated logging in signInWithGoogle
console.error("[DETAILED AUTH ERROR]", {
  message: err?.message,
  code: err?.code,
  platform: platform,
  timestamp: new Date().toISOString()
});
```

### 2. UI Error Feedback in `app/login/page.tsx`
Updated to show the actual error message instead of a generic "Login gagal".

---

## D. Firebase Checklist
- [ ] Android Package Name: `com.bhumiamartya.app` (Verified: OK)
- [ ] Debug SHA-1 Added (Verified: OK)
- [ ] Release SHA-1 Added (Action Required)
- [ ] Google Play App Signing SHA-1 Added (Action Required)
- [ ] Google Play App Signing SHA-256 Added (Action Required)
- [ ] Google Sign-In Provider Enabled in Firebase Auth (Action Required)

---

## E. Release Signing Checklist
- [ ] Keystore: `bhumi-amartya-release.jks` (Verified: OK)
- [ ] Alias: `bhumi-amartya` (Verified: OK)
- [ ] Build Configuration: `signingConfigs.release` (Verified: OK)

---

## F. Essential Commands

### Obtain Local Release SHA-1/SHA-256:
```powershell
keytool -list -v -keystore C:\Users\shein\keys\bhumi-amartya-release.jks -alias bhumi-amartya
```

### Obtain Debug SHA-1/SHA-256:
```powershell
keytool -list -v -keystore C:\Users\shein\.android\debug.keystore -alias androiddebugkey -storepass android
```

---

## G. Verification Report (Post-Fix)
1. **Asset Check**: Verify `google.png` appears on the login screen.
2. **Auth Check**: Tap "Lanjutkan dengan Google".
3. **Log Check**: Observe `[NATIVE GOOGLE AUTH RESULT SUCCESS]` in Logcat.
