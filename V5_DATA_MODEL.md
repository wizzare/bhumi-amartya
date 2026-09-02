# V5 Data Model Specification

**Status:** Canonical
**Related:** [V5_SOURCE_OF_TRUTH.md](V5_SOURCE_OF_TRUTH.md), [V5_ARCHITECTURE.md](V5_ARCHITECTURE.md), [V5_EXPERIENCE_ARCHITECTURE.md](V5_EXPERIENCE_ARCHITECTURE.md)

---

## 1. User Profile (users/{uid})

`	ypescript
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  language: "id-ID" | "en-US" | "ms-MY"; // CURRENT (D-V5-35). FUTURE/DEFERRED: es-ES, pt-BR, fr-FR
  createdAt: string;
  updatedAt: string;
  blueprint?: UnifiedBlueprint;
  emotionalState?: EmotionalState;
  fcmToken?: string;
  subscription?: {
    status: TRIAL | PREMIUM | FREE;
    expiresAt?: string;
  };
}
`

---

## 2. Journal Entry (journals/{uid}/entries/{entryId} & LocalStorage)

`	ypescript
export interface JournalEntry {
  id: string;
  userId: string;
  journalType: free | cbt | emotion | guided | spiritual;
  dateCreated: string;
  dateCompleted: string;
  content: string;
  prompt?: JournalPrompt;
  emotionalCheckIn?: EmotionalCheckIn;
  emotionalAnalysis?: EmotionalAnalysis;
  wordCount: number;
  durationMinutes: number;
  tags: string[];
  // Mode-specific fields
  cbt?: CBTFields;
  emotion?: EmotionFields;
  guided?: GuidedFields;
  spiritual?: SpiritualFields;
}
`

---

## 3. Living Intelligence Memory (livingIntelligenceMemory/{uid})

`	ypescript
export interface LivingIntelligenceMemory {
  uid: string;
  lastUpdated: string;
  recurringThemes: { theme: string; frequency: number; lastSeen: string; pinned: boolean }[];
  growthGoals: string[];
  preferences: Record<string, string>;
  curatedSummary: string;
}
`

---

## 4. Daily State (dailyState/{uid}/days/{dateKey})

Checklist booleans REMOVED (invite checklist UI). Replaced with interaction tracking:

`	ypescript
export interface DailyState {
  date: string;
  lastInteractionType: learn | reflect | journal | comfort | explore | talk | nothing;
  lastInteractionDate: string;
  checkInResponse?: tired | curious | reflective | overwhelmed | same_as_yesterday | i_dont_know | just_show_me;
  mood?: number;
  word?: string;
}
`

---

## 5. Draft Persistence (localStorage)

`	ypescript
export interface JournalDraft {
  mode: free | cbt | emotion | guided | spiritual;
  content: string;
  updatedAt: string;
  wordCount: number;
}

Key: bhumiJournalDrafts::
`

---

## 6. Acceptance Criteria

- JournalEntry supports journalType discriminator.
- UserProfile.language supports all six canonical locales.
- LivingIntelligenceMemory schema defined with recurringThemes, growthGoals, preferences, curatedSummary.
- DailyState uses interaction tracking (no checklist booleans).
- JournalDraft persistence per mode in localStorage.
- Firestore rules updated for new collections (journals, livingIntelligenceMemory, dailyState, feedback, admin_users).
