export const ASTRO_PLANET_MEANINGS: Record<string, string> = {
  Sun: "identitas inti, vitalitas, dan fokus kesadaran",
  Moon: "kebutuhan rasa aman, dunia emosi, dan naluri",
  Ascendant: "topeng sosial, kesan pertama, dan pendekatan hidup",
  Rising: "topeng sosial, kesan pertama, dan pendekatan hidup",
  MC: "puncak karier, reputasi publik, dan kontribusi tertinggi",
  Midheaven: "puncak karier, reputasi publik, dan kontribusi tertinggi",
  Mercury: "cara berpikir, komunikasi, dan memproses informasi",
  Venus: "cara mencintai, nilai estetika, dan daya tarik",
  Mars: "dorongan bertindak, keberanian, dan energi fisik",
  Jupiter: "area pertumbuhan, keberuntungan, dan perluasan makna",
  Saturn: "tanggung jawab, batasan sehat, dan pendewasaan diri",
  Uranus: "dorongan pembaruan, inovasi, dan kebebasan radikal",
  Neptune: "intuisi, empati spiritual, dan peleburan batas batin",
  Pluto: "kekuatan transformasi, regenerasi, dan pembongkaran pola lama",
  NorthNode: "arah evolusi jiwa dan tantangan pertumbuhan masa depan",
  SouthNode: "keterikatan masa lalu dan pola nyaman yang perlu dilepaskan",
  Chiron: "luka batin mendalam yang menjadi sumber kebijaksanaan penyembuhan",
  Lilith: "sisi bayangan, insting tak tertekan, dan kekuatan kemandirian",
};

export const ASTRO_SIGN_MEANINGS: Record<string, string> = {
  Aries: "secara cepat, berani, langsung, dan penuh inisiatif.",
  Taurus: "secara stabil, membumi, konsisten, dan mencari kenyamanan.",
  Gemini: "dengan rasa ingin tahu, lincah, adaptif, dan komunikatif.",
  Cancer: "dengan kepekaan, kehangatan emosional, dan insting merawat.",
  Leo: "dengan percaya diri, ekspresif, murah hati, dan penuh kebanggaan.",
  Virgo: "secara analitis, teliti, terstruktur, dan berorientasi pada perbaikan.",
  Libra: "dengan diplomasi, mencari keharmonisan, dan berorientasi pada kemitraan.",
  Scorpio: "dengan intensitas emosi, kedalaman, dan dorongan transformasi.",
  Sagittarius: "dengan antusiasme, kebebasan, dan hasrat memperluas wawasan.",
  Capricorn: "secara disiplin, bertanggung jawab, praktis, dan berorientasi pada tujuan.",
  Aquarius: "secara orisinal, independen, progresif, dan mendobrak kebiasaan.",
  Pisces: "dengan empati, kelembutan, intuitif, dan mengalir mengikuti rasa.",
};

export const ASTRO_HOUSE_MEANINGS: Record<number, { title: string; desc: string }> = {
  1: { title: "Self & Identity", desc: "Penampilan fisik, kesan pertama, dan inisiatif pribadi." },
  2: { title: "Resources & Values", desc: "Keuangan, harta benda, dan harga diri." },
  3: { title: "Mind & Local Environment", desc: "Komunikasi, saudara, dan lingkungan sekitar." },
  4: { title: "Home & Roots", desc: "Keluarga, masa kecil, dan fondasi emosional." },
  5: { title: "Creativity & Joy", desc: "Ekspresi seni, asmara, anak-anak, dan hobi." },
  6: { title: "Daily Life & Health", desc: "Rutinitas, pekerjaan harian, dan kesehatan fisik." },
  7: { title: "Partnerships", desc: "Pernikahan, komitmen, dan hubungan satu lawan satu." },
  8: { title: "Transformation & Depth", desc: "Keintiman, sumber daya bersama, dan pembaruan batin." },
  9: { title: "Expansion & Beliefs", desc: "Filsafat, perjalanan jauh, dan pendidikan tinggi." },
  10: { title: "Career & Reputation", desc: "Ambisi profesional, pencapaian publik, dan status sosial." },
  11: { title: "Community & Visions", desc: "Jaringan sosial, pertemanan, dan cita-cita masa depan." },
  12: { title: "Spirituality & Solitude", desc: "Bawah sadar, penyembuhan, dan ruang hening pribadi." },
};

export const ASTRO_ASPECT_MEANINGS: Record<string, string> = {
  Conjunction: "Penyatuan dua energi yang sangat kuat, bekerja searah namun berpotensi mendominasi satu sama lain.",
  Trine: "Aliran energi yang harmonis dan suportif, membawa kemudahan dan bakat alami tanpa banyak usaha.",
  Square: "Ketegangan dinamis yang memicu gesekan, namun memberikan dorongan besar untuk tumbuh dan bertindak.",
  Sextile: "Peluang positif yang membutuhkan sedikit inisiatif agar potensinya dapat berkembang secara maksimal.",
  Opposition: "Dua kutub yang saling tarik-menarik, menciptakan kesadaran untuk menemukan keseimbangan dan kompromi.",
};

export const LILITH_SIGN_MEANINGS: Record<string, { meaning: string; shadowTheme: string; growthInvitation: string }> = {
  Aries: { meaning: "Otonomi, keberanian, dan hak untuk hadir tanpa mengecilkan diri.", shadowTheme: "Amarah yang ditekan atau dorongan membuktikan diri melalui konflik.", growthInvitation: "Nyatakan keinginan secara langsung tanpa menjadikan perlawanan sebagai satu-satunya sumber kekuatan." },
  Taurus: { meaning: "Kedaulatan tubuh, rasa aman, nilai diri, dan kenikmatan.", shadowTheme: "Takut kehilangan, rasa bersalah saat menerima, atau keterikatan pada kontrol material.", growthInvitation: "Bangun rasa aman dari hubungan yang jujur dengan tubuh dan nilai pribadimu." },
  Gemini: { meaning: "Kebebasan berpikir, berbicara, dan menamai kebenaran yang rumit.", shadowTheme: "Menyensor suara sendiri atau memakai kata-kata untuk menghindari kerentanan.", growthInvitation: "Berani mengatakan kebenaran dengan jelas sekaligus memberi ruang bagi nuansa." },
  Cancer: { meaning: "Kebutuhan emosional, akar keluarga, dan hak untuk merasa aman.", shadowTheme: "Luka pengasuhan, rasa bersalah karena membutuhkan orang lain, atau proteksi berlebihan.", growthInvitation: "Rawat kebutuhan batin tanpa menyerahkan batas dan kedaulatan emosionalmu." },
  Leo: { meaning: "Hak untuk terlihat, berkarya, dan mengekspresikan kebanggaan yang sehat.", shadowTheme: "Takut dinilai saat bersinar atau ketergantungan pada pengakuan.", growthInvitation: "Ciptakan dari pusat diri, bukan semata untuk memperoleh tepuk tangan." },
  Virgo: { meaning: "Integritas, kecakapan, tubuh, dan dorongan memperbaiki.", shadowTheme: "Perfeksionisme, rasa tidak pernah cukup, atau penolakan terhadap kebutuhan tubuh.", growthInvitation: "Biarkan ketelitian menjadi bentuk pengabdian, bukan hukuman terhadap diri." },
  Libra: { meaning: "Kesetaraan, daya tarik, relasi, dan hak untuk memilih diri.", shadowTheme: "Mengorbankan suara demi harmoni atau menyimpan kemarahan di balik keramahan.", growthInvitation: "Bangun kedekatan yang tetap menghormati batas, pilihan, dan kebenaranmu." },
  Scorpio: { meaning: "Intimasi, kuasa, hasrat, dan transformasi tanpa kepura-puraan.", shadowTheme: "Kontrol, kecemburuan, rahasia, atau takut menyerahkan diri pada kedekatan.", growthInvitation: "Gunakan intensitas untuk kejujuran dan regenerasi, bukan permainan kuasa." },
  Sagittarius: { meaning: "Kebebasan makna, keyakinan, petualangan, dan pencarian kebenaran.", shadowTheme: "Memberontak terhadap batas atau memakai keyakinan untuk menghindari kedalaman emosi.", growthInvitation: "Hidupi kebenaran yang luas sambil tetap bertanggung jawab pada dampaknya." },
  Capricorn: { meaning: "Ambisi, otoritas, ketahanan, dan hak menentukan standar sendiri.", shadowTheme: "Takut gagal, keras terhadap diri, atau konflik dengan figur otoritas.", growthInvitation: "Bangun kuasa yang matang tanpa mengukur nilai diri hanya dari pencapaian." },
  Aquarius: { meaning: "Keunikan, kebebasan sosial, dan keberanian melampaui norma.", shadowTheme: "Merasa terasing, menolak kedekatan, atau memberontak demi jarak.", growthInvitation: "Bawa keunikanmu ke komunitas tanpa kehilangan kapasitas untuk terhubung." },
  Pisces: { meaning: "Intuisi, imajinasi, belas kasih, dan batas spiritual.", shadowTheme: "Pelarian, pengorbanan diri, atau menyerap emosi yang bukan milikmu.", growthInvitation: "Hormati intuisi sambil membangun batas yang membuat kepekaanmu tetap jernih." },
};

export const ASTRO_PLANET_MEANINGS_EN: Record<string, string> = {
  Sun: "core identity, vitality, and conscious purpose",
  Moon: "emotional safety, instinct, and inner needs",
  Ascendant: "social interface, first impression, and approach to life",
  Rising: "social interface, first impression, and approach to life",
  MC: "career culmination, public reputation, and highest contribution",
  Midheaven: "career culmination, public reputation, and highest contribution",
  Mercury: "thinking style, communication, and information processing",
  Venus: "relational values, aesthetic appreciation, and magnetic attraction",
  Mars: "drive to act, assertiveness, and physical vitality",
  Jupiter: "growth orientation, wisdom, and horizon expansion",
  Saturn: "discipline, healthy boundaries, and mature accountability",
  Uranus: "innovative impulse, progressive insight, and radical freedom",
  Neptune: "intuitive receptivity, spiritual empathy, and boundary dissolution",
  Pluto: "transformative power, regenerative depth, and release of obsolete patterns",
  NorthNode: "evolutionary growth edge and developmental trajectory",
  SouthNode: "familiar baseline and comfortable patterns to outgrow",
  Chiron: "vulnerable core that becomes a wellspring of healing wisdom",
  Lilith: "shadow autonomy, primal instinct, and sovereign self-possession",
};

export const ASTRO_SIGN_MEANINGS_EN: Record<string, string> = {
  Aries: "swiftly, courageously, directly, and with proactive initiative.",
  Taurus: "with stability, grounded consistency, and sensory patience.",
  Gemini: "with curiosity, agility, adaptability, and open communication.",
  Cancer: "with sensitivity, emotional warmth, and nurturing care.",
  Leo: "with radiant confidence, expressiveness, generosity, and creative pride.",
  Virgo: "analytically, diligently, systematically, and with a focus on refinement.",
  Libra: "diplomatically, harmoniously, and with an orientation toward balanced partnership.",
  Scorpio: "with emotional intensity, perceptive depth, and transformative conviction.",
  Sagittarius: "with enthusiasm, freedom, and an expansive quest for meaning.",
  Capricorn: "with disciplined responsibility, practical clarity, and sustained focus.",
  Aquarius: "with original independence, progressive vision, and communal insight.",
  Pisces: "with empathy, gentle intuition, and fluid receptive feeling.",
};

export const ASTRO_HOUSE_MEANINGS_EN: Record<number, { title: string; desc: string }> = {
  1: { title: "Self & Presence", desc: "entering the world, embodiment, and personal initiative" },
  2: { title: "Self-Worth & Resources", desc: "security, core values, and material stewardship" },
  3: { title: "Mind & Immediate Environment", desc: "learning, dialogue, and local connection" },
  4: { title: "Home & Emotional Roots", desc: "family, sanctuary, and foundation of belonging" },
  5: { title: "Creativity & Joy", desc: "creative self-expression, romance, and playful vitality" },
  6: { title: "Daily Rhythm & Service", desc: "habits, craft, and physical well-being" },
  7: { title: "Partnership & Relating", desc: "commitment, reciprocity, and one-on-one connection" },
  8: { title: "Intimacy & Transformation", desc: "shared resources, deep vulnerability, and inner rebirth" },
  9: { title: "Belief & Horizon Expansion", desc: "philosophy, higher wisdom, travel, and worldview" },
  10: { title: "Career & Public Standing", desc: "vocation, mature responsibility, and recognized contribution" },
  11: { title: "Community & Future Vision", desc: "friendship, collaboration, and collective aspiration" },
  12: { title: "Inner Realm & Release", desc: "solitude, spiritual integration, and subconscious healing" },
};

export const ASTRO_ASPECT_MEANINGS_EN: Record<string, string> = {
  Conjunction: "A potent union of two energies working in unison, bringing intense focus.",
  Trine: "A harmonious and supportive flow, unlocking natural talents with ease.",
  Square: "A dynamic tension generating friction, catalyzing significant conscious growth and action.",
  Sextile: "A positive opportunity requiring deliberate initiative to reach its full potential.",
  Opposition: "Two complementary poles creating heightened awareness to cultivate balance and integration.",
};

export const LILITH_SIGN_MEANINGS_EN: Record<string, { meaning: string; shadowTheme: string; growthInvitation: string }> = {
  Aries: { meaning: "Autonomy, courage, and the right to exist unapologetically.", shadowTheme: "Suppressed rage or proving self-worth through reactive conflict.", growthInvitation: "Claim desires directly without making opposition your only fuel." },
  Taurus: { meaning: "Bodily sovereignty, security, inherent self-worth, and grounded pleasure.", shadowTheme: "Fear of scarcity, guilt around receiving, or over-controlling the material realm.", growthInvitation: "Anchor security in an authentic relationship with your body and values." },
  Gemini: { meaning: "Freedom of thought, unfiltered expression, and naming complex truths.", shadowTheme: "Self-censorship or using intellectual detachment to evade vulnerability.", growthInvitation: "Speak truth clearly while holding space for emotional nuance." },
  Cancer: { meaning: "Emotional needs, ancestral belonging, and the right to feel safe.", shadowTheme: "Nurturing wounds, shame around needing others, or hyper-defensiveness.", growthInvitation: "Honor vulnerability without compromising your emotional boundaries." },
  Leo: { meaning: "The right to shine, create, and express authentic sovereign pride.", shadowTheme: "Fear of exposure, shrinking from the spotlight, or validation craving.", growthInvitation: "Create from the center of your joy rather than performing for applause." },
  Virgo: { meaning: "Integrity, somatic wisdom, competence, and instinctive discernment.", shadowTheme: "Punishing perfectionism, perpetual self-critique, or body rejection.", growthInvitation: "Let discernment serve as dedication rather than self-chastisement." },
  Libra: { meaning: "True reciprocity, aesthetic magnetism, and relational sovereignty.", shadowTheme: "People-pleasing, burying grievances, or conflict-avoidant resentment.", growthInvitation: "Build partnerships that respect your distinct individuality and voice." },
  Scorpio: { meaning: "Raw intimacy, regenerative power, and unfiltered psychological honesty.", shadowTheme: "Power struggles, jealousy, secrecy, or fear of emotional surrender.", growthInvitation: "Channel depth toward rebirth and healing rather than control." },
  Sagittarius: { meaning: "Freedom of vision, philosophical truth, and unrestrained exploration.", shadowTheme: "Dogmatism, running from commitment, or bypassing uncomfortable feelings.", growthInvitation: "Live an expansive truth while honoring the real impact of your actions." },
  Capricorn: { meaning: "Self-authored authority, endurance, and redefining personal success.", shadowTheme: "Fear of failure, internal rigidity, or struggles with hierarchical power.", growthInvitation: "Cultivate mature mastery without measuring your worth solely by output." },
  Aquarius: { meaning: "Individuality, visionary autonomy, and boundary-pushing belonging.", shadowTheme: "Alienation, defensive aloofness, or rebelling merely for detachment.", growthInvitation: "Offer your unique vision to community without disconnecting from empathy." },
  Pisces: { meaning: "Mystic intuition, oceanic empathy, and boundless creative imagination.", shadowTheme: "Escapism, martyr complexes, or absorbing emotional debris from others.", growthInvitation: "Honor your sensitivity while maintaining healthy boundaries." },
};
