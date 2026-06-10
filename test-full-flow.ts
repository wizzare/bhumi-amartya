import { generateBlueprint } from './lib/engines/generateBlueprint';
import { dailyGuidanceEngine } from './lib/engines/dailyGuidanceEngine';
import { userRepository } from './lib/repositories/userRepository';
import { blueprintRepository } from './lib/repositories/blueprintRepository';
import { journalRepository } from './lib/repositories/journalRepository';
import { Timestamp } from 'firebase/firestore';

async function test() {
  const uid = "verification-test-" + Date.now();
  console.log("Starting flow verification for UID:", uid);

  // 1. Profile Creation
  console.log("Step 1: Creating profile...");
  const profileData: any = {
    uid,
    fullName: "Test scalability User",
    email: "test@example.com",
    birthDate: "1990-01-01",
    birthTime: "10:00",
    birthCity: "Jakarta",
    setupCompleted: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  await userRepository.upsertUserProfile(uid, profileData);
  const savedProfile = await userRepository.getUserProfile(uid);
  if (!savedProfile || savedProfile.uid !== uid) throw new Error("Profile save failed");
  console.log("Profile saved correctly.");

  // 2. Blueprint Generation
  console.log("Step 2: Generating blueprint...");
  const blueprint = await generateBlueprint({
    uid,
    fullName: profileData.fullName,
    birthDate: profileData.birthDate,
    birthTime: profileData.birthTime,
    birthCity: profileData.birthCity
  });
  await blueprintRepository.saveUserBlueprint(uid, blueprint as any);
  const savedBlueprint = await blueprintRepository.getUserBlueprint(uid);
  if (!savedBlueprint) throw new Error("Blueprint save failed");
  console.log("Blueprint generated and saved:", {
    lifePath: savedBlueprint.lifePath?.number,
    hdType: savedBlueprint.humanDesign?.type,
    arcana: savedBlueprint.destinyMatrix?.center
  });

  // 3. Daily Guidance Generation
  console.log("Step 3: Generating daily guidance...");
  const today = new Date().toISOString().slice(0, 10);
  const guidance = await dailyGuidanceEngine.getOrCreateDailyGuidance(uid, today, {
    uid,
    date: today,
    language: "id",
    profile: savedProfile as any,
    blueprint: savedBlueprint as any,
    currentSky: null, // Engine will calculate
    previousJournalEntries: [],
    previousMeditationEntries: [],
    previousAudioHealingEntries: []
  });
  if (!guidance.soulReflectionText || !guidance.dailyNoteText) throw new Error("Daily guidance missing text fields");
  console.log("Daily Guidance generated:");
  console.log("- Refleksi Jiwa:", guidance.soulReflectionText.slice(0, 50) + "...");
  console.log("- Catatan Hari Ini:", guidance.dailyNoteText.slice(0, 50) + "...");

  // 4. Journal Entry
  console.log("Step 4: Creating journal entry...");
  const journalEntry: any = {
    id: "journal-" + Date.now(),
    uid,
    content: "Hari ini aku merasa sangat terbantu dengan refleksi Bhumi.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await journalRepository.saveEntry(uid, journalEntry);
  const entries = await journalRepository.getJournalEntries(uid);
  if (entries.length === 0 || entries[0].content !== journalEntry.content) throw new Error("Journal save failed");
  console.log("Journal entry saved and persistent.");

  console.log("FLOW VERIFICATION COMPLETED SUCCESSFULLY.");
}

test().catch(err => {
  console.error("FLOW VERIFICATION FAILED:");
  console.error(err);
  process.exit(1);
});
