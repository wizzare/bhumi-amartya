# Founder Decision Package

## Status
PREPARATION COMPLETE. NO COMMIT CREATED. NO PUSH PERFORMED.

---

## What was done
1. Verified clean git state (no active merge/rebase/cherry/revert).
2. Cleared the pre-existing staged index with `git reset HEAD --`.
   No file was deleted or modified in the working tree.
3. Switched to the pre-existing recovery/v4-build72-checkpoint branch
   (same baseline HEAD bc18430d, no upstream, no reset).
4. Preserved both stashes untouched.
5. Wrote 11 evidence artifacts under
   recovery-evidence/pre-r10a-safe-checkpoint/.

## What was NOT done
- No commit was created on any branch.
- No push to any remote.
- No tag, amend, rebase, or squash.
- No file was deleted, restored, or rewritten.
- No application logic was modified.
- No stash was applied, popped, or dropped.
- No validation was executed (validation must run BEFORE commit).
- No secrets were inspected or printed.
- The release/build70-production branch remains at bc18430d,
  with no changes from this session.

## Remaining Founder decisions (in order of importance)

### DECISION A — Destructive deletions
Approve one of the following for the 4 destructive deletions:
  A1. EXCLUDE all four from every commit (safest).
  A2. Include only secure/bhumiamartya-adminsdk.json.json in an
      ISOLATED security commit:
        `security(repo): remove tracked Firebase admin credential`
  A3. Include all four in a single ISOLATED commit:
        `chore(build70): remove web-only routes, pages, and credentials`
Recommendation: A2.

### DECISION B — Package and config files
Approve inclusion of:
  - package.json (with or without package-lock.json)
  - tsconfig.json
in one of the V4 commits, OR exclude them all.
Recommendation: defer; do NOT include without diff inspection.

### DECISION C — Communication / Inbox / Admin / Metrics
These are explicitly excluded per Founder Phase 6.
Confirm: YES, exclude all.

### DECISION D — Documentation commit (COMMIT 6)
Approve inclusion of the listed V4 source-of-truth governance docs
in a single docs commit, OR exclude all and rely on existing
untracked status.
Recommendation: include only the V4-tagged and Build 70/71/72
release reports explicitly listed.

### DECISION E — Stash disposition
The two governance-doc stashes predate this session.
Confirm: leave both stashes untouched for now.

### DECISION F — Android packaging and AAB
Approve exclusion of:
  - android/test.java, test.txt, test_write.txt, v4_test.txt
  - android/app/.../Test.java, ReviewPlugin.java
  - aab_check/, build_aab.bat, verify_aab.ps1
  - android/PROFILE_V4_RUNTIME_REPORT.md (until classified)
Recommendation: YES, exclude.

### DECISION G — Commit granularity
Approve the 6-commit plan (1..6 + optional isolated security commit),
OR collapse to fewer commits.
Recommendation: keep 6 commits for traceability.

### DECISION H — Validation execution
Approve running:
  - Targeted tsc on each group's changed files
  - Targeted ESLint on each group's changed files
  - Group-specific validators (Astrocartography 58/58, Zi Wei 80/80,
    Whole Sign 54/54, Vedic 63/63, plus the 7 others)
BEFORE committing.
Recommendation: YES.

---

## Final state machine
PREPARATION: PASS
COMMIT: NOT EXECUTED (waiting on Founder decisions)
PUSH: NOT EXECUTED
DELIVERY: recovery-evidence/pre-r10a-safe-checkpoint/*.md ready for review