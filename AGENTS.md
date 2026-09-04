<!-- BEGIN:build108-enl-entrypoint -->
# BUILD 108 ENL — MANDATORY OPERATIONAL ENTRYPOINT

For ANY Build 108 ENL analysis, documentation, coding, testing, build, or release work, agents MUST read these files BEFORE touching source:

1. `BUILD_108_ENL_MASTER_SOT.md` — PRIMARY canonical product and architectural authority for Build 108 ENL.
2. `BUILD_108_ENL_PAGE_AUDIT.md` — canonical 51-route read-only audit report and copy gap analysis.
3. `BUILD_108_ENL_SCOPE_MATRIX.md` — canonical surface-by-surface classification & status ledger across all 51 routes.
4. `BUILD_108_ENL_SPRINT_PLAN.md` — data-driven 8-sprint implementation sequence.
5. `BUILD_108_ENL_HANDOFF.md` — developer & agent operational guidelines and sprint roadmap.
6. `BUILD_108_ENL_RELEASE_PLAN.md` — mandatory 7-gate release and governance protocol.
7. `BUILD_107_HOTFIX_RELEASE.md` — authoritative record of the Build 107 production baseline.
8. `RULES.md` — engineering and product invariants where not superseded by explicit Build 108 ENL rules.

### Production Baseline & Continuity Rule

Build 107 (`versionCode = 107`, `versionName = "5.0.7"`, commit `d2ecb5e`) is the PRODUCTION baseline. Build 108 ENL must inherit 100% of Build 107 fixes (Human Design convergence, withdrawal of admin console from production UI, removal of stale orphan routes, lifetime authorization, and static surface guards). Nothing from Build 107 may regress.

### Build 108 ENL Authority Rule

For Build 108 ENL, conflict order is:

Founder explicit instruction for the current task → authorized repository/runtime evidence → `BUILD_108_ENL_MASTER_SOT.md` → `BUILD_108_ENL_SCOPE_MATRIX.md` → `BUILD_108_ENL_HANDOFF.md` → `BUILD_108_ENL_RELEASE_PLAN.md` → `BUILD_107_HOTFIX_RELEASE.md` → historical Build 106 records → legacy docs/chat memory.

### Build 108 Release Restriction

`BUILD_108_ENL_IMPLEMENTATION_STATUS = NOT_STARTED`.
Agents MUST NOT modify product code, bump versionCode/versionName, create an APK/AAB, deploy, publish, or claim release readiness until explicit Founder sign-off is granted.
<!-- END:build108-enl-entrypoint -->

<!-- BEGIN:canonical-agent-rules -->
# Bhumi Amartya — Agent Operating Contract

## 1. Purpose and Authority

This document controls repository-operating behavior for coding agents working on the Bhumi Amartya codebase. Founder instructions and task-specific authorization remain the highest authority. For Build 106, `BUILD_106_MASTER_SOT.md` defines product and recovery truth. `RULES.md` defines engineering and product invariants where not superseded by explicit Build 106 recovery rules.

## 2. Authorized Worktree and Branch

- Work only inside the exact Founder-authorized worktree path supplied in each task.
- Verify `git branch --show-current`, `git rev-parse HEAD`, and `git status --short` before any edit.
- Do not assume the clean or default worktree is authorized.
- Never touch another dirty worktree without explicit authorization.

## 3. Audit Before Edit

- Inspect consumers, contracts, rules, tests, and provenance before modifying a file.
- Distinguish tracked, staged, and untracked state explicitly in reports.
- Stop when unexpected tracked changes exist; do not proceed without resolution.
- Never describe reconstructed source as "historical baseline restoration."

## 4. Minimal Scope and Diff

- Edit only the files explicitly authorized in the task.
- No opportunistic refactor, formatting churn, or unrelated dependency changes.
- Separate source, tests, rules, and governance into appropriate commits.
- Report exact file-level diff statistics.

## 5. Evidence and Claim Discipline

- Do not report PASS without executed evidence (exit code, assertion count, or log).
- HTTP route success is not browser rendering verification.
- Emulator PASS is not production deployment.
- Committed code is not proof that production uses it.
- A test plan is not an implementation.
- Partial verification must remain labelled partial.
- Exact exit codes and assertion totals must be reported.
- `npx tsc --noEmit` exit code nonzero always means repository-wide TSC FAIL.

## 6. Git Safety

Prohibited without Founder approval: `git clean`, reset, restore of unrelated files, stash, rebase, merge, cherry-pick, amend, force push, deleting untracked files, changing another worktree.

- Never push unless explicitly authorized.
- Never deploy unless explicitly authorized.
- Never combine unrelated scopes in a single commit.

## 7. Untracked Files

- Preserve by default. Do not stage accidentally.
- Do not treat untracked files as canonical.
- Read only when explicitly relevant to the task.
- Provenance must be documented before adoption into governance.

## 8. Production Safety

- Production reads and writes require explicit Founder authorization.
- Use synthetic project IDs and localhost emulators for tests.
- Fail closed when emulator environment variables are missing.
- Never use service-account credentials for client-rule tests.
- No real purchases, billing operations, user mutations, or release actions without Founder approval.

## 9. Security, Privacy, and PII

- No secrets, API keys, keystore passwords, or service accounts in reports.
- Do not print real UID, email, birth data, wellness answers, or payloads.
- Use synthetic identities in tests.
- Sanitize errors and logs.
- Distinguish logging risk from stored-data sensitivity.

## 10. Testing and Validation

Require appropriate tests for: consumer contracts; authentication and owner isolation; same-user positive access; cross-user rejection; idempotency; concurrency; Firestore Rules runtime behavior; bounds and retention; failure conditions; production fail-closed guards.

## 11. Release Restrictions

No claim of release without: coherent versionName/versionCode; APK or AAB evidence; signing evidence; regression results; browser and device QA where required; deployment evidence for Firestore or backend changes; Founder approval.

## 12. Required Final Report

Every task report should include: authorized branch; initial HEAD; files changed; tests run; exact exit codes; production reads and writes; commits created; tracked worktree state; untracked files preserved; known limitations; exact next task; `STOP AND WAIT FOR FOUNDER REVIEW`.
<!-- END:canonical-agent-rules -->

<!-- BEGIN:build100-entrypoint -->
# BUILD 100 — HISTORICAL CONTEXT ENTRYPOINT

For Build 100-specific historical work only:

1. `BUILD_100_MASTER_SOT.md`
2. `BUILD_100_AGENT_PROTOCOL.md`
3. `BUILD_100_DECISION_LOG.md`
4. related Build 100 documents.

For Build 106, this section is historical context and is superseded by the Build 106 entrypoint above.
<!-- END:build100-entrypoint -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing framework-sensitive code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:v5-entrypoint -->
# V5 — HISTORICAL CANONICAL CONTEXT

The V5 documentation set remains important historical/product evidence, but Build 105 does not contain the complete canonical V5 set. For Build 106, recovered V5 documents may only be adopted after provenance verification and reconciliation under `BUILD_106_MASTER_SOT.md`.

For Build 106, the Build 106 entrypoint above always wins.
<!-- END:v5-entrypoint -->
