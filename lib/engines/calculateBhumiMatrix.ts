import type { CanonicalDestinyMatrix } from "@/lib/types/destinyMatrix";
import { buildDestinyMatrixGraph } from "./destinyMatrixGraph";
import { getAllDestinyMatrixProjections, getTimelineProjection } from "./destinyMatrixProjection";

export function calculateBhumiMatrix(dateOfBirth: string): CanonicalDestinyMatrix {
  const graph = buildDestinyMatrixGraph(dateOfBirth);
  return {
    graph,
    projections: getAllDestinyMatrixProjections(graph),
    timeline: getTimelineProjection(graph),
    metadata: {
      schemaVersion: "1.0.0",
      engineVersion: "bhumi-matrix-1.0.0",
      calculatedAt: new Date().toISOString(),
    },
  };
}

