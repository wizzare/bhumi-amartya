# MOANA V64 - Wellness Experience Redesign UX Design

Status: UX DESIGN ONLY  
Implementation: NOT STARTED  
Decision needed: Founder approval before coding

## Mission

Redesign Wellness from an assessment-heavy flow into a calmer daily care experience.

Current flow:

```text
Section 1 - Daily Check In
  ↓
Section 2 - Diagnosis
  ↓
Section 3 - Recommendation
  ↓
Section 4 - Practice
```

Target flow:

```text
Section 1 - Daily Check In
  ↓
Section 2 - Kondisimu Hari Ini
  ↓
Section 3 - Hari Ini Cukup
  ↓
Section 4 - Praktik Tambahan
  ↓
Journey
```

The experience should feel less like being diagnosed and more like being accompanied.

## Information Architecture

### Page Header

Purpose:
Establish Wellness as a daily grounding space, not a clinical report.

Displayed data:
- Bhumi page identity
- Page title: Wellness
- Short supportive subtitle

Interaction:
- No primary action here.
- The first meaningful action remains Section 1.

Data source:
- Static UI copy
- Existing auth/access wrapper

### Section Hierarchy

```text
Wellness

1. Daily Check In
   User gives today's body/emotion/energy signal.

2. Kondisimu Hari Ini
   Bhumi summarizes what the signal means in human language.

3. Hari Ini Cukup
   Bhumi gives the minimum enough checklist for today.

4. Praktik Tambahan
   Optional library for users who want more support.
```

## Wireframe

```text
[App Nav]
[Bhumi Header]

Wellness
Ruang singkat untuk mendengar tubuh, emosi, dan kebutuhanmu hari ini.

SECTION 1
Daily Check In

[Check-in Card]
Mood / Energy / Body / Emotion / Nervous System
[Complete Check In]

↓ after completed

SECTION 2
Kondisimu Hari Ini

[Card: Ringkasan Kondisi]
[Card: Sinyal Utama]
[Card: Pola yang Perlu Dilembutkan]
[Card: Dukungan yang Dibutuhkan]
[Card: Detail Pemetaan] collapsed by default

↓

SECTION 3
Hari Ini Cukup

[Enoughness Header Card]
Hari ini cukup lakukan 2 dari 3 hal ini.

[Checklist Item 1]
[Checklist Item 2]
[Checklist Item 3]

[Progress: 0/3, 1/3, 2/3 cukup, 3/3 lengkap]

↓

SECTION 4
Praktik Tambahan

[Grid: Journaling]
[Grid: Meditation]
[Grid: Yoga]
[Grid: Workout]
[Grid: Audio Healing]
[Grid: Herbal]
[Grid: Manifestasi]

↓ after completion or page revisit

Journey
Today's signal + enoughness checklist + optional practice become today's narrative.
```

## Section 1 - Daily Check In

Existing purpose stays.

Role in new flow:
Section 1 is the input. Sections 2 and 3 are the response.

Displayed data:
- Mood
- Energy
- Emotion
- Body signal
- Nervous system state
- Optional emotional word, if available

Interaction:
- User completes check-in.
- On completion, Section 2 and Section 3 unlock or refresh.
- If already completed, show a compact completed state and allow update.

Data source:
- Existing `WellnessCheckInCard`
- Existing daily state / wellness snapshot

## Section 2 - Kondisimu Hari Ini

Section 2 replaces "Diagnosis". It should never feel like a label placed on the user. It should read as a gentle synthesis of today's signals.

### Card 1 - Ringkasan Kondisi

Purpose:
Give the user one clear sentence about their current state.

Displayed data:
- Current issue title or dominant theme
- Mode label, such as Recovery, Reflection, or Growth
- Short human summary

Example copy direction:
```text
Tubuhmu sedang meminta ritme yang lebih lembut hari ini.
```

Interaction:
- Collapsed by default.
- Tapping expands to show why Bhumi reached this summary.

Collapsed state:
- Title
- One-sentence summary
- Small mode pill

Expanded state:
- Summary
- Source signals:
  - mood
  - energy
  - nervous system
  - dominant issue/theme
- Gentle explanation, maximum one short paragraph

Data source:
- `WellnessDailyIntelligence.currentIssue`
- `WellnessDailyIntelligence.wellnessState`
- `wellnessNavigatorEngine.calculateNavigator`
- Existing mapping if available

### Card 2 - Sinyal Utama

Purpose:
Show the strongest signal from today's check-in without overwhelming the user.

Displayed data:
- Lowest or most attention-needing dimension
- Score or qualitative level
- One supportive interpretation

Interaction:
- Tapping expands into a simple breakdown.

Collapsed state:
```text
Sinyal utama: Energi tubuh
Tubuhmu tampak membutuhkan pemulihan.
```

Expanded state:
- Body
- Emotion
- Relationship
- Meaning
- Spirituality
- Each shown as compact rows, not large report cards

Data source:
- Existing `AssessmentResult`
- Existing mapping assessment generated from check-in
- Existing baseline mapping if daily mapping is unavailable

### Card 3 - Pola yang Perlu Dilembutkan

Purpose:
Name the pattern gently, not clinically.

Displayed data:
- Dominant theme from mapping
- Short explanation
- One "what this may look like today" line

Interaction:
- Collapsed by default.
- Expand for deeper explanation.

Collapsed state:
```text
Pola hari ini: Sulit berhenti sejenak
Kamu mungkin merasa perlu terus bergerak meski tubuh lelah.
```

Expanded state:
- Theme explanation
- Possible daily expression
- One reflective question

Data source:
- `WellnessMapping.results[0]`
- `mapping.results[0].explanation`
- Existing mapping engine

### Card 4 - Dukungan yang Dibutuhkan

Purpose:
Translate the condition into the kind of support the user needs.

Displayed data:
- Support type:
  - Rest
  - Grounding
  - Emotional naming
  - Gentle movement
  - Boundary
  - Connection
- One practical support sentence

Interaction:
- Tap expands to show "what to avoid today".

Collapsed state:
```text
Dukungan utama: menurunkan beban
Pilih hal yang membuat sistem tubuhmu merasa aman.
```

Expanded state:
- What helps today
- What may feel too heavy today
- One small permission statement

Data source:
- `wellnessSupportEngine.calculateSupportPath`
- `WellnessDailyIntelligence.recommendationInput`
- Existing support engine state if available

### Card 5 - Detail Pemetaan

Purpose:
Keep detailed diagnosis available without making it the emotional center of the page.

Displayed data:
- Full mapping detail
- Dimension map
- Navigator detail

Interaction:
- Collapsed by default.
- Label should be gentle:
  `Lihat detail pemetaan`
- This replaces the current large diagnosis-first layout.

Collapsed state:
```text
Detail pemetaan tersedia jika kamu ingin melihat lapisan lengkapnya.
```

Expanded state:
- Current `WellnessMappingView`
- Current `WellnessMapView`
- Optional navigator/support detail

Data source:
- Existing mapping
- Existing assessment result
- Existing navigator/support engines

## Section 3 - Hari Ini Cukup

Section 3 replaces "Recommendation". It should answer:

```text
Apa yang cukup untuk hari ini?
```

This section should not pressure the user into doing a full routine. It should define the minimum meaningful care for the day.

### Checklist Count

Recommended structure:
- 3 checklist items total
- Completion threshold: 2 of 3 is enough
- 3 of 3 is complete, but not required

Reason:
Three items gives structure without feeling like a task manager. Two-item completion supports compassion and reduces all-or-nothing behavior.

### Checklist Item Types

```text
1. Stabilize
   A small nervous-system or body regulation action.

2. Listen
   A reflection, naming, journaling, or awareness action.

3. Care
   A practical supportive action for the rest of the day.
```

Example:

```text
[ ] Ambil 5 napas embus panjang
[ ] Namai satu emosi yang paling hadir
[ ] Kurangi satu beban kecil hari ini
```

### Progress Rules

States:

```text
0/3 - Belum mulai
1/3 - Sudah mulai
2/3 - Hari ini cukup
3/3 - Lengkap
```

Visual progress:
- Compact progress bar or segmented 3-dot indicator
- When 2/3 is reached, show:
  `Hari ini sudah cukup. Kamu boleh berhenti di sini.`
- When 3/3 is reached, show:
  `Lengkap. Tubuh dan hatimu sudah diberi ruang hari ini.`

Completion rule:
- Journey can treat 2/3 as "completed enough".
- 3/3 is a stronger completion signal but should not be framed as better morally.

### Morning vs Night

Morning:
- Tone: orientation and capacity
- Focus: choose the smallest supportive rhythm before the day expands
- Checklist should be lighter and preparatory

Example:
```text
Stabilize: Tarik napas, embus lebih panjang 5 kali.
Listen: Pilih satu kata untuk energi pagimu.
Care: Tentukan satu batas kecil sebelum hari dimulai.
```

Night:
- Tone: release and closure
- Focus: downshift the nervous system and close the day without self-judgment
- Checklist should avoid activating tasks

Example:
```text
Stabilize: Letakkan tangan di dada selama satu menit.
Listen: Akui satu hal yang terasa berat hari ini.
Care: Lepaskan satu tuntutan yang tidak perlu dibawa tidur.
```

Time windows:
- Morning: orient
- Afternoon: sustain
- Evening: release
- Night: recover

Data source:
- Existing `getTimeWindow(appNow)`
- Existing app time refresh

### Anxiety vs Burnout

Anxiety:
- User state: activated, anticipatory, mentally looping
- Recommendation principle: grounding before reflection
- Checklist should reduce stimulation and restore orientation

Example:
```text
Stabilize: Grounding lima indra.
Listen: Pisahkan fakta dari prediksi.
Care: Pilih satu respons kecil yang aman.
```

Burnout / Low Energy:
- User state: depleted, heavy, low capacity
- Recommendation principle: rest before insight
- Checklist should be shorter, softer, and body-led

Example:
```text
Stabilize: Istirahat tanpa syarat 4 menit.
Listen: Tanyakan tubuh bagian mana yang paling lelah.
Care: Batalkan atau ringankan satu beban kecil.
```

Difference:
- Anxiety gets orientation.
- Burnout gets permission.
- Anxiety can handle brief structured reflection after grounding.
- Burnout should avoid long cognitive processing.

Data source:
- `WellnessDailyIntelligence.currentIssue`
- `recommendationInput.wellnessState`
- Existing `innerworkIntelligence` issue/practice mapping

### Environment-Based Recommendation

Environment should modify the checklist tone, not replace the whole recommendation.

Possible environment inputs:
- Weather / environment context if available from Dashboard
- Time of day
- Recent completion rhythm
- Current energy and nervous system

Examples:

Rain / low light:
```text
Care item becomes warmer and inward:
Siapkan minuman hangat atau ruang yang membuat tubuh merasa aman.
```

Heat / high intensity day:
```text
Care item becomes cooling and hydration-oriented:
Minum air dan turunkan satu ekspektasi fisik.
```

Busy / high activity rhythm:
```text
Stabilize item becomes shorter:
Ambil jeda 60 detik sebelum berpindah aktivitas.
```

Low completion streak:
```text
Checklist becomes easier:
2 tiny actions are enough.
```

High consistency:
```text
Optional third item may invite deeper reflection.
```

Data source:
- Existing daily guidance / environment context where available
- Existing Journey memory / recent daily states
- Existing wellness state

### How Journey Reads Section 3

Journey should read the checklist as a daily care signal:

```text
Today's issue
Today's mode
Checklist items offered
Checklist items completed
Completion level
Optional practice completed
Reflection result if any
```

Concept only:
- 0/3 means "Wellness opened, no care action completed yet."
- 1/3 means "User began self-care."
- 2/3 means "User completed enough care for today."
- 3/3 means "User completed the full enoughness checklist."
- Optional Section 4 practice adds detail but should not be required for Journey progress.

## Section 4 - Praktik Tambahan

Section 4 keeps the existing practice library, but reframes it as optional.

New title:
`Praktik Tambahan`

Purpose:
Offer more support without making it feel required.

### What Stays

Keep existing practice library:
- Journaling
- Meditation
- Yoga
- Workout
- Audio Healing
- Herbal
- Manifestasi

Keep existing routing:
- `/innerwork/journaling`
- `/innerwork/meditation`
- `/innerwork/yoga`
- `/innerwork/workout`
- `/innerwork/audio-healing`
- `/innerwork/herbal`
- `/innerwork/manifestasi`

Keep existing themed href behavior where it already exists:
- Issue
- Practice ID
- Practice category
- Source theme
- Title
- Duration

### What Moves

Move the current "Praktik Utama" recommendation concept into Section 3 as checklist item generation.

Move "why this practice" into Section 2 or Section 3 only when it helps the user understand the recommendation.

Move support practices out of the main recommendation pressure zone. They become optional entries in Section 4 or compact alternatives under Section 3.

### What Disappears

Remove the feeling of:
- "Recommended Today" as a heavy prescription
- Multiple long practice cards before the user knows what is enough
- Long diagnostic explanation above the daily care action

Do not remove the underlying practice library.

Do not remove existing practice completion behavior.

Do not remove Journey logging concept.

## Complete User Flow

### 1. User Opens Wellness

User lands on Wellness.

If daily check-in is incomplete:
- Show Section 1 only.
- Sections 2 and 3 are not shown yet, or shown as locked placeholders.

Transition:
```text
Open Wellness → Daily Check In
```

Reason:
Bhumi should not recommend before listening.

### 2. Section 1 - Daily Check In

User completes mood/energy/body/emotion/nervous system check-in.

Transition:
```text
Daily Check In completed → Kondisimu Hari Ini appears
```

System response:
- Save daily state using existing check-in flow.
- Refresh daily intelligence.
- Build current issue/mapping/recommendation context.

### 3. Section 2 - Kondisimu Hari Ini

User reads a gentle state summary.

Default behavior:
- Show concise cards.
- Keep detail collapsed.

Transition:
```text
User understands today's condition → Hari Ini Cukup
```

Emotional goal:
User feels seen, not diagnosed.

### 4. Section 3 - Hari Ini Cukup

User receives 3 small actions.

Progress:
- User checks off actions.
- At 2/3, the section confirms enoughness.
- At 3/3, the section confirms complete care.

Transition:
```text
Checklist 2/3 → Journey can record enough-care completion
Checklist 3/3 → Journey can record full checklist completion
```

Emotional goal:
User feels allowed to stop.

### 5. Section 4 - Praktik Tambahan

User optionally chooses deeper support.

Transition:
```text
Optional practice selected → Innerwork practice page
Practice completed → Journey receives practice result
```

Emotional goal:
User has agency, not pressure.

### 6. Journey

Journey receives the daily story conceptually:

```text
Today, the user checked in.
Bhumi identified the main condition.
The user completed enough care, partial care, or full care.
If an optional practice was completed, Journey adds that as a deeper action.
```

Journey narrative should sound like:

```text
Hari ini kamu memberi ruang pada tubuh dan emosimu.
Kondisi utama yang muncul adalah kebutuhan untuk melambat.
Kamu menyelesaikan cukup praktik untuk menjaga dirimu tetap ditemani.
```

Not like:

```text
User completed 2/3 tasks.
Diagnosis: burnout.
Recommendation executed.
```

## Card Structure Standard

All Section 2 cards should follow this structure:

```text
[Small label]
[Card title]
[One short human sentence]
[Optional pill: mode / signal / level]
[Expand affordance]
```

Expanded cards should use:
- One paragraph max
- 2-5 compact rows
- No dense report blocks
- No clinical diagnosis language

Section 3 checklist cards should follow:

```text
[Checkbox]
[Action title]
[One-line reason]
[Duration or effort label]
```

Example:

```text
[ ] Grounding lima indra
Untuk membantu pikiran kembali ke keadaan nyata.
6 menit
```

## Interaction Model

### Collapsed by Default

Collapsed:
- Section 2 detailed mapping
- Dimension breakdown
- Support path detail
- Explanation-heavy content

Expanded:
- Only after user taps
- No auto-expanded diagnosis walls

### Primary Actions

Section 1:
- Complete / update check-in

Section 3:
- Check checklist item
- Start selected enoughness practice if needed

Section 4:
- Open optional practice

### Secondary Actions

Section 2:
- View detail
- Repeat reflection / update mapping if currently supported

Section 3:
- Swap one item, only if future scope allows
- Not required for first implementation

## Morning, Afternoon, Evening, Night Behavior

Morning:
- "Begin gently"
- Stabilize + orient + choose one boundary

Afternoon:
- "Sustain rhythm"
- Hydrate + pause + reduce one unnecessary load

Evening:
- "Release the day"
- Downshift + name residue + close open loop

Night:
- "Recover"
- Body safety + emotional permission + sleep support

## Recommendation Matrix

This is conceptual only.

```text
Condition: Anxiety
Morning: grounding + fact/prediction split + safe next step
Night: long exhale + release future planning + sleep boundary

Condition: Burnout / low energy
Morning: reduce load + body check + one essential action only
Night: rest permission + no deep processing + comfort ritual

Condition: Emotional fatigue
Morning: name emotion + lower expectation + one supportive contact
Night: compassion hold + acknowledge heaviness + gentle closure

Condition: Over-responsibility
Morning: choose one boundary + one delegated/paused task
Night: return responsibility that is not yours + soften shoulders

Condition: Grief
Morning: carry gently + one stabilizing ritual
Night: make room for feeling + do not force meaning
```

Environment modifier:

```text
Hot / intense: cooling, hydration, reduce physical intensity
Rain / low light: warmth, indoor grounding, emotional gentleness
Busy rhythm: shorter practices, micro-pauses
Low streak: fewer and easier items
High streak: optional depth, never more pressure
```

## Journey Concept

Journey should eventually narrate:
- What the user felt
- What Bhumi recognized
- What care was enough
- What optional deeper practice happened
- What pattern may be forming over time

Daily Journey narrative ingredients:

```text
wellnessSnapshot
currentIssue
navigatorMode
checklistOffered
checklistCompletedCount
enoughnessStatus
optionalPracticeCompleted
practiceResult
```

Narrative levels:

```text
0/3 - Not yet practiced
1/3 - Began care
2/3 - Enough care
3/3 - Full checklist
Section 4 completed - Deeper practice
```

Journey should never frame missed items as failure. It should say:

```text
Bhumi masih menyimpan sinyal hari ini. Kamu bisa kembali kapan pun tubuhmu siap.
```

## Systems Not To Change In UX Approval Phase

No implementation in this phase.

Do not change:
- Wellness save pipeline
- Journey save/readback pipeline
- AI Memory
- Billing
- Subscription
- Badge
- Access Control
- Firestore Rules
- versionCode
- AAB
- Play Console

## Open Questions For Founder Approval

1. Should Section 3 use exactly 3 checklist items, with 2/3 as "cukup"?
2. Should Section 2 detailed mapping remain available behind `Lihat detail pemetaan`?
3. Should Section 4 still include external support resources, or should this sprint limit Section 4 to innerwork practices only?
4. Should Journey count "Hari Ini Cukup" at 2/3 as daily completion?
5. Should optional Section 4 practice add bonus narrative without being required?

## Final UX Recommendation

Recommended MVP for implementation after approval:

```text
Section 1: keep existing Daily Check In
Section 2: replace diagnosis-first layout with 5 gentle cards
Section 3: add 3-item enoughness checklist, 2/3 completion threshold
Section 4: keep existing practice library, optional-only framing
Journey: conceptually read enoughness status and optional practice result
```

Final status: UX DESIGN READY FOR FOUNDER REVIEW. NO CODE IMPLEMENTED.
