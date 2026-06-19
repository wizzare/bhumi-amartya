# Zone B Fallback Trace

## Issue resolution fallbacks

1. Missing explicit Catatan issue → infer from Catatan text.
2. No text match → derive from profile, wellness, or navigator.
3. No derived match → `difficulty_resting`.
4. Unknown issue in `normalizeIssue()` → `low_energy`.
5. Missing support library entry → `SUPPORT_LIBRARY.low_energy`.

## Runtime failure fallback

If the complete Innerwork load throws:

```text
catch
→ issueNarrative("difficulty_resting")
→ mapInnerworkPractice(..., journeyHistory: [])
→ set main practice
```

The catch path does not call `buildInnerworkDailyDecision()` and does not set support practices. Zone B supporting cards remain empty.

## Rendering fallbacks

- Recovery mode hides supporting practices.
- Incomplete main practice hides supporting practices.
- Empty support array renders no supporting section.
- Journaling or meditation page data failure renders an error/setup state.
- Yoga and Workout still render static databases.
- Audio Healing still renders its fixed embedded playlist.

## Important mismatch fallback

Before repair, successful issue selection still fell back to independent generators because no context was passed.

After repair:

- A valid Zone A entry is theme-locked.
- Missing or invalid query context opens the general category library.
- Unknown issue language uses `sourceTheme` and a generic aligned guide.
- Audio Healing remains excluded from this alignment contract.
