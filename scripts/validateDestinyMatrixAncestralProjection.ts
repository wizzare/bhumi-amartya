import { readFileSync } from "node:fs";
import { buildDestinyMatrixAncestralProjection } from "../lib/destiny-matrix/ancestralProjection";
import { buildDestinyMatrixPresentation } from "../lib/destiny-matrix/presentation";
import { calculateBhumiMatrix } from "../lib/engines/calculateBhumiMatrix";
import { matrixNodeValue, reduceMatrixValue } from "../lib/engines/destinyMatrixGraph";

type Result = { name: string; passed: boolean; detail: string };
const results: Result[] = [];
const check = (name: string, passed: boolean, detail: string) => results.push({ name, passed, detail });
const equal = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const values = (nodes: Array<{ value: number }>) => nodes.map((node) => node.value);
const dates = [
  "1985-05-03", "2012-06-16", "1988-10-17", "1989-01-06", "1970-01-01",
  "1972-02-29", "1975-07-14", "1978-11-30", "1980-03-21", "1982-08-09",
  "1984-12-24", "1986-04-17", "1987-09-05", "1990-12-31", "1992-06-12",
  "1994-10-03", "1996-02-28", "1998-05-19", "2000-01-15", "2003-03-08",
  "2005-11-11", "2007-04-30", "2009-09-22", "2018-08-18", "2020-02-29",
];

const founder = calculateBhumiMatrix(dates[0]);
const projection = buildDestinyMatrixAncestralProjection(founder.graph);
const presentation = buildDestinyMatrixPresentation(founder);

check("Father Talent direct nodes", projection.fatherTalent[0].sourceNodeIds[0] === "BM06" && projection.fatherTalent[2].sourceNodeIds[0] === "BM08", projection.fatherTalent.map((node) => node.sourceNodeIds.join("+")).join(" → "));
check("Father Talent derived middle", projection.fatherTalent[1].formula === "R(BM06+BM08)" && projection.fatherTalent[1].value === reduceMatrixValue(matrixNodeValue(founder.graph, "BM06") + matrixNodeValue(founder.graph, "BM08")), projection.fatherTalent[1].formula);
check("Father Talent Founder result", equal(values(projection.fatherTalent), [8, 6, 16]), values(projection.fatherTalent).join("–"));
check("Mother Talent direct nodes", projection.motherTalent[0].sourceNodeIds[0] === "BM07" && projection.motherTalent[2].sourceNodeIds[0] === "BM09", projection.motherTalent.map((node) => node.sourceNodeIds.join("+")).join(" → "));
check("Mother Talent derived middle", projection.motherTalent[1].formula === "R(BM07+BM09)" && projection.motherTalent[1].value === reduceMatrixValue(matrixNodeValue(founder.graph, "BM07") + matrixNodeValue(founder.graph, "BM09")), projection.motherTalent[1].formula);
check("Mother Talent Founder result", equal(values(projection.motherTalent), [10, 10, 18]), values(projection.motherTalent).join("–"));
check("Father Karma formula ownership", projection.fatherKarma[0].formula === "R(BM09+BM05)" && projection.fatherKarma[1].formula === "R(BM09+AP_FATHER_KARMA_INNER)", projection.fatherKarma.map((node) => node.formula).join(" → "));
check("Father Karma Founder result", equal(values(projection.fatherKarma), [8, 8, 18]), values(projection.fatherKarma).join("–"));
check("Mother Karma formula ownership", projection.motherKarma[0].formula === "R(BM08+BM05)" && projection.motherKarma[1].formula === "R(BM08+AP_MOTHER_KARMA_INNER)", projection.motherKarma.map((node) => node.formula).join(" → "));
check("Mother Karma Founder result", equal(values(projection.motherKarma), [6, 22, 16]), values(projection.motherKarma).join("–"));
check("derived nodes are not BM nodes", [projection.fatherTalent[1], projection.motherTalent[1], ...projection.fatherKarma.slice(0, 2), ...projection.motherKarma.slice(0, 2)].every((node) => node.projectionNodeId.startsWith("AP_") && !/^BM\d+$/.test(node.projectionNodeId)), "all derived IDs use AP_ namespace");
const projectionIds = [projection.fatherTalent, projection.fatherKarma, projection.motherTalent, projection.motherKarma].flat().map((node) => node.projectionNodeId);
check("projection IDs stable", new Set(projectionIds).size === 12, `${new Set(projectionIds).size}/12 unique IDs`);
check("center-outward metadata", [projection.fatherTalent, projection.fatherKarma, projection.motherTalent, projection.motherKarma].every((group) => equal([...group].sort((a, b) => a.orderFromCenter - b.orderFromCenter).map((node) => node.orderFromCenter), [1, 2, 3])), "all groups expose order 1-2-3");
check("Love Path 7 excluded", projection.fatherKarma.every((node) => !node.sourceNodeIds.includes("BM20")) && projection.fatherTalent.every((node) => !node.sourceNodeIds.includes("BM20")), "BM20 absent from father membership");
check("visual intersection separated", projection.fatherVisualDiagonal.some((point) => point.visualPointId === "BM20" && point.value === 7 && !point.ancestryMembership), "BM20 is visual-only intersection");
const visualSource = readFileSync("components/blueprint/DestinyMatrixVisual.tsx", "utf8");
check("diagram and cards share values", visualSource.includes("matrix.ancestral.fatherKarma") && visualSource.includes("matrix.ancestral.motherKarma") && visualSource.includes("matrix.ancestral.fatherTalent") && visualSource.includes("matrix.ancestral.motherTalent") && equal(values(projection.fatherKarma), presentation.fatherLine?.karma.values) && equal(values(projection.motherKarma), presentation.motherLine?.karma.values), "diagram and cards consume ancestral projection output");
const pageSource = readFileSync("app/blueprint/destiny-matrix/page.tsx", "utf8");
check("no page-local values", !/8[–-]6[–-]16|8[–-]8[–-]18|10[–-]10[–-]18|6[–-]22[–-]16/.test(pageSource), "page renders projection output");
check("Health Matrix unchanged", equal(presentation.energyMatrix?.rows.map((row) => [row.physical, row.energy, row.emotion]), [[3,5,8],[14,18,5],[11,13,6],[19,21,4],[8,8,16],[13,21,7],[5,13,18]]) && equal(presentation.energyMatrix?.totals, { physical: 10, energy: 18, emotion: 10 }), "Founder Health Matrix 7 rows plus totals");
const graphSource = readFileSync("lib/engines/destinyMatrixGraph.ts", "utf8");
check("BM25-BM32 unchanged", graphSource.includes('add("BM25", "derived", ["BM06", "BM23"]') && graphSource.includes('add("BM31", "derived", ["BM09", "BM23"]'), "restored BM23-parent formulas retained");
const multiDate = dates.map((date) => {
  const graph = calculateBhumiMatrix(date).graph;
  const first = buildDestinyMatrixAncestralProjection(graph);
  const second = buildDestinyMatrixAncestralProjection(graph);
  return equal(first, second) && [first.fatherTalent, first.fatherKarma, first.motherTalent, first.motherKarma].flat().every((node) => node.value >= 1 && node.value <= 22);
});
check("deterministic multi-date output", multiDate.every(Boolean), `${multiDate.filter(Boolean).length}/${dates.length} dates`);
check("no circular projection dependency", projection.fatherKarma[1].sourceNodeIds.every((id) => id.startsWith("BM")) && projection.motherKarma[1].sourceNodeIds.every((id) => id.startsWith("BM")), "derived dependency closure terminates at BM graph");
check("all groups implemented", projection.status === "IMPLEMENTED — FORMULA PROVEN" && presentation.fatherLine !== null && presentation.motherLine !== null, projection.status);
check("visual geometry", equal(values(projection.motherVisualDiagonal), [16,22,6,8,18,10,10]) && equal(values(projection.fatherVisualDiagonal), [18,8,8,7,8,16,6,8]), "V3 Build 72 corridors restored");

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ status: failed.length ? "failed" : "passed", summary: { passed: results.length - failed.length, failed: failed.length }, failures: failed, results }, null, 2));
if (failed.length) process.exitCode = 1;
