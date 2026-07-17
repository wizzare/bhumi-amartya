export type DestinyMatrixSourceClassification = "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION" | "UNPROVEN_LEGACY_ALTERNATIVE";

export type DestinyMatrixTopologyNode = {
  nodeId: string;
  canonicalPositionId: string;
  canonicalLabel: string;
  coordinate: { x: number; y: number };
  arcanaSource: string;
  lineMembership: string[];
  displayPriority: number;
  sourceClassification: DestinyMatrixSourceClassification;
  sourceVersion: string;
  visual: { radius: number; solid: boolean };
};

export type DestinyMatrixTopologyLine = {
  lineId: string;
  canonicalLabel: string;
  orderedNodeIds: readonly string[];
  mainNodeId: string;
  visualEdgeIds: readonly string[];
  sourceClassification: DestinyMatrixSourceClassification;
  sourceVersion: string;
};

export type DestinyMatrixVisualEdge = {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  role: "structure" | "father-diagonal" | "mother-diagonal" | "love" | "money";
};

export type DestinyMatrixEnergyRow = {
  rowId: string;
  canonicalLabel: string;
  physicalNodeId: string;
  energyNodeId: string;
  emotionNodeId: string;
};

export type DestinyMatrixAncestralPositionId =
  | "AP_FATHER_TALENT_INNER" | "AP_FATHER_TALENT_MIDDLE" | "AP_FATHER_TALENT_OUTER"
  | "AP_FATHER_KARMA_INNER" | "AP_FATHER_KARMA_MIDDLE" | "AP_FATHER_KARMA_OUTER"
  | "AP_MOTHER_TALENT_INNER" | "AP_MOTHER_TALENT_MIDDLE" | "AP_MOTHER_TALENT_OUTER"
  | "AP_MOTHER_KARMA_INNER" | "AP_MOTHER_KARMA_MIDDLE" | "AP_MOTHER_KARMA_OUTER";

const SOURCE_VERSION = "destiny-matrix-r5-phase-2";
const SOURCE_CLASSIFICATION = "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION" as const;
const C = 200;
const R = 145;
const D = 0.707;

const positions: Record<string, { x: number; y: number; radius: number; solid: boolean; label: string }> = {
  BM01: { x: C - R, y: C, radius: 18, solid: true, label: "Left outer anchor" },
  BM02: { x: C, y: C - R, radius: 18, solid: true, label: "Top outer anchor" },
  BM03: { x: C + R, y: C, radius: 18, solid: true, label: "Right outer anchor" },
  BM04: { x: C, y: C + R, radius: 18, solid: true, label: "Bottom outer anchor" },
  BM05: { x: C, y: C, radius: 16, solid: true, label: "Center Arcana" },
  BM06: { x: C - R * D, y: C - R * D, radius: 15, solid: false, label: "Top-left outer anchor" },
  BM07: { x: C + R * D, y: C - R * D, radius: 15, solid: false, label: "Top-right outer anchor" },
  BM08: { x: C - R * D, y: C + R * D, radius: 15, solid: false, label: "Bottom-left outer anchor" },
  BM09: { x: C + R * D, y: C + R * D, radius: 15, solid: false, label: "Bottom-right outer anchor" },
  BM10: { x: C, y: C + R * 0.5, radius: 12, solid: true, label: "Bottom inner anchor" },
  BM11: { x: C + R * 0.5, y: C, radius: 12, solid: true, label: "Right inner anchor" },
  BM12: { x: C - R * 0.5, y: C, radius: 12, solid: true, label: "Left middle anchor" },
  BM13: { x: C, y: C - R * 0.5, radius: 12, solid: true, label: "Top middle anchor" },
  BM14: { x: C - R * 0.75, y: C, radius: 12, solid: true, label: "Left outer-inner anchor" },
  BM15: { x: C, y: C - R * 0.75, radius: 12, solid: true, label: "Top outer-inner anchor" },
  BM16: { x: C + R * 0.75, y: C, radius: 12, solid: false, label: "Money outer-inner anchor" },
  BM17: { x: C, y: C + R * 0.75, radius: 12, solid: false, label: "Karmic outer-inner anchor" },
  BM18: { x: C - R * 0.25, y: C, radius: 12, solid: true, label: "Left inner anchor" },
  BM19: { x: C, y: C - R * 0.25, radius: 12, solid: true, label: "Top inner anchor" },
  BM20: { x: C + R * 0.25, y: C + R * 0.25, radius: 10, solid: false, label: "Love and Money junction" },
  BM21: { x: C + R * 0.125, y: C + R * 0.375, radius: 10, solid: false, label: "Main Love Arcana" },
  BM22: { x: C + R * 0.375, y: C + R * 0.125, radius: 10, solid: false, label: "Main Money Arcana" },
  BM23: { x: C + R * 0.17, y: C, radius: 12, solid: false, label: "Common Energy process" },
  BM24: { x: C + R * 0.33, y: C, radius: 12, solid: false, label: "Common Energy expression" },
  BM25: { x: C - R * 0.68 * D, y: C - R * 0.68 * D, radius: 10, solid: false, label: "Father Talents expression" },
  BM26: { x: C - R * 0.35 * D, y: C - R * 0.35 * D, radius: 10, solid: false, label: "Father Talents process" },
  BM27: { x: C + R * 0.35 * D, y: C - R * 0.35 * D, radius: 10, solid: false, label: "Mother Talents expression" },
  BM28: { x: C + R * 0.68 * D, y: C - R * 0.68 * D, radius: 10, solid: false, label: "Mother Talents process" },
  BM29: { x: C - R * 0.35 * D, y: C + R * 0.35 * D, radius: 10, solid: false, label: "Lower-left diagonal inner" },
  BM30: { x: C - R * 0.68 * D, y: C + R * 0.68 * D, radius: 10, solid: false, label: "Lower-left diagonal outer" },
  BM31: { x: C + R * 0.65 * D, y: C + R * 0.65 * D, radius: 10, solid: false, label: "Lower-right diagonal inner" },
  BM32: { x: C + R * 0.82 * D, y: C + R * 0.82 * D, radius: 10, solid: false, label: "Lower-right diagonal outer" },
};

const path = (lineId: string, canonicalLabel: string, orderedNodeIds: readonly string[], mainNodeId: string): DestinyMatrixTopologyLine => ({
  lineId, canonicalLabel, orderedNodeIds, mainNodeId,
  visualEdgeIds: orderedNodeIds.slice(1).map((_, index) => `${lineId.toLowerCase()}-${index + 1}`),
  sourceClassification: SOURCE_CLASSIFICATION,
  sourceVersion: SOURCE_VERSION,
});

export const DESTINY_MATRIX_PATHS = {
  CENTER: path("CENTER", "Center Arcana", ["BM05"], "BM05"),
  COMMON_ENERGY: path("COMMON_ENERGY", "Common Energy", ["BM05", "BM23", "BM24"], "BM05"),
  KARMIC_TILE: path("KARMIC_TILE", "Karmic Tile", ["BM10", "BM17", "BM04"], "BM17"),
  LOVE_PATH: path("LOVE_PATH", "Love Path", ["BM20", "BM21", "BM10"], "BM21"),
  MONEY_PATH: path("MONEY_PATH", "Money Path", ["BM03", "BM16", "BM11", "BM22", "BM20"], "BM22"),
  HIGHER_TALENTS: path("HIGHER_TALENTS", "Higher Talents", ["BM02", "BM15", "BM13"], "BM15"),
  SOUL_SEARCHING: path("SOUL_SEARCHING", "Soul Searching", ["PR-SKY", "PR-EARTH", "PR-PERSONAL"], "PR-PERSONAL"),
  SOCIALIZATION: path("SOCIALIZATION", "Socialization", ["PR-MALE", "PR-FEMALE", "PR-SOCIAL"], "PR-SOCIAL"),
  SPIRITUAL_KNOWLEDGE: path("SPIRITUAL_KNOWLEDGE", "Spiritual Knowledge", ["PR-GENERAL"], "PR-GENERAL"),
  LEGACY_TALENT_PATH: path("LEGACY_TALENT_PATH", "Legacy talent path", ["BM26", "BM28", "BM30", "BM32"], "BM26"),
  FATHER_VISUAL_DIAGONAL: path("FATHER_VISUAL_DIAGONAL", "Father visual diagonal", ["BM06", "BM25", "BM26", "BM05", "BM31", "BM32", "BM09"], "BM05"),
  MOTHER_VISUAL_DIAGONAL: path("MOTHER_VISUAL_DIAGONAL", "Mother visual diagonal", ["BM08", "BM30", "BM29", "BM05", "BM27", "BM28", "BM07"], "BM05"),
} as const;

const memberships = Object.values(DESTINY_MATRIX_PATHS).reduce<Record<string, string[]>>((result, line) => {
  line.orderedNodeIds.forEach((nodeId) => { result[nodeId] = [...(result[nodeId] ?? []), line.lineId]; });
  return result;
}, {});

export const DESTINY_MATRIX_NODES: readonly DestinyMatrixTopologyNode[] = Object.entries(positions).map(([nodeId, item], index) => ({
  nodeId,
  canonicalPositionId: `POSITION_${nodeId}`,
  canonicalLabel: item.label,
  coordinate: { x: item.x, y: item.y },
  arcanaSource: nodeId,
  lineMembership: memberships[nodeId] ?? [],
  displayPriority: index + 1,
  sourceClassification: SOURCE_CLASSIFICATION,
  sourceVersion: SOURCE_VERSION,
  visual: { radius: item.radius, solid: item.solid },
}));

const chains: Array<[string, string[], DestinyMatrixVisualEdge["role"]]> = [
  ["outer", ["BM01", "BM06", "BM02", "BM07", "BM03", "BM09", "BM04", "BM08", "BM01"], "structure"],
  ["horizontal", ["BM01", "BM14", "BM12", "BM18", "BM05", "BM23", "BM24", "BM11", "BM16", "BM03"], "structure"],
  ["vertical", ["BM02", "BM15", "BM13", "BM19", "BM05", "BM10", "BM17", "BM04"], "structure"],
  ["father", [...DESTINY_MATRIX_PATHS.FATHER_VISUAL_DIAGONAL.orderedNodeIds], "father-diagonal"],
  ["mother", [...DESTINY_MATRIX_PATHS.MOTHER_VISUAL_DIAGONAL.orderedNodeIds], "mother-diagonal"],
  ["love", ["BM10", "BM21", "BM20"], "love"],
  ["money", ["BM20", "BM22", "BM11"], "money"],
];

export const DESTINY_MATRIX_VISUAL_EDGES: readonly DestinyMatrixVisualEdge[] = chains.flatMap(([prefix, ids, role]) =>
  ids.slice(1).map((toNodeId, index) => ({ edgeId: `${prefix}-${index + 1}`, fromNodeId: ids[index], toNodeId, role })),
);

export const DESTINY_MATRIX_LINEAGE = {
  father: { status: "unproven" as const, approvedFixtureValues: [13, 7, 21] as const, orderedNodeIds: null },
  mother: { status: "unproven" as const, approvedFixtureValues: [10, 10, 18] as const, orderedNodeIds: null },
};

export const DESTINY_MATRIX_AGE_CYCLE = {
  status: "founder_approved_visual_mapping" as const,
  segments: [
    { segmentId: "T01", ageStart: 0, ageEnd: 10 },
    { segmentId: "T02", ageStart: 10, ageEnd: 20 },
    { segmentId: "T03", ageStart: 20, ageEnd: 30 },
    { segmentId: "T04", ageStart: 30, ageEnd: 40 },
    { segmentId: "T05", ageStart: 40, ageEnd: 50 },
    { segmentId: "T06", ageStart: 50, ageEnd: 60 },
    { segmentId: "T07", ageStart: 60, ageEnd: 70 },
    { segmentId: "T08", ageStart: 70, ageEnd: 80 },
  ],
  points: [
    { fraction: 0.125, valueIndex: 2, offsetStart: 1, offsetEnd: 2 },
    { fraction: 0.25, valueIndex: 1, offsetStart: 2, offsetEnd: 3 },
    { fraction: 0.375, valueIndex: 3, offsetStart: 3, offsetEnd: 4 },
    { fraction: 0.5, valueIndex: 0, offsetStart: 4, offsetEnd: 6 },
    { fraction: 0.625, valueIndex: 5, offsetStart: 6, offsetEnd: 7 },
    { fraction: 0.75, valueIndex: 4, offsetStart: 7, offsetEnd: 8 },
    { fraction: 0.875, valueIndex: 6, offsetStart: 8, offsetEnd: 9 },
  ],
};

const ancestralPosition = (nodeId: string) => {
  const position = positions[nodeId];
  if (!position) throw new Error(`Missing ancestral visual position ${nodeId}.`);
  return { x: position.x, y: position.y };
};

export const DESTINY_MATRIX_ANCESTRAL_POSITIONS: Record<DestinyMatrixAncestralPositionId, { x: number; y: number }> = {
  AP_FATHER_TALENT_INNER: ancestralPosition("BM26"),
  AP_FATHER_TALENT_MIDDLE: ancestralPosition("BM25"),
  AP_FATHER_TALENT_OUTER: ancestralPosition("BM06"),
  AP_FATHER_KARMA_INNER: ancestralPosition("BM31"),
  AP_FATHER_KARMA_MIDDLE: ancestralPosition("BM32"),
  AP_FATHER_KARMA_OUTER: ancestralPosition("BM09"),
  AP_MOTHER_TALENT_INNER: ancestralPosition("BM27"),
  AP_MOTHER_TALENT_MIDDLE: ancestralPosition("BM28"),
  AP_MOTHER_TALENT_OUTER: ancestralPosition("BM07"),
  AP_MOTHER_KARMA_INNER: ancestralPosition("BM29"),
  AP_MOTHER_KARMA_MIDDLE: ancestralPosition("BM30"),
  AP_MOTHER_KARMA_OUTER: ancestralPosition("BM08"),
};

export const DESTINY_MATRIX_ENERGY_MATRIX = {
  sectionId: "ENERGY_MATRIX",
  canonicalLabel: "Energy Matrix",
  displayLabel: "Peta Keseimbangan Energi",
  rows: [
    { rowId: "H01", canonicalLabel: "Sahasrara", physicalNodeId: "BM01", energyNodeId: "BM02", emotionNodeId: "BM06" },
    { rowId: "H02", canonicalLabel: "Ajna", physicalNodeId: "BM14", energyNodeId: "BM15", emotionNodeId: "H02-EMOTION" },
    { rowId: "H03", canonicalLabel: "Vishuddha", physicalNodeId: "BM12", energyNodeId: "BM13", emotionNodeId: "H03-EMOTION" },
    { rowId: "H04", canonicalLabel: "Anahata", physicalNodeId: "BM18", energyNodeId: "BM19", emotionNodeId: "H04-EMOTION" },
    { rowId: "H05", canonicalLabel: "Manipura", physicalNodeId: "BM05", energyNodeId: "BM05", emotionNodeId: "H05-EMOTION" },
    { rowId: "H06", canonicalLabel: "Svadhisthana", physicalNodeId: "BM11", energyNodeId: "BM10", emotionNodeId: "BM20" },
    { rowId: "H07", canonicalLabel: "Muladhara", physicalNodeId: "BM03", energyNodeId: "BM04", emotionNodeId: "BM09" },
  ] as readonly DestinyMatrixEnergyRow[],
  totals: {
    physicalNodeId: "HEALTH-PHYSICAL-TOTAL",
    energyNodeId: "HEALTH-ENERGY-TOTAL",
    emotionNodeId: "HEALTH-EMOTION-TOTAL",
  },
  sourceClassification: "STRUCTURED_PRE_CUTOFF_SOURCE" as const,
  sourceVersion: "bhumi-matrix-1.0.0",
};

export const DESTINY_MATRIX_TOPOLOGY = {
  sourceVersion: SOURCE_VERSION,
  sourceClassification: SOURCE_CLASSIFICATION,
  viewBox: "0 0 400 400",
  nodes: DESTINY_MATRIX_NODES,
  edges: DESTINY_MATRIX_VISUAL_EDGES,
  paths: DESTINY_MATRIX_PATHS,
  lineage: DESTINY_MATRIX_LINEAGE,
  ageCycle: DESTINY_MATRIX_AGE_CYCLE,
  ancestralPositions: DESTINY_MATRIX_ANCESTRAL_POSITIONS,
  energyMatrix: DESTINY_MATRIX_ENERGY_MATRIX,
  guides: [{ guideId: "INNER_CIRCLE", kind: "circle" as const, center: { x: C, y: C }, radius: R * 0.5 }],
  diagramGroups: {
    outer: ["BM02", "BM07", "BM03", "BM09", "BM04", "BM08", "BM01", "BM06"],
    inner: ["BM15", "BM13", "BM19", "BM14", "BM12", "BM18", "BM16", "BM11", "BM24", "BM23", "BM17", "BM10", "BM25", "BM26", "BM28", "BM27", "BM30", "BM29", "BM32", "BM31"],
    loveMoney: ["BM20", "BM21", "BM22"],
    center: ["BM05"],
  },
} as const;

export function topologyNodeIds(pathId: keyof typeof DESTINY_MATRIX_PATHS): string[] {
  return [...DESTINY_MATRIX_PATHS[pathId].orderedNodeIds];
}
