# Innerwork Journey Loop Flow

## Main-page completion

“Mulai Sekarang” changes React state only.  
“Saya Sudah Melakukan Ini” changes React state only.  
Neither action writes completion.

Only selecting a reflection writes:

```text
dailyStates/{uid}/entries/{dateKey}
innerworkDone: true
innerworkReflection: selected option
uid: repository-injected
date: repository-injected
updatedAt: repository-generated ISO timestamp
```

The `DailyState` TypeScript type inspected does not declare `innerworkReflection`, although the page passes it.

## Journey read

Journey reads recent `dailyStates/{uid}/entries`, then derives completion summary. Main Innerwork does not navigate to Journey after saving and does not verify the write.

## Tomorrow Catatan

Daily Guidance adaptive context can use yesterday completion and prior guidance. Dashboard `DailyNoteV2` can use recent daily states.

## Tomorrow Innerwork

Main Innerwork does not read Journey history. Its “recent history” branch is a placeholder returning `[]`. Tomorrow’s influence can only arrive indirectly through the pre-generated `dailyGuidance.dailyNoteText` or stored recommendations.

## Missing stored fields

The main flow does not store:

- issue key/title;
- selected practice ID/title;
- displayed duration;
- start time;
- completion time;
- practice source;
- Navigator mode;
- astro/profile provenance.

Therefore a Journey record cannot reconstruct what practice the user actually completed from this page.

