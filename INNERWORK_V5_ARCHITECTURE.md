# Innerwork V5 Target Architecture

## Final answer

**Yes. Innerwork can become `Catatan → Praktik`, but only if Catatan's dominant issue becomes the authoritative handoff contract.**

Innerwork must stop running a parallel interpretation of Profile, Astro, Wellness, and Journey.

## Authoritative flow

```text
User reality
  ↓
Catatan synthesis
  ↓
ONE dominant issue
  ↓
Navigator capacity filter
  ↓
Issue-to-practice taxonomy
  ↓
Journey repetition/progression filter
  ↓
Fokus Hari Ini
  ↓
Praktik Utama
  ↓
Praktik Pendukung
  ↓
Praktik Opsional
```

## Handoff from Catatan

Catatan should provide a small structured result alongside its human narrative:

```text
dominantIssue
issueConfidence
evidenceSummary
desiredShift
currentCapacity
```

Innerwork consumes this result. It may not replace the issue with a profile trait, Astro event, or a random library theme.

If confidence is low, Innerwork chooses a gentle observation/regulation practice rather than pretending certainty.

## Recommendation structure

### Fokus Hari Ini

One or two human sentences connecting directly to Catatan:

> Hari ini fokusmu bukan menyelesaikan lebih banyak hal, melainkan menyadari beban mana yang sebenarnya tidak perlu kamu pikul sendiri.

No profile report, system explanation, or second issue.

### Praktik Utama

Exactly one practice:

- strongest match to the dominant issue;
- within Navigator duration;
- safe for current wellness capacity;
- not unnecessarily repeated;
- complete instructions and a clear finish condition.

### Praktik Pendukung

At most one practice, visually secondary:

- uses another mechanism;
- remains inside or below the mode's duration range;
- is explicitly optional;
- never required for completion.

Example: primary boundary journal, supporting 2-minute body regulation.

### Praktik Opsional

A quiet route into the broader library:

- maximum two contextually relevant choices;
- no full random catalog competing with the primary practice;
- “Lihat semua praktik” may remain as a separate library route.

## Ownership rules

| System | Responsibility |
|---|---|
| Catatan | Determine what matters most today |
| Profile | Quietly explain vulnerability or choose between equivalent practices |
| Wellness / Daily Scan | Establish present capacity and contraindications |
| Navigator | Set maximum duration and intensity |
| Journey | Rotate, continue, deepen, or soften tomorrow's practice |
| Astro | Light context only; never select the issue or exercise |
| Innerwork | Translate one issue into one doable practice |

## Selection order

1. Reject practices that exceed capacity or have contraindications.
2. Match the dominant issue.
3. Enforce Navigator duration.
4. Apply journey continuity and repetition limits.
5. Use user preference and profile only as tie-breakers.
6. Select one primary and no more than one supporting practice.

## Failure and fallback behavior

- Missing Catatan issue: use a neutral 2-minute body check-in; do not generate a profile-based diagnosis.
- Missing Navigator: default to REFLECTION only if current wellness is adequate; otherwise RECOVERY.
- Missing journey: choose a low-intensity first practice and make no memory claims.
- No safe taxonomy match: direct the user to rest, scan again, or browse the library voluntarily.
- AI unavailable: deterministic issue mapping must still work.

## What happens to the library?

The library remains useful, but changes role:

- **Today:** curated continuation of Catatan.
- **Explore:** full voluntary exercise library.

This preserves choice without allowing the catalog to masquerade as today's recommendation.

## Architecture verdict

The current content inventory is sufficient for an initial V5, especially for body awareness, direction, emotional processing, and growth. Before full readiness it needs:

- native 2–5 minute variants;
- stronger grief and forgiveness practices;
- safety and claims review for audio/herbal language;
- one shared dominant-issue contract;
- completion-based journey progression;
- removal of parallel random/profile-first recommendation paths.

With those boundaries, Innerwork becomes the embodied next sentence of Catatan—not another report and not a random shelf of exercises.
