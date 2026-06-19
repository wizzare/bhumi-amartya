import {
  AUDIO_HEALING_DATABASE,
  HEALTHY_FOOD_DATABASE,
  WORKOUT_DATABASE,
  YOGA_DATABASE,
  type InnerworkContent,
} from "@/lib/data/innerworkContent";
import type {
  CoachMemorySummary,
  GrowthNarrativeSummary,
  MonthlyLearningSummary,
  PracticeEffectivenessSummary,
  WeeklyLearningSummary,
} from "@/lib/types/journeyDailyRecord";

export interface InnerworkRecommendationInput {
  hdType: string;
  lifePath: number;
  arcanaCenter: number;
  localDateKey?: string;
  [key: string]: unknown;
}

export interface InnerworkRecommendationResult {
  workout: InnerworkContent & { reason: string };
  yoga: InnerworkContent & { reason: string };
  healthyFood: InnerworkContent & { reason: string };
  audioHealing: InnerworkContent & { reason: string };
  journaling: InnerworkContent & { reason: string };
  meditation: InnerworkContent & { reason: string };
  manifestation: InnerworkContent & { reason: string };
}

export type InnerworkIntensity = "gentle" | "moderate" | "active";

export interface InnerworkJourneyHistoryItem {
  date: string;
  practiceId?: string;
  innerworkType?: string;
  dominantIssue?: string;
  completed?: boolean;
  skipped?: boolean;
  reflectionResult?: string;
}

export interface InnerworkPracticeInput {
  dominantIssue: string;
  localDateKey?: string;
  navigatorMode?: string | null;
  wellnessState?: {
    energy?: number | null;
    mood?: number | null;
    nervousSystemState?: string | null;
  } | null;
  dailyScan?: {
    emotionalWord?: string | null;
    dailyNoteText?: string | null;
  } | null;
  profileMeaning?: string[] | null;
  astroContext?: string[] | null;
  journeyHistory?: InnerworkJourneyHistoryItem[] | null;
  journeyLearning?: {
    weeklyLearning?: WeeklyLearningSummary;
    monthlyLearning?: MonthlyLearningSummary;
    coachMemory?: CoachMemorySummary;
    growthNarrative?: GrowthNarrativeSummary;
    practiceEffectiveness?: PracticeEffectivenessSummary;
  } | null;
}

export interface InnerworkPractice {
  practiceId: string;
  issueKey: string;
  issueLabel: string;
  issueCategory: string;
  title: string;
  category: string;
  type: string;
  durationMinutes: number;
  description: string;
  instructions: string[];
  expectedBenefit: string[];
  intensity: InnerworkIntensity;
  whyThisPractice: string;
  navigatorMode: string;
  sourceSignals: string[];
}

export type InnerworkSupportCategory = "journaling" | "meditation" | "breathwork" | "mudra" | "yoga" | "workout" | "audio";

export interface InnerworkSupportPractice {
  practiceId: string;
  category: InnerworkSupportCategory;
  title: string;
  durationMinutes: number;
  reason: string;
  href: string;
  issueKey?: string;
  sourceTheme?: string;
  progressionStage?: number;
  score?: number;
}

export interface InnerworkDailyDecision {
  mainPractice: InnerworkPractice;
  supportPractices: InnerworkSupportPractice[];
}

type PracticeVariant = Omit<InnerworkPractice, "issueKey" | "issueLabel" | "issueCategory" | "navigatorMode" | "sourceSignals">;

const TYPE_BASED_PRACTICES: Record<string, {
  label: string;
  category: string;
  variants: Record<"RECOVERY" | "REFLECTION" | "GROWTH", PracticeVariant>;
}> = {
  love_block: {
    label: "Love Block",
    category: "relationship",
    variants: {
      RECOVERY: {
        practiceId: "love-heart-breathing",
        category: "breathwork",
        type: "breathwork.heart",
        title: "Napas Lembut untuk Ruang Hati",
        durationMinutes: 3,
        intensity: "gentle",
        description: "Menstabilkan tubuh tanpa meninggalkan tema kedekatan dan rasa aman dalam relasi.",
        whyThisPractice: "Catatan menyoroti hambatan cinta; dalam mode pemulihan, tubuh perlu aman sebelum masuk ke refleksi relasi.",
        instructions: ["Letakkan tangan di dada.", "Tarik napas empat hitungan dan embuskan enam hitungan.", "Ucapkan: kebutuhan hatiku boleh hadir tanpa dipaksa."],
        expectedBenefit: ["Menenangkan ketegangan relasi", "Membuka ruang aman di dada"],
      },
      REFLECTION: {
        practiceId: "love-relationship-journaling",
        category: "journaling",
        type: "journaling.relationship",
        title: "Jurnal Pola Kedekatan",
        durationMinutes: 7,
        intensity: "moderate",
        description: "Mengenali kebutuhan, ketakutan, dan pola yang muncul ketika kamu mendekat atau menjauh.",
        whyThisPractice: "Catatan menyoroti Love Block, sehingga praktik tetap berpusat pada pola hubungan dan kebutuhan hati.",
        instructions: ["Tulis situasi relasi yang paling mengusik.", "Catat apa yang kamu takutkan.", "Tuliskan kebutuhan yang belum terucap.", "Pilih satu batas atau permintaan yang jujur."],
        expectedBenefit: ["Memperjelas pola relasi", "Menguatkan kebutuhan emosional"],
      },
      GROWTH: {
        practiceId: "love-boundary-conversation-prep",
        category: "boundary practice",
        type: "boundaryPractice.relationship",
        title: "Persiapan Percakapan Batas",
        durationMinutes: 15,
        intensity: "active",
        description: "Menerjemahkan kesadaran relasi menjadi percakapan yang jujur dan tetap aman.",
        whyThisPractice: "Catatan menyoroti Love Block dan mode pertumbuhan mendukung tindakan relasional yang lebih dalam.",
        instructions: ["Tulis fakta tanpa tuduhan.", "Tulis perasaan dan kebutuhanmu.", "Susun satu permintaan yang jelas.", "Latih mengucapkannya dengan nada tenang."],
        expectedBenefit: ["Meningkatkan keberanian relasional", "Membangun batas sehat"],
      },
    },
  },
  inner_child: {
    label: "Inner Child",
    category: "inner child",
    variants: {
      RECOVERY: {
        practiceId: "inner-child-soothing-touch",
        category: "inner child practice",
        type: "meditation.innerChild",
        title: "Sentuhan Aman untuk Diri Kecil",
        durationMinutes: 4,
        intensity: "gentle",
        description: "Praktik menenangkan untuk memberi rasa ditemani pada bagian diri yang rentan.",
        whyThisPractice: "Isu Inner Child membutuhkan rasa aman; mode pemulihan memilih pendekatan paling lembut.",
        instructions: ["Peluk bahu atau letakkan tangan di dada.", "Bayangkan dirimu yang lebih kecil.", "Ucapkan: aku di sini dan kamu tidak sendirian.", "Bernapas perlahan."],
        expectedBenefit: ["Meningkatkan rasa aman", "Melembutkan respons emosional"],
      },
      REFLECTION: {
        practiceId: "inner-child-letter",
        category: "journaling",
        type: "journaling.innerChild",
        title: "Surat untuk Diri Kecil",
        durationMinutes: 8,
        intensity: "moderate",
        description: "Mendengar kebutuhan lama yang masih muncul dalam pengalaman hari ini.",
        whyThisPractice: "Refleksi tertulis menjaga praktik tetap spesifik pada luka dan kebutuhan Inner Child.",
        instructions: ["Tulis kepada dirimu pada usia yang terasa penting.", "Akui apa yang dulu berat.", "Tanyakan apa yang dibutuhkan.", "Jawab sebagai dirimu hari ini."],
        expectedBenefit: ["Memvalidasi pengalaman lama", "Membangun belas kasih diri"],
      },
      GROWTH: {
        practiceId: "inner-child-reparenting-action",
        category: "inner child practice",
        type: "innerChild.reparenting",
        title: "Tindakan Reparenting",
        durationMinutes: 12,
        intensity: "active",
        description: "Mengubah kebutuhan Inner Child menjadi satu tindakan perlindungan nyata.",
        whyThisPractice: "Mode pertumbuhan mendukung tindakan konkret tanpa mengubah isu Inner Child.",
        instructions: ["Identifikasi kebutuhan lama yang aktif.", "Pilih tindakan perlindungan yang bisa dilakukan hari ini.", "Lakukan tindakan itu.", "Catat perubahan yang terasa."],
        expectedBenefit: ["Membangun kepercayaan diri internal", "Mengubah wawasan menjadi perlindungan"],
      },
    },
  },
  money_block: {
    label: "Money Block",
    category: "money and safety",
    variants: {
      RECOVERY: {
        practiceId: "money-safety-grounding",
        category: "breathwork",
        type: "breathwork.grounding",
        title: "Grounding Rasa Aman Finansial",
        durationMinutes: 4,
        intensity: "gentle",
        description: "Menurunkan rasa terancam sebelum memikirkan keputusan finansial.",
        whyThisPractice: "Money Block dalam mode pemulihan membutuhkan stabilisasi rasa aman, bukan analisis panjang.",
        instructions: ["Rasakan kaki menyentuh lantai.", "Embuskan napas lebih panjang dari tarikan.", "Sebutkan tiga sumber daya yang masih tersedia.", "Tunda keputusan besar sampai tubuh lebih tenang."],
        expectedBenefit: ["Mengurangi kepanikan finansial", "Mengembalikan orientasi sumber daya"],
      },
      REFLECTION: {
        practiceId: "money-safety-journal",
        category: "money reflection",
        type: "journaling.moneySafety",
        title: "Jurnal Uang dan Rasa Aman",
        durationMinutes: 8,
        intensity: "moderate",
        description: "Membedakan fakta finansial dari ketakutan dan keyakinan lama.",
        whyThisPractice: "Catatan menyoroti Money Block, sehingga refleksi diarahkan pada uang, nilai, dan rasa aman.",
        instructions: ["Tulis fakta finansial yang sedang dihadapi.", "Pisahkan ketakutan yang belum tentu terjadi.", "Catat sumber daya yang dimiliki.", "Pilih satu langkah finansial kecil."],
        expectedBenefit: ["Meningkatkan kejernihan finansial", "Mengurangi keputusan berbasis takut"],
      },
      GROWTH: {
        practiceId: "money-resource-awareness",
        category: "money reflection",
        type: "reflection.resourceAwareness",
        title: "Peta Sumber Daya dan Nilai",
        durationMinutes: 15,
        intensity: "active",
        description: "Menghubungkan rasa aman dengan sumber daya dan tindakan yang dapat dikembangkan.",
        whyThisPractice: "Mode pertumbuhan memungkinkan Money Block diterjemahkan menjadi kesadaran sumber daya dan aksi.",
        instructions: ["Daftar sumber daya uang, waktu, keterampilan, dan dukungan.", "Tandai satu sumber daya yang belum digunakan.", "Pilih satu tindakan bernilai.", "Jadwalkan tindakan tersebut."],
        expectedBenefit: ["Menguatkan daya pilih", "Membangun hubungan sehat dengan sumber daya"],
      },
    },
  },
  over_responsibility: {
    label: "Over Responsibility",
    category: "boundaries",
    variants: {
      RECOVERY: {
        practiceId: "not-my-burden-body-awareness",
        category: "body awareness",
        type: "bodyAwareness.notMyBurden",
        title: "Beban Bukan Milikku",
        durationMinutes: 4,
        intensity: "gentle",
        description: "Merasakan lokasi beban di tubuh lalu memberi izin untuk meletakkannya.",
        whyThisPractice: "Isu tetap Over Responsibility; mode pemulihan memilih body awareness yang ringan.",
        instructions: ["Rasakan bahu dan dada.", "Sebutkan satu beban yang bukan tanggung jawabmu.", "Embuskan napas sambil melembutkan bahu.", "Pilih satu hal yang tidak akan kamu ambil alih."],
        expectedBenefit: ["Mengurangi beban tubuh", "Memperjelas tanggung jawab"],
      },
      REFLECTION: {
        practiceId: "not-my-burden-journal",
        category: "journaling",
        type: "journaling.notMyBurden",
        title: "Jurnal: Mana yang Bukan Bebanku",
        durationMinutes: 7,
        intensity: "moderate",
        description: "Memisahkan kepedulian dari tanggung jawab yang berlebihan.",
        whyThisPractice: "Catatan menyoroti Over Responsibility, sehingga refleksi diarahkan pada beban dan batas.",
        instructions: ["Daftar semua hal yang kamu pikir harus ditangani.", "Tandai yang benar-benar tanggung jawabmu.", "Coret satu beban milik orang lain.", "Tulis satu batas yang akan dijaga."],
        expectedBenefit: ["Mengurangi over-functioning", "Menguatkan batas"],
      },
      GROWTH: {
        practiceId: "boundary-action-practice",
        category: "boundary practice",
        type: "boundaryPractice.action",
        title: "Latihan Menyampaikan Batas",
        durationMinutes: 12,
        intensity: "active",
        description: "Menyiapkan dan mempraktikkan satu batas yang dapat diterapkan hari ini.",
        whyThisPractice: "Mode pertumbuhan mengubah isu Over Responsibility menjadi tindakan batas yang nyata.",
        instructions: ["Pilih satu situasi yang menguras.", "Tulis batas dalam satu kalimat.", "Latih mengucapkannya tiga kali.", "Tentukan kapan batas itu digunakan."],
        expectedBenefit: ["Meningkatkan ketegasan", "Melindungi energi"],
      },
    },
  },
  anxiety: {
    label: "Anxiety",
    category: "nervous system",
    variants: {
      RECOVERY: { practiceId: "anxiety-long-exhale", category: "breathwork", type: "breathwork.longExhale", title: "Napas Embus Panjang", durationMinutes: 3, intensity: "gentle", description: "Menurunkan aktivasi tubuh melalui embusan yang lebih panjang.", whyThisPractice: "Kecemasan membutuhkan stabilisasi sistem saraf terlebih dahulu.", instructions: ["Tarik napas empat hitungan.", "Embuskan enam hitungan.", "Ulangi tanpa menahan napas."], expectedBenefit: ["Menurunkan aktivasi", "Meningkatkan rasa aman"] },
      REFLECTION: { practiceId: "anxiety-five-senses", category: "grounding", type: "grounding.fiveSenses", title: "Grounding Lima Indra", durationMinutes: 6, intensity: "moderate", description: "Mengembalikan perhatian dari kemungkinan buruk ke keadaan nyata.", whyThisPractice: "Isu Anxiety tetap sama; mode refleksi menambah kesadaran terhadap pemicu.", instructions: ["Sebutkan lima hal yang terlihat.", "Empat hal yang terasa.", "Tiga suara.", "Dua aroma.", "Satu rasa."], expectedBenefit: ["Mengurangi putaran pikiran", "Menguatkan orientasi"] },
      GROWTH: { practiceId: "anxiety-trigger-map", category: "body awareness", type: "bodyAwareness.triggerMap", title: "Peta Pemicu dan Respons Tubuh", durationMinutes: 12, intensity: "active", description: "Memetakan pemicu, sensasi tubuh, dan respons pilihan.", whyThisPractice: "Mode pertumbuhan memperdalam pengelolaan Anxiety tanpa mengganti isu.", instructions: ["Tulis pemicu.", "Catat sensasi tubuh.", "Pisahkan fakta dari prediksi.", "Pilih respons kecil yang aman."], expectedBenefit: ["Mengenali pola kecemasan", "Meningkatkan respons sadar"] },
    },
  },
  grief: {
    label: "Grief",
    category: "emotional release",
    variants: {
      RECOVERY: { practiceId: "grief-compassion-hold", category: "meditation", type: "meditation.compassion", title: "Ruang Lembut untuk Duka", durationMinutes: 5, intensity: "gentle", description: "Menemani duka tanpa memaksa pelepasan.", whyThisPractice: "Duka membutuhkan belas kasih dan kapasitas tubuh yang aman.", instructions: ["Duduk atau berbaring nyaman.", "Letakkan tangan di area yang terasa berat.", "Izinkan emosi hadir tanpa cerita panjang.", "Akhiri dengan satu napas lembut."], expectedBenefit: ["Memvalidasi duka", "Mengurangi kesendirian emosional"] },
      REFLECTION: { practiceId: "grief-emotional-release", category: "emotional release", type: "emotionalRelease.grief", title: "Refleksi Kehilangan dan Kasih", durationMinutes: 9, intensity: "moderate", description: "Memberi bahasa pada kehilangan dan kasih yang masih tersimpan.", whyThisPractice: "Refleksi tetap berpusat pada Grief, bukan pengalihan generik.", instructions: ["Tuliskan apa yang hilang.", "Tuliskan apa yang masih berarti.", "Izinkan satu emosi utama diberi nama.", "Pilih bentuk perawatan setelah menulis."], expectedBenefit: ["Membantu pemrosesan duka", "Menghormati ikatan yang berarti"] },
      GROWTH: { practiceId: "grief-meaning-ritual", category: "emotional release", type: "emotionalRelease.ritual", title: "Ritual Makna yang Sederhana", durationMinutes: 15, intensity: "active", description: "Membuat tindakan kecil untuk menghormati kehilangan dan melanjutkan hidup.", whyThisPractice: "Mode pertumbuhan mendukung integrasi duka melalui tindakan bermakna.", instructions: ["Pilih benda atau tulisan pengingat.", "Tuliskan satu hal yang ingin dibawa maju.", "Lakukan ritual penutup sederhana.", "Catat dukungan yang dibutuhkan."], expectedBenefit: ["Mengintegrasikan kehilangan", "Membangun makna berkelanjutan"] },
    },
  },
  low_energy: {
    label: "Low Body Energy",
    category: "body recovery",
    variants: {
      RECOVERY: { practiceId: "low-energy-rest", category: "body awareness", type: "restPractice", title: "Istirahat Tanpa Syarat", durationMinutes: 4, intensity: "gentle", description: "Pemulihan singkat tanpa target performa.", whyThisPractice: "Energi tubuh rendah membutuhkan pengurangan beban.", instructions: ["Berbaring nyaman.", "Lembutkan rahang dan bahu.", "Biarkan napas alami.", "Bangun perlahan."], expectedBenefit: ["Menghemat energi", "Menenangkan tubuh"] },
      REFLECTION: { practiceId: "low-energy-body-scan", category: "body awareness", type: "bodyScan", title: "Body Scan Pemulihan", durationMinutes: 7, intensity: "gentle", description: "Mendengar bagian tubuh yang paling membutuhkan dukungan.", whyThisPractice: "Refleksi dilakukan melalui tubuh agar tidak menambah beban kognitif.", instructions: ["Pindai tubuh dari kaki ke kepala.", "Catat area lelah.", "Tanyakan kebutuhan area tersebut.", "Pilih satu bentuk perawatan."], expectedBenefit: ["Meningkatkan kesadaran tubuh", "Mengarah pada pemulihan tepat"] },
      GROWTH: { practiceId: "low-energy-gentle-stretch", category: "physical activity", type: "gentleStretch", title: "Peregangan Pemulihan", durationMinutes: 10, intensity: "moderate", description: "Gerakan ringan untuk membangun kembali energi tanpa memaksa.", whyThisPractice: "Mode pertumbuhan mengizinkan gerak, tetapi isu energi rendah tetap membatasi intensitas.", instructions: ["Putar bahu perlahan.", "Lakukan side stretch.", "Lakukan forward fold lembut.", "Berhenti bila tubuh meminta."], expectedBenefit: ["Meningkatkan sirkulasi", "Membangun energi bertahap"] },
    },
  },
};

function issueVariants(
  key: string,
  label: string,
  category: string,
  focus: string,
): typeof TYPE_BASED_PRACTICES[string] {
  return {
    label,
    category,
    variants: {
      RECOVERY: {
        practiceId: `${key}-stabilizing-breath`,
        category: "breathwork",
        type: `breathwork.${key}`,
        title: `Napas Aman: ${label}`,
        durationMinutes: 4,
        intensity: "gentle",
        description: `Menstabilkan tubuh sambil tetap hadir pada tema ${focus}.`,
        whyThisPractice: `Mode pemulihan menjaga isu ${label} tetap menjadi pusat dengan intensitas ringan.`,
        instructions: ["Rasakan kaki menyentuh lantai.", "Tarik napas perlahan dan embuskan lebih panjang.", `Akui tema ${focus} tanpa memaksakan jawaban.`],
        expectedBenefit: ["Meningkatkan rasa aman", `Melembutkan respons terhadap ${focus}`],
      },
      REFLECTION: {
        practiceId: `${key}-honest-reflection`,
        category: "journaling",
        type: `journaling.${key}`,
        title: `Refleksi Jujur: ${label}`,
        durationMinutes: 8,
        intensity: "moderate",
        description: `Mengenali pola, kebutuhan, dan pilihan yang berkaitan dengan ${focus}.`,
        whyThisPractice: `Catatan menyoroti ${label}, sehingga refleksi tidak dialihkan ke tema lain.`,
        instructions: [`Tuliskan situasi yang mengaktifkan ${focus}.`, "Catat respons otomatis yang muncul.", "Tuliskan kebutuhan yang sebenarnya.", "Pilih satu respons yang lebih sehat."],
        expectedBenefit: ["Memperjelas pola", "Membangun respons sadar"],
      },
      GROWTH: {
        practiceId: `${key}-aligned-action`,
        category: "action reflection",
        type: `action.${key}`,
        title: `Langkah Selaras: ${label}`,
        durationMinutes: 12,
        intensity: "active",
        description: `Mengubah kesadaran tentang ${focus} menjadi satu tindakan nyata.`,
        whyThisPractice: `Mode pertumbuhan memperdalam isu ${label} tanpa mengganti tema.`,
        instructions: ["Pilih satu situasi nyata.", "Tentukan respons baru yang ingin dilatih.", "Lakukan satu langkah kecil hari ini.", "Catat hasilnya."],
        expectedBenefit: ["Membangun keberanian", "Mengubah wawasan menjadi tindakan"],
      },
    },
  };
}

Object.assign(TYPE_BASED_PRACTICES, {
  boundary_issue: issueVariants("boundary-issue", "Boundary Issue", "boundaries", "batas pribadi"),
  fear_of_failure: issueVariants("fear-of-failure", "Fear of Failure", "fear and achievement", "ketakutan gagal"),
  fear_of_rejection: issueVariants("fear-of-rejection", "Fear of Rejection", "relationship safety", "ketakutan ditolak"),
  people_pleasing: issueVariants("people-pleasing", "People Pleasing", "boundaries", "dorongan menyenangkan semua orang"),
  perfectionism: issueVariants("perfectionism", "Perfectionism", "self pressure", "tuntutan sempurna"),
  self_worth: issueVariants("self-worth", "Self Worth", "self value", "nilai diri"),
  burnout: issueVariants("burnout", "Burnout", "body recovery", "kelelahan berkepanjangan"),
  difficulty_resting: issueVariants("difficulty-resting", "Difficulty Resting", "body recovery", "kesulitan beristirahat"),
});

const SUPPORT_LIBRARY: Record<string, Record<InnerworkSupportCategory, Array<Omit<InnerworkSupportPractice, "category">>>> = {
  love_block: {
    journaling: [{ practiceId: "love-unsent-letter", title: "Surat yang Tidak Pernah Terkirim", durationMinutes: 10, reason: "Memberi ruang pada kata yang tertahan.", href: "/innerwork/journaling" }],
    meditation: [{ practiceId: "love-heart-space", title: "Meditasi Ruang Hati", durationMinutes: 8, reason: "Melembutkan ketegangan dalam kedekatan.", href: "/innerwork/meditation" }],
    breathwork: [{ practiceId: "love-heart-breath", title: "Heart Breathing", durationMinutes: 4, reason: "Menjaga isu relasi tetap terasa aman di tubuh.", href: "/innerwork/meditation" }],
    mudra: [{ practiceId: "love-anjali-mudra", title: "Anjali Mudra", durationMinutes: 5, reason: "Menghadirkan keseimbangan memberi dan menerima.", href: "/innerwork/meditation" }],
    yoga: [{ practiceId: "love-heart-opening", title: "Heart Opening Stretch", durationMinutes: 12, reason: "Membuka area dada tanpa memaksa emosi.", href: "/innerwork/yoga" }],
    workout: [{ practiceId: "love-gentle-mobility", title: "Gentle Heart Mobility", durationMinutes: 10, reason: "Menggerakkan tubuh tanpa meninggalkan tema rasa aman dalam relasi.", href: "/innerwork/workout" }],
    audio: [{ practiceId: "love-emotional-audio", title: "Emotional Healing 639Hz", durationMinutes: 15, reason: "Menemani refleksi relasi dengan ritme lembut.", href: "/innerwork/audio-healing" }],
  },
  inner_child: {
    journaling: [{ practiceId: "child-what-needed", title: "Apa yang Ingin Didengar Diriku Kecil?", durationMinutes: 10, reason: "Mendengar kebutuhan lama tanpa menghakimi.", href: "/innerwork/journaling" }],
    meditation: [{ practiceId: "child-soothing", title: "Inner Child Soothing", durationMinutes: 8, reason: "Memberi pengalaman ditemani dan dilindungi.", href: "/innerwork/meditation" }],
    breathwork: [{ practiceId: "child-safe-breath", title: "Napas Rasa Aman", durationMinutes: 4, reason: "Menenangkan bagian diri yang waspada.", href: "/innerwork/meditation" }],
    mudra: [{ practiceId: "child-gyan-mudra", title: "Gyan Mudra", durationMinutes: 5, reason: "Mendukung keheningan dan penerimaan.", href: "/innerwork/meditation" }],
    yoga: [{ practiceId: "child-pose", title: "Supported Child Pose", durationMinutes: 10, reason: "Memberi tubuh bentuk perlindungan yang lembut.", href: "/innerwork/yoga" }],
    workout: [{ practiceId: "child-safe-movement", title: "Safe Gentle Movement", durationMinutes: 10, reason: "Memberi pengalaman bergerak yang aman dan tidak menuntut.", href: "/innerwork/workout" }],
    audio: [{ practiceId: "child-embrace-audio", title: "21 Hari Memeluk Luka", durationMinutes: 15, reason: "Menemani proses Inner Child tanpa tuntutan.", href: "/innerwork/audio-healing" }],
  },
  money_block: {
    journaling: [{ practiceId: "money-safety-relationship", title: "Hubunganku dengan Rasa Aman", durationMinutes: 10, reason: "Memisahkan nilai diri dari ketakutan finansial.", href: "/innerwork/journaling" }],
    meditation: [{ practiceId: "money-grounding-safety", title: "Grounding Safety", durationMinutes: 8, reason: "Menstabilkan tubuh sebelum keputusan sumber daya.", href: "/innerwork/meditation" }],
    breathwork: [{ practiceId: "money-root-breath", title: "Root Grounding Breath", durationMinutes: 4, reason: "Mengurangi rasa terancam saat memikirkan uang.", href: "/innerwork/meditation" }],
    mudra: [{ practiceId: "money-prana-mudra", title: "Prana Mudra", durationMinutes: 5, reason: "Mengingatkan tubuh pada energi yang masih tersedia.", href: "/innerwork/meditation" }],
    yoga: [{ practiceId: "money-mountain-pose", title: "Mountain Pose", durationMinutes: 10, reason: "Membangun rasa kokoh dan pijakan.", href: "/innerwork/yoga" }],
    workout: [{ practiceId: "money-grounded-walk", title: "Grounded Steady Walk", durationMinutes: 15, reason: "Menguatkan rasa pijakan sebelum mengambil keputusan sumber daya.", href: "/innerwork/workout" }],
    audio: [{ practiceId: "money-root-audio", title: "Root Safety Healing", durationMinutes: 15, reason: "Menemani pemulihan rasa aman.", href: "/innerwork/audio-healing" }],
  },
};

function supportBundle(
  key: string,
  journaling: string,
  meditation: string,
  breathwork: string,
  mudra: string,
  yoga: string,
  workout: string,
  audio: string,
  theme: string,
): Record<InnerworkSupportCategory, Array<Omit<InnerworkSupportPractice, "category">>> {
  const entry = (suffix: string, title: string, durationMinutes: number, href: string) => [{
    practiceId: `${key}-${suffix}`,
    title,
    durationMinutes,
    reason: `Pintu praktik ini tetap membahas ${theme}.`,
    href,
  }];
  return {
    journaling: entry("journal", journaling, 10, "/innerwork/journaling"),
    meditation: entry("meditation", meditation, 8, "/innerwork/meditation"),
    breathwork: entry("breath", breathwork, 4, "/innerwork/meditation"),
    mudra: entry("mudra", mudra, 5, "/innerwork/meditation"),
    yoga: entry("yoga", yoga, 10, "/innerwork/yoga"),
    workout: entry("workout", workout, 12, "/innerwork/workout"),
    audio: entry("audio", audio, 15, "/innerwork/audio-healing"),
  };
}

Object.assign(SUPPORT_LIBRARY, {
  over_responsibility: supportBundle("over-responsibility", "Beban yang Bukan Milikku", "Melepas Beban di Pundak", "Letting Go Breath", "Apana Mudra", "Supported Child Pose", "Gentle Boundary Mobility", "Melepas Peran Penyelamat", "beban dan tanggung jawab berlebih"),
  boundary_issue: supportBundle("boundary-issue", "Batas yang Perlu Kusampaikan", "Ruang Aman di Sekelilingku", "Boundary Breath", "Prithvi Mudra", "Warrior II untuk Batas", "Boundary Strength Circuit", "Safe Boundary Healing", "batas pribadi"),
  anxiety: supportBundle("anxiety", "Fakta atau Kekhawatiran?", "Meditasi Jangkar Tubuh", "Long Exhale Breath", "Gyan Mudra", "Legs Up the Wall", "Slow Grounding Walk", "Nervous System Calm", "kecemasan dan sistem saraf"),
  low_energy: supportBundle("low-energy", "Apa yang Menguras Tenagaku?", "Body Scan Pemulihan", "Restorative Breath", "Prana Mudra", "Moon Rest Flow", "Gentle Recovery Mobility", "Deep Rest Soundscape", "energi tubuh dan pemulihan"),
  grief: supportBundle("grief", "Surat untuk yang Hilang", "Compassion for Grief", "Tender Heart Breath", "Hridaya Mudra", "Supported Heart Rest", "Gentle Release Walk", "Grief Release Sound", "duka dan kehilangan"),
  fear_of_failure: supportBundle("fear-of-failure", "Jika Gagal, Apa yang Tetap Ada?", "Meditasi Keberanian Mencoba", "Courage Breath", "Abhaya Mudra", "Warrior I", "Courage Strength Basics", "Courage Without Outcome", "ketakutan gagal"),
  fear_of_rejection: supportBundle("fear-of-rejection", "Suara Diri Saat Takut Ditolak", "Belonging Meditation", "Safe Connection Breath", "Anjali Mudra", "Heart Supported Pose", "Safe Connection Mobility", "Belonging and Safety", "ketakutan ditolak"),
  people_pleasing: supportBundle("people-pleasing", "Keinginanku yang Sebenarnya", "Meditasi Izin Menjadi Diri", "Honest No Breath", "Hakini Mudra", "Mountain Pose untuk Keteguhan", "Own Rhythm Movement", "Return to Your Own Voice", "people pleasing"),
  perfectionism: supportBundle("perfectionism", "Cukup Baik untuk Hari Ini", "Meditasi Melepas Kesempurnaan", "Softening Breath", "Shuni Mudra", "Gentle Forward Fold", "Good Enough Mobility", "Permission to Be Imperfect", "perfeksionisme"),
  self_worth: supportBundle("self-worth", "Nilai Diri Tanpa Pencapaian", "Meditasi Aku Tetap Berharga", "Worthiness Breath", "Lotus Mudra", "Heart and Mountain Flow", "Strength Without Proof", "Self Worth Healing", "nilai diri"),
  burnout: supportBundle("burnout", "Apa yang Harus Dikurangi?", "Meditasi Pemulihan Mendalam", "Recovery Breath", "Prana Mudra", "Restorative Yoga", "Restorative Mobility", "Burnout Recovery Sound", "burnout dan pemulihan"),
  difficulty_resting: supportBundle("difficulty-resting", "Izin untuk Berhenti", "Meditasi Istirahat Tanpa Syarat", "Downshift Breath", "Apana Mudra", "Savasana", "Rest Without Guilt Mobility", "Sleep and Rest Healing", "kesulitan beristirahat"),
});

function dailyHash(value: string): number {
  return [...value].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
}

function supportForIssue(issue: string): Record<InnerworkSupportCategory, Array<Omit<InnerworkSupportPractice, "category">>> {
  return SUPPORT_LIBRARY[issue] ?? SUPPORT_LIBRARY.low_energy;
}

type LegacyPractice = {
  practiceId: string;
  title: string;
  category: "meditation" | "journaling" | "grounding" | "movement";
  durationMinutes: number;
  description: string;
  instructions: string[];
  expectedBenefit: string[];
  intensity: InnerworkIntensity;
  reason: string;
};

const PRACTICES: Record<string, LegacyPractice[]> = {
  over_responsibility: [
    {
      practiceId: "grounding-release-burden",
      title: "Grounding: Beban Bukan Milikku",
      category: "grounding",
      durationMinutes: 4,
      description: "Latihan singkat untuk membedakan tanggung jawabmu dari beban yang tidak perlu kamu bawa.",
      instructions: [
        "Duduk dengan kedua telapak kaki menyentuh lantai.",
        "Tarik napas perlahan dan sebutkan satu hal yang memang menjadi tanggung jawabmu.",
        "Saat mengembuskan napas, sebutkan satu beban yang boleh kamu letakkan hari ini.",
        "Ulangi tiga putaran lalu pilih satu batas kecil yang akan kamu jaga.",
      ],
      expectedBenefit: ["Mengurangi rasa terbebani", "Menguatkan batas pribadi", "Mengembalikan perhatian ke diri"],
      intensity: "gentle",
      reason: "Kamu sedang memikul terlalu banyak hal; praktik ini membantumu memilah beban dengan lembut.",
    },
    {
      practiceId: "journal-responsibility-circle",
      title: "Jurnal Lingkar Kendali",
      category: "journaling",
      durationMinutes: 7,
      description: "Pisahkan hal yang dapat kamu lakukan dari hal yang berada di luar kendalimu.",
      instructions: [
        "Buat dua kolom: Dalam Kendaliku dan Di Luar Kendaliku.",
        "Tuliskan tiga hal yang sedang memenuhi pikiranmu.",
        "Tempatkan tiap hal pada kolom yang sesuai.",
        "Pilih satu tindakan kecil hanya dari kolom Dalam Kendaliku.",
      ],
      expectedBenefit: ["Menyederhanakan perhatian", "Mengurangi dorongan mengontrol", "Menemukan langkah realistis"],
      intensity: "moderate",
      reason: "Membatasi perhatian pada hal yang dapat kamu pengaruhi akan menjaga energimu.",
    },
  ],
  emotional_fatigue: [
    {
      practiceId: "restorative-permission-to-rest",
      title: "Restorasi: Izin untuk Pulih",
      category: "meditation",
      durationMinutes: 5,
      description: "Jeda tanpa tuntutan untuk membantu tubuh menerima sinyal aman dan pulih.",
      instructions: [
        "Duduk atau berbaring dalam posisi paling nyaman.",
        "Letakkan satu tangan di dada dan satu tangan di perut.",
        "Tarik napas empat hitungan lalu embuskan enam hitungan.",
        "Ulangi dengan lembut sampai lima menit selesai.",
      ],
      expectedBenefit: ["Menurunkan ketegangan", "Memberi ruang pemulihan", "Menenangkan sistem saraf"],
      intensity: "gentle",
      reason: "Energi atau suasana hatimu sedang rendah, jadi pemulihan lebih penting daripada dorongan untuk berprestasi.",
    },
    {
      practiceId: "grounding-five-senses",
      title: "Grounding Lima Indra",
      category: "grounding",
      durationMinutes: 4,
      description: "Kembali ke saat ini melalui hal-hal nyata yang dapat ditangkap tubuh.",
      instructions: [
        "Sebutkan lima hal yang kamu lihat.",
        "Sebutkan empat hal yang dapat kamu sentuh.",
        "Dengarkan tiga suara, sadari dua aroma, lalu satu rasa.",
        "Akhiri dengan satu napas panjang tanpa menilai keadaanmu.",
      ],
      expectedBenefit: ["Mengurangi rasa kewalahan", "Mengembalikan orientasi", "Membantu hadir di tubuh"],
      intensity: "gentle",
      reason: "Saat tenaga batin menipis, orientasi melalui indra memberi pijakan yang sederhana.",
    },
  ],
  lack_of_clarity: [
    {
      practiceId: "breath-awareness-clarity",
      title: "Napas Sadar untuk Kejernihan",
      category: "meditation",
      durationMinutes: 4,
      description: "Mengurangi kebisingan pikiran tanpa memaksa jawaban muncul.",
      instructions: [
        "Duduk tegak tetapi tidak kaku.",
        "Perhatikan udara masuk dan keluar dari hidung.",
        "Setiap pikiran muncul, beri label pelan: memikirkan.",
        "Kembali ke napas sampai waktunya selesai.",
      ],
      expectedBenefit: ["Menenangkan pikiran", "Meningkatkan kejernihan", "Mengurangi tekanan untuk segera tahu"],
      intensity: "gentle",
      reason: "Kejernihan lebih mudah muncul setelah pikiran mendapat ruang, bukan ketika dipaksa mencari jawaban.",
    },
  ],
  fear_of_disappointing: [
    {
      practiceId: "journal-honest-voice",
      title: "Jurnal: Suara Kejujuran",
      category: "journaling",
      durationMinutes: 7,
      description: "Memberi ruang aman bagi kebutuhan yang tertahan karena takut mengecewakan orang lain.",
      instructions: [
        "Tulis kalimat: Seandainya aku tidak takut mengecewakan, aku akan...",
        "Lanjutkan menulis tanpa menyunting selama tiga menit.",
        "Garisbawahi satu kebutuhan yang paling jujur.",
        "Ubah kebutuhan itu menjadi satu batas yang lembut dan jelas.",
      ],
      expectedBenefit: ["Menguatkan suara diri", "Mengurangi kecemasan relasi", "Memperjelas batas"],
      intensity: "moderate",
      reason: "Kejujuran yang aman membantu kebutuhanmu terdengar tanpa harus menyerang siapa pun.",
    },
  ],
  difficulty_resting: [
    {
      practiceId: "savasana-unconditional-rest",
      title: "Savasana: Menit Tanpa Syarat",
      category: "meditation",
      durationMinutes: 5,
      description: "Istirahat sadar untuk mengingatkan tubuh bahwa nilaimu tidak bergantung pada produktivitas.",
      instructions: [
        "Berbaring dan biarkan lantai menopang seluruh berat tubuhmu.",
        "Lembutkan rahang, bahu, perut, dan telapak tangan.",
        "Ucapkan dalam hati: Aku boleh beristirahat tanpa harus mendapatkannya.",
        "Tetap diam sampai lima menit selesai lalu bangun perlahan.",
      ],
      expectedBenefit: ["Melepaskan ketegangan", "Mengurangi rasa bersalah", "Memulihkan energi"],
      intensity: "gentle",
      reason: "Tubuhmu membutuhkan pengalaman istirahat yang tidak disertai tuntutan.",
    },
  ],
  need_for_boundaries: [
    {
      practiceId: "visualization-soft-boundary",
      title: "Visualisasi Batas Lembut",
      category: "meditation",
      durationMinutes: 5,
      description: "Membangun rasa aman internal sebelum menyampaikan batas di dunia nyata.",
      instructions: [
        "Duduk nyaman dan tarik tiga napas perlahan.",
        "Bayangkan ruang hangat mengelilingi tubuhmu.",
        "Bayangkan hanya hal yang kamu izinkan dapat memasuki ruang itu.",
        "Pilih satu kalimat batas yang dapat kamu gunakan hari ini.",
      ],
      expectedBenefit: ["Menguatkan rasa aman", "Menjaga energi", "Mempersiapkan komunikasi batas"],
      intensity: "gentle",
      reason: "Batas yang sehat dimulai dari izin internal untuk menjaga ruang dan energimu.",
    },
  ],
  achievement_worth: [
    {
      practiceId: "journal-enoughness",
      title: "Refleksi: Aku Sudah Cukup",
      category: "journaling",
      durationMinutes: 6,
      description: "Menghargai keberadaan dan proses, bukan hanya hasil yang terlihat.",
      instructions: [
        "Tuliskan tiga langkah kecil yang sudah kamu lakukan hari ini.",
        "Untuk tiap langkah, tulis kualitas diri yang membuatnya mungkin.",
        "Pilih satu hal yang tidak perlu kamu sempurnakan.",
        "Akhiri dengan kalimat: Untuk hari ini, ini sudah cukup.",
      ],
      expectedBenefit: ["Membangun belas kasih diri", "Mengurangi tekanan hasil", "Menguatkan rasa cukup"],
      intensity: "moderate",
      reason: "Mengakui proses membantu nilai dirimu tidak terus bergantung pada pencapaian.",
    },
  ],
  overthinking: [
    {
      practiceId: "body-scan-short",
      title: "Body Scan Singkat",
      category: "meditation",
      durationMinutes: 6,
      description: "Memindahkan perhatian dari putaran pikiran menuju sensasi tubuh yang nyata.",
      instructions: [
        "Pejamkan mata dan rasakan kedua telapak kaki.",
        "Pindahkan perhatian perlahan ke betis, paha, perut, dada, dan wajah.",
        "Pada setiap area, cukup sadari sensasi tanpa memperbaikinya.",
        "Akhiri dengan merasakan seluruh tubuh dalam satu tarikan napas.",
      ],
      expectedBenefit: ["Memutus putaran pikiran", "Menurunkan ketegangan", "Meningkatkan kehadiran"],
      intensity: "gentle",
      reason: "Tubuh memberi jangkar ketika pikiran terlalu lama berputar.",
    },
  ],
  direction_confusion: [
    {
      practiceId: "journal-one-honest-step",
      title: "Satu Langkah yang Jujur",
      category: "journaling",
      durationMinutes: 6,
      description: "Menyederhanakan banyak pilihan menjadi satu langkah kecil yang terasa selaras.",
      instructions: [
        "Tuliskan semua pilihan yang sedang menarik perhatianmu.",
        "Lingkari pilihan yang membuat tubuh terasa sedikit lebih lapang.",
        "Tulis satu langkah yang dapat selesai dalam lima belas menit.",
        "Tentukan kapan langkah kecil itu akan dilakukan.",
      ],
      expectedBenefit: ["Mengurangi kebingungan", "Menciptakan momentum", "Menguatkan kompas batin"],
      intensity: "moderate",
      reason: "Arah menjadi lebih jelas saat pilihan besar diperkecil menjadi satu tindakan yang jujur.",
    },
  ],
  disconnection: [
    {
      practiceId: "soothing-touch-reconnect",
      title: "Sentuhan Penenang",
      category: "grounding",
      durationMinutes: 3,
      description: "Menyambung kembali perhatian dengan tubuh dan kebutuhan yang sedang hadir.",
      instructions: [
        "Letakkan telapak tangan di tengah dada.",
        "Rasakan suhu tangan dan gerakan napas.",
        "Tanyakan pelan: Apa yang paling kubutuhkan sekarang?",
        "Dengarkan jawaban pertama tanpa menghakimi.",
      ],
      expectedBenefit: ["Meningkatkan koneksi diri", "Menenangkan tubuh", "Memperjelas kebutuhan"],
      intensity: "gentle",
      reason: "Kontak fisik yang aman dapat membantumu kembali mendengar kebutuhan sendiri.",
    },
  ],
};

function normalizeIssue(issue: string): string {
  const normalized = issue.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases: Record<string, string> = {
    loveblock: "love_block",
    love_block: "love_block",
    relationship: "love_block",
    innerchild: "inner_child",
    inner_child: "inner_child",
    moneyblock: "money_block",
    money_block: "money_block",
    overresponsibility: "over_responsibility",
    over_responsibility: "over_responsibility",
    boundaryissue: "boundary_issue",
    boundary_issue: "boundary_issue",
    need_for_boundaries: "boundary_issue",
    emotional_fatigue: "low_energy",
    lowenergy: "low_energy",
    low_energy: "low_energy",
    fearoffailure: "fear_of_failure",
    fear_of_failure: "fear_of_failure",
    fearofrejection: "fear_of_rejection",
    fear_of_rejection: "fear_of_rejection",
    fear_of_disappointing: "fear_of_rejection",
    peoplepleasing: "people_pleasing",
    people_pleasing: "people_pleasing",
    perfectionism: "perfectionism",
    selfworth: "self_worth",
    self_worth: "self_worth",
    achievement_worth: "self_worth",
    burnout: "burnout",
    difficultyresting: "difficulty_resting",
    difficulty_resting: "difficulty_resting",
    anxiety: "anxiety",
    kecemasan: "anxiety",
    grief: "grief",
    loss_and_grief: "grief",
  };
  const resolved = aliases[normalized] || normalized;
  if (!TYPE_BASED_PRACTICES[resolved]) {
    const label = resolved.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
    TYPE_BASED_PRACTICES[resolved] = issueVariants(resolved.replaceAll("_", "-"), label, resolved, label.toLowerCase());
  }
  return resolved;
}

function recentPracticeIds(history: InnerworkJourneyHistoryItem[] | null | undefined): string[] {
  return (history ?? [])
    .filter((entry) => entry.completed && entry.practiceId)
    .slice(0, 3)
    .map((entry) => entry.practiceId as string);
}

export function mapInnerworkPractice(input: InnerworkPracticeInput): InnerworkPractice {
  const issue = normalizeIssue(input.dominantIssue);
  const definition = TYPE_BASED_PRACTICES[issue];
  const latestJourney = input.journeyHistory?.[0];
  const mode = latestJourney?.skipped
    ? "RECOVERY"
    : input.navigatorMode === "RECOVERY" || input.navigatorMode === "GROWTH"
    ? input.navigatorMode
    : "REFLECTION";
  const recentIds = recentPracticeIds(input.journeyHistory);
  const dayRotation = dailyHash(`${input.localDateKey ?? "today"}:${issue}`) % modeOrderLength(mode);
  const modeOrder: Array<"RECOVERY" | "REFLECTION" | "GROWTH"> =
    mode === "RECOVERY" ? ["RECOVERY"] : mode === "GROWTH" ? ["GROWTH", "REFLECTION", "RECOVERY"] : ["REFLECTION", "RECOVERY"];
  const rotatedModes = [...modeOrder.slice(dayRotation), ...modeOrder.slice(0, dayRotation)];
  const selectedMode = rotatedModes.find((candidateMode) => !recentIds.includes(definition.variants[candidateMode].practiceId)) ?? rotatedModes[0];
  const selected = definition.variants[selectedMode];
  const durationMinutes = latestJourney?.skipped ? Math.min(2, selected.durationMinutes) : selected.durationMinutes;
  const sourceSignals = [
    `dominantIssue:${issue}`,
    `navigatorMode:${mode}`,
    ...(input.profileMeaning ?? []).slice(0, 3).map((value) => `profile:${value}`),
    ...(input.astroContext ?? []).slice(0, 2).map((value) => `astro:${value}`),
    input.wellnessState?.energy != null ? `wellnessEnergy:${input.wellnessState.energy}` : "",
    input.wellnessState?.nervousSystemState ? `nervousSystem:${input.wellnessState.nervousSystemState}` : "",
    ...(input.journeyHistory ?? []).slice(0, 3).map((entry) => `journey:${entry.practiceId ?? "unknown"}:${entry.reflectionResult ?? "unknown"}`),
  ].filter(Boolean);
  return {
    ...selected,
    durationMinutes,
    issueKey: issue,
    issueLabel: definition.label,
    issueCategory: definition.category,
    instructions: [...selected.instructions],
    expectedBenefit: [...selected.expectedBenefit],
    navigatorMode: mode,
    sourceSignals,
  };
}

function modeOrderLength(mode: string): number {
  return mode === "RECOVERY" ? 1 : mode === "GROWTH" ? 3 : 2;
}

type ProgressionPath = {
  label: string;
  theme: string;
  stages: [string, string, string, string, string];
};

const PROGRESSION_PATHS: Record<string, ProgressionPath> = {
  over_responsibility: {
    label: "Over Responsibility",
    theme: "boundaries",
    stages: ["Body Awareness", "Melepas Beban", "Batas dengan Tanggung Jawab", "Menerima Dukungan", "Identitas di Luar Peran Penyelamat"],
  },
  difficulty_resting: {
    label: "Difficulty Resting",
    theme: "body recovery",
    stages: ["Body Awareness", "Izin untuk Beristirahat", "Batas dengan Produktivitas", "Menerima Dukungan", "Identitas di Luar Pencapaian"],
  },
  love_block: {
    label: "Love Block",
    theme: "relationship",
    stages: ["Rasa Aman di Tubuh", "Mengenali Kebutuhan Hati", "Batas dalam Kedekatan", "Menerima Cinta", "Identitas yang Tetap Utuh dalam Relasi"],
  },
  inner_child: {
    label: "Inner Child",
    theme: "inner child",
    stages: ["Rasa Aman", "Mendengar Diri Kecil", "Perlindungan dan Batas", "Menerima Dukungan", "Menjadi Pendamping bagi Diri Sendiri"],
  },
  money_block: {
    label: "Money Block",
    theme: "money and safety",
    stages: ["Rasa Aman di Tubuh", "Memisahkan Fakta dan Ketakutan", "Batas dengan Kelangkaan", "Menerima Sumber Daya", "Nilai Diri di Luar Angka"],
  },
};

const CATEGORY_LANGUAGE: Record<Exclude<InnerworkSupportCategory, "audio">, {
  prefix: string;
  duration: number;
  href: string;
}> = {
  journaling: { prefix: "Jurnal", duration: 10, href: "/innerwork/journaling" },
  meditation: { prefix: "Meditasi", duration: 8, href: "/innerwork/meditation" },
  breathwork: { prefix: "Napas", duration: 4, href: "/innerwork/meditation" },
  mudra: { prefix: "Mudra", duration: 5, href: "/innerwork/meditation" },
  yoga: { prefix: "Yoga", duration: 10, href: "/innerwork/yoga" },
  workout: { prefix: "Gerak", duration: 12, href: "/innerwork/workout" },
};

function progressionPath(issue: string, fallbackTheme: string): ProgressionPath {
  return PROGRESSION_PATHS[issue] ?? {
    label: TYPE_BASED_PRACTICES[issue]?.label ?? issue,
    theme: fallbackTheme,
    stages: ["Mengenali Tubuh", "Memberi Izin", "Membangun Batas", "Menerima Dukungan", "Mengintegrasikan Identitas"],
  };
}

function learningText(input: InnerworkPracticeInput): string {
  const learning = input.journeyLearning;
  return [
    learning?.weeklyLearning?.weeklyPattern,
    learning?.weeklyLearning?.coachObservation,
    learning?.monthlyLearning?.monthlyTheme,
    learning?.monthlyLearning?.monthlyNarrative,
    learning?.coachMemory?.coachMemory,
    learning?.growthNarrative?.growthNarrative,
    learning?.growthNarrative?.currentLesson,
    learning?.growthNarrative?.nextInvitation,
  ].filter(Boolean).join(" ").toLowerCase();
}

function determineProgressionStage(input: InnerworkPracticeInput, issue: string): number {
  const matching = (input.journeyHistory ?? []).filter((entry) => normalizeIssue(entry.dominantIssue ?? "") === issue && entry.completed);
  const helpful = matching.filter((entry) => entry.reflectionResult === "Lebih Tenang").length;
  const heavy = matching.filter((entry) => entry.reflectionResult === "Sedikit Lebih Berat").length;
  let stage = matching.length >= 21 ? 5 : matching.length >= 14 ? 4 : matching.length >= 7 ? 3 : matching.length >= 3 ? 2 : 1;
  if (helpful >= 3 && helpful > heavy * 2) stage = Math.min(5, stage + 1);
  if (heavy >= 2 && heavy >= helpful) stage = Math.max(1, stage - 1);
  const text = learningText(input);
  if (/konsisten|bertumbuh|kemajuan|lebih mudah|membantu/.test(text)) stage = Math.min(5, stage + 1);
  if (/berat|pemulihan|kelelahan|membebani/.test(text) && heavy > 0) stage = Math.max(1, stage - 1);
  return stage;
}

function generatedCandidates(
  issue: string,
  sourceTheme: string,
  category: Exclude<InnerworkSupportCategory, "audio">,
): Array<Omit<InnerworkSupportPractice, "category">> {
  const path = progressionPath(issue, sourceTheme);
  const language = CATEGORY_LANGUAGE[category];
  return path.stages.map((stage, index) => ({
    practiceId: `${issue}-${category}-stage-${index + 1}`,
    title: `${language.prefix}: ${stage}`,
    durationMinutes: language.duration + Math.min(index, 2),
    reason: `Tahap ${index + 1} untuk ${path.label}: ${stage}.`,
    href: language.href,
    issueKey: issue,
    sourceTheme: path.theme,
    progressionStage: index + 1,
  }));
}

function practiceOutcomeScore(input: InnerworkPracticeInput, candidate: Omit<InnerworkSupportPractice, "category">, category: string): number {
  let score = 0;
  for (const entry of input.journeyHistory ?? []) {
    const entryCategory = entry.innerworkType?.split(".")[0];
    const exact = entry.practiceId === candidate.practiceId;
    const sameCategory = entryCategory === category;
    if (entry.reflectionResult === "Lebih Tenang") score += exact ? 14 : sameCategory ? 5 : 0;
    if (entry.reflectionResult === "Sedikit Lebih Berat") score -= exact ? 18 : sameCategory ? 7 : 0;
    if (entry.reflectionResult === "Sama Saja") score -= exact ? 2 : 0;
  }
  const effectiveness = input.journeyLearning?.practiceEffectiveness;
  if (effectiveness?.helpfulPractices.some((value) => value.toLowerCase().includes(category))) score += 8;
  if (effectiveness?.heavyPractices.some((value) => value.toLowerCase().includes(category))) score -= 10;
  return score;
}

export function buildInnerworkDailyDecision(input: InnerworkPracticeInput): InnerworkDailyDecision {
  const mainPractice = mapInnerworkPractice(input);
  const issue = mainPractice.issueKey;
  const recentIds = new Set((input.journeyHistory ?? []).filter((entry) => entry.completed).slice(0, 14).map((entry) => entry.practiceId).filter(Boolean));
  const stage = determineProgressionStage(input, issue);
  const categories: Array<Exclude<InnerworkSupportCategory, "audio">> = ["journaling", "meditation", "breathwork", "mudra", "yoga", "workout"];
  const seed = dailyHash(`${input.localDateKey ?? "today"}:${issue}:${mainPractice.type}`);
  const supportPractices = categories
    .map((category, index) => {
      const candidates = generatedCandidates(issue, mainPractice.issueCategory, category);
      const ranked = candidates
        .map((candidate) => {
          const stageDistance = Math.abs((candidate.progressionStage ?? 1) - stage);
          const stageScore = 30 - stageDistance * 9;
          const outcomeScore = practiceOutcomeScore(input, candidate, category);
          const repeatPenalty = recentIds.has(candidate.practiceId) ? -40 : 0;
          const variation = dailyHash(`${seed}:${category}:${candidate.practiceId}:${index}`) % 7;
          return { candidate, score: stageScore + outcomeScore + repeatPenalty + variation };
        })
        .sort((left, right) => right.score - left.score);
      const selected = ranked[0];
      return { ...selected.candidate, category, score: selected.score };
    })
    .filter((support) => support.practiceId !== mainPractice.practiceId);

  return {
    mainPractice: {
      ...mainPractice,
      sourceSignals: [
        ...mainPractice.sourceSignals,
        `progressionStage:${stage}`,
        `weeklyLearning:${Boolean(input.journeyLearning?.weeklyLearning)}`,
        `monthlyTheme:${Boolean(input.journeyLearning?.monthlyLearning)}`,
        `coachMemory:${Boolean(input.journeyLearning?.coachMemory)}`,
        `practiceEffectiveness:${Boolean(input.journeyLearning?.practiceEffectiveness)}`,
        `growthNarrative:${Boolean(input.journeyLearning?.growthNarrative)}`,
      ],
    },
    supportPractices,
  };
}

export const innerworkIntelligence = {
  getPractice: mapInnerworkPractice,
  getDailyDecision: buildInnerworkDailyDecision,
  getRecommendations(input: InnerworkRecommendationInput): InnerworkRecommendationResult {
    const seed = Math.abs(
      `${input.localDateKey ?? ""}:${input.hdType}:${input.lifePath}:${input.arcanaCenter}`
        .split("")
        .reduce((total, char) => total + char.charCodeAt(0), 0),
    );
    const select = (database: Record<string, InnerworkContent>, offset: number) => {
      const values = Object.values(database);
      return values[(seed + offset) % values.length];
    };
    const withReason = (item: InnerworkContent, reason: string) => ({ ...item, reason });
    const createSimple = (
      id: string,
      title: string,
      description: string,
      instruction: string[],
      benefits: string[],
      durationMinutes: number,
      reason: string,
    ) => ({ id, title, description, instruction, benefits, durationMinutes, reason });

    return {
      workout: withReason(select(WORKOUT_DATABASE, 0), "Gerak tubuh membantu menyalurkan energi secara nyata dan terukur."),
      yoga: withReason(select(YOGA_DATABASE, 1), "Gerakan sadar membantu tubuh dan perhatian kembali pada ritme yang sama."),
      healthyFood: withReason(select(HEALTHY_FOOD_DATABASE, 2), "Asupan sederhana mendukung kestabilan tubuh selama proses batin."),
      audioHealing: withReason(select(AUDIO_HEALING_DATABASE, 3), "Ritme suara memberi jangkar ketika perhatian terasa tersebar."),
      journaling: createSimple(
        "journal-honest-check-in",
        "Jurnal Kejujuran Hari Ini",
        "Tuliskan keadaanmu tanpa perlu memperbaiki atau menjelaskannya.",
        ["Tulis apa yang paling terasa saat ini.", "Catat satu kebutuhan yang muncul.", "Pilih satu langkah kecil untuk menjaganya."],
        ["Memperjelas emosi", "Menguatkan suara diri"],
        7,
        "Refleksi tertulis membantu mengubah pengalaman yang samar menjadi kebutuhan yang dapat dikenali.",
      ),
      meditation: createSimple(
        "meditation-conscious-breath",
        "Meditasi Napas Sadar",
        "Kembali pada napas untuk memberi ruang pada tubuh dan pikiran.",
        ["Duduk nyaman.", "Amati napas tanpa mengubahnya.", "Kembali ke napas setiap kali pikiran pergi."],
        ["Menenangkan perhatian", "Mendukung kejernihan"],
        5,
        "Napas adalah jangkar yang selalu tersedia untuk mengembalikan perhatian pada saat ini.",
      ),
      manifestation: createSimple(
        "manifestation-grounded-intention",
        "Niat yang Membumi",
        "Pilih satu niat yang dapat diwujudkan melalui tindakan kecil hari ini.",
        ["Tulis satu kualitas yang ingin kamu hadirkan.", "Bayangkan satu tindakan yang mencerminkannya.", "Lakukan tindakan itu hari ini."],
        ["Menyatukan niat dan tindakan", "Membangun momentum"],
        5,
        "Niat menjadi bermakna ketika diterjemahkan menjadi tindakan yang dapat dilakukan.",
      ),
    };
  },
};
