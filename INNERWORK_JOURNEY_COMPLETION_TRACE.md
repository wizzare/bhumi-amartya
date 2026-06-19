# Innerwork Journey Completion Trace

1. User opens Innerwork.
2. Catatan issue becomes `practice.issueKey`.
3. User selects `Mulai Sekarang`.
4. Engine instructions are displayed.
5. User selects `Saya Sudah Melakukan Ini`.
6. User selects a reflection result.
7. `dailyStateRepository.saveDailyState()` stores the complete `innerworkJourney`.
8. Tomorrow, recent daily states provide practice ID, type, issue, and result to Innerwork.
9. Catatan receives the latest Journey completion summary through `DashboardJourneyRuntimeAdapter`.
