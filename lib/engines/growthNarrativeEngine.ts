import { JourneyDailyRecord, GrowthNarrativeSummary } from "@/lib/types/journeyDailyRecord";

export const growthNarrativeEngine = {
  calculateGrowthNarrative(records: JourneyDailyRecord[]): GrowthNarrativeSummary {
    // 1. Sort records chronologically (oldest to newest)
    const sorted = [...records].sort((a, b) => {
      const dateA = a.appDate || a.date || "";
      const dateB = b.appDate || b.date || "";
      return dateA.localeCompare(dateB);
    });

    // 2. Map issues/categories to growth narrative titles
    const categoryMap: Record<string, string> = {
      "responsibility": "Tanggung Jawab Berlebih",
      "boundaries": "Batas Diri & Perlindungan Energi",
      "body recovery": "Pemulihan Tubuh & Istirahat",
      "body-recovery": "Pemulihan Tubuh & Istirahat",
      "low energy": "Pemulihan Energi Tubuh",
      "low-energy": "Pemulihan Energi Tubuh",
      "inner child": "Harga Diri & Luka Batin",
      "inner-child": "Harga Diri & Luka Batin",
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
      } else if (rec.innerworkCompletion?.completed || (rec.practiceResults?.length ?? 0) > 0) {
        const practiceTitle = rec.innerworkRecommendation?.practiceTitle || rec.practiceResults?.[0]?.practiceTitle;
        const readableCategory = rec.issueCategory || rec.dominantIssue || practiceTitle || "Praktik Kesadaran";
        transitionsRaw.push(readableCategory);
      }
    });

    // 3. Group consecutive duplicates
    const growthTransitions: string[] = [];
    transitionsRaw.forEach(item => {
      if (growthTransitions.length === 0 || growthTransitions[growthTransitions.length - 1] !== item) {
        growthTransitions.push(item);
      }
    });

    const growthNarrative = growthTransitions.length > 0
      ? growthTransitions.join(" \n↓\n ")
      : records.length > 0
        ? "Jejak praktikmu sudah tersimpan. Bhumi mulai membaca ritme kecil yang kamu bangun dari refleksi dan praktik harian."
        : "Perjalananmu baru saja dimulai. Seiring bertambahnya refleksi dan praktik, Bhumi akan mulai memetakan tema-tema yang paling sering muncul dalam perjalananmu.";

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
