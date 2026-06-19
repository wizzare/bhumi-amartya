export type GreetingLanguage = "id" | "en";

export function getTimeOfDayGreeting(date: Date = new Date(), language: GreetingLanguage = "id"): string {
  const hour = date.getHours();

  if (language === "en") {
    if (hour >= 4 && hour <= 10) return "Good morning";
    if (hour >= 11 && hour <= 14) return "Good afternoon";
    if (hour >= 15 && hour <= 17) return "Good evening";
    return "Good night";
  }

  if (hour >= 4 && hour <= 10) return "Selamat pagi";
  if (hour >= 11 && hour <= 14) return "Selamat siang";
  if (hour >= 15 && hour <= 17) return "Selamat sore";
  return "Selamat malam";
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
