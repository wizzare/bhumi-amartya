import assert from "node:assert/strict";
import {
  analyzeAstrocartographyLocation,
  calculateAstrocartography,
  nearestPointOnMeridian,
  normalizeMapLongitude,
} from "../lib/astrocartography/calculateAstrocartography";
import type { AstrocartographyLine, GeoCoordinate } from "../lib/astrocartography/types";

const founder = { birthDate: "1985-05-03", birthTime: "23:45", timezone: "+07:00", latitude: -6.2088, longitude: 106.8456, birthCity: "Jakarta" };
const result = calculateAstrocartography(founder);
const line = (id: string) => result.lines.find((item) => item.lineId === id)!;
const distance = (id: string, latitude: number, longitude: number) => analyzeAstrocartographyLocation([line(id)], latitude, longitude)!.nearestLines[0];
const checks: Array<[string, () => void]> = [];
const check = (name: string, fn: () => void) => checks.push([name, fn]);

const customMeridian = (lineId: string, angleType: "MC" | "IC", longitude: number, south = -89, north = 89): AstrocartographyLine => ({
  lineId, body: "Sun", angleType, geometryType: "MultiLineString", coordinates: [[[longitude, south], [longitude, north]]],
  longitudeReference: "-180_to_180_east_positive", validLatitudeRange: [south, north], sourceVersion: "astrocartography-r8a-1", calculationStatus: "calculated",
});

function radians(value: number) { return value * Math.PI / 180; }
function haversine(left: GeoCoordinate, right: GeoCoordinate) {
  const dLat = radians(right[1] - left[1]);
  const dLon = radians(normalizeMapLongitude(right[0] - left[0]));
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(left[1])) * Math.cos(radians(right[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(a)));
}
function legacyCurveDistance(location: GeoCoordinate, target: AstrocartographyLine) {
  let nearest = Infinity;
  for (const segment of target.coordinates) for (let index = 0; index < segment.length - 1; index++) for (let step = 0; step <= 16; step++) {
    const fraction = step / 16; const start = segment[index]; const end = segment[index + 1];
    const candidate: GeoCoordinate = [normalizeMapLongitude(start[0] + normalizeMapLongitude(end[0] - start[0]) * fraction), start[1] + (end[1] - start[1]) * fraction];
    nearest = Math.min(nearest, haversine(location, candidate));
  }
  return Math.round(nearest);
}

check("01 Mumbai Venus IC", () => assert.ok(Math.abs(distance("venus-ic", 19.018936, 72.855043).approximateDistanceKm - 56) <= 3));
check("02 Tanjungpandan Sun IC", () => assert.ok(Math.abs(distance("sun-ic", -2.750027, 107.650008).approximateDistanceKm - 34) <= 3));
check("03 Yogyakarta Sun IC", () => assert.ok(Math.abs(distance("sun-ic", -7.7956, 110.3695).approximateDistanceKm - 266) <= 4));
check("04 antimeridian meridian", () => assert.ok(Math.abs(nearestPointOnMeridian([-179.8, 0], customMeridian("sun-mc", "MC", 179.8))!.distanceKm - 44.48) < 0.2));
check("05 city exactly on MC", () => assert.equal(nearestPointOnMeridian([20, 10], customMeridian("sun-mc", "MC", 20))!.distanceKm, 0));
check("06 city exactly on IC", () => assert.equal(nearestPointOnMeridian([-160, -10], customMeridian("sun-ic", "IC", -160))!.distanceKm, 0));
check("07 north latitude clamp", () => { const nearest = nearestPointOnMeridian([20, 30], customMeridian("sun-mc", "MC", 20, -20, 20))!; assert.equal(nearest.nearestLatitude, 20); assert.ok(Math.abs(nearest.distanceKm - 1111.95) < 0.2); });
check("08 south latitude clamp", () => { const nearest = nearestPointOnMeridian([20, -30], customMeridian("sun-mc", "MC", 20, -20, 20))!; assert.equal(nearest.nearestLatitude, -20); assert.ok(Math.abs(nearest.distanceKm - 1111.95) < 0.2); });
check("09 near-pole city", () => { const nearest = nearestPointOnMeridian([0, 89.5], customMeridian("sun-mc", "MC", 0))!; assert.equal(nearest.nearestLatitude, 89); assert.ok(Math.abs(nearest.distanceKm - 55.6) < 0.2); });
check("10 wrapped longitude", () => assert.ok(nearestPointOnMeridian([-179.8, 0], customMeridian("sun-mc", "MC", 179.8))!.distanceKm < 50));
check("11 MC IC opposition", () => { const mc = line("sun-mc").coordinates[0][0][0]; const ic = line("sun-ic").coordinates[0][0][0]; assert.equal(Math.abs(normalizeMapLongitude(ic - mc)), 180); });
check("12 ASC DSC unchanged", () => { for (const id of ["sun-asc", "sun-dsc", "jupiter-asc", "jupiter-dsc"]) { const target = line(id); const location: GeoCoordinate = [112.608069, -7.978046]; assert.equal(analyzeAstrocartographyLocation([target], location[1], location[0])!.nearestLines[0].approximateDistanceKm, legacyCurveDistance(location, target)); assert.equal(nearestPointOnMeridian(location, target), null); } });
check("13 return contract", () => assert.deepEqual(Object.keys(nearestPointOnMeridian([20, 10], customMeridian("sun-mc", "MC", 20))!).sort(), ["calculationStatus", "distanceKm", "distanceMethod", "geometryType", "lineId", "nearestLatitude", "nearestLongitude"].sort()));
check("14 deterministic ranking", () => assert.deepEqual(analyzeAstrocartographyLocation(result.lines, -2.750027, 107.650008), analyzeAstrocartographyLocation(result.lines, -2.750027, 107.650008)));

let passed = 0;
for (const [name, fn] of checks) { try { fn(); passed += 1; console.log(`PASS ${name}`); } catch (error) { console.error(`FAIL ${name}`); throw error; } }
console.log(`Astrocartography analytic meridian: ${passed}/${checks.length} checks passed`);
