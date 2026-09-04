@AGENTS.md

# BHUMI AMARTYA — OPERATIONAL ENTRYPOINT

```text
PRIMARY_AGENT      = CLAUDE_CODE / ANTIGRAVITY
CURRENT_PROGRAM    = BUILD_108_ENL_FOUNDATION
BUILD_108_PHASE    = FOUNDATION_AUDIT_AND_SPECIFICATION_COMPLETE
BUILD_108_STATUS   = NOT_STARTED
BASELINE           = BUILD 107 (versionCode 107, versionName 5.0.7, commit d2ecb5e)
```

Build 108 ENL is the **dedicated English-language edition** of Bhumi Amartya.
Its mission is to establish 100% complete, elegant, native English across all 51 routes, 11 blueprint
engines, AI guidance narratives, and legal surfaces, while inheriting 100% of Build 107 fixes and
continuity. DO NOT begin product code modifications before explicit Founder approval of the SOT.

## Mandatory reading order (before ANY analysis / code / test / build / deploy)

1. `BUILD_108_ENL_MASTER_SOT.md` — PRIMARY canonical product/architectural authority for Build 108 ENL
2. `BUILD_108_ENL_SCOPE_MATRIX.md` — canonical surface-by-surface status & classification ledger (51 routes)
3. `BUILD_108_ENL_HANDOFF.md` — developer & agent operational guidelines and sprint roadmap
4. `BUILD_108_ENL_RELEASE_PLAN.md` — mandatory 7-gate release and governance protocol
5. `BUILD_107_HOTFIX_RELEASE.md` — production baseline record (Build 107)
6. `AGENTS.md` & `RULES.md` — engineering/product invariants and repository operating rules

## Canonical authority order (highest first)

1. Current explicit Founder instruction for the task at hand
2. Authorized repository / runtime evidence from the Build 106 recovery worktree
3. `BUILD_106_MASTER_SOT.md`
4. `BUILD_106_RECOVERY_MATRIX.md`
5. `BUILD_106_AGENT_PROTOCOL.md`
6. Provenance-verified V5 documents recovered from checkpoint CP-036 (`036225f23b4c07636ab875f9939afbebdbdad9d7`)
7. Historical implementation / agent checkpoints / the protected forensic worktree
8. Legacy documentation

Root `SOT.md`, `PRD.md`, `TODO.md`, and the `BUILD_100_*.md` set are **historical / superseded**
for Build 106 and MUST NOT be used as product authority. See "Legacy document status" below.

## Authorized worktrees

```text
FORENSIC_WORKTREE = C:\tmp\bhumi-build83-access-hotfix   (branch feat/build99 @ 57479c9)              = READ ONLY forensic evidence
RECOVERY_WORKTREE = C:\tmp\bhumi-build106-recovery       (branch recovery/build106-product-continuity) = AUTHORIZED IMPLEMENTATION WORKSPACE
```

- ALL Build 106 code, documentation, tests, and commits happen in the **recovery worktree**.
- NEVER mutate the forensic worktree: no `git reset / clean / stash / restore / checkout / switch /
  commit / merge / rebase / cherry-pick / pull` there; do not delete its untracked files; do not
  mass-format it. Read only.
- Never use the shared git stash for this work (`git stash` is shared across all worktrees).

## Continuity protocol

- **Audit before reconstruction.** Find the last-known-good source before reimplementing from memory.
- **Historical source before reimplementation.** CP-036 (`036225f…`) is a verified high-value
  **orphan** snapshot. Recover it **file / hunk level with provenance recorded**. NO wholesale
  merge, checkout, or copy of CP-036 or of the forensic dirty worktree.
- **Preserve proven systems** unless the current requirement demonstrably requires touching them:
  billing ledger, ES256 signed entitlement, Firestore owner-isolation / rules, journal persistence,
  journey persistence, auth/setup recovery mechanics, signing configuration, JDK 17, Firebase
  production configuration.
- **Evidence before assumptions. Smallest safe diff.** No opportunistic refactor, no dependency
  upgrade, no architecture cleanup unrelated to the current requirement.
- Do not silently resolve documentation/implementation conflicts — report them to the Founder.

## Genuine-user rule

A sample, fixture, mock, seeded, demo, "Radita", audit-mock
(`lib/dailyGuidance/auditMocks.ts` → `getMockProfile` / `getMockBlueprint`), or precomputed
profile/blueprint MUST NOT be treated as proof that genuine new-user onboarding works.
`GATE_07_GENUINE_NEW_USER` requires a fresh non-sample account exercising:

`auth → profile bootstrap → setup → birth data → blueprint generation → Firestore persistence →
setup finalization → AuthContext refresh/re-read → dashboard → reload → logout/login → dashboard
remains valid`.

## Build / release safety — LOCKED

```text
VERSION_BUMP         = NOT AUTHORIZED
PRODUCTION_BUILD     = NOT AUTHORIZED
BUILD_106 APK / AAB  = NOT AUTHORIZED
DEPLOY               = NOT AUTHORIZED
PUBLISH              = NOT AUTHORIZED
RELEASE-READY CLAIM  = NOT PERMITTED
```

No `versionCode` / `versionName` change, no production build, no APK/AAB, no deploy, no publish,
and no claim of release readiness until the release gate defined in `BUILD_106_MASTER_SOT.md` is
fully evidence-backed AND the Founder explicitly authorizes release and versioning. Until then
`BUILD_106_ARTIFACT = DOES_NOT_EXIST`.

## Mandatory recovery order (Master SOT §7 / Agent Protocol §3)

1. Governance / canonical docs
2. Genuine-new-user lifecycle + stale-bootstrap race
3. Localization foundation (`id` / `en` / `ms`)
4. Journaling / CBT / data contracts
5. Memory / Daily Context / Daily Note
6. Astrology canonical synthesis + UI reconciliation
7. Environment / Schumann
8. Notifications / privacy / remaining canonical requirements
9. Premium copy / price
10. Full `R-PRD-01..46` reconciliation
11. Focused unit / emulator / browser / device tests
12. Fresh-account genuine-user acceptance test
13. Version bump / Build 106 artifact — LAST, and only after all release gates pass + Founder approval

Do not reorder because a later feature is easier to restore from CP-036.

## Project memory

Claude Code maintains file-based AgentMemory at
`C:\Users\shein\.claude\projects\C--Users-shein-bhumi-amartya-clean\memory\` (index `MEMORY.md`).
Update it after every meaningful milestone: worktree creation, doc reconciliation, provenance
decision, root-cause confirmation, lifecycle implementation, test results, design decisions,
commits, and blockers. Do not create a second competing memory system. Use labels
`VERIFIED` / `PROBABLE` / `HYPOTHESIS` / `UNVERIFIED` / `SUPERSEDED` / `BLOCKED`, and keep
`LAST_VERIFIED_HEAD`, `CURRENT_BRANCH`, `RECOVERY_STEP`, `FILES_CHANGED`, `TEST_RESULTS`,
`OPEN_GATES`, `NEXT_SAFE_ACTION` current.

## Required final report

Every Build 106 task report includes: authorized branch; initial HEAD; files changed; tests run
with exact exit codes / assertion totals; production reads and writes; commits created; tracked and
untracked worktree state; known limitations; the exact next recovery task; and exactly one marker of
`BUILD_106_RECOVERY_IN_PROGRESS` / `BUILD_106_RECOVERY_BLOCKED` /
`BUILD_106_RECOVERY_RECONCILED_AND_RELEASE_READY`. End with `STOP AND WAIT FOR FOUNDER REVIEW`
unless the Founder explicitly authorized continuous execution for the current batch.

---

# Repository map (current, still valid)

## Two separate repositories — do not confuse

### 1. APP / BILLING repository (this repository)

- Bhumi user application (Next.js, Capacitor Android)
- Billing (client + `services/billing-verifier` backend service)
- Human Design — canonical hotfix **CLOSED**; do not modify unless a regression is directly proven
- Legacy in-app admin routes `app/admin/**` — **LEGACY REFERENCE ONLY**; do not add new features there

### 2. FOUNDER DASHBOARD repository (SEPARATE repository)

- **Path:** `C:\tmp\bhumi-founder-dashboard` — **Branch:** `main`
- Standalone web Founder Dashboard, separate from the mobile Bhumi application.
- **Do NOT recreate it inside this repository. Do NOT implement Founder Dashboard work from here.**

## Responsibilities

| Concern | Repository |
|---|---|
| Bhumi user app (mobile + web) | APP/BILLING repo |
| Android app | APP/BILLING repo |
| Billing (client + verifier service) | APP/BILLING repo |
| Human Design | APP/BILLING repo |
| Legacy in-app admin (`app/admin/**`) | APP/BILLING repo — LEGACY REFERENCE ONLY |
| Standalone web Founder Dashboard | FOUNDER DASHBOARD repo (separate) |

## Policies (still valid)

- **MINIMAL DIFF rule:** no refactoring, no redesign, no renaming, no moving files, no unrequested
  abstractions. Shortest working diff wins. Document unrelated issues; do not implement them.
- **Legacy `app/admin/**`:** reference only; no investment unless a production blocker requires it.

## Legacy document status (for Build 106)

| Document(s) | Build 106 status |
|---|---|
| root `SOT.md`, `PRD.md`, `TODO.md` | **SUPERSEDED** — Build 80/85 era; not product authority. Retained as history. |
| `BUILD_100_*.md` | **HISTORICAL** — Build 100 context only. |
| "Build 85 Scope" section below | **HISTORICAL** — completed/closed task list, retained for reference only. |
| `V5_*.md` | **HISTORICAL CANONICAL** — adopt into Build 106 only after per-file provenance verification against `BUILD_106_MASTER_SOT.md` §1 item 6; see the V5 provenance ledger in `BUILD_106_RECOVERY_MATRIX.md`. |

---

# HISTORICAL — Build 85 Scope (SUPERSEDED; retained for reference only)

> The section below describes the Build 85 program. It is **not authoritative for Build 106** and
> is preserved per the "prefer supersession over deletion" rule. For current authority see the
> Build 106 entrypoint above.

## Status Summary (Build 85 era)

- **Human Design:** canonical fallback incident **CLOSED**. Do not modify unless a regression is directly proven.
- **Billing B1.1–B1.4:** PASS. **B1.4.1 unfinished** — runtime proof for silent-restore single-flight, restore cooldown, secure-storage persistence, cached entitlement, TTL, offline grace, grace expiry, UID/context mismatch, invalid signature, malformed entitlement, future timestamp, clock rollback, stale cache online. Founder approved OPTION A (debug/androidTest-only synthetic entitlement seam; production behavior unchanged; no fake entitlement in release; no authorization bypass). Do NOT claim B1.4.1 complete without an actual execution report.
- **Founder Dashboard:** lives in the separate repository (`C:\tmp\bhumi-founder-dashboard`). Trial status there must eventually use canonical entitlement (TRIAL / PREMIUM / FREE), not raw membership strings.

## Build 85 Scope

### A. Trial Presentation Fix — USER APP (P0) — DONE

Confirmed affected files: `app/upgrade/page.tsx`, `app/premium-bhumi/page.tsx`. Backend trial creation, Firestore trial fields, and billing entitlement were correct; the bug was PRESENTATION. Use canonical entitlement source (`getEntitlementStatus()`). Expected UI states: **TRIAL / PREMIUM / FREE**. Regression cover: `tests/unit/build85-trial-presentation.test.ts`.

### B. Billing B1.4.1 status continuation (P1) — PARTIAL 12/13, 1 DEVICE REMAINING

12/13 proven in Category A (non-Android, no QEMU). 1/13 remains **secure-storage persistence after force-stop** (requires a physical Android device). `billing-entitlement-contract.test.ts` + `trial-boundary.test.ts`: NOT VERIFIED — legacy env/import-order precondition; out of scope.

### C. Founder Dashboard (P1 — handoff note only)

Do NOT implement from app repo. The standalone dashboard lives in `C:\tmp\bhumi-founder-dashboard`.

### D. Welcome / Entry Screen Update (P1) — `app/page.tsx`

Small user-facing UI/copy update, no redesign: tagline → "Ruang Untuk Pulang kemudian Kenali Diri"; primary CTA → "Pengguna Baru"; real "Saya Sudah Punya Akun" button preserving login navigation; "CLOSED BETA V1.0" → "Versi 4"; lightweight Indonesia | English selector (placeholder acceptable — no full localization system in Build 85).

### E. Review & Rating Prompt (P1) — IMPLEMENTED / STATIC VERIFIED / RUNTIME E2E NOT VERIFIED

Existing implementation present and wired: `lib/rating/reviewTriggerService.ts`, `components/rating/DashboardReviewPrompt.tsx`, `components/rating/ReviewDialog.tsx`, `android/.../ReviewPlugin.java`, `scripts/validateDashboardReviewPrompt.ts`. Eligibility threshold is 3 days (`MIN_INSTALL_DAYS: 3`, `MIN_LOGIN_DAYS: 3`, `MIN_SESSIONS: 3`, `PROMPT_COOLDOWN_DAYS: 30`). No code change was required. Do NOT modify review eligibility logic or rewrite the popup flow.
