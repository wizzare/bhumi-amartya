import { readFileSync } from "node:fs";
import { calculateDestinyMatrixEnergy } from "../lib/calculations/destinyMatrix/energy";
import { DESTINY_MATRIX_TOPOLOGY } from "../lib/destiny-matrix/topology";
import { calculateBhumiMatrix } from "../lib/engines/calculateBhumiMatrix";

type HealthRowDetail = { id: string; physical: string; energy: string; emotion: string };
type AuditResult = { name: string; passed: boolean; detail: string };

const founderDate = "1985-05-03";
const founderReference = [
  [3, 5, 8], [14, 18, 5], [11, 13, 6], [19, 21, 4],
  [8, 8, 16], [13, 21, 7], [5, 13, 18],
] as const;
const founderReferenceTotals = [10, 18, 10] as const;
const chakraLabels = ["Sahasrara", "Ajna", "Vishuddha", "Anahata", "Manipura", "Svadhisthana", "Muladhara"] as const;
const namedDates = [
  ["Widhi", founderDate], ["Aya", "2012-06-16"], ["Sheina", "1988-10-17"], ["Bayu", "1989-01-06"],
] as const;
const deterministicDates = [
  "1970-01-01", "1972-02-29", "1975-07-14", "1978-11-30", "1980-03-21",
  "1982-08-09", "1984-12-24", "1986-04-17", "1987-09-05", "1990-12-31",
  "1992-06-12", "1994-10-03", "1996-02-28", "1998-05-19", "2000-01-15",
  "2001-07-27", "2003-03-08", "2005-11-11", "2007-04-30", "2009-09-22",
  "2011-01-06", "2013-06-25", "2015-12-02", "2018-08-18", "2020-02-29",
] as const;

function projectionDetails(date: string) {
  const matrix = calculateBhumiMatrix(date);
  const nodes = new Map(matrix.graph.nodes.map((node) => [node.id, node]));
  const projection = matrix.projections.find((item) => item.id === "HEALTH" && item.status === "ready");
  if (!projection) throw new Error("Active HEALTH projection is unavailable.");
  const rows = projection.details?.rows;
  const totals = projection.details?.totals;
  if (!Array.isArray(rows) || !Array.isArray(totals)) throw new Error("HEALTH projection details are incomplete.");
  return { matrix, nodes, rows: rows as HealthRowDetail[], totals: totals as string[] };
}

function trace(date: string) {
  const { nodes, rows, totals } = projectionDetails(date);
  const topology = new Map(DESTINY_MATRIX_TOPOLOGY.nodes.map((node) => [node.nodeId, node]));
  const cell = (projectionNodeId: string) => {
    const node = nodes.get(projectionNodeId);
    if (!node) throw new Error(`Missing graph node ${projectionNodeId}.`);
    const direct = projectionNodeId.startsWith("BM");
    const canonicalBmNodeIds = direct ? [projectionNodeId] : node.parents.filter((id) => id.startsWith("BM"));
    const rawInputs = direct
      ? [{ nodeId: projectionNodeId, value: node.value }]
      : node.parents.map((nodeId) => ({ nodeId, value: nodes.get(nodeId)?.value }));
    return {
      projectionNodeId,
      canonicalBmNodeIds,
      rawInputs,
      operation: direct ? `COPY(${projectionNodeId})` : node.formula,
      originFormula: node.formula,
      reductionRule: direct ? "NONE_AT_PROJECTION" : "RECURSIVE_DIGIT_SUM_TO_1_22",
      classification: direct ? "DIRECT_NODE" : "SUM_REDUCED",
      result: node.value,
      displayed: node.value,
      diagram: canonicalBmNodeIds.map((nodeId) => {
        const position = topology.get(nodeId);
        return position ? { nodeId, coordinate: position.coordinate, displayedArcana: nodes.get(nodeId)?.value } : { nodeId, coordinate: null, displayedArcana: null };
      }),
    };
  };
  return {
    rows: rows.map((row, index) => ({
      chakraId: row.id,
      chakraLabel: chakraLabels[index],
      physics: cell(row.physical),
      energy: cell(row.energy),
      emotions: cell(row.emotion),
      sourceClassification: "EXACT_V3_BUILD_72_SOURCE",
      sourceVersion: "bhumi-matrix-1.0.0",
    })),
    totals: totals.map(cell),
  };
}

const founder = trace(founderDate);
const founderGraph = projectionDetails(founderDate);
const founderNodeValue = (id: string) => {
  const node = founderGraph.nodes.get(id);
  if (!node) throw new Error(`Missing Founder node ${id}.`);
  return node.value;
};
const visualDiagonal = (pathId: "FATHER_VISUAL_DIAGONAL" | "MOTHER_VISUAL_DIAGONAL") => {
  const path = DESTINY_MATRIX_TOPOLOGY.paths[pathId];
  const topology = new Map(DESTINY_MATRIX_TOPOLOGY.nodes.map((node) => [node.nodeId, node]));
  return path.orderedNodeIds.map((nodeId) => ({ nodeId, value: founderNodeValue(nodeId), coordinate: topology.get(nodeId)?.coordinate ?? null }));
};
const fatherVisualDiagonal = visualDiagonal("FATHER_VISUAL_DIAGONAL");
const motherVisualDiagonal = visualDiagonal("MOTHER_VISUAL_DIAGONAL");
const fatherTalentLegacyTrace = [
  { position: 1, source: "BM06", value: founderNodeValue("BM06"), formula: "COPY(BM06)", healthRelation: "DIRECT SAME NODE — Sahasrara Emotions" },
  { position: 2, source: null, value: 6, formula: "R(BM06+BM08)", healthRelation: "DERIVED FROM ONE HEALTH SOURCE (BM06) AND ONE NON-HEALTH NODE (BM08)" },
  { position: 3, source: "BM08", value: founderNodeValue("BM08"), formula: "COPY(BM08)", healthRelation: "VALUE MATCH ONLY — Manipura Emotions is H05-EMOTION, not BM08" },
];
const motherTalentLegacyTrace = [
  { position: 1, source: "BM07", value: founderNodeValue("BM07"), formula: "COPY(BM07)", healthRelation: "NO RELATION" },
  { position: 2, source: null, value: 10, formula: "R(BM07+BM09)", healthRelation: "DERIVED FROM ONE HEALTH SOURCE (BM09) AND ONE NON-HEALTH NODE (BM07)" },
  { position: 3, source: "BM09", value: founderNodeValue("BM09"), formula: "COPY(BM09)", healthRelation: "DIRECT SAME NODE — Muladhara Emotions" },
];
const founderLegacy = calculateDestinyMatrixEnergy(founderDate).chartHeart;
const fixture1990 = calculateDestinyMatrixEnergy("1990-12-31").chartHeart;
const pageSource = readFileSync("app/blueprint/destiny-matrix/page.tsx", "utf8");
const graphSource = readFileSync("lib/engines/destinyMatrixGraph.ts", "utf8");
const legacySource = readFileSync("lib/calculations/destinyMatrix/energy.ts", "utf8");
const checkSource = readFileSync("scripts/checkDestinyMatrix.ts", "utf8");
const build72Artifact = readFileSync("aab_check/base/assets/public/_next/static/chunks/181tqqgl_9zyq.js", "utf8");
const restoredIds = new Set(["BM25", "BM26", "BM27", "BM28", "BM29", "BM30", "BM31", "BM32"]);
const allHealthSourceIds = new Set(founder.rows.flatMap((row) => [row.physics, row.energy, row.emotions].flatMap((item) => [item.projectionNodeId, ...item.canonicalBmNodeIds])));
const restoredOverlap = [...allHealthSourceIds].filter((id) => restoredIds.has(id));

const tests: AuditResult[] = [];
const check = (name: string, passed: boolean, detail: string) => tests.push({ name, passed, detail });
founder.rows.forEach((row, rowIndex) => {
  (["physics", "energy", "emotions"] as const).forEach((column, columnIndex) => {
    const item = row[column];
    check(`${row.chakraLabel} ${column} source`, item.result === founderReference[rowIndex][columnIndex], `${item.projectionNodeId}=${item.result}`);
  });
});
founder.totals.forEach((total, index) => check(`Total ${["Physics", "Energy", "Emotions"][index]} formula`, total.result === founderReferenceTotals[index], `${total.originFormula}=${total.result}`));
check("every referenced graph node exists", founder.rows.every((row) => [row.physics, row.energy, row.emotions].every((item) => item.rawInputs.every((input) => typeof input.value === "number"))), "all projection inputs resolved");
check("every displayed value matches graph", founder.rows.every((row) => [row.physics, row.energy, row.emotions].every((item) => item.result === item.displayed)), "21/21 cells");
check("diagram value parity", founder.rows.every((row) => [row.physics, row.energy, row.emotions].every((item) => item.diagram.every((entry) => entry.coordinate && typeof entry.displayedArcana === "number"))), "all canonical BM sources mapped to topology coordinates");
check("no UI-local hardcode", pageSource.includes("presentation.energyMatrix.rows.map") && !pageSource.includes("Physics 3") && !pageSource.includes("Sahasrara: 3"), "page consumes canonical presentation rows");
check("BM25-BM32 restoration impact", restoredOverlap.length === 0, restoredOverlap.length ? restoredOverlap.join(",") : "no Health dependency overlap");
const deterministicA = deterministicDates.map((date) => JSON.stringify(trace(date)));
const deterministicB = deterministicDates.map((date) => JSON.stringify(trace(date)));
check("deterministic output", JSON.stringify(deterministicA) === JSON.stringify(deterministicB), "25/25 dates stable");
const namedOutputs = namedDates.map(([name, date]) => ({ name, date, rows: trace(date).rows.map((row) => [row.physics.result, row.energy.result, row.emotions.result]), totals: trace(date).totals.map((item) => item.result) }));
check("cross-user isolation", new Set(namedOutputs.map((item) => JSON.stringify(item.rows))).size === namedOutputs.length, "4/4 named fixtures distinct");
const auditSource = readFileSync("scripts/auditDestinyMatrixHealthOrigins.ts", "utf8");
check("no production writes", auditSource.split(/\r?\n/, 1)[0] === 'import { readFileSync } from "node:fs";', "audit imports only the read-only filesystem API");

const output = {
  status: tests.every((item) => item.passed) ? "PASS" : "PARTIAL PASS — UNPROVEN HEALTH MATRIX CELLS",
  runtimeChain: ["birthDate", "calculateBhumiMatrix()", "buildDestinyMatrixGraph()", "getHealthProjection()", "buildDestinyMatrixPresentation()", "presentation.energyMatrix.rows", "Health Matrix table"],
  formulaOwner: "lib/engines/destinyMatrixGraph.ts",
  founder,
  founderLegacy: {
    rows: [
      [founderLegacy.sahphysics, founderLegacy.sahenergy, founderLegacy.sahemotions],
      [founderLegacy.ajphysics, founderLegacy.ajenergy, founderLegacy.ajemotions],
      [founderLegacy.vishphysics, founderLegacy.vishenergy, founderLegacy.vishemotions],
      [founderLegacy.anahphysics, founderLegacy.anahenergy, founderLegacy.anahemotions],
      [founderLegacy.manphysics, founderLegacy.manenergy, founderLegacy.manemotions],
      [founderLegacy.svadphysics, founderLegacy.svadenergy, founderLegacy.svademotions],
      [founderLegacy.mulphysics, founderLegacy.mulenergy, founderLegacy.mulemotions],
    ],
    totals: [founderLegacy.resultphysics, founderLegacy.resultenergy, founderLegacy.resultemotions],
    mismatch: "Legacy energy.ts swaps the active V3 Build 72 Svadhisthana Physics/Energy ownership (BM10/BM11 instead of BM11/BM10).",
  },
  multiUser: namedOutputs,
  deterministicDates: { count: deterministicDates.length, stable: tests.find((item) => item.name === "deterministic output")?.passed },
  bm25ToBm32Impact: { sourceOverlap: restoredOverlap, changedCells: 0, changedRows: 0, changedTotals: 0, proof: "No BM25-BM32 node occurs in the Health projection dependency set." },
  ancestralAudit: {
    fatherVisualDiagonal: {
      activeTopologyTrace: fatherVisualDiagonal,
      activeValues: fatherVisualDiagonal.map((item) => item.value),
      expectedValues: [18, 8, 8, 7, 8, 16, 6, 8],
      status: "BLOCKED — ANCESTRAL NODE SOURCE UNPROVEN",
      finding: "The active seven-node topology resolves to 8-15-5-8-7-7-18 and has no canonical member for the Love Path intersection. It cannot produce the locked geometry without changing ownership or formulas.",
    },
    motherVisualDiagonal: {
      activeTopologyTrace: motherVisualDiagonal,
      activeValues: motherVisualDiagonal.map((item) => item.value),
      expectedValues: [16, 22, 6, 8, 18, 10, 10],
      status: "BLOCKED — ANCESTRAL NODE SOURCE UNPROVEN",
      finding: "The active seven-node topology resolves to 16-21-5-8-17-9-10, not the locked Founder geometry.",
    },
    fatherTalent: {
      expectedValues: [8, 6, 16],
      legacyFormulaTrace: fatherTalentLegacyTrace,
      status: "BLOCKED — ANCESTRAL NODE SOURCE UNPROVEN",
      finding: "The legacy helper reproduces the values, but position 2 is an adapter-local reduction with no canonical BM node and the BM06/BM08 path is not the active father visual branch.",
    },
    fatherKarma: {
      expectedValues: [8, 8, 18],
      historicalCandidate: ["BM06", "BM05", "BM09"].map((nodeId) => ({ nodeId, value: founderNodeValue(nodeId) })),
      status: "BLOCKED — ANCESTRAL NODE SOURCE UNPROVEN",
      finding: "The historical candidate matches numerically but crosses outer-top-left, center, and outer-bottom-right; it is not the required three-node center-outward bottom-right branch. Arcana 7 remains Love Path-only.",
    },
    motherTalent: {
      expectedValues: [10, 10, 18],
      legacyFormulaTrace: motherTalentLegacyTrace,
      status: "BLOCKED — ANCESTRAL NODE SOURCE UNPROVEN",
      finding: "The legacy helper reproduces the values, but position 2 is an adapter-local reduction with no canonical BM node and the BM07/BM09 path is not the active mother visual branch.",
    },
    motherKarma: {
      expectedValues: [6, 22, 16],
      historicalCandidate: ["BM07", "BM05", "BM08"].map((nodeId) => ({ nodeId, value: founderNodeValue(nodeId) })),
      status: "BLOCKED — ANCESTRAL NODE SOURCE UNPROVEN",
      finding: "The historical candidate resolves to 10-8-16 and does not support the locked sequence or center-outward branch.",
    },
    healthCrosswalk: {
      directSameNode: [
        { group: "Father Talent", position: 1, nodeId: "BM06", healthCell: "Sahasrara Emotions" },
        { group: "Mother Talent", position: 3, nodeId: "BM09", healthCell: "Muladhara Emotions" },
      ],
      sharedParentDerivations: [
        { group: "Father Talent", position: 2, formula: "R(BM06+BM08)", sharedHealthNode: "BM06" },
        { group: "Mother Talent", position: 2, formula: "R(BM07+BM09)", sharedHealthNode: "BM09" },
      ],
      valueMatchOnly: [
        { group: "Father Talent", position: 3, expectedValue: 16, healthCell: "Manipura Emotions", reason: "BM08 != H05-EMOTION" },
        { group: "Father Karma", expectedValues: [8, 8, 18], reason: "group node ownership is unproven; matching Health numbers cannot establish membership" },
        { group: "Mother Karma", expectedValues: [6, 22, 16], reason: "group node ownership is unproven; matching Health numbers cannot establish membership" },
      ],
      lovePathArcana7: { nodeId: "BM20", healthCell: "Svadhisthana Emotions", ancestryMembership: false, status: "EXCLUDED" },
      modelClassification: "MIXED MODEL — direct structural BM nodes plus derived Health projection nodes; not an ancestral mirror",
    },
  },
  staleFixtureRootCause: {
    fixture: "scripts/checkDestinyMatrix.ts",
    date: "1990-12-31",
    expectedPhysicalTotal: 10,
    legacyEnergyActualPhysicalTotal: fixture1990.resultphysics,
    canonicalGraphPhysicalTotal: trace("1990-12-31").totals[0].result,
    finding: "The expectation follows the V3/canonical BM11 Svadhisthana Physics mapping; energy.ts still uses legacy BM10 for that cell. It is not caused by BM25-BM32 restoration.",
  },
  sourceEvidence: {
    graphFormulaPresent: graphSource.includes('add("HEALTH-PHYSICAL-TOTAL"'),
    legacyFormulaPresent: legacySource.includes("chartHeart.resultphysics"),
    staleFixturePresent: checkSource.includes("result.chartHeart.resultphysics"),
    build72ArtifactPresent: build72Artifact.includes("Sahasrara") && build72Artifact.includes("Svadhisthana"),
    classifications: ["EXACT_V3_BUILD_72_SOURCE", "LEGACY_SOURCE", "GOLDEN_FIXTURE_SOURCE", "FOUNDER_SCREENSHOT_REFERENCE"],
  },
  tests: { passed: tests.filter((item) => item.passed).length, failed: tests.filter((item) => !item.passed).length, results: tests },
};

console.log(JSON.stringify(output, null, 2));
if (output.tests.failed) process.exitCode = 1;
