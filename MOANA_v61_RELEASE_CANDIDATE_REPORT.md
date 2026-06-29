# MOANA v61 Release Candidate Report

## 1. Timestamp
`2026-06-29T09:37:00+07:00`

## 2. Branch
`KARA_V3_WELLNESS_STABLE`

## 3. Previous Commit Hash
`eac8065a0fe17e757432da360e665ecff1255a93`

## 4. New Commit Hash
`ee018286b34d87282adcabb42774e9d81a619a2b`

## 5. Version Code Before
`60`

## 6. Version Code After
`61`

## 7. Version Name
`3.1.12-RC`

## 8. Tickets Included
* **MOANA-v58-R1/R1D**: **PASS** — Firestore owner security rules deployed & live confirmed (*"Sudah ke-save dan muncul di Journey"*).
* **MOANA-v58-CLEANUP-1**: **PASS** — Runtime diagnostics panel dev-gated and hidden from production UI.
* **MOANA-v58-ENV-1**: **PASS** — Time-aware Mirror greetings and closings implemented across 4 sub-daily windows.
* **MOANA-v58-ENV-2**: **COMPLETE** — Environment influence mapping audit complete for Dashboard, Refleksi Jiwa, and Catatan Hari Ini.
* **MOANA-v58-ENV-3**: **PASS** — 6-hour environment window cache key (`envWindowKey`) and atmospheric prompt synthesis rules implemented.

## 9. Commands Run
* `npx tsc --noEmit` → **PASS** (Zero errors).
* `npm run build` → **PASS** (72 static pages compiled).
* `npm run android:sync` → **PASS** (Capacitor web assets synced in 1.11s).
* `cmd /c "set JAVA_HOME=...&& cd android&& gradlew bundleRelease"` → **PASS** (Build successful in 56s).

## 10. TypeScript Result
**PASS** — Clean compilation, 0 type errors.

## 11. Next.js Build Result
**PASS** — Compiled successfully, 72 static routes generated.

## 12. Android Sync Result
**PASS** — Web assets and config updated in `android/app/src/main/assets/public`.

## 13. AAB Build Result
**SUCCESSFUL** — Signed release bundle compiled cleanly.

## 14. AAB Path
`android/app/build/outputs/bundle/release/app-release.aab` (~9.74 MB).

## 15. Files Committed Summary
* Android build configuration (`android/app/build.gradle`)
* Firestore security rules (`firestore.rules`)
* Source logic & prompt updates (`lib/dailyGuidance/*`, `lib/prompts/*`, `components/*`, `app/*`)
* MOANA tickets & status verification reports (`MOANA_*.md`)

## 16. Files Excluded
* `.aab` / `.apk` binary artifacts
* Android build outputs and intermediate caches
* Keystore files and `.env` secrets
* IDE caches (`.idea/*`) and `tsconfig.tsbuildinfo`
* Scratch test scripts (`scratch_test_env1.js`, `scripts/test_*.js`, etc.)

## 17. Play Console Status
**NOT UPLOADED** (Pending explicit founder review and approval).

## 18. Final Status
**MOANA v61 Release AAB Candidate Prepared**
