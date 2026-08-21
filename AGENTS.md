<!-- BEGIN:canonical-agent-rules -->
# Bhumi Amartya — Agent Operating Contract

## 1. Purpose and Authority

This document controls repository-operating behavior for coding agents working on the Bhumi Amartya codebase. Founder instructions and task-specific authorization remain the highest authority. SOT.md defines product and release truth. RULES.md defines engineering and product invariants.

## 2. Authorized Worktree and Branch

- Work only inside the exact Founder-authorized worktree path supplied in each task.
- Verify git branch --show-current, git rev-parse HEAD, and git status --short before any edit.
- Do not assume the clean or default worktree is authorized.
- Never touch another dirty worktree without explicit authorization.

## 3. Audit Before Edit

- Inspect consumers, contracts, rules, tests, and provenance before modifying a file.
- Distinguish tracked, staged, and untracked state explicitly in reports.
- Stop when unexpected tracked changes exist; do not proceed without resolution.
- Never describe reconstructed source as \"historical baseline restoration.\"

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
- 
px tsc --noEmit exit code nonzero always means repository-wide TSC FAIL.

## 6. Git Safety

Prohibited without Founder approval: git clean, eset, estore of unrelated files, stash, ebase, merge, cherry-pick, mend, orce push, deleting untracked files, changing another worktree.

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

Every task report should include: authorized branch; initial HEAD; files changed; tests run; exact exit codes; production reads and writes; commits created; tracked worktree state; untracked files preserved; known limitations; exact next task; STOP AND WAIT FOR FOUNDER REVIEW.
<!-- END:canonical-agent-rules -->

<!-- BEGIN:build100-entrypoint -->
# BUILD 100 — CANONICAL CONTEXT ENTRYPOINT

For any Build 100 work, read BEFORE analysis/coding/testing/build/deploy:

1. BUILD_100_MASTER_SOT.md — canonical source of truth.
2. BUILD_100_AGENT_PROTOCOL.md — mandatory before/during/after rules for ALL agents.
3. BUILD_100_DECISION_LOG.md — ratified Founder decisions.
4. BUILD_100_PRD.md, BUILD_100_TODO.md, BUILD_100_KNOWN_ISSUES.md, BUILD_100_RELEASE_PROVENANCE.md, BUILD_100_CONTEXT_CONFLICTS.md, DOCUMENTATION_INVENTORY_BUILD100.md.
5. AgentMemory (recall prior Bhumi / Daily Guidance / Release Provenance decisions).

Conflict order: repo/runtime evidence → Master SOT → Decision Log → AgentMemory → historical docs → agent chat memory. Do not silently resolve conflicts; report to Founder.

> NOTE: SOT.md / PRD.md / TODO.md at repo root target **Build 85** and are SUPERSEDED for Build 100. The Build 100 mandate (BUILD100_CATATAN_HARI_INI_SOT_PRD_TODO.md) is the authoritative contract; it lives outside this worktree (see BUILD_100_CONTEXT_CONFLICTS.md C-06).
<!-- END:build100-entrypoint -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in 
ode_modules/next/dist/docs/ before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:v5-entrypoint -->
# V5 — CANONICAL CONTEXT ENTRYPOINT

For any V5 work, read BEFORE analysis/coding/testing/build/deploy:

1. V5_SOURCE_OF_TRUTH.md — canonical source of truth for V5 product.
2. V5_PRD.md — functional product requirements.
3. V5_DECISION_LOG.md — ratified Founder + ChatGPT decisions.
4. V5_TODO.md — phased task list (P0–P8).
5. DOCUMENTATION_INDEX.md — navigation index for all canonical V5 docs.
6. V4_AUDIT_BUILD_99_100.md — V4 audit evidence and closure requirements.
7. V4_UNFINISHED_WORK.md — V4 closure list.

Conflict order: repo/runtime evidence → V5_SOURCE_OF_TRUTH.md → V5_DECISION_LOG.md → historical docs → agent chat memory. Do not silently resolve conflicts; report to Founder.

> NOTE: Root SOT.md / PRD.md / TODO.md target **Build 85** and are superseded for V5 work. The canonical V5 documentation set is the V5_*.md files in this repository.
<!-- END:v5-entrypoint -->
