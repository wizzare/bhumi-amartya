# MOANA V64 Dashboard Only Redesign Sprint Report

Date: 2026-07-01

## Scope

Dashboard only.

Explicitly held:
- Wellness Section 2 redesign
- Wellness Section 3 Today's Plan
- Checklist progress
- Journey checklist narrative
- Wellness recommendation matrix
- Section 4 save flow
- Journey save/readback pipeline
- AI Memory pipeline
- Billing, subscription, badge, access control, Firestore Rules
- versionCode, AAB rebuild, Play Console upload

## Files Reviewed

- `components/dashboard/DashboardClient.tsx`
- `components/dashboard/SoulReflectionCard.tsx`
- `components/dashboard/DailyUserFlowGuide.tsx`
- `components/dashboard/DailyNoteV2.tsx`
- `lib/prompts/dailyGuidancePrompt.ts`
- `lib/dailyGuidance/timeOfDayGreeting.ts`
- `MOANA_V3_EXECUTION_MODE.md`
- `PROJECT_CONTEXT.md`
- `SOURCE_OF_TRUTH_V1.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

## Files Changed

- `components/dashboard/DashboardClient.tsx`
- `components/dashboard/SoulReflectionCard.tsx`
- `components/dashboard/DailyUserFlowGuide.tsx`
- `lib/prompts/dailyGuidancePrompt.ts`
- `MOANA_V64_DASHBOARD_ONLY_REDIGNSPRINT_REPORT.md`

## Dashboard Order

Before:
1. Dashboard Header
2. Accuracy Upgrade Banner
3. Safety / Trial notices
4. Guardian / Founder card
5. Identitas Inti
6. Refleksi Jiwa
7. Astro Hari Ini
8. Catatan dari Bhumi untuk Kamu
9. Kondisi Lingkungan
10. Disarankan

After:
1. Dashboard Header
2. Safety / Trial notices
3. Guardian / Founder card
4. Refleksi Jiwa
5. Identitas Inti
6. Astro Hari Ini
7. Kondisi Lingkungan
8. Catatan dari Bhumi untuk Kamu
9. Disarankan
10. Accuracy Upgrade Banner

Note: Guardian / Founder card remains above Refleksi Jiwa per runtime screenshot correction.

## Refleksi Jiwa Changes

- Kept section format:
  - Refleksi Jiwa
  - Mirror
  - Membaca Jiwamu Hari Ini
- Removed expanded copy: `Renungkan perlahan.`
- Added dashboard formatter for old/cached guidance:
  - starts with `Halo {Nama User},`
  - second line uses current time greeting
  - shortens long reflection body
  - closes with `Peluk hangat dari Bhumi.`
- Updated daily guidance prompt contract:
  - 60-100 words
  - one paragraph only
  - warm, personal, gentle
  - no repeated meaning
  - no extra sentence after Bhumi closing

## Disarankan Changes

Removed:
- `Setelah membaca Home...`
- `Recommended Today`
- long CTA descriptions

Now renders only:
- Profil: `Lihat kembali blueprint dan identitasmu.`
- Wellness: `Lanjutkan praktik hari ini.`
- Journey: `Lihat perjalanan dan perkembanganmu.`

## Catatan Continuity

No new engine, pipeline, or architecture was created.

Current behavior is preserved. Dashboard still passes existing continuity context through the already existing daily guidance flow:
- Journey memory
- daily state
- previous daily state
- recent daily states
- previous guidance
- wellness mapping
- navigator state
- environment context

## Commands Run

`npx tsc --noEmit`

Result: PASS.

`npm run build`

Result: FAIL during Next.js page data collection for web route `/api/kenali-diri/aura`.

Observed build output:
- Production compile: PASS
- TypeScript inside build: PASS
- Failure point: collect page data
- Error: missing Firebase public environment variables: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`

This failure is not from Dashboard code. It is triggered by a web route requiring Firebase public env during build collection.

## Runtime / Browser Check

Runtime browser check completed using the active local dev server:

- URL: `http://localhost:3000/dashboard`
- Mode: existing development audit user (`bhumi_audit_user=widhi`)
- Viewport: Android-sized `393 x 852`
- Screenshot: `screenshots/dashboard-v64-android-final.png`

Runtime evidence:

- Refleksi Jiwa greeting: `Halo Widhi,`
- Time greeting: `Selamat malam.` at 02:17 local time
- Refleksi Jiwa word count: 66 words
- Refleksi Jiwa closing: `Peluk hangat dari Bhumi.`
- Forbidden strings found: none
  - no `Recommended Today`
  - no `Setelah membaca Home`
  - no `Renungkan perlahan.`
  - no `undefined`
  - no `null`
- Catatan Bhumi content: present
- Android horizontal overflow: false
- Document width: `393`
- Viewport width: `393`

Runtime order evidence from DOM text positions:

1. Founder / Guardian
2. Refleksi Jiwa
3. Identitas Inti
4. Astro Hari Ini
5. Kondisi Lingkungan
6. Catatan dari Bhumi untuk Kamu
7. Disarankan

Note: full-page screenshots from Playwright include the fixed bottom navigation at its initial viewport position. This is screenshot behavior for fixed elements, not horizontal overflow. The Android DOM width check passed.

## Untouched Systems Confirmation

Not touched in this dashboard-only pass:
- Wellness Section 2
- Wellness Section 3
- Section 4 save
- Journey save/readback pipeline
- AI Memory pipeline
- Billing
- Subscription
- Badge
- Access Control
- Firestore Rules
- versionCode
- AAB build/upload

## Final Status

Dashboard scope: COMPLETE.

TypeScript: PASS.

Build: BLOCKED by existing web-route Firebase public env requirement.

FINAL STATUS: NOT PASS for release gate, because `npm run build` did not pass.
