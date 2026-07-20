# Technical To-Do: Bhumi Amartya V4 Build 78 Hotfix

**Status:** Canonical Implementation Roadmap  
**Target Release:** Build 78 (Version 4.4.1)  
**Branch:** `hotfix/v4-build78-wellness-journey-sync`  
**Mode:** AGENTMEMORY DEGRADED MODE / HOTFIX-004 EXECUTED MODE  
**Owner:** Technical Lead & Principal Architect  

---

## Task Matrix & Implementation Phases

### R0 — Workspace and Baseline Safety
- [x] **TASK-R0-1:** Perform workspace safety classification and branch isolation.  
  - **Priority:** P0 | **Severity:** High | **Owner:** Architect  
  - **Status:** `COMPLETED` (Created branch `hotfix/v4-build78-wellness-journey-sync`).

### R1 — AgentMemory Configuration Clarification
- [x] **TASK-R1-1:** Audit AgentMemory MCP configuration and document degraded mode fallback.  
  - **Priority:** P1 | **Severity:** Medium | **Owner:** Infrastructure  
  - **Status:** `COMPLETED` (Marked `AGENTMEMORY DEGRADED MODE`).

### R2 — Inbox Read Pipeline (HOTFIX-001)
- [x] **TASK-R2-1:** Validate Firestore `user_messages` query resilience and fallback sorting.  
  - **Priority:** P0 | **Severity:** Critical | **Owner:** Shared / Repository  
  - **Affected File:** `lib/repositories/communicationRepository.ts`  
  - **Status:** `COMPLETED IN REPO (Commit 828420f6)`  

### R3 — Broadcast Delivery Pipeline (HOTFIX-002)
- [ ] **TASK-R3-1:** Audit broadcast target mapping and verify user inbox query inclusion.  
  - **Priority:** P1 | **Severity:** High | **Owner:** Backend / Repository  
  - **Affected File:** `lib/repositories/communicationRepository.ts`, `lib/services/communicationCenterService.ts`  
  - **Validation Method:** Run broadcast delivery script simulation.  
  - **Status:** `PENDING NEXT TASK AUDIT`

### R4 — Arsip Akashi Availability State (HOTFIX-003)
- [ ] **TASK-R4-1:** Trace blueprint completion condition against Akashi archive unlock status.  
  - **Priority:** P1 | **Severity:** Medium | **Owner:** Frontend / Profile  
  - **Affected File:** `lib/profile/narrativeHumanizer.ts`, `app/admin/insights/`  
  - **Validation Method:** Verify blueprint calculated flag propagation.  
  - **Status:** `PENDING AUDIT`

### R5 — Wellness Section 3 -> Journey Progress Synchronization (HOTFIX-004)
- [x] **TASK-R5-1:** Ensure `markJourneyRecommendationCompleted` constructs and persists recommendation memory to `journeyRepository` when undefined.  
  - **Priority:** P0 | **Severity:** High | **Owner:** Shared / Wellness & Journey  
  - **Affected Files:** `lib/services/wellnessCurationService.ts`, `tests/hotfix-004-wellness-journey-sync.test.ts`  
  - **Validation Method:** Executed unit test `tests/hotfix-004-wellness-journey-sync.test.ts` & `tests/sprint-e-hotfix.test.ts`.  
  - **Status:** `[x] COMPLETED & LOCALLY VALIDATED (PASS)`

### R6 — Session, Retry, Cache, and Unread Counter (HOTFIX-005, HOTFIX-006, HOTFIX-007)
- [ ] **TASK-R6-1:** Add cache purge on `onAuthStateChanged` logout (`HOTFIX-005`).  
  - **Priority:** P1 | **Severity:** High | **Owner:** Frontend / Auth  
  - **Affected File:** `lib/auth/authActions.ts`  
  - **Status:** `PENDING IMPLEMENTATION`
- [ ] **TASK-R6-2:** Repair "Coba Lagi" retry handler to purge query cache and re-fetch (`HOTFIX-006`).  
  - **Priority:** P1 | **Severity:** Medium | **Owner:** Frontend / UI  
  - **Affected File:** `app/inbox/page.tsx`  
  - **Status:** `PENDING IMPLEMENTATION`
- [ ] **TASK-R6-3:** Bind unread badge counter directly to Firestore unread message state (`HOTFIX-007`).  
  - **Priority:** P2 | **Severity:** Low | **Owner:** Frontend / Header  
  - **Affected File:** `lib/repositories/communicationRepository.ts`  
  - **Status:** `PENDING IMPLEMENTATION`

### R7 — Regression Validation
- [x] **TASK-R7-1:** Run regression test suite (`tests/hotfix-004-wellness-journey-sync.test.ts` & `tests/sprint-e-hotfix.test.ts`).  
  - **Priority:** P0 | **Severity:** High | **Owner:** QA  
  - **Status:** `[x] COMPLETED (17/17 PASS & 1/1 PASS)`

### R8 — Five-User Production Validation
- [ ] **TASK-R8-1:** Execute five-user scenario simulation across Dashboard, Profile, Journey, Wellness, and Inbox.  
  - **Priority:** P0 | **Severity:** High | **Owner:** QA Lead  
  - **Status:** `PENDING VALIDATION PHASE`

### R9 — Release Decision
- [ ] **TASK-R9-1:** Verify Build 78 metadata sync (`package.json`, `build.gradle`, `buildInfo.ts`) and sign off hotfix release.  
  - **Priority:** P0 | **Severity:** Critical | **Owner:** Release Manager  
  - **Status:** `PENDING RELEASE GATE`
