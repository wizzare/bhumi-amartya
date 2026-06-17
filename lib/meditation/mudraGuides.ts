export type MudraGuide = {
  name: string;
  duration: string;
  steps: string[];
  benefits: string;
  affirmation?: string;
};

export const MUDRA_GUIDES: Record<string, MudraGuide> = {
  "Prithvi Mudra": {
    name: "Prithvi Mudra",
    duration: "3-5 menit",
    steps: [
      "Sentuhkan ujung jari manis ke ujung ibu jari.",
      "Jaga jari-jari lain tetap rileks.",
      "Letakkan tangan di atas paha.",
    ],
    benefits: "Membantu grounding, stabilitas, dan rasa aman pada tubuh.",
    affirmation: "Aku aman dan ditopang oleh bumi.",
  },
  "Gyan Mudra": {
    name: "Gyan Mudra",
    duration: "3-5 menit",
    steps: [
      "Sentuhkan ujung jari telunjuk ke ujung ibu jari.",
      "Jaga jari-jari lain tetap lurus dan rileks.",
      "Letakkan tangan di atas lutut dengan telapak menghadap ke atas.",
    ],
    benefits: "Meningkatkan kejernihan pikiran, kesadaran, dan pendengaran batin.",
    affirmation: "Aku mendengar kebijaksanaan dari dalam diriku.",
  },
  "Anjali Mudra": {
    name: "Anjali Mudra",
    duration: "3-5 menit",
    steps: [
      "Satukan kedua telapak tangan di depan pusat jantung.",
      "Jaga bahu tetap rileks.",
      "Bernapaslah dengan lembut ke area dada.",
    ],
    benefits: "Menghubungkan dengan hati, rasa syukur, dan kelembutan emosional.",
    affirmation: "Aku kembali pada hatiku dengan rasa syukur.",
  },
  "Apana Mudra": {
    name: "Apana Mudra",
    duration: "3-5 menit",
    steps: [
      "Sentuhkan ibu jari ke jari tengah dan jari manis.",
      "Jaga jari telunjuk dan kelingking tetap rileks.",
    ],
    benefits: "Membantu pelepasan, melepaskan, dan grounding.",
    affirmation: "Aku melepaskan apa yang tidak lagi melayaniku.",
  },
  "Hakini Mudra": {
    name: "Hakini Mudra",
    duration: "3-5 menit",
    steps: [
      "Sentuhkan ujung jari kedua tangan bersamaan.",
      "Pegang tangan di depan dada.",
      "Bernapaslah perlahan.",
    ],
    benefits: "Meningkatkan fokus, integrasi, dan keseimbangan mental.",
    affirmation: "Pikiran dan intuisiku bekerja dalam harmoni.",
  },
  "Padma Mudra": {
    name: "Padma Mudra",
    duration: "3-5 menit",
    steps: [
      "Satukan pangkal telapak tangan, ibu jari, dan kelingking.",
      "Buka jari telunjuk, tengah, dan manis seperti bunga teratai.",
      "Pegang di depan dada.",
    ],
    benefits: "Membuka hati untuk menerima, cinta, dan keindahan.",
    affirmation: "Hatiku terbuka untuk memberi dan menerima cinta.",
  },
  "Shuni Mudra": {
    name: "Shuni Mudra",
    duration: "4-6 menit",
    steps: ["Sentuhkan ujung jari tengah ke ujung ibu jari.", "Biarkan tiga jari lain rileks.", "Letakkan tangan di paha dengan bahu lembut."],
    benefits: "Mendukung kesabaran, kedisiplinan lembut, dan kestabilan saat menjalani proses.",
    affirmation: "Aku menghormati proses dan bertumbuh dalam ritmeku sendiri.",
  },
  "Surya Mudra": {
    name: "Surya Mudra",
    duration: "3-5 menit",
    steps: ["Tekuk jari manis menuju pangkal ibu jari.", "Tahan lembut dengan ibu jari.", "Jaga jari lain tetap rileks."],
    benefits: "Mendukung semangat, keberanian, dan aktivasi energi ketika tubuh terasa lesu.",
    affirmation: "Aku menyalakan daya hidupku dengan sadar.",
  },
  "Vayu Mudra": {
    name: "Vayu Mudra",
    duration: "4-6 menit",
    steps: ["Tekuk jari telunjuk ke pangkal ibu jari.", "Tekan lembut dengan ibu jari.", "Biarkan jari lain memanjang tanpa tegang."],
    benefits: "Membantu menenangkan kegelisahan, gerak pikiran, dan ketegangan yang sulit diam.",
    affirmation: "Aku memberi ruang bagi pikiranku untuk menjadi lebih tenang.",
  },
  "Kubera Mudra": {
    name: "Kubera Mudra",
    duration: "3-5 menit",
    steps: ["Satukan ibu jari, telunjuk, dan jari tengah.", "Tekuk jari manis dan kelingking ke telapak.", "Pegang niat dengan napas yang tenang."],
    benefits: "Mendukung fokus niat, kejernihan arah, dan keberanian mengambil langkah nyata.",
    affirmation: "Niatku jernih dan langkahku selaras.",
  },
  "Yoni Mudra": {
    name: "Yoni Mudra",
    duration: "5-7 menit",
    steps: ["Satukan ibu jari dan telunjuk membentuk segitiga.", "Jalin atau rapatkan jari lainnya dengan nyaman.", "Letakkan tangan di bawah pusar."],
    benefits: "Mendukung rasa aman, koneksi batin, kreativitas, dan ketenangan emosional.",
    affirmation: "Aku pulang ke ruang aman di dalam diriku.",
  },
};

export type MudraName = keyof typeof MUDRA_GUIDES;

export function getMudraGuide(name: MudraName): MudraGuide | undefined {
  return MUDRA_GUIDES[name];
}
