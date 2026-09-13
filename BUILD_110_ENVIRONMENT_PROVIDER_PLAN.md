# Build 110 — Environment Provider Recovery Plan (RESEARCH + ARCHITECTURE ONLY)

Status: `PROVIDER_RESEARCH_COMPLETE_ARCHITECTURE_DESIGNED_ACTIVATION_BLOCKED`
Activation requires explicit Founder authorization (key provisioning + backend deploy).
Nothing in this document activates any paid API, creates any charge, deploys any
backend, exposes any credential, or changes any version/release artifact.

Founder decision (supersedes the earlier Google-provider draft in git history):
Google Weather / Google Air Quality are NOT activated. Free production-capable
providers are preferred where legally permitted.

```text
ENVIRONMENT_PROVIDER_PLAN = WEATHERAPI_COM_VIA_PROXY (+ OPENWEATHER_FALLBACK_CANDIDATE)
GOOGLE_WEATHER_CALLS = 0 (not activated)
GOOGLE_AQI_CALLS = 0 (not activated)
WEATHER_FIELDS_RECOVERABLE = YES (via WeatherAPI.com, server-side proxy — pending authorization)
AQI_RECOVERABLE = YES (via WeatherAPI.com ?aqi=yes, server-side proxy — pending authorization)
USGS = KEEP_LIVE
NOAA = KEEP_LIVE
BIGDATACLOUD = KEEP_LIVE
SUN_MOON = KEEP_LIVE (local astronomy-engine)
SCHUMANN = SR1-ONLY-IF-LIVE-VERIFIED (SchumannResonanceLive; endpoint currently unreachable — hidden until live verification passes)
VOLCANIC = REMOVED
OPEN_METEO_PRODUCTION_CALLS = 0 (unchanged, fail-closed)
SUNGEO_PRODUCTION_CALLS = 0 (non-commercial without explicit permission — never use)
```

## 1. WeatherAPI.com audit — PRIMARY weather + AQI (source: weatherapi.com, fetched 2026-09-13)

### Free plan terms (pricing page)
- 100,000 calls/month free. Quota resets midnight 1st UTC; over-quota → data stops for the month (fail-closed by provider).
- Commercial use: YES (explicit Yes on Free tier). Attribution: link-back required for Free users —
  `Powered by <a href="https://www.weatherapi.com/" title="Weather API">WeatherAPI.com</a>`.
- Realtime data updates every 10–15 min. Free: 3-day forecast, 1-day marine, limited alerts, limited AQI, Search/Astronomy/IP Lookup included.

### Required fields — all in Realtime API (`/current.json?q=lat,lon&aqi=yes`)

| Product field | API response field | Status |
|---|---|---|
| temperature | `current.temp_c` | SUPPORTED |
| feels-like | `current.feelslike_c` | SUPPORTED |
| relative humidity | `current.humidity` (%) | SUPPORTED |
| sea-level pressure | `current.pressure_mb` | SUPPORTED |
| wind speed | `current.wind_kph` | SUPPORTED |
| wind direction | `current.wind_degree` + `wind_dir` | SUPPORTED |
| wind gust | `current.gust_kph` | SUPPORTED |
| UV index | `current.uv` | SUPPORTED |
| weather condition | `current.condition.text` + `code` | SUPPORTED |
| cloud cover | `current.cloud` (%) | SUPPORTED |
| precipitation | `current.precip_mm` | SUPPORTED |

### AQI fields (`?aqi=yes`; Free = "Limited" = realtime only, no history)
- Pollutant concentrations (μg/m3): `co`, `o3`, `no2`, `so2`, `pm2_5`, `pm10` — all SUPPORTED.
- `us-epa-index` (1–6: Good → Hazardous) — SUPPORTED.
- `gb-defra-index` (1–10) — SUPPORTED.
- NO Indonesian MENLHK index is supplied. UI policy: label provider AQI as
  "Indeks US-EPA (standar provider)" and never as MENLHK. (Asserted in test 7.6b.)

### Coverage
All countries worldwide, any lat/lon geo-point (official FAQ). Indonesia covered.

### Billing / attribution / caching
- `WEATHER_FREE_COMMERCIAL = YES` / `WEATHER_MONTHLY_LIMIT = 100,000 calls` /
  `WEATHER_ATTRIBUTION = link-back "Powered by WeatherAPI.com" (implemented verbatim in UI)`.
- Key passed as `key=` query param → must live server-side only (proxy design §5).
- Update cadence 10–15 min realtime → 30–60 min proxy cache is comfortably within
  freshness policy; no restrictive cache prohibition found in reviewed terms.

### Production suitability
`WEATHERAPI_PRODUCTION_SUITABLE = YES (subject to key provisioning + server-side proxy + attribution + accepted terms).`

## 2. OpenWeather audit — FALLBACK candidate only (NOT activated, NOT verified)

- Intended fallback: Current Weather + Air Pollution API (pollutants CO/NO/NO2/O3/SO2/NH3/PM2.5/PM10 per Founder findings).
- The openweathermap.org pricing/API docs pages are JS-rendered and could not be
  verified programmatically from this environment — NO free-call figure, NO license
  term, and NO endpoint contract is claimed as verified in this document.
- Policy: do NOT activate both providers simultaneously. OpenWeather stays a
  documented fallback candidate; activating it (even for evaluation) requires
  separate Founder authorization after manual verification of its current pricing page.

## 3. Target Build 110 Environment model (provider mapping)

```text
LOCATION              = Device GPS + BigDataCloud (KEEP_LIVE, verified 200)
SUN_MOON              = Local astronomy-engine (KEEP_LIVE, offline)
TEMPERATURE           = WeatherAPI.com via server proxy (PLANNED, not active)
HUMIDITY              = WeatherAPI.com via server proxy (PLANNED, not active)
WIND                  = WeatherAPI.com via server proxy (PLANNED, not active)
PRESSURE              = WeatherAPI.com via server proxy (PLANNED, not active)
UV_INDEX              = WeatherAPI.com via server proxy (PLANNED, not active)
AIR_QUALITY           = WeatherAPI.com ?aqi=yes via server proxy, us-epa-index (PLANNED, not active)
EARTH_ACTIVITY        = USGS (KEEP_LIVE, verified 200)
GEOMAGNETIC_ACTIVITY  = NOAA SWPC (KEEP_LIVE, verified 200)
SCHUMANN SR1          = SchumannResonanceLive IF live verification passes (currently UNREACHABLE — hidden)
VOLCANIC              = REMOVED (permanent)
```

Until proxy activation, TEMPERATURE/HUMIDITY/WIND/PRESSURE/UV/AIR_QUALITY render
only from the deterministic local-QA preview fixture (localhost, QA-gated) or stay
hidden in production — never as permanent "Data tidak tersedia" cards.

## 4. Schumann SR1 policy + reliability gate (implemented in code, currently failing closed)

Provider: `https://schumannresonancelive.com/api/data.php` (stated: JSON, no key, CC0, 90-s cache, SR1 from Tomsk SOS-70).

### Live verification results (this environment, 2026-09-13)
```text
SCHUMANN_HTTP_STATUS = UNREACHABLE (fetch failed / transport error — endpoint not reachable from this network; distinct from the earlier 404 observed 2026-09-06)
SCHUMANN_CONTENT_TYPE = UNKNOWN (no response received)
SCHUMANN_TIMESTAMP = MISSING (no response received)
SCHUMANN_SR1_PRESENT = NO
SCHUMANN_SR1_MEASURED = NO
SCHUMANN_LICENSE = CC0 (per provider statement — NOT independently verified, no response received)
SCHUMANN_STALE_THRESHOLD = 30 min (SCHUMANN_STALE_THRESHOLD_MS)
```

### Gate outcome
Because no live response could be obtained, the Schumann live card stays HIDDEN
(fail-closed) in production. The data-integrity gate is implemented as pure,
unit-tested logic in `lib/environment/schumannLiveGate.ts` (19 checks pass):
- `live:true` requires HTTP 2xx + JSON content-type + parseable timestamp +
  measured SR1 + fresh timestamp, all simultaneously.
- Nominal/reference SR2–SR5 slots can never pass as measured.
- 7.83 appears only as the labelled nominal fundamental, never as a live value.
- No health/spiritual/energy-portal/sleep claims are generated anywhere in the path.

Production UI currently contains NO Schumann card at all; the localhost QA preview
shows the TARGET Schumann SR1 card layout with an explicit simulation banner.
The live card will only appear in production after a successful live verification
run from an environment with provider reachability.

## 5. Secure provider architecture (DESIGNED, NOT DEPLOYED)

```text
SECURE_PROVIDER_ARCHITECTURE = SERVER_PROXY_VIA_NEXT_API_ROUTES_WITH_FIREBASE_AUTH
```

Design (mirrors the existing, already-reviewed `app/api/humandesign/calculate/route.ts` pattern):

1. One new Next.js API route (NOT yet created — design only, pending authorization):
   - `POST /api/environment/weather-aqi` — accepts `{ latitude, longitude }`,
     validates numeric ranges, verifies Firebase Auth ID token (or AppCheck)
     exactly like the HD route, enforces in-memory per-IP rate limiting,
     calls `api.weatherapi.com/v1/current.json?key=SERVER_KEY&q=lat,lon&aqi=yes&lang=id`
     with a server-side-only key, strips everything except the whitelisted product
     fields (temp_c, feelslike_c, humidity, pressure_mb, wind_kph, wind_degree,
     wind_dir, gust_kph, uv, condition.text/code, cloud, precip_mm, air_quality.*),
     returns `{ status, weather: {...}, airQuality: {...}, observedAt, attribution }`
     with `Cache-Control: no-store` on the outer response (caching happens in the
     proxy keyed by rounded coordinates + 30–60 min TTL).
2. API key storage: server environment variable ONLY (e.g. `WEATHERAPI_KEY`,
   server runtime). NEVER in any `NEXT_PUBLIC_*` variable, NEVER in the client
   bundle, NEVER in git/logs/screenshots. (Asserted: `weatherApiGate.ts` contains
   no `NEXT_PUBLIC_*` variable and no hardcoded key — test-guarded.)
3. Client changes on activation (later, separate authorized task): replace the QA-preview
   branch with `fetch('/api/environment/weather-aqi')` carrying the Firebase ID token;
   response feeds the SAME already-built `weatherLive`/`aqiLive`-gated section
   components (no UI redesign needed).
4. No backend deploy happens under this plan. Creating the route + provisioning the key
   requires explicit Founder authorization per the standing "no backend deploy" rule.

Additional conformance notes:
- HTTPS-only keyed calls — satisfied by existing transport.
- Anti-synchronization + backoff: proxy adds jitter to refreshes; WeatherAPI's own
  over-quota behavior (stop serving until reset) is itself fail-closed, and the UI
  degrades to hiding the CUACA/AQI sections (never fabricated values).
- The local-QA env builder (`scripts/qa/build110-local.mjs`) already strips
  `NEXT_PUBLIC_*` keys; the preview fixture contains zero real API URLs/keys
  (asserted in test 7.6c).

## 6. Cost / quota audit (estimates, pre-activation)

WeatherAPI.com realtime updates every 10–15 min → 30–60 min proxy cache per
rounded-coordinate bucket. One `/current.json&aqi=yes` call serves BOTH weather and
AQI (single provider, simplest architecture — no dual-provider doubling).

| DAU | Upstream calls/day (2/user/day worst case, no dedup) | Upstream calls/month | Free quota 100k/mo |
|---|---|---|---|
| 100 | 200 | ~6,000 | inside (6%) |
| 1,000 | 2,000 | ~60,000 | inside (60%) |
| 10,000 | 20,000 | ~600,000 | EXCEEDS ~6x |

```text
ESTIMATED_WEATHER_AQI_CALLS = 100 DAU: ~6k/mo / 1,000 DAU: ~60k/mo / 10,000 DAU: ~600k/mo (worst case, no area dedup)
FREE_USAGE_THRESHOLD = 100,000 calls/month (combined weather+AQI since single endpoint call)
ESTIMATED_COST_RISK = NONE at current scale (single combined call keeps usage ~17x lower than the
  old dual-Google design: ~$0 at 100 and 1,000 DAU; at 10,000 DAU either area-level proxy
  caching, reduced refresh, or the $7/mo Starter plan (3M calls) covers it — Founder decision then).
```

## 7. UI rule (implemented on localhost)

Grouping in `app/dashboard/environment/page.tsx`:
- CUACA (Suhu / Kelembapan / Angin / Tekanan / UV) — renders only when `weatherLive`,
  with `Powered by WeatherAPI.com` attribution.
- KUALITAS UDARA (AQI us-epa-index + category; NO MENLHK label) — renders only when
  `aqiLive`, with `Powered by WeatherAPI.com` attribution.
- BUMI & ANTARIKSA (Sun/Moon + Aktivitas Bumi + Aktivitas Geomagnetik) — as before.
- RESONANSI SCHUMANN (QA preview only): SR1 card + nominal-fundamental note; in
  production this section renders nothing until the live gate passes.
- Lokasi shown once as context header.
- Single degraded-state message when Earth Activity AND Geomagnetic both fail.

## 8. Localhost preview

`LOCALHOST_ENVIRONMENT_PREVIEW = deterministic Jakarta QA fixture (WeatherAPI-shaped
values + us-epa AQI + simulated SR1 slot) with explicit on-page "Pratinjau lokal QA"
banner; fixture modules throw outside local-QA mode; zero real API URLs/keys.`
`LOCALHOST_URL = http://127.0.0.1:3001/dashboard/environment`

Fixture success is NOT presented as production connectivity evidence — the fixture
self-identifies as synthetic, and tests assert the preview modules can never execute
in production.

## 9. Activation gate (explicitly NOT done here)

Activation requires, in order, explicit Founder authorization for each:
1. WeatherAPI.com account + Free-plan key provisioning.
2. Server-side key storage + implementation of the single proxy route.
3. Quota monitoring (usage vs 100k cap with alert margin).
4. Live Schumann verification re-run from a network with provider reachability
   (only then may the SR1 live card appear; SR2–SR5 stay nominal-only forever).

```text
BUILD110_CAN_PROCEED_TO_RELEASE = NO
```
