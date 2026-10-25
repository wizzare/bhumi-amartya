# BHUMI ANDROID SIMPLE COMPILE SAFETY REVIEW
**Target Operation:** Windows Local Compile-Only (`:app:assembleDebug`) with Gradle `--offline`  
**Execution Context:** Disposable workspace at `C:\Users\shein\AppData\Local\Temp\opencode\host-offline-20261022\workspace`  
**Review Type:** Read-Only Static Script and Environment Safety Audit  
**Review Date:** October 2026  
**Status:** STRICT AUDIT COMPLETE — AWAITING EXPLICIT FOUNDER APPROVAL

---

## 1. Executive Summary

A comprehensive read-only audit was conducted on all Gradle build scripts, project configurations, plugin definitions, and the disposable workspace staging directory. The objective is to determine if running `gradlew.bat :app:assembleDebug --offline` inside the disposable workspace presents any network leakage, credentials exposure, or source repo contamination risks.

**Audit Verdict:** SAFE TO PROCEED UNDER STRICT OFFLINE INVOCATION.
- **No Outbound Network Sockets / Exec Scripts:** No custom Gradle tasks or plugins perform out-of-band socket connections or unauthorized process executions.
- **Gradle `--offline` Enforcement:** Strictly disallows outbound repository resolutions (Google, MavenCentral, Gradle Plugin Portal). Missing artifacts trigger immediate build termination instead of HTTP requests.
- **Gradle 9.4.1 & Toolchain Pre-cached:** Gradle wrapper 9.4.1 distribution binary, Foojay resolver convention plugin, AGP 9.2.1, Kotlin Gradle plugin, and JetBrains JDK 21 toolchain are already cached in `C:\Users\shein\.gradle`.
- **Zero Production Secrets:** Disposable workspace contains no `.env*`, keystores, or service account keys.
- **Source Repository Untouched:** `C:\tmp\bhumi-build106-recovery` is completely untouched.

---

## 2. Gradle Scripts & Plugin Evaluation

The following 15 Gradle files were reviewed:
1. `android/settings.gradle`:
   - Configures `org.gradle.toolchains.foojay-resolver-convention:0.10.0` (cached in Gradle user home).
   - Includes `:app`, `:capacitor-cordova-android-plugins`, and applies `capacitor.settings.gradle`.
2. `android/build.gradle`:
   - Repositories: `google()`, `mavenCentral()`.
   - Buildscript dependencies: `com.android.tools.build:gradle:9.2.1` and `com.google.gms:google-services:4.4.4` (both present in cache).
3. `android/app/build.gradle`:
   - `signingConfigs.release` conditional on env vars / `keystore.properties` (not used in `assembleDebug`).
   - Debug build: Ephemeral debug signing is handled by standard Android SDK debug keystore generation.
   - Suffix alignment: In staging workspace, `applicationIdSuffix ""` is cleanly aligned with `google-services.json` package `com.bhumiamartya.app`.
4. `android/capacitor.settings.gradle` & `android/app/capacitor.build.gradle`:
   - Standard Capacitor includes for 10 native plugins.
5. **10 Native Module `build.gradle` Files**:
   - `@capacitor/android`: AGP 8.13.0 classpath, conditional publish plugin gated behind `CAP_PUBLISH=="true"` (inactive).
   - `@capacitor-firebase/authentication`: Optional Google/Facebook deps gated behind properties (defaults false).
   - `@capacitor/app`: AGP 8.13.0 classpath, publish gated behind `CAP_PLUGIN_PUBLISH` (inactive).
   - `@capacitor/filesystem`: AGP 8.13.0, Kotlin plugin 2.2.20, `jvmToolchain(21)`.
   - `@capacitor/geolocation`: AGP 8.13.0, Kotlin plugin 2.2.20, `jvmToolchain(21)`.
   - `@capacitor/local-notifications`, `@capacitor/preferences`, `@capacitor/share`, `@capacitor/toast`, `capacitor-secure-storage-plugin`: AGP 8.13.0, clean standard configs.
6. **Gradle Wrapper & User Home**:
   - `android/gradle/wrapper/gradle-wrapper.properties`: Points to `gradle-9.4.1-bin.zip`. Verified present and extracted in `C:\Users\shein\.gradle\wrapper\dists\gradle-9.4.1-bin\arn2x92ynaizyzdaamcbpbhtj\gradle-9.4.1`.
   - User Home `C:\Users\shein\.gradle`: No `init.gradle`, no `init.d/` directory, no user `gradle.properties`.

---

## 3. Disposable Workspace Verification

Inspected `C:\Users\shein\AppData\Local\Temp\opencode\host-offline-20261022\workspace`:
- **10 Native Module Directories:** Verified all 10 present under `workspace/node_modules/`.
- **PLATFORM-02C Web Assets:** Verified present in `workspace/android/app/src/main/assets/public/` (44 files including `index.html`).
- **`google-services.json`:** Verified present in `workspace/android/app/google-services.json` (configured for package `com.bhumiamartya.app`).
- **`applicationIdSuffix` Removed:** Confirmed line 50 in `workspace/android/app/build.gradle` has `applicationIdSuffix ""` (and `versionNameSuffix ""` empty), matching `google-services.json`.

---

## 4. Credentials & PII Absence Audit

- **Environment / Secrets:** No `.env*` files exist anywhere in the disposable workspace.
- **Service Account Keys:** Zero Google Service Account JSON files found.
- **Keystores:** No `.jks` or `.p12` files exist. Neither release keystore nor `keystore.properties` is present.
- **Debug Keystore:** Ephemeral Android debug keystore generation will be used automatically by Gradle.

---

## 5. Source Repository Isolation

- Repository at `C:\tmp\bhumi-build106-recovery` was accessed strictly in read-only mode.
- Git worktree status in `C:\tmp\bhumi-build106-recovery` is completely unchanged.
- All compile operations and Gradle daemon outputs will execute exclusively inside the disposable workspace directory.

---

## 6. Residual Risk Assessment

| Risk Category | Level | Mitigation / Behavior |
| :--- | :--- | :--- |
| **Outbound Dependency Download** | NONE | `--offline` flag forces Gradle to resolve exclusively from local cache. Missing dependency triggers instant compile failure (`BUILD FAILED`), never an outbound request. |
| **Toolchain Download (Foojay)** | NONE | Foojay plugin cannot connect to foojay disco API when `--offline` is active; JetBrains JDK 21 is already provisioned in `C:\Users\shein\.gradle\jdks`. |
| **Out-of-band Exec / Scripting** | NONE | No custom shell `exec` tasks or analytic telemetry reporting in any module `build.gradle`. |
| **Daemon Leaks** | NONE | Daemon runs on loopback IPC only. `--offline` applies to daemon workers. |

---

## 7. Minimal Execution Plan (Pending Explicit Approval)

Once explicit Founder approval is received, execute the following single command in PowerShell:

```powershell
Set-Location -LiteralPath "C:\Users\shein\AppData\Local\Temp\opencode\host-offline-20261022\workspace\android" && .\gradlew.bat :app:assembleDebug --offline --stacktrace
```

*Note: Gradle daemon will compile using cached artifacts. If any artifact is missing, it will fail safely and cleanly without network access.*

---
**STOP AND WAIT FOR FOUNDER REVIEW.** No build execution has been performed.
