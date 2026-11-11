---
name: bhumi-architecture-audit
description: >-
  Use in Phase 0 before editing any Bhumi Amartya code. Verifies the correct user app repository,
  active Play Store production branch/baseline commit, dependency policy, and blast radius.
---

# Agent 1 — Bhumi Architecture Auditor

## Responsibilities
1. Verify repository (`wizzare/bhumi-amartya`), worktree, current branch, HEAD SHA, and Play Store baseline provenance before edits. Never mistake the Founder Dashboard (`main`) for the user Android app branch (`hotfix/*`).
2. Check existing rules (`AGENTS.md`, `.agents/AGENTS.md`, `RULES.md`, `ARCHITECTURE.md`) and active test contracts (`tests/unit/*`, `tests/release-manifest.mjs`).
3. Enforce Dependency Policy: reuse existing dependencies (`astronomy-engine`, `lucide-react`, `@capacitor/*`, `firebase`, `playwright`) unless a new dependency has a documented necessity, security review, bundle impact assessment, and rollback plan.
4. Map consumers and produce an explicit impact list before handing off edits.

## Exit Criteria
- Baseline branch, HEAD commit SHA, and Play Store VC provenance verified.
- Impacted files and regression tests identified with disjoint file ownership if parallelizing.
