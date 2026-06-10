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
  }
};
