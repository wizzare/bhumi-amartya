# Innerwork Entry Flow

Entry: `app/innerwork/page.tsx`.

## Runtime sequence

1. `useAuth()` supplies auth resolution, user UID, and account state.
2. After auth resolves, the page reads profile and blueprint through the dual `storageProvider`.
3. Profile timezone is converted to a local date key.
4. In parallel the page reads:
   - `dailyGuidance/{uid}_{date}` through `dailyGuidanceRepository`;
   - `dailyStates/{uid}/entries/{date}` through `dailyStateRepository`;
   - `wellnessNavigator/{uid}` through `wellnessNavigatorRepository`;
   - a placeholder “recent history” call that returns `[]`.
5. Stored `innerworkRecommendations` are copied from Daily Guidance.
6. Blueprint is transformed by `CanonicalTranslatorService.translate`.
7. Canonical identity is transformed by `HumanMeaningService.generate`.
8. `deriveCurrentIssue` selects one local issue narrative.
9. React state feeds the renderer.

## Imports actually affecting page output

| Dependency | Runtime role |
|---|---|
| `useLanguage`, `translations` | Language context is read, but `t` is not used in the visible Innerwork body. |
| `useAuth` | Gates all user reads and supplies UID. |
| `storageProvider` | Loads profile and blueprint. |
| `getLocalDateKey` | Selects today’s documents. |
| `dailyGuidanceRepository` | Supplies focus and stored recommendations. |
| `dailyStateRepository` | Supplies wellness/mood/completion; saves reflection. |
| `wellnessNavigatorRepository` | Supplies Recovery/Reflection/Growth mode. |
| `CanonicalTranslatorService` | Converts blueprint systems into canonical domains. |
| `HumanMeaningService` | Converts canonical domains into human narratives searched by issue rules. |
| `trackEvent` | Analytics only; no content generation. |
| `ProtectedRoute`, `AppNav`, `BhumiPageHeader` | Access and shell rendering. |

## Not used despite state/import presence

- `recentDailyStates` is declared but never assigned.
- The “recent” promise explicitly resolves to `[]`.
- No Journey repository or Journey engine is called by this page.
- No astro engine is called by this page.
- No Innerwork adapter is called by this page.

