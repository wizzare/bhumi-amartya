function hashKey(v: string): number {
  let h = 0;
  for (let i = 0; i < v.length; i++) h = ((h << 5) - h + v.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pick<T>(items: T[], key: string): T {
  return items[hashKey(key) % items.length];
}

// Sentence-level components keyed by (letterType_role_themeId)
const PAST_SENTENCES: Record<string, string[]> = {
  "p1_recurring-patterns": [
    "Kamu mungkin tidak menyadari kapan pola itu mulai terbentuk, tetapi ia menetap diam-diam dalam keseharianmu.",
    "Ada ritme tertentu yang kamu ulang tanpa sadar dan itu bukan kebiasaan melainkan cara dirimu menjaga diri.",
  ],
  "p1_emotional-wounds": [
    "Aku tahu ada bagian dirimu yang belajar menahan rasa sakit tanpa banyak bicara.",
    "Kamu terbiasa menyimpan luka tanpa pernah benar-benar membiarkannya sembuh.",
  ],
  "p1_inner-child": [
    "Ada bagian kecil dari dirimu yang dulu hanya ingin didengar dan diterima tanpa syarat.",
    "Di dalam dirimu masih hidup suara kecil yang dulu belajar diam agar tidak menjadi beban.",
  ],
  "p1_default": [
    "Aku tahu ada masa-masa ketika kamu merasa harus berjalan sendiri tanpa banyak dukungan.",
    "Kamu telah melalui banyak hal yang tidak selalu terlihat oleh orang di sekitarmu.",
  ],
  "p2_emotional-wounds": [
    "Luka yang kamu bawa bukan karena kamu lemah melainkan karena kamu terlalu terbuka pada dunia yang belum siap menerimamu.",
    "Kamu terbiasa menahan air mata bukan karena tidak ingin menangis tetapi karena tidak yakin ada yang akan menampungnya.",
  ],
  "p2_self-sabotage": [
    "Kamu belajar menarik diri sebelum ditolak dan itu adalah caramu melindungi hati yang terlalu peka.",
    "Kebiasaanmu meragukan diri sendiri bukanlah kegagalan melainkan bentuk kewaspadaan yang dulu pernah menyelamatkanmu.",
  ],
  "p2_recurring-patterns": [
    "Pola yang sama terus muncul bukan karena kamu tidak belajar melainkan karena ada bagian dirimu yang masih mencari penyelesaian.",
    "Kebaikanmu yang berlebihan adalah caramu bertahan untuk diterima dan itu melelahkan.",
  ],
  "p2_default": [
    "Ada banyak hal yang kamu pendam tanpa pernah diucapkan dan itu bukan karena kamu tidak ingin berbagi.",
    "Kamu menyimpan begitu banyak beban yang seharusnya tidak perlu kamu tanggung sendirian.",
  ],
  "p3_self-sabotage": [
    "Kamu mengatur jarak bukan karena tidak peduli melainkan karena kamu tahu betapa sakitnya ketika kehilangan.",
    "Cara kamu melindungi diri adalah dengan tidak berharap terlalu banyak dan itu masuk akal mengingat apa yang pernah terjadi.",
  ],
  "p3_recurring-patterns": [
    "Pola yang kamu ulang selama ini adalah caramu menciptakan rasa aman di tengah ketidakpastian yang pernah kamu alami.",
    "Kebiasaanmu mengendalikan hal-hal kecil adalah usahamu untuk merasa bahwa ada sesuatu yang bisa kamu pegang.",
  ],
  "p3_default": [
    "Kamu membangun tembok bukan karena kamu tidak ingin dekat dengan orang lain tetapi karena kamu belajar bahwa diam lebih aman.",
    "Cara kamu bertahan mungkin tidak sempurna tetapi ia lahir dari kebutuhan yang nyata pada saat itu.",
  ],
  "p4_healing": [
    "Kamu tidak harus menyembuhkan semuanya sekaligus karena beberapa luka hanya perlu dirawat bukan dipaksakan sembuh.",
    "Penyembuhan tidak berarti melupakan apa yang terjadi tetapi memilih untuk tidak lagi membiarkannya mengendalikan dirimu.",
  ],
  "p4_forgiveness": [
    "Memaafkan bukan berarti membenarkan apa yang terjadi melainkan memilih untuk tidak terus membawa beban yang bukan milikmu.",
    "Kamu diizinkan untuk berhenti menyalahkan dirimu sendiri atas hal-hal yang dulu tidak bisa kamu kendalikan.",
  ],
  "p4_default": [
    "Dari tempatku sekarang aku melihat bahwa yang kamu butuhkan bukanlah menjadi lebih kuat melainkan lebih lembut pada dirimu sendiri.",
    "Kamu layak mendapatkan ketenangan yang selama ini kamu berikan pada orang lain tetapi tidak pernah kamu berikan pada dirimu.",
  ],
  "p5_returning-to-self": [
    "Kamu telah berjalan sejauh ini dengan kekuatan yang mungkin tidak pernah kamu sadari dan itu adalah bukti bahwa kamu mampu.",
    "Yang dulu terasa sebagai kehilangan kini perlahan berubah menjadi pemahaman bahwa kamu tidak perlu menjadi sempurna untuk layak dicintai.",
  ],
  "p5_growth": [
    "Pertumbuhanmu tidak selalu terlihat dari luar tetapi dari dalam kamu bisa merasakan bahwa ada yang mulai bergeser ke arah yang lebih jujur.",
    "Kamu mulai memahami bahwa bertahan bukanlah satu-satunya bentuk kekuatan karena melepaskan juga membutuhkan keberanian yang besar.",
  ],
  "p5_default": [
    "Terima kasih karena tidak menyerah meskipun tidak ada yang menjamin bahwa semua akan baik-baik saja.",
    "Aku bangga padamu bukan karena hasil yang kamu capai tetapi karena kamu terus memilih untuk bangkit setiap kali jatuh.",
  ],
};

const FUTURE_SENTENCES: Record<string, string[]> = {
  "p1_recurring-patterns": [
    "Pola yang dulu terasa seperti tembok tinggi perlahan akan memperlihatkan bahwa ia hanyalah bayangan dari ketakutan lama.",
    "Suatu saat kamu akan melihat bahwa kebiasaan lama yang kamu pikir tidak bisa berubah mulai kehilangan dayanya.",
    "Perlahan kamu akan menyadari bahwa apa yang dulu terasa seperti penghalang kini mulai memberi ruang untuk bernapas.",
  ],
  "p1_healing": [
    "Dari tempat yang lebih tenang aku bisa melihat bahwa apa yang kamu alami sekarang sedang mempersiapkanmu untuk sesuatu yang lebih utuh.",
    "Perjalanan yang kamu tempuh saat ini sedang membentuk ketangguhan yang tidak bisa kamu lihat sekarang tetapi akan terasa kelak.",
    "Aku bisa melihat bahwa yang kamu lalui saat ini sedang membuka jalan menuju cara hidup yang lebih jujur dan selaras.",
  ],
  "p1_default": [
    "Aku menulis dari masa depan yang lebih lapang untuk memberitahumu bahwa apa yang kamu rasakan saat ini bukanlah tujuan akhir.",
    "Halo dari sisi lain dari apa yang saat ini terasa berat. Aku ingin kamu tahu bahwa perjalanan ini masih terus berlanjut.",
    "Dari waktu yang lebih jauh aku mengirimkan pesan ini untuk mengingatkanmu bahwa kamu masih terus bertumbuh.",
  ],
  "p2_emotional-wounds": [
    "Kekhawatiran yang kamu bawa saat ini bukanlah tanda bahwa kamu lemah melainkan bukti bahwa kamu peduli pada sesuatu yang berharga.",
    "Ketakutan yang kamu rasakan adalah bagian dari prosesmu untuk tumbuh dan ia tidak akan menetap selamanya.",
    "Rasa sakit yang kamu bawa saat ini kelak akan menjadi salah satu sumber kekuatan terbesarmu.",
  ],
  "p2_self-sabotage": [
    "Kebiasaan meragukan diri sendiri akan mulai kehilangan kekuatannya ketika kamu berhenti mencari validasi dari luar.",
    "Di suatu titik kamu akan menyadari bahwa penundaanmu bukan karena malas melainkan karena kamu terlalu ingin melakukan semuanya dengan benar.",
    "Pola menghindar yang kamu lakukan adalah caramu menjaga diri dan suatu saat kamu akan belajar bahwa kamu tidak perlu terus waspada.",
  ],
  "p2_recurring-patterns": [
    "Pola yang berulang bukanlah hukuman melainkan pelajaran yang akan terus muncul sampai kamu benar-benar memaknainya.",
    "Ketegangan yang kamu rasakan sekarang adalah sisa dari pola yang dulu membantumu bertahan dan kini sedang belajar untuk berubah.",
    "Kebiasaan lama yang terus muncul adalah cara dirimu dulu bertahan dan kini tidak lagi diperlukan seperti dulu.",
  ],
  "p2_default": [
    "Apa yang kamu rasakan saat ini adalah bagian dari musim yang akan berganti meskipun terasa berat untuk dipercaya sekarang.",
    "Kekhawatiranmu tentang masa depan adalah tanda bahwa kamu peduli dan rasa peduli itu tidak akan sia-sia.",
    "Beban yang kamu rasakan saat ini bukanlah keadaan tetap karena setiap musim pasti berganti seiring waktu.",
  ],
  "p3_healing": [
    "Pada suatu titik kamu akan menyadari bahwa apa yang paling kamu takutkan tidak terjadi seburuk yang kamu bayangkan selama ini.",
    "Perubahan tidak datang seperti ledakan melainkan seperti air yang meresap perlahan ke dalam tanah yang kering.",
    "Penyembuhan tidak selalu terasa seperti kemajuan tetapi setiap jeda dan istirahat adalah bagian dari proses yang diperlukan.",
  ],
  "p3_recurring-patterns": [
    "Yang berubah bukanlah siapa dirimu melainkan cara kamu berhubungan dengan dirimu sendiri dengan lebih lembut dan jujur.",
    "Pola lama akan mulai terasa asing ketika kamu berhenti memberinya energi dengan kekhawatiran yang sama.",
    "Kebiasaan yang dulu terasa seperti perlindungan perlahan kehilangan daya tariknya ketika kamu menemukan cara baru yang lebih sehat.",
  ],
  "p3_default": [
    "Pintu yang dulu terasa tertutup rapat mulai terbuka bukan karena kamu mendobraknya melainkan karena kamu belajar mengetuk dengan cara yang berbeda.",
    "Perlahan kamu akan menyadari bahwa banyak dari apa yang kamu khawatirkan tidak pernah terjadi.",
    "Kamu akan melihat bahwa apa yang dulu terasa seperti jalan buntu hanyalah tikungan yang membutuhkan waktu untuk dilalui.",
  ],
  "p4_growth": [
    "Kekuatanmu tidak lagi diukur dari seberapa banyak yang bisa kamu tanggung melainkan dari seberapa sadar kamu memilih mana yang perlu dirawat.",
    "Kedewasaan tidak datang dari kemampuan menahan segalanya melainkan dari keberanian menetapkan batas yang sehat.",
    "Pertumbuhan sejati terjadi ketika kamu berhenti berlari dari dirimu sendiri dan mulai mendengarkan apa yang sebenarnya kamu butuhkan.",
  ],
  "p4_boundaries": [
    "Kamu akan belajar bahwa mengatakan tidak bukanlah bentuk keegoisan melainkan wujud cinta pada dirimu sendiri.",
    "Batas yang kamu tegakkan bukanlah tembok pemisah melainkan pintu yang hanya terbuka untuk hal-hal yang menghormati dirimu.",
    "Kemampuanmu untuk memilih dengan sadar akan menjadi salah satu pencapaian terbesar dalam perjalananmu.",
  ],
  "p4_default": [
    "Pertumbuhan yang paling berarti tidak datang dari pencapaian besar melainkan dari cara kamu merawat dirimu dalam hal-hal kecil.",
    "Suatu saat kamu akan berterima kasih pada dirimu yang sekarang karena tidak menyerah meskipun hasilnya belum terlihat.",
    "Yang pada akhirnya berarti bukanlah seberapa cepat kamu berubah melainkan seberapa tulus kamu menjalani setiap prosesnya.",
  ],
  "p5_future-direction": [
    "Langkah kecil yang kamu ambil hari ini lebih berharga daripada rencana besar yang tidak pernah kamu mulai.",
    "Arah yang paling jernih bukanlah rencana sempurna melainkan keberanian untuk melangkah meskipun jalannya belum sepenuhnya terlihat.",
    "Konsistensi dalam hal-hal sederhana akan membawamu lebih jauh daripada perubahan besar yang tidak berkelanjutan.",
  ],
  "p5_returning-to-self": [
    "Yang kamu cari selama ini bukanlah versi terbaik dari dirimu melainkan izin untuk menjadi dirimu yang paling nyata.",
    "Kedamaian yang kamu cari tidak datang dari luar melainkan dari keputusan untuk berhenti mengejar validasi yang tidak pernah kamu butuhkan.",
    "Kembali pada dirimu sendiri bukanlah kemunduran melainkan keberanian untuk memilih apa yang benar-benar sesuai dengan kebutuhanmu.",
  ],
  "p5_default": [
    "Kamu tidak perlu memiliki semua jawaban sekarang karena yang terpenting adalah kamu terus bertanya dengan hati yang terbuka.",
    "Tidak ada satu keputusan pun yang akan menentukan segalanya karena kamu diizinkan untuk berubah kapan saja.",
    "Semua yang kamu alami adalah bagian dari perjalanan yang perlahan membentukmu menjadi dirimu yang paling utuh.",
  ],
};

const CONTINUITY_BRIDGES: string[] = [
  "Karena itu, sekarang aku bisa melihat pengalaman tersebut dengan lebih jernih.",
  "Dari situlah, aku mulai memahami bahwa caramu bertahan memiliki alasan.",
  "Perlahan, aku menyadari bahwa semua itu bukan tanpa makna.",
  "Seiring waktu, aku mengerti bahwa dirimu hanya sedang berusaha merasa aman.",
  "Yang dulu tidak kupahami kini mulai terlihat lebih jelas.",
  "Aku tidak langsung menyadarinya, tetapi sekarang aku tahu bahwa kamu sudah melakukan yang terbaik.",
  "Semua itu membawaku pada pemahaman yang lebih lembut tentang dirimu.",
];

const PAST_CLOSING_SENTENCES: string[] = [
  "Aku berterima kasih karena kamu tidak berhenti meskipun jalannya terasa panjang dan sepi.",
  "Dari tempatku sekarang, aku ingin kamu tahu bahwa semua yang kamu lalui berarti.",
  "Kamu tidak perlu lagi menjadi kuat sendirian karena aku di sini untuk melanjutkan apa yang dulu kamu mulai.",
  "Tidak peduli seberapa jauh kamu merasa tersesat saat itu, kamu tetap menemukan jalan untuk sampai ke sini.",
];

const FUTURE_CLOSING_SENTENCES: string[] = [
  "Teruslah melangkah dengan hati yang jujur karena aku tahu bahwa kamu bisa melewati ini.",
  "Aku menunggumu di sisi lain dengan kehangatan yang tidak perlu kamu buktikan apa pun.",
  "Pada akhirnya yang tertinggal bukanlah luka melainkan kebijaksanaan yang lahir dari cara kamu merawatnya.",
  "Kamu tidak perlu terburu-buru karena yang penting adalah kamu tidak berhenti berjalan dengan hati yang jujur.",
];

const PAST_FILLER_SENTENCES: string[] = [
  "Saat itu kamu belum memiliki semua kata untuk menjelaskan apa yang terjadi di dalam dirimu.",
  "Meski begitu, kamu tetap mencari cara untuk bangun dan menjalani hari berikutnya.",
  "Tidak semua pilihanmu sempurna, tetapi semuanya lahir dari kemampuan yang kamu miliki saat itu.",
  "Ada keberanian yang bekerja diam-diam setiap kali kamu memilih untuk tidak menyerah.",
  "Hari ini aku bisa memandang semua itu tanpa menyalahkan bagian dirimu yang sedang bertahan.",
  "Aku ingin memeluk ketakutanmu tanpa meminta kamu segera menjadi lebih kuat.",
  "Apa yang dulu terasa memalukan kini terlihat sebagai usaha tulus untuk menjaga hatimu.",
  "Kamu pantas menerima kelembutan yang saat itu belum mampu kamu berikan kepada dirimu sendiri.",
];

const FUTURE_FILLER_SENTENCES: string[] = [
  "Perubahan itu bertumbuh melalui pilihan kecil yang terus kamu rawat dengan sabar.",
  "Tidak semua hari akan terasa mudah, tetapi kamu semakin mampu kembali pada pusat dirimu.",
  "Kamu mulai mempercayai suaramu sendiri tanpa harus menunggu persetujuan dari semua orang.",
  "Ruang yang kini kamu ciptakan membuat hidup terasa lebih jujur dan lebih lapang.",
  "Setiap batas yang sehat membantumu menjaga tenaga untuk hal yang sungguh berarti.",
  "Kamu akan mengenali kemajuan dari ketenanganmu, bukan hanya dari hasil yang terlihat.",
  "Ada kelembutan baru dalam caramu menghadapi kesalahan dan ketidakpastian.",
  "Pelan-pelan kamu memahami bahwa pulang pada diri sendiri adalah praktik yang dijalani setiap hari.",
];

export function composePastSelfParagraphs(
  themes: { themeId: string; emotionalDirection: string; coverageStatus: string }[],
  sig: string,
): string[][] {
  const roleThemes: Array<[number, string[], string]> = [
    [0, ["p1_recurring-patterns", "p1_emotional-wounds", "p1_inner-child", "p1_default"], "recognition"],
    [1, ["p2_emotional-wounds", "p2_self-sabotage", "p2_recurring-patterns", "p2_default"], "endured"],
    [2, ["p3_self-sabotage", "p3_recurring-patterns", "p3_default"], "protection"],
    [3, ["p4_healing", "p4_forgiveness", "p4_default"], "reframing"],
    [4, ["p5_returning-to-self", "p5_growth", "p5_default"], "closing"],
  ];

  return composeLetter(PAST_SENTENCES, PAST_CLOSING_SENTENCES, PAST_FILLER_SENTENCES, CONTINUITY_BRIDGES, themes, sig, roleThemes);
}

export function composeFutureSelfParagraphs(
  themes: { themeId: string; emotionalDirection: string; coverageStatus: string }[],
  sig: string,
): string[][] {
  const roleThemes: Array<[number, string[], string]> = [
    [0, ["p1_recurring-patterns", "p1_healing", "p1_default"], "greeting"],
    [1, ["p2_emotional-wounds", "p2_self-sabotage", "p2_recurring-patterns", "p2_default"], "struggle"],
    [2, ["p3_healing", "p3_recurring-patterns", "p3_default"], "change"],
    [3, ["p4_growth", "p4_boundaries", "p4_default"], "shift"],
    [4, ["p5_future-direction", "p5_returning-to-self", "p5_default"], "direction"],
  ];

  return composeLetter(FUTURE_SENTENCES, FUTURE_CLOSING_SENTENCES, FUTURE_FILLER_SENTENCES, CONTINUITY_BRIDGES, themes, sig, roleThemes);
}

function composeLetter(
  pool: Record<string, string[]>,
  closings: string[],
  fillers: string[],
  bridges: string[],
  themes: { themeId: string; emotionalDirection: string; coverageStatus: string }[],
  sig: string,
  roleThemes: Array<[number, string[], string]>,
): string[][] {
  const usedTemplates = new Set<string>();
  const paragraphs: string[][] = [];

  for (const [slotIdx, keys] of roleThemes) {
    if (paragraphs.length >= 6) break;

    const themeIds = themes.filter(t => t.coverageStatus !== "limited").map(t => t.themeId);

    let selectedKey = keys[keys.length - 1];
    for (const key of keys) {
      const parts = key.split("_");
      const themeKey = parts.slice(1).join("_");
      if (themeIds.includes(themeKey.replace(/-/g, ""))) {
        selectedKey = key;
        break;
      }
    }

    const sentencePool = pool[selectedKey];
    if (!sentencePool) continue;

    const sentences: string[] = [];
    const key0 = `${selectedKey}-${sig}-${slotIdx}-0`;
    const s0 = pick(sentencePool, key0);
    const tid0 = `s-${slotIdx}-${hashKey(s0)}`;
    if (!usedTemplates.has(tid0)) {
      usedTemplates.add(tid0);
      sentences.push(s0);
    }

    if (sentencePool.length > 1) {
      const key1 = `${selectedKey}-${sig}-${slotIdx}-1`;
      const s1 = pick(sentencePool.filter(s => hashKey(s) % 101 !== hashKey(s0) % 101), key1);
      const tid1 = `s-${slotIdx}-${hashKey(s1)}`;
      if (!usedTemplates.has(tid1) && s0 !== s1) {
        usedTemplates.add(tid1);
        sentences.push(s1);
      }
    }

    if (paragraphs.length > 0 && slotIdx > 0 && slotIdx < 4) {
      const bridge = pick(bridges, `${sig}-bridge-${slotIdx}`);
      const btid = `b-${slotIdx}-${hashKey(bridge)}`;
      if (!usedTemplates.has(btid)) {
        usedTemplates.add(btid);
        sentences.unshift(bridge);
      }
    }

    if (slotIdx === 4) {
      const closing = pick(closings, `${sig}-close-${slotIdx}`);
      const ctid = `c-${slotIdx}-${hashKey(closing)}`;
      if (!usedTemplates.has(ctid)) {
        usedTemplates.add(ctid);
        sentences.push(closing);
      }
    }

    while (sentences.length < 4) {
      const availableFillers = fillers.filter(
        (candidate) => !usedTemplates.has(`f-${hashKey(candidate)}`),
      );
      if (availableFillers.length === 0) break;
      const filler = pick(availableFillers, `${sig}-filler-${slotIdx}-${sentences.length}`);
      usedTemplates.add(`f-${hashKey(filler)}`);
      sentences.push(filler);
    }

    if (sentences.length >= 4 && sentences.length <= 5) {
      paragraphs.push(sentences);
    }
  }

  return paragraphs;
}
