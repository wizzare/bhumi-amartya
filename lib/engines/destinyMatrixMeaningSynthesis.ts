import { destinyMatrixArcanaDictionary, ArcanaDictionaryEntry } from "../data/destinyMatrixArcanaDictionary";

export type DestinyMatrixSection =
  | "godTalent"
  | "personalQualities"
  | "moneyLine"
  | "loveLine"
  | "karmicTail"
  | "fatherKarma"
  | "motherKarma"
  | "fatherTalent"
  | "motherTalent"
  | "ancestorLine"
  | "soulSearching"
  | "socialization"
  | "spiritualKnowledge"
  | "center"
  | "commonEnergy"
  | "talentLine"
  | "general";

/**
 * Parses any string or array representation of arcana numbers (e.g. "5-18-13", "3 · 8 · 5", [5, 18, 13])
 * into clean numeric IDs.
 */
export function parseArcanaNumbers(input: unknown): number[] {
  if (typeof input === "number") return [input];
  if (Array.isArray(input)) {
    return input.map((v) => Number(v)).filter((n) => !isNaN(n) && n > 0);
  }
  if (typeof input === "string") {
    const matches = input.match(/\d+/g);
    if (matches) {
      return matches.map(Number).filter((n) => n > 0 && n <= 22);
    }
  }
  return [];
}

/**
 * Gets dictionary entry for an arcana number (1-22).
 */
export function getArcanaEntry(num: number): ArcanaDictionaryEntry | undefined {
  return destinyMatrixArcanaDictionary[num];
}

/**
 * Synthesizes a section-specific, multi-arcana human-readable interpretation.
 */
export function synthesizeArcanaMeaning(
  rawArcana: unknown,
  section: DestinyMatrixSection
): string {
  const arcanaNums = parseArcanaNumbers(rawArcana);

  if (arcanaNums.length === 0) {
    switch (section) {
      case "godTalent":
        return "Bakat spiritual dan koneksi Ilahi bawaan jiwa.";
      case "personalQualities":
        return "Karakter pribadi dan esensi kepemimpinan diri.";
      case "moneyLine":
        return "Pola energi kelimpahan dan alur rezeki material.";
      case "loveLine":
        return "Dinamika koneksi intim dan keselarasan relasi.";
      case "karmicTail":
        return "Pelajaran jiwa dan memutus rantai karma masa lalu.";
      default:
        return "Potensi bawaan yang menanti untuk diekspresikan.";
    }
  }

  const entries = arcanaNums.map((n) => getArcanaEntry(n)).filter((e): e is ArcanaDictionaryEntry => Boolean(e));

  if (entries.length === 0) {
    return `Kombinasi energi Arcana ${arcanaNums.join("-")}.`;
  }

  const primary = entries[0];
  const secondary = entries[1];
  const tertiary = entries[2];

  switch (section) {
    case "godTalent": {
      if (entries.length === 1) {
        return `Bakat spiritual utama berasal dari ${primary.name} (${primary.coreEssence}), memberikan anugerah ${primary.gift.toLowerCase()}.`;
      }
      if (entries.length === 2 && secondary) {
        return `Koneksi Ilahi menggabungkan daya ${primary.name} (${primary.gift.toLowerCase()}) dengan kepekaan ${secondary.name} (${secondary.coreEssence.toLowerCase()}).`;
      }
      if (tertiary && secondary) {
        return `Bakat spiritual ini memadukan kebajikan ${primary.name} (${primary.coreEssence.toLowerCase()}), kepekaan ${secondary.name} (${secondary.gift.toLowerCase()}), serta potensi transformasi ${tertiary.name} (${tertiary.coreEssence.toLowerCase()}).`;
      }
      return `Bakat spiritual berbasis potensi ${primary.name}: ${primary.gift}.`;
    }

    case "personalQualities": {
      if (entries.length === 1) {
        return `Karakter pribadi didominasi oleh energi ${primary.name}, menekankan ${primary.lightSide.toLowerCase()}.`;
      }
      if (secondary) {
        return `Karakter diri terbentuk dari keselarasan ${primary.name} (${primary.coreEssence.toLowerCase()}) dan ${secondary.name} (${secondary.lightSide.toLowerCase()}).`;
      }
      return `Karakter yang berlandaskan pada ${primary.name} (${primary.coreEssence}).`;
    }

    case "moneyLine": {
      if (entries.length === 1) {
        return `${primary.moneyPattern}. Tantangan utama adalah ${primary.challenge.toLowerCase()}.`;
      }
      if (secondary) {
        return `Kelimpahan finansial bergerak melalui energi ${primary.name} (${primary.moneyPattern.toLowerCase()}) dan diperkuat oleh ${secondary.name} (${secondary.careerPattern.toLowerCase()}).`;
      }
      return `${primary.moneyPattern}.`;
    }

    case "loveLine": {
      if (entries.length === 1) {
        return `${primary.relationshipPattern}.`;
      }
      if (secondary) {
        return `Dinamika relasi membutuhkan ${primary.relationshipPattern.toLowerCase()} serta pemahaman emosional dari ${secondary.name} (${secondary.coreEssence.toLowerCase()}).`;
      }
      return `${primary.relationshipPattern}.`;
    }

    case "karmicTail": {
      if (entries.length === 1) {
        return `Tugas karma masa lalu berkaitan dengan ${primary.name}: ${primary.lifeLesson.toLowerCase()}.`;
      }
      if (secondary) {
        return `Pemberdayaan jiwa terjadi saat menyelesaikan bayangan ${primary.name} (${primary.challenge.toLowerCase()}) dan mengintegrasikan hikmah ${secondary.name} (${secondary.lifeLesson.toLowerCase()}).`;
      }
      return `Pelajaran karma berfokus pada ${primary.lifeLesson}.`;
    }

    case "fatherKarma":
    case "motherKarma":
    case "ancestorLine": {
      return `Garis leluhur membawa warisan energi ${entries.map((e) => e.name).join(" & ")}, memberikan kekuatan ${primary.gift.toLowerCase()} serta ajakan pemulihan ${primary.growthDirection.toLowerCase()}.`;
    }

    case "soulSearching":
    case "socialization":
    case "spiritualKnowledge": {
      return `Fase perkembangan ini dipandu oleh Arcana ${entries.map((e) => `${e.id} (${e.name})`).join(" · ")}, memfasilitasi ${primary.growthDirection.toLowerCase()}.`;
    }

    case "center":
    case "commonEnergy":
    case "talentLine":
    default: {
      const names = entries.map((e) => e.name).join(", ");
      return `Pola energi ${names} yang mendorong ${primary.growthDirection.toLowerCase()}.`;
    }
  }
}
