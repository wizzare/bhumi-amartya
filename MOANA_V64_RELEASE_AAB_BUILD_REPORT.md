# MOANA V64 Release AAB Build Report

## Timestamp

2026-07-01 10:35:12 +07:00

## Source

- Branch: `KARA_V3_WELLNESS_STABLE`
- RC Commit Hash: `3068f70d17a2efe41cac4f81de69ee50ef7077f3`
- Commit Message: `release(moana): build 64 release candidate`
- Remote: `https://github.com/wizzare/bhumi-amartya-clean.git`
- Build worktree: `C:\tmp\moana-v64-rc-build`

## Git Verification

| Check | Result |
|---|---|
| Branch is `KARA_V3_WELLNESS_STABLE` | PASS |
| HEAD is RC commit `3068f70d17a2efe41cac4f81de69ee50ef7077f3` | PASS |
| Exact RC build isolation | PASS, clean temporary worktree created from RC commit |

Note: the main working tree contains unrelated local modified/untracked files, so the build was attempted from a clean temporary worktree at the RC commit.

## Android Version Metadata

Founder-approved version metadata was applied only in the temporary build worktree:

| Field | Value | Result |
|---|---|---|
| `versionCode` | `64` | PASS |
| `versionName` | `"3.2.0"` | PASS |

Application logic was not modified.

## TypeScript Result

FAIL

Command:

```bash
npx tsc --noEmit
```

Result:

```text
error TS5033: Could not write file 'C:/tmp/moana-v64-rc-build/tsconfig.tsbuildinfo': EPERM: operation not permitted, open 'C:\tmp\moana-v64-rc-build\tsconfig.tsbuildinfo'.
app/innerwork/audio-healing/page.tsx(8,29): error TS2307: Cannot find module '@/components/auth/AccessGuard' or its corresponding type declarations.
app/innerwork/herbal/page.tsx(6,29): error TS2307: Cannot find module '@/components/auth/AccessGuard' or its corresponding type declarations.
app/innerwork/journaling/page.tsx(43,29): error TS2307: Cannot find module '@/components/auth/AccessGuard' or its corresponding type declarations.
app/innerwork/manifestasi/page.tsx(8,29): error TS2307: Cannot find module '@/components/auth/AccessGuard' or its corresponding type declarations.
app/innerwork/meditation/page.tsx(6,29): error TS2307: Cannot find module '@/components/auth/AccessGuard' or its corresponding type declarations.
app/innerwork/workout/page.tsx(6,29): error TS2307: Cannot find module '@/components/auth/AccessGuard' or its corresponding type declarations.
app/innerwork/yoga/page.tsx(6,29): error TS2307: Cannot find module '@/components/auth/AccessGuard' or its corresponding type declarations.
app/journey/page.tsx(7,29): error TS2307: Cannot find module '@/components/auth/AccessGuard' or its corresponding type declarations.
app/wellness/page.tsx(4,29): error TS2307: Cannot find module '@/components/auth/AccessGuard' or its corresponding type declarations.
components/journey/details/JourneyDetailClient.tsx(7,29): error TS2307: Cannot find module '@/components/auth/AccessGuard' or its corresponding type declarations.
```

Root cause:

- The exact RC commit imports `@/components/auth/AccessGuard` in committed Build 64 files.
- `components/auth/AccessGuard.tsx` exists in the main working tree as an untracked local file.
- `components/auth/AccessGuard.tsx` does not exist in the clean RC worktree created from commit `3068f70d17a2efe41cac4f81de69ee50ef7077f3`.
- Therefore the exact RC commit cannot pass TypeScript as committed.

This is not the Website-only `/api/kenali-diri/aura` issue.

## npm Build Result

NOT RUN

Reason:

- Stopped after TypeScript failure, per release rule: FAIL if TypeScript fails.

Known Website Environment Issue:

- `/api/kenali-diri/aura` remains out of scope for MOANA Android.
- It was not the failure observed in this build attempt.

## Android Sync Result

NOT RUN

Reason:

- Stopped after TypeScript failure.

## Gradle bundleRelease Result

NOT RUN

Reason:

- Stopped after TypeScript failure.

Additional build environment note:

- The exact RC commit/worktree does not include `android/gradlew` or `android/gradlew.bat`.
- The RC worktree does include `android/gradle/wrapper/gradle-wrapper.jar` and `android/gradle/wrapper/gradle-wrapper.properties`.
- No Gradle bundle command was attempted because TypeScript had already failed.

## AAB Verification

| Field | Value |
|---|---|
| AAB path | NOT GENERATED |
| AAB size | N/A |
| AAB timestamp | N/A |

## Play Console Status

NOT UPLOADED

## Code Changes

- Application code changes: NONE
- Temporary build metadata change: `android/app/build.gradle` in `C:\tmp\moana-v64-rc-build` only
- Applied metadata: `versionCode 64`, `versionName "3.2.0"`
- No commit was created.
- No Play Console upload was performed.

## Final Status

FAIL

Reason:

- TypeScript failed on the exact RC worktree.
- Signed AAB was not generated.

Required next decision:

- Founder must decide whether `components/auth/AccessGuard.tsx` should be included in the RC commit or whether the committed imports should be changed.
- Because AccessGuard is a protected Access-control file, no fix was made automatically.
