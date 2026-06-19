# Kenali Diri Language Audit

## Classification Summary

| AREA | STATUS | FINDING |
|---|---|---|
| Intro and questionnaire | HUMAN_READY | Clear self-report language with a non-medical disclaimer. |
| Dimension scores | HUMAN_READY | Ordinary labels and readable score bands. |
| Theme explanations | PARTIAL_TRANSLATION | Mostly readable, but they present algorithmic classifications as detected inner conditions. |
| Navigator actions | HUMAN_READY / GENERIC_OUTPUT | Practical but selected from a static action library. |
| Support path | PARTIAL_TRANSLATION | Understandable, but exposes levels and confidence mechanics. |
| Technical details expansion | RAW_ENGINE_LEAK | Internal dimension keys, booster names, confidence levels and scoring metadata are visible. |
| Loading/error placeholders | LEGACY_OUTPUT | Several English loading placeholders remain in the Indonesian UI. |
| Disabled community cards | LEGACY_OUTPUT | Visible but unavailable product placeholders. |

## Visible Leak Checks

| CHECK | RESULT |
|---|---|
| Astrology labels | None |
| Human Design terminology | None |
| Matrix numbers | None |
| Chakra metrics | None |
| Raw Blueprint data | None |
| Generic AI prose | None; no AI is used |
| Internal variables | Present |
| Raw scoring output | Present |

## RAW_ENGINE_LEAK Instances

- Mode badges: `Recovery Mode`, `Reflection Mode`, `Growth Mode`.
- Confidence badge: `LOW`, `MEDIUM`, `HIGH`.
- Support metadata: `Level 1` through `Level 6`.
- English metadata label: `Confidence`.
- Expanded driver keys: `body`, `emotion`, `relationship`, `meaning`, `spirituality`.
- Booster strings can expose `Need: PEACE`, `Need: CLARITY`, `Need: HEALING`, `Low Energy Pattern`, and `Low Sleep Pattern`.
- Accuracy line exposes a numeric confidence score and algorithm reason.

## PARTIAL_TRANSLATION Instances

- `Kemungkinan Tema Saat Ini` presents probabilities such as Burnout, Kecemasan, or Krisis Hidup from only eight self-report questions.
- `Berdasarkan pola yang terdeteksi...` uses system-detection language rather than direct human reflection.
- `Intensitas pola batinmu menyarankan...` presents an algorithmic threshold as a personal interpretation.
- Labels such as `Spiritual Awakening` remain English inside Indonesian output.
- `Dominan` plus probability bars make the experience read like a classifier report.

## LEGACY_OUTPUT Instances

- `Loading theme...`
- `Loading patterns...`
- `Loading attention areas...`
- `Loading safe path...`
- Disabled `Lingkaran Refleksi`.
- Disabled `Teman Cerita`.

## GENERIC_OUTPUT Instances

- Static category explanations are identical for every user assigned the same category.
- Support reasons are fixed by level and category.
- Basic recommendation links are always the same five modules regardless of result.
- Navigator actions come from a fixed library; only selection changes.
- The final “Langkah Berikutnya” statement is identical for every result.

## Language Conclusion

The questionnaire itself is human-ready. Results are readable but retain classifier language, internal scoring vocabulary, English engine labels, generic static explanations, and unavailable placeholders. No esoteric engine data leaks because Blueprint is not used.
