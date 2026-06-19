# BHUMI AMARTYA V3 JOKER RELEASE BUILD

Build date: 2026-06-17
App version: 3.1.6
Android version: versionCode 46 / versionName 3.1.6

## 1. TypeScript Result

Command requested:

```text
npx tsc --noEmit
```

PowerShell blocked `npx.ps1` due local execution policy, so the equivalent Windows launcher was used:

```text
npx.cmd tsc --noEmit
```

Result: PASS

Errors: none

## 2. Build Result

Command requested:

```text
npm run build
```

PowerShell blocked `npm.ps1` due local execution policy, so the equivalent Windows launcher was used:

```text
npm.cmd run build
```

Result: PASS

Build output:

```text
Next.js 16.2.6 (Turbopack)
Creating an optimized production build ...
Compiled successfully in 4.9s
Running TypeScript ...
Finished TypeScript in 6.5s
Collecting page data using 19 workers ...
Generating static pages using 19 workers (109/109)
Finalizing page optimization ...
```

No build-time crashes.
No failed pages.
No missing imports reported by build.

## 3. Routes Generated

Required route checks:

| Area | Result | Evidence |
| --- | --- | --- |
| Dashboard routes | PASS | `/dashboard` generated, `out/dashboard/index.html` exists |
| Profile routes | PASS | `/profile`, `/profile/[section]`, `/profile/[section]/[insight]` generated |
| Innerwork routes | PASS | `/innerwork` and innerwork child routes generated |
| Admin/activity route | PASS | `/admin/activity` generated, `out/admin/activity/index.html` exists |
| Share Cards flow | PASS | Profile-integrated Share Cards flow is generated through `/profile`; no standalone `/share-cards` route is required |

Generated route summary from build:

```text
/
/_not-found
/admin
/admin/activity
/api/ai/daily-guidance
/api/humandesign/bodygraph
/api/humandesign/calculate
/bantuan
/blueprint
/changelog
/dashboard
/healing
/healing/audio
/healing/meditation
/innerwork
/innerwork/audio-healing
/innerwork/herbal
/innerwork/journaling
/innerwork/manifestasi
/innerwork/meditation
/innerwork/workout
/innerwork/yoga
/insights
/journal
/journey
/journey/[id]
/kebijakan-privasi
/kontak
/login
/meditation
/onboarding
/profile
/profile/[section]
/profile/[section]/[insight]
/reports/weekly
/roadmap
/settings
/setup
/status
/syarat-ketentuan
/tentang
/test
/upgrade
/wellness-assessment
```

## 4. Warnings Found

Build warnings: none.

Shell warnings:

```text
npx.ps1 cannot be loaded because running scripts is disabled on this system.
npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Both commands were rerun successfully through `npx.cmd` and `npm.cmd`.

## 5. Errors Found

TypeScript errors: none.

Build errors: none.

Share Cards route clarification:

```text
No standalone /share-cards route is required for V3 Joker.
The Share Cards check is satisfied by the Profile-integrated Share Cards flow.
```

The latest Share Cards flow is included inside the Profile route via:

```text
app/profile/page.tsx
components/ui/ShareCard.tsx
lib/profile/dailyShareCardEngine.ts
lib/profile/gaia/selectors.ts
```

## 6. Release Readiness

APK readiness checks:

| Requirement | Result | Evidence |
| --- | --- | --- |
| VersionChecker included | PASS | `app/layout.tsx` imports and mounts `components/global/VersionChecker.tsx` |
| Founder Activity Monitor included | PASS | `/admin/activity` generated; page title contains `Founder Activity Monitor` |
| Share Cards latest flow included | PASS | `app/profile/page.tsx` renders `ShareCard` with GAIA share-safe insights |
| Profile Narrative Framework included | PASS | Profile routes generated and GAIA narrative fields are present in profile synthesis/selectors |

Release tag:

```text
BHUMI AMARTYA
V3 JOKER
RELEASE BUILD
```

Decision: READY FOR APK BUILD

Reason: TypeScript passes, production build passes, static page generation completed `109/109`, no failed pages were reported, and the Share Cards requirement is satisfied by the Profile-integrated flow. No standalone `/share-cards` route is required.
