import { buildDestinyMatrixGraph, matrixNodeValue } from "../lib/engines/destinyMatrixGraph";
import {
  getAllDestinyMatrixProjections,
  getFatherProjection,
  getKarmicProjection,
  getLoveProjection,
  getMoneyProjection,
  getMotherProjection,
  getSocialProjection,
  getSoulProjection,
  getSpiritualProjection,
} from "../lib/engines/destinyMatrixProjection";
import { DESTINY_MATRIX_GOLDEN_FIXTURES } from "../lib/engines/destinyMatrixGoldenFixtures";
import { compareCanonicalMatrixWithLegacy } from "../lib/engines/legacyMatrixComparison";

const projectionValues = (graph: ReturnType<typeof buildDestinyMatrixGraph>, nodeIds: string[]) =>
  nodeIds.map((id) => matrixNodeValue(graph, id));
const stable = (graph: ReturnType<typeof buildDestinyMatrixGraph>) => JSON.stringify(graph);

const results = [];
for (const fixture of DESTINY_MATRIX_GOLDEN_FIXTURES) {
  const first = buildDestinyMatrixGraph(fixture.dateOfBirth);
  const second = buildDestinyMatrixGraph(fixture.dateOfBirth);
  const structural = Array.from({ length: 32 }, (_, index) =>
    matrixNodeValue(first, `BM${String(index + 1).padStart(2, "0")}`),
  );
  if (JSON.stringify(structural) !== JSON.stringify(fixture.structuralValues)) throw new Error(`${fixture.name}: structural fixture mismatch`);
  if (stable(first) !== stable(second)) throw new Error(`${fixture.name}: non-deterministic graph`);
  if (first.nodes.filter((node) => /^BM\d{2}$/.test(node.id)).length !== 32) throw new Error(`${fixture.name}: structural count`);
  if (first.nodes.filter((node) => node.kind === "projection").length !== 71) throw new Error(`${fixture.name}: projection count`);
  const center = getAllDestinyMatrixProjections(first).find((projection) => projection.id === "CENTER");
  if (!center) throw new Error(`${fixture.name}: center projection missing`);
  const checks = {
    center: projectionValues(first, center.nodeIds),
    love: projectionValues(first, getLoveProjection(first).nodeIds),
    money: projectionValues(first, getMoneyProjection(first).nodeIds),
    karmic: projectionValues(first, getKarmicProjection(first).nodeIds),
    father: projectionValues(first, getFatherProjection(first).nodeIds),
    mother: projectionValues(first, getMotherProjection(first).nodeIds),
    social: projectionValues(first, getSocialProjection(first).nodeIds),
  };
  if (JSON.stringify(checks) !== JSON.stringify(fixture.projections)) throw new Error(`${fixture.name}: projection fixture mismatch`);
  if (getSoulProjection(first).status !== "unsupported") throw new Error(`${fixture.name}: soul must be unsupported`);
  if (getSpiritualProjection(first).status !== "unsupported") throw new Error(`${fixture.name}: spiritual must be unsupported`);
  const legacy = compareCanonicalMatrixWithLegacy(fixture.dateOfBirth);
  results.push({ name: fixture.name, dateOfBirth: fixture.dateOfBirth, center: checks.center[0], love: checks.love, money: checks.money, legacyMatch: legacy.matches });
}

console.log(JSON.stringify({ status: "passed", results }, null, 2));
