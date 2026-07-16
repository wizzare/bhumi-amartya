# Pre-R10A checkpoint execution results

Execution date: 2026-07-17 (Asia/Jakarta)

## Safety gate

- Branch: `recovery/v4-build72-checkpoint`
- Starting HEAD: `bc18430d42c2484ea179fd7159f8da0e1be484e9`
- Index at start: empty
- Unmerged index entries: none
- Existing stashes: two; neither was applied, popped, dropped, cleared, or otherwise modified

## Feature commit decision

Commit 1 was not created because Group 1 did not pass every required validator:

- `scripts/verifyBaziSimilarity.ts` failed its existing similarity gate: Summary average 36.9% versus target below 35%, and Mission average 32.7% versus target below 30%.
- `scripts/validateAstrocartographyZeroInput.ts` failed check 20 because its source-wide forbidden-word regex also matches the approved shared `safetyNote`.

The canonical five-user R9G audit itself passed all eleven systems, produced five unique calculation and narrative fingerprints per system, and classified all 110 cross-user pairs as correctly distinct. Human Design was exercised through the canonical local service and returned five valid calculations.

Commits 2–5 were not created because the approved shared-file ledger establishes a dependency chain from the failed Group 1 candidate:

- Group 2 requires the Wellness fields in `lib/data/types.ts`, whose approved owner is Group 1.
- Group 3 imports `longitudinalWellnessRepository` from Group 2.
- Group 4 consumes Blueprint types and Profile integration owned by Group 1.
- Group 5 consumes shared daily-guidance, storage, and access runtime owned by Group 4.

Per the approved failure rule, these files were not partially staged and no dependency split was improvised.

## Diagnostics

- Global TypeScript baseline: 45 diagnostics.
- No application source was changed during checkpoint execution.
- Documentation validation: no credential-pattern hit in the approved staged candidate set, no local absolute path or username, no broken local Markdown link, and no whitespace error.

## Preserved exclusions

Destructive deletions, the Firebase Admin SDK credential deletion, package/configuration drift, generated output, scratch variants, response captures, UI dumps, and local proof artifacts remain outside the checkpoint commit. Arsip Akashi implementation was not started.
