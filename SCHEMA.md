# Bhumi Amartya Data Schema

## 1. Scope and Evidence Rules

This schema is derived from committed repository code and Firestore Rules. TypeScript type definitions imply intended field shapes but do not automatically mean Firestore Rules validation. Where fields are inferred from TypeScript only and not enforced by Rules, this is explicitly marked. Sensitive values (real UIDs, email addresses, birth data, wellness answers) are not reproduced.

## 2. Identity Model

| Concept | Mechanism |
|---|---|
| Authentication identity | Firebase Auth UID |
| Owner UID | `request.auth.uid` bound via Firestore Rules |
| Document identity | Deterministic (`{uid}` or `{uid}_{date}`) or auto-ID |
| Admin identity | Founder email (`wizzare@gmail.com`) + `guardianRole` / `role` fields |
| Internal account exclusion | Email-based normalization in `adminAccountExclusions.ts` |

## 3. Firestore Path Inventory

### users/{uid}

| Property | Value |
|---|---|
| Purpose | User profile, settings, membership, participation metrics |
| Owner | User (UID) |
| Document ID | UID (deterministic) |
| Writers | User (client SDK), Founder/Admin (via Rules bypass) |
| Readers | User, Founder/Admin |
| Rules | Owner check + Founder/Admin bypass |
| Key fields | `email`, `displayName`, `birthDate`, `birthTime`, `birthCity`, `versionName`, `appVersion`, `buildNumber`, `versionCode`, `lastSeen`, `lastLoginAt`, `membershipType`, `guardianRole`, `testerBadge`, `participationMetrics.*` |
| Test evidence | Admin exclusion tests (22/22), legacy exclusion tests (48/48) |
| Status | COMMITTED IMPLEMENTATION |

### blueprints/{uid}

| Property | Value |
|---|---|
| Purpose | Calculated blueprint data (8 deterministic engine systems) |
| Owner | User (UID) |
| Document ID | UID (deterministic) |
| Writers | User (client SDK), Founder/Admin |
| Readers | User, Founder/Admin |
| Rules | Owner check + Founder/Admin bypass |
| Status | COMMITTED IMPLEMENTATION |

### user_activity/{docId}

| Property | Value |
|---|---|
| Purpose | Per-session activity records (app version, build, screen, duration) |
| Owner | User (`uid` field) |
| Document ID | `{uid}_{date}` (deterministic) |
| Writers | User (client SDK) — app open, screen change, session duration |
| Readers | User (`uidMatches`), Founder/Admin |
| Rules | `uidMatches("uid")` + Founder/Admin bypass |
| Key fields | `uid`, `date`, `appVersion`, `buildNumber`, `versionName`, `versionCode`, `lastLogin`, `lastSeen`, `lastScreen`, `totalSeconds`, `sessionCount` |
| Status | COMMITTED IMPLEMENTATION |

### analytics/{docId}

| Property | Value |
|---|---|
| Purpose | Event-based analytics (screen views, feature usage, funnel events) |
| Owner | System (Admin/Founder) |
| Document ID | Auto-ID |
| Writers | Client SDK (authenticated) |
| Readers | Founder/Admin only |
| Key fields | `uid`, `date`, `eventName`, `timestamp` |
| Status | COMMITTED IMPLEMENTATION |

### dailyGuidance/{docId}

| Property | Value |
|---|---|
| Purpose | Per-user per-day AI-generated daily guidance |
| Owner | User (`uid` field) |
| Document ID | `{uid}_{YYYY}_{MM}_{DD}` (deterministic) |
| Writers | Authenticated user (client SDK) — set/merge |
| Readers | Authenticated user (same UID), Founder/Admin |
| Rules | Auth-only with UID matching |
| Key fields | `uid`, `date`, `versionKey`, `content`, `createdAt`, `updatedAt` |
| Evidence | 29/29 emulator PASS; deterministic ID prevents duplicates; retry overwrites same doc |
| Known limitations | Cross-runtime dedup NOT PROVEN; last-write-wins risk PRESENT; in-memory cache UNBOUNDED |
| Status | EMULATOR VERIFIED (admitted) |

### users/{uid}/behaviorMemory/wellness

| Property | Value |
|---|---|
| Purpose | Wellness behavior recommendations, completions, skips, expirations |
| Owner | User (UID) — subcollection |
| Document ID | Deterministic (static path) |
| Writers | Repository methods: `ensureExists`, `recordRecommended`, `recordCompleted`, `recordSkipped`, `recordExpired` |
| Readers | User, Founder/Admin |
| Rules | Owner check (subcollection `behaviorMemory` matches after rules hardening) |
| Key fields | `contextCompletions` (array, bound 30), `seenRecommendationKeys` (array, bound 200), update/merge/atomic increment patterns |
| Write model | Transaction / set-merge / update / atomic increment |
| Preconditions | `ensureExists` required before `recordSkipped` and `recordExpired`; missing document returns NOT_FOUND |
| Schema validation | ABSENT in Firestore Rules |
| Privacy | Logging risk LOW; stored-data sensitivity MEDIUM; overall MEDIUM |
| Evidence | 53/53 emulator PASS; idempotency PROVEN; concurrency PASS |
| Status | EMULATOR VERIFIED (admitted) |

### users/{uid}/communications/{msgId}

| Property | Value |
|---|---|
| Purpose | User-to-Admin and Admin-to-user inbox messages |
| Owner | User (UID) — subcollection |
| Document ID | Auto-ID |
| Key fields | `uid`, `senderUid`, `senderRole`, `recipientRole`, `threadId`, `content`, `status`, `source` |
| Status | COMMITTED IMPLEMENTATION |

### Daily state and journal paths

- `dailyStates/{uid}/entries/{date}` — per-day check-in and wellness state
- `journals/{uid}/entries/{entryId}` — user journal entries
- `journeyDailyRecords/{uid}/entries/{date}` — daily journey record
- `healingProgress/{uid}` — emotional memory and healing progress
- `wellnessAssessments/{docId}` — wellness assessment records
- `meditations/{uid}/entries/{entryId}` — meditation entries
- `audioHealing/{uid}/entries/{entryId}` — audio healing entries

All follow the owner-UID + Founder/Admin bypass pattern with deterministic or auto-ID document identity.

### Billing and entitlement paths

- `functions/index.js` — server-side billing verification (Cloud Functions, NOT DEPLOYED)
- `users/{uid}` entitlement fields: `membershipType`, `isPremium`, `accessUntil`, `testerBadge`
- `billing_purchase_tokens` subcollection or embedded — purchase token tracking

Status: COMMITTED IMPLEMENTATION (client); backend deployment NOT VERIFIED.

## 4. Daily Guidance Schema

See `dailyGuidance/{docId}` above. Key design properties: deterministic document identity prevents Firestore auto-ID duplicates across retries; same-day guidance always writes to the same document; concurrent runtimes may produce last-write-wins; in-memory `Map` caches in-flight generation promises per UID+date but is not bounded for long-running runtimes.

## 5. Weekly Guidance Schema

Weekly guidance types and engine are admitted (see BUILD80_STATUS.md). The schema follows a per-user weekly structure. Full schema coverage, persistence behavior, and runtime verification remain follow-up items.

## 6. Behavior Memory Schema

See `users/{uid}/behaviorMemory/wellness` above. Key design properties: deterministic path; transaction-based writes for consistency; `contextCompletions` bounded at 30; `seenRecommendationKeys` bounded at 200; `recordSkipped`/`recordExpired` require prior `ensureExists`; missing document returns NOT_FOUND; no schema field validation in Firestore Rules; privacy sensitivity MEDIUM.

## 7. Analytics and Telemetry Schema

| Collection | Document ID | Content |
|---|---|---|
| `analytics` | Auto-ID | Event-based analytics with `uid`, `date`, `eventName`, `timestamp` |
| `user_activity` | `{uid}_{date}` | Session metadata including `appVersion`, `buildNumber`, `versionName`, `versionCode`, `lastLogin`, `lastSeen` |

Version/build metadata is user-scoped per session. Global build constants from `src/lib/version.ts` (4.4.1/Build 78) and `android/app/build.gradle` (4.4.4/Build 79) are not per-user version sources. Build 80 metadata (4.4.4/Build 80) is NOT YET IMPLEMENTED CONSISTENTLY IN COMMITTED METADATA.

## 8. Billing and Entitlement Schema

Entitlement state is stored in `users/{uid}` fields: `membershipType`, `isPremium`, `accessUntil` (timestamp), `testerBadge`, `guardianRole`. The billing server-side state machine and purchase token verification are implemented in `functions/index.js` but NOT DEPLOYED. Runtime verification of the full purchase-to-entitlement flow (Valid, Expired, Refunded, Duplicate scenarios) is PENDING.

## 9. Admin Data Model

- Eligible users derived from `users/{uid}` with internal accounts excluded
- Exclusion: two Founder-designated internal accounts matched by email (case-insensitive, whitespace-trimmed)
- Normalization produces a derived excluded UID set
- Filtering applied before: totals, DAU/WAU/MAU, retention cohorts, funnel stages, premium-source counts, paid conversion, feature reach, city/country analytics, exports, search, pagination, detail display
- Admin exclusion is display/aggregation filtering — no Auth or Firestore data is deleted

## 10. Rules Coverage Matrix

| Path | Authentication Required | Owner Check | Field Validation | Emulator Evidence | Deployment Status |
|---|---|---|---|---|---|
| `users/{uid}` | YES | PROVEN | PARTIAL (access fields) | Admin tests | NOT VERIFIED |
| `blueprints/{uid}` | YES | PROVEN | ABSENT | — | NOT VERIFIED |
| `user_activity/{docId}` | YES | PROVEN (`uidMatches`) | ABSENT | — | NOT VERIFIED |
| `analytics/{docId}` | YES | Admin/Founder only | ABSENT | — | NOT VERIFIED |
| `dailyGuidance/{docId}` | YES | PROVEN (auth+uid) | ABSENT | 29/29 | NOT VERIFIED |
| `users/{uid}/behaviorMemory/wellness` | YES | PROVEN (subcollection) | ABSENT | 53/53 | NOT VERIFIED |
| `users/{uid}/communications/{msgId}` | YES | PROVEN (dedicated rules) | PARTIAL | — | NOT VERIFIED |

## 11. Migration and Compatibility Notes

- `src/lib/version.ts` (4.4.1/Build 78) and `android/app/build.gradle` (4.4.4/Build 79): pre-existing discrepancy inherited from baseline
- Build 80 target (4.4.4/Build 80): NOT YET IMPLEMENTED CONSISTENTLY IN COMMITTED METADATA
- `Path.matches` defect in Firestore Rules: FIXED in committed branch; production deployment NOT VERIFIED

## 12. Schema Follow-ups

- Complete schema validation in Firestore Rules for behavior memory, daily guidance, and user subcollections
- Deploy and verify Firestore Rules in production
- Resolve version metadata discrepancy between web and Android
- Implement and commit Build 80 version metadata consistently
- Verify billing entitlement runtime flow end-to-end
- Test cross-runtime Daily Guidance deduplication