// Node's native TypeScript runner resolves the concrete .ts file at runtime.
// @ts-expect-error allowImportingTsExtensions is intentionally not enabled for the app build.
const { calculateDestinyMatrixEnergy } = await import("../lib/calculations/destinyMatrix/energy.ts");

const result = calculateDestinyMatrixEnergy("1990-12-31");

const checks: Array<[string, number, number]> = [
  ["result.points.apoint", result.points.apoint, 4],
  ["result.points.bpoint", result.points.bpoint, 12],
  ["result.points.cpoint", result.points.cpoint, 19],
  ["result.points.dpoint", result.points.dpoint, 8],
  ["result.points.epoint", result.points.epoint, 7],
  ["result.points.upoint", result.points.upoint, 5],
  ["result.purposes.generalpurpose", result.purposes.generalpurpose, 12],
  ["result.purposes.planetarypurpose", result.purposes.planetarypurpose, 17],
  ["result.chartHeart.resultphysics", result.chartHeart.resultphysics, 10],
  ["result.chartHeart.resultenergy", result.chartHeart.resultenergy, 10],
  ["result.chartHeart.resultemotions", result.chartHeart.resultemotions, 11],
  ["result.years.afpoint", result.years.afpoint, 20],
  ["result.years.af1point", result.years.af1point, 6],
  ["result.years.fbpoint", result.years.fbpoint, 10],
];

for (const [label, actual, expected] of checks) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

console.log("Destiny Matrix reference check passed.");

export {};
