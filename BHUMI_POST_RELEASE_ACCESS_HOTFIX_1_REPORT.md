# BHUMI POST-RELEASE ACCESS HOTFIX-1 REPORT

## 1. Timestamp

- Timestamp: 2026-06-29 12:11:58 +07:00
- Branch: KARA_V3_WELLNESS_STABLE
- Commit hash before: c5087f47128621fb04d3d8051f197cafa1c7cd14

## 2. Files Reviewed

- `BHUMI_POST_RELEASE_BADGE_PLAN_SUBS_AUDIT.md`
- `firestore.rules`
- `lib/auth/authActions.ts`
- `lib/repositories/userRepository.ts`
- `lib/firebase/service.ts`
- `lib/billing/membershipLogic.ts`
- `lib/billing/accessControl.ts`
- `lib/access/accessControl.ts`
- `lib/billing/googlePlayBilling.ts`
- `app/settings/page.tsx`
- Route consumers of `hasFeatureAccess`, `PremiumLock`, and `FeatureLocked`

## 3. Files Changed

- `firestore.rules`
- `lib/auth/authActions.ts`
- `lib/repositories/userRepository.ts`
- `lib/firebase/service.ts`
- `lib/billing/membershipLogic.ts`
- `lib/billing/accessControl.ts`
- `lib/access/accessControl.ts`
- `app/settings/page.tsx`
- `BHUMI_POST_RELEASE_ACCESS_HOTFIX_1_REPORT.md`

## 4. Firestore Protected Fields List

Protected from normal owner create/update on `users/{uid}`, `profiles/{uid}`, and `userProfiles/{uid}`:

`plan`, `plans`, `planLabel`, `tier`, `tiers`, `role`, `roles`, `guardianRole`, `badge`, `badges`, `testerBadge`, `guardianBadge`, `recognitionTier`, `isDeveloper`, `isFoundingMember`, `premium`, `isPremium`, `subscription`, `subscriptionStatus`, `entitlement`, `entitlements`, `membership`, `membershipType`, `memberType`, `membershipStartDate`, `membershipExpiryDate`, `membershipExpiresAt`, `billing`, `purchase`, `purchases`, `productId`, `expiryDate`, `validUntil`, `trial`, `trialStartedAt`, `trialEndsAt`, `quota`, `limits`, `credits`, `founder`, `admin`, `staff`, `paid`, `paymentStatus`.

Founder/admin rules remain allowed to manage these fields.

## 5. Premium/Plan Logic Before

- Client profile creation wrote `plan`, `planLabel`, `membershipType`, trial dates, role, badge, and recognition fields.
- `processMembershipGrant` mutated membership, badge, plan, trial, premium, and expiry fields during normal auth profile loading.
- `hasFeatureAccess` and `PremiumLock` could block journal, meditation, audio healing, and weekly report based on placeholder trial/premium state.
- Settings showed `Subscription Plan`, `Billing: Rp50.000/month`, `Next billing date`, and premium labels.
- `firebaseService.saveUserProfile` overwrote the full user doc, including stale access fields from local profile objects.

## 6. Premium/Plan Logic After

- Client profile creation no longer authors access/membership/role/badge/trial fields.
- `processMembershipGrant` is a compatibility no-op until server-side/Play Billing entitlement work exists.
- `hasFeatureAccess`, `isTrialExpired`, `getTrialDaysLeft`, `canAccessPremiumFeature`, and `getUserAccess` default to open/public behavior while `GOOGLE_PLAY_BILLING_ENABLED` is `false`.
- Settings displays neutral public access text: `Penghuni Bhumi`, `Akses publik aktif`, `Akses Publik Bhumi`.
- User repository and Firebase profile saves strip server-owned access fields before Firestore writes.
- Firebase profile saves now merge safe fields instead of replacing the whole user document.

## 7. Core Public Feature Access Result

Static browser smoke against exported build:

- `/`: PASS, renders public landing, no lock/payment text.
- `/dashboard/`: PASS, redirects/prompts login, no premium lock/payment text.
- `/profile/`: PASS, safe profile-not-ready state, no premium lock/payment text.
- `/journal/`: PASS, login-required state, no premium lock/payment text.
- `/journey/`: PASS, route renders loading/safe state, no premium lock/payment text.
- `/wellness/`: PASS, login prompt, no premium lock/payment text.
- `/innerwork/manifestasi/`: PASS, login prompt, no premium lock/payment text.
- `/settings/`: PASS, neutral access text visible, no billing/subscription text.

Authenticated free-user runtime should remain public/open because access helpers now return access while billing is disabled.

## 8. Commands Run

- `Get-Content` on audit report and Firestore rules.
- `rg` scans for access/billing/lock call sites and write paths.
- Read local Next docs:
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- `npx tsc --noEmit`
- `npm run build`
- Local static smoke with Python `http.server` serving `out/`.
- Playwright route smoke via local Node script.
- Checked local Firebase validation availability:
  - `Test-Path node_modules/.bin/firebase.cmd` -> false
  - `npm ls @firebase/rules-unit-testing --depth=0` -> not installed

## 9. Build Result

- TypeScript: PASS.
- Production build: PASS.
- Build output: Next.js 16.2.6 compiled successfully, TypeScript finished, 72 static pages generated.

## 10. Firestore Rules Status

- Local rules updated: YES.
- Rules validation: NOT AVAILABLE locally because Firebase CLI and `@firebase/rules-unit-testing` are not installed.
- Deploy status: NOT DEPLOYED.
- Recommended deploy command when founder approves:

```text
firebase deploy --only firestore:rules
```

## 11. Play Console Status

NOT TOUCHED.

## 12. Version Status

NOT CHANGED.

No versionCode change, no AAB rebuild, no Play Console upload.

## 13. Remaining Monetization TODO

- Design server-owned entitlement source of truth.
- Implement Google Play Billing architecture.
- Add purchase token validation and entitlement sync.
- Define premium feature matrix.
- Add tested Firestore rules for entitlement subcollections/fields.
- Replace no-op membership grant with server-side entitlement sync only after Play Billing is ready.

## 14. Final Status

PARTIAL.

App logic is fixed and build passes. Placeholder premium/plan logic no longer blocks public usage while billing is disabled, and normal client write paths strip protected access fields.

Firestore rules were updated locally to block normal client writes to membership-like fields, but they have not been deployed and could not be validated with Firebase tooling in this workspace. Final production protection requires founder-approved Firestore rules deployment.
