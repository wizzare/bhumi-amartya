# Zone B Theme Alignment Audit

## Final Verdict

**PARTIALLY ALIGNED**

Zone A and Zone B originate from the same normalized `issueKey`. However, Zone B has dedicated content only for:

- `love_block`
- `inner_child`
- `money_block`

Other issues are redirected to one of those three libraries. Therefore the source key is shared, but the actual recommendations are not consistently about the same problem.

## Source Trace

Zone A:

`Catatan/daily state → derivedIssue.key → normalizeIssue() → TYPE_BASED_PRACTICES[issue] → mainPractice`

Zone B:

`mainPractice.issueKey → supportForIssue(issue) → SUPPORT_LIBRARY or fallback library → one recommendation per category`

## Test Results

All examples below use the normal `REFLECTION` doorway for Zone A. Daily/Journey rotation can soften Zone A, but does not change the Zone B library result.

### 1. Over Responsibility

Zone A:

- Focus: separating care from excessive responsibility
- Practice: `Jurnal: Mana yang Bukan Bebanku`

Zone B:

| Category | Recommendation | Why selected |
|---|---|---|
| Journaling | Surat yang Tidak Pernah Terkirim | Fallback to Love Block library |
| Meditation | Meditasi Ruang Hati | Fallback to Love Block library |
| Breathwork | Heart Breathing | Fallback to Love Block library |
| Mudra | Anjali Mudra | Fallback to Love Block library |
| Yoga | Heart Opening Stretch | Fallback to Love Block library |
| Audio | Emotional Healing 639Hz | Fallback to Love Block library |

Human judgment: **NO**. These are relationship/heart practices, not specifically burden and responsibility practices.

### 2. Love Block

Zone A:

- Focus: closeness, emotional safety, and relationship patterns
- Practice: `Jurnal Pola Kedekatan`

Zone B:

| Category | Recommendation |
|---|---|
| Journaling | Surat yang Tidak Pernah Terkirim |
| Meditation | Meditasi Ruang Hati |
| Breathwork | Heart Breathing |
| Mudra | Anjali Mudra |
| Yoga | Heart Opening Stretch |
| Audio | Emotional Healing 639Hz |

Human judgment: **YES**.

### 3. Inner Child

Zone A:

- Focus: the younger self's unmet need for safety
- Practice: `Surat untuk Diri Kecil`

Zone B:

| Category | Recommendation |
|---|---|
| Journaling | Apa yang Ingin Didengar Diriku Kecil? |
| Meditation | Inner Child Soothing |
| Breathwork | Napas Rasa Aman |
| Mudra | Gyan Mudra |
| Yoga | Supported Child Pose |
| Audio | 21 Hari Memeluk Luka |

Human judgment: **YES**.

### 4. Money Block

Zone A:

- Focus: money, resources, and safety
- Practice: `Jurnal Uang dan Rasa Aman`

Zone B:

| Category | Recommendation |
|---|---|
| Journaling | Hubunganku dengan Rasa Aman |
| Meditation | Grounding Safety |
| Breathwork | Root Grounding Breath |
| Mudra | Prana Mudra |
| Yoga | Mountain Pose |
| Audio | Root Safety Healing |

Human judgment: **YES**.

### 5. Anxiety

Zone A:

- Focus: nervous-system activation and anxiety
- Practice: `Grounding Lima Indra`

Zone B uses the Money Block library:

- Hubunganku dengan Rasa Aman
- Grounding Safety
- Root Grounding Breath
- Prana Mudra
- Mountain Pose
- Root Safety Healing

Human judgment: **NO**. Several grounding items are usable, but the journaling recommendation is explicitly money-oriented.

### 6. Low Energy

Zone A:

- Focus: body recovery and limited energy
- Practice: `Body Scan Pemulihan`

Zone B uses the Money Block library.

Human judgment: **NO**. Grounding does not equal energy recovery, and the money journal is unrelated.

### 7. Grief

Zone A:

- Focus: loss and emotional release
- Practice: `Refleksi Kehilangan dan Kasih`

Zone B uses the Inner Child library.

Human judgment: **NO**. Compassion overlaps, but the recommendations explicitly frame the issue as childhood wounds rather than grief.

### 8. Boundary Issues

`need_for_boundaries` is not recognized by `normalizeIssue()`. It becomes `low_energy`.

Zone A:

- Focus shown by page: boundary issue
- Engine issue/practice: Low Body Energy → `Body Scan Pemulihan`

Zone B:

- Money Block support library

Human judgment: **NO**. Both engine normalization and Zone B mapping diverge from the visible boundary theme.

## Summary

| Issue | Same theme? |
|---|---|
| Over Responsibility | No |
| Love Block | Yes |
| Inner Child | Yes |
| Money Block | Yes |
| Anxiety | No |
| Low Energy | No |
| Grief | No |
| Boundary Issues | No |

Aligned cases: **3/8**.
