import * as Astronomy from "astronomy-engine";
import { calculateNatalBasics, type NatalBasics, type NatalBasicsInput } from "@/lib/astrology/calculateNatalBasics";
import { birthDateTimeToUtcDate } from "@/lib/humandesign/calculateHumanDesignType";
import type { PlanetaryPosition } from "@/lib/types/blueprint";
import type {
  AstrocartographyAngle, AstrocartographyBody, AstrocartographyBodyName, AstrocartographyLine,
  AstrocartographyLocationAnalysis, AstrocartographyNearestLine, AstrocartographyResult, GeoCoordinate,
} from "./types";

const BODY_ENUM: Record<AstrocartographyBodyName, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun, Moon: Astronomy.Body.Moon, Mercury: Astronomy.Body.Mercury, Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars, Jupiter: Astronomy.Body.Jupiter, Saturn: Astronomy.Body.Saturn, Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune, Pluto: Astronomy.Body.Pluto,
};
export const ASTROCARTOGRAPHY_BODIES = Object.keys(BODY_ENUM) as AstrocartographyBodyName[];
export const ASTROCARTOGRAPHY_ANGLES: AstrocartographyAngle[] = ["MC", "IC", "ASC", "DSC"];
const LATITUDE_STEP = 2 as const;
const EARTH_RADIUS_KM = 6371.0088;

type StoredNatal = Partial<NatalBasics> & { risingSign?: string; planets?: Partial<Record<AstrocartographyBodyName, PlanetaryPosition>> };

export function normalizeMapLongitude(value: number): number {
  const normalized = ((value + 180) % 360 + 360) % 360 - 180;
  return normalized === -180 && value > 0 ? 180 : normalized;
}

function validTimezone(value?: string | null): boolean {
  if (!value) return false;
  if (/^[+-](?:0\d|1\d|2[0-3]):[0-5]\d$/.test(value)) return true;
  try { new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date(0)); return true; } catch { return false; }
}

function validBirthTime(value?: string | null): boolean {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value || "");
  return Boolean(match && Number(match[1]) <= 23 && Number(match[2]) <= 59 && Number(match[3] || 0) <= 59);
}

function completeInput(input: NatalBasicsInput): boolean {
  return Boolean(
    /^\d{4}-\d{2}-\d{2}$/.test(input.birthDate || "") && validBirthTime(input.birthTime) && validTimezone(input.timezone) &&
    typeof input.latitude === "number" && Number.isFinite(input.latitude) && input.latitude >= -90 && input.latitude <= 90 &&
    typeof input.longitude === "number" && Number.isFinite(input.longitude) && input.longitude >= -180 && input.longitude <= 180,
  );
}

function canonicalNatal(input: NatalBasicsInput, stored?: StoredNatal | null): NatalBasics & StoredNatal {
  const calculated = calculateNatalBasics(input);
  if (!stored?.planets || !Object.keys(stored.planets).length) return calculated;
  return { ...calculated, ...stored, planets: stored.planets as NatalBasics["planets"], status: calculated.status, source: calculated.source };
}

function equatorialOfDate(body: Astronomy.Body, instant: Date) {
  const j2000 = Astronomy.GeoVector(body, instant, true);
  const ofDate = Astronomy.RotateVector(Astronomy.Rotation_EQJ_EQD(instant), j2000);
  const coordinates = Astronomy.EquatorFromVector(ofDate);
  return { rightAscensionHours: coordinates.ra, declinationDegrees: coordinates.dec };
}

function splitAntimeridian(points: GeoCoordinate[]): GeoCoordinate[][] {
  const segments: GeoCoordinate[][] = [];
  let current: GeoCoordinate[] = [];
  for (const point of points) {
    const previous = current[current.length - 1];
    if (previous && Math.abs(point[0] - previous[0]) > 180) {
      if (current.length >= 2) segments.push(current);
      current = [point];
    } else {
      current.push(point);
    }
  }
  if (current.length >= 2) segments.push(current);
  return segments;
}

function riseSetSegments(body: AstrocartographyBody, gastDegrees: number, angle: "ASC" | "DSC"): GeoCoordinate[][] {
  const points: Array<GeoCoordinate | null> = [];
  const declination = body.declinationDegrees * Math.PI / 180;
  const raDegrees = body.rightAscensionHours * 15;
  for (let latitude = -88; latitude <= 88; latitude += LATITUDE_STEP) {
    const phi = latitude * Math.PI / 180;
    const cosHourAngle = -Math.tan(phi) * Math.tan(declination);
    if (Math.abs(cosHourAngle) > 1) { points.push(null); continue; }
    const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHourAngle))) * 180 / Math.PI;
    const signedHourAngle = angle === "ASC" ? -hourAngle : hourAngle;
    points.push([normalizeMapLongitude(raDegrees + signedHourAngle - gastDegrees), latitude]);
  }
  const validRuns: GeoCoordinate[][] = [];
  let run: GeoCoordinate[] = [];
  for (const point of points) {
    if (!point) { if (run.length >= 2) validRuns.push(run); run = []; continue; }
    run.push(point);
  }
  if (run.length >= 2) validRuns.push(run);
  return validRuns.flatMap(splitAntimeridian);
}

function lineFor(body: AstrocartographyBody, angleType: AstrocartographyAngle, gastDegrees: number): AstrocartographyLine {
  const raDegrees = body.rightAscensionHours * 15;
  const meridian = normalizeMapLongitude(raDegrees - gastDegrees + (angleType === "IC" ? 180 : 0));
  const coordinates = angleType === "MC" || angleType === "IC"
    ? [[[meridian, -89], [meridian, 89]] as GeoCoordinate[]]
    : riseSetSegments(body, gastDegrees, angleType);
  const latitudes = coordinates.flat().map((coordinate) => coordinate[1]);
  return {
    lineId: `${body.body.toLowerCase()}-${angleType.toLowerCase()}`,
    body: body.body, angleType, geometryType: "MultiLineString", coordinates,
    longitudeReference: "-180_to_180_east_positive",
    validLatitudeRange: latitudes.length ? [Math.min(...latitudes), Math.max(...latitudes)] : null,
    sourceVersion: "astrocartography-r8a-1", calculationStatus: "calculated",
  };
}

function radians(value: number) { return value * Math.PI / 180; }
function haversineKm(left: GeoCoordinate, right: GeoCoordinate): number {
  const dLat = radians(right[1] - left[1]);
  const dLon = radians(normalizeMapLongitude(right[0] - left[0]));
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(left[1])) * Math.cos(radians(right[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export type MeridianNearestPointResult = {
  distanceKm: number;
  nearestLatitude: number;
  nearestLongitude: number;
  lineId: string;
  geometryType: "constant-longitude-meridian";
  distanceMethod: "ANALYTIC_MERIDIAN_GEODESIC";
  calculationStatus: "calculated";
};

export function nearestPointOnMeridian(location: GeoCoordinate, line: AstrocartographyLine): MeridianNearestPointResult | null {
  if (line.angleType !== "MC" && line.angleType !== "IC") return null;
  let nearest: MeridianNearestPointResult | null = null;
  for (const segment of line.coordinates) {
    if (!segment.length) continue;
    const longitude = normalizeMapLongitude(segment[0][0]);
    const latitudes = segment.map((coordinate) => coordinate[1]);
    const segmentMinimum = Math.min(...latitudes);
    const segmentMaximum = Math.max(...latitudes);
    const minimumLatitude = Math.max(segmentMinimum, line.validLatitudeRange?.[0] ?? segmentMinimum);
    const maximumLatitude = Math.min(segmentMaximum, line.validLatitudeRange?.[1] ?? segmentMaximum);
    if (minimumLatitude > maximumLatitude) continue;
    const latitude = Math.max(minimumLatitude, Math.min(maximumLatitude, location[1]));
    const distanceKm = haversineKm(location, [longitude, latitude]);
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = {
        distanceKm,
        nearestLatitude: latitude,
        nearestLongitude: longitude,
        lineId: line.lineId,
        geometryType: "constant-longitude-meridian",
        distanceMethod: "ANALYTIC_MERIDIAN_GEODESIC",
        calculationStatus: "calculated",
      };
    }
  }
  return nearest;
}

function nearestOnLine(location: GeoCoordinate, line: AstrocartographyLine): AstrocartographyNearestLine | null {
  const meridian = nearestPointOnMeridian(location, line);
  if (meridian) {
    return {
      lineId: line.lineId,
      body: line.body,
      angleType: line.angleType,
      approximateDistanceKm: Math.round(meridian.distanceKm),
      nearestCoordinate: [meridian.nearestLongitude, meridian.nearestLatitude],
    };
  }
  let nearest: GeoCoordinate | null = null;
  let distance = Number.POSITIVE_INFINITY;
  for (const segment of line.coordinates) {
    for (let index = 0; index < segment.length - 1; index++) {
      const start = segment[index]; const end = segment[index + 1];
      for (let step = 0; step <= 16; step++) {
        const fraction = step / 16;
        const longitudeDelta = normalizeMapLongitude(end[0] - start[0]);
        const candidate: GeoCoordinate = [normalizeMapLongitude(start[0] + longitudeDelta * fraction), start[1] + (end[1] - start[1]) * fraction];
        const nextDistance = haversineKm(location, candidate);
        if (nextDistance < distance) { distance = nextDistance; nearest = candidate; }
      }
    }
  }
  return nearest ? { lineId: line.lineId, body: line.body, angleType: line.angleType, approximateDistanceKm: Math.round(distance), nearestCoordinate: nearest } : null;
}

export function analyzeAstrocartographyLocation(lines: AstrocartographyLine[], latitude: number, longitude: number): AstrocartographyLocationAnalysis | null {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null;
  const nearestLines = lines.map((line) => nearestOnLine([longitude, latitude], line)).filter((item): item is AstrocartographyNearestLine => Boolean(item)).sort((a, b) => a.approximateDistanceKm - b.approximateDistanceKm).slice(0, 5);
  return { latitude, longitude, nearestLines, distanceMethod: "spherical-haversine-densified-polyline", orbPolicy: "nearest-line-ranking-only" };
}

function unavailable(): AstrocartographyResult {
  return {
    systemName: "Astrocartography", birthDataStatus: "unavailable",
    accuracyNotice: "Astrocartography memerlukan tanggal, waktu, zona waktu, serta koordinat kelahiran yang tepat. Selisih waktu kelahiran dapat menggeser lokasi garis, sehingga Bhumi tidak menggunakan waktu perkiraan atau lokasi perangkat.",
    calculationMethod: "GAST + equatorial-of-date angularity", utcInstant: null, julianDate: null, greenwichApparentSiderealTimeHours: null,
    samplingLatitudeStep: LATITUDE_STEP, bodies: [], lines: [], crossings: [], nearestLines: [], locationAnalysis: null,
    mapBounds: { west: -180, south: -90, east: 180, north: 90 }, sourceVersion: "astrocartography-r8a-1", sourceClassification: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION",
  };
}

export function calculateAstrocartography(input: NatalBasicsInput, storedNatal?: StoredNatal | null): AstrocartographyResult {
  if (!completeInput(input)) return unavailable();
  const instant = birthDateTimeToUtcDate(input.birthDate!, input.birthTime!, input.timezone!, input.longitude);
  if (Number.isNaN(instant.getTime())) return unavailable();
  const natal = canonicalNatal(input, storedNatal);
  const bodies = ASTROCARTOGRAPHY_BODIES.map((body): AstrocartographyBody | null => {
    const canonical = natal.planets?.[body];
    if (!canonical || !Number.isFinite(canonical.longitude)) return null;
    const equatorial = equatorialOfDate(BODY_ENUM[body], instant);
    return { body, eclipticLongitude: canonical.longitude, ...equatorial, retrograde: canonical.retrograde === true, canonicalStatus: "canonical-tropical" };
  }).filter((body): body is AstrocartographyBody => Boolean(body));
  const gast = Astronomy.SiderealTime(instant);
  const lines = bodies.flatMap((body) => ASTROCARTOGRAPHY_ANGLES.map((angle) => lineFor(body, angle, gast * 15))).filter((line) => line.coordinates.length > 0);
  return {
    systemName: "Astrocartography", birthDataStatus: lines.length ? "available" : "unavailable",
    accuracyNotice: "Garis dihitung dari waktu dan tempat kelahiran yang tersimpan. Selisih kecil pada waktu lahir dapat menggeser lokasi garis, jadi gunakan data yang paling tepat dan perlakukan peta ini sebagai satu lapisan refleksi.",
    calculationMethod: "GAST + equatorial-of-date angularity", utcInstant: instant.toISOString(), julianDate: Number((Astronomy.MakeTime(instant).ut + 2451545).toFixed(6)),
    greenwichApparentSiderealTimeHours: Number(gast.toFixed(8)), samplingLatitudeStep: LATITUDE_STEP, bodies, lines, crossings: [], nearestLines: [], locationAnalysis: null,
    mapBounds: { west: -180, south: -90, east: 180, north: 90 }, sourceVersion: "astrocartography-r8a-1", sourceClassification: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION",
  };
}
