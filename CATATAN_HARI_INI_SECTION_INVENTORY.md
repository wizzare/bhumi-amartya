# Catatan Hari Ini Section Inventory

## Active UI

Source UI: `components/dashboard/DailyNoteV2.tsx`

Location: Dashboard, after Astro Hari Ini and before Disarankan.

## Header and Global Focus

| Section | Field | Visible text | CTA | Runtime source |
|---|---|---|---|---|
| Title | Static | `Catatan Hari Ini` | None | Hardcoded UI label |
| Opening | Static | `Membaca makna yang relevan untuk harimu.` | None | Hardcoded UI copy |
| Awareness focus | `focus` | First active awareness event explanation | None | `DashboardClient → astroAwarenessEngine.activeAwarenessEvents[0]` |
| Loading fallback | Missing categories | `Informasi sedang dipersiapkan...` | None | UI fallback |

## Nine Category Sections

Every category appears as a collapsed card. Clicking it expands three subsections:

1. `Mengapa ini muncul?`
2. `Refleksi Dirimu`
3. `Saran Bhumi`

Opening a category also writes `dailyNoteDone: true`.

| UI title | Field name | Intended function | Visible text | CTA |
|---|---|---|---|---|
| Kondisi Umum | `categories.general` | General mood and energy | `insight`, then reason/reflection/advice | Expand/collapse card |
| Mental | `categories.mental` | Cognitive focus and clarity | Same four fields | Expand/collapse card |
| Keuangan | `categories.finance` | Resources and material stability | Same four fields | Expand/collapse card |
| Percintaan | `categories.love` | Romantic and emotional intimacy | Same four fields | Expand/collapse card |
| Relasi & Keluarga | `categories.relational` | Communication and social relationships | Same four fields | Expand/collapse card |
| Spiritual | `categories.spiritual` | Meaning and inner silence | Same four fields | Expand/collapse card |
| Tantangan | `categories.challenges` | Friction or risk today | Same four fields | Expand/collapse card |
| Peluang | `categories.opportunities` | Opening or potential today | Same four fields | Expand/collapse card |
| Saran Bhumi | `categories.advice` | Practical daily summary | Same four fields | Expand/collapse card |

## Per-Category Fields

| UI location | Field | Source |
|---|---|---|
| Card headline | `insight` | AI response or local fallback |
| Expanded reason | `reason` | AI/fallback, then appended with one seeded generic angle in UI |
| Expanded reflection | `reflection` | AI/fallback, then appended with one seeded generic question in UI |
| Expanded practical block | `advice` | AI/fallback companion-advice enrichment |

## CTA Inventory

Catatan itself has no navigation CTA.

The only interactions are:

- Expand/collapse category
- Implicitly mark `dailyNoteDone`

The navigation options appear in the separate `Disarankan` section:

- Kenali Diri
- Innerwork
- Journey

## Source Files

- UI: `components/dashboard/DailyNoteV2.tsx`
- Wiring: `components/dashboard/DashboardClient.tsx`
- Data contract: `lib/dailyGuidance/types.ts`
- AI schema: `lib/prompts/dailyGuidancePrompt.ts`
- Local source: `lib/orchestrators/localDailyGuidanceFallback.ts`
- Advice enrichment: `lib/dailyGuidance/mentorAdvice.ts`
- Persistence: `lib/repositories/dailyStateRepository.ts`

## Inventory Finding

Catatan is currently a nine-domain daily report with four content fields per domain, not a single daily-focus companion section.

