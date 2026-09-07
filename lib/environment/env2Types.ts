import type { EnvironmentSourceMeta } from "./types";

export type AirQualityStandard = "us_aqi" | "european_aqi";
export type EnvironmentalFreshness = "fresh" | "stale" | "expired" | "unknown";
export type EnvironmentalQuality = "measured" | "modelled" | "forecast" | "reanalysis" | "unknown";
export type AttributionConfidence = "supported" | "weak" | "insufficient" | "unknown";

export interface EnvironmentalDatumProvenance {
  source: string;
  provider: string;
  dataset: string;
  measurementOrModel: EnvironmentalQuality;
  observedAt: string;
  fetchedAt: string;
  freshness: EnvironmentalFreshness;
  licensing: string;
  attributionText: string;
}

export interface SurfaceAirQualityDomain {
  aqi?: number;
  aqiStandard: AirQualityStandard;
  label?: string;
  pm25UgM3?: number;
  pm10UgM3?: number;
  no2UgM3?: number;
  o3UgM3?: number;
  coUgM3?: number;
  surfaceSo2UgM3?: number;
  healthRecommendation?: string;
  provenance: EnvironmentalDatumProvenance;
}

export interface AtmosphericColumnDomain {
  totalColumnSo2UgM2?: number;
  totalColumnSo2DobsonUnits?: number;
  scientificUnit: "ug/m2" | "DU";
  anomalyDetected: boolean | null;
  provenance: EnvironmentalDatumProvenance;
}

export interface WindDomain {
  speedKph?: number;
  directionDegrees?: number;
  directionCardinal?: string;
  movementRelativeToUserLocation?: string;
  elevationMeters: number;
  provenance: EnvironmentalDatumProvenance;
}

export interface VolcanicSourceReference {
  id: string;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  distanceKm: number;
  bearingDegrees: number;
  directionCardinal: string;
  primaryVolcanoType?: string;
}

export interface VolcanicDomain {
  plumeDetected: boolean | null;
  probableVolcanicOrigin: boolean | null;
  probableSource: VolcanicSourceReference | null;
  attributionConfidence: AttributionConfidence;
  attributionRationale: string;
  evidenceRefs: string[];
  nearbyKnownVolcanoes: VolcanicSourceReference[];
  provenance: EnvironmentalDatumProvenance;
}

export interface EnvironmentalConditionPayload {
  version: "env2-v1";
  coordinates: {
    latitude: number;
    longitude: number;
  };
  airQuality: SurfaceAirQualityDomain;
  atmosphere: AtmosphericColumnDomain;
  wind: WindDomain;
  volcanic: VolcanicDomain;
  fetchedAt: string;
  updatedAt: string;
  overallFreshness: EnvironmentalFreshness;
  failClosed: boolean;
}
