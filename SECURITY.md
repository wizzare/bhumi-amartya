# Bhumi Amartya Security Model

## 1. Purpose

This document describes the current V4 / Build 80 security model. It covers authentication, authorization, data protection, privacy, logging, AI safety, billing, Android, secret management, and production change controls.

## 2. Trust Boundaries

| Boundary | Trust Level | Notes |
|---|---|---|
| Browser/user application | UNTRUSTED | Client-side code, configuration, and API keys are visible |
| Android WebView / Capacitor shell | UNTRUSTED | Native plugins have platform-level permissions |
| Firebase Authentication | TRUSTED | Google-managed identity |
| Firestore Rules | TRUSTED | Database authorization boundary |
| Admin Dashboard (browser) | UNTRUSTED | Client-side filtering is not authorization |
| AI provider (Gemini API) | LIMITED | Data sent to external service; no end-to-end encryption claimed |
| Billing provider (Google Play) | TRUSTED | Server-side verification pending |
| Build and deployment environment | TRUSTED | Service-account credentials, signing keys |

## 3. Authentication and Authorization

- **Authentication:** Firebase Auth with email/password, Google (via Capacitor plugin), anonymous (development).
- **Authorization boundary:** Firestore Rules enforce UID-based owner isolation. Client-side Firebase SDK respects these rules.
- **Admin authorization:** Founder identified by email (`wizzare@gmail.com`) in Firestore Rules. `guardianRole` (`founder`/`admin`) or `role` (`admin`) grants Founder-level access via `isFounderOrAdmin()` function.
- **Admin internal-account exclusion:** Dashboard filtering based on email normalization. Exclusion prevents display and aggregation but does not delete data. It does not replace or override Firestore Rules authorization.
- **Client-side filters are not authorization.** UI hiding is not a security boundary. Firestore Rules are the sole database authorization mechanism.

## 4. Firestore Security

- Same-user ownership enforced by `request.auth.uid == userId` comparisons
- `isFounderByEmail()` and `isFounderOrAdmin()` provide Founder/Admin bypass by design
- Communications subcollection `Path.matches` defect (`!document.matches('communications/.*')`) has been fixed to `subcollection != 'communications'`
- Rule schema validation is ABSENT for most collections — field names, types, and sizes are not validated by Rules
- Founder/Admin bypass runtime behavior NOT FULLY VERIFIED
- Production Rules deployment NOT VERIFIED
- Emulator-verified paths: `dailyGuidance` (29/29), `behaviorMemory` (53/53)

## 5. Admin Dashboard Security

| Control | Implementation | Status |
|---|---|---|
| Internal account exclusion | Email normalization + derived UID set | INTEGRATED (commit 013d49e9) |
| Exclusion scope | Users, activities, analytics — single shared set | VERIFIED (22/22 + 48/48 tests) |
| Aggregation order | Filter before totals, DAU, WAU, MAU, retention, funnel, features | VERIFIED |
| Data deletion | NOT performed — exclusion is display-only filtering | VERIFIED |
| Production deployment | Admin changes committed to Build 80 branch | PENDING release |

## 6. Privacy and Sensitive Data

| Data Class | Sensitivity | Controls |
|---|---|---|
| Profile (name, email, birth data) | MEDIUM | Owner-only read by default; Founder bypass by rule design |
| Blueprint calculations | MEDIUM | Same as profile |
| Behavior Memory (wellness recommendations, completions) | MEDIUM | Subcollection owner isolation; no rule schema validation |
| Daily Guidance content | LOW | Auth-only with UID matching |
| Activity telemetry (screens, duration) | LOW | Admin/Founder read |
| Analytics events | LOW | Admin/Founder read |
| Billing/entitlement data | MEDIUM | Embedded in user doc; Founder bypass by rule design |
| Communications/inbox | MEDIUM | Dedicated subcollection rules; thread isolation |
| Admin audit logs | MEDIUM | Founder-only read/write |

Behavior Memory specific: logging risk LOW, stored-data sensitivity MEDIUM, overall privacy risk MEDIUM.

## 7. Logging and Telemetry

- Prohibited: logging of secrets, API keys, service-account contents, raw private payloads, real UIDs in error messages
- Behavior sync logger sanitizes errors, limits localStorage (20 records), and does not print UIDs or raw error messages (verified 15/15 privacy tests)
- Analytics and activity collections store telemetry for dashboard aggregation
- Known gaps: no systematic audit of all console.log/console.error calls across the codebase

## 8. AI Safety and Data Flow

- AI provider boundaries: Gemini API is called with constructed prompts; deterministic engines never delegate to AI
- Prompt construction in `lib/prompts/`: no raw user data exposed beyond what the service contract requires
- Generated guidance (Daily, Weekly) persists to Firestore with UID and date binding
- No end-to-end encryption claimed for AI provider communication
- Provider cascade (fallback) is configurable but not runtime-tested in Build 80

## 9. Billing and Entitlement Security

- Client-side integration uses Google Play Billing library 9.1.0
- Server-side verification function exists (`functions/index.js`) but NOT DEPLOYED
- Purchase token verification via Google Play Developer API before entitlement grant
- Idempotent via SHA-256 purchase token hash
- No real purchases, billing operations, or user mutations without explicit Founder approval
- Runtime testing (Valid/Expired/Refunded/Duplicate scenarios) PENDING

## 10. Android Security

| Control | Status |
|---|---|
| compileSdk | 36 |
| targetSdk | 36 |
| minSdk | 24 |
| AGP 9 compatibility bridge | ACTIVE (temporary) |
| Android build verification | assembleDebug PASS, lintDebug PASS |
| Runtime Android 16 QA | PENDING |
| Signing | PENDING (keystore not found; signing config absent from gradle) |
| App update plugin | Uses typed `InstallStatus.DOWNLOADING` (lint contract) |
| Capacitor Doctor | PASS |

## 11. Secret Management

- Firebase web configuration (`apiKey`, `authDomain`, `projectId`, etc.): client-exposed by design; not equivalent to server authorization
- Gemini API key: server-side environment variable (`GEMINI_API_KEY`, not `NEXT_PUBLIC_*`)
- Human Design Hub API key: server-side environment variable (`HUMAN_DESIGN_HUB_API_KEY`)
- Service-account credentials: environment variable only (`FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_ADMIN_PRIVATE_KEY`)
- `.env`, `.env.local`, `.env.*.local` ignored by `.gitignore`
- `*adminsdk*.json` and `*service-account*.json` excluded by `.gitignore`
- Release keystore: not configured in project — signing setup pending
- No real secrets committed to repository

## 12. Production Change Controls

| Operation | Authorization Required | Status |
|---|---|---|
| Firestore production read | Founder approval | Controlled |
| Firestore production write | Founder approval | Controlled |
| Rule deployment | Founder approval | NOT PERFORMED |
| Billing backend deployment | Founder approval | NOT PERFORMED |
| Build 80 APK/AAB creation | Founder approval | NOT PERFORMED |
| Play Console submission | Founder approval | NOT PERFORMED |
| Production release | Founder approval | NOT PERFORMED |

Implemented, committed, deployed, and verified are distinct states. A commit is not a deployment. A build is not a release.

## 13. Security Verification Status

| Control | Implementation | Test Evidence | Deployment Evidence | Status |
|---|---|---|---|---|
| Firestore Rules owner isolation | COMMITTED | Emulator (DG 29/29, BM 53/53) | NOT VERIFIED | PARTIAL |
| Communications matcher fix | COMMITTED | BM tests (53/53) | NOT VERIFIED | PARTIAL |
| Admin account exclusion | COMMITTED | 22/22 + 48/48 | NOT VERIFIED | INTEGRATED |
| Behavior memory privacy | COMMITTED | 15/15 privacy tests | NOT VERIFIED | INTEGRATED |
| Service-account .gitignore | COMMITTED | Verified | NOT DEPLOYED | IMPLEMENTED |
| Android API 36 | COMMITTED | Build/lint PASS | PENDING | BUILD VERIFIED |
| Billing backend | COMMITTED (function) | NOT RUN | NOT DEPLOYED | PENDING |
| Force-update | COMMITTED (client) | NOT RUN | NOT ACTIVATED | PENDING |

## 14. Known Risks and Follow-ups

- Firestore Rules production deployment not verified — Rules fix committed but not deployed
- Founder/Admin bypass runtime behavior not fully verified
- Rule schema validation absent for most collections
- Admin internal-account exclusion committed but not deployed to production
- Release signing not configured (keystore missing)
- Billing backend deployment and runtime verification pending
- Build 80 not released; no APK/AAB or Play Console submission made
- 21 pre-existing TSC errors — no new regression from recent changed files