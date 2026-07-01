export type GreetingLanguage = "id" | "en";
export type TimeWindow = "night" | "morning" | "afternoon" | "evening";
export const APP_TIME_REFRESH_MS = 30_000;

export function getTimeWindow(date: Date = new Date()): TimeWindow {
  const hour = date.getHours();
  if (hour >= 5 && hour <= 10) return "morning";
  if (hour >= 11 && hour <= 14) return "afternoon";
  if (hour >= 15 && hour <= 17) return "evening";
  return "night";
}

export function getEnvironmentWindowKey(date: Date = new Date(), localDateKey?: string): string {
  const dateStr = localDateKey || date.toISOString().slice(0, 10);
  const window = getTimeWindow(date);
  return `${dateStr}-${window}`;
}

export function getTimeOfDayGreeting(date: Date = new Date(), language: GreetingLanguage = "id"): string {
  const window = getTimeWindow(date);

  if (language === "en") {
    if (window === "morning") return "Good morning";
    if (window === "afternoon") return "Good afternoon";
    if (window === "evening") return "Good evening";
    return "Good night";
  }

  if (window === "morning") return "Selamat pagi";
  if (window === "afternoon") return "Selamat siang";
  if (window === "evening") return "Selamat sore";
  return "Selamat malam";
}

export function getTimeAwareGreeting(
  firstName: string,
  dayName: string,
  date: Date = new Date(),
  language: GreetingLanguage = "id"
): string {
  const window = getTimeWindow(date);

  if (language === "en") {
    if (window === "morning") return `Hello ${firstName}, good morning and happy ${dayName}.`;
    if (window === "afternoon") return `Hello ${firstName}, good afternoon. Hope your ${dayName} is going smoothly.`;
    if (window === "evening") return `Hello ${firstName}, good evening. How is your ${dayName} going so far?`;
    return `Hello ${firstName}, good night. How was your ${dayName} today?`;
  }

  if (window === "morning") return `Hai ${firstName}, selamat pagi dan selamat hari ${dayName}.`;
  if (window === "afternoon") return `Hai ${firstName}, selamat siang. Semoga hari ${dayName}mu berjalan dengan cukup lapang.`;
  if (window === "evening") return `Hai ${firstName}, selamat sore. Bagaimana hari ${dayName}mu sejauh ini?`;
  return `Hai ${firstName}, selamat malam. Bagaimana hari ${dayName}mu hari ini?`;
}

export function getTimeAwareClosing(
  date: Date = new Date(),
  language: GreetingLanguage = "id"
): string {
  const window = getTimeWindow(date);

  if (language === "en") {
    if (window === "morning") return "Take it slow. Start with one small step you can do this morning.";
    if (window === "afternoon") return "Pace yourself. Not everything needs to be finished all at once today.";
    if (window === "evening") return "Pause for a moment. Let your body process today's journey.";
    return "Pause for a moment before the night grows deep. What can you release from today?";
  }

  if (window === "morning") return "Pelan-pelan saja. Mulai dari satu langkah kecil yang paling mungkin kamu lakukan pagi ini.";
  if (window === "afternoon") return "Jaga ritmemu. Tidak semua hal perlu selesai sekaligus hari ini.";
  if (window === "evening") return "Ambil jeda sejenak. Biarkan tubuhmu ikut mencerna perjalanan hari ini.";
  return "Ambil jeda sejenak sebelum malam benar-benar larut. Apa yang bisa kamu lepaskan dari hari ini?";
}

export function applyDynamicGreetingPrefix(
  text: string | null | undefined,
  language: GreetingLanguage = "id",
  date: Date = new Date(),
): string {
  if (!text) return "";

  const greeting = getTimeOfDayGreeting(date, language);
  return text.replace(
    /^(\s*["']?\s*)(Selamat\s+(?:pagi|siang|sore|malam)|Good\s+(?:morning|afternoon|evening|night))(\s+[^,\n.!?]+)?([,!.]?)/i,
    (_match, prefix: string, _oldGreeting: string, name: string = "", punctuation: string = "") =>
      `${prefix}${greeting}${name}${punctuation}`,
  );
}
