const FORBIDDEN_SYSTEM_NAMES = [
  "human design", "bazi", "zi wei", "whole sign", "natal chart",
  "destiny matrix", "tzolkin", "astrocartography", "weton",
  "vedic astrology", "vedic", "numerology", "life path",
];

const FORBIDDEN_PATTERNS = [
  /[a-z][a-z]*[A-Z][a-z]*/, // camelCase
  /[a-z]+_[a-z]+/, // snake_case
  /\/[a-z]+\/[a-z]+\//, // file paths
  /sourceVersion|factId|blueprintFingerprint|calculationFingerprint|interpretationEligibility/,
  /(?:^|[.!?]\s+)(?:berdasarkan data di atas|sistem mendeteksi|input menunjukkan|model menyimpulkan|hasil kalkulasi|berdasarkan sistem|menurut algoritma|data mengindikasikan|sebagai AI|berikut adalah|kesimpulannya adalah)/i,
  /\{.*\}|\[.*\]/, // JSON-like brackets
  /systemId|available|partial|birth-time-required|cross-system-synthesis/,
];

export interface SanitizerResult {
  cleaned: string;
  issues: string[];
}

export function sanitizeNarrative(text: string): SanitizerResult {
  let cleaned = text;
  const issues: string[] = [];

  for (const name of FORBIDDEN_SYSTEM_NAMES) {
    const re = new RegExp(`\\b${name}\\b`, "gi");
    if (re.test(cleaned)) {
      issues.push(`Forbidden system name found: "${name}"`);
      cleaned = cleaned.replace(re, "");
    }
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(cleaned)) {
      issues.push(`Forbidden pattern matched: ${pattern}`);
      cleaned = cleaned.replace(pattern, "");
    }
  }

  cleaned = cleaned.replace(/\s+/g, " ").trim().replace(/\.+/g, ".");

  return { cleaned, issues };
}
