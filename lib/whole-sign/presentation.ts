import { ASTRO_PLANET_MEANINGS, ASTRO_PLANET_MEANINGS_EN } from "@/lib/data/astrologyDictionaries";
import { isEnlEdition } from "@/lib/config/edition";
import type { WholeSignHouse, WholeSignPlanetPlacement, WholeSignPresentation, WholeSignResult } from "./types";

const SIGN_TONES: Record<string, string> = {
  Aries: "langsung, berani, dan siap memulai", Taurus: "tenang, konsisten, dan berorientasi pada hal nyata",
  Gemini: "ingin tahu, lincah, dan terbuka pada banyak sudut pandang", Cancer: "peka, melindungi, dan mencari rasa aman",
  Leo: "hangat, kreatif, dan berani memperlihatkan isi hati", Virgo: "teliti, berguna, dan peka terhadap hal yang perlu diperbaiki",
  Libra: "relasional, adil, dan mencari keseimbangan", Scorpio: "mendalam, intens, dan berani menghadapi perubahan",
  Sagittarius: "terbuka, luas, dan terdorong mencari makna", Capricorn: "terarah, bertanggung jawab, dan sabar membangun",
  Aquarius: "mandiri, visioner, dan peka pada kebutuhan bersama", Pisces: "imajinatif, lembut, dan mudah menangkap suasana",
};

const SIGN_TONES_EN: Record<string, string> = {
  Aries: "direct, courageous, and ready to initiate",
  Taurus: "calm, consistent, and anchored in tangible reality",
  Gemini: "curious, agile, and receptive to diverse perspectives",
  Cancer: "sensitive, protective, and seeking emotional safety",
  Leo: "warm, creative, and boldly expressing heartfelt truth",
  Virgo: "discerning, practical, and attuned to thoughtful refinement",
  Libra: "relational, balanced, and seeking fair harmony",
  Scorpio: "penetrating, intense, and fearlessly meeting transformation",
  Sagittarius: "open, expansive, and propelled to seek wisdom",
  Capricorn: "structured, accountable, and patiently building lasting foundations",
  Aquarius: "independent, visionary, and attuned to collective needs",
  Pisces: "imaginative, gentle, and fluidly receptive to emotional nuances",
};

const HOUSE_TITLES: Record<number, string> = {
  1: "Diri dan Cara Hadir", 2: "Nilai dan Sumber Daya", 3: "Pikiran dan Lingkungan Dekat", 4: "Rumah, Akar, dan Keamanan Batin",
  5: "Kreativitas dan Kegembiraan", 6: "Ritme Harian dan Perawatan", 7: "Relasi dan Kemitraan", 8: "Keintiman dan Transformasi",
  9: "Makna dan Perluasan Wawasan", 10: "Kontribusi dan Arah Publik", 11: "Komunitas dan Visi", 12: "Dunia Batin dan Pemulihan",
};

const HOUSE_TITLES_EN: Record<number, string> = {
  1: "Self & Presence", 2: "Self-Worth & Resources", 3: "Mind & Local Environment", 4: "Home, Roots & Sanctuary",
  5: "Creativity & Joy", 6: "Daily Rhythm & Health", 7: "Partnership & Relating", 8: "Intimacy & Transformation",
  9: "Belief & Horizon Expansion", 10: "Career & Public Standing", 11: "Community & Vision", 12: "Inner Realm & Solitude",
};

const tone = (sign?: string | null, isEn = isEnlEdition()) =>
  (isEn ? SIGN_TONES_EN[sign || ""] : SIGN_TONES[sign || ""]) || (isEn ? "a distinctive rhythm" : "memiliki ritme yang khas");
const planetAt = (result: WholeSignResult, name: string) => result.planets.find((planet) => planet.planet === name) || null;
const houseAt = (result: WholeSignResult, number: number) => result.houses.find((house) => house.houseNumber === number) || null;
const placementValue = (planet: WholeSignPlanetPlacement) => `${planet.sign} · House ${planet.wholeSignHouse ?? "—"} · ${planet.degree}°${String(planet.minute).padStart(2, "0")}′${planet.retrograde ? " · Retrograde" : ""}`;
const domain = (house?: number | null, isEn = isEnlEdition()) =>
  house
    ? (isEn ? HOUSE_TITLES_EN[house].toLowerCase() : HOUSE_TITLES[house].toLowerCase())
    : (isEn ? "an unmapped area of life" : "area kehidupan yang belum terpetakan");

function planetNarrative(planet: WholeSignPlanetPlacement, aspects: WholeSignResult["aspects"], isEn = isEnlEdition()): string {
  if (isEn) {
    const area = planet.wholeSignHouse ? HOUSE_TITLES_EN[planet.wholeSignHouse].toLowerCase() : "the experience shown by its sign";
    const functionText = ASTRO_PLANET_MEANINGS_EN[planet.planet] || "this dimension of life";
    const aspect = aspects.find((item) => item.p1 === planet.planet || item.p2 === planet.planet);
    const counterpart = aspect ? (aspect.p1 === planet.planet ? aspect.p2 : aspect.p1) : null;
    const aspectCondition = aspect ? `, while its ${aspect.type.toLowerCase()} aspect with ${counterpart} brings dynamic nuance to harmonize` : "";
    const review = planet.retrograde
      ? `Being retrograde, this quality tends to undergo deep internal reflection before translating into outward action${aspectCondition}.`
      : `This quality expresses directly when circumstances feel clear${aspectCondition}.`;
    return `Through your ${functionText}, you naturally engage life in a way that is ${tone(planet.sign, true)}. The sphere of ${area} is where this theme most consistently finds tangible form. ${review}`;
  }

  const area = planet.wholeSignHouse ? HOUSE_TITLES[planet.wholeSignHouse].toLowerCase() : "pengalaman yang dapat dibaca dari tandanya";
  const functionText = ASTRO_PLANET_MEANINGS[planet.planet] || "bagian pengalaman ini";
  const aspect = aspects.find((item) => item.p1 === planet.planet || item.p2 === planet.planet);
  const counterpart = aspect ? (aspect.p1 === planet.planet ? aspect.p2 : aspect.p1) : null;
  const aspectCondition = aspect ? `, sementara hubungan ${aspect.type.toLowerCase()} dengan ${counterpart} menambah dinamika yang perlu diolah sebagai satu kesatuan` : "";
  const review = planet.retrograde
    ? `Geraknya yang retrograde membuat fungsi ini lebih sering ditinjau dari dalam sebelum menjadi tindakan${aspectCondition}.`
    : `Fungsi ini cenderung bergerak lebih langsung ketika keadaan terasa jelas${aspectCondition}.`;
  return `Dalam ${functionText}, kamu cenderung bergerak dengan cara yang ${tone(planet.sign, false)}. Area ${area} menjadi tempat kualitas ini paling sering mencari bentuk dalam keseharian. ${review}`;
}

function houseCard(house: WholeSignHouse, isEn = isEnlEdition()) {
  const rulers = house.modernCoRuler
    ? `${house.ruler}; ${isEn ? "modern co-ruler" : "ko-penguasa modern"} ${house.modernCoRuler}`
    : house.ruler;
  const occupants = house.planets.length ? house.planets.join(", ") : (isEn ? "No planets" : "Tidak ada planet");
  return {
    id: `house-${house.houseNumber}`,
    title: `House ${house.houseNumber} · ${isEn ? HOUSE_TITLES_EN[house.houseNumber] : HOUSE_TITLES[house.houseNumber]}`,
    value: `${house.sign} · ${isEn ? "Ruler" : "Penguasa"} ${rulers} · ${occupants}`,
    narrative: house.fullExplanation,
  };
}

export function buildWholeSignPresentation(result: WholeSignResult, options: { isEn?: boolean } = {}): WholeSignPresentation {
  const isEn = options.isEn ?? isEnlEdition();
  const sun = planetAt(result, "Sun");
  const moon = planetAt(result, "Moon");
  const venus = planetAt(result, "Venus");
  const mars = planetAt(result, "Mars");
  const saturn = planetAt(result, "Saturn");
  const jupiter = planetAt(result, "Jupiter");
  const neptune = planetAt(result, "Neptune");
  const northNode = planetAt(result, "NorthNode");
  const house1 = houseAt(result, 1);
  const house4 = houseAt(result, 4);
  const house7 = houseAt(result, 7);
  const house10 = houseAt(result, 10);
  const house9 = houseAt(result, 9);
  const house12 = houseAt(result, 12);
  const chartRuler = house1?.ruler || null;
  const chartRulerPlacement = chartRuler ? planetAt(result, chartRuler) : null;

  const ascendant = result.ascendant ? {
    id: "ascendant", title: "Ascendant", value: `${result.ascendant.sign} · House 1`,
    narrative: isEn
      ? `You enter experiences with a presence that is ${tone(result.ascendant.sign, true)}. This quality permeates your immediate instinct, social interface, and how your body senses the room before thoughts analyze. Because this sign encompasses all of House 1, this presence becomes the foundational lens for understanding your entire house mandala.`
      : `Kamu cenderung memasuki pengalaman dengan cara yang ${tone(result.ascendant.sign, false)}. Kualitas ini terasa dalam respons pertama, kehadiran sosial, dan cara tubuhmu membaca keadaan sebelum pikiran menyusun penjelasan. Karena tanda ini menjadi keseluruhan House 1, cara hadir tersebut menjadi pintu masuk untuk memahami susunan rumah yang lain.`,
  } : null;
  const sunCard = sun ? { id: "sun", title: "Sun", value: placementValue(sun), narrative: planetNarrative(sun, result.aspects, isEn) } : null;
  const moonCard = moon ? { id: "moon", title: "Moon", value: placementValue(moon), narrative: planetNarrative(moon, result.aspects, isEn) } : null;
  const otherPlanets = result.planets.filter((planet) => !["Sun", "Moon"].includes(planet.planet)).map((planet) => ({
    id: `planet-${planet.planet.toLowerCase()}`, title: planet.planet, value: placementValue(planet), narrative: planetNarrative(planet, result.aspects, isEn),
  }));

  const emphasisCards = result.houseEmphasis.map((item) => ({
    id: `emphasis-${item.houseNumber}`,
    title: `House ${item.houseNumber} · ${isEn ? HOUSE_TITLES_EN[item.houseNumber] : HOUSE_TITLES[item.houseNumber]}`,
    value: item.planets.join(", ") || item.sign,
    narrative: isEn
      ? `This area of life frequently calls for mindful attention because of ${item.reasons.join(", ")}. This emphasis is not a ranking, but an indicator of where life experiences gather and invite conscious integration.`
      : `Bagian hidup ini lebih sering meminta perhatian karena ${item.reasons.join(", ")}. Penekanan tersebut bukan peringkat, melainkan petunjuk tentang tempat pengalaman cenderung berkumpul dan memerlukan integrasi sadar.`,
  }));

  const angularPlanets = result.angularPlanets.length ? {
    id: "angular-planets", title: "Angular Planets", value: result.angularPlanets.map((planet) => `${planet.planet} · House ${planet.wholeSignHouse}`).join(" · "),
    narrative: isEn
      ? `Several foundational planetary archetypes occupy angular houses, allowing themes of action, foundation, partnership, or contribution to manifest vividly in tangible life decisions.`
      : `Beberapa fungsi penting berada pada rumah sudut, sehingga tema tindakan, fondasi, hubungan, atau kontribusi lebih mudah terasa dalam keputusan nyata. Ini menunjukkan penekanan struktural, bukan janji tentang keberhasilan atau visibilitas.`,
  } : null;

  const midheaven = result.midheaven ? {
    id: "midheaven", title: "Midheaven Placement", value: `${result.midheaven.sign}${result.midheaven.wholeSignHouse ? ` · House ${result.midheaven.wholeSignHouse}` : ""}`,
    narrative: isEn
      ? `Your public contribution carries a tone that is ${tone(result.midheaven.sign, true)}. Its placement is read in the exact house holding the Midheaven degree, without artificially forcing it into House 10. Mastery emerges when vocational visibility stays rooted in the values you cherish.`
      : `Arah kontribusi publikmu membawa kualitas yang ${tone(result.midheaven.sign, false)}. Letaknya dibaca pada rumah yang benar-benar memuat tanda Midheaven, tanpa memaksanya masuk ke House 10. Kematangan tumbuh ketika tanggung jawab dan visibilitas tetap terhubung dengan nilai yang ingin kamu bangun.`,
  } : null;

  const relationshipThemes = house7
    ? (isEn
      ? `In relationships, you require an atmosphere that is ${tone(house7.sign, true)} for intimacy to remain vital and balanced. ${venus ? `Giving and receiving love follows an expression that is ${tone(venus.sign, true)}.` : "Patterns of affection mature through real interactions."} ${mars && moon ? "Assertiveness, boundaries, and emotional vulnerabilities become healthier when spoken before hardening into reactions." : "Clear boundaries foster closeness without second-guessing."}`
      : `Dalam hubungan, kamu membutuhkan ruang yang ${tone(house7.sign, false)} agar kedekatan tetap terasa hidup dan setara. ${venus ? `Cara memberi serta menerima kasih bergerak dengan ritme yang ${tone(venus.sign, false)}.` : "Cara memberi dan menerima kasih tetap perlu dibaca dari pengalaman yang tersedia."} ${mars && moon ? "Dorongan, batas, dan kebutuhan emosional menjadi lebih matang ketika dibicarakan sebelum berubah menjadi reaksi." : "Kejelasan batas membantu kedekatan berkembang tanpa menebak kebutuhan satu sama lain."}`)
    : null;
  const homeThemes = house4
    ? (isEn
      ? `At home and in private sanctuary, emotional safety deepens in an atmosphere that is ${tone(house4.sign, true)}. ${moon ? `Your emotional needs possess their own rhythm that is ${tone(moon.sign, true)}, requiring sanctuary to honor both.` : "Your emotional foundation needs a quiet space to hear yourself."} Home becomes a source of renewal when protection and vulnerability co-exist gracefully.`
      : `Di rumah dan kehidupan pribadi, rasa aman bertumbuh melalui suasana yang ${tone(house4.sign, false)}. ${moon ? `Kebutuhan emosionalmu sendiri membawa ritme yang ${tone(moon.sign, false)}, sehingga waktu pulih perlu memberi ruang bagi kedua kualitas itu.` : "Fondasi batin memerlukan ritme yang cukup tenang untuk mengenali kebutuhanmu."} Rumah menjadi sumber daya saat perlindungan dan keterbukaan tidak saling meniadakan.`)
    : null;
  const workThemes = house10
    ? (isEn
      ? `In professional spheres, you build contribution in a manner that is ${tone(house10.sign, true)}. ${saturn ? `Accountability evolves through an approach that is ${tone(saturn.sign, true)}, while Midheaven provides a public orientation that may inhabit a distinct house.` : "Professional mastery grows when large visions become daily reliable practices."} There is no single designated profession; what matters is alignment between your working style and the meaningful impact you nurture.`
      : `Di ruang kerja, kamu cenderung membangun kontribusi dengan cara yang ${tone(house10.sign, false)}. ${saturn ? `Tanggung jawab berkembang melalui pendekatan yang ${tone(saturn.sign, false)}, sementara Midheaven memberi arah publik yang tidak harus berada di rumah yang sama.` : "Tanggung jawab tumbuh ketika arah besar diterjemahkan menjadi kebiasaan yang dapat dijaga."} Tidak ada satu profesi yang ditentukan; yang penting adalah keselarasan antara kualitas kerja dan dampak yang ingin dirawat.`)
    : null;
  const growthThemes = chartRulerPlacement
    ? (isEn
      ? `Your chart ruler resides in House ${chartRulerPlacement.wholeSignHouse}, so developmental growth regularly loops back to ${domain(chartRulerPlacement.wholeSignHouse, true)}. This quality matures when being ${tone(chartRulerPlacement.sign, true)} transcends a mere predisposition and becomes an intentional way of showing up.`
      : `Penguasa bagan berada di House ${chartRulerPlacement.wholeSignHouse}, sehingga pertumbuhan sering kembali pada ${HOUSE_TITLES[chartRulerPlacement.wholeSignHouse || 1].toLowerCase()}. Kualitas ini matang ketika ${tone(chartRulerPlacement.sign, false)} tidak berhenti sebagai kecenderungan, tetapi menjadi pilihan yang konsisten. Pilih satu tindakan yang mempertemukan kebutuhan pribadi dengan keadaan yang benar-benar sedang kamu jalani.`)
    : null;
  const spiritualThemes = house9 && house12
    ? (isEn
      ? `Your quest for meaning expands through pursuits that are ${tone(house9.sign, true)}, keeping faith vibrant when tested by real experience. ${jupiter && neptune ? `The urge to broaden your horizons moves ${tone(jupiter.sign, true)}, while quiet introspection and imagination flow ${tone(neptune.sign, true)}.` : "Study and silence walk side-by-side to keep inner exploration grounded."} Spiritual maturity is measured not by lofty abstractions, but by the capacity to bring insight into daily integrity, compassion, and responsibility.`
      : `Cara mencari makna berkembang melalui pengalaman yang ${tone(house9.sign, false)}, sehingga keyakinan terasa hidup ketika terus diuji oleh wawasan dan pengalaman nyata. ${jupiter && neptune ? `Dorongan memperluas pandangan bergerak dengan cara yang ${tone(jupiter.sign, false)}, sementara ruang hening dan imajinasimu membutuhkan ritme yang ${tone(neptune.sign, false)}.` : "Belajar dan keheningan perlu berjalan berdampingan agar pencarian batin tetap memiliki pijakan."} Kedewasaan spiritual tidak diukur dari seberapa tinggi pengalamanmu, melainkan dari kemampuan membawa pemahaman ke sikap yang lebih jujur, lembut, dan bertanggung jawab.`)
    : null;
  const soulMissionThemes = sun && northNode && chartRulerPlacement
    ? (isEn
      ? `Soul purpose is not a rigid script to fulfill, but an evolutionary direction that invites you to express your life force consciously. Identity unfolds through ${domain(sun.wholeSignHouse, true)}, while fresh growth is cultivated through ${domain(northNode.wholeSignHouse, true)}. Your chart ruler reminds you that purpose becomes real when moving in a way that is ${tone(chartRulerPlacement.sign, true)} is translated into sustained contribution.`
      : `Misi jiwa di sini bukan satu takdir yang harus dipenuhi, melainkan arah pertumbuhan yang berulang kali mengajakmu menggunakan daya hidup secara lebih sadar. Identitasmu berkembang melalui ${HOUSE_TITLES[sun.wholeSignHouse || 1].toLowerCase()}, sementara arah baru dilatih lewat ${HOUSE_TITLES[northNode.wholeSignHouse || 1].toLowerCase()}. Penguasa bagan mengingatkan bahwa tujuan menjadi nyata ketika cara yang ${tone(chartRulerPlacement.sign, false)} diterjemahkan menjadi kontribusi yang dapat dijalani secara konsisten.`)
    : null;

  const complete = result.birthDataStatus === "available" && result.ascendant && sun && moon && house1 && house4 && house7 && house10;
  const changedHouses = result.planets.filter((planet) => planet.placidusHouse && planet.wholeSignHouse && planet.placidusHouse !== planet.wholeSignHouse);
  const topEmphasis = result.houseEmphasis[0] || null;
  const secondEmphasis = result.houseEmphasis[1] || null;
  const angularNames = result.angularPlanets.map((planet) => isEn ? `${planet.planet} in House ${planet.wholeSignHouse}` : `${planet.planet} di House ${planet.wholeSignHouse}`).join(", ");
  const redistribution = changedHouses.slice(0, 3).map((planet) => `${planet.planet}: House ${planet.placidusHouse} → ${planet.wholeSignHouse}`).join("; ");

  const summary = isEn ? (complete ? [
    `With ${result.ascendant!.sign} as the complete sign of House 1, your entire mandala of life houses flows from an approach that is ${tone(result.ascendant!.sign, true)}. Your chart ruler, ${chartRuler}, resides in House ${chartRulerPlacement?.wholeSignHouse ?? "—"}, making ${domain(chartRulerPlacement?.wholeSignHouse, true)} the primary channel where personal choice takes concrete form.`,
    `${sun ? `Sun in House ${sun.wholeSignHouse} places conscious vitality within ${domain(sun.wholeSignHouse, true)}` : "Sun placement is not yet available"}, while ${moon ? `Moon in House ${moon.wholeSignHouse} makes ${domain(moon.wholeSignHouse, true)} your center of emotional replenishment` : "Moon placement is not yet available"}. These two houses delineate spheres of life domain stewardship in Whole Sign, distinct from Natal psychological traits.`,
    `${topEmphasis ? `Primary density concentrates in House ${topEmphasis.houseNumber}, hosting ${topEmphasis.planets.join(", ")} and emphasizing ${domain(topEmphasis.houseNumber, true)}` : "No single house cluster dominates"}${secondEmphasis ? `; secondary focus in House ${secondEmphasis.houseNumber} links this with ${domain(secondEmphasis.houseNumber, true)}` : ""}. ${angularNames ? `Angular structure is anchored by ${angularNames}, allowing these themes to manifest vividly in tangible life decisions.` : "No angular planets require additional weighting."}`,
    `${redistribution ? `Compared to Placidus placements, the clearest house shifts are ${redistribution}.` : "Key house placements show no substantial shift from available Placidus data."} This difference provides a life-domain lens: it shifts the sphere where an archetypal function is lived, without invalidating your zodiacal signs or Natal Chart synthesis. Your path of integration prioritizes ${domain(chartRulerPlacement?.wholeSignHouse, true)} while nurturing ${domain(topEmphasis?.houseNumber, true)}.`,
  ] : [
    `Available sign placements still clarify the foundational tones of how you think, feel, and act. However, house mandalas cannot be mapped reliably without verified birth time, timezone, and location. Missing data is never substituted with guesswork.`,
    `You can complete your birth details to unlock your life domains, chart ruler, and house concentrations. Until then, use the available data as a focused mirror rather than a complete blueprint. Methodological rigor keeps insight genuine.`,
  ]) : (complete ? [
    `Dengan ${result.ascendant!.sign} sebagai tanda penuh House 1, seluruh susunan rumah bergerak dari cara hadir yang ${tone(result.ascendant!.sign, false)}. Penguasa chart, ${chartRuler}, berada di House ${chartRulerPlacement?.wholeSignHouse ?? "—"}, sehingga ${domain(chartRulerPlacement?.wholeSignHouse, false)} menjadi jalur utama tempat pilihan pribadi memperoleh bentuk.`,
    `${sun ? `Sun di House ${sun.wholeSignHouse} menempatkan daya hidup pada ${domain(sun.wholeSignHouse, false)}` : "Posisi Sun belum tersedia"}, sedangkan ${moon ? `Moon di House ${moon.wholeSignHouse} membuat ${domain(moon.wholeSignHouse, false)} menjadi pusat pemulihan emosional` : "posisi Moon belum tersedia"}. Kedua rumah ini menunjukkan area kepemilikan pengalaman dalam Whole Sign, bukan pengulangan pembacaan psikologis Natal.`,
    `${topEmphasis ? `Kepadatan utama berada di House ${topEmphasis.houseNumber}, yang memuat ${topEmphasis.planets.join(", ")} dan menekankan ${domain(topEmphasis.houseNumber, false)}` : "Tidak ada cluster rumah tunggal yang mendominasi"}${secondEmphasis ? `; penekanan kedua di House ${secondEmphasis.houseNumber} menghubungkannya dengan ${domain(secondEmphasis.houseNumber, false)}` : ""}. ${angularNames ? `Struktur sudut diperkuat oleh ${angularNames}, sehingga tema tersebut lebih mudah muncul sebagai keputusan dan kejadian nyata.` : "Tidak ada planet sudut yang perlu diberi bobot tambahan."}`,
    `${redistribution ? `Dibanding penempatan Placidus, perpindahan rumah yang paling jelas adalah ${redistribution}.` : "Penempatan rumah utama tidak menunjukkan redistribusi yang berarti dari data Placidus yang tersedia."} Perbedaan ini adalah lensa domain hidup: ia mengubah tempat sebuah fungsi dibaca, bukan membatalkan posisi tanda atau sintesis Natal Chart. Arah integrasinya adalah memberi prioritas pada ${domain(chartRulerPlacement?.wholeSignHouse, false)} sambil tetap merawat ${domain(topEmphasis?.houseNumber, false)}.`,
  ] : [
    `Bagian tanda yang tersedia tetap dapat membantu mengenali warna dasar cara berpikir, merasa, dan bergerak. Namun susunan rumah belum dapat dibaca dengan aman tanpa waktu lahir, zona waktu, dan lokasi yang terverifikasi. Data yang belum ada tidak diganti dengan asumsi.`,
    `Kamu dapat melengkapi data kelahiran untuk membuka pembacaan tentang area kehidupan, penguasa bagan, dan penekanan rumah. Sampai saat itu, gunakan informasi yang tersedia sebagai cermin terbatas, bukan gambaran utuh. Ketelitian pada data adalah bagian dari menjaga pembacaan tetap jujur.`,
  ]);

  const insight = result.ascendant && sun && moon
    ? (isEn
      ? `You enter experiences with a presence that is ${tone(result.ascendant.sign, true)}, while your core identity and emotional needs unfold through distinct life spheres.`
      : `Kamu hadir dengan cara yang ${tone(result.ascendant.sign, false)}, sementara identitas dan kebutuhan emosional berkembang melalui area hidup yang berbeda.`)
    : (isEn
      ? "Accurate birth time, timezone, and location are required to construct your Whole Sign houses."
      : "Waktu lahir, zona waktu, dan lokasi yang tepat diperlukan untuk membuka susunan rumah Whole Sign.");

  return {
    hero: {
      eyebrow: "Whole Sign Birth Chart",
      title: isEn ? "Life Houses in Whole Sign" : "Rumah Kehidupan dalam Whole Sign",
      metrics: [
        { label: "Ascendant", value: result.ascendant?.sign || (isEn ? "Not available" : "Belum tersedia") },
        { label: "Sun", value: sun?.wholeSignHouse ? `House ${sun.wholeSignHouse}` : sun?.sign || (isEn ? "Not available" : "Belum tersedia") },
        { label: "Moon", value: moon?.wholeSignHouse ? `House ${moon.wholeSignHouse}` : moon?.sign || (isEn ? "Not available" : "Belum tersedia") },
      ],
      insight,
    },
    identity: [
      { label: "Zodiac", value: "Tropical Zodiac" }, { label: "House System", value: "Whole Sign Houses" },
      { label: "Ascendant", value: result.ascendant?.sign || (isEn ? "Not available" : "Belum tersedia") },
      { label: "Midheaven", value: result.midheaven?.sign || (isEn ? "Not available" : "Belum tersedia") },
    ],
    ascendant, sun: sunCard, moon: moonCard, planets: otherPlanets,
    houses: result.houses.map((h) => houseCard(h, isEn)), houseEmphasis: emphasisCards, angularPlanets, midheaven,
    relationshipThemes, homeThemes, workThemes, growthThemes, spiritualThemes, soulMissionThemes,
    summary,
    availabilityStatus: result.birthDataStatus,
    availabilityMessage: result.note,
    profileCard: {
      title: "Whole Sign Birth Chart",
      ascendant: result.ascendant?.sign || null,
      sunHouse: sun?.wholeSignHouse ? `House ${sun.wholeSignHouse}` : null,
      moonHouse: moon?.wholeSignHouse ? `House ${moon.wholeSignHouse}` : null,
      insight,
      action: isEn ? "View full details" : "Lihat detail selengkapnya",
      href: "/blueprint/whole-sign",
    },
    sourceVersion: result.sourceVersion,
    sourceClassification: result.sourceClassification,
  };
}
