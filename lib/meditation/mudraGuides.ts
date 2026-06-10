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
};

export type MudraName = keyof typeof MUDRA_GUIDES;

export function getMudraGuide(name: MudraName): MudraGuide | undefined {
  return MUDRA_GUIDES[name];
}
