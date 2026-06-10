# Forensic Report: Google Sign-In "No credentials available"

## A. Root Cause Analysis

### 1. Signature Mismatch (Confidence: 95%)
The app is currently configured with three SHA-1 fingerprints:
1. **Debug**: `e776...`
2. **Local Release**: `b51c...`
3. **Internal App Sharing**: `109b...`

**The missing piece:** If the app was installed via **Internal Testing** track as an AAB, Google Play applies the **App Signing Key**. This key is unique to the Play Store and is DIFFERENT from your local release key. Credential Manager returns "No credentials available" if the calling app's signature is not associated with the `webClientId` in the Google Cloud/Firebase project.

### 2. Potential Web Client ID Ambiguity (Confidence: 40%)
There are two Web Client IDs in the project:
1. `...-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com` (Used)
2. `...-lf1aej0rshgaidnvs209671sg42efnp3.apps.googleusercontent.com` (AppInvite)

While the first one is the standard choice, if the Firebase project was migrated or has multiple configurations, the second one might be the intended "Server Client ID" for the Android app.

---

## B. Audit Evidence

| Category | Value | Source |
| :--- | :--- | :--- |
| **Active Web Client ID** | `...-vldlev9s91l6sss3ulqbh8mnaah4n4c9...` | `authActions.ts`, `google-services.json` |
| **Android Package Name** | `com.bhumiamartya.app` | `build.gradle`, `google-services.json` |
| **Registered Fingerprints** | Debug, Release, Internal App Sharing | `google-services.json` |
| **Native Implementation** | Patched to accept JS Client ID | `GoogleAuthProviderHandler.java` |

---

## C. Recommended Action Plan

### Step 1: Add the "App Signing Key" SHA-1 (CRITICAL)
1. Go to **Google Play Console** > **Setup** > **App Integrity**.
2. Copy the **SHA-1 certificate fingerprint** from the "App signing key certificate" section.
3. Add this fingerprint to your Android App in the **Firebase Console**.
4. Download the updated `google-services.json` and replace it in the project.

### Step 2: Try the Alternative Web Client ID
If Step 1 is done and fails, change the `WEB_CLIENT_ID` in `lib/auth/authActions.ts` to:
`59259824153-lf1aej0rshgaidnvs209671sg42efnp3.apps.googleusercontent.com`

### Step 3: Test with `useCredentialManager: false`
If Credential Manager continues to fail with "No credentials available", it may be due to an issue with the device's Google Play Services version. Force the legacy flow by changing `useCredentialManager` to `false` in the `signInWithGoogle` call in `authActions.ts`.

---

## D. Code Changes Applied
- **Enhanced Native Logging**: Modified `GoogleAuthProviderHandler.java` to return the specific `exception.getType()` and a "Likely SHA-1 mismatch" hint if the message contains "No credentials available".
- **Trace Document**: Created `AUTH_TRACE_REPORT.md` for continuous value tracking.
