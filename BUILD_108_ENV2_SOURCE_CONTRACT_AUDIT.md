# BUILD 108 — ENVIRONMENTAL INTELLIGENCE V2 (ENV2) SOURCE CONTRACT AUDIT
**Runtime Verification of Atmospheric SO2, Open-Meteo Service Terms, and Smithsonian GVP Data Terms**

```text
AUDIT_STATUS                    = COMPLETE
DATE                            = 2026-09-07
INITIATIVE                      = BUILD 108 ENL — SPRINT-108-ENV2
SPRINT_108_ENV2_STATUS          = HOLD_FOR_SOURCE_CONTRACT_CORRECTION
BLOCKERS_FOUND                  = 2 (Atmospheric Column SO2 invalid endpoint; Open-Meteo commercial term mismatch)
FAIL_CLOSED_CORRECTIONS_APPLIED = YES
```

---

## 1. Domain 1: Atmospheric Column SO2 Runtime Audit

### Runtime Trace
```text
UI: AtmosphereVolcanicCard.tsx
  -> env2Service.ts (fetchEnvironmentalConditionPayload)
    -> HTTP Request:
       https://air-quality-api.open-meteo.com/v1/air-quality?latitude=-7.7956&longitude=110.3695&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,so2_column
```

### Exact Provider Response
```json
{
  "error": true,
  "reason": "Invalid value: Cannot initialize SurfacePressureAndHeightVariable<VariableAndPreviousDay, VariableOrSpread<ForecastPressureVariable>, ForecastHeightVariable> from invalid String value so2_column"
}
```

### Finding & Root Cause
- `ATMOSPHERIC_SO2_ENDPOINT`: `https://air-quality-api.open-meteo.com/v1/air-quality`
- `ATMOSPHERIC_SO2_PROVIDER`: Open-Meteo
- `RAW_FIELD`: `so2_column` is **REJECTED** by Open-Meteo's API parser as an invalid variable.
- `REALITY`: Open-Meteo Air Quality API exposes **only** `sulphur_dioxide` (`surface concentration ~10 m, in μg/m³`). It does **NOT** expose total-column SO2.
- `CONVERSION`: The documentation assumption that Open-Meteo provides `so2_column` was **invalid and synthetic**.
- `CAMS ATMOSPHERE DATA STORE (ADS)`: The true Copernicus Atmosphere Data Store (ADS) provides total column SO2 via ECMWF MARS/CDS Python client APIs (`netCDF` / `GRIB` format), which requires asynchronous job queuing, API key registration, and server-side processing. It is **incompatible** with direct-client Android HTTP fetches from static Next.js/Capacitor exports.

### Action Taken: Mandatory Fail-Closed Correction
- `atmosphere.totalColumnSo2UgM2`: Set to `undefined` (null state).
- `atmosphere.totalColumnSo2DobsonUnits`: Set to `undefined`.
- `atmosphere.anomalyDetected`: Set to `null`.
- `atmosphere.provenance.measurementOrModel`: Set to `"unknown"`.
- `atmosphere.provenance.freshness`: Set to `"unknown"`.
- `atmosphere.provenance.attributionText`: "Atmospheric total-column SO2 source is currently unavailable. Fail-closed."
- `volcanic.plumeDetected`: Set to `null`.
- `volcanic.probableSource`: Set to `null`.
- `volcanic.attributionConfidence`: Set to `"unknown"`.
- `volcanic.attributionRationale`: "Atmospheric total-column SO2 observation is unavailable from qualifying direct client source. Volcanic plume detection is fail-closed."
- **Strict Invariant Guard:** Surface `sulphur_dioxide` is **NEVER** substituted for column SO2.

---

## 2. Domain 2: Open-Meteo Service Terms vs Data License

### Audit Findings
- `OPEN_METEO_DATA_LICENSE`: **CC BY 4.0** (Open Data from ECMWF, DWD, NOAA, Copernicus).
- `OPEN_METEO_FREE_API_COMMERCIAL_ALLOWED`: **NO**.
  - Open-Meteo Terms of Use section "Non-Commercial Use" explicitly states:
    > "You may only use the free API services for non-commercial purposes... Operating websites or apps that have subscriptions or display advertisements... are considered commercial use."
  - Bhumi Amartya is a commercial product with subscription plans ("Premium Bhumi" via Google Play Billing).
- `CURRENT_ENDPOINT_PLAN`: Free / Open-Access (non-commercial tier, 10,000 requests/day).
- `PRODUCTION_USE_COMPLIANT`: **NO (COMMERCIAL_TERM_RESTRICTION)**.
  - Using the free Open-Meteo endpoint in a production build on Google Play violates Open-Meteo's Terms of Use.
  - Open-Meteo offers commercial tiers ("API Standard", "API Professional"), but purchasing or subscribing to a commercial plan requires Founder authorization, payment methods, and an API key.

### Action Taken: Provider-Gated / Fail-Closed Design
- In production runtime:
  - If no commercial `NEXT_PUBLIC_OPEN_METEO_API_KEY` is configured in environment:
    - Open-Meteo external calls must be treated as **UNCONFIGURED_COMMERCIAL_PROVIDER** or run in fail-closed / sandbox mode.
    - For non-commercial local dev/testing, free access functions.
    - For release, `airQuality` and `wind` fail closed cleanly without crashing the client or violating provider terms.

---

## 3. Domain 3: Smithsonian Global Volcanism Program (GVP) Terms

### Audit Findings
- `GVP_DATASET`: Holocene Volcano List (Volcanoes of the World, v. 5.1.0).
- `GVP_ACCESS_METHOD`: Static geographical coordinates bundled locally (`lib/environment/knownVolcanoes.ts`).
- `GVP_CONTENT_TYPE`: Volcano catalog metadata (Name, coordinates, elevation, volcano type, country/region).
- `GVP_LICENSE_OR_TERMS`:
  - Smithsonian general Terms of Use: Content not marked with CC0 is subject to fair use / non-commercial usage conditions unless licensed.
  - Smithsonian Open Access (CC0) applies to 2D/3D digital assets and select datasets, but raw GVP compilation copyright belongs to the Smithsonian Institution.
- `COMMERCIAL_USE_STATUS`:
  - Factual geographical data (coordinates, elevation, names) is generally not copyrightable under US Law (*Feist Publications*), but the curated database compilation requires permission or fair use for commercial redistribution.
  - Current volcanic activity reports (Eruptions, Bulletins) are copyrighted editorial content.
- `ATTRIBUTION_REQUIRED`: **YES**.
  - Required citation: *"Global Volcanism Program, 2024. Volcanoes of the World (v. 5.1.0). Smithsonian Institution."*

### Action Taken
- Catalog data in `knownVolcanoes.ts` is strictly factual geographical coordinates (latitude, longitude, elevation, primary type).
- Attribution added explicitly to UI and `lib/environment/knownVolcanoes.ts`.

---

## 4. Attribution Matrix

| Provider | Required Attribution | Location in Bhumi UI | Status |
|---|---|---|---|
| **Copernicus CAMS** | "Contains modified Copernicus Atmosphere Monitoring Service information [Year]" | `AtmosphereVolcanicCard.tsx` + `dashboard/environment` | **COMPLETE** |
| **Open-Meteo** | "Weather and air quality data by Open-Meteo.com (CC BY 4.0)" | `AtmosphereVolcanicCard.tsx` + `dashboard/environment` | **COMPLETE** |
| **Smithsonian GVP** | "Volcano catalog data from Smithsonian Institution Global Volcanism Program" | `AtmosphereVolcanicCard.tsx` + `dashboard/environment` | **COMPLETE** |
| **USGS** | "Earthquake data provided by the U.S. Geological Survey" | `dashboard/environment` | **COMPLETE** |
| **NOAA SWPC** | "Space weather data provided by NOAA Space Weather Prediction Center" | `dashboard/environment` | **COMPLETE** |
| **BigDataCloud** | "Reverse geocoding by BigDataCloud" | `dashboard/environment` | **COMPLETE** |
