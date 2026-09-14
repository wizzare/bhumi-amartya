/**
 * BHUMI AMARTYA - Healing Recommendation Generator
 * Generates personalized healing recommendations based on emotional analysis
 * Focuses on soul-aligned practices, not generic wellness
 */

import type {
  EmotionalAnalysis,
  HealingRecommendation,
  CoreIdentity,
} from "../data/types";
import { isEnlEdition } from "@/lib/config/edition";

// ============= RECOMMENDATION LIBRARY =============

const healingLibrary: Record<string, HealingRecommendation[]> = {
  // ============= REST & RESTORATION =============
  rest: [
    {
      id: "rest-1",
      type: "somatic",
      title: "Restorative Laying Meditation",
      description:
        "Berbaring tanpa agenda selain untuk ada. Ini bukan tidur, ini adalah bentuk healing yang paling sederhana.",
      duration: 15,
      basedOnEmotionalAnalysis: "Exhaustion detected - body needs permission to stop",
      addressesWound: "burnout, over-giving, collapse",
      supportedBy: "somatic psychology - parasympathetic activation",
      instructions: [
        "Cari tempat di lantai yang hangat dan nyaman",
        "Berbaring dengan kaki sedikit terbuka, tangan di samping",
        "Letakkan sesuatu yang berat (blanket) di dada dan perut",
        "Tutup mata dan biarkan tubuh untuk completely relax",
        "Tidak ada yang perlu dilakukan. Hanya ada.",
      ],
      tips: [
        "Atur timer agar kamu tidak perlu khawatir tentang waktu",
        "Ini bukan meditasi - pikiran boleh berkeliaran",
        "Jika kamu tertidur, itu sempurna",
      ],
      bestTiming: "immediately",
      frequency: "daily if possible",
      integratesWithPractice: ["grounding", "nature-connection"],
      supportiveReminder:
        "Istirahat adalah kerja spiritual. Kamu tidak perlu melakukan apapun untuk berharga.",
    },
    {
      id: "rest-2",
      type: "meditation",
      title: "Forgiveness to Self Meditation",
      description:
        "Meditasi untuk melepaskan self-judgment dan mengizinkan diri untuk manusia (imperfect).",
      duration: 10,
      basedOnEmotionalAnalysis: "Exhaustion from self-criticism",
      addressesWound: "perfectionism, self-worth, control",
      supportedBy: "self-compassion research",
      instructions: [
        "Duduk dengan nyaman, tangan di hati",
        "Hirup dalam dan katakan: 'Aku memaafkan diriku untuk kekhilafan ini'",
        "Hirup dalam lagi dan katakan: 'Aku mengizinkan diri untuk belajar'",
        "Ulangi beberapa kali, biarkan kata-kata meresap",
        "Berakhir dengan: 'Aku cukup baik, tepat sekarang'",
      ],
      tips: [
        "Jika muncul tangisan, biarkan saja - itu adalah pelepasan",
        "Tidak perlu 'sempurna' - autentisitas lebih penting",
      ],
      bestTiming: "today",
      frequency: "as-needed, especially after self-criticism spirals",
      integratesWithPractice: ["journaling", "inner-child-work"],
      supportiveReminder:
        "Self-forgiveness adalah keputusan radikal untuk cinta. Kamu layak.",
    },
  ],

  // ============= GROUNDING & NERVOUS SYSTEM =============
  grounding: [
    {
      id: "grounding-1",
      type: "somatic",
      title: "5-4-3-2-1 Grounding Technique",
      description:
        "Teknik sensorik cepat untuk kembali ke tubuh ketika merasa overwhelmed atau dissociated.",
      duration: 5,
      basedOnEmotionalAnalysis: "Tubuh sedang merasa tegang atau kewalahan",
      addressesWound: "anxiety, dissociation, panic",
      supportedBy: "somatic psychology, trauma-informed care",
      instructions: [
        "Perhatikan 5 hal yang bisa kamu lihat - bicarakan warna, bentuk, tekstur",
        "Perhatikan 4 hal yang bisa kamu sentuh - sentuh tekstur yang berbeda",
        "Perhatikan 3 hal yang bisa kamu dengar - dengarkan dengan seksama",
        "Perhatikan 2 hal yang bisa kamu cium - ambil whiff dari apa saja",
        "Perhatikan 1 hal yang bisa kamu rasakan di mulut - air, rasa",
      ],
      tips: [
        "Lakukan perlahan-lahan, tidak ada terburu-buru",
        "Gunakan saat anxiety naik sebelum mencapai puncak",
        "Bisa dilakukan di mana saja, kapan saja",
      ],
      bestTiming: "immediately",
      frequency: "as-needed",
      integratesWithPractice: ["breathwork", "presence"],
      supportiveReminder:
        "Kamu aman. Tubuhmu ada di sini, sekarang. Ini adalah realitas, bukan takut.",
    },
    {
      id: "grounding-2",
      type: "somatic",
      title: "Earthing - Bare Feet on Soil",
      description:
        "Berjalan tanpa alas kaki di atas tanah untuk membantu tubuh terasa lebih rileks dan tenang.",
      duration: 10,
      basedOnEmotionalAnalysis: "Kebutuhan untuk jeda dan membumikan diri",
      addressesWound: "disconnection, floating, overwhelm",
      supportedBy: "grounding science, earthing research",
      instructions: [
        "Temukan tempat dengan tanah, rumput, atau pasir (tidak aspal)",
        "Lepas sepatu dan kaus kaki",
        "Berdiri atau duduk dengan telanjang kaki menyentuh tanah",
        "Rasakan koneksi antara kaki dan bumi",
        "Jika mau, letakkan tangan di tanah juga",
        "Duduk dengan ini selama 10 menit",
      ],
      tips: [
        "Pagi hari atau sore hari lebih baik (kurang terik)",
        "Bahkan di taman kota bisa bekerja",
        "Bisa menggabungkan dengan walking meditation",
      ],
      bestTiming: "today",
      frequency: "3x weekly ideal",
      integratesWithPractice: ["nature-connection", "breathwork"],
      supportiveReminder:
        "Bumi akan menahan beratmu. Izinkan diri untuk bergantung pada sesuatu yang stabil.",
    },
  ],

  // ============= EMOTIONAL RELEASE =============
  release: [
    {
      id: "release-1",
      type: "movement",
      title: "Anger Release Through Movement",
      description:
        "Ekspresikan kemarahan yang dipendam melalui gerak bebas, tanpa judgement.",
      duration: 10,
      basedOnEmotionalAnalysis: "Suppressed anger or rage",
      addressesWound: "powerlessness, injustice, boundary violation",
      supportedBy: "somatic psychology, emotional release therapy",
      instructions: [
        "Temukan ruang pribadi (kamar tidur, studio)",
        "Pilih musik yang membuat kamu merasa kuat (rock, hip-hop, intense)",
        "Mulai dengan gentle swaying, lalu biarkan tubuh bergerak lebih keras",
        "Biarkan kemarahan keluar melalui gerak - pukulan ke bantal, tendangan, lompatan",
        "Tidak perlu terlihat bagus - ini tentang energi, bukan estetika",
        "Biarkan suara keluar jika perlu - berteriak, growl, atau menangis",
      ],
      tips: [
        "Siapkan bantal atau punching bag jika perlu",
        "Kamar tertutup paling baik untuk privasi",
        "Jangan khawatir tentang 'benar' - otentisitas adalah tujuannya",
      ],
      bestTiming: "immediately",
      frequency: "1-3x weekly during high-anger periods",
      integratesWithPractice: ["journaling", "emotional-processing"],
      supportiveReminder:
        "Kemarahanmu benar. Suaramu layak didengar. Energi ini mencari ekspresi, bukan represi.",
    },
    {
      id: "release-2",
      type: "creative",
      title: "Grief Release Writing",
      description:
        "Menulis cepat tanpa sensor untuk melepaskan duka yang terpendam.",
      duration: 15,
      basedOnEmotionalAnalysis: "Suppressed grief or loss",
      addressesWound: "unprocessed loss, abandonment, endings",
      supportedBy: "expressive writing research, grief psychology",
      instructions: [
        "Ambil kertas dan pen",
        "Tulis dengan tangan (tidak di laptop - kinesthetic matters)",
        "Tanpa berhenti, tulis semua yang kamu sakit untuk dikatakan",
        "Tidak ada sensor, grammar, atau organisasi - hanya aliran",
        "Tulis untuk 15 menit non-stop",
        "Opsional: baca kembali atau sobek kertas sebagai ritual pelepasan",
      ],
      tips: [
        "Jika menangis muncul, itu baik - biarkan",
        "Tidak perlu 'sense' - kata-kata bisa berantakan",
        "Ulangi sampai rasanya cukup dirilis",
      ],
      bestTiming: "today",
      frequency: "weekly during grief processing",
      integratesWithPractice: ["journaling", "ritual-closure"],
      supportiveReminder:
        "Dukamu adalah bukti cinta. Ada ruang untuk semua perasaan ini di sini.",
    },
  ],

  // ============= PRESENCE & AWARENESS =============
  presence: [
    {
      id: "presence-1",
      type: "meditation",
      title: "5-Minute Breath Awareness",
      description: "Meditasi sederhana untuk kembali ke saat ini.",
      duration: 5,
      basedOnEmotionalAnalysis: "Anxiety about future or rumination",
      addressesWound: "worry, control, disconnection",
      supportedBy: "mindfulness research",
      instructions: [
        "Duduk dengan nyaman",
        "Tutup mata",
        "Hanya perhatikan napasmu - tidak perlu mengubah",
        "Hirup dalam, hembuskan perlahan",
        "Jika pikiran berkeliaran, lembut kembali ke napas",
        "Lakukan selama 5 menit",
      ],
      tips: [
        "Tidak perlu 'sempurna' meditation - pikiran boleh ada",
        "Fokus pada fisik: suara napas, gerakan dada",
      ],
      bestTiming: "immediately",
      frequency: "daily if possible",
      integratesWithPractice: ["grounding", "journaling"],
      supportiveReminder:
        "Saat ini aman. Napasmu membawa kamu pulang ke tubuhmu.",
    },
  ],

  // ============= IDENTITY & AUTHENTICITY =============
  authenticity: [
    {
      id: "authenticity-1",
      type: "reflection",
      title: "Core Values Clarification",
      description:
        "Mengidentifikasi nilai-nilai sejatimu vs nilai-nilai yang kamu kejar untuk orang lain.",
      duration: 20,
      basedOnEmotionalAnalysis: "Inauthenticity or people-pleasing patterns",
      addressesWound: "abandonment fears, self-worth tied to others' approval",
      supportedBy: "values-based living, psychology of authenticity",
      instructions: [
        "Tulis daftar 10 nilai yang kamu pikir penting (jujur, cinta, kesuksesan, dll)",
        "Untuk setiap, tandai: 'ini milik SAYA' atau 'ini diharapkan ORANG LAIN'",
        "Lingkari yang paling sejati untukmu dengan tanda bintang",
        "Tulis: Bagaimana saya bisa menghidupkan nilai-nilai ini lebih plenamente?",
        "Identifikasi satu langkah kecil minggu ini",
      ],
      tips: [
        "Kejujuran di sini penting - tidak ada yang perlu melihat ini",
        "Nilai dari orang lain bukan 'buruk' - hanya perlu disadari",
      ],
      bestTiming: "this-week",
      frequency: "quarterly review",
      integratesWithPractice: ["journaling", "boundary-work"],
      supportiveReminder:
        "Hidup autentik dimulai dengan tahu siapa kamu di luar ekspektasi. Itu pemberani.",
    },
  ],

  // ============= BOUNDARIES & POWER =============
  boundaries: [
    {
      id: "boundaries-1",
      type: "reflection",
      title: "Boundary Setting Ritual",
      description:
        "Merumuskan dan memperkuat batas diri yang lemah atau dilanggar.",
      duration: 15,
      basedOnEmotionalAnalysis: "People-pleasing or boundary violation",
      addressesWound: "self-worth, power, resentment",
      supportedBy: "boundary psychology",
      instructions: [
        "Identifikasi satu batas yang sering kamu lewatkan",
        "Tulis: Batas yang ingin saya tetapkan adalah...",
        "Tulis: Alasan saya takut menetapkan ini adalah...",
        "Tulis: Jika saya menetapkan batas ini, hidup saya akan berubah menjadi...",
        "Berdiri di depan cermin dan katakan batas dengan suara keras",
        "Tulis rencana untuk mengkomunikasikan batas ini",
      ],
      tips: [
        "Boundary pertama adalah yang paling sulit - mulai kecil",
        "Perlunya berulang kali untuk saling percaya pada batas sendiri",
      ],
      bestTiming: "today",
      frequency: "as-needed for new boundaries",
      integratesWithPractice: ["journaling", "authentic-speaking"],
      supportiveReminder:
        "Batasmu adalah bentuk cinta - untuk diri sendiri dan untuk orang lain. Batas membuat hubungan lebih sehat.",
    },
  ],
};

const healingLibraryEN: Record<string, HealingRecommendation[]> = {
  rest: [
    {
      id: "rest-1",
      type: "somatic",
      title: "Restorative Laying Meditation",
      description:
        "Lying down with no agenda other than to exist. This is not sleeping; it is the simplest form of healing.",
      duration: 15,
      basedOnEmotionalAnalysis: "Exhaustion detected - body needs permission to stop",
      addressesWound: "burnout, over-giving, collapse",
      supportedBy: "somatic psychology - parasympathetic activation",
      instructions: [
        "Find a warm and comfortable spot on the floor",
        "Lie down with legs slightly apart, hands at your sides",
        "Place something heavy (a weighted blanket) on your chest and abdomen",
        "Close your eyes and allow your body to completely relax",
        "There is nothing to do. Simply exist.",
      ],
      tips: [
        "Set a timer so you don't have to worry about time",
        "This is not meditation - your mind is free to wander",
        "If you fall asleep, that is perfect",
      ],
      bestTiming: "immediately",
      frequency: "daily if possible",
      integratesWithPractice: ["grounding", "nature-connection"],
      supportiveReminder:
        "Rest is spiritual work. You do not need to do anything to be worthy.",
    },
    {
      id: "rest-2",
      type: "meditation",
      title: "Forgiveness to Self Meditation",
      description:
        "Meditation to release self-judgment and allow yourself to be humanly imperfect.",
      duration: 10,
      basedOnEmotionalAnalysis: "Exhaustion from self-criticism",
      addressesWound: "perfectionism, self-worth, control",
      supportedBy: "self-compassion research",
      instructions: [
        "Sit comfortably, hands over your heart",
        "Take a deep breath and say: 'I forgive myself for this oversight'",
        "Take another deep breath and say: 'I allow myself to learn'",
        "Repeat several times, letting the words sink in",
        "End with: 'I am good enough, right now'",
      ],
      tips: [
        "If tears come, let them - that is release",
        "No need to be 'perfect' - authenticity is more important",
      ],
      bestTiming: "today",
      frequency: "as-needed, especially after self-criticism spirals",
      integratesWithPractice: ["journaling", "inner-child-work"],
      supportiveReminder:
        "Self-forgiveness is a radical decision of love. You are worthy.",
    },
  ],

  grounding: [
    {
      id: "grounding-1",
      type: "somatic",
      title: "5-4-3-2-1 Grounding Technique",
      description:
        "Fast sensory technique to return to your body when feeling overwhelmed or dissociated.",
      duration: 5,
      basedOnEmotionalAnalysis: "Dysregulated nervous system",
      addressesWound: "anxiety, dissociation, panic",
      supportedBy: "somatic psychology, trauma-informed care",
      instructions: [
        "Notice 5 things you can see - speak their color, shape, texture",
        "Notice 4 things you can touch - feel different textures",
        "Notice 3 things you can hear - listen closely",
        "Notice 2 things you can smell - take a whiff of anything around",
        "Notice 1 thing you can taste in your mouth - water, flavor",
      ],
      tips: [
        "Do it slowly, there is no rush",
        "Use when anxiety rises before it reaches its peak",
        "Can be done anywhere, anytime",
      ],
      bestTiming: "immediately",
      frequency: "as-needed",
      integratesWithPractice: ["breathwork", "presence"],
      supportiveReminder:
        "You are safe. Your body is here, right now. This is reality, not fear.",
    },
    {
      id: "grounding-2",
      type: "somatic",
      title: "Earthing - Bare Feet on Soil",
      description:
        "Direct physical connection with the earth to reset the nervous system. Simple, yet powerful.",
      duration: 10,
      basedOnEmotionalAnalysis: "Need for nervous system reset",
      addressesWound: "disconnection, floating, overwhelm",
      supportedBy: "grounding science, earthing research",
      instructions: [
        "Find a spot with soil, grass, or sand (not asphalt)",
        "Take off your shoes and socks",
        "Stand or sit with bare feet touching the earth",
        "Feel the connection between your feet and the ground",
        "If you wish, place your hands on the ground as well",
        "Sit with this for 10 minutes",
      ],
      tips: [
        "Morning or late afternoon is best (less intense heat)",
        "Even a city park works well",
        "Can be combined with walking meditation",
      ],
      bestTiming: "today",
      frequency: "3x weekly ideal",
      integratesWithPractice: ["nature-connection", "breathwork"],
      supportiveReminder:
        "The earth will hold your weight. Allow yourself to rely on something stable.",
    },
  ],

  release: [
    {
      id: "release-1",
      type: "movement",
      title: "Anger Release Through Movement",
      description:
        "Express suppressed anger through free movement, without judgment.",
      duration: 10,
      basedOnEmotionalAnalysis: "Suppressed anger or rage",
      addressesWound: "powerlessness, injustice, boundary violation",
      supportedBy: "somatic psychology, emotional release therapy",
      instructions: [
        "Find a private space (bedroom, studio)",
        "Choose music that makes you feel strong (rock, hip-hop, intense)",
        "Start with gentle swaying, then allow your body to move more intensely",
        "Let anger out through movement - punching a pillow, kicking, jumping",
        "No need to look good - this is about energy, not aesthetics",
        "Let sounds out if needed - shout, growl, or cry",
      ],
      tips: [
        "Prepare pillows or a punching bag if needed",
        "A closed room is best for privacy",
        "Don't worry about being 'right' - authenticity is the goal",
      ],
      bestTiming: "immediately",
      frequency: "1-3x weekly during high-anger periods",
      integratesWithPractice: ["journaling", "emotional-processing"],
      supportiveReminder:
        "Your anger is valid. Your voice deserves to be heard. This energy seeks expression, not repression.",
    },
    {
      id: "release-2",
      type: "creative",
      title: "Grief Release Writing",
      description:
        "Write quickly without censorship to release suppressed grief.",
      duration: 15,
      basedOnEmotionalAnalysis: "Suppressed grief or loss",
      addressesWound: "unprocessed loss, abandonment, endings",
      supportedBy: "expressive writing research, grief psychology",
      instructions: [
        "Take paper and a pen",
        "Write by hand (not on a laptop - kinesthetic movement matters)",
        "Without stopping, write everything you are pained to say",
        "No censorship, grammar, or structure - only flow",
        "Write for 15 minutes non-stop",
        "Optional: re-read or tear up the paper as a release ritual",
      ],
      tips: [
        "If tears come, that is good - let them flow",
        "No need to make 'sense' - words can be messy",
        "Repeat until it feels sufficiently released",
      ],
      bestTiming: "today",
      frequency: "weekly during grief processing",
      integratesWithPractice: ["journaling", "ritual-closure"],
      supportiveReminder:
        "Your grief is proof of love. There is room for all these feelings here.",
    },
  ],

  presence: [
    {
      id: "presence-1",
      type: "meditation",
      title: "5-Minute Breath Awareness",
      description: "A simple meditation to return to the present moment.",
      duration: 5,
      basedOnEmotionalAnalysis: "Anxiety about future or rumination",
      addressesWound: "worry, control, disconnection",
      supportedBy: "mindfulness research",
      instructions: [
        "Sit comfortably",
        "Close your eyes",
        "Simply observe your breath - no need to change it",
        "Inhale deeply, exhale slowly",
        "If thoughts wander, gently return to the breath",
        "Do this for 5 minutes",
      ],
      tips: [
        "No need for 'perfect' meditation - thoughts are allowed to exist",
        "Focus on physical sensations: the sound of breath, chest movement",
      ],
      bestTiming: "immediately",
      frequency: "daily if possible",
      integratesWithPractice: ["grounding", "journaling"],
      supportiveReminder:
        "The present moment is safe. Your breath brings you home to your body.",
    },
  ],

  authenticity: [
    {
      id: "authenticity-1",
      type: "reflection",
      title: "Core Values Clarification",
      description:
        "Identify your true core values vs values you pursue for others.",
      duration: 20,
      basedOnEmotionalAnalysis: "Inauthenticity or people-pleasing patterns",
      addressesWound: "abandonment fears, self-worth tied to others' approval",
      supportedBy: "values-based living, psychology of authenticity",
      instructions: [
        "Write a list of 10 values you think are important (honesty, love, success, etc.)",
        "For each, mark: 'this is MINE' or 'this is expected by OTHERS'",
        "Circle the truest ones for you with a star",
        "Write: How can I live these values more fully?",
        "Identify one small step for this week",
      ],
      tips: [
        "Honesty here is crucial - no one else needs to see this",
        "Values from others aren't 'bad' - they just need to be recognized",
      ],
      bestTiming: "this-week",
      frequency: "quarterly review",
      integratesWithPractice: ["journaling", "boundary-work"],
      supportiveReminder:
        "Living authentically starts with knowing who you are beyond expectations. That is courageous.",
    },
  ],

  boundaries: [
    {
      id: "boundaries-1",
      type: "reflection",
      title: "Boundary Setting Ritual",
      description:
        "Formulate and strengthen personal boundaries that are weak or breached.",
      duration: 15,
      basedOnEmotionalAnalysis: "People-pleasing or boundary violation",
      addressesWound: "self-worth, power, resentment",
      supportedBy: "boundary psychology",
      instructions: [
        "Identify one boundary you frequently compromise",
        "Write: The boundary I want to establish is...",
        "Write: The reason I am afraid to set this is...",
        "Write: If I set this boundary, my life will change into...",
        "Stand in front of a mirror and state the boundary out loud",
        "Write a plan to communicate this boundary",
      ],
      tips: [
        "The first boundary is the hardest - start small",
        "It takes repetition to trust your own boundaries",
      ],
      bestTiming: "today",
      frequency: "as-needed for new boundaries",
      integratesWithPractice: ["journaling", "authentic-speaking"],
      supportiveReminder:
        "Your boundaries are a form of love - for yourself and for others. Boundaries make relationships healthier.",
    },
  ],
};

// ============= RECOMMENDATION GENERATOR =============

export function generateHealingRecommendation(
  analysis: EmotionalAnalysis,
  coreIdentity: CoreIdentity
): HealingRecommendation[] {
  const recommendations: HealingRecommendation[] = [];
  const isEn = isEnlEdition();
  const library = isEn ? healingLibraryEN : healingLibrary;

  // ---------------------------------
  // Prioritize by exhaustion level
  // ---------------------------------

  if (analysis.emotionalExhaustion === "critical") {
    recommendations.push(...(library.rest || []));
    recommendations.push(...(library.grounding || []));
    return recommendations.slice(0, 2); // Only suggest 2 top priorities
  }

  // ---------------------------------
  // Recommend by emotional tone
  // ---------------------------------

  if (analysis.emotionalTone === "grief") {
    recommendations.push(...(library.release || []));
    recommendations.push(...(library.presence || []));
  } else if (analysis.emotionalTone === "anger") {
    recommendations.push(...(library.release || []));
    recommendations.push(...(library.boundaries || []));
  } else if (analysis.emotionalTone === "fear") {
    recommendations.push(...(library.grounding || []));
    recommendations.push(...(library.presence || []));
  } else if (analysis.emotionalTone === "joy") {
    recommendations.push(...(library.presence || []));
    recommendations.push(...(library.authenticity || []));
  } else if (analysis.emotionalTone === "confusion") {
    recommendations.push(...(library.presence || []));
    recommendations.push(...(library.authenticity || []));
  }

  // ---------------------------------
  // Add soul profile context
  // ---------------------------------
  if (coreIdentity.lifePath === 4 || coreIdentity.lifePath === 8) {
    if (!recommendations.some((r) => r.id.includes("boundaries"))) {
      recommendations.push(...(library.boundaries || []));
    }
  }

  if (coreIdentity.humanDesign.toLowerCase().includes("generator")) {
    if (!recommendations.some((r) => r.id.includes("grounding"))) {
      recommendations.push(...(library.grounding || []));
    }
  }

  if (coreIdentity.arcanaCenter >= 15) {
    if (!recommendations.some((r) => r.id.includes("authenticity"))) {
      recommendations.push(...(library.authenticity || []));
    }
  }

  if (analysis.recurringWounds.includes("money block")) {
    recommendations.push(...(library.grounding || []));
  }

  if (analysis.recurringWounds.includes("self-worth")) {
    recommendations.push(...(library.authenticity || []));
  }

  // ---------------------------------
  // Add nervous system support
  // ---------------------------------

  if (
    analysis.nervousSystemDetection === "dysregulated" ||
    analysis.nervousSystemDetection === "activated"
  ) {
    if (!recommendations.some((r) => r.id.includes("grounding"))) {
      recommendations.push(...(library.grounding || []));
    }
  }

  // ---------------------------------
  // Remove duplicates and limit to 3-4
  // ---------------------------------

  const seen = new Set<string>();
  const unique = recommendations.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  return unique.slice(0, 4);
}

// ============= EXPORT FOR COMPONENTS =============

export function getSuggestedHealingPractices(
  analysis: EmotionalAnalysis,
  coreIdentity: CoreIdentity
): HealingRecommendation[] {
  return generateHealingRecommendation(analysis, coreIdentity);
}
