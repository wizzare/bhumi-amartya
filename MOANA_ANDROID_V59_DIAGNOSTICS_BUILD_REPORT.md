# MOANA Android v59 Diagnostics Build Report

## Timestamp

2026-06-28 23:01:07 +07:00

## Branch

`KARA_V3_WELLNESS_STABLE`

## Commit hash

`eac8065a0fe17e757432da360e665ecff1255a93`

## Version

- versionCode: `59`
- versionName: `3.1.12-RC`

## Diagnostics included

This is a diagnostics build only, not a fix candidate.

Included runtime diagnostics:

- Visible panel label: `MOANA v58 Runtime Diagnostics`
- localStorage key: `moana:v58:section4JourneyDiagnostics`
- Console prefix: `[MOANA_RUNTIME_DIAG]`
- Section 4 hub taps
- each practice save button
- shared save helper entry
- daily state write attempt/success/failure
- Journey record write attempt/success/failure
- practice result append attempt/success/failure
- post-save readback/progress count
- Journey read paths
- found practice logs
- raw practice types
- fallback reason

## Commands run

- `git status --short`
- `git rev-parse HEAD`
- `npx tsc --noEmit`
- `npm run build`
- `npm run android:sync`
- `cmd /c "set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr&& set PATH=%JAVA_HOME%\bin;%PATH%&& cd android&& gradlew clean bundleRelease"`
- `Copy-Item android\app\build\outputs\bundle\release\app-release.aab BHUMI-MOANA-v59-3.1.12-RC-diagnostics-section4-journey.aab`

## Build result

Build succeeded.

Notes:

- Initial Gradle run was blocked by sandbox network permissions while downloading the Gradle wrapper distribution.
- The same Gradle command was rerun with approved network access.
- Final Gradle result: `BUILD SUCCESSFUL`.
- Gradle emitted existing deprecation/plugin warnings only.

## AAB path

`C:\Users\shein\bhumi-amartya-clean\BHUMI-MOANA-v59-3.1.12-RC-diagnostics-section4-journey.aab`

## Founder test instructions

After v59 diagnostics build is uploaded/installed on Android:

1. Open app.

2. Open Wellness Section 4.

3. Tap all 7 flows:

   - Journaling
   - Meditasi
   - Yoga
   - Olahraga
   - Audio Healing
   - Healthy Food
   - Manifestasi Hari Ini

4. After each tap/save, observe diagnostics panel:

   `MOANA v58 Runtime Diagnostics`

5. Open Journey page.

6. Observe diagnostics panel/logs:

   - Journey userId
   - Journey dateKey
   - Journey read path
   - practice logs found
   - raw practice types
   - fallback reason

7. Capture:

   - screenshots of diagnostics panel
   - screenshots of Wellness progress
   - screenshots of Journey page
   - console logs if accessible

8. Send logs back before any new fix is attempted.

## Final status

DIAGNOSTICS AAB PREPARED / RUNTIME LOG CAPTURE REQUIRED

Do not mark fixed. Do not mark PASS. Do not proceed to fixing until founder sends Android runtime diagnostics.
