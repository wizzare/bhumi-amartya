# Bhumi Amartya Source of Truth

**Status:** ACTIVE CANONICAL
**Product Generation:** V4
**Current Development Target:** Build 80
**Snapshot Branch:** `feature/build80-cloudflare-telemetry-v1`
**Snapshot Checkpoint:** `755ec66195426e49adefed614d369fd143315bef`
**Last Updated:** 2026-07-24
**Owner:** Founder, Bhumi Amartya
**Update Rule:** Update only through evidence-backed governance commits.

## 1. Purpose

This document answers: what Bhumi currently is, what is implemented, what is tested, what is deployed, what remains blocked, and what belongs to the future roadmap.

## 2. Evidence Classification

| Label | Meaning |
|---|---|
| COMMITTED IMPLEMENTATION | Code exists in committed branch |
| TESTED LOCALLY | Unit or local test pass |
| EMULATOR VERIFIED | Firebase Emulator pass (not mock only) |
| FOUNDER-CONFIRMED EXTERNAL | Observed by Founder outside repository metadata |
| DEPLOYED AND VERIFIED | Confirmed running in production |
| PENDING | Acknowledged work with no completion evidence |
| ROADMAP | Future scope, not current implementation |
| HISTORICAL | Past build or earlier document no longer current |

These labels must not be collapsed into one generic DONE status.

## 3. Product Identity

Bhumi Amartya is a self-knowledge, reflection, wellness, and personal growth application. It combines structured blueprint systems (Life Path, Human Design, Natal Chart, Destiny Matrix, Weton, BaZi, Vedic Astrology, Tzolkin) with reflective guidance, Journey, Wellness, and supporting insight features. It is not medical diagnosis, psychological treatment, or deterministic prediction.

## 4. Current Blueprint Systems

| System | Status |
|---|---|
| Life Path | COMMITTED IMPLEMENTATION |
| Human Design | COMMITTED IMPLEMENTATION (Python engine, two canonical fixtures verified) |
| Natal Chart | COMMITTED IMPLEMENTATION |
| Destiny Matrix | COMMITTED IMPLEMENTATION |
| Weton | COMMITTED IMPLEMENTATION |
| BaZi | COMMITTED IMPLEMENTATION |
| Vedic Astrology | COMMITTED IMPLEMENTATION |
| Tzolkin | COMMITTED IMPLEMENTATION |
| Zi Wei Dou Shu | ROADMAP / NOT VERIFIED IN CURRENT IMPLEMENTATION |

Eight verified deterministic engines. No evidence of 10 or 11 implemented application engines.

## 5. Current Product Scope

| Area | Status | Notes |
|---|---|---|
| Authentication | COMMITTED IMPLEMENTATION | Email, Google, anonymous |
| Profile (setup, settings) | COMMITTED IMPLEMENTATION | |
| Blueprint calculations | COMMITTED IMPLEMENTATION | 8 deterministic engines |
| Daily Guidance | EMULATOR VERIFIED | 29/29 PASS; cross-runtime dedup NOT PROVEN; last-write-wins risk DOCUMENTED |
| Weekly Guidance | PARTIAL | Types and engine admitted; full release verification NOT CLAIMED |
| Journey | COMMITTED IMPLEMENTATION | |
| Wellness | COMMITTED IMPLEMENTATION | |
| Catatan Akashi | COMMITTED IMPLEMENTATION | FROZEN per Founder decision |
| Surat Jiwa | COMMITTED IMPLEMENTATION | |
| Inbox | COMMITTED IMPLEMENTATION | |
| Birthday/H-3 communication | COMMITTED IMPLEMENTATION | |
| Billing | COMMITTED IMPLEMENTATION (client); PENDING (backend deployment) | Backend not deployed |
| Trial | COMMITTED IMPLEMENTATION | 7-login trial |
| Tester entitlement | COMMITTED IMPLEMENTATION | |
| Admin dashboard | COMMITTED IMPLEMENTATION | Stale-snapshot fix NOT PRESENT in Build 80 |
| Analytics and telemetry | COMMITTED IMPLEMENTATION | |
| Behavior Memory | EMULATOR VERIFIED | 53/53 PASS; schema validation ABSENT; data sensitivity MEDIUM |
| Share cards | COMMITTED IMPLEMENTATION | |
| Android / Capacitor | COMMITTED IMPLEMENTATION | |
| Localization | COMMITTED IMPLEMENTATION (Indonesian only) | V5 language expansion is ROADMAP |

## 6. Version and Build Reality

### Committed Web/Application Metadata

- `src/lib/version.ts`: versionName 4.4.1, Build 78
- Status: COMMITTED IMPLEMENTATION

### Committed Android Metadata

- `android/app/build.gradle`: versionName 4.4.4, versionCode 79
- Status: COMMITTED IMPLEMENTATION

### Production Release

- Founder-confirmed Play Console observation: versionName 4.4.4, Build 79, full rollout reported from 21 July 2026.
- Status: FOUNDER-CONFIRMED EXTERNAL EVIDENCE
- This production claim is not derived from repository metadata alone.

### Build 80 Target

- Target versionName: 4.4.4
- Target versionCode: 80
- Status: PENDING METADATA RECONCILIATION AND RELEASE
- Build 80 is not released.
- Build 80 metadata is not consistently implemented in committed files.
- `src/lib/version.ts` and Android Gradle currently disagree (4.4.1/78 vs 4.4.4/79).
- This discrepancy is a release blocker.
- Correct classification: NOT YET IMPLEMENTED CONSISTENTLY IN COMMITTED METADATA.

## 7. Verified Evidence Ledger

### Daily Guidance

- Initial emulator harness: `91daf1d9ad870c03e4f45d8647fb032f44abd650`
- Final authenticated coverage: `a31de115881ad4c6856aecf5ec268a85d45302d6`
- Governance admission: `b685217feeeab72bf6e67266e3d6281ca064c5aa`
- Result: 29/29 PASS

### Behavior Memory

- Initial harness: `188219fca05a3abdd8152292881eea443ebb387f`
- Rules hardening: `dcb7abbbecfbbb78f74fdc526df6eabba06c9fdd`
- Post-hardening tests: `a18a89a4e0a3a3bde7bff77f3e9ac937e4ad3bda`
- Governance closure: `755ec66195426e49adefed614d369fd143315bef`
- Result: 53/53 PASS

### Orphaned Dependency Incident

- Admitted: 5/5
- Status: FULLY RECONCILED / INCIDENT CLOSED
- Closure does not create historical provenance retroactively.

### Firestore Rules

- `Path.matches` defect: FIXED IN COMMITTED BRANCH
- Production deployment: NOT VERIFIED
- Rule schema validation: ABSENT
- Founder/Admin bypass: PRESENT BY DESIGN
- Founder/Admin bypass runtime: NOT FULLY VERIFIED

### Admin Snapshot Fix

- Root cause identified and fixed in commit `fad0f65d` (branch `hotfix/v4-build78-wellness-journey-sync`)
- Status: NOT PRESENT IN BUILD 80
- Manual reconciliation pending Founder approval

## 8. Current Quality Status

| Area | Status | Detail |
|---|---|---|
| TypeScript | PASS | Production typecheck exit code 0; 21 pre-existing errors excluded from production scope |
| Billing/entitlement | SOURCE CONTRACT TESTED | 33/33 contract tests PASS; backend deployed NOT VERIFIED; Play runtime PENDING |
| Browser QA | PARTIAL | Authenticated runtime verified for HD+billing scope; full browser regression PENDING |
| Android QA | NOT VERIFIED | No physical-device Build 80 QA |
| Build 80 APK | NOT VERIFIED | |
| Build 80 AAB | NOT VERIFIED | |
| Signing | PENDING | Keystore not found; signing config absent from gradle |

## 9. Current Blockers

1. Reconcile Admin stale-snapshot fix into Build 80.
2. Reconcile versionName/versionCode across web (`src/lib/version.ts`) and Android (`android/app/build.gradle`).
3. Address or formally scope 21 TSC pre-existing errors.
3. `trialLogin` module referenced in `functions/index.js` — CREATED (commit a9774e1), deployment still pending.
4. Billing backend not deployed, Play Billing runtime not verified.
5. Verify force-update and version telemetry.
6. Run complete browser regression.
7. Run physical-device Android QA.
8. Produce and verify Build 80 APK/AAB.
9. Verify signing configuration.
10. Deploy and verify Firestore Rules only with Founder approval.
11. Obtain Founder release approval.

## 10. Roadmap Boundary

- V5 material is roadmap, not current implementation.
- Planned language expansion is not current V4 reality.
- Zi Wei Dou Shu is not verified in current engine set.
- Analytics intelligence or moat features beyond committed Build 80 telemetry are deferred.
- Surat Jiwa or other V5 enhancements must be labelled by actual current implementation evidence.

## 11. Canonical Document Authority

| Document | Purpose |
|---|---|
| SOT.md | Current product and release truth |
| RULES.md | Product and engineering invariants |
| AGENTS.md | Coding-agent operating contract |
| BUILD80_STATUS.md | Build 80 evidence and governance ledger |
| ARCHITECTURE.md, SCHEMA.md, SECURITY.md, DESIGN.md, PRD.md, VERSIONING_AND_RELEASE.md, TODO.md | Domain-specific canonical documents (after creation) |
| Historical Build documents | Reference only |
| Untracked drafts | Non-canonical until reviewed and committed |

## 12. Update Protocol

- Evidence first; exact commit hashes required.
- No silent status promotion.
- Deployment and implementation updated separately.
- Contradictions recorded until resolved.
- Founder approval required for release-state changes.