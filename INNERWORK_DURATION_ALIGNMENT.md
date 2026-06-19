# Innerwork Duration Alignment

## Required duration policy

| Navigator mode | Total primary duration | Intended experience |
|---|---:|---|
| RECOVERY | 2–5 min | Reduce load and restore basic capacity |
| REFLECTION | 5–10 min | Notice, name, and understand |
| GROWTH | 10–20 min | Practice a new response in real life |

The duration cap applies to the **primary practice**, not merely its label. Supporting and optional practices must not make the page feel like a hidden task list.

## Current-library verification

### Native RECOVERY fit: 2–5 minutes

- 60-second breathing
- Cold-water grounding
- One-minute window presence
- Grounding barefoot — 5 min
- Alternate nostril breathing — 5 min
- Lion's Breath — 5 min
- Hum or sing what is felt — 5 min
- Say no to one small thing — 5 min
- Wedang Jahe, Teh Serai, Cooling Mint, Air Kelapa, or Chamomile — 5 min

Most current regulation exercises are 8–20 minutes and therefore fail RECOVERY without a shortened protocol.

### Native REFLECTION fit: 5–10 minutes

- Restorative Recovery — 8 min
- Meditasi Jangkar Tubuh — 8 min
- Niat yang Membumi — 8 min
- Manifestasi Setelah Melepaskan — 8 min
- Meditasi Kejernihan Pilihan — 10 min
- Meditasi Kepercayaan Diri — 10 min
- Jejak Kekuatan — 10 min
- Warrior Confidence — 10 min
- Crown Silence Flow — 10 min
- one-line journal, gratitude, and small-goal Navigator actions

Most current journaling, relationship, grief, and boundary exercises are 12–20 minutes and require shorter variants.

### Native GROWTH fit: 10–20 minutes

Most variation-library practices fit. Examples include:

- Jurnal Pola Berulang, Batas Sehat, Future Self, and Value — 10–15 min
- Heart-space, energy-wave, release meditations — 12–15 min
- Yoga flows — 10–15 min
- Mobility, strength, dance, and endurance — 12–20 min
- Relationship, self-worth, career, and future-self manifestation — 10–12 min

Steady Walk at 30 minutes exceeds the GROWTH cap. Multi-select module pages and legacy three-task programs also exceed the cap.

## Required exercise contract

Each practice should have mode-specific variants:

```text
practiceId
issueTags
mechanism
recoveryVariant: 2–5 min | unavailable
reflectionVariant: 5–10 min | unavailable
growthVariant: 10–20 min | unavailable
contraindications
requiredCapacity
```

Example:

| Practice | RECOVERY | REFLECTION | GROWTH |
|---|---|---|---|
| Boundary journal | Name one draining request — 3 min | Separate mine/theirs — 8 min | Draft and use one boundary sentence — 15 min |
| Body anchor | Feel feet and three breaths — 2 min | Ten-breath body scan — 8 min | Full body-awareness meditation — 12 min |
| Rest practice | Lie down and soften jaw — 3 min | Restorative Recovery — 8 min | Moon Rest Flow — 12 min |

## Alignment verdict

The catalog has strong 10–20 minute coverage but insufficient 2–5 minute coverage. V5 requires duration variants; simple duration truncation is unsafe because instructions must also be rewritten to remain complete.
