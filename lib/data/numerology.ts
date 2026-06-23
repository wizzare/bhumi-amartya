export interface LifePathDetail {
  role: string;
  roleId: string;
  positiveTraits: string[];
  negativeTraits: string[];
  coreJourney: string;
  majorLesson: string;
  dailyExpression: string;
}

export interface NumerologyDetail {
  summary: string;
}

export const lifePathData: Record<number, LifePathDetail> = {
  1: {
    role: "The Leader",
    roleId: "Pemimpin Pelopor",
    positiveTraits: ["Confident", "Independent", "Resourceful", "Creative"],
    negativeTraits: ["Self-centered", "Impatient", "Can be arrogant"],
    coreJourney: "melangkah secara mandiri dan mempelopori inisiatif baru",
    majorLesson: "belajar memimpin tanpa harus mendominasi atau menjadi egois",
    dailyExpression: "ketika kamu mengambil inisiatif tanpa menunggu persetujuan orang lain",
  },
  2: {
    role: "The Mediator",
    roleId: "Mediator Harmonis",
    positiveTraits: ["Harmonious", "Compassionate", "Good Listener", "Intuitive"],
    negativeTraits: ["Indecisive", "Over-sensitive", "Avoids conflict"],
    coreJourney: "menciptakan keharmonisan dan menjembatani perbedaan",
    majorLesson: "belajar menjaga kedamaian tanpa harus mengorbankan batas diri",
    dailyExpression: "ketika kamu menjadi penengah yang sabar dalam perselisihan di sekitarmu",
  },
  3: {
    role: "The Artist",
    roleId: "Artis Ekspresif",
    positiveTraits: ["Self-expressive", "Optimistic", "Communicative", "Charismatic"],
    negativeTraits: ["Superficial", "Scattered", "Can hide feelings"],
    coreJourney: "mengekspresikan kreativitas dan menyebarkan kegembiraan",
    majorLesson: "belajar menyalurkan ekspresi diri secara fokus dan jujur",
    dailyExpression: "saat kata-kata atau karyamu mampu menghidupkan suasana di sekitarmu",
  },
  4: {
    role: "The Builder",
    roleId: "Pembangun Terstruktur",
    positiveTraits: ["Loyal", "Reliable", "Determined", "Disciplined"],
    negativeTraits: ["Stubborn", "Rigid", "Can be overly cautious"],
    coreJourney: "membangun fondasi kokoh dan hasil nyata yang stabil",
    majorLesson: "belajar merawat kestabilan tanpa terjebak dalam kekakuan batin",
    dailyExpression: "ketika kamu berfokus membangun fondasi yang kokoh, baik dalam pekerjaan maupun hubungan",
  },
  5: {
    role: "The Communicator",
    roleId: "Penjelajah Dinamis",
    positiveTraits: ["Curious", "Adaptable", "Spontaneous", "Versatile"],
    negativeTraits: ["Lacks discipline", "Restless", "Can be inconsistent"],
    coreJourney: "menjelajahi perubahan dan merangkul kebebasan",
    majorLesson: "belajar menikmati petualangan tanpa kehilangan komitmen",
    dailyExpression: "saat kamu dengan cepat menyerap informasi baru dan menyesuaikan diri dengan situasi tak terduga",
  },
  6: {
    role: "The Teacher",
    roleId: "Pengayom Tulus",
    positiveTraits: ["Generous", "Patient", "Honest", "Helpful"],
    negativeTraits: ["Can be overly critical", "Self-righteous", "Burdened by responsibility"],
    coreJourney: "merawat keharmonisan keluarga dan melayani sekeliling",
    majorLesson: "belajar mendukung sesama tanpa harus memaksakan kendali",
    dailyExpression: "ketika kamu menjadi tempat bersandar dan memberikan perhatian bagi keluarga maupun teman",
  },
  7: {
    role: "The Individualist",
    roleId: "Pencari Kebijaksanaan",
    positiveTraits: ["Detail-oriented", "Intellectual", "Intuitive", "Analytical"],
    negativeTraits: ["Aloof", "Secretive", "Can be cynical"],
    coreJourney: "mencari kebenaran dan menganalisis kedalaman kehidupan",
    majorLesson: "belajar membuka diri pada dunia tanpa rasa takut",
    dailyExpression: "dari kecenderunganmu untuk mengamati situasi secara tenang sebelum mengambil kesimpulan",
  },
  8: {
    role: "The Goal-Setter",
    roleId: "Pengatur Otoritas",
    positiveTraits: ["Ambitious", "Goal-oriented", "Materially successful", "Energetic"],
    negativeTraits: ["Obsessed with money and status", "Intolerant", "Can be domineering"],
    coreJourney: "mengelola kelimpahan dan menggunakan otoritas material secara bijak",
    majorLesson: "belajar menggunakan kendali tanpa kehilangan integritas batin",
    dailyExpression: "pada kemampuanmu dalam merancang strategi praktis untuk mewujudkan rencana nyata",
  },
  9: {
    role: "The Humanitarian",
    roleId: "Kemanusiaan Universal",
    positiveTraits: ["Generous", "Wise", "Spiritual", "Creative"],
    negativeTraits: ["Can be impractical", "Overly emotional", "May struggle with boundaries"],
    coreJourney: "melayani sesama dan melepaskan masa lalu secara ikhlas",
    majorLesson: "belajar melepaskan siklus lama yang sudah selesai secara tulus",
    dailyExpression: "dari ketulusanmu untuk berbagi dan membantu sesama tanpa mengharapkan imbalan langsung",
  },
  11: {
    role: "Master Intuitive",
    roleId: "Intuisi Spiritual",
    positiveTraits: ["Intuitive", "Visionary", "Charismatic", "Inspirational"],
    negativeTraits: ["Anxious", "Impractical", "Can be overwhelmed by their own gifts"],
    coreJourney: "menyalurkan visi batin dan intuisi tinggi menjadi inspirasi",
    majorLesson: "belajar mengelola kecemasan batin dengan tindakan membumi",
    dailyExpression: "dari pemahaman batin dan intuisi yang sering kali melampaui logika umum",
  },
  22: {
    role: "Master Builder",
    roleId: "Pembangun Utama",
    positiveTraits: ["Visionary", "Practical", "Powerful manifester", "Disciplined"],
    negativeTraits: ["Can be overwhelmed by the scale of their vision", "Controlling", "Workaholic"],
    coreJourney: "mewujudkan visi besar yang bermanfaat nyata bagi peradaban",
    majorLesson: "belajar menghadapi tanggung jawab besar tanpa merasa terbebani",
    dailyExpression: "dari bakatmu menyusun langkah terperinci untuk mewujudkan rencana berskala besar",
  },
  33: {
    role: "Master Teacher",
    roleId: "Guru Utama",
    positiveTraits: ["Compassionate", "Nurturing", "Visionary", "Selfless"],
    negativeTraits: ["Can be overly idealistic", "Self-sacrificing", "May neglect their own needs"],
    coreJourney: "membimbing sesama melalui teladan kasih sayang tanpa syarat",
    majorLesson: "belajar mengayomi sekeliling tanpa mengabaikan perlindungan diri",
    dailyExpression: "ketika kehadiranmu memancarkan rasa aman yang membuat orang lain merasa diterima apa adanya",
  },
};

export const birthDayData: Record<number, NumerologyDetail> = {
  1: { summary: "kemandirian dan kepemimpinan alami" },
  2: { summary: "kepekaan rasa dan kemampuan bekerja sama" },
  3: { summary: "kreativitas dan pesona sosial" },
  4: { summary: "keteraturan dan kedisiplinan praktis" },
  5: { summary: "kecepatan beradaptasi dan kecintaan akan kebebasan" },
  6: { summary: "kasih sayang dan tanggung jawab mengayomi" },
  7: { summary: "pemikiran mendalam dan intuisi analitis" },
  8: { summary: "orientasi pada tujuan dan strategi praktis" },
  9: { summary: "jiwa kemanusiaan dan toleransi sosial" },
  11: { summary: "kepekaan intuisi spiritual" },
  22: { summary: "kemampuan merealisasikan visi besar" },
  33: { summary: "empati tinggi dan bimbingan kasih sayang" },
};

export const personalYearData: Record<number, NumerologyDetail> = {
  1: { summary: "memulai awal yang baru dan merintis inisiatif" },
  2: { summary: "memupuk kerja sama dan menjaga kesabaran" },
  3: { summary: "mengekspresikan diri dan memperluas kreativitas" },
  4: { summary: "membangun struktur dan memperkokoh fondasi" },
  5: { summary: "merangkul transisi dan menjelajahi kebebasan" },
  6: { summary: "merawat keharmonisan rumah dan memikul tanggung jawab" },
  7: { summary: "mengevaluasi batin dan mendalami spiritualitas" },
  8: { summary: "meraih pencapaian material dan kelimpahan finansial" },
  9: { summary: "menyelesaikan siklus lama dan mengikhlaskan pelepasan" },
  11: { summary: "mencapai pencerahan spiritual dan ketajaman intuisi" },
  22: { summary: "merealisasikan rencana besar berskala luas" },
  33: { summary: "melayani sesama dengan ketulusan kasih sayang" },
};

export const expressionData: Record<number, NumerologyDetail> = {
  1: { summary: "melalui kemandirian dan inovasi pelopor" },
  2: { summary: "melalui diplomasi dan kerja sama harmonis" },
  3: { summary: "melalui kreativitas seni dan komunikasi sosial" },
  4: { summary: "melalui ketekunan teratur dan metode praktis" },
  5: { summary: "melalui kecepatan beradaptasi dan eksplorasi dinamis" },
  6: { summary: "melalui kepedulian tulus dan pengayoman lingkungan" },
  7: { summary: "melalui analisis mendalam dan penelitian filosofis" },
  8: { summary: "melalui pengelolaan strategi dan kepemimpinan taktis" },
  9: { summary: "melalui empati luas dan kepedulian kemanusiaan" },
  11: { summary: "melalui pemahaman intuitif dan inspirasi batin" },
  22: { summary: "melalui perwujudan praktis rencana berskala besar" },
  33: { summary: "melalui bimbingan kasih sayang universal" },
};

export const soulUrgeData: Record<number, NumerologyDetail> = {
  1: { summary: "dorongan kuat untuk berdaulat dan mandiri" },
  2: { summary: "hasrat batin untuk relasi damai yang harmonis" },
  3: { summary: "kebutuhan batin untuk berekspresi bebas dan menikmati hidup" },
  4: { summary: "dorongan batin untuk ketertiban dan rasa aman" },
  5: { summary: "kebutuhan jiwa akan petualangan dan kebebasan mutlak" },
  6: { summary: "dorongan batin untuk merawat sekeliling dan dibutuhkan" },
  7: { summary: "kebutuhan batin akan kesunyian dan pemahaman mendalam" },
  8: { summary: "hasrat batin untuk berdaya secara material dan mandiri" },
  9: { summary: "dorongan batin untuk melayani kemanusiaan tanpa pamrih" },
  11: { summary: "kebutuhan jiwa mencapai pencerahan spiritual" },
  22: { summary: "hasrat batin meninggalkan warisan jangka panjang yang nyata" },
  33: { summary: "kebutuhan jiwa menyembuhkan sesama dengan cinta tulus" },
};

export const personalityData: Record<number, NumerologyDetail> = {
  1: { summary: "sosok yang percaya diri dan tegas" },
  2: { summary: "sosok yang ramah dan cinta damai" },
  3: { summary: "pribadi yang menawan dan penuh optimisme" },
  4: { summary: "sosok serius yang rapi dan dapat diandalkan" },
  5: { summary: "orang yang magnetis and penuh kejutan" },
  6: { summary: "pribadi peduli yang protektif dan anggun" },
  7: { summary: "sosok misterius yang intelek dan tenang" },
  8: { summary: "orang kuat yang sukses dan berwibawa" },
  9: { summary: "sosok karismatik yang berhati luas" },
  11: { summary: "pribadi spiritual yang sangat peka" },
  22: { summary: "sosok tangguh dan ahli strategi" },
  33: { summary: "pribadi penyembuh yang memancarkan ketenangan absolut" },
};
