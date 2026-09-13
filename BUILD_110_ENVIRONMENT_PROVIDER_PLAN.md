# Build 110 — Environment Provider Recovery Plan (RESEARCH + ARCHITECTURE ONLY)

Status: `PROVIDER_RESEARCH_COMPLETE_ARCHITECTURE_DESIGNED_ACTIVATION_BLOCKED`
Activation requires explicit Founder authorization (billing + backend deploy). Nothing
in this document activates any paid API, creates any charge, deploys any backend,
exposes any credential, or changes any version/release artifact.

```text
ENVIRONMENT_PROVIDER_PLAN = GOOGLE_WEATHER_VIA_PROXY + GOOGLE_AQI_VIA_PROXY
GOOGLE_WEATHER = RESEARCHED_NOT_ACTIVATED
GOOGLE_AIR_QUALITY = RESEARCHED_NOT_ACTIVATED
WEATHER_FIELDS_RECOVERABLE = YES (via Google Weather API, server-side proxy — pending authorization)
AQI_RECOVERABLE = YES (via Google Air Quality API, server-side proxy — pending authorization)
USGS = KEEP_LIVE
NOAA = KEEP_LIVE
BIGDATACLOUD = KEEP_LIVE
SUN_MOON = KEEP_LIVE (local astronomy-engine)
SCHUMANN = REMOVED
VOLCANIC = REMOVED
OPEN_METEO_PRODUCTION_CALLS = 0 (unchanged, fail-closed)
```

## 1. Google Weather API audit (source: Google for Developers, fetched 2026-09-13)

### Endpoint for current conditions
`GET https://weather.googleapis.com/v1/currentConditions:lookup?key=KEY&location.latitude=LAT&location.longitude=LON`

### Required fields — all supported by `currentConditions:lookup` (metric default; IMPERIAL optional)

| Product field | API response field | Status |
|---|---|---|
| temperature | `temperature.degrees` (CELSIUS) | SUPPORTED |
| relative humidity | `relativeHumidity` (percent) | SUPPORTED |
| sea-level pressure | `airPressure.meanSeaLevelMillibars` | SUPPORTED |
| wind speed | `wind.speed.value` (KILOMETERS_PER_HOUR) | SUPPORTED |
| wind direction | `wind.direction.degrees` + `cardinal` | SUPPORTED |
| wind gust | `wind.gust.value` | SUPPORTED (where available) |
| UV index | `uvIndex` | SUPPORTED |
| apparent temperature | `feelsLikeTemperature.degrees` | SUPPORTED (bonus) |
| weather condition | `weatherCondition.description.text` + `type` + `iconBaseUri` | SUPPORTED (bonus) |
| cloud cover | `cloudCover` (percent) | SUPPORTED (bonus) |
| precipitation | `precipitation.probability.percent` + `qpf.quantity` | PARTIAL (probability + quantity; hourly granularity via separate endpoint) |

### Indonesia coverage
`GOOGLE_WEATHER_INDONESIA_COVERAGE = FULL (ID: Current ⬤ / Daily ⬤ / Hourly ⬤ / History ⬤; Weather alerts —, not needed)`
Source: https://developers.google.com/maps/documentation/weather/coverage (ID row verified).

### Billing
`GOOGLE_WEATHER_BILLING_REQUIRED = YES (Google Cloud billing account required; pay-as-you-go SKU "Weather Usage" 9DB8-727A-ACFE; free cap 10,000 events/month, then $0.15/1k up to 100k, tiered down to $0.038/1k at 5M+)`
Separate subscriptions (Starter/Essentials/Pro) bundle Weather API with pooled calls, but pay-as-you-go with the 10k free cap is the correct starting posture for Bhumi's scale (see §6 estimates — well within free tier).

### Attribution
`GOOGLE_WEATHER_ATTRIBUTION_REQUIRED = YES ("Source: Includes weather data from Google" adjacent to the data; or aggregated-custom-content rule "Includes data from Google Maps" when transformed.)`
Already implemented in the target UI section headers (verbatim strings in `app/dashboard/environment/page.tsx`).

### Cache restrictions
`GOOGLE_WEATHER_CACHE_RESTRICTIONS = Standard Maps Platform service terms apply (no documented special Weather carve-out beyond the place-ID exemption, which does not apply here). Server-side proxy response cache of 15–30 min is the standard reasonable-freshness pattern; final cache TTL must be validated against the service terms accepted at key activation time.`

### Production suitability
`GOOGLE_WEATHER_PRODUCTION_SUITABLE = YES (subject to key activation + server-side proxy + attribution + accepted terms).`

## 2. Google Air Quality API audit (source: Google for Developers, fetched 2026-09-13)

### Endpoint for current conditions
`POST https://airquality.googleapis.com/v1/currentConditions:lookup?key=KEY`
(body: `{ location: { latitude, longitude }, extraComputations: [...], languageCode: "id" }`)

### Required product output
- AQI value + category: supported (Universal AQI `uaqi` always available; local index via `LOCAL_AQI` extra computation).
- Dominant pollutant: supported (`pollutants[]` with `code`, `concentration`, and dominant flag; PM2.5/PM10/O3/NO2/SO2/CO all covered).
- Health recommendations: supported (research-backed, per sensitivity group).

### Indonesia coverage
`GOOGLE_AIR_QUALITY_INDONESIA_COVERAGE = YES (100+ countries at 500x500m resolution; Indonesia explicitly listed)`
`LOCAL_AQI_AVAILABLE = YES — code idn_menlhk (Indonesia Ministry of Environment and Forestry index), listed for country ID alongside can_ec, deu_uba, fra_atmo, gbr_defra, usa_epa, usa_epa_nowcast.`
Source: https://developers.google.com/maps/documentation/air-quality/coverage (ID row) and /laqis (idn_menlhk definition pages).

### Pollutants / index
`AQI_INDEX = idn_menlhk (primary, Indonesia-local) with usa_epa/uaqi as universal fallback`
`POLLUTANTS_AVAILABLE = co, no2, o3, pm10, pm25, so2 (per idn_menlhk pollutant list)`
UI policy per Founder: show AQI + category + dominant pollutant only; raw per-pollutant table stays internal (dashboard mirror already consumes only summary).

### Billing / attribution
`BILLING_REQUIRED = YES (SKU "Air Quality Usage" 90A9-B3FA-4A12; free cap 10,000 events/month, then $5.00/1k up to 100k, tiered down to $0.25/1k at 5M+)`
`ATTRIBUTION_REQUIRED = YES (same Maps attribution family: Google Maps logo/text or "Includes data from Google Maps" for transformed content.)`
Already implemented in the KUALITAS UDARA section (`Includes data from Google Maps`).

### Production suitability
`PRODUCTION_SUITABLE = YES (subject to same proxy + terms conditions as Weather).`

## 3. Target Build 110 Environment model (provider mapping)

```text
LOCATION              = Device GPS + BigDataCloud (KEEP_LIVE, verified 200)
SUN_MOON              = Local astronomy-engine (KEEP_LIVE, offline)
TEMPERATURE           = Google Weather API via server proxy (PLANNED, not active)
HUMIDITY              = Google Weather API via server proxy (PLANNED, not active)
WIND                  = Google Weather API via server proxy (PLANNED, not active)
PRESSURE              = Google Weather API via server proxy (PLANNED, not active)
UV_INDEX              = Google Weather API via server proxy (PLANNED, not active)
AIR_QUALITY           = Google Air Quality API via server proxy (PLANNED, not active)
EARTH_ACTIVITY        = USGS (KEEP_LIVE, verified 200)
GEOMAGNETIC_ACTIVITY  = NOAA SWPC (KEEP_LIVE, verified 200)
SCHUMANN              = REMOVED (permanent)
VOLCANIC              = REMOVED (permanent)
```

Until proxy activation, TEMPERATURE/HUMIDITY/WIND/PRESSURE/UV/AIR_QUALITY render
only from the deterministic local-QA preview fixture (localhost, QA-gated) or stay
hidden in production — never as permanent "Data tidak tersedia" cards.

## 4. Open-Meteo status (unchanged)

`OPEN_METEO_PRODUCTION_CALLS = 0`. The free endpoints remain fail-closed in production
via `lib/environment/openMeteoGate.ts`. Nothing in this plan restores or falls back to
Open-Meteo.

## 5. Secure provider architecture (DESIGNED, NOT DEPLOYED)

```text
SECURE_PROVIDER_ARCHITECTURE = SERVER_PROXY_VIA_NEXT_API_ROUTES_WITH_FIREBASE_AUTH
```

Design (mirrors the existing, already-reviewed `app/api/humandesign/calculate/route.ts` pattern):

1. Two new Next.js API routes (NOT yet created — design only, pending authorization):
   - `POST /api/environment/weather` — accepts `{ latitude, longitude }`, validates
     numeric ranges, verifies Firebase Auth ID token (or AppCheck) exactly like the HD
     route, enforces in-memory per-IP rate limiting (same `RATE_LIMIT_MAX_REQUESTS`
     shape), calls `weather.googleapis.com/v1/currentConditions:lookup` with a
     server-side-only key, strips everything except the whitelisted product fields,
     returns `{ status, weather: {...}, observedAt, attribution }` with `Cache-Control: no-store`.
   - `POST /api/environment/air-quality` — same shape, calls
     `airquality.googleapis.com/v1/currentConditions:lookup` with `languageCode: "id"`
     and `LOCAL_AQI` extra computation, returns `{ status, aqi, aqiStandard:
     "idn_menlhk", aqiCategory, dominantPollutant, observedAt, attribution }`.
2. API key storage: Google Cloud secret / server environment variable ONLY
   (e.g. `GOOGLE_MAPS_PLATFORM_API_KEY`, server runtime). NEVER in any
   `NEXT_PUBLIC_*` variable, NEVER in the client bundle, NEVER in git/logs/screenshots.
   Key restricted in Google Cloud Console by HTTP-referrer/IP + API-method scope
   (Weather + Air Quality only).
3. Client changes on activation (later, separate authorized task): replace the QA-preview
   branch with `fetch('/api/environment/weather' | '/api/environment/air-quality')`
   carrying the Firebase ID token; response feeds the SAME already-built
   `weatherLive`/`aqiLive`-gated section components (no UI redesign needed).
4. No backend deploy happens under this plan. The routes above are a design contract
   only; creating them + choosing the key-management mechanism requires explicit
   Founder authorization per the standing "no backend deploy" rule.

Production Fuer conformance notes:
- HTTPS-only (Google requires HTTPS for keyed requests) — satisfied by the existing
  Vercel/Capacitor transport.
- Exponential backoff + anti-synchronization: proxy adds jitter to scheduled refreshes
  and retries 4xx/5xx with backoff (per Google web-service best practices); client never
  calls Google directly.
- No unrestricted credentials in `NEXT_PUBLIC_*` config — current local-QA env builder
  (`scripts/qa/build110-local.mjs`) already strips `GOOGLE_*`/`NEXT_PUBLIC_*` keys, and
  the preview fixture contains zero real API URLs or keys (asserted in test 7.6c).

## 6. Cost / quota audit (estimates, pre-activation)

Assumptions: Weather refresh 30 min + AQI refresh 60 min per active user-day is the
upper bound; with the planned server proxy a per-(user, rounded-coordinate) response
cache collapses repeat opens into ~1 upstream call per interval per active area.
Conservative model below assumes 2 weather + 1 AQI upstream calls per DAU-day
(without area-level dedup — worst case).

| DAU | Weather calls/day | Weather calls/month | AQI calls/day | AQI calls/month |
|---|---|---|---|---|
| 100 | 200 | ~6,000 | 100 | ~3,000 |
| 1,000 | 2,000 | ~60,000 | 1,000 | ~30,000 |
| 10,000 | 20,000 | ~600,000 | 10,000 | ~300,000 |

Pricing (pay-as-you-go, per official price list fetched 2026-09-13):
- Weather Usage: free 10,000/mo; $0.15/1k to 100k; $0.12/1k to 500k; $0.09/1k to 1M.
- Air Quality Usage: free 10,000/mo; $5.00/1k to 100k; $4.00/1k to 500k.

```text
ESTIMATED_WEATHER_CALLS = 100 DAU: ~6k/mo ($0 — inside free cap) / 1k DAU: ~60k/mo (~$7.50) / 10k DAU: ~600k/mo (~$64)
ESTIMATED_AQI_CALLS = 100 DAU: ~3k/mo ($0 — inside free cap) / 1k DAU: ~30k/mo (~$100) / 10k DAU: ~300k/mo (~$1,300)
FREE_USAGE_THRESHOLD = 10,000 events/month per SKU (each SKU counted separately)
ESTIMATED_COST_RISK = LOW at current scale (both SKUs inside free caps up to ~150 combined DAU-days);
  AQI dominates cost above free tier (~33x Weather per call) — the hourly (not 15-min) AQI
  refresh and area-level proxy caching are the cost controls. Final numbers must be
  re-validated in Cloud Billing budgets/alerts at activation time.
```

Google's web-service best-practices inputs applied: no synchronized fixed-clock polling
(jittered proxy refreshes), exponential backoff on failure, and HTTPS-only keyed calls — all
designed into the proxy contract above.

## 7. UI rule (implemented on localhost)

Grouping implemented in `app/dashboard/environment/page.tsx`:
- CUACA (Suhu / Kelembapan / Angin / Tekanan / UV) — renders only when `weatherLive`.
- KUALITAS UDARA (AQI + category + dominant context) — renders only when `aqiLive`.
- BUMI & ANTARIKSA (Sun/Moon + Aktivitas Bumi + Aktivitas Geomagnetik) — always present
  (Sun/Moon compute locally); Earth/Geomagnetic cards individually conditional.
- Lokasi shown once as context header.
- Single degraded-state message when Earth Activity AND Geomagnetic both fail.
- Google attribution strings present in both provider sections.

## 8. Localhost preview

`LOCALHOST_ENVIRONMENT_PREVIEW = deterministic QA fixture (Jakarta representative values) with explicit on-page "Pratinjau lokal QA" banner; fixture module throws outside local-QA mode; contains zero real API URLs/keys.`
`LOCALHOST_URL = http://127.0.0.1:3001/dashboard/environment`

Fixture success is NOT presented as production connectivity evidence — the fixture
self-identifies as synthetic, and test 7.6c asserts the module can never execute in
production.

## 9. Activation gate (explicitly NOT done here)

Activation requires, in order, explicit Founder authorization for each:
1. Google Cloud project + billing enablement for Weather + Air Quality SKUs.
2. Server-side key creation with referrer/IP + API-scope restrictions.
3. Implementation of the two proxy routes (separate task, mirrors HD route pattern).
4. Billing budgets/alerts in Cloud Console.
5. Removal of the QA-preview branch dependency (keep the module — it stays
   QA-gated for future layout reviews).

```text
BUILD110_CAN_PROCEED_TO_RELEASE = NO
```
