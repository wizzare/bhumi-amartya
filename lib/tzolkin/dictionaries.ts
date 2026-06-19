import { Castle, GalacticTone, SolarSeal, Wavespell } from "./types";

export const SOLAR_SEALS: SolarSeal[] = [
  {
    name: "Naga Merah (Imix)",
    keyword: "Kelahiran",
    gift: "Mampu memulai hal baru dan memelihara kehidupan.",
    challenge: "Masalah kepercayaan dan kesulitan menerima pengasuhan.",
    purpose: "Menjadi sumber kehidupan dan inisiator permulaan yang baru.",
  },
  {
    name: "Angin Putih (Ik)",
    keyword: "Roh / Komunikasi",
    gift: "Mampu menyampaikan kebenaran dengan jelas dan menginspirasi orang lain.",
    challenge: "Terjebak dalam keraguan atau miskomunikasi.",
    purpose: "Menyebarkan pesan spiritual dan memperkuat koneksi antar jiwa.",
  },
  {
    name: "Malam Biru (Akbal)",
    keyword: "Kelimpahan / Intuisi",
    gift: "Intuisi yang tajam dan kemampuan mewujudkan impian menjadi kenyataan.",
    challenge: "Takut pada hal yang tidak diketahui atau merasa kekurangan.",
    purpose: "Membawa kebijaksanaan dari alam bawah sadar dan menciptakan kelimpahan.",
  },
  {
    name: "Benih Kuning (Kan)",
    keyword: "Kesadaran / Potensi",
    gift: "Mampu melihat dan menumbuhkan potensi dalam situasi apapun.",
    challenge: "Ketidaksabaran atau keraguan untuk bertumbuh.",
    purpose: "Menanamkan kesadaran dan membantu ide-ide berkembang hingga matang.",
  },
  {
    name: "Ular Merah (Chicchan)",
    keyword: "Daya Hidup / Insting",
    gift: "Koneksi kuat dengan tubuh fisik dan insting bertahan hidup yang tajam.",
    challenge: "Reaksi emosional yang berlebihan atau terjebak dalam insting dasar.",
    purpose: "Mengaktifkan energi kehidupan (kundalini) dan gairah untuk hidup.",
  },
  {
    name: "Penghubung Dunia Putih (Cimi)",
    keyword: "Kematian / Pelepasan",
    gift: "Mampu melepaskan masa lalu dan memfasilitasi transisi atau transformasi.",
    challenge: "Ketakutan akan kematian atau kesulitan melepaskan kemelekatan.",
    purpose: "Membuka jalan bagi awal yang baru dengan menyelaraskan berbagai dimensi.",
  },
  {
    name: "Tangan Biru (Manik)",
    keyword: "Penyembuhan / Pencapaian",
    gift: "Kemampuan menyembuhkan dan mewujudkan sesuatu secara nyata (keterampilan).",
    challenge: "Terlalu banyak bekerja atau merasa tidak cukup berprestasi.",
    purpose: "Menyelesaikan proses melalui tindakan nyata dan energi penyembuhan.",
  },
  {
    name: "Bintang Kuning (Lamat)",
    keyword: "Keindahan / Harmoni",
    gift: "Menciptakan keindahan, keharmonisan, dan karya seni dalam kehidupan.",
    challenge: "Perfeksionisme atau intoleransi terhadap ketidakharmonisan.",
    purpose: "Mengingatkan manusia akan keanggunan dan desain sempurna dari semesta.",
  },
  {
    name: "Bulan Merah (Muluc)",
    keyword: "Pemurnian / Aliran",
    gift: "Kemampuan untuk mengalir, merasakan emosi secara mendalam, dan memurnikan.",
    challenge: "Terjebak dalam drama emosional atau menahan perasaan.",
    purpose: "Membersihkan hambatan batin dan menyelaraskan diri dengan aliran semesta.",
  },
  {
    name: "Anjing Putih (Oc)",
    keyword: "Cinta / Kesetiaan",
    gift: "Cinta tanpa syarat, kesetiaan pada kebenaran hati, dan empati.",
    challenge: "Kecemburuan, posesif, atau mengabaikan batasan diri sendiri.",
    purpose: "Menjadi teladan cinta kasih dan persahabatan yang tulus.",
  },
  {
    name: "Monyet Biru (Chuen)",
    keyword: "Keajaiban / Ilusi",
    gift: "Rasa humor, keceriaan, dan kemampuan melihat menembus ilusi.",
    challenge: "Menjadi terlalu serius atau menggunakan kelicikan.",
    purpose: "Membawa kegembiraan dan mengingatkan bahwa hidup adalah permainan ilahi.",
  },
  {
    name: "Manusia Kuning (Eb)",
    keyword: "Kehendak Bebas / Kebijaksanaan",
    gift: "Kemampuan membuat pilihan sadar dan membimbing orang lain dengan bijak.",
    challenge: "Menghakimi atau memaksakan kehendak pada orang lain.",
    purpose: "Menggunakan kehendak bebas untuk melayani kebijaksanaan tertinggi.",
  },
  {
    name: "Penjelajah Langit Merah (Ben)",
    keyword: "Ruang / Eksplorasi",
    gift: "Keberanian untuk menjelajahi hal baru dan melampaui batasan.",
    challenge: "Ketakutan akan hal yang tidak dikenal atau merasa terisolasi.",
    purpose: "Menghubungkan surga dan bumi dengan membawa wawasan baru.",
  },
  {
    name: "Penyihir Putih (Ix)",
    keyword: "Ketiadaan Waktu / Penerimaan",
    gift: "Kekuatan mistis, intuisi, dan kemampuan berada sepenuhnya di saat ini.",
    challenge: "Kebutuhan untuk mengontrol atau kehilangan kontak dengan realitas.",
    purpose: "Menyelaraskan niat dengan kehendak ilahi untuk menciptakan keajaiban.",
  },
  {
    name: "Elang Biru (Men)",
    keyword: "Visi / Pikiran",
    gift: "Visi yang luas, objektivitas, dan pemahaman akan gambaran besar.",
    challenge: "Pesimisme atau kehilangan harapan karena terlalu fokus pada masalah.",
    purpose: "Menginspirasi tujuan hidup dan menciptakan visi untuk masa depan.",
  },
  {
    name: "Ksatria Kuning (Cib)",
    keyword: "Kecerdasan / Keberanian",
    gift: "Keberanian menghadapi ketakutan dan mempertanyakan otoritas untuk mencari kebenaran.",
    challenge: "Sikap terlalu defensif atau meragukan intuisi sendiri.",
    purpose: "Menembus ilusi dengan pedang kebenaran dan bertindak tanpa rasa takut.",
  },
  {
    name: "Bumi Merah (Caban)",
    keyword: "Sinkronisitas / Evolusi",
    gift: "Koneksi mendalam dengan alam dan kemampuan mengikuti petunjuk sinkronisitas.",
    challenge: "Merasa tersesat atau tidak berpijak pada realitas (tidak grounding).",
    purpose: "Membantu evolusi kolektif dengan berakar kuat pada kebijaksanaan bumi.",
  },
  {
    name: "Cermin Putih (Etznab)",
    keyword: "Ketidakterbatasan / Refleksi",
    gift: "Kejernihan pikiran, memotong ilusi, dan memantulkan kebenaran apa adanya.",
    challenge: "Sikap terlalu kritis atau menghakimi pantulan diri pada orang lain.",
    purpose: "Membawa keteraturan dan kejelasan ke dalam situasi yang membingungkan.",
  },
  {
    name: "Badai Biru (Cauac)",
    keyword: "Katalis / Generasi Diri",
    gift: "Energi yang luar biasa untuk mengubah, memperbarui, dan mengakselerasi proses.",
    challenge: "Ketakutan akan kehancuran atau terjebak dalam kekacauan.",
    purpose: "Menjadi agen transformasi dan memicu kebangkitan spiritual.",
  },
  {
    name: "Matahari Kuning (Ahau)",
    keyword: "Api Semesta / Pencerahan",
    gift: "Kemampuan memancarkan cahaya, cinta, dan pemahaman tanpa syarat.",
    challenge: "Ego yang terlalu besar atau kesulitan membumikan spiritualitas.",
    purpose: "Menjadi pusat kehidupan dan kesadaran, menyinari semua tanpa membeda-bedakan.",
  }
];

export const GALACTIC_TONES: GalacticTone[] = [
  {
    name: "1 - Magnetic",
    function: "Tujuan (Purpose)",
    gift: "Kemampuan untuk menyatukan dan menarik sumber daya yang dibutuhkan.",
    shadow: "Merasa terpisah atau tidak memiliki fokus arah yang jelas.",
    lesson: "Mengenali tujuan sejati dan menjadi magnet bagi pengalaman yang selaras.",
  },
  {
    name: "2 - Lunar",
    function: "Tantangan (Challenge)",
    gift: "Mampu melihat kedua sisi (polaritas) dan menemukan stabilitas di antaranya.",
    shadow: "Terjebak dalam konflik batin, keraguan, atau perpecahan.",
    lesson: "Menghargai tantangan sebagai sarana untuk memperjelas tujuan dan mencapai keseimbangan.",
  },
  {
    name: "3 - Electric",
    function: "Pelayanan (Service)",
    gift: "Menghasilkan energi aktif untuk melayani, mengaktifkan, dan mengikat komunitas.",
    shadow: "Energi yang tersebar atau tindakan yang tidak selaras dengan tujuan.",
    lesson: "Memahami bahwa pelayanan sejati datang dari ekspresi kegembiraan alami.",
  },
  {
    name: "4 - Self-Existing",
    function: "Bentuk (Form)",
    gift: "Kemampuan merancang, mendefinisikan batas, dan membangun struktur yang stabil.",
    shadow: "Kekakuan, terlalu berpegang pada aturan, atau membatasi diri.",
    lesson: "Menciptakan bentuk dan struktur batin yang mendukung kebebasan spiritual.",
  },
  {
    name: "5 - Overtone",
    function: "Pancaran (Radiance)",
    gift: "Mengambil komando atas kehidupan sendiri dan memancarkan otoritas batin.",
    shadow: "Kebutuhan berlebihan untuk mengontrol, atau sebaliknya, tidak berdaya.",
    lesson: "Mengumpulkan sumber daya untuk memberdayakan diri sendiri dan orang lain.",
  },
  {
    name: "6 - Rhythmic",
    function: "Kesetaraan (Equality)",
    gift: "Membawa ritme, organisasi, dan keseimbangan ke dalam kehidupan.",
    shadow: "Merasa tidak seimbang, kewalahan, atau terjebak dalam rutinitas.",
    lesson: "Beradaptasi dengan aliran organik kehidupan untuk menjaga harmoni internal.",
  },
  {
    name: "7 - Resonant",
    function: "Penyelarasan (Attunement)",
    gift: "Menyalurkan inspirasi mistik dan menjadi saluran bagi energi ilahi.",
    shadow: "Kehilangan pijakan dengan realitas atau salah menafsirkan intuisi.",
    lesson: "Berada di tengah dan menyelaraskan diri untuk menjadi jembatan surga dan bumi.",
  },
  {
    name: "8 - Galactic",
    function: "Integritas (Integrity)",
    gift: "Mengharmoniskan realitas sesuai dengan model kebenaran tertinggi.",
    shadow: "Kemunafikan, kompromi pada nilai inti, atau ketidaksesuaian.",
    lesson: "Hidup berdasarkan apa yang diyakini; mempraktikkan apa yang dikhotbahkan.",
  },
  {
    name: "9 - Solar",
    function: "Niat (Intention)",
    gift: "Kemampuan memancarkan niat yang terfokus untuk mewujudkan visi.",
    shadow: "Kehilangan momentum atau niat yang terdistraksi oleh keinginan egois.",
    lesson: "Menyadari bahwa niat yang jernih adalah mesin utama penciptaan realitas.",
  },
  {
    name: "10 - Planetary",
    function: "Manifestasi (Manifestation)",
    gift: "Menyempurnakan dan memproduksi hasil nyata dari visi spiritual di dunia fisik.",
    shadow: "Perfeksionisme yang melumpuhkan atau memaksakan kehendak pada proses.",
    lesson: "Bekerja sama dengan energi semesta untuk mewujudkan sesuatu secara efisien.",
  },
  {
    name: "11 - Spectral",
    function: "Pembebasan (Liberation)",
    gift: "Melepaskan hal yang tidak lagi berguna, membubarkan struktur lama.",
    shadow: "Pemberontakan tanpa arah, kekacauan, atau ketidakmampuan melepaskan kontrol.",
    lesson: "Menemukan kebebasan sejati melalui tindakan pelepasan yang ikhlas.",
  },
  {
    name: "12 - Crystal",
    function: "Kerja Sama (Cooperation)",
    gift: "Mendedikasikan diri untuk kerja sama komunal dan menguniversalkan ide.",
    shadow: "Kehilangan identitas dalam kelompok atau isolasi dari komunitas.",
    lesson: "Membagikan pencapaian secara terbuka untuk kepentingan kolektif yang lebih besar.",
  },
  {
    name: "13 - Cosmic",
    function: "Kehadiran (Presence)",
    gift: "Kemampuan bertahan dan melampaui proses, bersiap untuk siklus berikutnya.",
    shadow: "Ketakutan akan akhir, stagnasi, atau keterikatan berlebihan pada hasil.",
    lesson: "Berada sepenuhnya di masa kini sebagai pintu gerbang menuju keabadian.",
  }
];

export const CASTLES: Castle[] = [
  {
    name: "Kastil Timur Merah",
    theme: "Berbalik (Turning)",
    meaning: "Kastil permulaan. Tempat kelahiran dan penciptaan pola baru.",
    spiritualLesson: "Mempelajari cara untuk menginisiasi dan mengarahkan energi vital untuk memulai babak kehidupan yang baru.",
  },
  {
    name: "Kastil Utara Putih",
    theme: "Melintas (Crossing)",
    meaning: "Kastil penyempurnaan dan penyeberangan. Pengujian terhadap pondasi yang telah dibangun.",
    spiritualLesson: "Mempelajari cara melepaskan hal yang tidak esensial untuk menghadapi transisi dengan kemurnian niat.",
  },
  {
    name: "Kastil Barat Biru",
    theme: "Membakar (Burning)",
    meaning: "Kastil transformasi magis dan alkimia. Pembersihan melalui intensitas pengalaman.",
    spiritualLesson: "Mempelajari kekuatan transformasi dan penerimaan atas perubahan yang memurnikan jiwa.",
  },
  {
    name: "Kastil Selatan Kuning",
    theme: "Memberi (Giving)",
    meaning: "Kastil perluasan dan pematangan. Waktu untuk berbagi hasil panen spiritual.",
    spiritualLesson: "Mempelajari hukum kelimpahan melalui tindakan berbagi dan pelayanan pada komunitas.",
  },
  {
    name: "Kastil Tengah Hijau",
    theme: "Pesona (Enchantment)",
    meaning: "Kastil pusat dan penyelarasan. Sinkronisasi dengan waktu kosmis dan pencapaian pencerahan.",
    spiritualLesson: "Mempelajari kehadiran penuh dan kesadaran bahwa hidup adalah sebuah mahakarya keajaiban yang sinkron.",
  }
];

export const GAP_KIN = new Set([
  1, 20, 22, 39, 43, 50, 51, 58, 64, 69, 72, 77, 85, 88, 93, 96, 
  106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 
  146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 
  165, 168, 173, 176, 184, 189, 192, 197, 203, 210, 211, 218, 222, 239, 241, 260
]);

// Helper for deterministic archetypes
export function generateTzolkinArchetype(seal: SolarSeal, tone: GalacticTone, color: string) {
  const strengths = [
    seal.gift,
    tone.gift,
    `Menguasai energi ekspansi ${color} dalam bertindak.`
  ];
  const challenges = [
    seal.challenge,
    tone.shadow,
    `Potensi ketidakseimbangan saat menolak ritme natural ${tone.function}.`
  ];
  
  const relationshipStyle = `Dalam menjalin hubungan, individu dengan segel ${seal.name} memiliki kecenderungan bawaan untuk fokus pada ${seal.keyword.toLowerCase()}. Dipengaruhi oleh nada ${tone.name.split(" - ")[1]}, mereka mengharapkan sebuah koneksi yang didasarkan pada ${tone.function.toLowerCase()}, sering kali membawa dinamika kebersamaan ke arah ${tone.lesson.toLowerCase()}`;
  
  const workStyle = `Di lingkungan kerja, pola dasar energi ${seal.keyword.split(" / ")[0]} membuat mereka unggul dalam peran yang membutuhkan visi terkait hal tersebut. Dengan nada ${tone.name.split(" - ")[1]}, mereka menyusun strategi melalui ${tone.function.toLowerCase()} dan mampu memberikan kontribusi bermakna melalui manifestasi nyata dari ide-ide mereka.`;
  
  const growthStyle = `Evolusi jiwa mereka didorong oleh integrasi pelajaran dari ${seal.challenge.split(" ")[0].toLowerCase()} dan pengenalan akan polaritas. Pertumbuhan terjadi secara signifikan ketika mereka berhasil menguasai prinsip ${tone.function.toLowerCase()} dan melepaskan tendensi bayangan dari ${tone.shadow.split(" ")[0].toLowerCase()}.`;
  
  const lifePurpose = `Tujuan utama inkarnasi ini adalah: ${seal.purpose} Mereka dipanggil untuk mewujudkan hal ini secara konsisten dengan mengaplikasikan frekuensi ${tone.name.split(" - ")[1]}, yang pada akhirnya memenuhi tugas spiritual: ${tone.lesson.toLowerCase()}`;
  
  return { strengths, challenges, relationshipStyle, workStyle, growthStyle, lifePurpose };
}

export function generateTzolkinSummary(kin: number, kinName: string, seal: SolarSeal, tone: GalacticTone, wavespell: Wavespell, castle: Castle, gap: boolean) {
  const paragraphs = [];
  
  paragraphs.push(`Sebagai Kin ${kin} (${kinName}), identitas kosmis Anda berakar dalam harmoni kalender Tzolkin. Anda membawa frekuensi unik yang menggabungkan energi arketipal ${seal.name} dengan irama universal nada ${tone.name.split(" - ")[1]}. Perpaduan ini menjadikan ${seal.keyword.toLowerCase()} sebagai fondasi dari esensi kehidupan Anda, yang Anda proyeksikan ke dunia melalui kekuatan ${tone.function.toLowerCase()}.`);
  
  paragraphs.push(`Dalam siklus evolusi jiwa, Anda lahir dalam ${castle.name}, sebuah siklus besar yang ditandai dengan tema ${castle.theme.toLowerCase()}. Di dalam istana ini, Anda berjalan di atas gelombang ${wavespell.name}, di mana periode tiga belas hari penempatan Anda memandu arah pertumbuhan batin menuju ${wavespell.growthDirection.toLowerCase()}. Misi utama Anda dalam gelombang ini adalah menginternalisasi makna: ${wavespell.meaning}`);
  
  paragraphs.push(`Untuk mencapai realisasi diri tertinggi, Anda ditantang untuk mengatasi bayangan dari ${seal.challenge.split(" ")[0].toLowerCase()} serta melepaskan jebakan ${tone.shadow.toLowerCase()}. Keberhasilan dalam memfasilitasi transformasi ini akan membangkitkan karunia bawaan Anda: ${seal.gift.toLowerCase()} Seiring dengan kedewasaan spiritual, Anda akan mewujudkan tujuan jiwa Anda, yakni ${seal.purpose.toLowerCase()}`);
  
  if (gap) {
    paragraphs.push(`Anda lahir pada hari Portal Aktivasi Galaktik (GAP). Ini menandakan bahwa jalur hidup Anda diwarnai oleh transformasi yang intens, peningkatan kepekaan spiritual, dan serangkaian sinkronisitas yang luar biasa. Jiwa Anda bertindak sebagai saluran terbuka antara dimensi, menuntut kesadaran yang tinggi namun menjanjikan percepatan evolusi yang melampaui batas normal.`);
  } else {
    paragraphs.push(`Jalur pertumbuhan Anda ditandai dengan evolusi yang bertahap namun stabil. Sebagai bagian dari siklus reguler Harmonic Module, Anda diundang untuk mematangkan pondasi batin tanpa harus tergesa-gesa. Ini adalah perjalanan konsistensi, di mana setiap langkah kecil yang diambil dalam kesadaran akan menuntun pada perubahan yang kokoh dan tahan lama.`);
  }
  
  return paragraphs;
}
