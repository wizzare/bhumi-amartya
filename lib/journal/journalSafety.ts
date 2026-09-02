// V5-03 Journal Safety — crisisScanJournalText sibling to safetySentinelEngine.
// Reuses existing infrastructure; no new safety architecture.
// Crisis keywords → SafetyActionCard, NOT AI response (V5_CBT_JOURNAL_DESIGN §7).

export type JournalCrisisLevel = "none" | "support" | "crisis";

export interface JournalCrisisScan {
  level: JournalCrisisLevel;
  matchedKeywords: string[];
  shouldShowResourceCard: boolean;
  shouldSuppressAI: boolean;
}

// Indonesian + English + Malay crisis keywords (case-insensitive, normalized).
// Intentionally narrow — false positive better than false negative for offer of help.
const CRISIS_KEYWORDS: string[] = [
  // self-harm / suicide (id)
  "ingin mati", "mau mati", "bunuh diri", "akhiri hidup", "tidak ingin hidup", "ingin menghilang",
  "menyakiti diri", "melukai diri", "self harm",
  // self-harm / suicide (en)
  "want to die", "kill myself", "end my life", "suicidal", "self-harm", "hurt myself",
  // self-harm / suicide (ms)
  "nak mati", "bunuh diri",
  // abuse
  "kekerasan", "dipukul", "diperkosa", "pelecehan", "abuse", "assault", "rape",
  // severe hopelessness
  "tidak ada harapan", "putus asa sekali", "hopeless", "no hope",
];

const SUPPORT_KEYWORDS: string[] = [
  "sangat sedih", "sangat cemas", "overwhelmed", "tidak kuat", "berat sekali",
  "very sad", "very anxious", "can't cope", "sangat tertekan",
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function crisisScanJournalText(content: string): JournalCrisisScan {
  const n = normalize(content);
  if (!n) return { level: "none", matchedKeywords: [], shouldShowResourceCard: false, shouldSuppressAI: false };
  const crisisHits = CRISIS_KEYWORDS.filter((k) => n.includes(normalize(k)));
  if (crisisHits.length > 0) {
    return { level: "crisis", matchedKeywords: crisisHits, shouldShowResourceCard: true, shouldSuppressAI: true };
  }
  const supportHits = SUPPORT_KEYWORDS.filter((k) => n.includes(normalize(k)));
  if (supportHits.length > 0) {
    return { level: "support", matchedKeywords: supportHits, shouldShowResourceCard: false, shouldSuppressAI: false };
  }
  return { level: "none", matchedKeywords: [], shouldShowResourceCard: false, shouldSuppressAI: false };
}

// Non-diagnostic enforcement — scan AI output for clinical language.
const DIAGNOSTIC_PATTERNS: RegExp[] = [
  /\b(depresi|depression|gangguan|disorder|diagnosa|diagnosis|skizofrenia|bipolar|anxiety disorder|ptsd|ocd)\b/i,
  /\bkamu (menderita|mengidap|terdiagnosa)\b/i,
  /\byou (have|suffer from) (depression|anxiety|bipolar|disorder)\b/i,
];

export function containsDiagnosticLanguage(text: string): boolean {
  return DIAGNOSTIC_PATTERNS.some((re) => re.test(text));
}

export function sanitizeAIOutput(text: string): string {
  if (containsDiagnosticLanguage(text)) {
    // Fallback to reflective framing — never return diagnostic claim.
    return "Satu kemungkinan refleksi: apa yang kamu tulis mungkin sedang mengundang perhatian lembut pada pengalamanmu saat ini — tanpa perlu label.";
  }
  return text;
}
