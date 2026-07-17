import type { DestinyMatrixGraph } from "../types/destinyMatrix";
import { matrixNodeValue, reduceMatrixValue } from "../engines/destinyMatrixGraph";
import {
  DESTINY_MATRIX_ANCESTRAL_POSITIONS,
  type DestinyMatrixAncestralPositionId,
} from "./topology";

export type AncestralBranch = "father-talent" | "father-karma" | "mother-talent" | "mother-karma";
export type AncestralRole = "inner" | "middle" | "outer";

export type AncestralProjectionNode = {
  projectionNodeId: DestinyMatrixAncestralPositionId;
  value: number;
  formula: string;
  sourceNodeIds: string[];
  role: AncestralRole;
  branch: AncestralBranch;
  orderFromCenter: 1 | 2 | 3;
  visualCoordinate: { x: number; y: number };
  sourceClassification: "EXACT_V3_BUILD_72_SOURCE";
  sourceVersion: "v3-build-72-ancestral-projection";
};

export type AncestralVisualPoint = {
  visualPointId: string;
  value: number;
  visualCoordinate: { x: number; y: number };
  ancestryMembership: boolean;
  context: AncestralBranch | "center" | "love-path-intersection";
};

export type DestinyMatrixAncestralProjection = {
  fatherTalent: AncestralProjectionNode[];
  fatherKarma: AncestralProjectionNode[];
  motherTalent: AncestralProjectionNode[];
  motherKarma: AncestralProjectionNode[];
  fatherVisualDiagonal: AncestralVisualPoint[];
  motherVisualDiagonal: AncestralVisualPoint[];
  status: "IMPLEMENTED — FORMULA PROVEN";
};

const CLASSIFICATION = "EXACT_V3_BUILD_72_SOURCE" as const;
const VERSION = "v3-build-72-ancestral-projection" as const;

export function buildDestinyMatrixAncestralProjection(graph: DestinyMatrixGraph): DestinyMatrixAncestralProjection {
  const direct = (
    projectionNodeId: DestinyMatrixAncestralPositionId,
    sourceNodeId: string,
    branch: AncestralBranch,
    role: AncestralRole,
    orderFromCenter: 1 | 2 | 3,
  ): AncestralProjectionNode => ({
    projectionNodeId,
    value: matrixNodeValue(graph, sourceNodeId),
    formula: `COPY(${sourceNodeId})`,
    sourceNodeIds: [sourceNodeId],
    role,
    branch,
    orderFromCenter,
    visualCoordinate: DESTINY_MATRIX_ANCESTRAL_POSITIONS[projectionNodeId],
    sourceClassification: CLASSIFICATION,
    sourceVersion: VERSION,
  });

  const derived = (
    projectionNodeId: DestinyMatrixAncestralPositionId,
    formula: string,
    sourceNodeIds: string[],
    value: number,
    branch: AncestralBranch,
    role: AncestralRole,
    orderFromCenter: 1 | 2 | 3,
  ): AncestralProjectionNode => ({
    projectionNodeId,
    value: reduceMatrixValue(value),
    formula,
    sourceNodeIds,
    role,
    branch,
    orderFromCenter,
    visualCoordinate: DESTINY_MATRIX_ANCESTRAL_POSITIONS[projectionNodeId],
    sourceClassification: CLASSIFICATION,
    sourceVersion: VERSION,
  });

  const bm05 = matrixNodeValue(graph, "BM05");
  const bm06 = matrixNodeValue(graph, "BM06");
  const bm07 = matrixNodeValue(graph, "BM07");
  const bm08 = matrixNodeValue(graph, "BM08");
  const bm09 = matrixNodeValue(graph, "BM09");

  const fatherTalent = [
    direct("AP_FATHER_TALENT_OUTER", "BM06", "father-talent", "outer", 3),
    derived("AP_FATHER_TALENT_MIDDLE", "R(BM06+BM08)", ["BM06", "BM08"], bm06 + bm08, "father-talent", "middle", 2),
    direct("AP_FATHER_TALENT_INNER", "BM08", "father-talent", "inner", 1),
  ];
  const motherTalent = [
    direct("AP_MOTHER_TALENT_OUTER", "BM07", "mother-talent", "outer", 3),
    derived("AP_MOTHER_TALENT_MIDDLE", "R(BM07+BM09)", ["BM07", "BM09"], bm07 + bm09, "mother-talent", "middle", 2),
    direct("AP_MOTHER_TALENT_INNER", "BM09", "mother-talent", "inner", 1),
  ];

  const fatherKarmaInner = reduceMatrixValue(bm09 + bm05);
  const fatherKarmaMiddle = reduceMatrixValue(bm09 + fatherKarmaInner);
  const fatherKarma = [
    derived("AP_FATHER_KARMA_INNER", "R(BM09+BM05)", ["BM09", "BM05"], fatherKarmaInner, "father-karma", "inner", 1),
    derived("AP_FATHER_KARMA_MIDDLE", "R(BM09+AP_FATHER_KARMA_INNER)", ["BM09", "BM05"], fatherKarmaMiddle, "father-karma", "middle", 2),
    direct("AP_FATHER_KARMA_OUTER", "BM09", "father-karma", "outer", 3),
  ];

  const motherKarmaInner = reduceMatrixValue(bm08 + bm05);
  const motherKarmaMiddle = reduceMatrixValue(bm08 + motherKarmaInner);
  const motherKarma = [
    derived("AP_MOTHER_KARMA_INNER", "R(BM08+BM05)", ["BM08", "BM05"], motherKarmaInner, "mother-karma", "inner", 1),
    derived("AP_MOTHER_KARMA_MIDDLE", "R(BM08+AP_MOTHER_KARMA_INNER)", ["BM08", "BM05"], motherKarmaMiddle, "mother-karma", "middle", 2),
    direct("AP_MOTHER_KARMA_OUTER", "BM08", "mother-karma", "outer", 3),
  ];

  const visual = (node: AncestralProjectionNode): AncestralVisualPoint => ({
    visualPointId: node.projectionNodeId,
    value: node.value,
    visualCoordinate: node.visualCoordinate,
    ancestryMembership: true,
    context: node.branch,
  });
  const center: AncestralVisualPoint = {
    visualPointId: "BM05",
    value: bm05,
    visualCoordinate: { x: 200, y: 200 },
    ancestryMembership: false,
    context: "center",
  };
  const loveIntersection: AncestralVisualPoint = {
    visualPointId: "BM20",
    value: matrixNodeValue(graph, "BM20"),
    visualCoordinate: { x: 236.25, y: 236.25 },
    ancestryMembership: false,
    context: "love-path-intersection",
  };

  return {
    fatherTalent,
    fatherKarma,
    motherTalent,
    motherKarma,
    fatherVisualDiagonal: [visual(fatherKarma[2]), visual(fatherKarma[1]), visual(fatherKarma[0]), loveIntersection, center, visual(fatherTalent[2]), visual(fatherTalent[1]), visual(fatherTalent[0])],
    motherVisualDiagonal: [visual(motherKarma[2]), visual(motherKarma[1]), visual(motherKarma[0]), center, visual(motherTalent[2]), visual(motherTalent[1]), visual(motherTalent[0])],
    status: "IMPLEMENTED — FORMULA PROVEN",
  };
}
