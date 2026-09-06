# BUILD 108 ENL — CORE DATA INTEGRITY AUDIT
**Read-only root-cause investigation of three confirmed production data-integrity defects**

```text
AUDIT_STATUS                        = READ_ONLY_ROOT_CAUSE_AUDIT_COMPLETE — FOUNDER-APPROVED 2026-09-06
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
GATE_108_CDI                        = IN_PROGRESS  (CDI-108-01 Chiron DONE · CDI-108-01A timezone DONE · CDI-108-02 HD refined audit DONE / impl NOT started · CDI-108-03 Schumann not started)
TRIGGER                             = FOUNDER — three confirmed production defects from real users
PRODUCTION_BASELINE                 = BUILD 107 (versionCode 107, versionName 5.0.7, commit d2ecb5e)
WORKTREE                            = C:\tmp\bhumi-build106-recovery
BRANCH                              = recovery/build106-product-continuity
AUDIT_HEAD                          = 9fc364abd4d4931ad12f81070ac401434b86a11a
AUDIT_CHECKPOINT_COMMIT             = 00e500f (docs-only)
AUDIT_DATE                          = 2026-09-06
PRODUCTION_READS                    = 0
PRODUCTION_WRITES                   = 0
FIRESTORE_MUTATIONS                 = 0
EXTERNAL_PROBES                     = read-only GETs (schumannresonancelive.com/api/data.php -> 404;
                                     bhumi-human-design-api.vercel.app openapi/health) + one synthetic-data
                                     POST to /calculate (HD, no PII) — see §B.1a and §D
NEXT_SAFE_ACTION                    = FOUNDER_REVIEW_OF_CDI_108_01A_AND_HD_REFINED_AUDIT
```

> **Governance marker.** `BUILD_106_RECOVERY_IN_PROGRESS` no longer represents this work. Current
> markers: `BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY`,
> `GATE_108_CDI = IN_PROGRESS`. Sprint 5 remains BLOCKED.
>
> **Progress:** CDI-108-01 (Chiron ephemeris) — §C.8. CDI-108-01A (timezone canonicalization) —
> §C.9. CDI-108-02 (Human Design) — refined READ-ONLY live-contract audit §B.8; implementation
> NOT started. CDI-108-03 (Schumann) — not started.

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

## B.8 CDI-108-02 — REFINED LIVE-CONTRACT AUDIT (READ-ONLY, 2026-09-06)

> Founder evidence: *"The deployed production HD API is not identical to repo
> `services/humandesign-api/main.py`."* Confirmed. §B.1–§B.3 above traced repo `main.py`;
> this section re-traces the **live deployed contract** and supersedes §B.2–§B.3 / §B.6 where
> they differ. Method: read-only synthetic POST (no PII) to
> `https://bhumi-human-design-api.vercel.app/calculate` on 2026-09-06, plus a static re-read of
> the adapter → normalizer → persistence → recovery → UI chain.

### B.8.1 The live `/calculate` response (synthetic input; verified 2026-09-06)

Top-level keys: `type, strategy, authority, profile, definition, signature, notSelfTheme,
inc_cross, incarnationCross, definedCenters, openCenters, gatesPersonality, gatesDesign, channels,
variables, digestion, environment, motivation, cognition, status, calculationStatus, source`.

```jsonc
"digestion":   "Active",        // == variables.top_left.def_type    (arrow qualitative, NOT PHS 6-fold)
"environment":  "Observer",     // == variables.bottom_left.def_type
"motivation":   "Receptive",    // == variables.top_right.def_type
"cognition":    "Outer Vision", // genuine 6-fold PHS Cognition (Smell/Taste/Outer Vision/Inner Vision/Feeling/Touch)
// "perspective" — ABSENT top-level
"variables": {
  "top_right":    { "value":"right","name":"Motivation",  "aspect":"Personality (Mind)","def_type":"Receptive", "tone":4 },
  "bottom_right": { "value":"right","name":"Perspective", "aspect":"Personality (View)","def_type":"Peripheral","tone":4 },
  "top_left":     { "value":"left", "name":"Digestion",   "aspect":"Design (Brain)",    "def_type":"Active",    "tone":3 },
  "bottom_left":  { "value":"right","name":"Environment", "aspect":"Design (Body)",     "def_type":"Observer",  "tone":4 },
  "short_code":   "PRR DLR"
}
// diagnostic — ABSENT.  personalityActivations / designActivations — ABSENT.
// `debug:true` in the request body is IGNORED (identical response; no diagnostic block).
```

**Correction to §B.2/§B.3/§B.6/§B.7:** the deployed engine **is not** repo `main.py`. It DOES
return top-level `digestion / environment / motivation / cognition`; it does NOT gate anything
behind `debug`; there is no repo-`main.py`-style debug path to obtain raw Color/Tone/Base.
`digestion/environment/motivation` are the **arrow `def_type`** (a binary L/R qualitative label),
not the Ra-Uru-Hu PHS 6-fold Determination/Environment/Motivation. `cognition` IS the true 6-fold.

### B.8.2 Field-by-field trace against the LIVE contract

adapter = `lib/humandesign/hdkitAdapter.ts::calculateWithHdkit` ready branch ·
proxy = `app/api/humandesign/calculate/route.ts` (full pass-through: `{...data, hdEngineVersion,
calculationQuality, source, hdAuditStatus}`) · normalizer = `blueprintRepository.normalizeBlueprint`
HD block · persistence = `saveUserBlueprint` → `sanitizeForFirestore` → `setDoc({merge:true})` ·
recovery = `mass-recover-hd.ts::canonicalChart` + `blueprintRecoveryEngine.triggerBackgroundHdCalculation` ·
UI = `components/blueprint/HumanDesignBodygraphLite.tsx` ("Advanced Variables" grid + "Variables
Arrows" + "Color / Tone / Base").

```text
FIELD              = Digestion
LIVE_API_RETURNS   = YES — top-level `digestion:"Active"` (== variables.top_left.def_type)
ADAPTER_READS      = YES — `digestion: data.digestion || null`
SCHEMA_SUPPORTS    = YES — HumanDesignChart.digestion: string|null
NORMALIZER_PRESERVES = YES — `digestion: savedHumanDesign?.digestion ?? null` (explicit)
PERSISTENCE_WRITES = YES — a fresh onboard stores "Active"
RECOVERY_PRESERVES = YES — mass-recover-hd `digestion: data.digestion || null`; background recalcalc via adapter
UI_KEY_EXPECTED    = humanDesign.digestion   (HumanDesignBodygraphLite.tsx grid)
UI_KEY_ACTUAL      = humanDesign.digestion   — CORRECT KEY
ROOT_CAUSE         = NOT an engine/adapter/normalizer/UI bug for NEW users. A chart calculated by
                     the current deployed engine stores & shows the value. "Not stored" users hold
                     LEGACY blueprints persisted before the engine emitted `digestion`.
                     -> LOCAL MIGRATION possible from `variables.top_left.def_type` when the
                        `variables` object was persisted; otherwise RE-FETCH.

FIELD              = Environment    (identical chain; LIVE `environment:"Observer"` == variables.bottom_left.def_type)
  UI_KEY_EXPECTED/ACTUAL = humanDesign.environment / humanDesign.environment  — CORRECT
  ROOT_CAUSE       = legacy blueprints -> local-migratable from variables.bottom_left, else re-fetch.

FIELD              = Motivation     (identical chain; LIVE `motivation:"Receptive"` == variables.top_right.def_type)
  UI_KEY_EXPECTED/ACTUAL = humanDesign.motivation / humanDesign.motivation  — CORRECT
  ROOT_CAUSE       = legacy blueprints -> local-migratable from variables.top_right, else re-fetch.

FIELD              = Cognition
LIVE_API_RETURNS   = YES — `cognition:"Outer Vision"` (genuine 6-fold PHS Cognition; NOT an arrow)
ADAPTER_READS      = YES — `cognition: data.cognition || null`
SCHEMA_SUPPORTS    = YES ; NORMALIZER_PRESERVES = YES (explicit) ; PERSISTENCE_WRITES = YES
RECOVERY_PRESERVES = YES (mass-recover + background recalc)
UI_KEY_EXPECTED/ACTUAL = humanDesign.cognition / humanDesign.cognition  — CORRECT
ROOT_CAUSE         = legacy blueprints. NOT locally derivable (no `variables.cognition`; needs the
                     Design-Sun tone the engine used). -> RE-FETCH ONLY.

FIELD              = Perspective
LIVE_API_RETURNS   = NO top-level `perspective`. BUT `variables.bottom_right =
                     {value:"right", name:"Perspective", def_type:"Peripheral", tone:4}` IS returned.
ADAPTER_READS      = `perspective: data.perspective || null`  -> ALWAYS null (reads an absent key)
SCHEMA_SUPPORTS    = YES — HumanDesignChart.perspective: string|null
NORMALIZER_PRESERVES = WEAK — no explicit `perspective:` line; carried only by the ...savedHumanDesign
                     spread; a null saved value stays null.
PERSISTENCE_WRITES = writes null ; RECOVERY_PRESERVES = mass-recover writes null
UI_KEY_EXPECTED/ACTUAL = humanDesign.perspective / humanDesign.perspective (CORRECT key) -> null -> "Not stored"
ROOT_CAUSE         = ADAPTER GAP — it reads `data.perspective` (never sent) instead of deriving from
                     `data.variables.bottom_right` (always sent). Affects EVERY user incl. new.
                     Perspective IS derivable from returned data. Fix = one adapter line + an
                     explicit `perspective:` coercion in `normalizeBlueprint`; a one-time recompute
                     from the stored `variables.bottom_right` migrates existing users (no re-fetch).

FIELD              = Variables Arrows  (short_code / the variables object)
LIVE_API_RETURNS   = YES — `variables.short_code:"PRR DLR"` + the 4 arrow objects
ADAPTER_READS      = YES — `variables: data.variables || null` (whole object)
SCHEMA_SUPPORTS    = YES — variables: Record<string,unknown>|null
NORMALIZER_PRESERVES = YES — `variables: savedHumanDesign?.variables ?? null` (explicit)
PERSISTENCE_WRITES = YES — the full {top_right,…,short_code} object is stored
UI_KEY_EXPECTED    = HumanDesignBodygraphLite.tsx:203
                     `const variables = humanDesign.variables?.advanced || humanDesign.variables || {}`
                     then `variables.variable || variables.value || "Not stored"`
UI_KEY_ACTUAL      = stored object has `short_code`, `top_right`, `top_left`, `bottom_right`,
                     `bottom_left` — NO `variable`, NO `value`, NO `advanced`
ROOT_CAUSE         = CONFIRMED PURE UI KEY MISMATCH. The datum IS stored for every engine-sourced
                     chart; the bodygraph reads keys that never exist -> "Not stored". Fix is a
                     UI read (`variables.short_code`, and/or render the 4 arrows). NO re-fetch,
                     NO migration. Affects ALL users incl. new.

FIELD              = Color / Tone / Base  (per planetary activation)
LIVE_API_RETURNS   = NO. No `diagnostic`, no `personalityActivations`/`designActivations`;
                     `debug:true` is ignored. Only the 4 arrow tones (`variables.<arrow>.tone`,
                     1–6) exist — NOT per-planet color/tone/base.
ADAPTER_READS      = `toActivations(data.personalityActivations || data.diagnostic?.raw_personality_gates)` -> []
SCHEMA_SUPPORTS    = YES — HumanDesignActivation.{color?,tone?,base?}, diagnostic, raw_*_gates
NORMALIZER_PRESERVES = YES if present (they are not)
PERSISTENCE_WRITES = [] empty activation arrays
RECOVERY_PRESERVES = mass-recover-hd OMITS diagnostic/raw_*_gates/activations from canonicalChart entirely
UI_KEY_EXPECTED/ACTUAL = bodygraph checks `row.color || row.tone || row.base` across rows -> none -> "Not stored"
ROOT_CAUSE         = DATA-AVAILABILITY LIMITATION of the deployed engine. Cannot be obtained from
                     the existing engine and is NOT locally derivable (needs the raw ephemeris
                     positions). Requires an engine that emits a diagnostic/activations block
                     (self-host repo `services/humandesign-api`, or a TS HD ephemeris) — same
                     class as CDI-C1.

FIELD              = centers  (mass-recover corruption — still present)
mass-recover-hd `canonicalChart.centers = data.definedCenters || []` writes a RAW ARRAY
(["Ajna","G_Center",…]) into a field typed `{head:boolean, ajna:boolean, …}`. `normalizeBlueprint`
then does `centers: {...fallback.centers, ...savedHumanDesign?.centers}` — spreading an array into
an object yields `{0:"Ajna",1:"G_Center",…, head:null, ajna:null,…}`, so `chart.centers.sacral`
stays null. `openCenters` is not mapped at all. The bodygraph partially recovers via
channel-derived centers. -> `mass-recover-hd.ts` STILL corrupts `centers` and drops activations
(unchanged). The script is not run without `--execute` + Founder approval.
```

### B.8.3 Refined answers

```text
HD_LIVE_CONTRACT_VERIFIED       = YES (synthetic POST 2026-09-06; response shape above)
HD_ADVANCED_FIELDS_LIVE         = digestion / environment / motivation = arrow def_type (present)
                                 cognition = 6-fold PHS value (present)
                                 perspective = ABSENT top-level, PRESENT + derivable in variables.bottom_right
                                 short_code = present ("PRR DLR")
                                 per-planet Color/Tone/Base = ABSENT (debug ignored; no diagnostic)
HD_ADAPTER_GAPS                 = (1) `perspective: data.perspective || null` reads an absent key
                                     instead of deriving from `data.variables.bottom_right`.
                                 (2) no other gap for the present fields — adapter maps
                                     digestion/environment/motivation/cognition/variables correctly.
HD_PERSISTENCE_GAPS            = (1) `normalizeBlueprint` has no explicit `perspective:` coercion
                                     (spread-only; fragile).
                                 (2) otherwise digestion/cognition/motivation/environment/variables
                                     are explicitly preserved — NO drop.
HD_UI_MAPPING_GAPS            = CONFIRMED — `HumanDesignBodygraphLite.tsx:203` reads
                                 `variables.variable || variables.value` (nonexistent) instead of
                                 `variables.short_code` (and/or the 4 `top_*/bottom_*` arrows).
                                 The "Advanced Variables" grid keys (humanDesign.digestion etc.) are
                                 CORRECT.
HD_RECOVERY_GAPS             = `mass-recover-hd.ts` (a) writes `centers` as a raw array (corrupt),
                                 (b) omits `diagnostic`/`raw_*_gates`/activations, (c) omits
                                 `openCenters`, (d) writes `perspective: data.perspective || null`
                                 (always null). `blueprintRecoveryEngine` background recalc goes
                                 through the adapter and is only missing `perspective` (same adapter gap).
HD_BACKFILL_REQUIREMENT_REFINED =
  - Variables Arrows display  -> NO backfill. Pure UI key fix (CDI-B2).
  - perspective              -> NO re-fetch. Adapter derive + normalizer coercion + a one-time
                                recompute from the stored `variables.bottom_right` (local migration).
  - digestion/environment/motivation -> LOCAL MIGRATION from stored `variables.<arrow>.def_type`
                                for charts that persisted `variables`; RE-FETCH for older charts
                                without `variables`.
  - cognition                -> RE-FETCH ONLY (not locally derivable).
  - Color/Tone/Base          -> needs a diagnostic-emitting engine first (out of scope of the
                                existing engine); no backfill possible until then.
  - `mass-recover-hd.ts` centers/activations/openCenters shape  -> fix the script BEFORE any
                                future recovery run; re-run only under Founder authorisation.
  All backfill is Founder-authorised, non-destructive, convergence-safe (`isCanonicalHumanDesign`
  guard), and NOT performed in this pass.
```

**Do NOT implement CDI-108-02 yet** — the field-by-field root cause is now proven; the Founder
decides sequencing and which backfill path per field.

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

## C.8 CDI-108-01 — Chiron / Natal Accuracy — EXECUTION RESULT (2026-09-06, Founder-authorised)

**Change class:** engines + adapters + persistence + presentation + config + one deterministic
test + one committed ephemeris table. NO production Firestore read/write, NO backfill, NO version
bump / build / sign / upload. Build 107 inheritance checklist verified intact (HD convergence 19/19,
production-surface guard 131/131). `npx tsc --noEmit` EXIT 0. Non-emulator release suite
PASS=21 FAIL=0.

### Files

| File | Change |
|---|---|
| `lib/astrology/data/chironEphemeris.json` | **NEW** — Swiss Ephemeris Chiron longitude table, 1900–2100, 7-day samples (10,438), 66.7 KB. Generated by `scripts/generate-chiron-ephemeris.py` from `pyswisseph 2.10.03` + `seas_18.se1`. |
| `lib/astrology/chironEphemeris.ts` | **NEW** — `chironLongitudeAt(date)` (Catmull-Rom interpolation; validated max error **0.00083°** over 72,944 daily checks); `chironIsRetrograde(date)`; returns `null` outside the safe window (fail closed). |
| `lib/config/astrologyApiUrl.ts` | **NEW** — `getAstrologyApiUrl()` mirroring the HD/daily-guidance pattern: ENL APK → `{WEB_APP_URL}/api/humandesign/astrology`; web → relative; `NEXT_PUBLIC_ASTROLOGY_API_URL` override; SSR → canonical. |
| `app/api/humandesign/astrology/route.ts` | **NEW** — Vercel proxy → configured Swiss Ephemeris service (`ASTROLOGY_SERVICE_URL` / `NEXT_PUBLIC_ASTROLOGY_API_URL`, default `bhumi-human-design-api.vercel.app/calculate-astrology`). CORS + Firebase-auth + rate limit + timeout + PII-minimised body. Fails closed with an explicit `calculationStatus` (`service_unavailable` / `timeout` / `connection_error`). |
| `lib/astrology/calculateNatalBasics.ts` | Removed `calculateApproximateChironLongitude` (linear model) and `buildApproximatePlacidusHouses` (Equal-house-as-Placidus). Chiron now from `chironLongitudeAt`. Local engine emits genuine **Whole Sign** houses only + `houseSystem: "whole-sign"` + `ascendantLongitude` / `midheavenLongitude`; never synthesises `placidusHouses`. New `chironAccuracy: "ephemeris" \| "unavailable"` contract — never `"ephemeris"` from an approximation. `calculateNatalBasicsAsync` now routes via `getAstrologyApiUrl()` with a Firebase auth header + bounded timeout, and on ANY remote failure keeps the local chart unchanged (accurate table Chiron + genuine Whole Sign) — Placidus is added only when the service returns ≥12 genuine cusps (`houseSystem: "placidus"`). |
| `lib/engines/generateBlueprint.ts`, `lib/engines/blueprintRecoveryEngine.ts` | Persist `natalChart.chiron` / `planets.Chiron` ONLY when `chironAccuracy === "ephemeris"`; persist `placidusHouses` / `houses` ONLY when `houseSystem === "placidus"`. Otherwise the field is `undefined` → `sanitizeForFirestore` drops it → `setDoc({merge:true})` preserves the previously-stored verified value. Carry `chironAccuracy` / `houseSystem` / `ascendantLongitude` / `midheavenLongitude`. |
| `lib/repositories/blueprintRepository.ts` | `normalizeBlueprint` carries `chironAccuracy` / `houseSystem` / `ascendantLongitude` / `midheavenLongitude` through from stored data; a fail-closed regeneration can never blank or downgrade a stored `chiron`. |
| `lib/astrology/presentation.ts` | `houseOf` / `houseEmphasis` fall back to the genuine `wholeSignHouse` when no Placidus cusps exist (system labelled on the page) — no fake Placidus emphasis. |
| `lib/dailyGuidance/unifiedBlueprintSynthesis.ts` | `placidusHouses` and `wholeSignHouses` synthesis signals each read only their own explicitly-typed field — neither is back-filled from a generic `houses` object (kills the Whole-Sign-as-Placidus mislabel). |
| `components/blueprint/NatalWheelLite.tsx` | Reads `astrology.ascendantLongitude` / `midheavenLongitude` and falls back to `wholeSignHouses` cusps so the wheel renders without synthesised Placidus. |
| `app/blueprint/natal-chart/page.tsx` | "Prominent Life Areas" shows the declared house system ("Placidus" vs "Whole Sign"). A missing Chiron already renders "Not available" honestly. |
| `lib/types/blueprint.ts` | `NatalChartBlueprint`: `chironAccuracy?`, `houseSystem?`, `ascendantLongitude?`, `midheavenLongitude?`. |
| `.env.local.example` | Documented `ASTROLOGY_SERVICE_URL` (server) and `NEXT_PUBLIC_ASTROLOGY_API_URL` (client) — both optional; Chiron is accurate without either. |
| `scripts/generate-chiron-ephemeris.py` | **NEW** — reproducible table + reference-fixture generator + comparison report. |
| `tests/fixtures/build108-cdi01-chiron-reference.json` | **NEW** — 10 authoritative fixtures (Swiss Ephemeris), multiple birth years (1937–2024) and timezones (−08…+13, DST and non-DST), each with expected longitude / sign / degree / Placidus house / Whole Sign house / ascendant / MC and the exact OLD-linear value. |
| `tests/unit/build108-cdi01-chiron-natal-accuracy.test.ts` | **NEW** — 13 deterministic checks (registered in `tests/release-manifest.mjs`). |
| `tests/unit/build108-sprint03-blueprints.test.ts` | `calculateNatalBasics.ts` moved from the Sprint-3 "frozen engines" list to a CDI-108-01 intent guard (no linear Chiron, no Equal-house Placidus, ephemeris table in use). 174 assertions PASS. |

### Deterministic fixture comparison (EXPECTED = Swiss Ephemeris · OLD = removed linear model · NEW = committed table)

| FIXTURE | BIRTH (local) | CHIRON_LONGITUDE | CHIRON_SIGN | CHIRON_DEGREE | CHIRON_HOUSE (Placidus / Whole Sign) | HOUSE_SYSTEM | OLD → sign / err / MATCH | NEW → sign / err / MATCH |
|---|---|---|---|---|---|---|---|---|
| hindenburg_era_gemini | 1937-05-20 07:25 America/New_York | 81.9823° | Gemini | 21.982° | 12 / 1 | Placidus | Virgo · 77.05° · **NO** | Gemini · 0.0002° · YES |
| post_war_aquarius | 1955-03-01 23:45 Asia/Jakarta | 302.6697° | Aquarius | 2.670° | 3 / 3 | Placidus | Capricorn · 15.20° · **NO** | Aquarius · 0.0004° · YES |
| hd_snapshot_pisces | 1968-02-21 09:00 Europe/Istanbul | 357.6682° | Pisces | 27.668° | 12 / 12 | Placidus | Aries · 23.53° · **NO** | Pisces · 0.0003° · YES |
| chiron_taurus_retro | 1977-11-15 04:30 Australia/Sydney | 32.5480° | Taurus | 2.548° | 7 / 8 | Placidus | Cancer · 58.95° · **NO** | Taurus · 0.0002° · YES |
| widhi_case_gemini | 1985-05-03 23:45 Asia/Jakarta | 66.7787° | Gemini | 6.779° | 4 / 5 | Placidus | Leo · 78.65° · **NO** | Gemini · 0.0002° · YES |
| cancer_fast_arc | 1990-06-15 14:30 Asia/Kolkata | 106.0479° | Cancer | 16.048° | 9 / 10 | Placidus | Libra · 76.34° · **NO** | Cancer · 0.0002° · YES |
| millennium_sagittarius | 2001-09-11 08:46 America/Los_Angeles | 263.0519° | Sagittarius | 23.052° | 3 / 3 | Placidus | Sagittarius · 0.54° · YES | Sagittarius · 0.0001° · YES |
| chiron_pisces_station | 2013-07-04 12:00 Europe/London | 343.6849° | Pisces | 13.685° | 6 / 7 | Placidus | Pisces · 5.22° · YES | Pisces · 0.0004° · YES |
| recent_aries | 2024-01-01 00:01 Pacific/Auckland | 15.4603° | Aries | 15.460° | 7 / 8 | Placidus | Gemini · 49.23° · **NO** | Aries · 0.0004° · YES |
| southern_no_dst | 1995-08-09 18:20 Asia/Jakarta | 175.7894° | Virgo | 25.789° | 7 / 7 | Placidus | Scorpio · 43.80° · **NO** | Virgo · 0.0001° · YES |

- **OLD linear model:** 8/10 fixtures in the WRONG sign; 9/10 exceed 5° longitude error; worst **78.65°** (≈ 2.6 signs).
- **NEW table model:** 10/10 correct sign; max longitude error **0.00042°**.
- **House systems:** 6/10 fixtures have Placidus house ≠ Whole Sign house — the two systems are genuinely distinct (the removed Equal-house-as-`placidusHouses` mislabel materially mattered).

### Exit report (mandated keys)

```text
CHIRON_EPHEMERIS               = Swiss Ephemeris (pyswisseph 2.10.03 + seas_18.se1), tabulated
                                 1900–2100 at 7-day steps, Catmull-Rom interpolation
                                 (validated max error 0.00083°). Client-side, offline, static-export
                                 safe — no service dependency for Chiron. A remote Swiss Ephemeris
                                 service adds genuine Placidus cusps + a second-source Chiron.
CHIRON_SIGN_ACCURACY          = 10/10 fixtures correct (was 2/10 with the linear model).
CHIRON_DEGREE_ACCURACY        = < 0.001° vs Swiss Ephemeris via the table; end-to-end via
                                 calculateNatalBasics, < 0.5° for 9/10 fixtures (residual is
                                 timezone-offset resolution, not the ephemeris — tracked as CDI-C3).
PLACIDUS_ACCURACY            = Local engine NO LONGER synthesises Placidus. It emits genuine Whole
                                 Sign houses labelled houseSystem:"whole-sign". Genuine Placidus
                                 (swe.houses_ex P) is applied only when the ephemeris service
                                 returns >=12 real cusps -> houseSystem:"placidus". Whole Sign and
                                 Placidus are kept in separate typed fields end to end.
PRODUCTION_CALCULATION_ROUTE  = Chiron: client-side Swiss Ephemeris table (always).
                                 Full chart incl. Placidus: getAstrologyApiUrl() ->
                                 {WEB_APP_URL}/api/humandesign/astrology (ENL APK) /
                                 /api/humandesign/astrology (web) -> app/api/humandesign/astrology
                                 route -> ASTROLOGY_SERVICE_URL (default
                                 bhumi-human-design-api.vercel.app/calculate-astrology).
                                 The hardcoded http://localhost:8000 is removed.
APPROXIMATION_FALLBACK_REMOVED_OR_GATED = REMOVED. calculateApproximateChironLongitude deleted;
                                 buildApproximatePlacidusHouses deleted; Chiron dropped from the
                                 local astronomy-engine planet list. Out-of-table dates fail closed
                                 (chironAccuracy:"unavailable", no chiron written).
EXISTING_DATA_PRESERVED       = YES. generateBlueprint / blueprintRecoveryEngine write chiron only
                                 when chironAccuracy==="ephemeris" and placidusHouses only when
                                 houseSystem==="placidus"; otherwise the field is undefined ->
                                 sanitizeForFirestore drops it -> setDoc({merge:true}) keeps the
                                 stored value. normalizeBlueprint never blanks a stored chiron.
                                 No production Firestore write performed.
TEST_FIXTURES                 = tests/fixtures/build108-cdi01-chiron-reference.json (10 fixtures,
                                 birth years 1937–2024, timezones −08…+13 incl. DST) +
                                 tests/unit/build108-cdi01-chiron-natal-accuracy.test.ts (13 checks,
                                 EXIT 0) + regeneration script scripts/generate-chiron-ephemeris.py.
CDI_C1_C2_C3_STATUS          = CDI-C1 DONE (real ephemeris in production for Chiron; routing/config
                                 to the canonical service built + honest Placidus/Whole-Sign
                                 separation; ephemeris SERVICE still needs to be deployed with
                                 /calculate-astrology for genuine Placidus — Founder/ops step,
                                 Chiron unaffected).
                                 CDI-C2 DONE (fail-closed: fallback-sourced natal data carries
                                 chironAccuracy / houseSystem; the natal page shows the declared
                                 system; a stored Chiron is preserved, never downgraded).
                                 CDI-C3 OPEN (carry a real IANA timezone from setup so
                                 calculateNatalBasics never approximates +HH:00 from longitude —
                                 residual sub-degree drift only; tracked in TIMEZONE_AUDIT.md).
RELEASE_BLOCKERS_REMAINING    = Deploy services/humandesign-api (or an equivalent) with
                                 /calculate-astrology and set ASTROLOGY_SERVICE_URL for genuine
                                 Placidus houses (Chiron already accurate without it).
                                 CDI-C3 (setup timezone resolution).
                                 CDI-108-02 (Human Design advanced variables) — NOT STARTED.
                                 CDI-108-03 (Schumann source) — NOT STARTED.
                                 Post-fix, Founder-authorised, non-destructive natal backfill for
                                 legacy users (CDI-D1) — NOT STARTED, separately gated.
```

---

## C.9 CDI-108-01A — Timezone Canonicalization — EXECUTION RESULT (2026-09-06, Founder-authorised)

**Goal:** remove longitude-derived / approximate timezone offsets from canonical natal
calculation. **Change class:** engines + setup/settings UI + recovery engine + one new deterministic
resolver + one dependency + one test. NO production Firestore read/write, NO backend deploy, NO
version bump / build / sign / upload. `tsc --noEmit` EXIT 0; Build 107 guards intact (HD
convergence 19/19, production-surface guard 131/131); non-emulator release suite PASS=22 FAIL=0.

### What was wrong (audit chain: setup city → coordinates → IANA → profile → blueprint input → natal calc → API payload)

| Stage | Pre-fix defect |
|---|---|
| `app/setup/page.tsx::resolveFinalTimezone` | `Math.round(city.longitude / 15)` → `"+HH:00"` offset; then `new Date().getTimezoneOffset()` (the CURRENT date's offset — DST-wrong for any historical birth); then hardcoded `"+07:00"`. |
| `app/settings/page.tsx` (regenerate) | same `Math.round(nextLongitude / 15)` + `"+07:00"` default. |
| `lib/astrology/calculateNatalBasics.ts::resolveNatalLocation` | `Math.round(input.longitude / 15)` when timezone missing. `CITY_FALLBACKS` were fixed offsets (`"+00:00"` for London, `"-05:00"` for New York) — DST-wrong half the year. |
| `lib/astrology/calculateNatalBasics.ts::toUtcDate` | for an IANA name, probed the offset with `Intl` on `Date.UTC(y,m,d,h,mi)` treating local time as UTC — can be an hour off within ~1 h of a DST transition. |
| `lib/engines/blueprintRecoveryEngine.ts` | `const timezone = input.timezone || "UTC"` for the natal chart. |

### Fix

| File | Change |
|---|---|
| `lib/astrology/resolveIanaTimezone.ts` | **NEW.** `resolveIanaTimezone(lat, lon)` — deterministic offline polygon lookup (`tz-lookup`, CC0, pure JS, ~152 KB, no I/O) → IANA name or `null`. `isUsableStoredTimezone()` (real IANA or `+HH:MM`; bare `UTC`/`GMT`/`""`/`default` = absent). `canonicalizeNatalTimezone({storedTimezone, latitude, longitude})` → keep a valid stored value (never overwrite) → else deterministic IANA from coordinates → else `null` (fail closed). |
| `package.json` / `package-lock.json` | `tz-lookup@6.1.25` (exact pin, CC0, zero transitive deps). `types/tz-lookup.d.ts` shim. |
| `lib/astrology/calculateNatalBasics.ts` | `resolveNatalLocation` + `calculateNatalBasics` + `calculateNatalBasicsAsync` all use `canonicalizeNatalTimezone` — no `longitude / 15`. `CITY_FALLBACKS` upgraded to IANA names (`Asia/Jakarta`, `Asia/Makassar` for Bali, `America/New_York`, `Europe/London`, …). `toUtcDate` uses **luxon** `DateTime.fromObject({...},{zone})` for IANA zones → DST-correct wall-clock → UTC (incl. the ambiguous / skipped hour); the fixed-offset fast path and an `Intl` last-resort are kept. |
| `app/setup/page.tsx` · `app/settings/page.tsx` | `resolveFinalTimezone` / the inline block → `canonicalizeNatalTimezone`. No `longitude/15`, no browser guess, no `+07:00` default. Setup blocks completion if the timezone cannot be resolved. Settings preserves a valid stored value unless the city changed. |
| `lib/engines/blueprintRecoveryEngine.ts` | recovery resolves a missing timezone through `canonicalizeNatalTimezone` (deterministic IANA from stored coordinates); if unresolved the **natal** input is left undefined (chart stays pending — no fabricated offset); BaZi/Vedic keep a benign `"UTC"`. |
| `lib/humandesign/types.ts` | `timezoneSource` union += `"iana-geo"`, `"stored"`, `"unresolved"` (historical `"longitude-approx"`/`"browser-guess"` retained for old records). Profile schema unchanged (`timezone?: string \| null`) — **backward-compatible**. |
| `scripts/generate-chiron-ephemeris.py` | fixture timezones are now derived by `timezonefinder` from the coordinates (same deterministic-polygon approach as `tz-lookup`) — a fixture can no longer carry a hand-assigned wrong zone. This found and fixed a real error: `southern_no_dst` (Denpasar/Bali) was hand-labelled `Asia/Jakarta` but is `Asia/Makassar` (WITA). Added `kathmandu_fractional` (+5:45) and `indiana_border_zone` fixtures → **12 fixtures**. |
| `tests/unit/build108-cdi01a-timezone-canonicalization.test.ts` | **NEW** — 10 deterministic checks (registered in `tests/release-manifest.mjs`). |
| `tests/unit/build108-cdi01-chiron-natal-accuracy.test.ts` | end-to-end Chiron degree tolerance tightened from `< 2.0°` / "most fixtures" to `< 0.01°` for **all** fixtures. |

### Re-run of all Chiron fixtures — end-to-end longitude residual AFTER the timezone fix

| FIXTURE | Resolved IANA (tz-lookup == timezonefinder) | end-to-end Chiron residual vs Swiss Ephemeris |
|---|---|---|
| hindenburg_era_gemini | America/New_York | 0.000130° |
| post_war_aquarius | Asia/Jakarta | 0.000340° |
| hd_snapshot_pisces | Europe/Istanbul | 0.000290° |
| chiron_taurus_retro | Australia/Sydney | 0.000180° |
| widhi_case_gemini | Asia/Jakarta | 0.000130° |
| cancer_fast_arc | Asia/Kolkata | 0.000120° |
| millennium_sagittarius | America/Los_Angeles | 0.000070° |
| chiron_pisces_station | Europe/London | 0.000420° |
| recent_aries | Pacific/Auckland | 0.000360° |
| southern_no_dst | **Asia/Makassar** (was wrongly `Asia/Jakarta`) | 0.000080° |
| kathmandu_fractional | Asia/Kathmandu (+5:45) | 0.000160° |
| indiana_border_zone | America/Indiana/Indianapolis | 0.000140° |

```text
CHIRON_END_TO_END_MAX_ERROR = 0.000420°   (target: < 0.01° — MET, by ~24×)
CHIRON_FIXTURES_PASS        = 12 / 12  (sign + < 0.01° longitude, end to end through calculateNatalBasics)
```

### Exit report (mandated keys)

```text
CDI_C3_STATUS                 = DONE. Setup and Settings now resolve a real IANA zone from the
                                selected city's coordinates (tz-lookup polygon), stored on the
                                profile as an IANA name. `resolveNatalLocation` / recovery no longer
                                approximate `+HH:00` from longitude. (The city geocoder — Photon —
                                still returns no timezone itself; the deterministic polygon lookup
                                supplies it.)
IANA_TIMEZONE_PERSISTENCE     = New profiles persist `timezone` as an IANA name (e.g. "Asia/Jakarta")
                                + `timezoneSource:"iana-geo"`. Schema unchanged (`string|null`) —
                                backward-compatible. A valid stored IANA / `+HH:MM` value is never
                                overwritten (Settings + `canonicalizeNatalTimezone`).
DST_HANDLING                 = `toUtcDate` converts IANA wall-clock -> UTC with luxon, which
                                resolves the offset for the exact birth instant incl. DST
                                changeovers. Test 4 verifies 03:30 America/New_York == 07:30 UTC in
                                July (EDT) vs 08:30 UTC in January (EST).
CHIRON_END_TO_END_MAX_ERROR  = 0.000420°  (was up to ~0.5° in CDI-108-01 due to Node-Intl vs
                                zoneinfo offset differences; the luxon + IANA path collapses it).
CHIRON_FIXTURES_PASS         = 12 / 12
HD_LIVE_CONTRACT_VERIFIED     = YES — see §B.8.
HD_ADVANCED_FIELDS_LIVE       = digestion/environment/motivation = arrow def_type (present);
                                cognition = 6-fold (present); perspective = absent top-level but
                                present/derivable in variables.bottom_right; short_code present;
                                per-planet Color/Tone/Base absent (debug ignored).
HD_ADAPTER_GAPS               = perspective read from an absent key instead of
                                `data.variables.bottom_right`; no gap for the present fields.
HD_PERSISTENCE_GAPS           = no explicit `perspective:` coercion in `normalizeBlueprint`
                                (spread-only); digestion/cognition/motivation/environment/variables
                                are explicitly preserved (no drop).
HD_UI_MAPPING_GAPS            = CONFIRMED — `HumanDesignBodygraphLite.tsx:203` reads
                                `variables.variable || variables.value` instead of
                                `variables.short_code` / the 4 arrows. The Advanced Variables grid
                                keys (`humanDesign.digestion` etc.) are correct.
HD_RECOVERY_GAPS              = `mass-recover-hd.ts` writes `centers` as a raw array (corrupt),
                                omits diagnostic/raw_*_gates/activations + openCenters, writes
                                perspective=null. Background recalc (blueprintRecoveryEngine) is
                                only missing perspective (same adapter gap).
HD_BACKFILL_REQUIREMENT_REFINED =
   Variables Arrows display -> UI key fix only, no backfill.
   perspective              -> adapter derive + normalizer coercion + local recompute from stored
                               variables.bottom_right (no re-fetch).
   digestion/environment/motivation -> local migration from stored variables.<arrow>.def_type
                               where `variables` exists; re-fetch for older charts without it.
   cognition                -> re-fetch only (not locally derivable).
   Color/Tone/Base          -> needs a diagnostic-emitting engine first; no backfill until then.
   mass-recover-hd.ts shape -> fix the script before any future recovery run.
GATE_108_CDI                 = IN_PROGRESS. CDI-108-01 DONE. CDI-108-01A DONE. CDI-108-02 refined
                               read-only audit DONE (root cause proven field-by-field; implementation
                               NOT started). CDI-108-03 (Schumann) NOT started.
NEXT_SAFE_ACTION             = FOUNDER_REVIEW_OF_CDI_108_01A_AND_HD_REFINED_AUDIT
```

---

## D. CROSS-USER / LEGACY DATA

| Subsystem | New users | `mass-recover-hd` cohort (Build 106/107) | Build 103/104/105 & pre-V2 legacy | Backfill needed? |
|---|---|---|---|---|
| **Schumann** | "Data belum tersedia" | same | same | **No** — cohort-independent, no per-user stored data. Fix = a working source; the localStorage 24 h accumulation then resumes for everyone. |
| **Human Design** (REFINED §B.8) | fresh onboard: digestion/environment/motivation/cognition stored + shown; `perspective` null (adapter gap); Variables-Arrows shown "Not stored" (UI key); Color/Tone/Base "Not stored" (engine) | CANONICAL type; digestion/etc present IF `variables` persisted; **`centers` shape degraded; activations/openCenters omitted** | pre-engine-field charts: digestion/etc `null` — "Not stored" | **Per field:** Variables-Arrows = UI fix only (no backfill). `perspective` = adapter derive + local recompute from stored `variables.bottom_right`. digestion/environment/motivation = local migration from `variables.<arrow>.def_type`, else re-fetch. cognition = re-fetch only. Color/Tone/Base = blocked on CDI-B6. `mass-recover-hd.ts` shape = fix before any re-run. All Founder-authorised, non-destructive, `isCanonicalHumanDesign`-guarded. |
| **Chiron** | **FIXED (CDI-108-01 + 01A)** — accurate table Chiron; canonical IANA timezone | was: linear model + longitude/15 TZ | `V3_JOKER`-era users: `planets.Chiron` from the linear model + longitude-approx TZ; pre-expansion: `sunSign/moonSign/risingSign` only | **Yes (CDI-D1, deferred)** — per-user recompute of `natalChart.chiron` + `planets.Chiron` (table) + a resolved IANA `timezone`, and true Placidus cusps once the ephemeris service is deployed; non-destructive; Founder-authorised production write. |

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

HUMAN_DESIGN_ADVANCED_VARIABLES_STATUS = BROKEN — root cause REFINED & PROVEN field-by-field
                                       against the LIVE deployed contract (§B.8, supersedes §B.2–§B.3):
                                       • digestion / environment / motivation / cognition ARE
                                         returned by the live engine and ARE mapped / preserved /
                                         persisted / read with correct UI keys — "Not stored" for
                                         these = LEGACY blueprints (pre-dating the engine field);
                                         digestion/environment/motivation are locally migratable
                                         from stored `variables.<arrow>.def_type`, cognition needs
                                         a re-fetch.
                                       • perspective — ADAPTER GAP: reads an absent top-level key
                                         instead of deriving from `variables.bottom_right` (which
                                         is returned). Affects new users too. Locally derivable.
                                       • Variables Arrows — CONFIRMED UI KEY MISMATCH: bodygraph
                                         reads `variables.variable/value` instead of
                                         `variables.short_code`. Data IS stored. UI-only fix.
                                       • per-planet Color / Tone / Base — genuine DATA-AVAILABILITY
                                         limitation: the deployed engine never emits a diagnostic
                                         block and ignores `debug`. Needs a different/self-hosted
                                         engine (CDI-C1 class).
                                       • `mass-recover-hd.ts` still corrupts `centers` (raw array)
                                         and drops activations / openCenters.
                                       • HD variable/style narratives Indonesian-only (CDI-B4);
                                         "Story for this section is being prepared." on CANONICAL
                                         types (CDI-B5).
                                       HD CORE identity remains HEALTHY.

CHIRON_STATUS                        = FIXED (CDI-108-01, 2026-09-06) — Chiron now from a committed
                                       Swiss Ephemeris table (10/10 fixtures correct sign, < 0.001°
                                       vs Swiss Ephemeris); linear model + Equal-house-as-Placidus
                                       removed; Whole Sign / Placidus kept separate and labelled;
                                       fail-closed persistence preserves stored data.
                                       CDI-108-01A (2026-09-06) — timezone canonicalization DONE:
                                       `longitude / 15` + browser-guess + `+07:00` default removed;
                                       deterministic offline lat/lon → IANA (tz-lookup); luxon
                                       DST-correct wall-clock → UTC; valid stored zone never
                                       overwritten; fail closed to pending when unresolved.
                                       CHIRON_END_TO_END_MAX_ERROR = 0.000420° (12/12 fixtures).
                                       Residual: deploy the ephemeris service for genuine Placidus
                                       (CDI-C1 ops step); CDI-D1 legacy natal backfill (Founder-gated).

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
  2. Human Design advanced variables — REFINED against the LIVE deployed contract (§B.8, supersedes
     the repo-`main.py` analysis in §B.2–§B.3). The deployed engine DOES return
     digestion/environment/motivation/cognition; the adapter/normalizer/persistence handle them.
     Confirmed root causes: (a) `perspective` — adapter reads an absent top-level key instead of
     `variables.bottom_right` (derivable); (b) Variables Arrows — UI reads `variables.variable/value`
     instead of `variables.short_code` (stored); (c) per-planet Color/Tone/Base — the deployed
     engine never emits them and ignores `debug` (needs another engine); (d) "Not stored" for the
     present fields on production users = LEGACY blueprints (re-fetch or local migration from
     stored `variables`); (e) `mass-recover-hd.ts` still corrupts `centers` + drops activations;
     (f) HD variable/style narratives Indonesian-only; (g) "Story for this section is being
     prepared." on CANONICAL types. CONFIRMED. Implementation NOT started.
  3. Chiron — Swiss Ephemeris /calculate-astrology unreachable in production (no NEXT_PUBLIC/proxy;
     http://localhost:8000 blocked) -> local fallback always used -> Chiron from a linear ephemeris
     (astronomy-engine has no Chiron) -> sign/degree/house wrong; Equal-house cusps mislabelled
     `placidusHouses`; plus `longitude / 15` timezone inference. CONFIRMED — **RESOLVED by
     CDI-108-01 (§C.8) + CDI-108-01A (§C.9)**: committed Swiss Ephemeris Chiron table; linear model
     + fake Placidus removed; `getAstrologyApiUrl()` + `/api/humandesign/astrology` proxy for the
     canonical service; deterministic IANA timezone (tz-lookup) + luxon DST-correct conversion;
     fail-closed, non-destructive persistence; end-to-end Chiron residual 0.000420° (12/12 fixtures).

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
  CDI-B1  perspective — adapter: derive from `data.variables.bottom_right` (name/value/def_type)
          instead of the absent `data.perspective`. NOT an engine change.
  CDI-B2  HumanDesignBodygraphLite.tsx — read `variables.short_code` (and/or render the 4
          `top_*/bottom_*` arrows) instead of `variables.variable || variables.value`. UI-only.
  CDI-B3  normalizeBlueprint — add an explicit `perspective:` coercion. Fix mass-recover-hd.ts
          `canonicalChart` shape: `centers` as `{head:bool,…}`, add `openCenters`, keep
          diagnostic/activations if present. (Script not run without Founder authorisation.)
  CDI-B4  Localise HD variable/style narratives (variableIntelligence.ts, styleEngine.ts, the
          channel/cross/definition intelligence files, consumers incl. localDailyGuidanceFallback);
          make presentation.ts English `variables.*` consume the real values.
  CDI-B5  Trace + fix "Story for this section is being prepared." on CANONICAL types
          (executeHumanMeaningRuntime {ok:false} gating in app/blueprint/human-design/page.tsx).
  CDI-B6  Per-planet Color / Tone / Base — obtain a diagnostic-emitting engine (self-host
          services/humandesign-api with its debug path, or a vetted TS HD ephemeris). Same class
          as CDI-C1. Until then "Color / Tone / Base = Not stored" is a truthful limitation.
  CDI-C1  DONE (Chiron table) + deploy the Swiss Ephemeris service for genuine Placidus houses
          (ops step remaining).
  CDI-C2  DONE — fail-closed provenance (`chironAccuracy` / `houseSystem`) + declared-system label;
          stored Chiron preserved, never downgraded.
  CDI-C3  DONE (CDI-108-01A) — deterministic IANA timezone from city coordinates through setup /
          settings / recovery; luxon DST-correct conversion; no `longitude / 15`.
  CDI-D1  Post-fix backfill for HD advanced variables (per-field: UI-only / local-migration /
          re-fetch — see §B.8.3) + legacy Chiron, across Build 103–107 cohorts
          (Founder-authorised, non-destructive, convergence-safe). NOT STARTED.

NEXT_SAFE_ACTION                    = FOUNDER_REVIEW_OF_CDI_108_01A_AND_HD_REFINED_AUDIT
```

---

## F. Required Final Report

### F.1 Audit checkpoint (commit `00e500f`, docs-only, Founder-approved)

```text
AUTHORIZED_BRANCH   = recovery/build106-product-continuity
AUDIT_HEAD          = 9fc364abd4d4931ad12f81070ac401434b86a11a
FILES               = + BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md (new)
                      ~ BUILD_108_ENL_{MASTER_SOT,SCOPE_MATRIX,HANDOFF,SPRINT_PLAN}.md
PRODUCTION_READS/WRITES/FIRESTORE_MUTATIONS = 0 / 0 / 0
```

### F.2 CDI-108-01 (Chiron / natal accuracy) — commit `dccaf08` — see §C.8 for the full result

```text
FILES_CHANGED       = 20
  new:  lib/astrology/data/chironEphemeris.json, lib/astrology/chironEphemeris.ts,
        lib/config/astrologyApiUrl.ts, app/api/humandesign/astrology/route.ts,
        scripts/generate-chiron-ephemeris.py,
        tests/fixtures/build108-cdi01-chiron-reference.json,
        tests/unit/build108-cdi01-chiron-natal-accuracy.test.ts
  mod:  lib/astrology/calculateNatalBasics.ts, lib/astrology/presentation.ts,
        lib/dailyGuidance/unifiedBlueprintSynthesis.ts, lib/engines/generateBlueprint.ts,
        lib/engines/blueprintRecoveryEngine.ts, lib/repositories/blueprintRepository.ts,
        lib/types/blueprint.ts, components/blueprint/NatalWheelLite.tsx,
        app/blueprint/natal-chart/page.tsx, .env.local.example,
        tests/release-manifest.mjs, tests/unit/build108-sprint03-blueprints.test.ts,
        BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md (+ SOT / SCOPE_MATRIX / HANDOFF / SPRINT_PLAN)
TESTS_RUN / EXIT CODES =
  npx tsc --noEmit                                              EXIT 0
  tests/unit/build108-cdi01-chiron-natal-accuracy.test.ts       EXIT 0  (13 checks)
  tests/unit/build108-sprint03-blueprints.test.ts               EXIT 0  (174 assertions)
  tests/unit/build107-hd-existing-user-convergence.test.ts      EXIT 0  (19/19)
  tests/unit/build107-production-surface-guard.test.ts          EXIT 0  (131/131)
  tests/unit/build108-sprint0{1,2,4}-*.test.ts                  EXIT 0  (168 / 258 / 129)
  node scripts/run-release-tests.mjs --skip-emulator            EXIT 0  (PASS=21 FAIL=0 SKIPPED=9 emulator)
PRODUCTION_READS / WRITES / FIRESTORE_MUTATIONS = 0 / 0 / 0
EXTERNAL_PROBES    = read-only GET schumannresonancelive.com/api/data.php (404);
                    GET bhumi-human-design-api.vercel.app/openapi.json + /health;
                    one POST /calculate (HD) with SYNTHETIC birth data (no PII) to confirm the
                    deployed contract. No astrology endpoint is deployed there (GET
                    /calculate-astrology -> 404) — recorded for CDI-C1 / CDI-108-02.
COMMITS_CREATED   = 00e500f (docs checkpoint) + dccaf08 (CDI-108-01 fix)
TRACKED_WORKTREE_STATE   = all listed files committed
UNTRACKED_FILES_PRESERVED = scripts/.build106-production-admin-provision.mjs (untouched)
KNOWN_LIMITATIONS =
  - Genuine Placidus houses require the Swiss Ephemeris service to be DEPLOYED with
    /calculate-astrology + ASTROLOGY_SERVICE_URL set (Founder/ops step). Until then the app
    honestly uses + labels Whole Sign houses. Chiron is accurate regardless.
  - End-to-end Chiron degree has < 0.5° residual drift for some fixtures from timezone-offset
    resolution differences (Node Intl vs the reference's zoneinfo), not the ephemeris — CDI-C3.
  - The 66.7 KB ephemeris JSON adds ~15 KB gzip to bundles importing calculateNatalBasics.
  - Discovery during the probe: the DEPLOYED HD engine returns top-level
    digestion/environment/motivation/cognition (not `perspective`, no diagnostic/color/tone/base)
    — it differs from repo `services/humandesign-api/main.py`. This refines CDI-108-02 scope; it
    does NOT change the "Not stored" user symptom (adapter/persistence/UI-key side). Recorded for
    the HD phase; not acted on here.
EXACT_NEXT_RECOVERY_TASK = Founder review of CDI-108-01; then Founder sequencing of CDI-108-01A +
    CDI-108-02 (see F.3) and CDI-108-03 (Schumann source). Sprint 5 stays BLOCKED.
    CDI-D1 (legacy natal backfill) remains separately gated.
MARKERS           = BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
                    GATE_108_CDI = IN_PROGRESS  (CDI-108-01 DONE)
```

### F.3 CDI-108-01A (timezone canonicalization) + CDI-108-02 refined READ-ONLY audit — commit `d102924`

```text
CDI-108-01A — implemented. CDI-108-02 — READ-ONLY refinement only (no implementation).

FILES_CHANGED       = 15
  new:  lib/astrology/resolveIanaTimezone.ts, types/tz-lookup.d.ts,
        tests/unit/build108-cdi01a-timezone-canonicalization.test.ts
  mod:  lib/astrology/calculateNatalBasics.ts, app/setup/page.tsx, app/settings/page.tsx,
        lib/engines/blueprintRecoveryEngine.ts, lib/humandesign/types.ts,
        package.json, package-lock.json, scripts/generate-chiron-ephemeris.py,
        lib/astrology/data/chironEphemeris.json (regenerated — unchanged bytes for the table;
        tests/fixtures/build108-cdi01-chiron-reference.json (12 fixtures now, timezonefinder-derived),
        tests/unit/build108-cdi01-chiron-natal-accuracy.test.ts (tolerance tightened to < 0.01°),
        tests/release-manifest.mjs,
        BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md (+ SOT / SCOPE_MATRIX / HANDOFF / SPRINT_PLAN)
DEPENDENCY_ADDED    = tz-lookup@6.1.25 (CC0-1.0, ~152 KB, pure JS, zero transitive deps) — the
                     deterministic offline lat/lon → IANA polygon source the Founder required.
TESTS_RUN / EXIT CODES =
  npx tsc --noEmit                                                 EXIT 0
  tests/unit/build108-cdi01a-timezone-canonicalization.test.ts     EXIT 0  (10 checks; CHIRON_END_TO_END_MAX_ERROR = 0.000420°)
  tests/unit/build108-cdi01-chiron-natal-accuracy.test.ts          EXIT 0  (13 checks, < 0.01° tolerance)
  tests/unit/build108-sprint03-blueprints.test.ts                  EXIT 0  (174 assertions)
  tests/unit/build108-sprint01-shell.test.ts                       EXIT 0  (168 assertions)
  tests/unit/build107-hd-existing-user-convergence.test.ts         EXIT 0  (19/19)
  tests/unit/build107-production-surface-guard.test.ts             EXIT 0  (131/131)
  node scripts/run-release-tests.mjs --skip-emulator               EXIT 0  (PASS=22 FAIL=0 SKIPPED=9 emulator)
PRODUCTION_READS / WRITES / FIRESTORE_MUTATIONS = 0 / 0 / 0
BACKEND_DEPLOY / VERSION_BUMP / BUILD / SIGN / UPLOAD = none
EXTERNAL_PROBES    = read-only synthetic POST /calculate (HD, no PII) 2026-09-06 — response shape
                    recorded in §B.8.1; `debug:true` verified ignored. GET /openapi.json + /health.
COMMITS_CREATED   = 00e500f (docs checkpoint) + dccaf08 (CDI-108-01) + 174e2c3 (SHA fill)
                    + d102924 (CDI-108-01A + refined HD audit)
KNOWN_LIMITATIONS =
  - tz-lookup adds ~152 KB unpacked (~55 KB gzip) to bundles importing calculateNatalBasics.
  - The city geocoder (Photon) returns no timezone; the polygon lookup supplies it deterministically.
  - Per-planet HD Color/Tone/Base cannot be obtained from the deployed engine (CDI-B6).
  - CDI-108-02 is a READ-ONLY refinement — nothing implemented; the Founder decides the per-field
    fix + backfill path (§B.8.3).
EXACT_NEXT_RECOVERY_TASK = Founder review of CDI-108-01A and the §B.8 refined HD audit; then Founder
    sequencing of CDI-108-02 implementation (per-field: UI fix / adapter derive / migration /
    re-fetch) and CDI-108-03 (Schumann). Sprint 5 stays BLOCKED.
MARKERS           = BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
                    GATE_108_CDI = IN_PROGRESS  (CDI-108-01 DONE · CDI-108-01A DONE · CDI-108-02 audit DONE)
```

**STOP AND WAIT FOR FOUNDER REVIEW.**
