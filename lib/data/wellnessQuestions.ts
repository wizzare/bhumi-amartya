export type WellnessDimension = "BODY" | "EMOTION" | "RELATIONSHIP" | "MEANING" | "SPIRITUALITY";

export interface WellnessQuestion {
  id: number;
  dimension: WellnessDimension;
  text: {
    id: string;
    en: string;
  };
}

export const WELLNESS_QUESTIONS: WellnessQuestion[] = [
  // BODY
  { id: 1, dimension: "BODY", text: { id: "Saya bangun pagi dengan perasaan segar dan cukup istirahat.", en: "I wake up in the morning feeling refreshed and well-rested." } },
  { id: 2, dimension: "BODY", text: { id: "Saya memiliki energi yang cukup untuk menyelesaikan tugas harian.", en: "I have enough energy to complete my daily tasks." } },
  { id: 3, dimension: "BODY", text: { id: "Saya mendengarkan sinyal tubuh (kapan harus makan, istirahat, atau bergerak).", en: "I listen to my body's signals (when to eat, rest, or move)." } },
  { id: 4, dimension: "BODY", text: { id: "Saya meluangkan waktu untuk aktivitas fisik yang membuat tubuh nyaman.", en: "I make time for physical activities that make my body feel comfortable." } },
  { id: 5, dimension: "BODY", text: { id: "Saya mampu melepaskan ketegangan fisik secara sadar di akhir hari.", en: "I am able to consciously release physical tension at the end of the day." } },
  { id: 6, dimension: "BODY", text: { id: "Saya merasa tubuh saya berfungsi dengan baik dalam mendukung aktivitas saya.", en: "I feel my body is functioning well in supporting my activities." } },

  // EMOTION
  { id: 7, dimension: "EMOTION", text: { id: "Saya menyadari apa yang saya rasakan saat menjalani hari.", en: "I am aware of what I am feeling throughout the day." } },
  { id: 8, dimension: "EMOTION", text: { id: "Saya mampu menghadapi emosi sulit tanpa merasa kewalahan.", en: "I am able to face difficult emotions without feeling overwhelmed." } },
  { id: 9, dimension: "EMOTION", text: { id: "Saya bersikap lembut pada diri sendiri saat menghadapi kegagalan.", en: "I am kind to myself when facing failure." } },
  { id: 10, dimension: "EMOTION", text: { id: "Saya merasa mampu bangkit kembali setelah mengalami situasi stres.", en: "I feel capable of bouncing back after experiencing stressful situations." } },
  { id: 11, dimension: "EMOTION", text: { id: "Suasana hati (mood) saya terasa stabil dan seimbang.", en: "My mood feels stable and balanced." } },
  { id: 12, dimension: "EMOTION", text: { id: "Saya memiliki cara sehat untuk mengekspresikan apa yang saya rasakan.", en: "I have healthy ways to express what I am feeling." } },

  // RELATIONSHIP
  { id: 13, dimension: "RELATIONSHIP", text: { id: "Saya memiliki orang-orang yang bisa saya hubungi saat butuh dukungan.", en: "I have people I can reach out to when I need support." } },
  { id: 14, dimension: "RELATIONSHIP", text: { id: "Saya merasa menjadi bagian dari lingkungan atau komunitas saya.", en: "I feel like part of my environment or community." } },
  { id: 15, dimension: "RELATIONSHIP", text: { id: "Saya mampu mengomunikasikan kebutuhan saya dengan jelas kepada orang lain.", en: "I am able to communicate my needs clearly to others." } },
  { id: 16, dimension: "RELATIONSHIP", text: { id: "Saya bisa menetapkan batasan (boundaries) yang sehat dalam relasi saya.", en: "I can set healthy boundaries in my relationships." } },
  { id: 17, dimension: "RELATIONSHIP", text: { id: "Saya merasa terhubung secara tulus dengan orang-orang di sekitar saya.", en: "I feel genuinely connected with the people around me." } },
  { id: 18, dimension: "RELATIONSHIP", text: { id: "Saya mampu menyelesaikan perbedaan pendapat dengan cara yang tenang.", en: "I am able to resolve disagreements in a calm manner." } },

  // MEANING
  { id: 19, dimension: "MEANING", text: { id: "Saya merasa aktivitas harian saya memiliki makna dan nilai.", en: "I feel my daily activities have meaning and value." } },
  { id: 20, dimension: "MEANING", text: { id: "Saya merasa sedang melangkah menuju kehidupan yang saya inginkan.", en: "I feel I am moving toward the life I want." } },
  { id: 21, dimension: "MEANING", text: { id: "Saya merasakan pertumbuhan dan pembelajaran dalam diri saya.", en: "I feel growth and learning within myself." } },
  { id: 22, dimension: "MEANING", text: { id: "Pilihan-pilihan saya selaras dengan nilai-nilai hidup yang saya yakini.", en: "My choices align with the life values I believe in." } },
  { id: 23, dimension: "MEANING", text: { id: "Saya merasakan kepuasan batin di akhir hari.", en: "I feel inner satisfaction at the end of the day." } },
  { id: 24, dimension: "MEANING", text: { id: "Saya merasa kontribusi saya (sekecil apa pun) berarti bagi lingkungan.", en: "I feel my contribution (no matter how small) matters to my environment." } },

  // SPIRITUALITY
  { id: 25, dimension: "SPIRITUALITY", text: { id: "Saya meluangkan waktu untuk refleksi diri atau kontemplasi harian.", en: "I make time for self-reflection or daily contemplation." } },
  { id: 26, dimension: "SPIRITUALITY", text: { id: "Saya mengalami momen-momen ketenangan batin di tengah kesibukan.", en: "I experience moments of inner peace amidst busyness." } },
  { id: 27, dimension: "SPIRITUALITY", text: { id: "Saya merasa terhubung dengan sesuatu yang lebih besar dari diri saya.", en: "I feel connected to something larger than myself." } },
  { id: 28, dimension: "SPIRITUALITY", text: { id: "Saya mempraktikkan rasa syukur atas kehidupan yang saya jalani.", en: "I practice gratitude for the life I am living." } },
  { id: 29, dimension: "SPIRITUALITY", text: { id: "Saya mempercayai intuisi atau suara hati saya saat mengambil keputusan.", en: "I trust my intuition or inner voice when making decisions." } },
  { id: 30, dimension: "SPIRITUALITY", text: { id: "Saya menjalankan praktik pribadi yang menenangkan jiwa saya.", en: "I engage in personal practices that soothe my soul." } },
];
