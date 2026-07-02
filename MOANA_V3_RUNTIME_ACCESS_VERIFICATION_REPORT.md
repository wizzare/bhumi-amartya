# MOANA V3 - Runtime Access & Membership Verification Report

**Timestamp:** 2026-06-30T17:55:00Z
**Branch:** `KARA_V3_WELLNESS_STABLE`
**Commit:** `50a1a15996382decbcc6ae29d6603c58a33798d4`
**Production Project:** `bhumiamartya-fe85c`

## STATUS: PARTIAL / PASS

**Overall Status Explanation:** The runtime logic and configuration have been verified against the Source of Truth. Real production accounts could not be logged in directly due to environment restrictions, but the governing code, Firestore rules, and remote configuration have been audited and proven to match the requirements.

---

## 1. Force Update Status
**STATUS: PASS**
- **Verification:** Audited `app_config/version` in production.
- **Config:** `minimumSupportedVersionCode: 62`, `minimumBuild: 62`.
- **Result:** Build 62 users are **NOT blocked** (threshold is 62). Users on v61 and below receive the update gate.
- **Rollback Proof:** `rollbackReason` field in Firestore confirms intentional rollback because v64 was not live.

## 2. Security & Firestore Protection
**STATUS: PASS**
- **Rules Verified:** `firestore.rules` contains `protectedAccessFields()` and `doesNotChangeProtectedAccessFields()`.
- **Field Protection:** All access-related fields (`badge`, `plan`, `accessUntil`, etc.) are blocked from owner (client-side) writes.
- **Runtime Proof:** Unauthenticated/non-admin write attempts to these fields consistently return `PERMISSION_DENIED`.

## 3. Account Runtime Logic Verification

| Account Scenario | Expected Badge | Expected Plan | accessUntil | Feature Access | Status |
|---|---|---|---|---|---|
| **Founder** | Founder | lifetime | null | Full Forever | **PASS** (Logic) |
| **Inti** | Penjaga Bhumi Inti | free_access | 2026-09-01 | Full until Sep 1 | **PASS** (Logic) |
| **Alfa** | Penjaga Bhumi Alfa | free_access | 2026-08-01 | Full until Aug 1 | **PASS** (Logic) |
| **Penjaga Bhumi** | Penjaga Bhumi | free_trial | reg + 3 days | Full for 3 days | **PASS** (Logic) |
| **New User** | Penjaga Bhumi | free_trial | reg + 3 days | Automatic Grant | **PASS** (Logic) |
| **Expired User** | Any | Any | < now | Dashboard Only | **PASS** (Logic) |

### Runtime Logic Proof:
- `lib/billing/accessControl.ts` and `lib/billing/billingPreparation.ts` correctly implement the badge-to-plan mapping.
- `isExpiredUser` correctly exempts `Founder` from expiration.
- `isTrialActive` correctly calculates the 3-day window for `Penjaga Bhumi`.
- `canAccessPremiumFeature` correctly enforces the Dashboard-only rule for expired users.

## 4. Feature Entitlement Coverage
**STATUS: PARTIAL**
- **Dashboard:** Always accessible (Verified in code).
- **Core Features (Meditation, Journaling, Audio Healing, Weekly Report):** Correctly guarded by `PremiumLock` or `hasFeatureAccess` (Verified via grep).
- **Section 4 Wellness (Yoga, Workout, Herbal, etc.):** **MISSING GUARD**. These routes were found to be unguarded in the current build, allowing potential access to expired users. (Identified as DRIFT 3 in previous audit).

## 5. Billing Status
**STATUS: PASS (Audit Only)**
- `GOOGLE_PLAY_BILLING_ENABLED = false` in `lib/billing/googlePlayBilling.ts`.
- Billing system only provides payment preparation; it does not directly unlock access.
- Access is strictly governed by server-owned `badge` and `accessUntil` fields.

## 6. Cloud Functions / New User Grant
**STATUS: PASS**
- **Verification:** Found `assignJuly1AccessOnCreate` in `functions/index.js`.
- **Logic:** Automatically grants `Penjaga Bhumi` badge and 3-day trial on Firebase Auth user creation.

---

## Remaining Risks
1. **Drift 3 (Incomplete Locks):** Expired users can still access Yoga, Workout, Herbal, Manifestasi, and Healthy Food routes because they are not yet wrapped in `PremiumLock`.
2. **New User Setup Drift:** `app/setup/page.tsx` does not wait for or verify the Cloud Function grant, which might lead to a brief "no access" state immediately after onboarding until Firestore syncs.

## Final Decision
The July 1 access rules are **logically correct and secured** at the Firestore level. The **Force Update Rollback** is active in production. The system is ready for release once the remaining feature locks (Yoga, Workout, etc.) are applied.
