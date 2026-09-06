import type { InnerworkContent } from "./innerworkContent";
import { isEnlEdition } from "@/lib/config/edition";

type InnerworkVariationCategory = "journaling" | "meditation" | "audioHealing" | "manifestation" | "yoga" | "workout" | "healthyFood";

const item = (id: string, title: string, description: string, durationMinutes: number, instruction: string[], benefits: string[]): InnerworkContent => ({ id, title, description, durationMinutes, instruction, benefits });

const INNERWORK_VARIATION_LIBRARY_ID: Record<InnerworkVariationCategory, InnerworkContent[]> = {
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

const INNERWORK_VARIATION_LIBRARY_EN: Record<InnerworkVariationCategory, InnerworkContent[]> = {
  journaling: [
    item("journal-pattern-loop", "Recurring Pattern Journal", "Recognizing recurring situations, automatic responses, and unmet needs.", 12, ["Write down the recurring situation", "Note the automatic reaction that arose", "Name the unmet need beneath it"], ["Pattern awareness", "Emotional clarity"]),
    item("journal-inner-child", "Letter to Younger Self", "Listening to the part of you seeking safety and reassurance.", 15, ["Envision yourself at an age needing support", "Write what that younger self needed to hear", "Close with one realistic promise"], ["Self-compassion", "Inner safety"]),
    item("journal-strength-trace", "Daily Strength Trace", "Observing how natural inner strengths navigated your day.", 10, ["Recall one moment you handled well", "Recognize the quality that supported you", "Choose how to apply it again"], ["Self-trust", "Strength integration"]),
    item("journal-boundary", "Healthy Boundary Journal", "Balancing empathy with personal energy limits.", 12, ["Describe the situation draining your energy", "Separate your responsibility from theirs", "Craft one calm, gentle boundary statement"], ["Relational clarity", "Energy preservation"]),
    item("journal-future-self", "Conversation with Future Self", "Connecting today's choices with the person you are becoming.", 15, ["Envision yourself one year from now", "Ask what habit served you best", "Select one tangible action for today"], ["Life direction", "Grounded motivation"]),
    item("journal-value", "Value Creation Journal", "Identifying meaningful contributions aligned with your gifts.", 12, ["Write a problem you care to help solve", "List strengths you can offer", "Design one small test experiment"], ["Work direction", "Value clarity"]),
  ],
  meditation: [
    item("meditation-body-anchor", "Body Anchor Meditation", "Returning attention from mental chatter to bodily sensations.", 8, ["Feel your feet and palms", "Follow ten natural breaths", "Soften jaw and shoulders"], ["Grounding", "Nervous system regulation"]),
    item("meditation-heart-space", "Heart Space Meditation", "Holding space for emotions without needing to fix them.", 12, ["Place a hand over your heart", "Gently name your emotion", "Breathe space around the feeling"], ["Emotional acceptance", "Gentleness"]),
    item("meditation-clarity", "Decision Clarity Meditation", "Creating a mindful pause before making choices.", 10, ["Sit comfortably", "Observe options without judgment", "Notice physical responses to each path"], ["Clarity", "Mindful decision-making"]),
    item("meditation-energy-wave", "Energy Wave Meditation", "Riding the ebbs and flows of energy without forcing stillness.", 12, ["Scan from feet to head", "Observe dense and light areas", "Let breath match bodily rhythm"], ["Energy awareness", "Restoration"]),
    item("meditation-self-trust", "Inner Trust Meditation", "Connecting with the quiet voice of inner knowing.", 10, ["Inhale gently", "Recall a choice you navigated well", "Affirm: I can take this step by step"], ["Self-trust", "Equanimity"]),
    item("meditation-release", "Burden Release Meditation", "Assisting the body to release unneeded physical tension.", 15, ["Inhale acknowledging tension", "Exhale softening the muscles", "Conclude with two minutes of stillness"], ["Release", "Inner rest"]),
  ],
  audioHealing: [
    item("audio-rain-grounding", "Gentle Rain for Grounding", "Rain sounds to help the mind return to a calm rhythm.", 18, ["Keep volume low", "Close your eyes", "Listen from nearest sound to furthest"], ["Grounding", "Soft focus"]),
    item("audio-ocean-release", "Ocean Waves for Release", "Ocean rhythm supporting emotions to flow freely.", 20, ["Lie down comfortably", "Match exhalations with receding waves", "Let feelings arise without storylines"], ["Emotional release", "Relaxation"]),
    item("audio-forest-focus", "Forest for Clarity", "Natural soundscape to cultivate relaxed focus.", 15, ["Sit upright yet relaxed", "Listen to three layers of sound", "Return to the breath when the mind wanders"], ["Clarity", "Presence"]),
    item("audio-741-clarity", "Solfeggio 741Hz - Clarity", "Frequency companion for clear reflection and expression.", 15, ["Use a comfortable volume", "Breathe naturally", "Jot down a single sentence post-session"], ["Expressive clarity", "Reflection"]),
    item("audio-639-connection", "Solfeggio 639Hz - Connection", "Frequency companion to soften relationship dynamics.", 15, ["Rest hand on chest", "Bring to mind a bond you wish to nurture", "Listen without forcing expectations"], ["Warm connection", "Empathy"]),
  ],
  manifestation: [
    item("manifest-grounded-intention", "Grounded Intention", "Aligning one intention with an actionable step today.", 8, ["Write your intention in one clear sentence", "Pick the smallest proof of action", "Complete it before the day ends"], ["Consistency", "Clear direction"]),
    item("manifest-self-worth", "Self-Worth Manifestation", "Anchoring self-worth independently from external outcomes.", 10, ["Note qualities that persist regardless of outcomes", "Speak affirmation softly", "Take one action honoring yourself"], ["Self-worth", "Courage"]),
    item("manifest-relationship", "Healthy Relationship Intention", "Bringing clarity to giving, receiving, and healthy boundaries.", 10, ["Note relationship qualities you wish to cultivate", "Choose one attitude you can embody", "Release the need to control others' responses"], ["Healthy boundaries", "Mindful closeness"]),
    item("manifest-career-value", "Valuable Work Manifestation", "Connecting career vision with tangible impact.", 12, ["Identify whom you wish to serve", "Define the value you want to provide", "Set up one small test step"], ["Work direction", "Value creation"]),
    item("manifest-future-self", "Embodying Future Self Today", "Living one future-self quality in present action.", 10, ["Choose one quality of your future self", "Envision how they would respond today", "Take one action embodying that quality"], ["Self-evolution", "Integration"]),
    item("manifest-release", "Manifestation After Release", "Opening new space after letting go of outdated patterns.", 8, ["Write what you choose not to carry anymore", "Declare the new space you wish to preserve", "Choose a simple closing ritual"], ["Release", "New beginnings"]),
  ],
  yoga: [
    item("yoga-moon-rest", "Moon Rest Flow", "Slow movements for days when your body calls for restoration.", 12, ["Supported Child's Pose", "Supine Twist", "Legs Up the Wall"], ["Restoration", "Calmer sleep"]),
    item("yoga-spine-reset", "Spine Reset Flow", "Spinal mobility to release tension from long sitting and intense thinking.", 14, ["Cat-Cow", "Thread the Needle", "Seated Twist"], ["Flexibility", "Back release"]),
    item("yoga-balance", "Balance & Presence Flow", "Balance postures to train focus and grounded presence.", 12, ["Mountain Pose", "Tree Pose", "Gentle Eagle Pose"], ["Focus", "Stability"]),
    item("yoga-hip-release", "Hip Release Flow", "Gentle movements for the pelvic area that stores held tension.", 15, ["Low Lunge", "Gentle Pigeon Pose", "Happy Baby"], ["Release", "Flexibility"]),
  ],
  workout: [
    item("workout-mobility", "Full Body Mobility", "Comprehensive joint mobility to awaken the body without heavy load.", 12, ["Arm circles", "Hip circles", "Bodyweight squat", "Ankle mobility"], ["Mobility", "Light energy"]),
    item("workout-core-stability", "Core Stability", "Core training for grounded posture and physical stability.", 15, ["Dead bug", "Bird dog", "Gentle side plank", "Glute bridge"], ["Stability", "Posture"]),
    item("workout-dance-release", "Dance Release", "Free movement with music to release emotions and stiffness.", 15, ["Select three uplifting songs", "Start with small movements", "Let your body guide the rhythm"], ["Emotional release", "Vitality"]),
    item("workout-strength-circuit", "Gentle Strength Circuit", "Accessible strength routine with measured pacing.", 18, ["10 squats", "10 wall push-ups", "8 reverse lunges per side", "Repeat for 3 rounds"], ["Strength", "Endurance"]),
  ],
  healthyFood: [
    item("food-oat-banana", "Warm Banana Oat", "Simple warm breakfast for steady, lasting energy.", 10, ["Cook oats until soft", "Add sliced banana", "Sprinkle a touch of cinnamon"], ["Steady energy", "Digestive ease"]),
    item("food-green-bowl", "Green Nourishing Bowl", "Balanced greens, protein, and complex carbs to fuel your day.", 20, ["Prepare fresh greens", "Add protein of choice", "Pair with rice or sweet potato"], ["Balanced nutrition", "Stamina"]),
    item("food-coconut-hydration", "Coconut Water & Chia", "Simple hydrating drink for busy or warm days.", 5, ["Pour fresh coconut water", "Add chia seeds", "Let rest for five minutes"], ["Hydration", "Freshness"]),
    item("food-chamomile", "Evening Chamomile Tea", "Warm herbal infusion to ease the transition into restful sleep.", 5, ["Brew chamomile flowers", "Steep for a few minutes", "Sip slowly away from screens"], ["Relaxation", "Bedtime ritual"]),
  ],
};

export const INNERWORK_VARIATION_LIBRARY: Record<InnerworkVariationCategory, InnerworkContent[]> = new Proxy(
  INNERWORK_VARIATION_LIBRARY_ID,
  {
    get(target, prop, receiver) {
      if (typeof prop === "string") {
        const active = isEnlEdition() ? INNERWORK_VARIATION_LIBRARY_EN : target;
        if (prop in active) {
          return active[prop as InnerworkVariationCategory];
        }
      }
      return Reflect.get(target, prop, receiver);
    },
    ownKeys() {
      return Reflect.ownKeys(INNERWORK_VARIATION_LIBRARY_ID);
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
  }
);
