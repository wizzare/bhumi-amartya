# HARDCODE CARD AUDIT

Scope: the 22 Warehouse cards identified in `PROFILE_V4_FINAL_CONFORMANCE.md` as adapter-level hardcoded Runtime implementations.

| SECTION | CARD | CURRENT_SOURCE | REQUIRED_SOURCE | STATUS |
| :--- | :--- | :--- | :--- | :--- |
| SIAPA DIRIMU | Karakter Tersembunyi | Literal strings in `ProfileRuntimeAdapter.ts:39-42` | Numerology Soul Urge + Natal Moon + Destiny Matrix Chart Heart → Canonical psychology signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| ENERGI & MEKANIKA | Otoritas Batin | Literal strings in `ProfileRuntimeAdapter.ts:53-56` | Existing `CanonicalIdentity.energy.authority` → dedicated authority Human Meaning narrative | MISSING_MEANING |
| ENERGI & MEKANIKA | Kapasitas Vitalitas | Literal strings in `ProfileRuntimeAdapter.ts:65-68` | BaZi elements + HD Sacral + Destiny Matrix physics → canonical vitality signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| ENERGI & MEKANIKA | Cara Tubuhmu Bekerja | Literal strings in `ProfileRuntimeAdapter.ts:71-74` | Existing canonical health digestion/environment/type/element → existing health Human Meaning narratives | MISSING_RUNTIME_MAPPING |
| LUKA, BAYANGAN & WARISAN | Kebutuhan Emosional | Literal strings in `ProfileRuntimeAdapter.ts:85-88` | Natal Moon + Destiny Matrix inner-child/chart-heart data → canonical emotional-needs signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| LUKA, BAYANGAN & WARISAN | Trigger Emosional | Literal strings in `ProfileRuntimeAdapter.ts:97-100` | Natal Pluto/Mars aspects + Destiny Matrix Chart Heart → canonical trigger signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| LUKA, BAYANGAN & WARISAN | Warisan Leluhur | Literal strings in `ProfileRuntimeAdapter.ts:103-106` | Destiny Matrix father/mother/ancestor lines + Vedic lineage evidence → canonical ancestral signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| LUKA, BAYANGAN & WARISAN | Pelajaran Jiwa | Literal strings in `ProfileRuntimeAdapter.ts:109-112` | Vedic Rahu/Ketu + Natal lunar nodes → canonical soul-lesson signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| LUKA, BAYANGAN & WARISAN | Jejak Jiwa | Literal strings in `ProfileRuntimeAdapter.ts:115-118` | Destiny Matrix karmic/past-life pattern + Tzolkin occult oracle → canonical symbolic soul-trace signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| LUKA, BAYANGAN & WARISAN | Money Block | Literal strings in `ProfileRuntimeAdapter.ts:121-124` | Destiny Matrix money line shadow + Natal 2nd/8th evidence + BaZi unfavorable elements → canonical money-block signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| LUKA, BAYANGAN & WARISAN | Love Block | Literal strings in `ProfileRuntimeAdapter.ts:127-130` | Destiny Matrix love-line shadow + Natal Venus evidence → canonical love-block signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| KARYA & TALENTA | Potensi Bakat | Literal strings in `ProfileRuntimeAdapter.ts:147-150` | BaZi Ten Gods + Vedic major yogas + Natal supportive aspects → canonical developmental-talent signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| KARYA & TALENTA | Gaya Karya | Literal strings in `ProfileRuntimeAdapter.ts:153-156` | BaZi career style + Natal Midheaven + Destiny Matrix money line → canonical work-style signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| KARYA & TALENTA | Aliran Rezeki | Literal strings in `ProfileRuntimeAdapter.ts:159-162` | Destiny Matrix money line + Vedic wealth yogas + BaZi wealth element → canonical abundance-flow signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| CINTA & RELASI | Pola Relasi | Literal strings in `ProfileRuntimeAdapter.ts:179-182` | Existing `CanonicalIdentity.relationships.loveLine` + Tzolkin relationship style → dedicated relationship-pattern Human Meaning narrative | MISSING_MEANING |
| CINTA & RELASI | Bahasa Cinta Alami | Literal strings in `ProfileRuntimeAdapter.ts:185-188` | BaZi element balance + Natal Venus → canonical love-language signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| CINTA & RELASI | Batasan Sehat | Literal strings in `ProfileRuntimeAdapter.ts:191-194` | HD undefined centers + Destiny Matrix center shadow → canonical boundary signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| FASE KEHIDUPAN SAAT INI | Semester 1 | Literal strings in `ProfileRuntimeAdapter.ts:305-308` | Existing `CanonicalIdentity.timing.yearlyArcana` plus Warehouse-defined Vedic/transit timing inputs → first-semester Human Meaning narrative | MISSING_MEANING |
| FASE KEHIDUPAN SAAT INI | Semester 2 | Literal strings in `ProfileRuntimeAdapter.ts:311-314` | Existing `CanonicalIdentity.timing.yearlyArcana` plus Warehouse-defined Vedic/transit timing inputs → second-semester Human Meaning narrative | MISSING_MEANING |
| FASE KEHIDUPAN SAAT INI | Kondisimu Saat Ini | Literal strings in `ProfileRuntimeAdapter.ts:317-320` | State Engine mood/energy/sleep/stress/practice inputs → canonical state signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| FASE KEHIDUPAN SAAT INI | Fokus Hari Ini | Literal strings in `ProfileRuntimeAdapter.ts:323-326` | State Engine + Tzolkin daily Kin + Moon transit → canonical daily-focus signal → dedicated Human Meaning narrative | MISSING_CANONICAL |
| FASE KEHIDUPAN SAAT INI | Area Pertumbuhan | Literal strings in `ProfileRuntimeAdapter.ts:329-332` | Active Journey/Innerwork metrics → canonical growth signal → dedicated Human Meaning narrative | MISSING_CANONICAL |

## Audit Totals

| STATUS | COUNT |
| :--- | ---: |
| MISSING_CANONICAL | 17 |
| MISSING_MEANING | 4 |
| MISSING_RUNTIME_MAPPING | 1 |
| HARDCODED_FALLBACK | 0 |
| **TOTAL** | **22** |

All 22 cards currently use literal Runtime content. `HARDCODED_FALLBACK` is zero because these are Warehouse cards, not extra fallback inventory; their hardcoding is a chain break rather than an out-of-Warehouse card.
