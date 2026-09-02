# V5 Notification & FCM Specification

**Status:** Canonical

**Related:** [V5_SOURCE_OF_TRUTH.md](V5_SOURCE_OF_TRUTH.md), [V5_DAILY_RHYTHM_SPEC.md](V5_DAILY_RHYTHM_SPEC.md), [V5_PRD.md](V5_PRD.md), [V5_EXPERIENCE_ARCHITECTURE.md](V5_EXPERIENCE_ARCHITECTURE.md)

---

## 1. Vision

Notifications in Bhumi V5 are guilt-free, timezone-aware, and rhythm-aligned.
They exist to gently invite the user to check in or read their Daily Note - never to threaten streaks or induce pressure.

---

## 2. FCM Infrastructure

- Configuration: Add messaging section to firebase.json.
- Token Management: Store FCM token in UserProfile.fcmToken.
- Client Registration: Request permission on app start (native Android via Capacitor PushNotifications).
- Backend / Scheduler: Firebase Cloud Functions or scheduled jobs to trigger notifications.

---

## 3. Why Notifications Exist

1. Invite to Daily Note - Your note is ready when you are
2. Gentle return - Thinking of you (after 3+ days absence)
3. Weekly synthesis - This week you explored [theme] (opt-in)
4. Milestone acknowledgment - 100 days with Bhumi (opt-in)

---

## 4. When Appropriate

| Trigger | Condition | Frequency Cap |
|---------|-----------|---------------|
| Daily Note ready | User has check-in pattern + opted in | 1/day, personalized time |
| Return after absence | 3+ days since last open | 1 per absence period |
| Weekly reflection | User enabled + has journal activity | 1/week (Sunday) |
| Milestone | User enabled + Day 30/90/365 | 1 per milestone |

---

## 5. When Suppressed

- User in Comfort Mode (current session)
- Low-energy pattern detected (3+ Tired check-ins)
- User dismissed 3 consecutive -> auto-reduce frequency
- Quiet hours (user-configured, default 22:00-07:00)
- Premium upsell never via notification

---

## 6. Absence Handling

| Days Absent | Notification | Tone |
|-------------|--------------|------|
| 3 | Thinking of you. Your Daily Note is here when you are ready. | Gentle, no action required |
| 7 | Welcome back whenever you are ready. Last week you explored [theme]. | Warm, contextual |
| 30 | Your Bhumi space is still here. No expectations. | Reassuring, zero pressure |

---

## 7. Personalization

- Timing: From Memory (behavioral pattern) or user-set
- Content: From Memory (theme relevance) or generic
- Language: User locale (6 supported)
- Opt-in: Per category (daily / return / weekly / milestone)

---

## 8. Notification Tone & Copy Rules

| Event | Permitted Language | Prohibited Language |
|-------|-------------------|---------------------|
| Habit Nudge | Bhumi: Your Daily Note is ready when you are. | Dont break your streak! |
| Return Greeting | Welcome back. Take a gentle breath. | You havent logged in for 3 days! |
| Evening Reflection | A quiet moment to reflect on today. | Complete your daily task now! |

---

## 9. Acceptance Criteria

- firebase.json contains valid messaging configuration.
- FCM token successfully saves to Firestore user profile.
- Reminder system (reminderSystem.ts) sends actual FCM payload instead of console.log.
- Notifications respect user timezone and quiet hours.
- Frequency caps enforced; adaptive reduction on dismiss.
- Category opt-in respected.
- Comfort Mode session suppresses non-absence notifications.
