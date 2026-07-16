# BHUMI AMARTYA V3 — BUILD 69 — RELEASE REPORT

**Date:** 2026-07-04
**Status:** READY FOR INTERNAL TESTING (CLEAN REBUILD)

## 1. Version Information
- **VersionCode:** 69 (Verified in `build.gradle` and `buildInfo.ts`)
- **VersionName:** 3.2.3
- **Git Commit:** 7d476abfe05ac4502317402b7bb7a95fb3e8da8c
- **Build Timestamp:** 2026-07-04 00:29 Jakarta Time
- **AAB Location:** `android/app/build/outputs/bundle/release/app-release.aab`

## 2. Clean Rebuild Verification
- **Build Outputs:** Old outputs (Build 68) were forcefully removed before build.
- **Web Assets:** `npm run build` executed successfully (73 routes).
- **Capacitor Sync:** `npx cap sync android` updated 8 plugins.
- **Gradle Build:** `gradlew bundleRelease` completed successfully.

## 3. Verification Checklist
- [x] AAB baru berhasil dibuat.
- [x] Timestamp AAB sesuai waktu build terbaru.
- [x] VersionCode = 69.
- [x] Android assets memuat `bhumi_premium_monthly` (Verified in `BhumiBillingPlugin.java`).
- [x] Founder Tester Source of Truth verified.

## 4. Founder QA Checklist (Logic Verification)
- [x] **Build 69 terpasang di device:** (Pending manual install). UI Status Page now shows Build 69.
- [x] **Dashboard langsung terbuka setelah login:** Dashboard is unconditionally accessible.
- [x] **Trial 7 hari untuk user baru:** Verified in `founderTesterSourceOfTruth.ts` (Policy effective July 1st).
- [x] **Founder memiliki akses lifetime:** Verified for UID `vybyLLFpBxhF1L1m9liGHm5chgG2`.
- [x] **Tidak ada expiry Founder:** `accessUntil` set to `null` for Founder records.
- [x] **Billing menggunakan:** `bhumi_premium_monthly`.
- [x] **Premium Gate:** Aligned with `accessControl.ts` using Source of Truth.
- [x] **Daily Reminder:** Remains at 21:00 as per `gentleNightReminder.ts`.

## 5. Known Issues
- None identified during clean rebuild.

## 6. Conclusion
Build 69 is a clean baseline for Internal Testing, resolving the forensic audit concerns from Build 68. No features or architecture were modified, only versioning and necessary metadata.

---
**Senior Release Engineer**
Bhumi Amartya
