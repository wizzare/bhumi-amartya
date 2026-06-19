# Journey Daily Record Schema

`JourneyDailyRecord` contains:

- identity: `id`, `userId`, `date`, `appDate`, `dayOfWeek`
- lifecycle: `createdAt`, `updatedAt`
- daily theme: `dominantIssue`, `issueCategory`, `navigatorMode`
- current state: `wellnessState`, `dailyScanCompleted`, `dailyScanSummary`
- Catatan: `catatanSummary`, `catatanMainDirection`, `catatanChallenge`, `catatanOpportunity`
- context: `astroSummary`, `astroEvents`, `profileSignals`, `sourceConfidence`
- recommendation: practice ID, type, title, duration, intensity, reason, source signals
- completion: completed/skipped, completion time, actual practice, duration, reflection, response, helped state, user feeling/note

Firestore owner rules were added for `journeyDailyRecords`.
