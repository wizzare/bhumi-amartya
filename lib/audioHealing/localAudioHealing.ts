import { refreshHealingInsights } from "@/lib/healing/createHealingInsights";
import { refreshJourneyData } from "@/lib/journey/createJourneyData";
import { refreshCompiledInnerwork } from "@/lib/ai/compileUserInnerwork";
import { refreshProgressData } from "@/lib/insights/createInsightProgress";
import { saveLastActivity } from "@/lib/activity/getLastActivity";
import { readOwnedCacheArray, withActiveUid } from "@/lib/storage/derivedCacheOwnership";
import { auth } from "@/lib/firebase/firebase";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";

export const AUDIO_HEALING_STORAGE_KEY = "bhumiAudioHealingEntries";

function getScopedAudioKey(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) return AUDIO_HEALING_STORAGE_KEY;
  return `${AUDIO_HEALING_STORAGE_KEY}:${uid}`;
}

export const AUDIO_HEALING_PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLN0jIpB58Ed61d4yMXRCeStxro5dJJ-qA";
export const AUDIO_HEALING_EMBED_URL = "https://www.youtube.com/embed/videoseries?list=PLN0jIpB58Ed61d4yMXRCeStxro5dJJ-qA";

export type AudioHealingEntry = {
  uid?: string;
  id: string;
  date: string;
  playlistUrl: string;
  emotionalState: string;
  bodySignals: string[];
  reflectionText: string;
  createdAt: string;
  insight: string;
  nextFocus: string;
};

export type AudioHealingReflection = {
  insight: string;
  nextFocus: string;
};

export function loadAudioHealingEntries(): AudioHealingEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const scopedKey = getScopedAudioKey();
    const parsed = readOwnedCacheArray<AudioHealingEntry>(scopedKey, "audioHealingEntries");
    
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

export function saveAudioHealingEntry(entry: AudioHealingEntry): AudioHealingEntry[] {
  const entries = loadAudioHealingEntries();
  const nextEntry = withActiveUid(entry);
  const nextEntries = [nextEntry, ...entries];
  const scopedKey = getScopedAudioKey();
  window.localStorage.setItem(scopedKey, JSON.stringify(nextEntries));

  if (scopedKey !== AUDIO_HEALING_STORAGE_KEY) {
    window.localStorage.removeItem(AUDIO_HEALING_STORAGE_KEY);
  }

  saveLastActivity("audioHealing");
  refreshHealingInsights();
  refreshJourneyData();
  refreshCompiledInnerwork();
  refreshProgressData();

  // Sync to Firestore for Journey Progress
  const uid = auth.currentUser?.uid;
  if (uid) {
    void dailyStateRepository.saveDailyState(uid, getLocalDateKey(), {
      audioHealingDone: true,
      innerworkDone: true,
    }).catch(err => console.error("[SYNC_AUDIO_ERROR]", err));
  }

  return nextEntries;
}

export function getLatestAudioHealingEntry(entries: AudioHealingEntry[]): AudioHealingEntry | null {
  return entries[0] ?? null;
}

export function createAudioHealingReflection(input: {
  emotionalState: string;
  bodySignals: string[];
  reflectionText: string;
}): AudioHealingReflection {
  const bodyLine = input.bodySignals.length > 0
    ? `Tubuhmu memberi sinyal lewat ${input.bodySignals.join(", ").toLowerCase()}, jadi respons itu layak didengar pelan-pelan.`
    : "Tidak ada sensasi khusus juga bisa menjadi bagian dari cara tubuhmu memproses audio hari ini.";
  const textLine = input.reflectionText.trim()
    ? "Catatanmu menunjukkan ada ruang kecil untuk mengenali apa yang berubah setelah mendengar suara."
    : "Bahkan tanpa banyak kata, tubuhmu tetap bisa menyimpan informasi tentang apa yang terasa lebih aman.";

  return {
    insight: `Respons tubuhmu menunjukkan bahwa ada bagian dari dirimu yang mulai memberi ruang untuk tenang, meski belum semuanya selesai. ${bodyLine} ${textLine}`,
    nextFocus: `Besok, perhatikan suara atau suasana apa yang paling mudah membuat tubuhmu merasa aman. Jika rasa "${input.emotionalState || "campur aduk"}" muncul, beri napasmu waktu sebelum menilai pengalaman itu.`,
  };
}
