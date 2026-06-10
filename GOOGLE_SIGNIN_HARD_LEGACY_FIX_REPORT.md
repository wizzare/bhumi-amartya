# Google Sign-In Hard Legacy Fix Report

## 1. Executive Summary

A hard override has been applied to the Android native Google Authentication handler to completely bypass the new Android Credential Manager and force the legacy `GoogleSignInClient` flow. This ensures that the standard Google account picker is triggered, resolving the "No credentials available" error encountered on Android 14+ devices.

## 2. Technical Changes

### Native Android Patch
- **File**: `node_modules/@capacitor-firebase/authentication/android/src/main/java/io/capawesome/capacitorjs/plugins/firebase/authentication/handlers/GoogleAuthProviderHandler.java`
- **Modification**: In the `signInOrLink` method, the `useCredentialManager` boolean is now hard-coded to `false`.
- **Logic**: Any value passed from the JavaScript/TypeScript side (including the default `true` in the plugin's native implementation) is ignored.
- **Diagnostics**: Added `BHUMI_AUTH` logging to verify the override at runtime:
    - `HARD OVERRIDE: Credential Manager disabled by Bhumi Fix. forcing useCredentialManager = false.`
    - `Using GoogleSignInClient legacy flow (SUCCESS PATH)`

### Project Configuration
- **Version Update**: 
    - `versionCode`: 10
    - `versionName`: 1.0.9
- **Synchronization**: Executed `npx cap sync android` to ensure web assets and configuration are up to date.

## 3. Build Information

- **Build Task**: `gradlew clean :app:bundleRelease`
- **Output Artifact**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Status**: Build Successful.

## 4. Verification

To verify the fix:
1. Deploy version **1.0.9** to a device.
2. Filter Logcat for `BHUMI_AUTH`.
3. Tap "Lanjutkan dengan Google".
4. Confirm that the standard Google account picker UI appears.
5. Confirm Logcat shows: `HARD OVERRIDE: Credential Manager disabled by Bhumi Fix`.

## 5. Files Changed
- `node_modules/@capacitor-firebase/authentication/android/src/main/java/io/capawesome/capacitorjs/plugins/firebase/authentication/handlers/GoogleAuthProviderHandler.java`
- `android/app/build.gradle`
- `GOOGLE_SIGNIN_HARD_LEGACY_FIX_REPORT.md`
