export type NarrativeSafetyStatus = "PASS" | "SANITIZED" | "BLOCKED_REGENERATE" | "SAFE_FALLBACK_USED";

export type NarrativeSafetyResult = {
  text: string;
  status: NarrativeSafetyStatus;
  issues: string[];
};

const RAW_REPLACEMENTS: Array<[RegExp, string]> = [
  [/Anjing Putih\s*\((?:OC|Oc)\)/gi, "Anjing Putih, simbol kesetiaan dan kasih yang tulus"],
  [/Badai Biru\s*\((?:Cauac)\)/gi, "Badai Biru, simbol perubahan yang mengguncang pola lama"],
  [/Naga Merah\s*\((?:Imix)\)/gi, "Naga Merah, simbol awal kehidupan dan keberanian memulai"],
  [/Jupiter\s+(?:is|berada)\s+4th\s+from\s+the\s+Moon/gi, "Jupiter menunjukkan dorongan menemukan rasa aman melalui keluarga, rumah, dan ruang batin"],
  [/Sun\s+and\s+Mercury\s+are\s+conjunct(?:\s+within\s+[\d.]+°)?/gi, "Matahari dan Merkurius saling menguatkan dalam cara berpikir dan berkomunikasi"],
  [/Venus\s+and\s+Mercury/gi, "cara mencintai dan cara berkomunikasi"],
  [/wealth-house\s+lords/gi, "pola pengelolaan sumber daya dan jalur penghasilan"],
  [/lords\s+(?:of\s+)?angular(?:\/|\s+)trinal\s+houses/gi, "pengelola tema tindakan dan wawasan"],
  [/conjoin(?:ed)?\s+in\s+([A-Za-z]+)/gi, "menyatu dalam kualitas $1"],
  [/conjoin(?:ed)?\s+([A-Za-z]+)/gi, "menyatu dalam energi $1"],
  [/\b(?:4th\s+from\s+the\s+Moon|from\s+the\s+Moon)\b/gi, "dalam kaitannya dengan rasa aman dan ruang batin"],
  [/\((?:Imix|Ik|Akbal|Kan|Chicchan|Cimi|Manik|Lamat|Muluc|Oc|Chuen|Eb|Ben|Ix|Men|Cib|Caban|Etznab|Cauac|Ahau)\)/gi, ""],
];

const RAW_PATTERNS: Array<[RegExp, string]> = [
  [/\b(?:sourceVersion|factIds?|systemIds?|fingerprint|provenance|providerResponse|fallbackReason|commonEnergy|wealthHouseLord|moonFourthHouse|currentBuild|promptVariant)\b/gi, ""],
  [/\b(?:HIGH_CONFIDENCE|LOW_CONFIDENCE|UNRESOLVED|undefined|null)\b/gi, ""],
  [/\b(?:berdasarkan data di atas|sistem mendeteksi|input menunjukkan|model menyimpulkan|hasil kalkulasi|berdasarkan sistem|menurut algoritma|data mengindikasikan|sebagai AI|berikut adalah|kesimpulannya adalah)\b/gi, ""],
  [/\{[^{}]*\}|\[[^\[\]]*\]/g, ""],
];

export function sanitizeUserNarrative(value: string | null | undefined): NarrativeSafetyResult {
  if (!value) return { text: "", status: "PASS", issues: [] };
  let text = value;
  const issues: string[] = [];
  for (const [pattern, replacement] of RAW_REPLACEMENTS) {
    if (pattern.test(text)) {
      issues.push(`raw phrase: ${pattern.source}`);
      text = text.replace(pattern, replacement);
    }
  }
  for (const [pattern, replacement] of RAW_PATTERNS) {
    if (pattern.test(text)) {
      issues.push(`raw metadata: ${pattern.source}`);
      text = text.replace(pattern, replacement);
    }
  }
  text = text.replace(/\s{2,}/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim();
  return { text, status: issues.length ? "SANITIZED" : "PASS", issues };
}

export function auditUserNarrative(value: string | null | undefined): NarrativeSafetyResult {
  const result = sanitizeUserNarrative(value);
  return result.issues.length ? { ...result, status: "BLOCKED_REGENERATE" } : result;
}
