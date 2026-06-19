import { calculateBhumiMatrix } from "../lib/engines/calculateBhumiMatrix";
import { DESTINY_MATRIX_GOLDEN_FIXTURES } from "../lib/engines/destinyMatrixGoldenFixtures";
import {
  getHealthProjection,
  getKarmicProjection,
  getLoveProjection,
  getMoneyProjection,
  getSocialProjection,
  getTimelineProjection,
} from "../lib/engines/destinyMatrixProjection";
import { compareCanonicalMatrixWithLegacy } from "../lib/engines/legacyMatrixComparison";
import type { DestinyMatrixGraph, MatrixNode } from "../lib/types/destinyMatrix";

type Check = { name: string; status: "pass" | "fail"; detail: string };
const checks: Check[] = [];
const check = (name: string, condition: boolean, detail: string) =>
  checks.push({ name, status: condition ? "pass" : "fail", detail });

function hasCycle(graph: DestinyMatrixGraph): boolean {
  const parents = new Map(graph.nodes.map((node) => [node.id, node.parents]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const parent of parents.get(id) ?? []) if (visit(parent)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return graph.nodes.some((node) => visit(node.id));
}

function reachableNodeIds(graph: DestinyMatrixGraph): Set<string> {
  const children = new Map<string, string[]>();
  for (const edge of graph.edges) children.set(edge.from, [...(children.get(edge.from) ?? []), edge.to]);
  const reached = new Set<string>();
  const queue = graph.nodes.filter((node) => node.kind === "root").map((node) => node.id);
  while (queue.length) {
    const id = queue.shift()!;
    if (reached.has(id)) continue;
    reached.add(id);
    queue.push(...(children.get(id) ?? []));
  }
  return reached;
}

function normalizedFormula(node: MatrixNode): string {
  return `${node.parents.slice().sort().join("+")}|${node.formula.replace(/\s+/g, "")}`;
}

const fixtureResults = [];
for (const fixture of DESTINY_MATRIX_GOLDEN_FIXTURES) {
  const storage = calculateBhumiMatrix(fixture.dateOfBirth);
  const graph = storage.graph;
  const structural = graph.nodes.filter((node) => /^BM\d{2}$/.test(node.id));
  const roots = structural.filter((node) => node.kind === "root");
  const derived = structural.filter((node) => node.kind === "derived");
  const projectionNodes = graph.nodes.filter((node) => node.kind === "projection");
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  const missingParents = graph.nodes.flatMap((node) => node.parents.filter((parent) => !nodeIds.has(parent)).map((parent) => `${node.id}<-${parent}`));
  const reached = reachableNodeIds(graph);
  const unreachable = graph.nodes.filter((node) => !reached.has(node.id)).map((node) => node.id);
  const deadStructural = structural.filter((node) => node.lifecycle === "active" && node.consumers.length === 0).map((node) => node.id);
  const reservedStructural = structural.filter((node) => node.lifecycle === "reserved").map((node) => node.id);
  const duplicateFormulaGroups = Object.values(Object.groupBy(graph.nodes, normalizedFormula))
    .filter((group): group is MatrixNode[] => Boolean(group && group.length > 1))
    .map((group) => group.map((node) => node.id));

  check(`${fixture.name}: node count`, graph.nodes.length === 103, `received ${graph.nodes.length}`);
  const expectedEdges = graph.nodes.reduce((total, node) => total + node.parents.length, 0);
  check(`${fixture.name}: edge count`, graph.edges.length === expectedEdges, `received ${graph.edges.length}; expected from parent registry ${expectedEdges}`);
  check(`${fixture.name}: root count`, roots.length === 3, `received ${roots.length}`);
  check(`${fixture.name}: derived count`, derived.length === 29, `received ${derived.length}`);
  check(`${fixture.name}: projection node count`, projectionNodes.length === 71, `received ${projectionNodes.length}`);
  check(`${fixture.name}: no missing parents`, missingParents.length === 0, missingParents.join(", ") || "none");
  check(`${fixture.name}: acyclic`, !hasCycle(graph), hasCycle(graph) ? "cycle detected" : "none");
  check(`${fixture.name}: all nodes reachable`, unreachable.length === 0, unreachable.join(", ") || "all reached");
  check(`${fixture.name}: no duplicate formulas`, duplicateFormulaGroups.length === 0, JSON.stringify(duplicateFormulaGroups));
  check(`${fixture.name}: no dead structural nodes`, deadStructural.length === 0, deadStructural.join(", ") || "none");
  check(`${fixture.name}: reserved node registry`, JSON.stringify(reservedStructural) === JSON.stringify(["BM16", "BM21", "BM22", "BM24"]), reservedStructural.join(", "));

  const projectionSet = [
    getLoveProjection(graph), getMoneyProjection(graph), getHealthProjection(graph),
    getKarmicProjection(graph), getSocialProjection(graph),
  ];
  const timeline = getTimelineProjection(graph);
  check(`${fixture.name}: required projections generated`, projectionSet.every((projection) => projection.status === "ready") && timeline.status === "calculated_unmapped", "love/money/health/karmic/social/timeline");
  check(`${fixture.name}: projection references exist`, [...projectionSet.flatMap((projection) => projection.nodeIds), ...timeline.nodeIds].every((id) => nodeIds.has(id)), "all references checked");

  const topLevelKeys = Object.keys(storage).sort();
  check(`${fixture.name}: storage top-level fields`, JSON.stringify(topLevelKeys) === JSON.stringify(["graph", "metadata", "projections", "timeline"]), topLevelKeys.join(", "));
  check(`${fixture.name}: required storage fields`, Boolean(storage.graph && storage.projections && storage.metadata), "graph/projections/metadata");
  const serialized = JSON.stringify(storage);
  check(`${fixture.name}: no visual-only fields`, !/(coordinate|position|display|visual|\\bx\\b|\\by\\b)/i.test(serialized), "serialized key scan");
  const timelineProjection = storage.projections.find((projection) => projection.id === "AGE_TIMELINE");
  check(`${fixture.name}: no duplicated timeline storage`, !timelineProjection, timelineProjection ? "AGE_TIMELINE duplicated in projections" : "timeline owns references");

  const knownFeatureConsumers = new Set([
    "CENTER", "LOVE", "MONEY", "HEALTH", "KARMIC_TAIL", "MOTHER_LINE", "FATHER_LINE",
    "AGE_TIMELINE", "FAMILY_SQUARE", "FAMILY_CENTER", "FATHER_DESCENDANTS",
    "MOTHER_DESCENDANTS", "TALENT_PATH", "SOCIALIZATION",
  ]);
  const orphanConsumers = graph.nodes.flatMap((node) =>
    node.consumers.filter((consumer) => !nodeIds.has(consumer) && !knownFeatureConsumers.has(consumer))
      .map((consumer) => `${node.id}->${consumer}`),
  );
  check(`${fixture.name}: no orphan consumers`, orphanConsumers.length === 0, orphanConsumers.join(", ") || "none");

  const legacy = compareCanonicalMatrixWithLegacy(fixture.dateOfBirth);
  fixtureResults.push({
    name: fixture.name,
    dateOfBirth: fixture.dateOfBirth,
    graphGenerated: true,
    projectionGenerated: projectionSet.every((projection) => projection.status === "ready"),
    storageGenerated: true,
    missingParents,
    unreachable,
    deadStructuralNodes: deadStructural,
    reservedStructuralNodes: reservedStructural,
    duplicateFormulaGroups,
    legacyMatch: legacy.matches,
    legacyDifferences: legacy.differences,
  });
}

const projectionSource = require("fs").readFileSync("lib/engines/destinyMatrixProjection.ts", "utf8");
check("Projection module has no calculation imports", !/reduceMatrixValue|reduceNumber/.test(projectionSource), "reducer import scan");
const arithmeticTokens = ["Math.", ".reduce(", "reduceMatrixValue(", "reduceNumber("];
check("Projection module has no arithmetic formulas", arithmeticTokens.every((token) => !projectionSource.includes(token)), "arithmetic token scan");

const failed = checks.filter((item) => item.status === "fail");
console.log(JSON.stringify({
  status: failed.length === 0 ? "passed" : "requires_remediation",
  summary: { passed: checks.length - failed.length, failed: failed.length },
  failures: failed,
  fixtureResults,
}, null, 2));
