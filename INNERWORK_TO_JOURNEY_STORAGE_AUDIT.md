# INNERWORK TO JOURNEY STORAGE AUDIT

Verifying how completion data is persisted for long-term memory.

| Field | Captured? | Target |
|---|---|---|
| **Date** | **YES** | `dateKey` in `dailyStates`. |
| **Dominant Issue** | **YES** | Implicitly via `dailyState.wellnessMapping`. |
| **Navigator** | **YES** | Cached in `dailyStates` doc. |
| **Practice Name** | **YES** | Captured in `completedActivityIds` (Build 31 upgrade). |
| **Completed Status** | **YES** | `innerworkDone: true`. |
| **Reflection Result** | **YES** | `innerworkReflection: string`. |
| **Timestamp** | **YES** | `updatedAt: string`. |

**Future Requirement:** Ensure the specific practice title is logged to `completedActivityIds` to allow for "Progressive Practice" logic (e.g., don't show the same 2-minute breathwork 5 days in a row).
