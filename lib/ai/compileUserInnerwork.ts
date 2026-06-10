import { auth } from "@/lib/firebase/firebase";
import {
  readOwnedCacheArray,
  readOwnedCacheObject,
  writeOwnedCacheObject,
} from "@/lib/storage/derivedCacheOwnership";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";

export const COMPILED_INNERWORK_STORAGE_KEY = "bhumiCompiledInnerwork";

type UnknownRecord = Record<string, unknown>;

export type CompiledInnerworkTheme =
  | "Inner Child"
  | "Money Block"
  | "Love Block"
  | "Self Worth"
  | "Boundaries"
  | "Family Wounds"
  | "Ancestral Patterns"
  | "Repeating Patterns"
  | "Responsibility"
  | "Fear of Rejection"
  | "Fear of Failure"
  | "Emotional Safety"
  | "Nervous System Regulation";

export type CompiledInnerworkInsight = {
  uid?: string;
  dominantTheme: CompiledInnerworkTheme;
  emotionalPattern: string;
  bodyPattern: string;
  recommendedNextJournalQuestion: string;
  recommendedMeditationFocus: string;
  recommendedAudioHealingFocus: string;
  weeklyMessage: string;
  updatedAt: string;
};

export type CompileUserInnerworkInput = {
  profile?: UnknownRecord | null;
  blueprint?: UnknownRecord | null;
  journalEntries?: UnknownRecord[];
  meditationEntries?: UnknownRecord[];
  audioHealingEntries?: UnknownRecord[];
  healingInsights?: UnknownRecord | null;
  journeyData?: UnknownRecord | null;
};

const THEME_KEYWORDS: Record<CompiledInnerworkTheme, string[]> = {
  "Inner Child": ["inner child", "masa kecil", "anak", "dirimu kecil", "didengar", "pengakuan"],
  "Money Block": ["money block", "uang", "finansial", "rezeki", "menerima", "aman finansial"],
  "Love Block": ["love block", "cinta", "hubungan", "relasi", "hati", "membuka hati"],
  "Self Worth": ["self worth", "nilai diri", "layak", "cukup", "membuktikan", "diakui"],
  Boundaries: ["boundaries", "batas", "tidak", "iya", "mengorbankan", "kebutuhan diri"],
  "Family Wounds": ["family", "keluarga", "ayah", "ibu", "rumah", "peran keluarga"],
  "Ancestral Patterns": ["ancestral", "leluhur", "asal-usul", "warisan", "pola keluarga"],
  "Repeating Patterns": ["repeating patterns", "pola berulang", "berulang", "kebiasaan lama", "respons otomatis"],
  Responsibility: ["responsibility", "tanggung jawab", "memikul", "beban", "harus kuat", "menjaga"],
  "Fear of Rejection": ["rejection", "ditolak", "dinilai", "tidak diterima", "tidak terlihat"],
  "Fear of Failure": ["failure", "gagal", "sempurna", "salah", "takut gagal", "hasil"],
  "Emotional Safety": ["aman", "emosi", "lembut", "ditenangkan", "dada", "rasa aman"],
  "Nervous System Regulation": ["nervous system", "grounding", "napas", "tubuh", "rileks", "tegang"],
};

const RECOMMENDATIONS: Record<CompiledInnerworkTheme, {
  journal: string;
  meditation: string;
  audio: string;
  message: string;
}> = {
  "Inner Child": {
    journal: "Apa yang paling ingin didengar oleh bagian kecil dalam dirimu hari ini?",
    meditation: "Meditasi ruang aman untuk inner child dengan napas panjang dan tangan di dada.",
    audio: "Pilih audio yang terasa hangat dan lembut, lalu perhatikan bagian tubuh yang ingin merasa ditemani.",
    message: "Minggu ini, bagian lembut dalam dirimu mungkin sedang meminta didengar tanpa harus diburu untuk sembuh.",
  },
  "Money Block": {
    journal: "Keyakinan lama apa tentang uang yang masih membuat tubuhmu menegang saat menerima lebih banyak?",
    meditation: "Grounding telapak kaki dan Prithvi Mudra untuk membangun rasa aman menerima.",
    audio: "Dengarkan audio grounding sambil memperhatikan respons tubuh saat membayangkan stabilitas finansial.",
    message: "Minggu ini, rasa aman bisa dibangun dari langkah kecil yang rapi, bukan dari memaksa hidup langsung berubah besar.",
  },
  "Love Block": {
    journal: "Apa yang membuatmu menahan cinta atau kelembutan meski sebenarnya ingin terbuka?",
    meditation: "Napas lembut ke area dada tanpa memaksa hati langsung terbuka.",
    audio: "Pilih audio yang menenangkan dada dan izinkan tubuh menerima kelembutan sedikit demi sedikit.",
    message: "Minggu ini, hati tidak perlu langsung terbuka penuh. Cukup lihat bagian mana yang mulai berani melembut.",
  },
  "Self Worth": {
    journal: "Di mana kamu masih merasa harus berguna agar layak dicintai atau diterima?",
    meditation: "Meditasi tangan di dada dan perut sambil mengulang bahwa nilai dirimu tidak perlu dibuktikan.",
    audio: "Dengarkan audio yang lembut dan amati apakah tubuhmu bisa menerima rasa cukup tanpa mengejar hasil.",
    message: "Minggu ini mengajakmu mengenali nilai diri tanpa menunggu validasi dari performa atau respons orang lain.",
  },
  Boundaries: {
    journal: "Batas apa yang ingin kamu ucapkan dengan lebih jujur, lembut, dan tidak berlebihan?",
    meditation: "Visualisasi batas aman di sekitar tubuh selama 5-7 menit.",
    audio: "Pilih audio grounding dan rasakan jarak sehat antara tubuhmu dan tuntutan sekitar.",
    message: "Minggu ini, batas bukan tentang menutup hati. Batas bisa menjadi cara tubuhmu belajar merasa aman.",
  },
  "Family Wounds": {
    journal: "Peran keluarga apa yang masih kamu bawa, dan mana yang sebenarnya bukan tanggung jawabmu?",
    meditation: "Meditasi batas lembut dengan perhatian pada punggung, dada, dan bahu.",
    audio: "Pilih audio grounding untuk membantu tubuh membedakan kasih dari beban.",
    message: "Minggu ini, kamu boleh menghormati keluarga tanpa harus mengulang semua pola yang melelahkan tubuhmu.",
  },
  "Ancestral Patterns": {
    journal: "Pola leluhur apa yang ingin kamu hormati tanpa harus kamu lanjutkan?",
    meditation: "Grounding punggung dan telapak kaki sambil membayangkan dukungan yang sehat.",
    audio: "Dengarkan audio yang membuat tubuh terasa ditopang, lalu catat pola lama yang mulai terlihat.",
    message: "Minggu ini, warisan lama bisa mulai berubah bentuk menjadi kebijaksanaan yang lebih sadar.",
  },
  "Repeating Patterns": {
    journal: "Situasi apa yang terasa berulang, dan respons baru apa yang ingin kamu coba kali ini?",
    meditation: "Meditasi observasi pikiran tanpa mengikuti semua cerita yang muncul.",
    audio: "Pilih audio yang stabil dan perhatikan kapan tubuh ingin kembali ke kebiasaan lama.",
    message: "Minggu ini, pola lama tidak perlu dilawan keras. Cukup dikenali lebih cepat agar kamu punya ruang memilih.",
  },
  Responsibility: {
    journal: "Tanggung jawab apa yang sedang kamu pikul, dan mana yang sebenarnya bisa dibagi atau ditunda?",
    meditation: "Body scan dari bahu ke dada untuk melepas rasa harus memikul semuanya.",
    audio: "Dengarkan audio grounding sambil memperhatikan apakah bahu atau punggung mulai melembut.",
    message: "Minggu ini, tubuhmu mungkin meminta hidup yang tidak selalu ditanggung sendirian.",
  },
  "Fear of Rejection": {
    journal: "Kapan kamu takut ditolak, dan bagian mana dari dirimu yang ingin diterima apa adanya?",
    meditation: "Napas 6 menit sambil memberi ruang pada rasa takut dinilai.",
    audio: "Pilih audio lembut dan amati apakah tubuh tetap bisa hadir saat ada rasa tidak pasti.",
    message: "Minggu ini, keberanianmu tidak harus besar. Satu ekspresi jujur yang aman sudah cukup berarti.",
  },
  "Fear of Failure": {
    journal: "Apa yang sedang kamu tunda karena takut salah, gagal, atau belum sempurna?",
    meditation: "Napas 4-6 sambil melemaskan rahang, bahu, dan perut.",
    audio: "Dengarkan audio tanpa target khusus; cukup selesai ketika tubuhmu merasa cukup.",
    message: "Minggu ini, cukup baik bisa menjadi pintu keluar dari tekanan untuk selalu sempurna.",
  },
  "Emotional Safety": {
    journal: "Apa yang membuat emosimu terasa lebih aman untuk hadir tanpa harus langsung dijelaskan?",
    meditation: "Meditasi tangan di dada dengan napas lembut dan izin untuk merasakan perlahan.",
    audio: "Pilih audio yang menenangkan dada, lalu catat emosi yang muncul tanpa menghakimi.",
    message: "Minggu ini, rasa aman emosional tumbuh dari memberi ruang, bukan dari memaksa diri cepat stabil.",
  },
  "Nervous System Regulation": {
    journal: "Sinyal tubuh apa yang paling sering muncul sebelum kamu menyadari emosimu?",
    meditation: "Grounding 5-7 menit dengan napas panjang, telapak kaki, dan perhatian pada tubuh.",
    audio: "Dengarkan audio grounding dan amati perubahan napas, bahu, dada, atau perut.",
    message: "Minggu ini, tubuhmu menjadi kompas. Dengarkan sinyal kecilnya sebelum menuntut jawaban besar.",
  },
};

function getString(record: UnknownRecord | null | undefined, path: string[]): string | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as UnknownRecord)[key];
  }, record);

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(record: UnknownRecord | null | undefined, path: string[]): number | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as UnknownRecord)[key];
  }, record);

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function countValues(entries: UnknownRecord[], field: string): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>();

  entries.forEach((entry) => {
    const value = entry[field];
    if (typeof value === "string" && value.trim()) {
      counts.set(value.trim(), (counts.get(value.trim()) ?? 0) + 1);
    }
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, count }));
}

function countBodySignals(entries: UnknownRecord[]): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>();

  entries.forEach((entry) => {
    if (!Array.isArray(entry.bodySignals)) return;
    entry.bodySignals.forEach((signal) => {
      if (typeof signal === "string" && signal.trim()) {
        counts.set(signal.trim(), (counts.get(signal.trim()) ?? 0) + 1);
      }
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, count }));
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

function addScore(scores: Map<CompiledInnerworkTheme, number>, theme: CompiledInnerworkTheme, points: number) {
  scores.set(theme, (scores.get(theme) ?? 0) + points);
}

function scoreBlueprint(scores: Map<CompiledInnerworkTheme, number>, blueprint?: UnknownRecord | null) {
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: "id",
    profile: null,
    blueprint: blueprint ?? null,
  });
  const text = [
    synthesis.blueprintSummary,
    ...synthesis.coreNeeds,
    synthesis.practiceThemes.grounding,
    synthesis.practiceThemes.reflection,
    synthesis.practiceThemes.action,
  ].join(" ").toLowerCase();

  if (text.includes("responsibility") || text.includes("structure") || text.includes("discipline")) addScore(scores, "Responsibility", 2);
  if (text.includes("money") || text.includes("power") || text.includes("leadership")) addScore(scores, "Money Block", 2);
  if (text.includes("expression") || text.includes("communication")) addScore(scores, "Fear of Rejection", 1);
  if (text.includes("boundary") || text.includes("energy management") || text.includes("clarity")) addScore(scores, "Boundaries", 2);
  if (text.includes("body") || text.includes("nervous") || text.includes("ground")) addScore(scores, "Nervous System Regulation", 2);
  if (text.includes("emotion") || text.includes("sensitivity") || text.includes("heart")) addScore(scores, "Emotional Safety", 2);
  if (text.includes("shadow") || text.includes("transform") || text.includes("healing")) addScore(scores, "Inner Child", 2);
}

function detectDominantTheme(input: CompileUserInnerworkInput): CompiledInnerworkTheme {
  const scores = new Map<CompiledInnerworkTheme, number>();
  const entries = [
    ...(input.journalEntries ?? []),
    ...(input.meditationEntries ?? []),
    ...(input.audioHealingEntries ?? []),
  ];
  const text = collectText(entries);

  entries.forEach((entry) => {
    const theme = typeof entry.theme === "string" ? entry.theme.toLowerCase() : "";
    Object.keys(THEME_KEYWORDS).forEach((candidate) => {
      if (theme.includes(candidate.toLowerCase())) addScore(scores, candidate as CompiledInnerworkTheme, 5);
    });
  });

  Object.entries(THEME_KEYWORDS).forEach(([theme, keywords]) => {
    keywords.forEach((keyword) => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matches = text.match(new RegExp(escaped, "g"));
      if (matches?.length) addScore(scores, theme as CompiledInnerworkTheme, matches.length);
    });
  });

  const healingTheme = getString(input.healingInsights, ["weeklyFocus", "theme"]);
  if (healingTheme && healingTheme in THEME_KEYWORDS) {
    addScore(scores, healingTheme as CompiledInnerworkTheme, 3);
  }

  const journeyTheme = getString(input.journeyData, ["weeklyFocus", "theme"]);
  if (journeyTheme && journeyTheme in THEME_KEYWORDS) {
    addScore(scores, journeyTheme as CompiledInnerworkTheme, 2);
  }

  scoreBlueprint(scores, input.blueprint);

  if (scores.size === 0) return "Self Worth";

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

export function compileUserInnerwork(input: CompileUserInnerworkInput): CompiledInnerworkInsight {
  // TODO: Replace deterministic compile with Gemini-based orchestrator.
  const entries = [
    ...(input.journalEntries ?? []),
    ...(input.meditationEntries ?? []),
    ...(input.audioHealingEntries ?? []),
  ];
  const dominantTheme = detectDominantTheme(input);
  const topEmotion = countValues(entries, "emotionalState")[0];
  const topBodySignal = countBodySignals(entries)[0];
  const recommendation = RECOMMENDATIONS[dominantTheme];

  return {
    dominantTheme,
    emotionalPattern: topEmotion
      ? `Emosi yang paling sering muncul: ${topEmotion.value} (${topEmotion.count}x).`
      : "Belum ada pola emosi yang cukup terbaca.",
    bodyPattern: topBodySignal
      ? `Sinyal tubuh yang paling sering muncul: ${topBodySignal.value} (${topBodySignal.count}x).`
      : "Belum ada pola tubuh yang cukup terbaca.",
    recommendedNextJournalQuestion: recommendation.journal,
    recommendedMeditationFocus: recommendation.meditation,
    recommendedAudioHealingFocus: recommendation.audio,
    weeklyMessage: recommendation.message,
    updatedAt: new Date().toISOString(),
  };
}

export function refreshCompiledInnerwork(): CompiledInnerworkInsight | null {
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

    const profile = readOwnedCacheObject<UnknownRecord>(`bhumiProfile:${uid}`, "compiledInnerwork:profile");
    const blueprint = readOwnedCacheObject<UnknownRecord>(`bhumiBlueprint:${uid}`, "compiledInnerwork:blueprint");
    const journalEntries = readOwnedCacheArray<UnknownRecord>(`bhumiJournalEntries:${uid}`, "compiledInnerwork:journalEntries");
    const meditationEntries = readOwnedCacheArray<UnknownRecord>(`bhumiMeditationEntries:${uid}`, "compiledInnerwork:meditationEntries");
    const audioHealingEntries = readOwnedCacheArray<UnknownRecord>(`bhumiAudioHealingEntries:${uid}`, "compiledInnerwork:audioHealingEntries");
    const healingInsights = readOwnedCacheObject<UnknownRecord>(`bhumiHealingInsights:${uid}`, "compiledInnerwork:healingInsights");
    const journeyData = readOwnedCacheObject<UnknownRecord>(`bhumiJourneyData:${uid}`, "compiledInnerwork:journeyData");

    const result = compileUserInnerwork({
      profile,
      blueprint,
      journalEntries,
      meditationEntries,
      audioHealingEntries,
      healingInsights,
      journeyData,
    });

    const storageKey = uid ? `${COMPILED_INNERWORK_STORAGE_KEY}:${uid}` : COMPILED_INNERWORK_STORAGE_KEY;
    return writeOwnedCacheObject(storageKey, result, "compiledInnerwork");
  } catch (error) {
    console.error("[Compiled Innerwork] Failed to refresh", error);
    return null;
  }
}

export function loadCompiledInnerwork(): CompiledInnerworkInsight | null {
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
    const storageKey = uid ? `${COMPILED_INNERWORK_STORAGE_KEY}:${uid}` : COMPILED_INNERWORK_STORAGE_KEY;

    return readOwnedCacheObject<CompiledInnerworkInsight>(storageKey, "compiledInnerwork")
      ?? refreshCompiledInnerwork();
  } catch {
    return refreshCompiledInnerwork();
  }
}
