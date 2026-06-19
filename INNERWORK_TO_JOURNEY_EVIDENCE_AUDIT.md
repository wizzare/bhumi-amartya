# Innerwork to Journey Evidence Audit

## Runtime path

`app/innerwork/page.tsx:431-483` → `dailyStateRepository.saveDailyState()` → Firestore `dailyStates/{uid}/entries/{date}` → `journeyRepository.updateDailyRecord()` → Firestore `journeyDailyRecords/{uid}/entries/{date}`.

## Exact persisted payload

Daily State receives:

```json
{
  "innerworkDone": true,
  "innerworkReflection": "<selected reflection>",
  "innerworkJourney": {
    "date": "<dateKey>",
    "userId": "<uid>",
    "dominantIssue": "<practice.issueKey>",
    "issueCategory": "<practice.issueCategory>",
    "innerworkType": "<practice.type>",
    "practiceId": "<practice.practiceId>",
    "practiceTitle": "<practice.title>",
    "durationMinutes": "<practice.durationMinutes>",
    "navigatorMode": "<practice.navigatorMode>",
    "completed": true,
    "reflectionResult": "<selected reflection>",
    "sourceSignals": ["<runtime signals>"],
    "createdAt": "<ISO timestamp>"
  }
}
```

Journey Daily Record receives:

```json
{
  "innerworkCompletion": {
    "completed": true,
    "skipped": false,
    "completedAt": "<ISO timestamp>",
    "actualPracticeId": "<practice.practiceId>",
    "actualPracticeType": "<practice.type>",
    "actualDuration": "<practice.durationMinutes>",
    "reflectionResult": "<selected reflection>",
    "reflectionResponse": "<Bhumi response>",
    "practiceHelped": true,
    "userFelt": "<selected reflection>"
  },
  "updatedAt": "<ISO timestamp>"
}
```

The recommendation record containing issue, category, title, planned duration, intensity, reason, and source signals is written earlier when Innerwork loads (`app/innerwork/page.tsx:354-384`).

## Persisted

- Issue and category: yes, on the Journey record root.
- Recommended and actual practice: yes.
- Planned and actual duration: yes.
- Reflection result and generated response: yes.
- Completion and update timestamps: yes.
- Navigator mode, wellness state, Catatan context, astro context, and profile signals: yes when prior writes succeed.

## Lost or absent

- Actual elapsed duration is not measured; planned duration is copied into `actualDuration`.
- User note is supported by the type but never written here.
- Start timestamp and end timestamp are not separately persisted.
- Instructions and expected benefit are not stored in Journey.
- No transaction joins the two Firestore writes. Daily State can succeed while Journey fails.

## Verdict

Core completion memory persists, but write consistency is not atomic.
