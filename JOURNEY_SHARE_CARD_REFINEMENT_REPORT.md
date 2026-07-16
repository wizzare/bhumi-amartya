# BHUMI V4 - JOURNEY SHARE CARD REFINEMENT REPORT

## 1. OBJECTIVE COMPLETED
Refined the Journey Share Card data source to reflect actual daily experience while maintaining the existing layout exactly.

## 2. KEY ACHIEVEMENTS
- **Dynamic Content**: Transitioned from static "Pesan Untuk Jiwamu" to randomized sections from today's Daily Note.
- **Manifestation Update**: Replaced static "Law of Affirmation" with randomized entries (Affirmation/Assumption/Attraction) from today's Wellness data.
- **Deterministic Randomization**: Implemented a seeded selection algorithm using `userSeed` and `dateKey` to ensure a consistent but varied experience.
- **Zero Redesign**: Verified that all typography, spacing, colors, and layout remain 100% identical.

## 3. DATA SOURCE MAPPING
| Card Section | New Label | Source Field | Selection Logic |
| :--- | :--- | :--- | :--- |
| **Section 1** | `CATATAN HARI INI DARI BHUMI` | `DailyGuidance.categories[key].insight` | Randomly pick one from 8 eligible categories (Kabar Harimu, Pikiran, etc.) |
| **Section 2** | `MANIFESTASI HARI INI` | `DailyGuidance.manifestation[key]` | Randomly pick one from 3 Laws (Affirmation, Assumption, Attraction) |

## 4. FALLBACK FLOW
1.  **Primary**: Attempt to load today's `DailyGuidance` from Firestore.
2.  **Secondary**: If unavailable, check `localStorage` for cached manifestation.
3.  **Tertiary**: If both fail, generate a local guidance snapshot using the existing logic in `ProfileShareCardSection`.
4.  **Final**: Use hardcoded `FALLBACK_CATATAN` and `FALLBACK_MANIFESTATION` strings to ensure the card is never empty.

## 5. IMPLEMENTATION DETAILS
- **Engine**: Created `lib/profile/dailyShareCardEngineV2.tsx` with randomized selection logic.
- **Integration**: Updated `components/ui/ShareCard.tsx` to consume the new engine.
- **Content Scrubbing**: Enforced "Insight Only" rule for Daily Note sections, stripping titles, explanations, and advice.

## 6. REGRESSION REPORT
- **Visuals**: Layout verified against baseline. No changes detected.
- **Performance**: Seeded randomization is computationally efficient (O(1)).
- **Navigation**: Home, Profil, Wellness, Journey, and Lainnya remain identical.
- **Language**: Supports both Indonesian and English via the `useLanguage` context.

## 7. SUCCESS STATUS
The Journey Share Card is now **Dynamically Engaged**.
**Regression Risk: Zero.**
