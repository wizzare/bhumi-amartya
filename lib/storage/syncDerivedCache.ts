import { storageProvider } from "@/lib/storage/storageProvider";
import {
  writeOwnedCacheArray,
  writeOwnedCacheObject,
} from "@/lib/storage/derivedCacheOwnership";

type SyncDerivedCacheInput = {
  profile?: object | null;
  blueprint?: object | null;
  journalEntries?: object[];
  meditationEntries?: object[];
  audioHealingEntries?: object[];
  source: "dashboard" | "journey" | "weeklyReport";
};

export async function syncDerivedCacheFromStorageProvider(input: SyncDerivedCacheInput) {
  if (typeof window === "undefined") {
    return {
      journalCount: 0,
      meditationCount: 0,
      audioHealingCount: 0,
    };
  }

  const profile = (input.profile ?? await storageProvider.getUserProfile()) as { uid?: string } | null;
  const blueprint = (input.blueprint ?? await storageProvider.getUserBlueprint()) as { uid?: string } | null;
  const journalEntries = input.journalEntries ?? await storageProvider.getJournalEntries();
  const meditationEntries = input.meditationEntries ?? await storageProvider.getMeditationEntries();
  const audioHealingEntries = input.audioHealingEntries ?? await storageProvider.getAudioHealingEntries();

  const uid = profile?.uid || blueprint?.uid;

  if (profile && profile.uid) {
    writeOwnedCacheObject(`bhumiProfile:${profile.uid}`, profile, `${input.source}:profile`);
  }
  if (blueprint && blueprint.uid) {
    writeOwnedCacheObject(`bhumiBlueprint:${blueprint.uid}`, blueprint, `${input.source}:blueprint`);
  }
  if (uid) {
    writeOwnedCacheArray(`bhumiJournalEntries:${uid}`, journalEntries, `${input.source}:journalEntries`);
    writeOwnedCacheArray(`bhumiMeditationEntries:${uid}`, meditationEntries, `${input.source}:meditationEntries`);
    writeOwnedCacheArray(`bhumiAudioHealingEntries:${uid}`, audioHealingEntries, `${input.source}:audioHealingEntries`);
  }

  // Cleanup forbidden unscoped keys
  if (typeof window !== "undefined") {
    localStorage.removeItem("bhumiUserProfile");
    localStorage.removeItem("bhumiUserBlueprint");
    localStorage.removeItem("bhumiJournalEntries");
    localStorage.removeItem("bhumiMeditationEntries");
    localStorage.removeItem("bhumiAudioHealingEntries");
  }

  return {
    journalCount: journalEntries.length,
    meditationCount: meditationEntries.length,
    audioHealingCount: audioHealingEntries.length,
  };
}
