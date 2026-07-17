import type { CanonicalDestinyMatrix, DestinyMatrixProjection } from "@/lib/types/destinyMatrix";
import { translateToLegacyReading, type LegacyReading } from "@/lib/engines/destinyMatrixLegacyTranslator";
import { buildDestinyMatrixAncestralProjection, type DestinyMatrixAncestralProjection } from "@/lib/destiny-matrix/ancestralProjection";

export type VisualStatus = "ready" | "coming_soon";

export type DestinyMatrixVisualValue = {
  status: VisualStatus;
  values: number[];
};

export type DestinyMatrixHealthRow = {
  name: "Sahasrara" | "Ajna" | "Vishudha" | "Anahata" | "Manipura" | "Svadhisthana" | "Muladhara";
  physical: number;
  energy: number;
  emotion: number;
};

export type DestinyMatrixVisualModel = {
  center: DestinyMatrixVisualValue;
  karmic: DestinyMatrixVisualValue;
  father: DestinyMatrixVisualValue;
  mother: DestinyMatrixVisualValue;
  love: DestinyMatrixVisualValue;
  money: DestinyMatrixVisualValue;
  talent: DestinyMatrixVisualValue;
  ancestor: DestinyMatrixVisualValue;
  socialization: DestinyMatrixVisualValue;
  soulSearching: DestinyMatrixVisualValue;
  spiritualKnowledge: DestinyMatrixVisualValue;
  health: DestinyMatrixHealthRow[];
  healthTotals: {
    physical: number;
    energy: number;
    emotion: number;
  } | null;
  timeline: {
    status: "ready" | "coming_soon";
    segments: Array<{
      label: string;
      values: number[];
    }>;
  };
  nodeMap: Record<string, number>;
  legacyReading: LegacyReading;
  ancestral: DestinyMatrixAncestralProjection;
};

const HEALTH_NAMES: DestinyMatrixHealthRow["name"][] = [
  "Sahasrara", "Ajna", "Vishudha", "Anahata", "Manipura", "Svadhisthana", "Muladhara",
];

export function buildDestinyMatrixVisualModel(matrix: CanonicalDestinyMatrix): DestinyMatrixVisualModel {
  const values = new Map(matrix.graph.nodes.map((node) => [node.id, node.value]));
  const projections = new Map(matrix.projections.map((projection) => [projection.id, projection]));

  const resolveIds = (nodeIds: string[]): number[] => nodeIds.map((id) => {
    const value = values.get(id);
    if (value === undefined) throw new Error(`Destiny Matrix visual references missing node ${id}.`);
    return value;
  });
  const resolve = (id: string): DestinyMatrixVisualValue => {
    const projection = projections.get(id);
    if (!projection || projection.status === "unsupported") return { status: "coming_soon", values: [] };
    return { status: "ready", values: resolveIds(projection.nodeIds) };
  };

  const healthProjection = projections.get("HEALTH");
  const healthRows = readHealthRows(healthProjection).map((row, index) => ({
    name: HEALTH_NAMES[index],
    physical: resolveIds([row.physical])[0],
    energy: resolveIds([row.energy])[0],
    emotion: resolveIds([row.emotion])[0],
  }));
  const healthTotalIds = readHealthTotals(healthProjection);
  const healthTotalValues = healthTotalIds.length === 3 ? resolveIds(healthTotalIds) : [];
  const timelineSegments = matrix.timeline.segments.map((segment, index) => ({
    label: `Siklus ${index + 1}`,
    values: resolveIds(segment.nodeIds),
  }));

  return {
    center: resolve("CENTER"),
    karmic: resolve("KARMIC_TAIL"),
    father: resolve("FATHER_LINE"),
    mother: resolve("MOTHER_LINE"),
    love: resolve("LOVE"),
    money: resolve("MONEY"),
    talent: resolve("TALENT_PATH"),
    // Visual-only selection of existing locked nodes. No calculation or projection mutation.
    ancestor: { status: "ready", values: resolveIds(["PR-FEMALE", "PR-MALE", "PR-SOCIAL"]) },
    socialization: resolve("SOCIALIZATION"),
    soulSearching: resolve("SOUL_SEARCHING"),
    spiritualKnowledge: resolve("SPIRITUAL_KNOWLEDGE"),
    health: healthRows,
    healthTotals: healthTotalValues.length === 3 ? {
      physical: healthTotalValues[0],
      energy: healthTotalValues[1],
      emotion: healthTotalValues[2],
    } : null,
    timeline: {
      status: timelineSegments.length > 0 ? "ready" : "coming_soon",
      segments: timelineSegments,
    },
    nodeMap: Object.fromEntries(values),
    legacyReading: translateToLegacyReading(matrix.graph),
    ancestral: buildDestinyMatrixAncestralProjection(matrix.graph),
  };
}

function readHealthRows(projection?: DestinyMatrixProjection): Array<{ physical: string; energy: string; emotion: string }> {
  if (!projection || projection.status !== "ready") return [];
  const rows = projection.details?.rows;
  if (!Array.isArray(rows)) return [];
  return rows.filter((row): row is { physical: string; energy: string; emotion: string } =>
    Boolean(row && typeof row === "object" &&
      typeof (row as Record<string, unknown>).physical === "string" &&
      typeof (row as Record<string, unknown>).energy === "string" &&
      typeof (row as Record<string, unknown>).emotion === "string"),
  );
}

function readHealthTotals(projection?: DestinyMatrixProjection): string[] {
  if (!projection || projection.status !== "ready") return [];
  const totals = projection.details?.totals;
  return Array.isArray(totals) && totals.every((value) => typeof value === "string") ? totals : [];
}
