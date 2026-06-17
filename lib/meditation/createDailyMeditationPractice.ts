import { refreshHealingInsights } from "@/lib/healing/createHealingInsights";
import { refreshJourneyData } from "@/lib/journey/createJourneyData";
import { refreshCompiledInnerwork } from "@/lib/ai/compileUserInnerwork";
import { refreshProgressData } from "@/lib/insights/createInsightProgress";
import { getMudraGuide, type MudraGuide, type MudraName } from "@/lib/meditation/mudraGuides";
import { saveLastActivity } from "@/lib/activity/getLastActivity";
import { readOwnedCacheArray, withActiveUid } from "@/lib/storage/derivedCacheOwnership";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { auth } from "@/lib/firebase/firebase";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";

export const MEDITATION_STORAGE_KEY = "bhumiMeditationEntries";

function getScopedMeditationKey(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) return MEDITATION_STORAGE_KEY;
  return `${MEDITATION_STORAGE_KEY}:${uid}`;
}

type UnknownRecord = Record<string, unknown>;

export type MeditationTheme =
  | "Inner Child"
  | "Love Block"
  | "Money Block"
  | "Repeating Patterns"
  | "Self Worth"
  | "Family Dynamics"
  | "Karmic Lessons"
  | "Ancestral Patterns"
  | "Forgiveness"
  | "Purpose & Calling"
  | "Nervous System Grounding"
  | "Emotional Release"
  | "Body Safety";

export type DailyMeditationPractice = {
  theme: MeditationTheme;
  practices: string[];
  mudra: MudraGuide | null;
  affirmation: string;
};

export type MeditationEntry = {
  uid?: string;
  id: string;
  date: string;
  theme: MeditationTheme;
  practices: string[];
  emotionalState: string;
  bodySignals: string[];
  bodyReflection: string;
  createdAt: string;
  insight: string;
  nextFocus: string;
  mudraName?: MudraName;
};

export type MeditationReflection = {
  insight: string;
  nextFocus: string;
};

export type CreateDailyMeditationPracticeInput = {
  profile?: UnknownRecord | null;
  blueprint?: UnknownRecord | null;
  previousMeditationEntries?: MeditationEntry[];
  previousJournalEntries?: unknown[];
};

const THEMES: MeditationTheme[] = [
  "Inner Child",
  "Love Block",
  "Money Block",
  "Repeating Patterns",
  "Self Worth",
  "Family Dynamics",
  "Karmic Lessons",
  "Ancestral Patterns",
  "Forgiveness",
  "Purpose & Calling",
  "Nervous System Grounding",
  "Emotional Release",
  "Body Safety",
];

const THEME_PRACTICES: Record<MeditationTheme, { practices: string[]; affirmation: string; mudras: MudraName[] }> = {
  "Inner Child": {
    practices: [
      "Duduk tenang 5 menit sambil membayangkan dirimu kecil duduk di tempat yang aman.",
      "Gerakan ringan: peluk tubuh sendiri 10 napas, lalu lepaskan bahu perlahan.",
      "Napas: tarik 4 hitungan, buang 6 hitungan.",
    ],
    affirmation: "Aku boleh merasa aman menjadi diriku yang lembut.",
    mudras: ["Anjali Mudra", "Yoni Mudra", "Prithvi Mudra"],
  },
  "Love Block": {
    practices: [
      "Duduk 5 menit dengan tangan di dada, rasakan area jantung tanpa memaksa terbuka.",
      "Gerakan ringan: buka-tutup lengan perlahan 12 kali.",
      "Napas: tarik ke dada 4 hitungan, buang 6 hitungan.",
    ],
    affirmation: "Aku boleh menerima cinta tanpa meninggalkan diriku.",
    mudras: ["Padma Mudra", "Anjali Mudra", "Yoni Mudra"],
  },
  "Money Block": {
    practices: [
      "Duduk tenang 5 menit, tangan di dada dan perut.",
      "Gerakan ringan: 10 shoulder rolls dan 10 slow squats.",
      "Napas: tarik 4 hitungan, buang 6 hitungan.",
    ],
    affirmation: "Aku boleh menerima rezeki tanpa kehilangan diriku.",
    mudras: ["Prithvi Mudra", "Kubera Mudra", "Surya Mudra"],
  },
  "Repeating Patterns": {
    practices: [
      "Duduk 5 menit dan perhatikan pola pikiran yang muncul tanpa mengikuti semuanya.",
      "Gerakan ringan: jalan pelan di tempat selama 2 menit.",
      "Napas: tarik 3 hitungan, tahan 2, buang 6.",
    ],
    affirmation: "Aku bisa memilih respons baru dengan lembut.",
    mudras: ["Gyan Mudra", "Vayu Mudra", "Hakini Mudra"],
  },
  "Self Worth": {
    practices: [
      "Duduk 5 menit dengan telapak tangan di paha, rasakan berat tubuh ditopang.",
      "Gerakan ringan: berdiri tegak, tarik bahu ke belakang, lalu rileks 8 kali.",
      "Napas: tarik 4 hitungan, buang 4 hitungan.",
    ],
    affirmation: "Nilai diriku tidak perlu dibuktikan hari ini.",
    mudras: ["Hakini Mudra", "Surya Mudra", "Kubera Mudra"],
  },
  "Family Dynamics": {
    practices: [
      "Duduk 5 menit dan bayangkan batas lembut di sekitar tubuhmu.",
      "Gerakan ringan: putar leher perlahan ke kanan dan kiri masing-masing 5 kali.",
      "Napas: tarik 4 hitungan, buang sambil merilekskan rahang.",
    ],
    affirmation: "Aku boleh mencintai tanpa memikul semuanya.",
    mudras: ["Apana Mudra", "Anjali Mudra", "Shuni Mudra"],
  },
  "Karmic Lessons": {
    practices: [
      "Duduk 5 menit dan tanyakan pelajaran apa yang sedang berulang dengan tenang.",
      "Gerakan ringan: child pose atau lipatan tubuh lembut selama 1 menit.",
      "Napas: tarik 4 hitungan, buang 8 hitungan.",
    ],
    affirmation: "Aku belajar tanpa harus menghukum diriku.",
    mudras: ["Gyan Mudra", "Shuni Mudra", "Apana Mudra"],
  },
  "Ancestral Patterns": {
    practices: [
      "Duduk 5 menit dan rasakan punggungmu ditopang oleh tanah atau kursi.",
      "Gerakan ringan: tap lembut dada dan lengan selama 2 menit.",
      "Napas: tarik dari hidung, buang lewat mulut perlahan.",
    ],
    affirmation: "Aku menghormati asal-usulku sambil memilih jalan yang lebih sadar.",
    mudras: ["Prithvi Mudra", "Yoni Mudra", "Shuni Mudra"],
  },
  Forgiveness: {
    practices: [
      "Duduk 5 menit dan letakkan tangan di area tubuh yang paling membutuhkan ruang.",
      "Gerakan ringan: goyangkan tangan dan kaki perlahan selama 90 detik.",
      "Napas: tarik 4 hitungan, buang sambil melembutkan dada.",
    ],
    affirmation: "Aku boleh melepaskan sedikit demi sedikit.",
    mudras: ["Apana Mudra", "Vayu Mudra", "Anjali Mudra"],
  },
  "Purpose & Calling": {
    practices: [
      "Duduk 5 menit dan rasakan satu langkah kecil yang terasa hidup.",
      "Gerakan ringan: mountain pose 1 menit, lalu jalan perlahan 2 menit.",
      "Napas: tarik 5 hitungan, buang 5 hitungan.",
    ],
    affirmation: "Aku bisa mengikuti panggilanku satu langkah sadar hari ini.",
    mudras: ["Hakini Mudra", "Kubera Mudra", "Gyan Mudra"],
  },
  "Nervous System Grounding": {
    practices: [
      "Duduk 5 menit dan sebutkan 5 hal yang kamu lihat di sekitarmu.",
      "Gerakan ringan: tekan telapak kaki ke lantai 10 kali.",
      "Napas: tarik 4 hitungan, buang 7 hitungan.",
    ],
    affirmation: "Tubuhku boleh kembali ke ritme yang lebih aman.",
    mudras: ["Prithvi Mudra", "Vayu Mudra", "Yoni Mudra"],
  },
  "Emotional Release": {
    practices: [
      "Duduk 5 menit dan izinkan emosi hadir tanpa harus diberi cerita panjang.",
      "Gerakan ringan: shake lembut bahu, tangan, dan kaki selama 2 menit.",
      "Napas: tarik lewat hidung, buang panjang lewat mulut.",
    ],
    affirmation: "Aku boleh merasakan tanpa tenggelam di dalamnya.",
    mudras: ["Apana Mudra", "Yoni Mudra", "Vayu Mudra"],
  },
  "Body Safety": {
    practices: [
      "Duduk 5 menit sambil merasakan titik kontak tubuh dengan kursi atau lantai.",
      "Gerakan ringan: body scan dari kepala sampai kaki selama 3 menit.",
      "Napas: tarik 4 hitungan, buang 6 hitungan.",
    ],
    affirmation: "Aku sedang belajar hadir di tubuhku dengan aman.",
    mudras: ["Gyan Mudra", "Prithvi Mudra", "Yoni Mudra"],
  },
};

function getDateSeed(date = new Date()): number {
  return Number(date.toISOString().slice(0, 10).replaceAll("-", ""));
}

function chooseTheme(input: CreateDailyMeditationPracticeInput): MeditationTheme {
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: "id",
    profile: input.profile ?? null,
    blueprint: input.blueprint ?? null,
  });
  const synthesisText = [
    synthesis.blueprintSummary,
    ...synthesis.coreNeeds,
    synthesis.practiceThemes.grounding,
    synthesis.practiceThemes.reflection,
    synthesis.practiceThemes.action,
  ].join(" ").toLowerCase();

  const prioritized: MeditationTheme[] = [];
  if (synthesisText.includes("body") || synthesisText.includes("tubuh") || synthesisText.includes("ground")) prioritized.push("Body Safety", "Nervous System Grounding");
  if (synthesisText.includes("emotion") || synthesisText.includes("emotional") || synthesisText.includes("heart")) prioritized.push("Emotional Release", "Love Block");
  if (synthesisText.includes("structure") || synthesisText.includes("responsibility") || synthesisText.includes("long-term")) prioritized.push("Repeating Patterns", "Nervous System Grounding");
  if (synthesisText.includes("money") || synthesisText.includes("power") || synthesisText.includes("leadership")) prioritized.push("Money Block", "Self Worth");
  if (synthesisText.includes("expression") || synthesisText.includes("communication")) prioritized.push("Self Worth", "Purpose & Calling");
  if (synthesisText.includes("service") || synthesisText.includes("compassion") || synthesisText.includes("healing")) prioritized.push("Forgiveness", "Inner Child");
  if (synthesisText.includes("shadow") || synthesisText.includes("transform") || synthesisText.includes("release")) prioritized.push("Emotional Release", "Forgiveness");

  const themePool = prioritized.length > 0 ? prioritized : THEMES;
  const seed = getDateSeed()
    + synthesis.coreNeeds.join("").length
    + synthesis.practiceThemes.grounding.length
    + synthesis.practiceThemes.reflection.length
    + synthesis.practiceThemes.action.length
    + (input.previousMeditationEntries?.length ?? 0)
    + (input.previousJournalEntries?.length ?? 0);

  return themePool[seed % themePool.length];
}

function adaptPractices(
  input: CreateDailyMeditationPracticeInput,
  base: { practices: string[]; affirmation: string; mudra: MudraGuide | null },
): { practices: string[]; affirmation: string; mudra: MudraGuide | null } {
  const practices = [...base.practices];

  practices[0] = "Duduk 5-7 menit dan perhatikan bagian tubuh mana yang paling meminta pelan hari ini.";
  practices[1] = "Gerakan ringan 2 menit, lalu berhenti sejenak sebelum memilih ritme yang paling bisa kamu jaga.";

  const mudraPracticeText = base.mudra
    ? `Mudra: ${base.mudra.name} selama ${base.mudra.duration}.`
    : "Ambil posisi tangan yang nyaman.";
  practices.splice(1, 0, mudraPracticeText);

  return { ...base, practices };
}

export function createDailyMeditationPractice(input: CreateDailyMeditationPracticeInput): DailyMeditationPractice {
  const theme = chooseTheme(input);
  const themeData = THEME_PRACTICES[theme];
  const lastMudra = input.previousMeditationEntries?.[0]?.mudraName;
  const availableMudras = themeData.mudras.filter((mudra) => mudra !== lastMudra);
  const mudraPool = availableMudras.length ? availableMudras : themeData.mudras;
  const mudraName = mudraPool[(getDateSeed() + theme.length + (input.previousMeditationEntries?.length ?? 0)) % mudraPool.length];
  const mudraGuide = getMudraGuide(mudraName) ?? null;

  const basePractice = {
    practices: themeData.practices,
    affirmation: themeData.affirmation,
    mudra: mudraGuide,
  };

  const adapted = adaptPractices(input, basePractice);

  return {
    theme,
    practices: adapted.practices,
    mudra: adapted.mudra,
    affirmation: adapted.affirmation,
  };
}

export function loadMeditationEntries(): MeditationEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const scopedKey = getScopedMeditationKey();
    const parsed = readOwnedCacheArray<MeditationEntry>(scopedKey, "meditationEntries");
    
    // Validate entries have date field; if not, clear cache for fresh generation
    const today = new Date().toISOString().split('T')[0];
    if (parsed.length > 0 && parsed[0] && typeof parsed[0] === 'object') {
      const firstEntry = parsed[0] as Record<string, unknown>;
      if (!firstEntry.date || typeof firstEntry.date !== 'string' || !firstEntry.date.startsWith(today)) {
        // Stale data, return empty to force regeneration
        return [];
      }
    }
    
    return parsed;
  } catch {
    return [];
  }
}

export function saveMeditationEntry(entry: MeditationEntry): MeditationEntry[] {
  const entries = loadMeditationEntries();
  const nextEntry = withActiveUid(entry);
  const nextEntries = [nextEntry, ...entries];
  const scopedKey = getScopedMeditationKey();
  window.localStorage.setItem(scopedKey, JSON.stringify(nextEntries));

  if (scopedKey !== MEDITATION_STORAGE_KEY) {
    window.localStorage.removeItem(MEDITATION_STORAGE_KEY);
  }

  saveLastActivity("meditation");
  refreshHealingInsights();
  refreshJourneyData();
  refreshCompiledInnerwork();
  refreshProgressData();

  // Sync to Firestore for Journey Progress
  const uid = auth.currentUser?.uid;
  if (uid) {
    void dailyStateRepository.saveDailyState(uid, getLocalDateKey(), {
      meditationDone: true,
      innerworkDone: true,
    }).catch(err => console.error("[SYNC_MEDITATION_ERROR]", err));
  }

  return nextEntries;
}

export function getLatestMeditationEntry(entries: MeditationEntry[]): MeditationEntry | null {
  return entries[0] ?? null;
}

export function createMeditationReflection(input: {
  theme: MeditationTheme;
  emotionalState: string;
  bodySignals: string[];
  bodyReflection: string;
  blueprint?: UnknownRecord | null;
}): MeditationReflection {
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: "id",
    profile: null,
    blueprint: input.blueprint ?? null,
  });
  const bodyLine = input.bodySignals.length > 0
    ? `Sinyal seperti ${input.bodySignals.join(", ").toLowerCase()} bisa menjadi undangan untuk mendengar tubuhmu lebih pelan.`
    : "Tidak ada sensasi khusus juga bisa menjadi tanda bahwa tubuhmu sedang memproses dengan caranya sendiri.";

  return {
    insight: `Respons tubuhmu hari ini menunjukkan ada bagian dalam dirimu yang sedang meminta diperlakukan dengan lebih lembut. ${synthesis.blueprintSummary} ${bodyLine}`,
    nextFocus: `Besok, perhatikan kapan tubuhmu mulai berubah sebelum pikiranmu menyadari alasannya. Jika rasa "${input.emotionalState || "campur aduk"}" muncul, beri napasmu ruang sebelum mengambil tindakan.`,
  };
}
