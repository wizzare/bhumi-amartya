# MOANA v59 Stale Content & Asset Packaging Investigation & Fix Report

## 1. Founder Observation
- **Observation:** Installed/uploaded build displayed `versionCode 59`, but app content still behaved and looked like v58 (missing MOANA v58 Runtime Diagnostics).
- **Impact:** Native Android versionCode was incremented to 59, but stale web assets were packaged inside the release AAB.

## 2. Root Cause
- Prior to creating the versionCode 59 release bundle, the web build (`npm run build`) and Capacitor sync (`npm run android:sync`) were either skipped or stale build artifacts were packaged by Gradle.
- The Android asset directory (`android/app/src/main/assets/public`) did not contain the compiled diagnostics bundle before explicit rebuild and resynchronization.

## 3. Diagnostics Strings Found in Source
- **Status:** YES
- **Locations:**
  - `components/debug/MoanaRuntimeDiagnosticsPanel.tsx` (`MOANA v58 Runtime Diagnostics`)
  - `lib/innerwork/moanaRuntimeDiagnostics.ts` (`moana:v58:section4JourneyDiagnostics`, `[MOANA_RUNTIME_DIAG]`)

## 4. Diagnostics Strings Found in Production Web Output
- **Status:** YES
- **Details:** Found in `out/_next/static/chunks/` after running `npm run build`.

## 5. Capacitor webDir Value
- **Configured `webDir`:** `'out'` (defined in `capacitor.config.ts`).

## 6. Whether webDir Matches Actual Build Output
- **Status:** YES
- **Details:** Next.js static export is configured with `output: 'export'` in `next.config.ts`, generating output directly into `./out`.

## 7. Diagnostics Strings Found in Android Assets After Sync
- **Status:** YES
- **Details:** Synchronized directly to `android/app/src/main/assets/public/_next/static/chunks/`.

## 8. Whether Android Assets Were Stale Before Fix
- **Status:** YES
- **Details:** `grep_search` confirmed that `MOANA v58 Runtime Diagnostics` was missing from `android/app/src/main/assets` prior to executing the fresh build and sync sequence.

## 9. Service Worker / Cache Risk
- **Status:** LOW / NONE
- **Details:** Inspection confirmed no service worker script (`sw.js` / Workbox / PWA cache worker) is active or registering offline cache intercepts in the web application.

## 10. Commands Run
```cmd
cmd /c "set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr&& set PATH=%JAVA_HOME%\bin;%PATH%&& npm run build&& npm run android:sync&& cd android&& gradlew clean bundleRelease"
```

## 11. Files Changed
- `android/app/build.gradle` (updated `versionCode` from 59 to 60 for clean release overwrite in Play Console).

## 12. Final versionCode / versionName
- **versionCode:** `60`
- **versionName:** `"3.1.12-RC"`

## 13. Final AAB Path
- `BHUMI-MOANA-v60-3.1.12-RC-diagnostics-assets-corrected.aab` (copied from `android/app/build/outputs/bundle/release/app-release.aab`).

## 14. Evidence That AAB Contains Diagnostics Strings
- **Verification:** The release AAB was extracted as a zip archive, and direct pattern searches confirmed the presence of:
  - `moana:v58:section4JourneyDiagnostics`
  - `[MOANA_RUNTIME_DIAG]`
  - `MOANA v58 Runtime Diagnostics`
  inside the packaged web asset bundles (`base/assets/public/_next/static/chunks/`).

## 15. Final Status
**ASSET PACKAGING FIXED / DIAGNOSTICS AAB READY**
