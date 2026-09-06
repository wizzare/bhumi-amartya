import { isEnlEdition } from "@/lib/config/edition";
import { AuraScores } from "./auraAdapter";

export interface AuraResult {
  primaryAura: string;
  secondaryAura: string;
  shadowAura: string;
  scores: Record<string, number>;
  summary: string;
  strengths: string[];
  challenges: string[];
  growth: string;
  supportExplanation: string;
  shadowExplanation: string;
}

interface AuraStaticData {
  name: string;
  keyword: string;
  summary: string;
  strengths: string[];
  challenges: string[];
  growth: string;
}

const AURA_STATIC_RECORDS: Record<string, AuraStaticData> = {
  MERAH: {
    name: "Merah",
    keyword: "Keberanian, Aksi, Ketegasan",
    summary: "Energi Merah melambangkan kekuatan fisik, vitalitas, keberanian, dan dorongan kuat untuk mengambil tindakan nyata. Kamu adalah orang yang praktis, berorientasi pada hasil, dan tidak takut menghadapi tantangan secara langsung.",
    strengths: [
      "Keberanian mengambil keputusan cepat.",
      "Dorongan eksekusi dan aksi nyata.",
      "Ketangguhan fisik dan mental yang tinggi.",
      "Kemandirian dan motivasi diri yang kuat.",
      "Kemampuan memimpin di situasi krisis."
    ],
    challenges: [
      "Kecenderungan tidak sabar dan impulsif.",
      "Mudah terpancing amarah atau frustrasi.",
      "Kesulitan mendelegasikan tugas kepada orang lain.",
      "Risiko kelelahan fisik karena terus-menerus bergerak.",
      "Kurang mempertimbangkan perasaan orang lain saat mengejar target."
    ],
    growth: "Kamu saat ini sedang belajar menyeimbangkan dorongan aksimu dengan kesabaran, memahami bahwa tidak semua hal bisa dipercepat, dan bahwa jeda sebelum bertindak adalah bagian dari strategi pertumbuhan jangka panjangmu."
  },
  JINGGA: {
    name: "Jingga",
    keyword: "Kreativitas, Ekspresi, Antusiasme",
    summary: "Energi Jingga melambangkan kreativitas yang meluap, ekspresi diri yang bebas, emosi yang kaya, dan antusiasme sosial. Kamu membawa keceriaan dan daya cipta ke mana pun kamu pergi, selalu mencari cara baru yang unik untuk mengekspresikan diri.",
    strengths: [
      "Daya imajinasi dan kreativitas tinggi.",
      "Kemampuan berkomunikasi secara ekspresif.",
      "Antusiasme yang menular ke lingkungan sekitar.",
      "Fleksibilitas dan kemampuan beradaptasi.",
      "Empati emosional yang hangat kepada sesama."
    ],
    challenges: [
      "Kesulitan menyelesaikan hal yang sudah dimulai.",
      "Suasana hati yang fluktuatif (moody).",
      "Sensitivitas berlebih terhadap kritik orang lain.",
      "Kecenderungan menghindari kenyataan atau tanggung jawab serius.",
      "Risiko membagi fokus terlalu tipis ke banyak hal."
    ],
    growth: "Kamu sedang didorong untuk menyalurkan energi kreatifmu ke dalam bentuk yang lebih terstruktur dan konsisten, belajar berkomitmen menyelesaikan proyek penting hingga tuntas tanpa kehilangan kegembiraan bermain."
  },
  KUNING: {
    name: "Kuning",
    keyword: "Pertumbuhan, Optimisme, Pembelajaran",
    summary: "Energi Kuning mewakili kecerdasan intelektual, optimisme yang cerah, pembelajaran yang tiada henti, dan hasrat mendalam untuk bertumbuh. Kamu memiliki rasa ingin tahu yang besar dan selalu bersemangat untuk menyerap informasi baru.",
    strengths: [
      "Pikiran yang analitis dan cepat belajar.",
      "Sikap hidup yang optimis dan penuh harapan.",
      "Kemampuan memecahkan masalah secara logis.",
      "Keinginan kuat untuk berbagi ilmu pengetahuan.",
      "Keterbukaan terhadap ide dan perspektif baru."
    ],
    challenges: [
      "Risiko berpikir terlalu berlebihan (overthinking).",
      "Kecenderungan menjadi terlalu kritis terhadap diri sendiri.",
      "Kesulitan mengambil keputusan karena terlalu banyak analisis.",
      "Merasa tidak pernah cukup tahu atau sindrom penipu (imposter syndrome).",
      "Mudah bosan jika tidak ada stimulus intelektual baru."
    ],
    growth: "Fokus pertumbuhanmu saat ini adalah memindahkan pemahaman dari pikiran logis ke dalam tindakan nyata dan kebijaksanaan hati, sehingga pengetahuan yang kamu miliki tidak hanya menjadi tumpukan konsep, melainkan panduan hidup yang hidup."
  },
  HIJAU: {
    name: "Hijau",
    keyword: "Empati, Hubungan, Penyembuhan",
    summary: "Energi Hijau melambangkan kasih sayang, empati yang mendalam, hubungan yang harmonis, dan energi penyembuhan alami. Kamu adalah jembatan kedamaian di antara sesama dan memiliki bakat alami untuk menenangkan jiwa yang gelisah.",
    strengths: [
      "Kemampuan mendengarkan tanpa menghakimi.",
      "Empati tinggi dan rasa welas asih alami.",
      "Bakat menciptakan keharmonisan di mana saja.",
      "Kepekaan terhadap kebutuhan emosional orang lain.",
      "Energi yang menenangkan dan menyembuhkan."
    ],
    challenges: [
      "Kesulitan menetapkan batasan diri (boundary) yang sehat.",
      "Cenderung mendahulukan orang lain hingga mengabaikan diri sendiri.",
      "Mudah menyerap emosi negatif (energi buruk) lingkungan sekitar.",
      "Takut akan konflik atau konfrontasi terbuka.",
      "Kecenderungan menjadi martir bagi orang lain."
    ],
    growth: "Kamu saat ini sedang belajar mencintai diri sendiri dengan kadar yang sama seperti kamu mencintai orang lain, mempraktikkan batasan yang jelas agar energi penyembuhanmu tetap murni tanpa mengorbankan kesejahteraan pribadimu."
  },
  BIRU: {
    name: "Biru",
    keyword: "Komunikasi, Inspirasi, Pengetahuan",
    summary: "Energi Biru melambangkan komunikasi yang jujur, ketenangan batin, pencarian kebenaran, dan kemampuan menjadi inspirasi. Kamu berbicara dengan tujuan dan membawa wawasan yang mendalam kepada orang-orang di sekitarmu.",
    strengths: [
      "Komunikasi yang jelas, tenang, dan efektif.",
      "Integritas tinggi dan cinta pada kebenaran.",
      "Kemampuan menyampaikan konsep rumit secara sederhana.",
      "Pembawa kedamaian dan ketenangan batin.",
      "Inspirator yang dipercaya oleh banyak orang."
    ],
    challenges: [
      "Kecenderungan menyembunyikan perasaan asli demi harmoni.",
      "Bisa terkesan dingin atau terlalu berjarak secara emosional.",
      "Kesulitan mengekspresikan kerentanan diri sendiri.",
      "Kaku terhadap aturan atau prinsip yang diyakini.",
      "Kecenderungan memendam unek-unek hingga menjadi beban."
    ],
    growth: "Kamu sedang diarahkan untuk membuka saluran ekspresi yang paling rentan dan jujur, belajar berbicara bukan hanya dari kepala yang penuh pengetahuan, melainkan dari kedalaman hati yang tulus dan apa adanya."
  },
  UNGU: {
    name: "Ungu",
    keyword: "Intuisi, Makna Hidup, Refleksi",
    summary: "Energi Ungu mewakili koneksi spiritual, intuisi yang tajam, kedalaman refleksi, dan pencarian makna hidup yang mendalam. Kamu melihat dunia di balik apa yang tampak secara fisik dan sering kali memiliki visi spiritual yang kuat.",
    strengths: [
      "Intuisi yang kuat dan bimbingan batin yang jernih.",
      "Kedalaman refleksi diri dan kesadaran batin.",
      "Kemampuan melihat gambaran besar kehidupan.",
      "Kepekaan spiritual dan pemahaman metafisik.",
      "Pembawa kebijaksanaan mistis dan filosofis."
    ],
    challenges: [
      "Risiko melayang terlalu jauh dari realitas bumi (grounding).",
      "Terlalu sensitif terhadap getaran energi halus di sekitar.",
      "Merasa terasing atau tidak dipahami oleh orang kebanyakan.",
      "Kecenderungan terlalu asyik dalam kesendirian.",
      "Kesulitan mendaratkan ide-ide besar menjadi tindakan konkret."
    ],
    growth: "Fokus batinmu saat ini adalah melatih grounding, belajar membawa kebijaksanaan rohani dan intuisi tinggimu ke dalam tindakan sehari-hari yang praktis, membumi, dan berguna bagi kehidupan nyatamu."
  },
  EMAS: {
    name: "Emas",
    keyword: "Kepemimpinan, Pengaruh, Manifestasi",
    summary: "Energi Emas melambangkan kepemimpinan yang berwibawa, daya pengaruh yang besar, kelimpahan, dan kemampuan manifestasi yang kuat. Kamu memiliki karisma alami untuk membimbing orang lain dan mewujudkan visi besar menjadi kenyataan materi.",
    strengths: [
      "Wibawa dan karisma kepemimpinan alami.",
      "Kemampuan manifestasi dan eksekusi visi besar.",
      "Daya pengaruh yang kuat untuk menginspirasi perubahan.",
      "Kepercayaan diri tinggi dan mentalitas kelimpahan.",
      "Fokus tajam pada kesuksesan jangka panjang."
    ],
    challenges: [
      "Kecenderungan menjadi terlalu dominan atau mengontrol.",
      "Tuntutan kesempurnaan (perfeksionisme) yang menuntut.",
      "Kesulitan menerima kegagalan atau kelemahan diri.",
      "Risiko kesombongan intelektual atau kekuasaan.",
      "Terlalu berfokus pada hasil luar daripada kedamaian dalam."
    ],
    growth: "Kamu saat ini sedang dibimbing untuk melunakkan kepemimpinanmu dengan kerendahan hati dan kasih sayang, menyadari bahwa kekuatan sejati bukan terletak pada kendali penuh atas keadaan, melainkan pada kemampuan memberdayakan orang lain."
  },
  PERAK: {
    name: "Perak",
    keyword: "Kebijaksanaan, Pengamatan, Kedewasaan",
    summary: "Energi Perak melambangkan kedewasaan emosi, kebijaksanaan yang hening, ketenangan dalam pengamatan, dan objektivitas yang tinggi. Kamu adalah pengamat yang ulung, bertindak sebagai cermin jernih bagi orang lain untuk berkaca.",
    strengths: [
      "Kebijaksanaan tenang dan kestabilan emosi.",
      "Kemampuan mengamati secara objektif tanpa bias.",
      "Menjadi penasihat terpercaya yang netral.",
      "Kedewasaan sikap dalam menghadapi badai kehidupan.",
      "Ketenangan batin yang mendalam dan berwibawa."
    ],
    challenges: [
      "Terlalu pasif atau ragu untuk mengambil inisiatif.",
      "Cenderung menarik diri dari interaksi sosial secara berlebih.",
      "Terkesan dingin, tidak acuh, atau tidak peduli.",
      "Ketakutan untuk terlibat secara emosional secara mendalam.",
      "Risiko memendam pemikiran berharga sendirian tanpa dibagi."
    ],
    growth: "Kamu sedang ditantang untuk keluar dari pengamatan heningmu dan mulai membagikan wawasan berhargamu secara aktif, melangkah maju ke panggung kehidupan untuk memandu sesama dengan kebijaksanaan perakmu."
  }
};

const AURA_STATIC_RECORDS_EN: Record<string, AuraStaticData> = {
  MERAH: {
    name: "Red",
    keyword: "Courage, Action, Resolve",
    summary: "Red energy embodies vitality, grounded courage, resilience, and a decisive drive toward tangible action. You are practical, outcome-focused, and step forward to meet life's demands with clarity and determination.",
    strengths: [
      "Decisive and prompt decision-making.",
      "Natural momentum for practical execution.",
      "High physical and mental resilience.",
      "Self-reliance and proactive initiative.",
      "Steady leadership in demanding situations."
    ],
    challenges: [
      "Tendency toward restlessness and impatience.",
      "Vulnerability to frustration under slow pacing.",
      "Difficulty delegating responsibilities to others.",
      "Risk of personal exhaustion from relentless drive.",
      "Focusing on targets while overlooking personal pacing."
    ],
    growth: "You are learning to balance bold action with intentional patience, recognizing that deliberate pauses and mindful pacing strengthen your long-term endeavors."
  },
  JINGGA: {
    name: "Orange",
    keyword: "Creativity, Expression, Enthusiasm",
    summary: "Orange energy represents expressive creativity, social vitality, and an open engagement with new experiences. You bring warmth and inventive spark wherever you go, continuously discovering fresh ways to express your individuality.",
    strengths: [
      "Vivid imagination and creative problem-solving.",
      "Engaging, expressive communication style.",
      "Encouraging enthusiasm that inspires those around you.",
      "Adaptability and openness to changing environments.",
      "Warm emotional resonance and relational empathy."
    ],
    challenges: [
      "Difficulty sustaining momentum on initiated projects.",
      "Fluctuating focus and shifting motivation.",
      "Heightened sensitivity to external criticism.",
      "Reluctance to engage with rigid or repetitive routines.",
      "Risk of dispersing energy across too many pursuits."
    ],
    growth: "You are being guided to channel creative energy into grounded consistency, committing to meaningful goals through completion while honoring your sense of play."
  },
  KUNING: {
    name: "Yellow",
    keyword: "Growth, Optimism, Learning",
    summary: "Yellow energy signifies mental clarity, forward-looking optimism, intellectual curiosity, and a natural affinity for lifelong learning. You possess an analytical perspective and enjoy exploring how ideas connect.",
    strengths: [
      "Sharp analytical thinking and rapid comprehension.",
      "Optimistic and solution-focused outlook.",
      "Logical reasoning and structured discernment.",
      "Eagerness to share knowledge and insights.",
      "Openness to diverse viewpoints and methodologies."
    ],
    challenges: [
      "Tendency toward mental overanalysis and overthinking.",
      "Setting overly exacting standards for yourself.",
      "Decision hesitation when evaluating too many variables.",
      "Doubting your own readiness or depth of insight.",
      "Restlessness during periods of routine or low mental stimulation."
    ],
    growth: "Your growth centers on bridging mental comprehension with everyday practice, allowing knowledge to mature into lived, heart-centered wisdom."
  },
  HIJAU: {
    name: "Green",
    keyword: "Empathy, Connection, Harmony",
    summary: "Green energy reflects deep empathy, relational warmth, compassionate listening, and the creation of harmonious spaces. You offer a calming presence and have a natural capacity to cultivate mutual understanding.",
    strengths: [
      "Attentive, empathetic listening without hasty judgment.",
      "Natural compassion and warmth in relationships.",
      "Gift for resolving friction and encouraging harmony.",
      "Intuitive awareness of interpersonal emotional balance.",
      "Calming presence that fosters safety and trust."
    ],
    challenges: [
      "Difficulty maintaining clear and healthy personal boundaries.",
      "Prioritizing others' comfort at the expense of your own needs.",
      "Absorbing environmental tension and emotional fatigue.",
      "Reluctance to engage in constructive confrontation.",
      "Carrying disproportionate responsibility for group harmony."
    ],
    growth: "You are learning to nurture your own well-being with the same care you extend to others, maintaining healthy boundaries to keep your presence balanced and sustainable."
  },
  BIRU: {
    name: "Blue",
    keyword: "Communication, Inspiration, Insight",
    summary: "Blue energy symbolizes clear communication, inner composure, authentic truth, and thoughtful inspiration. You speak with purposeful reflection and bring balanced perspective to the people around you.",
    strengths: [
      "Clear, deliberate, and thoughtful communication.",
      "Strong personal integrity and respect for honesty.",
      "Ability to articulate complex ideas with simplicity.",
      "Composed demeanor that brings calm to unsettled situations.",
      "Trusted perspective that inspires clarity in others."
    ],
    challenges: [
      "Guarding feelings to maintain an appearance of composure.",
      "Appearing detached or emotionally distant at times.",
      "Reluctance to express personal vulnerability.",
      "Rigid adherence to fixed principles or expectations.",
      "Internalizing thoughts rather than expressing them openly."
    ],
    growth: "You are invited to embrace authentic vulnerability, speaking not only from clarity and intellect, but also with genuine, heartfelt openness."
  },
  UNGU: {
    name: "Violet",
    keyword: "Intuition, Life Meaning, Reflection",
    summary: "Violet energy represents intuitive depth, reflective perception, contemplation, and an enduring inquiry into life's meaning. You look beyond surface appearances and bring intentional awareness to your journey.",
    strengths: [
      "Keen intuition and inner self-guidance.",
      "Depth of self-awareness and philosophical reflection.",
      "Ability to perceive overarching patterns in life events.",
      "Reflective discernment and nuanced understanding.",
      "Appreciation for quiet contemplation and purposeful living."
    ],
    challenges: [
      "Disconnecting from practical daily routines and physical grounding.",
      "Heightened sensitivity to shifting emotional atmospheres.",
      "Feelings of isolation or being misunderstood by peers.",
      "Tendency toward excessive solitary withdrawal.",
      "Struggling to convert intuitive insights into concrete action."
    ],
    growth: "Your focus is cultivating daily grounding practices, learning to translate reflective awareness and intuitive insight into practical, everyday steps."
  },
  EMAS: {
    name: "Gold",
    keyword: "Leadership, Presence, Manifestation",
    summary: "Gold energy signifies visionary leadership, confident presence, an abundance mindset, and the capacity to manifest purposeful ideas. You possess an authentic charisma that inspires collective alignment and tangible outcomes.",
    strengths: [
      "Natural authority and inspirational leadership presence.",
      "Capacity to organize resources and execute meaningful visions.",
      "Constructive confidence and an abundance-oriented perspective.",
      "Strategic focus on sustainable, long-term impact.",
      "Ability to rally others around shared aspirations."
    ],
    challenges: [
      "Tendency toward excessive control or perfectionism.",
      "Uncompromising expectations of yourself and team members.",
      "Reluctance to acknowledge personal vulnerability or limits.",
      "Prioritizing external outcomes over personal equilibrium.",
      "Assuming full responsibility rather than delegating smoothly."
    ],
    growth: "You are learning to enrich your leadership with humility and collaboration, recognizing that lasting impact comes from empowering others rather than controlling every detail."
  },
  PERAK: {
    name: "Silver",
    keyword: "Wisdom, Observation, Maturity",
    summary: "Silver energy represents quiet maturity, perceptive observation, emotional composure, and objective perspective. You are a thoughtful observer who offers an unclouded mirror for others to see themselves clearly.",
    strengths: [
      "Quiet wisdom and steady emotional composure.",
      "Objective, perceptive observation without premature bias.",
      "Dependable, balanced counsel in complex situations.",
      "Mature perspective during difficult transitions.",
      "Inner centeredness and dignified self-possession."
    ],
    challenges: [
      "Hesitation to step forward and take decisive initiative.",
      "Tendency to retreat into detached observation.",
      "Appearing aloof or uninvolved to those seeking connection.",
      "Reluctance to engage fully in emotional vulnerability.",
      "Holding valuable observations quietly instead of contributing them."
    ],
    growth: "You are encouraged to step beyond quiet observation and actively share your insights, supporting others with your grounded wisdom and calm maturity."
  }
};

export function generateAuraResult(
  primary: string,
  secondary: string,
  shadow: string,
  scores: Record<string, number>,
  isEn: boolean = isEnlEdition()
): AuraResult {
  const records = isEn ? AURA_STATIC_RECORDS_EN : AURA_STATIC_RECORDS;
  const primaryData = records[primary] || records.KUNING;
  const secondaryData = records[secondary] || records.HIJAU;
  const shadowData = records[shadow] || records.PERAK;

  const supportExplanation = isEn
    ? `Your ${secondaryData.name} energy (${secondaryData.keyword}) acts as a supportive foundation that balances and reinforces your dominant ${primaryData.name} aura (${primaryData.keyword}). By pairing the focus of ${primaryData.keyword} with the qualities of ${secondaryData.keyword}, you can express your authentic strengths in a balanced and constructive manner.`
    : `Energi ${secondaryData.name} (${secondaryData.keyword}) dalam dirimu bertindak sebagai sistem pendukung yang memperkuat dan menyeimbangkan aura utama ${primaryData.name} (${primaryData.keyword}). Saat kamu memadukan aksi ${primaryData.keyword} dengan kecenderungan ${secondaryData.keyword}, kamu dapat mengekspresikan jati dirimu secara optimal dengan cara yang stabil dan konstruktif.`;

  const shadowExplanation = isEn
    ? `Your ${shadowData.name} energy reflects your shadow tendency, which often surfaces during moments of fatigue, stress, or feeling ungrounded. When personal balance is disrupted, ${shadowData.keyword} tendencies may manifest as inner challenges, such as: ${shadowData.challenges[0]} or ${shadowData.challenges[1]}. Recognizing these patterns helps you practice grounding and gently return to your centered self.`
    : `Energi ${shadowData.name} mewakili sisi bayangan (shadow) dalam dirimu. Sisi ini cenderung mengemuka saat kamu merasa lelah, stres, tertekan, atau kehilangan keselarasan batin. Ketika keseimbanganmu goyah, kecenderungan ${shadowData.keyword} dapat terdistorsi menjadi hambatan batin, seperti: ${shadowData.challenges[0]} atau ${shadowData.challenges[1]}. Menyadari sinyal ini membantumu melatih kesadaran diri (grounding) untuk kembali ke pusat keseimbanganmu.`;

  return {
    primaryAura: primary,
    secondaryAura: secondary,
    shadowAura: shadow,
    scores,
    summary: primaryData.summary,
    strengths: primaryData.strengths,
    challenges: primaryData.challenges,
    growth: primaryData.growth,
    supportExplanation,
    shadowExplanation
  };
}
