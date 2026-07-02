# MOANA V64 RC Self-Containment Audit

Date: 2026-07-01

RC commit audited:

`3068f70d17a2efe41cac4f81de69ee50ef7077f3`

Failure observed:

`Cannot find module '@/components/auth/AccessGuard' or its corresponding type declarations.`

## Summary

The RC commit is not self-contained.

Committed Build 64 files import `@/components/auth/AccessGuard`, but `components/auth/AccessGuard.tsx` is not tracked and is not present in the clean RC commit.

The file exists only in the current local working tree as an untracked file:

```text
?? components/auth/AccessGuard.tsx
```

## Import Audit

### Imports Present In RC Commit

`git grep -n "@/components/auth/AccessGuard" 3068f70d17a2efe41cac4f81de69ee50ef7077f3`

| File | Line | Import |
|---|---:|---|
| `app/innerwork/audio-healing/page.tsx` | 8 | `@/components/auth/AccessGuard` |
| `app/innerwork/herbal/page.tsx` | 6 | `@/components/auth/AccessGuard` |
| `app/innerwork/journaling/page.tsx` | 43 | `@/components/auth/AccessGuard` |
| `app/innerwork/manifestasi/page.tsx` | 8 | `@/components/auth/AccessGuard` |
| `app/innerwork/meditation/page.tsx` | 6 | `@/components/auth/AccessGuard` |
| `app/innerwork/workout/page.tsx` | 6 | `@/components/auth/AccessGuard` |
| `app/innerwork/yoga/page.tsx` | 6 | `@/components/auth/AccessGuard` |
| `app/journey/page.tsx` | 7 | `@/components/auth/AccessGuard` |
| `app/wellness/page.tsx` | 4 | `@/components/auth/AccessGuard` |
| `components/journey/details/JourneyDetailClient.tsx` | 7 | `@/components/auth/AccessGuard` |

### Additional Imports In Current Working Tree

The current dirty working tree also contains these AccessGuard imports in files that were not part of the approved RC commit:

| File | Scope |
|---|---|
| `app/healing/page.tsx` | Founder Review / not RC |
| `app/healing/meditation/page.tsx` | Founder Review / not RC |
| `app/healing/audio/page.tsx` | Founder Review / not RC |
| `app/journal/page.tsx` | Founder Review / not RC |
| `app/meditation/page.tsx` | Founder Review / not RC |

## RC Commit Vs Current Working Tree

### `components/auth/AccessGuard.tsx`

| Check | RC Commit | Current Working Tree |
|---|---|---|
| File exists | NO | YES |
| Git tracked | NO | NO |
| Git status | Missing from commit | `?? components/auth/AccessGuard.tsx` |
| Ignored by `.gitignore` | NO evidence | `git check-ignore` returned no match |
| History | No commits found for this path | Local untracked file only |

Evidence:

```text
fatal: path 'components/auth/AccessGuard.tsx' exists on disk, but not in '3068f70d17a2efe41cac4f81de69ee50ef7077f3'
```

## Determination

| Question | Answer | Evidence |
|---|---|---|
| Was the file forgotten from git? | YES | It exists locally but `git ls-files components/auth/AccessGuard.tsx` returns nothing. |
| Was it accidentally excluded? | YES | It was classified as `FOUNDER REVIEW` in `MOANA_V64_RELEASE_CANDIDATE_FILELIST.md` and therefore excluded from the RC staging command. |
| Was it renamed? | NO evidence | No other tracked `AccessGuard` implementation exists in `app`, `components`, or `lib`. |
| Was import path changed? | The committed imports point to `@/components/auth/AccessGuard`; that path matches the local untracked file. | RC imports use the same alias path. |
| Is it generated? | NO evidence | It is a normal source file under `components/auth`. |
| Is it intentionally untracked? | No evidence of intentional ignore. | `git check-ignore -v components/auth/AccessGuard.tsx` returned no match. |

## Why Local Working Tree Can Resolve It

The local working tree can resolve the import because `components/auth/AccessGuard.tsx` exists on disk even though it is untracked.

The clean RC checkout cannot resolve it because Git does not know about that file, so a clean checkout from commit `3068f70d17a2efe41cac4f81de69ee50ef7077f3` does not contain it.

There is also a related type-safety concern:

- Local `components/auth/AccessGuard.tsx` imports `PremiumFeature` from `@/lib/access/accessControl`.
- In the RC commit, `PremiumFeature` is only:

```ts
export type PremiumFeature = "meditation" | "journaling" | "audio-healing";
```

- Current local `lib/access/accessControl.ts` is modified and expands `PremiumFeature` to include Build 64 feature keys such as `journey`, `wellness`, `yoga`, `workout`, `healthy-food`, `manifestasi`, and others.
- Therefore, adding only `AccessGuard.tsx` may reveal a second TypeScript blocker if the RC access-control type union remains unchanged.

This related access-control file was also excluded from RC as Founder Review / protected scope.

## Staging History Root Cause

`components/auth/AccessGuard.tsx` was listed in:

- `MOANA_V64_RELEASE_CANDIDATE_FILELIST.md` as `FOUNDER REVIEW`
- `MOANA_V64_FINAL_RC_STAGING_RECOMMENDATION.md` as requiring Founder decision

It was not included in the final approved SECTION A staging command.

However, the final RC commit did include files that depend on it.

Result:

- Dependency import committed.
- Dependency implementation not committed.
- RC is not reproducible from clean checkout.

## Recommendation

If `AccessGuard` should belong to Build 64, create a Hotfix RC commit after Founder approval.

Minimum hotfix candidate:

```text
components/auth/AccessGuard.tsx
```

Required verification after staging the missing file:

1. Run `npx tsc --noEmit`.
2. If TypeScript then fails on `PremiumFeature` values, Founder must decide whether to approve the minimal required access type update in `lib/access/accessControl.ts`.
3. Because AccessGuard and access-control typing are protected Access domain files, do not patch or commit automatically.

Do not recreate the file manually. Use the existing local file only if Founder explicitly approves it for the hotfix.

## Final Status

RC INVALID (missing tracked dependency)
