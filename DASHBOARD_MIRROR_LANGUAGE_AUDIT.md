# Dashboard Mirror Language Audit

## Scope

Static source audit of every user-visible Mirror text source. Dynamic user records were not executed or altered.

| MIRROR FIELD / BRANCH | CURRENT TEXT | SOURCE | STATUS |
|---|---|---|---|
| Card title | `Refleksi Jiwa` | `components/dashboard/SoulReflectionCard.tsx` | HUMAN_READY |
| Card subtitle | `Mirror` | `components/dashboard/SoulReflectionCard.tsx` | HUMAN_READY |
| Context label | `Membaca jiwamu hari ini` | `components/dashboard/SoulReflectionCard.tsx` | HUMAN_READY |
| Loading/empty state | `Menyiapkan pesan untuk jiwamu...` | `components/dashboard/SoulReflectionCard.tsx` | HUMAN_READY |
| Expansion cue | `Renungkan perlahan` | `components/dashboard/SoulReflectionCard.tsx` | HUMAN_READY |
| AI-generated reflection | Runtime-generated `soulReflectionText` of 80–150 words, instructed to combine core blueprint essence and journey memory. | `dailyGuidanceEngine` → `buildDailyGuidancePrompt` → `buildBhumiSoulMirrorPrompt` → Gemini output | PARTIAL |
| Cached reflection | Exact previously generated `soulReflectionText`; semantic origin may be AI, engine fallback, or local fallback. | Browser `localStorage` key `dailyGuidance:${uid}:${date}` | PARTIAL |
| Stored reflection | Exact persisted `soulReflectionText`; semantic origin is carried only by the stored guidance branch/source. | Firestore `dailyGuidance/{uid_date}` | PARTIAL |
| API engine fallback, template 1 | `${firstName}, sebagai seorang ${dominantArchetype}, intimu ...` | `dailyGuidanceEngine.generateFallbackSoulReflection(...)` | LEGACY_OUTPUT |
| API engine fallback, template 2 | `${firstName}, energi ${dominantArchetype} ... otoritas penuh.` | `dailyGuidanceEngine.generateFallbackSoulReflection(...)` | LEGACY_OUTPUT |
| API engine fallback, template 3 | `${firstName}, sebagai ${dominantArchetype}, kamu dirancang ... ritme yang spesifik.` | `dailyGuidanceEngine.generateFallbackSoulReflection(...)` | LEGACY_OUTPUT |
| Client local fallback: Human Design branch | Includes type-specific language; the Projector branch can display `tidak perlu berlari bersama para Generator.` | `localDailyGuidanceFallback.generateSoulReflection(...)` | LEGACY_OUTPUT |
| Client local fallback: integrated narrative | Runtime text assembled from identity signals, full blueprint, Destiny Matrix, natal intelligence, career intelligence, and blueprint synthesis narrative. | `localDailyGuidanceFallback.ts` and invoked legacy intelligence engines | LEGACY_OUTPUT |
| Dynamic greeting prefix | A time-of-day greeting is prefixed to the supplied reflection. | `lib/dailyGuidance/timeOfDayGreeting.ts` via `SoulReflectionCard` | HUMAN_READY |
| Sanitizer replacement text | `blueprint gabunganmu` becomes `jiwamu`; selected technical headings are replaced or removed. | `normalizeUserFacingGuidance.ts` | PARTIAL |
| Sanitizer emergency fallback | `Hari ini, pilih satu langkah kecil yang paling ramah untuk tubuh dan batinmu...` | `normalizeUserFacingGuidance.ts` | HUMAN_READY |

## Leak-Type Verification

| LEAK TYPE | PRESENT OR PERMITTED? | ENTRY POINT |
|---|---:|---|
| Raw blueprint outputs | Yes, permitted by the chain | Raw blueprint is supplied to unified synthesis and fallback generators without passing through Profile V4 Human Meaning. |
| Raw astrology labels | Yes, permitted by the chain | Natal Sun/Moon and other astrology signals are included in raw synthesis. The sanitizer has no general zodiac-list rule. |
| Raw matrix values | Partially filtered, still permitted | Multi-number lines and three named matrix concepts are filtered, but matrix-derived values and narratives can enter through synthesis and legacy engines. |
| Internal variables | Yes, permitted by the chain | The sanitizer has no general detection for names such as chakra/engine field identifiers. |
| Legacy translator outputs | Yes | Local fallback and engine fallback use archetype, Human Design, Destiny Matrix, natal, career, and blueprint-synthesis outputs outside Profile V4 Human Meaning. |

## Status Basis

- `HUMAN_READY`: Fixed UI copy or fallback prose that is understandable without engine knowledge.
- `PARTIAL`: Human-facing prose is intended, but raw-source terms are not comprehensively prevented.
- `RAW_ENGINE_LEAK`: A raw variable/value is emitted directly in a fixed audited text path.
- `LEGACY_OUTPUT`: Text originates from legacy/raw blueprint interpretation rather than Profile V4 Canonical → Human Meaning.

No fixed `RAW_ENGINE_LEAK` string was found in the Mirror component itself. The source chain nevertheless permits raw leakage in dynamically generated content because its final sanitizer is narrow and the fallback paths consume raw or legacy engine-derived structures directly.
