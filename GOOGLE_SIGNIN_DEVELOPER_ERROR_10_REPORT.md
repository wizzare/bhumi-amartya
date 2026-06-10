# Google Sign-In Developer Error (10) Forensic Report

## 1. Investigation Summary

- **Status**: Account Picker appears (Fixed), but fails with `ApiException: 10` (DEVELOPER_ERROR).
- **Hard Override**: Confirmed active in `GoogleAuthProviderHandler.java` (Legacy Flow forced).
- **Build Version**: Confirmed `versionCode 10`, `versionName 1.0.9`.

## 2. Parameter Validation

| Parameter | Value in App | Value in `google-services.json` | Match |
| :--- | :--- | :--- | :--- |
| **Package Name** | `com.bhumiamartya.app` | `com.bhumiamartya.app` | ✅ YES |
| **Web Client ID** | `59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9...` | `...-vldlev9s91l6sss3ulqbh8mnaah4n4c9...` (type 3) | ✅ YES |
| **Request ID Token** | Enabled | N/A | ✅ YES |
| **Request Email** | Enabled | N/A | ✅ YES |

## 3. Signature Verification

I extracted the SHA-1 from the release keystore configured in `gradle.properties`:
- **Keystore Path**: `C:\Users\shein\keys\bhumi-amartya-release.jks`
- **SHA-1 Fingerprint**: `B5:1C:84:D0:7B:86:95:80:C7:D5:9D:36:E8:FA:F8:52:F7:92:CC:52`

**Comparison with `google-services.json`**:
- **Debug Key**: `e776...` (Included)
- **Local Release Key**: `b51c...` (Included)
- **Internal App Sharing Key**: `109b...` (Included)

## 4. The Root Cause of Error 10

Since the parameters and signatures in the local configuration match, the `DEVELOPER_ERROR` (10) after selecting an account is caused by a mismatch in the **Google Cloud Console / Firebase Backend**.

### High-Probability Scenarios:

1.  **Missing Google Play App Signing Key (Most Likely)**:
    If you are installing the app from the **Google Play Store** (Internal Testing or Release track), Google **re-signs** your AAB with a different key. The SHA-1 of the app on your phone is **NOT** `B5:1C...`, it is the **App Signing Key** fingerprint from the Play Console. 
    *This key is currently missing from your `google-services.json` and likely missing from Firebase.*

2.  **Web Client ID Inactive**:
    The `vldlev9s...` client ID might not be the one linked to the Android OAuth client in the Google Cloud Console, or the Android client for the specific SHA-1 hasn't been fully propagated.

## 5. Required Fix Steps

### Step 1: Add the Google Play App Signing Key
1. Go to **Google Play Console** > **Setup** > **App Integrity** > **App Signing**.
2. Copy the **SHA-1 certificate fingerprint**.
3. Go to **Firebase Console** > **Project Settings** > **Your Apps** > **Android**.
4. Click **Add Fingerprint** and paste the Play Store SHA-1.
5. **CRITICAL**: Download the new `google-services.json` and replace it in `android/app/`.

### Step 2: Verify Google Cloud Console
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials).
2. Ensure there is an **OAuth 2.0 Client ID** of type "Android" for the Package Name `com.bhumiamartya.app` and the SHA-1 fingerprints mentioned above.

### Step 3: Deployment
1. After updating `google-services.json`, run `npm run android:sync`.
2. Bumping the version again to ensure a fresh deployment:
   - `versionCode 11`
   - `versionName 1.1.0`
3. Rebuild and upload the AAB.

## 6. Conclusion
The native code is correctly configured to use the legacy flow with the correct Web Client ID. The failure is happening at the Google Play Services handshake because the backend does not recognize the app's signature (likely the Play Store signing key).
