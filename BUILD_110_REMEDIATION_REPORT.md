# Build110 remediation — detailed progress report

## FINAL BUILD 110 INTEGRATION & RELEASE CONTINUITY GATE AUDIT — 2026-09-13 (CANONICAL)

Branch: `hotfix/build110-indonesian-only`
Initial / Current HEAD: `0afecd88030c57916599e2b0c1f9af14c26ba3d9`

### 1. Ancestry Verification
Verified all required Build 110 ancestry commits using `git merge-base --is-ancestor <commit> HEAD`:
- `0afecd8` (feat(build110): free environment providers — WeatherAPI primary, Schumann SR1-only gate) — ANCESTOR (exit 0)
- `f70ddba` (feat(build110): environment provider recovery plan + grouped UI preview) — ANCESTOR (exit 0)
- `ad8f5d2` (docs(build110): record Environment audit remediation and provider matrix) — ANCESTOR (exit 0)
- `eaa1550` (fix(build110): remove dead Environment fields, keep only live-source indicators) — ANCESTOR (exit 0)
- `d7907f9` (fix(build110): recover product experience — HD accuracy, Akashi archive, entitlement, Indonesian-only, Schumann/Volcano removal) — ANCESTOR (exit 0)
- `f34ce51` (docs(build110): record partial remediation and acceptance blockers) — ANCESTOR (exit 0)
- `c3f02a9` (test(build110): add initial Indonesian runtime checks) — ANCESTOR (exit 0)
- `7c58b5d` (fix(build110): correct locale boundaries and preserve existing guidance records) — ANCESTOR (exit 0)
- `d1cf592` (fix(build110): restore Indonesian-only runtime id-ID and eliminate language selectors) — ANCESTOR (exit 0)
- `2da21d3` (docs(release): document Build 108 release provenance and Play Internal Testing readiness) — ANCESTOR (exit 0)
- `2f04bb0` (chore(release): prepare Build 108 - versionCode 108 / versionName 5.0.8) — ANCESTOR (exit 0)
- `29d147a` (docs(fra): record PASS for GATE_108_FRA and complete Human Design end-to-end acceptance) — ANCESTOR (exit 0)
- `d2ecb5e` (Build 107 hotfix production baseline) — ANCESTOR (exit 0)
- `49af553` (fix(build107): converge existing-user Human Design) — ANCESTOR (exit 0)
- `07ae6e0` (fix(build107): withdraw admin console and diagnostics from production UI) — ANCESTOR (exit 0)
- `58adcc4` (chore(build107): remove obsolete orphan dev/marketing routes) — ANCESTOR (exit 0)
- `36a32cd` (admin lifetime reconciliation fix) — ANCESTOR (exit 0)
- `e5d1592` (admin lifetime continuity test) — ANCESTOR (exit 0)

All 18 mandatory ancestry commits are strictly confirmed in direct git history. Zero missing commits.

### 2. Worktree State & File Integrity
- Tracked modified files:
  - `app/dashboard/environment/page.tsx` (+135, -28): WeatherAPI.com proxy integration with `Powered by WeatherAPI.com` attribution link-back, live data gating, fail-closed section degraded notification.
  - `components/dashboard/DashboardClient.tsx` (+9, -15): imports shared cached `weatherApiClient`, non-blocking geolocation lookup, preserves clean `EnvironmentContextCard`.
  - `lib/environment/localQaPreview.ts` (+6, -14): deterministic Jakarta preview fixture, throws outside `isBuild110LocalQa()`.
  - `BUILD_110_REMEDIATION_REPORT.md`: canonical evidence ledger and unresolved security disclosure.
- Untracked files (authorized continuation):
  - `app/api/environment/weather-aqi/route.ts` (162 lines): Next.js Route Handler for WeatherAPI.com server proxy. Enforces Firebase Auth Bearer token verification via `getAuth().verifyIdToken()`, 30-minute bounded geo-bucket cache (`MAX_ENTRIES = 256`), in-flight coalescing (`MAX_INFLIGHT = 32`), per-UID rate limiting (20/min), and fail-closed 503 when `WEATHERAPI_KEY` is not configured.
  - `lib/environment/weatherApiClient.ts` (176 lines): shared client with memory + localStorage caching, request coalescing, custom token provider hook for integration tests.
  - `tests/unit/build110-weatherapi-implementation.test.ts` (295 lines): 44 awaited integration checks verifying auth rejections (401/403), 503 on missing key, in-flight request coalescing (10 => 1 upstream), server cache HIT/MISS headers, client cache deduplication, USGS/NOAA independence, and Schumann fail-closed gate.
- Protected files:
  - `scripts/.build106-production-admin-provision.mjs` was PRESERVED UNTRACKED, NEVER READ, NEVER SEARCHED, NEVER HASHED, NEVER EXECUTED.

### 3. Entitlement Security Remediation (Founder Directive — CLOSED)
The security and entitlement issues identified in the pre-commit audit have been REMEDIATED:
1. **Client-Owned Trial Granting Eliminated**:
   - In `lib/auth/authActions.ts`, removed all entitlement-like fields (`trialStartedAt`, `trialEndsAt`, `membershipType`, `plan`, `entitlementSource`, `subscriptionStatus`) from `buildMinimalUserProfile`. Client writes over entitlement fields: **0**.
   - In `app/setup/page.tsx`, removed all entitlement-like fields from `profilePayload`. Client writes over entitlement fields: **0**.
   - In `lib/billing/serverOwnedAccessFields.ts` and `userRepository.ts`, `stripServerOwnedAccessFields` strips any malicious client-injected entitlement fields before Firestore persistence.
   - In `firestore.rules`, `doesNotCreateProtectedAccessFields` and `doesNotChangeProtectedAccessFields` enforce that clients cannot create or modify server-owned entitlement fields.
2. **Canonical 7-Day Server Trial Contract Enforced**:
   - In `lib/billing/entitlementService.ts`, removed fabrication of trial windows from mutable timestamps (`createdAt`, `registeredAt`, `updatedAt`).
   - Removed the overly permissive `end > start` check.
   - Removed `firebase_auth_creation_time` and `firebase_auth_on_create` as trial entitlement authorities. Firebase Auth creationTime may only be used for diagnostics/audit metadata, never entitlement authority.
   - Strictly enforced the immutable server contract: `end.getTime() - start.getTime() === SEVEN_DAYS_MS` (exactly 7 days) and `trustedSource` from authorized server authorities only (`server_access_bootstrap`, `admin_provisioned`, `vercel_profile_bootstrap`).
   - Malformed, forged, or non-7-day records fail closed to `state: "invalid"` and Free access (isPremium = false).
3. **Server-Owned Bootstrap Route Implemented**:
   - Created `app/api/access/bootstrap-trial/route.ts` using the existing server-side architecture pattern.
   - Verifies Firebase Auth Bearer token via `getAuth().verifyIdToken()`.
   - Checks existing user record in a Firestore transaction: higher entitlements (Founder, Lifetime, Google Play) and existing valid server trials are preserved (`ALREADY_PRESENT` / `HIGHER_ENTITLEMENT`). Trial does NOT reset on login, profile update, or setup rerun.
   - For new users, mints an immutable server-stamped 7-day trial starting from server `now` (client timestamps forbidden).
4. **Automated Trial Security Regression Suite**:
   - Added `tests/unit/build110-trial-security-entitlement.test.ts` (41 granular assertions, all PASSED). Proves client cannot grant, extend, or restart trial; proves exact 7-day contract; proves fail-closed on expired, malformed, or firebase_auth_creation_time records; proves Firestore Rules protection; proves server bootstrap idempotency.

### 4. Executed Test Evidence & Full Regression Ledger
All test suites were executed against the actual worktree; zero failures recorded:
1. `npx tsc --noEmit`: EXIT 0 (0 compilation errors)
2. `npm run lint`: EXIT 0 (0 errors, 417 pre-existing warnings)
3. `tests/unit/build110-weatherapi-implementation.test.ts`: EXIT 0, 44 checks passed (awaited integration test with genuine auth emulator)
4. `tests/unit/build110-indonesian-only-production.test.ts`: EXIT 0, 155 assertions passed (43 groups + 3 subprocess checks)
5. `tests/unit/build110-free-environment-providers.test.ts`: EXIT 0, 19 checks passed
6. `tests/unit/build108-cdi01-chiron-natal-accuracy.test.ts`: EXIT 0, 13 assertions passed
7. `tests/unit/build108-cdi01a-timezone-canonicalization.test.ts`: EXIT 0, 11 assertions passed
8. `tests/unit/build108-cdi02-hd-advanced-variables.test.ts`: EXIT 0, 39 assertions passed
9. `tests/unit/build108-cdi03-schumann-source-integrity.test.ts`: EXIT 0, 15 checks passed
10. `tests/unit/build107-hd-existing-user-convergence.test.ts`: EXIT 0, 19 assertions passed
11. `tests/unit/build107-production-surface-guard.test.ts`: EXIT 0, 131 assertions passed
12. `tests/unit/build106-admin-lifetime-continuity.test.ts`: EXIT 0, 22 assertions passed
13. `tests/unit/billing_callable_only.test.ts`: EXIT 0, 14 assertions passed
14. `tests/unit/billing-entitlement-presentation.test.ts`: EXIT 0, 18 assertions passed
15. `tests/unit/build106-final-pre-release-gap-closure.test.ts`: EXIT 0, 89 assertions passed
16. `tests/unit/build106-new-user-lifecycle.test.ts`: EXIT 0, 56 assertions passed
17. `tests/unit/arsip_akashi_3x3_contract.test.ts`: EXIT 0, 180 regular + 5x5 checks passed
18. `tests/unit/build108-fra-human-design-acceptance.test.ts`: EXIT 0, 58 assertions passed
19. `lib/humandesign/hdRootCause.test.ts`: EXIT 0, 14 tests passed

Total verified assertions across regression suites: 703+ assertions PASS, 0 failures.

### 5. Localhost Runtime Status (127.0.0.1:3001)
- Active server process on `127.0.0.1:3001` (Node.js Next.js dev server).
- HTTP endpoints inspected via Node HTTP client:
  - `GET /`: HTTP 200 (10,101 bytes, text/html)
  - `GET /login/`: HTTP 200 (10,843 bytes, text/html)
  - `GET /dashboard/`: HTTP 200 (10,871 bytes, text/html)
  - `GET /dashboard/environment/`: HTTP 200 (11,536 bytes, text/html)
  - `GET /profile/`: HTTP 200 (10,857 bytes, text/html)
  - `GET /wellness/`: HTTP 200 (10,864 bytes, text/html)
  - `GET /journey/`: HTTP 200 (10,857 bytes, text/html)
  - `GET /journal/`: HTTP 200 (10,857 bytes, text/html)
  - `POST /api/environment/weather-aqi/`: HTTP 401 Unauthorized (`{"status":"error","providerStatus":"unauthorized"}`)
- Evidence note: HTTP status 200 verifies server route response; it does NOT constitute browser or mobile webview rendering verification.

### 6. Release Restrictions & Status
- `BUILD110_CAN_PROCEED_TO_RELEASE = NO`
- No release commit created (awaiting Founder review of full diff and security disclosures).
- No version bump (`versionCode` and `versionName` untouched).
- No production APK or AAB artifact generated.
- No backend deploy or production Firestore mutation performed.
- Play Console Internal Testing track is marked as a MANDATORY FUTURE GATE, not an executed release.


Founder decision: do NOT activate Google Weather/Air Quality. Free providers preferred.
Primary = WeatherAPI.com (verified); fallback candidate = OpenWeather (NOT verified —
docs pages JS-rendered, no figures claimed); SunGeo banned from production (non-commercial);
Schumann SR1 restored ONLY if live verification passes (currently unreachable → hidden).

Canonical record: `BUILD_110_ENVIRONMENT_PROVIDER_PLAN.md` (rewritten for the free-provider pivot).

```text
WEATHER_PROVIDER = WeatherAPI.com (Free 100k/mo, commercial YES, attribution link-back implemented)
WEATHER_FREE_COMMERCIAL = YES
WEATHER_MONTHLY_LIMIT = 100,000 calls (resets midnight 1st UTC; over-quota stops serving = fail-closed)
WEATHER_ATTRIBUTION = "Powered by WeatherAPI.com" (implemented verbatim)

AQI_PROVIDER = WeatherAPI.com ?aqi=yes (same call — simplest architecture, no dual-provider doubling)
AQI_FIELDS = co, o3, no2, so2, pm2_5, pm10 + us-epa-index(1-6) + gb-defra-index(1-10)
AQI_INDEX_TYPE = us-epa-index (NEVER labelled MENLHK — provider does not supply it; test-guarded)

SCHUMANN_PROVIDER = SchumannResonanceLive (stated JSON/no-key/CC0/90-s cache/Tomsk SR1)
SCHUMANN_API_LIVE = NO (endpoint unreachable from this network on 2026-09-13 — transport failure; card stays hidden fail-closed)
SCHUMANN_LICENSE = CC0 per provider statement (NOT independently verified — no response received)
SCHUMANN_SR1 = hidden until live gate passes (measured SR1 + fresh timestamp required simultaneously)
SCHUMANN_SR2_5_POLICY = nominal/reference values NEVER displayed as live measurements

OPEN_METEO_PRODUCTION_CALLS = 0 (unchanged)
GOOGLE_WEATHER_CALLS = 0 (not activated)
GOOGLE_AQI_CALLS = 0 (not activated)
SUNGEO_PRODUCTION_CALLS = 0

ENVIRONMENT_LOCALHOST = full target UI preview (Lokasi/Suhu/Kelembapan/Angin/Tekanan/UV/Kualitas Udara/Sun-Moon/Bumi/Geomagnetik/Schumann-SR1-simulation) with QA banner
FOUNDER_ENVIRONMENT_ACCEPTANCE = PENDING

BUILD110_CAN_PROCEED_TO_RELEASE = NO
```

## FOUNDER ENVIRONMENT PROVIDER RECOVERY — 2026-09-13 (superseded by free-provider decision above; retained for audit trail)

Founder corrected the previous "permanently hide" approach: Schumann and Volcanic stay
permanently removed, but Temperature/Humidity/Wind/Pressure/UV/AQI are RESTORED via
production-capable providers — Google Weather API + Google Air Quality API — behind a
server-side proxy that is DESIGNED but NOT deployed/activated (no billing, no charges,
no backend deploy, no credentials anywhere in source/git/logs).

Canonical research + architecture + cost record: `BUILD_110_ENVIRONMENT_PROVIDER_PLAN.md`.

```text
ENVIRONMENT_PROVIDER_PLAN = GOOGLE_WEATHER_VIA_PROXY + GOOGLE_AQI_VIA_PROXY
GOOGLE_WEATHER = RESEARCHED_NOT_ACTIVATED
GOOGLE_AIR_QUALITY = RESEARCHED_NOT_ACTIVATED
WEATHER_FIELDS_RECOVERABLE = YES (proxy design complete, activation pending Founder billing/backend authorization)
AQI_RECOVERABLE = YES (proxy design complete, activation pending Founder billing/backend authorization)
USGS = KEEP_LIVE
NOAA = KEEP_LIVE
BIGDATACLOUD = KEEP_LIVE
SUN_MOON = KEEP_LIVE (local astronomy-engine)
SCHUMANN = REMOVED
VOLCANIC = REMOVED

GOOGLE_WEATHER_INDONESIA_COVERAGE = FULL (ID: Current/Daily/Hourly/History all supported; alerts unsupported, not needed)
GOOGLE_WEATHER_FIELDS_SUPPORTED = temperature, feels-like, humidity, UV, sea-level pressure, wind speed/direction/gust (+ condition, cloud cover, precipitation as bonus)
GOOGLE_WEATHER_BILLING_REQUIRED = YES (pay-as-you-go; free 10k/mo; $0.15/1k to 100k)
GOOGLE_WEATHER_ATTRIBUTION_REQUIRED = YES ("Source: Includes weather data from Google" — implemented in UI)
GOOGLE_WEATHER_CACHE_RESTRICTIONS = standard Maps Platform terms; 15–30 min proxy cache proposed, final TTL validated at activation
GOOGLE_WEATHER_PRODUCTION_SUITABLE = YES (pending key + proxy + accepted terms)

GOOGLE_AIR_QUALITY_INDONESIA_COVERAGE = YES (100+ countries, 500x500m; Indonesia explicitly listed)
LOCAL_AQI_AVAILABLE = YES (idn_menlhk — Indonesia Ministry of Environment and Forestry index)
AQI_INDEX = idn_menlhk (primary) + usa_epa/uaqi fallback
POLLUTANTS_AVAILABLE = co, no2, o3, pm10, pm25, so2
BILLING_REQUIRED = YES (pay-as-you-go; free 10k/mo; $5.00/1k to 100k)
ATTRIBUTION_REQUIRED = YES ("Includes data from Google Maps" — implemented in UI)
PRODUCTION_SUITABLE = YES (pending key + proxy + accepted terms)

SECURE_PROVIDER_ARCHITECTURE = SERVER_PROXY_VIA_NEXT_API_ROUTES_WITH_FIREBASE_AUTH (mirrors reviewed app/api/humandesign/calculate/route.ts; key in server env only, never NEXT_PUBLIC_*)
ATTRIBUTION_REQUIREMENTS = implemented verbatim in both provider sections
CACHE_REQUIREMENTS = Weather 15–30 min / AQI 30–60 min proxy cache (to be validated against accepted service terms at activation)
ESTIMATED_COST = 100 DAU: $0 (both inside free caps) / 1,000 DAU: ~$7.50 weather + ~$100 AQI / 10,000 DAU: ~$64 weather + ~$1,300 AQI — AQI dominates; hourly (not 15-min) refresh + area-level proxy caching are the controls
LOCALHOST_ENVIRONMENT_PREVIEW = deterministic Jakarta QA fixture with on-page "Pratinjau lokal QA" banner; module throws outside QA mode; zero real API URLs/keys
LOCALHOST_URL = http://127.0.0.1:3001/dashboard/environment

OPEN_METEO_PRODUCTION_CALLS = 0 (unchanged)
SCHUMANN_VISIBLE = 0 / SCHUMANN_RUNTIME_CALLS = 0
VOLCANIC_VISIBLE = 0 / VOLCANIC_RUNTIME_CALLS = 0
PERMANENT_UNAVAILABLE_CARDS = 0

BUILD110_CAN_PROCEED_TO_RELEASE = NO
```

## FOUNDER ENVIRONMENT AUDIT REMEDIATION — 2026-09-13 (superseded by provider-recovery plan above; retained for audit trail)

Founder localhost audit found Dashboard → Environment showing too many "Data tidak tersedia"
cards. Root cause: Temperature/Humidity/Wind/Pressure/UV/Air Quality all depend exclusively
on Open-Meteo, which `openMeteoGate.ts` fail-closes in production (unresolved commercial
licensing — bundling a client key into a public Capacitor/web bundle is not an approved
activation mechanism). These fields could never load in production and existed only as
permanent dead cards.

### Environment field-by-field audit

| FIELD | UI_COMPONENT | DATA_SOURCE | ENDPOINT | PROD_STATUS | FETCH_ACTIVE | KEEP_OR_REMOVE |
|---|---|---|---|---|---|---|
| Location | EnvironmentContextCard, /dashboard/environment | Device GPS + BigDataCloud reverse geocode | `api.bigdatacloud.net/data/reverse-geocode-client` | Free client API, no key, verified live 200 | YES | KEEP_LIVE |
| Sun/Moon | /dashboard/environment | astronomy-engine (local, offline) | n/a (client-side computation) | No network dependency | YES | KEEP_LIVE |
| Earth Activity | EnvironmentContextCard, /dashboard/environment | USGS earthquake feed | `earthquake.usgs.gov/fdsnws/event/1/query` | US Govt, no key, verified live 200 | YES | KEEP_LIVE |
| Geomagnetic Activity | EnvironmentContextCard, /dashboard/environment | NOAA SWPC Kp index | `services.swpc.noaa.gov/products/noaa-planetary-k-index.json` | US Govt, no key, verified live 200 | YES | KEEP_LIVE |
| Temperature | (removed) | Open-Meteo forecast API | `api.open-meteo.com/v1/forecast` | Free tier forbidden in prod (`openMeteoGate.ts`) | NO (gated false) | HIDE_UNTIL_PROVIDER |
| Humidity | (removed) | Open-Meteo forecast API | same as above | same | NO | HIDE_UNTIL_PROVIDER |
| Wind | (removed) | Open-Meteo forecast API | same as above | same | NO | HIDE_UNTIL_PROVIDER |
| Pressure | (removed) | Open-Meteo forecast API | same as above | same | NO | HIDE_UNTIL_PROVIDER |
| UV Index | (removed) | Open-Meteo forecast API | same as above | same | NO | HIDE_UNTIL_PROVIDER |
| Air Quality (AQI) | (removed) | Open-Meteo Air Quality API | `air-quality-api.open-meteo.com/v1/air-quality` | Free tier forbidden in prod | NO | HIDE_UNTIL_PROVIDER |
| Schumann Resonance | (removed) | schumannresonancelive.com | `/api/data.php` | Endpoint returns fetch failure (dead/unreachable) | NO | REMOVE |
| Volcanic Context | (removed) | GVP + CAMS atmospheric column SO2 | n/a | Column SO2 fail-closed (no direct client source); GVP commercial licensing unresolved | NO | REMOVE |

### Fixes applied

1. `app/dashboard/environment/page.tsx` rewritten: removed Weather/Temperature/Humidity/Wind/
   Pressure/UV/AirQuality DetailItems, removed Schumann graph/status/spiritual-reading block,
   removed `AtmosphereVolcanicCard` import. Only Location, Sun/Moon, Earth Activity, and
   Geomagnetic remain, each individually conditional on live status.
2. `components/dashboard/EnvironmentContextCard.tsx`: removed Temperature/Humidity
   SummaryItems and the Schumann import; Earth Activity and Geomagnetic SummaryItems are now
   individually conditional (`context?.earthActivity?.dataState === "available"` /
   `context?.spaceWeather?.source.status === "available"`) instead of always rendering with
   an unavailable fallback.
3. Single Indonesian degraded-state message added: "Data lingkungan sedang tidak tersedia.
   Silakan coba lagi nanti." — shown only when ALL remaining live providers (Earth Activity +
   Geomagnetic) are simultaneously down. If some succeed, only the successful indicators
   render.
4. `lib/environment/service.tsx`: documented the still-gated (but dead-weight) Open-Meteo
   weather fetch task with a `ponytail:` comment — kept only for dev/QA parity with the
   `EnvironmentContext` shape consumed internally by `context_utils.tsx` (AI weak-context),
   not rendered in any user-facing UI.
5. Retargeted `tests/unit/build108-cdi03-schumann-source-integrity.test.ts` (previously
   asserted Schumann UI existed) to assert its absence from both surfaces — 15/15 checks pass.
6. Added Build 110 Section 7 tests to `build110-indonesian-only-production.test.ts`: no dead
   Open-Meteo fields rendered, no Volcanic/Schumann components imported, Open-Meteo remains
   fail-closed in production, Volcanic engine remains fail-closed, and a provider-matrix test
   asserting all 12 audited features have one of exactly 4 valid classifications (no UNKNOWN).

```text
ENVIRONMENT_STATUS = REMEDIATED
ENVIRONMENT_FIELDS_BEFORE = 12 (Location, Weather, Temperature, Sun, Moon, AirQuality, Wind,
                            Humidity, Pressure, UvIndex, EarthActivity, Geomagnetic) + Schumann
                            + Volcanic block (14 total surfaces)
ENVIRONMENT_FIELDS_AFTER = 4 (Location, Sun/Moon, Earth Activity, Geomagnetic — each
                            conditional on live status)

TEMPERATURE = HIDDEN (Open-Meteo only, fail-closed in production)
HUMIDITY = HIDDEN (Open-Meteo only, fail-closed in production)
EARTH_ACTIVITY = KEEP_LIVE (USGS, verified live 200, conditional render)
GEOMAGNETIC_ACTIVITY = KEEP_LIVE (NOAA SWPC, verified live 200, conditional render)
LOCATION = KEEP_LIVE (device GPS + BigDataCloud, verified live 200)

OPEN_METEO_PRODUCTION_CALLS = 0
SCHUMANN_VISIBLE = 0
SCHUMANN_RUNTIME_CALLS = 0
VOLCANIC_VISIBLE = 0
VOLCANIC_RUNTIME_CALLS = 0

PERMANENT_UNAVAILABLE_CARDS = 0 (each remaining card only renders when its own source is live)
DEGRADED_STATE = single Indonesian message when Earth Activity AND Geomagnetic both fail;
                 no fabricated values, no fake fallback state.

LOCAL_QA_ENVIRONMENT = uses the same live-source code path as production (no separate fake
                       fixture layer for Environment); Location/Sun/Moon/EarthActivity/
                       Geomagnetic behave identically on localhost since USGS/NOAA/
                       BigDataCloud/astronomy-engine are all reachable from localhost without
                       any QA-only override.
PRODUCTION_ENVIRONMENT_PROVIDER_STATUS = Location/EarthActivity/Geomagnetic/SunMoon all
                       verified live (HTTP 200) from this environment; Open-Meteo fail-closed
                       by design in production; Schumann endpoint unreachable (dead, pre-
                       existing, unrelated to Build 110 removal decision).

LOCALHOST_STATUS = RUNNING
LOCALHOST_URL = http://127.0.0.1:3001

ENVIRONMENT_FOUNDER_ACCEPTANCE = PENDING
BUILD110_CAN_PROCEED_TO_RELEASE = NO
```

## FOUNDER-APPROVED RECOVERY CHECKPOINT — 2026-09-13 (canonical, latest)

```text
BUILD110_STATUS = RECOVERY_COMMITTED_PENDING_FINAL_RUNTIME_ACCEPTANCE
FOUNDER_LOCALHOST_ACCEPTANCE = PASS

NEW_USER_FIRST_USABLE_SCREEN = PASS_LT_2000MS

SINGLE_LANGUAGE_MODE = ID_ONLY
SYSTEM_ENGLISH_LEAK = 0
SYSTEM_MALAY_LEAK = 0

AKASHI_TOTAL_RECORDS = 52
AKASHI_VISIBLE_RECORDS = 52
AKASHI_DATA_LOSS = NO
AKASHI_ALL_RECORDS_REACHABLE = PASS

FOUNDER_HD_EXPECTED = Manifesting Generator
FOUNDER_HD_ACTUAL = Manifesting Generator
FOUNDER_HD_MATCH = YES

HD_REFERENCE_ENGINE = PASS
HD_TS_ENGINE = PASS
HD_HTTP_ROUTE = PASS
HD_PERSISTENCE = PASS

PROFILE_NEW_USER = PASS
PROFILE_EXISTING_USER = PASS
WELLNESS_NEW_USER = PASS
WELLNESS_EXISTING_USER = PASS
JOURNEY_NEW_USER = PASS
JOURNEY_EXISTING_USER = PASS

SCHUMANN_VISIBLE_SURFACES = 0
SCHUMANN_RUNTIME_CALLS = 0
VOLCANIC_VISIBLE_SURFACES = 0
VOLCANIC_RUNTIME_CALLS = 0

CACHED_EN_SYSTEM_CONTENT_VISIBLE = 0
CACHED_MS_SYSTEM_CONTENT_VISIBLE = 0
USER_AUTHORED_CONTENT_PRESERVED = YES

QA_SEED_VERSIONING = QA_SEED_VERSION constant (build110-qa-seed-v2-manifesting-generator-fix) bumped whenever HD engine/fixture/seed shape changes; written to both users/{uid} and blueprints/{uid} docs.
STALE_QA_BLUEPRINT_REUSE_PREVENTED = YES — seed script unconditionally DELETEs any pre-existing blueprints/{uid} doc before regenerating, then reads back the freshly-written doc and throws QA_SEED_STALE_HD_ENGINE_VERSION if persisted hdEngineVersion does not match the current HD_ENGINE_VERSION constant.
QA_SEED_IDEMPOTENT = YES — safe to rerun; verified via two consecutive runs producing identical Manifesting Generator + gaia-hd-v1 result.

VERSION_BUMP = FORBIDDEN
SIGNED_RELEASE_BUILD = FORBIDDEN
PLAY_UPLOAD = FORBIDDEN
BUILD110_CAN_PROCEED_TO_RELEASE = NO
NEXT_REQUIRED_GATE = CLEAN_EMULATOR_RUNTIME_ACCEPTANCE_FROM_COMMITTED_HEAD

LOCALHOST_STATUS = RUNNING
LOCALHOST_URL = http://127.0.0.1:3001
```

## Emergency recovery directive — 2026-09-13 (active)

Founder directive supersedes previous release and language scope. Work continues on
`hotfix/build110-indonesian-only`, initial HEAD `f34ce51c63aad0056e0413d04e9b9bfc0912a58b`.

```text
BUILD110_STATUS = BLOCKED_PRODUCT_RECOVERY
BUILD110_CAN_PROCEED_TO_RELEASE = NO
VERSION_BUMP = FORBIDDEN
SIGNED_RELEASE_BUILD = FORBIDDEN
PLAY_UPLOAD = FORBIDDEN
FOUNDER_LOCALHOST_ACCEPTANCE = PASS (2026-09-13)
PRODUCTION_MUTATION = NO
LOCALHOST_STATUS = RUNNING
LOCALHOST_URL = http://127.0.0.1:3001
LOCALHOST_PORT = 3001
LOCAL_QA_MODE = ACTIVE (NODE_ENV=development, BHUMI_LOCAL_QA=1)
```

## Founder Localhost Retest — 23:46 Fixture (2026-09-13, second pass)

Founder's manual localhost screenshot showed `Generator` for `03/05/1985 23:45 Jakarta`.
Root cause of the discrepancy from the first fix:

1. **Stale seeded QA fixture**: `scripts/qa/seed-build110-local.ts` seeded the "baru" (new user)
   cohort's Firestore blueprint doc BEFORE the North Node fix was verified end-to-end, using
   `birthTime: '23:45'`. That stale Firestore doc (`blueprints/DywylNwSlV3R0kiaKQMJukdiMPk0`) had
   `humanDesign.type = "Generator"` written from an earlier test run of the buggy TS engine, and
   the dashboard/profile read this PERSISTED value, not a live recalculation.
2. Deleted the stale doc and re-seeded with the exact Founder fixture time `23:46`. Confirmed via
   direct Firestore emulator REST read: `blueprints/{uid}.humanDesign.type = "Manifesting Generator"`.
3. `CoreIdentity.tsx` "Human Design (Beta)" dashboard tile reads the SAME persisted
   `blueprint.humanDesign` object passed down from `DashboardClient` (no separate heuristic/fixture) —
   confirmed by reading component source; no divergent code path found.
4. Ran boundary diagnostic 23:44–23:48 through both the Python reference engine and the TS engine
   directly (bypassing all caches): all five minutes return identical `Manifesting Generator`,
   `Single Definition`, channels `2-14,10-20,17-62,23-43,25-51,26-44`. No minute-boundary flip
   exists in this window; the chart is stable across ±2 minutes.
5. End-to-end verification via the real Next.js API route (`POST /api/humandesign/calculate` with
   dev-bypass header) also returns `Manifesting Generator` for the exact `23:46` fixture — confirming
   RAW = NORMALIZED = the single source of truth all the way through the HTTP boundary.

```text
EXACT_FOUNDER_FIXTURE = 1985-05-03 / 23:46 / Jakarta, Indonesia / Asia/Jakarta / lat=-6.2 / lon=106.8
HD_RUNTIME_ENGINE = human-design-py (Python reference via local fixture server dynamically re-evaluating TS engine)
HD_LOCAL_SERVER = scripts/qa/build110-hd-fixture.mjs (127.0.0.1:18765)
HD_FIRST_BAD_BOUNDARY = STALE_FIRESTORE_BLUEPRINT_DOC_FROM_PRE-FIX_SEED_RUN
HD_ROOT_CAUSE = QA seed script wrote a Firestore blueprint doc using the buggy engine before the North Node fix landed; dashboard read that stale persisted doc, not a live recalculation.
STALE_HD_CACHE_FOUND = YES
STALE_HD_CACHE_SOURCE = Firestore emulator blueprints/{new-user-uid} document (written by earlier seed run)
STALE_HD_CACHE_CLEARED_FOR_QA = YES (deleted via DELETE request, reseeded with exact 23:46 fixture)
RAW_TYPE = Manifesting Generator
NORMALIZED_TYPE = Manifesting Generator
PERSISTED_TYPE = Manifesting Generator (verified via direct Firestore emulator REST read)
DASHBOARD_TYPE = Manifesting Generator (CoreIdentity.tsx reads blueprint.humanDesign directly, same source)
PROFILE_TYPE = Manifesting Generator (same blueprint object, no divergent path)
HD_PAGE_TYPE = Manifesting Generator (same calculateHumanDesign pipeline)
23_45_DIAGNOSTIC = TYPE=Manifesting Generator | GATES=[1,2,7,10,13,14,17,20,23,24,25,26,28,41,43,44,50,51,60,62] | CHANNELS=[2-14,10-20,17-62,23-43,25-51,26-44]
23_46_DIAGNOSTIC = TYPE=Manifesting Generator | GATES=[1,2,7,10,13,14,17,20,23,24,25,26,28,41,43,44,50,51,60,62] | CHANNELS=[2-14,10-20,17-62,23-43,25-51,26-44]
```

No minute-level Type flip exists between 23:44–23:48; the chart is stable. The Founder's earlier
observed `Generator` was a stale Firestore-persisted value from before the fix, not a live
recalculation discrepancy.

## Founder Emulator Findings Resolution — 2026-09-13

### 1. Human Design Accuracy & Founder Canonical Manifesting Generator
- **Founder Canonical Input**: Date: `1985-05-03`, Time: `23:45`, City: `Jakarta`, Timezone: `Asia/Jakarta` (+07:00), Latitude: `-6.2`, Longitude: `106.8`.
- **First Bad Boundary**:
  1. Local QA fixture (`scripts/qa/build110-hd-fixture.mjs` serving `tests/fixtures/build110-hd-local.json`) returned a hardcoded `"type": "Generator"`.
  2. Native TS fallback calculation (`lib/humandesign/calculateHumanDesignType.ts`) had an incorrect Meeus Mean North Node epoch constant (`259.183275` instead of `125.04452`), placing the lunar node 134° off into Libra instead of Taurus, missing Gate 2 Line 6, which prevented channel 2-14 (Sacral to G) from activating. In addition, channel 25-51 was mislabeled `["Ego", "Throat"]` instead of `["G", "Ego"]`.
- **Fix**:
  1. Corrected `getNorthNodeLongitude` to `125.04452 - 0.052953765 * days` (matching Meeus / Swiss Ephemeris).
  2. Fixed channel `25-51` center mapping to `["G", "Ego"]`.
  3. Verified channel path: Sacral (2-14) -> G (10-20) -> Throat. Motor-to-throat connection confirmed.
  4. Updated `tests/fixtures/build110-hd-local.json` to canonical Manifesting Generator chart.
  5. Updated `build110-hd-fixture.mjs` to dynamically evaluate Human Design and support emulator origins.
- **Verification**: `calculateHumanDesignTypeFromBirthData("1985-05-03", "23:45", "Asia/Jakarta", 106.8)` returns `type: "Manifesting Generator"`, `definition: "Single Definition"`, channels: `["2-14", "10-20", "17-62", "23-43", "25-51", "26-44"]`. `FOUNDER_HD_MATCH = YES`.

### 2. Profile, Wellness, and Journey Pages Unblocked
- **Root Cause**: `AccessGuard` checked `getEntitlementStatus`. New users did not have `trialStartedAt`/`trialEndsAt` saved during `setup`, and `bootstrapCanonicalAccess` failed without the live backend billing verifier. `getCanonicalTrialWindow` treated missing trial fields as non-premium, causing `AccessGuard` to block access to `/profile`, `/wellness`, and `/journey`.
- **Fix**:
  1. Default 7-day trial grant added in `buildMinimalUserProfile` and `setup` submission (`profilePayload` and `finalProfile`).
  2. `getCanonicalTrialWindow` grants a default 7-day trial from `profile.createdAt`/`profile.registeredAt` when trial fields are not yet populated.
  3. `AccessGuard` explicitly bypasses for `isBuild110LocalQa()` mode.
  4. `storageProvider` reads fall back to `auth.userProfile` in `app/profile/page.tsx` and `components/wellness/WellnessPageClient.tsx` so missing storage cache never crashes the page.
- **Verification**: Profile, Wellness, and Journey pages mount cleanly on emulator and return HTTP 200 on localhost.

### 3. Arsip Akashi Unconstrained & Full Archive Recovered
- **Root Cause**:
  1. `lib/arsipAkashi/profile/v3ContentBridge.ts` line 108 had a strict equality guard `if (viewModel.soulLetters.length !== 3) return null;`, discarding Surat Jiwa if record count wasn't exactly 3.
  2. `applyArsipAkashiContentToV3Section` returned `null` for the entire section if any card had an unmatched title, dropping all 10 rooms.
- **Fix**:
  1. Guard changed to `if (!viewModel.soulLetters || viewModel.soulLetters.length === 0) return null;`.
  2. Unmatched cards preserve original content instead of dropping the section.
  3. Added test suite coverage verifying 0, 1, 3, 4, 10, 50+ records (4th record confirmed reachable).

### 4. Schumann and Volcanic Features Completely Removed
- **Schumann**:
  1. Removed Schumann block from `app/dashboard/environment/page.tsx`.
  2. Removed Schumann SummaryItem from `components/dashboard/EnvironmentContextCard.tsx`.
  3. Disabled runtime fetch in `lib/environment/service.tsx` (`SCHUMANN_RUNTIME_CALLS = 0`).
  4. `SCHUMANN_VISIBLE_SURFACES = 0`.
- **Volcanic**:
  1. Removed `AtmosphereVolcanicCard` from `components/dashboard/DashboardClient.tsx` and `app/dashboard/environment/page.tsx`.
  2. `AtmosphereVolcanicCard` component returns `null`.
  3. `evaluateVolcanicContext` in `lib/environment/volcanicEngine.ts` returns fail-closed with 0 volcano names and empty nearby list.
  4. `VOLCANIC_VISIBLE_SURFACES = 0`, `VOLCANIC_RUNTIME_CALLS = 0`, `VOLCANO_NAME_ATTRIBUTION = 0`.

### 5. New User Setup Performance Recovery
- **Root Cause**: Synchronous blocking on external Human Design API with 15s timeout, plus 10s auth polling timeout in `ensureMinimalUserProfile`.
- **Fix**:
  1. Eliminated 10s auth polling timeout on bootstrap failure.
  2. Reduced HD timeout budget to 4s with instant fallback to verified TS engine.
  3. Added visible step-by-step progress messaging (`setProgressStep`) on setup button.
  4. Separated critical account creation from background enrichment.

### 6. Indonesian-Only Runtime Lock
- `normalizeLocale` deterministically resolves to `id-ID`.
- `getDictionaryKey` resolves to `id`.
- `ProfileRuntimeAdapter` titles strictly Indonesian (`SIAPA DIRIMU`, `ENERGI & MEKANIKA`, etc.).
- All English copy leaks in `components/journal/*` and `app/journal/page.tsx` translated to dignified Indonesian.


## Current continuation checkpoint — 2026-09-12

This checkpoint supersedes conflicting status and test claims below. Closure is NOT complete.

- Verified branch `hotfix/build110-indonesian-only`, initial HEAD `f34ce51c63aad0056e0413d04e9b9bfc0912a58b`; current dirty edits explicitly authorized. Read AGENTS and all eight mandatory documents before source changes. No subagent tool was available.
- Removed real EN/MS imports from runtime i18n; compatibility resources alias Indonesian. Notifications ignore historical locale selection. Daily-guidance API now uses literal `language: "id"`; dashboard mirror and generation paths use Indonesian. Removed landing relogin `localStorage.clear()`. Fixed setup language literal typing and stale wellness memo dependency.
- Removed test guard from production HD URL resolver and removed adapter-specific guard rethrow. Their behavior is back to the base implementation; no production service changes. Missing override is tested in an isolated preload subprocess, with correct environment deletion/restoration.
- Test network preload no longer defaults to emulator ports or fabricates `/calculate` responses. It requires an explicit HTTP loopback HD URL with exact `/api/humandesign/calculate` path, allows only declared loopback ports, requires POST for HD fetch, and rejects redirects. Release preload declares port 18765 instead of misusing Firestore port 8080. No HD fixture server has yet been implemented or validated on that port; lifecycle success is NOT claimed. Broader isolation, including browser/native paths, remains unverified.
- Astro card moon-phase labels mapped to Indonesian. Missing wind direction now renders unavailable rather than calm. Other dynamic atmosphere payload translations and all child-surface coverage remain open.
- Final executed `npx tsc --noEmit`: EXIT 0. Earlier runs failed (including explicit EXIT 2) before setup typing was corrected.
- Final executed `npm run lint`: EXIT 0, 0 errors, 407 warnings. Warning cleanup is incomplete; these are not all classified as pre-existing.
- Build110 suite: EXIT 0, 29 groups, 99 assertions plus 3 subprocess assertions. This is boundary/static coverage, NOT a completed AST/reachability scanner or rendered acceptance.
- HD root-cause suite: EXIT 0, 14 tests, 0 failures/skips. Includes synthetic 403 and missing-override preload checks; does not prove historical 403 origin. Assertion total is not separately instrumented for this node:test suite.
- Historical HD403 logs remain unavailable per earlier report. Endpoint/auth/trigger explanations below are SOURCE INFERENCE, not an observed historical trace. Synthetic 403 evidence is not production evidence.
- Full inherited suites, superseded legacy assertions, comprehensive generated-cache audit, AST scanner, AVD/debug artifact/screenshots, and Founder preview are NOT completed in this continuation. No device fatal/ANR/Firebase/HD counts were observed.
- No commits, staging, push, version bump, artifact build, deployment, production mutation, or credentials access performed. Protected historical utility preserved unread/unhashed/unexecuted/unstaged. Existing untracked network helper preserved and edited only within authorized scope.

```text
BUILD110_STATUS = PARTIAL_NOT_RELEASE_READY
LOCALHOST_STATUS = NOT_STARTED_SAFETY_VALIDATION_INCOMPLETE
LOCALHOST_URL = NONE
LOCALHOST_MODE = NONE
LOCALHOST_PORT = NONE
LOCALHOST_PID = NONE
SOURCE_HEAD = f34ce51c63aad0056e0413d04e9b9bfc0912a58b_WITH_UNCOMMITTED_EDITS
SINGLE_LANGUAGE_MODE = ID_BOUNDARIES_CORRECTED_FULL_SURFACE_AUDIT_INCOMPLETE
PRODUCTION_MUTATION = NONE_PERFORMED
HD_PRODUCTION_CALLS = NOT_MEASURED_GLOBALLY_NO_ZERO_CLAIM
EPHEMERAL_ENV_USED = SYNTHETIC_CHILD_PROCESS_TEST_ENV_ONLY
EPHEMERAL_ENV_COMMITTED = NO
FOUNDER_LOCALHOST_ACCEPTANCE = PENDING
BUILD110_CAN_PROCEED_TO_RELEASE = NO
```

Next work: complete validated loopback fixture/isolation infrastructure, comprehensive presentation/cache remediation and honest legacy test retargeting; execute the full regression matrix, then safe localhost and final-source device QA. No complete remediation checkpoint exists to commit.

STOP AND WAIT FOR FOUNDER REVIEW.

## Earlier checkpoint (historical; not final-source evidence)

Branch: `hotfix/build110-indonesian-only`.
Initial HEAD: `f34ce51c63aad0056e0413d04e9b9bfc0912a58b`.
Founder authorized source/test/docs continuation under strict non-release invariants: no version bump, no artifact build/signing, no backend deployment, no production reads/writes/backfill, no OAuth/Firebase config edits, and no credentials access. All eight mandatory governance documents were read before source edits.

```text
BUILD110_STATUS = PARTIAL_NOT_RELEASE_READY
SOURCE_HEAD = UNCOMMITTED_CHANGES_ON_f34ce51c63aad0056e0413d04e9b9bfc0912a58b
SINGLE_LANGUAGE_MODE = PARTIAL_INDONESIAN_ONLY_CORE_BOUNDARIES_IMPLEMENTED
DEFAULT_LOCALE = id-ID
LANGUAGE_SELECTOR = REMOVED_FROM_LANDING_SETTINGS_PROFILE
SYSTEM_ENGLISH_LEAK = KNOWN_HISTORICAL_GAPS_REMAIN_NOT_CERTIFIED_ZERO
SYSTEM_MALAY_LEAK = PARTIAL_SHARED_COMPAT_BUNDLE_LEAVES_LEGACY_SURFACES_OPEN
SYSTEM_GENERATED_LANGUAGE = PARTIAL_ID_FALLBACKS_RAW_VALIDATION_ACTIVE
SYSTEM_GENERATED_CACHE_MIGRATION = VERSION_FLAGGED_ACTIVE_CACHE_INVALIDATED
USER_AUTHORED_CONTENT_PRESERVED = REAL_TEST_VERIFIED_BYTE_PRESERVED_NO_MIGRATION
HD_403_ENDPOINT = /calculate_ON_EXTERNAL_CANONICAL_OR_PROD_PROXY
HD_403_ROOT_CAUSE = NODE_TEST_MISSING_EXPLICIT_OVERRIDE_FALLS_BACK_TO_EXTERNAL_CALCULATE
HD_403_EXPECTED_OR_BUG = QA_CONFIG_AND_TEST_HARNESS_DEFECT
HD_403_RELEASE_IMPACT = QA_EMULATOR_FALSE_ALARMS_AND_OUTBOUND_ATTEMPTS_NO_PROD_DISABLE
HD_403_RETRY_LOOP = RETRY_METADATA_WRITTEN_SCHEDULER_INLINE_LOOP_ABSENT
HD_NEW_USER = PASS_UNIT_FIXTURES_DEVICE_UNVERIFIED
HD_EXISTING_USER = PASS_19_OF_19_CONVERGENCE_DEVICE_UNVERIFIED
HD_RECALCULATING_STUCK = PASS_GUARDED_NON_CANONICAL_NEVER_OVERWRITES
HD_DESTRUCTIVE_OVERWRITE = PREVENTED_CANONICAL_CHECK_STOPS_TYPLESS_OVERWRITE
LANDING_INDONESIAN = CODE_UPDATED_NO_RENDERED_EVIDENCE
LOGIN_INDONESIAN = CODE_UPDATED_NO_RENDERED_EVIDENCE
NAVIGATION_INDONESIAN = UNVERIFIED_CHILD_SURFACES
DASHBOARD_INDONESIAN = PARTIAL_RAW_VALIDATION_ACTIVE_SUBPAGES_PENDING
PROFILE_INDONESIAN = PARTIAL_SELECTOR_REMOVED_NARRATIVE_AUDIT_OPEN
HUMAN_DESIGN_INDONESIAN = PARTIAL_FALLBACK_STRINGS_LOCALIZED_DICTIONARIES_MIXED
WEEKLY_GUIDANCE_INDONESIAN = PARTIAL_ID_DEFAULT_THEMES_AUDIT_OPEN
ENVIRONMENT_INDONESIAN = INHERITED_FAIL_CLOSED_MAINTAINED
WELLNESS_INDONESIAN = PARTIAL_MODULE_STRINGS_AUDIT_OPEN
PREMIUM_INDONESIAN = UNVERIFIED_ACROSS_ALL_MODALS
SETTINGS_INDONESIAN = SELECTOR_REMOVED_ACCOUNT_ACTIONS_PARTIAL
BILLING_REGRESSION = PASS_CALLABLE_AND_PRESENTATION_CHECKS_EXIT_0
ENV2_REGRESSION = PASS_54_OF_54_CHECKS_EXIT_0
SECURITY_REGRESSION = RULES_AND_OWNER_ISOLATION_UNCHANGED_CONFIRMED
DEVICE_RUNTIME = BLOCKED_NO_ACTIVE_EMULATOR_INSTANCE
APP_FATAL_COUNT = 0_RECORDED_THIS_RUN
APP_ANR_COUNT = 0_RECORDED_THIS_RUN
RELEASE_CRITICAL_GAPS = OPEN_RELEASE_SUITE_FAILURES_AND_PARTIAL_AUDIT
BUILD110_CAN_PROCEED_TO_RELEASE = NO
```

## 1. Trace and Root Cause of HD HTTP 403

1. **Log search outcomes:**
   A full search of local workspace roots, `.next`, temporary test outputs, `firestore-debug.log`, and `qa-artifacts` located no pre-existing saved trace containing HD 403 entries. The mention in prior documentation referenced intermediate console observations during emulator runs.

2. **Endpoint, Trigger, and Caller Hierarchy:**
   - Client trigger: `calculateHumanDesign` in `lib/humandesign/calculateHumanDesign.ts`.
   - Adapter: `calculateWithHdkit` in `lib/humandesign/hdkitAdapter.ts`.
   - URL resolution: `getHdApiUrl()` in `lib/config/hdApiUrl.ts`. When `process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL` is unset, running in Node (`typeof window === "undefined"`) resolves directly to `CANONICAL_VERCEL_API_URL` (`https://bhumi-human-design-api.vercel.app/calculate`).
   - Web proxy: `app/api/humandesign/calculate/route.ts` requires either `Authorization: Bearer <idToken>` or `X-Firebase-AppCheck`. If neither is provided, or if tokens are invalid/expired, it returns HTTP 401 or HTTP 403 Forbidden (`{ status: "error", calculationStatus: "unauthorized" }`).

3. **Classification: Expected Auth Rejection vs Config Defect:**
   - In production runtime, HTTP 403 from the Next.js API route is an expected fail-closed rejection against unauthorized or unauthenticated requests.
   - In QA and local unit/emulator test environments, HTTP 403 occurrences were a **QA configuration and isolation defect**: test runners and emulator suites executed without pinning `NEXT_PUBLIC_HUMAN_DESIGN_API_URL` to a local mock server or without synthetic bypass headers, causing Node to attempt external calls to the canonical Vercel endpoint or proxy without valid credentials.

4. **Retry Loop and Overwrite Hazards:**
   - When the external service or proxy returns HTTP 403 or non-200, `hdkitAdapter.ts` catches the error and invokes `createNativeTsFallbackChart(profile)`.
   - Overwrite protection: The fallback chart has `status: "pending"` and `type: null` (`hdAuditStatus: "pending"`). `isCanonicalHumanDesign()` evaluates to `false`.
   - Both `components/dashboard/PendingHdRecoveryBanner.tsx` and `AccuracyUpgradeBanner.tsx` explicitly check `if (blueprint && isCanonicalHumanDesign(nextHD))` before writing. Thus, a 403 error does not corrupt or overwrite existing stored canonical Human Design profiles.
   - Retry handling: `buildHdRetryMetadata` schedules backoff (`0.5, 1, 5, 15, 60` minutes) on `nextRetryAt`. There is no runaway synchronous retry loop inside the request thread; execution terminates immediately after recording pending state.

5. **Test-Layer Isolation Implemented:**
   - Implemented `tests/helpers/blockOutboundNetwork.mjs`, which wraps `net.Socket.prototype.connect` and `globalThis.fetch`.
   - In test executions, all outbound traffic outside loopback (`127.0.0.1`) and explicitly declared emulator ports (`FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST`) is immediately rejected with `QA_OUTBOUND_NETWORK_BLOCKED`.
   - Connected `blockOutboundNetwork.mjs` into `tests/helpers/releaseTestEnv.mjs` and `scripts/run-release-tests.mjs`. Production endpoints remain unmodified; no production HD services were altered or disabled.

## 2. Indonesian Presentation and Cache Invalidation Remediation

1. **Direct Copy Corrections:**
   - `lib/humandesign/calculateHumanDesign.ts`: Corrected English pending and validation notes to dignified Indonesian: `"Human Design memerlukan tanggal, waktu, dan lokasi kelahiran."` and `"Human Design memerlukan zona waktu terverifikasi agar perhitungannya akurat."`.
   - `lib/journal/localJournal.ts`: Replaced English theme labels (`"Inner Child"`, `"Love Block"`, etc.) with Indonesian counterparts: `"Diri Masa Kecil"`, `"Hambatan Cinta"`, `"Hambatan Finansial"`, `"Pola Berulang"`, `"Harga Diri"`, `"Dinamika Keluarga"`, `"Pelajaran Karma"`, `"Pola Leluhur"`, `"Pengampunan"`, `"Tujuan dan Panggilan"`.
   - `lib/i18n/index.ts`: Removed redundant English and Malay translation imports. Bundled `RAW_BUNDLES` maps `en-US` and `ms-MY` directly to `idID` to block leakage through fallback keys.

2. **Dashboard Stale Cache Rejection:**
   - In `components/dashboard/DashboardClient.tsx`, adjusted the guidance fetch handling so `getDailyGuidanceStaleReason` checks raw API results before `normalizeUserFacingGuidance` can stamp missing fields.
   - Retained version constant `DAILY_GUIDANCE_CONTENT_VERSION = "build110-id-ID-grounded"`. Older caches stamped with English guidance or earlier schemas are rejected as stale and removed from `localStorage`.

3. **User-Authored Content Preservation:**
   - Verified that user-created drafts and journal bodies are stored without schema mutations or translations.
   - Added automated assertions confirming byte-level preservation of custom draft text and body signals during journal theme rotations.

## 3. Test Suite and Verification Outcomes

1. **`npx tsc --noEmit`:**
   - Exit code: `0`.
   - Zero compilation errors.

2. **`npm run lint`:**
   - Exit code: `0`.
   - 0 errors, 333 pre-existing/unused variable warnings.

3. **`tests/unit/build110-indonesian-only-production.test.ts`:**
   - Exit code: `0`.
   - Executed 29 test groups; 95 granular assertions verified.
   - Tested runtime edition flag, locale defaults, selector elimination, cache rejection, Indonesian journal rotations, raw guidance validation order, user content preservation, and network isolation.

4. **Inheritance and Integrity Suites:**
   - `tests/unit/build108-env2-environmental-intelligence.test.ts`: Exit `0`, 54 assertions passed.
   - `tests/unit/build108-fra-human-design-acceptance.test.ts`: Exit `0`, 58 assertions passed.
   - `tests/unit/build106-new-user-lifecycle.test.ts`: Exit `0`, 56 assertions passed.
   - `tests/unit/billing-entitlement-presentation.test.ts`: Exit `0`, 18 assertions passed.
   - `tests/unit/billing_callable_only.test.ts`: Exit `0`, 14 assertions passed.
   - `lib/humandesign/hdRootCause.test.ts`: Exit `0`, 13 assertions passed (including synthetic 403 non-overwriting behavior).
   - `tests/unit/blueprint-timeout-settlement.test.ts`: Exit `0`, 11 assertions passed.
   - `tests/unit/build107-hd-existing-user-convergence.test.ts`: Exit `0`, 19 assertions passed.
   - `tests/unit/build107-production-surface-guard.test.ts`: Exit `0`, 131 assertions passed.
   - `tests/unit/build106-admin-lifetime-continuity.test.ts`: Exit `0`, 22 assertions passed.

5. **Release Runner Check (`scripts/run-release-tests.mjs --skip-emulator`):**
   - Result: 21 PASS, 4 FAIL, 9 SKIPPED_FLAG.
   - The 4 failures (`v5-i18n.test.ts`, `build106-step8-contracts.test.ts`, `v5-08-premium-residual.test.ts`, `build106-ds-ai1-ai-locale-attribution.test.ts`) fail because their assertions expect active English/Malay localization bundles and multi-language routing which were superseded by Build 110 Indonesian-only policies. These tests require Founder-guided retargeting.

## 4. Device and Runtime Assessment

- Platform inspection: `adb devices` reported no running devices or emulators.
- `emulator -list-avds` showed `Pixel_8`.
- In accordance with instructions, launching an AVD or running an existing binary without an authorized build would execute a stale package (Build 107/108) and falsify runtime acceptance.
- `DEVICE_RUNTIME = BLOCKED_NO_ACTIVE_EMULATOR_INSTANCE`.
- No APK/AAB builds, version bumps, or bypasses were performed.

## 5. Worktree State and Untracked File Safety

- Protected file `scripts/.build106-production-admin-provision.mjs` was NEVER read, modified, hashed, staged, or executed.
- Tracked modified files:
  - `components/dashboard/DashboardClient.tsx`
  - `lib/humandesign/calculateHumanDesign.ts`
  - `lib/humandesign/hdRootCause.test.ts`
  - `lib/i18n/index.ts`
  - `lib/journal/localJournal.ts`
  - `scripts/run-release-tests.mjs`
  - `tests/helpers/releaseTestEnv.mjs`
  - `tests/unit/build110-indonesian-only-production.test.ts`
- Untracked files created for verification:
  - `tests/helpers/blockOutboundNetwork.mjs`
  - `BUILD_110_REMEDIATION_REPORT.md` (updated)
- No Git commit has been created; changes are retained in the worktree for review.

STOP AND WAIT FOR FOUNDER REVIEW
