# Root Cause Report: Google Sign-In "No credentials available"

## A. Root Cause Analysis

### 1. Hardcoded Resource Dependency
The Capacitor Firebase Authentication plugin on Android was strictly dependent on the `default_web_client_id` string resource. If this resource was missing or mismatched in the production environment, the Credential Manager would fail to find "available" credentials because it didn't know which server client ID to authorize against.

### 2. Lack of JS Override
The plugin version used (8.2.0) did not support passing `webClientId` as an option in the `signInWithGoogle` method on the Java side, even though it was present in some parts of the TypeScript interface.

### 3. Credential Manager Filtering
Android 14+ uses the new Credential Manager. By default, it can filter for "authorized accounts" (accounts that have logged in before). If the setup is inconsistent, it might return "No credentials available" instead of showing the account picker.

## B. Fix Implemented

### 1. Native Plugin Patch
Modified `GoogleAuthProviderHandler.java` to:
- **Accept `webClientId` from JavaScript**: The plugin now checks for a `webClientId` string in the call options.
- **Log Parameters**: Added `Log.d` entries to capture the `webClientId` and `useCredentialManager` state in Logcat for easier debugging.
- **Explicit Filtering**: Confirmed and reinforced `.setFilterByAuthorizedAccounts(false)` to force the account picker to appear even for first-time users.
- **Fallback Logic**: If no `webClientId` is passed from JS, it still falls back to the resource, ensuring backward compatibility.

### 2. TypeScript Update
Updated `lib/auth/authActions.ts` to:
- Explicitly pass the **Web Client ID** (`59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com`) in the native request.
- Force `useCredentialManager: true` to use the patched logic.

## C. Verification Steps
1.  **Build Version**: `1.0.6` (versionCode `7`).
2.  **Plugin Modified**: `@capacitor-firebase/authentication` (Java files patched).
3.  **AAB Path**: `android/app/build/outputs/bundle/release/app-release.aab`.

**Next Step**: Upload Version 1.0.6 to Google Play Internal Testing. The account picker should now appear correctly.
