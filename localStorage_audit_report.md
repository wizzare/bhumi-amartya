# Bhumi App localStorage Audit Report

## Overview
This report documents all localStorage keys currently used in the Bhumi app, their purposes, and usage patterns.

## localStorage Keys Identified

### 1. `bhumiUserProfile`
- **File**: `app/setup/page.tsx`, `lib/auth/getLocalUserSession.ts`, `components/dashboard/DashboardClient.tsx`
- **Page Owner**: Setup/Dashboard
- **Data Structure**: LocalUserProfile object containing user information
- **Usage Count**: Multiple (used for saving/loading user profile during setup and dashboard access)
- **Sample Structure**:
```typescript
{
  uid: string,
  fullName: string,
  displayName: string,
  email: string,
  birthDate: string,
  birthTime: string,
  birthCity: string,
  birthPlace: string,
  birthCountry: string | null,
  latitude: number | null,
  longitude: number | null,
  language: string,
  setupCompleted: boolean,
  authProvider: "google" | "local" | null,
  plan: UserPlan,
  createdAt: string,
  updatedAt: string
}
```

### 2. `bhumiUserBlueprint`
- **File**: `app/setup/page.tsx`, `components/dashboard/DashboardClient.tsx`, `lib/journey/createJourneyData.ts`, `lib/healing/createHealingInsights.ts`, `lib/ai/compileUserInnerwork.ts`, `lib/reports/createWeeklySoulReport.ts`
- **Page Owner**: Setup/Dashboard
- **Data Structure**: User's personalized blueprint data
- **Usage Count**: Multiple (used for storing and retrieving user's astrological/numerological blueprint)
- **Purpose**: Stores calculated life path, human design, sun sign, etc.

### 3. `bhumiJournalEntries`
- **File**: `lib/journal/localJournal.ts`, `components/dashboard/DashboardClient.tsx`, `lib/journey/createJourneyData.ts`, `lib/healing/createHealingInsights.ts`, `lib/ai/compileUserInnerwork.ts`, `lib/insights/createInsightProgress.ts`, `lib/reports/createWeeklySoulReport.ts`
- **Page Owner**: Journal
- **Data Structure**: Array of LocalJournalEntry objects
- **Usage Count**: High (core journal functionality)
- **Purpose**: Stores user's journal entries and reflections

### 4. `bhumiMeditationEntries`
- **File**: `lib/meditation/createDailyMeditationPractice.ts`, `components/dashboard/DashboardClient.tsx`, `lib/journey/createJourneyData.ts`, `lib/healing/createHealingInsights.ts`, `lib/ai/compileUserInnerwork.ts`, `lib/insights/createInsightProgress.ts`, `lib/reports/createWeeklySoulReport.ts`
- **Page Owner**: Meditation
- **Data Structure**: Array of MeditationEntry objects
- **Usage Count**: High (core meditation functionality)
- **Purpose**: Stores user's meditation practice entries

### 5. `bhumiAudioHealingEntries`
- **File**: `lib/audioHealing/localAudioHealing.ts`, `components/dashboard/DashboardClient.tsx`, `lib/journey/createJourneyData.ts`, `lib/healing/createHealingInsights.ts`, `lib/ai/compileUserInnerwork.ts`, `lib/insights/createInsightProgress.ts`, `lib/reports/createWeeklySoulReport.ts`
- **Page Owner**: Audio Healing
- **Data Structure**: Array of AudioHealingEntry objects
- **Usage Count**: High (core audio healing functionality)
- **Purpose**: Stores user's audio healing session entries

### 6. `bhumiHealingInsights`
- **File**: `lib/healing/createHealingInsights.ts`, `components/dashboard/DashboardClient.tsx`, `lib/ai/compileUserInnerwork.ts`, `lib/reports/createWeeklySoulReport.ts`
- **Page Owner**: Healing
- **Data Structure**: HealingInsightResult object
- **Usage Count**: Medium (derived from other data)
- **Purpose**: Stores analyzed healing insights based on user activities

### 7. `bhumiJourneyData`
- **File**: `lib/journey/createJourneyData.ts`, `components/dashboard/DashboardClient.tsx`, `lib/ai/compileUserInnerwork.ts`, `lib/reports/createWeeklySoulReport.ts`
- **Page Owner**: Journey
- **Data Structure**: JourneyData object
- **Usage Count**: Medium (derived from other data)
- **Purpose**: Stores user's healing journey progression and stages

### 8. `bhumiHealingMemory`
- **File**: `lib/healing/healingMemoryEngine.ts`, `components/dashboard/DashboardClient.tsx`
- **Page Owner**: Healing
- **Data Structure**: HealingMemoryOutput object
- **Usage Count**: Medium (derived from other data)
- **Purpose**: Stores healing memory patterns and growth indicators

### 9. `bhumiCompiledInnerwork`
- **File**: `lib/ai/compileUserInnerwork.ts`, `components/dashboard/DashboardClient.tsx`, `lib/reports/createWeeklySoulReport.ts`
- **Page Owner**: Dashboard/Insights
- **Data Structure**: CompiledInnerworkInsight object
- **Usage Count**: Medium (derived from other data)
- **Purpose**: Stores compiled insights from all innerwork activities

### 10. `bhumiProgressData`
- **File**: `lib/insights/createInsightProgress.ts`, `lib/reports/createWeeklySoulReport.ts`
- **Page Owner**: Insights
- **Data Structure**: ProgressData object
- **Usage Count**: Medium (derived from other data)
- **Purpose**: Stores user's progress metrics and milestones

### 11. `bhumiWeeklySoulReport`
- **File**: `lib/reports/createWeeklySoulReport.ts`
- **Page Owner**: Reports
- **Data Structure**: WeeklySoulReportOutput object
- **Usage Count**: Low-Medium (weekly reports)
- **Purpose**: Stores weekly compilation of user's innerwork

### 12. `bhumiUserPlan`
- **File**: `app/setup/page.tsx`, `lib/billing/getUserPlanStatus.ts`
- **Page Owner**: Billing
- **Data Structure**: UserPlan object
- **Usage Count**: Low (billing management)
- **Purpose**: Stores user's subscription plan status

### 13. Language Settings
- **Files**: Various components in `.next` build files
- **Keys**: `bhumiLanguage`, `bhumi-language`
- **Purpose**: Store user's language preference
- **Usage Count**: Multiple (UI localization)

## Summary
- **Total Unique Keys**: 13 core localStorage keys (excluding language settings which appear multiple times in builds)
- **Primary Usage Areas**: User profile, personalization data, activity tracking, derived insights
- **Data Categories**: 
  - User identity and profile (1 key)
  - Personalized blueprint (1 key) 
  - Activity logs (3 keys: journal, meditation, audio healing)
  - Derived analytics (6 keys: insights, journey, memory, progress, reports, etc.)
  - Business logic (1 key: user plan)
  - UI settings (1 key: language)

## Risk Assessment
High dependency on localStorage for core functionality. Migration to Firebase will require careful data synchronization and migration strategies.