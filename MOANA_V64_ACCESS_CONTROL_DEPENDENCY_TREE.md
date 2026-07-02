# MOANA V64 Access Control Dependency Tree

Date: 2026-07-01

Mode: Audit only. No code, patch, commit, or staging change was performed.

RC commit:

`3068f70d17a2efe41cac4f81de69ee50ef7077f3`

## Result

Current RC is not self-contained.

The RC imports `@/components/auth/AccessGuard`, but the target file is not tracked in the RC commit. A clean clone fails TypeScript before Android build.

There is one additional compile-risk directly tied to AccessGuard: the RC `PremiumFeature` type does not include the feature keys used by the Build 64 RC pages.

## AccessGuard Dependency Tree

Current local file:

`components/auth/AccessGuard.tsx`

Status:

```text
?? components/auth/AccessGuard.tsx
```

Direct imports:

| Dependency | Source | RC Status | Working Tree Status | Needed For Compile |
|---|---|---|---|---|
| `react` | package dependency | Present via npm deps | Present | YES |
| `next/navigation` | Next.js package | Present via npm deps | Present | YES |
| `@/lib/access/accessControl` | `lib/access/accessControl.ts` | Tracked, but old type union | Tracked + modified | YES |
| `@/context/AuthContext` | `context/AuthContext.tsx` | Tracked | Tracked, no local status change | YES |

No evidence that `AccessGuard.tsx` is generated.

No evidence that `AccessGuard.tsx` is intentionally ignored:

`git check-ignore -v components/auth/AccessGuard.tsx` returned no match.

## RC Imports Of AccessGuard

These imports exist in the RC commit:

| File | Feature Prop |
|---|---|
| `app/innerwork/audio-healing/page.tsx` | `audio-healing` |
| `app/innerwork/herbal/page.tsx` | `healthy-food` |
| `app/innerwork/journaling/page.tsx` | `journaling` |
| `app/innerwork/manifestasi/page.tsx` | `manifestasi` |
| `app/innerwork/meditation/page.tsx` | `meditation` |
| `app/innerwork/workout/page.tsx` | `workout` |
| `app/innerwork/yoga/page.tsx` | `yoga` |
| `app/journey/page.tsx` | `journey` |
| `app/wellness/page.tsx` | `wellness` |
| `components/journey/details/JourneyDetailClient.tsx` | `journey` |

## Missing Tracked Files

| File | RC Commit | Working Tree | Reason It Is Required |
|---|---|---|---|
| `components/auth/AccessGuard.tsx` | Missing | Exists as untracked | Imported by 10 committed Build 64 RC files. |

Potentially related but not required for the minimal compile package:

| File | RC Commit | Working Tree | Why Not Minimal |
|---|---|---|---|
| `lib/billing/billingPreparation.ts` | Missing | Exists as untracked | Only becomes required if the current broader local `lib/access/accessControl.ts` or `lib/billing/accessControl.ts` changes are included. It is not imported by RC `lib/access/accessControl.ts`. |

## Modified Tracked Files In Access/Billing Area

These local changes are not in the RC commit:

| File | Status | Relationship To Compile | Risk |
|---|---|---|---|
| `lib/access/accessControl.ts` | Modified tracked | Direct dependency of `AccessGuard`; RC type union is too narrow for Build 64 feature props. | Contains more than type changes locally; current local version changes access logic and imports `billingPreparation`. |
| `lib/billing/accessControl.ts` | Modified tracked | Not a direct dependency of `AccessGuard`; broader access matrix work. | Changes FeatureKey/access behavior and imports `billingPreparation`. |
| `lib/billing/founderTesterSourceOfTruth.ts` | Modified tracked | Not needed for minimal AccessGuard compile fix unless broader membership grant flow is included. | Contains large source-of-truth/access grant changes. |
| `lib/billing/membershipGrant.ts` | Modified tracked | Not needed for AccessGuard compile fix. | Changes membership grant model and imports founder tester SoT. |
| `lib/auth/authActions.ts` | Modified tracked | Not needed for AccessGuard compile fix. | Auth behavior sensitive. |
| `lib/repositories/userRepository.ts` | Modified tracked | Not needed for AccessGuard compile fix. | User profile/access fields sensitive. |

## Type Changes

### RC `PremiumFeature`

In the RC commit:

```ts
export type PremiumFeature = "meditation" | "journaling" | "audio-healing";
```

### Feature Props Used By RC

The RC uses these `AccessGuard` feature values:

```text
audio-healing
healthy-food
journaling
manifestasi
meditation
workout
yoga
journey
wellness
```

### Missing Type Members

The RC `PremiumFeature` type is missing:

```text
healthy-food
manifestasi
workout
yoga
journey
wellness
```

Therefore, after adding `components/auth/AccessGuard.tsx`, TypeScript is expected to fail unless `PremiumFeature` is expanded.

## Enum / Feature Key Changes

There are two different feature typing surfaces:

### `lib/access/accessControl.ts`

Used by:

- `components/auth/AccessGuard.tsx`
- `components/auth/PremiumLock.tsx`

Current working tree expands `PremiumFeature` to:

```text
meditation
journaling
audio-healing
journey
wellness
yoga
workout
healthy-food
herbal
manifestasi
refleksi-jiwa
catatan-hari-ini
ai-memory
premium-content
dashboard
```

But the current local file also changes runtime access logic by importing `billingPreparation` and using badge-based access.

### `lib/billing/accessControl.ts`

Current working tree expands `FeatureKey` from:

```text
meditation
journaling
audioHealing
journey
weeklyReport
healingMemory
```

to include:

```text
wellness
yoga
workout
healthyFood
herbal
manifestasi
refleksiJiwa
catatanHariIni
premiumContent
dashboard
```

This is broader Access Matrix work and is not required to resolve the immediate RC self-containment compile failure from `AccessGuard`.

## Access Matrix / Billing Dependency Notes

The current working tree includes a broader access/billing dependency chain:

```text
lib/access/accessControl.ts
  -> lib/billing/billingPreparation.ts

lib/billing/accessControl.ts
  -> lib/billing/billingPreparation.ts

lib/billing/membershipGrant.ts
  -> lib/billing/founderTesterSourceOfTruth.ts
```

If the full current `lib/access/accessControl.ts` is included as-is, then `lib/billing/billingPreparation.ts` becomes another missing tracked dependency.

That would expand the hotfix from a self-containment compile fix into access/badge/billing behavior work.

## Why Working Tree Can Compile Further Than Clean RC

The local working tree has:

- `components/auth/AccessGuard.tsx` on disk as an untracked file.
- A modified `lib/access/accessControl.ts` whose `PremiumFeature` type includes Build 64 feature keys.

The clean RC checkout has:

- Imports to `@/components/auth/AccessGuard`.
- No `components/auth/AccessGuard.tsx`.
- A narrow `PremiumFeature` union with only three legacy keys.

So the working tree can resolve the import because the file exists locally, while the clean checkout cannot.

## Minimal Hotfix Package Recommendation

Recommend ONE minimal hotfix package:

1. Add the missing tracked file:

```text
components/auth/AccessGuard.tsx
```

2. Apply a type-only update to:

```text
lib/access/accessControl.ts
```

Required type-only change:

Expand `PremiumFeature` to include exactly the feature keys used by the committed RC `AccessGuard` calls:

```text
meditation
journaling
audio-healing
healthy-food
manifestasi
workout
yoga
journey
wellness
```

Important:

- Do not include the full current local `lib/access/accessControl.ts` diff unless Founder explicitly approves access/badge behavior changes.
- Do not include `lib/billing/billingPreparation.ts` in the minimal hotfix unless the broader badge-based access logic is approved.
- Do not include `lib/billing/accessControl.ts`, `lib/billing/membershipGrant.ts`, `lib/billing/founderTesterSourceOfTruth.ts`, `lib/auth/authActions.ts`, or `lib/repositories/userRepository.ts` for this minimal compile hotfix.

## Required Verification After Founder Approval

After the hotfix package is approved and applied:

1. `npx tsc --noEmit`
2. `npm run build`
3. `npm run android:sync`
4. Signed AAB build

Website-only `/api/kenali-diri/aura` or website Firebase env issues should remain classified as:

`Known Website Environment Issue — Out of Scope for Android Release`

## Final Status

RC INVALID (missing tracked dependency)
