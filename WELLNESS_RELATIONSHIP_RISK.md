# Wellness Relationship Blind Spot Audit: KARA V3

This audit focuses on the failure of the escalation logic to account for severe social and interpersonal distress.

## 1. Scenario Analysis

| Scenario | Relationship Score | Body/Emotion/Meaning | Current Classification | Expected Classification | Risk Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Severe Isolation** | 5 | 70 / 70 / 70 | **Level 1** (Self Support) | **Level 3** (Professional) | **CRITICAL** |
| **Emotional Abuse** | 10 | 60 / 60 / 60 | **Level 1** (Self Support) | **Level 3** (Professional) | **CRITICAL** |
| **Social Withdrawal** | 15 | 80 / 80 / 80 | **Level 1** (Self Support) | **Level 2** (Community) | **HIGH** |
| **Coercive Control** | 8 | 50 / 50 / 50 | **Level 1** (Self Support) | **Level 3/4** (Clinical/Public) | **CRITICAL** |

## 2. Root Cause
The `wellnessSupportEngine.ts` file explicitly excludes the `relationship` dimension from its hard-coded escalation triggers.

```typescript
// Current Logic (Incomplete)
if (body < 15 || emotion < 15 || meaning < 15) { 
    primaryLevel = 6; // Jalur Aman
}
```

Because `relationship` is missing, a user experiencing severe interpersonal trauma who remains physically healthy and cognitively "aware" will never trigger a professional referral.

## 3. Impact
Users in dangerous interpersonal situations (e.g., domestic toxicity or acute loneliness) are routed to "Self-Directed" tools like Meditasi or Journaling, which may be insufficient or even counter-productive if the core issue is a lack of safety in their physical environment.
