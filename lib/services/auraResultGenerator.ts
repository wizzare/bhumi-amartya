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
    summary: "Energi Merah melambangkan kekuatan fisik, vitalitas, keberanian, dan dorongan kuat untuk mengambil tindakan nyata. Anda adalah orang yang praktis, berorientasi pada hasil, dan tidak takut menghadapi tantangan secara langsung.",
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
    growth: "Anda saat ini sedang belajar untuk menyeimbangkan dorongan aksi Anda dengan kesabaran, memahami bahwa tidak semua hal bisa dipercepat, dan bahwa jeda sebelum bertindak adalah bagian dari strategi pertumbuhan jangka panjang Anda."
  },
  JINGGA: {
    name: "Jingga",
    keyword: "Kreativitas, Ekspresi, Antusiasme",
    summary: "Energi Jingga melambangkan kreativitas yang meluap, ekspresi diri yang bebas, emosi yang kaya, dan antusiasme sosial. Anda membawa keceriaan dan daya cipta ke mana pun Anda pergi, selalu mencari cara baru yang unik untuk mengekspresikan diri.",
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
    growth: "Anda sedang didorong untuk menyalurkan energi kreatif Anda ke dalam bentuk yang lebih terstruktur dan konsisten, belajar untuk berkomitmen menyelesaikan proyek-proyek penting Anda hingga tuntas tanpa kehilangan kegembiraan bermain."
  },
  KUNING: {
    name: "Kuning",
    keyword: "Pertumbuhan, Optimisme, Pembelajaran",
    summary: "Energi Kuning mewakili kecerdasan intelektual, optimisme yang cerah, pembelajaran yang tiada henti, dan hasrat mendalam untuk bertumbuh. Anda memiliki rasa ingin tahu yang besar dan selalu bersemangat untuk menyerap informasi baru.",
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
    growth: "Fokus pertumbuhan Anda saat ini adalah memindahkan pemahaman dari pikiran logis ke dalam tindakan nyata dan kebijaksanaan hati, sehingga pengetahuan yang Anda miliki tidak hanya menjadi tumpukan konsep melainkan panduan hidup yang hidup."
  },
  HIJAU: {
    name: "Hijau",
    keyword: "Empati, Hubungan, Penyembuhan",
    summary: "Energi Hijau melambangkan kasih sayang, empati yang mendalam, hubungan yang harmonis, dan energi penyembuhan alami. Anda adalah jembatan kedamaian di antara sesama dan memiliki bakat alami untuk menenangkan jiwa yang gelisah.",
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
    growth: "Anda saat ini sedang belajar untuk mencintai diri sendiri dengan kadar yang sama dengan Anda mencintai orang lain, mempraktikkan batasan yang jelas agar energi penyembuhan Anda tetap murni tanpa mengorbankan kesejahteraan pribadi Anda."
  },
  BIRU: {
    name: "Biru",
    keyword: "Komunikasi, Inspirasi, Pengetahuan",
    summary: "Energi Biru melambangkan komunikasi yang jujur, ketenangan batin, pencarian kebenaran, dan kemampuan menjadi inspirasi. Anda berbicara dengan tujuan dan membawa wawasan yang mendalam kepada orang-orang di sekitar Anda.",
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
    growth: "Anda sedang diarahkan untuk membuka saluran ekspresi yang paling rentan dan jujur, belajar berbicara bukan hanya dari kepala yang penuh pengetahuan, melainkan dari kedalaman hati yang tulus dan apa adanya."
  },
  UNGU: {
    name: "Ungu",
    keyword: "Intuisi, Makna Hidup, Refleksi",
    summary: "Energi Ungu mewakili koneksi spiritual, intuisi yang tajam, kedalaman refleksi, dan pencarian makna hidup yang mendalam. Anda melihat dunia di balik apa yang tampak secara fisik dan sering kali memiliki visi spiritual yang kuat.",
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
    growth: "Fokus batin Anda saat ini adalah melatih grounding, belajar untuk membawa kebijaksanaan rohani dan intuisi tinggi Anda ke dalam tindakan sehari-hari yang praktis, membumi, dan berguna bagi kehidupan nyata Anda."
  },
  EMAS: {
    name: "Emas",
    keyword: "Kepemimpinan, Pengaruh, Manifestasi",
    summary: "Energi Emas melambangkan kepemimpinan yang berwibawa, daya pengaruh yang besar, kelimpahan, dan kemampuan manifestasi yang kuat. Anda memiliki karisma alami untuk membimbing orang lain dan mewujudkan visi besar menjadi kenyataan materi.",
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
    growth: "Anda saat ini sedang dibimbing untuk melunakkan kepemimpinan Anda dengan kerendahan hati dan kasih sayang, menyadari bahwa kekuatan sejati bukan terletak pada kendali penuh atas keadaan, melainkan pada kemampuan memberdayakan orang lain."
  },
  PERAK: {
    name: "Perak",
    keyword: "Kebijaksanaan, Pengamatan, Kedewasaan",
    summary: "Energi Perak melambangkan kedewasaan emosi, kebijaksanaan yang hening, ketenangan dalam pengamatan, dan objektivitas yang tinggi. Anda adalah pengamat yang ulung, bertindak sebagai cermin jernih bagi orang lain untuk berkaca.",
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
    growth: "Anda sedang ditantang untuk keluar dari pengamatan hening Anda dan mulai membagikan wawasan berharga Anda secara aktif, melangkah maju ke panggung kehidupan untuk memandu sesama dengan kebijaksanaan perak Anda."
  }
};

export function generateAuraResult(
  primary: string,
  secondary: string,
  shadow: string,
  scores: Record<string, number>
): AuraResult {
  const primaryData = AURA_STATIC_RECORDS[primary] || AURA_STATIC_RECORDS.KUNING;
  const secondaryData = AURA_STATIC_RECORDS[secondary] || AURA_STATIC_RECORDS.HIJAU;
  const shadowData = AURA_STATIC_RECORDS[shadow] || AURA_STATIC_RECORDS.PERAK;

  const supportExplanation = `Energi ${secondaryData.name} (${secondaryData.keyword}) Anda bertindak sebagai sistem pendukung yang memperkuat dan menyeimbangkan aura utama ${primaryData.name} Anda (${primaryData.keyword}). Saat Anda memadukan aksi ${primaryData.keyword} dengan kecenderungan ${secondaryData.keyword}, Anda dapat mengekspresikan jati diri Anda secara optimal dengan cara yang stabil dan konstruktif.`;

  const shadowExplanation = `Energi ${shadowData.name} mewakili sisi bayangan (shadow) Anda. Sisi ini cenderung mengemuka saat Anda merasa lelah, stres, tertekan, atau kehilangan keselarasan batin. Ketika keseimbangan Anda goyah, kecenderungan ${shadowData.keyword} Anda dapat terdistorsi menjadi hambatan batin, seperti: ${shadowData.challenges[0]} atau ${shadowData.challenges[1]}. Menyadari sinyal ini membantu Anda segera melatih kesadaran diri (grounding) untuk kembali ke pusat keseimbangan Anda.`;

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
