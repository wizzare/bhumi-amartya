# Technical To-Do: Bhumi Amartya V4 Build 78 Hotfix & V3 Regression Recovery

**Status:** Canonical Implementation & Recovery Roadmap  
**Target Release:** Build 78 (Version 4.4.1)  
**Branch:** `hotfix/v4-build78-wellness-journey-sync`  
**Mode:** AGENTMEMORY DEGRADED MODE / V3 REGRESSION RECOVERY SPRINT  
**Owner:** Technical Lead & Principal Architect  

---

## Recovery Sprint Task Matrix

### Phase R0 — Baseline & Workspace Safety
- [x] **TASK-R0-1:** Report git status, HEAD, branch, and APK provenance status.  
  - **Status:** `COMPLETED` (Branch `hotfix/v4-build78-wellness-journey-sync`, HEAD `8c9a30d`, `DEVICE BUILD PROVENANCE UNKNOWN`).

### Phase R1 & R2 — P0 Billing Source of Truth & Purchase Error Semantics
- [x] **TASK-REC-001:** Consolidate entitlement evaluation across `entitlementService.ts`, `userRepository.ts`, and `accessControl.ts` enforcing 7-successful-login trial model and canonical precedence.  
  - **Status:** `COMPLETED` (Ran 30 assertions in `tests/hotfix-008-login-count-trial.test.ts` — 100% PASS).
- [x] **TASK-REC-002:** Map `BillingResponseCode.ITEM_ALREADY_OWNED` (code 7) in `BhumiBillingPlugin.java` & `app/premium-bhumi/page.tsx` to trigger purchase restore cleanly.  
  - **Status:** `COMPLETED & VALIDATED`.

### Phase R3 — P0 Access Policy & Dashboard Loop Prevention
- [x] **TASK-REC-003:** Remove `!baselineWellnessCompleted` forced redirect in `ProtectedRoute.tsx` so FREE users tapping "Kembali ke Dashboard" never loop back to `/wellness`.  
  - **Status:** `COMPLETED & VALIDATED`.
- [x] **TASK-REC-004:** Enforce canonical FREE access policy in `canAccessPremiumFeature` (Dashboard, Inbox, Settings, Premium allowed; Profile, Wellness, Journey gated).  
  - **Status:** `COMPLETED & VALIDATED`.

### Phase R4 — Profile / Blueprint Retest (RECOVERY-005)
- [ ] **TASK-REC-005:** Build recovery APK and retest non-Founder Profile & Arsip Akashi on real device (`TESTER-INTI-01`).  
  - **Priority:** P1 | **Status:** `READY FOR ANDROID BUILD & DEVICE RETEST` (Runtime files `app/profile/page.tsx` remain strictly FROZEN).

---

## Strict Implementation Constraints
- ❌ Do NOT modify `app/profile/page.tsx` before device retest.
- ❌ Do NOT add client-side blueprint calculation fallback.
- ❌ Do NOT model or test any "Google Play trial" state or calendar 7-day trial.
- ✅ Canonical Dashboard rule enforced: `/dashboard` is ALWAYS open for authenticated users.
- ✅ 7-successful-login trial model active and validated across 30 test assertions.
