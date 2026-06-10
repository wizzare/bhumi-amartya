# Bhumi Amartya Architecture

Bhumi Amartya is organized around authenticated, per-user data. UI components render already-shaped props; repositories own Firestore access; engines generate insight from a normalized user context; orchestrators coordinate reads, generation, cache, and persistence.

## Data Flow

```
Firebase Auth
  -> AuthContext
  -> users/{uid}
  -> blueprints/{uid}
  -> mapper: UserProfile -> engine context
  -> orchestrator / page workflow
  -> Firestore repositories
  -> UI components
```

## Firestore Shape

```
users/{uid}
  uid
  displayName
  email
  birthDate
  birthTime
  birthCity
  blueprintStatus
  profile (legacy-compatible nested profile fields)
  emotionalState
  healingProgress
  settings
blueprints/{uid}
  lifePath
  natalChart
  humanDesign
  destinyMatrix
  status
  generatedAt
  updatedAt
dailyStates/{uid}/entries/{date}
journals/{uid}/entries/{entryId}
healingProgress/{uid}
```

## Layers

- `context/`: browser auth state and current `UserProfile`.
- `lib/repositories/`: Firestore reads and writes scoped by authenticated `uid`.
- `lib/mappers/`: converts persisted profiles into stable engine input.
- `lib/engines/`: pure generation and analysis logic.
- `lib/prompts/`: prompt builders and output schemas for AI generation.
- `lib/orchestrators/`: central workflow coordination across repositories, prompts, and AI providers.
- `components/`: presentational UI; no Firestore access.
- `app/`: route-level workflow and authenticated page orchestration.

## Dashboard

`DashboardClient` reads `users/{uid}` and `blueprints/{uid}` before calling `DashboardOrchestrator`. If `blueprints/{uid}` is missing, generating, stale, or errored, the dashboard shows an empty state instead of fake identity data. `DashboardOrchestrator` reads today's cache from `dailyStates/{uid}/entries/{date}`; if the snapshot is missing or expired, it gathers the current user's blueprint, emotional memory, healing progress, and astrology transit context, calls `/api/ai/daily-guidance`, writes the generated dashboard back to Firestore, and returns the generated dashboard data.

The server route uses `DailyGuidanceOrchestrator`, `buildDailyGuidancePrompt`, and Gemini. Gemini must return JSON that maps into dashboard sections: soul reflection, astro energy, daily innerwork, shadow insight, meditation recommendation, healing recommendation, healing audio, soul progress, and reminder state.

## Journal And Healing

Journal and healing pages load the current user's emotional memory from `healingProgress/{uid}`. Journal submissions are saved under `journals/{uid}/entries/{entryId}` and daily check-ins under `dailyStates/{uid}/entries/{date}`. Healing practice completions update `healingProgress/{uid}`.

## Remaining Debt

- Astrology and Human Design services are deterministic placeholders until real providers are connected.
- Firestore security rules should explicitly enforce `request.auth.uid == uid` for all user subcollections.
- Dashboard progress counters are initialized conservatively; aggregate rollups should be computed from journal and healing history.
