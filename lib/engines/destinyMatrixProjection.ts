import type {
  DestinyMatrixGraph, DestinyMatrixProjection, DestinyMatrixTimeline, DestinyMatrixTimelineSegment,
} from "@/lib/types/destinyMatrix";
import { matrixNodeValue } from "./destinyMatrixGraph";

function select(graph: DestinyMatrixGraph, id: string, nodeIds: string[], confidence = 1, details?: Record<string, unknown>): DestinyMatrixProjection {
  nodeIds.forEach((nodeId) => matrixNodeValue(graph, nodeId));
  return { id, status: "ready", nodeIds, confidence, details };
}

function unsupported(id: string): DestinyMatrixProjection {
  return { id, status: "unsupported", nodeIds: [], confidence: 0 };
}

export const getLoveProjection = (graph: DestinyMatrixGraph) => select(graph, "LOVE", ["BM05", "BM21", "BM20"]);
export const getMoneyProjection = (graph: DestinyMatrixGraph) => select(graph, "MONEY", ["BM05", "BM22", "BM20"]);
export const getKarmicProjection = (graph: DestinyMatrixGraph) => select(graph, "KARMIC_TAIL", ["BM04", "BM17", "BM10"]);
export const getFatherProjection = (graph: DestinyMatrixGraph) => select(graph, "FATHER_LINE", ["BM06", "BM25", "BM26", "BM05", "BM31", "BM32", "BM09"]);
export const getMotherProjection = (graph: DestinyMatrixGraph) => select(graph, "MOTHER_LINE", ["BM08", "BM29", "BM30", "BM05", "BM27", "BM28", "BM07"]);
export const getSoulProjection = (graph: DestinyMatrixGraph) => select(graph, "SOUL_SEARCHING", ["PR-SKY", "PR-EARTH", "PR-PERSONAL"]);
export const getSpiritualProjection = (graph: DestinyMatrixGraph) => select(graph, "SPIRITUAL_KNOWLEDGE", ["PR-GENERAL"]);
export const getSocialProjection = (graph: DestinyMatrixGraph) => select(graph, "SOCIALIZATION", ["PR-MALE", "PR-FEMALE", "PR-SOCIAL"]);

export function getHealthProjection(graph: DestinyMatrixGraph): DestinyMatrixProjection {
  const rows = [
    { id: "H01", physical: "BM01", energy: "BM02", emotion: "BM06" },
    { id: "H02", physical: "BM14", energy: "BM15", emotion: "H02-EMOTION" },
    { id: "H03", physical: "BM12", energy: "BM13", emotion: "H03-EMOTION" },
    { id: "H04", physical: "BM18", energy: "BM19", emotion: "H04-EMOTION" },
    { id: "H05", physical: "BM05", energy: "BM05", emotion: "H05-EMOTION" },
    { id: "H06", physical: "BM11", energy: "BM10", emotion: "BM20" },
    { id: "H07", physical: "BM03", energy: "BM04", emotion: "BM09" },
  ];
  const totals = ["HEALTH-PHYSICAL-TOTAL", "HEALTH-ENERGY-TOTAL", "HEALTH-EMOTION-TOTAL"];
  const nodeIds = [...new Set(rows.flatMap((row) => [row.physical, row.energy, row.emotion]).concat(totals))];
  return select(graph, "HEALTH", nodeIds, 1, { rows, totals });
}

export function getTimelineProjection(graph: DestinyMatrixGraph): DestinyMatrixTimeline {
  const endpoints = [
    ["T01", "BM01", "BM06"], ["T02", "BM06", "BM02"], ["T03", "BM02", "BM07"], ["T04", "BM07", "BM03"],
    ["T05", "BM03", "BM09"], ["T06", "BM09", "BM04"], ["T07", "BM04", "BM08"], ["T08", "BM08", "BM01"],
  ] as const;
  const segments: DestinyMatrixTimelineSegment[] = endpoints.map(([id, fromNodeId, toNodeId]) => {
    const nodeIds = ["M", "L1", "L2", "L3", "R1", "R2", "R3"].map((suffix) => `${id}-${suffix}`);
    [fromNodeId, toNodeId, ...nodeIds].forEach((nodeId) => matrixNodeValue(graph, nodeId));
    return { id, fromNodeId, toNodeId, nodeIds, ageStart: null, ageEnd: null };
  });
  return { status: "calculated_unmapped", nodeIds: segments.flatMap((segment) => segment.nodeIds), segments };
}

export const canonicalTimelineProjection = getTimelineProjection;

export function getAllDestinyMatrixProjections(graph: DestinyMatrixGraph): DestinyMatrixProjection[] {
  return [
    select(graph, "CENTER", ["BM05"]),
    getLoveProjection(graph),
    getMoneyProjection(graph),
    getKarmicProjection(graph),
    getFatherProjection(graph),
    getMotherProjection(graph),
    select(graph, "FAMILY_SQUARE", ["BM06", "BM07", "BM09", "BM08"]),
    select(graph, "FAMILY_CENTER", ["BM23"]),
    select(graph, "FATHER_DESCENDANTS", ["BM25", "BM27"]),
    select(graph, "MOTHER_DESCENDANTS", ["BM29", "BM31"]),
    select(graph, "TALENT_PATH", ["BM26", "BM28", "BM30", "BM32"]),
    getHealthProjection(graph),
    getSoulProjection(graph),
    getSocialProjection(graph),
    getSpiritualProjection(graph),
  ];
}
