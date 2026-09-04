# BUILD 108 ENL — EXHAUSTIVE PAGE-BY-PAGE AUDIT REPORT
**Comprehensive READ-ONLY English Readiness Audit Across All 51 App Routes**

```text
STATUS                          = NOT_STARTED (READ-ONLY AUDIT COMPLETE)
PRODUCTION_BASELINE             = BUILD 107 (versionCode 107, versionName 5.0.7)
BASELINE_COMMIT                 = d2ecb5ed73b7bb5e95415be314305f3512533752
TOTAL_ROUTES                    = 51
TOTAL_USER_FACING_PAGES         = 48
DEV_OR_DEPRECATED_SURFACES      = 3 (app/admin/* gated by isAdminUiExposed())
ENGLISH_READY_PAGES             = 0
PARTIAL_ENGLISH_PAGES           = 8
INDONESIAN_HARDCODED_PAGES      = 39
INTENTIONALLY_LOCAL_TERM_PAGES  = 1
ROUTE_LEVEL_HARDCODED_ID_WORDS  = 560
COMPONENT_LEVEL_HARDCODED_ID    = 389
TOTAL_HARDCODED_ID_FINDINGS     = 949+
MALAY_HARDCODED_FINDINGS        = 1
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_PAGE_AUDIT_AND_SPRINT_PLAN
```

---

## 1. Audit Methodology & Scope

This read-only audit inspects every single page (`page.tsx`) in the `app/` directory of Bhumi Amartya Build 107.
For every page, the audit inspects:
1. **Static Copy:** Titles, headings, descriptions, buttons, tooltips, dialogs, and navigation labels.
2. **Dynamic Copy:** Validation messages, loading states, empty states, error alerts, and fallback text.
3. **Engine & Backend Copy:** Presentation models, local fallback prose, and stored guidance structures.
4. **AI & API Copy:** Prompts, response schemas, and external/internal endpoint responses.
5. **Formatting:** Date strings, time representations, number punctuation, and currency symbols.
6. **Build 107 Regression Hazards:** Potential interactions with Human Design convergence, Admin UI gating, and static route invariants.

---

## 2. Exhaustive Per-Page Audit Ledger (All 51 Routes)

### Page 1: Landing / Welcome Page
- **PAGE:** Welcome & Landing Page
- **ROUTE:** `app/page.tsx`
- **PURPOSE:** Entrypoint for new and returning users, route dispatching based on auth status.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (Tagline *"Ruang Untuk Pulang dan Kenali Diri"*, buttons *"Pengguna Baru"*, *"Saya Sudah Punya Akun"*).
- **HARDCODED_ID_COUNT:** 14 occurrences.
- **HARDCODED_MS_COUNT:** 1 occurrence (Language switcher label *"Melayu"*).
- **I18N_COVERAGE:** `PARTIAL_ENGLISH` (Reads `useLanguage()`, but does not use `translations[dictKey]` or `t.welcome`).
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE` (No AI on landing).
- **API_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP` (Auth loading fallback carries *"Sepertinya koneksi melambat atau sesi terganggu"*, buttons *"Coba Lagi"*, *"Masuk Ulang"*).
- **LOADING_ERROR_EMPTY_STATUS:** Loading pulse shows *"Menghubungkan perjalanan..."* in hardcoded Indonesian.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY` (No date rendering).
- **BUILD_107_REGRESSION_RISK:** LOW (Must preserve `decideLandingCtaRoute` auth routing logic).
- **DEPENDENCIES:** `context/AuthContext`, `app/context/LanguageContext`, `lib/auth/landingCtaRoute`.
- **VERDICT:** `PARTIAL_ENGLISH` — Wire landing copy to `t.welcome`; hide or lock language switcher in ENL edition.

---

### Page 2: Login Page
- **PAGE:** Authentication & Sign-In Page
- **ROUTE:** `app/login/page.tsx`
- **PURPOSE:** Email and Google OAuth sign-in for returning users.
- **STATIC_COPY_STATUS:** `PARTIAL_ENGLISH` (Consumes `t.login` for titles, placeholders, and buttons).
- **HARDCODED_ID_COUNT:** 10 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `PARTIAL_ENGLISH` (70% covered via `t.login`).
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `API_LANGUAGE_GAP` (Firebase error codes translated to Indonesian toasts: *"Email atau kata sandi salah"*, *"Terlalu banyak percobaan masuk"*).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP` (Session check timeout alerts in Indonesian).
- **LOADING_ERROR_EMPTY_STATUS:** Button loading shows *"Memproses..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW (Must preserve Google OAuth native capacitor bridge and `onboardingIntent`).
- **DEPENDENCIES:** `context/AuthContext`, `components/navigation/AppNav`, `lib/data/translations`.
- **VERDICT:** `PARTIAL_ENGLISH` — Complete English translation of Firebase error messages and auth banners.

---

### Page 3: Setup / Onboarding Flow
- **PAGE:** Profile Setup & Soul Map Preparation
- **ROUTE:** `app/setup/page.tsx`
- **PURPOSE:** 4-step onboarding wizard (Name, Birth Date, Birth Time, Birth City/Timezone).
- **STATIC_COPY_STATUS:** `PARTIAL_ENGLISH` (Consumes `t.setup` for step titles and descriptions).
- **HARDCODED_ID_COUNT:** 8 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `PARTIAL_ENGLISH` (80% covered).
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `API_LANGUAGE_GAP` (City search autocomplete results return English names, but fallback error is *"Gagal mencari kota"*).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP` (Form validation error messages in Indonesian: *"Nama lengkap wajib diisi"*, *"Tanggal lahir tidak valid"*).
- **LOADING_ERROR_EMPTY_STATUS:** Blueprint preparation overlay displays *"Sedang menyiapkan peta jiwamu..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `LOCALE_DEPENDENT` (Date input must conform to English display standards `MM/DD/YYYY`).
- **BUILD_107_REGRESSION_RISK:** MEDIUM (Must preserve timezone resolution, birth coordinate precision, and auto-generation of initial blueprint).
- **DEPENDENCIES:** `components/ui/CityAutocomplete`, `lib/local/generateLocalBlueprint`, `lib/data/translations`.
- **VERDICT:** `PARTIAL_ENGLISH` — Localize validation errors and blueprint generation loading animation.

---

### Page 4: Dashboard Page
- **PAGE:** Main User Dashboard (Companion / Teman Duduk)
- **ROUTE:** `app/dashboard/page.tsx`
- **PURPOSE:** Primary home surface displaying Daily Reflection, Core Identity, Astro Today, Daily Note, Innerwork, and Growth Rhythm.
- **STATIC_COPY_STATUS:** `PARTIAL_ENGLISH` (`DashboardClient` consumes `translations[dictKey]`, but subcomponents contain hardcoded ID).
- **HARDCODED_ID_COUNT:** 18 occurrences across page and subcards.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `PARTIAL_ENGLISH` (Core headers translated, subcards unmigrated).
- **AI_LANGUAGE_STATUS:** `AI_LANGUAGE_GAP` (AI-generated Daily Reflection and Daily Note must output 100% English).
- **API_LANGUAGE_STATUS:** `API_LANGUAGE_GAP` (`/api/ai/daily-guidance` endpoint must pass `language: "en"`).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP` (`localDailyGuidanceFallback.ts` contains mixed Indonesian fallbacks; `CoreIdentity.tsx` renders *"Belum tersedia"*).
- **LOADING_ERROR_EMPTY_STATUS:** Loading screen shows *"Menghubungkan ruang batin..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `LOCALE_DEPENDENT` (Header date formatting must be dynamic English, e.g. *"Friday, September 4, 2026"*).
- **BUILD_107_REGRESSION_RISK:** **CRITICAL** (Must guard Build 107 Human Design convergence in `CoreIdentity.tsx` and ensure `PendingHdRecoveryBanner` only persists canonical HD).
- **DEPENDENCIES:** `components/dashboard/*`, `lib/dailyGuidance/*`, `lib/humandesign/hdState`, `lib/mappers/userProfileMapper`.
- **VERDICT:** `PARTIAL_ENGLISH` — Comprehensive English wiring across all 15 dashboard cards and daily guidance fallbacks.

---

### Page 5: Environment Context Page
- **PAGE:** Planetary & Cosmic Weather Context
- **ROUTE:** `app/dashboard/environment/page.tsx`
- **PURPOSE:** Displays Schumann Resonance frequency, planetary hours, and environmental energy synthesis.
- **STATIC_COPY_STATUS:** `PARTIAL_ENGLISH` (Consumes `t.environment`, but explanatory cards have hardcoded ID).
- **HARDCODED_ID_COUNT:** 11 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `PARTIAL_ENGLISH`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY` (Schumann API returns raw numeric frequencies).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP` (Offline explanation for missing Schumann graph is ID).
- **LOADING_ERROR_EMPTY_STATUS:** Graph loading shows *"Mengambil data resonansi bumi..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/dashboard/SchumannGraph`, `components/dashboard/EnvironmentContextCard`.
- **VERDICT:** `PARTIAL_ENGLISH` — Complete `t.environment` English dictionary coverage.

---

### Page 6: Profile Hub Page
- **PAGE:** Profile & Soul Blueprint Hub (Teacher / Penerjemah Diri)
- **ROUTE:** `app/profile/page.tsx`
- **PURPOSE:** Detailed view of user's multi-system soul blueprint, life themes, and identity pillars.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (Headers *"Peta Jiwa"*, *"Pilar Identitas"*, *"Potensi Terpendam"*, *"Keluarga & Hubungan"* are hardcoded ID).
- **HARDCODED_ID_COUNT:** 35 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED` (0% dictionary coverage; does not use `translations`).
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP` (Consumes ID presentation models from `lib/` engines).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP` (Missing blueprint prompt: *"Data blueprint belum diisi"*).
- **LOADING_ERROR_EMPTY_STATUS:** Loading shows *"Membuka profil jiwamu..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `LOCALE_DEPENDENT` (Birth date rendered using `toLocaleDateString`).
- **BUILD_107_REGRESSION_RISK:** MEDIUM (Must maintain seamless navigation to all 11 blueprint subpages).
- **DEPENDENCIES:** `components/profile/*`, `lib/storage/storageProvider`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Full component migration to English `t.profile`.

---

### Page 7: Profile Section Detail Page
- **PAGE:** Profile Deep Section Detail
- **ROUTE:** `app/profile/[section]/page.tsx`
- **PURPOSE:** Dynamic subpage for focused blueprint pillars (`identity`, `potential`, `healing`, `relationships`).
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED`.
- **HARDCODED_ID_COUNT:** 18 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** Empty state: *"Bagian ini belum memiliki data"*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/profile/details/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Migrate section titles, descriptions, and tab buttons to English.

---

### Page 8: Blueprint Hub Page
- **PAGE:** 11 Soul Blueprint Systems Directory
- **ROUTE:** `app/blueprint/page.tsx`
- **PURPOSE:** Index page providing cards to enter each of the 11 cosmic/esoteric systems.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"11 Peta Kesadaran"*, *"Jelajahi cetak biru jiwamu melalui berbagai kearifan kuno"*).
- **HARDCODED_ID_COUNT:** 16 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/navigation/AppNav`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate system card descriptions into English.

---

### Page 9: Blueprint — Astrocartography
- **PAGE:** Planetary Lines & Geographical Resonance
- **ROUTE:** `app/blueprint/astrocartography/page.tsx`
- **PURPOSE:** Renders world map with user's planetary lines (Sun, Moon, Venus, Jupiter) and auspicious locations.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED`.
- **HARDCODED_ID_COUNT:** 12 occurrences in page; 45+ in engine.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP` (`lib/astrocartography/presentation.ts` produces ID strings).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** Map loading shows *"Menghitung garis lintang planet..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/blueprint/AstrocartographyMap`, `lib/astrocartography/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Localize engine presentation and location explanations into English.

---

### Page 10: Blueprint — BaZi (Four Pillars of Destiny)
- **PAGE:** Chinese Metaphysics & Element Balance
- **ROUTE:** `app/blueprint/bazi/page.tsx`
- **PURPOSE:** Four Pillars calculation, Day Master identification, and Five Elements balance.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Empat Pilar Takdir"*, *"Energi Elemen Batin"*).
- **HARDCODED_ID_COUNT:** 15 occurrences in page; 60+ in engine.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP` (`lib/bazi/baziMeaning.ts` is 100% ID).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Menyusun pilar kelahiran..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/bazi/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` (with `INTENTIONALLY_LOCAL_TERM` elements: retain Chinese characters & pinyin *Jia, Yi, Bing, Ding...* alongside English elemental translations *Yang Wood, Yin Wood*).

---

### Page 11: Blueprint — Destiny Matrix
- **PAGE:** 22 Major Arcana Energy Matrix
- **ROUTE:** `app/blueprint/destiny-matrix/page.tsx`
- **PURPOSE:** Octagram energy topology, Karmic Tail, Money Line, Love Line, and Ancestral Lines.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Matriks Takdir"*, *"Ekor Karmic"*, *"Jalur Finansial"*).
- **HARDCODED_ID_COUNT:** 22 occurrences in page; 120+ in engine.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP` (`lib/destiny-matrix/presentation.ts` produces ID paragraphs).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Menghitung pola arcana..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW (Calculation topology in `topology.ts` is purely mathematical).
- **DEPENDENCIES:** `components/blueprint/DestinyMatrixVisual`, `lib/destiny-matrix/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Localize all 22 Arcana definitions, line narratives, and card tooltips into English.

---

### Page 12: Blueprint — Human Design
- **PAGE:** Comprehensive Human Design Bodygraph Reading
- **ROUTE:** `app/blueprint/human-design/page.tsx`
- **PURPOSE:** Full bodygraph, Centers, Channels, Gates, Profile, Authority, Strategy, Digestion, Environment, and Incarnation Cross.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Desain Manusia"*, *"Pusat Energi"*, *"Otoritas Batin"*).
- **HARDCODED_ID_COUNT:** 26 occurrences in page; 200+ in engine.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `API_LANGUAGE_GAP` (`/api/humandesign/calculate` returns canonical English types, but `lib/humandesign/presentation.ts` translates them to ID).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP` (Hardcoded ID reading paragraphs in `presentation.ts`).
- **LOADING_ERROR_EMPTY_STATUS:** Status pill shows *"Sedang menghitung..."* if pending.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** **CRITICAL** (Must strictly inherit Build 107 HD convergence and avoid touching `hdAudit.ts` or `hdState.ts` resolution logic).
- **DEPENDENCIES:** `components/blueprint/HumanDesignBodygraphLite`, `lib/humandesign/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Provide native English reading generator in `lib/humandesign/presentation.ts`; retain canonical terms (*Generator, Projector, Sacral, Ajna*).

---

### Page 13: Blueprint — Natal Chart
- **PAGE:** Western Astrology Birth Chart
- **ROUTE:** `app/blueprint/natal-chart/page.tsx`
- **PURPOSE:** Renders astrological wheel, planetary positions, house cusps, and major aspects (conjunction, square, trine).
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Bagan Kelahiran Astrologi"*, *"Posisi Planet"*, *"Aspek Antar Planet"*).
- **HARDCODED_ID_COUNT:** 20 occurrences in page; 150+ in engine.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP` (`lib/astrology/presentation.ts` is 100% ID).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Menghitung orbit langit saat kelahiranmu..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/blueprint/NatalWheelLite`, `lib/astrology/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Localize astrology presentation and aspect interpretation into English.

---

### Page 14: Blueprint — Numerology / Life Path
- **PAGE:** Numerology & Six Pillars of Life Purpose
- **ROUTE:** `app/blueprint/numerology/page.tsx`
- **PURPOSE:** Displays Life Path, Expression Number, Soul Urge, Personality Number, Birthday Number, and Personal Year.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Jalan Jiwamu"*, *"Enam pilar utama numerologi"*, *"Kesimpulan Dirimu"*).
- **HARDCODED_ID_COUNT:** 18 occurrences in page; 80+ in data files.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP` (`lib/data/numerology.ts` carries Indonesian core journeys and major lessons).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Membuka data numerologi..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/data/numerology.ts`, `lib/numerology/presentation.ts`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Add complete English translations for all Life Path roles, journeys, and synthesis sentences.

---

### Page 15: Blueprint — Tzolkin (Mayan Dreamspell)
- **PAGE:** Mayan Cosmic Calendar & Solar Seal
- **ROUTE:** `app/blueprint/tzolkin/page.tsx`
- **PURPOSE:** Kin number, Solar Seal (20 Archetypes), and Galactic Tone (13 Wavespells).
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Kalender Kosmik Maya"*, *"Segel Surya"*, *"Nada Galaktik"*).
- **HARDCODED_ID_COUNT:** 14 occurrences in page; 50+ in engine.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP` (`lib/tzolkin/presentation.ts` is ID).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Menghitung siklus waktu sakral..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/tzolkin/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` (with `INTENTIONALLY_LOCAL_TERM`: retain authentic Mayan names *Imix, Ik, Akbal, Kan...* accompanied by English meaning *Red Dragon, White Wind, Blue Night...*).

---

### Page 16: Blueprint — Vedic Astrology (Jyotish)
- **PAGE:** Indian Sidereal Astrology & Nakshatras
- **ROUTE:** `app/blueprint/vedic/page.tsx`
- **PURPOSE:** Moon Sign (Rashi), Nakshatra (Lunar Mansion), Pada, and Current Dasha period.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Astrologi Weda"*, *"Bintang Bulan / Nakshatra"*, *"Siklus Kehidupan (Dasha)"*).
- **HARDCODED_ID_COUNT:** 16 occurrences in page; 50+ in engine.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP` (`lib/vedic/presentation.ts` is ID).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Mengkaji posisi bintang Weda..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/vedic/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` (with `INTENTIONALLY_LOCAL_TERM`: retain Sanskrit terms *Ashwini, Bharani, Krittika, Mahadasha* with English explanatory gloss).

---

### Page 17: Blueprint — Weton (Javanese Cosmology)
- **PAGE:** Javanese Calendar & Primbon Identity
- **ROUTE:** `app/blueprint/weton/page.tsx`
- **PURPOSE:** Dina (Day), Pasaran (Market Day), Neptu calculation, and Pancasuda life character.
- **STATIC_COPY_STATUS:** `INTENTIONALLY_LOCAL_TERM` (Core names are cultural; explanations are hardcoded ID).
- **HARDCODED_ID_COUNT:** 20 occurrences in page; 40+ in engine.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INTENTIONALLY_LOCAL_TERM`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP` (`lib/weton/presentation.ts` is ID).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Membuka hitungan pawukon & weton..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/weton/*`.
- **VERDICT:** `INTENTIONALLY_LOCAL_TERM` — Strictly preserve Javanese terms (*Legi, Pahing, Pon, Wage, Kliwon, Neptu, Tunggak Semi, Satria Wibawa*); rewrite all explanations, summaries, and personality traits into dignified English.

---

### Page 18: Blueprint — Whole Sign Astrology
- **PAGE:** Whole Sign Astrological House System
- **ROUTE:** `app/blueprint/whole-sign/page.tsx`
- **PURPOSE:** Classical Hellenistic house placement where each sign equals an entire house.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED`.
- **HARDCODED_ID_COUNT:** 12 occurrences in page; 30+ in engine.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Menata ulang rumah zodiak..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/whole-sign/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Localize Whole Sign descriptions and house dynamics into English.

---

### Page 19: Blueprint — Zi Wei Dou Shu
- **PAGE:** Purple Star Astrology (Chinese Imperial Astrology)
- **ROUTE:** `app/blueprint/zi-wei/page.tsx`
- **PURPOSE:** 12 Life Palaces, Major Stars (Zi Wei, Tian Ji, etc.), and brightness ratings.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED`.
- **HARDCODED_ID_COUNT:** 14 occurrences in page; 40+ in engine.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Menghitung posisi bintang ungu..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/zi-wei/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate palace names and star functions into English.

---

### Page 20: Wellness Hub Page
- **PAGE:** Wellness & Energy Balance Dashboard (Coach / Pendamping Pertumbuhan)
- **ROUTE:** `app/wellness/page.tsx`
- **PURPOSE:** Energy pillars (Physical, Emotional, Mental, Spiritual), daily check-in, and wellness recommendations.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Pusat Kesejahteraan"*, *"Keseimbangan Energi Harian"*).
- **HARDCODED_ID_COUNT:** 24 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Menganalisis energi tubuh..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/wellness/*`, `lib/wellness/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Connect to `t.wellness` and provide English pillar descriptions.

---

### Page 21: Wellness Assessment Page
- **PAGE:** Comprehensive Holistic Health & Energy Questionnaire
- **ROUTE:** `app/wellness-assessment/page.tsx`
- **PURPOSE:** 25-question holistic assessment evaluating stress, sleep, physical vitality, emotional stability, and purpose.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (All 25 assessment prompts and multiple-choice scales are hardcoded ID).
- **HARDCODED_ID_COUNT:** 48 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** Completion screen shows *"Menyimpan hasil asesmen..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/wellness/WellnessAssessmentFlow`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Full English translation of all 25 assessment questions, Likert scale labels, and completion insights.

---

### Page 22: Journey Hub Page
- **PAGE:** Stages of Return & Milestone Navigator (Navigator / Pemandu Perjalanan)
- **ROUTE:** `app/journey/page.tsx`
- **PURPOSE:** Visual roadmap of user's personal transformation journey across 7 stages of awakening.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Perjalanan Jiwa"*, *"Tahap Kepulangan"*, *"Jejak Langkah"*).
- **HARDCODED_ID_COUNT:** 18 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED` (Dictionary `t.journey` has only 1 placeholder key).
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Memuat peta perjalananmu..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/journey/*`, `lib/journey/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Expand `t.journey` in `en-US` and migrate Journey roadmap cards.

---

### Page 23: Journey Detail Page
- **PAGE:** Journey Stage Milestone & Practice
- **ROUTE:** `app/journey/[id]/page.tsx`
- **PURPOSE:** Detailed stage view with guided contemplation questions and integration checkbox tasks.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED`.
- **HARDCODED_ID_COUNT:** 14 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Membuka tahap perjalanan..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/journey/details/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate stage instructions, reflective prompts, and milestone completion buttons into English.

---

### Page 24: Journal Page
- **PAGE:** Daily Soul Reflection Journaling
- **ROUTE:** `app/journal/page.tsx`
- **PURPOSE:** Guided daily journaling interface, emotional state check-in chips, and historical entry archive.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (Page header *"Jurnal Jiwa"*, prompt card *"Pertanyaan Hari Ini"*, placeholder text *"Tuliskan apa yang sedang mengalir di dalam dirimu..."* are hardcoded ID).
- **HARDCODED_ID_COUNT:** 32 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `PARTIAL_ENGLISH` (Dictionary has 41 keys in `journaling`, but `app/journal/page.tsx` does not consume them).
- **AI_LANGUAGE_STATUS:** `AI_LANGUAGE_GAP` (Daily journal prompt is provided by the AI Daily Guidance engine).
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP` (Default prompts in `DailyPromptCard.tsx` are Indonesian).
- **LOADING_ERROR_EMPTY_STATUS:** Empty state shows *"Belum ada catatan jurnal. Mulailah menulis hari ini."*.
- **DATE_NUMBER_LOCALE_STATUS:** `LOCALE_DEPENDENT` (Journal entry dates must format in English).
- **BUILD_107_REGRESSION_RISK:** LOW (Journal Firestore persistence schema unchanged).
- **DEPENDENCIES:** `components/journal/*`, `lib/journal/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Connect page and subcards to `t.journaling`; ensure English prompt fallbacks.

---

### Page 25: Inbox / Notifications Page
- **PAGE:** Notifications & Gentle Reminders Archive
- **ROUTE:** `app/inbox/page.tsx`
- **PURPOSE:** User notification feed (Daily Guidance ready, gentle night reminder, subscription notices).
- **STATIC_COPY_STATUS:** `PARTIAL_ENGLISH` (Consumes `t.notifications`).
- **HARDCODED_ID_COUNT:** 6 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `PARTIAL_ENGLISH`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP` (Empty state text: *"Belum ada pemberitahuan"*).
- **LOADING_ERROR_EMPTY_STATUS:** Loading shows *"Memuat pesan..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `LOCALE_DEPENDENT` (Relative timestamps e.g. *"2 jam yang lalu"* -> *"2 hours ago"*).
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/navigation/AppNav`, `lib/data/translations`.
- **VERDICT:** `PARTIAL_ENGLISH` — Localize empty states, relative timestamps, and notification body templates into English.

---

### Page 26: Insights Archive Page
- **PAGE:** Accumulated Daily Insights & Wisdom
- **ROUTE:** `app/insights/page.tsx`
- **PURPOSE:** Searchable archive of historical Daily Guidance cards and astrological synthesis.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED`.
- **HARDCODED_ID_COUNT:** 10 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** Empty state shows *"Belum ada wawasan yang tersimpan"*.
- **DATE_NUMBER_LOCALE_STATUS:** `LOCALE_DEPENDENT`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/insights/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate filter chips, search input, and empty states into English.

---

### Page 27: Meditation Hub Page
- **PAGE:** Sacred Meditation Timer & Ambient Music
- **ROUTE:** `app/meditation/page.tsx`
- **PURPOSE:** Meditation duration selector, breath pacer, singing bowl bells, and ambient soundscapes.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Ruang Hening"*, *"Pilih Durasi"*, *"Mulai Meditasi"*).
- **HARDCODED_ID_COUNT:** 16 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** Audio buffering status is in Indonesian.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/healing/MeditationCard`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate timer controls, bell options, and ambient track labels into English.

---

### Page 28: Healing Hub Page
- **PAGE:** Somatic & Energetic Healing Center
- **ROUTE:** `app/healing/page.tsx`
- **PURPOSE:** Gateway to chakra balancing, inner child dialogue, ancestor release, and mudra practices.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Penyembuhan Batin"*, *"Penyelarasan Cakra"*, *"Penyembuhan Anak Dalam"*).
- **HARDCODED_ID_COUNT:** 20 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** Loading shows *"Menyiapkan ruang penyembuhan..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/healing/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Localize all healing card titles and exercise intros into English.

---

### Page 29: Healing Audio Page
- **PAGE:** Frequency Sound Therapy Library
- **ROUTE:** `app/healing/audio/page.tsx`
- **PURPOSE:** Solfeggio frequencies (396Hz, 417Hz, 528Hz, 639Hz, 741Hz, 852Hz, 963Hz) and binaural beats.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Terapi Frekuensi Suara"*, *"Pelepasan Ketegangan"*, *"Harmoni Sel"*).
- **HARDCODED_ID_COUNT:** 14 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** Audio player load error alert is in Indonesian.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/healing/HealingAudio`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Localize frequency explanations and player buttons into English.

---

### Page 30: Healing Guided Meditation Page
- **PAGE:** Guided Somatic Meditation Library
- **ROUTE:** `app/healing/meditation/page.tsx`
- **PURPOSE:** Pre-recorded guided voice meditations for grounding, sleep, and emotional regulation.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED`.
- **HARDCODED_ID_COUNT:** 12 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Memuat sesi panduan..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/healing/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate session titles and descriptions into English.

---

### Page 31: Innerwork Hub Page
- **PAGE:** Daily Innerwork Practices & Somatic Modules
- **ROUTE:** `app/innerwork/page.tsx`
- **PURPOSE:** Central directory for the 7 somatic innerwork practices.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Praktik Kedalaman Batin"*, *"Jelajahi latihan sehari-hari"*).
- **HARDCODED_ID_COUNT:** 18 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/navigation/AppNav`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate module cards into English.

---

### Page 32: Innerwork — Audio Healing
- **PAGE:** Daily Innerwork Sound Alignment
- **ROUTE:** `app/innerwork/audio-healing/page.tsx`
- **PURPOSE:** Short 5-minute frequency alignments tailored to daily guidance.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED`.
- **HARDCODED_ID_COUNT:** 12 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Memuat audio..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/audioHealing/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — English page copy and audio title metadata.

---

### Page 33: Innerwork — Herbal & Nutrition
- **PAGE:** Herbal Wisdom & Botanical Tea Guides
- **ROUTE:** `app/innerwork/herbal/page.tsx`
- **PURPOSE:** Natural herbal concoctions, mindful nutrition, and grounding herbal teas.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Kebijaksanaan Herbal"*, *"Resep Seduhan Alami"*).
- **HARDCODED_ID_COUNT:** 16 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/innerwork/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate recipe instructions, botanical ingredient names, and health notes into English.

---

### Page 34: Innerwork — Deep Journaling
- **PAGE:** Shadow-Work & Soul Dialogue Journaling
- **ROUTE:** `app/innerwork/journaling/page.tsx`
- **PURPOSE:** Advanced psychological and emotional shadow integration exercises.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Menyelami Bayang Diri"*, *"Pertanyaan Integrasi"*).
- **HARDCODED_ID_COUNT:** 15 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Menyimpan refleksi..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/innerwork/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate shadow-work prompts and instructions into English.

---

### Page 35: Innerwork — Manifestasi (Intentional Alignment)
- **PAGE:** Grounded Intention Setting & Manifestation
- **ROUTE:** `app/innerwork/manifestasi/page.tsx`
- **PURPOSE:** Daily conscious intention creation aligned with astrology transits and Life Path.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Menanam Niat Sadar"*, *"Langkah Nyata Hari Ini"*).
- **HARDCODED_ID_COUNT:** 14 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `AI_LANGUAGE_GAP` (Manifestation prompt generated by AI).
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Menghubungkan niat..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/prompts/bhumiManifestationPrompt.ts`.
- **VERDICT:** `INDONESIAN_HARDCODED` — English intention form and prompt generator.

---

### Page 36: Innerwork — Somatic Meditation
- **PAGE:** Breathwork & Nervous System Regulation
- **ROUTE:** `app/innerwork/meditation/page.tsx`
- **PURPOSE:** Box breathing, 4-7-8 relaxation breath, and body scans.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Pernapasan Sadar"*, *"Tarik Napas"*, *"Tahan"*, *"Hembuskan"*).
- **HARDCODED_ID_COUNT:** 17 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/healing/MeditationCard`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate breath pacing labels (*Inhale, Hold, Exhale*) and instructions into English.

---

### Page 37: Innerwork — Workout (Mindful Movement)
- **PAGE:** Somatic Movement & Gentle Energy Flow
- **ROUTE:** `app/innerwork/workout/page.tsx`
- **PURPOSE:** Physical stretches, somatic shakes, and gentle calisthenics to release trapped tension.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Gerak Sadar Tubuh"*, *"Pelepasan Ketegangan Fisik"*).
- **HARDCODED_ID_COUNT:** 12 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/innerwork/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate movement routines and repetition counts into English.

---

### Page 38: Innerwork — Yoga & Asana Alignment
- **PAGE:** Mindful Restorative Yoga
- **ROUTE:** `app/innerwork/yoga/page.tsx`
- **PURPOSE:** Gentle restorative yoga poses mapped to chakras and energy centers.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Yoga Pemulihan"*, *"Pose Penyelarasan Cakra"*).
- **HARDCODED_ID_COUNT:** 14 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/innerwork/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` (with `INTENTIONALLY_LOCAL_TERM`: retain Sanskrit asana names *Balasana, Tadasana, Savasana* with English guidance).

---

### Page 39: Kenali Diri — Aura Resonance Page
- **PAGE:** Energetic Aura & Color Field Analysis
- **ROUTE:** `app/kenali-diri/aura/page.tsx`
- **PURPOSE:** Intuitive energetic color resonance calculator and chakra aura reading.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Membaca Warna Auramu"*, *"Resonansi Medan Energi"*).
- **HARDCODED_ID_COUNT:** 16 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `API_LANGUAGE_GAP` (`/api/kenali-diri/aura` returns hardcoded ID descriptions).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** *"Menganalisis getaran frekuensi..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `app/api/kenali-diri/aura/route.ts`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Localize page and API route into English.

---

### Page 40: Weekly Reports Page
- **PAGE:** Weekly Soul Synthesis & Rhythm Report
- **ROUTE:** `app/reports/weekly/page.tsx`
- **PURPOSE:** Sunday soul integration report summarizing user's past 7 days of reflections, habits, and celestial weather.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Laporan Mingguan Jiwa"*, *"Rangkuman Perjalanan 7 Hari"*).
- **HARDCODED_ID_COUNT:** 18 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `BACKEND_LANGUAGE_GAP`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** Empty state: *"Laporan mingguan akan tersedia setelah 3 hari refleksi"*.
- **DATE_NUMBER_LOCALE_STATUS:** `LOCALE_DEPENDENT` (Date ranges e.g. *"28 Agustus - 4 September 2026"*).
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `lib/reports/*`.
- **VERDICT:** `INDONESIAN_HARDCODED` — English weekly report templates and date range formatting.

---

### Page 41: Settings Page
- **PAGE:** User Settings, Account & Preferences
- **ROUTE:** `app/settings/page.tsx`
- **PURPOSE:** Profile editing, notification toggles, language preferences, subscription management, danger zone blueprint reset, and account deletion.
- **STATIC_COPY_STATUS:** `PARTIAL_ENGLISH` (Consumes `t.settings` for titles and form fields; Danger Zone, Account Deletion, and Membership status cards are hardcoded ID).
- **HARDCODED_ID_COUNT:** 35 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `PARTIAL_ENGLISH` (50% covered).
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP` (Save confirmation: *"Data berhasil diperbarui"*, error: *"Gagal menyimpan pengaturan"*).
- **LOADING_ERROR_EMPTY_STATUS:** Loading shows *"Membuka pengaturan..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `LOCALE_DEPENDENT` (Line 68 `toDisplayDate()` uses hardcoded `"id-ID"`).
- **BUILD_107_REGRESSION_RISK:** MEDIUM (Must preserve account deletion flow, FCM notification registration, and manual blueprint recovery).
- **DEPENDENCIES:** `lib/data/translations`, `lib/billing/*`, `lib/notifications/*`.
- **VERDICT:** `PARTIAL_ENGLISH` — Localize Danger Zone, Account Deletion modal, and Membership cards; dynamic date locale.

---

### Page 42: Premium Bhumi (Paywall) Page
- **PAGE:** Premium Membership & Subscription Plans
- **ROUTE:** `app/premium-bhumi/page.tsx`
- **PURPOSE:** Presents subscription tiers (Monthly, Annual, Lifetime Guardian), feature matrix, and Google Play Billing purchase triggers.
- **STATIC_COPY_STATUS:** `PARTIAL_ENGLISH` (Consumes `t.premiumBhumi`, but billing terms and FAQ accordions are ID).
- **HARDCODED_ID_COUNT:** 15 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `PARTIAL_ENGLISH`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY` (Google Play Billing prices retrieved from store).
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP` (Purchase failure toasts in Indonesian).
- **LOADING_ERROR_EMPTY_STATUS:** *"Menghubungkan layanan langganan..."*.
- **DATE_NUMBER_LOCALE_STATUS:** `LOCALE_DEPENDENT` (Prices formatted in IDR `Rp 149.000` vs international `$9.99`).
- **BUILD_107_REGRESSION_RISK:** **CRITICAL** (Must preserve Build 107 billing behavior, entitlement persistence, and four-admin Lifetime bypass).
- **DEPENDENCIES:** `lib/billing/*`, `components/billing/*`.
- **VERDICT:** `PARTIAL_ENGLISH` — Translate paywall disclaimers, feature benefits, and FAQ answers into English.

---

### Page 43: Upgrade Landing Page
- **PAGE:** Feature Upgrade Showcase
- **ROUTE:** `app/upgrade/page.tsx`
- **PURPOSE:** Promotional landing page highlighting features unlocked with Premium Bhumi.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Buka Seluruh Potensi Jiwamu"*, *"Akses Tanpa Batas ke 11 Peta Kesadaran"*).
- **HARDCODED_ID_COUNT:** 22 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `FALLBACK_LANGUAGE_GAP`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/navigation/AppNav`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Full English translation of upgrade promotional copy.

---

### Page 44: Help Center Page
- **PAGE:** FAQ & User Support Guide
- **ROUTE:** `app/bantuan/page.tsx`
- **PURPOSE:** Answers common questions regarding blueprint calculation, journaling, and data recovery.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Pusat Bantuan"*, *"Apa itu Blueprint Jiwa?"*, *"Butuh bantuan lebih lanjut?"*).
- **HARDCODED_ID_COUNT:** 12 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED` (0% dictionary coverage).
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/navigation/AppNav`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Full English rewrite of help questions and answers.

---

### Page 45: Contact Page
- **PAGE:** Customer Support & Inquiries
- **ROUTE:** `app/kontak/page.tsx`
- **PURPOSE:** Directs users to support email and developer contact.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Hubungi Kami"*, *"Butuh bantuan atau ingin memberi masukan?"*).
- **HARDCODED_ID_COUNT:** 6 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** Static JSX.
- **VERDICT:** `INDONESIAN_HARDCODED` — Translate Contact Us copy into English.

---

### Page 46: About Page
- **PAGE:** About Bhumi Amartya Story & Vision
- **ROUTE:** `app/tentang/page.tsx`
- **PURPOSE:** Foundational philosophy, origins, team mission, and vision of Bhumi as a Personal Intelligence Platform.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (193 lines of rich Indonesian prose: *"Rumah untuk Pulang dan Mengenali Diri"*, *"Setiap orang memiliki perjalanan hidup yang unik..."*).
- **HARDCODED_ID_COUNT:** 45 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED` (0% dictionary coverage).
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `ENGLISH_READY`.
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** `components/navigation/AppNav`.
- **VERDICT:** `INDONESIAN_HARDCODED` — Full English translation capturing the authentic, warm, and poetic tone of the Bhumi manifesto.

---

### Page 47: Terms & Conditions Page
- **PAGE:** Legal Terms of Service
- **ROUTE:** `app/syarat-ketentuan/page.tsx`
- **PURPOSE:** Formal user agreement, liability limitations, and entertainment/wellbeing disclaimers.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Syarat & Ketentuan"*, *"Penggunaan Layanan"*, *"Batasan Tanggung Jawab"*).
- **HARDCODED_ID_COUNT:** 15 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `LOCALE_DEPENDENT` (Date of last update: *"6 Juni 2026"*).
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** Static JSX.
- **VERDICT:** `INDONESIAN_HARDCODED` — Formal English Terms of Service legal document.

---

### Page 48: Privacy Policy Page
- **PAGE:** Legal Privacy Policy & Data Retention
- **ROUTE:** `app/kebijakan-privasi/page.tsx`
- **PURPOSE:** Discloses data collection practices (birth date/time/location), storage mechanisms (Firebase, LocalStorage), and user deletion rights.
- **STATIC_COPY_STATUS:** `INDONESIAN_HARDCODED` (*"Kebijakan Privasi"*, *"Informasi yang Kami Kumpulkan"*, *"Penghapusan Akun"*).
- **HARDCODED_ID_COUNT:** 16 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `INDONESIAN_HARDCODED`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **FALLBACK_LANGUAGE_STATUS:** `ENGLISH_READY`.
- **LOADING_ERROR_EMPTY_STATUS:** `ENGLISH_READY`.
- **DATE_NUMBER_LOCALE_STATUS:** `LOCALE_DEPENDENT` (Date of last update: *"6 Juni 2026"*).
- **BUILD_107_REGRESSION_RISK:** LOW.
- **DEPENDENCIES:** Static JSX.
- **VERDICT:** `INDONESIAN_HARDCODED` — Formal English Privacy Policy required for Google Play Console compliance.

---

### Page 49: Admin Console Page (Internal)
- **PAGE:** Internal System Administrator Dashboard
- **ROUTE:** `app/admin/page.tsx`
- **PURPOSE:** Internal administrative metrics and system status (gated off from production builds).
- **STATIC_COPY_STATUS:** `OUT_OF_SCOPE` (Gated).
- **HARDCODED_ID_COUNT:** 4 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `OUT_OF_SCOPE`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **FALLBACK_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **LOADING_ERROR_EMPTY_STATUS:** `OUT_OF_SCOPE`.
- **DATE_NUMBER_LOCALE_STATUS:** `OUT_OF_SCOPE`.
- **BUILD_107_REGRESSION_RISK:** **CRITICAL** (Must NEVER remove `isAdminUiExposed()` redirect gate or link from `AppNav.tsx`).
- **DEPENDENCIES:** `lib/config/adminUiExposure.ts`.
- **VERDICT:** `OUT_OF_SCOPE` (Admin backend console; must remain gated off in production).

---

### Page 50: Admin Activity Page (Internal)
- **PAGE:** User Activity & Security Ledger
- **ROUTE:** `app/admin/activity/page.tsx`
- **PURPOSE:** Internal security audit log and user activity stream.
- **STATIC_COPY_STATUS:** `OUT_OF_SCOPE` (Gated).
- **HARDCODED_ID_COUNT:** 15 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `OUT_OF_SCOPE`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **FALLBACK_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **LOADING_ERROR_EMPTY_STATUS:** `OUT_OF_SCOPE`.
- **DATE_NUMBER_LOCALE_STATUS:** `OUT_OF_SCOPE`.
- **BUILD_107_REGRESSION_RISK:** **CRITICAL** (Must maintain `adminUiExposed && hasPrivilegedPageAccessForUid` double gate).
- **DEPENDENCIES:** `lib/config/adminUiExposure.ts`, `lib/auth/privilegedUser.ts`.
- **VERDICT:** `OUT_OF_SCOPE` (Admin backend console; must remain gated off in production).

---

### Page 51: Admin Diagnostics Page (Internal)
- **PAGE:** Auth & System Diagnostics Console
- **ROUTE:** `app/admin/diagnostics/page.tsx`
- **PURPOSE:** Developer diagnostics for verifying Firebase Auth token integrity and emulator sessions.
- **STATIC_COPY_STATUS:** `DEV_ONLY` (Gated).
- **HARDCODED_ID_COUNT:** 5 occurrences.
- **HARDCODED_MS_COUNT:** 0.
- **I18N_COVERAGE:** `DEV_ONLY`.
- **AI_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **API_LANGUAGE_STATUS:** `OUT_OF_SCOPE`.
- **FALLBACK_LANGUAGE_STATUS:** `DEV_ONLY`.
- **LOADING_ERROR_EMPTY_STATUS:** `DEV_ONLY`.
- **DATE_NUMBER_LOCALE_STATUS:** `DEV_ONLY`.
- **BUILD_107_REGRESSION_RISK:** **CRITICAL** (Must remain inaccessible to regular users and gated off in production).
- **DEPENDENCIES:** `lib/config/adminUiExposure.ts`.
- **VERDICT:** `DEV_ONLY` / `OUT_OF_SCOPE`.

---

## 3. Global Language Architecture Audit Findings

### 3.1 Current Multi-Language Reality
1. **Resource Files:** Three bundles exist in `src/locales/`:
   - `id-ID/translation.json` (18 sections, ~350 keys) — Primary ground truth.
   - `en-US/translation.json` (18 sections, ~350 keys) — Partial coverage of core shell.
   - `ms-MY/translation.json` (18 sections, ~350 keys) — Minor Malay variant.
2. **Component Usage Reality:** Out of 105 components and 51 routes, only 16 files consume translations. 89 files are unmigrated and contain hardcoded Indonesian text.
3. **Engine Presentation Reality:** None of the 11 blueprint engines accept a locale parameter; all 11 format strings in Indonesian.
4. **AI Generation Reality:** `dailyGuidancePrompt.ts` instructs the LLM to write in English when requested, but includes Indonesian system framing, greeting defaults, and fallback strings.

---

## 4. Architectural Decisions & Policy Declarations

The following canonical answers govern Build 108 ENL:

```text
BUILD_108_ENL_LANGUAGE_MODEL        = OPTION_C_UNIFIED_EDITION_FLAGGED
VISIBLE_LANGUAGES                   = ["en"] (ENL mode) / ["en", "id", "ms"] (Multilingual mode)
INTERNAL_FALLBACK_LANGUAGES         = ["en", "id"]
EXISTING_USER_LOCALE_BEHAVIOR       = PRESERVE_PROFILE_INITIALIZE_ENL_SESSION
AI_OUTPUT_LANGUAGE_POLICY           = STRICT_ENGLISH_END_TO_END
API_OUTPUT_LANGUAGE_POLICY          = STRICT_ENGLISH_CANONICAL
INTENTIONALLY_UNTRANSLATED_TERMS    = CULTURAL_TERMS_CANONICAL_PRESERVED
```

### Detailed Explanations:

1. **`BUILD_108_ENL_LANGUAGE_MODEL = OPTION_C_UNIFIED_EDITION_FLAGGED`**
   - Single repository and unified codebase.
   - Controlled by build environment flag `NEXT_PUBLIC_APP_EDITION=ENL`.
   - In ENL edition mode, English is elevated to 100% native coverage across all 51 routes, 11 blueprint engines, AI guidance narratives, and legal surfaces.

2. **`VISIBLE_LANGUAGES = ["en"]`**
   - In the Build 108 ENL artifact, user-facing language switchers on the Landing page (`app/page.tsx`) and Settings page (`app/settings/page.tsx`) are hidden.
   - The app runs exclusively in English without cluttering the UI with inactive language options.

3. **`INTERNAL_FALLBACK_LANGUAGES = ["en", "id"]`**
   - Fallback Chain: Keyed English -> English descriptive programmatic fallback -> `id-ID` (last resort safety net).
   - Under no circumstances are `id-ID` resources deleted from source control.

4. **`EXISTING_USER_LOCALE_BEHAVIOR = PRESERVE_PROFILE_INITIALIZE_ENL_SESSION`**
   - Upgrading users retain their existing Firestore user document (`users/{uid}.language`).
   - The ENL client binary initializes the active session to English.
   - Calculations and blueprints re-render in English. Historical user-generated journal entries remain intact.

5. **`AI_OUTPUT_LANGUAGE_POLICY = STRICT_ENGLISH_END_TO_END`**
   - `buildDailyGuidancePrompt()` strictly sets `outputLanguage = "en"`.
   - Indonesian boilerplate ("Halo {firstName}", "Peluk hangat dari Bhumi.") is replaced with dignified English equivalents ("Welcome, {firstName}", "Warmly with you, Bhumi.").
   - Deterministic local guidance fallback (`localDailyGuidanceFallback.ts`) returns 100% English strings when `language === "en"`.

6. **`API_OUTPUT_LANGUAGE_POLICY = STRICT_ENGLISH_CANONICAL`**
   - Internal Next.js API routes (`/api/ai/daily-guidance`, `/api/humandesign/calculate`, `/api/kenali-diri/aura`) return canonical English payloads and error descriptions.

7. **`INTENTIONALLY_UNTRANSLATED_TERMS = CULTURAL_TERMS_CANONICAL_PRESERVED`**
   - Authentic cosmological terms are strictly preserved:
     - **Weton:** *Dina*, *Pasaran* (*Legi, Pahing, Pon, Wage, Kliwon*), *Neptu*, *Pancasuda*.
     - **BaZi:** *Day Master*, *Yin/Yang Elements*, *Tian Gan*, *Di Zhi*.
     - **Tzolkin:** *Solar Seals* (*Imix, Ik, Akbal...*), *Galactic Tones*.
     - **Vedic:** *Nakshatras*, *Dashas*, *Rashi*.
     - **Human Design:** *Sacral*, *Ajna*, *Generator*, *Projector*, *Manifestor*, *Reflector*.
   - Surrounding explanations, personality descriptions, and guidance must be rendered in fluent, native English.

---

## 5. Audit Summary Totals

```text
TOTAL_ROUTES                       = 51
TOTAL_USER_FACING_PAGES            = 48
DEV_OR_DEPRECATED_SURFACES         = 3 (app/admin/page, app/admin/activity, app/admin/diagnostics)
ENGLISH_READY_PAGES                = 0
PARTIAL_ENGLISH_PAGES              = 8
INDONESIAN_HARDCODED_PAGES         = 39
INTENTIONALLY_LOCAL_TERM_PAGES     = 1
ROUTE_LEVEL_HARDCODED_ID_FINDINGS  = 560
COMPONENT_LEVEL_HARDCODED_ID       = 389
TOTAL_HARDCODED_ID_FINDINGS        = 949+
MALAY_HARDCODED_FINDINGS           = 1
AI_LANGUAGE_GAPS                   = 5 (all major guidance prompts)
API_LANGUAGE_GAPS                  = 3 (ai, humandesign, aura routes)
BACKEND_LANGUAGE_GAPS              = 11 (all 11 blueprint engines)
FALLBACK_LANGUAGE_GAPS             = 6 (daily guidance fallback, CoreIdentity, timeOfDay)
BUILD_107_REGRESSION_RISKS         = 4 (HD convergence, Admin gate, Static route guard, Version sync)
RECOMMENDED_SPRINT_COUNT           = 8 Sprints
ARCHITECTURE_RECOMMENDATION        = OPTION C (Unified First-Class English Edition Architecture)
```

```text
BUILD_108_ENL_IMPLEMENTATION_STATUS = NOT_STARTED
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_PAGE_AUDIT_AND_SPRINT_PLAN
```
