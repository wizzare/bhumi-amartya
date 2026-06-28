export type EnvironmentDataSource =
  | "device_gps"
  | "weather_api"
  | "air_quality_api"
  | "astronomy_api"
  | "bmkg"
  | "usgs"
  | "noaa_space_weather";

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
  district?: string;
  timezone?: string;
  elevationMeters?: number;
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
  source: EnvironmentSourceMeta;
}

export interface EnvironmentAirQuality {
  aqi?: number;
  pm25?: number;
  pm10?: number;
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
  source: EnvironmentSourceMeta;
}

export interface EnvironmentMoon {
  phase?: string;
  illuminationPercent?: number;
  moonAgeDays?: number;
  moonrise?: string;
  moonset?: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentEarthActivity {
  latestEarthquake?: {
    title?: string;
    magnitude?: number;
    depthKm?: number;
    distanceKm?: number;
    occurredAt?: string;
  };
  volcanoStatus?: string;
  tsunamiWarning?: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentSpaceWeather {
  kpIndex?: number;
  geomagneticActivity?: string;
  solarWind?: string;
  solarFlare?: string;
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
}

export interface EnvironmentContextRequest {
  dateKey: string;
  location: EnvironmentLocation;
}

export interface EnvironmentProvider {
  getEnvironmentContext(request: EnvironmentContextRequest): Promise<EnvironmentContext>;
}
