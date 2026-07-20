import type { JavaneseDay, Pasaran } from "./types";

export const DAY_NEPTU: Record<JavaneseDay, number> = {
  Minggu: 5,
  Senin: 4,
  Selasa: 3,
  Rabu: 7,
  Kamis: 8,
  Jumat: 6,
  Sabtu: 9,
};

export const PASARAN_NEPTU: Record<Pasaran, number> = {
  Legi: 5,
  Pahing: 9,
  Pon: 7,
  Wage: 4,
  Kliwon: 8,
};

export const DAY_INTERPRETATIONS: Record<JavaneseDay, {
  watak: string;
  strength: string;
  challenge: string;
  work: string;
}> = {
  Minggu: {
    watak: "hangat, terbuka, dan terdorong untuk memberi arah",
    strength: "membangkitkan semangat dan melihat gambaran besar",
    challenge: "menjaga kerendahan hati ketika ingin memimpin",
    work: "berkembang saat dipercaya mengambil inisiatif dan memberi visi",
  },
  Senin: {
    watak: "peka, tenang, dan kuat membaca suasana",
    strength: "merawat hubungan dan memahami kebutuhan yang tidak terucap",
    challenge: "tidak memendam beban emosional terlalu lama",
    work: "unggul dalam peran yang membutuhkan ketelitian, empati, dan kesinambungan",
  },
  Selasa: {
    watak: "tegas, aktif, dan berani menghadapi hambatan",
    strength: "bergerak cepat dan mempertahankan hal yang dianggap penting",
    challenge: "mengelola reaksi agar keberanian tidak berubah menjadi ketergesaan",
    work: "cocok pada lingkungan dinamis yang memberi ruang untuk tindakan nyata",
  },
  Rabu: {
    watak: "cerdas, lentur, dan mudah menghubungkan banyak sudut pandang",
    strength: "berkomunikasi, belajar, dan menemukan jalan tengah",
    challenge: "menuntaskan pilihan tanpa terlalu lama menimbang kemungkinan",
    work: "bersinar dalam komunikasi, analisis, pendidikan, atau koordinasi",
  },
  Kamis: {
    watak: "berwibawa, luas hati, dan berorientasi pada pertumbuhan",
    strength: "membangun kepercayaan dan menata tujuan jangka panjang",
    challenge: "menyeimbangkan keyakinan besar dengan detail pelaksanaan",
    work: "kuat dalam kepemimpinan, pengembangan, dan peran yang membawa manfaat luas",
  },
  Jumat: {
    watak: "halus, reflektif, dan menjunjung harmoni",
    strength: "mendamaikan, memperindah, dan menyatukan nilai dengan tindakan",
    challenge: "menyatakan batas dengan jelas saat ingin menjaga kedamaian",
    work: "bertumbuh dalam karya pelayanan, kreativitas, atau hubungan antarmanusia",
  },
  Sabtu: {
    watak: "kukuh, mandiri, dan tahan menghadapi proses panjang",
    strength: "disiplin, bertanggung jawab, dan setia pada komitmen",
    challenge: "melunakkan sikap ketika standar diri menjadi terlalu berat",
    work: "unggul dalam pekerjaan yang menuntut struktur, daya tahan, dan tanggung jawab",
  },
};

export const PASARAN_INTERPRETATIONS: Record<Pasaran, {
  watak: string;
  strength: string;
  challenge: string;
  relationship: string;
  money: string;
}> = {
  Legi: {
    watak: "membawa kelembutan, keramahan, dan daya tarik yang menenangkan",
    strength: "menciptakan rasa nyaman dan menjembatani perbedaan",
    challenge: "tidak mengorbankan kebutuhan diri demi diterima",
    relationship: "menunjukkan kasih melalui perhatian kecil, kesetiaan, dan suasana yang damai",
    money: "rezeki cenderung tumbuh melalui kepercayaan, relasi baik, dan konsistensi",
  },
  Pahing: {
    watak: "membawa tenaga besar, kemandirian, dan kemauan yang kuat",
    strength: "mendorong perubahan dan bertahan saat keadaan menuntut keberanian",
    challenge: "memberi ruang bagi ritme dan pendapat orang lain",
    relationship: "mencintai dengan intens dan membutuhkan kejujuran yang langsung",
    money: "peluang terbuka ketika keberanian disertai perhitungan dan pengendalian risiko",
  },
  Pon: {
    watak: "membawa ketenangan, pertimbangan matang, dan orientasi pada kestabilan",
    strength: "menata sumber daya dan menjaga keputusan tetap membumi",
    challenge: "tidak bertahan pada pola lama hanya karena terasa aman",
    relationship: "membangun kedekatan lewat keandalan, rasa aman, dan tindakan nyata",
    money: "rezeki menguat melalui perencanaan, pengelolaan, dan kesabaran",
  },
  Wage: {
    watak: "membawa kesederhanaan, ketelitian, dan kepekaan terhadap batas",
    strength: "bekerja cermat dan mengenali hal yang perlu dirapikan",
    challenge: "tidak meremehkan kemampuan sendiri atau terlalu khawatir",
    relationship: "membutuhkan kejelasan, ruang pribadi, dan pasangan yang menghargai ketulusan",
    money: "stabilitas dibangun melalui disiplin, efisiensi, dan keputusan yang tidak berlebihan",
  },
  Kliwon: {
    watak: "membawa kedalaman batin, intuisi, dan daya pengaruh yang kuat",
    strength: "membaca lapisan tersembunyi dan memberi makna pada pengalaman",
    challenge: "membumikan intuisi agar tidak larut dalam prasangka atau keraguan",
    relationship: "mencari ikatan mendalam, jujur, dan memiliki makna batin",
    money: "peluang muncul dari keahlian khusus, intuisi tajam, dan reputasi yang dijaga",
  },
};

export const NEPTU_INTERPRETATIONS: Record<number, {
  watak: string;
  strength: string;
  challenge: string;
  mission: string;
}> = {
  7: { watak: "ringkas dan cepat menangkap inti", strength: "fokus pada prioritas dengan cara yang mengarahkan energi pada satu titik pencapaian", challenge: "melatih kesabaran menunggu hasil tumbuh secara alami sebelum mengambil langkah lanjutan", mission: "mengubah ketajaman menjadi keputusan yang bermanfaat" },
  8: { watak: "tenang namun teguh", strength: "ketahanan yang mantap dalam menghadapi tekanan dan hambatan hidup sehari-hari", challenge: "melatih keluwesan sikap agar tidak kaku saat perubahan terjadi secara mendadak", mission: "membangun dasar yang dapat diandalkan" },
  9: { watak: "peka dan idealis", strength: "kepedulian yang tulus terhadap kebutuhan orang lain dan lingkungan sekitar", challenge: "menjaga batas diri agar kepedulian tidak menguras energi pribadi secara berlebihan", mission: "menghadirkan kepedulian tanpa kehilangan pusat diri" },
  10: { watak: "mandiri dan praktis", strength: "inisiatif yang berani untuk memulai langkah pertama menuju perubahan nyata", challenge: "menerima bantuan dari orang lain tanpa merasa kehilangan kendali atas diri sendiri", mission: "membuka jalan melalui tindakan yang terukur" },
  11: { watak: "dinamis dan komunikatif", strength: "adaptasi yang cepat terhadap situasi baru dengan tetap menjaga keseimbangan diri", challenge: "menjaga konsistensi ketika menghadapi banyak pilihan dan perubahan arah yang cepat", mission: "menyatukan ide dengan penyelesaian nyata" },
  12: { watak: "berimbang dan sosial", strength: "kerja sama yang erat dengan orang lain untuk menciptakan hasil yang lebih baik bersama", challenge: "ketegasan dalam mengambil keputusan saat situasi membutuhkan batas dan arah yang jelas", mission: "menciptakan harmoni yang tetap memiliki arah" },
  13: { watak: "kuat dan penuh daya juang", strength: "keberanian yang kokoh untuk melindungi nilai-nilai dan menghadapi tantangan berat", challenge: "pengendalian diri agar ketegasan tidak berubah menjadi dorongan yang melampaui batas", mission: "menggunakan kekuatan untuk melindungi dan membangun" },
  14: { watak: "luas pandangan dan bertanggung jawab", strength: "kepemimpinan yang bijaksana dalam membimbing orang lain menuju tujuan bersama", challenge: "beban berlebih akibat terlalu banyak memikul tanggung jawab yang seharusnya bisa dibagi", mission: "memimpin dengan kebijaksanaan dan pembagian tanggung jawab" },
  15: { watak: "magnetis dan berorientasi hasil", strength: "pengaruh positif yang mampu menggerakkan orang lain untuk bertindak dan berkembang", challenge: "keseimbangan ambisi agar dorongan mencapai hasil tidak mengabaikan proses dan relasi", mission: "mengubah pengaruh menjadi manfaat bersama" },
  16: { watak: "mendalam dan berprinsip", strength: "integritas yang teguh dalam memegang nilai-nilai dan bertindak sesuai keyakinan diri", challenge: "kekakuan dalam mempertahankan prinsip saat keadaan menuntut kelenturan dan penyesuaian", mission: "menjaga nilai sambil tetap terbuka pada pembaruan" },
  17: { watak: "visioner dan tahan uji", strength: "ketekunan yang tak kenal lelah dalam mewujudkan visi besar meskipun menghadapi rintangan", challenge: "melepas kendali atas hasil dan mempercayakan proses kepada waktu dan keadaan sekitar", mission: "mewujudkan visi besar melalui langkah yang sabar" },
  18: { watak: "intens dan berdaya besar", strength: "transformasi diri yang mendalam melalui pengalaman dan keberanian menghadapi perubahan", challenge: "mengelola tekanan agar energi besar tidak berubah menjadi kelelahan atau kekacauan batin", mission: "menyalurkan daya besar menjadi perubahan yang matang" },
};

export const WUKU_DATA = [
  ["Sinta", "Membawa tema awal, keberanian membuka siklus, dan pembentukan arah."],
  ["Landep", "Menajamkan pikiran, ketegasan, dan kemampuan memilah yang penting."],
  ["Wukir", "Menguatkan ketekunan, pertumbuhan bertahap, dan fondasi yang kokoh."],
  ["Kurantil", "Mengajarkan keluwesan, penyesuaian, dan kecermatan membaca perubahan."],
  ["Tolu", "Mendorong ekspresi, hubungan sosial, dan keberanian menyampaikan isi hati."],
  ["Gumbreg", "Menguatkan daya rawat, kelimpahan, dan tanggung jawab pada lingkungan."],
  ["Warigalit", "Membawa kecermatan pada detail, tata hidup, dan keseimbangan kebiasaan."],
  ["Warigagung", "Memperluas pandangan, kebijaksanaan, dan kesadaran akan dampak tindakan."],
  ["Julungwangi", "Menekankan martabat, daya tarik, dan penggunaan pengaruh secara baik."],
  ["Sungsang", "Mengajak membalik sudut pandang dan belajar dari keadaan yang tidak biasa."],
  ["Galungan", "Membawa tema kemenangan batin, keberanian, dan peneguhan nilai."],
  ["Kuningan", "Menguatkan rasa syukur, penghormatan, dan penyelesaian dengan bermartabat."],
  ["Langkir", "Menekankan kewaspadaan, strategi, dan kemampuan menjaga batas."],
  ["Mandasiya", "Membawa keteguhan, daya kerja, dan pelajaran mengelola tenaga besar."],
  ["Julungpujut", "Menguatkan refleksi, kesetiaan pada nilai, dan ketulusan niat."],
  ["Pahang", "Mengajarkan keberanian menghadapi gesekan dan mengubahnya menjadi kemajuan."],
  ["Kuruwelut", "Membawa tema keterhubungan, jejaring, dan kemampuan merawat kesinambungan."],
  ["Marakeh", "Menekankan kemandirian, ketelitian, dan keberanian memperbaiki arah."],
  ["Tambir", "Menguatkan komunikasi, pertukaran, dan kecakapan menjembatani kepentingan."],
  ["Medangkungan", "Membawa pandangan luas, pengelolaan sumber daya, dan tanggung jawab sosial."],
  ["Maktal", "Menekankan keteguhan prinsip, kerja mendalam, dan transformasi karakter."],
  ["Wuye", "Menguatkan kepekaan, intuisi, dan kemampuan menangkap waktu yang tepat."],
  ["Manahil", "Membawa ketekunan menyelesaikan, merapikan, dan memanen hasil usaha."],
  ["Prangbakat", "Menekankan keberanian strategis dan kemampuan menghadapi persaingan."],
  ["Bala", "Membawa kekuatan kolektif, daya tahan, dan tanggung jawab menggunakan kuasa."],
  ["Wugu", "Menguatkan disiplin, kesunyian produktif, dan kematangan dalam bertindak."],
  ["Wayang", "Membawa imajinasi, simbol, dan kemampuan melihat peran di balik peristiwa."],
  ["Kulawu", "Menekankan pemulihan, penerimaan, dan kebijaksanaan setelah perubahan."],
  ["Dukut", "Menguatkan kesederhanaan, pembersihan, dan perhatian pada hal mendasar."],
  ["Watugunung", "Menutup siklus dengan integrasi, pembelajaran, dan kesiapan memulai kembali."],
] as const;

export const PRANATA_MANGSA_DATA = [
  { name: "Kasa", start: [6, 22], description: "Awal kemarau; masa menata tenaga, menghemat sumber daya, dan membangun ketahanan." },
  { name: "Karo", start: [8, 3], description: "Kemarau menguat; masa ketekunan, disiplin, dan kesiapan menghadapi keterbatasan." },
  { name: "Katelu", start: [8, 26], description: "Peralihan kering; masa membaca tanda perubahan dan menyiapkan langkah berikutnya." },
  { name: "Kapat", start: [9, 19], description: "Masa harapan hujan; energi diarahkan pada pembaruan dan penanaman niat." },
  { name: "Kalima", start: [10, 14], description: "Hujan mulai hadir; masa menyuburkan gagasan dan merawat pertumbuhan." },
  { name: "Kanem", start: [11, 10], description: "Masa hujan dan kelimpahan; mengajarkan penerimaan sekaligus pengelolaan." },
  { name: "Kapitu", start: [12, 23], description: "Puncak hujan; masa menjaga keseimbangan ketika arus kehidupan menguat." },
  { name: "Kawolu", start: [2, 4], description: "Masa pembentukan hasil; ketekunan mulai memperlihatkan wujudnya." },
  { name: "Kasanga", start: [3, 2], description: "Masa menjelang peralihan; mengajak memilah, membersihkan, dan menyelesaikan." },
  { name: "Kasadasa", start: [3, 27], description: "Hujan berkurang dan angin menguat; masa menegaskan arah setelah evaluasi." },
  { name: "Desta", start: [4, 20], description: "Awal kemarau dan masa panen; menekankan kematangan, hasil, dan tanggung jawab." },
  { name: "Saddha", start: [5, 13], description: "Air mulai surut; masa melepaskan, menyimpan pelajaran, dan menyiapkan siklus baru." },
] as const;
