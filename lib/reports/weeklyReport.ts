import { loadLocalJournalEntries, type LocalJournalEntry } from "@/lib/journal/localJournal";
import { loadMeditationEntries, type MeditationEntry } from "@/lib/meditation/createDailyMeditationPractice";
import { loadAudioHealingEntries, type AudioHealingEntry } from "@/lib/audioHealing/localAudioHealing";
import { loadJourneyData, refreshJourneyData, type JourneyData } from "@/lib/journey/createJourneyData";
import { loadHealingInsights, refreshHealingInsights, type HealingInsightResult } from "@/lib/healing/createHealingInsights";
import { safeJsonParse } from "@/lib/storage/safeJson";

export type WeeklyReportData = {
  startDate: string;
  endDate: string;
  totalActivities: number;
  dominantTheme: string;
  emotionalPatterns: string[];
  mostActivePractice: string;
  healingProgressSummary: string;
  recommendedFocus: string;
  hasEnoughData: boolean;
};

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday is first day
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function generateWeeklyReport(): WeeklyReportData {
  if (typeof window === "undefined") {
    return {
      startDate: "",
      endDate: "",
      totalActivities: 0,
      dominantTheme: "",
      emotionalPatterns: [],
      mostActivePractice: "",
      healingProgressSummary: "",
      recommendedFocus: "",
      hasEnoughData: false,
    };
  }

  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const startStr = startOfWeek.toISOString().slice(0, 10);
  const endStr = endOfWeek.toISOString().slice(0, 10);
  
  const journals = loadLocalJournalEntries().filter(e => e.date >= startStr && e.date <= endStr);
  const meditations = loadMeditationEntries().filter(e => e.date >= startStr && e.date <= endStr);
  const audios = loadAudioHealingEntries().filter(e => e.date >= startStr && e.date <= endStr);
  
  const totalActivities = journals.length + meditations.length + audios.length;
  
  if (totalActivities < 2) {
    return {
      startDate: startStr,
      endDate: endStr,
      totalActivities,
      dominantTheme: "-",
      emotionalPatterns: [],
      mostActivePractice: "-",
      healingProgressSummary: "Belum cukup data minggu ini untuk membaca pola perjalananmu.",
      recommendedFocus: "Coba luangkan 5 menit hari ini untuk grounding atau jurnal singkat.",
      hasEnoughData: false,
    };
  }
  
  const insights = loadHealingInsights() ?? refreshHealingInsights();
  const journey = loadJourneyData() ?? refreshJourneyData();
  
  const dominantTheme = insights?.weeklyFocus?.theme || journey?.weeklyFocus?.theme || "Self Worth";
  const emotionalPatterns = insights?.emotionalPatterns?.slice(0, 3) || [];
  
  let mostActivePractice = "Journal";
  let maxCount = journals.length;
  if (meditations.length > maxCount) {
    mostActivePractice = "Meditasi";
    maxCount = meditations.length;
  }
  if (audios.length > maxCount) {
    mostActivePractice = "Audio Healing";
    maxCount = audios.length;
  }
  
  const phase = journey?.currentStage?.stage || "Awareness";
  const streak = journey?.progressSummary?.currentStreak || 0;
  
  const healingProgressSummary = `Minggu ini kamu berada di fase ${phase}. Aktivitasmu yang konsisten (${streak} hari berturut-turut) mulai memperlihatkan bahwa ruang batinmu perlahan menjadi tempat yang lebih aman untuk dirimu sendiri.`;
  
  const recommendedFocus = insights?.weeklyFocus?.practice || "Beri jeda pada tubuh sebelum merespons hal baru.";

  return {
    startDate: startStr,
    endDate: endStr,
    totalActivities,
    dominantTheme,
    emotionalPatterns,
    mostActivePractice,
    healingProgressSummary,
    recommendedFocus,
    hasEnoughData: true,
  };
}
