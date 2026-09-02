# V5 Experience Architecture

**Status:** Synthesis Document
**Date:** 2026-08-19
**Source:** V4 to V5 Technical Audit, V5 Documentation Reconciliation, V5 User Habit & Experience Audit
**Purpose:** Define what Bhumi V5 fundamentally is as an evolving relationship between USER, BHUMI, MEMORY, DAILY LIFE


---

## What is Bhumi V5 Fundamentally Becoming?

Bhumi V5 is a personal companion for self-understanding that grows more useful through quiet continuity, not daily demands. It is a place you return to because it helps you make sense of your own rhythm -- your emotions, patterns, and growth -- without pressure, guilt, or performance. Bhumi remembers what matters so you dont have to carry it alone, and it offers that memory back as gentle context, never as instruction. Over time, Bhumi becomes the only digital space that feels like it actually knows you -- not your data, but your journey.

---

## What Should Bhumi NEVER Become?

Bhumi must never become a taskmaster, a streak enforcer, a content feed, a gamified habit tracker, a diagnostic tool, or a source of obligation. It must never shame you for absence, manufacture urgency, sell your attention, or pretend to know you better than you know yourself. It must never turn vulnerability into a workflow, reflection into a metric, or companionship into retention engineering. If Bhumi ever feels like work, it has failed.

---

## 1. Core Experience Definitions

### 1.1 First-Use Experience (Day 0)

What the user feels: This understands what Im looking for.

| Moment | Experience |
|--------|------------|
| App opens | No login wall. Soft welcome: Welcome to Bhumi. This is your space to understand yourself. |
| Language | Inline selector: Indonesia / English / Melayu / Espanol / Portugues / Francais. Persists immediately. |
| Blueprint capture | Optional, guided: To make Bhumi personal, we need your birth date, time, and place. This stays on your device until you choose to sync. Skip-able with Not now -- Ill explore first. |
| Intention setting | One question: What brought you here? Options: Curiosity / Stress / Growth / Healing / Other / Im not sure. Sets initial relationship state. |
| First Daily Note | Generated immediately from blueprint (if provided) or generic welcome. Shows attribution: This insight comes from your Life Path 7 or This is a general welcome -- it gets personal as you share. |
| Comfort Mode intro | Visible button: Just accompany me -- no explanation needed. One tap -> calm presence. |
| No pressure messaging | Explicit: No streaks. No daily requirements. You decide when and how to return. |

Exit state: User has seen value (Daily Note), knows Comfort Mode exists, understands no obligation.

---

### 1.2 Daily Experience (Typical Return)

What the user feels: Bhumi fits into my day, not the other way around.

`
OPEN
  |
ORIENTATION (0-3 sec)
  - Returning user? -> Welcome back. Your last note was about [theme].
  - First time today? -> Soft check-in
  - Same day return? -> Youre back. Want to continue where you left off?
  |
NEED DISCOVERY (Check-in) -- OPTIONAL
  - What do you need today? [Tired / Curious / Reflective / Overwhelmed / Same as yesterday / I dont know / Just show me]
  - Same as yesterday skips to Daily Note
  - I dont know -> Comfort Mode
  - Just show me -> Daily Note immediately
  |
OPTIONAL PATH SELECTION
  |
  +-- LEARN -> Daily Guidance / Daily Note (personalized by Memory)
  |
  +-- REFLECT -> Tiny Step inline in Note (breathe, re-read, one sentence)
  |
  +-- JOURNAL -> Mode selector (Free / CBT / Emotion / Guided / Spiritual)
  |
  +-- TALK -> AI conversation (future)
  |
  +-- EXPLORE -> Blueprint / Arsip Akashi / Journey / Wellness
  |
  +-- REST / COMFORT -> Comfort Mode (calm presence, Memory resurface)
  |
  +-- DO NOTHING -> Valid completion. Thats enough for today.
  |
VALUE DELIVERED
  - Insight, calm, clarity, or simply presence
  |
OPTIONAL ACTION (not required)
  |
MEMORY INTEGRATION (background)
  |
FUTURE RELEVANCE (seeded)
`

Key principle: Every path is valid. Do nothing = successful interaction.


### 1.3 Low-Energy Experience

What the user feels: I dont have to perform here.

- Check-in shows Tired as first option (not buried)
- I dont know what I need -> immediate Comfort Mode
- Comfort Mode: 4 sentences max, no tasks, no analysis, just presence
- Do nothing Tiny Step option visible and valid
- No evening reflection prompt if user hasnt journaled
- Notifications suppressed if low-energy pattern detected
- Premium upsell hidden

### 1.4 I Dont Know What I Need Experience

What the user feels: Its okay not to know.

- Dedicated check-in option: I dont know
- Immediate transition to Comfort Mode
- Comfort Mode offers: Thats okay. Im here. Want to just breathe for a moment? Or shall I show you yesterdays note?
- No pressure to articulate
- Memory may surface: Last time you felt this way, you wrote about [theme]. Want to revisit?
- User can stay in Comfort Mode indefinitely

### 1.5 Information-Seeking Experience

What the user feels: I can just read.

- Just show me check-in option -> Daily Note immediately
- No check-in required for returning users who checked in yesterday
- Daily Note includes: Blueprint insight, transit context, one Tiny Step (inline), Memory thread if relevant
- Blueprint / Arsip Akashi / Journey accessible from Note without separate navigation
- Save for later on any insight -> adds to Memory thread

### 1.6 Journaling Experience

What the user feels: This helps me understand myself, not perform for an app.

| Mode | When It Appears | Who Chooses | Memory Feed |
|------|-----------------|-------------|-------------|
| Free | Always available, default from Comfort Mode | User | Theme extraction (opt-in) |
| CBT | Inner Work hub, or Understand my thinking from Daily Rhythm | User | Recurring thought patterns |
| Emotion | Inner Work hub, or Understand my feeling from Daily Rhythm | User | Emotional pattern tracking |
| Guided | Inner Work hub, or Guide me from Daily Rhythm | User | Theme + blueprint correlation |
| Spiritual | Inner Work hub, or Explore meaning from Daily Rhythm | User | Meaning/theme extraction |

Journal Flow:
1. Mode selector (5 modes + Continue yesterdays draft)
2. Write -> auto-save every 30s (draft indicator)
3. Exit anytime -> Saved as draft. Continue later?
4. Complete -> Want to add a mood tag? (optional)
5. AI response (if enabled): One gentle reframing, never diagnosis
6. History: Timeline, search, filter by mode/theme/mood

Draft Recovery: Drafts persist per mode. Continue draft appears at top of mode selector. Conflict resolution: You have a draft from [date]. Continue or start fresh?


### 1.7 Comfort Experience

What the user feels: I can just be here.

| Entry Point | Response |
|-------------|----------|
| Check-in: I dont know | Immediate Comfort Mode |
| Check-in: Overwhelmed | Comfort Mode offered first |
| Dashboard: Temani aku | Comfort Mode |
| Journal: Exit without writing | Comfort Mode |
| Return after absence | Comfort Mode offered |

Comfort Mode Rules:
- 4 sentences max or brief grounding
- No tasks, no streaks, no meditation prompts, no premium upsell
- Memory may surface: You once wrote... or This might resonate...
- Exit: Frictionless (swipe, back, close)
- Persists as last chosen path for next open
- Notifications: Only Thinking of you after 3+ days absence

### 1.8 Returning-After-Absence Experience

What the user feels: Theyre glad Im back, not mad I left.

| Absence | Bhumi Response |
|---------|----------------|
| Same day | Youre back. Want to continue where you left off? |
| Next day | Welcome back. Your note yesterday was about [theme]. |
| 3 days | Good to see you. No pressure -- just wanted you to know your Daily Note is ready when you are. (notification) |
| 7 days | Welcome back. A lot can change in a week. Your last reflection was about [theme]. Want to continue, start fresh, or just read todays note? |
| 30 days | Welcome back. Its been a while. Want to update your blueprint, or just explore? Heres what Bhumi remembers: [3 themes, 1 goal]. All editable. |

Never: You missed X days, Streak broken, Dont lose progress, guilt language.

### 1.9 Long-Term Experience (Day 90+)

What the user feels: Bhumi helps me understand my own life.

- Weekly reflection: Automatic synthesis every Sunday (opt-in) -- This week you explored [theme] 3 times. Notice any shift?
- Monthly pattern: 30 days ago you were wrestling with [theme]. Today you wrote [contrast].
- Milestone acknowledgment: 100 days with Bhumi. No badge -- just wanted you to know.
- Relationship deepening: Check-in adapts (fewer options, usual time detection)
- Tiny Steps reference personal patterns: Re-read your boundary reflection from Day 45
- User can ask: What have I been exploring? -> Bhumi shows theme timeline
- Memory dashboard accessible: View, edit, delete, export any remembered theme


---

## 2. Adaptive Daily Loop

### Loop Structure

`
OPEN
  |
ORIENTATION
  - Detect: new / returning today / same-day return / absence return
  - Adapt: greeting, check-in depth, path suggestions
  |
NEED DISCOVERY (Check-in) -- ALWAYS OPTIONAL
  - Full: 6 options (Tired / Curious / Reflective / Overwhelmed / Same as yesterday / I dont know)
  - Adaptive: 3 options for familiar users (based on pattern)
  - Bypass: Just show me -> Daily Note
  - Skip: Same as yesterday -> Daily Note + Comfort Mode hint
  |
OPTIONAL PATH (User chooses, not system)
  +-- LEARN -> Daily Note + Guidance (personalized)
  +-- REFLECT -> Tiny Step inline
  +-- JOURNAL -> Mode selector (with Continue draft)
  +-- TALK -> AI conversation (future)
  +-- EXPLORE -> Blueprint / Akashi / Journey / Wellness
  +-- REST -> Comfort Mode
  +-- NOTHING -> Valid completion
  |
VALUE (not task completion)
  - Insight, calm, clarity, presence, continuity
  |
OPTIONAL ACTION
  - Journal, Tiny Step, Explore, Talk -- all invitational
  |
MEMORY INTEGRATION
  - Themes, patterns, goals, preferences, declared context
  - Only from user-declared or clear patterns (3+ occurrences)
  |
FUTURE RELEVANCE
  - Seeds for tomorrow: theme continuity, timing optimization, tone adaptation
`

### Valid Path Combinations

| User State | Suggested Primary | Also Available |
|------------|-------------------|----------------|
| New user | LEARN (with attribution) | COMFORT, EXPLORE |
| Tired | REST | LEARN (short), NOTHING |
| Overwhelmed | REST | JOURNAL (Emotion/Free), NOTHING |
| Curious | LEARN | EXPLORE, JOURNAL (Guided) |
| Reflective | JOURNAL | LEARN, REST |
| Returning after gap | REST + CONTINUITY | LEARN, EXPLORE |
| Frequent user (Day 30+) | ADAPTIVE (less friction) | ALL |

---

## 3. User Relationship State Model

### Internal States (Not User-Visible)

| State | Entry Conditions | Transition Signals | UX Adaptation | Must NOT Change |
|-------|------------------|-------------------|---------------|-----------------|
| NEW | First open | Blueprint captured + first Daily Note read | Onboarding flow, full check-in options, attribution visible | Comfort Mode access, no-pressure messaging |
| ORIENTING | Days 1-3, <3 interactions | Check-in completed, first journal | Progressive disclosure: Tiny Step introduced, Journal modes explained | All paths available, no defaults forced |
| EXPLORING | Days 3-14, 3+ journals | Mode variety, theme emergence | Memory capture begins (3+ same theme), Continue draft appears | No streak UI, all modes equal |
| FAMILIAR | Day 14+, pattern detected | Consistent check-in time, recurring themes | Check-in reduces to 3 options, usual time detection, notification timing optimized | Comfort Mode always first-class |
| CONTINUING | Day 30+, stable rhythm | Weekly reflection engaged, Memory dashboard used | Weekly synthesis, theme timeline, Bhumi noticed moments | No guilt language, all paths optional |
| REFLECTIVE | Triggered by: major life context declared, therapy-mode journaling | CBT/Emotion depth, user-declared context | Deeper prompts, crisis resource awareness, longer Comfort Mode | Non-diagnostic boundary, user agency |
| DEEPENING | Day 90+, Memory dashboard active | User edits Memory, requests exports, asks what have I explored | Quarterly review, relationship milestones, AI depth control | Trust > automation, user owns memory |

Transition Rules:
- States only move forward (no demotion)
- Transitions require sustained signals (not single events)
- User can reset to ORIENTING anytime via Start fresh in Memory dashboard
- State never displayed to user -- only adapts experience

---

## 4. Time-Based Evolution

| Period | What Bhumi Knows | What Bhumi Personalizes | User Sees | Stable | Evolves |
|--------|------------------|------------------------|-----------|--------|---------|
| Day 1 | Blueprint (if provided), language, intention | Daily Note from blueprint | Welcome, first Daily Note, Comfort Mode intro | No-pressure messaging, all paths available | -- |
| Day 3 | 3 check-ins, 0-2 journals, check-in pattern | Check-in order (most-used first), notification timing | Reduced check-in options if pattern clear | Comfort Mode, all 5 journal modes | Check-in brevity |
| Day 7 | 7 Daily Notes, themes (3+ same = captured), journal modes used | Daily Note tone, Tiny Step relevance, GUIDED prompts | Continue draft, theme threads in GUIDED | Core philosophy, 6 locales | Memory visibility begins |
| Day 14 | Behavioral rhythm (time, frequency), 2+ themes | Notification timing, Tiny Step from Memory, Comfort Mode triggers | Your usual time check-in shortcut, weekly reflection offer | All paths optional, no defaults | Weekly rhythm awareness |
| Day 30 | Declared goals, recurring themes, progress signals | Monthly pattern summary, milestone acknowledgment, Bhumi noticed | Monthly reflection, theme timeline access, Memory dashboard (P1) | No streak UI, no guilt | Relationship depth |
| Day 90 | Deep pattern map, user-corrected Memory, declared life context | Quarterly review, seasonal adaptation, AI depth preference | Quarterly synthesis, relationship milestone, export option | User owns memory, all paths | Seasonal/quarterly rhythm |

Anti-Fake-Personalization Rules:
- No Because youre a Life Path 7... unless user asked
- No manufactured insights -- only from user-declared or 3+ pattern
- Attribution always visible: This comes from your [source]
- User can disable any personalization axis


---

## 5. Memory to Experience Mapping

### The Pipeline

`
JOURNAL ENTRY
  |
  v
EXTRACTION (AI + rules, user-consented)
  - Themes (3+ occurrences)
  - Declared goals (explicit)
  - Declared context (explicit: going through divorce)
  - Preferences (mode, time, language)
  - Progress signals (user-marked)
  |
  v
MEMORY STORE (user-scoped, encrypted, local-first)
  - recurringThemes: [{theme, frequency, lastSeen, pinned}]
  - growthGoals: [user-declared]
  - preferences: {key: value}
  - curatedSummary: AI synthesis (weekly/monthly)
  |
  v
PATTERN RECOGNITION
  - Frequency thresholds (3+ for themes)
  - Decay: 90 days no reinforcement -> fade (unless pinned)
  - Correlation: theme + blueprint + time + mode
  |
  v
INSIGHT GENERATION (context-aware, not continuous)
  - Triggered by: Daily Note generation, GUIDED prompt selection, Comfort Mode, Weekly reflection
  - Never: push notification, unsolicited, diagnostic
  |
  v
FUTURE EXPERIENCE ADAPTATION
  - Daily Note: theme thread continuation
  - Tiny Step: references personal pattern
  - GUIDED prompts: theme-aware
  - Comfort Mode: resurface healing reflection
  - Notifications: relevance-gated
`

### Boundary Rules (What Memory Must NOT Do)

| Must NOT | Enforcement |
|----------|-------------|
| Diagnose | No clinical language in output; crisis detection -> resource referral only |
| Overinterpret | Max 1 theme reference per Daily Note; no causal claims |
| Force topic | Theme only surfaces when relevant to current context (check-in, journal mode) |
| Repeatedly mention | Same theme max 1x/week in Daily Note; user can mute theme |
| Store raw text without consent | Opt-in only for full journal text; default = themes only |
| Share across users | User-scoped only; no aggregation |
| Train AI on user content | Explicit prohibition in privacy spec |

### Example

User journals 4x over 2 weeks about uncertainty around work decisions (CBT + Guided modes).

Memory captures: theme=work uncertainty, frequency=4, lastSeen=today, correlated with Guided mode + Mercury transit.

Future Daily Note (when relevant): Your Daily Note today touches on decision-making -- youve been exploring work uncertainty lately. Mercurys current transit may amplify this.

Future Comfort Mode: You once wrote: I trust that clarity comes in its own time. That might resonate today.

Future GUIDED prompt: When you think about your work uncertainty, what sensation arises in your body?

Never: You have anxiety about work. Heres how to fix it. / Daily push about work uncertainty. / Mention in every note.

---

## 6. Return Experience Design

### Absence Response Matrix

| Absence | In-App Greeting | Notification (if opted in) | Memory Resurface |
|---------|-----------------|---------------------------|------------------|
| <1 hour | Youre back. Continue where you left off? | None | Draft recovery |
| Same day | Welcome back. Still on [theme]? | None | Last journal thread |
| 1 day | Welcome back. Yesterdays note was about [theme]. | None | Yesterdays Daily Note |
| 3 days | Good to see you. No pressure -- your note is ready. | Thinking of you. Your Daily Note is here when youre ready. | Last 3 themes summary |
| 7 days | Welcome back. A lot can change in a week. Last time: [theme]. Continue / Fresh / Just read. | We missed you. No pressure -- just wanted you to know Bhumi's here. | Theme timeline (3) + 1 goal |
| 14 days | Welcome back. Want to update your blueprint or just explore? Bhumi remembers: [3 themes, 1 goal]. | Its been a while. Your space is here whenever youre ready. | Full Memory summary (editable) |
| 30 days | Welcome back. A lot may have changed. Update blueprint / Explore / Comfort Mode. Memory: [summary]. | Your Bhumi space is still here. No expectations. | Full Memory dashboard link |

Principles:
- No guilt, ever -- language audit against forbidden phrases
- Memory as gift -- Bhumi remembers not You forgot
- Choice restored -- Continue / Fresh / Comfort / Just read
- Proportional -- longer absence = more context, less pressure

---

## 7. Comfort as First-Class Experience

### Comfort Mode Position in Architecture

`
DAILY RHYTHM ENTRY
  |
  +-- WHAT DO YOU NEED?
        |
        +-- Tired / Overwhelmed / I dont know -> COMFORT MODE (primary)
        +-- Curious / Reflective -> LEARN (Daily Note) + COMFORT MODE (available)
        +-- Same as yesterday -> DAILY NOTE + Comfort hint
        +-- Just show me -> DAILY NOTE (Comfort accessible via header)
`

### Comfort Mode Relationships

| System | Relationship |
|--------|--------------|
| Daily Rhythm | Equal path (not alternative). Rest = valid Daily Rhythm completion. |
| Journal | Entry point from Comfort Mode -> Free mode default. Write if you want. |
| AI Conversation | Comfort Mode = Talk path with calm, brief, non-directive persona. |
| Memory | Source of resurfaced reflections (You once wrote...). No new capture unless user saves. |
| Notifications | Only absence re-engagement (Day 3+). Never daily nudge. Tone: Thinking of you. |
| Premium | Comfort Mode fully free. No premium gates. No upsell in Comfort flow. |
| Habit Systems | Comfort Mode = valid interaction. Increases days present counter (not streak). |

### Comfort Mode UX Contract
- Entry: One tap from any entry point
- Content: 4 sentences max OR brief grounding OR Memory resurface
- Constraints: No tasks, no streaks, no meditation, no analysis, no upsell
- Exit: Frictionless (swipe, back, close)
- Persistence: Remembers as last path for next open
- Accessibility: Always visible in check-in, Dashboard header, Journal entry


---

## 8. Journal Relationship Architecture

### Mode Selection Logic

| Context | Default Mode | Also Shown |
|---------|--------------|------------|
| From Daily Rhythm Reflect | Guided | Free, CBT, Emotion, Spiritual |
| From Daily Rhythm I dont know | Free (via Comfort) | All |
| From Inner Work hub | Last used | All + Continue draft |
| From Comfort Mode exit | Free | All |
| From Continue draft | That mode | -- |

### Memory Feed Rules

| Mode | Feeds Memory | Extraction |
|------|--------------|------------|
| Free | Opt-in themes | User tags + AI theme detection (consent) |
| CBT | Recurring automaticThought patterns | 3+ same cognitive distortion -> theme |
| Emotion | Emotion tags + intensity trends | 3+ same emotion cluster -> theme |
| Guided | Blueprint-correlated themes | Prompt response patterns -> theme |
| Spiritual | Meaning/thematic threads | User-declared + AI meaning extraction |

### Journal History UX
- Timeline: Reverse chronological, grouped by week
- Filters: Mode, mood, tags, date range, word count
- Search: Full-text + semantic (show me entries about boundaries)
- Continue Draft: Per-mode draft list, conflict resolution UI
- Export: Per-entry or filtered set -> PDF/JSON/text

### AI Response Contract
- Tone: Reflective, never diagnostic
- Length: 2-4 sentences max
- Trigger: User requests (Help me reframe) or completes CBT step 6
- Control: User can disable AI responses per mode
- Boundary: Crisis keywords -> resource card, not AI response

---

## 9. Notification Philosophy

### Why Notifications Exist
1. Invite to Daily Note -- Your note is ready when you are
2. Gentle return -- Thinking of you (after 3+ days)
3. Weekly synthesis -- This week you explored [theme] (opt-in)
4. Milestone acknowledgment -- 100 days with Bhumi (opt-in)

### When Appropriate
| Trigger | Condition | Frequency Cap |
|---------|-----------|---------------|
| Daily Note ready | User has check-in pattern + opted in | 1/day, personalized time |
| Return after absence | 3+ days since last open | 1 per absence period |
| Weekly reflection | User enabled + has journal activity | 1/week (Sunday) |
| Milestone | User enabled + Day 30/90/365 | 1 per milestone |

### When Suppressed
- User in Comfort Mode (current session)
- Low-energy pattern detected (3+ Tired check-ins)
- User dismissed 3 consecutive -> auto-reduce frequency
- Quiet hours (user-configured, default 22:00-07:00)
- Premium upsell never via notification

### Absence Handling
| Days Absent | Notification | Tone |
|-------------|--------------|------|
| 3 | Thinking of you. Your Daily Note is here when youre ready. | Gentle, no action required |
| 7 | Welcome back whenever youre ready. Last week you explored [theme]. | Warm, contextual |
| 30 | Your Bhumi space is still here. No expectations. | Reassuring, zero pressure |

### Personalization
- Timing: From Memory (behavioral pattern) or user-set
- Content: From Memory (theme relevance) or generic
- Language: User locale (6 supported)
- Opt-in: Per category (daily / return / weekly / milestone)

---

## 10. Success Definition

### Qualitative Signals (Primary)

| Signal | Measurement | Target |
|--------|-------------|--------|
| Usefulness | Bhumi helped me understand myself (quarterly survey) | >70% agree |
| Continuity | User returns after 7+ day gap without re-onboarding | >40% |
| Trust | I control what Bhumi remembers (survey) | >80% agree |
| Return with intention | Session starts with I want to... not I have to... | >60% |
| Meaningful reflection | Journal entries with moodAfter != moodBefore (positive shift) | >30% |
| Personalization quality | Daily Note feels relevant to me today (in-app tap) | >65% |

### Quantitative Signals (Secondary, Guardrails)

| Metric | Purpose | Guardrail |
|--------|---------|-----------|
| Weekly Active Users | Health indicator | Not optimized for -- track only |
| Journal entries per user/month | Engagement depth | No target -- monitor distribution |
| Comfort Mode usage | Safety valve health | >15% of sessions (indicates availability) |
| Memory dashboard visits | Agency exercise | >10% monthly (indicates trust) |
| Notification opt-out rate | Annoyance signal | <20% (if higher -> reduce frequency) |
| Draft recovery rate | UX quality | >80% of drafts continued |

### Anti-Metrics (Must NOT Optimize)
- Daily Active Users (DAU)
- Streak maintenance rate
- Session length
- Number of journals per week
- Notification click-through rate
- Feature adoption funnel completion


---

## 11. Experience to Document Matrix

| Experience Requirement | Existing Document | Missing Specification | Priority | Implementation Phase |
|------------------------|-------------------|----------------------|----------|---------------------|
| First-use onboarding flow | CLAUDE.md (language selector only) | Complete onboarding spec | P0 | Phase 1.5 |
| Daily Rhythm adaptive loop | V5_DAILY_RHYTHM_SPEC.md | Adaptive check-in, path equality, do nothing validity | P0 | Phase 1.5 |
| I dont know -> Comfort flow | V5_COMFORT_MODE_UX_SPEC.md (entry points only) | Immediate transition, Comfort as primary path | P0 | Phase 1.5 |
| Empty/failure states | -- | AI fail, empty note, network error, nothing to say | P0 | Phase 1.5 |
| Memory -> Daily Guidance integration | V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md (conceptual) | Concrete pipeline spec | P0 | Phase 4.5 |
| Journal draft recovery UX | V5_JOURNAL_INNER_WORK_SPEC.md (mentions) | Draft list, conflict resolution, auto-save indicator | P0 | Phase 4 |
| Returning user greeting | V5_PRODUCT_PHILOSOPHY.md (Law 6 only) | Absence detection, gap acknowledgment, Memory resurface | P0 | Phase 1.5 |
| Comfort Mode as first-class | V5_COMFORT_MODE_UX_SPEC.md (alternative entry) | Equal path in Daily Rhythm, persistence, premium-free | P0 | Phase 1.5 |
| Journal history/search | V5_JOURNAL_INNER_WORK_SPEC.md (mentions) | Timeline, filters, semantic search, export | P1 | Phase 4 |
| Memory dashboard (view/edit/delete) | V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md (P4) | Consent flow, correction, transparency, export | P1 (promote from P4) | Phase 4.5 |
| Adaptive check-in | V5_DAILY_RHYTHM_SPEC.md (static 6 options) | Progressive disclosure, usual time, pattern-based | P1 | Phase 3 |
| Weekly reflection flow | V5_DAILY_RHYTHM_SPEC.md (conceptual) | Sunday synthesis, pattern summary, progress visibility | P1 | Phase 6 |
| Notification personalization | V5_NOTIFICATION_FCM_SPEC.md (tone only) | Frequency caps, category opt-in, gap-aware, user controls | P1 | Phase 5 |
| Continue yesterday thread | V5_JOURNAL_INNER_WORK_SPEC.md (missing) | Draft list + thread continuation | P1 | Phase 4 |
| Mood/emotion trend viz | V5_DATA_MODEL.md (moodBefore/After) | Visualization, progress without streaks | P1 | Phase 4.5 |
| Blueprint attribution in Note | V5_DAILY_RHYTHM_SPEC.md (missing) | This comes from your [source] inline | P1 | Phase 3 |
| CBT crisis detection | V5_CBT_JOURNAL_DESIGN.md (boundary stated) | Resource referral, non-diagnostic enforcement | P1 | Phase 4 |
| DailyState checklist booleans | V5_DATA_MODEL.md (checkInDone, etc.) | Remove booleans -> interaction tracking | P0 | Phase 1.5 |
| Memory dashboard priority | V5_TODO.md / V5_IMPLEMENTATION_ROADMAP.md (P4) | Promote to P1 | P0 (re-prioritize) | Phase 4.5 |
| Onboarding/empty states phase | V5_IMPLEMENTATION_ROADMAP.md | Insert Phase 1.5 | P0 | Phase 1.5 |

---

## 12. Documentation Restructure Decision

| Proposed Document (from User Habit Audit) | Decision | Rationale |
|-------------------------------------------|----------|-----------|
| V5_ONBOARDING_SPEC.md | KEEP | Distinct enough; Day 0 critical |
| V5_DAILY_RHYTHM_EMPTY_STATES.md | MERGE -> into V5_DAILY_RHYTHM_SPEC.md | Part of Daily Rhythm, not separate |
| V5_MEMORY_DASHBOARD_SPEC.md | KEEP | Complex enough; P1 now |
| V5_JOURNAL_HISTORY_SPEC.md | MERGE -> into V5_JOURNAL_INNER_WORK_SPEC.md | Journal history is core journal UX |
| V5_NOTIFICATION_PERSONALIZATION_SPEC.md | MERGE -> into V5_NOTIFICATION_FCM_SPEC.md | Notification spec should be complete |
| V5_ADAPTIVE_RHYTHM_SPEC.md | MERGE -> into V5_DAILY_RHYTHM_SPEC.md | Adaptive rhythm IS Daily Rhythm |
| V5_WEEKLY_REFLECTION_SPEC.md | KEEP | Distinct periodic experience |
| V5_SAFETY_BOUNDARIES_SPEC.md | KEEP | Cross-cutting safety (CBT, AI, notifications) |

Result: 4 new documents (down from 8), 4 merges into existing canonical docs.

---

## 13. Final Architecture Summary

### The Relationship Model

`
+-------------------------------------------------------------+
|                        USER                                   |
|  (Human, vulnerable, seeking understanding, not tasks)       |
+---------------------------+-----------------------------------+
                            |
                            v
+---------------------------+-----------------------------------+
|                       BHUMI                                   |
|  (Companion: calm, present, non-demanding, contextual)       |
|                                                               |
|  ADAPTIVE DAILY LOOP                                         |
|  OPEN -> ORIENTATION -> NEED DISCOVERY -> OPTIONAL PATH      |
|                      |                                        |
|  PATHS: Learn | Reflect | Journal | Talk | Explore           |
|                      | Rest/Comfort | Do Nothing (ALL VALID)         |
+---------------------------+-----------------------------------+
                            |
                            v
+---------------------------+-----------------------------------+
|                    BLUEPRINT LAYER (11 CETAK BIRU JIWA)       |
|  Life Path | Destiny Matrix | Human Design | Natal Chart      |
|  Weton | BaZi | Vedic | Tzolkin | Whole Sign               |
|  Astrocartography | Zi Wei Dou Shu                          |
|  (11 official Blueprint systems — identity hypotheses)        |
+---------------------------+-----------------------------------+
                            |
                            v
+---------------------------+-----------------------------------+
|                       MEMORY                                  |
|  (Useful continuity only: themes, goals, preferences,        |
|   patterns, progress -- user-scoped, encrypted, opt-in,      |
|   decaying, correctable, exportable, deletable)              |
|                                                               |
|  JOURNAL -> EXTRACTION -> MEMORY -> PATTERN -> INSIGHT       |
|       -> FUTURE EXPERIENCE ADAPTATION                         |
+---------------------------+-----------------------------------+
                            |
                            v
+---------------------------+-----------------------------------+
|                      DAILY LIFE                               |
|  (Where insights live, where patterns play out,              |
|   where user returns from -- not where Bhumi demands presence)|
+-------------------------------------------------------------+
`

### Evolution Over Time

| Time | Relationship Quality |
|------|---------------------|
| Day 1 | This feels safe and relevant |
| Day 3 | Bhumi notices how Im feeling |
| Day 7 | Bhumi remembers what Im exploring |
| Day 14 | Bhumi fits my rhythm |
| Day 30 | Bhumi helps me see my patterns |
| Day 90 | Bhumi helps me understand my life |

---

### Architectural Principle

> **Blueprints provide starting hypotheses about identity.**
> **Lived experience provides evidence.**
> **Life Pattern Engine, when implemented, should connect the two without treating either as absolute truth.**

This principle ensures that Blueprint outputs are treated as starting hypotheses — mirrors for self-reflection — not absolute truth. The Life Pattern Engine, when implemented, will observe how users actually live, confirm or refine those hypotheses through explicit user feedback ([Ya, ini aku] / [Sebagian] / [Tidak]), and continuously refine its understanding. Neither the Blueprint nor the Engine owns the truth; the user does.

---
**STOP AND WAIT FOR FOUNDER REVIEW**

This synthesis is complete. Only V5_EXPERIENCE_ARCHITECTURE.md created. No code modified. No existing canonical documents modified.
