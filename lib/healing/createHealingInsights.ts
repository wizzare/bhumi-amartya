import {
  readOwnedCacheArray,
  readOwnedCacheObject,
  writeOwnedCacheObject,
} from "@/lib/storage/derivedCacheOwnership";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { auth } from "@/lib/firebase/firebase";

export const HEALING_INSIGHTS_STORAGE_KEY = "bhumiHealingInsights";

function getScopedInsightsKey(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) return HEALING_INSIGHTS_STORAGE_KEY;
  return `${HEALING_INSIGHTS_STORAGE_KEY}:${uid}`;
}

type UnknownRecord = Record<string, unknown>;

export type HealingTheme =
  | "Self Worth"
  | "Inner Child"
  | "Love Block"
  | "Money Block"
  | "Family Wounds"
  | "Rejection"
  | "Abandonment"
  | "Perfectionism"
  | "Responsibility"
  | "Boundaries"
  | "Self Expression"
  | "Purpose";

export type HealingInsightResult = {
  uid?: string;
  dominantThemes: Array<{
    theme: HealingTheme;
    score: number;
    reason: string;
  }>;
  emotionalPatterns: string[];
  weeklyFocus: {
    theme: HealingTheme;
    whyDetected: string;
    practice: string;
  };
  recommendedJournal: string;
  recommendedMeditation: string;
  recommendedAudioHealing: string;
  generatedAt: string;
  source: "local-healing-memory";
};

export type HealingInsightInput = {
  journalEntries?: UnknownRecord[];
  meditationEntries?: UnknownRecord[];
  audioHealingEntries?: UnknownRecord[];
  blueprint?: UnknownRecord | null;
};

const THEME_KEYWORDS: Record<HealingTheme, string[]> = {
  "Self Worth": ["self worth", "nilai diri", "cukup", "layak", "diakui", "pengakuan", "membuktikan"],
  "Inner Child": ["inner child", "masa kecil", "kecil", "anak", "didengar", "dirimu kecil"],
  "Love Block": ["love block", "cinta", "mencintai", "relasi", "hubungan", "hati"],
  "Money Block": ["money block", "uang", "finansial", "rezeki", "menerima", "aman finansial"],
  "Family Wounds": ["family", "keluarga", "leluhur", "ayah", "ibu", "rumah", "peran keluarga"],
  Rejection: ["ditolak", "rejection", "dinilai", "tidak terlihat", "tidak diterima"],
  Abandonment: ["ditinggalkan", "abandonment", "sendiri", "kehilangan", "tidak ditemani"],
  Perfectionism: ["sempurna", "perfectionism", "perfeksionis", "gagal", "hasil", "rapi"],
  Responsibility: ["tanggung jawab", "memikul", "kuat", "menjaga", "beban", "responsibility"],
  Boundaries: ["batas", "boundaries", "iya", "tidak", "mengorbankan", "kebutuhan diri"],
  "Self Expression": ["ekspresi", "komunikasi", "suara", "bicara", "jujur", "kreativitas"],
  Purpose: ["purpose", "calling", "panggilan", "tujuan", "arah", "hidup", "makna"],
};

const THEME_RECOMMENDATIONS: Record<HealingTheme, {
  journal: string;
  meditation: string;
  audio: string;
  practice: string;
}> = {
  "Self Worth": {
    journal: "Tulis tiga momen ketika kamu merasa harus membuktikan nilai diri, lalu jawab: apa yang sebenarnya kamu butuhkan saat itu?",
    meditation: "Lakukan meditasi tangan di dada dan perut selama 7 menit sambil mengulang: nilai diriku tidak perlu dibuktikan hari ini.",
    audio: "Pilih audio yang terasa lembut, lalu perhatikan apakah tubuhmu bisa menerima rasa cukup tanpa mengejar hasil.",
    practice: "Pilih satu tindakan kecil yang mendukung rasa cukup, bukan rasa harus membuktikan.",
  },
  "Inner Child": {
    journal: "Tulis surat pendek untuk dirimu saat kecil: apa yang ingin ia dengar hari ini?",
    meditation: "Duduk tenang 5 menit sambil membayangkan ruang aman untuk bagian kecil dalam dirimu.",
    audio: "Dengarkan audio dengan volume rendah dan perhatikan bagian tubuh yang ingin merasa dipeluk.",
    practice: "Beri satu bentuk validasi sederhana untuk bagian dalam dirimu yang ingin didengar.",
  },
  "Love Block": {
    journal: "Tulis pola yang muncul saat kamu ingin membuka hati tetapi tubuhmu menahan diri.",
    meditation: "Praktik napas lembut ke area dada, tanpa memaksa hati untuk langsung terbuka.",
    audio: "Pilih audio yang menenangkan dada dan amati apa yang muncul saat kamu menerima kelembutan.",
    practice: "Jaga satu batas kecil dalam relasi tanpa menutup hati.",
  },
  "Money Block": {
    journal: "Tulis keyakinan lama tentang uang yang masih terasa aktif, lalu tanyakan apakah keyakinan itu masih milikmu.",
    meditation: "Lakukan grounding telapak kaki dan Prithvi Mudra untuk mengundang rasa aman di tubuh.",
    audio: "Dengarkan audio sambil memperhatikan respons tubuh saat memikirkan menerima lebih banyak.",
    practice: "Rapikan satu keputusan finansial kecil dengan napas yang lebih panjang.",
  },
  "Family Wounds": {
    journal: "Tulis peran keluarga yang masih sering kamu bawa, lalu bedakan mana kasih dan mana beban.",
    meditation: "Bayangkan batas lembut di sekitar tubuhmu selama 5 menit.",
    audio: "Pilih audio grounding dan perhatikan apakah punggung atau dada memberi sinyal tertentu.",
    practice: "Lepaskan satu tanggung jawab yang tidak perlu kamu pikul hari ini.",
  },
  Rejection: {
    journal: "Tulis situasi ketika kamu takut ditolak, lalu jawab: bagian mana dari diriku yang ingin diterima?",
    meditation: "Amati napas 6 menit sambil memberi ruang pada rasa takut dinilai.",
    audio: "Dengarkan audio yang lembut dan perhatikan apakah tubuhmu bisa tetap hadir meski ada rasa tidak pasti.",
    practice: "Ekspresikan satu hal kecil dengan jujur tanpa mengukur respons orang lain.",
  },
  Abandonment: {
    journal: "Tulis kapan rasa takut ditinggalkan paling sering muncul dan kebutuhan apa yang ada di baliknya.",
    meditation: "Letakkan tangan di dada dan ulangi napas panjang sampai tubuhmu merasa ditemani.",
    audio: "Pilih audio yang terasa hangat dan amati apakah tubuhmu bisa merasa ditemani oleh napasmu sendiri.",
    practice: "Bangun satu momen menemani diri sendiri tanpa distraksi.",
  },
  Perfectionism: {
    journal: "Tulis satu area hidup yang kamu tunggu sempurna, lalu pilih versi cukup baiknya.",
    meditation: "Lakukan napas 4-6 sambil melemaskan rahang dan bahu.",
    audio: "Dengarkan audio tanpa target khusus; cukup selesai ketika tubuhmu merasa cukup.",
    practice: "Selesaikan satu hal kecil tanpa memperbaikinya berulang kali.",
  },
  Responsibility: {
    journal: "Tulis tanggung jawab yang sedang kamu pikul dan mana yang sebenarnya bisa dibagi.",
    meditation: "Praktik body scan dari bahu ke dada untuk melihat area yang menahan beban.",
    audio: "Pilih audio grounding dan perhatikan apakah bahu atau punggung mulai melembut.",
    practice: "Minta bantuan atau tunda satu beban yang tidak mendesak.",
  },
  Boundaries: {
    journal: "Tulis satu batas yang ingin kamu ucapkan dengan lembut dan jelas.",
    meditation: "Bayangkan ruang aman di sekitar tubuhmu selama 5 menit.",
    audio: "Dengarkan audio sambil merasakan jarak sehat antara tubuhmu dan tuntutan sekitar.",
    practice: "Berlatih mengatakan satu tidak kecil tanpa penjelasan berlebihan.",
  },
  "Self Expression": {
    journal: "Tulis hal yang ingin kamu katakan tetapi selama ini ditahan.",
    meditation: "Tarik napas ke dada dan tenggorokan, lalu buang perlahan lewat mulut.",
    audio: "Pilih audio yang membantu tenggorokan dan dada terasa lebih lega.",
    practice: "Bagikan satu kalimat jujur pada tempat yang aman.",
  },
  Purpose: {
    journal: "Tulis satu panggilan kecil yang terus kembali, meski kamu belum tahu bentuk akhirnya.",
    meditation: "Duduk 7 menit dan dengarkan langkah kecil yang terasa hidup.",
    audio: "Dengarkan audio sambil membiarkan tubuhmu merasakan arah, bukan tekanan.",
    practice: "Ambil satu langkah kecil yang selaras dengan panggilanmu.",
  },
};

function addScore(scores: Map<HealingTheme, { score: number; reasons: string[] }>, theme: HealingTheme, points: number, reason: string) {
  const current = scores.get(theme) ?? { score: 0, reasons: [] };
  current.score += points;
  if (!current.reasons.includes(reason)) current.reasons.push(reason);
  scores.set(theme, current);
}

function collectText(entries: UnknownRecord[]): string {
  return entries
    .map((entry) => [
      entry.theme,
      entry.journalText,
      entry.bodyReflection,
      entry.reflectionText,
      entry.emotionalState,
      entry.insight,
      entry.nextFocus,
      entry.tomorrowFocus,
      ...(Array.isArray(entry.bodySignals) ? entry.bodySignals : []),
      ...(Array.isArray(entry.questions) ? entry.questions : []),
      ...(Array.isArray(entry.practices) ? entry.practices : []),
    ].filter(Boolean).join(" "))
    .join(" ")
    .toLowerCase();
}

function getNumber(record: UnknownRecord | null | undefined, path: string[]): number | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as UnknownRecord)[key];
  }, record);
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getString(record: UnknownRecord | null | undefined, path: string[]): string | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as UnknownRecord)[key];
  }, record);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function createHealingInsights({
  journalEntries = [],
  meditationEntries = [],
  audioHealingEntries = [],
  blueprint,
}: HealingInsightInput): HealingInsightResult {
  const scores = new Map<HealingTheme, { score: number; reasons: string[] }>();
  const allEntries = [...journalEntries, ...meditationEntries, ...audioHealingEntries];
  const text = collectText(allEntries);

  allEntries.forEach((entry) => {
    const theme = typeof entry.theme === "string" ? entry.theme : "";
    Object.keys(THEME_KEYWORDS).forEach((candidate) => {
      if (theme.toLowerCase().includes(candidate.toLowerCase())) {
        addScore(scores, candidate as HealingTheme, 5, `"${theme}" muncul berulang dalam aktivitas healing.`);
      }
    });
  });

  Object.entries(THEME_KEYWORDS).forEach(([theme, keywords]) => {
    keywords.forEach((keyword) => {
      const matches = text.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"));
      if (matches?.length) {
        addScore(scores, theme as HealingTheme, matches.length, `Kata/pola "${keyword}" muncul berulang dalam catatan aktivitas.`);
      }
    });
  });

  const synthesis = buildUnifiedBlueprintSynthesis({
    language: "id",
    profile: null,
    blueprint: blueprint ?? null,
  });
  const synthesisText = [
    synthesis.blueprintSummary,
    ...synthesis.coreNeeds,
    synthesis.practiceThemes.grounding,
    synthesis.practiceThemes.reflection,
    synthesis.practiceThemes.action,
  ].join(" ").toLowerCase();

  if (synthesisText.includes("structure") || synthesisText.includes("responsibility") || synthesisText.includes("discipline")) {
    addScore(scores, "Responsibility", 2, "Ada pola yang mengarah pada kebutuhan menata tanggung jawab dengan lebih manusiawi.");
  }
  if (synthesisText.includes("money") || synthesisText.includes("power") || synthesisText.includes("leadership")) {
    addScore(scores, "Money Block", 2, "Ada pola yang mengarah pada relasi yang lebih jernih dengan rasa aman, menerima, dan daya diri.");
  }
  if (synthesisText.includes("expression") || synthesisText.includes("communication")) {
    addScore(scores, "Self Expression", 2, "Ada pola yang mengarah pada kebutuhan mengungkapkan sesuatu dengan lebih jujur.");
  }
  if (synthesisText.includes("boundary") || synthesisText.includes("energy management") || synthesisText.includes("clarity")) {
    addScore(scores, "Boundaries", 2, "Ada pola yang mengarah pada kebutuhan menjaga energi dan batas dengan lebih sadar.");
  }
  if (synthesisText.includes("experiment") || synthesisText.includes("vision") || synthesisText.includes("calling")) {
    addScore(scores, "Purpose", 2, "Ada pola yang mengarah pada langkah kecil yang terasa lebih hidup dan bermakna.");
  }
  if (synthesisText.includes("shadow") || synthesisText.includes("transform") || synthesisText.includes("healing")) {
    addScore(scores, "Inner Child", 2, "Ada pola yang mengarah pada kebutuhan rasa aman batin dan perubahan yang lebih lembut.");
  }

  if (scores.size === 0) {
    addScore(scores, "Self Worth", 1, "Belum ada banyak data, jadi fokus awal diarahkan ke rasa cukup dan kesadaran diri.");
  }

  const dominantThemes = [...scores.entries()]
    .sort((a, b) => b[1].score - a[1].score || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([theme, value]) => ({
      theme,
      score: value.score,
      reason: value.reasons[0] || "Pola ini muncul dari aktivitas healing yang sudah kamu lakukan.",
    }));
  const topTheme = dominantThemes[0]?.theme ?? "Self Worth";
  const recommendation = THEME_RECOMMENDATIONS[topTheme];
  const emotionalPatterns = [...new Set(allEntries
    .map((entry) => typeof entry.emotionalState === "string" ? entry.emotionalState : null)
    .filter((item): item is string => Boolean(item)))]
    .slice(0, 4);

  return {
    dominantThemes,
    emotionalPatterns,
    weeklyFocus: {
      theme: topTheme,
      whyDetected: dominantThemes[0]?.reason ?? "Pola ini muncul dari aktivitas healing yang sudah kamu lakukan.",
      practice: recommendation.practice,
    },
    recommendedJournal: recommendation.journal,
    recommendedMeditation: recommendation.meditation,
    recommendedAudioHealing: recommendation.audio,
    generatedAt: new Date().toISOString(),
    source: "local-healing-memory",
  };
}

export function refreshHealingInsights(): HealingInsightResult | null {
  if (typeof window === "undefined") return null;

  try {
    const authUid = auth.currentUser?.uid;
    // Fallback search for scoped profile
    let uid = authUid;
    if (!uid) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('bhumiProfile:')) {
          uid = key.split(':')[1];
          break;
        }
      }
    }

    if (!uid) return null;

    const journalEntries = readOwnedCacheArray<UnknownRecord>(`bhumiJournalEntries:${uid}`, "healingInsights:journalEntries");
    const meditationEntries = readOwnedCacheArray<UnknownRecord>(`bhumiMeditationEntries:${uid}`, "healingInsights:meditationEntries");
    const audioHealingEntries = readOwnedCacheArray<UnknownRecord>(`bhumiAudioHealingEntries:${uid}`, "healingInsights:audioHealingEntries");
    const blueprint = readOwnedCacheObject<UnknownRecord>(`bhumiBlueprint:${uid}`, "healingInsights:blueprint");
    const result = createHealingInsights({
      journalEntries: Array.isArray(journalEntries) ? journalEntries : [],
      meditationEntries: Array.isArray(meditationEntries) ? meditationEntries : [],
      audioHealingEntries: Array.isArray(audioHealingEntries) ? audioHealingEntries : [],
      blueprint,
    });

    const scopedKey = getScopedInsightsKey();
    const ownedResult = writeOwnedCacheObject(scopedKey, result, "healingInsights");

    if (scopedKey !== HEALING_INSIGHTS_STORAGE_KEY) {
      window.localStorage.removeItem(HEALING_INSIGHTS_STORAGE_KEY);
    }

    return ownedResult;
  } catch (error) {
    console.error("[Healing Insights] Failed to refresh", error);
    return null;
  }
}

export function loadHealingInsights(): HealingInsightResult | null {
  if (typeof window === "undefined") return null;

  try {
    const scopedKey = getScopedInsightsKey();
    return readOwnedCacheObject<HealingInsightResult>(scopedKey, "healingInsights")
      ?? refreshHealingInsights();
  } catch {
    return refreshHealingInsights();
  }
}
