import type { Blueprint } from "@/lib/types/blueprint";
import { calculateBhumiMatrix } from "@/lib/engines/calculateBhumiMatrix";
import { buildDestinyMatrixVisualModel } from "@/lib/visual/destinyMatrixVisualModel";

const ENGINE_VERSION = "bhumi-matrix-1.0.0";
const NARRATIVE_VERSION = "p0-human-meaning";

const LEGACY_NARRATIVE_MARKERS = [
  "Pola jiwamu menempatkan Arcana",
  "Sebagai bagian dari pembelajaran karmik",
  "Melalui dinamika relasi",
  "Misi Jiwa terbaca dari Arcana Center",
  "Potensi Terbesar muncul dari",
  "Pola Berulang dibaca dari",
  "Inner Child terbaca dari",
  "Karma Leluhur dibaca dari",
  "Uang & Karya dibaca dari",
  "Relasi & Cinta dibaca dari",
  "Money Line",
  "Love Line",
  "Karmic Tail",
  "Father Line",
  "Mother Line",
  "Arcana Center",
];

function asNumbers(values: unknown): number[] {
  if (Array.isArray(values)) return values.map(Number).filter((value) => Number.isFinite(value) && value > 0);
  if (typeof values === "string") {
    return (values.match(/\d+/g) || []).map(Number).filter((value) => Number.isFinite(value) && value > 0);
  }
  if (typeof values === "number") return [values];
  return [];
}

function countArcana(lines: number[][]): Record<number, number> {
  return lines.flat().reduce<Record<number, number>>((counts, value) => {
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function repeatedArcana(lines: number[][]): number[] {
  return Object.entries(countArcana(lines))
    .filter(([, count]) => count >= 2)
    .sort((a, b) => Number(b[1]) - Number(a[1]) || Number(a[0]) - Number(b[0]))
    .map(([value]) => Number(value));
}

function dominantArcana(lines: number[][]): number[] {
  return Object.entries(countArcana(lines))
    .sort((a, b) => Number(b[1]) - Number(a[1]) || Number(a[0]) - Number(b[0]))
    .slice(0, 3)
    .map(([value]) => Number(value));
}

function missingArcana(lines: number[][]): number[] {
  const present = new Set(lines.flat());
  return Array.from({ length: 22 }, (_, index) => index + 1).filter((value) => !present.has(value));
}

function includesLegacyNarrative(value: unknown): boolean {
  if (typeof value === "string") return LEGACY_NARRATIVE_MARKERS.some((marker) => value.includes(marker));
  if (Array.isArray(value)) return value.some(includesLegacyNarrative);
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).some(includesLegacyNarrative);
  return false;
}

export function calculateCanonicalDestinyMatrixBlueprint(birthDate: string): Blueprint["destinyMatrix"] {
  const matrix = calculateBhumiMatrix(birthDate);
  const visual = buildDestinyMatrixVisualModel(matrix);
  const legacy = visual.legacyReading;
  const healthChart = Object.fromEntries(visual.health.map((row) => [
    row.name.toLowerCase(),
    { physics: row.physical, energy: row.energy, emotion: row.emotion },
  ]));
  const lines = [
    visual.center.values,
    visual.love.values,
    visual.money.values,
    visual.karmic.values,
    visual.father.values,
    visual.mother.values,
    visual.ancestor.values,
    visual.talent.values,
    visual.soulSearching.values,
    visual.socialization.values,
    visual.spiritualKnowledge.values,
  ];

  return {
    dayPoint: visual.nodeMap.BM01,
    monthPoint: visual.nodeMap.BM02,
    yearPoint: visual.nodeMap.BM03,
    destinyPoint: visual.nodeMap.BM04,
    arcanaCenter: visual.center.values[0] ?? legacy.center,
    center: visual.center.values[0] ?? legacy.center,
    loveLine: visual.love.values,
    moneyLine: visual.money.values,
    karmicTail: visual.karmic.values,
    fatherLine: visual.father.values,
    motherLine: visual.mother.values,
    ancestorLine: visual.ancestor.values,
    talentsFather: asNumbers(legacy.fatherTalent),
    talentsMother: asNumbers(legacy.motherTalent),
    talentsGreat: visual.talent.values,
    purposes: {
      soulSearching: visual.soulSearching.values.at(-1) ?? 0,
      socialization: visual.socialization.values.at(-1) ?? 0,
      spiritualKnowledge: visual.spiritualKnowledge.values.at(-1) ?? 0,
    },
    chartHeart: Object.fromEntries(visual.health.flatMap((row) => [
      [`${row.name.toLowerCase()}Physics`, row.physical],
      [`${row.name.toLowerCase()}Energy`, row.energy],
      [`${row.name.toLowerCase()}Emotion`, row.emotion],
    ])),
    years: Object.fromEntries(visual.timeline.segments.map((segment, index) => [`cycle${index + 1}`, segment.values[0] ?? 0])),
    rawPoints: visual.nodeMap,
    destinyIntelligence: {
      soulSearching: visual.soulSearching.values.at(-1),
      socialization: visual.socialization.values.at(-1),
      spiritualKnowledge: visual.spiritualKnowledge.values.at(-1),
      healthChart,
    },
    healthChart,
    chakraMatrix: healthChart,
    status: "completed",
    calculationStatus: "completed",
    engineVersion: ENGINE_VERSION,
    narrativeVersion: NARRATIVE_VERSION,
    repeatedArcana: repeatedArcana(lines),
    missingArcana: missingArcana(lines),
    dominantArcana: dominantArcana(lines),
    matrixGeometry: {
      structuralNodeCount: matrix.graph.metadata.structuralNodeCount,
      projectionNodeCount: matrix.graph.metadata.projectionNodeCount,
      edgeCount: matrix.graph.edges.length,
      topology: matrix.graph.metadata.topology,
    },
    timeline: visual.timeline,
    commonEnergy: asNumbers(legacy.commonEnergy),
  } as Blueprint["destinyMatrix"];
}

export function isLegacyDestinyMatrixData(destinyMatrix: unknown): boolean {
  if (!destinyMatrix || typeof destinyMatrix !== "object") return true;
  const dm = destinyMatrix as Record<string, unknown>;
  const required = ["center", "arcanaCenter", "loveLine", "moneyLine", "karmicTail", "fatherLine", "motherLine", "talentsGreat"];
  if (required.some((key) => asNumbers(dm[key]).length === 0)) return true;
  if (dm.engineVersion !== ENGINE_VERSION) return true;
  if (dm.narrativeVersion !== NARRATIVE_VERSION) return true;
  if (!Array.isArray(dm.repeatedArcana) || !Array.isArray(dm.missingArcana) || !Array.isArray(dm.dominantArcana)) return true;
  return includesLegacyNarrative(dm);
}
