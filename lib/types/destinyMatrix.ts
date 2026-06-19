export type MatrixNodeKind = "root" | "derived" | "projection";
export type MatrixProjectionStatus = "ready" | "unsupported" | "calculated_unmapped";

export interface MatrixNode {
  id: string;
  kind: MatrixNodeKind;
  lifecycle: "active" | "reserved";
  value: number;
  parents: string[];
  formula: string;
  consumers: string[];
}

export interface MatrixEdge {
  from: string;
  to: string;
}

export interface DestinyMatrixProjection {
  id: string;
  status: MatrixProjectionStatus;
  nodeIds: string[];
  confidence: number;
  details?: Record<string, unknown>;
}

export interface DestinyMatrixTimelineSegment {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  nodeIds: string[];
  ageStart: null;
  ageEnd: null;
}

export interface DestinyMatrixTimeline {
  status: "calculated_unmapped";
  nodeIds: string[];
  segments: DestinyMatrixTimelineSegment[];
}

export interface DestinyMatrixGraph {
  schemaVersion: "1.0.0";
  engineVersion: "bhumi-matrix-1.0.0";
  input: {
    dateOfBirth: string;
    inputHash: string;
  };
  nodes: MatrixNode[];
  edges: MatrixEdge[];
  metadata: {
    owner: "Bhumi";
    valueDomain: "arcana-1-22";
    reduction: "recursive-digit-sum";
    topology: "calculation-graph";
    structuralNodeCount: 32;
    projectionNodeCount: 71;
  };
}

export interface CanonicalDestinyMatrix {
  graph: DestinyMatrixGraph;
  projections: DestinyMatrixProjection[];
  timeline: DestinyMatrixTimeline;
  metadata: {
    schemaVersion: "1.0.0";
    engineVersion: "bhumi-matrix-1.0.0";
    calculatedAt: string;
  };
}
