import { JourneyDailyRecord, GrowthNarrativeSummary } from "@/lib/types/journeyDailyRecord";

export const growthNarrativeEngine = {
  calculateGrowthNarrative(records: JourneyDailyRecord[]): GrowthNarrativeSummary {
    // 1. Sort records chronologically (oldest to newest)
    const sorted = [...records].sort((a, b) => a.appDate.localeCompare(b.appDate));

    // 2. Map issues/categories to growth narrative titles
    const categoryMap: Record<string, string> = {
      "responsibility": "Over Responsibility",
      "boundaries": "Boundary Issues",
      "body recovery": "Difficulty Resting",
      "body-recovery": "Difficulty Resting",
      "low energy": "Difficulty Resting",
      "low-energy": "Difficulty Resting",
      "inner child": "Self Worth",
      "inner-child": "Self Worth",
      "nervous system": "Menjaga Ketenangan Tubuh",
      "nervous-system": "Menjaga Ketenangan Tubuh",
      "emotional release": "Memberi Ruang bagi Emosi",
      "emotional-release": "Memberi Ruang bagi Emosi",
      "relationship": "Belajar Hadir dalam Hubungan",
      "money and safety": "Membangun Rasa Aman"
    };

    const transitionsRaw: string[] = [];
    sorted.forEach(rec => {
      const cat = rec.issueCategory ? rec.issueCategory.toLowerCase() : "";
      const mapped = categoryMap[cat];
      if (mapped) {
        transitionsRaw.push(mapped);
      }
    });

    // 3. Group consecutive duplicates
    const growthTransitions: string[] = [];
    transitionsRaw.forEach(item => {
      if (growthTransitions.length === 0 || growthTransitions[growthTransitions.length - 1] !== item) {
        growthTransitions.push(item);
      }
    });

    // 4. Default mock/seeding if empty to ensure "No Coming Soon"
    if (growthTransitions.length === 0) {
      growthTransitions.push("Over Responsibility", "Boundary Issues", "Difficulty Resting", "Self Worth");
    }

    const growthNarrative = growthTransitions.join(" \n↓\n ");

    // 5. Lesson and Invitation mapping
    const latestCat = sorted[sorted.length - 1]?.issueCategory?.toLowerCase() || "boundaries";
    
    const lessonMap: Record<string, string> = {
      "boundaries": "Belajar melindungi ruang batinmu adalah bentuk penghormatan tertinggi pada energimu.",
      "responsibility": "Tanggung jawab terbesarmu adalah atas keselarasan dirimu sendiri, bukan emosi orang lain.",
      "body recovery": "Istirahat bukanlah tanda kegagalan, melainkan persiapan untuk melangkah lebih jauh.",
      "body-recovery": "Istirahat bukanlah tanda kegagalan, melainkan persiapan untuk melangkah lebih jauh.",
      "low energy": "Istirahat bukanlah tanda kegagalan, melainkan persiapan untuk melangkah lebih jauh.",
      "low-energy": "Istirahat bukanlah tanda kegagalan, melainkan persiapan untuk melangkah lebih jauh.",
      "inner child": "Menghargai luka masa lalu membantumu mencintai dirimu seutuhnya hari ini.",
      "inner-child": "Menghargai luka masa lalu membantumu mencintai dirimu seutuhnya hari ini.",
      "nervous system": "Ketegangan pada sistem saraf adalah sinyal tubuh untuk kembali terhubung dengan napasmu.",
      "nervous-system": "Ketegangan pada sistem saraf adalah sinyal tubuh untuk kembali terhubung dengan napasmu.",
      "emotional release": "Mengizinkan emosi mengalir membantumu melepaskan beban batin yang tersimpan.",
      "emotional-release": "Mengizinkan emosi mengalir membantumu melepaskan beban batin yang tersimpan."
    };

    const invitationMap: Record<string, string> = {
      "boundaries": "Pilihlah satu batasan kecil yang ingin kamu komunikasikan secara jujur hari ini.",
      "responsibility": "Berlatihlah mendelegasikan tugas atau menolak hal yang melebihi kapasitasmu.",
      "body recovery": "Coba luangkan waktu 5 menit untuk berbaring rileks tanpa memegang gawai.",
      "body-recovery": "Coba luangkan waktu 5 menit untuk berbaring rileks tanpa memegang gawai.",
      "low energy": "Coba luangkan waktu 5 menit untuk berbaring rileks tanpa memegang gawai.",
      "low-energy": "Coba luangkan waktu 5 menit untuk berbaring rileks tanpa memegang gawai.",
      "inner child": "Berikan satu kata apresiasi yang tulus pada bagian dirimu yang telah berjuang.",
      "inner-child": "Berikan satu kata apresiasi yang tulus pada bagian dirimu yang telah berjuang.",
      "nervous system": "Lakukan latihan napas embus panjang selama 3 menit sebelum tidur.",
      "nervous-system": "Lakukan latihan napas embus panjang selama 3 menit sebelum tidur.",
      "emotional release": "Tuliskan refleksi emosimu secara bebas tanpa menyensor pikiranmu."
    };

    const currentLesson = lessonMap[latestCat] || "Setiap langkah kecil yang kamu ambil sedang mendekatkanmu pada pemahaman diri.";
    const nextInvitation = invitationMap[latestCat] || "Teruskan satu praktik kesadaran kecil hari ini.";

    return {
      growthNarrative,
      growthTransitions,
      currentLesson,
      nextInvitation
    };
  }
};
