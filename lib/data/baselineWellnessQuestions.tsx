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
  // TUBUH (Body) - 3 Questions
  { id: 101, dimension: "BODY", text: { id: "Saya merasa memiliki energi yang cukup untuk menjalani aktivitas hari ini.", en: "I feel I have enough energy to go through my activities today." } },
  { id: 102, dimension: "BODY", text: { id: "Tubuh saya merasa segar setelah beristirahat atau tidur.", en: "My body feels refreshed after resting or sleeping." } },
  { id: 103, dimension: "BODY", text: { id: "Saya mendapatkan kualitas tidur yang cukup secara teratur.", en: "I regularly get enough quality sleep." } },

  // EMOSI (Emotion) - 3 Questions
  { id: 201, dimension: "EMOTION", text: { id: "Saya mampu mengelola emosi saya dengan baik saat menghadapi tantangan.", en: "I am able to manage my emotions well when facing challenges." } },
  { id: 202, dimension: "EMOTION", text: { id: "Saya jarang merasa tertekan oleh stres yang berkepanjangan.", en: "I rarely feel pressured by prolonged stress." } },
  { id: 203, dimension: "EMOTION", text: { id: "Saya merasa mampu menangani perasaan kewalahan (overwhelm).", en: "I feel able to handle feelings of overwhelm." } },

  // PIKIRAN (Mind) - 3 Questions
  { id: 301, dimension: "MIND", text: { id: "Saya dapat fokus pada apa yang sedang saya kerjakan tanpa mudah teralih.", en: "I can focus on what I am doing without being easily distracted." } },
  { id: 302, dimension: "MIND", text: { id: "Pikiran saya jarang terjebak dalam perenungan negatif yang berulang (rumination).", en: "My mind is rarely stuck in repetitive negative thinking (rumination)." } },
  { id: 303, dimension: "MIND", text: { id: "Saya memiliki kejelasan mental dalam mengambil keputusan.", en: "I have mental clarity in making decisions." } },

  // RELASI (Relationship) - 2 Questions
  { id: 401, dimension: "RELATIONSHIP", text: { id: "Saya memiliki sistem dukungan yang bisa saya andalkan saat dibutuhkan.", en: "I have a support system I can rely on when needed." } },
  { id: 402, dimension: "RELATIONSHIP", text: { id: "Saya merasa bisa mempercayai orang-orang terdekat saya.", en: "I feel I can trust the people closest to me." } },

  // MAKNA HIDUP (Meaning) - 2 Questions
  { id: 501, dimension: "MEANING", text: { id: "Saya merasa hidup saya memiliki tujuan yang jelas.", en: "I feel my life has a clear purpose." } },
  { id: 502, dimension: "MEANING", text: { id: "Saya tahu ke arah mana saya ingin melangkah dalam hidup.", en: "I know which direction I want to take in life." } },

  // REGULASI DIRI (Regulation) - 2 Questions
  { id: 601, dimension: "REGULATION", text: { id: "Saya memiliki cara yang efektif untuk menenangkan diri saat stres.", en: "I have effective ways to calm myself when stressed." } },
  { id: 602, dimension: "REGULATION", text: { id: "Saya mampu beradaptasi dengan cepat terhadap perubahan situasi.", en: "I am able to adapt quickly to changing situations." } },
];
