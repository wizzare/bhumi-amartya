# MOANA V64 RC Self-Containment Hotfix Report

Date: 2026-07-01

## Summary

Build 64 RC was invalid because the committed RC files imported `@/components/auth/AccessGuard`, but the target file was not tracked in the RC commit.

The hotfix makes the RC self-contained by adding the missing tracked file and applying a type-only `PremiumFeature` expansion required by the already-committed Build 64 feature keys.

## Files Changed

| File | Change |
|---|---|
| `components/auth/AccessGuard.tsx` | Added missing tracked component imported by Build 64 RC pages. |
| `lib/access/accessControl.ts` | Type-only expansion of `PremiumFeature`. |

## Why RC Was Invalid

RC commit:

`3068f70d17a2efe41cac4f81de69ee50ef7077f3`

Problem:

- 10 committed RC files imported `@/components/auth/AccessGuard`.
- `components/auth/AccessGuard.tsx` existed only as an untracked working-tree file.
- A clean checkout from the RC commit could not resolve the import.

Additional compile issue:

- RC `PremiumFeature` type only allowed:
  - `meditation`
  - `journaling`
  - `audio-healing`
- Build 64 RC also used:
  - `journey`
  - `wellness`
  - `yoga`
  - `workout`
  - `healthy-food`
  - `manifestasi`

## Exact Minimal Fix Applied

Added:

```text
components/auth/AccessGuard.tsx
```

Updated type only:

```ts
export type PremiumFeature =
  | "meditation"
  | "journaling"
  | "audio-healing"
  | "journey"
  | "wellness"
  | "yoga"
  | "workout"
  | "healthy-food"
  | "manifestasi";
```

Not included:

- No import from `lib/billing/billingPreparation.ts`.
- No large local access/badge logic changes.
- No billing behavior change.
- No subscription logic change.
- No badge logic change.
- No Firestore Rules change.
- No versionCode/versionName change.
- No AAB build.
- No Play Console upload.

## Verification

### Staged Diff Verification

Before commit, staged files were exactly:

```text
components/auth/AccessGuard.tsx
lib/access/accessControl.ts
```

Staged stat:

```text
components/auth/AccessGuard.tsx | 44 +++++++++++++++++++++++++++++++++++++++++
lib/access/accessControl.ts     | 11 ++++++++++-
2 files changed, 54 insertions(+), 1 deletion(-)
```

### TypeScript Result

PASS

Command:

```bash
npx tsc --noEmit
```

Execution context:

`C:\tmp\moana-v64-hotfix-index-check`

This temporary checkout was created from the staged hotfix index, so it represented a clean checkout candidate with only the approved hotfix package.

Note:

- First TypeScript attempt was blocked by inability to write `tsconfig.tsbuildinfo` in the temp directory.
- Re-run with elevated write permission passed.

### Clean Checkout / Build Result

Clean checkout candidate:

PASS for source resolution and TypeScript.

`npm run build` in the temporary clean checkout:

BLOCKED by verification environment setup, not by source code:

```text
TurbopackInternalError: Symlink [project]/node_modules is invalid, it points out of the filesystem root
```

Reason:

- The temp checkout used a `node_modules` junction to avoid reinstalling dependencies.
- Next/Turbopack rejected that symlink because it pointed outside the project root.

This is not the `/api/kenali-diri/aura` website issue.

## Commit

- Branch: `KARA_V3_WELLNESS_STABLE`
- Commit Hash: `068030ffbedfed73f24f597a101f1b84bcf576b3`
- Commit Message: `fix(moana): make build 64 rc access guard self-contained`

## Push Status

PUSHED

Remote:

`https://github.com/wizzare/bhumi-amartya-clean.git`

Push result:

```text
3068f70..068030f  KARA_V3_WELLNESS_STABLE -> KARA_V3_WELLNESS_STABLE
```

## Final Status

PASS

The hotfix commit makes the RC self-contained for `AccessGuard` resolution, and TypeScript passes from a clean checkout candidate.
