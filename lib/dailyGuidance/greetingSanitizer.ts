// BHUMI V4 — Living Companion Cleanup
// Defensive helper: strip greetings and weekday references from user-facing strings
// so that the page header (which already shows greeting/date/day) is the ONLY greeting.

const GREETING_PATTERNS: RegExp[] = [
  // Indonesian time-of-day greetings
  /\bSelamat\s+(pagi|siang|sore|malam|dini\s+hari)\b[\.,!]*/gi,
  // English time-of-day greetings
  /\b(Good\s+morning|Good\s+afternoon|Good\s+evening|Good\s+night)\b[\.,!]*/gi,
  // "Selamat hari <weekday>" patterns
  /\bSelamat\s+hari\s+(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b[\.,!]*/gi,
  // "Hari <weekday>" prefix that just states the day redundantly
  /^\s*(Hari\s+(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu))\b[\s,.:!?]*/gi,
  /^\s*((Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu))\b[\s,.:!?]+/gi,
  // "Hi <name>" or "Hai <name>" prefix that repeats greeting
  /^\s*(Hi|Hai|Halo|Hey)\s+[^,.!?]{1,40}[,.]?\s*/gi,
  // Trailing standalone greeting at the end of a paragraph
  /\s*\b(Selamat\s+(pagi|siang|sore|malam|dini\s+hari))\b[\.,!]*\s*$/gi,
];

// Detect if a string contains ANY greeting to allow callers to decide fallback behavior
const ANY_GREETING_PATTERN = /\b(Selamat\s+(pagi|siang|sore|malam|dini\s+hari|hari)|Good\s+(morning|afternoon|evening|night))\b/i;

export function containsGreeting(text: string | null | undefined): boolean {
  if (!text) return false;
  return ANY_GREETING_PATTERN.test(text);
}

/**
 * Removes redundant greeting/weekday prefixes and suffixes from a string.
 * Idempotent — safe to call multiple times.
 */
export function stripGreeting(text: string | null | undefined): string {
  if (!text) return "";
  let result = text;

  for (const pattern of GREETING_PATTERNS) {
    result = result.replace(pattern, " ");
  }

  // Collapse whitespace and stray punctuation left after removal
  result = result
    .replace(/\s+/g, " ")
    .replace(/^\s*[\.,!?:;]+\s*/g, "")
    .replace(/\s*[\.,!?:;]+$/g, "")
    .trim();

  // Ensure sentence ending
  if (result && !/[.!?]$/.test(result)) {
    result = `${result}.`;
  }

  return result;
}

/**
 * Multi-paragraph variant: applies stripGreeting to each paragraph.
 */
export function stripGreetingMultiline(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .split(/\n\n+/)
    .map((paragraph) => stripGreeting(paragraph))
    .filter(Boolean)
    .join("\n\n");
}
