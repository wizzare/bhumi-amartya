# Wellness Escalation Safety Matrix: KARA V3

This matrix identifies the types of errors possible in the current triage system.

| Error Type | Description | Scenario | Severity |
| :--- | :--- | :--- | :--- |
| **False Low** | User in danger is given self-care tools. | Relationship score 5, but Body/Emotion 60. | **CRITICAL** |
| **False Low** | Accumulation of distress is ignored. | Body 26, Emotion 26, Meaning 26 (Total functional low). | **HIGH** |
| **False High** | Healthy user is pushed to clinical paths. | Sudden sleep deprivation triggers RECOVERY mode. | **LOW** |
| **Missed Risk** | No escalation for high-distress spirituality. | Spirituality score 10 (Crisis of faith/spiritual distress). | **MEDIUM** |
| **Over-Escalation** | Excessive concern for spiritual growth. | High spirituality + mild stress triggers SPIRITUAL_CRISIS. | **LOW** |

## Critical Logic Floor Comparison

| Dimension | Threshold | Escalation Triggered? |
| :--- | :--- | :--- |
| **Body** | < 25 | YES (Level 3) |
| **Emotion** | < 25 | YES (Level 3) |
| **Meaning** | < 25 | YES (Level 3) |
| **Relationship** | < 25 | **NO** |
| **Spirituality** | < 25 | **NO** |

**Conclusion:** The system has a 40% "Dimension Blindness" rate in its hard-coded escalation logic.
