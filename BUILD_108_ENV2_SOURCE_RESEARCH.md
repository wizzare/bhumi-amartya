# BUILD 108 — ENVIRONMENTAL INTELLIGENCE V2 (ENV2) SOURCE RESEARCH REPORT
**Authoritative Provider & Dataset Audit for Surface Air Quality, Atmospheric Column SO2, Wind, and Volcanic Context**

```text
STATUS                          = SOURCE_RESEARCH_COMPLETE
DATE                            = 2026-09-07
INITIATIVE                      = BUILD 108 ENL — SPRINT-108-ENV2
SPRINT_108_ENV2_STATUS          = IMPLEMENTING
ARCHITECTURE_DECISION           = OPTION_A_DIRECT_CLIENT_WITH_PROVENANCE_ENGINE (Zero new backend required)
QUALIFYING_SOURCES_IDENTIFIED   = YES (Open-Meteo CAMS / Copernicus CAMS / NOAA GFS / USGS GVP)
SCHUMANN_D1_STATUS              = PRESERVED (Fail-closed, no unqualified replacement)
```

---

## 1. Domain 1: Surface Air Quality (AQI, PM2.5, PM10, NO2, O3, CO, Surface SO2)

### Candidate 1.1: Open-Meteo Air Quality API (CAMS / Copernicus Ensemble & NOAA GFS Aerosol) — RECOMMENDED
```text
SOURCE                          = Open-Meteo Air Quality API
DATASET                         = Copernicus Atmosphere Monitoring Service (CAMS) European Ensemble + Global CAMS (0.4°)
PROVIDER                        = Open-Meteo GmbH (partnered with Copernicus ECMWF)
MEASUREMENT_OR_MODEL            = MODELLED_ASSIMILATION (Satellite assimilation + chemical transport models validated by ground stations)
SPATIAL_RESOLUTION              = 0.1° (~11 km) in Europe, 0.4° (~40 km) global
TEMPORAL_RESOLUTION             = Hourly, updated every 6 hours
OBSERVATION_DELAY               = Near-real-time (forecast / hindcast with 1-hour resolution)
HISTORY_AVAILABLE               = YES (via historical air-quality API endpoint)
HTTPS                           = YES (https://air-quality-api.open-meteo.com)
API                             = REST JSON, keyless for standard non-commercial/fair use (<10,000 daily calls)
AUTH                            = None required for basic; optional API key for enterprise
CORS                            = YES (Access-Control-Allow-Origin: *)
RATE_LIMIT                      = 10,000 daily requests, max 600/minute
LICENSING                       = Attribution required: CC BY 4.0 (Copernicus CAMS & Open-Meteo)
ATTRIBUTION_REQUIREMENTS        = "Data provided by Copernicus Atmosphere Monitoring Service and Open-Meteo"
ANDROID_COMPATIBILITY           = EXCELLENT (direct client HTTPS fetch from static Capacitor WebView)
PROVENANCE                      = Copernicus ECMWF CAMS European Ensemble / CAMS Global
RELIABILITY                     = 99.9% uptime, established global standard
VERDICT                         = QUALIFYING — RECOMMENDED for Surface Air Quality & Surface SO2
```

### Candidate 1.2: OpenAQ API
```text
SOURCE                          = OpenAQ Platform
DATASET                         = Aggregated Government & Research Monitoring Stations
PROVIDER                        = OpenAQ Inc. (501(c)(3))
MEASUREMENT_OR_MODEL            = DIRECT_MEASUREMENT (Ground stations)
SPATIAL_RESOLUTION              = Point source (distance to nearest station varies wildly from 2 km to 500+ km)
TEMPORAL_RESOLUTION             = Hourly to daily
OBSERVATION_DELAY               = 1 to 24 hours depending on country reporting
HISTORY_AVAILABLE               = YES
HTTPS                           = YES (https://api.openaq.org)
API                             = REST JSON
AUTH                            = Requires API key (free tier requires developer registration)
CORS                            = YES
RATE_LIMIT                      = 60 requests/minute
LICENSING                       = Varies by station, generally CC BY 4.0
ATTRIBUTION_REQUIREMENTS        = Attribution to OpenAQ and original station provider
ANDROID_COMPATIBILITY           = MODERATE (requires API key bundling or proxy)
PROVENANCE                      = Multiple national environmental agencies
RELIABILITY                     = Station downtime common in developing regions; spatial gaps in Indonesia/rural areas
VERDICT                         = SECONDARY / BENCHMARK ONLY (high spatial sparsity outside major cities)
```

---

## 2. Domain 2: Atmospheric Column SO2 (Total Column SO2)

### Candidate 2.1: Open-Meteo / Copernicus CAMS Atmospheric SO2 Total Column (`so2_column`) — RECOMMENDED
```text
SOURCE                          = Open-Meteo Air Quality API
DATASET                         = Copernicus CAMS Global Atmospheric Composition Forecast / Reanalysis (Sentinel-5P TROPOMI assimilated)
PROVIDER                        = European Centre for Medium-Range Weather Forecasts (ECMWF) via Open-Meteo
MEASUREMENT_OR_MODEL            = ASSIMILATED_SATELLITE_OBSERVATION (TROPOMI Sentinel-5P + Chemical Transport Model)
SPATIAL_RESOLUTION              = 0.4° (~40 km)
TEMPORAL_RESOLUTION             = Hourly
OBSERVATION_DELAY               = Near-real-time (updated every 6-12 hours with satellite orbit passes)
HISTORY_AVAILABLE               = YES
HTTPS                           = YES (https://air-quality-api.open-meteo.com/v1/air-quality)
API                             = REST JSON, query param `so2_column` (returns integrated column in μg/m² or Dobson Units conversion)
AUTH                            = None (keyless)
CORS                            = YES (Access-Control-Allow-Origin: *)
RATE_LIMIT                      = 10,000 calls/day
LICENSING                       = Copernicus Open Access / CC BY 4.0
ATTRIBUTION_REQUIREMENTS        = "Copernicus CAMS SO2 Column via Open-Meteo"
ANDROID_COMPATIBILITY           = EXCELLENT (direct client fetch, no proxy required)
PROVENANCE                      = ESA Copernicus Sentinel-5P TROPOMI / ECMWF CAMS
RELIABILITY                     = Authoritative European space-grade atmospheric monitoring
VERDICT                         = QUALIFYING — RECOMMENDED for Atmospheric Column SO2
```
*Scientific Boundary Invariant:* Total-column SO2 is measured in `μg/m²` or `DU` (Dobson Units, where 1 DU ≈ 28.5 mg/m²). It represents the entire vertical column from ground to stratosphere. It must **NEVER** be converted into surface inhalation concentration (`μg/m³`) or used for personal ground-level exposure warnings.

---

## 3. Domain 3: Wind Vector & Movement (Speed, Direction, Relative Vector)

### Candidate 3.1: Open-Meteo Weather API (NOAA GFS / ECMWF IFS / DWD ICON) — RECOMMENDED
```text
SOURCE                          = Open-Meteo Weather Forecast API
DATASET                         = Multi-model High-Resolution Weather (DWD ICON, NOAA GFS, ECMWF)
PROVIDER                        = Open-Meteo
MEASUREMENT_OR_MODEL            = NUMERICAL_WEATHER_PREDICTION_ASSIMILATION
SPATIAL_RESOLUTION              = 0.1° (~11 km) global
TEMPORAL_RESOLUTION             = Hourly (wind_speed_10m, wind_direction_10m, wind_gusts_10m)
OBSERVATION_DELAY               = Current hour forecast / observation assimilation
HISTORY_AVAILABLE               = YES
HTTPS                           = YES (https://api.open-meteo.com/v1/forecast)
API                             = REST JSON
AUTH                            = None (keyless)
CORS                            = YES (Access-Control-Allow-Origin: *)
RATE_LIMIT                      = 10,000 calls/day
LICENSING                       = Open Data (ODbL / CC BY 4.0)
ATTRIBUTION_REQUIREMENTS        = "Weather data by Open-Meteo.com"
ANDROID_COMPATIBILITY           = EXCELLENT
PROVENANCE                      = National Weather Services (DWD / NOAA / ECMWF)
RELIABILITY                     = >99.9%
VERDICT                         = QUALIFYING — RECOMMENDED for Wind Vector & Relative Trajectory
```

---

## 4. Domain 4: Volcanic Context (Plume Detection, Volcanic Origin, Source Attribution)

### Candidate 4.1: Smithsonian Institution Global Volcanism Program (GVP) + USGS / BMKG Magma / VAAC Data
```text
SOURCE                          = Smithsonian Global Volcanism Program (GVP) & Volcanic Ash Advisory Centers (VAAC)
DATASET                         = Holocene Volcanoes of the World & Weekly Volcanic Activity Reports
PROVIDER                        = Smithsonian Institution / USGS / International Airways Volcano Watch (ICAO)
MEASUREMENT_OR_MODEL            = GROUND_OBSERVATION + SATELLITE_PLUME_TRACKING
SPATIAL_RESOLUTION              = Specific volcano locations (lat/lon, elevation, morphology) & VAAC polygon advisories
TEMPORAL_RESOLUTION            = Daily to weekly reports; real-time notices during eruptions
OBSERVATION_DELAY               = Minutes for VAAC VAA notices, hours/days for weekly summaries
HISTORY_AVAILABLE               = YES (Comprehensive historical database)
HTTPS                           = YES
API                             = Catalog dataset & public bulletin feeds
AUTH                            = Public domain / Open government data
CORS                            = Static data bundled locally; dynamic advisories via public feeds
RATE_LIMIT                      = Bundled offline catalog: infinite
LICENSING                       = Public Domain (USGS / Smithsonian GVP)
ATTRIBUTION_REQUIREMENTS        = "Smithsonian Institution Global Volcanism Program & USGS"
ANDROID_COMPATIBILITY           = EXCELLENT (Deterministic offline geographical index + proximity & trajectory engine)
PROVENANCE                      = Smithsonian GVP / USGS Volcano Science Center
RELIABILITY                     = Canonical global authority on volcanoes
VERDICT                         = QUALIFYING — RECOMMENDED for Volcano Directory, Proximity & Provenance
```

---

## 5. Architectural Evaluation: Option A vs B vs C vs D

| Architecture | Description | Pros | Cons | Verdict |
|---|---|---|---|---|
| **Option A (Direct Client)** | Android app fetches Open-Meteo AQ / CAMS / Weather APIs directly using `fetchWithTimeout` and evaluates volcanic context locally via deterministic geographical + trajectory algorithms and GVP directory. | 1. Zero server deployment required.<br>2. Full compatibility with static Next.js export (`output: 'export'`).<br>3. Zero operational cost or backend maintenance.<br>4. True local-first architecture. | Client executes proximity math and parsing locally. | **APPROVED & ADOPTED** |
| **Option B (Bhumi Proxy)** | Cloudflare Worker / Vercel Edge proxy forwarding requests. | Hides provider URLs, allows caching. | Requires deploying and maintaining new cloud infrastructure. Founder explicitly prohibited unauthorized backend deployment. | **DEFERRED (OPS GATED)** |
| **Option C (Scheduled Ingestion)**| Scheduled cron storing global grid into Firestore. | Pre-calculated data. | Massive Firestore read/write volume, huge costs, high latency for global users. | **REJECTED** |
| **Option D (Hybrid)** | Direct client for real-time + local cache. | Best offline resilience. | Supported as refinement of Option A. | **ADOPTED AS REFINEMENT** |

---

## 6. Scientific Boundary & Health Safety Rules

1. **Surface SO2 vs Column SO2 Separation:**
   - `airQuality.surfaceSo2` is measured in `μg/m³` (micrograms per cubic meter) representing ground-level gas.
   - `atmosphere.totalColumnSo2` is measured in `μg/m²` or `DU` (Dobson Units) representing the integrated vertical column.
   - **RULE:** Under no circumstances will one be inferred from or converted into the other.

2. **Volcanic Attribution Rules:**
   - SO2 elevation alone can NEVER establish volcanic origin (industrial, urban, and ship emissions also produce SO2).
   - A volcano may ONLY be attributed if all the following conditions are satisfied:
     1. User or plume is within active spatial proximity (< 150 km) of an authentic known volcano.
     2. Total column SO2 or plume observation exhibits significant anomaly above regional baseline.
     3. Wind direction trajectory matches transport vector from volcano location toward user location.
     4. Verified provenance and timestamp exist.
   - If evidence is weak, contradictory, or absent:
     - `plumeDetected = null`
     - `probableVolcanicOrigin = null`
     - `probableSource = null`
     - `attributionConfidence = "unknown"`
   - **RULE:** Never fabricate "Normal", "Stable", "Safe", "Volcanic plume detected", or guess a volcano name.

3. **Health Advice Boundary:**
   - Personal exposure and outdoor activity recommendations are **ONLY** derived from Surface Air Quality (`us_aqi`, `pm25`, `pm10`, surface `so2`).
   - Atmospheric Column SO2 carries zero ground-level health claims.
