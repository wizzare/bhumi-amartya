# Firebase Architecture Proposal for Bhumi App

## Overview
This document proposes a Firebase architecture to migrate the Bhumi app from localStorage to cloud persistence, enabling real users and Play Store deployment while maintaining all existing functionality.

## Collections Architecture

### 1. `users` Collection
**Purpose**: Store user profile information
**Document Structure**:
```typescript
{
  // Basic Identity
  uid: string, // Firebase Auth UID
  email: string,
  displayName: string,
  photoURL?: string,
  
  // Personal Info
  fullName: string,
  birthDate: string, // ISO format
  birthTime: string, // HH:MM format
  birthCity: string,
  birthPlace: string,
  birthCountry?: string,
  latitude?: number,
  longitude?: number,
  timezone?: string,
  
  // Preferences
  language: "id" | "en",
  
  // App State
  setupCompleted: boolean,
  onboardingCompleted: boolean,
  profile: {
    language: string,
    onboardingCompleted: boolean,
    blueprintInput: {
      birthDate: string,
      birthTime: string,
      birthCity: string,
    }
  },
  
  // Plan/Billing
  plan: "free" | "pro" | "developer",
  isDeveloper: boolean,
  trialStartedAt?: string, // Timestamp
  trialEndsAt?: string, // Timestamp
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastActiveAt?: Timestamp
}
```

### 2. `blueprints` Collection
**Purpose**: Store user's personalized blueprint data
**Document Structure**:
```typescript
{
  uid: string, // Reference to user
  status: "pending" | "ready" | "error",
  humanDesign: {
    type: string | null,
    profile: string | null,
    authority: string | null,
    strategy: string | null,
    notSelfTheme: string | null,
    signature: string | null,
    definedCenters: string[],
    openCenters: string[],
    gatesPersonality: string[],
    gatesDesign: string[],
    status: "pending" | "ready" | "error",
    source: string,
    note?: string
  },
  numerology: {
    number: number,
    role: string,
    purpose: string,
    challenges: string[],
    lessons: string[]
  },
  astrology: {
    sunSign: string,
    moonSign: string,
    risingSign: string,
    natalChart: any // Detailed chart data
  },
  destinyMatrix: {
    center: number,
    centerName: string,
    influence: string[],
    connections: any[]
  },
  lifePath: {
    number: number,
    role: string,
    traits: string[],
    challenges: string[]
  },
  dailyReflection: {
    content: string,
    energy: string,
    focus: string
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3. `journalEntries` Collection
**Purpose**: Store user's journal entries
**Document Structure**:
```typescript
{
  id: string, // Auto-generated
  uid: string, // Reference to user
  date: string, // YYYY-MM-DD
  theme: JournalTheme,
  questions: string[],
  journalText: string,
  emotionalState: string,
  bodySignals: string[],
  insight: string,
  tomorrowFocus: string,
  sourceContext?: {
    lifePathNumber?: number,
    humanDesignType?: string,
    arcanaCenter?: number,
    sunSign?: string,
    previousEntryCount: number
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 4. `meditationEntries` Collection
**Purpose**: Store user's meditation practice entries
**Document Structure**:
```typescript
{
  id: string, // Auto-generated
  uid: string, // Reference to user
  date: string, // YYYY-MM-DD
  theme: MeditationTheme,
  practices: string[],
  emotionalState: string,
  bodySignals: string[],
  bodyReflection: string,
  insight: string,
  nextFocus: string,
  mudraName?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 5. `audioHealingEntries` Collection
**Purpose**: Store user's audio healing session entries
**Document Structure**:
```typescript
{
  id: string, // Auto-generated
  uid: string, // Reference to user
  date: string, // YYYY-MM-DD
  playlistUrl: string,
  emotionalState: string,
  bodySignals: string[],
  reflectionText: string,
  insight: string,
  nextFocus: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 6. `healingMemory` Collection
**Purpose**: Store derived healing memory patterns
**Document Structure**:
```typescript
{
  uid: string, // Reference to user
  dominantThemes: Array<{ theme: string; count: number }>,
  recurringPatterns: string[],
  recurringEmotions: Array<{ emotion: string; count: number }>,
  recurringBodySignals: Array<{ signal: string; count: number }>,
  growthIndicators: string[],
  healingStage: "Awareness" | "Acceptance" | "Release" | "Integration" | "Service",
  healingStageExplanation: string,
  recommendedFocus: string,
  lastUpdated: string, // ISO timestamp
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 7. `journeyData` Collection
**Purpose**: Store user's healing journey progression
**Document Structure**:
```typescript
{
  uid: string, // Reference to user
  currentStage: {
    stage: "Awareness" | "Acceptance" | "Release" | "Rebuilding" | "Integration" | "Alignment",
    label: string,
    reason: string
  },
  dominantThemes: Array<{
    theme: string,
    frequency: number,
    reason: string
  }>,
  progressSummary: {
    journalEntries: number,
    meditationSessions: number,
    audioHealingSessions: number,
    currentStreak: number
  },
  timeline: Array<{
    date: string,
    dominantTheme: string,
    activityType: "Journal" | "Meditasi" | "Audio Healing"
  }>,
  weeklyFocus: {
    theme: string,
    why: string
  },
  recommendedNextStep: {
    journal: string,
    meditation: string,
    audioHealing: string
  },
  updatedAt: string, // ISO timestamp
  createdAt: Timestamp,
  source: string
}
```

### 8. `weeklyReports` Collection
**Purpose**: Store weekly soul reports
**Document Structure**:
```typescript
{
  id: string, // YYYY-MM-DD_week (e.g., "2024-01-01_week")
  uid: string, // Reference to user
  weekStart: string, // YYYY-MM-DD
  weekEnd: string, // YYYY-MM-DD
  totalJournal: number,
  totalMeditation: number,
  totalAudioHealing: number,
  dominantTheme: string,
  emotionalPattern: string,
  bodyPattern: string,
  growthSummary: string,
  blueprintReflection: string,
  recommendedFocusNextWeek: string,
  recommendedJournalPrompt: string,
  recommendedMeditation: string,
  recommendedAudioHealing: string,
  closingMessage: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 9. `notifications` Collection
**Purpose**: Store user notification preferences and history
**Document Structure**:
```typescript
{
  uid: string, // Reference to user
  preferences: {
    dailyReminders: boolean,
    weeklyReports: boolean,
    healingSuggestions: boolean,
    marketing: boolean
  },
  lastNotificationSent?: string, // ISO timestamp
  notificationHistory: Array<{
    type: string,
    message: string,
    sentAt: string,
    read: boolean
  }>,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Blueprints collection - users can only access their own data
    match /blueprints/{blueprintId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.uid == resource.data.uid;
    }
    
    // Activity collections - users can only access their own data
    match /journalEntries/{entryId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.uid == resource.data.uid;
    }
    
    match /meditationEntries/{entryId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.uid == resource.data.uid;
    }
    
    match /audioHealingEntries/{entryId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.uid == resource.data.uid;
    }
    
    // Analytics collections - users can only access their own data
    match /healingMemory/{memoryId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.uid == resource.data.uid;
    }
    
    match /journeyData/{journeyId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.uid == resource.data.uid;
    }
    
    match /weeklyReports/{reportId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.uid == resource.data.uid;
    }
    
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.uid == resource.data.uid;
    }
  }
}
```

## Indexes Required
```yaml
indexes:
  # Journal entries by user and date
  - collectionGroup: journalEntries
    queryScope: COLLECTION
    fields:
      - fieldPath: uid
        order: ASCENDING
      - fieldPath: date
        order: DESCENDING

  # Meditation entries by user and date  
  - collectionGroup: meditationEntries
    queryScope: COLLECTION
    fields:
      - fieldPath: uid
        order: ASCENDING
      - fieldPath: date
        order: DESCENDING

  # Audio healing entries by user and date
  - collectionGroup: audioHealingEntries
    queryScope: COLLECTION
    fields:
      - fieldPath: uid
        order: ASCENDING
      - fieldPath: date
        order: DESCENDING

  # Weekly reports by user and date
  - collectionGroup: weeklyReports
    queryScope: COLLECTION
    fields:
      - fieldPath: uid
        order: ASCENDING
      - fieldPath: weekStart
        order: DESCENDING
```

## Migration Strategy
1. Maintain backward compatibility during transition
2. Implement dual-read capability (localStorage → Firebase fallback)
3. Gradually migrate data from localStorage to Firebase
4. Preserve all existing functionality and user experience
5. Ensure seamless transition without data loss

This architecture maintains the exact same data structures and functionality while providing cloud persistence for real users and Play Store deployment.