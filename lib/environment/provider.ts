import type {
  EnvironmentAirQuality,
  EnvironmentAstronomy,
  EnvironmentContext,
  EnvironmentContextRequest,
  EnvironmentEarthActivity,
  EnvironmentMoon,
  EnvironmentProvider,
  EnvironmentSourceMeta,
  EnvironmentSpaceWeather,
  EnvironmentWeather,
} from "@/lib/environment/types";

function notConfigured(source: EnvironmentSourceMeta["source"]): EnvironmentSourceMeta {
  return {
    source,
    status: "not_configured",
    observedAt: new Date().toISOString(),
    message: "Provider belum dikonfigurasi pada Phase 1.",
  };
}

export class EnvironmentContextProvider implements EnvironmentProvider {
  async getEnvironmentContext(request: EnvironmentContextRequest): Promise<EnvironmentContext> {
    return {
      dateKey: request.dateKey,
      fetchedAt: new Date().toISOString(),
      location: request.location,
      weather: this.emptyWeather(),
      airQuality: this.emptyAirQuality(),
      astronomy: this.emptyAstronomy(),
      moon: this.emptyMoon(),
      earthActivity: this.emptyEarthActivity(),
      spaceWeather: this.emptySpaceWeather(),
    };
  }

  private emptyWeather(): EnvironmentWeather {
    return { source: notConfigured("weather_api") };
  }

  private emptyAirQuality(): EnvironmentAirQuality {
    return { source: notConfigured("air_quality_api") };
  }

  private emptyAstronomy(): EnvironmentAstronomy {
    return { source: notConfigured("astronomy_api") };
  }

  private emptyMoon(): EnvironmentMoon {
    return { source: notConfigured("astronomy_api") };
  }

  private emptyEarthActivity(): EnvironmentEarthActivity {
    return { source: notConfigured("bmkg") };
  }

  private emptySpaceWeather(): EnvironmentSpaceWeather {
    return { source: notConfigured("noaa_space_weather") };
  }
}

export const environmentContextProvider = new EnvironmentContextProvider();
