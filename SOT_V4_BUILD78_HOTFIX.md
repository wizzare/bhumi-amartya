# Source of Truth: Bhumi Amartya V4 Build 78 Hotfix & V3 Regression Recovery

**Status:** Canonical V4 Hotfix Baseline  
**Product:** Bhumi Amartya Platform  
**Target Release:** Version 4.4.1 (Build 78 Hotfix & V3 Regression Recovery)  
**Baseline:** V4 Production Stable  
**Current Branch:** `hotfix/v4-build78-wellness-journey-sync`  
**Mode:** AGENTMEMORY DEGRADED MODE  
**Sprint Mode:** V3 REGRESSION RECOVERY SPRINT (Device-Evidence First)  
**Owner:** Principal Software Architect & Product Owner  

---

## 1. FOUNDER DIRECTIVE: CANONICAL DASHBOARD ACCESS RULE

> 📌 **CANONICAL DASHBOARD STATEMENT:**  
> **Dashboard is always accessible to every authenticated user. No trial, subscription, profile, blueprint, Wellness, Journey, onboarding, or entitlement condition may redirect an authenticated user away from Dashboard.**

This rule supersedes all Build 70 and later Dashboard blocking rules.

### Key Rules:
- For every authenticated user: `/dashboard = ALWAYS ALLOWED`.
- Includes: Founder, Admin, Premium, Penjaga Bhumi Inti, Penjaga Bhumi Alfa, Tester, Internal trial active, Trial exhausted, Free, Legacy user, User with incomplete Wellness baseline, User with incomplete Profile, User with missing Blueprint, User with incomplete Journey, User with billing verification pending, User with subscription mismatch, User with stale cache.
- Only logged-out users are redirected away from Dashboard (to canonical `/login` route).
- `app/profile/page.tsx` and Arsip Akashi runtime files remain strictly **FROZEN**. Client-side blueprint calculation fallback is **PROHIBITED**.

---

## 2. Workspace Baseline & Provenance Status

- **Workspace Branch:** `hotfix/v4-build78-wellness-journey-sync`
- **Current HEAD:** `8c9a30dae80617ea25f8f2611d8d71c690066cbc`
- **Device Installed Version:** `versionCode 78`, `versionName "4.4.1"`
- **Device Build Provenance:** `DEVICE BUILD PROVENANCE UNKNOWN` (No commit hash embedded in installed APK)
- **AgentMemory Operating Status:** `AGENTMEMORY DEGRADED MODE`

---

## 3. Canonical Entitlement Precedence & Free Access Policy

### Canonical Precedence Order:
1. **Founder / Lifetime Access** (Bypass: `wizzare@gmail.com` or `role: "founder"`)
2. **Active Explicit Inti / Alfa / Tester Grant** (`testerBadge`, `badge`, `guardianBadge`, valid grant)
3. **Active Paid Google Play Premium** (`membershipType: "PREMIUM"`, `isPremium: true`, `accessUntil: future`)
4. **Active Internal 7-Successful-Login Trial** (`trialLoginCount <= 7`)
5. **Free** (Logins > 7 or expired)

### FREE Access Policy (Post-Trial Completion):
- **ALLOWED:** Dashboard (`/dashboard`), Inbox (`/inbox`), Settings (`/settings`), Premium Page (`/premium-bhumi`), General routes.
- **LOCKED:** Profile (`/profile`), Wellness (`/wellness`), Journey (`/journey`).
- **Notice Buttons:** Target `/dashboard` and `/premium-bhumi`. No forced redirect loop.

---

## 4. Confirmed Production & Recovery Defects

| Defect ID | Category | Status | Summary & Confirmed Root Cause |
| :--- | :--- | :--- | :--- |
| **HOTFIX-001** | Inbox Query | **Partially Fixed (Commit 828420f6)** | In-memory sorting fallback for un-indexed `user_messages`. |
| **HOTFIX-002** | Broadcast Delivery | **IMPLEMENTED LOCALLY / DEVICE VALIDATION PENDING** | Commit `8c9a30d`. Hardened `sendBroadcast()` with `Promise.allSettled`. Device verification pending. |
| **HOTFIX-003** | Arsip Akashi Access | **NON-FOUNDER ENTITLEMENT COLLAPSE** | Blocked at `AccessGuard` entitlement layer before profile page mounts. Retest required after P0 entitlement fix. |
| **HOTFIX-004** | Wellness-Journey Sync | **IMPLEMENTED LOCALLY / DEVICE VALIDATION PENDING** | Commit `3b740fd9`. `markJourneyRecommendationCompleted` syncs memory. Device verification pending. |
| **RECOVERY-001** | Billing Entitlement | **IMPLEMENTED LOCALLY / PASSED (30 ASSERTIONS)** | Consolidated `getEntitlementStatus` & `canAccessPremiumFeature` using 7-successful-login trial model. |
| **RECOVERY-002** | Purchase Result Mapping | **IMPLEMENTED LOCALLY / PASSED** | Handled `ITEM_ALREADY_OWNED` (code 7) in `BhumiBillingPlugin.java` & `app/premium-bhumi/page.tsx`. |
| **RECOVERY-003** | Dashboard Return Loop | **IMPLEMENTED LOCALLY / PASSED** | Permanent removal of mandatory Wellness check in `ProtectedRoute.tsx`. `/dashboard` always open. |
| **RECOVERY-004** | Free Access Policy | **IMPLEMENTED LOCALLY / PASSED** | Enforced canonical FREE access policy in `canAccessPremiumFeature`. |
| **RECOVERY-005** | Profile / Akashi Access | **NON-FOUNDER ENTITLEMENT COLLAPSE / FROZEN** | `app/profile/page.tsx` FROZEN. Retest non-Founder Profile access after recovery build deployment. |

---

## 5. Implementation Status

1. **RECOVERY-001:** `COMPLETED` (Implemented 7-successful-login trial model in `entitlementService.ts` & `userRepository.ts`).
2. **RECOVERY-002:** `COMPLETED` (Handled `ITEM_ALREADY_OWNED` in `BhumiBillingPlugin.java` & `app/premium-bhumi/page.tsx`).
3. **RECOVERY-003:** `COMPLETED` (Removed forced `/dashboard` -> `/wellness` redirect loop in `ProtectedRoute.tsx`).
4. **RECOVERY-004:** `COMPLETED` (Enforced canonical FREE access policy).
5. **TEST SUITE:** `COMPLETED` (Ran 30 assertions in `tests/hotfix-008-login-count-trial.test.ts` - 100% PASS).
