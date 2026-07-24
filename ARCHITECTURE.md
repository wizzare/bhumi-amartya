# Bhumi Amartya Architecture

## 1. Purpose and Scope

This document describes the committed V4 / Build 80 architecture. It separates current implementation from pending verification and V5 roadmap. Source-of-truth precedence follows RULES.md: committed code and configuration outrank prose.

## 2. System Context

The application has these system boundaries:

- **Next.js web application** — App Router, server components, client components, static export for Capacitor
- **Firebase Authentication** — email/password, Google (via Capacitor plugin), anonymous (development)
- **Firestore** — primary persistence layer; client SDK with Firestore Rules authorization
- **Firebase Admin SDK** — server-side access for billing verification (Cloud Functions, not deployed)
- **AI provider** — Gemini (primary), configurable provider cascade
- **Analytics/telemetry** — Firestore `analytics` and `user_activity` collections
- **Capacitor Android** — WebView shell, native plugins (auth, filesystem, geolocation, notifications, preferences, share, toast)
- **Google Play Billing** — client-side integration with server-side verification function (not deployed)

## 3. Repository Structure

| Directory/File | Responsibility |
|---|---|
| `app/` | Next.js App Router pages and routes |
| `components/` | React UI components |
| `lib/repositories/` | Firestore read/write persistence |
| `lib/services/` | Application service coordination |
| `lib/engines/` | Deterministic domain logic (blueprint calculations) |
| `lib/prompts/` | AI prompt builders |
| `lib/orchestrators/` | Multi-step workflows |
| `lib/analytics/` | Activity and analytics monitoring |
| `lib/admin/` | Admin dashboard filtering and exclusion |
| `lib/config/` | Build info, API URLs, app configuration |
| `lib/billing/` | Google Play Billing integration and entitlement |
| `lib/firebase/` | Firebase client config, Admin SDK, behavior sync logger |
| `lib/access/` | Access control, premium gate |
| `lib/weeklyGuidance/` | Weekly guidance types and engine |
| `context/` | React context providers (auth) |
| `hooks/` | Custom React hooks |
| `android/` | Capacitor Android native shell and plugins |
| `tests/` | Unit and integration tests |
| `services/humandesign-api/` | External Human Design calculation service (Python) |

## 4. Runtime Architecture

**Authentication flow:** Firebase Auth → AuthContext → UID-bound Firestore reads.

**Profile and Blueprint data:** Setup collects birth data → SDK calculates 8 deterministic engines → results stored in `users/{uid}` and `blueprints/{uid}`.

**Daily Guidance:** Core service admitted (29/29 emulator PASS). Cross-runtime generation deduplication NOT PROVEN. Last-write-wins risk documented.

**Weekly Guidance:** Types and engine admitted with follow-up test coverage. Full release verification NOT CLAIMED.

**Behavior Memory:** Admitted (53/53 emulator PASS). Uses `users/{uid}/behaviorMemory/wellness` with deterministic document identity, transaction writes, atomic increments, bounded arrays (30/200). Schema validation ABSENT. Privacy sensitivity MEDIUM.

**Analytics/telemetry:** `analytics` collection (event-based), `user_activity` collection (session-based). Admin dashboard filters before aggregation.

**Admin Dashboard:** Fetch users → normalize → exclude internal accounts → aggregate → display. Exclusion is filtering, not data deletion.

**Android application shell:** Capacitor 8.3.4, `compileSdk 36`, `targetSdk 36`, `minSdk 24`. AGP 9 compatibility bridge active (temporary). `assembleDebug` and `lintDebug` PASS. Runtime Android 16 QA PENDING.

## 5. Data Access Architecture

Repositories own Firestore persistence contracts. Services coordinate application behavior across repositories and providers. Engines own deterministic domain logic with no side effects. UI components consume shaped props; they do not access Firestore directly.

This pattern is not universal — some older pages read Firestore directly through inline `getDoc`/`getDocs` calls. Migration to repository pattern is partial.

## 6. AI Architecture and Boundaries

- Primary AI provider: Gemini (API key via environment variable)
- Provider fallback: configurable but not runtime-tested in Build 80
- Prompts are constructed in `lib/prompts/` and served through orchestrators
- Deterministic blueprint calculations are never replaced by generative AI
- Daily and Weekly Guidance are AI-generated with UID and date-bound document identity
- Cross-runtime generation deduplication is not proven
- In-memory generation cache is unbounded (documented follow-up)

## 7. Android Architecture

- Capacitor 8.3.4 WebView shell
- `compileSdk 36`, `targetSdk 36`, `minSdk 24`
- AGP 9.2.1, Gradle 9.4.1, JDK 17/21
- `android.builtInKotlin=false` (temporary AGP 9 bridge)
- `android.newDsl=false` (temporary AGP 9 bridge)
- `assembleDebug` PASS, `lintDebug` PASS, `cap doctor` PASS
- Runtime Android 16 QA: PENDING
- The compatibility bridge is temporary technical debt and must be removed before AGP 10 migration

## 8. Admin Architecture

- Centralized account exclusion via `lib/admin/adminAccountExclusions.ts`
- `lib/admin/adminAnalyticsFilter.ts` filters users, activities, and analytics through the same exclusion set
- `lib/services/analyticsService.ts` applies exclusion to metrics
- `app/admin/activity/page.tsx` uses filtered data for display, search, pagination, export
- Admin exclusion is display/aggregation filtering, not data deletion
- Integrated in Build 80 commit `013d49e9`

## 9. Testing and Evidence

| Suite | Result | Evidence |
|---|---|---|
| Daily Guidance emulator | 29/29 PASS | Committed |
| Behavior Memory emulator | 53/53 PASS | Committed |
| Admin exclusion focused | 22/22 PASS | Committed |
| Internal tester exclusion | 48/48 PASS | Committed |
| Android assembleDebug | PASS | Exit 0, verified |
| Android lintDebug | PASS | Exit 0, verified |
| Capacitor Doctor | PASS | Exit 0, verified |
| TypeScript (repository-wide) | FAIL | 21 pre-existing errors; no new regression in recent changed files |
| Admin changed-file TSC | 0 errors | Zero errors in Admin, Android, or foundation files |

## 10. Known Limitations and Technical Debt

- Runtime API 36 (Android 16) QA is PENDING — no emulator or physical-device verification performed
- AGP compatibility bridge (`builtInKotlin=false`, `newDsl=false`) is temporary
- 21 pre-existing TSC errors in `scratch/` and `scripts/` directories
- Cross-runtime generation deduplication not proven for Daily Guidance
- In-memory cache for Daily Guidance generation is unbounded
- Firestore Rules production deployment NOT VERIFIED
- Billing/entitlement backend deployment and final runtime verification pending
- Admin exclusion production deployment pending
- Build 80 is NOT RELEASED
- Production reads/writes require explicit Founder authorization

## 11. V4 and V5 Boundary

All architecture documented here is V4 / Build 80 committed implementation. V5 capabilities (expanded localization, additional blueprint systems, enhanced AI features, behavior memory enhancements) are roadmap and must not be promoted into current architecture documentation without committed implementation evidence.