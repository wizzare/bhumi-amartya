# HD Golden Users Regeneration Report

## Scope

Only these approved golden users were regenerated:

- Widhi
- Ning
- Widya
- Amartya
- Eva Syana

The Railway Human Design service was called with `debug: true`. No other user blueprint was updated.

## Before / After

| User | Before Design | Before Personality | After Design | After Personality | Design Sun | Personality Sun |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Widhi | 0 | 0 | 13 | 13 | 13.3 | 24.6 |
| Ning | 0 | 0 | 13 | 13 | 53.4 | 57.2 |
| Widya | 0 | 0 | 13 | 13 | 22.3 | 45.1 |
| Amartya | 0 | 0 | 13 | 13 | 36.6 | 12.4 |
| Eva Syana | 0 | 0 | 13 | 13 | 45.2 | 64.6 |

Each Firestore write was read back and verified after persistence.

## Firestore Mapping

Canonical arrays:

- `humanDesign.designActivations`
- `humanDesign.personalityActivations`

Compatibility copies were also preserved in the existing raw and diagnostic paths.

Each activation includes:

- Planet
- Gate
- Line
- Color
- Tone
- Base

## Widya Duplicate Resolution

Firestore contained duplicate Widya-named profiles. The migration selected only the canonical golden blueprint matching:

- Birth date `1987-06-09`
- Type `Manifestor`
- Profile beginning with `1/3`

The duplicate empty account and unrelated Widya profile were not modified.

## Bodygraph Design Column

**VISIBLE**

The Bodygraph reads the verified non-empty `designActivations[]` array. All five users now have 13 rows.

## Bodygraph Personality Column

**VISIBLE**

The Bodygraph reads the verified non-empty `personalityActivations[]` array. All five users now have 13 rows.

Users should reload the Human Design blueprint page to refresh any existing local cache.

## TypeScript Result

**PASS**

`tsc --noEmit` completed with exit code `0`.

## Build Result

**PASS**

Next.js `16.2.6` compiled successfully and generated `113 / 113` static pages.
