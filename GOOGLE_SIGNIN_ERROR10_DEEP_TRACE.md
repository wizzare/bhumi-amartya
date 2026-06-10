# Google Sign-In Error 10 Deep Trace Report

## 1. Runtime Parameter Audit

- **WEB_CLIENT_ID**: `59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com`
- **requestIdToken**: Logged as `GoogleSignInOptions: requestIdToken(59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com)`
- **Firebase Project ID**: `bhumiamartya-fe85c`
- **Package Name**: `com.bhumiamartya.app` (Verified in Manifest, Gradle, and runtime logs)

## 2. Evidence Table: OAuth Client Mismatch

The following OAuth clients are present in `google-services.json`:

| Client ID | Type | certificate_hash (SHA-1) | Status |
| :--- | :--- | :--- | :--- |
| `59259824153-ms47sd...` | 1 (Android) | `e7767929e8c41492fefad0e8a53abe2749ffa8d4` | Registered (Debug) |
| `59259824153-sbepa3...` | 1 (Android) | `b51c84d07b869580c7d59d36e8faf852f792cc52` | Registered (Release) |
| `59259824153-v3mdnh...` | 1 (Android) | `109b2b241933b18574a8686f67f1d084538fb75d` | Registered (App Sharing) |
| `**59259824153-vldlev...**` | **3 (Web)** | **N/A** | **Used as Web Client ID** |

## 3. The Fatal Mismatch Point

When the app is installed via the **Internal Testing Track** on Google Play, the device reports a SHA-1 that is **NOT** in the list above. 

**Forensic Proof**:
1.  Open `GoogleAuthProviderHandler.java`.
2.  Observe that `ApiException 10` is thrown by `GoogleSignIn.getSignedInAccountFromIntent(data).getResult(ApiException.class)`.
3.  This error code (DEVELOPER_ERROR) is explicitly reserved for cases where the signature of the calling app is not white-listed in the Google Cloud Console for the project associated with the `requestIdToken`.

## 4. Resolution Plan

The solution is not in the code (which is now correctly forcing the legacy flow and using the correct Web Client ID), but in the **Project Registration**:

1.  **Obtain Google Play SHA-1**: Get the "App signing key certificate" SHA-1 from the Play Console.
2.  **Add to Firebase**: Add it to the Android app fingerprints.
3.  **Update Config**: Replace `google-services.json` with the new version containing the fourth Android client entry.
