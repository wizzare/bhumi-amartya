export interface DailyCheckIn {
  mood: string; // e.g., "Anxious", "Calm", "Tired", "Energetic"
  sleep: number; // hours
  energy: number; // 1-10
}

export interface JourneyLogs {
  meditation: boolean;
  journaling: boolean;
  audioHealing: boolean;
  yoga: boolean;
  workout: boolean;
  healthyFood: boolean;
}

export interface JourneyInput {
  dailyCheckIn: DailyCheckIn;
  logs: JourneyLogs;
}

export interface JourneyIntelligence {
  growthSignal: string;
  momentumSignal: string;
  stuckSignal: string;
  patternSignal: string;
  blindSpotSignal: string;
  nextSmallStep: string;
}
