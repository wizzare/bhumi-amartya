# Google Sign-In Native Source Trace

## 1. Investigation Summary

- **Plugin Used**: `@capacitor-firebase/authentication` (version 8.2.0).
- **Exact Native Source**: `node_modules/@capacitor-firebase/authentication/android/src/main/java/io/capawesome/capacitorjs/plugins/firebase/authentication/handlers/GoogleAuthProviderHandler.java`
- **Error Mapping**: The "No credentials available" message originates from `androidx.credentials.exceptions.GetCredentialException` (specifically `TYPE_NO_CREDENTIAL`).
- **Control Flow**:
    - The TypeScript side (`lib/auth/authActions.ts`) calls `signInWithGoogle` with `useCredentialManager: false`.
    - The Native side (`GoogleAuthProviderHandler.java`) receives this flag in `signInOrLink(PluginCall call, boolean isLink)`.
    - **Current Logic**: If `useCredentialManager` is `false`, it **skips** `CredentialManager` and uses `GoogleSignInClient` (Legacy Flow).

## 2. Root Cause Analysis of "No credentials available"

If the user is seeing "No credentials available" while `useCredentialManager: false` is set in TypeScript, it implies one of the following:

1.  **Stale Native Code**: The native plugin in `node_modules` might not have been rebuilt into the APK/AAB after the `useCredentialManager: false` change was made in the TS side.
2.  **JS/Native Desync**: The `FirebaseAuthentication` object in JS might not be passing the `useCredentialManager` flag correctly to the native side if the plugin version is mismatched.
3.  **Credential Manager Override**: Some Android 14+ devices might be forcing `CredentialManager` even when the legacy intent is requested, OR the "No credentials available" message is actually coming from the `GoogleSignInClient`'s result handling (though unlikely, as `GoogleSignInClient` usually returns `ApiException` codes like 10 or 12500).

## 3. Native Tracing & Diagnostic Patch

I have applied a diagnostic patch with the tag `BHUMI_AUTH` to `GoogleAuthProviderHandler.java`:

### Changes Applied:
- **Forced Legacy Log**: Added `Log.d("BHUMI_AUTH", "Using GoogleSignInClient (Legacy Flow Force-Invoked)")` when `useCredentialManager` is false.
- **Enhanced Error Logging**: Added `Log.e("BHUMI_AUTH", ...)` with full stacktrace and exception type in `handleGetCredentialError`.
- **System Stats**: Logging `webClientId`, `Package Name`, and `Google Play Services Availability` on every sign-in attempt.

## 4. Verification Steps for Developer

1.  **Run with Logcat**:
    `adb logcat -s BHUMI_AUTH FirebaseAuthentication`
2.  **Verify Flow**:
    Check if "Using Credential Manager" or "Using GoogleSignInClient (Legacy Flow Force-Invoked)" appears.
3.  **Check for "No credentials available" source**:
    If it appears under "Credential Manager Error", then `useCredentialManager: false` is NOT reaching the native code.
    If it appears but the log says "Using GoogleSignInClient", then the error message is being misreported or coming from the legacy result.

## 5. Recommended Fix (If flag is ignored)

If Logcat shows "Using Credential Manager" despite the JS change:
1.  Verify `capacitor.settings.gradle` points to the correct `node_modules` path (Confirmed: it does).
2.  Perform a clean build:
    - `npx cap sync android`
    - `./gradlew clean` in `android/`
    - Rebuild APK.

## 6. Files Changed
- `node_modules/@capacitor-firebase/authentication/android/src/main/java/io/capawesome/capacitorjs/plugins/firebase/authentication/handlers/GoogleAuthProviderHandler.java`
- `GOOGLE_SIGNIN_NATIVE_SOURCE_TRACE.md` (This file)
