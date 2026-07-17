import { CanonicalSoulIdentityDomain } from "../types/canonical";

export type Dimension =
  | "Leadership" | "Structure" | "Knowledge" | "Communication" | "Creativity"
  | "Freedom" | "Courage" | "Sensitivity" | "Care" | "Intuition"
  | "Spirituality" | "Transformation" | "Relationships" | "Community" | "Roots"
  | "Exploration" | "Prosperity" | "Resilience" | "Integrity" | "Nature Connection";

export const DIMENSIONS: Dimension[] = [
  "Leadership", "Structure", "Knowledge", "Communication", "Creativity",
  "Freedom", "Courage", "Sensitivity", "Care", "Intuition",
  "Spirituality", "Transformation", "Relationships", "Community", "Roots",
  "Exploration", "Prosperity", "Resilience", "Integrity", "Nature Connection"
];

export interface Candidate {
  id: string;
  name: string;
  dimensions: Dimension[];
  themes: string;
  shadow: string;
  mission: string;
}

export const COSMIC_CATALOGUE: Candidate[] = [
  { id: "sirius", name: "Sirius", dimensions: ["Structure", "Knowledge", "Integrity", "Care"], themes: "Keteraturan, teknologi spiritual, kedisiplinan batin", shadow: "Kekakuan mental, perfeksionisme berlebih, menutup emosi", mission: "Membangun landasan kokoh bagi kesadaran kolektif" },
  { id: "arcturus", name: "Arcturus", dimensions: ["Intuition", "Sensitivity", "Transformation", "Care"], themes: "Penyembuhan emosional, teknologi mental, transisi jiwa", shadow: "Kecenderungan melarikan diri dari realitas fisik, terlalu analitis", mission: "Menjadi pemandu bagi proses transisi dan regenerasi kesadaran" },
  { id: "vega", name: "Vega", dimensions: ["Creativity", "Freedom", "Exploration", "Communication"], themes: "Ekspresi artistik, kebebasan batin, inovasi ekspresif", shadow: "Ketidakstabilan fokus, menghindari komitmen mendalam", mission: "Menyalurkan inspirasi kosmik ke dalam wujud kreasi nyata" },
  { id: "aldebaran", name: "Aldebaran", dimensions: ["Structure", "Prosperity", "Resilience", "Roots"], themes: "Integritas material, ketahanan fisik, warisan bumi", shadow: "Ketakutan akan kemiskinan, keterikatan berlebih pada stabilitas", mission: "Mewujudkan kemakmuran yang adil melalui ketekunan nyata" },
  { id: "regulus", name: "Regulus", dimensions: ["Leadership", "Courage", "Prosperity", "Integrity"], themes: "Kekuasaan mulia, keberanian moral, kehormatan diri", shadow: "Kesombongan tersembunyi, ketakutan akan kegagalan sosial", mission: "Memimpin dengan keteladaran dan keberanian demi kebaikan bersama" },
  { id: "antares", name: "Antares", dimensions: ["Courage", "Transformation", "Exploration", "Resilience"], themes: "Eksplorasi batas diri, keberanian bertransformasi", shadow: "Kecenderungan destruktif, kemarahan terpendam", mission: "Melampaui krisis batin untuk menemukan kekuatan sejati" },
  { id: "spica", name: "Spica", dimensions: ["Creativity", "Sensitivity", "Relationships", "Nature Connection"], themes: "Keindahan alamiah, harmoni hubungan, kreativitas murni", shadow: "Ketergantungan persetujuan orang lain, menghindari konflik sehat", mission: "Menebar harmoni dan keselarasan estetika di lingkungan sekitar" },
  { id: "polaris", name: "Polaris", dimensions: ["Roots", "Structure", "Integrity", "Intuition"], themes: "Arah hidup, kesetiaan batin, jangkar stabilitas", shadow: "Ketakutan akan ketidakpastian, penolakan terhadap perubahan arah", mission: "Menjadi kompas moral yang stabil di tengah ketidakpastian" },
  { id: "alpha_centauri", name: "Alpha Centauri", dimensions: ["Knowledge", "Community", "Relationships", "Exploration"], themes: "Sains kolaboratif, penjelajahan pikiran, persahabatan kosmik", shadow: "Terlalu mengandalkan logika dingin, mengabaikan kedalaman rasa", mission: "Menjembatani pemikiran visioner dengan aksi nyata komunitas" },
  { id: "pleiades", name: "Pleiades", dimensions: ["Care", "Sensitivity", "Relationships", "Community"], themes: "Cinta kasih universal, kepekaan sosial, penyembuhan komunitas", shadow: "Kecenderungan mengorbankan diri, menghindari batas diri yang sehat", mission: "Mengingatkan manusia akan kekuatan kelembutan dan persatuan" },
  { id: "andromeda", name: "Andromeda", dimensions: ["Freedom", "Exploration", "Creativity", "Communication"], themes: "Kebebasan ekspresi, petualangan batin, ekspansi tanpa batas", shadow: "Kecemasan akan kekangan, sulit menetap pada satu pilihan nyata", mission: "Membuka sekat pembatas pikiran agar manusia dapat bertumbuh bebas" },
  { id: "milky_way", name: "Milky Way", dimensions: ["Community", "Roots", "Care", "Nature Connection"], themes: "Integrasi menyeluruh, pemeliharaan kehidupan batin", shadow: "Beban tanggung jawab kolektif yang berlebih, merasa terasing", mission: "Mengasuh benih kesadaran agar selaras dengan ritme semesta" },
  { id: "galactic_center", name: "Galactic Center", dimensions: ["Spirituality", "Transformation", "Intuition", "Knowledge"], themes: "Kesadaran mutlak, evolusi spiritual, transmisi cahaya batin", shadow: "Krisis eksistensial akut, kebingungan mengaitkan makna bumi", mission: "Menyalurkan kebenaran murni ke dalam tindakan sehari-hari" },
  { id: "orion", name: "Orion", dimensions: ["Courage", "Transformation", "Integrity", "Structure"], themes: "Resolusi konflik batin, kekuatan mental, penyelarasan polaritas", shadow: "Kecenderungan mendominasi, obsesi terhadap kemenangan argumen", mission: "Mengubah konflik pertentangan menjadi kebijaksanaan persatuan" },
  { id: "lyra", name: "Lyra", dimensions: ["Courage", "Leadership", "Freedom", "Creativity"], themes: "Keberanian orisinal, daya cipta tinggi, ekspresi vokal", shadow: "Ketidaksabaran tinggi, dorongan memberontak tanpa tujuan jelas", mission: "Menginisiasi perubahan baru melalui keberanian ekspresi murni" },
  { id: "draco", name: "Draco", dimensions: ["Courage", "Resilience", "Structure", "Transformation"], themes: "Ketahanan primal, integrasi bayang-bayang, proteksi energi", shadow: "Ketakutan kehilangan kontrol, rasa tidak aman yang mendalam", mission: "Menguasai kekuatan batiniah terdalam demi melindungi kehidupan" },
  { id: "cygnus", name: "Cygnus", dimensions: ["Creativity", "Sensitivity", "Spirituality", "Relationships"], themes: "Keanggunan kosmik, kesunyian batin, harmoni kontemplatif", shadow: "Melankolia berlebih, pasrah pasif menghadapi tantangan hidup", mission: "Menghadirkan keheningan damai di tengah hiruk-pikuk dunia" },
  { id: "pegasus", name: "Pegasus", dimensions: ["Freedom", "Exploration", "Creativity", "Communication"], themes: "Pikiran terbang bebas, inspirasi kilat, kelincahan batin", shadow: "Ketidakterikatan yang membuat tidak membumi, abai komitmen", mission: "Membawa keringanan dan kebahagiaan murni ke dalam kenyataan" },
  { id: "cassiopeia", name: "Cassiopeia", dimensions: ["Leadership", "Integrity", "Creativity", "Structure"], themes: "Kewibawaan murni, kemandirian batin, keteguhan prinsip", shadow: "Sikap dingin yang menjaga jarak, sulit menerima masukan orang lain", mission: "Membangun ketertiban spiritual melalui keteladanan yang tenang" }
];

export const CIVILIZATION_CATALOGUE: Candidate[] = [
  { id: "atlantis", name: "Atlantis", dimensions: ["Knowledge", "Structure", "Prosperity", "Integrity"], themes: "Integrasi teknologi dan spiritualitas, hukum alamiah semesta", shadow: "Kesserakahan intelektual, penyalahgunaan pengaruh pribadi", mission: "Menyeimbangkan kehebatan rasio dengan ketulusan batiniah" },
  { id: "lemuria", name: "Lemuria", dimensions: ["Care", "Sensitivity", "Nature Connection", "Community"], themes: "Kepekaan emosional, kehidupan selaras alam, komunikasi hati", shadow: "Kerapuhan menghadapi dunia nyata, penolakan atas realitas kasar", mission: "Menjaga kehangatan kasih murni agar tetap menyala di bumi" },
  { id: "mu", name: "Mu", dimensions: ["Roots", "Nature Connection", "Spirituality", "Community"], themes: "Kearifan leluhur bumi, ketenangan batin, penghormatan tanah", shadow: "Ketakutan akan modernitas, keterikatan kaku pada masa lalu", mission: "Membumikan kebijaksanaan kuno ke dalam keseharian modern" },
  { id: "hyperborea", name: "Hyperborea", dimensions: ["Spirituality", "Knowledge", "Resilience", "Integrity"], themes: "Keheningan meditasi utara, ketahanan jiwa, pencarian cahaya", shadow: "Keterasingan dingin, sikap acuh tak acuh pada dinamika sosial", mission: "Menjaga kemurnian fokus batin di tengah badai duniawi" },
  { id: "agartha", name: "Agartha", dimensions: ["Intuition", "Roots", "Knowledge", "Care"], themes: "Kebijaksanaan batiniah tersembunyi, penjagaan rahasia bumi", shadow: "Ketakutan untuk tampil terbuka, menyembunyikan kebenaran murni", mission: "Menyimpan dan mengalirkan mata air spiritual dari keheningan diri" },
  { id: "shambhala", name: "Shambhala", dimensions: ["Spirituality", "Leadership", "Integrity", "Community"], themes: "Harmoni kepemimpinan batin, perwujudan damai kolektif", shadow: "Tuntutan idealisme perfeksionis yang tidak realistis di bumi", mission: "Menginspirasi persaudaraan tulus berasaskan ketenangan batin" },
  { id: "avalon", name: "Avalon", dimensions: ["Intuition", "Sensitivity", "Nature Connection", "Transformation"], themes: "Siklus alamiah kehidupan, mistisisme kabut, penyembuhan herbal", shadow: "Kehilangan arah dalam ilusi batin, keraguan diri yang mengambang", mission: "Menapaki jembatan penghubung dunia fisik dengan keajaiban batin" },
  { id: "el_dorado", name: "El Dorado", dimensions: ["Prosperity", "Creativity", "Exploration", "Courage"], themes: "Kemakmuran batin yang melimpah, pencarian harta karun jiwa", shadow: "Pengejaran ambisius atas kemilau semu, melupakan nilai batiniah", mission: "Mengubah potensi terpendam menjadi karya mulia bernilai tinggi" },
  { id: "kumari_kandam", name: "Kumari Kandam", dimensions: ["Roots", "Knowledge", "Spirituality", "Resilience"], themes: "Pengetahuan kuno yang tenggelam, ketahanan warisan leluhur", shadow: "Melankolia mendalam atas kehilangan masa lalu, sulit melangkah maju", mission: "Mengangkat kembali mutiara kebijaksanaan kuno ke permukaan" },
  { id: "sundaland", name: "Sundaland", dimensions: ["Roots", "Nature Connection", "Community", "Care"], themes: "Kesuburan tropis spiritual, keterhubungan sosial, keterbukaan hati", shadow: "Ketidaktegasan bersikap, hanyut mengikuti arus kenyamanan sekitar", mission: "Mengasuh ikatan persaudaraan yang rukun dan membumi" },
  { id: "doggerland", name: "Doggerland", dimensions: ["Roots", "Resilience", "Nature Connection", "Community"], themes: "Ketahanan bertahan hidup di masa transisi, adaptasi lanskap", shadow: "Ketakutan akan kepunahan dan perubahan drastis, defensif berlebih", mission: "Membangun jembatan ketahanan diri dalam menghadapi perubahan zaman" },
  { id: "thule", name: "Thule", dimensions: ["Resilience", "Structure", "Integrity", "Exploration"], themes: "Batas terjauh eksplorasi batin, keteguhan prinsip es", shadow: "Kekerasan hati yang ekstrem, ketidakpedulian emosional", mission: "Mencari kebenaran murni hingga batas terjauh kesadaran" }
];

export interface CandidateResonance {
  id: string;
  name: string;
  score: number;
  evidence: string[];
  themes: string;
  shadow: string;
  mission: string;
  dimensions: Dimension[];
}

export interface ResonanceResult {
  cosmic: {
    primary: CandidateResonance;
    supporting: CandidateResonance;
    background: CandidateResonance;
    metadata: {
      catalogueVersion: string;
      engineVersion: string;
      mappingVersion: string;
      sourceFingerprint: string;
    };
  };
  civilization: {
    primary: CandidateResonance;
    supporting: CandidateResonance;
    background: CandidateResonance;
    metadata: {
      catalogueVersion: string;
      engineVersion: string;
      mappingVersion: string;
      sourceFingerprint: string;
    };
  };
}

export class CanonicalResonanceEngine {
  public static readonly CATALOGUE_VERSION = "4.0.0";
  public static readonly MAPPING_VERSION = "4.0.0";
  public static readonly ENGINE_VERSION = "4.0.0";

  public static calculate(soul: CanonicalSoulIdentityDomain): ResonanceResult {
    const systems: { name: string; scores: Partial<Record<Dimension, number>> }[] = [
      { name: "Life Path", scores: this.mapLifePath(soul.mission.lifePath) },
      { name: "Natal", scores: this.mapNatal(soul.archetype.sunSign, soul.archetype.moonSign, soul.archetype.ascendant) },
      { name: "Human Design", scores: this.mapHumanDesign(soul.archetype.humanDesignType, soul.archetype.humanDesignProfile) },
      { name: "Destiny Matrix", scores: this.mapDestinyMatrix(soul.archetype.destinyArcana) },
      { name: "BaZi", scores: this.mapBaZi(soul.archetype.baziDayMaster) },
      { name: "Vedic", scores: this.mapVedic(soul.archetype.vedicNakshatra) },
      { name: "Weton", scores: this.mapWeton(soul.archetype.weton) },
      { name: "Tzolkin", scores: this.mapTzolkin(soul.archetype.tzolkinSeal, soul.archetype.tzolkinTone) }
    ];

    // Compute dimensions aggregate scores and evidence lists
    const dimValues: Record<Dimension, number> = {} as any;
    const dimEvidence: Record<Dimension, string[]> = {} as any;

    for (const d of DIMENSIONS) {
      dimValues[d] = 0;
      dimEvidence[d] = [];
    }

    for (const sys of systems) {
      for (const d of DIMENSIONS) {
        const val = sys.scores[d] || 0;
        if (val > 0) {
          dimValues[d] += val;
          dimEvidence[d].push(sys.name);
        }
      }
    }

    const sourceFingerprint = this.generateFingerprint(soul);

    const cosmic = this.scoreAndSort(COSMIC_CATALOGUE, dimValues, dimEvidence);
    const civ = this.scoreAndSort(CIVILIZATION_CATALOGUE, dimValues, dimEvidence);

    // Filter for candidates having at least 4 systems of evidence AND at least 3 matched dimensions
    const eligibleCosmic = cosmic.filter(c => c.evidence.length >= 4 && c.dimensions.length >= 3);
    const eligibleCiv = civ.filter(c => c.evidence.length >= 4 && c.dimensions.length >= 3);

    // Fallback: If less than 3 eligible candidates, fill up from the remaining candidates sorted by score
    const getTopThree = (eligible: CandidateResonance[], fullSorted: CandidateResonance[]) => {
      const top3 = eligible.slice(0, 3);
      while (top3.length < 3 && fullSorted.length > top3.length) {
        const nextCand = fullSorted.find(c => !top3.some(t => t.id === c.id));
        if (nextCand) {
          top3.push(nextCand);
        } else {
          break;
        }
      }
      return top3;
    };

    const topCosmic = getTopThree(eligibleCosmic, cosmic);
    const topCiv = getTopThree(eligibleCiv, civ);

    const metadata = {
      catalogueVersion: this.CATALOGUE_VERSION,
      engineVersion: this.ENGINE_VERSION,
      mappingVersion: this.MAPPING_VERSION,
      sourceFingerprint
    };

    return {
      cosmic: {
        primary: topCosmic[0],
        supporting: topCosmic[1],
        background: topCosmic[2],
        metadata
      },
      civilization: {
        primary: topCiv[0],
        supporting: topCiv[1],
        background: topCiv[2],
        metadata
      }
    };
  }

  private static scoreAndSort(
    catalogue: Candidate[],
    dimValues: Record<Dimension, number>,
    dimEvidence: Record<Dimension, string[]>
  ): CandidateResonance[] {
    const results: CandidateResonance[] = [];

    for (const cand of catalogue) {
      let totalScore = 0;
      const supportingSystems = new Set<string>();
      const matchedDimensions: Dimension[] = [];

      for (const d of cand.dimensions) {
        const val = dimValues[d] || 0;
        if (val > 0) {
          totalScore += val;
          matchedDimensions.push(d);
          for (const sysName of dimEvidence[d]) {
            supportingSystems.add(sysName);
          }
        }
      }

      const avgScore = totalScore / cand.dimensions.length;
      results.push({
        id: cand.id,
        name: cand.name,
        score: Math.round(avgScore * 100) / 100,
        evidence: Array.from(supportingSystems),
        themes: cand.themes,
        shadow: cand.shadow,
        mission: cand.mission,
        dimensions: matchedDimensions
      });
    }

    // Sort: score descending, then alphabetical name ascending to resolve ties deterministically
    return results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.name.localeCompare(b.name);
    });
  }

  private static generateFingerprint(soul: CanonicalSoulIdentityDomain): string {
    const str = [
      soul.mission?.lifePath || "",
      soul.archetype?.sunSign || "",
      soul.archetype?.moonSign || "",
      soul.archetype?.ascendant || "",
      soul.archetype?.humanDesignType || "",
      soul.archetype?.humanDesignProfile || "",
      soul.archetype?.destinyArcana || "",
      soul.archetype?.baziDayMaster || "",
      soul.archetype?.vedicNakshatra || "",
      soul.archetype?.weton || "",
      soul.archetype?.tzolkinSeal || "",
      soul.archetype?.tzolkinTone || ""
    ].join("|");

    // Simple djb2 hash implementation for fingerprinting
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  // --- Dimension Mapping Methods ---

  private static mapLifePath(lp: number): Partial<Record<Dimension, number>> {
    switch (lp) {
      case 1: return { Leadership: 1.0, Courage: 1.0, Freedom: 0.5, Exploration: 0.5 };
      case 2: return { Sensitivity: 1.0, Care: 1.0, Relationships: 1.0, Intuition: 0.5 };
      case 3: return { Creativity: 1.0, Communication: 1.0, Freedom: 0.5, Community: 0.5 };
      case 4: return { Structure: 1.0, Resilience: 1.0, Integrity: 1.0, Roots: 0.5 };
      case 5: return { Freedom: 1.0, Exploration: 1.0, Communication: 0.5, Creativity: 0.5 };
      case 6: return { Care: 1.0, Relationships: 1.0, Community: 1.0, Integrity: 0.5 };
      case 7: return { Knowledge: 1.0, Intuition: 1.0, Spirituality: 1.0, Integrity: 0.5 };
      case 8: return { Prosperity: 1.0, Leadership: 1.0, Structure: 0.5, Resilience: 0.5 };
      case 9: return { Spirituality: 1.0, Transformation: 1.0, Care: 0.5, Integrity: 0.5 };
      case 11: return { Intuition: 1.0, Spirituality: 1.0, Creativity: 0.5, Sensitivity: 0.5 };
      case 22: return { Structure: 1.0, Leadership: 1.0, Prosperity: 0.5, Roots: 0.5 };
      case 33: return { Care: 1.0, Community: 1.0, Spirituality: 0.5, Creativity: 0.5 };
      default: return {};
    }
  }

  private static mapNatal(sun: string, moon: string, asc: string): Partial<Record<Dimension, number>> {
    const scores: Partial<Record<Dimension, number>> = {};
    const add = (dim: Dimension, val: number) => { scores[dim] = (scores[dim] || 0) + val; };

    const checkSign = (sign: string, weight: number) => {
      if (!sign) return;
      const s = sign.trim();
      if (s === "Aries") { add("Leadership", weight); add("Courage", weight); }
      else if (s === "Taurus") { add("Roots", weight); add("Nature Connection", weight); add("Prosperity", weight * 0.5); }
      else if (s === "Gemini") { add("Communication", weight); add("Knowledge", weight); }
      else if (s === "Cancer") { add("Care", weight); add("Sensitivity", weight); add("Roots", weight * 0.5); }
      else if (s === "Leo") { add("Leadership", weight); add("Creativity", weight); add("Courage", weight * 0.5); }
      else if (s === "Virgo") { add("Structure", weight); add("Integrity", weight); add("Knowledge", weight * 0.5); }
      else if (s === "Libra") { add("Relationships", weight); add("Community", weight); }
      else if (s === "Scorpio") { add("Transformation", weight); add("Intuition", weight); add("Resilience", weight * 0.5); }
      else if (s === "Sagittarius") { add("Exploration", weight); add("Freedom", weight); add("Spirituality", weight * 0.5); }
      else if (s === "Capricorn") { add("Structure", weight); add("Resilience", weight); add("Leadership", weight * 0.5); }
      else if (s === "Aquarius") { add("Community", weight); add("Freedom", weight); }
      else if (s === "Pisces") { add("Spirituality", weight); add("Intuition", weight); add("Sensitivity", weight * 0.5); }
    };

    checkSign(sun, 0.5);
    checkSign(moon, 0.3);
    checkSign(asc, 0.2);

    return scores;
  }

  private static mapHumanDesign(type: string, profile: string): Partial<Record<Dimension, number>> {
    const scores: Partial<Record<Dimension, number>> = {};
    const add = (dim: Dimension, val: number) => { scores[dim] = (scores[dim] || 0) + val; };

    if (type) {
      const t = type.trim();
      if (t === "Manifesting Generator" || t === "Generator") {
        add("Creativity", 0.5); add("Resilience", 0.5);
      } else if (t === "Projector") {
        add("Knowledge", 0.5); add("Care", 0.5);
      } else if (t === "Manifestor") {
        add("Leadership", 0.5); add("Freedom", 0.5);
      } else if (t === "Reflector") {
        add("Sensitivity", 0.5); add("Community", 0.5);
      }
    }

    if (profile) {
      const p = profile.trim();
      if (p.startsWith("5")) add("Leadership", 0.3);
      if (p.endsWith("1")) add("Knowledge", 0.3);
    }

    return scores;
  }

  private static mapDestinyMatrix(center: number): Partial<Record<Dimension, number>> {
    switch (center) {
      case 8: return { Integrity: 1.0, Resilience: 0.5, Structure: 0.5 };
      case 7: return { Courage: 1.0, Leadership: 0.5, Exploration: 0.5 };
      case 17: return { Creativity: 1.0, Spirituality: 0.5, Intuition: 0.5 };
      case 9: return { Knowledge: 1.0, Intuition: 0.5, Spirituality: 0.5 };
      case 15: return { Transformation: 1.0, Prosperity: 0.5, Relationships: 0.5 };
      case 10: return { Freedom: 1.0, Exploration: 0.5, Prosperity: 0.5 };
      default: return {};
    }
  }

  private static mapBaZi(dm: string): Partial<Record<Dimension, number>> {
    if (!dm) return {};
    const d = dm.trim();
    if (d.includes("Wood")) return { "Nature Connection": 1.0, Care: 0.5 };
    if (d.includes("Fire")) return { Creativity: 1.0, Communication: 0.5 };
    if (d.includes("Earth")) return { Roots: 1.0, Resilience: 0.5, Structure: 0.5 };
    if (d.includes("Metal")) return { Integrity: 1.0, Structure: 0.5, Knowledge: 0.5 };
    if (d.includes("Water")) return { Intuition: 1.0, Sensitivity: 0.5, Relationships: 0.5 };
    return {};
  }

  private static mapVedic(nak: string): Partial<Record<Dimension, number>> {
    if (!nak) return {};
    const n = nak.trim();
    if (["Ashwini", "Krittika", "Bharani"].includes(n)) return { Courage: 1.0, Leadership: 0.5 };
    if (["Rohini", "Libra", "Vrishabha"].includes(n)) return { Care: 1.0, Relationships: 0.5 };
    if (["Jesta", "Anuradha"].includes(n)) return { Transformation: 1.0, Resilience: 0.5 };
    if (["Mula"].includes(n)) return { Exploration: 1.0, Freedom: 0.5 };
    return { Knowledge: 0.5 };
  }

  private static mapWeton(weton: string): Partial<Record<Dimension, number>> {
    if (!weton) return {};
    // Calculate neptu based on Day + Pasaran if possible, or fall back to medium neptu
    const w = weton.toLowerCase().trim();
    let neptu = 12; // default
    if (w.includes("sabtu")) neptu += 3;
    if (w.includes("senin")) neptu -= 2;
    if (w.includes("legi")) neptu -= 2;
    if (w.includes("kliwon")) neptu += 2;

    if (neptu >= 15) return { Leadership: 1.0, Prosperity: 0.5, Structure: 0.5 };
    if (neptu >= 10) return { Relationships: 1.0, Community: 0.5, Care: 0.5 };
    return { Intuition: 1.0, Sensitivity: 0.5, Roots: 0.5 };
  }

  private static mapTzolkin(seal: string, tone: string): Partial<Record<Dimension, number>> {
    const scores: Partial<Record<Dimension, number>> = {};
    if (seal) {
      const s = seal.trim().toLowerCase();
      if (s.includes("yellow") || s.includes("ahau")) { scores["Courage"] = 0.5; scores["Leadership"] = 0.5; }
      else if (s.includes("red")) { scores["Roots"] = 0.5; scores["Sensitivity"] = 0.5; }
      else if (s.includes("white")) { scores["Communication"] = 0.5; scores["Freedom"] = 0.5; }
      else if (s.includes("blue")) { scores["Intuition"] = 0.5; scores["Creativity"] = 0.5; }
    }

    if (tone) {
      const t = tone.trim().toLowerCase();
      if (t === "initiating") scores["Exploration"] = 0.5;
      else if (t === "organizing") scores["Structure"] = 0.5;
      else if (t === "refining") scores["Spirituality"] = 0.5;
    }

    return scores;
  }

  public static validate(result: any): boolean {
    if (!result || typeof result !== "object") return false;
    if (!result.cosmic || !result.civilization) return false;

    const validateResonanceGroup = (group: any, isCosmic: boolean) => {
      if (!group || typeof group !== "object") return false;
      const { primary, supporting, background, metadata } = group;
      if (!primary || !supporting || !background || !metadata) return false;

      // Validate metadata
      if (
        metadata.catalogueVersion !== this.CATALOGUE_VERSION ||
        metadata.engineVersion !== this.ENGINE_VERSION ||
        metadata.mappingVersion !== this.MAPPING_VERSION ||
        typeof metadata.sourceFingerprint !== "string" ||
        !metadata.sourceFingerprint
      ) {
        return false;
      }

      // Validate each candidate
      const validIds = isCosmic
        ? COSMIC_CATALOGUE.map(c => c.id)
        : CIVILIZATION_CATALOGUE.map(c => c.id);

      const validateCandidate = (cand: any) => {
        if (!cand || typeof cand !== "object") return false;
        if (!validIds.includes(cand.id)) return false;
        if (typeof cand.score !== "number" || cand.score < 0 || cand.score > 10) return false;
        if (!Array.isArray(cand.evidence) || !cand.evidence.every((e: any) => typeof e === "string")) return false;
        if (!Array.isArray(cand.dimensions) || !cand.dimensions.every((d: any) => typeof d === "string")) return false;
        return true;
      };

      return validateCandidate(primary) && validateCandidate(supporting) && validateCandidate(background);
    };

    return validateResonanceGroup(result.cosmic, true) && validateResonanceGroup(result.civilization, false);
  }
}
