export type AstroFourPillarEntry = { penjelasan: string; gift: string; shadow: string; integrasi: string };

const BODY_ARCHETYPES: Record<string, [string, string, string, string]> = {
  Sun: ["identitas dan pilihan sadar", "menentukan arah yang sesuai nilai pribadi", "menggantungkan harga diri pada pengakuan", "pilih satu tindakan yang benar-benar mewakili dirimu"],
  Moon: ["kebutuhan emosional dan rasa aman", "mengenali kebutuhan sebelum meminta dukungan", "menganggap rasa tidak nyaman sebagai bukti penolakan", "beri nama perasaanmu sebelum merespons"],
  Mercury: ["pikiran dan komunikasi", "menjelaskan gagasan agar dapat dipahami bersama", "terus menganalisis tanpa memeriksa pemahaman lawan bicara", "tanyakan kembali maksud orang lain sebelum menyimpulkan"],
  Venus: ["nilai pribadi dan kedekatan", "membangun hubungan yang saling menghargai", "mengorbankan kebutuhan demi persetujuan", "ungkapkan satu kebutuhan dengan jelas dan ramah"],
  Mars: ["inisiatif dan penegasan batas", "mengubah keinginan menjadi tindakan terarah", "bertindak cepat tanpa mempertimbangkan dampaknya", "bedakan tindakan tegas dari tindakan yang menyakiti"],
  Jupiter: ["pencarian makna dan perluasan wawasan", "melihat peluang belajar tanpa kehilangan harapan", "menjanjikan lebih banyak daripada kapasitas nyata", "uji satu gagasan besar lewat langkah kecil"],
  Saturn: ["tanggung jawab dan struktur", "membangun kepercayaan lewat konsistensi", "menyamakan nilai diri dengan hasil kerja", "tetapkan batas komitmen yang menyisakan ruang istirahat"],
  Uranus: ["kebebasan dan pembaruan", "menemukan alternatif ketika cara lama tidak membantu", "mengubah arah hanya untuk menolak aturan", "uji pembaruan tanpa membuang dukungan yang masih berguna"],
  Neptune: ["imajinasi dan kepekaan", "memberi bentuk kreatif pada pengalaman yang sulit dijelaskan", "menganggap harapan sebagai fakta", "periksa fakta sambil tetap memberi ruang pada imajinasi"],
  Pluto: ["perubahan mendalam dan penggunaan kuasa", "meninjau kebiasaan yang sudah tidak membantu", "berusaha mengendalikan respons orang lain", "bedakan hal yang dapat kamu ubah dari pilihan milik orang lain"],
  Chiron: ["kepekaan dan belajar menerima keterbatasan", "menawarkan empati tanpa merasa harus memperbaiki semua orang", "menilai diri hanya dari bagian yang terasa belum cukup", "tanggapi keterbatasan dengan rasa ingin tahu, bukan vonis"],
  "Black Moon Lilith": ["otonomi dan hak menentukan batas", "menyatakan ketidaksetujuan tanpa mengecilkan diri", "menolak semua masukan demi mempertahankan kebebasan", "pilih batas yang melindungi sekaligus memungkinkan dialog"],
  "Lunar Nodes": ["keseimbangan kebiasaan South Node dan latihan baru North Node", "membawa keterampilan yang akrab ke pengalaman baru", "menganggap arah pertumbuhan sebagai kewajiban takdir", "coba kebiasaan baru tanpa merendahkan kemampuan yang sudah ada"],
  Ceres: ["perawatan dan timbal balik kebutuhan", "merawat dengan cara yang benar-benar dibutuhkan penerima", "memberi bantuan sampai kebutuhan sendiri terabaikan", "tanyakan bentuk dukungan yang diinginkan sebelum membantu"],
  Pallas: ["pengenalan pola dan strategi", "menghubungkan detail menjadi solusi yang bisa diuji", "terlalu mengandalkan teori hingga pengalaman nyata terlewat", "bandingkan pola yang kamu lihat dengan satu contoh tandingan"],
  Juno: ["komitmen dan kesetaraan kemitraan", "merundingkan kesepakatan yang adil bagi kedua pihak", "mempertahankan kesepakatan yang tidak lagi timbal balik", "bicarakan ulang pembagian tanggung jawab tanpa menganggap pasangan bisa membaca pikiran"],
  Vesta: ["fokus dan pengabdian pada hal bermakna", "menjaga perhatian pada pekerjaan yang dipilih dengan sadar", "mengabaikan istirahat demi menjaga fokus", "tentukan kapan berkarya dan kapan kembali merawat kehidupan sehari-hari"],
  "Part of Fortune": ["keselarasan rasa cukup, kelancaran hidup, dan kepuasan batin sejati", "menemukan kemudahan dan kelimpahan batin melalui keselarasan tindakan nyata", "mengukur keberuntungan hanya dari materi luar atau memaksakan kendali", "selaraskan tindakan praktis dengan apa yang menghidupkan rasa cukup dan rasa syukurmu"],
  Ascendant: ["cara hadir alami, kepribadian luar, dan caramu pertama kali menyapa dunia", "menavigasi situasi baru dengan kejernihan dan kehadiran autentik", "menjadikan topeng sosial sebagai tameng hingga menutup kerentanan batin", "selaraskan kesan pertamamu dengan kejujuran apa yang kamu rasakan di dalam"],
};

const SIGN_EXPRESSIONS: Record<string, [string, string, string]> = {
  Aries: ["mencoba langsung dan mengambil inisiatif", "mulai dari satu langkah yang dapat dievaluasi", "tergesa sebelum mendengar kebutuhan lain"],
  Taurus: ["membangun kestabilan melalui pengalaman nyata dan ritme yang konsisten", "pertahankan rutinitas yang membantu sambil mencoba satu perubahan kecil", "bertahan pada kenyamanan meski kebutuhan telah berubah"],
  Gemini: ["menjelajahi kemungkinan melalui pertanyaan dan percakapan", "bandingkan dua sudut pandang lalu pilih satu untuk ditindaklanjuti", "mengumpulkan pilihan tanpa memberi waktu untuk mendalami"],
  Cancer: ["memperhatikan kedekatan dan rasa terlindungi", "sampaikan kebutuhan dukungan tanpa menebak respons orang lain", "menutup diri ketika suasana berubah"],
  Leo: ["menampilkan gagasan dengan hangat dan kreatif", "bagikan karya sambil memberi ruang bagi kontribusi orang lain", "mengukur makna pengalaman dari banyaknya perhatian"],
  Virgo: ["memeriksa detail dan memperbaiki langkah praktis", "pilih perbaikan yang berguna, bukan kesempurnaan", "melihat kekurangan sampai kemajuan kecil terabaikan"],
  Libra: ["menimbang kepentingan dan mencari kesepakatan", "nyatakan pilihanmu sebelum mencari jalan tengah", "menunda keputusan untuk menghindari perbedaan"],
  Scorpio: ["mendalami kepercayaan dan makna di balik pengalaman", "bangun kepercayaan lewat kesepakatan yang dapat diperiksa", "mencari kepastian dengan mengontrol"],
  Sagittarius: ["mencari makna melalui pengalaman dan wawasan luas", "hubungkan keyakinan dengan tindakan yang realistis", "melewatkan detail karena terpikat gambaran besar"],
  Capricorn: ["menata tujuan dan tanggung jawab secara bertahap", "ukur kemajuan bersama kapasitas dan kebutuhan istirahat", "menganggap produktivitas sebagai satu-satunya ukuran"],
  Aquarius: ["menguji kebiasaan melalui gagasan alternatif", "jelaskan manfaat idemu bagi orang yang terlibat", "menjauh dari perasaan demi mempertahankan gagasan"],
  Pisces: ["memahami nuansa melalui imajinasi dan empati", "beri bentuk nyata pada gagasan sambil menjaga batas", "menyerap kebutuhan orang lain tanpa memeriksa kapasitas sendiri"],
};

const HOUSE_PROFILES: Record<number, [string, string]> = {
  1: ["cara hadir dan memulai", "mencoba cara memperkenalkan diri yang terasa jujur"],
  2: ["sumber daya dan rasa cukup", "menata pengeluaran sesuai kebutuhan, bukan pembuktian nilai diri"],
  3: ["belajar dan komunikasi sehari-hari", "membuat percakapan singkat yang memberi ruang untuk bertanya"],
  4: ["rumah dan fondasi pribadi", "menata ruang pulang serta kesepakatan waktu tenang di rumah"],
  5: ["kreativitas dan kegembiraan", "meluangkan waktu berkarya tanpa tuntutan penilaian"],
  6: ["rutinitas dan perawatan sehari-hari", "menyesuaikan jadwal kerja agar kebutuhan tubuh tidak terlewat"],
  7: ["kemitraan dan kesepakatan", "membicarakan pembagian peran dengan pasangan atau rekan"],
  8: ["kepercayaan dan sumber daya bersama", "memperjelas izin serta batas dalam berbagi tanggung jawab"],
  9: ["keyakinan dan perluasan wawasan", "menguji pandangan lewat belajar dari pengalaman berbeda"],
  10: ["karya dan tanggung jawab publik", "menyepakati target kerja yang dapat dipertanggungjawabkan"],
  11: ["komunitas dan tujuan bersama", "memilih peran kelompok yang sesuai kapasitas"],
  12: ["keheningan dan refleksi pribadi", "memberi waktu tenang tanpa harus segera menyimpulkan pengalaman"],
};

const ASPECT_DYNAMICS: Record<string, [string, string, string, string]> = {
  Conjunction: ["Konjungsi", "memusatkan dua kebutuhan dalam satu respons", "menggabungkan daya keduanya", "bedakan kebutuhan masing-masing sebelum bertindak"],
  Opposition: ["Oposisi", "menghadirkan dua kebutuhan yang perlu mendapat tempat bergantian", "melihat persoalan dari dua sisi", "hindari memilih satu sisi dengan menghapus sisi lainnya"],
  Square: ["Kuadrat", "menghadirkan gesekan antara dua cara merespons", "mencari solusi lewat penyesuaian nyata", "beri jeda ketika dua kebutuhan terasa saling menghalangi"],
  Trine: ["Trigon", "memudahkan kerja sama dua kebutuhan", "mengembangkan dukungan yang terasa alami", "tetap latih kemampuan yang mudah agar tidak terabaikan"],
  Sextile: ["Sekstil", "membuka peluang kerja sama jika diusahakan", "menghubungkan dua kemampuan lewat inisiatif kecil", "ambil langkah nyata alih-alih menunggu peluang bekerja sendiri"],
  Quincunx: ["Kuinkunx", "meminta penyesuaian antara kebutuhan yang berbeda ritme", "belajar mengatur ulang prioritas", "uji penyesuaian kecil tanpa memaksa semua hal seragam"],
};

export type ReadingContext = {
  sign?: string;
  house?: number;
  aspects?: { aspectType: string; planet1?: string; planet2?: string; counterpart?: string }[];
  isRetrograde?: boolean;
  chartRuler?: string;
  rulerPlacement?: string;
  southNode?: { sign: string; house: number };
};

const categories: Record<string, string[]> = {
  planets: ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"],
  chiron: ["Chiron"], lilith: ["Black Moon Lilith"], nodes: ["Lunar Nodes"], asteroids: ["Ceres", "Pallas", "Juno", "Vesta"],
  fortune: ["Part of Fortune"],
  ascendant: ["Ascendant"],
};

const BODY_DIRECT_INTRO: Record<string, string> = {
  Sun: "Matahari memancarkan vitalitas tujuan hidup, kehendak sadar, dan integritas pribadimu dalam menentukan arah.",
  Moon: "Bulan mencerminkan kebutuhan emosional terdalam, rasa aman batin, dan ritme perasaan yang mendasari duniamu.",
  Mercury: "Merkurius memandu caramu mengolah persepsi, berkomunikasi dengan jernih, dan menyusun alur berpikir.",
  Venus: "Venus mengarahkan caramu mencintai, membangun kedekatan, serta menghargai nilai pribadi dan keharmonisan.",
  Mars: "Mars menggerakkan daya inisiatif, keberanian bertindak nyata, dan ketegasanmu dalam menjaga batas diri.",
  Jupiter: "Jupiter membuka ruang pencarian makna, wawasan bertumbuh, dan optimisme dalam melihat kemungkinan baru.",
  Saturn: "Saturnus membangun ketahanan mental, kedewasaan memikul tanggung jawab, dan struktur yang kokoh.",
  Uranus: "Uranus menyalakan dorongan kebebasan autentik, orisinalitas berpikir, dan pembaruan cara pandang.",
  Neptune: "Neptunus memperhalus daya imajinasi, kepekaan rasa empati, dan pemahaman batin yang mendalam.",
  Pluto: "Pluto menyingkap kedalaman psikologis, daya regenerasi, dan kekuatanmu menghadapi perubahan mendalam.",
  Chiron: "Chiron menunjukkan titik kepekaan yang mengajarimu penerimaan tulus dan kebijaksanaan menyembuhkan diri.",
  "Black Moon Lilith": "Black Moon Lilith menegaskan otonomi murni dan keberanianmu mempertahankan integritas tanpa kompromi semu.",
  "Lunar Nodes": "Poros Lunar Nodes membimbing arah evolusi batinmu: mengintegrasikan kebiasaan South Node menuju latihan sadar North Node.",
  Ceres: "Ceres memperlihatkan caramu memberikan perawatan, memelihara diri, dan mewujudkan kasih sayang dalam tindakan nyata.",
  Pallas: "Pallas mempertajam pengenalan pola, kecerdasan strategis, dan kemampuan menghubungkan detail menjadi solusi nyata.",
  Juno: "Juno mencerminkan komitmen tulus, kesetaraan dalam kemitraan, dan kesetiaan pada relasi yang bermakna.",
  Vesta: "Vesta menyalakan api pengabdian batin, fokus terarah, dan dedikasi pada karya yang bermakna.",
  "Part of Fortune": "Part of Fortune (Pars Fortunae) menandai titik keselarasan alami di mana tubuh fisik, dorongan emosional, dan fokus mentalmu berpadu harmonis menghasilkan rasa cukup, kelancaran hidup, dan kepuasan sejati.",
  Ascendant: "Ascendant mencerminkan caramu menyapa dunia luar, kesan pertama yang kamu pancarkan, dan pintu gerbang bagaimana energimu berinteraksi dengan lingkungan sekitar.",
};

export function getFourPillarReading(category: string, key: string, context?: ReadingContext): AstroFourPillarEntry {
  if (!categories[category]?.includes(key)) throw new RangeError("Unsupported astrology reading key");
  const [theme, gift, shadow, practice] = BODY_ARCHETYPES[key];
  const sign = context?.sign === undefined ? undefined : SIGN_EXPRESSIONS[context.sign];
  const house = context?.house === undefined ? undefined : HOUSE_PROFILES[context.house];
  if (context?.sign !== undefined && !sign) throw new RangeError("Invalid reading sign");
  if (context?.house !== undefined && !house) throw new RangeError("Invalid reading house");
  const intro = BODY_DIRECT_INTRO[key] ?? `${key} menggerakkan ranah ${theme} dalam kehidupanmu.`;
  const placement = `${sign ? ` Di ${context?.sign}, kamu mengekspresikan ${sign[0]}.` : ""}${house ? ` House ${context?.house} memfokuskannya pada ${house[0]}.` : ""}`;
  const result = {
    penjelasan: `${intro}${placement}`,
    gift: `Melalui ${key}, kamu belajar ${gift}.${sign ? ` Latihlah dengan ${sign[1]}.` : ""}${house ? ` Di ranah ${house[0]}, kembangkan lewat ${house[1]}.` : ""}`,
    shadow: `Waspadai kemungkinan ${shadow}.${sign ? ` Di ${context?.sign}, cermati kecenderungan ${sign[2]}.` : ""}${house ? ` Pada ${house[0]}, kenali pola ini sebelum bereaksi.` : ""}`,
    integrasi: `Sebagai latihan ${key}, kamu bisa ${practice}.${sign ? ` Padukan dengan ${sign[1]}.` : ""}${house ? ` Awali pada ${house[0]} lewat ${house[1]}.` : ""}`,
  };
  if (context?.isRetrograde) {
    result.penjelasan += ` Retrograde natal ${key} mengarahkan energimu bekerja reflektif, meninjau dan mematangkan pertimbangan secara mandiri sebelum menampilkannya ke luar.`;
    result.gift += ` Kamu meluangkan waktu untuk menguji pemahaman ${theme} sebelum bertindak.`;
    result.shadow += " Refleksi ini berisiko menjadi penundaan jika menunggu kesempurnaan.";
    result.integrasi += ` Tulis pertimbangan batinmu, lalu pilih tindakan kecil yang dapat dievaluasi.`;
  }
  for (const aspect of context?.aspects ?? []) {
    const dynamics = ASPECT_DYNAMICS[aspect.aspectType] ?? Object.values(ASPECT_DYNAMICS).find(a => a[0] === aspect.aspectType);
    if (!dynamics) throw new RangeError("Invalid reading aspect");
    const body = key === "Lunar Nodes" ? "North Node" : key;
    if (aspect.planet1 && aspect.planet2 && aspect.planet1 !== body && aspect.planet2 !== body) continue;
    const other = aspect.counterpart ?? (aspect.planet1 === body ? aspect.planet2 : aspect.planet2 === body ? aspect.planet1 : undefined);
    if (!other) continue;
    const otherTheme = BODY_ARCHETYPES[other]?.[0] ?? (other === "South Node" || other === "North Node" ? BODY_ARCHETYPES["Lunar Nodes"][0] : undefined);
    if (!otherTheme) throw new RangeError("Invalid aspect counterpart");
    if (aspect.aspectType === "Conjunction" || dynamics[0] === "Konjungsi") {
      result.penjelasan += ` Konjungsi dengan ${other} menyatukan ${theme} dan ${otherTheme}.`;
      result.gift += ` Bersama ${other}, kamu dapat ${dynamics[2]}.`;
      result.shadow += ` Bersama ${other}, bedakan dorongan ${theme} dari kebutuhan ${otherTheme}.`;
      result.integrasi += ` Untuk ${dynamics[0]} dengan ${other}, ${dynamics[3]}.`;
    } else if (aspect.aspectType === "Trine" || dynamics[0] === "Trigon") {
      result.penjelasan += ` Trigon dengan ${other} memudahkan kerja sama antara ${theme} dan ${otherTheme}.`;
      result.gift += ` Bersama ${other}, kamu dapat ${dynamics[2]}.`;
      result.shadow += ` Dalam Trigon dengan ${other}, rawat kebutuhan ${otherTheme} agar tidak terabaikan.`;
      result.integrasi += ` Untuk ${dynamics[0]} dengan ${other}, ${dynamics[3]}.`;
    } else if (aspect.aspectType === "Sextile" || dynamics[0] === "Sekstil") {
      result.penjelasan += ` Sekstil dengan ${other} membuka peluang sinergi antara ${theme} dan ${otherTheme}.`;
      result.gift += ` Bersama ${other}, kamu dapat ${dynamics[2]}.`;
      result.shadow += ` Dalam Sekstil dengan ${other}, seimbangkan ${otherTheme} bersama ${theme}.`;
      result.integrasi += ` Untuk ${dynamics[0]} dengan ${other}, ${dynamics[3]}.`;
    } else if (aspect.aspectType === "Square" || dynamics[0] === "Kuadrat") {
      result.penjelasan += ` Kuadrat dengan ${other} memicu pertumbuhan sadar antara ${theme} dan ${otherTheme}.`;
      result.gift += ` Bersama ${other}, kamu dapat ${dynamics[2]}.`;
      result.shadow += ` Dalam Kuadrat dengan ${other}, kelola gesekan ${otherTheme} dan ${theme} dengan sabar.`;
      result.integrasi += ` Untuk ${dynamics[0]} dengan ${other}, ${dynamics[3]}.`;
    } else if (aspect.aspectType === "Opposition" || dynamics[0] === "Oposisi") {
      result.penjelasan += ` Oposisi dengan ${other} menyeimbangkan sudut pandang antara ${theme} dan ${otherTheme}.`;
      result.gift += ` Bersama ${other}, kamu dapat ${dynamics[2]}.`;
      result.shadow += ` Dalam Oposisi dengan ${other}, beri ruang bergantian tanpa meniadakan salah satunya.`;
      result.integrasi += ` Untuk ${dynamics[0]} dengan ${other}, ${dynamics[3]}.`;
    } else {
      result.penjelasan += ` ${dynamics[0]} dengan ${other} menuntut penyesuaian antara ${theme} dan ${otherTheme}.`;
      result.gift += ` Bersama ${other}, kamu dapat ${dynamics[2]}.`;
      result.shadow += ` Dalam ${dynamics[0]} dengan ${other}, tata ulang ritme bersama ${otherTheme}.`;
      result.integrasi += ` Untuk ${dynamics[0]} dengan ${other}, ${dynamics[3]}.`;
    }
  }
  if (key === "Lunar Nodes" && context?.southNode) {
    const south = context.southNode;
    if (!SIGN_EXPRESSIONS[south.sign] || !HOUSE_PROFILES[south.house]) throw new RangeError("Invalid South Node context");
    result.penjelasan += ` North Node${context.sign ? ` di ${context.sign}` : ""}${context.house ? ` House ${context.house}` : ""} berakar dari modal South Node di ${south.sign} House ${south.house}.`;
    result.integrasi += ` Bawa pengalaman ${HOUSE_PROFILES[south.house][0]} dari South Node untuk melatih ${house?.[0] ?? "arah North Node"}.`;
  }
  if (key === "Part of Fortune" && context?.chartRuler && context.rulerPlacement && context.rulerPlacement !== "tidak diketahui") {
    result.penjelasan += ` Penguasa ${context.chartRuler} di ${context.rulerPlacement} menyalurkan kelancaran dan rasa cukupmu ke arena tersebut.`;
  }
  if (context?.chartRuler && context.rulerPlacement && context.rulerPlacement !== "tidak diketahui") {
    result.integrasi += ` Chart Ruler (${context.chartRuler}, Ruler bagan) di ${context.rulerPlacement} mengarahkan integrasi ini ke panggung pertumbuhan utamamu.`;
  }
  return result;
}

export const ASTRO_FOUR_PILLAR_CORPUS: Record<string, Record<string, AstroFourPillarEntry>> = Object.fromEntries(
  Object.entries(categories).map(([category, keys]) => [category, Object.fromEntries(keys.map(key => [key, getFourPillarReading(category, key)]))]),
);

export { BODY_ARCHETYPES, SIGN_EXPRESSIONS, HOUSE_PROFILES, ASPECT_DYNAMICS };

export const ASCENDANT_ARCHETYPES: Record<string, {
  firstImpression: string;
  unfamiliarApproach: string;
  presenceQuality: string;
  rulerModernName: string;
  rulerTradName?: string;
  modernTrait: string;
  tradTrait?: string;
  gift: string;
  shadow: string;
  integrasi: string;
}> = {
  Aries: {
    firstImpression: "spontan, berani mengambil inisiatif, dan memancarkan energi langsung tanpa berbelit-belit",
    unfamiliarApproach: "langsung melangkah ke depan untuk menguji keadaan lewat tindakan nyata",
    presenceQuality: "kejujuran ekspresi yang lugas, vitalitas segar, dan keberanian merintis jalan baru",
    rulerModernName: "Mars",
    modernTrait: "daya dorong untuk bertindak tangkas dan menegakkan batas diri secara tegas",
    gift: "Kekuatan utamamu adalah keberanian menjadi pelopor di saat orang lain diliputi keraguan. Kamu memiliki ketangkasan memecahkan kebekuan, ketegasan naluriah dalam mengambil keputusan penting, serta daya juang menular yang menyalakan optimisme lingkungan sekitar untuk berani mencoba hal baru dan melangkah maju bersama.",
    shadow: "Waspadai kecenderungan terburu-buru atau bersikap defensif saat situasi tidak bergerak secepat harapanmu. Dorongan serba cepat berisiko membuatmu kurang sabar mendengarkan kebutuhan sekitar atau mengabaikan kelelahan fisik, hingga memaksakan kehendak secara impulsif saat menghadapi perbedaan pandangan dengan orang lain di sekitarmu.",
    integrasi: "Selaraskan langkahmu dengan memadukan ketangkasan inisiatif dan kelembutan mendengar secara mendalam. Beri jeda sejenak sebelum bereaksi, percayai proses yang bertahap, dan biarkan keberanianmu hadir sebagai pelindung yang meneduhkan agar kepemimpinanmu dihormati serta membuahkan hasil nyata yang bertahan lama bagi kebaikan bersama.",
  },
  Taurus: {
    firstImpression: "tenang, membumi, berwibawa, dan memancarkan rasa aman yang menyejukkan lingkungan sekitar",
    unfamiliarApproach: "melambatkan ritme untuk merasakan atmosfer sekitar dan memastikan pijakan yang kokoh",
    presenceQuality: "kesabaran yang tulus, keanggunan bersahaja, dan kestabilan sikap yang menenteramkan",
    rulerModernName: "Venus",
    modernTrait: "kepekaan rasa untuk menciptakan keharmonisan, keindahan nyata, dan apresiasi nilai hidup",
    gift: "Kekuatan terbesarmu adalah daya tahan yang kokoh dan ketenangan batin yang tidak mudah panik oleh gejolak sekitar. Kamu memiliki bakat alami menenangkan suasana, membangun rasa aman yang realistis, serta merawat karya dan hubungan dengan kesabaran mendalam hingga mekar berbuah nyata.",
    shadow: "Perhatikan keengganan beradaptasi ketika situasi menuntut perubahan mendadak di luar rencana. Rasa nyaman yang dipertahankan berlebihan dapat berubah menjadi kekakuan sikap, penolakan keras terhadap pembaruan, atau bertahan pada pola usang hanya karena takut kehilangan kepastian yang telah kamu bangun selama ini.",
    integrasi: "Buka ruang bagi keluwesan di tengah keteguhan prinsipmu yang kokoh. Jadikan ketenangan tubuh sebagai jangkar untuk menyambut dinamika baru dengan lapang dada. Belajarlah melepaskan hal-hal yang selesai fungsinya, membiarkan aliran berkah baru menyegarkan perjalanan hidupmu tanpa mengurangi rasa aman sejatimu.",
  },
  Gemini: {
    firstImpression: "lincah, komunikatif, ramah, dan memancarkan rasa ingin tahu yang hangat terhadap dunia luar",
    unfamiliarApproach: "mengajukan pertanyaan, mengamati percakapan, dan mencari jembatan informasi yang mencairkan suasana",
    presenceQuality: "keluwesan bergaul, kecerdasan verbal yang ceria, dan keterbukaan menerima sudut pandang berbeda",
    rulerModernName: "Mercury",
    modernTrait: "kelincahan menghubungkan gagasan, merangkum wawasan baru, dan menjalin dialog luwes",
    gift: "Kekuatan alamimu adalah kepiawaian membaca dinamika sosial dan menghubungkan banyak orang lewat pertukaran informasi yang bermanfaat. Kamu mudah beradaptasi di lingkungan baru, piawai menyederhanakan gagasan rumit, serta menghidupkan percakapan dengan sudut pandang segar yang membebaskan pikiran dari kejenuhan rutinitas sehari-hari.",
    shadow: "Tantangan utamamu adalah perhatian yang mudah terpecah ke terlalu banyak arah hingga sulit menuntaskan hal mendasar. Terkadang kamu menggunakan percakapan atau logika sebagai tameng menghindari kedalaman emosional, atau terus mencari stimulasi informasi luar hingga mengalami kelelahan mental tanpa kamu sadari sepenuhnya.",
    integrasi: "Latih kehadiran batin yang mendalam di tengah rasa ingin tahu yang luas. Pilih satu wawasan utama untuk diwujudkan hingga tuntas, dan imbangi kelincahan bicara dengan seni mendengarkan secara hening. Menambatkan pikiran pada ketenangan hati membuat komunikasimu menyentuh jiwa dan membawa dampak langgeng.",
  },
  Cancer: {
    firstImpression: "lembut, penuh perhatian, reseptif, dan memiliki kepekaan rasa yang menyentuh hati",
    unfamiliarApproach: "menjaga jarak aman terlebih dahulu sambil membaca suasana emosional lingkungan dengan waspada",
    presenceQuality: "kehangatan pengasuhan alami, empati yang tulus, dan aura protektif yang meneduhkan",
    rulerModernName: "Moon",
    modernTrait: "kedalaman intuisi batin, kepekaan emosional yang kaya, dan ketulusan merawat ikatan",
    gift: "Kekuatan terbesarmu adalah kepekaan intuitif yang tajam untuk menangkap kebutuhan batin sesama bahkan sebelum terucap. Kamu berbakat menciptakan suasana kekeluargaan di mana pun berada, merawat hubungan dengan kesetiaan mendalam, serta menghadirkan rasa diterima apa adanya yang menumbuhkan kembali harapan jiwa.",
    shadow: "Waspadai kecenderungan menutup diri rapat-rapat atau bersikap defensif saat merasa tidak aman. Kamu rentan menyerap ketegangan lingkungan ke dalam perasaan sendiri, menarik diri ke dalam cangkang perlindungan, dan membiarkan prasangka tumbuh tanpa konfirmasi jujur yang sesungguhnya dapat menuntaskan salah paham.",
    integrasi: "Bangun batas pelindung emosional yang sehat dan bermartabat dalam pergaulanmu. Rawat kelembutan hatimu tanpa membiarkannya terkuras oleh suasana sekitar yang bising. Saat kamu merasa aman di rumah jiwamu sendiri, kehangatan kasihmu akan mengalir bebas, tulus, dan meneduhkan tanpa rasa takut terluka.",
  },
  Leo: {
    firstImpression: "hangat, berwibawa, bersahaja, dan memancarkan sinar percaya diri yang alami",
    unfamiliarApproach: "menyapa sekitar dengan kemurahan hati, senyum terbuka, dan ekspresi diri yang jujur",
    presenceQuality: "vitalitas kreatif yang membangkitkan gairah, keberanian memimpin, dan daya pikat yang menghangatkan",
    rulerModernName: "Sun",
    modernTrait: "daya cipta yang bersinar, integritas kepemimpinan sadar, dan komitmen menjadi inspirasi",
    gift: "Kekuatan terbesarmu adalah membangkitkan rasa percaya diri dan antusiasme pada orang-orang di sekitarmu. Kamu dianugerahi bakat kepemimpinan yang murah hati, keberanian membela hal yang benar, serta daya cipta hangat yang mampu mengubah suasana biasa menjadi penuh gairah, semangat, dan harapan.",
    shadow: "Cermati rasa haus akan pengakuan luar atau mudah merasa terluka saat kontribusimu kurang diperhatikan sesama. Mengukur harga diri semata-mata dari banyaknya pujian membuatmu rentan bersikap dominan, kaku, atau menutup kehangatan hati di balik topeng kebanggaan diri saat menghadapi ketidakpastian yang tidak nyaman.",
    integrasi: "Pancarkan sinar kebaikan demi ketulusan itu sendiri, bukan demi tepuk tangan orang lain. Ketika rasa berhargamu berakar pada kesadaran batin yang tenang, kehadiranmu menjadi penguat bagi lingkungan. Berikan ruang bagi orang lain untuk bersinar bersama, memimpin dengan melayani secara bersahaja dan tulus.",
  },
  Virgo: {
    firstImpression: "santun, bersahaja, cermat mengamati, dan memancarkan kecerdasan praktis yang siap membantu",
    unfamiliarApproach: "memperhatikan tata kelola lingkungan dan mencari cara paling efisien untuk berfungsi sehat",
    presenceQuality: "kesederhanaan yang anggun, ketelitian analitis, dan dedikasi nyata memperbaiki keadaan",
    rulerModernName: "Mercury",
    modernTrait: "kecermatan memilah hal esensial dan keahlian merancang solusi yang berfungsi rapi",
    gift: "Kekuatan utamamu adalah ketelitian mengurai persoalan rumit menjadi langkah-langkah solutif yang rapi dan mudah dijalankan. Kamu memiliki dedikasi melayani yang tinggi, kepekaan melihat celah perbaikan yang terlewatkan, serta etos kerja terpercaya yang memberi rasa aman dan kepastian nyata bagi lingkungan sekitarmu.",
    shadow: "Waspadai kritik internal yang terlalu keras terhadap diri sendiri maupun orang lain. Kekhawatiran berlebihan akan ketidaksempurnaan bisa memicu kecemasan, menunda penyelesaian tugas, atau terlalu membebani tubuh dengan standar kaku tanpa memberi ruang istirahat yang cukup untuk memulihkan kesegaran energimu setiap hari.",
    integrasi: "Belajarlah merayakan kemajuan bertahap di atas tuntutan kesempurnaan mutlak. Jadikan ketelitian analitis sebagai wujud cinta pada proses berkarya, dan beri ruang bagi diri untuk bernapas lega. Pelayananmu akan terasa paling berdaya saat didasari oleh rasa syukur, ketenangan, dan kebaikan hati yang membumi.",
  },
  Libra: {
    firstImpression: "anggun, diplomatis, memikat, dan memancarkan komitmen pada keadilan serta keharmonisan relasi",
    unfamiliarApproach: "membangun dialog berimbang, mendengarkan sudut pandang lain, dan menciptakan perjumpaan setara",
    presenceQuality: "kepekaan estetika yang halus, kemampuan mendamaikan perbedaan, dan keanggunan bersikap yang menyejukkan",
    rulerModernName: "Venus",
    modernTrait: "diplomasi yang adil, penghargaan pada harmoni, dan kemampuan merumuskan kesepakatan sehat",
    gift: "Kekuatan terbesarmu adalah kepiawaian meredakan ketegangan dan mendamaikan perbedaan melalui dialog yang objektif dan santun. Kamu memiliki rasa keadilan yang murni, selera estetika berkelas, serta kecakapan sosial yang membuat setiap pihak merasa dihargai, didengarkan, dan diperlakukan secara setara dan terhormat.",
    shadow: "Perhatikan kecenderungan menunda keputusan tegas hanya demi menghindari friksi atau ketidaknyamanan sesaat. Menyenangkan ekspektasi orang lain secara berlebihan dapat mengorbankan kejujuran suara hatimu sendiri, memicu keraguan yang membingungkan orang sekitar dan menumpuk beban emosional yang mengaburkan arah hubungan pribadimu di masa depan.",
    integrasi: "Sadari bahwa kedamaian sejati dibangun di atas fondasi kejujuran utuh, bukan kompromi semu. Nyatakan batasan dan pilihanmu dengan kelembutan yang tegas. Kejujuran yang disampaikan dengan santun justru memperkuat rasa saling percaya dan merajut hubungan yang sehat, harmonis, serta bertahan lama.",
  },
  Scorpio: {
    firstImpression: "tenang, intens, berdaya pikat mendalam, dan memancarkan kewaspadaan intuitif yang tajam",
    unfamiliarApproach: "mengamati motif di balik tindakan orang lain dan menakar kejujuran lingkungan sebelum membuka diri",
    presenceQuality: "keberanian psikologis yang mendalam, ketahanan batin menghadapi krisis, dan ketulusan komitmen",
    rulerModernName: "Pluto",
    rulerTradName: "Mars",
    modernTrait: "daya regenerasi batin dan kemampuan menembus kepura-puraan",
    tradTrait: "ketajaman fokus bertindak dan keberanian menembus ujian",
    gift: "Kekuatan terbesarmu adalah kejernihan membaca apa yang tersembunyi dan keberanian menavigasi masa krisis dengan keteguhan luar biasa. Kamu adalah pendengar setia, pelindung rahasia yang terpercaya, memiliki daya pulih tangguh dari setiap kejatuhan, serta ketulusan komitmen yang tak pernah berkhianat pada kebenaran.",
    shadow: "Cermati benteng pertahanan yang terlalu curiga atau keinginan mengontrol dinamika hubungan demi menjaga rasa aman. Ketakutan bahwa kerentananmu akan disalahgunakan dapat memicu sikap terlalu tertutup dan menjaga jarak dingin, menghambat keintiman tulus yang sesungguhnya sangat kamu rindukan di lubuk hatimu.",
    integrasi: "Izinkan rasa percaya bertumbuh sedikit demi sedikit melalui pembuktian nyata. Salurkan intensitas emosionalmu ke dalam karya transformatif yang membebaskan. Membuka hati secara bijak di hadapan orang yang tepat bukanlah kelemahan, melainkan puncak dari keberanian jiwamu untuk mencintai dan mempercayai kehidupan.",
  },
  Sagittarius: {
    firstImpression: "terbuka, optimis, berjiwa petualang, dan memancarkan antusiasme filosofis yang menyegarkan",
    unfamiliarApproach: "melihat situasi baru sebagai peluang belajar, mencari kesamaan visi, dan mencairkan suasana",
    presenceQuality: "kejujuran pandangan yang segar, keterbukaan cakrawala berpikir, dan keyakinan pada kebaikan hidup",
    rulerModernName: "Jupiter",
    modernTrait: "kemurahan hati melihat peluang bertumbuh dan pencarian makna yang luas",
    gift: "Kekuatan alamimu adalah kemampuan meniupkan optimisme dan membimbing orang lain keluar dari kebuntuan melalui visi masa depan yang cerah. Kamu memiliki kejujuran nurani yang lurus, kegembiraan menjelajah wawasan baru, serta keterbukaan batin yang menginspirasi sesama untuk berani melangkah melampaui rasa takut.",
    shadow: "Tantanganmu adalah kecenderungan bersikap menggurui, terlalu cepat menyimpulkan tanpa memeriksa detail konkret, atau menjanjikan hal yang melampaui kapasitas nyata. Kejujuran yang terlalu telanjang tanpa memperhatikan sensitivitas suasana hati orang lain bisa melukai perasaan tanpa sengaja dan memicu kekecewaan di lapangan.",
    integrasi: "Tambatkan pandangan luasmu pada disiplin tindakan nyata sehari-hari. Dengarkan realitas konkret di sekitarmu dengan kerendahan hati, dan padukan antusiasme bicaramu dengan kepekaan rasa, sehingga kebenaran yang kamu sampaikan terasa sejuk, membangun, dan menyatukan hati banyak orang dalam perjalanan menuju kebaikan bersama.",
  },
  Capricorn: {
    firstImpression: "matang, tenang, berwibawa, terstruktur, dan memancarkan kompetensi yang dapat diandalkan",
    unfamiliarApproach: "menilai konteks tanggung jawab, menakar aturan main, dan menjaga integritas diri",
    presenceQuality: "ketenangan mengendalikan situasi krisis, komitmen jangka panjang, dan kedewasaan bersikap",
    rulerModernName: "Saturn",
    modernTrait: "kedisiplinan berstruktur, ketahanan menapaki ujian, dan komitmen membangun karya kokoh",
    gift: "Kekuatan terbesarmu adalah ketahanan mental dan keandalan kerja dalam mewujudkan cita-cita besar secara bertahap. Kamu adalah sosok pemimpin yang tenang di tengah badai, piawai mengelola sumber daya dengan efisien, serta memiliki integritas tinggi yang menumbuhkan rasa percaya mendalam dari siapa pun.",
    shadow: "Perhatikan kebiasaan memikul beban sendirian dan menyamakan nilai dirimu semata-mata dengan capaian kerja atau status formal. Sikap yang terlalu kaku dan ketakutan akan kegagalan bisa membuatmu berjarak, sulit rileks menikmati proses, serta mengabaikan kebutuhan istirahat tubuh demi mengejar target tanpa henti.",
    integrasi: "Seimbangkan etos tanggung jawab dengan kelembutan terhadap diri sendiri. Beri ruang bagi kehangatan hati, spontanitas, dan istirahat tanpa rasa bersalah. Mengizinkan orang lain berbagi tugas akan meringankan langkahmu menuju puncak tujuan dengan penuh martabat, sukacita batin, dan ketenteraman jiwa yang berkelanjutan.",
  },
  Aquarius: {
    firstImpression: "mandiri, orisinal, berpikiran terbuka, dan memancarkan aura kesetaraan yang inklusif",
    unfamiliarApproach: "mengamati keadaan secara objektif dari sudut pandang luas sebelum memutuskan keterlibatan",
    presenceQuality: "kejernihan intelektual yang visioner, sikap egalitarian yang bersahabat, dan kebebasan berpikir",
    rulerModernName: "Uranus",
    rulerTradName: "Saturn",
    modernTrait: "kemandirian berpikir dan dorongan pembaruan alternatif",
    tradTrait: "ketahanan berstruktur dan kedewasaan memikul tanggung jawab",
    gift: "Kekuatan terbesarmu adalah kejernihan perspektif untuk melihat alternatif solusi yang melampaui kebiasaan lama. Kamu memiliki bakat alami merangkul keberagaman dengan persahabatan tulus, memperjuangkan kebaikan bersama tanpa pamrih, serta mempertahankan integritas pemikiran mandiri yang membawa hawa segar pembaruan bagi lingkungan sekitarmu.",
    shadow: "Cermati dorongan menarik diri ke pengamatan dingin saat situasi emosional terasa menuntut kedekatan. Mengandalkan logika intelektual semata bisa membuatmu tampak berjarak, seolah mengamati kehidupan dari jauh tanpa ikut merasakan, hingga enggan mengakui kerentanan batin atau meminta pertolongan pada orang terdekat.",
    integrasi: "Satukan visi masa depan yang merdeka dengan kehangatan relasi yang membumi. Izinkan hatimu ikut merasakan dan terlibat utuh dalam perjumpaan sehari-hari, bukan sekadar memahaminya sebagai konsep. Biarkan kehangatan rasa melengkapi kejernihan pemikiranmu, mewujudkan kehadiran yang membebaskan sekaligus mendekatkan hati dengan penuh kasih.",
  },
  Pisces: {
    firstImpression: "lembut, puitis, penuh empati, dan memancarkan kepekaan rasa yang mengalir tenang",
    unfamiliarApproach: "merasakan atmosfer emosional sekitar secara intuitif dan beradaptasi dengan kelembutan alur",
    presenceQuality: "welas asih yang melarutkan sekat, imajinasi kreatif yang kaya, dan ketenangan yang merangkul",
    rulerModernName: "Neptune",
    rulerTradName: "Jupiter",
    modernTrait: "kehalusan daya imajinasi dan kepekaan intuisi spiritual",
    tradTrait: "kelapangan welas asih dan optimisme batin yang mendalam",
    gift: "Kekuatan alamimu adalah empati yang luas dan kemampuan mendengarkan dengan seluruh jiwa tanpa menghakimi kekurangan orang lain. Kamu memiliki bakat artistik dan spiritual menangkap nuansa batin yang tak terkatakan, menghadirkan kedamaian di ruang yang tegang, serta memulihkan luka hati lewat kehadiran penuh kasih.",
    shadow: "Waspadai batas pribadi yang mudah kabur hingga kamu kerap menyerap kepedihan orang lain secara berlebihan. Rasa enggan menghadapi benturan nyata bisa memicu pelarian ke angan-angan pasif, kebiasaan menunda kejelasan sikap, dan kebingungan batin yang menguras energi serta mengaburkan arah tindakan praktismu.",
    integrasi: "Tegakkan kepekaan empatimu pada batas diri yang sehat dan kokoh. Salurkan kekayaan imajinasi ke dalam karya nyata yang memberdayakan. Rawatlah waktu hening untuk menyegarkan kembali jiwamu, menyadari bahwa melindungi energimu adalah kunci untuk terus melayani kehidupan dengan cinta yang jernih dan berkelanjutan.",
  },
};

export type DetailedAscendantReading = {
  sign: string;
  formattedDegree: string;
  chartRuler: string;
  chartRulerPlacement: { sign: string; house: number; formattedDegree: string };
  pillar: AstroFourPillarEntry;
  level2Combination: string;
  wordCounts: {
    penjelasan: number;
    gift: number;
    shadow: number;
    integrasi: number;
    total: number;
  };
};

function countEditorialWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export function buildAscendantFourPillars(params: {
  ascSign: string;
  ascFormattedDegree: string;
  chartRuler: string;
  chartRulerPlacement: { sign: string; house: number; formattedDegree: string };
  allPlanets: { name: string; sign: string; house: number; formattedDegree: string }[];
  sun: { sign: string; house: number };
  moon: { sign: string; house: number };
}): DetailedAscendantReading {
  const { ascSign, ascFormattedDegree, chartRuler, chartRulerPlacement, allPlanets, sun, moon } = params;
  const arch = ASCENDANT_ARCHETYPES[ascSign] || ASCENDANT_ARCHETYPES.Aquarius;

  let rulerSynthesis = "";
  if (arch.rulerTradName) {
    const tradObj = allPlanets.find((p) => p.name === arch.rulerTradName);
    const tradPlacementStr = tradObj ? `${tradObj.sign} House ${tradObj.house}` : "carta kelahiranmu";
    rulerSynthesis = `Langkahmu diarahkan penguasa modern ${arch.rulerModernName} di ${chartRulerPlacement.sign} House ${chartRulerPlacement.house} (${arch.modernTrait}) serta didampingi penguasa tradisional ${arch.rulerTradName} di ${tradPlacementStr} (${arch.tradTrait}).`;
  } else {
    rulerSynthesis = `Langkahmu dipandu planet penguasa ${chartRuler} di ${chartRulerPlacement.sign} House ${chartRulerPlacement.house}, menyalurkan ${arch.modernTrait} langsung ke arena tersebut sebagai penggerak ekspresimu.`;
  }

  const sunMoonDialogue = `Gaya hadir ini mempertemukan kehendak sadar Matahari di ${sun.sign} House ${sun.house} dengan kebutuhan rasa aman Bulan di ${moon.sign} House ${moon.house}, menyelaraskan langkah luarmu dengan ketenangan batin.`;

  const penjelasan =
    `Kamu menyapa dunia melalui Ascendant di ${ascFormattedDegree}, menampilkan kesan awal yang ${arch.firstImpression}. ` +
    `Di lingkungan baru, kamu cenderung ${arch.unfamiliarApproach}. ` +
    `Kehadiran sosialmu memancarkan ${arch.presenceQuality}, meninggalkan kesan yang berkarakter bagi orang di sekitarmu. ` +
    `${rulerSynthesis} ` +
    `${sunMoonDialogue}`;

  const gift = arch.gift;
  const shadow = arch.shadow;
  const integrasi = arch.integrasi;

  const level2Combination = `Rising ${ascSign} (${ascFormattedDegree}) menghadirkan cara hadir yang ${arch.firstImpression}. Diarahkan oleh Chart Ruler ${chartRuler} di ${chartRulerPlacement.sign} House ${chartRulerPlacement.house}.`;

  return {
    sign: ascSign,
    formattedDegree: ascFormattedDegree,
    chartRuler,
    chartRulerPlacement,
    pillar: {
      penjelasan,
      gift,
      shadow,
      integrasi,
    },
    level2Combination,
    wordCounts: {
      penjelasan: countEditorialWords(penjelasan),
      gift: countEditorialWords(gift),
      shadow: countEditorialWords(shadow),
      integrasi: countEditorialWords(integrasi),
      total: countEditorialWords(penjelasan) + countEditorialWords(gift) + countEditorialWords(shadow) + countEditorialWords(integrasi),
    },
  };
}
