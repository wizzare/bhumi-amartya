/**
 * Sentence case normalizer for Indonesian guidance text in Bhumi Amartya.
 *
 * Rules:
 * 1. Operates per sentence (separated by punctuation or newlines).
 * 2. Capitalizes the first character of each sentence.
 * 3. Converts remaining words to lowercase UNLESS protected.
 * 4. Preserves protected proper nouns and official system terms:
 *    "Bhumi Amartya", "Bhumi", "Widhi Wedhaswara", "Tuhan", "DIA", "Human Design",
 *    "Destiny Matrix", "Life Path", "Natal Chart", "Daily Guidance", "Arsip Akashi",
 *    "Journey", "Wellness", "BaZi", "Zi Wei", "Vedic", "Weton", "Tzolkin", "Aura", etc.
 * 5. Preserves days of the week & months in Indonesian/English.
 * 6. Preserves official abbreviations (CTA, UI, UX, ID, API, JSON, URL, etc.).
 * 7. Does NOT alter text that is intentionally ALL CAPS (e.g. "CTA: SHARE, SAVE, DAN FOLLOW").
 * 8. Safe for empty, null, or undefined input.
 */

const PROTECTED_PHRASES = [
  "Bhumi Amartya",
  "Widhi Wedhaswara",
  "Human Design",
  "Destiny Matrix",
  "Life Path",
  "Natal Chart",
  "Daily Guidance",
  "Arsip Akashi",
  "Zi Wei",
];

const PROTECTED_WORDS = new Set([
  "Bhumi",
  "Amartya",
  "Widhi",
  "Wedhaswara",
  "Tuhan",
  "DIA",
  "Dia",
  "Journey",
  "Wellness",
  "BaZi",
  "Vedic",
  "Weton",
  "Tzolkin",
  "Aura",
  "Innerwork",
  "Astrocartography",
  // Days
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  // Months
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
  // Abbreviations
  "CTA",
  "UI",
  "UX",
  "ID",
  "API",
  "JSON",
  "URL",
  "HTTP",
  "HTTPS",
  "PWA",
  "APK",
  "AAB",
  "QA",
]);

function isAllCaps(text: string): boolean {
  const letters = text.replace(/[^A-Za-z]/g, "");
  return letters.length > 3 && letters === letters.toUpperCase();
}

export function normalizeIndonesianSentenceCase(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";

  const trimmed = text.trim();
  if (!trimmed) return "";

  // If text is intentionally ALL CAPS, do not alter
  if (isAllCaps(trimmed)) {
    return trimmed;
  }

  // Replace placeholder tokens for protected phrases before sentence splitting
  const replacements: { placeholder: string; original: string }[] = [];
  let tokenized = trimmed;

  PROTECTED_PHRASES.forEach((phrase, idx) => {
    const placeholder = `__PROT_PHRASE_${idx}__`;
    const regex = new RegExp(phrase.replace(/[-[\]{}()*+?.:=\^$|#\s]/g, "\\$&"), "gi");
    if (regex.test(tokenized)) {
      replacements.push({ placeholder, original: phrase });
      tokenized = tokenized.replace(regex, placeholder);
    }
  });

  // Split into sentences while keeping punctuation / line breaks
  const sentenceRegex = /([^.!?\n]+[.!?\n]*)/g;
  const matches = tokenized.match(sentenceRegex) || [tokenized];

  const processedSentences = matches.map((sentence) => {
    const leadingSpaceMatch = sentence.match(/^(\s*)/);
    const leadingSpace = leadingSpaceMatch ? leadingSpaceMatch[0] : "";
    const core = sentence.slice(leadingSpace.length);

    if (!core.trim()) return sentence;

    // Split words inside sentence
    const words = core.split(/(\s+)/);
    let isFirstWord = true;

    const processedWords = words.map((token) => {
      if (/^\s+$/.test(token) || !token) return token;

      // Check if token contains a placeholder
      if (token.includes("__PROT_PHRASE_")) {
        isFirstWord = false;
        return token;
      }

      // Clean punctuation attached to word for check
      const cleanWord = token.replace(/^[^\w]+|[^\w]+$/g, "");
      if (!cleanWord) return token;

      const isProtected = PROTECTED_WORDS.has(cleanWord) ||
        Array.from(PROTECTED_WORDS).some((pw) => pw.toLowerCase() === cleanWord.toLowerCase());

      if (isFirstWord) {
        isFirstWord = false;
        if (isProtected) {
          const match = Array.from(PROTECTED_WORDS).find((pw) => pw.toLowerCase() === cleanWord.toLowerCase());
          const target = match || cleanWord;
          return token.replace(cleanWord, target.charAt(0).toUpperCase() + target.slice(1));
        }
        return token.replace(cleanWord, cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase());
      }

      // Non-first word inside sentence
      if (isProtected) {
        const match = Array.from(PROTECTED_WORDS).find((pw) => pw.toLowerCase() === cleanWord.toLowerCase());
        const target = match || cleanWord;
        return token.replace(cleanWord, target);
      }

      // Default non-first word: convert to lowercase
      return token.replace(cleanWord, cleanWord.toLowerCase());
    });

    return leadingSpace + processedWords.join("");
  });

  let result = processedSentences.join("");

  // Restore protected phrases
  replacements.forEach(({ placeholder, original }) => {
    result = result.replace(new RegExp(placeholder, "g"), original);
  });

  return result;
}
