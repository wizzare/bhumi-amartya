# HARDCODE ELIMINATION PLAN

Target: 42 / 42 Warehouse cards connected through Canonical → Human Meaning → Runtime without adapter-level narrative literals.

No new cards, domains, inventory, architecture, or Runtime content are proposed. Required sources below are taken from the existing Warehouse and Card Inventory.

## Phase 1 — Canonical Dependencies

Add only the missing card-specific canonical signals required by the 17 `MISSING_CANONICAL` cards, using their existing Blueprint owners.

### Identity and Psychology

1. Karakter Tersembunyi
   - Current: Runtime literals.
   - Required: Soul Urge + Moon + Chart Heart canonical psychology signal.

2. Kebutuhan Emosional
   - Current: Runtime literals.
   - Required: Moon + inner-child/chart-heart canonical emotional-needs signal.

### Energy and Body

3. Kapasitas Vitalitas
   - Current: Runtime literals.
   - Required: BaZi elements + HD Sacral + Destiny Matrix physics canonical vitality signal.

### Shadow and Karma

4. Trigger Emosional
   - Required: Pluto/Mars aspects + Chart Heart canonical trigger signal.
5. Warisan Leluhur
   - Required: Destiny Matrix lineage + Vedic lineage canonical ancestral signal.
6. Pelajaran Jiwa
   - Required: Rahu/Ketu + lunar nodes canonical soul-lesson signal.
7. Jejak Jiwa
   - Required: Destiny Matrix karmic pattern + Tzolkin oracle canonical symbolic soul-trace signal.
8. Money Block
   - Required: Money-line shadow + financial-house evidence + unfavorable elements canonical money-block signal.
9. Love Block
   - Required: Love-line shadow + Venus evidence canonical love-block signal.

### Talents and Career

10. Potensi Bakat
    - Required: Ten Gods + major yogas + supportive aspects canonical developmental-talent signal.
11. Gaya Karya
    - Required: BaZi career style + Midheaven + money line canonical work-style signal.
12. Aliran Rezeki
    - Required: Money line + wealth yogas + wealth element canonical abundance-flow signal.

### Relationships

13. Bahasa Cinta Alami
    - Required: BaZi element balance + Venus canonical love-language signal.
14. Batasan Sehat
    - Required: HD undefined centers + Destiny Matrix center shadow canonical boundary signal.

### State, Daily Focus, and Growth

15. Kondisimu Saat Ini
    - Required: Existing State Engine inputs represented canonically.
16. Fokus Hari Ini
    - Required: Existing State Engine, daily Kin, and Moon-transit inputs represented canonically.
17. Area Pertumbuhan
    - Required: Existing Journey/Innerwork progress inputs represented canonically.

Phase 1 completion gate: every required source is present in `CanonicalIdentity` and populated by `CanonicalTranslatorService`; no Human Meaning or Runtime changes precede this gate.

## Phase 2 — Human Meaning Dependencies

After Phase 1, create one dedicated `HumanNarrative` mapping per missing Warehouse card.

### Narratives for the 17 new canonical signals

- Karakter Tersembunyi
- Kapasitas Vitalitas
- Kebutuhan Emosional
- Trigger Emosional
- Warisan Leluhur
- Pelajaran Jiwa
- Jejak Jiwa
- Money Block
- Love Block
- Potensi Bakat
- Gaya Karya
- Aliran Rezeki
- Bahasa Cinta Alami
- Batasan Sehat
- Kondisimu Saat Ini
- Fokus Hari Ini
- Area Pertumbuhan

### Narratives using canonical signals that already exist

18. Otoritas Batin
    - Canonical source already exists: `energy.authority`.
    - Add a dedicated authority narrative; do not reuse the strategy narrative.

19. Pola Relasi
    - Canonical source already exists: `relationships.loveLine`.
    - Add a dedicated relationship-pattern narrative; do not reuse attraction meaning.

20. Semester 1
    - Canonical timing foundation already includes `timing.yearlyArcana`.
    - Add the Warehouse-defined first-semester narrative from canonical timing inputs.

21. Semester 2
    - Canonical timing foundation already includes `timing.yearlyArcana`.
    - Add the Warehouse-defined second-semester narrative from canonical timing inputs.

Phase 2 completion gate: `HumanMeaning` exposes 42 card-specific narratives, and every narrative consumes Canonical data only.

## Phase 3 — Runtime Replacement

Replace the 22 literal card bodies in `ProfileRuntimeAdapter` with their matching `HumanMeaning` outputs.

Dependency order:

1. Replace the single card whose required Meaning already exists:
   - Cara Tubuhmu Bekerja → compose from existing `meaning.health` digestion, environment, rhythm, and element narratives.

2. Replace the four cards backed by existing Canonical signals after their Phase 2 meanings exist:
   - Otoritas Batin
   - Pola Relasi
   - Semester 1
   - Semester 2

3. Replace the 17 cards after both Phase 1 and Phase 2 are complete.

4. Remove unused `canonical` parameters from Runtime section builders once no adapter-level derivation remains.

Phase 3 completion gate:

- Runtime contains titles and structural mapping only.
- Runtime contains no card narrative literals.
- Runtime reads no Blueprint data.
- All 42 cards map `shortMeaning`, `expandableInsight`, and `actionableReflection` from `HumanMeaning`.
- No extra or fallback cards are introduced.

## Final Dependency Sequence

| ORDER | LAYER | CARDS UNBLOCKED |
| ---: | :--- | ---: |
| 1 | Canonical additions and translator mappings | 17 |
| 2 | Human Meaning additions for new and existing canonical signals | 21 |
| 3 | Existing health Meaning composition for Cara Tubuhmu Bekerja | 1 |
| 4 | Runtime literal replacement | 22 |
| 5 | Conformance verification | 42 / 42 target |
