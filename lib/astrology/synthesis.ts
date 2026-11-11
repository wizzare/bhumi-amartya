// BUILD 119 - BP04: 6-PILLAR ASTROLOGY SYNTHESIS & KESIMPULAN DIRIMU ENGINE
// Implements 4-tier interpretation hierarchy with 6 whole-chart synthesis sections:
// Level 1 - Individual
// Level 2 - Placement Combination
// Level 3 - Cross-Placement Synthesis (6 sections: Identity, Strength, Shadow, Relationships, Growth, Integration)
// Level 4 - Whole-Person Integration (Kesimpulan Dirimu with 6 pillars + 3 micro-commitments)
// Strictly 0 CJK and 0 non-ASCII clean.

import { calculateNatalChart, getZodiacSign, type NatalChartResult, type PlanetPosition } from "./calculateNatalChart";
import { calculatePersonalTransits, type PersonalTransitsResult } from "./calculateTransits";
import { getFourPillarReading, buildAscendantFourPillars, type AstroFourPillarEntry, type DetailedAscendantReading } from "./editorialCorpus";

export type AstroSynthesisPillar = {
  id: string;
  title: string;
  eyebrow: string;
  narrative: string;
  practicalKey: string;
};

export type AstroMicroCommitment = {
  order: number;
  area: string;
  invitation: string;
  practicalAction: string;
};

export type DetailedPlanetReading = {
  planet: PlanetPosition;
  pillar: AstroFourPillarEntry;
  level2Combination: string;
};

export type DetailedHouseReading = {
  house: number;
  cuspLongitude: number;
  cuspSign: string;
  cuspDegree: number;
  ruler: string;
  rulerPlacement: PlanetPosition | null;
  occupants: PlanetPosition[];
  pillar: AstroFourPillarEntry;
};

const SIGN_TONES: Record<string, { quality: string; gift: string; shadow: string }> = {
  Aries: { quality: "berani memulai dan bergerak langsung", gift: "ketegasan untuk mengambil langkah pertama", shadow: "terburu-buru saat proses belum matang" },
  Taurus: { quality: "mencari kestabilan yang nyata dan dapat dirasakan tubuh", gift: "ketekunan membangun rasa aman sedikit demi sedikit", shadow: "bertahan pada yang familiar meski sudah tidak menghidupkan" },
  Gemini: { quality: "membaca banyak kemungkinan melalui percakapan dan gagasan", gift: "kelincahan memahami sudut pandang yang berbeda", shadow: "terpecah ke banyak arah hingga sulit menuntaskan satu hal" },
  Cancer: { quality: "merawat hubungan, ingatan, dan rasa aman batin", gift: "kehangatan yang membuat orang merasa diterima", shadow: "membaca perubahan sikap orang lain sebagai penolakan terhadap diri" },
  Leo: { quality: "mengekspresikan diri dengan hangat, berani, dan kreatif", gift: "kemampuan menghidupkan ruang lewat ketulusan", shadow: "mencari pengakuan saat hati sedang merasa tidak terlihat" },
  Virgo: { quality: "menata, merawat, dan memperbaiki hal kecil secara teliti", gift: "ketekunan mengubah kekacauan menjadi sistem yang lebih sehat", shadow: "mengkritik diri atau orang lain hingga kebaikan yang sudah ada sulit terlihat" },
  Libra: { quality: "menimbang hubungan dan mencari titik adil bagi semua pihak", gift: "diplomasi dan kemampuan membangun kesepakatan yang anggun", shadow: "menunda keputusan demi menghindari ketidaknyamanan" },
  Scorpio: { quality: "menyelami rasa, kepercayaan, dan perubahan yang mendalam", gift: "keberanian menghadapi hal yang tidak mudah dibicarakan", shadow: "menguatkan kontrol ketika kerentanan terasa menakutkan" },
  Sagittarius: { quality: "mencari makna yang lebih luas melalui pengalaman dan keyakinan", gift: "optimisme yang membuka cakrawala baru", shadow: "melompat ke kesimpulan sebelum melihat detail yang diperlukan" },
  Capricorn: { quality: "membangun tanggung jawab dan pencapaian secara bertahap", gift: "daya tahan membangun fondasi yang bisa diandalkan", shadow: "mengukur nilai diri hanya dari produktivitas atau status" },
  Aquarius: { quality: "melihat pola masa depan dan kebebasan berpikir", gift: "keberanian menawarkan pembaruan yang berguna bagi banyak orang", shadow: "menjauh dari rasa saat ide terasa lebih aman daripada kedekatan" },
  Pisces: { quality: "menangkap nuansa halus, imajinasi, dan makna yang tak selalu kasatmata", gift: "empati serta daya cipta yang memberi ruang bagi kemanusiaan", shadow: "membiarkan batas pribadi kabur saat ingin menyelamatkan semua orang" },
};

const HOUSE_DOMAINS: Record<number, { title: string; area: string; intro: string; question: string }> = {
  1: {
    title: "Diri & Cara Hadir",
    area: "cara kamu hadir, memulai langkah, dan mengekspresikan jati diri",
    intro: "Ruang kehadiran personal, vitalitas tubuh, dan cara pertamamu melangkah menyapa dunia",
    question: "Bagaimana kamu ingin hadir secara otentik tanpa perlu memaksakan peran yang bukan dirimu?",
  },
  2: {
    title: "Nilai Diri & Sumber Daya",
    area: "rasa berharga, pengelolaan materi, bakat alami, dan rasa aman finansial",
    intro: "Ruang peneguhan nilai diri, pengelolaan sumber daya nyata, dan pemaknaan rasa cukup",
    question: "Apa yang membuatmu merasa cukup dan bernilai tanpa harus membuktikannya melalui kepemilikan?",
  },
  3: {
    title: "Pikiran & Komunikasi",
    area: "kelincahan berpikir, gaya berkomunikasi, rasa ingin tahu, dan relasi lingkungan terdekat",
    intro: "Ruang komunikasi harian, eksplorasi wawasan baru, dan cara merajut dialog dengan orang-orang terdekat",
    question: "Bagaimana caramu menyampaikan pikiran agar percakapan sehari-hari terasa lebih jernih dan saling memahami?",
  },
  4: {
    title: "Rumah & Fondasi Batin",
    area: "akar emosional, ruang pulang batin, kehangatan keluarga, dan fondasi psikologis",
    intro: "Ruang pulang batin, akar emosional terdalam, serta tempatmu beristirahat dan memulihkan rasa aman",
    question: "Kondisi seperti apa yang benar-benar membuat hatimu merasa aman untuk beristirahat dan menjadi dirimu apa adanya?",
  },
  5: {
    title: "Kreativitas & Kegembiraan",
    area: "daya cipta kreatif, kegembiraan bermain, ekspresi cinta yang hangat, dan keberanian berkarya",
    intro: "Ruang luapan kreativitas, kegembiraan spontan, romantisme, dan keberanian mengekspresikan karya personal",
    question: "Aktivitas apa yang paling menghidupkan gairah kreatifmu dan membuatmu menikmati prosesnya tanpa beban pembuktian?",
  },
  6: {
    title: "Ritme Keseharian & Pelayanan",
    area: "ritme kerja sehari-hari, dedikasi pelayanan, kebiasaan hidup sehat, dan perawatan kebugaran tubuh",
    intro: "Ruang keteraturan praktis, pelayanan tulus, kebiasaan kerja produktif, dan perawatan kebugaran tubuh",
    question: "Rutinitas sederhana apa yang paling menolong tubuh dan energimu tetap bugar dan seimbang setiap hari?",
  },
  7: {
    title: "Kemitraan & Relasi Dekat",
    area: "hubungan kemitraan, komitmen satu lawan satu, kesetaraan relasional, dan cermin diri",
    intro: "Ruang kemitraan bermakna, komitmen relasi satu lawan satu, dan pertemuan yang saling melengkapi",
    question: "Kesepakatan dan batas seperti apa yang perlu kamu bangun agar relasimu tetap setara dan saling menghargai?",
  },
  8: {
    title: "Transformasi & Kedalaman",
    area: "keintiman mendalam, kepercayaan timbal balik, pengelolaan sumber daya bersama, dan regenerasi batin",
    intro: "Ruang kejujuran emosional terdalam, transformasi psikologis, dan keberanian melepaskan beban lama",
    question: "Kelekatan atau ketakutan apa yang siap kamu lepaskan agar kamu dapat membangun kedekatan yang jujur dan transformatif?",
  },
  9: {
    title: "Keyakinan & Perluasan Wawasan",
    area: "pencarian makna luhur, wawasan filosofis, pendidikan mendalam, perjalanan, dan cakrawala keyakinan",
    intro: "Ruang pencarian makna hidup, wawasan filosofis yang luas, eksplorasi cakrawala baru, dan integritas keyakinan",
    question: "Keyakinan dan pemahaman baru apa yang ingin kamu beri ruang untuk memperkaya sudut pandang hidupmu?",
  },
  10: {
    title: "Karya & Kontribusi Publik",
    area: "pencapaian profesional, reputasi publik, tanggung jawab kepemimpinan, dan arah warisan hidup",
    intro: "Ruang kontribusi publik, tanggung jawab kepemimpinan, reputasi profesional, dan karya nyata bagi dunia",
    question: "Warisan nilai dan kontribusi bermakna seperti apa yang ingin kamu wujudkan melalui pekerjaan dan kepemimpinanmu?",
  },
  11: {
    title: "Komunitas & Harapan Masa Depan",
    area: "persahabatan bervisi sama, jaringan komunitas, cita-cita masa depan, dan solidaritas sosial",
    intro: "Ruang persahabatan tulus, jejaring visi masa depan bersama, dan kolaborasi dalam komunitas yang sehat",
    question: "Lingkaran pertemanan dan cita-cita seperti apa yang membuatmu merasa didukung untuk bertumbuh bersama?",
  },
  12: {
    title: "Keheningan & Integrasi Jiwa",
    area: "keheningan kontemplatif, pemulihan jiwa, pelepasan pola bawah sadar, dan kepekaan transendental",
    intro: "Ruang kontemplasi hening, pemulihan batin privat, pengampunan diri, dan pelepasan hal-hal yang telah usai",
    question: "Ruang hening dan penerimaan seperti apa yang perlu kamu sediakan agar hatimu pulih dan terbebas dari beban batin?",
  },
};

const HOUSE_THEMES = HOUSE_DOMAINS;

const CUSP_SIGN_DESCRIPTIONS: Record<string, { quality: string; gift: string; shadow: string }> = {
  Aries: {
    quality: "dinaungi dorongan mandiri, berani memulai, dan langsung bertindak",
    gift: "keberanian mengambil langkah pelopor dan ketegasan menggerakkan perubahan",
    shadow: "ketidaksabaran atau dorongan tergesa-gesa saat proses membutuhkan waktu untuk matang",
  },
  Taurus: {
    quality: "berakar pada kestabilan nyata, kesabaran membumi, dan konsistensi",
    gift: "ketekunan membangun fondasi kokoh dan kemampuan merawat hasil secara berkelanjutan",
    shadow: "keengganan berubah dan kecenderungan bertahan pada kenyamanan yang sudah tidak lagi menghidupkan",
  },
  Gemini: {
    quality: "digerakkan oleh kelincahan berpikir, keterbukaan pada gagasan, dan rasa ingin tahu",
    gift: "kemampuan merangkum beragam perspektif dan menjalin komunikasi yang luwes",
    shadow: "perhatian yang mudah terpecah ke banyak arah hingga sulit menuntaskan hal yang paling mendasar",
  },
  Cancer: {
    quality: "dikelilingi kepekaan rasa, perlindungan emosional, dan kepedulian yang tulus",
    gift: "kehangatan empati yang menciptakan rasa aman bagi diri sendiri dan orang sekitar",
    shadow: "kecenderungan menutup diri atau menganggap perubahan suasana sebagai penolakan personal",
  },
  Leo: {
    quality: "disinari kehangatan ekspresi, keberanian berkarya, dan kemurahan hati",
    gift: "daya pikat alami untuk menghidupkan ruang dan menginspirasi sesama lewat ketulusan",
    shadow: "keinginan berlebih untuk diakui atau merasa terluka ketika kontribusi tidak mendapat sorotan",
  },
  Virgo: {
    quality: "ditata oleh ketelitian praktis, kecermatan memperbaiki detail, dan dedikasi",
    gift: "kecerdasan analitis untuk menata sistem menjadi lebih efisien dan berfungsi dengan sehat",
    shadow: "sikap terlalu kritis terhadap diri atau situasi hingga kebaikan yang sudah ada sulit diapresiasi",
  },
  Libra: {
    quality: "dinaungi komitmen pada keadilan, diplomasi anggun, dan keselarasan relasional",
    gift: "kepekaan objektif untuk menimbang berbagai kepentingan dan merumuskan kesepakatan yang bermartabat",
    shadow: "keraguan dalam mengambil keputusan tegas demi menghindari friksi atau ketidaknyamanan sementara",
  },
  Scorpio: {
    quality: "diselami oleh intensitas kejujuran, kedalaman intuisi, dan daya regenerasi batin",
    gift: "keberanian membongkar kepura-puraan untuk menemukan kebenaran yang transformatif",
    shadow: "kecenderungan memperketat kontrol atau menutup diri karena khawatir kelemahan disalahgunakan",
  },
  Sagittarius: {
    quality: "dibimbing oleh pencarian makna luas, optimisme menjelajah, dan keterbukaan cakrawala",
    gift: "antusiasme melihat peluang besar dan kemampuan menginspirasi orang lain dengan visi hidup",
    shadow: "terlalu cepat melompat pada kesimpulan besar tanpa memeriksa fakta dan kebutuhan praktis di lapangan",
  },
  Capricorn: {
    quality: "ditegakkan oleh tanggung jawab matang, kedisiplinan bertahap, dan orientasi jangka panjang",
    gift: "daya tahan luar biasa untuk membangun karya yang bertahan lama dan dapat diandalkan",
    shadow: "kecenderungan memikul beban berlebihan atau mengukur nilai diri semata-mata dari pencapaian formal",
  },
  Aquarius: {
    quality: "dibuka oleh orisinalitas berpikir, kebebasan batin, dan kepedulian pada kemaslahatan bersama",
    gift: "kemampuan melihat pola masa depan dan menawarkan alternatif solutif yang melampaui kebiasaan lama",
    shadow: "menjaga jarak emosional atau bersikap terlalu teoritis saat situasi membutuhkan kehangatan langsung",
  },
  Pisces: {
    quality: "diselimuti empati mendalam, daya imajinasi intuitif, dan penerimaan welas asih",
    gift: "kepekaan artistik dan spiritual untuk memahami nuansa batin yang tak terucapkan",
    shadow: "batas pribadi yang kabur atau kecenderungan larut dalam idealisme saat realitas menuntut ketegasan",
  },
};

function buildHouseRulerSynthesis(
  ruler: string,
  rulerPlacement: PlanetPosition | null,
  sourceHouse: number,
  sourceDomain: { title: string; area: string; question: string }
): string {
  if (!rulerPlacement) {
    return `Penguasa arena ini adalah ${ruler}, yang memegang kendali arah dan dinamika utama pengalaman hidupmu di bidang ini.`;
  }
  const targetHouse = rulerPlacement.house;
  const targetSign = rulerPlacement.sign;
  const targetDomain = HOUSE_DOMAINS[targetHouse] ?? HOUSE_DOMAINS[1];

  if (sourceHouse === targetHouse) {
    return `Penguasa arena ini, ${ruler}, berada di rumahnya sendiri di ${targetSign} (House ${targetHouse}), memusatkan daya mandiri untuk mengelola ${sourceDomain.area} secara berdaulat.`;
  }

  return `Penguasa arena ini, ${ruler}, menempati ${targetSign} di House ${targetHouse}, menghubungkan ${sourceDomain.area} langsung dengan panggung ${targetDomain.area} sebagai ruang perwujudannya.`;
}

function buildHouseOccupantsNarrative(occupants: PlanetPosition[]): string {
  if (occupants.length === 0) {
    return "Tanpa planet penempat, dinamika arena ini berjalan jernih di bawah arahan langsung penguasanya.";
  }
  if (occupants.length === 1) {
    const p = occupants[0];
    return `Kehadiran ${p.name} di ${p.sign} memusatkan energinya langsung ke pengalaman hidupmu di sini.`;
  }
  const names = occupants.map((p) => `${p.name} (${p.sign})`).join(", ");
  return `Dinamika arena ini diperkaya oleh kehadiran ${names} yang memadukan dorongan batin mereka.`;
}

function buildHouseRulerAspectsNarrative(aspects: { aspectType: string; counterpart?: string }[]): string {
  if (!aspects || aspects.length === 0) {
    return "Penguasa ini bergerak mandiri tanpa aspek mayor penekan, memberimu keleluasaan bertindak.";
  }
  const descriptions = aspects.map((a) => {
    const other = a.counterpart ?? "planet lain";
    if (a.aspectType === "Conjunction" || a.aspectType === "Konjungsi") {
      return `konjungsi dengan ${other}`;
    }
    if (a.aspectType === "Trine" || a.aspectType === "Trigon") {
      return `trigon dengan ${other}`;
    }
    if (a.aspectType === "Sextile" || a.aspectType === "Sekstil") {
      return `sekstil dengan ${other}`;
    }
    if (a.aspectType === "Square" || a.aspectType === "Kuadrat") {
      return `kuadrat dengan ${other}`;
    }
    if (a.aspectType === "Opposition" || a.aspectType === "Oposisi") {
      return `oposisi dengan ${other}`;
    }
    return `aspek dengan ${other}`;
  });
  return `Langkahnya berdialog dengan carta lain melalui ${descriptions.join("; ")}.`;
}

const SIGN_RULERS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Pluto", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Uranus", Pisces: "Neptune",
};

export type AstroFullReading = {
  heroInsight: string;
  natal: NatalChartResult;
  transits: PersonalTransitsResult;
  planetReadings: DetailedPlanetReading[];
  houseReadings: DetailedHouseReading[];
  partOfFortuneReading: DetailedPlanetReading;
  ascendantReading: DetailedAscendantReading;
  synthesis: {
    title: string;
    subtitle: string;
    summaryParagraph: string;
    pillars: AstroSynthesisPillar[];
    microCommitments: AstroMicroCommitment[];
    closingReflection: string;
  };
};

const SIGN_SYNTHESIS_DESCRIPTIONS: Record<string, { trait: string; need: string; approach: string }> = {
  Aries: { trait: "inisiatif yang berani, dinamis, dan langsung", need: "otonomi untuk bertindak tanpa birokrasi batin", approach: "menyalakan keberanian untuk merintis hal baru" },
  Taurus: { trait: "keteguhan yang membumi, sabar, dan menyukai kestabilan nyata", need: "kepastian yang nyata, ritme tenang, dan rasa aman berakar", approach: "membangun fondasi sedikit demi sedikit dengan konsisten" },
  Gemini: { trait: "kelincahan intelektual, rasa ingin tahu luas, dan komunikasi adaptif", need: "stimulasi wawasan baru dan kebebasan bertukar gagasan", approach: "menghubungkan informasi dan melihat banyak sudut pandang" },
  Cancer: { trait: "kehangatan intuitif, kepekaan emosional, dan naluri merawat mendalam", need: "kedekatan tulus, perlindungan batin, dan ruang pulang yang teduh", approach: "menjaga ikatan emosional dan merawat apa yang berharga" },
  Leo: { trait: "ekspresi kreatif yang hangat, percaya diri, dan penuh vitalitas", need: "pengakuan atas ketulusan hati dan ruang mencipta tanpa kekangan", approach: "menghidupkan suasana dengan kemurahan hati dan keberanian tampil" },
  Virgo: { trait: "kecermatan analitis, dedikasi pada perbaikan, dan pragmatisme praktis", need: "keteraturan yang jelas, keberfungsian nyata, dan rasa berguna", approach: "memperbaiki detail dan mengolah kekacauan menjadi keteraturan" },
  Libra: { trait: "kepekaan relasional, diplomasi yang anggun, dan dambaan pada keadilan", need: "keharmonisan batin, dialog berimbang, dan kesetaraan dalam ikatan", approach: "menimbang berbagai sisi secara objektif sebelum bersikap" },
  Scorpio: { trait: "kedalaman emosional yang intens, kejujuran psikologis, dan daya regenerasi kuat", need: "kepercayaan mutlak, keintiman tanpa topeng, dan transformasi sejati", approach: "menyelami apa yang tersembunyi hingga menemukan akar kebenaran" },
  Sagittarius: { trait: "pandangan luas yang optimis, haus makna, dan cinta kebebasan filosofis", need: "cakrawala masa depan yang terbuka, petualangan wawasan, dan kejujuran prinsip", approach: "mencari kebenaran hakiki dan mempercayai alur kehidupan yang lebih besar" },
  Capricorn: { trait: "tanggung jawab yang matang, disiplin bertahap, dan ketahanan berstruktur", need: "tujuan hidup yang jelas, integritas karya, dan penghormatan pada proses", approach: "menapaki proses pendewasaan dengan kesabaran dan standar tinggi" },
  Aquarius: { trait: "pandangan visioner yang objektif, kemandirian berpikir, dan kesadaran kemanusiaan", need: "kebebasan berpikir untuk berbeda dan ruang menyumbang bagi kebaikan bersama", approach: "memperbarui cara pandang lama dengan pendekatan yang lebih inklusif" },
  Pisces: { trait: "empati halus yang luas, daya imajinasi intuitif, dan kelembutan batin", need: "keheningan untuk memulihkan energi batin dan ruang bagi yang tak kasatmata", approach: "merangkul kemanusiaan dengan welas asih dan penerimaan tulus" },
};

const SYNTHESIS_HOUSE_AREAS: Record<number, string> = {
  1: "kehadiran tubuh, vitalitas pribadi, dan caramu pertama kali menyapa dunia",
  2: "rasa berharga, pengelolaan materi nyata, bakat alami, dan rasa aman finansial",
  3: "kelincahan berkomunikasi, eksplorasi wawasan harian, dan pertukaran gagasan dengan lingkungan terdekat",
  4: "kedamaian batin, kehangatan rumah pribadi, dan ketenangan tempatmu pulang",
  5: "kegembiraan mencipta karya, keberanian berekspresi, romantisme, dan kesenangan bermain",
  6: "ritme keteraturan kerja sehari-hari, pelayanan tulus, dan pemeliharaan kesehatan tubuh",
  7: "kemitraan bermakna, relasi komitmen satu lawan satu, dan cermin diri melalui orang lain",
  8: "kepercayaan mendalam, transformasi psikologis, keintiman rentan, dan pengelolaan sumber daya bersama",
  9: "pencarian makna hidup, wawasan filosofis luas, nilai-nilai etis, dan perjalanan spiritual",
  10: "panggilan jiwa, kontribusi karya di ruang publik, reputasi integritas, dan warisan hidup",
  11: "lingkaran komunitas, visi masa depan bersama, persahabatan sejati, dan cita-cita kemanusiaan",
  12: "kedalaman batin sunyi, pelepasan beban masa lalu, istirahat jiwa, dan penyerahan diri pada yang melampaui ego",
};

function buildDynamicMicroCommitments(natal: NatalChartResult): AstroMicroCommitment[] {
  const sunSign = natal.sun.sign;
  const sunHouse = natal.sun.house;

  let card1Area = "Penjajaran Ritme Diri";
  let card1Invitation = "Berikan jeda hening sejenak untuk memeriksa kebutuhan tubuh dan perasaanmu sebelum larut dalam kesibukan.";
  let card1Action = "Pilihlah satu waktu di pagi hari untuk duduk tenang tanpa gawai, mengamati napas dan kesiapan energimu.";

  if (["Aries", "Leo", "Sagittarius"].includes(sunSign)) {
    card1Area = "Penyaluran Energi & Inisiatif";
    card1Invitation = `Salurkan semangat inisiatif Matahari di ${sunSign} ke dalam sasaran terarah tanpa memforsir stamina tubuh.`;
    card1Action = `Pilih satu prioritas terpenting pada urusan House ${sunHouse} hari ini, lalu selesaikan dengan fokus sebelum beralih ke hal lain.`;
  } else if (["Taurus", "Virgo", "Capricorn"].includes(sunSign)) {
    card1Area = "Kestabilan Ritme & Perawatan Nyata";
    card1Invitation = `Rawat pijakan membumi Matahari di ${sunSign} dengan menjaga keteraturan langkah dan menghargai proses bertahap.`;
    card1Action = `Luangkan waktu untuk menata ruang kerjamu atau menikmati makanan dengan perlahan dan penuh perhatian pada kebutuhan House ${sunHouse}.`;
  } else if (["Gemini", "Libra", "Aquarius"].includes(sunSign)) {
    card1Area = "Kejernihan Pikiran & Jeda Mental";
    card1Invitation = `Beri ruang jeda bagi pikiran aktif Matahari di ${sunSign} agar persepsimu tetap jernih dan tidak kelelahan informasi.`;
    card1Action = `Tuliskan hal-hal yang menyita perhatianmu di House ${sunHouse}, lalu pilih satu langkah konkret yang realistis dituntaskan hari ini.`;
  } else {
    card1Area = "Penerimaan Rasa & Ketenangan Batin";
    card1Invitation = `Dengarkan bisikan intuisi Matahari di ${sunSign} dan beri rasa aman pada perasaan sebelum menanggapi suasana sekitar.`;
    card1Action = `Ambil jeda sejenak untuk membasuh wajah dengan air sejuk dan menarik napas panjang saat dinamika House ${sunHouse} terasa padat.`;
  }

  const nnSign = natal.northNode.sign;
  const nnHouse = natal.northNode.house;
  const nnDesc = SIGN_SYNTHESIS_DESCRIPTIONS[nnSign] || SIGN_SYNTHESIS_DESCRIPTIONS.Taurus;
  const card2Area = "Latihan Arah Bertumbuh";
  const card2Invitation = `Latihlah kualitas North Node di ${nnSign} dengan mengambil langkah kecil yang melampaui kebiasaan lama.`;
  const card2Action = `Ambil satu tindakan nyata hari ini yang melatih ${nnDesc.approach} pada urusan House ${nnHouse}.`;

  const moonSign = natal.moon.sign;
  const h7Sign = natal.houses[6] ? getZodiacSign(natal.houses[6]).sign : "Leo";
  const card3Area = "Kejujuran Ruang Hubungan";
  const card3Invitation = `Selaraskan kejujuran perasaan Bulan di ${moonSign} saat berinteraksi dan membangun kesepakatan di cermin House 7 (${h7Sign}).`;
  const card3Action = `Jika ada hal yang mengganjal, sampaikan secara tenang dan santun tanpa menunda atau memaksakan pembenaran sepihak.`;

  return [
    { order: 1, area: card1Area, invitation: card1Invitation, practicalAction: card1Action },
    { order: 2, area: card2Area, invitation: card2Invitation, practicalAction: card2Action },
    { order: 3, area: card3Area, invitation: card3Invitation, practicalAction: card3Action },
  ];
}

export function buildFullAstrologyReading(options: {
  birthDate: string;
  birthTime: string;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  targetDate?: Date;
}): AstroFullReading {
  const natal = calculateNatalChart(options);
  const transits = calculatePersonalTransits(natal, options.targetDate ?? new Date());

  const sunSign = natal.sun.sign;
  const moonSign = natal.moon.sign;
  const ascSign = natal.ascendant.sign;

  const heroInsight =
    `Kamu lahir dengan Matahari di ${sunSign} (House ${natal.sun.house}), Bulan di ${moonSign} (House ${natal.moon.house}), dan Ascendant (Rising) di ${ascSign}. ` +
    `Peta langit kelahiranmu memadukan vitalitas kesadaran sadar, kebutuhan batin emosional, dan cara hadir Rising yang khas, ` +
    `membimbingmu menemukan keseimbangan hidup yang otentik dan selaras dengan tujuan jiwamu.`;

  const allPlanets = [
    natal.sun,
    natal.moon,
    natal.mercury,
    natal.venus,
    natal.mars,
    natal.jupiter,
    natal.saturn,
    natal.uranus,
    natal.neptune,
    natal.pluto,
    natal.chiron,
    natal.lilith,
    natal.northNode,
    natal.ceres,
    natal.pallas,
    natal.juno,
    natal.vesta,
    natal.partOfFortune,
  ];
  
  const planetReadings: DetailedPlanetReading[] = allPlanets.map((p) => {
    const category =
      p.name === "Chiron"
        ? "chiron"
        : p.name === "Black Moon Lilith"
        ? "lilith"
        : p.name === "North Node"
        ? "nodes"
        : p.name === "Part of Fortune"
        ? "fortune"
        : ["Ceres", "Pallas", "Juno", "Vesta"].includes(p.name)
        ? "asteroids"
        : "planets";
    const key = p.name === "North Node" ? "Lunar Nodes" : p.name;
    const relatedAspects = natal.aspects.filter((a) => a.planet1 === p.name || a.planet2 === p.name);
    const rulerPlacement = allPlanets.find((rp) => rp.name === natal.chartRuler);
    const rulerPlacementStr =
      p.name === "Part of Fortune" && "rulerPlacement" in p
        ? `${(p as any).ruler} di ${(p as any).rulerPlacement.sign} House ${(p as any).rulerPlacement.house}`
        : rulerPlacement
        ? `${rulerPlacement.sign} House ${rulerPlacement.house}`
        : "tidak diketahui";

    const base = getFourPillarReading(category, key, {
      sign: p.sign,
      house: p.house,
      aspects: relatedAspects.map(a => ({ aspectType: a.aspectType, planet1: a.planet1, planet2: a.planet2, counterpart: a.planet1 === p.name ? a.planet2 : a.planet1 })),
      isRetrograde: p.isRetrograde,
      chartRuler: natal.chartRuler,
      rulerPlacement: rulerPlacementStr,
      southNode: p.name === "North Node" ? { sign: natal.southNode.sign, house: natal.southNode.house } : undefined
    });
    const signTone = SIGN_TONES[p.sign] ?? SIGN_TONES.Aries;
    const houseTheme = HOUSE_THEMES[p.house] ?? HOUSE_THEMES[1];
    const aspectText = relatedAspects.length
      ? `Dalam carta ini, ${p.name} juga terhubung melalui ${relatedAspects.map((a) => `${a.aspectType} dengan ${a.planet1 === p.name ? a.planet2 : a.planet1} (orb ${a.orb.toFixed(1)} deg)`).join(" dan ")}, sehingga cara energi ini bekerja tidak berdiri sendiri.`
      : `Tidak ada aspek mayor ketat yang tercatat untuk ${p.name}, sehingga tema placement ini lebih terlihat melalui sign dan House-nya.`;
    const motionText =
      p.name === "Part of Fortune"
        ? `Sebagai titik geometris penyeimbang, Part of Fortune tidak memiliki gerak retrograde fisik, melainkan mencerminkan keselarasan posisi Ascendant, Matahari, dan Bulan.`
        : p.isRetrograde
        ? `Gerak retrograde ${p.name} mengarahkan energimu bekerja lebih reflektif ke dalam diri; kamu diajak meninjau dan mematangkan pertimbangan secara mandiri sebelum menampilkannya ke luar.`
        : `Gerak langsung ${p.name} mengalirkan energi ini secara aktif ke luar, mendorongmu mencoba inisiatif nyata dan mengevaluasi hasilnya.`;
    const nodeText = p.name === "North Node"
      ? `Poros ini memadukan kebiasaan akrab South Node di ${natal.southNode.sign} House ${natal.southNode.house} sebagai modal berharga, menuju arah pembelajaran baru North Node di ${p.sign} House ${p.house}.`
      : "";
    const level2Combination = `Di ${p.sign} dan House ${p.house}, ${p.name} cenderung ${signTone.quality} pada ${houseTheme.area}. ${motionText} ${aspectText} ${nodeText}`;
    const pillar: AstroFourPillarEntry = {
      penjelasan: base.penjelasan,
      gift: base.gift,
      shadow: base.shadow,
      integrasi: base.integrasi,
    };
    return { planet: p, pillar, level2Combination };
  });

  const partOfFortuneReading =
    planetReadings.find((pr) => pr.planet.name === "Part of Fortune") ?? planetReadings[0];

  const houseReadings: DetailedHouseReading[] = natal.houses.map((cuspLongitude, index) => {
    const house = index + 1;
    const cuspSignIndex = Math.floor(((cuspLongitude % 360) + 360) % 360 / 30);
    const cuspSign = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][cuspSignIndex];
    const cuspDegree = ((cuspLongitude % 30) + 30) % 30;
    const ruler = SIGN_RULERS[cuspSign] ?? "Sun";
    const rulerPlacement = allPlanets.find((p) => p.name === ruler) ?? null;
    const occupants = allPlanets.filter((p) => p.house === house);
    const domain = HOUSE_DOMAINS[house] ?? {
      title: `House ${house}`,
      area: HOUSE_THEMES[house]?.area ?? `area hidup ${house}`,
      intro: `Ruang pengalaman hidup di bidang ${house}`,
      question: HOUSE_THEMES[house]?.question ?? "Bagaimana kamu mengintegrasikan potensi ini?",
    };
    const cusp = CUSP_SIGN_DESCRIPTIONS[cuspSign] ?? CUSP_SIGN_DESCRIPTIONS.Aries;
    const ascContext = house === 1 ? ` Sebagai rumah pertama yang memuat Ascendant di ${natal.ascendant.sign}, cara hadirmu alami menjadi lensa utama bagi seluruh carta kelahiranmu.` : "";
    const houseAspects = natal.aspects
      .filter((a) => a.planet1 === ruler || a.planet2 === ruler)
      .map((a) => ({ aspectType: a.aspectType, counterpart: a.planet1 === ruler ? a.planet2 : a.planet1 }));

    return {
      house,
      cuspLongitude,
      cuspSign,
      cuspDegree,
      ruler,
      rulerPlacement,
      occupants,
      pillar: {
        penjelasan: `${domain.intro} ${cusp.quality}.${ascContext} ${buildHouseOccupantsNarrative(occupants)} ${buildHouseRulerSynthesis(ruler, rulerPlacement, house, domain)} ${buildHouseRulerAspectsNarrative(houseAspects)}`,
        gift: `Kombinasi House ${house} dan zodiak ${cuspSign} memberimu ${cusp.gift}. Di arena ${domain.area}, kamu memiliki bakat alami untuk menavigasi tantangan dengan kejernihan, merawat proses secara beradab, serta menginspirasi lingkungan sekitar melalui keteladanan yang kamu bangun secara konsisten.`,
        shadow: `Tantangan yang perlu kamu waspadai di arena ${domain.area} adalah kecenderungan ${cusp.shadow}. Ketika energimu sedang di bawah tekanan atau merasa tidak aman, sadari dorongan untuk merespons secara berlebihan atau menutup diri, agar kamu tidak kehilangan kejernihan batin dalam menentukan langkah.`,
        integrasi: `Penyelarasan terbaik untuk arena ini terhubung langsung dengan peran ${ruler}${rulerPlacement ? ` di ${rulerPlacement.sign} House ${rulerPlacement.house}` : ""}. Luangkan waktu untuk merenungkan: "${domain.question}" Jadikan setiap pembelajaran di bidang ini sebagai sarana memperkuat integritas pribadimu dan menciptakan keseimbangan hidup yang berkelanjutan.`,
      },
    };
  });

  // Level 3 & Level 4 Deep Synthesis Pillars (Six sections: Identity, Strength, Shadow, Relationships, Growth, Integration)
  const sunDesc = SIGN_SYNTHESIS_DESCRIPTIONS[sunSign] || SIGN_SYNTHESIS_DESCRIPTIONS.Aries;
  const sunArea = SYNTHESIS_HOUSE_AREAS[natal.sun.house] || "ranah hidup pribadimu";

  const moonDesc = SIGN_SYNTHESIS_DESCRIPTIONS[moonSign] || SIGN_SYNTHESIS_DESCRIPTIONS.Libra;
  const moonArea = SYNTHESIS_HOUSE_AREAS[natal.moon.house] || "kebutuhan batinmu";

  const ascDesc = SIGN_SYNTHESIS_DESCRIPTIONS[ascSign] || SIGN_SYNTHESIS_DESCRIPTIONS.Aquarius;

  const chartRuler = natal.chartRuler;
  const rulerObj = allPlanets.find((p) => p.name === chartRuler);
  const rulerSign = rulerObj?.sign || "Aries";
  const rulerHouse = rulerObj?.house || 1;
  const rulerArea = SYNTHESIS_HOUSE_AREAS[rulerHouse] || "pusat arah hidupmu";

  const ascRulerPlacementObj = rulerObj ?? {
    name: chartRuler,
    sign: "Aries",
    house: 1,
    formattedDegree: "15 deg Aries",
  };

  const ascendantReading = buildAscendantFourPillars({
    ascSign: natal.ascendant.sign,
    ascFormattedDegree: natal.ascendant.formattedDegree,
    chartRuler: natal.chartRuler,
    chartRulerPlacement: {
      sign: ascRulerPlacementObj.sign,
      house: ascRulerPlacementObj.house,
      formattedDegree: ascRulerPlacementObj.formattedDegree,
    },
    allPlanets,
    sun: { sign: natal.sun.sign, house: natal.sun.house },
    moon: { sign: natal.moon.sign, house: natal.moon.house },
  });

  // PILLAR 1: Identitas dan Kebutuhan Batin
  const p1Narrative =
    `Perjalanan hidupmu memadukan energi Matahari di ${sunSign} House ${natal.sun.house} dan kepekaan Bulan di ${moonSign} House ${natal.moon.house}. ` +
    `Matahari mendorongmu mengekspresikan ${sunDesc.trait} di ranah ${sunArea}, sementara kedamaian batinmu berakar pada pemenuhan ${moonDesc.need}. ` +
    `Dinamika ini terpancar wajar melalui Rising ${ascSign} yang menampilkan ${ascDesc.trait} kepada dunia luar. ` +
    `Arah langkahmu dipandu ${chartRuler} di ${rulerSign} House ${rulerHouse}, bermuara pada pengolahan ${rulerArea}. ` +
    `Kamu belajar menyatukan dorongan berkarya di luar dengan kejujuran merawat perasaan di dalam secara utuh.`;

  // PILLAR 2: Kekuatan yang Saling Mendukung
  const elemEntries = Object.entries(natal.elements).filter(([_, v]) => v > 0);
  const dominantElem = elemEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || "Air";
  const dominantElemText =
    dominantElem === "Fire" ? "semangat inisiatif, keberanian bertindak, dan optimisme kreatif"
    : dominantElem === "Earth" ? "ketekunan membumi, pragmatisme realistis, dan daya tahan menuntaskan karya"
    : dominantElem === "Air" ? "kejernihan analisis, keterbukaan wawasan intelektual, dan kelincahan menghubungkan gagasan"
    : "kedalaman empati emosional, kepekaan rasa intuitif, dan daya pemulihan batin";

  const modEntries = Object.entries(natal.modalities).filter(([_, v]) => v > 0);
  const dominantMod = modEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || "Fixed";
  const dominantModText =
    dominantMod === "Cardinal" ? "dorongan kuat memprakarsai perubahan dan membuka jalan baru"
    : dominantMod === "Fixed" ? "kesetiaan pada komitmen, fokus konsentrasi mendalam, dan daya tahan mempertahankan prinsip"
    : "keluwesan beradaptasi dengan perubahan, kepiawaian menyelaraskan diri, dan kelincahan menavigasi variasi hidup";

  const pof = natal.partOfFortune;
  const pofArea = SYNTHESIS_HOUSE_AREAS[pof.house] || "keseimbangan hidupmu";
  const pofSignDesc = SIGN_SYNTHESIS_DESCRIPTIONS[pof.sign] || SIGN_SYNTHESIS_DESCRIPTIONS.Leo;

  const p2Narrative =
    `Daya dukung dalam dirimu bertumpu pada elemen yang menonjolkan ${dominantElemText}, diperkuat modalitas ${dominantModText}. ` +
    `Peluang bertumbuh mengalir melalui sinergi Jupiter di ${natal.jupiter.sign} House ${natal.jupiter.house} dan Venus di ${natal.venus.sign} House ${natal.venus.house}, membantumu merajut relasi yang bermanfaat. ` +
    `Daya ini berpadu serasi dengan Part of Fortune di ${pof.sign} House ${pof.house}, yang dinaungi ${pof.ruler} di ${pof.rulerPlacement.sign} House ${pof.rulerPlacement.house}. ` +
    `Menghidupkan kualitas ${pofSignDesc.trait} di ranah ${pofArea} membuat urusan hidup terasa mengalir dan bermakna, di mana kepuasan mekar saat langkah praktismu berpijak pada rasa cukup.`;

  // PILLAR 3: Ketegangan dan Ruang Penerimaan
  const challengingAspects = natal.aspects.filter((a) => ["Square", "Opposition", "Quincunx"].includes(a.aspectType));
  const aspectSummary = challengingAspects.length > 0
    ? `Dinamika carta ditandai ${challengingAspects.slice(0, 2).map((a) => `${a.aspectType.toLowerCase()} antara ${a.planet1} dan ${a.planet2}`).join(" serta ")}, yang melatihmu mengelola ritme kebutuhan berbeda.`
    : `Pertumbuhanmu mengalir melalui penyesuaian ritme antarplanet pribadi.`;

  const saturnRxText = natal.saturn.isRetrograde
    ? `Saturnus retrograde di ${natal.saturn.sign} House ${natal.saturn.house} membentuk disiplin batin yang cermat menimbang amanah.`
    : `Saturnus di ${natal.saturn.sign} House ${natal.saturn.house} melatih ketahanan nyata lewat konsistensi proses.`;

  const chironArea = SYNTHESIS_HOUSE_AREAS[natal.chiron.house] || "kepekaan batinmu";
  const lilithArea = SYNTHESIS_HOUSE_AREAS[natal.lilith.house] || "otonomi personalmu";

  const p3Narrative =
    `Tantangan carta menjadi sarana melatih ketahanan jiwa. ` +
    `${aspectSummary} ` +
    `${saturnRxText} ` +
    `Chiron di ${natal.chiron.sign} House ${natal.chiron.house} menyentuh kepekaan ${chironArea}, di mana pengalaman rentan mengasah empati tulus bagi sesama. ` +
    `Bersama Black Moon Lilith di ${natal.lilith.sign} House ${natal.lilith.house} yang menegakkan batas diri di ${lilithArea}, kamu belajar menyambut rasa ragu bukan sebagai aib, melainkan ruang memperlakukan dirimu secara adil dan lapang dada.`;

  // PILLAR 4: Kedekatan dan Kesepakatan Setara
  const h7CuspSign = natal.houses[6] ? getZodiacSign(natal.houses[6]).sign : "Leo";
  const h7Desc = SIGN_SYNTHESIS_DESCRIPTIONS[h7CuspSign] || SIGN_SYNTHESIS_DESCRIPTIONS.Leo;
  const junoArea = SYNTHESIS_HOUSE_AREAS[natal.juno.house] || "ikatan komitmenmu";

  const p4Narrative =
    `Dalam membangun relasi yang bermakna, kebutuhan rasa aman Bulan di ${moonSign} berpadu dengan Venus di ${natal.venus.sign} House ${natal.venus.house} yang mengalirkan kehangatan rasa dan penghargaan timbal balik. ` +
    `Ketegasan menjaga batas diri dipandu oleh Mars di ${natal.mars.sign} House ${natal.mars.house}, membantumu berterus terang secara santun tanpa bersikap defensif. ` +
    `Pintu masuk kemitraanmu tercermin melalui House 7 di ${h7CuspSign}, di mana ikatan sehat terjalin bersama pihak yang menghargai ${h7Desc.trait} secara setara. ` +
    `Kehadiran Juno di ${natal.juno.sign} House ${natal.juno.house} menegaskan bahwa komitmen yang kokoh bertumpu pada keterbukaan di ranah ${junoArea}, memungkinkan setiap pribadi bertumbuh berdampingan tanpa kehilangan jati dirinya.`;

  // PILLAR 5: Arah Latihan dan Pertumbuhan
  const snSign = natal.southNode.sign;
  const snHouse = natal.southNode.house;
  const snDesc = SIGN_SYNTHESIS_DESCRIPTIONS[snSign] || SIGN_SYNTHESIS_DESCRIPTIONS.Scorpio;
  const snArea = SYNTHESIS_HOUSE_AREAS[snHouse] || "kebiasaan lama";

  const nnSign = natal.northNode.sign;
  const nnHouse = natal.northNode.house;
  const nnDesc = SIGN_SYNTHESIS_DESCRIPTIONS[nnSign] || SIGN_SYNTHESIS_DESCRIPTIONS.Taurus;
  const nnArea = SYNTHESIS_HOUSE_AREAS[nnHouse] || "arah masa depan";

  const p5Narrative =
    `Arah perkembangan dirimu terbentang melalui poros Lunar Nodes. ` +
    `South Node di ${snSign} House ${snHouse} memberi modal kecakapan berupa ${snDesc.trait} di ranah ${snArea}, yang perlu diselaraskan agar tidak menahan pembaruan. ` +
    `North Node di ${nnSign} House ${nnHouse} memanggilmu melatih ${nnDesc.approach} pada ranah ${nnArea}. ` +
    `Langkah ini diteguhkan oleh ketekunan Saturnus di ${natal.saturn.sign} serta penerimaan Chiron atas proses belajar bertahap. ` +
    `Terhubung dengan Part of Fortune di ${pof.sign}, pertumbuhan ini membimbingmu bahwa kepuasan sejati berakar dari kesabaran merawat hal bernilai setiap hari.`;

  // PILLAR 6: Keseluruhan dan Integrasi
  const p6Narrative =
    `Perpaduan seluruh penempatan langitmu membentuk keutuhan diri yang berlapis: keteguhan Matahari di ${sunSign}, kepekaan perasaan Bulan di ${moonSign}, serta kejernihan hadir Rising di ${ascSign}. ` +
    `Kombinasi ini memberimu kedalaman batin untuk memegang prinsip hidup yang kokoh, beriringan dengan keterbukaan pandangan untuk terus memperbarui diri. ` +
    `Dinamika antara ketenangan pribadi dan keaktifan di ruang sosial bukanlah pertentangan yang harus dipadamkan, melainkan ritme wajar yang saling melengkapi kedewasaanmu. ` +
    `Kematangan batin tercapai saat kamu merangkul setiap sisi diri tanpa memaksakan peran yang melelahkan. ` +
    `Jalani keseharian dengan nilai yang kamu yakini, rawat tubuhmu dengan bijak, dan wujudkan ketenangan batin lewat kontribusi nyata yang berdaya tahan.`;

  const p1: AstroSynthesisPillar = {
    id: "identity",
    title: "Identitas dan Kebutuhan Batin",
    eyebrow: "Pondasi Kesadaran Keseluruhan",
    narrative: p1Narrative,
    practicalKey: "Sediakan waktu tenang untuk menyelaraskan diri sebelum merespons kesibukan dunia luar.",
  };

  const p2: AstroSynthesisPillar = {
    id: "strength",
    title: "Kekuatan yang Saling Mendukung",
    eyebrow: "Sumber Kekuatan Bawaan",
    narrative: p2Narrative,
    practicalKey: "Gunakan kemudahan Part of Fortune dan kelapangan pikiran sebagai modal bertindak nyata tanpa terbebani pembuktian.",
  };

  const p3: AstroSynthesisPillar = {
    id: "shadow",
    title: "Ketegangan dan Ruang Penerimaan",
    eyebrow: "Area Kepekaan & Integrasi",
    narrative: p3Narrative,
    practicalKey: "Pandang ketegangan dan rasa tidak sempurna sebagai sinyal untuk melambatkan ritme, bukan sebagai kekurangan diri.",
  };

  const p4: AstroSynthesisPillar = {
    id: "relationships",
    title: "Kedekatan dan Kesepakatan Setara",
    eyebrow: "Dinamika Relasi & Kemitraan",
    narrative: p4Narrative,
    practicalKey: "Bangun kesepakatan yang transparan dan setara tanpa mengorbankan kejujuran batas pribadimu.",
  };

  const p5: AstroSynthesisPillar = {
    id: "growth",
    title: "Arah Latihan dan Pertumbuhan",
    eyebrow: "Arah Pertumbuhan Jiwa",
    narrative: p5Narrative,
    practicalKey: "Langkahkan kakimu sedikit demi sedikit menuju kualitas North Node dengan ketekunan nyata setiap hari.",
  };

  const p6: AstroSynthesisPillar = {
    id: "integration",
    title: "Keseluruhan dan Integrasi",
    eyebrow: "Keseluruhan & Integrasi",
    narrative: p6Narrative,
    practicalKey: "Pegang nilai yang kamu yakini dengan tenang, dan jadikan keseharian sebagai ruang belajar yang menenteramkan.",
  };

  const microCommitments = buildDynamicMicroCommitments(natal);

  const summaryParagraph =
    `Kesimpulan Dirimu: Membaca peta langit kelahiranmu (Matahari di ${sunSign}, Bulan di ${moonSign}, Rising di ${ascSign}) adalah undangan untuk mengenali rancangan kesadaran unik yang kamu bawa ke dunia ini. Kamu dibekali perpaduan elemen, orientasi rumah, dan dinamika kosmik yang mengajarimu cara berakar dengan teguh sekaligus berpikir merdeka. Ketika kamu melangkah dengan kejujuran batin dan menghormati ritme alamiahmu, setiap tantangan menjadi sarana pendewasaan yang mendalam dan setiap hari menjadi ruang untuk menghidupkan potensimu seutuhnya.`;

  const closingReflection =
    `Carta kelahiranmu adalah cermin kebijaksanaan batin. Pegang teguh kejujuran batinmu, hiduplah dengan kesadaran yang jernih, dan biarkan kebaikan mengalir dari setiap langkah nyatamu.`;

  return {
    heroInsight,
    natal,
    transits,
    planetReadings,
    houseReadings,
    partOfFortuneReading,
    ascendantReading,
    synthesis: {
      title: "Kesimpulan Dirimu: Harmoni Langit & Bumi",
      subtitle: "Rangkuman Integratif 6 Pilar: Identitas, Kekuatan, Bayangan, Relasi, Pertumbuhan, Integrasi",
      summaryParagraph,
      pillars: [p1, p2, p3, p4, p5, p6],
      microCommitments,
      closingReflection,
    },
  };
}