function hashKey(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = ((h << 5) - h + value.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pick<T>(items: T[], key: string): T {
  return items[hashKey(key) % items.length];
}

export function insightsig(insight: {
  primaryThemes: { themeId: string }[];
  tensions: { tensionId: string }[];
  supportingThemes: { themeId: string }[];
  selectedFacts: { value: string }[];
  provenance: string[];
}): string {
  const themeSig = insight.primaryThemes.map(t => t.themeId).join(",");
  const tensionSig = insight.tensions.map(t => t.tensionId).join(",");
  const supportSig = insight.supportingThemes.map(t => t.themeId).join(",");
  const factHash = insight.selectedFacts.slice(0, 3).map(f => hashKey(f.value.slice(0, 20))).join(",");
  return `${themeSig}|${tensionSig}|${supportSig}|${factHash}|${insight.provenance.length}`;
}

const OPENING_POOLS: Record<string, string[]> = {
  "soul-identity": [
    "Inti perjalananmu saat ini adalah mengenali bagian dirimu yang paling otentik.",
    "Ada satu poros dalam dirimu yang tetap utuh di tengah segala perubahan yang terjadi.",
    "Peta dirimu menunjukkan bahwa inti keberadaanmu terbentuk dari perpaduan energi yang unik.",
    "Siapa dirimu sebenarnya bukanlah sesuatu yang perlu kamu ciptakan, melainkan sesuatu yang perlu diingat kembali.",
    "Pada lapisan yang paling dasar, ada kualitas yang menetap dan menjadi acuan saat kamu merasa kehilangan arah.",
  ],
  "energy-mechanics": [
    "Cara energimu bekerja setiap hari memiliki ritme yang khas dan perlu dihormati tanpa paksaan.",
    "Tubuh dan batinmu bergerak dalam pola yang bisa dikenali saat kamu hadir sepenuhnya pada dirimu sendiri.",
    "Ada cara tertentu yang membuatmu merasa paling hidup, dan itu terkait dengan bagaimana energimu mengalir.",
    "Ritme harianmu bukanlah kebiasaan semata, melainkan ekspresi dari kebutuhan batin yang dalam.",
    "Kamu memiliki pola energi yang unik dan memahami pola ini membantumu menjaga keseimbangan harian.",
  ],
  "wounds-shadow-lineage": [
    "Bagian dirimu yang paling terluka juga menyimpan kunci pertumbuhan yang paling dalam dan otentik.",
    "Tidak semua luka harus segera sembuh karena beberapa hadir untuk mengajarkanmu tentang batas yang sehat.",
    "Pola yang berulang dalam hidupmu sering kali bukan kebetulan, melainkan undangan untuk melihat dirimu lebih jujur.",
    "Ada jejak luka yang terbawa dari pengalaman masa lalu dan merawatnya adalah bagian dari keberanian sejati.",
    "Luka yang kamu bawa bukanlah kelemahan karena ia adalah pengingat bahwa kamu pernah bertahan dalam keadaan sulit.",
  ],
  "work-talents": [
    "Cara kamu berkarya membawa jejak yang khas dari perpaduan bakat alami dan cara unikmu melihat dunia.",
    "Ada sesuatu yang kamu lakukan dengan cara yang terasa sangat alami seolah tidak perlu dipaksakan sama sekali.",
    "Kamu memiliki kemampuan bawaan yang ketika diarahkan dapat menjadi sumbangan berarti bagi sekitarmu.",
    "Bakatmu tidak selalu perlu terlihat gemilang dari luar karena yang terpenting adalah ia berasal dari dirimu yang paling jujur.",
    "Cara terbaikmu berkontribusi datang dari kegiatan yang membuatmu merasa utuh, bukan hanya sibuk.",
  ],
  "love-relationships": [
    "Dalam relasi, kamu membawa pola yang tidak selalu mudah dikenali dari luar tetapi terasa jelas dari dalam.",
    "Cara kamu mendekat dan menjauh dalam hubungan mencerminkan kebutuhan batin yang perlu dipahami dengan lembut.",
    "Ada kebutuhan emosional yang membentuk cara kamu mencinta dan menerima cinta dari orang lain.",
    "Relasi yang kamu bangun sering kali menjadi cermin yang menunjukkan bagian dirimu yang masih perlu dirawat.",
    "Kedekatan bagimu memiliki makna yang lebih dalam dari sekadar kebersamaan fisik.",
  ],
  "body-environment": [
    "Tubuhmu bukan sekadar tempat tinggal karena ia adalah alat batin yang peka terhadap lingkungan sekitarmu.",
    "Lingkungan dan kondisi fisikmu saling mempengaruhi dan membentuk cara energimu bekerja setiap hari.",
    "Keseimbanganmu sering kali dimulai dari hal yang paling sederhana yaitu ruang, ritme, dan istirahat yang cukup.",
    "Tubuhmu memberi sinyal yang jujur tentang apa yang kamu butuhkan meskipun pikiranmu kadang mengabaikannya.",
    "Kesehatanmu terkait erat dengan seberapa aman dan selaras lingkungan sekitarmu terasa.",
  ],
  "spirituality-evolution": [
    "Perjalanan spiritualmu bukan tentang mencapai kesempurnaan melainkan tentang kembali utuh pada dirimu sendiri.",
    "Ada dimensi dalam dirimu yang tidak bisa dijelaskan hanya dengan logika dan itu tidak masalah.",
    "Bagian terdalam dari jiwamu terus bergerak menuju sesuatu yang lebih luas meskipun tidak selalu terlihat dari luar.",
    "Keyakinanmu baik yang disadari maupun tidak membentuk cara kamu memaknai pengalaman hidup sehari-hari.",
    "Dimensi spiritualmu adalah ruang yang tidak bisa diisi oleh apa pun dari luar karena ia tumbuh dari dalam dirimu.",
  ],
  "current-life-phase": [
    "Saat ini kamu berada dalam fase kehidupan yang membawa tema tertentu untuk diolah dan dipahami.",
    "Musim yang sedang kamu jalani selaras dengan kebutuhan pertumbuhan jiwamu saat ini.",
    "Apa yang kamu alami sekarang adalah bagian dari siklus yang lebih besar dan bukan akhir dari segalanya.",
    "Fase ini mungkin terasa menantang namun ia juga membawa pelajaran yang tidak bisa kamu dapatkan di fase lain.",
    "Ada ritme tertentu yang sedang bekerja dalam hidupmu saat ini dan memahaminya membantumu menjalani dengan lebih ringan.",
  ],
  "symbolic-origin": [
    "Secara simbolik jiwamu membawa resonansi dari pola-pola kuno yang melampaui pengalaman langsungmu sehari-hari.",
    "Ada semacam memori batin yang tidak berasal dari satu waktu tertentu tetapi hadir sebagai rasa akrab terhadap tema tertentu.",
    "Dalam lapisan yang lebih dalam ada cerita simbolis yang membentuk cara pandangmu terhadap hidup dan tujuanmu.",
    "Jiwamu seolah mengingat sesuatu yang tidak pernah kamu pelajari secara sadar dan itu muncul sebagai intuisi yang kuat.",
    "Secara arketipal kamu memiliki afinitas terhadap tema-tema tertentu yang muncul berulang dalam hidupmu.",
  ],
  "growth-potential": [
    "Potensimu saat ini tidak diukur dari seberapa sempurna dirimu melainkan dari seberapa sadar kamu bertumbuh setiap hari.",
    "Arah pertumbuhanmu tidak perlu terlihat spektakuler karena yang penting adalah ia berasal dari panggilan jiwamu sendiri.",
    "Kamu sedang berada dalam proses menjadi versi yang lebih utuh dan setiap langkah memiliki maknanya sendiri.",
    "Potensi terbesarmu sering kali tersembunyi di balik kebiasaan yang paling kamu hindari untuk dilihat.",
    "Pertumbuhan sejati tidak terburu-buru dan ia muncul ketika kamu memberi ruang bagi dirimu untuk berubah secara alami.",
  ],
};

const MEANING_POOLS: Record<string, string[]> = {
  identity: [
    "Identitasmu bukanlah sesuatu yang perlu kamu buktikan melainkan sesuatu yang perlu kamu terima dengan utuh.",
    "Siapa dirimu di tingkat yang paling dalam telah terbentuk dari perpaduan berbagai kekuatan yang saling melengkapi.",
  ],
  "shadow-and-wounds": [
    "Luka yang kamu bawa bukanlah kelemahan karena ia adalah bagian dari dirimu yang paling membutuhkan kelembutan.",
    "Ada pola yang terus muncul bukan untuk menghukummu melainkan untuk mengingatkanmu pada sesuatu yang perlu dirawat.",
  ],
  "relationship-dynamics": [
    "Relasi yang kamu bangun sering kali mencerminkan hubunganmu dengan dirimu sendiri lebih dari yang kamu sadari.",
    "Pola kedekatanmu mengungkapkan kebutuhan yang dalam untuk dipahami tanpa harus menjelaskan semuanya dengan kata-kata.",
  ],
  "work-and-talents": [
    "Bakatmu akan bersinar paling terang ketika digunakan untuk tujuan yang bermakna bagimu secara pribadi.",
    "Kontribusimu yang paling berharga lahir dari cara unikmu melihat dan merespons dunia di sekitarmu.",
  ],
  "health-and-environment": [
    "Tubuhmu adalah sekutu bukan musuh dan mendengarkan sinyalnya adalah bentuk cinta yang paling mendasar.",
    "Lingkungan yang mendukung bukanlah kemewahan melainkan kebutuhan dasar agar potensimu bisa berkembang.",
  ],
  spirituality: [
    "Ada ruang dalam dirimu yang tidak bisa dijangkau oleh hiruk-pikuk dunia luar dan di sanalah pertumbuhan sejati terjadi.",
    "Keyakinanmu membentuk cara kamu memaknai pengalaman hidup bahkan ketika kamu tidak menyadarinya.",
  ],
  "timing-and-cycles": [
    "Setiap fase memiliki ritmenya sendiri dan tidak perlu memaksakan panen saat masih musim menanam.",
    "Yang sedang kamu alami adalah bagian dari siklus dan bukan keadaan tetap yang akan bertahan selamanya.",
  ],
  "karma-and-life-lessons": [
    "Pola yang berulang dalam hidupmu bukanlah hukuman melainkan undangan untuk menyelesaikan apa yang belum utuh.",
    "Ada pelajaran yang muncul berulang kali sampai kamu benar-benar memaknainya.",
  ],
  "location-context": [
    "Tempat tertentu bisa membantumu merasakan sisi dirimu yang lebih mudah muncul tanpa mendefinisikan siapa dirimu.",
  ],
  "growth-and-potential": [
    "Pertumbuhan sejati muncul ketika kamu memberi ruang bagi dirimu untuk berubah secara alami.",
  ],
  "resources-and-wealth": [
    "Rezeki tidak hanya berbentuk materi karena ia juga hadir sebagai rasa cukup, aman, dan percaya pada proses.",
  ],
};

const TENSION_POOLS: Record<string, string[]> = {
  "identity-vs-relationship-dynamics": [
    "Kebutuhan akan ruang pribadi dan keinginan untuk terhubung dengan orang lain bisa hidup berdampingan secara sehat.",
    "Ada bagian dirimu yang ingin mandiri dan ada bagian yang ingin dekat dan keduanya bukanlah kesalahan.",
  ],
  "spirituality-vs-health-and-environment": [
    "Panggilan batin dan tuntutan sehari-hari tidak selalu sejalan namun itu bukanlah kegagalan melainkan undangan untuk menemukan keseimbangan baru.",
  ],
  "growth-and-potential-vs-shadow-and-wounds": [
    "Pertumbuhan bukan berarti meninggalkan luka lamamu karena ia justru mengajakmu merawat bagian yang terabaikan sambil tetap melangkah maju.",
    "Luka dan potensi bukanlah dua hal yang terpisah karena sering kali justru dari luka itulah kekuatan terbesarmu muncul.",
  ],
  "timing-and-cycles-vs-identity": [
    "Apa yang kamu rasakan saat ini mencerminkan musim kehidupan yang sedang berjalan dan bukan seluruh perjalananmu.",
  ],
  "location-context-vs-identity": [
    "Lingkungan tertentu dapat menonjolkan sisi tertentu dari dirimu tetapi tidak mendefinisikan siapa dirimu seutuhnya.",
  ],
};

const DIRECTION_POOLS: Record<string, string[]> = {
  "soul-identity": [
    "Arah pertumbuhanmu adalah terus mengenali dirimu sendiri dengan jujur tanpa perlu menjadi sesuatu yang bukan dirimu.",
    "Langkahmu ke depan adalah merawat hubunganmu dengan dirimu sendiri agar pilihan-pilihanmu lahir dari kesadaran yang jernih.",
  ],
  "energy-mechanics": [
    "Langkah kecil untuk menjaga ritme harianmu bisa dimulai dengan memberi ruang bagi tubuh dan batinmu untuk beristirahat.",
    "Konsistensi dalam hal-hal kecil lebih berharga daripada ledakan energi sesaat yang tidak berkelanjutan.",
  ],
  "wounds-shadow-lineage": [
    "Keberanian sejatimu saat ini adalah melihat luka lamamu tanpa rasa malu dan mulai merawatnya dengan kelembutan yang baru.",
    "Kamu tidak harus menyembuhkan semuanya sendirian karena mengakui bahwa ada yang perlu dirawat adalah langkah pertama yang paling berani.",
  ],
  "work-talents": [
    "Arah yang paling alami bagimu adalah menemukan cara untuk mengekspresikan bakatmu secara konsisten meskipun dalam skala kecil.",
    "Kontribusimu akan terasa paling bermakna ketika kamu melakukannya dengan cara yang paling autentik bagimu.",
  ],
  "love-relationships": [
    "Menjalin hubungan yang sehat dimulai dari kejujuran terhadap kebutuhanmu sendiri bukan dari menebak kebutuhan orang lain.",
    "Kedekatan yang kamu cari akan terasa lebih aman ketika kamu mampu menyatakan batas dengan jelas sejak awal.",
  ],
  "body-environment": [
    "Luangkan waktu untuk benar-benar merasakan tubuhmu bukan hanya menggunakannya untuk menyelesaikan berbagai tugas.",
    "Menjaga lingkungan sekitarmu tetap tenang dan teratur adalah cara sederhana untuk memulihkan energimu.",
  ],
  "spirituality-evolution": [
    "Biarkan praktik spiritualmu tumbuh secara organik tanpa perlu membandingkannya dengan perjalanan orang lain.",
    "Yang kamu butuhkan bukanlah lebih banyak pengetahuan melainkan lebih banyak kehadiran dalam setiap momen sederhana.",
  ],
  "current-life-phase": [
    "Alih-alih melawan apa yang sedang terjadi cobalah bertanya apa yang ingin diajarkan fase ini padamu.",
    "Kejelasan akan datang bukan dengan memaksa tetapi dengan memberi ruang bagi proses untuk berjalan secara alami.",
  ],
  "symbolic-origin": [
    "Biarkan resonansi simbolik ini menjadi cermin bukan peta yang kaku dan maknanya akan terus berkembang.",
    "Apa yang terasa akrab secara simbolik bisa menjadi petunjuk tentang arah yang ingin kamu tuju.",
  ],
  "growth-potential": [
    "Arah pertumbuhanmu saat ini adalah memberi ruang bagi potensi yang belum terpakai untuk muncul secara alami.",
    "Alih-alih mengejar versi terbaik dirimu cobalah merawat versi paling nyata dari dirimu yang ada saat ini.",
  ],
};

const CLOSING_POOL: string[] = [
  "Semoga ini menjadi pengingat yang hangat untuk terus berjalan dengan lebih sadar dan penuh kepercayaan.",
  "Tidak perlu terburu-buru karena yang penting adalah kamu terus bergerak dengan hati yang jujur dan pikiran yang tenang.",
  "Pada akhirnya perjalanan ini adalah tentang kembali pulang ke dirimu sendiri apapun bentuk rumah itu.",
  "Biarkan pemahaman ini menetap perlahan tanpa perlu segera diubah menjadi tindakan atau keputusan besar.",
  "Kamu tidak sendirian dalam proses ini dan setiap langkah kecil yang kamu ambil adalah bagian dari pertumbuhan yang lebih besar.",
  "Percayalah pada prosesmu sendiri bahkan ketika hasilnya belum terlihat karena apa yang kamu butuhkan sudah dalam perjalanan.",
  "Semua yang kamu butuhkan sudah ada dalam dirimu dan tugasmu hanyalah memberinya ruang untuk muncul.",
  "Tidak ada yang perlu kamu buktikan karena cukup hadir sepenuhnya pada setiap babak kehidupan yang sedang kamu jalani.",
];

export function buildSections(
  sectionId: string,
  insight: {
    primaryThemes: { themeId: string }[];
    tensions: { tensionId: string }[];
    supportingThemes: { themeId: string }[];
    selectedFacts: { value: string }[];
    provenance: string[];
    limitations: string[];
  },
): string[] {
  const sig = insightsig(insight);
  const usedTemplates = new Set<string>();

  type SlotFn = () => { text: string; templateId: string } | null;
  const producers: SlotFn[] = [
    () => {
      const pool = OPENING_POOLS[sectionId] ?? OPENING_POOLS["growth-potential"]!;
      const s = pick(pool, `${sectionId}-open-${sig}`);
      return { text: s, templateId: `open-${hashKey(s)}` };
    },
    () => {
      const themeId = insight.primaryThemes[0]?.themeId ?? insight.supportingThemes[0]?.themeId;
      if (!themeId) return null;
      const pool = MEANING_POOLS[themeId];
      if (!pool) return null;
      const s = pick(pool, `${themeId}-meaning-${sig}`);
      return { text: s, templateId: `meaning-${themeId}` };
    },
    () => {
      if (insight.tensions.length === 0) return null;
      const tid = insight.tensions[0].tensionId;
      const pool = TENSION_POOLS[tid];
      if (!pool) return null;
      const s = pick(pool, `${tid}-tension-${sig}`);
      return { text: s, templateId: `tension-${tid}` };
    },
    () => {
      const pool = DIRECTION_POOLS[sectionId] ?? DIRECTION_POOLS["growth-potential"]!;
      const s = pick(pool, `${sectionId}-dir-${sig}`);
      return { text: s, templateId: `direction-${sectionId}` };
    },
    () => {
      const s = pick(CLOSING_POOL, `${sectionId}-close-${sig}`);
      return { text: s, templateId: `closing-${hashKey(s)}` };
    },
  ];

  const sentences: string[] = [];
  for (const produce of producers) {
    if (sentences.length >= 5) break;
    const result = produce();
    if (!result) continue;
    if (usedTemplates.has(result.templateId)) continue;
    sentences.push(result.text);
    usedTemplates.add(result.templateId);
  }

  return sentences;
}
