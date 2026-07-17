import type {
  PlanetaryStrength,
  VedicBlueprint,
  VedicPartialBlueprint,
  VedicDashaPeriod,
  VedicGraha,
  VedicKaraka,
  VedicPlacement,
  VedicSignPoint,
} from "./types";

export const VEDIC_PRESENTATION_SOURCE_VERSION = "vedic-presentation-r5-1.0.0";

type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export type VedicPresentationInput = DeepPartial<VedicBlueprint>;

export type VedicSectionContract = {
  sectionId: string;
  label: string;
  rawValue: string | number | boolean | null;
  displayValue: string;
  sign: string | null;
  house: number | null;
  nakshatra: string | null;
  pada: number | null;
  retrogradeStatus: "Retrograde" | "Direct" | null;
  shortExplanation: string;
  fullExplanation: string;
  sourceType: "CANONICAL_VEDIC_RESULT" | "PRESENTATION_DICTIONARY" | "CANONICAL_SYNTHESIS";
  sourceVersion: string;
  availabilityStatus: "available";
  canonicalStatus: "canonical" | "derived-presentation";
};

export type VedicSectionGroup = {
  groupId: string;
  title: string;
  sections: VedicSectionContract[];
};

export type VedicIdentityReadContract = {
  lagna: VedicSectionContract | null;
  rashi: VedicSectionContract | null;
  sun: VedicSectionContract | null;
  moon: VedicSectionContract | null;
  nakshatra: VedicSectionContract | null;
  pada: VedicSectionContract | null;
  atmakaraka: VedicSectionContract | null;
  darakaraka: VedicSectionContract | null;
  mercury: VedicSectionContract | null;
  venus: VedicSectionContract | null;
  mars: VedicSectionContract | null;
  jupiter: VedicSectionContract | null;
  saturn: VedicSectionContract | null;
  rahu: VedicSectionContract | null;
  ketu: VedicSectionContract | null;
  houses: VedicSectionContract[];
  planetaryStrength: VedicSectionContract | null;
  retrogradePlanets: VedicSectionContract | null;
  mahadasha: VedicSectionContract | null;
  antardasha: VedicSectionContract | null;
  currentDashaThemes: VedicSectionContract | null;
  strengths: VedicSectionContract | null;
  challenges: VedicSectionContract | null;
  relationshipThemes: VedicSectionContract | null;
  workThemes: VedicSectionContract | null;
  growthDirection: VedicSectionContract | null;
  summary: string[];
  sourceVersion: string;
};

export type VedicPresentation = {
  status: "complete" | "partial" | "unavailable";
  canonicalName: "Vedic Astrology";
  hero: {
    title: "Peta Langit Vedikmu";
    lagna: string | null;
    rashi: string | null;
    nakshatra: string | null;
    insight: string;
    action: "Lihat detail selengkapnya";
  };
  profileCard: {
    title: "Vedic Astrology";
    lagna: string | null;
    rashi: string | null;
    nakshatra: string | null;
    insight: string;
    action: "Lihat detail selengkapnya";
    href: "/blueprint/vedic";
  };
  groups: VedicSectionGroup[];
  readContract: VedicIdentityReadContract;
  summary: string[];
  summaryText: string;
  sourceVersion: string;
};

export type VedicPresentationOptions = {
  birthTimeAvailable?: boolean;
};

type PlanetTheme = { function: string; gift: string; caution: string; opening: string };

const PLANET_THEMES: Record<VedicGraha, PlanetTheme> = {
  Sun: { function: "daya hidup, keyakinan diri, dan arah tujuan", gift: "berdiri pada pilihan yang terasa bermakna", caution: "memaksakan kepastian ketika keadaan masih perlu dibaca", opening: "Pusat vitalitasmu" },
  Moon: { function: "kebutuhan emosional, respons naluriah, dan rasa aman", gift: "mengenali ritme batin sebelum merespons", caution: "membiarkan reaksi sesaat mengambil alih arah", opening: "Ritme batinmu" },
  Mercury: { function: "cara berpikir, belajar, menafsirkan, dan berkomunikasi", gift: "mengubah pengamatan menjadi bahasa yang dapat dipakai", caution: "terlalu lama tinggal di kepala", opening: "Cara pikirmu" },
  Venus: { function: "kasih sayang, nilai, ketertarikan, dan penghargaan diri", gift: "membangun kedekatan yang selaras dengan nilai pribadi", caution: "mengorbankan kebutuhan sendiri demi menjaga suasana", opening: "Cara hatimu mendekat" },
  Mars: { function: "dorongan, keberanian, konflik, dan tindakan", gift: "menggerakkan niat menjadi langkah nyata", caution: "bertindak sebelum arah dan dampaknya cukup jelas", opening: "Tenaga tindakanmu" },
  Jupiter: { function: "pertumbuhan, pengetahuan, makna, dan perluasan wawasan", gift: "melihat kemungkinan yang lebih luas", caution: "menjanjikan lebih banyak daripada yang dapat ditopang", opening: "Ruang pertumbuhanmu" },
  Saturn: { function: "tanggung jawab, batas, disiplin, dan pendewasaan", gift: "membangun sesuatu yang bertahan melalui ketekunan", caution: "mengubah standar menjadi tekanan yang kaku", opening: "Proses pendewasaanmu" },
  Rahu: { function: "dorongan menuju pengalaman baru, ambisi, dan perluasan duniawi", gift: "bereksperimen di wilayah yang belum akrab", caution: "mengejar intensitas tanpa mengukur kecukupan", opening: "Arah perluasanmu" },
  Ketu: { function: "kecenderungan yang sudah akrab, pelepasan, dan pemurnian", gift: "menggunakan keterampilan yang telah terasa alami", caution: "menjauh terlalu cepat dari pengalaman yang masih perlu dihidupi", opening: "Pola yang sudah akrab" },
};

const SIGN_STYLE: Record<string, string> = {
  Aries: "langsung, berani, dan cepat memulai", Taurus: "stabil, sabar, dan berorientasi pada sesuatu yang nyata",
  Gemini: "lincah, ingin tahu, dan komunikatif", Cancer: "peka, protektif, dan menjaga rasa aman",
  Leo: "hangat, kreatif, dan berani terlihat", Virgo: "teliti, praktis, dan terdorong memperbaiki",
  Libra: "relasional, adil, dan peka pada keseimbangan", Scorpio: "intens, strategis, dan bersedia berubah mendalam",
  Sagittarius: "terbuka, visioner, dan mencari makna", Capricorn: "disiplin, realistis, dan tahan menjalani proses",
  Aquarius: "mandiri, sistemik, dan tertarik pada pembaruan", Pisces: "imajinatif, empatik, dan intuitif",
};

const SIGN_CAUTION: Record<string, string> = {
  Aries: "memberi jeda sebelum bergerak", Taurus: "tetap lentur saat pola lama tidak lagi bekerja",
  Gemini: "menjaga fokus agar perhatian tidak tercerai", Cancer: "membedakan intuisi dari kekhawatiran",
  Leo: "berkarya tanpa bergantung pada pengakuan", Virgo: "mengurangi kritik berlebih pada diri sendiri",
  Libra: "berani memilih tanpa menunggu semua orang setuju", Scorpio: "membangun kepercayaan tanpa mengontrol",
  Sagittarius: "membumikan visi menjadi komitmen", Capricorn: "memberi ruang pada kelembutan dan istirahat",
  Aquarius: "tetap hadir secara emosional saat berpikir jauh", Pisces: "menjaga batas agar tidak menyerap semuanya",
};

const NAKSHATRA_THEMES: Record<string, { motivation: string; gift: string; challenge: string }> = {
  Ashwini: { motivation: "memulai pemulihan dan gerak baru", gift: "respons cepat yang menghidupkan", challenge: "tergesa sebelum proses siap" },
  Bharani: { motivation: "menanggung proses perubahan sampai matang", gift: "daya tahan dan kesetiaan pada nilai", challenge: "memikul terlalu banyak sendiri" },
  Krittika: { motivation: "memilah yang jernih dari yang tidak lagi berguna", gift: "ketegasan dan ketajaman", challenge: "kritik yang terlalu keras" },
  Rohini: { motivation: "menumbuhkan keindahan dan kestabilan", gift: "daya cipta yang subur", challenge: "melekat pada kenyamanan" },
  Mrigashira: { motivation: "mencari jawaban melalui pengalaman", gift: "rasa ingin tahu dan keluwesan", challenge: "terus mencari tanpa menetap" },
  Ardra: { motivation: "menemukan kebenaran di balik perubahan", gift: "keberanian menghadapi kerumitan", challenge: "terseret intensitas" },
  Punarvasu: { motivation: "kembali pada inti setelah perjalanan", gift: "kemampuan memulai ulang", challenge: "mengulang tanpa belajar" },
  Pushya: { motivation: "merawat pertumbuhan yang berkelanjutan", gift: "dukungan yang meneguhkan", challenge: "melupakan kebutuhan sendiri" },
  Ashlesha: { motivation: "memahami lapisan tersembunyi", gift: "intuisi strategis", challenge: "menahan atau mengikat terlalu kuat" },
  Magha: { motivation: "menghormati warisan dan martabat", gift: "kepemimpinan yang berakar", challenge: "terikat pada status" },
  "Purva Phalguni": { motivation: "menghidupkan kreativitas dan kenikmatan", gift: "kehangatan sosial", challenge: "menghindari tanggung jawab yang tidak nyaman" },
  "Uttara Phalguni": { motivation: "membangun komitmen yang bermanfaat", gift: "kemurahan hati yang terstruktur", challenge: "memberi melampaui kapasitas" },
  Hasta: { motivation: "mewujudkan niat melalui keterampilan", gift: "ketangkasan dan kecermatan", challenge: "ingin mengendalikan hasil" },
  Chitra: { motivation: "membentuk sesuatu yang indah dan bermakna", gift: "visi desain dan ketelitian", challenge: "mengejar kesempurnaan" },
  Swati: { motivation: "menemukan arah secara mandiri", gift: "adaptasi dan diplomasi", challenge: "terombang-ambing terlalu lama" },
  Vishakha: { motivation: "mencapai tujuan melalui fokus", gift: "ketekunan dan ambisi", challenge: "mengukur diri hanya dari pencapaian" },
  Anuradha: { motivation: "bertumbuh melalui kesetiaan dan kerja sama", gift: "persahabatan yang mendalam", challenge: "mengabaikan batas pribadi" },
  Jyeshtha: { motivation: "memikul tanggung jawab dengan matang", gift: "proteksi dan kecakapan", challenge: "merasa harus selalu kuat" },
  Mula: { motivation: "menemukan akar dari sebuah pengalaman", gift: "kejujuran transformatif", challenge: "membongkar tanpa menyiapkan ruang baru" },
  "Purva Ashadha": { motivation: "memperjuangkan keyakinan yang menghidupkan", gift: "semangat dan daya persuasi", challenge: "sulit menerima koreksi" },
  "Uttara Ashadha": { motivation: "membangun kemenangan yang bertahan", gift: "integritas dan keteguhan", challenge: "membebani diri dengan kewajiban" },
  Shravana: { motivation: "belajar melalui mendengar dan menghubungkan", gift: "pemahaman yang dapat dibagikan", challenge: "terlalu mengikuti suara luar" },
  Dhanishta: { motivation: "menyatukan ritme pribadi dan kontribusi", gift: "koordinasi dan daya berkarya", challenge: "mengabaikan ritme batin" },
  Shatabhisha: { motivation: "memahami sistem dan memulihkan yang rumit", gift: "pengamatan independen", challenge: "menutup diri saat terbebani" },
  "Purva Bhadrapada": { motivation: "menghidupi ideal dengan intens", gift: "visi dan kedalaman", challenge: "berpikir terlalu ekstrem" },
  "Uttara Bhadrapada": { motivation: "menstabilkan kedalaman menjadi kebijaksanaan", gift: "ketenangan dan daya tahan", challenge: "menyimpan beban terlalu lama" },
  Revati: { motivation: "menuntun perjalanan menuju penyelesaian", gift: "belas kasih dan orientasi", challenge: "kehilangan batas saat membantu" },
};

const PADA_THEMES: Record<number, { tone: string; practice: string }> = {
  1: { tone: "lebih langsung, mandiri, dan berinisiatif", practice: "mengatur tenaga awal agar tidak cepat habis" },
  2: { tone: "lebih praktis, stabil, dan berorientasi hasil", practice: "membiarkan proses berkembang tanpa terlalu melekat pada bentuk" },
  3: { tone: "lebih komunikatif, adaptif, dan sosial", practice: "menjaga pesan tetap utuh ketika banyak kemungkinan muncul" },
  4: { tone: "lebih emosional, reflektif, dan peka pada hubungan", practice: "membangun batas yang hangat agar kepekaan tetap menjadi kekuatan" },
};

const HOUSE_LABELS: Record<number, string> = {
  1: "Identitas dan Kehadiran", 2: "Nilai, Sumber Daya, dan Suara", 3: "Belajar, Komunikasi, dan Keberanian",
  4: "Rumah, Akar, dan Keamanan Batin", 5: "Kreativitas, Ekspresi, dan Pembelajaran", 6: "Rutinitas, Pelayanan, dan Perbaikan",
  7: "Kemitraan dan Relasi Dekat", 8: "Perubahan, Keintiman, dan Sumber Daya Bersama", 9: "Makna, Keyakinan, dan Wawasan",
  10: "Karier dan Kontribusi Publik", 11: "Komunitas, Jaringan, dan Harapan", 12: "Retret, Pelepasan, dan Dunia Batin",
};

const isText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isHouse = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 12;
const isPada = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 4;
const styleFor = (sign: string | undefined) => sign && SIGN_STYLE[sign] ? SIGN_STYLE[sign] : "membaca keadaan dengan caranya sendiri";
const cautionFor = (sign: string | undefined) => sign && SIGN_CAUTION[sign] ? SIGN_CAUTION[sign] : "memberi ruang untuk meninjau respons sebelum melangkah";

function createSection(input: Omit<VedicSectionContract, "sourceVersion" | "availabilityStatus">): VedicSectionContract {
  return { ...input, sourceVersion: VEDIC_PRESENTATION_SOURCE_VERSION, availabilityStatus: "available" };
}

function pointSection(
  sectionId: "lagna" | "sun" | "moon" | "rashi",
  label: string,
  point: DeepPartial<VedicSignPoint> | undefined,
  options: { timeVerified: boolean; nakshatra?: string; pada?: number },
): VedicSectionContract | null {
  if (!isText(point?.sign) || (sectionId === "lagna" && !options.timeVerified)) return null;
  const sign = point.sign;
  const house = options.timeVerified && isHouse(point.house) ? point.house : null;
  const degree = typeof point.degree === "number" && Number.isFinite(point.degree) ? `${point.degree.toFixed(2)}°` : null;
  const location = [sign, degree, house ? `House ${house}` : null].filter(Boolean).join(" · ");
  let shortExplanation = `Ekspresi ${sign} membawa cara yang ${styleFor(sign)}.`;
  let fullExplanation = "";
  if (sectionId === "lagna") {
    shortExplanation = `Lagna ${sign} memberi pendekatan awal yang ${styleFor(sign)}.`;
    fullExplanation = `Kamu cenderung memasuki situasi baru dengan cara yang ${styleFor(sign)}, dan kualitas ini terasa melalui kehadiran tubuh maupun cara bersosialisasi. Pengalaman membuat pendekatan tersebut semakin matang ketika kamu belajar ${cautionFor(sign)}. Lagna di sini dibaca sebagai pola perkembangan, bukan sekadar penampilan atau topeng.`;
  } else if (sectionId === "sun") {
    fullExplanation = `Pusat vitalitasmu bergerak dengan cara yang ${styleFor(sign)}${house ? `, terutama melalui ranah House ${house}` : ""}. Keyakinan dan arah tujuan menguat ketika kamu berani berdiri pada hal yang bermakna tanpa harus selalu membuktikan diri. Yang perlu dijaga adalah ${cautionFor(sign)}.`;
  } else if (sectionId === "moon") {
    const lunarDetail = options.nakshatra ? ` Corak ini diperdalam oleh Nakshatra ${options.nakshatra}${options.pada ? `, Pada ${options.pada}` : ""}.` : "";
    fullExplanation = `Ritme batinmu mencari rasa aman melalui cara yang ${styleFor(sign)}${house ? `, dengan pengalaman emosional sering terarah pada House ${house}` : ""}.${lunarDetail} Saat menghadapi tekanan, memberi nama pada kebutuhan sebelum bereaksi membantu kepekaanmu bekerja lebih jernih.`;
  } else {
    shortExplanation = `Rashi ${sign} adalah identitas teknis Moon sign dalam pembacaan ini.`;
    fullExplanation = `Rashi ${sign} menandai posisi Moon secara sidereal dan menjadi orientasi teknis bagi ritme batinmu. Penjelasan pengalaman emosional lengkap dimiliki bagian Moon agar nilai yang sama tidak diulang secara mekanis.`;
  }
  return createSection({
    sectionId, label, rawValue: sign, displayValue: location, sign, house,
    nakshatra: sectionId === "moon" && isText(options.nakshatra) ? options.nakshatra : null,
    pada: sectionId === "moon" && isPada(options.pada) ? options.pada : null,
    retrogradeStatus: null, shortExplanation, fullExplanation,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function nakshatraSection(name: unknown): VedicSectionContract | null {
  if (!isText(name) || !NAKSHATRA_THEMES[name]) return null;
  const theme = NAKSHATRA_THEMES[name];
  return createSection({
    sectionId: "nakshatra", label: "Nakshatra", rawValue: name, displayValue: name, sign: null, house: null,
    nakshatra: name, pada: null, retrogradeStatus: null,
    shortExplanation: `Motivasi simboliknya bergerak melalui dorongan untuk ${theme.motivation}.`,
    fullExplanation: `Ada bagian dalam dirimu yang terdorong untuk ${theme.motivation}, sehingga ${theme.gift} dapat menjadi bakat yang terasa alami. Tantangan berulangnya adalah ${theme.challenge}. Perjalananmu mengajak bakat ini dipakai secara sadar, bukan diperlakukan sebagai nasib yang pasti.`,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function padaSection(value: unknown, nakshatra: unknown): VedicSectionContract | null {
  if (!isPada(value) || !PADA_THEMES[value] || !isText(nakshatra)) return null;
  const theme = PADA_THEMES[value];
  return createSection({
    sectionId: "pada", label: "Pada", rawValue: value, displayValue: `Pada ${value}`, sign: null, house: null,
    nakshatra, pada: value, retrogradeStatus: null,
    shortExplanation: `Pada ${value} membuat ekspresi ${nakshatra} terasa ${theme.tone}.`,
    fullExplanation: `Pada ${value} memberi nada yang ${theme.tone} pada pola besar Nakshatra ${nakshatra}. Dalam keseharian, corak ini terlihat dari cara tema naluriah diterjemahkan menjadi pilihan praktis dan hubungan sosial. Ruang latihannya adalah ${theme.practice}.`,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function karakaSection(kind: "atmakaraka" | "darakaraka", value: DeepPartial<VedicKaraka> | undefined, timeVerified: boolean): VedicSectionContract | null {
  if (!isText(value?.planet)) return null;
  const planet = value.planet as VedicGraha;
  const theme = PLANET_THEMES[planet];
  if (!theme) return null;
  const sign = isText(value.sign) ? value.sign : null;
  const house = timeVerified && isHouse(value.house) ? value.house : null;
  const label = kind === "atmakaraka" ? "Atmakaraka" : "Darakaraka";
  const displayValue = [planet, sign, house ? `House ${house}` : null].filter(Boolean).join(" · ");
  const fullExplanation = kind === "atmakaraka"
    ? `${planet} sebagai Atmakaraka menempatkan ${theme.function} sebagai tema perkembangan yang berulang${sign ? `, dengan gaya ${styleFor(sign)}` : ""}. Bakatmu tumbuh melalui kemampuan untuk ${theme.gift}, sementara gesekan muncul ketika kamu ${theme.caution}. Ini adalah arah pematangan dalam kerangka pembacaan saat ini, bukan vonis jiwa yang mutlak.`
    : `${planet} sebagai Darakaraka membuat ${theme.function} sering dipelajari melalui kedekatan${sign ? ` dan kualitas yang ${styleFor(sign)}` : ""}. Kamu mungkin tertarik pada relasi yang mengajakmu ${theme.gift}, sekaligus berhadapan dengan kecenderungan untuk ${theme.caution}. Arah dewasanya adalah membangun kemitraan yang sadar, bukan mencari kepastian tentang pasangan tertentu.`;
  return createSection({
    sectionId: kind, label, rawValue: planet, displayValue, sign, house, nakshatra: null, pada: null,
    retrogradeStatus: null, shortExplanation: `${planet} menyoroti ${theme.function}.`, fullExplanation,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function placementSection(planet: VedicGraha, value: DeepPartial<VedicPlacement> | undefined, timeVerified: boolean): VedicSectionContract | null {
  if (!value || !isText(value.sign)) return null;
  const theme = PLANET_THEMES[planet];
  const sign = value.sign;
  const house = timeVerified && isHouse(value.house) ? value.house : null;
  const retrogradeStatus = typeof value.retrograde === "boolean" ? (value.retrograde ? "Retrograde" : "Direct") : null;
  const condition = value.retrograde ? " Karena bergerak Retrograde, fungsi ini lebih sering ditinjau dan diproses dari dalam sebelum tampak sebagai tindakan." : "";
  return createSection({
    sectionId: planet.toLowerCase(), label: planet, rawValue: sign,
    displayValue: [sign, house ? `House ${house}` : null, retrogradeStatus].filter(Boolean).join(" · "),
    sign, house, nakshatra: null, pada: null, retrogradeStatus,
    shortExplanation: `${theme.opening} bekerja dengan gaya yang ${styleFor(sign)}.`,
    fullExplanation: `${theme.opening} bekerja melalui ${theme.function} dengan gaya yang ${styleFor(sign)}${house ? ` di area kehidupan House ${house}` : ""}.${condition} Kekuatanmu muncul ketika kamu dapat ${theme.gift}; yang perlu dijaga adalah kecenderungan untuk ${theme.caution}.`,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function houseSections(planets: Partial<Record<VedicGraha, DeepPartial<VedicPlacement>>> | undefined, timeVerified: boolean): VedicSectionContract[] {
  if (!timeVerified || !planets) return [];
  const byHouse = new Map<number, VedicGraha[]>();
  for (const planet of Object.keys(PLANET_THEMES) as VedicGraha[]) {
    const house = planets[planet]?.house;
    if (!isHouse(house)) continue;
    byHouse.set(house, [...(byHouse.get(house) || []), planet]);
  }
  return [...byHouse.entries()].sort((a, b) => a[0] - b[0]).map(([house, occupants]) => createSection({
    sectionId: `house-${house}`, label: `House ${house}`, rawValue: house,
    displayValue: `House ${house} · ${HOUSE_LABELS[house]}`, sign: null, house, nakshatra: null, pada: null, retrogradeStatus: null,
    shortExplanation: `${occupants.join(", ")} memberi penekanan pada ${HOUSE_LABELS[house].toLowerCase()}.`,
    fullExplanation: `House ${house} membawa tema ${HOUSE_LABELS[house].toLowerCase()}, dan kehadiran ${occupants.join(", ")} membuat area ini lebih sering meminta perhatian. Setiap Graha menyumbangkan fungsi yang berbeda, sehingga penekanan ini dapat terasa sebagai kekuatan sekaligus ruang latihan dalam kehidupan sehari-hari.`,
    sourceType: "CANONICAL_SYNTHESIS", canonicalStatus: "derived-presentation",
  }));
}

function strengthSection(values: Array<DeepPartial<PlanetaryStrength>> | undefined): VedicSectionContract | null {
  if (!values?.length) return null;
  const available = values.filter((item) => isText(item.planet) && isText(item.level));
  if (!available.length) return null;
  const strong = available.filter((item) => item.level === "Strong").map((item) => item.planet);
  const weaker = available.filter((item) => item.level === "Weak").map((item) => item.planet);
  const balanced = available.filter((item) => item.level === "Balanced").map((item) => item.planet);
  const displayValue = [`Strong: ${strong.join(", ") || "—"}`, `Balanced: ${balanced.join(", ") || "—"}`, `Weak: ${weaker.join(", ") || "—"}`].join(" · ");
  return createSection({
    sectionId: "planetary-strength", label: "Planetary Strength", rawValue: available.length, displayValue,
    sign: null, house: null, nakshatra: null, pada: null, retrogradeStatus: null,
    shortExplanation: "Planetary Strength membandingkan ketersediaan relatif fungsi setiap Graha dalam aturan engine aktif.",
    fullExplanation: `${strong.length ? `Fungsi ${strong.join(", ")} tampak lebih mudah diakses` : "Tidak ada fungsi yang diklasifikasikan sangat kuat"}, sementara ${weaker.length ? `${weaker.join(", ")} memerlukan pengembangan yang lebih sadar` : "tidak ada fungsi yang diklasifikasikan lemah"}. Nilai ini menggambarkan kecenderungan penggunaan energi dalam keseharian, bukan ukuran baik-buruk atau jaminan keberhasilan.`,
    sourceType: "CANONICAL_SYNTHESIS", canonicalStatus: "derived-presentation",
  });
}

function retrogradeSection(planets: Partial<Record<VedicGraha, DeepPartial<VedicPlacement>>> | undefined): VedicSectionContract | null {
  if (!planets) return null;
  const retrogrades = (Object.keys(PLANET_THEMES) as VedicGraha[]).filter((planet) => planets[planet]?.retrograde === true);
  if (!retrogrades.length) return null;
  return createSection({
    sectionId: "retrograde-planets", label: "Retrograde Planets", rawValue: retrogrades.length,
    displayValue: retrogrades.join(", "), sign: null, house: null, nakshatra: null, pada: null, retrogradeStatus: "Retrograde",
    shortExplanation: `${retrogrades.join(", ")} tercatat Retrograde dalam hasil canonical.`,
    fullExplanation: `Gerak Retrograde pada ${retrogrades.join(", ")} menunjukkan bahwa fungsi Graha tersebut cenderung ditinjau, diulang, atau diproses lebih internal sebelum menjadi tindakan. Pola ini bukan tanda buruk; ia mengajak kesadaran lebih besar terhadap cara energi itu digunakan.`,
    sourceType: "CANONICAL_VEDIC_RESULT", canonicalStatus: "canonical",
  });
}

function formatDate(value: unknown): string | null {
  if (!isText(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

function dashaSection(kind: "mahadasha" | "antardasha", period: DeepPartial<VedicDashaPeriod> | undefined): VedicSectionContract | null {
  if (!isText(period?.planet)) return null;
  const planet = period.planet as VedicGraha;
  const theme = PLANET_THEMES[planet];
  if (!theme) return null;
  const range = [formatDate(period.startDate), formatDate(period.endDate)].filter(Boolean).join(" – ");
  const label = kind === "mahadasha" ? "Mahadasha" : "Antardasha";
  const fullExplanation = kind === "mahadasha"
    ? `Mahadasha ${planet} membawa babak besar yang menonjolkan ${theme.function}. Fase ini dapat memusatkan perhatian pada kemampuan untuk ${theme.gift}, sambil mengajakmu menjaga kecenderungan untuk ${theme.caution}. Ia memberi konteks perkembangan yang luas, bukan janji tentang kejadian tertentu.`
    : `Antardasha ${planet} bekerja sebagai subcycle yang memodifikasi babak utama melalui ${theme.function}. Dalam praktiknya, kualitas untuk ${theme.gift} menjadi jalur yang lebih spesifik, sedangkan kecenderungan untuk ${theme.caution} perlu diamati. Maknanya dibaca bersama Mahadasha, bukan sebagai pengulangan tema yang sama.`;
  return createSection({
    sectionId: kind, label, rawValue: planet, displayValue: [planet, range].filter(Boolean).join(" · "),
    sign: null, house: null, nakshatra: null, pada: null, retrogradeStatus: null,
    shortExplanation: `${label} ${planet} menonjolkan ${theme.function}.`, fullExplanation,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function currentDashaSection(maha: VedicSectionContract | null, antar: VedicSectionContract | null): VedicSectionContract | null {
  if (!maha || !antar || !isText(maha.rawValue) || !isText(antar.rawValue)) return null;
  const mahaPlanet = maha.rawValue as VedicGraha;
  const antarPlanet = antar.rawValue as VedicGraha;
  const major = PLANET_THEMES[mahaPlanet];
  const minor = PLANET_THEMES[antarPlanet];
  return createSection({
    sectionId: "current-dasha-theme", label: "Current Dasha Theme", rawValue: `${mahaPlanet}/${antarPlanet}`,
    displayValue: `${mahaPlanet} Mahadasha · ${antarPlanet} Antardasha`, sign: null, house: null, nakshatra: null, pada: null, retrogradeStatus: null,
    shortExplanation: `Babak ${mahaPlanet} sedang dipertajam oleh subcycle ${antarPlanet}.`,
    fullExplanation: `Babak besar ${mahaPlanet} meminta pematangan ${major.function}, sementara subcycle ${antarPlanet} membawa perhatian saat ini pada ${minor.function}. Perpaduannya mendukung kemampuan untuk ${major.gift} melalui cara yang membantu kamu ${minor.gift}. Tekanan dapat muncul bila kamu sekaligus ${major.caution} dan ${minor.caution}, sehingga ritme yang sadar lebih berguna daripada memaksakan hasil.`,
    sourceType: "CANONICAL_SYNTHESIS", canonicalStatus: "derived-presentation",
  });
}

function synthesisSection(sectionId: string, label: string, displayValue: string, shortExplanation: string, fullExplanation: string): VedicSectionContract {
  return createSection({ sectionId, label, rawValue: displayValue, displayValue, sign: null, house: null, nakshatra: null, pada: null, retrogradeStatus: null, shortExplanation, fullExplanation, sourceType: "CANONICAL_SYNTHESIS", canonicalStatus: "derived-presentation" });
}

function buildSummary(contract: Omit<VedicIdentityReadContract, "summary" | "sourceVersion">, complete: boolean): string[] {
  const lagnaStyle = contract.lagna?.sign ? styleFor(contract.lagna.sign) : "menyesuaikan diri melalui pengamatan yang cermat";
  const moonStyle = contract.moon?.sign ? styleFor(contract.moon.sign) : "membutuhkan ruang untuk mengenali ritme batin";
  const sunStyle = contract.sun?.sign ? styleFor(contract.sun.sign) : "menguat saat tujuan terasa bermakna";
  const mercuryStyle = contract.mercury?.sign ? styleFor(contract.mercury.sign) : "bertumbuh melalui cara berpikir yang reflektif";
  const venusStyle = contract.venus?.sign ? styleFor(contract.venus.sign) : "mencari kedekatan yang selaras dengan nilai pribadi";
  const marsStyle = contract.mars?.sign ? styleFor(contract.mars.sign) : "bergerak ketika arah terasa cukup jelas";
  const p1 = `Kamu cenderung memasuki hidup dengan cara yang ${lagnaStyle}, sementara bagian dalam dirimu ${moonStyle}. Daya hidupmu ${sunStyle}, sehingga ada pertemuan antara cara tampil, kebutuhan rasa aman, dan arah yang ingin kamu bangun. Keseimbangan tumbuh ketika tindakan luar tidak meninggalkan ritme batin.`;
  const p2 = `Cara berpikirmu ${mercuryStyle}, sedangkan dalam kedekatan kamu ${venusStyle}. Tenaga tindakanmu ${marsStyle}, membuat komunikasi, kasih sayang, dan keberanian memiliki tempo yang tidak selalu sama. Kekuatanmu muncul saat ketiganya diberi ruang untuk saling memberi informasi sebelum sebuah keputusan diambil.`;
  const soul = contract.atmakaraka?.shortExplanation || "Tema perkembangan utama mengajakmu mematangkan kualitas yang berulang dalam berbagai pengalaman";
  const relation = contract.darakaraka?.shortExplanation || contract.relationshipThemes?.shortExplanation || "Relasi dekat menjadi ruang untuk mengenali kebutuhan dan batas dengan lebih dewasa";
  const axis = contract.rahu && contract.ketu ? "Dorongan menjelajah hal baru perlu diseimbangkan dengan kemampuan lama yang sudah terasa akrab" : "Pertumbuhan meminta keberanian mencoba sekaligus kebijaksanaan melepaskan pola yang tidak lagi berguna";
  const p3 = `${soul} ${relation} ${axis}. Tantangan berulangnya bukan tanda kegagalan, melainkan petunjuk tentang kualitas yang perlu dijalankan dengan lebih sadar.`;
  if (!complete) return [p1, p2, p3];
  const cycle = contract.currentDashaThemes?.shortExplanation || "Fase hidup saat ini mengajakmu menyusun prioritas secara lebih matang";
  const work = contract.workThemes?.shortExplanation || "Kontribusi terbaik tumbuh ketika pengetahuan dapat diubah menjadi sesuatu yang berguna";
  const growth = contract.growthDirection?.shortExplanation || "Arah dewasa muncul melalui langkah konsisten yang tetap memberi ruang pada penyesuaian";
  const p4 = `${cycle} ${work} ${growth}. Undangannya adalah membangun ritme yang dapat dipertahankan, bukan mengejar kepastian tentang hasil akhir.`;
  return [p1, p2, p3, p4];
}

export function buildVedicPresentation(
  input: VedicPresentationInput | VedicPartialBlueprint | null | undefined,
  options: VedicPresentationOptions = {},
): VedicPresentation {
  const timeVerified = options.birthTimeAvailable !== false;
  const emptyReadContract: VedicIdentityReadContract = {
    lagna: null, rashi: null, sun: null, moon: null, nakshatra: null, pada: null, atmakaraka: null, darakaraka: null,
    mercury: null, venus: null, mars: null, jupiter: null, saturn: null, rahu: null, ketu: null, houses: [],
    planetaryStrength: null, retrogradePlanets: null, mahadasha: null, antardasha: null, currentDashaThemes: null,
    strengths: null, challenges: null, relationshipThemes: null, workThemes: null, growthDirection: null,
    summary: [], sourceVersion: VEDIC_PRESENTATION_SOURCE_VERSION,
  };
  const unavailable: VedicPresentation = {
    status: "unavailable", canonicalName: "Vedic Astrology",
    hero: { title: "Peta Langit Vedikmu", lagna: null, rashi: null, nakshatra: null, insight: "Lengkapi data kelahiran untuk membuka pembacaan Vedic Astrology.", action: "Lihat detail selengkapnya" },
    profileCard: { title: "Vedic Astrology", lagna: null, rashi: null, nakshatra: null, insight: "Peta langit kelahiran melalui tradisi astrologi Vedik.", action: "Lihat detail selengkapnya", href: "/blueprint/vedic" },
    groups: [], readContract: emptyReadContract, summary: [], summaryText: "", sourceVersion: VEDIC_PRESENTATION_SOURCE_VERSION,
  };
  if (!input || typeof input !== "object") return unavailable;
  if ("status" in input && input.status === "PARTIAL_BIRTH_TIME_REQUIRED") {
    const message = input.message || "Waktu lahir diperlukan untuk menghitung Lagna, rumah astrologi, dan bagian Vedic yang bergantung pada posisi langit secara tepat.";
    return {
      ...unavailable,
      status: "partial",
      hero: { ...unavailable.hero, insight: message },
      profileCard: { ...unavailable.profileCard, insight: message },
    };
  }

  const canonicalInput = input as VedicPresentationInput;

  const nakshatra = isText(canonicalInput.nakshatra) ? canonicalInput.nakshatra : undefined;
  const pada = isPada(canonicalInput.pada) ? canonicalInput.pada : undefined;
  const lagna = pointSection("lagna", "Lagna", canonicalInput.lagna, { timeVerified, nakshatra, pada });
  const sun = pointSection("sun", "Sun", canonicalInput.sunSign, { timeVerified, nakshatra, pada });
  const moon = pointSection("moon", "Moon", canonicalInput.moonSign, { timeVerified, nakshatra, pada });
  const rashi = pointSection("rashi", "Rashi", canonicalInput.moonSign, { timeVerified, nakshatra, pada });
  const nakshatraRead = timeVerified ? nakshatraSection(canonicalInput.nakshatra) : null;
  const padaRead = timeVerified ? padaSection(canonicalInput.pada, canonicalInput.nakshatra) : null;
  const atmakaraka = timeVerified ? karakaSection("atmakaraka", canonicalInput.atmakaraka, true) : null;
  const darakaraka = timeVerified ? karakaSection("darakaraka", canonicalInput.darakaraka, true) : null;
  const planets = canonicalInput.planets;
  const mercury = placementSection("Mercury", planets?.Mercury, timeVerified);
  const venus = placementSection("Venus", planets?.Venus, timeVerified);
  const mars = placementSection("Mars", planets?.Mars, timeVerified);
  const jupiter = placementSection("Jupiter", planets?.Jupiter, timeVerified);
  const saturn = placementSection("Saturn", planets?.Saturn, timeVerified);
  const rahu = placementSection("Rahu", planets?.Rahu, timeVerified);
  const ketu = placementSection("Ketu", planets?.Ketu, timeVerified);
  const houses = houseSections(planets, timeVerified);
  const planetaryStrength = timeVerified ? strengthSection(canonicalInput.planetaryStrength) : null;
  const retrogradePlanets = timeVerified ? retrogradeSection(planets) : null;
  const mahadasha = timeVerified ? dashaSection("mahadasha", canonicalInput.currentMahadasha) : null;
  const antardasha = timeVerified ? dashaSection("antardasha", canonicalInput.currentAntardasha) : null;
  const currentDashaThemes = currentDashaSection(mahadasha, antardasha);
  const relationshipThemes = darakaraka || moon
    ? synthesisSection(
        "relationship-pattern",
        "Relationship Pattern",
        "Pola kedekatan",
        `Relasi tumbuh saat kebutuhan emosional${darakaraka?.rawValue ? ` dan pelajaran ${darakaraka.rawValue}` : ""} dapat dikomunikasikan dengan jelas.`,
        `Dalam hubungan, kamu mungkin membutuhkan ruang yang cukup untuk mengenali rasa sebelum memberi respons${darakaraka?.rawValue ? `, sementara kualitas ${darakaraka.rawValue} berulang sebagai bahan pendewasaan` : ""}. Kedekatan menjadi lebih matang ketika kebutuhan, nilai, dan batas dapat dibicarakan tanpa menebak-nebak. Pola ini menjelaskan ruang belajar relasional, bukan kompatibilitas atau kepastian tentang pasangan tertentu.`,
      )
    : null;
  const workThemes = synthesisSection("work-contribution", "Work and Contribution", "Arah kontribusi", `Kontribusi menguat ketika gaya ${lagna?.sign ? styleFor(lagna.sign) : "yang alami"} diarahkan pada kebutuhan nyata.`, `Cara berkontribusimu tumbuh ketika pendekatan yang ${lagna?.sign ? styleFor(lagna.sign) : "sesuai dengan ritme pribadi"} bertemu dengan tugas yang berguna. Planetary Strength membantu melihat fungsi yang lebih mudah diakses dan bagian yang memerlukan latihan. Arah ini bukan satu profesi yang pasti, melainkan pola kerja yang dapat hadir di banyak bidang.`);
  const strengths = synthesisSection("strengths", "Strengths", "Kekuatan utama", `Kekuatanmu muncul melalui ${lagna?.sign ? styleFor(lagna.sign) : "kemampuan membaca keadaan"}.`, `Kekuatan utama tampak saat kamu menggunakan kualitas yang ${lagna?.sign ? styleFor(lagna.sign) : "peka pada konteks"} bersama fungsi Graha yang lebih tersedia. Kemampuan ini menjadi paling berguna ketika dipakai secara sadar, bukan dianggap sebagai jaminan hasil.`);
  const challenges = synthesisSection("challenges", "Challenges", "Tantangan berulang", `Tantanganmu mengajakmu ${lagna?.sign ? cautionFor(lagna.sign) : "memberi jeda sebelum bereaksi"}.`, `Tantangan berulang muncul ketika pola yang sebenarnya berguna dipakai berlebihan atau tanpa membaca situasi. Ruang latihannya adalah ${lagna?.sign ? cautionFor(lagna.sign) : "memberi jeda sebelum bereaksi"}, tanpa menganggap kesulitan sebagai hukuman.`);
  const growthDirection = synthesisSection(
    "growth-direction",
    "Growth Direction",
    "Arah pertumbuhan",
    atmakaraka?.shortExplanation || "Pertumbuhan mengajakmu mematangkan kualitas yang terus berulang.",
    `${atmakaraka?.shortExplanation || "Arah pertumbuhan terlihat dari kualitas yang berulang kali meminta perhatian."} Kualitas tersebut matang ketika bakat dan gesekannya sama-sama diakui sebagai bahan latihan. Perubahan yang bertahan tumbuh melalui langkah kecil yang dapat dijalani, bukan tuntutan untuk segera menjadi sempurna.`,
  );

  const contractWithoutSummary = {
    lagna, rashi, sun, moon, nakshatra: nakshatraRead, pada: padaRead, atmakaraka, darakaraka,
    mercury, venus, mars, jupiter, saturn, rahu, ketu, houses, planetaryStrength, retrogradePlanets,
    mahadasha, antardasha, currentDashaThemes, strengths, challenges, relationshipThemes, workThemes, growthDirection,
  };
  const coreCount = [lagna, sun, moon, nakshatraRead, padaRead, atmakaraka, darakaraka, mahadasha, antardasha].filter(Boolean).length;
  const status = coreCount >= 8 ? "complete" : coreCount > 0 ? "partial" : "unavailable";
  if (status === "unavailable") return unavailable;
  const summary = buildSummary(contractWithoutSummary, status === "complete");
  const readContract: VedicIdentityReadContract = { ...contractWithoutSummary, summary, sourceVersion: VEDIC_PRESENTATION_SOURCE_VERSION };
  const compact = (sections: Array<VedicSectionContract | null>) => sections.filter((section): section is VedicSectionContract => Boolean(section));
  const groups: VedicSectionGroup[] = [
    { groupId: "vedic-identity", title: "Identitas Vedikmu", sections: compact([lagna, sun, moon, rashi]) },
    { groupId: "inner-pattern", title: "Pola Batin dan Arah Jiwa", sections: compact([nakshatraRead, padaRead, atmakaraka, darakaraka]) },
    { groupId: "personal-planets", title: "Cara Dirimu Berpikir, Mencintai, dan Bertindak", sections: compact([mercury, venus, mars]) },
    { groupId: "maturation", title: "Pertumbuhan dan Pendewasaan", sections: compact([jupiter, saturn]) },
    { groupId: "karma-change", title: "Arah Karma dan Perubahan", sections: compact([rahu, ketu, retrogradePlanets]) },
    { groupId: "life-areas", title: "Area Kehidupan", sections: [...houses, ...compact([planetaryStrength])] },
    { groupId: "dasha-cycle", title: "Siklus Dasha", sections: compact([mahadasha, antardasha, currentDashaThemes]) },
    { groupId: "lived-themes", title: "Pola Kehidupan", sections: compact([relationshipThemes, workThemes, strengths, challenges, growthDirection]) },
  ].filter((group) => group.sections.length > 0);
  const heroInsight = lagna
    ? `Kamu memasuki hidup dengan cara yang ${styleFor(lagna.sign || undefined)}, sementara Rashi ${rashi?.sign || "yang tersimpan"} memberi ritme batin yang khas.`
    : `Rashi ${rashi?.sign || "yang tersimpan"} dan Nakshatra ${nakshatra || "yang tersedia"} membantu membaca ritme batin tanpa mengklaim Lagna yang belum terverifikasi.`;

  return {
    status, canonicalName: "Vedic Astrology",
    hero: { title: "Peta Langit Vedikmu", lagna: lagna?.displayValue || null, rashi: rashi?.displayValue || null, nakshatra: nakshatraRead?.displayValue || null, insight: heroInsight, action: "Lihat detail selengkapnya" },
    profileCard: { title: "Vedic Astrology", lagna: lagna?.displayValue || null, rashi: rashi?.displayValue || null, nakshatra: nakshatraRead?.displayValue || null, insight: heroInsight, action: "Lihat detail selengkapnya", href: "/blueprint/vedic" },
    groups, readContract, summary, summaryText: summary.join("\n\n"), sourceVersion: VEDIC_PRESENTATION_SOURCE_VERSION,
  };
}
