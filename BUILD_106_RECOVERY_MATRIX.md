# BHUMI AMARTYA — BUILD 106 RECOVERY MATRIX

Status: CANONICAL WORKING MANIFEST
Primary authority: `BUILD_106_MASTER_SOT.md`

This matrix is the execution ledger for Build 106. Agents must update this file as evidence is produced. Do not mark any row PASS without executed evidence.

## Status vocabulary

- `PRESENT_CORRECT`
- `PRESENT_BUT_REGRESSED`
- `PARTIAL`
- `MISSING`
- `RECOVERED_UNVERIFIED`
- `RECOVERED_VERIFIED`
- `NEW_IMPLEMENTATION_REQUIRED`
- `PASS`
- `BLOCKED`

## Canonical requirement matrix

| ID | Requirement | Build 105 | Recovery source | Build 106 status | Required evidence |
|---|---|---|---|---|---|
| R-01 | Adaptive orientation | PARTIAL | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-02 | Optional need discovery | PARTIAL | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-03 | Check-in + Memory -> Daily Note | PARTIAL | CP-036 Daily Context | RECOVERY_REQUIRED | unit + browser |
| R-04 | Tiny Step inline | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-05 | Optional user paths | PARTIAL | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-06 | Do Nothing valid | PRESENT_CORRECT | Build 105 | PRESERVE | regression test |
| R-07 | Evening reflection | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | timezone/browser test |
| R-08 | No checklist/streak Dashboard | PRESENT_CORRECT | Build 105 | PRESERVE | regression test |
| R-09 | Returning context | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-10 | Graceful Daily Rhythm failures | PARTIAL | CP-036 | RECOVERY_REQUIRED | fallback tests |
| R-11 | Shared journal model + discriminator | MISSING | CP-036 | RECOVERY_REQUIRED | contract tests |
| R-12 | Five journal modes | MISSING | CP-036 | RECOVERY_REQUIRED | UI + persistence tests |
| R-13 | Structured safe CBT | MISSING | CP-036 | RECOVERY_REQUIRED | safety + browser tests |
| R-14 | Comfort Mode | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-15 | Draft autosave/conflict | MISSING | CP-036 | RECOVERY_REQUIRED | timer/conflict tests |
| R-16 | Journal history/search/filter/export | MISSING | CP-036 partial | RECOVERY_AND_COMPLETION_REQUIRED | integration tests |
| R-17 | Continue Yesterday | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-18 | Mood trend | PARTIAL | existing components | RECONCILE | integration test |
| R-19 | Reflective AI + crisis safety | PARTIAL | CP-036 | RECOVERY_REQUIRED | crisis suppression tests |
| R-20 | Entry privacy | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | privacy tests |
| R-21 | Useful Memory continuity | PARTIAL | CP-036 | RECOVERY_REQUIRED | memory pipeline tests |
| R-22 | No automatic raw sensitive storage | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | consent/provenance tests |
| R-23 | Memory visibility/control | MISSING | CP-036 `app/journey/memory` | RECOVERY_REQUIRED | browser + CRUD tests |
| R-24 | Context-aware retrieval | PARTIAL | CP-036 | RECOVERY_REQUIRED | retrieval tests |
| R-25 | Journal->Memory->Insight->Experience | PARTIAL | CP-036 | RECOVERY_REQUIRED | end-to-end pipeline test |
| R-26 | Memory boundaries | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | boundary/suppression tests |
| R-27 | 90-day decay/pinning | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | lifecycle tests |
| R-28 | Weekly/monthly reflection | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | opt-in + synthesis tests |
| R-29 | id/en/ms locales | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | locale runtime tests |
| R-30 | Locale fallback missing->en->id | MISSING | CP-036 | RECOVERY_REQUIRED | fallback tests |
| R-31 | AI in user locale | PARTIAL | CP-036 | RECOVERY_REQUIRED | localized AI tests |
| R-32 | Localized notifications | MISSING | CP-036 scheduler | RECOVERY_REQUIRED | notification tests |
| R-33 | Locale persistence | PARTIAL | CP-036 | RECOVERY_REQUIRED | persistence tests |
| R-34 | Visible functional switcher | PARTIAL | CP-036 | RECOVERY_REQUIRED | browser tests |
| R-35 | Single Daily Astro synthesis | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | synthesis tests |
| R-36 | Astro feeds Wellness/Catatan/Weekly | MISSING | CP-036 | RECOVERY_REQUIRED | integration tests |
| R-37 | Variable Western events | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | variable-count tests |
| R-38 | Current-day Tzolkin/Weton | PRESENT_CORRECT | Build 105 / CP-036 | PRESERVE | date tests |
| R-39 | Dynamic eclipses | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | astronomy tests |
| R-40 | No Blueprint group in Astro | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | UI test |
| R-41 | Astro non-diagnostic lens | PRESENT_CORRECT | Build 105 / CP-036 | PRESERVE | copy/priority regression |
| R-42 | Rp25.000 display/live Play price wins | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | UI/store-price test |
| R-43 | Canonical environment sources | PARTIAL | CP-036 | RECOVERY_REQUIRED | service/provenance tests |
| R-44 | Provenance/unavailable honesty | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | unavailable-state tests |
| R-45 | Three-layer Schumann | MISSING | CP-036 | RECOVERY_REQUIRED | unit + graph + browser tests |
| R-46 | Environment as weak context | PARTIAL | CP-036 | RECOVERY_REQUIRED | integration tests |

## New-user lifecycle gate

This is a release-blocking gate independent of the numbered product requirement rows.

Current state: `REGRESSED`.

Must prove all of the following:

- New Firebase/Google user profile bootstrap cannot overwrite newer completed setup.
- Bootstrap has bounded behavior and cannot leave a stale continuation capable of resetting state.
- `setupCompleted` and `blueprintStatus` transition monotonically.
- AuthContext is refreshed/re-read after setup completion before final routing.
- Server-authoritative profile/blueprint state wins over localStorage.
- Missing profile is distinguished from read error.
- Dashboard recovery finalizes profile state consistently.
- Fresh arbitrary valid birth data generates/persists the required blueprint schema.
- Sample/dev-audit paths are not used as proof.

Required tests:

1. deterministic bootstrap-timeout / late-completion race;
2. fresh-user setup success;
3. blueprint generation failure;
4. final-profile write failure;
5. recovery-required transition;
6. dashboard recovery finalization;
7. pre-existing persisted user regression protection.

## Historical source identifiers

`CP-036` = checkpoint `036225f23b4c07636ab875f9939afbebdbdad9d7`.

Other important evidence:

- Build 105: `8fc3c23dcdeb9670a33922deec5e44ae545affd9`
- recovery worktree HEAD: `57479c928ba75e6a363613bb003809bd44a6c09d`
- genuine-user historical runtime evidence: `cd42784dcf55257f1160871c8b1a4d3676f48681`
- non-blocking HD/dashboard evidence: `e3ef4570fa14e5df03e8001430a61d14142f7483`
- historical setup refresh behavior: `0f0ad14e9a0801b51245289952b9875f0fa64c83`

## Matrix completion rule

The Build 106 release gate is closed while any requirement remains `MISSING`, `PARTIAL`, `PRESENT_BUT_REGRESSED`, `RECOVERY_REQUIRED`, `RECOVERED_UNVERIFIED`, `NEW_IMPLEMENTATION_REQUIRED`, or `BLOCKED` without Founder-approved deferral.

Do not convert a requirement to `PASS` merely because code was copied or committed. `PASS` requires executed verification appropriate to the requirement.