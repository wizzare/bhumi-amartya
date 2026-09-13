import { KNOWN_ACTIVE_VOLCANOES, type KnownVolcano } from "./knownVolcanoes";
import type {
  VolcanicDomain,
  VolcanicSourceReference,
  AttributionConfidence,
  EnvironmentalDatumProvenance,
} from "./env2Types";

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function initialBearingDegrees(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return (theta * 180 / Math.PI + 360) % 360;
}

export function degreesToCardinal(degrees: number): string {
  const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return cardinals[index];
}

export function findNearbyVolcanoes(
  userLat: number,
  userLon: number,
  maxRadiusKm = 200
): VolcanicSourceReference[] {
  const list: VolcanicSourceReference[] = [];

  for (const v of KNOWN_ACTIVE_VOLCANOES) {
    const distanceKm = Math.round(haversineDistanceKm(userLat, userLon, v.latitude, v.longitude) * 10) / 10;
    if (distanceKm <= maxRadiusKm) {
      const bearingDegrees = Math.round(initialBearingDegrees(userLat, userLon, v.latitude, v.longitude));
      list.push({
        id: v.id,
        name: v.name,
        country: v.country,
        region: v.region,
        latitude: v.latitude,
        longitude: v.longitude,
        elevationMeters: v.elevationMeters,
        distanceKm,
        bearingDegrees,
        directionCardinal: degreesToCardinal(bearingDegrees),
        primaryVolcanoType: v.primaryVolcanoType,
      });
    }
  }

  list.sort((a, b) => a.distanceKm - b.distanceKm);
  return list;
}

export function evaluateVolcanicContext(params: {
  userLat: number;
  userLon: number;
  totalColumnSo2UgM2?: number;
  surfaceSo2UgM3?: number;
  windSpeedKph?: number;
  windDirectionDegrees?: number;
  observedAt: string;
}): VolcanicDomain {
  const { userLat, userLon, totalColumnSo2UgM2, windSpeedKph, windDirectionDegrees, observedAt } = params;

  const nearby = findNearbyVolcanoes(userLat, userLon, 250);

  const COLUMN_SO2_ANOMALY_THRESHOLD_UG_M2 = 25000; // ~0.88 Dobson Units (moderate column elevation)
  const isColumnElevated = typeof totalColumnSo2UgM2 === "number" && totalColumnSo2UgM2 >= COLUMN_SO2_ANOMALY_THRESHOLD_UG_M2;

  const provenance: EnvironmentalDatumProvenance = {
    source: "smithsonian_gvp_and_cams",
    provider: "Smithsonian Global Volcanism Program & Copernicus ECMWF",
    dataset: "Volcano Directory v1 & CAMS Atmospheric Composition",
    measurementOrModel: "modelled",
    observedAt,
    fetchedAt: new Date().toISOString(),
    freshness: "fresh",
    licensing: "Public Domain / CC BY 4.0",
    attributionText: "Smithsonian Institution Global Volcanism Program & Copernicus ECMWF CAMS",
  };

  // Build 110: Volcanic feature completely removed from runtime and UI
  return {
    plumeDetected: null,
    probableVolcanicOrigin: null,
    probableSource: null,
    attributionConfidence: "unknown",
    attributionRationale: "Konteks vulkanik dinonaktifkan.",
    evidenceRefs: [],
    nearbyKnownVolcanoes: [],
    provenance,
  };
}
