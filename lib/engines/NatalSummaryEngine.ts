import { 
  ASTRO_PLANET_MEANINGS, 
  ASTRO_SIGN_MEANINGS, 
  ASTRO_HOUSE_MEANINGS, 
  ASTRO_ASPECT_MEANINGS,
  LILITH_SIGN_MEANINGS,
} from "@/lib/data/astrologyDictionaries";

export function generateDeterministicSynthesis(astrology: any): string {
  const planets = astrology?.planets || {};
  const hasCoreData = Boolean(
    astrology &&
    (astrology.sunSign || planets.Sun?.sign) &&
    (astrology.moonSign || planets.Moon?.sign) &&
    (astrology.risingSign || astrology.ascendant),
  );
  if (!hasCoreData) {
    return "Sintesis Blueprint kamu sedang disiapkan. Harap lengkapi data kelahiranmu.";
  }

  // Helper functions
  const safePlanetSign = (planet: string) => {
    if (planet === "Sun") return astrology.sunSign || "Unknown";
    if (planet === "Moon") return astrology.moonSign || "Unknown";
    if (planet === "Ascendant") return astrology.risingSign || astrology.ascendant || "Unknown";
    if (planet === "Midheaven") return astrology.midheaven || "Unknown";
    return astrology.planets?.[planet]?.sign || "Unknown";
  };

  const p1_sun = safePlanetSign("Sun");
  const p1_moon = safePlanetSign("Moon");
  const p1_asc = safePlanetSign("Ascendant");

  const sunMeaning = ASTRO_SIGN_MEANINGS[p1_sun] || "dengan energi yang khas";
  const moonMeaning = ASTRO_SIGN_MEANINGS[p1_moon] || "dengan cara yang spesifik";
  const ascMeaning = ASTRO_SIGN_MEANINGS[p1_asc] || "dengan gaya yang unik";

  const p1 = `Sebagai seseorang dengan Matahari di ${p1_sun}, Bulan di ${p1_moon}, dan Ascendant di ${p1_asc}, kamu memiliki perpaduan identitas yang unik. Matahari memberikan dorongan utama dalam hidupmu ${sunMeaning}, sementara sisi emosional dan kebutuhan batinmu dikelola ${moonMeaning}. Dalam berinteraksi dengan dunia luar, kamu memancarkan kesan pertama dan pendekatan hidup ${ascMeaning}.`;

  const p2_mercury = safePlanetSign("Mercury");
  const p2_venus = safePlanetSign("Venus");
  const p2_mars = safePlanetSign("Mars");

  const p2 = `Dalam hal cara berpikir dan bertindak, Merkurius di ${p2_mercury} memengaruhi pikiranmu untuk memproses informasi ${ASTRO_SIGN_MEANINGS[p2_mercury] || 'dengan gaya tersendiri'}. Dalam cinta dan cara menghargai sesuatu, Venus di ${p2_venus} menunjukkan bahwa kamu mencari keharmonisan ${ASTRO_SIGN_MEANINGS[p2_venus] || 'dengan caramu sendiri'}. Sedangkan dorongan tindakan dan semangat juangmu, yang diwakili oleh Mars di ${p2_mars}, terwujud ${ASTRO_SIGN_MEANINGS[p2_mars] || 'secara spesifik'}.`;

  const p3_nn = astrology.northNode || astrology.planets?.NorthNode?.sign || "Unknown";
  const p3_sn = astrology.southNode || astrology.planets?.SouthNode?.sign || "Unknown";
  const p3_chiron = astrology.chiron || astrology.planets?.Chiron?.sign || "Unknown";

  const p3 = `Jalur evolusi jiwamu ditunjukkan oleh sumbu takdirmu. Kamu dipanggil untuk melangkah keluar dari zona nyaman South Node di ${p3_sn} dan berkembang menuju kualitas pertumbuhan North Node di ${p3_nn}. Bersamaan dengan itu, Chiron di ${p3_chiron} mengindikasikan bahwa perjalanan penyembuhan luka batinmu akan membawa kebijaksanaan yang besar bagi dirimu dan orang lain.`;

  const dominantElement = astrology.elements ? 
    Object.keys(astrology.elements).sort((a, b) => astrology.elements[b] - astrology.elements[a])[0] : 
    "Unknown";

  const p4 = `Secara elemental, kamu sangat dipengaruhi oleh elemen ${dominantElement}. Ini memberikan kekuatan dominan dalam menjalani hidup, namun juga mengisyaratkan perlunya menjaga keseimbangan agar kamu tidak terjebak dalam ekstrem energi tersebut.`;

  const topHouses = astrology.houses ? 
    Object.keys(astrology.houses).slice(0, 3).map(h => parseInt(h.replace('house', ''))) : 
    [];

  let p5 = "";
  if (topHouses.length > 0) {
    const houseThemes = topHouses.map(h => ASTRO_HOUSE_MEANINGS[h]?.title || `Rumah ke-${h}`).join(", ");
    p5 = `Fokus utama energi kosmikmu terkonsentrasi pada area: ${houseThemes}. Di area-area kehidupan inilah kamu akan mengalami banyak pertumbuhan, tantangan, dan pencapaian paling bermakna dalam perjalananmu.`;
  }

  const topAspects = astrology.aspects?.slice(0, 5) || [];
  let p6 = "";
  if (topAspects.length > 0) {
    const aspect = topAspects[0];
    const meaning = ASTRO_ASPECT_MEANINGS[aspect.type] || 'Interaksi ini menciptakan dorongan unik yang mewarnai keputusanmu.';
    const planet1 = aspect.p1 || aspect.planet1;
    const planet2 = aspect.p2 || aspect.planet2;
    if (planet1 && planet2) {
      p6 = `Dinamika terkuat dalam dirimu terlihat dari aspek utama antara ${planet1} dan ${planet2} (${aspect.type}). ${meaning}`;
    }
  }

  const lilith = astrology.lilith;
  const lilithMeaning = lilith?.sign ? LILITH_SIGN_MEANINGS[lilith.sign] : undefined;
  const p7 = lilith && lilithMeaning
    ? `Black Moon Lilith di ${lilith.sign}, House ${lilith.house} menunjukkan ${lilithMeaning.meaning.toLowerCase()} Tema bayangannya adalah ${lilithMeaning.shadowTheme.toLowerCase()} Undangan pertumbuhannya: ${lilithMeaning.growthInvitation}`
    : "";

  return [p1, p2, p3, p4, p5 || p6, p7 || p6].filter(Boolean).slice(0, 6).join("\n\n");
}
