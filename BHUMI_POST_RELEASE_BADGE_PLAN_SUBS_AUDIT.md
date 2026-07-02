# BHUMI POST-RELEASE BADGE, PLAN, SUBSCRIPTION, ENTITLEMENT AUDIT

## 1. Timestamp

- Audit timestamp: 2026-06-29 11:44:57 +07:00
- Branch: KARA_V3_WELLNESS_STABLE
- Commit hash: c5087f47128621fb04d3d8051f197cafa1c7cd14
- Scope: Existing implementation only. No billing, lock, Firestore, release, AAB, Play Console, or versionCode changes were made.

## 2. Files Searched

Primary command:

```text
rg -n -i "badge|badges|plan|plans|tier|tiers|free|premium|pro|subscription|subscriptions|subs|billing|purchase|purchases|entitlement|entitlements|unlock|locked|unlocked|access|membership|member|founder|admin|role|roles|quota|limit|limits|credits|donation|manual|package|paket|paid|payment|google play billing"
```

Important files inspected:

- `context/AuthContext.tsx`
- `lib/repositories/userRepository.ts`
- `lib/types/user.ts`
- `lib/firebase/service.ts`
- `lib/data/types.ts`
- `lib/auth/authActions.ts`
- `lib/auth/getUserRole.ts`
- `lib/auth/privilegedUser.ts`
- `lib/billing/accessControl.ts`
- `lib/access/accessControl.ts`
- `lib/billing/getUserPlanStatus.ts`
- `lib/billing/googlePlayBilling.ts`
- `lib/billing/gaiaAccess.ts`
- `lib/billing/fantaAccess.ts`
- `lib/billing/membershipLogic.ts`
- `lib/billing/membershipGrant.ts`
- `lib/billing/founderTesterSourceOfTruth.ts`
- `lib/constants/membership.ts`
- `lib/repositories/adminRepository.ts`
- `components/auth/PremiumLock.tsx`
- `components/billing/FeatureLocked.tsx`
- `components/billing/WellnessLock.tsx`
- `components/dashboard/DashboardClient.tsx`
- `app/settings/page.tsx`
- `app/upgrade/page.tsx`
- `app/journal/page.tsx`
- `app/innerwork/journaling/page.tsx`
- `app/meditation/page.tsx`
- `app/innerwork/meditation/page.tsx`
- `app/healing/audio/page.tsx`
- `app/innerwork/audio-healing/page.tsx`
- `app/reports/weekly/page.tsx`
- `firestore.rules`
- `package.json`
- `docs/PLAY_STORE_INTERNAL_TESTING_PLAN.md`
- `docs/BHUMI_V3_GAIA_CURRENT_PAGE_STRUCTURE.md`
- `PLAY_CONSOLE_SUBMISSION_DRAFT.md`
- `PLAY_STORE_SUBMISSION_CHECKLIST.md`
- `FINAL_PLAY_STORE_AUDIT.md`

## 3. Search Terms Used

`badge`, `badges`, `plan`, `plans`, `tier`, `tiers`, `free`, `premium`, `pro`, `subscription`, `subscriptions`, `subs`, `billing`, `purchase`, `purchases`, `entitlement`, `entitlements`, `unlock`, `locked`, `unlocked`, `access`, `membership`, `member`, `founder`, `admin`, `role`, `roles`, `quota`, `limit`, `limits`, `credits`, `donation`, `manual`, `package`, `paket`, `paid`, `payment`, `google play billing`

## 4. Current State Table

| Area | Exists? | File/Path | Current Behavior | Risk | Notes |
|---|---:|---|---|---|---|
| User badge | Yes | `lib/repositories/userRepository.ts`, `lib/billing/founderTesterSourceOfTruth.ts`, `app/settings/page.tsx` | `testerBadge`, `guardianBadge`, and `recognitionTier` are stored and displayed. | Medium | Badges are active, not just placeholders. |
| User plan | Yes | `lib/repositories/userRepository.ts`, `lib/billing/getUserPlanStatus.ts`, `app/settings/page.tsx` | Supports `free`, `trial`, `pro`, `premium`, `developer`, `expired`. | High | Multiple plan vocabularies coexist. |
| Free tier | Yes | `authActions.ts`, `getUserPlanStatus.ts`, `adminRepository.ts` | Default can be `free` or `trial` depending on registration policy/date. | Medium | Meaning of free vs trial is inconsistent. |
| Premium tier | Yes | `membershipLogic.ts`, `accessControl.ts`, `settings/page.tsx` | Founder/tester SoT grants `premium`, `PREMIUM`, `LIFETIME`, 1-2 month labels. | High | Premium exists without Play Billing entitlement validation. |
| Subscription status | Partial | `settings/page.tsx`, `googlePlayBilling.ts`, `getUserPlanStatus.ts` | UI says `Subscription Plan`, `Billing: Rp50.000/month`, `Next billing date`; billing module is disabled. | High | Subscription display exists before real billing. |
| Entitlement state | Partial | `lib/billing/accessControl.ts`, `lib/access/accessControl.ts`, `gaiaAccess.ts` | Access is derived from trial expiry, manual membership fields, privileged user, and Gaia override. | High | No canonical entitlement object or server validation. |
| Feature lock/unlock | Yes | `FeatureLocked.tsx`, `PremiumLock.tsx`, gated pages | Journal, meditation, audio healing, weekly report can lock after trial/override. | High | Hard locks can happen without Play Billing. |
| Founder/admin role | Yes | `firestore.rules`, `adminRepository.ts`, `privilegedUser.ts`, `getUserRole.ts` | Founder/admin can list users, approve guardians, and override access. | Medium | Operationally useful, but role fields are mixed with billing fields. |
| Manual paid package tracking | Partial | `founderTesterSourceOfTruth.ts`, `membershipLogic.ts`, `settings/page.tsx` | Named founders/testers get manual premium periods/lifetime. | High | Manual premium unlocks app features, which is policy-sensitive. |
| Donation tracking | Missing | N/A | No donation model found. | Low | Safe because no donation unlock path exists. |
| Google Play Billing integration | Placeholder only | `lib/billing/googlePlayBilling.ts`, docs | `GOOGLE_PLAY_BILLING_ENABLED = false`; function alerts billing is not active. | High | No BillingClient, purchase token, restore, or validation path. |
| Firestore rules for plan/subscription | Incomplete | `firestore.rules` | Users can read/write their own whole user doc. No protected entitlement fields. | High | Users may write plan/membership fields client-side. |
| UI badge display | Yes | `app/settings/page.tsx`, `DashboardClient.tsx` | Displays Founder, Penjaga Bhumi Inti, Penjaga Bhumi Alfa, Penjaga Bhumi. | Medium | UI is ready, but tied to mutable user doc fields. |
| UI plan display | Yes | `app/settings/page.tsx`, `app/upgrade/page.tsx` | Settings displays subscription/plan; upgrade says premium is coming soon/free during beta. | High | Messaging conflicts with active locks and billing labels. |
| Premium CTA / upgrade CTA | Partial | `app/upgrade/page.tsx`, lock components | Upgrade page is "coming soon"; locks route back to dashboard, no purchase CTA. | Medium | Good that no payment UI exists, but locked state still exists. |
| Limits/quotas | Missing | N/A | No quota/credit limit model found. | Low | Future feature matrix needed. |
| Offline/manual access override | Yes | `gaiaAccess.ts`, `fantaAccess.ts`, developer/admin overrides | Gaia override keeps access open until 2026-07-01; developer/admin emails bypass access. | High | Date-based override will expire and expose locks. |

## 5. Risk Classification

| Area | Classification |
|---|---|
| User badge | EXISTING_INCOMPLETE |
| User plan | EXISTING_INCOMPLETE |
| Free tier | EXISTING_INCOMPLETE |
| Premium tier | BROKEN |
| Subscription status | BROKEN |
| Entitlement state | EXISTING_INCOMPLETE |
| Feature lock/unlock | BROKEN |
| Founder/admin role | EXISTING_SAFE |
| Manual paid package tracking | BROKEN |
| Donation tracking | MISSING |
| Google Play Billing integration | PLACEHOLDER_ONLY |
| Firestore rules for plan/subscription | BROKEN |
| UI badge display | EXISTING_SAFE |
| UI plan display | EXISTING_INCOMPLETE |
| Premium CTA / upgrade CTA | PLACEHOLDER_ONLY |
| Limits/quotas | MISSING |
| Offline/manual access override | EXISTING_INCOMPLETE |

## 6. Existing Code Paths

- Profile model fields exist in `lib/repositories/userRepository.ts`: `plan`, `planLabel`, `membershipStartDate`, `trialStartedAt`, `trialEndsAt`, `isDeveloper`, `isFoundingMember`, `testerBadge`, `guardianRole`, `guardianBadge`, `recognitionTier`, `membershipType`, `membershipExpiryDate`, `role`.
- New profile creation in `lib/auth/authActions.ts` sets `plan`, `planLabel`, `membershipType`, trial timestamps, role, badge, and recognition fields when `shouldApplyDefaultRegistrationPolicy` applies.
- `context/AuthContext.tsx` calls `processMembershipGrant(profile)` during profile loading, so membership/badge mutations happen at runtime.
- `lib/billing/founderTesterSourceOfTruth.ts` contains hard-coded founder/tester names and maps them to `LIFETIME_PREMIUM`, `PREMIUM_2_MONTHS`, `PREMIUM_1_MONTH`, or `REGULAR_TRIAL`.
- `lib/billing/membershipLogic.ts` writes manual badge, plan, plan label, membership type, trial, and expiry fields.
- `lib/billing/accessControl.ts` gates features by Gaia override, active premium membership, or trial expiry.
- `lib/access/accessControl.ts` separately gates `PremiumLock` features with a similar but not identical model.
- `components/auth/PremiumLock.tsx` blurs premium children when `canAccessPremiumFeature` returns false.
- `components/billing/FeatureLocked.tsx` and `WellnessLock.tsx` render lock screens without payment UI.
- Pages using gates include journal, innerwork journaling, meditation, innerwork meditation, healing audio, innerwork audio healing, and weekly reports.
- `app/settings/page.tsx` displays badge and subscription plan state, including monthly billing text.
- `app/upgrade/page.tsx` says Premium is being prepared and beta features are free.
- `lib/billing/googlePlayBilling.ts` is disabled and only shows a not-enabled alert.

## 7. Missing Code Paths

- No real Google Play Billing library integration found.
- No purchase token collection, verification, acknowledgement, restore, cancellation, grace period, account hold, or pending purchase handling found.
- No server-side entitlement sync found.
- No canonical `entitlements` map/object found in Firestore or local model.
- No protected Firestore entitlement fields found.
- No donation tracking model found.
- No quota/credits/usage-limit model found.
- No policy-safe separation between manual off-app services and digital app unlocks found.

## 8. Firestore Readiness

Current Firestore rules are not ready for subscription or entitlement enforcement.

- `match /users/{userId}` allows the owner to `read, write` their full user document.
- Billing-related fields such as `plan`, `planLabel`, `membershipType`, `membershipExpiryDate`, `testerBadge`, and role-ish fields live on the same user doc.
- Rules do not prevent a normal client from writing entitlement-like fields on their own document.
- Founder/admin rules exist and are useful, but they do not protect monetization state from owner writes.

Recommendation: postpone Firestore entitlement changes to `POST-REL-FIRESTORE-1`, and design field-level or subcollection rules before any real monetized unlock.

## 9. UI Readiness

UI display readiness is partial:

- Badge display is already present and reasonably polished in settings.
- Plan/subscription display exists, but it currently shows billing language before billing exists.
- Upgrade page is policy-safe as a placeholder because it does not sell or collect payment.
- Lock screens exist and are active code paths.
- Some routes can hard-lock digital content after trial/override even though Google Play Billing is disabled.

## 10. Google Play Billing Readiness

Current readiness: PLACEHOLDER_ONLY.

- `lib/billing/googlePlayBilling.ts` explicitly disables billing.
- `package.json` has no Google Play Billing / RevenueCat / IAP dependency.
- No native BillingClient bridge was found in Android or Capacitor dependencies.
- Docs already identify Play Billing as a future requirement.
- Existing plan/access code is not safe to treat as purchase-backed entitlement.

## 11. Google Play Policy Safety Notes

Allowed outside Play Billing if they do not unlock in-app digital content:

- Manual PDF reading service.
- Personal consultation via WA or Zoom.
- Donation that does not unlock app content.
- Physical/off-app services.

Must use Play Billing if sold or unlocked inside the app:

- Subscription unlocking premium app features.
- Paid audio or meditation inside app.
- Paid digital reports inside app.
- Locked advanced blueprint content.
- Paid compatibility inside app.
- Paid digital self-healing program inside app.

Current risk: manual founder/tester premium grants and local membership fields unlock or preserve access to digital app features. That may be acceptable for testers/founders as an internal/manual operational exception only if not sold as an in-app digital product. It should not become a paid user path without Play Billing.

## 12. Recommended Post-Release Rules Structure

Do not implement yet. Recommended structure for V4 / monetization phase:

```text
User Access Model:
- free
- founder
- early_member
- premium_monthly
- premium_yearly
- lifetime_manual_only_if_policy_safe

Entitlement Model:
- core_identity_access
- daily_reflection_access
- journey_history_limit
- wellness_basic_access
- wellness_premium_access
- audio_content_access
- advanced_blueprint_access
- compatibility_access
```

Safe principles:

- Bhumi public app remains usable for all users.
- No hard locks unless founder approves.
- Premium/subscription work waits for proper Google Play Billing.
- Manual services such as PDF reading, WA consultation, Zoom, and donation remain outside in-app digital unlocks unless they unlock app content.
- If app unlocks digital content/features, it must use Google Play Billing.
- Firestore should separate user profile data from server-owned entitlement state.
- Client should display entitlement state, not author it.

## 13. Recommended Next Tickets

1. `POST-REL-ACCESS-1`: Audit and finalize access model SoT.
2. `POST-REL-ACCESS-2`: Add non-invasive display fields for badge/plan if already safe.
3. `POST-REL-BILLING-1`: Prepare Google Play Billing architecture.
4. `POST-REL-BILLING-2`: Implement purchase validation and entitlement sync.
5. `POST-REL-PREMIUM-1`: Define premium feature matrix.
6. `POST-REL-FIRESTORE-1`: Add safe Firestore rules for entitlement fields.

## 14. Final Status

BROKEN.

Audit complete. Existing and missing badge, plan, subscription, access, entitlement, founder/admin, Firestore, UI, and Google Play Billing paths are mapped. No app code, billing implementation, Firestore rules, release files, AAB artifacts, Play Console assets, or versionCode were changed.

Reason for BROKEN classification: existing subscription/plan/premium access logic is active, incomplete, client-writable in Firestore, and not backed by Google Play Billing. Some digital feature locks/unlocks already exist, while billing remains placeholder-only.
