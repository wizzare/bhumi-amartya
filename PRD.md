# Bhumi Amartya V4 / Build 80 Product Requirements

## 1. Document Status

This is the canonical Build 80 Product Requirements Document. It reflects current committed implementation and evidence. V5 roadmap features are not described as current V4 implementation.

## 2. Product Purpose

Bhumi Amartya is a self-knowledge, reflection, wellness, and personal growth application. It combines structured Blueprint systems (Life Path, Human Design, Natal Chart, Destiny Matrix, Weton, BaZi, Vedic Astrology, Tzolkin) with reflective Daily Guidance, Journey, Wellness, and supporting insight features. It is not medical diagnosis, psychological treatment, or deterministic prediction.

## 3. Build 80 Objectives

- Stabilization of existing V4 features
- Dependency reconciliation (5/5 orphaned dependencies admitted)
- Governance and documentation (10 foundation documents)
- Android API 36 compliance (targetSdk 36)
- Admin reliability (internal-account exclusion, stale-snapshot fix pending)
- Telemetry and behavior memory hardening
- Security and privacy hardening
- Release readiness (not yet achieved)

Build 80 is a stabilization and governance sprint, not a large feature-expansion sprint.

## 4. User Roles

| Role | Description | Evidence |
|---|---|---|
| Authenticated user | Registered user with Firebase Auth; owns their profile, Blueprint, and data | COMMITTED |
| Unauthenticated visitor | Landing page only; no access to app features | COMMITTED |
| Founder/Admin | Email-based authorization (wizzare@gmail.com) plus guardianRole/role fields; access to Admin Dashboard | COMMITTED |
| Internal/test account | Designated accounts excluded from Admin analytics; retain full app access | INTEGRATED |

## 5. Functional Requirements

### Authentication

| ID | Requirement | Implementation | Verification |
|---|---|---|---|
| AUTH-01 | Email/password login | COMMITTED | PARTIAL |
| AUTH-02 | Google sign-in (Capacitor) | COMMITTED | PARTIAL |
| AUTH-03 | Anonymous auth (dev) | COMMITTED | PARTIAL |
| AUTH-04 | Logout | COMMITTED | PARTIAL |

### Profile and Blueprint

| ID | Requirement | Implementation | Verification |
|---|---|---|---|
| PROF-01 | Profile creation (birth date, time, city) | COMMITTED | PARTIAL |
| PROF-02 | 8 deterministic Blueprint engines | COMMITTED | TWO FIXTURES VERIFIED (HD) |
| PROF-03 | Blueprint display on Dashboard and Profile | COMMITTED | PARTIAL |
| PROF-04 | HD recovery for pending users | COMMITTED | AUTHENTICATED RUNTIME PASS (sample) |

### Daily Guidance

| ID | Requirement | Implementation | Verification |
|---|---|---|---|
| DG-01 | Generate per-user per-day guidance | COMMITTED | EMULATOR 29/29 |
| DG-02 | Deterministic document ID prevents duplicates | COMMITTED | EMULATOR VERIFIED |
| DG-03 | Cross-runtime deduplication | NOT PROVEN | FOLLOW-UP |

### Behavior Memory

| ID | Requirement | Implementation | Verification |
|---|---|---|---|
| BM-01 | Record wellness recommendations | COMMITTED | EMULATOR 53/53 |
| BM-02 | Record completions, skips, expirations | COMMITTED | EMULATOR VERIFIED |
| BM-03 | Idempotency and concurrency | COMMITTED | EMULATOR VERIFIED |
| BM-04 | Bounded arrays (30/200) | COMMITTED | EMULATOR VERIFIED |

### Admin Dashboard

| ID | Requirement | Implementation | Verification |
|---|---|---|---|
| ADM-01 | Display user metrics (total, DAU, WAU, MAU, retention, funnel) | COMMITTED | PARTIAL |
| ADM-02 | Internal-account exclusion | INTEGRATED | TEST 22/22 + 48/48 |
| ADM-03 | User detail modal | COMMITTED | PARTIAL |
| ADM-04 | Personal messaging | COMMITTED | PARTIAL |
| ADM-05 | Admin stale-snapshot fix | NOT IN BUILD 80 | EXTERNAL COMMIT fad0f65d |

### Android

| ID | Requirement | Implementation | Verification |
|---|---|---|---|
| AND-01 | compileSdk 36 | COMMITTED | BUILD PASS |
| AND-02 | targetSdk 36 | COMMITTED | BUILD PASS |
| AND-03 | minSdk 24 | COMMITTED | BUILD PASS |
| AND-04 | Runtime Android 16 QA | NOT PERFORMED | PENDING |

### Billing/Entitlement

| ID | Requirement | Implementation | Verification |
|---|---|---|---|
| BILL-01 | Client-side billing integration | COMMITTED | PARTIAL |
| BILL-02 | Server-side verification | COMMITTED (function) | NOT DEPLOYED |
| BILL-03 | Entitlement grant on purchase | COMMITTED | NOT RUNTIME VERIFIED |

## 6. Non-Functional Requirements

| ID | Requirement | Status |
|---|---|---|
| NFR-01 | Privacy: no secrets committed, PII sanitized in logs | VERIFIED (15/15 privacy tests) |
| NFR-02 | Security: Firestore Rules as authorization boundary | COMMITTED (deployment NOT VERIFIED) |
| NFR-03 | Idempotency: deterministic document IDs for key paths | VERIFIED (DG, BM) |
| NFR-04 | Responsive: mobile-first Tailwind layout | COMMITTED |
| NFR-05 | Android compatibility: API 24–36 | BUILD VERIFIED (runtime QA PENDING) |
| NFR-06 | Observability: analytics and activity telemetry | COMMITTED |

## 7. Acceptance Criteria (Build 80 Release Gates)

| Gate | Status |
|---|---|
| API 36 runtime QA | PENDING |
| TSC resolution or approved scope | PENDING (21 pre-existing errors) |
| Authenticated browser regression | PENDING |
| Firestore Rules production deployment verification | PENDING |
| Billing/entitlement runtime verification | PENDING |
| Version metadata reconciliation | PENDING (4.4.1/78 vs 4.4.4/79 discrepancy) |
| Signed AAB verification | PENDING |
| Internal testing | PENDING |
| Founder release approval | PENDING |

## 8. Verified Evidence

| Evidence | Result |
|---|---|
| Daily Guidance emulator | 29/29 PASS |
| Behavior Memory emulator | 53/53 PASS |
| Admin exclusion focused tests | 22/22 PASS |
| Legacy internal tester exclusion | 48/48 PASS |
| Android assembleDebug | PASS (exit 0) |
| Android lintDebug | PASS (exit 0) |
| Capacitor Doctor | PASS (exit 0) |

## 9. Known Blockers and Risks

1. Android 16/API 36 runtime QA not performed
2. Admin stale-snapshot fix not present in Build 80
3. Version metadata inconsistent (web 4.4.1/78 vs Android 4.4.4/79)
4. 21 pre-existing TSC errors without formal scope decision
5. Firestore Rules production deployment not verified
6. Billing backend not deployed, runtime not verified
7. Build 80 not released

## 10. Out of Scope

- V5 localization (language expansion)
- Major UI redesign
- New Blueprint systems beyond the 8 currently implemented
- Cross-runtime generation deduplication (documented follow-up)
- Production release without Founder approval

## 11. Release Decision

**NOT READY FOR PRODUCTION RELEASE.**

Build 80 has not met the acceptance criteria defined in section 7.