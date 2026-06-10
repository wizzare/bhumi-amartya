# Timezone Audit

Date: 2026-06-06

Search terms audited: `Date`, `new Date`, `UTC`, `timezone`, `longitude/15`, `offset`, `toISOString`.

## Summary

| Priority | Count | Theme |
| --- | ---: | --- |
| P0 | 1 | HD accuracy cannot be verified without backend/provider |
| P1 | 8 | Birth/date calculations that can shift or lose timezone precision |
| P2 | 7 | Daily/local-date and API architecture risks |
| P3 | Many | Storage timestamps, display dates, admin exports |

## Findings

| File | Line | Risk | Impact | Recommended fix |
| --- | ---: | --- | --- | --- |
| `lib/humandesign/calculateHumanDesign.ts` | 24 | P0 | Falls back when verified HD engine unavailable | Use hosted/Firebase backend provider before claiming HD type |
| `lib/humandesign/calculateHumanDesignType.ts` | 74 | P1 | Fallback conversion depends on fixed offset; okay for `+07:00`, incomplete for IANA/historical zones | Support IANA timezone or backend timezone resolution |
| `lib/humandesign/calculateHumanDesignType.ts` | 88 | P1 | Longitude fallback still approximates timezone if offset missing | Treat missing timezone as `needs_verified_engine` rather than estimating from longitude |
| `lib/astrology/calculateNatalBasics.ts` | 84 | P1 | Timezone parser only accepts `+HH:mm`; `Asia/Jakarta` from `lib/data/firstUser.ts` is unsupported | Normalize stored timezone to offset or support IANA |
| `lib/astrology/calculateNatalBasics.ts` | 95 | P1 | Moon/Ascendant depend fully on fixed offset conversion | Centralize shared timezone conversion helper |
| `lib/astrology/calculateNatalBasics.ts` | 30 | P1 | City fallback lacks Bangil/Selong and many beta locations | Use selected coordinates plus timezone API/backend lookup |
| `app/setup/page.tsx` | 100 | P1 | Selected city timezone defaults to `+07:00`; wrong for many non-WIB cities if selectedCity has no timezone | Include timezone in autocomplete/backend geocode result |
| `app/settings/page.tsx` | 377 | P1 | Settings regeneration can preserve null/old timezone or fallback from limited city list | Same timezone resolver as setup |
| `lib/calculations/calculateArcanaCenter.ts` | 32 | P1 | `new Date("YYYY-MM-DD")` parses as UTC in JS; day can shift in negative timezones | Parse `YYYY-MM-DD` by string parts |
| `lib/calculations/calculateSunSign.ts` | 2 | P1 | Uses local-midnight date range; cusp dates not astronomical | Compute Sun longitude when birth time/timezone are available |
| `components/dashboard/DashboardClient.tsx` | 122 | P2 | Daily guidance date key uses browser/device local day | Store user timezone and derive local date from it |
| `components/dashboard/DashboardClient.tsx` | 187 | P2 | Current sky uses `new Date()` runtime, not user-local noon or explicit timezone | Use user-local date/time context |
| `lib/dailyGuidance/dateKey.ts` | 1 | P2 | Local date key depends on runtime environment | Add timezone-aware date key helper |
| `lib/dailyGuidance/adaptiveDailyPracticeGenerator.ts` | 36 | P2 | Yesterday is computed from UTC midnight of date string | Use local date arithmetic by date parts |
| `lib/dailyGuidance/adaptiveContext.ts` | 19 | P2 | Adds days using UTC date string; can diverge from local date assumptions | Use date-key arithmetic helper |
| `app/api/humandesign/calculate/route.ts` | 31 | P2 | Timezone normalization accepts numeric/string offset but service is localhost-only | Move HD service behind deployed backend |
| `app/api/humandesign/bodygraph/route.ts` | 90 | P2 | Builds datetime with offset string; provider accuracy depends on timezone offset correctness | Send timezone/location per provider contract |
| `lib/astrology/calculateCurrentSky.ts` | 57 | P2 | Current sky is computed for runtime instant, not necessarily user's intended local day | Pass user-local timestamp |
| `lib/analytics/usageAnalytics.ts` | 146 | P3 | Uses `toISOString()` from local date cursor, can shift analytics day | Use local date key helper |
| `lib/journey/createJourneyData.ts` | 111 | P3 | Streak/timeline use runtime local dates and ISO slices mixed | Centralize date keys |
| `lib/engines/progressCalculationEngine.ts` | 36 | P3 | Activity streak extracts UTC date from ISO timestamps | Use user-local date key for streaks |
| `lib/journal/localJournal.ts` | 156 | P3 | Date seed uses UTC ISO date | Use passed local date key |
| `lib/audioHealing/localAudioHealing.ts` | 46 | P3 | Today key uses UTC ISO split | Use local date key helper |

## Recommended Fix Order

P0:

1. Use verified HD backend/provider and stop displaying fallback as definitive.

P1:

1. Centralize timezone conversion.
2. Parse birth dates by string parts for numerology/arcana/date-only systems.
3. Add timezone resolution to city selection.
4. Compute Sun sign astronomically when birth time/timezone exists.

P2:

1. Make daily guidance date key user-timezone aware.
2. Remove `localhost` HD dependency for web/mobile.

P3:

1. Normalize analytics/progress/streak date handling after core blueprint accuracy is stable.
