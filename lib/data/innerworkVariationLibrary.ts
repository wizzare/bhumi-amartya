import type { InnerworkContent } from "./innerworkContent";

type InnerworkVariationCategory = "journaling" | "meditation" | "audioHealing" | "manifestation" | "yoga" | "workout" | "healthyFood";

const item = (id: string, title: string, description: string, durationMinutes: number, instruction: string[], benefits: string[]): InnerworkContent => ({ id, title, description, durationMinutes, instruction, benefits });

export const INNERWORK_VARIATION_LIBRARY: Record<InnerworkVariationCategory, InnerworkContent[]> = {
  journaling: [
    item("journal-pattern-loop", "Jurnal Pola Berulang", "Mengenali situasi, respons, dan kebutuhan yang terus kembali.", 12, ["Tuliskan situasi yang berulang", "Catat respons otomatis yang muncul", "Tulis kebutuhan yang belum terucap"], ["Kesadaran pola", "Kejernihan emosi"]),
    item("journal-inner-child", "Surat untuk Diri yang Lebih Muda", "Mendengarkan bagian diri yang membutuhkan rasa aman.", 15, ["Bayangkan dirimu pada usia yang membutuhkan dukungan", "Tuliskan apa yang ingin ia dengar", "Akhiri dengan satu janji kecil yang realistis"], ["Self-compassion", "Rasa aman"]),
    item("journal-strength-trace", "Jejak Kekuatan Hari Ini", "Melihat cara kekuatan alami telah bekerja dalam keseharian.", 10, ["Tuliskan satu momen yang berhasil kamu jalani", "Kenali kualitas yang membantumu", "Pilih cara menggunakannya kembali"], ["Kepercayaan diri", "Integrasi bakat"]),
    item("journal-boundary", "Jurnal Batas Sehat", "Merapikan hubungan antara kepedulian dan kebutuhan diri.", 12, ["Tuliskan situasi yang mengurasmu", "Bedakan tanggung jawabmu dan milik orang lain", "Susun satu kalimat batas yang lembut"], ["Kejernihan relasi", "Perlindungan energi"]),
    item("journal-future-self", "Percakapan dengan Future Self", "Menghubungkan pilihan hari ini dengan diri yang sedang bertumbuh.", 15, ["Bayangkan dirimu satu tahun mendatang", "Tanyakan kebiasaan apa yang paling membantu", "Pilih satu tindakan untuk hari ini"], ["Arah hidup", "Motivasi membumi"]),
    item("journal-value", "Jurnal Cara Menghasilkan Nilai", "Mengenali kontribusi yang terasa berguna dan selaras.", 12, ["Tuliskan masalah yang ingin kamu bantu selesaikan", "Catat kekuatan yang dapat kamu gunakan", "Buat satu eksperimen kecil"], ["Arah karya", "Kejernihan nilai"]),
  ],
  meditation: [
    item("meditation-body-anchor", "Meditasi Jangkar Tubuh", "Mengembalikan perhatian dari pikiran ke sensasi tubuh.", 8, ["Rasakan kaki dan telapak tangan", "Ikuti sepuluh napas alami", "Lembutkan rahang dan bahu"], ["Grounding", "Regulasi saraf"]),
    item("meditation-heart-space", "Meditasi Ruang Hati", "Memberi ruang bagi emosi tanpa harus segera memperbaikinya.", 12, ["Letakkan tangan di dada", "Namai emosi dengan lembut", "Bernapas seolah memberi ruang di sekitar emosi"], ["Penerimaan emosi", "Kelembutan"]),
    item("meditation-clarity", "Meditasi Kejernihan Pilihan", "Menciptakan jeda sebelum mengambil keputusan.", 10, ["Duduk dalam posisi nyaman", "Amati pilihan tanpa menilai", "Perhatikan respons tubuh pada setiap kemungkinan"], ["Kejernihan", "Kesadaran keputusan"]),
    item("meditation-energy-wave", "Meditasi Gelombang Energi", "Mengikuti naik turunnya energi tanpa memaksanya stabil.", 12, ["Pindai tubuh dari kaki ke kepala", "Amati area yang padat dan ringan", "Biarkan napas mengikuti ritme tubuh"], ["Kesadaran energi", "Pemulihan"]),
    item("meditation-self-trust", "Meditasi Kepercayaan Diri", "Menguatkan hubungan dengan suara batin yang tenang.", 10, ["Tarik napas perlahan", "Ingat satu pilihan yang pernah kamu jalani dengan baik", "Ucapkan: aku boleh berjalan setahap demi setahap"], ["Self-trust", "Ketenangan"]),
    item("meditation-release", "Meditasi Melepaskan Beban", "Membantu tubuh menurunkan ketegangan yang tidak perlu dibawa.", 15, ["Tarik napas sambil menyadari beban", "Hembuskan perlahan sambil melunakkan tubuh", "Akhiri dengan hening dua menit"], ["Pelepasan", "Istirahat batin"]),
  ],
  audioHealing: [
    item("audio-rain-grounding", "Hujan Lembut untuk Grounding", "Suara hujan yang membantu pikiran kembali ke ritme sederhana.", 18, ["Gunakan volume rendah", "Pejamkan mata", "Ikuti suara terdekat lalu terjauh"], ["Grounding", "Fokus lembut"]),
    item("audio-ocean-release", "Ombak untuk Pelepasan", "Ritme ombak untuk menemani emosi bergerak tanpa ditahan.", 20, ["Berbaring dengan nyaman", "Samakan hembusan napas dengan surut ombak", "Biarkan emosi hadir tanpa cerita tambahan"], ["Pelepasan emosi", "Relaksasi"]),
    item("audio-forest-focus", "Hutan untuk Kejernihan", "Lanskap suara alam untuk membantu fokus tanpa menegang.", 15, ["Duduk tegak namun santai", "Dengarkan tiga lapisan suara", "Kembali ke napas saat pikiran pergi"], ["Kejernihan", "Kehadiran"]),
    item("audio-741-clarity", "Solfeggio 741Hz - Clarity", "Frekuensi pendamping untuk ruang refleksi dan ekspresi yang jernih.", 15, ["Gunakan volume nyaman", "Bernapas alami", "Tuliskan satu kalimat setelah sesi"], ["Kejernihan ekspresi", "Refleksi"]),
    item("audio-639-connection", "Solfeggio 639Hz - Connection", "Frekuensi pendamping untuk melembutkan ruang relasi.", 15, ["Letakkan tangan di dada", "Ingat relasi yang ingin dirawat", "Dengarkan tanpa memaksakan hasil"], ["Kehangatan relasi", "Empati"]),
  ],
  manifestation: [
    item("manifest-grounded-intention", "Niat yang Membumi", "Menyelaraskan satu niat dengan tindakan yang dapat dilakukan hari ini.", 8, ["Tuliskan niat dalam satu kalimat", "Pilih bukti tindakan terkecil", "Lakukan sebelum hari berakhir"], ["Konsistensi", "Arah nyata"]),
    item("manifest-self-worth", "Manifestasi Nilai Diri", "Menguatkan nilai diri tanpa menggantungkannya pada hasil.", 10, ["Tuliskan kualitas yang tetap ada saat hasil berubah", "Ucapkan afirmasi dengan suara pelan", "Ambil satu tindakan yang menghormati dirimu"], ["Self-worth", "Keberanian"]),
    item("manifest-relationship", "Niat Relasi Sehat", "Membawa kejelasan pada cara memberi, menerima, dan menjaga batas.", 10, ["Tuliskan kualitas relasi yang ingin dibangun", "Pilih satu sikap yang dapat kamu hadirkan", "Lepaskan kebutuhan mengendalikan respons orang lain"], ["Batas sehat", "Kedekatan sadar"]),
    item("manifest-career-value", "Manifestasi Karya Bernilai", "Menghubungkan visi karya dengan manfaat yang nyata.", 12, ["Tuliskan siapa yang ingin kamu bantu", "Tentukan nilai yang ingin kamu berikan", "Buat satu langkah uji kecil"], ["Arah karya", "Value creation"]),
    item("manifest-future-self", "Menjadi Future Self Hari Ini", "Menghidupi satu kualitas diri masa depan dalam tindakan sekarang.", 10, ["Pilih satu kualitas future self", "Bayangkan cara ia merespons hari ini", "Lakukan satu tindakan dari kualitas itu"], ["Evolusi diri", "Integrasi"]),
    item("manifest-release", "Manifestasi Setelah Melepaskan", "Membuka ruang baru setelah pola lama mulai dilepaskan.", 8, ["Tuliskan apa yang tidak ingin dibawa lagi", "Nyatakan ruang baru yang ingin dijaga", "Pilih ritual penutup sederhana"], ["Pelepasan", "Awal baru"]),
  ],
  yoga: [
    item("yoga-moon-rest", "Moon Rest Flow", "Gerakan lambat untuk hari ketika tubuh meminta pemulihan.", 12, ["Supported Child's Pose", "Supine Twist", "Legs Up the Wall"], ["Pemulihan", "Tidur lebih tenang"]),
    item("yoga-spine-reset", "Spine Reset Flow", "Mobilisasi tulang belakang untuk melepas ketegangan duduk dan berpikir.", 14, ["Cat-Cow", "Thread the Needle", "Seated Twist"], ["Kelenturan", "Pelepasan punggung"]),
    item("yoga-balance", "Balance & Presence Flow", "Latihan keseimbangan untuk melatih fokus dan kehadiran.", 12, ["Mountain Pose", "Tree Pose", "Eagle Pose ringan"], ["Fokus", "Stabilitas"]),
    item("yoga-hip-release", "Hip Release Flow", "Gerakan lembut untuk area panggul yang menyimpan ketegangan.", 15, ["Low Lunge", "Pigeon Pose ringan", "Happy Baby"], ["Pelepasan", "Fleksibilitas"]),
  ],
  workout: [
    item("workout-mobility", "Full Body Mobility", "Gerakan sendi menyeluruh untuk menghidupkan tubuh tanpa beban tinggi.", 12, ["Arm circles", "Hip circles", "Bodyweight squat", "Ankle mobility"], ["Mobilitas", "Energi ringan"]),
    item("workout-core-stability", "Core Stability", "Latihan pusat tubuh untuk rasa kokoh dan postur yang stabil.", 15, ["Dead bug", "Bird dog", "Side plank ringan", "Glute bridge"], ["Stabilitas", "Postur"]),
    item("workout-dance-release", "Dance Release", "Gerak bebas dengan musik untuk melepaskan emosi dan kekakuan.", 15, ["Pilih tiga lagu", "Mulai dengan gerak kecil", "Biarkan tubuh menentukan ritme"], ["Pelepasan emosi", "Vitalitas"]),
    item("workout-strength-circuit", "Gentle Strength Circuit", "Latihan kekuatan sederhana dengan ritme terukur.", 18, ["Squat 10 kali", "Wall push-up 10 kali", "Reverse lunge 8 kali per sisi", "Ulangi 3 putaran"], ["Kekuatan", "Daya tahan"]),
  ],
  healthyFood: [
    item("food-oat-banana", "Oat Pisang Hangat", "Sarapan hangat dan sederhana untuk energi yang lebih stabil.", 10, ["Masak oat hingga lembut", "Tambahkan pisang", "Taburkan kayu manis secukupnya"], ["Energi stabil", "Pencernaan nyaman"]),
    item("food-green-bowl", "Green Nourishing Bowl", "Kombinasi sayur, protein, dan karbohidrat untuk menopang aktivitas.", 20, ["Siapkan sayur hijau", "Tambahkan protein sesuai kebutuhan", "Lengkapi dengan nasi atau umbi"], ["Nutrisi seimbang", "Stamina"]),
    item("food-coconut-hydration", "Air Kelapa & Chia", "Minuman hidrasi sederhana untuk hari yang padat atau panas.", 5, ["Tuang air kelapa", "Tambahkan chia secukupnya", "Diamkan lima menit"], ["Hidrasi", "Kesegaran"]),
    item("food-chamomile", "Teh Chamomile Malam", "Minuman hangat untuk membantu transisi menuju istirahat.", 5, ["Seduh chamomile", "Diamkan beberapa menit", "Minum perlahan tanpa layar"], ["Relaksasi", "Ritual tidur"]),
  ],
};
