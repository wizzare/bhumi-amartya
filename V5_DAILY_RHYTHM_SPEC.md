# V5 Daily Rhythm Specification

**Status:** Canonical
**Conforms to:** [V5_SOURCE_OF_TRUTH.md](V5_SOURCE_OF_TRUTH.md), [V5_PRODUCT_PHILOSOPHY.md](V5_PRODUCT_PHILOSOPHY.md), [V5_EXPERIENCE_ARCHITECTURE.md](V5_EXPERIENCE_ARCHITECTURE.md)

---

## 1. Overview

The Daily Rhythm is V5 core adaptive daily loop. It is a conceptual relationship model, NOT a mandatory sequence that every user must complete every day.

`
OPEN
-> ORIENTATION
-> NEED DISCOVERY
-> OPTIONAL PATH
-> VALUE
-> MEMORY
-> FUTURE RELEVANCE
`

### 1.1 Key Constraint

The dashboard must NOT become a checklist. Each step in the loop is optional and invitational. No streak UI, no completion checklist, no badges, no mandatory sequence.

### 1.2 Valid Daily Rhythm Completions

A successful Daily Rhythm interaction may be any of:

- Read Daily Note -> Done
- Read Daily Note -> Tiny Step -> Done
- Check-in -> Journal -> Done
- Check-in -> Comfort Mode -> Done
- Just show me -> Daily Note -> Done
- Same as yesterday -> Daily Note -> Done
- Do Nothing -> Done

Do Nothing is a valid successful interaction.

---

## 2. ORIENTATION (0-3 seconds)

On app open, Bhumi adapts greeting based on user state:

| User State | Detection | Greeting |
|------------|-----------|----------|
| New user | No profile | Welcome to Bhumi. This is your space to understand yourself. |
| Returning today | Check-in exists today | You are back. Want to continue where you left off? |
| Next day | Last check-in yesterday | Welcome back. Your note yesterday was about [theme]. |
| 3-day absence | 3 days since open | Good to see you. No pressure - your Daily Note is ready when you are. |
| 7-day absence | 7 days since open | Welcome back. A lot can change in a week. Last time: [theme]. Continue / Fresh / Just read. |
| 30-day absence | 30 days since open | Welcome back. A lot may have changed. Update blueprint / Explore / Comfort. Memory: [summary]. |

No guilt language ever. No you missed X days, streak broken, do not lose progress.

---

## 3. NEED DISCOVERY (Check-in) - ALWAYS OPTIONAL

The check-in is a soft entry point, never a gate. Options:

| Option | Intent | Path |
|--------|--------|------|
| Tired | Low energy | Comfort Mode (primary) | Short Daily Note |
| Overwhelmed | High stress | Comfort Mode (primary) | Journal (Emotion/Free) |
| I do not know | Uncertain | Comfort Mode (immediate) |
| Curious | Exploration | Daily Note + Guidance | Explore |
| Reflective | Depth | Journal (Guided/CBT/Spiritual) | Tiny Step |
| Same as yesterday | Continuity | Daily Note (skip check-in) | Comfort hint |
| Just show me | Information only | Daily Note immediately |

Bypass options: Same as yesterday and Just show me skip to Daily Note. I do not know goes directly to Comfort Mode.

Adaptive check-in (familiar users): reduces to 3 most-relevant options based on pattern.

---

## 4. OPTIONAL PATH (User Chooses, Not System)

After check-in (or bypass), user selects ONE path. All are equally valid:

| Path | Description | Value Delivered |
|------|-------------|-----------------|
| LEARN | Daily Note + Daily Guidance (personalized by Memory) | Insight, relevance |
| REFLECT | Tiny Step inline in Note (breathe, re-read, one sentence) | Small win, presence |
| JOURNAL | Mode selector (Free/CBT/Emotion/Guided/Spiritual + Continue draft) | Emotional processing |
| TALK | AI conversation (future) | Companionship |
| EXPLORE | Blueprint / Arsip Akashi / Journey / Wellness | Self-knowledge |
| REST / COMFORT | Comfort Mode: calm presence, Memory resurface, 4 sentences max | Safety, calm |
| DO NOTHING | Valid completion. That is enough for today. | Permission, autonomy |

---

## 5. VALUE DELIVERED

### 5.1 Daily Note (Catatan Hari Ini)

- Status: V4 generates this but does NOT mount it on the Dashboard. V5 must render it.
- Generated from: blueprint + recent mood + Living Intelligence context.
- Attribution required: This insight comes from your [Life Path / Mercury transit / theme X]
- Persisted as daily state document.
- Mounted on Dashboard (DashboardClient.tsx).

### 5.2 Daily Guidance

- AI narrative synthesis (MiniMax default, Gemini fallback) via AIGateway.
- Must route through gateway cascade (NOT direct Gemini bypass).
- Localized to user locale.
- Memory-gated: only surfaces themes relevant to current context.

### 5.3 Tiny Step (Inline, Optional)

- Single sub-5-minute action, inline in Daily Note.
- Examples: Breathe for 30 seconds. Re-read your boundary reflection from Day 45. Write one sentence. Do nothing - you are allowed.
- Personalized from Memory when available (references personal patterns).
- Never framed as streak requirement.

---

## 6. EMPTY / FAILURE / INSUFFICIENT CONTEXT STATES

| Scenario | Fallback Behavior |
|----------|-------------------|
| AI generation fails | Show cached/fallback Daily Note + Bhumi is having a quiet moment. Here is a gentle reflection... |
| Daily Note empty (no context) | Show Comfort Mode greeting + Sometimes the most insightful days start with nothing. |
| Network error | Show cached Daily Note + You are offline. Your last note was about [theme]. |
| Insufficient context (new user, no blueprint) | Generic welcome note + This gets personal as you share. Want to add your birth details? |
| User has nothing to say | Comfort Mode: That is okay. I am here. Want to just breathe? |

---

## 7. MEMORY -> FUTURE RELEVANCE

Background integration (not a user step):

- Themes, patterns, goals, preferences, declared context -> Living Intelligence
- Only from user-declared or clear patterns (3+ occurrences)
- Seeds for tomorrow: theme continuity, timing optimization, tone adaptation
- Weekly reflection synthesis (opt-in) -> Sunday
- Monthly pattern summary -> 1st of month

---

## 8. HABIT PHILOSOPHY (Constraints)

- Streaks may exist as optional feedback ONLY. No streak UI, no completion checklist.
- Missing days create no guilt.
- Returning after absence is welcomed warmly (You came back).
- The product supports returning after absence without punishment.
- Do Nothing is a valid successful Daily Rhythm completion.

See [V5_PRODUCT_PHILOSOPHY.md](V5_PRODUCT_PHILOSOPHY.md) - Habit Language Guidelines.
