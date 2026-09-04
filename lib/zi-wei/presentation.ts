import type { ZiWeiPalace, ZiWeiResult, ZiWeiTransformation } from "./types";
import { isEnlEdition } from "@/lib/config/edition";

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

const PALACE_CONTEXT_EN: Record<string, { opening: string; focus: string; strength: string; challenge: string; growth: string }> = {
  soul: {
    opening: "How you enter life is seen through your willingness to take a stand even before situations are fully clear.",
    focus: "identity, personal choices, and cultivating direction",
    strength: "You can serve as an anchor of calm when decisions need to be made with clarity.",
    challenge: "What needs care is the impulse to hold too much control when situations feel uncertain.",
    growth: "Maturity grows when resolve walks alongside adaptability and openness to feedback.",
  },
  parents: {
    opening: "Your relationship with origins shapes how you understand support, authority, and belonging.",
    focus: "relationship with parents, mentors, and inherited values",
    strength: "You can distill family legacy into principles genuinely useful for your path.",
    challenge: "Old expectations can easily feel like personal obligations that must always be fulfilled.",
    growth: "Give room to honor roots without relinquishing sovereignty over your own journey.",
  },
  spirit: {
    opening: "Your inner life restores when there is quiet space to process experience rather than merely rushing past it.",
    focus: "tranquility, contemplation, meaning, and inner sanctuary",
    strength: "You possess the capacity to uncover deeper meaning after navigating complex conditions.",
    challenge: "The mind can stay active even when body and emotions require rest.",
    growth: "Cultivate simple quiet rhythms so understanding does not turn into mental strain.",
  },
  property: {
    opening: "Regarding home and security, you need foundations that are dependable yet flexible enough to evolve.",
    focus: "home, real estate, roots, and living sanctuary",
    strength: "You can curate an environment that feels orderly and sustains everyday living.",
    challenge: "Security can too easily become tied to possessions or unchanging circumstances.",
    growth: "Nurture stable foundations without letting them become barriers to growth.",
  },
  career: {
    opening: "In work, you feel most alive when responsibility has purposeful direction and tangible impact.",
    focus: "contribution, vocation, leadership, and public standing",
    strength: "You can discern what needs organizing and mobilize people toward collective achievement.",
    challenge: "Workload can easily become a proxy for self-worth when recognition is slow to arrive.",
    growth: "Separate personal worth from professional outcomes, channeling leadership into collective capacity.",
  },
  friends: {
    opening: "Your social sphere expands through peers who exchange ideas, support, and accountability as equals.",
    focus: "friendships, networks, collaborators, and communal support",
    strength: "You possess keen discernment in identifying who can be trusted for long-term journeys.",
    challenge: "Disappointment surfaces when dynamics feel one-sided.",
    growth: "Establish collaborations with expectations articulated at the start, not assumed.",
  },
  surface: {
    opening: "Outside familiar surroundings, your capacity to read situations becomes sharper and more pragmatic.",
    focus: "mobility, the outside world, new encounters, and adaptability",
    strength: "Shifting locations or surroundings can reveal perspectives previously hidden.",
    challenge: "Excessive new stimuli can fragment your focus.",
    growth: "Select external adventures that expand life without severing connection to inner needs.",
  },
  health: {
    opening: "Under pressure, your well-being is strongly influenced by daily cadence, emotional load, and pause quality.",
    focus: "stress response, energy management, rest, and somatic awareness",
    strength: "You recognize fluctuations in capacity when paying attention to subtle cues in routine.",
    challenge: "A tendency to persevere can delay acknowledging fatigue until reserves are depleted.",
    growth: "Make rest, movement, and load boundaries part of your life rhythm, not emergency interventions.",
  },
  wealth: {
    opening: "How you steward resources relates closely to your need for sovereignty and tangible security.",
    focus: "income, expenses, value creation, security, and stewardship",
    strength: "You can translate expertise and responsibility into value that others genuinely experience.",
    challenge: "The desire for safety can turn into over-control or difficulty enjoying fruits of labor.",
    growth: "Build resources through consistent decisions while remaining open to necessary adjustments.",
  },
  children: {
    opening: "Your creative expression requires room to unfold, undergo testing, and materialize into shareable forms.",
    focus: "creativity, mentorship, progeny, and legacy",
    strength: "You can nurture initial potential until it matures into fruit.",
    challenge: "Exacting standards can turn creative endeavors into burdensome duty.",
    growth: "Allow growth to proceed gradually, cherishing the unfolding process alongside final results.",
  },
  spouse: {
    opening: "In close partnership, you require candor, breathing room, and a companion willing to evolve together.",
    focus: "intimacy, commitment, projections, and relational boundaries",
    strength: "You can cultivate deep warmth when needs and commitments are addressed openly.",
    challenge: "The desire to preserve harmony can cause personal boundaries to blur.",
    growth: "Distinguish supportive presence from rescuing to maintain an equitable partnership.",
  },
  siblings: {
    opening: "Among peers and equals, you learn to share space without losing personal voice or direction.",
    focus: "siblings, peers, comparison, and lateral collaboration",
    strength: "You can serve as an intuitive bridge when others bring divergent needs.",
    challenge: "Quiet comparison can easily disrupt contentment or spark needless competition.",
    growth: "Treat differences as a source of perspective rather than a measure of worth.",
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

const STAR_ACTION_EN: Record<string, string> = {
  "Zi Wei": "taking responsibility and finding a direction that aligns diverse interests",
  "Tian Ji": "reading shifts quickly before deciding the next step",
  "Tai Yang": "energizing others and showing up openly and boldly",
  "Wu Qu": "organizing resources with firmness and focus on tangible results",
  "Tian Tong": "seeking peaceful solutions without surrendering personal needs",
  "Lian Zhen": "testing limits and integrity before placing trust in a path",
  "Tian Fu": "preserving stability through patient stewardship",
  "Tai Yin": "observing deeply and processing experiences privately",
  "Tan Lang": "exploring new experiences to uncover what holds genuine meaning",
  "Ju Men": "probing unspoken details and posing essential questions",
  "Tian Xiang": "weighing the needs of many parties before adopting a stance",
  "Tian Liang": "holding steadfast to principles while protecting what is valuable",
  "Qi Sha": "acting decisively when change can no longer be delayed",
  "Po Jun": "dismantling outworn patterns so fresh space can be built",
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

const BUREAU_RHYTHM_EN: Record<string, string[]> = {
  "water 2nd": [
    "Your trajectory moves like water: swift to perceive openings, adapting course, and finding viable channels.",
    "Progress is not always linear, but high adaptability sustains you through shifts. Guard against pivoting too fast before roots can form.",
  ],
  "wood 3rd": [
    "Your growth is organic and incremental; one experience becomes the soil for the next.",
    "You need room to learn, experiment, and expand capacity naturally. Best outcomes emerge when roots are tended rather than hurried.",
  ],
  "metal 4th": [
    "Your development strengthens through distillation: discerning what matters, setting clear boundaries, and honing reliability.",
    "Progress is structured and guided by clear standards. Precision is strength, yet healthy growth requires that standards do not become harsh self-judgment.",
  ],
  "earth 5th": [
    "Your evolution calls for sturdy foundations, patience, and willingness to build piece by piece.",
    "You thrive when observing practical utility in processes. Guard against clinging to old structures merely because they feel safe.",
  ],
  "fire 6th": [
    "Your development moves in vivid phases that ignite courage, visibility, and desire for impact.",
    "Momentum can carry you swiftly forward, followed by cycles of recovery and integration. Maturity emerges when fire has focus and does not burn reserves all at once.",
  ],
};

function palaceSnapshot(palace: ZiWeiPalace | null, isEn = false): ZiWeiSnapshot[] {
  if (!palace) return [];
  const snapshot: ZiWeiSnapshot[] = [
    { label: isEn ? "Palace" : "Istana", value: palace.name },
    { label: "Stem · Branch", value: `${palace.heavenlyStem} · ${palace.earthlyBranch}` },
  ];
  if (palace.majorStars.length) snapshot.push({ label: "Major Stars", value: palace.majorStars.map((star) => star.canonicalName).join(" · ") });
  if (palace.supportingStars.length) snapshot.push({ label: "Supporting", value: palace.supportingStars.map((star) => star.canonicalName).join(" · ") });
  const transformations = palace.majorStars.filter((star) => star.transformation).map((star) => `${star.transformation} · ${star.canonicalName}`);
  if (transformations.length) snapshot.push({ label: "Transformation", value: transformations.join(" · ") });
  if (palace.decade) snapshot.push({ label: isEn ? "Decade range" : "Rentang dekade", value: `${palace.decade.ageStart}–${palace.decade.ageEnd}` });
  return snapshot;
}

function starSynthesis(palace: ZiWeiPalace | null, isEn = false): string {
  const stars = palace?.majorStars ?? [];
  if (!stars.length) {
    return isEn
      ? "Its meaning is shaped primarily through relationships with other palaces, without demanding a rigid single tone."
      : "Maknanya lebih banyak dibentuk oleh hubungan dengan istana lain, sehingga area ini tidak perlu dipaksa memiliki satu corak yang tetap.";
  }
  const actionMap = isEn ? STAR_ACTION_EN : STAR_ACTION;
  const first = actionMap[stars[0].canonicalName] ?? (isEn ? "responding to experience with deep care" : "merespons pengalaman dengan penuh perhatian");
  if (stars.length === 1) {
    return isEn ? `Its primary impulse invites you to ${first}.` : `Dorongan utamanya membuatmu ${first}.`;
  }
  const second = actionMap[stars[1].canonicalName] ?? (isEn ? "weighing consequences before taking action" : "mempertimbangkan dampak sebelum bergerak");
  return isEn
    ? `One part of you seeks to ${first}, while another tends toward ${second}. Both become strengths when they do not compete for control.`
    : `Satu sisi dirimu ingin ${first}, sementara sisi lain cenderung ${second}. Keduanya menjadi kekuatan ketika tidak saling berebut kendali.`;
}

function summarySynthesis(palace: ZiWeiPalace | null, isEn = false): string {
  const stars = palace?.majorStars ?? [];
  if (!stars.length) {
    return isEn
      ? "You learn to read context before selecting the most fitting response."
      : "Kamu belajar membaca konteks sebelum menentukan respons yang paling tepat.";
  }
  const actionMap = isEn ? STAR_ACTION_EN : STAR_ACTION;
  const first = actionMap[stars[0].canonicalName] ?? (isEn ? "responding to experience with deep care" : "merespons pengalaman dengan penuh perhatian");
  if (stars.length === 1) {
    return isEn ? `Your primary impulse is to ${first}.` : `Dorongan utamamu adalah ${first}.`;
  }
  const second = actionMap[stars[1].canonicalName] ?? (isEn ? "weighing consequences before taking action" : "mempertimbangkan dampak sebelum bergerak");
  return isEn
    ? `You strive to ${first}, while learning to ${second}.`
    : `Kamu berusaha ${first}, sambil belajar ${second}.`;
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

function emphasisOpening(palace: ZiWeiPalace, result: ZiWeiResult, isEn = false): string {
  const action = summarySynthesis(palace, isEn);
  const active = result.activeDecade?.palace === palace.name;
  const contextMap = isEn ? PALACE_CONTEXT_EN : PALACE_CONTEXT;
  if (isEn) {
    if (palace.key === "career") return `Responsibility and contribution form a key path in your development. ${action}${active ? " This area is also currently active in your ongoing decade." : ""}`;
    if (palace.key === "spouse") return `Your growth unfolds significantly through partnership, commitment, and healthy boundaries. ${action}${active ? " This theme currently calls for more tangible involvement." : ""}`;
    if (palace.key === "spirit") return `Behind outward appearances, inner life is the primary ground for processing experience. ${action}${active ? " Your current phase reinforces this need." : ""}`;
    if (palace.key === "wealth") return `How you build value and steward resources serves as an axis connecting security with contribution. ${action}${active ? " An active decade makes decisions here hard to overlook." : ""}`;
    if (palace.isBodyPalace) return `Many of your lessons become real when directly engaged in ${contextMap[palace.key]?.focus || "the featured life area"}. ${action}${active ? " This is a core focus of your developmental phase now." : ""}`;
    return `${contextMap[palace.key]?.opening || "How you enter life is shaped by a recurring area calling for attention."} ${action}${active ? " Active decade focus reinforces this area." : ""}`;
  }
  if (palace.key === "career") return `Tanggung jawab dan kontribusi menjadi jalur penting dalam perkembanganmu. ${action}${active ? " Area ini juga sedang aktif dalam dekade berjalan." : ""}`;
  if (palace.key === "spouse") return `Pertumbuhanmu banyak berlangsung melalui hubungan, komitmen, dan cara menjaga batas. ${action}${active ? " Tema ini sedang meminta keterlibatan yang lebih nyata." : ""}`;
  if (palace.key === "spirit") return `Di balik cara dirimu terlihat, kehidupan batin menjadi ruang utama untuk mengolah pengalaman. ${action}${active ? " Fase kini memperkuat kebutuhan tersebut." : ""}`;
  if (palace.key === "wealth") return `Cara membangun nilai dan mengelola sumber daya menjadi poros yang menghubungkan rasa aman dengan kontribusi. ${action}${active ? " Dekade aktif membuat keputusan di area ini sulit diabaikan." : ""}`;
  if (palace.isBodyPalace) return `Banyak pelajaranmu menjadi nyata ketika kamu terlibat langsung dalam ${PALACE_CONTEXT[palace.key]?.focus || "area hidup yang sedang disorot"}. ${action}${active ? " Inilah salah satu pusat fase perkembanganmu sekarang." : ""}`;
  return `${PALACE_CONTEXT[palace.key]?.opening || "Cara kamu memasuki kehidupan dipengaruhi oleh satu area yang meminta perhatian berulang."} ${action}${active ? " Fokus dekade aktif mempertegas area ini." : ""}`;
}

const humanPalaceName = (name: string, isEn = false) =>
  isEn
    ? name.replace(/ Palace$/i, "").toLowerCase()
    : name.replace(/ Palace$/i, "").replace(/^Life$/i, "identitas").replace(/^Body$/i, "perwujudan diri").toLocaleLowerCase("id-ID");

function supportingContext(palace: ZiWeiPalace, isEn = false): string | null {
  const roles = [...new Set(palace.supportingStars.map((star) => SUPPORT_ROLES[star.canonicalName]).filter(Boolean))];
  if (!roles.length) return null;
  const messagesEn: Record<string, string> = {
    "social support": "Social support lightens this process when you are willing to receive help.",
    communication: "Articulating ideas and reading subtext are vital assets here.",
    pressure: "Tension can accelerate action, but calls for pauses so responses remain measured.",
    solitude: "There is a need to step back before understanding what you truly feel.",
    disruption: "Sudden change teaches you to discern what to keep from what has concluded.",
    sensitivity: "Attunement to atmosphere allows quick perception, yet tires you if boundaries waver.",
    discipline: "Consistency gives tangible form to previously scattered potential.",
    mobility: "Movement and changing environments open fresh avenues.",
  };
  const messagesId: Record<string, string> = {
    "social support": "Dukungan sosial membantu proses ini terasa lebih ringan ketika kamu bersedia menerima bantuan.",
    communication: "Kemampuan menyusun kata dan membaca pesan yang tersirat menjadi alat penting di area ini.",
    pressure: "Tekanan dapat mempercepat tindakan, tetapi juga meminta jeda agar respons tidak menjadi terlalu tajam.",
    solitude: "Ada kebutuhan untuk mundur sejenak sebelum memahami apa yang sesungguhnya dirasakan.",
    disruption: "Perubahan mendadak mengajarkanmu membedakan hal yang perlu dipertahankan dari yang sudah selesai.",
    sensitivity: "Kepekaan terhadap suasana membuatmu cepat menangkap perubahan, sekaligus mudah lelah bila batas tidak dijaga.",
    discipline: "Konsistensi memberi bentuk nyata pada potensi yang sebelumnya masih tersebar.",
    mobility: "Pergerakan dan pergantian lingkungan dapat membuka pilihan baru.",
  };
  const messages = isEn ? messagesEn : messagesId;
  return roles.slice(0, 2).map((role) => messages[role]).join(" ");
}

function transformationContext(transformation: ZiWeiTransformation, isEn = false): string {
  const domain = transformation.palace.replace(" Palace", "").toLowerCase();
  if (isEn) {
    if (transformation.type === "Hua Lu") return `Ease flows more readily through ${domain} themes, especially when curiosity is directed toward what is truly valuable.`;
    if (transformation.type === "Hua Quan") return `The ${domain} domain carries heightened responsibility; leadership must walk alongside awareness of pressure.`;
    if (transformation.type === "Hua Ke") return `Learning and credibility grow through ${domain} themes, especially when experience is distilled into shareable insight.`;
    return `The ${domain} domain can surface recurring patterns or unresolved sensitivities; gentle, honest adjustments serve better than forcing outcomes.`;
  }
  if (transformation.type === "Hua Lu") return `Aliran terasa lebih mudah muncul melalui tema ${domain}, terutama ketika ketertarikan diarahkan pada sesuatu yang benar-benar bernilai.`;
  if (transformation.type === "Hua Quan") return `Tema ${domain} membawa tanggung jawab yang lebih kuat; di sinilah kemampuan memimpin perlu berjalan bersama kesadaran atas tekanan.`;
  if (transformation.type === "Hua Ke") return `Pembelajaran dan kredibilitas bertumbuh melalui tema ${domain}, terutama ketika pengalaman diolah menjadi pemahaman yang dapat dibagikan.`;
  return `Tema ${domain} mudah memunculkan pola berulang atau kepekaan yang belum selesai, sehingga koreksi kecil dan jujur lebih berguna daripada memaksa keadaan.`;
}

function palaceSection(palace: ZiWeiPalace, isEn = false): ZiWeiSection {
  const contextMap = isEn ? PALACE_CONTEXT_EN : PALACE_CONTEXT;
  const context = contextMap[palace.key] ?? contextMap.soul;
  const support = supportingContext(palace, isEn);
  const transformations = palace.majorStars.filter((star) => star.transformation).map((star) => ({
    type: star.transformation!, star: star.canonicalName, palace: palace.name, birthYearStem: "", tableSource: "", calculationStatus: "calculated" as const,
  }));
  const meaning = [
    `${context.opening} ${starSynthesis(palace, isEn)}`,
    support ? `${support} ${transformations.map((t) => transformationContext(t, isEn)).join(" ")}`.trim() : transformations.map((t) => transformationContext(t, isEn)).join(" "),
  ].filter(Boolean);
  return { id: `palace-${palace.key}`, title: palace.name, snapshot: palaceSnapshot(palace, isEn), humanMeaning: meaning, strength: context.strength, challenge: context.challenge, growthDirection: context.growth };
}

function findPalace(result: ZiWeiResult, key: string): ZiWeiPalace | null {
  return result.palaces.find((palace) => palace.key === key) ?? null;
}

function lifeSection(result: ZiWeiResult, isEn = false): ZiWeiSection | null {
  const life = result.lifePalace;
  if (!life) return null;
  const context = isEn ? PALACE_CONTEXT_EN.soul : PALACE_CONTEXT.soul;
  if (isEn) {
    return {
      id: "life-palace", title: "Life Palace", snapshot: palaceSnapshot(life, isEn),
      humanMeaning: [
        `${context.opening} ${starSynthesis(life, isEn)} Others may first notice your resolve and capacity to see what needs doing.`,
        "Behind a composed stance lies a balance between maintaining direction and allowing room for change. Under stress, you can become overly stern with your own decisions or shoulder responsibilities that should be shared.",
        "Your finest qualities serve when clarity does not harden into control. You flourish when leading from a tranquil center, listening without losing orientation, and claiming only the responsibilities that are truly yours.",
      ],
      strength: context.strength, challenge: context.challenge, growthDirection: context.growth,
    };
  }
  return {
    id: "life-palace", title: "Life Palace", snapshot: palaceSnapshot(life, isEn),
    humanMeaning: [
      `${context.opening} ${starSynthesis(life, isEn)} Orang lain mungkin lebih dahulu melihat ketegasan dan kemampuanmu membaca apa yang perlu dilakukan.`,
      "Di balik sikap yang terlihat mantap, ada tarik-menarik antara kebutuhan menjaga arah dan keinginan memberi ruang pada perubahan. Saat tertekan, kamu dapat menjadi terlalu keras pada keputusan sendiri atau memikul tanggung jawab yang seharusnya dibagi.",
      "Kualitas terbaikmu menjadi berguna ketika kejernihan tidak berubah menjadi kontrol. Kamu berkembang saat mampu memimpin dari pusat yang tenang, mendengar tanpa kehilangan arah, dan memilih tanggung jawab yang memang milikmu.",
    ],
    strength: context.strength, challenge: context.challenge, growthDirection: context.growth,
  };
}

function bodySection(result: ZiWeiResult, isEn = false): ZiWeiSection | null {
  const body = result.bodyPalace;
  if (!body) return null;
  const contextMap = isEn ? PALACE_CONTEXT_EN : PALACE_CONTEXT;
  const context = contextMap[body.key] ?? contextMap.soul;
  if (isEn) {
    return {
      id: "body-palace", title: "Body Palace", snapshot: palaceSnapshot(body, isEn),
      humanMeaning: [
        `Life becomes tangible for you through ${context.focus}. ${starSynthesis(body, isEn)} This area repeatedly asks for direct presence, not mere conceptual understanding.`,
        "As pressure increases, you tend to redouble efforts to ensure everything stays on track. Your involvement becomes healthier when action is paired with pauses to verify whether the load remains aligned with inner needs.",
      ],
      strength: context.strength, challenge: context.challenge, growthDirection: context.growth,
    };
  }
  return {
    id: "body-palace", title: "Body Palace", snapshot: palaceSnapshot(body, isEn),
    humanMeaning: [
      `Hidup menjadi nyata bagimu melalui ${context.focus}. ${starSynthesis(body, isEn)} Area ini berulang kali meminta kehadiran langsung, bukan hanya pemahaman dari kejauhan.`,
      "Ketika tekanan meningkat, kamu cenderung menambah usaha dan mencoba memastikan semuanya tetap berjalan. Partisipasimu menjadi lebih sehat saat tindakan diberi jeda untuk memeriksa apakah beban itu masih selaras dengan kebutuhan batin.",
    ],
    strength: context.strength, challenge: context.challenge, growthDirection: context.growth,
  };
}

function bureauSection(result: ZiWeiResult, isEn = false): ZiWeiSection | null {
  if (!result.bureau) return null;
  const rhythmMap = isEn ? BUREAU_RHYTHM_EN : BUREAU_RHYTHM;
  const rhythm = rhythmMap[result.bureau.toLowerCase()] ?? (isEn
    ? ["Your growth unfolds through stages that need to be lived consciously.", "Patience helps experience transform into a dependable foundation."]
    : ["Pertumbuhanmu berlangsung melalui tahapan yang perlu dijalani dengan sadar.", "Kesabaran membantu pengalaman berubah menjadi fondasi yang dapat diandalkan."]);
  return {
    id: "bureau", title: "Five Element Bureau", snapshot: [{ label: "Bureau", value: result.bureau }],
    humanMeaning: rhythm,
    strength: isEn ? "You can transform experience into increasingly refined capability." : "Kamu mampu mengubah pengalaman menjadi kemampuan yang semakin terasah.",
    challenge: isEn ? "What needs care is demanding results before the process has sufficient foundation." : "Yang perlu dijaga adalah menuntut hasil sebelum proses memiliki fondasi yang cukup.",
    growthDirection: isEn ? "Honor your personal tempo and measure progress by depth, not merely speed." : "Hormati tempo perkembanganmu sendiri dan ukur kemajuan dari kedalaman, bukan hanya kecepatan.",
  };
}

function transformationSection(result: ZiWeiResult, isEn = false): ZiWeiSection | null {
  if (!result.fourTransformations.length) return null;
  return {
    id: "transformations", title: "Four Transformations",
    snapshot: result.fourTransformations.map((item) => ({ label: item.type, value: `${item.star} · ${item.palace}` })),
    humanMeaning: result.fourTransformations.map((t) => transformationContext(t, isEn)),
    challenge: isEn
      ? "What needs care is treating a single activation as defining all of life; its meaning always depends on palace context and your conscious choices."
      : "Yang perlu dijaga adalah membaca satu aktivasi sebagai penentu seluruh hidup; maknanya selalu bergantung pada konteks istana dan pilihanmu.",
  };
}

function masterSection(result: ZiWeiResult, isEn = false): ZiWeiSection | null {
  if (!result.lifeMaster || !result.bodyMaster) return null;
  return {
    id: "masters", title: isEn ? "Life Master and Body Master" : "Life Master dan Body Master",
    snapshot: [{ label: "Life Master", value: result.lifeMaster }, { label: "Body Master", value: result.bodyMaster }],
    humanMeaning: isEn
      ? ["Inner orientation and your outward presence remind each other that resolve needs purpose, while action must remain sensitive to the people involved."]
      : ["Arah batin dan caramu hadir di dunia saling mengingatkan bahwa ketegasan perlu memiliki tujuan, sementara tindakan perlu tetap peka pada manusia yang terlibat."],
    growthDirection: isEn
      ? "Use clarity to select a direction, then manifest that choice through fair and accountable steps."
      : "Gunakan kejernihan untuk memilih arah, lalu wujudkan pilihan itu melalui langkah yang adil dan dapat dipertanggungjawabkan.",
  };
}

function activeDecadeSection(result: ZiWeiResult, isEn = false): ZiWeiSection | null {
  const active = result.activeDecade;
  if (!active) return null;
  const palace = result.palaces.find((item) => item.name === active.palace) ?? null;
  const contextMap = isEn ? PALACE_CONTEXT_EN : PALACE_CONTEXT;
  const context = palace ? contextMap[palace.key] : null;
  const noMajor = isEn ? "No Major Star" : "Tidak ada Major Star";
  if (isEn) {
    return {
      id: "active-decade", title: "Active Decade",
      snapshot: [
        { label: "Age range", value: `${active.ageStart}–${active.ageEnd}` },
        { label: "Focus", value: active.palace },
        { label: "Major Stars", value: active.dominantMajorStars.join(" · ") || noMajor },
        ...(active.transformations.length ? [{ label: "Transformation", value: active.transformations.join(" · ") }] : []),
      ],
      humanMeaning: [
        `${context?.opening ?? "Your current life phase brings an essential area to the forefront of your attention."} Matters previously deferred now call for more tangible involvement.`,
        `${palace ? starSynthesis(palace, isEn) : "Opportunity appears when you willingly re-examine old patterns with honesty."} The challenge is replaying responses that once felt safe even when circumstances have shifted.`,
        "Use this phase to clarify priorities, distribute energy mindfully, and take sustainable steps. Progress need not be dramatic; consistent direction yields deeper maturity.",
      ],
      strength: context?.strength, challenge: context?.challenge, growthDirection: context?.growth,
    };
  }
  return {
    id: "active-decade", title: "Active Decade",
    snapshot: [
      { label: "Rentang usia", value: `${active.ageStart}–${active.ageEnd}` },
      { label: "Fokus", value: active.palace },
      { label: "Major Stars", value: active.dominantMajorStars.join(" · ") || noMajor },
      ...(active.transformations.length ? [{ label: "Transformation", value: active.transformations.join(" · ") }] : []),
    ],
    humanMeaning: [
      `${context?.opening ?? "Fase hidup saat ini membawa satu area penting ke depan perhatianmu."} Hal yang sebelumnya dapat ditunda kini meminta keterlibatan yang lebih nyata.`,
      `${palace ? starSynthesis(palace, isEn) : "Kesempatan muncul ketika kamu bersedia membaca ulang pola lama dengan lebih jujur."} Tantangannya adalah mengulang respons yang pernah terasa aman meski keadaan sudah berubah.`,
      "Gunakan fase ini untuk memperjelas prioritas, membagi tenaga secara sadar, dan mengambil langkah yang dapat dipertahankan. Kemajuan tidak harus dramatis; arah yang konsisten akan memberi hasil yang lebih matang.",
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

export function buildZiWeiPresentation(result: ZiWeiResult, options?: { isEn?: boolean } | unknown): ZiWeiPresentation {
  const isEn = typeof options === "object" && options !== null && "isEn" in options
    ? Boolean((options as { isEn?: boolean }).isEn)
    : isEnlEdition();

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
      snapshot: isEn ? [
        { label: "Lunar date", value: `${result.lunarBirth.lunarYear} · month ${result.lunarBirth.lunarMonth} · day ${result.lunarBirth.lunarDay}${result.lunarBirth.isLeapMonth ? " · leap month" : ""}` },
        { label: "Hour branch", value: `${result.lunarBirth.hourBranch} · ${result.lunarBirth.hourRange}` },
      ] : [
        { label: "Tanggal lunar", value: `${result.lunarBirth.lunarYear} · bulan ${result.lunarBirth.lunarMonth} · hari ${result.lunarBirth.lunarDay}${result.lunarBirth.isLeapMonth ? " · leap month" : ""}` },
        { label: "Cabang jam", value: `${result.lunarBirth.hourBranch} · ${result.lunarBirth.hourRange}` },
      ],
      humanMeaning: [isEn
        ? "These data points form the chart's technical foundation. The interpretations that follow translate this structure into lived experience rather than treating lunar calendar data as personality definitions."
        : "Data ini menjadi fondasi teknis chart. Pembacaan berikutnya menerjemahkan struktur tersebut ke dalam pengalaman hidup, bukan menjadikan tanggal dan cabang jam sebagai penjelasan kepribadian."],
    } satisfies ZiWeiSection : null,
    lifeSection(result, isEn), bodySection(result, isEn), bureauSection(result, isEn), transformationSection(result, isEn), masterSection(result, isEn), activeDecadeSection(result, isEn),
  ].filter((section): section is ZiWeiSection => Boolean(section));

  const palaceSections = result.palaces.map((p) => palaceSection(p, isEn));
  const relationship = isEn
    ? themeSection("relationship", "Relationship and Partnership", [spouse, life, body], [
        `In close relationships, you thrive on openness that honors personal space. ${starSynthesis(spouse, isEn)} Intimacy feels secure when emotional needs do not have to be guessed and both partners can express boundaries without guilt.`,
        `A recurring pattern to watch is carrying excessive emotional responsibility or expecting partners to instinctively understand unexpressed needs. When pressure mounts, the desire to preserve harmony can delay necessary conversations.`,
        `Partnerships deepen when mutual support avoids tipping into rescue dynamics. Gentle honesty, distinct role sharing, and a shared commitment to growth create a durable foundation.`,
      ], "What needs care is sacrificing personal boundaries just to preserve proximity.", "Build closeness through clear conversations rather than assumptions or silent testing.")
    : themeSection("relationship", "Relationship and Partnership", [spouse, life, body], [
        `Dalam hubungan dekat, kamu membutuhkan keterbukaan yang tetap menghormati ruang pribadi. ${starSynthesis(spouse, isEn)} Kedekatan terasa aman ketika kebutuhan tidak harus ditebak dan kedua pihak dapat menyampaikan batas tanpa rasa bersalah.`,
        `Pola yang perlu diperhatikan adalah mengambil terlalu banyak tanggung jawab emosional atau berharap pasangan memahami sesuatu yang belum diucapkan. Saat tekanan meningkat, kebutuhan menjaga harmoni dapat membuat percakapan penting tertunda.`,
        `Hubungan menjadi lebih matang ketika dukungan tidak berubah menjadi penyelamatan. Kejujuran yang lembut, pembagian peran yang jelas, dan kesediaan bertumbuh bersama memberi fondasi yang lebih sehat.`,
      ], "Yang perlu dijaga adalah mengorbankan batas diri demi mempertahankan kedekatan.", "Bangun kedekatan melalui percakapan yang jernih, bukan asumsi atau pengujian diam-diam.");

  const wealthTheme = isEn
    ? themeSection("wealth", "Wealth and Resources", [wealth, career, property], [
        `When managing resources, security grows from discerning the relationship between effort, value, and outcomes. ${starSynthesis(wealth, isEn)} Contribution produces lasting value when skills receive disciplined structure and consistent application.`,
        `Instability can arise when control is used to soothe anxiety or when commitments are accepted without defined scope. Your domestic foundation and daily workflow directly influence your sense of sufficiency.`,
        `A mature approach builds sustainable capacity, sets clear priorities, and allows flexibility for realignment. This reflection is symbolic context, not guaranteed fortune or financial advice.`,
      ], "What needs care is measuring security solely by what can be tightly controlled.", "Translate contribution into value through sustainable rhythm and conscious decision-making.")
    : themeSection("wealth", "Wealth and Resources", [wealth, career, property], [
        `Ketika menyangkut sumber daya, rasa aman tumbuh dari kemampuan melihat hubungan antara usaha, nilai, dan hasil. ${starSynthesis(wealth, isEn)} Kontribusi menjadi bernilai ketika keterampilan diberi struktur dan dijalankan secara konsisten.`,
        `Ketidakstabilan lebih mudah muncul saat kontrol dipakai untuk meredakan kecemasan atau ketika tanggung jawab diterima tanpa batas yang jelas. Fondasi rumah dan ritme kerja ikut memengaruhi caramu merasa cukup.`,
        `Arah yang matang adalah membangun kapasitas yang dapat bertahan, memahami prioritas, dan memberi ruang bagi penyesuaian. Bagian ini merupakan refleksi simbolik, bukan janji hasil atau nasihat finansial.`,
      ], "Yang perlu dijaga adalah mengukur keamanan hanya dari apa yang dapat dikendalikan.", "Ubah kontribusi menjadi nilai melalui ritme yang konsisten dan keputusan yang sadar.");

  const careerTheme = isEn
    ? themeSection("career", "Career and Contribution", [career, life, body, wealth], [
        `In professional environments, you naturally gravitate toward responsibilities with clear direction and tangible impact. ${starSynthesis(career, isEn)} Your leadership resonates most when others understand the rationale behind decisions.`,
        `Visibility can feel rewarding yet demanding. There is a tendency to elevate standards whenever results fall short of expectations, even though long-term mastery requires space for experimentation and shared load.`,
        `Your contribution matures when resolve is used to establish supportive structures that elevate everyone. This chart does not dictate a single job title; what matters is the quality and integrity of responsibility you build over time.`,
      ], "What needs care is allowing productivity to become the sole metric of self-worth.", "Lead through clarity, shared ownership, and meaningful outcomes that benefit your community.")
    : themeSection("career", "Career and Contribution", [career, life, body, wealth], [
        `Di ruang kerja, kamu cenderung mencari tanggung jawab yang memiliki arah jelas dan manfaat nyata. ${starSynthesis(career, isEn)} Kepemimpinanmu paling efektif ketika orang lain memahami alasan di balik sebuah keputusan.`,
        `Visibilitas dapat terasa penting sekaligus menekan. Ada kecenderungan menambah standar ketika hasil belum sesuai harapan, padahal proses jangka panjang membutuhkan ruang belajar dan pembagian beban.`,
        `Kontribusimu matang saat ketegasan dipakai untuk menciptakan struktur yang membantu banyak orang bertumbuh. Tidak ada satu jabatan yang ditentukan oleh chart ini; yang lebih penting adalah kualitas tanggung jawab yang kamu bangun dari waktu ke waktu.`,
      ], "Yang perlu dijaga adalah menjadikan produktivitas sebagai satu-satunya ukuran nilai diri.", "Pimpin melalui kejelasan, pembagian tanggung jawab, dan hasil yang berguna bagi lingkungan.");

  const homeTheme = isEn
    ? themeSection("home", "Home and Family", [property, findPalace(result, "parents"), findPalace(result, "siblings"), findPalace(result, "children"), spirit], [
        `Belonging deepens when the home environment provides both restorative sanctuary and freedom to be yourself. ${starSynthesis(property, isEn)} Family becomes a space for learning healthy boundaries, reciprocal support, and conscious obligation.`,
        `You evolve when you honor ancestral heritage without feeling compelled to replicate inherited patterns. Warmth becomes tangible when responsibilities are openly negotiated rather than silently carried.`,
      ], "What needs care is assuming every family need is your personal responsibility to fix.", "Cultivate belonging through active presence, candid communication, and mutually agreed boundaries.")
    : themeSection("home", "Home and Family", [property, findPalace(result, "parents"), findPalace(result, "siblings"), findPalace(result, "children"), spirit], [
        `Rasa memiliki tumbuh ketika rumah memberi ruang untuk beristirahat sekaligus menjadi diri sendiri. ${starSynthesis(property, isEn)} Keluarga dapat menjadi tempat belajar tentang dukungan, kewajiban, dan batas yang sehat.`,
        `Kamu berkembang saat mampu menghormati warisan tanpa harus mengulang seluruh polanya. Kehangatan menjadi lebih nyata ketika tanggung jawab dibicarakan dan tidak dipikul diam-diam.`,
      ], "Yang perlu dijaga adalah menganggap semua kebutuhan keluarga sebagai tanggung jawab pribadi.", "Bangun rasa memiliki melalui kehadiran, percakapan, dan batas yang dapat dipahami bersama.");

  const healthTheme = isEn
    ? themeSection("health", "Health and Balance", [health], [
        `Everyday vitality is shaped by how you regulate pacing, pauses, and emotional load. ${starSynthesis(health, isEn)} The body cooperates far better when internal rhythms are protected from shifting external pressures.`,
        `Mindful attention to sleep, movement, restorative downtime, and realistic daily capacity helps you recognize when renewal is overdue. This is symbolic context for self-awareness and never replaces professional healthcare guidance.`,
      ], "What needs care is waiting until energy is entirely depleted before stopping.", "Nurture balance through rhythmic pauses and realistic work thresholds.")
    : themeSection("health", "Health and Balance", [health], [
        `Keseimbangan sehari-hari sangat dipengaruhi oleh cara kamu mengatur kecepatan, jeda, dan beban emosional. ${starSynthesis(health, isEn)} Tubuh lebih mudah diajak bekerja sama ketika ritme tidak terus berubah mengikuti tuntutan luar.`,
        `Perhatian sederhana pada tidur, gerak, istirahat, dan kapasitas harian membantu mengenali kapan tenaga perlu dipulihkan. Ini adalah konteks simbolik untuk kesadaran diri dan tidak menggantikan pertimbangan kesehatan profesional.`,
      ], "Yang perlu dijaga adalah baru berhenti setelah tenaga benar-benar terkuras.", "Rawat keseimbangan melalui jeda teratur dan batas beban yang realistis.");

  const travelTheme = isEn
    ? themeSection("travel", "Travel and External World", [travel, friends, career], [
        `Venturing beyond your familiar environment broadens perspective and introduces valuable networks. ${starSynthesis(travel, isEn)} You learn most when remaining receptive without losing your grounded center.`,
        `Mobility serves you best when anchored in clear intent rather than escaping restlessness. This section addresses engagement with the outer world and does not replace Astrocartography.`,
      ], "What needs care is dispersing focus across too many scattered directions at once.", "Select environments that expand your horizons while respecting your inner needs.")
    : themeSection("travel", "Travel and External World", [travel, friends, career], [
        `Perjumpaan di luar lingkungan yang biasa dapat memperluas cara pandang dan mempertemukanmu dengan jaringan baru. ${starSynthesis(travel, isEn)} Kamu belajar banyak ketika tetap terbuka tanpa kehilangan pusat diri.`,
        `Mobilitas menjadi paling berguna ketika memiliki tujuan, bukan sekadar menjauh dari kejenuhan. Bagian ini berbicara tentang respons terhadap dunia luar dan tidak menggantikan pembacaan Astrocartography.`,
      ], "Yang perlu dijaga adalah menyebarkan perhatian ke terlalu banyak arah sekaligus.", "Pilih lingkungan yang memperluas kapasitas sekaligus menghormati kebutuhan batin.");

  const spiritualTheme = isEn
    ? themeSection("spiritual", "Inner Life and Spiritual Growth", [spirit, life, body], [
        `Your inner life needs spaciousness to distill experiences into wisdom that can be lived. ${starSynthesis(spirit, isEn)} Deep insight often emerges only after releasing the urgency for quick answers.`,
        `Spiritual maturation grounds itself in daily choices, relational boundaries, and mindful conduct. It requires no grandiose claims; humble consistency is often the most profound integration.`,
      ], "What needs care is using contemplation to postpone clear, necessary actions.", "Anchor inner realization into simple everyday habits and ethical choices.")
    : themeSection("spiritual", "Inner Life and Spiritual Growth", [spirit, life, body], [
        `Kehidupan batinmu membutuhkan ruang untuk mengolah pengalaman menjadi makna yang dapat dijalani. ${starSynthesis(spirit, isEn)} Pemahaman terdalam sering muncul setelah kamu berhenti mengejar jawaban cepat.`,
        `Pertumbuhan spiritual menjadi membumi ketika hadir dalam cara memilih, berelasi, dan menjaga batas. Ia tidak membutuhkan klaim luar biasa; konsistensi kecil sering menjadi bentuk integrasi yang paling nyata.`,
      ], "Yang perlu dijaga adalah menggunakan perenungan untuk menunda tindakan yang sebenarnya sudah jelas.", "Turunkan pemahaman batin menjadi kebiasaan sederhana yang dapat dijalankan setiap hari.");

  const themes = [relationship, wealthTheme, careerTheme, homeTheme, healthTheme, travelTheme, spiritualTheme];
  if (active) {
    const devSection = isEn
      ? themeSection("development", "Current Developmental Theme", [result.palaces.find((palace) => palace.name === active.palace) ?? null], [
          `Your active lesson invites fuller engagement with a life domain that can no longer be bypassed. Old patterns may resurface, not as punishment, but to illuminate choices previously running on autopilot.`,
          `Your strength lies in clarifying direction and remaining present when adjustments are demanded. Maturity deepens when obligations are chosen consciously, resources allocated realistically, and progress built via steady momentum.`,
        ], "What needs care is repeating familiar defenses merely because they once felt comfortable.", "Use this period to clarify priorities, establish healthy boundaries, and practice sustainable shifts.")
      : themeSection("development", "Current Developmental Theme", [result.palaces.find((palace) => palace.name === active.palace) ?? null], [
          `Pelajaran yang sedang aktif adalah berpartisipasi lebih penuh pada area hidup yang kini sulit diabaikan. Pola lama dapat muncul kembali, bukan untuk menghukum, tetapi agar kamu melihat pilihan yang sebelumnya berjalan otomatis.`,
          `Kekuatanmu terletak pada kemampuan memperjelas arah dan tetap hadir ketika keadaan meminta penyesuaian. Kematangan tumbuh saat tanggung jawab dipilih dengan sadar, tenaga dibagi secara realistis, dan kemajuan dibangun melalui langkah yang konsisten.`,
        ], "Yang perlu dijaga adalah mengulang respons lama hanya karena pernah terasa aman.", "Gunakan fase ini untuk memilih prioritas, membangun batas, dan mempraktikkan perubahan yang dapat dipertahankan.");
    themes.push(devSection);
  }

  const emphasis = summaryEmphasis(result);
  const transformationFocus = result.fourTransformations
    .slice()
    .sort((left, right) => left.type.localeCompare(right.type) || left.palace.localeCompare(right.palace))
    .slice(0, 2);
  const activePalace = active ? result.palaces.find((palace) => palace.name === active.palace) || null : null;
  const contextMap = isEn ? PALACE_CONTEXT_EN : PALACE_CONTEXT;
  const bureauRhythmMap = isEn ? BUREAU_RHYTHM_EN : BUREAU_RHYTHM;
  const bureauRhythm = result.bureau ? bureauRhythmMap[result.bureau.toLowerCase()]?.[0] : null;

  let summary: string[] = [];
  if (life && body && result.bureau && emphasis) {
    if (isEn) {
      summary = [
        `${emphasisOpening(emphasis, result, isEn)} ${contextMap[emphasis.key]?.growth || "Maturity expands when core strengths are engaged in balance with context and capacity."}`,
        `${life === emphasis
          ? `How experience materializes through ${humanPalaceName(body.name, isEn)} indicates where core patterns must translate into tangible action.`
          : `Your central orientation provides ${summarySynthesis(life, isEn).replace(/^You naturally /, "the capacity to ").replace(/^Your core drive is to /, "the drive to ")}, while ${humanPalaceName(body.name, isEn)} anchors that learning in ${contextMap[body.key]?.focus || "direct experience"}.`
        } ${bureauRhythm || "Developmental rhythms ask that each phase be lived with presence."} ${contextMap[body.key]?.growth || "Action becomes healthier when burdens and objectives are examined honestly together."}`,
        transformationFocus.length
          ? `Transformational activations provide specific directional focus. ${transformationFocus.map((t) => transformationContext(t, isEn)).join(" ")} The convergence of these influences reveals that ease and tension should be understood within the specific life areas where they operate, rather than as fixed traits.`
          : `Transformational activations are not sufficiently detailed to serve as the sole interpretive anchor. The interconnected relationship between life areas remains the core foundation.`,
        active && activePalace
          ? `Between ages ${active.ageStart} and ${active.ageEnd}, ${humanPalaceName(active.palace, isEn)} serves as your active developmental arena. ${summarySynthesis(activePalace, isEn)} Integration involves applying the strength of ${humanPalaceName(emphasis.name, isEn)} to address these themes without taking on burdens that should be shared.`
          : `Active decade is unverified. Integration continues to rely on the synergy between ${humanPalaceName(emphasis.name, isEn)}, ${humanPalaceName(life.name, isEn)}, and ${humanPalaceName(body.name, isEn)}. Prioritize responsibilities aligned with your authentic capacity.`,
      ];
    } else {
      summary = [
        `${emphasisOpening(emphasis, result, isEn)} ${PALACE_CONTEXT[emphasis.key]?.growth || "Kematangan tumbuh ketika kekuatan utama dipakai sesuai konteks dan kapasitas."}`,
        `${life === emphasis ? `Cara pengalaman menjadi nyata melalui ${humanPalaceName(body.name)} menunjukkan tempat pola identitas perlu diwujudkan melalui tindakan.` : `Arah identitas membawa ${summarySynthesis(life).replace(/^Kamu /, "kemampuan untuk ").replace(/^Dorongan utamamu adalah /, "dorongan untuk ")}, sementara ${humanPalaceName(body.name)} membawa pelajaran itu ke ${PALACE_CONTEXT[body.key]?.focus || "pengalaman langsung"}.`} ${bureauRhythm || "Ritme perkembangan meminta setiap tahap dijalani dengan sadar."} ${PALACE_CONTEXT[body.key]?.growth || "Tindakan menjadi lebih sehat ketika beban dan tujuan diperiksa bersama."}`,
        transformationFocus.length ? `Aktivasi perubahan memberi arah yang lebih khusus. ${transformationFocus.map((t) => transformationContext(t, isEn)).join(" ")} Pertemuan dua aktivasi ini menunjukkan bahwa kemudahan dan tekanan perlu dibaca melalui wilayah hidup tempat keduanya bekerja, bukan sebagai sifat tunggal.` : `Aktivasi perubahan belum cukup lengkap untuk dijadikan pusat sintesis. Hubungan antarwilayah hidup tetap menjadi dasar pembacaan. Karena itu, tidak ada satu fungsi yang dipaksa menjelaskan seluruh pengalaman.`,
        active && activePalace ? `Pada usia ${active.ageStart}–${active.ageEnd}, ${humanPalaceName(active.palace)} menjadi wilayah perkembangan aktif. ${summarySynthesis(activePalace)} Arah integrasinya adalah memakai kekuatan ${humanPalaceName(emphasis.name)} untuk merespons tema tersebut tanpa mengulang beban yang seharusnya dapat dibagi.` : `Dekade aktif belum terverifikasi. Arah integrasi tetap bertumpu pada hubungan antara ${humanPalaceName(emphasis.name)}, ${humanPalaceName(life.name)}, dan ${humanPalaceName(body.name)}. Pilih tanggung jawab yang selaras dengan kapasitas nyata.`,
      ];
    }
  }

  const heroFacts: ZiWeiSnapshot[] = [];
  if (life) heroFacts.push({ label: "Life Palace", value: `${life.heavenlyStem} · ${life.earthlyBranch}` });
  if (body) heroFacts.push({ label: "Body Palace", value: body.name });
  if (result.bureau) heroFacts.push({ label: "Bureau", value: result.bureau });
  if (active) heroFacts.push({ label: "Active Decade", value: `${active.ageStart}–${active.ageEnd}` });

  return {
    status: result.status,
    hero: {
      title: isEn ? "Your Life Palaces and Stars Blueprint" : "Peta Istana dan Bintang Kehidupanmu",
      facts: heroFacts.slice(0, 4),
      insight: life
        ? (isEn
            ? "Your strength deepens when resolve provides clear direction, while empathy remains present in every choice."
            : "Kekuatanmu tumbuh ketika ketegasan dipakai untuk memberi arah, sementara kepekaan tetap mendapat ruang dalam setiap keputusan.")
        : (isEn
            ? "An accurate birth time is required so this reading is grounded in certainty rather than approximation."
            : "Waktu lahir yang tepat diperlukan agar pembacaan tidak dibangun dari perkiraan."),
    },
    identity, palaceSections, themeSections: themes, summary, notices: result.birthDataStatus.notes,
  };
}
