import { isEnlEdition } from "@/lib/config/edition";

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

export const MUDRA_GUIDES_EN: Record<string, MudraGuide> = {
  "Prithvi Mudra": {
    name: "Prithvi Mudra",
    duration: "3-5 minutes",
    steps: [
      "Touch the tip of your ring finger to the tip of your thumb.",
      "Keep your other fingers relaxed.",
      "Rest your hands comfortably on your thighs.",
    ],
    benefits: "Supports grounding, stability, and a gentle sense of safety in the body.",
    affirmation: "I am safe and supported by the earth.",
  },
  "Gyan Mudra": {
    name: "Gyan Mudra",
    duration: "3-5 minutes",
    steps: [
      "Touch the tip of your index finger to the tip of your thumb.",
      "Keep your other fingers straight and relaxed.",
      "Rest your hands on your knees with palms facing upward.",
    ],
    benefits: "Enhances mental clarity, awareness, and inner stillness.",
    affirmation: "I listen to the wisdom within myself.",
  },
  "Anjali Mudra": {
    name: "Anjali Mudra",
    duration: "3-5 minutes",
    steps: [
      "Bring both palms together at your heart center.",
      "Keep your shoulders relaxed and ease into the posture.",
      "Breathe gently into your chest.",
    ],
    benefits: "Connects with the heart, gratitude, and emotional tenderness.",
    affirmation: "I return to my heart with gratitude.",
  },
  "Apana Mudra": {
    name: "Apana Mudra",
    duration: "3-5 minutes",
    steps: [
      "Touch your thumb to your middle and ring fingertips.",
      "Keep your index finger and pinky finger relaxed.",
    ],
    benefits: "Supports emotional release, letting go, and grounding.",
    affirmation: "I release what no longer serves me.",
  },
  "Hakini Mudra": {
    name: "Hakini Mudra",
    duration: "3-5 minutes",
    steps: [
      "Touch all fingertips of both hands lightly together.",
      "Hold your hands softly in front of your chest.",
      "Breathe slowly and evenly.",
    ],
    benefits: "Encourages focus, integration, and mental balance.",
    affirmation: "My mind and intuition work in harmony.",
  },
  "Padma Mudra": {
    name: "Padma Mudra",
    duration: "3-5 minutes",
    steps: [
      "Bring the bases of your palms, thumbs, and pinky fingers together.",
      "Open your index, middle, and ring fingers like a blooming lotus.",
      "Hold gently in front of your chest.",
    ],
    benefits: "Opens the heart to receptivity, compassion, and appreciation.",
    affirmation: "My heart is open to give and receive love.",
  },
  "Shuni Mudra": {
    name: "Shuni Mudra",
    duration: "4-6 minutes",
    steps: [
      "Touch the tip of your middle finger to the tip of your thumb.",
      "Allow the remaining three fingers to relax.",
      "Rest your hands on your thighs with relaxed shoulders.",
    ],
    benefits: "Cultivates patience, gentle discipline, and stability through life's processes.",
    affirmation: "I honor the process and grow in my own rhythm.",
  },
  "Surya Mudra": {
    name: "Surya Mudra",
    duration: "3-5 minutes",
    steps: [
      "Fold your ring finger toward the base of your thumb.",
      "Gently rest your thumb over your ring finger.",
      "Keep your other fingers comfortably relaxed.",
    ],
    benefits: "Supports gentle vitality, warmth, and inner motivation when feeling sluggish.",
    affirmation: "I consciously kindle my inner vitality.",
  },
  "Vayu Mudra": {
    name: "Vayu Mudra",
    duration: "4-6 minutes",
    steps: [
      "Fold your index finger to the base of your thumb.",
      "Press gently with your thumb over the index knuckle.",
      "Allow the other fingers to extend without tension.",
    ],
    benefits: "Helps soothe restlessness, mental chatter, and nervous tension.",
    affirmation: "I create space for my mind to settle into calm.",
  },
  "Kubera Mudra": {
    name: "Kubera Mudra",
    duration: "3-5 minutes",
    steps: [
      "Join the tips of your thumb, index, and middle fingers.",
      "Curl your ring finger and pinky into your palm.",
      "Hold your intention with calm, steady breathing.",
    ],
    benefits: "Supports intentional focus, clear direction, and confident steps forward.",
    affirmation: "My intention is clear and my actions are aligned.",
  },
  "Yoni Mudra": {
    name: "Yoni Mudra",
    duration: "5-7 minutes",
    steps: [
      "Join your thumbs and index fingertips pointing down to form a triangle.",
      "Interlock or rest the other fingers comfortably together.",
      "Place your hands gently below your navel.",
    ],
    benefits: "Encourages inner safety, intuitive connection, creativity, and emotional serenity.",
    affirmation: "I return home to the safe space within myself.",
  },
};

export type MudraName = keyof typeof MUDRA_GUIDES;

export function getMudraGuide(name: MudraName, isEn = isEnlEdition()): MudraGuide | undefined {
  if (isEn) {
    return MUDRA_GUIDES_EN[name] ?? MUDRA_GUIDES[name];
  }
  return MUDRA_GUIDES[name];
}
