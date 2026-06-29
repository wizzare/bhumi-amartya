# MOANA-v58-ENV-2 — Environment Influence Mapping Audit Report

## 1. Ticket ID
`MOANA-v58-ENV-2`

## 2. Timestamp
`2026-06-29T09:05:00+07:00`

## 3. Branch & Commit Hash
* **Branch**: `KARA_V3_WELLNESS_STABLE`
* **Commit Hash**: `eac8065a0fe17e757432da360e665ecff1255a93`

## 4. Files Reviewed
* `lib/environment/types.ts`
* `lib/environment/provider.ts`
* `lib/dailyGuidance/timeOfDayGreeting.ts`
* `lib/dailyGuidance/normalizeUserFacingGuidance.ts`
* `lib/dailyGuidance/dashboardNoteAdapter.ts`
* `components/dashboard/SoulReflectionCard.tsx`
* `components/dashboard/DailyNoteV2.tsx`
* `components/dashboard/DashboardClient.tsx`
* `lib/services/wellnessDailyIntelligence.ts`
* `components/wellness/WellnessPageClient.tsx`
* `lib/engines/dailyGuidanceEngine.ts`
* `lib/prompts/dailyGuidancePrompt.ts`

## 5. Environment Features Found in Code
1. `timeWindow` (`night`, `morning`, `afternoon`, `evening`) — **EXISTING** (via ENV-1).
2. `environmentWindowKey` (`YYYY-MM-DD-window`) — **EXISTING** (via ENV-1).
3. `temperatureCelsius` / `feelsLikeCelsius` — **AVAILABLE** in types (`EnvironmentWeather`).
4. `humidityPercent` — **AVAILABLE** in types (`EnvironmentWeather`).
5. `weather condition` — **AVAILABLE** in types (`EnvironmentWeather`).
6. `rainProbabilityPercent` / `cloudCoverPercent` — **AVAILABLE** in types (`EnvironmentWeather`).
7. `windSpeedKph` — **AVAILABLE** in types (`EnvironmentWeather`).
8. `uvIndex` — **AVAILABLE** in types (`EnvironmentAirQuality`).
9. `airQuality` (`aqi`, `pm25`, `pm10`) — **AVAILABLE** in types (`EnvironmentAirQuality`).
10. `moon` (`phase`, `illuminationPercent`) — **AVAILABLE** in types & Astro engine.
11. `astronomy` (`sunrise`, `sunset`) — **AVAILABLE** in types (`EnvironmentAstronomy`).
12. `location` (`cityOrRegency`, `timezone`) — **AVAILABLE** in types & profile.

## 6. Actual 8 Parts of Refleksi Jiwa Found in Code/UI
1. **Card Title** (`"Refleksi Jiwa"`) — `SoulReflectionCard.tsx` — Static header. Env Influence: NONE.
2. **Card Subtitle** (`"Mirror"`) — `SoulReflectionCard.tsx` — Static subtitle. Env Influence: NONE.
3. **Context Label** (`"Membaca jiwamu hari ini"`) — `SoulReflectionCard.tsx` — Sub-header label. Env Influence: NONE.
4. **Opening Greeting** — `normalizeUserFacingGuidance.ts` (`getTimeAwareGreeting`) — Dynamic time-aware greeting prefix. Env Influence: **EXISTING** (Time Window aware).
5. **Reflection Core Body** — `dailyGuidanceEngine.ts` / `soulReflectionText` — AI generated synthesis of blueprint and journey. Env Influence: **MISSING** (Context passed but prompt does not mandate explicit environmental tone synthesis).
6. **Sign-off** (`"Peluk hangat dari Bhumi."`) — `normalizeUserFacingGuidance.ts` — Warm companion sign-off. Env Influence: NONE.
7. **Companion Closing Prompt** — `normalizeUserFacingGuidance.ts` (`getTimeAwareClosing`) — Dynamic companion question/reflection prompt. Env Influence: **EXISTING** (Time Window aware).
8. **Expansion Cue / Action** (`"Renungkan perlahan."` / `"Baca Selengkapnya"`) — `SoulReflectionCard.tsx` — Interactive UI toggle. Env Influence: NONE.

## 7. Actual 8 Parts of Catatan Hari Ini Found in Code/UI
1. **Kabar Harimu** (`general` category) — `dashboardNoteAdapter.ts` (`Compass` icon) — Core daily overview. Env Influence: **MISSING**.
2. **Pikiran** (`mental` category) — `dashboardNoteAdapter.ts` (`Brain` icon) — Mental processing & focus. Env Influence: **MISSING**.
3. **Rasa Aman & Rezeki** (`finance` category) — `dashboardNoteAdapter.ts` (`Wallet` icon) — Groundedness & stability. Env Influence: **MISSING**.
4. **Hati** (`love` category) — `dashboardNoteAdapter.ts` (`Heart` icon) — Emotional resonance. Env Influence: **MISSING**.
5. **Orang Terdekat** (`relational` category) — `dashboardNoteAdapter.ts` (`Users` icon) — Social dynamics. Env Influence: **MISSING**.
6. **Makna Batin** (`spiritual` category) — `dashboardNoteAdapter.ts` (`Sparkles` icon) — Inner meaning & sync. Env Influence: **MISSING**.
7. **Yang Lagi Berat** (`challenges` category) — `dashboardNoteAdapter.ts` (`ShieldAlert` icon) — Friction detector. Env Influence: **MISSING**.
8. **Ruang Baru** (`opportunities` category) — `dashboardNoteAdapter.ts` (`Sprout` icon) — Opportunity reader. Env Influence: **MISSING**.
*(Plus Header `Hai {firstName}...` and Closing `Pesan Penutup buat Kamu` via `dailyNoteText`)*.

## 8. Current Environment Influence Status
* **Time Window**: **EXISTING** (Refleksi Jiwa greeting/closing and Wellness Section 3).
* **Environmental Signals (Weather/UV/Air Quality/Moon)**: **MISSING** on Dashboard cards (Refleksi Jiwa core body and Catatan Hari Ini categories do not visibly reflect local environmental conditions).

## 9. Mapping Table: Environment → Refleksi Jiwa
| Environment Feature | Best Refleksi Jiwa Part | Influence Type | Reason | Existing/Missing | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Time Window** | Opening Greeting & Closing Prompt | Time-aware greeting & recap/start orientation | Sets daily rhythm context (pagi/siang/sore/malam) | **EXISTING** | Low |
| **Moon Phase** | Reflection Core Body | Emotional cycle & reflective tone | Moon phase provides archetypal resonance for inner growth | **MISSING** | Low |
| **Weather / Rain / Cloud** | Reflection Core Body | Atmosphere & mood grounding | Rainy/cloudy weather invites inward reflection | **MISSING** | Low |
| **Temperature / Heat** | Companion Closing Prompt | Pacing & physical presence reminder | High heat calls for slowing down and self-compassion | **MISSING** | Low |

## 10. Mapping Table: Environment → Catatan Hari Ini
| Environment Feature | Best Catatan Hari Ini Part | Influence Type | Reason | Existing/Missing | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Time Window** | Kabar Harimu (`general`) & Pesan Penutup (`closing`) | Orientation & energy recap | Frame focus based on time of day | **MISSING** | Low |
| **UV Index / Heat** | Yang Lagi Berat (`challenges`) & Saran | Physical pacing & body care advice | High UV/heat introduces physical friction and energy drain | **MISSING** | Medium |
| **Air Quality** | Pikiran (`mental`) & Ruang Baru (`opportunities`) | Environment grounding & indoor space focus | Poor air quality suggests indoor practices and breath awareness | **MISSING** | Medium |
| **Weather Condition (Rain/Storm)** | Hati (`love`) & Makna Batin (`spiritual`) | Emotional containment & quiet grounding | External weather reflects internal emotional atmosphere | **MISSING** | Low |

## 11. Mapping Table: Environment → Wellness
| Wellness Section | Current Influence | Missing Influence | Recommended Mapping |
| :--- | :--- | :--- | :--- |
| **Section 2: Pemetaan & Navigator** | **EXISTING** (Moon phase in astro context) | Weather/UV/Air quality environmental signals | Feed weather & air quality into Navigator recovery/growth mode |
| **Section 3: Recommended Today** | **EXISTING** (6-hour time window orientation note) | Outdoor vs Indoor practice suggestion based on UV/Rain/Air Quality | Adapt practice intensity and indoor/outdoor tag |
| **Section 4: Innerwork Practice** | **EXISTING** (Practice selection by issue & energy) | Environmental adaptation in practice execution steps | Suggest hydration or gentle indoor pacing when heat/UV high |

## 12. Dashboard Visibility Assessment
* **Current Reality**: Environment context is fetched and passed to `dailyGuidanceRepository` and `memoryContext`, but its manifestation on the Dashboard is subtle and mostly hidden within prompt inputs.
* **Why Invisible**: Refleksi Jiwa and Catatan Hari Ini prompt templates do not explicitly instruct Gemini to reference weather/atmosphere or local environmental conditions in the human-facing text.

## 13. Cache / 6-Hour Refresh Assessment
* **Finding**: Currently, `localCacheKey` in `DashboardClient.tsx` uses `dailyGuidance:${uid}:${today}` (daily date key).
* **Impact**: Because the local storage key is daily, opening the app in the afternoon or evening re-uses the morning cached `DailyGuidance` object!
* **Recommendation**: Updating the cache key or stale check to include `environmentWindowKey` (`YYYY-MM-DD-window`) will allow guidance to dynamically refresh across 6-hour windows without breaking historical daily records.

## 14. Gaps Found
1. Daily Guidance cache key uses daily `dateKey` instead of `environmentWindowKey`.
2. AI prompts in `dailyGuidancePrompt.ts` do not explicitly guide Gemini to synthesize environmental signals into Catatan Hari Ini categories.
3. Environment provider (`provider.ts`) returns `not_configured` for weather/UV APIs in Phase 1 (mock/fallback data handling needed).

## 15. Recommended Next Implementation Tickets
1. **MOANA-v58-ENV-3**: Cache Key Alignment (`environmentWindowKey` integration in `DashboardClient.tsx` local storage cache).
2. **MOANA-v58-ENV-4**: Prompt Synthesis Enrichment (Add light environmental grounding rules to `dailyGuidancePrompt.ts`).

## 16. Files Changed
* `MOANA_v58_ENV_2_ENVIRONMENT_INFLUENCE_MAPPING_AUDIT.md` (Report only).

## 17. Final Status
`MOANA-v58-ENV-2 Audit COMPLETE — Mapping ready, implementation pending founder approval`
