# BHUMI AMARTYA — BUILD 106 AGENT PROTOCOL

Status: MANDATORY FOR ALL BUILD 106 AGENTS
Primary authority: `BUILD_106_MASTER_SOT.md`
Execution ledger: `BUILD_106_RECOVERY_MATRIX.md`

## 1. Before any edit

Every agent must read, in order:

1. `AGENTS.md`
2. `BUILD_106_MASTER_SOT.md`
3. `BUILD_106_RECOVERY_MATRIX.md`
4. `BUILD_106_AGENT_PROTOCOL.md`
5. relevant recovered V5 canonical documents and historical source only after provenance is verified.

Then report:

- authorized worktree path;
- current branch;
- current HEAD;
- `git status --short`;
- exact Build 106 requirement IDs being worked on;
- source provenance candidates;
- planned files to inspect/edit;
- tests that will be required before PASS.

Do not edit if the authorized worktree/branch is ambiguous or if unexpected tracked changes exist.

## 2. Build 106 is recovery-first

For every missing/regressed feature:

1. identify the canonical requirement;
2. inspect Build 105 implementation;
3. inspect checkpoint/history/protected source provenance;
4. compare at file/hunk level;
5. prefer recovery of original intended implementation;
6. only create new implementation after recoverable source is exhausted or proven incomplete;
7. preserve unrelated Build 105 hardening/security/release fixes;
8. add/update regression tests;
9. execute verification;
10. update `BUILD_106_RECOVERY_MATRIX.md` with evidence-backed status.

Never merge checkpoint `036225f…` wholesale.
Never copy the protected dirty worktree wholesale.
Never describe reconstructed code as historical restoration unless provenance proves it.

## 3. Mandatory recovery order

Unless the Founder explicitly changes priority:

1. Governance/canonical docs.
2. Genuine-new-user lifecycle and stale bootstrap race.
3. Localization foundation.
4. Journaling/CBT/data contracts.
5. Memory/Daily Context/Daily Note.
6. Astrology.
7. Environment/Schumann.
8. Notifications/privacy/remaining requirements.
9. Premium copy/price.
10. Full R-PRD-01..46 reconciliation.
11. Full verification.
12. Founder release approval.
13. Version bump/build artifact.

## 4. New-user acceptance rules

Radita, mock users, audit fixtures, pre-existing profiles, and precomputed blueprints are NOT valid proof of genuine-new-user success.

PASS requires a fresh normal-user path exercising:

`auth -> profile bootstrap -> setup -> birth data -> blueprint generation -> Firestore persistence -> setup finalization -> AuthContext refresh/re-read -> dashboard`

The deterministic late-bootstrap overwrite race must have an executed regression test.

## 5. Evidence requirements

A requirement can be marked `PASS` only when evidence appropriate to that requirement has executed successfully.

Examples:

- source inspection alone: not PASS;
- test written but not run: not PASS;
- emulator pass for runtime UI: partial only;
- sample account works: not genuine-user PASS;
- route returns HTTP 200: not browser rendering PASS;
- commit exists: not production/runtime PASS;
- recovered file exists: `RECOVERED_UNVERIFIED`, not PASS.

Record exact command, exit code, assertion/test totals when available, and environment used.

## 6. Safety

Without explicit Founder authorization, agents must not:

- deploy;
- publish;
- change Play Console state;
- perform production data writes;
- make real billing/purchase operations;
- force push;
- merge/rebase/cherry-pick wholesale recovery branches;
- reset/clean/stash/restore protected dirty worktrees;
- delete untracked historical evidence;
- bump versionCode/versionName;
- create Build 106 APK/AAB release artifacts.

## 7. Required change discipline

For each recovery unit, keep scope minimal and report:

- requirement IDs;
- regression class;
- provenance source;
- files changed;
- files intentionally preserved;
- tests added/updated;
- tests executed;
- exact results;
- remaining gaps;
- matrix rows updated.

Do not opportunistically refactor unrelated areas.

## 8. Release gate

Before any request to version/build/release, the agent must explicitly verify against `BUILD_106_MASTER_SOT.md` that:

- all 46 requirements are reconciled;
- no release-critical regression remains open;
- genuine-new-user flow passes;
- source provenance conflicts are resolved;
- affected emulator/browser/device tests pass;
- Founder has approved release creation.

If any item is false, report:

`BUILD_106_RELEASE_GATE = CLOSED`

and continue recovery instead of building.

## 9. Required final report marker

Every Build 106 task report must include one of:

- `BUILD_106_RECOVERY_IN_PROGRESS`
- `BUILD_106_RECOVERY_BLOCKED`
- `BUILD_106_RECOVERY_RECONCILED_AND_RELEASE_READY`

The final marker may only be used when supported by the Master SOT definition of done and Founder approval.

Every report must end with the exact next recovery task and `STOP AND WAIT FOR FOUNDER REVIEW` unless the Founder explicitly instructed continuous execution.