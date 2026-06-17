import { refreshHealingInsights } from "@/lib/healing/createHealingInsights";
import { refreshJourneyData } from "@/lib/journey/createJourneyData";
import { refreshCompiledInnerwork } from "@/lib/ai/compileUserInnerwork";
import { refreshProgressData } from "@/lib/insights/createInsightProgress";
import { saveLastActivity } from "@/lib/activity/getLastActivity";
import { readOwnedCacheArray, withActiveUid } from "@/lib/storage/derivedCacheOwnership";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { auth } from "@/lib/firebase/firebase";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";

export const JOURNAL_STORAGE_KEY = "bhumiJournalEntries";

function getScopedJournalKey(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) return JOURNAL_STORAGE_KEY; // Fallback to unscoped for legacy or unauthenticated
  return `${JOURNAL_STORAGE_KEY}:${uid}`;
}

export type JournalTheme =
  | "Inner Child"
  | "Love Block"
  | "Money Block"
  | "Repeating Patterns"
  | "Self Worth"
  | "Family Dynamics"
  | "Karmic Lessons"
  | "Ancestral Patterns"
  | "Forgiveness"
  | "Purpose & Calling";

export type BlueprintJournalContext = {
  birthDate?: string | null;
  sunSign?: string | null;
  lifePathNumber?: number | null;
  humanDesignType?: string | null;
  arcanaCenter?: number | null;
  natalChart?: unknown;
  destinyMatrix?: unknown;
};

export type JournalPrompt = {
  theme: JournalTheme;
  dashboardQuestion: string;
  questions: string[];
};

export type JournalInsight = {
  insight: string;
  tomorrowFocus: string;
};

export type LocalJournalEntry = {
  uid?: string;
  date: string;
  theme: JournalTheme;
  questions: string[];
  journalText: string;
  emotionalState: string;
  bodySignals: string[];
  createdAt: string;
  insight: string;
  tomorrowFocus: string;
  sourceContext?: {
    lifePathNumber?: number | null;
    humanDesignType?: string | null;
    arcanaCenter?: number | null;
    sunSign?: string | null;
    previousEntryCount: number;
  };
};

const THEME_BANK: Record<JournalTheme, { dashboardQuestion: string; questions: string[] }> = {
  "Inner Child": {
    dashboardQuestion: "Kapan terakhir kali kamu merasa harus kuat padahal sebenarnya ingin didengar?",
    questions: [
      "Apa kenangan masa kecil yang masih sering muncul dalam pikiranmu?",
      "Apa yang paling ingin didengar oleh dirimu saat kecil?",
      "Bagian mana dari dirimu yang masih berusaha mendapatkan pengakuan?",
    ],
  },
  "Love Block": {
    dashboardQuestion: "Pola apa yang sering muncul saat kamu ingin mencintai atau menerima cinta?",
    questions: [
      "Apa yang biasanya membuatmu menahan diri saat ingin membuka hati?",
      "Kapan kamu merasa cinta harus diperjuangkan dengan mengorbankan dirimu?",
      "Bentuk cinta seperti apa yang sebenarnya terasa aman untukmu?",
    ],
  },
  "Money Block": {
    dashboardQuestion: "Keyakinan lama apa tentang uang yang masih memengaruhi pilihanmu hari ini?",
    questions: [
      "Apa kalimat tentang uang yang paling sering kamu dengar saat tumbuh?",
      "Di bagian mana kamu merasa bersalah ketika menerima lebih banyak?",
      "Apa arti rasa aman finansial jika tidak harus dibuktikan pada siapa pun?",
    ],
  },
  "Repeating Patterns": {
    dashboardQuestion: "Pola apa yang terasa berulang dalam hidupmu, meski bentuk situasinya berbeda?",
    questions: [
      "Situasi apa yang belakangan terasa seperti pengulangan dari masa lalu?",
      "Respons otomatis apa yang biasanya muncul sebelum kamu sempat memilih dengan sadar?",
      "Apa pilihan kecil yang bisa memutus pola itu hari ini?",
    ],
  },
  "Self Worth": {
    dashboardQuestion: "Di mana kamu masih mengukur nilai dirimu dari respons orang lain?",
    questions: [
      "Kapan kamu merasa harus menjadi berguna agar tetap layak dicintai?",
      "Apa kualitas dirimu yang sering kamu kecilkan?",
      "Bagaimana rasanya jika nilai dirimu tidak perlu dibuktikan hari ini?",
    ],
  },
  "Family Dynamics": {
    dashboardQuestion: "Peran keluarga apa yang masih terbawa dalam caramu mengambil keputusan?",
    questions: [
      "Peran apa yang paling sering kamu jalani dalam keluarga?",
      "Bagian mana dari peran itu yang masih terasa berat sampai sekarang?",
      "Batas sehat apa yang ingin kamu bangun tanpa kehilangan kasih?",
    ],
  },
  "Karmic Lessons": {
    dashboardQuestion: "Pelajaran apa yang terus datang sampai kamu benar-benar mendengarnya?",
    questions: [
      "Tema hidup apa yang terasa terus mengulang dalam perjalananmu?",
      "Apa yang sedang diminta hidup untuk kamu lepaskan atau pelajari?",
      "Jika pengalaman ini adalah guru, pesan apa yang ia bawa?",
    ],
  },
  "Ancestral Patterns": {
    dashboardQuestion: "Pola leluhur apa yang ingin kamu hormati tanpa harus kamu lanjutkan?",
    questions: [
      "Pola keluarga apa yang kamu sadari hidup di dalam keputusanmu?",
      "Apa beban yang mungkin bukan sepenuhnya milikmu?",
      "Warisan batin apa yang ingin kamu ubah menjadi kebijaksanaan?",
    ],
  },
  Forgiveness: {
    dashboardQuestion: "Apa yang siap kamu lepaskan tanpa harus membenarkan apa yang terjadi?",
    questions: [
      "Siapa atau bagian mana dari dirimu yang masih menunggu pengampunan?",
      "Apa rasa sakit yang selama ini kamu pegang agar tetap merasa aman?",
      "Apa bentuk melepaskan yang terasa realistis untuk hari ini?",
    ],
  },
  "Purpose & Calling": {
    dashboardQuestion: "Panggilan apa yang pelan-pelan meminta ruang lebih besar dalam hidupmu?",
    questions: [
      "Aktivitas apa yang membuatmu merasa lebih hidup dan terhubung?",
      "Ketakutan apa yang muncul saat kamu membayangkan hidup lebih selaras dengan panggilanmu?",
      "Langkah kecil apa yang bisa kamu ambil tanpa harus menunggu semuanya sempurna?",
    ],
  },
};

const THEMES = Object.keys(THEME_BANK) as JournalTheme[];

function getDateSeed(date: Date): number {
  return Number(date.toISOString().slice(0, 10).replaceAll("-", ""));
}

export function getTodayJournalPrompt(
  context: BlueprintJournalContext,
  previousEntries: LocalJournalEntry[] = [],
  date = new Date(),
): JournalPrompt {
  const lifePathSeed = context.lifePathNumber ?? 0;
  const arcanaSeed = context.arcanaCenter ?? 0;
  const designSeed = context.humanDesignType?.length ?? 0;
  const previousSeed = previousEntries.length;
  const themeIndex = (getDateSeed(date) + lifePathSeed + arcanaSeed + designSeed + previousSeed) % THEMES.length;
  const theme = THEMES[themeIndex];

  return {
    theme,
    ...THEME_BANK[theme],
  };
}

export function loadLocalJournalEntries(): LocalJournalEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const scopedKey = getScopedJournalKey();
    const parsed = readOwnedCacheArray<LocalJournalEntry>(scopedKey, "journalEntries");
    
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

export function saveLocalJournalEntry(entry: LocalJournalEntry): LocalJournalEntry[] {
  const entries = loadLocalJournalEntries();
  const nextEntry = withActiveUid(entry);
  const nextEntries = [nextEntry, ...entries];
  const scopedKey = getScopedJournalKey();
  window.localStorage.setItem(scopedKey, JSON.stringify(nextEntries));

  // Cleanup forbidden unscoped key
  if (scopedKey !== JOURNAL_STORAGE_KEY) {
    window.localStorage.removeItem(JOURNAL_STORAGE_KEY);
  }

  saveLastActivity("journal");
  refreshHealingInsights();
  refreshJourneyData();
  refreshCompiledInnerwork();
  refreshProgressData();

  // Sync to Firestore for Journey Progress
  const uid = auth.currentUser?.uid;
  if (uid) {
    void dailyStateRepository.saveDailyState(uid, getLocalDateKey(), {
      journalingDone: true,
    }).catch(err => console.error("[SYNC_JOURNAL_ERROR]", err));
  }

  return nextEntries;
}

export function getLatestJournalEntry(entries: LocalJournalEntry[]): LocalJournalEntry | null {
  return entries[0] ?? null;
}

export function generateLocalJournalInsight(input: {
  theme: JournalTheme;
  journalText: string;
  emotionalState: string;
  bodySignals: string[];
  context: BlueprintJournalContext;
}): JournalInsight {
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: "id",
    profile: null,
    blueprint: {
      lifePath: { number: input.context.lifePathNumber },
      humanDesign: { type: input.context.humanDesignType },
      destinyMatrix: { arcanaCenter: input.context.arcanaCenter },
      astrology: { sunSign: input.context.sunSign },
      natalChart: input.context.natalChart,
    },
  });

  const bodyLine = input.bodySignals.length > 0
    ? `Tubuhmu memberi sinyal melalui ${input.bodySignals.join(", ").toLowerCase()}, jadi proses ini layak didekati dengan lembut.`
    : "Tubuhmu belum menunjukkan sinyal khusus, dan itu juga informasi yang berharga.";

  return {
    insight: `Dari tulisanmu, tema ${input.theme} tampak sedang meminta ruang untuk didengar tanpa dihakimi. Sintesis hari ini mengarah pada ${synthesis.practiceThemes.reflection}, sehingga kamu mungkin sedang belajar merespons hidup dari kesadaran, bukan dari kebiasaan lama. ${bodyLine}`,
    tomorrowFocus: `Besok, perhatikan momen ketika emosi "${input.emotionalState || "campur aduk"}" muncul. Ambil jeda kecil sebelum bertindak, lalu tanyakan: kebutuhan apa yang sebenarnya ingin aku dengar sekarang?`,
  };
}
