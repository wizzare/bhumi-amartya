// Self-contained Weton Sprint 1 Validation
// Mirrors exact logic from calculateWeton.ts + dictionaries.ts
// Run: node scripts/wetonSprint1Verify.js

"use strict";

// ─── DICTIONARY DATA (mirrored from dictionaries.ts) ───────────────────────

const DAY_NEPTU = { Minggu: 5, Senin: 4, Selasa: 3, Rabu: 7, Kamis: 8, Jumat: 6, Sabtu: 9 };
const PASARAN_NEPTU = { Legi: 5, Pahing: 9, Pon: 7, Wage: 4, Kliwon: 8 };

const DAY_INTERPRETATIONS = {
  Minggu: { watak: "hangat, terbuka, dan terdorong untuk memberi arah", strength: "membangkitkan semangat dan melihat gambaran besar", challenge: "menjaga kerendahan hati ketika ingin memimpin", work: "berkembang saat dipercaya mengambil inisiatif dan memberi visi" },
  Senin:  { watak: "peka, tenang, dan kuat membaca suasana", strength: "merawat hubungan dan memahami kebutuhan yang tidak terucap", challenge: "tidak memendam beban emosional terlalu lama", work: "unggul dalam peran yang membutuhkan ketelitian, empati, dan kesinambungan" },
  Selasa: { watak: "tegas, aktif, dan berani menghadapi hambatan", strength: "bergerak cepat dan mempertahankan hal yang dianggap penting", challenge: "mengelola reaksi agar keberanian tidak berubah menjadi ketergesaan", work: "cocok pada lingkungan dinamis yang memberi ruang untuk tindakan nyata" },
  Rabu:   { watak: "cerdas, lentur, dan mudah menghubungkan banyak sudut pandang", strength: "berkomunikasi, belajar, dan menemukan jalan tengah", challenge: "menuntaskan pilihan tanpa terlalu lama menimbang kemungkinan", work: "bersinar dalam komunikasi, analisis, pendidikan, atau koordinasi" },
  Kamis:  { watak: "berwibawa, luas hati, dan berorientasi pada pertumbuhan", strength: "membangun kepercayaan dan menata tujuan jangka panjang", challenge: "menyeimbangkan keyakinan besar dengan detail pelaksanaan", work: "kuat dalam kepemimpinan, pengembangan, dan peran yang membawa manfaat luas" },
  Jumat:  { watak: "halus, reflektif, dan menjunjung harmoni", strength: "mendamaikan, memperindah, dan menyatukan nilai dengan tindakan", challenge: "menyatakan batas dengan jelas saat ingin menjaga kedamaian", work: "bertumbuh dalam karya pelayanan, kreativitas, atau hubungan antarmanusia" },
  Sabtu:  { watak: "kukuh, mandiri, dan tahan menghadapi proses panjang", strength: "disiplin, bertanggung jawab, dan setia pada komitmen", challenge: "melunakkan sikap ketika standar diri menjadi terlalu berat", work: "unggul dalam pekerjaan yang menuntut struktur, daya tahan, dan tanggung jawab" },
};

const PASARAN_INTERPRETATIONS = {
  Legi:   { watak: "membawa kelembutan, keramahan, dan daya tarik yang menenangkan", strength: "menciptakan rasa nyaman dan menjembatani perbedaan", challenge: "tidak mengorbankan kebutuhan diri demi diterima", relationship: "menunjukkan kasih melalui perhatian kecil, kesetiaan, dan suasana yang damai", money: "rezeki cenderung tumbuh melalui kepercayaan, relasi baik, dan konsistensi" },
  Pahing: { watak: "membawa tenaga besar, kemandirian, dan kemauan yang kuat", strength: "mendorong perubahan dan bertahan saat keadaan menuntut keberanian", challenge: "memberi ruang bagi ritme dan pendapat orang lain", relationship: "mencintai dengan intens dan membutuhkan kejujuran yang langsung", money: "peluang terbuka ketika keberanian disertai perhitungan dan pengendalian risiko" },
  Pon:    { watak: "membawa ketenangan, pertimbangan matang, dan orientasi pada kestabilan", strength: "menata sumber daya dan menjaga keputusan tetap membumi", challenge: "tidak bertahan pada pola lama hanya karena terasa aman", relationship: "membangun kedekatan lewat keandalan, rasa aman, dan tindakan nyata", money: "rezeki menguat melalui perencanaan, pengelolaan, dan kesabaran" },
  Wage:   { watak: "membawa kesederhanaan, ketelitian, dan kepekaan terhadap batas", strength: "bekerja cermat dan mengenali hal yang perlu dirapikan", challenge: "tidak meremehkan kemampuan sendiri atau terlalu khawatir", relationship: "membutuhkan kejelasan, ruang pribadi, dan pasangan yang menghargai ketulusan", money: "stabilitas dibangun melalui disiplin, efisiensi, dan keputusan yang tidak berlebihan" },
  Kliwon: { watak: "membawa kedalaman batin, intuisi, dan daya pengaruh yang kuat", strength: "membaca lapisan tersembunyi dan memberi makna pada pengalaman", challenge: "membumikan intuisi agar tidak larut dalam prasangka atau keraguan", relationship: "mencari ikatan mendalam, jujur, dan memiliki makna batin", money: "peluang muncul dari keahlian khusus, intuisi tajam, dan reputasi yang dijaga" },
};

const NEPTU_INTERPRETATIONS = {
  7:  { watak: "ringkas dan cepat menangkap inti", strength: "mampu langsung menangkap inti persoalan tanpa terjebak pada kerumitan yang tidak perlu", challenge: "mengembangkan kesabaran agar setiap keputusan punya waktu yang cukup untuk matang", mission: "mengubah ketajaman menjadi keputusan yang bermanfaat" },
  8:  { watak: "tenang namun teguh", strength: "memiliki ketahanan batin yang membuat kamu tetap stabil ketika situasi menuntut daya tahan ekstra", challenge: "memberi ruang bagi keluwesan, karena tidak semua hal perlu didekati dengan cara yang sama", mission: "membangun dasar yang dapat diandalkan" },
  9:  { watak: "peka dan idealis", strength: "merasakan apa yang tidak terucap dan menunjukkan kepedulian tulus yang sering menjadi kekuatan nyata dalam hubungan", challenge: "mengenali batas diri dan memberi ruang bagi kebutuhan sendiri tanpa rasa bersalah", mission: "menghadirkan kepedulian tanpa kehilangan pusat diri" },
  10: { watak: "mandiri dan praktis", strength: "memiliki inisiatif kuat untuk memulai langkah nyata tanpa perlu menunggu dorongan dari luar", challenge: "membuka diri untuk menerima bantuan, karena perjalanan terbaik sering ditempuh bersama orang lain", mission: "membuka jalan melalui tindakan yang terukur" },
  11: { watak: "dinamis dan komunikatif", strength: "beradaptasi dengan cepat dan menghubungkan berbagai sudut pandang yang berbeda menjadi satu arah yang jelas", challenge: "merawat konsistensi agar energi besar yang kamu miliki tidak habis di awal sebelum ada penyelesaian", mission: "menyatukan ide dengan penyelesaian nyata" },
  12: { watak: "berimbang dan sosial", strength: "membangun kerja sama dan menciptakan suasana di mana semua pihak merasa dihargai dan didengar", challenge: "melatih ketegasan agar keselarasan yang kamu jaga tidak mengorbankan kebutuhan diri sendiri", mission: "menciptakan harmoni yang tetap memiliki arah" },
  13: { watak: "kuat dan penuh daya juang", strength: "memiliki keberanian menghadapi tantangan dan semangat yang tidak mudah padam ketika situasi menekan", challenge: "mengelola daya besar itu dengan penuh kesadaran agar tidak merugikan diri sendiri maupun orang lain", mission: "menggunakan kekuatan untuk melindungi dan membangun" },
  14: { watak: "luas pandangan dan bertanggung jawab", strength: "melihat gambaran besar yang orang lain mungkin belum sempat melihatnya dan memimpin dengan penuh tanggung jawab", challenge: "membagi beban kepemimpinan secara bijak agar tidak semua hal harus dipikul sendiri", mission: "memimpin dengan kebijaksanaan dan pembagian tanggung jawab" },
  15: { watak: "magnetis dan berorientasi hasil", strength: "memiliki pengaruh alami yang menarik perhatian dan kemampuan menggerakkan orang menuju tujuan bersama", challenge: "menyeimbangkan ambisi yang besar dengan kebutuhan untuk hadir sepenuhnya dan menikmati prosesnya", mission: "mengubah pengaruh menjadi manfaat bersama" },
  16: { watak: "mendalam dan berprinsip", strength: "memegang integritas yang kuat dan tetap setia pada nilai-nilai yang diyakini meski menghadapi tekanan sekalipun", challenge: "memberi ruang bagi sudut pandang lain dan tidak membiarkan prinsip yang kokoh berubah menjadi kekakuan", mission: "menjaga nilai sambil tetap terbuka pada pembaruan" },
  17: { watak: "visioner dan tahan uji", strength: "memiliki ketekunan luar biasa dalam mengejar visi jangka panjang dan bertahan meski hasil belum kunjung terlihat", challenge: "belajar melepas kendali pada hal-hal yang tidak bisa dikendalikan dan mempercayai prosesnya", mission: "mewujudkan visi besar melalui langkah yang sabar" },
  18: { watak: "intens dan berdaya besar", strength: "memiliki daya transformasi yang besar — kemampuan mengubah situasi sulit menjadi batu loncatan yang bermakna", challenge: "mengelola tekanan batin dengan bijak agar energi yang besar mengalir ke arah yang menyehatkan", mission: "menyalurkan daya besar menjadi perubahan yang matang" },
};

const WUKU_DATA = [
  ["Sinta","Membawa tema awal, keberanian membuka siklus, dan pembentukan arah."],
  ["Landep","Menajamkan pikiran, ketegasan, dan kemampuan memilah yang penting."],
  ["Wukir","Menguatkan ketekunan, pertumbuhan bertahap, dan fondasi yang kokoh."],
  ["Kurantil","Mengajarkan keluwesan, penyesuaian, dan kecermatan membaca perubahan."],
  ["Tolu","Mendorong ekspresi, hubungan sosial, dan keberanian menyampaikan isi hati."],
  ["Gumbreg","Menguatkan daya rawat, kelimpahan, dan tanggung jawab pada lingkungan."],
  ["Warigalit","Membawa kecermatan pada detail, tata hidup, dan keseimbangan kebiasaan."],
  ["Warigagung","Memperluas pandangan, kebijaksanaan, dan kesadaran akan dampak tindakan."],
  ["Julungwangi","Menekankan martabat, daya tarik, dan penggunaan pengaruh secara baik."],
  ["Sungsang","Mengajak membalik sudut pandang dan belajar dari keadaan yang tidak biasa."],
  ["Galungan","Membawa tema kemenangan batin, keberanian, dan peneguhan nilai."],
  ["Kuningan","Menguatkan rasa syukur, penghormatan, dan penyelesaian dengan bermartabat."],
  ["Langkir","Menekankan kewaspadaan, strategi, dan kemampuan menjaga batas."],
  ["Mandasiya","Membawa keteguhan, daya kerja, dan pelajaran mengelola tenaga besar."],
  ["Julungpujut","Menguatkan refleksi, kesetiaan pada nilai, dan ketulusan niat."],
  ["Pahang","Mengajarkan keberanian menghadapi gesekan dan mengubahnya menjadi kemajuan."],
  ["Kuruwelut","Membawa tema keterhubungan, jejaring, dan kemampuan merawat kesinambungan."],
  ["Marakeh","Menekankan kemandirian, ketelitian, dan keberanian memperbaiki arah."],
  ["Tambir","Menguatkan komunikasi, pertukaran, dan kecakapan menjembatani kepentingan."],
  ["Medangkungan","Membawa pandangan luas, pengelolaan sumber daya, dan tanggung jawab sosial."],
  ["Maktal","Menekankan keteguhan prinsip, kerja mendalam, dan transformasi karakter."],
  ["Wuye","Menguatkan kepekaan, intuisi, dan kemampuan menangkap waktu yang tepat."],
  ["Manahil","Membawa ketekunan menyelesaikan, merapikan, dan memanen hasil usaha."],
  ["Prangbakat","Menekankan keberanian strategis dan kemampuan menghadapi persaingan."],
  ["Bala","Membawa kekuatan kolektif, daya tahan, dan tanggung jawab menggunakan kuasa."],
  ["Wugu","Menguatkan disiplin, kesunyian produktif, dan kematangan dalam bertindak."],
  ["Wayang","Membawa imajinasi, simbol, dan kemampuan melihat peran di balik peristiwa."],
  ["Kulawu","Menekankan pemulihan, penerimaan, dan kebijaksanaan setelah perubahan."],
  ["Dukut","Menguatkan kesederhanaan, pembersihan, dan perhatian pada hal mendasar."],
  ["Watugunung","Menutup siklus dengan integrasi, pembelajaran, dan kesiapan memulai kembali."],
];

const PRANATA_MANGSA_DATA = [
  { name: "Kasa",     start: [6, 22],  description: "Awal kemarau; masa menata tenaga, menghemat sumber daya, dan membangun ketahanan." },
  { name: "Karo",     start: [8, 3],   description: "Kemarau menguat; masa ketekunan, disiplin, dan kesiapan menghadapi keterbatasan." },
  { name: "Katelu",   start: [8, 26],  description: "Peralihan kering; masa membaca tanda perubahan dan menyiapkan langkah berikutnya." },
  { name: "Kapat",    start: [9, 19],  description: "Masa harapan hujan; energi diarahkan pada pembaruan dan penanaman niat." },
  { name: "Kalima",   start: [10, 14], description: "Hujan mulai hadir; masa menyuburkan gagasan dan merawat pertumbuhan." },
  { name: "Kanem",    start: [11, 10], description: "Masa hujan dan kelimpahan; mengajarkan penerimaan sekaligus pengelolaan." },
  { name: "Kapitu",   start: [12, 23], description: "Puncak hujan; masa menjaga keseimbangan ketika arus kehidupan menguat." },
  { name: "Kawolu",   start: [2, 4],   description: "Masa pembentukan hasil; ketekunan mulai memperlihatkan wujudnya." },
  { name: "Kasanga",  start: [3, 2],   description: "Masa menjelang peralihan; mengajak memilah, membersihkan, dan menyelesaikan." },
  { name: "Kasadasa", start: [3, 27],  description: "Hujan berkurang dan angin menguat; masa menegaskan arah setelah evaluasi." },
  { name: "Desta",    start: [4, 20],  description: "Awal kemarau dan masa panen; menekankan kematangan, hasil, dan tanggung jawab." },
  { name: "Saddha",   start: [5, 13],  description: "Air mulai surut; masa melepaskan, menyimpan pelajaran, dan menyiapkan siklus baru." },
];

// ─── ENGINE (mirrored from calculateWeton.ts) ──────────────────────────────

const DAY_MS = 86_400_000;
const JAVANESE_DAY_BOUNDARY_HOUR = 18;
const PAWUKON_EPOCH_UTC = Date.UTC(2020, 6, 5);
const DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const PASARAN_FROM_EPOCH = ["Pahing","Pon","Wage","Kliwon","Legi"];

function positiveModulo(v, d) { return ((v % d) + d) % d; }

function parseBirthDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return { year: +m[1], month: +m[2], day: +m[3] };
}

function parseHour(value) {
  if (!value) return 12;
  const m = /^(\d{1,2})\s*[:.]\s*(\d{2})(?:\s*(AM|PM|am|pm))?/.exec(value.trim());
  if (!m) return 12;
  let hour = +m[1]; const min = +m[2]; const ap = (m[3]||"").toUpperCase();
  if (ap === "PM" && hour < 12) hour += 12;
  else if (ap === "AM" && hour === 12) hour = 0;
  return hour + min / 60;
}

function getEffectiveDate(birthDate, birthTime) {
  const { year, month, day } = parseBirthDate(birthDate);
  const civil = Date.UTC(year, month - 1, day);
  const after = parseHour(birthTime) >= JAVANESE_DAY_BOUNDARY_HOUR;
  return new Date(civil + (after ? DAY_MS : 0));
}

function calculateWuku(eff) {
  const off = Math.floor((eff.getTime() - PAWUKON_EPOCH_UTC) / DAY_MS);
  const idx = Math.floor(positiveModulo(off, 210) / 7);
  const [name, description] = WUKU_DATA[idx];
  return { name, index: idx + 1, description };
}

function calculatePranataMangsa(eff) {
  const month = eff.getUTCMonth() + 1;
  const day   = eff.getUTCDate();
  const key   = month * 100 + day;
  let sel = PRANATA_MANGSA_DATA[6];
  for (const m of PRANATA_MANGSA_DATA) {
    if (key >= m.start[0] * 100 + m.start[1]) sel = m;
  }
  if (key < 204) sel = PRANATA_MANGSA_DATA[6];
  return { name: sel.name, description: sel.description };
}

function calculateWeton(birthDate, birthTime) {
  const eff = getEffectiveDate(birthDate, birthTime);
  const day = DAYS[eff.getUTCDay()];
  const off = Math.floor((eff.getTime() - PAWUKON_EPOCH_UTC) / DAY_MS);
  const pasaran = PASARAN_FROM_EPOCH[positiveModulo(off, 5)];
  const neptuDay = DAY_NEPTU[day];
  const neptuPasaran = PASARAN_NEPTU[pasaran];
  const totalNeptu = neptuDay + neptuPasaran;
  const wuku = calculateWuku(eff);
  const pm = calculatePranataMangsa(eff);
  const dm = DAY_INTERPRETATIONS[day];
  const pm2 = PASARAN_INTERPRETATIONS[pasaran];
  const nm = NEPTU_INTERPRETATIONS[totalNeptu];

  const wukuDesc = wuku.description.replace(/\.$/u, "").toLowerCase();

  return {
    day, pasaran,
    weton: `${day} ${pasaran}`,
    neptuDay, neptuPasaran, totalNeptu,
    wuku, pranataMangsa: pm,
    watak: `Kamu adalah seseorang yang ${dm.watak} sekaligus ${pm2.watak}. Keduanya berpadu membentuk pribadi yang ${nm.watak}.`,
    strengths: [
      `Kamu memiliki kemampuan alami untuk ${dm.strength} — fondasi nyata dalam cara kamu menjalani hari-hari.`,
      `${pm2.strength.charAt(0).toUpperCase()}${pm2.strength.slice(1)} menjadi cara kamu hadir secara alami dalam hubungan dengan orang-orang di sekitarmu.`,
      `Lahir dalam Wuku ${wuku.name}, kamu cenderung ${wukuDesc}.`,
      `Kamu ${nm.strength}.`,
    ],
    challenges: [
      `Satu hal yang terus mengundangmu bertumbuh adalah kemampuan ${dm.challenge}, terutama saat energimu sedang mengalir paling kuat.`,
      `Dalam berinteraksi dengan orang-orang sekitar, kamu sering diajak untuk ${pm2.challenge}.`,
      `${nm.challenge.charAt(0).toUpperCase()}${nm.challenge.slice(1)}.`,
    ],
    lifeMission: `Arah pertumbuhanmu adalah ${nm.mission}, dan perjalanan dalam Wuku ${wuku.name} ${wukuDesc}.`,
    relationshipStyle: `Kamu ${pm2.relationship}.`,
    workStyle: `Kamu ${dm.work}. Dalam perjalananmu, Wuku ${wuku.name} ${wukuDesc}.`,
    moneyStyle: `${pm2.money.charAt(0).toUpperCase()}${pm2.money.slice(1)}.`,
  };
}

function generateWetonSummary(w) {
  const pm = w.pranataMangsa;
  const wukuDesc = w.wuku.description.replace(/\.$/u, "").toLowerCase();
  const mangsaDesc = pm.description.replace(/\.$/u, "").toLowerCase();
  return [
    `Kamu lahir dengan Weton ${w.weton}. ${w.watak} Perpaduan ini bukan soal label atau kategori, melainkan cara kamu secara alami hadir dan bergerak di dunia — dalam berpikir, merasakan, dan berhubungan dengan orang lain.`,
    `Wuku ${w.wuku.name} mewarnai cara kamu mengalami kehidupan — ${wukuDesc}. Kecenderungan ini hadir secara alami dalam pilihan-pilihan sehari-harimu: cara kamu menata energi, menghadapi hambatan, dan menemukan makna di balik rutinitas.`,
    `Pranata Mangsa ${pm.name} adalah musim lahirmu — ${mangsaDesc}. Orang yang lahir dalam musim ini sering membawa kualitas ini ke dalam cara mereka merespons perubahan dan mengetahui kapan waktu yang tepat untuk melangkah.`,
    `Dalam kehidupan sehari-hari, cara kamu membangun hubungan dan merawat rezeki mencerminkan karakter yang sama. ${w.relationshipStyle} ${w.moneyStyle} Pola ini bukan sekadar kebiasaan, melainkan ekspresi alami dari cara batinmu merawat koneksi dan membangun kehidupan yang bermakna.`,
    `${w.lifeMission.charAt(0).toUpperCase()}${w.lifeMission.slice(1)} Potensi terbesarmu bukan terletak pada mengikuti standar yang berlaku umum, melainkan pada keberanian menjalani hidup selaras dengan cara yang memang menjadi milikmu.`,
  ];
}

// ─── FIVE USERS ────────────────────────────────────────────────────────────

const USERS = [
  { name: "Raka",  birthDate: "1990-04-15", birthTime: "09:00", city: "Yogyakarta" },
  { name: "Sinta", birthDate: "1985-11-28", birthTime: "22:30", city: "Surabaya" },
  { name: "Dimas", birthDate: "2000-07-04", birthTime: "06:15", city: "Bandung" },
  { name: "Laras", birthDate: "1978-02-14", birthTime: "14:45", city: "Medan" },
  { name: "Bimo",  birthDate: "1995-09-21", birthTime: "19:00", city: "Bali" },
];

// ─── FORBIDDEN PATTERNS ────────────────────────────────────────────────────

const FORBIDDEN_ONE_WORD = ["fokus","ketahanan","kepedulian","inisiatif","adaptasi",
  "kerja sama","keberanian","kepemimpinan","pengaruh","integritas","ketekunan",
  "transformasi","kesabaran","keluwesan","batas diri","ketegasan","kekakuan",
  "pengendalian diri","beban berlebih","keseimbangan ambisi","melepas kendali","menerima bantuan","konsistensi"];
const TECHNICAL_LEAKS = ["neptu hari","neptu pasaran","siklus 210 hari","keteguhan hari",
  "watak pasaran","irama neptu","memberi corak","menegaskan pribadi yang","menambahkan tema",
  "mengarahkan kekuatan itu","Pelajaran Wuku"];

// ─── VALIDATION ────────────────────────────────────────────────────────────

let totalPass = 0; let totalFail = 0;
const allResults = [];

for (const user of USERS) {
  const w  = calculateWeton(user.birthDate, user.birthTime);
  const summary = generateWetonSummary(w);
  const issues = [];

  // Check strengths
  for (const item of w.strengths) {
    const words = item.trim().split(/\s+/);
    if (words.length < 5) issues.push(`STRENGTH too short (${words.length} words): "${item}"`);
    for (const bad of FORBIDDEN_ONE_WORD) {
      if (item.trim().toLowerCase() === bad) issues.push(`STRENGTH is 1-word forbidden: "${item}"`);
    }
    if (/^\w[\w\s]+: \w/.test(item)) issues.push(`STRENGTH has "Name: desc" format: "${item}"`);
  }

  // Check challenges
  for (const item of w.challenges) {
    const words = item.trim().split(/\s+/);
    if (words.length < 5) issues.push(`CHALLENGE too short (${words.length} words): "${item}"`);
    for (const bad of FORBIDDEN_ONE_WORD) {
      if (item.trim().toLowerCase() === bad) issues.push(`CHALLENGE is forbidden 1-word: "${item}"`);
    }
  }

  // Check watak
  if (w.watak.includes("sementara")) issues.push(`WATAK has "sementara"`);
  if (w.watak.includes("memberi corak")) issues.push(`WATAK has "memberi corak"`);
  if (/Neptu \d+ menegaskan/.test(w.watak)) issues.push(`WATAK has "Neptu X menegaskan"`);

  // Check lifeMission
  if (w.lifeMission.includes("mengarahkan kekuatan itu")) issues.push(`LIFEMISSION has old pattern`);
  if (w.lifeMission.includes("menambahkan tema")) issues.push(`LIFEMISSION has "menambahkan tema"`);

  // Check workStyle
  if (w.workStyle.includes("menambahkan tema")) issues.push(`WORKSTYLE has "menambahkan tema"`);

  // Check summary leaks
  const fullText = summary.join(" ");
  for (const leak of TECHNICAL_LEAKS) {
    if (fullText.includes(leak)) issues.push(`SUMMARY LEAK: "${leak}"`);
  }

  // Check summary para count
  if (summary.length !== 5) issues.push(`SUMMARY has ${summary.length} paragraphs (expected 5)`);

  const status = issues.length === 0 ? "✅ PASS" : "❌ FAIL";
  if (issues.length === 0) totalPass++; else totalFail++;
  allResults.push({ user, w, summary, issues, status });
}

// ─── PRINT REPORT ──────────────────────────────────────────────────────────

const SEP = "═".repeat(72);
const DIV = "─".repeat(72);

console.log(`\n${SEP}`);
console.log(`  WETON SPRINT 1 — FIVE USER NARRATIVE VERIFICATION`);
console.log(SEP);

for (const r of allResults) {
  const { user, w, summary, issues, status } = r;
  console.log(`\n${DIV}`);
  console.log(`  ${status}  ${user.name.toUpperCase()} | ${user.birthDate} ${user.birthTime} | ${user.city}`);
  console.log(DIV);
  console.log(`  Hari:           ${w.day}  (neptu ${w.neptuDay})`);
  console.log(`  Pasaran:        ${w.pasaran}  (neptu ${w.neptuPasaran})`);
  console.log(`  Total Neptu:    ${w.totalNeptu}`);
  console.log(`  Wuku:           ${w.wuku.name} (index ${w.wuku.index})`);
  console.log(`  Pranata Mangsa: ${w.pranataMangsa.name}`);
  console.log(`\n  WATAK:`);
  console.log(`    ${w.watak}`);
  console.log(`\n  STRENGTHS:`);
  w.strengths.forEach((s, i) => console.log(`    [${i+1}] ${s}`));
  console.log(`\n  CHALLENGES:`);
  w.challenges.forEach((c, i) => console.log(`    [${i+1}] ${c}`));
  console.log(`\n  LIFE MISSION:`);
  console.log(`    ${w.lifeMission}`);
  console.log(`\n  RELATIONSHIP STYLE:`);
  console.log(`    ${w.relationshipStyle}`);
  console.log(`\n  WORK STYLE:`);
  console.log(`    ${w.workStyle}`);
  console.log(`\n  MONEY STYLE:`);
  console.log(`    ${w.moneyStyle}`);
  console.log(`\n  SUMMARY (Kesimpulan Weton):`);
  summary.forEach((p, i) => console.log(`    [P${i+1}] ${p}`));
  if (issues.length > 0) {
    console.log(`\n  ISSUES:`);
    issues.forEach(x => console.log(`    ❌ ${x}`));
  }
}

// Uniqueness audit
console.log(`\n${SEP}`);
console.log(`  UNIQUENESS AUDIT`);
console.log(SEP);
const wataks     = allResults.map(r => r.w.watak);
const wukunames  = allResults.map(r => r.w.wuku.name);
const mangsas    = allResults.map(r => r.w.pranataMangsa.name);
const missions   = allResults.map(r => r.w.lifeMission);
console.log(`  Unique watak:           ${new Set(wataks).size}/5`);
console.log(`  Unique Wuku:            ${new Set(wukunames).size}/5  → ${wukunames.join(", ")}`);
console.log(`  Unique Pranata Mangsa:  ${new Set(mangsas).size}/5  → ${mangsas.join(", ")}`);
console.log(`  Unique life missions:   ${new Set(missions).size}/5`);

// Regression: neptu values (must match known correct values)
console.log(`\n${SEP}`);
console.log(`  REGRESSION — CALCULATION VERIFICATION`);
console.log(SEP);
for (const r of allResults) {
  const { w, user } = r;
  const regLine = `  ${user.name.padEnd(6)} | ${w.day.padEnd(7)} ${w.pasaran.padEnd(7)} | Neptu=${w.totalNeptu.toString().padEnd(3)} | Wuku=${w.wuku.name.padEnd(12)} | PM=${w.pranataMangsa.name}`;
  console.log(regLine);
}

console.log(`\n${SEP}`);
console.log(`  FINAL RESULT:  ${totalPass}/5 PASS   ${totalFail}/5 FAIL`);
console.log(SEP);
