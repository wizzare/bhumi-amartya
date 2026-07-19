import type { ArsipAkashiInput } from "../types";
import { buildInsightModel, renderSoulLetters, sanitizeNarrative } from "../synthesis";
import { renderReadings } from "../readings/readingEngine";
import { READING_COUNTS } from "../readings/definitions";

export interface ArsipAkashiProfileRoom {
  id: string;
  title: string;
  shortMeaning?: string;
  readingCount: number;
  order: number;
}

export interface ArsipAkashiProfileReading {
  id: string;
  roomId: string;
  roomTitle: string;
  title: string;
  shortMeaning?: string;
  narrative: string;
  deepExplanation: string;
  practicalReflection: string;
  items?: Array<{
    title: string;
    shortMeaning: string;
    deepExplanation: string;
    practicalReflection: string;
    detailSections?: Array<{ title: string; body: string }>;
    score?: number;
    supportingThemes?: string[];
    supportingFactIds?: string[];
    contributingSystems?: string[];
    confidenceBand?: "high" | "medium" | "limited";
    evidenceClass?: string[];
    explanationEligibility?: boolean;
  }>;
  recommendations?: Array<Record<string, unknown>>;
  detailSections?: Array<{ title: string; body: string }>;
  deepNarrativeProvenance?: Array<{
    paragraphIndex: number;
    paragraphPurpose: string;
    selectedFactIds: string[];
    contributingSystems: string[];
    semanticThemes: string[];
    prohibitedOverlap: string[];
    paragraphFingerprint: string;
  }>;
  order: number;
}

export interface ArsipAkashiProfileSoulLetter {
  id: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  deepExplanation: string;
  practicalReflection: string;
  order: number;
}

export interface ArsipAkashiProfileViewModel {
  status: "ready" | "limited" | "unavailable";
  rooms: ArsipAkashiProfileRoom[];
  readings: ArsipAkashiProfileReading[];
  soulLetters: ArsipAkashiProfileSoulLetter[];
  synthesisVersion: string;
  contentVersion: string;
}

const ROOM_ORDER: Record<string, number> = {
  "SIAPA DIRIMU": 1,
  "ENERGI & MEKANIKA": 2,
  "LUKA, BAYANGAN & WARISAN": 3,
  "KARYA & TALENTA": 4,
  "CINTA & RELASI": 5,
  "RAGA & RUANG": 6,
  "SPIRITUALITAS & EVOLUSI": 7,
  "FASE KEHIDUPAN SAAT INI": 8,
  "SOUL IDENTITY": 9,
  "ASAL USUL & PERADABAN": 10,
  "SURAT JIWA": 11,
};

export function buildArsipAkashiProfileViewModel(input: ArsipAkashiInput): ArsipAkashiProfileViewModel {
  const model = buildInsightModel(input);
  const letters = renderSoulLetters(model);

  const rooms: ArsipAkashiProfileRoom[] = [];
  const readings: ArsipAkashiProfileReading[] = [];

  const roomTitles = ["SIAPA DIRIMU","ENERGI & MEKANIKA","LUKA, BAYANGAN & WARISAN","KARYA & TALENTA","CINTA & RELASI","RAGA & RUANG","SPIRITUALITAS & EVOLUSI","FASE KEHIDUPAN SAAT INI","SOUL IDENTITY","ASAL USUL & PERADABAN"];

  for (const title of roomTitles) {
    const order = ROOM_ORDER[title] ?? 99;
    const count = READING_COUNTS[title] ?? 0;
    rooms.push({ id: title, title, readingCount: count, order });
    const rendered = renderReadings(model, title);
    for (const r of rendered) {
      readings.push({
        id: r.id,
        roomId: r.sectionId,
        roomTitle: r.roomTitle,
        title: r.title,
        shortMeaning: r.shortMeaning ? sanitizeNarrative(r.shortMeaning).cleaned : undefined,
        narrative: sanitizeNarrative(r.narrative).cleaned,
        deepExplanation: sanitizeNarrative(r.deepExplanation).cleaned,
        practicalReflection: sanitizeNarrative(r.practicalReflection).cleaned,
        items: r.items,
        recommendations: r.recommendations,
        detailSections: r.detailSections,
        deepNarrativeProvenance: r.deepNarrativeProvenance,
        order: r.order,
      });
    }
  }

  // Surat Jiwa
  const soulLetters = letters.map((l, i) => ({
    id: l.letterId,
    title: l.title,
    subtitle: l.letterId === "letter-to-past-self"
      ? "Untuk bagian dirimu yang pernah berjuang dan bertahan."
      : l.letterId === "letter-to-present-self"
        ? "Untuk memahami fase yang sedang kamu jalani sekarang."
        : "Dari bagian dirimu yang telah bertumbuh dan melihat lebih jernih.",
    paragraphs: l.paragraphs,
    deepExplanation: l.paragraphs.join("\n\n"),
    practicalReflection: l.letterId === "letter-to-past-self"
      ? "Bagian mana dari dirimu di masa lalu yang hari ini ingin kamu temui dengan lebih lembut?"
      : "Satu pilihan kecil apa yang dapat kamu ambil hari ini untuk mendekat pada dirimu di masa depan?",
    order: i + 1,
  }));

  rooms.push({
    id: "surat-jiwa",
    title: "SURAT JIWA",
    readingCount: soulLetters.length,
    order: 11,
  });

  const status: "ready" | "limited" | "unavailable" =
    model.globalCoverage.availableSystems.length === 0
      ? "unavailable"
      : model.globalCoverage.availableSystems.length < 11
        ? "limited"
        : "ready";

  return {
    status,
    rooms,
    readings,
    soulLetters,
    synthesisVersion: model.sourceVersion,
    contentVersion: model.sourceVersion,
  };
}
