import type { DailyGuidanceInput, DailyGuidanceOutput } from "@/lib/orchestrators/types";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";

function safeString(value: any, fallback: string = ""): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

function safeObject(value: any): Record<string, any> {
  return (value && typeof value === "object" && !Array.isArray(value)) ? value : {};
}

function slug(value: any): string {
  const str = safeString(value);
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "unknown";
}

function toneFromMood(mood: number): DailyGuidanceOutput["soulReflection"]["emotionalTone"] {
  if (mood <= 3) return "grounding";
  if (mood <= 5) return "gentle";
  if (mood <= 7) return "introspective";
  return "empowering";
}

function intensityFromMood(mood: number): "low" | "medium" | "high" {
  if (mood <= 3) return "high";
  if (mood <= 7) return "medium";
  return "low";
}

function hashSeed(seed: string): number {
  return seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function firstNonEmpty(...values: any[]): string {
  for (const value of values) {
    const text = safeString(value).trim();
    if (text) return text;
  }
  return "";
}

function localizeDailyNoteLabel(value: string): string {
  const labels: Record<string, string> = {
    mercury: "Merkurius",
    venus: "Venus",
    mars: "Mars",
    moon: "Bulan",
    sun: "Matahari",
    saturn: "Saturnus",
    jupiter: "Jupiter",
    pluto: "Pluto",
    "wait to respond": "menunggu respons tubuh",
    "wait for invitation": "menunggu undangan yang tepat",
    "inform before action": "memberi informasi sebelum bergerak",
    "wait a lunar cycle": "menunggu kejernihan dalam satu siklus bulan",
    sacral: "sakral",
    emotional: "emosional",
    lunar: "lunar",
    splenic: "instingtif",
    ego: "kehendak",
    "self-projected": "arah diri",
    "mental": "kejernihan mental",
  };
  return labels[value.toLowerCase()] || value;
}

function buildPersonalDailyNote(params: {
  synthesis: any;
  context: any;
  userName: string;
  dateSeed: string;
}): string {
  const signals = safeObject(params.synthesis?.identitySignals);
  const blueprint = safeObject(params.context?.blueprint);
  const astrology = safeObject(blueprint.astrology || blueprint.natalChart);
  const humanDesign = safeObject(blueprint.humanDesign);
  const destinyMatrix = safeObject(blueprint.destinyMatrix);
  const activeTransits = safeArray<any>(params.context?.astrologyTransits?.activeTransits);
  const bodies = safeArray<any>(params.context?.currentSky?.bodies);
  const seed = hashSeed([
    params.dateSeed,
    params.userName,
    signals.lifePath,
    signals.humanDesignType,
    signals.arcanaCenter,
    signals.sunSign,
    signals.moonSign,
  ].map((value) => safeString(value)).join("|"));

  const preferredBodies = ["Mercury", "Venus", "Mars", "Moon", "Saturn", "Jupiter", "Pluto", "Sun"];
  const bodyFromSky = preferredBodies
    .map((name) => bodies.find((body) => safeString(body.body || body.name || body.planet).toLowerCase() === name.toLowerCase()))
    .find(Boolean);
  const transit = activeTransits[seed % Math.max(activeTransits.length, 1)] || bodyFromSky || {};
  const planet = localizeDailyNoteLabel(firstNonEmpty(transit.planet, transit.body, transit.name, "Merkurius"));
  const sign = firstNonEmpty(transit.sign, transit.zodiacSign, params.context?.currentSky?.moonSign, "tema analitis");
  const transitSummary = firstNonEmpty(
    params.context?.astrologyTransits?.summary,
    params.context?.astrologyToday,
    safeArray<any>(transit.themes).join(", "),
    "fokus mental, keputusan kecil, dan cara kamu mengatur respons harian"
  );

  const lifePath = firstNonEmpty(signals.lifePath, blueprint.lifePath?.number);
  const humanDesignType = firstNonEmpty(signals.humanDesignType, humanDesign.type);
  const strategy = localizeDailyNoteLabel(firstNonEmpty(signals.strategy, humanDesign.strategy));
  const authority = localizeDailyNoteLabel(firstNonEmpty(signals.authority, humanDesign.authority));
  const arcanaCenter = firstNonEmpty(signals.arcanaCenter, destinyMatrix.center);
  const sunSign = firstNonEmpty(signals.sunSign, astrology.sunSign);
  const moonSign = firstNonEmpty(signals.moonSign, astrology.moonSign);
  const ascendant = firstNonEmpty(signals.ascendant, astrology.ascendant);

  const lifePathThemes: Record<string, string> = {
    "1": "memulai dengan keputusan yang mandiri",
    "2": "menjaga harmoni tanpa menghilangkan kebutuhanmu sendiri",
    "3": "mengubah rasa menjadi ekspresi yang jelas",
    "4": "membangun struktur, ritme, dan konsistensi",
    "5": "mengelola kebebasan supaya tidak berubah menjadi energi tercecer",
    "6": "merawat orang lain tanpa kehilangan pusat dirimu",
    "7": "membaca makna sebelum mengambil kesimpulan",
    "8": "memakai daya dan kendali dengan lebih bersih",
    "9": "melepaskan pola lama dengan kedewasaan",
    "11": "menurunkan intuisi menjadi langkah yang bisa dijalankan",
    "22": "menjaga visi besar lewat fondasi kecil yang stabil",
    "33": "melayani dengan hati tanpa memikul semuanya",
  };
  const humanDesignThemes: Record<string, string> = {
    generator: "tubuhmu perlu merasa punya respons yang nyata sebelum menambah beban",
    "manifesting generator": "energi cepatmu tetap butuh jeda agar tidak meloncat ke terlalu banyak arah",
    projector: "perhatianmu lebih tajam ketika kamu memilih tempat yang benar-benar layak menerima energimu",
    manifestor: "dorongan memulai akan terasa lebih bersih ketika kamu menyampaikan arah tanpa harus membela diri",
    reflector: "kejernihanmu sangat dipengaruhi lingkungan, ritme, dan siapa yang sedang kamu serap hari ini",
  };
  const arcanaThemes: Record<string, string> = {
    "4": "disiplin yang tidak kaku",
    "6": "pilihan relasi yang lebih sadar",
    "8": "kekuatan batin, batas, dan keberanian mengatur ulang kendali",
    "9": "kebijaksanaan, penyelesaian, dan keberanian menutup siklus lama",
    "11": "kepekaan yang perlu diterjemahkan menjadi tindakan sederhana",
    "12": "melihat dari sudut pandang baru sebelum bereaksi",
  };

  const lpTheme = lifePathThemes[lifePath] || "mengenali pola yang membuat hidupmu lebih stabil";
  const hdTheme = humanDesignThemes[humanDesignType.toLowerCase()] || "cara tubuhmu mengambil keputusan perlu dihormati sebelum pikiran mempercepat cerita";
  const arcanaTheme = arcanaThemes[arcanaCenter] || "pusat energimu sedang diminta bekerja lebih sadar";
  const natalLine = [sunSign && `Matahari ${sunSign}`, moonSign && `Bulan ${moonSign}`, ascendant && `Ascendant ${ascendant}`].filter(Boolean).join(", ");
  const transitText = `${planet} ${sign} ${transitSummary}`.toLowerCase();
  const dominantTheme = transitText.includes("venus") || transitText.includes("relasi") || transitText.includes("hubungan")
    ? "relationship"
    : transitText.includes("mars") || transitText.includes("aksi") || transitText.includes("energi")
      ? "action"
      : transitText.includes("saturn") || transitText.includes("struktur") || transitText.includes("tanggung")
        ? "structure"
        : transitText.includes("moon") || transitText.includes("bulan") || transitText.includes("emosi")
          ? "emotion"
          : transitText.includes("pluto") || transitText.includes("lepas") || transitText.includes("transform")
            ? "release"
            : "clarity";
  const focusByTransit: Record<string, string> = {
    clarity: "Pilih satu keputusan kecil yang paling membutuhkan kejelasan, lalu rapikan informasinya sebelum kamu merespons.",
    structure: "Bereskan satu fondasi kecil: jadwal, prioritas, batas kerja, atau tugas tertunda yang membuat pikiran terus kembali ke tempat yang sama.",
    relationship: "Pilih satu percakapan yang perlu dibuat lebih jujur, lalu jawab dari rasa yang tenang, bukan dari keinginan untuk menyenangkan semua orang.",
    action: "Arahkan energi pada satu langkah yang benar-benar mendapat respons dari tubuhmu, bukan pada semua hal yang terlihat mendesak sekaligus.",
    emotion: "Beri ruang pada satu rasa yang paling kuat muncul hari ini, lalu cari tindakan sederhana yang membuat tubuhmu merasa lebih aman.",
    release: "Lepaskan satu hal kecil yang sudah tidak perlu kamu bawa hari ini: ekspektasi, jawaban lama, atau tanggung jawab yang bukan milikmu.",
  };
  const questionByTransit: Record<string, string> = {
    clarity: "Hal apa yang sebenarnya sudah jelas, tetapi masih kutunda karena takut harus mengubah cara bergerakku?",
    structure: "Fondasi kecil apa yang perlu kubereskan agar energiku tidak terus bocor ke hal yang berserakan?",
    relationship: "Di percakapan mana aku perlu lebih jujur tanpa kehilangan kelembutan?",
    action: "Langkah mana yang benar-benar mendapat respons dari tubuhmu, dan mana yang hanya lahir dari terburu-buru?",
    emotion: "Rasa apa yang sedang meminta didengar sebelum aku mengambil keputusan hari ini?",
    release: "Apa yang bisa kulepaskan hari ini supaya ruang batinku terasa lebih ringan dan jernih?",
  };
  const natalPhrase = natalLine
    ? `Dengan warna dasar ${natalLine}, dorongan ini menyentuh cara alamimu mencari aman, membaca detail, dan menjaga ritme yang bisa dipercaya.`
    : "Dorongan ini menyentuh cara alamimu mencari aman, membaca situasi, dan menjaga ritme yang bisa dipercaya.";

  return [
    `Hari ini ${planet} di ${sign} membuat tema ${transitSummary.toLowerCase()} lebih mudah terasa dalam pikiran dan keputusan kecil. Kamu mungkin lebih cepat menangkap sinyal, lebih peka pada hal yang belum rapi, atau lebih mudah berpindah dari satu urusan ke urusan lain.`,
    `${natalPhrase} Pola dasarmu berkembang lewat ${lpTheme}; energimu juga lebih tepat ketika ${hdTheme}${strategy ? `, dimulai dari ${strategy}` : ""}${authority ? ` dan kepekaan ${authority}` : ""}. Di lapisan yang lebih dalam, tema ${arcanaTheme} sedang meminta kamu memilih kendali yang lebih sadar, bukan sekadar menahan semuanya sendiri.`,
    `Fokus hari ini:\n${focusByTransit[dominantTheme]}`,
    `Pertanyaan refleksi:\n${questionByTransit[dominantTheme]}`,
  ].join("\n\n");
}

function generateSoulReflection(synthesis: any, userName: string, seedSource: string = ""): string {
  const signals = safeObject(synthesis?.identitySignals);
  const coreNeeds = safeArray<string>(synthesis?.coreNeeds);
  const seed = hashSeed([seedSource, userName, JSON.stringify(signals), coreNeeds.join("|")].join("|"));
  const signalText = [
    signals.lifePath,
    signals.humanDesignType,
    signals.humanDesignProfile,
    signals.authority,
    signals.strategy,
    signals.arcanaCenter,
    signals.sunSign,
    signals.moonSign,
    signals.ascendant,
    ...coreNeeds,
  ].map((value) => safeString(value).toLowerCase()).join(" ");

  const weightedThemes = [
    "pace",
    "boundary",
    "courage",
    "tenderness",
    "grounding",
    "clarity",
    "release",
    "trust",
    "patience",
    "devotion",
  ];
  const themeHints: Record<string, string[]> = {
    pace: ["generator", "manifesting", "sacral", "aries", "gemini", "sagittarius", "5", "11", "freedom", "movement"],
    boundary: ["projector", "manifestor", "saturn", "capricorn", "8", "4", "authority", "structure", "responsibility"],
    courage: ["aries", "leo", "mars", "1", "8", "22", "strength", "action", "lead"],
    tenderness: ["cancer", "pisces", "venus", "2", "6", "33", "care", "harmony", "heart"],
    grounding: ["taurus", "virgo", "capricorn", "4", "root", "body", "steady", "presence"],
    clarity: ["virgo", "aquarius", "gemini", "7", "11", "ajna", "truth", "insight"],
    release: ["scorpio", "pisces", "pluto", "9", "12", "ending", "letting"],
    trust: ["reflector", "lunar", "pisces", "sagittarius", "2", "faith", "intuition"],
    patience: ["taurus", "capricorn", "saturn", "4", "7", "wait", "slow"],
    devotion: ["libra", "cancer", "virgo", "6", "33", "service", "relationship"],
  };
  const scores = weightedThemes.map((theme, index) => {
    const matches = themeHints[theme].filter((hint) => signalText.includes(hint)).length;
    return { theme, score: matches * 10 + ((seed + index * 7) % 10) };
  }).sort((a, b) => b.score - a.score);
  const primaryTheme = scores[0]?.theme || weightedThemes[seed % weightedThemes.length];
  const secondaryTheme = scores.find((item) => item.theme !== primaryTheme)?.theme || weightedThemes[(seed + 3) % weightedThemes.length];

  const experiences: Record<string, string[]> = {
    pace: [
      "Hari ini mungkin terasa seperti banyak hal ingin segera diselesaikan, sementara tubuhmu meminta langkah yang lebih pelan. Ada jarak kecil antara dorongan untuk mengejar semuanya dan kebutuhan untuk bernapas sebelum memilih lagi. Perhatikan bagian dirimu yang mulai lelah menjadikan cepat sebagai ukuran aman.",
      "Ada dorongan untuk bergerak cepat hari ini, namun bagian terdalam dirimu mungkin hanya meminta ritme yang lebih bisa dipercaya. Kamu mungkin ingin langsung menjawab, memperbaiki, atau menuntaskan sesuatu, tetapi tubuhmu bisa saja sedang meminta jeda yang lebih jujur sebelum kamu memberi tenaga lagi.",
    ],
    boundary: [
      "Hari ini kamu mungkin lebih mudah merasakan mana yang membuatmu penuh, dan mana yang diam-diam menguras tenaga. Mungkin ada percakapan, permintaan, atau tanggung jawab kecil yang terlihat biasa saja, tetapi terasa berat karena menyentuh tempat yang selama ini terlalu sering kamu abaikan.",
      "Ada batas halus yang mungkin sedang muncul hari ini, terutama ketika kamu merasa perlu menjawab terlalu banyak kebutuhan sekaligus. Batas itu tidak selalu datang sebagai penolakan besar. Kadang ia hanya muncul sebagai rasa sesak, diam yang panjang, atau keinginan untuk tidak langsung tersedia.",
    ],
    courage: [
      "Hari ini bukan meminta kamu menjadi paling berani. Hari ini hanya meminta kamu tidak mengecilkan suara kecil yang tahu arahmu. Mungkin ada bagian dari dirimu yang sudah lama mengerti, tetapi masih menunggu cukup aman untuk diakui tanpa perlu dibuat dramatis.",
      "Mungkin ada keputusan sederhana yang terasa lebih besar dari kelihatannya, karena ia meminta kamu berdiri sedikit lebih jujur. Tidak harus berupa perubahan besar. Bisa saja hanya berhenti menyetujui sesuatu yang membuat tubuhmu menegang setiap kali kamu mengingatnya.",
    ],
    tenderness: [
      "Hari ini bagian lembut dalam dirimu mungkin lebih mudah tersentuh oleh hal-hal kecil yang biasanya kamu lewati begitu saja. Sebuah nada bicara, ingatan singkat, atau perubahan rencana bisa terasa lebih dalam dari biasanya, bukan karena kamu berlebihan, tetapi karena hatimu sedang lebih terbuka.",
      "Ada rasa halus yang mungkin muncul tanpa banyak alasan, seperti tubuhmu sedang meminta diperlakukan dengan lebih ramah. Kamu mungkin tidak perlu mencari penyebabnya dengan terburu-buru. Cukup sadari bahwa ada bagian dalam dirimu yang ingin disambut tanpa harus membuktikan apa-apa.",
    ],
    grounding: [
      "Hari ini pikiranmu mungkin ingin menata semuanya, sementara tubuhmu hanya meminta satu tempat aman untuk kembali berpijak. Mungkin daftar urusan terasa panjang, tetapi yang paling mendesak justru bukan menyelesaikan semuanya. Yang paling mendesak adalah mengingat bahwa kamu masih ada di tubuhmu.",
      "Ada kebutuhan untuk kembali sederhana hari ini: napas yang utuh, tubuh yang didengar, dan langkah yang tidak dipaksa. Ketika terlalu banyak hal meminta perhatian, kamu mungkin perlu memilih satu titik kecil yang bisa membuatmu merasa hadir lagi, bukan hanya berfungsi.",
    ],
    clarity: [
      "Hari ini mungkin membawa keinginan untuk memahami semuanya, tetapi tidak semua rasa perlu langsung berubah menjadi jawaban. Ada kemungkinan kamu sedang berdiri di antara yang lama dan yang baru, sehingga pikiran mencoba memberi nama pada sesuatu yang sebenarnya masih perlu dirasakan.",
      "Ada sesuatu yang ingin menjadi lebih jernih hari ini, bukan lewat banyak berpikir, melainkan lewat keberanian melihat apa adanya. Mungkin kamu mulai menyadari pola yang sering berulang, atau kebenaran kecil yang selama ini tertutup oleh alasan yang terdengar masuk akal.",
    ],
    release: [
      "Hari ini mungkin menunjukkan hal yang sudah terlalu lama kamu pegang, padahal sebagian dirimu mulai lelah mempertahankannya. Bisa berupa harapan, cara lama melindungi diri, atau kebiasaan menunda kejujuran karena takut apa yang berubah setelahnya.",
      "Ada sesuatu yang pelan-pelan ingin dilepaskan hari ini, bukan karena gagal, tetapi karena dirimu sudah tumbuh melewatinya. Kamu mungkin masih menyayanginya, masih menghormati perannya, namun mulai tahu bahwa tidak semua yang pernah menolongmu harus terus kamu bawa.",
    ],
    trust: [
      "Hari ini mungkin terasa belum sepenuhnya jelas, namun bukan berarti kamu sedang tersesat. Ada masa ketika hidup belum memberi peta yang rapi, tetapi tetap memberi tanda kecil melalui rasa lega, tubuh yang melunak, atau keheningan yang tidak lagi terasa mengancam.",
      "Ada bagian dirimu yang ingin belajar percaya lagi, terutama saat jalan belum memberi kepastian yang rapi. Mungkin kamu sedang belajar bahwa tidak semua keputusan harus lahir dari rasa yakin penuh. Beberapa langkah hanya meminta kejujuran yang cukup dan hati yang tidak dipaksa.",
    ],
    patience: [
      "Hari ini mungkin menguji kesabaranmu dengan hal-hal kecil yang tidak bergerak secepat harapanmu. Ada bagian dari dirimu yang ingin segera melihat hasil, segera merasa pasti, segera tiba di tempat yang lebih ringan. Namun proses batin sering tumbuh tanpa suara.",
      "Ada proses yang meminta waktu hari ini, dan mungkin tugasmu bukan mempercepatnya, melainkan menemaninya dengan lebih lembut. Mungkin yang terasa lambat sebenarnya sedang membentuk daya tahan yang lebih matang, agar langkahmu nanti tidak mudah runtuh ketika diuji.",
    ],
    devotion: [
      "Hari ini kamu mungkin melihat betapa banyak cinta yang kamu berikan, bahkan ketika kamu sendiri belum merasa cukup dirawat. Ada kebiasaan halus untuk hadir bagi orang lain, menyusun keadaan, atau menjaga kedamaian, sementara kebutuhanmu sendiri menunggu di sudut yang sepi.",
      "Ada kesungguhan dalam dirimu yang ingin tetap hadir, tetapi ia juga membutuhkan ruang untuk tidak selalu memikul semuanya. Mungkin kamu sedang belajar bahwa mencintai dengan dalam tidak berarti harus menjadi tempat semua orang bersandar sepanjang waktu.",
    ],
  };
  const meanings: Record<string, string[]> = {
    pace: [
      "Di balik rasa terburu-buru itu, mungkin ada ketakutan lama bahwa kamu hanya aman jika terus bergerak. Padahal tidak semua jeda berarti tertinggal. Kadang jeda adalah cara jiwa memastikan langkah berikutnya benar-benar berasal dari dirimu, bukan dari tekanan di luar.",
    ],
    boundary: [
      "Rasa penuh itu bukan gangguan. Ia bisa menjadi bahasa halus dari bagian dirimu yang ingin dilindungi. Mungkin kamu sedang belajar bahwa kebaikan tidak harus berarti membuka semua pintu, dan hadir untuk orang lain tidak perlu membuatmu meninggalkan dirimu sendiri.",
    ],
    courage: [
      "Keberanian yang dibutuhkan hari ini mungkin tidak keras. Ia bisa muncul sebagai satu kalimat jujur, satu pilihan yang tidak lagi menipu tubuhmu, atau kesediaan untuk berhenti mengecil agar keadaan terlihat baik-baik saja.",
    ],
    tenderness: [
      "Kelembutan itu bukan tanda kamu rapuh. Ia adalah tempat batinmu mulai berkata jujur setelah terlalu lama diminta kuat. Mungkin ada rasa yang tidak perlu diperbaiki hari ini, hanya perlu dikenali tanpa buru-buru dijelaskan.",
    ],
    grounding: [
      "Saat dunia terasa terlalu banyak, tubuh sering menjadi pintu pulang yang paling jujur. Tegang di dada, napas pendek, atau lelah yang datang tiba-tiba bisa menjadi pesan bahwa kamu perlu merawat dasar sebelum menuntut arah.",
    ],
    clarity: [
      "Kejernihan tidak selalu datang sebagai jawaban besar. Sering kali ia datang ketika kamu berhenti membela kebingungan dan mulai mengakui satu hal yang sebenarnya sudah kamu tahu. Kecil, tetapi cukup untuk membuat hati lebih lapang.",
    ],
    release: [
      "Melepas bukan berarti menolak masa lalu. Kadang ia berarti berhenti membawa sesuatu yang sudah selesai mengajarimu. Ada kedewasaan dalam mengizinkan ruang kosong hadir sebelum sesuatu yang baru benar-benar siap tumbuh.",
    ],
    trust: [
      "Kepercayaan tidak selalu terasa yakin. Kadang ia hanya keputusan lembut untuk tidak menghukum diri saat belum tahu semuanya. Kamu boleh berjalan dengan cahaya kecil, selama cahaya itu masih membuatmu tetap dekat dengan kebenaranmu.",
    ],
    patience: [
      "Kesabaran hari ini bukan pasrah yang mati. Ia adalah cara menjaga hati tetap utuh ketika hasil belum terlihat. Mungkin yang sedang dibentuk bukan hanya keadaan di luar, tetapi kapasitasmu untuk hadir tanpa memaksa hidup tunduk pada cemas.",
    ],
    devotion: [
      "Pengabdian yang sehat tidak menghapus dirimu. Ia justru mengajarimu mencintai dengan lebih bersih: memberi tanpa kehilangan pusat, menemani tanpa mengambil alih, dan tetap menyisakan kehangatan untuk tubuhmu sendiri.",
    ],
  };
  const integrations: Record<string, string[]> = {
    pace: ["Pelankan satu hal saja hari ini, lalu rasakan bagaimana tubuhmu merespons ketika ia tidak lagi dikejar. Kamu tidak perlu memenangkan seluruh hari. Cukup pilih satu langkah yang membuatmu tetap dekat dengan dirimu sendiri. Bila ada rasa bersalah saat melambat, sapa ia dengan lembut; mungkin ia hanya belum terbiasa melihatmu memilih tenang."],
    boundary: ["Pilih satu batas kecil yang terasa jujur, dan biarkan itu menjadi cara sederhana untuk kembali berada di pihak dirimu sendiri. Tidak semua hal perlu dijawab hari ini. Beberapa hanya perlu kamu letakkan dengan hormat. Bila muncul rasa tidak enak, ingatkan hatimu bahwa menjaga ruang bukan berarti berhenti peduli."],
    courage: ["Tidak perlu mengubah semuanya. Cukup hormati satu kebenaran kecil, lalu ambil langkah yang masih terasa manusiawi. Keberanian hari ini boleh pelan, asal ia tidak lagi mengkhianati suara terdalam dirimu. Biarkan tubuhmu ikut menyetujui langkah itu, supaya keberanian tidak berubah menjadi paksaan baru."],
    tenderness: ["Letakkan tangan di dada sebentar, beri nama pada rasamu, dan izinkan dirimu tidak harus selesai hari ini. Kamu boleh menjadi lembut tanpa kehilangan arah. Kamu boleh istahat tanpa harus menjelaskan nilaimu. Bila air mata atau diam datang, anggap itu cara batinmu membersihkan ruang yang terlalu lama sesak."],
    grounding: ["Kembali ke napas, ke kaki yang menyentuh lantai, ke satu tindakan kecil yang membuat hidup terasa bisa dipegang lagi. Mulailah dari hal paling dekat. Tubuh yang merasa aman akan membantumu mendengar dengan lebih jernih. Dari sana, kamu bisa memilih tanpa terlalu banyak ditarik oleh cemas."],
    clarity: ["Tanyakan pelan-pelan: apa yang sebenarnya sudah jelas, meski belum nyaman untuk diakui? Mulailah dari sana. Kamu tidak perlu memaksa jawaban menjadi sempurna. Cukup jujur pada satu titik yang tidak lagi bisa kamu abaikan. Kejujuran kecil sering membuka jalan lebih baik daripada rencana besar yang lahir dari takut."],
    release: ["Lepaskan satu tuntutan untuk memahami semuanya sekarang; cukup longgarkan genggamanmu sedikit demi sedikit. Yang pergi tidak selalu meninggalkan kosong. Kadang ia membuka ruang agar kamu bisa bernapas lebih benar. Percayalah, yang sungguh milik perjalananmu tidak perlu kamu pegang sampai melukai tanganmu."],
    trust: ["Biarkan langkah berikutnya tetap sederhana. Kamu tidak perlu melihat seluruh jalan untuk berjalan dengan lebih lembut. Hari ini, percaya bisa berarti berhenti menyerang dirimu sendiri saat hidup belum memberi kepastian. Letakkan satu tangan di tubuhmu, dan ingat bahwa kamu boleh ditemani pelan-pelan oleh waktumu sendiri."],
    patience: ["Temani proses ini dengan napas yang lebih panjang, bukan tekanan yang lebih keras. Yang pelan juga sedang bergerak. Beri dirimu izin untuk tumbuh tanpa harus terus menunjukkan bukti bahwa kamu sedang membaik. Ada hal-hal yang justru menjadi kuat karena tidak dipaksa keluar sebelum waktunya."],
    devotion: ["Rawat satu kebutuhanmu sendiri sebelum memberi lebih jauh. Cinta yang pulang ke tubuhmu akan menjadi lebih jernih. Hari ini, biarkan perhatianmu tidak hanya keluar, tetapi juga kembali menyentuh tempat dalam dirimu yang paling membutuhkan. Dari sana, kehadiranmu untuk dunia tidak lagi lahir dari habis, melainkan dari penuh."],
  };
  const closingLines = [
    "Tidak perlu terburu-buru; cukup hadir dengan jujur pada satu momen yang paling dekat.",
    "Biarkan hari ini menjadi ruang kecil untuk kembali mempercayai kelembutanmu sendiri.",
    "Yang paling penting adalah tidak meninggalkan dirimu saat rasa sedang berbicara.",
  ];

  const pick = (options: string[], offset: number) => options[(seed + offset) % options.length] || options[0] || "";
  return [
    pick(experiences[primaryTheme], 0),
    pick(meanings[secondaryTheme], 5),
    `${pick(integrations[primaryTheme], 11)} ${pick(closingLines, 19)}`,
  ].join("\n\n");
}

function generateDailyNote(synthesis: any, input: any, userName: string): string {
  return buildPersonalDailyNote({
    synthesis,
    context: input,
    userName,
    dateSeed: safeString(input.adaptiveContext?.dailyVariationSeed) || safeString(input.generatedAt).slice(0, 10),
  });
}

export function generateLocalManifestation(input: DailyGuidanceInput, reason: string = "unknown"): DailyGuidanceOutput["manifestation"] {
  const isId = input.language !== "en";
  const mood = Number(input.emotionalState?.currentMood) || 6;
  const lp = String(input.blueprint?.lifePath?.number || "");
  const arcana = String(input.blueprint?.destinyMatrix?.center || "");
  const seed = hashSeed(safeString(input.adaptiveContext?.dailyVariationSeed) || input.generatedAt.slice(0, 10));

  // Determine Category
  let category = "general";
  if (mood <= 4) category = "grounding";
  else if (["2", "6", "12"].includes(lp) || ["6", "12"].includes(arcana)) category = "worth";
  else if (["1", "7", "11"].includes(lp) || ["7", "11"].includes(arcana)) category = "clarity";
  else if (mood <= 6) category = "processing";
  else if (mood >= 8) category = "expansion";

  const matrix: Record<string, Array<{ affirmation: string; assumption: string; attraction: string }>> = {
    grounding: [
      {
        affirmation: isId ? "Hari ini aku boleh bergerak tanpa memaksa diriku membuktikan apa pun." : "Today I am allowed to move without forcing myself to prove anything.",
        assumption: isId ? "Aku boleh percaya bahwa jeda adalah bagian dari pertumbuhan, bukan tanda tertinggal." : "I choose to believe that a pause is part of growth, not a sign of falling behind.",
        attraction: isId ? "Aku mengundang energi tenang, cukup, dan hadir." : "I invite calm, sufficient, and present energy."
      },
      {
        affirmation: isId ? "Aku menghargai batasan tubuhku sebagai bentuk cinta paling jujur hari ini." : "I respect my body's limits as the most honest form of self-love today.",
        assumption: isId ? "Aku percaya bahwa merasa cukup adalah kunci untuk memulai kembali dengan bersih." : "I believe that feeling 'enough' is the key to a clean restart.",
        attraction: isId ? "Aku mengundang energi pemulihan, kelembutan, dan kepulangan." : "I invite restorative, gentle, and returning energy."
      }
    ],
    worth: [
      {
        affirmation: isId ? "Nilai diriku tidak bergantung pada seberapa banyak aku dibutuhkan orang lain." : "My worth does not depend on how much I am needed by others.",
        assumption: isId ? "Aku boleh percaya bahwa diterima tidak selalu harus diawali dengan membuktikan diri." : "I can believe that being accepted doesn't always have to start with proving myself.",
        attraction: isId ? "Aku mengundang energi cukup, utuh, dan layak diterima." : "I invite sufficient, whole, and worthy energy."
      }
    ],
    clarity: [
      {
        affirmation: isId ? "Aku tidak harus melihat seluruh jalan untuk mengambil satu langkah yang jujur hari ini." : "I don't have to see the whole path to take one honest step today.",
        assumption: isId ? "Aku boleh percaya bahwa kejelasan tumbuh ketika aku hadir pada langkah kecil yang bisa kulakukan." : "I can believe that clarity grows when I am present for the small steps I can take.",
        attraction: isId ? "Aku mengundang energi jernih, sederhana, dan selaras." : "I invite clear, simple, and aligned energy."
      }
    ],
    processing: [
      {
        affirmation: isId ? "Aku mengizinkan perasaanku hadir tanpa menjadikannya penguasa seluruh hariku." : "I allow my feelings to be present without letting them rule my entire day.",
        assumption: isId ? "Aku boleh percaya bahwa merasakan bukan berarti tenggelam." : "I can believe that feeling does not mean drowning.",
        attraction: isId ? "Aku mengundang energi lembut, stabil, dan memulihkan." : "I invite gentle, stable, and healing energy."
      }
    ],
    expansion: [
      {
        affirmation: isId ? "Aku membuka diri pada kemungkinan yang lebih besar dari apa yang bisa kupikirkan hari ini." : "I open myself to possibilities greater than what I can conceive today.",
        assumption: input.language === "en"
          ? "I believe my capacity expands as I grow in the courage to be honest."
          : "Aku percaya bahwa kapasitas diriku berkembang seiring dengan keberanianku untuk jujur.",
        attraction: isId ? "Aku mengundang energi luas, berdaya, dan penuh kemungkinan." : "I invite expansive, empowered, and possibility-filled energy."
      }
    ],
    general: [
      {
        affirmation: isId ? "Aku memilih bergerak dengan tenang, percaya bahwa langkah kecil hari ini tetap berarti." : "I choose to move calmly, trusting that today's small steps still matter.",
        assumption: isId ? "Aku sudah menjadi pribadi yang lebih sadar dan lebih percaya pada ritme hidupku sendiri." : "I am already a more conscious person, trusting my own life rhythm.",
        attraction: isId ? "Aku mengundang energi selaras, tenang, dan bermakna." : "I invite aligned, calm, and meaningful energy."
      }
    ]
  };

  const options = matrix[category] || matrix.general;
  const picked = options[seed % options.length];

  console.log(`[MANIFESTATION FALLBACK USED] Reason: ${reason}, Category: ${category}, Seed: ${seed}`);
  return picked;
}

export function generateLocalDailyGuidance(input: DailyGuidanceInput): DailyGuidanceOutput {
  console.error("[LOCAL_DG_FALLBACK_ENTERED]", input);

  const safeInput = {
    ...input,
    user: safeObject(input?.user),
    identity: safeObject(input?.identity),
    blueprint: safeObject(input?.blueprint),
    emotionalState: safeObject(input?.emotionalState),
    emotionalMemory: safeObject(input?.emotionalMemory),
    healingProgress: safeObject(input?.healingProgress),
    adaptiveContext: safeObject(input?.adaptiveContext),
    language: input?.language || "id",
    generatedAt: input?.generatedAt || new Date().toISOString(),
  };

  console.error("[LOCAL_DG_FALLBACK_PROFILE_CHECK]", {
    hasUid: !!safeInput.user.id,
    hasDateKey: !!safeInput.adaptiveContext.dailyVariationSeed,
    hasProfile: !!safeInput.user,
    hasBlueprint: !!safeInput.blueprint,
    hasHumanDesign: !!safeInput.blueprint.humanDesign,
    hasLifePath: !!safeInput.blueprint.lifePath,
    hasNatalChart: !!safeInput.blueprint.natalChart || !!safeInput.blueprint.astrology,
    hasDestinyMatrix: !!safeInput.blueprint.destinyMatrix
  });

  let synthesis;
  try {
    synthesis = buildUnifiedBlueprintSynthesis({
      language: safeInput.language,
      profile: safeInput.user as unknown as Record<string, unknown>,
      blueprint: safeInput.blueprint as unknown as Record<string, unknown>,
      astrologyToday: safeInput.astrologyTransits?.summary,
      adaptiveContext: safeInput.adaptiveContext as any,
    });
    console.error("[LOCAL_DG_FALLBACK_SYNTHESIS_SUCCESS]", synthesis.blueprintSummary.slice(0, 50));
  } catch (err) {
    console.error("[LOCAL_DG_FALLBACK_SYNTHESIS_FAILED]", err);
    synthesis = {
      blueprintSummary: safeInput.language === "en"
        ? "Today is a day for steady progress and gentle self-care."
        : "Hari ini adalah hari untuk kemajuan yang stabil dan perawatan diri yang lembut.",
      coreNeeds: ["presence", "care", "steadiness"],
      practiceThemes: { grounding: "presence", reflection: "clarity", action: "one small step" },
      progressTone: { key: "steady", label: "steady", durationRange: [5, 10], practiceDepth: "steady" },
      identitySignals: {
        lifePath: null, arcanaCenter: null, commonEnergy: null, karmicPatterns: [],
        humanDesignType: null, humanDesignProfile: null, authority: null, strategy: null,
        sunSign: null, moonSign: null, ascendant: null
      }
    };
  }

  try {
    const mood = Number(safeInput.emotionalState.currentMood) || 6;
    const adaptive = safeInput.adaptiveContext;
    const seed = safeString(adaptive?.dailyVariationSeed) || safeInput.generatedAt.slice(0, 10);
    const seedHash = hashSeed(seed);
    const restart = (Number(adaptive?.completionRateYesterday) || 0) === 0;
    const strongCompletion = (Number(adaptive?.completionRateYesterday) || 0) >= 80;

    const identity = safeInput.identity;
    const emotionalMemory = safeInput.emotionalMemory;
    const emotionalState = safeInput.emotionalState;

    const topTheme = safeString(
      (safeArray<any>(emotionalMemory.recurringThemes)[0])?.theme ||
      safeArray<any>(emotionalState.recurringThemes)[0] ||
      identity.lifePathArchetype,
      "Balance"
    );

    const topWound = safeString(
      (safeArray<any>(emotionalMemory.recurringWounds)[0])?.wound ||
      emotionalMemory.nextHealingEdge ||
      identity.arcanaMeaning,
      "the unknown"
    );

    const transit = safeArray<any>(safeInput.astrologyTransits?.activeTransits)[0];
    const transitName = transit
      ? `${safeString(transit.planet)}${transit.sign ? ` in ${safeString(transit.sign)}` : ""}`
      : `${safeString(identity.sunSign, "Cosmic")} integration`;

    const variationThemes = [
      topTheme,
      identity.sunSign,
      identity.lifePathArchetype,
      identity.arcanaMeaning,
    ].filter(t => typeof t === "string" && t.length > 0);

    const transitThemes = safeArray<any>(transit?.themes).length ? safeArray<any>(transit?.themes) : [
      variationThemes[seedHash % variationThemes.length] || topTheme,
      identity.sunSign,
    ].filter(t => typeof t === "string" && t.length > 0);

    if (transitThemes.length === 0) transitThemes.push("Clarity", "Presence");

    const humanDesign = `${safeString(identity.humanDesign)} ${safeString(identity.humanDesignProfile)}`.trim() || "Natural Design";
    const meditationDuration = mood <= 4 ? 8 : 12;
    const innerworkDuration = mood <= 4 ? 10 : 15;
    const totalInnerworkDuration = innerworkDuration + 6 + meditationDuration;

    const physicalSummary = safeArray<any>(safeInput.activityHistory).length > 0
      ? (safeInput.language === "id"
          ? `Kamu telah menyelesaikan ${safeArray<any>(safeInput.activityHistory).length} aktivitas fisik baru-baru ini.`
          : `You have completed ${safeArray<any>(safeInput.activityHistory).length} physical activities recently.`)
      : "";

    const userName = safeString(identity.name, "Soul");

    const soulReflectionText = generateSoulReflection(synthesis, userName, [
      safeInput.user.id,
      seed,
      safeInput.generatedAt.slice(0, 10),
    ].filter(Boolean).join("|"));
    const dailyNoteText = generateDailyNote(synthesis, safeInput, userName);

    return {
      blueprintSummary: synthesis.blueprintSummary,
      soulReflectionText,
      dailyNoteText,

      // V2 Categories Fallback
      categories: {
        general: {
          insight: safeInput.language === "en" ? "Steady energy for reflection." : "Energi yang stabil untuk refleksi.",
          reason: safeInput.language === "en" ? "Based on current Sun and Moon alignment." : "Berdasarkan posisi Matahari dan Bulan hari ini yang selaras dengan jalurnya. Kondisi langit saat ini mencerminkan kebutuhan jiwamu untuk kembali menoleh ke dalam dan mengenali ritme yang sedang berjalan. Interaksi antara blueprint lahirmu dengan transit hari ini menciptakan ruang bagi kesadaran baru untuk muncul secara perlahan.",
          reflection: safeInput.language === "en" ? "What are you grateful for?" : "Apa satu hal yang kamu syukuri dari dirimu hari ini?\nBagaimana perasaanmu saat menyadari bahwa setiap langkahmu memiliki maknanya sendiri?",
          advice: safeInput.language === "en" ? "Stay grounded." : "Ambil waktu sejenak untuk menjejak bumi. Biarkan dirimu merasakan ketenangan di tengah kesibukan harimu. Fokuslah pada hal-hal kecil yang memberimu rasa aman dan nyaman. Jangan biarkan tuntutan luar mengaburkan suara batinmu yang lembut. Hari ini adalah tentang menghargai keberadaanmu tanpa harus membuktikan apa pun. Tarik napas panjang dan lepaskan semua ketegangan yang kamu bawa sejak pagi tadi. Duniamu akan tetap baik-baik saja meski kamu memilih untuk beristirahat sejenak. Berikan perhatian pada bagaimana tubuhmu merespons setiap keputusan kecil yang kamu ambil hari ini. Kamu layak mendapatkan kedamaian yang kamu usahakan sendiri."
        },
        mental: {
          insight: safeInput.language === "en" ? "Focus on clarity." : "Fokus pada kejernihan.",
          reason: safeInput.language === "en" ? "Mercury's current position supporting your path." : "Posisi Merkurius mendukung jalurmu hari ini untuk melihat segalanya lebih jernih. Pikiranmu sedang berada dalam fase yang sangat reseptif terhadap informasi baru yang selaras dengan misi jiwamu. Hubungan antara Merkurius dan planet-planet di blueprintmu membuka gerbang bagi pemahaman yang lebih dalam.",
          reflection: safeInput.language === "en" ? "Is your mind busy?" : "Apakah pikiranmu sedang bising oleh rencana-rencana masa depan?\nApa satu pikiran yang terus berulang dan sebenarnya ingin kamu lepaskan?\nBagaimana jika kamu tidak perlu memiliki semua jawaban sekarang?",
          advice: safeInput.language === "en" ? "Take notes." : "Catat ide-idemu. Jangan biarkan mereka hanya berputar di kepala; beri ruang bagi dirimu untuk menuangkannya ke atas kertas. Menulis akan membantumu melihat pola-pola yang selama ini tersembunyi. Jangan takut untuk mengakui kebingunganmu, karena di sanalah kejernihan akan mulai tumbuh. Berikan dirimu waktu tanpa layar untuk sekadar membiarkan pikiran mengalir dengan tenang. Fokuslah pada satu hal yang benar-benar membutuhkan perhatianmu saat ini. Kamu memiliki kemampuan untuk membedakan mana yang penting dan mana yang hanya kebisingan sementara. Percayalah pada kapasitas intelektualmu yang tajam namun tetap lembut. Hari ini adalah hari yang baik untuk merapikan rencana-rencana kecil yang selama ini tertunda. Kejernihan mental adalah hadiah yang kamu berikan pada dirimu sendiri melalui disiplin harian."
        },
        finance: {
          insight: safeInput.language === "en" ? "Mindful resource management." : "Kelola sumber daya dengan sadar.",
          reason: safeInput.language === "en" ? "Saturn's influence on material stability." : "Pengaruh Saturnus pada stabilitas materi mengingatkanmu untuk membangun fondasi yang kokoh. Dalam hubungannya dengan sektor finansial di blueprintmu, Saturnus mengajakmu untuk melihat kembali bagaimana kamu menghargai hasil kerja kerasmu. Ini adalah saat untuk refleksi mendalam tentang keamanan materimu.",
          reflection: safeInput.language === "en" ? "Are you feeling secure?" : "Bagaimana perasaanmu terhadap rasa aman yang kamu miliki saat ini?\nApakah caramu mengelola sumber daya sudah mencerminkan nilai-nilai jiwamu?\nApa ketakutan terbesar yang masih membayangi keputusan finansialmu?",
          advice: safeInput.language === "en" ? "Review budget." : "Tinjau kembali rencanamu. Beri apresiasi pada setiap langkah kecil yang kamu ambil untuk menjaga stabilitas hidupmu. Pengelolaan yang sadar adalah bentuk cinta pada diri sendiri dan masa depanmu. Jangan terburu-buru melakukan pengeluaran besar tanpa pertimbangan batin yang matang. Lihatlah sumber dayamu sebagai alat untuk mendukung pertumbuhan jiwamu, bukan sekadar angka. Beranilah untuk berkata tidak pada keinginan sesaat yang tidak selaras dengan tujuan jangka panjangmu. Stabilitas tidak dibangun dalam semalam, melainkan melalui pilihan-pilihan kecil yang konsisten setiap hari. Kamu memiliki kemampuan untuk menciptakan kelimpahan yang berkelanjutan melalui kebijaksanaan. Berikan ruang untuk menabung, bukan karena takut kekurangan, melainkan karena menghargai energimu. Hari ini, buatlah satu keputusan finansial yang membuatmu merasa lebih berdaya dan tenang."
        },
        love: {
          insight: safeInput.language === "en" ? "Open heart for connection." : "Buka hati untuk koneksi.",
          reason: safeInput.language === "en" ? "Transit affecting emotional centers." : "Transit memengaruhi pusat emosionalmu, mengajakmu untuk lebih terbuka pada kedekatan. Getaran Venus yang berinteraksi dengan planet-planet cinta di blueprintmu menciptakan nuansa kelembutan yang jarang terjadi. Kondisi psikologis hari ini mendukung proses penyembuhan luka-luka lama dalam hubungan.",
          reflection: safeInput.language === "en" ? "Who matters most?" : "Siapa orang yang paling ingin kamu sapa dengan ketulusan hari ini?\nBagaimana caramu menunjukkan cinta pada dirimu sendiri sebelum memberikannya pada orang lain?\nApakah kamu sudah berani membuka diri untuk menerima kasih sayang yang tulus?",
          advice: safeInput.language === "en" ? "Be honest." : "Bicara jujur dari hati ke hati. Biarkan dirimu terlihat apa adanya di hadapan mereka yang kamu sayangi. Kejujuran adalah jembatan terkuat untuk membangun kedekatan yang bermakna. Jangan takut untuk menunjukkan kerentananmu, karena di sanalah kekuatan cinta yang sebenarnya berada. Berikan apresiasi pada hal-hal kecil yang dilakukan pasangan atau orang terdekatmu. Hari ini adalah waktu untuk merawat benih-benih kasih dengan penuh perhatian dan kelembutan. Jangan biarkan ego menghalangi jalanmu untuk memberikan pengampunan. Cinta yang sejati selalu memberikan ruang untuk bertumbuh dan belajar bersama. Jadikan kehadiranmu sebagai pelabuhan yang aman bagi orang lain. Kamu layak untuk dicintai sepenuhnya, tanpa syarat, dan apa adanya. Biarkan hatimu memandu setiap kata dan tindakanmu hari ini. Kedekatan sejati dimulai dari kesediaan untuk saling mendengarkan tanpa menghakimi."
        },
        relational: {
          insight: safeInput.language === "en" ? "Patience in communication." : "Kesabaran dalam komunikasi.",
          reason: safeInput.language === "en" ? "Social house activity." : "Aktivitas di house sosial kamu mengajakmu untuk lebih peka dalam berinteraksi. Dinamika antara transit hari ini dengan sektor relasi di blueprintmu mungkin memicu beberapa kesalahpahaman kecil jika tidak diatasi dengan kesabaran. Ini adalah momen pembelajaran untuk memperdalam kualitas komunikasimu.",
          reflection: safeInput.language === "en" ? "Are you listening?" : "Apakah kamu sudah benar-benar mendengar pesan di balik kata-kata mereka?\nBagaimana caramu menjaga batas diri tanpa harus menyakiti perasaan orang lain?\nApakah interaksi harianmu hari ini memberimu energi atau justru mengurasnya?",
          advice: safeInput.language === "en" ? "Listen more." : "Lebih banyak mendengar daripada berbicara. Beri ruang bagi orang lain untuk merasa diterima oleh kehadiranmu. Komunikasi yang efektif dimulai dari empati yang mendalam terhadap posisi orang lain. Jangan terburu-buru memberikan tanggapan sebelum kamu benar-benar memahami inti pembicaraan. Gunakan kata-kata yang membangun dan menyejukkan hati. Jaga keharmonisan dengan cara menjadi pendengar yang aktif dan tulus. Jika ada konflik, hadapi dengan kepala dingin dan hati yang lapang. Sadari bahwa setiap orang memiliki perjuangannya masing-masing yang mungkin tidak kamu ketahui. Berikan izin pada dirimu untuk menarik diri sejenak jika interaksi sosial terasa terlalu melelahkan. Hubungan yang sehat membutuhkan keseimbangan antara memberi dan menerima perhatian. Hari ini, cobalah untuk melihat segala sesuatu dari sudut pandang orang lain sebelum mengambil kesimpulan. Kehadiranmu yang tenang adalah hadiah terbesar bagi orang-orang di sekitarmu."
        },
        spiritual: {
          insight: safeInput.language === "en" ? "Inner silence is accessible." : "Hening batin mudah diakses.",
          reason: safeInput.language === "en" ? "Alignment with spiritual path." : "Keselarasan dengan jalur spiritualmu membuat momen hening terasa lebih dalam hari ini. Koneksi antara Neptunus dan pusat spiritual di blueprintmu sedang dalam kondisi yang sangat harmonis. Jiwamu sedang merindukan kepulangan ke sumber kedamaian yang ada di dalam dirimu.",
          reflection: safeInput.language === "en" ? "What is your soul saying?" : "Apa pesan yang ingin disampaikan jiwamu dalam keheningan pagi ini?\nDi bagian mana dari hidupmu kamu merasa paling dekat dengan kehadiran semesta?\nBagaimana caramu merawat percikan cahaya di dalam batinmu hari ini?",
          advice: safeInput.language === "en" ? "Meditation." : "Bermeditasi dengan lembut. Cukup duduk diam dan sadari napasmu sebagai jembatan untuk pulang ke pusat dirimu. Jangan memaksakan hasil dalam praktik spiritualmu; biarkan semuanya mengalir apa adanya. Hening batin adalah ruang di mana jawaban-jawaban sejati seringkali muncul tanpa diminta. Berikan dirimu izin untuk terhubung kembali dengan sumber kekuatan tertinggimu. Gunakan waktu ini untuk mendoakan kebaikan bagi dirimu dan semua makhluk. Sadari bahwa kamu tidak pernah berjalan sendirian dalam perjalanan jiwa ini. Fokuslah pada rasa syukur yang mendalam atas setiap nafas yang kamu hirup. Biarkan kedamaian dari dalam merembes ke setiap aspek kehidupan harianmu. Praktik spiritual tidak harus rumit, ia bisa sesederhana hadir sepenuhnya di saat ini. Temukan keindahan dalam kesunyian dan kekuatan dalam kelembutan batinmu. Hari ini, jadikan momen hening sebagai sauh yang menjagamu tetap stabil di tengah gelombang kehidupan."
        },
        challenges: {
          insight: safeInput.language === "en" ? "Potential for rushing." : "Potensi untuk terburu-buru.",
          reason: safeInput.language === "en" ? "Energy causing impatience." : "Energi planet saat ini mungkin memicu ketidaksabaran dalam langkah-langkah yang kamu ambil. Kondisi ini muncul saat transit Mars atau Merkurius sedang menekan titik sensitif di blueprintmu. Ditambah dengan beban psikologis harian, kamu mungkin merasa waktu selalu kurang dan semua hal harus selesai saat ini juga.",
          reflection: safeInput.language === "en" ? "What are you chasing?" : "Apa yang sebenarnya sedang ingin kamu kejar atau percepat hari ini?\nBagian hidup mana yang sedang meminta kesabaran ekstra darimu?\nApakah keputusan yang kamu buat lahir dari ketenangan atau sekadar reaksi spontan?",
          advice: safeInput.language === "en" ? "Breathe slowly." : "Napas pelan. Ingatkan dirimu bahwa segala sesuatu memiliki waktunya sendiri; kamu tidak perlu berlari untuk sampai ke sana. Ambil waktu sejenak untuk menjejakkan kaki ke bumi dan rasakan kehadiranmu di sini, saat ini. Tidak ada yang lebih mendesak daripada menjaga pusat ketenanganmu. Setiap kali kamu merasa terburu-buru, berhentilah selama sepuluh detik dan ambil napas dalam-dalam. Sadari bahwa ketidaksabaran hanyalah sinyal bahwa kamu sedang mencoba melampaui ritme alamimu. Berikan izin pada dirimu untuk tidak harus menyelesaikan segalanya dalam satu waktu. Fokuslah pada satu langkah kecil yang ada di depan mata dengan penuh perhatian. Dunia tidak akan runtuh hanya karena kamu memilih untuk bergerak lebih lambat dan lebih sadar. Justru dalam kelambatan itulah kamu akan menemukan kejernihan yang selama ini tertutup oleh kebisingan. Percayalah pada proses pertumbuhanmu yang unik dan tidak perlu dibandingkan dengan kecepatan orang lain. Kamu sedang membangun fondasi yang kokoh, dan itu membutuhkan waktu serta ketelatenan yang luar biasa. Hari ini, jadikan ketenangan sebagai prioritas utamamu dalam setiap interaksi dan keputusan."
        },
        opportunities: {
          insight: safeInput.language === "en" ? "Openings for growth." : "Terbukanya peluang pertumbuhan.",
          reason: safeInput.language === "en" ? "Jupiter's expansion alignment." : "Posisi Jupiter hari ini selaras dengan kebutuhan ekspansimu, menciptakan peluang untuk melihat kemungkinan baru di luar batasan lama. Energi ini mendukung keberanian untuk mengambil langkah yang lebih besar jika didasarkan pada pemahaman yang jernih. Semesta sedang memberikan sinyal bahwa arah yang kamu tuju memiliki dukungan yang cukup untuk diwujudkan.",
          reflection: safeInput.language === "en" ? "What is opening up?" : "Peluang apa yang mulai terlihat hari ini?\nDi area mana kamu merasa lebih berani untuk melangkah lebih jauh?",
          advice: safeInput.language === "en" ? "Be ready to act." : "Bersiaplah untuk mengambil tindakan saat kesempatan muncul. Terkadang peluang datang dalam bentuk yang sangat sederhana, seperti percakapan yang tidak terduga atau ide yang tiba-tiba melintas. Jangan biarkan keraguan menghambatmu untuk menyambut kemungkinan baru yang ditawarkan hari ini. Gunakan energi ekspansif ini untuk memperluas pandanganmu tentang apa yang mungkin dicapai. Tetaplah rendah hati namun penuh percaya diri dalam melangkah. Fokuslah pada bagaimana peluang ini bisa membantumu bertumbuh menjadi pribadi yang lebih utuh. Setiap pintu yang terbuka adalah undangan untuk belajar dan bertransformasi lebih dalam lagi. Kamu memiliki kapasitas untuk mengelola tanggung jawab baru yang datang bersama peluang tersebut. Percayalah pada waktunya semesta yang selalu tepat bagi kesiapanmu. Jadikan setiap langkah maju sebagai bentuk rasa syukur atas dukungan yang kamu terima. Teruslah bergerak dengan niat yang murni dan hati yang terbuka."
        },
        advice: {
          insight: safeInput.language === "en" ? "Integrate today's lesson." : "Integrasikan pelajaran hari ini.",
          reason: safeInput.language === "en" ? "Synthesis of current transit and blueprint." : "Sintesis transit dan blueprint saat ini membantumu memahami pola pertumbuhanmu dengan lebih jernih. Pelajaran yang muncul hari ini adalah hasil dari akumulasi pengalaman batinmu yang bertemu dengan energi langit yang mendukung. Ini adalah momen untuk memanen kebijaksanaan dari setiap kejadian harianmu.",
          reflection: safeInput.language === "en" ? "What did you learn?" : "Apa satu hal baru yang ingin kamu pelajari tentang dirimu hari ini?\nBagaimana pelajaran hari ini membantumu menjadi pribadi yang lebih utuh?\nApa yang ingin kamu bawa dari hari ini untuk menguatkan langkahmu esok hari?",
          advice: safeInput.language === "en" ? "Trust your pace." : "Percaya pada ritmemu. Kamu sedang berproses, dan setiap langkah kecil yang kamu ambil adalah bagian berharga dari perjalananmu yang luar biasa. Jangan biarkan keraguan menghapus keyakinanmu akan arah yang sedang kamu tuju. Integrasikan setiap pemahaman baru ke dalam tindakan nyata yang konsisten. Keberanian untuk terus melangkah, meski perlahan, adalah kunci dari transformasi sejati. Berikan apresiasi pada dirimu sendiri atas kesediaan untuk tetap belajar dan bertumbuh. Hari ini telah memberimu petunjuk yang cukup untuk melangkah ke tahap berikutnya. Simpanlah setiap pesan berharga ini di dalam hatimu sebagai pelita. Kamu memiliki semua yang dibutuhkan untuk menavigasi perjalanan ini dengan bijaksana. Jangan tergesa-gesa ingin sampai, nikmatilah setiap jengkal proses yang sedang membentukmu. Kekuatan sejatimu terletak pada kemampuanmu untuk tetap selaras dengan panggilan jiwa di tengah hiruk pikuk dunia. Percayalah, semesta selalu mendukung mereka yang berjalan dengan niat yang tulus dan hati yang jernih."
        }
      },

      soulReflection: {
        dailyMessage: soulReflectionText,
        theme: safeString(transitThemes[0], "Growth"),
        affirmation: safeInput.language === "id"
          ? `Aku melangkah di jalan ${safeString(identity.lifePathArchetype, "unik")} ku dengan kehadiran, kejujuran, dan kasih sayang.`
          : `I meet my ${safeString(identity.lifePathArchetype, "unique")} path with presence, honesty, and care.`,
        warningSign: mood <= 4 ? (safeInput.language === "id" ? "Jika tubuhmu meminta untuk melambat, perlakukan itu sebagai panduan, bukan hambatan." : "If your body asks for slowness, treat that as guidance rather than resistance.") : undefined,
        guidance: safeInput.language === "id"
          ? `Pilih satu tindakan nyata yang mendukung tema ${topTheme} dan biarkan sisanya menjadi opsional.`
          : `Choose one grounded action that supports ${topTheme} and let the rest become optional.`,
        emotionalTone: toneFromMood(mood),
      },
      astroEnergy: {
        currentEnergy: transitName,
        description: safeInput.language === "id"
          ? `${transitName} menekankan tema ${transitThemes.join(", ")} untuk medan batinmu hari ini.`
          : `${transitName} highlights ${transitThemes.join(", ")} for your ${safeString(identity.sunSign, "inner")} field.`,
        emoji: mood <= 4 ? "*" : "+",
        intensity: transit?.intensity || intensityFromMood(mood),
        recommendation: safeInput.language === "id"
          ? `Bekerjalah dengan energi ${safeString(transitThemes[0], "dirimu")} melalui satu praktik tubuh sebelum mencoba memahaminya lewat pikiran.`
          : `Work with ${safeString(transitThemes[0], "your energy")} through one embodied practice before making meaning from it.`,
        affectedAreas: transitThemes,
      },
      dailyInnerwork: {
        tasks: [
          {
            id: `journal-${slug(seed)}-${slug(transitThemes[0])}`,
            task: restart
              ? (safeInput.language === "id" ? "Tulis satu kalimat di jurnal yang membuat kepulangan hari ini terasa mungkin." : "Journal one sentence that makes returning feel possible.")
              : (safeInput.language === "id" ? `Tulis di jurnal tentang bagaimana tema ${safeString(transitThemes[0]) || "hari ini"} muncul dalam harimu.` : `Journal about how ${safeString(transitThemes[0]) || "today"} is showing up.`),
            duration: innerworkDuration,
            category: "journaling",
            emoji: "write",
            purpose: safeInput.language === "id" ? `Mengubah tema ${safeString(transitThemes[0])} menjadi refleksi sadar.` : `To turn ${safeString(transitThemes[0])} into conscious reflection.`,
            instruction: safeInput.language === "id" ? `Tulis tiga kalimat jujur, lalu garis bawahi kalimat yang terasa paling hidup bagi jiwamu.` : `Write three honest sentences, then underline the sentence that feels most alive.`,
            completed: false,
          },
          {
            id: `ground-${slug(seed)}-${slug(identity.humanDesign)}`,
            task: safeInput.language === "id" ? `Murnikan energi ${safeString(identity.humanDesign) || "batinmu"} sebelum memberikan respons.` : `Ground your ${safeString(identity.humanDesign) || "inner"} energy before responding.`,
            duration: 6,
            category: "grounding",
            emoji: "root",
            purpose: safeInput.language === "id" ? "Membiarkan sistem saraf memimpin sebelum pikiran memberikan penjelasan." : "To let the nervous system lead before the mind explains.",
            instruction: safeInput.language === "id" ? "Tempelkan kedua telapak kaki ke lantai, lemaskan rahang, dan bernapaslah sampai bahumu terasa turun dan rileks." : "Place both feet down, soften your jaw, and breathe until your shoulders lower.",
            completed: false,
          },
          {
            id: `meditate-${slug(seed)}-${slug(identity.sunSign)}`,
            task: safeInput.language === "id" ? `Bermeditasi dengan tema tubuh ${safeString(identity.sunSign) || "batinmu"}.` : `Meditate with the ${safeString(identity.sunSign) || "inner"} body theme.`,
            duration: meditationDuration,
            category: "meditation",
            emoji: "still",
            purpose: safeInput.language === "id" ? `Mengintegrasikan energi ${transitName} tanpa memprosesnya secara berlebihan lewat logika.` : `To integrate ${transitName} without overprocessing.`,
            instruction: safeInput.language === "id" ? "Ikuti aliran napas dan sebutkan satu sensasi tubuh pada setiap embusan napasmu." : "Follow the breath and name one sensation on every exhale.",
            completed: false,
          },
        ],
        theme: safeString(transitThemes[0], "Presence"),
        focusArea: safeString(transitThemes[0], "Self"),
        totalDuration: totalInnerworkDuration,
        difficulty: mood <= 4 ? "beginner" : mood >= 8 ? "advanced" : "intermediate",
      },
      journalingPrompt: {
        prompt: restart
          ? (safeInput.language === "id" ? "Apa yang akan membuat awal yang baru hari ini terasa ramah dan tidak berat bagi jiwamu?" : "What would make beginning again feel kind instead of heavy today?")
          : strongCompletion
            ? (safeInput.language === "id" ? `Apa yang diajarkan oleh konsistensi kemarin tentang tema ${safeString(transitThemes[0])} dalam hidupmu?` : `What is yesterday's consistency teaching me about ${safeString(transitThemes[0])}?`)
            : (safeInput.language === "id" ? `Apa yang perlu dipahami oleh dirimu yang paling dalam tentang tema ${safeString(transitThemes[0])} hari ini?` : `What does my ${safeString(identity.lifePathArchetype, "soul")} self need to understand about ${safeString(transitThemes[0])} today?`),
        subPrompts: safeInput.language === "id" ? [
          `Di bagian tubuh mana tema ${topTheme} paling terasa saat ini?`,
          `Apa yang dibutuhkan oleh desain ${humanDesign} mu sebelum kamu mengambil tindakan nyata?`,
          `Seperti apa rasanya dukungan jika kamu berhenti merasa harus terus membuktikannya?`,
        ] : [
          `Where does ${topTheme} live in my body?`,
          `What does my ${humanDesign} design need before taking action?`,
          `What would support look like if I stopped earning it?`,
        ],
        theme: safeString(transitThemes[0], "Reflection"),
        emotionalDepth: mood <= 4 ? "surface" : "medium",
        purpose: `To connect emotional memory with today's blueprint and astrology context.`,
        relatedArea: safeString(transitThemes[0], "Growth"),
      },
      shadowInsight: safeInput.language === "id"
        ? `Tepi bayangan hari ini adalah menganggap tema ${topWound} sebagai bukti bahwa kamu tertinggal. Integrasinya adalah memperlakukannya sebagai sinyal untuk perawatan diri, penyesuaian ritme, dan batas diri yang lebih jelas.`
        : `The shadow edge today is turning ${topWound} into proof that you are behind. The integration is to treat it as a signal for care, pacing, and clearer boundaries.`,
      meditationRecommendation: {
        title: safeInput.language === "id" ? `Penyelarasan ${safeString(identity.sunSign, "Jiwa")} ${safeString(identity.humanDesign, "")}` : `${safeString(identity.sunSign, "Soul")} ${safeString(identity.humanDesign, "")} Reset`,
        duration: meditationDuration,
        type: "grounding",
        focusArea: safeString(transitThemes[0], "Presence"),
        description: safeInput.language === "id" ? `Praktik hening untuk mengintegrasikan energi ${transitName} melalui tubuh.` : `A quiet practice for integrating ${transitName} through the body.`,
        technique: safeInput.language === "id" ? "Pernapasan embusan pelan dengan pemindaian tubuh secara menyeluruh." : "Slow exhale breathing with body scanning",
        energyEffect: mood <= 4 ? "settling" : "centering",
      },
      healingRecommendation: {
        id: `healing-${slug(topTheme)}`,
        type: "somatic",
        title: safeInput.language === "id" ? `Temui tema ${topTheme} melalui tubuhmu` : `Meet ${topTheme} through the body`,
        description: safeInput.language === "id" ? `Praktik singkat untuk membantu tema ${topTheme} berpindah dari tekanan mental menjadi kejernihan yang dirasakan tubuh.` : `A short practice to help ${topTheme} move from mental pressure into embodied clarity.`,
        duration: 10,
        basedOnEmotionalAnalysis: topTheme,
        addressesWound: topWound,
        supportedBy: "emotional memory, blueprint context, and current transit themes",
        instructions: safeInput.language === "id" ? [
          "Sebutkan perasaanmu tanpa menghakiminya sama sekali.",
          "Temukan di mana letak perasaan tersebut di dalam tubuhmu.",
          "Tawarkan satu tindakan dukungan nyata untuk dirimu sendiri hari ini.",
        ] : [
          "Name the feeling without judging it.",
          "Locate the feeling in the body.",
          "Offer one concrete support action today.",
        ],
        tips: safeInput.language === "id" ? [
          "Jaga agar praktik ini tetap kecil dan mudah untuk diselesaikan.",
          "Pilih regulasi emosi sebelum mencoba melakukan interpretasi pikiran.",
        ] : [
          "Keep the practice small enough to complete.",
          "Choose regulation before interpretation.",
        ],
        bestTiming: mood <= 4 ? "immediately" : "today",
        frequency: "once today",
        integratesWithPractice: ["journaling", "grounding", "meditation"],
        supportiveReminder: safeInput.language === "id" ? `Kamu bisa bekerja dengan tema ${topTheme} tanpa harus merasa tertelan olehnya.` : `You can work with ${topTheme} without becoming consumed by it.`,
      },
      healingAudio: {
        title: restart ? (safeInput.language === "id" ? "Alunan Kepulangan yang Lembut" : "Gentle Return Sound bath") : (safeInput.language === "id" ? `Penyelarasan ${safeString(transitThemes[0], "Keseimbangan")}` : `${safeString(transitThemes[0], "Balance")} Attunement`),
        frequency: mood <= 4 ? "396Hz" : "432Hz",
        duration: restart ? 8 : 12,
        purpose: restart
          ? (safeInput.language === "id" ? "Mendukung awal ulang tanpa tekanan setelah hari yang tidak lengkap." : "Support a low-pressure restart after an incomplete day.")
          : (safeInput.language === "id" ? `Mendukung tema ${safeString(transitThemes[0])} dengan grounding sensorik yang stabil.` : `Support ${safeString(transitThemes[0])} with steady sensory grounding.`),
        affinity: safeString(identity.sunSign, "Soul"),
        vibe: mood <= 4 ? "calming" : "balancing",
        artistOrSource: "Bhumi Amartya",
      },
      soulProgress: {
        healingStreak: Number(safeInput.healingProgress.healingStreak) || 0,
        consciousnessLevel: Number(safeInput.healingProgress.consciousnessLevel) || 50,
        totalJournalEntries: Number(safeInput.healingProgress.totalJournalEntries) || 0,
        totalMeditationMinutes: Number(safeInput.healingProgress.totalMeditationMinutes) || 0,
        totalInnerworkSessions: Number(safeInput.healingProgress.totalInnerworkSessions) || 0,
        currentPhase: (Number(safeInput.healingProgress.healingStreak) || 0) > 7 ? "Integration" : "Attunement",
        nextMilestone:
          (Number(safeInput.healingProgress.healingStreak) || 0) > 7
            ? (safeInput.language === "id" ? "Perdalam konsistensi dengan penyempurnaan yang lembut." : "Deepen consistency with gentle refinement")
            : (safeInput.language === "id" ? "Selesaikan ritme tujuh hari dari pemeriksaan diri yang jujur." : "Complete a seven-day rhythm of honest check-ins"),
        progressPercentage: Math.min(100, Math.max(1, Number(safeInput.healingProgress.consciousnessLevel) || 1)),
      },
      reminderState: {
        groundingDone: false,
        journalingDone: false,
        meditationDone: false,
        moodLevel: mood,
        needsSupport: mood <= 4,
        reminderMessage: safeInput.language === "id" ? `Mulailah dengan tema ${safeString(transitThemes[0], "kehadiran")} sebelum menuntut dirimu melakukan lebih banyak.` : `Begin with ${safeString(transitThemes[0], "presence")} before asking yourself to do more.`,
        reminderCategory: mood <= 4 ? "grounding" : "journaling",
      },
      manifestation: generateLocalManifestation(safeInput, "ai_missing"),
    };
  } catch (err) {
    console.error("[LOCAL_DG_FALLBACK_INTERNAL_ERROR]", err);
    throw err;
  }
}
