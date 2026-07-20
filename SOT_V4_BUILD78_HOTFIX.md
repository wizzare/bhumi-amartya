# Source of Truth: Bhumi Amartya V4 Build 78 Hotfix

**Status:** Canonical V4 Hotfix Baseline  
**Product:** Bhumi Amartya Platform  
**Target Release:** Version 4.4.1 (Build 78 Hotfix)  
**Baseline:** V4 Production Stable  
**Current Branch:** `hotfix/v4-build78-wellness-journey-sync`  
**Mode:** AGENTMEMORY DEGRADED MODE  
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

## 3. Product Decision & Scope Constraints (HOTFIX-002)

> 📌 **APPROVED PRODUCT DECISION (Build 78):**  
> Build 78 broadcast delivery targets **only eligible existing users** in the `users` collection at dispatch time.  
> *V5 Backlog Note:* Retrospective delivery to users created during an active broadcast window is deferred to the V5 backlog.

---

## 4. Confirmed vs. Unverified Production Issues Audit

| Bug ID | Summary | Audit Classification | Confirmed Root Cause & Implementation Status |
| :--- | :--- | :--- | :--- |
| **HOTFIX-001** | Inbox fails with "Terjadi kesalahan saat memproses komunikasi." | **Partially Fixed** | Resolved in commit `828420f6` by adding fallback in-memory sorting for un-indexed Firestore `user_messages` queries. |
| **HOTFIX-002** | Admin broadcast created but not received in user Inbox | **IMPLEMENTED & LOCALLY VALIDATED** | Root cause: 1) `Promise.all` in `sendBroadcast()` rejected on single-user errors. 2) `beta-tester` target filter was missing canonical `testerBadge` / `guardianBadge` predicate. Hardened using `Promise.allSettled`, deterministic message IDs (`msg_${broadcastId}_${user.uid}`) for idempotency, and canonical tester predicate in `lib/services/communicationCenterService.ts`. Verified 100% PASS with test `tests/hotfix-002-broadcast-delivery.test.ts`. |
| **HOTFIX-003** | Arsip Akashi remains unavailable despite completed profile/blueprint | **Unverified** | Flag evaluation boundary between blueprint completion calculation and Akashi archive access check in profile view state. |
| **HOTFIX-004** | Completing Wellness Recommendation Section 3 not recorded in Journey | **IMPLEMENTED & VALIDATED** | Root cause: `markJourneyRecommendationCompleted` in `wellnessCurationService.ts` early-returned when recommendation memory entry was undefined. Fix implemented to construct and persist memory entry to `journeyRepository`. Verified 100% PASS with test `tests/hotfix-004-wellness-journey-sync.test.ts`. Commit `3b740fd9`. |
| **HOTFIX-005** | Logout/login does not refresh newest application data | **Unverified** | Firebase `onAuthStateChanged` handler resets user context but does not invalidate or purge in-memory React state / local storage caches. |
| **HOTFIX-006** | Inbox "Coba Lagi" does not invalidate stale state or refetch | **Unverified** | UI error boundary component resets local `error` state variable without invalidating stale query cache or re-executing `fetchMessages()`. |
| **HOTFIX-007** | Inbox unread badge does not match message state | **Unverified** | Navigation badge counter calculates unread count independently from `user_messages` read states in Firestore. |

---

## 5. Canonical Data Flow & Implementation (HOTFIX-002)

### Hardened Broadcast Delivery Engine:
```text
[ Admin Submits Broadcast UI ]
              │
              ▼
[ CommunicationCenterService.sendBroadcast ]
              │
   ┌──────────┴────────────────────────────────────────────────┐
   ▼                                                           ▼
[ Target Group Filter ]                               [ Promise.allSettled Fan-Out ]
• all: true                                           • Idempotent Msg ID: msg_${bcId}_${uid}
• premium: u.isPremium || u.membershipType           • Isolates per-user failures
• beta-tester: u.testerBadge || u.guardianBadge        • Computes deliveredCount & failedCount
                                                               │
                                                               ▼
                                                      [ Save Global Metadata ]
                                                      broadcasts/{broadcastId}
                                                      (Records attempted, delivered,
                                                       failed, and status: complete|partial|failed)
```

---

## 6. Scope & Constraints

### In Scope (Build 78 Hotfix):
1. Fix Firestore query resilience for `user_messages` (`HOTFIX-001`, `HOTFIX-002`, `HOTFIX-006`, `HOTFIX-007`).
2. Restore Wellness Section 3 completion event propagation to Journey progress tracker (`HOTFIX-004` - COMPLETED).
3. Harden Admin Broadcast delivery pipeline for existing users (`HOTFIX-002` - IMPLEMENTED & VALIDATED).
4. Ensure Akashi archive access unlocks cleanly upon blueprint completion (`HOTFIX-003`).
5. Enforce cache invalidation and store purge on session logout (`HOTFIX-005`).
6. Maintain 100% build metadata synchronization across `package.json`, `android/app/build.gradle`, and `lib/config/buildInfo.ts` (`v4.4.1 Build 78`).

### Out of Scope:
- Schema changes in Firestore collections.
- Retrospective broadcast fan-in for users created after dispatch (deferred to V5).
- UI redesign or component structural changes.
- V5 features or breaking API contract changes.

---

## 7. Success Metrics & Release Gate
- **TypeScript:** PASS (`npx tsc --noEmit` on affected files)
- **Build Sync:** PASS (`package.json`, `build.gradle`, `buildInfo.ts` all match `v4.4.1 Build 78`)
- **HOTFIX-004 Test Suite:** PASS (`tests/hotfix-004-wellness-journey-sync.test.ts`)
- **HOTFIX-002 Test Suite:** PASS (`tests/hotfix-002-broadcast-delivery.test.ts`)
- **Status:** PENDING DEVICE & PRODUCTION VALIDATION
