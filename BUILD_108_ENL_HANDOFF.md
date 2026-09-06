# BUILD 108 ENL — OPERATIONAL HANDOFF
**Developer & Agent Execution Guide**

```text
STATUS                          = CORE DATA INTEGRITY GATE OPEN — CDI-108-01 + CDI-108-01A DONE; CDI-108-02 IMPLEMENTED; CDI-108-03 RESEARCH COMPLETE / FOUNDER DECISION REQUIRED (SPRINT 5 BLOCKED)
CURRENT_BASELINE                = BUILD 107 (versionCode 107, versionName 5.0.7)
BASELINE_COMMIT                 = d2ecb5ed73b7bb5e95415be314305f3512533752
CURRENT_BRANCH                  = recovery/build106-product-continuity
NEXT_PRIMARY_AGENT              = CODEX
INITIATIVE                      = BUILD 108 ENL
PURPOSE                         = Dedicated English-Language Edition of Bhumi Amartya
TOTAL_ROUTES_AUDITED            = 51
TOTAL_USER_FACING_PAGES         = 48
DERIVED_SPRINT_COUNT            = 8 NUMBERED SPRINTS + ENV2
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
GATE_108_CDI                    = IN_PROGRESS
SPRINT_108_ENV2                 = PLANNED
GATE_108_FRA                    = PLANNED
BUILD_108_CAN_PROCEED_TO_RELEASE = NO
NEXT_SAFE_ACTION                = FOUNDER_DECISION_ON_CDI_108_03 (D1/D2/D3) -> CONTINUE_CURRENT_GATE_108_CDI
RELEASE_GATE                    = FOUNDER_SIGN_OFF_REQUIRED
```

> **CDI-108-03 Schumann research complete (2026-09-07).** Source research + architecture decision
> are done: **[`BUILD_108_CDI_108_03_SCHUMANN_SOURCE_RESTORATION.md`](BUILD_108_CDI_108_03_SCHUMANN_SOURCE_RESTORATION.md)**.
> Read-only probes of every realistic public Schumann source found **NO qualifying source**
> (numeric API + valid-cert HTTPS + CORS + usable licence + reliability + provenance). The
> incumbent stays 404; its successor is a JPEG-only Tomsk re-render; the true Tomsk upstream has an
> expired TLS cert and no JSON; HeartMath GCMS is band-power (not SR peaks), undocumented,
> unlicensed for this use, and currently empty. **Option A (direct client swap) is impossible.**
> `SCHUMANN_API_URL` is unchanged; the honest fail-closed UI + `deriveEnvironmentBands` /
> `hasSchumannObservation` gate (CDI-A3) are preserved and regression-locked
> (`tests/unit/build108-cdi03-schumann-source-integrity.test.ts`, 16 checks). **Founder decision
> required — D1 accept fail-closed (FRA records SCHUMANN = DEFERRED w/ rationale) · D2 authorize a
> separate backend-gated ENV2 restoration project · D3 provide a private licensed provider.**
>
> **Current Founder direction (2026-09-07).** ENV2 scope and the mandatory Final Release Audit
> are approved for documentation only. Both remain PLANNED; neither may be implemented/executed
> now. This direction supersedes older next-action/approval holds below. Do not reopen completed
> Chiron, timezone, or HD client/recovery work absent regression evidence. HD service extras remain
> source-dependent; backfill is NOT READY and NOT authorized. Sprint 5 remains BLOCKED.
>
> **CORE DATA INTEGRITY GATE (2026-09-06).** Sprint 4 is complete. **Do NOT start Sprint 5.** The
> next primary agent is **CODEX**. Build 108 ENL remains paused for `GATE_108_CDI`.
>
> Completed state:
> - `SPRINT_108_01 = COMPLETE`
> - `SPRINT_108_02 = COMPLETE`
> - `SPRINT_108_03 = COMPLETE`
> - `SPRINT_108_04 = COMPLETE`
> - `SPRINT_108_05 = BLOCKED`
> - `CDI_108_01_CHIRON_NATAL_ACCURACY = COMPLETE`
> - `CDI_C1 = DONE`
> - `CDI_C2 = DONE`
> - `CDI_C3 = DONE`
>
> Important Chiron state: the old linear Chiron approximation has been removed; a Swiss
> Ephemeris-derived client-side Chiron table is implemented; Chiron fixture accuracy is 10/10;
> fail-closed persistence is implemented; Whole Sign and Placidus are explicitly separated; no
> production backfill was performed.
>
> Completed CDI-C3: `CDI-108-01A` canonical IANA timezone propagation is complete. Pending blockers:
> 1. Genuine Placidus production service deployment remains ops-gated.
> 2. `CDI-108-02` — Human Design advanced variables.
> 3. `CDI-108-03` — Schumann source: RESEARCH COMPLETE 2026-09-07, no qualifying source, FOUNDER
>    DECISION REQUIRED (D1/D2/D3) — see `BUILD_108_CDI_108_03_SCHUMANN_SOURCE_RESTORATION.md`.
> 4. `CDI-D1` — legacy data backfill, separately Founder-authorized only.
>
> Important Human Design audit refinement: the LIVE deployed Human Design `/calculate` contract
> differs from repo `services/humandesign-api/main.py`. Observed live payload already includes
> `digestion`, `environment`, `motivation`, and `cognition`. Apparently absent / unresolved:
> `perspective` and diagnostic Color/Tone/Base. CODEX must **NOT** assume the HD engine is the
> primary defect.
>
> Founder approved the completed CDI-108-01A / CDI-C3 result and the CDI-108-02 implementation.
> CDI-108-02 now preserves live advanced fields end-to-end, derives Perspective only from labelled
> source data, fixes the Variables Arrows key, and hardens the unapproved recovery path. It does
> not authorize a recovery run, production backfill, or backend deployment. No further `CDI-*`
> implementation, no production Firestore read/write or backfill, no backend
> deploy, and no version bump / build / sign / deploy / upload until explicit Founder authorization.
> Production read-only probes are not implicitly authorized beyond evidence already collected.
> `BUILD_106_RECOVERY_IN_PROGRESS` no longer applies.

---

## 1. Operating Rules for Incoming Agents

Any coding agent operating on Build 108 ENL MUST strictly adhere to the following invariants:

1. **Continue the current CDI gate; do NOT start Sprint 5 or ENV2, or execute FRA yet.**
   - Build 108 ENL remains **PAUSED_FOR_CORE_DATA_INTEGRITY** with
     `GATE_108_CDI = IN_PROGRESS`. Sprint 5 is NOT started.
   - **CDI-108-01 (Chiron) and CDI-108-01A (timezone canonicalization / CDI-C3) are done.**
     CDI-108-02 client integrity/recovery safety is also done. CDI-108-03 source restoration is
     the current authorized task: research and prove source/architecture before local implementation.
     This documentation task does not broaden production, provider-commitment, or deployment authority.
2. **Do NOT bump version yet.**
   - `versionCode` remains `107` and `versionName` remains `"5.0.7"` until the sprint release stage.
3. **Do NOT build, sign, or upload artifacts yet.**
   - No APK, AAB, or web export generation is authorized at this time.
4. **Do NOT touch production data.**
   - No production Firestore read or write. No blueprint / Human Design / natal backfill or
     migration (incl. `scripts/mass-recover-hd.ts`) may be run.
5. **Preserve Untracked Files:**
   - `scripts/.build106-production-admin-provision.mjs` is an untracked credential utility and MUST NOT be staged or deleted.
6. **Honor Build 107 Continuity:**
   - You must verify that `tests/unit/build107-hd-existing-user-convergence.test.ts` and `tests/unit/build107-production-surface-guard.test.ts` stay completely GREEN at all times.
   - Every future `CDI-*` fix must leave the Build 107 inheritance checklist
     (`BUILD_108_ENL_MASTER_SOT.md §3`) 100% intact — in particular, no change may let a failed
     Human Design recalculation overwrite a CANONICAL stored `type`.

---

## 2. Worktree & Lineage Integrity

```text
WORKTREE PATH                   = c:\tmp\bhumi-build106-recovery
CURRENT BRANCH                  = recovery/build106-product-continuity
BASE PRODUCTION COMMIT          = d2ecb5e (docs: record production regression hotfix and Build 107 release provenance)
PARENT COMMIT                   = 4e6ca26 (chore: prepare Build 107 — versionCode 107 / versionName 5.0.7)
```

Before making any changes in future sprints, verify:
```bash
git branch --show-current
git rev-parse HEAD
git status --short
```

---

## 3. Sprint-by-Sprint Execution Roadmap

Detailed specifications for each sprint are in `BUILD_108_ENL_SPRINT_PLAN.md`:

- **Sprint 1: Onboarding, Authentication & Core Shell** (`app/page.tsx`, `app/login/page.tsx`, `app/setup/page.tsx`, `AppNav.tsx`, language switcher hiding).
- **Sprint 2: Dashboard & Core Identity** (`app/dashboard/page.tsx`, `app/dashboard/environment/page.tsx`, `CoreIdentity.tsx`, all 15 dashboard cards).
- **Sprint 3: The 11 Blueprint Presentation Engines** (`app/blueprint/*` and all 11 `lib/` engines).
- **Sprint 4: AI Daily Guidance, Prompts & Local Fallbacks** (`lib/prompts/*`, `unifiedBlueprintSynthesis.ts`, `localDailyGuidanceFallback.ts`).
- **Sprint 5: Profile, Journey & Journal Hubs** (`profile`, `journey`, `journal`, `insights`, `reports/weekly`).
- **Sprint 6: Wellness, Somatics, Healing & Innerwork** (`wellness`, `wellness-assessment`, `healing/*`, `innerwork/*`, `kenali-diri/aura`).
- **Sprint 7: Settings, Paywall, Legal & Static Pages** (`settings`, `premium-bhumi`, `upgrade`, `tentang`, `syarat-ketentuan`, `kebijakan-privasi`, `bantuan`, `kontak`).
- **Sprint 8: Final Regression, Build Verification & Release Protocol** (Full test suite, static surface guard, version bump to 108 / 5.0.8, signed AAB/APK build, Founder sign-off).

### 3.1 ENV2 and Final Release Audit placement — current planning authority

```text
SPRINT_108_ENV2_STATUS = PLANNED
ENV2_PRODUCT_SCOPE = Dashboard Atmosphere & Volcanic card; Environment detail section/page;
                     conditional history/timeline and licensed/reliable map/plume visualization
ENV2_DATA_DOMAINS = surface air quality; atmospheric SO2 column; wind; volcanic attribution
ENV2_SOURCE_RESEARCH_REQUIRED = YES — BEFORE IMPLEMENTATION
ENV2_BACKEND_REQUIRED = UNDETERMINED — RESEARCH/ARCHITECTURE EVIDENCE REQUIRED
ENV2_RELEASE_RISK = OPEN — DATA ACCESS, ATTRIBUTION, FRESHNESS, AND RUNTIME VALIDATION
BUILD_108_SPRINT_ORDER = Sprints 1–4 COMPLETE -> current CDI gate -> Sprints 5–7 and ENV2
                        -> Sprint 8 pre-release verification/FRA -> authorized release phase
GATE_NAME = FINAL_RELEASE_AUDIT
GATE_108_FRA = PLANNED
BUILD_108_CAN_PROCEED_TO_RELEASE = NO
NEXT_SAFE_ACTION = CONTINUE_CURRENT_GATE_108_CDI
```

ENV2 follows CDI closure and precedes final release; prefer before/alongside subsequent
Environment-related product work. Sprints 5–8 are not renumbered. All implementation/remediation,
including ENV2, must precede FRA. Do not reopen completed CDI items just to schedule ENV2; the
later mandatory FRA re-audits the complete product, not only changed files.

Read `BUILD_108_ENL_MASTER_SOT.md §4.3` and the ENV2 sprint specification before future ENV2
research/implementation. They define the canonical `EnvironmentalConditionPayload`, per-datum
SOURCE/OBSERVED_AT/FETCHED_AT/FRESHNESS/QUALITY/PROVENANCE, original scientific units, separate
surface SO2/column SO2/volcanic attribution, and the full provider comparison matrix. SO2 alone
never proves volcanic origin; insufficient attribution means `probableSource = null`. Never
fabricate Normal/Stable/Safe/plume/source-volcano states. Column SO2 cannot imply personal
exposure. ENL copy is native English; cultural/spiritual readings stay separate from facts.

Research surface AQI/pollutants, column SO2, wind, and volcanic observations separately. Compare
direct APIs, proxy, scheduled ingestion/cache, and hybrid; prefer isolating provider changes from
Android. No Windy screenshots/visualization as canonical data. No source, backend, or paid
provider commitment has been selected/approved. Preserve HD/Chiron/timezone, admin/diagnostics
removal, security/billing, Schumann fail-closed behavior, and Environment provenance separation.

Read **`BUILD_108_FINAL_RELEASE_AUDIT.md`** before future final acceptance. It defines all 11
mandatory domains, requirement-by-requirement test/runtime evidence, the complete route/child
surface sweep, cohort coverage, provenance, and the final report. Targets are UNKNOWN=0,
UNACCOUNTED=0, FALSE_PASS=0 and no release-critical gaps. FRA must PASS before versionCode 108 /
versionName 5.0.8, final production build, signing, or Play upload. Existing seven release gates
still apply; artifact/signing evidence follows FRA and is not falsely claimed beforehand.

**Documentation exit:** commit documentation only; do not execute ENV2/FRA or version/build/sign/
deploy/upload. **STOP FOR FOUNDER REVIEW.** The next work remains the current CDI gate.

---

## 4. Quick Verification Commands

```powershell
# Set Node environment
$env:PATH = "C:\Users\shein\AppData\Local\nvm\v20.20.2;" + $env:PATH

# 1. Typecheck
npx tsc --noEmit

# 2. Production Surface Guard
node --import tsx tests/unit/build107-production-surface-guard.test.ts

# 3. Human Design Convergence Guard
node --import tsx tests/unit/build107-hd-existing-user-convergence.test.ts

# 4. Version Reconciliation Guard
node --import tsx tests/unit/version-reconciliation.test.ts
```

---

## 5. Current Task State & Handoff Action

```text
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
GATE_108_CDI                    = IN_PROGRESS
LAST_COMPLETED_SPRINT           = SPRINT-108-04-AI-GUIDANCE
SPRINT_108_01                  = COMPLETE
SPRINT_108_02                  = COMPLETE
SPRINT_108_03                  = COMPLETE
SPRINT_108_04                  = COMPLETE
SPRINT_108_05                  = BLOCKED
CDI_108_01_CHIRON_NATAL_ACCURACY = COMPLETE
CDI_C1                         = DONE
CDI_C2                         = DONE
CDI_C3                         = DONE
CDI_108_02_HUMAN_DESIGN        = DONE — CLIENT INTEGRITY / RECOVERY SAFETY; SERVICE EXTRAS SOURCE-DEPENDENT
CDI_108_03_SCHUMANN            = RESEARCH_COMPLETE — NO QUALIFYING SOURCE — FOUNDER DECISION REQUIRED (D1/D2/D3)
CDI_D1_LEGACY_BACKFILL         = PENDING — NOT AUTHORIZED
SPRINT_108_ENV2                 = PLANNED
GATE_108_FRA                    = PLANNED
BUILD_108_CAN_PROCEED_TO_RELEASE = NO
NEXT_SAFE_ACTION                = FOUNDER_DECISION_ON_CDI_108_03 (D1/D2/D3) -> CONTINUE_CURRENT_GATE_108_CDI
PRODUCTION_FIRESTORE_WRITE      = NOT AUTHORIZED
PRODUCTION_BACKFILL             = NOT AUTHORIZED
BACKEND_DEPLOY                  = NOT AUTHORIZED
PLAY_UPLOAD                     = NOT AUTHORIZED
```

### 5.1 Core Data Integrity Gate — `GATE_108_CDI` (2026-09-06)

Read-only root-cause audit **Founder-approved**: **`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`**.
All three root causes CONFIRMED.

| Defect | Confirmed root cause | Status |
|---|---|---|
| **Chiron wrong** | Swiss Ephemeris `/calculate-astrology` unreachable; silent local fallback derived Chiron from a **linear** ephemeris; Equal House mislabelled `placidusHouses`; CDI-108-01A timezone propagation is complete; genuine Placidus production deployment remains ops-gated. | **CDI-108-01 COMPLETE. CDI-108-01A COMPLETE. CDI-C1 DONE. CDI-C2 DONE. CDI-C3 DONE.** Committed Swiss Ephemeris-derived client-side Chiron table; old linear Chiron approximation removed; Chiron fixture accuracy 10/10; fail-closed persistence implemented; Whole Sign and Placidus explicitly separated. Genuine Placidus production service deployment remains ops-gated. No production backfill performed. |
| **HD advanced variables "Not stored"** | **Refined against the LIVE deployed contract (audit §B.8).** The live deployed `/calculate` contract differs from repo `services/humandesign-api/main.py`; observed live payload already includes `digestion`, `environment`, `motivation`, and `cognition`. Apparently absent / unresolved: `perspective` and diagnostic Color/Tone/Base. | **PENDING — CDI-108-02.** CODEX must not assume the HD engine is the primary defect; continue from Founder review of CDI-108-01A / CDI-C3 and the refined HD audit. |
| **Schumann `Data belum tersedia`** | Provider endpoint `schumannresonancelive.com/api/data.php` → **HTTP 404** (API path removed). Client-only fetch; no proxy under static export. Pre-existing since ≥ Build 106 (DS-E1). No fabricated "healthy" values. | **RESEARCH COMPLETE — CDI-108-03** (`BUILD_108_CDI_108_03_SCHUMANN_SOURCE_RESTORATION.md`). No qualifying genuine SR source exists; direct client swap impossible; `SCHUMANN_API_URL` unchanged; CDI-A3 preserved + regression-locked. **FOUNDER DECISION REQUIRED — D1 accept fail-closed / DEFERRED · D2 backend-gated ENV2 restoration project · D3 private licensed provider.** |

Cross-cutting: **CDI-D1** — legacy data backfill is separately Founder-authorized only and is **not
authorized now**.

**Handoff action (2026-09-07):** CDI-108-03 source research + architecture decision are COMPLETE
(`BUILD_108_CDI_108_03_SCHUMANN_SOURCE_RESTORATION.md`) and stop for Founder review.
`NEXT_SAFE_ACTION = FOUNDER_DECISION_ON_CDI_108_03 (D1/D2/D3) -> CONTINUE_CURRENT_GATE_108_CDI`.
No qualifying Schumann source exists; nothing to implement within the CDI gate. CDI-108-02
client/recovery implementation is complete; HD service extras/backfill remain separate. Do not
implement ENV2 or execute FRA yet.

```text
PRODUCTION_FIRESTORE_WRITE = NOT AUTHORIZED
PRODUCTION_BACKFILL        = NOT AUTHORIZED
BACKEND_DEPLOY             = NOT AUTHORIZED
PLAY_UPLOAD                = NOT AUTHORIZED
```

### 5.2 Prior Sprint 4 Accomplishments (for reference)

**Sprint 4 Accomplishments:**
- `dailyGuidancePrompt.ts`: Dynamic English synthesis rules, Companion/Coach archetypes, reasonEngine/advice rules, English greeting (`Hello {firstName}`) and closing (`Warm hugs from Bhumi.`), output schema per category.
- `bhumiSoulMirrorPrompt.ts`: Dual-language prompt with English role, philosophy, opening (`Hi {userName}, how are you feeling this {dayName}?`), and style rules.
- `bhumiManifestationPrompt.ts`: Dual-language prompt with English context awareness, first-person grounding, and schema.
- `bhumiDailyReflectionPrompt.ts`: Dual-language prompt with English preview (`...`) and full reflection (`TODAY'S FOCUS`).
- `soulIdentityPrompt.ts` & `lib/ai/prompts/registry.ts`: Complete English resonance narrative voice ("I notice...") and English registry prompt.
- `localDailyGuidanceFallback.ts`: Localized English personal note sections (`Current theme:`, `Daily focus:`, etc.), life path/HD/arcana/transit themes, English fallback categories, and fallback name resolution.
- `dailyGuidanceEngine.ts`: Dynamic influence builders (`buildDailyStateSentence`, `buildJourneySentence`, `buildWellnessSentence`, `buildAstroSentence`, etc.) with `isEn` support preventing Indonesian sentence leakage into `dailyNoteText` and category `reason`/`advice`.
- `normalizeUserFacingGuidance.ts`: English fallback categories, advice variations across all 11 themes, English blacklist deconfliction, and English time-aware closing.
- `mirrorDailyReflection.ts` & `birthdayMessage.ts`: Localized mirror reflection helper and English birthday message generator.
- `app/api/ai/daily-guidance/route.ts`: Default language resolves to `"en"` when `isEnlEdition()` is true.
- Unit and regression test suite `tests/unit/build108-sprint04-ai-guidance.test.ts` (11 sub-suites, 129 assertions) passing with exit code 0.
- All regression suites passing (Sprint 1, Sprint 2, Sprint 3, Build 107 Production Surface Guard, Build 107 HD Convergence) with 0 errors.
- Repository `npx tsc --noEmit` passing with 0 errors.

**Next Sprint (BLOCKED):** `SPRINT-108-05-PROFILE-JOURNEY-JOURNAL` (Profile Hub & Sections, Journey
Hub & Milestones, Journal Hub & Entries, Insights, Weekly Reports) — **not started; held pending
Founder review of `BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md` per §5.1.**
