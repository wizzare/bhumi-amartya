# PROFILE V4 BASELINE

Status: **FROZEN BASELINE — 42 / 42 CONNECTED**

Authority:

1. `PROFILE_V4_FINAL_IDENTITY_WAREHOUSE.md`
2. `PROFILE_V4_CARD_INVENTORY.md`
3. `PROFILE_V4_42_OF_42_VALIDATION.md`
4. `PROFILE_V4_COMPLETION_REPORT.md`
5. Current source chain

The frozen chain is:

`Warehouse → CanonicalIdentity → HumanMeaning → ProfileRuntimeAdapter → Profile UI`

## Section 1 — SIAPA DIRIMU

Runtime: `ProfileRuntimeAdapter.buildSection1`

| CARD | CANONICAL DEPENDENCY | HUMAN MEANING DEPENDENCY |
| :--- | :--- | :--- |
| Arketipe Utama | `identity.sunSign`, `identity.hdProfile` | `identity.archetype` |
| Misi Kehidupan | `purpose.lifePath`, `purpose.destinyPoint` | `purpose` |
| Karakter Tersembunyi | `identity.hiddenCharacter` | `identity.hiddenCharacter` |

## Section 2 — ENERGI & MEKANIKA

Runtime: `ProfileRuntimeAdapter.buildSection2`

| CARD | CANONICAL DEPENDENCY | HUMAN MEANING DEPENDENCY |
| :--- | :--- | :--- |
| Otoritas Batin | `energy.authority` | `energy.authority` |
| Strategi Aksi | `energy.strategy` | `energy.strategy` |
| Kapasitas Vitalitas | `energy.vitality` | `energy.vitality` |
| Cara Tubuhmu Bekerja | `health.hdDigestion`, `health.hdEnvironment`, `health.hdType`, `health.baziElement` | `energy.bodyMechanics` |

## Section 3 — LUKA, BAYANGAN & WARISAN

Runtime: `ProfileRuntimeAdapter.buildSection3`

| CARD | CANONICAL DEPENDENCY | HUMAN MEANING DEPENDENCY |
| :--- | :--- | :--- |
| Kebutuhan Emosional | `shadow.emotionalNeeds` | `shadow.emotionalNeeds` |
| Pola Sabotase | `shadow.karmicTail`, `shadow.chiron` | `shadow.sabotage` |
| Trigger Emosional | `shadow.emotionalTriggers` | `shadow.triggers` |
| Warisan Leluhur | `shadow.ancestralLegacy` | `shadow.ancestralLegacy` |
| Pelajaran Jiwa | `shadow.soulLesson` | `shadow.soulLesson` |
| Jejak Jiwa | `shadow.soulTrace` | `shadow.soulTrace` |
| Money Block | `shadow.moneyBlock` | `shadow.moneyBlock` |
| Love Block | `shadow.loveBlock` | `shadow.loveBlock` |

## Section 4 — KARYA & TALENTA

Runtime: `ProfileRuntimeAdapter.buildSection4`

| CARD | CANONICAL DEPENDENCY | HUMAN MEANING DEPENDENCY |
| :--- | :--- | :--- |
| DNA Talenta | `talents.matrixTalents`, `talents.hdType` | `talents.dna` |
| Potensi Bakat | `talents.potentialTalents` | `talents.potential` |
| Gaya Karya | `talents.workStyle` | `talents.workStyle` |
| Aliran Rezeki | `talents.wealthFlow` | `talents.wealthFlow` |

## Section 5 — CINTA & RELASI

Runtime: `ProfileRuntimeAdapter.buildSection5`

| CARD | CANONICAL DEPENDENCY | HUMAN MEANING DEPENDENCY |
| :--- | :--- | :--- |
| Gaya Ketertarikan | `relationships.darakaraka` | `relationships.attraction` |
| Pola Relasi | `relationships.loveLine`, `relationships.relationshipStyle` | `relationships.pattern` |
| Bahasa Cinta Alami | `relationships.loveLanguage` | `relationships.loveLanguage` |
| Batasan Sehat | `relationships.healthyBoundaries` | `relationships.boundaries` |

## Section 6 — RAGA & RUANG

Runtime: `ProfileRuntimeAdapter.buildSection6`

| CARD | CANONICAL DEPENDENCY | HUMAN MEANING DEPENDENCY |
| :--- | :--- | :--- |
| Peta Chakra | `health.chakraMatrix` | `health.chakra` |
| Sistem Cerna | `health.hdDigestion` | `health.digestion` |
| Lingkungan Ideal | `health.hdEnvironment` | `health.environment` |
| Ritme Tubuh | `health.hdType` | `health.rhythm` |
| Energi Dominan | `health.baziElement` | `health.element` |

## Section 7 — SPIRITUALITAS & EVOLUSI

Runtime: `ProfileRuntimeAdapter.buildSection7`

| CARD | CANONICAL DEPENDENCY | HUMAN MEANING DEPENDENCY |
| :--- | :--- | :--- |
| Jalur Spiritual | `spirituality.vedicNinthHouse` | `spirituality.path` |
| Evolusi Jiwa | `spirituality.vedicAtmakaraka` | `spirituality.evolution` |
| Potensi Spiritual | `spirituality.destinyHighArcana` | `spirituality.potential` |
| Bakat Spiritual | `spirituality.destinyTalents` | `spirituality.talents` |
| Jejak Intuisi | `spirituality.hdCognition` | `spirituality.intuition` |
| Potensi Channeling | `spirituality.hdHeadAjnaDefined` | `spirituality.channeling` |
| Aura Dominan | `spirituality.hdAura` | `spirituality.aura` |
| Clair Potential | `spirituality.clairIndicators` | `spirituality.clair` |

## Section 8 — FASE KEHIDUPAN SAAT INI

Runtime: `ProfileRuntimeAdapter.buildSection8`

| CARD | CANONICAL DEPENDENCY | HUMAN MEANING DEPENDENCY |
| :--- | :--- | :--- |
| Musim Kehidupan | `timing.currentDasha` | `timing.season` |
| Semester 1 | `timing.yearlyArcana`, `timing.currentDasha`, `timing.currentAntardasha` | `timing.semester1` |
| Semester 2 | `timing.yearlyArcana`, `timing.currentDasha`, `timing.currentAntardasha` | `timing.semester2` |
| Kondisimu Saat Ini | `timing.currentState` | `timing.currentState` |
| Fokus Hari Ini | `timing.dailyFocus` | `timing.dailyFocus` |
| Area Pertumbuhan | `timing.growthArea` | `timing.growthArea` |

## Frozen Totals

| METRIC | BASELINE |
| :--- | ---: |
| Sections | 8 |
| Cards | 42 |
| Canonical-connected cards | 42 |
| Human Meaning-connected cards | 42 |
| Runtime-connected cards | 42 |
| Runtime narrative literals | 0 |
| Extra cards | 0 |
| Orphan meanings | 0 |
| Orphan runtime cards | 0 |

Any deviation from these totals requires the change protocol in `PROFILE_V4_CHANGE_PROTOCOL.md`.
