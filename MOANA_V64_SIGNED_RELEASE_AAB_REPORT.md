# MOANA V64 Signed Release AAB Report

## Timestamp

2026-07-01 11:23:13 +07:00

## Branch

`KARA_V3_WELLNESS_STABLE`

## HEAD Commit

`9e597c430c4cfdbacea0090a20e456ab41591073`

## Build Worktree

`C:\tmp\moana-v64-final-aab-9e597c4`

Build was attempted from a clean temporary worktree at the official release HEAD because the main working tree contains unrelated local modified/untracked files.

## Version

- `versionCode 64`
- `versionName "3.2.0"`

## TypeScript

PASS

Command:

```bash
npx tsc --noEmit
```

## Web Assets

PASS

Command used:

```bash
npm run build -- --webpack
```

Notes:

- `npm run build` was needed because Capacitor sync requires the `out` web assets directory.
- `--webpack` was used because the temporary worktree used a `node_modules` junction and Turbopack rejects symlinks that point outside the project root.
- The first web build attempt without `.env.local` failed only on Website route `/api/kenali-diri/aura` due missing Firebase public environment variables. This is a Known Website Environment Issue and out of scope for Android release.
- After copying local `.env.local` into the temporary build worktree, web assets generated successfully.

Warnings:

```text
Critical dependency: the request of a dependency is an expression
Import trace includes:
./app/api/kenali-diri/aura/route.ts
```

This warning is Website-related and did not stop web asset generation.

## Android Sync

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

## Gradle bundleRelease

FAIL

Command:

```bash
gradlew clean bundleRelease
```

Java:

`C:\Program Files\Android\Android Studio\jbr`

Exact Gradle error:

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
> Android Gradle Plugin: project ':capacitor-filesystem' does not specify `compileSdk` in build.gradle (C:\Users\shein\bhumi-amartya-clean\node_modules\@capacitor\filesystem\android\build.gradle).
```

Additional context:

- `android\gradlew.bat` is not tracked in the release HEAD, so the local wrapper script was copied into the temporary worktree for build execution only.
- Gradle reached Android project configuration and failed inside the Capacitor Filesystem Android plugin before producing an AAB.
- This is an Android Gradle build failure, not a Website-only `/api/kenali-diri/aura` failure.

## AAB Verification

| Field | Value |
|---|---|
| AAB exists | NO |
| AAB path | `C:\tmp\moana-v64-final-aab-9e597c4\android\app\build\outputs\bundle\release\app-release.aab` |
| Filename | `app-release.aab` |
| Size | N/A |
| Timestamp | N/A |

## Play Console

NOT UPLOADED

## Final Status

FAIL

Reason:

Signed Release AAB was not generated because Gradle `bundleRelease` failed while configuring `:capacitor-filesystem`.
