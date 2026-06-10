# Daily Guidance Audit

Date: 2026-06-06

Scope: Refleksi Jiwa and Catatan Hari Ini quality, personalization, and repetition risk.

## Source Map

| Area | Source |
| --- | --- |
| Dashboard request and fallback | `components/dashboard/DashboardClient.tsx` |
| API route | `app/api/ai/daily-guidance/route.ts` |
| Main guidance engine | `lib/engines/dailyGuidanceEngine.ts` |
| Local fallback | `lib/orchestrators/localDailyGuidanceFallback.ts` |
| Blueprint synthesis | `lib/dailyGuidance/unifiedBlueprintSynthesis.ts` |
| Adaptive practices | `lib/dailyGuidance/adaptiveDailyPracticeGenerator.ts` |
| Freshness checks | `lib/dailyGuidance/version.ts` |

## Refleksi Jiwa

Current behavior:

- Uses blueprint synthesis, user name, identity signals, core needs, and date seed.
- Local fallback hashes user/date/blueprint signals and selects theme variants.
- Uses signals including Life Path, Human Design type/profile, authority, strategy, Arcana, Sun, Moon, Ascendant.

Pass:

- Text should differ between users because seed includes user and blueprint signals.
- Text should differ between days when date seed changes.
- Blueprint influences theme selection.

Risks:

- If several users share similar blueprint values and date, fallback can still sound similar.
- Approximate HD can influence synthesis as if meaningful unless status/accuracy is checked.
- If AI route fails repeatedly, local fallback templates can become recognizable.

Priority:

- P0/P2: filter `humanDesign.status !== "verified" && humanDesign.status !== "ready"` or `accuracy === "approximate"` out of strong identity language.
- P3: add more fallback paragraph variants after core accuracy is fixed.

## Catatan Hari Ini

Current behavior:

- `buildPersonalDailyNote` uses synthesis, current sky, astrology transits, natal chart, Life Path, Human Design, Arcana, and date seed.
- Includes practical focus and reflection question.
- Uses preferred sky bodies and transit-ish themes.

Pass:

- Blueprint influences text through Life Path, HD, Arcana, Sun/Moon/Ascendant.
- Astrology influences text via `currentSky`, `astrologyToday`, and transit summary.
- Date seed changes selected theme and planet/transit branch.

Risks:

- Current sky uses `new Date()` in dashboard runtime. User timezone is not explicitly applied.
- `astrologyToday` can be generic fallback text.
- Approximate HD can be surfaced naturally in prose through strategy/authority.
- If `currentSky` has limited body/sign detail, many users can receive the same planet/sign language.

Priority:

- P1: use user-local date/time for current sky and daily key.
- P2: gate approximate HD out of confident personalization.
- P3: add repetition detector against previous generated text, not just practices.

## Generic Repetition Check

Existing safeguards:

- Daily guidance has stale/static fallback detection via `lib/dailyGuidance/version.ts`.
- Practices avoid exact match with yesterday in `adaptiveDailyPracticeGenerator`.
- Local fallback uses deterministic variation based on seed.

Gaps:

- Refleksi Jiwa and Catatan Hari Ini do not appear to compare full text against yesterday.
- The fallback paragraph pool is finite and can repeat across users with similar seeds.
- AI route fallback can still return polished but generic text if upstream context is thin.

## Quality Status

| Requirement | Status | Notes |
| --- | --- | --- |
| Generated text differs between users | Mostly pass | Seed includes user/blueprint |
| Generated text differs between days | Mostly pass | Date seed and localDateKey are used |
| Blueprint influences output | Pass with caveat | HD approximate should be gated |
| Astrology influences output | Partial pass | Current sky used, but timezone context weak |
| No generic repeated paragraphs | Partial pass | Practice repetition guarded; long text repetition not fully guarded |

## Recommended Fixes

P0:

- Do not use approximate Human Design as verified identity in synthesis.

P1:

- Use user timezone for `localDateKey` and `calculateCurrentSky`.

P2:

- Add a normalized-text similarity check against yesterday's `soulReflectionText` and `dailyNoteText`.

P3:

- Expand local fallback templates only after P0/P1 are complete.

## Priority Ranking

1. P0: Human Design backend accuracy and HD status gating.
2. P1: Timezone-aware daily boundary/current sky.
3. P2: Previous-text repetition detection.
4. P3: More fallback variants and richer non-generic phrasing.
