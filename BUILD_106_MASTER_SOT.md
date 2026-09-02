# BHUMI AMARTYA — BUILD 106 MASTER SOURCE OF TRUTH

Status: CANONICAL FOR BUILD 106 RECOVERY

Base release: Build 105
Base SHA: `8fc3c23dcdeb9670a33922deec5e44ae545affd9`
Build 105 classification: `PRODUCTION_RELEASED_BUT_FEATURE_INCOMPLETE`
Build 106 phase: `RECOVERY_AND_RECONCILIATION_IN_PROGRESS`

## 1. Authority

This file is the primary product/recovery authority for all Build 106 work.

For Build 106, agents MUST use this order of authority:

1. Founder explicit instruction for the current task.
2. Repository/runtime evidence from the authorized Build 106 worktree.
3. `BUILD_106_MASTER_SOT.md`.
4. `BUILD_106_RECOVERY_MATRIX.md`.
5. `BUILD_106_AGENT_PROTOCOL.md`.
6. Recovered canonical V5 documents from checkpoint `036225f23b4c07636ab875f9939afbebdbdad9d7` when provenance has been verified.
7. Historical implementation evidence / commits / protected recovery worktree.
8. Historical root docs and chat memory.

Root `SOT.md`, `PRD.md`, and `TODO.md` target the Build 80/85 era and are NOT authoritative for Build 106.

The Build 105 release commit is also NOT sufficient as product truth because it is feature-incomplete and does not contain the canonical V5 documentation set.

## 2. Build 106 mission

Build 106 is NOT a normal feature release and NOT a four-bug hotfix.

Its mission is:

> Recover product continuity by reconciling Build 105 against the canonical V5 requirement set and recoverable historical source, restore all required product behavior, verify genuine new-user behavior, then only after full reconciliation produce the Build 106 release artifact.

Do not recreate historical features from memory while recoverable source exists.

## 3. Canonical requirement set

Canonical numbered requirements: `R-PRD-01` through `R-PRD-46`.

Total requirements: 46.

Build 105 audit classification:

- PRESENT_CORRECT: 4
- PRESENT_BUT_REGRESSED: 9
- MISSING: 18
- PARTIAL: 15
- UNKNOWN: 0
- Recoverable from existing source/checkpoint: 30
- Needs new implementation or completion after provenance reconciliation: 12

Build 106 is not feature-complete until all 46 requirements are reconciled to an accepted final status.

## 4. Confirmed Build 105 regressions

### 4.1 Genuine new-user lifecycle

Classification: `NEW_USER_FLOW_REGRESSED` / `BEHAVIOR_REGRESSION` / `MULTIPLE_CAUSES`.

Confirmed critical race:

1. `ensureMinimalUserProfile` sees no profile.
2. It waits for remote trial bootstrap before creating the minimal profile.
3. Bootstrap has no internal timeout.
4. AuthContext times out while the original bootstrap promise continues.
5. The user can complete setup and persist birth data, blueprint, `setupCompleted:true`.
6. Late bootstrap resumes the stale profile-missing branch.
7. It merges a minimal profile with empty birth fields, `setupCompleted:false`, and `blueprintStatus:"missing"`, potentially overwriting completed setup.

Additional defects requiring reconciliation:

- Missing setup-to-AuthContext refresh behavior.
- `blueprintStatus` transitions are not monotonic across all failure/recovery paths.
- Some Firestore/storage read failures collapse into missing/null.
- Setup success may be verified against localStorage instead of authoritative server readback.
- Dashboard recovery does not fully finalize profile setup state.
- Genuine users can become trapped between setup and dashboard.

Historical recovery evidence includes commit `0f0ad14e9a0801b51245289952b9875f0fa64c83`, which contains setup refresh behavior but is not an ancestor of Build 105.

A deterministic race test is mandatory before this area can be marked PASS.

### 4.2 Schumann / Environment

Relevant requirements: R-PRD-43 through R-PRD-46.

Build 105 lacks the canonical Schumann types/service/graph/provenance/three-layer UI.

Recoverable source exists in checkpoint `036225f23b4c07636ab875f9939afbebdbdad9d7`, including:

- `lib/environment/schumann.ts`
- `components/dashboard/SchumannGraph.tsx`
- environment service/types/card integrations
- environment tests

Classification: `FEATURE_LOST + UI_REGRESSION + DOC_IMPL_MISMATCH`.

Recovery rule: recover and reconcile source; do not reimplement from memory.

### 4.3 Astrology

Build 105 contains known regressions:

- fixed five Western bodies via `.slice(0,5)`;
- hardcoded eclipse dates/countdown;
- Blueprint group incorrectly shown inside Astro;
- no canonical Daily Astro synthesis shared with Wellness/Catatan/Weekly.

Recoverable checkpoint files include:

- `lib/astrology/calculateEclipses.ts`
- `lib/astrology/relevantWesternEvents.ts`
- `lib/astrology/dailyAstroSynthesis.ts`
- reconciled Astro cards/engines/tests

Historical UI/behavior evidence also includes the restored structure:

- Periode
- Tema Kolektif
- Menyentuh Dirimu
- Yang Bisa Dilakukan
- personalized eclipse handling

Expected Dashboard order from historical restoration evidence:

`Mirror -> Astro -> Catatan`

Classification: `PARTIAL_REGRESSION + FEATURE_REVERTED + UI_REGRESSION`.

### 4.4 Journaling / CBT / Memory

Build 105 lacks canonical journaling requirements including:

- `JournalType` discriminator;
- five modes: FREE / CBT / EMOTION / GUIDED / SPIRITUAL_AWAKENING;
- structured safe CBT payload/flow;
- mode-isolated draft recovery;
- crisis scan and AI suppression;
- mode-aware Memory extraction;
- canonical autosave/history/search/filter behavior;
- Memory visibility/control surfaces required by the PRD.

Recoverable source exists in checkpoint `036225f23b4c07636ab875f9939afbebdbdad9d7` for the journaling contracts, safety, Memory extraction, redirects, and acceptance tests.

Classification: `FEATURE_LOST + DATA_MODEL_REGRESSION + UI_REGRESSION`.

## 5. Additional required reconciliation

Build 106 must also reconcile, not silently ignore:

- Daily Note absent from Dashboard.
- Memory Dashboard / consent / correction missing.
- `ms-MY` runtime missing.
- Notification/FCM system missing.
- Premium static price regressed to Rp50.000 where canonical requirement expects Rp25.000 display with live Play price winning.
- Environment unavailable state fabricates `Stabil` instead of honest unavailable/provenance state.
- Raw identity/error logging still exists in parts of auth flow.
- Comfort Mode incomplete/missing.
- Continue Yesterday shortcut incomplete/missing.
- Per-entry privacy incomplete/missing.
- Memory decay/pinning incomplete/missing.
- Contextual evening reflection incomplete/missing.
- Astrocartography and other Blueprint/astro surfaces must be checked against recovered canonical source and requirement manifest.

## 6. Recovery provenance

Known evidence sources must remain separate until reconciled:

- Build 105 release SHA: `8fc3c23dcdeb9670a33922deec5e44ae545affd9`
- Recoverable agent checkpoint: `036225f23b4c07636ab875f9939afbebdbdad9d7`
- Historical new-user commit: `0f0ad14e9a0801b51245289952b9875f0fa64c83`
- Historical new-user runtime evidence: `cd42784dcf55257f1160871c8b1a4d3676f48681`
- Historical immediate-dashboard/HD evidence: `e3ef4570fa14e5df03e8001430a61d14142f7483`
- Protected recovery branch: `feat/build99`
- Protected recovery HEAD: `57479c928ba75e6a363613bb003809bd44a6c09d`
- Protected recovery worktree contains tracked and untracked deltas beyond committed history.

Do not merge the checkpoint or protected dirty worktree wholesale.

Required method: file/hunk-level reconciliation with provenance recorded.

## 7. Recovery sequence

Mandatory order unless the Founder explicitly changes it:

1. Canonical docs and Build 106 governance.
2. Genuine-new-user race + lifecycle state machine.
3. Localization foundation (`id/en/ms`) and canonical fallback/persistence.
4. Journaling data model + five modes + CBT + draft safety.
5. Memory + Daily Context + Daily Note integration.
6. Astrology canonical synthesis and UI reconciliation.
7. Environment / Schumann / provenance reconciliation.
8. Notifications / privacy / remaining canonical requirements.
9. Premium copy/price and final product-copy reconciliation.
10. Full feature manifest reconciliation across all 46 requirements.
11. Focused unit/emulator/browser/device tests.
12. Fresh-account genuine-user acceptance test.
13. Version bump / Build 106 artifact only after all release gates pass.

## 8. Build gates

The agent MUST NOT bump versionCode/versionName, run production release build, deploy, publish, or claim Build 106 exists until all of the following are true:

- All 46 canonical requirements have final reconciled statuses.
- All known `MISSING`, `PARTIAL`, and `PRESENT_BUT_REGRESSED` requirements have accepted resolution.
- Genuine new-user lifecycle passes with a fresh non-sample account path.
- The bootstrap late-write race has an executed deterministic regression test.
- Sample/dev-audit behavior is not used as onboarding proof.
- Focused tests for recovered modules pass.
- Firestore emulator/owner-isolation tests pass where relevant.
- Browser/device QA is completed for affected primary surfaces.
- No unresolved provenance conflict remains for adopted historical source.
- Founder explicitly approves release/versioning.

Until then:

`BUILD_106_ARTIFACT = DOES_NOT_EXIST`

## 9. Evidence discipline

Never claim PASS based only on:

- source presence;
- a successful commit;
- a sample account;
- an audit mock;
- HTTP route success;
- an emulator-only result when production/device evidence is required;
- a written test plan without execution.

All PASS claims must state executed evidence, exact command/test scope, and result.

## 10. Definition of done

Build 106 recovery is complete only when:

1. the product requirement manifest R-PRD-01..46 is fully reconciled;
2. recovered source has documented provenance;
3. genuine-new-user onboarding is stable;
4. major lost/regressed V5 surfaces are restored and validated;
5. no Build 105 regression classified as release-critical remains open;
6. release gates pass; and
7. Founder approves creation of the Build 106 release artifact.

Canonical final state marker:

`BUILD_106_RECOVERY_RECONCILED_AND_RELEASE_READY`

Until that marker is evidence-backed and Founder-approved, agents must continue recovery/reconciliation and must not convert the task into normal feature development.