import type { DestinyMatrixGraph, MatrixNode, MatrixNodeKind } from "@/lib/types/destinyMatrix";

type DateParts = { year: number; month: number; day: number };
type MutableNode = Omit<MatrixNode, "consumers" | "lifecycle">;

const STRUCTURAL_COUNT = 32 as const;
const PROJECTION_COUNT = 71 as const;
const RESERVED_NODE_IDS = new Set(["BM16", "BM21", "BM22", "BM24"]);

export function reduceMatrixValue(value: number): number {
  if (!Number.isInteger(value) || value < 0) throw new Error("Matrix values must be non-negative integers.");
  let result = value;
  while (result > 22) {
    result = String(result).split("").reduce((sum, digit) => sum + Number(digit), 0);
  }
  return result === 0 ? 22 : result;
}

function parseDateOfBirth(dateOfBirth: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
  if (!match) throw new Error("dateOfBirth must use YYYY-MM-DD.");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    throw new Error("dateOfBirth is not a valid Gregorian date.");
  }
  return { year, month, day };
}

function inputHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function buildDestinyMatrixGraph(dateOfBirth: string): DestinyMatrixGraph {
  const date = parseDateOfBirth(dateOfBirth);
  const nodes: MutableNode[] = [];
  const values = new Map<string, number>();

  const add = (id: string, kind: MatrixNodeKind, parents: string[], formula: string, rawValue: number) => {
    if (values.has(id)) throw new Error(`Duplicate matrix node: ${id}`);
    for (const parent of parents) if (!values.has(parent)) throw new Error(`Missing parent ${parent} for ${id}`);
    const value = reduceMatrixValue(rawValue);
    values.set(id, value);
    nodes.push({ id, kind, value, parents, formula });
    return value;
  };
  const v = (id: string) => {
    const value = values.get(id);
    if (value === undefined) throw new Error(`Unknown matrix node: ${id}`);
    return value;
  };
  const sum = (...ids: string[]) => ids.reduce((total, id) => total + v(id), 0);

  add("INPUT_DAY", "root", [], "day(dateOfBirth)", date.day);
  add("INPUT_MONTH", "root", [], "month(dateOfBirth)", date.month);
  add("INPUT_YEAR", "root", [], "sumDigits(year(dateOfBirth))", String(date.year).split("").reduce((a, d) => a + Number(d), 0));

  add("BM01", "root", [], "R(day(dateOfBirth))", v("INPUT_DAY"));
  add("BM02", "root", [], "R(month(dateOfBirth))", v("INPUT_MONTH"));
  add("BM03", "root", [], "R(sumDigits(year(dateOfBirth)))", v("INPUT_YEAR"));
  add("BM04", "derived", ["BM01", "BM02", "BM03"], "R(BM01+BM02+BM03)", sum("BM01", "BM02", "BM03"));
  add("BM05", "derived", ["BM01", "BM02", "BM03", "BM04"], "R(BM01+BM02+BM03+BM04)", sum("BM01", "BM02", "BM03", "BM04"));
  add("BM06", "derived", ["BM01", "BM02"], "R(BM01+BM02)", sum("BM01", "BM02"));
  add("BM07", "derived", ["BM02", "BM03"], "R(BM02+BM03)", sum("BM02", "BM03"));
  add("BM08", "derived", ["BM04", "BM01"], "R(BM04+BM01)", sum("BM04", "BM01"));
  add("BM09", "derived", ["BM03", "BM04"], "R(BM03+BM04)", sum("BM03", "BM04"));
  add("BM10", "derived", ["BM04", "BM05"], "R(BM04+BM05)", sum("BM04", "BM05"));
  add("BM11", "derived", ["BM03", "BM05"], "R(BM03+BM05)", sum("BM03", "BM05"));
  add("BM12", "derived", ["BM01", "BM05"], "R(BM01+BM05)", sum("BM01", "BM05"));
  add("BM13", "derived", ["BM02", "BM05"], "R(BM02+BM05)", sum("BM02", "BM05"));
  add("BM14", "derived", ["BM01", "BM12"], "R(BM01+BM12)", sum("BM01", "BM12"));
  add("BM15", "derived", ["BM02", "BM13"], "R(BM02+BM13)", sum("BM02", "BM13"));
  add("BM16", "derived", ["BM11", "BM03"], "R(BM11+BM03)", sum("BM11", "BM03"));
  add("BM17", "derived", ["BM10", "BM04"], "R(BM10+BM04)", sum("BM10", "BM04"));
  add("BM18", "derived", ["BM12", "BM05"], "R(BM12+BM05)", sum("BM12", "BM05"));
  add("BM19", "derived", ["BM13", "BM05"], "R(BM13+BM05)", sum("BM13", "BM05"));
  add("BM20", "derived", ["BM10", "BM11"], "R(BM10+BM11)", sum("BM10", "BM11"));
  add("BM21", "derived", ["BM10", "BM20"], "R(BM10+BM20)", sum("BM10", "BM20"));
  add("BM22", "derived", ["BM20", "BM11"], "R(BM20+BM11)", sum("BM20", "BM11"));
  add("BM23", "derived", ["BM06", "BM07", "BM08", "BM09"], "R(BM06+BM07+BM08+BM09)", sum("BM06", "BM07", "BM08", "BM09"));
  add("BM24", "derived", ["BM05", "BM23"], "R(BM05+BM23)", sum("BM05", "BM23"));
  add("BM25", "derived", ["BM06", "BM23"], "R(BM06+BM23)", sum("BM06", "BM23"));
  add("BM26", "derived", ["BM06", "BM25"], "R(BM06+BM25)", sum("BM06", "BM25"));
  add("BM27", "derived", ["BM07", "BM23"], "R(BM07+BM23)", sum("BM07", "BM23"));
  add("BM28", "derived", ["BM07", "BM27"], "R(BM07+BM27)", sum("BM07", "BM27"));
  add("BM29", "derived", ["BM08", "BM23"], "R(BM08+BM23)", sum("BM08", "BM23"));
  add("BM30", "derived", ["BM08", "BM29"], "R(BM08+BM29)", sum("BM08", "BM29"));
  add("BM31", "derived", ["BM09", "BM23"], "R(BM09+BM23)", sum("BM09", "BM23"));
  add("BM32", "derived", ["BM09", "BM31"], "R(BM09+BM31)", sum("BM09", "BM31"));

  add("PR-SKY", "projection", ["BM02", "BM04"], "R(BM02+BM04)", sum("BM02", "BM04"));
  add("PR-EARTH", "projection", ["BM01", "BM03"], "R(BM01+BM03)", sum("BM01", "BM03"));
  add("PR-PERSONAL", "projection", ["PR-SKY", "PR-EARTH"], "R(PR-SKY+PR-EARTH)", sum("PR-SKY", "PR-EARTH"));
  add("PR-FEMALE", "projection", ["BM07", "BM08"], "R(BM07+BM08)", sum("BM07", "BM08"));
  add("PR-MALE", "projection", ["BM06", "BM09"], "R(BM06+BM09)", sum("BM06", "BM09"));
  add("PR-SOCIAL", "projection", ["PR-FEMALE", "PR-MALE"], "R(PR-FEMALE+PR-MALE)", sum("PR-FEMALE", "PR-MALE"));
  add("PR-GENERAL", "projection", ["PR-PERSONAL", "PR-SOCIAL"], "R(PR-PERSONAL+PR-SOCIAL)", sum("PR-PERSONAL", "PR-SOCIAL"));
  add("PR-PLANETARY", "projection", ["PR-SOCIAL", "PR-GENERAL"], "R(PR-SOCIAL+PR-GENERAL)", sum("PR-SOCIAL", "PR-GENERAL"));

  const healthRows = [
    ["H01", "BM01", "BM02"], ["H02", "BM14", "BM15"], ["H03", "BM12", "BM13"],
    ["H04", "BM18", "BM19"], ["H05", "BM05", "BM05"], ["H06", "BM11", "BM10"], ["H07", "BM03", "BM04"],
  ] as const;
  const healthEmotionNodes: Record<string, string> = {
    H01: "BM06",
    H06: "BM20",
    H07: "BM09",
  };
  for (const [id, physical, energy] of healthRows) {
    if (!healthEmotionNodes[id]) {
      const emotionId = `${id}-EMOTION`;
      add(emotionId, "projection", [physical, energy], `R(${physical}+${energy})`, sum(physical, energy));
      healthEmotionNodes[id] = emotionId;
    }
  }
  add("HEALTH-PHYSICAL-TOTAL", "projection", healthRows.map((row) => row[1]), "R(sum(health physical nodes))", healthRows.reduce((total, row) => total + v(row[1]), 0));
  add("HEALTH-ENERGY-TOTAL", "projection", healthRows.map((row) => row[2]), "R(sum(health energy nodes))", healthRows.reduce((total, row) => total + v(row[2]), 0));
  add("HEALTH-EMOTION-TOTAL", "projection", healthRows.map((row) => healthEmotionNodes[row[0]]), "R(sum(health emotion nodes))", healthRows.reduce((total, row) => total + v(healthEmotionNodes[row[0]]), 0));

  const segments = [
    ["T01", "BM01", "BM06"], ["T02", "BM06", "BM02"], ["T03", "BM02", "BM07"], ["T04", "BM07", "BM03"],
    ["T05", "BM03", "BM09"], ["T06", "BM09", "BM04"], ["T07", "BM04", "BM08"], ["T08", "BM08", "BM01"],
  ] as const;
  for (const [prefix, left, right] of segments) {
    add(`${prefix}-M`, "projection", [left, right], `R(${left}+${right})`, sum(left, right));
    add(`${prefix}-L1`, "projection", [left, `${prefix}-M`], `R(${left}+${prefix}-M)`, sum(left, `${prefix}-M`));
    add(`${prefix}-L2`, "projection", [left, `${prefix}-L1`], `R(${left}+${prefix}-L1)`, sum(left, `${prefix}-L1`));
    add(`${prefix}-L3`, "projection", [`${prefix}-M`, `${prefix}-L1`], `R(${prefix}-M+${prefix}-L1)`, sum(`${prefix}-M`, `${prefix}-L1`));
    add(`${prefix}-R1`, "projection", [`${prefix}-M`, right], `R(${prefix}-M+${right})`, sum(`${prefix}-M`, right));
    add(`${prefix}-R2`, "projection", [`${prefix}-M`, `${prefix}-R1`], `R(${prefix}-M+${prefix}-R1)`, sum(`${prefix}-M`, `${prefix}-R1`));
    add(`${prefix}-R3`, "projection", [`${prefix}-R1`, right], `R(${prefix}-R1+${right})`, sum(`${prefix}-R1`, right));
  }

  const actualStructural = nodes.filter((node) => /^BM\d{2}$/.test(node.id));
  const actualProjection = nodes.filter((node) => node.kind === "projection");
  if (actualStructural.length !== STRUCTURAL_COUNT || actualProjection.length !== PROJECTION_COUNT) {
    throw new Error(`Matrix registry mismatch: ${actualStructural.length} structural, ${actualProjection.length} projection nodes.`);
  }

  const consumers = new Map<string, Set<string>>();
  for (const node of nodes) for (const parent of node.parents) {
    if (!consumers.has(parent)) consumers.set(parent, new Set());
    consumers.get(parent)!.add(node.id);
  }
  const featureConsumers: Record<string, string[]> = {
    BM05: ["CENTER", "LOVE", "MONEY", "HEALTH"],
    BM12: ["LOVE", "HEALTH"], BM13: ["LOVE", "HEALTH"],
    BM10: ["MONEY", "KARMIC_TAIL", "HEALTH"], BM11: ["MONEY", "HEALTH"],
    BM04: ["KARMIC_TAIL", "MOTHER_LINE", "HEALTH", "AGE_TIMELINE"], BM17: ["KARMIC_TAIL"],
    BM06: ["FATHER_LINE", "FAMILY_SQUARE", "AGE_TIMELINE"], BM07: ["FATHER_LINE", "FAMILY_SQUARE", "AGE_TIMELINE"],
    BM03: ["FATHER_LINE", "HEALTH", "AGE_TIMELINE"], BM08: ["MOTHER_LINE", "FAMILY_SQUARE", "AGE_TIMELINE"],
    BM09: ["MOTHER_LINE", "FAMILY_SQUARE", "AGE_TIMELINE"], BM23: ["FAMILY_CENTER"],
    BM25: ["FATHER_DESCENDANTS"], BM27: ["FATHER_DESCENDANTS"],
    BM29: ["MOTHER_DESCENDANTS"], BM31: ["MOTHER_DESCENDANTS"],
    BM26: ["TALENT_PATH"], BM28: ["TALENT_PATH"], BM30: ["TALENT_PATH"], BM32: ["TALENT_PATH"],
    "PR-SOCIAL": ["SOCIALIZATION"],
  };
  for (const [nodeId, featureIds] of Object.entries(featureConsumers)) {
    if (!consumers.has(nodeId)) consumers.set(nodeId, new Set());
    featureIds.forEach((featureId) => consumers.get(nodeId)!.add(featureId));
  }
  const finalized: MatrixNode[] = nodes
    .filter((node) => !node.id.startsWith("INPUT_"))
    .map((node) => ({
      ...node,
      lifecycle: RESERVED_NODE_IDS.has(node.id) ? "reserved" as const : "active" as const,
      consumers: [...(consumers.get(node.id) ?? [])].sort(),
    }));
  const nodeIds = new Set(finalized.map((node) => node.id));
  for (const node of finalized) for (const parent of node.parents) {
    if (!nodeIds.has(parent)) throw new Error(`Stored node ${node.id} references missing parent ${parent}.`);
  }
  const edges = finalized.flatMap((node) => node.parents.filter((parent) => nodeIds.has(parent)).map((parent) => ({ from: parent, to: node.id })));

  return {
    schemaVersion: "1.0.0",
    engineVersion: "bhumi-matrix-1.0.0",
    input: { dateOfBirth, inputHash: inputHash(dateOfBirth) },
    nodes: finalized,
    edges,
    metadata: {
      owner: "Bhumi",
      valueDomain: "arcana-1-22",
      reduction: "recursive-digit-sum",
      topology: "calculation-graph",
      structuralNodeCount: STRUCTURAL_COUNT,
      projectionNodeCount: PROJECTION_COUNT,
    },
  };
}

export function matrixNodeValue(graph: DestinyMatrixGraph, id: string): number {
  const node = graph.nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Projection references unknown matrix node: ${id}`);
  return node.value;
}
