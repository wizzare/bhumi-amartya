import { buildArsipAkashiInputFromProfile } from "@/lib/arsipAkashi/profile/inputBuilder";
import { buildArsipAkashiProfileViewModel } from "@/lib/arsipAkashi/profile/viewModel";

function countSentences(text: string): number {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 5).length;
}

export function testArsipAkashi3x3Contract() {
  const sampleUsers = [
    { uid: "user-widya", birthDate: "1996-09-08", birthTime: "08:15", timezone: "+07:00", gender: "female" },
    { uid: "user-sheina", birthDate: "1994-03-21", birthTime: "14:45", timezone: "+07:00", gender: "female" },
    { uid: "user-dian", birthDate: "1988-11-12", birthTime: "22:00", timezone: "+07:00", gender: "female" },
    { uid: "user-slamat", birthDate: "1975-01-05", birthTime: "05:30", timezone: "+07:00", gender: "male" },
  ];

  let totalReadingsAudited = 0;
  let totalReadingsPassed = 0;

  for (const user of sampleUsers) {
    const input = buildArsipAkashiInputFromProfile(
      user,
      { humanDesign: { type: "Generator", profile: "1/3" } } as any,
    );

    const vm = buildArsipAkashiProfileViewModel(input);

    const regularReadings = vm.readings.filter(
      (r) => r.roomId !== "symbolic-origin" && r.roomId !== "current-life-phase",
    );

    for (const reading of regularReadings) {
      totalReadingsAudited++;
      const paragraphs = reading.deepExplanation.split("\n\n");
      const sentenceCounts = paragraphs.map(countSentences);
      const pass = paragraphs.length === 3 && sentenceCounts.every((c) => c === 3);

      if (pass) {
        totalReadingsPassed++;
      } else {
        console.error(`FAILED READING: ${reading.title} for user ${user.uid}`, {
          paragraphCount: paragraphs.length,
          sentenceCounts,
        });
      }
    }

    // Regression Check: Verify Soul Letters remain 5 paragraphs x 5 sentences (5x5)
    for (const letter of vm.soulLetters) {
      const pCount = letter.paragraphs.length;
      const sCounts = letter.paragraphs.map(countSentences);
      const soulPass = pCount === 5 && sCounts.every((c) => c === 5);
      if (!soulPass) {
        console.error(`SOUL LETTER REGRESSION FOR ${letter.title}:`, { pCount, sCounts });
        throw new Error(`Soul Letter regression detected for ${letter.title}!`);
      }
    }
  }

  console.log(`=== 3x3 CONTRACT MULTI-USER AUDIT SUMMARY ===`);
  console.log(`Sample Users Tested: ${sampleUsers.length}`);
  console.log(`Total Regular Readings Audited: ${totalReadingsAudited}`);
  console.log(`Total Regular Readings Passed (3x3): ${totalReadingsPassed}`);
  console.log(`Soul Letters Regression Check (5x5): PASS 100%`);

  if (totalReadingsPassed !== totalReadingsAudited) {
    throw new Error(`Contract failure: ${totalReadingsAudited - totalReadingsPassed} readings failed 3x3!`);
  }

  return { totalReadingsAudited, totalReadingsPassed };
}

if (require.main === module) {
  testArsipAkashi3x3Contract();
}
