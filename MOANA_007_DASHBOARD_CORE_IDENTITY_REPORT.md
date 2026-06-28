# MOANA-007 Dashboard Core Identity Regression Report

## 1. Ticket ID

MOANA-007 - Dashboard Core Identity Regression

## 2. Root Cause

Dashboard boot only hydrated missing Tzolkin, Vedic, and Human Design data. Older stored blueprints that did not contain `weton` or `bazi.dayMaster` reached `CoreIdentity` unchanged, so the dashboard rendered the component fallback for Weton and BaZi.

Dashboard formatting also passed full Tzolkin `kinName` directly to the compact identity card and displayed the generic `...` placeholder for missing values.

## 3. Files Reviewed

- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `components/dashboard/CoreIdentity.tsx`
- `components/dashboard/DashboardClient.tsx`
- `lib/mappers/userProfileMapper.ts`
- `lib/data/types.ts`
- `lib/types/blueprint.ts`
- `lib/weton/types.ts`
- `lib/weton/calculateWeton.ts`
- `lib/bazi/types.ts`
- `lib/bazi/calculateBazi.ts`
- `lib/tzolkin/types.ts`
- `lib/humandesign/hdAudit.ts`
- `lib/engines/generateBlueprint.ts`

## 4. Files Changed

- `components/dashboard/CoreIdentity.tsx`
- `components/dashboard/DashboardClient.tsx`
- `MOANA_007_DASHBOARD_CORE_IDENTITY_REPORT.md`

## 5. Data Flow Before

Dashboard loaded profile and blueprint from `storageProvider`. If the stored blueprint lacked Weton or BaZi, no dashboard hydration attempted to calculate them. `CoreIdentity` then received `undefined` values and rendered `...`.

Tzolkin displayed the stored or calculated `kinName` without compact dashboard formatting.

## 6. Data Flow After

Dashboard boot now hydrates missing Weton via `calculateWeton({ birthDate, birthTime })` and missing BaZi via `calculateBazi({ birthDate, birthTime, timezone })`. When hydration changes the blueprint, it saves through `blueprintRepository.saveUserBlueprint` and `storageProvider.saveUserBlueprint`, matching the existing dashboard hydration pattern.

Dashboard Tzolkin is formatted as compact seal plus kin number, for example `Ahau 260`. Verified `Manifesting Generator` is displayed as `ManGen`. Missing dashboard identity values render `Belum tersedia`, not `...`.

## 7. Android Real-Device QA

Not run in this environment.

## 8. App Restart/Readback Result

Not verified on Android real device. Static build verification passed, but MOANA PASS requires real-device close/reopen/readback.

## 9. Commands Run

- `Get-Content` on attached MOANA source-of-truth file
- `Get-ChildItem -Force`
- `git status --short`
- `Get-ChildItem -Path node_modules\next\dist\docs -Recurse -File`
- `rg -n "CoreIdentity|Identitas Inti|Weton|BaZi|Tzolkin|Manifesting Generator|Human Design" components app lib -g "*.tsx" -g "*.ts"`
- `Get-Content` on reviewed files listed above
- `npx tsc --noEmit`
- `npm run lint -- --max-warnings=0`
- `rg -n "\.\.\.|Manifesting Generator|kinName|baziDayMaster|calculateWeton|calculateBazi" components\dashboard\CoreIdentity.tsx components\dashboard\DashboardClient.tsx`
- `git diff -- components/dashboard/CoreIdentity.tsx components/dashboard/DashboardClient.tsx`
- `npm run build`

## 10. Artifact Path

`MOANA_007_DASHBOARD_CORE_IDENTITY_REPORT.md`

## 11. Final Status

PARTIAL

Reason: Code and production build are fixed, but Android real-device QA and app restart/readback proof have not been completed.
