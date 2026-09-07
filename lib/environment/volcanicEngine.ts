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

  if (nearby.length === 0) {
    return {
      plumeDetected: null,
      probableVolcanicOrigin: null,
      probableSource: null,
      attributionConfidence: "unknown",
      attributionRationale: "No known active volcanoes located within 250 km radius of current coordinates.",
      evidenceRefs: ["gvp_proximity_scan_null"],
      nearbyKnownVolcanoes: [],
      provenance,
    };
  }

  // If atmospheric column SO2 is not elevated, there is no evidence of a volcanic plume
  if (!isColumnElevated) {
    return {
      plumeDetected: false,
      probableVolcanicOrigin: null,
      probableSource: null,
      attributionConfidence: "insufficient",
      attributionRationale: `Atmospheric total-column SO2 (${totalColumnSo2UgM2 ?? "unavailable"} μg/m²) does not show an anomaly above regional baseline.`,
      evidenceRefs: ["cams_column_so2_nominal"],
      nearbyKnownVolcanoes: nearby,
      provenance,
    };
  }

  // SO2 is elevated, now check if wind trajectory matches any nearby volcano
  let bestCandidate: VolcanicSourceReference | null = null;
  let candidateConfidence: AttributionConfidence = "insufficient";
  let rationale = "";

  if (typeof windDirectionDegrees === "number") {
    for (const v of nearby) {
      // Bearing from volcano to user
      const volcanoToUserBearing = initialBearingDegrees(v.latitude, v.longitude, userLat, userLon);
      // Wind direction is the direction wind blows FROM.
      // Plume travels TOWARDS (windDirectionDegrees + 180) % 360.
      const plumeTrajectoryDegrees = (windDirectionDegrees + 180) % 360;

      const angleDifference = Math.abs((plumeTrajectoryDegrees - volcanoToUserBearing + 180) % 360 - 180);

      // If plume trajectory from volcano is aligned within 35 degrees towards user
      if (angleDifference <= 35 && v.distanceKm <= 150) {
        bestCandidate = v;
        candidateConfidence = "supported";
        rationale = `Elevated atmospheric SO2 column (${totalColumnSo2UgM2} μg/m²) correlates with transport trajectory from ${v.name} (${v.distanceKm} km ${degreesToCardinal(initialBearingDegrees(userLat, userLon, v.latitude, v.longitude))}) under prevailing wind direction (${Math.round(windDirectionDegrees)}°).`;
        break;
      } else if (angleDifference <= 55 && v.distanceKm <= 75) {
        bestCandidate = v;
        candidateConfidence = "weak";
        rationale = `Elevated atmospheric SO2 column observed in close proximity (${v.distanceKm} km) to ${v.name}, though wind vector alignment is loose (Δ${Math.round(angleDifference)}°).`;
        break;
      }
    }
  }

  if (bestCandidate && candidateConfidence === "supported") {
    return {
      plumeDetected: true,
      probableVolcanicOrigin: true,
      probableSource: bestCandidate,
      attributionConfidence: "supported",
      attributionRationale: rationale,
      evidenceRefs: [
        `cams_so2_column_elevated:${totalColumnSo2UgM2}`,
        `gvp_volcano:${bestCandidate.id}`,
        `wind_trajectory_aligned:${Math.round(windDirectionDegrees || 0)}`,
      ],
      nearbyKnownVolcanoes: nearby,
      provenance,
    };
  }

  if (bestCandidate && candidateConfidence === "weak") {
    return {
      plumeDetected: true,
      probableVolcanicOrigin: null,
      probableSource: bestCandidate,
      attributionConfidence: "weak",
      attributionRationale: rationale,
      evidenceRefs: [
        `cams_so2_column_elevated:${totalColumnSo2UgM2}`,
        `gvp_volcano_proximity:${bestCandidate.id}`,
      ],
      nearbyKnownVolcanoes: nearby,
      provenance,
    };
  }

  // SO2 elevated without trajectory support: DO NOT attribute to a volcano.
  return {
    plumeDetected: null,
    probableVolcanicOrigin: null,
    probableSource: null,
    attributionConfidence: "insufficient",
    attributionRationale: `Atmospheric column SO2 is elevated (${totalColumnSo2UgM2} μg/m²), but wind trajectory does not support transport from nearby known volcanoes (${nearby.map(n => n.name).slice(0, 3).join(", ")}). Origin remains unverified.`,
    evidenceRefs: ["cams_so2_elevated_unattributed"],
    nearbyKnownVolcanoes: nearby,
    provenance,
  };
}
