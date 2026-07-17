import type { ZiWeiPalace, ZiWeiResult, ZiWeiTransformation } from "./types";

export type ZiWeiSnapshot = { label: string; value: string };

export type ZiWeiSection = {
  id: string;
  title: string;
  snapshot: ZiWeiSnapshot[];
  humanMeaning: string[];
  strength?: string;
  challenge?: string;
  growthDirection?: string;
};

export type ZiWeiPresentation = {
  status: ZiWeiResult["status"];
  hero: { title: string; facts: ZiWeiSnapshot[]; insight: string };
  identity: ZiWeiSection[];
  palaceSections: ZiWeiSection[];
  themeSections: ZiWeiSection[];
  summary: string[];
  notices: string[];
};

const PALACE_CONTEXT: Record<string, { opening: string; focus: string; strength: string; challenge: string; growth: string }> = {
  soul: {
    opening: "Cara kamu memasuki kehidupan terlihat dari keberanian mengambil posisi saat keadaan belum sepenuhnya jelas.",
    focus: "identitas, pilihan pribadi, dan cara membangun arah",
    strength: "Kamu mampu menjadi pusat ketenangan ketika keputusan perlu dibuat dengan jernih.",
    challenge: "Yang perlu dijaga adalah dorongan untuk memegang terlalu banyak kendali ketika situasi terasa tidak pasti.",
    growth: "Kematangan tumbuh saat ketegasan berjalan bersama keluwesan dan kesediaan menerima masukan.",
  },
  parents: {
    opening: "Hubungan dengan asal-usul membentuk caramu memahami dukungan, otoritas, dan rasa diterima.",
    focus: "hubungan dengan orang tua, mentor, dan nilai yang diwariskan",
    strength: "Kamu dapat menyaring warisan keluarga menjadi prinsip yang benar-benar berguna untuk hidupmu.",
    challenge: "Harapan lama mudah terasa seperti kewajiban pribadi yang harus selalu dipenuhi.",
    growth: "Berikan tempat bagi rasa hormat tanpa menyerahkan hakmu untuk menentukan jalan sendiri.",
  },
  spirit: {
    opening: "Kehidupan batinmu pulih ketika ada ruang tenang untuk memahami pengalaman, bukan sekadar melewatinya.",
    focus: "ketenteraman, perenungan, makna, dan sumber daya batin",
    strength: "Kamu memiliki kemampuan menemukan makna setelah melewati keadaan yang rumit.",
    challenge: "Pikiran dapat terus bekerja bahkan ketika tubuh dan emosi membutuhkan jeda.",
    growth: "Bangun ritme hening yang sederhana agar pemahaman tidak berubah menjadi beban mental.",
  },
  property: {
    opening: "Ketika menyangkut rumah dan rasa aman, kamu membutuhkan fondasi yang dapat diandalkan sekaligus cukup lentur untuk berubah.",
    focus: "rumah, kepemilikan, akar, dan ruang hidup",
    strength: "Kamu mampu menciptakan lingkungan yang terasa teratur dan mendukung kehidupan sehari-hari.",
    challenge: "Rasa aman dapat terlalu mudah dikaitkan dengan kepemilikan atau keadaan yang tidak berubah.",
    growth: "Rawat fondasi yang stabil tanpa menjadikannya alasan untuk menolak perkembangan.",
  },
  career: {
    opening: "Di ruang kerja, kamu paling hidup ketika tanggung jawab memiliki arah dan dampak yang nyata.",
    focus: "kontribusi, tanggung jawab, kepemimpinan, dan peran publik",
    strength: "Kamu dapat melihat apa yang perlu ditata dan menggerakkan orang menuju hasil bersama.",
    challenge: "Beban kerja mudah menjadi ukuran harga diri ketika pengakuan terasa lambat datang.",
    growth: "Pisahkan nilai dirimu dari hasil kerja, lalu gunakan kepemimpinan untuk membangun kapasitas bersama.",
  },
  friends: {
    opening: "Peran sosialmu berkembang melalui orang-orang yang dapat bertukar gagasan, dukungan, dan tanggung jawab secara setara.",
    focus: "pertemanan, jejaring, kolaborator, dan dukungan sosial",
    strength: "Kamu peka melihat siapa yang dapat dipercaya untuk berjalan bersama dalam jangka panjang.",
    challenge: "Kekecewaan muncul ketika hubungan terasa hanya bergerak satu arah.",
    growth: "Bangun kolaborasi dengan ekspektasi yang dibicarakan sejak awal, bukan diasumsikan.",
  },
  surface: {
    opening: "Di luar lingkungan yang familiar, kemampuanmu membaca keadaan menjadi lebih tajam dan praktis.",
    focus: "mobilitas, dunia luar, perjumpaan baru, dan adaptasi",
    strength: "Perubahan tempat atau lingkungan dapat membuka sudut pandang yang sebelumnya tidak terlihat.",
    challenge: "Terlalu banyak rangsangan baru dapat membuat perhatianmu tersebar.",
    growth: "Pilih pengalaman luar yang memperluas hidup tanpa memutus hubungan dengan kebutuhan batin.",
  },
  health: {
    opening: "Saat berada dalam tekanan, keseimbanganmu sangat dipengaruhi oleh ritme, beban emosi, dan kualitas jeda sehari-hari.",
    focus: "respons terhadap stres, pengelolaan tenaga, istirahat, dan kesadaran tubuh",
    strength: "Kamu dapat mengenali perubahan kapasitas ketika memberi perhatian pada sinyal kecil dalam rutinitas.",
    challenge: "Kecenderungan terus bertahan dapat membuat kebutuhan istirahat baru disadari setelah tenaga menurun.",
    growth: "Jadikan jeda, gerak, dan batas beban sebagai bagian dari ritme hidup, bukan tindakan darurat.",
  },
  wealth: {
    opening: "Cara kamu mengelola sumber daya berhubungan erat dengan kebutuhan akan kemandirian dan rasa aman yang nyata.",
    focus: "penghasilan, pengeluaran, nilai, keamanan, dan cara menciptakan manfaat",
    strength: "Kamu mampu mengubah tanggung jawab dan keahlian menjadi nilai yang dapat dirasakan orang lain.",
    challenge: "Keinginan menjaga keamanan dapat berubah menjadi kontrol berlebihan atau sulit menikmati hasil.",
    growth: "Bangun sumber daya melalui keputusan konsisten sambil tetap memberi ruang untuk penyesuaian.",
  },
  children: {
    opening: "Kreativitasmu membutuhkan ruang untuk tumbuh, diuji, dan akhirnya memiliki bentuk yang dapat dibagikan.",
    focus: "kreativitas, pengasuhan, karya yang dilahirkan, dan keberlanjutan",
    strength: "Kamu mampu memberi perhatian pada sesuatu sampai potensi awalnya menjadi lebih matang.",
    challenge: "Harapan tinggi dapat membuat proses kreatif terasa seperti tanggung jawab yang berat.",
    growth: "Biarkan pertumbuhan berlangsung bertahap dan hargai proses, bukan hanya hasil akhirnya.",
  },
  spouse: {
    opening: "Dalam hubungan dekat, kamu membutuhkan kejujuran, ruang bernapas, dan pasangan yang bersedia bertumbuh bersama.",
    focus: "kedekatan, komitmen, ekspektasi, proyeksi, dan batas relasional",
    strength: "Kamu dapat membangun hubungan yang hangat ketika kebutuhan dan tanggung jawab dibicarakan secara terbuka.",
    challenge: "Keinginan menjaga kedekatan dapat membuat batas pribadi menjadi kurang jelas.",
    growth: "Belajar membedakan dukungan dari penyelamatan agar hubungan tetap setara.",
  },
  siblings: {
    opening: "Dalam relasi yang setara, kamu belajar berbagi ruang tanpa kehilangan suara dan arah pribadi.",
    focus: "saudara, rekan sebaya, perbandingan, dan kerja sama sehari-hari",
    strength: "Kamu dapat menjadi penghubung ketika orang-orang membawa kebutuhan yang berbeda.",
    challenge: "Perbandingan diam-diam mudah mengganggu rasa cukup atau memicu kompetisi yang tidak perlu.",
    growth: "Gunakan perbedaan sebagai sumber perspektif, bukan ukuran nilai diri.",
  },
};

const STAR_ACTION: Record<string, string> = {
  "Zi Wei": "mengambil tanggung jawab dan mencari arah yang dapat menyatukan banyak kepentingan",
  "Tian Ji": "membaca perubahan dengan cepat sebelum memilih langkah berikutnya",
  "Tai Yang": "memberi tenaga pada orang lain dan berani hadir secara terbuka",
  "Wu Qu": "menata sumber daya dengan tegas serta berorientasi pada hasil",
  "Tian Tong": "mencari jalan yang lebih damai tanpa kehilangan kebutuhan pribadi",
  "Lian Zhen": "menguji batas dan integritas sebelum benar-benar mempercayai sebuah arah",
  "Tian Fu": "menjaga kestabilan melalui pengelolaan yang sabar",
  "Tai Yin": "mengamati dengan dalam dan memproses pengalaman secara pribadi",
  "Tan Lang": "menjelajahi pengalaman baru untuk menemukan apa yang benar-benar bermakna",
  "Ju Men": "memeriksa hal yang belum terucap dan mengajukan pertanyaan penting",
  "Tian Xiang": "menimbang kebutuhan banyak pihak sebelum mengambil posisi",
  "Tian Liang": "bertahan pada prinsip sambil melindungi hal yang dianggap bernilai",
  "Qi Sha": "bertindak tegas ketika perubahan tidak lagi dapat ditunda",
  "Po Jun": "membongkar pola lama agar ruang baru dapat dibangun",
};

const SUPPORT_ROLES: Record<string, string> = {
  "Zuo Fu": "social support", "You Bi": "social support", "Tian Kui": "social support", "Tian Yue": "social support",
  "Wen Chang": "communication", "Wen Qu": "communication", "Qing Yang": "pressure", "Tuo Luo": "pressure",
  "Di Kong": "solitude", "Di Jie": "disruption", "Huo Xing": "pressure", "Ling Xing": "sensitivity",
  "Lu Cun": "discipline", "Tian Ma": "mobility",
};

const BUREAU_RHYTHM: Record<string, string[]> = {
  "water 2nd": [
    "Perkembanganmu bergerak seperti air: cepat membaca celah, menyesuaikan arah, lalu mencari jalur yang paling mungkin dilalui.",
    "Kemajuan tidak selalu tampak lurus, tetapi kemampuan beradaptasi membuatmu dapat bertahan ketika keadaan berubah. Yang perlu dijaga adalah berpindah arah terlalu cepat sebelum sebuah proses sempat berakar.",
  ],
  "wood 3rd": [
    "Pertumbuhanmu bersifat bertahap dan hidup; satu pengalaman menjadi akar bagi perkembangan berikutnya.",
    "Kamu membutuhkan ruang untuk belajar, mencoba, dan memperluas kapasitas secara alami. Kesabaran menjadi penting karena hasil terbaik muncul ketika fondasi dirawat, bukan dipaksa matang terlalu cepat.",
  ],
  "metal 4th": [
    "Perkembanganmu menjadi kuat melalui penyaringan: memahami apa yang penting, menata batas, lalu mengasah kemampuan sampai dapat diandalkan.",
    "Kemajuan cenderung berlapis dan membutuhkan standar yang jelas. Ketelitian adalah kekuatan, tetapi pertumbuhan menjadi lebih sehat ketika standar tidak berubah menjadi kekerasan terhadap diri sendiri.",
  ],
  "earth 5th": [
    "Perkembanganmu meminta fondasi yang kokoh, kesabaran, dan kesediaan membangun sedikit demi sedikit.",
    "Kamu biasanya bertumbuh paling baik saat dapat melihat kegunaan nyata dari sebuah proses. Yang perlu dijaga adalah bertahan pada struktur lama hanya karena sudah terasa aman.",
  ],
  "fire 6th": [
    "Perkembanganmu bergerak melalui fase intens yang menyalakan keberanian, visibilitas, dan keinginan untuk memberi dampak.",
    "Momentum dapat membawamu maju dengan cepat, lalu meminta masa pemulihan dan integrasi. Kematangan muncul ketika semangat memiliki arah dan tidak menghabiskan seluruh tenaga sekaligus.",
  ],
};

function palaceSnapshot(palace: ZiWeiPalace | null): ZiWeiSnapshot[] {
  if (!palace) return [];
  const snapshot: ZiWeiSnapshot[] = [
    { label: "Istana", value: palace.name },
    { label: "Stem · Branch", value: `${palace.heavenlyStem} · ${palace.earthlyBranch}` },
  ];
  if (palace.majorStars.length) snapshot.push({ label: "Major Stars", value: palace.majorStars.map((star) => star.canonicalName).join(" · ") });
  if (palace.supportingStars.length) snapshot.push({ label: "Supporting", value: palace.supportingStars.map((star) => star.canonicalName).join(" · ") });
  const transformations = palace.majorStars.filter((star) => star.transformation).map((star) => `${star.transformation} · ${star.canonicalName}`);
  if (transformations.length) snapshot.push({ label: "Transformation", value: transformations.join(" · ") });
  if (palace.decade) snapshot.push({ label: "Rentang dekade", value: `${palace.decade.ageStart}–${palace.decade.ageEnd}` });
  return snapshot;
}

function starSynthesis(palace: ZiWeiPalace | null): string {
  const stars = palace?.majorStars ?? [];
  if (!stars.length) return "Maknanya lebih banyak dibentuk oleh hubungan dengan istana lain, sehingga area ini tidak perlu dipaksa memiliki satu corak yang tetap.";
  const first = STAR_ACTION[stars[0].canonicalName] ?? "merespons pengalaman dengan penuh perhatian";
  if (stars.length === 1) return `Dorongan utamanya membuatmu ${first}.`;
  const second = STAR_ACTION[stars[1].canonicalName] ?? "mempertimbangkan dampak sebelum bergerak";
  return `Satu sisi dirimu ingin ${first}, sementara sisi lain cenderung ${second}. Keduanya menjadi kekuatan ketika tidak saling berebut kendali.`;
}

function summarySynthesis(palace: ZiWeiPalace | null): string {
  const stars = palace?.majorStars ?? [];
  if (!stars.length) return "Kamu belajar membaca konteks sebelum menentukan respons yang paling tepat.";
  const first = STAR_ACTION[stars[0].canonicalName] ?? "merespons pengalaman dengan penuh perhatian";
  if (stars.length === 1) return `Dorongan utamamu adalah ${first}.`;
  const second = STAR_ACTION[stars[1].canonicalName] ?? "mempertimbangkan dampak sebelum bergerak";
  return `Kamu berusaha ${first}, sambil belajar ${second}.`;
}

function summaryEmphasis(result: ZiWeiResult): ZiWeiPalace | null {
  const activeName = result.activeDecade?.palace;
  return [...result.palaces].sort((left, right) => {
    const score = (palace: ZiWeiPalace) => palace.majorStars.length * 4
      + palace.supportingStars.length
      + palace.majorStars.filter((star) => star.transformation).length * 3
      + (palace.isBodyPalace ? 4 : 0)
      + (palace === result.lifePalace ? 3 : 0)
      + (palace.name === activeName ? 5 : 0);
    return score(right) - score(left) || left.index - right.index;
  })[0] || null;
}

function emphasisOpening(palace: ZiWeiPalace, result: ZiWeiResult): string {
  const action = summarySynthesis(palace);
  const active = result.activeDecade?.palace === palace.name;
  if (palace.key === "career") return `Tanggung jawab dan kontribusi menjadi jalur penting dalam perkembanganmu. ${action}${active ? " Area ini juga sedang aktif dalam dekade berjalan." : ""}`;
  if (palace.key === "spouse") return `Pertumbuhanmu banyak berlangsung melalui hubungan, komitmen, dan cara menjaga batas. ${action}${active ? " Tema ini sedang meminta keterlibatan yang lebih nyata." : ""}`;
  if (palace.key === "spirit") return `Di balik cara dirimu terlihat, kehidupan batin menjadi ruang utama untuk mengolah pengalaman. ${action}${active ? " Fase kini memperkuat kebutuhan tersebut." : ""}`;
  if (palace.key === "wealth") return `Cara membangun nilai dan mengelola sumber daya menjadi poros yang menghubungkan rasa aman dengan kontribusi. ${action}${active ? " Dekade aktif membuat keputusan di area ini sulit diabaikan." : ""}`;
  if (palace.isBodyPalace) return `Banyak pelajaranmu menjadi nyata ketika kamu terlibat langsung dalam ${PALACE_CONTEXT[palace.key]?.focus || "area hidup yang sedang disorot"}. ${action}${active ? " Inilah salah satu pusat fase perkembanganmu sekarang." : ""}`;
  return `${PALACE_CONTEXT[palace.key]?.opening || "Cara kamu memasuki kehidupan dipengaruhi oleh satu area yang meminta perhatian berulang."} ${action}${active ? " Fokus dekade aktif mempertegas area ini." : ""}`;
}

const humanPalaceName = (name: string) => name.replace(/ Palace$/i, "").replace(/^Life$/i, "identitas").replace(/^Body$/i, "perwujudan diri").toLocaleLowerCase("id-ID");

function supportingContext(palace: ZiWeiPalace): string | null {
  const roles = [...new Set(palace.supportingStars.map((star) => SUPPORT_ROLES[star.canonicalName]).filter(Boolean))];
  if (!roles.length) return null;
  const messages: Record<string, string> = {
    "social support": "Dukungan sosial membantu proses ini terasa lebih ringan ketika kamu bersedia menerima bantuan.",
    communication: "Kemampuan menyusun kata dan membaca pesan yang tersirat menjadi alat penting di area ini.",
    pressure: "Tekanan dapat mempercepat tindakan, tetapi juga meminta jeda agar respons tidak menjadi terlalu tajam.",
    solitude: "Ada kebutuhan untuk mundur sejenak sebelum memahami apa yang sesungguhnya dirasakan.",
    disruption: "Perubahan mendadak mengajarkanmu membedakan hal yang perlu dipertahankan dari yang sudah selesai.",
    sensitivity: "Kepekaan terhadap suasana membuatmu cepat menangkap perubahan, sekaligus mudah lelah bila batas tidak dijaga.",
    discipline: "Konsistensi memberi bentuk nyata pada potensi yang sebelumnya masih tersebar.",
    mobility: "Pergerakan dan pergantian lingkungan dapat membuka pilihan baru.",
  };
  return roles.slice(0, 2).map((role) => messages[role]).join(" ");
}

function transformationContext(transformation: ZiWeiTransformation): string {
  const domain = transformation.palace.replace(" Palace", "").toLowerCase();
  if (transformation.type === "Hua Lu") return `Aliran terasa lebih mudah muncul melalui tema ${domain}, terutama ketika ketertarikan diarahkan pada sesuatu yang benar-benar bernilai.`;
  if (transformation.type === "Hua Quan") return `Tema ${domain} membawa tanggung jawab yang lebih kuat; di sinilah kemampuan memimpin perlu berjalan bersama kesadaran atas tekanan.`;
  if (transformation.type === "Hua Ke") return `Pembelajaran dan kredibilitas bertumbuh melalui tema ${domain}, terutama ketika pengalaman diolah menjadi pemahaman yang dapat dibagikan.`;
  return `Tema ${domain} mudah memunculkan pola berulang atau kepekaan yang belum selesai, sehingga koreksi kecil dan jujur lebih berguna daripada memaksa keadaan.`;
}

function palaceSection(palace: ZiWeiPalace): ZiWeiSection {
  const context = PALACE_CONTEXT[palace.key] ?? PALACE_CONTEXT.soul;
  const support = supportingContext(palace);
  const transformations = palace.majorStars.filter((star) => star.transformation).map((star) => ({
    type: star.transformation!, star: star.canonicalName, palace: palace.name, birthYearStem: "", tableSource: "", calculationStatus: "calculated" as const,
  }));
  const meaning = [
    `${context.opening} ${starSynthesis(palace)}`,
    support ? `${support} ${transformations.map(transformationContext).join(" ")}`.trim() : transformations.map(transformationContext).join(" "),
  ].filter(Boolean);
  return { id: `palace-${palace.key}`, title: palace.name, snapshot: palaceSnapshot(palace), humanMeaning: meaning, strength: context.strength, challenge: context.challenge, growthDirection: context.growth };
}

function findPalace(result: ZiWeiResult, key: string): ZiWeiPalace | null {
  return result.palaces.find((palace) => palace.key === key) ?? null;
}

function lifeSection(result: ZiWeiResult): ZiWeiSection | null {
  const life = result.lifePalace;
  if (!life) return null;
  const context = PALACE_CONTEXT.soul;
  return {
    id: "life-palace", title: "Life Palace", snapshot: palaceSnapshot(life),
    humanMeaning: [
      `${context.opening} ${starSynthesis(life)} Orang lain mungkin lebih dahulu melihat ketegasan dan kemampuanmu membaca apa yang perlu dilakukan.`,
      `Di balik sikap yang terlihat mantap, ada tarik-menarik antara kebutuhan menjaga arah dan keinginan memberi ruang pada perubahan. Saat tertekan, kamu dapat menjadi terlalu keras pada keputusan sendiri atau memikul tanggung jawab yang seharusnya dibagi.`,
      `Kualitas terbaikmu menjadi berguna ketika kejernihan tidak berubah menjadi kontrol. Kamu berkembang saat mampu memimpin dari pusat yang tenang, mendengar tanpa kehilangan arah, dan memilih tanggung jawab yang memang milikmu.`,
    ],
    strength: context.strength, challenge: context.challenge, growthDirection: context.growth,
  };
}

function bodySection(result: ZiWeiResult): ZiWeiSection | null {
  const body = result.bodyPalace;
  if (!body) return null;
  const context = PALACE_CONTEXT[body.key] ?? PALACE_CONTEXT.soul;
  return {
    id: "body-palace", title: "Body Palace", snapshot: palaceSnapshot(body),
    humanMeaning: [
      `Hidup menjadi nyata bagimu melalui ${context.focus}. ${starSynthesis(body)} Area ini berulang kali meminta kehadiran langsung, bukan hanya pemahaman dari kejauhan.`,
      `Ketika tekanan meningkat, kamu cenderung menambah usaha dan mencoba memastikan semuanya tetap berjalan. Partisipasimu menjadi lebih sehat saat tindakan diberi jeda untuk memeriksa apakah beban itu masih selaras dengan kebutuhan batin.`,
    ],
    strength: context.strength, challenge: context.challenge, growthDirection: context.growth,
  };
}

function bureauSection(result: ZiWeiResult): ZiWeiSection | null {
  if (!result.bureau) return null;
  const rhythm = BUREAU_RHYTHM[result.bureau.toLowerCase()] ?? ["Pertumbuhanmu berlangsung melalui tahapan yang perlu dijalani dengan sadar.", "Kesabaran membantu pengalaman berubah menjadi fondasi yang dapat diandalkan."];
  return {
    id: "bureau", title: "Five Element Bureau", snapshot: [{ label: "Bureau", value: result.bureau }],
    humanMeaning: rhythm,
    strength: "Kamu mampu mengubah pengalaman menjadi kemampuan yang semakin terasah.",
    challenge: "Yang perlu dijaga adalah menuntut hasil sebelum proses memiliki fondasi yang cukup.",
    growthDirection: "Hormati tempo perkembanganmu sendiri dan ukur kemajuan dari kedalaman, bukan hanya kecepatan.",
  };
}

function transformationSection(result: ZiWeiResult): ZiWeiSection | null {
  if (!result.fourTransformations.length) return null;
  return {
    id: "transformations", title: "Four Transformations",
    snapshot: result.fourTransformations.map((item) => ({ label: item.type, value: `${item.star} · ${item.palace}` })),
    humanMeaning: result.fourTransformations.map(transformationContext),
    challenge: "Yang perlu dijaga adalah membaca satu aktivasi sebagai penentu seluruh hidup; maknanya selalu bergantung pada konteks istana dan pilihanmu.",
  };
}

function masterSection(result: ZiWeiResult): ZiWeiSection | null {
  if (!result.lifeMaster || !result.bodyMaster) return null;
  return {
    id: "masters", title: "Life Master dan Body Master",
    snapshot: [{ label: "Life Master", value: result.lifeMaster }, { label: "Body Master", value: result.bodyMaster }],
    humanMeaning: ["Arah batin dan caramu hadir di dunia saling mengingatkan bahwa ketegasan perlu memiliki tujuan, sementara tindakan perlu tetap peka pada manusia yang terlibat."],
    growthDirection: "Gunakan kejernihan untuk memilih arah, lalu wujudkan pilihan itu melalui langkah yang adil dan dapat dipertanggungjawabkan.",
  };
}

function activeDecadeSection(result: ZiWeiResult): ZiWeiSection | null {
  const active = result.activeDecade;
  if (!active) return null;
  const palace = result.palaces.find((item) => item.name === active.palace) ?? null;
  const context = palace ? PALACE_CONTEXT[palace.key] : null;
  return {
    id: "active-decade", title: "Active Decade",
    snapshot: [
      { label: "Rentang usia", value: `${active.ageStart}–${active.ageEnd}` },
      { label: "Fokus", value: active.palace },
      { label: "Major Stars", value: active.dominantMajorStars.join(" · ") || "Tidak ada Major Star" },
      ...(active.transformations.length ? [{ label: "Transformation", value: active.transformations.join(" · ") }] : []),
    ],
    humanMeaning: [
      `${context?.opening ?? "Fase hidup saat ini membawa satu area penting ke depan perhatianmu."} Hal yang sebelumnya dapat ditunda kini meminta keterlibatan yang lebih nyata.`,
      `${palace ? starSynthesis(palace) : "Kesempatan muncul ketika kamu bersedia membaca ulang pola lama dengan lebih jujur."} Tantangannya adalah mengulang respons yang pernah terasa aman meski keadaan sudah berubah.`,
      `Gunakan fase ini untuk memperjelas prioritas, membagi tenaga secara sadar, dan mengambil langkah yang dapat dipertahankan. Kemajuan tidak harus dramatis; arah yang konsisten akan memberi hasil yang lebih matang.`,
    ],
    strength: context?.strength, challenge: context?.challenge, growthDirection: context?.growth,
  };
}

function themeSection(id: string, title: string, palaces: Array<ZiWeiPalace | null>, paragraphs: string[], challenge: string, growth: string): ZiWeiSection {
  return {
    id, title,
    snapshot: palaces.filter((palace): palace is ZiWeiPalace => Boolean(palace)).flatMap((palace) => {
      const stars = palace.majorStars.map((star) => star.canonicalName).join(" · ");
      return stars ? [{ label: palace.name, value: stars }] : [{ label: palace.name, value: `${palace.heavenlyStem} · ${palace.earthlyBranch}` }];
    }),
    humanMeaning: paragraphs, challenge, growthDirection: growth,
  };
}

export function buildZiWeiPresentation(result: ZiWeiResult): ZiWeiPresentation {
  const life = result.lifePalace;
  const body = result.bodyPalace;
  const spouse = findPalace(result, "spouse");
  const wealth = findPalace(result, "wealth");
  const career = findPalace(result, "career");
  const property = findPalace(result, "property");
  const health = findPalace(result, "health");
  const travel = findPalace(result, "surface");
  const friends = findPalace(result, "friends");
  const spirit = findPalace(result, "spirit");
  const active = result.activeDecade;

  const identity = [
    result.lunarBirth ? {
      id: "chart-identity", title: "Chart Identity",
      snapshot: [
        { label: "Tanggal lunar", value: `${result.lunarBirth.lunarYear} · bulan ${result.lunarBirth.lunarMonth} · hari ${result.lunarBirth.lunarDay}${result.lunarBirth.isLeapMonth ? " · leap month" : ""}` },
        { label: "Cabang jam", value: `${result.lunarBirth.hourBranch} · ${result.lunarBirth.hourRange}` },
      ],
      humanMeaning: ["Data ini menjadi fondasi teknis chart. Pembacaan berikutnya menerjemahkan struktur tersebut ke dalam pengalaman hidup, bukan menjadikan tanggal dan cabang jam sebagai penjelasan kepribadian."],
    } satisfies ZiWeiSection : null,
    lifeSection(result), bodySection(result), bureauSection(result), transformationSection(result), masterSection(result), activeDecadeSection(result),
  ].filter((section): section is ZiWeiSection => Boolean(section));

  const palaceSections = result.palaces.map(palaceSection);
  const relationship = themeSection("relationship", "Relationship and Partnership", [spouse, life, body], [
    `Dalam hubungan dekat, kamu membutuhkan keterbukaan yang tetap menghormati ruang pribadi. ${starSynthesis(spouse)} Kedekatan terasa aman ketika kebutuhan tidak harus ditebak dan kedua pihak dapat menyampaikan batas tanpa rasa bersalah.`,
    `Pola yang perlu diperhatikan adalah mengambil terlalu banyak tanggung jawab emosional atau berharap pasangan memahami sesuatu yang belum diucapkan. Saat tekanan meningkat, kebutuhan menjaga harmoni dapat membuat percakapan penting tertunda.`,
    `Hubungan menjadi lebih matang ketika dukungan tidak berubah menjadi penyelamatan. Kejujuran yang lembut, pembagian peran yang jelas, dan kesediaan bertumbuh bersama memberi fondasi yang lebih sehat.`,
  ], "Yang perlu dijaga adalah mengorbankan batas diri demi mempertahankan kedekatan.", "Bangun kedekatan melalui percakapan yang jernih, bukan asumsi atau pengujian diam-diam.");

  const wealthTheme = themeSection("wealth", "Wealth and Resources", [wealth, career, property], [
    `Ketika menyangkut sumber daya, rasa aman tumbuh dari kemampuan melihat hubungan antara usaha, nilai, dan hasil. ${starSynthesis(wealth)} Kontribusi menjadi bernilai ketika keterampilan diberi struktur dan dijalankan secara konsisten.`,
    `Ketidakstabilan lebih mudah muncul saat kontrol dipakai untuk meredakan kecemasan atau ketika tanggung jawab diterima tanpa batas yang jelas. Fondasi rumah dan ritme kerja ikut memengaruhi caramu merasa cukup.`,
    `Arah yang matang adalah membangun kapasitas yang dapat bertahan, memahami prioritas, dan memberi ruang bagi penyesuaian. Bagian ini merupakan refleksi simbolik, bukan janji hasil atau nasihat finansial.`,
  ], "Yang perlu dijaga adalah mengukur keamanan hanya dari apa yang dapat dikendalikan.", "Ubah kontribusi menjadi nilai melalui ritme yang konsisten dan keputusan yang sadar.");

  const careerTheme = themeSection("career", "Career and Contribution", [career, life, body, wealth], [
    `Di ruang kerja, kamu cenderung mencari tanggung jawab yang memiliki arah jelas dan manfaat nyata. ${starSynthesis(career)} Kepemimpinanmu paling efektif ketika orang lain memahami alasan di balik sebuah keputusan.`,
    `Visibilitas dapat terasa penting sekaligus menekan. Ada kecenderungan menambah standar ketika hasil belum sesuai harapan, padahal proses jangka panjang membutuhkan ruang belajar dan pembagian beban.`,
    `Kontribusimu matang saat ketegasan dipakai untuk menciptakan struktur yang membantu banyak orang bertumbuh. Tidak ada satu jabatan yang ditentukan oleh chart ini; yang lebih penting adalah kualitas tanggung jawab yang kamu bangun dari waktu ke waktu.`,
  ], "Yang perlu dijaga adalah menjadikan produktivitas sebagai satu-satunya ukuran nilai diri.", "Pimpin melalui kejelasan, pembagian tanggung jawab, dan hasil yang berguna bagi lingkungan.");

  const homeTheme = themeSection("home", "Home and Family", [property, findPalace(result, "parents"), findPalace(result, "siblings"), findPalace(result, "children"), spirit], [
    `Rasa memiliki tumbuh ketika rumah memberi ruang untuk beristirahat sekaligus menjadi diri sendiri. ${starSynthesis(property)} Keluarga dapat menjadi tempat belajar tentang dukungan, kewajiban, dan batas yang sehat.`,
    `Kamu berkembang saat mampu menghormati warisan tanpa harus mengulang seluruh polanya. Kehangatan menjadi lebih nyata ketika tanggung jawab dibicarakan dan tidak dipikul diam-diam.`,
  ], "Yang perlu dijaga adalah menganggap semua kebutuhan keluarga sebagai tanggung jawab pribadi.", "Bangun rasa memiliki melalui kehadiran, percakapan, dan batas yang dapat dipahami bersama.");

  const healthTheme = themeSection("health", "Health and Balance", [health], [
    `Keseimbangan sehari-hari sangat dipengaruhi oleh cara kamu mengatur kecepatan, jeda, dan beban emosional. ${starSynthesis(health)} Tubuh lebih mudah diajak bekerja sama ketika ritme tidak terus berubah mengikuti tuntutan luar.`,
    `Perhatian sederhana pada tidur, gerak, istirahat, dan kapasitas harian membantu mengenali kapan tenaga perlu dipulihkan. Ini adalah konteks simbolik untuk kesadaran diri dan tidak menggantikan pertimbangan kesehatan profesional.`,
  ], "Yang perlu dijaga adalah baru berhenti setelah tenaga benar-benar terkuras.", "Rawat keseimbangan melalui jeda teratur dan batas beban yang realistis.");

  const travelTheme = themeSection("travel", "Travel and External World", [travel, friends, career], [
    `Perjumpaan di luar lingkungan yang biasa dapat memperluas cara pandang dan mempertemukanmu dengan jaringan baru. ${starSynthesis(travel)} Kamu belajar banyak ketika tetap terbuka tanpa kehilangan pusat diri.`,
    `Mobilitas menjadi paling berguna ketika memiliki tujuan, bukan sekadar menjauh dari kejenuhan. Bagian ini berbicara tentang respons terhadap dunia luar dan tidak menggantikan pembacaan Astrocartography.`,
  ], "Yang perlu dijaga adalah menyebarkan perhatian ke terlalu banyak arah sekaligus.", "Pilih lingkungan yang memperluas kapasitas sekaligus menghormati kebutuhan batin.");

  const spiritualTheme = themeSection("spiritual", "Inner Life and Spiritual Growth", [spirit, life, body], [
    `Kehidupan batinmu membutuhkan ruang untuk mengolah pengalaman menjadi makna yang dapat dijalani. ${starSynthesis(spirit)} Pemahaman terdalam sering muncul setelah kamu berhenti mengejar jawaban cepat.`,
    `Pertumbuhan spiritual menjadi membumi ketika hadir dalam cara memilih, berelasi, dan menjaga batas. Ia tidak membutuhkan klaim luar biasa; konsistensi kecil sering menjadi bentuk integrasi yang paling nyata.`,
  ], "Yang perlu dijaga adalah menggunakan perenungan untuk menunda tindakan yang sebenarnya sudah jelas.", "Turunkan pemahaman batin menjadi kebiasaan sederhana yang dapat dijalankan setiap hari.");

  const themes = [relationship, wealthTheme, careerTheme, homeTheme, healthTheme, travelTheme, spiritualTheme];
  if (active) themes.push(themeSection("development", "Current Developmental Theme", [result.palaces.find((palace) => palace.name === active.palace) ?? null], [
    `Pelajaran yang sedang aktif adalah berpartisipasi lebih penuh pada area hidup yang kini sulit diabaikan. Pola lama dapat muncul kembali, bukan untuk menghukum, tetapi agar kamu melihat pilihan yang sebelumnya berjalan otomatis.`,
    `Kekuatanmu terletak pada kemampuan memperjelas arah dan tetap hadir ketika keadaan meminta penyesuaian. Kematangan tumbuh saat tanggung jawab dipilih dengan sadar, tenaga dibagi secara realistis, dan kemajuan dibangun melalui langkah yang konsisten.`,
  ], "Yang perlu dijaga adalah mengulang respons lama hanya karena pernah terasa aman.", "Gunakan fase ini untuk memilih prioritas, membangun batas, dan mempraktikkan perubahan yang dapat dipertahankan."));

  const emphasis = summaryEmphasis(result);
  const transformationFocus = result.fourTransformations
    .slice()
    .sort((left, right) => left.type.localeCompare(right.type) || left.palace.localeCompare(right.palace))
    .slice(0, 2);
  const activePalace = active ? result.palaces.find((palace) => palace.name === active.palace) || null : null;
  const bureauRhythm = result.bureau ? BUREAU_RHYTHM[result.bureau.toLowerCase()]?.[0] : null;
  const summary = life && body && result.bureau && emphasis ? [
    `${emphasisOpening(emphasis, result)} ${PALACE_CONTEXT[emphasis.key]?.growth || "Kematangan tumbuh ketika kekuatan utama dipakai sesuai konteks dan kapasitas."}`,
    `${life === emphasis ? `Cara pengalaman menjadi nyata melalui ${humanPalaceName(body.name)} menunjukkan tempat pola identitas perlu diwujudkan melalui tindakan.` : `Arah identitas membawa ${summarySynthesis(life).replace(/^Kamu /, "kemampuan untuk ").replace(/^Dorongan utamamu adalah /, "dorongan untuk ")}, sementara ${humanPalaceName(body.name)} membawa pelajaran itu ke ${PALACE_CONTEXT[body.key]?.focus || "pengalaman langsung"}.`} ${bureauRhythm || "Ritme perkembangan meminta setiap tahap dijalani dengan sadar."} ${PALACE_CONTEXT[body.key]?.growth || "Tindakan menjadi lebih sehat ketika beban dan tujuan diperiksa bersama."}`,
    transformationFocus.length ? `Aktivasi perubahan memberi arah yang lebih khusus. ${transformationFocus.map(transformationContext).join(" ")} Pertemuan dua aktivasi ini menunjukkan bahwa kemudahan dan tekanan perlu dibaca melalui wilayah hidup tempat keduanya bekerja, bukan sebagai sifat tunggal.` : `Aktivasi perubahan belum cukup lengkap untuk dijadikan pusat sintesis. Hubungan antarwilayah hidup tetap menjadi dasar pembacaan. Karena itu, tidak ada satu fungsi yang dipaksa menjelaskan seluruh pengalaman.`,
    active && activePalace ? `Pada usia ${active.ageStart}–${active.ageEnd}, ${humanPalaceName(active.palace)} menjadi wilayah perkembangan aktif. ${summarySynthesis(activePalace)} Arah integrasinya adalah memakai kekuatan ${humanPalaceName(emphasis.name)} untuk merespons tema tersebut tanpa mengulang beban yang seharusnya dapat dibagi.` : `Dekade aktif belum terverifikasi. Arah integrasi tetap bertumpu pada hubungan antara ${humanPalaceName(emphasis.name)}, ${humanPalaceName(life.name)}, dan ${humanPalaceName(body.name)}. Pilih tanggung jawab yang selaras dengan kapasitas nyata.`,
  ] : [];

  const heroFacts: ZiWeiSnapshot[] = [];
  if (life) heroFacts.push({ label: "Life Palace", value: `${life.heavenlyStem} · ${life.earthlyBranch}` });
  if (body) heroFacts.push({ label: "Body Palace", value: body.name });
  if (result.bureau) heroFacts.push({ label: "Bureau", value: result.bureau });
  if (active) heroFacts.push({ label: "Active Decade", value: `${active.ageStart}–${active.ageEnd}` });

  return {
    status: result.status,
    hero: {
      title: "Peta Istana dan Bintang Kehidupanmu",
      facts: heroFacts.slice(0, 4),
      insight: life ? `Kekuatanmu tumbuh ketika ketegasan dipakai untuk memberi arah, sementara kepekaan tetap mendapat ruang dalam setiap keputusan.` : "Waktu lahir yang tepat diperlukan agar pembacaan tidak dibangun dari perkiraan.",
    },
    identity, palaceSections, themeSections: themes, summary, notices: result.birthDataStatus.notes,
  };
}
