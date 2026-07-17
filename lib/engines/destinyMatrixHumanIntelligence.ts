type UnknownRecord = Record<string, unknown>;

export type DestinyHumanNarrative = {
  identity: string;
  recurringStrength: string;
  recurringPattern: string;
  inheritedDrive: string;
  inheritedCare: string;
  inheritedChoice: string;
  naturalGift: string;
  personalPresence: string;
  work: string;
  relationship: string;
  bodyRhythm: string;
  selfDiscovery: string;
  socialMaturity: string;
  innerGrowth: string;
  summary: [string, string, string, string];
};

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function numbers(value: unknown): number[] {
  if (Array.isArray(value)) return value.map(Number).filter((item) => Number.isFinite(item) && item > 0);
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return [value];
  if (typeof value === "string") return (value.match(/\d+/g) || []).map(Number).filter((item) => item > 0 && item <= 22);
  return [];
}

function first(...values: unknown[]): number {
  for (const value of values) {
    const found = numbers(value)[0];
    if (found) return found;
  }
  return 0;
}

function sentence(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1).replace(/[.]$/, "")}.`;
}

function theme(value: number): string {
  const themes: Record<number, string> = {
    1: "mengubah gagasan menjadi langkah pertama",
    2: "mendengar isyarat halus sebelum memilih",
    3: "menumbuhkan orang, karya, atau ruang dengan rasa",
    4: "membangun struktur yang dapat diandalkan",
    5: "memilah nilai warisan agar tetap hidup dan relevan",
    6: "memilih dengan hati tanpa kehilangan arah diri",
    7: "bergerak maju dengan fokus yang tetap lentur",
    8: "memegang tanggung jawab tanpa memikul semuanya sendiri",
    9: "mengolah kedalaman menjadi kebijaksanaan yang bisa dibagikan",
    10: "menemukan pijakan ketika hidup berubah arah",
    11: "menggunakan kekuatan tanpa mengeraskan hati",
    12: "memberi jeda agar sudut pandang baru dapat muncul",
    13: "melepaskan bentuk lama supaya kehidupan dapat diperbarui",
    14: "menata ritme agar tidak bergerak dari satu ekstrem ke ekstrem lain",
    15: "mengenali keterikatan sebelum berubah menjadi kendali",
    16: "membangun ulang hidup dari kebenaran yang lebih jujur",
    17: "menjaga harapan tetap nyata dan membumi",
    18: "membedakan intuisi dari ketakutan yang menyamar",
    19: "menghidupkan suasana tanpa harus selalu terlihat kuat",
    20: "memulihkan yang tertunda dan menyelesaikan siklus lama",
    21: "menutup perjalanan dengan utuh sebelum membuka yang baru",
    22: "memberi ruang pada kebebasan tanpa kehilangan pijakan",
  };
  return themes[value] || "merespons hidup dengan lebih sadar";
}

function centerOpening(center: number, variant: number): string {
  const openings: Record<number, string[]> = {
    1: ["Kamu cenderung menjadi pembuka jalan ketika sesuatu belum memiliki bentuk", "Daya hidupmu muncul saat sebuah kemungkinan membutuhkan orang pertama yang bergerak"],
    2: ["Kepekaanmu bekerja sebelum banyak hal sempat terucap", "Kamu menangkap nuansa yang sering lewat begitu saja bagi orang lain"],
    3: ["Ada daya merawat yang membuat orang, gagasan, atau ruang bertumbuh di dekatmu", "Kehadiranmu paling terasa ketika sesuatu membutuhkan kesabaran untuk ditumbuhkan"],
    4: ["Kamu alami dalam memberi bentuk pada hal yang masih berantakan", "Orang lain mudah melihatmu sebagai sosok yang membuat keadaan terasa lebih tertata"],
    5: ["Hidup mengajakmu menjadi jembatan antara nilai lama dan kebutuhan hari ini", "Kamu kerap mencari inti yang masih hidup di balik aturan atau kebiasaan"],
    6: ["Banyak bagian hidupmu bertumbuh melalui pilihan hati", "Kamu memahami diri paling dalam ketika harus memilih antara harmoni dan kejujuran"],
    7: ["Ada tenaga maju yang kuat dalam caramu menjalani hidup", "Ketika arah sudah terasa jelas, kamu mampu bergerak dengan keteguhan yang sulit digoyahkan"],
    8: ["Tanggung jawab mudah menemukanmu, bahkan sebelum kamu memintanya", "Kamu sering menjadi penyangga ketika keadaan membutuhkan ketegasan dan rasa adil"],
    9: ["Kedalaman adalah ruang alami tempatmu memahami hidup", "Kamu perlu mencerna pengalaman dalam sunyi sebelum dapat melihat maknanya dengan jernih"],
    10: ["Kamu belajar menjadi tenang di tengah perubahan yang tidak selalu dapat dikendalikan", "Hidupmu bergerak dalam beberapa putaran yang mengajarimu menemukan pusat baru"],
    11: ["Kekuatanmu tidak harus berisik untuk dapat dirasakan", "Ada daya tahan besar yang bekerja paling baik ketika tetap ditemani kelembutan"],
    12: ["Kejernihan sering datang setelah kamu berhenti memaksa jawaban", "Jeda memberimu kemampuan melihat keadaan dari sisi yang sebelumnya tersembunyi"],
    13: ["Kamu membawa kemampuan memperbarui hidup setelah sebuah bentuk selesai", "Perubahan besar sering membangunkan bagian dirimu yang paling jujur"],
    14: ["Kekuatanmu terletak pada kemampuan menata ritme dan mempertemukan hal yang berbeda", "Kamu berkembang saat dapat meramu berbagai kebutuhan tanpa jatuh ke ekstrem"],
    15: ["Tenaga hidupmu besar dan mudah melekat pada hal yang sangat kamu inginkan", "Kamu memiliki daya tarik kuat yang meminta hubungan jujur dengan hasrat dan kendali"],
    16: ["Kamu bertumbuh pesat ketika berani membangun ulang sesuatu dari dasar yang lebih benar", "Kebenaran yang mengguncang justru sering membuka jalan hidupmu"],
    17: ["Harapan menjadi daya alami yang kamu bawa ke sekitar", "Kamu mampu melihat kemungkinan baru ketika orang lain hanya melihat jalan buntu"],
    18: ["Dunia batinmu kaya, peka, dan penuh lapisan", "Kamu membaca hidup melalui rasa yang dalam, meski kejernihannya perlu dijaga"],
    19: ["Kehangatanmu dapat membuat hidup terasa lebih lapang bagi orang lain", "Sukacita adalah salah satu tenaga paling alami dalam dirimu"],
    20: ["Kamu sering dipanggil untuk menyelesaikan yang lama agar kehidupan dapat bergerak kembali", "Pemulihan menjadi tema penting dalam caramu menemukan arah"],
    21: ["Ada kemampuan melihat perjalanan secara utuh dan membawanya menuju penyelesaian", "Kamu kuat dalam merangkum pengalaman menjadi pijakan bagi bab berikutnya"],
    22: ["Kebebasan dan rasa ingin tahu membuatmu hidup", "Kamu tumbuh melalui keberanian mencoba tanpa menunggu semuanya sempurna"],
  };
  const choices = openings[center] || ["Kamu bertumbuh ketika pilihan lahir dari kejujuran yang sederhana", "Arah hidupmu menjadi jelas saat kamu tidak meninggalkan suara diri"];
  return choices[variant % choices.length];
}

function containsAny(values: number[], targets: number[]): boolean {
  return targets.some((target) => values.includes(target));
}

function dominantBodyTheme(health: UnknownRecord): string {
  const entries = Object.entries(health).map(([key, raw]) => {
    const value = asRecord(raw);
    const score = [value.physics, value.physical, value.energy, value.emotion, value.emotions]
      .map(Number)
      .filter(Number.isFinite)
      .reduce((total, item) => total + item, 0);
    return { key: key.toLowerCase(), score };
  }).sort((a, b) => b.score - a.score);
  return entries[0]?.key || "";
}

function identityStory(center: number, father: number[], mother: number[], variant: number): string {
  const opening = centerOpening(center, variant);
  const inheritedDrive = theme(father[0] || center);
  const inheritedCare = theme(mother[0] || center);
  if (inheritedDrive === inheritedCare) return `${opening}. Satu pesan keluarga terasa sangat kuat: ${inheritedDrive}. Kamu sedang belajar membawa kekuatan itu tanpa menganggapnya sebagai satu-satunya cara menghadapi hidup.`;
  if (variant % 3 === 0) return `${opening}. Dari keluarga, kamu menyerap dorongan untuk ${inheritedDrive}, sekaligus kepekaan untuk ${inheritedCare}; keduanya membuatmu kuat ketika ketegasan dan rasa berjalan berdampingan.`;
  if (variant % 3 === 1) return `${opening}. Cara bergerakmu dibentuk oleh dua warisan: kemampuan untuk ${inheritedDrive} dan kebutuhan untuk ${inheritedCare}. Kamu menjadi paling utuh saat tidak memilih salah satunya secara berlebihan.`;
  return `${opening}. Ada ketegangan yang produktif antara dorongan untuk ${inheritedDrive} dan cara hati belajar ${inheritedCare}. Dari pertemuan itulah watakmu memperoleh kedalaman.`;
}

function recurringStory(karmic: number[], love: number[], center: number): string {
  const combined = [...karmic, ...love];
  if (containsAny(karmic, [18])) return `Ketika rasa aman goyah, pikiran dapat mengisi ruang kosong dengan terlalu banyak kemungkinan. Pola ini lebih mudah terurai saat kebutuhan untuk ${theme(love[0] || center)} diuji melalui percakapan dan kenyataan kecil, bukan hanya lewat dugaan.`;
  if (containsAny(karmic, [15])) return `Saat sesuatu terasa sangat penting, kedekatan dapat bercampur dengan dorongan mengendalikan hasil. Jalan keluarnya muncul ketika kemampuan untuk ${theme(love[1] || center)} lebih dulu diarahkan pada diri sendiri.`;
  if (containsAny(karmic, [21, 20])) return `Kamu dapat memahami bahwa sebuah bab telah usai, tetapi hati belum selalu ikut melepaskannya. Hubungan menjadi ruang belajar untuk ${theme(love[0] || center)} tanpa membawa sisa cerita lama ke pertemuan yang baru.`;
  if (containsAny(combined, [8, 4])) return `Menjadi orang yang dapat diandalkan kadang membuatmu sulit menunjukkan kebutuhan sendiri. Pengulangan berhenti ketika tanggung jawab tidak lagi dipakai untuk membeli rasa aman atau kedekatan.`;
  return `Pola yang kembali bukanlah hukuman, melainkan undangan untuk ${theme(karmic[0] || center)} sambil tetap menjaga kebutuhan emosionalmu tetap terlihat.`;
}

function workStory(money: number[], talents: number[], center: number): string {
  const combined = [...money, ...talents];
  const variant = (center + (money[0] || 0) + (talents[0] || 0)) % 4;
  if (containsAny(money, [22, 1])) {
    const stories = [
      `Ruang eksperimen membuat kemampuan kerjamu bernapas. Bakat untuk ${theme(talents[0] || center)} mengubah kebebasan menjadi hasil ketika setiap gagasan memperoleh tenggat yang nyata.`,
      `Jalur yang terlalu sempit cepat mengurangi tenagamu. Kamu lebih produktif saat boleh membuka cara baru, lalu memakai kemampuan ${theme(talents[0] || center)} untuk menuntaskan apa yang telah dimulai.`,
      `Penghasilan tidak hanya terkait pekerjaan apa yang dipilih, tetapi seberapa leluasa kamu memperbarui caranya. Potensi ${theme(talents[0] || center)} menjaga keberanian mencoba agar tidak berhenti sebagai kemungkinan.`,
      `Kemandirian adalah bahan bakar penting dalam karya. Ia menghasilkan manfaat ketika bakat ${theme(talents[0] || center)} bertemu komitmen yang cukup kuat untuk menahan kebosanan awal.`,
    ];
    return stories[variant];
  }
  if (containsAny(money, [8, 4])) {
    const stories = [
      `Kamu dipercaya karena mampu menata hal rumit dan tetap memegang tanggung jawab ketika situasi tidak mudah. Bakat ${theme(talents[0] || center)} berkembang paling jauh saat sebagian kendali berani kamu bagikan.`,
      `Struktur, batas, dan ketepatan adalah sumber daya profesionalmu. Potensi untuk ${theme(talents[0] || center)} membuat sistem yang kamu bangun terasa manusiawi, selama tubuh tidak dijadikan biaya keberhasilan.`,
      `Di tempat kerja, orang dapat mengandalkanmu untuk membuat proses kembali terarah. Kemampuan ${theme(talents[0] || center)} memberi warna tersendiri, tetapi beban perlu dibedakan dari bukti harga diri.`,
      `Hasil terbaik lahir saat ketegasanmu memperoleh wadah yang rapi. Ketika bakat ${theme(talents[0] || center)} ikut memimpin, pekerjaan bukan hanya selesai, melainkan mempunyai arti yang dapat dipercaya.`,
    ];
    return stories[variant];
  }
  if (containsAny(money, [9, 12])) return `Pekerjaanmu memperoleh bobot dari kedalaman, pengamatan, atau kemampuan melihat yang luput dari orang lain. Ketika bakat ${theme(talents[0] || center)} diberi bentuk yang dapat dipakai, keheninganmu berubah menjadi kontribusi.`;
  if (containsAny(money, [6, 3])) return `Rezeki bertumbuh melalui kemampuan membaca kebutuhan, merawat proses, atau menyatukan orang di sekitar tujuan yang bermakna. ${sentence(`bakat untuk ${theme(talents[0] || center)} menjadi pembeda ketika kamu tidak mengorbankan pilihan pribadi demi menjaga semua orang nyaman`)}`;
  if (containsAny(combined, [7, 11])) return `Karya meminta tujuan yang jelas dan ruang untuk bergerak dengan sungguh-sungguh. Daya ${theme(talents[0] || center)} menjaga ambisimu tetap bermakna ketika pencapaian tidak dipakai untuk membuktikan harga diri.`;
  return `Kemampuanmu menghasilkan sesuatu tumbuh ketika ${theme(money[0] || center)} bertemu dengan bakat untuk ${theme(talents[0] || center)}. Konsistensi kecil lebih menguntungkan daripada memaksa satu lompatan besar.`;
}

function relationshipStory(love: number[], karmic: number[], mother: number[], center: number): string {
  const combined = [...love, ...karmic, ...mother];
  const variant = (center + (love[0] || 0) + (karmic[0] || 0) + (mother[0] || 0)) % 3;
  if (containsAny(love, [12, 18]) || containsAny(karmic, [18])) {
    const stories = [
      `Kepekaan pada perubahan suasana membuatmu cepat merasakan jarak, bahkan sebelum ada penjelasan. Warisan untuk ${theme(mother[0] || center)} menjadi matang ketika dugaan diganti pertanyaan langsung dan rasa sayang tidak berubah menjadi tugas menyelamatkan.`,
      `Hati membaca banyak hal dari nada, jeda, dan gestur kecil. Karena pola lama mudah mengaburkan intuisi dengan takut, kedekatan membutuhkan batas yang jelas serta keberanian membiarkan pasangan menjalani prosesnya sendiri.`,
      `Kamu dapat masuk sangat dalam ke perasaan orang yang dicintai. Hubungan akan lebih jernih saat kemampuan ${theme(mother[0] || center)} tidak membuatmu mengambil alih, melainkan membantu dua pihak berkata jujur tentang kebutuhannya.`,
    ];
    return stories[variant];
  }
  if (containsAny(love, [8, 4]) || containsAny(mother, [8, 4])) {
    const stories = [
      `Kedekatan sering menempatkanmu sebagai penjaga arah dan kestabilan. Cinta terasa lebih aman saat kebutuhan sendiri dapat diucapkan, bukan hanya dibuktikan lewat kesanggupan memikul banyak hal.`,
      `Kamu menunjukkan kasih melalui keandalan, perlindungan, dan kesediaan menyelesaikan masalah. Pola lama melembut ketika pasangan boleh ikut kuat dan kamu tidak harus selalu menjadi penyangga.`,
      `Ada kesetiaan yang nyata dalam caramu berelasi, tetapi tanggung jawab mudah mengambil terlalu banyak ruang. Kehangatan kembali hadir ketika kontrol diganti pembagian peran yang dapat dirundingkan.`,
    ];
    return stories[variant];
  }
  if (containsAny(love, [20, 21]) || containsAny(karmic, [20, 21])) return `Relasi membawa pelajaran tentang pemulihan dan penutupan yang jujur. Cara keluarga mengajarkanmu untuk ${theme(mother[0] || center)} perlu bertemu keberanian melepaskan, agar pasangan hari ini tidak memikul cerita dari masa lalu.`;
  if (containsAny(combined, [6, 3])) return `Hati memiliki kemampuan besar untuk merawat dan menciptakan rasa kebersamaan. Tantangannya adalah tidak menjadikan harmoni sebagai alasan untuk menunda pilihan; hubungan bertumbuh ketika dirimu tetap hadir di dalam keputusan bersama.`;
  if (containsAny(combined, [7, 11])) return `Kamu menyukai kedekatan yang memiliki arah, kejujuran, dan tenaga untuk bertumbuh bersama. Gesekan muncul bila keteguhan berubah menjadi adu daya, sehingga kelembutan perlu hadir sebelum percakapan menjadi perlombaan.`;
  return `Hubungan menjadi ruang untuk ${theme(love[0] || center)} sambil menyembuhkan kebiasaan ${theme(karmic[0] || center)}. Kedekatan yang sehat tidak meminta salah satu pihak menghilang.`;
}

function bodyStory(health: UnknownRecord, center: number, soul: number): string {
  const dominant = dominantBodyTheme(health);
  const soulTheme = theme(soul || center);
  if (dominant.includes("ajna")) return `Tubuhmu cepat menangkap beban ketika pikiran terlalu lama bekerja tanpa penutup. Kebutuhan batin untuk ${soulTheme} menjadi lebih sehat bila jeda, tidur, dan gerak sederhana hadir sebelum semua hal harus dipahami.`;
  if (dominant.includes("anahata")) return `Energi tubuh erat dengan cara kamu memberi dan menerima perhatian. Dorongan untuk ${soulTheme} perlu ditemani batas yang lembut, agar kepedulian tidak diam-diam berubah menjadi kelelahan.`;
  if (dominant.includes("manipura")) return `Daya tubuh meningkat ketika ada arah yang bisa dijalankan, tetapi mudah menegang saat hasil terasa seperti ukuran nilai diri. Ritme yang teratur membantu kemampuan ${soulTheme} bergerak tanpa tekanan berlebihan.`;
  if (dominant.includes("muladhara")) return `Tubuh membutuhkan pijakan yang nyata ketika keadaan terasa tidak pasti. Rutinitas sederhana, kehadiran pada napas, dan langkah yang dapat diselesaikan membantu kebutuhan untuk ${soulTheme} tidak berubah menjadi kewaspadaan terus-menerus.`;
  if (dominant.includes("vishudha")) return `Energi lebih mudah mengalir ketika pikiran dan perasaan memperoleh bahasa yang jujur. Menahan terlalu banyak hal membuat kebutuhan untuk ${soulTheme} terasa berat di tubuh.`;
  if (dominant.includes("svadhisthana")) return `Vitalitasmu berkaitan dengan ruang untuk merasa, mencipta, dan menikmati hidup tanpa rasa bersalah. Kemampuan ${soulTheme} menguat ketika emosi boleh bergerak, bukan hanya dikendalikan.`;
  return `Tubuh meminta keseimbangan antara makna dan hal-hal yang nyata. Dorongan untuk ${soulTheme} perlu diturunkan menjadi tidur yang cukup, batas energi, dan kebiasaan kecil yang dapat diulang.`;
}

function journeyStory(primary: number, center: number, support: number, stage: "self" | "social" | "inner", variant: number): string {
  if (stage === "self") return `Kamu menemukan diri bukan dengan mengumpulkan lebih banyak label, melainkan melalui keberanian untuk ${theme(primary || center)}. Watak dasarmu memberi arah, sedangkan pengalaman mengajarimu kapan harus bergerak dan kapan perlu mendengar.`;
  if (stage === "social") return `Di tengah orang lain, kedewasaanmu tampak saat kemampuan ${theme(primary || center)} tidak lagi dipakai untuk mencari penerimaan. Kontribusimu menjadi kuat ketika keunikan pribadi dan kebutuhan bersama dapat bertemu.`;
  const stories = [
    `Arah batinmu meminta keberanian untuk ${theme(primary || center)}. Pelajarannya menjadi nyata ketika kemampuan ${theme(support || center)} mengubah caramu merespons hal kecil sehari-hari.`,
    `Makna paling mudah kamu temukan ketika keberanian untuk ${theme(primary || center)} tidak berhenti sebagai pemahaman. Ia perlu turun menjadi sikap yang menolongmu ${theme(support || center)}.`,
    `Ada perpindahan penting dari mencari jawaban menuju kesediaan untuk ${theme(primary || center)}. Kedalamanmu matang melalui latihan ${theme(support || center)}, terutama ketika hidup tidak memberi kepastian cepat.`,
    `Pertumbuhan jiwa hadir bukan sebagai pencapaian besar, melainkan kemampuan ${theme(primary || center)} pada saat yang tepat. Dari sana kamu belajar ${theme(support || center)} dengan cara yang lebih lembut.`,
    `Yang sedang dibentuk dalam dirimu adalah kesanggupan untuk ${theme(primary || center)} tanpa meninggalkan kehidupan nyata. Kemampuan ${theme(support || center)} menjadi jembatan antara keyakinan dan tindakan.`,
  ];
  return stories[variant % stories.length];
}

function inheritedStory(primary: number, secondary: number, center: number, kind: "drive" | "care" | "choice"): string {
  if (kind === "drive") return `Dari cara keluarga menghadapi dunia, kamu menyerap dorongan untuk ${theme(primary || center)}. Kekuatan ini berguna saat tidak berubah menjadi tuntutan bahwa kamu harus selalu sanggup.`;
  if (kind === "care") return `Cara rasa diwariskan kepadamu melalui kebutuhan untuk ${theme(primary || center)}. Ia menjadi hadiah ketika merawat orang lain tidak membuat kebutuhanmu sendiri kehilangan tempat.`;
  return `Kamu tidak harus mengulang semua yang pernah membentuk keluargamu. Pertemuan antara ${theme(primary || center)} dan ${theme(secondary || center)} memberimu pilihan untuk membawa kekuatannya tanpa meneruskan bebannya.`;
}

export function buildDestinyHumanNarrative(source: unknown): DestinyHumanNarrative {
  const root = asRecord(source);
  const matrix = asRecord(root.destinyMatrix || root);
  const intelligence = asRecord(matrix.destinyIntelligence);
  const center = first(matrix.center, matrix.arcanaCenter);
  const father = numbers(matrix.fatherLine || matrix.fatherProgram);
  const mother = numbers(matrix.motherLine || matrix.motherProgram);
  const ancestor = numbers(matrix.ancestorLine);
  const money = numbers(matrix.moneyLine);
  const love = numbers(matrix.loveLine);
  const karmic = numbers(matrix.karmicTail);
  const talents = numbers(matrix.talentsGreat || matrix.talents || matrix.talentaAgung);
  const recurring = numbers(matrix.commonEnergy || matrix.repeatedArcana || matrix.dominantArcana);
  const soul = first(intelligence.soulSearching, asRecord(matrix.purposes).soulSearching);
  const social = first(intelligence.socialization, asRecord(matrix.purposes).socialization);
  const spiritual = first(intelligence.spiritualKnowledge, asRecord(matrix.purposes).spiritualKnowledge);
  const health = asRecord(intelligence.healthChart || matrix.healthChart || matrix.chakraMatrix);
  const signature = [center, ...father, ...mother, ...money, ...love, ...karmic, ...talents, soul, social, spiritual]
    .reduce((total, value, index) => total + value * (index + 1), 0);
  const variantSeed = [center, ...father, ...mother, ...money, ...love, ...karmic, ...talents, soul, social, spiritual]
    .reduce((hash, value) => ((hash * 33) ^ value) >>> 0, 5381);

  const identity = identityStory(center, father, mother, variantSeed);
  const recurringPattern = recurringStory(karmic, love, center);
  const work = workStory(money, talents, center);
  const relationship = relationshipStory(love, karmic, mother, center);
  const bodyRhythm = bodyStory(health, center, soul);
  const selfDiscovery = journeyStory(soul, center, spiritual, "self", variantSeed);
  const socialMaturity = journeyStory(social, center, soul, "social", variantSeed);
  const innerGrowth = journeyStory(spiritual, center, soul, "inner", variantSeed);

  const becomingStories = [
    `${centerOpening(center, signature + 1)}. Pertemuan antara cara keluarga mengajarkan keteguhan dan kepedulian membentukmu menjadi pribadi yang mampu memegang arah tanpa kehilangan rasa.`,
    `Secara alami, kamu bergerak menuju kehidupan yang memberi tempat bagi kemampuan untuk ${theme(center)}. Dua warisan yang berbeda membuat kekuatanmu tumbuh dari keseimbangan, bukan dari satu sisi saja.`,
    `Orang mungkin lebih dahulu melihat kemampuanmu untuk ${theme(center)}. Di baliknya, ada perpaduan keberanian dari satu sisi keluarga dan kepekaan dari sisi lain yang perlahan membentuk caramu menjadi dewasa.`,
    father[0] === mother[0]
      ? `Satu pesan keluarga hadir berulang: ${theme(father[0] || center)}. Watakmu berkembang saat kekuatan itu diberi cara baru, bukan dijadikan satu-satunya jawaban.`
      : `Dirimu berkembang melalui pertemuan dua arus: ${theme(father[0] || center)} dan ${theme(mother[0] || center)}. Watak alami menjadi utuh ketika keduanya tidak lagi saling meniadakan.`,
    `${centerOpening(center, signature + 2)}. Seiring pengalaman bertambah, kamu menemukan cara membawa kekuatan keluarga tanpa harus mewarisi seluruh bebannya.`,
  ];
  const becoming = becomingStories[variantSeed % becomingStories.length];
  const repetition = variantSeed % 3 === 0
    ? `Tema yang berulang muncul ketika kebutuhan untuk ${theme(karmic[0] || center)} bertemu ketakutan kehilangan kedekatan. Hidup terus mengembalikanmu pada batas yang jujur agar respons baru dapat tumbuh.`
    : variantSeed % 3 === 1
      ? `Beberapa bab terasa serupa karena kamu cenderung ${theme(karmic[0] || center)} sambil menjaga hubungan tetap aman. Pola itu berubah saat kejujuran tidak lagi ditunda demi ketenangan sesaat.`
      : `Pengulangan paling kuat terjadi ketika dorongan lama untuk ${theme(karmic[0] || center)} mengambil alih sebelum kebutuhan hati sempat diberi nama. Kesadaran memberi jarak antara rasa pertama dan pilihan berikutnya.`;
  const steadyWorldStories = [
    `Keteguhan membuatmu dipercaya dalam pekerjaan, namun cinta mengajarkan sisi yang berbeda: menerima bantuan tanpa merasa kehilangan kendali. Kedua ruang ini sama-sama meminta pembagian beban yang lebih adil.`,
    `Saat berkarya, struktur memberimu pijakan; saat berelasi, struktur yang terlalu kaku justru dapat menciptakan jarak. Tantangannya adalah mengetahui kapan perlu memimpin dan kapan cukup hadir.`,
    `Dunia profesional menghargai kesanggupanmu menahan tekanan. Hati, sebaliknya, membutuhkan tempat untuk rapuh dan didengarkan tanpa segera mencari penyelesaian.`,
    `Keandalan membuka banyak pintu kerja, tetapi tidak selalu membuka percakapan yang intim. Hubungan dan karya sama-sama bertumbuh ketika kesanggupan mengatakan tidak ikut melindungi tenagamu.`,
    `Karya menuntut ketepatan, sedangkan kedekatan meminta kelenturan. Kamu sedang belajar bahwa keberhasilan dan cinta tidak perlu dibayar dengan menjadi penanggung jawab tunggal.`,
  ];
  const freeWorldStories = [
    `Pekerjaan membutuhkan kebebasan mencoba, sementara hubungan memerlukan kehadiran yang dapat diprediksi. Ruang gerak dan komitmen perlu menjadi pasangan, bukan dua pilihan yang saling meniadakan.`,
    `Kebaruan menyegarkan daya kerjamu, tetapi hati tidak selalu dapat mengikuti perubahan secepat pikiran. Tantangan muncul saat eksperimen pribadi perlu berdampingan dengan kesepakatan bersama.`,
    `Dalam karya kamu ingin membuka kemungkinan; dalam cinta kamu belajar menjaga apa yang sudah dipilih. Keduanya bertemu pada keberanian menuntaskan, bukan sekadar memulai.`,
    `Jalur profesional yang lentur membuat bakatmu terlihat. Kedekatan justru menguji apakah kebebasan dapat tetap hadir tanpa membuat orang lain menebak-nebak posisimu.`,
    `Ide baru mudah menyalakan semangat kerja, sedangkan relasi meminta perhatian pada ritme yang berulang. Pertumbuhan terjadi saat spontanitas memiliki rumah yang cukup aman.`,
  ];
  const subtleWorldStories = [
    `Pekerjaan meminta kedalamanmu memperoleh bentuk yang bisa dipakai, sedangkan hubungan meminta perasaan memperoleh bahasa. Keduanya tersendat bila kesempurnaan dijadikan syarat untuk hadir.`,
    `Kepekaan adalah aset dalam karya sekaligus tantangan dalam cinta. Ia menjadi kekuatan ketika pengamatan tidak berubah menjadi dugaan dan refleksi akhirnya menghasilkan tindakan.`,
    `Di ruang profesional kamu perlu menunjukkan manfaat dari hal yang kamu pahami; di ruang intim kamu perlu menunjukkan kebutuhan yang biasanya disimpan. Visibilitas menjadi pelajaran bersama keduanya.`,
    `Karya berkembang saat wawasanmu dibagikan sebelum terasa sempurna. Hubungan pun membutuhkan keberanian serupa: membuka isi hati sebelum jarak berubah menjadi cerita sendiri.`,
    `Bakat batin memberi kedalaman pada pekerjaan, sementara kedekatan menjaga agar kedalaman itu tetap manusiawi. Tantangan utamanya adalah tidak menghilang ketika keadaan meminta kejelasan.`,
  ];
  const worldly = containsAny(money, [8, 4, 7, 11])
    ? steadyWorldStories[variantSeed % steadyWorldStories.length]
    : containsAny(money, [22, 1, 10])
      ? freeWorldStories[variantSeed % freeWorldStories.length]
      : subtleWorldStories[variantSeed % subtleWorldStories.length];
  const growthStories = dominantBodyTheme(health).includes("ajna")
    ? [
      `Arah berikutnya bergerak dari memahami menuju mengalami. Tubuh, batas, dan kenyataan kecil perlu ikut bersuara sebelum pikiran menyusun kesimpulan.`,
      `Kepalamu tidak harus menyelesaikan setiap kemungkinan. Jeda yang teratur akan membantu keputusan terasa lebih utuh karena tubuh ikut menjadi bagian dari pertimbangan.`,
      `Pertumbuhan hadir ketika analisis tidak lagi menjadi satu-satunya tempat berlindung. Gerak sederhana dan percakapan nyata dapat memberi kejernihan yang tidak ditemukan melalui pikiran saja.`,
      `Ada undangan untuk turun dari cerita menuju pengalaman langsung. Perhatikan tenaga, napas, dan batas sebelum memberi makna pada segala sesuatu.`,
      `Kejernihan baru membutuhkan ruang kosong, bukan tambahan jawaban. Ritme tubuh yang lebih tenang akan menolongmu membedakan hal yang nyata dari kekhawatiran yang berulang.`,
    ]
    : containsAny(karmic, [20, 21, 13])
      ? [
        `Bab berikutnya meminta penutupan yang tidak menyangkal arti masa lalu. Tenaga yang sempat tertahan dapat dipakai untuk membangun kehidupan yang lebih sesuai dengan dirimu hari ini.`,
        `Melepas bukan berarti menghapus perjalanan. Kamu sedang belajar menyimpan hikmah tanpa terus membawa beban yang sudah kehilangan tempat.`,
        `Perubahan akan terasa lebih ringan ketika akhir diberi bentuk yang jelas. Satu keputusan tuntas dapat membuka lebih banyak ruang daripada berkali-kali mengunjungi kemungkinan lama.`,
        `Arah tumbuhmu berada pada keberanian mengosongkan tempat. Apa yang selesai perlu dihormati, lalu diletakkan, agar energi kembali tersedia untuk kehidupan sekarang.`,
        `Pemulihan terjadi saat masa lalu tidak lagi menentukan kecepatan langkahmu. Bawa pelajarannya, tetapi izinkan tubuh mengenal ritme yang baru.`,
      ]
      : [
        `Pemahaman batin kini perlu memiliki bentuk sehari-hari. Kebiasaan kecil yang menghormati kapasitasmu akan bergerak lebih jauh daripada satu keputusan dramatis.`,
        `Yang dibutuhkan bukan lompatan besar, melainkan janji kecil yang dapat kamu tepati pada diri sendiri. Dari situlah kepercayaan baru perlahan dibangun.`,
        `Arahmu akan menguat melalui pilihan sederhana yang diulang tanpa kekerasan. Konsistensi yang lentur lebih sesuai daripada perubahan yang lahir dari rasa mendesak.`,
        `Langkah selanjutnya adalah memberi tubuh pengalaman bahwa perubahan dapat berlangsung dengan aman. Mulailah dari satu batas atau kebiasaan yang benar-benar mungkin dijaga.`,
        `Pertumbuhan tidak perlu dibuktikan lewat kecepatan. Ritme yang manusiawi akan membuat wawasan bertahan cukup lama untuk menjadi cara hidup.`,
      ];
  const growth = growthStories[variantSeed % growthStories.length];

  return {
    identity,
    recurringStrength: `Dalam berbagai keadaan, kemampuan untuk ${theme(recurring[0] || talents[0] || center)} cenderung muncul kembali. Watak dasarmu memberi tenaga, sedangkan bakat untuk ${theme(talents[0] || center)} membantunya menjadi sesuatu yang dapat dirasakan orang lain.`,
    recurringPattern,
    inheritedDrive: inheritedStory(father[0], father[1], center, "drive"),
    inheritedCare: inheritedStory(mother[0], mother[1], center, "care"),
    inheritedChoice: inheritedStory(ancestor[0] || father[0], ancestor[1] || mother[0], center, "choice"),
    naturalGift: workStory(talents, [...father, ...mother], center),
    personalPresence: `${centerOpening(center, variantSeed + 1)}. Kehadiranmu paling matang ketika kemampuan untuk ${theme(talents[0] || center)} tidak dipakai untuk membuktikan diri, melainkan untuk memberi bentuk pada sesuatu yang berarti.`,
    work,
    relationship,
    bodyRhythm,
    selfDiscovery,
    socialMaturity,
    innerGrowth,
    summary: [becoming, repetition, worldly, growth],
  };
}
