/**
 * BHUMI AMARTYA - Innerwork Content Database
 * Static database for Yoga poses, Workouts, and Herbal recipes.
 */

export interface InnerworkContent {
  id: string;
  title: string;
  description: string;
  instruction: string[];
  benefits: string[];
  durationMinutes: number;
  ingredients?: string[];
  disclaimer?: string;
}

export const WORKOUT_DATABASE: Record<string, InnerworkContent> = {
  "hiit-energy": {
    id: "hiit-energy",
    title: "HIIT Release",
    description: "Latihan intensitas tinggi untuk melepaskan energi kompetitif dan agresi yang tertahan.",
    instruction: ["Jumping jacks 30 detik", "Mountain climbers 30 detik", "Burpees 30 detik", "Istirahat 15 detik", "Ulangi 4 kali"],
    benefits: ["Melepaskan ketegangan fisik", "Meningkatkan fokus", "Menyalurkan energi Mars"],
    durationMinutes: 15
  },
  "steady-walk": {
    id: "steady-walk",
    title: "Steady Walk",
    description: "Jalan cepat dengan ritme konstan untuk membangun stamina dan kejernihan mental.",
    instruction: ["Lakukan jalan cepat di area terbuka", "Fokus pada irama napas", "Jaga postur tubuh tetap tegak"],
    benefits: ["Membangun disiplin", "Menenangkan pikiran", "Menyeimbangkan elemen tanah"],
    durationMinutes: 30
  },
  "gentle-stretch": {
    id: "gentle-stretch",
    title: "Gentle Flow Stretch",
    description: "Peregangan lembut untuk mengembalikan fleksibilitas dan kenyamanan tubuh.",
    instruction: ["Neck rolls", "Shoulder rotations", "Forward fold", "Seated twist"],
    benefits: ["Relaksasi otot", "Meredakan stres", "Mendukung pemulihan batin"],
    durationMinutes: 10
  },
  "restorative-rest": {
    id: "restorative-rest",
    title: "Restorative Recovery",
    description: "Gerakan minimalis untuk pemulihan total saat energi sedang sangat rendah.",
    instruction: ["Lie down on your back", "Place hands on belly", "Deep slow breathing for 5 minutes", "Gentle limb shaking"],
    benefits: ["Nervous system reset", "Deep recovery", "Energy preservation"],
    durationMinutes: 8
  },
  "endurance-build": {
    id: "endurance-build",
    title: "Endurance Building",
    description: "Latihan ritmik untuk membangun daya tahan batin dan fisik secara bertahap.",
    instruction: ["Slow jogging or rhythmic step 10 min", "Squat holds 30s", "Plank 30s", "Repeat 3 times"],
    benefits: ["Physical resilience", "Mental grit", "Steady energy flow"],
    durationMinutes: 20
  }
};

export const YOGA_DATABASE: Record<string, InnerworkContent> = {
  "grounding-earth": {
    id: "grounding-earth",
    title: "Earth Connection Yoga",
    description: "Pose yang berfokus pada keseimbangan dan stabilitas.",
    instruction: ["Mountain Pose (Tadasana)", "Tree Pose (Vrikshasana)", "Child's Pose (Balasana)"],
    benefits: ["Rasa aman", "Fokus", "Stabilitas emosi"],
    durationMinutes: 12
  },
  "heart-opening": {
    id: "heart-opening",
    title: "Heart Opening Flow",
    description: "Pose untuk membuka area dada dan meningkatkan empati.",
    instruction: ["Cobra Pose (Bhujangasana)", "Camel Pose (Ustrasana)", "Bridge Pose (Setu Bandhasana)"],
    benefits: ["Keterbukaan emosional", "Meredakan duka", "Melancarkan sirkulasi"],
    durationMinutes: 15
  },
  "solar-confidence": {
    id: "solar-confidence",
    title: "Warrior Confidence",
    description: "Membangun api internal dan keberanian diri.",
    instruction: ["Warrior I", "Warrior II", "Plank Pose"],
    benefits: ["Kepercayaan diri", "Tekad", "Kekuatan batin"],
    durationMinutes: 10
  },
  "throat-clarity": {
    id: "throat-clarity",
    title: "Vocal Clarity Flow",
    description: "Pose untuk melepaskan hambatan di area tenggorokan dan ekspresi diri.",
    instruction: ["Cat-Cow stretch with neck focus", "Fish Pose (Matsyasana)", "Lion's Breath"],
    benefits: ["Honest expression", "Clear communication", "Thyroid health"],
    durationMinutes: 12
  },
  "sacral-fluidity": {
    id: "sacral-fluidity",
    title: "Sacral Fluidity",
    description: "Gerakan panggul untuk melepaskan emosi yang tertahan dan kreativitas.",
    instruction: ["Hip circles", "Pigeon Pose", "Bound Angle Pose (Baddha Konasana)"],
    benefits: ["Emotional release", "Creative spark", "Flexibility"],
    durationMinutes: 15
  },
  "crown-connection": {
    id: "crown-connection",
    title: "Crown Silence Flow",
    description: "Gerakan lembut untuk menghubungkan batin dengan kesadaran yang lebih luas.",
    instruction: ["Child's Pose with head support", "Downward Dog (Adho Mukha Svanasana)", "Seated Meditation"],
    benefits: ["Spiritual connection", "Mental peace", "Higher perspective"],
    durationMinutes: 10
  }
};

export const HEALTHY_FOOD_DATABASE: Record<string, InnerworkContent> = {
  "ginger-fire": {
    id: "ginger-fire",
    title: "Wedang Jahe Madu",
    description: "Minuman hangat untuk mendukung stabilitas batin dan kehangatan tubuh.",
    ingredients: ["Jahe (diiris/digeprek)", "Madu alami", "Air hangat"],
    instruction: [
      "Seduh irisan jahe dengan air hangat",
      "Diamkan beberapa menit agar sarinya keluar",
      "Tambahkan madu saat suhu sudah tidak terlalu panas"
    ],
    benefits: ["Meningkatkan stamina", "Menghangatkan tubuh", "Memperkuat api pencernaan"],
    durationMinutes: 5,
    disclaimer: "Jika kamu memiliki kondisi kesehatan tertentu, sesuaikan dengan kebutuhan tubuhmu."
  },
  "turmeric-glow": {
    id: "turmeric-glow",
    title: "Kunyit Asam Segar",
    description: "Minuman tradisional untuk membersihkan jalur energi dan detoksifikasi alami.",
    ingredients: ["Kunyit segar (parut/iris)", "Asam jawa", "Gula aren secukupnya"],
    instruction: [
      "Campur parutan kunyit dengan air asam jawa",
      "Tambahkan sedikit gula aren",
      "Saring dan nikmati dalam keadaan segar"
    ],
    benefits: ["Detoksifikasi", "Anti-inflamasi", "Mencerahkan aura"],
    durationMinutes: 10,
    disclaimer: "Rekomendasi ini bersifat pendamping gaya hidup, bukan pengganti saran medis."
  },
  "lemongrass-calm": {
    id: "lemongrass-calm",
    title: "Teh Serai Menenangkan",
    description: "Minuman herbal untuk menenangkan saraf dan mendukung istirahat berkualitas.",
    ingredients: ["2-3 batang serai (geprek)", "Air panas", "Lemon (opsional)"],
    instruction: [
      "Geprek batang serai agar aromanya keluar",
      "Seduh dengan air panas dalam cangkir",
      "Minum perlahan sambil menikmati aromanya"
    ],
    benefits: ["Kualitas tidur", "Penenang saraf", "Meredakan gelisah"],
    durationMinutes: 5,
    disclaimer: "Hindari konsumsi berlebih jika sedang hamil atau menyusui tanpa konsultasi dokter."
  },
  "grounding-food": {
    id: "grounding-food",
    title: "Makanan Grounding (Umbi-umbian)",
    description: "Makanan dari tanah untuk membantu stabilitas saat pikiran terasa melayang.",
    ingredients: ["Ubi jalar atau kentang", "Sedikit garam laut", "Minyak zaitun atau mentega"],
    instruction: [
      "Kukus atau rebus umbi-umbian hingga empuk",
      "Tambahkan sedikit garam laut untuk mineral",
      "Konsumsi dalam keadaan hangat dengan penuh kesadaran"
    ],
    benefits: ["Stabilitas emosi", "Koneksi dengan bumi", "Menyangga energi"],
    durationMinutes: 20,
    disclaimer: "Pilih sumber makanan organik jika memungkinkan untuk manfaat maksimal."
  },
  "cooling-mint": {
    id: "cooling-mint",
    title: "Cooling Mint & Cucumber",
    description: "Minuman penyegar untuk menenangkan amarah atau panas batin yang berlebih.",
    ingredients: ["Daun mint segar", "Irisan mentimun", "Air dingin/suhu ruang"],
    instruction: ["Masukkan mint dan mentimun ke dalam air", "Diamkan sejenak", "Minum dengan kesadaran untuk mendinginkan emosi"],
    benefits: ["Cooling anger", "Hydration", "Calm focus"],
    durationMinutes: 5
  },
  "nourishing-soup": {
    id: "nourishing-soup",
    title: "Nourishing Warm Soup",
    description: "Sup hangat untuk memulihkan tenaga batin yang terkuras.",
    ingredients: ["Sayuran hijau", "Kaldu bening", "Sedikit bawang putih"],
    instruction: ["Masak sup dengan api kecil", "Nikmati selagi hangat dalam hening"],
    benefits: ["Nourishing the soul", "Physical recovery", "Gentle digestion"],
    durationMinutes: 15
  }
};

export const AUDIO_HEALING_DATABASE: Record<string, InnerworkContent> = {
  "frequency-396": {
    id: "frequency-396",
    title: "Solfeggio 396Hz - Liberation",
    description: "Frekuensi untuk melepaskan rasa takut, rasa bersalah, dan hambatan batin.",
    instruction: ["Gunakan headphone jika memungkinkan", "Duduk atau berbaring dengan nyaman", "Bernapaslah dengan ritme yang alami"],
    benefits: ["Melepaskan kecemasan", "Membersihkan rasa bersalah", "Grounding emosional"],
    durationMinutes: 15
  },
  "frequency-432": {
    id: "frequency-432",
    title: "Nature Harmony 432Hz",
    description: "Frekuensi penyelarasan dengan alam untuk ketenangan mendalam dan penyembuhan seluler.",
    instruction: ["Fokus pada getaran suara", "Bayangkan dirimu berada di tengah hutan yang tenang", "Lepaskan ketegangan di area wajah dan rahang"],
    benefits: ["Ketenangan pikiran", "Penyelarasan energi batin", "Meningkatkan intuisi"],
    durationMinutes: 20
  },
  "frequency-528": {
    id: "frequency-528",
    title: "Transformation 528Hz",
    description: "Dikenal sebagai frekuensi 'Love' atau 'Miracle', mendukung perbaikan DNA dan transformasi positif.",
    instruction: ["Buka hati untuk menerima energi baru", "Visualisasikan cahaya keemasan di area dada", "Ucapkan afirmasi syukur dalam hati"],
    benefits: ["Transformasi batin", "Energi cinta kasih", "Pemulihan vitalitas"],
    durationMinutes: 15
  }
};
