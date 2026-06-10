/**
 * BHUMI AMARTYA - AI Reflection Generation Engine
 * Generates emotionally intelligent, spiritually aware daily reflections
 * Based on: Life Path, Human Design, Astro Energy, Current Energy
 */

import {
  AIReflection,
  CoreIdentity,
  AstroEnergyDay,
  AIGenerationContext,
} from "./types";

// Reflection templates by Life Path
const reflectionsByLifePath: Record<number, string[]> = {
  1: [
    "Hari ini, kekuatan leadershipmu diminta untuk melembut.\nBukan semua harus dipimpin dengan tangan yang kuat.\nCoba dengarkan sebelum memutuskan.",
    "Inisiatifmu adalah karunia, tapi hari ini berkorbannya adalah keberanian untuk menunggu.\nTak semua hal membutuhkan tindakan sekarang.\nPercayakan kepada alur.",
  ],
  2: [
    "Sensitivitasmu adalah kekuatan spiritual, bukan kelemahan.\nHari ini izinkan dirimu merasakan lebih dalam.\nDukungan yang kamu berikan mungkin lebih bermakna dari yang kamu pikir.",
    "Ketika dua energi bertentangan dalam dirimu, itu bukan kesalahan.\nItu adalah ruang kreativitas.\nHari ini, berada di tengah-tengah adalah posisi paling kuat.",
  ],
  3: [
    "Kreativitasmu butuh ekspresi, tapi hari ini ekspresi sejatinya adalah mendengarkan.\nCerita orang lain membutuhkanmu lebih dari suaramu sendiri.\nBeri ruang untuk kehadiran, bukan hanya kata-kata.",
    "Energi komunikasimu sedang memutar ulang cerita lama.\nHari ini, coba tulis sesuatu yang belum pernah ada sebelumnya.\nCeritakan kebenaran yang lebih dalam.",
  ],
  4: [
    "Fondasi yang kamu bangun sedang diuji untuk melihat seberapa dalam akarnya.\nHari ini, kestabilan bukan tentang tidak bergerak.\nIya tentang tetap terhubung meski terjadi perubahan.",
    "Kerja keras adalah bahasa cintamu, tapi hari ini cinta juga berbicara dalam istirahat.\nBeri dirimu izin untuk tidak produktif.\nIya adalah bentuk penyembuhan.",
  ],
  5: [
    "Curiosity-mu adalah radar spiritual. Hari ini, tangkap apa yang belum terucapkan.\nJangan hanya mencari jawaban—cari pertanyaan yang lebih dalam.",
    "Kebebasan adalah oksigenmu, tapi hari ini kebebasan mungkin terletak pada komitmen.\nPilih satu hal dan rasakan kedalaman dari fokus.",
  ],
  6: [
    "Layanan adalah misi jiwamu, tapi jangan lupa: kamu juga layak dilayani.\nHari ini, izinkan seseorang membantu.\nTerima adalah bentuk memberi.",
    "Visi idealmu untuk dunia yang lebih baik dimulai dari cinta pada dirimu sendiri.\nHari ini, layani dirimu dengan kehangatan yang sama yang kamu berikan pada orang lain.",
  ],
  7: [
    "Pencarian inner truthmu adalah perjalanan, bukan destinasi.\nHari ini, berhentilah mencari sejenak dan rasakan apa yang sudah ditemukan.\nKeheningan pun berbicara.",
    "Analisis yang mendalam adalah karunia, tapi hari ini percayai intuisi di bawah pikiran.\nKebenaran paling dalam tidak selalu bisa dipikirkan—ia bisa dirasakan.",
  ],
  8: [
    "Power-mu bukan tentang dominasi. Hari ini, pahami bahwa kekuatan sejati adalah dalam pengalaman, bukan possession.\nLepaskan, dan temukan kebebasan.",
    "Ambisi memandu perjalananmu, tapi hari ini tanya: untuk siapa sebenarnya pencapaian ini?\nJika bukan untuk jiwamu sendiri, saatnya untuk berjalan ulang.",
  ],
  9: [
    "Universalitas hatimu adalah hadiah untuk dunia, tapi jangan lupa: batas juga adalah bentuk kasih sayang.\nHari ini, pilih satu cerita dan benamkan dirimu di dalamnya.\nKompletanitas dimulai dari kehadiran, bukan dari segalanya.",
    "Penyembuhan yang kamu bawa untuk orang lain harus dimulai dari dalam.\nHari ini, beri perhatian pada luka pribadimu yang masih terbuka.\nKamu layak untuk semua kasih sayang yang kamu berikan.",
  ],
};

const emotionalTones: Array<
  "gentle" | "empowering" | "grounding" | "introspective" | "celebratory"
> = ["gentle", "empowering", "grounding", "introspective", "celebratory"];

const affirmationTemplates: Record<
  string,
  string[]
> = {
  Taurus: [
    "Aku aman dalam kehadiran tubuhku.",
    "Stabilitas yang aku bangun adalah layanan untuk ketenangan pihak lain.",
    "Kecepatan bukan ukuran kesuksesan. Kedalam adalah.",
  ],
  Gemini: [
    "Kata-kataku membawa kekuatan untuk menyembuhkan atau melukai. Aku memilih dengan bijak.",
    "Curiosity-ku adalah cahaya. Aku izinkan untuk berkilauan.",
  ],
  Cancer: [
    "Emosi saya adalah kompas spiritual saya.",
    "Intuisi saya adalah keahlian tertinggi saya.",
  ],
  Leo: [
    "Cahaya saya dimaksudkan untuk bersinar untuk diri sendiri terlebih dahulu.",
    "Kreativitas saya adalah ekspresi jiwaku.",
  ],
  Virgo: [
    "Kesempurnaan adalah cerita palsu. Keberlanjutan adalah kebenaran.",
    "Detail yang saya perhatikan adalah bentuk cinta saya.",
  ],
  Libra: [
    "Keseimbangan bukanlah tetap diam—ia adalah tarian yang gelisah.",
    "Keindahan sejati dimulai dari dalam penerimaan diri.",
  ],
  Scorpio: [
    "Kedalaman emosi saya adalah superkekuatan spiritual saya.",
    "Transformasi adalah bahasa alami jiwa saya.",
  ],
  Sagittarius: [
    "Eksplorasi saya adalah bentuk doa.",
    "Kebenaran yang saya cari di luar dimulai dari dalam.",
  ],
  Capricorn: [
    "Struktur yang aku bangun adalah wadah untuk pertumbuhan spiritual.",
    "Kesabaran adalah bentuk kepercayaan.",
  ],
  Aquarius: [
    "Keunikan saya adalah kontribusi saya untuk dunia.",
    "Perbedaan saya adalah keindahannya.",
  ],
  Pisces: [
    "Sensitivitas saya adalah pintu ke keajaiban.",
    "Imajinasi saya adalah kebenaran jiwa saya.",
  ],
};

export function generateAIReflection(context: AIGenerationContext): AIReflection {
  const { userProfile, coreIdentity, currentMood } = context;
  const astroContext: AstroEnergyDay =
    context.astroContext ?? {
      currentEnergy: "Unknown",
      description: "",
      emoji: "",
      intensity: "medium",
      recommendation: "",
      affectedAreas: [],
    };

  // Get reflection based on life path
  const lifePath = coreIdentity.lifePath;
  const reflectionOptions =
    reflectionsByLifePath[lifePath] || reflectionsByLifePath[9];
  const dailyMessage =
    reflectionOptions[Math.floor(Math.random() * reflectionOptions.length)];

  // Determine emotional tone based on astro energy and current mood
  let emotionalTone: "gentle" | "empowering" | "grounding" | "introspective" | "celebratory";
  if (astroContext.intensity === "high") {
    emotionalTone = currentMood < 5 ? "grounding" : "empowering";
  } else if (astroContext.intensity === "low") {
    emotionalTone =
      currentMood > 7
        ? "celebratory"
        : "introspective";
  } else {
    emotionalTone = "gentle";
  }

  // Get affirmation
  const sunSign = coreIdentity.sunSign;
  const affirmationOptions = affirmationTemplates[sunSign] || [
    "Aku adalah cahaya yang tumbuh.",
  ];
  const affirmation =
    affirmationOptions[Math.floor(Math.random() * affirmationOptions.length)];

  // Generate guidance based on affected areas
  const guidanceByAffectedArea: Record<string, string> = {
    communication:
      "Hari ini, pilih kata-kata dengan hati-hati. Keheningan juga bentuk komunikasi yang bermakna.",
    relationships:
      "Hubungan sedang meminta untuk lebih autentik. Tunjukkan diri sejatimu.",
    creativity:
      "Aliran kreatifmu sedang mencari arah baru. Percayai proses menemukan.",
    emotions:
      "Emosi hari ini lebih terang dari biasanya. Biarkan mereka mengajar tanpa menguasai.",
    spirituality:
      "Pintu spiritual terbuka lebih lebar hari ini. Dengarkan dengan sunyi-senyap.",
    health:
      "Tubuhmu membutuhkan perhatian ekstra hari ini. Berikan grounding melalui gerakan lambat.",
    finance:
      "Energi finansial sedang berkontemplasi. Jangan buat keputusan besar hari ini.",
  };

  const primaryAffectedArea =
    astroContext.affectedAreas[0] || "spirituality";
  const guidance = guidanceByAffectedArea[primaryAffectedArea] || astroContext.recommendation;

  // Warning sign based on astro intensity
  let warningSign: string | undefined;
  if (astroContext.intensity === "high") {
    warningSign =
      "Energi tinggi hari ini. Jangan lakukan keputusan penting. Rasakan lebih dulu.";
  } else if (astroContext.retrogradeStatus) {
    warningSign = `${astroContext.retrogradeStatus.planet} sedang retrograde. Hindari komunikasi yang bersifat menyelesaikan masalah. Lebih fokus pada perenungan.`;
  }

  return {
    dailyMessage,
    theme: astroContext.currentEnergy,
    affirmation,
    warningSign,
    guidance,
    emotionalTone,
  };
}
