# MOANA V3 Release Build V64 Report

STATUS: PASS

Final status: READY FOR CLOSED TESTING BUILD

This is not READY FOR PRODUCTION. Runtime Android, Firebase Production, Billing Runtime, and Real User Verification remain separate post-upload stages.

## Billing Preparation Review

PASS

- `MOANA_BILLING_RUNTIME_ENABLED` remains `false`.
- `GOOGLE_PLAY_BILLING_ENABLED` remains `false`.
- Purchase verification returns `not_implemented` and does not unlock access.
- Restore purchase returns `not_implemented` and does not unlock access.
- Client does not write badge, membership, trial, accessUntil, subscriptionStatus, or entitlements.
- Fix implemented: `New User (3 Hari)` and trial membership access now require server-owned `trialEndsAt`; missing `trialEndsAt` is treated as expired.

## Subscription Preparation Review

PASS

- Badge categories remain limited to Founder, Penjaga Bhumi Inti, Penjaga Bhumi Alfa, Penjaga Bhumi, Tester 2 Bulan, Tester 1 Bulan, New User (3 Hari), and Expired.
- Access preparation remains badge-based.
- No new badge category was added.
- No Firestore data model change.

## Rating Preparation Review

PASS

- Rating helper is not wired to UI.
- No random prompt is active.
- Eligibility requires Journey >= 7 days, login >= 10, dashboard open >= 5, Refleksi read >= 3, actionable satisfaction, no recent prompt, and no recent blocking error.
- Positive users route to Google Play Review destination; negative users route to internal feedback destination.

## Version

Version Code: 64

Version Name: 3.2

Package Name: `com.bhumiamartya.app`

Firebase Project: `bhumiamartya-fe85c`

## Build Verification

TypeScript: PASS

Command:

```powershell
npx tsc --noEmit
```

Production Build: PASS

Command:

```powershell
npm run build
```

Summary:

- Next.js 16.2.6
- 72 static pages generated
- API routes compiled
- Dashboard, Journey, Innerwork, Wellness, Blueprint, Settings, and static legal pages compiled

Android Sync: PASS

Command:

```powershell
npm run android:sync
```

Summary:

- Web assets copied from `out` to `android/app/src/main/assets/public`
- 8 Capacitor plugins detected
- No billing runtime plugin added

Android Release: PASS

Command:

```powershell
.\gradlew.bat bundleRelease
```

Summary:

- Gradle BUILD SUCCESSFUL
- 410 actionable tasks: 46 executed, 364 up-to-date
- Signing validation passed
- Release bundle signed

Signed AAB: PASS

AAB Path:

```text
C:\Users\shein\bhumi-amartya-clean\android\app\build\outputs\bundle\release\app-release.aab
```

AAB Size: 9,735,058 bytes

APK Release: PASS

Command:

```powershell
.\gradlew.bat assembleRelease
```

Summary:

- Gradle BUILD SUCCESSFUL
- 437 actionable tasks: 37 executed, 400 up-to-date
- APK output metadata confirms versionCode 64 and versionName 3.2

APK Path:

```text
C:\Users\shein\bhumi-amartya-clean\android\app\build\outputs\apk\release\app-release.apk
```

APK Size: 9,949,880 bytes

## Files Changed

- `lib/billing/billingPreparation.ts`
- `MOANA_V3_BILLING_SUBS_RATING_PREP_REPORT.md`
- `android/app/build.gradle`
- `package.json`
- `package-lock.json`
- `RELEASE_METADATA.json`
- `MOANA_V3_RELEASE_BUILD_V64_REPORT.md`

Generated build artifacts:

- `android/app/build/outputs/bundle/release/app-release.aab`
- `android/app/build/outputs/apk/release/app-release.apk`
- Android generated build output under `android/app/build`

## Errors Fixed

- Trial preparation helper was too permissive when trial badge existed without server-owned `trialEndsAt`.
- Version metadata mismatch was fixed by setting Android `versionCode` to 64 and versionName to `3.2`.
- Build environment did not have `JAVA_HOME`; release build was run with Android Studio JBR for the Gradle command only.

## Warnings

- Gradle reported deprecated Android Gradle Plugin options that will be removed in AGP 10.
- Gradle reported `flatDir` repository warning.
- Gradle reported dependency constraint import performance warnings.
- Gradle reported obsolete variant API warnings from Capacitor plugin build logic.
- These warnings did not block signed AAB/APK generation.

## Regression Risk

LOW for runtime behavior.

- No Journey pipeline change.
- No Dashboard change.
- No Firestore Rules change.
- No data model change.
- No billing runtime activation.
- No purchase flow activation.
- No badge system change.

MEDIUM for release process only because versionName changed from `3.1.12-RC` to `3.2` and Android build artifacts were regenerated.

## Release Gate

- Billing/Subs/Rating preparation safe: PASS
- versionCode = 64: PASS
- versionName = 3.2: PASS
- TypeScript: PASS
- Production Build: PASS
- Android Release: PASS
- Signed AAB: PASS
- APK Release: PASS

READY FOR CLOSED TESTING BUILD
