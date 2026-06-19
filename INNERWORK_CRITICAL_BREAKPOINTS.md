# INNERWORK CRITICAL BREAKPOINTS

## 1. Fokus Hari Ini Empty
*   **Breakpoint:** `dailyGuidance.dailyNoteText` is either missing from the source or failed during normalization.
*   **Trace:**
    - `dailyGuidanceRepository.getDailyGuidance` fetches doc.
    - `normalizeUserFacingGuidance` processes `dailyNoteText`.
    - UI attempts `.split('.')[0]`. If string is empty, output is `""`.
*   **Fix:** Add fallback string and verify data population in `innerworkIntelligence`.

## 2. Practice Fallback ("Belum ada praktik...")
*   **Breakpoint:** `innerworkRecommendations` object is empty or missing expected keys (`journaling`, `meditation`, `manifestation`).
*   **Trace:**
    - `innerworkIntelligence.ts` is currently a **STUB** returning `{} as any`.
    - `primaryRec` becomes `undefined`.
*   **Fix:** Implement proper fallback logic in `innerworkIntelligence.ts` or add UI-level fallback practices based on the Dominant Issue.

## 3. Start Button Missing
*   **Breakpoint:** Button is inside the `primaryRec` conditional block.
*   **Fix:** Ensure a primary practice is ALWAYS generated, even if it's a generic "Napas Sadar" (Breath Awareness) for RECOVERY.

## 4. Save Button & Completion Flow
*   **Breakpoint:** User expected an explicit "Save" or "Selesai" action. The reflection buttons currently trigger the save automatically.
*   **Fix:** Add a clear "Selesai" button that reveals the reflection options to make the flow more intentional.
