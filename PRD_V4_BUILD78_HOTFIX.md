# Product Requirement Document: Bhumi Amartya V4 Build 78 Hotfix & V3 Regression Recovery

**Status:** Canonical V4 Hotfix & Recovery PRD  
**Target Version:** 4.4.1 (Build 78)  
**Branch:** `hotfix/v4-build78-wellness-journey-sync`  
**Mode:** AGENTMEMORY DEGRADED MODE / V3 REGRESSION RECOVERY SPRINT  
**Owner:** Product Owner & QA Lead  

---

## 1. Executive Summary & Dashboard Access Rule

> 📌 **CANONICAL DASHBOARD RULE:**  
> **Dashboard is always accessible to every authenticated user. No trial, subscription, profile, blueprint, Wellness, Journey, onboarding, or entitlement condition may redirect an authenticated user away from Dashboard.**

This rule supersedes all Build 70 and later Dashboard blocking rules.

---

## 2. Canonical Precedence & Entitlement Rules

### Precedence:
1. **Founder / Lifetime Access** (`isPrivilegedUser` or `membershipType: "LIFETIME"`)
2. **Active Explicit Inti / Alfa / Tester Grant** (`testerBadge`, `badge`, `guardianBadge`)
3. **Active Paid Premium** (Google Play)
4. **Active Internal 7-Successful-Login Trial** (`trialLoginCount <= 7`)
5. **Free** (Logins > 7 or expired)

### FREE Access Policy:
- **ALLOWED:** Dashboard (`/dashboard`), Inbox (`/inbox`), Settings (`/settings`), Premium Page (`/premium-bhumi`), General routes.
- **LOCKED:** Profile (`/profile`), Wellness (`/wellness`), Journey (`/journey`).
- **Notice Buttons:** Target `/dashboard` and `/premium-bhumi`. No forced redirect loop.

---

## 3. Mandatory 30 Dashboard Access & Trial Assertions Result

- **Test Suite:** `tests/hotfix-008-login-count-trial.test.ts`
- **Total Assertions:** 30 / 30 PASSED (100%)
- **FROZEN FILES:** `app/profile/page.tsx` and all Arsip Akashi runtime files (`lib/arsipAkashi/*`) remained untouched.
