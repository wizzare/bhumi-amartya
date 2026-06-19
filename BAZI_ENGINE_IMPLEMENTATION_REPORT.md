# BaZi Engine Implementation Report

## Formula source

The engine is fully deterministic. It does not call AI, Gemini, an LLM, or an external BaZi API.

### Four Pillars

- **Year Pillar** uses the 60 stem-branch cycle with `1984 = 甲子 Jia Zi`.
- The BaZi year changes at **Li Chun**, calculated from the Sun reaching ecliptic longitude `315°`.
- **Month Pillar** uses the twelve Jie boundaries, calculated astronomically at solar longitudes:

```text
315°, 345°, 15°, 45°, 75°, 105°,
135°, 165°, 195°, 225°, 255°, 285°
```

- Month branches run from `寅 Yin` at Li Chun through `丑 Chou`.
- Month stems are derived from the year stem using the traditional Five Tigers sequence.
- **Day Pillar** uses the continuous sexagenary day cycle derived from the Gregorian Julian Day Number.
- BaZi day rollover uses the start of `子 Zi` hour at `23:00`.
- **Hour Pillar** uses twelve two-hour branches beginning with `子 Zi = 23:00–01:00`.
- Hour stems are derived from the Day Stem using the traditional Five Rats sequence.

### Day Master and Ten Gods

The Day Master is the Heavenly Stem of the Day Pillar.

Ten Gods are derived from:

- Element relationship to the Day Master
- Generating and controlling cycles
- Matching or opposing Yin/Yang polarity

### Five Elements

The engine counts the visible Heavenly Stem and primary Earthly Branch element for all four pillars:

```text
Wood
Fire
Earth
Metal
Water
```

The least represented elements become support priorities. The strongest remaining elements are marked as needing moderation. These lists are always disjoint.

### Luck Pillars

The profile schema does not currently store gender. Classical Da Yun direction requires gender together with the Yin/Yang polarity of the birth-year stem.

The engine therefore does not infer or hardcode gender. It uses and stores:

```text
luckCycleMethod: "forward-solar-sequence"
```

The first-cycle age is calculated from the interval between birth and the next Jie:

```text
startAge = round(daysToNextJie / 3)
```

Ten consecutive ten-year pillars are generated from the Month Pillar. This limitation is visible in the deterministic summary and storage schema.

### References

- Four Pillars structure, Day Master, solar-term months, and double hours:  
  https://en.wikipedia.org/wiki/Four_Pillars_of_Destiny
- Sexagenary cycle and stem element/polarity mapping:  
  https://en.wikipedia.org/wiki/Sexagenary_cycle
- Earthly Branch hour and element mapping:  
  https://en.wikipedia.org/wiki/Earthly_Branches
- Chinese calendrical stem-branch system:  
  https://en.wikipedia.org/wiki/Chinese_calendar

Solar-term instants are calculated locally with the installed `astronomy-engine` dependency.

## Validation

Validation script:

```text
scripts/validateBazi.ts
```

Input:

```text
Widhi
03 May 1985
23:45 WIB
Jakarta
UTC offset: +07:00
```

Validated output:

```text
Year Pillar:  乙丑 Yi Chou
Month Pillar: 庚辰 Geng Chen
Day Pillar:   壬寅 Ren Yin
Hour Pillar:  庚子 Geng Zi
Day Master:   壬 Ren — Yang Water
```

Additional assertions:

```text
Luck pillar count: 10
Summary paragraph count: 5
Ten Gods generated deterministically
Five Elements generated deterministically
```

All assertions passed.

## Storage schema

BaZi is persisted at `blueprint.bazi`:

```text
bazi: {
  yearPillar
  monthPillar
  dayPillar
  hourPillar
  dayMaster
  fiveElements
  tenGods
  favorableElements
  unfavorableElements
  luckPillars
  currentLuckCycle
  luckCycleMethod
  strengths
  challenges
  careerStyle
  relationshipStyle
  moneyStyle
  lifeMission
  summary
}
```

Each pillar stores:

```text
stem
stemPinyin
branch
branchPinyin
element
polarity
animal
display
```

Persistence behavior:

- New blueprints calculate BaZi during normal blueprint generation.
- Local blueprint generation includes BaZi.
- Repository normalization backfills BaZi for legacy users.
- The BaZi page backfills and saves missing results through the active storage provider.
- Results persist through refresh in scoped local storage and Firebase when available.
- No Gaia integration was added.

## TypeScript result

**PASS**

```text
Command: npx.cmd tsc --noEmit
Errors: 0
Exit code: 0
```

## Build result

**PASS**

```text
Command: npm.cmd run build
Next.js: 16.2.6
Compiled successfully
TypeScript build phase completed
Static pages generated: 117/117
/blueprint/bazi: static route
Exit code: 0
```

## Front-end result

The production BaZi page now displays:

- Four Pillars
- Day Master
- Five Elements balance
- Ten Gods
- Favorable and unfavorable elements
- Ten Luck Pillars
- Current Luck Cycle
- Strengths and challenges
- Career, relationship, and money styles
- Life mission
- Five-paragraph deterministic summary

No `AuditSection`, debug panel, raw JSON, placeholder, Gemini, or AI integration is present.
