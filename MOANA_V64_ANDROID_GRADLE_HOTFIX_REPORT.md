# MOANA V64 Android Gradle Hotfix Report

## Timestamp

2026-07-01 11:33:14 +07:00

## Scope

Android native build configuration only.

No app source logic, Dashboard, Wellness, Journey, Billing, Badge, Subscription, Firestore Rules, Access logic, versionCode, versionName, AAB upload, or Play Console upload was changed.

## Root Cause

The final signed AAB build failed in native Android Gradle configuration because the project root Android Gradle Plugin was set to:

```gradle
classpath 'com.android.tools.build:gradle:9.2.1'
```

Capacitor Android plugin modules from the installed Capacitor 8 dependency set use Android Gradle Plugin `8.13.0` in their Android plugin build scripts.

This mismatch caused `:capacitor-filesystem` configuration to fail with:

```text
A problem occurred evaluating project ':capacitor-filesystem'.
> Failed to apply plugin 'kotlin-android'.
   > Cannot add extension with name 'kotlin', as there is an extension already registered with that name.
```

The follow-on compileSdk message appeared because plugin evaluation was already broken:

```text
project ':capacitor-filesystem' does not specify `compileSdk`
```

After aligning root AGP to `8.13.0`, that Capacitor Filesystem/Kotlin/compileSdk failure disappeared.

## Files Changed

| File | Change |
|---|---|
| `android/build.gradle` | Root Android Gradle Plugin changed from `9.2.1` to `8.13.0`. |

Diff:

```diff
-        classpath 'com.android.tools.build:gradle:9.2.1'
+        classpath 'com.android.tools.build:gradle:8.13.0'
```

## AndroidX / Signing Environment

The build also required local Android Gradle properties:

- `android.useAndroidX=true`
- local SDK path
- signing properties for the release keystore

These are present in local `android/gradle.properties`, but that file is ignored by `android/.gitignore` and contains signing secrets. It was copied only into the temporary build worktree for release build validation and was not committed.

## Exact Gradle Error Before

```text
FAILURE: Build completed with 2 failures.

1: Task failed with an exception.
-----------
* Where:
Build file 'C:\Users\shein\bhumi-amartya-clean\node_modules\@capacitor\filesystem\android\build.gradle' line: 29

* What went wrong:
A problem occurred evaluating project ':capacitor-filesystem'.
> Failed to apply plugin 'kotlin-android'.
   > Cannot add extension with name 'kotlin', as there is an extension already registered with that name.

2: Task failed with an exception.
-----------
* What went wrong:
A problem occurred configuring project ':capacitor-filesystem'.
> Android Gradle Plugin: project ':capacitor-filesystem' does not specify `compileSdk`
```

## Fix Applied

Minimal native Gradle config fix:

- Align root project Android Gradle Plugin to Capacitor plugin AGP version `8.13.0`.
- Do not upgrade Capacitor.
- Do not change app runtime behavior.
- Do not change release version metadata.

## TypeScript Result

PASS

Command:

```bash
npx tsc --noEmit
```

## Android Sync Result

PASS

Command:

```bash
npm run android:sync
```

Result:

```text
Copying web assets from out to android\app\src\main\assets\public
Found 8 Capacitor plugins for android
Sync finished
```

## Gradle Result

PASS

Command:

```bash
gradlew clean bundleRelease
```

Result:

```text
BUILD SUCCESSFUL in 1m 55s
423 actionable tasks: 422 executed, 1 up-to-date
```

Warnings:

- Gradle deprecation warnings for future Gradle 10 compatibility.
- Capacitor Filesystem Kotlin deprecation warnings.
- Java unchecked/deprecated API warnings in Capacitor dependencies.

None blocked AAB generation.

## AAB Verification

| Field | Value |
|---|---|
| AAB generated | YES |
| Absolute path | `C:\tmp\moana-v64-final-aab-9e597c4\android\app\build\outputs\bundle\release\app-release.aab` |
| Filename | `app-release.aab` |
| Size | `9,270,333 bytes` |
| Timestamp | `2026-07-01 11:33:14 +07:00` |

## Play Console

NOT UPLOADED

## Final Status

PASS

Signed Release AAB exists.
