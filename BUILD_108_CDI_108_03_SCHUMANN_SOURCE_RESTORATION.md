# BUILD 108 ENL — CDI-108-03 · SCHUMANN SOURCE RESTORATION

**Read-only source research + architecture decision. No product code source-swap. No backend. No deploy.**

```text
TASK_ID                    = CDI-108-03-SCHUMANN-SOURCE-RESTORATION
PARENT_GATE                = GATE_108_CDI  (IN_PROGRESS)
CDI_108_03_SCHUMANN        = RESEARCH_COMPLETE — NO QUALIFYING SOURCE FOUND — FOUNDER DECISION REQUIRED
PRODUCTION_BASELINE        = BUILD 107 (versionCode 107, versionName 5.0.7, commit d2ecb5e)
WORKTREE                   = C:\tmp\bhumi-build106-recovery
BRANCH                     = recovery/build106-product-continuity
TASK_HEAD                  = 2be49ea104b7c652547736ff7b078bd23367393f
PROBE_DATE                 = 2026-09-07
PRODUCTION_READS           = 0
PRODUCTION_WRITES          = 0
FIRESTORE_MUTATIONS        = 0
EXTERNAL_PROBES            = read-only HTTPS GET/OPTIONS to public candidate endpoints only (no auth, no PII)
SCHUMANN_API_URL_CHANGED   = NO
PROXY_OR_BACKEND_BUILT     = NO
NEXT_SAFE_ACTION           = FOUNDER_DECISION_ON_CDI_108_03_OPTIONS  (then CONTINUE_CURRENT_GATE_108_CDI)
```

> **Scope discipline.** This document is research + an architecture recommendation. `SCHUMANN_API_URL`
> is unchanged. No proxy, ingestion job, or backend was created or deployed. No production Firestore
> read/write. The honest fail-closed UI and the `deriveEnvironmentBands` gate are preserved exactly.
> Every option below is a proposal for Founder review, not an action taken.

---

## 1. AUDIT — confirmed current state (re-verified against code + live probe)

### 1.1 What the code expects

| Element | Value | Source |
|---|---|---|
| Provider URL | `SCHUMANN_API_URL = "https://schumannresonancelive.com/api/data.php"` | [`lib/environment/schumann.ts:5`](lib/environment/schumann.ts) |
| Fetch | client-side `fetchWithTimeout(SCHUMANN_API_URL, 5000, { cache: "no-store" })` from a `"use client"` module — **no server proxy possible** (`next.config.ts` `output: 'export'` for the Capacitor build) | [`lib/environment/service.tsx:431-499`](lib/environment/service.tsx) |
| Expected JSON schema | `{ updated, status:{key,label}, intensity, amplitude, power, frequencies:[{id:"SR1".."SR5", value, nominal}] }`; every numeric field range-and-finite guarded; `hasObservation` requires ≥ 1 numeric SR / intensity / amplitude / power | [`normalizeSchumannResponse` `lib/environment/schumann.ts:24-59`](lib/environment/schumann.ts) |
| Freshness | `SCHUMANN_STALE_MS = 30 min`; `resolveSchumannUiState()` → `none \| snapshot \| partial \| full \| stale` | [`lib/environment/schumann.ts:9,131-155`](lib/environment/schumann.ts) |
| Cache | `localStorage["bhumi:env:schumann"]` rolling 24 h buffer (≤ 1000 obs), 90 s poll gate; empty on a fresh install | [`lib/environment/service.tsx:218-262`](lib/environment/service.tsx) |
| Provenance label | `provenance: "modelled-series"` (the provider's SR numbers were always MODELLED — V5 `D-#507`) | [`lib/environment/service.tsx:458`](lib/environment/service.tsx) |
| Fail-closed seed | `ctx.schumann` seeded as `{ frequencies: [], provenance: "modelled-series", stale: true, source: metaUnavailable("schumann_resonance_live") }` and only patched on a real observation | [`lib/environment/service.tsx:293-298`](lib/environment/service.tsx) |
| Render gate (dashboard card) | `frequencies.some(f => typeof f.valueHz === "number") ? "SR1 … Hz" : t.unavailable` | [`components/dashboard/EnvironmentContextCard.tsx:172`](components/dashboard/EnvironmentContextCard.tsx) |
| Render gate (`/dashboard/environment`) | full 3-layer block only when `context && schumann && hasSchumannObservation && spiritual`; else one "unavailable" item | [`app/dashboard/environment/page.tsx:113,329`](app/dashboard/environment/page.tsx) |
| Spiritual-band gate | `deriveEnvironmentBands()` defaults a missing Schumann band to `"quiet"`, but that band only feeds the spiritual block, which renders **only when `hasSchumannObservation` is true** | [`lib/environment/context_utils.tsx:35-48`](lib/environment/context_utils.tsx) |

### 1.2 Live probe result (2026-09-07)

```text
GET  https://schumannresonancelive.com/api/data.php            -> HTTP 404  (text/html 4405 B "Sinyal kaybı — 404")   [DEAD — unchanged since Build 106]
GET  https://schumannresonancelive.com/                        -> HTTP 200  (56 KB HTML)
GET  https://schumannresonancelive.com/realtime/data.php       -> HTTP 404
GET  https://schumannresonancelive.com/realtime/card.json      -> HTTP 404
GET  https://schumannresonancelive.com/realtime/card.php       -> HTTP 200  image/jpeg 219 KB   Access-Control-Allow-Origin: *
GET  https://schumannresonancelive.com/realtime/spectrogram.php-> HTTP 200  image/jpeg 260 KB   (no ACAO header)
```

The provider's embedded JSON-LD now declares its own product as an **image dataset**, not a numeric feed:

> `"@type":"Dataset"` … `"name":"Live Schumann resonance spectrogram (Tomsk station)"`,
> `"creator":{"@type":"Organization","name":"Tomsk State University — Space Observing System","url":"https://sosrff.tsu.ru/"}`,
> `"distribution":{"@type":"DataDownload","encodingFormat":"image/jpeg","contentUrl":"https://schumannresonancelive.com/realtime/spectro…"}`

**Confirmed:** `schumannresonancelive.com` has removed every JSON API path. It now re-hosts only the
**Tomsk State University** spectrogram **JPEG**. The numeric `{updated,status,intensity,amplitude,power,frequencies}`
contract the Bhumi parser was written against **no longer exists at this provider and has no
replacement path there.** This is consistent with the pre-existing residual **DS-E1 / R-PRD-44** —
the feed has been effectively non-functional since ≥ Build 106 and the "honest unavailable" state
was accepted as gate-pass for Builds 106 and 107. **CDI-108-03 is not a Build 108 regression.**

### 1.3 No fabricated values (re-confirmed)

`Aktivitas Bumi = Stabil` / `Aktivitas Geomagnetik = Tenang` remain genuine USGS / NOAA
"available + quiet" readings, guarded on `dataState === "available"` /
`source.status === "available"` on both render surfaces. `deriveEnvironmentBands` still defaults a
missing Schumann band to `"quiet"`, but the spiritual block that consumes it is gated behind
`hasSchumannObservation`, so a dead feed renders the **unavailable** card, never a fabricated
"quiet" spiritual reading. Any restoration must preserve this gate unchanged (**CDI-A3**).

---

## 2. RESEARCH — candidate source evaluation

Read-only HTTPS probes (`GET` / `OPTIONS`, no auth, no PII) against every realistic public source
of Schumann-resonance data. Evidence contract per `BUILD_108_ENL_MASTER_SOT.md §4.3`.

### 2.1 `schumannresonancelive.com` — incumbent provider (successor endpoints)

```text
SOURCE                = schumannresonancelive.com  (independent re-hoster of the Tomsk spectrogram)
DATASET               = "Live Schumann resonance spectrogram (Tomsk station)" — JPEG image only
MEASUREMENT_TYPE      = re-rendered image of a third-party ELF spectrogram; NO numeric series
SPATIAL_RESOLUTION    = single station (Tomsk, Russia, ~56.5°N 84.9°E) — not user-local
TEMPORAL_RESOLUTION   = card.php max-age 300 s; spectrogram.php max-age ~180 s
HISTORY_AVAILABLE     = NO (rolling image only)
HTTPS                 = YES
API                   = NONE — /api/data.php, /realtime/data.php, /realtime/card.json all HTTP 404
CORS                  = card.php sends Access-Control-Allow-Origin: * ; spectrogram.php does not
RATE_LIMIT            = unstated
LICENSING             = unstated; re-hosts Tomsk data without a declared redistribution licence
ANDROID_COMPATIBILITY = image would load in the WebView, but there is nothing numeric to consume
PROVENANCE            = weak — a re-render of another institution's plot, no observation metadata
RELIABILITY           = the numeric API this project depended on was deleted with no replacement
VERDICT               = REJECT. No numeric API. Deriving SR1–SR5 Hz / amplitude / power by reading
                        pixels off a JPEG spectrogram is fabrication-adjacent and is explicitly
                        out of scope ("no weather/geomagnetic proxy pretending to be Schumann",
                        "no fabricated Stable/Quiet values").
```

### 2.2 `sosrff.tsu.ru` — Tomsk State University Space Observing System (true upstream)

```text
SOURCE                = Tomsk State University — Space Observing System of the Radiophysical
                        Research Facility (the genuine ELF magnetometer station behind the images)
DATASET               = real-time Schumann-resonance spectrogram + amplitude plots
MEASUREMENT_TYPE      = GENUINE ELF magnetic-field measurement (single station)
SPATIAL_RESOLUTION    = single station (Tomsk) — not user-local; SR is a global-cavity phenomenon,
                        so a single station is defensible as "global context", but it is one site
TEMPORAL_RESOLUTION   = ~minutes (image refresh)
HISTORY_AVAILABLE     = NO public archive API
HTTPS                 = BROKEN — TLS certificate EXPIRED (SEC_E_CERT_EXPIRED, verified 2026-09-07).
                        Plain-HTTP request 301-redirects to the same expired-cert HTTPS origin.
API                   = NONE — publishes .jpg spectrograms only (shm.jpg etc.), no JSON
CORS                  = N/A (no machine endpoint; and an expired cert fails WebView validation)
RATE_LIMIT            = unstated
LICENSING             = unstated (Russian state university; no declared open-data / redistribution
                        terms). Re-serving it from a Bhumi backend has an unresolved licensing risk.
ANDROID_COMPATIBILITY = FAILS — `usesCleartextTraffic="false"` + expired TLS cert = no load in a
                        release WebView; the client could not fetch this even as an image.
PROVENANCE            = strong scientifically, but zero machine-readable observation metadata
RELIABILITY           = POOR — expired cert, frequent historic outages, no SLA, no API contract
VERDICT               = REJECT for any direct client use. Only reachable at all via a Bhumi backend
                        that (a) ignores/pins the broken cert, (b) runs scientifically-reviewed
                        spectral peak extraction on the image, and (c) has a redistribution
                        licence. That is a backend project, not a CDI source-swap.
```

### 2.3 HeartMath Institute — Global Coherence Monitoring System (GCMS / GCI)

```text
SOURCE                = HeartMath Institute, Global Coherence Initiative — GCMS magnetometer network
DATASET               = "power levels" time series from induction-magnetometer sites
                        (e.g. Boulder Creek CA, Lithuania, Canada, New Zealand, Saudi Arabia)
MEASUREMENT_TYPE      = GENUINE magnetometer measurement, BUT broadband field "power levels"
                        (~0–40 Hz band power), NOT a decomposed SR1–SR5 peak-frequency spectrum
SPATIAL_RESOLUTION    = ~6 fixed sites worldwide — not user-local
TEMPORAL_RESOLUTION   = sub-minute historically
HISTORY_AVAILABLE     = charting app implies history, but no documented archive API
HTTPS                 = YES
API                   = UNDOCUMENTED. Historic host `gci-api.com` / `www.gci-api.com` → DNS
                        NXDOMAIN (gone). Current chart app
                        `nocc.heartmath.org/power_levels/public/charts/power_levels.html` loads
                        `power_levels.php`; a bare GET returns `[[0]]` (6 bytes, empty — needs
                        undocumented site/date params). HeartMath's own
                        `heartmath.org/gci/gcms/live-data/` page 301-redirects away (removed).
CORS                  = power_levels.php sends `Access-Control-Allow-Origin: *` (GET + OPTIONS)
RATE_LIMIT            = unstated
LICENSING             = HeartMath content is "all rights reserved"; NO open-data or programmatic-use
                        licence. Prior GCI data access was request-gated for researchers.
ANDROID_COMPATIBILITY = a CORS-open GET would work from the WebView IF the endpoint returned data
PROVENANCE            = site list is public, but the `[[index,value]]` payload carries no ISO
                        observation time, no unit, no station attribution, no quality field
RELIABILITY           = LOW confidence — undocumented, currently returns empty, self-hosted
                        "live-data" page removed, historic API host deleted
VERDICT               = REJECT for now. Wrong data model (band power, not SR peaks), no provenance
                        fields, no usable licence, currently empty, no API contract. Substituting
                        GCMS "power levels" for a Schumann-resonance spectrum and presenting it as
                        "Schumann" would itself be a proxy-pretending-to-be-Schumann violation.
```

### 2.4 Other candidates probed

| Source | Result | Verdict |
|---|---|---|
| `schumann-resonance.org` | HTTP 200 — WordPress marketing site for a commercial mobile app ("Quick Schumann Check"); shows a Tomsk spectrogram screenshot; references "Heartmath"; **no public API** | REJECT — commercial app, no API, no licence |
| `api.schumann-resonance.org` | DNS NXDOMAIN | REJECT — does not exist |
| `spaceweatherlive.com` | HTTP 200 — aurora / planetary-K-index site; NOAA-derived; **no Schumann data** | REJECT — and NOAA Kp is an explicitly forbidden substitute |
| `raw.githubusercontent.com/schumann-resonance/data` | HTTP 404 | REJECT — no such community dataset |
| Cumiana / `vlf.it` (R. Romero, Italy — amateur ELF station) | connection reset on probe; publishes plot **images** only; single hobbyist site | REJECT — unreliable, image-only, no licence, no API |
| NOAA SWPC / NASA / USGS | do not measure or publish Schumann resonance | FORBIDDEN as a substitute by task constraints and `V5 D-#509` |

### 2.5 Research conclusion

```text
QUALIFYING_SOURCE_FOUND = NO
```

**No source satisfies the full bar:** genuine Schumann-resonance measurement **and** a
machine-readable numeric API **and** HTTPS with a valid certificate **and** CORS-open for the
`https://localhost` WebView origin **and** a usable redistribution/programmatic-use licence **and**
adequate reliability / an API contract **and** per-datum `SOURCE / OBSERVED_AT / FETCHED_AT /
FRESHNESS / QUALITY / PROVENANCE`.

- **Direct client fetch (any provider): impossible.** The one CORS-open, valid-cert artifact
  available anywhere is a **JPEG image** (`schumannresonancelive.com/realtime/card.php`), which
  carries no numbers and no provenance.
- **The only genuine single-station upstream (Tomsk)** is image-only and currently unreachable
  even as an image (expired TLS cert; blocked by `usesCleartextTraffic="false"`).
- **The only genuine numeric-ish network (HeartMath GCMS)** measures a different quantity
  (broadband band power, not SR1–SR5), is undocumented, unlicensed for this use, currently returns
  empty, and its owner has removed its own live-data page.

---

## 3. ARCHITECTURE DECISION

### 3.1 Options evaluated (per `MASTER_SOT §4.3` A/B/C/D)

| Option | Description | Feasible now? | Blockers |
|---|---|---|---|
| **A — Direct client API** | Swap `SCHUMANN_API_URL` to a new provider the WebView fetches directly | **NO** | No provider exposes a valid-cert, CORS-open, licensed, schema-adaptable numeric SR feed. Nothing to point at. |
| **B — Bhumi-owned normalising proxy** | A hosted runtime fetches the upstream, normalises to the Bhumi schema + provenance, serves it CORS-open to the client | Technically the only path that *could* work | Requires **backend deploy — Founder-gated, NOT authorized**. Plus: (1) an unresolved **redistribution licence** for Tomsk / HeartMath data; (2) if sourced from the Tomsk image, a **scientifically-reviewed spectral-peak-extraction** step (image → SR1–SR5 Hz/amplitude) that must not fabricate; (3) proxy availability / cost / monitoring. |
| **C — Scheduled ingestion + cache** | A cron job ingests upstream on an interval, stores normalised observations (Firestore / object store), client reads the cache | Same as B | Same backend + licence + extraction blockers, plus a storage-write path. `observedAt` must be the upstream observation time, never the ingestion time; gaps must stay gaps. |
| **D — Hybrid** | Direct where possible, proxy/cache otherwise | **NO** | The "direct" leg of the hybrid does not exist. Collapses to B/C. |

### 3.2 Recommendation

```text
RECOMMENDATION = KEEP SCHUMANN FAIL-CLOSED FOR BUILD 108 ENL RELEASE.
                 Do NOT swap SCHUMANN_API_URL. Do NOT build a proxy/ingestion pipeline inside the
                 CDI gate. Present the Founder with a scoped decision (§3.3).
```

Rationale:

1. **Nothing is provably restorable within the CDI-108-03 authorization boundary**
   ("source-proven-before-implementation"). There is no proven source, so there is no implementation.
2. **The current behavior is already correct and already shipped.** Builds 106 and 107 passed their
   gates with Schumann showing an honest "unavailable" card and no fabricated reading. The
   `deriveEnvironmentBands` gate keeps the spiritual block suppressed. Nothing regresses by leaving
   it as-is.
3. **Every restoration path is a real backend project** — hosted runtime + licensing review +
   (for the Tomsk route) a reviewed signal-processing step. That is Founder-gated infrastructure
   work, scientifically non-trivial, and a poor fit for a data-integrity quick-fix. It belongs with
   **`SPRINT-108-ENV2`** (which already owns "Bhumi environmental proxy vs scheduled
   ingestion/cache" as an open research question and is `PLANNED`, not started).
4. **Forcing a substitute would violate the task's own guardrails** — GCMS band power, a JPEG
   spectrogram, or a Kp-derived value presented as "Schumann" are exactly the
   "proxy pretending to be Schumann" / "fabricated Stable/Quiet" failures this task forbids.

### 3.3 Founder decision required

```text
CDI-108-03 cannot self-close. Choose ONE:

  (D1) ACCEPT Schumann as a permanently fail-closed / "unavailable" surface for the Build 108 ENL
       release. Keep the honest UI + the deriveEnvironmentBands gate. CDI-108-03 closes as
       WONT_FIX_THIS_RELEASE with a recorded rationale; the FRA records SCHUMANN = DEFERRED with a
       Founder-approved rationale, user-visible behavior, risk/owner, and follow-up (allowed by
       BUILD_108_FINAL_RELEASE_AUDIT.md §2). ENL copy for the unavailable state becomes native
       English under Sprint 7 / the ENL copy pass (small, no data dependency).

  (D2) AUTHORIZE a separate, backend-gated Schumann restoration project (folded into SPRINT-108-ENV2
       or run alongside it), explicitly covering: a redistribution/programmatic-use licence review
       for the chosen upstream; a hosted normalising proxy or scheduled ingestion/cache; if the
       Tomsk image is the upstream, a scientifically-reviewed spectral-peak-extraction method with
       its own accuracy fixtures and a "no fabrication" contract; per-datum SOURCE / OBSERVED_AT /
       FETCHED_AT / FRESHNESS / QUALITY / PROVENANCE; and its own runtime/Android verification.
       This does NOT reopen or block the completed Chiron / timezone / HD CDI work.

  (D3) PROVIDE a specific provider + access credentials/licence not discoverable by public probe
       (e.g. a private HeartMath GCI research grant, or a paid ELF-data vendor). Research then
       re-runs against that concrete source under the same evidence contract.
```

Until the Founder chooses, `CDI_108_03_SCHUMANN = RESEARCH_COMPLETE — FOUNDER DECISION REQUIRED`
and `NEXT_SAFE_ACTION = CONTINUE_CURRENT_GATE_108_CDI` (the remaining open CDI item is the
Founder-gated HD service extras / legacy backfill disposition, not Schumann).

---

## 4. IMPLEMENT — what changed in this task (safe subset only)

No runtime behavior changed. `SCHUMANN_API_URL` is unchanged. No proxy, ingestion job, backend, or
production write. The only code change is an **additive regression guard** that locks the
CDI-108-03 invariants the SOT requires be preserved:

- **`tests/unit/build108-cdi03-schumann-source-integrity.test.ts`** (new). Asserts:
  1. `SCHUMANN_API_URL` host is not a NOAA / space-weather / USGS / weather / geomagnetic domain,
     and the Schumann `EnvironmentDataSource` literal stays `"schumann_resonance_live"` — i.e. no
     Kp / USGS / weather proxy may be aliased in as "Schumann".
  2. On a Schumann fetch failure with an empty cache buffer, `getNormalizedEnvironment()` leaves
     `ctx.schumann.source.status === "unavailable"`, `provenance === "modelled-series"`, and emits
     **no** SR frequency numbers, intensity, amplitude, or power (fail-closed; no fabricated
     Stable/Quiet).
  3. `normalizeSchumannResponse({})` and a wrong-shape object yield no accepted observation
     (no frequencies, no intensity/amplitude/power) and do not throw.
  4. `deriveEnvironmentBands()` still defaults a missing Schumann band to `"quiet"` **and** the
     `/dashboard/environment` `hasSchumannObservation` gate that suppresses the spiritual block is
     still present in source (CDI-A3 guard).

This test is pure verification of existing behavior; it adds no product surface and no dependency.

---

## 5. VERIFY

```text
COMMANDS (Node 20.20.2 via nvm):
  npx tsc --noEmit
  node --import tsx tests/unit/build108-cdi03-schumann-source-integrity.test.ts
  node --import tsx tests/unit/v5-environment-context.test.ts
  node --import tsx tests/unit/build107-production-surface-guard.test.ts
  node --import tsx tests/unit/build107-hd-existing-user-convergence.test.ts
  node --import tsx tests/unit/build108-cdi01-chiron-natal-accuracy.test.ts
  node --import tsx tests/unit/build108-cdi01a-timezone-canonicalization.test.ts
  node --import tsx tests/unit/build108-cdi02-hd-advanced-variables.test.ts
```

Results are recorded in the task report and in `MEMORY.md` / the Build 108 handoff on completion.
Build 107 inheritance guards (`build107-production-surface-guard`,
`build107-hd-existing-user-convergence`) must stay GREEN — this task does not touch HD `type`
convergence, admin withdrawal, orphan-route removal, or static-surface guards.

---

## 6. PRESERVED / NOT TOUCHED

- Chiron real Swiss-Ephemeris table (CDI-108-01) — untouched.
- IANA timezone canonicalization (CDI-108-01A / CDI-C3) — untouched.
- HD advanced-field client integrity + recovery safety (CDI-108-02) — untouched.
- `scripts/mass-recover-hd.ts` and all HD recovery paths — not run, not modified.
- `scripts/.build106-production-admin-provision.mjs` (untracked credential utility) — preserved,
  not staged, not deleted.
- Build 107 inheritance guards — unaffected.
- The honest fail-closed Schumann UI and the `deriveEnvironmentBands` / `hasSchumannObservation`
  gate — preserved exactly (CDI-A3).

---

## 7. STATUS

```text
CDI_108_01_CHIRON             = COMPLETE
CDI_108_01A_TIMEZONE          = COMPLETE
CDI_108_02_HUMAN_DESIGN       = DONE (client integrity / recovery safety); service extras source-dependent
CDI_108_03_SCHUMANN           = RESEARCH_COMPLETE — NO QUALIFYING SOURCE — FOUNDER DECISION REQUIRED (D1 / D2 / D3, §3.3)
CDI_D1_LEGACY_BACKFILL        = PENDING — NOT AUTHORIZED
GATE_108_CDI                  = IN_PROGRESS
SPRINT_108_05                 = BLOCKED
SPRINT_108_ENV2               = PLANNED
GATE_108_FRA                  = PLANNED
BUILD_108_CAN_PROCEED_TO_RELEASE = NO
NEXT_SAFE_ACTION              = FOUNDER_DECISION_ON_CDI_108_03 → CONTINUE_CURRENT_GATE_108_CDI
PRODUCTION_FIRESTORE_WRITE    = NOT AUTHORIZED
PRODUCTION_BACKFILL           = NOT AUTHORIZED
BACKEND_DEPLOY                = NOT AUTHORIZED
PLAY_UPLOAD                   = NOT AUTHORIZED
```

**STOP FOR FOUNDER REVIEW.**
