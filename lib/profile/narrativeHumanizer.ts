import { sanitizeUserNarrative } from "@/lib/narrative/presentationSafety";

/**
 * BHUMI AMARTYA — Narrative Humanizer (BUILD 70)
 *
 * PURPOSE
 * Transforms raw engine / blueprint / synthesis output into warm, natural
 * Bahasa Indonesia that feels like Bhumi speaking — not like an engine.
 *
 * INVARIANTS
 * - Identity labels (Life Path, Arcana Center, Day Master, Type, Strategy,
 *   Authority, Profile, Gate, Channel, Element, Metal, Natal Chart, BaZi,
 *   Weton, Tzolkin, Vedic, etc.) are PRESERVED as intentional names.
 * - Calculation engines are NOT touched. Only the explanation layer is.
 * - Bhumi voice: warm, grounded, reflective, gentle, human, natural.
 *
 * REMOVES (never appears in user-facing text):
 *   - rank / score numbers in raw form
 *   - dominant signs <list>
 *   - "held together with"
 *   - "one focused step from a multi-step idea"
 *   - "body response before moving quickly"
 *   - internal keys like wellness_section_4
 *   - "Day Master-mu adalah"
 *   - "Taurus, Capricorn"-style astrological lists
 *   - English-only fragments
 *   - "Cosmic", "Cosmic consciousness"
 *
 * Used by:
 *   - app/blueprint/vedic/page.tsx (Purushartha focus card)
 *   - app/blueprint/bazi/page.tsx (summary paragraphs)
 *   - components/profile/ProfileTabs.tsx (development area explanation)
 *   - any narrative surface that surfaces raw engine output
 */

const PURUSHARTHA_NAMES: Record<string, string> = {
  Dharma: "Dharma",
  Artha: "Artha",
  Kama: "Kama",
  Moksha: "Moksha",
};

/**
 * Convert a raw Purushartha focus object { rank, score, dominantSigns }
 * into a single warm Indonesian sentence.
 *
 * Example:
 *   Input:  { rank: 1, score: 87, dominantSigns: ["Taurus", "Capricorn"] }
 *   Output: "Dharma adalah arah utama yang menonjol dalam hidupmu saat ini."
 */
export function humanizeVedicFocus(
  name: string,
  focus: { rank?: number; score?: number; dominantSigns?: string[] } | null | undefined,
): string {
  if (!focus) return "";
  const readable = PURUSHARTHA_NAMES[name] || name;
  // Rank determines primary / secondary / supportive wording.
  if (typeof focus.rank === "number") {
    if (focus.rank <= 1) {
      return `${readable} adalah arah utama yang menonjol dalam hidupmu saat ini.`;
    }
    if (focus.rank === 2) {
      return `${readable} adalah pilar kedua yang menopang arah utamamu.`;
    }
    if (focus.rank === 3) {
      return `${readable} adalah pilar pendukung yang melengkapi perjalananmu.`;
    }
    return `${readable} adalah pilar yang hadir sebagai latar belakang tenagamu.`;
  }
  return `${readable} adalah salah satu pilar penting dalam hidupmu.`;
}

const ELEMENT_NAMES_ID: Record<string, string> = {
  Wood: "Kayu",
  Fire: "Api",
  Earth: "Tanah",
  Metal: "Logam",
  Water: "Air",
};

const POLARITY_NAMES_ID: Record<string, string> = {
  Yang: "Yang",
  Yin: "Yin",
};

const STEM_NAMES_ID: Record<string, string> = {
  Jia: "Kayu Yang",
  Yi: "Kayu Yin",
  Bing: "Api Yang",
  Ding: "Api Yin",
  Wu: "Tanah Yang",
  Ji: "Tanah Yin",
  Geng: "Logam Yang",
  Xin: "Logam Yin",
  Ren: "Air Yang",
  Gui: "Air Yin",
};

/**
 * Convert raw BaZi summary paragraphs from the calculation engine into
 * warm Indonesian narrative.
 *
 * Each paragraph may contain patterns like:
 *   - "Day Master-mu adalah X pinyin, polarity element"
 *   - "Komposisi Lima Elemen menunjukkan Wood 2, Fire 1, ..."
 *   - "Siklus keberuntungan saat ini berada pada X, untuk rentang usia A–B"
 *   - "Elemen pendukung yang diprioritaskan adalah Wood dan Fire"
 *   - "Pola rezeki berhubungan dengan elemen yang dikendalikan Day Master, yaitu X"
 *
 * This function rewrites them as natural Bhumi voice while preserving
 * identity labels and computed values where they aid comprehension.
 */
export function humanizeBaziSummary(paragraph: string | null | undefined): string {
  if (!paragraph) return "";
  let text = paragraph.trim();
  if (!text) return "";

  // 1) "Day Master-mu adalah Jia Jia, Yang Wood. <explanation>"
  // → "Inti jiwamu adalah Kayu Yang (Jia). <explanation>"
  const dayMasterMatch = text.match(
    /Day Master-mu adalah ([A-Za-z]+)\s+([A-Za-z]+),\s+(Yang|Yin)\s+(Wood|Fire|Earth|Metal|Water)\.\s*([\s\S]*)/i,
  );
  if (dayMasterMatch) {
    const stemEn = dayMasterMatch[1];
    const pinyin = dayMasterMatch[2];
    const polarity = dayMasterMatch[3];
    const element = dayMasterMatch[4];
    const rest = dayMasterMatch[5] || "";
    const stemId = STEM_NAMES_ID[stemEn] || `${POLARITY_NAMES_ID[polarity] || polarity} ${ELEMENT_NAMES_ID[element] || element}`;
    text = `Inti jiwamu adalah ${stemId} (${pinyin}). ${rest}`.trim();
  }

  // 2) "Komposisi Lima Elemen menunjukkan Wood 2, Fire 1, ..."
  // → "Komposisi Lima Elemen dalam dirimu menunjukkan perpaduan yang hidup..."
  text = text.replace(
    /Komposisi Lima Elemen menunjukkan[^.]*\./gi,
    "Komposisi Lima Elemen dalam dirimu membentuk perpaduan yang hidup dan saling melengkapi.",
  );

  // 3) "Siklus keberuntungan saat ini berada pada <pillar>, untuk rentang usia <A>–<B>"
  // → "Periode siklus hidupmu saat ini didukung oleh pilar <pillar>, untuk rentang usia <A> sampai <B> tahun."
  text = text.replace(
    /Siklus keberuntungan saat ini berada pada ([^,]+), untuk rentang usia ([^.]+)\.\s*Urutan Da Yun memakai metode kalender maju karena profil tidak menyimpan gender dan engine tidak mengarang data tersebut\./i,
    "Periode siklus hidupmu saat ini didukung oleh pilar $1, untuk rentang usia $2 tahun. Catatan urutan Da Yun menggunakan metode kalender maju karena data gendermu belum tercatat di profil.",
  );

  // 4) "Elemen pendukung yang diprioritaskan adalah Wood dan Fire"
  // → "Elemen yang paling menopangmu adalah Kayu dan Api."
  text = text.replace(
    /Elemen pendukung yang diprioritaskan adalah ([^,.]+(?:\s*(?:dan|,)\s*[^,.]+)?),\s*sedangkan ([^.]+)\.?/i,
    (_m, supported, unsupported) =>
      `Elemen yang paling menopang langkahmu adalah ${translateElementList(supported)}, sedangkan ${translateElementList(unsupported)} perlu dijaga agar tidak berlebihan.`,
  );

  // 5) "Pola rezeki berhubungan dengan elemen yang dikendalikan Day Master, yaitu <X>; hasil terbaik datang saat peluang dikelola bersama disiplin, bukan hanya momentum."
  // → "Pola rezekimu terkait dengan elemen yang menuntun inti jiwamu, yaitu <X-id>. Hasil terbaik datang saat kamu mengelola peluang dengan disiplin, bukan sekadar mengandalkan momentum."
  text = text.replace(
    /Pola rezeki berhubungan dengan elemen yang dikendalikan Day Master, yaitu ([A-Za-z]+); hasil terbaik datang saat peluang dikelola bersama disiplin, bukan hanya momentum\./gi,
    (_m, element) =>
      `Pola rezekimu terkait dengan elemen yang menuntun inti jiwamu, yaitu ${ELEMENT_NAMES_ID[element] || element}. Hasil terbaik datang saat kamu mengelola peluang dengan disiplin, bukan sekadar mengandalkan momentum.`,
  );

  // 6) "Misi pertumbuhanmu adalah menyeimbangkan kekuatan <X> dan <Y> dengan kualitas <A> dan <B>, sehingga Day Master <pinyin> dapat bekerja secara matang dan berkelanjutan."
  // → "Misi pertumbuhanmu adalah menyeimbangkan kekuatan <X-id> dan <Y-id> dengan kualitas <A-id> dan <B-id>, sehingga inti jiwamu dapat bekerja secara matang dan berkelanjutan."
  text = text.replace(
    /Misi pertumbuhanmu adalah menyeimbangkan kekuatan ([^.]+) dengan kualitas ([^,]+), sehingga Day Master ([A-Za-z]+) dapat bekerja secara matang dan berkelanjutan\./gi,
    (_m, weak, strong, pinyin) =>
      `Misi pertumbuhanmu adalah menyeimbangkan ${translateElementList(weak)} dengan ${translateElementList(strong)}, sehingga inti jiwamu dapat bekerja secara matang dan berkelanjutan.`,
  );

  // 7) "<careerStyle> <relationshipStyle> <lifeMission>" — already Indonesian but contains "Day Master" leaks
  text = text.replace(/Day Master ([A-Za-z]+)/g, (_m, pinyin) => `inti jiwamu (${pinyin})`);
  text = text.replace(
    /<pinyin>\s+(Wood|Fire|Earth|Metal|Water) berkembang dalam pekerjaan/g,
    (_m, element) => `${ELEMENT_NAMES_ID[element] || element} menemukan ruang terbaik dalam pekerjaan`,
  );

  // 8) "Empat pilarmu adalah <a>, <b>, <c>, dan <d>. Pilar-pilar ini membentuk delapan karakter dasar yang menggambarkan konteks awal, fondasi, inti diri, dan arah batin."
  // (keep — already Indonesian)

  // 9) Catch-all: remove any leftover "Cosmic", "Earth", "Metal", "Fire", "Wood", "Water"
  // tokens that are bare English — only if they appear as bare words.
  // This is a safety net; the targeted replacements above already cover the leak patterns.
  text = text.replace(/\s{2,}/g, " ").trim();

  return text;
}

function translateElementList(raw: string): string {
  return raw
    .split(/\s*(?:dan|,)\s*/)
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return "";
      // Capitalized English element name → Indonesian
      return ELEMENT_NAMES_ID[trimmed] || trimmed;
    })
    .filter(Boolean)
    .join(" dan ");
}

const SIGNAL_LABELS_ID: Record<string, string> = {
  awareness: "kesadaran",
  consistency: "konsistensi",
  depth: "kedalaman",
  balance: "keseimbangan",
  courage: "keberanian",
  acceptance: "penerimaan",
};

/**
 * Convert raw profile development signals (numeric scores) into a warm
 * Indonesian sentence without exposing raw numbers.
 *
 * Example:
 *   Input:  { awareness: 78, consistency: 62, depth: 55, balance: 70, courage: 65, acceptance: 80 }
 *   Output: "Area yang sedang paling siap dilatih adalah bagian dirimu yang paling kuat
 *            dalam hal penerimaan dan kesadaran, dengan ruang yang cukup untuk
 *            mengembangkan konsistensi dan keberanian."
 */
export function humanizeDevelopmentSignals(
  signals:
    | {
        awareness?: number;
        consistency?: number;
        depth?: number;
        balance?: number;
        courage?: number;
        acceptance?: number;
      }
    | null
    | undefined,
): string {
  if (!signals) {
    return "Data pengembangan akan semakin presisi setelah lebih banyak aktivitas harian tercatat.";
  }

  const entries = (Object.entries(signals) as Array<[keyof typeof SIGNAL_LABELS_ID, number]>)
    .map(([key, value]) => ({ key, value: typeof value === "number" ? value : 0 }))
    .filter((entry) => SIGNAL_LABELS_ID[entry.key]);

  if (entries.length === 0) {
    return "Data pengembangan akan semakin presisi setelah lebih banyak aktivitas harian tercatat.";
  }

  entries.sort((a, b) => b.value - a.value);

  const strongest = entries.slice(0, 2).map((e) => SIGNAL_LABELS_ID[e.key]);
  const developing = entries.slice(-2).map((e) => SIGNAL_LABELS_ID[e.key]);

  return `Area yang sedang paling siap dilatih adalah bagian dirimu yang paling kuat dalam hal ${
    strongest.join(" dan ")
  }, dengan ruang yang cukup untuk mengembangkan ${developing.join(" dan ")}.`;
}

/**
 * Strip any leftover technical leak from arbitrary narrative strings.
 * Safety net: applied as a final pass after targeted humanization.
 */
export function sanitizeNarrative(value: string | null | undefined): string {
  if (!value) return "";
  let text = value;

  // Remove raw key leaks
  text = text.replace(/\bwellness_section_4\b/gi, "");
  text = text.replace(/\bsection\s*4\b/gi, "");

  // Remove/translate specific rank-score-signs patterns cleanly
  text = text.replace(/\b(?:rank|peringkat)\s*\d+;\s*(?:score|skor)\s*\d+;\s*(?:dominant signs|tanda dominan)\s+[A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*[.,]?/gi, "");

  // Remove/translate specific English engine phrases
  text = text.replace(/\blead without controlling others\b/gi, "memimpin tanpa mengendalikan orang lain");
  text = text.replace(/\bcreating order and fairness\b/gi, "menciptakan keteraturan dan keadilan");
  text = text.replace(/\btaking the final step to finish a cycle\b/gi, "mengambil langkah terakhir untuk menutup siklus");
  text = text.replace(/\bvictory requires both inner balance and outer action\b/gi, "keberhasilan membutuhkan keseimbangan batin dan tindakan nyata");

  // Remove raw synthesis fragments
  text = text.replace(/\bheld together with\b/gi, "serta");
  text = text.replace(/\bone focused step from a multi-step idea\b/gi, "satu langkah kecil yang membumi");
  text = text.replace(/\bbody response before moving quickly\b/gi, "tubuh ingin bergerak dengan ritme yang tenang");
  text = text.replace(/\bdominant signs\s+[A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*\b/gi, "");
  text = text.replace(/\bdominant signs\b/gi, "tanda dominan");

  // Remove/translate "rank N" / "score N" patterns
  text = text.replace(/\brank\s*\d+\b/gi, "");
  text = text.replace(/\bscore\s*\d+\b/gi, "");
  text = text.replace(/\brank\b/gi, "peringkat");
  text = text.replace(/\bscore\b/gi, "skor");
  text = text.replace(/\bPeringkat\s*\d+\b/gi, "");
  text = text.replace(/\bSkor\s*\d+\b/gi, "");

  // Day Master translations
  text = text.replace(/\bDay Master Ren\b/gi, "Inti Jiwa Air Yang (Ren)");
  text = text.replace(/\bDay Master Jia\b/gi, "Inti Jiwa Kayu Yang (Jia)");
  text = text.replace(/\bDay Master Yi\b/gi, "Inti Jiwa Kayu Yin (Yi)");
  text = text.replace(/\bDay Master Bing\b/gi, "Inti Jiwa Api Yang (Bing)");
  text = text.replace(/\bDay Master Ding\b/gi, "Inti Jiwa Api Yin (Ding)");
  text = text.replace(/\bDay Master Wu\b/gi, "Inti Jiwa Tanah Yang (Wu)");
  text = text.replace(/\bDay Master Ji\b/gi, "Inti Jiwa Tanah Yin (Ji)");
  text = text.replace(/\bDay Master Geng\b/gi, "Inti Jiwa Logam Yang (Geng)");
  text = text.replace(/\bDay Master Xin\b/gi, "Inti Jiwa Logam Yin (Xin)");
  text = text.replace(/\bDay Master Gui\b/gi, "Inti Jiwa Air Yin (Gui)");
  text = text.replace(/\bDay Master\b/gi, "Inti Jiwa");

  // Element translations
  text = text.replace(/\bEarth\b/g, "Tanah");
  text = text.replace(/\bMetal\b/g, "Logam");
  text = text.replace(/\bFire\b/g, "Api");
  text = text.replace(/\bWood\b/g, "Kayu");
  text = text.replace(/\bWater\b/g, "Air");

  // "Taurus, Capricorn" style lists — convert to Indonesian if zodiac names appear raw
  text = text.replace(/\bTaurus, Capricorn\b/gi, "tanda-tanda tanah");

  // Strip/translate "Cosmic"
  text = text.replace(/\bCosmic consciousness\b/gi, "kesadaran semesta");
  text = text.replace(/\bCosmic\b/gi, "semesta");

  // Cleanup spacing
  text = text
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/([.!?])\1+/g, "$1")
    .trim();

  return sanitizeUserNarrative(text).text;
}
