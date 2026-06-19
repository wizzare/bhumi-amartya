export type WellnessDimension = "BODY" | "EMOTION" | "MIND" | "RELATIONSHIP" | "MEANING" | "REGULATION";

export interface WellnessQuestion {
  id: number;
  dimension: WellnessDimension;
  text: {
    id: string;
    en: string;
  };
}

export const BASELINE_QUESTIONS: WellnessQuestion[] = [
  // TUBUH (Body)
  { id: 101, dimension: "BODY", text: { id: "Saya merasa memiliki energi yang cukup untuk menjalani aktivitas hari ini.", en: "I feel I have enough energy to go through my activities today." } },
  { id: 102, dimension: "BODY", text: { id: "Tubuh saya merasa segar setelah beristirahat atau tidur.", en: "My body feels refreshed after resting or sleeping." } },
  { id: 103, dimension: "BODY", text: { id: "Saya mendapatkan kualitas tidur yang cukup secara teratur.", en: "I regularly get enough quality sleep." } },
  { id: 104, dimension: "BODY", text: { id: "Saya jarang merasa lelah yang berlebihan tanpa alasan jelas.", en: "I rarely feel excessive fatigue without a clear reason." } },
  { id: 105, dimension: "BODY", text: { id: "Saya sadar akan sinyal fisik yang dikirimkan oleh tubuh saya.", en: "I am aware of the physical signals my body sends." } },

  // EMOSI (Emotion)
  { id: 201, dimension: "EMOTION", text: { id: "Saya mampu mengelola emosi saya dengan baik saat menghadapi tantangan.", en: "I am able to manage my emotions well when facing challenges." } },
  { id: 202, dimension: "EMOTION", text: { id: "Saya jarang merasa tertekan oleh stres yang berkepanjangan.", en: "I rarely feel pressured by prolonged stress." } },
  { id: 203, dimension: "EMOTION", text: { id: "Saya merasa mampu menangani perasaan kewalahan (overwhelm).", en: "I feel able to handle feelings of overwhelm." } },
  { id: 204, dimension: "EMOTION", text: { id: "Saya bisa mengekspresikan perasaan saya dengan cara yang sehat.", en: "I can express my feelings in a healthy way." } },
  { id: 205, dimension: "EMOTION", text: { id: "Saya merasa aman secara emosional dalam keseharian saya.", en: "I feel emotionally safe in my daily life." } },

  // PIKIRAN (Mind)
  { id: 301, dimension: "MIND", text: { id: "Saya dapat fokus pada apa yang sedang saya kerjakan tanpa mudah teralih.", en: "I can focus on what I am doing without being easily distracted." } },
  { id: 302, dimension: "MIND", text: { id: "Pikiran saya jarang terjebak dalam perenungan negatif yang berulang (rumination).", en: "My mind is rarely stuck in repetitive negative thinking (rumination)." } },
  { id: 303, dimension: "MIND", text: { id: "Saya memiliki kejelasan mental dalam mengambil keputusan.", en: "I have mental clarity in making decisions." } },
  { id: 304, dimension: "MIND", text: { id: "Saya jarang merasa khawatir secara berlebihan tentang masa depan.", en: "I rarely feel excessively worried about the future." } },
  { id: 305, dimension: "MIND", text: { id: "Saya merasa beban pikiran saya masih dalam batas yang wajar.", en: "I feel my cognitive load is within reasonable limits." } },

  // RELASI (Relationship)
  { id: 401, dimension: "RELATIONSHIP", text: { id: "Saya memiliki sistem dukungan yang bisa saya andalkan saat dibutuhkan.", en: "I have a support system I can rely on when needed." } },
  { id: 402, dimension: "RELATIONSHIP", text: { id: "Saya merasa bisa mempercayai orang-orang terdekat saya.", en: "I feel I can trust the people closest to me." } },
  { id: 403, dimension: "RELATIONSHIP", text: { id: "Saya merasa terhubung secara mendalam dengan orang lain.", en: "I feel deeply connected to others." } },
  { id: 404, dimension: "RELATIONSHIP", text: { id: "Saya merasa menjadi bagian dari suatu komunitas atau lingkungan.", en: "I feel like I belong to a community or environment." } },
  { id: 405, dimension: "RELATIONSHIP", text: { id: "Saya jarang merasa terisolasi atau kesepian secara sosial.", en: "I rarely feel isolated or socially lonely." } },

  // MAKNA HIDUP (Meaning)
  { id: 501, dimension: "MEANING", text: { id: "Saya merasa hidup saya memiliki tujuan yang jelas.", en: "I feel my life has a clear purpose." } },
  { id: 502, dimension: "MEANING", text: { id: "Saya tahu ke arah mana saya ingin melangkah dalam hidup.", en: "I know which direction I want to take in life." } },
  { id: 503, dimension: "MEANING", text: { id: "Saya merasa optimis dan penuh harapan tentang masa depan.", en: "I feel optimistic and hopeful about the future." } },
  { id: 504, dimension: "MEANING", text: { id: "Saya merasa apa yang saya lakukan sehari-hari memiliki makna.", en: "I feel what I do daily has meaning." } },
  { id: 505, dimension: "MEANING", text: { id: "Saya merasa puas dengan pencapaian hidup saya sejauh ini.", en: "I feel satisfied with my life achievements so far." } },

  // REGULASI DIRI (Regulation)
  { id: 601, dimension: "REGULATION", text: { id: "Saya memiliki cara yang efektif untuk menenangkan diri saat stres.", en: "I have effective ways to calm myself when stressed." } },
  { id: 602, dimension: "REGULATION", text: { id: "Saya mampu beradaptasi dengan cepat terhadap perubahan situasi.", en: "I am able to adapt quickly to changing situations." } },
  { id: 603, dimension: "REGULATION", text: { id: "Saya tidak ragu untuk mencari bantuan saat merasa tidak sanggup sendiri.", en: "I do not hesitate to seek help when I feel I cannot handle it alone." } },
  { id: 604, dimension: "REGULATION", text: { id: "Saya merasa memiliki ketangguhan (resilience) dalam menghadapi masalah.", en: "I feel I have resilience in facing problems." } },
  { id: 605, dimension: "REGULATION", text: { id: "Saya tahu cara memulihkan diri setelah mengalami masa sulit.", en: "I know how to recover after experiencing difficult times." } },
];
