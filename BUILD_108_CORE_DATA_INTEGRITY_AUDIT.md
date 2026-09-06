# BUILD 108 ENL — CORE DATA INTEGRITY AUDIT
**Read-only root-cause investigation of three confirmed production data-integrity defects**

```text
STATUS                              = READ_ONLY_ROOT_CAUSE_AUDIT_COMPLETE
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY_AUDIT
TRIGGER                             = FOUNDER — three confirmed production defects from real users
PRODUCTION_BASELINE                 = BUILD 107 (versionCode 107, versionName 5.0.7, commit d2ecb5e)
WORKTREE                            = C:\tmp\bhumi-build106-recovery
BRANCH                              = recovery/build106-product-continuity
INITIAL_HEAD                        = 9fc364abd4d4931ad12f81070ac401434b86a11a
AUDIT_DATE                          = 2026-09-06
PRODUCTION_READS                    = 0
PRODUCTION_WRITES                   = 0
FIRESTORE_MUTATIONS                 = 0
CODE_CHANGES                        = 0 (documentation only)
EXTERNAL_PROBES                     = GET https://schumannresonancelive.com/api/data.php (read-only; returned HTTP 404)
NEXT_SAFE_ACTION                    = FOUNDER_REVIEW_OF_CORE_DATA_INTEGRITY_AUDIT
```

> **Scope discipline.** This document is a READ-ONLY audit. No product code, engine, adapter,
> schema, migration, or Firestore document has been changed. No fix is implemented. Sprint 5 is
> NOT started. No version bump, build, sign, deploy, or upload has occurred. Every remediation
> below is a *proposal for Founder review*, not an action taken.

---

## 0. Executive Summary

The Founder confirmed three production data-integrity defects reported by real users. Build 108
ENL must not inherit them. This audit traces each defect end-to-end against authorized repository
evidence and reaches an unambiguous root cause for all three.

| # | Defect | Verdict | Root cause (confirmed) | New users | Existing users | Backfill |
|---|---|---|---|---|---|---|
| **A** | `RESONANSI SCHUMANN = Data belum tersedia` | **BROKEN** | Upstream provider endpoint `schumannresonancelive.com/api/data.php` returns **HTTP 404** — the API path no longer exists. Every live fetch fails; fresh installs have no cache; the UI honestly shows "unavailable". Pre-existing since ≥ Build 106 (documented residual **DS-E1 / R-PRD-44**). | Affected | Affected | N/A (no per-user data) |
| **B** | Human Design Advanced Variables all "Not stored"; Variables Arrows / Color / Tone / Base "Not stored" | **BROKEN** | Deployed HD engine (`services/humandesign-api/main.py` `POST /calculate`) computes only the **4 binary Variable arrows** (`variables` + `short_code`). It never derives the PHS 6-fold Digestion / Environment / Motivation / Perspective / Cognition values, and it withholds per-gate **Color / Tone / Base** unless `debug=true` (a flag the Bhumi client never sends). The one advanced datum that *is* stored (`variables.short_code`) is read against the wrong object keys in the UI. The local derivation `calculateAdvancedVariables()` is orphaned. The existing-user recovery script drops activation detail entirely. | Affected | Affected | Required (after engine fix) |
| **C** | Chiron placement incorrect for some users | **BROKEN** | The accurate Swiss Ephemeris path (`/calculate-astrology`, uses `swe.CHIRON`) is **unreachable in production** — `HUMAN_DESIGN_SERVICE_URL` is undefined in the static-export bundle so it resolves to `http://localhost:8000`, which the `https://localhost` WebView blocks. The silent local fallback derives Chiron from a **hand-rolled linear ephemeris** (`251.35 + days·0.019777`) because `astronomy-engine` has no Chiron body. That model ignores Chiron's high orbital eccentricity and retrograde motion, so sign / degree / house are frequently wrong. Houses are additionally **Equal House mislabelled as `placidusHouses`**. | Affected | Affected | Required (after ephemeris fix) |

**HD core identity is healthy.** `type / strategy / authority / profile / definition / centers /
gates / channels` resolve and persist correctly, and the Build 107 convergence invariant
(`getHdState` → `CANONICAL` requires `hdEngineVersion === "gaia-hd-v1"`) is intact. Every defect
in B is confined to the *advanced / variable* layer and its narrative localisation — no resolved
type is at risk from any proposed fix.

**No fabricated "healthy" values were found.** `Aktivitas Bumi = Stabil` and
`Aktivitas Geomagnetik = Tenang` are genuine "available + quiet" readings from USGS and NOAA,
not defaults synthesised on Schumann failure. See §2.6.

---

## 1. Method & Evidence Base

- **Authorized worktree only.** All reads from `C:\tmp\bhumi-build106-recovery` at HEAD
  `9fc364a`. The forensic worktree was not touched.
- **Static analysis** of the full data flow for each subsystem: source/provider → request →
  endpoint → adapter/normalizer → canonical schema → Firestore persistence → read normalization →
  presentation → rendered surface.
- **In-repo engine source.** The Human Design and astrology microservice source lives in-repo at
  `services/humandesign-api/`, so the response schema was read directly from
  `services/humandesign-api/main.py`, `src/humandesign/features/attributes.py`, and the regression
  snapshot `tests/regression/snapshots/v1/calculate.json` — not inferred from a live probe.
- **One external probe.** A single read-only `GET` to the Schumann provider endpoint to establish
  live availability (the Founder explicitly requested `SCHUMANN_LIVE_FETCH`). Result: HTTP 404.
  The domain-root check could not be completed (fetch summariser intermittently unavailable) and
  is flagged as a limitation.
- **Prior-art corroboration.** `BUILD_106_RECOVERY_MATRIX.md` (DS-E1), `V5_DECISION_LOG.md`
  (D-#507..#510), `HD_ACTIVATION_STORAGE_AUDIT.md`, `TIMEZONE_AUDIT.md`,
  `NATAL_CHART_ENGINE_AUDIT_V3_JOKER.md`.

Labels: **CONFIRMED** (proven from code + evidence), **PROBABLE** (strong mechanism, one gap),
**UNVERIFIED** (needs a runtime/authorized check).

---

## A. SCHUMANN RESONANCE

### A.1 Complete flow as built

| Stage | Implementation | Notes |
|---|---|---|
| Provider / source | `SCHUMANN_API_URL = "https://schumannresonancelive.com/api/data.php"` — hardcoded, keyless third-party HTTP API | `lib/environment/schumann.ts:5`. Ratified in `V5_DECISION_LOG.md` D-#507: "Schumann = schumannresonancelive.com API (keyless, ~90s cache, UTC timestamps; SR numeric series are **MODELLED** by the source — always labelled)." |
| Network request | Client-side `fetchWithTimeout(SCHUMANN_API_URL, 5000, { cache: "no-store" })` from a `"use client"` module | `lib/environment/service.tsx:440`. No server proxy is possible — `next.config.ts` sets `output: 'export'` (static export) for the Capacitor build. |
| Production endpoint | Same third-party host; **no** Bhumi-owned proxy | Contrast with Human Design, which has `app/api/humandesign/calculate/route.ts`. There is no `app/api/**` route for Schumann. |
| Parser | `normalizeSchumannResponse(raw, fetchedAt)` | `lib/environment/schumann.ts:24`. Expects `{ updated, status:{key,label}, intensity, amplitude, power, frequencies:[{id,value,nominal}] }` with ids `SR1..SR5`; every numeric field is range-and-finite guarded (`bounded()`); an `hasObservation` gate requires at least one numeric SR / intensity / amplitude / power before the observation is accepted. |
| Freshness validation | `SCHUMANN_STALE_MS = 30 * 60 * 1000`; `stale = Date.now() - t > SCHUMANN_STALE_MS`; `resolveSchumannUiState()` classifies `none | snapshot | partial | full | stale` | `lib/environment/schumann.ts:9,57,121-155`. |
| Cache | `localStorage["bhumi:env:schumann"]` rolling 24 h buffer (≤ 1000 obs) + `["bhumi:env:schumann:lastFetch"]`; 90 s minimum poll interval | `lib/environment/service.tsx:218-262,431-499`. On a fresh install / cleared storage the buffer is empty. |
| Environment service | `getNormalizedEnvironment(location)` seeds `ctx.schumann = { frequencies: [], provenance: "modelled-series", stale: true, source: metaUnavailable("schumann_resonance_live") }`, then patches it only if a live fetch **or** a cached fallback observation succeeds | `lib/environment/service.tsx:293-298,431-499`. |
| Dashboard state | `EnvironmentContextCard` calls `getNormalizedEnvironment`, stores `context` | `components/dashboard/EnvironmentContextCard.tsx:93`. |
| Rendered card (dashboard) | `context?.schumann?.frequencies.some(f => typeof f.valueHz === "number") ? \`SR1 … Hz\` : t.unavailable` | `components/dashboard/EnvironmentContextCard.tsx:172`. |
| Rendered card (`/dashboard/environment`) | Full 3-layer block rendered **only** when `context && schumann && hasSchumannObservation && spiritual`; otherwise a single "unavailable" `DetailItem` | `app/dashboard/environment/page.tsx:327-392`. |

### A.2 Findings against the Founder's checklist

```text
SCHUMANN_SOURCE           = https://schumannresonancelive.com/api/data.php
                            (keyless 3rd-party HTTP API, hardcoded at lib/environment/schumann.ts:5,
                            client-side fetch only, no Bhumi proxy — static export forbids one)

SCHUMANN_LIVE_FETCH       = FAIL — endpoint dead.
                            GET https://schumannresonancelive.com/api/data.php  ->  HTTP 404 Not Found
                            (verified 2026-09-06, single read-only probe).
                            Domain-root probe NOT completed (summariser unavailable) — LIMITATION:
                            confirm with the Founder/engineer whether the provider moved the API
                            path or discontinued the JSON feed.

SCHUMANN_PARSE            = NOT EXECUTABLE against live data (endpoint 404). Static review:
                            normalizeSchumannResponse() is defensive — a provider schema change is
                            silently treated as "no observation" (no throw). Compatibility with any
                            REPLACEMENT source is unproven and must be re-verified when one is chosen.

SCHUMANN_CACHE           = localStorage rolling 24h buffer (<=1000 obs, 30-min stale, 90s poll gate).
                            HONEST degradation: on live-fetch failure it serves the last buffered
                            observation IF one exists; a fresh install has an empty buffer -> no
                            fallback -> ctx.schumann stays at the metaUnavailable default.

SCHUMANN_ANDROID_NETWORK = SECONDARY, currently UNVERIFIABLE. Production APK runs the WebView at
                            https://localhost (Capacitor default androidScheme:'https';
                            capacitor.config.ts only overrides to 'http' under emulators). All
                            environment providers are cross-origin browser fetches. The providers
                            that WORK (Open-Meteo, USGS, NOAA SWPC, BigDataCloud) send permissive
                            Access-Control-Allow-Origin. Whether the (404) Schumann host sends CORS
                            headers for the https://localhost origin cannot be tested while it is
                            down. usesCleartextTraffic="false" + no release network_security_config
                            — but the Schumann URL is HTTPS, so TLS/cleartext is not the blocker.
                            fetchWithTimeout bounds the call at 5s.

SCHUMANN_ROOT_CAUSE      = CONFIRMED (PRIMARY): the upstream provider API path
                            schumannresonancelive.com/api/data.php no longer exists (HTTP 404).
                            Every live fetch fails; fresh installs have no cached fallback; the
                            environment service leaves ctx.schumann at its unavailable default and
                            the dashboard + /dashboard/environment honestly render
                            "Data belum tersedia".
                            PRE-EXISTING, NOT a Build 108 regression: BUILD_106_RECOVERY_MATRIX.md
                            (DS-E1 / R-PRD-44) already recorded "Schumann shows 'Data belum
                            tersedia'; no fabricated 'Stabil'. Fully-populated 3-layer render still
                            needs geolocation + a LIVE SCHUMANN SOURCE (unchanged residual)."
                            Build 106/107 shipped with the feed effectively non-functional and the
                            "honest unavailable" state accepted as gate-pass.
                            CONTRIBUTING (UNVERIFIED until a working endpoint exists): possible CORS
                            rejection of the https://localhost WebView origin.

FAKE_STABLE_FALLBACK_PRESENT = NO.  (Full evidence in §2.6 below.)
```

### A.3 `Aktivitas Bumi = Stabil` / `Aktivitas Geomagnetik = Tenang` — not fabricated

Verified in code that these are **genuine "available + quiet"** readings, not defaults synthesised
because Schumann failed:

- `getNormalizedEnvironment` seeds `ctx.earthActivity.dataState = "unavailable"` and only sets
  `{ status: "Stabil", dataState: "available" }` on a real USGS `200` with zero in-radius quakes
  (`lib/environment/service.tsx:286-291,381-387`). `ctx.spaceWeather.geomagneticActivity` is only
  set from `kpActivityLabel(kp)` on a real NOAA SWPC `200` (`:405-429`).
- Both render surfaces gate on availability:
  - `EnvironmentContextCard.tsx:170` — Earth Activity: `dataState === "available" ? status : t.unavailable`.
  - `EnvironmentContextCard.tsx:171` — Geomagnetic: `kpIndex !== undefined ? kpActivityLabel(...) : (geomagneticActivity ?? t.unavailable)`.
  - `app/dashboard/environment/page.tsx:315` — `earthActivity?.dataState === "available" ? … : t.environment.unavailable`.
  - `app/dashboard/environment/page.tsx:321` — `spaceWeather?.source.status === "available" ? … : t.environment.unavailable`.
- `V5_DECISION_LOG.md` D-#509: *"'Belum tersedia' for unavailable — fabricated defaults ('Stabil') forbidden."*
- **One residual to keep honest during remediation:** `deriveEnvironmentBands()`
  (`lib/environment/context_utils.tsx:35-48`) defaults a missing Schumann band to `"quiet"`. That
  derived band feeds only the spiritual-reading block, which `/dashboard/environment` renders
  **only when `hasSchumannObservation` is true** — so a dead feed shows the unavailable card, not a
  fabricated "quiet" spiritual reading. Any Schumann fix must preserve this gate.

### A.4 Static-export / Capacitor impact

`next.config.ts`: `output: process.env.VERCEL ? undefined : 'export'`. The Android artifact is a
static export synced into Capacitor (`webDir: 'out'`). Consequences for Schumann:

- No server component / route handler can proxy the request — the browser fetch to the third-party
  host is the only mechanism.
- The WebView origin is `https://localhost`, making every environment fetch cross-origin and
  CORS-gated.
- There is therefore **no server-side place to add an API key, a User-Agent, or a CORS-shim** for
  Schumann without introducing a Bhumi-owned proxy (which requires a hosted runtime, i.e. a
  Founder architecture decision).

### A.5 Proposed remediation (Founder review only — NOT implemented)

- **CDI-A1** — Founder selects a replacement Schumann data source (options to evaluate: a
  different endpoint on the same provider if the API merely moved; the HeartMath GCI feed; a
  Tomsk/`sosrff.tsu.ru`-derived feed; a Bhumi-owned proxy that scrapes/normalises one of these).
  **Do not change `SCHUMANN_API_URL` until a candidate is proven reachable + CORS-open from
  `https://localhost` + schema-compatible with `normalizeSchumannResponse` (or the parser is
  updated).**
- **CDI-A2** — If any candidate is not CORS-open, stand up a Bhumi-owned normalising proxy
  (hosted runtime) and point the client at it; this also lets Bhumi set an explicit
  `provenance: "modelled-series"` label and freshness contract.
- **CDI-A3** — Keep the honest-unavailable UI and the `deriveEnvironmentBands` gate exactly as
  they are; only the data source changes.

---

## B. HUMAN DESIGN DATA COMPLETENESS

### B.1 Which engine is actually deployed

`services/humandesign-api/` contains **two** Python services:

| Service | Route | Auth | Response shape | Deployed? |
|---|---|---|---|---|
| **`main.py`** (Bhumi FastAPI wrapper) | `POST /calculate` | Firebase ID token / AppCheck via the Next proxy; dev bypass header | **Flat** — `type`, `strategy`, `authority`, `profile`, `definition`, `signature`, `notSelfTheme`, `definedCenters[]`, `openCenters[]`, `gatesPersonality[]`, `gatesDesign[]`, `channels[]`, `variables`, `status:"ready"`, `source:"human-design-py"` | **YES** — request/response contract matches `lib/humandesign/hdkitAdapter.ts`. Native APK reaches it via the Vercel proxy `app/api/humandesign/calculate/route.ts` (URL resolved by `lib/config/hdApiUrl.ts` → `${NEXT_PUBLIC_WEB_APP_URL}/api/humandesign/calculate` → `https://bhumi-amartya-clean.vercel.app/...` → `https://bhumi-human-design-api.vercel.app/calculate`). |
| `src/humandesign/routers/general.py` (upstream AGPL "Human Design API", © Dogan Turkuler / devaible.com) | `GET /calculate` | `verify_token` | **Nested** — `{ general, channels, gates }` (matches `tests/regression/snapshots/v1/calculate.json`, which has `general.energy_type`, `general.inner_authority`, `gates.prs.Planets[].Color`, etc.) | **NO** — Bhumi does a `POST` with a flat-schema body and reads `data.type`; if this were the endpoint, HD would be fully broken for everyone, which contradicts Build 107 convergence and real resolved types. |

**The deployed engine is `main.py`.** All findings below are against `main.py`'s
`POST /calculate` response (source: `services/humandesign-api/main.py:165-304`).

### B.2 What the deployed engine returns for the advanced layer

`main.py` `POST /calculate` (non-debug):

```python
response = {
    "type": ..., "profile": ..., "authority": ..., "strategy": ...,
    "notSelfTheme": ..., "signature": ..., "inc_cross": ..., "incarnationCross": ...,
    "definition": ..., "channels": [...], "definedCenters": [...], "openCenters": [...],
    "gatesPersonality": [...], "gatesDesign": [...],
    "variables": result[11],          # <- the 4-arrow object, see below
    "status": "ready", "source": "human-design-py",
}
# response["diagnostic"] = { raw_personality_gates:[...], raw_design_gates:[...], ... }
#   is added ONLY when  hd_input.debug == True  OR  os.getenv("HD_DEBUG") == "true"
```

`variables` (from `src/humandesign/features/attributes.py::get_variables`):

```json
{
  "top_right":    { "value": "left|right", "name": "Motivation",   "aspect": "...", "def_type": "...", "tone": 5 },
  "bottom_right": { "value": "left|right", "name": "Perspective",  "aspect": "...", "def_type": "...", "tone": 1 },
  "top_left":     { "value": "left|right", "name": "Digestion",    "aspect": "...", "def_type": "...", "tone": 3 },
  "bottom_left":  { "value": "left|right", "name": "Environment",  "aspect": "...", "def_type": "...", "tone": 4 },
  "short_code":   "PRL DRR"
}
```

Key facts:

- The engine computes **only the 4 binary Variable arrows** (Motivation / Perspective / Digestion
  / Environment as L/R) + a `short_code`. `name` here is the *arrow label*, not a value.
- It **does not** compute the Primary Health System (PHS) 6-fold values that Bhumi's UI and
  narrative engines expect — e.g. Digestion ∈ {Appetite, Taste, Thirst, Touch, Sound, Light},
  Environment ∈ {Caves, Markets, Kitchens, Mountains, Valleys, Shores}, Motivation ∈ {Fear, Hope,
  Desire, Need, Guilt, Innocence}, Perspective ∈ {Survival, Possibility, Power, Wanting,
  Probability, Personal}, **Cognition** ∈ {Smell, Taste, Outer Vision, Inner Vision, Feeling,
  Touch} — Cognition is not produced at all.
- Per-planet **Color / Tone / Base** (needed to derive the PHS values) are present only inside
  `diagnostic.raw_personality_gates` / `raw_design_gates`, which are **gated behind `debug=true` /
  `HD_DEBUG=true`**. Bhumi's client (`hdkitAdapter.fetchWithAuthAndTimeout`) never sends `debug`.
- The engine returns raw gates as `gatesPersonality` / `gatesDesign` (gate-number lists), **not**
  as `personalityActivations` / `designActivations` objects — so the adapter's primary key for
  activation objects is never satisfied either.

### B.3 Per-field trace (deployed engine → adapter → schema → Firestore → UI)

Adapter: `lib/humandesign/hdkitAdapter.ts::calculateWithHdkit` success branch (lines 313-372).
Normalizer: `lib/repositories/blueprintRepository.ts::normalizeBlueprint` (lines 105-158) — runs
before **every** write and on **every** read; `sanitizeForFirestore` keeps `null`, drops
`undefined`/non-finite. UI: `components/blueprint/HumanDesignBodygraphLite.tsx` (lines 197-206) and
`app/blueprint/human-design/page.tsx` (line 165, "Variables" section).

```
FIELD = Digestion (PHS base value, e.g. "Appetite")
  API_RETURNS       = NO  (no top-level `digestion`; only variables.top_left.name == "Digestion")
  ADAPTER_MAPS      = reads `data.digestion` -> null                       (hdkitAdapter.ts:358)
  SCHEMA_SUPPORTS   = YES  (HumanDesignChart.digestion: string|null)
  PERSISTED         = null (normalizeBlueprint:140  savedHumanDesign?.digestion ?? null)
  EXISTING_USERS_HAVE = NO  (fresh onboard: null; mass-recover-hd: `data.digestion || null` = null; pre-V2: absent)
  UI_READS         = humanDesign.digestion  ->  HumanDesignBodygraphLite.tsx:200  `humanDesign[key] || "Not stored"`
  VERDICT          = BROKEN — engine does not emit; renders "Not stored"

FIELD = Environment / Motivation / Perspective / Cognition (PHS base values)
  (identical chain to Digestion)
  VERDICT          = BROKEN — engine does not emit; renders "Not stored"
  NOTE             = `perspective` is additionally NOT in normalizeBlueprint's explicit HD field
                     list (lines 116-158 coerce digestion/cognition/motivation/environment but not
                     perspective) — it survives only via the `...savedHumanDesign` spread, making
                     it the most fragile field. Resolves to null today regardless.

FIELD = Variables Arrows (short_code, e.g. "PRL DRR")
  API_RETURNS       = YES  (variables.short_code, plus variables.top_left/… objects)
  ADAPTER_MAPS      = YES  `variables: data.variables || null`  (verbatim)  (hdkitAdapter.ts:357)
  SCHEMA_SUPPORTS   = YES  (variables: Record<string, unknown> | null)
  PERSISTED         = YES  (normalizeBlueprint:139  savedHumanDesign?.variables ?? null)
  EXISTING_USERS_HAVE = YES for CANONICAL charts written by adapter/proxy or mass-recover-hd
  UI_READS         = HumanDesignBodygraphLite.tsx:203
                       `const variables = humanDesign.variables?.advanced || humanDesign.variables || {}`
                       `variables.variable || variables.value || "Not stored"`
  VERDICT          = BROKEN — DATA PRESENT, UI KEY MISMATCH. Stored object has `short_code`
                     (+ top_left/top_right/bottom_left/bottom_right), never `variable`, `value`,
                     or `advanced`. Card prints "Not stored" despite persisted data.

FIELD = digestion/environment variant + def_type (e.g. "Passive", "Focused", "Consecutive")
  API_RETURNS       = YES  inside variables.<arrow>.def_type / .value / .tone
  ADAPTER_MAPS      = kept only inside the raw `variables` blob; no dedicated mapping
  SCHEMA_SUPPORTS   = NO   (digestionVariant / environmentVariant do not exist on HumanDesignChart)
  UI_READS         = not rendered anywhere
  VERDICT          = NOT SURFACED

FIELD = Color / Tone / Base (per planetary activation)
  API_RETURNS       = ONLY when debug=true / HD_DEBUG=true
                        (main.py:264-300 gate diagnostic.raw_personality_gates / raw_design_gates,
                         which carry color/tone/base). Bhumi client never sends debug.
  ADAPTER_MAPS      = YES if present — toActivations(data.personalityActivations
                        || data.diagnostic?.raw_personality_gates) extracts color/tone/base
                        (hdkitAdapter.ts:155-173, 333-334). With no debug payload -> [].
  SCHEMA_SUPPORTS   = YES  (diagnostic, raw_personality_gates, raw_design_gates,
                            personalityActivations, designActivations;
                            HumanDesignActivation.{color?,tone?,base?}).
                            HD_ACTIVATION_STORAGE_AUDIT.md documents this "V2 storage path".
  PERSISTED         = [] for fresh onboard. mass-recover-hd.ts OMITS diagnostic / raw_*_gates /
                        activations entirely (canonicalChart, scripts/mass-recover-hd.ts:253-281).
  EXISTING_USERS_HAVE = NO. Pre-V2 legacy "cannot be losslessly reconstructed from aggregate gates".
  UI_READS         = HumanDesignBodygraphLite.tsx:204
                       designRows.concat(personalityRows).some(r => r.color||r.tone||r.base)
                         ? "Available in activation rows" : "Not stored"
                       activation columns (:113): "Activation data is not present in this stored blueprint."
  VERDICT          = BROKEN — engine withholds raw Color/Tone/Base unless debug; the recovery
                     path drops activations even when available.

FIELD = calculateAdvancedVariables()  (local PHS derivation from color/tone)
  LOCATION         = lib/humandesign/calculateAdvancedVariables.ts
  COMPUTES         = digestion + digestionVariant, environment + environmentVariant, cognition,
                     motivation, perspective, arrows `variableCode` — from Design-Sun / Design-Node
                     / Personality-Sun / Personality-Node color & tone.
  WIRED IN?        = NO. Referenced ONLY by scripts/widhi_validation.ts and scripts/calculate_widhi.ts.
                     Never called in generateBlueprint / calculateHumanDesign / hdkitAdapter /
                     blueprintRepository / any component. It also requires the debug-gated raw
                     gates it never receives.
  VERDICT          = ORPHANED — the intended derivation exists but is dead code.
```

### B.4 Persistence-layer defects (independent of the engine)

- **`mass-recover-hd.ts` — the existing-user recovery/migration path** (`scripts/mass-recover-hd.ts:253-281`):
  - `canonicalChart` OMITS `diagnostic`, `raw_personality_gates`, `raw_design_gates`,
    `personalityActivations`, `designActivations`. Even if the engine one day supplies activation
    detail, every user recovered through this script loses it.
  - `centers: data.definedCenters || []` writes a **raw array** into a field typed as the
    `{ head:boolean, ajna:boolean, … }` object. `normalizeBlueprint` then does
    `centers: { ...fallbackHumanDesign.centers, ...savedHumanDesign?.centers }` — spreading an
    array into an object yields `{ 0:"Throat", 1:"Heart", …, head:null, ajna:null, … }`, so
    `chart.centers.sacral` stays `null`. Bodygraph partially recovers via channel-derived centers,
    but this is a real corruption of the persisted `centers` shape for the recovered cohort.
  - It also reads `users/{uid}` for birth data but writes `blueprints/{uid}` — consistent with
    `blueprintRepository` (`blueprints/{uid}`), but note the debug script `scripts/check_widhi_hd.js`
    reads `users/{uid}/blueprints/primary` (a *different* path) — that script is stale, not the
    live path.
- **`normalizeBlueprint`** whitelists `digestion / cognition / motivation / environment` but not
  `perspective` (see B.3 note).

### B.5 HD narrative fallbacks — Indonesian leakage

| Engine / file | `isEn` support? | Consumers | Effect in ENL mode |
|---|---|---|---|
| `lib/humandesign/intelligence/variableIntelligence.ts` | **None** — defaults and all outputs Indonesian ("Sesuai kebutuhan", "Terstruktur & Fokus", "Pasif & Luas (Absorbing)", …) | via `styleEngine.ts` | Indonesian text in every consumer |
| `lib/humandesign/intelligence/styleEngine.ts` | **None** — every string hardcoded Indonesian ("Melalui …", "Ikuti respons tubuh", "Memimpin sebagai …", "Pencari Jati Diri", …) | `components/profile/{TopTalentCard,SpiritualArchetypeCard,RelationshipStyleCard,PotentialTab}`, `lib/profile/v2/insightTranslator.ts`, `lib/engines/blueprintSynthesisNarrative.ts`, `lib/orchestrators/localDailyGuidanceFallback.ts` | Profile → Potential cards + offline daily guidance render Indonesian HD style text |
| `lib/humandesign/presentation.ts` (`buildHumanDesignHumanMeaning`) | Has an `isEn` branch, BUT its English `variables.digestion/cognition/environment/motivation/perspective` are **generic constant strings that ignore `source.digestion/…`** (lines 644-650) | `app/blueprint/human-design/page.tsx` | Every ENL user sees identical filler for the Variables section |

**Additional symptom — "Story for this section is being prepared." on a resolved type.**
`app/blueprint/human-design/page.tsx:150-154` gates the whole presentation behind
`chart && (runtime?.ok || hdState?.state === "FALLBACK_LABELED")`. When a CANONICAL type resolves
but `executeHumanMeaningRuntime(blueprint)` returns `{ ok:false }`, `presentation` is `null` and
every card's `meaning` is `undefined`, so `page.tsx:195` renders
*"Cerita untuk bagian ini sedang disiapkan." / "Story for this section is being prepared."* — the
exact Founder symptom.
`lib/humanMeaningRuntime/inputValidator.ts::isCanonicalValue` rejects any nested value that is not
a plain object / array / string / boolean / finite number / null (e.g. a Firestore `Timestamp` or
a non-finite number inside `humanDesign` / `bazi` / `natalChart`), throwing
`HumanMeaningInputValidationError` → `{ ok:false }`. **The exact production trigger needs one more
focused trace** (candidate: a `Timestamp` on `humanDesign.generatedAt` / `updatedAt` reaching the
runtime, or an `NaN` from a degraded field). Logged as **CDI-B5**, PROBABLE, not yet unambiguous.

### B.6 Answers to the mandated questions

```text
HD_CORE_FIELDS_COMPLETE            = YES
  type / strategy / authority / profile / definition / signature / notSelfTheme / definedCenters /
  gates / channels / incarnationCross map correctly from main.py and persist. Build 107 convergence
  intact (getHdState CANONICAL requires hdEngineVersion === "gaia-hd-v1").

HD_ADVANCED_FIELDS_COMPLETE        = NO
  Digestion / Environment / Motivation / Perspective / Cognition base values, L/R variants, and
  per-activation Color / Tone / Base are absent from stored blueprints for ALL cohorts.
  Variables Arrows are stored (variables.short_code) but unreadable by the UI (key mismatch).

HD_API_PAYLOAD_COMPLETE            = NO
  Deployed engine (main.py POST /calculate) emits only the 4-arrow `variables` object + short_code.
  It does not derive PHS 6-fold values, does not compute Cognition at all, and gates raw
  Color/Tone/Base behind debug=true (never sent). It returns gate lists (gatesPersonality /
  gatesDesign), not activation objects (personalityActivations / designActivations).

HD_PERSISTENCE_COMPLETE            = NO / INCONSISTENT
  normalizeBlueprint coerces digestion/cognition/motivation/environment (not perspective) + variables
  and preserves diagnostic/raw_*_gates WHEN PRESENT. mass-recover-hd.ts (the existing-user recovery
  path) writes canonicalChart WITHOUT diagnostic/activations and with a corrupted `centers` shape.

HD_EXISTING_USER_MIGRATION_REQUIRED = YES — but ONLY after the engine actually emits the fields.
  Any backfill MUST: (a) preserve the Build 107 convergence invariant — never overwrite a CANONICAL
  `type` with a failed recalculation (saveUserBlueprint + mass-recover-hd already guard with
  isCanonicalHumanDesign); (b) fix mass-recover-hd's canonicalChart shape (add diagnostic/
  activations, correct centers); (c) be a Founder-authorised production write (currently prohibited).

HD_NARRATIVE_FALLBACK_LANGUAGE_GAP = PRESENT
  variableIntelligence.ts + styleEngine.ts are Indonesian-only (no isEn); they feed Profile →
  Potential cards and localDailyGuidanceFallback. presentation.ts English `variables.*` are generic
  constants that ignore the real values. Plus the "Story for this section is being prepared."
  presentation-gating symptom on CANONICAL types (CDI-B5).

HD_ROOT_CAUSE                      = CONFIRMED
  The deployed HD engine (services/humandesign-api/main.py, POST /calculate) computes only the 4
  binary Variable arrows (variables + short_code); it never derives the PHS 6-fold Digestion /
  Environment / Motivation / Perspective / Cognition values and gates raw per-gate Color/Tone/Base
  behind a `debug` flag the Bhumi client does not send. The adapter, schema, and persistence are
  wired to ACCEPT those fields but receive null / [], so every cohort shows "Not stored". The one
  advanced datum that IS stored (variables.short_code) is rendered against the wrong object keys
  (variable / value / advanced) in HumanDesignBodygraphLite.tsx, so it also shows "Not stored".
  The local calculateAdvancedVariables() that could derive the missing values from Color/Tone is
  orphaned and starved of the debug-gated raw gates. The existing-user recovery path
  (mass-recover-hd.ts) additionally omits activation detail and corrupts `centers`. Resolved types
  remain resolved — the gap is entirely in the advanced/variable layer and its narrative
  localisation, so no proposed fix risks a Build 107 convergence regression.
```

### B.7 Proposed remediation (Founder review only — NOT implemented)

- **CDI-B1 — Engine.** Decide the authoritative source for the PHS 6-fold values:
  - *Option 1 (server):* extend `services/humandesign-api/main.py` `/calculate` to compute and
    return `digestion / environment / motivation / perspective / cognition` (+ variants) and to
    include the raw activation rows (with `color/tone/base`) in the **normal** (non-debug)
    response, or to accept an explicit non-debug flag that the Bhumi client sends.
  - *Option 2 (client):* wire the orphaned `calculateAdvancedVariables()` into
    `hdkitAdapter.calculateWithHdkit` after the raw activations are available, and extend it to
    emit Cognition. Still requires the engine to return raw `color/tone` per activation.
  - Either way: the engine must return per-activation `color/tone/base` without `debug=true`.
- **CDI-B2 — UI key fix.** `HumanDesignBodygraphLite.tsx:203` should read
  `variables.short_code` (and/or render the four `top_*/bottom_*` arrows), not
  `variable | value | advanced`. `presentation.ts` English `variables.*` should consume the real
  `source.*` values like the Indonesian branch does.
- **CDI-B3 — Recovery script + normalizer.** Fix `scripts/mass-recover-hd.ts` `canonicalChart`
  (add `diagnostic` / `raw_*_gates` / activations; write `centers` in the `{head:bool,…}` shape).
  Add `perspective` to `normalizeBlueprint`'s explicit HD field list.
- **CDI-B4 — Localisation.** Give `variableIntelligence.ts` and `styleEngine.ts` (and the
  channel/cross/definition intelligence files they call) an `isEn` path; wire their consumers
  through it.
- **CDI-B5 — Presentation gating.** Trace and fix the `executeHumanMeaningRuntime` `{ok:false}`
  path so a CANONICAL type never shows "Story for this section is being prepared." (either
  sanitise the runtime input, or fall back to `buildHumanDesignHumanMeaning` when `runtime` fails
  but a CANONICAL chart exists).

---

## C. CHIRON ACCURACY

### C.1 Complete flow as built

| Stage | Implementation | Notes |
|---|---|---|
| Birth input | `birthDate`, `birthTime`, `birthCity/Country`, `latitude`, `longitude`, `timezone` from setup | `lib/engines/generateBlueprint.ts:29-59` |
| Date/time normalization + timezone | `toUtcDate(birthDate, birthTime, timezone)` — accepts `+HH:MM`; for IANA names resolves the offset via `Intl.DateTimeFormat(..., { timeZoneName: "longOffset" })` **evaluated at the birth instant** (so DST is handled); missing timezone → approximated `+HH:00` from `Math.round(longitude/15)` | `lib/astrology/calculateNatalBasics.ts:152-209`; `resolveNatalLocation:119-144` |
| Lat/lon | Provided coordinates, else `CITY_FALLBACKS` table, else none | `calculateNatalBasics.ts:59-74,119-150` |
| Ephemeris calculation | **`calculateNatalBasicsAsync`** computes a LOCAL result, then tries to override it via `POST ${HUMAN_DESIGN_SERVICE_URL || "http://localhost:8000"}/calculate-astrology` (Swiss Ephemeris, `swe.CHIRON`), silently falling back to the local result on any error | `lib/astrology/calculateNatalBasics.ts:626-688`; remote impl `services/humandesign-api/main.py:314-618` |
| Local Chiron | `getGeocentricLongitudeLocal("Chiron", date)` → `calculateApproximateChironLongitude(date)` = `normalizeLongitude(251.35 + days * 0.019777)` | `calculateNatalBasics.ts:260-282`. `astronomy-engine` has **no Chiron body** (verified: no match in `node_modules/astronomy-engine`), so this hand-rolled linear formula is the only local source. |
| Tropical/sidereal | Both engines tropical; `signFromLongitude(lon) = ZODIAC[floor(((lon%360)+360)%360 / 30)]` | No sidereal path anywhere — no tropical/sidereal contamination |
| House system | `buildApproximatePlacidusHouses(ascLon)` returns `ascLon + i*30` — **Equal House**, stored under the key `placidusHouses`; `buildWholeSignHouses` is correct | `calculateNatalBasics.ts:311-322,297-309` |
| Chiron longitude → sign | `planets.Chiron.sign = signFromLongitude(chironLon)`; `natalBasics.chiron = planets.Chiron?.sign` | `calculateNatalBasics.ts:509-533,595-611` |
| Chiron → house | `determineHouse(chironLon, placidusHouses)` — against the Equal-House cusps | `calculateNatalBasics.ts:324-342,484-499` |
| Persisted natal chart | `generateBlueprint` stores `natalChart.chiron` (sign) + `natalChart.planets.Chiron` (sign/degree/longitude/house). On read `normalizeBlueprint` prefers `data.natalChart?.chiron ?? data.astrology?.chiron` and **never recomputes Chiron** | `generateBlueprint.ts:107`; `blueprintRepository.ts:87-104` |
| Presentation / UI | `app/blueprint/natal-chart/page.tsx:128,205` renders Chiron **by sign** from `nc.chiron`; `:145` also feeds the element-balance fallback; `lib/dailyGuidance/unifiedBlueprintSynthesis.ts:719,852` feeds the Chiron sign into AI daily-guidance synthesis | `lib/astrology/presentation.ts:133,151,178`; `lib/data/astrologyDictionaries.ts:18,92` |

### C.2 Why the accurate path never runs in production

- `calculateNatalBasicsAsync` targets `process.env.HUMAN_DESIGN_SERVICE_URL || "http://localhost:8000"`.
- `HUMAN_DESIGN_SERVICE_URL` is **not** `NEXT_PUBLIC_`, is **absent from `next.config.ts` `env:`**,
  and there is **no `/api/**` proxy for astrology** (unlike HD — cf. `app/api/humandesign/*`).
  `calculateNatalBasicsAsync` does not use `getHdApiUrl()`.
- In the static-export APK bundle, `process.env.HUMAN_DESIGN_SERVICE_URL` is `undefined` at
  runtime → URL resolves to `http://localhost:8000` → from the `https://localhost` WebView this is
  cleartext + mixed-content (`android:usesCleartextTraffic="false"`, no release
  `network_security_config.xml`) → `fetch` throws → `catch` → **silent local fallback**.
- `.env.local.example:10` confirms `HUMAN_DESIGN_SERVICE_URL=http://localhost:8000` is a
  **dev-only** value. No production HTTPS URL for the astrology service exists anywhere in the
  repo. `TIMEZONE_AUDIT.md` (2026-06-06) already flagged "service is localhost-only" and "Remove
  `localhost` HD dependency for web/mobile".
- Therefore **every production blueprint's Chiron is the local linear approximation.**

### C.3 Why the local approximation is wrong

- `calculateApproximateChironLongitude` = fixed linear rate `0.019777°/day` from an anchor of
  `251.35°` at J2000. Chiron's orbit has eccentricity **e ≈ 0.38** and a ~50.7-year period; its
  ecliptic-longitude speed varies widely and it goes retrograde on a regular cadence. A constant
  rate ignores the equation of centre (order **±40°**). Error grows with `|birthdate − 2000-01-01|`
  and routinely exceeds one full 30° sign — so Chiron **sign**, **degree**, and any derived
  **house** are frequently wrong, while the `astronomy-engine`-computed bodies (Sun…Pluto), Moon,
  Ascendant, and MC remain accurate.
- Compounding: the "Placidus" cusps are actually **Equal House** (`ascLon + i*30`) stored under
  `placidusHouses`, so Chiron's *house* is Equal-house mislabelled — the Founder's "Placidus vs
  Whole Sign contamination".
- `normalizeBlueprint` never re-derives Chiron on read, so a wrong value persisted at onboarding
  is displayed indefinitely unless the user runs a full regenerate.
- No presentation-adapter field-mapping bug was found — `natal-chart/page.tsx` reads the correct
  field; it is faithfully displaying a wrong stored value.

### C.4 Timezone / DST / coordinates — secondary, not the Chiron driver

`toUtcDate` handles `+HH:MM` and IANA (DST resolved at the birth instant). When timezone is
missing and only longitude is known, `resolveNatalLocation` approximates `+HH:00` from
`Math.round(longitude/15)` (ignores real tz boundaries/DST); `app/setup/page.tsx` defaults
unresolved cities to `+07:00` (`TIMEZONE_AUDIT.md` P1). These materially corrupt Ascendant / MC /
houses / Moon, and can flip Chiron's **house** and its **degree rounding** — but Chiron moves only
~0.02–0.05°/day, so a multi-hour timezone error shifts Chiron by a fraction of a degree and does
**not** change its sign. Rank: linear ephemeris (dominant) > Equal-house-as-Placidus (house
errors) > timezone/coordinate resolution (ASC/house/Moon, minor Chiron degree) > dead Swiss
Ephemeris path (the fix vector).

### C.5 Deterministic fixtures — deferred

Per-user comparison fixtures (`calculateApproximateChironLongitude` vs Swiss Ephemeris for the 5
Golden Users — Widhi, Ning, Widya, Amartya, Eva Syana per
`NATAL_CHART_ENGINE_AUDIT_V3_JOKER.md §8`) were **not executed** in this pass: they require
running the local Python service (`main.py /calculate-astrology`, offline) which is a runtime
action beyond a read-only audit. The mechanism above already establishes the defect; fixtures will
**quantify** per-user error magnitude and are proposed as a follow-up READ-ONLY task once the
Founder authorises spinning up the local service.

```text
For each fixture, once run, report:
  BIRTH_INPUT       = <date> <time>
  TIMEZONE          = <offset / IANA>
  LAT_LON           = <lat, lon>
  CHIRON_LONGITUDE  = Bhumi-local vs Swiss-Ephemeris (deg)
  CHIRON_SIGN       = Bhumi-local vs Swiss-Ephemeris
  CHIRON_DEGREE     = Bhumi-local vs Swiss-Ephemeris
  CHIRON_HOUSE      = Bhumi-local (Equal, mislabelled Placidus) vs Swiss-Ephemeris (true Placidus)
  HOUSE_SYSTEM      = note the Equal-vs-Placidus discrepancy explicitly
  EXPECTED_SOURCE   = Swiss Ephemeris (swe.CHIRON) via services/humandesign-api/main.py
  BHUMI_RESULT      = persisted natalChart.chiron / planets.Chiron
  MATCH            = YES/NO per row
```

### C.6 Findings against the Founder's checklist

```text
CHIRON_CALCULATION_ENGINE      = Production: local lib/astrology/calculateNatalBasics.ts ->
                                 calculateApproximateChironLongitude (linear approximation).
                                 Intended: Swiss Ephemeris swe.CHIRON via
                                 services/humandesign-api/main.py /calculate-astrology — UNREACHABLE
                                 in production (dead code path; no NEXT_PUBLIC URL, no /api proxy,
                                 http://localhost:8000 blocked by the WebView).

CHIRON_LONGITUDE_ACCURACY      = POOR. Linear model ignores orbital eccentricity (e~=0.38) and
                                 retrograde motion; error scales with |birthdate - J2000| and
                                 commonly exceeds 30 degrees.

CHIRON_SIGN_ACCURACY           = FREQUENTLY WRONG — direct consequence of the longitude error.
                                 Matches the Founder's "some users' Chiron placement is incorrect".

CHIRON_DEGREE_ACCURACY         = WRONG whenever longitude is off; also perturbed by the timezone
                                 approximation.

CHIRON_HOUSE_ACCURACY          = WRONG on two counts: wrong Chiron longitude + houses are Equal
                                 House mislabelled `placidusHouses`.

CHIRON_PERSISTENCE_ACCURACY    = Faithfully persists whatever was computed; normalizeBlueprint
                                 never re-derives Chiron on read -> wrong values are sticky.

CHIRON_PRESENTATION_ACCURACY   = No adapter/mapping bug. natal-chart/page.tsx reads the correct
                                 field; it displays a wrong stored value.

CHIRON_ROOT_CAUSE              = CONFIRMED. Production always uses the local astronomy-engine
                                 fallback because the Swiss Ephemeris /calculate-astrology service
                                 is unreachable from the APK (HUMAN_DESIGN_SERVICE_URL undefined in
                                 the client bundle -> http://localhost:8000 -> cleartext/mixed-
                                 content blocked; no astrology /api proxy exists). The local
                                 fallback derives Chiron from a hand-rolled LINEAR ephemeris
                                 (251.35 + days*0.019777) because astronomy-engine has no Chiron
                                 body; that model ignores Chiron's high eccentricity and retrograde
                                 motion, so sign/degree/house are frequently wrong. Compounded by
                                 Equal-house cusps stored as `placidusHouses` and by never
                                 re-deriving Chiron on read.
```

### C.7 Proposed remediation (Founder review only — NOT implemented)

- **CDI-C1 — Real ephemeris.** Either (a) deploy `services/humandesign-api` to a hosted HTTPS
  runtime and give the client a reachable URL (`NEXT_PUBLIC_ASTROLOGY_API_URL` or a Vercel
  `/api/astrology` proxy mirroring the HD pattern in `lib/config/hdApiUrl.ts`), so
  `/calculate-astrology` (`swe.CHIRON`, true Placidus) actually runs; or (b) add a vetted
  TypeScript Chiron ephemeris (e.g. a series expansion / VSOP-style term set for 1500–2100) to the
  local fallback. Stop labelling Equal-House cusps as `placidusHouses`.
- **CDI-C2 — Provenance + re-derivation.** Give fallback-sourced natal data an
  "approximate / unverified" provenance label (parity with the HD provenance system) and/or
  re-derive the natal chart on read when the source is `astronomy-engine-fallback`.
- **CDI-C3 — Timezone resolution.** Carry a real timezone (IANA) from city selection through
  `setup` so `calculateNatalBasics` never has to approximate `+HH:00` from longitude
  (already tracked in `TIMEZONE_AUDIT.md`).

---

## D. CROSS-USER / LEGACY DATA

| Subsystem | New users | `mass-recover-hd` cohort (Build 106/107) | Build 103/104/105 & pre-V2 legacy | Backfill needed? |
|---|---|---|---|---|
| **Schumann** | "Data belum tersedia" | same | same | **No** — cohort-independent, no per-user stored data. Fix = a working source; the localStorage 24 h accumulation then resumes for everyone. |
| **Human Design** | `type/strategy/authority/profile` CANONICAL; advanced vars `null`; activations `[]` | CANONICAL type; advanced vars `null`; **activations omitted; `centers` shape degraded** | Pre-V2: aggregate gates/channels only — `HD_ACTIVATION_STORAGE_AUDIT.md`: "cannot be losslessly reconstructed from aggregate gates" → full re-fetch per user required | **Yes**, after the engine emits the fields. Steps: (1) engine fix (CDI-B1); (2) per-user re-run against birth data with the `isCanonicalHumanDesign` overwrite guard; (3) fix `mass-recover-hd` `canonicalChart` shape (CDI-B3); (4) Founder-authorised production write. |
| **Chiron** | Suspect (linear model) | Suspect | `V3_JOKER`-era users: full `planets.Chiron` with degree/house, all from the linear model. Pre-expansion legacy: may have only `sunSign/moonSign/risingSign`, no Chiron. | **Yes**, after a real ephemeris exists (CDI-C1). Steps: per-user recompute of `natalChart.chiron` + `planets.Chiron` + true Placidus cusps; must not destroy other valid natal fields; Founder-authorised production write. |

**Non-destructive rule for any future backfill:** never overwrite a valid CANONICAL HD `type`
(the Build 107 convergence invariant); never blank a natal field that is already correct; write
only the specific corrected keys; run as a dry-run first (as `mass-recover-hd.ts` already does).

---

## E. VERDICT

```text
SCHUMANN_STATUS                       = BROKEN — upstream provider endpoint dead (HTTP 404); feed
                                       non-functional since >= Build 106 (documented residual DS-E1).
                                       Honest "unavailable" UI; no fabricated values.

HUMAN_DESIGN_CORE_STATUS             = HEALTHY — type / strategy / authority / profile / definition
                                       / centers / gates / channels resolve and persist; Build 107
                                       convergence intact.

HUMAN_DESIGN_ADVANCED_VARIABLES_STATUS = BROKEN — Digestion / Environment / Motivation /
                                       Perspective / Cognition + variants + per-gate Color / Tone /
                                       Base absent for all cohorts (engine does not emit / debug-
                                       gated). The one stored datum (variables.short_code) is
                                       rendered against wrong keys. Local derivation orphaned.
                                       Narrative fallbacks Indonesian-only.

CHIRON_STATUS                        = BROKEN — production always uses a linear-approximation
                                       ephemeris (Swiss Ephemeris path unreachable); sign / degree
                                       / house frequently wrong; houses are Equal House mislabelled
                                       Placidus.

NEW_USER_AFFECTED                    = YES (all three)

EXISTING_USER_AFFECTED               = YES (all three; Build 103–107 cohorts)

BACKFILL_REQUIRED                    = YES for Human Design advanced variables and Chiron
                                       (AFTER the upstream calculation is fixed).
                                       NOT applicable for Schumann (no stored per-user data).

PRODUCTION_DATA_MUTATION_REQUIRED    = YES eventually, for the HD advanced-variable and Chiron
                                       backfills — NOT AUTHORISED now; Founder decision required.
                                       Zero production Firestore writes performed or proposed in
                                       this pass.

ROOT_CAUSES_CONFIRMED               =
  1. Schumann — provider API path schumannresonancelive.com/api/data.php returns 404
     (endpoint removed/moved). CONFIRMED.
     Secondary CORS-from-https://localhost risk: UNVERIFIED until a live endpoint exists.
  2. Human Design advanced variables — deployed engine (main.py /calculate) computes only 4 arrows;
     PHS 6-fold values never derived; Cognition never computed; raw Color/Tone/Base debug-gated and
     not requested; variables.short_code rendered against wrong UI keys; calculateAdvancedVariables()
     orphaned; mass-recover-hd.ts drops activations + corrupts `centers`; variable narratives
     Indonesian-only. CONFIRMED.
  3. Chiron — Swiss Ephemeris /calculate-astrology unreachable in production (no NEXT_PUBLIC/proxy;
     http://localhost:8000 blocked) -> local fallback always used -> Chiron from a linear ephemeris
     (astronomy-engine has no Chiron) -> sign/degree/house wrong; Equal-house cusps mislabelled
     `placidusHouses`. CONFIRMED.

FIX_SCOPE                           = Engines + adapters + persistence + presentation + one
                                     migration script + (later, Founder-gated) a production
                                     backfill. No Build 107 inheritance regression: HD `type`
                                     convergence, admin withdrawal, orphan-route removal, and
                                     static-surface guards are untouched by every proposed fix.

BUILD_108_BLOCKERS_OPEN            =
  CDI-A1  Schumann source replacement/repair (Founder chooses provider; verify reachability +
          CORS from https://localhost + schema compatibility with normalizeSchumannResponse).
  CDI-A2  If not CORS-open, stand up a Bhumi-owned normalising proxy.
  CDI-A3  Preserve the honest-unavailable UI + the deriveEnvironmentBands gate unchanged.
  CDI-B1  HD engine: emit PHS Digestion/Environment/Motivation/Perspective/Cognition + variants;
          expose raw Color/Tone/Base without a debug flag (or wire calculateAdvancedVariables()).
  CDI-B2  Fix HumanDesignBodygraphLite.tsx Variables-Arrows key read (short_code / top_*); make
          presentation.ts English `variables.*` consume the real values.
  CDI-B3  Fix mass-recover-hd.ts canonicalChart (add diagnostic/activations, correct `centers`);
          add `perspective` to normalizeBlueprint's explicit HD field list.
  CDI-B4  Localise HD variable/style narratives (variableIntelligence.ts, styleEngine.ts, the
          channel/cross/definition intelligence files, and their consumers incl.
          localDailyGuidanceFallback).
  CDI-B5  Trace + fix "Story for this section is being prepared." on CANONICAL types
          (executeHumanMeaningRuntime {ok:false} gating in app/blueprint/human-design/page.tsx).
  CDI-C1  Restore a real Chiron ephemeris: make Swiss Ephemeris /calculate-astrology reachable in
          production (deploy + NEXT_PUBLIC URL or /api proxy) OR add a vetted TS Chiron ephemeris;
          stop labelling Equal houses as `placidusHouses`.
  CDI-C2  Re-derive natal chart on read OR add an "approximate/unverified" provenance label for
          fallback-sourced natal data (parity with HD provenance).
  CDI-C3  Carry a real IANA timezone from city selection through setup.
  CDI-D1  Post-fix backfill plan for HD advanced variables + Chiron across Build 103–107 cohorts
          (Founder-authorised, non-destructive, convergence-safe).

NEXT_SAFE_ACTION                    = FOUNDER_REVIEW_OF_CORE_DATA_INTEGRITY_AUDIT
```

---

## F. Required Final Report (this task)

```text
AUTHORIZED_BRANCH   = recovery/build106-product-continuity
INITIAL_HEAD        = 9fc364abd4d4931ad12f81070ac401434b86a11a
FILES_CHANGED       = 5 (documentation only)
                       + BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md   (new)
                       ~ BUILD_108_ENL_MASTER_SOT.md              (status + audit section)
                       ~ BUILD_108_ENL_SCOPE_MATRIX.md            (data-integrity ledger + status)
                       ~ BUILD_108_ENL_HANDOFF.md                 (pause + next safe action)
                       ~ BUILD_108_ENL_SPRINT_PLAN.md             (pre-Sprint-5 gate + status)
TESTS_RUN           = none (read-only audit; no code changed)
EXIT_CODES          = n/a
PRODUCTION_READS    = 0
PRODUCTION_WRITES   = 0
FIRESTORE_MUTATIONS = 0
EXTERNAL_PROBES     = 1 read-only GET (schumannresonancelive.com/api/data.php -> HTTP 404)
COMMITS_CREATED     = 0 (staged for Founder review; not committed)
TRACKED_WORKTREE_STATE   = 5 modified/created .md files, unstaged
UNTRACKED_FILES_PRESERVED = scripts/.build106-production-admin-provision.mjs (untouched)
KNOWN_LIMITATIONS  =
  - Schumann domain-root probe not completed (fetch summariser intermittently unavailable);
    confirm whether the provider moved vs discontinued the API.
  - HD engine schema read from in-repo source (services/humandesign-api/main.py), not a live
    probe of bhumi-human-design-api.vercel.app (POST-only; no read-only probe possible here).
  - Chiron per-user comparison fixtures deferred (require running the local Python service —
    a runtime action outside a read-only audit).
  - CDI-B5 ("Story for this section is being prepared." on CANONICAL types) has a PROBABLE
    mechanism (runtime input validator rejecting a non-plain-object such as a Firestore Timestamp)
    but not a single unambiguous trigger — one more focused trace required.
EXACT_NEXT_RECOVERY_TASK = Founder review of this audit; then, on approval, schedule the CDI-*
    remediation work (engine + adapter + presentation fixes first; production backfill last and
    separately authorised).
MARKER             = BUILD_106_RECOVERY_IN_PROGRESS  (Build 108 ENL implementation PAUSED_FOR_CORE_DATA_INTEGRITY_AUDIT)
```

**STOP AND WAIT FOR FOUNDER REVIEW.**
