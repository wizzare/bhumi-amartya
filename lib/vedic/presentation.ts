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
    title: string;
    lagna: string | null;
    rashi: string | null;
    nakshatra: string | null;
    insight: string;
    action: string;
  };
  profileCard: {
    title: "Vedic Astrology";
    lagna: string | null;
    rashi: string | null;
    nakshatra: string | null;
    insight: string;
    action: string;
    href: "/blueprint/vedic";
  };
  groups: VedicSectionGroup[];
  readContract: VedicIdentityReadContract;
  summary: string[];
  summaryText: string;
  sourceVersion: string;
};

import { isEnlEdition } from "@/lib/config/edition";

export type VedicPresentationOptions = {
  birthTimeAvailable?: boolean;
  isEn?: boolean;
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

const PLANET_THEMES_EN: Record<VedicGraha, PlanetTheme> = {
  Sun: { function: "vital energy, self-confidence, and core purpose", gift: "standing firmly in meaningful choices", caution: "forcing certainty before situations are fully clear", opening: "Your vital center" },
  Moon: { function: "emotional needs, instinctual response, and inner security", gift: "attuning to your inner rhythm before reacting", caution: "letting momentary reactions dictate your path", opening: "Your inner rhythm" },
  Mercury: { function: "how you think, learn, interpret, and communicate", gift: "translating perceptive observations into practical language", caution: "remaining trapped in mental overthinking", opening: "Your mental style" },
  Venus: { function: "affection, relational values, attraction, and self-worth", gift: "cultivating intimacy aligned with personal integrity", caution: "sacrificing personal boundaries to maintain harmony", opening: "How your heart connects" },
  Mars: { function: "drive, courage, healthy confrontation, and action", gift: "mobilizing genuine intentions into tangible steps", caution: "acting before direction and consequences are clear", opening: "Your active energy" },
  Jupiter: { function: "expansion, wisdom, philosophical meaning, and broader perspective", gift: "discerning broader possibilities and optimistic potential", caution: "promising more than can be sustainably held", opening: "Your realm of growth" },
  Saturn: { function: "responsibility, healthy boundaries, discipline, and maturity", gift: "building enduring structures through patient diligence", caution: "turning high standards into rigid self-criticism", opening: "Your maturation process" },
  Rahu: { function: "curiosity toward new horizons, worldly ambition, and expansion", gift: "experimenting courageously in unfamiliar territory", caution: "chasing intensity without measuring true necessity", opening: "Your direction of expansion" },
  Ketu: { function: "familiar instincts, surrender, and spiritual refinement", gift: "drawing on natural, deeply rooted faculties", caution: "withdrawing prematurely from experiences still needing engagement", opening: "Your familiar instincts" },
};

const SIGN_STYLE: Record<string, string> = {
  Aries: "langsung, berani, dan cepat memulai", Taurus: "stabil, sabar, dan berorientasi pada sesuatu yang nyata",
  Gemini: "lincah, ingin tahu, dan komunikatif", Cancer: "peka, protektif, dan menjaga rasa aman",
  Leo: "hangat, kreatif, dan berani terlihat", Virgo: "teliti, praktis, dan terdorong memperbaiki",
  Libra: "relasional, adil, dan peka pada keseimbangan", Scorpio: "intens, strategis, dan bersedia berubah mendalam",
  Sagittarius: "terbuka, visioner, dan mencari makna", Capricorn: "disiplin, realistis, dan tahan menjalani proses",
  Aquarius: "mandiri, sistemik, dan tertarik pada pembaruan", Pisces: "imajinatif, empatik, dan intuitif",
};

const SIGN_STYLE_EN: Record<string, string> = {
  Aries: "direct, courageous, and quick to initiate", Taurus: "grounded, patient, and oriented toward tangible reality",
  Gemini: "adaptable, inquisitive, and communicative", Cancer: "receptive, protective, and anchoring emotional security",
  Leo: "warmhearted, creative, and confident in expression", Virgo: "precise, practical, and dedicated to improvement",
  Libra: "relational, fair-minded, and attuned to equilibrium", Scorpio: "perceptive, strategic, and willing to transform deeply",
  Sagittarius: "open-minded, visionary, and truth-seeking", Capricorn: "disciplined, realistic, and enduring through long processes",
  Aquarius: "autonomous, systemic, and dedicated to innovative progress", Pisces: "imaginative, empathetic, and intuitively receptive",
};

const SIGN_CAUTION: Record<string, string> = {
  Aries: "memberi jeda sebelum bergerak", Taurus: "tetap lentur saat pola lama tidak lagi bekerja",
  Gemini: "menjaga fokus agar perhatian tidak tercerai", Cancer: "membedakan intuisi dari kekhawatiran",
  Leo: "berkarya tanpa bergantung pada pengakuan", Virgo: "mengurangi kritik berlebih pada diri sendiri",
  Libra: "berani memilih tanpa menunggu semua orang setuju", Scorpio: "membangun kepercayaan tanpa mengontrol",
  Sagittarius: "membumikan visi menjadi komitmen", Capricorn: "memberi ruang pada kelembutan dan istirahat",
  Aquarius: "tetap hadir secara emosional saat berpikir jauh", Pisces: "menjaga batas agar tidak menyerap semuanya",
};

const SIGN_CAUTION_EN: Record<string, string> = {
  Aries: "pausing before jumping into action", Taurus: "staying adaptable when old routines no longer serve",
  Gemini: "maintaining focus so attention does not scatter", Cancer: "distinguishing intuitive insight from anxiety",
  Leo: "creating without relying solely on external applause", Virgo: "softening harsh self-criticism",
  Libra: "making choices without waiting for unanimous approval", Scorpio: "deepening trust without needing to control outcomes",
  Sagittarius: "grounding visionary ideals into tangible commitments", Capricorn: "making room for gentle rest and self-kindness",
  Aquarius: "staying emotionally present while thinking far ahead", Pisces: "holding healthy boundaries to avoid emotional overwhelm",
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

const NAKSHATRA_THEMES_EN: Record<string, { motivation: string; gift: string; challenge: string }> = {
  Ashwini: { motivation: "initiating healing and swift momentum", gift: "dynamic and revitalizing responsiveness", challenge: "rushing forward before the ground is ready" },
  Bharani: { motivation: "holding transformative processes to full maturity", gift: "fierce endurance and integrity to values", challenge: "carrying too much alone" },
  Krittika: { motivation: "discerning what is true from what is obsolete", gift: "uncompromising clarity and penetrating incisiveness", challenge: "overly sharp or unsparing critique" },
  Rohini: { motivation: "nurturing beauty, fertility, and organic growth", gift: "abundant creative expression", challenge: "over-attachment to physical comfort" },
  Mrigashira: { motivation: "seeking understanding through diverse experience", gift: "playful curiosity and perceptual agility", challenge: "wandering ceaselessly without settling" },
  Ardra: { motivation: "uncovering core truth through cathartic transition", gift: "courage to face emotional complexity", challenge: "being swept away by turbulent intensity" },
  Punarvasu: { motivation: "returning to centered simplicity after the journey", gift: "resilient capacity for fresh beginnings", challenge: "repeating cycles without deeper reflection" },
  Pushya: { motivation: "nurturing sustainable and patient growth", gift: "grounding, unwavering care and encouragement", challenge: "neglecting personal needs while caring for others" },
  Ashlesha: { motivation: "perceiving hidden nuances beneath appearances", gift: "acute psychological and strategic insight", challenge: "holding on or guarding boundaries too tightly" },
  Magha: { motivation: "honoring ancestral heritage and personal dignity", gift: "rooted, noble leadership", challenge: "entanglement in status or prestige" },
  "Purva Phalguni": { motivation: "celebrating creative joy and relational warmth", gift: "generous social charisma", challenge: "evading uncomfortable responsibilities" },
  "Uttara Phalguni": { motivation: "building durable, supportive alliances", gift: "structured, compassionate service", challenge: "giving beyond healthy personal capacity" },
  Hasta: { motivation: "manifesting intentions through dexterous mastery", gift: "craftsmanship, precision, and agility", challenge: "attempting to micromanage outcomes" },
  Chitra: { motivation: "fashioning forms of elegance and structural beauty", gift: "inspired design vision and meticulous care", challenge: "fixating on elusive perfection" },
  Swati: { motivation: "charting an independent course with flexibility", gift: "diplomatic grace and open-minded adaptability", challenge: "swaying in indecision for too long" },
  Vishakha: { motivation: "reaching purposeful objectives through focused drive", gift: "single-minded perseverance and ambition", challenge: "measuring self-worth exclusively by achievements" },
  Anuradha: { motivation: "blooming through loyalty and heartfelt cooperation", gift: "enduring, devoted friendship", challenge: "overlooking healthy personal boundaries" },
  Jyeshtha: { motivation: "shouldering elder responsibility with mastery", gift: "protective guardianship and resourceful expertise", challenge: "feeling compelled to remain perpetually invulnerable" },
  Mula: { motivation: "getting to the absolute root of human experience", gift: "unflinching, transformative truthfulness", challenge: "tearing down structures before preparing new ground" },
  "Purva Ashadha": { motivation: "championing inspiring and uplifting convictions", gift: "radiant enthusiasm and persuasive eloquence", challenge: "resisting necessary course corrections" },
  "Uttara Ashadha": { motivation: "establishing enduring, noble victories", gift: "quiet integrity and steadfast tenacity", challenge: "overburdening oneself with solemn duty" },
  Shravana: { motivation: "learning through attentive listening and synthesis", gift: "wisdom articulated with clarity and empathy", challenge: "over-identifying with external opinions" },
  Dhanishta: { motivation: "orchestrating personal cadence with communal value", gift: "harmonious coordination and productive momentum", challenge: "ignoring personal rhythms of restoration" },
  Shatabhisha: { motivation: "understanding complex systems and facilitating healing", gift: "independent, penetrating diagnostic perception", challenge: "withdrawing into emotional isolation when burdened" },
  "Purva Bhadrapada": { motivation: "living profound ideals with intense devotion", gift: "visionary depth and transformative focus", challenge: "falling into rigid or extreme viewpoints" },
  "Uttara Bhadrapada": { motivation: "channeling emotional depth into steady wisdom", gift: "serene patience, resilience, and calm grace", challenge: "quietly storing burdens without expressing them" },
  Revati: { motivation: "guiding journeys to graceful, compassionate fulfillment", gift: "tender benevolence and soul guidance", challenge: "losing personal boundaries in service of others" },
};

const PADA_THEMES: Record<number, { tone: string; practice: string }> = {
  1: { tone: "lebih langsung, mandiri, dan berinisiatif", practice: "mengatur tenaga awal agar tidak cepat habis" },
  2: { tone: "lebih praktis, stabil, dan berorientasi hasil", practice: "membiarkan proses berkembang tanpa terlalu melekat pada bentuk" },
  3: { tone: "lebih komunikatif, adaptif, dan sosial", practice: "menjaga pesan tetap utuh ketika banyak kemungkinan muncul" },
  4: { tone: "lebih emosional, reflektif, dan peka pada hubungan", practice: "membangun batas yang hangat agar kepekaan tetap menjadi kekuatan" },
};

const PADA_THEMES_EN: Record<number, { tone: string; practice: string }> = {
  1: { tone: "more direct, independent, and initiatory", practice: "pacing initial enthusiasm to avoid premature exhaustion" },
  2: { tone: "more practical, steady, and outcome-oriented", practice: "allowing processes to unfold without rigid attachment to specific form" },
  3: { tone: "more communicative, adaptable, and socially connective", practice: "keeping core messaging clear when multiple options arise" },
  4: { tone: "more emotional, reflective, and relationally attuned", practice: "holding warm boundaries so sensitivity remains a lasting strength" },
};

const HOUSE_LABELS: Record<number, string> = {
  1: "Identitas dan Kehadiran", 2: "Nilai, Sumber Daya, dan Suara", 3: "Belajar, Komunikasi, dan Keberanian",
  4: "Rumah, Akar, dan Keamanan Batin", 5: "Kreativitas, Ekspresi, dan Pembelajaran", 6: "Rutinitas, Pelayanan, dan Perbaikan",
  7: "Kemitraan dan Relasi Dekat", 8: "Perubahan, Keintiman, dan Sumber Daya Bersama", 9: "Makna, Keyakinan, dan Wawasan",
  10: "Karier dan Kontribusi Publik", 11: "Komunitas, Jaringan, dan Harapan", 12: "Retret, Pelepasan, dan Dunia Batin",
};

const HOUSE_LABELS_EN: Record<number, string> = {
  1: "Identity and Embodiment", 2: "Values, Resources, and Voice", 3: "Learning, Communication, and Courage",
  4: "Home, Roots, and Emotional Security", 5: "Creativity, Self-Expression, and Learning", 6: "Routines, Service, and Improvement",
  7: "Partnership and Close Relationships", 8: "Transformation, Intimacy, and Shared Resources", 9: "Higher Meaning, Philosophy, and Perspective",
  10: "Career, Calling, and Public Contribution", 11: "Community, Networks, and Aspiration", 12: "Retreat, Surrender, and the Inner Realm",
};

const isText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isHouse = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 12;
const isPada = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 4;
const styleFor = (sign: string | undefined, isEn = false) => sign && (isEn ? SIGN_STYLE_EN[sign] : SIGN_STYLE[sign]) ? (isEn ? SIGN_STYLE_EN[sign] : SIGN_STYLE[sign]) : (isEn ? "reading situations in your own thoughtful way" : "membaca keadaan dengan caranya sendiri");
const cautionFor = (sign: string | undefined, isEn = false) => sign && (isEn ? SIGN_CAUTION_EN[sign] : SIGN_CAUTION[sign]) ? (isEn ? SIGN_CAUTION_EN[sign] : SIGN_CAUTION[sign]) : (isEn ? "holding space to review responses before acting" : "memberi ruang untuk meninjau respons sebelum melangkah");

function createSection(input: Omit<VedicSectionContract, "sourceVersion" | "availabilityStatus">): VedicSectionContract {
  return { ...input, sourceVersion: VEDIC_PRESENTATION_SOURCE_VERSION, availabilityStatus: "available" };
}

function pointSection(
  sectionId: "lagna" | "sun" | "moon" | "rashi",
  label: string,
  point: DeepPartial<VedicSignPoint> | undefined,
  options: { timeVerified: boolean; nakshatra?: string; pada?: number; isEn?: boolean },
): VedicSectionContract | null {
  if (!isText(point?.sign) || (sectionId === "lagna" && !options.timeVerified)) return null;
  const isEn = Boolean(options.isEn);
  const sign = point.sign;
  const house = options.timeVerified && isHouse(point.house) ? point.house : null;
  const degree = typeof point.degree === "number" && Number.isFinite(point.degree) ? `${point.degree.toFixed(2)}°` : null;
  const location = [sign, degree, house ? `House ${house}` : null].filter(Boolean).join(" · ");
  let shortExplanation = isEn
    ? `Expression of ${sign} brings an approach of ${styleFor(sign, isEn)}.`
    : `Ekspresi ${sign} membawa cara yang ${styleFor(sign)}.`;
  let fullExplanation = "";
  if (sectionId === "lagna") {
    shortExplanation = isEn
      ? `Lagna in ${sign} offers an initial approach of ${styleFor(sign, isEn)}.`
      : `Lagna ${sign} memberi pendekatan awal yang ${styleFor(sign)}.`;
    fullExplanation = isEn
      ? `You tend to navigate new situations by ${styleFor(sign, isEn)}, and this presence is felt through your bodily carriage and relational entry points. Experience matures this approach as you learn ${cautionFor(sign, isEn)}. In this reading, Lagna is understood as an unfolding developmental arc rather than a mere persona.`
      : `Kamu cenderung memasuki situasi baru dengan cara yang ${styleFor(sign)}, dan kualitas ini terasa melalui kehadiran tubuh maupun cara bersosialisasi. Pengalaman membuat pendekatan tersebut semakin matang ketika kamu belajar ${cautionFor(sign)}. Lagna di sini dibaca sebagai pola perkembangan, bukan sekadar penampilan atau topeng.`;
  } else if (sectionId === "sun") {
    shortExplanation = isEn
      ? `The Sun in ${sign} brings a core vitality of ${styleFor(sign, isEn)}.`
      : shortExplanation;
    fullExplanation = isEn
      ? `Your vital core operates by ${styleFor(sign, isEn)}${house ? `, particularly grounded in the sphere of House ${house}` : ""}. Confidence and clarity of purpose strengthen when you stand firmly in what has true meaning without constant performance. Growth asks you to remain mindful of ${cautionFor(sign, isEn)}.`
      : `Pusat vitalitasmu bergerak dengan cara yang ${styleFor(sign)}${house ? `, terutama melalui ranah House ${house}` : ""}. Keyakinan dan arah tujuan menguat ketika kamu berani berdiri pada hal yang bermakna tanpa harus selalu membuktikan diri. Yang perlu dijaga adalah ${cautionFor(sign)}.`;
  } else if (sectionId === "moon") {
    const lunarDetail = options.nakshatra
      ? (isEn
          ? ` This lunar quality is deepened by Nakshatra ${options.nakshatra}${options.pada ? `, Pada ${options.pada}` : ""}.`
          : ` Corak ini diperdalam oleh Nakshatra ${options.nakshatra}${options.pada ? `, Pada ${options.pada}` : ""}.`)
      : "";
    shortExplanation = isEn
      ? `The Moon in ${sign} gives an emotional rhythm of ${styleFor(sign, isEn)}.`
      : shortExplanation;
    fullExplanation = isEn
      ? `Your inner rhythm seeks security through ${styleFor(sign, isEn)}${house ? `, with emotional experiences often gravitating toward House ${house}` : ""}.${lunarDetail} When navigating stress, naming your genuine needs before reacting allows your natural perceptiveness to operate with greater clarity.`
      : `Ritme batinmu mencari rasa aman melalui cara yang ${styleFor(sign)}${house ? `, dengan pengalaman emosional sering terarah pada House ${house}` : ""}.${lunarDetail} Saat menghadapi tekanan, memberi nama pada kebutuhan sebelum bereaksi membantu kepekaanmu bekerja lebih jernih.`;
  } else {
    shortExplanation = isEn
      ? `Rashi ${sign} is the sidereal Moon sign orientation in this reading.`
      : `Rashi ${sign} adalah identitas teknis Moon sign dalam pembacaan ini.`;
    fullExplanation = isEn
      ? `Rashi ${sign} marks your sidereal Moon position and serves as the structural anchor for your internal emotional rhythms. Full emotional nuances are detailed within the Moon section to avoid mechanical repetition.`
      : `Rashi ${sign} menandai posisi Moon secara sidereal dan menjadi orientasi teknis bagi ritme batinmu. Penjelasan pengalaman emosional lengkap dimiliki bagian Moon agar nilai yang sama tidak diulang secara mekanis.`;
  }
  return createSection({
    sectionId, label, rawValue: sign, displayValue: location, sign, house,
    nakshatra: sectionId === "moon" && isText(options.nakshatra) ? options.nakshatra : null,
    pada: sectionId === "moon" && isPada(options.pada) ? options.pada : null,
    retrogradeStatus: null, shortExplanation, fullExplanation,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function nakshatraSection(name: unknown, isEn = false): VedicSectionContract | null {
  if (!isText(name) || !NAKSHATRA_THEMES[name]) return null;
  const theme = isEn && NAKSHATRA_THEMES_EN[name] ? NAKSHATRA_THEMES_EN[name] : NAKSHATRA_THEMES[name];
  return createSection({
    sectionId: "nakshatra", label: "Nakshatra", rawValue: name, displayValue: name, sign: null, house: null,
    nakshatra: name, pada: null, retrogradeStatus: null,
    shortExplanation: isEn
      ? `Symbolic motivation moves through a drive to ${theme.motivation}.`
      : `Motivasi simboliknya bergerak melalui dorongan untuk ${theme.motivation}.`,
    fullExplanation: isEn
      ? `A core dimension of your nature feels called to ${theme.motivation}, making ${theme.gift} a natural strength. Its recurring edge involves ${theme.challenge}. Your journey invites you to engage this gift consciously rather than treating it as a rigid destiny.`
      : `Ada bagian dalam dirimu yang terdorong untuk ${theme.motivation}, sehingga ${theme.gift} dapat menjadi bakat yang terasa alami. Tantangan berulangnya adalah ${theme.challenge}. Perjalananmu mengajak bakat ini dipakai secara sadar, bukan diperlakukan sebagai nasib yang pasti.`,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function padaSection(value: unknown, nakshatra: unknown, isEn = false): VedicSectionContract | null {
  if (!isPada(value) || !PADA_THEMES[value] || !isText(nakshatra)) return null;
  const theme = isEn && PADA_THEMES_EN[value] ? PADA_THEMES_EN[value] : PADA_THEMES[value];
  return createSection({
    sectionId: "pada", label: "Pada", rawValue: value, displayValue: `Pada ${value}`, sign: null, house: null,
    nakshatra, pada: value, retrogradeStatus: null,
    shortExplanation: isEn
      ? `Pada ${value} gives the expression of ${nakshatra} a ${theme.tone} quality.`
      : `Pada ${value} membuat ekspresi ${nakshatra} terasa ${theme.tone}.`,
    fullExplanation: isEn
      ? `Pada ${value} brings a ${theme.tone} nuance to the broader archetype of Nakshatra ${nakshatra}. In everyday life, this texture shapes how your instinctive themes translate into practical choices and relational boundaries. The grounding practice is ${theme.practice}.`
      : `Pada ${value} memberi nada yang ${theme.tone} pada pola besar Nakshatra ${nakshatra}. Dalam keseharian, corak ini terlihat dari cara tema naluriah diterjemahkan menjadi pilihan praktis dan hubungan sosial. Ruang latihannya adalah ${theme.practice}.`,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function karakaSection(kind: "atmakaraka" | "darakaraka", value: DeepPartial<VedicKaraka> | undefined, timeVerified: boolean, isEn = false): VedicSectionContract | null {
  if (!isText(value?.planet)) return null;
  const planet = value.planet as VedicGraha;
  const theme = isEn && PLANET_THEMES_EN[planet] ? PLANET_THEMES_EN[planet] : PLANET_THEMES[planet];
  if (!theme) return null;
  const sign = isText(value.sign) ? value.sign : null;
  const house = timeVerified && isHouse(value.house) ? value.house : null;
  const label = kind === "atmakaraka" ? "Atmakaraka" : "Darakaraka";
  const displayValue = [planet, sign, house ? `House ${house}` : null].filter(Boolean).join(" · ");
  const fullExplanation = kind === "atmakaraka"
    ? (isEn
        ? `${planet} as Atmakaraka designates ${theme.function} as your central developmental theme${sign ? `, expressing through ${styleFor(sign, isEn)}` : ""}. Your innate capacity matures through ${theme.gift}, while friction arises when you ${theme.caution}. This represents a directional framework for inner growth rather than a fatalistic soul verdict.`
        : `${planet} sebagai Atmakaraka menempatkan ${theme.function} sebagai tema perkembangan yang berulang${sign ? `, dengan gaya ${styleFor(sign)}` : ""}. Bakatmu tumbuh melalui kemampuan untuk ${theme.gift}, sementara gesekan muncul ketika kamu ${theme.caution}. Ini adalah arah pematangan dalam kerangka pembacaan saat ini, bukan vonis jiwa yang mutlak.`)
    : (isEn
        ? `${planet} as Darakaraka brings ${theme.function} to the forefront within intimate bonds${sign ? ` with an approach of ${styleFor(sign, isEn)}` : ""}. You may find yourself drawn to relationships that invite you to ${theme.gift}, while also navigating tendencies to ${theme.caution}. Mature relating emerges through conscious reciprocity rather than seeking certainty about specific partners.`
        : `${planet} sebagai Darakaraka membuat ${theme.function} sering dipelajari melalui kedekatan${sign ? ` dan kualitas yang ${styleFor(sign)}` : ""}. Kamu mungkin tertarik pada relasi yang mengajakmu ${theme.gift}, sekaligus berhadapan dengan kecenderungan untuk ${theme.caution}. Arah dewasanya adalah membangun kemitraan yang sadar, bukan mencari kepastian tentang pasangan tertentu.`);
  return createSection({
    sectionId: kind, label, rawValue: planet, displayValue, sign, house, nakshatra: null, pada: null,
    retrogradeStatus: null,
    shortExplanation: isEn ? `${planet} highlights ${theme.function}.` : `${planet} menyoroti ${theme.function}.`,
    fullExplanation,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function placementSection(planet: VedicGraha, value: DeepPartial<VedicPlacement> | undefined, timeVerified: boolean, isEn = false): VedicSectionContract | null {
  if (!value || !isText(value.sign)) return null;
  const theme = isEn && PLANET_THEMES_EN[planet] ? PLANET_THEMES_EN[planet] : PLANET_THEMES[planet];
  const sign = value.sign;
  const house = timeVerified && isHouse(value.house) ? value.house : null;
  const retrogradeStatus = typeof value.retrograde === "boolean" ? (value.retrograde ? "Retrograde" : "Direct") : null;
  const condition = value.retrograde
    ? (isEn
        ? " Because it moves Retrograde, this function tends to be reviewed and digested internally before being expressed externally."
        : " Karena bergerak Retrograde, fungsi ini lebih sering ditinjau dan diproses dari dalam sebelum tampak sebagai tindakan.")
    : "";
  return createSection({
    sectionId: planet.toLowerCase(), label: planet, rawValue: sign,
    displayValue: [sign, house ? `House ${house}` : null, retrogradeStatus].filter(Boolean).join(" · "),
    sign, house, nakshatra: null, pada: null, retrogradeStatus,
    shortExplanation: isEn
      ? `${theme.opening} operates with an approach of ${styleFor(sign, isEn)}.`
      : `${theme.opening} bekerja dengan gaya yang ${styleFor(sign)}.`,
    fullExplanation: isEn
      ? `${theme.opening} operates through ${theme.function} with an approach of ${styleFor(sign, isEn)}${house ? ` in the life domain of House ${house}` : ""}.${condition} Your innate strength emerges when you ${theme.gift}; what asks for ongoing awareness is a tendency to ${theme.caution}.`
      : `${theme.opening} bekerja melalui ${theme.function} dengan gaya yang ${styleFor(sign)}${house ? ` di area kehidupan House ${house}` : ""}.${condition} Kekuatanmu muncul ketika kamu dapat ${theme.gift}; yang perlu dijaga adalah kecenderungan untuk ${theme.caution}.`,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function houseSections(planets: Partial<Record<VedicGraha, DeepPartial<VedicPlacement>>> | undefined, timeVerified: boolean, isEn = false): VedicSectionContract[] {
  if (!timeVerified || !planets) return [];
  const labels = isEn ? HOUSE_LABELS_EN : HOUSE_LABELS;
  const byHouse = new Map<number, VedicGraha[]>();
  for (const planet of Object.keys(PLANET_THEMES) as VedicGraha[]) {
    const house = planets[planet]?.house;
    if (!isHouse(house)) continue;
    byHouse.set(house, [...(byHouse.get(house) || []), planet]);
  }
  return [...byHouse.entries()].sort((a, b) => a[0] - b[0]).map(([house, occupants]) => createSection({
    sectionId: `house-${house}`, label: `House ${house}`, rawValue: house,
    displayValue: `House ${house} · ${labels[house]}`, sign: null, house, nakshatra: null, pada: null, retrogradeStatus: null,
    shortExplanation: isEn
      ? `${occupants.join(", ")} bring emphasis to ${labels[house].toLowerCase()}.`
      : `${occupants.join(", ")} memberi penekanan pada ${labels[house].toLowerCase()}.`,
    fullExplanation: isEn
      ? `House ${house} holds the theme of ${labels[house].toLowerCase()}, and the presence of ${occupants.join(", ")} invites sustained awareness here. Each Graha contributes distinct functions, making this focus both a natural asset and a regular training ground in daily life.`
      : `House ${house} membawa tema ${labels[house].toLowerCase()}, dan kehadiran ${occupants.join(", ")} membuat area ini lebih sering meminta perhatian. Setiap Graha menyumbangkan fungsi yang berbeda, sehingga penekanan ini dapat terasa sebagai kekuatan sekaligus ruang latihan dalam kehidupan sehari-hari.`,
    sourceType: "CANONICAL_SYNTHESIS", canonicalStatus: "derived-presentation",
  }));
}

function strengthSection(values: Array<DeepPartial<PlanetaryStrength>> | undefined, isEn = false): VedicSectionContract | null {
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
    shortExplanation: isEn
      ? "Planetary Strength maps the relative accessibility of each Graha's function within the active engine guidelines."
      : "Planetary Strength membandingkan ketersediaan relatif fungsi setiap Graha dalam aturan engine aktif.",
    fullExplanation: isEn
      ? `${strong.length ? `Functions of ${strong.join(", ")} appear readily accessible` : "No functions are classified as singularly strong"}, while ${weaker.length ? `${weaker.join(", ")} invite more intentional integration` : "no functions are classified as weak"}. This evaluation reflects typical energy allocation in everyday life, not an absolute value judgment or guarantee of outcomes.`
      : `${strong.length ? `Fungsi ${strong.join(", ")} tampak lebih mudah diakses` : "Tidak ada fungsi yang diklasifikasikan sangat kuat"}, sementara ${weaker.length ? `${weaker.join(", ")} memerlukan pengembangan yang lebih sadar` : "tidak ada fungsi yang diklasifikasikan lemah"}. Nilai ini menggambarkan kecenderungan penggunaan energi dalam keseharian, bukan ukuran baik-buruk atau jaminan keberhasilan.`,
    sourceType: "CANONICAL_SYNTHESIS", canonicalStatus: "derived-presentation",
  });
}

function retrogradeSection(planets: Partial<Record<VedicGraha, DeepPartial<VedicPlacement>>> | undefined, isEn = false): VedicSectionContract | null {
  if (!planets) return null;
  const retrogrades = (Object.keys(PLANET_THEMES) as VedicGraha[]).filter((planet) => planets[planet]?.retrograde === true);
  if (!retrogrades.length) return null;
  return createSection({
    sectionId: "retrograde-planets", label: "Retrograde Planets", rawValue: retrogrades.length,
    displayValue: retrogrades.join(", "), sign: null, house: null, nakshatra: null, pada: null, retrogradeStatus: "Retrograde",
    shortExplanation: isEn
      ? `${retrogrades.join(", ")} are recorded as Retrograde in canonical results.`
      : `${retrogrades.join(", ")} tercatat Retrograde dalam hasil canonical.`,
    fullExplanation: isEn
      ? `Retrograde motion for ${retrogrades.join(", ")} indicates that these Graha functions tend to be reviewed, reflected upon, or internalized before outward action. This pattern is not an affliction; it simply invites greater discernment in how these energies are directed.`
      : `Gerak Retrograde pada ${retrogrades.join(", ")} menunjukkan bahwa fungsi Graha tersebut cenderung ditinjau, diulang, atau diproses lebih internal sebelum menjadi tindakan. Pola ini bukan tanda buruk; ia mengajak kesadaran lebih besar terhadap cara energi itu digunakan.`,
    sourceType: "CANONICAL_VEDIC_RESULT", canonicalStatus: "canonical",
  });
}

function formatDate(value: unknown, isEn = false): string | null {
  if (!isText(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

function dashaSection(kind: "mahadasha" | "antardasha", period: DeepPartial<VedicDashaPeriod> | undefined, isEn = false): VedicSectionContract | null {
  if (!isText(period?.planet)) return null;
  const planet = period.planet as VedicGraha;
  const theme = isEn && PLANET_THEMES_EN[planet] ? PLANET_THEMES_EN[planet] : PLANET_THEMES[planet];
  if (!theme) return null;
  const range = [formatDate(period.startDate, isEn), formatDate(period.endDate, isEn)].filter(Boolean).join(" – ");
  const label = kind === "mahadasha" ? "Mahadasha" : "Antardasha";
  const fullExplanation = kind === "mahadasha"
    ? (isEn
        ? `Mahadasha of ${planet} brings a major chapter highlighting ${theme.function}. This phase concentrates awareness on your capacity to ${theme.gift}, while encouraging mindful boundaries around ${theme.caution}. It offers a broad developmental backdrop rather than a rigid prophecy.`
        : `Mahadasha ${planet} membawa babak besar yang menonjolkan ${theme.function}. Fase ini dapat memusatkan perhatian pada kemampuan untuk ${theme.gift}, sambil mengajakmu menjaga kecenderungan untuk ${theme.caution}. Ia memberi konteks perkembangan yang luas, bukan janji tentang kejadian tertentu.`)
    : (isEn
        ? `Antardasha of ${planet} operates as a subcycle refining the main chapter through ${theme.function}. In practice, expressing ${theme.gift} becomes a focused channel, while observing tendencies toward ${theme.caution} remains essential. Its meaning is understood in resonance with the Mahadasha, not in isolation.`
        : `Antardasha ${planet} bekerja sebagai subcycle yang memodifikasi babak utama melalui ${theme.function}. Dalam praktiknya, kualitas untuk ${theme.gift} menjadi jalur yang lebih spesifik, sedangkan kecenderungan untuk ${theme.caution} perlu diamati. Maknanya dibaca bersama Mahadasha, bukan sebagai pengulangan tema yang sama.`);
  return createSection({
    sectionId: kind, label, rawValue: planet, displayValue: [planet, range].filter(Boolean).join(" · "),
    sign: null, house: null, nakshatra: null, pada: null, retrogradeStatus: null,
    shortExplanation: isEn ? `${label} of ${planet} highlights ${theme.function}.` : `${label} ${planet} menonjolkan ${theme.function}.`,
    fullExplanation,
    sourceType: "PRESENTATION_DICTIONARY", canonicalStatus: "derived-presentation",
  });
}

function currentDashaSection(maha: VedicSectionContract | null, antar: VedicSectionContract | null, isEn = false): VedicSectionContract | null {
  if (!maha || !antar || !isText(maha.rawValue) || !isText(antar.rawValue)) return null;
  const mahaPlanet = maha.rawValue as VedicGraha;
  const antarPlanet = antar.rawValue as VedicGraha;
  const major = isEn && PLANET_THEMES_EN[mahaPlanet] ? PLANET_THEMES_EN[mahaPlanet] : PLANET_THEMES[mahaPlanet];
  const minor = isEn && PLANET_THEMES_EN[antarPlanet] ? PLANET_THEMES_EN[antarPlanet] : PLANET_THEMES[antarPlanet];
  return createSection({
    sectionId: "current-dasha-theme", label: "Current Dasha Theme", rawValue: `${mahaPlanet}/${antarPlanet}`,
    displayValue: `${mahaPlanet} Mahadasha · ${antarPlanet} Antardasha`, sign: null, house: null, nakshatra: null, pada: null, retrogradeStatus: null,
    shortExplanation: isEn
      ? `The chapter of ${mahaPlanet} is currently refined by the subcycle of ${antarPlanet}.`
      : `Babak ${mahaPlanet} sedang dipertajam oleh subcycle ${antarPlanet}.`,
    fullExplanation: isEn
      ? `The primary cycle of ${mahaPlanet} invites maturation in ${major.function}, while the subcycle of ${antarPlanet} brings present attention to ${minor.function}. Their combination supports expressing ${major.gift} in ways that help you ${minor.gift}. Friction may arise if both ${major.caution} and ${minor.caution} are engaged simultaneously, so mindful pacing is far more supportive than forcing outcomes.`
      : `Babak besar ${mahaPlanet} meminta pematangan ${major.function}, sementara subcycle ${antarPlanet} membawa perhatian saat ini pada ${minor.function}. Perpaduannya mendukung kemampuan untuk ${major.gift} melalui cara yang membantu kamu ${minor.gift}. Tekanan dapat muncul bila kamu sekaligus ${major.caution} dan ${minor.caution}, sehingga ritme yang sadar lebih berguna daripada memaksakan hasil.`,
    sourceType: "CANONICAL_SYNTHESIS", canonicalStatus: "derived-presentation",
  });
}

function synthesisSection(sectionId: string, label: string, displayValue: string, shortExplanation: string, fullExplanation: string): VedicSectionContract {
  return createSection({ sectionId, label, rawValue: displayValue, displayValue, sign: null, house: null, nakshatra: null, pada: null, retrogradeStatus: null, shortExplanation, fullExplanation, sourceType: "CANONICAL_SYNTHESIS", canonicalStatus: "derived-presentation" });
}

function buildSummary(contract: Omit<VedicIdentityReadContract, "summary" | "sourceVersion">, complete: boolean, isEn = false): string[] {
  const lagnaStyle = contract.lagna?.sign
    ? styleFor(contract.lagna.sign, isEn)
    : (isEn ? "adapting through perceptive observation" : "menyesuaikan diri melalui pengamatan yang cermat");
  const moonStyle = contract.moon?.sign
    ? styleFor(contract.moon.sign, isEn)
    : (isEn ? "requiring space to attune to inner cadence" : "membutuhkan ruang untuk mengenali ritme batin");
  const sunStyle = contract.sun?.sign
    ? styleFor(contract.sun.sign, isEn)
    : (isEn ? "strengthening when purpose feels deeply meaningful" : "menguat saat tujuan terasa bermakna");
  const mercuryStyle = contract.mercury?.sign
    ? styleFor(contract.mercury.sign, isEn)
    : (isEn ? "growing through reflective contemplation" : "bertumbuh melalui cara berpikir yang reflektif");
  const venusStyle = contract.venus?.sign
    ? styleFor(contract.venus.sign, isEn)
    : (isEn ? "seeking relational intimacy aligned with core values" : "mencari kedekatan yang selaras dengan nilai pribadi");
  const marsStyle = contract.mars?.sign
    ? styleFor(contract.mars.sign, isEn)
    : (isEn ? "taking action when direction feels sufficiently clear" : "bergerak ketika arah terasa cukup jelas");

  const p1 = isEn
    ? `You tend to meet life by ${lagnaStyle}, while inwardly you ${moonStyle}. Your core vitality is ${sunStyle}, creating an intersection between outer presence, emotional security, and purposeful direction. Harmony expands when outward motion remains attuned to inner cadence.`
    : `Kamu cenderung memasuki hidup dengan cara yang ${lagnaStyle}, sementara bagian dalam dirimu ${moonStyle}. Daya hidupmu ${sunStyle}, sehingga ada pertemuan antara cara tampil, kebutuhan rasa aman, dan arah yang ingin kamu bangun. Keseimbangan tumbuh ketika tindakan luar tidak meninggalkan ritme batin.`;
  const p2 = isEn
    ? `Your intellect develops through ${mercuryStyle}, while in relationships you ${venusStyle}. Your active drive operates as ${marsStyle}, meaning communication, affection, and assertiveness have distinct tempos. Your strength blossoms when all three inform one another before making key choices.`
    : `Cara berpikirmu ${mercuryStyle}, sedangkan dalam kedekatan kamu ${venusStyle}. Tenaga tindakanmu ${marsStyle}, membuat komunikasi, kasih sayang, dan keberanian memiliki tempo yang tidak selalu sama. Kekuatanmu muncul saat ketiganya diberi ruang untuk saling memberi informasi sebelum sebuah keputusan diambil.`;
  const soul = contract.atmakaraka?.shortExplanation || (isEn ? "Your primary developmental theme invites you to mature qualities that recur across varied experiences." : "Tema perkembangan utama mengajakmu mematangkan kualitas yang berulang dalam berbagai pengalaman");
  const relation = contract.darakaraka?.shortExplanation || contract.relationshipThemes?.shortExplanation || (isEn ? "Intimate relationships serve as fertile ground to recognize needs and boundaries with maturity." : "Relasi dekat menjadi ruang untuk mengenali kebutuhan dan batas dengan lebih dewasa");
  const axis = contract.rahu && contract.ketu
    ? (isEn ? "The drive to explore new frontiers must be balanced with seasoned capacities that already feel natural." : "Dorongan menjelajah hal baru perlu diseimbangkan dengan kemampuan lama yang sudah terasa akrab")
    : (isEn ? "Growth calls for the courage to experiment alongside the wisdom to release outgrown habits." : "Pertumbuhan meminta keberanian mencoba sekaligus kebijaksanaan melepaskan pola yang tidak lagi berguna");
  const p3 = isEn
    ? `${soul} ${relation} ${axis}. Recurring challenges are not signals of failure, but invitations to navigate these dynamics with greater clarity.`
    : `${soul} ${relation} ${axis}. Tantangan berulangnya bukan tanda kegagalan, melainkan petunjuk tentang kualitas yang perlu dijalankan dengan lebih sadar.`;
  if (!complete) return [p1, p2, p3];
  const cycle = contract.currentDashaThemes?.shortExplanation || (isEn ? "Your current life chapter invites you to prioritize with deeper maturity." : "Fase hidup saat ini mengajakmu menyusun prioritas secara lebih matang");
  const work = contract.workThemes?.shortExplanation || (isEn ? "Your finest contribution flourishes when insights are distilled into practical value." : "Kontribusi terbaik tumbuh ketika pengetahuan dapat diubah menjadi sesuatu yang berguna");
  const growth = contract.growthDirection?.shortExplanation || (isEn ? "Mature direction emerges through consistent steps that allow room for natural adjustment." : "Arah dewasa muncul melalui langkah konsisten yang tetap memberi ruang pada penyesuaian");
  const p4 = isEn
    ? `${cycle} ${work} ${growth}. The invitation is to build a sustainable cadence rather than chasing absolute guarantees on final outcomes.`
    : `${cycle} ${work} ${growth}. Undangannya adalah membangun ritme yang dapat dipertahankan, bukan mengejar kepastian tentang hasil akhir.`;
  return [p1, p2, p3, p4];
}

export function buildVedicPresentation(
  input: VedicPresentationInput | VedicPartialBlueprint | null | undefined,
  options: VedicPresentationOptions = {},
): VedicPresentation {
  const isEn = Boolean(options.isEn);
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
    hero: {
      title: isEn ? "Your Vedic Sky Map" : "Peta Langit Vedikmu",
      lagna: null, rashi: null, nakshatra: null,
      insight: isEn ? "Complete birth details to unlock your Vedic Astrology reading." : "Lengkapi data kelahiran untuk membuka pembacaan Vedic Astrology.",
      action: isEn ? "View complete details" : "Lihat detail selengkapnya",
    },
    profileCard: {
      title: "Vedic Astrology",
      lagna: null, rashi: null, nakshatra: null,
      insight: isEn ? "Natal sky map rooted in sidereal Vedic astrology." : "Peta langit kelahiran melalui tradisi astrologi Vedik.",
      action: isEn ? "View complete details" : "Lihat detail selengkapnya",
      href: "/blueprint/vedic",
    },
    groups: [], readContract: emptyReadContract, summary: [], summaryText: "", sourceVersion: VEDIC_PRESENTATION_SOURCE_VERSION,
  };
  if (!input || typeof input !== "object") return unavailable;
  if ("status" in input && input.status === "PARTIAL_BIRTH_TIME_REQUIRED") {
    const message = input.message || (isEn
      ? "Birth time is required to compute Lagna, houses, and precise sidereal positions."
      : "Waktu lahir diperlukan untuk menghitung Lagna, rumah astrologi, dan bagian Vedic yang bergantung pada posisi langit secara tepat.");
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
  const lagna = pointSection("lagna", "Lagna", canonicalInput.lagna, { timeVerified, nakshatra, pada, isEn });
  const sun = pointSection("sun", "Sun", canonicalInput.sunSign, { timeVerified, nakshatra, pada, isEn });
  const moon = pointSection("moon", "Moon", canonicalInput.moonSign, { timeVerified, nakshatra, pada, isEn });
  const rashi = pointSection("rashi", "Rashi", canonicalInput.moonSign, { timeVerified, nakshatra, pada, isEn });
  const nakshatraRead = timeVerified ? nakshatraSection(canonicalInput.nakshatra, isEn) : null;
  const padaRead = timeVerified ? padaSection(canonicalInput.pada, canonicalInput.nakshatra, isEn) : null;
  const atmakaraka = timeVerified ? karakaSection("atmakaraka", canonicalInput.atmakaraka, true, isEn) : null;
  const darakaraka = timeVerified ? karakaSection("darakaraka", canonicalInput.darakaraka, true, isEn) : null;
  const planets = canonicalInput.planets;
  const mercury = placementSection("Mercury", planets?.Mercury, timeVerified, isEn);
  const venus = placementSection("Venus", planets?.Venus, timeVerified, isEn);
  const mars = placementSection("Mars", planets?.Mars, timeVerified, isEn);
  const jupiter = placementSection("Jupiter", planets?.Jupiter, timeVerified, isEn);
  const saturn = placementSection("Saturn", planets?.Saturn, timeVerified, isEn);
  const rahu = placementSection("Rahu", planets?.Rahu, timeVerified, isEn);
  const ketu = placementSection("Ketu", planets?.Ketu, timeVerified, isEn);
  const houses = houseSections(planets, timeVerified, isEn);
  const planetaryStrength = timeVerified ? strengthSection(canonicalInput.planetaryStrength, isEn) : null;
  const retrogradePlanets = timeVerified ? retrogradeSection(planets, isEn) : null;
  const mahadasha = timeVerified ? dashaSection("mahadasha", canonicalInput.currentMahadasha, isEn) : null;
  const antardasha = timeVerified ? dashaSection("antardasha", canonicalInput.currentAntardasha, isEn) : null;
  const currentDashaThemes = currentDashaSection(mahadasha, antardasha, isEn);
  const relationshipThemes = darakaraka || moon
    ? synthesisSection(
        "relationship-pattern",
        "Relationship Pattern",
        isEn ? "Relational dynamics" : "Pola kedekatan",
        isEn
          ? `Relationships thrive when emotional needs${darakaraka?.rawValue ? ` and lessons of ${darakaraka.rawValue}` : ""} can be communicated clearly.`
          : `Relasi tumbuh saat kebutuhan emosional${darakaraka?.rawValue ? ` dan pelajaran ${darakaraka.rawValue}` : ""} dapat dikomunikasikan dengan jelas.`,
        isEn
          ? `In relationships, you may require sufficient space to process feeling before responding${darakaraka?.rawValue ? `, while the themes of ${darakaraka.rawValue} recur as fertile ground for emotional maturity` : ""}. Intimacy deepens when personal needs, core values, and boundaries can be spoken without ambiguity. This reflection illuminates relational growth spaces, not rigid compatibility verdicts.`
          : `Dalam hubungan, kamu mungkin membutuhkan ruang yang cukup untuk mengenali rasa sebelum memberi respons${darakaraka?.rawValue ? `, sementara kualitas ${darakaraka.rawValue} berulang sebagai bahan pendewasaan` : ""}. Kedekatan menjadi lebih matang ketika kebutuhan, nilai, dan batas dapat dibicarakan tanpa menebak-nebak. Pola ini menjelaskan ruang belajar relasional, bukan kompatibilitas atau kepastian tentang pasangan tertentu.`,
      )
    : null;
  const workThemes = synthesisSection(
    "work-contribution",
    "Work and Contribution",
    isEn ? "Contribution direction" : "Arah kontribusi",
    isEn
      ? `Contribution expands when an approach ${lagna?.sign ? styleFor(lagna.sign, isEn) : "true to your nature"} is directed toward real-world needs.`
      : `Kontribusi menguat ketika gaya ${lagna?.sign ? styleFor(lagna.sign) : "yang alami"} diarahkan pada kebutuhan nyata.`,
    isEn
      ? `Your mode of service flourishes when an approach that ${lagna?.sign ? styleFor(lagna.sign, isEn) : "honors your personal pace"} connects with purposeful work. Planetary Strength highlights functions that are readily accessible alongside those asking for conscious integration. This points to a meaningful work style applicable across many fields, rather than a single prescribed career.`
      : `Cara berkontribusimu tumbuh ketika pendekatan yang ${lagna?.sign ? styleFor(lagna.sign) : "sesuai dengan ritme pribadi"} bertemu dengan tugas yang berguna. Planetary Strength membantu melihat fungsi yang lebih mudah diakses dan bagian yang memerlukan latihan. Arah ini bukan satu profesi yang pasti, melainkan pola kerja yang dapat hadir di banyak bidang.`,
  );
  const strengths = synthesisSection(
    "strengths",
    "Strengths",
    isEn ? "Core strengths" : "Kekuatan utama",
    isEn
      ? `Your strength emerges through ${lagna?.sign ? styleFor(lagna.sign, isEn) : "reading situations perceptively"}.`
      : `Kekuatanmu muncul melalui ${lagna?.sign ? styleFor(lagna.sign) : "kemampuan membaca keadaan"}.`,
    isEn
      ? `Your main strength shows when you draw upon qualities that are ${lagna?.sign ? styleFor(lagna.sign, isEn) : "sensitive to context"} alongside your most accessible planetary functions. This natural ability is most impactful when exercised with intention rather than taken for granted.`
      : `Kekuatan utama tampak saat kamu menggunakan kualitas yang ${lagna?.sign ? styleFor(lagna.sign) : "peka pada konteks"} bersama fungsi Graha yang lebih tersedia. Kemampuan ini menjadi paling berguna ketika dipakai secara sadar, bukan dianggap sebagai jaminan hasil.`,
  );
  const challenges = synthesisSection(
    "challenges",
    "Challenges",
    isEn ? "Recurring edges" : "Tantangan berulang",
    isEn
      ? `Your growth invites you to ${lagna?.sign ? cautionFor(lagna.sign, isEn) : "pause before reacting"}.`
      : `Tantanganmu mengajakmu ${lagna?.sign ? cautionFor(lagna.sign) : "memberi jeda sebelum bereaksi"}.`,
    isEn
      ? `Recurring friction happens when useful patterns are overextended or applied without reading the room. The practice is to ${lagna?.sign ? cautionFor(lagna.sign, isEn) : "pause before reacting"}, treating friction as useful feedback rather than self-reproach.`
      : `Tantangan berulang muncul ketika pola yang sebenarnya berguna dipakai berlebihan atau tanpa membaca situasi. Ruang latihannya adalah ${lagna?.sign ? cautionFor(lagna.sign) : "memberi jeda sebelum bereaksi"}, tanpa menganggap kesulitan sebagai hukuman.`,
  );
  const growthDirection = synthesisSection(
    "growth-direction",
    "Growth Direction",
    isEn ? "Growth direction" : "Arah pertumbuhan",
    atmakaraka?.shortExplanation || (isEn ? "Growth invites you to mature qualities that consistently recur." : "Pertumbuhan mengajakmu mematangkan kualitas yang terus berulang."),
    isEn
      ? `${atmakaraka?.shortExplanation || "Your growth direction is visible through qualities that consistently invite reflection."} These qualities mature when both the gifts and the rough edges are welcomed as ongoing practice. Lasting change unfolds through practical steps, not demands for instant perfection.`
      : `${atmakaraka?.shortExplanation || "Arah pertumbuhan terlihat dari kualitas yang berulang kali meminta perhatian."} Kualitas tersebut matang ketika bakat dan gesekannya sama-sama diakui sebagai bahan latihan. Perubahan yang bertahan tumbuh melalui langkah kecil yang dapat dijalani, bukan tuntutan untuk segera menjadi sempurna.`,
  );

  const contractWithoutSummary = {
    lagna, rashi, sun, moon, nakshatra: nakshatraRead, pada: padaRead, atmakaraka, darakaraka,
    mercury, venus, mars, jupiter, saturn, rahu, ketu, houses, planetaryStrength, retrogradePlanets,
    mahadasha, antardasha, currentDashaThemes, strengths, challenges, relationshipThemes, workThemes, growthDirection,
  };
  const coreCount = [lagna, sun, moon, nakshatraRead, padaRead, atmakaraka, darakaraka, mahadasha, antardasha].filter(Boolean).length;
  const status = coreCount >= 8 ? "complete" : coreCount > 0 ? "partial" : "unavailable";
  if (status === "unavailable") return unavailable;
  const summary = buildSummary(contractWithoutSummary, status === "complete", isEn);
  const readContract: VedicIdentityReadContract = { ...contractWithoutSummary, summary, sourceVersion: VEDIC_PRESENTATION_SOURCE_VERSION };
  const compact = (sections: Array<VedicSectionContract | null>) => sections.filter((section): section is VedicSectionContract => Boolean(section));
  const groups: VedicSectionGroup[] = [
    { groupId: "vedic-identity", title: isEn ? "Your Vedic Identity" : "Identitas Vedikmu", sections: compact([lagna, sun, moon, rashi]) },
    { groupId: "inner-pattern", title: isEn ? "Inner Rhythm & Soul Arc" : "Pola Batin dan Arah Jiwa", sections: compact([nakshatraRead, padaRead, atmakaraka, darakaraka]) },
    { groupId: "personal-planets", title: isEn ? "Thinking, Loving, and Taking Action" : "Cara Dirimu Berpikir, Mencintai, dan Bertindak", sections: compact([mercury, venus, mars]) },
    { groupId: "maturation", title: isEn ? "Growth & Maturity" : "Pertumbuhan dan Pendewasaan", sections: compact([jupiter, saturn]) },
    { groupId: "karma-change", title: isEn ? "Karma & Life Transitions" : "Arah Karma dan Perubahan", sections: compact([rahu, ketu, retrogradePlanets]) },
    { groupId: "life-areas", title: isEn ? "Life Domains (Houses)" : "Area Kehidupan", sections: [...houses, ...compact([planetaryStrength])] },
    { groupId: "dasha-cycle", title: isEn ? "Dasha Planetary Cycles" : "Siklus Dasha", sections: compact([mahadasha, antardasha, currentDashaThemes]) },
    { groupId: "lived-themes", title: isEn ? "Lived Life Patterns" : "Pola Kehidupan", sections: compact([relationshipThemes, workThemes, strengths, challenges, growthDirection]) },
  ].filter((group) => group.sections.length > 0);
  const heroInsight = lagna
    ? (isEn
        ? `You meet life by ${styleFor(lagna.sign || undefined, isEn)}, while your Rashi of ${rashi?.sign || "your chart"} provides a distinct inner cadence.`
        : `Kamu memasuki hidup dengan cara yang ${styleFor(lagna.sign || undefined)}, sementara Rashi ${rashi?.sign || "yang tersimpan"} memberi ritme batin yang khas.`)
    : (isEn
        ? `Rashi ${rashi?.sign || "in your chart"} and Nakshatra ${nakshatra || "available"} provide insight into inner rhythms without claiming an unverified Lagna.`
        : `Rashi ${rashi?.sign || "yang tersimpan"} dan Nakshatra ${nakshatra || "yang tersedia"} membantu membaca ritme batin tanpa mengklaim Lagna yang belum terverifikasi.`);

  return {
    status, canonicalName: "Vedic Astrology",
    hero: {
      title: isEn ? "Your Vedic Sky Map" : "Peta Langit Vedikmu",
      lagna: lagna?.displayValue || null,
      rashi: rashi?.displayValue || null,
      nakshatra: nakshatraRead?.displayValue || null,
      insight: heroInsight,
      action: isEn ? "View complete details" : "Lihat detail selengkapnya",
    },
    profileCard: {
      title: "Vedic Astrology",
      lagna: lagna?.displayValue || null,
      rashi: rashi?.displayValue || null,
      nakshatra: nakshatraRead?.displayValue || null,
      insight: heroInsight,
      action: isEn ? "View complete details" : "Lihat detail selengkapnya",
      href: "/blueprint/vedic",
    },
    groups, readContract, summary, summaryText: summary.join("\n\n"), sourceVersion: VEDIC_PRESENTATION_SOURCE_VERSION,
  };
}
