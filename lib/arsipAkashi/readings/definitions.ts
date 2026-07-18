import type { ArsipAkashiSectionId } from "../contracts";
import { ARSIP_AKASHI_SOURCE_LEDGER } from "../sourceLedger";
import type { CanonicalSystemId } from "../types";

export interface ArsipAkashiReadingDef {
  roomId: ArsipAkashiSectionId;
  roomTitle: string;
  readingId: string;
  title: string;
  order: number;
  allowedDomains: string[];
  primarySourceDomains: string[];
  supportingSourceDomains: string[];
  allowedSystems: CanonicalSystemId[];
  preferredSystems: CanonicalSystemId[];
  forbiddenSystemUsage: CanonicalSystemId[];
  minimumCrossSystemSupport: number;
  timingEligibility: boolean;
  locationEligibility: boolean;
  symbolicEligibility: boolean;
  bodySafetyClassification: "general" | "non-clinical" | "symbolic";
  provenanceRequirement: "required" | "preferred";
}

const SECTIONS: Array<{ roomId: ArsipAkashiSectionId; title: string; readings: Array<{ title: string; readingId: string; domains: string[] }> }> = [
  {
    roomId: "soul-identity",
    title: "SIAPA DIRIMU",
    readings: [
      { title: "Arketipe Utama", readingId: "arketipe-utama", domains: ["identity", "spirituality"] },
      { title: "Cara Berpikir & Memaknai Kehidupan", readingId: "cara-berpikir-memaknai", domains: ["identity", "spirituality"] },
      { title: "Nilai & Kebutuhan Batin", readingId: "nilai-kebutuhan-batin", domains: ["identity", "relationships"] },
      { title: "Cara Hadir di Dunia", readingId: "cara-hadir-di-dunia", domains: ["identity", "growth"] },
    ],
  },
  {
    roomId: "energy-mechanics",
    title: "ENERGI & MEKANIKA",
    readings: [
      { title: "Ritme Energi Alami", readingId: "ritme-energi-alami", domains: ["mechanics", "identity"] },
      { title: "Cara Mengambil Keputusan", readingId: "cara-mengambil-keputusan", domains: ["mechanics", "identity"] },
      { title: "Pola Respons terhadap Kehidupan", readingId: "pola-respons-kehidupan", domains: ["mechanics", "growth"] },
      { title: "Fokus, Produktivitas & Konsistensi", readingId: "fokus-produktivitas-konsistensi", domains: ["mechanics", "talents"] },
      { title: "Cara Memulihkan Energi", readingId: "cara-memulihkan-energi", domains: ["health", "mechanics"] },
    ],
  },
  {
    roomId: "wounds-shadow-lineage",
    title: "LUKA, BAYANGAN & WARISAN",
    readings: [
      { title: "Luka Inti", readingId: "luka-inti", domains: ["shadow", "karma"] },
      { title: "Mekanisme Perlindungan Diri", readingId: "mekanisme-perlindungan", domains: ["shadow", "identity"] },
      { title: "Pola Self-Sabotage", readingId: "pola-self-sabotage", domains: ["shadow", "karma"] },
      { title: "Ketakutan yang Tersembunyi", readingId: "ketakutan-tersembunyi", domains: ["shadow", "relationships"] },
      { title: "Warisan Keluarga & Leluhur", readingId: "warisan-keluarga-leluhur", domains: ["karma", "shadow"] },
      { title: "Karma dan Pola yang Berulang", readingId: "karma-pola-berulang", domains: ["karma", "growth"] },
      { title: "Arah Penyembuhan & Integrasi", readingId: "arah-penyembuhan-integrasi", domains: ["growth", "shadow"] },
    ],
  },
  {
    roomId: "work-talents",
    title: "KARYA & TALENTA",
    readings: [
      { title: "Talenta Alami", readingId: "talenta-alami", domains: ["talents", "identity"] },
      { title: "Gaya Kerja", readingId: "gaya-kerja", domains: ["talents", "mechanics"] },
      { title: "Arah Karya & Kontribusi", readingId: "arah-karya-kontribusi", domains: ["talents", "growth"] },
      { title: "Ekonomi & Pola Penghasilan", readingId: "ekonomi-pola-penghasilan", domains: ["resources", "growth"] },
      { title: "Money Block", readingId: "money-block", domains: ["resources", "shadow"] },
      { title: "Arah Karier dan Bidang yang Sesuai", readingId: "arah-karier-bidang-sesuai", domains: ["talents", "resources", "growth"] },
      { title: "Kemampuan yang Sudah Dimiliki", readingId: "kemampuan-sudah-dimiliki", domains: ["talents", "identity"] },
      { title: "Kemampuan yang Perlu Dipelajari", readingId: "kemampuan-perlu-dipelajari", domains: ["talents", "growth"] },
    ],
  },
  {
    roomId: "love-relationships",
    title: "CINTA & RELASI",
    readings: [
      { title: "Kebutuhan Emosional dalam Relasi", readingId: "kebutuhan-emosional-relasi", domains: ["relationships", "identity"] },
      { title: "Cara Memberi dan Menerima Cinta", readingId: "memberi-menerima-cinta", domains: ["relationships", "spirituality"] },
      { title: "Pola Ketertarikan & Pilihan Pasangan", readingId: "pola-ketertarikan-pasangan", domains: ["relationships", "shadow"] },
      { title: "Konflik, Komunikasi & Batas Diri", readingId: "konflik-komunikasi-batas", domains: ["relationships", "growth"] },
      { title: "Love Block dan Pola Berulang", readingId: "love-block-pola-berulang", domains: ["relationships", "shadow"] },
      { title: "Arah Relasi yang Lebih Matang", readingId: "arah-relasi-matang", domains: ["relationships", "growth"] },
    ],
  },
  {
    roomId: "body-environment",
    title: "RAGA & RUANG",
    readings: [
      { title: "Peta Chakra", readingId: "peta-chakra", domains: ["health", "spirituality"] },
      { title: "Sistem Cerna", readingId: "sistem-cerna", domains: ["health", "mechanics"] },
      { title: "Lingkungan Ideal", readingId: "lingkungan-ideal", domains: ["health", "location"] },
      { title: "Ritme Tubuh", readingId: "ritme-tubuh", domains: ["health", "timing"] },
      { title: "Energi Dominan", readingId: "energi-dominan", domains: ["health", "spirituality"] },
    ],
  },
  {
    roomId: "spirituality-evolution",
    title: "SPIRITUALITAS & EVOLUSI",
    readings: [
      { title: "Jalur Spiritual", readingId: "jalur-spiritual", domains: ["spirituality", "identity"] },
      { title: "Evolusi Jiwa", readingId: "evolusi-jiwa", domains: ["spirituality", "growth"] },
      { title: "Potensi Spiritual", readingId: "potensi-spiritual", domains: ["spirituality", "talents"] },
      { title: "Bakat Spiritual", readingId: "bakat-spiritual", domains: ["spirituality", "talents"] },
      { title: "Jejak Intuisi", readingId: "jejak-intuisi", domains: ["spirituality", "mechanics"] },
      { title: "Potensi Channeling", readingId: "potensi-channeling", domains: ["spirituality", "karma"] },
    ],
  },
  {
    roomId: "current-life-phase",
    title: "FASE KEHIDUPAN SAAT INI",
    readings: [
      { title: "Peruntungan Semester 1", readingId: "current-life-semester-1", domains: ["timing", "growth", "resources"] },
      { title: "Peruntungan Semester 2", readingId: "current-life-semester-2", domains: ["timing", "growth", "resources"] },
    ],
  },
  {
    roomId: "soul-identity", // Reuse soul-identity for SOUL IDENTITY sub-section
    title: "SOUL IDENTITY",
    readings: [
      { title: "Soul Mission", readingId: "soul-mission", domains: ["karma", "growth"] },
      { title: "Soul Gifts", readingId: "soul-gifts", domains: ["talents", "identity"] },
      { title: "Soul Lessons", readingId: "soul-lessons", domains: ["karma", "shadow"] },
      { title: "Soul Shadow", readingId: "soul-shadow", domains: ["shadow", "karma"] },
    ],
  },
  {
    roomId: "symbolic-origin",
    title: "ASAL USUL & PERADABAN",
    readings: [
      { title: "Resonansi Starseed", readingId: "resonansi-starseed", domains: ["karma", "spirituality"] },
      { title: "Jejak Peradaban Jiwa", readingId: "jejak-peradaban-jiwa", domains: ["spirituality", "karma"] },
    ],
  },
];

export const READING_DEFINITIONS: ArsipAkashiReadingDef[] = [];
export const READING_COUNTS: Record<string, number> = {};

for (const section of SECTIONS) {
  for (const rd of section.readings) {
    READING_DEFINITIONS.push({
      roomId: section.roomId,
      roomTitle: section.title,
      readingId: rd.readingId,
      title: rd.title,
      order: READING_DEFINITIONS.length + 1,
      allowedDomains: rd.domains,
      primarySourceDomains: rd.domains,
      supportingSourceDomains: [],
      allowedSystems: ARSIP_AKASHI_SOURCE_LEDGER[section.roomId]?.eligibleSystems ?? [],
      preferredSystems: ARSIP_AKASHI_SOURCE_LEDGER[section.roomId]?.contributionPriority ?? [],
      forbiddenSystemUsage: [],
      minimumCrossSystemSupport: rd.domains.some((domain) => ["identity", "shadow", "relationships", "spirituality", "karma"].includes(domain)) ? 3 : 2,
      timingEligibility: section.roomId === "current-life-phase",
      locationEligibility: rd.domains.includes("location"),
      symbolicEligibility: section.roomId === "symbolic-origin" || section.roomId === "soul-letters",
      bodySafetyClassification: rd.domains.includes("health") ? "non-clinical" : section.roomId === "symbolic-origin" ? "symbolic" : "general",
      provenanceRequirement: "required",
    });
  }
  READING_COUNTS[section.title] = section.readings.length;
}

export function getRoomReadings(roomId: string): ArsipAkashiReadingDef[] {
  return READING_DEFINITIONS.filter((rd) => rd.roomId === roomId);
}

export function getReadingById(readingId: string): ArsipAkashiReadingDef | undefined {
  return READING_DEFINITIONS.find((rd) => rd.readingId === readingId);
}

export { SECTIONS };
