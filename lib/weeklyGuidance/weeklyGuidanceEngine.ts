/**
 * BHUMI AMARTYA V5 — BUILD 118
 * CANONICAL CROSS-SYSTEM WEEKLY SOUL GUIDANCE ENGINE
 *
 * Implements Founder Directive:
 * - Humanized, warm, deeply spiritual Indonesian narrative.
 * - Proportional activation scoring (Kuat / Sedang / Ritme Tenang).
 * - Exact aspect timing only when true zero-crossing occurs, labeled with honest "sekitar".
 * - Distinct 1-sentence executive summary per domain (no triple duplication of advice).
 * - Dynamic weekly phase dynamics based on astronomical peak timing.
 * - Deep canonical cross-system synthesis (Karmic Tail, Love Path 7-10-21, HD Centers/Authority, BaZi, Vedic, Numerology).
 * - Relationship status (single / in_relationship / unspecified) personalization.
 * - Robust legacy Love Path healing comparing directly with canonical blueprint.
 * - Zero psychiatric diagnosis, zero supernatural fearmongering, zero false partner promises, zero infidelity accusations.
 */

import {
  computeWeeklyTimeWindow,
  calculateWeeklyCollectiveSky,
  extractNatalPlacements,
  calculateTransitToNatalAspects,
  resolveSafeTimezone,
  PLANET_LABELS_ID,
  type TransitToNatalAspect,
  type WeeklyCollectiveSky,
  type WeeklyTimeWindow,
} from "./weeklyTransitCalculator";
import { calculateCanonicalDestinyMatrixBlueprint } from "@/lib/engines/destinyMatrixBlueprintAdapter";
import { calculateBhumiMatrix } from "@/lib/engines/calculateBhumiMatrix";
import { resolveDestinyMatrixArcanaAtAge } from "@/lib/destiny-matrix/annualArcana";
import { calculatePersonalYear } from "@/lib/calculations/calculateLifePath";
import { destinyMatrixArcanaDictionary } from "@/lib/data/destinyMatrixArcanaDictionary";
import { lifePathData } from "@/lib/data/numerology";
import type {
  WeeklyGuidance,
  WeeklyGuidanceSection,
  WeeklyAstrologicalEvidence,
  WeeklyCosmicSummary,
  ReadingFoundationEntry,
  RelationshipStatus,
} from "./types";
import type { ArsipAkashiProfileViewModel } from "@/lib/arsipAkashi/profile/viewModel";

export const DOMAIN_DEFINITIONS = [
  {
    key: "kabarMingguIni",
    title: "Kabar Minggu Ini",
    focus: "arah keseluruhan, iklim kosmik, dan vitalitas diri",
    domain: "identity",
    primaryHouses: [1, 10],
    preferredBodies: ["Sun", "Moon", "Ascendant"],
  },
  {
    key: "pikiran",
    title: "Pikiran",
    focus: "pola pikir, cara memilah keputusan, dan komunikasi",
    domain: "thinking",
    primaryHouses: [3, 9],
    preferredBodies: ["Mercury", "Uranus"],
  },
  {
    key: "ekonomi",
    title: "Ekonomi & Rezeki",
    focus: "pekerjaan, pengelolaan uang, dan tanggung jawab materi",
    domain: "economy",
    primaryHouses: [2, 10, 6],
    preferredBodies: ["Venus", "Jupiter", "Saturn"],
  },
  {
    key: "asmara",
    title: "Asmara & Percintaan",
    focus: "kedekatan emosional, kehangatan, dan relasi intim",
    domain: "relationship",
    primaryHouses: [7, 5],
    preferredBodies: ["Venus", "Mars", "Moon"],
  },
  {
    key: "orangTerdekat",
    title: "Orang Terdekat",
    focus: "hubungan keluarga, sahabat, dan batasan sosial yang sehat",
    domain: "social",
    primaryHouses: [4, 11],
    preferredBodies: ["Moon", "Mercury", "Saturn"],
  },
  {
    key: "maknaBatin",
    title: "Makna Batin",
    focus: "keheningan jiwa, evolusi kesadaran, dan ruang doa",
    domain: "spirituality",
    primaryHouses: [12, 9, 8],
    preferredBodies: ["Moon", "Neptune", "Pluto"],
  },
  {
    key: "yangMungkinTerasaBerat",
    title: "Yang Mungkin Terasa Berat",
    focus: "tekanan, titik gesekan batin, dan ruang pemulihan",
    domain: "shadow",
    primaryHouses: [6, 8, 12],
    preferredBodies: ["Saturn", "Pluto", "Chiron", "Mars"],
  },
  {
    key: "ruangYangSedangTerbuka",
    title: "Peluang yang Terbuka",
    focus: "potensi bertumbuh, rahmat kosmik, dan inisiatif baru",
    domain: "growth",
    primaryHouses: [5, 9, 10, 11],
    preferredBodies: ["Jupiter", "Venus", "Sun"],
  },
] as const;

function cleanSentence(text: string): string {
  const clean = text.replace(/\s+/g, " ").replace(/\s+([,.!?])/g, "$1").trim();
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function formatHousePair(tHouse: number, nHouse: number): string {
  if (tHouse === nHouse) return `rumah ke-${tHouse} Placidus`;
  return `rumah ke-${tHouse} dan ke-${nHouse} Placidus`;
}

function getArcanaTitle(num: number): string {
  const entry = destinyMatrixArcanaDictionary[num];
  return entry ? `Arcana ${num} (${entry.name})` : `Arcana ${num}`;
}

export function extractRelationshipStatus(
  inputStatus?: string,
  profile?: Record<string, unknown>
): RelationshipStatus {
  const raw = String(
    inputStatus ||
      (profile?.relationshipStatus as string) ||
      (profile?.statusHubungan as string) ||
      ((profile?.settings as Record<string, unknown>)?.relationshipStatus as string) ||
      ""
  )
    .toLowerCase()
    .trim();

  if (raw === "single" || raw === "lajang" || raw === "sendiri") {
    return "single";
  }
  if (
    raw === "in_relationship" ||
    raw === "berpasangan" ||
    raw === "married" ||
    raw === "menikah" ||
    raw === "dating" ||
    raw === "pacaran" ||
    raw === "relationship"
  ) {
    return "in_relationship";
  }
  return "unspecified";
}

function interpretLovePathArcana(
  loveLine: number[],
  relStatus: RelationshipStatus = "unspecified"
): { summary: string; detail: string } {
  if (loveLine.length !== 3) {
    return {
      summary: "Pola relasimu memanggil kedewasaan emosional dan keseimbangan batin.",
      detail: "Keseimbangan dalam memberi dan menerima",
    };
  }
  const [a1, a2, a3] = loveLine;
  const e1 = destinyMatrixArcanaDictionary[a1];
  const e2 = destinyMatrixArcanaDictionary[a2];
  const e3 = destinyMatrixArcanaDictionary[a3];

  const t1 = e1 ? `${e1.name}` : `Arcana ${a1}`;
  const t2 = e2 ? `${e2.name}` : `Arcana ${a2}`;
  const t3 = e3 ? `${e3.name}` : `Arcana ${a3}`;

  if (a1 === 7 && a2 === 10 && a3 === 21) {
    if (relStatus === "single") {
      return {
        summary: `Garis cinta Destiny Matrix-mu (${t1}, ${t2}, ${t3}) menegaskan arah mandiri tanpa ketergantungan sepihak (${t1}), keluwesan menerima siklus waktu Ilahi tanpa keputusasaan (${t2}), dan kesadaran bahwa jiwamu sudah utuh sebelum memasuki hubungan baru (${t3}). Dalam fase mandiri ini, kamu diajak menyadari pola memilih relasi agar tidak mengulang siklus masa lalu karena rasa sepi.`,
        detail: `Love Path 7–10–21 (${t2})`,
      };
    } else if (relStatus === "in_relationship") {
      return {
        summary: `Garis cinta Destiny Matrix-mu (${t1}, ${t2}, ${t3}) menegaskan navigasi bersama pasangan dengan visi yang selaras (${t1}), ketenangan menerima dinamika naik-turun komitmen (${t2}), dan keterbukaan jiwa menuju keutuhan relasi yang saling membebaskan (${t3}). Bersama pasangan, kalian diajak berdialog jujur mengenai arah jangka panjang.`,
        detail: `Love Path 7–10–21 (${t2})`,
      };
    } else {
      return {
        summary: `Garis cinta Destiny Matrix-mu (${t1}, ${t2}, ${t3}) menggariskan integrasi antara kejelasan arah komitmen (${t1}), penerimaan atas ritme hidup yang dinamis (${t2}), serta keterbukaan jiwa untuk mengasihi tanpa sekat sempit (${t3}).`,
        detail: `Love Path 7–10–21 (${t2})`,
      };
    }
  }

  const pat1 = e1?.relationshipPattern || e1?.coreEssence || "arah bersama";
  const growth2 = e2?.growthDirection || e2?.relationshipPattern || "keseimbangan batin";
  const pat3 = e3?.relationshipPattern || e3?.coreEssence || "keutuhan cinta";

  const contextText =
    relStatus === "single"
      ? `mengarahkanmu dalam fase mandiri ini untuk membangun fondasi diri yang utuh sebelum mengikat janji`
      : relStatus === "in_relationship"
      ? `mengarahkan hubunganmu untuk bertumbuh dalam dialog dewasa yang saling memuliakan`
      : `menggariskan jalur relasi yang bertumbuh seimbang tanpa saling membatasi`;

  const detailDesc = `kombinasi ${t1} (arah: ${pat1.toLowerCase()}), ambang hati ${t2} (kunci: ${growth2.toLowerCase()}), serta ${t3} (tujuan: ${pat3.toLowerCase()}) ${contextText}.`;

  return {
    summary: `Garis cinta pada Destiny Matrix-mu (${t1}, ${t2}, ${t3}) menegaskan bahwa ${detailDesc}`,
    detail: `Love Path: ${loveLine.join("–")} (${t2})`,
  };
}

function interpretKarmicTail(tail: number[]): { summary: string; detail: string } {
  if (tail.length !== 3) {
    return {
      summary: "Pola ekor karmamu memanggil kesadaran untuk melepaskan beban lama.",
      detail: "Transformasi pola bawah sadar",
    };
  }
  const [k1, k2, k3] = tail;
  const e1 = destinyMatrixArcanaDictionary[k1];
  const e2 = destinyMatrixArcanaDictionary[k2];
  const e3 = destinyMatrixArcanaDictionary[k3];
  const n1 = e1 ? e1.name : `Arcana ${k1}`;
  const n2 = e2 ? e2.name : `Arcana ${k2}`;
  const n3 = e3 ? e3.name : `Arcana ${k3}`;

  if (k1 === 21 && k2 === 7 && k3 === 13) {
    return {
      summary: `Ekor Karmamu (Karmic Tail 21–7–13) mengaktifkan pola bawah sadar lama: dorongan kuat untuk mengendalikan arah hidup (${n2}) demi mengamankan rasa utuh (${n1}), yang justru menahan proses pelepasan alami (${n3}). Aspek minggu ini mengundangmu untuk meluruhkan kendali ego; izinkan fase lama bertransformasi tanpa perlawanan batin.`,
      detail: `Ekor Karma 21–7–13: ${n1} – ${n2} – ${n3}`,
    };
  }
  if (k1 === 18 && k2 === 6 && k3 === 15) {
    return {
      summary: `Ekor Karmamu (Karmic Tail 18–6–15) menyoroti pola keraguan diri dan ilusi ketakutan (${n1}) yang memicu keterikatan posesif (${n3}) dalam mencari pengakuan cinta (${n2}). Aspek minggu ini mengundangmu membedah ketakutan tersebut dengan kejujuran batin yang jernih.`,
      detail: `Ekor Karma 18–6–15: ${n1} – ${n2} – ${n3}`,
    };
  }
  if (k1 === 15 && k2 === 20 && k3 === 5) {
    return {
      summary: `Ekor Karmamu (Karmic Tail 15–20–5) menyoroti penyucian dogma keluarga lama (${n2} dan ${n3}) dari godaan manipulasi atau fanatisme (${n1}), mengarahkanmu menuju integritas spiritual yang murni.`,
      detail: `Ekor Karma 15–20–5: ${n1} – ${n2} – ${n3}`,
    };
  }

  const core1 = e1?.shadowSide || e1?.coreEssence || "pola lama";
  const core2 = e2?.shadowSide || e2?.coreEssence || "titik uji";
  const core3 = e3?.growthDirection || e3?.coreEssence || "ruang transformasi";

  return {
    summary: `Ekor Karmamu (Karmic Tail ${tail.join("–")}: ${n1}, ${n2}, ${n3}) menuntun proses shadow work antara ${n1} (akar: ${core1.toLowerCase()}), ambang ${n2} (gesekan: ${core2.toLowerCase()}), serta ${n3} (pelepasan: ${core3.toLowerCase()}). Menghadapi friksi minggu ini bukan dengan memaksakan kehendak, melainkan dengan melatih keikhlasan batin.`,
    detail: `Ekor Karma: ${tail.join("–")} (${n1}–${n2}–${n3})`,
  };
}

export type ExtractedBlueprint = {
  birthDate?: string;
  lifePathNumber?: number;
  lifePathRole?: string;
  expressionNumber?: number;
  soulUrgeNumber?: number;
  personalYear?: number;
  hdType?: string;
  hdAuthority?: string;
  hdProfile?: string;
  hdNotSelf?: string;
  hdSignature?: string;
  hdDefinedCenters: string[];
  hdOpenCenters: string[];
  hdChannels: string[];
  dmCenter?: number;
  dmLoveLine: number[];
  dmMoneyLine: number[];
  dmKarmicTail: number[];
  dmAncestorLine: number[];
  dmTalents: number[];
  dmAnnualArcana?: { age: number; arcana: number };
  baziDayMaster?: { element: string; polarity: string; stemPinyin: string };
  vedicNakshatra?: string;
  vedicNakshatraLord?: string;
  vedicMoonSign?: string;
  wetonName?: string;
  wetonNeptu?: number;
  wetonWuku?: string;
  wetonPancasuda?: string;
  tzolkinKin?: number;
  tzolkinSeal?: string;
  tzolkinTone?: string;
};

export function extractFullCanonicalBlueprint(
  blueprint: Record<string, unknown>,
  profile: Record<string, unknown>,
  referenceDate: Date
): ExtractedBlueprint {
  const inputData = (blueprint.input as Record<string, unknown>) || {};
  const birthDate = String(inputData.birthDate || profile.birthDate || "");

  // Numerology
  const lpObj = (blueprint.lifePath as any) || (blueprint.numerology as any) || {};
  const lifePathNumber = Number(lpObj.number || 0) || undefined;
  const lpInfo = lifePathNumber ? lifePathData[lifePathNumber] : undefined;
  const lifePathRole = lpInfo ? lpInfo.roleId || lpInfo.role : undefined;

  const numObj = (blueprint.numerology as any) || {};
  const expressionNumber = typeof numObj.expression === "number" ? numObj.expression : undefined;
  const soulUrgeNumber = typeof numObj.soulUrge === "number" ? numObj.soulUrge : undefined;

  const personalYear = birthDate
    ? calculatePersonalYear(birthDate, referenceDate.getFullYear())
    : undefined;

  // Human Design
  const hd = (blueprint.humanDesign as Record<string, unknown>) || {};
  const hdType = String(hd.type || "").trim() || undefined;
  const hdAuthority = String(hd.authority || "").trim() || undefined;
  const hdProfile = String(hd.profile || "").trim() || undefined;
  const hdNotSelf = String(hd.notSelfTheme || hd.notSelf || "").trim() || undefined;
  const hdSignature = String(hd.signature || "").trim() || undefined;
  const hdDefinedCenters = Array.isArray(hd.definedCenters) ? hd.definedCenters.map(String) : [];
  const hdOpenCenters = Array.isArray(hd.openCenters) ? hd.openCenters.map(String) : [];
  const hdChannels = Array.isArray(hd.channels) ? hd.channels.map(String) : [];

  // Destiny Matrix
  const dm = (blueprint.destinyMatrix as Record<string, unknown>) || {};
  let dmCenter = Number(dm.center || dm.arcanaCenter || 0) || undefined;
  let dmLoveLine = Array.isArray(dm.loveLine) ? dm.loveLine.map(Number) : [];
  let dmMoneyLine = Array.isArray(dm.moneyLine) ? dm.moneyLine.map(Number) : [];
  let dmKarmicTail = Array.isArray(dm.karmicTail) ? dm.karmicTail.map(Number) : [];
  const dmAncestorLine = Array.isArray(dm.ancestorLine) ? dm.ancestorLine.map(Number) : [];
  const dmTalents = Array.isArray(dm.talentsGreat)
    ? dm.talentsGreat.map(Number)
    : Array.isArray(dm.talents)
    ? dm.talents.map(Number)
    : [];

  // Re-derive canonical lines safely if birthDate is present
  let canonicalMatrix: ReturnType<typeof calculateBhumiMatrix> | null = null;
  if (birthDate) {
    try {
      canonicalMatrix = calculateBhumiMatrix(birthDate);
      const canonicalDM = calculateCanonicalDestinyMatrixBlueprint(birthDate);
      if (canonicalDM) {
        if (!dmCenter && canonicalDM.center) {
          dmCenter = canonicalDM.center;
        }

        // Safe Love Line check: only heal if invalid length or matches legacy prepended-center bug
        const isLegacyLoveLine =
          dmLoveLine.length === 3 &&
          dmCenter !== undefined &&
          dmLoveLine[0] === dmCenter &&
          dmLoveLine[1] !== dmCenter &&
          (canonicalDM.loveLine ? dmLoveLine[0] !== canonicalDM.loveLine[0] : true);

        if (dmLoveLine.length !== 3 || isLegacyLoveLine) {
          if (Array.isArray(canonicalDM.loveLine) && canonicalDM.loveLine.length === 3) {
            dmLoveLine = canonicalDM.loveLine;
          }
        }

        // Safe Money Line check
        const isLegacyMoneyLine =
          dmMoneyLine.length === 3 &&
          dmCenter !== undefined &&
          dmMoneyLine[0] === dmCenter &&
          dmMoneyLine[1] !== dmCenter &&
          (canonicalDM.moneyLine ? dmMoneyLine[0] !== canonicalDM.moneyLine[0] : true);

        if (dmMoneyLine.length !== 3 || isLegacyMoneyLine) {
          if (Array.isArray(canonicalDM.moneyLine) && canonicalDM.moneyLine.length === 3) {
            dmMoneyLine = canonicalDM.moneyLine;
          }
        }

        // Safe Karmic Tail check
        if (dmKarmicTail.length !== 3 && Array.isArray(canonicalDM.karmicTail) && canonicalDM.karmicTail.length === 3) {
          dmKarmicTail = canonicalDM.karmicTail;
        }
      }
    } catch {
      // Preserve existing stored data if canonical calculation fails
    }
  }

  let dmAnnualArcana: { age: number; arcana: number } | undefined = undefined;
  if (birthDate) {
    const [by, bm, bd] = birthDate.split("-").map(Number);
    if (by) {
      let age = referenceDate.getFullYear() - by;
      const curM = referenceDate.getMonth() + 1;
      const curD = referenceDate.getDate();
      if (curM < bm || (curM === bm && curD < bd)) age -= 1;
      if (age >= 0) {
        let canonicalArc: number | null = null;
        if (canonicalMatrix && age <= 79) {
          canonicalArc = resolveDestinyMatrixArcanaAtAge(canonicalMatrix, age);
        }
        if (canonicalArc !== null && canonicalArc !== undefined) {
          dmAnnualArcana = { age, arcana: canonicalArc };
        } else if (age <= 85) {
          const baseCenter = dmCenter || 10;
          const annualArc = ((baseCenter + age) % 22) || 22;
          dmAnnualArcana = { age, arcana: annualArc };
        }
      }
    }
  }

  // BaZi
  const bazi = (blueprint.bazi as Record<string, unknown>) || {};
  const dmRaw = (bazi.dayMaster as Record<string, unknown>) || {};
  const baziDayMaster = dmRaw.element
    ? {
        element: String(dmRaw.element),
        polarity: String(dmRaw.polarity || ""),
        stemPinyin: String(dmRaw.stemPinyin || ""),
      }
    : undefined;

  // Vedic
  const vedic = (blueprint.vedic as Record<string, unknown>) || {};
  const nakObj = (vedic.nakshatra as Record<string, unknown>) || {};
  const vedicNakshatra = typeof nakObj.name === "string" ? nakObj.name : undefined;
  const vedicNakshatraLord = typeof vedic.nakshatraLord === "string" ? vedic.nakshatraLord : undefined;
  const moonSignObj = (vedic.moonSign as any);
  const vedicMoonSign = typeof moonSignObj === "string" ? moonSignObj : typeof moonSignObj?.sign === "string" ? moonSignObj.sign : undefined;

  // Weton
  const weton = (blueprint.weton as Record<string, unknown>) || {};
  const wetonName = typeof weton.weton === "string" ? weton.weton : undefined;
  const wetonNeptu = typeof weton.totalNeptu === "number" ? weton.totalNeptu : undefined;
  const wukuObj = (weton.wuku as Record<string, unknown>) || {};
  const wetonWuku = typeof wukuObj.name === "string" ? wukuObj.name : undefined;
  const pancasudaObj = (weton.pancasuda as Record<string, unknown>) || {};
  const wetonPancasuda = typeof pancasudaObj.name === "string" ? pancasudaObj.name : undefined;

  // Tzolkin
  const tzolkin = (blueprint.tzolkin as Record<string, unknown>) || {};
  const tzolkinKin = typeof tzolkin.kin === "number" ? tzolkin.kin : undefined;
  const sealObj = (tzolkin.solarSeal as Record<string, unknown>) || {};
  const tzolkinSeal = typeof sealObj.name === "string" ? sealObj.name : undefined;
  const toneObj = (tzolkin.galacticTone as Record<string, unknown>) || {};
  const tzolkinTone = typeof toneObj.name === "string" ? toneObj.name : undefined;

  return {
    birthDate,
    lifePathNumber,
    lifePathRole,
    expressionNumber,
    soulUrgeNumber,
    personalYear,
    hdType,
    hdAuthority,
    hdProfile,
    hdNotSelf,
    hdSignature,
    hdDefinedCenters,
    hdOpenCenters,
    hdChannels,
    dmCenter,
    dmLoveLine,
    dmMoneyLine,
    dmKarmicTail,
    dmAncestorLine,
    dmTalents,
    dmAnnualArcana,
    baziDayMaster,
    vedicNakshatra,
    vedicNakshatraLord,
    vedicMoonSign,
    wetonName,
    wetonNeptu,
    wetonWuku,
    wetonPancasuda,
    tzolkinKin,
    tzolkinSeal,
    tzolkinTone,
  };
}

export function scoreAspectForDomain(
  asp: TransitToNatalAspect,
  def: (typeof DOMAIN_DEFINITIONS)[number]
): number {
  let score = 0;
  const primaryHouses = def.primaryHouses as readonly number[];
  const preferredBodies = def.preferredBodies as readonly string[];

  // 1. House Relevance (Core Astrological Foundation)
  const tInPrimary = primaryHouses.includes(asp.transitHouse);
  const nInPrimary = primaryHouses.includes(asp.natalPlacement.house);
  if (tInPrimary && nInPrimary) score += 14;
  else if (tInPrimary) score += 9;
  else if (nInPrimary) score += 8;

  // 2. Planet Relevance
  const tPreferred = preferredBodies.includes(asp.transitBody);
  const nPreferred = preferredBodies.includes(asp.natalPlacement.name);
  if (tPreferred && nPreferred) score += 8;
  else if (tPreferred || nPreferred) score += 5;

  // 3. Aspect Tightness & True Exact Peak
  if (asp.nature === "exact" || asp.exactTimeFormatted) score += 7;
  else if (asp.orb <= 1.5) score += 5;
  else if (asp.orb <= 3.0) score += 3;
  else if (asp.orb <= 4.5) score += 1;

  // 4. Luminary / Ascendant Importance
  if (
    asp.natalPlacement.name === "Sun" ||
    asp.natalPlacement.name === "Moon" ||
    asp.natalPlacement.name === "Ascendant"
  ) {
    score += 3;
  }

  return score;
}

function buildDynamicPhases(
  matchedAspect: TransitToNatalAspect | undefined,
  def: (typeof DOMAIN_DEFINITIONS)[number],
  timezone: string
): { awalPekan: string[]; tengahPekan: string[]; akhirPekan: string[] } {
  if (!matchedAspect) {
    return {
      awalPekan: [
        cleanSentence(
          `Di awal pekan, ritme di bidang ${def.focus} berjalan tenang dan stabil tanpa intervensi kosmik yang mendesak.`
        ),
      ],
      tengahPekan: [
        cleanSentence(
          `Di pertengahan pekan, rawat konsistensi rutinitas yang sudah terbukti baik dengan ketenteraman batin.`
        ),
      ],
      akhirPekan: [
        cleanSentence(
          `Menjelang akhir pekan, jadikan ketenangan ini sebagai anugerah ruang napas untuk menyegarkan energimu.`
        ),
      ],
    };
  }

  const pName = PLANET_LABELS_ID[matchedAspect.transitBody] || matchedAspect.transitBody;
  const aspLabel = matchedAspect.aspectLabel;

  if (matchedAspect.exactDate) {
    const dtExact = matchedAspect.exactDate;
    const dayOfWeek = (dtExact.getUTCDay() + 6) % 7 + 1; // 1 = Monday ... 7 = Sunday
    const timeFormatted = matchedAspect.exactTimeFormatted || "pekan ini";

    if (dayOfWeek <= 2) {
      return {
        awalPekan: [
          cleanSentence(
            `Puncak kontak ${aspLabel} antara ${pName} dan ${matchedAspect.natalPlacement.label} natal terjadi di awal pekan (${timeFormatted}); intensitas tema ini terasa paling jelas sejak hari-hari pertama.`
          ),
        ],
        tengahPekan: [
          cleanSentence(
            `Memasuki pertengahan pekan, suasana mulai mengendap setelah melewati puncak eksak; gunakan momen ini untuk memproses pemahaman baru tanpa reaktivitas.`
          ),
        ],
        akhirPekan: [
          cleanSentence(
            `Menjelang akhir pekan, pengaruh aspek melandai secara alami, memberi ruang bagi integrasi batin yang matang dan stabil.`
          ),
        ],
      };
    } else if (dayOfWeek <= 4) {
      return {
        awalPekan: [
          cleanSentence(
            `Di awal pekan, dinamika ${def.title.toLowerCase()} mulai berangsur menguat sebagai masa penyesuaian batin.`
          ),
        ],
        tengahPekan: [
          cleanSentence(
            `Kontak ${aspLabel} mencapai puncaknya di pertengahan pekan (${timeFormatted}); jadikan hari-hari ini sebagai titik balik kesadaran untuk mengambil sikap yang bijaksana.`
          ),
        ],
        akhirPekan: [
          cleanSentence(
            `Menjelang akhir pekan, ketegangan berangsur mencair; evaluasi apa yang telah kamu pelajari dengan rasa syukur yang mendalam.`
          ),
        ],
      };
    } else {
      return {
        awalPekan: [
          cleanSentence(
            `Hari-hari pertama pekan ini berjalan relatif bertahap dengan riak-riak kecil yang mulai terasa di latar belakang.`
          ),
        ],
        tengahPekan: [
          cleanSentence(
            `Di pertengahan pekan, energi bergerak semakin dekat ke titik puncaknya; jaga ketenangan batin sebelum dinamika menguat.`
          ),
        ],
        akhirPekan: [
          cleanSentence(
            `Aspek mencapai puncak eksak menjelang akhir pekan (${timeFormatted}); luangkan waktu ekstra untuk menenangkan diri dan hindari keputusan impulsif.`
          ),
        ],
      };
    }
  }

  if (matchedAspect.nature === "separating") {
    return {
      awalPekan: [
        cleanSentence(
          `Di awal pekan, sisa pengaruh kontak ${aspLabel} masih terasa membekas dari dinamika sebelumnya.`
        ),
      ],
      tengahPekan: [
        cleanSentence(
          `Memasuki pertengahan pekan, aspek ini sedang bergerak menjauh (orb ${matchedAspect.orb.toFixed(1)}°); intensitasnya melandai dan ritme harian terasa lebih longgar.`
        ),
      ],
      akhirPekan: [
        cleanSentence(
          `Menjelang akhir pekan, tema ini sepenuhnya bergeser ke fase pemulihan energi dan penataan ruang batin yang damai.`
        ),
      ],
    };
  }

  return {
    awalPekan: [
      cleanSentence(
        `Di awal pekan, pengaruh kontak ${aspLabel} masih berada di lapisan halus dan belum menuntut respons mendesak.`
      ),
    ],
    tengahPekan: [
      cleanSentence(
        `Di pertengahan pekan, tarikan energinya mulai terasa lebih nyata dalam pertimbangan harianmu seiring aspek yang kian mendekat.`
      ),
    ],
    akhirPekan: [
      cleanSentence(
        `Menjelang penutupan pekan, kesadaranmu semakin terpusat pada tema ini; ambil sikap yang tenang dan hindari ketergesaan.`
      ),
    ],
  };
}

function synthesizeDomainInterpretation(
  def: (typeof DOMAIN_DEFINITIONS)[number],
  matchedAspect: TransitToNatalAspect | undefined,
  collective: WeeklyCollectiveSky,
  cb: ExtractedBlueprint,
  relStatus: RelationshipStatus = "unspecified",
  relevanceScore: number = 0,
  timezone: string = "Asia/Jakarta"
): {
  evidence: WeeklyAstrologicalEvidence;
  summary: string;
  intensity: "high" | "medium" | "subtle";
  astrologicalMeaning: string;
  spiritualMeaning: string;
  blueprintContribution: string;
  crossSystemSynthesis: string;
  readingFoundations: ReadingFoundationEntry[];
  advice: string[];
  phases: { awalPekan: string[]; tengahPekan: string[]; akhirPekan: string[] };
} {
  const foundations: ReadingFoundationEntry[] = [];

  if (matchedAspect && relevanceScore >= 12) {
    const tBodyName = PLANET_LABELS_ID[matchedAspect.transitBody] || matchedAspect.transitBody;
    const nBodyName = matchedAspect.natalPlacement.label;
    const tHouse = matchedAspect.transitHouse;
    const nHouse = matchedAspect.natalPlacement.house;
    const aspectName = matchedAspect.aspectLabel;
    const phaseLabel =
      matchedAspect.nature === "exact"
        ? "Eksak"
        : matchedAspect.nature === "applying"
        ? "Mendekat"
        : "Menjauh";

    const intensity: "high" | "medium" | "subtle" =
      relevanceScore >= 22 && matchedAspect.orb <= 2.2 ? "high" : "medium";

    const cuspNote = matchedAspect.isCuspCrossing
      ? ` ${matchedAspect.cuspCrossingDetail}.`
      : "";

    const activationSummary = `${tBodyName}${matchedAspect.transitMotion === "retrograde" ? " (Rx)" : ""} di ${matchedAspect.transitDegree}° ${matchedAspect.transitSign} (Rumah ${tHouse} Placidus) membentuk ${aspectName} terhadap ${nBodyName} natal di ${matchedAspect.natalPlacement.degree}° ${matchedAspect.natalPlacement.sign} (Rumah ${nHouse} Placidus) · Orb ${matchedAspect.orb.toFixed(1)}° (${phaseLabel})${matchedAspect.exactTimeFormatted ? ` · Puncak eksak: ${matchedAspect.exactTimeFormatted}` : ""}.${cuspNote}`;

    const evidence: WeeklyAstrologicalEvidence = {
      hasDirectActivation: true,
      transitBody: matchedAspect.transitBody,
      transitLongitude: matchedAspect.transitLongitude,
      transitSign: matchedAspect.transitSign,
      transitDegree: matchedAspect.transitDegree,
      transitMotion: matchedAspect.transitMotion,
      transitPlacidusHouse: tHouse,
      isCuspCrossing: matchedAspect.isCuspCrossing,
      cuspCrossingDetail: matchedAspect.cuspCrossingDetail,
      natalTouchedBody: matchedAspect.natalPlacement.name,
      natalLongitude: matchedAspect.natalPlacement.longitude,
      natalSign: matchedAspect.natalPlacement.sign,
      natalDegree: matchedAspect.natalPlacement.degree,
      natalPlacidusHouse: nHouse,
      aspectType: matchedAspect.aspect,
      aspectLabel: matchedAspect.aspectLabel,
      aspectOrb: matchedAspect.orb,
      aspectPhase: matchedAspect.nature,
      exactTimeFormatted: matchedAspect.exactTimeFormatted,
      activeHouses: [tHouse, nHouse],
      activationSummary,
    };

    foundations.push({
      system: "Western Placidus",
      indicator: `${tBodyName} ${matchedAspect.transitSign} ${matchedAspect.transitDegree}° (R${tHouse}) ${aspectName} ${nBodyName} natal ${matchedAspect.natalPlacement.sign} ${matchedAspect.natalPlacement.degree}° (R${nHouse})`,
      detail: `Orb ${matchedAspect.orb.toFixed(1)}° (${phaseLabel})`,
    });

    const houseContext = formatHousePair(tHouse, nHouse);

    let summary = "";
    let astrologicalMeaning = "";
    let blueprintContribution = "";
    let spiritualMeaning = "";
    let actionAdvice = "";

    switch (def.key) {
      case "kabarMingguIni": {
        summary = "Fokus utama terarah pada penataan energi dan penegasan prioritas hidup yang jernih.";
        astrologicalMeaning = `Fokus kosmik pekan ini mengalir melalui pergerakan ${tBodyName} di ${matchedAspect.transitSign} derajat ${matchedAspect.transitDegree} yang melintasi ${houseContext}. Pembentukan aspek ${aspectName} dengan ${nBodyName} natalmu menghadirkan dinamika nyata antara dorongan memimpin arah hidup dengan kesiapan menjaga stabilitas vitalitas diri.`;

        const parts: string[] = [];
        if (cb.lifePathNumber) {
          parts.push(`Sebagai pemilik Life Path ${cb.lifePathNumber} (${cb.lifePathRole || "Pribadi"}), kamu dipanggil untuk memimpin langkah dengan integritas yang tenang.`);
          foundations.push({ system: "Numerologi", indicator: `Life Path ${cb.lifePathNumber}`, detail: cb.lifePathRole || "Esensi Jiwa" });
        }
        if (cb.hdType) {
          parts.push(`Pola energi ${cb.hdType}${cb.hdAuthority ? ` berotoritas ${cb.hdAuthority}` : ""}${cb.hdProfile ? ` (${cb.hdProfile})` : ""} mengingatkan agar kamu melangkah berdasarkan respons alami tubuh, bukan desakan panik pikiran.`);
          foundations.push({ system: "Human Design", indicator: `${cb.hdType} (${cb.hdProfile || ""})`, detail: `Otoritas: ${cb.hdAuthority || "Standar"}` });
        }
        if (cb.dmCenter) {
          parts.push(`Titik ${getArcanaTitle(cb.dmCenter)} pada pusat Destiny Matrix-mu menjadi kompas pengingat agar tindakanmu tetap berakar pada ketulusan batin.`);
          foundations.push({ system: "Destiny Matrix", indicator: `Pusat Arcana ${cb.dmCenter}`, detail: "Pusat Keseimbangan Batin" });
        }
        blueprintContribution = parts.join(" ");

        spiritualMeaning = `Dalam perjalanan batinmu, keterpaduan antara transit ${tBodyName} dan blueprint energimu bukanlah kebetulan. Ini adalah fase penyelarasan: ketika kamu berhenti memaksakan hasil di luar kendali dan memilih hadir utuh pada setiap keputusan kecil, semesta menopang vitalitasmu dengan cara yang tidak melelahkan.`;
        actionAdvice = `Pilih satu prioritas hidup paling esensial pekan ini, letakkan di urutan pertama, dan delegasikan atau tunda hal-hal sekunder yang menguras energimu.`;
        break;
      }

      case "pikiran": {
        summary = "Pikiran diajak mengendapkan asumsi berlebih dan menjaga kejernihan sebelum bertindak.";
        astrologicalMeaning = `Dinamika berpikir, komunikasi, dan pertimbangan keputusanmu dipicu oleh interaksi ${aspectName} antara ${tBodyName} dan ${nBodyName} natalmu di ${houseContext}. Kejernihan sangat dibutuhkan untuk memisahkan mana fakta objektif dan mana proyeksi kekhawatiran yang belum tentu terjadi.`;

        const parts: string[] = [];
        if (cb.hdOpenCenters.includes("Head") || cb.hdOpenCenters.includes("Ajna")) {
          parts.push(`Pusat ${cb.hdOpenCenters.includes("Ajna") ? "Ajna" : "Kepala"} terbuka di Human Design milikmu menunjukkan bahwa kamu sangat peka menyerap keraguan atau pertanyaan orang lain di sekitarmu.`);
          foundations.push({ system: "Human Design", indicator: "Pusat Ajna/Kepala Terbuka", detail: "Kepekaan menyerap stimulasi ide luar" });
        } else if (cb.hdDefinedCenters.includes("Ajna")) {
          parts.push(`Pusat Ajna terdefinisi di Human Design-mu memberimu ketajaman analisis yang konsisten, namun tantangannya adalah menjaga keluwesan agar tidak terjebak dalam kekakuan opini.`);
          foundations.push({ system: "Human Design", indicator: "Pusat Ajna Terdefinisi", detail: "Ketajaman konseptual terstruktur" });
        }
        if (cb.expressionNumber) {
          parts.push(`Nomor Expression ${cb.expressionNumber} pada numerologimu menuntun agar gaya komunikasimu tetap berbobot dan menghindari perdebatan yang sia-sia.`);
          foundations.push({ system: "Numerologi", indicator: `Expression ${cb.expressionNumber}`, detail: "Pola artikulasi dan kecerdasan praktis" });
        }
        if (cb.baziDayMaster) {
          parts.push(`Karakter ${cb.baziDayMaster.polarity} ${cb.baziDayMaster.element} (${cb.baziDayMaster.stemPinyin}) pada Day Master BaZi-mu mengingatkanmu untuk mengendapkan pertimbangan sebelum menyuarakan keputusan akhir.`);
          foundations.push({ system: "BaZi", indicator: `Day Master: ${cb.baziDayMaster.polarity} ${cb.baziDayMaster.element} (${cb.baziDayMaster.stemPinyin})`, detail: "Akar temperamen kesadaran" });
        }
        blueprintContribution = parts.join(" ");

        spiritualMeaning = `Pikiranmu sedang diajak bertransformasi dari hakim yang reaktif menjadi saksi yang hening. Ketika ada gesekan opini, kebijaksanaan sejati bukanlah memenangkan perdebatan, melainkan menjaga kejernihan batin agar kamu tidak terseret oleh gelombang mental di sekitarmu.`;
        actionAdvice = `Sebelum mengirim pesan penting atau menyetujui kesepakatan, baca ulang dengan kepala dingin dan pastikan intonasimu mencerminkan kebenaran yang tenang.`;
        break;
      }

      case "ekonomi": {
        summary = "Pengelolaan materi memerlukan ketelitian realistis dan etika kerja yang teratur.";
        astrologicalMeaning = `Urusan materi, pekerjaan, dan pengelolaan sumber daya terpapar langsung oleh transit ${tBodyName} yang terhubung dengan ${houseContext}. Ini adalah momen pemeriksaan realistis terhadap bagaimana kamu menghargai waktu, keterampilan, dan kapasitas finansialmu.`;

        const parts: string[] = [];
        if (cb.dmMoneyLine.length > 0) {
          const moneyArcanas = cb.dmMoneyLine.map(getArcanaTitle).join(", ");
          parts.push(`Garis Keuangan pada Destiny Matrix-mu (${moneyArcanas}) menegaskan bahwa kelimpahanmu mengalir bukan melalui spekulasi tergesa-gesa, melainkan dari ketepatan nilai kerja dan etika pelayanan yang lurus.`);
          foundations.push({ system: "Destiny Matrix", indicator: `Money Line: ${cb.dmMoneyLine.join("–")}`, detail: "Pola aliran materi & pintu rezeki" });
        }
        if (cb.dmAnnualArcana) {
          parts.push(`Memasuki usia ${cb.dmAnnualArcana.age} tahun yang dinaungi ${getArcanaTitle(cb.dmAnnualArcana.arcana)}, siklus tahunanmu menuntut disiplin pengelolaan anggaran yang lebih matang.`);
          foundations.push({ system: "Destiny Matrix", indicator: `Arcana Tahunan ${cb.dmAnnualArcana.arcana}`, detail: `Periode Usia ${cb.dmAnnualArcana.age} Tahun` });
        }
        if (cb.hdType) {
          parts.push(`Sebagai ${cb.hdType}, jangan membakar stamina tubuhmu untuk mengejar ekspektasi materi yang tidak membahagiakan jiwamu.`);
          foundations.push({ system: "Human Design", indicator: cb.hdType, detail: "Kapasitas stamina & pertukaran energi materi" });
        }
        if (cb.wetonPancasuda) {
          parts.push(`Naungan Pancasuda ${cb.wetonPancasuda} pada Wetonmu memberi pesan agar setiap pemasukan diimbangi dengan kepedulian berbagi.`);
          foundations.push({ system: "Weton Jawa", indicator: `Pancasuda: ${cb.wetonPancasuda}`, detail: "Karakter rezeki tradisi Nusantara" });
        }
        blueprintContribution = parts.join(" ");

        spiritualMeaning = `Hubunganmu dengan materi adalah cerminan langsung dari caramu menghargai diri di hadapan Sang Pencipta. Rezeki yang berkah tidak pernah menuntutmu mengorbankan martabat batin atau kesehatan tubuh; rawat apa yang ada dengan rasa cukup, maka pintu kecukupan berikutnya akan terbuka.`;
        actionAdvice = `Periksa kembali pengeluaran mingguanmu; rapikan satu kewajiban finansial yang tertunda dan hindari pembelian impulsif yang dipicu oleh rasa lelah sesaat.`;
        break;
      }

      case "asmara": {
        const parts: string[] = [];

        if (cb.dmLoveLine.length > 0) {
          const loveInterp = interpretLovePathArcana(cb.dmLoveLine, relStatus);
          parts.push(loveInterp.summary);
          foundations.push({
            system: "Destiny Matrix",
            indicator: `Love Path: ${cb.dmLoveLine.join("–")}`,
            detail: loveInterp.detail,
          });
        }

        if (cb.dmKarmicTail.length > 0) {
          const ktInterp = interpretKarmicTail(cb.dmKarmicTail);
          parts.push(ktInterp.summary);
          foundations.push({
            system: "Destiny Matrix",
            indicator: `Karmic Tail: ${cb.dmKarmicTail.join("–")}`,
            detail: ktInterp.detail,
          });
        }

        if (cb.dmAnnualArcana && relStatus === "in_relationship") {
          const annArc = getArcanaTitle(cb.dmAnnualArcana.arcana);
          parts.push(`Memasuki usia ${cb.dmAnnualArcana.age} tahun yang dinaungi ${annArc}, dinamika hubunganmu diarahkan menuju kedewasaan komitmen yang lebih matang.`);
          foundations.push({
            system: "Destiny Matrix",
            indicator: `Arcana Tahunan: ${cb.dmAnnualArcana.arcana}`,
            detail: `Siklus usia ${cb.dmAnnualArcana.age} tahun`,
          });
        }

        if (cb.hdAuthority && cb.hdAuthority.toLowerCase().includes("emot")) {
          parts.push(`Otoritas Emosional (Solar Plexus) di Human Design-mu melarangmu mengambil keputusan cinta saat sedang di puncak rasa suka atau dasar kesedihan; tunggulah gelombang rasamu tenang.`);
          foundations.push({ system: "Human Design", indicator: "Otoritas Emosional (Solar Plexus)", detail: "Kejernihan menunggu gelombang emosi stabil" });
        } else if (cb.hdOpenCenters.includes("SolarPlexus")) {
          parts.push(`Pusat Solar Plexus terbuka di Human Design-mu membuatmu sangat peka menyerap suasana hati di sekitarmu; bedakan mana perasaan pribadimu dan mana emosi orang lain yang terserap.`);
          foundations.push({ system: "Human Design", indicator: "Solar Plexus Terbuka", detail: "Empati menyerap gelombang emosi relasi" });
        }

        if (cb.soulUrgeNumber) {
          parts.push(`Kerinduan jiwamu terpaut pada nomor Soul Urge ${cb.soulUrgeNumber}, yang menuntut ketulusan rasa tanpa kepura-puraan.`);
          foundations.push({ system: "Numerologi", indicator: `Soul Urge ${cb.soulUrgeNumber}`, detail: "Kebutuhan terdalam dalam mencintai" });
        }

        if (cb.vedicNakshatra) {
          parts.push(`Naungan bintang ${cb.vedicNakshatra} pada chart Vedic-mu memperdalam kebutuhan akan ruang komunikasi yang saling memuliakan.`);
          foundations.push({ system: "Vedic Jyotish", indicator: `Nakshatra: ${cb.vedicNakshatra}`, detail: "Karakter batiniah dalam ikatan rasa" });
        }
        blueprintContribution = parts.join(" ");

        if (relStatus === "single") {
          summary = "Menyadari pola memilih relasi dan merawat ruang batin mandiri tanpa tergesa mencari kepastian.";
          foundations.push({
            system: "Status Hubungan",
            indicator: "Fase Mandiri / Lajang",
            detail: "Personalisasi kesiapan diri, pola memilih, dan shadow work relasi",
          });
          astrologicalMeaning = `Bagi kamu yang sedang dalam fase mandiri (lajang), kontak ${aspectName} antara ${tBodyName} dan ${nBodyName} natalmu di ${houseContext} menyinari ruang penerimaan diri dan kesiapan batin. Transit ini tidak menuntutmu tergesa mencari pasangan baru, melainkan mengajakmu memeriksa kembali pola ketertarikan, batas emosional, dan luka lama yang masih membekas.`;
          spiritualMeaning = `Masa kesendirian bukanlah kekosongan yang perlu diburu untuk ditutupi, melainkan tempat ziarah batin untuk merawat relasi terdalammu dengan Sang Pencipta dan dirimu sendiri. Ketika kamu menyadari keutuhan jiwamu, kamu tidak lagi memilih pasangan karena takut sepi, melainkan karena kesiapan berbagi cinta yang matang dan merdeka.`;
          actionAdvice = `Luangkan waktu sejenak untuk menuliskan pola relasi masa lalu yang tidak ingin kamu ulang; perjelas standar kasih sayang yang sehat dan rayakan keutuhan dirimu saat ini.`;
        } else if (relStatus === "in_relationship") {
          summary = "Menyelaraskan komunikasi hangat dan merawat keintiman dewasa bersama pasangan.";
          foundations.push({
            system: "Status Hubungan",
            indicator: "Sedang Berpasangan",
            detail: "Personalisasi komunikasi, keintiman, komitmen, dan penyelesaian konflik",
          });
          astrologicalMeaning = `Bagi kamu yang sedang menjalani hubungan berpasangan, kontak ${aspectName} antara ${tBodyName} dan ${nBodyName} natalmu di ${houseContext} menyentuh dinamika keintiman dan komunikasi sehari-hari. Ini adalah momentum untuk menyelaraskan kembali ritme kebersamaan, mendengarkan apa yang tersirat di balik percakapan rutin, dan merawat komitmen tanpa saling menuntut di luar kapasitas.`;
          spiritualMeaning = `Hubungan berpasangan adalah ruang ziarah bersama tempat dua jiwa belajar saling memuliakan di tengah perbedaan sudut pandang. Keintiman yang suci tidak lahir dari keseragaman tanpa cela, melainkan dari keberanian untuk tetap hadir, melembutkan ego saat terjadi gesekan, dan memberi ruang bagi satu sama lain untuk bertumbuh merdeka.`;
          actionAdvice = `Ciptakan satu momen percakapan hangat tanpa gawai pekan ini; dengarkan pasanganmu dengan penuh kehadiran tanpa terburu-buru menyela atau bersikap defensif.`;
        } else {
          summary = "Kejujuran batin menjadi fondasi penting dalam setiap pertukaran kasih sayang.";
          astrologicalMeaning = `Ruang kedekatan, kehangatan relasi, dan kebutuhan emosionalmu tersentuh melalui kontak ${aspectName} antara ${tBodyName} dan ${nBodyName} natalmu di ${houseContext}. Hal ini memantik kejujuran tentang bagaimana kamu mengekspresikan kerentanan hatimu serta menjaga keseimbangan antara memberi dan menerima kasih sayang.`;
          spiritualMeaning = `Relasi intim adalah tempat ziarah batin di mana bayang-bayang masa lalu (*shadow*) dan kerinduan tertinggi saling bertemu. Mengasihi bukanlah berarti membenamkan diri hingga kehilangan batas; cinta yang suci memberi ruang bagi jiwa untuk bertumbuh merdeka berdampingan dengan penuh martabat.`;
          actionAdvice = `Ciptakan satu momen percakapan hangat tanpa gawai pekan ini; dengarkan orang terkasih dengan hati yang lapang tanpa menyela atau menghakimi perasaannya.`;
        }
        break;
      }

      case "orangTerdekat": {
        summary = "Menegakkan batasan sosial yang sehat demi menjaga kedamaian ruang pribadi.";
        astrologicalMeaning = `Interaksi dengan keluarga, lingkaran sahabat, dan relasi sosial harianmu dipengaruhi oleh pergerakan ${tBodyName} yang mengaktifkan ${houseContext}. Ini adalah momentum untuk menegakkan batasan sosial yang sehat tanpa kehilangan rasa hormat dan kasih sayang.`;

        const parts: string[] = [];
        if (cb.hdProfile) {
          parts.push(`Profil Human Design ${cb.hdProfile} milikmu menentukan bagaimana kamu berinteraksi secara sosial: kamu butuh menjaga ruang pribadi agar energimu tidak terdistorsi oleh tuntutan lingkungan.`);
          foundations.push({ system: "Human Design", indicator: `Profil ${cb.hdProfile}`, detail: "Dinamika peran sosial dan penarikan energi" });
        }
        if (cb.dmAncestorLine.length > 0) {
          parts.push(`Garis Leluhur pada Destiny Matrix (${cb.dmAncestorLine.map(getArcanaTitle).join(", ")}) menyoroti perlunya memutus pola kebiasaan keluarga lama yang tidak lagi membangun.`);
          foundations.push({ system: "Destiny Matrix", indicator: `Garis Leluhur: ${cb.dmAncestorLine.join("–")}`, detail: "Program bawah sadar keluarga & warisan leluhur" });
        }
        if (cb.wetonName) {
          parts.push(`Karakter Weton ${cb.wetonName}${cb.wetonNeptu ? ` (Neptu ${cb.wetonNeptu})` : ""} mengingatkanmu untuk tetap menempatkan sopan santun dan tepa salira dalam pergaulan.`);
          foundations.push({ system: "Weton Jawa", indicator: `${cb.wetonName} (Neptu ${cb.wetonNeptu || ""})`, detail: "Harmoni sosial tradisi Nusantara" });
        }
        blueprintContribution = parts.join(" ");

        spiritualMeaning = `Lingkaran terdekatmu adalah ruang pemulihan, bukan panggung tempat kamu harus selalu menyenangkan semua orang. Memilih dengan siapa kamu membagi waktu dan energi adalah tindakan penjagaan jiwa (*spiritual discernment*) yang sangat sah.`;
        actionAdvice = `Beranikan diri mengatakan 'tidak' dengan sopan pada ajakan yang hanya membuang energimu, dan luangkan waktu berkualitas bersama satu sosok yang kehadirannya selalu mendamaikan batinmu.`;
        break;
      }

      case "maknaBatin": {
        summary = "Keheningan jiwa menjadi tempat memulihkan kejernihan dan mendengarkan intuisi terdalam.";
        astrologicalMeaning = `Ruang hening, lintasan spiritual, dan renungan terdalammu tersentuh kuat oleh koneksi ${aspectName} antara ${tBodyName} dan ${nBodyName} natalmu di ${houseContext}. Lapisan intuisi terbuka lebih peka, mengundangmu menyelami arti di balik peristiwa-peristiwa yang sedang kamu lalui.`;

        const parts: string[] = [];
        if (cb.vedicNakshatra) {
          parts.push(`Kelahiranmu di bawah naungan Nakshatra ${cb.vedicNakshatra}${cb.vedicNakshatraLord ? ` (dinaungi planet ${cb.vedicNakshatraLord})` : ""} mempertegas bahwa jiwamu selalu mencari kebenaran hakiki di balik tabir kehidupan materi.`);
          foundations.push({ system: "Vedic Jyotish", indicator: `Nakshatra ${cb.vedicNakshatra}`, detail: `Planet Penguasa: ${cb.vedicNakshatraLord || "Utama"}` });
        }
        if (cb.soulUrgeNumber) {
          parts.push(`Nomor Soul Urge ${cb.soulUrgeNumber} pada numerologimu adalah suara kerinduan batinmu untuk merasakan kedamaian yang melampaui logika dunia.`);
          foundations.push({ system: "Numerologi", indicator: `Soul Urge ${cb.soulUrgeNumber}`, detail: "Kerinduan terdalam jiwa" });
        }
        if (cb.dmCenter) {
          parts.push(`Pusat ${getArcanaTitle(cb.dmCenter)} Destiny Matrix-mu menjadi cermin agar kamu tidak kehilangan lentera kebijaksanaan saat menghadapi masa-masa sunyi.`);
          foundations.push({ system: "Destiny Matrix", indicator: `Pusat Jiwa Arcana ${cb.dmCenter}`, detail: "Pusat kesadaran transendental" });
        }
        if (cb.tzolkinSeal) {
          parts.push(`Segel Surya Tzolkin ${cb.tzolkinSeal}${cb.tzolkinTone ? ` (${cb.tzolkinTone})` : ""} mengalirkan frekuensi pemurnian niat pada setiap doa dan heningmu.`);
          foundations.push({ system: "Mayan Tzolkin", indicator: `${cb.tzolkinSeal} (${cb.tzolkinTone || ""})`, detail: `Kin ${cb.tzolkinKin || ""}` });
        }
        blueprintContribution = parts.join(" ");

        spiritualMeaning = `Transformasi kesadaran tidak lahir dari banyaknya membaca teori, melainkan dari keberanian duduk hening bersama apa adanya dirimu. Saat kamu berhenti menolak ketidakpastian dan berserah pada bimbingan Ilahi, keheningan itu sendiri yang akan menyembuhkan keletihan batinmu.`;
        actionAdvice = `Sediakan 15 menit setiap pagi atau malam untuk duduk hening, berdoa, menulis jurnal batin, atau sekadar bernapas sadar tanpa distraksi gawai.`;
        break;
      }

      case "yangMungkinTerasaBerat": {
        summary = "Mengenali titik keletihan batin dan melepaskan dorongan mengendalikan hal di luar kuasa.";
        astrologicalMeaning = `Titik friksi, rasa berat, atau keletihan batin pekan ini terkonsentrasi pada tegangan ${aspectName} antara ${tBodyName} dan ${nBodyName} natalmu di ${houseContext}. Ini adalah titik di mana pola lama yang kaku sedang diuji agar kamu belajar melepaskan kendali berlebihan.`;

        const parts: string[] = [];
        if (cb.dmKarmicTail.length > 0) {
          const ktInterp = interpretKarmicTail(cb.dmKarmicTail);
          parts.push(ktInterp.summary);
          foundations.push({
            system: "Destiny Matrix",
            indicator: `Karmic Tail: ${cb.dmKarmicTail.join("–")}`,
            detail: ktInterp.detail,
          });
        }
        if (cb.hdNotSelf) {
          parts.push(`Tanda Not-Self di Human Design (${cb.hdNotSelf}) adalah sinyal alarm tubuhmu bahwa kamu sedang memaksakan diri di luar kapasitas alami.`);
          foundations.push({ system: "Human Design", indicator: `Tema Not-Self: ${cb.hdNotSelf}`, detail: "Alarm friksi energi saat melanggar strategi" });
        }
        if (cb.hdOpenCenters.length > 0) {
          const sampleOpen = cb.hdOpenCenters.slice(0, 2).join(" & ");
          parts.push(`Pusat terbuka (${sampleOpen}) membuatmu rentan tertekan oleh ekspektasi lingkungan luar.`);
          foundations.push({ system: "Human Design", indicator: `Pusat Terbuka: ${sampleOpen}`, detail: "Titik kerentanan pengkondisian eksternal" });
        }
        blueprintContribution = parts.join(" ");

        spiritualMeaning = `Rasa berat ini bukanlah hukuman atau kegagalan spiritual, melainkan proses shadow work kudus tempat egomu diajak meluruh. Ketika kamu merasa lelah, tubuhmu bukan sedang menghukummu, melainkan sedang memintamu beristirahat dan melepaskan ilusi bahwa kamu harus mengendalikan segalanya sendirian.`;
        actionAdvice = `Kurangi satu beban agenda yang tidak mendesak pekan ini; tidurlah lebih awal dan izinkan dirimu melambat tanpa rasa bersalah.`;
        break;
      }

      case "ruangYangSedangTerbuka": {
        summary = "Peluang bertumbuh hadir melalui konsistensi langkah kecil yang dijalankan dengan tulus.";
        astrologicalMeaning = `Ruang berkah, kemudahan, dan potensi bertumbuh hadir melalui harmonisasi ${aspectName} antara ${tBodyName} dan ${nBodyName} natalmu di ${houseContext}. Ini adalah celah kesempatan di mana semesta memberi dukungan bagi inisiatif yang kamu jalankan dengan kerendahan hati.`;

        const parts: string[] = [];
        if (cb.dmTalents.length > 0) {
          const talentArcanas = cb.dmTalents.slice(0, 3).map(getArcanaTitle).join(", ");
          parts.push(`Garis Bakat pada Destiny Matrix (${talentArcanas}) menunjukkan potensi alami yang siap kamu manfaatkan untuk memberi dampak baik.`);
          foundations.push({ system: "Destiny Matrix", indicator: `Garis Bakat: ${cb.dmTalents.slice(0, 3).join("–")}`, detail: "Potensi bawaan yang siap dimanifestasikan" });
        }
        if (cb.hdSignature) {
          parts.push(`Ketika kamu bergerak selaras dengan blueprint-mu, semesta akan menghadiahkan ${cb.hdSignature} (kebahagiaan alami) di dalam jiwamu.`);
          foundations.push({ system: "Human Design", indicator: `Signature: ${cb.hdSignature}`, detail: "Kondisi keselarasan batin saat strategi dipatuhi" });
        }
        if (cb.personalYear) {
          parts.push(`Siklus Personal Year ${cb.personalYear} pada numerologimu membuka momentum yang tepat untuk memperluas kebermanfaatanmu.`);
          foundations.push({ system: "Numerologi", indicator: `Personal Year ${cb.personalYear}`, detail: "Siklus tahunan momentum pertumbuhan" });
        }
        if (cb.wetonWuku) {
          parts.push(`Naungan Wuku ${cb.wetonWuku} pada kalender Jawamu membawa berkah ketenangan dalam merintis hal baru.`);
          foundations.push({ system: "Weton Jawa", indicator: `Wuku: ${cb.wetonWuku}`, detail: "Siklus mingguan tradisi Pawukon" });
        }
        blueprintContribution = parts.join(" ");

        spiritualMeaning = `Peluang sejati bukanlah tentang mengejar ambisi materi secara serakah, melainkan tentang kesiapan menjadi saluran berkah bagi sesama. Ketika niatmu lurus dan langkahmu membumi, pintu-pintu kemudahan akan terbuka tanpa perlu kamu dobrak dengan kekerasan ego.`;
        actionAdvice = `Ambil satu langkah nyata untuk mempraktikkan ide atau bakat yang selama ini kamu simpan; mulailah dari hal kecil yang dapat kamu selesaikan sebelum akhir pekan.`;
        break;
      }
    }

    const crossSystemSynthesis = cleanSentence(
      `${astrologicalMeaning} ${blueprintContribution} ${spiritualMeaning}`
    );

    const phases = buildDynamicPhases(matchedAspect, def, timezone);

    return {
      evidence,
      summary: cleanSentence(summary),
      intensity,
      astrologicalMeaning: cleanSentence(astrologicalMeaning),
      spiritualMeaning: cleanSentence(spiritualMeaning),
      blueprintContribution: cleanSentence(blueprintContribution),
      crossSystemSynthesis,
      readingFoundations: foundations,
      advice: [cleanSentence(actionAdvice)],
      phases,
    };
  }

  // CALM RHYTHM (No direct activation on this domain)
  const primaryHousesFormatted = def.primaryHouses.map((h) => `rumah ke-${h}`).join(", ");
  const activationSummary = `Tidak ada transit planet utama yang menekan ${def.focus} secara langsung pekan ini (${primaryHousesFormatted} Placidus dalam ritme stabil).`;

  const evidence: WeeklyAstrologicalEvidence = {
    hasDirectActivation: false,
    activeHouses: def.primaryHouses,
    activationSummary,
  };

  foundations.push({
    system: "Western Placidus",
    indicator: `${primaryHousesFormatted} Placidus`,
    detail: "Ritme stabil tanpa aspek mayor planet transit",
  });

  const parts: string[] = [];
  if (def.key === "asmara" && cb.dmLoveLine.length > 0) {
    const loveInterp = interpretLovePathArcana(cb.dmLoveLine, relStatus);
    parts.push(loveInterp.summary);
    foundations.push({
      system: "Destiny Matrix",
      indicator: `Love Path: ${cb.dmLoveLine.join("–")}`,
      detail: loveInterp.detail,
    });
    if (relStatus !== "unspecified") {
      foundations.push({
        system: "Status Hubungan",
        indicator: relStatus === "single" ? "Fase Mandiri / Lajang" : "Sedang Berpasangan",
        detail: "Personalisasi konteks dinamika asmara",
      });
    }
  } else if (def.key === "yangMungkinTerasaBerat") {
    if (cb.dmKarmicTail.length > 0) {
      const ktInterp = interpretKarmicTail(cb.dmKarmicTail);
      parts.push(ktInterp.summary);
      foundations.push({
        system: "Destiny Matrix",
        indicator: `Karmic Tail: ${cb.dmKarmicTail.join("–")}`,
        detail: ktInterp.detail,
      });
    }
    if (cb.hdNotSelf) {
      parts.push(`Meskipun ritme pekan ini tenang, kenali tanda Not-Self (${cb.hdNotSelf}) agar kamu tidak menciptakan ketegangan sendiri.`);
      foundations.push({ system: "Human Design", indicator: `Tema Not-Self: ${cb.hdNotSelf}`, detail: "Alarm friksi energi" });
    }
  } else if (def.key === "ekonomi") {
    if (cb.dmMoneyLine.length > 0) {
      const moneyArcanas = cb.dmMoneyLine.map(getArcanaTitle).join(", ");
      parts.push(`Garis Keuangan pada Destiny Matrix-mu (${moneyArcanas}) mengingatkan bahwa stabilitas materi bertumbuh dari konsistensi yang tenang.`);
      foundations.push({ system: "Destiny Matrix", indicator: `Money Line: ${cb.dmMoneyLine.join("–")}`, detail: "Pola aliran materi & pintu rezeki" });
    }
  } else if (def.key === "pikiran") {
    if (cb.expressionNumber) {
      parts.push(`Nomor Expression ${cb.expressionNumber} menuntun pikiranmu agar tetap jernih dan terfokus pada hal-hal penting.`);
      foundations.push({ system: "Numerologi", indicator: `Expression ${cb.expressionNumber}`, detail: "Pola artikulasi dan nalar" });
    }
    if (cb.baziDayMaster) {
      parts.push(`Karakter ${cb.baziDayMaster.polarity} ${cb.baziDayMaster.element} pada Day Master BaZi-mu menjaga keseimbangan nalar.`);
      foundations.push({ system: "BaZi", indicator: `Day Master: ${cb.baziDayMaster.element}`, detail: "Temperamen nalar" });
    }
  } else if (def.key === "ruangYangSedangTerbuka") {
    if (cb.dmTalents.length > 0) {
      parts.push(`Garis Bakat (${cb.dmTalents.slice(0, 3).join("–")}) membuka potensi alami untuk kamu kembangkan.`);
      foundations.push({ system: "Destiny Matrix", indicator: `Garis Bakat: ${cb.dmTalents.slice(0, 3).join("–")}`, detail: "Potensi bawaan" });
    }
    if (cb.personalYear) {
      parts.push(`Siklus Personal Year ${cb.personalYear} menaungi langkahmu dengan ketenteraman.`);
      foundations.push({ system: "Numerologi", indicator: `Personal Year ${cb.personalYear}`, detail: "Siklus tahunan" });
    }
  } else if (def.key === "maknaBatin") {
    if (cb.vedicNakshatra) {
      parts.push(`Naungan Nakshatra ${cb.vedicNakshatra} memperdalam keheningan kontemplasimu.`);
      foundations.push({ system: "Vedic Jyotish", indicator: `Nakshatra ${cb.vedicNakshatra}`, detail: "Kedalaman batin" });
    }
  } else if (def.key === "orangTerdekat") {
    if (cb.dmAncestorLine.length > 0) {
      parts.push(`Garis Leluhur (${cb.dmAncestorLine.join("–")}) mengingatkanmu untuk menjaga kedamaian keluarga.`);
      foundations.push({ system: "Destiny Matrix", indicator: `Garis Leluhur: ${cb.dmAncestorLine.join("–")}`, detail: "Harmoni keluarga" });
    }
  }

  if (cb.lifePathNumber) {
    parts.push(`Sebagai pemilik Life Path ${cb.lifePathNumber} (${cb.lifePathRole || "Pribadi"}), kamu diajak merawat stabilitas ini dengan penuh rasa cukup.`);
    foundations.push({ system: "Numerologi", indicator: `Life Path ${cb.lifePathNumber}`, detail: cb.lifePathRole || "Esensi Jiwa" });
  }
  if (cb.hdType) {
    parts.push(`Pola energimu sebagai ${cb.hdType}${cb.hdAuthority ? ` (${cb.hdAuthority})` : ""} dapat beroperasi dengan tenang tanpa intervensi krisis.`);
    foundations.push({ system: "Human Design", indicator: cb.hdType, detail: `Otoritas: ${cb.hdAuthority || "Standar"}` });
  }
  if (cb.dmCenter) {
    parts.push(`Lentera batin dari ${getArcanaTitle(cb.dmCenter)} menjaga kedamaian di area ini agar tetap utuh.`);
    foundations.push({ system: "Destiny Matrix", indicator: `Pusat Arcana ${cb.dmCenter}`, detail: "Jangkar Keseimbangan Jiwa" });
  }
  const blueprintContribution = parts.join(" ");

  const summary = `Ritme di bidang ${def.focus} berjalan stabil tanpa gejolak kosmik yang menuntut tindakan darurat.`;
  const astrologicalMeaning = `Secara astrologis, ${primaryHousesFormatted} milikmu tidak mengalami kontak tegang dari planet transit utama. Hal ini memberikan kebebasan bagi ritme alaminya untuk berjalan stabil tanpa intervensi kosmik yang mendesak.`;
  const spiritualMeaning = `Keheningan kosmik di area ini adalah anugerah ruang napas. Ketika tidak ada krisis atau desakan besar, jiwamu diberi kesempatan untuk merawat apa yang sudah terbangun dengan penuh rasa syukur dan ketenteraman batin.`;
  const actionAdvice = `Pertahankan kebiasaan baik yang sudah berjalan di bidang ini; jaga konsistensi sederhana tanpa perlu membuat perubahan drastis.`;

  const crossSystemSynthesis = cleanSentence(
    `${astrologicalMeaning} ${blueprintContribution} ${spiritualMeaning}`
  );

  const phases = buildDynamicPhases(undefined, def, timezone);

  return {
    evidence,
    summary: cleanSentence(summary),
    intensity: "subtle",
    astrologicalMeaning: cleanSentence(astrologicalMeaning),
    spiritualMeaning: cleanSentence(spiritualMeaning),
    blueprintContribution: cleanSentence(blueprintContribution),
    crossSystemSynthesis,
    readingFoundations: foundations,
    advice: [cleanSentence(actionAdvice)],
    phases,
  };
}

export function buildWeeklyGuidance(input: {
  uid: string;
  profile: Record<string, unknown>;
  blueprint: Record<string, unknown>;
  arsipViewModel: ArsipAkashiProfileViewModel;
  referenceDate?: Date;
  timezone?: string;
  mode?: "current" | "upcoming";
  journey?: Record<string, unknown> | null;
  relationshipStatus?: RelationshipStatus | string;
}): WeeklyGuidance {
  const timezone = input.timezone || String((input.profile && input.profile.timezone) || "Asia/Jakarta");
  const mode = input.mode || "current";
  const refDate = input.referenceDate || new Date();
  const window = computeWeeklyTimeWindow(refDate, timezone, mode);
  const collective = calculateWeeklyCollectiveSky(window);
  const relationshipStatus = extractRelationshipStatus(input.relationshipStatus, input.profile);

  const { placements: natalPlacements, placidusHouses } = extractNatalPlacements(input.blueprint);
  const aspects = calculateTransitToNatalAspects(window, natalPlacements, placidusHouses);

  const arsipAvailable = input.arsipViewModel.status !== "unavailable" && input.arsipViewModel.readings.length > 0;
  const hasNatalData = natalPlacements.length > 0;
  const state = !arsipAvailable ? "unavailable" : hasNatalData ? "ready" : "limited";

  // Extract full Canonical Blueprint cross-system indicators
  const canonicalBlueprint = extractFullCanonicalBlueprint(input.blueprint, input.profile, refDate);

  // Score and map aspects to the 8 domains based on genuine astrological relevance
  const usedAspectIndices = new Set<number>();
  const domainAspectMatches: Array<{
    def: (typeof DOMAIN_DEFINITIONS)[number];
    aspect?: TransitToNatalAspect;
    score: number;
  }> = [];

  for (const def of DOMAIN_DEFINITIONS) {
    let bestIdx = -1;
    let bestScore = 0;

    for (let i = 0; i < aspects.length; i++) {
      if (usedAspectIndices.has(i)) continue;
      const sc = scoreAspectForDomain(aspects[i], def);
      if (sc > bestScore) {
        bestScore = sc;
        bestIdx = i;
      }
    }

    // Minimum relevance threshold: 14 to count as direct activation
    if (bestScore >= 14 && bestIdx >= 0) {
      usedAspectIndices.add(bestIdx);
      domainAspectMatches.push({ def, aspect: aspects[bestIdx], score: bestScore });
    } else {
      domainAspectMatches.push({ def, aspect: undefined, score: bestScore });
    }
  }

  // Synthesize sections
  const sections: WeeklyGuidanceSection[] = domainAspectMatches.map(({ def, aspect, score }) => {
    const interp = synthesizeDomainInterpretation(
      def,
      aspect,
      collective,
      canonicalBlueprint,
      relationshipStatus,
      score,
      timezone
    );

    const paragraphs = [
      interp.crossSystemSynthesis || interp.spiritualMeaning,
      interp.astrologicalMeaning,
      interp.blueprintContribution,
      interp.advice.join(" "),
    ].filter(Boolean);

    return {
      key: def.key,
      title: def.title,
      focus: def.focus,
      domain: def.domain,
      summary: interp.summary,
      intensity: interp.intensity,
      evidence: interp.evidence,
      astrologicalMeaning: interp.astrologicalMeaning,
      spiritualMeaning: interp.spiritualMeaning,
      blueprintContribution: interp.blueprintContribution,
      crossSystemSynthesis: interp.crossSystemSynthesis,
      readingFoundations: interp.readingFoundations,
      advice: interp.advice,
      phases: interp.phases,
      paragraphs,
      sourceDomains: [def.domain, "personal-astrology", "canonical-blueprint"],
      timingEvidence: aspect ? [aspect.summary] : ["calm-rhythm"],
    };
  });

  // Cosmic Summary Card for Dashboard
  const topActiveAspect = aspects[0];
  const mostActivePersonalTransit = topActiveAspect
    ? {
        summary: `${PLANET_LABELS_ID[topActiveAspect.transitBody] || topActiveAspect.transitBody} di ${topActiveAspect.transitDegree}° ${topActiveAspect.transitSign} (R${topActiveAspect.transitHouse} Placidus) membentuk ${topActiveAspect.aspectLabel} ke ${topActiveAspect.natalPlacement.label} natal (${topActiveAspect.natalPlacement.sign} ${topActiveAspect.natalPlacement.degree}°, R${topActiveAspect.natalPlacement.house}) · Orb ${topActiveAspect.orb.toFixed(1)}°`,
        transitBody: topActiveAspect.transitBody,
        transitSign: topActiveAspect.transitSign,
        transitHouse: topActiveAspect.transitHouse,
        natalBody: topActiveAspect.natalPlacement.label,
        natalSign: topActiveAspect.natalPlacement.sign,
        natalHouse: topActiveAspect.natalPlacement.house,
        aspectLabel: topActiveAspect.aspectLabel,
        orb: topActiveAspect.orb,
        phaseLabel:
          topActiveAspect.nature === "exact"
            ? "Eksak"
            : topActiveAspect.nature === "applying"
            ? "Mendekat"
            : "Menjauh",
        exactTimeFormatted: topActiveAspect.exactTimeFormatted,
      }
    : null;

  // 3 Domain Paling Menonjol based on actual relevance score
  const sortedMatches = [...domainAspectMatches].sort((a, b) => b.score - a.score);
  const top3HighlightedDomains = sortedMatches.slice(0, 3).map(({ def }) => {
    const s = sections.find((sec) => sec.key === def.key)!;
    return {
      key: s.key,
      title: s.title,
      headline: s.summary, // distinct executive summary!
      intensity: s.intensity,
    };
  });

  // Main spiritual message: warm, intimate, deep
  const lp = canonicalBlueprint.lifePathNumber;
  const userFocus =
    lp === 9
      ? "merawat kontribusi yang bermakna bagi sesama tanpa memikul beban dunia sendirian"
      : lp === 7
      ? "menemukan kejernihan batin dalam keheningan dan mempercayai intuisimu"
      : lp === 4
      ? "membangun fondasi hidup yang tertata dengan langkah realistis yang tenang"
      : lp === 8
      ? "mengelola daya hidupmu dengan integritas tanpa terjebak ambisi yang melelahkan"
      : lp === 1
      ? "melangkah mandiri dengan keberanian yang berakar pada ketulusan batin"
      : "menjaga keselarasan langkahmu dengan suara batin yang jujur";

  const mainSpiritualMessage = `Pekan ini mengajakmu untuk ${userFocus}. Di tengah perputaran langit dan tuntutan hari-hari, jadikan keheningan batinmu sebagai jangkar penuntun.`;

  const cosmicSummary: WeeklyCosmicSummary = {
    weekKey: window.weekKey,
    weekStart: window.weekStart,
    weekEnd: window.weekEnd,
    dateRangeFormatted: window.dateRangeFormatted,
    collectiveTheme: collective.collectiveTheme,
    lunarPhaseSummary: collective.lunarPhaseSummary,
    planetaryMotionSummary: collective.planetaryMotionSummary,
    keyEvents: collective.keyEventsSummary,
    mostActivePersonalTransit,
    activePlacidusHouses: Array.from(
      new Set(aspects.flatMap((a) => [a.transitHouse, a.natalPlacement.house]))
    ),
    top3HighlightedDomains,
    mainSpiritualMessage,
  };

  const weeklyDirection = {
    title: "Arah Minggu Ini" as const,
    paragraphs: [
      `Memasuki rentang waktu ${window.dateRangeFormatted}, ${collective.collectiveTheme.toLowerCase()}`,
      mostActivePersonalTransit
        ? `Transit paling aktif yang menyentuh petamu adalah ${mostActivePersonalTransit.summary}. Peristiwa ini mengarahkan perhatianmu ke rumah ke-${mostActivePersonalTransit.transitHouse} dan ke-${mostActivePersonalTransit.natalHouse} Placidus.`
        : "Langit minggu ini bergerak dalam harmoni yang tenang tanpa aspek tegang langsung ke penempatan natalmu.",
      mainSpiritualMessage,
    ],
    sourceDomains: ["collective-sky", "personal-transit", "canonical-blueprint"],
  };

  return {
    uid: input.uid,
    weekKey: window.weekKey,
    weekStart: window.weekStart,
    weekEnd: window.weekEnd,
    timezone: window.timezone,
    guidancePeriodMode: mode,
    state,
    relationshipStatus,
    availableSources: hasNatalData ? ["personal-astrology", "canonical-blueprint", "arsip-akashi"] : ["canonical-blueprint"],
    limitedSources: !hasNatalData ? ["personal-astrology"] : [],
    unavailableSources: !arsipAvailable ? ["arsip-akashi"] : [],
    cosmicSummary,
    sections,
    weeklyDirection,
    sourceProvenance: {
      sourceReadingIds: input.arsipViewModel?.readings?.map((r) => r.id) || [],
      sourceDomains: Array.from(new Set(sections.flatMap((s) => s.sourceDomains))),
      contributingSystems: [
        "Destiny Matrix",
        "Human Design",
        "BaZi",
        "Vedic Astrology",
        "Numerology",
        "Western Astrology",
      ],
      timingFactIds: aspects.map((a) => `${a.transitBody}_${a.aspect}_${a.natalPlacement.name}`),
      journeyFactIds: [],
    },
    synthesisFingerprint: `${input.uid}_${window.weekKey}_${state}_${relationshipStatus}`,
  };
}
