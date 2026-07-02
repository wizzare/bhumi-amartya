# MOANA V65 Final Release AAB Report

Date: 2026-07-01
Scope: Build only. No source code changes, no commits, no Cloud Function deploy, no Play Console upload.

## Final Status

PASS

A new signed Release AAB containing the Billing implementation was successfully generated.

## Pre-Build Verification

- Branch: `KARA_V3_WELLNESS_STABLE`
- HEAD / commit hash: `9e597c430c4cfdbacea0090a20e456ab41591073`
- `versionCode`: `65`
- `versionName`: `3.2.1`
- Previous release AAB observed before build:
  - Path: `C:\Users\shein\bhumi-amartya-clean\android\app\build\outputs\bundle\release\app-release.aab`
  - Timestamp: `2026-06-30 16:30:56 +07:00`

## Build Commands

- `npx tsc --noEmit`: PASS
- `npx cap sync android`: PASS
- `.\gradlew.bat :app:bundleRelease`: PASS

Gradle completed `:app:signReleaseBundle` and `:app:bundleRelease`.

## Release AAB

- Absolute path: `C:\Users\shein\bhumi-amartya-clean\android\app\build\outputs\bundle\release\app-release.aab`
- File size: `10,000,085` bytes
- Timestamp: `2026-07-01 17:30:14 +07:00`
- Timestamp ISO: `2026-07-01T17:30:14.0807479+07:00`

This timestamp is newer than the previous 11:33 build cutoff and newer than the previously observed release AAB.

## Billing Verification

Release manifest artifacts confirm Billing capability and Build 65 metadata:

- `android/app/build/intermediates/merged_manifests/release/processReleaseManifest/AndroidManifest.xml`
  - `android:versionCode="65"`
  - `android:versionName="3.2.1"`
  - `<uses-permission android:name="com.android.vending.BILLING" />`
- `android/app/build/intermediates/packaged_manifests/release/processReleaseManifestForPackage/AndroidManifest.xml`
  - `android:versionCode="65"`
  - `android:versionName="3.2.1"`
  - `<uses-permission android:name="com.android.vending.BILLING" />`

## Deployment Status

- Cloud Functions deployed: NO
- Play Console uploaded: NO
- Git commit created: NO

