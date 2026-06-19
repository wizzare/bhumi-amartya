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
