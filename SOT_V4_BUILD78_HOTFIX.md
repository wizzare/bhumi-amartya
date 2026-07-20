# Source of Truth: Bhumi Amartya V4 Build 78 Hotfix

**Status:** Canonical V4 Hotfix Baseline  
**Product:** Bhumi Amartya Platform  
**Target Release:** Version 4.4.1 (Build 78 Hotfix)  
**Baseline:** V4 Production Stable  
**Current Branch:** `hotfix/v4-build78-wellness-journey-sync`  
**Mode:** AGENTMEMORY DEGRADED MODE / HOTFIX-004 EXECUTED MODE  
**Owner:** Principal Software Architect & Product Owner  

---

## 1. Release Identity & Purpose

This document serves as the canonical Source of Truth (SoT) for the **Bhumi Amartya V4 Build 78 Hotfix release cycle**. It defines the verified facts, system architecture, data flow boundaries, backward compatibility constraints, and defect classifications for all seven reported production hotfix issues (`HOTFIX-001` through `HOTFIX-007`).

---

## 2. Workspace Safety & Degradation Status

- **Workspace Branch:** `hotfix/v4-build78-wellness-journey-sync`
- **Workspace Safety Status:** `SAFE WITH ISOLATION`
- **AgentMemory Operating Status:** `AGENTMEMORY DEGRADED MODE`
  - *Note:* Fallback memory source: Git log history, repository documentation, and audit ledgers.

---

## 3. Confirmed vs. Unverified Production Issues Audit

| Bug ID | Summary | Audit Classification | Confirmed Root Cause & Implementation Status |
| :--- | :--- | :--- | :--- |
| **HOTFIX-001** | Inbox fails with "Terjadi kesalahan saat memproses komunikasi." | **Partially Fixed** | Resolved in commit `828420f6` by adding fallback in-memory sorting for un-indexed Firestore `user_messages` queries. |
| **HOTFIX-002** | Admin broadcast created but not received in user Inbox | **Partially Fixed / Unverified** | `CommunicationRepository.getMessagesForUser` fetches direct user messages and broadcast targets, but query filtering drops broadcast entries if audience scope matching fails. |
| **HOTFIX-003** | Arsip Akashi remains unavailable despite completed profile/blueprint | **Unverified** | Flag evaluation boundary between blueprint completion calculation and Akashi archive access check in profile view state. |
| **HOTFIX-004** | Completing Wellness Recommendation Section 3 not recorded in Journey | **IMPLEMENTED & VALIDATED** | Root cause identified: `markJourneyRecommendationCompleted` in `wellnessCurationService.ts` early-returned when recommendation memory entry was undefined. Fix implemented to construct and persist memory entry to `journeyRepository`. Verified 100% PASS with test `tests/hotfix-004-wellness-journey-sync.test.ts`. |
| **HOTFIX-005** | Logout/login does not refresh newest application data | **Unverified** | Firebase `onAuthStateChanged` handler resets user context but does not invalidate or purge in-memory React state / local storage caches. |
| **HOTFIX-006** | Inbox "Coba Lagi" does not invalidate stale state or refetch | **Unverified** | UI error boundary component resets local `error` state variable without invalidating stale query cache or re-executing `fetchMessages()`. |
| **HOTFIX-007** | Inbox unread badge does not match message state | **Unverified** | Navigation badge counter calculates unread count independently from `user_messages` read states in Firestore. |

---

## 4. Canonical Data Flow & Fixed Boundary (HOTFIX-004)

### Wellness Recommendation Section 3 -> Journey Progress Pipeline:
```text
[ User Completes Wellness Section 3 UI ]
                  │
                  ▼
   [ Wellness Recommendation Component ]
                  │  (Calls acknowledgeWellnessActivity(uid, date, activityId))
                  ▼
   [ lib/services/wellnessCurationService.ts ]
                  │
     ┌────────────┴──────────────────────────┐
     ▼                                       ▼
[ Daily State ]             [ markJourneyRecommendationCompleted ]
(completedActivityIds saved) (Constructs/updates recommendations memory
                             & persists to journeyRepository)
                                             │
                                             ▼
                             [ Firestore: user_journey_daily ]
                             (wellnessState.wellnessV4.recommendations updated)
                                             │
                                             ▼
                             [ Journey Progress & Timeline Engine ]
                             (Reflects completed Section 3 activity)
```

---

## 5. Scope & Constraints

### In Scope (Build 78 Hotfix):
1. Fix Firestore query resilience for `user_messages` (`HOTFIX-001`, `HOTFIX-002`, `HOTFIX-006`, `HOTFIX-007`).
2. Restore Wellness Section 3 completion event propagation to Journey progress tracker (`HOTFIX-004` - COMPLETED).
3. Ensure Akashi archive access unlocks cleanly upon blueprint completion (`HOTFIX-003`).
4. Enforce cache invalidation and store purge on session logout (`HOTFIX-005`).
5. Maintain 100% build metadata synchronization across `package.json`, `android/app/build.gradle`, and `lib/config/buildInfo.ts` (`v4.4.1 Build 78`).

### Out of Scope:
- Schema changes in Firestore collections.
- UI redesign or component structural changes.
- V5 features or breaking API contract changes.

---

## 6. Success Metrics & Release Gate
- **TypeScript:** PASS (`npx tsc --noEmit` on affected files)
- **Build Sync:** PASS (`package.json`, `build.gradle`, `buildInfo.ts` all match `v4.4.1 Build 78`)
- **HOTFIX-004 Test Suite:** PASS (`tests/hotfix-004-wellness-journey-sync.test.ts` & `tests/sprint-e-hotfix.test.ts`)
- **HOTFIX-001 to HOTFIX-007:** Progressing through phased hotfix verification gates.
