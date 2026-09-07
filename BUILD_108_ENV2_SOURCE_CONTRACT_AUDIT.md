# BUILD 108 — ENVIRONMENTAL INTELLIGENCE V2 (ENV2) COMPLIANCE & CONTRACT CORRECTION REPORT

```text
AUDIT_STATUS                    = RATIFIED_COMPLETE
DATE                            = 2026-09-07
INITIATIVE                      = BUILD 108 ENL — SPRINT-108-ENV2
SPRINT_108_ENV2_STATUS          = COMPLETE
ENV2_ARCHITECTURE               = PASS
ENV2_UI                         = PASS
ENV2_DATA_INTEGRITY             = PASS
ENV2_FAIL_CLOSED                = PASS
AIR_QUALITY_BUILD108            = ACCEPTED_UNAVAILABLE
WIND_BUILD108                   = ACCEPTED_UNAVAILABLE
ATMOSPHERIC_COLUMN_SO2_BUILD108 = ACCEPTED_UNAVAILABLE
VOLCANIC_ATTRIBUTION_BUILD108   = ACCEPTED_UNAVAILABLE
SCHUMANN_BUILD108               = ACCEPTED_UNAVAILABLE
OPEN_METEO_FREE_PRODUCTION      = FORBIDDEN
OPEN_METEO_PRODUCTION_CALLS     = 0
OPEN_METEO_COMMERCIAL_ACCESS    = NOT_CONFIGURED
OPEN_METEO_CLIENT_KEY_ACTIVATION= FORBIDDEN_PENDING_ARCHITECTURE_AND_SECURITY_REVIEW
GVP_BUNDLED_VERSION             = VOTW v5.1.0
GVP_CURRENT_VERSION             = VOTW v5.4.0
GVP_CURRENT_VERSION_DATE        = 2026-08-07
GVP_COMMERCIAL_PERMISSION       = UNRESOLVED
SOURCE_CONTRACT_BLOCKERS        = 0
RELEASE_CRITICAL_SOURCE_BLOCKERS= 0
ENV2_RELEASE_SAFE               = YES_WITH_FAIL_CLOSED_DATA
SPRINT_108_08_CAN_START         = YES
```

---

## 1. Open-Meteo Production Compliance & Provider Gate

### Audit Finding
- Open-Meteo Terms of Use section "Non-Commercial Use" explicitly states:
  > "Operating websites or apps that have subscriptions or display advertisements... are considered commercial use."
- Bhumi Amartya is a commercial product offering Google Play in-app subscription billing ("Premium Bhumi").
- Therefore, calling the free tier of Open-Meteo in production violates their service terms.

### Remediation Applied
- Created `lib/environment/openMeteoGate.ts` with strict functions:
  - `isOpenMeteoCommercialConfigured()`: checks for an authorized commercial `NEXT_PUBLIC_OPEN_METEO_API_KEY`.
  - `isOpenMeteoCallPermitted()`: returns `false` in production unless an authorized commercial key is present.
- Updated `lib/environment/env2Service.ts` and `lib/environment/service.tsx`:
  - If `isOpenMeteoCallPermitted()` is `false`:
    - `airQuality`: fails closed honestly (`aqi: undefined`, `pm25: undefined`, etc.).
    - `weather` / `wind`: fails closed honestly (`speedKph: undefined`, `direction: undefined`).
    - Data provenance is marked `"open_meteo_unconfigured"`, attribution explicitly states:
      *"Open-Meteo commercial access is unconfigured (fail-closed)."*
    - No free-tier HTTP requests are emitted in production.
    - Zero data fabrication; no synthetic defaults (e.g. no fake "Moderate" or "Normal").

---

## 2. Atmospheric Column SO2 Status

### Audit Finding
- The runtime HTTP request previously queried `so2_column` from `air-quality-api.open-meteo.com`.
- Open-Meteo's API rejected `so2_column` with:
  *"Cannot initialize SurfacePressureAndHeightVariable from invalid String value so2_column"*.
- Open-Meteo only exposes surface `sulphur_dioxide` (`~10m` height in `μg/m³`).
- CAMS Atmosphere Data Store (ADS) provides total column SO2 only via asynchronous Python ECMWF APIs (`netCDF`/`GRIB` batches), which is technically inaccessible via direct client HTTPS in a static Next.js / Capacitor build.

### Remediation Applied
- `ATMOSPHERIC_COLUMN_SO2_BUILD108 = ACCEPTED_UNAVAILABLE`.
- Removed `so2_column` parameter from all request URLs.
- In `env2Service.ts`:
  - `totalColumnSo2UgM2 = undefined`
  - `totalColumnSo2DobsonUnits = undefined`
  - `anomalyDetected = null`
  - Provenance attribution text: *"Atmospheric total-column SO2 is currently unavailable from qualifying direct client source (fail-closed)."*
- In `AtmosphereVolcanicCard.tsx`:
  - SO2 Column card renders: value = `"Unavailable"`, subValue = `"Source Pending"`.
  - Strictly preserves invariant: Surface SO2 (`μg/m³`) is **NEVER** converted into column SO2 (`DU`).

---

## 3. Smithsonian Global Volcanism Program (GVP) Contract Audit

### Exact Dataset Audit
- `BUNDLED_GVP_VERSION` = Volcanoes of the World (VOTW) v5.1.0 (local factual geographical catalog in `knownVolcanoes.ts`).
- `BUNDLED_GVP_SOURCE_FILE` = `lib/environment/knownVolcanoes.ts`.
- `BUNDLED_GVP_ACQUIRED_DATE` = 2024 (derived from GVP Holocene volcano catalog).
- `CURRENT_GVP_VERSION` = Volcanoes of the World (VOTW) v5.4.0 (official Smithsonian Institution / USGS database).
- `GVP_CURRENT_VERSION_DATE` = 2026-08-07.
- `BUNDLED_VS_CURRENT` = Preserved separately. Bundled data is VOTW v5.1.0 and is explicitly NOT claimed as current.
- `FIELDS_COPIED` = Pure factual geographic coordinates (Name, Country, Region, Latitude, Longitude, Elevation, Morphology Type).
- `TRANSFORMATION` = Filtered to 35 historically active regional/global volcanoes, reformatted as TypeScript data structure.
- `ATTRIBUTION` = "Global Volcanism Program, Smithsonian Institution & USGS Volcano Hazards Program".
- `COMMERCIAL_PERMISSION_BASIS` = **UNRESOLVED**.
  - While individual factual geographical coordinates are non-copyrightable under US Law (*Feist*), the Smithsonian Institution Terms of Use assert compilation copyright and require written permission for commercial redistribution.
  - No written commercial licensing agreement exists between Bhumi and the Smithsonian Institution.

### Remediation Applied
- `GVP_PRODUCTION_USE = UNRESOLVED`.
- `VOLCANIC_ATTRIBUTION_BUILD108 = FAIL_CLOSED`.
- In `lib/environment/volcanicEngine.ts`:
  - In production commercial builds, named volcanic source attribution fails closed:
    - `probableSource = null`
    - `probableVolcanicOrigin = null`
    - `plumeDetected = null`
    - `attributionConfidence = "unknown"`
    - `attributionRationale = "Atmospheric column SO2 observation and volcanic attribution are currently unavailable (fail-closed)."`
- In `AtmosphereVolcanicCard.tsx`:
  - Volcanic Origin card renders: `"Unavailable"` (Confidence: unknown).
  - Footer shows: `"Source Gated"`.
  - Zero fabricated volcano names, zero invented "Normal" or "Safe" states.

---

## 4. Alternative In-Repo Sources Audit

- Checked existing repository capabilities:
  - USGS Earthquake API (`earthquake.usgs.gov`) is public domain (US Government) and already integrated for seismic activity. However, it does **not** provide volcanic gas plume tracking or active volcanic gas emissions.
  - NOAA Space Weather (`services.swpc.noaa.gov`) is public domain, but only measures geomagnetic activity (Kp Index), which cannot substitute for volcanic plumes.
- **Verdict:** No safe, already-in-repo source exists that can provide authentic volcanic plume observations without external provider integration.
- **Action:** Retain volcanic attribution as **FAIL-CLOSED** for Build 108.

---

## 5. Summary Compliance Ledger

| Item | Status | Action Taken |
|---|---|---|
| **Open-Meteo Production Calls** | `BLOCKED` | `isOpenMeteoCallPermitted()` gates all calls in production. Fails closed without commercial key. |
| **Atmospheric Column SO2** | `ACCEPTED_UNAVAILABLE` | Parameter removed; field set to undefined; zero surface conversion. |
| **Smithsonian GVP Catalog** | `UNRESOLVED` | Named source attribution gated and failed closed in production. |
| **Volcanic Attribution** | `FAIL_CLOSED` | `probableSource = null`, `plumeDetected = null`. Zero named fabrication. |
| **UI Presentation** | `NATIVE_ENGLISH_HONEST` | Renders "Unavailable" / "Source Pending" / "Source Gated" in clean English. |
| **Health Guidance** | `SAFE_BOUNDED` | Only derived from valid surface AQI; never mentions column SO2 or unavailable data. |
| **Schumann Resonance** | `PRESERVED_D1` | Remains fail-closed; no NOAA/USGS/weather inference. |
