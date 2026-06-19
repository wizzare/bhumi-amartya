# Catatan Hari Ini Source Map

## Scope

Source-code and generated-structure audit only. No implementation changes.

## Active UI Chain

```text
app/dashboard/page.tsx
↓
components/dashboard/DashboardClient.tsx
↓
components/dashboard/DailyNoteV2.tsx
↓
DailyGuidance.categories
↓
localStorage cache OR Firestore dailyGuidance OR /api/ai/daily-guidance OR client local fallback
↓
dailyGuidanceEngine OR localDailyGuidanceFallback
↓
AI prompt synthesis OR legacy fallback category generation
↓
raw Blueprint + current sky + house activation + user state/history
↓
astrology / Human Design / Destiny Matrix / numerology / chakra and related engines
```

## Important Field Distinction

The visible `Catatan Hari Ini` section does **not** render:

- `DailyGuidance.dailyNoteText`
- `DailyGuidance.companionReflection.preview`
- `DailyGuidance.companionReflection.fullReflection`

It renders `DailyGuidance.categories` instead. The nine configured categories are:

1. Kondisi Umum
2. Mental
3. Keuangan
4. Percintaan
5. Relasi & Keluarga
6. Spiritual
7. Tantangan
8. Peluang
9. Saran Bhumi

Each visible category can render:

- `insight`
- `reason`
- `reflection`
- `advice`

`DailyNoteV2.withDailyCategoryAngle(...)` also appends one hardcoded daily angle to `reason` and one hardcoded question to `reflection`.

## Layer Trace

| LAYER | FILE / SERVICE | ROLE |
|---|---|---|
| Dashboard page | `app/dashboard/page.tsx` | Mounts Dashboard. |
| Dashboard client runtime | `components/dashboard/DashboardClient.tsx` | Resolves cached, stored, API-generated, or local-fallback `DailyGuidance`; passes the entire object to `DailyNoteV2`. |
| Catatan component | `components/dashboard/DailyNoteV2.tsx` | Reads `dailyGuidance.categories`, adds category angle/question text, cleans Markdown, and renders the fields. |
| Browser persistence | `localStorage` key `dailyGuidance:${uid}:${date}` | May provide the complete visible category structure. |
| Firestore persistence | `lib/repositories/dailyGuidanceRepository.ts` | Reads/writes `dailyGuidance/{uid_date}`. |
| API endpoint | `app/api/ai/daily-guidance/route.ts` | Passes raw profile, raw Blueprint, current sky, house and memory context to the Daily Guidance engine. |
| Primary runtime generator | `lib/engines/dailyGuidanceEngine.ts` | Uses Gemini output categories or a deterministic server fallback. |
| AI generation service | `buildDailyGuidancePrompt(...)` → `generateGeminiJson(...)` | Requests all nine categories from raw Blueprint, unified Blueprint synthesis, sky, house activation, wellness and journey history. |
| Prompt-level translator | `lib/prompts/dailyGuidancePrompt.ts` and `lib/prompts/bhumiDailyReflectionPrompt.ts` | Instructs AI to hide technical terms. This is not `HumanMeaningService`. |
| Local fallback generator | `lib/orchestrators/localDailyGuidanceFallback.ts` | Builds nine fixed category shells and calls `refreshDailyCompanionCategories(...)`. |
| Local advice generator | `lib/dailyGuidance/mentorAdvice.ts` | Builds category advice from fixed prose, state/progress, sky summary, wellness and raw unified Blueprint differentiators. |
| Final normalizer | `lib/dailyGuidance/normalizeUserFacingGuidance.ts` | Normalizes all category fields and replaces invalid advice. It only filters a narrow set of raw terms and number-list patterns. |

## Runtime Resolution

```text
Valid browser cache
OR
Valid Firestore DailyGuidance
OR
POST /api/ai/daily-guidance
OR
client generateLocalDailyGuidance fallback
↓
normalizeUserFacingGuidance
↓
DailyNoteV2.withDailyCategoryAngle
↓
render categories
```

### AI branch

```text
Raw Blueprint + unifiedBlueprint
+ current sky and astrology
+ natal houses and house activation
+ wellness/current state
+ journals, meditation, audio, activity and prior guidance
↓
dailyGuidancePrompt
↓
Gemini categories
↓
normalizeUserFacingGuidance
↓
DailyNoteV2
```

### Server fallback branch

`dailyGuidanceEngine.generateFallbackDailyGuidance(...)` creates only the `general` category:

- Insight: `Energi yang stabil untuk refleksi.`
- Reason: `Berdasarkan posisi Matahari dan Bulan hari ini yang selaras dengan jalurnya.`
- Reflection: `Apa satu hal yang kamu syukuri dari dirimu hari ini?`
- Advice is replaced by the normalizer because its original fallback is invalid.

The remaining eight configured categories are absent and therefore not rendered.

### Client local fallback branch

`generateLocalDailyGuidance(...)` creates all nine category shells. It then generates advice through `refreshDailyCompanionCategories(...)`.

This branch can use:

- Fixed generic category prose.
- Current completion/streak state.
- Sky summary.
- Wellness mapping.
- `unifiedBlueprint.differentiators`.

The differentiators are concatenated into advice as visible prose and are not first converted through Canonical Identity or Human Meaning.

## Dependency Verification

| DEPENDENCY | CONSUMED? | FINDING |
|---|---:|---|
| Canonical Identity | No | Catatan has no dependency on `CanonicalTranslatorService` or `CanonicalIdentity`. |
| Profile V4 Human Meaning | No | Catatan has no dependency on `HumanMeaningService`. Prompt instructions act as an independent translator. |
| State Engine | Indirectly | Daily state affects completion/adaptive context and records `dailyNoteDone`; it does not own the category meaning. |
| Journey Runtime | No | No `JourneyRuntimeAdapter` output is consumed. Raw journal, meditation, audio, activity, weekly reflection and progress data are supplied directly as memory context. |
| Dashboard Runtime | Shared Daily Guidance runtime only | It consumes the legacy/shared `DailyGuidance` object, not a KARA V3 Human Meaning-based Dashboard adapter. |
| Legacy Gaia | Indirect/non-authoritative | `gaiaProfile` is passed to innerwork recommendation generation, but it is not directly mapped into category fields. |
| Legacy Synthesizer | Yes | `buildUnifiedBlueprintSynthesis`, local blueprint synthesis, legacy intelligence outputs and raw differentiators are present in the generation/fallback system. |
| Raw Blueprint | Yes | Raw Blueprint is sent directly to the API prompt and local fallback. |
| Current sky/astrology | Yes | Current sky, transit summary, natal houses and house activations drive category generation. |

## Machine-Language Entry Points

```text
Raw Blueprint
↓
unifiedBlueprint.fullBlueprint / differentiators
↓
AI prompt or local fallback advice
↓
limited normalizer
↓
DailyGuidance.categories
↓
DailyNoteV2
```

Potential leakage enters through:

- AI output generated from raw technical payloads.
- Local fallback `blueprintContext(...)`, which joins raw differentiators.
- Cached or Firestore category content produced by an earlier generator.
- Astrology-based fixed reason text.
- The narrow normalizer, which does not generally detect zodiac labels, Human Design labels, chakra names/metrics, internal variable names, or arbitrary engine dumps.

## Source Conclusion

Catatan Hari Ini is generated by the Daily Guidance category pipeline. It does not follow `Canonical → Human Meaning → Dashboard Runtime`. It directly combines raw Blueprint, legacy synthesis, sky/state context and AI or fallback prose.
