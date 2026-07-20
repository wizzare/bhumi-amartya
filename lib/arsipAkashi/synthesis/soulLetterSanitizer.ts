import { sanitizeUserNarrative } from "@/lib/narrative/presentationSafety";

const FORBIDDEN_SYSTEM_NAMES = [
  "human design", "bazi", "zi wei", "whole sign", "natal chart",
  "destiny matrix", "tzolkin", "astrocartography", "weton",
  "vedic astrology", "vedic", "numerology", "life path",
];

const FORBIDDEN_PATTERNS = [
  /[a-z][a-z]*[A-Z][a-z]*/,
  /[a-z]+_[a-z]+/,
  /\/[a-z]+\/[a-z]+\//,
  /sourceVersion|factId|blueprintFingerprint|calculationFingerprint|interpretationEligibility/,
  /(?:^|[.!?]\s+)(?:berdasarkan data di atas|sistem mendeteksi|input menunjukkan|model menyimpulkan|hasil kalkulasi|berdasarkan sistem|menurut algoritma|data mengindikasikan|sebagai AI|berikut adalah|kesimpulannya adalah)/i,
  /\{.*\}|\[.*\]/,
  /systemId|available|partial|birth-time-required|cross-system-synthesis/,
  /berasal dari peradaban|kehidupan lalumu terbukti|jiwamu berasal dari bintang/i,
];

export interface SanitizerResult {
  cleaned: string;
  issues: string[];
}

export function sanitizeSoulLetterParagraph(text: string): SanitizerResult {
  let cleaned = text;
  const issues: string[] = [];

  for (const name of FORBIDDEN_SYSTEM_NAMES) {
    const re = new RegExp(`\\b${name}\\b`, "gi");
    if (re.test(cleaned)) {
      issues.push(`Forbidden system name found: \"${name}\"`);
      cleaned = cleaned.replace(re, "");
    }
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(cleaned)) {
      issues.push(`Forbidden pattern matched: ${pattern}`);
      cleaned = cleaned.replace(pattern, "");
    }
  }

  cleaned = cleaned
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.{2,}/g, ".")
    .replace(/,?\s+(tetapi|melainkan|sedangkan)\s+/gi, ", $1 ")
    .replace(/,?\s+dan itu\s+/gi, ", dan itu ")
    .replace(
      /(^|[.!?]\s+)(Meski begitu|Saat itu|Hari ini|Perlahan|Pelan-pelan|Suatu saat|Di suatu titik|Pada suatu titik|Seiring waktu|Karena itu|Dari situlah)(?!,)\s+/g,
      "$1$2, ",
    )
    .replace(/\s+([,.!?;:])/g, "$1");

  const global = sanitizeUserNarrative(cleaned);
  cleaned = global.text;
  issues.push(...global.issues);

  return { cleaned, issues };
}
