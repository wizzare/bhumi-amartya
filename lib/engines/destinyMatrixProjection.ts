import type {
  DestinyMatrixGraph, DestinyMatrixProjection, DestinyMatrixTimeline, DestinyMatrixTimelineSegment,
} from "@/lib/types/destinyMatrix";
import { matrixNodeValue } from "./destinyMatrixGraph";
import { DESTINY_MATRIX_ENERGY_MATRIX, topologyNodeIds } from "../destiny-matrix/topology";

function select(graph: DestinyMatrixGraph, id: string, nodeIds: string[], confidence = 1, details?: Record<string, unknown>): DestinyMatrixProjection {
  nodeIds.forEach((nodeId) => matrixNodeValue(graph, nodeId));
  return { id, status: "ready", nodeIds, confidence, details };
}

function unsupported(id: string): DestinyMatrixProjection {
  return { id, status: "unsupported", nodeIds: [], confidence: 0 };
}

export const getLoveProjection = (graph: DestinyMatrixGraph) => select(graph, "LOVE", topologyNodeIds("LOVE_PATH"));
export const getMoneyProjection = (graph: DestinyMatrixGraph) => select(graph, "MONEY", topologyNodeIds("MONEY_PATH"));
export const getKarmicProjection = (graph: DestinyMatrixGraph) => select(graph, "KARMIC_TAIL", topologyNodeIds("KARMIC_TILE"));
// The historical seven-node diagonals remain diagram evidence, but no canonical
// three-value lineage node ownership has been proven for user-facing readings.
export const getFatherProjection = (graph: DestinyMatrixGraph) => { void graph; return unsupported("FATHER_LINE"); };
export const getMotherProjection = (graph: DestinyMatrixGraph) => { void graph; return unsupported("MOTHER_LINE"); };
export const getSoulProjection = (graph: DestinyMatrixGraph) => select(graph, "SOUL_SEARCHING", topologyNodeIds("SOUL_SEARCHING"));
export const getSpiritualProjection = (graph: DestinyMatrixGraph) => select(graph, "SPIRITUAL_KNOWLEDGE", topologyNodeIds("SPIRITUAL_KNOWLEDGE"));
export const getSocialProjection = (graph: DestinyMatrixGraph) => select(graph, "SOCIALIZATION", topologyNodeIds("SOCIALIZATION"));

export function getHealthProjection(graph: DestinyMatrixGraph): DestinyMatrixProjection {
  const rows = DESTINY_MATRIX_ENERGY_MATRIX.rows.map((row) => ({
    id: row.rowId,
    physical: row.physicalNodeId,
    energy: row.energyNodeId,
    emotion: row.emotionNodeId,
  }));
  const totals = [
    DESTINY_MATRIX_ENERGY_MATRIX.totals.physicalNodeId,
    DESTINY_MATRIX_ENERGY_MATRIX.totals.energyNodeId,
    DESTINY_MATRIX_ENERGY_MATRIX.totals.emotionNodeId,
  ];
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
    select(graph, "TALENT_PATH", topologyNodeIds("LEGACY_TALENT_PATH")),
    getHealthProjection(graph),
    getSoulProjection(graph),
    getSocialProjection(graph),
    getSpiritualProjection(graph),
  ];
}
