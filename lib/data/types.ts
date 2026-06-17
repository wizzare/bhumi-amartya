/**
 * BHUMI AMARTYA - Dashboard Data Types
 * Type-safe interfaces for all dashboard data structures
 * Designed for emotionally intelligent spiritual guidance
 */

// ============= USER IDENTITY =============

export interface UserProfile {
  uid: string;
  name: string;
  fullName?: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthPlace: string;
  birthPlaceLatitude?: number;
  birthPlaceLongitude?: number;
  timezone: string;
  language: "id" | "en";
  createdAt: string;
  lastActive: string;
  email?: string;

  // Guardian Identity V3
  guardianRole?: "founder" | "admin" | "user";
  guardianBadge?: "core_guardian" | "guardian";
  recognitionTier?: "FOUNDER" | "CORE_GUARDIAN" | "CORE_GUARDIAN_CANDIDATE" | "GUARDIAN";
  recognitionDate?: string;
  membershipType?: "FREE" | "TRIAL" | "PREMIUM" | "LIFETIME";
  membershipExpiresAt?: string;
  isFoundingMember?: boolean;

  // Participation Metrics for Core Guardian Validation
  participationMetrics?: {
    loginCount: number;
    lastSeen: string;
    lastCheckInAt?: string;
    lastAssessmentAt?: string;
    buildNumber?: string;
    appVersion?: string;
    platform?: string;
    hasCompletedCheckIn: boolean;
    hasCompletedAssessment: boolean;
    activeDays: string[]; // List of unique YYYY-MM-DD strings
  };
}

export interface CoreIdentity {
  name: string; // User's name from profile
  lifePath: number; // 1-9
  lifePathArchetype: string; // e.g., "The Pioneer", "The Communicator"
  arcanaCenter: number; // Major Arcana 0-21
  arcanaMeaning: string;
  sunSign: string; // Zodiac sign
  moonSign?: string;
  risingSign?: string;
  humanDesign: string; // e.g., "Manifesting Generator"
  humanDesignProfile: string;
  enneagramType?: number;
  enneagramWing?: string;
}

// ============= WELLNESS V3 =============

export type WellnessNeed =
  | 'REST'
  | 'CLARITY'
  | 'CONNECTION'
  | 'MOVEMENT'
  | 'PEACE'
  | 'COURAGE'
  | 'FOCUS'
  | 'HEALING';

export interface WellnessSnapshot {
  metrics: {
    sleep: number; // 1-10
    energy: number; // 1-10
    emotion: number; // 1-10
    focus: number; // 1-10
  };
  needs: WellnessNeed[];
  checkInCompleted: boolean;
  updatedAt: string; // ISO timestamp
}

// ============= AI REFLECTION =============

export interface AIReflection {
  dailyMessage: string; // Main reflection (multi-line, poetic)
  theme: string; // Today's emotional theme
  affirmation: string; // Personalized affirmation
  warningSign?: string; // Potential shadow to watch
  guidance: string; // Specific guidance for today
  emotionalTone: "gentle" | "empowering" | "grounding" | "introspective" | "celebratory";
}

// ============= ASTROLOGY ENERGY =============

export interface AstroEnergyDay {
  currentEnergy: string; // e.g., "Mercury Pre-Retrograde"
  description: string; // Emotional impact
  emoji: string;
  intensity: "low" | "medium" | "high"; // Energy intensity
  recommendation: string; // How to work with this energy
  affectedAreas: string[]; // e.g., ["communication", "relationships", "creativity"]
  daysUntilEvent?: number;
  retrogradeStatus?: {
    planet: string;
    startDate: string;
    endDate: string;
    impact: string;
  };
}

// ============= SHADOW INSIGHT =============

export interface ShadowInsight {
  innerChild: {
    wound: string; // Core wound
    fear: string; // Primary fear
    needsHealing: string; // What needs addressing
  };
  repeatingPattern: {
    pattern: string; // Behavioral pattern
    originStory: string; // Where it comes from
    impactArea: string; // How it shows up
  };
  shadow: {
    projection: string; // What we project outward
    integration: string; // How to integrate it
    gift: string; // The hidden gift within
  };
  moneyBlock: {
    block: string; // Core money belief
    fear: string; // Underlying fear
    healingPath: string; // Path forward
  };
  loveBlock: {
    block: string; // Core love belief
    fear: string; // Underlying fear
    healingPath: string; // Path forward
  };
}

// ============= DAILY INNERWORK =============

export interface InnerworkTask {
  id: string;
  task: string; // What to do
  duration: number; // Minutes
  category: "journaling" | "grounding" | "meditation" | "reflection" | "action" | "movement" | "breathwork";
  emoji: string;
  purpose: string; // Why this task today
  instruction: string; // How to do it
  completed: boolean;
}

export interface DailyInnerwork {
  tasks: InnerworkTask[];
  theme: string; // Today's innerwork theme
  focusArea: string; // What we're focusing on
  totalDuration: number; // Total minutes
  difficulty: "beginner" | "intermediate" | "advanced";
}

// ============= JOURNALING =============

export interface JournalingPrompt {
  prompt: string; // Main question
  subPrompts: string[]; // Follow-up questions
  theme: string; // Topic category
  emotionalDepth: "surface" | "medium" | "deep";
  purpose: string; // Why this prompt today
  relatedArea: string; // Life area being explored
}

// ============= MEDITATION =============

export interface MeditationRecommendation {
  title: string; // Meditation name
  duration: number; // Minutes
  type: string; // grounding, chakra, manifestation, etc.
  focusArea: string; // What we're working on
  description: string; // What to expect
  technique: string; // Breathing/technique to use
  energyEffect: string; // How it will make you feel
  spotifyPlaylistId?: string; // For future Spotify integration
}

// ============= HEALING AUDIO =============

export interface HealingAudioRecommendation {
  title: string; // Audio session name
  frequency?: string; // Hz frequency (e.g., 432Hz)
  duration: number; // Minutes
  purpose: string; // What it heals/supports
  affinity: string; // What chakra/system it supports
  vibe: string; // Feeling: calming, energizing, balancing, etc.
  artistOrSource: string; // Creator
  spotifyLink?: string;
}

// ============= SOUL PROGRESS =============

export interface SoulProgress {
  healingStreak: number; // Days of consistent practice
  consciousnessLevel: number; // 0-100 percentage
  totalJournalEntries: number;
  totalMeditationMinutes: number;
  totalInnerworkSessions: number;
  currentPhase: string; // Healing phase name
  nextMilestone: string; // What's next
  progressPercentage: number; // Progress to next milestone
}

// ============= AI REMINDER =============

export interface ReminderState {
  groundingDone: boolean;
  journalingDone: boolean;
  meditationDone: boolean;
  moodLevel: number; // 1-10
  needsSupport: boolean;
  reminderMessage?: string; // Gentle nudge if needed
  reminderCategory?: "grounding" | "journaling" | "meditation" | "selfcare" | "check-in";
}

// ============= COMPLETE DASHBOARD DATA =============

export interface DashboardData {
  user: UserProfile;
  identity: CoreIdentity;
  blueprintSummary?: string;
  aiReflection: AIReflection;
  astroEnergy: AstroEnergyDay;
  shadowInsight: string; // Shadow insight message
  dailyInnerwork: DailyInnerwork;
  journalingPrompt: JournalingPrompt;
  meditation: MeditationRecommendation;
  healingRecommendation?: HealingRecommendation;
  healingAudio: HealingAudioRecommendation;
  soulProgress: SoulProgress;
  reminderState: ReminderState;
  generatedAt: string; // ISO timestamp when data was generated
  validUntil: string; // When to refresh
}

// ============= JOURNALING SYSTEM =============

export interface EmotionalCheckIn {
  moodLevel: number; // 1-10 scale
  energyLevel: number; // 1-10 scale (physical)
  nervousSystemState: "dysregulated" | "activated" | "calm" | "grounded" | "floaty";
  bodyLocation: string; // Where do you feel it?
  emotionalWord: string; // In one word...
}

export interface JournalPrompt {
  id: string;
  prompt: string; // The main question
  subPrompts?: string[]; // Follow-up reflection questions
  theme: string; // e.g., "self-worth", "boundaries", "grief", "joy"
  emotionalDepth: "surface" | "medium" | "deep";
  purpose: string; // Why this prompt today
  relatedArea: string; // Life area: relationships, career, health, creativity, spirituality
  generatedBasedOn: {
    lifePathInsight?: string;
    arcanaInsight?: string;
    humanDesignInsight?: string;
    emotionalPattern?: string;
  };
}

export interface JournalEntry {
  id: string;
  userId: string;
  dateCreated: string; // ISO timestamp
  dateCompleted: string; // ISO timestamp (when submitted)
  prompt: JournalPrompt;
  emotionalCheckIn: EmotionalCheckIn;
  content: string; // The actual journal text
  wordCount: number;
  durationMinutes: number; // How long they journaled
  
  // Analysis (filled after submission)
  emotionalAnalysis?: EmotionalAnalysis;
  
  // Metadata
  tags: string[]; // User-added tags
  linkedToTherapyWork?: string; // Optional reference to therapy topic
  privateNotes?: string; // User's own internal notes
}

export interface EmotionalAnalysis {
  emotionalTone: "grief" | "anger" | "fear" | "joy" | "confusion" | "resignation" | "hope" | "ambivalence" | "grounding" | "introspective" | "celebratory" | "gentle";
  primaryEmotion: string; // e.g., "loneliness", "overwhelm", "validation-seeking"
  secondaryEmotions?: string[];
  nervousSystemDetection: "dysregulated" | "activated" | "calm" | "grounded" | "floaty";
  
  // Pattern detection
  recurringThemes: string[]; // What keeps showing up
  recurringWounds: string[]; // Core wounds expressed
  selfTalkPatterns: {
    pattern: string;
    tone: "critical" | "compassionate" | "confused" | "resigned";
    frequency: "new" | "occasional" | "recurring";
  }[];
  
  // State detection
  emotionalExhaustion: "low" | "moderate" | "high" | "critical";
  avoidancePatterns?: string[];
  
  // Insights
  gentleInsight: string; // Compassionate observation
  healingDirection: string; // Where the soul wants to go
  suggestedNextInnerwork: string; // What would help
  groundingNeed: "breathing" | "body-connection" | "nature" | "movement" | "rest" | "witnessing";
}

export interface HealingActionRecord {
  id: string;
  title: string;
  type: "meditation" | "innerwork" | "grounding" | "mudra" | "creative" | "somatic" | "shadow" | "ancestor";
  effect: string;
  intensityShift: "gentle" | "steady" | "deep";
  completedAt: string;
}

export interface EmotionalMemory {
  userId: string;
  timeframe: "weekly" | "monthly" | "quarterly";
  
  // Patterns
  emotionalTrends: {
    emotion: string;
    frequency: number;
    trend: "increasing" | "decreasing" | "stable";
  }[];
  
  recurringThemes: {
    theme: string;
    count: number;
    firstAppeared: string;
    lastAppeared: string;
  }[];
  
  recurringWounds: {
    wound: string;
    intensity: "light" | "moderate" | "deep";
    healingProgress: "no-progress" | "some-progress" | "significant-progress";
  }[];
  
  // Cycles
  emotionalCycles: {
    cycle: string; // e.g., "weekly grief cycle", "monthly anxiety peak"
    pattern: string;
    triggerFactors?: string[];
  }[];
  
  // Healing progress
  healingMilestones: {
    date: string;
    milestone: string;
    journalReference: string; // Link to relevant journal entry
  }[];
  
  // Healing actions
  healingActions: HealingActionRecord[];
  chakraBalance?: {
    chakra: string;
    status: "blocked" | "balanced" | "open";
    guidance: string;
  }[];
  
  // Recommendations for next stage
  suggestedFocus: string;
  abandonedPatterns: string[]; // Things they've worked through
  nextHealingEdge: string; // What's emerging to work with
}

export interface HealingProgressSummary {
  currentPhase: string;
  nextIntensity: string;
  chakraFocus: {
    chakra: string;
    status: string;
    guidance: string;
  }[];
  supportiveMessage: string;
  topThemes: string[];
  topWounds: string[];
}

export interface HealingRecommendation {
  id: string;
  type: "innerwork" | "meditation" | "movement" | "creative" | "relational" | "somatic" | "cognitive" | "spiritual" | "reflection";
  title: string;
  description: string;
  duration: number; // minutes
  
  // Why this recommendation
  basedOnEmotionalAnalysis: string;
  addressesWound: string;
  supportedBy: string; // e.g., "nervous system science", "emotional pattern", "soul guidance"
  
  // How to do it
  instructions: string[];
  tips: string[];
  
  // Timing
  bestTiming: "immediately" | "today" | "this-week" | "ongoing";
  frequency: string; // e.g., "once daily", "3x weekly"
  
  // Integration
  integratesWithPractice: string[]; // Links to other practices
  supportiveReminder: string; // Gentle encouragement
}

// ============= AI GENERATION CONFIG =============

export interface AIGenerationContext {
  userProfile: UserProfile;
  coreIdentity: CoreIdentity;
  currentMood: number;
  recentJournalThemes?: string[];
  astroContext?: AstroEnergyDay;
  lifeAreaFocus?: string;
  seasonOfLife?: string; // awakening, integration, grounding, etc.
}
