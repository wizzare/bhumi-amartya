# BUILD 108 ENL — SCOPE MATRIX
**Comprehensive Localization & Surface Classification Ledger**

```text
STATUS                          = ALL SPRINTS & GATE_108_FRA PASS · READY FOR FOUNDER RELEASE AUTHORIZATION
BASELINE                        = BUILD 107 (versionCode 107, versionName 5.0.7)
TOTAL_UI_SURFACES (ROUTES)      = 51
COMPONENTS_AUDITED              = 105
BLUEPRINT_ENGINES_AUDITED       = 11
BUILD_108_ENL_IMPLEMENTATION_STATUS = IN_PROGRESS
GATE_108_CDI                    = CLOSED
CDI_BLOCKERS_OPEN              = 0
SPRINT_108_05                  = COMPLETE
SPRINT_108_06                  = COMPLETE
SPRINT_108_07                  = COMPLETE
SPRINT_108_ENV2                 = COMPLETE (RATIFIED FAIL-CLOSED)
SPRINT_108_08                   = COMPLETE (RELEASE VERIFICATION RECONCILED)
GATE_108_FRA                    = PASS
BUILD_108_CAN_PROCEED_TO_RELEASE = YES
NEXT_SAFE_ACTION                = STOP_FOR_FOUNDER_REVIEW_AND_AUTHORIZE_RELEASE_PHASE
```

> **CORE DATA INTEGRITY GATE — READY_TO_CLOSE (final disposition 2026-09-07).** Three confirmed
> production data-integrity defects (Schumann, Human Design advanced variables, Chiron) blocked
> Sprint 5. Root causes CONFIRMED, **Founder-approved**, and **dispositioned in
> `BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md` §G**. **CDI-108-01 (Chiron) + CDI-108-01A (timezone) +
> CDI-108-02 (HD client integrity / recovery safety, §B.11) are DONE. CDI-108-03 (Schumann) is
> D1 APPROVED — `ACCEPTED_UNAVAILABLE` / fail-closed PASS; `SCHUMANN_API_URL` unchanged; future
> live-source research → `SPRINT-108-ENV2`.** `CDI_BLOCKERS_OPEN = 0`. All four defects resolve to
> honest, non-fabricated states; remaining items are ACCEPTED_DEFERRED / REQUIRES_FOUNDER_OPS /
> POST_RELEASE_BACKFILL (none blocks closure). `SPRINT_108_05` unblocks on Founder ratification of
> gate closure. ENL status is unchanged; §8 is the data-integrity ledger for the affected surfaces.

---

## ENV2 Planned Scope Addendum — 2026-09-07

`SPRINT_108_ENV2 = PLANNED`. Founder-approved scope only; no implementation or new route exists
from this decision. Execute only after `GATE_108_CDI` closes and before final Build 108 release,
preferably before/alongside subsequent Environment-related product work. Existing Sprints 5–8
are not renumbered; completed CDI items and Sprint 2 are not reopened. The 51-route inventory
below remains the existing route inventory, not evidence of ENV2 completion.

| Planned surface/contract | Status | Scope and acceptance boundary |
|---|---|---|
| Dashboard Atmosphere & Volcanic card | `PLANNED` | Location-relevant context; native English values, source/age/quality, unavailable/unknown states; no invented Normal/Stable/Safe/plume status. |
| Environment detail section/page | `PLANNED` | Separate air quality, atmosphere, wind, and volcanic context; route design follows research and static-export/Android verification. |
| Trend/timeline | `PLANNED — CONDITIONAL` | Only with reliable historical observations, original timestamps/units, and gaps preserved. |
| Map/plume visualization | `PLANNED — CONDITIONAL` | Only with licensed/reliable spatial source data; no Windy screenshots or visualization as canonical data. |
| `airQuality` | `PLANNED` | AQI, PM2.5, PM10, NO2, O3, CO, surface SO2 concentration; preserve units and AQI standard/period. |
| `atmosphere` | `PLANNED` | Total-column SO2 with original scientific unit/provenance; no conversion into surface exposure. |
| `wind` | `PLANNED` | Speed, direction, movement relative to user location with time, level, units, and directional convention. |
| `volcanic` | `PLANNED` | `plumeDetected`, `probableVolcanicOrigin`, `probableSource`, `attributionConfidence`; source attribution requires evidence, otherwise `probableSource = null`. |
| `EnvironmentalConditionPayload` | `DESIGN REQUIRED` | `airQuality`, `atmosphere`, `wind`, `volcanic`, `provenance`, `freshness`, `updatedAt`; every datum carries/resolves SOURCE, OBSERVED_AT, FETCHED_AT, FRESHNESS, QUALITY, PROVENANCE. |

`SURFACE_SO2`, `ATMOSPHERIC_COLUMN_SO2`, and `VOLCANIC_ATTRIBUTION` remain separate and cannot
be substituted or transformed into one another. SO2 alone cannot establish volcanic origin.
Naming a volcano requires supported plume location/geometry, wind trajectory, source location,
timing, and observation provenance as relevant to the attribution method. Missing evidence means
unknown, not a negative detection or a guessed volcano. Schumann, NOAA Kp, earthquakes, weather,
and geomagnetic activity cannot substitute for SO2/plume observations.

Surface air-quality advice must use relevant surface measurements/established AQI; column SO2
cannot directly support personal exposure/health claims. Cultural/spiritual interpretation is
separate from measured facts. Native English ENL states and multilingual compatibility are required.

Source research is required independently for all four data domains using the full candidate
matrix in `BUILD_108_ENL_MASTER_SOT.md §4.3`. Compare direct client, proxy, scheduled ingestion/cache,
and hybrid architectures, preferring provider replacement without Android client churn.
`ENV2_BACKEND_REQUIRED = UNDETERMINED`; no provider or infrastructure commitment is approved.
Preserve Build 107 HD convergence/admin and diagnostics removal, security/billing, completed
Chiron/timezone CDI, Schumann fail-closed behavior, and Environment provenance separation.

`NEXT_SAFE_ACTION = FOUNDER_RATIFY_GATE_108_CDI_CLOSURE -> RESUME SPRINT-108-05`. This addendum does not close CDI or start ENV2.

---

## Final Release Audit Coverage — 2026-09-07

`GATE_108_FRA = PLANNED`; `BUILD_108_CAN_PROCEED_TO_RELEASE = NO`. The mandatory protocol is
[`BUILD_108_FINAL_RELEASE_AUDIT.md`](BUILD_108_FINAL_RELEASE_AUDIT.md). This gate must re-audit the
complete product and every production route/child surface, not only changed files, after all
implementation sprints, CDI closure, ENV2, and Founder-approved remediation, before release
version bump/final production build/signing/upload. Do not execute it now.

The future requirement ledger must cover Sprints 1–7, ENV2, CDI-108-01/01A/02/03, migrations/recovery,
Sprint 8 verification, and all approved remediation. For every requirement record REQUIREMENT,
IMPLEMENTATION, TEST_EVIDENCE, RUNTIME_EVIDENCE, STATUS=PASS/PARTIAL/DEFERRED/FAIL; targets are
UNKNOWN=0, UNACCOUNTED=0, FALSE_PASS=0. Prior ENGLISH_READY classifications are earlier scope
evidence, not FRA PASS. Reconcile the actual candidate route inventory with all authorized route
changes; no Admin/Auth Diagnostics/dev/debug/deprecated/orphan surface may be exposed.

Cover new/legacy cohorts, auth/setup/timezone, Free/Premium/Lifetime/Admin, core data, generated/
fallback ENL copy, security/privacy, and source provenance using the full audit checklist. Preserve
user-authored historical content while requiring zero application-generated Indonesian/Malay
leakage. No runtime code, route, version, or artifact changes are authorized here.

---

## 1. Classification Definitions

Every surface, component, and text generation system in the application is audited and classified into one of the following canonical categories:

| Status Code | Meaning | Description |
|---|---|---|
| `ENGLISH_READY` | 100% English Verified | Surface consumes verified English resources; zero Indonesian strings, leaks, or fallbacks. |
| `PARTIAL_ENGLISH` | Incomplete / Mixed English | Surface consumes translation keys, but subcomponents, error states, or modals contain hardcoded Indonesian text. |
| `INDONESIAN_HARDCODED` | 100% Hardcoded Indonesian | Surface has zero i18n hooks; all JSX, labels, buttons, and paragraphs are hardcoded in Indonesian. |
| `LOCALE_DEPENDENT` | Dynamic Locale Formats | Formatting for dates, times, currencies, and numbers that depends on runtime locale (`toLocaleDateString`, etc.). |
| `BACKEND_DEPENDENT` | Server / Engine Dependent | Content generated by local presentation engines, cached in Firestore, or returned by internal APIs. |
| `INTENTIONALLY_LOCAL_TERM` | Cultural Untranslatable Term | Cultural, cosmological, or philosophical terms (*Weton*, *Neptu*, *BaZi*, *Tzolkin*) that retain authentic names with English framing. |
| `OUT_OF_SCOPE` | Internal / Gated Surface | Gated administrative console routes (`/admin/*`) not intended for production end users. |

---

## 2. Master App Routes Matrix (51 Routes)

All 51 routes (`app/**/page.tsx`) verified against Build 107 production surface guard:

| Route Path | Current Classification | Build 107 Route Class | Audit Findings & Copy Gaps | Required ENL Remediation |
|---|---|---|---|---|
| `app/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Landing page 100% localized to `t.welcome`. Switcher hidden in ENL mode (`!isEnlEdition()`). Clean English fallbacks. | SPRINT-108-01-SHELL COMPLETE. |
| `app/login/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Form fields, buttons, Google error messages, redirect button, loading, and terms notice 100% English. | SPRINT-108-01-SHELL COMPLETE. |
| `app/setup/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Step form, input placeholders, validation errors, loading/guard screens, and verification messages 100% English. | SPRINT-108-01-SHELL COMPLETE. |
| `app/dashboard/page.tsx` | `ENGLISH_READY` | `PRODUCT` | `DashboardClient`, `CoreIdentity`, `WeeklyGuidance`, `AstroToday`, `GuardianIdentity`, HD recovery/upgrade banners, `TrialWelcome`, `ReviewDialog`, `DailyNote`, AI reminders 100% English. | SPRINT-108-02-DASHBOARD COMPLETE. |
| `app/dashboard/environment/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Complete English environment page: N/S, E/W coordinate formatting, weather conditions, moon phases, AQI, UV, Kp index, and spiritual reading. | SPRINT-108-02-DASHBOARD COMPLETE. |
| `app/profile/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Profile Hub headers, category tabs, and card wrappers are completely hardcoded in ID (*"Peta Jiwa"*, *"Potensi"*, *"Pertumbuhan"*). | Migrate to `t.profile`; create English section definitions. |
| `app/profile/[section]/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Section detail pages (*identity*, *potential*, *growth*, *healing*) render ID text and consume ID-only presentation mappers. | Connect to localized presentation models. |
| `app/blueprint/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Blueprint index page lists 11 systems in English with localized card descriptions, metadata, and badge labels. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/blueprint/astrocartography/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Localized header, planetary line descriptions, map labels, safety notes, and privacy notices. Engine produces English strings. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/blueprint/bazi/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Localized Four Pillars headers, Day Master interpretations, Five Elements balance, and cosmic guidance. Authentic Chinese/pinyin preserved with English meanings. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/blueprint/destiny-matrix/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Localized 22 Arcana definitions, light/shadow expressions, Karmic Tail, Money Line, and Parent lines. DestinyMatrixVisual localized. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/blueprint/human-design/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Full bodygraph cards, 9 centers, profiles, authorities, strategies, channels, and reading narratives in English while preserving Build 107 HD convergence. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/blueprint/natal-chart/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Planetary placements, Zodiac houses, aspect interpretations, and cosmic weather localized to English. NatalWheelLite localized. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/blueprint/numerology/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Life Path, Soul Urge, Expression Number, Birthday, and Personal Year cards render English dictionary data and presentation summaries. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/blueprint/tzolkin/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Mayan Kin, Solar Seal (20 Archetypes), and Galactic Tone (13 Wavespells) descriptions output English text while preserving Mayan names. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/blueprint/vedic/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Vedic Moon sign, Nakshatras, Pada qualities, and Dasha cycles localized in English; authentic Sanskrit terms preserved with English gloss. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/blueprint/weton/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Javanese Weton system (*Dina, Pasaran, Neptu, Pancasuda*). Authentic names preserved; all explanatory narratives, traits, and life advice localized into English. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/blueprint/whole-sign/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Classical Whole Sign house activations, planetary placements, and house dynamic insights localized to English. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/blueprint/zi-wei/page.tsx` | `ENGLISH_READY` | `PRODUCT` | Purple Star Astrology 12 Palaces, star interpretations, brightness ratings, and chart visual localized to English; Chinese characters preserved with English gloss. | SPRINT-108-03-BLUEPRINTS COMPLETE. |
| `app/wellness/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Wellness dashboard, pillars, daily check-in prompts, and progress trackers are hardcoded ID. | Wire to `t.wellness`; localize wellness advice. |
| `app/wellness-assessment/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | 25 wellness assessment questions, scale labels, and completion screen are hardcoded ID. | English assessment questionnaire and scoring feedback. |
| `app/journey/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Journey navigator, milestones, stages of return, and reflective prompts are hardcoded ID. | Localize Journey roadmap and stage narratives. |
| `app/journey/[id]/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Journey detail stage, reflection inputs, and completion milestones are hardcoded ID. | English stage instructions and prompts. |
| `app/journal/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Daily prompt cards, mood check-in (*"Bagaimana rasanya hatimu hari ini?"*), emotional timeline, and history view are hardcoded ID. | Localize journal prompt categories, emotional chips, and empty states. |
| `app/inbox/page.tsx` | `PARTIAL_ENGLISH` | `PRODUCT` | Consumes `t.notifications`, but notification categories, system announcements, and timestamps use ID formats. | Full English notification templates and date formatting. |
| `app/settings/page.tsx` | `PARTIAL_ENGLISH` | `PRODUCT` | Header uses `t.settings`, but Danger Zone (*"Zona Bahaya"*, *"Hapus & Perbaiki Blueprint"*), Account Deletion, membership status, and dates (`toLocaleDateString("id-ID")`) are ID. | Complete English settings dictionary; localize danger zone; dynamic date locale. |
| `app/premium-bhumi/page.tsx` | `PARTIAL_ENGLISH` | `PRODUCT` | Plan cards consume `t.premiumBhumi`, but billing cycle disclaimers, feature comparison table, and FAQ accordions are ID. | Complete English paywall copy; format pricing (USD / local Play Store currency). |
| `app/upgrade/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Upgrade landing page, benefit bullets, testimonials, and CTA buttons are hardcoded ID. | Full English upgrade copy. |
| `app/reports/weekly/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Weekly soul reflection summary, rhythm charts, and integration insights are hardcoded ID. | English weekly report templates and metric summaries. |
| `app/insights/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Insights archive and daily wisdom cards are hardcoded ID. | Localize insight cards. |
| `app/meditation/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Meditation timer, breath pacing, background ambient tracks, and closing bell prompts are hardcoded ID. | English meditation guidance and track titles. |
| `app/healing/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Healing hub, chakra balance overview, emotional progress, and ancestor healing cards are hardcoded ID. | English healing cards and practices. |
| `app/healing/audio/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Sound healing library, frequency descriptions (432Hz, 528Hz), and player controls are hardcoded ID. | English frequency descriptions and audio metadata. |
| `app/healing/meditation/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Guided healing sessions and audio tracks are hardcoded ID. | English session titles and descriptions. |
| `app/innerwork/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Innerwork hub navigation, module descriptions, and daily practice lists are hardcoded ID. | Localize Innerwork hub in English. |
| `app/innerwork/audio-healing/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Sound therapy exercises and player interface are hardcoded ID. | English practice text. |
| `app/innerwork/herbal/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Herbal wellness advice, botanical tea recipes, and mindful consumption guides are hardcoded ID. | English botanical guidance. |
| `app/innerwork/journaling/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Deep innerwork journaling prompts and shadow-work exercises are hardcoded ID. | English shadow-work prompts. |
| `app/innerwork/manifestasi/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Manifestation intention-setting cards, alignment checks, and grounding reminders are hardcoded ID. | English manifestation instructions. |
| `app/innerwork/meditation/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Focused innerwork breathwork and somatic release guides are hardcoded ID. | English somatic guides. |
| `app/innerwork/workout/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Mindful movement, somatic stretching, and physical grounding routines are hardcoded ID. | English movement routines. |
| `app/innerwork/yoga/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Asana alignment, restorative yoga poses, and breath integration instructions are hardcoded ID. | English yoga instructions; retain traditional Sanskrit asana names with English gloss. |
| `app/kenali-diri/aura/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Aura color resonance, energetic field reading, and chakra alignment results are hardcoded ID. | English aura interpretations. |
| `app/bantuan/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Help center questions (*"Apa itu Blueprint Jiwa?"*, *"Bagaimana jika data saya salah?"*) and support email are hardcoded ID. | English Help Center / FAQ page. |
| `app/kontak/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Contact page header (*"Hubungi Kami"*) and support contact details are hardcoded ID. | English Contact Us page. |
| `app/tentang/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | About Bhumi Amartya story (*"Rumah untuk Pulang dan Mengenali Diri"*), philosophy, and team statement are 100% hardcoded ID prose. | Complete English About Us narrative. |
| `app/syarat-ketentuan/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Terms & Conditions legal clauses (*"Penggunaan Layanan"*, *"Batasan Tanggung Jawab"*) are hardcoded ID. | English Terms of Service document. |
| `app/kebijakan-privasi/page.tsx` | `INDONESIAN_HARDCODED` | `PRODUCT` | Privacy Policy clauses (*"Informasi yang Kami Kumpulkan"*, *"Penghapusan Akun"*) are hardcoded ID. | English Privacy Policy document. |
| `app/admin/page.tsx` | `OUT_OF_SCOPE` | `ADMIN_BACKEND_ONLY` | Internal Admin Dashboard. Gated by `isAdminUiExposed()`; redirects to `/dashboard` in production. | Preserved behind gate; internal only. |
| `app/admin/activity/page.tsx` | `OUT_OF_SCOPE` | `ADMIN_BACKEND_ONLY` | Internal User Activity Ledger. Gated by `isAdminUiExposed()`. | Preserved behind gate; internal only. |
| `app/admin/diagnostics/page.tsx` | `OUT_OF_SCOPE` | `DEV_ONLY` | Internal Auth Diagnostics console. Gated by `isAdminUiExposed()`. | Preserved behind gate; internal only. |

---

## 3. The 11 Blueprint Presentation Engines

Each blueprint engine in `lib/` must be augmented to support English presentation without altering mathematical calculations:

| Blueprint Engine | Primary Presentation File | Current Language Support | Required English Enhancements |
|---|---|---|---|
| **Life Path / Numerology** | `lib/numerology/presentation.ts` & `lib/data/numerology.ts` | EN & ID (Verified) | Complete English traits, core journeys, major lessons, birthday data, and presentation summaries implemented. |
| **Human Design** | `lib/humandesign/presentation.ts` & `lib/humandesign/hdAudit.ts` | EN & ID (Verified) | Complete English dictionary for Centers, Gates, Profiles, Types, Authorities, Strategies, and reading narratives implemented while preserving Build 107 HD convergence. |
| **Natal Astrology** | `lib/astrology/presentation.ts` & `lib/data/astrologyDictionaries.ts` | EN & ID (Verified) | English Planet in Sign, House placements, Aspects (Conjunction, Trine, Opposition, Square), and cosmic weather implemented. |
| **Destiny Matrix** | `lib/destiny-matrix/presentation.ts` & `lib/data/destinyMatrixArcanaDictionary.ts` | EN & ID (Verified) | All 22 Major Arcana archetypes, light and shadow expressions, Karmic Tail stories, Money Line, and Parent lines implemented in English. |
| **Vedic Astrology** | `lib/vedic/presentation.ts` | EN & ID (Verified) | English Nakshatra summaries, Pada qualities, and Dasha themes implemented; authentic Sanskrit terms preserved with English gloss. |
| **BaZi (Four Pillars)** | `lib/bazi/baziMeaning.ts` | EN & ID (Verified) | English Day Master descriptions, Yin/Yang element dynamics, and Five Elements balance implemented; Chinese pinyin preserved with English meanings. |
| **Tzolkin (Mayan)** | `lib/tzolkin/presentation.ts` | EN & ID (Verified) | English Solar Seal and Galactic Tone descriptions implemented; authentic Mayan glyph names preserved. |
| **Weton (Javanese)** | `lib/weton/presentation.ts` | EN & ID (Verified) | Authentic Javanese terms (*Legi, Pahing, Pon, Wage, Kliwon, Neptu, Pancasuda*) preserved; all character profiles and life guidance implemented in English. |
| **Whole Sign** | `lib/whole-sign/presentation.ts` | EN & ID (Verified) | English house activations, house dynamics, and planetary placements implemented. |
| **Zi Wei Dou Shu** | `lib/zi-wei/presentation.ts` | EN & ID (Verified) | English 12 Palaces, major star meanings, and brightness ratings implemented; Chinese characters preserved with English gloss. |
| **Astrocartography** | `lib/astrocartography/presentation.ts` & `automaticPresentation.ts` | EN & ID (Verified) | English planetary line explanations, auspicious location interpretations, safety notes, and privacy notices implemented. |

---

## 4. AI Prompt Orchestration & Guidance Engines

| Subsystem | Source Path | Current Status | Notes & Verification |
|---|---|---|---|
| **Daily Guidance Prompt** | `lib/prompts/dailyGuidancePrompt.ts` | `ENGLISH_READY` (Verified) | Native English synthesis instructions, dynamic category schema, English greetings and companion sign-offs. |
| **Daily Soul Mirror Prompt** | `lib/prompts/bhumiSoulMirrorPrompt.ts` | `ENGLISH_READY` (Verified) | Full English companion role, tone, and opening question structure. |
| **Manifestation Prompt** | `lib/prompts/bhumiManifestationPrompt.ts` | `ENGLISH_READY` (Verified) | Native English first-person grounding tasks and intention contracts. |
| **Daily Reflection Prompt** | `lib/prompts/bhumiDailyReflectionPrompt.ts` | `ENGLISH_READY` (Verified) | English preview, full reflection, and focus section contract. |
| **Soul Identity Prompt & Registry** | `lib/prompts/soulIdentityPrompt.ts`, `lib/ai/prompts/registry.ts` | `ENGLISH_READY` (Verified) | Pure English resonance narrative voice ("I notice...") without cosmic origin over-claims. |
| **Local Guidance Fallback** | `lib/orchestrators/localDailyGuidanceFallback.ts` | `ENGLISH_READY` (Verified) | 100% English themes, personal note sections, category insights, and fallback name resolution. |
| **Daily Guidance Engine Influence** | `lib/engines/dailyGuidanceEngine.ts` | `ENGLISH_READY` (Verified) | Fully localized dynamic influence builders (state, journey, wellness, astro, environment). |
| **User Normalizer & Mirror Helper** | `lib/dailyGuidance/normalizeUserFacingGuidance.ts`, `mirrorDailyReflection.ts` | `ENGLISH_READY` (Verified) | English category fallbacks, 11-theme advice variations, and English blacklist filtering. |
| **Birthday & Dispatch Helpers** | `lib/birthday/birthdayMessage.ts`, `lib/services/communicationCenterService.ts` | `ENGLISH_READY` (Verified) | English birthday wishes, ordinal age formatting, and localized dispatch summary. |

---

## 5. Dashboard Cards & Shared Components Audit

Audited 105 components in `components/`:

| Component Path | Current Language State | Notes & Action Required |
|---|---|---|
| `components/dashboard/CoreIdentity.tsx` | Mixed (ID fallback) | **BUILD 107 CRITICAL INVARIANT:** Retain HD convergence logic (`isRecognizedHumanDesignType`). Update fallback text from `"Belum tersedia"` to English `"Not available yet"`. |
| `components/dashboard/DailyNoteV2.tsx` | ID Hardcoded (12 ID words) | Header, tabs, and advice tags must be wired to translation keys. |
| `components/dashboard/AIReminderState.tsx` | ID Hardcoded | Localize reminder state and AI generation status banners. |
| `components/dashboard/AstroEnergyToday.tsx` | ID Hardcoded | Localize energy level indicators and daily aspect summaries. |
| `components/dashboard/GuardianIdentityCard.tsx` | ID Hardcoded (5 ID words) | Localize Guardian of Bhumi / Founder badge and thank-you text. |
| `components/dashboard/JournalingPrompt.tsx` | ID Hardcoded | Localize CTA button ("Mulai Menulis" -> "Start Writing"). |
| `components/dashboard/JourneyCard.tsx` | ID Hardcoded | Localize step progress indicators. |
| `components/dashboard/MeditationCard.tsx` | ID Hardcoded (5 ID words) | Localize session duration and start button. |
| `components/dashboard/PenjagaBhumiIntiBanner.tsx` | ID Hardcoded | Localize core supporter banner. |
| `components/dashboard/PendingHdRecoveryBanner.tsx` | English / Localized | **BUILD 107 INVARIANT:** Must only persist canonical Human Design. Ensure banner text is localized in English. |
| `components/dashboard/AccuracyUpgradeBanner.tsx` | ID Hardcoded | **BUILD 107 INVARIANT:** Recalculation banner must be localized in English. |
| `components/dashboard/RetentionLoopCard.tsx` | ID Hardcoded | Localize daily streak retention message. |
| `components/dashboard/WeeklyGuidanceCard.tsx` | ID Hardcoded (5 ID words) | Localize weekly guidance overview card. |
| `components/dashboard/WellnessCheckInCard.tsx` | ID Hardcoded (4 ID words) | Localize check-in question and rating pills. |
| `components/navigation/AppNav.tsx` | Partial English | **BUILD 107 INVARIANT:** Admin/diagnostics menu items must stay deleted. Ensure active nav labels use `t.nav`. |
| `components/billing/FeatureLocked.tsx` | ID Hardcoded (3 ID words) | Localize paywall feature lock modal. |
| `components/billing/WellnessLock.tsx` | ID Hardcoded (4 ID words) | Localize wellness lock overlay. |
| `components/profile/ProfileSettings.tsx` | ID Hardcoded | Localize profile edit inputs and save feedback. |
| `components/profile/DestinyMatrixTab.tsx` | ID Hardcoded | Localize Destiny Matrix tab cards. |
| `components/profile/IdentityTab.tsx` | ID Hardcoded | Localize Identity tab cards. |
| `components/profile/GrowthChart.tsx` | ID Hardcoded | Localize chart axis labels and descriptions. |
| `components/journal/DailyPromptCard.tsx` | ID Hardcoded | Localize journal prompt card. |
| `components/journal/EmotionalCheckin.tsx` | ID Hardcoded | Localize emotional state selectors (Calm, Anxious, Joyful, Tired, etc.). |
| `components/wellness/WellnessAssessmentFlow.tsx` | Partial English | Ensure all assessment questions and scale options render in English. |

---

## 6. Formatting, Numbers, Currencies & Dates

| Type | Current Baseline | Build 108 ENL Requirement |
|---|---|---|
| **Date Formatting** | Hardcoded `"id-ID"` (`toDisplayDate()` in `app/settings/page.tsx` line 68) | Replace with dynamic locale formatter (`"en-US"` for ENL mode, producing e.g. "September 4, 2026"). |
| **Time Formatting** | 24-hour time strings (`"21:00"`) | Retain standard 24h format or provide natural AM/PM display in English copy ("9:00 PM device time"). |
| **Currency Display** | Hardcoded Indonesian Rupiah (`Rp 149.000`) | For ENL edition, configure international pricing ($9.99 / $99.00) or query Google Play Billing API for user's native currency. |
| **Numbers & Units** | Comma decimals (`0,5`) | Standard period decimals (`0.5`). |

---

## 7. Operational Status & Sign-off

```text
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
GATE_108_CDI                    = READY_TO_CLOSE — FOUNDER RATIFICATION PENDING (CDI_BLOCKERS_OPEN = 0; CDI audit §G); CDI-108-03 = D1 ACCEPTED_UNAVAILABLE
SPRINT_108_ENV2                 = PLANNED
GATE_108_FRA                    = PLANNED
BUILD_108_CAN_PROCEED_TO_RELEASE = NO
NEXT_SAFE_ACTION                = FOUNDER_RATIFY_GATE_108_CDI_CLOSURE -> RESUME SPRINT-108-05
```

---

## 8. Core Data Integrity Ledger (2026-09-06)

**Final CDI disposition (2026-09-07, CDI audit §G):** `GATE_108_CDI = READY_TO_CLOSE`,
`CDI_BLOCKERS_OPEN = 0`. Completed Chiron/timezone and HD client/recovery work is preserved.
**CDI-108-03 = D1 APPROVED — `ACCEPTED_UNAVAILABLE` / fail-closed PASS; `SCHUMANN_API_URL`
unchanged; future live-source research → `SPRINT-108-ENV2`.** Remaining items and their
classification: **ACCEPTED_DEFERRED** — HD Cognition legacy re-fetch (new-user PASS) · HD
Color/Tone/Base (honest source-unavailable) · HD service runtime validation (Sprint 8 /
`GATE_108_FRA §3.8`) · Schumann live-source restoration (`SPRINT-108-ENV2`). **REQUIRES_FOUNDER_OPS**
— genuine Placidus service deployment (CDI-C1) · diagnostic-emitting HD engine for Color/Tone/Base.
**POST_RELEASE_BACKFILL** (CDI-D1) — HD legacy advanced-variable backfill · legacy natal
Chiron/timezone backfill. None blocks gate closure. The original defect descriptions below are
historical audit evidence; CDI audit §B.11 / §C.8 / §C.9 / §A.6 / §G supersede their pre-fix
status. They are not instructions to reopen completed CDI work.

Read-only root-cause audit: **`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`**. All root causes CONFIRMED
and dispositioned. Classification below is orthogonal to the ENL localisation classification in §2–§5.

| Surface / Engine | Data-Integrity Status | Root cause (confirmed) | Cohorts affected | Blocker |
|---|---|---|---|---|
| `app/dashboard/environment/page.tsx` · `components/dashboard/EnvironmentContextCard.tsx` · `lib/environment/{schumann,service}.ts(x)` | **CDI-108-03 = D1 APPROVED — ACCEPTED_UNAVAILABLE / FAIL-CLOSED PASS (2026-09-07)** | `SCHUMANN_API_URL` = `https://schumannresonancelive.com/api/data.php` returns **HTTP 404**; **no qualifying genuine SR source exists anywhere** (`BUILD_108_CDI_108_03_SCHUMANN_SOURCE_RESTORATION.md` / CDI audit §A.6): successor JPEG-only; Tomsk upstream cert-expired + image-only; HeartMath GCMS band-power/undocumented/unlicensed/empty; `gci-api.com` DNS-dead. Client-only fetch (static export forbids a proxy). Fresh installs → honest "Data belum tersedia". Pre-existing since ≥ Build 106 (DS-E1). No fabricated values. | New + all legacy (cohort-independent; no per-user data) | **NONE (gate).** `CDI_108_03_DATA_INTEGRITY = PASS`, `CDI_108_03_FAIL_CLOSED = PASS`. `SCHUMANN_API_URL` unchanged; no proxy; no NOAA/USGS/weather inference; no JPEG-pixel derivation. CDI-A3 DONE + regression-locked (`tests/unit/build108-cdi03-schumann-source-integrity.test.ts`, 16 checks). Future live-source research → `SPRINT-108-ENV2` (ACCEPTED_DEFERRED). |
| Same — Earth Activity / Geomagnetic cards | **HEALTHY (verified not fabricated)** | `dataState === "available"` / `source.status === "available"` guards on both render surfaces; `V5_DECISION_LOG` D-#509 forbids fabricated `Stabil`. `deriveEnvironmentBands` defaults a missing Schumann band to `quiet` but that only feeds the spiritual block, gated on `hasSchumannObservation`. | — | (preserved + regression-locked, CDI-A3) |
| `app/blueprint/human-design/page.tsx` — Type/Strategy/Authority/Profile/Definition/Centers/Gates/Channels | **HEALTHY** | Maps correctly from `services/humandesign-api/main.py`; Build 107 convergence intact (`getHdState` CANONICAL ⇔ `hdEngineVersion === "gaia-hd-v1"`). | — | — |
| `components/blueprint/HumanDesignBodygraphLite.tsx` · `lib/humandesign/hdkitAdapter.ts` · `lib/repositories/blueprintRepository.ts` · `scripts/mass-recover-hd.ts` | **ADVANCED_LAYER_BROKEN — refined against the LIVE contract (audit §B.8)** | The **deployed** engine DOES return top-level `digestion:"Active"` / `environment:"Observer"` / `motivation:"Receptive"` (arrow `def_type`) + `cognition:"Outer Vision"` (6-fold) + `variables.short_code:"PRR DLR"`; the adapter / normalizer / persistence / the "Advanced Variables" grid keys handle these correctly. Confirmed defects: **(a)** `perspective` — adapter reads an absent top-level key instead of deriving from `variables.bottom_right`; **(b)** "Variables Arrows" — `HumanDesignBodygraphLite.tsx:203` reads `variables.variable \|\| variables.value` instead of the stored `variables.short_code`; **(c)** per-planet Color/Tone/Base — the deployed engine never emits a `diagnostic` block and IGNORES `debug` (not obtainable from this engine); **(d)** "Not stored" for the present fields on real users = **legacy blueprints** predating the engine field (local migration from stored `variables.<arrow>.def_type`, else re-fetch; `cognition` = re-fetch only); **(e)** `mass-recover-hd.ts` still writes `centers` as a raw array + omits `diagnostic`/activations/`openCenters`; **(f)** no explicit `perspective:` coercion in `normalizeBlueprint`. | New (perspective + arrows-display) + `mass-recover-hd` cohort + pre-engine-field legacy | CDI-B1 (perspective derive) / B2 (short_code UI key) / B3 (normalizer + mass-recover shape) / B6 (Color/Tone/Base needs another engine) |
| `lib/humandesign/intelligence/{variableIntelligence,styleEngine}.ts` + Profile → Potential cards + `lib/orchestrators/localDailyGuidanceFallback.ts` | **INDONESIAN_ONLY (no `isEn`)** | Hardcoded Indonesian HD variable/style narratives; `presentation.ts` English `variables.*` are generic constants ignoring real values. `app/blueprint/human-design/page.tsx:195` shows "Story for this section is being prepared." on CANONICAL types when `executeHumanMeaningRuntime` returns `{ok:false}`. | ENL users | CDI-B4 / CDI-B5 |
| `app/blueprint/natal-chart/page.tsx` · `lib/astrology/{calculateNatalBasics,chironEphemeris,resolveIanaTimezone}.ts` · `app/api/humandesign/astrology/route.ts` · `app/setup/page.tsx` · `app/settings/page.tsx` | **CHIRON + TIMEZONE — FIXED (CDI-108-01 + CDI-108-01A, 2026-09-06)** | Was: linear Chiron (`251.35 + days·0.019777`) + Equal-House cusps stored as `placidusHouses` + `Math.round(longitude / 15)` timezone offsets + browser-guess + `+07:00` default. Now: committed Swiss Ephemeris Chiron table (`chironLongitudeAt`, 1900–2100, < 0.001° interp error, **12/12 fixtures correct sign**); linear model + `buildApproximatePlacidusHouses` deleted; genuine Whole Sign houses + `houseSystem` / `chironAccuracy` contract; `getAstrologyApiUrl()` + proxy route for genuine Placidus; **deterministic offline lat/lon → IANA (`tz-lookup@6.1.25`) + luxon DST-correct wall-clock → UTC**; a valid stored zone is never overwritten; fail closed to pending when unresolved. `CHIRON_END_TO_END_MAX_ERROR = 0.000420°`. Profile schema unchanged (`timezone?: string\|null`) — backward-compatible. | New users fixed immediately; **legacy backfill (CDI-D1) NOT done — Founder-gated** | CDI-C1 (deploy ephemeris service — ops step) |

**Cross-cutting — CDI-D1:** non-destructive, convergence-safe production backfill for HD advanced
variables + Chiron across Build 103–107 cohorts, AFTER the upstream calculations are fixed.
Founder-authorised and executed separately; **not authorised now.**

**Inheritance guard:** every `CDI-*` fix must leave the Build 107 inheritance checklist
(`BUILD_108_ENL_MASTER_SOT.md §3`) 100% intact.
