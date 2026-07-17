import { CircadianContext, TimeWindow } from "@/lib/livingIntelligence/types";

const APP_TIME_REFRESH_MS = 30_000;

export function getTimeWindow(date: Date = new Date()): TimeWindow {
  const hour = date.getHours();
  if (hour >= 0 && hour <= 3) return "afterMidnight";
  if (hour >= 4 && hour <= 10) return "morning";
  if (hour >= 11 && hour <= 14) return "afternoon";
  if (hour >= 15 && hour <= 17) return "evening";
  return "night";
}

export function getLateNightPhase(date: Date = new Date()): "awakening" | "active" | "winding" | "resting" | "deepRest" {
  const hour = date.getHours();
  if (hour >= 0 && hour <= 3) return "deepRest";
  if (hour >= 4 && hour <= 6) return "awakening";
  if (hour >= 7 && hour <= 11) return "active";
  if (hour >= 12 && hour <= 17) return "active";
  if (hour >= 18 && hour <= 21) return "winding";
  return "resting";
}

export function getTimeOfDayGreeting(date: Date = new Date(), language: "id" | "en" = "id"): string {
  const window = getTimeWindow(date);

  if (language === "en") {
    if (window === "morning") return "Good morning";
    if (window === "afternoon") return "Good afternoon";
    if (window === "evening") return "Good evening";
    if (window === "afterMidnight") return "Still awake?";
    return "Good night";
  }

  if (window === "morning") return "Selamat pagi";
  if (window === "afternoon") return "Selamat siang";
  if (window === "evening") return "Selamat sore";
  if (window === "afterMidnight") return "Masih terjaga?";
  return "Selamat malam";
}

export function getTimeAwareClosing(
  date: Date = new Date(),
  language: "id" | "en" = "id"
): string {
  const window = getTimeWindow(date);

  if (language === "en") {
    if (window === "morning") return "Take it slow. Start with one small step you can do this morning.";
    if (window === "afternoon") return "Pace yourself. Not everything needs to be finished all at once today.";
    if (window === "evening") return "Pause for a moment. Let your body process today's journey.";
    if (window === "afterMidnight") return "The night is deep. Let your mind rest. Tomorrow will come in its own time.";
    return "Pause for a moment before the night grows deep. What can you release from today?";
  }

  if (window === "morning") return "Pelan-pelan saja. Mulai dari satu langkah kecil yang paling mungkin kamu lakukan pagi ini.";
  if (window === "afternoon") return "Jaga ritmemu. Tidak semua hal perlu selesai sekaligus hari ini.";
  if (window === "evening") return "Ambil jeda sejenak. Biarkan tubuhmu ikut mencerna perjalanan hari ini.";
  if (window === "afterMidnight") return "Malam sudah larut. Biarkan pikiranmu beristirahat. Esok akan tiba dengan waktunya sendiri.";
  return "Ambil jeda sejenak sebelum malam benar-benar larut. Apa yang bisa kamu lepaskan dari hari ini?";
}

export function getReflectionTone(window: TimeWindow): "motivating" | "grounding" | "calming" | "comforting" | "gentle" {
  switch (window) {
    case "morning": return "motivating";
    case "afternoon": return "grounding";
    case "evening": return "calming";
    case "afterMidnight": return "comforting";
    case "night": return "gentle";
  }
}

export function getReflectionLength(window: TimeWindow): "full" | "moderate" | "short" | "brief" {
  switch (window) {
    case "morning": return "full";
    case "afternoon": return "moderate";
    case "evening": return "short";
    case "night": return "short";
    case "afterMidnight": return "brief";
  }
}

export function getRecommendationPriority(window: TimeWindow): "energy" | "focus" | "balance" | "rest" | "recovery" {
  switch (window) {
    case "morning": return "energy";
    case "afternoon": return "focus";
    case "evening": return "balance";
    case "night": return "rest";
    case "afterMidnight": return "recovery";
  }
}

export function buildCircadianContext(
  date: Date = new Date(),
  language: "id" | "en" = "id"
): CircadianContext {
  const timeWindow = getTimeWindow(date);
  const hour = date.getHours();
  const greeting = getTimeOfDayGreeting(date, language);
  const closing = getTimeAwareClosing(date, language);
  const isAfterMidnight = timeWindow === "afterMidnight";
  const lateNightPhase = getLateNightPhase(date);

  return {
    timeWindow,
    hour,
    greeting,
    closing,
    isAfterMidnight,
    isLateNightPhase: lateNightPhase,
  };
}

export function createCircadianInterval(
  callback: (context: CircadianContext) => void,
  language: "id" | "en" = "id"
): () => void {
  const interval = window.setInterval(() => {
    const context = buildCircadianContext(new Date(), language);
    callback(context);
  }, APP_TIME_REFRESH_MS);

  return () => window.clearInterval(interval);
}