# Product Requirement Document: Bhumi Amartya V4 Build 78 Hotfix

**Status:** Canonical V4 Hotfix PRD  
**Target Version:** 4.4.1 (Build 78)  
**Branch:** `hotfix/v4-build78-wellness-journey-sync`  
**Mode:** AGENTMEMORY DEGRADED MODE / HOTFIX-004 EXECUTED MODE  
**Owner:** Product Owner & QA Lead  

---

## 1. Executive Summary

The V4 Build 78 Hotfix is a targeted stability release designed to eliminate critical communication errors in the user Inbox, restore cross-module progress synchronization between Wellness Recommendations and the Journey timeline, fix stale user session state on authentication changes, and ensure Akashi archive accessibility.

---

## 2. User Problems & User Stories

### Problem 1: Inbox Communication Disruption (HOTFIX-001, HOTFIX-002, HOTFIX-006, HOTFIX-007)
- **User Story:** As a user, I want my inbox to load messages reliably, receive administrative broadcasts, refresh on retry, and display an accurate unread counter so that I stay connected with my companion.

### Problem 2: Lost Progress Synchronization (HOTFIX-004) [RESOLVED]
- **User Story:** As a growth seeker, when I complete Wellness Recommendation Section 3, I expect my Journey timeline to instantly reflect this milestone so that my progress is accurately tracked.

### Problem 3: Gated Archive Access (HOTFIX-003)
- **User Story:** As a user with a completed blueprint, I want immediate access to Arsip Akashi so that I can explore my deep soul insights without obstruction.

### Problem 4: Stale Auth Session State (HOTFIX-005)
- **User Story:** As a user switching accounts or logging out, I want all prior user data cleared instantly so that private insights are never leaked between sessions.

---

## 3. Functional Requirements per Hotfix

| Requirement ID | Target Issue | Specification | Implementation Status |
| :--- | :--- | :--- | :--- |
| **FR-78-001** | HOTFIX-001 | `CommunicationRepository` must execute Firestore `user_messages` queries with in-memory fallback sorting if composite indexes are building. | **Partially Fixed (Commit 828420f6)** |
| **FR-78-002** | HOTFIX-002 | Admin broadcast messages must be correctly targeted and queryable by all active users in their inbox view. | **Pending Audit** |
| **FR-78-003** | HOTFIX-003 | Arsip Akashi accessibility state must evaluate `profile.isComplete` and `blueprint.isCalculated` accurately without false negative blocks. | **Pending Audit** |
| **FR-78-004** | HOTFIX-004 | Completing Wellness Section 3 must synchronously update the Journey daily record recommendations memory in `journeyRepository`. | **IMPLEMENTED & VALIDATED** |
| **FR-78-005** | HOTFIX-005 | `onAuthStateChanged` logout handler must purge all in-memory caches, local storage keys, and React query states. | **Pending Implementation** |
| **FR-78-006** | HOTFIX-006 | Clicking "Coba Lagi" in the Inbox error boundary must reset error state, purge query cache, and re-fetch messages from Firestore. | **Pending Implementation** |
| **FR-78-007** | HOTFIX-007 | Unread message badge counter must dynamically subscribe to real-time `user_messages` where `read == false`. | **Pending Implementation** |

---

## 4. Non-Functional & Quality Requirements

- **Backward Compatibility:** All Firestore document schemas and client API contracts must remain strictly unmodified.
- **Zero Breaking Changes:** Web and Android runtime compatibility must be maintained.
- **Performance Integrity:** Operations must run without UI thread freeze or unhandled promise rejections.

---

## 5. Acceptance Criteria per Hotfix

1. **AC-001:** Inbox loads without "Terjadi kesalahan saat memproses komunikasi" error under all network/index conditions.
2. **AC-002:** Broadcast message sent by Admin appears in targeted user inbox upon fetch.
3. **AC-003:** Arsip Akashi tab unlocks immediately when profile blueprint calculation completes.
4. **AC-004:** Section 3 completion in Wellness updates Journey daily record recommendations memory immediately and idempotently on retry.
5. **AC-005:** Logging out and logging in as a different user displays zero data from the previous session.
6. **AC-006:** Clicking "Coba Lagi" triggers a true network refetch and hides error banner upon recovery.
7. **AC-007:** Unread badge count matches exact count of unread documents in `user_messages`.

---

## 6. Regression Risks & Rollback Strategy

- **Regression Surface:** `communicationRepository.ts`, `wellnessCurationService.ts`, `authActions.ts`, `journeyRepository.ts`.
- **Rollback Strategy:** Revert hotfix commits and redeploy Build 77 AAB package if critical regressions occur in production.
