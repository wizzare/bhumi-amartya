# BHUMI POST-RELEASE JULY 1 BADGE RULES VERIFICATION

## 1. Timestamp

- Audit timestamp: 2026-06-29 12:13:20 +07:00
- Audit type: read-only verification
- Important context: this audit reflects the current local working tree, which already contains the Access Hotfix-1 changes. No implementation, deletion, Firestore deployment, AAB rebuild, or Play Console upload was performed for this report.

## 2. Branch

- Branch: `KARA_V3_WELLNESS_STABLE`

## 3. Commit Hash

- HEAD: `c5087f47128621fb04d3d8051f197cafa1c7cd14`

## 4. Files Searched

Primary files reviewed:

- `lib/billing/founderTesterSourceOfTruth.ts`
- `lib/billing/membershipGrant.ts`
- `lib/constants/membership.ts`
- `lib/billing/membershipLogic.ts`
- `lib/billing/accessControl.ts`
- `lib/access/accessControl.ts`
- `lib/billing/googlePlayBilling.ts`
- `context/AuthContext.tsx`
- `lib/auth/authActions.ts`
- `lib/auth/getUserRole.ts`
- `lib/auth/privilegedUser.ts`
- `lib/repositories/userRepository.ts`
- `lib/repositories/adminRepository.ts`
- `lib/firebase/service.ts`
- `firestore.rules`
- `components/auth/PremiumLock.tsx`
- `components/billing/FeatureLocked.tsx`
- `components/billing/WellnessLock.tsx`
- `components/dashboard/DashboardClient.tsx`
- `components/dashboard/GuardianIdentityCard.tsx`
- `app/settings/page.tsx`
- `app/journal/page.tsx`
- `app/innerwork/journaling/page.tsx`
- `app/meditation/page.tsx`
- `app/innerwork/meditation/page.tsx`
- `app/healing/audio/page.tsx`
- `app/innerwork/audio-healing/page.tsx`
- `app/reports/weekly/page.tsx`
- `docs/TRIAL_SYSTEM_QA.md`
- `docs/BHUMI_V3_GAIA_CURRENT_PAGE_STRUCTURE.md`
- `docs/PLAY_STORE_INTERNAL_TESTING_PLAN.md`

Search terms included:

- `Founder`
- `Penjaga Bhumi`
- `Penjaga Bhumi Inti`
- `Penjaga Bhumi Alfa`
- `July 1`
- `1 Juli`
- `badge`
- `testerBadge`
- `guardianBadge`
- `recognitionTier`
- `membership`
- `membershipType`
- `memberType`
- `plan`
- `trial`
- `premium`
- `entitlement`
- `access`
- `billing`
- `subscription`
- `PremiumLock`
- `FeatureLocked`
- `hasFeatureAccess`

## 5. Existing July 1 Rules Found

The clearest July 1 source is `lib/billing/founderTesterSourceOfTruth.ts`.

Found policy marker:

- `DEFAULT_USER_POLICY_EFFECTIVE_AT = new Date("2026-07-01T00:00:00+07:00")`
- `shouldApplyDefaultRegistrationPolicy(createdAt)` returns true for users created on or after July 1, 2026.

Found badge and membership source-of-truth categories:

- `Founder`
- `Penjaga Bhumi Inti`
- `Penjaga Bhumi Alfa`
- `Penjaga Bhumi`

Found membership categories:

- `LIFETIME_PREMIUM`
- `PREMIUM_2_MONTHS`
- `PREMIUM_1_MONTH`
- `REGULAR_TRIAL`

However, the current local runtime does not actively apply these rules. `lib/billing/membershipLogic.ts` currently returns the profile unchanged:

```ts
export async function processMembershipGrant(profile: UserProfile): Promise<UserProfile> {
  return profile;
}
```

`context/AuthContext.tsx` still calls `processMembershipGrant(profile)`, but the current implementation is a no-op. Therefore, the July 1 source of truth exists in code, but it is not currently wired into active membership or badge granting.

Additional related rule source:

- `lib/billing/membershipGrant.ts` defines `getPenjagaBhumiIntiGrant(email)`.
- It returns `membershipType: "PENJAGA_BHUMI_INTI"`, `planType: "FREE"`, `planLabel: "Akses Bhumi Inti"`, and `badge: "Penjaga Bhumi Inti"` for configured emails.
- This conflicts with the source-of-truth category `PREMIUM_2_MONTHS` for `Penjaga Bhumi Inti`.
- The helper appears dormant or partially wired; the current no-op `membershipLogic.ts` means this grant is not part of the active auth-time grant path.

## 6. Business Rules Table

| User Category | Start Date | Badge | Membership Type | Trial Rule | Premium Access | Billing Requirement | Source | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Founder | July 1 policy marker exists; founder records have no per-user start date | `Founder` | `LIFETIME_PREMIUM` | None found | Intended lifetime premium | Likely grandfathered/manual/internal; Play Billing not required unless sold as paid digital entitlement | `founderTesterSourceOfTruth.ts` | PARTIAL |
| Penjaga Bhumi Inti | July 1 policy marker exists; no per-user start date | `Penjaga Bhumi Inti` | `PREMIUM_2_MONTHS` in source of truth; `PENJAGA_BHUMI_INTI` in grant/admin paths | None found | Intended 2 months in source of truth | Unclear. If paid digital access, Play Billing is required. If manual early tester access, may be exempt | `founderTesterSourceOfTruth.ts`, `membershipGrant.ts`, `adminRepository.ts` | CONFLICTING |
| Penjaga Bhumi Alfa | July 1 policy marker exists; no per-user start date | `Penjaga Bhumi Alfa` | `PREMIUM_1_MONTH` | None found | Intended 1 month | Unclear. If paid digital access, Play Billing is required. If manual early tester access, may be exempt | `founderTesterSourceOfTruth.ts` | PARTIAL |
| Penjaga Bhumi | July 1 policy marker exists; no per-user start date | `Penjaga Bhumi` | `REGULAR_TRIAL` | 3 days in source of truth | Trial/public access only | Free trial access can exist without billing; conversion to paid access requires Play Billing | `founderTesterSourceOfTruth.ts` | PARTIAL |
| New User After July 1, 2026 | `2026-07-01T00:00:00+07:00` | Intended default policy not actively applied | Intended default policy not actively applied | Helper exists to detect post-July-1 users; active creation flow does not currently assign trial fields | Current runtime is open while billing is disabled | Free/public access does not require billing; paid upgrade must use Play Billing | `founderTesterSourceOfTruth.ts`, `authActions.ts`, `membershipLogic.ts` | PARTIAL |

## 7. Firestore Security Table

This table reflects the current local `firestore.rules` file. It does not prove the rules are deployed to production.

| Data Path | Can User Self-Write? | Protected Access Fields Blocked? | Notes | Risk |
| --- | --- | --- | --- | --- |
| `users/{uid}` | Yes, for owner-owned profile fields | Yes | `create` requires no protected access fields. `update` blocks affected protected access fields. Founder/admin can write. | Low if deployed |
| `profiles/{uid}` | Yes, for owner-owned profile fields | Yes | Same protected field pattern as `users/{uid}`. | Low if deployed |
| `userProfiles/{uid}` | Yes, for owner-owned profile fields | Yes | Same protected field pattern as `users/{uid}`. | Low if deployed |
| `users/{uid}/{document=**}` | Yes, for owner subdocuments | No explicit protected access field block at nested level | Owner can write nested documents. Risk depends on whether entitlement, membership, purchase, or subscription documents are ever placed under `users/{uid}`. | Medium |
| Top-level membership/subscription collections | No explicit allow found | Denied by default if unmatched | No active top-level membership/subscription collection was found in the reviewed rules. | Low |
| Content collections such as journals, reports, progress, activities | Yes, generally owner-scoped | No general protected field block | These appear to be user content/state collections rather than entitlement records. Risk rises if access fields are later stored there. | Low to Medium |

Protected field names currently include, among others:

- `plan`
- `plans`
- `planLabel`
- `tier`
- `tiers`
- `role`
- `roles`
- `guardianRole`
- `badge`
- `badges`
- `testerBadge`
- `guardianBadge`
- `recognitionTier`
- `isDeveloper`
- `isFoundingMember`
- `premium`
- `isPremium`
- `subscription`
- `subscriptionStatus`
- `entitlement`
- `entitlements`
- `membership`
- `membershipType`
- `memberType`
- `membershipStartDate`
- `membershipExpiryDate`
- `membershipExpiresAt`
- `billing`
- `purchase`
- `purchases`
- `productId`
- `expiryDate`
- `validUntil`
- `trial`
- `trialStartedAt`
- `trialEndsAt`
- `quota`
- `limits`
- `credits`
- `founder`
- `admin`
- `staff`
- `paid`
- `paymentStatus`

## 8. Runtime Enforcement Table

| Area | Current Runtime Behavior | Badge/Plan/Entitlement Dependency | Safety Assessment |
| --- | --- | --- | --- |
| Dashboard | Displays guardian identity using profile fields such as `guardianRole`, `guardianBadge`, and `recognitionTier`. Trial messaging uses access helpers. | Display depends on profile fields; access helpers currently open while billing is disabled. | Access-safe in current hotfix state; display depends on server-owned fields being protected in deployed rules. |
| Refleksi Jiwa / Journal | `hasFeatureAccess(profile, "journal")` and `PremiumLock` exist. | Current access helper returns open access because billing is disabled. | Access-safe currently; future billing enablement must rely on server-owned entitlements. |
| Catatan Hari Ini | No active premium gate found in reviewed current path. | No paid/badge dependency found. | Safe as free/basic feature. |
| Journey | Feature key exists in access control. No strong active route-level lock was confirmed in the current scan. | Current billing-disabled state means no membership lock. | Safe currently; documented trial locking does not match current runtime. |
| Wellness | No active premium gate found in reviewed current path. | No paid/badge dependency found. | Safe as free/basic feature. |
| Manifestasi Hari Ini | No active premium gate found in reviewed current path. | No paid/badge dependency found. | Safe as free/basic feature. |
| Kenali Diri / Profile / Basic Account | No active premium gate found in reviewed current path. | No paid/badge dependency found. | Safe as free/basic feature. |
| Audio Healing | `hasFeatureAccess(profile, "audioHealing")` and `PremiumLock` exist. | Current access helper returns open access because billing is disabled. | Access-safe currently; future paid access requires Play Billing and server-owned entitlement state. |
| Meditation | `hasFeatureAccess(profile, "meditation")` and `PremiumLock` exist. | Current access helper returns open access because billing is disabled. | Access-safe currently; future paid access requires Play Billing and server-owned entitlement state. |
| Weekly Report | `hasFeatureAccess(profile, "weeklyReport")` exists. | Current access helper returns open access because billing is disabled. | Access-safe currently; future paid access requires Play Billing and server-owned entitlement state. |
| Advanced Blueprint | No confirmed active paid entitlement gate found in reviewed files. | No confirmed current premium dependency. | Safe currently if treated as public/free; needs explicit server-owned entitlement if monetized. |
| Compatibility | No confirmed active paid entitlement gate found in reviewed files. | No confirmed current premium dependency. | Safe currently if treated as public/free; needs explicit server-owned entitlement if monetized. |
| Settings | Current UI shows neutral public access text: `Akses Publik Bhumi`. | Old premium/subscription display has been neutralized in current working tree. Local storage plan state may still exist, but Firestore writes strip protected access fields. | Safe for current public-access release posture. |

## 9. Billing / Policy Classification

| Category or Feature | Classification | Play Billing Requirement |
| --- | --- | --- |
| Founder lifetime access | Grandfathered/manual/internal entitlement if granted outside sale flow | Not required if not sold as an in-app paid digital product. Required if converted into a paid digital entitlement. |
| Penjaga Bhumi Inti 2-month access | Early tester/manual entitlement if granted as recognition; paid entitlement if purchased | Not required for manual tester recognition. Required if sold or exchanged as paid digital access in Android app. |
| Penjaga Bhumi Alfa 1-month access | Early tester/manual entitlement if granted as recognition; paid entitlement if purchased | Not required for manual tester recognition. Required if sold or exchanged as paid digital access in Android app. |
| Penjaga Bhumi regular trial | Free/public trial | Not required while free. Paid conversion requires Play Billing. |
| New post-July-1 user access | Public/free access in current hotfix runtime | Not required while public/free. Paid upgrade requires Play Billing. |
| Meditation, Audio Healing, Weekly Reports, Advanced Blueprint, Compatibility, or similar premium unlocks | Paid digital access if monetized | Play Billing required on Android if sold in-app. |

Current billing implementation:

- `GOOGLE_PLAY_BILLING_ENABLED = false`
- `initiateGooglePlaySubscription()` is a placeholder and returns false.
- Current access helpers intentionally return open access while billing is disabled.

## 10. Conflicts Found

1. `Penjaga Bhumi Inti` has conflicting membership semantics.
   - `founderTesterSourceOfTruth.ts`: `PREMIUM_2_MONTHS`
   - `membershipGrant.ts`: `PENJAGA_BHUMI_INTI`, `planType: "FREE"`
   - `adminRepository.ts`: writes `membershipType: "PENJAGA_BHUMI_INTI"` for approved guardian candidates
   - These are not the same entitlement model.

2. Trial duration conflicts with documentation.
   - `founderTesterSourceOfTruth.ts`: `REGULAR_TRIAL` with `trialDays: 3`
   - `docs/TRIAL_SYSTEM_QA.md`: describes a 7-day free trial
   - Current hotfix runtime: no active trial enforcement while billing is disabled

3. July 1 source of truth exists but is not active.
   - `founderTesterSourceOfTruth.ts` contains the July 1 policy and category mappings.
   - `membershipLogic.ts` currently returns the profile unchanged.
   - `authActions.ts` currently creates minimal profiles and does not assign plan, trial, badge, guardian role, recognition tier, or membership fields.

4. Documentation still describes older subscription behavior.
   - `docs/TRIAL_SYSTEM_QA.md` describes premium locks and trial expiry.
   - `docs/BHUMI_V3_GAIA_CURRENT_PAGE_STRUCTURE.md` describes settings badge/subscription status and a date-based Gaia override.
   - Current runtime uses billing-disabled open access and neutral settings copy.

5. Local Firestore rules are hardened, but deployment is not verified.
   - The audit reviewed the local `firestore.rules`.
   - No Firebase deploy was performed.
   - Production security posture depends on whether these rules are deployed.

## 11. Security Risks

1. Production rules may not match local rules.
   - Local rules now block owner self-upgrade of root profile access fields.
   - If production still has older rules, users may be able to self-write plan, badge, role, membership, or entitlement fields.

2. Nested user subdocuments remain broadly owner-writable.
   - `users/{uid}/{document=**}` allows owner write access.
   - If future entitlement documents are stored under this path, users could self-write them unless nested protected rules are added.

3. Client-side entitlement fields remain in profile types.
   - Types still include optional `plan`, `membershipType`, `testerBadge`, `guardianBadge`, `recognitionTier`, `trialStartedAt`, `trialEndsAt`, and related fields.
   - Current repository/service write paths strip these fields, but future direct Firestore writes could accidentally reintroduce risk.

4. Admin approval writes powerful access fields from client-side code.
   - `adminRepository.ts` writes `recognitionTier`, `guardianBadge`, and `membershipType`.
   - This is acceptable only if Firestore rules reliably restrict the actor to founder/admin.

5. Billing-disabled open access is safe for public release only if intentional.
   - Current helpers open all premium-gated features while `GOOGLE_PLAY_BILLING_ENABLED=false`.
   - This avoids unsafe paid gating without Play Billing, but it also means the app is not currently enforcing premium memberships.

6. Documentation and source-of-truth mismatch can cause unsafe reactivation.
   - Re-enabling old trial/premium logic from docs without reconciling the July 1 policy could restore inconsistent or policy-unsafe behavior.

## 12. Recommended Next Implementation Tickets

1. Define the canonical July 1 access policy.
   - Decide the exact meaning of `Founder`, `Penjaga Bhumi Inti`, `Penjaga Bhumi Alfa`, `Penjaga Bhumi`, and post-July-1 new users.
   - Resolve `PREMIUM_2_MONTHS` versus `PENJAGA_BHUMI_INTI`.
   - Resolve 3-day versus 7-day trial language.

2. Move entitlement assignment to a trusted server path.
   - Use an admin-only backend function, Firebase callable, Cloud Function, or verified server action.
   - Do not grant premium, trial, role, badge, or membership fields from ordinary client profile saves.

3. Add explicit entitlement storage.
   - Prefer a server-owned entitlement document or server-owned fields with clear schema.
   - Include source, grant reason, start date, expiry date, billing purchase token if applicable, and audit metadata.

4. Harden nested Firestore paths before using them for access state.
   - Add protected field checks or explicit denies for entitlement-like nested documents under `users/{uid}`.

5. Verify and deploy Firestore rules.
   - Run local rules tests for self-upgrade attempts.
   - Deploy verified rules before any release that relies on server-owned entitlement fields.

6. Implement Play Billing before paid Android unlocks.
   - Keep `GOOGLE_PLAY_BILLING_ENABLED=false` until the purchase, acknowledgement, restore, cancellation, expiry, and server validation paths exist.
   - Do not enforce paid Android subscription unlocks using client-only profile fields.

7. Update documentation after the canonical policy is chosen.
   - Align `TRIAL_SYSTEM_QA.md`, page-structure docs, Play Store testing docs, and source-of-truth files.

8. Add regression tests.
   - Test user self-write attempts for `plan`, `membershipType`, `trialEndsAt`, `guardianBadge`, `recognitionTier`, `role`, `subscriptionStatus`, and `entitlement`.
   - Test runtime access behavior with billing disabled and enabled.
   - Test founder/admin-only grant paths.

## 13. Final Status

PARTIAL

Reason:

- July 1 badge and membership rules were found in code.
- The local Firestore rules and repository/service write paths currently contain meaningful protections against user self-upgrade of root profile access fields.
- Current runtime access is intentionally open while Google Play Billing is disabled.
- However, the July 1 rules are not currently active in the auth-time grant path, `Penjaga Bhumi Inti` has conflicting membership semantics, trial duration conflicts with docs, and production Firestore deployment was not verified.

This means the current implementation is safer than the pre-hotfix state for accidental self-upgrade in local code, but the July 1 badge and membership policy is not yet a fully coherent, enforced, production-verified entitlement system.
