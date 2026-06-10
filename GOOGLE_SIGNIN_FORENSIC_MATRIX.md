# Forensic Matrix: Google Sign-In Error 10

## 1. OAuth Configuration Matrix

| Artifact | SHA-1 Fingerprint | OAuth Client ID | In Firebase? | In `google-services.json`? | Used by App? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Debug Keystore** | `E7:76:79:29:E8:C4:14:92:FE:FA:D0:E8:A5:3A:BE:27:49:FF:A8:D4` | `...-ms47sd...` | ✅ Yes | ✅ Yes | No (Local Debug) |
| **Release Keystore (Local)** | `B5:1C:84:D0:7B:86:95:80:C7:D5:9D:36:E8:FA:F8:52:F7:92:CC:52` | `...-sbepa3...` | ✅ Yes | ✅ Yes | No (Local Build) |
| **Internal App Sharing** | `10:9B:2B:24:19:33:B1:85:74:A8:68:6F:67:F1:D0:84:53:8F:B7:5D` | `...-v3mdnh...` | ✅ Yes | ✅ Yes | Maybe (Specific build) |
| **Play Store App Signing** | **UNKNOWN / MISSING** | **None** | ❌ No | ❌ No | **YES (Internal Testing Track)** |

## 2. Core Parameter Audit

- **Package Name**: `com.bhumiamartya.app` (Verified in Manifest, Gradle, and JSON).
- **Web Client ID (Used)**: `59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com`
- **Web Client ID (Type)**: `client_type: 3` (Confirmed in `google-services.json`).
- **Alternate Web Client ID**: `59259824153-lf1aej0rshgaidnvs209671sg42efnp3.apps.googleusercontent.com` (AppInvite).

## 3. Evidence-Based Mismatch Report

The fact that the **Google Account Picker appears** proves that the `requestIdToken(WEB_CLIENT_ID)` was accepted by the OS and matched a valid project.

The fact that it returns **Error 10 (DEVELOPER_ERROR)** *after* selection means the specific signature of the app currently running on the device is **not authorized** to use that `WEB_CLIENT_ID` for authentication.

### Why does this happen?
When an app is uploaded to the **Google Play Store (Internal Testing)**, Google Play **strips** your local signature (`B5:1C...`) and **re-signs** the app with the **App Signing Key** managed by Google.

### The Proof:
The current `google-services.json` (and your Firebase fingerprints list) **does not contain the App Signing Key SHA-1**. Since this is the key used by the app installed from the Internal Testing track, the handshake fails with Error 10.

## 4. Required Action to Solve Error 10

1.  **Extract the True SHA-1**:
    Go to **Google Play Console** > **Setup** > **App Integrity** > **App Signing**.
2.  **Verify Fingerprint**:
    Copy the **SHA-1 fingerprint** from the "App signing key certificate" section. Compare it to the list in Section 1. It will be different from all three.
3.  **Update Firebase**:
    Add this new SHA-1 to the Android App in the **Firebase Console**.
4.  **Sync**:
    Download the new `google-services.json`, replace it in `android/app/`, and rebuild.

## 5. Secondary Verification (Google Cloud Console)
Ensure the **OAuth Consent Screen** is not in "Testing" mode without your test account being added. If it is in "Production", ensure it's not "Internal" only.
