import { ASTRO_PLANET_MEANINGS } from "@/lib/data/astrologyDictionaries";
import type { WholeSignHouse, WholeSignPlanetPlacement, WholeSignPresentation, WholeSignResult } from "./types";

const SIGN_TONES: Record<string, string> = {
  Aries: "langsung, berani, dan siap memulai", Taurus: "tenang, konsisten, dan berorientasi pada hal nyata",
  Gemini: "ingin tahu, lincah, dan terbuka pada banyak sudut pandang", Cancer: "peka, melindungi, dan mencari rasa aman",
  Leo: "hangat, kreatif, dan berani memperlihatkan isi hati", Virgo: "teliti, berguna, dan peka terhadap hal yang perlu diperbaiki",
  Libra: "relasional, adil, dan mencari keseimbangan", Scorpio: "mendalam, intens, dan berani menghadapi perubahan",
  Sagittarius: "terbuka, luas, dan terdorong mencari makna", Capricorn: "terarah, bertanggung jawab, dan sabar membangun",
  Aquarius: "mandiri, visioner, dan peka pada kebutuhan bersama", Pisces: "imajinatif, lembut, dan mudah menangkap suasana",
};

const HOUSE_TITLES: Record<number, string> = {
  1: "Diri dan Cara Hadir", 2: "Nilai dan Sumber Daya", 3: "Pikiran dan Lingkungan Dekat", 4: "Rumah, Akar, dan Keamanan Batin",
  5: "Kreativitas dan Kegembiraan", 6: "Ritme Harian dan Perawatan", 7: "Relasi dan Kemitraan", 8: "Keintiman dan Transformasi",
  9: "Makna dan Perluasan Wawasan", 10: "Kontribusi dan Arah Publik", 11: "Komunitas dan Visi", 12: "Dunia Batin dan Pemulihan",
};

const tone = (sign?: string | null) => SIGN_TONES[sign || ""] || "memiliki ritme yang khas";
const planetAt = (result: WholeSignResult, name: string) => result.planets.find((planet) => planet.planet === name) || null;
const houseAt = (result: WholeSignResult, number: number) => result.houses.find((house) => house.houseNumber === number) || null;
const placementValue = (planet: WholeSignPlanetPlacement) => `${planet.sign} · House ${planet.wholeSignHouse ?? "—"} · ${planet.degree}°${String(planet.minute).padStart(2, "0")}′${planet.retrograde ? " · Retrograde" : ""}`;
const domain = (house?: number | null) => house ? HOUSE_TITLES[house].toLowerCase() : "area kehidupan yang belum terpetakan";

function planetNarrative(planet: WholeSignPlanetPlacement, aspects: WholeSignResult["aspects"]): string {
  const area = planet.wholeSignHouse ? HOUSE_TITLES[planet.wholeSignHouse].toLowerCase() : "pengalaman yang dapat dibaca dari tandanya";
  const functionText = ASTRO_PLANET_MEANINGS[planet.planet] || "bagian pengalaman ini";
  const aspect = aspects.find((item) => item.p1 === planet.planet || item.p2 === planet.planet);
  const counterpart = aspect ? (aspect.p1 === planet.planet ? aspect.p2 : aspect.p1) : null;
  const aspectCondition = aspect ? `, sementara hubungan ${aspect.type.toLowerCase()} dengan ${counterpart} menambah dinamika yang perlu diolah sebagai satu kesatuan` : "";
  const review = planet.retrograde
    ? `Geraknya yang retrograde membuat fungsi ini lebih sering ditinjau dari dalam sebelum menjadi tindakan${aspectCondition}.`
    : `Fungsi ini cenderung bergerak lebih langsung ketika keadaan terasa jelas${aspectCondition}.`;
  return `Dalam ${functionText}, kamu cenderung bergerak dengan cara yang ${tone(planet.sign)}. Area ${area} menjadi tempat kualitas ini paling sering mencari bentuk dalam keseharian. ${review}`;
}

function houseCard(house: WholeSignHouse) {
  const rulers = house.modernCoRuler ? `${house.ruler}; ko-penguasa modern ${house.modernCoRuler}` : house.ruler;
  const occupants = house.planets.length ? house.planets.join(", ") : "Tidak ada planet";
  return {
    id: `house-${house.houseNumber}`,
    title: `House ${house.houseNumber} · ${HOUSE_TITLES[house.houseNumber]}`,
    value: `${house.sign} · Penguasa ${rulers} · ${occupants}`,
    narrative: house.fullExplanation,
  };
}

export function buildWholeSignPresentation(result: WholeSignResult): WholeSignPresentation {
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
    narrative: `Kamu cenderung memasuki pengalaman dengan cara yang ${tone(result.ascendant.sign)}. Kualitas ini terasa dalam respons pertama, kehadiran sosial, dan cara tubuhmu membaca keadaan sebelum pikiran menyusun penjelasan. Karena tanda ini menjadi keseluruhan House 1, cara hadir tersebut menjadi pintu masuk untuk memahami susunan rumah yang lain.`,
  } : null;
  const sunCard = sun ? { id: "sun", title: "Sun", value: placementValue(sun), narrative: planetNarrative(sun, result.aspects) } : null;
  const moonCard = moon ? { id: "moon", title: "Moon", value: placementValue(moon), narrative: planetNarrative(moon, result.aspects) } : null;
  const otherPlanets = result.planets.filter((planet) => !["Sun", "Moon"].includes(planet.planet)).map((planet) => ({
    id: `planet-${planet.planet.toLowerCase()}`, title: planet.planet, value: placementValue(planet), narrative: planetNarrative(planet, result.aspects),
  }));

  const emphasisCards = result.houseEmphasis.map((item) => ({
    id: `emphasis-${item.houseNumber}`,
    title: `House ${item.houseNumber} · ${HOUSE_TITLES[item.houseNumber]}`,
    value: item.planets.join(", ") || item.sign,
    narrative: `Bagian hidup ini lebih sering meminta perhatian karena ${item.reasons.join(", ")}. Penekanan tersebut bukan peringkat, melainkan petunjuk tentang tempat pengalaman cenderung berkumpul dan memerlukan integrasi sadar.`,
  }));

  const angularPlanets = result.angularPlanets.length ? {
    id: "angular-planets", title: "Angular Planets", value: result.angularPlanets.map((planet) => `${planet.planet} · House ${planet.wholeSignHouse}`).join(" · "),
    narrative: `Beberapa fungsi penting berada pada rumah sudut, sehingga tema tindakan, fondasi, hubungan, atau kontribusi lebih mudah terasa dalam keputusan nyata. Ini menunjukkan penekanan struktural, bukan janji tentang keberhasilan atau visibilitas.`,
  } : null;

  const midheaven = result.midheaven ? {
    id: "midheaven", title: "Midheaven Placement", value: `${result.midheaven.sign}${result.midheaven.wholeSignHouse ? ` · House ${result.midheaven.wholeSignHouse}` : ""}`,
    narrative: `Arah kontribusi publikmu membawa kualitas yang ${tone(result.midheaven.sign)}. Letaknya dibaca pada rumah yang benar-benar memuat tanda Midheaven, tanpa memaksanya masuk ke House 10. Kematangan tumbuh ketika tanggung jawab dan visibilitas tetap terhubung dengan nilai yang ingin kamu bangun.`,
  } : null;

  const relationshipThemes = house7
    ? `Dalam hubungan, kamu membutuhkan ruang yang ${tone(house7.sign)} agar kedekatan tetap terasa hidup dan setara. ${venus ? `Cara memberi serta menerima kasih bergerak dengan ritme yang ${tone(venus.sign)}.` : "Cara memberi dan menerima kasih tetap perlu dibaca dari pengalaman yang tersedia."} ${mars && moon ? "Dorongan, batas, dan kebutuhan emosional menjadi lebih matang ketika dibicarakan sebelum berubah menjadi reaksi." : "Kejelasan batas membantu kedekatan berkembang tanpa menebak kebutuhan satu sama lain."}`
    : null;
  const homeThemes = house4
    ? `Di rumah dan kehidupan pribadi, rasa aman bertumbuh melalui suasana yang ${tone(house4.sign)}. ${moon ? `Kebutuhan emosionalmu sendiri membawa ritme yang ${tone(moon.sign)}, sehingga waktu pulih perlu memberi ruang bagi kedua kualitas itu.` : "Fondasi batin memerlukan ritme yang cukup tenang untuk mengenali kebutuhanmu."} Rumah menjadi sumber daya saat perlindungan dan keterbukaan tidak saling meniadakan.`
    : null;
  const workThemes = house10
    ? `Di ruang kerja, kamu cenderung membangun kontribusi dengan cara yang ${tone(house10.sign)}. ${saturn ? `Tanggung jawab berkembang melalui pendekatan yang ${tone(saturn.sign)}, sementara Midheaven memberi arah publik yang tidak harus berada di rumah yang sama.` : "Tanggung jawab tumbuh ketika arah besar diterjemahkan menjadi kebiasaan yang dapat dijaga."} Tidak ada satu profesi yang ditentukan; yang penting adalah keselarasan antara kualitas kerja dan dampak yang ingin dirawat.`
    : null;
  const growthThemes = chartRulerPlacement
    ? `Penguasa bagan berada di House ${chartRulerPlacement.wholeSignHouse}, sehingga pertumbuhan sering kembali pada ${HOUSE_TITLES[chartRulerPlacement.wholeSignHouse || 1].toLowerCase()}. Kualitas ini matang ketika ${tone(chartRulerPlacement.sign)} tidak berhenti sebagai kecenderungan, tetapi menjadi pilihan yang konsisten. Pilih satu tindakan yang mempertemukan kebutuhan pribadi dengan keadaan yang benar-benar sedang kamu jalani.`
    : null;
  const spiritualThemes = house9 && house12
    ? `Cara mencari makna berkembang melalui pengalaman yang ${tone(house9.sign)}, sehingga keyakinan terasa hidup ketika terus diuji oleh wawasan dan pengalaman nyata. ${jupiter && neptune ? `Dorongan memperluas pandangan bergerak dengan cara yang ${tone(jupiter.sign)}, sementara ruang hening dan imajinasimu membutuhkan ritme yang ${tone(neptune.sign)}.` : "Belajar dan keheningan perlu berjalan berdampingan agar pencarian batin tetap memiliki pijakan."} Kedewasaan spiritual tidak diukur dari seberapa tinggi pengalamanmu, melainkan dari kemampuan membawa pemahaman ke sikap yang lebih jujur, lembut, dan bertanggung jawab.`
    : null;
  const soulMissionThemes = sun && northNode && chartRulerPlacement
    ? `Misi jiwa di sini bukan satu takdir yang harus dipenuhi, melainkan arah pertumbuhan yang berulang kali mengajakmu menggunakan daya hidup secara lebih sadar. Identitasmu berkembang melalui ${HOUSE_TITLES[sun.wholeSignHouse || 1].toLowerCase()}, sementara arah baru dilatih lewat ${HOUSE_TITLES[northNode.wholeSignHouse || 1].toLowerCase()}. Penguasa bagan mengingatkan bahwa tujuan menjadi nyata ketika cara yang ${tone(chartRulerPlacement.sign)} diterjemahkan menjadi kontribusi yang dapat dijalani secara konsisten.`
    : null;

  const complete = result.birthDataStatus === "available" && result.ascendant && sun && moon && house1 && house4 && house7 && house10;
  const changedHouses = result.planets.filter((planet) => planet.placidusHouse && planet.wholeSignHouse && planet.placidusHouse !== planet.wholeSignHouse);
  const topEmphasis = result.houseEmphasis[0] || null;
  const secondEmphasis = result.houseEmphasis[1] || null;
  const angularNames = result.angularPlanets.map((planet) => `${planet.planet} di House ${planet.wholeSignHouse}`).join(", ");
  const redistribution = changedHouses.slice(0, 3).map((planet) => `${planet.planet}: House ${planet.placidusHouse} → ${planet.wholeSignHouse}`).join("; ");
  const summary = complete ? [
    `Dengan ${result.ascendant!.sign} sebagai tanda penuh House 1, seluruh susunan rumah bergerak dari cara hadir yang ${tone(result.ascendant!.sign)}. Penguasa chart, ${chartRuler}, berada di House ${chartRulerPlacement?.wholeSignHouse ?? "—"}, sehingga ${domain(chartRulerPlacement?.wholeSignHouse)} menjadi jalur utama tempat pilihan pribadi memperoleh bentuk.`,
    `${sun ? `Sun di House ${sun.wholeSignHouse} menempatkan daya hidup pada ${domain(sun.wholeSignHouse)}` : "Posisi Sun belum tersedia"}, sedangkan ${moon ? `Moon di House ${moon.wholeSignHouse} membuat ${domain(moon.wholeSignHouse)} menjadi pusat pemulihan emosional` : "posisi Moon belum tersedia"}. Kedua rumah ini menunjukkan area kepemilikan pengalaman dalam Whole Sign, bukan pengulangan pembacaan psikologis Natal.`,
    `${topEmphasis ? `Kepadatan utama berada di House ${topEmphasis.houseNumber}, yang memuat ${topEmphasis.planets.join(", ")} dan menekankan ${domain(topEmphasis.houseNumber)}` : "Tidak ada cluster rumah tunggal yang mendominasi"}${secondEmphasis ? `; penekanan kedua di House ${secondEmphasis.houseNumber} menghubungkannya dengan ${domain(secondEmphasis.houseNumber)}` : ""}. ${angularNames ? `Struktur sudut diperkuat oleh ${angularNames}, sehingga tema tersebut lebih mudah muncul sebagai keputusan dan kejadian nyata.` : "Tidak ada planet sudut yang perlu diberi bobot tambahan."}`,
    `${redistribution ? `Dibanding penempatan Placidus, perpindahan rumah yang paling jelas adalah ${redistribution}.` : "Penempatan rumah utama tidak menunjukkan redistribusi yang berarti dari data Placidus yang tersedia."} Perbedaan ini adalah lensa domain hidup: ia mengubah tempat sebuah fungsi dibaca, bukan membatalkan posisi tanda atau sintesis Natal Chart. Arah integrasinya adalah memberi prioritas pada ${domain(chartRulerPlacement?.wholeSignHouse)} sambil tetap merawat ${domain(topEmphasis?.houseNumber)}.`,
  ] : [
    `Bagian tanda yang tersedia tetap dapat membantu mengenali warna dasar cara berpikir, merasa, dan bergerak. Namun susunan rumah belum dapat dibaca dengan aman tanpa waktu lahir, zona waktu, dan lokasi yang terverifikasi. Data yang belum ada tidak diganti dengan asumsi.`,
    `Kamu dapat melengkapi data kelahiran untuk membuka pembacaan tentang area kehidupan, penguasa bagan, dan penekanan rumah. Sampai saat itu, gunakan informasi yang tersedia sebagai cermin terbatas, bukan gambaran utuh. Ketelitian pada data adalah bagian dari menjaga pembacaan tetap jujur.`,
  ];

  const insight = result.ascendant && sun && moon
    ? `Kamu hadir dengan cara yang ${tone(result.ascendant.sign)}, sementara identitas dan kebutuhan emosional berkembang melalui area hidup yang berbeda.`
    : "Waktu lahir, zona waktu, dan lokasi yang tepat diperlukan untuk membuka susunan rumah Whole Sign.";

  return {
    hero: {
      eyebrow: "Whole Sign Birth Chart", title: "Rumah Kehidupan dalam Whole Sign",
      metrics: [
        { label: "Ascendant", value: result.ascendant?.sign || "Belum tersedia" },
        { label: "Sun", value: sun?.wholeSignHouse ? `House ${sun.wholeSignHouse}` : sun?.sign || "Belum tersedia" },
        { label: "Moon", value: moon?.wholeSignHouse ? `House ${moon.wholeSignHouse}` : moon?.sign || "Belum tersedia" },
      ],
      insight,
    },
    identity: [
      { label: "Zodiac", value: "Tropical Zodiac" }, { label: "House System", value: "Whole Sign Houses" },
      { label: "Ascendant", value: result.ascendant?.sign || "Belum tersedia" }, { label: "Midheaven", value: result.midheaven?.sign || "Belum tersedia" },
    ],
    ascendant, sun: sunCard, moon: moonCard, planets: otherPlanets,
    houses: result.houses.map(houseCard), houseEmphasis: emphasisCards, angularPlanets, midheaven,
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
      action: "Lihat detail selengkapnya",
      href: "/blueprint/whole-sign",
    },
    sourceVersion: result.sourceVersion,
    sourceClassification: result.sourceClassification,
  };
}
