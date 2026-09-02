<!-- BEGIN:build106-entrypoint -->
# BUILD 106 — MANDATORY RECOVERY ENTRYPOINT

For ANY Build 106 analysis, coding, testing, recovery, build, or release work, agents MUST read these files BEFORE touching source:

1. `BUILD_106_MASTER_SOT.md` — PRIMARY canonical product/recovery authority for Build 106.
2. `BUILD_106_RECOVERY_MATRIX.md` — canonical R-PRD-01..46 execution/status ledger.
3. `BUILD_106_AGENT_PROTOCOL.md` — mandatory recovery, evidence, safety, and release-gate procedure.
4. `RULES.md` — engineering/product invariants where not superseded by explicit Build 106 recovery rules.
5. Historical/recovered V5 documents only after provenance is verified against the Build 106 Master SOT.

### Build 106 authority rule

For Build 106, conflict order is:

Founder explicit instruction for the current task → authorized repository/runtime evidence → `BUILD_106_MASTER_SOT.md` → `BUILD_106_RECOVERY_MATRIX.md` → `BUILD_106_AGENT_PROTOCOL.md` → provenance-verified recovered V5 canonical documents → historical implementation evidence → legacy docs/chat memory.

`SOT.md`, `PRD.md`, and `TODO.md` at repository root target the Build 80/85 era and MUST NOT be used as Build 106 product authority.

The older Build 100 and generic V5 entrypoints below are historical context only when working on Build 106. They MUST NOT override the three Build 106 files above.

### Build 106 release restriction

Build 106 is a product-continuity recovery and reconciliation release, NOT a normal feature build and NOT a four-bug hotfix.

Agents MUST NOT bump versionCode/versionName, create a Build 106 APK/AAB, deploy, publish, or claim release readiness until the release gate defined in `BUILD_106_MASTER_SOT.md` is evidence-backed and Founder-approved.

If uncertain, stop normal feature work and return to the Build 106 recovery manifest.
<!-- END:build106-entrypoint -->

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
