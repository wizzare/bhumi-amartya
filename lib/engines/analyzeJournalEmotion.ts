/**
 * BHUMI AMARTYA - Journal Emotional Analysis
 * Analyzes journal entries for emotional patterns, recurring themes, and healing direction
 * Uses keyword matching and pattern recognition to detect emotional states and needs
 */

import type { JournalEntry, EmotionalAnalysis, EmotionalCheckIn } from "../data/types";
import { isEnlEdition } from "@/lib/config/edition";

// ============= EMOTION KEYWORD MAPS =============

const emotionKeywords = {
  grief: ["sedih", "hilang", "tidak bisa", "merindu", "sakit", "kosong", "hampa", "mati", "lepas", "akhir", "sad", "grief", "loss", "lost", "missing", "hurt", "empty", "vacant", "pain"],
  anger: ["marah", "kesal", "membenci", "dendam", "kecewa", "benci", "rasanya", "unfair", "seharusnya", "angry", "mad", "annoyed", "hate", "resentful", "disappointed", "furious", "rage"],
  fear: ["takut", "khawatir", "gelisah", "panik", "cemas", "was-was", "berani", "bisa", "mungkin", "bagaimana", "afraid", "fear", "anxious", "worry", "worried", "panic", "scared", "nervous"],
  joy: ["bahagia", "syukur", "cinta", "indah", "beruntung", "bersyukur", "menyenangkan", "gembirakan", "happy", "joy", "grateful", "gratitude", "love", "beautiful", "blessed"],
  confusion: ["bingung", "tidak tahu", "tidak jelas", "ragu", "tidak mengerti", "bagaimana", "kenapa", "apa", "confused", "doubt", "unclear", "uncertain", "puzzled", "don't know"],
  resignation: ["menyerah", "sudah", "tidak ada", "tidak bisa", "semua hilang", "sia-sia", "percuma", "give up", "giving up", "futile", "useless", "pointless", "resigned"],
  hope: ["kemungkinan", "bisa", "mungkin", "harapan", "akan", "dimulai", "baru", "mencoba", "hope", "hopeful", "possible", "new", "try", "trying", "beginning"],
  ambivalence: ["dan juga", "tapi juga", "di sisi lain", "sekaligus", "both", "atau", "on the other hand", "conflicted", "torn"],
};

const woundKeywords: Record<string, string[]> = {
  abandonment: ["ditinggalkan", "sendirian", "tidak", "membutuhkan", "takut ditinggalkan", "pergi", "abandoned", "alone", "left behind", "lonely", "deserted"],
  worthlessness: ["tidak berharga", "tidak cukup", "tidak layak", "bodoh", "gagal", "tidak pantas", "worthless", "not enough", "unworthy", "foolish", "failed", "failure"],
  control: ["harus", "seharusnya", "tidak boleh", "saya yang harus", "tanggung jawab saya", "kutip", "must", "should", "control", "responsibility", "have to"],
  vulnerability: ["terlihat", "dibuka", "rentan", "terluka", "sakit", "lemah", "vulnerable", "exposed", "weak", "hurt"],
  authenticity: ["pura-pura", "palsu", "tidak benar", "peran", "harus menjadi", "harapan mereka", "fake", "pretending", "inauthentic", "role", "expectations"],
  power: ["tidak kuat", "powerless", "tidak bisa mengontrol", "dikontrol", "dipaksa", "helpless", "forced", "powerless"],
  belonging: ["tidak cocok", "aneh", "berbeda", "tidak diterima", "tidak ada tempat", "outsider", "outcast", "don't fit", "unaccepted", "stranger"],
};

const selfTalkPatterns = {
  critical: ["saya", "selalu", "tidak pernah", "bodoh", "gagal", "jelek", "salah", "stupid", "always", "never", "wrong", "failure", "bad"],
  compassionate: ["mengizinkan", "mungkin", "tidak apa-apa", "baik-baik saja", "cukup baik", "sabar", "it's ok", "its ok", "okay", "gentle", "patient", "good enough", "allow"],
  resigned: ["tidak bisa", "sudah", "sia-sia", "tak ada harapan", "kehidupan seperti ini", "cannot", "can't", "hopeless", "useless", "no point"],
};

// ============= NERVOUS SYSTEM DETECTION =============

const nervousSystemMarkers = {
  dysregulated: ["tidak bisa fokus", "overwhelmed", "terlalu banyak", "jantung", "bergetar", "merasa", "can't focus", "too much", "heart racing", "shaking", "unfocused"],
  activated: ["energi tinggi", "cemas", "tidak bisa tidur", "restless", "hidup", "takut", "high energy", "anxious", "can't sleep", "insomnia"],
  calm: ["tenang", "damai", "santai", "rileks", "nyaman", "aman", "calm", "peaceful", "relaxed", "comfortable", "safe"],
  grounded: ["terhubung", "present", "bumi", "stabil", "foundation", "akar", "connected", "present", "grounded", "stable", "root"],
  floaty: ["jauh", "disconnect", "tidak nyata", "mimpi", "kosong", "hilang", "distant", "disconnected", "unreal", "dreamy", "floaty", "numb"],
};

// ============= ANALYSIS FUNCTION =============

export function analyzeJournalEmotion(
  entry: JournalEntry
): EmotionalAnalysis {
  const content = entry.content.toLowerCase();
  const checkIn = entry.emotionalCheckIn;

  // ---------------------------------
  // EMOTIONAL TONE DETECTION
  // ---------------------------------

  const emotionalTone = detectEmotionalTone(content, checkIn);

  // ---------------------------------
  // PRIMARY & SECONDARY EMOTIONS
  // ---------------------------------

  const { primary, secondary } = detectEmotions(content);

  // ---------------------------------
  // NERVOUS SYSTEM STATE
  // ---------------------------------

  const nervousSystemState = detectNervousSystem(content, checkIn);

  // ---------------------------------
  // RECURRING THEMES & WOUNDS
  // ---------------------------------

  const recurringThemes = extractThemes(content);
  const recurringWounds = detectWounds(content);

  // ---------------------------------
  // SELF-TALK PATTERNS
  // ---------------------------------

  const selfTalkPatternsDetected = detectSelfTalkPatterns(content);

  // ---------------------------------
  // EXHAUSTION LEVEL
  // ---------------------------------

  const exhaustionLevel = detectExhaustion(content, checkIn);

  // ---------------------------------
  // AVOIDANCE PATTERNS
  // ---------------------------------

  const avoidancePatterns = detectAvoidancePatterns(content);

  // ---------------------------------
  // GENERATE INSIGHTS & RECOMMENDATIONS
  // ---------------------------------

  const gentleInsight = generateGentleInsight(
    emotionalTone,
    primary,
    recurringThemes,
    recurringWounds
  );

  const healingDirection = generateHealingDirection(
    emotionalTone,
    nervousSystemState,
    exhaustionLevel,
    recurringWounds
  );

  const suggestedNextInnerwork = generateSuggestedInnerwork(
    emotionalTone,
    primary,
    nervousSystemState,
    exhaustionLevel
  );

  const groundingNeed = determineGroundingNeed(
    nervousSystemState,
    emotionalTone,
    exhaustionLevel
  );

  // ---------------------------------
  // BUILD ANALYSIS OBJECT
  // ---------------------------------

  return {
    emotionalTone,
    primaryEmotion: primary,
    secondaryEmotions: secondary,
    nervousSystemDetection: nervousSystemState,
    recurringThemes,
    recurringWounds: recurringWounds.map((w) => w.wound),
    selfTalkPatterns: selfTalkPatternsDetected,
    emotionalExhaustion: exhaustionLevel,
    avoidancePatterns,
    gentleInsight,
    healingDirection,
    suggestedNextInnerwork,
    groundingNeed,
  };
}

// ============= HELPER FUNCTIONS =============

function detectEmotionalTone(
  content: string,
  checkIn: EmotionalCheckIn
): EmotionalAnalysis["emotionalTone"] {
  const tones: EmotionalAnalysis["emotionalTone"][] = [
    "grief",
    "anger",
    "fear",
    "joy",
    "confusion",
    "resignation",
    "hope",
    "ambivalence",
  ];

  const scores: Record<string, number> = {};

  for (const tone of tones) {
    scores[tone] = (
      emotionKeywords[tone as keyof typeof emotionKeywords] || []
    ).filter((keyword) => content.includes(keyword)).length;
  }

  // Weight by mood level
  if (checkIn.moodLevel <= 2) {
    scores["grief"] += 2;
    scores["resignation"] += 1;
  } else if (checkIn.moodLevel === 3) {
    scores["fear"] += 1;
    scores["grief"] += 1;
  } else if (checkIn.moodLevel >= 8) {
    scores["joy"] += 2;
    scores["hope"] += 1;
  }

  const maxTone = Object.entries(scores).reduce(
    (max, [tone, score]) => (score > (scores[max.tone] || 0) ? { tone, score } : max),
    { tone: "ambivalence", score: 0 }
  ).tone as EmotionalAnalysis["emotionalTone"];

  return maxTone;
}

function detectEmotions(
  content: string
): { primary: string; secondary: string[] } {
  const detected: Record<string, number> = {};

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    detected[emotion] = keywords.filter((kw) =>
      content.includes(kw)
    ).length;
  }

  const sorted = Object.entries(detected)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  return {
    primary: sorted[0]?.[0] || "unclear",
    secondary: sorted.slice(1, 3).map(([emotion]) => emotion),
  };
}

function detectNervousSystem(
  content: string,
  checkIn: EmotionalCheckIn
): "dysregulated" | "activated" | "calm" | "grounded" | "floaty" {
  const states = Object.entries(nervousSystemMarkers);
  const scores: Record<string, number> = {};

  for (const [state, markers] of states) {
    scores[state] = markers.filter((m) => content.includes(m)).length;
  }

  // Use checkIn data as override
  if (checkIn.nervousSystemState) {
    scores[checkIn.nervousSystemState] += 3;
  }

  const detected = Object.entries(scores).reduce(
    (max, [state, score]) =>
      score > (scores[max] || 0) ? state : max,
    "calm"
  );

  return detected as "dysregulated" | "activated" | "calm" | "grounded" | "floaty";
}

function extractThemes(content: string): string[] {
  // Simple theme extraction - count repeated concepts
  const themes: Record<string, number> = {};

  const themeKeywords = {
    relationship: ["orang", "hubungan", "dia", "dia", "cinta", "jarak", "relationship", "partner", "love", "connection", "distance"],
    work: ["kerja", "job", "project", "team", "boss", "work", "career", "office"],
    family: ["keluarga", "orang tua", "ibu", "ayah", "saudara", "family", "parents", "mother", "father", "siblings"],
    health: ["kesehatan", "tubuh", "sakit", "energi", "istirahat", "health", "body", "sick", "energy", "rest", "tired"],
    identity: ["siapa", "diri", "saya", "identity", "purpose", "who", "myself", "self"],
    spirituality: ["spiritual", "soul", "purpose", "meaning", "faith", "god", "universe"],
  };

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    const count = keywords.filter((kw) => content.includes(kw)).length;
    if (count > 0) {
      themes[theme] = count;
    }
  }

  return Object.entries(themes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([theme]) => theme);
}

function detectWounds(
  content: string
): { wound: string; intensity: "light" | "moderate" | "deep" }[] {
  const wounds: { wound: string; intensity: "light" | "moderate" | "deep" }[] = [];

  for (const [wound, keywords] of Object.entries(woundKeywords)) {
    const count = keywords.filter((kw) => content.includes(kw)).length;

    if (count > 0) {
      const intensity =
        count === 1 ? "light" : count <= 3 ? "moderate" : "deep";
      wounds.push({ wound, intensity });
    }
  }

  return wounds;
}

function detectSelfTalkPatterns(
  content: string
): EmotionalAnalysis["selfTalkPatterns"] {
  const patterns: EmotionalAnalysis["selfTalkPatterns"] = [];

  for (const [tone, keywords] of Object.entries(selfTalkPatterns)) {
    const count = keywords.filter((kw) => content.includes(kw)).length;

    if (count > 0) {
      patterns.push({
        pattern: `${tone}-leaning self-talk detected`,
        tone: tone as "critical" | "compassionate" | "resigned",
        frequency: count === 1 ? "new" : count <= 3 ? "occasional" : "recurring",
      });
    }
  }

  return patterns;
}

function detectExhaustion(
  content: string,
  checkIn: EmotionalCheckIn
): "low" | "moderate" | "high" | "critical" {
  const tirednessMarkers = [
    "lelah",
    "exhausted",
    "tidak tahan",
    "sick of it",
    "selesai",
    "tidak mampu",
    "tired",
    "drained",
    "worn out",
    "can't go on",
  ];

  const count = tirednessMarkers.filter((m) => content.includes(m)).length;
  const moodScore = checkIn.moodLevel;
  const energyScore = checkIn.energyLevel;

  if (
    count >= 3 ||
    (moodScore <= 2 && energyScore <= 2)
  ) {
    return "critical";
  } else if (count >= 2 || (moodScore <= 3 && energyScore <= 3)) {
    return "high";
  } else if (count >= 1 || moodScore <= 5) {
    return "moderate";
  }

  return "low";
}

function detectAvoidancePatterns(content: string): string[] {
  const avoidanceMarkers = {
    numbing: ["tidak peduli", "numb", "space out", "distract", "don't care", "whatever", "ignore"],
    rationalizing: ["tapi", "alasan", "excuse", "teknis", "but", "reason", "logic", "technical"],
    minimizing: ["tidak apa-apa", "fine", "tidak masalah", "trivial", "whatever", "no big deal", "doesn't matter"],
    denying: ["tidak terjadi", "tidak nyata", "tidak mungkin", "didn't happen", "not real", "impossible", "deny"],
  };

  const patterns: string[] = [];

  for (const [pattern, markers] of Object.entries(avoidanceMarkers)) {
    if (markers.some((m) => content.includes(m))) {
      patterns.push(pattern);
    }
  }

  return patterns;
}

// ============= INSIGHT GENERATION =============

function generateGentleInsight(
  tone: string,
  emotion: string,
  themes: string[],
  wounds: { wound: string; intensity: string }[]
): string {
  const isEn = isEnlEdition();
  if (isEn) {
    const insightsEN: Record<string, string> = {
      grief: "There is a part of you that is grieving. This sadness is proof that you have loved. Allow yourself to feel it fully.",
      anger: "Your anger is a voice for something important. There is a truth behind this emotion that deserves to be heard.",
      fear: "The fear you feel is a protective instinct. But you are stronger than you think.",
      joy: "This joy is a reminder that life is also beautiful. Thank yourself for this moment.",
      confusion: "Confusion is part of the search for truth. It is okay not to know everything right now.",
      resignation: "The feeling of giving up might be an invitation to change strategy, not to stop.",
      hope: "There is light that you see. Slowly, follow that light.",
      ambivalence: "You can feel both things at once. This complexity is a sign of emotional maturity.",
    };
    return insightsEN[tone] || "What you are feeling is valid and worthy of being heard.";
  }

  const insights: Record<string, string> = {
    grief: "Ada bagian dari dirimu yang sedang berduka. Kesedihan ini adalah bukti bahwa kamu telah mencintai. Izinkan diri untuk merasakan sepenuhnya.",
    anger: "Kemarahanmu adalah suara untuk sesuatu yang penting. Ada kebenaran di balik emosi ini yang layak didengar.",
    fear: "Ketakutan yang kamu rasakan adalah naluri pelindung. Tetapi kamu lebih kuat dari yang kamu pikir.",
    joy: "Kegembiraan ini adalah kenangan bahwa hidup juga indah. Berterima kasihlah pada dirimu sendiri atas momen ini.",
    confusion: "Kebingungan adalah bagian dari pencarian kebenaran. Tidak apa-apa untuk tidak tahu semuanya sekarang.",
    resignation: "Rasa menyerah yang ada mungkin adalah ajakan untuk berubah strategi, bukan untuk berhenti.",
    hope: "Ada cahaya yang kamu lihat. Perlahan-lahan, ikuti cahaya itu.",
    ambivalence: "Kamu bisa merasakan kedua hal ini bersamaan. Kompleksitas ini adalah tanda kedewasaan emosional.",
  };

  return (
    insights[tone] || "Apa yang kamu rasakan adalah valid dan layak untuk didengarkan."
  );
}

function generateHealingDirection(
  tone: string,
  nervousSystem: string,
  exhaustion: string,
  wounds: { wound: string; intensity: string }[]
): string {
  const isEn = isEnlEdition();
  if (isEn) {
    if (exhaustion === "critical") {
      return "The first priority is true rest. Your body needs to stop. Allow yourself to be unproductive.";
    }
    if (tone === "grief") {
      return "The direction of healing is through acceptance, not jumping to being 'okay'. Let yourself feel what needs to be felt.";
    }
    if (tone === "anger") {
      return "This anger is energy. Channel it into something meaningful - expression, movement, or building boundaries.";
    }
    if (nervousSystem === "dysregulated") {
      return "Your nervous system needs soothing. Start with slow breathing, physical connection with the ground, or gentle movement.";
    }
    return "Healing happens through gently asking yourself what is truly needed right now.";
  }

  if (exhaustion === "critical") {
    return "Prioritas pertama adalah istirahat sejati. Tubuhmu membutuhkan untuk berhenti. Izinkan diri untuk tidak produktif.";
  }

  if (tone === "grief") {
    return "Arah penyembuhan adalah melalui penerimaan, bukan lompatan ke 'baik-baik saja'. Biarkan diri merasakan apa yang perlu dirasakan.";
  }

  if (tone === "anger") {
    return "Kemarahan ini adalah energi. Channelkan ke sesuatu yang bermakna - ekspresi, gerak, atau pembangunan batas.";
  }

  if (nervousSystem === "dysregulated") {
    return "Sistem sarafmu membutuhkan penenangan. Mulai dengan napas lambat, koneksi fisik dengan bumi, atau gerakan lembut.";
  }

  return "Penyembuhan terjadi melalui bertanya pada diri sendiri dengan lembut apa yang benar-benar dibutuhkan sekarang.";
}

function generateSuggestedInnerwork(
  tone: string,
  emotion: string,
  nervousSystem: string,
  exhaustion: string
): string {
  const isEn = isEnlEdition();
  if (isEn) {
    if (exhaustion === "critical") {
      return "Rest without purpose. Sleep, lie down, or just exist without doing anything.";
    }
    if (nervousSystem === "dysregulated") {
      return "Somatic grounding: Feel your feet on the ground, hold something cold, or listen to nature sounds.";
    }
    if (tone === "grief" || tone === "anger") {
      return "Expressive movement: Dance, uncensored speed writing, or movements that release emotion.";
    }
    if (tone === "confusion") {
      return "Silent meditation: Sit with the question without trying to answer it. Let answers come on their own.";
    }
    return "Uncensored writing: Pour everything out without judgment for 10-15 minutes.";
  }

  if (exhaustion === "critical") {
    return "Istirahat tanpa tujuan. Tidur, berbaring, atau hanya ada tanpa melakukan apa-apa.";
  }

  if (nervousSystem === "dysregulated") {
    return "Grounding somatik: Rasakan kaki di tanah, genggam sesuatu dingin, atau dengarkan suara alam.";
  }

  if (tone === "grief" || tone === "anger") {
    return "Gerak ekspresif: Tari, menulis cepat tanpa sensor, atau gerakan yang melepaskan emosi.";
  }

  if (tone === "confusion") {
    return "Meditasi diam: Duduk dengan pertanyaan tanpa mencoba menjawabnya. Biarkan jawaban datang sendiri.";
  }

  return "Menulis tanpa sensor: Keluarkan semua tanpa penilaian selama 10-15 menit.";
}

function determineGroundingNeed(
  nervousSystem: string,
  tone: string,
  exhaustion: string
): EmotionalAnalysis["groundingNeed"] {
  if (exhaustion === "critical") {
    return "rest";
  }

  if (nervousSystem === "dysregulated" || nervousSystem === "activated") {
    return "body-connection";
  }

  if (tone === "anger") {
    return "movement";
  }

  if (tone === "grief") {
    return "witnessing";
  }

  if (tone === "confusion") {
    return "breathing";
  }

  return "nature";
}
