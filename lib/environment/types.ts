// Canonical Environment Context contract (D-V5-34). The production service
// imports this contract; provider.ts remains a legacy compatibility stub.
export type EnvironmentDataSource =
  | "device_gps"
  | "weather_api"
  | "air_quality_api"
  | "astronomy_api"
  | "bmkg"
  | "usgs"
  | "noaa_space_weather"
  | "schumann_resonance_live";

export type EnvironmentSourceStatus = "available" | "unavailable" | "permission_denied" | "not_configured" | "error";

export interface EnvironmentSourceMeta {
  source: EnvironmentDataSource;
  status: EnvironmentSourceStatus;
  observedAt: string;
  message?: string;
}

export interface EnvironmentCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface EnvironmentLocation {
  coordinates: EnvironmentCoordinates;
  country?: string;
  province?: string;
  cityOrRegency?: string;
  locality?: string;
  district?: string;
  timezone?: string;
  elevationMeters?: number;
  formattedCoordinates?: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentWeather {
  condition?: string;
  temperatureCelsius?: number;
  feelsLikeCelsius?: number;
  humidityPercent?: number;
  pressureHpa?: number;
  windSpeedKph?: number;
  windDirection?: string;
  visibilityKm?: number;
  cloudCoverPercent?: number;
  rainProbabilityPercent?: number;
  precipitationMm?: number;
  uvCurrent?: number;
  uvMaxToday?: number;
  uvLabel?: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentAirQuality {
  aqi?: number;
  label?: string;
  pm25?: number;
  pm10?: number;
  ozone?: number;
  no2?: number;
  so2?: number;
  co?: number;
  uvIndex?: number;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentAstronomy {
  sunrise?: string;
  sunset?: string;
  solarNoon?: string;
  dayLength?: string;
  goldenHour?: string;
  blueHour?: string;
  sunSign?: string;
  subtitle?: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentMoon {
  phase?: string;
  illuminationPercent?: number;
  moonAgeDays?: number;
  moonrise?: string;
  moonset?: string;
  subtitle?: string;
  source: EnvironmentSourceMeta;
}

export type EarthActivityDataState = "available" | "unavailable" | "stale";

export interface EnvironmentEarthActivity {
  /** Only meaningful when dataState is available; never infer stability from an outage. */
  status: string;
  dataState: EarthActivityDataState;
  latestEarthquake?: {
    title?: string;
    magnitude?: number;
    depthKm?: number;
    distanceKm?: number;
    occurredAt?: string;
    place?: string;
    time?: string;
  };
  eventCount?: number;
  fallbackCopy?: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentSpaceWeather {
  kpIndex?: number;
  geomagneticActivity?: string;
  solarWind?: string;
  solarFlare?: string;
  source: EnvironmentSourceMeta;
}

export type SchumannProvenance = "modelled-series" | "measured" | "unknown";

export interface SchumannFrequencyPoint {
  id: "SR1" | "SR2" | "SR3" | "SR4" | "SR5";
  valueHz?: number;
  nominalHz?: number;
}

export interface SchumannObservation {
  t: number;
  f: Array<number | null>;
  a?: number;
  p?: number;
  s?: string;
}

export interface EnvironmentSchumann {
  statusKey?: string;
  statusLabel?: string;
  intensity?: number;
  amplitudePicoTesla?: number;
  powerGwKm2?: number;
  frequencies: SchumannFrequencyPoint[];
  updatedAtIso?: string;
  provenance: SchumannProvenance;
  accumulatedHours?: number;
  observationCount?: number;
  stale: boolean;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentCircadian {
  status: string;
  label: string;
  basedOn: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentContext {
  dateKey: string;
  fetchedAt: string;
  location: EnvironmentLocation;
  weather?: EnvironmentWeather;
  airQuality?: EnvironmentAirQuality;
  astronomy?: EnvironmentAstronomy;
  moon?: EnvironmentMoon;
  earthActivity?: EnvironmentEarthActivity;
  spaceWeather?: EnvironmentSpaceWeather;
  schumann?: EnvironmentSchumann;
  circadian?: EnvironmentCircadian;
}

export interface EnvironmentContextRequest {
  dateKey: string;
  location: EnvironmentLocation;
}

export interface EnvironmentProvider {
  getEnvironmentContext(request: EnvironmentContextRequest): Promise<EnvironmentContext>;
}
