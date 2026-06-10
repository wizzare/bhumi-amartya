import { loadLocalJournalEntries, type LocalJournalEntry } from "@/lib/journal/localJournal";
import { loadMeditationEntries, type MeditationEntry } from "@/lib/meditation/createDailyMeditationPractice";
import { loadAudioHealingEntries, type AudioHealingEntry } from "@/lib/audioHealing/localAudioHealing";
import { readOwnedCacheObject, writeOwnedCacheObject } from "@/lib/storage/derivedCacheOwnership";
import { auth } from "@/lib/firebase/firebase";

export const HEALING_MEMORY_STORAGE_KEY = "bhumiHealingMemory";

function getScopedHealingMemoryKey(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) return HEALING_MEMORY_STORAGE_KEY;
  return `${HEALING_MEMORY_STORAGE_KEY}:${uid}`;
}

export type HealingStage = "Awareness" | "Acceptance" | "Release" | "Integration" | "Service";

export type HealingMemoryOutput = {
  uid?: string;
  firstJournalDate: string | null;
  firstMeditationDate: string | null;
  firstAudioHealingDate: string | null;
  currentStreak: number;
  completedPractices: number;
  memoryReflection: string;
  dominantThemes: Array<{ theme: string; count: number }>;
  recurringPatterns: string[];
  recurringEmotions: Array<{ emotion: string; count: number }>;
  recurringBodySignals: Array<{ signal: string; count: number }>;
  growthIndicators: string[];
  healingStage: HealingStage;
  healingStageExplanation: string;
  recommendedFocus: string;
  lastUpdated: string;
};

const HEALING_STAGE_DESCRIPTIONS: Record<HealingStage, string> = {
  Awareness: "Kamu sedang dalam tahap mengenali pola dan mulai melihat apa yang selama ini tersembunyi.",
  Acceptance: "Kamu sedang belajar menerima apa yang muncul tanpa menghakimi atau menolaknya.",
  Release: "Kamu sedang melepaskan beban lama dengan lembut, sedikit demi sedikit.",
  Integration: "Kamu sedang menyatukan pembelajaran baru ke dalam cara hidupmu sehari-hari.",
  Service: "Kamu sedang berbagi kebijaksanaan dari perjalananmu untuk membantu orang lain.",
};

function countThemes(
  journalEntries: LocalJournalEntry[],
  meditationEntries: MeditationEntry[],
): Array<{ theme: string; count: number }> {
  const themeMap = new Map<string, number>();

  journalEntries.forEach((entry) => {
    const current = themeMap.get(entry.theme) || 0;
    themeMap.set(entry.theme, current + 1);
  });

  meditationEntries.forEach((entry) => {
    const current = themeMap.get(entry.theme) || 0;
    themeMap.set(entry.theme, current + 1);
  });

  return Array.from(themeMap.entries())
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function entryDate(entry: { date?: string; dateCreated?: string; createdAt?: string; completedAt?: string }): string | null {
  const value = entry.date ?? entry.dateCreated ?? entry.createdAt ?? entry.completedAt;
  return typeof value === "string" && value.trim() ? value.slice(0, 10) : null;
}

function firstEntryDate(entries: Array<{ date?: string; dateCreated?: string; createdAt?: string }>): string | null {
  return entries
    .map(entryDate)
    .filter((date): date is string => Boolean(date))
    .sort((a, b) => a.localeCompare(b))[0] ?? null;
}

function calculateCurrentStreak(entries: Array<{ date?: string; dateCreated?: string; createdAt?: string }>): number {
  const dates = new Set(entries.map(entryDate).filter((date): date is string => Boolean(date)));
  let streak = 0;
  const cursor = new Date();

  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function daysSince(date: string | null): number | null {
  if (!date) return null;
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00");
  const start = new Date(`${date}T00:00:00`);
  return Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
}

function readJournalText(entry: LocalJournalEntry | undefined): string | null {
  if (!entry) return null;
  const record = entry as unknown as Record<string, unknown>;
  const candidate = record.journalText ?? record.reflectionText ?? record.bodyReflection ?? record.emotionalState;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}

function buildMemoryReflection(journalEntries: LocalJournalEntry[], dominantThemes: Array<{ theme: string; count: number }>): string {
  const firstDate = firstEntryDate(journalEntries);
  const days = daysSince(firstDate);
  const firstJournal = journalEntries.find((entry) => entryDate(entry) === firstDate);
  const firstText = readJournalText(firstJournal);
  const currentThread = dominantThemes[0]?.theme ?? "satu langkah kecil";

  if (days !== null && firstText) {
    return `${days} hari yang lalu kamu menuliskan "${firstText.slice(0, 90)}". Hari ini terlihat ada ${currentThread} yang mulai membentuk jejak baru.`;
  }

  if (days !== null) {
    return `${days} hari yang lalu perjalananmu mulai tercatat. Hari ini, jejak kecil itu mulai menjadi sesuatu yang bisa kamu lihat kembali.`;
  }

  return "Bhumi akan mulai mengingat perjalananmu setelah kamu meninggalkan refleksi, meditasi, audio healing, atau praktik pertamamu.";
}

function extractRecurringEmotions(
  journalEntries: LocalJournalEntry[],
  meditationEntries: MeditationEntry[],
  audioHealingEntries: AudioHealingEntry[],
): Array<{ emotion: string; count: number }> {
  const emotionMap = new Map<string, number>();

  journalEntries.forEach((entry) => {
    if (entry.emotionalState) {
      const current = emotionMap.get(entry.emotionalState) || 0;
      emotionMap.set(entry.emotionalState, current + 1);
    }
  });

  meditationEntries.forEach((entry) => {
    if (entry.emotionalState) {
      const current = emotionMap.get(entry.emotionalState) || 0;
      emotionMap.set(entry.emotionalState, current + 1);
    }
  });

  audioHealingEntries.forEach((entry) => {
    if (entry.emotionalState) {
      const current = emotionMap.get(entry.emotionalState) || 0;
      emotionMap.set(entry.emotionalState, current + 1);
    }
  });

  return Array.from(emotionMap.entries())
    .map(([emotion, count]) => ({ emotion, count }))
    .filter((item) => item.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function extractRecurringBodySignals(
  journalEntries: LocalJournalEntry[],
  meditationEntries: MeditationEntry[],
  audioHealingEntries: AudioHealingEntry[],
): Array<{ signal: string; count: number }> {
  const signalMap = new Map<string, number>();

  journalEntries.forEach((entry) => {
    entry.bodySignals.forEach((signal) => {
      const current = signalMap.get(signal) || 0;
      signalMap.set(signal, current + 1);
    });
  });

  meditationEntries.forEach((entry) => {
    entry.bodySignals.forEach((signal) => {
      const current = signalMap.get(signal) || 0;
      signalMap.set(signal, current + 1);
    });
  });

  audioHealingEntries.forEach((entry) => {
    entry.bodySignals.forEach((signal) => {
      const current = signalMap.get(signal) || 0;
      signalMap.set(signal, current + 1);
    });
  });

  return Array.from(signalMap.entries())
    .map(([signal, count]) => ({ signal, count }))
    .filter((item) => item.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function identifyRecurringPatterns(
  journalEntries: LocalJournalEntry[],
  meditationEntries: MeditationEntry[],
): string[] {
  const patterns: string[] = [];
  const themeCount = new Map<string, number>();

  journalEntries.forEach((entry) => {
    const current = themeCount.get(entry.theme) || 0;
    themeCount.set(entry.theme, current + 1);
  });

  meditationEntries.forEach((entry) => {
    const current = themeCount.get(entry.theme) || 0;
    themeCount.set(entry.theme, current + 1);
  });

  // Identify themes that appear 3+ times
  themeCount.forEach((count, theme) => {
    if (count >= 3) {
      patterns.push(`"${theme}" muncul ${count}x dalam perjalananmu`);
    }
  });

  // Check for consecutive similar themes
  const recentThemes = [
    ...journalEntries.slice(0, 3).map((e) => e.theme),
    ...meditationEntries.slice(0, 3).map((e) => e.theme),
  ];
  const uniqueRecent = new Set(recentThemes);
  if (uniqueRecent.size <= 2 && recentThemes.length >= 3) {
    patterns.push("Kamu sedang fokus mendalam pada satu atau dua hal utama");
  }

  return patterns.slice(0, 3);
}

function identifyGrowthIndicators(
  journalEntries: LocalJournalEntry[],
  meditationEntries: MeditationEntry[],
  audioHealingEntries: AudioHealingEntry[],
): string[] {
  const indicators: string[] = [];
  const totalActivities = journalEntries.length + meditationEntries.length + audioHealingEntries.length;

  if (totalActivities >= 7) {
    indicators.push("Konsistensi innerwork menunjukkan komitmen pada proses penyembuhan");
  }

  if (journalEntries.length >= 3) {
    indicators.push("Kemampuan refleksi diri semakin berkembang");
  }

  if (meditationEntries.length >= 3) {
    indicators.push("Praktik mindfulness mulai menjadi bagian dari ritme harianmu");
  }

  if (audioHealingEntries.length >= 2) {
    indicators.push("Keterbukaan untuk menerima healing melalui berbagai modalitas");
  }

  // Check for variety in themes
  const allThemes = new Set([
    ...journalEntries.map((e) => e.theme),
    ...meditationEntries.map((e) => e.theme),
  ]);
  if (allThemes.size >= 4) {
    indicators.push("Eksplorasi berbagai aspek diri menunjukkan keberanian untuk melihat lebih dalam");
  }

  return indicators.slice(0, 4);
}

function determineHealingStage(
  journalEntries: LocalJournalEntry[],
  meditationEntries: MeditationEntry[],
  audioHealingEntries: AudioHealingEntry[],
  dominantThemes: Array<{ theme: string; count: number }>,
): HealingStage {
  const totalActivities = journalEntries.length + meditationEntries.length + audioHealingEntries.length;

  // Service: High activity + diverse themes + consistent practice
  if (totalActivities >= 20 && dominantThemes.length >= 4) {
    return "Service";
  }

  // Integration: Moderate-high activity + balanced themes
  if (totalActivities >= 12 && dominantThemes.length >= 3) {
    return "Integration";
  }

  // Release: Moderate activity + focused themes (especially forgiveness, release-related)
  const releaseThemes = ["Forgiveness", "Emotional Release", "Ancestral Patterns"];
  const hasReleaseTheme = dominantThemes.some((t) => releaseThemes.includes(t.theme));
  if (totalActivities >= 6 && hasReleaseTheme) {
    return "Release";
  }

  // Acceptance: Some activity + recurring patterns identified
  if (totalActivities >= 4) {
    return "Acceptance";
  }

  // Awareness: Beginning stage
  return "Awareness";
}

function generateRecommendedFocus(
  healingStage: HealingStage,
  dominantThemes: Array<{ theme: string; count: number }>,
  recurringEmotions: Array<{ emotion: string; count: number }>,
): string {
  const topTheme = dominantThemes[0]?.theme;
  const topEmotion = recurringEmotions[0]?.emotion;

  switch (healingStage) {
    case "Awareness":
      return `Fokus pada mengenali pola yang muncul. ${topTheme ? `"${topTheme}" bisa menjadi pintu masuk untuk eksplorasi lebih dalam.` : "Mulai dengan journaling untuk melihat apa yang sedang hadir."}`;
    
    case "Acceptance":
      return `Beri ruang untuk menerima apa yang muncul tanpa menghakimi. ${topEmotion ? `Emosi "${topEmotion}" yang sering muncul layak didengar dengan lembut.` : "Praktikkan self-compassion dalam setiap langkah."}`;
    
    case "Release":
      return `Saatnya melepaskan dengan lembut. ${topTheme ? `"${topTheme}" mungkin siap untuk dilihat dengan cara baru.` : "Gunakan meditasi dan audio healing untuk membantu proses pelepasan."}`;
    
    case "Integration":
      return `Integrasikan pembelajaran ke dalam kehidupan sehari-hari. ${topTheme ? `Terapkan insight dari "${topTheme}" dalam pilihan kecil harianmu.` : "Perhatikan bagaimana perubahan kecil membawa dampak besar."}`;
    
    case "Service":
      return "Bagikan kebijaksanaan dari perjalananmu. Kehadiranmu yang lebih utuh bisa menjadi inspirasi bagi orang lain.";
    
    default:
      return "Lanjutkan perjalanan dengan penuh kesadaran dan kelembutan pada diri sendiri.";
  }
}

export function createHealingMemory(): HealingMemoryOutput {
  const journalEntries = loadLocalJournalEntries();
  const meditationEntries = loadMeditationEntries();
  const audioHealingEntries = loadAudioHealingEntries();
  const allEntries = [...journalEntries, ...meditationEntries, ...audioHealingEntries];

  const dominantThemes = countThemes(journalEntries, meditationEntries);
  const recurringEmotions = extractRecurringEmotions(journalEntries, meditationEntries, audioHealingEntries);
  const recurringBodySignals = extractRecurringBodySignals(journalEntries, meditationEntries, audioHealingEntries);
  const recurringPatterns = identifyRecurringPatterns(journalEntries, meditationEntries);
  const growthIndicators = identifyGrowthIndicators(journalEntries, meditationEntries, audioHealingEntries);
  const healingStage = determineHealingStage(journalEntries, meditationEntries, audioHealingEntries, dominantThemes);
  const healingStageExplanation = HEALING_STAGE_DESCRIPTIONS[healingStage];
  const recommendedFocus = generateRecommendedFocus(healingStage, dominantThemes, recurringEmotions);

  return {
    firstJournalDate: firstEntryDate(journalEntries),
    firstMeditationDate: firstEntryDate(meditationEntries),
    firstAudioHealingDate: firstEntryDate(audioHealingEntries),
    currentStreak: calculateCurrentStreak(allEntries),
    completedPractices: allEntries.length,
    memoryReflection: buildMemoryReflection(journalEntries, dominantThemes),
    dominantThemes,
    recurringPatterns,
    recurringEmotions,
    recurringBodySignals,
    growthIndicators,
    healingStage,
    healingStageExplanation,
    recommendedFocus,
    lastUpdated: new Date().toISOString(),
  };
}

export function loadHealingMemory(): HealingMemoryOutput | null {
  if (typeof window === "undefined") return null;

  try {
    const scopedKey = getScopedHealingMemoryKey();
    const memory = readOwnedCacheObject<HealingMemoryOutput>(scopedKey, "healingMemory");
    console.log("[HEALING MEMORY SOURCE]", {
      source: memory ? "local-derived-cache" : "none",
      uid: memory?.uid ?? null,
    });
    return memory;
  } catch {
    return null;
  }
}

export function refreshHealingMemory(): HealingMemoryOutput {
  const memory = createHealingMemory();
  if (typeof window !== "undefined") {
    const scopedKey = getScopedHealingMemoryKey();
    const ownedMemory = writeOwnedCacheObject(scopedKey, memory, "healingMemory");

    if (scopedKey !== HEALING_MEMORY_STORAGE_KEY) {
      window.localStorage.removeItem(HEALING_MEMORY_STORAGE_KEY);
    }

    console.log("[HEALING MEMORY SOURCE]", {
      source: "local-derived-refresh",
      uid: ownedMemory.uid ?? null,
    });
    return ownedMemory;
  }
  return memory;
}
