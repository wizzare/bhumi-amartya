# INNERWORK WELLNESS INPUT USAGE

Verifying how physical and emotional state gates the experience.

| Wellness Item | Used? | Logic |
|---|---|---|
| **Navigator Mode** | **YES** | Gates visibility of Supporting Practices and Zone B. |
| **Body Score** | **YES** | If Low, forces RECOVERY mode via `deriveCurrentIssue`. |
| **Emotion Score** | **YES** | If Low, triggers "Emotional Fatigue" issue. |
| **Regulation Score** | **NO** | Not currently used as a distinct filter. |
| **30-Question Baseline** | **YES** | Informs the initial Navigator state (Capacity). |
| **5-Question Scan** | **YES** | Informs the `dailyState` snapshot metrics. |

**Verdict:** Wellness is the **primary safety gate**. It determines the *quantity* and *intensity* of the content shown, ensuring a tired user isn't pushed too hard.
